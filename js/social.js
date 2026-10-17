/* Hospital Escape 3D · your profile, saved missions, sharing, and a leaderboard shared with everyone who plays this page
   (when it runs as a claude.ai artifact: db + user capabilities; elsewhere everything stays in this browser). */
const PROF_KEY = "hospital-escape-profile", SAVE_KEY = "hospital-escape-save-v13";
const AVATARS = ["🧑‍⚕️", "👩‍⚕️", "👨‍⚕️", "🦸", "🥷", "🧟", "🦄", "🦊", "🐙", "☕", "💅", "🏃"];
const store = { get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }, del: k => { try { localStorage.removeItem(k); } catch (e) {} } };
let profile = store.get(PROF_KEY) || { name: "", av: "🧑‍⚕️" };
let cloud = null; // { db, user, uid, myName }

// ---------- cloud (only inside the claude.ai artifact viewer) ----------
(async () => {
  try {
    if (!window.claude || !window.claude.use) return;
    const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
    if (!db || !user) return;
    const uid = await user.id(); if (!uid) return;
    const me = await user.me();
    cloud = { db, user, uid, myName: me.name || "" };
    const mine = await db.doc("board/" + uid).get();
    if (mine.exists) {
      const d = mine.data() || {}, recs = loadRecords();
      if (!profile.name && d.name) profile.name = d.name; if (d.av) profile.av = d.av;
      for (const [k, r] of Object.entries(d.best || {})) if (ROUTES[k] && !(recs[k] && recs[k].score >= r.score)) recs[k] = { score: r.score, minutes: Math.min(r.minutes, recs[k] ? recs[k].minutes : Infinity), rank: r.rank };
      store.set(REC_KEY, recs); store.set(PROF_KEY, profile);
    }
    if (!store.get(SAVE_KEY)) { const sv = await db.doc("data/users/" + uid + "/save").get(); if (sv.exists && sv.data().run) store.set(SAVE_KEY, sv.data().run); }
    if (mode === "title") refreshTitle();
  } catch (e) { cloud = null; }
})();
const displayName = () => profile.name || (cloud && cloud.myName) || "Dr. Anonym";
async function pushBoard() {
  if (!cloud) return;
  const recs = loadRecords(), best = {};
  for (const k of ROUTE_ORDER) if (recs[k]) best[k] = { score: recs[k].score, minutes: Math.round(recs[k].minutes), rank: recs[k].rank || "" };
  try { await cloud.db.doc("board/" + cloud.uid).set({ name: (profile.name || "").slice(0, 24), av: profile.av, best, updated: new Date().toISOString() }); } catch (e) {}
}
function submitScore() { pushBoard(); }

// ---------- saving a mission ----------
function saveCheckpoint() {
  if (!run || run.mode !== "mission" || run.routeFailed) return;
  const r = run, data = { v: 13, route: r.route, step: r.step, idx: r.idx, minutes: r.minutes, nerves: r.nerves, energy: r.energy, flags: [...r.flags], picked: [...r.picked], inv: r.inv,
    duties: r.duties, tasks: r.tasks, tasksTotal: r.tasksTotal, talks: r.talks, callsAcc: r.callsAcc, callsDec: r.callsDec, lives: r.lives, scoreLog: r.scoreLog || [], testi: r.testi || 0, spa: r.spa, lostMin: r.lostMin || 0,
    spotted: r.spotted ? [...r.spotted] : [], at: Date.now() };
  store.set(SAVE_KEY, data);
  if (cloud) cloud.db.doc("data/users/" + cloud.uid + "/save").set({ run: data }).catch(() => {});
}
function clearCheckpoint() { store.del(SAVE_KEY); if (cloud) cloud.db.doc("data/users/" + cloud.uid + "/save").delete().catch(() => {}); refreshTitle(); }
function resumeCheckpoint() {
  const d = store.get(SAVE_KEY); if (!d || !ROUTES[d.route]) return;
  initAudio(); hidePopups(); clearInputs(); lastMode = "mission"; lastRoute = d.route;
  newRun("mission", d.route);
  Object.assign(run, { step: d.step, idx: d.idx, minutes: d.minutes, nerves: d.nerves, energy: d.energy, flags: new Set(d.flags), picked: new Set(d.picked), inv: d.inv, duties: d.duties, tasks: d.tasks, tasksTotal: d.tasksTotal,
    talks: d.talks, callsAcc: d.callsAcc, callsDec: d.callsDec, lives: d.lives, scoreLog: d.scoreLog, testi: d.testi, spa: d.spa, lostMin: d.lostMin, spotted: new Set(d.spotted) });
  loadFloor(run.idx); run.clockSeen = run.minutes; renderInv();
  showIntro(`Gespeicherter Stand: ${mission().av} ${mission().name}, ${fmtTime(run.minutes)} Uhr. Frist ${fmtTime(routeDeadline(run.route))}.`);
}

// ---------- title screen ----------
function refreshTitle() {
  const d = store.get(SAVE_KEY), b = $("btnContinue");
  if (b) { b.hidden = !(d && ROUTES[d.route]); if (!b.hidden) b.querySelector("small").textContent = `${ROUTES[d.route].av} ${ROUTES[d.route].name} · ${floorLabel(d.idx)} · ${fmtTime(d.minutes)} Uhr`; }
  const recs = loadRecords(), done = ROUTE_ORDER.filter(k => recs[k]), top = done.reduce((a, k) => Math.max(a, recs[k].score), 0);
  $("bestLine").hidden = !done.length; $("bestLine").textContent = `${done.length} von ${ROUTE_ORDER.length} Missionen geschafft · bestes Ergebnis ${euro(top)}`;
  $("profChip").textContent = `${profile.av} ${displayName()}`;
}
$("btnContinue").addEventListener("click", resumeCheckpoint);

// ---------- leaderboard and profile ----------
let boardTab = "stay", boardSort = "score", boardReturn = "title", boardRows = null;
async function openBoard(from) {
  boardReturn = from || mode; mode = "board"; show("ovBoard"); $("ovBoard").scrollTop = 0;
  $("profName").value = profile.name; $("profName").placeholder = (cloud && cloud.myName) || "Dr. Anonym";
  $("profAvs").innerHTML = AVATARS.map(a => `<button type="button" class="av-pick${a === profile.av ? " on" : ""}" data-a="${a}">${a}</button>`).join("");
  $("boardTabs").innerHTML = ROUTE_ORDER.map(k => `<button type="button" class="${k === boardTab ? "on" : ""}" data-k="${k}">${ROUTES[k].av}<span>${esc(ROUTES[k].name)}</span></button>`).join("");
  $("boardNote").textContent = cloud ? "Alle, die dieses Spiel über den geteilten Link spielen, landen hier." : "Nur dieses Gerät. Die gemeinsame Bestenliste gibt es, wenn das Spiel als geteiltes Claude-Artefakt läuft.";
  boardRows = null; renderBoard();
  if (cloud) { try { const snap = await cloud.db.collection("board").limit(500).get(); boardRows = snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) })); } catch (e) { boardRows = null; } renderBoard(); }
}
async function renderBoard() {
  const k = boardTab, mine = cloud ? cloud.uid : "me", rows = [];
  if (boardRows) for (const d of boardRows) { const b = d.best && d.best[k]; if (b) rows.push({ id: d.id, name: d.name, av: d.av || "🧑‍⚕️", ...b }); }
  const recs = loadRecords();
  if (recs[k] && !rows.some(r => r.id === mine)) rows.push({ id: mine, name: profile.name, av: profile.av, ...recs[k] });
  rows.sort((a, b) => boardSort === "score" ? b.score - a.score : a.minutes - b.minutes);
  let names = {};
  if (cloud && cloud.user) try { names = await cloud.user.profiles(rows.map(r => r.id).filter(id => id !== "me")); } catch (e) {}
  for (const b of $("boardSort").querySelectorAll("button")) b.classList.toggle("on", b.dataset.s === boardSort);
  $("boardList").innerHTML = rows.length ? rows.slice(0, 25).map((r, i) => {
    const me = r.id === mine, nm = r.name || (names[r.id] && names[r.id].name) || (me ? displayName() : "Dr. Anonym");
    return `<li class="${me ? "me" : ""}"><span class="pos">${i + 1}</span><span class="who">${esc(r.av)} <b></b>${me ? ' <i>du</i>' : ""}</span><span class="val">${boardSort === "score" ? euro(r.score) : fmtTime(r.minutes)}</span><span class="sub">${r.rank ? "Rang " + esc(r.rank) + " · " : ""}${boardSort === "score" ? "Feierabend " + fmtTime(r.minutes) : euro(r.score)}</span></li>`.replace("<b></b>", `<b>${esc(nm)}</b>`);
  }).join("") : `<li class="empty">Noch niemand hat ${esc(ROUTES[k].name)} geschafft. Sei die erste Person.</li>`;
}
$("boardTabs").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; boardTab = b.dataset.k; for (const x of $("boardTabs").children) x.classList.toggle("on", x === b); renderBoard(); });
$("boardSort").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; boardSort = b.dataset.s; renderBoard(); });
$("profAvs").addEventListener("click", e => { const b = e.target.closest(".av-pick"); if (!b) return; profile.av = b.dataset.a; for (const x of $("profAvs").children) x.classList.toggle("on", x === b); });
$("btnProfSave").addEventListener("click", () => {
  profile.name = $("profName").value.trim().slice(0, 24); store.set(PROF_KEY, profile); pushBoard(); refreshTitle(); renderBoard();
  $("btnProfSave").lastElementChild.textContent = "✓"; setTimeout(() => { $("btnProfSave").lastElementChild.textContent = "💾"; }, 1400);
});
$("btnBoardClose").addEventListener("click", () => { if (boardReturn === "win" || boardReturn === "over") { mode = boardReturn; show("ovEnd"); } else { mode = "title"; show("ovTitle"); refreshTitle(); } });
$("btnBoard").addEventListener("click", () => openBoard("title"));
$("profChip").addEventListener("click", () => openBoard("title"));
$("btnEndBoard").addEventListener("click", () => { boardTab = lastRoute; openBoard(mode); });

// ---------- sharing ----------
async function shareRun() {
  const R = mission(), sc = run.final || scoreBreakdown(run.route);
  const text = `🏥🏃 Hospital Escape: Ich bin als ${R.title} aus dem Klinikum St. Sparen entkommen. Feierabend um ${fmtTime(run.minutes)} (Frist ${fmtTime(routeDeadline(run.route))}), ${euro(sc.total)} DRG-Erlös, Rang ${sc.rank} „${sc.rankName}“. Schaffst du das schneller?`;
  const url = window.top === window ? location.href.split("#")[0] : undefined;
  try { if (navigator.share) { await navigator.share({ title: "Hospital Escape", text, url }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
  try { await navigator.clipboard.writeText(text + (url ? " " + url : "")); $("btnShare").firstElementChild.textContent = "Kopiert ✓"; setTimeout(() => { $("btnShare").firstElementChild.textContent = "Ergebnis teilen"; }, 1800); }
  catch (e) { prompt("Zum Teilen kopieren:", text); }
}
$("btnShare").addEventListener("click", shareRun);
