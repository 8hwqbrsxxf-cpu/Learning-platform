import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CertCoach – Microsoft certification learning platform",
  description: "Roadmaps, practice exams, hands-on labs, spaced-repetition flashcards and an AI study coach for Microsoft certifications.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <div className="topbar-inner">
            <Link href="/" className="brand">
              Cert<span>Coach</span>
            </Link>
            <nav className="topnav">
              <Link href="/">Dashboard</Link>
              <Link href="/catalog">Certifications</Link>
              <Link href="/coach">AI Coach</Link>
              <Link href="/career">Career paths</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
