/* Hospital Escape 3D · the two worst things that can happen on the ward: an attending who "only needs a minute",
   and a nurse who needs an IV line placed. Both cost real game time. */

// ---------- the attending: three rounds, every answer costs something ----------
function oberarztDialog(e) {
  const goal = run.route && run.route !== "stay" ? mission() : null;
  const s1 = pick([
    { q: "„Ah, Kollege! Gut, dass ich Sie noch erwische. Nur gaaanz kurz.“ Er stellt sich zwischen dich und den Flur. Er hat das geübt.", options: [
      opt("„Ich habe eigentlich Feierabend.“", () => say("„Feierabend.“ Er wiederholt das Wort, als hätte er es noch nie gehört. Dann lacht er. Sehr lange.", pen({ mins: 8 }))),
      opt("„Natürlich, Herr Oberarzt.“", () => say("„So mag ich das.“ Er holt sich erst mal einen Kaffee. Du wartest.", pen({ mins: 6 }))),
      bluff("„Ich werde im Schockraum gebraucht!“", .3, "Er tritt zur Seite. „Gehen Sie. Wir reden morgen. Um 6:30.“", "„Der Schockraum ist leer. Ich komme gerade von da.“ Er legt dir die Hand auf die Schulter. Fest.", { mins: 12, nerves: 1 })] },
    { q: "„Wissen Sie, was ich in Ihrem Alter gemacht habe? 36-Stunden-Dienste. Danach Forschung. Und ich war DANKBAR.“", options: [
      opt("„Das war bestimmt hart.“", () => say("„Hart? Es war WUNDERBAR.“ Er erzählt dir von 1994. Von jedem einzelnen Dienst.", pen({ mins: 14 }))),
      opt("„Und heute haben Sie Rückenschmerzen.“", () => say("Er hält inne. Dann trägt er dich für Silvester ein. Mit Kugelschreiber. Nicht radierbar.", pen({ duties: 1, mins: 4 }))),
      opt("Nicken. Einfach nicken.", () => say("Du nickst 11 Minuten lang. Dein Nacken hat jetzt auch Burnout.", pen({ mins: 11, energy: 10 })))] },
    { q: "Er schaut auf die Uhr. Dann auf dich. „17 Uhr und Sie haben noch Jacke an? Haben Sie etwa vor zu GEHEN?“", options: [
      opt("„Nein, mir ist nur kalt.“", () => say("„Gut. Dann können Sie ja noch die Aufnahmen machen. Die sind warm.“", pen({ mins: 6, tasks: ["2 Aufnahmen (ZNA)"] }))),
      opt("„Doch.“", () => say("Stille. Er notiert sich etwas. Du weißt nicht, was. Das ist das Schlimmste.", pen({ nerves: 1, mins: 4 }))),
      breakFree(20, "Du drehst dich um und gehst. Hinter dir: „WIR SPRECHEN UNS NOCH!“ Ihr sprecht euch noch.")] }]);
  const s2 = pick([
    { q: "„Drei Kleinigkeiten: die Briefe von Zimmer 4 bis 19, die Angehörigen in Zimmer 7, und morgen halten Sie die Fortbildung. Thema: Effizienz.“", options: [
      opt("„Alles klar.“", () => say("„Wusste ich's doch.“ Er klopft dir auf die Schulter. Es klingt wie ein Stempel.", pen({ mins: 5, tasks: ["Briefe Zi. 4–19", "Angehörige Zi. 7", "Fortbildung „Effizienz“"] }))),
      opt("„Nur die Briefe.“", () => say("„Die Fortbildung übernehmen Sie trotzdem. Freiwillig.“ Er betont „freiwillig“ wie eine Diagnose.", pen({ mins: 5, tasks: ["Briefe Zi. 4–19"], duties: 1 }))),
      opt("„Das schaffe ich nicht.“", () => say("„Das sagt jeder. Und dann schafft es jeder.“ Er lächelt wie ein Kalender ohne Feiertage.", pen({ mins: 6, nerves: 1, tasks: ["Briefe Zi. 4–19", "Fortbildung „Effizienz“"] })))] },
    { q: "„Ihre Arztbriefe. Ich habe sie korrigiert.“ Er reicht dir einen Stapel. Mehr Rot als Weiß. Auf Seite 1 steht nur: „Nein.“", options: [
      opt("„Ich schaue sie jetzt mit Ihnen durch.“", () => say("140 Anmerkungen. Bei 38 steht „siehe oben“. Oben steht „siehe unten“.", pen({ mins: 18 }))),
      opt("„Ich mache sie morgen neu.“", () => say("„Heute. Morgen ist Version 8 fällig.“", pen({ mins: 4, tasks: ["Arztbriefe neu (Version 7)"] }))),
      opt("„Die hat die KI geschrieben.“", () => say("„Dann korrigiert die KI eben auch. Bis morgen. Sie sind die KI.“ Er lacht nicht.", pen({ nerves: 1, tasks: ["140 Anmerkungen einarbeiten"] })))] },
    { q: "„Kurze Frage zur Visite morgen, 6:30. Sie stellen alle 34 Patienten vor. Auswendig. Mit Laborwerten. Und dem Kalium von gestern.“", options: [
      opt("„Kalium von gestern war 4,1.“", () => say("„4,2. Aber ich mag Ihren Mut.“ Er gibt dir die Liste trotzdem. Doppelseitig.", pen({ mins: 8, tasks: ["34 Patienten auswendig lernen"] }))),
      opt("„Kann das nicht der PJler?“", () => say("„Jonas? Jonas macht schon die Visite von Station 3. Und die von 4. Er weint, aber er macht sie.“", pen({ mins: 6, duties: 1 }))),
      opt("„Ich hab morgen frei.“", () => say("„Hatten Sie.“ Zwei Wörter. Ein ganzer Urlaub.", pen({ duties: 1, nerves: 1 })))] }]);
  const s3 = pick([
    { q: "„Und, mal ganz offen: Wo sehen Sie sich in fünf Jahren?“", options: [
      opt("„Hier. Natürlich.“", () => say("Er strahlt. Er glaubt es. Du fast auch. Das ist das Traurigste an diesem Abend.", pen({ mins: 6 }))),
      opt(goal ? `„Ehrlich gesagt: ${goal.title}.“` : "„Ehrlich gesagt: zu Hause.“", () => say("„Dann können Sie ja vorher noch Weihnachten machen.“ Er trägt dich ein. Und Silvester, als Bonus.", pen({ duties: 2 }))),
      opt("„Ich sehe mich gar nicht. Ich bin zu müde.“", () => say("„Das nennt man Resilienz.“ Er empfiehlt dir ein Buch. Er hat es geschrieben.", pen({ mins: 10, nerves: 1 })))] },
    { q: "„Ach, und bevor ich's vergesse: Samstag. Sie wissen schon.“ Er weiß, dass du es weißt. Du weißt, dass er es weiß.", options: [
      opt("„Ja.“", () => say("„Teamplayer.“ Er sagt das Wort, als würde er dir einen Orden anheften. Es ist ein Dienstplan.", pen({ duties: 1 }))),
      opt("„Nein.“", () => say("Er schaut dich lange an. Dann sagt er nur: „Interessant.“ Du wirst nachts davon träumen.", pen({ nerves: 2 })), () => run.nerves >= 3 ? "−30 % Energie" : "braucht 60 % Energie", () => run.nerves < 3),
      bluff("„Da ist die Hochzeit meiner Schwester.“", .35, "Er glaubt dir. Du hast keine Schwester. Jetzt schon.", "„Die hat doch schon zweimal dieses Jahr geheiratet.“ Strafdienst.", { duties: 2 })] },
    { q: "„Letzte Sache: Ihre Überstunden. 312. Die verfallen ja leider. Aber das wissen Sie. Sie sind ja nicht wegen des Geldes hier.“", options: [
      opt("„Natürlich nicht.“", () => say("„Eben.“ Er geht. Endlich. Er dreht sich nochmal um. „Ach, und…“ Nein. Doch nicht. Doch. Doch nicht.", pen({ mins: 5 }))),
      opt("„Doch, eigentlich schon.“", () => say("Er schaut dich an wie einen Laborwert, der nicht ins Bild passt. „Interessant. Wir sprechen nächstes Quartal.“", pen({ nerves: 1, mins: 3 }))),
      opt("„Kann ich die spenden? An Dr. Kurz?“", () => say("„Rührend.“ Er nimmt sie. Für sich. „Ich habe auch so viele.“", pen({ mins: 4 })))] }]);
  pen({ mins: 4 }); // he was already talking when you noticed him
  runChain(e, "Ein Oberarzt. Er hat dich gesehen. Es gibt kein Entkommen. (Schon 4 Minuten weg.)", [s1, s2, s3], score => ({
    text: pick(["Er geht. Du schaust auf die Uhr. Die Uhr schaut zurück. Mitleidig.", "Er klopft dir zum Abschied auf die Schulter. Drei Aufgaben fallen heraus. Sie gehören jetzt dir.", "„Schönen Feierabend!“ ruft er. Er meint es nicht ironisch. Das ist das Schlimmste."]),
    stamps: [{ text: "Oberarzt überlebt" }] }));
}

// ---------- the IV line: a realistic peripheral venous catheter ----------
const IV_STEPS = [
  { k: "hand", ico: "🧴", label: "Hände desinfizieren, Handschuhe an" },
  { k: "stau", ico: "🎗️", label: "Stauschlauch anlegen" },
  { k: "palp", ico: "👆", label: "Vene tasten" },
  { k: "desi", ico: "💦", label: "Haut desinfizieren" },
  { k: "punk", ico: "💉", label: "Punktieren" },
  { k: "lose", ico: "🔓", label: "Stau lösen" },
  { k: "mand", ico: "🗑️", label: "Vene abdrücken, Mandrin ziehen & abwerfen" },
  { k: "fix", ico: "🩹", label: "Verschlussstopfen, fixieren, spülen" },
];
const IV_WRONG = {
  punk_desi: "Punktion ohne Desinfektion. Die Hygienefachkraft hat es gespürt. Durch drei Stockwerke.",
  punk_stau: "Ohne Stau ist die Vene flach wie das Budget. Erst stauen.",
  palp_stau: "Du tastest. Du tastest. Nichts. Ohne Stau keine Vene.",
  palp_desi: "Nachgetastet nach der Desinfektion: unsteril. Nochmal desinfizieren.",
  mand_lose: "Mandrin raus, Stau noch drauf: Das Blut spritzt im Bogen auf deinen Kittel. Die Pflege macht ein Foto. Für die Gruppe.",
  fix_lose: "Du klebst das Pflaster über den Stauschlauch. Die Hand wird langsam lila. Erst den Stau lösen.",
  stau_hand: "Erst die Hände. Die Pflege räuspert sich. Laut.",
  desi_palp: "Wo genau willst du desinfizieren? Erst die Vene finden.",
};
function accessGame(who, done) {
  const pat = pick(["Hr. Brösel, Zi. 12 („Bei mir findet keiner was. Ich hab Rollvenen.“)", "Fr. Schulze, Zi. 7 („Die Letzte hat sechsmal gestochen. Ich zähle mit.“)", "Hr. Meier, Zi. 3 („Bitte nicht links, da ist mein Tattoo.“)", "Fr. Kowalski, Zi. 9 („Ich gucke weg. Sagen Sie mir NICHT, wann.“)"]);
  const ov = document.createElement("div"); ov.id = "access";
  const order = IV_STEPS.map((s, i) => i).sort(() => Math.random() - .5);
  ov.innerHTML = `<div class="iv-card"><div class="iv-head"><b>PERIPHERER VENENZUGANG · 20 G (ROSA)</b><small>${esc(pat)}</small></div>
    <canvas class="iv-cv"></canvas><div class="iv-msg">Was machst du zuerst?</div>
    <div class="iv-steps">${order.map(i => `<button type="button" class="iv-btn" data-k="${IV_STEPS[i].k}"><span>${IV_STEPS[i].ico}</span>${esc(IV_STEPS[i].label)}</button>`).join("")}</div>
    <div class="iv-skill" hidden><button type="button" class="iv-stretch">✋ Haut spannen</button><button type="button" class="iv-act"></button></div>
    <div class="iv-foot"><span class="iv-tries">Versuch 1 von 2</span><span class="iv-lost">+0 Min</span></div></div>`;
  document.body.appendChild(ov); mode = "dialog"; clearInputs();
  const cv = ov.querySelector(".iv-cv"), g = cv.getContext("2d"), msg = ov.querySelector(".iv-msg"), stepsEl = ov.querySelector(".iv-steps"), skill = ov.querySelector(".iv-skill"), actBtn = ov.querySelector(".iv-act"), stretchBtn = ov.querySelector(".iv-stretch");
  const dpr = Math.min(2, devicePixelRatio || 1); const fit = () => { const r = cv.getBoundingClientRect(); cv.width = r.width * dpr; cv.height = r.height * dpr; }; fit();
  const easy = settings.diff === "easy";
  const st = { i: 0, wrong: 0, tries: 1, stau: false, desiT: 0, desiUntil: 0, site: null, phase: "steps", ang: 0, angDir: 1, depth: 0, thread: 0, holding: false, needle: null, fixed: false, over: false, stretchUntil: 0, roll: 0, t: 0, bruise: [] };
  // the forearm, palm up: three superficial veins; the one you choose to puncture is the cephalic vein in the middle of the forearm
  const veins = () => { const W = cv.width, H = cv.height; return [
    { p: [[W * .04, H * .36], [W * .28, H * .3], [W * .52, H * .38], [W * .8, H * .33]], w: 1 },
    { p: [[W * .04, H * .58], [W * .3, H * .5], [W * .56, H * .6], [W * .82, H * .52]], w: 1.25, main: true },
    { p: [[W * .2, H * .72], [W * .4, H * .62], [W * .56, H * .7], [W * .78, H * .66]], w: .8 }]; };
  const bez = (p, t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]); };
  const rollOff = () => (st.phase === "aim" ? Math.sin(st.t * 2.4) * (performance.now() < st.stretchUntil ? 2 : 15) * dpr : 0); // a rolling vein slides away under the needle
  const veinPt = t => { const v = veins()[1]; const [x, y] = bez(v.p, t); return [x, y + rollOff()]; };
  const lumen = { a: .42 + Math.random() * .12 }; lumen.b = lumen.a + (easy ? .22 : .16); // where the needle tip is inside the vein (depth along the needle)
  const lostNow = () => 3 + st.wrong + (st.tries - 1) * 3;
  const say = (t, bad) => { msg.textContent = t; msg.classList.toggle("bad", !!bad); if (bad) { msg.classList.remove("shake"); void msg.offsetWidth; msg.classList.add("shake"); } };
  const foot = () => { ov.querySelector(".iv-tries").textContent = `Versuch ${st.tries} von 2`; ov.querySelector(".iv-lost").textContent = "+" + lostNow() + " Min"; };
  const wrong = (key, why) => { st.wrong++; sfx.knock(); say(IV_WRONG[key] || why || "Nicht jetzt. Überleg nochmal, was zuerst kommt.", true); foot(); };
  const markDone = k => { const b = stepsEl.querySelector(`[data-k="${k}"]`); b.disabled = true; b.classList.add("ok"); };
  const toSteps = () => { st.phase = "steps"; skill.hidden = true; stepsEl.hidden = false; };
  stepsEl.addEventListener("click", ev => {
    const b = ev.target.closest(".iv-btn"); if (!b || b.disabled || st.phase !== "steps") return;
    const k = b.dataset.k, want = IV_STEPS[st.i].k;
    if (k === "punk" && st.i === 4 && st.desiT > 0) return wrong("", "Einwirkzeit! Das Desinfektionsmittel muss erst trocknen. Sonst brennt es und bringt nichts.");
    if (k !== want) { if (k === "palp" && st.i > 3 && st.i < 5) { st.desiT = 0; st.i = 3; const d = stepsEl.querySelector('[data-k="desi"]'); d.disabled = false; d.classList.remove("ok"); return wrong("palp_desi"); } return wrong(k + "_" + want); }
    if (k === "palp") { st.phase = "palp"; stepsEl.hidden = true; say("Taste die Vene: tippe auf die Stelle, an der du punktieren willst. Prall, elastisch, gerade, nicht an einer Gabelung."); return; }
    if (k === "punk") { st.phase = "aim"; stepsEl.hidden = true; skill.hidden = false; stretchBtn.hidden = false; actBtn.hidden = true; say("Rollvene! Spanne die Haut mit dem Daumen (✋), damit die Vene stillhält, dann tippe genau auf die Vene."); return; }
    markDone(k); st.i++; sfx.paper();
    if (k === "hand") say("Hände desinfiziert, Handschuhe an. Der Patient beobachtet dich wie ein Prüfer.");
    if (k === "stau") { st.stau = true; say("Stauschlauch eine Handbreit oberhalb, so fest, dass der Puls noch tastbar ist. Die Venen füllen sich."); }
    if (k === "desi") { st.desiUntil = performance.now() + (easy ? 2000 : 3000); st.desiT = 3; say("Sprühen, wischen, sprühen. Einwirkzeit abwarten. Nicht mehr tasten!"); }
    if (k === "lose") { st.stau = false; say("Stau gelöst. Der Patient atmet aus. Du auch."); }
    if (k === "mand") { st.needle = "cannula"; say("Vene oberhalb der Kanülenspitze abgedrückt, Mandrin raus, direkt in den Abwurfbehälter. Kein Tropfen."); }
    if (k === "fix") { st.fixed = true; finish(true); }
  });
  stretchBtn.addEventListener("pointerdown", ev => { ev.preventDefault(); st.stretchUntil = performance.now() + 3500; sfx.tick(); stretchBtn.classList.add("on"); say("Haut gespannt. Die Vene liegt still. Jetzt tippen!"); });
  cv.addEventListener("pointerdown", ev => {
    const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) * dpr, y = (ev.clientY - r.top) * dpr;
    let best = 1e9, bt = 0; for (let t = .12; t <= .88; t += .01) { const [px, py] = veinPt(t); const d = Math.hypot(px - x, py - y); if (d < best) { best = d; bt = t; } }
    if (st.phase === "palp") {
      const other = veins().filter(v => !v.main).some(v => { for (let t = .1; t <= .9; t += .02) { const [px, py] = bez(v.p, t); if (Math.hypot(px - x, py - y) < 12 * dpr) return true; } return false; });
      if (best < 15 * dpr) { st.site = bt; toSteps(); st.i++; markDone("palp"); sfx.tick(); say("Da. Prall, elastisch, gerade. Die merkst du dir."); }
      else if (other) { st.wrong++; sfx.knock(); say(pick(["Die ist zu dünn. Da passt keine 20 G rein.", "Gabelung. Da rollt sie dir weg.", "Zu nah am Handgelenk. Da schmerzt es und die Kanüle knickt ab."]), true); foot(); }
      else { st.wrong++; sfx.knock(); say(pick(["Das ist eine Sehne.", "Das ist der Knochen. Der Patient sagt „Au“.", "Da ist nichts. Zumindest nichts Venöses."]), true); foot(); }
    } else if (st.phase === "aim") {
      const [px, py] = veinPt(st.site), near = Math.hypot(px - x, py - y) < 26 * dpr, onVein = Math.abs(py - y) < 8 * dpr;
      if (near && onVein) { st.phase = "angle"; stretchBtn.hidden = true; actBtn.hidden = false; actBtn.textContent = "💉 Einstechen"; st.ang = 0; sfx.tick(); say("Gut gezielt. Jetzt der Winkel: flach, 15 bis 30 Grad. Tippe im grünen Bereich."); }
      else if (near) { st.wrong++; sfx.knock(); say(performance.now() < st.stretchUntil ? "Knapp daneben. Die Vene liegt still, ziel genauer." : "Die Vene ist weggerollt. Erst die Haut spannen (✋), dann zielen.", true); foot(); }
      else { st.wrong++; sfx.knock(); say("Nicht da: an der Stelle, die du getastet hast.", true); foot(); }
    }
  });
  // puncture: angle, then advance in the cross-section until the flashback, then thread the plastic cannula
  const press = ev => {
    ev.preventDefault();
    if (st.phase === "angle") {
      const a = st.ang;
      if (a >= 15 && a <= 30) { st.phase = "advance"; st.depth = 0; actBtn.textContent = "Halten = Nadel vorschieben"; sfx.tick(); say("In der Haut. Langsam vorschieben, bis Blut in der Kammer erscheint, dann SOFORT loslassen."); }
      else if (a > 30) failPuncture("Zu steil. Durch die Vene durchgestochen. Ein Hämatom blüht auf wie eine Aubergine.");
      else { st.wrong++; foot(); sfx.knock(); say("Zu flach, die Nadel schiebt sich nur unter der Haut entlang. Nochmal ansetzen.", true); }
    } else if (st.phase === "advance" || st.phase === "thread") st.holding = true;
  };
  const release = () => {
    if (!st.holding) return; st.holding = false;
    if (st.phase === "advance") {
      if (st.depth >= lumen.a && st.depth <= lumen.b) { st.phase = "thread"; st.thread = 0; actBtn.textContent = "Halten = Plastikkanüle vorschieben"; sfx.ding(); say("Flashback! Nadel festhalten. Jetzt nur die Plastikkanüle über die Nadel in die Vene schieben, ganz bis zum Ansatz."); }
      else if (st.depth < lumen.a) say("Noch kein Blut in der Kammer. Weiter vorschieben (halten).");
    } else if (st.phase === "thread") {
      if (st.thread >= .85) { toSteps(); st.needle = "in"; st.i++; markDone("punk"); sfx.ding(); say("Kanüle sitzt bis zum Ansatz in der Vene. Stahlnadel noch drin lassen. Was jetzt?"); }
      else say("Die Kanüle steckt erst halb. Weiter schieben (halten), sonst rutscht sie raus.");
    }
  };
  actBtn.addEventListener("pointerdown", press); addEventListener("pointerup", release); addEventListener("pointercancel", release);
  function failPuncture(text) {
    sfx.knock(); st.wrong++; if (st.site != null) st.bruise.push(veinPt(st.site));
    if (st.tries >= 2) { say(text + " Zwei Versuche, Schluss. So ist die Regel.", true); return finish(false); }
    st.tries++; toSteps(); st.site = null; st.i = 2; st.desiT = 0; st.desiUntil = 0;
    for (const x of stepsEl.children) if (["palp", "desi", "punk"].includes(x.dataset.k)) { x.disabled = false; x.classList.remove("ok"); }
    say(text + " Tupfer drauf, abdrücken. Neue Kanüle, neue Stelle: nochmal tasten.", true); foot();
  }
  let last = performance.now();
  function loop(now) {
    if (!ov.isConnected) return; const dt = Math.min(.1, (now - last) / 1000); last = now; st.t += dt;
    if (st.desiT > 0) st.desiT = Math.max(0, (st.desiUntil - now) / 1000); // wall-clock, so slow frames don't stretch it
    if (stretchBtn.classList.contains("on") && now > st.stretchUntil) { stretchBtn.classList.remove("on"); if (st.phase === "aim") say("Der Daumen ist abgerutscht. Die Vene rollt wieder. Nochmal spannen."); }
    if (st.phase === "angle") { st.ang += st.angDir * dt * (easy ? 26 : 36); if (st.ang > 50) { st.ang = 50; st.angDir = -1; } if (st.ang < 0) { st.ang = 0; st.angDir = 1; } }
    if (st.phase === "advance" && st.holding) { st.depth += dt * (easy ? .26 : .32); if (st.depth > lumen.b) { st.holding = false; failPuncture("Zu weit vorgeschoben. Durch die Hinterwand der Vene. Es wird blau. Sehr blau."); } }
    if (st.phase === "thread" && st.holding) { st.thread = Math.min(1, st.thread + dt * .45); }
    draw(); requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  const skinGrad = (x0, y0, x1, y1) => { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, "#d9a585"); gr.addColorStop(.25, "#f1c9a5"); gr.addColorStop(.6, "#f6d3b2"); gr.addColorStop(1, "#cf9a78"); return gr; };
  function drawArm(W, H) {
    g.fillStyle = "#dfe8e4"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#e9efe9"; g.fillRect(0, H * .86, W, H * .14); // the drape under the arm
    // forearm (narrowing to the wrist), hand at the right
    g.fillStyle = skinGrad(0, H * .22, 0, H * .86);
    g.beginPath(); g.moveTo(-10, H * .2); g.bezierCurveTo(W * .3, H * .17, W * .6, H * .24, W * .82, H * .3); g.lineTo(W * .82, H * .76); g.bezierCurveTo(W * .6, H * .8, W * .3, H * .86, -10, H * .86); g.closePath(); g.fill();
    // palm up: the heel of the hand, four fingers to the right, the thumb along the top
    g.beginPath(); g.ellipse(W * .87, H * .53, W * .075, H * .25, 0, 0, 7); g.fill();
    for (let i = 0; i < 4; i++) { const fy = H * (.4 + i * .085); g.beginPath(); g.roundRect ? g.roundRect(W * .9, fy - H * .035, W * .14, H * .07, H * .035) : g.rect(W * .9, fy - H * .035, W * .14, H * .07); g.fill(); }
    g.beginPath(); g.ellipse(W * .9, H * .27, W * .06, H * .05, -.4, 0, 7); g.fill();
    g.strokeStyle = "rgba(150,95,70,.3)"; g.lineWidth = 1.2 * dpr; g.beginPath(); g.moveTo(W * .84, H * .4); g.quadraticCurveTo(W * .9, H * .5, W * .86, H * .66); g.stroke(); // palm crease
    g.strokeStyle = "rgba(150,95,70,.35)"; g.lineWidth = 1.5 * dpr; for (const k of [.81, .835]) { g.beginPath(); g.moveTo(W * k, H * .32); g.quadraticCurveTo(W * (k - .01), H * .53, W * k, H * .74); g.stroke(); } // wrist creases
    g.strokeStyle = "rgba(255,240,225,.35)"; g.lineWidth = 6 * dpr; g.beginPath(); g.moveTo(W * .5, H * .47); g.lineTo(W * .8, H * .5); g.stroke(); // tendons
    // veins: faint without the tourniquet, bulging and darker with it
    for (const v of veins()) {
      const [a, b, c, d] = v.p.map(([x, y]) => [x, y + (v.main ? rollOff() : 0)]);
      const wv = (st.stau ? 8 : 4.5) * v.w * dpr;
      g.lineCap = "round"; g.strokeStyle = st.stau ? "rgba(52,78,150,.55)" : "rgba(90,110,170,.2)"; g.lineWidth = wv;
      g.beginPath(); g.moveTo(a[0], a[1]); g.bezierCurveTo(b[0], b[1], c[0], c[1], d[0], d[1]); g.stroke();
      if (st.stau) { g.strokeStyle = "rgba(255,235,220,.35)"; g.lineWidth = wv * .25; g.beginPath(); g.moveTo(a[0], a[1] - wv * .25); g.bezierCurveTo(b[0], b[1] - wv * .25, c[0], c[1] - wv * .25, d[0], d[1] - wv * .25); g.stroke(); }
    }
    for (const [bx, by] of st.bruise) { const gr = g.createRadialGradient(bx, by, 2, bx, by, 26 * dpr); gr.addColorStop(0, "rgba(90,40,110,.6)"); gr.addColorStop(1, "rgba(90,40,110,0)"); g.fillStyle = gr; g.beginPath(); g.arc(bx, by, 26 * dpr, 0, 7); g.fill(); }
    if (st.stau) { g.fillStyle = "#3a6ad0"; g.fillRect(W * .1, H * .17, 14 * dpr, H * .7); g.fillStyle = "#2a4aa0"; g.fillRect(W * .1 - 6 * dpr, H * .15, 26 * dpr, 12 * dpr); }
    if (st.phase === "aim" && performance.now() < st.stretchUntil && st.site != null) { const [x, y] = veinPt(st.site); g.fillStyle = "rgba(240,190,160,.9)"; g.beginPath(); g.ellipse(x + 46 * dpr, y + 4 * dpr, 16 * dpr, 11 * dpr, 0, 0, 7); g.fill(); g.strokeStyle = "rgba(150,95,70,.5)"; g.lineWidth = 1 * dpr; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(x + 12 * dpr + i * 7 * dpr, y - 8 * dpr); g.lineTo(x + 12 * dpr + i * 7 * dpr, y + 10 * dpr); g.stroke(); } } // your thumb stretching the skin
    if (st.site != null) {
      const [x, y] = veinPt(st.site);
      if (st.desiT > 0 || st.i >= 4) { g.fillStyle = st.desiT > 0 ? "rgba(200,230,255,.55)" : "rgba(220,200,160,.22)"; g.beginPath(); g.ellipse(x, y, 34 * dpr, 24 * dpr, 0, 0, 7); g.fill(); }
      if (st.desiT > 0) { g.strokeStyle = "#1f7a8c"; g.lineWidth = 4 * dpr; g.beginPath(); g.arc(x, y - 44 * dpr, 12 * dpr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * st.desiT / 3); g.stroke(); g.fillStyle = "#1f7a8c"; g.font = `700 ${11 * dpr}px ${SF}`; g.textAlign = "center"; g.fillText("Einwirkzeit", x, y - 62 * dpr); }
      if (!st.needle && st.phase !== "aim") { g.strokeStyle = "#c0322a"; g.lineWidth = 2 * dpr; g.beginPath(); g.arc(x, y, 6 * dpr, 0, 7); g.stroke(); }
      if (st.phase === "aim") { g.strokeStyle = "rgba(192,50,42,.9)"; g.setLineDash([4 * dpr, 4 * dpr]); g.lineWidth = 2 * dpr; g.beginPath(); g.arc(veinPt(st.site)[0], veinPt(st.site)[1] - rollOff(), 22 * dpr, 0, 7); g.stroke(); g.setLineDash([]); }
      if (st.needle) { // the cannula from above: catheter in the vein, pink hub, plaster when fixed
        g.save(); g.translate(x, y); g.rotate(-.12); g.fillStyle = "#e8e8ec"; g.fillRect(-26 * dpr, -2 * dpr, 30 * dpr, 4 * dpr); g.fillStyle = "#ff8ab8"; g.fillRect(4 * dpr, -8 * dpr, 22 * dpr, 16 * dpr); g.fillStyle = "#ffb3d0"; g.fillRect(10 * dpr, -14 * dpr, 10 * dpr, 6 * dpr);
        if (st.needle === "in") { g.fillStyle = "#aab"; g.fillRect(26 * dpr, -2 * dpr, 30 * dpr, 4 * dpr); g.fillStyle = "#b01a1a"; g.beginPath(); g.arc(40 * dpr, 0, 4 * dpr, 0, 7); g.fill(); }
        if (st.fixed || st.i >= 7) { g.fillStyle = "rgba(255,255,255,.88)"; g.fillRect(-6 * dpr, -18 * dpr, 34 * dpr, 36 * dpr); g.fillStyle = "#1d2622"; g.font = `700 ${8 * dpr}px ${SF}`; g.textAlign = "center"; g.fillText(fmtTime(run.minutes), 11 * dpr, 14 * dpr); }
        g.restore();
      }
    }
  }
  function drawSection(W, H) {
    // cross-section along the needle: skin, fat, the vein with its walls, deep tissue
    const sk = H * .24, D = H * .82 - sk, ve = sk + lumen.a * D, vh = (lumen.b - lumen.a) * D; // the vein sits exactly where the tip finds blood
    g.fillStyle = "#dfe8e4"; g.fillRect(0, 0, W, sk);
    g.fillStyle = "#e2a689"; g.fillRect(0, sk, W, H * .05);
    g.fillStyle = "#f3d9a0"; g.fillRect(0, sk + H * .05, W, H - sk);
    g.fillStyle = "#c98a7a"; g.fillRect(0, H * .82, W, H * .18);
    g.fillStyle = "#4a5aa0"; g.fillRect(0, ve - 3 * dpr, W, vh + 6 * dpr); g.fillStyle = "#7a1420"; g.fillRect(0, ve, W, vh);
    g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(0, ve + 2 * dpr, W, 3 * dpr);
    g.fillStyle = "#1d2622"; g.font = `700 ${11 * dpr}px ${SF}`; g.textAlign = "left"; g.fillText("Haut", 8 * dpr, sk + 14 * dpr); g.fillText("Vene", 8 * dpr, ve + vh / 2 + 4 * dpr); g.fillText("Hinterwand", 8 * dpr, ve + vh + 16 * dpr);
    // the needle enters at the skin and travels along the chosen angle; depth 0..1 maps from skin to below the vein
    const ang = Math.max(15, Math.min(30, st.ang || 22)) * Math.PI / 180, ey = sk;
    const back = Math.min(sk / Math.sin(ang) * .85, 130 * dpr), ex = Math.max(W * .3, Math.cos(ang) * back + 40 * dpr);
    const dep = st.depth * D / Math.sin(ang), tipX = ex + Math.cos(ang) * dep, tipY = ey + Math.sin(ang) * dep;
    const hx = ex - Math.cos(ang) * back, hy = ey - Math.sin(ang) * back;
    g.strokeStyle = "#b8bec4"; g.lineWidth = 3 * dpr; g.beginPath(); g.moveTo(hx, hy); g.lineTo(tipX, tipY); g.stroke();
    if (st.phase === "thread" || st.needle) { const tl = dep * (.55 + .4 * st.thread); g.strokeStyle = "#ff8ab8"; g.lineWidth = 6 * dpr; g.beginPath(); g.moveTo(hx + Math.cos(ang) * 30 * dpr, hy + Math.sin(ang) * 30 * dpr); g.lineTo(ex + Math.cos(ang) * tl, ey + Math.sin(ang) * tl); g.stroke(); }
    const flash = st.depth >= lumen.a; g.fillStyle = "#ff8ab8"; g.fillRect(hx - 22 * dpr, hy - 12 * dpr, 30 * dpr, 24 * dpr); g.fillStyle = flash ? "#b01020" : "rgba(255,255,255,.7)"; g.fillRect(hx - 16 * dpr, hy - 6 * dpr, 18 * dpr, 12 * dpr);
    g.fillStyle = flash ? "#b01020" : "#1d2622"; g.font = `800 ${12 * dpr}px ${SF}`; g.textAlign = "left"; g.fillText(flash ? (st.phase === "thread" ? "Flashback · Kanüle schieben" : "FLASHBACK!") : "Kammer leer", Math.max(6 * dpr, hx - 20 * dpr), Math.max(14 * dpr, hy - 18 * dpr));
    if (st.phase === "thread") { const bx = W * .62, by = H * .1, bw = W * .32; g.fillStyle = "#1d2622"; g.font = `700 ${11 * dpr}px ${SF}`; g.fillText("Plastikkanüle", bx, by - 5 * dpr); g.fillStyle = "rgba(29,38,34,.85)"; g.fillRect(bx, by, bw, 12 * dpr); g.fillStyle = st.thread >= .85 ? "#1f9d55" : "#ff8ab8"; g.fillRect(bx, by, bw * st.thread, 12 * dpr); g.fillStyle = "#fff"; g.fillRect(bx + bw * .85, by - 3 * dpr, 2 * dpr, 18 * dpr); }
  }
  function drawAngle(W, H) {
    const cx = W * .5, cy = H * .3, R = Math.min(W * .22, H * .24);
    g.fillStyle = "rgba(29,38,34,.85)"; g.beginPath(); g.roundRect ? g.roundRect(cx - R - 14 * dpr, cy - R - 10 * dpr, 2 * R + 28 * dpr, R + 24 * dpr, 10 * dpr) : g.rect(cx - R, cy - R, 2 * R, R); g.fill();
    const toA = d => Math.PI + d * Math.PI / 180 * 1.8;
    g.lineWidth = 8 * dpr; g.strokeStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.arc(cx, cy, R * .8, Math.PI, Math.PI * 2); g.stroke();
    g.strokeStyle = "#1f9d55"; g.beginPath(); g.arc(cx, cy, R * .8, toA(15), toA(30)); g.stroke();
    const an = toA(st.ang); g.strokeStyle = "#fff"; g.lineWidth = 3 * dpr; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(an) * R * .9, cy + Math.sin(an) * R * .9); g.stroke();
    g.fillStyle = "#fff"; g.font = `800 ${13 * dpr}px ${SF}`; g.textAlign = "center"; g.fillText(Math.round(st.ang) + "°", cx, cy - 6 * dpr);
  }
  function draw() {
    const W = cv.width, H = cv.height; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    if (st.phase === "advance" || st.phase === "thread") drawSection(W, H);
    else { drawArm(W, H); if (st.phase === "angle") drawAngle(W, H); }
  }
  ov.cheat = () => finish(true); ov.st = st; ov.lumen = lumen; ov.veinPt = veinPt; ov.dpr = dpr;
  function finish(ok) {
    if (st.over) return; st.over = true;
    const lost = lostNow() + (ok ? 0 : 8);
    removeEventListener("pointerup", release); removeEventListener("pointercancel", release);
    setTimeout(() => { ov.remove(); run.minutes += lost; clockLoss(lost, "Zugang"); mode = "play"; done(ok, lost, st.wrong); }, ok ? 900 : 1600);
    if (ok) { say("Sitzt. Gespült, fixiert, beschriftet. Der Patient: „Hab gar nichts gemerkt.“ Das sagt nie jemand.", false); sfx.ding(); ov.querySelector(".iv-card").classList.add("done"); }
  }
}
function nurseAccessDialog(e) {
  const t = TYPES[e.type], base = { sp: e.person.sp, av: t.av, color: t.color, name: e.name, role: "Pflege · hat dich gefunden" };
  setExpression(e.person, "worried");
  openDialog({ ...base, text: pick(["„Gut, dass du noch da bist! Zimmer 12 braucht einen Zugang. Ich hab's dreimal versucht, der Anästhesist geht nicht ran.“", "„Doktor! Der Zugang in der 7 ist raus. Patient hat ihn gezogen. Selbst. Mit Stolz. Machst du schnell einen neuen?“", "„Ah, perfekt. Der Antibiotika-Slot ist um halb, und der Patient hat keinen Zugang. Du hast doch fünf Minuten?“"]),
    options: [
      { label: "Zugang legen", hint: "Minispiel · kostet Zeit", act: () => ({ next: () => accessGame(e, (ok, lost, wrong) => {
        if (ok) { run.goodwill.N = (run.goodwill.N || 0) + 1; openDialog({ ...base, text: wrong ? `Sitzt. ${e.name} nickt. „Hat gedauert, aber sitzt.“ (${lost} Minuten.)` : `Erster Versuch, kein Fehler. ${e.name} ist sprachlos. „Den Rest mach ich. Geh heim!“`, options: [{ label: "Weiter", act: () => ({ text: "Die Pflege vergisst so etwas nicht. Die Nächste lässt dich durch.", stamps: [good("Goodwill Pflege")] }) }], onClose: () => finishEncounter(e) }); }
        else openDialog({ ...base, text: `Zwei Versuche, zwei Hämatome. ${e.name} ruft den Anästhesisten. Er kommt, gähnt und legt ihn im Vorbeigehen. Ohne hinzusehen.`, options: [{ label: "Würdevoll gehen", act: () => ({ text: "Der Patient winkt dir mit dem blauen Arm nach.", stamps: pen({ nerves: 1 }) }) }], onClose: () => finishEncounter(e) });
      }) }) },
      { label: "„Ich bin nicht mehr im Dienst.“", hint: "−15 % Energie, +1 Dienst", act: () => { finishEncounter(e); return { text: "„Ich auch nicht. Seit 2019.“ Sie hat Zugriff auf den Dienstplan. Jetzt hast du Samstag.", stamps: pen({ nerves: 1, duties: 1 }) }; } },
      bluff("„Jonas, der PJler, ist super darin!“", .45, "Jonas strahlt. Er sticht fünfmal. Beim sechsten sitzt er. Er wird es nie vergessen. Der Patient auch nicht.", "„Jonas hat heute schon drei Patienten durchstochen. Du machst das.“", { mins: 10, nerves: 1 }),
    ], onClose: () => { player.inv = 2; finishEncounter(e); } });
}
