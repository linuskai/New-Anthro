/* Hospital Escape 3D · dialogue engine and all conversations. */
let dlgState = null;

// ---------- 3D portraits for the ID badge ----------
let pR = null, pScene = null, pCam = null;
const portraitCache = new WeakMap();
function portraitFor(sp) {
  if (!sp || typeof sp !== "object") return null;
  if (portraitCache.has(sp)) return portraitCache.get(sp);
  try {
    if (!pR) {
      const c = document.createElement("canvas"); c.width = 160; c.height = 172;
      pR = new THREE.WebGLRenderer({ canvas: c, antialias: true, preserveDrawingBuffer: true, alpha: true }); pR.setPixelRatio(1);
      pScene = new THREE.Scene(); pScene.add(new THREE.HemisphereLight(0xffffff, 0x8a9a94, .85));
      const dl = new THREE.DirectionalLight(0xfff4e8, .75); dl.position.set(1.5, 2, 3); pScene.add(dl);
      pCam = new THREE.PerspectiveCamera(26, 160 / 172, .05, 10);
    }
    const p = makePerson({ ...sp, noShadow: true, acc: null, trolley: false });
    pScene.add(p.group); p.group.updateMatrixWorld(true);
    const hp = new THREE.Vector3(); p.head.getWorldPosition(hp);
    pCam.position.set(hp.x + .1, hp.y - .01, hp.z + .7); pCam.lookAt(hp.x, hp.y - .045, hp.z);
    pR.setClearColor(0x000000, 0); pR.render(pScene, pCam);
    const url = pR.domElement.toDataURL("image/png"); pScene.remove(p.group);
    portraitCache.set(sp, url); return url;
  } catch (e) { return null; }
}

// ---------- typewriter ----------
let typeTimer = null;
function typeText(text) {
  const el = $("dlgText"); clearInterval(typeTimer); el.textContent = ""; let i = 0;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { el.textContent = text; return; }
  typeTimer = setInterval(() => { i = Math.min(text.length, i + 3); el.textContent = text.slice(0, i); if (i >= text.length) clearInterval(typeTimer); }, 16);
  el.dataset.full = text;
}
$("dlgBubble").addEventListener("click", () => { clearInterval(typeTimer); const el = $("dlgText"); if (el.dataset.full) el.textContent = el.dataset.full; });

function optIcon(o, i) {
  const h = o.hint || "", l = o.label || "";
  if (/^(„)?Ja[.!]/.test(l) || l === "Ja.") return ["yes", "✓"];
  if (/^(„)?Nein[.!]/.test(l)) return ["no", "✗"];
  if (/%/.test(h)) return ["dice", "🎲"];
  if (/abgeben|verbrauchen|braucht/.test(h)) return ["item", [...h][0]];
  if (/^Losreißen|weg$/.test(l)) return ["run", "🏃"];
  return ["", String(i + 1)];
}
// the person you talk to moves their mouth while the text types
let talker = null;
function setTalker(sp, text) {
  if (talker) talker.talking = false;
  talker = null; if (!level || !sp) return;
  for (const e of level.enemies) if (e.person && e.person.sp === sp) talker = e.person;
  for (const f of level.friends) if (f.person && f.person.sp === sp) talker = f.person;
  if (!talker) return;
  const who = talker; who.talking = true; clearTimeout(who.talkTO); who.talkTO = setTimeout(() => { who.talking = false; }, Math.min(6000, 400 + String(text || "").length * 28));
}
function openDialog(d) {
  const val = v => typeof v === "function" ? v() : v;
  d = { ...d, options: d.options.map(o => ({ ...o, hint: val(o.hint), disabled: !!val(o.disabled) })) };
  dlgState = { ...d };
  mode = "dialog";
  $("dlgCard").style.setProperty("--role", d.color || "#9aa3a0");
  const url = portraitFor(d.sp), ph = $("dlgPhoto");
  ph.innerHTML = url ? `<img src="${url}" alt="">` : `<span id="dlgAvatar">${esc(d.av || "?")}</span>`;
  $("dlgName").textContent = d.name; $("dlgRole").textContent = d.role || "";
  typeText(d.text); setTalker(d.sp, d.text); $("dlgStamps").innerHTML = "";
  const box = $("dlgOpts"); box.innerHTML = "";
  d.options.forEach((o, i) => {
    const [cls, ico] = optIcon(o, i);
    const b = document.createElement("button"); b.type = "button"; b.className = "opt " + cls; b.disabled = !!o.disabled;
    b.innerHTML = `<span class="ico">${esc(ico)}</span><span>${esc(o.label)}</span>${o.hint ? `<small>${esc(o.hint)}</small>` : "<small></small>"}`;
    b.addEventListener("click", () => chooseOption(i)); box.appendChild(b);
  });
  $("dlg").hidden = false; $("prompt").hidden = true; $("toast").hidden = true; toastT = 0; clearInputs();
  setTimeout(() => { const f = box.querySelector(".opt:not(:disabled)"); if (f) f.focus({ preventScroll: true }); }, 30);
}
function chooseOption(i) {
  if (!dlgState || dlgState.chosen) return;
  const o = dlgState.options[i]; if (!o || o.disabled) return;
  dlgState.chosen = true;
  const res = o.act() || {};
  if (res.end) { $("dlg").hidden = true; dlgState = null; return; }
  if (res.next) { dlgState = null; res.next(); return; }
  typeText(res.text || "…"); setTalker(dlgState.sp, res.text);
  $("dlgStamps").innerHTML = stampsHtml(res.stamps || []);
  const box = $("dlgOpts"); box.innerHTML = "";
  const b = document.createElement("button"); b.type = "button"; b.className = "opt go"; b.textContent = "Weiter";
  b.addEventListener("click", closeDialog); box.appendChild(b);
  setTimeout(() => b.focus({ preventScroll: true }), 30);
  updateHud();
}
function closeDialog() {
  if (!dlgState) return;
  const d = dlgState; dlgState = null; clearInterval(typeTimer); if (talker) { talker.talking = false; talker = null; }
  $("dlg").hidden = true;
  if (mode === "dialog") mode = "play";
  if (d.onClose) d.onClose();
  updateHud(); checkDeath();
}

/* A conversation is 1–3 steps. Each option returns { text, stamps, score, stop }. finish(score) returns a toast { text, stamps } or nothing. */
function runChain(e, intro, steps, finish) {
  const t = TYPES[e.type];
  let i = 0, score = 0;
  const ask = () => {
    const st = steps[i];
    openDialog({ sp: e.person.sp, av: t.av, color: t.color, name: e.name, role: t.role + (steps.length > 1 ? ` · Frage ${i + 1} von ${steps.length}` : ""),
      text: (i === 0 && intro ? intro + " " : "") + st.q,
      options: st.options.map(o => ({ ...o, act: () => { const res = o.act() || {}; score += res.score || 0; if (res.stop) i = steps.length; return res; } })),
      onClose: () => {
        i++;
        if (i < steps.length) { ask(); return; }
        const f = finish ? finish(score) : null;
        finishEncounter(e);
        if (f) showToast(t.av, t.color, e.name, f.text, f.stamps || []);
      } });
  };
  ask();
}
const yesNo = (yes, no, extra) => [{ label: "Ja.", act: yes }, { label: "Nein.", act: no }].concat(extra || []);
const breakFree = (cost, text) => ({ label: "Losreißen und weg", hint: "−" + cost + " Energie", act: () => ({ text: text || "Du drehst dich weg und gehst sehr, sehr schnell. Ohne zu rennen. Rennen ist auf Station verboten.", stamps: pen({ energy: cost }), stop: true }) });

function finishEncounter(e) {
  if (e.done) return;
  e.done = true; e.state = "leaving"; e.leaving = 3; e.aw = 0; player.inv = 5; run.talks++;
  setExpression(e.person, "smile"); emote(e, pick(["👋", "😌", "🙄", "👍"]));
  if ("PZF".includes(e.type)) { run.testi = (run.testi || 0) + 1; if (run.route === "influ" && run.testi <= 3) setTimeout(() => showToast("🤳", "#c13584", "Story " + run.testi + "/3", pick(["„Ich warte seit 2019.“ Authentisch! Roh! +900 Follower.", "„Ist das hier die Toilette?“ Viral. +1.400 Follower.", "Er hustet direkt in die Kamera. Die Kommentare eskalieren. +2.000 Follower."]), []), 1200); }
  e.tri.visible = false;
  e.label.material.map = labelFor(TYPES[e.type], e.type === "Z" ? "✓ TRIAGIERT" : "✓ ERLEDIGT"); e.label.material.needsUpdate = true;
  const dm = distMap(e.tx, e.ty); let best = -1, bi = 0;
  for (let i = 0; i < dm.length; i++) if (dm[i] > best && dm[i] < 9) { best = dm[i]; bi = i; }
  e.leaveTo = [bi % GW, (bi / GW) | 0];
  if (e.type === "Z") e.person.seated = true;
}

function phdQuiz(e) {
  const t = TYPES.D, qs = STATS_Q.slice().sort(() => Math.random() - .5).slice(0, 3), calc = hasItem("8");
  let correct = 0;
  runChain(e, "„" + pick(t.lines) + "“", qs.map(Q => ({ q: Q.q + (calc ? " (🧮 hilft)" : ""), options: Q.o.map((label, j) => ({ label, hint: calc && j === Q.a ? "🧮 ✓" : "", act: () => {
    const ok = j === Q.a; if (ok) correct++;
    return { text: ok ? pick(["„Hm. Korrekt. Langweilig, aber korrekt.“", "„Okay, du kannst rechnen. Respekt.“", "„Richtig. Das schreib ich mir auf. Als meine Idee.“"]) : pick(["„Genau so machen wir das!“ Du hast gerade wissenschaftlich gesündigt.", "„Falsch, aber publizierbar.“", "PD-Phil lacht. „Reviewer 2 wird dich lieben.“"]), stamps: [ok ? good("Richtig") : { text: "Falsch" }] };
  } })) })), () => {
    if (calc) takeItem("8");
    run.coauthor++;
    return correct >= 2 ? { text: `${correct} von 3 richtig. „Du bist raus. Aber ich schreib dich als Co-Autor drauf. Stelle 14.“ Er joggt zu seinem Tesla.`, stamps: [good("Co-Autor (14.)")] }
      : { text: `${correct} von 3. „Perfekt! Du machst die Revision. Und Samstag Studienambulanz.“ Er schickt dir 340 Seiten Excel mit verbundenen Zellen.`, stamps: pen({ tasks: ["Revision für Reviewer 2"], duties: 1, dutyCode: "ST" }) };
  });
}

// one random way of talking your way past an orthopaedist (keeps the menu short)
const TALK_U = [
  { label: "„Ist das ein Bizeps oder trägst du ein Kleinkind unterm Ärmel?“", hint: "60 %", act: (clear, lauch) => chance(.6) ? clear("Er errötet. Er flext. Er flext nochmal, für sich selbst. Er hat vergessen, dass es dich gibt.") : lauch("„Billig.“ Aber er flext trotzdem. Du stehst immer noch davor.") },
  { label: "„Da hinten verschreibt ein Internist Physio ohne Indikation!“", hint: "50 %", act: (clear, lauch) => chance(.5) ? clear("„WAS?!“ Er rennt los, die Hantel noch in der Hand. Du hörst ihn den ganzen Flur entlang schnauben.") : lauch("Er schaut hin. Da ist niemand. Er schaut zurück. „Netter Versuch, Lauch.“") },
  { label: "„Ich bin Unfallchirurg.“", hint: "Quiz", act: (clear, lauch, base, e) => ({ next: () => openDialog({ ...base, role: "Prüfung", text: "„Ach ja? Dann nenn mir die vier Muskeln der Rotatorenmanschette. Ohne Googeln. Ohne Leitlinie.“",
    options: [
      { label: "Bizeps, Trizeps, Quadrizeps, Wadl", act: () => lauch("„Wadl ist kein Muskel. Wadl ist ein Lebensgefühl.“", { nerves: 1 }) },
      { label: "Supraspinatus, Infraspinatus, Teres minor, Subscapularis", act: () => clear("Er nickt anerkennend. „SITS. Bruder.“ Ihr macht einen Faustcheck. Deine Fingerknöchel knacken.") },
      { label: "„Hängt vom Natriumwert ab.“", act: () => lauch("„WUSST ICH'S! INTERNIST!“ Die anderen Orthopäden drehen sich um. Einer zeigt mit der Hantel auf dich.", { energy: 10 }) },
    ], onClose: () => { player.inv = 1; e.cool = 2; } }) }) },
  { label: "„Was ist dein Max beim Bankdrücken?“", hint: "55 %", act: (clear, lauch) => chance(.55) ? clear("Er erzählt. 40 Minuten lang. Du nickst. Irgendwann merkt er nicht mehr, dass du schon hinter ihm stehst. Und dann weg bist.") : lauch("„Mehr als du wiegst.“ Er misst dich mit Blicken. Er hat recht.") },
];
function bouncerDialog(e) {
  const t = TYPES.U, base = { sp: e.person.sp, av: t.av, color: "#2a5f8a", name: e.name, role: "Orthopädie · Lauch-Kontrolle · " + (bouncersCleared() + 1) + " von " + bouncersTotal() };
  setExpression(e.person, "angry");
  const clear = text => {
    e.cleared = true; e.done = true; grid[e.ty][e.tx] = "."; run.talks++;
    const side = DIRS.find(([dx, dy]) => cell(e.tx + dx, e.ty + dy) === "#" && dx !== 0) || [1, 0];
    e.x = e.tx + .5 + side[0] * .62; e.tri.visible = false; e.label.material.map = labelFor(t, "✓ KEIN LAUCH"); e.label.material.needsUpdate = true; sfx.ding();
    setExpression(e.person, "happy"); emote(e, pick(["💪", "🤝", "👊"]));
    return { text, stamps: [good("Durchgelassen")] };
  };
  const lauch = (text, p) => { setExpression(e.person, "smile"); emote(e, "🥬"); return { text, stamps: pen(p || { energy: 8 }) }; };
  openDialog({ ...base,
    text: "„" + pick(["Halt. Du siehst aus wie ein Internist. Lauchig. Blass. Liest Leitlinien zum Spaß.", "Lauch-Kontrolle. Arm zeigen. Nein, den anderen. Okay, beide sind traurig.", "Wir stehen hier nur rum. Zwischen zwei Sätzen. Aber durch kommst du trotzdem nicht.", "Wie viel drückst du? Und sag jetzt nicht ‚Kalium 4,2‘."]) + "“",
    options: [
      { label: "Proteinshake anbieten", hint: () => hasItem("6") ? "🥤 verbrauchen" : "braucht 🥤", disabled: () => !hasItem("6"), act: () => { takeItem("6"); return clear("Er trinkt ihn in einem Zug, ohne zu schlucken. „Vanille. Respekt. Du bist kein Lauch. Du bist… ein Frühlingslauch.“"); } },
      { label: "Liegestütze! Jetzt! Hier!", hint: "Minispiel · Energie", disabled: () => run.energy < 10, act: () => ({ next: () => pushupGame(e, ok => openDialog({ ...base, text: ok ? "Er zählt mit. Laut. Der ganze Flur zählt mit. Ein Patient weint vor Rührung." : "Bei Nummer sechs liegst du flach. Er stellt dir den Fuß auf den Rücken und macht ein Foto für die Gruppe.",
        options: [{ label: ok ? "Aufstehen. Lässig." : "Liegen bleiben. Würde zeigen.", act: () => ok ? clear("„Kein Lauch. Ein Spargel vielleicht. Aber kein Lauch.“ Er tritt zur Seite und klatscht dich ab. Deine Hand ist taub.") : lauch("„Lauch.“ Er tätschelt dir den Kopf. Wie einem Golden Retriever.", { energy: 12 }) }], onClose: () => { player.inv = 1; e.cool = 2; } })) }) },
      { label: "Kämpfen! Stethoskop gegen Reflexhammer", hint: "Kampf · Minispiel", act: () => ({ next: () => fightGame(e, ok => openDialog({ ...base, text: ok ? "Er liegt auf der Hantelbank, das Stethoskop um den Knöchel gewickelt. „Respekt. Lauch mit Kampfsport. Das gab's noch nie.“" : "Er klopft dir ein letztes Mal auf die Patellarsehne. Dein Bein tritt dir selbst in den Hintern. Er lacht, bis er Muskelkater bekommt.",
        options: [{ label: ok ? "Stethoskop cool um den Hals werfen. Weiter." : "Humpeln. Würdevoll.", act: () => ok ? clear("Er macht Platz. Er salutiert sogar. Mit der Hantel.") : lauch("„Komm wieder, wenn du Beintag hattest.“", { energy: 10 }) }], onClose: () => { player.inv = 1; e.cool = 2; } })) }) },
      (() => { const v = TALK_U[Math.floor(Math.random() * TALK_U.length)]; return { label: v.label, hint: v.hint, act: () => v.act(clear, lauch, base, e) }; })(),
      { label: "„Ich komm später wieder.“", act: () => ({ text: "„Später ist Beintag. Da sind wir noch schlechter gelaunt.“" }) },
    ], onClose: () => { player.inv = 1; e.cool = 2; } });
}
// reflex-hammer duel: hit his patellar tendon three times before he gets yours
function duelGame(e, done) {
  const need = 3, tries = 6; let hits = 0, swings = 0, over = false, pos = 0, dir = 1, zone = .22;
  const ov = document.createElement("div"); ov.id = "pushup";
  ov.innerHTML = `<div class="pu-card duel"><b>REFLEXHAMMER-DUELL</b><small>Du: Reflexhammer. Er: Stethoskop (falsch herum). Triff die Patellarsehne, wenn die Markierung im grünen Feld ist. ${need} Treffer, ${tries} Versuche.</small>
    <div class="du-score"><span class="du-you">🔨 0</span><span class="du-left">Versuche: ${tries}</span></div>
    <div class="du-bar"><i class="du-zone"></i><i class="du-mark"></i></div><div class="du-msg">&nbsp;</div><button type="button" class="pu-btn">🔨 ZUSCHLAGEN</button></div>`;
  document.body.appendChild(ov); mode = "dialog";
  const mark = ov.querySelector(".du-mark"), zoneEl = ov.querySelector(".du-zone"), msg = ov.querySelector(".du-msg");
  const place = () => { zoneEl.style.left = (50 - zone * 50) + "%"; zoneEl.style.width = zone * 100 + "%"; }; place();
  let last = performance.now();
  const tick = now => { if (over) return; const dt = Math.min(.05, (now - last) / 1000); last = now; pos += dir * dt * (.9 + hits * .35); if (pos > 1) { pos = 1; dir = -1; } if (pos < 0) { pos = 0; dir = 1; } mark.style.left = pos * 100 + "%"; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  const kick = p => { if (!p) return; p.knees[0].rotation.x = -1.2; setTimeout(() => { p.knees[0].rotation.x = 0; }, 260); };
  const hit = ev => {
    ev.preventDefault(); if (over) return; swings++;
    const ok = Math.abs(pos - .5) < zone / 2;
    if (ok) { hits++; sfx.knock(); kick(e.person); emote(e, pick(["😵", "🦵", "😳"])); msg.textContent = pick(["TOCK! Sein Bein schnellt hoch.", "Volltreffer. Er tritt sich selbst gegen die Hantel.", "Reflex 4+. Er ist beeindruckt."]); zone = Math.max(.1, zone - .04); place(); }
    else { run.energy = Math.max(0, run.energy - 5); sfx.step(); flash(); msg.textContent = pick(["Daneben. Er klopft zurück. Dein Bein tritt ins Leere.", "Du triffst die Hantel. Sie klingt wie eine Kirchenglocke.", "Zu früh. Er gähnt."]); }
    ov.querySelector(".du-you").textContent = "🔨 " + hits; ov.querySelector(".du-left").textContent = "Versuche: " + (tries - swings);
    if (hits >= need || tries - swings <= 0) { over = true; removeEventListener("keydown", key); setTimeout(() => { ov.remove(); done(hits >= need); }, 700); }
  };
  ov.querySelector(".pu-btn").addEventListener("pointerdown", hit);
  const key = ev => { if (ev.key === " " || ev.key === "Enter" || ev.key.toLowerCase() === "e") hit(ev); }; addEventListener("keydown", key);
}
// push-up challenge: tap as fast as you can
function pushupGame(e, done) {
  const need = settings.diff === "easy" ? 10 : 13, secs = 5;
  let n = 0, t0 = null, over = false; // the clock starts with the first push-up
  const ov = document.createElement("div"); ov.id = "pushup";
  ov.innerHTML = `<div class="pu-card"><b>LIEGESTÜTZE</b><small>${need} in ${secs} Sekunden · die Zeit läuft ab dem ersten Tippen</small><div class="pu-count">0</div><div class="pu-bar"><i></i></div><button type="button" class="pu-btn">💪 RUNTER · HOCH</button></div>`;
  document.body.appendChild(ov); mode = "dialog";
  const cnt = ov.querySelector(".pu-count"), bar = ov.querySelector(".pu-bar i");
  const tap = ev => { ev.preventDefault(); if (over) return; if (t0 == null) t0 = performance.now(); n++; cnt.textContent = n; cnt.classList.remove("bump"); void cnt.offsetWidth; cnt.classList.add("bump"); sfx.step(); if (n >= need) finish(true); };
  ov.querySelector(".pu-btn").addEventListener("pointerdown", tap);
  const key = ev => { if (ev.key === " " || ev.key === "Enter" || ev.key.toLowerCase() === "e") tap(ev); }; addEventListener("keydown", key);
  const tick = () => { if (over) return; const k = t0 == null ? 0 : (performance.now() - t0) / 1000 / secs; bar.style.width = Math.max(0, 100 - k * 100) + "%"; if (k >= 1) finish(false); else requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  function finish(ok) { over = true; run.energy = Math.max(0, run.energy - (ok ? 8 : 15)); removeEventListener("keydown", key); setTimeout(() => { ov.remove(); done(ok); }, 450); }
}

function friendDialog(f) {
  const def = FRIENDS[f.kind], base = { sp: f.person ? f.person.sp : def.spec, av: def.av, color: def.color, name: def.name, role: def.role };
  f.talked++;
  if (f.kind === "b") return openDialog({ ...base, text: run.flags.has("secret1") ? "„Die Tür mit dem Verbotsschild ist offen. Wenn wer fragt: Ich war's nicht.“" : "„Na, Herr Doktor, wieder auf der Flucht? Ich kenn jeden Gang hier. Auch die, die es offiziell nicht gibt. Seit sie zwei von uns eingespart haben, putze ich das ganze Haus.“",
    options: [
      { label: "„Zeigen Sie mir eine Abkürzung?“", disabled: run.flags.has("secret1"), act: () => { openSecrets(); run.flags.add("secret1"); return { text: "Sie zwinkert. „Das Lager mit dem Verbotsschild. Einfach drücken. Spart dir den halben Flur.“", stamps: [good("Geheimgang offen")] }; } },
      { label: "„Haben Sie zufällig Kaffee?“", disabled: !!f.coffee, act: () => { f.coffee = true; addItem("1"); return { text: "Sie gibt dir ihre Thermoskanne. „Stark genug für eine Reanimation.“", stamps: [good("☕ eingepackt")] }; } },
      { label: "„Wo kann ich mich verstecken?“", act: () => ({ text: "„Überall, wo ein braunes Schild hängt. Bereitschaftsraum, Küche, Kammer. Da geht keiner rein. Da ist ja Arbeit.“" }) },
    ] });
  if (f.kind === "k") {
    if (run.flags.has("key")) return openDialog({ ...base, text: "„Hast du alles? Dann geh! Bevor der OA dich sieht!“", options: [{ label: "Gehen", act: () => ({ text: "Er winkt dir nach wie ein Matrose am Hafen." }) }] });
    const give = (text, stamps) => { run.flags.add("key"); sfx.ding(); return { text: text + " Er gibt dir deinen Autoschlüssel zurück. Er war damit beim Bäcker.", stamps: stamps.concat([good("🔑 Autoschlüssel")]) }; };
    return openDialog({ ...base, text: "„Oh, dein Schlüssel? Klar, sofort. Aber vorher Übergabe. Und… kannst du Samstag meinen Dienst übernehmen? Meine Oma hat Geburtstag. Wieder.“",
      options: [
        { label: "„Klar, ich mach Samstag.“", act: () => give("Er umarmt dich.", [{ text: addDuty("WE") }].concat(gain({ nerves: 1 }))) },
        { label: "„Nein. Hier die Übergabe: Zi. 7 instabil, Zi. 9 will heim.“", act: () => give("„Okay… fair.“ Er schreibt alles auf eine Serviette.", []) },
        { label: "„Steht alles im Computer.“", act: () => give("„Welcher Computer? Der von 2003?“", pen({ tasks: ["Rückfragen vom Nachtdienst"] })) },
      ] });
  }
  if (f.kind === "h") {
    if (run.flags.has("fuse")) return openDialog({ ...base, text: "„Sicherungskasten ist hinten rechts. Wenn du Dr. Ewig siehst: Sag ihm, er soll heimgehen. Manchmal hilft das.“", options: [{ label: "„Danke!“", act: () => ({ text: "Er tippt sich an die Mütze." }) }] });
    return openDialog({ ...base, text: "„Strom weg? Klar. Die Wartung wurde 2019 eingespart. Ich hab noch eine Sicherung. Privat gekauft. Kostet aber was.“",
      options: [
        { label: "„Ich schulde Ihnen ein Bier.“", act: () => { run.flags.add("fuse"); addItem("9"); return { text: "„Zwei.“ Er gibt dir die Sicherung und eine Batterie für die Taschenlampe.", stamps: [good("Sicherung"), good("🔋 eingepackt")] }; } },
        { label: "„Ich messe Ihnen den Blutdruck.“", act: () => { run.flags.add("fuse"); return { text: "142 zu 95. „Passt schon.“ Er gibt dir die Sicherung.", stamps: [good("Sicherung")].concat(pen({ mins: 5 })) }; } },
        { label: "„Gibt's hier wirklich einen Geist?“", act: () => ({ text: "„Dr. Ewig? Der wollte 2009 nur kurz ins Archiv. Seitdem macht er Dienst. Sag ihm, er soll heimgehen.“ (Frag nochmal nach der Sicherung.)" }) },
      ] });
  }
  if (f.kind === "s") return openDialog({ ...base, text: "„Hast du Aufgaben für mich? Ich will was lernen! Bitte! Ich krieg 0 € im PJ, aber ich will was lernen!“",
    options: [
      { label: "„Hier, nimm drei.“", disabled: !run.tasks.length, hint: run.tasks.length ? "" : "keine Aufgaben", act: () => { const n = Math.min(3, run.tasks.length); run.tasks.splice(0, n); return { text: `Jonas strahlt. Er übernimmt ${n} Aufgabe${n > 1 ? "n" : ""}. Noch ist er glücklich.`, stamps: [good("−" + n + " Aufgaben")] }; } },
      { label: "„Lern nicht zu viel. Geh heim.“", disabled: !!f.home, act: () => { f.home = true; return { text: "Er schaut dich an, als hättest du ihm das Leben gerettet. Vielleicht hast du das.", stamps: gain({ nerves: 1 }) }; } },
    ] });
  if (f.kind === "e") { run.flags.add("spa"); updateHud(); }
  if (f.kind === "e" && (run.route === "botox" || run.offers.has("botox")) && !run.flags.has("probe") && !run.flags.has("probeLater")) return openDialog({ ...base, text: "„Ah, die Kollegin oder der Kollege mit den Augenringen! Probetag. Zwei Fragen. Keine Angst, es ist nur Dermatologie.“",
    options: [opt("Probetag starten", () => ({ next: () => dermaProbe(base) })), opt("Erst Wellness, bitte", () => ({ next: () => { run.flags.add("probeLater"); friendDialog(f); } }))] });
  if (f.kind === "e") return openDialog({ ...base, text: "„Willkommen in der Rettungsstation. Keine Dienste, keine Notfälle, nur Feuchtigkeit. Gurkenscheibe? Creme? Oder einen Job mit Feierabend um 15 Uhr?“",
    options: [
      { label: "„Einmal alles, bitte.“ (Wellness)", disabled: run.flags.has("spaFull"), act: () => { run.flags.add("spaFull"); sfx.spa(); run.energy = 100; run.nerves = MAX_NERVES(); return { text: "Gurkenmaske, Fußbad, Handcreme. Du hörst zum ersten Mal seit 2019 deinen eigenen Puls. Er ist normal.", stamps: [good("Energie 100"), good("Nerven voll")] }; } },
      { label: "„Erzählen Sie mehr über den Job.“", disabled: run.offers.has("botox"), act: () => { run.offers.add("botox"); return { text: "„Ästhetische Dermatologie. Montag bis Donnerstag. Keine Nachtdienste. Bringen Sie nur Ihre Approbation mit.“", stamps: [good("Jobangebot")] }; } },
      { label: "„Ich will den Probetag machen.“", hint: "Route Dermatologie", disabled: run.flags.has("probe") || !(run.route === "botox" || run.offers.has("botox")), act: () => ({ next: () => dermaProbe(base) }) },
      { label: "„Haben Sie was gegen Augenringe?“", disabled: !!f.cream, act: () => { f.cream = true; addItem("+"); return { text: "„Gegen deine? Nein. Aber nimm die hier. Für unterwegs.“", stamps: [good("🫙 eingepackt")] }; } },
    ] });
  if (f.kind === "i") return openDialog({ ...base, text: "„OMG, ein echter Arzt! Kann ich ein Selfie machen? Für meine 400.000 Follower? #DoctorLife #Burnout #Aesthetic“",
    options: [
      { label: "Lächeln (Selfie)", disabled: !!f.selfie, act: () => { f.selfie = true; run.flags.add("collab"); return { text: "Das Foto geht viral: „Müder Arzt, ehrliche Augen“. Du fühlst dich kurz gesehen.", stamps: gain({ nerves: 1 }) }; } },
      { label: "„Bitte keine Fotos, ich bin auf der Flucht.“", act: () => ({ text: "„Das ist SO relatable.“ Sie postet es trotzdem." }) },
    ] });
}
function ticketDialog() {
  openDialog({ av: "🎫", color: "#cfe8ff", name: "Parkticket-Automat", role: "Kostenstelle Parkraumbewirtschaftung", text: "„PARKTICKET: 12,00 €. NUR MÜNZEN. KARTENZAHLUNG WURDE AUS KOSTENGRÜNDEN DEAKTIVIERT.“ Du hast 3,40 € in Münzen.",
    options: [
      { label: "Dagegen treten", hint: "50 %", act: () => { if (chance(.5)) { run.flags.add("ticket"); return { text: "Ein Ticket fällt heraus. Und ein zweites, von 2017.", stamps: [good("🎫 Parkticket")] }; } return { text: "Dein Zeh. Der Automat: unbeeindruckt. Versuch es nochmal.", stamps: pen({ energy: 10 }) }; } },
      { label: "Klinikausweis zeigen", act: () => { run.flags.add("ticket"); return { text: "„MITARBEITERRABATT: 0 %.“ Aber er druckt ein Ticket. Die 12 € werden vom Gehalt abgezogen. Mit Bearbeitungsgebühr.", stamps: [good("🎫 Parkticket")].concat(pen({ nerves: 1 })) }; } },
      { label: "Einen Pseudo-Notfall um Kleingeld bitten", act: () => { run.flags.add("ticket"); return { text: "„Kriege ich dann ein Rezept für Nasenspray?“ Deal.", stamps: [good("🎫 Parkticket")].concat(pen({ mins: 10, tasks: ["Rezept Nasenspray (Deal am Automaten)"] })) }; } },
    ], onClose: () => sfx.pick() });
}
function openSecrets() { for (const s of level.secrets) { grid[s.y][s.x] = "."; s.mesh.visible = false; } sfx.knock(); }

function dermaProbe(base) {
  let ok = 0;
  const q2 = () => openDialog({ ...base, role: "Probetag · Frage 2 von 2", text: "„Letzte Frage: Ein Patient hat 47 Muttermale. Was machst du zuerst?“",
    options: [
      opt("„Auflichtmikroskopie, Ganzkörper-Status, dokumentieren.“", () => { ok++; return finish(); }),
      opt("„Ich zähle nach. Vielleicht sind's 46.“", () => finish()),
      opt("„Ich biete ihm ein Peeling an. 89 Euro.“", () => { ok++; return finish("„Sie DENKEN schon wie eine Praxis!“"); })] });
  const finish = extra => { run.flags.add("probe"); run.offers.add("botox"); return { text: (extra ? extra + " " : "") + (ok >= 1 ? "Dr. Glatt klatscht. „Bestanden! Montag 9 Uhr. Nicht früher, um Gottes willen.“" : "„Naja. Aber Ihre Augenringe brauchen uns. Bestanden aus medizinischen Gründen.“"), stamps: [good("Probetag bestanden"), good("Jobangebot")] }; };
  openDialog({ ...base, role: "Probetag · Frage 1 von 2", text: "„Eine Patientin will ‚so aussehen wie vor zehn Jahren‘. Was sagst du?“",
    options: [
      opt("„Das kostet zehn Jahre Urlaub.“", () => ({ next: () => { ok++; q2(); } })),
      opt("„Hyaluron, Botox, Licht aus.“", () => ({ next: () => { ok++; q2(); } })),
      opt("„Ich verschreibe Ibuprofen.“", () => ({ next: () => q2() }))] });
}
function stampDialog(e) {
  const got = text => { run.flags.add("excel"); finishEncounter(e); sfx.pick(); return { text, stamps: [good("Controlling-Excel")] }; };
  openDialog({ sp: e.person.sp, av: "🤓", color: "#9aa3a0", name: e.name, role: "Controlling · Hüter der Excel (48 Reiter)", text: "„Die Excel? MEINE Excel? Für eine Unternehmensberatung? Die hat 48 Reiter. Drei davon sind farbig. Wissen Sie, was das bedeutet?“",
    options: [
      opt("„Kevin sagt, Ihre Pivot-Tabellen sind legendär.“", () => chance(.65) ? got("Er wird rot. „Legendär… das hat noch nie jemand gesagt.“ Er zieht die Datei auf einen USB-Stick mit Hello-Kitty-Anhänger. „Bringen Sie ihn zurück. Bitte.“") : (e.stun = 5, player.inv = 3, { text: "„Kevin? Der Kevin, der meine Makros gelöscht hat?“ Er klappt den Laptop zu. Versuch es nochmal.", stamps: pen({ mins: 5 }) }), "65 % · sonst +5 Min"),
      opt("„Ich kodiere Ihnen drei Nebendiagnosen nach.“", () => { run.minutes += 10; return got("Seine Augen leuchten. „Drei? Mit Schweregrad?“ Du kodierst zehn Minuten. Er schickt dir die Excel per Mail. Betreff: „Danke!!! :) :)“"); }, "+10 Min · klappt sicher"),
      opt("Später", () => { e.stun = 5; player.inv = 3; e.aw = 0; return { text: "„Später kostet extra.“ Er vertieft sich wieder in eine Tabelle." }; })] });
}
