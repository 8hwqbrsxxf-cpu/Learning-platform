import Link from "next/link";
import { notFound } from "next/navigation";
import { domainWeight, getExam } from "@/lib/content";
import { completedModules, labProgress } from "@/lib/db";
import { computeReadiness } from "@/lib/readiness";
import { Bar, ExamTabs, LevelBadge, RetirementBanner, Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ExamOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = getExam(id);
  if (!exam) notFound();
  const r = computeReadiness(exam);
  const done = completedModules(exam.id);
  const labs = labProgress(exam.id);

  return (
    <>
      <h1>
        {exam.code} · {exam.title}
      </h1>
      <p className="muted">{exam.certification}</p>
      <ExamTabs examId={exam.id} active="" />
      <RetirementBanner code={exam.code} retirement={exam.retirement} />

      <div className="grid grid-4">
        <Stat value={`${r.overall}%`} label="Exam readiness" />
        <Stat value={"★".repeat(exam.difficulty) + "☆".repeat(5 - exam.difficulty)} label="Difficulty" />
        <Stat value={`~${exam.estimatedStudyHours} h`} label="Estimated study time" />
        <Stat value={`${exam.passingScore}/1000`} label={`Passing score · ${exam.durationMinutes} min`} />
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h2>Who is it for</h2>
          <p>{exam.audience}</p>
          <h3>Prerequisites</h3>
          <ul>
            {exam.prerequisites.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <p className="small muted">
            Content checked against the <a href={exam.studyGuideUrl} target="_blank" rel="noreferrer">official study guide</a> on{" "}
            {exam.lastReviewed}. Microsoft updates skills measured regularly — always verify before booking.
          </p>
        </div>
        <div className="card">
          <h2>Skills measured</h2>
          {exam.domains.map((d) => {
            const dr = r.domains.find((x) => x.domainId === d.id)!;
            return (
              <div key={d.id} className="domain-row">
                <span>
                  {d.name} <span className="muted small">({d.weightMin}–{d.weightMax}%)</span>
                </span>
                <Bar value={dr.score} />
                <strong>{dr.score}%</strong>
              </div>
            );
          })}
        </div>
      </div>

      <h2>Learning roadmap</h2>
      <div className="grid">
        {[...exam.roadmap]
          .sort((a, b) => a.phase - b.phase)
          .map((phase) => (
            <div key={phase.phase} className="card">
              <div className="btn-row" style={{ justifyContent: "space-between" }}>
                <h3 style={{ margin: 0 }}>
                  Phase {phase.phase} · {phase.title}
                </h3>
                <span className="badge">{phase.durationHours} h</span>
              </div>
              <div className="grid grid-2" style={{ marginTop: 8 }}>
                <div>
                  <strong className="small">Objectives</strong>
                  <ul className="small">
                    {phase.objectives.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                  <strong className="small">Learning outcomes</strong>
                  <ul className="small">
                    {phase.outcomes.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  {phase.moduleIds.length > 0 && (
                    <>
                      <strong className="small">Modules</strong>
                      <ul className="clean small">
                        {phase.moduleIds.map((mid) => {
                          const m = exam.modules.find((x) => x.id === mid);
                          return m ? (
                            <li key={mid}>
                              {done.has(mid) ? "✅" : "📘"} <Link href={`/exams/${exam.id}/modules/${mid}`}>{m.title}</Link> <LevelBadge level={m.level} />
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </>
                  )}
                  {phase.labIds.length > 0 && (
                    <>
                      <strong className="small">Labs</strong>
                      <ul className="clean small">
                        {phase.labIds.map((lid) => {
                          const l = exam.labs.find((x) => x.id === lid);
                          const st = labs.get(lid)?.status;
                          return l ? (
                            <li key={lid}>
                              {st === "completed" ? "✅" : st === "in_progress" ? "⏳" : "🧪"} <Link href={`/exams/${exam.id}/labs/${lid}`}>{l.title}</Link>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </>
                  )}
                  <p className="small">
                    <strong>Assessment:</strong> {phase.assessment}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>

      <h2>Microsoft Learn</h2>
      <div className="grid grid-2">
        {exam.domains.map((d) => (
          <div key={d.id} className="card">
            <h3>
              {d.name} <span className="muted small">· {domainWeight(d)}%</span>
            </h3>
            <ul className="small">
              {d.skills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
            <ul className="clean small">
              {d.learnPaths.map((l) => (
                <li key={l.url}>
                  📚 <a href={l.url} target="_blank" rel="noreferrer">{l.title}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
