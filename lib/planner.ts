import type { Exam, KnowledgeModule } from "./content-types";
import type { StudyProfile } from "./db";

export interface PlanWeek {
  week: number;
  startDate: string;
  hours: number;
  phase: string;
  reading: { label: string; href?: string; hours: number }[];
  labs: { label: string; href?: string; hours: number }[];
  practice: { label: string; href?: string; hours: number }[];
  checkpoint: string;
}

export interface StudyPlan {
  weeks: PlanWeek[];
  hoursNeeded: number;
  hoursAvailable: number;
  warning: string | null;
}

type Kind = "reading" | "labs" | "practice";
interface Item {
  kind: Kind;
  label: string;
  href?: string;
  hours: number;
  phase: string;
}

const LEVEL_FACTOR: Record<StudyProfile["level"], number> = { beginner: 1.25, intermediate: 1, advanced: 0.75 };
// Learning philosophy: 20 % theory, 30 % guided practice, 50 % hands-on — shifted slightly by learning style.
const MIX: Record<StudyProfile["learningStyle"], Record<Kind, number>> = {
  reading: { reading: 0.3, practice: 0.3, labs: 0.4 },
  video: { reading: 0.25, practice: 0.3, labs: 0.45 },
  "hands-on": { reading: 0.2, practice: 0.3, labs: 0.5 },
};

const round = (h: number) => Math.round(h * 2) / 2;

/**
 * Builds a week-by-week plan. Domain scores (0-100) make the plan adaptive:
 * weaker domains get up to 50 % more time, strong ones up to 30 % less.
 */
export function generatePlan(
  exam: Exam,
  p: StudyProfile,
  domainScores: Record<string, number> = {},
  today = new Date(),
): StudyPlan {
  const base = `/exams/${exam.id}`;
  const certDiscount = p.existingCerts.trim() ? 0.9 : 1;
  const hoursNeeded = Math.round(exam.estimatedStudyHours * LEVEL_FACTOR[p.level] * certDiscount);
  const days = Math.max(7, Math.ceil((new Date(p.targetDate).getTime() - today.getTime()) / 86_400_000));
  const weeksAvailable = Math.max(1, Math.floor(days / 7));
  const hoursAvailable = Math.round(weeksAvailable * p.hoursPerWeek);

  // Budget split: 70 % learning content, 20 % exam prep + practice exams, 10 % revision.
  const contentBudget = hoursNeeded * 0.7;
  const mix = MIX[p.learningStyle];

  const domainFactor = (domainId: string) => {
    const s = domainScores[domainId];
    if (s === undefined) return 1;
    return Math.min(1.5, Math.max(0.7, 1.5 - s / 125));
  };
  const domainWeightOf = (id: string) => {
    const d = exam.domains.find((x) => x.id === id)!;
    return (d.weightMin + d.weightMax) / 2;
  };
  const modulesPerDomain = (id: string) => exam.modules.filter((m) => m.domainId === id).length || 1;

  // Order modules by roadmap phase, then any not referenced in the roadmap.
  const ordered: { module: KnowledgeModule; phase: string }[] = [];
  const seen = new Set<string>();
  for (const ph of [...exam.roadmap].sort((a, b) => a.phase - b.phase)) {
    for (const id of ph.moduleIds) {
      const m = exam.modules.find((x) => x.id === id);
      if (m && !seen.has(id)) {
        ordered.push({ module: m, phase: `Phase ${ph.phase} · ${ph.title}` });
        seen.add(id);
      }
    }
  }
  for (const m of exam.modules) if (!seen.has(m.id)) ordered.push({ module: m, phase: "Core Technical Skills" });

  const rawWeights = ordered.map(({ module: m }) => (domainWeightOf(m.domainId) / modulesPerDomain(m.domainId)) * domainFactor(m.domainId));
  const totalRaw = rawWeights.reduce((a, b) => a + b, 0) || 1;

  const items: Item[] = [];
  ordered.forEach(({ module: m, phase }, i) => {
    const h = (contentBudget * rawWeights[i]) / totalRaw;
    const learn = exam.domains.find((d) => d.id === m.domainId)?.learnPaths[0];
    items.push({
      kind: "reading",
      phase,
      label: `${m.title}${p.learningStyle === "video" && learn ? " (+ video units in the Learn path)" : ""}`,
      href: `${base}/modules/${m.id}`,
      hours: h * mix.reading,
    });
    items.push({ kind: "practice", phase, label: `Knowledge check + flashcards: ${m.title}`, href: `${base}/practice?module=${m.id}`, hours: h * mix.practice });
    const labs = m.labIds.map((id) => exam.labs.find((l) => l.id === id)).filter(Boolean);
    if (labs.length) {
      for (const l of labs) items.push({ kind: "labs", phase, label: l!.title, href: `${base}/labs/${l!.id}`, hours: (h * mix.labs) / labs.length });
    } else {
      items.push({ kind: "labs", phase, label: `Hands-on: reproduce the real-world example of "${m.title}" in your test tenant`, hours: h * mix.labs });
    }
  });

  // Exam preparation: domain drills on the weakest domains, then full practice exams.
  const prep = hoursNeeded * 0.2;
  const drillDomains = [...exam.domains].sort((a, b) => (domainScores[a.id] ?? 50) - (domainScores[b.id] ?? 50));
  drillDomains.forEach((d) =>
    items.push({ kind: "practice", phase: "Exam Preparation", label: `Domain drill: ${d.name}`, href: `${base}/practice?domain=${d.id}`, hours: (prep * 0.4) / drillDomains.length }),
  );
  const fullExams = Math.max(2, Math.round((prep * 0.6) / 2.5));
  for (let i = 1; i <= fullExams; i++) {
    items.push({ kind: "practice", phase: "Practice Exams", label: `Full timed practice exam #${i} + review every wrong answer`, href: `${base}/practice?mode=full`, hours: (prep * 0.6) / fullExams });
  }
  const rev = hoursNeeded * 0.1;
  items.push({ kind: "reading", phase: "Revision", label: "Revision notes of all modules", href: base, hours: rev * 0.4 });
  items.push({ kind: "practice", phase: "Revision", label: "Flashcards: clear all due cards daily", href: `${base}/flashcards`, hours: rev * 0.4 });
  items.push({ kind: "practice", phase: "Revision", label: "Weak-area practice exam", href: `${base}/practice?mode=weak`, hours: rev * 0.2 });

  // Pack items into weeks. If time is short, compress everything proportionally.
  const scale = hoursAvailable < hoursNeeded ? hoursAvailable / hoursNeeded : 1;
  const perWeek = scale < 1 ? p.hoursPerWeek : Math.min(p.hoursPerWeek, Math.ceil((hoursNeeded / weeksAvailable) * 2) / 2 + 1);
  const weeks: PlanWeek[] = [];
  let current: PlanWeek | null = null;
  const newWeek = (phase: string): PlanWeek => {
    const n = weeks.length + 1;
    const start = new Date(today.getTime() + (n - 1) * 7 * 86_400_000);
    const w: PlanWeek = { week: n, startDate: start.toISOString().slice(0, 10), hours: 0, phase, reading: [], labs: [], practice: [], checkpoint: "" };
    weeks.push(w);
    return w;
  };

  for (const item of items) {
    let remaining = item.hours * scale;
    while (remaining > 0.25) {
      if (!current || current.hours >= perWeek - 0.25) current = newWeek(item.phase);
      const take = Math.min(remaining, perWeek - current.hours);
      const list = current[item.kind];
      const existing = list.find((x) => x.label === item.label);
      if (existing) existing.hours += take;
      else list.push({ label: item.label, href: item.href, hours: take });
      current.hours += take;
      remaining -= take;
    }
  }

  for (const w of weeks) {
    w.hours = round(w.hours);
    for (const k of ["reading", "labs", "practice"] as const) w[k] = w[k].map((x) => ({ ...x, hours: Math.max(0.5, round(x.hours)) }));
  }
  weeks.forEach((w, i) => {
    const last = i === weeks.length - 1;
    w.checkpoint = last
      ? "Final check: readiness ≥ 80 % in every domain and a full practice exam ≥ 80 %. Book or confirm your exam."
      : w.labs.length
        ? `Complete the knowledge checks of this week with ≥ 80 % and mark the labs as completed in the lab tracker.`
        : `Score ≥ 75 % on this week's practice sets; review every explanation of a wrong answer.`;
  });

  const retiresBeforeTarget = exam.retirement && p.targetDate > exam.retirement.date;
  const warning = retiresBeforeTarget
    ? `${exam.code} retires on ${exam.retirement!.date}, before your target date. Move the exam date forward` +
      (exam.retirement!.successor ? ` or plan for ${exam.retirement!.successor} instead.` : ".")
    : hoursAvailable < hoursNeeded
      ? `You have about ${hoursAvailable} h until the target date but this exam typically needs ~${hoursNeeded} h at your level. ` +
        `The plan is compressed; consider ${Math.ceil(hoursNeeded / weeksAvailable)} h/week or moving the exam date.`
      : null;

  return { weeks, hoursNeeded, hoursAvailable, warning };
}
