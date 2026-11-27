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
/* five films of the same hand. 0 at rest, 1 fingers spread and pressed to the glass, 2 pointing out of the film, 3 a fist, 4 nothing left but a smear */
const HAND_POSES = 5;
const handTex = pose => canvasTex(160, 200, (g, w, h) => {
  g.fillStyle = "#070b10"; g.fillRect(0, 0, w, h);
  const bone = "rgba(215,232,255,.88)", soft = "rgba(160,190,230,.22)";
  g.lineCap = "round";
  g.fillStyle = "#cfe0ff"; g.font = "700 9px monospace"; g.fillText(["L · DORSOPALMAR", "L · DORSOPALMAR", "L · ???", "L · BITTE NICHT", "L · LEER"][pose], 8, 14);
  g.fillText(["03:12", "03:13", "03:13", "03:14", "03:33"][pose], w - 40, h - 8);
  if (pose === 4) { // gone. Only a smear, and five streaks downwards, as if it had slid off the film
    g.fillStyle = soft; g.beginPath(); g.ellipse(80, 132, 34, 40, 0, 0, 7); g.fill();
    g.strokeStyle = "rgba(200,220,255,.35)"; g.lineWidth = 5; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(52 + i * 14, 96); g.lineTo(50 + i * 14 + (i - 2) * 2, 190); g.stroke(); }
    return;
  }
  const cx = 80, cy = pose === 1 ? 128 : 140, spread = pose === 1 ? 1.7 : 1;
  // soft tissue
  g.fillStyle = soft; g.beginPath(); g.ellipse(cx, cy, pose === 3 ? 34 : 38, pose === 3 ? 36 : 42, 0, 0, 7); g.fill();
  // forearm bones
  g.strokeStyle = bone; g.lineWidth = 9; for (const dx of [-12, 12]) { g.beginPath(); g.moveTo(cx + dx, cy + 30); g.lineTo(cx + dx * .9, h + 10); g.stroke(); }
  // carpals
  g.fillStyle = bone; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(cx - 15 + (i % 3) * 15, cy + 14 + Math.floor(i / 3) * 10, 6, 5, 0, 0, 7); g.fill(); }
  // metacarpals and fingers
  const fingers = [[-26, -.55, .62], [-12, -.18 * spread, 1], [2, 0, 1.08], [15, .16 * spread, 1], [27, .34 * spread, .82]];
  fingers.forEach(([dx, ang, len], i) => {
    let x = cx + dx * .6, y = cy + 6, a = ang - Math.PI / 2;
    if (i === 0) { a = -2.3 * (pose === 1 ? 1.08 : 1); }
    const segs = i === 0 ? [20, 14, 10] : [28, 18, 13, 9];
    g.lineWidth = i === 0 ? 7 : 6;
    segs.forEach((L, s) => {
      let aa = a;
      if (pose === 3 && i > 0 && s >= 1) aa = a + Math.PI * .55 * s; // a fist: the fingers curl in
      if (pose === 2 && i !== 2 && i > 0 && s >= 1) aa = a + Math.PI * .6; // pointing: all but the index finger fold
      if (pose === 2 && i === 2) aa = a; // the index finger points straight out
      const nx = x + Math.cos(aa) * L * len, ny = y + Math.sin(aa) * L * len;
      g.beginPath(); g.moveTo(x, y); g.lineTo(nx, ny); g.stroke();
      g.beginPath(); g.arc(nx, ny, g.lineWidth * .45, 0, 7); g.fill();
      x = nx; y = ny; if (pose !== 3) a = aa + (pose === 1 ? 0 : (s ? .05 : 0));
    });
  });
  if (pose === 1) { // pressed against the glass: palm smear and fingertip prints
    g.fillStyle = "rgba(255,255,255,.08)"; g.beginPath(); g.ellipse(cx, cy - 4, 46, 52, 0, 0, 7); g.fill();
  }
}, "hand" + pose);

function lightboxModel() {
  const g = new THREE.Group(); dyn(g);
  g.add(at(boxMesh(1.05, 1.3, .08, 0xd8dde0), 0, 0, -.04));
  const mats = Array.from({ length: HAND_POSES }, (_, i) => new THREE.MeshBasicMaterial({ map: handTex(i), toneMapped: false }));
  const film = new THREE.Mesh(GEO.plane, mats[0]); film.scale.set(.86, 1.08, 1); film.position.z = .005; g.add(film);
  const glow = sprite(glowTex("rgba(190,215,255,1)"), 1.9, 2.1); glow.material = glow.material.clone(); glow.material.blending = THREE.AdditiveBlending; glow.material.depthWrite = false; glow.material.opacity = .28; glow.position.z = .12; g.add(glow);
  g.add(at(sprite(labelTex("BEFUND: UNAUFFÄLLIG", "#26332d", "#a6e38f"), .95, .16), 0, .82, .06));
  return { g, film, mats, glow };
}
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
    level.handBoxes.push({ ...lb, x: sp[0] + .5, y: sp[1] + .5, pose: 0, seen: false, away: 0, changed: false, flick: 0 });
  }
}
function handTick(dt, time) {
  if (!level.handBoxes) placeHandBoxes();
  for (const b of level.handBoxes) {
    const p = b.g.getWorldPosition(_v3.clone()), d = Math.hypot(b.x - player.x, b.y - player.y);
    const vis = d < 14 && inView(p.x, p.y, p.z, b.x, b.y);
    b.glow.material.opacity = .22 + Math.sin(time * 7 + b.x) * .03 + (b.flick > 0 ? Math.random() * .3 : 0);
    if (b.flick > 0) b.flick -= dt;
    if (vis) {
      if (b.changed) { b.changed = false; b.flick = .6; tone(70, 0, .5, "sine", .04, 50); if (d < 9 && Math.random() < .5) setMsg(["Die Hand auf dem Röntgenbild. War die nicht eben anders?", "Auf dem Leuchtkasten. Die Hand. Sie hat sich bewegt.", "„Befund: unauffällig.“ Die Hand zeigt auf dich.", "Das Röntgenbild ist leer. Nur ein Wischen nach unten. Wo ist die Hand?"][Math.min(3, b.pose === 4 ? 3 : b.pose === 2 ? 2 : Math.floor(Math.random() * 2))], 3.5, true); }
      b.seen = true; b.away = 0; continue;
    }
    if (!b.seen || d > 10) continue;
    b.away += dt;
    if (b.away > 1.4 && !b.changed) { // you looked away. It moves.
      let n = b.pose; while (n === b.pose) n = Math.floor(Math.random() * HAND_POSES);
      if (b.pose !== 4 && Math.random() < .25) n = 4;
      b.pose = n; b.film.material = b.mats[n]; b.changed = true; b.seen = false;
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
  const stand = Math.random() < .35; // some only stand there, half behind the wall
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

// ---------- the clock for both ----------
function creepTick(dt) {
  if (!run || run.mode !== "night" || !level || mode !== "play") return;
  handTick(dt, level.t || 0);
  if (peek && peek.lvl !== level) peek = null;
  if (peek) return peekTick(dt);
  if (run.hour < 1 || nightTruce() || playerSafe() || player.hidden) return;
  if ((run.peekT = (run.peekT ?? 45) - dt) > 0) return;
  run.peekT = startPeek() ? 50 + Math.random() * 45 : 6; // nothing fitting in view: try again soon
}
