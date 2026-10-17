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
  const lv = { idx, group, stink: [], curtains: [], enemies: [], friends: [], items: [], papers: [], transports: [], props: [], hazards: [], flickers: [], secrets: [], spawns: [], drips: [], clocks: [], windows: [], safeRooms: [],
    exit: null, start: null, reaSpot: null, doors: [], colliders: [], reserved: new Set(), orig: L.map, perTex: [], perMat: [], perGeo: [], visited: new Uint8Array(GW * GH), dark: new Uint8Array(GW * GH), t: 0, spawnT: 6 };
  level = lv; doorMap = new Map();
  const r = rng(idx * 97 + 11);
  ghostMat = new THREE.MeshStandardMaterial({ color: 0xe8eeff, transparent: true, opacity: .45, emissive: 0x334466, roughness: .4 }); lv.perMat.push(ghostMat);
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
    else if (ch === "f") { lv.stink.push([x, y]); clear(); }
    else if (ch === '"') { lv.stink.push([x, y]); grid[y][x] = ":"; }
    else if (ch === "|") { lv.curtains.push([x, y]); grid[y][x] = ":"; }
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
  const ceilMat = new THREE.MeshStandardMaterial({ map: ct, roughness: .95 });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(GW * S, GH * S), ceilMat);
  ceil.rotation.x = Math.PI / 2; ceil.position.set(GW * S / 2, WALL_H, GH * S / 2); group.add(ceil);
  lv.perMat.push(ceilMat); lv.perGeo.push(ceil.geometry);

  // walls
  const walls = [];
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (grid[y][x] === "#") walls.push([x, y]);
  const wallMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(S, WALL_H, S), lambert(0xffffff, wallTex(theme)), walls.length);
  const m4 = new THREE.Matrix4(), q4 = new THREE.Matrix4();
  walls.forEach(([x, y], i) => wallMesh.setMatrixAt(i, m4.makeTranslation(x * S + S / 2, WALL_H / 2, y * S + S / 2)));
  wallMesh.receiveShadow = true; group.add(wallMesh); lv.wallMesh = wallMesh; lv.wallIdx = new Map(walls.map(([x, y], i) => [x + "," + y, i]));

  // wall faces → handrails + skirting (instanced)
  const faces = [];
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    if ("#Hdl^,".includes(grid[y][x]) || (lv.exit && x === lv.exit[0] && y === lv.exit[1])) continue;
    for (const [dx, dy] of DIRS) if (cell(x + dx, y + dy) === "#") faces.push([x, y, dx, dy]);
  }
  const railTheme = ["ward", "ortho", "er", "radio", "gastro"].includes(theme);
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
  // contact shadow where floor meets wall
  const aoMat = new THREE.MeshBasicMaterial({ map: aoTex(), transparent: true, depthWrite: false, opacity: env.dark ? .6 : .85 }); lv.perMat.push(aoMat);
  const ao = new THREE.InstancedMesh(GEO.plane, aoMat, Math.max(1, faces.length));
  faces.forEach(([x, y, dx, dy], i) => { const th = Math.atan2(dx, dy); ao.setMatrixAt(i, q4.makeRotationY(th).multiply(m4.makeRotationX(-Math.PI / 2)).multiply(m4.makeScale(S, .55, 1)).setPosition((x + .5) * S + dx * (S / 2 - .275), .008, (y + .5) * S + dy * (S / 2 - .275))); });
  ao.renderOrder = 1; group.add(ao);

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
    // a few flickering tubes are funny, a whole floor of them is a disco. Never red: red means "spotted" or "emergency".
    const flick = creepy || v < env.flicker, cap = env.dark ? 4 : creepy ? 3 : 2;
    if (flick && (creepy ? (lv.nCreep = (lv.nCreep || 0) + 1) : (lv.nFlick = (lv.nFlick || 0) + 1)) <= cap) lv.flickers.push({ x, y, a: 3 + r() * 20, b: 1 + r() * 9, p: r() * 10, th: creepy ? .6 + r() * .6 : .2 + r() * .9, on: true, creepy, tint: creepy ? pick([0xfdfdf6, 0xd8e8ff, 0xfff0c8]) : env.lamp });
    else if (flick) { if (creepy) panelsBroken.push([x, y]); else panelsOk.push([x, y]); }
    else if (v < env.flicker + env.broken) panelsBroken.push([x, y]);
    else panelsOk.push([x, y]);
  }
  lv.panelMat = new THREE.MeshBasicMaterial({ color: env.lamp, toneMapped: false }); lv.perMat.push(lv.panelMat);
  const panelGeo = new THREE.BoxGeometry(1.4, .05, .7); lv.perGeo.push(panelGeo);
  const panels = new THREE.InstancedMesh(panelGeo, lv.panelMat, Math.max(1, panelsOk.length));
  panelsOk.forEach(([x, y], i) => panels.setMatrixAt(i, m4.makeTranslation(x * S + S / 2, WALL_H - .03, y * S + S / 2)));
  panels.count = panelsOk.length; group.add(panels);
  const frameGeo = new THREE.BoxGeometry(1.5, .04, .8); lv.perGeo.push(frameGeo);
  const frames = new THREE.InstancedMesh(frameGeo, lambert(0x9aa3a0), panelsOk.length + lv.flickers.length || 1);
  [...panelsOk, ...lv.flickers.map(f => [f.x, f.y])].forEach(([x, y], i) => frames.setMatrixAt(i, m4.makeTranslation(x * S + S / 2, WALL_H - .015, y * S + S / 2)));
  group.add(frames);
  lv.lampSpots = panelsOk.map(([x, y]) => [x + .5, y + .5]);
  // light pools on the floor under working panels (cheap fake bounce light)
  if (!env.dark && panelsOk.length) {
    const pm = new THREE.MeshBasicMaterial({ map: poolTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: theme === "park" ? .5 : .32, toneMapped: false, color: env.lamp });
    lv.perMat.push(pm);
    const pools = new THREE.InstancedMesh(GEO.plane, pm, panelsOk.length);
    panelsOk.forEach(([x, y], i) => pools.setMatrixAt(i, q4.makeRotationX(-Math.PI / 2).multiply(m4.makeScale(S * 1.25, S * 1.25, 1)).setPosition(x * S + S / 2, .012, y * S + S / 2)));
    pools.renderOrder = 1; group.add(pools); lv.pools = pools;
  }
  const brokenMat = lambert(0x3a3e3b);
  for (const [x, y] of panelsBroken) {
    const p = new THREE.Mesh(panelGeo, brokenMat); p.position.set(x * S + S / 2 + .3, WALL_H - .45, y * S + S / 2); p.rotation.z = .55; p.rotation.y = r() * 3; group.add(p);
    group.add(at(new THREE.Mesh(GEO.cable, lambert(0x111111)), x * S + S / 2 - .3, WALL_H - .6, y * S + S / 2));
    group.add(at(boxMesh(1.4, .02, .7, 0x0a0a0a), x * S + S / 2, WALL_H - .01, y * S + S / 2));
    if (r() < .4 && !env.dark) group.add(at(sprite(labelTex("LAMPE EINGESPART", "#f2c300", "#222"), 1.2, .2), x * S + S / 2, WALL_H - .9, y * S + S / 2));
  }
  for (const f of lv.flickers) { f.mat = new THREE.MeshBasicMaterial({ color: f.tint, toneMapped: false }); lv.perMat.push(f.mat); f.mesh = new THREE.Mesh(panelGeo, f.mat); f.mesh.position.set(f.x * S + S / 2, WALL_H - .03, f.y * S + S / 2); group.add(f.mesh); }
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
    const planeM = (map, w, h, yy, inset = 0, transparent, along = 0) => { const mat = transparent ? new THREE.MeshStandardMaterial({ roughness: .8, map, transparent: true }) : lambert(0xffffff, map); if (transparent) lv.perMat.push(mat); const m = new THREE.Mesh(GEO.plane, mat); m.scale.set(w, h, 1); return place(m, yy, inset, along); };
    const v = r();
    if (isBorder(x + dx, y + dy) && v < .22 && env.storm !== undefined && theme !== "radio") {
      const w = curtainWindow(windowMat); w.children.slice(3).forEach(c => w.remove(c)); place(w, 1.75, .01); lv.windows.push(w); openWindow(lv, x, y, dx, dy, w, theme); continue;
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
    if (v < .07 && theme !== "radio") place(funnyArt(Math.floor(r() * 99)), 1.65);
    else if (v < .1) { const p = theme === "derma" ? { bg: "#e26fa0", t: "SELF CARE", b: ["Creme ist", "Medizin.", "— Dr. Glatt"], i: "🧖" } : theme === "radio" && r() < .5 ? POSTERS[6] : pick(POSTERS); place(framed(posterTex(p), .72, 1.0, 0x2a2a2a), 1.65); }
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
  // one fire alarm per floor: a trick with consequences
  if (!L.safe && !L.final) {
    const cands = faces.filter(([x, y]) => lv.zone[y * GW + x] === 1 && grid[y][x] === "." && Math.abs(x - lv.start[0]) + Math.abs(y - lv.start[1]) > 5 && !DIRS.some(([dx, dy]) => "d,".includes(cell(x + dx, y + dy))));
    if (cands.length) {
      const [x, y, dx, dy] = cands[Math.floor(r() * cands.length)];
      const fa = new THREE.Group(); fa.add(at(boxMesh(.32, .32, .1, 0xd42b2b), 0, 1.45, .05)); fa.add(at(boxMesh(.2, .2, .02, 0xf6f6ef), 0, 1.45, .11)); fa.add(at(mesh(GEO.ball, basic(0xff3a2a), .03), 0, 1.45, .13));
      fa.add(at(plate(textTex(["FEUERMELDER", "nur im Notfall", "(oder bei Feierabend)"], "#d42b2b", "#fff", 256, 130, 26), .44, .22), 0, 1.84, .02));
      wallPlace(lv, fa, x, y, dx, dy, (r() - .5) * .8);
      lv.props.push({ kind: "fire", x: x + .5 + dx * .3, y: y + .5 + dy * .3 });
    }
  }
  // nurse station on wards: counter, monitors, files, the phone that never stops
  if (["ward", "ortho", "er", "gastro"].includes(theme)) {
    const cands = faces.filter(([x, y, dx, dy]) => lv.zone[y * GW + x] === 1 && grid[y][x] === "." && !DIRS.some(([a, b]) => "d,E".includes(cell(x + a, y + b))) && !lv.props.some(p => Math.hypot(p.x - x - .5, p.y - y - .5) < 1.2) && Math.abs(x - lv.start[0]) + Math.abs(y - lv.start[1]) > 3);
    if (cands.length) {
      const [x, y, dx, dy] = cands[Math.floor(r() * cands.length)], st = new THREE.Group();
      st.add(at(boxMesh(2.5, 1.05, .6, 0xe8e2d8), 0, .52, .3)); st.add(at(boxMesh(2.6, .05, .7, 0x6f8f9a), 0, 1.07, .33));
      for (const xx of [-.7, .5]) { const m = monitorModel(xx < 0 ? kisTex() : rosterTex(), .45); m.position.set(xx, 1.1, .2); st.add(m); }
      st.add(at(phoneModel(), .05, 1.1, .45)); st.add(at(paperStack(10), -1.05, 1.1, .4)); st.add(at(mugModel("PFLEGE|IST LIEBE", true), 1.05, 1.1, .45));
      st.add(at(plate(textTex(["STATIONSSTÜTZPUNKT", "Bitte klingeln (bringt nichts)"], "#2b7bb9", "#fff", 512, 130, 40), 1.4, .36), 0, 2.2, .02));
      wallPlace(lv, st, x, y, dx, dy, 0, 0, [2.6, .7]);
    }
  }
  // escape route signs from the start to the stairwell, like real hospitals
  if (lv.exit) {
    const path = bfs(lv.start[0], lv.start[1], lv.exit[0], lv.exit[1], true, playerPass);
    if (path) for (let i = 2; i < path.length - 1; i++) {
      const dp = [path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]], dn = [path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]];
      const turn = dp[0] !== dn[0] || dp[1] !== dn[1];
      if (!(turn || i % 5 === 0) || lv.zone[path[i][1] * GW + path[i][0]] !== 1) continue;
      const cross = dp[0] * dn[1] - dp[1] * dn[0], arrow = !turn ? "⬆" : cross > 0 ? "➡" : "⬅";
      const [px, py] = path[i], th = Math.atan2(-dp[0], -dp[1]);
      const front = plate(textTex(["🏃 " + arrow, "TREPPENHAUS"], "#14a052", "#fff", 384, 128, 40), .95, .32), back = plate(textTex(["↩", "TREPPENHAUS"], "#14a052", "#fff", 384, 128, 40), .95, .32);
      front.position.set((px + .5) * S, 2.78, (py + .5) * S); front.rotation.y = th; group.add(front);
      back.position.copy(front.position); back.rotation.y = th + Math.PI; group.add(back);
      group.add(at(mesh(GEO.box, lambert(0x8a8f8a), .02, .3, .02), (px + .5) * S, 3.05, (py + .5) * S));
    }
  }
  // waiting room chairs in the emergency department
  if (theme === "er") {
    group.add(at(sprite(textTex(["WARTEZEIT AKTUELL", "9 Std. 40 Min.", "(Tendenz: ja)"], "#111", "#ff5a3a", 512, 200, 54), 2.6, 1.0), 18 * S, 2.45, 1.3 * S));
    group.add(at(sprite(labelTex("TRIAGE · ANMELDUNG", "#c0322a", "#fff"), 2.2, .36), 26.9 * S, 2.7, 4.5 * S));
    group.add(at(sprite(labelTex("BEHANDLUNG 1–5", "#2b7bb9", "#fff"), 2, .32), 8 * S, 2.75, 8.5 * S));
    group.add(at(sprite(labelTex("SCHOCKRAUM", "#c0322a", "#fff"), 1.7, .3), 20.5 * S, 2.75, 8.6 * S));
  }
  if (theme === "er") for (const [x, y] of [[15, 3], [19, 3], [23, 3], [15, 5], [19, 5]]) if (grid[y] && grid[y][x] === ".") { const row = chairRow(4, 0xc0322a); row.rotation.y = Math.PI; row.position.set((x + .5) * S, 0, (y + .5) * S); group.add(row); grid[y][x] = "K"; } // seat rows block their tile, so paths go around
  // rooms and safe rooms
  decorateShabby(lv, theme, r);
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
      if (idx !== 2) { const n = DIRS.find(([dx, dy]) => cell(x + dx, y + dy) === "." || cell(x + dx, y + dy) === ":"); if (n) lv.props.push({ kind: "bedhide", x: x + .5 + n[0] * .75, y: y + .5 + n[1] * .75 }); }
      const g = idx === 2 ? stretcher() : hospitalBed({ blanket: pick([0x8fb7d9, 0xb9d3a8, 0xe8d8b8, 0xc8b8d8]) });
      const pat = makePerson({ skin: rnd(SKIN), hair: rnd(HAIR), hairStyle: "messy", gown: true, shirt: 0x9cc6e6, noShadow: true });
      pat.group.rotation.x = -Math.PI / 2 + (idx === 2 ? 0 : .16); pat.group.position.set(0, idx === 2 ? .93 : .7, .95); pat.group.scale.setScalar(.95); g.add(pat.group);
      g.add(at(sprite(labelTex(idx === 2 ? "CT-LIEGE" : "FLURBETT " + (7 + Math.floor(r() * 20)) + " VON 23", "#7b8a85", "#fff"), 1.4, .22), 0, 1.6, 0));
      g.position.set(wx, 0, wz); g.rotation.y = alongZ ? 0 : Math.PI / 2; group.add(g);
    } else if (ch === "T") {
      group.add(at(boxMesh(S * .9, .06, S * .5, 0xeeeae0), wx, 1.03, wz)); group.add(at(boxMesh(S * .88, .98, S * .46, 0xc9b38f), wx, .5, wz));
      const mon = monitorMesh(idx === 0 ? pcTex() : screenTex()); mon.scale.set(.6, .42, .05); mon.position.set(wx + (idx === 0 ? 0 : r() - .5), 1.32, wz); group.add(mon);
      group.add(at(boxMesh(.08, .14, .08, 0x333333), mon.position.x, 1.1, wz)); group.add(at(boxMesh(.5, .02, .18, 0x2b2b2b), mon.position.x, 1.07, wz + .3));
      for (let i = 0; i < 5; i++) { const pp = boxMesh(.3, .04, .42, 0xfbfaf4); pp.position.set(wx - .8, 1.08 + i * .045, wz + .05); pp.rotation.y = r() * .4; group.add(pp); }
      group.add(at(mesh(GEO.cyl, lambert(0xf2f2ee), .045, .1, .045), wx + .85, 1.11, wz - .2));
      if (!lv.deskSign) { lv.deskSign = true; group.add(at(sprite(textTex([idx === 0 ? "ARZTZIMMER" : "STATIONSZIMMER", idx === 0 ? "Bitte nicht stören (stört trotzdem jeder)" : "Bitte klingeln (bringt nichts)"], "#2b7bb9", "#fff", 512, 140, 46), 2.3, .63), wx, 2.7, wz)); }
    } else if (ch === "%") {
      const g = ambulanceModel(); g.position.set(wx, 0, wz); g.rotation.y = alongZ ? 0 : Math.PI / 2; group.add(g);
      group.add(at(sprite(labelTex("LIEGENDANFAHRT", "#c0322a", "#fff"), 1.6, .26), wx, 3.1, wz));
    } else if (ch === "y") {
      const g = ventSwitch(); g.position.set(wx, 0, wz); group.add(g); lv.ventFan = g.userData.fan;
      group.add(at(sprite(labelTex("LÜFTUNG · AUS SEIT 2017", "#6a5a1a", "#fff"), 1.8, .28), wx, 2.55, wz));
      lv.props.push({ kind: "y", x: x + .5, y: y + .5 });
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
      const g = spaLounger();
      g.add(at(sprite(labelTex("WELLNESS-LIEGE", "#e26fa0", "#fff"), 1.3, .22), 0, 1.4, 0));
      g.position.set(wx, 0, wz); g.rotation.y = alongZ ? 0 : Math.PI / 2; group.add(g);
      lv.props.push({ kind: "W", x: x + .5, y: y + .5, used: false });
    } else if (ch === "a" || ch === "j") {
      const g = ch === "j" ? vehicleModel(run && run.route) : makeCar(pick([0xc0322a, 0x2d3f8f, 0xd8d8d8, 0x333333, 0xe8a33a, 0x5a7a8a]));
      g.position.set(wx, 0, wz); g.rotation.y = ch === "j" ? Math.PI / 2 : r() < .5 ? 0 : Math.PI; group.add(g);
      if (ch === "j") { const R = run && run.route && ROUTES[run.route]; group.add(at(sprite(labelTex(R && run.route !== "stay" ? "DEINE FLUCHT · " + R.name.toUpperCase() : "DEIN AUTO", "#1f9d55", "#fff"), 1.8, .3), wx, 3.1, wz)); lv.props.push({ kind: "j", x: x + .5, y: y + .5 }); }
    } else if (ch === "=") {
      group.add(at(boxMesh(.35, 1.1, .35, 0xf2c300), wx - 1.2, .55, wz));
      const arm = new THREE.Group(); arm.position.set(wx - 1.2, 1.0, wz);
      const bar = boxMesh(2.6, .1, .1, 0xffffff, tapeTex()); bar.position.x = 1.3; arm.add(bar); group.add(arm);
      group.add(at(sprite(labelTex("NUR MIT TICKET", "#c0322a", "#fff"), 1.3, .22), wx, 1.8, wz));
      lv.props.push({ kind: "=", x: x + .5, y: y + .5, arm });
    } else if (ch === "Y") {
      const g = stretcher({ sheet: true });
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
      const pm = new THREE.MeshStandardMaterial({ color: theme === "cellar" ? 0x22302e : 0x9fb8c4, roughness: .04, metalness: .3, transparent: true, opacity: .75, specular: 0xffffff }); lv.perMat.push(pm);
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
  let optional = 0;
  for (const [ch, x, y] of pending) {
    if (pending.length > 5 && "PFNOI".includes(ch) && optional++ % 3 === 1) continue; // fewer people in crowded wards
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
  const lineGeo = new THREE.PlaneGeometry(.2, 1); lineGeo.rotateX(-Math.PI / 2); lv.perGeo.push(lineGeo);
  lv.navi = new THREE.InstancedMesh(lineGeo, lv.naviMat, 90); lv.navi.count = 0; lv.navi.frustumCulled = false; group.add(lv.navi);
  const chev = new THREE.Shape(); chev.moveTo(-.12, -.07); chev.lineTo(0, .07); chev.lineTo(.12, -.07); chev.lineTo(.08, -.07); chev.lineTo(0, .012); chev.lineTo(-.08, -.07); chev.closePath();
  const chevGeo = new THREE.ShapeGeometry(chev); chevGeo.rotateX(-Math.PI / 2); lv.perGeo.push(chevGeo);
  lv.chevMat = new THREE.MeshBasicMaterial({ color: 0x8affc0, transparent: true, opacity: .5, depthWrite: false, toneMapped: false }); lv.perMat.push(lv.chevMat);
  lv.chev = new THREE.InstancedMesh(chevGeo, lv.chevMat, 60); lv.chev.count = 0; lv.chev.frustumCulled = false; group.add(lv.chev);

  lv.startYaw = 0;
  for (const [dx, dy] of DIRS) if (openTile(lv.start[0] + dx, lv.start[1] + dy)) { lv.startYaw = Math.atan2(-dx, -dy); break; }
  buildRouteProps(lv, idx);
  // everything that moves or changes stays separate; the rest is merged into a few big meshes
  for (const e of lv.enemies) { dyn(e.mesh); if (e.cone) dyn(e.cone); }
  for (const o of [...lv.friends, ...lv.items, ...lv.papers, ...lv.transports, ...lv.secrets]) dyn(o.mesh);
  for (const h of lv.hazards) if (h.sparks) dyn(h.sparks[0].parent);
  for (const d of lv.drips) dyn(d.mesh);
  for (const p of lv.props) if (p.arm) dyn(p.arm);
  for (const f of lv.flickers) dyn(f.mesh);
  // treatment bay curtains (ER): rail + half-drawn curtain towards the corridor
  if (lv.curtains.length) {
    const cg = new THREE.PlaneGeometry(1, 1, 16, 1), pos = cg.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin((pos.getX(i) + .5) * Math.PI * 7) * .05);
    cg.computeVertexNormals(); lv.perGeo.push(cg);
    const cm = new THREE.MeshStandardMaterial({ map: curtainTex(), side: THREE.DoubleSide, roughness: .9 }); lv.perMat.push(cm);
    for (const [x, y] of lv.curtains) for (const [dx, dy] of DIRS) {
      if (zoneAt(lv, x + dx, y + dy) !== 1 || solidMove(cell(x + dx, y + dy))) continue;
      const th = Math.atan2(dx, dy), ex = (x + .5 + dx * .48) * S, ez = (y + .5 + dy * .48) * S, ax = Math.cos(th), az = -Math.sin(th);
      const rail = boxMesh(S, .03, .03, 0xc8d0d4); rail.position.set(ex, 2.55, ez); rail.rotation.y = th; group.add(rail);
      const c = new THREE.Mesh(cg, cm), side = (x + y) % 2 ? 1 : -1; c.scale.set(S * .42, 2.25, 1); c.position.set(ex + ax * side * S * .27, 1.42, ez + az * side * S * .27); c.rotation.y = th; group.add(c);
    }
  }
  // stink fog (gastro): drifting green-brown clouds, gone once the ventilation runs
  lv.clouds = [];
  if (lv.stink.length) {
    const tex = stinkTex();
    for (const [x, y] of lv.stink) for (let k = 0; k < 2; k++) {
      const sp = sprite(tex, 2.6 + r() * 1.2, 1.8 + r() * .8); sp.material = sp.material.clone(); sp.material.opacity = .55; sp.material.depthWrite = false; lv.perMat.push(sp.material);
      sp.position.set((x + .2 + r() * .6) * S, .7 + k * .9 + r() * .3, (y + .2 + r() * .6) * S); group.add(sp); dyn(sp);
      lv.clouds.push({ s: sp, bx: sp.position.x, bz: sp.position.z, by: sp.position.y, p: r() * 6 });
    }
    lv.stinkSet = new Set(lv.stink.map(([x, y]) => x + "," + y));
  }
  lv.merged = mergeStatic(group, lv.perGeo);
  scene.add(group);
}
