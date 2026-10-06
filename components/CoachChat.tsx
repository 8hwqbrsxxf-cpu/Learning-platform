"use client";

import { useRef, useState } from "react";
import { Markdown } from "./ui";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const QUICK = [
  { label: "Explain simply", text: "Explain the concept I struggle with most in simple terms, with an analogy and a real-world example." },
  { label: "Quiz me", text: "Quiz me: one original scenario question at a time on my weakest domain. Wait for my answer." },
  { label: "Flashcards", text: "Give me 10 flashcards (Q/A) on my weakest domain, mixed beginner to expert." },
  { label: "Design a lab", text: "Design a hands-on lab for my weakest domain with objective, requirements, steps, validation, troubleshooting and cleanup." },
  { label: "What next?", text: "Based on my readiness, what should I study in the next 5 hours?" },
];

export default function CoachChat({ exams, initialExam, initialPrompt, configured }: { exams: { id: string; code: string; title: string }[]; initialExam: string; initialPrompt: string; configured: boolean }) {
  const [examId, setExamId] = useState(initialExam);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState(initialPrompt);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let answer = "";
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, messages: next }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        answer = `⚠️ ${await res.text()}`;
      } else {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          answer += decoder.decode(value, { stream: true });
          setMessages([...next, { role: "assistant", content: answer }]);
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") answer += "\n\n⚠️ Connection lost.";
    }
    setMessages([...next, { role: "assistant", content: answer || "_(stopped)_" }]);
    setBusy(false);
  }

  return (
    <div className="card">
      {!configured && (
        <div className="callout warn small">
          The coach needs a Claude API key: copy <code>.env.example</code> to <code>.env.local</code>, set <code>ANTHROPIC_API_KEY</code> and restart.
        </div>
      )}
      <div className="btn-row" style={{ marginBottom: 12 }}>
        <label htmlFor="exam" style={{ margin: 0 }}>Exam context</label>
        <select id="exam" value={examId} onChange={(e) => setExamId(e.target.value)} style={{ width: "auto" }}>
          <option value="">None (general / career)</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>{e.code} – {e.title}</option>
          ))}
        </select>
        {messages.length > 0 && <button className="btn" onClick={() => setMessages([])} disabled={busy}>New conversation</button>}
      </div>

      <div className="chat">
        {messages.length === 0 && <p className="muted small">Ask anything, or start with one of the quick actions below. Dutch, English and French all work.</p>}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.role === "assistant" ? <Markdown>{m.content || "…"}</Markdown> : m.content}
          </div>
        ))}
      </div>

      <div className="btn-row" style={{ margin: "14px 0 8px" }}>
        {QUICK.map((q) => (
          <button key={q.label} className="btn small" onClick={() => send(q.text)} disabled={busy}>{q.label}</button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <textarea
          rows={3}
          value={input}
          placeholder="Bijv.: Wat is het verschil tussen een compliance policy en een configuration profile?"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
        />
        <div className="btn-row" style={{ marginTop: 8 }}>
          <button className="btn primary" disabled={busy || !input.trim()}>Send</button>
          {busy && <button type="button" className="btn" onClick={() => abortRef.current?.abort()}>Stop</button>}
        </div>
      </form>
    </div>
  );
}
