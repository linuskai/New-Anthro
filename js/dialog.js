/* Hospital Escape 3D · dialogue engine and all conversations. */
let dlgState = null;
function openDialog(d) {
  const val = v => typeof v === "function" ? v() : v;
  d = { ...d, options: d.options.map(o => ({ ...o, hint: val(o.hint), disabled: !!val(o.disabled) })) };
  dlgState = { ...d };
  mode = "dialog";
  $("dlgAvatar").textContent = d.av; $("dlgAvatar").style.background = d.color || "#ddd";
  $("dlgName").textContent = d.name; $("dlgRole").textContent = d.role || "";
  $("dlgText").textContent = d.text; $("dlgStamps").innerHTML = "";
  const box = $("dlgOpts"); box.innerHTML = "";
  d.options.forEach((o, i) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.disabled = !!o.disabled;
    b.innerHTML = `<span>${i + 1}. ${esc(o.label)}</span>${o.hint ? `<small>${esc(o.hint)}</small>` : ""}`;
    b.addEventListener("click", () => chooseOption(i)); box.appendChild(b);
  });
  $("dlg").hidden = false; $("prompt").hidden = true; clearInputs();
  setTimeout(() => { const f = box.querySelector(".opt:not(:disabled)"); if (f) f.focus({ preventScroll: true }); }, 30);
}
function chooseOption(i) {
  if (!dlgState || dlgState.chosen) return;
  const o = dlgState.options[i]; if (!o || o.disabled) return;
  dlgState.chosen = true;
  const res = o.act() || {};
  if (res.end) { $("dlg").hidden = true; dlgState = null; return; }
  if (res.next) { dlgState = null; res.next(); return; }
  $("dlgText").textContent = res.text || "…";
  $("dlgStamps").innerHTML = stampsHtml(res.stamps || []);
  const box = $("dlgOpts"); box.innerHTML = "";
  const b = document.createElement("button"); b.type = "button"; b.className = "opt go"; b.textContent = "Weiter";
  b.addEventListener("click", closeDialog); box.appendChild(b);
  setTimeout(() => b.focus({ preventScroll: true }), 30);
  updateHud();
}
function closeDialog() {
  if (!dlgState) return;
  const d = dlgState; dlgState = null;
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
    openDialog({ av: t.av, color: t.color, name: e.name, role: t.role + (steps.length > 1 ? ` · Frage ${i + 1} von ${steps.length}` : ""),
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
  e.done = true; e.state = "leaving"; e.leaving = 3; e.aw = 0; player.inv = 2.5; run.talks++;
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

function bouncerDialog(e) {
  const t = TYPES.U;
  const clear = text => {
    e.cleared = true; e.done = true; grid[e.ty][e.tx] = "."; run.talks++;
    const side = DIRS.find(([dx, dy]) => cell(e.tx + dx, e.ty + dy) === "#" && dx !== 0) || [1, 0];
    e.x = e.tx + .5 + side[0] * .62; e.tri.visible = false; e.label.material.map = labelFor(t, "✓ DURCHGELASSEN"); e.label.material.needsUpdate = true; sfx.ding();
    return { text, stamps: [good("Tür frei")] };
  };
  openDialog({ av: t.av, color: "#f2c300", name: e.name, role: "Orthopädie · Security · Tür " + (bouncersCleared() + 1) + " von " + bouncersTotal(),
    text: "„" + pick(["Name steht nicht auf der Liste.", "Hier kommt nur rein, wer mindestens 120 kg drückt.", "Orthopädie. Members only.", "Du kommst hier nicht rein. Zu wenig Muskeln."]) + "“",
    options: [
      { label: "Proteinshake anbieten", hint: hasItem("6") ? "🥤 verbrauchen" : "braucht 🥤", disabled: !hasItem("6"), act: () => { takeItem("6"); return clear("Er trinkt ihn in einem Zug. „Vanille. Respekt.“ Er tritt zur Seite."); } },
      { label: "„Ich bin auch Orthopäde.“", act: () => ({ next: () => openDialog({ av: t.av, color: "#f2c300", name: e.name, role: "Prüfung", text: "„Ach ja? Dann nenn mir die vier Muskeln der Rotatorenmanschette.“",
        options: [
          { label: "Bizeps, Trizeps, Quadrizeps, Wadl", act: () => ({ text: "„Wadl ist kein Muskel. Wadl ist ein Lebensgefühl.“ Er bleibt stehen.", stamps: pen({ nerves: 1 }) }) },
          { label: "Supraspinatus, Infraspinatus, Teres minor, Subscapularis", act: () => clear("Er nickt anerkennend. „SITS. Bruder.“ Ihr macht einen Faustcheck.") },
          { label: "Links, rechts, oben, unten", act: () => ({ text: "Er lacht so laut, dass im Gipsraum ein Gips reißt. Du stehst immer noch draußen.", stamps: pen({ energy: 5 }) }) },
        ], onClose: () => { player.inv = 1; e.cool = 2; } }) }) },
      { label: "Armdrücken!", hint: "−30 Energie · 45 %", disabled: run.energy < 30, act: () => { run.energy -= 30; if (chance(.45)) return clear("Unfassbar. Du gewinnst. Er weint ein bisschen. Dann lässt er dich durch."); return { text: "Dein Arm macht ein Geräusch. Kein gutes. Er bleibt stehen.", stamps: pen({ nerves: 1 }).concat([{ text: "−30 Energie" }]) }; } },
      { label: "„Ich komm später wieder.“", act: () => ({ text: "„Später ist auch zu.“" }) },
    ], onClose: () => { player.inv = 1; e.cool = 2; } });
}

function friendDialog(f) {
  const def = FRIENDS[f.kind], base = { av: def.av, color: def.color, name: def.name, role: def.role };
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
  if (f.kind === "e") return openDialog({ ...base, text: "„Willkommen in der Rettungsstation. Keine Dienste, keine Notfälle, nur Feuchtigkeit. Gurkenscheibe? Creme? Oder einen Job mit Feierabend um 15 Uhr?“",
    options: [
      { label: "„Einmal alles, bitte.“ (Wellness)", disabled: run.flags.has("spa"), act: () => { run.flags.add("spa"); sfx.spa(); run.energy = 100; run.nerves = MAX_NERVES(); return { text: "Gurkenmaske, Fußbad, Handcreme. Du hörst zum ersten Mal seit 2019 deinen eigenen Puls. Er ist normal.", stamps: [good("Energie 100"), good("Nerven voll")] }; } },
      { label: "„Erzählen Sie mehr über den Job.“", disabled: run.offers.has("botox"), act: () => { run.offers.add("botox"); return { text: "„Ästhetische Dermatologie. Montag bis Donnerstag. Keine Nachtdienste. Bringen Sie nur Ihre Approbation mit.“", stamps: [good("Jobangebot")] }; } },
      { label: "„Haben Sie was gegen Augenringe?“", disabled: !!f.cream, act: () => { f.cream = true; addItem("+"); return { text: "„Gegen deine? Nein. Aber nimm die hier. Für unterwegs.“", stamps: [good("🫙 eingepackt")] }; } },
    ] });
  if (f.kind === "i") return openDialog({ ...base, text: "„OMG, ein echter Arzt! Kann ich ein Selfie machen? Für meine 400.000 Follower? #DoctorLife #Burnout #Aesthetic“",
    options: [
      { label: "Lächeln (Selfie)", disabled: !!f.selfie, act: () => { f.selfie = true; return { text: "Das Foto geht viral: „Müder Arzt, ehrliche Augen“. Du fühlst dich kurz gesehen.", stamps: gain({ nerves: 1 }) }; } },
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
