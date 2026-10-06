import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{ a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer">{children}</a> }}
    >
      {children}
    </ReactMarkdown>
  );
}

export function scoreColor(score: number) {
  return score >= 85 ? "var(--good)" : score >= 70 ? "var(--accent)" : score >= 50 ? "var(--warn)" : "var(--bad)";
}

export function Bar({ value }: { value: number }) {
  return (
    <div className="bar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${Math.max(2, Math.min(100, value))}%`, background: scoreColor(value) }} />
    </div>
  );
}

export function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="card stat">
      <span className="value">{value}</span>
      <span className="label">{label}</span>
    </div>
  );
}

export function Callout({ kind, title, items }: { kind: "tip" | "warn" | "lab" | "bad"; title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className={`callout ${kind}`}>
      <h4>{title}</h4>
      <ul>
        {items.map((t, i) => (
          <li key={i}>
            <Markdown>{t}</Markdown>
          </li>
        ))}
      </ul>
    </div>
  );
}

const TABS = [
  ["", "Overview"],
  ["/plan", "Study plan"],
  ["/practice", "Practice exam"],
  ["/flashcards", "Flashcards"],
  ["/labs", "Labs"],
  ["/readiness", "Readiness"],
] as const;

export function ExamTabs({ examId, active }: { examId: string; active: (typeof TABS)[number][0] }) {
  return (
    <nav className="tabs">
      {TABS.map(([path, label]) => (
        <Link key={path} href={`/exams/${examId}${path}`} className={path === active ? "active" : ""}>
          {label}
        </Link>
      ))}
      <Link href={`/coach?exam=${examId}`}>AI Coach</Link>
    </nav>
  );
}

export function RetirementBanner({ code, retirement }: { code: string; retirement?: { date: string; successor?: string; url: string } }) {
  if (!retirement) return null;
  const days = Math.ceil((new Date(retirement.date).getTime() - Date.now()) / 86_400_000);
  return (
    <div className="callout bad small">
      <strong>
        {code} {days > 0 ? `retires on ${retirement.date} (${days} days left)` : `retired on ${retirement.date}`}.
      </strong>{" "}
      After that date you can no longer take the exam or earn the certification.
      {retirement.successor && <> Successor: <strong>{retirement.successor}</strong>.</>}{" "}
      <a href={retirement.url} target="_blank" rel="noreferrer">Official retirement list</a>
    </div>
  );
}

export function LevelBadge({ level }: { level: string }) {
  const cls = level === "beginner" ? "good" : level === "intermediate" ? "accent" : "warn";
  return <span className={`badge ${cls}`}>{level}</span>;
}
