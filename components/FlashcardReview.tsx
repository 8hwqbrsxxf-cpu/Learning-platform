"use client";

import { useEffect, useState } from "react";
import type { Flashcard } from "@/lib/content-types";
import type { Grade } from "@/lib/srs";
import { LevelBadge } from "./ui";

const GRADES: { grade: Grade; label: string; key: string }[] = [
  { grade: "again", label: "Again", key: "1" },
  { grade: "hard", label: "Hard", key: "2" },
  { grade: "good", label: "Good", key: "3" },
  { grade: "easy", label: "Easy", key: "4" },
];

export default function FlashcardReview({ examId, cards, domainNames }: { examId: string; cards: Flashcard[]; domainNames: Record<string, string> }) {
  const [queue, setQueue] = useState(cards);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const card = queue[0];

  async function grade(g: Grade) {
    if (!card) return;
    await fetch("/api/flashcards/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId, cardId: card.id, grade: g }),
    }).catch(() => null);
    setReviewed((n) => n + 1);
    setFlipped(false);
    // "Again" re-queues the card at the end of this session.
    setQueue((q) => (g === "again" ? [...q.slice(1), q[0]] : q.slice(1)));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped) {
        const g = GRADES.find((x) => x.key === e.key);
        if (g) void grade(g.grade);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!card) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <h2>🎉 All done for now</h2>
        <p className="muted">{reviewed ? `You reviewed ${reviewed} cards.` : "No cards are due."} Come back tomorrow for your daily review.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="small muted">
        {queue.length} left in this session · {domainNames[card.domainId]} <LevelBadge level={card.level} />
      </p>
      <div className="card flashcard" onClick={() => setFlipped(!flipped)}>
        <div className="small muted">{flipped ? "Answer" : "Question — click or press space to flip"}</div>
        <div style={{ marginTop: 10 }}>{flipped ? card.back : card.front}</div>
        {flipped && <div className="small muted" style={{ marginTop: 14 }}>Q: {card.front}</div>}
      </div>
      {flipped && (
        <div className="btn-row" style={{ justifyContent: "center", marginTop: 12 }}>
          {GRADES.map((g) => (
            <button key={g.grade} className={`btn ${g.grade === "good" ? "primary" : ""}`} onClick={() => grade(g.grade)}>
              {g.label} <span className="small muted">({g.key})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
