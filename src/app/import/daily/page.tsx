"use client";

import { useState } from "react";

interface AISuggestion {
  id: string;
  action: "create" | "update" | "complete";
  title: string;
  suggestedStatus: string;
  assignee: string;
  dueDate: string;
  linkedClient: string;
  linkedProject: string;
  confidence: number;
  ambiguous: boolean;
  accepted: boolean | null;
}

const mockSuggestions: AISuggestion[] = [
  {
    id: "s1", action: "update", title: "Revisar relatório de consumo energético",
    suggestedStatus: "Em Validação", assignee: "Carlos Mendes", dueDate: "28/03/2026",
    linkedClient: "Petrobras", linkedProject: "Eficiência Energética — Fase 3",
    confidence: 0.88, ambiguous: false, accepted: null,
  },
  {
    id: "s2", action: "create", title: "Agendar reunião de alinhamento com jurídico",
    suggestedStatus: "A Fazer", assignee: "Ana Beatriz", dueDate: "30/03/2026",
    linkedClient: "Vale S.A.", linkedProject: "Compliance Ambiental",
    confidence: 0.72, ambiguous: false, accepted: null,
  },
  {
    id: "s3", action: "complete", title: "Enviar prestação de contas Q1",
    suggestedStatus: "Concluído", assignee: "Carlos Mendes", dueDate: "25/03/2026",
    linkedClient: "Petrobras", linkedProject: "Eficiência Energética — Fase 3",
    confidence: 0.95, ambiguous: false, accepted: null,
  },
  {
    id: "s4", action: "create", title: "Verificar pendência mencionada sobre 'aquele documento'",
    suggestedStatus: "A Fazer", assignee: "—", dueDate: "—",
    linkedClient: "—", linkedProject: "—",
    confidence: 0.35, ambiguous: true, accepted: null,
  },
];

export default function ImportDailyPage() {
  const [step, setStep] = useState<"upload" | "review">("upload");
  const [suggestions, setSuggestions] = useState(mockSuggestions);

  function handleUpload() {
    setStep("review");
  }

  function handleAccept(id: string) {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, accepted: true } : s)));
  }

  function handleReject(id: string) {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, accepted: false } : s)));
  }

  function handleConfirmAll() {
    alert("Sugestões confirmadas aplicadas ao kanban. Histórico registrado.");
  }

  if (step === "upload") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Importar Transcrição da Daily</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Envie o arquivo de transcrição da reunião diária. A IA irá identificar atividades, responsáveis, prazos e bloqueios.
        </p>
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-[var(--text-secondary)] mb-4">Arraste o arquivo aqui ou clique para selecionar</p>
          <p className="text-xs text-gray-400 mb-4">Formatos aceitos: .txt, .md, .docx</p>
          <button
            onClick={handleUpload}
            className="px-6 py-2.5 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] text-sm font-medium"
          >
            Importar transcrição da daily
          </button>
        </div>
      </div>
    );
  }

  const pendingCount = suggestions.filter((s) => s.accepted === null).length;
  const acceptedCount = suggestions.filter((s) => s.accepted === true).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revisão da Transcrição</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {suggestions.length} atividades identificadas · {acceptedCount} aceitas · {pendingCount} pendentes
          </p>
        </div>
        <button
          onClick={handleConfirmAll}
          disabled={pendingCount > 0}
          className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-40"
        >
          Confirmar e aplicar
        </button>
      </div>

      <div className="space-y-3">
        {suggestions.map((s) => (
          <div
            key={s.id}
            className={`bg-white rounded-xl border p-4 ${
              s.ambiguous ? "border-amber-400 ring-1 ring-amber-200" : "border-[var(--border)]"
            } ${s.accepted === true ? "opacity-60" : ""} ${s.accepted === false ? "opacity-30" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      s.action === "create"
                        ? "bg-blue-100 text-blue-700"
                        : s.action === "update"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {s.action === "create" ? "Novo card" : s.action === "update" ? "Atualizar card" : "Concluir"}
                  </span>
                  {s.ambiguous && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
                      Requer validação humana
                    </span>
                  )}
                  <span className="text-xs text-[var(--text-secondary)]">
                    Confiança: {Math.round(s.confidence * 100)}%
                  </span>
                </div>
                <h3 className="font-medium mt-2">{s.title}</h3>
                <div className="grid grid-cols-3 gap-4 mt-2 text-xs text-[var(--text-secondary)]">
                  <div>
                    <span className="uppercase tracking-wide">Status sugerido:</span>{" "}
                    <span className="text-[var(--text-primary)]">{s.suggestedStatus}</span>
                  </div>
                  <div>
                    <span className="uppercase tracking-wide">Responsável:</span>{" "}
                    <span className="text-[var(--text-primary)]">{s.assignee}</span>
                  </div>
                  <div>
                    <span className="uppercase tracking-wide">Prazo:</span>{" "}
                    <span className="text-[var(--text-primary)]">{s.dueDate}</span>
                  </div>
                  <div>
                    <span className="uppercase tracking-wide">Cliente:</span>{" "}
                    <span className="text-[var(--text-primary)]">{s.linkedClient}</span>
                  </div>
                  <div>
                    <span className="uppercase tracking-wide">Projeto:</span>{" "}
                    <span className="text-[var(--text-primary)]">{s.linkedProject}</span>
                  </div>
                </div>
              </div>
              {s.accepted === null && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleAccept(s.id)}
                    className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Aceitar
                  </button>
                  <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Editar
                  </button>
                  <button
                    onClick={() => handleReject(s.id)}
                    className="px-3 py-1.5 text-xs text-red-600 hover:underline"
                  >
                    Descartar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
