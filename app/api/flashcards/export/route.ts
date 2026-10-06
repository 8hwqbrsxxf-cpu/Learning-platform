import { getExam } from "@/lib/content";

export const runtime = "nodejs";

// Anki import format: plain text, tab-separated (front, back, tags), with header directives.
export async function GET(req: Request) {
  const examId = new URL(req.url).searchParams.get("exam") ?? "";
  const exam = getExam(examId);
  if (!exam) return new Response("Unknown exam", { status: 404 });

  const clean = (s: string) => s.replace(/\t/g, " ").replace(/\r?\n/g, "<br>");
  const lines = [
    "#separator:tab",
    "#html:true",
    `#deck:${exam.code}`,
    "#tags column:3",
    ...exam.flashcards.map((f) => {
      const domain = exam.domains.find((d) => d.id === f.domainId)?.name ?? "";
      const tags = [exam.code, f.level, domain, ...f.tags].map((t) => t.replace(/\s+/g, "_")).join(" ");
      return [clean(f.front), clean(f.back), tags].join("\t");
    }),
  ];
  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exam.id}-flashcards-anki.txt"`,
    },
  });
}
