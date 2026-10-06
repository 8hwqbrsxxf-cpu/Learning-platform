import { NextResponse } from "next/server";
import { getExam } from "@/lib/content";
import { saveProfile, type StudyProfile } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as ({ examId?: string } & Partial<StudyProfile>) | null;
  const exam = body?.examId ? getExam(body.examId) : undefined;
  const hours = Number(body?.hoursPerWeek);
  const ok =
    exam &&
    hours >= 1 &&
    hours <= 60 &&
    /^\d{4}-\d{2}-\d{2}$/.test(body?.targetDate ?? "") &&
    ["beginner", "intermediate", "advanced"].includes(body?.level ?? "") &&
    ["reading", "video", "hands-on"].includes(body?.learningStyle ?? "");
  if (!ok) return NextResponse.json({ error: "Invalid study profile" }, { status: 400 });
  saveProfile(exam!.id, {
    hoursPerWeek: hours,
    targetDate: body!.targetDate!,
    level: body!.level!,
    learningStyle: body!.learningStyle!,
    existingCerts: String(body!.existingCerts ?? "").slice(0, 300),
  });
  return NextResponse.json({ ok: true });
}
