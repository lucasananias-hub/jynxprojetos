"use client";

const project = {
  name: "Eficiência Energética — Fase 3",
  client: "Petrobras",
  contract: "CT-2026-001 — Consultoria Energética",
  status: "Ativo",
  demands: [
    { title: "Relatório trimestral de consumo", status: "Em Andamento", responsible: "Carlos Mendes", due: "28/03/2026", priority: "Alta" },
    { title: "Corrigir cálculo de multa contratual", status: "Bloqueado", responsible: "Ricardo Lima", due: "25/03/2026", priority: "Crítica" },
    { title: "Enviar prestação de contas Q1", status: "Concluído", responsible: "Carlos Mendes", due: "25/03/2026", priority: "Alta" },
    { title: "Revisar proposta de renovação", status: "A Fazer", responsible: "Ana Beatriz", due: "02/04/2026", priority: "Média" },
    { title: "Atualizar modelo de projeção", status: "Backlog", responsible: "—", due: "—", priority: "Baixa" },
    { title: "Validar métricas de performance", status: "Em Validação", responsible: "Mariana Costa", due: "30/03/2026", priority: "Média" },
  ],
};

export default function ProjectDetailPage() {
  const total = project.demands.length;
  const done = project.demands.filter((d) => d.status === "Concluído").length;
  const overdue = project.demands.filter((d) => d.status === "Bloqueado").length;

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <a href="/projects" className="text-sm text-[var(--accent)] hover:underline">← Voltar a Projetos</a>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{project.client} · {project.contract}</p>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded">{project.status}</span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[var(--border)] p-4">
          <p className="text-xs text-[var(--text-secondary)]">Total</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--border)] p-4">
          <p className="text-xs text-[var(--text-secondary)]">Concluídas</p>
          <p className="text-2xl font-bold text-green-600">{done}</p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--border)] p-4">
          <p className="text-xs text-[var(--text-secondary)]">Em atraso/bloqueado</p>
          <p className="text-2xl font-bold text-red-600">{overdue}</p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--border)] p-4">
          <p className="text-xs text-[var(--text-secondary)]">Progresso</p>
          <p className="text-2xl font-bold">{Math.round((done / total) * 100)}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-[var(--text-secondary)] uppercase tracking-wide">
              <th className="px-4 py-3">Demanda</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Prioridade</th>
              <th className="px-4 py-3">Responsável</th>
              <th className="px-4 py-3">Prazo</th>
            </tr>
          </thead>
          <tbody>
            {project.demands.map((d, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{d.title}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    d.status === "Concluído" ? "bg-green-100 text-green-700" :
                    d.status === "Bloqueado" ? "bg-red-100 text-red-700" :
                    d.status === "Em Andamento" ? "bg-indigo-100 text-indigo-700" :
                    d.status === "Em Validação" ? "bg-purple-100 text-purple-700" :
                    d.status === "A Fazer" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>{d.status}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    d.priority === "Crítica" ? "bg-red-600 text-white" :
                    d.priority === "Alta" ? "bg-orange-500 text-white" :
                    d.priority === "Média" ? "bg-yellow-400 text-black" :
                    "bg-gray-300 text-black"
                  }`}>{d.priority}</span>
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{d.responsible}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{d.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
