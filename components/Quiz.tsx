"use client";

import { useEffect, useMemo, useState } from "react";
import type { Question } from "@/lib/content-types";
import { Markdown } from "./ui";

export interface QuizQuestion extends Question {
  /** Shuffled option order for sequence questions (computed on the server to avoid hydration mismatches). */
  initialOrder?: string[];
}

interface Props {
  examId: string;
  mode: string;
  title: string;
  questions: QuizQuestion[];
  domainNames: Record<string, string>;
  /** Exam mode: no feedback until the end, optional timer. Practice mode: explanation after every question. */
  examMode?: boolean;
  timeLimitMinutes?: number;
}

const TYPE_HINT: Record<Question["type"], string> = {
  single: "Choose one answer.",
  multiple: "Choose all answers that apply.",
  truefalse: "True or false?",
  sequence: "Put the steps in the correct order.",
  yesno: "For each statement, select Yes if it is true. Otherwise select No.",
};

function isCorrect(q: Question, response: string[]) {
  if (q.type === "sequence") return q.correct.length === response.length && q.correct.every((c, i) => response[i] === c);
  const a = new Set(q.correct);
  const b = new Set(response);
  return a.size === b.size && [...a].every((x) => b.has(x));
}

export default function Quiz({ examId, mode, title, questions, domainNames, examMode = false, timeLimitMinutes }: Props) {
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(questions.filter((q) => q.type === "sequence").map((q) => [q.id, q.initialOrder ?? q.options.map((o) => o.id)])),
  );
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(timeLimitMinutes ? timeLimitMinutes * 60 : 0);

  const q = questions[index];
  const response = responses[q?.id] ?? [];
  const revealed = !examMode && checked[q?.id];

  useEffect(() => {
    if (!timeLimitMinutes || finished) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLimitMinutes, finished]);

  useEffect(() => {
    if (timeLimitMinutes && secondsLeft <= 0 && !finished) void finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const results = useMemo(() => questions.map((x) => ({ q: x, ok: isCorrect(x, responses[x.id] ?? []) })), [questions, responses]);

  async function finish() {
    setFinished(true);
    const answers = questions.filter((x) => responses[x.id]?.length || x.type === "yesno").map((x) => ({ questionId: x.id, response: responses[x.id] ?? [] }));
    if (!answers.length) return;
    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId, mode, answers }),
    }).catch(() => null);
    if (!res?.ok) setSaveError("Results could not be saved; readiness was not updated.");
  }

  function setResponse(next: string[]) {
    setResponses((r) => ({ ...r, [q.id]: next }));
  }

  if (!questions.length) return <div className="card">No questions match this selection yet.</div>;

  if (finished) {
    const score = results.filter((r) => r.ok).length;
    const pct = Math.round((score / questions.length) * 100);
    const byDomain = new Map<string, { ok: number; total: number }>();
    for (const r of results) {
      const d = byDomain.get(r.q.domainId) ?? { ok: 0, total: 0 };
      d.total++;
      if (r.ok) d.ok++;
      byDomain.set(r.q.domainId, d);
    }
    return (
      <>
        <div className="card">
          <h2>
            {title}: {score}/{questions.length} ({pct}%)
          </h2>
          <p className={pct >= 70 ? "" : "muted"}>
            {pct >= 80 ? "Strong result. " : pct >= 70 ? "Around the pass mark — review the explanations below. " : "Below the pass mark. "}
            Microsoft scores on a 1–1000 scale with 700 to pass; aim for 80 %+ here before booking.
          </p>
          {saveError && <div className="callout bad">{saveError}</div>}
          <table>
            <thead>
              <tr>
                <th>Domain</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {[...byDomain].map(([d, v]) => (
                <tr key={d}>
                  <td>{domainNames[d] ?? d}</td>
                  <td>
                    {v.ok}/{v.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="btn-row">
            <a className="btn primary" href={`/exams/${examId}/readiness`}>View readiness</a>
            <a className="btn" href={`/exams/${examId}/practice`}>New practice session</a>
          </div>
        </div>
        <h2>Review</h2>
        {results.map(({ q: x, ok }, i) => (
          <div key={x.id} className="card" style={{ marginBottom: 12 }}>
            <p className="small muted">
              {i + 1}. {ok ? "✅ Correct" : "❌ Incorrect"} · {domainNames[x.domainId]}
            </p>
            <QuestionBody q={x} response={responses[x.id] ?? []} reveal onChange={() => {}} />
          </div>
        ))}
      </>
    );
  }

  const answeredCount = questions.filter((x) => responses[x.id]?.length).length;
  const canCheck = q.type === "yesno" || q.type === "sequence" || response.length > 0;

  return (
    <div className="card">
      <div className="btn-row small muted" style={{ justifyContent: "space-between" }}>
        <span>
          Question {index + 1} of {questions.length} · {domainNames[q.domainId]} · {q.difficulty}
        </span>
        {timeLimitMinutes ? (
          <span className={secondsLeft < 300 ? "badge bad" : "badge"}>
            ⏱ {Math.floor(Math.max(0, secondsLeft) / 60)}:{String(Math.max(0, secondsLeft) % 60).padStart(2, "0")}
          </span>
        ) : (
          <span>{answeredCount} answered</span>
        )}
      </div>
      <QuestionBody q={q} response={response} reveal={Boolean(revealed)} onChange={setResponse} />
      <div className="btn-row" style={{ marginTop: 16 }}>
        <button className="btn" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          ← Previous
        </button>
        {!examMode && !revealed && (
          <button className="btn primary" disabled={!canCheck} onClick={() => setChecked((c) => ({ ...c, [q.id]: true }))}>
            Check answer
          </button>
        )}
        {index < questions.length - 1 ? (
          <button className={`btn ${examMode || revealed ? "primary" : ""}`} onClick={() => setIndex(index + 1)}>
            Next →
          </button>
        ) : (
          <button className="btn primary" onClick={finish}>
            Finish & score
          </button>
        )}
        {examMode && index < questions.length - 1 && (
          <button className="btn" onClick={finish} style={{ marginLeft: "auto" }}>
            End exam
          </button>
        )}
      </div>
    </div>
  );
}

function QuestionBody({ q, response, reveal, onChange }: { q: Question; response: string[]; reveal: boolean; onChange: (r: string[]) => void }) {
  const correct = new Set(q.correct);
  const ok = isCorrect(q, response);

  return (
    <div>
      {q.scenario && (
        <div className="callout tip">
          <h4>Scenario</h4>
          <Markdown>{q.scenario}</Markdown>
        </div>
      )}
      <div style={{ fontWeight: 600 }}>
        <Markdown>{q.stem}</Markdown>
      </div>
      <p className="small muted">{TYPE_HINT[q.type]}</p>

      {(q.type === "single" || q.type === "truefalse" || q.type === "multiple") &&
        q.options.map((o) => {
          const selected = response.includes(o.id);
          const cls = reveal ? (correct.has(o.id) ? "correct" : selected ? "wrong" : "") : selected ? "selected" : "";
          return (
            <label key={o.id} className={`option ${cls}`} style={{ fontWeight: 400 }}>
              <input
                type={q.type === "multiple" ? "checkbox" : "radio"}
                name={q.id}
                checked={selected}
                disabled={reveal}
                onChange={() =>
                  onChange(q.type === "multiple" ? (selected ? response.filter((x) => x !== o.id) : [...response, o.id]) : [o.id])
                }
              />
              <span>{o.text}</span>
            </label>
          );
        })}

      {q.type === "yesno" && (
        <table>
          <thead>
            <tr>
              <th>Statement</th>
              <th style={{ width: 60 }}>Yes</th>
              <th style={{ width: 60 }}>No</th>
            </tr>
          </thead>
          <tbody>
            {q.options.map((o) => {
              const yes = response.includes(o.id);
              const right = correct.has(o.id) === yes;
              return (
                <tr key={o.id} style={reveal ? { background: right ? "var(--good-soft)" : "var(--bad-soft)" } : undefined}>
                  <td>
                    {o.text}
                    {reveal && <span className="small muted"> — answer: {correct.has(o.id) ? "Yes" : "No"}</span>}
                  </td>
                  <td>
                    <input type="radio" name={`${q.id}-${o.id}`} checked={yes} disabled={reveal} onChange={() => onChange([...response.filter((x) => x !== o.id), o.id])} />
                  </td>
                  <td>
                    <input type="radio" name={`${q.id}-${o.id}`} checked={!yes} disabled={reveal} onChange={() => onChange(response.filter((x) => x !== o.id))} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {q.type === "sequence" && (
        <ol style={{ paddingLeft: 20 }}>
          {response.map((id, i) => {
            const o = q.options.find((x) => x.id === id)!;
            const move = (dir: -1 | 1) => {
              const next = [...response];
              [next[i], next[i + dir]] = [next[i + dir], next[i]];
              onChange(next);
            };
            return (
              <li key={id}>
                <div className={`option ${reveal ? (q.correct[i] === id ? "correct" : "wrong") : ""}`} style={{ cursor: "default" }}>
                  <span style={{ flex: 1 }}>{o.text}</span>
                  {!reveal && (
                    <span className="btn-row">
                      <button className="btn" disabled={i === 0} onClick={() => move(-1)} aria-label="Move up">↑</button>
                      <button className="btn" disabled={i === response.length - 1} onClick={() => move(1)} aria-label="Move down">↓</button>
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {reveal && (
        <div className={`callout ${ok ? "lab" : "bad"}`}>
          <h4>{ok ? "Correct" : "Not quite"}</h4>
          {q.type === "sequence" && (
            <p className="small">
              Correct order: {q.correct.map((id) => q.options.find((o) => o.id === id)?.text).join(" → ")}
            </p>
          )}
          <Markdown>{q.explanation}</Markdown>
          {Object.keys(q.whyOthersWrong).length > 0 && (
            <>
              <strong className="small">Why the other answers are wrong</strong>
              <ul className="small">
                {Object.entries(q.whyOthersWrong).map(([id, why]) => (
                  <li key={id}>
                    <em>{q.options.find((o) => o.id === id)?.text ?? id}</em>: {why}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="small">
            <strong>Skill measured:</strong> {q.skillMeasured} · 📚{" "}
            <a href={q.reference.url} target="_blank" rel="noreferrer">{q.reference.title}</a>
          </p>
        </div>
      )}
    </div>
  );
}
