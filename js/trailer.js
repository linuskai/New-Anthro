/* Hospital Escape 3D · the mission trailer: five short animated cards instead of one long sheet (the job, the way down
   with every sub-mission, the boss, what stops you, your tricks); the gear guide as tabs; item tips at the right moment. */

const FLOOR_ICON = { innere: "🛏️", ortho: "🦴", radio: "☢️", gastro: "🤢", derma: "🧴", cellar: "🕯️", er: "🚑", park: "🅿️", icu: "💓" };
const GOAL_ICON = { key: "🔑", lunchbox: "🥪", ticket: "🎫", approbation: "📜", zeugnis: "📄", binder: "📂", photo0: "📠", photo1: "📸", excel: "📊", photo5: "📸",
  bizepsfoto: "💪", probe: "💆", cream: "🧴", koffer: "🧳", ringlight: "💡", collab: "🤳", testi: "🎬" };
const ITEM_SHORT = { "2": "unsichtbar", c: "Personal erkennt dich nicht", m: "alle halten Abstand", f: "Personal dreht ab", "3": "alle in der Nähe k.o.", "4": "keine Anrufe",
  p: "lenkt alle ab", "5": "alle rennen zur Cafeteria", "7": "Internisten lesen statt jagen", "1": "+35 % Energie, schneller", "0": "+55 % Energie", "$": "+30 % Energie",
  "6": "+25 % Energie oder Orthopäde lässt dich durch", "+": "+75 % Energie", "9": "Taschenlampe wieder voll", "8": "löst Statistik-Fragen", "&": "Missionsgegenstand" };
const itemShort = c => (ITEM_SHORT[c] || "") + (ITEMS[c].dur && /\d+ s$/.test(ITEMS[c].dur) ? " · " + ITEMS[c].dur : ITEMS[c].dur === "an/aus" ? " · an/aus" : "");

// ---------- the trailer ----------
let tl = null;
function trailerSlides(R) {
  const k = run.route, dl = routeDeadline(k), fl = R.floors, lastF = fl[fl.length - 1], B = R.boss;
  const realMin = Math.round(dl / (typeof CLOCK === "number" ? CLOCK : .5) / 60), ride = R.ride[0].toUpperCase() + R.ride.slice(1);
  const S = [];
  S.push({ k: "Der Auftrag", html: `<div class="tl-slide s-job">
    <div class="tl-client"><span class="av">${R.av}</span><div><small>${esc(R.client)}</small><b>${esc(R.title)}</b><span>${esc(R.tagline)}</span></div></div>
    <p class="tl-big">Um <mark>${fmtTime(dl)}</mark> wartet ${esc(R.ride)}.<span>Sei pünktlich da. Mit allem, was verlangt wird.</span></p>
    <div class="tl-clock"><b class="c-now">17:00</b><i class="c-bar"><i></i></i><b class="c-dl">${fmtTime(dl)}</b></div>
    <div class="tl-facts"><span>⏱ ${fmtSpan(dl)} Spielzeit ≈ ${realMin} Min. echt</span><span>📍 ${esc(floorLabel(lastF))}</span><span class="bad">✗ zu spät = gescheitert</span></div></div>`,
    after: st => clockRun(st, dl) });
  const D = DEALS[k];
  if (D) S.push({ k: D.head, html: `<div class="tl-slide s-deal"><h2 class="tl-h">${esc(D.head)}</h2>
    <div class="tl-deal"><div class="dl-head"><span>🏥 Klinikum St. Sparen</span><span>${R.av} ${esc(D.org)}</span></div>
    ${D.rows.map(([w, old, neu], i) => `<div class="dl-row" style="--i:${i}"><b>${esc(w)}</b><s>${esc(old)}</s><em>${esc(neu)}</em></div>`).join("")}</div>
    <div class="tl-perks">${D.perks.map((p, i) => `<span style="--i:${i + D.rows.length}">${esc(p)}</span>`).join("")}</div></div>`, after: dealRun });
  const stops = fl.map((f, i) => {
    const L = LEVELS[f], last = i === fl.length - 1;
    const txt = o => { try { return typeof o.text === "function" ? o.text() : o.text; } catch (e) { return ""; } };
    const todo = R.goals.filter(g => g.lvl === f).map(g => `<span class="td goal"><i>${GOAL_ICON[g.id] || "★"}</i><span><b>${esc(g.title)}</b><small>${esc(txt(g))}</small></span></span>`)
      .concat(L.objectives.filter(o => o.main && !o.fin && (!o.for || o.for.includes(k))).map(o => `<span class="td goal obst"><i>🚧</i><span><b>${esc(o.title)}</b><small>${esc(txt(o))}</small></span></span>`));
    if (last) todo.push(`<span class="td boss">${B.av} <b>${esc(B.name)}</b></span>`, `<span class="td fin">${R.av} <b>${esc(ride)}</b></span>`);
    if (!todo.length) todo.push(`<span class="td pass">nur durch</span>`);
    return `<li${last ? ' class="last"' : ""}><span class="stop">${FLOOR_ICON[L.key] || "🏥"}</span><div class="st-body"><small>${esc(L.floor)}</small><b class="st-name">${esc(floorLabel(f))}</b><div class="tds">${todo.join("")}</div></div></li>`;
  });
  S.push({ k: "Dein Weg nach draußen", html: `<div class="tl-slide s-way"><h2 class="tl-h">${R.goals.length} Dinge holen. Dann raus.</h2>
    <ol class="tl-line" style="--n:${fl.length}">${stops.join("")}</ol>
    <p class="tl-note">🔒 Das Treppenhaus einer Etage öffnet erst, wenn dort alles erledigt ist. Der Weg führt nach unten.</p></div>`, after: wayRun });
  S.push({ k: "Am Ausgang wartet", html: `<div class="tl-slide s-boss"><p class="tl-kicker">Endgegner · ${esc(floorLabel(lastF))}</p>
    <div class="tl-boss" style="--bc:${B.color}"><span class="av">${B.av}</span><div><b>${esc(B.name)}</b><small>${esc(B.role)}</small></div></div>
    <p class="tl-quote">${esc(B.line)}</p>
    <p class="tl-kicker">Drei Wege vorbei</p>
    <div class="tl-ways"><span style="--i:0">💬<b>Reden</b><small>Glückssache</small></span><span style="--i:1">📝<b>Formular</b><small>klappt immer, kostet Zeit</small></span><span style="--i:2">⚔️<b>Kampf</b><small>Quiz-Duell</small></span></div></div>`,
    after: () => { setTimeout(() => sfx.stinger(), 250); } });
  S.push({ k: "Was dich aufhält", html: `<div class="tl-slide s-danger"><h2 class="tl-h">Drei Dinge halten dich auf</h2><div class="tl-threats">
    <div class="th" style="--i:0"><div class="demo d-time"><b>18:42</b><i>+12 Min</i></div><div><b>Zeit</b><p>Gespräche, Anrufe und Formulare kosten Minuten. Jeder Verlust blinkt rot an der Uhr.</p></div></div>
    <div class="th" style="--i:1"><div class="demo d-energy"><i></i></div><div><b>Energie</b><p>Stress, Schreck und Gestank saugen sie leer. 0 % = Burnout. Kaffee und Snacks laden auf.</p></div></div>
    <div class="th" style="--i:2"><div class="demo d-eye"><i>▲</i></div><div><b>Gesehen werden</b><p>Dreieck über den Köpfen: weiß = ahnungslos, gelb = misstrauisch, rot = kommt. Leicht ziehen = schleichen.</p></div></div></div></div>` });
  const kit = INV_ORDER.filter(c => run.inv[c]);
  S.push({ k: "Deine Tricks", html: `<div class="tl-slide s-kit"><h2 class="tl-h">Damit kommst du durch</h2>
    <div class="tl-kit">${kit.map((c, i) => `<button type="button" class="kt${i ? "" : " on"}" data-k="${c}" style="--i:${i}"><span>${ITEMS[c].emoji}</span><b>${esc(ITEMS[c].name)}</b><em>${esc(itemShort(c))}</em></button>`).join("")}</div>
    <p class="tl-kitinfo" id="tlKitInfo"></p>
    <p class="tl-note">Antippen = Erklärung. Im Spiel unten am Bildschirm antippen = benutzen. Unterwegs findest du mehr. Alle Items: 🎒 im Pausenmenü.</p></div>`,
    after: () => kitInfo(kit[0]) });
  return S;
}
function showBrief(fromGame) {
  if (fromGame) return openMC();
  const R = mission(); tl = { i: 0, slides: trailerSlides(R), token: 0 };
  $("ovBrief").style.setProperty("--mc", R.color);
  $("tlDots").innerHTML = tl.slides.map(() => "<i></i>").join("");
  mode = "brief"; show("ovBrief"); tlGo(0);
  setTimeout(() => $("btnBrief").focus({ preventScroll: true }), 50);
}
function tlGo(i) {
  if (!tl) return;
  const dir = i < tl.i ? -1 : 1; tl.i = Math.max(0, Math.min(tl.slides.length - 1, i)); tl.token++;
  const s = tl.slides[tl.i], st = $("tlStage"), last = tl.i === tl.slides.length - 1;
  st.innerHTML = s.html; st.firstElementChild.classList.add(dir < 0 ? "back" : "fwd");
  $("tlEyebrow").textContent = `${tl.i + 1}/${tl.slides.length} · ${s.k}`;
  [...$("tlDots").children].forEach((d, j) => d.className = j < tl.i ? "done" : j === tl.i ? "on" : "");
  $("btnTlBack").style.visibility = tl.i ? "visible" : "hidden"; $("btnTlSkip").hidden = last;
  $("btnBrief").innerHTML = last ? "<span>Mission starten</span><span>▶</span>" : "<span>Weiter</span><span>→</span>";
  if (s.after) s.after(st, tl.token);
  sfx.tick();
}
function clockRun(st, dl) {
  const tok = tl.token, t0 = performance.now(), now = st.querySelector(".c-now"), bar = st.querySelector(".c-bar i");
  const step = t => { if (!tl || tl.token !== tok) return; const k = Math.min(1, (t - t0 - 500) / 1700), e = k < 0 ? 0 : 1 - (1 - k) ** 3;
    now.textContent = fmtTime(dl * e); bar.style.width = e * 100 + "%"; if (k < 1) requestAnimationFrame(step); else { now.classList.add("done"); sfx.beep(); } };
  requestAnimationFrame(step);
}
function wayRun(st) {
  const tok = tl.token, lis = [...st.querySelectorAll(".tl-line li")];
  lis.forEach((li, i) => setTimeout(() => { if (!tl || tl.token !== tok) return; lis.forEach(x => x.classList.remove("now")); li.classList.add("on", "now"); (i === lis.length - 1 ? sfx.ding : sfx.tick)(); }, 350 + i * 650));
}
function dealRun(st) {
  const tok = tl.token, n = st.querySelectorAll(".dl-row").length;
  for (let i = 0; i <= n; i++) setTimeout(() => { if (tl && tl.token === tok) (i < n ? sfx.pick : sfx.ding)(); }, 900 + i * 450);
}
function kitInfo(c) {
  const el = $("tlKitInfo"); if (!el || !c) return;
  for (const b of document.querySelectorAll(".tl-kit .kt")) b.classList.toggle("on", b.dataset.k === c);
  el.innerHTML = `<b>${ITEMS[c].emoji} ${esc(ITEMS[c].name)}</b> ${esc(ITEMS[c].desc)}`;
}
$("tlStage").addEventListener("click", e => { const b = e.target.closest(".kt"); if (b) { kitInfo(b.dataset.k); sfx.tick(); } });
$("btnBrief").addEventListener("click", () => { initAudio(); if (!tl || tl.i >= tl.slides.length - 1) { tl = null; beginMission(); } else tlGo(tl.i + 1); });
$("btnTlBack").addEventListener("click", () => tl && tlGo(tl.i - 1));
$("btnTlSkip").addEventListener("click", () => { initAudio(); tl = null; beginMission(); });
{ let sx = null, sy = 0; const st = $("tlStage");
  st.addEventListener("pointerdown", e => { sx = e.clientX; sy = e.clientY; });
  st.addEventListener("pointerup", e => { if (sx == null || !tl) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null; if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) tlGo(tl.i + (dx < 0 ? 1 : -1)); }); }
addEventListener("keydown", e => { if (mode !== "brief" || !tl) return; if (e.key === "ArrowRight") tlGo(tl.i + 1); if (e.key === "ArrowLeft") tlGo(tl.i - 1); });

// ---------- the gear guide: tabs, one line per item, tap for the details ----------
let guideFrom = "title", guideTab = null;
function showItemGuide() {
  guideFrom = mode === "pause" ? "pause" : "title";
  const have = guideFrom === "pause" && run && run.inv ? run.inv : null;
  const tabs = (have && Object.keys(have).length ? [["dabei", "🎒", "Dabei"]] : []).concat(ITEM_CATS.filter(([c]) => Object.values(ITEMS).some(it => it.cat === c)).map(([c, ico]) => [c, ico, c]));
  if (!tabs.some(t => t[0] === guideTab)) guideTab = tabs[0][0];
  $("guideTabs").innerHTML = tabs.map(([k, ico, l]) => `<button type="button" role="tab" data-t="${esc(k)}" class="${k === guideTab ? "on" : ""}"><span>${ico}</span>${esc(l)}</button>`).join("");
  renderGuide(have); show("ovGuide"); $("ovGuide").scrollTop = 0;
}
function renderGuide(have) {
  const cat = ITEM_CATS.find(c => c[0] === guideTab);
  const keys = guideTab === "dabei" ? INV_ORDER.filter(k => have && have[k]) : Object.keys(ITEMS).filter(k => ITEMS[k].cat === guideTab && !ITEMS[k].mission);
  $("guideBody").innerHTML = (cat ? `<p class="ig-sub">${esc(cat[2])}</p>` : "") + keys.map(k => { const it = ITEMS[k], n = have && have[k];
    return `<button type="button" class="ig-row" data-k="${k}" aria-expanded="false"><span class="ig-ico">${it.emoji}</span><span class="ig-main"><b>${esc(it.name)}</b><em>${esc(itemShort(k))}</em></span>${n ? `<span class="ig-n">×${n}</span>` : ""}
      <span class="ig-more">${esc(it.desc)}${it.where ? `<small>Fundort: ${esc(it.where)}</small>` : ""}</span></button>`; }).join("");
}
$("guideTabs").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; guideTab = b.dataset.t; for (const x of $("guideTabs").children) x.classList.toggle("on", x === b); renderGuide(guideFrom === "pause" && run ? run.inv : null); sfx.tick(); });
$("guideBody").addEventListener("click", e => { const r = e.target.closest(".ig-row"); if (!r) return; const open = r.getAttribute("aria-expanded") !== "true";
  for (const x of $("guideBody").querySelectorAll(".ig-row")) x.setAttribute("aria-expanded", "false"); r.setAttribute("aria-expanded", open ? "true" : "false"); sfx.tick(); });
function closeGuide() { if (guideFrom === "pause" && run) { mode = "pause"; show("ovPause"); } else { mode = "title"; show("ovTitle"); } }
$("btnGuideGo").addEventListener("click", closeGuide); $("btnGuideSkipTop").addEventListener("click", closeGuide);

// ---------- tips at the moment an item would help: once per item and device ----------
const TIPS_KEY = "hospital-escape-tips";
let tipsSeen = (() => { try { return JSON.parse(localStorage.getItem(TIPS_KEY)) || {}; } catch (e) { return {}; } })(), tipCool = 8;
function itemTip(k, text) {
  if (tipsSeen[k] || !hasItem(k) || $("itemTip")) return false;
  const slot = document.querySelector(`#inv .slot[data-k="${k}"]`); if (!slot) return false;
  tipsSeen[k] = 1; try { localStorage.setItem(TIPS_KEY, JSON.stringify(tipsSeen)); } catch (e) {}
  const r = slot.getBoundingClientRect(), el = document.createElement("div"); el.id = "itemTip";
  el.innerHTML = `<b>${ITEMS[k].emoji} Tipp</b><span>${esc(text)}</span>`;
  document.body.appendChild(el);
  const w = el.offsetWidth, h = el.offsetHeight, cx = r.left + r.width / 2;
  if (getComputedStyle($("inv")).flexDirection === "column") { // items run down the right edge: point sideways
    const top = Math.max(8, r.top + r.height / 2 - h / 2); el.classList.add("side");
    el.style.left = Math.max(8, r.left - w - 12) + "px"; el.style.top = top + "px"; el.style.setProperty("--ay", (r.top + r.height / 2 - top) + "px");
  } else { el.style.left = Math.max(8, Math.min(innerWidth - w - 8, cx - w / 2)) + "px"; el.style.bottom = (appH() - r.top + 12) + "px"; el.style.setProperty("--ax", (cx - Math.max(8, Math.min(innerWidth - w - 8, cx - w / 2))) + "px"); }
  slot.classList.add("tip"); sfx.beep(); tipCool = 25;
  const off = () => { el.remove(); const s = document.querySelector(`#inv .slot[data-k="${k}"]`); if (s) s.classList.remove("tip"); };
  setTimeout(off, 7000); el.addEventListener("click", off);
  return true;
}
function gameTips(dt, maxAw, safe) {
  if (!run || run.mode !== "mission" || mode !== "play" || (tipCool -= dt) > 0) return;
  if (!safe && maxAw >= 1) return itemTip("m", "Jemand kommt auf dich zu. Noro-Maske antippen: 15 s halten ALLE Abstand.") || itemTip("3", "Jemand kommt auf dich zu. Spray antippen: alle in der Nähe 7 s außer Gefecht.");
  if (!safe && maxAw >= .35) return itemTip("2", "Jemand wird misstrauisch. Klemmbrett antippen: 12 s lang sieht dich niemand.") || itemTip("p", "Kuli antippen: Er fliegt in Blickrichtung, alle schauen dorthin.");
  if (call) return itemTip("4", "Zu viele Anrufe? Flugmodus-Pieper antippen: 60 s Ruhe.");
  if (run.energy <= 45) return itemTip("1", "Energie wird knapp. Kaffee antippen: +35 %.") || itemTip("0", "Energie wird knapp. Energydrink antippen: +55 %.") || itemTip("$", "Energie wird knapp. Donut antippen: +30 %.");
  if (lampVisible() && player.lamp < 30) return itemTip("9", "Die Lampe wird schwach. Batterie antippen: wieder 100 %.");
}
