import { NextResponse } from "next/server";
import { getExam } from "@/lib/content";
import { setModuleCompleted } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { examId?: string; moduleId?: string; completed?: boolean } | null;
  const exam = body?.examId ? getExam(body.examId) : undefined;
  if (!exam || !exam.modules.some((m) => m.id === body?.moduleId)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  setModuleCompleted(exam.id, body!.moduleId!, Boolean(body!.completed));
  return NextResponse.json({ ok: true });
}
