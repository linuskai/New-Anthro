/* Hospital Escape 3D · the closing scene: your escape vehicle leaves the hospital (or the sun rises after the night shift). */
const OUTRO_TEXT = {
  pharma: ["19:04 · A3, Richtung Firmenzentrale", "Fr. Goldmann reicht dir ein Glas Sekt. „Ab morgen heißt Ihr Pieper ‚Outlook‘. Er klingelt nur bis 16 Uhr.“"],
  botox: ["Innenstadt · Praxis Dr. Glatt", "Das Verdeck ist offen. Es regnet. Dr. Glatt reicht dir eine Gurkenscheibe. „Für die Augen. Und für die Seele.“"],
  consult: ["Flughafen · Business-Lounge", "Kevin (27) ruft an: „Erstes Projekt: deine alte Klinik. Wir sparen das Licht im Treppenhaus.“ Im Rückspiegel geht dort gerade das Licht aus."],
  tele: ["Irgendwo · Coworking Space", "Der E-Scooter fährt 19 km/h. Ein Lieferdienst-Fahrrad überholt dich. Egal. Du hast Equity."],
  amt: ["Gesundheitsamt · Zimmer 4.117", "Du radelst durch den Abend. Morgen Gleitzeit ab 7:30. Du darfst sogar um 7:45 kommen. Du weinst ein bisschen vor Glück."],
  ship: ["Hafen · MS Sorgenfrei", "Der Shuttle hält am Kai. Das Schiff hupt dreimal. Dein Pager rutscht dir aus der Tasche, ins Hafenbecken. Hoppla."],
  stay: ["Heimweg · B27", "Du fährst nach Hause. Sechs Stunden Schlaf. Das Klinikum leuchtet im Rückspiegel. Es wartet auf Montag. Es wartet immer."],
  night: ["07:00 · Übergabe", "Die Sonne geht auf. Der Frühdienst kommt: „Na? Ruhige Nacht gehabt?“ Du sagst nichts. Oben am Fenster winkt Schwester Hildegard. Niemand sonst sieht sie."],
};
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
function buildOutro(kind) {
  const dawn = kind === "night", sc = new THREE.Scene();
  sc.background = skyTex(dawn); sc.fog = new THREE.Fog(dawn ? 0xd8b8a8 : 0x8a5a6a, 30, 190);
  sc.add(new THREE.HemisphereLight(dawn ? 0xfff0dd : 0xffc8a0, 0x3a3a4a, .9));
  const sunL = new THREE.DirectionalLight(dawn ? 0xffe0b0 : 0xff9a5a, .9); sunL.position.set(-20, 12, 80); sc.add(sunL);
  const ground = mesh(GEO.plane, lambert(0x3a4a3a), 400, 400, 1); ground.rotation.x = -Math.PI / 2; sc.add(ground);
  const road = mesh(GEO.plane, lambert(0x2a2c2e), 8, 400, 1); road.rotation.x = -Math.PI / 2; road.position.set(0, .01, 150); sc.add(road);
  for (let z = -10; z < 340; z += 8) { const l = mesh(GEO.plane, basic(0xe8e4d0), .18, 3.5, 1); l.rotation.x = -Math.PI / 2; l.position.set(0, .02, z); sc.add(l); }
  for (let z = 6; z < 340; z += 22) for (const s of [-1, 1]) {
    sc.add(at(mesh(GEO.cyl, lambert(0x555a5e), .08, 6, .08), s * 5.2, 3, z + (s > 0 ? 11 : 0)));
    sc.add(at(boxMesh(1.2, .12, .3, 0x555a5e), s * 4.7, 6, z + (s > 0 ? 11 : 0)));
    const glow = sprite(glowTex("rgba(255,214,140,1)"), 2.4, 2.4); glow.material.blending = THREE.AdditiveBlending; glow.position.set(s * 4.2, 5.8, z + (s > 0 ? 11 : 0)); sc.add(glow);
  }
  // the hospital behind you
  const fac = new THREE.Mesh(GEO.box, [lambert(0xc9cfcc), lambert(0xc9cfcc), lambert(0x9aa3a0), lambert(0x9aa3a0), lambert(0xffffff, facadeTex()), lambert(0xffffff, facadeTex())]);
  fac.scale.set(60, 26, 16); fac.position.set(-6, 13, -34); sc.add(fac);
  const park = boxMesh(22, 10, 18, 0x8a8f8a); park.position.set(18, 5, -22); sc.add(park);
  sc.add(at(sprite(labelTex("KLINIKUM ST. SPAREN", "#1f3f8a", "#fff"), 22, 3.6), -6, 28.5, -25));
  sc.add(at(sprite(labelTex("P2 · PERSONAL", "#2d3f8f", "#fff"), 7, 1.2), 18, 11, -12.5));
  if (dawn) { const sunD = sprite(glowTex("rgba(255,230,160,1)"), 40, 40); sunD.material.blending = THREE.AdditiveBlending; sunD.position.set(-30, 8, 170); sc.add(sunD); }
  else { const sunD = sprite(glowTex("rgba(255,160,90,1)"), 50, 50); sunD.material.blending = THREE.AdditiveBlending; sunD.position.set(10, 6, 200); sc.add(sunD); }
  if (kind === "ship") { const ship = new THREE.Group(); ship.add(at(boxMesh(60, 8, 12, 0xf2f2f2), 0, 4, 0)); ship.add(at(boxMesh(40, 6, 10, 0xffffff), -4, 11, 0)); ship.add(at(boxMesh(4, 6, 4, 0x1f7a8c), 8, 17, 0)); ship.add(at(sprite(labelTex("MS SORGENFREI", "#1f7a8c", "#fff"), 18, 3), 0, 22, 0)); ship.position.set(14, 0, 150); ship.rotation.y = .9; ship.scale.setScalar(1.3); sc.add(ship); }
  // trees
  for (let i = 0; i < 40; i++) { const s = i % 2 ? 1 : -1, z = 10 + i * 8, x = s * (9 + Math.random() * 14); sc.add(at(mesh(GEO.cyl, lambert(0x4a3a2a), .25, 2.4, .25), x, 1.2, z)); sc.add(at(mesh(GEO.leaf, lambert(dawn ? 0x4a7a4a : 0x2f4a3a), 4.2), x, 3.6, z)); }
  // the ride
  const route = kind === "night" ? "stay" : kind, veh = vehicleModel(route);
  if (route === "tele" || route === "amt") { const p = makePerson({ skin: SKIN[2], hair: 0x2b1d14, hairStyle: "messy", coat: true, shirt: 0x5aa17a, pants: 0x2f3440, mood: "smile" }); p.group.position.set(0, route === "amt" ? .35 : .18, -.05); p.group.scale.setScalar(.95); veh.add(p.group); }
  veh.rotation.y = 0; sc.add(veh);
  const cam = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, .1, 500);
  return { sc, cam, veh, t: 0, kind, dur: 9.5 };
}
function playOutro(kind, done) {
  mode = "outro"; clearInputs(); hidePopups();
  outro = buildOutro(kind); outro.done = done;
  const [where, line] = OUTRO_TEXT[kind] || OUTRO_TEXT.stay;
  $("story").hidden = false; document.body.classList.add("cine");
  $("storyTime").textContent = where; $("storyText").textContent = ""; $("btnStoryNext").textContent = "Weiter"; $("btnSkip").hidden = true;
  outro.full = line; outro.shown = 0;
  if (kind === "night") { sfx.ding(); setTimeout(() => sfx.spa(), 600); } else { sfx.car(); setTimeout(() => sfx.floor(), 500); }
}
function endOutro() {
  if (!outro) return;
  const d = outro.done; outro = null;
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
  if (t > o.dur) endOutro();
}
