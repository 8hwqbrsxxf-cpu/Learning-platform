import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam } from "@/lib/content";
import { sessions } from "@/lib/db";
import { computeReadiness } from "@/lib/readiness";
import { Bar, Stat, scoreColor } from "@/components/ui";
import ExamTabs from "@/components/ExamTabs";

export const dynamic = "force-dynamic";

export default async function ReadinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = getExam(id);
  if (!exam) notFound();
  const r = computeReadiness(exam);
  const history = sessions(exam.id, 12).reverse();

  return (
    <>
      <h1>{exam.code} · Exam readiness</h1>
      <ExamTabs examId={exam.id} active="/readiness" />
      <div className="grid grid-4">
        <div className="card stat">
          <span className="value" style={{ color: scoreColor(r.overall) }}>{r.overall}%</span>
          <span className="label">Exam readiness</span>
        </div>
        <Stat value={`${r.knowledge}%`} label="Knowledge score" />
        <Stat value={`${r.practical}%`} label="Practical score (labs)" />
        <Stat
          value={r.passLikelihood === null ? "—" : `${r.passLikelihood}%`}
          label={r.passLikelihood === null ? "Pass likelihood: answer ≥ 20 questions" : "Indicative pass likelihood"}
        />
      </div>

      <div className="callout tip" style={{ marginTop: 16 }}>
        <h4>Recommendation</h4>
        {r.recommendation}{" "}
        {r.weak[0] && <Link href={`/exams/${exam.id}/practice?domain=${r.weak[0].domainId}`}>Start a {r.weak[0].name} drill →</Link>}
      </div>

      <div className="card">
        <h2>By domain</h2>
        <table>
          <thead>
            <tr>
              <th>Domain</th>
              <th style={{ width: "28%" }}>Readiness</th>
              <th>Knowledge</th>
              <th>Labs</th>
              <th>Retention</th>
              <th>Coverage</th>
            </tr>
          </thead>
          <tbody>
            {r.domains.map((d) => (
              <tr key={d.domainId}>
                <td>
                  {d.name} <span className="small muted">({d.weight}%)</span>{" "}
                  {d.score < 70 ? <span className="badge bad">weak</span> : d.score >= 85 ? <span className="badge good">strong</span> : null}
                </td>
                <td>
                  <Bar value={d.score} /> <span className="small">{d.score}%</span>
                </td>
                <td>{d.knowledge}%</td>
                <td>{d.labsCompleted}/{d.totalLabs}</td>
                <td>{d.retention === null ? "—" : `${d.retention}%`}</td>
                <td className="small">{d.answered}/{d.totalQuestions} questions</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {history.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2>Practice exam trend</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, padding: "8px 0" }}>
            {history.map((s) => {
              const pct = Math.round((s.score / s.total) * 100);
              return (
                <div key={s.id} title={`${s.finished_at} · ${s.mode} · ${pct}%`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                  <span className="small">{pct}</span>
                  <div style={{ width: "100%", maxWidth: 36, height: `${Math.max(4, pct)}%`, background: scoreColor(pct), borderRadius: 4 }} />
                </div>
              );
            })}
          </div>
          <p className="small muted">Last {history.length} sessions, oldest left. The real exam needs 700/1000.</p>
        </div>
      )}

      <details className="card" style={{ marginTop: 16 }}>
        <summary><strong>How is this calculated?</strong></summary>
        <ul className="small">
          <li><strong>Knowledge</strong>: accuracy on your most recent answer to each question, scaled down until you have answered at least 8 questions in a domain.</li>
          <li><strong>Practical</strong>: completed labs per domain (in progress counts half).</li>
          <li><strong>Retention</strong>: share of reviewed flashcards that are not overdue.</li>
          <li><strong>Domain readiness</strong> = 60% knowledge + 30% practical + 10% retention; overall readiness weights domains by the official exam weights.</li>
          <li><strong>Pass likelihood</strong> is an indicative estimate based on readiness, not a guarantee — the real exam uses different questions and scaled scoring.</li>
        </ul>
      </details>
    </>
  );
}
