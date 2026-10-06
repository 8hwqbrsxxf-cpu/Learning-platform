"use client";

import { useState } from "react";

export default function ModuleCompleteToggle({ examId, moduleId, initial }: { examId: string; moduleId: string; initial: boolean }) {
  const [done, setDone] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const res = await fetch("/api/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId, moduleId, completed: !done }),
    }).catch(() => null);
    if (res?.ok) setDone(!done);
    setBusy(false);
  }

  return (
    <button className={`btn ${done ? "" : "primary"}`} onClick={toggle} disabled={busy}>
      {done ? "✅ Completed" : "Mark as completed"}
    </button>
  );
}
