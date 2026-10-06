"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Profile {
  hoursPerWeek: number;
  targetDate: string;
  level: "beginner" | "intermediate" | "advanced";
  existingCerts: string;
  learningStyle: "reading" | "video" | "hands-on";
}

export default function StudyProfileForm({ examId, initial }: { examId: string; initial: Profile }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId, ...p }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return setError("Check the values: 1–60 hours per week and a valid date.");
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      <div className="field">
        <label htmlFor="hours">Hours per week</label>
        <input id="hours" type="number" min={1} max={60} step={0.5} value={p.hoursPerWeek} onChange={(e) => setP({ ...p, hoursPerWeek: Number(e.target.value) })} />
      </div>
      <div className="field">
        <label htmlFor="date">Target exam date</label>
        <input id="date" type="date" value={p.targetDate} onChange={(e) => setP({ ...p, targetDate: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="level">Current knowledge</label>
        <select id="level" value={p.level} onChange={(e) => setP({ ...p, level: e.target.value as Profile["level"] })}>
          <option value="beginner">Beginner – new to this technology</option>
          <option value="intermediate">Intermediate – I use it occasionally</option>
          <option value="advanced">Advanced – I work with it daily</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="certs">Existing certifications</label>
        <input id="certs" placeholder="e.g. MS-900, MD-102" value={p.existingCerts} onChange={(e) => setP({ ...p, existingCerts: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="style">Learning style</label>
        <select id="style" value={p.learningStyle} onChange={(e) => setP({ ...p, learningStyle: e.target.value as Profile["learningStyle"] })}>
          <option value="hands-on">Hands-on (most lab time)</option>
          <option value="reading">Reading / documentation</option>
          <option value="video">Video</option>
        </select>
      </div>
      {error && <div className="callout bad small">{error}</div>}
      <button className="btn primary" disabled={busy}>{busy ? "Generating…" : "Generate plan"}</button>
    </form>
  );
}
