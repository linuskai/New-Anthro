/* Hospital Escape 3D · your profile, saved missions, sharing, and one leaderboard for everyone who plays.
   Stored in Supabase without any account: each device holds a random secret (only its hash is stored), which is also
   the code to carry your progress to another device. Offline everything keeps working from this browser. */
const PROF_KEY = "hospital-escape-profile", SAVE_KEY = "hospital-escape-save-v13", TOKEN_KEY = "hospital-escape-token";
const SB = { url: "https://fmgkjtvohxczcexsvrlz.supabase.co", key: "sb_publishable_nY_jMQ22Xx37IrbnYBXSaA_ccsHkjOc" };
const AVATARS = ["🧑‍⚕️", "👩‍⚕️", "👨‍⚕️", "🦸", "🥷", "🧟", "🦄", "🦊", "🐙", "☕", "💅", "🏃"];
const BOARD_NIGHT = [["night_ward", "🛏️", "Nacht Station"], ["night_er", "🚑", "Nacht ZNA"]];
const store = { get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }, del: k => { try { localStorage.removeItem(k); } catch (e) {} } };
let profile = store.get(PROF_KEY) || { name: "", av: "🧑‍⚕️" };
let online = false; // true once the database answered
const newToken = () => [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, "0")).join("");
let token = store.get(TOKEN_KEY); if (!/^[0-9a-f]{32}$/.test(token || "")) { token = newToken(); store.set(TOKEN_KEY, token); }

async function rpc(fn, args) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 8000);
  try {
    const r = await fetch(`${SB.url}/rest/v1/rpc/${fn}`, { method: "POST", headers: { apikey: SB.key, "Content-Type": "application/json" }, body: JSON.stringify(args), signal: ctl.signal });
    if (!r.ok) throw new Error(fn + " " + r.status);
    const txt = await r.text(); online = true; return txt ? JSON.parse(txt) : null;
  } finally { clearTimeout(t); }
}
const nightRecords = () => store.get("hospital-escape-night-board") || {};

// ---------- syncing: the better of this device and the database wins ----------
async function syncCloud() {
  try {
    const localProf = store.get(PROF_KEY); // only what was set on this device goes up; a fresh device takes name and avatar from the database
    const st = await rpc("hx_sync", { p_token: token, p_name: localProf && localProf.name ? localProf.name : null, p_avatar: localProf ? localProf.av : null });
    if (!st) return;
    if (!profile.name && st.name) profile.name = st.name;
    if (!localProf && st.avatar) profile.av = st.avatar;
    store.set(PROF_KEY, profile);
    const recs = loadRecords(), nights = nightRecords(), best = st.best || {};
    for (const [k, r] of Object.entries(best)) {
      if (ROUTES[k] && !(recs[k] && recs[k].score >= r.score)) recs[k] = { score: r.score, minutes: Math.min(r.minutes, recs[k] ? recs[k].minutes : Infinity), rank: r.rank };
      if (k.startsWith("night_") && !(nights[k] >= r.score)) nights[k] = r.score;
    }
    store.set(REC_KEY, recs); store.set("hospital-escape-night-board", nights);
    for (const k of ROUTE_ORDER) if (recs[k] && !(best[k] && best[k].score >= recs[k].score && best[k].minutes <= recs[k].minutes)) submitScore(k);
    for (const [k, v] of Object.entries(nights)) if (!(best[k] && best[k].score >= v)) rpc("hx_submit", { p_token: token, p_mission: k, p_score: v, p_minutes: 0, p_rank: "" }).catch(() => {});
    if (!store.get(SAVE_KEY) && st.save && ROUTES[st.save.route]) store.set(SAVE_KEY, st.save);
    else if (store.get(SAVE_KEY)) rpc("hx_save", { p_token: token, p_data: store.get(SAVE_KEY) }).catch(() => {});
  } catch (e) { online = false; }
  if (mode === "title") refreshTitle();
}
syncCloud();
const displayName = () => profile.name || "Dr. Anonym";
function submitScore(k) {
  const r = loadRecords()[k || lastRoute]; if (!r) return;
  rpc("hx_submit", { p_token: token, p_mission: k || lastRoute, p_score: Math.round(r.score), p_minutes: Math.round(r.minutes), p_rank: r.rank || "" }).catch(() => {});
}
function submitNight(place, tasks) {
  const k = place === "er" ? "night_er" : "night_ward", n = nightRecords();
  if (!(n[k] >= tasks)) { n[k] = tasks; store.set("hospital-escape-night-board", n); }
  rpc("hx_submit", { p_token: token, p_mission: k, p_score: tasks, p_minutes: Math.round(run.minutes - NIGHT_START), p_rank: "" }).catch(() => {});
}

// ---------- saving a mission ----------
let saveT = null;
function saveCheckpoint() {
  if (!run || run.mode !== "mission" || run.routeFailed) return;
  const r = run, data = { v: 13, route: r.route, step: r.step, idx: r.idx, minutes: r.minutes, nerves: r.nerves, energy: r.energy, flags: [...r.flags], picked: [...r.picked], inv: r.inv,
    duties: r.duties, tasks: r.tasks, tasksTotal: r.tasksTotal, talks: r.talks, callsAcc: r.callsAcc, callsDec: r.callsDec, lives: r.lives, scoreLog: r.scoreLog || [], testi: r.testi || 0, spa: r.spa, lostMin: r.lostMin || 0,
    spotted: r.spotted ? [...r.spotted] : [], at: Date.now() };
  store.set(SAVE_KEY, data);
  clearTimeout(saveT); saveT = setTimeout(() => rpc("hx_save", { p_token: token, p_data: data }).catch(() => {}), 1500);
}
function clearCheckpoint() { store.del(SAVE_KEY); clearTimeout(saveT); rpc("hx_save", { p_token: token, p_data: null }).catch(() => {}); refreshTitle(); }
function resumeCheckpoint() {
  const d = store.get(SAVE_KEY); if (!d || !ROUTES[d.route]) return;
  initAudio(); hidePopups(); clearInputs(); lastMode = "mission"; lastRoute = d.route;
  newRun("mission", d.route);
  Object.assign(run, { step: d.step, idx: d.idx, minutes: d.minutes, nerves: d.nerves, energy: d.energy, flags: new Set(d.flags), picked: new Set(d.picked), inv: d.inv, duties: d.duties, tasks: d.tasks, tasksTotal: d.tasksTotal,
    talks: d.talks, callsAcc: d.callsAcc, callsDec: d.callsDec, lives: d.lives, scoreLog: d.scoreLog, testi: d.testi, spa: d.spa, lostMin: d.lostMin, spotted: new Set(d.spotted) });
  loadFloor(run.idx); run.clockSeen = run.minutes; renderInv();
  missionFlyIn(() => showIntro(`Gespeicherter Stand: ${mission().av} ${mission().name}, ${fmtTime(run.minutes)} Uhr. Frist ${fmtTime(routeDeadline(run.route))}.`));
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

// ---------- leaderboard, profile and the device code ----------
let boardTab = "stay", boardSort = "score", boardReturn = "title", boardRows = null;
const isNightTab = k => k.startsWith("night_");
const fmtCode = t => t.match(/.{1,8}/g).join("-").toUpperCase();
async function openBoard(from) {
  boardReturn = from || mode; mode = "board"; show("ovBoard"); $("ovBoard").scrollTop = 0;
  $("profName").value = profile.name; $("profName").placeholder = "Dr. Anonym";
  $("profAvs").innerHTML = AVATARS.map(a => `<button type="button" class="av-pick${a === profile.av ? " on" : ""}" data-a="${a}">${a}</button>`).join("");
  $("boardTabs").innerHTML = ROUTE_ORDER.map(k => [k, ROUTES[k].av, ROUTES[k].name]).concat(BOARD_NIGHT).map(([k, av, n]) => `<button type="button" class="${k === boardTab ? "on" : ""}" data-k="${k}">${av}<span>${esc(n)}</span></button>`).join("");
  $("devCode").textContent = fmtCode(token); $("codeMsg").textContent = "";
  boardRows = null; renderBoard(); loadBoard();
}
async function loadBoard() {
  const k = boardTab, s = isNightTab(k) ? "score" : boardSort;
  try { boardRows = await rpc("hx_board", { p_mission: k, p_sort: s === "time" ? "time" : "score", p_token: token }); } catch (e) { boardRows = null; online = false; }
  if (k === boardTab) renderBoard();
}
function renderBoard() {
  const k = boardTab, night = isNightTab(k);
  $("boardNote").textContent = online ? "Eine Bestenliste für alle, die Hospital Escape spielen. Ohne Konto: Dein Fortschritt hängt an diesem Gerät, mit dem Geräte-Code unten nimmst du ihn mit." : "Gerade offline: Du siehst nur die Ergebnisse dieses Geräts. Sie werden nachgereicht, sobald wieder Netz da ist.";
  $("boardSort").hidden = night;
  for (const b of $("boardSort").querySelectorAll("button")) b.classList.toggle("on", b.dataset.s === boardSort);
  let rows = boardRows ? boardRows.map(r => ({ ...r })) : [];
  if (!boardRows) {
    if (night) { const v = nightRecords()[k]; if (v != null) rows = [{ pos: 1, name: profile.name, avatar: profile.av, score: v, minutes: 0, me: true }]; }
    else { const r = loadRecords()[k]; if (r) rows = [{ pos: 1, name: profile.name, avatar: profile.av, ...r, me: true }]; }
  }
  const label = night ? BOARD_NIGHT.find(b => b[0] === k)[2] : ROUTES[k].name;
  $("boardList").innerHTML = rows.length ? rows.map(r => {
    const val = night ? `${r.score} Aufgaben` : boardSort === "score" ? euro(r.score) : fmtTime(r.minutes);
    const sub = night ? "Nachtdienst überlebt" : (r.rank ? "Rang " + esc(r.rank) + " · " : "") + (boardSort === "score" ? "Feierabend " + fmtTime(r.minutes) : euro(r.score));
    return `<li class="${r.me ? "me" : ""}"><span class="pos">${r.pos}</span><span class="who">${esc(r.avatar || "🧑‍⚕️")} <b>${esc(r.name || (r.me ? displayName() : "Dr. Anonym"))}</b>${r.me ? " <i>du</i>" : ""}</span><span class="val">${val}</span><span class="sub">${sub}</span></li>`;
  }).join("") : `<li class="empty">Noch niemand hat ${esc(label)} geschafft. Sei die erste Person.</li>`;
}
$("boardTabs").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; boardTab = b.dataset.k; for (const x of $("boardTabs").children) x.classList.toggle("on", x === b); boardRows = null; renderBoard(); loadBoard(); });
$("boardSort").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; boardSort = b.dataset.s; boardRows = null; renderBoard(); loadBoard(); });
$("profAvs").addEventListener("click", e => { const b = e.target.closest(".av-pick"); if (!b) return; profile.av = b.dataset.a; for (const x of $("profAvs").children) x.classList.toggle("on", x === b); });
$("btnProfSave").addEventListener("click", async () => {
  profile.name = $("profName").value.trim().slice(0, 24); store.set(PROF_KEY, profile); refreshTitle();
  $("btnProfSave").lastElementChild.textContent = "…";
  try { await rpc("hx_sync", { p_token: token, p_name: profile.name, p_avatar: profile.av }); $("btnProfSave").lastElementChild.textContent = "✓"; } catch (e) { $("btnProfSave").lastElementChild.textContent = "📴"; }
  setTimeout(() => { $("btnProfSave").lastElementChild.textContent = "💾"; }, 1400); loadBoard();
});
$("btnCodeCopy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(fmtCode(token)); $("codeMsg").textContent = "Kopiert. Gut aufheben: Wer den Code hat, spielt als du."; } catch (e) { prompt("Dein Geräte-Code:", fmtCode(token)); }
});
$("btnCodeUse").addEventListener("click", async () => {
  const raw = ($("codeIn").value || "").toLowerCase().replace(/[^0-9a-f]/g, "");
  if (!/^[0-9a-f]{32}$/.test(raw)) { $("codeMsg").textContent = "Das ist kein gültiger Code (32 Zeichen, 0–9 und A–F)."; return; }
  if (raw === token) { $("codeMsg").textContent = "Das ist schon der Code dieses Geräts."; return; }
  token = raw; store.set(TOKEN_KEY, token); store.del(PROF_KEY); profile = { name: "", av: "🧑‍⚕️" }; $("codeIn").value = ""; $("codeMsg").textContent = "Lade deinen Spielstand …";
  await syncCloud(); await openBoard(boardReturn); document.querySelector(".code-box").open = true;
  $("codeMsg").textContent = online ? "Übernommen. Dein Fortschritt ist jetzt auf diesem Gerät." : "Code gespeichert. Sobald Netz da ist, wird synchronisiert.";
});
$("btnBoardClose").addEventListener("click", () => { if (boardReturn === "win" || boardReturn === "over") { mode = boardReturn; show("ovEnd"); } else { mode = "title"; show("ovTitle"); refreshTitle(); } });
$("btnBoard").addEventListener("click", () => openBoard("title"));
$("profChip").addEventListener("click", () => openBoard("title"));
$("btnEndBoard").addEventListener("click", () => { boardTab = run && run.mode === "night" ? (run.place === "er" ? "night_er" : "night_ward") : lastRoute; openBoard(mode); });

// ---------- sharing ----------
async function shareRun() {
  const R = mission(), sc = run.final || scoreBreakdown(run.route);
  const text = `🏥🏃 Hospital Escape: Ich bin als ${R.title} aus dem Klinikum St. Sparen entkommen. Feierabend um ${fmtTime(run.minutes)} (Frist ${fmtTime(routeDeadline(run.route))}), ${euro(sc.total)} DRG-Erlös, Rang ${sc.rank} „${sc.rankName}“. Schaffst du das schneller?`;
  const url = window.top === window ? location.href.split("#")[0] : "https://hospital-escape.vercel.app";
  try { if (navigator.share) { await navigator.share({ title: "Hospital Escape", text, url }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
  try { await navigator.clipboard.writeText(text + " " + url); $("btnShare").firstElementChild.textContent = "Kopiert ✓"; setTimeout(() => { $("btnShare").firstElementChild.textContent = "Ergebnis teilen"; }, 1800); }
  catch (e) { prompt("Zum Teilen kopieren:", text + " " + url); }
}
$("btnShare").addEventListener("click", shareRun);
