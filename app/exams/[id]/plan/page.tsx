import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam } from "@/lib/content";
import { getProfile } from "@/lib/db";
import { generatePlan } from "@/lib/planner";
import { computeReadiness } from "@/lib/readiness";
import StudyProfileForm from "@/components/StudyProfileForm";
import { RetirementBanner } from "@/components/ui";
import ExamTabs from "@/components/ExamTabs";

export const dynamic = "force-dynamic";

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = getExam(id);
  if (!exam) notFound();
  const profile = getProfile(exam.id);
  const r = computeReadiness(exam);
  // Only adapt to domain scores once there is real data.
  const scores = r.answeredTotal >= 10 ? Object.fromEntries(r.domains.map((d) => [d.domainId, d.score])) : {};
  const plan = profile ? generatePlan(exam, profile, scores) : null;

  const defaultDate = new Date(Date.now() + 56 * 86_400_000).toISOString().slice(0, 10);

  return (
    <>
      <h1>{exam.code} · Personal study plan</h1>
      <ExamTabs examId={exam.id} active="/plan" />
      <RetirementBanner code={exam.code} retirement={exam.retirement} />
      <div className="grid plan-layout">
        <div className="card">
          <h2>Your situation</h2>
          <StudyProfileForm
            examId={exam.id}
            initial={profile ?? { hoursPerWeek: 6, targetDate: defaultDate, level: "intermediate", existingCerts: "", learningStyle: "hands-on" }}
          />
        </div>
        <div>
          {!plan && <div className="card">Fill in your situation to generate a week-by-week plan.</div>}
          {plan && (
            <>
              <div className="card">
                <strong>{plan.weeks.length} weeks</strong> · ~{plan.hoursNeeded} h needed · {plan.hoursAvailable} h available until {profile!.targetDate}
                {Object.keys(scores).length > 0 && <div className="small muted">Adaptive: weaker domains get more time based on your readiness scores.</div>}
                {plan.warning && <div className="callout warn small">{plan.warning}</div>}
              </div>
              {plan.weeks.map((w) => (
                <div key={w.week} className="card week" style={{ marginTop: 12 }}>
                  <div className="btn-row" style={{ justifyContent: "space-between" }}>
                    <h3 style={{ margin: 0 }}>Week {w.week} <span className="muted small">· from {w.startDate}</span></h3>
                    <span className="badge">{w.phase} · {w.hours} h</span>
                  </div>
                  <div className="grid grid-3" style={{ marginTop: 8 }}>
                    <PlanList title="📘 Reading & videos" items={w.reading} />
                    <PlanList title="🧪 Labs" items={w.labs} />
                    <PlanList title="📝 Practice & flashcards" items={w.practice} />
                  </div>
                  <p className="small" style={{ marginBottom: 0 }}><strong>Checkpoint:</strong> {w.checkpoint}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function PlanList({ title, items }: { title: string; items: { label: string; href?: string; hours: number }[] }) {
  return (
    <div>
      <strong className="small">{title}</strong>
      {items.length === 0 ? (
        <p className="small muted">—</p>
      ) : (
        <ul className="clean small">
          {items.map((i) => (
            <li key={i.label}>
              {i.href ? <Link href={i.href}>{i.label}</Link> : i.label} <span className="muted">· {i.hours} h</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
