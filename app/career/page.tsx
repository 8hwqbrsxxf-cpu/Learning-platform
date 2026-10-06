import Link from "next/link";

const PATHS = [
  {
    role: "Helpdesk / Service desk → Modern Workplace engineer",
    steps: ["MS-900", "MD-102", "AB-650", "SC-300"],
    why: "Start from the user and device, then grow into tenant-wide administration and identity. This is the most common path inside an MSP. AB-650 succeeds MS-102, which retires on 30 November 2026.",
    jobs: "Modern Workplace Engineer, Intune Engineer, M365 Administrator",
  },
  {
    role: "System engineer → Azure architect",
    steps: ["AZ-900", "AZ-104", "AZ-500", "AZ-305"],
    why: "Administration first, then security hardening, then architecture and design decisions across workloads.",
    jobs: "Cloud Engineer, Azure Administrator, Cloud Architect",
  },
  {
    role: "Security-minded admin → Security consultant",
    steps: ["SC-900", "SC-300", "SC-200", "SC-100"],
    why: "Identity is the control plane; then detection and response with Defender XDR and Sentinel; finally zero-trust architecture.",
    jobs: "Security Consultant, SOC Analyst, Cybersecurity Architect",
  },
  {
    role: "Compliance & data protection",
    steps: ["SC-900", "AB-650", "SC-401"],
    why: "Purview, sensitivity labels, DLP and retention are increasingly requested by SMBs (NIS2, GDPR).",
    jobs: "Information Protection Administrator, Compliance Consultant",
  },
];

export default function CareerPage() {
  return (
    <>
      <h1>Career paths</h1>
      <p className="muted">
        Recommended certification sequences for typical roles. Certifications open doors; the labs make you useful on day one. Ask the AI coach
        for a path tailored to your experience.
      </p>
      <div className="grid grid-2">
        {PATHS.map((p) => (
          <div key={p.role} className="card">
            <h3>{p.role}</h3>
            <div className="btn-row" style={{ margin: "8px 0" }}>
              {p.steps.map((s, i) => (
                <span key={s}>
                  <Link className="badge accent" href={`/exams/${s.toLowerCase()}`}>{s}</Link>
                  {i < p.steps.length - 1 && <span className="muted"> → </span>}
                </span>
              ))}
            </div>
            <p className="small">{p.why}</p>
            <p className="small muted">Typical roles: {p.jobs}</p>
          </div>
        ))}
      </div>
      <div className="btn-row" style={{ marginTop: 16 }}>
        <Link className="btn primary" href={`/coach?exam=&prompt=${encodeURIComponent("I am an IT professional. Ask me about my experience and goals, then recommend a certification path and learning priorities.")}`}>
          Get personal career advice
        </Link>
      </div>
    </>
  );
}
