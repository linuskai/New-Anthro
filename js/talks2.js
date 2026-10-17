/* Hospital Escape 3D · conversation pools, part 2: doctors, admin, nerds, radiology, the ghost. Plus the dispatcher and the gadgets. */
Object.assign(TALKS, {
  O: [
    { id: "samstag", go: T("", [
      { q: "„Sie machen doch Samstag, oder?“", options: [
        opt("„Selbstverständlich!“", () => say("„Wusste ich's doch. Teamplayer.“", pen({ duties: 1 }))),
        bluff("„Da ist die Hochzeit meiner Schwester.“", .45, "Er glaubt dir. Du hast keine Schwester.", "„Die hat doch letzten Monat schon geheiratet.“ Strafdienst.", { duties: 2, nerves: 1 }),
        opt("„Nein.“", () => say("Stille. Er notiert sich etwas. Du weißt nicht, was. Das ist das Schlimmste.", pen({ nerves: 2 })), () => run.nerves >= 3 ? "−2 Nerven" : "braucht 3 Nerven", () => run.nerves < 3),
        breakFree(25, "Du tust, als würde dein Pieper gehen. Pieper wurden 2019 eingespart. Egal, du bist weg.")] },
      { q: "„Und morgen in der Frühbesprechung stellen Sie vor. Thema?“", options: [
        opt("„Hyponatriämie.“", () => say("„Langweilig. Aber gut.“ 40 Folien bis 6:30.", pen({ tasks: ["Vortrag Hyponatriämie (40 Folien)"] }))),
        opt("„Work-Life-Balance.“", () => free("Er lacht fünf Minuten lang. Tränen. Du gehst einfach.")),
        opt("„Ich hab morgen frei.“", () => say("„Hatten Sie.“", pen({ duties: 1 })))] }]) },
    { id: "paper", go: T("„Haben Sie Lust auf ein kleines Paper? Retrospektiv. 4.000 Akten. Bis Freitag.“", [{ q: "„Sie werden Drittautor. Vielleicht Viertautor.“", options: [
      opt("„Total!“", () => say("Er klopft dir auf die Schulter. Die Akten liegen im Keller. Bei Dr. Ewig.", pen({ tasks: ["4.000 Akten auswerten (Keller)"] }))),
      bluff("„Ich bin ab Montag in Elternzeit.“", .4, "„Oh! Glückwunsch!“ Er fragt nicht nach. Er will keine Details.", "„Sie haben doch gar keine Kinder.“ – „Noch nicht.“ Er gibt dir trotzdem das Paper.", { tasks: ["4.000 Akten auswerten"] }),
      opt("„Ich arbeite schon mit PD Dr. Phil.“", () => free("Er wird blass. „Dann haben Sie genug gelitten.“ Er legt dir kurz die Hand auf die Schulter.", gain({ nerves: 1 })))] }]) },
    { id: "briefe", go: T("„Ihre Arztbriefe. 23 Stück. Die gehen heute noch raus, ja?“", [{ q: "Er hält einen Stapel hoch. Er ist dicker als das Telefonbuch von 1998.", options: [
      opt("„Klar, heute noch.“", () => say("Er nickt zufrieden. Heute endet um Mitternacht. Theoretisch.", pen({ mins: 25, tasks: ["23 Arztbriefe (heute!)"] }))),
      opt("„Mein Diktiergerät ist kaputt.“", () => say("Er gibt dir seins. Es ist von 1994. Mit Kassette. Und alten Diktaten.", pen({ tasks: ["Briefe auf Kassette diktieren"] }))),
      opt("„Die schreibt ab jetzt die KI.“", () => say("„Die KI? Die wurde eingespart. Sie sind die KI.“", pen({ nerves: 1 })))] }]) },
    { id: "mm", go: T("„Montag M&M-Konferenz. Sie stellen einen Fall vor.“", [{ q: "„Welchen?“", options: [
      opt("„Den, wo alles gut ging.“", () => say("„Das ist keine M&M-Konferenz, das ist ein Wunder.“ Er will trotzdem Folien.", pen({ tasks: ["M&M-Folien (das Wunder)"] }))),
      opt("„Meinen eigenen. Burnout, Tag 31.“", () => free("Er überlegt. „Interessanter Verlauf.“ Er streicht dich von der Liste. Aus Mitleid.")),
      opt("„Den von Dr. Kurz.“", () => free("„Ah, der mit den Brötchen.“ Er grinst. Dr. Kurz wird Montag vorstellen."))] }]) },
    { id: "visitequiz", go: T("„Kurze Frage, so zum Spaß. Nicht prüfungsrelevant. Na gut, ein bisschen.“", [
      quizStep("„Häufigste Ursache einer Hyponatriämie bei stationären Patienten?“", ["Medikamente und SIADH", "Zu wenig Salz auf den Pommes", "Mondphase"], 0, "„Korrekt.“ Er wirkt enttäuscht. Er hatte sich auf einen Vortrag gefreut.", "Er hält dir einen 30-minütigen Vortrag. Ohne Folien. Mit Kreide.", { mins: 25 })]) },
    { id: "potenzial", go: T("„Ich sehe Potenzial in Ihnen. Viel Potenzial.“", [
      { q: "„Für Wochenenddienste.“", options: [
        opt("„Danke, das ehrt mich.“", () => say("„Schön. Dann trage ich Sie für Ostern ein. Und Pfingsten.“", pen({ duties: 2 }), -1)),
        opt("„Ich sehe auch Potenzial. Für Teilzeit.“", () => say("Er lacht. Dann merkt er, dass du es ernst meinst. Er hört auf zu lachen.", [], 0)),
        opt("Einfach nicken und rückwärts gehen", () => say("Rückwärts bis zur Treppe. Du hast Potenzial. Für Tanz.", [], 1))] },
      { q: "„Und wie wär's mit Rufbereitschaft? Ist ja nur Bereitschaft.“", options: [
        opt("„Was ist mit Dr. Kurz?“", () => say("„Gute Idee.“ Er schreibt Dr. Kurz auf. Dr. Kurz schreibt dir nie wieder.", [], 1)),
        opt("„Okay.“", () => say("„Prima. Pieper holen Sie sich morgen. Gibt's keine mehr. Nehmen Sie Ihr Handy.“", pen({ duties: 1, dutyCode: "RB" }), -1)),
        breakFree(20, "Du gähnst. Ganz lange. Er bekommt Mitleid. Oder Angst, dass es ansteckend ist.")] }]) },
  ],

  C: [
    { id: "befehl", go: e => runChain(e, "„" + pick(["Wochenende? Beide Tage. Und den Feiertag.", "Qualitätszirkel, Samstag 7 Uhr. Pflicht.", "Sie halten nächste Woche die M&M-Konferenz."]) + "“", [{ q: "Was sagst du?", options: [
      opt("„Jawohl, Herr Professor.“", () => say("„Schön. Und die Publikation bis Montag.“", pen({ duties: 2, tasks: ["Publikation für den Chef"] }))),
      opt("„Ich habe ein Angebot aus der Industrie.“", () => { const st = run.duties.length ? (run.duties.pop(), [good("−1 Dienst")]) : [good("Respekt")]; return say("Er wird blass. Plötzlich sind Sie „unverzichtbar“. Er streicht Ihnen sogar einen Dienst.", st); }, () => run.offers.size ? "" : "braucht ein Jobangebot", () => !run.offers.size),
      bluff("„Mir geht's nicht gut.“", .5, "„Dann gehen Sie heim. Aber Montag sind Sie da.“", "„Dann machen Sie Nachtdienst, da ist es ruhiger.“", { duties: 1, dutyCode: "N", nerves: 1 })] }]) },
    { id: "name", go: T("„Ah, Sie sind… Herr… äh… Frau… Kollege… wie war der Name?“", [{ q: "Er arbeitet seit drei Jahren mit dir.", options: [
      opt("„Dr. Kurz.“", () => free("„Ah, Dr. Kurz! Sie machen also Samstag.“ Er notiert es. Du hast gerade Dr. Kurz verkauft.")),
      opt("„Ihr Lieblingsassistent.“", () => say("Er lacht wohlwollend. „Den hab ich gar nicht.“ Er geht. Es hat trotzdem wehgetan.", pen({ nerves: 1 }))),
      opt("„Ich bin der neue Controller.“", () => free("Er wird blass, rückt seine Krawatte zurecht und flieht in den Aufzug. Der fährt nicht. Er nimmt die Treppe."))] }]) },
    { id: "golf", go: T("„Spielen Sie eigentlich Golf?“", [
      { q: "Er macht einen Probeschwung. Mit einem Reflexhammer.", options: [
        bluff("„Handicap 4.“", .4, "Er lädt dich Samstag zum Golf ein. Golf statt Dienst! Du kannst kein Golf. Egal.", "„Dann erklären Sie mir mal den Unterschied zwischen Birdie und Eagle.“ Du sagst „Vögel“.", { duties: 1 }),
        opt("„Nein.“", () => say("„Schade. Dann haben Sie ja Zeit für Dienste.“", pen({ duties: 1 }))),
        opt("„Minigolf. Vereinsmeister 2004.“", () => free("Er hält es für einen Witz. Er lacht. Du lässt ihn in dem Glauben."))] }]) },
    { id: "chefvisite", go: T("„Chefvisite morgen 6:30. Sie präsentieren alle 32 Patienten. Auswendig.“", [quizStep("„Zur Übung: Was hat Herr Meier auf Zimmer 12?“", ["Pneumonie, Tag 3 Antibiose, besser", "„Er hat… Zimmer 12.“", "„Einen sehr netten Bettnachbarn.“"], 0, "Er ist tief beeindruckt. „Den will ich in meinem Team.“ Du bist schon in seinem Team. Er weiß es nicht.", "„Ich sehe, Sie kennen Ihre Patienten.“ Er meint es nicht als Lob.", { duties: 1, nerves: 1 })]) },
    { id: "fuenfjahre", go: T("„Wo sehen Sie sich in fünf Jahren?“", [{ q: "Er setzt seinen Personalgesprächsblick auf.", options: [
      opt("„Hier, in Ihrem Team.“", () => say("„Sehr gut. Dann können wir ja langfristig planen.“ Er plant. Wochenenden.", pen({ duties: 2 }))),
      bluff("„Auf Ihrem Stuhl.“", .4, "Er lacht. „Ehrgeiz! Gefällt mir.“ Er klopft dir auf die Schulter und geht.", "Er lacht nicht. Er kauft einen neuen Stuhl. Einen mit Schloss.", { duties: 1, nerves: 1 }),
      opt("„Im Bett. Schlafend.“", () => free("Er schaut dich an. Dann lacht er ehrlich. „Ich auch.“ Ein Moment echter Menschlichkeit. Er geht schnell weg, bevor es jemand sieht.", gain({ nerves: 1 })))] }]) },
  ],

  V: [
    { id: "r45", go: T("„Kurze Kodierfrage, dauert nur eine Sekunde.“", [{ q: "„Ist ‚Patient hatte schlechte Laune‘ eine Nebendiagnose?“", options: [
      opt("„Ja. R45.4, Reizbarkeit und Wut.“", () => free("Er ist tief beeindruckt. „Erlös plus 0,3 Prozent!“ Er tanzt davon.", gain({ nerves: 1 }))),
      opt("„Nein.“", () => say("„Doch! Das ist GELD!“ Er gibt dir 37 Akten zum Nachkodieren.", pen({ tasks: ["DRG-Nachkodierung (37 Fälle)"], mins: 10 }))),
      bluff("„Ich bin Arzt, kein Buchhalter.“", .5, "„Noch.“ Er geht. Es klang wie eine Drohung.", "„Das steht so nicht in Ihrer Stellenbeschreibung.“ Formular 17b.", { tasks: ["Formular 17b (3-fach)"] })] }]) },
    { id: "kulis", go: T("„Sie haben diesen Monat 14 Kugelschreiber verbraucht. Der Durchschnitt liegt bei zwei.“", [{ q: "Er hält eine Tabelle hoch. Die Kulis sind farbig markiert.", options: [
      opt("„Die nehmen die Patienten mit.“", () => free("„Dann berechnen wir die den Patienten!“ Er eilt davon, eine neue Abrechnungsziffer zu erfinden.")),
      opt("„Ich schreibe viel. Für Sie.“", () => say("„Dann schreiben Sie bitte auch den Nachweis.“ Mit Kuli Nummer 15.", pen({ tasks: ["Kugelschreiber-Verbrauchsnachweis"] }))),
      opt("Ihm wortlos einen Kuli schenken", () => free("Er nimmt ihn. Er ist gerührt. Niemand hat ihm je etwas geschenkt. Er bucht ihn als Spende.", gain({ nerves: 1 })))] }]) },
    { id: "verweildauer", go: T("„Herr Meier liegt 0,3 Tage über der Grenzverweildauer!“", [{ q: "„Was gedenken Sie zu tun?“", options: [
      opt("„Ich entlasse ihn sofort.“", () => say("Es ist 17:20. Herr Meier hat kein Taxi, keine Schuhe und keine Ahnung. Viel Spaß.", pen({ tasks: ["Entlassung Hr. Meier (jetzt?!)"] }))),
      opt("„Er bleibt, bis es ihm gut geht.“", () => free("Er greift sich ans Herz. „Das… ist keine Kennzahl!“ Er muss sich setzen. Du nutzt die Gelegenheit.")),
      opt("„Ich kodiere eine Komplikation: Bürokratie.“", () => free("„Gibt es dafür einen Code?“ Er sucht. Er wird die ganze Nacht suchen."))] }]) },
    { id: "licht", go: T("„Im Arztzimmer brennt noch Licht! 4 Cent pro Stunde!“", [quizStep("„Wie viel Strom spart man, wenn man das Licht 10 Minuten ausschaltet?“", ["Fast nichts. Aber gut gemeint.", "Eine Million Euro", "Genug für eine neue Pflegestelle"], 0, "„Fast nichts ist mehr als nichts!“ Er geht zufrieden das Licht ausschalten. Im Arztzimmer sitzt noch Dr. Kurz.", "Er notiert deine Antwort für den Jahresbericht. Unter „Einsparpotenzial: Ärzte“.", { tasks: ["Stromspar-Schulung"] })]) },
    { id: "laecheln", go: T("„Pflichtschulung ‚Effizient lächeln‘. Heute 17:30. Raum 4.117.“", [{ q: "„Dauert nur zwei Stunden. Mit Zertifikat.“", options: [
      opt("Effizient lächeln", () => free("Du lächelst. Sehr effizient. Er ist überzeugt. „Sie brauchen die Schulung nicht.“")),
      opt("„Ich habe Dienstende.“", () => say("„Schulungen sind Freizeit.“ Er trägt dich ein.", pen({ tasks: ["Schulung „Effizient lächeln“"] }))),
      opt("„Ich halte die Schulung!“", () => say("Er ist begeistert. Du musst jetzt eine Schulung halten. Über Lächeln. Du lächelst nicht.", pen({ tasks: ["Schulung halten (Lächeln)"], mins: 5 })))] }]) },
  ],

  I: [
    { id: "lupus", go: e => runChain(e, "„" + pick(["Warte! Hast du an Morbus Whipple gedacht?", "Natrium 134. Das müssen wir besprechen. Ausführlich.", "Die Differentialdiagnose umfasst 47 Punkte."]) + "“", [{ q: "„Schnelle Frage, Kollege: Was ist es immer?“", options: [
      bluff("„Lupus.“", .5, "„ES IST IMMER LUPUS!“ Er rennt in die Bibliothek. Die ist seit 2018 geschlossen.", "„Es ist NIE Lupus!“ Er erklärt dir 20 Minuten lang, warum.", { mins: 20 }),
      opt("„Sarkoidose.“", () => free("Er nickt ehrfürchtig. „Ein Kenner.“ Er lässt dich ziehen.")),
      opt("„Psychosomatisch.“", () => say("Er schnappt nach Luft und geht beleidigt. Perfekt.", pen({ energy: 5 }))),
      opt("„Hier, ein seltener Fallbericht.“", () => { takeItem("7"); for (const o of level.enemies) if (o.type === "I") o.stun = 20; return say("Er hält den Bericht wie einen heiligen Gral. Alle Internisten versammeln sich andächtig.", [good("Alle Nerds abgelenkt")], 1); }, () => hasItem("7") ? "📕 verbrauchen" : "braucht 📕", () => !hasItem("7"))] }]) },
    { id: "natrium", go: T("„Natrium 134! Was machen wir?!“", [quizStep("Er zittert vor Aufregung.", ["„Nichts. Das ist fast normal.“", "„Hypertone Kochsalzlösung, sofort!“", "„Wir warten auf die Mondfinsternis.“"], 0, "„Fast normal?!“ Er ist entsetzt. Und dann erleichtert. Und dann wieder entsetzt. Du gehst.", "Er liebt es. Er rechnet dir 20 Minuten lang Natriumdefizite vor. Mit drei Formeln.", { mins: 20 })]) },
    { id: "zebra", go: T("„Hufgetrappel im Flur!“", [{ q: "„Pferd oder Zebra?“", options: [
      opt("„Pferd.“", () => free("„Langweilig. Aber korrekt.“ Er seufzt und zieht weiter.")),
      opt("„ZEBRA!“", () => say("„ENDLICH versteht mich jemand!“ Er umarmt dich. Die Umarmung dauert. Er erzählt von Amyloidose.", pen({ mins: 15 }))),
      opt("„Das ist Frau Bozkurt mit dem Putzwagen.“", () => free("Ihr lauscht. Es ist Frau Bozkurt. Er ist enttäuscht. Du nicht.", gain({ energy: 5 })))] }]) },
    { id: "ekg", go: T("„Schau dir dieses EKG an! Ist das ein Brugada?!“", [quizStep("Du schaust. In der Mitte ist ein brauner Kreis.", ["„Das ist ein Kaffeefleck.“", "„Eindeutig Brugada Typ 1.“", "„Das ist moderne Kunst.“"], 0, "Er hält das EKG ins Licht. Kaffee. Er ist am Boden zerstört. Du gehst leise.", "Er ist begeistert. Ihr meldet einen Kaffeefleck als Fallbericht. Du bist Zweitautor.", { tasks: ["Fallbericht „Kaffee-Brugada“"] })]) },
    { id: "leitlinie", go: T("„Kennst du schon die neue Leitlinie? 412 Seiten. Ich hab sie dabei.“", [{ q: "Er zieht einen Ordner aus dem Kittel. Wie passt der da rein?", options: [
      opt("„Kenn ich auswendig.“", () => say("„Seite 214, Absatz 3?“ Du schweigst. Er liest ihn dir vor.", pen({ mins: 12 }))),
      opt("„Gibt's die als Podcast?“", () => free("„Als PODCAST?“ Er ist so empört, dass er die Leitlinie fallen lässt. Du nutzt das Chaos.")),
      opt("„Ich lese lieber die Zusammenfassung.“", () => free("„Die Zusammenfassung hat 80 Seiten.“ Er gibt sie dir. Du legst sie unauffällig auf den Wäschewagen."))] }]) },
    { id: "zufall", go: T("„Ich hab einen Zufallsbefund! Bei mir selbst!“", [{ q: "„Mein TSH ist 4,3. Obere Grenze. Was heißt das?“", options: [
      opt("„Normal. Gehen Sie heim.“", () => free("„HEIM?“ Das Wort scheint ihm fremd. Er wiederholt es. Er probiert es aus. Er geht tatsächlich.", gain({ nerves: 1 }))),
      opt("„Wir machen Sono, Szinti, Biopsie.“", () => say("Er strahlt. Er bucht alles sofort. Für morgen. Unter deinem Namen.", pen({ tasks: ["Schilddrüsen-Diagnostik für einen Kollegen"] }))),
      opt("„Wahrscheinlich Lupus.“", () => say("Er wird bleich. Dann rot. Dann rennt er zum Labor. Er wird die Nacht dort verbringen.", [good("Befreit")]))] }]) },
  ],

  A: [
    { id: "schwarz", go: T("„Psst. Wir befunden gerade. Im Dunkeln. Wie immer.“", [{ q: "„Sehen Sie hier was?“ Er zeigt auf einen schwarzen Bildschirm.", options: [
      opt("„Einen Schatten.“", () => say("„Das ist der Monitorrand.“ Er gibt dir trotzdem einen Befund mit.", pen({ tasks: ["Befund abholen (folgt)"], mins: 10 }))),
      opt("„Klinische Korrelation empfohlen.“", () => free("Ihm kommen die Tränen. „Endlich spricht jemand meine Sprache.“", gain({ nerves: 1 }))),
      opt("„Ich seh nichts. Hier ist es dunkel.“", () => free("„Willkommen in der Radiologie.“ Er verschwindet in der Dunkelheit."))] }]) },
    { id: "anmeldung", go: T("„Ihre CT-Anmeldung. Fragestellung: ‚Ausschluss alles‘.“", [{ q: "„Das ist keine Fragestellung. Das ist ein Hilferuf.“", options: [
      opt("„Dann: Ausschluss nichts?“", () => free("Er befundet es sofort: „Nichts ausgeschlossen.“ Zufrieden geht er zurück ins Dunkel.")),
      opt("„Unterbauchschmerz rechts, V. a. Appendizitis.“", () => free("Er ist gerührt. Eine echte Fragestellung. Er rahmt sie ein.", gain({ nerves: 1 }))),
      opt("„Der Chef will's halt.“", () => say("„Dann morgen. Oder nie. Eher nie.“", pen({ tasks: ["CT-Anmeldung neu schreiben"] })))] }]) },
    { id: "kreatinin", go: T("„Ohne aktuelles Kreatinin kein Kontrastmittel.“", [quizStep("„Kreatinin 3,4. Was machen wir?“", ["Nutzen-Risiko abwägen, eventuell nativ oder MRT ohne Gadolinium-Risiko prüfen", "„Doppelte Dosis, dann sieht man mehr.“", "„Einfach nicht hinschauen.“"], 0, "Er nickt im Dunkeln. Du hörst es. „Gut.“", "Er schaltet kurz das Licht an, nur um dich ansehen zu können. Dann wieder aus.", { tasks: ["Nierenfunktion klären"] })]) },
    { id: "inzidentalom", go: T("„Zufallsbefund! Ein Inzidentalom. 3 Millimeter.“", [{ q: "„Kontrolle in 6 Monaten. Dann 12. Dann 24. Dann für immer.“", options: [
      opt("„Und wer schreibt die Kontrollen auf?“", () => say("Er zeigt auf dich. Im Dunkeln. Du spürst es.", pen({ tasks: ["Kontroll-CT planen (für immer)"] }))),
      opt("„Kann man das nicht einfach … nicht gesehen haben?“", () => free("Er überlegt. „Was gesehen?“ Er zwinkert. Glaubst du jedenfalls.")),
      opt("„Herzlichen Glückwunsch, es ist ein Inzidentalom.“", () => free("Er ist so stolz, als wäre es sein Kind. Er druckt das Bild aus. Für den Kühlschrank."))] }]) },
    { id: "lampe", go: T("„Machen Sie bitte die Lampe aus. Sie blenden meine Seele.“", [{ q: "Er hält sich die Hand vor die Augen. Seit 2017 hat er kein Tageslicht gesehen.", options: [
      opt("„Sorry!“ (Lampe aus)", () => { player.lampOn = false; return free("Dunkelheit. Er seufzt erleichtert. „Danke. Jetzt sehe ich wieder alles.“ Er sieht nichts."); }),
      opt("„Sie sollten mal raus.“", () => say("„Raus? Wohin? Was ist ‚raus‘?“ Er klingt ehrlich verwirrt. Das dauert.", pen({ mins: 8 }))),
      opt("Ihm die Batterie geben", () => { takeItem("9"); return free("Er nimmt die Batterie und lächelt. Er wird sie nie benutzen. Es ist eine Geste.", gain({ nerves: 1 })); }, () => hasItem("9") ? "🔋 abgeben" : "braucht 🔋", () => !hasItem("9"))] }]) },
  ],

  g: [
    { id: "ewig", go: e => runChain(e, "„" + pick(["Ich wollte auch nur kurz ins Archiv… Das war 2009.", "Bleib doch. Für immer. Es gibt Kaffee. Kalten."]) + "“", [{ q: "Das Licht flackert. Es wird kalt.", options: [
      opt("„Wer… sind Sie?“", () => say("„Ich bin du. In fünfzehn Jahren.“ Er lächelt.", pen({ nerves: 1, energy: 15 }))),
      bluff("„Gehen Sie heim, Dr. Ewig.“", .5, "Er schaut auf seine Uhr. „Schon so spät?“ Er löst sich auf. Endlich Feierabend.", "„Heim? Was ist das?“ Er verschwindet im Boden. Vorerst."),
      breakFree(25, "Du rennst so schnell wie seit dem Physikum nicht mehr.")] }]) },
    { id: "uhrzeit", go: T("„Weißt du, wie spät es ist? Ich wollte um 17 Uhr gehen. 2009.“", [{ q: "Seine Uhr ist stehen geblieben. Seine Augen auch.", options: [
      opt("„17:00. Sie haben Feierabend!“", () => free("„FEIERABEND?“ Er strahlt. Er wird durchsichtig. Er winkt. Er ist weg. Du hast einen Geist erlöst.", gain({ nerves: 1, text: "Geist erlöst" }))),
      opt("„Es ist 2026.“", () => say("Er weint. Geistertränen sind kalt. Sie tropfen auf deine Schuhe.", pen({ nerves: 1 }))),
      opt("„Machen Sie meinen Dienst?“", () => say("Er reicht dir seinen Pieper. Er ist kalt und piept seit 2009.", pen({ duties: 1, dutyCode: "N" })))] }]) },
    { id: "briefe", go: T("„Hast du meine Arztbriefe gesehen? 2009 bis heute. Sie sind noch nicht fertig.“", [{ q: "Hinter ihm stapeln sich Akten bis zur Decke. Sie schimmern.", options: [
      opt("„Ich hab sie fertig geschrieben.“", () => free("„Wirklich?“ Er glaubt dir. Er seufzt tief. Ein Seufzer von 17 Jahren. Er verblasst.", gain({ nerves: 1 }))),
      opt("„Die schreibt jetzt der Nachtdienst.“", () => free("„Der Nachtdienst…“ Er nickt verständnisvoll. Er geht den Nachtdienst suchen.")),
      opt("„Ich helfe Ihnen.“", () => say("Du schreibst einen Brief. Datum: 2009. Patient: verstorben 2011. Du verstehst gar nichts mehr.", pen({ mins: 15, nerves: 1 })))] }]) },
  ],
});

/* one conversation per person, no repeats inside a run */
function hostileDialog(e) {
  flash(); sfx.hit();
  if (navigator.vibrate) try { navigator.vibrate(100); } catch (_) {}
  if (call && !call.def.forced) endCall();
  if (e.type === "D" && (!TALKS.D || Math.random() < .6)) return phdQuiz(e);
  if (e.type === "V" && run.route === "consult" && !run.flags.has("excel")) return stampDialog(e);
  if (run.goodwill[e.type] > 0) {
    run.goodwill[e.type]--;
    const line = { N: "„Du bist doch vorhin rangegangen! Danke. Geh, ich mach das hier.“", V: "„Sie haben mit der Bettendisposition telefoniert? Vorbildlich. Ich halte Sie nicht auf.“", C: "„Ah, Sie haben mein Sekretariat zurückgerufen. Gehen Sie, gehen Sie.“", I: "„Du hast dein Passwort geändert? Respekt. Lauf, bevor es wieder abläuft.“" }[e.type];
    return runChain(e, "", [{ q: line, options: [opt("„Danke!“", () => free("Telefon-Karma eingelöst. Manchmal lohnt es sich, ranzugehen.", [good("Goodwill")]))] }]);
  }
  if (e.type === "J") return hildegardCatch(e);
  const pool = (run.mode === "night" && TALKS[e.type + "n"]) || TALKS[e.type] || TALKS.P;
  if (!run.usedTalks) run.usedTalks = new Set();
  let fresh = pool.filter(t => !run.usedTalks.has(e.type + t.id));
  if (!fresh.length) { for (const t of pool) run.usedTalks.delete(e.type + t.id); fresh = pool; }
  const t = pick(fresh); run.usedTalks.add(e.type + t.id);
  t.go(e);
}

// ---------- gadgets: elevator, computer, phone, coffee machine ----------
function liftDialog(p) {
  sfx.lift(); p.open = 1.6;
  if (run.mode === "night") { sfx.stinger(); showToast("🛗", "#12161f", "Aufzug B · 03:00", pick(["Die Tür geht auf. Der Aufzug ist leer. Das Licht flackert. Auf dem Boden liegt eine Schwesternhaube. Die Tür geht zu. Du gehst nicht rein.", "Ding. Niemand drin. Aus dem Lautsprecher: „Kurven …“. Ding. Weg."]), []); return; }
  if (!level.exit || !exitOpen()) { showToast("🛗", "#9aa3a8", "Aufzug B", pick(["Er kommt. Die Tür geht auf. Drinnen ein Schild: „Fährt nur nach erledigter Mission (Dienstanweisung 12/2019).“ Die Tür geht wieder zu.", "Ding! Drinnen steht ein leeres Bett. Und ein Schild: „Erst die Mission.“ Die Tür schließt sich langsam. Sehr langsam.", "Er kommt, öffnet sich, spielt drei Töne Panflöte und fährt ohne dich weiter."]), []); return; }
  const next = run.mode === "mission" && !isLastFloor() ? nextLevel() : null;
  openDialog({ av: "🛗", color: "#9aa3a8", name: "Aufzug B", role: "Fährt (heute) · nächster Halt: " + (next ? next.short : "?"), text: "Er ist tatsächlich gekommen. Drinnen riecht es nach Desinfektionsmittel und Panik. Aus dem Lautsprecher: „Stayin' Alive“ auf Panflöte.",
    options: [
      opt("Einsteigen", () => {
        dlgState.onClose = () => nextFloor();
        const v = Math.random();
        if (v < .35) return { next: () => openDialog({ sp: TYPES.C.spec(), av: "🤴", color: "#9b6bff", name: "Prof. Dr. Dr. h.c. Übermut", role: "steigt im 4. OG zu · Fahrstuhlgespräch", text: "„Ah, Kollege! Gut, dass ich Sie treffe. Drei Stockwerke, Zeit für ein kurzes Gespräch. Wie wär's mit Ostern?“",
          options: [
            opt("„Ostern? Sehr gern.“", () => say("„Wunderbar.“ Die Tür geht auf. Er steigt aus. Du bist jetzt Ostern verplant.", pen({ duties: 1 }))),
            opt("Den Nothalt drücken", () => say("Alarm. Der Chef steht mit dir zwischen zwei Etagen. Er ruft den Hausmeister. Der Hausmeister ist im Keller. 15 Minuten Stille.", pen({ mins: 15 }))),
            opt("„Ich steige hier aus.“ (rückwärts raus)", () => free("Du springst raus, bevor die Tür zugeht. Sein Satz bleibt im Aufzug. Er fährt ohne dich weiter. Du nimmst den nächsten."))], onClose: () => nextFloor() }) };
        if (v < .6) return say("Der Aufzug bleibt stecken. Zwischen zwei Etagen. Panflöte. Nach 12 Minuten fährt er weiter, als wäre nichts gewesen.", pen({ mins: 12 }));
        return say("Er fährt. Einfach so. Kein Gespräch, keine Panne. Nur Panflöte. Du fühlst dich wie im Urlaub.", gain({ energy: 10 }));
      }),
      opt("Doch lieber die Treppe", () => say("Treppe ist gesund. Sagt jedenfalls das Schild seit 2019."))] });
}
function pcDialog() {
  openDialog({ av: "💻", color: "#2b7bb9", name: "KIS 2003", role: "Bitte warten … (Programm reagiert nicht)", text: "23 offene Arztbriefe. 41 ungelesene Befunde. Ein Pop-up: „Ihr Passwort läuft heute ab.“ Ein zweites: „Möchten Sie die Pop-ups deaktivieren? Dafür ist ein Ticket nötig.“",
    options: [
      opt("Formular A38 drucken", () => { run.flags.add("a38"); return say("Der Drucker ächzt. Papierstau. Du ziehst. Ein Formular A38 kommt heraus, leicht zerknittert, mit einem Kaffeefleck in Form von Bayern. Reicht.", [good("Formular A38")]); }, () => run.route === "amt" ? "Route Behörde" : "", () => run.route !== "amt" || run.flags.has("a38")),
      opt("Einen Arztbrief schreiben (nur einen!)", () => say("Du schreibst einen. Das KIS stürzt beim Speichern ab. Der Brief ist weg. Die 20 Minuten auch.", pen({ mins: 20 }))),
      opt("Passwort ändern", () => say("Mindestens 24 Zeichen, ein Emoji, eine Hieroglyphe, kein Wort aus dem Duden. „Feierabend!!11🙃𓀀“ ist zu kurz.", pen({ energy: 5 }))),
      opt("Dienstplan öffnen", () => say("Du stehst sechsmal drin. Einmal heute. Seit 7 Uhr. Laut Plan hast du jetzt frei. Laut Realität nicht.", [])),
      opt("Ausloggen und gehen", () => free("Weise Entscheidung. Der Bildschirm zeigt noch 40 Minuten lang „Abmelden …“."))] });
}
function phoneDialog() {
  openDialog({ av: "☎️", color: "#d8d4c8", name: "Diensttelefon", role: "Grau, aus den 90ern, klebt ein bisschen", text: "Das Telefon klingelt nicht. Noch nicht. Es wartet auf den perfekten Moment.",
    options: [
      opt("Abheben", () => pick([
        () => say("„Ach, Sie sind noch da? Perfekt! Hier ist Station 3B, kurze Frage …“ Du legst auf. Zu spät. Sie haben deine Stimme erkannt.", pen({ tasks: ["Rückruf 3B (sie wissen es)"] })),
        () => say("Kein Freizeichen. Die Telefonanlage läuft seit 2019 im Sparmodus. Man kann nur noch angerufen werden.", []),
        () => free("Die Zeitansage. Es ist 17:03. Du warst nie pünktlicher."),
      ])()),
      opt("Rückrufe abarbeiten", () => { const n = run.callbacks.length; workCallbacks(); return say(n ? "Du rufst alle zurück. Jeder will „nur ganz kurz“ etwas. Danach mögen sie dich." : "Keine offenen Rückrufe. Das Telefon ist irritiert.", []); }, () => run.callbacks.length ? run.callbacks.length + " offen" : "", () => !run.callbacks.length),
      opt("Pizza bestellen", () => say("„Pizzeria Notaufnahme, Lieferzeit neun Stunden.“ Wie bei uns. Du legst auf.", [])),
      opt("Mama anrufen", () => run.flags.has("mama") ? say("Besetzt. Sie redet gerade mit deiner Tante über dich.", []) : (run.flags.add("mama"), free("„Isst du auch genug?“ Fünf Minuten Wärme. Dann musst du los.", gain({ nerves: 1 })))),
      opt("Den Hörer daneben legen", () => free("Niemand erreicht dich mehr. Für diese eine Station. Ein kleiner Sieg."))] });
}
function brewDialog(p) {
  if (p.used) { showToast("☕", "#3a2414", "Kaffeemaschine", "Sie röchelt. Sie hat heute schon alles gegeben. Wie du.", []); return; }
  openDialog({ av: "☕", color: "#3a2414", name: "Kaffeemaschine", role: "DEFEKT · eingespart 03/24", text: "Ein Schild: „Defekt. Neue Maschine beantragt (2024). Bearbeitungsstand: in Prüfung.“ Sie brummt leise. Vielleicht lebt sie noch.",
    options: [
      opt("Draufhauen", () => { p.used = true; if (chance(.6)) { addItem("1"); return free("Sie röchelt. Ein Becher Kaffee. Lauwarm. Ein Wunder.", [good("☕ eingepackt")]); } return say("Sie röchelt und stirbt. Zum dritten Mal diese Woche.", []); }, "60 %"),
      opt("Sanft zureden", () => { p.used = true; addItem("1"); return free("„Du schaffst das.“ Sie schafft das. Du hast gerade eine Maschine motiviert. Die Personalabteilung wäre stolz.", [good("☕ eingepackt")]); }),
      opt("In Ruhe lassen", () => say("Sie bleibt allein im Dunkeln. Wie Dr. Ewig.", []))] });
}

/* Dermatologists who want to know what life as a "real" doctor is like */
TALKS.R = [
  { id: "botoxiv", go: T("„Kurze Frage, rein fachlich.“", [{ q: "„Darf man Botox eigentlich auch i.v. geben? Wenn der Patient beim Reanimieren so viele Falten hat?“", options: [
    opt("„Bei der Reanimation zählt nur der Puls.“", () => free("Sie notiert: „Puls > Falten“. Sie wirkt erschüttert. Und ein bisschen inspiriert.")),
    opt("„Nur mit Hyaluron-Bolus hinterher.“", () => say("Sie ist begeistert. Sie will sofort ein Paper schreiben. Mit dir als Erstautor. Über etwas, das es nicht gibt.", pen({ tasks: ["Paper „Botox in der Reanimation“ (Fiktion)"] }))),
    opt("„Fragen Sie die Anästhesie.“", () => free("„Die Anästhesie? Die sind doch immer so … wach.“ Sie geht. Sie fragt nicht."))] }]) },
  { id: "netflix", go: T("", [{ q: "„Wie ist das so, ein Nachtdienst? Ist das wie Netflix bis drei?“", options: [
    opt("„Ja. Nur dass die Serie zurückruft.“", () => free("Sie lacht. Dann versteht sie es. Dann lacht sie nicht mehr.")),
    opt("„Es ist wie Netflix. Aber alle Folgen gleichzeitig. Und du spielst mit.“", () => free("Sie greift nach ihrem Gurkenwasser. „Das klingt … intensiv.“", gain({ nerves: 1 }))),
    opt("Ihr 20 Minuten lang einen Nachtdienst schildern", () => say("Sie weint. Du weinst. Ihr umarmt euch. Dermatologie und Innere, vereint im Schmerz.", pen({ mins: 20 }).concat(gain({ nerves: 1 }))))] }]) },
  { id: "pieper", go: T("", [{ q: "„Was ist eigentlich ein Pieper? Ist das so ein Tamagotchi?“", options: [
    opt("„Genau. Nur dass er dich füttert. Mit Arbeit.“", () => free("„Süß!“ Sie will auch einen. Zur Deko.")),
    opt("Den Pieper zeigen", () => say("Er piept genau in dem Moment. Sie schreit. Du gehst ran. Station 3B.", pen({ tasks: ["Rückruf 3B (Pieper-Demo)"] }))),
    opt("„Ein Gerät, das nachts um 3 deinen Namen kennt.“", () => free("Sie schaut lange aus dem Fenster. „Und das macht ihr … freiwillig?“"))] }]) },
  { id: "drei", go: T("„Puh. Wir hatten heute DREI Patienten. Ich bin völlig fertig.“", [{ q: "„Wie viele hattet ihr so?“", options: [
    opt("„34.“", () => free("Sie muss sich setzen. Auf eine Wellness-Liege. Sie bestellt sich eine Gurke.")),
    opt("„Drei. Pro Stunde. Pro Flur.“", () => free("„Pro FLUR?“ Sie rechnet. Sie kann nicht so hoch rechnen. Sie geht.")),
    opt("„Ich zähle nicht mehr. Ich spüre sie nur noch.“", () => { addItem("+"); return free("Sie reicht dir wortlos eine Creme. „Für innen.“", [good("🫙 eingepackt")]); })] }]) },
  { id: "pickel", go: T("", [{ q: "„Ganz ehrlich: Kann man Pickel eigentlich reanimieren?“", options: [
    opt("„Nur mit 100 Kompressionen pro Minute.“", () => free("Sie probiert es sofort an sich selbst. Du gehst langsam rückwärts.")),
    opt("„Nein. Manche Dinge muss man gehen lassen.“", () => free("„Wow. Das ist … tief.“ Sie postet es mit Sonnenuntergang.", gain({ nerves: 1 }))),
    opt("„Das ist eher Ihr Fachgebiet.“", () => say("Sie erklärt dir 15 Minuten lang Komedonen. Mit Bildern. Vom Handy.", pen({ mins: 15 })))] }]) },
  { id: "kalium", go: T("„Ich hab heute im Labor ‚Kalium‘ gelesen.“", [quizStep("„Ist Kalium eigentlich ein Pflegeprodukt? Klingt so nach Peeling.“", ["„Ein Elektrolyt. Zu viel davon stoppt das Herz.“", "„Ja, für die Kopfhaut.“", "„Nur in der Bio-Variante.“"], 0, "Sie wird blass. „Das HERZ?“ Sie streicht Kalium von ihrer Wunschliste für die neue Pflegelinie.", "Sie bestellt 5 Liter. Für die Praxis. Du rufst morgen besser mal an.", { tasks: ["Dermatologie vor Kalium-Peeling warnen"] })]) },
  { id: "pappbecher", go: T("", [{ q: "„Stimmt es, dass ihr Kaffee aus PAPPbechern trinkt? Ohne Hafermilch?“", options: [
    opt("„Wenn wir Glück haben. Sonst aus dem Spritzenbecher.“", () => free("Sie hält sich die Hand vor den Mund. Sie schenkt dir ihren Oat-Flat-White.", gain({ energy: 30 }))),
    opt("„Kaffee? Den haben wir eingespart.“", () => free("Sie startet sofort eine Spendenaktion. „Kaffee für Assistenzärzte“. Hashtag. Du bist frei.")),
    opt("„Wir trinken ihn nicht. Wir inhalieren ihn.“", () => say("Sie glaubt dir. Sie will es ausprobieren. Sie hustet. Sehr lange.", pen({ mins: 5 })))] }]) },
  { id: "dienste", go: T("„Wir überlegen, auch Dienste anzubieten.“", [{ q: "„Bis 15:30 Uhr. Ist das zu hart?“", options: [
    opt("„Absolut. Das ist kein Leben.“", () => free("Sie nickt ernst. „Dann bis 15 Uhr.“ Sie fühlt sich sehr verantwortungsvoll.")),
    opt("„Macht doch einen 24-Stunden-Dienst.“", () => free("Sie lacht herzlich. Sie dachte, es wäre ein Witz. Du lässt sie in dem Glauben.")),
    opt("„Kann ich bei euch anfangen?“", () => { run.offers.add("botox"); return free("„Natürlich! Sprich mit Dr. Glatt. Wir haben eine Gurken-Flatrate.“", [good("Jobangebot Dermatologie")]); })] }]) },
  { id: "kaschmir", go: T("", [{ q: "„Was trägt man denn so unter dem Kittel, wenn man keinen Kaschmir hat?“", options: [
    opt("„Den Kasack von gestern.“", () => free("„Von GESTERN?“ Sie tritt einen Schritt zurück. Dann noch einen. Perfekt.")),
    opt("„Verzweiflung. Atmungsaktiv.“", () => free("Sie notiert es für die Herbstkollektion.")),
    opt("„Ein Funktionsshirt vom Halbmarathon 2014.“", () => free("Sie fragt nach der Größe. Sie will so eins. Vintage."))] }]) },
  { id: "notfall", go: T("„Wie fühlt sich eigentlich ein Notfall an?“", [{ q: "„Ist das so wie wenn der Laser ausfällt?“", options: [
    opt("„Genau so. Nur mit Blut. Und ohne Laser.“", () => free("Sie nickt verständnisvoll. Der Laser ist heute zweimal ausgefallen. Sie versteht dich jetzt.")),
    opt("„Stell dir vor, der Laser ruft dich nachts an.“", () => free("Sie zittert. „Der Laser hat meine Nummer nicht. Oder?“ Sie geht nachsehen.")),
    opt("Wortlos die Hand auf ihre Schulter legen", () => free("Sie beginnt zu weinen. Ein Notfall. Du bist zuständig. Wie immer.", pen({ energy: 8 })))] }]) },
  { id: "herzinfarkt", go: T("„Ich hab noch nie einen Herzinfarkt gesehen.“", [quizStep("„War deiner eher trocken oder eher ölig?“", ["„Das ist kein Hauttyp. Das ist ein Gefäßverschluss.“", "„Mischhaut.“", "„Eher fettig, mit Glanz.“"], 0, "„GEFÄSSverschluss?“ Sie schaut auf ihre Hände. Sie geht sofort zum Kardiologen. Zum ersten Mal.", "Sie empfiehlt ein Serum dagegen. Du nickst. Der Patient von gestern hätte es gebraucht.", { energy: 8 })]) },
  { id: "stehen", go: T("", [{ q: "„Ich hab gehört, ihr esst im Stehen. Ist das so ein Trend? Standing Lunch?“", options: [
    opt("„Standing Lunch, Walking Dinner, Running Breakfast.“", () => free("„Wie in Kopenhagen!“ Sie will das in der Derma einführen. Mit Tischdecken.")),
    opt("„Essen? Ich hatte heute ein Gummibärchen.“", () => free("Sie drückt dir einen Proteinriegel in die Hand. „Vegan, glutenfrei, schmeckt nach nichts.“", gain({ energy: 20 }))),
    opt("„Wir essen nicht. Wir verstoffwechseln Stress.“", () => free("Sie macht ein Foto von dir. „Für die Vorher-Bilder.“"))] }]) },
];

/* Night shift */
TALKS.Q = [
  { id: "mama", go: T("Er schläft. Mit offenen Augen.", [{ q: "„Mama? Ist schon Frühstück? Ich will Kakao.“", options: [
    opt("„Ja, Schatz. Kakao gibt's im Bett.“", () => free("Er nickt zufrieden und schlafwandelt zurück ins Zimmer. Du hast gerade jemanden ins Bett gebracht. Als Mama.")),
    opt("„Ich bin nicht deine Mama.“", () => say("Er fängt an zu weinen. Im Schlaf. Laut. Zi. 5.03 klingelt deswegen.", pen({ energy: 8 }))),
    opt("Ihn sanft umdrehen", () => free("Du drehst ihn um 180 Grad. Er läuft geradeaus weiter. Zurück ins Bett. Physik."))] }]) },
  { id: "pruefung", go: T("Sie murmelt im Schlaf.", [{ q: "„Ich hab die Prüfung … nicht gelernt … ist heute Physikum?“", options: [
    opt("„Nein. Physikum war 1987. Du hast bestanden.“", () => free("Sie lächelt im Schlaf. Ein Leben lang Angst, und jetzt: Erleichterung. Sie schlafwandelt zufrieden ins Bad.")),
    opt("„Ja. Und du bist zu spät.“", () => say("Sie rennt los. Im Nachthemd. Den Flur runter. Du musst hinterher.", pen({ energy: 12 }))),
    opt("Ihr eine Kurve zum Unterschreiben geben", () => free("Sie unterschreibt. Mit „Mama“. Rechtlich unklar, praktisch erledigt."))] }]) },
  { id: "kuehlschrank", go: T("Er steht vor der Stationsküche und starrt ins Leere.", [{ q: "„Wo … ist … der … Pudding?“", options: [
    opt("„Im Kühlschrank. Zweites Fach.“", () => free("Er findet den Pudding. Er isst ihn. Es ist der Pudding von Schwester Gertrud. Morgen gibt es Ärger. Nicht für dich.")),
    opt("„Der Pudding wurde eingespart.“", () => free("Er nickt. Er versteht. Er schläft im Stehen weiter. Selbst im Traum kennt er das Controlling.")),
    opt("Ihm deinen Donut geben", () => { takeItem("$"); return free("Er nimmt den Donut, sagt „Danke, Papa“ und geht. Du hast einen Sohn. Für eine Nacht.", gain({ nerves: 1 })); }, () => hasItem("$") ? "🍩 abgeben" : "braucht 🍩", () => !hasItem("$"))] }]) },
  { id: "vollmond", go: T("", [{ q: "„Doktor … ist heute Vollmond? Alle sind so komisch.“", options: [
    opt("„Ja. Und Hildegard ist unterwegs.“", () => say("Er erstarrt. „Hildegard?“ Er kriecht unters Bett. Du auch fast.", pen({ nerves: 1 }))),
    opt("„Nein, das ist nur die Notbeleuchtung.“", () => free("„Ach so.“ Er schläft beruhigt weiter. Im Stehen. Gegen die Wand gelehnt.")),
    opt("„Schlafen Sie weiter, das ist ein Traum.“", () => free("„Schöner Traum“, sagt er. Er sieht dich an. „Sie sehen müde aus.“ Er hat recht."))] }]) },
];
TALKS.Fn = [
  { id: "gegend", go: T("„Wir waren gerade in der Gegend!“ Es ist 3:12 Uhr.", [{ q: "„Wir wollten nur kurz schauen, ob Opa schläft.“", options: [
    opt("„Er schlief. Bis eben.“", () => free("Opa ruft aus dem Zimmer: „JETZT nicht mehr!“ Die Familie geht beschämt. Dirk filmt.")),
    opt("„Besuchszeit ist 15 bis 18 Uhr.“", () => say("„Wir haben Schichtdienst! Wie Sie!“ Sie setzen sich. Sie haben Thermoskannen dabei.", pen({ mins: 15 }))),
    opt("Ihnen Hildegard zeigen", () => free("Du zeigst ans Ende des Flurs. Da steht eine Haube. Die Familie ist in elf Sekunden im Aufzug. Rekord."))] }]) },
  { id: "kuchen", go: T("„Wir haben Kuchen mitgebracht! Für die Nachtschicht!“", [{ q: "Ein ganzes Blech Bienenstich. Um drei Uhr nachts.", options: [
    opt("„Danke!“ Ein Stück nehmen", () => free("Er ist noch warm. Oma hat um eins gebacken, weil sie nicht schlafen konnte. Du liebst Oma.", gain({ energy: 35, nerves: 1 }))),
    opt("„Zucker ist schlecht für Opa.“", () => say("„Der ist doch für SIE!“ Sie sind beleidigt. Sie essen den Kuchen selbst. Vor dir.", pen({ nerves: 1 }))),
    opt("„Stellen Sie ihn ins Stationszimmer.“", () => free("Sie stellen ihn ab und gehen. Um 6 Uhr ist er weg. Hildegard?"))] }]) },
];
TALKS.Cn = [
  { id: "frueh", go: T("„Guten Morgen! Ich bin früh dran. Bettflucht. Alter.“", [{ q: "„Wie war die Nacht?“", options: [
    opt("„Ruhig.“", () => say("Nirgends im Krankenhaus darf man „ruhig“ sagen. Sofort piept dein Pager dreimal.", pen({ nerves: 1 }))),
    opt("„Schwester Hildegard war da.“", () => free("Er wird kreidebleich. „Hildegard … ist 1998 in Rente gegangen.“ Er geht. Schnell. Rückwärts.")),
    opt("„Lang.“", () => free("Er klopft dir auf die Schulter. „Das ist Medizin.“ Er geht Kaffee trinken. Den letzten."))] }]) },
  { id: "kurven", go: T("„Ich wollte nur kurz die Kurven sehen.“", [{ q: "Es ist 5:20 Uhr. Er trägt Golfschuhe.", options: [
    opt("„Liegen im Stationszimmer.“", () => free("Er geht hin. Die Kurven sind abgezeichnet. Mit „Mama“. Er sagt nichts.")),
    opt("„Ich zeige sie Ihnen um 7.“", () => say("„Um 7 bin ich beim Golf.“ Er nimmt dich mit zur Kurvenschau. 20 Minuten.", pen({ mins: 20 }))),
    opt("„Die hat Hildegard.“", () => free("Er schaut den Flur entlang. Eine Haube. Er geht zum Golf. Sofort."))] }]) },
];
function hildegardCatch(e) {
  flash(); sfx.stinger(); sfx.hit();
  openDialog({ sp: e.person.sp, av: "🕯️", color: "#e8e4d0", name: "Schwester Hildegard", role: "Nachtwache · seit 1978 · steht direkt hinter dir",
    text: pick(["„Haben Sie die Kurven abgezeichnet? … Nein? … Dann zeichne ich SIE ab.“", "„Ruhige Nacht, nicht wahr? … Ruhig ist es nur, wenn man nicht hinsieht.“", "„Sie haben die Klingel in 5.07 nicht gehört. Ich höre ALLES.“", "„Früher hatten wir drei Nachtschwestern. Ich bin alle drei.“"]),
    options: [
      opt("„Ja, Schwester Hildegard.“", () => say("Sie nickt langsam. Die Kerze flackert. Als du blinzelst, ist sie weg.", pen({ nerves: 1 }))),
      opt("Wegrennen", () => say("Du rennst. Hinter dir: nichts. Vor dir: eine Haube. Du rennst anders herum.", pen({ energy: 20 }))),
      opt("Ihr deinen Kaffee anbieten", () => { takeItem("1"); return say("Sie trinkt ihn in einem Zug. Kalt. Sie lächelt. Zum ersten Mal seit 1978. Dann ist sie weg.", [good("Verschont")]); }, () => hasItem("1") ? "☕ abgeben" : "braucht ☕", () => !hasItem("1"))],
    onClose: () => { const [x, y] = farthestTile(); e.x = x + .5; e.y = y + .5; e.tx = x; e.ty = y; e.stun = 6; player.inv = 3; } });
}

// ---------- gastroenterologists: they stopped smelling it in 2018 ----------
TALKS.n = [
  { id: "riechen", go: T("„Kollege! Riechen Sie das auch? Ich riech nix mehr. Seit 2018.“", [
    { q: "„Ist es schlimm?“", options: [
      opt("„Es riecht nach Frühling.“", () => free("„Wirklich? Dann lass ich das Fenster zu.“ Sie strahlt und geht zufrieden weiter.")),
      opt("„Es riecht wie ein Darm, der Überstunden macht.“", () => say("„Ah, also wie immer.“ Sie notiert: ‚Geruch: unverändert‘. Und dich als Zeugen.", pen({ tasks: ["Geruchsprotokoll gegenzeichnen"] }))),
      bluff("Nur nicken und durch den Mund atmen", .6, "Sie nickt zurück. Ein stilles Einverständnis unter Leidenden.", "Du musst husten. Sie fühlt sich bestätigt und erzählt dir von ihrer letzten Koloskopie. Ausführlich.", { energy: 12 })] }]) },
  { id: "bristol", go: e => runChain(e, "„Schnelle Frage für die Lehre: Bristol-Stuhlformen-Skala!“", [
    quizStep("„Typ 4 ist…?“", ["„…wie eine Wurst, glatt und weich.“", "„…ein Kleinwagen von Opel.“", "„…die Antwort auf alles.“"], 0, "„Lehrbuch! Sie dürfen Bilder malen!“ Sie schenkt dir einen Kugelschreiber mit Darmzotten-Logo.", "„Nein, das wäre Typ 7. Vom Auto.“", { mins: 8 }),
    quizStep("„Und wie viele Typen hat die Skala?“", ["Fünf", "Sieben", "Kommt auf das Mittagessen an"], 1, "„Sieben! Wie die Zwerge. Nur brauner.“", "„Falsch. Das tut mir richtig weh. Im Bauch.“", { energy: 10 })]) },
  { id: "kantine", go: T("„Haben Sie schon gegessen? Kantine hat heute Linsen-Bohnen-Kohl-Eintopf. Für uns gibt's Rabatt.“", [
    { q: "„Kommen Sie mit? Ich lade ein!“", options: yesNo(() => say("Du isst. Es schmeckt. In 40 Minuten wirst du verstehen, warum es hier so riecht.", pen({ mins: 15 }).concat(gain({ energy: 25 }))), () => free("„Schade. Mehr für mich.“ Er reibt sich den Bauch. Bedrohlich.")) }]) },
  { id: "endo", go: T("„Ah, ein Freiwilliger! Wir brauchen jemanden, der beim Endoskop-Kurs die Rolle des Patienten spielt.“", [
    { q: "„Nur kurz! Der Schlauch ist auch nur 1,60 m.“", options: [
      opt("„Ich hab gleich Feierabend.“", () => say("„Feierabend? Ach, wie niedlich.“ Sie lacht. Lange. Dann darfst du gehen.", pen({ energy: 6 }))),
      opt("„Ich bin allergisch gegen Schläuche.“", () => free("„Oh. Das ist selten. Darüber muss ich ein Case Report schreiben!“ Sie läuft davon, um es aufzuschreiben.")),
      itemOpt("1", "Kaffee als Bestechung geben", "„Kaffee! Das regt die Peristaltik an!“ Sie trinkt und verschwindet zügig Richtung Toilette.")] }]) },
  { id: "lueftung", go: T("„Sie wollen doch nicht etwa die LÜFTUNG anmachen?!“", [
    { q: "„Die Verwaltung sagt, frische Luft kostet 4.000 € im Jahr!“", options: [
      opt("„Ich wollte nur zum Treppenhaus.“", () => free("„Ach so. Na dann. Halten Sie die Luft an. Zwischen Zimmer 3 und 4 riecht es… lehrreich.“")),
      bluff("„Die Lüftung ist ab heute Kassenleistung.“", .55, "„Wirklich? Dann machen Sie! Ich schreib's ins QM-Handbuch.“", "„Das hätte ich gelesen. Ich lese alles. Auf dem Klo hat man Zeit.“"),
      opt("„Atmen ist ärztlich angeordnet.“", () => say("„Dann brauch ich das schriftlich.“ Sie gibt dir ein Formular. Es riecht.", pen({ tasks: ["Atemerlaubnis ausfüllen (Formular riecht)"] })))] }]) },
];
