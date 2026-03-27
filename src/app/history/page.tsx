"use client";

const mockHistory = [
  { date: "26/03/2026 10:15", entity: "Atividade", title: "Implementar alerta automático de vencimento", user: "Sistema (IA)", action: "Card criado via importação da daily", type: "ai" },
  { date: "25/03/2026 17:00", entity: "Atividade", title: "Enviar prestação de contas Q1", user: "Carlos Mendes", action: "Status alterado: Em Andamento → Concluído", type: "status" },
  { date: "25/03/2026 14:00", entity: "Atividade", title: "Revisar relatório de consumo energético", user: "Sistema (IA)", action: "Sugestão: mover para Em Validação (confiança 82%)", type: "ai" },
  { date: "25/03/2026 11:00", entity: "Importação", title: "daily_25-03-2026.txt", user: "Ana Beatriz", action: "Transcrição importada — 4 sugestões geradas", type: "import" },
  { date: "24/03/2026 14:30", entity: "Atividade", title: "Revisar relatório de consumo energético", user: "Carlos Mendes", action: "Status alterado: A Fazer → Em Andamento", type: "status" },
  { date: "24/03/2026 11:00", entity: "Atividade", title: "Corrigir cálculo de multa contratual", user: "Ana Beatriz", action: "Card criado via importação da daily", type: "create" },
  { date: "22/03/2026 09:15", entity: "Atividade", title: "Revisar relatório de consumo energético", user: "Carlos Mendes", action: "Status alterado: Backlog → A Fazer", type: "status" },
  { date: "20/03/2026 16:00", entity: "Importação", title: "planilha_macro_marco.xlsx", user: "Ana Beatriz", action: "Planilha macro importada — 12 registros processados, 1 conflito resolvido", type: "import" },
  { date: "20/03/2026 10:00", entity: "Atividade", title: "Revisar relatório de consumo energético", user: "Ana Beatriz", action: "Card criado via importação da daily", type: "create" },
  { date: "18/03/2026 08:00", entity: "Atividade", title: "Preparar documentação de entrega — fase 2", user: "Mariana Costa", action: "Card criado via planilha macro", type: "create" },
];

const typeColors: Record<string, string> = {
  ai: "bg-amber-100 text-amber-700",
  status: "bg-blue-100 text-blue-700",
  import: "bg-purple-100 text-purple-700",
  create: "bg-green-100 text-green-700",
};

export default function HistoryPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Histórico e Auditoria</h1>
          <p className="text-sm text-[var(--text-secondary)]">Registro completo de todas as operações do sistema</p>
        </div>
        <div className="flex gap-2">
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>Todos os tipos</option>
            <option>Sugestão IA</option>
            <option>Mudança de status</option>
            <option>Importação</option>
            <option>Criação de card</option>
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>Todos os usuários</option>
          </select>
          <input type="text" placeholder="Buscar..." className="border rounded-lg px-3 py-2 text-sm w-48" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-[var(--text-secondary)] uppercase tracking-wide">
              <th className="px-4 py-3 w-40">Data</th>
              <th className="px-4 py-3 w-20">Tipo</th>
              <th className="px-4 py-3 w-24">Entidade</th>
              <th className="px-4 py-3">Referência</th>
              <th className="px-4 py-3 w-32">Usuário</th>
              <th className="px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {mockHistory.map((h, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{h.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${typeColors[h.type]}`}>
                    {h.type === "ai" ? "IA" : h.type === "status" ? "Status" : h.type === "import" ? "Import" : "Novo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{h.entity}</td>
                <td className="px-4 py-3 font-medium">{h.title}</td>
                <td className="px-4 py-3 text-xs">{h.user}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{h.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
