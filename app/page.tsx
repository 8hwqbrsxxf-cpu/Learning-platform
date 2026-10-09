import Link from "next/link";
import { getExams, getLearningPaths } from "@/lib/content";
import { cardStates, completedModules, labProgress, sessions } from "@/lib/db";
import { computeReadiness } from "@/lib/readiness";
import { isDue } from "@/lib/srs";
import { Bar, BetaBanner, RetirementBanner, scoreColor } from "@/components/ui";

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
          const hasPractice = exam.questions.length > 0;
          const lpModules = getLearningPaths(exam.id)?.paths.flatMap((p) => p.modules) ?? [];
          const doneModules = completedModules(exam.id);
          const learnTotal = lpModules.length;
          const studied = lpModules.filter((m) => doneModules.has(m.uid)).length;
          return (
            <div key={exam.id} className="card">
              <div className="btn-row" style={{ justifyContent: "space-between" }}>
                <h2 style={{ margin: 0 }}>
                  <Link href={`/exams/${exam.id}`}>{exam.code}</Link> <span className="muted small">{exam.title}</span>
                </h2>
                <span className="badge accent">{exam.level}</span>
              </div>
              <RetirementBanner code={exam.code} retirement={exam.retirement} />
              <BetaBanner code={exam.code} beta={exam.beta} />
              {hasPractice ? (
                <>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "14px 0 6px" }}>
                    <span style={{ fontSize: "2.2rem", fontWeight: 700, color: scoreColor(r.overall) }}>{r.overall}%</span>
                    <span className="muted">exam readiness</span>
                  </div>
                  <Bar value={r.overall} />
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "14px 0 6px" }}>
                    <span style={{ fontSize: "2.2rem", fontWeight: 700 }}>
                      {studied}/{learnTotal}
                    </span>
                    <span className="muted">Learn modules studied</span>
                  </div>
                  <Bar value={learnTotal ? (studied / learnTotal) * 100 : 0} />
                </>
              )}
              <ul className="clean small" style={{ marginTop: 12 }}>
                {hasPractice && learnTotal > 0 && (
                  <li>
                    📘 {studied}/{learnTotal} Learn modules studied
                  </li>
                )}
                {hasPractice && (
                  <li>
                    📝 {r.answeredTotal}/{exam.questions.length} questions answered{last ? ` · last session ${last.score}/${last.total}` : ""}
                  </li>
                )}
                {exam.labs.length > 0 && (
                  <li>
                    🧪 {labsDone}/{exam.labs.length} labs completed
                  </li>
                )}
                {exam.flashcards.length > 0 && (
                  <li>
                    🃏 {due} flashcards due · {fresh} new
                  </li>
                )}
              </ul>
              {hasPractice && <div className="callout tip small">{r.recommendation}</div>}
              <div className="btn-row">
                {learnTotal > 0 && (
                  <Link className="btn primary" href={`/exams/${exam.id}/learn`}>
                    Learning paths
                  </Link>
                )}
                {hasPractice && (
                  <Link className="btn" href={`/exams/${exam.id}/practice`}>
                    Practice
                  </Link>
                )}
                {exam.flashcards.length > 0 && (
                  <Link className="btn" href={`/exams/${exam.id}/flashcards`}>
                    Review cards
                  </Link>
                )}
                <Link className="btn" href={`/exams/${exam.id}`}>
                  Skills measured
                </Link>
                {exam.modules.length > 0 && (
                  <Link className="btn" href={`/exams/${exam.id}/plan`}>
                    Study plan
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
