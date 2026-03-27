"use client";

const client = {
  name: "Petrobras",
  contracts: [
    {
      code: "CT-2026-001", name: "Consultoria Energética", status: "Ativo",
      projects: [
        {
          name: "Eficiência Energética — Fase 3", status: "Ativo",
          demands: [
            { title: "Relatório trimestral de consumo", status: "Em Andamento", responsible: "Carlos Mendes", due: "28/03" },
            { title: "Corrigir cálculo de multa contratual", status: "Bloqueado", responsible: "Ricardo Lima", due: "25/03" },
            { title: "Enviar prestação de contas Q1", status: "Concluído", responsible: "Carlos Mendes", due: "25/03" },
          ],
        },
      ],
    },
    {
      code: "CT-2026-002", name: "Auditoria Operacional", status: "Ativo",
      projects: [
        {
          name: "Revisão de Processos Internos", status: "Ativo",
          demands: [
            { title: "Mapeamento de processos críticos", status: "Em Andamento", responsible: "Mariana Costa", due: "05/04" },
          ],
        },
      ],
    },
  ],
};

export default function ClientDetailPage() {
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <a href="/clients" className="text-sm text-[var(--accent)] hover:underline">← Voltar a Clientes</a>
      <h1 className="text-2xl font-bold">{client.name}</h1>

      {client.contracts.map((contract) => (
        <div key={contract.code} className="bg-white rounded-xl border border-[var(--border)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">{contract.name}</h2>
              <p className="text-xs text-[var(--text-secondary)]">{contract.code} · {contract.status}</p>
            </div>
          </div>

          {contract.projects.map((project) => (
            <div key={project.name} className="ml-4 border-l-2 border-gray-200 pl-4">
              <h3 className="font-medium text-sm">{project.name}</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-2">{project.status}</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[var(--text-secondary)] uppercase">
                    <th className="pb-2">Demanda</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Responsável</th>
                    <th className="pb-2">Prazo</th>
                  </tr>
                </thead>
                <tbody>
                  {project.demands.map((d, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2">{d.title}</td>
                      <td className="py-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          d.status === "Concluído" ? "bg-green-100 text-green-700" :
                          d.status === "Bloqueado" ? "bg-red-100 text-red-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>{d.status}</span>
                      </td>
                      <td className="py-2 text-[var(--text-secondary)]">{d.responsible}</td>
                      <td className="py-2 text-[var(--text-secondary)]">{d.due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
