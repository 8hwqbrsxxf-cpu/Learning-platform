import { NextResponse } from "next/server";
import { getExam } from "@/lib/content";
import { cardStates, saveCardState } from "@/lib/db";
import { newSchedule, review, type Grade } from "@/lib/srs";

export const runtime = "nodejs";

const GRADES: Grade[] = ["again", "hard", "good", "easy"];

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { examId?: string; cardId?: string; grade?: Grade } | null;
  const exam = body?.examId ? getExam(body.examId) : undefined;
  if (!exam || !exam.flashcards.some((f) => f.id === body?.cardId) || !GRADES.includes(body!.grade!)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const prev = cardStates(exam.id).get(body!.cardId!) ?? newSchedule();
  const next = review(prev, body!.grade!);
  saveCardState(exam.id, { card_id: body!.cardId!, ...next });
  return NextResponse.json(next);
}
