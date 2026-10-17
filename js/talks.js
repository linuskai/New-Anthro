/* Hospital Escape 3D · conversation pools, part 1: helpers, patients, relatives, nurses, pseudo-emergencies.
   Every person gets one conversation. Within a run no conversation repeats until a pool is used up. */
const say = (text, stamps, score) => ({ text, stamps: stamps || [], score: score || 0 });
const free = (text, extra) => say(text, [good("Befreit")].concat(extra || []), 1);
const opt = (label, act, hint, disabled) => ({ label, act, hint, disabled });
const bluff = (label, p, okText, failText, failPen) => opt(label, () => chance(p) ? free(okText) : say(failText, pen(failPen || { nerves: 1 }), -1), Math.round(p * 100) + " %");
const quizStep = (q, answers, right, okText, badText, badPen) => ({ q, options: answers.map((a, i) => opt(a, () => i === right ? say(okText, gain({ nerves: 1, text: "Richtig" }), 1) : say(badText, pen(badPen || { mins: 10 }), -1))) });
const itemOpt = (k, label, text, extra) => opt(label, () => { takeItem(k); return free(text, extra ? extra() : []); }, () => hasItem(k) ? ITEMS[k].emoji + " abgeben" : "braucht " + ITEMS[k].emoji, () => !hasItem(k));
const T = (intro, steps, finish) => e => runChain(e, intro, steps, finish);

const TALKS = {
  P: [
    { id: "wette", go: e => { const Q = pick(PAT_QUIZ); runChain(e, "„Herr Doktor! Mein Bettnachbar und ich haben gewettet. Um seinen Pudding.“", [{ q: Q.q, options: Q.o.map((label, j) => opt(label, () => j === Q.a ? say(Q.right, gain({ nerves: 1, text: "Pudding-Bonus" }), 1) : say(Q.wrong, pen({ mins: 12 }), -1))).concat([opt("„Fragen Sie Ihren Hausarzt.“", () => say("„Der hat doch Urlaub!“ Er ist beleidigt. Aber er lässt dich gehen.", pen({ energy: 8 })))]) }]); } },
    { id: "heim", go: T("", [
      { q: "„Doc! Darf ich heute noch heim?“", options: yesNo(() => say("„Super! Dann brauch ich nur den Entlassbrief. Und ein Taxi. Und meine Zähne, die liegen in der Cafeteria.“", pen({ tasks: ["Entlassbrief (Zähne in der Cafeteria!)"] })), () => say("„Dann will ich wenigstens was Ordentliches zu essen.“")) },
      { q: "„Können Sie mir noch ein Schnitzel besorgen? Mit Pommes?“", options: yesNo(() => say("Er strahlt. Du hast keine Ahnung, wo du um 17 Uhr ein Schnitzel herbekommst. Die Küche wurde 2020 ausgelagert. Nach Polen.", pen({ tasks: ["Schnitzel organisieren"], mins: 5 })), () => say("„Dann erzähl ich Ihnen von meinem Zeh.“ Er erzählt. Lange. Dann darfst du gehen.", pen({ energy: 10 }))) }]) },
    { id: "google", go: T("", [{ q: "„Ich hab gegoogelt. Ich hab entweder Schnupfen oder die Pest. Was meinen Sie?“", options: [
      opt("„Schnupfen.“", () => free("„Langweilig.“ Er ist sichtlich enttäuscht und schlurft davon.")),
      opt("„Die Pest.“", () => say("Er ist begeistert. Er postet es sofort auf Facebook. Das Gesundheitsamt ruft gleich an.", pen({ tasks: ["Gesundheitsamt beruhigen (es ist Schnupfen)"] }))),
      bluff("„Hören Sie auf zu googeln.“", .5, "Er legt das Handy weg. Zum ersten Mal seit 2011. Er weint ein bisschen.", "Er googelt „arroganter Arzt Station 5B“. Zwei Treffer. Beide du.")] }]) },
    { id: "privat", go: T("„Ich bin PRIVAT versichert!“", [
      { q: "„Warum hat mein Zimmer keinen Meerblick?“", options: [
        opt("Auf den Wasserfleck an der Decke zeigen: „Das ist ein Kunstwerk. ‚Meer, abstrakt‘.“", () => say("Er betrachtet den Fleck lange. „Ich sehe es. Die Wellen.“ Er ist gerührt.", [], 1)),
        opt("„Die Aussicht ist im Basistarif.“", () => say("„BASIS?!“ Er schreibt an die Privatstation. Die ist abgeschlossen.", pen({ tasks: ["Beschwerde Privatpatient (Meerblick)"] }), -1)),
        bluff("„Ich hole sofort den Chefarzt.“", .6, "Der Chefarzt kommt natürlich nie. Er wartet zufrieden.", "Der Chefarzt kommt tatsächlich. Er sieht dich. Er hat eine Idee. Samstag.", { duties: 1 })] },
      { q: "„Und das Essen! Ich wollte Hummer.“", options: [
        opt("„Heute gibt es Hummersuppe.“ (Es ist Tomatensuppe.)", () => say("„Köstlich!“ Er hat noch nie Hummer gegessen. Er merkt nichts.", [], 1)),
        opt("„Hummer ist ein Kostenfaktor.“", () => say("„ICH bin ein Kostenfaktor!“ Stolz. Und richtig.", [])),
        opt("„Ich bin Ärztin oder Arzt, kein Kellner.“", () => say("„Dann bringen Sie mir wenigstens die Karte.“", pen({ energy: 6 })))] }],
      s => s >= 2 ? { text: "Er drückt dir 5 Euro in die Hand. „Für die Kaffeekasse.“ Die ist seit 2017 leer. Jetzt nicht mehr.", stamps: gain({ nerves: 1 }) } : null) },
    { id: "wlan", go: T("", [{ q: "„Doktor, wie ist das WLAN-Passwort? Ich muss meine Bewertungen schreiben.“", options: [
      opt("„Station5B_2003“", () => say("Er ist online. Er schreibt sofort eine Bewertung. Über dich. „Hat mir das WLAN gegeben. 5 Sterne. Sonst nichts gemacht.“", pen({ nerves: 1 }))),
      opt("„Es gibt kein WLAN.“", () => free("Er starrt dich an. Dann öffnet er ein Buch. Zum ersten Mal seit Jahren. Er sieht glücklich aus.", gain({ nerves: 1 }))),
      opt("„Bewegung ist das neue WLAN.“", () => say("Er steht auf und geht spazieren. Mit Infusionsständer. Direkt hinter dir her. Drei Runden.", pen({ energy: 12 })))] }]) },
    { id: "schnarch", go: T("„Mein Bettnachbar schnarcht wie ein Laubbläser. Seit drei Nächten.“", [
      { q: "„Können Sie ihn verlegen?“", options: yesNo(() => say("Er ist erleichtert. Du hast kein freies Bett. Niemand hat ein freies Bett.", pen({ tasks: ["Bettentausch Zi. 12 (es gibt keine Betten)"] })), () => say("„Dann verlege MICH. In den Flur. Mir egal.“")) },
      { q: "„Oder geben Sie mir was zum Schlafen?“", options: [
        opt("Ohrstöpsel aus Verbandswatte drehen", () => say("Du drehst zwei Ohrstöpsel. Handwerk. Er ist tief beeindruckt.", gain({ nerves: 1 }), 1)),
        opt("„Ich ordne Ihnen was an.“", () => say("„Danke!“ Jetzt musst du es auch anordnen. Im KIS. Das hängt.", pen({ tasks: ["Schlafmittel anordnen"] }))),
        opt("„Ich schnarche auch. Man gewöhnt sich dran.“", () => say("Er lacht. Dann denkt er an deine Frau oder deinen Mann. Er schweigt mitfühlend.", [], 1))] }]) },
    { id: "visite", go: T("", [{ q: "„Wann ist eigentlich Visite? Ich warte seit heute früh.“", options: [
      opt("„Ich bin die Visite. Hiermit beendet.“", () => free("„Oh. Das ging schnell.“ Er ist zufrieden. Er hat auf YouTube gesehen, dass das normal ist.")),
      opt("„Morgen um sieben.“", () => say("„Dann bleib ich wach. Und warte.“ Er wird um sieben schlafen.", [])),
      opt("„Die Visite wurde eingespart.“", () => free("Er nickt verständnisvoll. „Ich hab Klinik-Aktien.“ Er ist sogar ein bisschen stolz."))] }]) },
    { id: "hausarzt", go: T("„Mein Hausarzt sagt was ganz anderes!“", [
      { q: "„Er sagt, gegen die Lungenentzündung helfen Globuli.“", options: [
        opt("„Globuli sind Zucker.“", () => say("„Zucker ist doch auch Medizin. Für die Seele.“ Schwer zu widerlegen.", [], 0)),
        opt("„Nehmen Sie beides. Das Antibiotikum zuerst.“", () => say("Er überlegt. „Okay. Aber die Globuli sind die Hauptsache.“ Kompromiss. Medizin heute.", gain({ nerves: 1 }), 1)),
        opt("„Dann rufen wir ihn an.“", () => say("Er ruft an. Lautsprecher. Der Hausarzt ist Heilpraktiker. Und sein Schwager. Ihr redet 20 Minuten.", pen({ mins: 20 }), -1))] }]) },
    { id: "gift", go: T("", [{ q: "„Ich glaube, die Schwester will mich vergiften. Das Essen schmeckt so komisch.“", options: [
      opt("„Das ist Krankenhausessen. Das schmeckt immer so.“", () => free("„Ach so.“ Er isst beruhigt weiter. Es schmeckt immer noch nach Pappe.")),
      opt("„Ich probiere mal.“", () => say("Du probierst. Pappe mit Soße. Und etwas, das man Reis nennen könnte. Du verstehst ihn jetzt.", pen({ energy: 10 }))),
      opt("„Wir machen ein Drogenscreening.“", () => say("„Ein Screening! Wie im Fernsehen!“ Er ist begeistert. Du musst es jetzt machen.", pen({ tasks: ["Drogenscreening Hr. Brösel (Verdacht: Kartoffelpüree)"] })))] }]) },
  ],

  F: [
    { id: "kowalski", go: T("„Endlich! Wir sind die Familie Kowalski. Alle sieben. Nur drei kurze Fragen.“", [
      { q: "„Wird er wieder gesund?“", options: [
        opt("„Ja!“", () => say("Jubel. „Sie haben es versprochen! Dirk hat's gefilmt.“", pen({ tasks: ["Versprechen einhalten (gefilmt)"] }), 1)),
        opt("„Nein.“", () => say("Oma fängt an zu weinen. Dirk filmt das auch.", pen({ nerves: 1 }), -1)),
        opt("„Das bespricht morgen der Stationsarzt.“", () => say("„Sie SIND der Stationsarzt.“ Stille. Sie schreiben etwas auf.", [], 0))] },
      { q: "„Darf er Omas Sahnetorte essen? Drei Stück?“", options: [
        opt("„Ja.“", () => say("Oma strahlt. Sein Blutzucker wird morgen auch strahlen.", pen({ tasks: ["Blutzucker Hr. Kowalski (Sahnetorte!)"] }), 1)),
        opt("„Nein.“", () => say("„Sie haben unsere Torte beleidigt.“", [], -1)),
        opt("„Ein halbes Stück.“", () => say("Diplomatisch. Oma schneidet ein sehr großes halbes Stück.", [], 1))] },
      { q: "„Können Sie alles nochmal von vorne erklären? Cousin Dirk ist gerade erst gekommen.“", options: [
        opt("„Ja, natürlich.“", () => say("Du erklärst alles. Nochmal. Dirk nickt. Dirk hat nichts verstanden. Dirk ist Heilpraktiker.", pen({ mins: 20 }), 2)),
        opt("„Nein.“", () => say("„Dann schreiben wir an die Geschäftsführung!“", [], -1)),
        opt("„Dirk kann im Internet nachlesen.“", () => say("Dirk öffnet Google. Du hast etwa drei Minuten.", [good("Zeit gewonnen")], 0))] }],
      s => s >= 2 ? { text: "Die Familie ist begeistert. Oma drückt dir Pralinen in die Hand. Alle sieben winken.", stamps: gain({ nerves: 1, energy: 20 }) } : s <= -1 ? { text: "Sie gehen direkt zur Geschäftsführung. Du bekommst Post.", stamps: pen({ tasks: ["Beschwerde Fam. Kowalski beantworten"], nerves: 1 }) } : { text: "Die Familie zieht weiter. Murmelnd. „…früher war das anders…“", stamps: [] }) },
    { id: "muenchen", go: T("„Ich bin extra aus München gekommen. ICE, 1. Klasse, Verspätung. Ich will JETZT alles wissen.“", [
      { q: "„Wie sind die Laborwerte?“", options: [
        bluff("„Alles im Normbereich.“", .5, "Sie atmet auf. Du hast geraten. Diesmal hattest du recht.", "„Dann erklären Sie mir bitte, warum das Kalium rot markiert ist.“ Sie hat das Handy des Vaters.", { mins: 10 }),
        opt("„Datenschutz. Haben Sie eine Vollmacht?“", () => say("Sie zieht eine Vollmacht aus der Handtasche. Laminiert. Mit Register.", pen({ mins: 8 }), 0)),
        opt("„Fragen wir Ihren Vater selbst.“", () => say("Der Vater: „Mir geht's gut, sie soll heimfahren.“ Sie bleibt. Aber jetzt ist sie sauer auf ihn, nicht auf dich.", [], 1))] },
      { q: "„Und warum liegt er auf dem FLUR?“", options: [
        opt("„Das ist unser Wellness-Korridor. Mit Tageslicht.“", () => say("Sie schaut zum Fenster. Es regnet. Aber es ist Licht.", [], 1)),
        opt("„Wir haben 0 freie Betten.“", () => say("„Dann schaffen Sie welche!“ Sie meint es ernst. Du schreibst es auf.", pen({ tasks: ["Betten schaffen (Auftrag aus München)"] }), -1)),
        opt("„Er wollte unbedingt Gesellschaft.“", () => say("Der Vater nickt heftig. Er liebt den Flur. Der Flur ist sein Leben.", [], 1))] }],
      s => s >= 2 ? { text: "Sie bucht ihren Rückfahrt-ICE. „Sie sind die erste Person hier, die mir etwas erklärt hat.“ Du hast nichts erklärt.", stamps: gain({ nerves: 1 }) } : { text: "Sie ruft ihren Anwalt an. Er ist auch aus München.", stamps: pen({ tasks: ["Rückruf Anwalt aus München"] }) }) },
    { id: "schwester", go: T("„Ich bin selbst Krankenschwester. Seit 1987. In Rente. Ich sehe ALLES.“", [{ q: "„Der Tropf läuft zu langsam. Und das Bett ist falsch bezogen.“", options: [
      opt("„Dann wissen Sie ja, wie das ist.“", () => free("Sie seufzt. „Oh ja. Früher waren wir zu viert. Heute bist du allein, oder?“ Sie tätschelt dir die Schulter.", gain({ nerves: 1 }))),
      opt("„Dann können Sie ja Nachtdienst machen.“", () => say("Sie denkt ernsthaft nach. „Nur gegen Bezahlung. Bar.“ Die Klinik hat kein Bargeld.", [], 0)),
      opt("„Wissen Sie zufällig, wo es hier Kaffee gibt?“", () => { addItem("1"); return free("Sie zieht eine Thermoskanne aus der Handtasche. Natürlich. Erfahrung.", [good("☕ eingepackt")]); })] }]) },
    { id: "erbe", go: T("„Rein hypothetisch, Herr Doktor. Wie lange hat Opa noch? Wegen dem Haus.“", [{ q: "Opa liegt im Bett daneben. Er hört alles.", options: [
      opt("„Das kann man so nicht sagen.“", () => say("„Ungefähr?“ – „Nein.“ – „Ein Jahr?“ – „Nein.“ Das geht 10 Minuten so.", pen({ mins: 10 }))),
      opt("„Er wird hundert.“", () => free("Gesichter fallen. Opa grinst zahnlos. Du hast einen Freund fürs Leben.", gain({ nerves: 1, energy: 10 }))),
      opt("„Fragen Sie ihn selbst.“", () => free("Opa: „Länger als ihr alle!“ Die Familie geht beleidigt Kaffee trinken."))] }]) },
    { id: "chef", go: T("„Wir wollen den CHEFARZT sprechen. Sofort.“", [{ q: "Sie verschränken die Arme. Alle drei.", options: [
      opt("„Ich hole ihn.“", () => say("Sie warten. Du gehst. Du suchst ihn nicht. Aber jetzt musst du so tun.", pen({ tasks: ["Chefarzt finden (unmöglich)"] }))),
      bluff("„Ich BIN der Chefarzt.“", .35, "Sie glauben es. Sie verbeugen sich. Jemand fragt nach einem Autogramm.", "Der echte Chefarzt steht hinter dir. Er findet das gar nicht lustig. Er findet einen Dienst.", { duties: 1 }),
      opt("„Der ist beim Golf.“", () => say("Ehrlich und korrekt. Sie schreiben eine Beschwerde. Über das Golf.", pen({ tasks: ["Beschwerde „Golf“ weiterleiten"] })))] }]) },
    { id: "parken", go: T("„Wo kann man hier parken? Wir stehen in der Feuerwehrzufahrt.“", [{ q: "„Nur kurz natürlich.“", options: [
      opt("„Parkhaus P2. 12 € pro Stunde.“", () => free("„ZWÖLF EURO?!“ Sie stürmen los, um mit dem Automaten zu diskutieren. Viel Glück, Automat.")),
      opt("„Bleiben Sie stehen, ist ja nur kurz.“", () => say("Zehn Minuten später kommt die Feuerwehr. Mit Blaulicht. Und Fragen. An dich.", pen({ tasks: ["Feuerwehr-Gespräch (Zufahrt)"] }))),
      opt("„Bei der Notaufnahme ist Kurzzeitparken.“", () => free("Sie fahren hin. Dort warten sie jetzt. 9 Stunden. Mit Auto."))] }]) },
    { id: "blumen", go: T("„Wir haben Blumen mitgebracht! Wo ist eine Vase?“", [{ q: "Ein Strauß, größer als der Patient.", options: [
      opt("„Blumen sind auf Station verboten. Keime.“", () => say("„KEIME?!“ Sie halten den Strauß jetzt wie eine Bombe. Sie gehen.", [], 0)),
      opt("Eine leere Urinflasche reichen", () => free("Sie stellen die Blumen hinein. Es sieht erstaunlich gut aus. Sie schenken dir eine Rose.", gain({ nerves: 1 }))),
      opt("„Die Vasen wurden eingespart.“", () => say("Sie spenden eine Vase. Und schreiben einen Leserbrief. Über Vasen.", pen({ energy: 6 })))] }]) },
    { id: "dirk", go: T("„Ich bin Dirk. Heilpraktiker. Haben Sie schon an Schüßler-Salze gedacht?“", [
      { q: "„Bei Herzinfarkt nehme ich immer Nummer 7.“", options: [
        opt("„Und ich nehme immer ein Herzkatheterlabor.“", () => say("Dirk ist verwirrt. Er hat davon gehört. Auf einem Kongress. Er war beim Buffet.", [], 1)),
        opt("„Spannend. Erzählen Sie mehr.“", () => say("Er erzählt mehr. Viel mehr. Er hat Flyer.", pen({ mins: 15 }), -1)),
        opt("Ein Klemmbrett zücken und schnell weggehen", () => say("Der Klemmbrett-Trick. Dirk respektiert Bürokratie.", [], 1))] }]) },
  ],

  N: [
    { id: "abzeichnen", go: T("", [
      { q: "„Kannst du noch kurz abzeichnen? Nur 14 Patienten.“", options: yesNo(() => say("Du zeichnest 14 Kurven ab. Deine Unterschrift sieht danach aus wie ein EKG.", pen({ mins: 12 }), 1), () => say("„Ah. So einer bist du.“", [], -1)) },
      { q: "„Und Zimmer 7 braucht 'ne Braunüle. Die Venen sind… sportlich.“", options: yesNo(() => chance(.6) ? say("Erster Versuch! Die Pflege applaudiert. Der Patient auch.", gain({ nerves: 1 }).concat(pen({ mins: 8 })), 1) : say("Dritter Versuch. Der Patient schreibt eine Google-Bewertung. Live.", pen({ nerves: 1, mins: 15 })),
        () => say("„Dann sag ich's dem Nachtdienst. Der sagt's dem OA. Der sagt's dir. Morgen früh.“", pen({ tasks: ["Braunüle Zi. 7 (sportliche Venen)"] }), -1)) }],
      s => s >= 1 ? (addItem("1"), { text: "Sie schenkt dir ihren geheimen Notfall-Kaffee. Aus der Schublade mit dem Schloss.", stamps: [good("☕ eingepackt")] }) : null) },
    { id: "tausch", go: T("„Tauschst du Samstag Spätdienst gegen Sonntag Frühdienst? Ist dasselbe, nur früher.“", [{ q: "Sie hält dir den Dienstplan hin. Er ist voller Tipp-Ex.", options: [
      opt("„Klar.“", () => say("„Du bist ein Schatz.“ Du hast gerade dein Wochenende getauscht. Gegen dein Wochenende.", pen({ duties: 1, dutyCode: "WE" }))),
      opt("„Nein.“", () => say("„Dann sag ich's der Stationsleitung.“ Die Stationsleitung ist ihre Schwester.", pen({ nerves: 1 }))),
      itemOpt("1", "„Ich tausch gegen Kaffee.“", "Sie riecht am Becher. „Deal.“ Der Dienstplan bleibt, wie er ist. Ein Wunder.", () => gain({ nerves: 1 }))] }]) },
    { id: "kuehlschrank", go: T("„WER hat das Insulin neben meinen Joghurt gestellt?!“", [{ q: "Sie hält den Joghurt hoch wie ein Beweisstück.", options: [
      opt("„Dr. Kurz.“", () => free("„Natürlich.“ Sie rauscht ab, um Dr. Kurz zu finden. Sorry, Dr. Kurz.")),
      opt("„Ich war's.“", () => say("Ehrlich. Sie respektiert das. Du bekommst trotzdem eine Schulung.", pen({ tasks: ["Hygieneschulung „Kühlschrank“"] }))),
      opt("„Welcher Joghurt?“", () => say("Sie mustert dich. Du hast Joghurt am Mundwinkel.", pen({ nerves: 1 })))] }]) },
    { id: "zugang", go: T("„Kurze Frage, Doktor.“", [quizStep("„Für eine Blutkonserve: welche Braunüle nimmst du?“", ["Grün oder grau (18 G oder größer)", "Rosa 20 G passt schon", "Gelb 24 G, die tut nicht weh"], 0, "Sie nickt. „Gut. Du darfst gehen.“ Das ist das größte Lob auf dieser Station.", "Sie seufzt und nimmt dir die Braunüle aus der Hand. Du darfst zuschauen.", { mins: 10 })]) },
    { id: "pause", go: T("", [{ q: "„Ich hatte heute noch keine Pause. Du?“", options: [
      opt("„Ich auch nicht.“", () => free("Ihr teilt euch schweigend einen Keks. Es ist der schönste Moment des Tages.", gain({ nerves: 1, energy: 15 }))),
      opt("„Pause? Was ist das?“", () => free("Sie lacht so laut, dass Zi. 3 aufwacht. Ihr rennt beide weg.", gain({ energy: 5 }))),
      opt("„Ich hatte zwei.“", () => say("Sie notiert sich das. Für den Dienstplan. Mit Rotstift.", pen({ duties: 1 })))] }]) },
    { id: "telefon", go: T("„Telefon für dich! Die Tochter von Zi. 4. Zum fünften Mal.“", [{ q: "Sie hält dir den Hörer entgegen.", options: [
      bluff("„Ich bin schon weg.“", .5, "Sie legt den Hörer auf den Tisch. Die Tochter redet weiter. Ohne dich. Sie merkt es nicht.", "Sie hält dir den Hörer einfach ans Ohr. Die Tochter hat 14 Fragen.", { mins: 15 }),
      opt("„Ich ruf morgen zurück.“", () => say("„Das hast du gestern auch gesagt.“", pen({ tasks: ["Rückruf Tochter Zi. 4 (6. Versuch)"] }))),
      opt("„Sag ihr, alles ist gut.“", () => say("Sie sagt es. Die Tochter glaubt es nicht. Sie ruft gleich nochmal an.", pen({ tasks: ["Rückruf Tochter Zi. 4"] })))] }]) },
    { id: "bz", go: T("„Blutzucker Zi. 3: 487.“", [quizStep("„Was soll ich geben?“", ["Insulin nach Schema, und Kontrolle in einer Stunde", "Einen Apfel", "Mehr Zucker, damit er sich dran gewöhnt"], 0, "Sie nickt. „Hab ich schon gegeben. Wollte nur sehen, ob du's weißt.“", "Sie schaut dich lange an. Dann gibt sie Insulin. Und schreibt dir eine Fortbildung auf.", { tasks: ["Fortbildung Diabetes (Pflicht)"] })]) },
  ],

  Z: [
    { id: "notfall", go: e => runChain(e, "„" + pick(["Ich hab seit drei Wochen Schnupfen.", "Mein Hausarzt hat Urlaub. Seit zwei Stunden.", "Mir ist seit gestern komisch. Und vorgestern auch."]) + "“", [{ q: "„Ist das ein Notfall?“", options: [
      opt("„Ja.“", () => say("Du schreibst einen Arztbrief über Schnupfen. Drei Seiten. Mit Anamnese.", pen({ mins: 15, tasks: ["Arztbrief „Schnupfen“"] }))),
      opt("„Nein.“", () => say("Er schreibt eine 1-Stern-Bewertung. Dann setzt er sich auf den Boden.", [good("Triagiert")])),
      opt("„Triage Grün. Wartezeit: 7 Stunden.“", () => say("„Okay.“ Er setzt sich. Er hat Zeit. Viel Zeit.", [good("Triagiert")]))] }]) },
    { id: "au", go: T("„Ich brauch nur 'ne Krankschreibung. Für morgen. Und übermorgen. Und Freitag.“", [{ q: "„Diagnose ist egal. Hauptsache Freitag.“", options: [
      opt("„Dafür ist die Notaufnahme nicht da.“", () => say("Er setzt sich wieder. Er hat ein Zelt dabei.", [good("Triagiert")])),
      opt("„Hier, drei Wochen.“", () => say("Er jubelt. Du schreibst. Diagnose: Montag.", pen({ tasks: ["AU-Bescheinigung (Diagnose: Montag)"] }))),
      opt("„DocFlix macht das per Video.“", () => say("Er lädt die App. Er ist glücklich. Ein Startup verdient Geld. Alle gewinnen.", [good("Triagiert")].concat(run.offers.has("tele") ? [good("Werbung für den künftigen Job")] : [])))] }]) },
    { id: "zecke", go: T("„ZECKENBISS! 2019! Muss ich jetzt sterben?“", [quizStep("„Wurde damals was gemacht?“ Er zeigt eine Stelle. Sie ist unauffällig.", ["„Ohne Symptome seit 2019: Kein Notfall.“", "„Sofort Antibiotika, sechs Wochen!“", "„Wir amputieren.“"], 0, "„Puh!“ Er ist so erleichtert, dass er heimgeht. Ein Wunder in der Notaufnahme.", "Er wird kreidebleich und setzt sich in die erste Reihe. Für immer.", { mins: 12 })]) },
    { id: "wartezeit", go: T("", [{ q: "„Wie lange dauert's noch?“", options: [
      opt("„Neun Stunden.“", () => say("Er bestellt eine Pizza. Lieferadresse: Notaufnahme, Stuhl 14.", [good("Triagiert")])),
      opt("„Sie sind als Nächstes dran.“", () => say("Er glaubt dir. Er wird es noch acht Stunden glauben. Dann nicht mehr.", [good("Triagiert")].concat(pen({ nerves: 1 })))),
      opt("„In der Cafeteria geht's schneller.“", () => say("Er geht in die Cafeteria. Dort gibt es keine Ärzte. Aber Kuchen. Er ist zufrieden.", [good("Triagiert")]))] }]) },
    { id: "puls", go: T("„Ich hab bestimmt was Schlimmes. Fühlen Sie mal meinen Puls!“", [quizStep("Puls: 72, regelmäßig, kräftig. Er schaut dich ängstlich an.", ["„Völlig normal.“", "„Oh nein.“", "„Interessant… sehr interessant…“"], 0, "„Normal? NORMAL?“ Er ist fast enttäuscht. Aber er geht heim.", "Er fällt dramatisch in Ohnmacht. Auf dich. Es dauert, bis er wieder aufwacht.", { mins: 15, energy: 10 })]) },
    { id: "foto", go: T("„Können Sie mal schauen? Ich hab das Foto vom Ausschlag von letzter Woche.“", [{ q: "Er zeigt dir sein Handy. Auf dem Foto ist eine Pizza.", options: [
      opt("„Das ist eine Pizza.“", () => say("„Oh. Falsches Foto.“ Er scrollt. 400 Pizzafotos. Du gehst.", [good("Triagiert")])),
      opt("„Sieht lecker aus.“", () => free("„Oder?“ Ihr seid jetzt Freunde. Er gibt dir den Pizza-Gutschein.", gain({ energy: 10 }))),
      opt("„Ich überweise Sie zur Dermatologie.“", () => say("„Die haben doch zu!“ – „Eben.“ Er versteht es nicht. Du schon.", [good("Triagiert")]))] }]) },
    { id: "nasenspray", go: T("„Nur kurz Nasenspray. Ich nehm's seit 2011. Mehrmals täglich.“", [quizStep("„Ist doch harmlos, oder?“", ["„Das ist eine Rhinitis medicamentosa. Wir reduzieren.“", "„Hier, nehmen Sie zwei.“", "„Probieren Sie Ohrentropfen.“"], 0, "„Rhinitis medi-was?“ Er ist so beeindruckt vom Wort, dass er es sich tätowieren lassen will.", "Er geht glücklich. Mit zwei Flaschen. Du hast gerade ein Problem verdoppelt.", { tasks: ["Nasenspray-Entzug planen (2011!)"] })]) },
  ],
};
