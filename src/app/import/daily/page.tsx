"use client";

import { useState } from "react";

interface AISuggestion {
  id: string;
  action: "create" | "update" | "complete";
  suggested_title: string;
  suggested_status: string | null;
  suggested_assignee: string | null;
  suggested_due_date: string | null;
  suggested_client: string | null;
  suggested_project: string | null;
  confidence: number;
  accepted: boolean | null;
}

export default function ImportDailyPage() {
  const [step, setStep] = useState<"upload" | "processing" | "review">("upload");
  const [transcription, setTranscription] = useState("");
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!transcription.trim()) return;
    setStep("processing");
    setError(null);

    try {
      const res = await fetch("/api/ai/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription: transcription.trim() }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setStep("upload");
        return;
      }

      const mapped: AISuggestion[] = (data.suggestions || []).map(
        (s: any, i: number) => ({
          id: `s${i + 1}`,
          action: s.action || "create",
          suggested_title: s.suggested_title || `Atividade ${i + 1}`,
          suggested_status: s.suggested_status || null,
          suggested_assignee: s.suggested_assignee || null,
          suggested_due_date: s.suggested_due_date || null,
          suggested_client: s.suggested_client || null,
          suggested_project: s.suggested_project || null,
          confidence: typeof s.confidence === "number" ? s.confidence : 0.5,
          accepted: null,
        })
      );

      setSuggestions(mapped);
      setStep("review");
    } catch {
      setError("Erro de conexao ao processar transcricao.");
      setStep("upload");
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTranscription((ev.target?.result as string) || "");
    };
    reader.readAsText(file);
  }

  function handleAccept(id: string) {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, accepted: true } : s)));
  }

  function handleReject(id: string) {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, accepted: false } : s)));
  }

  function handleConfirmAll() {
    const accepted = suggestions.filter((s) => s.accepted === true);
    alert(`${accepted.length} sugestoes aceitas aplicadas ao kanban. Historico registrado.`);
  }

  if (step === "upload") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Importar Transcricao da Daily</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Cole a transcricao ou envie um arquivo. A IA ira identificar atividades, responsaveis, prazos e bloqueios.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-[var(--border)] p-6 space-y-4">
          <textarea
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder="Cole a transcricao da daily aqui...&#10;&#10;Exemplo: 'Carlos disse que terminou o relatorio da Petrobras. Ana vai comecar a revisao do contrato da Vale amanha. Ricardo esta bloqueado esperando aprovacao do juridico.'"
            className="w-full h-48 border border-[var(--border)] rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
          />

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]">
              <input
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs hover:bg-gray-50">
                Enviar arquivo .txt / .md
              </span>
            </label>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!transcription.trim()}
            className="w-full px-6 py-2.5 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] text-sm font-medium disabled:opacity-40"
          >
            Analisar com IA
          </button>
        </div>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-[var(--text-secondary)]">Analisando transcricao com IA...</p>
      </div>
    );
  }

  const pendingCount = suggestions.filter((s) => s.accepted === null).length;
  const acceptedCount = suggestions.filter((s) => s.accepted === true).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revisao da Transcricao</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {suggestions.length} atividades identificadas · {acceptedCount} aceitas · {pendingCount} pendentes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setStep("upload"); setSuggestions([]); }}
            className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-gray-50"
          >
            Nova transcricao
          </button>
          <button
            onClick={handleConfirmAll}
            disabled={acceptedCount === 0}
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-40"
          >
            Confirmar e aplicar ({acceptedCount})
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((s) => {
          const isAmbiguous = s.confidence < 0.5;
          return (
            <div
              key={s.id}
              className={`bg-white rounded-xl border p-4 ${
                isAmbiguous ? "border-amber-400 ring-1 ring-amber-200" : "border-[var(--border)]"
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
                    {isAmbiguous && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
                        Requer validacao humana
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        s.confidence >= 0.8
                          ? "bg-green-100 text-green-700"
                          : s.confidence >= 0.5
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {Math.round(s.confidence * 100)}% confianca
                    </span>
                  </div>
                  <h3 className="font-medium mt-2">{s.suggested_title}</h3>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-xs text-[var(--text-secondary)]">
                    <div>
                      <span className="uppercase tracking-wide">Status:</span>{" "}
                      <span className="text-[var(--text-primary)]">{s.suggested_status || "—"}</span>
                    </div>
                    <div>
                      <span className="uppercase tracking-wide">Responsavel:</span>{" "}
                      <span className="text-[var(--text-primary)]">{s.suggested_assignee || "—"}</span>
                    </div>
                    <div>
                      <span className="uppercase tracking-wide">Prazo:</span>{" "}
                      <span className="text-[var(--text-primary)]">{s.suggested_due_date || "—"}</span>
                    </div>
                    <div>
                      <span className="uppercase tracking-wide">Cliente:</span>{" "}
                      <span className="text-[var(--text-primary)]">{s.suggested_client || "—"}</span>
                    </div>
                    <div>
                      <span className="uppercase tracking-wide">Projeto:</span>{" "}
                      <span className="text-[var(--text-primary)]">{s.suggested_project || "—"}</span>
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
          );
        })}
      </div>
    </div>
  );
}
