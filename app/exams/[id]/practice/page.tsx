import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam } from "@/lib/content";
import type { Question } from "@/lib/content-types";
import { latestAttempts, sessions } from "@/lib/db";
import { computeReadiness } from "@/lib/readiness";
import Quiz, { type QuizQuestion } from "@/components/Quiz";
import ExamTabs from "@/components/ExamTabs";

export const dynamic = "force-dynamic";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function prepare(qs: Question[]): QuizQuestion[] {
  return qs.map((q) => {
    if (q.type !== "sequence") return q;
    let order = shuffle(q.options.map((o) => o.id));
    if (order.every((id, i) => id === q.correct[i])) order = [...order.slice(1), order[0]];
    return { ...q, initialOrder: order };
  });
}

type SP = { mode?: string; domain?: string; module?: string; count?: string };

export default async function Practice({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SP> }) {
  const { id } = await params;
  const sp = await searchParams;
  const exam = getExam(id);
  if (!exam) notFound();
  const domainNames = Object.fromEntries(exam.domains.map((d) => [d.id, d.name]));

  let selection: Question[] | null = null;
  let title = "";
  let examMode = false;
  let timeLimit: number | undefined;
  let mode = "practice";

  if (sp.mode === "full") {
    const n = Math.min(Number(sp.count) || 50, exam.questions.length);
    selection = shuffle(exam.questions).slice(0, n);
    title = `Full practice exam (${n} questions)`;
    examMode = true;
    timeLimit = exam.durationMinutes ? Math.round((exam.durationMinutes * n) / 50) : undefined;
    mode = "full";
  } else if (sp.mode === "diagnostic") {
    // A few questions per domain to seed the readiness model.
    selection = shuffle(exam.domains.flatMap((d) => shuffle(exam.questions.filter((q) => q.domainId === d.id)).slice(0, 4)));
    title = "Diagnostic test";
    mode = "diagnostic";
  } else if (sp.mode === "weak") {
    const r = computeReadiness(exam);
    const weakDomains = new Set((r.weak.length ? r.weak : r.domains.slice().sort((a, b) => a.score - b.score).slice(0, 2)).map((d) => d.domainId));
    const missed = new Set(latestAttempts(exam.id).filter((a) => !a.correct).map((a) => a.question_id));
    const pool = exam.questions.filter((q) => missed.has(q.id) || weakDomains.has(q.domainId));
    selection = shuffle(pool).slice(0, 20);
    title = "Weak-area practice";
    mode = "weak";
  } else if (sp.domain) {
    selection = shuffle(exam.questions.filter((q) => q.domainId === sp.domain));
    title = `Domain drill: ${domainNames[sp.domain] ?? sp.domain}`;
    mode = "domain";
  } else if (sp.module) {
    const m = exam.modules.find((x) => x.id === sp.module);
    selection = shuffle(exam.questions.filter((q) => q.moduleId === sp.module));
    title = `Knowledge check: ${m?.title ?? sp.module}`;
    mode = "module";
  }

  if (selection) {
    return (
      <>
        <h1>{exam.code} · {title}</h1>
        <ExamTabs examId={exam.id} active="/practice" />
        <Quiz
          key={JSON.stringify(sp)}
          examId={exam.id}
          mode={mode}
          title={title}
          questions={prepare(selection)}
          domainNames={domainNames}
          examMode={examMode}
          timeLimitMinutes={timeLimit}
        />
      </>
    );
  }

  const history = sessions(exam.id, 8);
  return (
    <>
      <h1>{exam.code} · Practice exams</h1>
      <ExamTabs examId={exam.id} active="/practice" />
      <p className="muted">
        All questions are original and written for understanding — no exam dumps. Every answer comes with the reasoning, why the other options
        are wrong, the skill measured and a Microsoft Learn reference. Formats: multiple choice, multiple response, sequence, yes/no statements
        (hot-area style) and case-study scenarios.
      </p>
      <div className="grid grid-3">
        <Link href="?mode=diagnostic" className="card">
          <h3>🩺 Diagnostic</h3>
          <p className="small muted">~4 questions per domain with instant feedback. Start here to seed your readiness score.</p>
        </Link>
        <Link href="?mode=full" className="card">
          <h3>⏱ Full timed exam</h3>
          <p className="small muted">Up to 50 questions, exam timer, feedback only at the end — like the real thing.</p>
        </Link>
        <Link href="?mode=weak" className="card">
          <h3>🎯 Weak areas</h3>
          <p className="small muted">Questions you got wrong plus your weakest domains. Adaptive.</p>
        </Link>
      </div>
      <h2>Domain drills</h2>
      <div className="grid grid-3">
        {exam.domains.map((d) => (
          <Link key={d.id} href={`?domain=${d.id}`} className="card">
            <strong>{d.name}</strong>
            <div className="small muted">{exam.questions.filter((q) => q.domainId === d.id).length} questions · {d.weightMin}–{d.weightMax}% of the exam</div>
          </Link>
        ))}
      </div>
      {history.length > 0 && (
        <>
          <h2>Recent sessions</h2>
          <div className="table-scroll">
            <table>
              <thead>
              <tr><th>Date</th><th>Mode</th><th>Score</th></tr>
            </thead>
            <tbody>
              {history.map((s) => (
                <tr key={s.id}>
                  <td>{s.finished_at.slice(0, 16)}</td>
                  <td>{s.mode}</td>
                  <td>{s.score}/{s.total} ({Math.round((s.score / s.total) * 100)}%)</td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
