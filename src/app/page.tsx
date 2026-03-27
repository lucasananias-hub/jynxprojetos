"use client";

import { PRIORITY_CONFIG, STATUS_CONFIG } from "@/lib/constants";

const mockStats = {
  clients: 8,
  activeContracts: 12,
  activeProjects: 15,
  openDemands: 34,
  overdue: 5,
  completedThisSprint: 22,
};

const riskAlerts = [
  { type: "overdue" as const, message: "5 atividades atrasadas", detail: "2 críticas, 3 alta prioridade" },
  { type: "blocked" as const, message: "3 atividades bloqueadas", detail: "Aguardando aprovação do cliente" },
  { type: "bottleneck" as const, message: "Gargalo em validação", detail: "12 cards aguardando revisão" },
];

const byStatus = [
  { status: "backlog", count: 8 },
  { status: "todo", count: 10 },
  { status: "in_progress", count: 14 },
  { status: "validation", count: 12 },
  { status: "done", count: 22 },
  { status: "blocked", count: 3 },
];

const byClient = [
  { name: "Petrobras", active: 12, overdue: 2 },
  { name: "Vale S.A.", active: 9, overdue: 1 },
  { name: "Banco Central", active: 8, overdue: 0 },
  { name: "ANEEL", active: 5, overdue: 2 },
];

const byAssignee = [
  { name: "Carlos Mendes", active: 8, done: 6 },
  { name: "Ana Beatriz", active: 6, done: 9 },
  { name: "Ricardo Lima", active: 10, done: 4 },
  { name: "Mariana Costa", active: 5, done: 3 },
];

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)]">Visão consolidada da operação</p>
        </div>
        <div className="flex gap-2">
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>Todos os clientes</option>
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>Todos os contratos</option>
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>Sprint atual</option>
          </select>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-4">
        <StatCard label="Clientes" value={mockStats.clients} />
        <StatCard label="Contratos ativos" value={mockStats.activeContracts} />
        <StatCard label="Projetos" value={mockStats.activeProjects} />
        <StatCard label="Demandas abertas" value={mockStats.openDemands} />
        <StatCard label="Em atraso" value={mockStats.overdue} variant="danger" />
        <StatCard label="Concluídas (sprint)" value={mockStats.completedThisSprint} variant="success" />
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-xl border border-[var(--border)] p-5">
        <h2 className="font-semibold mb-3">Alertas</h2>
        <div className="space-y-2">
          {riskAlerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                alert.type === "overdue"
                  ? "bg-red-50 text-red-800"
                  : alert.type === "blocked"
                  ? "bg-purple-50 text-purple-800"
                  : "bg-yellow-50 text-yellow-800"
              }`}
            >
              <span className="font-medium">{alert.message}</span>
              <span className="text-xs opacity-75">{alert.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* By Status */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-5">
          <h2 className="font-semibold mb-3">Por Status</h2>
          <div className="space-y-2">
            {byStatus.map((item) => {
              const config = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
              return (
                <div key={item.status} className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs ${config.color}`}>{config.label}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Client */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-5">
          <h2 className="font-semibold mb-3">Por Cliente</h2>
          <div className="space-y-2">
            {byClient.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <span>{c.name}</span>
                <div className="flex gap-3">
                  <span className="text-[var(--text-secondary)]">{c.active} ativas</span>
                  {c.overdue > 0 && <span className="text-red-600 font-medium">{c.overdue} atraso</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Assignee */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-5">
          <h2 className="font-semibold mb-3">Por Responsável</h2>
          <div className="space-y-2">
            {byAssignee.map((a) => (
              <div key={a.name} className="flex items-center justify-between text-sm">
                <span>{a.name}</span>
                <div className="flex gap-3">
                  <span className="text-[var(--text-secondary)]">{a.active} em curso</span>
                  <span className="text-green-600">{a.done} feitas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant?: "danger" | "success";
}) {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] p-4">
      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">{label}</p>
      <p
        className={`text-2xl font-bold mt-1 ${
          variant === "danger"
            ? "text-red-600"
            : variant === "success"
            ? "text-green-600"
            : "text-[var(--text-primary)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
