"use client";

import { PRIORITY_CONFIG, STATUS_CONFIG } from "@/lib/constants";

const card = {
  id: "1",
  title: "Revisar relatório de consumo energético",
  description: "Validar dados do último trimestre junto à equipe de engenharia. Cruzar com os dados da fatura e confirmar os valores antes do envio ao cliente.",
  client: "Petrobras",
  contract: "CT-2026-001 — Consultoria Energética",
  project: "Eficiência Energética — Fase 3",
  status: "in_progress" as const,
  priority: "high" as const,
  origin: "daily" as const,
  due_date: "2026-03-28",
  assignees: ["Carlos Mendes"],
  created_at: "2026-03-20T10:00:00Z",
  updated_at: "2026-03-25T14:00:00Z",
  updated_by: "Ana Beatriz",
  ai_suggestion: "IA sugeriu atualizar status para 'Em Validação' com base na daily de 25/03. Confiança: 82%.",
  subtasks: [
    { title: "Coletar dados de consumo Q1", done: true },
    { title: "Validar com engenharia", done: false },
    { title: "Enviar ao cliente", done: false },
  ],
  history: [
    { date: "20/03/2026 10:00", user: "Ana Beatriz", action: "Card criado via importação da daily" },
    { date: "22/03/2026 09:15", user: "Carlos Mendes", action: "Status alterado: Backlog → A Fazer" },
    { date: "24/03/2026 14:30", user: "Carlos Mendes", action: "Status alterado: A Fazer → Em Andamento" },
    { date: "25/03/2026 14:00", user: "Sistema (IA)", action: "Sugestão: mover para Em Validação (confiança 82%)" },
  ],
  comments: [
    { user: "Carlos Mendes", date: "24/03 15:00", text: "Dados coletados, falta cruzar com a fatura." },
    { user: "Ana Beatriz", date: "25/03 10:30", text: "Engenharia confirmou os valores parciais." },
  ],
};

export default function CardDetailPage() {
  const statusCfg = STATUS_CONFIG[card.status];
  const priorityCfg = PRIORITY_CONFIG[card.priority];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <a href="/kanban" className="text-sm text-[var(--accent)] hover:underline">
        ← Voltar ao Kanban
      </a>

      <div className="bg-white rounded-xl border border-[var(--border)] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{card.title}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{card.description}</p>
          </div>
          <div className="flex gap-2">
            <span className={`text-xs px-2 py-1 rounded ${statusCfg.color}`}>{statusCfg.label}</span>
            <span className={`text-xs px-2 py-1 rounded ${priorityCfg.color}`}>{priorityCfg.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
          <Field label="Cliente" value={card.client} />
          <Field label="Contrato" value={card.contract} />
          <Field label="Projeto" value={card.project} />
          <Field label="Responsável" value={card.assignees.join(", ")} />
          <Field label="Prazo" value={new Date(card.due_date).toLocaleDateString("pt-BR")} />
          <Field label="Origem" value={card.origin === "daily" ? "Transcrição da Daily" : card.origin === "spreadsheet" ? "Planilha Macro" : "Manual"} />
          <Field label="Criado em" value={new Date(card.created_at).toLocaleDateString("pt-BR")} />
          <Field label="Última atualização" value={`${new Date(card.updated_at).toLocaleDateString("pt-BR")} por ${card.updated_by}`} />
        </div>
      </div>

      {/* AI Suggestion */}
      {card.ai_suggestion && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-1">Sugestão da IA</h3>
          <p className="text-sm text-amber-700">{card.ai_suggestion}</p>
          <div className="flex gap-2 mt-3">
            <button className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700">Aceitar</button>
            <button className="px-3 py-1.5 text-xs bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50">Editar</button>
            <button className="px-3 py-1.5 text-xs text-amber-600 hover:underline">Descartar</button>
          </div>
        </div>
      )}

      {/* Subtasks */}
      <div className="bg-white rounded-xl border border-[var(--border)] p-5">
        <h3 className="font-semibold mb-3">Subtarefas</h3>
        <div className="space-y-2">
          {card.subtasks.map((st, i) => (
            <label key={i} className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked={st.done} className="rounded" />
              <span className={st.done ? "line-through text-gray-400" : ""}>{st.title}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white rounded-xl border border-[var(--border)] p-5">
        <h3 className="font-semibold mb-3">Comentários</h3>
        <div className="space-y-3">
          {card.comments.map((c, i) => (
            <div key={i} className="text-sm">
              <span className="font-medium">{c.user}</span>
              <span className="text-[var(--text-secondary)] ml-2 text-xs">{c.date}</span>
              <p className="mt-0.5 text-[var(--text-secondary)]">{c.text}</p>
            </div>
          ))}
        </div>
        <textarea
          placeholder="Adicionar comentário..."
          className="w-full mt-3 border rounded-lg p-2 text-sm resize-none"
          rows={2}
        />
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-[var(--border)] p-5">
        <h3 className="font-semibold mb-3">Histórico</h3>
        <div className="space-y-2">
          {card.history.map((h, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap w-36">{h.date}</span>
              <span className="text-xs text-[var(--text-secondary)] w-28">{h.user}</span>
              <span>{h.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">{label}</p>
      <p className="font-medium mt-0.5">{value}</p>
    </div>
  );
}
