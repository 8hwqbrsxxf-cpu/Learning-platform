import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam } from "@/lib/content";
import { cardStates } from "@/lib/db";
import { bucket, isDue } from "@/lib/srs";
import FlashcardReview from "@/components/FlashcardReview";
import { ExamTabs, Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

const NEW_PER_SESSION = 15;
const LEVELS = ["beginner", "intermediate", "expert"] as const;

export default async function Flashcards({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ level?: string }> }) {
  const { id } = await params;
  const { level } = await searchParams;
  const exam = getExam(id);
  if (!exam) notFound();
  const states = cardStates(exam.id);
  const cards = exam.flashcards.filter((f) => !level || f.level === level);

  const counts = { new: 0, today: 0, week: 0, month: 0, later: 0 };
  for (const f of cards) counts[bucket(states.get(f.id))]++;

  // Due reviews first (most overdue first), then a limited batch of new cards, beginner → expert.
  const due = cards
    .filter((f) => states.has(f.id) && isDue(states.get(f.id)))
    .sort((a, b) => states.get(a.id)!.due.localeCompare(states.get(b.id)!.due));
  const order = { beginner: 0, intermediate: 1, expert: 2 };
  const fresh = cards.filter((f) => !states.has(f.id)).sort((a, b) => order[a.level] - order[b.level]).slice(0, NEW_PER_SESSION);
  const queue = [...due, ...fresh];
  const domainNames = Object.fromEntries(exam.domains.map((d) => [d.id, d.name]));

  return (
    <>
      <h1>{exam.code} · Flashcards</h1>
      <ExamTabs examId={exam.id} active="/flashcards" />
      <div className="grid grid-4">
        <Stat value={counts.today} label="Due today (daily review)" />
        <Stat value={counts.week} label="Due this week" />
        <Stat value={counts.month} label="Due this month" />
        <Stat value={counts.new} label="New cards" />
      </div>
      <div className="btn-row" style={{ margin: "16px 0" }}>
        <span className="small muted">Level:</span>
        <Link className={`btn ${!level ? "primary" : ""}`} href="?">All</Link>
        {LEVELS.map((l) => (
          <Link key={l} className={`btn ${level === l ? "primary" : ""}`} href={`?level=${l}`}>{l}</Link>
        ))}
        <a className="btn" href={`/api/flashcards/export?exam=${exam.id}`} style={{ marginLeft: "auto" }}>⬇ Export to Anki</a>
      </div>
      <FlashcardReview key={level ?? "all"} examId={exam.id} cards={queue} domainNames={domainNames} />
      <p className="small muted">
        Spaced repetition (SM-2): <em>Again</em> brings the card back tomorrow; <em>Good</em> and <em>Easy</em> push it out further each time
        (1 → 6 → ~15 → ~40 days…). Anki export: File › Import in Anki, the file sets the deck name and tags automatically.
      </p>
    </>
  );
}
