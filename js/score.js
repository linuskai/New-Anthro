/* Hospital Escape 3D · escape mode structure: route deadlines, failing a route, points, ranks and records per route. */

// ---------- deadlines ----------
const routeDeadline = k => { const R = ROUTES[k]; return R && R.deadline ? R.deadline * (settings.diff === "easy" ? 1.35 : 1) : 0; };
const fmtLeft = m => { const s = Math.max(0, Math.round(m)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
function routeTimeLeft() { const d = run && run.route ? routeDeadline(run.route) : 0; return d ? d - run.minutes : null; }
function updateRouteClock() {
  if (run.mode !== "mission" || !run.route || run.routeFailed) return;
  const left = routeTimeLeft(); if (left == null) return;
  if (left < 120 && !run.warned2) { run.warned2 = true; showToast(ROUTES[run.route].av, "#e2483d", "Knapp!", `Noch ${fmtLeft(left)} Minuten, dann ist ${ROUTES[run.route].name} weg. Beeil dich.`, []); sfx.beep(); }
  if (left <= 0) failRoute();
}
function failRoute() {
  const k = run.route, R = ROUTES[k];
  run.routeFailed = k; run.route = "stay"; run.offers.delete(k); addScore(-400, "Route verpasst: " + R.name);
  showToast("⌛", "#e2483d", R.name + " · zu spät", R.failText + " Bleibt: einfach heim.", [{ text: "−400 Punkte" }]);
  sfx.stinger(); updateHud();
}

// ---------- points ----------
function addScore(pts, label) { (run.scoreLog || (run.scoreLog = [])).push([label, pts]); }
function scoreBreakdown(ending) {
  const rows = [], add = (label, pts) => { if (pts) rows.push([label, Math.round(pts)]); };
  const R = ROUTES[ending] || ROUTES.stay;
  add(`Abschnitte geschafft (${Math.min(MISSION_LEVELS, run.idx + 1)})`, Math.min(MISSION_LEVELS, run.idx + 1) * 150);
  const goals = R.goals.filter(g => g.done ? g.done() : run.flags.has(g.id)).length + R.promote.filter(id => run.flags.has(id) || (id === "cream" && run.picked.has("+"))).length;
  add(`Unter-Missionen ${R.name} (${goals})`, goals * 350);
  if (ending !== "stay") add("Ausweg geschafft: " + R.name, 1000 + R.stars * 250);
  const sneaky = Math.max(0, Math.min(MISSION_LEVELS, run.idx + 1) - (run.spotted ? run.spotted.size : 0));
  add(`Unentdeckte Stockwerke (${sneaky})`, sneaky * 150);
  add(`Gespräche gemeistert (${run.talks})`, run.talks * 40);
  add(`Anrufe angenommen (${run.callsAcc})`, run.callsAcc * 25);
  add(`Nebenmissionen (${run.sideDone || 0})`, (run.sideDone || 0) * 250);
  const par = (ROUTES[ending] || ROUTES.stay).par * (settings.diff === "easy" ? 1.35 : 1);
  add("Zeitbonus", Math.max(0, par - run.minutes) * 3);
  add(`Dienste aufgedrückt (${run.duties.length})`, -run.duties.length * 80);
  add(`Liegengelassene Aufgaben (${run.tasks.length})`, -run.tasks.length * 40);
  for (const [l, p] of run.scoreLog || []) add(l, p);
  const total = Math.max(0, rows.reduce((a, r) => a + r[1], 0));
  return { rows, total, rank: total >= 4200 ? "S" : total >= 3000 ? "A" : total >= 1900 ? "B" : total >= 1000 ? "C" : "D" };
}

// ---------- records per route ----------
const REC_KEY = "hospital-escape-records-v10";
function loadRecords() { try { return JSON.parse(localStorage.getItem(REC_KEY)) || {}; } catch (e) { return {}; } }
function saveRecord(k, score, minutes) {
  const all = loadRecords(), old = all[k] || {}, res = { newScore: !(old.score >= score), newTime: !(old.minutes <= minutes) };
  all[k] = { score: Math.max(old.score || 0, score), minutes: Math.min(old.minutes ?? Infinity, minutes) };
  try { localStorage.setItem(REC_KEY, JSON.stringify(all)); } catch (e) {}
  return Object.assign(res, { old });
}
function recordLine(k) { const r = loadRecords()[k]; return r ? `Rekord: ${r.score} Punkte · schnellste Flucht ${fmtLeft(r.minutes)}` : "Noch kein Rekord"; }

function renderScore(ending) {
  const b = scoreBreakdown(ending), rec = saveRecord(ending, b.total, run.minutes);
  $("endScore").hidden = false;
  $("endScore").innerHTML = `<div class="sc-top"><span class="sc-rank r${b.rank}">${b.rank}</span><span><b>${b.total}</b> Punkte<small>${rec.newScore ? "Neuer Punkte-Rekord für diese Route!" : "Rekord: " + rec.old.score}${rec.newTime ? " · Neue Bestzeit!" : ""}</small></span></div>` +
    `<ul class="sc-rows">${b.rows.map(([l, p]) => `<li class="${p < 0 ? "neg" : ""}"><span>${esc(l)}</span><b>${p > 0 ? "+" : ""}${p}</b></li>`).join("")}</ul>`;
  return b;
}

// HUD chip: route, sub-mission progress, countdown
function updateRouteChip() {
  const c = $("chipRoute"); if (!c) return;
  if (run.mode !== "mission" || !run.route || run.route === "stay") { c.hidden = !run.routeFailed; if (run.routeFailed) { c.textContent = "⌛ " + ROUTES[run.routeFailed].name.toUpperCase() + " VERPASST"; c.classList.add("warn"); } return; }
  const R = ROUTES[run.route], total = R.goals.length + R.promote.length, done = total - routeMissing(run.route).length, left = routeTimeLeft();
  c.hidden = false; c.textContent = `${R.av} ${R.name.toUpperCase()} ${done}/${total}` + (left != null ? ` · ⏱ ${fmtLeft(left)}` : "");
  c.classList.toggle("warn", left != null && left < 180);
}
