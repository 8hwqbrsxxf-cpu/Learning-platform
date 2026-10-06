import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam } from "@/lib/content";
import { completedModules } from "@/lib/db";
import { Callout, ExamTabs, LevelBadge, Markdown } from "@/components/ui";
import ModuleCompleteToggle from "@/components/ModuleCompleteToggle";

export const dynamic = "force-dynamic";

export default async function ModulePage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const { id, moduleId } = await params;
  const exam = getExam(id);
  const m = exam?.modules.find((x) => x.id === moduleId);
  if (!exam || !m) notFound();
  const domain = exam.domains.find((d) => d.id === m.domainId);
  const questions = exam.questions.filter((q) => q.moduleId === m.id);
  const flashcards = exam.flashcards.filter((f) => f.domainId === m.domainId).slice(0, 6);
  const labs = m.labIds.map((lid) => exam.labs.find((l) => l.id === lid)).filter((l) => l !== undefined);

  return (
    <>
      <p className="small muted">
        <Link href={`/exams/${exam.id}`}>{exam.code}</Link> › {domain?.name}
      </p>
      <h1>{m.title}</h1>
      <div className="btn-row">
        <LevelBadge level={m.level} />
        <span className="badge">~{m.estimatedMinutes} min</span>
        <ModuleCompleteToggle examId={exam.id} moduleId={m.id} initial={completedModules(exam.id).has(m.id)} />
      </div>
      <ExamTabs examId={exam.id} active="" />

      <div className="grid" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
        <div className="card">
          <h2>Learning objectives</h2>
          <ul>{m.learningObjectives.map((o, i) => <li key={i}>{o}</li>)}</ul>
          <h2>Executive summary</h2>
          <Markdown>{m.executiveSummary}</Markdown>
        </div>

        <div className="card">
          <h2>Core concepts</h2>
          <table>
            <thead>
              <tr><th>Concept</th><th>What it is</th><th>Why it exists</th></tr>
            </thead>
            <tbody>
              {m.coreConcepts.map((c) => (
                <tr key={c.term}><td><strong>{c.term}</strong></td><td>{c.whatItIs}</td><td>{c.whyItExists}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2>Technical deep dive</h2>
          <Markdown>{m.deepDive}</Markdown>
          <h2>Architecture – how it works</h2>
          <Markdown>{m.architecture}</Markdown>
        </div>

        <div className="card">
          <h2>Real-world example</h2>
          <Markdown>{m.realWorldExample}</Markdown>
          <Callout kind="lab" title="🛠 Field experience" items={m.fieldExperience} />
        </div>

        <div className="card">
          <Callout kind="tip" title="🎯 Exam tips" items={m.examTips} />
          <Callout kind="warn" title="⚠️ Common pitfalls" items={m.commonPitfalls} />
        </div>

        <div className="card">
          <h2>Practice</h2>
          <div className="btn-row">
            {questions.length > 0 && (
              <Link className="btn primary" href={`/exams/${exam.id}/practice?module=${m.id}`}>
                Knowledge check ({questions.length} questions)
              </Link>
            )}
            <Link className="btn" href={`/coach?exam=${exam.id}&prompt=${encodeURIComponent(`Quiz me on "${m.title}" with one scenario question at a time.`)}`}>
              Quiz me with the AI coach
            </Link>
          </div>
          {labs.length > 0 && (
            <>
              <h3>Lab exercises</h3>
              <ul className="clean">
                {labs.map((l) => (
                  <li key={l.id}>🧪 <Link href={`/exams/${exam.id}/labs/${l.id}`}>{l.title}</Link> <span className="muted small">· {l.estimatedMinutes} min</span></li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="card">
          <h2>Revision notes</h2>
          <ul>{m.revisionNotes.map((n, i) => <li key={i}>{n}</li>)}</ul>
          {flashcards.length > 0 && (
            <>
              <h3>Flashcards from this domain</h3>
              {flashcards.map((f) => (
                <p key={f.id} className="small"><strong>Q:</strong> {f.front}<br /><strong>A:</strong> {f.back}</p>
              ))}
              <Link href={`/exams/${exam.id}/flashcards`}>Review with spaced repetition →</Link>
            </>
          )}
        </div>

        <div className="card">
          <h2>References</h2>
          <ul className="clean">
            {m.references.map((r) => (
              <li key={r.url}>📚 <a href={r.url} target="_blank" rel="noreferrer">{r.title}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
