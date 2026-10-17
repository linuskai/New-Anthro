/* Hospital Escape 3D · story intro, briefing, level flow, endings, settings, rendering and boot. */
const OVERLAYS = ["ovTitle", "ovMail", "ovBrief", "ovIntro", "ovPause", "ovEnd"];
function show(id) { for (const o of OVERLAYS) $(o).hidden = o !== id; }
function hidePopups() { for (const id of ["toast", "lab", "tasks", "hideVeil", "prompt", "dlg", "cpr", "tired", "wp", "story", "hint"]) $(id).hidden = true; toastT = labT = 0; }

// ---------- story in the doctors' room ----------
let story = null;
let lastMode = "mission";
function startStory(m) {
  m = m === "night" ? "night" : "mission"; lastMode = m;
  initAudio(); hidePopups(); show(null); clearInputs();
  newRun(m); loadFloor(run.idx); $("hudClock").textContent = fmtTime(m === "night" ? NIGHT_START - 2 : -1);
  mode = "story"; story = { i: -1, shown: 0, full: "", t: 0, yaw0: player.yaw, lines: m === "night" ? STORY_NIGHT : STORY };
  $("story").hidden = false; document.body.classList.add("cine");
  storyNext();
  setTimeout(() => $("btnStoryNext").focus({ preventScroll: true }), 50);
}
function storyNext() {
  if (!story) return;
  if (story.shown < story.full.length) { story.shown = story.full.length; $("storyText").textContent = story.full; return; }
  story.i++;
  if (story.i >= story.lines.length) { endStory(); return; }
  const [time, text] = story.lines[story.i];
  story.full = text; story.shown = 0; story.t = 0;
  $("storyTime").textContent = time; $("storyText").textContent = "";
  $("btnStoryNext").textContent = story.i === story.lines.length - 1 ? (run.mode === "night" ? "Dienst beginnen" : "Zum Posteingang") : "Weiter";
  if (run.mode === "night") { if (story.i === 2) { sfx.stinger(); setTimeout(() => sfx.beep(), 500); } return; }
  if (story.i === 2) { sfx.tick(); setTimeout(() => sfx.beep(), 300); setTimeout(() => sfx.beep(), 650); }
  if (story.i === 4) { for (let k = 0; k < 5; k++) setTimeout(() => sfx.step(), 200 + k * 380); setTimeout(() => sfx.knock(), 2300); }
  if (story.i === 5) { sfx.stinger(); setTimeout(() => sfx.whisper(), 900); }
}
function endStory() {
  if (!story) return;
  story = null; $("story").hidden = true; document.body.classList.remove("cine");
  player.yaw = level.startYaw; player.pitch = 0;
  if (run.mode === "night") { mode = "play"; blackout = 0; updateHud(); const h = $("hint"); h.textContent = "Pager-Aufgaben erledigen · Arztzimmer ist sicher · Hildegard nie aus den Augen lassen"; h.hidden = false; setTimeout(() => { h.hidden = true; }, 9000); return; }
  showMail();
}
$("btnStoryNext").addEventListener("click", () => { if (mode === "outro") { if (outro && outro.shown < outro.full.length) { outro.shown = outro.full.length; $("storyText").textContent = outro.full; } else endOutro(); } else storyNext(); });
$("btnSkip").addEventListener("click", endStory);
function updateStory(dt) {
  story.t += dt;
  if (story.shown < story.full.length) { story.shown = Math.min(story.full.length, story.shown + dt * 46); $("storyText").textContent = story.full.slice(0, Math.floor(story.shown)); if (Math.random() < .25) sfx.tick(); }
  // slow look around the room: screen, door, window, then towards the corridor
  const k = (story.i + Math.min(1, story.t / 5)) / STORY.length;
  player.yaw = story.yaw0 + Math.sin(k * Math.PI * 2.2) * .9;
  player.pitch = -.12 + Math.sin(k * Math.PI * 3) * .08;
  if (story.i === 5) blackout = Math.sin(story.t * 23) > .6 ? .2 : 0;
}

// ---------- mission cards (GTA style) and the dispatcher ----------
let mcardT = null;
function missionCard(eyebrow, title, sub, done) {
  const el = $("mcard"); $("mcEyebrow").textContent = eyebrow; $("mcTitle").textContent = title; $("mcSub").textContent = sub || "";
  el.classList.toggle("done", !!done); el.hidden = false; el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
  clearTimeout(mcardT); mcardT = setTimeout(() => { el.hidden = true; }, 3700);
  if (done) { tone(523, 0, .15, "triangle", .07); tone(659, .14, .15, "triangle", .07); tone(784, .28, .35, "triangle", .07); }
  else { tone(196, 0, .25, "sawtooth", .04); tone(294, .2, .45, "sawtooth", .04); }
}
function announceObjective() {
  if (run.mode === "night") return;
  const c = currentObjective(); if (!c) return;
  missionCard(c.isExit ? "Weiter" : c.route ? "Route · " + c.route : c.main ? "Mission" : "Nebenjob", c.title || c.text, c.text);
  setTimeout(() => { if (mode === "play" && c.brief) showToast("🧹", "#7ec8a0", "Pager · Frau Bozkurt", c.brief, []); }, 1800);
}
function trackObjectives() {
  if (run.mode === "night") return;
  if (!run.objDone) run.objDone = new Set();
  let changed = false;
  for (const o of objectives()) {
    const k = run.idx + ":" + o.id;
    if (o.done && !run.objDone.has(k)) {
      run.objDone.add(k); changed = true;
      if (o.main) missionCard("Mission erfüllt", o.title || o.text, "", true);
      else { missionCard("Nebenjob erledigt", o.title || o.text, "+10 Energie", true); run.energy = Math.min(100, run.energy + 10); }
    }
  }
  if (changed) { updateHud(); setTimeout(() => { if (mode === "play") announceObjective(); }, 3900); }
}

// ---------- inbox: choose your way out ----------
let mailPick = null;
const routeNeeds = k => { const R = ROUTES[k], out = R.promote.map(id => (BAG_NAMES[id] || id) + " (" + (id === "approbation" ? "Innere, Spind" : id === "zeugnis" ? "Radiologie" : id === "cream" ? "Dermatologie" : "") + ")"); for (const g of R.goals) out.push(g.title + ": " + (typeof g.text === "function" ? g.text().replace(/ \(.*\)$/, "") : g.text) + " (" + LEVELS[g.lvl].short.split(" · ")[1] + ")"); return out.length ? out : ["Nichts. Einfach raus."]; };
function showMail() {
  mode = "brief"; mailPick = null; $("mailView").hidden = true; $("mailListWrap").hidden = false;
  $("mailList").innerHTML = ROUTE_ORDER.map(k => { const R = ROUTES[k]; return `<button type="button" class="mailrow" data-k="${k}"><span class="mail-av">${R.av}</span><span><b>${esc(R.from)}</b><span class="subj">${esc(R.subject)}</span><span class="snip">${esc(R.mail.slice(0, 90))}…</span></span></button>`; }).join("");
  show("ovMail"); sfx.beep();
  setTimeout(() => { const f = document.querySelector(".mailrow"); if (f) f.focus({ preventScroll: true }); }, 50);
}
$("mailList").addEventListener("click", e => {
  const b = e.target.closest(".mailrow"); if (!b) return;
  const k = b.dataset.k, R = ROUTES[k]; mailPick = k; sfx.tick();
  $("mailAv").textContent = R.av; $("mailFrom").textContent = R.from; $("mailSubj").textContent = R.subject; $("mailBody").textContent = R.mail;
  $("mailPerks").innerHTML = R.perks.map(p => `<span>${esc(p)}</span>`).join("");
  $("mailNeeds").innerHTML = routeNeeds(k).map(n => `<li>${esc(n)}</li>`).join("");
  $("btnMailTake").firstElementChild.textContent = k === "stay" ? "Einfach heim · los geht's" : "Zusagen · los geht's";
  $("mailListWrap").hidden = true; $("mailView").hidden = false; $("ovMail").scrollTop = 0;
  setTimeout(() => $("btnMailTake").focus({ preventScroll: true }), 30);
});
$("btnMailBack").addEventListener("click", () => { $("mailView").hidden = true; $("mailListWrap").hidden = false; });
$("btnMailTake").addEventListener("click", () => {
  if (!mailPick) return;
  run.route = mailPick; if (mailPick !== "stay") run.offers.add(mailPick);
  buildRouteProps(level, run.idx); sfx.ding(); updateHud();
  showBrief(false);
});

// ---------- briefing ----------
let briefReturn = null;
function sideButtons(locked) {
  $("sideBox").innerHTML = SIDE.map(s => {
    const on = run.sides.has(s.id);
    if (locked && !on) return "";
    return `<button type="button" class="side" data-id="${s.id}" aria-pressed="${on}"${locked ? " disabled" : ""}><span class="box">${on ? "✓" : ""}</span><span><b>${esc(s.name)}</b>${esc(s.desc)}</span></button>`;
  }).join("") || '<p class="small">Keine Nebenmissionen gewählt. Auch eine Haltung.</p>';
}
$("sideBox").addEventListener("click", e => {
  const b = e.target.closest(".side"); if (!b || b.disabled) return;
  const id = b.dataset.id;
  if (run.sides.has(id)) run.sides.delete(id); else if (run.sides.size < 3) run.sides.add(id); else { sfx.knock(); return; }
  sfx.tick(); sideButtons(false); $("sideHead").textContent = `Nebenmissionen · ${run.sides.size} von 3 gewählt`;
});
function showBrief(fromGame) {
  $("planList").innerHTML = PLAN.map((n, i) => { const [h, ...rest] = n.split(": "); return `<li class="${i < run.idx ? "done" : i === run.idx ? "now" : ""}"><span><b>${esc(h)}</b> · ${esc(rest.join(": "))}</span></li>`; }).join("");
  const R = ROUTES[run.route || "stay"];
  $("briefRoute").innerHTML = `Deine Route: <span class="route-tag">${esc(R.name)}</span> · ${esc(R.perks[0])}. Zu tun: ${esc(routeNeeds(run.route || "stay").join(" · "))}`;
  briefReturn = fromGame ? mode : null;
  if (fromGame) clearInputs();
  sideButtons(!!fromGame);
  $("sideHead").textContent = fromGame ? "Deine Nebenmissionen" : `Nebenmissionen · wähle bis zu 3 (${run.sides.size} gewählt)`;
  $("btnBrief").firstElementChild.textContent = fromGame ? "Zurück" : "Mission verstanden · los geht's";
  mode = "brief"; show("ovBrief");
  setTimeout(() => $("btnBrief").focus({ preventScroll: true }), 50);
}
$("btnBrief").addEventListener("click", () => {
  if (briefReturn) { const r = briefReturn === "pause" ? "pause" : "play"; briefReturn = null; if (r === "pause") { mode = "pause"; show("ovPause"); } else { show(null); mode = "play"; } return; }
  initAudio(); show(null); mode = "play"; blackout = 0; updateHud(); trackObjectives();
  announceObjective();
  const h = $("hint"); h.textContent = "Linker Stick: laufen (leicht ziehen = schleichen) · rechts: umsehen · gelber Knopf: benutzen · folge dem ◆"; h.hidden = false; setTimeout(() => { h.hidden = true; }, 9000);
});
function showIntro(bonus) {
  const L = LEVELS[run.idx];
  $("introEyebrow").textContent = `${L.floor} · Abschnitt ${run.idx + 1} von ${MISSION_LEVELS}`;
  $("introName").textContent = L.name; $("introTip").textContent = L.tip;
  $("introObj").innerHTML = objectives().filter(o => !o.isExit).map(o => `<li><span class="ico" style="background:${o.main ? "#f2b33d" : "#f3f8f1"}">${o.main ? "!" : "?"}</span><span><b>${o.route ? "Route " + esc(o.route) : o.main ? "Mission" : "Nebenjob"}</b> · ${esc(o.title ? o.title + ": " : "")}${esc(o.text)}</span></li>`).join("");
  $("introBonus").hidden = !bonus; $("introBonus").textContent = bonus || "";
  $("btnGo").firstElementChild.textContent = L.env === "radio" || L.env === "cellar" ? "Taschenlampe an" : L.safe ? "Durchatmen" : L.final ? "Zum Auto" : "Weiter";
  mode = "intro"; show("ovIntro");
  setTimeout(() => $("btnGo").focus({ preventScroll: true }), 50);
}
$("btnGo").addEventListener("click", () => { initAudio(); show(null); mode = "play"; trackObjectives(); announceObjective(); });
function nextFloor() {
  const n = run.tasks.length, mins = n * 8;
  run.minutes += mins; run.tasks = [];
  const before = run.nerves; run.nerves = Math.min(MAX_NERVES(), run.nerves + 1);
  run.energy = Math.min(100, run.energy + 10);
  endCall(); sfx.floor(); hidePopups(); clearInputs();
  run.idx++;
  loadFloor(run.idx);
  const parts = [n ? `Im Treppenhaus ${n} Aufgabe${n > 1 ? "n" : ""} dokumentiert: +${mins} Min.` : "Keine offenen Aufgaben. Respekt."];
  if (run.nerves > before) parts.push("Kurz durchgeatmet: +1 Nerv, +10 Energie.");
  showIntro(parts.join(" "));
}

// ---------- endings ----------
function finale() {
  const n = run.tasks.length, R = ROUTES[run.route || "stay"], mine = run.route && run.route !== "stay" ? run.route : null;
  const options = [];
  if (mine) { const miss = routeMissing(mine); options.push({ label: `Einsteigen: ${R.name}`, hint: miss.length ? "fehlt: " + miss.join(", ") : "Route erfüllt", disabled: !!miss.length, act: () => { showEnd(mine, n); return { end: true }; } }); }
  for (const k of ["pharma", "botox", "consult", "tele", "amt", "ship"]) {
    if (k === mine || !run.offers.has(k)) continue;
    const ready = ROUTES[k] && routeReady(k), o = OFFERS[k], miss = ROUTES[k] ? routeMissing(k) : o.need.filter(x => !run.flags.has(x)).map(x => BAG_NAMES[x]);
    options.push({ label: `Umsatteln: ${o.name}`, hint: ready ? "möglich" : "fehlt: " + miss.slice(0, 2).join(", "), disabled: !ready, act: () => { showEnd(k, n); return { end: true }; } });
  }
  options.push({ label: mine ? "Doch nur heimfahren. Montag wiederkommen." : "Heimfahren. Montag wiederkommen.", act: () => { showEnd("stay", n); return { end: true }; } });
  const lines = { pharma: "Fr. Goldmann lehnt an der Limousine und tippt auf ihre Uhr. „Approbation? Zeugnis?“", botox: "Dr. Glatt hupt aus dem pinken Cabrio. Das Verdeck ist offen. Es regnet. Sie lächelt trotzdem.", consult: "Das Business-Taxi wartet. Auf dem Rücksitz liegt ein Laptop mit 140 Folien. Folie 1: dein Foto vom Faxgerät.", tele: "Dein E-Scooter blinkt. Auf dem Lenker klebt ein Sticker: „Move fast and heal things“.", amt: "Das Dienstfahrrad lehnt an der Säule. Am Lenker hängt ein Klemmbrett mit Formular A39. Für morgen.", ship: "Der Hafen-Shuttle hupt dreimal. Der Fahrer trägt Hawaiihemd. „Leinen los, Doc!“" };
  openDialog({ av: R.av, color: "#1f9d55", name: mine ? R.from.split(" · ")[0] : "Dein Auto", role: fmtTime(run.minutes) + " · Parkhaus P2 · der letzte Schritt",
    text: mine ? lines[mine] + (routeReady(mine) ? " Alles dabei. Du musst nur noch einsteigen." : " Dir fehlt noch etwas. Du kannst zurückgehen oder es lassen.") : "Du sitzt im Auto. Motor an. Das Radio spielt „Highway to Hell“. Du schaltest um. „Stayin' Alive“. Wie passend.",
    options: options.slice(0, 7) });
}
const rankFor = over => over < 60 ? "Legende der Pünktlichkeit" : over < 120 ? "Fast pünktlich" : over < 200 ? "Typische Assistenzärztin, typischer Assistenzarzt" : over < 300 ? "Wohnt im Bereitschaftsraum" : "Gehört zum Inventar";
function buildRoster(ending) {
  const now = new Date();
  const y = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear(), m = (now.getMonth() + 1) % 12;
  const days = new Date(y, m + 1, 0).getDate(), first = (new Date(y, m, 1).getDay() + 6) % 7;
  const cells = new Array(days + 2).fill(null), overflow = [];
  for (const code of run.duties) {
    let ok = false;
    if (code === "WE") { for (let d = 1; d < days && !ok; d++) if ((first + d - 1) % 7 === 5 && !cells[d] && !cells[d + 1]) { cells[d] = cells[d + 1] = "WE"; ok = true; } }
    else if (code === "ST") { for (let d = 1; d <= days && !ok; d++) if ((first + d - 1) % 7 === 5 && !cells[d]) { cells[d] = "ST"; ok = true; } }
    else { const free = []; for (let d = 1; d <= days; d++) if (!cells[d] && (first + d - 1) % 7 < 5) free.push(d); if (free.length) { cells[pick(free)] = code; ok = true; } }
    if (!ok) overflow.push(code);
  }
  const monthName = new Date(y, m, 1).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const quit = ending && ending !== "stay";
  let html = `<h3>${quit ? "Dein alter Dienstplan" : "Dein Dienstplan"} · ${monthName}</h3><div class="cal">`;
  html += ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(d => `<div class="hd">${d}</div>`).join("");
  for (let i = 0; i < first; i++) html += '<div class="blank"></div>';
  for (let d = 1; d <= days; d++) { const wd = (first + d - 1) % 7, c = cells[d]; html += `<div class="${wd >= 5 ? "we" : ""}">${d}${c ? `<b class="d-${c}">${c}</b>` : ""}</div>`; }
  html += "</div>";
  const cnt = run.duties.length;
  if (quit) html += `<div class="legend-line">${cnt ? `Gekündigt. Diese ${cnt} Dienst${cnt > 1 ? "e macht" : " macht"} jetzt Dr. Kurz. Sorry, Dr. Kurz.` : "Gekündigt, ohne offene Dienste. Dr. Kurz weint trotzdem."}</div>`;
  else if (!cnt) html += '<div class="legend-line">Komplett leer. Das gab es noch nie. Mach einen Screenshot.</div>';
  else html += `<div class="legend-line">${Object.entries(DUTIES).map(([k, v]) => `<span><b class="d-${k}">${k}</b> ${v}</span>`).join("")}${overflow.length ? `<span>+${overflow.length} weitere im Folgemonat</span>` : ""}</div>`;
  $("roster").innerHTML = html;
}
function sideResults(won) {
  const chosen = SIDE.filter(s => run.sides.has(s.id));
  if (!chosen.length) { $("sideRes").innerHTML = ""; return 0; }
  let n = 0;
  $("sideRes").innerHTML = chosen.map(s => { const ok = won && s.check(); if (ok) n++; return `<li>${ok ? "✅" : "❌"} <b>${esc(s.name)}</b> · ${esc(s.desc)}</li>`; }).join("");
  return n;
}
function fillStats(ending) {
  $("stOver").textContent = fmtDur(run.minutes); $("stLives").textContent = run.lives; $("stTasks").textContent = run.tasksTotal;
  $("stDuty").textContent = run.duties.length; $("stCalls").textContent = run.callsAcc + " / " + run.callsDec; $("stTalks").textContent = run.talks; $("stPapers").textContent = run.coauthor;
  $("endRank").textContent = rankFor(run.minutes); buildRoster(ending);
}
const BEST_KEY = "hospital-escape-3d-best";
const getBest = () => { try { const v = parseFloat(localStorage.getItem(BEST_KEY)); return isFinite(v) ? v : null; } catch (e) { return null; } };
const setBest = v => { try { localStorage.setItem(BEST_KEY, String(v)); } catch (e) {} };
function showGameOver() {
  hidePopups(); clearInputs();
  const L = LEVELS[run.idx];
  run.duties.push("N");
  if (run.mode === "night") {
    $("endText").textContent = `Um ${fmtTime(run.minutes)} bist du eingeschlafen. Auf dem Flur. Ein Schlafwandler hat dich zugedeckt. ${run.nightDone} Aufgaben erledigt. Schwester Hildegard hat die Kurven für dich abgezeichnet. Mit deinem Namen.`;
    fillStats(); sideResults(false); $("endBest").hidden = true; $("btnAgain").firstElementChild.textContent = "Noch eine Nacht";
    mode = "over"; show("ovEnd"); setTimeout(() => $("btnAgain").focus({ preventScroll: true }), 50); return;
  }
  $("endEyebrow").textContent = "Pager · " + fmtTime(run.minutes); $("endTitle").textContent = run.mode === "night" ? "Eingeschlafen" : "Burnout";
  $("endText").textContent = `Zusammengebrochen in ${L.name} um ${fmtTime(run.minutes)}. Die Nerven sind weg. Du bleibst gleich zum Nachtdienst. Die Personalabteilung nennt das „Flexibilität“. Tipp: Schleichen, sichere Räume nutzen und Leuten mit gelbem Dreieck aus dem Blick gehen.`;
  fillStats(); sideResults(false);
  const best = getBest(); $("endBest").hidden = best == null; if (best != null) $("endBest").textContent = "Frühester Feierabend bisher: " + fmtTime(best);
  $("btnAgain").firstElementChild.textContent = "Nochmal versuchen";
  mode = "over"; show("ovEnd"); setTimeout(() => $("btnAgain").focus({ preventScroll: true }), 50);
}
function showEnd(key, n) { playOutro(key, () => showEndScreen(key, n)); }
function nightWin() { run.nightWon = true; playOutro("night", showNightEnd); }
const NIGHT_BEST = "hospital-escape-night-best";
function showNightEnd() {
  mode = "win"; clearInputs(); hidePopups(); endCall();
  let best = null; try { best = parseInt(localStorage.getItem(NIGHT_BEST), 10); } catch (e) {}
  const isBest = !(best >= run.nightDone); if (isBest) try { localStorage.setItem(NIGHT_BEST, String(run.nightDone)); } catch (e) {}
  $("endEyebrow").textContent = "Station 5B · 07:00"; $("endTitle").textContent = "Übergabe";
  $("endText").textContent = `Du hast die Nacht überlebt. ${run.nightDone} Pager-Aufgaben erledigt, ${run.nightFail} verpasst. Der Frühdienst fragt: „Ruhige Nacht?“ Du lachst. Es klingt ein bisschen wie Hildegard.`;
  fillStats(); $("stOver").textContent = "9 h (Nachtdienst)"; $("stTasks").textContent = run.nightDone;
  $("endRank").textContent = run.nightDone >= 10 ? "Nachtschicht-Legende" : run.nightDone >= 6 ? "Unkaputtbar" : run.nightDone >= 3 ? "Hat überlebt. Irgendwie." : "Hat sich im Arztzimmer versteckt";
  $("sideRes").innerHTML = ""; $("endBest").hidden = false; $("endBest").textContent = isBest ? "Neuer Nachtdienst-Rekord." : "Bester Nachtdienst: " + best + " Aufgaben";
  $("btnAgain").firstElementChild.textContent = "Noch eine Nacht"; sfx.floor(); show("ovEnd"); setTimeout(() => $("btnAgain").focus({ preventScroll: true }), 50);
}
function showEndScreen(key, n) {
  const E = ENDINGS[key];
  mode = "win"; clearInputs(); hidePopups(); endCall();
  const best = getBest(), isBest = best == null || run.minutes < best; if (isBest) setBest(run.minutes);
  $("endEyebrow").textContent = E.eyebrow + " · " + fmtTime(run.minutes); $("endTitle").textContent = E.title;
  const sides = sideResults(true), chosen = run.sides.size;
  $("endText").textContent = E.text + (n ? ` (${n} offene Aufgabe${n > 1 ? "n" : ""} hast du einfach liegen lassen. Mutig.)` : "") + (chosen ? ` Nebenmissionen: ${sides} von ${chosen}.` : "");
  fillStats(key);
  $("endBest").hidden = false; $("endBest").textContent = isBest ? "Neuer Rekord für den frühesten Feierabend." : "Frühester Feierabend bisher: " + fmtTime(best);
  $("btnAgain").firstElementChild.textContent = "Nächste Schicht";
  setMsg("Pager aus.", 0); sfx.floor(); show("ovEnd"); setTimeout(() => $("btnAgain").focus({ preventScroll: true }), 50);
}

// ---------- pause & settings ----------
function pause() { if (mode !== "play") return; mode = "pause"; clearInputs(); show("ovPause"); try { if (document.exitPointerLock) document.exitPointerLock(); } catch (_) {} setTimeout(() => $("btnResume").focus({ preventScroll: true }), 30); }
function resume() { if (mode !== "pause") return; show(null); mode = "play"; }
$("btnPause").addEventListener("click", pause); $("btnResume").addEventListener("click", resume);
$("btnPlan").addEventListener("click", () => showBrief(true));
$("btnQuit").addEventListener("click", () => { hidePopups(); endCall(); newRun(); loadFloor(0); mode = "title"; show("ovTitle"); });
$("mission").addEventListener("click", () => { $("tasks").hidden = !$("tasks").hidden; });
$("btnHud").addEventListener("click", () => { document.body.classList.toggle("hudmin"); settings.hudmin = document.body.classList.contains("hudmin"); saveSettings(); });
if (settings.hudmin) document.body.classList.add("hudmin");
function openMap() { if (mode !== "play") return; mode = "map"; clearInputs(); $("mapView").hidden = false; drawBigMap(); }
function closeMap() { if (mode !== "map") return; $("mapView").hidden = true; mode = "play"; }
$("mini").addEventListener("click", openMap); $("btnMapClose").addEventListener("click", closeMap); $("mapView").addEventListener("click", e => { if (e.target.id === "mapView") closeMap(); });
function applyShadows() {
  renderer.shadowMap.enabled = !!settings.shadows;
  const dark = run && ENV[LEVELS[run.idx].env].dark;
  sun.castShadow = !!settings.shadows && !dark; flashlight.castShadow = !!settings.shadows && !!dark;
  scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.needsUpdate = true; }); });
}
$("btnTasksClose").addEventListener("click", () => { $("tasks").hidden = true; });
$("btnCallbacks").addEventListener("click", () => { if (mode === "play") workCallbacks(); });
const bindSet = (id, key, prop = "checked", cast = v => v) => { const el = $(id); el[prop] = settings[key]; el.addEventListener(prop === "checked" ? "change" : "input", () => { settings[key] = cast(el[prop]); saveSettings(); if (key === "sound" && master) master.gain.value = settings.sound ? 1 : 0; if (key === "navi") naviT = 0; }); };
bindSet("setShadows", "shadows"); $("setShadows").addEventListener("change", applyShadows);
bindSet("setSens", "sens", "value", Number); bindSet("setInvert", "invert"); bindSet("setSound", "sound"); bindSet("setBob", "bob"); bindSet("setNavi", "navi");
const lookSel = $("setLook"); lookSel.value = settings.look; lookSel.addEventListener("change", () => { settings.look = lookSel.value; saveSettings(); });
for (const id of ["setDiff", "setDiffTitle"]) {
  const el = $(id); el.value = settings.diff;
  el.addEventListener("change", () => {
    settings.diff = el.value; saveSettings(); $("setDiff").value = $("setDiffTitle").value = settings.diff;
    if (run) { run.nerves = Math.min(run.nerves, MAX_NERVES()); updateHud(); }
  });
}
$("btnStart").addEventListener("click", () => startStory("mission"));
$("btnNight").addEventListener("click", () => startStory("night"));
$("btnAgain").addEventListener("click", () => startStory(lastMode));

// ---------- render ----------
const mini = $("mini"), mctx = mini.getContext("2d");
const comp = $("compass"), cctx = comp.getContext("2d");
const nearVisited = (x, y) => level.visited[y * GW + x] || DIRS.some(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < GW && ny < GH && level.visited[ny * GW + nx]; });
const tileColor = (x, y, fog) => {
  if (fog && !nearVisited(x, y)) return null;
  const ch = grid[y][x], z = level.zone ? level.zone[y * GW + x] : 1;
  if (ch === "#" || ch === "H") return "#26332d";
  if (ch === "d" || ch === ",") return "#b8895a";
  if (ch === "l") return "#7a2f28";
  if (ch === "^") return "#9aa3a8";
  if ("BTMLYGXvmWa=jtUK".includes(ch)) return "#6b7f78";
  if (ch === "w") return "#3f6fb3"; if (ch === "z") return "#c9b24a"; if (ch === "o") return "#7fa3b5";
  if (z === 3 || ch === "_") return "#c9a77a";
  if (z === 2) return "#a9b8b0";
  return level.dark[y * GW + x] && !currentEnv().dark ? "#8a9a92" : "#cfdcd4";
};
function mapMarks(ctx, c, fog, blink, scaleMark) {
  const mark = (x, y, col, r = .42) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x * c, y * c, c * r * scaleMark, 0, 7); ctx.fill(); ctx.strokeStyle = "#111"; ctx.lineWidth = 1.5; ctx.stroke(); };
  for (const it of level.items) if (!it.taken && (!fog || nearVisited(it.x, it.y))) mark(it.wx, it.wy, "#f2b33d", .28);
  for (const f of level.friends) if (!fog || nearVisited(Math.floor(f.x), Math.floor(f.y))) mark(f.x, f.y, "#6fcf97");
  if (run.rea && !run.rea.done && blink) mark(run.rea.x + .5, run.rea.y + .5, "#e2483d", .55);
  for (const e of level.enemies) {
    if (e.gone || TYPES[e.type].ghost || e.done) continue;
    if (!e.static && Math.hypot(e.x - player.x, e.y - player.y) > 8) continue;
    const col = e.static ? "#f2b33d" : e.state === "spot" ? "#e2483d" : e.state === "sus" ? "#f2b33d" : "#dfe6e3";
    if (!e.static) { ctx.fillStyle = col + "55"; ctx.beginPath(); ctx.moveTo(e.x * c, e.y * c); const a = Math.atan2(Math.cos(e.yaw), Math.sin(e.yaw)), w = Math.acos(Math.max(-1, Math.min(1, TYPES[e.type].fov || .5))); ctx.arc(e.x * c, e.y * c, c * 2.2, a - w, a + w); ctx.closePath(); ctx.fill(); }
    mark(e.x, e.y, col, .36);
  }
  for (const tr of level.transports) if (Math.hypot(tr.x - player.x, tr.y - player.y) < 7) mark(tr.x, tr.y, "#e8682a");
}
/* GTA-style radar: centred on you, rotating with your view, your view cone in front */
function drawMini(time) {
  const W = mini.width, R = W / 2, c = W / 16, fog = LEVELS[run.idx].fogOfWar && !run.flags.has("power"), blink = Math.sin(time * 6) > 0;
  const fx = -Math.sin(player.yaw), fy = -Math.cos(player.yaw), rot = -Math.PI / 2 - Math.atan2(fy, fx);
  mctx.save(); mctx.clearRect(0, 0, W, W);
  mctx.beginPath(); mctx.arc(R, R, R - 2, 0, 7); mctx.clip();
  mctx.fillStyle = "#0b1513"; mctx.fillRect(0, 0, W, W);
  mctx.translate(R, R); mctx.rotate(rot); mctx.translate(-player.x * c, -player.y * c);
  const x0 = Math.max(0, Math.floor(player.x - 12)), x1 = Math.min(GW - 1, Math.ceil(player.x + 12)), y0 = Math.max(0, Math.floor(player.y - 12)), y1 = Math.min(GH - 1, Math.ceil(player.y + 12));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const col = tileColor(x, y, fog); if (!col) continue; mctx.fillStyle = col; mctx.fillRect(x * c, y * c, c + .6, c + .6); }
  if (level.exit && (!fog || nearVisited(level.exit[0], level.exit[1]))) { mctx.fillStyle = exitOpen() ? "#1f9d55" : "#7b8a85"; mctx.fillRect(level.exit[0] * c, level.exit[1] * c, c, c); }
  mapMarks(mctx, c, fog, blink, 1);
  mctx.restore();
  // view cone + player arrow (always pointing up)
  mctx.save(); mctx.translate(R, R);
  const half = (camera.fov * camera.aspect) * Math.PI / 360;
  const g = mctx.createRadialGradient(0, 0, 4, 0, 0, R); g.addColorStop(0, "rgba(255,255,255,.38)"); g.addColorStop(1, "rgba(255,255,255,0)");
  mctx.fillStyle = g; mctx.beginPath(); mctx.moveTo(0, 0); mctx.arc(0, 0, R, -Math.PI / 2 - Math.min(1.1, half), -Math.PI / 2 + Math.min(1.1, half)); mctx.closePath(); mctx.fill();
  mctx.fillStyle = "#fff"; mctx.strokeStyle = "#0f6b4f"; mctx.lineWidth = 3; mctx.beginPath(); mctx.moveTo(0, -c * .9); mctx.lineTo(c * .6, c * .6); mctx.lineTo(0, c * .25); mctx.lineTo(-c * .6, c * .6); mctx.closePath(); mctx.fill(); mctx.stroke();
  // target diamond, clamped to the rim
  if (naviTarget) {
    const dx = naviTarget[0] - player.x, dy = naviTarget[1] - player.y, cr = Math.cos(rot), sr = Math.sin(rot);
    let sx = (dx * cr - dy * sr) * c, sy = (dx * sr + dy * cr) * c; const d = Math.hypot(sx, sy), lim = R - 12;
    if (d > lim) { sx = sx / d * lim; sy = sy / d * lim; }
    mctx.save(); mctx.translate(sx, sy); mctx.rotate(Math.PI / 4); mctx.fillStyle = blink ? "#f2b33d" : "#fff6d8"; mctx.strokeStyle = "#111"; mctx.lineWidth = 2; mctx.fillRect(-8, -8, 16, 16); mctx.strokeRect(-8, -8, 16, 16); mctx.restore();
  }
  // north marker on the rim
  const na = -Math.PI / 2 + rot; mctx.fillStyle = "#e2483d"; mctx.font = "800 22px sans-serif"; mctx.textAlign = "center"; mctx.textBaseline = "middle"; mctx.fillText("N", Math.cos(na) * (R - 14), Math.sin(na) * (R - 14));
  mctx.restore();
  mctx.strokeStyle = "#26332d"; mctx.lineWidth = 4; mctx.beginPath(); mctx.arc(R, R, R - 2, 0, 7); mctx.stroke();
  if (fog) { mctx.fillStyle = "rgba(166,227,143,.85)"; mctx.font = "700 18px monospace"; mctx.textAlign = "center"; mctx.fillText("KEIN NETZ", R, W - 26); }
}
function drawBigMap() {
  const cv = $("mapBig"), ctx = cv.getContext("2d"), W = cv.width, c = W / Math.max(GW, GH), oy = (W - GH * c) / 2, fog = LEVELS[run.idx].fogOfWar && !run.flags.has("power");
  ctx.fillStyle = "#0b1513"; ctx.fillRect(0, 0, W, W); ctx.save(); ctx.translate(0, oy);
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) { const col = tileColor(x, y, fog); if (!col) continue; ctx.fillStyle = col; ctx.fillRect(x * c, y * c, c + .5, c + .5); }
  if (level.exit) { ctx.fillStyle = exitOpen() ? "#1f9d55" : "#7b8a85"; ctx.fillRect(level.exit[0] * c, level.exit[1] * c, c, c); ctx.fillStyle = "#fff"; ctx.font = `800 ${c * .6}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("↓", (level.exit[0] + .5) * c, (level.exit[1] + .5) * c); }
  for (const rg of level.safeRooms) { const [x, y] = rg.tiles[0]; ctx.fillStyle = "#2a1c00"; ctx.font = `700 ${Math.max(10, c * .32)}px sans-serif`; ctx.textAlign = "left"; ctx.fillText(rg.name[0], x * c + 3, y * c + c * .4); }
  mapMarks(ctx, c, fog, true, 1);
  if (naviTarget) { ctx.save(); ctx.translate(naviTarget[0] * c, naviTarget[1] * c); ctx.rotate(Math.PI / 4); ctx.fillStyle = "#f2b33d"; ctx.fillRect(-c * .35, -c * .35, c * .7, c * .7); ctx.restore(); }
  const px = player.x * c, py = player.y * c, fx = -Math.sin(player.yaw), fy = -Math.cos(player.yaw);
  ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.beginPath(); ctx.moveTo(px, py); const a = Math.atan2(fy, fx); ctx.arc(px, py, c * 3, a - .6, a + .6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.strokeStyle = "#0f6b4f"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(px + fx * c * .7, py + fy * c * .7); ctx.lineTo(px - fx * c * .4 + fy * c * .4, py - fy * c * .4 - fx * c * .4); ctx.lineTo(px - fx * c * .4 - fy * c * .4, py - fy * c * .4 + fx * c * .4); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#f3f8f1"; ctx.font = "800 24px sans-serif"; ctx.textAlign = "left"; ctx.fillText(LEVELS[run.idx].name, 14, 30);
}
function drawCompass() {
  const dpr = Math.min(2, window.devicePixelRatio || 1), w = comp.clientWidth, h = comp.clientHeight;
  if (!w) return;
  if (comp.width !== Math.round(w * dpr)) { comp.width = Math.round(w * dpr); comp.height = Math.round(h * dpr); }
  cctx.setTransform(dpr, 0, 0, dpr, 0, 0); cctx.clearRect(0, 0, w, h);
  const head = -player.yaw, fov = Math.PI * .75, pxr = w / fov;
  const norm = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
  cctx.font = "600 13px 'Barlow Condensed', sans-serif"; cctx.textAlign = "center"; cctx.textBaseline = "middle";
  for (let deg = 0; deg < 360; deg += 15) {
    const a = norm(deg * Math.PI / 180 - head); if (Math.abs(a) > fov / 2) continue;
    const x = w / 2 + a * pxr, lbl = { 0: "N", 90: "O", 180: "S", 270: "W" }[deg];
    if (lbl) { cctx.fillStyle = lbl === "N" ? "#e2483d" : "#f3f8f1"; cctx.fillText(lbl, x, h / 2); }
    else { cctx.fillStyle = "rgba(243,248,241,.45)"; cctx.fillRect(x - .5, deg % 45 ? h * .38 : h * .28, 1, deg % 45 ? h * .24 : h * .44); }
  }
  cctx.fillStyle = "#a6e38f"; cctx.fillRect(w / 2 - 1, 2, 2, 5);
  if (naviTarget) {
    const dx = naviTarget[0] - player.x, dy = naviTarget[1] - player.y, a = norm(Math.atan2(dx, -dy) - head);
    const x = w / 2 + Math.max(-fov / 2, Math.min(fov / 2, a)) * pxr;
    cctx.save(); cctx.translate(x, h / 2); cctx.rotate(Math.PI / 4); cctx.fillStyle = "#f2b33d"; cctx.fillRect(-6, -6, 12, 12); cctx.restore();
    if (Math.abs(a) > fov / 2) { cctx.fillStyle = "#f2b33d"; cctx.font = "800 14px 'Barlow Condensed', sans-serif"; cctx.fillText(a < 0 ? "◀" : "▶", a < 0 ? 10 : w - 10, h / 2); }
  }
}
const tmpV = new THREE.Vector3();
function drawWaypoint() {
  const wp = $("wp");
  if (!naviTarget || mode !== "play") { wp.hidden = true; return; }
  tmpV.set(naviTarget[0] * S, 2.3, naviTarget[1] * S);
  const dist = Math.hypot(naviTarget[0] - player.x, naviTarget[1] - player.y) * S;
  tmpV.applyMatrix4(camera.matrixWorldInverse);
  const behind = tmpV.z > 0;
  tmpV.applyMatrix4(camera.projectionMatrix);
  let x = tmpV.x, y = tmpV.y;
  if (behind) { x = -x; y = -1; }
  const W = innerWidth, H = innerHeight, m = 34;
  let sx = (x * .5 + .5) * W, sy = (-y * .5 + .5) * H;
  const clamped = behind || sx < m || sx > W - m || sy < 200 || sy > H - 220;
  sx = Math.max(m, Math.min(W - m, sx)); sy = Math.max(200, Math.min(H - 220, sy));
  wp.hidden = false; wp.style.left = sx + "px"; wp.style.top = sy + "px";
  $("wpDist").textContent = Math.round(dist) + " m";
  const arr = $("wpArr"); arr.hidden = !clamped;
  if (clamped) { const ang = Math.atan2(sy - H / 2, sx - W / 2) + Math.PI / 2; arr.style.transform = `rotate(${ang}rad)`; }
}
const angLerp = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };
function friendNeeds(f) {
  switch (f.kind) {
    case "b": return !run.flags.has("secret1");
    case "k": return !run.flags.has("key");
    case "h": return !run.flags.has("fuse");
    case "e": return !run.flags.has("spa") || !run.offers.has("botox");
    case "i": return !f.selfie;
    default: return f.talked === 0;
  }
}
function render(time, dt) {
  if (!level) return;
  const bob = settings.bob && mode === "play" ? Math.sin(player.bob) * (player.moveMag === .5 ? .025 : .05) : 0, shake = player.stun > 0 ? (Math.random() - .5) * .06 : 0;
  const crouch = mode === "play" && player.moveMag === .5 ? .18 : 0;
  camera.position.set(player.x * S + shake, EYE + bob - crouch - (player.hidden ? .7 : 0), player.y * S);
  camera.rotation.y = player.yaw; camera.rotation.x = player.pitch;
  fpHand.position.y = -.22 + Math.sin(player.bob * 2) * .008;

  let near = null, nd = 3.4;
  const cd = cellarDark();
  for (const f of level.flickers) {
    const v = Math.sin(time * f.a + f.p) + Math.sin(time * f.b + f.p * 2);
    f.on = blackout <= 0 && (cd || f.creepy ? v > f.th : v > f.th - 1.2);
    f.mat.color.setHex(f.on ? f.tint : 0x1e201f);
    const d = Math.hypot(f.x + .5 - player.x, f.y + .5 - player.y); if (d < nd) { nd = d; near = f; }
  }
  if (near) { lampLight.position.set((near.x + .5) * S, WALL_H - .4, (near.y + .5) * S); lampLight.color.setHex(near.tint); lampLight.intensity = near.on ? (near.creepy ? 1.2 : .9) : 0; } else lampLight.intensity = 0;
  if (humGain) {
    const L = LEVELS[run.idx], live = mode === "play" || mode === "story";
    humGain.gain.setTargetAtTime(near && near.on && live ? .022 * (1 - nd / 3.4) : 0, actx.currentTime, .03);
    droneGain.gain.setTargetAtTime(live && (L.env === "cellar" || L.env === "radio" || lightMul < .6) ? (blackout > 0 ? .07 : .03) : 0, actx.currentTime, .4);
  }
  const k = Math.min(1, dt * 6);
  for (const e of level.enemies) {
    if (e.gone) continue;
    const t = TYPES[e.type];
    e.mesh.position.set(e.x * S, t.ghost ? Math.sin(time * 2) * .12 + .1 : 0, e.y * S);
    if (e.static && !e.cleared) e.yaw = Math.atan2(player.x - e.x, player.y - e.y);
    else e.yaw = angLerp(e.yaw, e.tyaw, e.state === "sus" ? k * 1.4 : k);
    e.mesh.rotation.y = e.yaw;
    const look = e.state === "sus" || e.state === "spot" ? 0 : Math.sin(time * .9 + e.hx) * .5;
    for (const p of e.persons) { p.look = look; animatePerson(p, dt, e.moving && e.stun <= 0, e.speed || .5); }
    // the floating triangle: white = unaware, yellow = suspicious, red = coming to talk
    if (e.tri) {
      e.tri.visible = !e.done && !e.cleared;
      if (e.tri.visible) {
        const st = e.static ? "sus" : e.state === "spot" ? "spot" : e.state === "sus" ? "sus" : "idle";
        e.tri.material = TRI_MAT[st];
        const s = st === "spot" ? 2 + Math.sin(time * 14) * .15 : 1.5 + Math.min(1, e.aw) * .45;
        e.tri.scale.setScalar(s); e.tri.rotation.y = time * (st === "idle" ? 1.2 : 3);
        e.tri.position.y = 1.9 * (e.person.sp.scale || 1) + .22 + Math.sin(time * 3 + e.hx) * .05;
      }
    }
    if (t.ghost) { ghostMat.opacity = Math.random() < .04 ? 0 : .25 + Math.abs(Math.sin(time * 3.3)) * .35; if (e.ghostLight) e.ghostLight.intensity = blackout > 0 ? 1.2 : .6; }
    if (e.cone) {
      e.cone.visible = e.stun <= 0 && !lure && !e.done && mode !== "story";
      const fx = Math.sin(e.yaw), fy = Math.cos(e.yaw);
      let rl = 0; while (rl < t.range && !solidSight(cell(Math.floor(e.x + fx * rl), Math.floor(e.y + fy * rl)))) rl += .15;
      e.cone.position.set(e.x * S, .03, e.y * S); e.cone.scale.setScalar(Math.max(.5, rl) * S);
      e.cone.rotation.y = e.yaw - Math.PI / 2; e.cone.material.opacity = e.state === "spot" ? .38 : e.state === "sus" ? .28 : .16;
      e.cone.material.color.setHex(e.state === "idle" ? 0xf2e6c0 : e.state === "sus" ? 0xf2b33d : 0xe2483d);
    }
  }
  for (const tr of level.transports) { tr.mesh.position.set(tr.x * S, 0, tr.y * S); tr.mesh.rotation.y = Math.atan2(tr.dir[0], tr.dir[1]); }
  for (const f of level.friends) {
    const dx = player.x - f.x, dy = player.y - f.y;
    if (Math.hypot(dx, dy) < 4) f.mesh.rotation.y = angLerp(f.mesh.rotation.y, Math.atan2(dx, dy), Math.min(1, dt * 4));
    animatePerson(f.person, dt, false, 0);
    f.tri.visible = friendNeeds(f); f.tri.rotation.y = time * 1.5;
    f.tri.position.y = 1.9 * (FRIENDS[f.kind].spec.scale || 1) + .22 + Math.sin(time * 4) * .06;
  }
  for (const d of level.doors) { d.ang += (d.target - d.ang) * Math.min(1, dt * 7); d.pivot.rotation.y = d.ang; }
  if (level.fireDoor) { const f = level.fireDoor, t = exitOpen() ? 1 : 0; f.open += (t - f.open) * Math.min(1, dt * 1.5); f.leaves.forEach((l, i) => { l.position.x = (i ? 1 : -1) * (S / 4 + f.open * (S / 2 - .05)); }); }
  for (const p of level.props) if (p.kind === "lift") { p.open = Math.max(0, p.open - dt * .5); const o = Math.min(1, p.open * 1.5); p.leaves.forEach((l, i) => { l.position.x = (i ? 1 : -1) * (.32 + o * .6); }); }
  sun.position.set(player.x * S + 4, 14, player.y * S + 3); sun.target.position.set(player.x * S, 0, player.y * S);
  if (scare) scare.mesh.rotation.y = Math.atan2(player.x - scare.x, player.y - scare.y);
  for (const it of level.items) if (!it.taken) { it.model.rotation.y = time * .8 + it.x; it.glow.material.opacity = .55 + .35 * Math.sin(time * 3 + it.y); }
  for (const h of level.hazards) if (h.kind === "z") for (const s of h.sparks) { s.visible = !!h.active && Math.random() < .7; s.position.set((Math.random() - .5) * .8, .3 + Math.random() * 2.2, (Math.random() - .5) * .8); }
  for (const d of level.drips) { d.y -= dt * 4; if (d.y < .2) d.y = WALL_H; d.mesh.position.y = d.y; }
  for (const p of level.props) if (p.kind === "=" && p.arm) p.arm.rotation.z += ((p.open ? Math.PI / 2 : 0) - p.arm.rotation.z) * Math.min(1, dt * 3);
  const tm = SHIFT_END + (mode === "story" && story ? Math.max(-1, story.i - 2) : run.minutes);
  for (const c of level.clocks) { c.m.rotation.z = -((tm % 60) / 60) * Math.PI * 2; c.h.rotation.z = -(((tm / 60) % 12) / 12) * Math.PI * 2; }
  if (run.rea && run.rea.beam) { const p = .5 + .5 * Math.sin(time * 8); run.rea.beam.material.opacity = .12 + .25 * p; reaLight.intensity = 1.2 * p; }
  if (level.exitGlow) level.exitGlow.intensity = exitOpen() ? .38 + Math.sin(time * 2) * .1 : .05;
  if (level.navi) { level.naviMat.opacity = .6 + .25 * Math.sin(time * 4); level.navi.visible = mode === "play"; if (level.chev) level.chev.visible = mode === "play"; }
  if (level.callMat) level.callMat.color.setHex(Math.sin(time * 5) > 0 ? 0xff3020 : 0x5a1410);
  renderer.render(scene, camera);
  if (mode === "play" || mode === "pause" || mode === "dialog") { drawMini(time); drawCompass(); }
  drawWaypoint();
}
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 78 : 66; camera.updateProjectionMatrix(); }
addEventListener("resize", resize);

let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (mode === "outro" && outro) { updateOutro(dt); if (outro) { renderer.render(outro.sc, outro.cam); requestAnimationFrame(frame); return; } }
  if (mode === "play" && !document.hidden) update(dt);
  else if (mode === "story" && story) { updateStory(dt); applyEnv(); }
  if (mode === "title") { player.yaw += dt * .18; player.pitch = -.05; }
  if (mode === "cpr" && cpr) { const ph = ((now - cpr.t0) % cpr.period) / cpr.period; $("cprHeart").style.transform = `scale(${1 + .18 * Math.max(0, 1 - ph * 4)})`; }
  render(now / 1000, dt);
  requestAnimationFrame(frame);
}

// ---------- boot ----------
{
  const best = getBest();
  if (best != null) { $("bestLine").hidden = false; $("bestLine").textContent = "Frühester Feierabend bisher: " + fmtTime(best); }
  newRun(); loadFloor(0); resize(); requestAnimationFrame(frame);
}
if (location.hash === "#debug") window.__he = { get run() { return run; }, get level() { return level; }, player, get mode() { return mode; }, set mode(v) { mode = v; },
  goto: i => { run.idx = i; loadFloor(i); mode = "play"; show(null); hidePopups(); }, startRea, startCall: d => startCall(d || HEADHUNTER), act, nextFloor, storyNext, endStory,
  tp: (x, y) => { player.x = x + .5; player.y = y + .5; }, hostile: i => hostileDialog(level.enemies[i]), friend: i => friendDialog(level.friends[i]),
  bouncer: () => bouncerDialog(level.enemies.find(e => e.type === "U" && !e.cleared)), finale, chooseOption, closeDialog, startCpr, cprPress, useItem, addItem,
  flags: () => [...run.flags], focus: () => focus && focus.type, setYaw: y => { player.yaw = y; }, show };
