// Schema for exam content in content/exams/<exam-id>.json.
// Content is version-controlled JSON; learner progress lives in SQLite (lib/db.ts).

export type Level = "beginner" | "intermediate" | "expert";

export interface Reference {
  title: string;
  url: string; // prefer learn.microsoft.com
}

export interface Domain {
  id: string; // e.g. "md102-d1"
  name: string;
  weightMin: number; // percentage from the official study guide
  weightMax: number;
  skills: string[]; // "skills measured" bullets (paraphrased)
  learnPaths: Reference[];
}

export interface RoadmapPhase {
  phase: 1 | 2 | 3 | 4 | 5 | 6;
  title: string; // Foundations, Core Technical Skills, Advanced Topics, Exam Preparation, Practice Exams, Revision
  objectives: string[];
  outcomes: string[];
  durationHours: number;
  moduleIds: string[];
  labIds: string[];
  assessment: string;
}

export interface KnowledgeModule {
  id: string;
  domainId: string;
  title: string;
  level: Level;
  estimatedMinutes: number;
  learningObjectives: string[];
  executiveSummary: string; // markdown
  coreConcepts: { term: string; whatItIs: string; whyItExists: string }[];
  deepDive: string; // markdown
  architecture: string; // markdown, how it works under the hood
  realWorldExample: string; // markdown, SMB/MSP scenario
  examTips: string[];
  commonPitfalls: string[];
  fieldExperience: string[];
  revisionNotes: string[];
  labIds: string[];
  references: Reference[];
}

export type QuestionType =
  | "single" // multiple choice, one answer
  | "multiple" // multiple response
  | "truefalse"
  | "sequence" // put options in the correct order
  | "yesno"; // hot-area style: several statements, each Yes/No

export interface Question {
  id: string;
  domainId: string;
  moduleId?: string;
  type: QuestionType;
  difficulty: Level;
  scenario?: string; // optional case-study context
  stem: string;
  options: { id: string; text: string }[]; // for yesno: each option is a statement
  // single/truefalse: [optionId]; multiple: optionIds; sequence: optionIds in correct order;
  // yesno: optionIds of statements whose answer is "Yes"
  correct: string[];
  explanation: string;
  whyOthersWrong: Record<string, string>; // optionId -> reason (may be partial for sequence/yesno)
  skillMeasured: string;
  reference: Reference;
}

export interface Flashcard {
  id: string;
  domainId: string;
  level: Level;
  front: string;
  back: string;
  tags: string[];
}

export interface Lab {
  id: string;
  domainId: string;
  title: string;
  technology: string; // Intune, Entra ID, Defender, Exchange Online, Purview, ...
  difficulty: Level;
  estimatedMinutes: number;
  objective: string;
  requirements: string[]; // licences, roles, test devices
  steps: { title: string; instructions: string }[]; // markdown instructions
  validation: string[];
  troubleshooting: string[];
  cleanup: string[];
  references: Reference[];
}

export interface Exam {
  id: string; // "md-102"
  code: string; // "MD-102"
  title: string;
  certification: string;
  level: "Fundamentals" | "Associate" | "Expert" | "Specialty";
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedStudyHours: number;
  passingScore: number; // 700 of 1000
  durationMinutes: number;
  prerequisites: string[];
  audience: string;
  studyGuideUrl: string;
  lastReviewed: string; // ISO date the content was checked against the study guide
  domains: Domain[];
  roadmap: RoadmapPhase[];
  modules: KnowledgeModule[];
  questions: Question[];
  flashcards: Flashcard[];
  labs: Lab[];
}

// Lightweight catalog entry for exams without full content yet.
export interface CatalogEntry {
  code: string;
  title: string;
  level: Exam["level"];
  track: string;
  available: boolean;
}
