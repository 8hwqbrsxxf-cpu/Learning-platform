import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam } from "@/lib/content";
import { labProgress } from "@/lib/db";
import { Bar, ExamTabs, LevelBadge, Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

const STATUS = { completed: "✅ Completed", in_progress: "⏳ In progress", not_started: "Not started" } as const;

export default async function Labs({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = getExam(id);
  if (!exam) notFound();
  const progress = labProgress(exam.id);
  const done = exam.labs.filter((l) => progress.get(l.id)?.status === "completed").length;
  const minutes = exam.labs.reduce((s, l) => s + l.estimatedMinutes, 0);

  return (
    <>
      <h1>{exam.code} · Hands-on lab tracker</h1>
      <ExamTabs examId={exam.id} active="/labs" />
      <div className="grid grid-4">
        <Stat value={`${done}/${exam.labs.length}`} label="Labs completed" />
        <Stat value={`${Math.round(minutes / 60)} h`} label="Total lab time" />
      </div>
      <div style={{ margin: "12px 0 20px" }}>
        <Bar value={exam.labs.length ? (done / exam.labs.length) * 100 : 0} />
      </div>
      <div className="callout warn small">
        Run labs in a <strong>test or developer tenant</strong>, never in a customer production tenant. Policies such as Conditional Access can
        lock out users. Every lab has a cleanup section.
      </div>
      <table>
        <thead>
          <tr><th>Lab</th><th>Technology</th><th>Level</th><th>Time</th><th>Status</th></tr>
        </thead>
        <tbody>
          {exam.labs.map((l) => {
            const p = progress.get(l.id);
            return (
              <tr key={l.id}>
                <td><Link href={`/exams/${exam.id}/labs/${l.id}`}>{l.title}</Link></td>
                <td>{l.technology}</td>
                <td><LevelBadge level={l.difficulty} /></td>
                <td>{l.estimatedMinutes} min</td>
                <td>{STATUS[p?.status ?? "not_started"]}{p?.updated_at && p.status !== "not_started" ? <span className="small muted"> · {p.updated_at.slice(0, 10)}</span> : null}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
