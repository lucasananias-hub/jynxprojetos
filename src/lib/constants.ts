import type { ActivityStatus, Priority } from "@/types";

export const KANBAN_COLUMNS: { id: ActivityStatus; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "A Fazer" },
  { id: "in_progress", label: "Em Andamento" },
  { id: "validation", label: "Em Validação" },
  { id: "done", label: "Concluído" },
  { id: "blocked", label: "Bloqueado" },
];

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  critical: { label: "Crítica", color: "bg-red-600 text-white" },
  high: { label: "Alta", color: "bg-orange-500 text-white" },
  medium: { label: "Média", color: "bg-yellow-400 text-black" },
  low: { label: "Baixa", color: "bg-gray-300 text-black" },
};

export const STATUS_CONFIG: Record<ActivityStatus, { label: string; color: string }> = {
  backlog: { label: "Backlog", color: "bg-gray-100 text-gray-700" },
  todo: { label: "A Fazer", color: "bg-blue-100 text-blue-700" },
  in_progress: { label: "Em Andamento", color: "bg-indigo-100 text-indigo-700" },
  validation: { label: "Em Validação", color: "bg-purple-100 text-purple-700" },
  done: { label: "Concluído", color: "bg-green-100 text-green-700" },
  blocked: { label: "Bloqueado", color: "bg-red-100 text-red-700" },
};
