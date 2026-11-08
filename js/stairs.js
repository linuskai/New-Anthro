/* Hospital Escape 3D · the stairwell between two floors. Someone or something always holds you up there:
   quick quizzes with a timer (statistics with Dr. PD Phil, an expired password, the time clock, a hygiene audit,
   mandatory e-learning, the roster planner) and action games (pager storm, duck from the chief's rounds, elevator button).
   Every mistake costs game minutes and a little energy, nothing has to be carried around afterwards. */

const STAIR_QUIZ = [
  { k: "phil", who: "Dr. PD Phil", av: "📊", role: "Habilitand · lauert auf dem Treppenabsatz", intro: "„Buddy! Drei Statistikfragen für mein Paper. Dauert nur kurz. Wie immer.“", qs: [
    { q: "„Mein p-Wert ist 0,051. Was mache ich?“", ok: "Ehrlich berichten: nicht signifikant.", no: ["Runden. 0,05 ist 0,05.", "Den Ausreißer löschen. Er hieß eh Klaus."], yes: "„Langweilig. Aber korrekt. Reviewer 2 nickt.“", bad: "„Genau so! Du bist geboren für die Habilitation.“ Er umarmt dich. Lange." },
    { q: "„Eisverkauf und Ertrinken korrelieren mit r = 0,9. Folgerung?“", ok: "Beides hängt am Sommer. Confounder.", no: ["Eis verbieten. Sofort.", "Ertrinkende essen mehr Eis."], yes: "„Pff. Du klingst wie mein Betreuer.“", bad: "„Großartig! Das wird mein Science-Paper!“ Er diktiert dir die Einleitung." },
    { q: "„n = 12, keine Kontrollgruppe, Ergebnis spektakulär. Welches Journal?“", ok: "Keins. Erst mal mehr Patienten.", no: ["The Lancet. Mit Pressemitteilung.", "Instagram. Mit Ringlicht."], yes: "„Spielverderber.“ Er streicht dich aus der Danksagung.", bad: "„Ich mag dich!“ Du bist jetzt Korrespondenzautor. Viel Glück." },
    { q: "„Konfidenzintervall von 0,2 bis 47. Was heißt das?“", ok: "Wir wissen eigentlich nichts.", no: ["Sehr, sehr signifikant.", "Es wirkt. Zwischen kaum und enorm."], yes: "„Psst! Nicht so laut. Der Chef hört mit.“", bad: "„Genau! Enorm! Ich schreib ‚enorm‘ ins Abstract.“" },
    { q: "„Wie viele Endpunkte darf ich testen, bis einer signifikant ist?“", ok: "Einen. Vorher festgelegt.", no: ["So viele, bis es klappt.", "Zwanzig. Statistisch klappt dann einer."], yes: "„Du bist ja ein richtiger Wissenschaftler. Wie traurig.“", bad: "„Endlich versteht mich jemand!“ Er zeigt dir alle 47 Endpunkte." }] },
  { k: "pw", who: "KIS-Terminal", av: "🔐", role: "Treppenabsatz · Ihr Passwort ist abgelaufen", intro: "„Ihr Passwort ist abgelaufen. Ohne neues Passwort öffnet sich keine Tür. Auch nicht die Fluchttür.“", fixed: true, qs: [
    { q: "Regel 1: mindestens 12 Zeichen, mit Zahl und Sonderzeichen.", ok: "Ich-will-heim-17", no: ["Sommer2026", "Kaffee!!!"], yes: "Akzeptiert. Vorläufig.", bad: "„Passwort zu schwach. Wie Ihre Verhandlungsposition.“" },
    { q: "Regel 2 (neu): darf keinem Ihrer letzten 24 Passwörter ähneln und kein Wort aus dem Duden enthalten.", ok: "Xq7!vR#2mPz9", no: ["Ich-will-heim-18", "Feierabend!2026"], yes: "Akzeptiert. Merken Sie sich das gut.", bad: "„Unzulässig. ‚Heim‘ und ‚Feierabend‘ stehen im Duden. Und auf der Liste verbotener Wörter der Klinik.“" },
    { q: "Bitte geben Sie das neue Passwort zur Bestätigung erneut ein.", ok: "Xq7!vR#2mPz9", no: ["Xq7!Vr#2mPz9", "Xq7!vR#2mpZ9"], yes: "Gespeichert. Gültig für 30 Tage. Oder bis morgen. Je nachdem.", bad: "„Passwörter stimmen nicht überein. Konto gesperrt. Die IT ist ab Montag wieder da.“ Du wartest auf den Hausmeister." }] },
  { k: "clock", who: "Zeiterfassung", av: "⏱️", role: "Stempeluhr am Treppenhaus · will alles wissen", intro: "Die Stempeluhr piept. „Bitte erfassen Sie Ihre Arbeitszeit. Wahrheitsgemäß. Aber nicht zu wahrheitsgemäß.“", qs: [
    { q: "Arbeitszeit heute?", ok: "7:00 bis 15:30. Laut Dienstplan.", no: ["7:00 bis jetzt. Ehrlich.", "Wie viel darf ich denn?"], yes: "„Genehmigt. Der Rest war freiwilliges Engagement. Danke!“", bad: "„Überstundenantrag erforderlich: Formular Ü-3, Begründung, Unterschrift Oberarzt, Kopie an Controlling.“" },
    { q: "Pause genommen?", ok: "Ja. 30 Minuten. Wie vorgeschrieben.", no: ["Nein. Keine Zeit.", "Zählt Kaffee im Stehen?"], yes: "„Vorbildlich. Wir tragen die Pause automatisch ein. Gemacht haben Sie sie ja trotzdem nicht.“", bad: "„Pausenverstoß! Meldung an die Personalabteilung. Gespräch Donnerstag, 7:15 Uhr.“" },
    { q: "Grund für Arbeit nach Dienstende?", ok: "Es gab keine.", no: ["Eine Reanimation.", "Der Oberarzt."], yes: "„Perfekt. Keine Überstunden im Haus. Wie jedes Jahr. Laut Statistik.“", bad: "„Bitte melden Sie Notfälle künftig 24 Stunden vorher an.“ Es folgt ein Rückfragebogen." }] },
  { k: "hyg", who: "Hr. Sterilmann", av: "🧼", role: "Hygienebeauftragter · Audit auf der Treppe", intro: "„Stichprobe! Hygiene-Audit. Drei Fragen. Nicht anfassen. Nichts. Nie.“", qs: [
    { q: "„Wie lange desinfizieren Sie Ihre Hände?“", ok: "30 Sekunden.", no: ["Bis der Oberarzt wegschaut.", "Was sind Hände?"], yes: "„Korrekt. Ich hab mitgezählt. Laut.“", bad: "„FALSCH.“ Du machst es jetzt zehnmal vor. Mit Schwarzlicht." },
    { q: "„Kittel nach Kontakt mit Noro-Patient?“", ok: "In den Wäschesack.", no: ["Zurück an den Haken.", "Dem PJler anziehen."], yes: "„Gut. Sie dürfen weiteratmen.“", bad: "Er wird blass. Dann holt er einen Ordner. Er ist dick." },
    { q: "„Ring, Uhr, Nagellack bei der Patientenversorgung?“", ok: "Alles ab.", no: ["Nur die Smartwatch bleibt. Die zählt Schritte.", "Der Ehering ist emotional steril."], yes: "„Sehr gut. Ich mag Sie fast.“", bad: "„Emotional steril?!“ Er schreibt einen Bericht. Über dich. In drei Farben." },
    { q: "„Handy im Isolationszimmer?“", ok: "Nur desinfiziert. Und nicht ans Ohr.", no: ["Klar, für Fotos fürs Paper.", "Der Chef telefoniert da auch."], yes: "„Akzeptabel. Gerade so.“", bad: "„Der Chef ist eine Ausnahme. Sie nicht.“ Das Handy wird konfisziert. Kurz." }] },
  { k: "fire", who: "Pflicht-E-Learning", av: "🧯", role: "Brandschutz · Frist war gestern", intro: "Ein Tablet am Treppengeländer blinkt: „Ihre Pflichtfortbildung ist überfällig. Sie verlassen das Gebäude erst nach Bestehen. Ironie nicht beabsichtigt.“", qs: [
    { q: "Es brennt. Was tun Sie zuerst?", ok: "Menschen retten, Alarm auslösen.", no: ["Formular F-12 ausfüllen.", "Prüfen, ob die Kostenstelle stimmt."], yes: "Richtig. Wird nicht angerechnet, weil Sie zu schnell geantwortet haben.", bad: "„Bürokratisch korrekt, menschlich fragwürdig.“ Modul wird wiederholt." },
    { q: "Der Feuerlöscher hat Prüfdatum 2019. Was tun?", ok: "Hausmeister Schraube melden.", no: ["Benutzen und hoffen.", "Als Deko stehen lassen. Wie immer."], yes: "Richtig. Schraube weiß es seit 2019. Er wartet auf Budget.", bad: "Falsch. Bitte sehen Sie sich das 40-minütige Video erneut an. In 1,0-facher Geschwindigkeit." },
    { q: "Wo ist der Sammelplatz?", ok: "Draußen. Parkplatz Nord.", no: ["Im Arztzimmer, da ist Kaffee.", "Gibt's nicht. Wir gehen ja nie."], yes: "Bestanden! Ihr Zertifikat ist 1 Jahr gültig. Die nächste Frist ist morgen.", bad: "Falsch. Aber ehrlich. Bitte Modul 7 wiederholen." }] },
  { k: "roster", who: "Fr. Lücke", av: "📅", role: "Dienstplanung · kommt dir entgegen", intro: "„Ah, Sie! Perfekt. Ich hab da noch ein paar Lücken im Plan. Drei kleine Fragen.“", qs: [
    { q: "„Können Sie Samstag einspringen? Nur 24 Stunden.“", ok: "Nein.", no: ["Eigentlich nicht, aber …", "Wer fällt denn aus?"], yes: "Sie ist so überrascht, dass sie dich durchlässt. Ein einfaches Nein. Revolutionär.", bad: "„Super, ich hab das als Ja gewertet!“ Ein Kreuz im Plan. Mit Edding." },
    { q: "„Weihnachten ist noch frei. Wer will?“", ok: "Ich hab schon Silvester und Ostern.", no: ["Klar, warum nicht.", "Ich kündige heute."], yes: "„Fair.“ Sie nimmt Dr. Kurz. Er weint leise.", bad: "„Ach, das sagen alle. Ich trag Sie trotzdem ein. Neujahr hängt ja direkt dran.“" },
    { q: "„Was tragen Sie in die Wunschfrei-Liste ein?“", ok: "Nichts. Wünsche werden eh ignoriert.", no: ["Meinen Geburtstag.", "Alle Wochenenden."], yes: "„Endlich mal jemand Realistisches.“", bad: "Sie lacht drei Minuten lang. Dann trägt sie deinen Geburtstag als Nachtdienst ein. Mit Kuchen." }] },
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
    card(head(Q.av, Q.who, Q.role), `<p class="st-intro">${esc(Q.intro)}</p><div class="st-q"></div><div class="st-timer"><i></i></div><div class="st-opts"></div><p class="st-say" aria-live="polite"></p>`);
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
      setTimeout(() => { i++; if (i < qs.length) ask(); else finish(right === qs.length ? "Alles richtig!" : right ? `${right} von ${qs.length} richtig` : "Durchgefallen", right === qs.length ? `${Q.who} lässt dich vorbei. Widerwillig.` : `${Q.who} hat dich ${lost} Minuten festgehalten.`); }, ok ? 1500 : 2300);
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
