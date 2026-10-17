/* Hospital Escape 3D · detailed models: rounded geometry, hospital beds, stretchers, spa loungers, desks, monitors, cars. */

// rounded box (all edges bevelled), cached and indexed so mergeStatic can batch it
const RBOX = new Map();
function rboxGeo(w, h, d, r = .03) {
  const k = [w, h, d, r].map(v => v.toFixed(3)).join();
  if (RBOX.has(k)) return RBOX.get(k);
  r = Math.max(.002, Math.min(r, w / 2 - .002, h / 2 - .002, d / 2 - .002));
  const s = new THREE.Shape(), x = w / 2, y = h / 2;
  s.moveTo(-x + r, -y); s.lineTo(x - r, -y); s.absarc(x - r, -y + r, r, -Math.PI / 2, 0, false); s.lineTo(x, y - r); s.absarc(x - r, y - r, r, 0, Math.PI / 2, false);
  s.lineTo(-x + r, y); s.absarc(-x + r, y - r, r, Math.PI / 2, Math.PI, false); s.lineTo(-x, -y + r); s.absarc(-x + r, -y + r, r, Math.PI, Math.PI * 1.5, false);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(.001, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelOffset: -r, bevelSegments: 2, curveSegments: 3 });
  g.translate(0, 0, -(d - 2 * r) / 2);
  indexed(g); RBOX.set(k, g); return g;
}
function indexed(g) { if (!g.index) { const n = g.attributes.position.count, a = new (n > 65535 ? Uint32Array : Uint16Array)(n); for (let i = 0; i < n; i++) a[i] = i; g.setIndex(new THREE.BufferAttribute(a, 1)); } g.computeVertexNormals(); return g; }
const rmesh = (w, h, d, r, c) => new THREE.Mesh(rboxGeo(w, h, d, r), typeof c === "object" ? c : lambert(c));
const tube = (len, rad, c) => mesh(GEO.cyl, typeof c === "object" ? c : phong(c, 80), rad, len, rad);
const CHROME = () => phong(0xc8d0d6, 80);

// ---------- hospital bed: lift column, casters, raised back section, side rails, head/foot boards ----------
function hospitalBed(opt = {}) {
  const g = new THREE.Group(), L = 2.08, W = .96, frame = phong(0x9aa5a8, 60), board = opt.board || 0xd9e1e4, accent = opt.accent || 0x6aa1d6;
  g.add(at(rmesh(.62, .08, 1.6, .03, 0x56605f), 0, .17, 0));
  for (const [x, z] of [[-.34, -.78], [.34, -.78], [-.34, .78], [.34, .78]]) {
    const w = mesh(GEO.cyl, lambert(0x1c1d1e), .055, .04, .055); w.rotation.z = Math.PI / 2; w.position.set(x, .056, z); g.add(w);
    g.add(at(rmesh(.035, .08, .05, .01, frame), x, .13, z));
  }
  g.add(at(rmesh(.2, .24, .44, .04, 0x7e898b), 0, .32, 0));
  g.add(at(rmesh(W, .06, L, .025, frame), 0, .46, 0));
  // mattress: foot/seat section flat, back section raised
  const mat = lambert(0xe6ecee);
  g.add(at(rmesh(W - .1, .13, L * .58, .055, mat), 0, .555, L * .19));
  const back = new THREE.Group(); back.position.set(0, .5, -L * .1); back.rotation.x = opt.flat ? 0 : .32; g.add(back);
  back.add(at(rmesh(W - .1, .13, L * .4, .055, mat), 0, .055, -L * .2));
  back.add(at(rmesh(.6, .1, .34, .05, 0xffffff), 0, .16, -L * .33));
  // blanket over the legs
  g.add(at(rmesh(W - .04, .05, L * .5, .025, opt.blanket || 0x8fb7d9), 0, .64, L * .24));
  g.add(at(rmesh(W - .02, .03, .12, .015, 0xf4f6f6), 0, .66, -L * .01));
  // head and foot boards
  for (const [z, h] of [[-L / 2 + .02, .62], [L / 2 - .02, .42]]) {
    g.add(at(rmesh(W + .02, h, .05, .025, board), 0, .46 + h / 2, z));
    g.add(at(rmesh(W - .2, h * .55, .055, .02, accent), 0, .46 + h * .55, z));
  }
  g.add(at(rmesh(.22, .1, .03, .01, 0x2b2f33), .2, .78, L / 2 + .015));
  // split side rails (head half)
  for (const s of [-1, 1]) {
    const rail = new THREE.Group(); rail.position.set(s * (W / 2 + .02), .66, -L * .22); g.add(rail);
    rail.add(at(rmesh(.035, .26, .8, .015, 0xdfe5e8), 0, .05, 0));
    rail.add(at(rmesh(.04, .03, .82, .012, accent), 0, .19, 0));
    if (opt.fullRails) { const r2 = rail.clone(); r2.position.z = L * .23; g.add(r2); }
  }
  g.userData.top = .66;
  return g;
}

// ---------- ER stretcher / mortuary trolley ----------
function stretcher(opt = {}) {
  const g = new THREE.Group(), L = 2.0, W = .72, chrome = CHROME();
  for (const [x, z] of [[-.28, -.82], [.28, -.82], [-.28, .82], [.28, .82]]) {
    const w = mesh(GEO.cyl, lambert(0x1c1d1e), .06, .045, .06); w.rotation.z = Math.PI / 2; w.position.set(x, .06, z); g.add(w);
    g.add(at(tube(.08, .015, chrome), x, .14, z));
  }
  g.add(at(rmesh(.56, .05, 1.7, .02, 0x4b5556), 0, .2, 0));
  for (const z of [-.6, .6]) { const t = tube(.62, .025, chrome); t.position.set(0, .5, z); t.rotation.z = .5; g.add(t); const t2 = t.clone(); t2.rotation.z = -.5; g.add(t2); }
  g.add(at(rmesh(W, .05, L, .02, phong(0xb8c2c6, 70)), 0, .8, 0));
  g.add(at(rmesh(W - .06, .09, L - .1, .04, opt.sheet ? 0xf2f2ee : 0x2f6f8f), 0, .87, 0));
  for (const s of [-1, 1]) { const rl = at(tube(1.5, .014, chrome), s * (W / 2 + .02), .98, 0); rl.rotation.x = Math.PI / 2; g.add(rl); for (const z of [-.7, .7]) g.add(at(tube(.16, .012, chrome), s * (W / 2 + .02), .9, z)); }
  if (!opt.sheet) g.add(at(rmesh(.5, .08, .3, .04, 0xffffff), 0, .95, -.75));
  if (opt.sheet) { const b = new THREE.Group(); b.add(at(rmesh(.52, .2, 1.7, .1, 0xf2f2ee), 0, 1.0, 0)); b.add(at(mesh(GEO.ball, lambert(0xf2f2ee), .16, .13, .18), 0, 1.06, -.78)); for (const sx of [-1, 1]) b.add(at(mesh(GEO.ball, lambert(0xf2f2ee), .07, .1, .07), sx * .09, 1.08, .82)); g.add(b); }
  return g;
}

// ---------- spa lounger (dermatology) ----------
function spaLounger() {
  const g = new THREE.Group(), wood = lambert(0xb9875a), cush = lambert(0xf7efe8);
  for (const s of [-1, 1]) { g.add(at(rmesh(.06, .06, 2.0, .025, wood), s * .4, .22, 0)); for (const z of [-.8, .8]) g.add(at(rmesh(.06, .22, .06, .02, wood), s * .4, .11, z)); }
  g.add(at(rmesh(.86, .05, 1.25, .02, wood), 0, .27, .35));
  g.add(at(rmesh(.8, .12, 1.2, .06, cush), 0, .35, .35));
  const back = new THREE.Group(); back.position.set(0, .3, -.28); back.rotation.x = .75; g.add(back);
  back.add(at(rmesh(.86, .05, .8, .02, wood), 0, 0, -.38)); back.add(at(rmesh(.8, .12, .78, .06, cush), 0, .08, -.38));
  const towel = mesh(GEO.cyl, lambert(0xf6c1d4), .09, .62, .09); towel.rotation.z = Math.PI / 2; towel.position.set(0, .18, -.72); back.add(towel);
  const bowl = mesh(GEO.cyl, lambert(0xffffff), .12, .05, .12); bowl.position.set(.55, .48, .7); g.add(bowl);
  for (let i = 0; i < 4; i++) g.add(at(mesh(GEO.cyl, lambert(0x8fcf6a), .04, .01, .04), .5 + (i % 2) * .06, .51 + i * .006, .66 + (i >> 1) * .06));
  g.add(at(rmesh(.3, .5, .3, .04, wood), .55, .25, .7));
  return g;
}

// ---------- office ----------
function modernDesk(opt = {}) {
  const g = new THREE.Group(), W = opt.w || 1.6, D = .72, top = .76, wood = opt.wood || 0xd6c3a0, metal = phong(0x8f989c, 70);
  g.add(at(rmesh(W, .035, D, .012, wood), 0, top, D / 2));
  for (const s of [-1, 1]) {
    g.add(at(rmesh(.05, top - .02, .05, .015, metal), s * (W / 2 - .08), (top - .02) / 2, .1));
    g.add(at(rmesh(.05, top - .02, .05, .015, metal), s * (W / 2 - .08), (top - .02) / 2, D - .1));
    g.add(at(rmesh(.05, .04, D - .1, .015, metal), s * (W / 2 - .08), .03, D / 2));
  }
  const ped = new THREE.Group(); ped.position.set(W / 2 - .34, 0, D / 2 + .02); g.add(ped);
  ped.add(at(rmesh(.42, .58, D - .14, .02, 0xe6e2da), 0, .32, 0));
  for (let i = 0; i < 3; i++) { ped.add(at(rmesh(.38, .16, .01, .005, 0xd9d4ca), 0, .14 + i * .185, (D - .14) / 2 + .002)); ped.add(at(rmesh(.12, .015, .02, .006, phong(0xb0b6ba, 80)), 0, .19 + i * .185, (D - .14) / 2 + .01)); }
  g.add(at(rmesh(W - .25, .28, .015, .006, 0xa9b1ad), 0, .56, .07));
  return g;
}
function modernMonitor(map, w = .56) {
  const g = new THREE.Group(), h = w * .6, dark = phong(0x1e2124, 60);
  g.add(at(rmesh(w + .03, h + .03, .025, .008, dark), 0, .14 + h / 2 + .06, 0));
  const t = map || screenTex(); if (!screenMats.has(t.uuid)) screenMats.set(t.uuid, new THREE.MeshBasicMaterial({ map: t, toneMapped: false, color: 0xd8d8d8 }));
  const scr = new THREE.Mesh(GEO.plane, screenMats.get(t.uuid)); scr.scale.set(w, h, 1); scr.position.set(0, .14 + h / 2 + .06, .0135); g.add(scr);
  g.add(at(rmesh(.05, .22, .03, .012, phong(0xaab1b6, 80)), 0, .13, -.03));
  g.add(at(rmesh(.24, .015, .17, .007, phong(0xaab1b6, 80)), 0, .008, -.03));
  // a little screen glow on the desk
  const glow = sprite(glowTex("rgba(150,200,255,.5)"), w * 1.4, h * 1.1); glow.material.blending = THREE.AdditiveBlending; glow.material.opacity = .35; glow.position.set(0, .14 + h / 2 + .06, .05); g.add(glow);
  return g;
}

// ---------- ER ambulance, gastro ventilation switch, textures ----------
const curtainTex = () => canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#cfe3ea"; g.fillRect(0, 0, w, h); g.fillStyle = "#9cc3d2"; for (let x = 0; x < w; x += 16) g.fillRect(x, 0, 6, h); g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(0, 0, w, 10); g.fillStyle = "rgba(0,0,0,.08)"; g.fillRect(0, h - 14, w, 14); }, "curtain");
const stinkTex = () => canvasTex(128, 96, (g, w, h) => {
  const r = rng(3);
  for (let i = 0; i < 9; i++) { const x = 20 + r() * 88, y = 30 + r() * 40, rad = 18 + r() * 22, gr = g.createRadialGradient(x, y, 0, x, y, rad); const c = r() < .5 ? "120,140,60" : "110,95,50"; gr.addColorStop(0, `rgba(${c},.55)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
  g.strokeStyle = "rgba(90,110,40,.7)"; g.lineWidth = 3; g.lineCap = "round";
  for (const x0 of [40, 64, 88]) { g.beginPath(); for (let y = 70; y > 14; y -= 4) g.lineTo(x0 + Math.sin(y * .25) * 5, y); g.stroke(); }
}, "stink");
function ambulanceModel() {
  const g = new THREE.Group(), white = new THREE.MeshStandardMaterial({ color: 0xf4f4ef, roughness: .35, metalness: .1 });
  g.add(at(rmesh(1.9, 1.75, 1.9, .12, white), 0, 1.25, -.45));
  g.add(at(rmesh(1.85, 1.15, 1.0, .12, white), 0, .95, .95));
  g.add(at(rmesh(1.7, .5, .06, .04, new THREE.MeshStandardMaterial({ color: 0x141b24, roughness: .05, metalness: .6 })), 0, 1.25, 1.44)).rotation.x = 0;
  for (const s of [-1, 1]) { g.add(at(rmesh(.02, .22, 2.9, .01, basic(0xd42b2b)), s * .965, .85, .05)); g.add(at(rmesh(.02, .5, .6, .02, new THREE.MeshStandardMaterial({ color: 0x141b24, roughness: .05, metalness: .6 })), s * .93, 1.3, .95)); }
  const sign = plate(textTex(["RETTUNGSDIENST"], "#f4f4ef", "#d42b2b", 512, 90, 50), 1.6, .28); sign.position.set(0, 1.65, -1.405); sign.rotation.y = Math.PI; g.add(sign);
  for (const x of [-.6, .6]) g.add(at(rmesh(.3, .12, .2, .05, basic(0x3a7aff)), x, 2.18, .3));
  for (const [x, z] of [[-.85, -.95], [.85, -.95], [-.85, .95], [.85, .95]]) { const w = mesh(GEO.cyl, lambert(0x161718), .34, .24, .34); w.rotation.z = Math.PI / 2; w.position.set(x, .34, z); g.add(w); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
function ventSwitch() {
  const g = new THREE.Group(), metal = phong(0x9aa3a6, 70);
  g.add(at(rmesh(.9, 1.6, .6, .05, metal), 0, .8, 0));
  g.add(at(rmesh(.7, .5, .04, .02, 0x2b2f33), 0, 1.25, .31));
  const fan = new THREE.Group(); fan.position.set(0, 1.25, .34); g.add(fan);
  for (let i = 0; i < 4; i++) { const b = boxMesh(.28, .07, .01, 0xc8d0d4); b.rotation.z = i * Math.PI / 2; b.position.set(Math.cos(i * Math.PI / 2) * .12, Math.sin(i * Math.PI / 2) * .12, 0); fan.add(b); }
  g.add(at(rmesh(.16, .26, .08, .03, basic(0xd42b2b)), .25, .6, .32));
  g.userData.fan = fan; dyn(fan);
  return g;
}

// ---------- cars: extruded side profile, glass, rims, lights, plates ----------
const plateTex = text => canvasTex(256, 56, (g, w, h) => { g.fillStyle = "#f4f4f0"; g.fillRect(0, 0, w, h); g.fillStyle = "#1f3f9a"; g.fillRect(0, 0, 26, h); g.fillStyle = "#111"; g.font = `800 34px ${SF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, w / 2 + 12, h / 2 + 2); g.strokeStyle = "#111"; g.lineWidth = 3; g.strokeRect(1, 1, w - 2, h - 2); }, "plate:" + text);
const CAR_GEO = {};
function carProfile(pts, width, bevel) {
  const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) s.lineTo(p[0], p[1]); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: width - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 3, curveSegments: 6 });
  g.translate(0, 0, -(width - 2 * bevel) / 2); g.rotateY(-Math.PI / 2); return indexed(g);
}
function makeCar(color, lights, opt = {}) {
  const g = new THREE.Group(), cabrio = !!opt.cabrio, key = cabrio ? "c" : "s";
  if (!CAR_GEO[key]) {
    const body = cabrio
      ? [[-1.45, .28], [1.46, .28], [1.49, .52], [1.42, .74], [.9, .84], [.6, .86], [-.95, .9], [-1.42, .86], [-1.48, .62]]
      : [[-1.45, .28], [1.46, .28], [1.49, .52], [1.42, .74], [.9, .84], [.38, 1.3], [-.62, 1.32], [-1.12, .92], [-1.42, .86], [-1.48, .62]];
    const glass = cabrio ? [[.62, .86], [.86, .86], [.5, 1.18], [.42, 1.18]] : [[.82, .86], [.36, 1.26], [-.6, 1.28], [-1.06, .9]];
    CAR_GEO[key] = { body: carProfile(body, 1.62, .07), glass: carProfile(glass, cabrio ? 1.3 : 1.64, .02) };
  }
  const paint = new THREE.MeshStandardMaterial({ color, roughness: .28, metalness: .45 });
  g.add(new THREE.Mesh(CAR_GEO[key].body, paint));
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x141b24, roughness: .05, metalness: .6 });
  const gl = new THREE.Mesh(CAR_GEO[key].glass, glassMat); gl.scale.set(1, 1, 1); g.add(gl);
  if (cabrio) { for (const s of [-1, 1]) g.add(at(rmesh(.42, .32, .5, .12, 0x3a2a2a), s * .35, .95, -.3)); }
  // bumpers, sills, grille
  g.add(at(rmesh(1.66, .16, .14, .06, 0x2a2c2e), 0, .36, 1.46)); g.add(at(rmesh(1.66, .16, .14, .06, 0x2a2c2e), 0, .36, -1.46));
  g.add(at(rmesh(.7, .1, .03, .03, 0x15171a), 0, .58, 1.485));
  // wheels: tyre + rim + hub
  const tyre = lambert(0x161718), rim = phong(0xbfc6cc, 85);
  for (const [x, z] of [[-.76, -.92], [.76, -.92], [-.76, .98], [.76, .98]]) {
    const w = mesh(GEO.cyl, tyre, .31, .22, .31); w.rotation.z = Math.PI / 2; w.position.set(x, .31, z); g.add(w);
    const rm = mesh(GEO.cyl, rim, .19, .23, .19); rm.rotation.z = Math.PI / 2; rm.position.set(x * 1.005, .31, z); g.add(rm);
    const hub = mesh(GEO.cyl, lambert(0x2a2c2e), .05, .24, .05); hub.rotation.z = Math.PI / 2; hub.position.set(x * 1.01, .31, z); g.add(hub);
  }
  // lights + plates + mirrors + door seams
  const head = basic(lights ? 0xfff6d8 : 0xe8e8e0), tail = basic(0xd0221a);
  for (const x of [-.58, .58]) { g.add(at(rmesh(.32, .1, .04, .03, head), x, .68, 1.455)); g.add(at(rmesh(.3, .09, .04, .03, tail), x, .7, -1.47)); }
  const pm = lambert(0xffffff, plateTex(opt.plate || "KS-PA 2009"));
  for (const z of [1.535, -1.535]) { const p = new THREE.Mesh(GEO.plane, pm); p.scale.set(.52, .11, 1); p.position.set(0, .4, z); if (z < 0) p.rotation.y = Math.PI; g.add(p); }
  for (const s of [-1, 1]) { g.add(at(rmesh(.14, .08, .1, .03, paint), s * .88, .95, .62)); g.add(at(boxMesh(.004, .4, .012, 0x111111), s * .812, .62, -.05)); g.add(at(rmesh(.012, .03, .14, .01, phong(0xc8d0d6, 80)), s * .815, .8, .2)); }
  if (lights) for (const x of [-.58, .58]) { const gl2 = sprite(glowTex("rgba(255,240,200,1)"), .8, .5); gl2.material.blending = THREE.AdditiveBlending; gl2.material.opacity = .6; gl2.position.set(x, .68, 1.5); g.add(gl2); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
