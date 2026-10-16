/* Hospital Escape 3D · dialogue engine and all conversations. */
let dlgState = null;
function openDialog(d) {
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

function hostileDialog(e) {
  const t = TYPES[e.type];
  flash(); sfx.hit();
  if (navigator.vibrate) try { navigator.vibrate(100); } catch (_) {}
  if (call && !call.def.forced) endCall();
  if (e.type === "D") return phdQuiz(e);
  if (e.type === "P") {
    const v = Math.random();
    if (v < .45) {
      const Q = pick(PAT_QUIZ);
      return runChain(e, "„Herr Doktor! Mein Bettnachbar und ich haben gewettet. Um seinen Pudding.“", [{ q: Q.q, options: Q.o.map((label, j) => ({ label, act: () => j === Q.a ? { text: Q.right, stamps: gain({ nerves: 1, text: "Pudding-Bonus" }) } : { text: Q.wrong, stamps: pen({ mins: 12 }) } }))
        .concat([{ label: "„Fragen Sie Ihren Hausarzt.“", act: () => ({ text: "„Der hat doch Urlaub!“ Er ist beleidigt. Aber er lässt dich gehen.", stamps: pen({ energy: 8 }) }) }]) }]);
    }
    if (v < .75) return runChain(e, "", [
      { q: "„Doc! Darf ich heute noch heim?“", options: yesNo(() => ({ text: "„Super! Dann brauch ich nur den Entlassbrief. Und ein Taxi. Und meine Zähne, die liegen in der Cafeteria.“", stamps: pen({ tasks: ["Entlassbrief (Zähne in der Cafeteria!)"] }) }),
        () => ({ text: "„Dann will ich wenigstens was Ordentliches zu essen.“" })) },
      { q: "„Können Sie mir noch ein Schnitzel besorgen? Mit Pommes?“", options: yesNo(() => ({ text: "Er strahlt. Du hast keine Ahnung, wo du um 17 Uhr ein Schnitzel herbekommst. Die Küche wurde 2020 ausgelagert.", stamps: pen({ tasks: ["Schnitzel organisieren"], mins: 5 }) }),
        () => ({ text: "„Dann erzähl ich Ihnen von meinem Zeh.“ Er erzählt. Lange. Dann darfst du gehen.", stamps: pen({ energy: 10 }) })) }]);
    return runChain(e, "", [{ q: "„Ich hab gegoogelt. Ich hab entweder Schnupfen oder die Pest. Was meinen Sie?“", options: [
      { label: "„Schnupfen.“", act: () => ({ text: "„Langweilig.“ Er ist sichtlich enttäuscht und schlurft davon.", stamps: [good("Befreit")] }) },
      { label: "„Die Pest.“", act: () => ({ text: "Er ist begeistert. Er postet es sofort auf Facebook. Das Gesundheitsamt ruft gleich an.", stamps: pen({ tasks: ["Gesundheitsamt beruhigen (es ist Schnupfen)"] }) }) },
      { label: "„Hören Sie auf zu googeln.“", hint: "50 %", act: () => chance(.5) ? { text: "Er legt das Handy weg. Zum ersten Mal seit 2011. Er weint ein bisschen.", stamps: [good("Befreit")] } : { text: "Er googelt „arroganter Arzt Station 5B“. Zwei Treffer. Beide du.", stamps: pen({ nerves: 1 }) } }] }]);
  }
  if (e.type === "F") return runChain(e, "„Endlich! Wir sind die Familie Kowalski. Alle sieben. Wir haben nur drei kurze Fragen.“", [
    { q: "„Wird er wieder gesund?“", options: [
      { label: "„Ja!“", act: () => ({ text: "Jubel. „Sie haben es versprochen! Dirk hat's gefilmt.“", score: 1, stamps: pen({ tasks: ["Versprechen einhalten (gefilmt)"] }) }) },
      { label: "„Nein.“", act: () => ({ text: "Oma fängt an zu weinen. Dirk filmt das auch.", score: -1, stamps: pen({ nerves: 1 }) }) },
      { label: "„Das bespricht morgen der Stationsarzt.“", act: () => ({ text: "„Sie SIND der Stationsarzt.“ Stille. Sie schreiben etwas auf.", score: 0 }) }] },
    { q: "„Darf er Omas Sahnetorte essen? Drei Stück?“", options: [
      { label: "„Ja.“", act: () => ({ text: "Oma strahlt. Sein Blutzucker wird morgen auch strahlen.", score: 1, stamps: pen({ tasks: ["Blutzucker Hr. Kowalski (Sahnetorte!)"] }) }) },
      { label: "„Nein.“", act: () => ({ text: "„Sie haben unsere Torte beleidigt.“", score: -1 }) },
      { label: "„Ein halbes Stück.“", act: () => ({ text: "Diplomatisch. Oma schneidet ein sehr großes halbes Stück.", score: 1 }) }] },
    { q: "„Können Sie uns alles nochmal von vorne erklären? Cousin Dirk ist gerade erst gekommen.“", options: [
      { label: "„Ja, natürlich.“", act: () => ({ text: "Du erklärst alles. Nochmal. Dirk nickt. Dirk hat nichts verstanden. Dirk ist Heilpraktiker.", score: 2, stamps: pen({ mins: 20 }) }) },
      { label: "„Nein.“", act: () => ({ text: "„Dann schreiben wir an die Geschäftsführung!“", score: -1 }) },
      { label: "„Dirk kann im Internet nachlesen.“", act: () => ({ text: "Dirk öffnet Google. Du hast etwa drei Minuten.", score: 0, stamps: [good("Zeit gewonnen")] }) }] },
  ], score => score >= 2 ? { text: "Die Familie ist begeistert. Oma drückt dir Pralinen in die Hand. Alle sieben winken.", stamps: gain({ nerves: 1, energy: 20 }) }
    : score <= -1 ? { text: "Sie gehen direkt zur Geschäftsführung. Du bekommst Post.", stamps: pen({ tasks: ["Beschwerde Fam. Kowalski beantworten"], nerves: 1 }) }
    : { text: "Die Familie zieht weiter. Murmelnd. Du hörst noch „…früher war das anders…“.", stamps: [] });
  if (e.type === "N") return runChain(e, "", [
    { q: "„Kannst du noch kurz abzeichnen? Nur 14 Patienten.“", options: yesNo(() => ({ text: "Du zeichnest 14 Kurven ab. Deine Unterschrift sieht danach aus wie ein EKG.", score: 1, stamps: pen({ mins: 12 }) }),
      () => ({ text: "„Ah. So einer bist du.“", score: -1 })) },
    { q: "„Und Zimmer 7 braucht 'ne Braunüle. Die Venen sind… sportlich.“", options: yesNo(() => chance(.6) ? { text: "Erster Versuch! Die Pflege applaudiert. Der Patient auch.", score: 1, stamps: gain({ nerves: 1 }).concat(pen({ mins: 8 })) } : { text: "Dritter Versuch. Der Patient schreibt eine Google-Bewertung. Live.", score: 0, stamps: pen({ nerves: 1, mins: 15 }) },
      () => ({ text: "„Dann sag ich's dem Nachtdienst. Der sagt's dem OA. Der sagt's dir. Morgen früh.“", score: -1, stamps: pen({ tasks: ["Braunüle Zi. 7 (sportliche Venen)"] }) })) },
  ], score => score >= 1 ? (addItem("1"), { text: "Sie schenkt dir ihren geheimen Notfall-Kaffee. Den aus der Schublade mit dem Schloss.", stamps: [good("☕ eingepackt")] }) : null);
  if (e.type === "O") return runChain(e, "", [
    { q: "„Sie machen doch Samstag, oder?“", options: [
      { label: "„Selbstverständlich!“", act: () => ({ text: "„Wusste ich's doch. Teamplayer.“", stamps: pen({ duties: 1 }) }) },
      { label: "„Da ist die Hochzeit meiner Schwester.“", hint: "45 %", act: () => chance(.45) ? { text: "Er glaubt dir. Du hast keine Schwester.", stamps: [good("Kein Dienst")] } : { text: "„Die hat doch letzten Monat schon geheiratet.“ Strafdienst.", stamps: pen({ duties: 2, nerves: 1 }) } },
      { label: "„Nein.“", hint: run.nerves >= 3 ? "−2 Nerven" : "braucht 3 Nerven", disabled: run.nerves < 3, act: () => ({ text: "Stille. Er notiert sich etwas. Du weißt nicht, was. Das ist das Schlimmste.", stamps: pen({ nerves: 2 }) }) },
      breakFree(25, "Du tust, als würde dein Pieper gehen. Pieper wurden 2019 eingespart. Egal, du bist weg.")] },
    { q: "„Und morgen in der Frühbesprechung stellen Sie vor. Thema?“", options: [
      { label: "„Hyponatriämie.“", act: () => ({ text: "„Langweilig. Aber gut.“ Er nickt. 40 Folien bis 6:30.", stamps: pen({ tasks: ["Vortrag Hyponatriämie (40 Folien)"] }) }) },
      { label: "„Work-Life-Balance.“", act: () => ({ text: "Er lacht fünf Minuten lang. Tränen. Du gehst einfach.", stamps: [good("Befreit")] }) },
      { label: "„Ich hab morgen frei.“", act: () => ({ text: "„Hatten Sie.“", stamps: pen({ duties: 1 }) }) }] },
  ]);
  if (e.type === "C") return runChain(e, "„" + pick(["Wochenende? Beide Tage. Und den Feiertag.", "Qualitätszirkel, Samstag 7 Uhr. Pflicht.", "Sie halten nächste Woche die M&M-Konferenz."]) + "“", [{ q: "Was sagst du?", options: [
    { label: "„Jawohl, Herr Professor.“", act: () => ({ text: "„Schön. Und die Publikation bis Montag.“", stamps: pen({ duties: 2, tasks: ["Publikation für den Chef"] }) }) },
    { label: "„Ich habe ein Angebot aus der Industrie.“", hint: run.offers.size ? "" : "braucht ein Jobangebot", disabled: !run.offers.size,
      act: () => { const st = run.duties.length ? (run.duties.pop(), [good("−1 Dienst")]) : [good("Respekt")]; return { text: "Er wird blass. Plötzlich sind Sie „unverzichtbar“. Er streicht Ihnen sogar einen Dienst.", stamps: st }; } },
    { label: "„Mir geht's nicht gut.“", hint: "50 %", act: () => chance(.5) ? { text: "„Dann gehen Sie heim. Aber Montag sind Sie da.“", stamps: [good("Befreit")] } : { text: "„Dann machen Sie Nachtdienst, da ist es ruhiger.“", stamps: [{ text: addDuty("N") }].concat(pen({ nerves: 1 })) } }] }]);
  if (e.type === "V") return runChain(e, "„Kurze Kodierfrage, dauert nur eine Sekunde.“", [{ q: "„Ist ‚Patient hatte schlechte Laune‘ eine Nebendiagnose?“", options: [
    { label: "„Ja. R45.4, Reizbarkeit und Wut.“", act: () => ({ text: "Er ist tief beeindruckt. „Erlös plus 0,3 Prozent!“ Er tanzt davon.", stamps: [good("Befreit")].concat(gain({ nerves: 1 })) }) },
    { label: "„Nein.“", act: () => ({ text: "„Doch! Das ist GELD!“ Er gibt dir 37 Akten zum Nachkodieren.", stamps: pen({ tasks: ["DRG-Nachkodierung (37 Fälle)"], mins: 10 }) }) },
    { label: "„Ich bin Arzt, kein Buchhalter.“", hint: "50 %", act: () => chance(.5) ? { text: "„Noch.“ Er geht. Es klang wie eine Drohung.", stamps: [good("Befreit")] } : { text: "„Das steht so nicht in Ihrer Stellenbeschreibung.“ Formular 17b.", stamps: pen({ tasks: ["Formular 17b (3-fach)"] }) } }] }]);
  if (e.type === "I") return runChain(e, "„" + pick(["Warte! Hast du an Morbus Whipple gedacht?", "Natrium 134. Das müssen wir besprechen. Ausführlich.", "Die Differentialdiagnose umfasst 47 Punkte."]) + "“", [{ q: "„Schnelle Frage, Kollege: Was ist es immer?“", options: [
    { label: "„Lupus.“", hint: "50 %", act: () => chance(.5) ? { text: "„ES IST IMMER LUPUS!“ Er rennt in die Bibliothek. Die ist seit 2018 geschlossen.", stamps: [good("Befreit")] } : { text: "„Es ist NIE Lupus!“ Er erklärt dir 20 Minuten lang, warum.", stamps: pen({ mins: 20 }) } },
    { label: "„Sarkoidose.“", act: () => ({ text: "Er nickt ehrfürchtig. „Ein Kenner.“ Er lässt dich ziehen.", stamps: [good("Befreit")] }) },
    { label: "„Psychosomatisch.“", act: () => ({ text: "Er schnappt nach Luft und geht beleidigt. Perfekt.", stamps: pen({ energy: 5 }) }) },
    { label: "„Hier, ein seltener Fallbericht.“", hint: hasItem("7") ? "📕 verbrauchen" : "braucht 📕", disabled: !hasItem("7"), act: () => { takeItem("7"); for (const o of level.enemies) if (o.type === "I") o.stun = 20; return { text: "Er hält den Bericht wie einen heiligen Gral. Alle Internisten versammeln sich andächtig.", stamps: [good("Alle Nerds abgelenkt")] }; } }] }]);
  if (e.type === "A") return runChain(e, "„Psst. Wir befunden gerade. Im Dunkeln. Wie immer.“", [{ q: "„Sehen Sie hier was?“ Er zeigt auf einen schwarzen Bildschirm.", options: [
    { label: "„Einen Schatten.“", act: () => ({ text: "„Das ist der Monitorrand.“ Er gibt dir trotzdem einen Befund mit.", stamps: pen({ tasks: ["Befund abholen (folgt)"], mins: 10 }) }) },
    { label: "„Klinische Korrelation empfohlen.“", act: () => ({ text: "Ihm kommen die Tränen. „Endlich spricht jemand meine Sprache.“", stamps: [good("Befreit")].concat(gain({ nerves: 1 })) }) },
    { label: "„Ich seh nichts. Hier ist es dunkel.“", act: () => ({ text: "„Willkommen in der Radiologie.“ Er verschwindet in der Dunkelheit.", stamps: [good("Befreit")] }) }] }]);
  if (e.type === "Z") return runChain(e, "„" + pick(["Ich hab seit drei Wochen Schnupfen.", "Zeckenbiss. 2019. Ich wollte nur mal fragen.", "Mein Hausarzt hat Urlaub. Seit zwei Stunden.", "Mir ist seit gestern komisch. Und vorgestern auch."]) + "“", [{ q: "„Ist das ein Notfall?“", options: [
    { label: "„Ja.“", act: () => ({ text: "Du schreibst einen Arztbrief über Schnupfen. Drei Seiten. Mit Anamnese.", stamps: pen({ mins: 15, tasks: ["Arztbrief „Schnupfen“"] }) }) },
    { label: "„Nein.“", act: () => ({ text: "Er schreibt eine 1-Stern-Bewertung. Dann setzt er sich auf den Boden.", stamps: [good("Triagiert")] }) },
    { label: "„Triage Grün. Wartezeit: 7 Stunden.“", act: () => ({ text: "„Okay.“ Er setzt sich. Er hat Zeit. Viel Zeit.", stamps: [good("Triagiert")] }) }] }]);
  if (e.type === "g") return runChain(e, "„" + pick(["Ich wollte auch nur kurz ins Archiv… Das war 2009.", "Bleib doch. Für immer. Es gibt Kaffee. Kalten."]) + "“", [{ q: "Das Licht flackert. Es wird kalt.", options: [
    { label: "„Wer… sind Sie?“", act: () => ({ text: "„Ich bin du. In fünfzehn Jahren.“ Er lächelt.", stamps: pen({ nerves: 1, energy: 15 }) }) },
    { label: "„Gehen Sie heim, Dr. Ewig.“", hint: "50 %", act: () => chance(.5) ? { text: "Er schaut auf seine Uhr. „Schon so spät?“ Er löst sich auf. Endlich Feierabend.", stamps: gain({ nerves: 1, text: "Geist erlöst" }) } : { text: "„Heim? Was ist das?“ Er verschwindet im Boden. Vorerst.", stamps: pen({ nerves: 1 }) } },
    breakFree(25, "Du rennst so schnell wie seit dem Physikum nicht mehr.")] }]);
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
