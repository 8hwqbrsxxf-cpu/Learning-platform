import Link from "next/link";
import { getCatalog } from "@/lib/content";

export default function Catalog() {
  const catalog = getCatalog();
  const levels = ["Fundamentals", "Associate", "Expert", "Specialty"] as const;
  return (
    <>
      <h1>Certifications</h1>
      <p className="muted">
        Exams marked <span className="badge good">available</span> have full content: roadmap, knowledge modules, practice questions, labs and
        flashcards. The others are on the roadmap; the AI Coach can already help you study for them.
      </p>
      {levels.map((level) => {
        const items = catalog.filter((c) => c.level === level);
        if (!items.length) return null;
        return (
          <section key={level}>
            <h2>{level}</h2>
            <div className="grid grid-4">
              {items.map((c) =>
                c.available ? (
                  <Link key={c.code} href={`/exams/${c.code.toLowerCase()}`} className="card">
                    <strong>{c.code}</strong> <span className="badge good">available</span>
                    <div>{c.title}</div>
                    <div className="muted small">{c.track}</div>
                  </Link>
                ) : (
                  <Link key={c.code} href={`/coach?topic=${c.code}`} className="card disabled">
                    <strong>{c.code}</strong> <span className="badge">coach only</span>
                    <div>{c.title}</div>
                    <div className="muted small">{c.track}</div>
                  </Link>
                ),
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
