import "server-only";
import type { Exam } from "./content-types";
import { domainWeight } from "./content";
import { cardStates, labProgress, latestAttempts } from "./db";

export interface DomainReadiness {
  domainId: string;
  name: string;
  weight: number; // midpoint % of the official weight range
  knowledge: number; // 0-100
  practical: number; // 0-100
  retention: number | null; // 0-100, null when no flashcards reviewed
  score: number; // 0-100 combined
  answered: number;
  totalQuestions: number;
  labsCompleted: number;
  totalLabs: number;
}

export interface Readiness {
  overall: number;
  knowledge: number;
  practical: number;
  domains: DomainReadiness[];
  weak: DomainReadiness[];
  strong: DomainReadiness[];
  passLikelihood: number | null; // indicative only; null when there is not enough data
  answeredTotal: number;
  recommendation: string;
}

// Scoring model (kept deliberately simple and explainable):
// - knowledge  = accuracy on the latest attempt of each question × coverage factor.
//                Coverage factor ramps up to 1 once 8 questions (or all) in the domain were answered,
//                so one lucky answer does not mean 100 %.
// - practical  = completed labs (in-progress counts half) / labs in the domain.
// - retention  = flashcards in the domain that are not overdue and have no recent lapse.
// - domain     = 60 % knowledge + 30 % practical + 10 % retention (weights redistributed when missing).
// - overall    = domain scores weighted by the official domain weights.
export function computeReadiness(exam: Exam): Readiness {
  const attempts = latestAttempts(exam.id);
  const labs = labProgress(exam.id);
  const cards = cardStates(exam.id);
  const now = Date.now();

  const domains: DomainReadiness[] = exam.domains.map((d) => {
    const qs = exam.questions.filter((q) => q.domainId === d.id);
    const ids = new Set(qs.map((q) => q.id));
    const own = attempts.filter((a) => ids.has(a.question_id));
    const correct = own.filter((a) => a.correct).length;
    const coverage = qs.length ? Math.min(1, own.length / Math.min(8, qs.length)) : 0;
    const knowledge = own.length ? (correct / own.length) * coverage * 100 : 0;

    const domainLabs = exam.labs.filter((l) => l.domainId === d.id);
    const labPoints = domainLabs.reduce((s, l) => {
      const st = labs.get(l.id)?.status;
      return s + (st === "completed" ? 1 : st === "in_progress" ? 0.5 : 0);
    }, 0);
    const practical = domainLabs.length ? (labPoints / domainLabs.length) * 100 : knowledge;

    const reviewed = exam.flashcards.filter((f) => f.domainId === d.id && cards.has(f.id));
    const retained = reviewed.filter((f) => {
      const s = cards.get(f.id)!;
      return new Date(s.due).getTime() > now && s.reps > 0;
    });
    const retention = reviewed.length ? (retained.length / reviewed.length) * 100 : null;

    const score =
      retention === null ? knowledge * (2 / 3) + practical * (1 / 3) : knowledge * 0.6 + practical * 0.3 + retention * 0.1;

    return {
      domainId: d.id,
      name: d.name,
      weight: domainWeight(d),
      knowledge: Math.round(knowledge),
      practical: Math.round(practical),
      retention: retention === null ? null : Math.round(retention),
      score: Math.round(score),
      answered: own.length,
      totalQuestions: qs.length,
      labsCompleted: domainLabs.filter((l) => labs.get(l.id)?.status === "completed").length,
      totalLabs: domainLabs.length,
    };
  });

  const totalWeight = domains.reduce((s, d) => s + d.weight, 0) || 1;
  const weighted = (k: "score" | "knowledge" | "practical") =>
    Math.round(domains.reduce((s, d) => s + d[k] * d.weight, 0) / totalWeight);

  const overall = weighted("score");
  const answeredTotal = attempts.length;
  // Logistic curve centred on 72 % readiness. Indicative only — not a prediction of the real exam.
  const passLikelihood = answeredTotal >= 20 ? Math.round(100 / (1 + Math.exp(-(overall - 72) / 6))) : null;

  const sorted = [...domains].sort((a, b) => a.score - b.score);
  const weak = sorted.filter((d) => d.score < 70);
  const strong = sorted.filter((d) => d.score >= 85).reverse();

  let recommendation: string;
  if (answeredTotal === 0) {
    recommendation = "Start with a short diagnostic practice exam so the platform can find your weak domains.";
  } else if (weak.length) {
    const w = weak[0];
    const hours = Math.max(2, Math.round((exam.estimatedStudyHours * (w.weight / 100) * (100 - w.score)) / 100));
    const why =
      w.practical < w.knowledge - 15 ? "more hands-on lab work" : w.answered < w.totalQuestions / 2 ? "more practice questions" : "revising the modules";
    recommendation = `Focus on ${w.name} for the next ${hours} study hours, with emphasis on ${why}.`;
  } else if (overall >= 85) {
    recommendation = "You look exam-ready. Take a full timed practice exam and keep daily flashcard reviews going until exam day.";
  } else {
    recommendation = "Solid base. Raise coverage: answer the remaining questions and complete the open labs.";
  }

  return {
    overall,
    knowledge: weighted("knowledge"),
    practical: weighted("practical"),
    domains,
    weak,
    strong,
    passLikelihood,
    answeredTotal,
    recommendation,
  };
}
