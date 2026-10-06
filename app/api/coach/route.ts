import Anthropic from "@anthropic-ai/sdk";
import { getExam } from "@/lib/content";
import { COACH_SYSTEM_PROMPT, LEARN_GROUNDING, learnerContext } from "@/lib/coach";
import { latestAttempts } from "@/lib/db";
import { computeReadiness } from "@/lib/readiness";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MAX_TURNS = 40;
const MAX_CHARS = 20_000;
const MAX_ROUNDS = 4;
// Public Microsoft Learn MCP server (no authentication). maxTokenBudget caps the size of search results.
const LEARN_MCP_URL = "https://learn.microsoft.com/api/mcp?maxTokenBudget=4000";

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return new Response("The AI coach is not configured: set ANTHROPIC_API_KEY in .env.local and restart the app.", { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as { examId?: string; messages?: ChatMessage[] } | null;
  const history = (body?.messages ?? []).slice(-MAX_TURNS);
  const valid =
    history.length > 0 &&
    history.at(-1)!.role === "user" &&
    history.every((m, i) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.length <= MAX_CHARS && (i === 0 || m.role !== history[i - 1].role));
  if (!valid) return new Response("Invalid conversation.", { status: 400 });
  // The trimmed history must start with a user turn.
  const messages = history[0].role === "user" ? history : history.slice(1);

  const exam = body?.examId ? getExam(body.examId) : undefined;
  const readiness = exam ? computeReadiness(exam) : undefined;
  const mistakes = exam
    ? [
        ...new Set(
          latestAttempts(exam.id)
            .filter((a) => !a.correct)
            .map((a) => exam.questions.find((q) => q.id === a.question_id)?.skillMeasured)
            .filter((s): s is string => Boolean(s)),
        ),
      ].slice(0, 8)
    : [];

  const client = new Anthropic();
  const useLearn = process.env.LEARN_MCP !== "off";
  const system: Anthropic.Beta.Messages.BetaTextBlockParam[] = [
    { type: "text", text: COACH_SYSTEM_PROMPT + (useLearn ? LEARN_GROUNDING : ""), cache_control: { type: "ephemeral" } },
    { type: "text", text: learnerContext(exam, readiness, mistakes) },
  ];
  const conversation: Anthropic.Beta.Messages.BetaMessageParam[] = [...messages];
  let current: ReturnType<typeof client.beta.messages.stream> | null = null;

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (text: string) => controller.enqueue(encoder.encode(text));
      let announcedLearn = false;
      try {
        // The Learn lookups run server-side; a long research turn can pause and is then resumed.
        for (let round = 0; round < MAX_ROUNDS; round++) {
          current = client.beta.messages.stream({
            model: "claude-opus-5-5",
            max_tokens: 16000,
            output_config: { effort: "medium" },
            // fallbacks: on a safety-classifier decline the API retries on a fallback model in the same call.
            betas: useLearn ? ["server-side-fallback-2026-07-01", "mcp-client-2025-11-20"] : ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            ...(useLearn
              ? {
                  mcp_servers: [{ type: "url" as const, url: LEARN_MCP_URL, name: "microsoft-learn" }],
                  tools: [{ type: "mcp_toolset" as const, mcp_server_name: "microsoft-learn" }],
                }
              : {}),
            system,
            messages: conversation,
          });
          for await (const event of current) {
            if (event.type === "content_block_start" && event.content_block.type === "mcp_tool_use" && !announcedLearn) {
              announcedLearn = true;
              send("_🔎 Checking Microsoft Learn…_\n\n");
            } else if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              send(event.delta.text);
            }
          }
          const final = await current.finalMessage();
          if (final.stop_reason === "pause_turn") {
            conversation.push({ role: "assistant", content: final.content });
            continue;
          }
          if (final.stop_reason === "refusal") {
            send("\n\n_The coach could not answer this request. Try rephrasing it as a study question._");
          } else if (final.stop_reason === "max_tokens") {
            send("\n\n_(Answer truncated — ask me to continue.)_");
          }
          break;
        }
      } catch (error) {
        let msg = "The coach is temporarily unavailable.";
        if (error instanceof Anthropic.AuthenticationError) msg = "The ANTHROPIC_API_KEY is invalid.";
        else if (error instanceof Anthropic.RateLimitError) msg = "Rate limited by the Claude API — try again in a minute.";
        else if (error instanceof Anthropic.APIError) msg = `Claude API error ${error.status ?? ""}: ${error.message}`;
        console.error("coach error", error);
        send(`\n\n⚠️ ${msg}`);
      } finally {
        controller.close();
      }
    },
    cancel() {
      current?.abort();
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
