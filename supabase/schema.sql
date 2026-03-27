-- OpFlow Database Schema
-- Supabase (PostgreSQL)

-- 1. Clientes
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- 2. Contratos
create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  code text not null unique,
  status text not null default 'active' check (status in ('active', 'inactive', 'completed')),
  start_date date not null,
  end_date date,
  created_at timestamptz default now()
);

-- 3. Projetos
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  created_at timestamptz default now()
);

-- 4. Sprints
create table if not exists sprints (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- 5. Demandas
create table if not exists demands (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz default now()
);

-- 6. Responsáveis
create table if not exists assignees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  created_at timestamptz default now()
);

-- 7. Atividades
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  demand_id uuid references demands(id) on delete set null,
  sprint_id uuid references sprints(id) on delete set null,
  project_id uuid not null references projects(id) on delete cascade,
  contract_id uuid not null references contracts(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'backlog' check (status in ('backlog', 'todo', 'in_progress', 'validation', 'done', 'blocked')),
  priority text not null default 'medium' check (priority in ('critical', 'high', 'medium', 'low')),
  origin text not null default 'manual' check (origin in ('manual', 'daily', 'spreadsheet')),
  due_date date,
  is_overdue boolean default false,
  ai_suggestion_status text check (ai_suggestion_status in ('pending', 'accepted', 'rejected', 'edited')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. Vínculo Atividade <-> Responsáveis (N:N)
create table if not exists activity_assignees (
  activity_id uuid not null references activities(id) on delete cascade,
  assignee_id uuid not null references assignees(id) on delete cascade,
  primary key (activity_id, assignee_id)
);

-- 9. Subtarefas
create table if not exists subtasks (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  title text not null,
  done boolean default false,
  created_at timestamptz default now()
);

-- 10. Comentários
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  user_name text not null,
  content text not null,
  created_at timestamptz default now()
);

-- 11. Histórico
create table if not exists history (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('activity', 'project', 'import', 'demand')),
  entity_id uuid not null,
  action text not null,
  details text,
  user_name text not null,
  created_at timestamptz default now()
);

-- 12. Importações
create table if not exists imports (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('daily_transcription', 'macro_spreadsheet')),
  file_name text not null,
  file_url text,
  status text not null default 'processing' check (status in ('processing', 'review', 'applied', 'cancelled')),
  created_at timestamptz default now()
);

-- 13. Sugestões da IA
create table if not exists ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  import_id uuid not null references imports(id) on delete cascade,
  activity_id uuid references activities(id) on delete set null,
  action text not null check (action in ('create', 'update', 'complete')),
  suggested_title text not null,
  suggested_status text,
  suggested_assignee text,
  suggested_due_date date,
  suggested_client text,
  suggested_contract text,
  suggested_project text,
  confidence numeric(3,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'edited')),
  created_at timestamptz default now()
);

-- 14. Anexos
create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  uploaded_by text,
  created_at timestamptz default now()
);

-- Indexes
create index idx_activities_status on activities(status);
create index idx_activities_client on activities(client_id);
create index idx_activities_project on activities(project_id);
create index idx_activities_sprint on activities(sprint_id);
create index idx_activities_priority on activities(priority);
create index idx_activities_due_date on activities(due_date);
create index idx_activities_overdue on activities(is_overdue) where is_overdue = true;
create index idx_history_entity on history(entity_type, entity_id);
create index idx_history_created on history(created_at desc);
create index idx_contracts_client on contracts(client_id);
create index idx_projects_contract on projects(contract_id);
create index idx_demands_project on demands(project_id);
create index idx_ai_suggestions_import on ai_suggestions(import_id);

-- Function: auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_activities_updated_at
  before update on activities
  for each row execute function update_updated_at();

-- Function: auto-detect overdue activities
create or replace function check_overdue()
returns trigger as $$
begin
  if new.due_date is not null and new.due_date < current_date and new.status not in ('done') then
    new.is_overdue = true;
  else
    new.is_overdue = false;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_activities_overdue
  before insert or update on activities
  for each row execute function check_overdue();

-- Function: auto-log status changes to history
create or replace function log_status_change()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into history (entity_type, entity_id, action, details, user_name)
    values ('activity', new.id, 'status_change',
      'Status alterado: ' || coalesce(old.status, '—') || ' → ' || new.status,
      'Sistema');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_activities_log_status
  after update on activities
  for each row execute function log_status_change();
