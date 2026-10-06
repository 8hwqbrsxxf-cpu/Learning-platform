import Link from "next/link";
import { getExams } from "@/lib/content";
import { cardStates, labProgress, sessions } from "@/lib/db";
import { computeReadiness } from "@/lib/readiness";
import { isDue } from "@/lib/srs";
import { Bar, scoreColor } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const exams = getExams();
  return (
    <>
      <h1>Your certification dashboard</h1>
      <p className="muted">
        Pick up where you left off. Readiness combines practice-exam results, completed labs and flashcard retention, weighted by the official
        exam domains.
      </p>
      {exams.length === 0 && <div className="card">No exam content found in <code>content/exams</code>.</div>}
      <div className="grid grid-2">
        {exams.map((exam) => {
          const r = computeReadiness(exam);
          const states = cardStates(exam.id);
          const due = exam.flashcards.filter((f) => states.has(f.id) && isDue(states.get(f.id))).length;
          const fresh = exam.flashcards.filter((f) => !states.has(f.id)).length;
          const labs = labProgress(exam.id);
          const labsDone = exam.labs.filter((l) => labs.get(l.id)?.status === "completed").length;
          const last = sessions(exam.id, 1)[0];
          return (
            <div key={exam.id} className="card">
              <div className="btn-row" style={{ justifyContent: "space-between" }}>
                <h2 style={{ margin: 0 }}>
                  <Link href={`/exams/${exam.id}`}>{exam.code}</Link> <span className="muted small">{exam.title}</span>
                </h2>
                <span className="badge accent">{exam.level}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "14px 0 6px" }}>
                <span style={{ fontSize: "2.2rem", fontWeight: 700, color: scoreColor(r.overall) }}>{r.overall}%</span>
                <span className="muted">exam readiness</span>
              </div>
              <Bar value={r.overall} />
              <ul className="clean small" style={{ marginTop: 12 }}>
                <li>📝 {r.answeredTotal}/{exam.questions.length} questions answered{last ? ` · last session ${last.score}/${last.total}` : ""}</li>
                <li>🧪 {labsDone}/{exam.labs.length} labs completed</li>
                <li>🃏 {due} flashcards due · {fresh} new</li>
              </ul>
              <div className="callout tip small">{r.recommendation}</div>
              <div className="btn-row">
                <Link className="btn primary" href={`/exams/${exam.id}/practice`}>Practice</Link>
                <Link className="btn" href={`/exams/${exam.id}/flashcards`}>Review cards</Link>
                <Link className="btn" href={`/exams/${exam.id}/plan`}>Study plan</Link>
                <Link className="btn" href={`/coach?exam=${exam.id}`}>Ask the coach</Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
