// 每年加入新一屆會考的比對工具。
//   node tools/yearly_update.js prepare 116   → 產生 work/116/judge/ 的比對輸入（新年度考點分組＋全部題庫分組）
//   node tools/yearly_update.js merge 116     → 把 work/116/judge/hit_*.json 併進 src/exam_match.json
//   node tools/yearly_update.js stats         → 目前保留題數、各年度題數、年份範圍
const fs = require("fs"), p = require("path");
const ROOT = p.join(__dirname, ".."), SRC = p.join(ROOT, "src");
const GROUPS = { bioA: ["U01","U02","U03","U04"], bioB: ["U05","U06","U07"], chemA: ["U08","U11","U12"],
  chemB: ["U13","U14","U15","U16"], phyA: ["U09","U10","U17"], phyB: ["U18","U19","U20","U21"], earth: ["U22","U23","U24"] };

function bank() {
  global.QB = [];
  for (const f of fs.readdirSync(SRC).filter(f => /^bank.*\.js$/.test(f)).sort()) eval(fs.readFileSync(p.join(SRC, f), "utf8"));
  return QB.map(r => r.length >= 7 ? { u: r[0], q: r[1], a: r[2], e: r[6] } : { u: r[0], q: r[1], a: r[2] ? "正確" : "錯誤", e: r[3] });
}
const matchFile = p.join(SRC, "exam_match.json");
const loadMatch = () => JSON.parse(fs.readFileSync(matchFile, "utf8"));
const saveMatch = M => fs.writeFileSync(matchFile, JSON.stringify(M, null, 0).replace(/\},\{/g, "},\n{"));

function prepare(y) {
  const idxFile = p.join(SRC, "exam_index", `idx_${y}.jsonl`);
  if (!fs.existsSync(idxFile)) throw new Error("先建立 " + idxFile);
  const rows = fs.readFileSync(idxFile, "utf8").split("\n").filter(l => l.trim()).map(l => JSON.parse(l));
  const byU = {}, all = [];
  for (const r of rows) r.pts.forEach((pt, i) => { const u = (r.pu && r.pu[i]) || r.u; const line = `${r.y}-${r.n}｜${u}｜${pt}`; (byU[u] = byU[u] || []).push(line); all.push(line); });
  const out = p.join(ROOT, "work", String(y), "judge"); fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(p.join(out, "index_all.txt"), all.join("\n"));
  const B = bank(), M = Object.fromEntries(loadMatch().map(m => [m.q, m]));
  for (const [g, us] of Object.entries(GROUPS)) {
    const qs = B.filter(q => us.includes(q.u)).map(q => ({ ...q, keep: !!(M[q.q] && M[q.q].keep) }));
    fs.writeFileSync(p.join(out, `q_${g}.json`), "[\n" + qs.map(x => JSON.stringify(x)).join(",\n") + "\n]");
    fs.writeFileSync(p.join(out, `idx_${g}.txt`), us.flatMap(u => byU[u] || []).join("\n"));
    console.log(g, "questions", qs.length, "new-year points", us.flatMap(u => byU[u] || []).length);
  }
  console.log("rows", rows.length, "points", all.length, "→", out);
}

function merge(y) {
  const dir = p.join(ROOT, "work", String(y), "judge"); const M = loadMatch(); const by = Object.fromEntries(M.map(m => [m.q, m]));
  let added = 0, restored = 0, missing = [];
  for (const g of Object.keys(GROUPS)) {
    const f = p.join(dir, `hit_${g}.json`); if (!fs.existsSync(f)) { missing.push(g); continue; }
    for (const h of JSON.parse(fs.readFileSync(f, "utf8"))) {
      if (!h.hit) continue; const m = by[h.q]; if (!m) { console.warn("unknown q:", h.q); continue; }
      if (!m.keep) restored++; m.keep = true; added++;
      m.y = [...new Set([...(m.y || []), y])].sort((a, b) => a - b);
      m.ref = [...new Set([...(m.ref || []), ...(h.ref || [])])];
    }
  }
  if (missing.length) throw new Error("缺少 hit 檔：" + missing.join(","));
  saveMatch(M); console.log({ year: y, hits: added, restored }); stats();
}

function stats() {
  const M = loadMatch(), k = M.filter(m => m.keep), yc = {};
  k.forEach(m => m.y.forEach(y => yc[y] = (yc[y] || 0) + 1));
  const ys = Object.keys(yc).map(Number);
  console.log({ total: M.length, kept: k.length, range: `${Math.min(...ys)}–${Math.max(...ys)}`, perYear: yc });
}

const [cmd, y] = process.argv.slice(2);
if (cmd === "prepare") prepare(+y); else if (cmd === "merge") merge(+y); else stats();
