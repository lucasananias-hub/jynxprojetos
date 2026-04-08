"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { KANBAN_COLUMNS, PRIORITY_CONFIG } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import type { Activity, ActivityStatus, Priority } from "@/types";

// ---------------------------------------------------------------------------
// Mock data — used as fallback when Supabase is unavailable or returns empty
// ---------------------------------------------------------------------------
const mockActivities: Activity[] = [
  {
    id: "1", demand_id: null, sprint_id: "s1", project_id: "p1", contract_id: "c1", client_id: "cl1",
    title: "Revisar relatório de consumo energético", description: "Validar dados do último trimestre",
    status: "in_progress", priority: "high", origin: "daily", due_date: "2026-03-28",
    assignees: ["Carlos Mendes"], is_overdue: false, ai_suggestion_status: null,
    created_at: "2026-03-20T10:00:00Z", updated_at: "2026-03-25T14:00:00Z",
  },
  {
    id: "2", demand_id: null, sprint_id: "s1", project_id: "p2", contract_id: "c2", client_id: "cl2",
    title: "Atualizar dashboard de indicadores da Vale", description: null,
    status: "todo", priority: "critical", origin: "manual", due_date: "2026-03-27",
    assignees: ["Ana Beatriz"], is_overdue: false, ai_suggestion_status: null,
    created_at: "2026-03-22T09:00:00Z", updated_at: "2026-03-22T09:00:00Z",
  },
  {
    id: "3", demand_id: null, sprint_id: "s1", project_id: "p1", contract_id: "c1", client_id: "cl1",
    title: "Corrigir cálculo de multa contratual", description: "Divergência identificada na daily de 24/03",
    status: "blocked", priority: "critical", origin: "daily", due_date: "2026-03-25",
    assignees: ["Ricardo Lima"], is_overdue: true, ai_suggestion_status: null,
    created_at: "2026-03-24T11:00:00Z", updated_at: "2026-03-25T16:00:00Z",
  },
  {
    id: "4", demand_id: null, sprint_id: "s1", project_id: "p3", contract_id: "c3", client_id: "cl3",
    title: "Preparar documentação de entrega — fase 2", description: null,
    status: "validation", priority: "medium", origin: "spreadsheet", due_date: "2026-03-30",
    assignees: ["Mariana Costa"], is_overdue: false, ai_suggestion_status: null,
    created_at: "2026-03-18T08:00:00Z", updated_at: "2026-03-26T10:00:00Z",
  },
  {
    id: "5", demand_id: null, sprint_id: "s1", project_id: "p2", contract_id: "c2", client_id: "cl2",
    title: "Implementar alerta automático de vencimento", description: null,
    status: "backlog", priority: "low", origin: "manual", due_date: null,
    assignees: [], is_overdue: false, ai_suggestion_status: "pending",
    created_at: "2026-03-26T09:00:00Z", updated_at: "2026-03-26T09:00:00Z",
  },
  {
    id: "6", demand_id: null, sprint_id: "s1", project_id: "p1", contract_id: "c1", client_id: "cl1",
    title: "Enviar prestação de contas Q1", description: null,
    status: "done", priority: "high", origin: "manual", due_date: "2026-03-25",
    assignees: ["Carlos Mendes"], is_overdue: false, ai_suggestion_status: null,
    created_at: "2026-03-10T08:00:00Z", updated_at: "2026-03-25T17:00:00Z",
  },
];

const mockClientNames: Record<string, string> = {
  cl1: "Petrobras",
  cl2: "Vale S.A.",
  cl3: "Banco Central",
};

// ---------------------------------------------------------------------------
// Extended Activity type with resolved client name
// ---------------------------------------------------------------------------
interface ActivityWithClient extends Activity {
  client_name?: string;
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function KanbanPage() {
  const [activities, setActivities] = useState<ActivityWithClient[]>([]);
  const [clientMap, setClientMap] = useState<Record<string, string>>(mockClientNames);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ActivityStatus | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ column: ActivityStatus; index: number } | null>(null);

  // Filters
  const [filterClient, setFilterClient] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Inline new-activity form
  const [addingToColumn, setAddingToColumn] = useState<ActivityStatus | null>(null);

  // Snapshot for optimistic rollback
  const snapshotRef = useRef<ActivityWithClient[]>([]);

  // --------------------------------------------------
  // Fetch activities from Supabase (with client join)
  // --------------------------------------------------
  const fetchActivities = useCallback(async () => {
    try {
      // Fetch activities
      const { data: actData, error: actError } = await supabase
        .from("activities")
        .select("*, clients(name)")
        .order("created_at", { ascending: false });

      if (actError) throw actError;

      if (!actData || actData.length === 0) {
        // Fallback to mock data
        setActivities(mockActivities.map((a) => ({ ...a, client_name: mockClientNames[a.client_id] })));
        setUsingMock(true);
        return;
      }

      // Build client map from joined data & shape activities
      const cMap: Record<string, string> = {};
      const shaped: ActivityWithClient[] = actData.map((row: Record<string, unknown>) => {
        const clientObj = row.clients as { name: string } | null;
        const clientName = clientObj?.name ?? "";
        if (row.client_id && clientName) {
          cMap[row.client_id as string] = clientName;
        }

        return {
          id: row.id as string,
          demand_id: (row.demand_id as string) ?? null,
          sprint_id: (row.sprint_id as string) ?? null,
          project_id: row.project_id as string,
          contract_id: row.contract_id as string,
          client_id: row.client_id as string,
          title: row.title as string,
          description: (row.description as string) ?? null,
          status: row.status as ActivityStatus,
          priority: row.priority as Priority,
          origin: row.origin as Activity["origin"],
          due_date: (row.due_date as string) ?? null,
          assignees: (row.assignees as string[]) ?? [],
          is_overdue: (row.is_overdue as boolean) ?? false,
          ai_suggestion_status: (row.ai_suggestion_status as Activity["ai_suggestion_status"]) ?? null,
          created_at: row.created_at as string,
          updated_at: row.updated_at as string,
          client_name: clientName,
        };
      });

      setClientMap((prev) => ({ ...prev, ...cMap }));
      setActivities(shaped);
      setUsingMock(false);
    } catch (err) {
      console.error("Supabase fetch failed, using mock data:", err);
      setActivities(mockActivities.map((a) => ({ ...a, client_name: mockClientNames[a.client_id] })));
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // Initial load + realtime subscription
  // --------------------------------------------------
  useEffect(() => {
    fetchActivities();

    // Realtime subscription
    const channel = supabase
      .channel("activities-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activities" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRow = payload.new as Record<string, unknown>;
            setActivities((prev) => {
              // Avoid duplicate if we already have it (optimistic add)
              if (prev.some((a) => a.id === newRow.id)) return prev;
              return [
                {
                  ...(newRow as unknown as Activity),
                  client_name: clientMap[(newRow.client_id as string) ?? ""] ?? "",
                },
                ...prev,
              ];
            });
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Record<string, unknown>;
            setActivities((prev) =>
              prev.map((a) =>
                a.id === updated.id
                  ? {
                      ...a,
                      ...(updated as unknown as Partial<Activity>),
                      client_name: clientMap[(updated.client_id as string) ?? ""] ?? a.client_name,
                    }
                  : a,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id: string };
            setActivities((prev) => prev.filter((a) => a.id !== oldRow.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------
  // Drag & Drop handlers
  // --------------------------------------------------
  function handleDragStart(e: React.DragEvent, activityId: string) {
    setDraggedId(activityId);
    e.dataTransfer.effectAllowed = "move";
    // Store ID in dataTransfer for cross-component access
    e.dataTransfer.setData("text/plain", activityId);
    // Make the drag image semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      requestAnimationFrame(() => {
        (e.currentTarget as HTMLElement).style.opacity = "0.5";
      });
    }
  }

  function handleDragEnd(e: React.DragEvent) {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedId(null);
    setDragOverColumn(null);
    setDropIndicator(null);
  }

  function handleDragOver(e: React.DragEvent, columnId: ActivityStatus, cardIndex?: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
    if (cardIndex !== undefined) {
      setDropIndicator({ column: columnId, index: cardIndex });
    }
  }

  function handleDragLeave(e: React.DragEvent, columnId: ActivityStatus) {
    // Only clear if actually leaving the column (not entering a child)
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    const currentTarget = e.currentTarget as HTMLElement;
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      if (dragOverColumn === columnId) {
        setDragOverColumn(null);
        setDropIndicator(null);
      }
    }
  }

  async function handleDrop(targetStatus: ActivityStatus) {
    if (!draggedId) return;

    const activity = activities.find((a) => a.id === draggedId);
    if (!activity || activity.status === targetStatus) {
      setDraggedId(null);
      setDragOverColumn(null);
      setDropIndicator(null);
      return;
    }

    // Save snapshot for rollback
    snapshotRef.current = [...activities];

    // Optimistic update
    const now = new Date().toISOString();
    setActivities((prev) =>
      prev.map((a) =>
        a.id === draggedId ? { ...a, status: targetStatus, updated_at: now } : a,
      ),
    );

    setDraggedId(null);
    setDragOverColumn(null);
    setDropIndicator(null);

    // Persist to Supabase (skip for mock)
    if (!usingMock) {
      const { error: updateError } = await supabase
        .from("activities")
        .update({ status: targetStatus, updated_at: now })
        .eq("id", activity.id);

      if (updateError) {
        console.error("Failed to update status:", updateError);
        // Revert
        setActivities(snapshotRef.current);
        setError(`Falha ao mover atividade: ${updateError.message}`);
        setTimeout(() => setError(null), 4000);
      }
    }
  }

  // --------------------------------------------------
  // Create new activity
  // --------------------------------------------------
  async function handleCreateActivity(
    title: string,
    priority: Priority,
    clientId: string,
    status: ActivityStatus,
  ) {
    const now = new Date().toISOString();
    const tempId = `temp-${Date.now()}`;

    const newActivity: ActivityWithClient = {
      id: tempId,
      demand_id: null,
      sprint_id: null,
      project_id: "",
      contract_id: "",
      client_id: clientId,
      title,
      description: null,
      status,
      priority,
      origin: "manual",
      due_date: null,
      assignees: [],
      is_overdue: false,
      ai_suggestion_status: null,
      created_at: now,
      updated_at: now,
      client_name: clientMap[clientId] ?? "",
    };

    // Optimistic add
    setActivities((prev) => [newActivity, ...prev]);
    setAddingToColumn(null);

    if (!usingMock) {
      const { data, error: insertError } = await supabase
        .from("activities")
        .insert({
          title,
          priority,
          client_id: clientId,
          status,
          origin: "manual",
        })
        .select()
        .single();

      if (insertError) {
        console.error("Failed to create activity:", insertError);
        setActivities((prev) => prev.filter((a) => a.id !== tempId));
        setError(`Falha ao criar atividade: ${insertError.message}`);
        setTimeout(() => setError(null), 4000);
      } else if (data) {
        // Replace temp with real record
        setActivities((prev) =>
          prev.map((a) =>
            a.id === tempId
              ? { ...a, ...data, client_name: clientMap[data.client_id] ?? "" }
              : a,
          ),
        );
      }
    }
  }

  // --------------------------------------------------
  // Filtered activities
  // --------------------------------------------------
  const filteredActivities = activities.filter((a) => {
    if (filterClient && a.client_id !== filterClient) return false;
    if (filterPriority && a.priority !== filterPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!a.title.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Unique clients for filter dropdown
  const uniqueClients = Array.from(
    new Map(
      activities.map((a) => [a.client_id, { id: a.client_id, name: a.client_name || clientMap[a.client_id] || a.client_id }]),
    ).values(),
  );

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Carregando atividades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Error toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Kanban da Sprint</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Sprint 12 — 17/03 a 31/03
            {usingMock && (
              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                Dados de demonstração
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Client filter */}
          <select
            className="border rounded-lg px-3 py-2 text-sm bg-white"
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
          >
            <option value="">Todos os clientes</option>
            {uniqueClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            className="border rounded-lg px-3 py-2 text-sm bg-white"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">Todas as prioridades</option>
            {(Object.entries(PRIORITY_CONFIG) as [Priority, { label: string; color: string }][]).map(
              ([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ),
            )}
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Buscar por título..."
            className="border rounded-lg px-3 py-2 text-sm w-52 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Kanban board */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => {
          const colActivities = filteredActivities.filter((a) => a.status === col.id);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              className={`flex-shrink-0 w-72 rounded-xl p-3 flex flex-col transition-colors duration-200 ${
                isOver
                  ? "bg-blue-50 border-2 border-blue-400 border-dashed"
                  : "bg-gray-50 border-2 border-transparent"
              }`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(col.id);
              }}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{col.label}</h3>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {colActivities.length}
                  </span>
                </div>
                <button
                  onClick={() => setAddingToColumn(addingToColumn === col.id ? null : col.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors text-lg leading-none"
                  title="Nova atividade"
                >
                  +
                </button>
              </div>

              {/* Inline create form */}
              {addingToColumn === col.id && (
                <InlineCreateForm
                  status={col.id}
                  clients={uniqueClients}
                  onSave={handleCreateActivity}
                  onCancel={() => setAddingToColumn(null)}
                />
              )}

              {/* Cards */}
              <div className="flex-1 space-y-2 overflow-y-auto min-h-[40px]">
                {colActivities.map((activity, idx) => (
                  <div key={activity.id}>
                    {/* Drop indicator line */}
                    {dropIndicator?.column === col.id && dropIndicator.index === idx && draggedId !== activity.id && (
                      <div className="h-0.5 bg-blue-500 rounded-full mb-1 mx-1 transition-all" />
                    )}
                    <KanbanCard
                      activity={activity}
                      clientName={activity.client_name || clientMap[activity.client_id] || "—"}
                      isDragging={draggedId === activity.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, col.id, idx)}
                    />
                  </div>
                ))}
                {/* Drop indicator at end of column */}
                {dropIndicator?.column === col.id &&
                  dropIndicator.index === colActivities.length &&
                  colActivities.length > 0 && (
                    <div className="h-0.5 bg-blue-500 rounded-full mx-1 transition-all" />
                  )}
                {/* Empty column placeholder */}
                {colActivities.length === 0 && (
                  <div
                    className={`flex items-center justify-center h-20 rounded-lg border-2 border-dashed transition-colors ${
                      isOver ? "border-blue-400 text-blue-500" : "border-gray-200 text-gray-300"
                    }`}
                  >
                    <span className="text-xs">
                      {isOver ? "Soltar aqui" : "Sem atividades"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KanbanCard component
// ---------------------------------------------------------------------------
function KanbanCard({
  activity,
  clientName,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragOver,
}: {
  activity: ActivityWithClient;
  clientName: string;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
}) {
  const priorityCfg = PRIORITY_CONFIG[activity.priority];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, activity.id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      className={`bg-white rounded-lg border p-3 cursor-grab active:cursor-grabbing transition-all duration-200 ${
        isDragging ? "opacity-50 scale-95 shadow-lg ring-2 ring-blue-300" : "hover:shadow-md"
      } ${activity.is_overdue ? "border-red-400 ring-1 ring-red-200" : "border-[var(--border)]"} ${
        activity.status === "blocked" ? "border-purple-400 ring-1 ring-purple-200" : ""
      }`}
    >
      <a href={`/kanban/${activity.id}`} className="block" onClick={(e) => isDragging && e.preventDefault()}>
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium leading-tight">{activity.title}</h4>
          {activity.ai_suggestion_status === "pending" && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded shrink-0">IA</span>
          )}
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1">{clientName}</p>
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs px-2 py-0.5 rounded ${priorityCfg.color}`}>{priorityCfg.label}</span>
          <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            {activity.is_overdue && <span className="text-red-600 font-medium">Atrasado</span>}
            {activity.due_date && !activity.is_overdue && (
              <span>{new Date(activity.due_date).toLocaleDateString("pt-BR")}</span>
            )}
          </div>
        </div>
        {activity.assignees.length > 0 && (
          <p className="text-xs text-[var(--text-secondary)] mt-2">{activity.assignees.join(", ")}</p>
        )}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[10px] text-gray-400 uppercase">{activity.origin}</span>
        </div>
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// InlineCreateForm — appears inside a column to add a new activity
// ---------------------------------------------------------------------------
function InlineCreateForm({
  status,
  clients,
  onSave,
  onCancel,
}: {
  status: ActivityStatus;
  clients: { id: string; name: string }[];
  onSave: (title: string, priority: Priority, clientId: string, status: ActivityStatus) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), priority, clientId, status);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-blue-300 p-3 mb-2 space-y-2 shadow-sm"
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Título da atividade"
        className="w-full text-sm border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
      />
      <div className="flex gap-2">
        <select
          className="flex-1 text-xs border rounded px-2 py-1 bg-white"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
        >
          {(Object.entries(PRIORITY_CONFIG) as [Priority, { label: string }][]).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
        </select>
        <select
          className="flex-1 text-xs border rounded px-2 py-1 bg-white"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs px-3 py-1 rounded text-gray-500 hover:bg-gray-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Criar
        </button>
      </div>
    </form>
  );
}
