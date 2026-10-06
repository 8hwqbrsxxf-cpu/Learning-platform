// Checks that every reference URL in content/exams/*.json is a live Microsoft Learn page.
// Usage: npm run check-links   (exits 1 when a link is broken or not on learn.microsoft.com)
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve("content/exams");
const urls = new Map(); // url -> [where]

function collect(file, where, ref) {
  if (!ref?.url) return;
  const list = urls.get(ref.url) ?? [];
  list.push(`${file}:${where}`);
  urls.set(ref.url, list);
}

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const e = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  collect(file, "studyGuideUrl", { url: e.studyGuideUrl });
  if (e.retirement) collect(file, "retirement", e.retirement);
  for (const d of e.domains) for (const r of d.learnPaths) collect(file, d.id, r);
  for (const m of e.modules) for (const r of m.references) collect(file, m.id, r);
  for (const l of e.labs) for (const r of l.references) collect(file, l.id, r);
  for (const q of e.questions) collect(file, q.id, q.reference);
}

const bad = [];
const queue = [...urls.keys()];
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    if (!/^https:\/\/learn\.microsoft\.com\//.test(url)) {
      bad.push([url, "not a learn.microsoft.com URL"]);
      continue;
    }
    try {
      const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "certcoach-link-check" } });
      // Learn serves a 200 "page not found" shell for some missing pages; detect it by title.
      const body = res.ok ? await res.text() : "";
      if (!res.ok) bad.push([url, `HTTP ${res.status}`]);
      else if (/<title>\s*(Page not found|404)/i.test(body)) bad.push([url, "Learn 'page not found'"]);
    } catch (err) {
      bad.push([url, `fetch failed: ${err.cause?.code ?? err.message}`]);
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));

console.log(`Checked ${urls.size} unique URLs.`);
for (const [url, why] of bad) console.error(`✗ ${why}: ${url}\n    used in ${urls.get(url).join(", ")}`);
if (bad.length) process.exit(1);
console.log("✓ All links resolve to Microsoft Learn pages.");
