import { NextResponse } from "next/server";
import { getLearningPaths } from "@/lib/content";
import { setModuleCompleted } from "@/lib/db";

export const runtime = "nodejs";

// Marks a Microsoft Learn module (by catalog uid) as studied.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { examId?: string; uid?: string; completed?: boolean } | null;
  const paths = body?.examId ? getLearningPaths(body.examId) : undefined;
  if (!paths || !paths.paths.some((p) => p.modules.some((m) => m.uid === body?.uid))) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  setModuleCompleted(body!.examId!, body!.uid!, Boolean(body!.completed));
  return NextResponse.json({ ok: true });
}
