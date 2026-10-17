/* Hospital Escape 3D · doors, stairwell, elevators, rooms and the doctors' room. Runs inside buildLevel(). */

const escapeBoardTex = () => canvasTex(512, 288, (g, w, h) => {
  g.fillStyle = "#f6f6f2"; g.fillRect(0, 0, w, h);
  const M = `"Marker Felt","Comic Sans MS",${SF}`;
  g.fillStyle = "#c0322a"; g.font = `800 34px ${M}`; g.fillText("FLUCHT-ZENTRALE", 20, 44);
  g.fillStyle = "#1d2622"; g.font = `600 19px ${M}`;
  ["1. Schlüssel → Dr. KURZ!!", "2. Ortho: 3 Türsteher (Shake?)", "3. Radio: Lampe AUS = unsichtbar", "4. DERMA = Wellness ♥", "5. Keller: Sicherung (Dr. Ewig??)", "6. ZNA: Parkticket", "7. P2 → AUTO → FREIHEIT"].forEach((l, i) => g.fillText(l, 22, 80 + i * 28));
  g.strokeStyle = "#2d3f8f"; g.lineWidth = 3; g.beginPath(); g.moveTo(340, 150); g.lineTo(470, 100); g.stroke();
  g.fillStyle = "#2d3f8f"; g.font = `700 20px ${M}`; g.fillText("Pharma?", 400, 92); g.fillText("Kreuzfahrt??", 380, 196); g.fillText("Amt?!", 430, 240);
  g.fillStyle = "#1f9d55"; g.font = `800 22px ${M}`; g.fillText("Leise. Schleichen.", 300, 270);
}, "escapeboard");
const roomFloorTex = theme => canvasTex(256, 256, (g, w, h) => {
  const base = { radio: "#454a52", cellar: "#7a7c74", derma: "#d8b48c", er: "#d8d2bc", ortho: "#d3dbe2" }[theme] || "#dcd6c4";
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? "0,0,0" : "255,255,255"},${Math.random() * .08})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  g.strokeStyle = "rgba(0,0,0,.12)"; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); }
}, "roomfloor" + theme);

const LOCKED = [
  ["CHEFARZT", "Termine nach Vereinbarung (2031)", "Abgeschlossen. Dahinter hörst du jemanden Golf auf dem Teppich üben."],
  ["CONTROLLING", "Bitte nicht klopfen. Klopfen kostet.", "Abgeschlossen. Ein Zettel: „Jede Klinkenbenutzung wird der Kostenstelle belastet.“"],
  ["QUALITÄTSMANAGEMENT", "nicht besetzt (seit 2016)", "Abgeschlossen. Qualität ist heute nicht im Haus."],
  ["BETTENZENTRALE", "0 freie Betten", "Abgeschlossen. Durchs Schlüsselloch siehst du: ein freies Bett. Du sagst es niemandem."],
  ["SERVERRAUM", "KIS 2003 · bitte nicht atmen", "Es summt. Es riecht nach Lötzinn und Angst. Das KIS hängt. Hörbar."],
  ["PERSONALRAT", "Sprechstunde Do 3:00–3:15", "Abgeschlossen. Die Sprechstunde war vor 14 Stunden."],
  ["PRIVATSTATION", "Nur Privatpatienten (und deren Hunde)", "Abgeschlossen. Drinnen läuft Harfenmusik. Und ein Hund trägt Kittel."],
  ["ARCHIV", "Schlüssel bei Hr. Paragraf (Rente)", "Abgeschlossen. Hr. Paragraf ist seit 2018 in Rente. Der Schlüssel auch."],
];

/* object on the wall of tile (x,y) towards (dx,dy). col = [width along wall, depth into room] in metres adds a player collider. */
function wallPlace(lv, obj, x, y, dx, dy, along = 0, yPos = 0, col) {
  const fx = (x + .5) * S + dx * S / 2, fz = (y + .5) * S + dy * S / 2;
  obj.position.set(fx + (dy ? along : 0), yPos, fz + (dx ? along : 0)); obj.rotation.y = Math.atan2(-dx, -dy); lv.group.add(obj);
  if (col) {
    const [w, d] = col, lx = dy ? fx + along : fz + along;
    if (dx) { const x0 = dx > 0 ? fx - d : fx, z0 = lx - w / 2; addCollider(lv, x0, z0, x0 + d, z0 + w); }
    else { const z0 = dy > 0 ? fz - d : fz, x0 = lx - w / 2; addCollider(lv, x0, z0, x0 + w, z0 + d); }
  }
  return obj;
}
const addCollider = (lv, x0, z0, x1, z1) => lv.colliders.push({ x0: x0 / S, y0: z0 / S, x1: x1 / S, y1: z1 / S });
const freePlace = (lv, obj, X, Z, rot = 0, col) => { obj.position.set(X, obj.position.y, Z); obj.rotation.y = rot; lv.group.add(obj); if (col) addCollider(lv, X - col / 2, Z - col / 2, X + col / 2, Z + col / 2); return obj; };
const dyn = o => { o.userData.dyn = true; return o; };
const wallFaces = tiles => { const f = []; for (const [x, y] of tiles) for (const [dx, dy] of DIRS) if (cell(x + dx, y + dy) === "#") f.push([x, y, dx, dy]); return f; };
const isBorder = (x, y) => x <= 0 || y <= 0 || x >= GW - 1 || y >= GH - 1;

// ---------- regions: corridor / room / safe ----------
function findRegions(lv, orig) {
  const zone = new Uint8Array(GW * GH), regs = [], wallish = "#.dlH^E~";
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const c = orig[y][x]; if ((c !== ":" && c !== "_") || zone[y * GW + x]) continue;
    const tiles = [], q = [[x, y]], safe = c === "_"; zone[y * GW + x] = safe ? 3 : 2;
    while (q.length) {
      const [cx, cy] = q.pop(); tiles.push([cx, cy]);
      for (const [dx, dy] of DIRS) { const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || zone[ny * GW + nx]) continue; const ch = orig[ny][nx]; if (wallish.includes(ch) && ch !== "_") continue; if ((ch === ":" && safe) || (ch === "_" && !safe)) continue; zone[ny * GW + nx] = safe ? 3 : 2; q.push([nx, ny]); }
    }
    regs.push({ tiles, safe });
  }
  for (let i = 0; i < zone.length; i++) if (!zone[i] && !"#^l".includes(orig[(i / GW) | 0][i % GW])) zone[i] = 1;
  for (const r of regs) for (const [x, y] of r.tiles) if (grid[y][x] === "." || grid[y][x] === ":") grid[y][x] = r.safe ? "_" : ":";
  lv.zone = zone;
  return regs;
}
const zoneAt = (lv, x, y) => (x < 0 || y < 0 || x >= GW || y >= GH) ? 0 : lv.zone[y * GW + x];

// ---------- floors ----------
function buildFloors(lv, theme) {
  const geo = new THREE.PlaneGeometry(S, S); geo.rotateX(-Math.PI / 2); lv.perGeo.push(geo);
  const sets = { 1: [], 2: [], 3: [] };
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const c = grid[y][x]; if (c === "#" || c === "^" || c === "l" || (lv.exit && x === lv.exit[0] && y === lv.exit[1])) continue;
    const z = lv.zone[y * GW + x] || 1; sets[z].push([x, y]);
  }
  const glossy = !["cellar", "park", "derma"].includes(theme);
  const ft = floorTex(theme), rt = roomFloorTex(theme), wt = floorTex("derma");
  const mats = {
    1: glossy ? new THREE.MeshPhongMaterial({ map: ft, color: 0xd2d8d4, shininess: 60, specular: 0x2a2a2a }) : new THREE.MeshLambertMaterial({ map: ft, color: 0xe4e4e4 }),
    2: new THREE.MeshPhongMaterial({ map: rt, shininess: 25, specular: 0x1a1a1a }),
    3: new THREE.MeshLambertMaterial({ map: wt }),
  };
  const m4 = new THREE.Matrix4();
  for (const k of [1, 2, 3]) {
    if (!sets[k].length) continue;
    lv.perMat.push(mats[k]);
    const im = new THREE.InstancedMesh(geo, mats[k], sets[k].length);
    sets[k].forEach(([x, y], i) => im.setMatrixAt(i, m4.makeTranslation((x + .5) * S, 0, (y + .5) * S)));
    im.receiveShadow = true; lv.group.add(im);
  }
}

// ---------- doors ----------
function buildDoor(lv, x, y, theme, num, plateText) {
  const axis = cell(x - 1, y) !== "#" && cell(x + 1, y) !== "#" ? "x" : "y", [ax, ay] = axis === "x" ? [1, 0] : [0, 1];
  const zp = zoneAt(lv, x + ax, y + ay), zn = zoneAt(lv, x - ax, y - ay);
  const cs = zp === 1 ? 1 : zn === 1 ? -1 : 1, inner = cs > 0 ? zn : zp, safe = inner === 3;
  const cx = (x + .5) * S, cz = (y + .5) * S, hw = 1.0, wm = lambert(0xffffff, wallTex(theme === "park" ? "ward" : theme === "cellar" ? "radio" : theme));
  const g = lv.group;
  for (const s of [-1, 1]) { const j = new THREE.Mesh(GEO.box, wm); if (axis === "x") { j.scale.set(S, WALL_H, S / 2 - hw); j.position.set(cx, WALL_H / 2, cz + s * (hw + (S / 2 - hw) / 2)); } else { j.scale.set(S / 2 - hw, WALL_H, S); j.position.set(cx + s * (hw + (S / 2 - hw) / 2), WALL_H / 2, cz); } j.receiveShadow = true; g.add(j); }
  const lin = new THREE.Mesh(GEO.box, wm); lin.scale.set(axis === "x" ? S : hw * 2, WALL_H - 2.32, axis === "x" ? hw * 2 : S); lin.position.set(cx, (2.32 + WALL_H) / 2, cz); g.add(lin);
  const color = safe ? "#b8895a" : theme === "radio" ? "#5a6070" : theme === "derma" ? "#d8b48c" : theme === "cellar" ? "#6e6a60" : pick(["#c9b38f", "#9fb7c4", "#d1c7b3", "#b9c9a8"]);
  const frontT = doorTex(num, safe ? "" : plateText, color), backT = doorTex("", "", color), side = lambert(0x8a8f8a);
  const front = lambert(0xffffff, frontT), back = lambert(0xffffff, backT);
  const mats = axis === "x" ? (cs > 0 ? [front, back, side, side, side, side] : [back, front, side, side, side, side]) : (cs > 0 ? [side, side, side, side, front, back] : [side, side, side, side, back, front]);
  const leaf = new THREE.Mesh(GEO.box, mats); leaf.castShadow = true;
  const pivot = dyn(new THREE.Group());
  if (axis === "x") { pivot.position.set(cx + cs * (S / 2 - .1), 0, cz - hw); leaf.scale.set(.06, 2.26, hw * 2 - .04); leaf.position.set(0, 1.14, hw); }
  else { pivot.position.set(cx - hw, 0, cz + cs * (S / 2 - .1)); leaf.scale.set(hw * 2 - .04, 2.26, .06); leaf.position.set(hw, 1.14, 0); }
  pivot.add(leaf);
  // frame on the corridor side
  const fm = lambert(safe ? 0x6f5a46 : 0x6f7a76);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(GEO.box, fm); if (axis === "x") { p.scale.set(.1, 2.36, .1); p.position.set(cx + cs * (S / 2 + .02), 1.18, cz + s * (hw + .02)); } else { p.scale.set(.1, 2.36, .1); p.position.set(cx + s * (hw + .02), 1.18, cz + cs * (S / 2 + .02)); } g.add(p); }
  const top = new THREE.Mesh(GEO.box, fm); top.scale.set(axis === "x" ? .1 : hw * 2 + .14, .1, axis === "x" ? hw * 2 + .14 : .1); top.position.set(axis === "x" ? cx + cs * (S / 2 + .02) : cx, 2.36, axis === "x" ? cz : cz + cs * (S / 2 + .02)); g.add(top);
  g.add(pivot);
  // patient call light above the door: some patients ring. Always.
  if (!safe && theme !== "cellar") {
    if (!lv.callMat) { lv.callMat = new THREE.MeshBasicMaterial({ color: 0xff3020 }); lv.perMat.push(lv.callMat); }
    const ringing = Math.random() < .4, lamp = new THREE.Mesh(GEO.box, ringing ? lv.callMat : lambert(0xe8e4d8)); lamp.scale.set(.16, .1, .16);
    lamp.position.set(axis === "x" ? cx + cs * (S / 2 + .06) : cx + hw + .28, 2.5, axis === "x" ? cz + hw + .28 : cz + cs * (S / 2 + .06)); g.add(lamp);
  }
  const signT = safe ? textTex([lv.nextSafeName ? lv.nextSafeName[0] : "RUHERAUM", lv.nextSafeName ? lv.nextSafeName[1] : ""], "#c9a77a", "#2a1c00", 512, 150, 46) : textTex([num, plateText || ""], "#f6f6ef", "#1d2622", 512, 150, 50);
  const sign = plate(signT, safe ? 1.8 : 1.3, safe ? .52 : .38);
  if (axis === "x") { sign.position.set(cx + cs * (S / 2 + .015), 2.78, cz); sign.rotation.y = cs * Math.PI / 2; } else { sign.position.set(cx, 2.78, cz + cs * (S / 2 + .015)); sign.rotation.y = cs > 0 ? 0 : Math.PI; }
  g.add(sign);
  const d = { x, y, axis, cs, safe, pivot, open: false, ang: 0, target: 0, openAng: axis === "x" ? -cs * Math.PI / 2 * .94 : cs * Math.PI / 2 * .94 };
  lv.doors.push(d); doorMap.set(x + "," + y, d);
  return d;
}
function setDoor(d, open, quiet) {
  if (d.open === open) return;
  d.open = open; d.target = open ? d.openAng : 0; grid[d.y][d.x] = open ? "," : "d"; naviT = 0;
  if (!quiet) sfx.door();
}

// ---------- stairwell (exit) ----------
function buildStairwell(lv, idx, theme) {
  const [x, y] = lv.exit, n = DIRS.find(([dx, dy]) => cell(x + dx, y + dy) !== "#") || [0, 1];
  const g = new THREE.Group(); g.position.set((x + .5) * S, 0, (y + .5) * S); g.rotation.y = Math.atan2(n[0], n[1]);
  const shaftMat = new THREE.MeshLambertMaterial({ color: 0x9aa39e, side: THREE.BackSide }); lv.perMat.push(shaftMat);
  g.add(at(mesh(GEO.box, shaftMat, S, 3.8, S), 0, -1.9, 0));
  const stepMat = lambert(0x9aa3a0), nose = lambert(0xf2c300), steps = 9, d = S / steps;
  for (let i = 0; i < steps; i++) {
    const top = -(i + 1) * .34, z1 = S / 2 - i * d;
    g.add(at(mesh(GEO.box, stepMat, S - .1, 3.8 + top, d), 0, (top - 3.8) / 2, z1 - d / 2));
    g.add(at(mesh(GEO.box, nose, S - .1, .02, .06), 0, top + .01, z1 - .03));
  }
  const rail = lambert(0x3a6f8a), L = Math.hypot(S, steps * .34);
  for (const s of [-1, 1]) { const r = mesh(GEO.cyl, rail, .03, L, .03); r.position.set(s * 1.38, 1 - steps * .34 / 2, 0); r.rotation.x = Math.atan2(-S, -steps * .34) + Math.PI; g.add(r); for (let i = 0; i <= 3; i++) g.add(at(mesh(GEO.cyl, rail, .02, 1, .02), s * 1.38, .5 - i * steps * .34 / 3, S / 2 - i * S / 3)); }
  g.add(at(mesh(GEO.plane, basic(0x050606), S, S, 1), 0, -3.75, 0).rotateX(-Math.PI / 2));
  const next = LEVELS[idx + 1];
  const back = plate(textTex([next ? next.floor + " ↓" : "↓", next ? next.short : ""], "#1f9d55", "#fff", 512, 200, 64), 1.6, .62); back.position.set(0, -1.2, -S / 2 + .02); g.add(back);
  const sign = plate(textTex(["TREPPENHAUS", next ? "↓ " + next.short : ""], "#14a052", "#fff", 512, 150, 56), 1.8, .52); sign.position.set(0, 2.8, S / 2 - .05); g.add(sign);
  lv.group.add(g);
  // fire door that slides open once the mission is done
  const fd = dyn(new THREE.Group()); fd.position.copy(g.position); fd.rotation.copy(g.rotation);
  const fmat = phong(0x8a908c, 50), ftex = lambert(0xffffff, textTex(["BRANDSCHUTZTÜR", "öffnet nach", "erledigter Mission"], "#8a908c", "#1d2622", 256, 200, 26));
  const leaves = [-1, 1].map(s => { const l = new THREE.Mesh(GEO.box, [fmat, fmat, fmat, fmat, ftex, fmat]); l.scale.set(S / 2 - .02, WALL_H - .05, .08); l.position.set(s * (S / 4), (WALL_H - .05) / 2, S / 2 - .06); l.castShadow = true; fd.add(l); return l; });
  lv.group.add(fd);
  lv.fireDoor = { leaves, open: 0 };
  lv.exitGlow = new THREE.PointLight(0x8affb8, .4, 6); lv.exitGlow.position.set((x + .5 + n[0] * .7) * S, 2.2, (y + .5 + n[1] * .7) * S); lv.group.add(lv.exitGlow);
}

// ---------- elevators & locked doors ----------
function buildElevator(lv, x, y, idx) {
  const n = DIRS.find(([dx, dy]) => !solidMove(cell(x + dx, y + dy)) || cell(x + dx, y + dy) === "d"); if (!n) return;
  const [dx, dy] = n, bx = (x + .5 + dx * .5) * S, bz = (y + .5 + dy * .5) * S;
  const g = new THREE.Group(); g.position.set(bx, 0, bz); g.rotation.y = Math.atan2(dx, dy);
  const steel = phong(0x9aa3a8, 80);
  g.add(at(mesh(GEO.box, basic(0x0b0c0c), 1.3, 2.2, .04), 0, 1.1, .005));
  for (const s of [-1, 1]) g.add(at(mesh(GEO.box, steel, .12, 2.36, .1), s * .7, 1.18, .05));
  g.add(at(mesh(GEO.box, steel, 1.52, .14, .1), 0, 2.3, .05));
  const disp = plate(liftTex(LEVELS[idx].floor.replace(". OG", "").replace("EG", "E")), .34, .17); disp.position.set(0, 2.55, .03); g.add(disp);
  g.add(at(mesh(GEO.box, steel, .14, .3, .04), 1.0, 1.2, .02)); g.add(at(mesh(GEO.ball, glowMat(0xf2b33d), .03), 1.0, 1.25, .05)); g.add(at(mesh(GEO.ball, glowMat(0x777777), .03), 1.0, 1.15, .05));
  const s1 = plate(textTex(["AUFZUG"], "#2d3f8f", "#fff", 256, 80, 40), .7, .22); s1.position.set(0, 2.85, .03); g.add(s1);
  const note = plate(stickyTex("Fährt nur|nach Mission!|(DA 12/2019)", "#fff59a"), .28, .28); note.position.set(-1.02, 1.45, .03); note.rotation.z = .06; g.add(note);
  lv.group.add(g);
  const dg = dyn(new THREE.Group()); dg.position.copy(g.position); dg.rotation.copy(g.rotation);
  const leafMat = phong(0xb8bec4, 90);
  const leaves = [-1, 1].map(s => { const l = mesh(GEO.box, leafMat, .64, 2.18, .04); l.position.set(s * .32, 1.09, .045); dg.add(l); return l; });
  lv.group.add(dg);
  lv.props.push({ kind: "lift", x: x + .5 + dx * .8, y: y + .5 + dy * .8, leaves, open: 0 });
}
function buildLocked(lv, x, y, theme, r) {
  for (const [dx, dy] of DIRS) {
    if (solidMove(cell(x + dx, y + dy))) continue;
    const L = LOCKED[Math.floor(r() * LOCKED.length)];
    const g = new THREE.Group();
    g.add(at(plate(doorTex("", L[0].slice(0, 16), "#7a6a5a"), 1.15, 2.2), 0, 1.11, .03));
    const fc = lambert(0x6f7a76);
    for (const s of [-1, 1]) g.add(at(mesh(GEO.box, fc, .08, 2.28, .1), s * .62, 1.14, .04));
    g.add(at(mesh(GEO.box, fc, 1.32, .08, .1), 0, 2.26, .04));
    g.add(at(plate(textTex([L[0], L[1]], "#c0322a", "#fff", 512, 150, 40), 1.3, .38), 0, 2.62, .02));
    wallPlace(lv, g, x + dx, y + dy, -dx, -dy);
    lv.props.push({ kind: "locked", x: x + .5 + dx * .7, y: y + .5 + dy * .7, text: L[2], name: L[0] });
  }
}

// ---------- room furnishing ----------
function decorateRoom(lv, reg, theme, r) {
  const hasBed = reg.tiles.some(([x, y]) => lv.orig[y][x] === "B");
  const kind = theme === "radio" ? "radio" : theme === "cellar" ? "cellar" : theme === "derma" ? "derma" : hasBed || theme === "er" ? "patient" : "office";
  let sink = false, tv = false, n = 0;
  for (const [x, y, dx, dy] of wallFaces(reg.tiles)) {
    if (solidMove(grid[y][x]) || lv.reserved.has(x + "," + y + "," + dx + "," + dy)) continue;
    const v = r();
    if (isBorder(x + dx, y + dy) && v < .3 && kind !== "cellar" && kind !== "radio") { const w = curtainWindow(lv.windowMat); wallPlace(lv, w, x, y, dx, dy, 0, 1.75); lv.windows.push(w); continue; }
    n++;
    if (kind === "patient") {
      if (v < .3) wallPlace(lv, medRail(), x, y, dx, dy, 0, 1.4);
      else if (v < .45) wallPlace(lv, bedsideTable(), x, y, dx, dy, (r() - .5), 0, [.5, .5]);
      else if (v < .55 && !sink) { sink = true; wallPlace(lv, sinkModel(), x, y, dx, dy, 0, 0, [.6, .5]); }
      else if (v < .65 && !tv) { tv = true; wallPlace(lv, wallTV(), x, y, dx, dy, 0, 2.25); }
      else if (v < .75) wallPlace(lv, r() < .6 ? funnyArt(Math.floor(r() * 99)) : framed(paintingTex(), .7, .5, 0x8a6a4a), x, y, dx, dy, 0, 1.6);
      else if (v < .85) { const c = visitorChair(); wallPlace(lv, c, x, y, dx, dy, .6, 0); c.rotation.y += (r() - .5) * .6; }
      else if (v < .92) wallPlace(lv, ivPole(), x, y, dx, dy, -.8, 0);
      else wallPlace(lv, sanitizer(), x, y, dx, dy, 0, 1.3);
    } else if (kind === "office") {
      if (v < .25) wallPlace(lv, binderShelf(1.4, 2), x, y, dx, dy, 0, 0, [1.4, .45]);
      else if (v < .45) wallPlace(lv, workstation([pick([kisTex(), mailTex(), rosterTex(), solitaireTex()])]), x, y, dx, dy, 0, 0, [1.6, .75]);
      else if (v < .55) wallPlace(lv, filingCabinet(), x, y, dx, dy, .6, 0, [.5, .6]);
      else if (v < .63) wallPlace(lv, corkBoard(), x, y, dx, dy, 0, 1.6);
      else if (v < .7) wallPlace(lv, funnyArt(Math.floor(r() * 99)), x, y, dx, dy, 0, 1.65);
      else if (v < .8) wallPlace(lv, livePlant(), x, y, dx, dy, -.8, 0);
      else if (v < .9) wallPlace(lv, chairRow(3, 0x8a6a4a), x, y, dx, dy, 0, 0, [1.5, .45]);
    } else if (kind === "radio") {
      if (v < .35) { const ws = workstation([xrayTex(), xrayTex()]); wallPlace(lv, ws, x, y, dx, dy, 0, 0, [1.6, .75]); }
      else if (v < .55) wallPlace(lv, leadApron(), x, y, dx, dy, 0, 1.75);
      else if (v < .7) wallPlace(lv, filingCabinet(), x, y, dx, dy, 0, 0, [.5, .6]);
      else if (v < .8) { const lb = new THREE.Mesh(GEO.plane, glowMat(0xdfe8f0)); lb.material = new THREE.MeshBasicMaterial({ map: xrayTex() }); lv.perMat.push(lb.material); lb.scale.set(.7, .88, 1); wallPlace(lv, lb, x, y, dx, dy, 0, 1.6); }
    } else if (kind === "cellar") {
      if (v < .35) wallPlace(lv, boxMesh(S * .8, 2.2, .45, 0xffffff, shelfTex()), x, y, dx, dy, 0, 1.1, [S * .8, .45]).position.add(new THREE.Vector3(-dx * .22, 0, -dy * .22));
      else if (v < .55) wallPlace(lv, boxStack(2 + Math.floor(r() * 3)), x, y, dx, dy, (r() - .5), 0, [.7, .6]);
      else if (v < .7) wallPlace(lv, filingCabinet(), x, y, dx, dy, 0, 0, [.5, .6]);
      else if (v < .8) wallPlace(lv, plate(graffitiTex(pick(GRAFFITI)), 2.2, .55, true), x, y, dx, dy, 0, 1.5).position.add(new THREE.Vector3(-dx * .01, 0, -dy * .01));
    } else if (kind === "derma") {
      if (v < .25) wallPlace(lv, livePlant(true), x, y, dx, dy, (r() - .5), 0);
      else if (v < .45) wallPlace(lv, towelRack(), x, y, dx, dy, 0, 1.4);
      else if (v < .6) { const sb = sideboard(1.2); sb.add(at(candles(), 0, .9, 0)); wallPlace(lv, sb, x, y, dx, dy, 0, 0, [1.2, .6]); }
      else if (v < .75) wallPlace(lv, framed(paintingTex(), .9, .65, 0xc9a77a), x, y, dx, dy, 0, 1.6);
      else if (v < .85) wallPlace(lv, chairRow(2, 0xf6c1d4), x, y, dx, dy, 0, 0, [1, .45]);
    }
  }
}
function decorateSafeRoom(lv, reg, theme, r) {
  // pick a wall face away from the door for the sofa
  const faces = wallFaces(reg.tiles).filter(([x, y, dx, dy]) => !solidMove(grid[y][x]) && !DIRS.some(([a, b]) => cell(x + a, y + b) === "d"));
  const f = faces.length ? faces[Math.floor(r() * faces.length)] : wallFaces(reg.tiles)[0]; if (!f) return;
  const [x, y, dx, dy] = f;
  const sofa = new THREE.Group();
  sofa.add(at(boxMesh(1.9, .42, .8, 0x6a4a7a), 0, .25, .42)); sofa.add(at(boxMesh(1.9, .5, .22, 0x5a3a6a), 0, .6, .12)); sofa.add(at(boxMesh(.2, .35, .8, 0x5a3a6a), -.95, .45, .42)); sofa.add(at(boxMesh(.2, .35, .8, 0x5a3a6a), .95, .45, .42));
  sofa.add(at(boxMesh(.5, .12, .4, 0xf2d38a), -.4, .52, .45));
  wallPlace(lv, sofa, x, y, dx, dy, 0, 0, [2, .85]);
  const tbl = grp(at(boxMesh(.8, .05, .5, 0x8a6a4a), 0, .42, 0), at(boxMesh(.7, .4, .4, 0x6a4a3a), 0, .2, 0)); tbl.add(at(mugModel("CHILL", true), .15, .45, 0)); tbl.add(at(paperStack(3), -.2, .45, 0));
  freePlace(lv, tbl, (x + .5) * S - dx * .4, (y + .5) * S - dy * .4, 0, .7);
  lv.group.add(at(mesh(GEO.ball, basic(0xffd890), .18), (x + .5) * S, WALL_H - .35, (y + .5) * S));
  for (const [fx, fy, fdx, fdy] of wallFaces(reg.tiles)) if (!(fx === x && fy === y && fdx === dx && fdy === dy) && r() < .45) wallPlace(lv, r() < .5 ? livePlant() : framed(paintingTex(), .7, .5, 0x8a6a4a), fx, fy, fdx, fdy, (r() - .5) * 1.2, r() < .5 ? 0 : 1.6);
  lv.props.push({ kind: "sofa", x: x + .5 - dx * .15, y: y + .5 - dy * .15, room: reg });
}

// ---------- the doctors' room (level 0) ----------
function decorateDoctorsRoom(lv, reg) {
  const X = t => t * S, P = (o, x, y, z, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; lv.group.add(o); return o; };
  // desk 1: KIS + mail, the computer you can use
  const d1 = workstation([kisTex(), mailTex()]); wallPlace(lv, d1, 1, 3, -1, 0, 0, 0, [1.7, .78]);
  d1.add(at(phoneModel(), .62, .78, .48)); d1.add(at(mugModel("WORLD'S|OKAYEST DOC"), -.66, .78, .52)); d1.add(at(paperStack(9), -.5, .78, .25)); d1.add(at(deskLamp(), .68, .78, .12)); d1.add(at(penCup(), .45, .78, .14));
  [["Feierabend|17:00|(haha)", "#fff59a", -.58], ["PW:|Sommer2019!", "#ff9fd0", .02], ["Dr. Kurz|→ 40 €", "#9fe0ff", .58]].forEach(([t, c, x]) => d1.add(at(plate(stickyTex(t, c), .1, .1), x, 1.3, .26)));
  lv.props.push({ kind: "pc", x: 1.35, y: 3.5 });
  // desk 2: solitaire + roster, the landline
  const d2 = workstation([solitaireTex(), rosterTex()]); wallPlace(lv, d2, 4, 3, 1, 0, 0, 0, [1.7, .78]);
  d2.add(at(phoneModel(), -.62, .78, .48)); d2.add(at(mugModel("BESTER ARZT|2009", true, true), .66, .78, .5)); d2.add(at(paperStack(14), .5, .78, .24)); d2.add(at(deskLamp(false), -.68, .78, .12));
  const printer = grp(at(boxMesh(.45, .22, .36, 0xe8e8e4), 0, .11, 0), at(boxMesh(.3, .01, .2, 0xffffff), 0, .23, .1)); printer.add(at(plate(stickyTex("PAPIER-|STAU|seit Mo", "#fff59a"), .12, .12), 0, .13, .185)); d2.add(at(printer, .3, .78, .5));
  lv.props.push({ kind: "phone", x: 4.65, y: 3.5 });
  // chairs: one broken, one fine, one knocked over
  P(officeChair(true), X(1.62), 0, X(3.45), -Math.PI / 2); addCollider(lv, X(1.45), X(3.3), X(1.8), X(3.6));
  P(officeChair(false, 0x3f4a6a), X(4.4), 0, X(3.55), Math.PI / 2);
  const tipped = officeChair(false, 0x5a3a3a); tipped.rotation.z = Math.PI / 2 - .1; tipped.position.set(X(3.1), .3, X(2.25)); lv.group.add(tipped);
  // on-call bed against the north wall
  const bed = onCallBed(); wallPlace(lv, bed, 2, 1, 0, -1, 0, 0, [1, 2.05]);
  lv.props.push({ kind: "sofa", x: 2.5, y: 1.95, room: reg, bed: true });
  wallPlace(lv, corkBoard(), 1, 1, 0, -1, 0, 1.75);
  wallPlace(lv, binderShelf(1.6, 2.1), 3, 1, 0, -1, 0, 0, [1.6, .45]);
  wallPlace(lv, whiteboard(escapeBoardTex(), 2.3, 1.3), 4, 1, 0, -1, 0, 1.65);
  wallPlace(lv, plate(textTex(["FLUCHT-ZENTRALE"], "#c0322a", "#fff", 512, 90, 50), 1.4, .25), 4, 1, 0, -1, 0, 2.55).position.y = 2.55;
  lv.props.push({ kind: "v", x: 4.5, y: 1.55 });
  // kitchenette on the west wall
  const sb = sideboard(1.7); sb.add(at(coffeeMachine(), -.45, .9, 0)); sb.add(at(microwave(), .4, .9, 0)); sb.add(at(mugModel("NUR|KURZ", false), .02, .9, .35));
  wallPlace(lv, sb, 1, 2, -1, 0, 0, 0, [1.75, .6]);
  lv.props.push({ kind: "brew", x: 1.3, y: 2.35 });
  wallPlace(lv, framed(posterTex({ bg: "#c0322a", t: "FEIERABEND", b: ["ist ein Gerücht.", "— Ihre Verwaltung"], i: "🕔" }), .6, .82, 0x2a2a2a), 1, 2, -1, 0, 0, 1.95);
  // east wall: window, coat rack
  const win = curtainWindow(lv.windowMat); wallPlace(lv, win, 4, 2, 1, 0, 0, 1.75); lv.windows.push(win);
  P(coatRack(), X(4.82), 0, X(1.4)); addCollider(lv, X(4.7), X(1.25), X(5), X(1.55));
  // south wall: calendar, bin, plant, clock above the door
  wallPlace(lv, plate(calendarTex(), .5, .62), 1, 3, 0, 1, .3, 1.6);
  wallPlace(lv, trashBin(true), 2, 3, 0, 1, -.7, 0, [.55, .55]);
  const plant = deadPlant(); wallPlace(lv, plant, 2, 3, 0, 1, .55, 0, [.5, .5]);
  plant.add(at(plate(stickyTex("hat|gekündigt", "#ffffff"), .14, .14), 0, .22, .23));
  const c = dyn(new THREE.Group()); const face = mesh(GEO.disc, lambert(0xffffff, clockTex()), .3, 1, .3); face.rotation.x = Math.PI / 2; c.add(face);
  const hp = new THREE.Group(), mp = new THREE.Group(); hp.add(at(mesh(GEO.box, basic(0x111111), .02, .12, .01), 0, .06, 0)); mp.add(at(mesh(GEO.box, basic(0x111111), .014, .19, .01), 0, .095, 0)); hp.position.z = mp.position.z = .03; c.add(hp, mp);
  wallPlace(lv, c, 3, 3, 0, 1, 0, 2.72); lv.clocks.push({ h: hp, m: mp });
  // more life: fridge with a threat, art, family photo, fan, pizza tower
  const fridge = grp(at(boxMesh(.6, .85, .6, 0xf2f2ee), 0, .43, .3), at(boxMesh(.04, .3, .03, 0x9aa3a0), .24, .55, .61));
  fridge.add(at(plate(stickyTex("MEIN|JOGHURT!|Finger weg", "#ff9fd0"), .16, .16), -.05, .62, .605));
  wallPlace(lv, fridge, 4, 3, 0, 1, -.95, 0, [.62, .62]);
  wallPlace(lv, funnyArt(0), 4, 1, 1, 0, .2, 1.7);
  wallPlace(lv, plate(textTex(["WICHTIGE NUMMERN", "Chef: nie anrufen", "IT: hat Urlaub", "Mama: 0171-…"], "#fffbe6", "#1d2622", 256, 200, 22), .45, .36), 1, 2, -1, 0, -1.05, 1.6);
  d1.add(at(grp(at(boxMesh(.16, .2, .02, 0x3a2a1a), 0, .1, 0), at(plate(paintingTex(), .13, .16), 0, .1, .012)), -.3, .78, .1));
  d1.children[d1.children.length - 1].rotation.x = -.2;
  const fan = grp(at(mesh(GEO.cyl, lambert(0xe8e8e4), .07, .02, .07), 0, .01, 0), at(mesh(GEO.cyl, lambert(0xe8e8e4), .012, .25, .012), 0, .14, 0), at(mesh(GEO.torus, lambert(0xd8d8d4), .12, .12, .2), 0, .32, .02));
  d2.add(at(fan, .05, .78, .15));
  for (let i = 0; i < 4; i++) { const pz = new THREE.Mesh(GEO.box, [lambert(0xd8c29a), lambert(0xd8c29a), lambert(0xffffff, pizzaTex()), lambert(0xd8c29a), lambert(0xd8c29a), lambert(0xd8c29a)]); pz.scale.set(.42, .05, .42); pz.position.set(X(1.18), .03 + i * .05, X(1.15)); pz.rotation.y = i * .25; lv.group.add(pz); }
  // floor clutter
  for (const [px, pz, rot] of [[2.1, 3.1, .4], [2.6, 2.8, 1.2], [3.6, 3.2, 2.2], [2.9, 1.9, .2]]) { const p = mesh(GEO.plane, lambert(0xffffff, paperTex()), .3, .42, 1); p.rotation.set(-Math.PI / 2, 0, rot); p.position.set(X(px), .012, X(pz)); lv.group.add(p); }
  const st = stethoscopeFlat(); st.position.set(X(3.7), .015, X(2.6)); lv.group.add(st);
  lv.group.add(at(mesh(GEO.ball, lambert(0xfbfaf4), .07), X(2.4), .07, X(3.3)));
}

// ---------- career routes: props on the way and the ride home ----------
function routeModel(obj) {
  const g = new THREE.Group();
  if (obj === "fax") {
    g.add(at(boxMesh(.8, .05, .5, 0x8a6a4a), 0, .78, .3)); for (const [x, z] of [[-.35, .1], [.35, .1], [-.35, .5], [.35, .5]]) g.add(at(boxMesh(.04, .78, .04, 0x5a4a3a), x, .39, z));
    g.add(at(boxMesh(.42, .14, .34, 0xd8d4c8), 0, .88, .3)); g.add(at(boxMesh(.3, .01, .2, 0xffffff), 0, .96, .22)); g.add(at(phoneModel(), .25, .8, .38));
    g.add(at(plate(textTex(["FAX", "Befunde bitte faxen", "(Bj. 1994)"], "#f6f6ef", "#1d2622", 256, 140, 30), .5, .27), 0, 1.45, .02));
  } else if (obj === "board" || obj === "ticketboard") {
    const lines = obj === "board" ? ["WARTEZEIT", "14 Std. 20 Min."] : ["AUFGERUFEN: 12", "IHRE NR.: 999"];
    const d = monitorMesh(textTex(lines, "#0b0c0c", "#ff3a2a", 512, 200, 60)); d.scale.set(1.5, .55, .08); d.position.set(0, 2.25, .06); g.add(d);
  } else if (obj === "stamp") {
    g.add(at(boxMesh(.7, .05, .45, 0x6a6f6a), 0, .8, .25)); g.add(at(boxMesh(.6, .76, .4, 0x8a948f), 0, .39, .25));
    g.add(at(mesh(GEO.cyl, lambert(0x2a2a2a), .05, .07, .05), -.1, .86, .25)); g.add(at(mesh(GEO.ball, lambert(0xc0322a), .045), -.1, .95, .25)); g.add(at(boxMesh(.18, .02, .12, 0x2d3f8f), .15, .83, .25));
    g.add(at(plate(textTex(["STEMPEL", "nur mit Formular"], "#2d3f8f", "#fff", 256, 110, 30), .5, .21), 0, 1.4, .02));
  } else if (obj === "meds") {
    g.add(at(boxMesh(.8, .7, .3, 0xf4f4f0), 0, 1.4, .15)); g.add(at(plate(textTex(["MEDIKAMENTE", "abgeschlossen (offen)"], "#1f9d55", "#fff", 256, 110, 28), .7, .3), 0, 1.4, .31));
  }
  const tag = sprite(labelTex(obj === "stamp" ? "🖃 STEMPEL" : obj === "meds" ? "💊 REISETABLETTEN" : "📸 BEWEISFOTO", "#f2b33d", "#2a1c00"), 1.3, .24); tag.position.set(0, 2.8, .4); g.add(tag);
  return g;
}
function buildRouteProps(lv, idx) {
  if (!run || !run.route) return;
  for (const g of ROUTES[run.route].goals) {
    if (g.lvl !== idx || !g.spot || lv.props.some(p => p.goal === g.id)) continue;
    const [x, y] = g.spot, dir = DIRS.find(([dx, dy]) => cell(x + dx, y + dy) === "#"); if (!dir) continue;
    wallPlace(lv, routeModel(g.obj), x, y, dir[0], dir[1]);
    lv.props.push({ kind: g.kind, goal: g.id, x: x + .5 + dir[0] * .2, y: y + .5 + dir[1] * .2 });
  }
}
function vehicleModel(route) {
  const v = ROUTES[route] ? ROUTES[route].vehicle : "car", g = new THREE.Group();
  if (v === "car") g.add(makeCar(0x1f9d55));
  else if (v === "limo") { const c = makeCar(0x111111, true); c.scale.set(1.05, 1, 1.45); g.add(c); const p = makePerson({ skin: SKIN[0], hair: 0xd9b26c, hairStyle: "long", shirt: 0x111111, pants: 0x111111, jacket: 0x111111, acc: "phone", glasses: "sun", mood: "smile" }); p.group.position.set(1.4, 0, .5); p.group.rotation.y = -.6; g.add(p.group); }
  else if (v === "cabrio") { const c = makeCar(0xff7ab8, true); c.children[1].visible = false; g.add(c); g.add(at(boxMesh(1.3, .06, .3, 0xffffff, textTex(["DR. GLATT"], "#ff7ab8", "#fff", 256, 60, 40)), 0, .85, -1.3)); }
  else if (v === "taxi") { g.add(makeCar(0xf2c300, true)); g.add(at(boxMesh(.5, .18, .2, 0xffffff, textTex(["TAXI"], "#111", "#f2c300", 128, 50, 36)), 0, 1.42, -.15)); }
  else if (v === "scooter") {
    g.add(at(boxMesh(.18, .06, .9, 0x111111), 0, .14, 0)); g.add(at(mesh(GEO.cyl, lambert(0x333333), .02, 1, .02), 0, .62, .42)); g.add(at(boxMesh(.5, .03, .03, 0x333333), 0, 1.1, .42));
    for (const z of [-.42, .45]) { const w = mesh(GEO.wheel, lambert(0x1a1a1a), .35, .2, .35); w.rotation.z = Math.PI / 2; w.position.set(0, .1, z); g.add(w); }
    g.add(at(plate(textTex(["DocFlix"], "#ff3fa4", "#fff", 256, 60, 40), .3, .07), .1, .2, 0));
  } else if (v === "bike") {
    for (const z of [-.5, .5]) { const w = mesh(GEO.torus, lambert(0x1a1a1a), .3, .3, .2); w.rotation.y = Math.PI / 2; w.position.set(0, .32, z); g.add(w); }
    const f1 = mesh(GEO.cyl, lambert(0x2d3f8f), .02, 1, .02); f1.rotation.x = Math.PI / 2; f1.position.set(0, .55, 0); g.add(f1);
    g.add(at(mesh(GEO.cyl, lambert(0x2d3f8f), .02, .5, .02), 0, .6, -.2)); g.add(at(boxMesh(.12, .04, .22, 0x111111), 0, .88, -.2)); g.add(at(boxMesh(.45, .03, .03, 0x333333), 0, .98, .45));
    g.add(at(boxMesh(.3, .22, .25, 0x8a6a4a), 0, .85, .62)); g.add(at(plate(textTex(["AMT"], "#2d3f8f", "#fff", 128, 60, 40), .2, .1), 0, .85, .75));
  } else if (v === "bus") {
    const b = new THREE.Mesh(GEO.box, [lambert(0xffffff, textTex(["HAFEN-SHUTTLE · MS SORGENFREI"], "#1f7a8c", "#fff", 512, 100, 34)), lambert(0xffffff, textTex(["HAFEN-SHUTTLE · MS SORGENFREI"], "#1f7a8c", "#fff", 512, 100, 34)), phong(0x1f7a8c), phong(0x1f7a8c), phong(0x1f7a8c), phong(0x1f7a8c)]);
    b.scale.set(2.2, 2.3, 5.4); b.position.y = 1.45; g.add(b);
    for (const [x, z] of [[-1, -1.8], [1, -1.8], [-1, 1.8], [1, 1.8]]) { const w = mesh(GEO.wheel, lambert(0x1a1a1a), 1.2, 1, 1.2); w.rotation.z = Math.PI / 2; w.position.set(x, .35, z); g.add(w); }
  }
  return g;
}
