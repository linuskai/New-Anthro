/* Hospital Escape 3D · input, stealth AI, hazards, events and the main update loop. */
const diffMul = () => settings.diff === "easy" ? .55 : .9;

// ---------- input ----------
const keys = new Set();
addEventListener("keydown", e => {
  const k = e.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", "q", "shift"].includes(k)) { keys.add(k); if (mode === "play") e.preventDefault(); }
  if (mode === "dialog") {
    if (["1", "2", "3", "4"].includes(k)) { chooseOption(+k - 1); e.preventDefault(); }
    else if ((k === "enter" || k === " " || k === "e") && dlgState && dlgState.chosen) { closeDialog(); e.preventDefault(); }
    return;
  }
  if (mode === "story" && (k === "enter" || k === " ")) { e.preventDefault(); storyNext(); return; }
  if (mode === "outro" && (k === "enter" || k === " ")) { e.preventDefault(); $("btnStoryNext").click(); return; }
  if (mode === "cpr" && (k === " " || k === "enter")) { cprPress(); e.preventDefault(); return; }
  if ((k === "enter" || k === " ") && ["title", "brief", "intro", "over", "win"].includes(mode)) {
    const id = { title: "btnStart", brief: "btnBrief", intro: "btnGo" }[mode] || "btnAgain";
    if (!$(id).closest(".overlay").hidden) { e.preventDefault(); $(id).click(); }
  }
  if (mode === "play") {
    if (k === "e") act();
    if (k === "c") toggleSneak();
    if (k === "f") toggleLamp();
    if (/^[1-6]$/.test(k)) { const s = invSlots()[+k - 1]; if (s) useItem(s); }
    if (call && (k === "y" || k === "j")) acceptCall();
    if (call && k === "n") declineCall();
    if (k === "p" || k === "escape") pause();
    if (k === "m") openMap();
    if (k === "b" || k === "tab") { e.preventDefault(); openMC(); }
  } else if (mode === "pause" && (k === "p" || k === "escape")) resume();
  else if (mode === "mc" && (k === "b" || k === "tab" || k === "escape")) { e.preventDefault(); closeMC(); }
  else if (mode === "map" && (k === "m" || k === "escape")) closeMap();
});
addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));
addEventListener("blur", () => { keys.clear(); clearInputs(); });
document.addEventListener("visibilitychange", () => { if (document.hidden && mode === "play") pause(); });
document.addEventListener("gesturestart", e => e.preventDefault());

const touchLayer = $("touch");
// keep the host page from scrolling or swiping while you steer
for (const ev of ["touchstart", "touchmove"]) touchLayer.addEventListener(ev, e => { if (e.cancelable) e.preventDefault(); }, { passive: false });
const ptr = { move: null, look: null };
let locked = false;
function clearInputs() { ptr.move = null; ptr.look = null; $("moveStick").hidden = true; $("lookStick").hidden = true; player.sprint = false; $("btnSprint").classList.remove("on"); }
touchLayer.addEventListener("pointerdown", e => {
  if (mode !== "play") return;
  if (e.pointerType === "mouse" && !locked && touchLayer.requestPointerLock) { try { const p = touchLayer.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (_) {} }
  const left = e.pointerType !== "mouse" && e.clientX < innerWidth * .45 && e.clientY > innerHeight * .42;
  if (left && !ptr.move) {
    ptr.move = { id: e.pointerId, ox: e.clientX, oy: e.clientY, vx: 0, vy: 0 };
    const st = $("moveStick"); st.style.left = e.clientX + "px"; st.style.top = e.clientY + "px"; $("moveKnob").style.transform = ""; st.hidden = false;
  } else if (!left && !ptr.look) {
    ptr.look = { id: e.pointerId, ox: e.clientX, oy: e.clientY, lx: e.clientX, ly: e.clientY, vx: 0, vy: 0, mouse: e.pointerType === "mouse" };
    if (settings.look === "stick" && !ptr.look.mouse) { const st = $("lookStick"); st.style.left = e.clientX + "px"; st.style.top = e.clientY + "px"; $("lookKnob").style.transform = ""; st.hidden = false; }
  } else return;
  try { touchLayer.setPointerCapture(e.pointerId); } catch (_) {}
  e.preventDefault();
});
function look(dx, dy, mouse) {
  const sens = (mouse ? .0042 : .0095) * settings.sens;
  player.yaw -= dx * sens;
  player.pitch = Math.max(-.65, Math.min(.55, player.pitch - dy * sens * .7 * (settings.invert ? -1 : 1)));
}
touchLayer.addEventListener("pointermove", e => {
  if (locked) return;
  if (ptr.move && e.pointerId === ptr.move.id) {
    let dx = e.clientX - ptr.move.ox, dy = e.clientY - ptr.move.oy; const d = Math.hypot(dx, dy), max = 50;
    if (d > max) { dx = dx / d * max; dy = dy / d * max; }
    $("moveKnob").style.transform = `translate(${dx}px, ${dy}px)`; $("moveKnob").classList.toggle("sneak", d > 6 && d < max * .55);
    ptr.move.vx = d > 6 ? dx / max : 0; ptr.move.vy = d > 6 ? dy / max : 0;
  } else if (ptr.look && e.pointerId === ptr.look.id) {
    if (settings.look === "stick" && !ptr.look.mouse) {
      let dx = e.clientX - ptr.look.ox, dy = e.clientY - ptr.look.oy; const d = Math.hypot(dx, dy), max = 50;
      if (d > max) { dx = dx / d * max; dy = dy / d * max; }
      $("lookKnob").style.transform = `translate(${dx}px, ${dy}px)`;
      ptr.look.vx = Math.abs(dx) > 5 ? dx / max : 0; ptr.look.vy = Math.abs(dy) > 8 ? dy / max : 0;
    } else { look(e.clientX - ptr.look.lx, e.clientY - ptr.look.ly, ptr.look.mouse); ptr.look.lx = e.clientX; ptr.look.ly = e.clientY; }
  }
});
const endPtr = e => {
  if (ptr.move && e.pointerId === ptr.move.id) { ptr.move = null; $("moveStick").hidden = true; }
  if (ptr.look && e.pointerId === ptr.look.id) { ptr.look = null; $("lookStick").hidden = true; }
};
touchLayer.addEventListener("pointerup", endPtr); touchLayer.addEventListener("pointercancel", endPtr);
document.addEventListener("pointerlockchange", () => { locked = document.pointerLockElement === touchLayer; if (!locked) ptr.look = null; });
document.addEventListener("mousemove", e => { if (locked && mode === "play") look(e.movementX || 0, e.movementY || 0, true); });
const sprintBtn = $("btnSprint");
sprintBtn.addEventListener("pointerdown", e => { e.preventDefault(); player.sprint = true; sprintBtn.classList.add("on"); try { sprintBtn.setPointerCapture(e.pointerId); } catch (_) {} });
const sprintOff = () => { player.sprint = false; sprintBtn.classList.remove("on"); };
sprintBtn.addEventListener("pointerup", sprintOff); sprintBtn.addEventListener("pointercancel", sprintOff);
function toggleSneak() { player.sneak = !player.sneak; $("btnSneak").classList.toggle("on", player.sneak); $("btnSneak").setAttribute("aria-pressed", player.sneak); }
function toggleLamp() { if (!inDarkness()) return; player.lampOn = !player.lampOn; sfx.tick(); setMsg(player.lampOn ? "Taschenlampe an. Du siehst mehr. Man sieht dich auch." : "Taschenlampe aus. Unsichtbarer. Und blinder.", 2.5); updateEnergy(); }
$("btnSneak").addEventListener("pointerdown", e => { e.preventDefault(); if (mode === "play") toggleSneak(); });
$("chipLamp").addEventListener("click", () => { if (mode === "play") toggleLamp(); });
$("btnAct").addEventListener("pointerdown", e => { e.preventDefault(); if (mode === "play") act(); });
function moveInput() {
  let f = 0, s = 0;
  if (keys.has("w") || keys.has("arrowup")) f += 1;
  if (keys.has("s") || keys.has("arrowdown")) f -= 1;
  if (keys.has("d")) s += 1;
  if (keys.has("a")) s -= 1;
  if (f || s) { const d = Math.hypot(f, s); return [f / d, s / d]; }
  if (ptr.move) return [-ptr.move.vy, ptr.move.vx];
  return [0, 0];
}

// ---------- interaction ----------
let focus = null;
function findFocus() {
  const fx = -Math.sin(player.yaw), fy = -Math.cos(player.yaw);
  let best = null, bd = 9;
  const consider = (x, y, range, item) => { const dx = x - player.x, dy = y - player.y, d = Math.hypot(dx, dy); if (d > range) return; if (d > .55 && (dx * fx + dy * fy) / d < .1) return; if (d < bd) { bd = d; best = item; } };
  for (const f of level.friends) consider(f.x, f.y, 1.4, { type: "friend", ref: f, label: "Sprechen", name: FRIENDS[f.kind].name });
  for (const it of level.items) if (!it.taken) consider(it.wx, it.wy, 1.05, { type: "item", ref: it, label: "Nehmen", name: ITEMS[it.kind].name });
  if (run.route === "consult" && !run.flags.has("excel")) for (const e of level.enemies) if (e.type === "V" && !e.done && !e.gone) consider(e.x, e.y, 1.7, { type: "stampV", ref: e, label: "Excel holen", name: e.name });
  for (const e of level.enemies) if (e.type === "U" && !e.cleared) consider(e.x, e.y, 1.45, { type: "bouncer", ref: e, label: "Ansprechen", name: "Orthopäde" });
  if (level.boss && !level.boss.cleared) consider(level.boss.x, level.boss.y, 1.6, { type: "boss", ref: level.boss, label: "Ansprechen", name: level.boss.def.name + " · Endgegner" });
  for (const p of level.props) {
    if (p.kind === "M" && p.uses < 3) consider(p.x, p.y, 1.35, { type: "machine", ref: p, label: "Automat", name: "Snackautomat" });
    if (p.kind === "L" && !run.flags.has("approbation")) consider(p.x, p.y, 1.35, { type: "locker", ref: p, label: "Öffnen", name: "Dein Spind" });
    if (p.kind === "G" && !run.flags.has("power")) consider(p.x, p.y, 1.35, { type: "fuse", ref: p, label: run.flags.has("fuse") ? "Reparieren" : "Ansehen", name: "Sicherungskasten" });
    if (p.kind === "bedhide") consider(p.x, p.y, 1.25, { type: "bedhide", ref: p, label: player.hidden ? "Aufstehen" : "Hinlegen", name: "Bett · neben dem Patienten" });
    if (p.kind === "w") consider(p.x, p.y, .95, { type: "cart", ref: p, label: player.hidden ? "Raus" : "Verstecken", name: "Wäschewagen" });
    if (p.kind === "v" && run.mode === "mission") consider(p.x, p.y, 1.5, { type: "board", ref: p, label: "Öffnen", name: "Mission Control" });
    if (p.kind === "W" && !p.used) consider(p.x, p.y, 1.4, { type: "spa", ref: p, label: "Liegen", name: "Wellness-Liege" });
    if (p.kind === "sofa" && (run.mode === "night" ? !(p.room.restT > run.minutes) : !p.room.rested)) consider(p.x, p.y, 1.3, { type: "sofa", ref: p, label: p.bed ? "Hinlegen" : "Ausruhen", name: p.bed ? "Bereitschaftsliege" : "Sofa" });
    if (p.kind === "t" && !run.flags.has("ticket")) consider(p.x, p.y, 1.35, { type: "ticket", ref: p, label: "Bezahlen", name: "Parkticket-Automat" });
    if (p.kind === "=" && !run.flags.has("barrier")) consider(p.x, p.y, 1.5, { type: "barrier", ref: p, label: "Ticket rein", name: "Schranke" });
    if (p.kind === "y" && !run.flags.has("vent")) consider(p.x, p.y, 1.4, { type: "vent", ref: p, label: "Einschalten", name: "Lüftung" });
    if (p.kind === "j") consider(p.x, p.y, 1.7, { type: "car", ref: p, label: "Einsteigen", name: run.route === "stay" ? "Dein Auto" : mission().ride });
  }
  for (const d of level.doors) {
    const tx = d.x + .5, ty = d.y + .5, inTile = Math.floor(player.x) === d.x && Math.floor(player.y) === d.y;
    if (!inTile) consider(tx, ty, 1.55, { type: "door", ref: d, label: d.open ? "Schließen" : "Öffnen", name: d.safe ? "Ruheraum" : "Tür" });
  }
  for (const p of level.props) {
    if (p.kind === "lift") consider(p.x, p.y, 1.3, { type: "lift", ref: p, label: "Rufen", name: "Aufzug" });
    if (p.kind === "locked") consider(p.x, p.y, 1.2, { type: "locked", ref: p, label: "Rütteln", name: p.name });
    if (p.kind === "pc") consider(p.x, p.y, 1.3, { type: "pc", ref: p, label: "Einloggen", name: "Computer (KIS 2003)" });
    if (p.kind === "phone") consider(p.x, p.y, 1.3, { type: "phone", ref: p, label: "Abheben", name: "Diensttelefon" });
    if (p.kind === "fire") consider(p.x, p.y, 1.3, { type: "fire", ref: p, label: "Feuermelder", name: "Nur im Notfall" });
    if (p.kind === "brew") consider(p.x, p.y, 1.3, { type: "brew", ref: p, label: "Kaffee", name: "Kaffeemaschine" });
    if (["photo", "stamp", "meds", "grab", "film"].includes(p.kind) && !run.flags.has(p.goal)) consider(p.x, p.y, 1.5, { type: "routeprop", ref: p, label: p.kind === "photo" ? "Fotografieren" : p.grab ? p.grab[1] : "Einpacken", name: BAG_NAMES[p.goal] || "Beweis" });
  }
  if (run.task && run.mode === "night") consider(run.task.x + .5, run.task.y + .5, 1.5, { type: "nighttask", label: "Versorgen", name: "Zi. " + run.task.room });
  if (run.rea && !run.rea.done) consider(run.rea.x + .5, run.rea.y + .5, 1.3, { type: "rea", label: "Reanimieren", name: "Patient ohne Puls" });
  return best;
}
function act() {
  if (!focus || player.channel) return;
  const f = focus;
  if (f.type === "friend") friendDialog(f.ref);
  else if (f.type === "item") pickupItem(f.ref);
  else if (f.type === "bouncer") bouncerDialog(f.ref);
  else if (f.type === "boss") bossDialog(f.ref);
  else if (f.type === "machine") {
    f.ref.uses++; const v = Math.random();
    if (v < .45) { addItem("$"); showToast("🍩", "#f3f8f1", "Snackautomat", "Ein Donut fällt. 4,50 €. Du hattest 5 €. Kein Wechselgeld.", [good("🍩 eingepackt")]); }
    else if (v < .75) showToast("😤", "#f3f8f1", "Snackautomat", "Er klemmt. Du rüttelst. Er bleibt stur. Wartungsvertrag: gekündigt.", pen({ energy: 5 }));
    else { addItem("0"); showToast("🥫", "#f3f8f1", "Snackautomat", "Ein Energydrink! Das Universum mag dich heute.", [good("🥫 eingepackt")]); }
    sfx.knock(); updateHud();
  } else if (f.type === "locker") { run.flags.add("approbation"); sfx.pick(); showToast("📜", "#f2b33d", "Dein Spind", "Approbationsurkunde, eine alte Banane, 14 Kugelschreiber. Du nimmst die Urkunde.", [good("Approbation")]); updateHud(); }
  else if (f.type === "fuse") {
    if (!run.flags.has("fuse")) { showToast("⚡", "#f2c300", "Sicherungskasten", "Eine Sicherung fehlt. Der Hausmeister hat sicher Ersatz.", []); return; }
    player.channel = { t: 0, total: 2.6, label: "Einsetzen…", done: () => { run.flags.add("power"); sfx.power(); blackout = 0; applyEnv(true); showToast("💡", "#f2c300", "Strom ist da!", "Licht! Die Tür zum Treppenhaus summt auf. Der Aufzug bleibt natürlich kaputt.", [good("Strom an")]); updateHud(); } };
  } else if (f.type === "bedhide") {
    player.hidden = !player.hidden;
    if (player.hidden) { sfx.step(); showToast("🛏️", "#9cc6e6", "Unter der Decke", pick(["Du legst dich neben Hr. Brösel und ziehst die Decke hoch. Er sagt: „Na endlich mal ein Arzt, der Zeit hat.“", "Unter der Decke. Der Patient neben dir flüstert: „Ich verrate nichts. Aber ich will morgen Schnitzel.“", "Du bist jetzt Flurbett 24b. Niemand schaut zweimal hin. Flurbetten sind unsichtbar, sagt das Controlling."]), [good("Versteckt")]); }
  } else if (f.type === "cart") { player.hidden = !player.hidden; if (player.hidden) setMsg("Im Wäschewagen. Riecht nach Station 4. Nicht bewegen.", 2.5); }
  else if (f.type === "board") openMC();
  else if (f.type === "vent") player.channel = { t: 0, total: 2.4, label: "Hebel umlegen…", done: () => { run.flags.add("vent"); sfx.power(); showToast("🌬️", "#7a9a3a", "Operation Frischluft", pick(["Die Lüftung röchelt, hustet, läuft. Zum ersten Mal seit 2017 riecht die Station nach… Station.", "Ein Brummen. Dann ein Luftzug. Ein Gastroenterologe ruft: „Was ist das für ein komischer Geruch?“ Es ist frische Luft."]), [good("Lüftung an")]); updateHud(); } };
  else if (f.type === "spa") player.channel = { t: 0, total: 2.2, label: "Entspannen…", done: () => { f.ref.used = true; run.spa++; run.flags.add("spa"); sfx.spa(); showToast("🧖", "#f6c1d4", "Wellness-Liege", "Gurkenscheiben auf den Augen. Du vergisst kurz, dass du Ärztin oder Arzt bist.", gain({ energy: 40, nerves: 1 })); updateHud(); } };
  else if (f.type === "sofa" && run.mode === "night") player.channel = { t: 0, total: 3, label: "Schlafen…", done: () => { f.ref.room.restT = run.minutes + 85; run.minutes += 25; sfx.spa(); showToast("😴", "#2d3f8f", "Powernap", pick(["Du schläfst 25 Minuten. Der Pager schläft nicht. Er wartet nur.", "Du träumst vom Feierabend. Im Traum klingelt das Telefon. Auch in echt.", "Augen zu. Irgendwo flüstert jemand „Kurven…“. Augen wieder auf."]), gain({ energy: 45, nerves: 1 }).concat([{ text: "+25 Min" }])); updateHud(); } };
  else if (f.type === "nighttask") player.channel = { t: 0, total: 2.2, label: "Versorgen…", done: () => completeTask() };
  else if (f.type === "sofa") player.channel = { t: 0, total: 3, label: "Ausruhen…", done: () => { f.ref.room.rested = true; sfx.spa(); showToast("🛋️", "#c9a77a", "Durchatmen", pick(["Fünf Minuten Augen zu. Niemand kommt rein. Hier ist ja Arbeit.", "Du starrst an die Decke. Sie starrt zurück. Es ist schön.", "Im Radio läuft „Stayin' Alive“. Du lachst. Dann weinst du kurz. Dann geht's wieder."]), gain({ energy: 35, nerves: 1 })); updateHud(); } };
  else if (f.type === "ticket") ticketDialog();
  else if (f.type === "barrier") {
    if (!run.flags.has("ticket")) { showToast("🚧", "#c0322a", "Schranke", "„Bitte Ticket einführen.“ Du hast keins. Der Automat steht in der Notaufnahme.", []); return; }
    run.flags.add("barrier"); grid[Math.floor(f.ref.y)][Math.floor(f.ref.x)] = "."; f.ref.open = true; sfx.ding();
    showToast("🎫", "#1f9d55", "Schranke", "Piep. Sie öffnet sich. 12 € für 9 Stunden Überstunden-Parken. Fair.", [good("Schranke offen")]); updateHud();
  } else if (f.type === "car") { if (level.boss && !level.boss.cleared) { showToast(mission().boss.av, "#e2483d", mission().boss.name, "„Moment!“ " + mission().boss.name + " stellt sich dir in den Weg. Erst an mir vorbei.", []); return; } if (run.route === "stay" && !run.flags.has("key")) { showToast("🔑", "#c0322a", "Dein Auto", "Kein Schlüssel. Der liegt noch bei Dr. Kurz.", []); return; } finale(); }
  else if (f.type === "rea") startCpr();
  else if (f.type === "door") toggleDoor(f.ref);
  else if (f.type === "lift") liftDialog(f.ref);
  else if (f.type === "locked") { sfx.knock(); showToast("🔒", "#c0322a", f.ref.name, f.ref.text, []); makeNoise(3, .15); }
  else if (f.type === "pc") pcDialog();
  else if (f.type === "phone") phoneDialog();
  else if (f.type === "brew") brewDialog(f.ref);
  else if (f.type === "fire") fireAlarmDialog(f.ref);
  else if (f.type === "routeprop") {
    const p = f.ref; run.flags.add(p.goal); sfx.pick();
    if (p.kind === "photo") { flash(); tone(1800, 0, .05, "square", .05); showToast("📸", "#f2b33d", "Beweisfoto", pick(run.route === "botox" ? ["Klick. Vorher. Dr. Glatt wird ein Nachher daraus machen. Mit Filter.", "Klick. Dr. Kreuzband flext automatisch. Er spürt Kameras."] : ["Klick. Kevin wird das auf Folie 12 „Quick Wins“ packen.", "Klick. Im Hintergrund winkt eine Pflegekraft. Sie ahnt nicht, dass sie gerade „Optimierungspotenzial“ ist.", "Klick. Du fühlst dich schmutzig. Und sechsstellig."]), [good(BAG_NAMES[p.goal] || "Foto")]); }
    else if (p.kind === "film") { flash(); sfx.spa(); showToast(p.grab[0], "#c13584", "Reel im Kasten", p.grab[2], [good("Reel"), good("+3.200 Follower")]); }
    else if (p.kind === "stamp") showToast("🖃", "#2d3f8f", "Stempel", pick(["Ratsch. Ein Stempel, leicht schief. Behörden lieben schief.", "Ratsch. Das Datum ist von 2019. Egal, Stempel ist Stempel."]), [good(BAG_NAMES[p.goal])]);
    else if (p.kind === "grab") showToast(p.grab[0], "#1f9d55", BAG_NAMES[p.goal] || "Eingepackt", p.grab[2], [good(BAG_NAMES[p.goal] || "Eingepackt")]);
    else showToast("💊", "#1f9d55", "Reisetabletten", p.grab ? p.grab[2] : "Eingepackt.", [good("Reisetabletten")]);
    updateHud();
  }
  else if (f.type === "stampV") stampDialog(f.ref);
}

// ---------- movement ----------
const blocked = (x, y) => {
  const r = PLAYER_R;
  if (blockedAt(x - r, y - r) || blockedAt(x + r, y - r) || blockedAt(x - r, y + r) || blockedAt(x + r, y + r)) return true;
  const c = .15;
  for (const k of level.colliders) if (x + c > k.x0 && x - c < k.x1 && y + c > k.y0 && y - c < k.y1) return true;
  return false;
};
function stepAxis(dx, dy) {
  if (!dx && !dy) return;
  if (!blocked(player.x + dx, player.y + dy)) { player.x += dx; player.y += dy; return; }
  const amt = Math.abs(dx || dy);
  if (dx) { const cy = Math.floor(player.y) + .5, off = cy - player.y; if (Math.abs(off) > .01 && !blocked(player.x + dx, cy)) player.y += Math.sign(off) * Math.min(Math.abs(off), amt * .8); }
  else { const cx = Math.floor(player.x) + .5, off = cx - player.x; if (Math.abs(off) > .01 && !blocked(cx, player.y + dy)) player.x += Math.sign(off) * Math.min(Math.abs(off), amt * .8); }
}
function updatePlayer(dt) {
  let turn = 0;
  if (keys.has("arrowleft") || keys.has("q")) turn += 1;
  if (keys.has("arrowright")) turn -= 1;
  player.yaw += turn * 2.4 * dt;
  if (ptr.look && settings.look === "stick" && !ptr.look.mouse) {
    const vx = ptr.look.vx, vy = ptr.look.vy;
    player.yaw -= Math.sign(vx) * Math.pow(Math.abs(vx), 1.6) * 2.9 * settings.sens * dt;
    player.pitch = Math.max(-.65, Math.min(.55, player.pitch - vy * 1.4 * settings.sens * dt * (settings.invert ? -1 : 1)));
  }
  const [f, s] = moveInput();
  const mag = Math.min(1, Math.hypot(f, s)), moving = mag > .08;
  if (moving && !ptr.look && !locked) player.pitch *= 1 - Math.min(1, dt * 1.5);
  player.moveMag = 0;
  if (player.channel) {
    if (moving) { player.channel = null; setMsg("Abgebrochen. Stillhalten.", 2); }
    else { player.channel.t += dt; if (player.channel.t >= player.channel.total) { const d = player.channel.done; player.channel = null; d(); } }
    return;
  }
  if (player.hidden && moving) player.hidden = false;
  if (player.stun > 0) { player.stun -= dt; return; }
  const sneaking = moving && (player.sneak || (ptr.move && mag < .55));
  const sprinting = (player.sprint || keys.has("shift")) && moving && run.energy > 3 && !sneaking;
  let mult = sneaking ? .5 : 1;
  if (player.coffee > 0) mult *= 1.3;
  if (sprinting) mult *= 1.6;
  if (run.energy <= 0) mult *= .55;
  player.moveMag = moving ? (sneaking ? .5 : sprinting ? 1.8 : 1) : .3;
  let vx, vy;
  if (player.slip > 0) { player.slip -= dt; vx = player.slipDir[0] * PLAYER_SPEED * 1.5 * dt; vy = player.slipDir[1] * PLAYER_SPEED * 1.5 * dt; player.yaw += dt * 3; }
  else { const sp = PLAYER_SPEED * mult * dt / Math.max(1, mag) * (sneaking && ptr.move ? 1 : 1), fx = -Math.sin(player.yaw), fy = -Math.cos(player.yaw), rx = Math.cos(player.yaw), ry = -Math.sin(player.yaw); vx = (fx * f + rx * s) * sp; vy = (fy * f + ry * s) * sp; }
  const ox = player.x, oy = player.y;
  stepAxis(vx, 0); stepAxis(0, vy);
  if (level.exit && !exitOpen() && Math.floor(player.x) === level.exit[0] && Math.floor(player.y) === level.exit[1]) {
    player.x = ox; player.y = oy;
    const miss = objectives().filter(o => o.main && !o.done && !o.isExit), lk = miss.length && (miss[0].route || miss[0].boss || !LEVELS[run.idx].lock) ? "Noch nicht: " + miss.map(o => o.title || o.text).join(", ") : LEVELS[run.idx].lock || "Erst die Mission erledigen.";
    if (msg.text !== lk) setMsg(lk, 3, true);
  }
  run.energy = Math.max(0, run.energy - dt * (sprinting ? 6 : moving ? (sneaking ? .2 : .4) : .1));
  if (sprinting) { player.noiseT -= dt; if (player.noiseT <= 0) { player.noiseT = .5; makeNoise(4.5, .35); } }
  if (moving || player.slip > 0) { const prev = player.bob; player.bob += dt * 9 * mult; if (!sneaking && Math.floor(prev / Math.PI) !== Math.floor(player.bob / Math.PI)) sfx.step(); }
  level.visited[Math.floor(player.y) * GW + Math.floor(player.x)] = 1;
  if (inDarkness() && player.lampOn) player.lamp = Math.max(0, player.lamp - dt * (LEVELS[run.idx].env === "radio" ? .9 : run.mode === "night" ? .22 : .6));
}
function makeNoise(radius, amount) {
  for (const e of level.enemies) if (!e.done && !e.static && !TYPES[e.type].ghost && Math.hypot(e.x - player.x, e.y - player.y) < radius) {
    e.aw = Math.min(1.2, e.aw + amount * diffMul()); e.tyaw = Math.atan2(player.x - e.x, player.y - e.y);
  }
}

// ---------- stealth AI ----------
function perceive(e, t, dx, dy, d) {
  if (player.hidden || playerSafe() || player.busy > 0) return 0;
  let range = t.range;
  if (inDarkness() && !t.ghost) range *= lampVisible() ? 1.15 : .5;
  if (d > range) return 0;
  const fx = Math.sin(e.yaw), fy = Math.cos(e.yaw), dot = (dx * fx + dy * fy) / d;
  if (d > 1.2 && dot < t.fov) return 0;
  if (!(t.ghost && blackout > 0) && !los(e.x, e.y, player.x, player.y)) return 0;
  const civil = player.civil ? ("NOCVIADR".includes(e.type) ? .3 : 1.25) : 1, phone = player.phoneT > 0 && "NOCVIADnU".includes(e.type) ? .2 : 1;
  const grace = player.inv > 0 ? .15 : 1; // right after a conversation the others give you a moment
  if ((phone < 1 || civil < 1) && d < 4.5 && player.moveMag > 0 && !e.shrugged) { e.shrugged = true; emote(e, phone < 1 ? "🤫" : "🤷"); }
  return t.detect * Math.max(.25, 1.5 - d / range) * player.moveMag * diffMul() * civil * grace * phone;
}
/* chasing: only towards where they last SAW you. Out of sight they go there, look around, give up.
   The chief and a paged attending always know where you are (they have the intercom). */
function chase(e, t, dx, dy, d, dt, sp) {
  const sees = !player.hidden && !playerSafe() && los(e.x, e.y, player.x, player.y) && d < t.range * 1.2;
  const omniscient = e.type === "C" || e.hunter;
  if (sees || omniscient) { e.lastSeen = [player.x, player.y]; e.lostT = 0; e.searching = 0; }
  if (sees && d < 1.2) { const st = Math.min(sp * dt, d), nx = e.x + dx / d * st, ny = e.y + dy / d * st; if (!blockedAt(nx, ny)) { e.x = nx; e.y = ny; e.tx = Math.floor(e.x); e.ty = Math.floor(e.y); } e.tyaw = Math.atan2(dx, dy); e.moving = true; e.speed = sp; return; }
  const ls = e.lastSeen || [player.x, player.y];
  if (Math.hypot(ls[0] - e.x, ls[1] - e.y) > .8) { walkTo(e, Math.floor(ls[0]), Math.floor(ls[1]), sp, dt); e.lostT = (e.lostT || 0) + (sees ? 0 : dt); if (e.lostT < 9) return; }
  // arrived (or took too long): look around, then give up
  e.searching = (e.searching || 0) + dt; e.moving = false;
  e.tyaw += dt * 2.2 * Math.sin(e.searching * 1.7);
  if (e.searching > 2.8) { e.aw = .2; e.state = "idle"; e.searching = 0; e.lastSeen = null; e.lostT = 0; emote(e, pick(["🤷", "❔", "🙄"])); setExpression(e.person, "worried"); }
}
function walkTo(e, gx, gy, sp, dt) {
  const step = sp * dt;
  const tx = e.tx + .5, ty = e.ty + .5, mx = tx - e.x, my = ty - e.y, md = Math.hypot(mx, my);
  e.moving = true; e.speed = sp;
  if (md <= step) {
    e.x = tx; e.y = ty;
    const n = bfsNextEnemy(e.tx, e.ty, gx, gy);
    if (n) { e.tx = n[0]; e.ty = n[1]; enemyDoor(e); e.tyaw = Math.atan2(n[0] - Math.floor(e.x), n[1] - Math.floor(e.y)); } else e.moving = false;
  } else { e.x += mx / md * step; e.y += my / md * step; e.tyaw = Math.atan2(mx, my); }
}
function patrol(e, t, dt) {
  if (e.pause > 0) { e.pause -= dt; e.lookT -= dt; if (e.lookT <= 0) { e.lookT = .8 + Math.random() * 1.2; e.tyaw += (Math.random() - .5) * 2.4; } return; }
  const tx = e.tx + .5, ty = e.ty + .5, mx = tx - e.x, my = ty - e.y, md = Math.hypot(mx, my), step = t.walk * dt * (settings.diff === "easy" ? .85 : 1);
  e.moving = true; e.speed = t.walk;
  if (md > step) { e.x += mx / md * step; e.y += my / md * step; e.tyaw = Math.atan2(mx, my); return; }
  e.x = tx; e.y = ty;
  if (Math.random() < .35) { e.pause = 1 + Math.random() * 2.5; return; }
  const cx = e.tx, cy = e.ty, fx = Math.round(Math.sin(e.yaw)), fy = Math.round(Math.cos(e.yaw));
  let opts = DIRS.filter(([dx, dy]) => enemyPass(cx + dx, cy + dy) && cell(cx + dx, cy + dy) !== "z" && (cell(cx + dx, cy + dy) !== "d" || Math.random() < .2));
  const near = opts.filter(([dx, dy]) => Math.abs(cx + dx - e.hx) + Math.abs(cy + dy - e.hy) <= (e.type === "O" || e.type === "D" ? 6 : 3));
  if (near.length) opts = near;
  if (!opts.length) return;
  const nonRev = opts.filter(([dx, dy]) => !(dx === -fx && dy === -fy));
  const fwd = opts.find(([dx, dy]) => dx === fx && dy === fy);
  const d = fwd && Math.random() < .6 ? fwd : pick(nonRev.length ? nonRev : opts);
  e.tx = cx + d[0]; e.ty = cy + d[1];
  enemyDoor(e);
}
/* someone opens a closed door in their way. Loud enough to notice. */
function enemyDoor(e) {
  if (cell(e.tx, e.ty) !== "d") return;
  const d = doorAt(e.tx, e.ty); if (!d || d.safe) return;
  setDoor(d, true, true); sfx.door(); e.pause = Math.max(e.pause || 0, .5);
  if (Math.hypot(player.x - e.x, player.y - e.y) < 6) setMsg(pick(["Eine Tür geht auf…", "Klack. Jemand kommt rein.", "Die Tür! Versteck dich!"]), 2, true);
}
function toggleDoor(d) {
  if (d.open) {
    const busy = level.enemies.some(e => !e.gone && Math.floor(e.x) === d.x && Math.floor(e.y) === d.y);
    if (busy) { setMsg("Da steht jemand in der Tür.", 1.5); return; }
    setDoor(d, false);
  } else setDoor(d, true);
  makeNoise(2.5, .08);
}
// who is delighted to see a doctor (patients, relatives, dermatologists) and who is not
const FANS = ["P", "F", "Z", "R", "Q"];
function exprFor(e) {
  if (e.done) return "smile";
  if (e.state === "sus") return "surprised";
  if (e.state === "spot") return FANS.includes(e.type) ? "happy" : e.type === "N" ? "worried" : "angry";
  if (e.state === "lured" || e.state === "nerd") return "surprised";
  return e.person.sp.mood || "neutral";
}
function emote(e, txt) {
  if (!level || !e.mesh) return;
  const s = sprite(emoteTex(txt), .42, .42); s.position.set(0, 2.55 * (e.person.sp.scale || 1), 0); e.mesh.add(s);
  (level.emotes || (level.emotes = [])).push({ s, t: 0, parent: e.mesh });
}
function updateEmotes(dt) {
  if (!level.emotes) return;
  for (const m of level.emotes) { m.t += dt; m.s.position.y += dt * .25; m.s.material.opacity = Math.max(0, 1 - Math.max(0, m.t - .9) / .6); }
  level.emotes = level.emotes.filter(m => { if (m.t < 1.5) return true; m.parent.remove(m.s); m.s.material.dispose(); return false; });
}
function updateEnemy(e, dt) {
  const t = TYPES[e.type];
  e.moving = false;
  if (e.gone) return;
  if (e.static) {
    if (e.cool > 0) e.cool -= dt;
    if (!e.cleared && Math.hypot(player.x - e.x, player.y - e.y) < .95 && !(e.cool > 0) && player.inv <= 0) { e.cool = 3; (e.boss ? bossDialog : bouncerDialog)(e); }
    return;
  }
  if (e.state === "leaving") {
    e.leaving -= dt; walkTo(e, e.leaveTo[0], e.leaveTo[1], t.walk * 1.6, dt);
    if (e.leaving <= 0 || !e.moving) { e.gone = true; e.mesh.visible = false; if (e.cone) e.cone.visible = false; }
    return;
  }
  if (e.type === "J") { updateHildegard(e, t, dt); return; }
  if (e.stun > 0) { e.stun -= dt; e.aw = Math.max(0, e.aw - dt); return; }
  const dx = player.x - e.x, dy = player.y - e.y, d = Math.hypot(dx, dy) || .001;
  const rate = perceive(e, t, dx, dy, d);
  if (rate > 0) e.aw = Math.min(1.2, e.aw + rate * dt);
  else e.aw = Math.max(0, e.aw - dt * (e.state === "spot" ? .14 : .3));
  const prev = e.state;
  if (lure && !t.ghost) e.state = "lured";
  else if (e.state === "nerd" && nerdLure) { /* reading the case report */ }
  else if (e.aw >= 1 || (e.state === "spot" && e.aw > .4)) e.state = "spot";
  else if (e.aw >= .35) e.state = "sus";
  else e.state = "idle";
  if (e.state === "spot" && prev !== "spot") { sfx.spot(); setMsg(`${t.label}: „${pick(t.barks)}“`, 2.5, true); emote(e, FANS.includes(e.type) ? pick(["😍", "🙋", "🤩"]) : pick(["❗", "😠", "☝️"])); (run.spotted || (run.spotted = new Set())).add(run.idx); }
  if (e.state === "sus" && prev === "idle") { sfx.sus(); emote(e, pick(["❓", "🤨", "👀"])); }
  if (e.state !== prev || !e.person.expr) setExpression(e.person, exprFor(e));
  if (d < .72 && player.inv <= 0 && !player.hidden && !playerSafe() && player.busy <= 0 && (e.state === "spot" || e.state === "sus")) { hostileDialog(e); return; }
  if (t.ghost) {
    if (e.state === "spot") { chase(e, t, dx, dy, d, dt, t.approach * (blackout > 0 ? 1.5 : 1)); if (Math.random() < dt * .4) sfx.whisper(); }
    else patrol(e, t, dt);
    return;
  }
  if (e.investigate && e.state !== "spot") {
    const iv = e.investigate; iv.t -= dt;
    if (iv.t <= 0 || Math.hypot(e.x - iv.x, e.y - iv.y) < .7) { e.pause = 1.5; delete e.investigate; }
    else { walkTo(e, Math.floor(iv.x), Math.floor(iv.y), t.walk * 1.5, dt); return; }
  }
  if (e.state === "sus") { e.tyaw = Math.atan2(dx, dy); return; }
  if (e.state === "spot") { chase(e, t, dx, dy, d, dt, t.approach * (settings.diff === "easy" ? .85 : 1)); return; }
  if (e.state === "lured") { walkTo(e, lure.x, lure.y, t.approach * 1.2, dt); return; }
  if (e.state === "nerd" && nerdLure) { if (Math.hypot(e.x - nerdLure.x, e.y - nerdLure.y) > .8) walkTo(e, Math.floor(nerdLure.x), Math.floor(nerdLure.y), t.approach, dt); return; }
  if (e.hunter) {
    // a declined caller searches for a while, but a safe room or a long hide makes them give up
    if (e.huntT != null && (e.huntT -= dt * (playerSafe() || player.hidden ? 4 : 1)) <= 0) { e.hunter = false; e.label.material.map = labelFor(t); e.label.material.needsUpdate = true; emote(e, "🤷"); }
    else { walkTo(e, Math.floor(player.x), Math.floor(player.y), t.walk * 1.1, dt); return; }
  }
  patrol(e, t, dt);
}
function updateHorde(dt) {
  if (!LEVELS[run.idx].horde || !level.spawns.length) return;
  level.spawnT -= dt;
  const active = level.enemies.filter(e => e.type === "Z" && !e.done).length;
  if (level.spawnT <= 0 && active < (settings.diff === "easy" ? 3 : 5)) {
    level.spawnT = 14 + Math.random() * 8;
    const sp = pick(level.spawns);
    if (Math.hypot(sp[0] + .5 - player.x, sp[1] + .5 - player.y) > 7) spawnEnemy(level, "Z", sp[0] + .5, sp[1] + .5);
  }
}
function updateTransports(dt) {
  for (const tr of level.transports) {
    const nx = tr.x + tr.dir[0] * tr.speed * dt, ny = tr.y + tr.dir[1] * tr.speed * dt;
    if (blockedAt(nx + tr.dir[0] * .9, ny + tr.dir[1] * .9)) tr.dir = [-tr.dir[0], -tr.dir[1]]; else { tr.x = nx; tr.y = ny; }
    if (Math.hypot(player.x - tr.x, player.y - tr.y) < .7 && player.inv <= 0) {
      player.inv = 2; flash(); sfx.car();
      const kx = tr.dir[0] || Math.sign(player.x - tr.x) || 1, ky = tr.dir[1] || Math.sign(player.y - tr.y) || 1;
      for (let i = 0; i < 6; i++) { stepAxis(kx * .12, 0); stepAxis(0, ky * .12); }
      player.stun = .6;
      showToast("🚗", "#d4af37", "Parkhaus", pick(["Der Chef setzt zurück. Er hat dich nicht gesehen. Er sieht nie jemanden.", "Hupen! „Das ist MEIN Parkplatz!“ Es ist nicht seiner."]), pen({ nerves: 1, energy: 15 }));
      updateHud(); checkDeath();
    }
  }
}
function updateHazards(dt) {
  for (const h of level.hazards) {
    h.cd = Math.max(0, h.cd - dt);
    const d = Math.hypot(player.x - h.x, player.y - h.y);
    if (h.kind === "z") {
      h.active = ((level.t + h.phase) % 3) < 1.25;
      if (h.active && d < .5 && h.cd <= 0 && player.inv <= 0) { h.cd = 1.5; player.stun = .7; flash("zap"); sfx.zap(); showToast("⚡", "#9fd8ff", "Stromschlag", "Kaputtes Kabel. Deine Haare stehen. Dein EKG auch.", pen({ energy: 20 })); makeNoise(5, .4); updateHud(); }
    } else if (h.kind === "o" && d < .55 && h.cd <= 0 && player.slip <= 0) {
      const [f] = moveInput();
      if (Math.abs(f) > .6 && !player.sneak) { const fx = -Math.sin(player.yaw), fy = -Math.cos(player.yaw), sg = Math.sign(f); h.cd = 2.5; player.slip = .7; player.slipDir = [fx * sg, fy * sg]; sfx.slip(); setMsg("Rutschgefahr! Schleichen wäre klüger gewesen.", 2.5, true); run.energy = Math.max(0, run.energy - 5); makeNoise(4, .3); }
    }
  }
  if (level.mrt) {
    const [mx, my] = level.mrt, d = Math.hypot(player.x - mx, player.y - my), metal = hasItem("2") || hasItem("8");
    if (d < 2.4 && metal) {
      const k = (2.4 - d) * 1.2 * dt; stepAxis((mx - player.x) / d * k, 0); stepAxis(0, (my - player.y) / d * k);
      if (msg.text.indexOf("MRT") < 0) setMsg("Das MRT zieht an deinem Metall! Weg hier!", 2, true);
      if (d < 1.35) { const lost = hasItem("2") ? "2" : "8"; takeItem(lost); flash(); sfx.slam(); showToast("🧲", "#7a0f0f", "MRT · 3 Tesla", `${ITEMS[lost].name} fliegt ins MRT. Es klebt jetzt da. Für immer. Die Radiologie berechnet 40.000 € Stillstand.`, pen({ energy: 10, tasks: ["MRT-Stillstand erklären (40.000 €)"] })); updateHud(); }
    }
  }
}
function pickupItem(it) {
  it.taken = true; it.mesh.visible = false; sfx.pick();
  const def = ITEMS[it.kind]; run.picked.add(it.kind);
  if (def.mission) { run.flags.add(def.mission); showToast(def.emoji, "#f2b33d", def.name, it.kind === "&" ? "„…war stets bemüht…“ Hm. Reicht für die Industrie." : "Eingepackt.", [good("In der Tasche")]); }
  else { addItem(it.kind); showToast(def.emoji, "#f3f8f1", def.name, def.desc + ". Unten im Inventar antippen.", [good("Eingepackt")]); }
  updateHud();
}
function pickupPaper(p) {
  p.taken = true; p.mesh.visible = false; run.papers++; sfx.paper();
  const room = (LEVELS[run.idx].room || 0) + "." + String(1 + Math.floor(Math.random() * 24)).padStart(2, "0"), lab = $("lab");
  if (Math.random() < .35) {
    const pts = []; let v = 37; for (let i = 0; i < 14; i++) { v = Math.max(36.2, Math.min(40.5, v + (Math.random() - .35) * 1.1)); pts.push(v); }
    const poly = pts.map((t, i) => `${10 + i * 22},${(90 - (t - 36) * 18).toFixed(1)}`).join(" ");
    lab.innerHTML = `<h3>Kurve · Zi. ${room} · Hr. K., 74 J.</h3><svg viewBox="0 0 310 100" role="img" aria-label="Fieberkurve"><rect width="310" height="100" fill="#fff"/>${[37, 38, 39, 40].map(t => `<line x1="0" x2="310" y1="${90 - (t - 36) * 18}" y2="${90 - (t - 36) * 18}" stroke="#dde"/>`).join("")}<line x1="0" x2="310" y1="54" y2="54" stroke="#c0322a" stroke-dasharray="4 3"/><polyline points="${poly}" fill="none" stroke="#2d3f8f" stroke-width="2.5"/><text x="270" y="51" font-size="10" fill="#c0322a">38,0</text></svg><div class="foot">Fieber seit drei Tagen. Niemand hat's gesehen. Jetzt du. +1 Aufgabe</div>`;
    addTask(`Fieberkurve Zi. ${room} anschauen`);
  } else {
    const rows = LAB_POOL.slice().sort(() => Math.random() - .5).slice(0, 5);
    lab.innerHTML = `<h3>Laborbefund · Zi. ${room} · Eilt!</h3><table>${rows.map(r => `<tr><td>${r[0]}</td><td class="v">${r[1]}</td><td>${r[2]}</td><td class="f">${r[3]}</td></tr>`).join("")}</table><div class="foot">Du bist drübergestolpert. Jetzt ist es dein Problem. +1 Aufgabe</div>`;
    addTask(`Laborwerte Zi. ${room} nachverfolgen`);
  }
  lab.hidden = false; lab.classList.remove("pop"); void lab.offsetWidth; lab.classList.add("pop"); labT = 4;
  setMsg("Laborzettel aufgehoben. Reflex. Fehler.", 2.5, true); updateHud();
}

// ---------- calls ----------
// what accepting or declining a call actually does, printed on the buttons
function callHints(def) {
  const a = def.acc || {}, A = [];
  if (def.onAccept) return ["Auftrag übernehmen · Zeit läuft", "Ruhe · evtl. −1 Nerv"];
  if (a.mins) A.push(`+${a.mins} Min`); if (a.energy) A.push(`+${a.energy} Energie`); if (a.nerves > 0) A.push("+1 Nerv"); if (a.nerves < 0) A.push("−1 Nerv"); if (a.duties) A.push(`+${a.duties} Dienst`); if (def.hunt) A.push(`${DEPT_NAME[def.hunt]} lässt dich 1× ziehen`);
  return [A.join(" · ") || "nichts", def.hunt ? `${DEPT_HUNT[def.hunt]} kommt dich suchen` : "keine Folgen"];
}
function startCall(def) {
  call = { def, t: 0, loud: false };
  $("callFrom").textContent = def.from; $("callSub").textContent = def.sub + " · ruft an…"; $("callAvatar").textContent = def.av; $("callText").textContent = def.text;
  const [ha, hd] = callHints(def); $("btnAccept").innerHTML = `Annehmen<small>${esc(ha)}</small>`; $("btnDecline").innerHTML = `Ablehnen<small>${esc(hd)}</small>`;
  const el = $("call"); el.hidden = false; el.classList.add("ring"); el.classList.remove("loud", "offer");
  sfx.ring();
}
function endCall() { call = null; const el = $("call"); el.hidden = true; el.classList.remove("ring", "loud", "offer"); if (run) run.nextCall = 45 + Math.random() * 30; }
function applyEffect(eff, title, av) {
  let st = [];
  if (eff.mins) { run.minutes += eff.mins; st.push({ text: "+" + eff.mins + " Min" }); }
  if (eff.task) st = st.concat(pen({ tasks: [eff.task] }));
  if (eff.duties) st = st.concat(pen({ duties: eff.duties }));
  if (eff.nerves > 0 || eff.energy) st = st.concat(gain({ nerves: Math.max(0, eff.nerves || 0), energy: eff.energy }));
  if (eff.nerves < 0) st = st.concat(pen({ nerves: -eff.nerves }));
  if (!st.length) st.push(good("Aufgelegt"));
  showToast(av, "#e6ece9", title, eff.note || eff.task || "Aufgelegt.", st);
  updateHud(); checkDeath();
}
function acceptCall() {
  if (!call) return; const c = call.def;
  if (c.onAccept) { call = null; endCall(); c.onAccept(); return; } run.callsAcc++; endCall(); applyEffect(c.acc, c.from + " · angenommen", c.av);
  if (c.hunt) run.goodwill[c.hunt] = (run.goodwill[c.hunt] || 0) + 1;
}
/* declining (or ignoring) a call: whoever called now comes looking for you */
function missCall(c, verb) {
  run.callsDec++; endCall();
  if (!c.hunt || LEVELS[run.idx].safe || LEVELS[run.idx].final || run.mode !== "mission") { showToast(c.av, "#e6ece9", c.from + " · " + verb, (c.dec && c.dec.note) || "Aufgelegt. Erstaunlich folgenlos.", [good("Zeit gespart")]); updateHud(); return; }
  showToast(c.av, "#e2483d", c.from + " · " + verb, `${DEPT_HUNT[c.hunt]} lässt das nicht auf sich sitzen und kommt dich suchen. Versteck dich oder lauf.`, [{ text: "Gesucht" }]);
  setTimeout(() => {
    if (!run || mode !== "play" || !level) return;
    const h = spawnFar(c.hunt); if (!h) return;
    h.hunter = true; h.aw = .6; h.huntT = 50;
    h.label.material.map = labelTex("SUCHT DICH · " + (TYPES[c.hunt].label.split(" ")[0]), "#c0322a", "#fff"); h.label.material.needsUpdate = true;
    setMsg(`${DEPT_HUNT[c.hunt]} sucht dich. Rotes Schild über dem Kopf.`, 3.5, true);
  }, 3500);
  updateHud();
}
function declineCall() { if (!call) return; const c = call.def; if (c.onDecline) { endCall(); c.onDecline(); return; } missCall(c, "abgelehnt"); }
$("btnAccept").addEventListener("click", acceptCall); $("btnDecline").addEventListener("click", declineCall);
function updateCalls(dt) {
  if (call && call.def.onAccept) { call.t += dt; if (call.t > 20) acceptCall(); return; } // pager jobs: silence counts as yes
  if (LEVELS[run.idx].safe || run.mode === "night" || isLastFloor()) return;
  if (call) {
    call.t += dt;
    if (call.t > 9 && !call.loud) { call.loud = true; $("call").classList.add("loud"); player.hidden = false; setMsg("Das Handy klingelt LAUT. Alle in der Nähe horchen auf.", 2.5, true); }
    if (call.loud && Math.floor(call.t * 2) !== Math.floor((call.t - dt) * 2)) { sfx.ring(); makeNoise(6, .25); }
    if (call.t > 18) { missCall(call.def, "verpasst"); }
  } else if (player.airplane <= 0) {
    run.nextCall -= dt;
    if (run.nextCall <= 0) startCall(pick(CALLS));
  }
}

// ---------- REA ----------
function clearRea() { if (run && run.rea && run.rea.mesh && level) level.group.remove(run.rea.mesh); if (run) run.rea = null; reaLight.intensity = 0; }
function startRea(x, y, timeout, mandatory) {
  const g = new THREE.Group();
  const p = makePerson({ skin: rnd(SKIN), hair: rnd(HAIR), hairStyle: "short", gown: true, shirt: 0x9cc6e6, noShadow: true });
  p.group.rotation.x = -Math.PI / 2; p.group.position.set(0, .15, .9); g.add(p.group);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xff3020, transparent: true, opacity: .25, depthWrite: false }); level.perMat.push(beamMat);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, WALL_H, 16, 1, true), beamMat); level.perGeo.push(beam.geometry); beam.position.y = WALL_H / 2; g.add(beam);
  g.add(at(sprite(labelTex("REA! KEIN PULS", "#e2483d", "#fff"), 1.5, .26), 0, 1.8, 0));
  g.position.set((x + .5) * S, 0, (y + .5) * S); level.group.add(g);
  run.rea = { x, y, t: timeout, mandatory, mesh: g, beam, done: false };
  reaLight.position.set((x + .5) * S, 2, (y + .5) * S);
  sfx.alarm(); naviT = 0;
  setMsg("REA-ALARM! Patient ohne Puls. Folge dem Wegpunkt.", 4, true);
  showToast("🚨", "#e2483d", "Reanimationsalarm", mandatory ? "Im CT. Du bist der nächste Arzt. Das Notfallteam wurde 2021 eingespart. Lauf!" : "Patient kollabiert. Du hast " + Math.round(timeout) + " Sekunden.", [{ text: "Leben retten" }]);
}
function randomReaTile() {
  const dm = distMap(Math.floor(player.x), Math.floor(player.y), playerPass), c = [];
  for (let i = 0; i < dm.length; i++) if (dm[i] >= 5 && dm[i] <= 11 && grid[(i / GW) | 0][i % GW] === ".") c.push(i);
  if (!c.length) return null; const i = pick(c); return [i % GW, (i / GW) | 0];
}
let cpr = null;
function startCpr() {
  mode = "cpr"; clearInputs(); $("prompt").hidden = true; $("toast").hidden = true; toastT = 0;
  cpr = { t0: performance.now(), presses: 0, score: 0, total: 16, period: 60000 / 110 };
  $("cpr").hidden = false; $("cprInfo").textContent = "0 / 16"; $("cprJudge").textContent = "Los!";
  setTimeout(() => $("cprBtn").focus({ preventScroll: true }), 30);
}
function cprPress() {
  if (!cpr) return;
  const ph = (performance.now() - cpr.t0) % cpr.period, err = Math.min(ph, cpr.period - ph);
  cpr.presses++; sfx.cpr();
  let j; if (err < 120) { cpr.score += 1; j = "Perfekt"; } else if (err < 200) { cpr.score += .5; j = "Okay"; } else j = "Daneben";
  $("cprJudge").textContent = j; $("cprInfo").textContent = cpr.presses + " / " + cpr.total;
  if (cpr.presses >= cpr.total) finishCpr();
}
$("cprBtn").addEventListener("pointerdown", e => { e.preventDefault(); cprPress(); });
function finishCpr() {
  const ok = cpr.score >= (settings.diff === "easy" ? 8 : 10); cpr = null; $("cpr").hidden = true; mode = "play";
  if (LEVELS[run.idx].reaScript) run.flags.add("rea3");
  clearRea(); naviT = 0;
  if (ok) { run.lives++; showToast("💓", "#1f9d55", "ROSC!", "Puls ist zurück. Der Patient fragt als Erstes, wann er heim darf.", gain({ nerves: 1, energy: 15, text: "Leben gerettet" }).concat(pen({ mins: 10 }))); }
  else { run.reaFail = true; showToast("🫀", "#e2483d", "Das REA-Team übernimmt", "Du hast es versucht. Der Rhythmus war eher Techno als Bee Gees.", pen({ mins: 10 })); }
  updateHud();
}

// ---------- scares & storm ----------
function updateScares(dt) {
  scareCd -= dt;
  if (scare) {
    scare.t -= dt;
    const d = Math.hypot(scare.x - player.x, scare.y - player.y);
    if (scare.t <= 0 || d < 2.6) { level.group.remove(scare.mesh); scare = null; sfx.whisper(); if (d < 2.6) setMsg(pick(["… war da gerade jemand?", "Weg. Einfach weg.", "Das war bestimmt nur der Hausmeister. Bestimmt."]), 2.5, true); }
    return;
  }
  if (scareCd > 0 || !(inDarkness() || cellarDark())) return;
  scareCd = 22 + Math.random() * 20;
  const fx = -Math.sin(player.yaw), fy = -Math.cos(player.yaw);
  for (let dist = 6; dist >= 3.5; dist -= .5) {
    const x = player.x + fx * dist, y = player.y + fy * dist;
    if (cell(Math.floor(x), Math.floor(y)) === "." && los(player.x, player.y, x, y)) {
      const p = makePerson({ shadowFig: true, glowEyes: true, hairStyle: "messy", coat: true, scale: 1.08, noShadow: true });
      p.group.position.set((Math.floor(x) + .5) * S, 0, (Math.floor(y) + .5) * S); p.group.rotation.y = Math.atan2(player.x - x, player.y - y);
      level.group.add(p.group); scare = { mesh: p.group, x: Math.floor(x) + .5, y: Math.floor(y) + .5, t: 2.2 }; sfx.stinger();
      break;
    }
  }
}
function updateStorm(dt) {
  if (!currentEnv().storm || !level.windows.length) return;
  if (boltT > 0) { boltT -= dt; if (boltT <= 0 && !level.bolt2) { level.bolt2 = true; boltT = .08; } return; }
  nextBolt -= dt;
  if (nextBolt <= 0) {
    nextBolt = 25 + Math.random() * 30; boltT = .12; level.bolt2 = false;
    const near = level.windows.some(w => Math.hypot(w.position.x / S - player.x, w.position.z / S - player.y) < 6);
    if (near) flash("bolt");
    setTimeout(() => sfx.thunder(), 700 + Math.random() * 900);
  }
}

// ---------- main update ----------
function update(dt) {
  level.t += dt; run.minutes += dt * (run.mode === "night" ? 1.25 : CLOCK * (settings.diff === "easy" ? .8 : 1));
  player.inv = Math.max(0, player.inv - dt); player.coffee = Math.max(0, player.coffee - dt);
  if (run.pageT != null) { run.pageT -= dt; if (run.pageT <= 0) pageAnnounce(); }
  if (level.fireT > 0) { const b = Math.floor(level.fireT / 2.2); level.fireT -= dt; if (Math.floor(level.fireT / 2.2) !== b && level.fireT > 0) sfx.alarm(); }
  player.phoneT = Math.max(0, (player.phoneT || 0) - dt); player.busy = Math.max(0, player.busy - dt); player.airplane = Math.max(0, player.airplane - dt);
  updateStink(dt); updateEmotes(dt); updateScenarios(dt); missionTick(dt);
  if (lure) { lure.t -= dt; if (lure.t <= 0) lure = null; }
  if (nerdLure) { nerdLure.t -= dt; if (nerdLure.t <= 0) { if (nerdLure.mesh) level.group.remove(nerdLure.mesh); nerdLure = null; for (const e of level.enemies) if (e.state === "nerd") e.state = "idle"; } }
  updatePlayer(dt);
  for (const p of level.papers) if (!p.taken && Math.hypot(player.x - p.x, player.y - p.y) < .24) pickupPaper(p);
  updateHazards(dt); updateTransports(dt);
  if (mode !== "play") return;
  if (run.mode === "night") { updateNight(dt); if (mode !== "play") return; }
  updateHorde(dt);
  for (const e of level.enemies) { updateEnemy(e, dt); if (mode !== "play") return; }
  updateCalls(dt);
  const L = LEVELS[run.idx];
  if (run.reaScriptT != null) { run.reaScriptT -= dt; if (run.reaScriptT <= 0) { run.reaScriptT = null; startRea(level.reaSpot[0], level.reaSpot[1], 999, true); } }
  if (run.reaRandomT != null) { run.reaRandomT -= dt; if (run.reaRandomT <= 0) { run.reaRandomT = null; const t = randomReaTile(); if (t) startRea(t[0], t[1], 50, false); } }
  if (run.rea && !run.rea.mandatory) { run.rea.t -= dt; if (run.rea.t <= 0) { clearRea(); run.reaFail = true; showToast("🫀", "#7b8a85", "Zu spät", "Jemand anderes war schneller. Trotzdem: schlechtes Gewissen.", pen({ nerves: 1 })); updateHud(); checkDeath(); } }
  if ((L.blackouts || run.nightBlackouts) && !run.flags.has("power")) {
    if (blackout > 0) { blackout -= dt; if (blackout <= 0) setMsg("Licht ist wieder da. Sowas wie Licht.", 2); }
    else { run.nextBlackout -= dt; if (run.nextBlackout <= 0) { blackout = 5; run.nextBlackout = 22 + Math.random() * 12; sfx.powerDown(); setMsg("Stromausfall.", 3, true); } }
    if (Math.random() < dt * .07) (Math.random() < .5 ? sfx.creak : sfx.slam)();
  } else if (blackout > 0) blackout -= dt;
  const inDark = level.dark[Math.floor(player.y) * GW + Math.floor(player.x)] && !currentEnv().dark;
  zoneMsgT -= dt;
  if (inDark && !run.wasDark) { sfx.stinger(); if (zoneMsgT <= 0) { setMsg(pick(["Hier hat das Controlling die Beleuchtung gestrichen.", "Dieser Gang ist seit dem Sparprogramm 2019 unbeleuchtet.", "Irgendwo tropft etwas. Hoffentlich Wasser.", "Stromsparmodus. Patientenorientiert."]), 3, true); zoneMsgT = 8; } }
  run.wasDark = inDark;
  updateScares(dt); updateStorm(dt);
  applyEnv();
  if (mode !== "play") return;
  if (level.exit && exitOpen() && Math.floor(player.x) === level.exit[0] && Math.floor(player.y) === level.exit[1]) { nextFloor(); return; }
  updateNavi(dt);
  level.objT = (level.objT || 0) - dt; if (level.objT <= 0) { level.objT = .4; trackObjectives(); updateMissionHow(currentObjective()); updateRouteClock(); updateRouteChip(); }
  // ghosts announce themselves: cold screen edges, whispers, a shimmering aura
  { let gd = 99; for (const e of level.enemies) if (!e.gone && TYPES[e.type].ghost) { gd = Math.min(gd, Math.hypot(e.x - player.x, e.y - player.y)); if (e.aura) e.aura.material.opacity = .35 + Math.sin(level.t * 3 + e.x) * .15; if (e.ghostLight) e.ghostLight.intensity = .9 + Math.sin(level.t * 7) * .25; }
    $("frostFx").style.opacity = gd < 7 ? Math.min(1, (7 - gd) / 5).toFixed(2) : 0;
    if (gd < 6 && (level.whisperT = (level.whisperT || 0) - dt) <= 0) { level.whisperT = 2.5 + gd; sfx.whisper(); if (gd < 4) setMsg(pick(["Es wird kalt…", "Jemand atmet hinter dir.", "„Bleib doch…“"]), 1.6, true); } }
  level.buffT = (level.buffT || 0) - dt; if (level.buffT <= 0) { level.buffT = .2; updateBuffs(); }
  focus = findFocus();
  const ab = $("btnAct");
  if (player.channel) { $("actLabel").textContent = player.channel.label; $("actProg").style.height = (player.channel.t / player.channel.total * 100) + "%"; ab.classList.add("ready"); }
  else { $("actProg").style.height = "0"; $("actLabel").textContent = focus ? focus.label : "Aktion"; ab.classList.toggle("ready", !!focus); }
  const pr = $("prompt");
  if (focus && !player.channel) { pr.hidden = false; pr.innerHTML = `<b>${esc(focus.label)}</b> · ${esc(focus.name)}`; } else pr.hidden = true;
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $("toast").hidden = true; }
  if (labT > 0) { labT -= dt; if (labT <= 0) $("lab").hidden = true; }
  if (msg.t > 0) { msg.t -= dt; if (msg.t <= 0) setMsg(statusLine(), 0); } else { const s = statusLine(); if (s !== msg.text) setMsg(s, 0); }
  $("hudClock").textContent = fmtTime(run.minutes);
  const bt = buffText(), chip = $("chipBuff"); if (chip.textContent !== bt) chip.textContent = bt; chip.hidden = !bt;
  $("hideVeil").hidden = !player.hidden; $("tired").hidden = run.energy > 0;
  // stealth indicator
  let maxAw = 0; for (const e of level.enemies) if (!e.done && !e.static && !(e.type === "J" && Math.hypot(e.x - player.x, e.y - player.y) > 6)) maxAw = Math.max(maxAw, e.type === "J" ? .5 : e.state === "spot" ? 1 : e.aw);
  const sc = $("chipStealth"), safe = playerSafe() || player.hidden;
  sc.textContent = safe ? "SICHER" : maxAw >= 1 ? "ENTDECKT" : maxAw >= .35 ? "VERDACHT" : (player.moveMag === .5 ? "SCHLEICHT" : "UNBEMERKT");
  sc.className = "chip " + (safe ? "good" : maxAw >= 1 ? "bad" : maxAw >= .35 ? "warn" : "good");
  const edge = $("edge"); edge.style.opacity = safe ? 0 : Math.min(1, maxAw); edge.style.setProperty("--edge", maxAw >= 1 ? "rgba(226,72,61,.75)" : "rgba(242,179,61,.6)");
  updateEnergy();
}
function statusLine() {
  if (player.hidden) return "Im Wäschewagen. Nicht bewegen.";
  if (playerSafe()) return "Sicherer Raum. Hier kommt niemand rein.";
  if (run.rea && !run.rea.done) return "REA-ALARM! Folge dem Wegpunkt.";
  if (lure) return "Alle sind in der Cafeteria. Jetzt!";
  if (call) return "Handy klingelt: " + call.def.from;
  if (run.energy <= 0) return "Erschöpft. Du schleichst nur noch. Kaffee!";
  if (inDarkness() && player.lampOn && player.lamp <= 0) return "Taschenlampe leer. Batterie suchen!";
  const c = currentObjective();
  return c ? "Ziel: " + c.text : "Zum Auto!";
}
// gastro: standing in the stink fog costs energy, and every few seconds a nerve
function updateStink(dt) {
  const on = !!(level.stinkSet && !run.flags.has("vent") && !player.hidden && level.stinkSet.has(Math.floor(player.x) + "," + Math.floor(player.y)));
  $("stinkFx").style.opacity = on ? 1 : 0;
  if (!on) { run.stinkT = Math.max(0, (run.stinkT || 0) - dt); return; }
  run.energy = Math.max(0, run.energy - dt * 1.4); run.stinkT = (run.stinkT || 0) + dt;
  if (run.stinkT > 9) { run.stinkT = 0; flash(); showToast("🤢", "#7a9a3a", "Stink-Alarm", pick(["Du atmest aus Versehen ein. Fehler.", "Dein Kittel riecht jetzt auch so. Für immer.", "Irgendwo hat jemand „nur kurz“ gelüftet. 2017.", "Die Augen tränen. Die Nase kündigt."]), pen({ nerves: 1 })); updateHud(); checkDeath(); }
  else if (Math.random() < dt * .25) setMsg(pick(["*hust*", "Bäh.", "Nicht durch die Nase atmen!", "Wer war das?!"]), 1.4);
}
function checkDeath() {
  if (run.nerves > 0 || ["dying", "over", "win", "dialog"].includes(mode)) return;
  mode = "dying"; endCall(); clearInputs(); setTimeout(showGameOver, 1200);
}

// ---------- tricks ----------
function throwPen() {
  const fx = -Math.sin(player.yaw), fy = -Math.cos(player.yaw);
  let x = player.x, y = player.y;
  for (let i = 0; i < 40; i++) { const nx = x + fx * .15, ny = y + fy * .15; if (blockedAt(nx, ny)) break; x = nx; y = ny; }
  const pen = new THREE.Group(); pen.add(at(mesh(GEO.cyl, lambert(0x2b7bb9), .008, .14, .008), 0, .01, 0)); pen.children[0].rotation.z = Math.PI / 2; pen.position.set(x * S, .01, y * S); pen.rotation.y = Math.random() * 6;
  level.group.add(pen); setTimeout(() => level && level.group.remove(pen), 8000);
  tone(2600, .25, .03, "square", .05); tone(2100, .32, .03, "square", .04);
  let n = 0;
  for (const e of level.enemies) if (!e.static && !e.done && !e.gone && !TYPES[e.type].ghost && Math.hypot(e.x - x, e.y - y) < 5.5 && e.state !== "spot") { e.investigate = { x, y, t: 6 }; e.tyaw = Math.atan2(x - e.x, y - e.y); n++; }
  return n;
}
function toggleCoat() {
  player.civil = !player.civil;
  if (fpHand.children[0]) fpHand.children[0].material = lambert(player.civil ? 0x5a6a7a : 0xf4f4f0);
  sfx.tick(); updateHud();
}
function pageAnnounce() {
  run.pageT = null; if (!run.callbacks.length) return;
  tone(660, 0, .35, "sine", .06); tone(523, .4, .5, "sine", .06);
  showToast("📢", "#c0322a", "Durchsage im ganzen Haus", `„Die Ärztin oder der Arzt vom Dienst, bitte SOFORT ${run.callbacks[0]} zurückrufen!“ Jetzt weiß jeder: Du bist noch im Haus. Ein Oberarzt sucht dich.`, [{ text: "Gesucht" }]);
  for (const e of level.enemies) if (!e.static && !e.done) e.aw = Math.max(e.aw, .3);
  if (!LEVELS[run.idx].safe && !LEVELS[run.idx].final) {
    const [fx, fy] = farthestTile(); const h = spawnEnemy(level, "O", fx + .5, fy + .5); h.hunter = true;
    h.label.material.map = labelTex("SUCHT DICH", "#c0322a", "#fff"); h.label.material.needsUpdate = true;
  }
  setMsg("Du wirst ausgerufen. Ein Oberarzt sucht dich.", 4, true);
}
function workCallbacks() {
  const n = run.callbacks.length; if (!n) return;
  for (const from of run.callbacks) { const c = CALLS.find(c => c.from === from); if (c && c.dept) run.goodwill[c.dept] = (run.goodwill[c.dept] || 0) + 1; }
  run.callbacks = []; run.minutes += n * 3;
  showToast("☎️", "#1f9d55", "Rückrufe erledigt", `${n} Rückruf${n > 1 ? "e" : ""} abgearbeitet. ${n * 3} Minuten weg, dafür ist man dir jetzt wohlgesonnen.`, pen({}).concat([{ text: "+" + n * 3 + " Min" }, good("Goodwill")]));
  updateHud();
}
function fireAlarmDialog(p) {
  if (p.used) { showToast("🔥", "#c0322a", "Feuermelder", "Schon gezogen. Die Feuerwehr kennt dich jetzt beim Vornamen.", []); return; }
  openDialog({ av: "🔥", color: "#c0322a", name: "Feuermelder", role: "Nur im Notfall · Glas einschlagen", text: "Ein roter Kasten. „Nur im Brandfall.“ Darunter jemand mit Kuli: „oder bei Feierabend“. Wenn du ziehst, evakuieren alle für 20 Sekunden. Danach gibt es sehr viel Papierkram.",
    options: [
      opt("Ziehen", () => { p.used = true; const [x, y] = farthestTile(); lure = { x, y, t: 20 }; level.fireT = 20; sfx.alarm(); setTimeout(() => sfx.alarm(), 2100); flash("zap"); return say("RRRRING! Alle rennen zur Sammelstelle. Durch die Lautsprecher: „Bitte bewahren Sie Ruhe und vergessen Sie nicht, Ihre Überstunden einzutragen.“", pen({ mins: 15, tasks: ["Brandschutzbericht (3-fach)", "Gespräch mit der Feuerwehr"] }).concat([good("20 s freie Bahn")])); }, "+15 Min · 2 Aufgaben"),
      opt("Lieber nicht", () => say("Vernünftig. Langweilig, aber vernünftig."))] });
}

// ---------- night shift (survival) ----------
function spawnFar(type) {
  const dm = distMap(Math.floor(player.x), Math.floor(player.y), playerPass); let best = -1, bi = -1;
  for (let i = 0; i < dm.length; i++) { const x = i % GW, y = (i / GW) | 0; if (dm[i] > best && grid[y][x] === "." && level.zone[i] === 1) { best = dm[i]; bi = i; } }
  if (bi < 0) return null;
  const e = spawnEnemy(level, type, bi % GW + .5, ((bi / GW) | 0) + .5); return e;
}
function nightHour(h) {
  const [time, title, text] = NIGHT_HOURS[h];
  missionCard(time, title, text); if (h >= 2) sfx.stinger();
  if (h === 1) { spawnFar("Q"); spawnFar("Q"); }
  if (h === 2) spawnFar("g");
  if (h === 3) { const e = spawnFar("J"); if (e) { e.tri.material = TRI_MAT.spot; level.hilde = e; } }
  if (h === 4) { run.nightBlackouts = true; run.nextBlackout = 8; }
  if (h === 5) spawnFar("F");
  if (h === 6) run.zT = 4;
  if (h === 7) spawnFar("C");
  if (h === 8) { level.hildeFast = true; spawnFar("Q"); }
}
function newTask() {
  const doors = level.doors.filter(d => !d.safe && d.num); if (!doors.length) return;
  const d = pick(doors), inner = DIRS.map(([dx, dy]) => [d.x + dx, d.y + dy]).find(([x, y]) => level.zone[y * GW + x] === 2 && !solidMove(cell(x, y)));
  if (!inner) { run.taskT = 3; return; }
  if (run.hour >= 1 && !run.rea && Math.random() < .15) { startRea(inner[0], inner[1], 60, false); run.taskT = 30; return; }
  // the pager asks first: you may accept the job or palm it off (with consequences)
  const t = { x: inner[0], y: inner[1], room: d.num, text: pick(NIGHT_TASKS) };
  run.taskT = 9999; sfx.beep(); setTimeout(() => sfx.beep(), 220); setTimeout(() => sfx.beep(), 440);
  startCall({ from: "Pager · Zi. " + t.room, sub: "Station 5B", av: "📟", text: t.text + ". 72 Minuten.",
    onAccept: () => { run.task = Object.assign(t, { deadline: run.minutes + 72 }); naviT = 0; showToast("📟", "#a6e38f", "Übernommen · Zi. " + t.room, t.text + ". Du hast 72 Minuten.", []); updateHud(); },
    onDecline: () => {
      run.taskT = 20 + Math.random() * 15; run.nightDeclined = (run.nightDeclined || 0) + 1;
      if (Math.random() < .55) showToast("🙅", "#a6e38f", "Abgelehnt", pick(["Schwester Ayşe übernimmt. Ihr Seufzer kommt durch den Pager. In HD.", "Der Pager schweigt beleidigt. Zi. " + t.room + " klingelt jetzt bei der Notaufnahme.", "Du tippst „Bin in REA“. Du bist auf dem Sofa. Niemand prüft das. Noch."]), [good("Ruhe")]);
      else showToast("🙅", "#e2483d", "Abgelehnt", pick(["Zi. " + t.room + " klingelt jetzt alle 30 Sekunden. Bis 7 Uhr.", "Die Stationsleitung notiert: „Arzt nicht erreichbar.“ Mit Datum. Und Uhrzeit. Und Smiley.", "Hildegard hat es gehört. Sie lächelt. Das ist schlimmer."]), pen({ nerves: 1 }));
      updateHud(); checkDeath();
    } });
}
function completeTask() {
  run.nightDone++; run.task = null; run.taskT = 8 + Math.random() * 16; sfx.ding();
  showToast("✅", "#1f9d55", "Erledigt", pick(["Es war nichts. Es ist nie etwas. Außer wenn doch.", "„Danke, Herr Doktor.“ Es ist 3 Uhr. Du bist gerührt.", "Problem gelöst. Ein neues ist schon unterwegs.", "Der Patient schläft wieder. Du nicht.", "Du schreibst es auf. Niemand wird es je lesen."]), gain({ energy: 5, text: "Aufgabe " + run.nightDone }));
  updateHud();
}
function failTask() {
  const room = run.task.room; run.nightFail++; run.task = null; run.taskT = 8 + Math.random() * 12;
  showToast("⏰", "#c0322a", "Zu spät · Zi. " + room, pick(["Zi. " + room + " hat beim Chefarzt angerufen. Privat. Um 3 Uhr.", "Die Angehörigen haben eine Google-Bewertung geschrieben. Live.", "Der Patient hat sich selbst versorgt. Mit dem Defibrillator. Er ist okay. Der Defi nicht."]), pen({ nerves: 1 }));
  updateHud(); checkDeath();
}
function nightHorror() {
  const opts = ["phone", "steps", "whisper"]; const far = level.doors.filter(d => d.open && Math.hypot(d.x - player.x, d.y - player.y) > 3 && !level.enemies.some(e => Math.floor(e.x) === d.x && Math.floor(e.y) === d.y));
  if (far.length) opts.push("slam", "slam");
  const k = pick(opts);
  if (k === "phone") { sfx.ring(); setMsg("Irgendwo klingelt ein Telefon. In einem leeren Zimmer.", 3.5, true); }
  else if (k === "steps") { for (let i = 0; i < 4; i++) setTimeout(() => sfx.step(), i * 420); setMsg("Schritte. Hinter dir. Du drehst dich um. Nichts.", 3.5, true); }
  else if (k === "whisper") { sfx.whisper(); blackout = Math.max(blackout, 1.2); setMsg("… hat da jemand deinen Namen geflüstert?", 3.5, true); }
  else { const d = pick(far); setDoor(d, false, true); sfx.slam(); setMsg("Eine Tür knallt zu. Niemand ist da.", 3.5, true); }
}
function updateNight(dt) {
  const h = Math.floor((run.minutes - NIGHT_START) / 60);
  if (run.minutes >= NIGHT_END) { nightWin(); return; }
  if (h !== run.hour && h < NIGHT_HOURS.length) { run.hour = h; nightHour(h); }
  if (run.task) { if (run.minutes > run.task.deadline) failTask(); }
  else { run.taskT -= dt * 1.25; if (run.taskT <= 0) newTask(); }
  run.horrorT -= dt; if (run.horrorT <= 0) { run.horrorT = 16 + Math.random() * 20; nightHorror(); }
  if (run.zT != null) { run.zT -= dt; if (run.zT <= 0) { run.zT = 28; if (level.enemies.filter(e => e.type === "Z" && !e.done).length < 4) spawnFar("Z"); } }
}
/* Schwester Hildegard only moves while you are not looking at her (or the lights are out) */
function updateHildegard(e, t, dt) {
  if (e.stun > 0) { e.stun -= dt; return; }
  const dx = player.x - e.x, dy = player.y - e.y, d = Math.hypot(dx, dy) || .001;
  const fx = -Math.sin(player.yaw), fy = -Math.cos(player.yaw), dot = (-dx * fx - dy * fy) / d;
  const half = Math.atan(Math.tan(camera.fov * Math.PI / 360) * camera.aspect) + .1;
  const seen = dot > Math.cos(half) && d < 16 && los(player.x, player.y, e.x, e.y) && blackout <= 0 && mode === "play";
  e.state = "spot"; e.aw = 1; e.frozen = seen;
  if (seen) { e.moving = false; if (!e.wasSeen) { e.wasSeen = true; if (d < 6) sfx.stinger(); } return; }
  e.wasSeen = false;
  if (playerSafe() || player.hidden) return;
  walkTo(e, Math.floor(player.x), Math.floor(player.y), t.approach * (level.hildeFast ? 1.35 : 1) * (settings.diff === "easy" ? .8 : 1), dt);
  e.moving = false; e.tyaw = Math.atan2(dx, dy);
  if (d < 8 && Math.random() < dt * 1.2) tone(160 + Math.random() * 40, 0, .06, "sine", .03);
  if (d < .75 && player.inv <= 0) hildegardCatch(e);
}

// ---------- active protection: what is working right now ----------
function updateBuffs() {
  const B = [];
  if (player.phoneT > 0) B.push(["📱", "Telefonat", player.phoneT / 10, true]);
  if (player.civil) B.push(["🥼", "Zivil · Personal sieht dich kaum", null, true]);
  if (player.hidden) B.push(["🙈", "Versteckt", null, true]);
  if (player.inv > 0 && mode === "play") B.push(["😌", "Atempause", player.inv / 5, true]);
  if (level.fireT > 0) B.push(["🔥", "Feueralarm · Flure leer", level.fireT / 20, true]);
  if (lure && lure.t > 0) B.push(["✏️", "Ablenkung", Math.min(1, lure.t / 8), false]);
  if (nerdLure && nerdLure.t > 0) B.push(["📄", "Nerds lesen", Math.min(1, nerdLure.t / 20), false]);
  if (player.coffee > 0) B.push(["☕", "Koffein · schneller", player.coffee / 8, false]);
  for (const [d, n] of Object.entries(run.goodwill || {})) if (n > 0 && DEPT_NAME[d]) B.push(["🤝", `${DEPT_NAME[d]} lässt dich ziehen ×${n}`, null, false]);
  $("buffs").innerHTML = B.map(([i, t, k]) => `<div class="buff"><i>${i}</i><span>${esc(t)}${k != null ? `<s style="width:${Math.round(Math.max(0, Math.min(1, k)) * 100)}%"></s>` : ""}</span></div>`).join("");
  $("shieldFx").style.opacity = B.some(b => b[3]) && mode === "play" ? 1 : 0;
}
