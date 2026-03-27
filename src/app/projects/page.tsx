"use client";

const projects = [
  { id: "p1", name: "Eficiência Energética — Fase 3", client: "Petrobras", status: "Ativo", demands: 6, completed: 3, overdue: 1 },
  { id: "p2", name: "Compliance Ambiental", client: "Vale S.A.", status: "Ativo", demands: 5, completed: 2, overdue: 1 },
  { id: "p3", name: "Modernização de Sistemas", client: "Banco Central", status: "Ativo", demands: 4, completed: 1, overdue: 0 },
  { id: "p4", name: "Regulação Tarifária", client: "ANEEL", status: "Ativo", demands: 3, completed: 0, overdue: 2 },
  { id: "p5", name: "Revisão de Processos Internos", client: "Petrobras", status: "Ativo", demands: 2, completed: 1, overdue: 0 },
];

export default function ProjectsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projetos</h1>
          <p className="text-sm text-[var(--text-secondary)]">{projects.length} projetos em andamento</p>
        </div>
        <div className="flex gap-2">
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>Todos os clientes</option>
          </select>
          <input type="text" placeholder="Buscar projeto..." className="border rounded-lg px-3 py-2 text-sm w-64" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-[var(--text-secondary)] uppercase tracking-wide">
              <th className="px-4 py-3">Projeto</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Demandas</th>
              <th className="px-4 py-3 text-center">Concluídas</th>
              <th className="px-4 py-3 text-center">Em atraso</th>
              <th className="px-4 py-3 text-center">Progresso</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const pct = p.demands > 0 ? Math.round((p.completed / p.demands) * 100) : 0;
              return (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <a href={`/projects/${p.id}`} className="text-[var(--accent)] hover:underline font-medium">
                      {p.name}
                    </a>
                  </td>
                  <td className="px-4 py-3">{p.client}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-center">{p.demands}</td>
                  <td className="px-4 py-3 text-center text-green-600">{p.completed}</td>
                  <td className="px-4 py-3 text-center">
                    {p.overdue > 0 ? <span className="text-red-600 font-medium">{p.overdue}</span> : "0"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-[var(--text-secondary)]">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
