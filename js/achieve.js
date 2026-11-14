/* Hospital Escape 3D · achievements and the daily shift.
   Achievements listen to the events the game already reports for the statistics (track), so nothing else needs to know about them.
   The daily shift ("Tagesschicht"): the same mission for everyone today, 30 minutes less time, 80 % energy, its own leaderboard. */

const ACH_KEY = "hospital-escape-achievements";
const ACHIEVEMENTS = [
  { id: "first", ico: "🚪", n: "Erste Flucht", d: "Eine Mission geschafft. Der Anfang vom Ende." },
  { id: "home", ico: "🏠", n: "Einfach heim", d: "Pünktlich zu Hause. Kim ist sprachlos." },
  { id: "all", ico: "🗺️", n: "Alle Wege führen raus", d: "Alle sechs Missionen geschafft." },
  { id: "ninja", ico: "🥷", n: "Ninja-Assistenzarzt", d: "Eine Mission geschafft, ohne auf einer Etage entdeckt zu werden." },
  { id: "early", ico: "⏰", n: "Zu früh für die Klinik", d: "Mit mehr als zwei Stunden Puffer raus. Verdächtig." },
  { id: "rankS", ico: "💎", n: "Leistungsträger:in", d: "Rang S. Das Controlling ist gerührt." },
  { id: "ortho", ico: "💪", n: "Bizeps besiegt", d: "Einen Orthopäden im Kampf geschlagen." },
  { id: "boss", ico: "👑", n: "Endgegner gestürzt", d: "Einen Endgegner besiegt." },
  { id: "stairs", ico: "🪜", n: "Treppenhaus-Profi", d: "Fünf Zwischenstopps im Treppenhaus ohne Zeitverlust." },
  { id: "pw", ico: "🔐", n: "IT-Sicherheit", d: "Das Passwort-Terminal ohne Fehler überstanden." },
  { id: "coffee", ico: "☕", n: "Koffein-Kreislauf", d: "Zehn Kaffee getrunken. Insgesamt. Hoffentlich." },
  { id: "night", ico: "🌅", n: "Überlebt bis 7:30", d: "Einen Nachtdienst überstanden." },
  { id: "burnout", ico: "🫠", n: "Gelebte Realität", d: "Einen Burnout gehabt. Im Spiel. Hoffentlich nur im Spiel." },
  { id: "late", ico: "🚕", n: "Zu spät, aber mit Stil", d: "Die Abholung verpasst." },
  { id: "daily", ico: "📅", n: "Tagesschicht", d: "Eine Tagesschicht geschafft." },
  { id: "share", ico: "📸", n: "Medfluencer", d: "Ein Ergebnis geteilt." },
];
const achState = () => store.get(ACH_KEY) || { got: {}, n: {} };
function achCount(k, by = 1) { const s = achState(); s.n[k] = (s.n[k] || 0) + by; store.set(ACH_KEY, s); return s.n[k]; }
function unlock(id) {
  const s = achState(); if (s.got[id]) return; const a = ACHIEVEMENTS.find(x => x.id === id); if (!a) return;
  s.got[id] = Date.now(); store.set(ACH_KEY, s);
  const d = document.createElement("div"); d.className = "ach-pop"; d.innerHTML = `<span>${a.ico}</span><div><small>Erfolg freigeschaltet</small><b>${esc(a.n)}</b><i>${esc(a.d)}</i></div>`;
  document.body.appendChild(d); setTimeout(() => d.classList.add("out"), 3600); setTimeout(() => d.remove(), 4200);
  if (typeof successJingle === "function") successJingle("small");
  _track("achievement", { id });
}
// listen to what the game reports anyway
const _track = track;
track = function (k, d = {}) {
  _track(k, d);
  try {
    if (k === "mission_win") {
      unlock("first"); if (d.route === "stay") unlock("home");
      const recs = loadRecords(); if (ROUTE_ORDER.every(r => recs[r] || r === d.route)) unlock("all");
      if (run && run.spotted && run.spotted.size === 0) unlock("ninja");
      if (run && routeDeadline(d.route) - d.minutes > 120) unlock("early");
      if (d.rank === "S") unlock("rankS");
      if (run && run.daily) unlock("daily");
    }
    if (k === "battle_end" && d.ok) unlock(d.boss ? "boss" : "ortho");
    if (k === "stair" && !d.lost) { if (achCount("stairClean") >= 5) unlock("stairs"); if (d.kind === "pw") unlock("pw"); }
    if (k === "night_win") unlock("night");
    if (k === "burnout") unlock("burnout");
    if (k === "mission_fail") unlock("late");
    if (k === "share") unlock("share");
  } catch (e) {}
};

// the list, shown on the profile page
function renderAchievements() {
  const s = achState(), got = ACHIEVEMENTS.filter(a => s.got[a.id]).length, el = $("achList"); if (!el) return;
  $("achHead").textContent = `🏆 Erfolge · ${got} von ${ACHIEVEMENTS.length}`;
  el.innerHTML = ACHIEVEMENTS.map(a => `<li class="${s.got[a.id] ? "got" : ""}" title="${esc(a.d)}"><span>${s.got[a.id] ? a.ico : "🔒"}</span><b>${esc(a.n)}</b><small>${esc(a.d)}</small></li>`).join("");
}

// ---------- the daily shift ----------
const dayIndex = () => { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };
const dayKey = (i = dayIndex()) => "day_" + [...String(i)].map(c => "abcdefghij"[+c]).join(""); // the database wants letters only
const dailyRoute = () => ROUTE_ORDER[(dayIndex() * 7 + 3) % ROUTE_ORDER.length];
function startDaily() {
  window.__daily = true; initAudio(); startStory("mission", dailyRoute());
}
function refreshDaily() {
  const b = $("btnDaily"); if (!b) return; const R = ROUTES[dailyRoute()], best = (store.get("hospital-escape-daily") || {})[dayKey()];
  b.querySelector("small").textContent = `Heute: ${R.av} ${R.title} · 30 Min. weniger Zeit, 80 % Energie${best ? " · dein Bestes: " + euro(best) : ""}`;
}
