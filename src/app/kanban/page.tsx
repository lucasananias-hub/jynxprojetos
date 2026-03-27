"use client";

import { useState } from "react";
import { KANBAN_COLUMNS, PRIORITY_CONFIG } from "@/lib/constants";
import type { Activity, ActivityStatus } from "@/types";

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

const clientNames: Record<string, string> = { cl1: "Petrobras", cl2: "Vale S.A.", cl3: "Banco Central" };

export default function KanbanPage() {
  const [activities, setActivities] = useState(mockActivities);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  function handleDragStart(id: string) {
    setDraggedId(id);
  }

  function handleDrop(targetStatus: ActivityStatus) {
    if (!draggedId) return;
    setActivities((prev) =>
      prev.map((a) => (a.id === draggedId ? { ...a, status: targetStatus, updated_at: new Date().toISOString() } : a))
    );
    setDraggedId(null);
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Kanban da Sprint</h1>
          <p className="text-sm text-[var(--text-secondary)]">Sprint 12 — 17/03 a 31/03</p>
        </div>
        <div className="flex gap-2">
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>Todos os clientes</option>
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>Todos os responsáveis</option>
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>Todas as prioridades</option>
          </select>
          <input type="text" placeholder="Buscar..." className="border rounded-lg px-3 py-2 text-sm w-48" />
        </div>
      </header>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => {
          const colActivities = activities.filter((a) => a.status === col.id);
          return (
            <div
              key={col.id}
              className="flex-shrink-0 w-72 bg-gray-50 rounded-xl p-3 flex flex-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{col.label}</h3>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {colActivities.length}
                </span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto">
                {colActivities.map((activity) => (
                  <KanbanCard key={activity.id} activity={activity} onDragStart={handleDragStart} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({
  activity,
  onDragStart,
}: {
  activity: Activity;
  onDragStart: (id: string) => void;
}) {
  const priorityCfg = PRIORITY_CONFIG[activity.priority];

  return (
    <a
      href={`/kanban/${activity.id}`}
      draggable
      onDragStart={() => onDragStart(activity.id)}
      className={`block bg-white rounded-lg border p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        activity.is_overdue ? "border-red-400 ring-1 ring-red-200" : "border-[var(--border)]"
      } ${activity.status === "blocked" ? "border-purple-400 ring-1 ring-purple-200" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-tight">{activity.title}</h4>
        {activity.ai_suggestion_status === "pending" && (
          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded shrink-0">IA</span>
        )}
      </div>
      <p className="text-xs text-[var(--text-secondary)] mt-1">{clientNames[activity.client_id] ?? "—"}</p>
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
  );
}
