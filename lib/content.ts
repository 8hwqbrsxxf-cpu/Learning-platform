import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { CatalogEntry, Exam, LearningPathCollection } from "./content-types";

const EXAM_DIR = path.join(process.cwd(), "content", "exams");

let cache: Map<string, Exam> | null = null;

function loadAll(): Map<string, Exam> {
  // Re-read in development so content edits show up without a restart.
  if (cache && process.env.NODE_ENV === "production") return cache;
  const map = new Map<string, Exam>();
  if (fs.existsSync(EXAM_DIR)) {
    for (const file of fs.readdirSync(EXAM_DIR).filter((f) => f.endsWith(".json"))) {
      const exam = JSON.parse(fs.readFileSync(path.join(EXAM_DIR, file), "utf8")) as Exam;
      map.set(exam.id, exam);
    }
  }
  cache = map;
  return map;
}

export function getExams(): Exam[] {
  return [...loadAll().values()].sort((a, b) => a.code.localeCompare(b.code));
}

export function getExam(id: string): Exam | undefined {
  return loadAll().get(id);
}

const PATHS_DIR = path.join(process.cwd(), "content", "learning-paths");

export function getLearningPaths(examId: string): LearningPathCollection | undefined {
  const file = path.join(PATHS_DIR, `${examId}.json`);
  if (!/^[a-z0-9-]+$/.test(examId) || !fs.existsSync(file)) return undefined;
  return JSON.parse(fs.readFileSync(file, "utf8")) as LearningPathCollection;
}

export function domainWeight(d: { weightMin: number; weightMax: number }): number {
  return (d.weightMin + d.weightMax) / 2;
}

// Full certification catalog. Exams with a content file are marked available.
const CATALOG: Omit<CatalogEntry, "available">[] = [
  { code: "MS-900", title: "Microsoft 365 Fundamentals", level: "Fundamentals", track: "Microsoft 365" },
  { code: "AZ-900", title: "Azure Fundamentals", level: "Fundamentals", track: "Azure" },
  { code: "SC-900", title: "Security, Compliance, and Identity Fundamentals", level: "Fundamentals", track: "Security" },
  { code: "AI-900", title: "Azure AI Fundamentals", level: "Fundamentals", track: "AI" },
  { code: "DP-900", title: "Azure Data Fundamentals", level: "Fundamentals", track: "Data" },
  { code: "PL-900", title: "Power Platform Fundamentals", level: "Fundamentals", track: "Power Platform" },
  { code: "MD-102", title: "Endpoint Administrator", level: "Associate", track: "Microsoft 365" },
  { code: "MS-102", title: "Microsoft 365 Administrator", level: "Expert", track: "Microsoft 365" },
  { code: "AB-900", title: "Microsoft 365 Copilot and Agent Administration Fundamentals", level: "Fundamentals", track: "Microsoft 365" },
  { code: "AB-650", title: "Administering Microsoft 365 and AI Services (beta, replaces the MS-102 course)", level: "Associate", track: "Microsoft 365" },
  { code: "AZ-104", title: "Azure Administrator", level: "Associate", track: "Azure" },
  { code: "AZ-500", title: "Azure Security Engineer", level: "Associate", track: "Security" },
  { code: "SC-300", title: "Identity and Access Administrator", level: "Associate", track: "Security" },
  { code: "SC-200", title: "Security Operations Analyst", level: "Associate", track: "Security" },
  { code: "SC-401", title: "Information Security Administrator", level: "Associate", track: "Security" },
  { code: "PL-300", title: "Power BI Data Analyst", level: "Associate", track: "Data" },
  { code: "AZ-305", title: "Azure Solutions Architect", level: "Expert", track: "Azure" },
  { code: "SC-100", title: "Cybersecurity Architect", level: "Expert", track: "Security" },
];

export function getCatalog(): CatalogEntry[] {
  const available = new Set(getExams().map((e) => e.code));
  return CATALOG.map((c) => ({ ...c, available: available.has(c.code) }));
}
