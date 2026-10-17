/* Hospital Escape 3D · scoring as the hospital sees it: a "DRG revenue" in euros, ranks from Leistungsträger:in to Kostenstelle, records per mission. */

function addScore(pts, label) { (run.scoreLog || (run.scoreLog = [])).push([label, pts]); }
const euro = n => Math.round(n).toLocaleString("de-DE") + " €";
const RANKS = [[5200, "S", "Leistungsträger:in"], [4000, "A", "Effizienzwunder"], [2800, "B", "Kostenneutral"], [1600, "C", "Budgetrisiko"], [0, "D", "Kostenstelle"]];
function scoreBreakdown(ending) {
  const rows = [], add = (label, pts) => { if (pts) rows.push([label, Math.round(pts)]); };
  const R = ROUTES[ending] || ROUTES.stay;
  add(`Fallpauschale „${R.title}“`, 1200 + R.stars * 300);
  add(`Unter-Missionen (${R.goals.filter(goalDone).length} × 400 €)`, R.goals.filter(goalDone).length * 400);
  const left = routeDeadline(ending) - run.minutes;
  add(`Zeitpuffer bis zur Frist (${fmtSpan(left)})`, Math.max(0, left) * 6);
  const floors = R.floors.length, sneaky = Math.max(0, floors - (run.spotted ? run.spotted.size : 0));
  add(`Unbemerkte Etagen (${sneaky} von ${floors})`, sneaky * 180);
  add(`Gespräche überstanden (${run.talks})`, run.talks * 30);
  add(`Reanimationen (${run.lives})`, run.lives * 150);
  add(`Verlorene Zeit (${fmtSpan(run.lostMin || 0)})`, -(run.lostMin || 0) * 3);
  add(`Neue Dienste (${run.duties.length})`, -run.duties.length * 120);
  add(`Liegengelassene Aufgaben (${run.tasks.length})`, -run.tasks.length * 60);
  for (const [l, p] of run.scoreLog || []) add(l, p);
  const total = Math.max(0, rows.reduce((a, r) => a + r[1], 0)), rk = RANKS.find(r => total >= r[0]);
  return { rows, total, rank: rk[1], rankName: rk[2] };
}

// ---------- records per mission ----------
const REC_KEY = "hospital-escape-records-v13";
function loadRecords() { try { return JSON.parse(localStorage.getItem(REC_KEY)) || {}; } catch (e) { return {}; } }
function saveRecord(k, score, minutes) {
  const all = loadRecords(), old = all[k] || {}, res = { newScore: !(old.score >= score), newTime: !(old.minutes <= minutes) };
  all[k] = { score: Math.max(old.score || 0, score), minutes: Math.min(old.minutes ?? Infinity, minutes), rank: res.newScore ? null : old.rank };
  if (res.newScore) all[k].rank = scoreBreakdown(k).rank;
  try { localStorage.setItem(REC_KEY, JSON.stringify(all)); } catch (e) {}
  return Object.assign(res, { old });
}

function renderScore(ending) {
  const b = scoreBreakdown(ending), rec = saveRecord(ending, b.total, run.minutes);
  $("endScore").hidden = false;
  $("endScore").innerHTML = `<div class="sc-top"><span class="sc-rank r${b.rank}">${b.rank}</span><span><small class="sc-k">DRG-Erlös für das Klinikum</small><b>${euro(b.total)}</b><small>${esc(b.rankName)} · ${rec.newScore ? "Neuer Rekord für diese Mission!" : "Rekord: " + euro(rec.old.score)}${rec.newTime ? " · Schnellste Flucht!" : ""}</small></span></div>` +
    `<ul class="sc-rows">${b.rows.map(([l, p]) => `<li class="${p < 0 ? "neg" : ""}"><span>${esc(l)}</span><b>${p > 0 ? "+" : ""}${euro(p)}</b></li>`).join("")}</ul>`;
  return b;
}
