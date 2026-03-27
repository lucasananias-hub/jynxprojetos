"use client";

const clients = [
  { id: "cl1", name: "Petrobras", contracts: 3, projects: 4, activeDemands: 12, overdue: 2 },
  { id: "cl2", name: "Vale S.A.", contracts: 2, projects: 3, activeDemands: 9, overdue: 1 },
  { id: "cl3", name: "Banco Central", contracts: 2, projects: 2, activeDemands: 8, overdue: 0 },
  { id: "cl4", name: "ANEEL", contracts: 1, projects: 2, activeDemands: 5, overdue: 2 },
  { id: "cl5", name: "Eletrobras", contracts: 2, projects: 2, activeDemands: 4, overdue: 0 },
  { id: "cl6", name: "BNDES", contracts: 1, projects: 1, activeDemands: 3, overdue: 0 },
  { id: "cl7", name: "Sabesp", contracts: 1, projects: 1, activeDemands: 2, overdue: 0 },
  { id: "cl8", name: "ANP", contracts: 1, projects: 1, activeDemands: 1, overdue: 0 },
];

export default function ClientsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-[var(--text-secondary)]">{clients.length} clientes cadastrados</p>
        </div>
        <input type="text" placeholder="Buscar cliente..." className="border rounded-lg px-3 py-2 text-sm w-64" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {clients.map((c) => (
          <a
            key={c.id}
            href={`/clients/${c.id}`}
            className="bg-white rounded-xl border border-[var(--border)] p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{c.name}</h3>
              {c.overdue > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                  {c.overdue} em atraso
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Contratos</p>
                <p className="font-semibold">{c.contracts}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Projetos</p>
                <p className="font-semibold">{c.projects}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Demandas</p>
                <p className="font-semibold">{c.activeDemands}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Em atraso</p>
                <p className={`font-semibold ${c.overdue > 0 ? "text-red-600" : "text-green-600"}`}>{c.overdue}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
