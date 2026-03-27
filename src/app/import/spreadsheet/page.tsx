"use client";

import { useState } from "react";

interface SpreadsheetRow {
  id: string;
  client: string;
  contract: string;
  project: string;
  demand: string;
  status: string;
  responsible: string;
  dueDate: string;
  conflict: boolean;
  conflictDetail?: string;
}

const mockRows: SpreadsheetRow[] = [
  {
    id: "r1", client: "Petrobras", contract: "CT-2026-001", project: "Eficiência Energética — Fase 3",
    demand: "Relatório trimestral de consumo", status: "Em andamento", responsible: "Carlos Mendes",
    dueDate: "28/03/2026", conflict: false,
  },
  {
    id: "r2", client: "Vale S.A.", contract: "CT-2026-003", project: "Compliance Ambiental",
    demand: "Auditoria de resíduos sólidos", status: "Concluído", responsible: "Ana Beatriz",
    dueDate: "20/03/2026", conflict: true,
    conflictDetail: "No kanban está como 'Em Validação'. A planilha informa 'Concluído'.",
  },
  {
    id: "r3", client: "Banco Central", contract: "CT-2026-005", project: "Modernização de Sistemas",
    demand: "Migração de base legada", status: "Em andamento", responsible: "Ricardo Lima",
    dueDate: "15/04/2026", conflict: false,
  },
  {
    id: "r4", client: "ANEEL", contract: "CT-2026-007", project: "Regulação Tarifária",
    demand: "Estudo de impacto tarifário", status: "Pendente", responsible: "Mariana Costa",
    dueDate: "10/04/2026", conflict: false,
  },
];

export default function ImportSpreadsheetPage() {
  const [step, setStep] = useState<"upload" | "mapping" | "preview">("upload");
  const [rows] = useState(mockRows);

  if (step === "upload") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Importar Planilha Macro</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Envie a planilha com a visão macro de contratos, projetos e demandas.
        </p>
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-[var(--text-secondary)] mb-4">Arraste o arquivo aqui ou clique para selecionar</p>
          <p className="text-xs text-gray-400 mb-4">Formatos aceitos: .xlsx, .xls, .csv</p>
          <button
            onClick={() => setStep("mapping")}
            className="px-6 py-2.5 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] text-sm font-medium"
          >
            Importar planilha macro
          </button>
        </div>
      </div>
    );
  }

  if (step === "mapping") {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Mapeamento de Colunas</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Confirme a correspondência entre as colunas da planilha e os campos do sistema.
        </p>
        <div className="bg-white rounded-xl border border-[var(--border)] p-5 space-y-4">
          {[
            { field: "Cliente", detected: "Coluna A — 'Cliente'" },
            { field: "Contrato", detected: "Coluna B — 'Nº Contrato'" },
            { field: "Projeto", detected: "Coluna C — 'Projeto'" },
            { field: "Demanda", detected: "Coluna D — 'Descrição Demanda'" },
            { field: "Status", detected: "Coluna E — 'Status'" },
            { field: "Responsável", detected: "Coluna F — 'Responsável'" },
            { field: "Prazo", detected: "Coluna G — 'Data Limite'" },
          ].map((m) => (
            <div key={m.field} className="flex items-center justify-between text-sm">
              <span className="font-medium w-32">{m.field}</span>
              <span className="text-[var(--text-secondary)]">←</span>
              <select className="flex-1 ml-4 border rounded-lg px-3 py-2 text-sm">
                <option>{m.detected}</option>
                <option>Selecionar outra coluna...</option>
              </select>
            </div>
          ))}
        </div>
        <button
          onClick={() => setStep("preview")}
          className="px-6 py-2.5 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] text-sm font-medium"
        >
          Validar e pré-visualizar
        </button>
      </div>
    );
  }

  const conflicts = rows.filter((r) => r.conflict);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pré-visualização da Importação</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {rows.length} registros encontrados · {conflicts.length} conflitos detectados
          </p>
        </div>
        <button className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
          Confirmar importação
        </button>
      </div>

      {conflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">Conflitos detectados</h3>
          {conflicts.map((c) => (
            <div key={c.id} className="text-sm text-amber-700 mb-2">
              <p className="font-medium">{c.demand}</p>
              <p className="text-xs">{c.conflictDetail}</p>
              <div className="flex gap-2 mt-1">
                <button className="text-xs underline">Manter dados da planilha</button>
                <button className="text-xs underline">Manter dados do kanban</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-[var(--text-secondary)] uppercase tracking-wide">
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Contrato</th>
              <th className="px-4 py-3">Projeto</th>
              <th className="px-4 py-3">Demanda</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Responsável</th>
              <th className="px-4 py-3">Prazo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={`border-t ${r.conflict ? "bg-amber-50" : ""}`}>
                <td className="px-4 py-3">{r.client}</td>
                <td className="px-4 py-3">{r.contract}</td>
                <td className="px-4 py-3">{r.project}</td>
                <td className="px-4 py-3">{r.demand}</td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3">{r.responsible}</td>
                <td className="px-4 py-3">{r.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
