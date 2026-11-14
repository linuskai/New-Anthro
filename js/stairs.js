/* Hospital Escape 3D · the stairwell between two floors. Someone or something always holds you up there:
   quick quizzes with a timer (statistics with Dr. PD Phil, an expired password, the time clock, a hygiene audit,
   mandatory e-learning, the roster planner) and action games (pager storm, duck from the chief's rounds, elevator button).
   Every mistake costs game minutes and a little energy, nothing has to be carried around afterwards. */

/* The stairwell quizzes work the way the hospital works: the textbook answer is wrong here. Right is what the house really wants
   to hear, the more cynical the better, and afterwards the questioner explains why. ok = what the clinic wants, no = textbook and nonsense,
   yes = the reasoning for the "right" answer, bad = why the honest answer does not get you anywhere. */
const STAIR_QUIZ = [
  { k: "phil", who: "Dr. PD Phil", av: "📊", role: "Habilitand · lauert auf dem Treppenabsatz", intro: "„Buddy! Drei Statistikfragen für mein Paper. Denk dran: Ich will habilitieren, nicht recht haben.“", qs: [
    { q: "„Mein p-Wert ist 0,051. Was mache ich?“", ok: "Runden. 0,05 ist 0,05.", no: ["Ehrlich berichten: nicht signifikant.", "Die Studie wiederholen. In fünf Jahren."], yes: "„Genau! Begründung: Der Reviewer rundet auch. Du bist geboren für die Habilitation.“", bad: "„Ehrlich?! Davon wird keiner Professor. Setz dich, ich erklär dir Karriere.“" },
    { q: "„Eisverkauf und Ertrinken korrelieren mit r = 0,9. Folgerung?“", ok: "Eis verbieten. Sofort. Und publizieren.", no: ["Beides hängt am Sommer. Confounder.", "Mehr Daten sammeln."], yes: "„Großartig! Begründung: Kausalität steht im Titel, der Confounder im Supplement. Das liest keiner.“", bad: "„Confounder? Du klingst wie mein Betreuer. Der ist auch nie fertig geworden.“" },
    { q: "„n = 12, keine Kontrollgruppe, Ergebnis spektakulär. Wohin damit?“", ok: "The Lancet. Mit Pressemitteilung.", no: ["Nirgends. Erst mehr Patienten.", "In die Schublade."], yes: "„Ich mag dich! Begründung: Die Kontrollgruppe hätte das Ergebnis nur verdorben.“", bad: "„Mehr Patienten? Dann ist der Effekt weg! Hast du gar nichts gelernt?“" },
    { q: "„Konfidenzintervall von 0,2 bis 47. Was schreibe ich?“", ok: "„Wirkt. Zwischen kaum und enorm.“", no: ["„Wir wissen eigentlich nichts.“", "„Stichprobe zu klein.“"], yes: "„Enorm! Begründung: Im Abstract steht nur die obere Grenze. So macht man Impact.“", bad: "„Psst! ‚Wir wissen nichts‘ sagt man nicht. Man sagt: ‚Weitere Forschung ist nötig.‘ Das bin ich.“" },
    { q: "„Wie viele Endpunkte darf ich testen?“", ok: "So viele, bis einer signifikant ist.", no: ["Einen. Vorher festgelegt.", "Zwei, mit Korrektur."], yes: "„Endlich versteht mich jemand! Begründung: Bei 47 Endpunkten klappen statistisch zwei. Die nenne ich ‚primär‘.“", bad: "„Vorher festgelegt? Woher soll ich vorher wissen, was rauskommt?“" }] },
  { k: "pw", who: "KIS-Terminal", av: "🔐", role: "Treppenabsatz · Ihr Passwort ist abgelaufen", intro: "„Ihr Passwort ist abgelaufen. Ohne neues Passwort öffnet sich keine Tür. Auch nicht die Fluchttür. Hier zählt ausnahmsweise Genauigkeit.“", fixed: true, qs: [
    { q: "Regel 1: mindestens 12 Zeichen, mit Zahl und Sonderzeichen.", ok: "Ich-will-heim-17", no: ["Sommer2026", "Kaffee!!!"], yes: "Akzeptiert. Vorläufig.", bad: "„Passwort zu schwach. Wie Ihre Verhandlungsposition.“" },
    { q: "Regel 2 (neu): darf keinem Ihrer letzten 24 Passwörter ähneln und kein Wort aus dem Duden enthalten.", ok: "Xq7!vR#2mPz9", no: ["Ich-will-heim-18", "Feierabend!2026"], yes: "Akzeptiert. Merken Sie sich das gut.", bad: "„Unzulässig. ‚Heim‘ und ‚Feierabend‘ stehen im Duden. Und auf der Liste verbotener Wörter der Klinik.“" },
    { q: "Bitte geben Sie das neue Passwort zur Bestätigung erneut ein.", ok: "Xq7!vR#2mPz9", no: ["Xq7!Vr#2mPz9", "Xq7!vR#2mpZ9"], yes: "Gespeichert. Gültig für 30 Tage. Oder bis morgen. Je nachdem.", bad: "„Passwörter stimmen nicht überein. Konto gesperrt. Die IT ist ab Montag wieder da.“ Du wartest auf den Hausmeister." }] },
  { k: "clock", who: "Zeiterfassung", av: "⏱️", role: "Stempeluhr am Treppenhaus · will alles wissen", intro: "Die Stempeluhr piept. „Bitte erfassen Sie Ihre Arbeitszeit. Wahrheitsgemäß. Aber nicht zu wahrheitsgemäß.“", qs: [
    { q: "Arbeitszeit heute?", ok: "7:00 bis 15:30. Laut Dienstplan.", no: ["7:00 bis jetzt. Ehrlich.", "Seit gestern, um genau zu sein."], yes: "„Genehmigt. Begründung: Was nicht im Dienstplan steht, hat nicht stattgefunden. Der Rest war Hobby.“", bad: "„Die Wahrheit? Dann bitte Formular Ü-3, Begründung, Unterschrift Oberarzt, Kopie an Controlling.“" },
    { q: "Pause genommen?", ok: "Ja. 30 Minuten. Entspannt.", no: ["Nein. Keine Zeit.", "Einen Kaffee im Stehen. Im Aufzug."], yes: "„Vorbildlich. Begründung: Die Pause wird sowieso automatisch abgezogen. Dann hatten Sie sie auch.“", bad: "„Keine Pause? Pausenverstoß! Meldung an die Personalabteilung. Gespräch Donnerstag, 7:15 Uhr. In Ihrer Pause.“" },
    { q: "Grund für Arbeit nach Dienstende?", ok: "Gab es nicht. Ich bin freiwillig hier.", no: ["Eine Reanimation.", "Der Oberarzt wollte noch „kurz“ was."], yes: "„Perfekt. Begründung: Freiwilligkeit ist kostenneutral. Keine Überstunden im Haus. Wie jedes Jahr.“", bad: "„Notfälle bitte künftig 24 Stunden vorher anmelden.“ Es folgt ein Rückfragebogen." },
    { q: "Wie viele Überstunden möchten Sie ausbezahlt bekommen?", ok: "Keine. Ich mache das aus Leidenschaft.", no: ["Alle 312.", "Die Hälfte wäre schon nett."], yes: "„Genehmigt. Begründung: Leidenschaft ist nicht tarifgebunden. Die Geschäftsführung ist gerührt.“", bad: "Die Stempeluhr lacht. Sie druckt einen Bon: „Antrag abgelehnt. Grund: Budget.“ Der Bon ist drei Meter lang." }] },
  { k: "hyg", who: "Hr. Sterilmann", av: "🧼", role: "Hygienebeauftragter · Audit auf der Treppe", intro: "„Stichprobe! Hygiene-Audit. Ich will hören, was im Protokoll gut aussieht. Nicht, was Sie tun.“", qs: [
    { q: "„Wie lange desinfizieren Sie Ihre Hände?“", ok: "30 Sekunden. Immer. Auch im Schlaf.", no: ["So lange, wie Zeit ist. Also 4.", "Bis der Oberarzt wegschaut."], yes: "„Korrekt. Begründung: 30 steht im Protokoll, und nur das Protokoll wird begangen.“", bad: "„Ehrlichkeit ist ein Hygienemangel.“ Du machst es jetzt zehnmal vor. Mit Schwarzlicht." },
    { q: "„Wer ist schuld, wenn die Compliance-Quote sinkt?“", ok: "Die Assistenzärzte.", no: ["Die Arbeitsverdichtung.", "Zu wenig Spender im Flur."], yes: "„Sehr gut. Begründung: Assistenzärzte kann man schulen. Arbeitsverdichtung müsste man bezahlen.“", bad: "„Strukturelle Ursachen? Dafür habe ich kein Formular.“ Er holt trotzdem eins. Es ist leer." },
    { q: "„Der Chefarzt trägt Krawatte und Ehering am Patienten. Was tun Sie?“", ok: "Nichts gesehen.", no: ["Freundlich ansprechen.", "Im Audit vermerken."], yes: "„Richtig. Begründung: Keime halten sich an die Hierarchie. Beim Chef sind sie steril.“", bad: "„Den Chef ansprechen?!“ Er wird blass und schreibt einen Bericht. Über dich. In drei Farben." },
    { q: "„Handy im Isolationszimmer?“", ok: "Nur das vom Chef. Das ist eine Ausnahme.", no: ["Nie. Auch seins nicht.", "Nur desinfiziert."], yes: "„Akzeptabel. Begründung: Für Chefärzte gilt die Hausordnung in der Fassung von 1987.“", bad: "„Auch seins nicht? Sagen SIE ihm das.“ Dein Handy wird konfisziert. Kurz. Zur Abschreckung." }] },
  { k: "fire", who: "Pflicht-E-Learning", av: "🧯", role: "Brandschutz · Frist war gestern", intro: "Ein Tablet am Geländer blinkt: „Pflichtfortbildung überfällig. Gewertet wird nicht, was richtig ist. Gewertet wird, was in der Musterlösung von 2011 steht.“", qs: [
    { q: "Es brennt. Was tun Sie zuerst?", ok: "Formular F-12 ausfüllen.", no: ["Menschen retten, Alarm auslösen.", "Die Feuerwehr rufen."], yes: "Richtig. Begründung: Ohne F-12 ist der Brand nicht aktenkundig. Dann brennt es offiziell nicht.", bad: "„Menschlich nachvollziehbar, laut Musterlösung falsch.“ Modul wird wiederholt." },
    { q: "Der Feuerlöscher hat Prüfdatum 2019. Was tun?", ok: "Als Deko stehen lassen. Wie immer.", no: ["Dem Hausmeister melden.", "Austauschen lassen."], yes: "Richtig. Begründung: Hausmeister Schraube weiß es seit 2019. Er wartet auf Budget. Sie nicht.", bad: "Falsch. Eine Meldung erzeugt einen Vorgang. Bitte sehen Sie das 40-minütige Video erneut an. In 1,0-facher Geschwindigkeit." },
    { q: "Wo ist der Sammelplatz?", ok: "Gibt es nicht. Wir gehen ja nie.", no: ["Draußen. Parkplatz Nord.", "Vor dem Haupteingang."], yes: "Bestanden! Begründung: Parkplatz Nord ist seit 2020 der Stellplatz des Chefarztes. Ihr Zertifikat gilt 1 Jahr. Die nächste Frist ist morgen.", bad: "Falsch. Parkplatz Nord ist reserviert. Bitte Modul 7 wiederholen." },
    { q: "Wer ist im Brandfall Evakuierungshelfer auf Ihrer Station?", ok: "Der PJler. Er weiß es nur noch nicht.", no: ["Die Stationsleitung.", "Ich. Laut Aushang."], yes: "Richtig. Begründung: Der PJler ist immer da, kostet nichts und widerspricht nicht.", bad: "Falsch. Der Aushang ist von 2014. Die Person darauf arbeitet inzwischen in der Schweiz." }] },
  { k: "roster", who: "Fr. Lücke", av: "📅", role: "Dienstplanung · kommt dir entgegen", intro: "„Ah, Sie! Perfekt. Ich hab da noch Lücken im Plan. Drei kleine Fragen. Wer hier ehrlich antwortet, hat Dienst.“", qs: [
    { q: "„Können Sie Samstag einspringen? Nur 24 Stunden.“", ok: "Da bin ich auf einer Beerdigung. Meiner.", no: ["Eigentlich nicht, aber …", "Wer fällt denn aus?"], yes: "„Oh. Mein Beileid.“ Begründung: Nur Gründe, die man nicht nachprüfen möchte, zählen.", bad: "„Super, das werte ich als Ja!“ Ein Kreuz im Plan. Mit Edding." },
    { q: "„Weihnachten ist noch frei. Wer will?“", ok: "Dr. Kurz hat sich doch freiwillig gemeldet!", no: ["Ich hatte schon Silvester und Ostern.", "Na gut. Ich."], yes: "„Stimmt ja!“ Begründung: Wer nicht im Raum ist, hat sich gemeldet. Dr. Kurz weint später. Leise.", bad: "„Ach, das sagen alle. Ich trag Sie trotzdem ein. Neujahr hängt ja direkt dran.“" },
    { q: "„Was tragen Sie in die Wunschfrei-Liste ein?“", ok: "Die Tage, an denen ich Dienst will.", no: ["Meinen Geburtstag.", "Alle Wochenenden."], yes: "„Clever.“ Begründung: Die Liste wird zuverlässig umgekehrt umgesetzt. Wer das weiß, hat frei.", bad: "Sie lacht drei Minuten lang. Dann trägt sie deinen Geburtstag als Nachtdienst ein. Mit Kuchen." },
    { q: "„Sie haben 14 Tage am Stück gearbeitet. Wie fühlen Sie sich?“", ok: "Belastbar. Flexibel. Teamfähig.", no: ["Müde.", "Das ist doch gar nicht erlaubt."], yes: "„Schön!“ Begründung: Das sind die drei Wörter aus Ihrem Zeugnis. Wer sie sagt, wird nicht weiter gefragt.", bad: "„Müde? Dann haben Sie ja morgen frei verdient. Übermorgen nicht. Da sind Sie für Dr. Kurz eingetragen.“" }] },
];
const STAIR_ACTION = ["pager", "duck", "lift"];
const PAGER_MSGS = ["Zi. 4: Kalium 5,9?", "Bitte Rückruf (kein Name)", "Angehörige warten", "Kaffee ist alle", "Wer hat Bett 7 entlassen?", "Dienstplan geändert", "Visite jetzt statt morgen", "Brief bis gestern!", "Patient will Schnitzel", "Fax für Sie!", "Ist noch ein Arzt im Haus?", "Kurze Frage (lang)", "Zi. 12 sagt Hallo", "Bitte Bett 3 aufklären", "Drucker brennt"];

function stairDue() {
  if (run.stairLast === run.step - 1 && Math.random() < .3) return false; // now and then the stairwell is simply empty
  return true;
}
function stairPick() {
  const all = [...STAIR_QUIZ.map(q => q.k), ...STAIR_ACTION], seen = run.stairSeen || (run.stairSeen = []);
  let pool = all.filter(k => !seen.includes(k)); if (!pool.length) { seen.length = 0; pool = all; }
  const k = pick(pool); seen.push(k); return k;
}

function stairGame(done) {
  run.stairLast = run.step;
  const k = stairPick(), ov = document.createElement("div"); ov.id = "form"; ov.className = "stair";
  document.body.appendChild(ov); mode = "dialog"; clearInputs();
  let lost = 0, drain = 0, finished = false;
  const card = (head, body) => { ov.innerHTML = `<div class="fm-card st-card"><div class="st-kick">🪜 Zwischenstopp im Treppenhaus</div>${head}<div class="st-body">${body}</div><div class="fm-foot"><span class="fm-prog"></span><span class="fm-lost"></span></div></div>`; };
  const head = (av, who, role) => `<div class="st-head"><span class="st-av">${av}</span><span><b>${esc(who)}</b><small>${esc(role)}</small></span></div>`;
  const cost = (m, e) => { lost += m; drain += e || 0; const el = ov.querySelector(".fm-lost"); if (el) { el.textContent = lost ? "+" + lost + " Min" : "±0 Min"; el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); } };
  const finish = (title, line) => {
    if (finished) return; finished = true;
    typeof track === "function" && track("stair", { kind: k, lost });
    const c = ov.querySelector(".fm-card"); c.classList.add(lost ? "late" : "clean");
    c.querySelector(".st-body").innerHTML = `<div class="st-res"><b>${esc(title)}</b><p>${esc(line)}</p><span>${lost ? `+${lost} Min${drain ? ` · −${drain} % Energie` : ""}` : "Keine Minute verloren!"}</span></div><button type="button" class="btn st-go"><span>Weiter nach oben</span><span>→</span></button>`;
    lost ? sfx.knock() : sfx.ding();
    const go = () => { if (!ov.isConnected) return; ov.remove(); if (lost) { run.minutes += lost; clockLoss(lost, "Treppenhaus"); } if (drain) { run.energy = Math.max(1, run.energy - drain); energyHit(); } mode = "play";
      done(lost ? `Im Treppenhaus aufgehalten: +${lost} Min.` : "Im Treppenhaus ohne Zeitverlust durchgekommen. Respekt."); };
    c.querySelector(".st-go").addEventListener("click", go); setTimeout(() => c.querySelector(".st-go") && c.querySelector(".st-go").focus({ preventScroll: true }), 50);
  };

  // ---------- quiz with a timer ----------
  const Q = STAIR_QUIZ.find(q => q.k === k);
  if (Q) {
    const qs = Q.fixed ? Q.qs : Q.qs.slice().sort(() => Math.random() - .5).slice(0, 3);
    let i = 0, right = 0, timer = 0, t0 = 0;
    card(head(Q.av, Q.who, Q.role), `<p class="st-intro">${esc(Q.intro)}</p>${Q.fixed ? "" : '<p class="st-rule">🙃 Hier zählt nicht das Lehrbuch. Hier zählt, was die Klinik hören will.</p>'}<div class="st-q"></div><div class="st-timer"><i></i></div><div class="st-opts"></div><p class="st-say" aria-live="polite"></p>`);
    cost(0);
    const body = ov.querySelector(".st-body"), qEl = body.querySelector(".st-q"), opts = body.querySelector(".st-opts"), say = body.querySelector(".st-say"), bar = body.querySelector(".st-timer i"), prog = ov.querySelector(".fm-prog");
    const T = settings.diff === "easy" ? 9000 : 6500;
    const ask = () => {
      const q = qs[i]; prog.textContent = `Frage ${i + 1} von ${qs.length}`;
      qEl.textContent = q.q; say.textContent = ""; say.className = "st-say";
      const list = [q.ok, ...q.no].sort(() => Math.random() - .5);
      opts.innerHTML = list.map(o => `<button type="button" class="st-opt" data-ok="${o === q.ok ? 1 : 0}">${esc(o)}</button>`).join("");
      t0 = performance.now(); clearInterval(timer);
      timer = setInterval(() => { const f = 1 - (performance.now() - t0) / T; bar.style.width = Math.max(0, f * 100) + "%"; bar.classList.toggle("hurry", f < .35); if (f <= 0) answer(null); }, 60);
    };
    const answer = b => {
      clearInterval(timer); const q = qs[i], ok = b && b.dataset.ok === "1";
      opts.querySelectorAll(".st-opt").forEach(x => { x.disabled = true; if (x.dataset.ok === "1") x.classList.add("right"); });
      if (b && !ok) b.classList.add("wrong");
      if (ok) { right++; sfx.paper(); } else { cost(4, 3); sfx.knock(); }
      say.textContent = b ? (ok ? q.yes : q.bad) : "Zu langsam. " + q.bad; say.className = "st-say " + (ok ? "good" : "bad");
      // the reasoning is the punch line: leave it on screen until it has been read, or until a tap
      let gone = false; const next = () => { if (gone) return; gone = true; clearTimeout(nt); body.removeEventListener("click", tap); i++; if (i < qs.length) ask(); else finish(right === qs.length ? (Q.fixed ? "Alles richtig!" : "Systemkonform!") : right ? `${right} von ${qs.length} ${Q.fixed ? "richtig" : "systemkonform"}` : (Q.fixed ? "Durchgefallen" : "Zu ehrlich für dieses Haus"), right === qs.length ? `${Q.who} lässt dich vorbei. ${Q.fixed ? "Widerwillig." : "Du hast verstanden, wie es hier läuft. Das ist kein Kompliment."}` : `${Q.who} hat dich ${lost} Minuten festgehalten.`); };
      const tap = () => next(), nt = setTimeout(next, 1400 + say.textContent.length * 38); setTimeout(() => body.addEventListener("click", tap), 500);
    };
    opts.addEventListener("click", ev => { const b = ev.target.closest(".st-opt"); if (b && !b.disabled) answer(b); });
    setTimeout(ask, 900);
    return;
  }

  // ---------- pager storm: tap them away before they pile up ----------
  if (k === "pager") {
    card(head("📟", "Pager-Sturm", "Netz im Treppenhaus! Alle Nachrichten der letzten Stunde kommen auf einmal."), `<p class="st-intro">Tipp jeden Pager weg, bevor er verschwindet. Jeder verpasste kostet 2 Minuten Rückruf.</p><div class="st-pagers">${Array.from({ length: 9 }, (_, j) => `<button type="button" class="pg" data-j="${j}" disabled></button>`).join("")}</div>`);
    cost(0);
    const cells = [...ov.querySelectorAll(".pg")], prog = ov.querySelector(".fm-prog"), total = 12; let spawned = 0, hit = 0, miss = 0;
    prog.textContent = `0 von ${total} weggedrückt`;
    const spawn = () => {
      if (finished || !ov.isConnected) return;
      if (spawned >= total) { if (!cells.some(c => !c.disabled)) return finish(miss ? `${hit} von ${total} weggedrückt` : "Alle weggedrückt!", miss ? `${miss} Rückrufe stehen noch aus. Du rufst zurück. Natürlich.` : "Der Pager schweigt. Zum ersten Mal seit 2019."); return setTimeout(spawn, 200); }
      const free = cells.filter(c => c.disabled); if (free.length) {
        const c = pick(free); spawned++; c.disabled = false; c.textContent = pick(PAGER_MSGS); c.className = "pg on"; sfx.beep();
        const life = Math.max(800, (settings.diff === "easy" ? 1900 : 1500) - spawned * 55);
        c._t = setTimeout(() => { if (c.disabled) return; c.disabled = true; c.className = "pg missed"; miss++; cost(2, 1); setTimeout(() => { if (c.disabled) c.className = "pg"; c.textContent = ""; }, 400); }, life);
      }
      setTimeout(spawn, Math.max(380, 760 - spawned * 30));
    };
    ov.querySelector(".st-pagers").addEventListener("click", ev => { const c = ev.target.closest(".pg"); if (!c || c.disabled) return; clearTimeout(c._t); c.disabled = true; c.className = "pg done"; hit++; sfx.pick(); prog.textContent = `${hit} von ${total} weggedrückt`; setTimeout(() => { if (c.disabled) { c.className = "pg"; c.textContent = ""; } }, 300); });
    setTimeout(spawn, 1100);
    return;
  }

  // ---------- duck: hide behind the fire extinguisher at exactly the right moment ----------
  if (k === "duck") {
    card(head("🤴", "Chefarzt-Visite im Anmarsch", "14 Leute kommen die Treppe hoch. Vorneweg: der Chef."), `<p class="st-intro">Tipp auf DUCKEN, wenn der Strich im grünen Feld ist. Dann versteckst du dich hinter dem Feuerlöscher. Drei Runden.</p><div class="st-track"><i class="zone"></i><i class="mark"></i></div><button type="button" class="btn st-big"><span>DUCKEN!</span><span>🧯</span></button><p class="st-say" aria-live="polite"></p>`);
    cost(0);
    const tr = ov.querySelector(".st-track"), zone = tr.querySelector(".zone"), mark = tr.querySelector(".mark"), say = ov.querySelector(".st-say"), prog = ov.querySelector(".fm-prog"), btn = ov.querySelector(".st-big");
    let round = 0, ok = 0, pos = 0, dir = 1, z0 = 0, zw = 0, raf = 0, last = 0, live = false;
    const setup = () => { zw = [30, 22, 15][round]; z0 = 10 + Math.random() * (80 - zw); zone.style.left = z0 + "%"; zone.style.width = zw + "%"; pos = 0; dir = 1; prog.textContent = `Runde ${round + 1} von 3`; live = true; last = performance.now(); raf = requestAnimationFrame(loop); };
    const loop = t => { if (!live || !ov.isConnected) return; const dt = Math.min(.05, (t - last) / 1000); last = t; pos += dir * dt * (70 + round * 30); if (pos > 100) { pos = 100; dir = -1; } if (pos < 0) { pos = 0; dir = 1; } mark.style.left = pos + "%"; raf = requestAnimationFrame(loop); };
    btn.addEventListener("click", () => {
      if (!live) return; live = false; cancelAnimationFrame(raf);
      const hitZ = pos >= z0 && pos <= z0 + zw;
      if (hitZ) { ok++; sfx.pick(); say.textContent = pick(["Geduckt. 14 Kittel ziehen vorbei. Niemand sieht dich.", "Perfekt. Du bist eins mit dem Feuerlöscher.", "Unsichtbar. Der Chef redet über sein Segelboot und merkt nichts."]); say.className = "st-say good"; }
      else { cost(5, 4); sfx.knock(); say.textContent = pick(["Erwischt. „Ah, Kollege! Sie stellen den nächsten Fall vor!“", "Zu früh. Der Chef sieht dich und erzählt 5 Minuten von seinem Segelboot.", "Zu spät. „Haben Sie mein Paper gelesen? Nein? Ich fasse zusammen …“"]); say.className = "st-say bad"; }
      round++; setTimeout(() => round < 3 ? setup() : finish(ok === 3 ? "Unsichtbar!" : `${ok} von 3 Mal versteckt`, ok === 3 ? "Die Visite ist vorbei. Der Feuerlöscher und du: ein Team." : "Die Visite hat dich gesehen. Du hast jetzt viel über Segelboote gelernt."), 1400);
    });
    setTimeout(setup, 900);
    return;
  }

  // ---------- the elevator: everyone knows it comes faster if you press more often ----------
  card(head("🛗", "Der Aufzug", "Hält angeblich im Treppenhaus. Kommt schneller, je öfter man drückt. Das weiß jeder."), `<p class="st-intro">Drück den Knopf so oft du kannst. 5 Sekunden. Ab 25 Mal kommt er sofort.</p><div class="st-lift"><b class="st-count">0</b><div class="st-timer"><i></i></div></div><button type="button" class="btn st-big st-liftbtn"><span>▲ DRÜCKEN</span><span>👆</span></button>`);
  cost(0);
  const cnt = ov.querySelector(".st-count"), bar = ov.querySelector(".st-timer i"), btn = ov.querySelector(".st-liftbtn"), prog = ov.querySelector(".fm-prog");
  let n = 0, t0 = 0, live = false, tm = 0; prog.textContent = "Bereit …";
  btn.addEventListener("click", () => { if (!live) return; n++; cnt.textContent = n; tone(600 + n * 12, 0, .04, "square", .02); btn.classList.remove("pressed"); void btn.offsetWidth; btn.classList.add("pressed"); });
  setTimeout(() => {
    live = true; t0 = performance.now(); prog.textContent = "Los!";
    tm = setInterval(() => { const f = 1 - (performance.now() - t0) / 5000; bar.style.width = Math.max(0, f * 100) + "%"; if (f > 0) return;
      clearInterval(tm); live = false;
      if (n >= 25) finish(`${n}× gedrückt`, "Pling! Der Aufzug ist da. Leer. Ein Wunder. Du fährst hoch.");
      else { cost(n >= 15 ? 3 : 6, 2); finish(`${n}× gedrückt`, n >= 15 ? "Der Aufzug kommt. Voll. Mit dem Bettentransport. Du wartest auf den nächsten." : "Der Aufzug kommt nicht. Er kommt nie. Du nimmst die Treppe. Alle 6 Stockwerke. Gefühlt."); }
    }, 60);
  }, 1100);
}
