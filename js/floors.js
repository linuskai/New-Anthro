/* Hospital Escape 3D · floor flavour: the butler at the dermatology, dermatologists with naive questions and the SPF 50 rule,
   slipping with a proper fall, orthopaedists pumping iron in the corners, emergency patients shuffling like zombies. */

// ---------- dermatology: Butler Ambrosius greets you at the entrance ----------
function butlerDialog(f, base) {
  const first = !run.flags.has("butler"); run.flags.add("butler");
  return openDialog({ ...base, text: first
    ? "„Willkommen in der Dermatologie. Ein Matcha Latte? Hafermilch, lauwarm, wie das Gehalt in der Inneren. Drei Hinweise, wenn Sie gestatten: Gurkenscheiben und Kortison-Tuben liegen am Boden, bitte schleichen. Die Wellness-Liegen sind für Gäste. Und sagen Sie NIE, dass Sie heute noch keine Sonnencreme mit LSF 50 aufgetragen haben. Das macht die Damen und Herren hier sehr … ungehalten.“"
    : "„Noch einen Matcha? Und denken Sie an die Gurken. Und an LSF 50. Immer an LSF 50.“",
    options: [
      { label: "Matcha Latte nehmen", disabled: !!f.matcha, act: () => { f.matcha = true; return { text: "Er reicht dir das Glas mit einer leichten Verbeugung. Es schmeckt nach Rasen und Selbstfürsorge.", stamps: gain({ energy: 20, text: "Matcha" }) }; } },
      { label: "„Warum ist LSF 50 so wichtig?“", act: () => ({ text: "„Die Neonröhren, die Monitore, das Blaulicht der Rettungswagen. Hautalterung, überall. Die Kolleginnen hier werden sehr laut, wenn man das unterschätzt. Sehr laut. Mit Fachbegriffen.“" }) },
      { label: "„Danke, ich muss weiter.“", act: () => ({ text: "„Selbstverständlich. Gleiten Sie. Nicht rutschen. Gleiten.“" }) },
    ] });
}

// ---------- dermatologists: naive questions about the hospital, and the SPF 50 rule ----------
TALKS.R.push(
  { id: "augenringe", go: T("Sie mustert dich lange. Zu lange.", [{ q: "„Warum hast du so tiefe Augenringe? Ist das ein neuer Trend in der Inneren?“", options: [
    opt("„31 Stunden Dienst.“", () => say("Sie hält sich die Hand vor den Mund. „Einunddreißig?! Das ist ja … nachts!“ Sie klebt dir zwei Augenpads auf. Kühlend. Mit Goldpartikeln.", gain({ energy: 10, text: "Augenpads" }))),
    opt("„Contouring. Nennt sich Nachtdienst-Look.“", () => free("„Wie mutig!“ Sie macht ein Foto für die Praxis-Story. #authentic")),
    opt("„Das ist mein Gesicht.“", () => say("„Oh. Oh nein.“ Sie drückt dir eine Visitenkarte in die Hand. „Montag, 9 Uhr. Ich nehme mir Zeit für dich.“", pen({ tasks: ["Termin Augenringe (Montag, 9 Uhr)"] })))] }]) },
  { id: "lsf50", go: T("„Ganz kurze Frage. Rein aus Sorge.“", [{ q: "„Hast du heute schon Sonnencreme aufgetragen? LSF 50? Die Lampen hier sind ja SO hell!“", options: [
    opt("„Natürlich. Zweimal. Und nachgelegt.“", () => free("Sie strahlt. „Endlich mal jemand Vernünftiges aus der Inneren!“ Sie lässt dich durch.")),
    opt("„Nein, ich war heute noch nicht draußen.“", () => { sfx.alarm(); return say("Ihr Lächeln gefriert. „NICHT DRAUSSEN?! Die NEONRÖHREN! Das BLAULICHT vom Monitor! Die HAUTALTERUNG!“ Drei Kolleginnen kommen dazu. Es gibt einen 20-minütigen Vortrag. Mit Folien.", pen({ energy: 15, mins: 20 }), -1); }),
    opt("„In der Inneren ist die Sonne ein Gerücht.“", () => say("Sie wird blass. Dann wütend. „Das ist kein Witz! Das ist UV-A!“ Du bekommst eine Probepackung und eine Belehrung.", pen({ mins: 8 })))] }]) },
  { id: "neon", go: T("", [{ q: "„Wie hältst du das aus? Zwölf Stunden unter Neonröhren! Deine Haut altert doch doppelt so schnell!“", options: [
    opt("„Ich altere sowieso doppelt so schnell. Wegen der Dienste.“", () => free("Sie nickt ernst. „Das erklärt so viel.“ Sie schenkt dir eine Wundercreme-Probe.", [{ text: "🫙 Probe" }])),
    opt("„Ich sehe die Neonröhren kaum. Ich bin ja meistens im Keller.“", () => free("„Im KELLER?“ Sie notiert etwas. Vermutlich einen Notfall.")),
    opt("„Was ist eine Haut?“", () => say("Sie lacht nicht. Sie bucht dir eine Hautanalyse. Für jetzt. Sie dauert.", pen({ mins: 10 })))] }]) },
  { id: "visite", go: T("", [{ q: "„Ist so eine Visite eigentlich wie ein Spa-Rundgang? Mit Tee und leiser Musik?“", options: [
    opt("„Genau. Nur dass der Tee kalt ist und die Musik der Monitoralarm.“", () => free("„Klingt fast entspannend!“ Sie meint es ernst.")),
    opt("„Visite ist, wenn 14 Leute einen Patienten ansehen, und keiner hat Zeit.“", () => free("„Wie ein Gruppenkurs! Toll!“ Sie will mitkommen. Einmal.")),
    opt("Ihr eine Visite vorspielen, in Echtzeit", () => say("Nach 40 Minuten ist sie eingeschlafen. Auf einer Wellness-Liege. Du hast trotzdem 40 Minuten verloren.", pen({ mins: 25 })))] }]) },
  { id: "schlimmsterfall", go: T("", [{ q: "„Was war dein schlimmster Notfall? Unserer war ein Pickel. Am Freitag. Um 14:45!“", options: [
    opt("„Ein Pickel? Am FREITAG? Wie habt ihr das überlebt?“", () => free("„Mit Teamwork und Zinksalbe.“ Sie ist gerührt, dass du fragst.", gain({ nerves: 1 }))),
    opt("„Reanimation auf dem Parkplatz. Im Regen.“", () => free("Sie muss sich setzen. Auf eine Wellness-Liege. „Im REGEN? Mit Make-up?“")),
    opt("„Dieser hier. Ich komme hier nicht raus.“", () => say("Sie umarmt dich. Lange. Sehr lange. Es riecht nach Gurke.", pen({ mins: 5 })))] }]) },
  { id: "nachtdienst3", go: T("", [{ q: "„Was macht ihr Internisten eigentlich nachts? Die Patienten schlafen doch?“", options: [
    opt("„Die Patienten schlafen. Ihre Monitore nicht.“", () => free("„Oh! Wie ein Babyfon!“ Fast richtig.")),
    opt("„Wir schlafen auch. Im Stehen. Am Aufzug.“", () => free("Sie schreibt sich „Stehschlaf“ auf. Für ein Retreat-Konzept.")),
    opt("„Komm doch mal mit. Heute Nacht.“", () => free("Sie lacht. Lange. Dann merkt sie, dass du es ernst meinst, und geht schnell."))] }]) },
);

// ---------- slipping: you slide, you fall, the cucumber flies, stars, you get up again ----------
function slipFall(h) {
  player.fallT = 2.1; h.flyT = 0;
  const el = $("slipFx"); el.className = ""; void el.offsetWidth; el.dataset.t = h.obj === "tube" ? "KORTISON-CRASH!" : "GURKEN-ALARM!"; el.className = "on";
  setTimeout(() => { sfx.knock(); tone(140, 0, .3, "sine", .12, 60); }, 600);
  setTimeout(() => { if (run && mode === "play") setMsg(pick(["Du rappelst dich auf. Würde: 0 %. Hautbild: tadellos.", "Aufgestanden. Der Kittel ist jetzt feuchtigkeitsspendend.", "Wieder auf den Beinen. Irgendwer hat applaudiert."]), 3); }, 2100);
}

// ---------- orthopaedists pumping iron in the corners ----------
function buildGym(lv, group, r) {
  lv.gym = [];
  const spots = [];
  for (let y = 1; y < GH - 1; y++) for (let x = 1; x < GW - 1; x++) if (grid[y][x] === ":" && lv.zone[y * GW + x] === 2) {
    const walls = DIRS.filter(([dx, dy]) => grid[y + dy] && grid[y + dy][x + dx] === "#").length;
    if (walls >= 2) spots.push([x, y]); // a corner
  }
  for (let n = 0; n < 4 && spots.length; n++) {
    const [x, y] = spots.splice(Math.floor(r() * spots.length), 1)[0];
    const sp = { ...TYPES.U.spec(), pose: n % 2 ? "curl" : "flex", acc: n % 2 ? undefined : "shake", lowDetail: true };
    const p = makePerson(sp), g = new THREE.Group(); g.add(p.group);
    const bench = boxMesh(.5, .42, 1.1, 0x2b2f33); bench.position.set(0, .21, -.55); g.add(bench);
    g.add(at(sprite(labelTex(n % 2 ? "SATZ 47 VON ∞" : "KRAFTRAUM-PAUSE", "#2a5f8a", "#fff"), 1.3, .22), 0, 2.45, 0));
    g.position.set((x + .5) * S, 0, (y + .5) * S); g.rotation.y = Math.atan2(GW / 2 - x, GH / 2 - y); group.add(g);
    lv.gym.push({ p, x: x + .5, y: y + .5, gruntT: r() * 4 });
  }
}

// ---------- every frame ----------
function updateFloors(dt) {
  if (!run || !level) return;
  if (player.fallT > 0) player.fallT = Math.max(0, player.fallT - dt);
  for (const h of level.hazards) if (h.kind === "slip" && h.flyT != null && h.flyT < 1.2) { // the slice (or tube) flies up, spins, lands
    h.flyT += dt; const k = Math.min(1, h.flyT / .9);
    h.mesh.position.y = Math.sin(k * Math.PI) * 1.1; h.mesh.rotation.x += dt * 14; h.mesh.rotation.z += dt * 9;
    if (k >= 1) { h.mesh.position.y = 0; h.mesh.rotation.x = 0; h.mesh.rotation.z = 0; h.flyT = 9; }
  }
  for (const g of level.gym || []) {
    animatePerson(g.p, dt, false, .5);
    if ((g.gruntT -= dt) <= 0) { g.gruntT = 3 + Math.random() * 4; if (Math.hypot(g.x - player.x, g.y - player.y) < 6) { tone(120 + Math.random() * 30, 0, .25, "sawtooth", .03, 90); if (Math.random() < .3) setMsg(pick(["„NOCH EINE!“", "„Leg-Day ist Lüge-Day!“", "„Proteinshake? Hast du einen?!“", "„Hngh … Visite … nach dem Satz …“"]), 1.8); } }
  }
  const L = LEVELS[run.idx];
  // the butler greets you as soon as you come close, once per run
  if (L.key === "derma" && run.mode === "mission" && !run.flags.has("butler") && mode === "play") {
    const b = level.friends.find(f => f.kind === "!");
    if (b && Math.hypot(b.x - player.x, b.y - player.y) < 2.2) { clearInputs(); friendDialog(b); }
  }
  // emergency department by day: more shuffling patients, groaning, arms out, looking for a doctor
  if (L.key === "er" && run.mode === "mission") {
    if ((run.zDayT = (run.zDayT ?? 25) - dt) <= 0) { run.zDayT = 30 + Math.random() * 15; if (level.enemies.filter(e => e.type === "Z" && !e.done && !e.gone).length < 7) spawnFar("Z"); }
    if (Math.random() < dt * .35) { const z = level.enemies.find(e => e.type === "Z" && !e.gone && !e.done && Math.hypot(e.x - player.x, e.y - player.y) < 6); if (z) { tone(95 + Math.random() * 25, 0, .8, "sawtooth", .02, 70); noise(0, .6, 300, 2, .025); if (Math.random() < .4) emote(z, pick(["🤕", "🦵", "🤧", "📄"])); } }
  }
}
