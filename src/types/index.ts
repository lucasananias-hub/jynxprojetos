export type Priority = "critical" | "high" | "medium" | "low";
export type ActivityStatus = "backlog" | "todo" | "in_progress" | "validation" | "done" | "blocked";
export type ActivityOrigin = "manual" | "daily" | "spreadsheet";
export type AISuggestionStatus = "pending" | "accepted" | "rejected" | "edited";

export interface Client {
  id: string;
  name: string;
  created_at: string;
}

export interface Contract {
  id: string;
  client_id: string;
  name: string;
  code: string;
  status: "active" | "inactive" | "completed";
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  contract_id: string;
  client_id: string;
  name: string;
  status: "active" | "paused" | "completed";
  created_at: string;
}

export interface Sprint {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface Demand {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: "open" | "in_progress" | "resolved";
  created_at: string;
}

export interface Activity {
  id: string;
  demand_id: string | null;
  sprint_id: string | null;
  project_id: string;
  contract_id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: ActivityStatus;
  priority: Priority;
  origin: ActivityOrigin;
  due_date: string | null;
  assignees: string[];
  is_overdue: boolean;
  ai_suggestion_status: AISuggestionStatus | null;
  created_at: string;
  updated_at: string;
}

export interface HistoryEntry {
  id: string;
  entity_type: "activity" | "project" | "import";
  entity_id: string;
  action: string;
  details: string;
  user_name: string;
  created_at: string;
}

export interface ImportRecord {
  id: string;
  type: "daily_transcription" | "macro_spreadsheet";
  file_name: string;
  status: "processing" | "review" | "applied" | "cancelled";
  created_at: string;
}

export interface AISuggestion {
  id: string;
  import_id: string;
  activity_id: string | null;
  action: "create" | "update" | "complete";
  suggested_title: string;
  suggested_status: ActivityStatus | null;
  suggested_assignee: string | null;
  suggested_due_date: string | null;
  suggested_client: string | null;
  suggested_contract: string | null;
  suggested_project: string | null;
  confidence: number;
  status: AISuggestionStatus;
  created_at: string;
}

export interface KanbanColumn {
  id: ActivityStatus;
  label: string;
  activities: Activity[];
}
