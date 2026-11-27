/* Hospital Escape 3D · night-shift creep: things that only happen when you are not looking.
   1. X-ray lightboxes with a hand on the film. Look away, look back: the hand has moved. Pressed flat against the glass. Pointing at you. Gone.
   2. Patients with red eyes who lean out from behind a corner for a second and pull back. Some just stand there, half hidden,
      and are gone the moment you look away. They never count as being found; they only want to be seen. */

const _v3 = new THREE.Vector3();
/* is a world point on screen, in front of the camera, and not behind a wall? */
function inView(wx, wy, wz, tx, ty) {
  _v3.set(wx, wy, wz).project(camera);
  if (_v3.z > 1 || Math.abs(_v3.x) > .95 || Math.abs(_v3.y) > .95) return false;
  return los(player.x, player.y, tx, ty);
}

// ---------- 1. the hand on the X-ray ----------
/* the film is drawn live on a canvas: real bones (radius, ulna, carpals, metacarpals, phalanges with joints), soft tissue,
   film grain. Each pose is a set of finger curls and a tilt; looking away switches the pose, and now and then the hand waves. */
const HAND_POSES = [
  { name: "rest", curl: [0, 0, 0, 0, 0], spread: 1, label: "L · DORSOPALMAR", time: "03:12" },
  { name: "press", curl: [-.05, -.05, -.05, -.05, -.05], spread: 1.7, press: true, label: "L · DORSOPALMAR", time: "03:13" },
  { name: "point", curl: [.9, 0, 1.4, 1.4, 1.3], spread: .9, label: "L · ???", time: "03:13" },
  { name: "fist", curl: [1, 1.55, 1.6, 1.6, 1.5], spread: .8, label: "L · BITTE NICHT", time: "03:14" },
  { name: "gone", gone: true, label: "L · LEER", time: "03:33" },
];
const FINGERS = [ // base offset along the palm, angle, metacarpal length, phalanx lengths, bone width
  { bx: -30, by: -6, a: -2.25, mc: 30, ph: [24, 17], w: 9 },            // thumb
  { bx: -15, by: -26, a: -1.78, mc: 42, ph: [27, 17, 12], w: 8 },
  { bx: -2, by: -30, a: -1.6, mc: 44, ph: [30, 19, 13], w: 8 },
  { bx: 11, by: -27, a: -1.43, mc: 41, ph: [28, 18, 12], w: 7.5 },
  { bx: 23, by: -20, a: -1.25, mc: 37, ph: [22, 14, 11], w: 7 },
];
function drawFilm(g, w, h, st) {
  const pose = HAND_POSES[st.pose];
  g.fillStyle = "#05080c"; g.fillRect(0, 0, w, h);
  const vg = g.createRadialGradient(w / 2, h * .55, 20, w / 2, h * .55, h * .7); vg.addColorStop(0, "rgba(40,60,85,.55)"); vg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = vg; g.fillRect(0, 0, w, h);
  g.fillStyle = "#cfe0ff"; g.font = "700 11px monospace"; g.fillText(pose.label, 10, 16); g.fillText(pose.time, w - 46, h - 9);
  g.font = "900 22px monospace"; g.fillStyle = "rgba(220,235,255,.9)"; g.fillText("L", w - 26, 24);
  g.strokeStyle = "rgba(200,220,255,.25)"; g.lineWidth = 1; for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo(8, 40 + i * 12); g.lineTo(i % 5 ? 13 : 18, 40 + i * 12); g.stroke(); }
  const wrist = [w / 2, h * .76];
  if (pose.gone) {
    g.fillStyle = "rgba(150,180,220,.16)"; g.beginPath(); g.ellipse(wrist[0], wrist[1] - 40, 40, 54, 0, 0, 7); g.fill();
    g.strokeStyle = "rgba(200,220,255,.3)"; g.lineWidth = 6; g.lineCap = "round";
    for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(wrist[0] - 34 + i * 17, wrist[1] - 80); g.bezierCurveTo(wrist[0] - 34 + i * 17, wrist[1] - 20, wrist[0] - 30 + i * 16, wrist[1] + 20, wrist[0] - 28 + i * 15, h + 5); g.stroke(); }
  } else {
    const tilt = st.tilt || 0, spread = pose.spread, bones = [];
    const rot = (x, y) => [wrist[0] + x * Math.cos(tilt) - y * Math.sin(tilt), wrist[1] + x * Math.sin(tilt) + y * Math.cos(tilt)];
    // radius and ulna
    bones.push([rot(-12, 60), rot(-11, 4), 13], [rot(12, 60), rot(10, 6), 10]);
    FINGERS.forEach((f, i) => {
      const c = (pose.curl[i] || 0) * (st.wave ? 0 : 1), a0 = f.a + (f.a + 1.6) * (spread - 1) * (i ? 1.1 : .5) + tilt;
      let p = rot(f.bx * (i ? .62 : .8), f.by * .35 + 2), a = a0;
      const mEnd = [p[0] + Math.cos(a) * f.mc, p[1] + Math.sin(a) * f.mc]; bones.push([p, mEnd, f.w + 1]); p = mEnd;
      f.ph.forEach((L, s) => { const bend = Math.min(1.45, c * (s + 1) * .62); a += c * .08 * (i ? 1 : -1.5); const LL = L * Math.max(.18, Math.cos(bend)); const e = [p[0] + Math.cos(a) * LL, p[1] + Math.sin(a) * LL]; bones.push([p, e, f.w - s * 1.4 + bend * 1.2]); p = e; }); // curled fingers look shorter from above, as on a real film
    });
    // soft tissue: a blurry glow along every bone
    g.lineCap = "round"; g.strokeStyle = pose.press ? "rgba(170,200,240,.2)" : "rgba(140,170,215,.14)";
    for (const [a, b, wd] of bones) { g.lineWidth = wd * 2.6; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    // carpals
    for (let k = 0; k < 8; k++) { const [x, y] = rot(-16 + (k % 4) * 11, -2 - Math.floor(k / 4) * 10); g.fillStyle = "rgba(205,222,250,.82)"; g.beginPath(); g.ellipse(x, y, 6, 5, tilt, 0, 7); g.fill(); }
    // bones: bright cortex, darker marrow, a knob at every joint
    for (const [a, b, wd] of bones) {
      g.strokeStyle = "rgba(225,238,255,.92)"; g.lineWidth = wd; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      g.strokeStyle = "rgba(120,145,180,.55)"; g.lineWidth = wd * .38; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      g.fillStyle = "rgba(235,244,255,.95)"; g.beginPath(); g.arc(b[0], b[1], wd * .62, 0, 7); g.fill();
    }
    if (pose.press) { g.fillStyle = "rgba(255,255,255,.07)"; g.beginPath(); g.ellipse(wrist[0], wrist[1] - 70, 62, 78, tilt, 0, 7); g.fill(); }
  }
  // grain and a scan line drifting down the film
  for (let i = 0; i < 220; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * .06})`; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
  const sy = (st.scan || 0) % 1 * h; g.fillStyle = "rgba(180,210,255,.06)"; g.fillRect(0, sy, w, 8);
}
function lightboxModel() {
  const g = new THREE.Group(); dyn(g);
  g.add(at(boxMesh(1.05, 1.42, .08, 0xd8dde0), 0, .04, -.04));
  const cv = document.createElement("canvas"); cv.width = 192; cv.height = 240;
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4;
  const film = new THREE.Mesh(GEO.plane, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); film.scale.set(.88, 1.1, 1); film.position.z = .005; g.add(film);
  const glow = sprite(glowTex("rgba(190,215,255,1)"), 1.9, 2.1); glow.material = glow.material.clone(); glow.material.blending = THREE.AdditiveBlending; glow.material.depthWrite = false; glow.material.opacity = .28; glow.position.z = .12; g.add(glow);
  // a small plate on the frame, fixed to the box so it never gets cut off
  const pl = plate(textTex(["BEFUND: UNAUFFÄLLIG"], "#26332d", "#a6e38f", 512, 64, 34), .98, .12); pl.position.set(0, .66, .002); g.add(pl);
  return { g, film, cv, ctx: cv.getContext("2d"), tex, glow };
}
function redrawFilm(b) { drawFilm(b.ctx, b.cv.width, b.cv.height, b); b.tex.needsUpdate = true; }
/* put two lightboxes on walls in the night map, far from the start, on corridor or room walls with nothing in front */
function placeHandBoxes() {
  if (!level || level.handBoxes) return; level.handBoxes = [];
  const spots = [];
  for (let y = 1; y < GH - 1; y++) for (let x = 1; x < GW - 1; x++) {
    if (cell(x, y) !== ".") continue;
    for (const [dx, dy] of DIRS) if (cell(x + dx, y + dy) === "#" && cell(x - dx, y - dy) === "." && Math.hypot(x - player.x, y - player.y) > 8) spots.push([x, y, dx, dy]);
  }
  spots.sort(() => Math.random() - .5);
  for (const sp of spots) {
    if (level.handBoxes.length >= 2) break;
    if (level.handBoxes.some(b => Math.hypot(b.x - sp[0], b.y - sp[1]) < 10)) continue;
    const lb = lightboxModel(); lb.g.scale.setScalar(1.35); wallPlace(level, lb.g, sp[0], sp[1], sp[2], sp[3], 0, 1.7);
    lb.g.position.x -= sp[2] * .02; lb.g.position.z -= sp[3] * .02;
    const b = { ...lb, x: sp[0] + .5, y: sp[1] + .5, pose: 0, tilt: 0, scan: Math.random(), seen: false, away: 0, changed: false, flick: 0, wave: 0, waved: -99, moves: 0, drawT: 0 };
    redrawFilm(b); level.handBoxes.push(b);
  }
}
function handTick(dt, time) {
  if (!level.handBoxes) placeHandBoxes();
  for (const b of level.handBoxes) {
    const p = b.g.getWorldPosition(_v3.clone()), d = Math.hypot(b.x - player.x, b.y - player.y);
    const vis = d < 14 && inView(p.x, p.y, p.z, b.x, b.y);
    b.glow.material.opacity = .22 + Math.sin(time * 7 + b.x) * .03 + (b.flick > 0 || b.wave > 0 ? Math.random() * .3 : 0);
    if (b.flick > 0) b.flick -= dt;
    // it waves. Once you have seen it move, it sometimes waves at you. Only while you are looking.
    if (vis && b.wave <= 0 && b.moves >= 1 && HAND_POSES[b.pose].name !== "gone" && time - b.waved > 25 && d < 10 && Math.random() < dt * .18) { b.wave = 2.6; b.waved = time; tone(220, 0, .6, "sine", .02, 180); }
    if (b.wave > 0) { b.wave -= dt; b.tilt = Math.sin((2.6 - b.wave) * 9) * .38 * Math.min(1, b.wave * 2); if (b.wave <= 0) b.tilt = 0; }
    if (vis && (b.drawT -= dt) <= 0) { b.drawT = b.wave > 0 ? .06 : .25; b.scan = (b.scan + .03) % 1; redrawFilm(b); } // the scan line drifts, the grain lives
    if (vis) {
      if (b.changed) { b.changed = false; b.flick = .6; tone(70, 0, .5, "sine", .04, 50); if (d < 9 && Math.random() < .5) setMsg(({ press: "Die Hand auf dem Röntgenbild liegt jetzt flach am Glas. Von innen.", point: "„Befund: unauffällig.“ Die Hand zeigt auf dich.", fist: "Auf dem Leuchtkasten ist jetzt eine Faust. Eben war da keine.", gone: "Das Röntgenbild ist leer. Nur ein Wischen nach unten. Wo ist die Hand?", rest: "Die Hand auf dem Röntgenbild. War die nicht eben anders?" })[HAND_POSES[b.pose].name], 3.5, true); }
      b.seen = true; b.away = 0; continue;
    }
    if (!b.seen || d > 10) continue;
    b.away += dt;
    if (b.away > 1.4 && !b.changed) { // you looked away. It moves.
      let n = b.pose; while (n === b.pose) n = Math.floor(Math.random() * HAND_POSES.length);
      if (HAND_POSES[b.pose].name !== "gone" && Math.random() < .2) n = HAND_POSES.length - 1;
      b.pose = n; b.tilt = 0; b.wave = 0; b.changed = true; b.seen = false; b.moves++; redrawFilm(b);
      if (d < 5) noise(0, .08, 1800, 2, .03); // a tap on the glass, very soft
    }
  }
}

// ---------- 2. someone looks around the corner ----------
let peek = null;
/* a floor tile you can see, next to one you cannot: someone stands in the hidden one and leans into the visible one */
function findPeekSpot() {
  const px = player.x, py = player.y, cand = [];
  for (let y = Math.max(1, Math.floor(py) - 6); y <= Math.min(GH - 2, Math.floor(py) + 6); y++) for (let x = Math.max(1, Math.floor(px) - 6); x <= Math.min(GW - 2, Math.floor(px) + 6); x++) {
    const d = Math.hypot(x + .5 - px, y + .5 - py); if (d < 2.6 || d > 4.2) continue;
    if (!enemyPass(x, y)) continue;
    if (!inView((x + .5) * S, 1.5, (y + .5) * S, x + .5, y + .5)) continue;
    for (const [dx, dy] of DIRS) {
      const hx = x - dx, hy = y - dy; // the hidden tile, beside the visible one
      if (!enemyPass(hx, hy) || los(px, py, hx + .5, hy + .5)) continue;
      cand.push({ hx, hy, dx, dy });
    }
  }
  return cand.length ? pick(cand) : null;
}
function startPeek() {
  const sp = findPeekSpot(); if (!sp) return false;
  const stand = true; // they only stand there, half behind the wall, and are gone when you look away
  const pv = new THREE.Group(); const per = makePerson({ ...TYPES.Q.spec(), pose: undefined, glowEyes: true, noShadow: true, lowDetail: true, mood: "tired" });
  pv.add(per.group);
  // feet at the edge of the hidden tile, towards the visible one
  const bx = (sp.hx + .5 + sp.dx * .42) * S, bz = (sp.hy + .5 + sp.dy * .42) * S; pv.position.set(bx, 0, bz);
  per.group.rotation.y = Math.atan2(player.x * S - bx, player.y * S - bz);
  level.group.add(pv);
  const eyes = sprite(glowTex("rgba(255,40,20,1)"), .8, .32); eyes.material = eyes.material.clone(); eyes.material.blending = THREE.AdditiveBlending; eyes.material.depthWrite = false; eyes.material.fog = false; eyes.material.depthTest = true; eyes.material.opacity = 0; eyes.position.set(0, 1.62, .12); per.group.add(eyes);
  peek = { lvl: level, pv, per, eyes, sp, t: 0, stand, axis: new THREE.Vector3(sp.dy, 0, -sp.dx).normalize(), lean: 0, seenT: 0, awayT: 0, out: false, max: stand ? .14 : .42, hold: stand ? 7 : 1.4 + Math.random() };
  if (!stand) sfx.creak && sfx.creak();
  return true;
}
function endPeek() { if (!peek) return; level.group.remove(peek.pv); peek = null; }
function peekTick(dt) {
  const k = peek; k.t += dt;
  k.pv.updateMatrixWorld(true); const head = k.pv.localToWorld(new THREE.Vector3(0, 1.6, 0)), tx = head.x / S, ty = head.z / S;
  const seen = inView(head.x, head.y, head.z, tx, ty), d = Math.hypot(tx - player.x, ty - player.y);
  if (seen) { k.seenT += dt; k.awayT = 0; } else if (k.seenT > 0) k.awayT += dt;
  // too close, or a rule-2 emergency: gone at once
  if (d < 1.7 || nightTruce()) { if (d < 1.7) { tone(90, 0, .3, "sine", .05, 40); setMsg(pick(["Da war jemand. Jetzt nicht mehr.", "Um die Ecke ist niemand. Nur ein warmer Fleck an der Wand."]), 3, true); } return endPeek(); }
  if (k.stand) {
    k.lean = Math.min(k.max, k.lean + dt * .5);
    if (k.seenT > .3 && !k.said) { k.said = true; sfx.stinger && Math.random() < .5 && sfx.stinger(); }
    if (k.awayT > .5 || k.t > k.hold) return endPeek(); // you looked away: gone. You will never be sure.
  } else {
    if (!k.out) { k.lean = Math.min(k.max, k.lean + dt * 1.1); if (k.lean >= k.max) { k.out = true; k.outT = 0; } }
    else { k.outT += dt; if (k.outT > k.hold || k.seenT > .9) { k.lean -= dt * 1.6; if (!k.whisper) { k.whisper = true; sfx.whisper && sfx.whisper(); } if (k.lean <= 0) return endPeek(); } }
  }
  k.pv.quaternion.setFromAxisAngle(k.axis, k.lean);
  k.pv.position.set((k.sp.hx + .5 + k.sp.dx * (.42 + k.lean * .35)) * S, 0, (k.sp.hy + .5 + k.sp.dy * (.42 + k.lean * .35)) * S);
  k.per.group.rotation.y = Math.atan2(player.x * S - k.pv.position.x, player.y * S - k.pv.position.z);
  k.eyes.material.opacity = Math.min(1, k.lean / k.max) * (.75 + Math.sin(k.t * 22) * .15);
}

// ---------- 3. they blink ----------
/* the people waiting and everyone with red eyes blink now and then. Never together. Sometimes twice. */
function blinkTick(dt) {
  const ps = []; for (const w of level.watchers || []) ps.push(w.p); for (const e of level.enemies) if (!e.gone && e.person) ps.push(e.person); if (peek) ps.push(peek.per);
  for (const p of ps) {
    const red = p.face && p.face.red; if (!red || !red.length) continue;
    if (p.blinkT == null) p.blinkT = 2 + Math.random() * 7;
    p.blinkT -= dt;
    const closed = p.blinkT < 0 && p.blinkT > -.13 || (p.dbl && p.blinkT < -.26 && p.blinkT > -.38);
    for (const m of red) m.visible = !closed;
    if (p.blinkT < -.45) { p.blinkT = 3 + Math.random() * 9; p.dbl = Math.random() < .25; }
  }
  // never two at once: if someone else is mid-blink, the next one waits a moment
  let open = 0; for (const p of ps) if (p.blinkT != null && p.blinkT < 0 && p.blinkT > -.45) open++;
  if (open > 1) for (const p of ps) if (p.blinkT != null && p.blinkT < 0 && p.blinkT > -.05) { p.blinkT = .4 + Math.random(); const red = p.face && p.face.red; if (red) for (const m of red) m.visible = true; if (--open <= 1) break; }
}

// ---------- the clock for both ----------
function creepTick(dt) {
  if (!run || run.mode !== "night" || !level || mode !== "play") return;
  handTick(dt, level.t || 0);
  blinkTick(dt);
  if (peek && peek.lvl !== level) peek = null;
  if (peek) return peekTick(dt);
  if (run.hour < 1 || nightTruce() || playerSafe() || player.hidden) return;
  if ((run.peekT = (run.peekT ?? 45) - dt) > 0) return;
  run.peekT = startPeek() ? 80 + Math.random() * 70 : 8; // nothing fitting in view: try again soon
}
