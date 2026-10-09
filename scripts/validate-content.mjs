// Validates content/exams/*.json against the rules in lib/content-types.ts.
// Usage: npm run validate   (exits 1 on errors)
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve("content/exams");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
let errors = 0;
const err = (file, msg) => {
  errors++;
  console.error(`✗ ${file}: ${msg}`);
};

const LEVELS = ["beginner", "intermediate", "expert"];
const QTYPES = ["single", "multiple", "truefalse", "sequence", "yesno"];

for (const file of files) {
  const exam = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  const e = (m) => err(file, m);
  for (const k of ["id", "code", "title", "domains", "roadmap", "modules", "questions", "flashcards", "labs"]) {
    if (exam[k] === undefined) e(`missing ${k}`);
  }
  const domainIds = new Set(exam.domains.map((d) => d.id));
  const moduleIds = new Set(exam.modules.map((m) => m.id));
  const labIds = new Set(exam.labs.map((l) => l.id));
  const allIds = [...exam.domains, ...exam.modules, ...exam.questions, ...exam.flashcards, ...exam.labs].map((x) => x.id);
  const dupes = allIds.filter((id, i) => allIds.indexOf(id) !== i);
  if (dupes.length) e(`duplicate ids: ${[...new Set(dupes)].join(", ")}`);

  const wMin = exam.domains.reduce((s, d) => s + d.weightMin, 0);
  const wMax = exam.domains.reduce((s, d) => s + d.weightMax, 0);
  if (wMin > 100 || wMax < 100) e(`domain weights ${wMin}-${wMax}% do not bracket 100%`);

  if (exam.modules.length > 0 && exam.roadmap.length !== 6) e(`roadmap must have 6 phases, has ${exam.roadmap.length}`);
  for (const p of exam.roadmap) {
    for (const m of p.moduleIds) if (!moduleIds.has(m)) e(`roadmap phase ${p.phase}: unknown module ${m}`);
    for (const l of p.labIds) if (!labIds.has(l)) e(`roadmap phase ${p.phase}: unknown lab ${l}`);
  }
  for (const m of exam.modules) {
    if (!domainIds.has(m.domainId)) e(`module ${m.id}: unknown domain ${m.domainId}`);
    if (!LEVELS.includes(m.level)) e(`module ${m.id}: bad level`);
    for (const l of m.labIds) if (!labIds.has(l)) e(`module ${m.id}: unknown lab ${l}`);
  }
  for (const q of exam.questions) {
    const opt = new Set(q.options.map((o) => o.id));
    if (!domainIds.has(q.domainId)) e(`question ${q.id}: unknown domain ${q.domainId}`);
    if (q.moduleId && !moduleIds.has(q.moduleId)) e(`question ${q.id}: unknown module ${q.moduleId}`);
    if (!QTYPES.includes(q.type)) e(`question ${q.id}: bad type ${q.type}`);
    if (!LEVELS.includes(q.difficulty)) e(`question ${q.id}: bad difficulty`);
    for (const c of q.correct) if (!opt.has(c)) e(`question ${q.id}: correct id ${c} not in options`);
    if ((q.type === "single" || q.type === "truefalse") && q.correct.length !== 1) e(`question ${q.id}: ${q.type} needs exactly 1 correct`);
    if (q.type === "multiple" && q.correct.length < 2) e(`question ${q.id}: multiple needs >=2 correct`);
    if (q.type === "sequence" && q.correct.length !== q.options.length) e(`question ${q.id}: sequence must order all options`);
    if (!q.reference?.url) e(`question ${q.id}: missing reference url`);
  }
  for (const f of exam.flashcards) {
    if (!domainIds.has(f.domainId)) e(`flashcard ${f.id}: unknown domain ${f.domainId}`);
    if (!LEVELS.includes(f.level)) e(`flashcard ${f.id}: bad level`);
  }
  for (const l of exam.labs) {
    if (!domainIds.has(l.domainId)) e(`lab ${l.id}: unknown domain ${l.domainId}`);
    if (!l.steps?.length || !l.validation?.length || !l.cleanup?.length) e(`lab ${l.id}: needs steps, validation and cleanup`);
  }
  // Only Microsoft Learn may be cited as a source.
  const refs = [
    ...exam.domains.flatMap((d) => d.learnPaths),
    ...exam.modules.flatMap((m) => m.references),
    ...exam.labs.flatMap((l) => l.references),
    ...exam.questions.map((q) => q.reference),
  ];
  for (const r of refs) if (!/^https:\/\/learn\.microsoft\.com\//.test(r?.url ?? "")) e(`non-Learn reference: ${r?.url}`);

  console.log(
    `✓ ${file}: ${exam.domains.length} domains, ${exam.modules.length} modules, ${exam.questions.length} questions, ` +
      `${exam.flashcards.length} flashcards, ${exam.labs.length} labs`,
  );
}
// Learning-path summaries
const lpDir = path.resolve("content/learning-paths");
if (fs.existsSync(lpDir)) {
  for (const file of fs.readdirSync(lpDir).filter((f) => f.endsWith(".json"))) {
    const lp = JSON.parse(fs.readFileSync(path.join(lpDir, file), "utf8"));
    const e = (m) => err(`learning-paths/${file}`, m);
    const isLearn = (u) => /^https:\/\/learn\.microsoft\.com\//.test(u ?? "");
    let total = 0;
    let done = 0;
    const slugs = new Set();
    for (const p of lp.paths) {
      if (!isLearn(p.url)) e(`path ${p.uid}: non-Learn url`);
      for (const m of p.modules) {
        total++;
        if (slugs.has(m.slug)) e(`duplicate module slug ${m.slug}`);
        slugs.add(m.slug);
        if (!isLearn(m.url)) e(`module ${m.uid}: non-Learn url`);
        if (!m.tldr) continue;
        done++;
        for (const k of ["keyPoints", "units", "keyTerms", "selfCheck"]) if (!m[k]?.length) e(`module ${m.uid}: missing ${k}`);
        for (const u of m.units ?? []) {
          if (!isLearn(u.url) || !u.url.startsWith(m.url)) e(`module ${m.uid}: unit url ${u.url} is not a unit of this module`);
          if (!u.points?.length) e(`module ${m.uid}: unit "${u.title}" has no points`);
        }
        for (const t of m.tables ?? []) for (const r of t.rows) if (r.length !== t.headers.length) e(`module ${m.uid}: table "${t.title}" row width`);
      }
    }
    console.log(`✓ learning-paths/${file}: ${lp.paths.length} paths, ${done}/${total} modules summarized`);
  }
}

if (errors) {
  console.error(`\n${errors} error(s)`);
  process.exit(1);
}
