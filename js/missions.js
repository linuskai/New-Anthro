/* Hospital Escape 3D · escape missions: choosing one, its intro film, the briefing, Mission Control, the boss at the way out,
   the paperwork penalty and a clock that shows every lost minute. */

const goalsDoneCount = () => mission().goals.filter(goalDone).length;
const routeDeadline = k => ROUTES[k] ? ROUTES[k].deadline : 0;
const fmtSpan = m => { m = Math.max(0, Math.round(m)); const h = Math.floor(m / 60); return h ? `${h} h ${String(m % 60).padStart(2, "0")} min` : `${m} min`; };
const lineMinutes = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m - SHIFT_END; };

// ---------- the floor: barrier, boss ----------
const BOSS_SPEC = {
  stay: () => TYPES.C.spec(),
  pharma: () => ({ skin: SKIN[4], hair: 0x2b1d14, hairStyle: "bun", shirt: 0xf2f2f2, pants: 0x2f3440, jacket: 0x2f3440, glasses: "normal", acc: "folder", mood: "neutral" }),
  consult: () => ({ skin: SKIN[1], hair: 0x5a3a22, hairStyle: "short", beard: 0x5a3a22, shirt: 0xc0322a, pants: 0x3a4a6a, jacket: 0x6a6a5a, acc: "clipboard", build: "big" }),
  botox: () => ({ skin: SKIN[0], hair: 0xd9b26c, hairStyle: "bun", shirt: 0xe8f4f4, pants: 0xe8f4f4, scrubs: true, glasses: "normal", acc: "chart", mood: "neutral" }),
  ship: () => ({ skin: SKIN[2], hair: 0x8c8c8c, hairStyle: "cap", shirt: 0x3a4a6a, pants: 0x2f3440, jacket: 0x2a3550, beard: 0x8c8c8c, build: "big", acc: "folder" }),
  influ: () => ({ skin: SKIN[5], hair: 0x111111, hairStyle: "long", shirt: 0x111111, pants: 0x111111, jacket: 0x222222, glasses: "thick", acc: "laptop", mood: "neutral" }),
};
function prepareMissionFloor() {
  const L = LEVELS[run.idx];
  // any ride but your own car: someone has already lifted the barrier for you
  if (L.final && run.route !== "stay") for (const p of level.props) if (p.kind === "=") { grid[Math.floor(p.y)][Math.floor(p.x)] = "."; p.open = true; run.flags.add("barrier"); }
  level.boss = null;
  if (isLastFloor()) spawnBoss();
}
function spawnBoss() {
  const B = mission().boss; let target = null;
  if (LEVELS[run.idx].final) { const j = level.props.find(p => p.kind === "j"); if (j) target = [Math.floor(j.x), Math.floor(j.y)]; }
  else if (level.exit) target = level.exit;
  if (!target) return;
  const path = bfs(level.start[0], level.start[1], target[0], target[1], true, (x, y) => playerPass(x, y) || cell(x, y) === "=");
  if (!path || path.length < 4) return;
  let spot = null;
  for (let i = path.length - 3; i > 1 && !spot; i--) { const [x, y] = path[i]; if (cell(x, y) === ".") spot = [x, y]; }
  if (!spot) return;
  TYPES.boss = { key: "boss", label: B.name.toUpperCase(), role: B.role, who: () => B.name, av: B.av, color: B.color, spec: BOSS_SPEC[run.route] || BOSS_SPEC.stay, static: true, walk: 0, approach: 0, range: 0, fov: 1, detect: 0, barks: [B.line] };
  const e = spawnEnemy(level, "boss", spot[0] + .5, spot[1] + .5);
  e.static = true; e.boss = true; e.def = B; e.tri.material = TRI_MAT.spot;
  grid[spot[1]][spot[0]] = "U"; level.boss = e;
}

// ---------- the boss ----------
function bossDialog(e) {
  const B = e.def, base = { sp: e.person.sp, av: B.av, color: B.color, name: B.name, role: B.role + " · Endgegner" };
  setExpression(e.person, "angry");
  const clear = text => {
    e.cleared = true; e.done = true; grid[e.ty][e.tx] = "."; run.talks++;
    const side = DIRS.find(([dx, dy]) => cell(e.tx + dx, e.ty + dy) === "#") || [1, 0];
    e.x = e.tx + .5 + side[0] * .62; e.y = e.ty + .5 + side[1] * .62; e.tri.visible = false;
    e.label.material.map = labelTex("✓ " + B.name.toUpperCase(), "#7b8a85", "#fff"); e.label.material.needsUpdate = true;
    setExpression(e.person, "happy"); emote(e, pick(["🤝", "😮", "🙄"])); sfx.ding(); addScore(300, "Endgegner: " + B.name);
    return { text, stamps: [good("Weg frei")] };
  };
  const again = () => { player.inv = 1.5; e.cool = 3; };
  const chance = Math.min(.85, .45 + run.nerves * .08);
  openDialog({ ...base, text: B.line,
    options: [
      { label: B.talk[0], hint: Math.round(chance * 100) + " % · sonst −1 Nerv", act: () => Math.random() < chance ? clear(B.talk[1]) : (setExpression(e.person, "angry"), { text: "„Netter Versuch.“ " + B.name + " verschränkt die Arme. Es wird nicht besser. Es wird nie besser.", stamps: pen({ nerves: 1 }) }) },
      { label: "Formular ausfüllen (kostet Zeit, klappt immer)", hint: "Bürokratie-Minispiel", act: () => ({ next: () => formGame(B.form, 2, lost => openDialog({ ...base, text: `Du füllst aus. Durchschlag gelb, Durchschlag rosa, Original für die Ablage im Keller. ${B.name} prüft jede Zeile. Mit Lineal.`, options: [{ label: "Formular überreichen", act: () => clear(`„Sauber. Stempel. Gehen Sie.“ Das hat dich ${lost} Minuten gekostet.`) }], onClose: again })) }) },
      { label: `Kämpfen! Stethoskop gegen ${B.weapon}`, hint: "Kampf · bei Niederlage −1 Nerv", act: () => ({ next: () => fightGame(e, ok => openDialog({ ...base, text: ok ? `${B.name} sitzt auf dem Boden, das Stethoskop elegant um das Handgelenk gewickelt. „Das… steht so in keiner Dienstvereinbarung.“` : `${B.name} rückt den ${B.weapon} zurecht. „Nächstes Mal mit Termin.“`,
        options: [{ label: ok ? "Kittel richten. Gehen." : "Aufstehen. Würde suchen.", act: () => ok ? clear("Der Weg ist frei. Hinter dir applaudiert jemand. Es ist Frau Bozkurt.") : { text: "Du stehst wieder. Irgendwie.", stamps: pen({ nerves: 1, energy: 10 }) } }], onClose: again }), { weapon: B.weapon, coat: B.coat, place: LEVELS[run.idx].short + " · ENDGEGNER", boss: true }) }) },
      { label: "„Ich komme gleich wieder.“", act: () => ({ text: "„Ich warte. Ich habe Zeit. Sie nicht.“" }) },
    ], onClose: again });
}

// ---------- paperwork: the penalty that costs real game time ----------
const FORM_FIELDS = ["Patientenaufkleber", "Unterschrift", "Datum", "Kostenstelle 4711", "Stempel", "Durchschlag (gelb)", "Unterschrift (nochmal)", "ICD-Code", "Uhrzeit", "Kürzel", "Fallnummer", "Ort, Datum", "Kreuz bei „Nein“", "Name in Druckbuchstaben"];
function formGame(title, n, done) {
  const steps = 4 + Math.min(4, n), order = [...FORM_FIELDS].sort(() => Math.random() - .5).slice(0, steps);
  const shown = [...order, ...FORM_FIELDS.filter(f => !order.includes(f)).sort(() => Math.random() - .5).slice(0, 2)].sort(() => Math.random() - .5);
  let i = 0, wrong = 0; const t0 = performance.now(), base = 2 + n * 2;
  const ov = document.createElement("div"); ov.id = "form";
  ov.innerHTML = `<div class="fm-card"><div class="fm-head"><b>FORMULAR ${Math.floor(Math.random() * 90 + 10)}${pick(["b", "c", "-A", "/2"])}</b><small>${esc(title)}</small></div>
    <div class="fm-now">Jetzt ausfüllen: <b></b></div><div class="fm-grid">${shown.map(f => `<button type="button" class="fm-btn" data-k="${esc(f)}">${esc(f)}</button>`).join("")}</div>
    <div class="fm-foot"><span class="fm-prog"></span><span class="fm-lost"></span></div></div>`;
  document.body.appendChild(ov); mode = "dialog"; clearInputs();
  const nowEl = ov.querySelector(".fm-now b"), lostEl = ov.querySelector(".fm-lost"), prog = ov.querySelector(".fm-prog");
  const lostNow = () => Math.round(base + wrong * 3 + (performance.now() - t0) / 2500);
  const show = () => { nowEl.textContent = order[i]; ov.querySelector(".fm-now").dataset.k = order[i]; prog.textContent = `Feld ${i + 1} von ${steps}`; };
  const tick = setInterval(() => { lostEl.textContent = "+" + lostNow() + " Min"; }, 200); show();
  ov.querySelector(".fm-grid").addEventListener("click", ev => {
    const b = ev.target.closest(".fm-btn"); if (!b || b.disabled) return;
    if (b.dataset.k === order[i]) { b.disabled = true; b.classList.add("ok"); sfx.paper(); i++; if (i >= steps) return finish(); show(); }
    else { wrong++; b.classList.remove("bad"); void b.offsetWidth; b.classList.add("bad"); sfx.knock(); }
  });
  function finish() {
    clearInterval(tick); const lost = lostNow();
    ov.querySelector(".fm-card").classList.add("stamped"); sfx.ding();
    setTimeout(() => { ov.remove(); run.minutes += lost; clockLoss(lost, "Papierkram"); mode = "play"; done(lost); }, 650);
  }
}

// ---------- the clock: every lost minute is visible ----------
function clockLoss(mins, why) {
  if (!run || run.mode !== "mission" || mins < 1) return;
  run.lostMin = (run.lostMin || 0) + mins; run.clockSeen = run.minutes;
  const el = document.createElement("div"); el.className = "clock-loss"; el.textContent = `+${Math.round(mins)} Min${why ? " · " + why : ""}`;
  const r = $("hudClock").getBoundingClientRect(); el.style.left = Math.max(8, r.left) + "px"; el.style.top = (r.bottom + 4) + "px";
  document.body.appendChild(el); setTimeout(() => el.remove(), 2600);
  $("hudClock").classList.remove("hit"); void $("hudClock").offsetWidth; $("hudClock").classList.add("hit");
}
function clockWatch() {
  if (!run || run.mode !== "mission") return;
  if (run.clockSeen == null) run.clockSeen = run.minutes;
  const jump = run.minutes - run.clockSeen;
  if (jump > 1.5) clockLoss(jump); else run.clockSeen = run.minutes;
}
function updateRouteClock() {
  if (run.mode !== "mission" || run.routeFailed) return;
  const left = routeDeadline(run.route) - run.minutes;
  if (left < 30 && !run.warned2) { run.warned2 = true; showToast(mission().av, "#e2483d", "Noch 30 Minuten!", `Um ${fmtTime(routeDeadline(run.route))} ist ${mission().ride} weg. Beeil dich.`, []); sfx.beep(); }
  if (left <= 0) missionFailed();
}
function updateRouteChip() {
  const c = $("chipRoute"); if (!c || !run) return;
  if (run.mode !== "mission") { c.hidden = true; return; }
  const R = mission(), left = routeDeadline(run.route) - run.minutes;
  c.hidden = false; c.textContent = `${R.av} ${goalsDoneCount()}/${R.goals.length} · ⏱ ${fmtSpan(left)} bis ${fmtTime(routeDeadline(run.route))}`;
  c.classList.toggle("warn", left < 45);
}

// ---------- hospital announcements ----------
function missionTick(dt) {
  if (run.mode !== "mission") return;
  run.announceT -= dt;
  if (run.announceT <= 0 && toastT <= 0 && !call) {
    run.announceT = 75 + Math.random() * 45;
    tone(660, 0, .35, "sine", .05); tone(523, .4, .5, "sine", .05);
    showToast("📢", "#2d3f8f", "Durchsage · Klinikleitung", "„" + pick(ANNOUNCE) + "“", []);
  }
}

// ---------- choosing a mission ----------
function showSelect() {
  mode = "select"; hidePopups();
  const recs = loadRecords();
  $("selList").innerHTML = ROUTE_ORDER.map(k => {
    const R = ROUTES[k], r = recs[k];
    return `<button type="button" class="sel-card" data-k="${k}" style="--mc:${R.color}"><span class="sel-av">${R.av}</span><span class="sel-body"><span class="sel-kind">${esc(R.name)}${r ? ' · <i class="ok">✓ geschafft</i>' : ""}</span><b>${esc(R.title)}</b><small>${esc(R.tagline)}</small>
      <span class="sel-meta"><span>⏱ bis ${fmtTime(routeDeadline(k))}</span><span>${"★".repeat(R.stars)}${"☆".repeat(3 - R.stars)}</span><span>${R.floors.length} Etagen</span></span>
      <em>${r ? `Rekord: ${r.score.toLocaleString("de-DE")} € · ${fmtTime(r.minutes)}` : "Noch nicht gespielt"}</em></span></button>`;
  }).join("");
  show("ovSelect"); $("ovSelect").scrollTop = 0;
  setTimeout(() => { const f = document.querySelector(".sel-card"); if (f) f.focus({ preventScroll: true }); }, 50);
}
$("selList").addEventListener("click", e => { const b = e.target.closest(".sel-card"); if (!b) return; sfx.tick(); startStory("mission", b.dataset.k); });
$("btnSelBack").addEventListener("click", () => { mode = "title"; show("ovTitle"); });

// ---------- the intro film: a phone in your hand while the camera moves through the doctors' room ----------
function phoneHtml(ui) {
  const head = { chat: "WhatsApp", video: "● Videoanruf", slides: "PowerPoint · Pitch.pptx", voice: "Sprachnachricht · 4:12", call: "📞 Eingehender Anruf", insta: "Direktnachricht" }[ui.kind] || "";
  let body = "";
  if (ui.kind === "chat" || ui.kind === "insta") body = ui.msgs.map((m, i) => { const [who, t] = Array.isArray(m) ? m : ["them", m]; return `<p class="bub ${who === "me" ? "me" : ""}" style="--d:${.4 + i * 1.1}s">${esc(t)}</p>`; }).join("");
  else if (ui.kind === "slides") body = ui.msgs.map((t, i) => `<p class="slide" style="--d:${.3 + i * 1.3}s">${esc(t)}</p>`).join("");
  else body = `<div class="ph-face">${ui.kind === "voice" ? '<i class="wave"></i>' : esc([...ui.from][0])}</div>` + ui.msgs.map((t, i) => `<p class="ph-sub" style="--d:${.5 + i * 1.6}s">${esc(t)}</p>`).join("");
  return `<div class="phone ${ui.kind}"><div class="ph-top"><b>${esc(ui.from)}</b><small>${esc(head)}</small></div><div class="ph-body">${body}</div></div>`;
}
function storyPhone(ui) {
  const el = $("storyPhone");
  if (!ui) { el.hidden = true; el.innerHTML = ""; return; }
  el.innerHTML = phoneHtml(ui); el.hidden = false;
  const n = ui.msgs.length; for (let i = 0; i < n; i++) setTimeout(() => { if (!el.hidden) (ui.kind === "slides" ? sfx.paper : sfx.beep)(); }, (ui.kind === "slides" ? 300 + i * 1300 : 400 + i * 1100));
}

// ---------- briefing and Mission Control share one sheet ----------
function goalWhere(g) { return floorLabel(g.lvl); }
function missionSheet(live) {
  const R = mission(), k = run.route, dl = routeDeadline(k), now = live ? run.minutes : 0, left = dl - now;
  const floors = R.floors.map((f, i) => `<span class="fl ${live && i < run.step ? "done" : live && i === run.step ? "now" : ""}">${esc(floorLabel(f))}</span>`).join('<i class="arr">→</i>');
  const goals = R.goals.map(g => { const ok = live && goalDone(g); return `<li class="${ok ? "done" : ""}"><span class="ck">${ok ? "✓" : ""}</span><span><b>${esc(g.title)}</b> · ${esc(typeof g.text === "function" ? g.text() : g.text)}<small>${esc(goalWhere(g))}</small></span></li>`; }).join("");
  const kit = Object.keys(KIT_HELP).filter(c => !live || hasItem(c)).map(c => `<li><span class="kit-ico">${ITEMS[c].emoji}</span><span><b>${esc(ITEMS[c].name)}</b> <em>${esc(KIT_HELP[c][0])}</em><small>${esc(KIT_HELP[c][1])}</small></span></li>`).join("")
    + (live ? INV_ORDER.filter(c => !KIT_HELP[c] && hasItem(c)).map(c => `<li><span class="kit-ico">${ITEMS[c].emoji}</span><span><b>${esc(ITEMS[c].name)}</b><small>${esc(ITEMS[c].desc)}</small></span></li>`).join("") : "");
  let h = `<div class="ms-head" style="--mc:${R.color}"><span class="ms-av">${R.av}</span><div><small>${esc(R.client)}</small><b>${esc(R.title)}</b><span>${esc(R.tagline)}</span></div></div>`;
  h += `<div class="ms-clock"><div><small>${live ? "Jetzt" : "Start"}</small><b>${fmtTime(now)}</b></div><div><small>Frist</small><b>${fmtTime(dl)}</b></div><div class="${left < 45 ? "warn" : ""}"><small>Noch</small><b>${fmtSpan(left)}</b></div>${live ? `<div><small>Verloren</small><b>${fmtSpan(run.lostMin || 0)}</b></div>` : ""}</div>`;
  h += `<h3>Unter-Missionen ${live ? `· ${goalsDoneCount()} von ${R.goals.length}` : ""}</h3><ul class="ms-goals">${goals}</ul>`;
  h += `<h3>Dein Weg</h3><div class="ms-floors">${floors}<i class="arr">→</i><span class="fl fin">${R.av} ${esc(R.ride)}</span></div>`;
  h += `<div class="ms-boss"><span>${R.boss.av}</span><div><b>Endgegner: ${esc(R.boss.name)}</b><small>${esc(R.boss.role)}. Reden, Formular ausfüllen oder kämpfen.</small></div></div>`;
  if (live) {
    const here = objectives().filter(o => !o.isExit && !o.route && !o.boss);
    if (here.length) h += `<h3>Hindernis hier · ${esc(floorLabel(run.idx))}</h3><ul class="ms-goals">${here.map(o => `<li class="${o.done ? "done" : ""}"><span class="ck">${o.done ? "✓" : ""}</span><span><b>${esc(o.title || "")}</b> · ${esc(o.text)}</span></li>`).join("")}</ul>`;
    h += `<h3>Liegengebliebene Aufgaben · ${run.tasks.length}</h3><ol class="ms-tasks" id="taskList">${run.tasks.length ? run.tasks.map((t, i) => `<li><span>${esc(t)}</span><button type="button" class="task-x" data-i="${i}" aria-label="Aufgabe ablehnen">Ablehnen</button></li>`).join("") : "<li>Nichts. Verdächtig.</li>"}</ol><p class="small">Jede Aufgabe wird im Treppenhaus als Formular fällig und kostet Zeit.</p>`;
  }
  h += `<h3>${live ? "Deine Ausrüstung" : "Das hast du dabei"}</h3><ul class="ms-kit">${kit}</ul><p class="small">Gegenstände unten am Bildschirm antippen. Unterwegs findest du mehr: ☕ Kaffee, 🧴 Spray, 📢 Mikro, 📕 Fallbericht …</p>`;
  return h;
}
const HOW_HTML = `<ul class="legend how">
  <li><span class="ico">🎯</span><span><b>Ziel</b> · Alle Unter-Missionen erledigen, am Endgegner vorbei und vor der Frist ${"zum Treffpunkt"}. Ein Stockwerk ist erst offen, wenn seine Aufgaben erledigt sind.</span></li>
  <li><span class="ico">⏱</span><span><b>Die Uhr</b> · oben links im Pager. Eine Sekunde echte Zeit ist eine halbe Minute im Spiel (auf „Entspannt“ weniger). Das gelbe Feld darunter zeigt, wie viel Zeit bis zur Frist bleibt.</span></li>
  <li><span class="ico">⌛</span><span><b>Zeit verlierst du</b> · wenn dich jemand erwischt und vollquatscht, wenn du Anrufe annimmst, bei Reanimationen und durch liegengebliebene Aufgaben (Formulare im Treppenhaus). Jeder Verlust blinkt rot an der Uhr.</span></li>
  <li><span class="ico">👀</span><span><b>Möglichst niemandem begegnen</b> · Dreieck über dem Kopf: weiß = ahnungslos, gelb = misstrauisch, rot = kommt auf dich zu. Schleichen, aus dem Sichtkegel bleiben, sichere Räume nutzen.</span></li>
  <li><span class="ico">📞</span><span><b>Anrufe</b> · Annehmen kostet Zeit. Ablehnen spart sie, aber dann kommt der Anrufer dich suchen.</span></li>
  <li><span class="ico">♥</span><span><b>Nerven &amp; Energie</b> · Nerven sind deine Leben. Alle weg: Burnout, du übernimmst den Nachtdienst. Energie brauchst du zum Rennen und Kämpfen. Kaffee hilft.</span></li>
  <li><span class="ico">✗</span><span><b>Scheitern</b> · Frist verpasst: Der Job ist weg. Nerven weg: Nachtdienst.</span></li></ul>`;
function showBrief(fromGame) {
  if (fromGame) return openMC();
  $("briefBody").innerHTML = missionSheet(false) + `<h3>So funktioniert's</h3>${HOW_HTML}`;
  mode = "brief"; show("ovBrief"); $("ovBrief").scrollTop = 0;
  setTimeout(() => $("btnBrief").focus({ preventScroll: true }), 50);
}
$("btnBrief").addEventListener("click", () => {
  initAudio(); show(null); mode = "play"; blackout = 0; run.clockSeen = run.minutes; updateHud(); trackObjectives(); saveCheckpoint();
  announceObjective();
  const h = $("hint"); h.textContent = "Linker Stick: laufen (leicht ziehen = schleichen) · rechts: umsehen · gelber Knopf: benutzen · 🎯 oben: Mission Control"; h.hidden = false; setTimeout(() => { h.hidden = true; }, 9000);
});

// ---------- Mission Control (pauses the game) ----------
let mcReturn = "play";
function openMC() {
  if (!run || run.mode !== "mission" || !["play", "pause"].includes(mode)) return;
  mcReturn = mode; mode = "mc"; clearInputs(); hidePopups();
  $("mcBody").innerHTML = missionSheet(true); $("mcHowBody").innerHTML = HOW_HTML;
  show("ovMC"); $("ovMC").scrollTop = 0; sfx.tick();
}
function closeMC() { if (mode !== "mc") return; if (mcReturn === "pause") { mode = "pause"; show("ovPause"); } else { show(null); mode = "play"; } }
$("btnMCClose").addEventListener("click", closeMC);
$("btnMCSave").addEventListener("click", () => { saveCheckpoint(); $("btnMCSave").lastElementChild.textContent = "✓"; setTimeout(() => { $("btnMCSave").lastElementChild.textContent = "💾"; }, 1500); });
$("mcBody").addEventListener("click", ev => { if (ev.target.closest(".task-x")) setTimeout(() => { $("mcBody").innerHTML = missionSheet(true); }, 50); });
$("btnMC").addEventListener("click", openMC);

// ---------- failing ----------
function missionFailed() {
  if (run.routeFailed) return;
  run.routeFailed = run.route; const R = mission();
  hidePopups(); clearInputs(); endCall(); mode = "over";
  $("endEyebrow").textContent = `${R.av} ${R.name} · ${fmtTime(run.minutes)}`; $("endTitle").textContent = "Zu spät";
  $("endText").textContent = R.failText;
  $("endTicker").hidden = false; $("endTicker").innerHTML = `<b>EILMELDUNG</b><span>${esc(R.failTicker)}</span>`;
  fillStats(); $("endScore").hidden = true; $("endRank").textContent = "Mission gescheitert";
  $("endBest").hidden = false; $("endBest").textContent = `Frist war ${fmtTime(routeDeadline(run.route))}. Du hast ${fmtSpan(run.lostMin || 0)} durch Gespräche, Anrufe und Papierkram verloren.`;
  $("btnAgain").firstElementChild.textContent = "Nochmal versuchen"; $("btnShare").hidden = true; $("btnNightNow").hidden = true; clearCheckpoint();
  sfx.stinger(); show("ovEnd"); setTimeout(() => $("btnAgain").focus({ preventScroll: true }), 50);
}
