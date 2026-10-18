/* Hospital Escape 3D · run state, environment, objectives, navigation, HUD, inventory, audio. */
const MAX_NERVES = () => settings.diff === "easy" ? 6 : 5;
let mode = "title"; // title | story | brief | intro | play | dialog | cpr | pause | dying | over | win
let run = null;
const player = { x: 0, y: 0, yaw: 0, pitch: 0, coffee: 0, busy: 0, airplane: 0, inv: 0, hidden: false, bob: 0, stun: 0, slip: 0, slipDir: [0, 0],
  channel: null, sprint: false, sneak: false, lamp: 100, lampOn: true, moveMag: 0, noiseT: 0 };
let msg = { text: "", t: 0 };
let call = null, lure = null, nerdLure = null, toastT = 0, labT = 0, blackout = 0, lightMul = 1, ceilPower = 1, zoneMsgT = 0, boltT = 0, nextBolt = 25, scare = null, scareCd = 20;

function newRun(m = "mission", route = "stay", place = "ward") {
  run = { idx: 0, step: 0, route, nerves: MAX_NERVES(), energy: 100, minutes: 0, tasks: [], tasksTotal: 0, duties: [], callsAcc: 0, callsDec: 0, papers: 0, lives: 0, talks: 0, coauthor: 0, spa: 0, reaFail: false,
    flags: new Set(), offers: new Set(), inv: { c: 1, p: 5, f: 3, m: 2 }, goodwill: {}, callbacks: [], pageT: null, picked: new Set(), nextCall: 75 + Math.random() * 30, rea: null, reaRandomT: null, reaScriptT: null, nextBlackout: 18, wasDark: false,
    announceT: 130 + Math.random() * 40, lostMin: 0 };
  run.mode = m;
  /* there is only one meter now: energy. "Nerves" in older content are 20 % steps of it. */
  Object.defineProperty(run, "nerves", { get() { return Math.ceil(run.energy / 20); }, set(v) { run.energy = Math.max(0, Math.min(100, v * 20)); }, configurable: true });
  if (m === "mission") run.idx = ROUTES[route].floors[0];
  if (m === "night") Object.assign(run, { place, idx: LEVELS.findIndex(l => l.key === (place === "er" ? "nightER" : "night")), minutes: NIGHT_START, nightDone: 0, nightFail: 0, hour: -1, task: null, taskT: 12, horrorT: 40, hildeSeen: 0, nightBlackouts: false, zT: null });
}
const mission = () => ROUTES[run.route || "stay"];
const missionFloors = () => mission().floors;
const isLastFloor = () => run.mode === "mission" && run.step >= missionFloors().length - 1;
const nextLevel = () => LEVELS[missionFloors()[run.step + 1]];
const floorLabel = i => LEVELS[i].short.split(" · ")[1] || LEVELS[i].short;
const playerSafe = () => cell(Math.floor(player.x), Math.floor(player.y)) === "_";

function loadFloor(idx) {
  clearRea();
  const L = LEVELS[idx];
  renderer.shadowMap.enabled = !!settings.shadows; sun.castShadow = !!settings.shadows && !ENV[L.env].dark; flashlight.castShadow = !!settings.shadows && !!ENV[L.env].dark;
  buildLevel(idx);
  player.x = level.start[0] + .5; player.y = level.start[1] + .5; player.yaw = level.startYaw; player.pitch = 0;
  Object.assign(player, { coffee: 0, busy: 0, inv: 0, hidden: false, stun: 0, slip: 0, channel: null, lampOn: true });
  if (ENV[L.env].dark) player.lamp = Math.max(player.lamp, 70);
  lure = null; nerdLure = null; blackout = 0; scare = null; endCall(); run.callsHere = 0;
  run.pageT = run.callbacks.length >= 2 ? 8 : null;
  run.reaRandomT = L.reaRandom ? 45 + Math.random() * 30 : null;
  run.reaScriptT = L.reaScript || null;
  run.nextBlackout = 16 + Math.random() * 8;
  $("hudFloor").textContent = L.short;
  if (run.mode === "mission") prepareMissionFloor();
  setMsg(run.mode === "night" ? "Nachtdienst. Überlebe bis 07:30." : "Feierabend war um 17:00. Leise raus.", 0);
  if (run.mode === "night") player.lamp = 100;
  naviT = 0; applyEnv(true); updateHud(); renderInv();
}

// ---------- environment ----------
const currentEnv = () => { const L = LEVELS[run.idx]; return ENV[L.envOn && run.flags.has("power") ? L.envOn : L.env]; };
const cellarDark = () => LEVELS[run.idx].env === "cellar" && !run.flags.has("power");
const inDarkness = () => currentEnv().dark || lightMul < .6;
function applyEnv(force) {
  const env = currentEnv(), bo = blackout > 0;
  const tile = level ? level.dark[Math.floor(player.y) * GW + Math.floor(player.x)] : 0;
  const target = bo ? .06 : (tile && !env.dark ? .32 : 1);
  lightMul += (target - lightMul) * (force ? 1 : .06);
  const bolt = boltT > 0 ? .9 : 0;
  const dawn = run && run.mode === "night" ? Math.max(0, Math.min(1, (run.minutes - NIGHT_DAWN) / 60)) : 0;
  hemi.intensity = (env.hemi * .55 + dawn * .45) * lightMul + bolt * .6; amb.intensity = (env.amb * .45 + dawn * .15) * lightMul; sun.intensity = (env.dir * 2.6 + dawn * .5) * lightMul;
  scene.environment = bo || env.dark ? ENV_DARK : ENV_BRIGHT;
  ceilPower = bo ? 0 : (run && run.mode === "night" ? .3 + dawn * .6 : env.dark ? (cellarDark() ? 0 : .7) : 1.15) * Math.max(.25, lightMul); // night: only the emergency lights
  const fogC = new THREE.Color(bo ? 0x030504 : env.fog); if (!env.dark && !bo) fogC.multiplyScalar(.74); if (dawn) fogC.lerp(new THREE.Color(0x6a5a6a), dawn * .8);
  if (!env.dark) fogC.lerp(new THREE.Color(0x0a0d0c), 1 - lightMul);
  scene.fog.color.copy(fogC); scene.background.copy(fogC);
  const fk = env.dark ? 1 : 1.5; scene.fog.near = bo ? 1 : env.near * fk * (.4 + .6 * lightMul); scene.fog.far = bo ? 10 : (env.far * fk + dawn * 12) * (.45 + .55 * lightMul);
  const need = inDarkness() || bo;
  flashlight.intensity = need && player.lampOn ? (player.lamp > 0 ? 1.7 : (Math.random() < .3 ? .4 : .1)) : 0;
  fpHand.visible = need;
  if (fpHand.userData.glow) { const on = flashlight.intensity > .3; fpHand.userData.glow.visible = false; /* no glowing bulb: you never see the lens from behind */ if (fpHand.userData.beam) fpHand.userData.beam.visible = on; fpHand.userData.lens.material.color.setHex(on ? 0xfff6dd : 0x3a3a3a); }
  if (level && (force || bo !== level.lastBo)) { level.lastBo = bo; level.panelMat.color.setHex(bo || cellarDark() ? 0x2a2d2b : env.lamp); }
  if (level && level.windowMat) level.windowMat.color.setHex(boltT > 0 ? 0xffffff : 0x8a9ab0);
  if (level && level.outsideMat) { // first light behind the windows: the night skyline gives way to a pink-orange morning
    if (dawn > .3 && !level.dawnSky) { level.dawnSky = true; level.outsideMat.map = skylineTex(true); level.outsideMat.needsUpdate = true; }
    if (boltT > 0) level.outsideMat.color.setHex(0xffffff); else if (level.dawnSky) level.outsideMat.color.setRGB(1.05, .78 + dawn * .2, .62 + dawn * .3); else level.outsideMat.color.setRGB(.69 + dawn * .8, .69 + dawn * .5, .72 + dawn * .2); }
}
const lampVisible = () => inDarkness() && player.lampOn && player.lamp > 0;

// ---------- objectives & navigation ----------
const bouncersTotal = () => level ? level.enemies.filter(e => e.type === "U").length : 0;
const bouncersCleared = () => level ? level.enemies.filter(e => e.type === "U" && e.cleared).length : 0;
function objectives() {
  if (run.mode === "night") {
    const left = Math.max(0, NIGHT_END - run.minutes), list = [];
    if (run.minutes >= NIGHT_END - 30) list.push({ id: "handover", title: "Übergabe 07:30", text: run.minutes >= NIGHT_END ? "Jetzt ins Arztzimmer: Übergabe!" : "Um 07:30 im Arztzimmer sein (Übergabe)", main: true, at: "safe", done: false, how: "Sicherer Raum mit braunem Holzboden (Arztzimmer / Personalraum)" });
    if (run.task) list.push({ id: "task", title: "Pager · Zi. " + run.task.room, text: run.task.text + " (" + Math.max(0, Math.ceil(run.task.deadline - run.minutes)) + " Min.)", main: true, at: "task", done: false });
    list.push({ id: "hide", title: "Unentdeckt bleiben", text: `Niemand darf dich finden · gefunden ${run.found || 0}/3`, main: true, done: false, brief: "Patienten mit roten Augen, Nachtschwestern, Hildegard: Wer dich erwischt, zählt. Dreimal, und die Nacht ist vorbei." });
    list.push({ id: "survive", title: "Überleben bis 07:30", text: `Überlebe bis 07:30 (noch ${Math.floor(left / 60)} h ${String(Math.floor(left % 60)).padStart(2, "0")})`, main: true, done: false, brief: "Erledige die Pager-Aufgaben, bevor die Zeit abläuft. Versteck dich im Arztzimmer, wenn es zu viel wird." });
    return list;
  }
  const L = LEVELS[run.idx], R = mission(), last = isLastFloor();
  const list = [], fin = [];
  for (const o of L.objectives) {
    if (!o.main || (o.for && !o.for.includes(run.route))) continue;
    (o.fin ? fin : list).push({ ...o, text: typeof o.text === "function" ? o.text() : o.text, done: o.done ? o.done() : run.flags.has(o.id) });
  }
  for (const g of R.goals) if (g.lvl === run.idx) list.push({ ...g, main: true, route: R.name, text: typeof g.text === "function" ? g.text() : g.text, done: goalDone(g) });
  if (last && level && level.boss) list.push({ id: "boss", title: "Endgegner: " + level.boss.def.name, text: level.boss.def.name + " steht dir im Weg", main: true, at: "boss", done: !!level.boss.cleared, boss: true,
    how: "Ansprechen: reden, Formular ausfüllen oder kämpfen", brief: level.boss.def.line });
  list.push(...fin);
  if (!L.final) list.push(last
    ? { id: "exit", title: "Haupteingang", text: "Raus! " + R.ride[0].toUpperCase() + R.ride.slice(1) + " wartet", brief: "Der Haupteingang. Dahinter: Freiheit. Und " + R.ride + ".", main: true, at: "exit", done: false, isExit: true }
    : { id: "exit", title: "Treppenhaus", text: "Treppenhaus → " + floorLabel(missionFloors()[run.step + 1]), brief: "Die Brandschutztür ist offen. Treppe runter. Oder Aufzug, wenn du Nerven hast.", main: true, at: "exit", done: false, isExit: true });
  return list;
}
const goalDone = g => g.done ? g.done() : run.flags.has(g.id);
function routeReady(k) { return ROUTES[k].goals.every(goalDone); }
function routeMissing(k) { return ROUTES[k].goals.filter(g => !goalDone(g)).map(g => g.title); }
const exitOpen = () => objectives().every(o => !o.main || o.done || o.isExit);
function currentObjective() {
  const obj = objectives();
  return obj.find(o => o.main && !o.done && !o.isExit) || (exitOpen() ? obj.find(o => o.isExit) : null) || obj.find(o => !o.done);
}
function targetOf(o) {
  if (!o || !o.at) return null;
  if (o.at === "task") return run.task ? [run.task.x + .5, run.task.y + .5] : null;
  if (o.at === "exit") return level.exit ? [level.exit[0] + .5, level.exit[1] + .5] : null;
  if (o.at === "rea") return run.rea && !run.rea.done ? [run.rea.x + .5, run.rea.y + .5] : (level.reaSpot ? [level.reaSpot[0] + .5, level.reaSpot[1] + .5] : null);
  if (o.at === "safe") { const rg = level.safeRooms[0]; if (rg) { const [x, y] = rg.tiles[Math.floor(rg.tiles.length / 2)]; return [x + .5, y + .5]; } return level.start ? [level.start[0] + .5, level.start[1] + .5] : null; }
  if (o.at === "boss") return level.boss && !level.boss.cleared ? [level.boss.x, level.boss.y] : null;
  if (o.at === "bouncer") { const e = level.enemies.find(e => e.type === "U" && !e.cleared); return e ? [e.x, e.y] : null; }
  const [kind, key] = o.at.split(":");
  if (kind === "friend") { const f = level.friends.find(f => f.kind === key); return f ? [f.x, f.y] : null; }
  if (kind === "item") { const it = level.items.find(i => i.kind === key && !i.taken); return it ? [it.wx, it.wy] : null; }
  if (kind === "prop") { const p = level.props.find(p => p.kind === key && (!p.goal || p.goal === o.id)); return p ? [p.x, p.y] : null; }
  if (kind === "enemy") { const e = level.enemies.filter(e => e.type === key && !e.done && !e.gone).sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0]; return e ? [e.x, e.y] : null; }
  return null;
}
let naviT = 0, naviTarget = null;
function updateNavi(dt) {
  naviT -= dt; if (naviT > 0) return; naviT = .35;
  const o = run.rea && !run.rea.done ? { at: "rea" } : currentObjective();
  naviTarget = targetOf(o);
  const nv = level.navi;
  const offline = LEVELS[run.idx].fogOfWar && !run.flags.has("power");
  if (!naviTarget || !settings.navi || offline) { nv.count = 0; if (level.chev) level.chev.count = 0; return; }
  const path = bfs(Math.floor(player.x), Math.floor(player.y), Math.floor(naviTarget[0]), Math.floor(naviTarget[1]), true, playerPass);
  if (!path) { nv.count = 0; if (level.chev) level.chev.count = 0; return; }
  // subtle floor arrows every ~1.8 m along the path (no more thick painted line)
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), pos = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const pts = [[player.x, player.y]].concat(path.slice(1).map(([x, y]) => [x + .5, y + .5]));
  let c = 0, walked = 0, next = .8; const ch = level.chev;
  for (let i = 0; i < pts.length - 1 && c < 10; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], len = Math.hypot(bx - ax, by - ay); if (len < .01) continue;
    const yaw = Math.atan2(bx - ax, by - ay); q.setFromAxisAngle(up, yaw + Math.PI);
    while (next <= walked + len && c < 10) { const k = (next - walked) / len; pos.set((ax + (bx - ax) * k) * S, .02, (ay + (by - ay) * k) * S); m.compose(pos, q, sc); ch.setMatrixAt(c++, m); next += .85; }
    walked += len;
  }
  nv.count = 0; nv.instanceMatrix.needsUpdate = true; if (ch) { ch.count = c; ch.instanceMatrix.needsUpdate = true; }
}

// ---------- HUD ----------
/* "what now?" – every objective gets a one-line how-to plus distance and direction */
function howTo(o) {
  if (!o) return "";
  if (o.how) return typeof o.how === "function" ? o.how() : o.how;
  if (o.isExit || o.at === "exit") return "Grünen Treppenhaus-Schildern folgen · oder Aufzug (⇅)";
  if (o.at === "rea") return "Hin und AKTION: Herzdruckmassage im Takt tippen";
  if (o.at === "bouncer") return "Orthopäden ansprechen: Shake, Fachwissen oder Liegestütze";
  if (o.at === "task") return "Ins Zimmer, AKTION: versorgen";
  if (o.id === "survive") return "Arztzimmer = sicher · Hildegard nie aus den Augen lassen";
  const [kind, key] = (o.at || "").split(":");
  if (kind === "friend") return (FRIENDS[key] ? FRIENDS[key].name : "Person") + " ansprechen (grüner Punkt)";
  if (kind === "item") return (ITEMS[key] ? ITEMS[key].name : "Gegenstand") + " aufheben (gelber Punkt)";
  if (kind === "enemy") return (TYPES[key] ? TYPES[key].role : "Person") + " finden und reden";
  if (kind === "prop") return { t: "Am Automaten AKTION drücken", "=": "Mit Ticket: AKTION an der Schranke", j: "AKTION: einsteigen", grab: "Hingehen, AKTION: mitnehmen (★ Schild)", film: "Hingehen, AKTION: Reel drehen", L: "Zum Spind in der Umkleide, AKTION", y: "Am Schalter AKTION gedrückt halten", pc: "Am Computer im Arztzimmer AKTION", photo: "Hingehen, AKTION: Beweisfoto", stamp: "AKTION: Stempel abholen", meds: "AKTION: einpacken", G: "Sicherungskasten: AKTION" }[key] || "Hingehen und AKTION drücken";
  return "";
}
const ARROWS = ["⬆", "↗", "➡", "↘", "⬇", "↙", "⬅", "↖"];
function updateMissionHow(cur) {
  const el = $("missionHow"); if (!el) return;
  const how = howTo(cur), t = cur ? targetOf(cur) : null;
  let where = "";
  if (t && level) {
    const dx = t[0] - player.x, dy = t[1] - player.y, d = Math.hypot(dx, dy) * S;
    const rel = Math.atan2(-dx, -dy) - player.yaw, k = ((Math.round(-rel / (Math.PI / 4)) % 8) + 8) % 8;
    where = d < 2.2 ? "hier!" : `${Math.round(d)} m ${ARROWS[k]}`;
  }
  el.innerHTML = (how ? esc(how) : "") + (where ? ` <i>· ${where}</i>` : "");
  el.hidden = !how && !where;
}
function setMsg(text, secs, alert) { msg = { text, t: secs }; $("hudMsg").textContent = text; $("hudMsg").classList.toggle("alert", !!alert); }
function updateHud() {
  let h = "";
  $("hudNerves").hidden = run.mode !== "night";
  if (run.mode === "night") { for (let i = 0; i < 3; i++) h += i < 3 - (run.found || 0) ? "👁" : '<span class="lost">✕</span>'; $("hudNerves").innerHTML = h; }
  $("chipTasks").textContent = "AUFG " + run.tasks.length; $("chipTasks").classList.toggle("warn", run.tasks.length >= 5);
  $("chipDuty").textContent = "DIENSTE " + run.duties.length; $("chipDuty").classList.toggle("warn", run.duties.length > 0);
  const obj = objectives(), cur = currentObjective(), mains = obj.filter(o => o.main && !o.isExit);
  $("missionHead").textContent = run.mode === "night" ? "Nachtdienst" : cur && cur.boss ? "Endgegner" : cur && cur.isExit ? (isLastFloor() ? "Fast geschafft" : "Weiter") : cur && cur.route ? `${mission().av} Unter-Mission · ${goalsDoneCount()}/${mission().goals.length}` : `Hindernis · ${floorLabel(run.idx)}`;
  $("missionText").textContent = cur ? cur.text : "Zum Auto!";
  updateMissionHow(cur);
  updateRouteChip();
  updateEnergy();
}
/* the energy bar: shows %, flashes when you lose some, turns red and blinks at 25 % and below */
function energyHit() { const b = $("energyBox"); if (!b) return; b.classList.remove("hit"); void b.offsetWidth; b.classList.add("hit"); }
function updateEnergy() {
  const e = Math.max(0, Math.round(run.energy));
  if (run.lastE != null && e < run.lastE - .5 && performance.now() - (run.lastHitAt || 0) > 900 && run.lastE - e >= 3) { run.lastHitAt = performance.now(); energyHit(); }
  run.lastE = e;
  $("energyFill").style.width = e + "%"; $("energyFill").className = e <= 0 ? "empty" : e <= 25 ? "crit" : e < 50 ? "low" : ""; $("energyNum").textContent = e + " %";
  $("energyBox").classList.toggle("crit", e <= 25);
  const dark = inDarkness(), chip = $("chipLamp");
  chip.hidden = !dark; chip.textContent = player.lampOn ? `🔦 AN · SICHTBAR · ${Math.round(player.lamp)}%` : "🔦 AUS · UNSICHTBAR";
  chip.classList.toggle("warn", player.lampOn && player.lamp < 25); chip.classList.toggle("good", !player.lampOn);
}
function buffText() {
  const b = [];
  if (player.hidden) b.push("VERSTECKT");
  if (player.civil) b.push("🥼ZIVIL");
  if (player.noroT > 0) b.push("😷" + Math.ceil(player.noroT));
  if (player.phoneT > 0) b.push("📱" + Math.ceil(player.phoneT));
  if (player.busy > 0) b.push("📋" + Math.ceil(player.busy));
  if (player.coffee > 0) b.push("☕" + Math.ceil(player.coffee));
  if (player.airplane > 0) b.push("✈️" + Math.ceil(player.airplane));
  if (lure) b.push("📢" + Math.ceil(lure.t));
  return b.join(" ");
}
function addTask(t) { run.tasks.push(t); run.tasksTotal++; }
function addDuty(code) { code = code || pick(["WE", "WE", "N", "24", "RB"]); run.duties.push(code); return DUTIES[code]; }
function pen(o) {
  const st = [];
  if (o.mins) { run.minutes += o.mins; st.push({ text: "+" + o.mins + " Min" }); }
  const drain = (o.nerves || 0) * 15 + (o.energy || 0) + (o.tasks ? o.tasks.length * 4 : 0);
  if (drain) { run.energy = Math.max(0, run.energy - drain); st.push({ text: "−" + drain + " % Energie" }); energyHit(); }
  if (o.tasks) { for (const t of o.tasks) addTask(t); st.push({ text: "+" + o.tasks.length + " Aufgabe" + (o.tasks.length > 1 ? "n" : "") }); }
  if (o.duties) for (let i = 0; i < o.duties; i++) st.push({ text: addDuty(o.dutyCode) });
  return st;
}
function gain(o) {
  const st = [];
  const up = (o.nerves || 0) * 15 + (o.energy || 0);
  if (up) { const before = run.energy; run.energy = Math.min(100, run.energy + up); if (run.energy > before) st.push({ text: "+" + Math.round(run.energy - before) + " % Energie", good: true }); }
  if (o.text) st.push({ text: o.text, good: true });
  return st;
}
const good = text => ({ text, good: true });
const stampsHtml = st => st.map(s => `<span class="stamp${s.good ? " good" : ""}">${esc(s.text)}</span>`).join("");
let lastToastAt = 0;
const quiet = (ms = 18000) => performance.now() - lastToastAt > ms && !call && $("dlg").hidden;
function showToast(avatar, bg, who, line, stamps) {
  lastToastAt = performance.now();
  $("toastAvatar").textContent = avatar; $("toastAvatar").style.background = bg;
  $("toastWho").textContent = who; $("toastLine").textContent = line; $("toastStamps").innerHTML = stampsHtml(stamps || []);
  const t = $("toast"); t.hidden = false; t.classList.remove("pop", "swipe"); t.style.transform = ""; void t.offsetWidth; t.classList.add("pop"); toastT = Math.min(9, 3 + String(line || "").length / 28);
}
// swipe (or tap) messages away
function swipeAway(el, onGone) {
  let x0 = null, y0 = 0, dx = 0, dy = 0;
  const base = () => getComputedStyle(el).transform === "none" ? "" : "";
  el.addEventListener("pointerdown", e => { x0 = e.clientX; y0 = e.clientY; dx = dy = 0; el.setPointerCapture(e.pointerId); e.stopPropagation(); });
  el.addEventListener("pointermove", e => { if (x0 == null) return; dx = e.clientX - x0; dy = e.clientY - y0; el.style.translate = `${dx}px ${Math.min(0, dy)}px`; el.style.opacity = String(1 - Math.min(.8, Math.hypot(dx, dy) / 200)); e.stopPropagation(); });
  const end = e => { if (x0 == null) return; x0 = null; e.stopPropagation(); const far = Math.abs(dx) > 50 || dy < -40, tap = Math.hypot(dx, dy) < 6; el.style.translate = ""; el.style.opacity = ""; if (far || tap) { el.hidden = true; if (onGone) onGone(); } };
  el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
  for (const ev of ["touchstart", "touchmove", "touchend", "mousedown"]) el.addEventListener(ev, e => e.stopPropagation(), { passive: true });
  void base;
}
swipeAway($("toast"), () => { toastT = 0; });

function flash(kind) { const f = $("flash"); f.className = ""; void f.offsetWidth; f.className = "on" + (kind ? " " + kind : ""); }

// ---------- inventory ----------
function addItem(k, n = 1) { run.inv[k] = (run.inv[k] || 0) + n; renderInv(); }
const hasItem = k => (run.inv[k] || 0) > 0;
function takeItem(k) { if (!hasItem(k)) return false; run.inv[k]--; if (!run.inv[k]) delete run.inv[k]; renderInv(); return true; }
const invSlots = () => INV_ORDER.filter(k => run.inv[k]).slice(0, 6);
function renderInv() {
  const box = $("inv"); box.innerHTML = "";
  invSlots().forEach(k => {
    const b = document.createElement("button"); b.type = "button"; b.className = "slot"; b.title = ITEMS[k].name + ": " + ITEMS[k].desc;
    b.setAttribute("aria-label", ITEMS[k].name + " benutzen");
    b.innerHTML = `${ITEMS[k].emoji}${run.inv[k] > 1 ? `<i>${run.inv[k]}</i>` : ""}`;
    b.addEventListener("pointerdown", e => { e.preventDefault(); e.stopPropagation(); if (mode === "play") useItem(k); });
    box.appendChild(b);
  });
}
function farthestTile() {
  const dm = distMap(Math.floor(player.x), Math.floor(player.y), playerPass); let best = -1, bi = 0;
  for (let i = 0; i < dm.length; i++) if (dm[i] > best && grid[(i / GW) | 0][i % GW] !== "_") { best = dm[i]; bi = i; }
  return [bi % GW, (bi / GW) | 0];
}
function useItem(k) {
  const def = ITEMS[k]; let st = [], line = "";
  switch (k) {
    case "1": takeItem(k); player.coffee = 8; st = gain({ energy: 35 }).concat([good("8 s schneller")]); line = "Lauwarm. Aus der Stationsküche. Gehört eigentlich Schwester Gertrud."; break;
    case "0": takeItem(k); st = gain({ energy: 55 }); line = "Schmeckt nach Gummibärchen und Reue."; break;
    case "$": takeItem(k); st = gain({ nerves: 1, energy: 15 }); line = "Vom Pharmavertreter. Ethisch fragwürdig, aber lecker."; break;
    case "+": takeItem(k); st = gain({ nerves: 1, energy: 60 }); line = "Dr. Glatts Wundercreme. Du glänzt. Innerlich auch."; break;
    case "2": takeItem(k); player.busy = 10; st = [good("10 s beschäftigt")]; line = "Klemmbrett hoch, Stirn runzeln, schnell gehen. Niemand spricht dich an."; break;
    case "3": {
      takeItem(k); let n = 0;
      for (const e of level.enemies) if (!e.static && !e.done && Math.hypot(e.x - player.x, e.y - player.y) < 4 && los(player.x, player.y, e.x, e.y)) { e.stun = Math.max(e.stun, 7); e.aw = 0; e.state = "idle"; emote(e, "😵"); n++; }
      flash("mist"); sfx.spray(); st = [good(n ? n + " für 7 s eingenebelt" : "niemand getroffen")]; line = n ? "Hygieneoffensive! Alle in der Nähe desinfizieren sich erst mal die Augen. Sieben Sekunden lang." : "Pssscht. Niemand in Reichweite (etwa 12 Meter, mit Sicht). Spray verschwendet."; break;
    }
    case "4": takeItem(k); player.airplane = 60; if (call && !call.def.forced) endCall(); st = [good("60 s Ruhe")]; line = "Pieper im Flugmodus. Offiziell: Funkloch."; break;
    case "5": { takeItem(k); const [x, y] = farthestTile(); lure = { x, y, t: 12 }; st = [good("12 s Ruhe")]; line = "„Achtung: Kostenloser Kuchen in der Cafeteria!“ Alle rennen los."; sfx.ding(); break; }
    case "7": {
      takeItem(k); let n = 0; nerdLure = { x: player.x, y: player.y, t: 16 };
      for (const e of level.enemies) if (e.type === "I" && !e.done) { e.state = "nerd"; n++; }
      const p = new THREE.Group(); const b = itemModel("7"); p.add(b); p.add(at(sprite(labelTex("SELTENER FALL!", "#c0322a", "#fff"), 1.2, .22), 0, .6, 0));
      p.position.set(player.x * S, 0, player.y * S); level.group.add(p); nerdLure.mesh = p;
      st = [good(n ? n + " Nerds abgelenkt" : "Hingelegt")]; line = "Du legst den Fallbericht „Morbus Whipple mit Zebrastreifen“ hin. Jeder Internist im Umkreis kommt angerannt."; break;
    }
    case "6": takeItem(k); st = gain({ energy: 25 }); line = "Schmeckt nach Vanille und Kreidestaub. Eigentlich für die Orthopäden gedacht."; break;
    case "8": line = "Du rechnest deine Überstunden aus. Schlechte Idee. Heb ihn dir für PD-Phil auf."; break;
    case "p": takeItem(k); { const n = throwPen(); st = [good(n ? n + " abgelenkt" : "Klack")]; line = n ? "Klack! Der Kuli landet irgendwo da hinten. Alle drehen sich um und gehen nachsehen. Kugelschreiber: das Schweizer Taschenmesser der Medizin." : "Klack. Niemand in der Nähe, der sich dafür interessiert. Der Kuli ist trotzdem weg."; } break;
    case "c": toggleCoat(); line = player.civil ? "Kittel aus. Ohne Kittel erkennt dich das Personal nicht mehr: nur ein weiterer müder Besucher. Patienten und Angehörige fragen dich dafür nach der Toilette." : "Kittel wieder an. Du bist wieder Ärztin oder Arzt. Leider."; st = [good(player.civil ? "Zivil" : "Kittel an")]; break;
    case "m": takeItem(k); player.noroT = 15; sfx.knock(); setTimeout(() => sfx.knock(), 350); for (const e of level.enemies) if (!e.static && Math.hypot(e.x - player.x, e.y - player.y) < 6) { e.aw = 0; e.state = "idle"; emote(e, "🤢"); e.investigate = { x: e.hx + .5, y: e.hy + .5, t: 5 }; }
      st = [good("15 s Abstand")]; line = pick(["Maske auf. „*hust* … Noro. Glaube ich.“ Der Flur leert sich schneller als bei einem Feueralarm.", "Du hustest dreimal feucht. Niemand will mehr eine „ganz kurze Frage“ stellen.", "„Ich war gerade in der Gastro.“ Das reicht. Alle treten zurück."]); break;
    case "f": takeItem(k); player.phoneT = 10; sfx.beep(); st = [good("10 s Ruhe vor dem Personal")]; line = pick(["„Ja, Herr Professor. Nein, Herr Professor. Die Studie, natürlich.“ Du redest mit niemandem. Alle machen einen Bogen um dich.", "„Ja, hier ist der Hintergrunddienst… nein, das kann ich nicht am Telefon…“ Niemand stört einen Arzt, der ernst ins Handy schaut.", "„Mhm. Mhm. Ganz schlechte Werte. Ich komme.“ Du gehst. Wohin, weiß keiner. Du auch nicht."]); break;
    case "9": takeItem(k); player.lamp = 100; player.lampOn = true; st = [good("Lampe 100 %")]; line = "Frische Batterie. Die letzte im Haus. Das Controlling weiß davon nichts."; break;
  }
  showToast(def.emoji, "#f3f8f1", def.name, line, st); updateHud();
}

// ---------- audio ----------
let actx = null, master = null, humGain = null, droneGain = null, noiseBuf = null;
function initAudio() {
  try {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain(); master.gain.value = settings.sound ? 1 : 0; master.connect(actx.destination);
      noiseBuf = actx.createBuffer(1, actx.sampleRate, actx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const hum = actx.createOscillator(); hum.type = "sawtooth"; hum.frequency.value = 100;
      const lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 380;
      humGain = actx.createGain(); humGain.gain.value = 0; hum.connect(lp).connect(humGain).connect(master); hum.start();
      droneGain = actx.createGain(); droneGain.gain.value = 0; droneGain.connect(master);
      for (const f of [55, 55.7, 82.4]) { const o = actx.createOscillator(); o.type = "sine"; o.frequency.value = f; o.connect(droneGain); o.start(); }
    }
    if (actx.resume) actx.resume();
  } catch (e) { actx = null; }
}
function tone(freq, start, dur, type = "square", vol = .05, slideTo) {
  if (!actx) return;
  try { const o = actx.createOscillator(), g = actx.createGain(), t0 = actx.currentTime + start; o.type = type; o.frequency.setValueAtTime(freq, t0); if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .01); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur); o.connect(g).connect(master); o.start(t0); o.stop(t0 + dur + .02); } catch (e) {}
}
function noise(start, dur, freq, q, vol, type = "bandpass") {
  if (!actx) return;
  try { const s = actx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const f = actx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = actx.createGain(), t0 = actx.currentTime + start; g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    s.connect(f).connect(g).connect(master); s.start(t0); s.stop(t0 + dur + .05); } catch (e) {}
}
const sfx = {
  hit: () => { tone(2200, 0, .1); tone(2200, .14, .1); }, pick: () => { tone(880, 0, .08, "triangle", .08); tone(1320, .08, .1, "triangle", .08); },
  paper: () => noise(0, .2, 3000, .8, .08), ring: () => { for (let i = 0; i < 6; i++) tone(i % 2 ? 1400 : 1750, i * .07, .06, "square", .035); },
  floor: () => { tone(660, 0, .1, "triangle", .08); tone(880, .1, .1, "triangle", .08); tone(1100, .2, .2, "triangle", .08); },
  step: () => noise(0, .05, 350, 1.2, .04), zap: () => { noise(0, .25, 4000, .5, .2, "highpass"); tone(60, 0, .25, "square", .08); },
  slip: () => tone(500, 0, .35, "sine", .07, 120), alarm: () => { for (let i = 0; i < 4; i++) { tone(960, i * .5, .22, "square", .05); tone(770, i * .5 + .25, .22, "square", .05); } },
  creak: () => { tone(180 + Math.random() * 80, 0, 1.2, "sawtooth", .025, 60); noise(0, 1.2, 600, 4, .02); },
  slam: () => { noise(0, .5, 120, .7, .25, "lowpass"); tone(55, 0, .4, "sine", .15, 35); }, whisper: () => noise(0, 1.4, 2400, 6, .05),
  power: () => tone(80, 0, 1.2, "sawtooth", .07, 420), powerDown: () => tone(420, 0, .9, "sawtooth", .07, 50),
  cpr: () => tone(140, 0, .08, "sine", .12), knock: () => noise(0, .15, 200, 1, .15, "lowpass"), spray: () => noise(0, .6, 5000, .4, .12, "highpass"),
  ding: () => { tone(1320, 0, .3, "sine", .06); tone(990, .25, .4, "sine", .06); }, stinger: () => { tone(110, 0, 1.6, "sawtooth", .04, 104); tone(116, 0, 1.6, "sawtooth", .03, 123); },
  car: () => { tone(90, 0, .6, "sawtooth", .05, 60); noise(0, .4, 300, 1, .06); }, spa: () => { tone(523, 0, .8, "sine", .05); tone(659, .2, .8, "sine", .05); tone(784, .4, 1, "sine", .05); },
  sus: () => tone(620, 0, .18, "sine", .04, 760), spot: () => { tone(700, 0, .12, "square", .04); tone(940, .12, .2, "square", .04); },
  thunder: () => { noise(0, 2.4, 90, .6, .3, "lowpass"); noise(.1, 1.2, 300, .8, .08); }, tick: () => tone(2400, 0, .02, "square", .02), beep: () => tone(880, 0, .09, "sine", .04), door: () => { noise(0, .14, 260, 1, .14, "lowpass"); tone(190, .02, .3, "sawtooth", .018, 120); },
  lift: () => { tone(988, 0, .5, "sine", .05); tone(784, .35, .7, "sine", .05); },
};

// declining a task: sometimes the PJ student takes it, sometimes the roster takes revenge
document.addEventListener("click", ev => {
  const b = ev.target.closest(".task-x"); if (!b || !run) return;
  const i = +b.dataset.i, t = run.tasks[i]; if (t == null) return;
  run.tasks.splice(i, 1); run.declined = (run.declined || 0) + 1;
  if (Math.random() < .5) showToast("🥺", "#6fcf97", "Abgelehnt", pick([`Jonas, der PJler, übernimmt „${t}“. Er ist begeistert. Noch.`, `„${t}“ landet im Fach vom Spätdienst. Der Spätdienst bist morgen wieder du, aber egal.`, `Du schreibst „${t}“ auf ein Post-it und klebst es an den Kühlschrank. Problem gelöst.`]), [good("Erledigt (irgendwie)")]);
  else showToast("📅", "#e2483d", "Abgelehnt", pick([`Der Oberarzt hat es gesehen. „${t}“ ist weg, dafür hast du Samstag Dienst.`, `Abgelehnt. Das Controlling vermerkt: „mangelnde Teamfähigkeit“. Und plant dich ein.`]), pen({ duties: 1 }));
  sfx.pick(); updateHud(); if (typeof clockWatch === "function") clockWatch();
});
