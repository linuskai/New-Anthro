/* Hospital Escape 3D · furniture and object library. Every model faces +z, its back sits at local z = 0 (the wall). */

// ---------- textures ----------
const kisTex = () => canvasTex(256, 160, (g, w, h) => {
  g.fillStyle = "#c9d3e0"; g.fillRect(0, 0, w, h); g.fillStyle = "#1f3f8a"; g.fillRect(0, 0, w, 22);
  g.fillStyle = "#fff"; g.font = `700 13px ${SF}`; g.fillText("KIS 2003 · Station 5B · Benutzer: Sie", 6, 15);
  g.fillStyle = "#1d2622"; g.font = `600 12px ${SF}`;
  ["Offene Arztbriefe: 23", "Ungelesene Befunde: 41", "Dienstplan: 6 neue Einträge", "Passwort läuft ab in: 0 Tagen"].forEach((t, i) => g.fillText(t, 8, 44 + i * 18));
  g.fillStyle = "#c0322a"; g.fillRect(8, 120, 110, 24); g.fillStyle = "#fff"; g.font = `800 12px ${SF}`; g.fillText("Keine Rückmeldung", 14, 136);
  g.fillStyle = "#555"; g.fillText("⌛", 228, 140);
}, "kis");
const solitaireTex = () => canvasTex(256, 160, (g, w, h) => {
  g.fillStyle = "#1e7a3a"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 7; i++) for (let j = 0; j <= i; j++) { g.fillStyle = j === i ? "#fff" : "#2b4fa0"; g.fillRect(10 + i * 34, 30 + j * 10, 28, 38); g.strokeStyle = "#111"; g.strokeRect(10 + i * 34, 30 + j * 10, 28, 38); }
  g.fillStyle = "#c0322a"; g.font = `800 14px ${SF}`; g.fillText("♥ 7", 16 + 6 * 34, 30 + 6 * 10 + 18);
}, "sol");
const mailTex = () => canvasTex(256, 160, (g, w, h) => {
  g.fillStyle = "#f4f6f8"; g.fillRect(0, 0, w, h); g.fillStyle = "#2b7bb9"; g.fillRect(0, 0, w, 22);
  g.fillStyle = "#fff"; g.font = `700 13px ${SF}`; g.fillText("Posteingang (1.384)", 6, 15);
  g.font = `600 11px ${SF}`;
  [["Controlling", "Kugelschreiberverbrauch Q3"], ["Chefarzt", "WG: WG: WG: Dienstplan"], ["IT", "Passwort ändern!!!"], ["QM", "Pflichtschulung Händewaschen"], ["Personal", "Überstunden verfallen"], ["Kantine", "Heute: Suppe (gestern)"]]
    .forEach(([a, b], i) => { g.fillStyle = i < 3 ? "#1d2622" : "#61706a"; g.fillText(a, 6, 40 + i * 19); g.fillText(b, 86, 40 + i * 19); });
}, "mail");
const rosterTex = () => canvasTex(256, 160, (g, w, h) => {
  g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = "#1d2622"; g.font = `800 13px ${SF}`; g.fillText("DIENSTPLAN · NÄCHSTER MONAT", 6, 16);
  for (let i = 0; i < 35; i++) { const x = 6 + (i % 7) * 35, y = 24 + Math.floor(i / 7) * 26; g.strokeStyle = "#ccc"; g.strokeRect(x, y, 33, 24); if (i % 3 !== 1) { g.fillStyle = i % 7 > 4 ? "#c0322a" : "#2d3f8f"; g.fillRect(x + 3, y + 12, 27, 9); } }
}, "roster");
const binderTex = () => canvasTex(256, 128, (g, w, h) => {
  g.fillStyle = "#4a3a2a"; g.fillRect(0, 0, w, h);
  const labels = ["QM", "SOP", "DRG", "2009", "HYG", "MPG", "BTM", "?", "ALT", "DIENST", "QM²", "AKTEN"];
  for (let r = 0; r < 2; r++) for (let i = 0; i < 12; i++) {
    const x = 4 + i * 21, y = 6 + r * 62; g.fillStyle = ["#c0322a", "#2d3f8f", "#1f9d55", "#f2c300", "#7a1fa2", "#e8e4d0"][(i + r * 3) % 6]; g.fillRect(x, y, 18, 54);
    g.fillStyle = "#fff"; g.fillRect(x + 3, y + 30, 12, 9); g.fillStyle = "#111"; g.beginPath(); g.arc(x + 9, y + 47, 3, 0, 7); g.fill();
    g.save(); g.translate(x + 12, y + 26); g.rotate(-Math.PI / 2); g.font = `700 9px ${SF}`; g.fillStyle = "#fff"; g.fillText(labels[(i + r * 5) % labels.length], 0, 0); g.restore();
  }
}, "binders");
const corkTex = () => canvasTex(256, 192, (g, w, h) => {
  g.fillStyle = "#b98a55"; g.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(80,50,20,${Math.random() * .25})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  const notes = [["#fff59a", "Feierabend", "= Mythos"], ["#ffffff", "Wer hat meinen", "Joghurt?!"], ["#9fe0ff", "Dr. Kurz", "schuldet 40€"], ["#ffb3c7", "Kaffeekasse", "leer (wieder)"], ["#ffffff", "DIENSTTAUSCH", "suche Sa → biete alles"], ["#c8f7a0", "M&M Mo 6:30", "Pflicht!!"]];
  notes.forEach(([c, a, b], i) => { const x = 10 + (i % 3) * 82, y = 12 + Math.floor(i / 3) * 90; g.save(); g.translate(x + 36, y + 36); g.rotate((Math.random() - .5) * .2); g.fillStyle = c; g.fillRect(-36, -34, 72, 70); g.fillStyle = "#c0322a"; g.beginPath(); g.arc(0, -28, 4, 0, 7); g.fill(); g.fillStyle = "#222"; g.font = `700 10px ${SF}`; g.textAlign = "center"; g.fillText(a, 0, -4); g.fillText(b, 0, 12); g.restore(); });
}, "cork");
const calendarTex = () => canvasTex(128, 160, (g, w, h) => {
  g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = "#c0322a"; g.fillRect(0, 0, w, 34); g.fillStyle = "#fff"; g.font = `800 15px ${SF}`; g.textAlign = "center"; g.fillText("DIENSTE", w / 2, 22);
  g.fillStyle = "#1d2622"; g.font = `600 9px ${SF}`;
  for (let i = 0; i < 30; i++) { const x = 6 + (i % 6) * 20, y = 46 + Math.floor(i / 6) * 22; g.fillText(String(i + 1), x + 8, y); if (i % 4 !== 2) { g.strokeStyle = "#c0322a"; g.beginPath(); g.moveTo(x, y - 9); g.lineTo(x + 16, y + 4); g.stroke(); } }
}, "cal");
const stickyTex = (text, color) => canvasTex(64, 64, (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); g.fillStyle = "#222"; g.font = `700 10px ${SF}`; g.textAlign = "center"; text.split("|").forEach((t, i) => g.fillText(t, w / 2, 22 + i * 13)); }, "st" + text + color);
const mugTex = text => canvasTex(128, 64, (g, w, h) => { g.fillStyle = "#f6f6f2"; g.fillRect(0, 0, w, h); g.fillStyle = "#c0322a"; g.font = `800 12px ${SF}`; g.textAlign = "center"; text.split("|").forEach((t, i) => g.fillText(t, w / 2, 26 + i * 15)); }, "mug" + text);
const pizzaTex = () => canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#d8c29a"; g.fillRect(0, 0, w, h); g.fillStyle = "#c0322a"; g.font = `900 22px ${SF}`; g.textAlign = "center"; g.fillText("PIZZA", w / 2, 52); g.font = `700 13px ${SF}`; g.fillText("Nachtdienst-", w / 2, 76); g.fillText("Edition", w / 2, 92); }, "pizza");
const flatTex = (lines, bg, fg, w = 256, h = 128, size = 26) => textTex(lines, bg, fg, w, h, size);
const keyboardTex = () => canvasTex(128, 48, (g, w, h) => { g.fillStyle = "#2b2b2b"; g.fillRect(0, 0, w, h); g.fillStyle = "#5a5a5a"; for (let r = 0; r < 4; r++) for (let i = 0; i < 14; i++) g.fillRect(3 + i * 9, 4 + r * 11, 7, 8); }, "kbd");
const paintingTex = () => canvasTex(128, 96, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#9fc8e8"); gr.addColorStop(.6, "#e8d8a8"); gr.addColorStop(.61, "#6a9a5a"); gr.addColorStop(1, "#4a7a3a"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "#f2c300"; g.beginPath(); g.arc(96, 22, 10, 0, 7); g.fill(); g.fillStyle = "#3a5a2a"; g.beginPath(); g.moveTo(10, 60); g.lineTo(40, 30); g.lineTo(70, 62); g.fill(); }, "paint");
const aedTex = () => canvasTex(96, 96, (g, w, h) => { g.fillStyle = "#1f9d55"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.font = `900 22px ${SF}`; g.textAlign = "center"; g.fillText("AED", w / 2, 40); g.font = `700 10px ${SF}`; g.fillText("Batterie leer", w / 2, 62); g.fillText("seit 2020", w / 2, 76); }, "aed");
const liftTex = n => canvasTex(64, 32, (g, w, h) => { g.fillStyle = "#111"; g.fillRect(0, 0, w, h); g.fillStyle = "#ff3a2a"; g.font = `800 22px monospace`; g.textAlign = "center"; g.fillText(n, w / 2, 24); }, "lift" + n);

// ---------- small helpers ----------
const grp = (...kids) => { const g = new THREE.Group(); for (const k of kids) g.add(k); return g; };
const plate = (map, w, h, transparent) => { const m = new THREE.Mesh(GEO.plane, transparent ? new THREE.MeshLambertMaterial({ map, transparent: true }) : lambert(0xffffff, map)); m.scale.set(w, h, 1); return m; };
const glowMat = color => { const k = "glow" + color; if (!matCache.has(k)) matCache.set(k, new THREE.MeshBasicMaterial({ color })); return matCache.get(k); };
const metal = c => phong(c, 70);

// ---------- office ----------
function monitorModel(map, w = .55) {
  const g = new THREE.Group(), m = monitorMesh(map); m.scale.set(w, w * .62, .04); m.position.set(0, .34, 0); g.add(m);
  g.add(at(boxMesh(.05, .2, .05, 0x2a2a2a), 0, .12, -.05)); g.add(at(boxMesh(.22, .02, .16, 0x2a2a2a), 0, .01, -.04));
  return g;
}
function phoneModel() {
  const g = new THREE.Group();
  const base = boxMesh(.2, .06, .22, 0xd8d4c8); base.rotation.x = -.15; base.position.y = .04; g.add(base);
  g.add(at(boxMesh(.12, .015, .08, 0x9a9688), 0, .08, .04));
  const hs = boxMesh(.05, .045, .24, 0xd8d4c8); hs.position.set(-.06, .1, 0); g.add(hs);
  for (const z of [-.11, .11]) g.add(at(boxMesh(.07, .05, .06, 0xc8c4b8), -.06, .1, z));
  for (let i = 0; i < 5; i++) { const t = mesh(GEO.torus, lambert(0x2a2a2a), .025); t.rotation.y = Math.PI / 2; t.position.set(-.12 - i * .015, .07, .05 - i * .02); g.add(t); }
  g.userData.ring = base;
  return g;
}
function deskLamp(on = true) {
  const g = new THREE.Group();
  g.add(at(mesh(GEO.cyl, lambert(0x2a2a2a), .08, .02, .08), 0, .01, 0));
  const a1 = mesh(GEO.cyl, lambert(0x2a2a2a), .012, .32, .012); a1.position.set(0, .16, -.03); a1.rotation.x = -.25; g.add(a1);
  const a2 = mesh(GEO.cyl, lambert(0x2a2a2a), .012, .3, .012); a2.position.set(0, .36, .08); a2.rotation.x = 1.0; g.add(a2);
  const shade = mesh(GEO.cyl, lambert(0x1f9d55), .07, .1, .07); shade.geometry = GEO.taper; shade.position.set(0, .44, .22); shade.rotation.x = .5; g.add(shade);
  g.add(at(mesh(GEO.ball, glowMat(on ? 0xfff2c0 : 0x555555), .035), 0, .4, .24));
  return g;
}
function mugModel(text, coffee = true, mold = false) {
  const g = new THREE.Group(), m = new THREE.Mesh(GEO.cyl, lambert(0xffffff, mugTex(text || "WORLD'S|OKAYEST DOC"))); m.scale.set(.045, .1, .045); m.position.y = .05; g.add(m);
  const h = mesh(GEO.torus, lambert(0xf6f6f2), .03); h.position.set(.05, .05, 0); g.add(h);
  if (coffee) g.add(at(mesh(GEO.cyl, lambert(mold ? 0x6a8a4a : 0x3a2414), .04, .005, .04), 0, .095, 0));
  return g;
}
function paperStack(n = 6, rnd = Math.random) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) { const p = boxMesh(.24, .012, .32, i % 4 ? 0xfbfaf4 : 0xf2e8b8); p.position.set((rnd() - .5) * .03, .006 + i * .013, (rnd() - .5) * .03); p.rotation.y = (rnd() - .5) * .35; g.add(p); }
  return g;
}
function sticky(text, color = "#fff59a") { return plate(stickyTex(text, color), .08, .08); }
function penCup() {
  const g = grp(at(mesh(GEO.cyl, lambert(0x2d3f8f), .035, .1, .035), 0, .05, 0));
  for (let i = 0; i < 5; i++) { const p = mesh(GEO.cyl, lambert([0x2b7bb9, 0xc0322a, 0x111111, 0x1f9d55, 0xf2c300][i]), .006, .14, .006); p.position.set((i - 2) * .012, .13, (i % 2 - .5) * .02); p.rotation.z = (i - 2) * .12; g.add(p); }
  return g;
}
/* desk against the wall: back edge at z = 0 */
function deskModel(opt = {}) {
  const g = new THREE.Group(), W = opt.w || 1.6, D = .72, top = .76, wood = opt.wood || 0xc9b38f;
  g.add(at(boxMesh(W, .04, D, wood), 0, top, D / 2));
  g.add(at(boxMesh(.04, top, D - .04, 0x9aa3a0), -W / 2 + .03, top / 2, D / 2)); g.add(at(boxMesh(.04, top, D - .04, 0x9aa3a0), W / 2 - .03, top / 2, D / 2));
  g.add(at(boxMesh(.42, .6, D - .08, 0xd8d0c0), W / 2 - .28, .34, D / 2)); for (let i = 0; i < 3; i++) g.add(at(boxMesh(.06, .015, .01, 0x666666), W / 2 - .28, .2 + i * .19, D - .035));
  g.add(at(boxMesh(W - .1, .3, .02, 0x8a948f), 0, .55, .04));
  return g;
}
function keyboardModel() { const k = new THREE.Mesh(GEO.box, [lambert(0x2b2b2b), lambert(0x2b2b2b), lambert(0xffffff, keyboardTex()), lambert(0x2b2b2b), lambert(0x2b2b2b), lambert(0x2b2b2b)]); k.scale.set(.44, .02, .15); return k; }
function workstation(screens, opt = {}) {
  const g = deskModel(opt), top = .78;
  screens.forEach((map, i) => { const m = monitorModel(map); m.position.set((i - (screens.length - 1) / 2) * .6 - (opt.shift || 0), top, .22); m.rotation.y = (i - (screens.length - 1) / 2) * -.25; g.add(m); });
  const kb = keyboardModel(); kb.position.set(-(opt.shift || 0), top + .01, .5); g.add(kb);
  g.add(at(boxMesh(.06, .025, .1, 0x2b2b2b), .32 - (opt.shift || 0), top + .012, .52));
  return g;
}
function officeChair(broken, color = 0x2b2f3a) {
  const g = new THREE.Group(), seat = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2, leg = boxMesh(.3, .03, .04, 0x333333); leg.position.set(Math.cos(a) * .15, .07, Math.sin(a) * .15); leg.rotation.y = -a; g.add(leg);
    if (!(broken && i === 2)) { const w = mesh(GEO.ball, lambert(0x111111), .035); w.position.set(Math.cos(a) * .29, .035, Math.sin(a) * .29); g.add(w); }
  }
  g.add(at(mesh(GEO.cyl, lambert(0x555555), .03, .32, .03), 0, .24, 0));
  seat.add(at(boxMesh(.48, .08, .46, color), 0, 0, 0));
  const back = boxMesh(.46, .52, .07, color); back.position.set(0, .3, -.22); if (broken) { back.rotation.x = -.6; back.position.set(0, .22, -.32); } seat.add(back);
  for (const s of [-1, 1]) seat.add(at(boxMesh(.04, .16, .3, 0x333333), s * .26, .1, 0));
  if (broken) { const tape = boxMesh(.5, .085, .08, 0xc8c8c8); tape.rotation.y = .5; seat.add(tape); }
  seat.position.y = .44; g.add(seat);
  if (broken) { g.rotation.z = .12; g.add(at(mesh(GEO.ball, lambert(0x111111), .035), .55, .035, .3)); }
  return g;
}
function plasticChair(color = 0x2b7bb9) {
  const g = new THREE.Group();
  g.add(at(boxMesh(.44, .04, .42, color), 0, .45, 0)); const b = boxMesh(.44, .42, .04, color); b.position.set(0, .68, -.2); b.rotation.x = -.12; g.add(b);
  for (const [x, z] of [[-.19, -.18], [.19, -.18], [-.19, .18], [.19, .18]]) g.add(at(boxMesh(.025, .45, .025, 0x8a8f8a), x, .22, z));
  return g;
}
function chairRow(n, color) { const g = new THREE.Group(); g.add(at(boxMesh(n * .5, .04, .06, 0x6a6f6a), 0, .32, 0)); for (let i = 0; i < n; i++) g.add(at(plasticChair(color), (i - (n - 1) / 2) * .5, 0, 0)); return g; }
function binderShelf(w = 1.4, h = 2) {
  const g = new THREE.Group(); g.add(at(boxMesh(w, h, .4, 0x8a6a4a), 0, h / 2, .2));
  for (let i = 0; i < 2; i++) { const p = plate(binderTex(), w - .08, h * .4); p.position.set(0, h * (.27 + i * .45), .41); g.add(p); }
  return g;
}
function coatRack() {
  const g = new THREE.Group(); g.add(at(mesh(GEO.cyl, lambert(0x5a4a3a), .025, 1.8, .025), 0, .9, 0)); g.add(at(mesh(GEO.cyl, lambert(0x3a2a1a), .2, .03, .2), 0, .015, 0));
  for (let i = 0; i < 2; i++) {
    const c = mesh(GEO.coat, lambert(0xf6f8f7), .17, .95, .13); c.position.set(i ? .14 : -.12, 1.15, i ? .06 : -.04); c.rotation.z = i ? -.08 : .1; g.add(c);
    g.add(at(mesh(GEO.ball, lambert(0xf6f8f7), .12, .06, .1), c.position.x, 1.66, c.position.z));
  }
  const st = mesh(GEO.steth, lambert(0x222222), 1); st.position.set(.14, 1.45, .2); g.add(st);
  return g;
}
function deadPlant() {
  const g = grp(at(mesh(GEO.pot, lambert(0xb5653a), 1), 0, .2, 0), at(mesh(GEO.cyl, lambert(0x3a2a1a), .2, .02, .2), 0, .39, 0));
  for (let i = 0; i < 6; i++) { const l = mesh(GEO.cyl, lambert(i % 2 ? 0x8a6a2a : 0x6a5a2a), .012, .4, .012); const a = i / 6 * Math.PI * 2; l.position.set(Math.cos(a) * .1, .5, Math.sin(a) * .1); l.rotation.set(Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1); g.add(l); }
  return g;
}
function livePlant(big) {
  const g = grp(at(mesh(GEO.pot, lambert(0xe8e2d8), big ? 1.3 : 1), 0, big ? .26 : .2, 0));
  for (let i = 0; i < (big ? 5 : 3); i++) g.add(at(mesh(GEO.leaf, lambert(i % 2 ? 0x3f8a4a : 0x5aa05a), big ? 1.1 : .8), (Math.random() - .5) * .3, (big ? .8 : .55) + i * .15, (Math.random() - .5) * .3));
  return g;
}
function trashBin(full) {
  const g = grp(at(mesh(GEO.bucket, lambert(0x6a6f6a), 1.1, 1.6, 1.1), 0, .26, 0));
  if (full) { for (let i = 0; i < 6; i++) g.add(at(mesh(GEO.ball, lambert(0xfbfaf4), .07), (Math.random() - .5) * .25, .52 + Math.random() * .12, (Math.random() - .5) * .25)); const pz = new THREE.Mesh(GEO.box, [lambert(0xd8c29a), lambert(0xd8c29a), lambert(0xffffff, pizzaTex()), lambert(0xd8c29a), lambert(0xd8c29a), lambert(0xd8c29a)]); pz.scale.set(.42, .05, .42); pz.position.set(.05, .66, 0); pz.rotation.set(.15, .4, .1); g.add(pz); }
  return g;
}
function coffeeMachine() {
  const g = new THREE.Group();
  g.add(at(boxMesh(.36, .46, .32, 0x222222), 0, .23, .16)); g.add(at(boxMesh(.3, .08, .26, 0x333333), 0, .5, .14));
  const pot = new THREE.Mesh(GEO.cyl, new THREE.MeshPhongMaterial({ color: 0x9fb8c4, transparent: true, opacity: .55, shininess: 100 })); pot.scale.set(.08, .14, .08); pot.position.set(0, .1, .27); g.add(pot);
  g.add(at(mesh(GEO.cyl, lambert(0x2a1a0a), .07, .02, .07), 0, .04, .27));
  const sign = plate(flatTex(["DEFEKT", "eingespart 03/24"], "#c0322a", "#fff", 256, 110, 34), .32, .14); sign.position.set(0, .34, .33); g.add(sign);
  return g;
}
function microwave() { const g = grp(at(boxMesh(.48, .28, .34, 0xe8e8e4), 0, .14, .17)); const d = plate(flatTex(["0:00"], "#1a1a1a", "#3cff8a", 128, 80, 22), .3, .2); d.position.set(-.05, .14, .345); g.add(d); return g; }
function sideboard(w = 1.4) { const g = grp(at(boxMesh(w, .86, .55, 0xe8e2d8), 0, .43, .28), at(boxMesh(w + .04, .04, .58, 0x9aa3a0), 0, .88, .29)); for (let i = -1; i <= 1; i += 2) g.add(at(boxMesh(.12, .02, .01, 0x666666), i * w / 4, .7, .56)); return g; }
function onCallBed() {
  const g = new THREE.Group();
  g.add(at(boxMesh(.9, .3, 2, 0x6f7a76), 0, .25, 0)); g.add(at(boxMesh(.86, .14, 1.96, 0x3f6f8a), 0, .47, 0));
  for (let i = 0; i < 3; i++) { const b = boxMesh(.8, .1 + i * .03, .5, 0x9fa7c8); b.position.set((i - 1) * .05, .58, .3 + i * .22); b.rotation.set(.1 * i, .2 * (i - 1), .08); g.add(b); }
  g.add(at(boxMesh(.55, .12, .35, 0xffffff), 0, .6, -.75));
  return g;
}
function corkBoard() { const g = new THREE.Group(); g.add(at(boxMesh(1.25, .95, .04, 0x5a4a3a), 0, 0, .02)); const p = plate(corkTex(), 1.15, .86); p.position.z = .045; g.add(p); return g; }
function whiteboard(map, w = 2.2, h = 1.25) { const g = new THREE.Group(); g.add(at(boxMesh(w + .08, h + .08, .04, 0x9aa3a0), 0, 0, .02)); const p = plate(map, w, h); p.position.z = .045; g.add(p); g.add(at(boxMesh(w * .7, .04, .08, 0x9aa3a0), 0, -h / 2 - .03, .06)); return g; }
function framed(map, w, h, frame = 0x3a3a3a) { const g = grp(at(boxMesh(w + .06, h + .06, .03, frame), 0, 0, .015)); const p = plate(map, w, h); p.position.z = .035; g.add(p); return g; }

// ---------- patient rooms ----------
function medRail(n = 1) {
  const g = new THREE.Group(); g.add(at(boxMesh(1.6, .2, .08, 0xe8ecef), 0, 0, .04));
  const cols = [0x1f9d55, 0xf2f2f2, 0xf2c300, 0x2b7bb9];
  for (let i = 0; i < 4; i++) g.add(at(mesh(GEO.cyl, lambert(cols[i]), .025, .05, .025), -.5 + i * .33, -.02, .1).rotateX(Math.PI / 2));
  g.add(at(boxMesh(.12, .06, .04, 0xc0322a), .62, .03, .09));
  return g;
}
function bedsideTable() {
  const g = grp(at(boxMesh(.45, .75, .45, 0xe8e2d8), 0, .375, .23), at(boxMesh(.36, .01, .01, 0x888888), 0, .55, .46));
  g.add(at(mesh(GEO.cyl, new THREE.MeshPhongMaterial({ color: 0xcfe8ff, transparent: true, opacity: .6 }), .035, .1, .035), .1, .8, .25));
  g.add(at(boxMesh(.12, .02, .06, 0x333333), -.08, .76, .2));
  return g;
}
function wallTV() { const g = new THREE.Group(); g.add(at(boxMesh(.08, .08, .4, 0x333333), 0, 0, .2)); const tv = monitorMesh(flatTex(["Wetter: Regen", "Morgen: Regen", "Feierabend: nie"], "#123", "#9fd8ff", 256, 150, 24)); tv.scale.set(.7, .42, .05); tv.position.set(0, -.05, .42); tv.rotation.x = .15; g.add(tv); return g; }
function sinkModel() {
  const g = new THREE.Group(); g.add(at(boxMesh(.55, .14, .42, 0xf4f4f0), 0, .82, .21)); g.add(at(mesh(GEO.cyl, metal(0xc8ccd0), .015, .18, .015), 0, .96, .05)); g.add(at(boxMesh(.02, .02, .12, 0xc8ccd0), 0, 1.04, .1));
  const mir = new THREE.Mesh(GEO.plane, new THREE.MeshPhongMaterial({ color: 0xb8c8d0, shininess: 120, specular: 0xffffff })); mir.scale.set(.5, .6, 1); mir.position.set(0, 1.45, .015); g.add(mir);
  g.add(at(boxMesh(.1, .2, .08, 0xf4f4f4), .4, 1.2, .04));
  return g;
}
function visitorChair() { const g = plasticChair(0x8a6a4a); return g; }
function curtainWindow(windowMat) {
  const g = new THREE.Group(), w = new THREE.Mesh(GEO.plane, windowMat); w.scale.set(1.5, 1.1, 1); w.position.set(0, 0, .01); g.add(w);
  g.add(at(boxMesh(1.62, .07, .12, 0xdfe4e1), 0, -.58, .05)); g.add(at(boxMesh(.05, 1.1, .05, 0xdfe4e1), 0, 0, .03));
  for (const s of [-1, 1]) { const c = boxMesh(.35, 1.45, .05, 0xb8c8e0); c.position.set(s * .85, -.05, .1); g.add(c); }
  g.add(at(boxMesh(2.1, .04, .04, 0x9aa3a0), 0, .72, .12));
  return g;
}
function ivPole() { return grp(at(mesh(GEO.pole, lambert(0xb9c1bc), 1), 0, .95, 0), at(boxMesh(.18, .28, .06, 0xd8eef8), .1, 1.75, 0), at(mesh(GEO.ball, lambert(0x444444), .1, .03, .1), 0, .03, 0)); }
function wheelchair() {
  const g = new THREE.Group(); g.add(at(boxMesh(.5, .06, .45, 0x2b2f33), 0, .5, 0)); g.add(at(boxMesh(.5, .5, .05, 0x2b2f33), 0, .78, -.22));
  for (const s of [-1, 1]) { const w = mesh(GEO.wheel, lambert(0x555555), .9, .2, .9); w.rotation.z = Math.PI / 2; w.position.set(s * .3, .3, -.05); g.add(w); g.add(at(mesh(GEO.ball, lambert(0x222222), .05), s * .2, .05, .25)); }
  return g;
}
function aedBox() { const g = grp(at(boxMesh(.4, .4, .14, 0xf2f2f2), 0, 0, .07)); const p = plate(aedTex(), .34, .34); p.position.z = .145; g.add(p); return g; }
function sanitizer() { return grp(at(boxMesh(.14, .26, .1, 0xf4f4f4), 0, 0, .05), at(boxMesh(.08, .05, .06, 0x3f8fb3), 0, -.17, .07)); }
function fireHose() { const g = grp(at(boxMesh(.7, .8, .18, 0xc0322a), 0, 0, .09)); const p = plate(flatTex(["LÖSCHSCHLAUCH", "Prüfung: 2011"], "#c0322a", "#fff", 256, 110, 28), .6, .26); p.position.set(0, .2, .185); g.add(p); return g; }
function noticeBoard(lines, bg = "#fff", fg = "#1d2622") { return framed(flatTex(lines, bg, fg, 256, 180, 22), .6, .42, 0x6a6f6a); }
function boxStack(n = 3) { const g = new THREE.Group(); for (let i = 0; i < n; i++) { const b = boxMesh(.5 + Math.random() * .2, .35, .4, pick([0xa8885a, 0x9a7a4a, 0xb89868])); b.position.set((Math.random() - .5) * .3, .18 + i * .35, .25); b.rotation.y = (Math.random() - .5) * .4; g.add(b); } return g; }
function filingCabinet() { const g = grp(at(boxMesh(.45, 1.3, .55, 0x8a948f), 0, .65, .28)); for (let i = 0; i < 4; i++) g.add(at(boxMesh(.16, .03, .02, 0x444444), 0, .25 + i * .3, .56)); return g; }
function leadApron() { const g = new THREE.Group(); g.add(at(boxMesh(.06, .06, .1, 0x555555), 0, 0, .05)); const a = mesh(GEO.coat, lambert(0x2d3f8f), .2, .8, .07); a.position.set(0, -.45, .1); g.add(a); return g; }
function towelRack() { const g = new THREE.Group(); g.add(at(boxMesh(.7, .03, .06, 0xc8ccd0), 0, 0, .05)); for (let i = 0; i < 3; i++) g.add(at(boxMesh(.2, .5, .04, [0xffffff, 0xf6c1d4, 0xc8f0e0][i]), -.22 + i * .22, -.25, .08)); return g; }
function candles() { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { g.add(at(mesh(GEO.cyl, lambert(0xfff6e8), .04, .1 + i * .05, .04), -.1 + i * .1, .05 + i * .025, .15)); g.add(at(mesh(GEO.ball, glowMat(0xffc860), .015), -.1 + i * .1, .12 + i * .05, .15)); } return g; }
function stethoscopeFlat() { const s = mesh(GEO.steth, lambert(0x222222), 1.4); s.rotation.x = -Math.PI / 2; return s; }

// ---------- static geometry merging (big draw-call saver) ----------
function mergeStatic(root, perGeo) {
  root.updateMatrixWorld(true);
  const buckets = new Map();
  const walk = o => {
    if (o.userData.dyn || !o.visible) return;
    if (o.isMesh && !o.isInstancedMesh && !o.isSkinnedMesh && !Array.isArray(o.material) && o.geometry.index && o.geometry.attributes.uv && o.geometry.attributes.normal) {
      const k = o.material.uuid; if (!buckets.has(k)) buckets.set(k, []); buckets.get(k).push(o);
    }
    for (const c of o.children.slice()) walk(c);
  };
  walk(root);
  const nm = new THREE.Matrix3(), v = new THREE.Vector3();
  let merged = 0;
  for (const list of buckets.values()) {
    if (list.length < 2) continue;
    let nv = 0, ni = 0; for (const o of list) { nv += o.geometry.attributes.position.count; ni += o.geometry.index.count; }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), idx = nv > 65000 ? new Uint32Array(ni) : new Uint16Array(ni);
    let vo = 0, io = 0;
    for (const o of list) {
      const g = o.geometry, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, I = g.index, m = o.matrixWorld;
      nm.getNormalMatrix(m);
      for (let i = 0; i < P.count; i++) {
        v.fromBufferAttribute(P, i).applyMatrix4(m); pos[(vo + i) * 3] = v.x; pos[(vo + i) * 3 + 1] = v.y; pos[(vo + i) * 3 + 2] = v.z;
        v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); nor[(vo + i) * 3] = v.x; nor[(vo + i) * 3 + 1] = v.y; nor[(vo + i) * 3 + 2] = v.z;
        uv[(vo + i) * 2] = U.getX(i); uv[(vo + i) * 2 + 1] = U.getY(i);
      }
      const flip = m.determinant() < 0;
      for (let i = 0; i < I.count; i += 3) { const a = I.getX(i), b = I.getX(i + 1), c = I.getX(i + 2); idx[io++] = vo + a; idx[io++] = vo + (flip ? c : b); idx[io++] = vo + (flip ? b : c); }
      vo += P.count;
      o.parent.remove(o); merged++;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeBoundingSphere();
    const mm = new THREE.Mesh(geo, list[0].material); mm.castShadow = true; mm.receiveShadow = true; mm.userData.merged = true;
    root.add(mm); perGeo.push(geo);
  }
  return merged;
}
