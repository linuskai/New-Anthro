/* Hospital Escape 3D · level construction. */
let level = null;
function disposeLevel() {
  if (!level) return;
  scene.remove(level.group);
  level.group.traverse(o => { if (o.isSprite) o.material.dispose(); if (o.isInstancedMesh && !Object.values(GEO).includes(o.geometry)) o.geometry.dispose(); });
  for (const t of level.perTex) t.dispose();
  for (const m of level.perMat) m.dispose();
  for (const g of level.perGeo) g.dispose();
}
for (const k in TYPES) TYPES[k].key = k;
const labelFor = (t, done) => labelTex(done || t.label, done ? "#7b8a85" : t.color, done ? "#fff" : (["P", "F", "V", "Z", "g", "I"].includes(t.key) ? "#1d2622" : "#fff"));

function spawnEnemy(lv, type, x, y, r) {
  const t = TYPES[type];
  const e = { type, name: t.who(), x, y, tx: Math.floor(x), ty: Math.floor(y), hx: Math.floor(x), hy: Math.floor(y), yaw: (r ? r() : Math.random()) * 6.28, tyaw: 0,
    state: "idle", aw: 0, stun: 0, pause: r ? r() * 2 : Math.random() * 2, done: false, gone: false, lookT: 0 };
  e.tyaw = e.yaw;
  const g = new THREE.Group();
  const p = makePerson(t.spec()); g.add(p.group); e.person = p; e.persons = [p];
  if (t.group) {
    const a = makePerson({ skin: rnd(SKIN), hair: rnd(HAIR), hairStyle: "short", shirt: 0x3f6f4a, pants: 0x2b2b2b, beard: 0x3a2a1a, jacket: 0x5a4a3a, acc: "phone" });
    a.group.position.set(.6, 0, -.35); g.add(a.group);
    const k = makePerson({ skin: rnd(SKIN), hair: rnd(HAIR), hairStyle: "long", shirt: 0xe26fa0, pants: 0x3a4a6a, build: "kid", scale: .62 });
    k.group.position.set(-.5, 0, -.3); g.add(k.group);
    e.persons.push(a, k);
  }
  if (t.ghost) { e.ghostLight = new THREE.PointLight(0x9fb8ff, .6, 5); e.ghostLight.position.y = 1.4; g.add(e.ghostLight); }
  const top = 1.9 * (p.sp.scale || 1);
  e.label = sprite(labelFor(t), 1.3, .25); e.label.position.y = top + .55; g.add(e.label);
  e.tri = triMesh(TRI_MAT.idle); e.tri.position.y = top + .22; g.add(e.tri);
  e.mesh = g; lv.group.add(g);
  if (t.cone) {
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xe2483d, transparent: true, opacity: .18, depthWrite: false, side: THREE.DoubleSide });
    const spread = Math.acos(t.fov), geo = new THREE.CircleGeometry(1, 20, -spread, spread * 2); geo.rotateX(-Math.PI / 2);
    e.cone = new THREE.Mesh(geo, coneMat); e.cone.position.y = .03; lv.group.add(e.cone); lv.perMat.push(coneMat); lv.perGeo.push(geo);
  }
  lv.enemies.push(e);
  return e;
}

function buildLevel(idx) {
  disposeLevel();
  const L = LEVELS[idx], env = ENV[L.env], theme = env.theme;
  grid = L.map.map(r => r.split("")); GW = grid[0].length; GH = grid.length;
  const group = new THREE.Group();
  const lv = { idx, group, enemies: [], friends: [], items: [], papers: [], transports: [], props: [], hazards: [], flickers: [], secrets: [], spawns: [], drips: [], clocks: [], windows: [], safeRooms: [],
    exit: null, start: null, reaSpot: null, doors: [], colliders: [], reserved: new Set(), orig: L.map, perTex: [], perMat: [], perGeo: [], visited: new Uint8Array(GW * GH), dark: new Uint8Array(GW * GH), t: 0, spawnT: 6 };
  level = lv; doorMap = new Map();
  const r = rng(idx * 97 + 11);
  ghostMat = new THREE.MeshLambertMaterial({ color: 0xe8eeff, transparent: true, opacity: .45, emissive: 0x334466 }); lv.perMat.push(ghostMat);
  const occupied = new Set(), mark = (x, y) => occupied.add(x + "," + y);

  const pending = [];
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const ch = grid[y][x], clear = () => { grid[y][x] = "."; };
    if (ch !== "." && ch !== "#") mark(x, y);
    if (ch === "S") { lv.start = [x, y]; clear(); }
    else if (ch === "E") { lv.exit = [x, y]; clear(); }
    else if (ch === "r") { lv.reaSpot = [x, y]; clear(); }
    else if (ch === "v" && idx === 0) { lv.board = [x, y]; clear(); }
    else if (ch === "~") { lv.spawns.push([x, y]); clear(); }
    else if (ch === "q") { lv.transports.push({ x: x + .5, y: y + .5, car: true }); clear(); }
    else if (TYPES[ch]) { pending.push([ch, x, y]); if (ch !== "U") clear(); }
    else if (FRIENDS[ch]) { lv.friends.push({ kind: ch, x: x + .5, y: y + .5, talked: 0 }); clear(); }
    else if (ITEMS[ch]) { lv.items.push({ kind: ch, x, y, taken: false }); clear(); }
    else if (ch === "x") { lv.papers.push({ x: x + .5 + (r() < .5 ? -.3 : .3), y: y + .5 + (r() < .5 ? -.3 : .3), taken: false }); clear(); }
  }

  // regions: corridors, rooms, safe rooms
  const regs = findRegions(lv, L.map);
  let si = 0;
  for (const rg of regs) if (rg.safe) { rg.name = (L.safeNames && L.safeNames[si]) || SAFE_NAMES[(idx + si) % SAFE_NAMES.length]; rg.rested = false; si++; }
  lv.safeRooms = regs.filter(rg => rg.safe); lv.rooms = regs.filter(rg => !rg.safe);
  const regionOf = (x, y) => regs.find(rg => rg.tiles.some(([a, b]) => a === x && b === y));

  // floor & ceiling
  buildFloors(lv, theme);
  const ct = ceilTex(theme); ct.wrapS = ct.wrapT = THREE.RepeatWrapping; ct.repeat.set(GW * 2, GH * 2);
  const ceilMat = new THREE.MeshLambertMaterial({ map: ct });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(GW * S, GH * S), ceilMat);
  ceil.rotation.x = Math.PI / 2; ceil.position.set(GW * S / 2, WALL_H, GH * S / 2); group.add(ceil);
  lv.perMat.push(ceilMat); lv.perGeo.push(ceil.geometry);

  // walls
  const walls = [];
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (grid[y][x] === "#") walls.push([x, y]);
  const wallMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(S, WALL_H, S), lambert(0xffffff, wallTex(theme)), walls.length);
  const m4 = new THREE.Matrix4(), q4 = new THREE.Matrix4();
  walls.forEach(([x, y], i) => wallMesh.setMatrixAt(i, m4.makeTranslation(x * S + S / 2, WALL_H / 2, y * S + S / 2)));
  wallMesh.receiveShadow = true; group.add(wallMesh);

  // wall faces → handrails + skirting (instanced)
  const faces = [];
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    if ("#Hdl^,".includes(grid[y][x]) || (lv.exit && x === lv.exit[0] && y === lv.exit[1])) continue;
    for (const [dx, dy] of DIRS) if (cell(x + dx, y + dy) === "#") faces.push([x, y, dx, dy]);
  }
  const railTheme = ["ward", "ortho", "er", "radio"].includes(theme);
  const rail = new THREE.InstancedMesh(GEO.box, lambert(theme === "radio" ? 0x55595f : 0xb08a62), faces.length);
  const skirt = new THREE.InstancedMesh(GEO.box, lambert(theme === "derma" ? 0x7a5a3a : 0x4f5a55), faces.length);
  const railFaces = faces.filter(([x, y]) => lv.zone[y * GW + x] === 1);
  rail.count = 0;
  railFaces.forEach(([x, y, dx, dy], i) => { const th = Math.atan2(-dx, -dy), cx = (x + .5) * S + dx * (S / 2 - .05), cz = (y + .5) * S + dy * (S / 2 - .05); rail.setMatrixAt(i, q4.makeRotationY(th).multiply(m4.makeScale(S * .96, .06, .07)).setPosition(cx, 1.0, cz)); rail.count = i + 1; });
  faces.forEach(([x, y, dx, dy], i) => {
    const th = Math.atan2(-dx, -dy), cx = (x + .5) * S + dx * (S / 2 - .05), cz = (y + .5) * S + dy * (S / 2 - .05);
    skirt.setMatrixAt(i, q4.makeRotationY(th).multiply(m4.makeScale(S, .12, .03)).setPosition((x + .5) * S + dx * (S / 2 - .015), .06, (y + .5) * S + dy * (S / 2 - .015)));
  });
  if (railTheme) group.add(rail);
  group.add(skirt);

  // secret doors
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (grid[y][x] === "H") {
    const g = new THREE.Group();
    g.add(at(boxMesh(S, WALL_H, S, 0xffffff, wallTex(theme)), 0, WALL_H / 2, 0));
    const sm = lambert(0xffffff, textTex(["ZUTRITT VERBOTEN", "Lager · seit 2015 vergessen"], "#7b8a85", "#fff", 256, 96, 24));
    for (const [dx, dy] of DIRS) if (openTile(x + dx, y + dy)) { const s = new THREE.Mesh(GEO.plane, sm); s.scale.set(1.2, .45, 1); s.position.set(dx * (S / 2 + .02), 1.7, dy * (S / 2 + .02)); s.rotation.y = Math.atan2(dx, dy); g.add(s); }
    g.position.set(x * S + S / 2, 0, y * S + S / 2); group.add(g); lv.secrets.push({ x, y, mesh: g });
  }

  // creepy zones: dark flickering stretches
  const floorTiles = [];
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (grid[y][x] === "." && Math.abs(x - lv.start[0]) + Math.abs(y - lv.start[1]) > 4) floorTiles.push([x, y]);
  for (let z = 0; z < env.creep && floorTiles.length; z++) {
    const [sx, sy] = floorTiles[Math.floor(r() * floorTiles.length)];
    const q = [[sx, sy, 0]]; lv.dark[sy * GW + sx] = 1;
    while (q.length) { const [cx, cy, d] = q.shift(); if (d >= 2) continue; for (const [dx, dy] of DIRS) { const nx = cx + dx, ny = cy + dy; if (cell(nx, ny) === "." && !lv.dark[ny * GW + nx]) { lv.dark[ny * GW + nx] = 1; q.push([nx, ny, d + 1]); } } }
  }
  if (env.dark) lv.dark.fill(1);
  for (let i = 0; i < lv.dark.length; i++) if (grid[(i / GW) | 0][i % GW] === "_") lv.dark[i] = 0;

  // lamps
  const panelsOk = [], panelsBroken = [];
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    if ("#Hdl^,".includes(grid[y][x]) || (x + y) % 2) continue;
    const v = r(), creepy = lv.dark[y * GW + x] && !env.dark;
    if (creepy || v < env.flicker) lv.flickers.push({ x, y, a: 3 + r() * 20, b: 1 + r() * 9, p: r() * 10, th: creepy ? .6 + r() * .6 : .2 + r() * .9, on: true, creepy, tint: creepy ? pick([0xff6a5a, 0x8affb0, 0xfdfdf6]) : env.lamp });
    else if (v < env.flicker + env.broken) panelsBroken.push([x, y]);
    else panelsOk.push([x, y]);
  }
  lv.panelMat = new THREE.MeshBasicMaterial({ color: env.lamp }); lv.perMat.push(lv.panelMat);
  const panelGeo = new THREE.BoxGeometry(1.4, .05, .7); lv.perGeo.push(panelGeo);
  const panels = new THREE.InstancedMesh(panelGeo, lv.panelMat, Math.max(1, panelsOk.length));
  panelsOk.forEach(([x, y], i) => panels.setMatrixAt(i, m4.makeTranslation(x * S + S / 2, WALL_H - .03, y * S + S / 2)));
  panels.count = panelsOk.length; group.add(panels);
  const frameGeo = new THREE.BoxGeometry(1.5, .04, .8); lv.perGeo.push(frameGeo);
  const frames = new THREE.InstancedMesh(frameGeo, lambert(0x9aa3a0), panelsOk.length + lv.flickers.length || 1);
  [...panelsOk, ...lv.flickers.map(f => [f.x, f.y])].forEach(([x, y], i) => frames.setMatrixAt(i, m4.makeTranslation(x * S + S / 2, WALL_H - .015, y * S + S / 2)));
  group.add(frames);
  const brokenMat = lambert(0x3a3e3b);
  for (const [x, y] of panelsBroken) {
    const p = new THREE.Mesh(panelGeo, brokenMat); p.position.set(x * S + S / 2 + .3, WALL_H - .45, y * S + S / 2); p.rotation.z = .55; p.rotation.y = r() * 3; group.add(p);
    group.add(at(new THREE.Mesh(GEO.cable, lambert(0x111111)), x * S + S / 2 - .3, WALL_H - .6, y * S + S / 2));
    group.add(at(boxMesh(1.4, .02, .7, 0x0a0a0a), x * S + S / 2, WALL_H - .01, y * S + S / 2));
    if (r() < .4 && !env.dark) group.add(at(sprite(labelTex("LAMPE EINGESPART", "#f2c300", "#222"), 1.2, .2), x * S + S / 2, WALL_H - .9, y * S + S / 2));
  }
  for (const f of lv.flickers) { f.mat = new THREE.MeshBasicMaterial({ color: f.tint }); lv.perMat.push(f.mat); f.mesh = new THREE.Mesh(panelGeo, f.mat); f.mesh.position.set(f.x * S + S / 2, WALL_H - .03, f.y * S + S / 2); group.add(f.mesh); }
  // ceiling vents
  const vents = [];
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (grid[y][x] !== "#" && (x + y) % 2 && r() < .35) vents.push([x, y]);
  if (vents.length && theme !== "park") { const vm = new THREE.InstancedMesh(GEO.box, lambert(0xb9c1bc, ductTex()), vents.length); vents.forEach(([x, y], i) => vm.setMatrixAt(i, m4.makeScale(.6, .03, .6).setPosition(x * S + S / 2 + .6, WALL_H - .015, y * S + S / 2 - .5))); group.add(vm); }

  // doors, stairwell, elevators, locked doors
  const windowMat = new THREE.MeshBasicMaterial({ map: nightTex(), color: 0x8a9ab0 }); lv.perMat.push(windowMat); lv.windowMat = windowMat;
  const plates = { cellar: ["Pathologie", "Archiv 1987–1994", "Kühlraum", "Heizung", "Technik", "Bettenlager"], radio: ["CT", "MRT", "Befundung", "Röntgen 2 (defekt)", "Dunkelkammer", "Kontrastmittel"],
    derma: ["Sauna", "Ruheraum", "Cremeraum", "Praxis Dr. Glatt", "Lounge", "Botox (privat)"], ortho: ["Kraftraum", "Gipsraum", "Umkleide", "Sprechstunde", "Röntgen-Demo", "Hammer-Ausgabe"],
    er: ["Schockraum", "Gips", "Isolation", "Personalraum", "Wartezimmer 2", "Kaffee (leer)"] }[theme] || ["3 Betten", "2 Betten", "Arztzimmer", "Umkleide", "Isolierung!", "Stationsküche", "Lager", "Besprechung"];
  let roomNo = 1;
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const ch = grid[y][x];
    if (ch === "d") {
      const inner = DIRS.map(([dx, dy]) => regionOf(x + dx, y + dy)).find(Boolean);
      lv.nextSafeName = inner && inner.safe ? inner.name : null;
      buildDoor(lv, x, y, theme, (L.room ? L.room + "." : "0.") + String(roomNo).padStart(2, "0"), plates[(roomNo - 1) % plates.length]); roomNo++;
    } else if (ch === "l") buildLocked(lv, x, y, theme, r);
    else if (ch === "^") buildElevator(lv, x, y, idx);
  }
  if (lv.exit) buildStairwell(lv, idx, theme);

  // corridor walls
  let special = 0;
  for (const [x, y, dx, dy] of faces) {
    if (lv.zone[y * GW + x] !== 1) continue;
    if (solidMove(grid[y][x]) && grid[y][x] !== "U") continue;
    const theta = Math.atan2(-dx, -dy);
    const cx = (x + .5) * S + dx * (S / 2 - .02), cz = (y + .5) * S + dy * (S / 2 - .02);
    const place = (obj, yPos, inset = 0, along = 0) => { obj.position.set(cx - dx * inset + (dy !== 0 ? along : 0), yPos, cz - dy * inset + (dx !== 0 ? along : 0)); obj.rotation.y = theta; group.add(obj); return obj; };
    const planeM = (map, w, h, yy, inset = 0, transparent, along = 0) => { const mat = transparent ? new THREE.MeshLambertMaterial({ map, transparent: true }) : lambert(0xffffff, map); if (transparent) lv.perMat.push(mat); const m = new THREE.Mesh(GEO.plane, mat); m.scale.set(w, h, 1); return place(m, yy, inset, along); };
    const v = r();
    if (isBorder(x + dx, y + dy) && v < .22 && env.storm !== undefined && theme !== "radio") {
      const w = curtainWindow(windowMat); w.children.slice(3).forEach(c => w.remove(c)); place(w, 1.75, .01); lv.windows.push(w); continue;
    }
    if (theme === "cellar") {
      if (v < .18) place(boxMesh(S * .8, 2.2, .45, 0xffffff, shelfTex()), 1.1, .25);
      else if (v < .3) planeM(graffitiTex(pick(GRAFFITI)), 2.2, .55, 1.2 + r() * .8, .01, true);
      else if (v < .4) planeM(crackTex(), 1.4, 1.4, .8 + r() * 1.5, .01, true);
      else if (v < .46) place(boxStack(2), 0, 0, (r() - .5));
      else if (v < .5) place(fireHose(), 1.3, 0);
      continue;
    }
    if (theme === "park") {
      if (v < .12) planeM(textTex(["P2", "Personal"], "#2d3f8f", "#fff", 256, 128, 50), 1, .5, 2.4);
      else if (v < .2) planeM(textTex(["ÄRZTEPARKPLÄTZE", "gestrichen 2022", "(Kostenoptimierung)"], "#c0322a", "#fff", 384, 160, 34), 1.5, .62, 1.9);
      else if (v < .26) planeM(textTex(["PARKEN 12 €/STD", "auch für Personal"], "#f2c300", "#222", 384, 128, 34), 1.4, .45, 1.8);
      else if (v < .32) planeM(graffitiTex(pick(["Wer liest das? Geh heim.", "Budget: 0 €", "NUR KURZ"])), 2.2, .55, 1.3, .01, true);
      continue;
    }
    if (v < .1) { const p = theme === "derma" ? { bg: "#e26fa0", t: "SELF CARE", b: ["Creme ist", "Medizin.", "— Dr. Glatt"], i: "🧖" } : theme === "radio" && r() < .5 ? POSTERS[6] : pick(POSTERS); place(framed(posterTex(p), .72, 1.0, 0x2a2a2a), 1.65); }
    else if (v < .17 && theme !== "radio" && theme !== "derma") place(chairRow(3, theme === "er" ? 0xc0322a : 0x2b7bb9), 0, 0, (r() - .5) * .6);
    else if (v < .2) { const ext = mesh(GEO.cyl, lambert(0xd42b2b), .11, .55, .11); place(ext, .45, .18); place(mesh(GEO.box, lambert(0x222222), .2, .05, .05), .76, .18); }
    else if (v < .24) { place(sanitizer(), 1.25); planeM(textTex(["20 ct"], "#f2c300", "#222", 128, 64, 34), .16, .08, 1.45, .01); }
    else if (v < .27) planeM(ductTex(), 1.1, .14, .9 + r() * 1.4, .01);
    else if (v < .3) {
      const c = dyn(new THREE.Group()); const face = mesh(GEO.disc, lambert(0xffffff, clockTex()), .32, 1, .32); face.rotation.x = Math.PI / 2; c.add(face);
      const hh = mesh(GEO.box, basic(0x111111), .02, .13, .01), mh = mesh(GEO.box, basic(0x111111), .014, .2, .01);
      const hp = new THREE.Group(), mp = new THREE.Group(); hh.position.y = .065; mh.position.y = .1; hp.add(hh); mp.add(mh); hp.position.z = mp.position.z = .03; c.add(hp, mp);
      place(c, 2.35, .03); lv.clocks.push({ h: hp, m: mp });
    }
    else if (v < .33) place(aedBox(), 1.4);
    else if (v < .36 && theme !== "derma") place(fireHose(), 1.3);
    else if (v < .4) place(noticeBoard(pick([["HÄNDE", "DESINFIZIEREN", "30 Sekunden!"], ["BESUCHSZEIT", "15–18 Uhr", "(theoretisch)"], ["BITTE", "NICHT KLINGELN", "wir kommen eh nicht"], ["QUALITÄTS-", "OFFENSIVE 2026", "(abgesagt)"], ["RAUCHEN", "VERBOTEN", "(auch Burnout)"]])), 1.55);
    else if (v < .43 && theme !== "radio") place(wheelchair(), 0, .45, (r() - .5) * .8).rotation.y += (r() - .5) * .8;
    else if (v < .45 && special < 2 && theme !== "derma") { special++; planeM(textTex(["AUFZUG B", "defekt seit 2019", "Treppe ist gesund!"], "#7b8a85", "#fff", 256, 320, 40), 1.6, 2.2, 1.1); }
    else if (v < .49 && theme !== "derma") planeM(crackTex(), 1.2, 1.2, 1 + r(), .01, true);
    else if (v < .52 && theme === "radio") { const lb = new THREE.Mesh(GEO.plane, new THREE.MeshBasicMaterial({ map: xrayTex() })); lv.perMat.push(lb.material); lb.scale.set(.7, .88, 1); place(lb, 1.6); }
    else if (v < .56 && theme === "derma") place(livePlant(true), 0, .35);
    else if (v < .58 && theme !== "radio") place(livePlant(), 0, .3);
  }
  // waiting room chairs in the emergency department
  if (theme === "er") for (const [x, y] of [[2, 3], [5, 3], [8, 3], [2, 5], [6, 6]]) if (grid[y] && grid[y][x] === ".") { const row = chairRow(4, 0xc0322a); row.rotation.y = Math.PI; row.position.set((x + .5) * S, 0, (y + .5) * S); group.add(row); addCollider(lv, (x + .5) * S - 1, (y + .5) * S - .3, (x + .5) * S + 1, (y + .5) * S + .3); }
  // rooms and safe rooms
  for (const rg of lv.rooms) decorateRoom(lv, rg, theme, r);
  for (const rg of lv.safeRooms) {
    if (idx === 0 && rg.tiles.some(([a, b]) => a === lv.start[0] && b === lv.start[1])) decorateDoctorsRoom(lv, rg);
    else decorateSafeRoom(lv, rg, theme, r);
  }

  // pipes
  if (theme === "cellar" || theme === "park") {
    const pipeMat = lambert(theme === "park" ? 0x8a6a3a : 0x5f6b70);
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      if (grid[y][x] === "#" || (x + y) % 3) continue;
      const horiz = openTile(x - 1, y) || openTile(x + 1, y);
      const p = new THREE.Mesh(GEO.pipe, pipeMat); p.position.set((x + .5) * S + (horiz ? 0 : .9), WALL_H - .25, (y + .5) * S + (horiz ? .9 : 0)); p.rotation.set(horiz ? 0 : Math.PI / 2, 0, horiz ? Math.PI / 2 : 0); group.add(p);
    }
  }
  if (theme === "park") {
    const lineMat = basic(0xe8e4d0);
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (grid[y][x] === "a" || grid[y][x] === "j") for (const s of [-1, 1]) { const l = new THREE.Mesh(GEO.plane, lineMat); l.rotation.x = -Math.PI / 2; l.scale.set(.08, S * .9, 1); l.position.set((x + .5) * S + s * S * .48, .012, (y + .5) * S); group.add(l); }
  }

  // props & hazards
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const ch = grid[y][x], wx = (x + .5) * S, wz = (y + .5) * S, alongZ = openTile(x, y - 1) || openTile(x, y + 1);
    if (ch === "B") {
      const g = new THREE.Group();
      g.add(at(boxMesh(1.05, .1, 2.1, 0x8a948f), 0, .5, 0)); g.add(at(boxMesh(1, .18, 2, 0xf6f8f7), 0, .64, 0));
      g.add(at(boxMesh(1.02, .1, 1.25, 0x6aa1d6), 0, .76, .35)); g.add(at(boxMesh(.7, .12, .4, 0xffffff), 0, .79, -.72)); g.add(at(boxMesh(1.05, .5, .06, 0x7d8783), 0, .85, -1.03));
      for (const [lx, lz] of [[-.45, -.9], [.45, -.9], [-.45, .9], [.45, .9]]) { g.add(at(boxMesh(.06, .45, .06, 0x5c6662), lx, .23, lz)); g.add(at(mesh(GEO.ball, lambert(0x222222), .05), lx, .05, lz)); }
      const pat = makePerson({ skin: rnd(SKIN), hair: rnd(HAIR), hairStyle: "messy", gown: true, shirt: 0x9cc6e6, noShadow: true });
      pat.group.rotation.x = -Math.PI / 2; pat.group.position.set(0, .78, .95); g.add(pat.group);
      g.add(at(sprite(labelTex(idx === 2 ? "CT-LIEGE" : "FLURBETT " + (7 + Math.floor(r() * 20)) + " VON 23", "#7b8a85", "#fff"), 1.4, .22), 0, 1.6, 0));
      g.position.set(wx, 0, wz); g.rotation.y = alongZ ? 0 : Math.PI / 2; group.add(g);
    } else if (ch === "T") {
      group.add(at(boxMesh(S * .9, .06, S * .5, 0xeeeae0), wx, 1.03, wz)); group.add(at(boxMesh(S * .88, .98, S * .46, 0xc9b38f), wx, .5, wz));
      const mon = monitorMesh(idx === 0 ? pcTex() : screenTex()); mon.scale.set(.6, .42, .05); mon.position.set(wx + (idx === 0 ? 0 : r() - .5), 1.32, wz); group.add(mon);
      group.add(at(boxMesh(.08, .14, .08, 0x333333), mon.position.x, 1.1, wz)); group.add(at(boxMesh(.5, .02, .18, 0x2b2b2b), mon.position.x, 1.07, wz + .3));
      for (let i = 0; i < 5; i++) { const pp = boxMesh(.3, .04, .42, 0xfbfaf4); pp.position.set(wx - .8, 1.08 + i * .045, wz + .05); pp.rotation.y = r() * .4; group.add(pp); }
      group.add(at(mesh(GEO.cyl, lambert(0xf2f2ee), .045, .1, .045), wx + .85, 1.11, wz - .2));
      if (!lv.deskSign) { lv.deskSign = true; group.add(at(sprite(textTex([idx === 0 ? "ARZTZIMMER" : "STATIONSZIMMER", idx === 0 ? "Bitte nicht stören (stört trotzdem jeder)" : "Bitte klingeln (bringt nichts)"], "#2b7bb9", "#fff", 512, 140, 46), 2.3, .63), wx, 2.7, wz)); }
    } else if (ch === "v") {
      group.add(at(boxMesh(.12, 1.4, S * .8, 0xffffff, boardTex()), wx, 1.5, wz));
      lv.props.push({ kind: "v", x: x + .5, y: y + .5 });
    } else if (ch === "M") { group.add(at(boxMesh(1.3, 2.1, .9, 0xffffff, vendTex()), wx, 1.05, wz)); lv.props.push({ kind: "M", x: x + .5, y: y + .5, uses: 0 }); }
    else if (ch === "L") { group.add(at(boxMesh(1.3, 2.1, .7, 0xffffff, lockerTex()), wx, 1.05, wz)); lv.props.push({ kind: "L", x: x + .5, y: y + .5 }); }
    else if (ch === "G") { group.add(at(boxMesh(.9, 1.2, .5, 0xffffff, fuseTex()), wx, 1.3, wz)); lv.props.push({ kind: "G", x: x + .5, y: y + .5 }); }
    else if (ch === "t") { group.add(at(boxMesh(.9, 1.7, .6, 0xffffff, machineTex()), wx, .85, wz)); lv.props.push({ kind: "t", x: x + .5, y: y + .5 }); group.add(at(sprite(labelTex("PARKTICKET", "#2b4a7a", "#fff"), 1.2, .22), wx, 2.1, wz)); }
    else if (ch === "m") {
      const ring = mesh(GEO.mrt, lambert(0xe8ecef), 1); ring.position.set(wx, 1.35, wz); ring.rotation.y = Math.PI / 2; group.add(ring);
      group.add(at(boxMesh(.7, .5, 2.6, 0xd8dde2), wx, .5, wz));
      group.add(at(sprite(labelTex("MRT · 3 TESLA · KEIN METALL!", "#7a0f0f", "#fff"), 2.2, .3), wx, 2.8, wz));
      lv.mrt = [x + .5, y + .5];
    } else if (ch === "W") {
      const g = new THREE.Group();
      g.add(at(boxMesh(.9, .35, 2.2, 0xf6efe6), 0, .3, 0)); g.add(at(boxMesh(.85, .12, 1.4, 0xf6c1d4), 0, .53, .3)); g.add(at(boxMesh(.8, .4, .5, 0xf6efe6), 0, .62, -.85));
      g.add(at(mesh(GEO.cyl, lambert(0x7fbf5a), .08, .02, .08), .2, .62, .9));
      g.add(at(sprite(labelTex("WELLNESS-LIEGE", "#e26fa0", "#fff"), 1.3, .22), 0, 1.4, 0));
      g.position.set(wx, 0, wz); g.rotation.y = alongZ ? 0 : Math.PI / 2; group.add(g);
      lv.props.push({ kind: "W", x: x + .5, y: y + .5, used: false });
    } else if (ch === "a" || ch === "j") {
      const g = makeCar(ch === "j" ? 0x1f9d55 : pick([0xc0322a, 0x2d3f8f, 0xd8d8d8, 0x333333, 0xe8a33a, 0x5a7a8a]));
      g.position.set(wx, 0, wz); g.rotation.y = r() < .5 ? 0 : Math.PI; group.add(g);
      if (ch === "j") { group.add(at(sprite(labelTex("DEIN AUTO", "#1f9d55", "#fff"), 1.4, .26), wx, 2.2, wz)); lv.props.push({ kind: "j", x: x + .5, y: y + .5 }); }
    } else if (ch === "=") {
      group.add(at(boxMesh(.35, 1.1, .35, 0xf2c300), wx - 1.2, .55, wz));
      const arm = new THREE.Group(); arm.position.set(wx - 1.2, 1.0, wz);
      const bar = boxMesh(2.6, .1, .1, 0xffffff, tapeTex()); bar.position.x = 1.3; arm.add(bar); group.add(arm);
      group.add(at(sprite(labelTex("NUR MIT TICKET", "#c0322a", "#fff"), 1.3, .22), wx, 1.8, wz));
      lv.props.push({ kind: "=", x: x + .5, y: y + .5, arm });
    } else if (ch === "Y") {
      const g = new THREE.Group();
      g.add(at(boxMesh(.9, .08, 2, 0xb9c1bc), 0, .85, 0));
      for (const [lx, lz] of [[-.38, -.85], [.38, -.85], [-.38, .85], [.38, .85]]) g.add(at(boxMesh(.05, .85, .05, 0x8a948f), lx, .42, lz));
      g.add(at(boxMesh(.7, .28, 1.75, 0xf2f2ee), 0, 1.02, 0)); g.add(at(mesh(GEO.ball, lambert(0xf2f2ee), .2), 0, 1.12, -.8));
      g.add(at(mesh(GEO.box, lambert(0xd8c8a0), .1, .14, .05), .1, 1.1, 1.0));
      g.add(at(sprite(labelTex("ZEHENZETTEL: „NUR KURZ“", "#e8e4d0", "#333"), 1.3, .16), 0, 1.45, 1.0));
      g.position.set(wx, 0, wz); g.rotation.y = alongZ ? 0 : Math.PI / 2; group.add(g);
    } else if (ch === "X") {
      const g = new THREE.Group();
      for (let i = 0; i < 7; i++) { const b = boxMesh(.4 + r() * .8, .3 + r() * .6, .4 + r() * .8, pick([0x8e918b, 0x6d706a, 0xa9a49a, 0x3a3e3b])); b.position.set((r() - .5) * 2, b.scale.y / 2 + r() * .3, (r() - .5) * 2); b.rotation.set(r(), r() * 3, r()); g.add(b); }
      const slab = boxMesh(2.6, .08, 1.2, 0xd7d9d4); slab.position.set(0, 1.4, 0); slab.rotation.set(.2, r() * 3, .7); g.add(slab);
      const tapeMat = lambert(0xffffff, tapeTex());
      for (const [dx, dy] of DIRS) if (openTile(x + dx, y + dy)) { const t = new THREE.Mesh(GEO.plane, tapeMat); t.scale.set(S, .18, 1); t.position.set(dx * 1.2, 1.0, dy * 1.2); t.rotation.y = Math.atan2(dx, dy); g.add(t); }
      g.add(at(sprite(labelTex("BAUSTELLE · SEIT 2021", "#f2c300", "#222"), 1.6, .26), 0, 2.2, 0));
      g.position.set(wx, 0, wz); group.add(g);
    } else if (ch === "w") {
      group.add(at(boxMesh(1.2, 1.0, 1.7, 0xffffff, laundryTex()), wx, .62, wz)); group.add(at(boxMesh(1.1, .2, 1.6, 0xf2f2ee), wx, 1.18, wz));
      group.add(at(sprite(labelTex("WÄSCHEWAGEN", "#3f6fb3", "#fff"), 1.2, .2), wx, 1.75, wz));
      lv.props.push({ kind: "w", x: x + .5, y: y + .5 });
    } else if (ch === "o") {
      const pm = new THREE.MeshPhongMaterial({ color: theme === "cellar" ? 0x22302e : 0x9fb8c4, shininess: 120, transparent: true, opacity: .75, specular: 0xffffff }); lv.perMat.push(pm);
      const p = new THREE.Mesh(GEO.puddle, pm); p.rotation.x = -Math.PI / 2; p.scale.set(1.2, .9, 1); p.position.set(wx, .015, wz); group.add(p);
      if (theme !== "cellar") { const ws = wetSign(); ws.position.set(wx + 1, 0, wz - .8); group.add(ws); }
      lv.hazards.push({ kind: "o", x: x + .5, y: y + .5, cd: 0 });
    } else if (ch === "u") {
      group.add(at(mesh(GEO.bucket, lambert(0x2b7bb9), 1), wx + .6, .16, wz - .4));
      const d = mesh(GEO.drop, basic(0x9fd8ff), 1); d.position.set(wx + .6, WALL_H, wz - .4); group.add(d); lv.drips.push({ mesh: d, y: WALL_H });
      group.add(at(sprite(labelTex("DACH UNDICHT · SEIT 2014", "#2b7bb9", "#fff"), 1.4, .22), wx + .6, .7, wz - .4));
    } else if (ch === "z") {
      const g = new THREE.Group();
      const c1 = mesh(GEO.cable, lambert(0x111111), 1, 1.6, 1); c1.position.set(.2, WALL_H - 1, 0); c1.rotation.z = .2; g.add(c1);
      const c2 = c1.clone(); c2.position.set(-.3, WALL_H - .9, .2); c2.rotation.z = -.3; g.add(c2);
      g.add(at(boxMesh(1.4, .02, .7, 0x0a0a0a), 0, WALL_H - .01, 0));
      const sparkMat = new THREE.SpriteMaterial({ map: glowTex("rgba(170,220,255,1)"), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }); lv.perMat.push(sparkMat);
      const sparks = []; for (let i = 0; i < 5; i++) { const s = new THREE.Sprite(sparkMat); s.scale.set(.35, .35, 1); g.add(s); sparks.push(s); }
      g.add(at(sprite(labelTex("⚡ HOCHSPANNUNG", "#f2c300", "#222"), 1.2, .22), 0, 2.6, 0));
      g.position.set(wx, 0, wz); group.add(g);
      lv.hazards.push({ kind: "z", x: x + .5, y: y + .5, cd: 0, phase: r() * 3, sparks });
    }
  }

  // corridor clutter along the walls
  for (const [x, y, dx, dy] of faces) {
    if (grid[y][x] !== "." || r() > .05 || theme === "park") continue;
    if ((lv.start && x === lv.start[0] && y === lv.start[1]) || (lv.exit && x === lv.exit[0] && y === lv.exit[1])) continue;
    const wx = (x + .5) * S + dx * 1.05, wz = (y + .5) * S + dy * 1.05, kind = r();
    if (theme === "cellar") { const b = boxMesh(.6, .5, .6, 0x8a6f52); b.position.set(wx, .25, wz); b.rotation.y = r() * 3; group.add(b); }
    else if (theme === "derma") { group.add(at(mesh(GEO.pot, lambert(0xe8e2d8), 1), wx, .2, wz)); group.add(at(mesh(GEO.leaf, lambert(0x5aa05a), 1), wx, .6, wz)); }
    else if (kind < .4) { group.add(at(mesh(GEO.pole, lambert(0xb9c1bc), 1), wx, .95, wz)); group.add(at(boxMesh(.18, .28, .06, 0xd8eef8), wx + .1, 1.75, wz)); group.add(at(mesh(GEO.ball, lambert(0x444444), .1, .03, .1), wx, .03, wz)); }
    else if (kind < .7) { const ws = wetSign(); ws.position.set(wx, 0, wz); ws.rotation.y = r() * 3; group.add(ws); }
    else { const ch2 = new THREE.Group(); ch2.add(at(boxMesh(.55, .06, .55, 0x2b2f33), 0, .5, 0)); ch2.add(at(boxMesh(.55, .55, .05, 0x2b2f33), 0, .8, -.27)); for (const s of [-1, 1]) { const wh = mesh(GEO.wheel, lambert(0x777777), .9, .3, .9); wh.rotation.z = Math.PI / 2; wh.position.set(s * .32, .3, 0); ch2.add(wh); } ch2.position.set(wx, 0, wz); ch2.rotation.y = r() * 3; group.add(ch2); }
  }

  // lab papers (off to the side, avoidable)
  for (const p of lv.papers) {
    p.mesh = new THREE.Group();
    for (let i = 0; i < 3; i++) { const sh = new THREE.Mesh(GEO.plane, lambert(0xffffff, paperTex())); sh.rotation.x = -Math.PI / 2; sh.rotation.z = r() * Math.PI; sh.scale.set(.3, .42, 1); sh.position.set((r() - .5) * .3, .015 + i * .002, (r() - .5) * .3); p.mesh.add(sh); }
    p.mesh.add(at(sprite(labelTex("LABOR", "#c0322a", "#fff"), .6, .11), 0, .38, 0));
    p.mesh.position.set(p.x * S, 0, p.y * S); group.add(p.mesh);
  }

  // items on small side tables next to the wall
  for (const it of lv.items) {
    const def = ITEMS[it.kind];
    const wallDir = DIRS.find(([dx, dy]) => cell(it.x + dx, it.y + dy) === "#") || [1, 0];
    it.mesh = new THREE.Group();
    const table = new THREE.Group(); table.add(at(boxMesh(.55, .05, .45, 0x8a6a4a), 0, .78, 0)); for (const [lx, lz] of [[-.23, -.18], [.23, -.18], [-.23, .18], [.23, .18]]) table.add(at(boxMesh(.04, .76, .04, 0x5a4a3a), lx, .38, lz)); it.mesh.add(table);
    it.model = itemModel(it.kind); it.model.position.y = .81; it.mesh.add(it.model);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(def.mission ? "rgba(242,179,61,1)" : "rgba(166,227,143,1)"), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); glow.scale.set(.9, .9, 1); glow.position.y = .95; it.mesh.add(glow); it.glow = glow;
    it.mesh.add(at(sprite(labelTex(def.name.toUpperCase(), def.mission ? "#f2b33d" : "#1d2622", def.mission ? "#2a1c00" : "#fff"), 1.1, .2), 0, 1.45, 0));
    it.mesh.position.set((it.x + .5) * S + wallDir[0] * 1.05, 0, (it.y + .5) * S + wallDir[1] * 1.05);
    it.wx = it.mesh.position.x / S; it.wy = it.mesh.position.z / S;
    group.add(it.mesh);
  }

  // friendly people
  for (const f of lv.friends) {
    const def = FRIENDS[f.kind], g = new THREE.Group();
    f.person = makePerson(def.spec); g.add(f.person.group);
    const top = 1.9 * (def.spec.scale || 1);
    g.add(at(sprite(labelTex(def.name.toUpperCase(), def.color, "#1d2622"), 1.4, .25), 0, top + .55, 0));
    f.tri = triMesh(TRI_MAT.friend); f.tri.scale.setScalar(1.5); f.tri.position.y = top + .22; g.add(f.tri);
    g.position.set(f.x * S, 0, f.y * S); group.add(g); f.mesh = g;
  }
  for (const [ch, x, y] of pending) {
    const e = spawnEnemy(lv, ch, x + .5, y + .5, r);
    if (ch === "U") { e.static = true; e.tri.material = TRI_MAT.sus; }
  }

  // moving cars
  for (const tr of lv.transports) {
    const tx = Math.floor(tr.x), ty = Math.floor(tr.y);
    const len = (dx, dy) => { let n = 0; while (openTile(tx + dx * (n + 1), ty + dy * (n + 1))) n++; return n; };
    tr.dir = len(1, 0) + len(-1, 0) >= len(0, 1) + len(0, -1) ? [1, 0] : [0, 1]; tr.speed = 2.6;
    const g = new THREE.Group(); g.add(makeCar(0xd4af37, true)); g.add(at(sprite(labelTex(chance(.5) ? "PORSCHE DES CHEFS" : "OA PARKT AUS", "#d4af37", "#222"), 1.8, .28), 0, 2.2, 0));
    tr.mesh = g; group.add(g);
  }

  // navigation dots
  lv.naviMat = new THREE.MeshBasicMaterial({ color: 0x3cff8a, transparent: true, opacity: .8, depthWrite: false }); lv.perMat.push(lv.naviMat);
  const dotGeo = GEO.dot.clone(); dotGeo.rotateX(-Math.PI / 2); lv.perGeo.push(dotGeo);
  lv.navi = new THREE.InstancedMesh(dotGeo, lv.naviMat, 90); lv.navi.count = 0; lv.navi.frustumCulled = false; group.add(lv.navi);

  lv.startYaw = 0;
  for (const [dx, dy] of DIRS) if (openTile(lv.start[0] + dx, lv.start[1] + dy)) { lv.startYaw = Math.atan2(-dx, -dy); break; }
  // everything that moves or changes stays separate; the rest is merged into a few big meshes
  for (const e of lv.enemies) { dyn(e.mesh); if (e.cone) dyn(e.cone); }
  for (const o of [...lv.friends, ...lv.items, ...lv.papers, ...lv.transports, ...lv.secrets]) dyn(o.mesh);
  for (const h of lv.hazards) if (h.sparks) dyn(h.sparks[0].parent);
  for (const d of lv.drips) dyn(d.mesh);
  for (const p of lv.props) if (p.arm) dyn(p.arm);
  for (const f of lv.flickers) dyn(f.mesh);
  lv.merged = mergeStatic(group, lv.perGeo);
  scene.add(group);
}
