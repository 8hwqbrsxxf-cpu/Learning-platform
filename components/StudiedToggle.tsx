"use client";

import { useState } from "react";

export default function StudiedToggle({ examId, uid, initial }: { examId: string; uid: string; initial: boolean }) {
  const [done, setDone] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const res = await fetch("/api/learn-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId, uid, completed: !done }),
    }).catch(() => null);
    if (res?.ok) setDone(!done);
    setBusy(false);
  }

  return (
    <button className={`btn ${done ? "" : "primary"}`} onClick={toggle} disabled={busy}>
      {done ? "✅ Studied" : "Mark as studied"}
    </button>
  );
}
