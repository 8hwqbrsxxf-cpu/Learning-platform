import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam } from "@/lib/content";
import { labProgress } from "@/lib/db";
import LabTracker from "@/components/LabTracker";
import { Callout, LevelBadge, Markdown } from "@/components/ui";
import ExamTabs from "@/components/ExamTabs";

export const dynamic = "force-dynamic";

export default async function LabPage({ params }: { params: Promise<{ id: string; labId: string }> }) {
  const { id, labId } = await params;
  const exam = getExam(id);
  const lab = exam?.labs.find((l) => l.id === labId);
  if (!exam || !lab) notFound();
  const p = labProgress(exam.id).get(lab.id);

  return (
    <>
      <p className="small muted">
        <Link href={`/exams/${exam.id}/labs`}>{exam.code} labs</Link> › {lab.technology}
      </p>
      <h1>🧪 {lab.title}</h1>
      <div className="btn-row">
        <LevelBadge level={lab.difficulty} />
        <span className="badge">~{lab.estimatedMinutes} min</span>
        <span className="badge accent">{exam.domains.find((d) => d.id === lab.domainId)?.name}</span>
      </div>
      <ExamTabs examId={exam.id} active="/labs" />

      <div className="grid" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
        <div className="card">
          <h2>Objective</h2>
          <Markdown>{lab.objective}</Markdown>
          <h2>Requirements</h2>
          <ul>{lab.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
        <div className="card">
          <h2>Step-by-step instructions</h2>
          {lab.steps.map((s, i) => (
            <div key={i}>
              <h3>Step {i + 1}. {s.title}</h3>
              <Markdown>{s.instructions}</Markdown>
            </div>
          ))}
        </div>
        <div className="card">
          <Callout kind="lab" title="✔ Validation" items={lab.validation} />
          <Callout kind="warn" title="🔧 Troubleshooting" items={lab.troubleshooting} />
          <Callout kind="tip" title="🧹 Cleanup" items={lab.cleanup} />
        </div>
        <div className="card">
          <h2>Track your progress</h2>
          <LabTracker examId={exam.id} labId={lab.id} initialStatus={p?.status ?? "not_started"} initialNotes={p?.notes ?? ""} />
        </div>
        <div className="card">
          <h2>References</h2>
          <ul className="clean">
            {lab.references.map((r) => (
              <li key={r.url}>📚 <a href={r.url} target="_blank" rel="noreferrer">{r.title}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
