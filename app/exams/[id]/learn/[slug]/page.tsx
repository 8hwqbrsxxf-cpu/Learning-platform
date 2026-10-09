import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam, getLearningPaths } from "@/lib/content";
import { completedModules } from "@/lib/db";
import StudiedToggle from "@/components/StudiedToggle";
import { Callout, Markdown } from "@/components/ui";
import ExamTabs from "@/components/ExamTabs";

export const dynamic = "force-dynamic";

export default async function ModuleSummaryPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id, slug } = await params;
  const exam = getExam(id);
  const lp = getLearningPaths(id);
  const flat = lp?.paths.flatMap((p, pi) => p.modules.map((m) => ({ m, path: p, pi }))) ?? [];
  const idx = flat.findIndex((x) => x.m.slug === slug);
  if (!exam || !lp || idx < 0 || !flat[idx].m.tldr) notFound();
  const { m, path, pi } = flat[idx];
  const prev = flat.slice(0, idx).reverse().find((x) => x.m.tldr);
  const next = flat.slice(idx + 1).find((x) => x.m.tldr);

  return (
    <>
      <p className="small muted">
        <Link href={`/exams/${exam.id}/learn`}>{exam.code} learning paths</Link> › {pi + 1}. {path.title.replace(/^M[DS]-102\s+/, "")}
      </p>
      <h1>{m.title}</h1>
      <div className="btn-row">
        <span className="badge">~{m.durationMinutes} min on Learn</span>
        <StudiedToggle examId={exam.id} uid={m.uid} initial={completedModules(exam.id).has(m.uid)} />
        <a className="btn" href={m.url} target="_blank" rel="noreferrer">
          Open on Microsoft Learn ↗
        </a>
      </div>
      <ExamTabs examId={exam.id} active="/learn" />

      <div className="reading">
        <div className="card tldr">
          <div className="small muted">In one glance</div>
          <p>{m.tldr}</p>
        </div>

        {m.keyPoints && (
          <div className="card">
            <h2>Remember these</h2>
            <ol className="keypoints">
              {m.keyPoints.map((k, i) => (
                <li key={i}>
                  <Markdown>{k}</Markdown>
                </li>
              ))}
            </ol>
          </div>
        )}

        {m.tables?.map((t) => (
          <div key={t.title} className="card">
            <h2>{t.title}</h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    {t.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((r, i) => (
                    <tr key={i}>
                      {r.map((c, j) => (
                        <td key={j}>{j === 0 ? <strong>{c}</strong> : c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {m.units && (
          <div className="card">
            <h2>Unit by unit</h2>
            {m.units.map((u) => (
              <details key={u.url} className="unit">
                <summary>
                  <strong>{u.title}</strong>
                  {u.minutes ? <span className="small muted"> · {u.minutes} min</span> : null}
                </summary>
                <ul>
                  {u.points.map((pt, i) => (
                    <li key={i}>
                      <Markdown>{pt}</Markdown>
                    </li>
                  ))}
                </ul>
                <a className="small" href={u.url} target="_blank" rel="noreferrer">
                  Read this unit on Learn ↗
                </a>
              </details>
            ))}
          </div>
        )}

        {m.keyTerms && (
          <div className="card">
            <h2>Key terms</h2>
            <dl className="terms">
              {m.keyTerms.map((t) => (
                <div key={t.term}>
                  <dt>{t.term}</dt>
                  <dd>{t.definition}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {m.remember && <Callout kind="tip" title="🎯 Exam memory hooks" items={m.remember} />}

        {m.selfCheck && (
          <div className="card">
            <h2>Check yourself</h2>
            {m.selfCheck.map((s, i) => (
              <details key={i} className="unit">
                <summary>{s.q}</summary>
                <p>{s.a}</p>
              </details>
            ))}
          </div>
        )}

        {m.objectives && (
          <div className="card">
            <h2>Learning objectives (Microsoft Learn)</h2>
            <ul>
              {m.objectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="btn-row" style={{ justifyContent: "space-between", marginTop: 8 }}>
          {prev ? (
            <Link className="btn" href={`/exams/${exam.id}/learn/${prev.m.slug}`}>
              ← {prev.m.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link className="btn primary" href={`/exams/${exam.id}/learn/${next.m.slug}`}>
              {next.m.title} →
            </Link>
          )}
        </div>
        <p className="small muted">Summarized from the Microsoft Learn module on {m.summarizedOn}. Module last updated on Learn: {m.updated}.</p>
      </div>
    </>
  );
}
