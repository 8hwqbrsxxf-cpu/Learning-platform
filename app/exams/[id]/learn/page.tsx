import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam, getLearningPaths } from "@/lib/content";
import { completedModules } from "@/lib/db";
import { Bar, ExamTabs, RetirementBanner } from "@/components/ui";

export const dynamic = "force-dynamic";

const hours = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} h ${min % 60 ? `${min % 60} min` : ""}`.trim() : `${min} min`);

export default async function LearningPaths({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = getExam(id);
  const lp = getLearningPaths(id);
  if (!exam || !lp) notFound();
  const done = completedModules(exam.id);
  const all = lp.paths.flatMap((p) => p.modules);
  const studied = all.filter((m) => done.has(m.uid)).length;
  const summarized = all.filter((m) => m.tldr).length;
  const total = all.reduce((s, m) => s + m.durationMinutes, 0);

  return (
    <>
      <h1>{exam.code} · Learning paths</h1>
      <ExamTabs examId={exam.id} active="/learn" />
      <RetirementBanner code={exam.code} retirement={exam.retirement} />
      <p className="muted">
        The official Microsoft Learn learning paths of course {lp.course}, summarized module by module from the Learn content itself. Read the
        summary first, open the module on Microsoft Learn for depth, then mark it as studied.
      </p>
      <div className="card">
        <div className="btn-row" style={{ justifyContent: "space-between" }}>
          <strong>
            {studied}/{all.length} modules studied
          </strong>
          <span className="small muted">
            {lp.paths.length} paths · ~{hours(total)} on Microsoft Learn · {summarized}/{all.length} summarized
          </span>
        </div>
        <div style={{ marginTop: 8 }}>
          <Bar value={all.length ? (studied / all.length) * 100 : 0} />
        </div>
      </div>

      {lp.paths.map((p, i) => {
        const pathDone = p.modules.filter((m) => done.has(m.uid)).length;
        return (
          <section key={p.uid} className="card" style={{ marginTop: 16 }}>
            <div className="btn-row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
              <h2 style={{ margin: 0 }}>
                <span className="muted">{i + 1}.</span> {p.title.replace(/^M[DS]-102\s+/, "")}
              </h2>
              <span className="badge">
                {pathDone}/{p.modules.length} · {hours(p.durationMinutes || p.modules.reduce((s, m) => s + m.durationMinutes, 0))}
              </span>
            </div>
            <p className="small muted">{p.summary}</p>
            <ol className="path-modules">
              {p.modules.map((m) => (
                <li key={m.uid}>
                  <span className="path-check">{done.has(m.uid) ? "✅" : m.tldr ? "📘" : "📄"}</span>
                  <div>
                    {m.tldr ? (
                      <Link href={`/exams/${exam.id}/learn/${m.slug}`}>
                        <strong>{m.title}</strong>
                      </Link>
                    ) : (
                      <strong>{m.title}</strong>
                    )}{" "}
                    <span className="small muted">· {m.durationMinutes} min</span>
                    <div className="small">{m.tldr ?? m.learnSummary}</div>
                    {!m.tldr && (
                      <div className="small muted">
                        Summary coming soon ·{" "}
                        <a href={m.url} target="_blank" rel="noreferrer">
                          open on Microsoft Learn
                        </a>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <a className="small" href={p.url} target="_blank" rel="noreferrer">
              Learning path on Microsoft Learn ↗
            </a>
          </section>
        );
      })}
      <p className="small muted">Structure retrieved from the Microsoft Learn catalog on {lp.retrieved}.</p>
    </>
  );
}
