import { NextResponse } from "next/server";
import { getExam } from "@/lib/content";
import { saveLabProgress, type LabStatus } from "@/lib/db";

export const runtime = "nodejs";

const STATUSES: LabStatus[] = ["not_started", "in_progress", "completed"];

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { examId?: string; labId?: string; status?: LabStatus; notes?: string } | null;
  const exam = body?.examId ? getExam(body.examId) : undefined;
  if (!exam || !exam.labs.some((l) => l.id === body?.labId) || !STATUSES.includes(body!.status!)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  saveLabProgress(exam.id, body!.labId!, body!.status!, String(body!.notes ?? "").slice(0, 10_000));
  return NextResponse.json({ ok: true });
}
