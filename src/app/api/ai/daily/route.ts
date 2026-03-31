import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `Voce e um assistente de gestao de projetos do sistema OpFlow.
Sua tarefa e analisar transcricoes de reunioes diarias (dailies) e extrair acoes estruturadas.

Para cada acao identificada, retorne um objeto JSON com os campos:
- action: "create" | "update" | "complete"
- suggested_title: titulo descritivo da atividade
- suggested_status: "backlog" | "todo" | "in_progress" | "validation" | "done" | "blocked" (ou null)
- suggested_assignee: nome do responsavel mencionado (ou null)
- suggested_due_date: data mencionada no formato YYYY-MM-DD (ou null)
- suggested_client: nome do cliente mencionado (ou null)
- suggested_contract: nome do contrato mencionado (ou null)
- suggested_project: nome do projeto mencionado (ou null)
- confidence: numero de 0 a 1 indicando sua confianca na extracao

Responda APENAS com um JSON valido no formato: { "suggestions": [...] }
Nao inclua texto adicional fora do JSON.`;

interface DailyRequestBody {
  transcription: string;
}

const MOCK_SUGGESTIONS = {
  suggestions: [
    {
      action: "update" as const,
      suggested_title: "Revisar relatorio de consumo energetico",
      suggested_status: "validation" as const,
      suggested_assignee: "Carlos Mendes",
      suggested_due_date: "2026-03-28",
      suggested_client: "Petrobras",
      suggested_contract: null,
      suggested_project: "Eficiencia Energetica - Fase 3",
      confidence: 0.88,
    },
    {
      action: "create" as const,
      suggested_title: "Agendar reuniao de alinhamento com juridico",
      suggested_status: "todo" as const,
      suggested_assignee: "Ana Beatriz",
      suggested_due_date: "2026-03-30",
      suggested_client: "Vale S.A.",
      suggested_contract: null,
      suggested_project: "Compliance Ambiental",
      confidence: 0.72,
    },
    {
      action: "complete" as const,
      suggested_title: "Enviar prestacao de contas Q1",
      suggested_status: "done" as const,
      suggested_assignee: "Carlos Mendes",
      suggested_due_date: "2026-03-25",
      suggested_client: "Petrobras",
      suggested_contract: null,
      suggested_project: "Eficiencia Energetica - Fase 3",
      confidence: 0.95,
    },
    {
      action: "create" as const,
      suggested_title: "Verificar pendencia mencionada sobre 'aquele documento'",
      suggested_status: "todo" as const,
      suggested_assignee: null,
      suggested_due_date: null,
      suggested_client: null,
      suggested_contract: null,
      suggested_project: null,
      confidence: 0.35,
    },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body: DailyRequestBody = await request.json();

    if (!body.transcription || typeof body.transcription !== "string") {
      return NextResponse.json(
        { error: "Campo 'transcription' e obrigatorio." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Dev fallback: return mock suggestions when API key is not configured
    if (!apiKey || apiKey === "your-anthropic-api-key") {
      return NextResponse.json(MOCK_SUGGESTIONS);
    }

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Analise a seguinte transcricao de daily e extraia as acoes:\n\n${body.transcription}`,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === "text");
    const responseText = textContent ? textContent.text : "{}";

    // Parse the JSON response from Claude
    let parsed;
    try {
      // Extract JSON from possible markdown code blocks
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestions: [] };
    } catch {
      console.error("Failed to parse AI response as JSON:", responseText);
      parsed = { suggestions: [] };
    }

    // Validate and normalize suggestions
    const suggestions = (parsed.suggestions || []).map(
      (s: any, index: number) => ({
        action: s.action || "create",
        suggested_title: s.suggested_title || `Atividade ${index + 1}`,
        suggested_status: s.suggested_status || null,
        suggested_assignee: s.suggested_assignee || null,
        suggested_due_date: s.suggested_due_date || null,
        suggested_client: s.suggested_client || null,
        suggested_contract: s.suggested_contract || null,
        suggested_project: s.suggested_project || null,
        confidence: typeof s.confidence === "number" ? s.confidence : 0.5,
      })
    );

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error("AI daily error:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar transcricao.",
        details: error?.message || "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
