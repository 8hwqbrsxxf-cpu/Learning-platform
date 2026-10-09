// Merges module summaries ({ "<module uid>": { tldr, keyPoints, ... } }) into content/learning-paths/<exam>.json.
// Usage: node scripts/merge-summaries.mjs <exam-id> <summaries.json> [more.json ...]
import fs from "node:fs";

const FIELDS = ["tldr", "objectives", "keyPoints", "units", "keyTerms", "tables", "remember", "selfCheck", "summarizedOn"];
const [examId, ...inputs] = process.argv.slice(2);
const file = `content/learning-paths/${examId}.json`;
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const byUid = new Map(data.paths.flatMap((p) => p.modules.map((m) => [m.uid, m])));

let merged = 0;
for (const input of inputs) {
  const summaries = JSON.parse(fs.readFileSync(input, "utf8"));
  for (const [uid, s] of Object.entries(summaries)) {
    const m = byUid.get(uid);
    if (!m) {
      console.error(`✗ ${input}: unknown module uid ${uid}`);
      continue;
    }
    for (const f of FIELDS) if (s[f] !== undefined) m[f] = s[f];
    merged++;
  }
}
fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(`Merged ${merged} module summaries into ${file}`);
