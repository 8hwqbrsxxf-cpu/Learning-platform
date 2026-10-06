import { getExams } from "@/lib/content";
import CoachChat from "@/components/CoachChat";

export default async function CoachPage({ searchParams }: { searchParams: Promise<{ exam?: string; prompt?: string; topic?: string }> }) {
  const sp = await searchParams;
  const exams = getExams().map((e) => ({ id: e.id, code: e.code, title: e.title }));
  const initialPrompt = sp.prompt ?? (sp.topic ? `I want to prepare for ${sp.topic}. Give me a certification overview and a roadmap.` : "");
  return (
    <>
      <h1>AI Study Coach</h1>
      <p className="muted">
        Your personal tutor: explanations at your level, original practice questions, flashcards, lab designs and career advice. The coach knows
        your readiness scores and recent mistakes for the selected exam.
      </p>
      <CoachChat exams={exams} initialExam={sp.exam ?? exams[0]?.id ?? ""} initialPrompt={initialPrompt} configured={Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN)} />
    </>
  );
}
