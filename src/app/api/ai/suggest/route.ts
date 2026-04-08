import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT =
  "Voce e um assistente de gestao de projetos do sistema OpFlow. Analise o contexto fornecido e sugira acoes para melhorar a operacao. Responda sempre em portugues brasileiro. Seja conciso e pratico.";

interface SuggestRequestBody {
  prompt: string;
  context?: {
    activities: any[];
    clients: any[];
  };
}

const MOCK_SUGGESTIONS = [
  "Priorize a atividade 'Revisar relatorio' que esta proxima do prazo.",
  "Considere redistribuir tarefas do Carlos Mendes que esta sobrecarregado.",
  "A sprint atual tem 3 atividades bloqueadas - agende uma reuniao de desbloqueio.",
];

export async function POST(request: NextRequest) {
  try {
    const body: SuggestRequestBody = await request.json();

    if (!body.prompt || typeof body.prompt !== "string") {
      return NextResponse.json(
        { error: "Campo 'prompt' e obrigatorio." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Dev fallback: return mock suggestions when API key is not configured
    if (!apiKey || apiKey === "your-anthropic-api-key") {
      return NextResponse.json({
        suggestions: MOCK_SUGGESTIONS,
        analysis:
          "Modo de desenvolvimento: sugestoes simuladas. Configure ANTHROPIC_API_KEY para usar a IA real.",
      });
    }

    const anthropic = new Anthropic({ apiKey });

    // Build the user message with optional context
    let userMessage = body.prompt;
    if (body.context) {
      const contextParts: string[] = [];
      if (body.context.activities?.length) {
        contextParts.push(
          `Atividades atuais:\n${JSON.stringify(body.context.activities, null, 2)}`
        );
      }
      if (body.context.clients?.length) {
        contextParts.push(
          `Clientes:\n${JSON.stringify(body.context.clients, null, 2)}`
        );
      }
      if (contextParts.length) {
        userMessage = `Contexto do projeto:\n${contextParts.join("\n\n")}\n\nPergunta/Solicitacao: ${body.prompt}`;
      }
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    // Extract text from the response
    const textContent = message.content.find((block) => block.type === "text");
    const responseText = textContent ? textContent.text : "";

    // Parse response into suggestions (split by newlines or numbered items)
    const lines = responseText
      .split("\n")
      .map((line) => line.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((line) => line.length > 0);

    // If we get a cohesive paragraph, return it as analysis with the lines as suggestions
    const suggestions = lines.length > 1 ? lines.slice(0, 10) : [responseText];

    return NextResponse.json({
      suggestions,
      analysis: responseText,
    });
  } catch (error: any) {
    console.error("AI suggest error:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar sugestao da IA.",
        details: error?.message || "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
