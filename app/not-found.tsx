import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card">
      <h1>Not available yet</h1>
      <p>This exam or page has no content yet. The AI coach can still help you prepare.</p>
      <div className="btn-row">
        <Link className="btn primary" href="/catalog">Certifications</Link>
        <Link className="btn" href="/coach">AI Coach</Link>
      </div>
    </div>
  );
}
