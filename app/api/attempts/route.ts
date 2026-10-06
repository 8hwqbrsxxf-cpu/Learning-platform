import { NextResponse } from "next/server";
import { getExam } from "@/lib/content";
import { recordSession } from "@/lib/db";

export const runtime = "nodejs";

// Records a finished practice session. Correctness is re-checked server-side against the content.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    examId?: string;
    mode?: string;
    answers?: { questionId: string; response: string[] }[];
  } | null;
  const exam = body?.examId ? getExam(body.examId) : undefined;
  if (!exam || !Array.isArray(body?.answers) || body.answers.length === 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const graded = [];
  for (const a of body.answers) {
    const q = exam.questions.find((x) => x.id === a.questionId);
    if (!q || !Array.isArray(a.response)) continue;
    graded.push({ questionId: q.id, domainId: q.domainId, correct: isCorrect(q.type, q.correct, a.response) });
  }
  if (!graded.length) return NextResponse.json({ error: "No valid answers" }, { status: 400 });
  const sessionId = recordSession(exam.id, String(body.mode ?? "practice").slice(0, 40), graded);
  return NextResponse.json({ sessionId, score: graded.filter((g) => g.correct).length, total: graded.length });
}

function isCorrect(type: string, correct: string[], response: string[]): boolean {
  if (type === "sequence") return correct.length === response.length && correct.every((c, i) => response[i] === c);
  const a = new Set(correct);
  const b = new Set(response);
  return a.size === b.size && [...a].every((x) => b.has(x));
}
