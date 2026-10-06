import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

// Single-learner MVP: progress is stored per exam without a user id.
// Multi-user (Entra ID sign-in) adds a learner_id column to every table.

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "learning.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS question_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  domain_id TEXT NOT NULL,
  correct INTEGER NOT NULL,
  session_id INTEGER,
  answered_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_attempts_exam ON question_attempts(exam_id, question_id);

CREATE TABLE IF NOT EXISTS exam_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  finished_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS flashcard_state (
  card_id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  ease REAL NOT NULL,
  interval_days INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  lapses INTEGER NOT NULL,
  due TEXT NOT NULL,
  last_reviewed TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lab_progress (
  lab_id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_started','in_progress','completed')),
  notes TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS module_progress (
  module_id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS study_profile (
  exam_id TEXT PRIMARY KEY,
  hours_per_week REAL NOT NULL,
  target_date TEXT NOT NULL,
  level TEXT NOT NULL,
  existing_certs TEXT NOT NULL DEFAULT '',
  learning_style TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

const globalForDb = globalThis as unknown as { __db?: Database.Database };

export function db(): Database.Database {
  if (!globalForDb.__db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const conn = new Database(DB_PATH);
    conn.pragma("journal_mode = WAL");
    conn.exec(SCHEMA);
    globalForDb.__db = conn;
  }
  return globalForDb.__db;
}

// ---------- Questions ----------

export interface AttemptRow {
  question_id: string;
  domain_id: string;
  correct: number;
  answered_at: string;
}

export function recordSession(
  examId: string,
  mode: string,
  answers: { questionId: string; domainId: string; correct: boolean }[],
): number {
  const conn = db();
  const tx = conn.transaction(() => {
    const score = answers.filter((a) => a.correct).length;
    const { lastInsertRowid } = conn
      .prepare("INSERT INTO exam_sessions (exam_id, mode, score, total) VALUES (?, ?, ?, ?)")
      .run(examId, mode, score, answers.length);
    const insert = conn.prepare(
      "INSERT INTO question_attempts (exam_id, question_id, domain_id, correct, session_id) VALUES (?, ?, ?, ?, ?)",
    );
    for (const a of answers) insert.run(examId, a.questionId, a.domainId, a.correct ? 1 : 0, lastInsertRowid);
    return Number(lastInsertRowid);
  });
  return tx();
}

/** Most recent attempt per question. */
export function latestAttempts(examId: string): AttemptRow[] {
  return db()
    .prepare(
      `SELECT question_id, domain_id, correct, answered_at FROM question_attempts a
       WHERE exam_id = ? AND id = (SELECT MAX(id) FROM question_attempts b WHERE b.exam_id = a.exam_id AND b.question_id = a.question_id)`,
    )
    .all(examId) as AttemptRow[];
}

export function sessions(examId: string, limit = 10) {
  return db()
    .prepare("SELECT id, mode, score, total, finished_at FROM exam_sessions WHERE exam_id = ? ORDER BY id DESC LIMIT ?")
    .all(examId, limit) as { id: number; mode: string; score: number; total: number; finished_at: string }[];
}

// ---------- Flashcards ----------

export interface CardStateRow {
  card_id: string;
  ease: number;
  interval_days: number;
  reps: number;
  lapses: number;
  due: string;
  last_reviewed: string;
}

export function cardStates(examId: string): Map<string, CardStateRow> {
  const rows = db().prepare("SELECT * FROM flashcard_state WHERE exam_id = ?").all(examId) as CardStateRow[];
  return new Map(rows.map((r) => [r.card_id, r]));
}

export function saveCardState(examId: string, s: CardStateRow) {
  db()
    .prepare(
      `INSERT INTO flashcard_state (card_id, exam_id, ease, interval_days, reps, lapses, due, last_reviewed)
       VALUES (@card_id, @exam_id, @ease, @interval_days, @reps, @lapses, @due, @last_reviewed)
       ON CONFLICT(card_id) DO UPDATE SET ease=@ease, interval_days=@interval_days, reps=@reps, lapses=@lapses,
         due=@due, last_reviewed=@last_reviewed`,
    )
    .run({ ...s, exam_id: examId });
}

// ---------- Labs & modules ----------

export type LabStatus = "not_started" | "in_progress" | "completed";

export function labProgress(examId: string): Map<string, { status: LabStatus; notes: string; updated_at: string }> {
  const rows = db().prepare("SELECT lab_id, status, notes, updated_at FROM lab_progress WHERE exam_id = ?").all(examId) as {
    lab_id: string;
    status: LabStatus;
    notes: string;
    updated_at: string;
  }[];
  return new Map(rows.map((r) => [r.lab_id, r]));
}

export function saveLabProgress(examId: string, labId: string, status: LabStatus, notes: string) {
  db()
    .prepare(
      `INSERT INTO lab_progress (lab_id, exam_id, status, notes, updated_at) VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(lab_id) DO UPDATE SET status=excluded.status, notes=excluded.notes, updated_at=excluded.updated_at`,
    )
    .run(labId, examId, status, notes);
}

export function completedModules(examId: string): Set<string> {
  const rows = db().prepare("SELECT module_id FROM module_progress WHERE exam_id = ?").all(examId) as { module_id: string }[];
  return new Set(rows.map((r) => r.module_id));
}

export function setModuleCompleted(examId: string, moduleId: string, completed: boolean) {
  if (completed) {
    db().prepare("INSERT OR IGNORE INTO module_progress (module_id, exam_id) VALUES (?, ?)").run(moduleId, examId);
  } else {
    db().prepare("DELETE FROM module_progress WHERE module_id = ?").run(moduleId);
  }
}

// ---------- Study profile ----------

export interface StudyProfile {
  hoursPerWeek: number;
  targetDate: string; // YYYY-MM-DD
  level: "beginner" | "intermediate" | "advanced";
  existingCerts: string;
  learningStyle: "reading" | "video" | "hands-on";
}

export function getProfile(examId: string): StudyProfile | null {
  const r = db().prepare("SELECT * FROM study_profile WHERE exam_id = ?").get(examId) as
    | { hours_per_week: number; target_date: string; level: string; existing_certs: string; learning_style: string }
    | undefined;
  if (!r) return null;
  return {
    hoursPerWeek: r.hours_per_week,
    targetDate: r.target_date,
    level: r.level as StudyProfile["level"],
    existingCerts: r.existing_certs,
    learningStyle: r.learning_style as StudyProfile["learningStyle"],
  };
}

export function saveProfile(examId: string, p: StudyProfile) {
  db()
    .prepare(
      `INSERT INTO study_profile (exam_id, hours_per_week, target_date, level, existing_certs, learning_style, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(exam_id) DO UPDATE SET hours_per_week=excluded.hours_per_week, target_date=excluded.target_date,
         level=excluded.level, existing_certs=excluded.existing_certs, learning_style=excluded.learning_style,
         updated_at=excluded.updated_at`,
    )
    .run(examId, p.hoursPerWeek, p.targetDate, p.level, p.existingCerts, p.learningStyle);
}
