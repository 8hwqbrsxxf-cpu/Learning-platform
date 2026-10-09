import Link from "next/link";
import { getExam, getLearningPaths } from "@/lib/content";

type TabPath = "/learn" | "" | "/plan" | "/practice" | "/flashcards" | "/labs" | "/readiness";

// Tabs only appear for content the exam actually has (e.g. an exam can have learning paths but no practice questions yet).
export default function ExamTabs({ examId, active }: { examId: string; active: TabPath }) {
  const exam = getExam(examId);
  const tabs: [TabPath, string, boolean][] = [
    ["/learn", "Learning paths", Boolean(getLearningPaths(examId))],
    ["", "Overview", true],
    ["/plan", "Study plan", Boolean(exam?.modules.length)],
    ["/practice", "Practice exam", Boolean(exam?.questions.length)],
    ["/flashcards", "Flashcards", Boolean(exam?.flashcards.length)],
    ["/labs", "Labs", Boolean(exam?.labs.length)],
    ["/readiness", "Readiness", Boolean(exam?.questions.length)],
  ];
  return (
    <nav className="tabs">
      {tabs
        .filter(([, , show]) => show)
        .map(([path, label]) => (
          <Link key={path} href={`/exams/${examId}${path}`} className={path === active ? "active" : ""}>
            {label}
          </Link>
        ))}
    </nav>
  );
}
