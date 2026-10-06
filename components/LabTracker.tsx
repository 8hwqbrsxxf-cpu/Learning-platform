"use client";

import { useState } from "react";

type Status = "not_started" | "in_progress" | "completed";

export default function LabTracker({ examId, labId, initialStatus, initialNotes }: { examId: string; labId: string; initialStatus: Status; initialNotes: string }) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState<string | null>(null);

  async function save(next: Status = status) {
    setStatus(next);
    const res = await fetch("/api/labs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId, labId, status: next, notes }),
    }).catch(() => null);
    setSaved(res?.ok ? "Saved" : "Could not save");
  }

  return (
    <div>
      <div className="btn-row" style={{ marginBottom: 12 }}>
        <button className={`btn ${status === "in_progress" ? "primary" : ""}`} onClick={() => save("in_progress")}>⏳ In progress</button>
        <button className={`btn ${status === "completed" ? "primary" : ""}`} onClick={() => save("completed")}>✅ Completed (validated)</button>
        <button className="btn" onClick={() => save("not_started")}>Reset</button>
      </div>
      <div className="field">
        <label htmlFor="notes">Lab notes (what went wrong, tenant details, screenshots location…)</label>
        <textarea id="notes" rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="btn-row">
        <button className="btn" onClick={() => save()}>Save notes</button>
        {saved && <span className="small muted">{saved}</span>}
      </div>
    </div>
  );
}
