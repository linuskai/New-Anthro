/* Hospital Escape 3D · the closing scene: your escape vehicle leaves the hospital (or the sun rises after the night shift). */
const OUTRO_TEXT = {
  pharma: ["19:04 · A3, Richtung Firmenzentrale", "Fr. Goldmann reicht dir ein Glas Sekt. „Ab morgen heißt Ihr Pieper ‚Outlook‘. Er klingelt nur bis 16 Uhr.“"],
  botox: ["Innenstadt · Praxis Dr. Glatt", "Das Verdeck ist offen. Es regnet. Dr. Glatt reicht dir eine Gurkenscheibe. „Für die Augen. Und für die Seele.“"],
  consult: ["Flughafen · Business-Lounge", "Kevin (27) ruft an: „Erstes Projekt: deine alte Klinik. Wir sparen das Licht im Treppenhaus.“ Im Rückspiegel geht dort gerade das Licht aus."],
  tele: ["Irgendwo · Coworking Space", "Der E-Scooter fährt 19 km/h. Ein Lieferdienst-Fahrrad überholt dich. Egal. Du hast Equity."],
  amt: ["Gesundheitsamt · Zimmer 4.117", "Du radelst durch den Abend. Morgen Gleitzeit ab 7:30. Du darfst sogar um 7:45 kommen. Du weinst ein bisschen vor Glück."],
  ship: ["Hafen · MS Sorgenfrei", "Der Shuttle hält am Kai. Das Schiff hupt dreimal. Dein Pager rutscht dir aus der Tasche, ins Hafenbecken. Hoppla."],
  stay: ["Heimweg · B27", "Du fährst nach Hause. Sechs Stunden Schlaf. Das Klinikum leuchtet im Rückspiegel. Es wartet auf Montag. Es wartet immer."],
  nightER: ["07:30 · Übergabe · Notaufnahme", "Die Schiebetür geht auf. Sonnenlicht. Der Frühdienst schaut in die leere Wartehalle: „Na? Ruhige Nacht gehabt?“ Die Wartenummer-Anzeige zeigt 000. Hinter der Anmeldung winkt Schwester Hildegard. Niemand sonst sieht sie."],
  night: ["07:30 · Übergabe", "Die Sonne geht auf. Der Frühdienst kommt: „Na? Ruhige Nacht gehabt?“ Du sagst nichts. Oben am Fenster winkt Schwester Hildegard. Niemand sonst sieht sie."],
};
/* the mission is won: the fine print under the big banner, and the signs along the road to happiness */
const FREE_SUB = { stay: "… bis Montag, 7:00 Uhr.", pharma: "Dein Pager heißt jetzt „Teams“.", botox: "Privatpatienten haben deine Handynummer.", consult: "80-Stunden-Woche. Aber mit Meilen.", ship: "Auf See bist DU der Hintergrunddienst.", influ: "Dein neuer Chefarzt ist der Algorithmus." };
const FREE_SIGNS = [["FREIHEIT 300 m", "#1f9d55"], ["AB HIER KEIN PAGER-EMPFANG", "#1f3f8a"], ["GLÜCK ➜ GERADEAUS", "#e2483d"], ["ÜBERSTUNDEN: AUSFAHRT GESPERRT", "#f2b33d"], ["SIE VERLASSEN DEN DIENSTPLAN", "#1f3f8a"], ["FEIERABEND ∞ km", "#1f9d55"], ["BITTE NICHT UMDREHEN", "#e2483d"]];
const sunFaceTex = () => canvasTex(256, 256, (g, w) => {
  const gr = g.createRadialGradient(128, 128, 20, 128, 128, 120); gr.addColorStop(0, "#fff7c0"); gr.addColorStop(.7, "#ffd23a"); gr.addColorStop(1, "#ff9a1a");
  g.fillStyle = gr; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.fill();
  g.fillStyle = "#1d1d1d"; rr(g, 52, 92, 66, 38, 14); g.fill(); rr(g, 138, 92, 66, 38, 14); g.fill(); g.fillRect(112, 100, 32, 8);   // sunglasses, of course
  g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(62, 98, 18, 8); g.fillRect(148, 98, 18, 8);
  g.strokeStyle = "#7a3a00"; g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); g.arc(128, 142, 52, .25, Math.PI - .25); g.stroke();              // a very wide grin
  g.fillStyle = "rgba(255,120,90,.5)"; g.beginPath(); g.arc(58, 158, 16, 0, 7); g.fill(); g.beginPath(); g.arc(198, 158, 16, 0, 7); g.fill();
}, "sunface");
const sunRayTex = () => canvasTex(256, 256, (g, w) => { g.translate(128, 128); for (let i = 0; i < 16; i++) { g.rotate(Math.PI / 8); const gr = g.createLinearGradient(0, 0, 0, -128); gr.addColorStop(0, "rgba(255,230,140,.9)"); gr.addColorStop(1, "rgba(255,200,90,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(-12, 0); g.lineTo(12, 0); g.lineTo(3, -128); g.lineTo(-3, -128); g.fill(); } }, "sunrays");
const rainbowTex = () => canvasTex(512, 256, (g, w, h) => { const cols = ["#e2483d", "#f28a2d", "#f2d03d", "#3db85a", "#3d8af2", "#6a4ad8", "#b04ad8"]; g.lineWidth = 13; cols.forEach((c, i) => { g.strokeStyle = c; g.globalAlpha = .8; g.beginPath(); g.arc(w / 2, h, 236 - i * 13, Math.PI, 0); g.stroke(); }); }, "rainbow");
let outro = null;
const skyTex = dawn => canvasTex(16, 256, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  if (dawn) { gr.addColorStop(0, "#3a4a7a"); gr.addColorStop(.45, "#c88aa0"); gr.addColorStop(.62, "#ffcf8a"); gr.addColorStop(.7, "#fff0c8"); gr.addColorStop(1, "#4a5a6a"); }
  else { gr.addColorStop(0, "#1a1f4a"); gr.addColorStop(.42, "#7a3a6a"); gr.addColorStop(.6, "#f08a4a"); gr.addColorStop(.68, "#ffd27a"); gr.addColorStop(1, "#2a2a3a"); }
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}, "sky" + dawn);
const facadeTex = () => canvasTex(512, 256, (g, w, h) => {
  g.fillStyle = "#c9cfcc"; g.fillRect(0, 0, w, h); const r = rng(5);
  for (let y = 0; y < 7; y++) for (let x = 0; x < 16; x++) { const lit = r() < .55; g.fillStyle = lit ? (r() < .15 ? "#bfe4ff" : "#ffe7a8") : "#2a3340"; g.fillRect(8 + x * 31.5, 14 + y * 34, 22, 22); }
  g.fillStyle = "#8a948f"; g.fillRect(0, h - 18, w, 18);
}, "facade");
const asphaltTex = () => { const t = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = "#34373a"; g.fillRect(0, 0, w, h); const r = rng(11);
  for (let i = 0; i < 5000; i++) { const v = r(); g.fillStyle = v < .5 ? `rgba(0,0,0,${r() * .25})` : `rgba(255,255,255,${r() * .09})`; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
  g.strokeStyle = "rgba(10,10,10,.5)"; g.lineWidth = 2; for (let i = 0; i < 3; i++) { g.beginPath(); let x = r() * w, y = 0; g.moveTo(x, y); while (y < h) { x += (r() - .5) * 20; y += 12; g.lineTo(x, y); } g.stroke(); }
  g.fillStyle = "rgba(20,20,20,.35)"; g.beginPath(); g.ellipse(r() * w, r() * h, 30, 14, 0, 0, 7); g.fill();
}, "asphalt"); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 60); return t; };
const paveTex = () => { const t = canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#9a9a94"; g.fillRect(0, 0, w, h); g.strokeStyle = "#7c7c76"; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.stroke(); } const r = rng(4); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${r() * .12})`; g.fillRect(r() * w, r() * h, 2, 2); } }, "pave"); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 120); return t; };
const grassTex = () => { const t = canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#3d5a35"; g.fillRect(0, 0, w, h); const r = rng(8); for (let i = 0; i < 2500; i++) { g.fillStyle = r() < .5 ? "rgba(90,130,60,.5)" : "rgba(20,40,20,.4)"; g.fillRect(r() * w, r() * h, 1, 2 + r() * 3); } }, "grass"); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(80, 80); return t; };
function buildOutro(kind) {
  const dawn = kind === "night", sc = new THREE.Scene();
  sc.background = skyTex(dawn); sc.fog = new THREE.Fog(dawn ? 0xd8b8a8 : 0x8a5a6a, 30, 190);
  sc.add(new THREE.HemisphereLight(dawn ? 0xfff0dd : 0xffc8a0, 0x3a3a4a, .9));
  const sunL = new THREE.DirectionalLight(dawn ? 0xffe0b0 : 0xff9a5a, .9); sunL.position.set(-20, 12, 80); sc.add(sunL);
  sc.environment = ENV_BRIGHT;
  const ground = new THREE.Mesh(GEO.plane, new THREE.MeshStandardMaterial({ map: grassTex(), roughness: 1 })); ground.scale.set(400, 400, 1); ground.rotation.x = -Math.PI / 2; ground.position.y = -.02; sc.add(ground);
  const road = new THREE.Mesh(GEO.plane, new THREE.MeshStandardMaterial({ map: asphaltTex(), roughness: dawn ? .55 : .35, metalness: .1 })); road.scale.set(9, 400, 1); road.rotation.x = -Math.PI / 2; road.position.set(0, .01, 150); sc.add(road);
  const paint = basic(0xd8d4c4);
  for (let z = -10; z < 340; z += 9) { const l = mesh(GEO.plane, paint, .14, 4, 1); l.rotation.x = -Math.PI / 2; l.position.set(0, .02, z); sc.add(l); }
  for (const s of [-1, 1]) {
    const e = mesh(GEO.plane, paint, .12, 400, 1); e.rotation.x = -Math.PI / 2; e.position.set(s * 4.1, .02, 150); sc.add(e);
    sc.add(at(rmesh(.28, .16, 400, .05, 0xb0b0aa), s * 4.64, .08, 150));
    const walk = new THREE.Mesh(GEO.plane, new THREE.MeshStandardMaterial({ map: paveTex(), roughness: .9 })); walk.scale.set(2.6, 400, 1); walk.rotation.x = -Math.PI / 2; walk.position.set(s * 6.08, .15, 150); sc.add(walk);
    sc.add(at(rmesh(.2, .12, 400, .04, 0x8a8a84), s * 7.45, .1, 150));
  }
  // zebra crossing at the hospital entrance
  for (let i = 0; i < 7; i++) { const st = mesh(GEO.plane, paint, .5, 3, 1); st.rotation.x = -Math.PI / 2; st.position.set(-3.3 + i * 1.1, .021, -6); sc.add(st); }
  for (let z = 6; z < 340; z += 24) for (const s of [-1, 1]) {
    const zz = z + (s > 0 ? 12 : 0), pole = phong(0x4a4f53, 60);
    sc.add(at(mesh(GEO.cyl, pole, .07, 6.2, .07), s * 5.4, 3.1, zz)); sc.add(at(mesh(GEO.cyl, pole, .14, .3, .14), s * 5.4, .3, zz));
    const arm = at(rmesh(1.4, .08, .1, .03, pole), s * 4.8, 6.15, zz); arm.rotation.z = s * -.12; sc.add(arm);
    sc.add(at(rmesh(.6, .1, .26, .04, 0x2a2c2e), s * 4.15, 6.05, zz)); sc.add(at(rmesh(.5, .02, .2, .01, basic(0xffe0a8)), s * 4.15, 5.99, zz));
    const glow = sprite(glowTex("rgba(255,214,140,1)"), 2.6, 2.6); glow.material.blending = THREE.AdditiveBlending; glow.position.set(s * 4.15, 5.8, zz); sc.add(glow);
    const pool = new THREE.Mesh(GEO.plane, new THREE.MeshBasicMaterial({ map: poolTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: dawn ? .15 : .5, color: 0xffc880, toneMapped: false })); pool.scale.set(7, 7, 1); pool.rotation.x = -Math.PI / 2; pool.position.set(s * 3.6, .03, zz); sc.add(pool);
  }
  // town: a row of houses behind the trees
  const r2 = rng(21);
  for (let z = 20; z < 330; z += 14 + r2() * 10) for (const s of [-1, 1]) {
    const w = 8 + r2() * 8, h = 6 + r2() * 14, d = 8 + r2() * 4, col = pick([0xd8cfc0, 0xc9b9a8, 0xb8c4c8, 0xe0d8c8, 0xa89888]);
    const fm = lambert(0xffffff, facadeTex()), wall = lambert(col);
    const hb = new THREE.Mesh(GEO.box, [wall, wall, lambert(0x6a5a50), wall, fm, fm]); hb.scale.set(d, h, w); hb.position.set(s * (26 + r2() * 10), h / 2, z); hb.rotation.y = Math.PI / 2; sc.add(hb);
  }
  // the hospital behind you
  const fac = new THREE.Mesh(GEO.box, [lambert(0xc9cfcc), lambert(0xc9cfcc), lambert(0x9aa3a0), lambert(0x9aa3a0), lambert(0xffffff, facadeTex()), lambert(0xffffff, facadeTex())]);
  fac.scale.set(60, 26, 16); fac.position.set(-6, 13, -34); sc.add(fac);
  const park = boxMesh(22, 10, 18, 0x8a8f8a); park.position.set(18, 5, -22); sc.add(park);
  sc.add(at(sprite(labelTex("KLINIKUM ST. SPAREN", "#1f3f8a", "#fff"), 22, 3.6), -6, 28.5, -25));
  sc.add(at(sprite(labelTex("P2 · PERSONAL", "#2d3f8f", "#fff"), 7, 1.2), 18, 11, -12.5));
  if (dawn) { const sunD = sprite(glowTex("rgba(255,230,160,1)"), 40, 40); sunD.material.blending = THREE.AdditiveBlending; sunD.position.set(-30, 8, 170); sc.add(sunD); }
  else { const sunD = sprite(glowTex("rgba(255,160,90,1)"), 90, 90); sunD.material.blending = THREE.AdditiveBlending; sunD.material.fog = false; sunD.position.set(1.6, 12, 300); sc.add(sunD);
    // the road leads straight into a grinning sun with sunglasses, under a rainbow, past signs that promise everything
    const rays = sprite(sunRayTex(), 120, 120); rays.material.blending = THREE.AdditiveBlending; rays.material.fog = false; rays.material.depthWrite = false; rays.position.set(1.6, 13, 298); sc.add(rays); sc.userData.rays = rays;
    const face = sprite(sunFaceTex(), 34, 34); face.material.fog = false; face.position.set(1.6, 13, 296); sc.add(face); sc.userData.face = face;
    const bow = new THREE.Mesh(GEO.plane, new THREE.MeshBasicMaterial({ map: rainbowTex(), transparent: true, depthWrite: false, fog: false, toneMapped: false, side: THREE.DoubleSide })); bow.scale.set(150, 75, 1); bow.position.set(1.6, 37, 240); bow.rotation.y = Math.PI; sc.add(bow); sc.userData.bow = bow;
    FREE_SIGNS.forEach(([t, c], i) => { const s = i % 2 ? -1 : 1, z = 24 + i * 22; sc.add(at(mesh(GEO.cyl, phong(0x8a8f93, 60), .05, 2.6, .05), s * 4.9, 1.3, z)); const sg = sprite(labelTex(t, c, "#fff"), 5.2, 1); sg.position.set(s * 4.9, 3, z); sc.add(sg); });
    const beg = sprite(labelTex("BITTE BLEIB! WIR HABEN KUCHEN", "#ffffff", "#c0322a"), 16, 3); beg.position.set(-6, 22, -25); sc.add(beg); }
  if (kind === "ship") { const ship = new THREE.Group(); ship.add(at(boxMesh(60, 8, 12, 0xf2f2f2), 0, 4, 0)); ship.add(at(boxMesh(40, 6, 10, 0xffffff), -4, 11, 0)); ship.add(at(boxMesh(4, 6, 4, 0x1f7a8c), 8, 17, 0)); ship.add(at(sprite(labelTex("MS SORGENFREI", "#1f7a8c", "#fff"), 18, 3), 0, 22, 0)); ship.position.set(14, 0, 150); ship.rotation.y = .9; ship.scale.setScalar(1.3); sc.add(ship); }
  // trees
  for (let i = 0; i < 40; i++) { const s = i % 2 ? 1 : -1, z = 10 + i * 8, x = s * (9 + Math.random() * 14); sc.add(at(mesh(GEO.cyl, lambert(0x4a3a2a), .25, 2.4, .25), x, 1.2, z)); sc.add(at(mesh(GEO.leaf, lambert(dawn ? 0x4a7a4a : 0x2f4a3a), 4.2), x, 3.6, z)); }
  // the ride
  const route = kind === "night" ? "stay" : kind, veh = vehicleModel(route);
  if (route === "tele" || route === "amt") { const p = makePerson({ skin: SKIN[2], hair: 0x2b1d14, hairStyle: "messy", coat: true, shirt: 0x5aa17a, pants: 0x2f3440, mood: "smile" }); p.group.position.set(0, route === "amt" ? .35 : .18, -.05); p.group.scale.setScalar(.95); veh.add(p.group); }
  veh.rotation.y = 0; dyn(veh); sc.add(veh);
  mergeStatic(sc, []); // ~400 static meshes → a few dozen draw calls
  const cam = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, .1, 500);
  return { sc, cam, veh, t: 0, kind, dur: dawn ? 9.5 : 14 };
}
function playOutro(kind, done) {
  mode = "outro"; clearInputs(); hidePopups();
  outro = buildOutro(kind); outro.done = done;
  const [where, line] = (kind === "night" && nightER() ? OUTRO_TEXT.nightER : OUTRO_TEXT[kind]) || OUTRO_TEXT.stay;
  $("story").hidden = false; document.body.classList.add("cine");
  $("storyTime").textContent = where; $("storyText").textContent = ""; $("btnStoryNext").textContent = "Weiter"; $("btnSkip").hidden = true;
  outro.full = line; outro.shown = 0;
  if (kind === "night") { sfx.ding(); setTimeout(() => sfx.spa(), 600); } else { sfx.car(); freeBanner(kind); }
}
function endOutro() {
  if (!outro) return;
  const d = outro.done; outro = null; const ff = $("freeFx"); if (ff) ff.remove(); if (typeof driveMusic === "function") driveMusic(false);
  $("story").hidden = true; $("btnSkip").hidden = false; document.body.classList.remove("cine");
  if (d) d();
}
function updateOutro(dt) {
  const o = outro; o.t += dt;
  if (o.shown < o.full.length) { o.shown = Math.min(o.full.length, o.shown + dt * 40); $("storyText").textContent = o.full.slice(0, Math.floor(o.shown)); }
  const t = o.t, v = o.veh;
  // vehicle: waits, accelerates away towards the horizon
  const slow = o.kind === "tele" || o.kind === "amt" ? .45 : 1, z = t < 1.2 ? 0 : Math.pow(t - 1.2, 2) * 2.4 * slow;
  v.position.set(o.kind === "stay" || o.kind === "night" ? 1.6 : 1.6, 0, z);
  if (o.kind === "stay" && t > 6.4) v.position.z = Math.max(0, z - Math.pow(t - 6.4, 2) * 9);
  // camera: start beside the car with the hospital behind it, then follow, then let it go
  const cam = o.cam, k = Math.min(1, t / 4);
  cam.position.set(9 - k * 7, 3 + k * .4, 14 + Math.min(z, 18) * .6);
  cam.lookAt(v.position.x * (1 - k * .5), 2.2 - k * .9, v.position.z + 4 * k - 14 * (1 - k));
  cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
  if (o.sc.userData.rays) { o.sc.userData.rays.material.rotation += dt * .25; const b = 1 + Math.sin(t * 3) * .04; o.sc.userData.face.scale.set(34 * b, 34 * b, 1); o.sc.userData.face.material.rotation = Math.sin(t * 1.3) * .08;
    if (t > 6) { const u = Math.min(1, (t - 6) / 5); cam.position.y += u * 5; cam.position.x += (1.6 - cam.position.x) * u; cam.lookAt(1.6, 2 + u * 8, v.position.z + 30 + u * 60); cam.updateProjectionMatrix(); } } // the camera rises and looks into the sun
  if (t > o.dur) endOutro();
}

/* "DU BIST FREI!": banner, stars for the rank, confetti and far too much brass, laid over the drive into the sunset */
function freeBanner(kind) {
  const old = $("freeFx"); if (old) old.remove();
  let stars = 1; try { stars = { S: 3, A: 3, B: 2 }[scoreBreakdown(kind).rank] || 1; } catch (e) {}
  const d = document.createElement("div"); d.id = "freeFx";
  const conf = Array.from({ length: 46 }, (_, i) => `<i style="left:${Math.random() * 100}%;background:${["#e2483d", "#f2b33d", "#3db85a", "#3d8af2", "#b04ad8", "#fff"][i % 6]};animation-delay:${(1.2 + Math.random() * 3).toFixed(2)}s;animation-duration:${(2.6 + Math.random() * 2.4).toFixed(2)}s;transform:rotate(${Math.random() * 360}deg)"></i>`).join("");
  d.innerHTML = `<div class="ff-conf">${conf}</div><div class="ff-mid"><div class="ff-stars">${[0, 1, 2].map(i => `<i class="${i < stars ? "on" : ""}" style="animation-delay:${2 + i * .45}s">★</i>`).join("")}</div><b class="ff-title">DU BIST FREI!</b><small class="ff-sub">${esc(FREE_SUB[kind] || FREE_SUB.stay)}</small></div><div class="ff-birds">🕊️　🕊️　　🕊️</div>`;
  document.body.appendChild(d);
  if (typeof freedomFanfare === "function") freedomFanfare(stars);
  setTimeout(() => d.classList.add("out"), 9500);
}
