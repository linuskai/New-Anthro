/* Hospital Escape 3D · v10 conversations: more absurd, more choices. */
const bye = (text, extra) => Object.assign(free(text, extra), { stop: true });

TALKS.P.push(
  { id: "tiktok", go: T("„Doc! Kurze Frage für meinen TikTok-Kanal: ‚Krankenhaus-Geheimnisse‘.“", [
    { q: "„Stimmt es, dass Ärzte nachts heimlich die Betten tauschen, damit die Statistik besser aussieht?“", options: [
      opt("„Ja. Und die Patienten auch.“", () => bye("Er filmt sich entsetzt. 2 Millionen Aufrufe. Du bist jetzt „der Bettentausch-Doc“. Aber frei.")),
      opt("„Nein. Wir tauschen nur die Kaffeemaschinen. Gegen gar nichts.“", () => say("Er nickt. „Glaubwürdig.“ Er postet es trotzdem.", [], 1)),
      bluff("In die Kamera: „Hallo Mama!“", .7, "Er ist so verwirrt, dass er das Video löscht und dich gehen lässt.", "„Super, Doc, nochmal mit mehr Energie!“ Ihr dreht es elfmal.")] }]) },
  { id: "knopf", go: T("„Herr Doktor, wofür ist der rote Knopf an meinem Bett?“", [
    { q: "Er hat ihn schon 47 Mal gedrückt. Die Klingel im Stationszimmer hat aufgegeben.", options: [
      opt("„Das ist der Knopf für Pizza.“", () => say("Er drückt nochmal. Es kommt keine Pizza. Er ist trotzdem glücklich, weil er Hoffnung hat.", [], 1)),
      opt("„Der ruft den Chefarzt.“", () => bye("Er lässt den Knopf sofort los und legt beide Hände auf die Decke. Für immer.")),
      opt("Den Knopf abschrauben", () => say("Er weint. Du schraubst ihn wieder an. Er drückt 48.", pen({ mins: 4 })))] }]) },
  { id: "zwillinge", go: T("„Herr Doktor, mein Zwillingsbruder liegt in Zimmer 9. Er hat das Gleiche wie ich.“", [
    { q: "„Können Sie mich einfach mit ihm zusammen entlassen? Sparen Sie Papier.“", options: yesNo(() => bye("Du schreibst einen Entlassbrief für beide. Das Controlling nennt das „Synergie“. Du nennst es Feierabend."), () => say("„Dann bleibe ich auch, bis er gehen darf.“ Er bleibt bis 2027.", pen({ tasks: ["Zwillinge entlassen (gleichzeitig)"] }))) }]) },
);

TALKS.F.push(
  { id: "excel", go: T("Die Tochter aus München hat eine Excel-Tabelle mit Papas Blutdruckwerten seit 1998 dabei.", [
    { q: "„Sehen Sie den Ausreißer am 4. März 2003? Das war eine Hochzeit. Ist das relevant?“", options: [
      opt("„Hochrelevant. Wessen Hochzeit?“", () => say("Ihre. Sie erzählt dir alles. Die Torte war zu trocken.", pen({ mins: 9 }))),
      opt("„Diagramm sieht top aus. Bitte als Poster drucken.“", () => bye("Sie strahlt. Sie geht sofort zum Copyshop. Mit dem Diagramm. Ohne dich.")),
      opt("Die Spalte „Gefühl“ löschen", () => say("„DAS WAR DIE WICHTIGSTE SPALTE!“ Die Familie ist schockiert.", pen({ nerves: 1 })))] }]) },
  { id: "testament", go: T("Neffe Dirk flüstert: „Doc, unter uns: Wer erbt eigentlich das Pflegebett?“", [
    { q: "Er hat schon einen Anhänger dabei.", options: [
      opt("„Das Bett gehört dem Krankenhaus.“", () => say("„Dann kaufe ich es.“ Er bietet 12 €. Das Controlling überlegt ernsthaft.", [], 1)),
      opt("„Oma lebt noch. Sie ist im Zimmer. Sie hört alles.“", () => bye("Oma: „Ich vererbe dir gar nichts, Dirk.“ Dirk geht. Oma zwinkert dir zu.")),
      opt("„Fragen Sie den Chef, der verteilt hier alles.“", () => say("Er geht zum Chef. Der Chef bietet ihm eine Stelle an. In der Verwaltung.", [], 1))] }]) },
);

TALKS.N.push(
  { id: "dienstplan", go: T("„Gut, dass du da bist! Ich mach den Dienstplan.“", [
    { q: "„Welche Farbe willst du dieses Jahr? Grün heißt Frühdienst, Rot heißt Wochenende, Lila heißt… wir wissen es selbst nicht mehr.“", options: [
      opt("„Grün.“", () => say("„Ausverkauft.“ Du bekommst Lila.", pen({ duties: 1 }))),
      opt("„Unsichtbar.“", () => bye("Sie nickt. Sie streicht dich mit Tipp-Ex. Du bist frei. Für einen Monat.")),
      opt("„Was immer Gerda hat.“", () => say("Gerda hat Urlaub. Bis 2028. Du auch, auf dem Papier. Leider nur auf dem Papier.", [], 1))] }]) },
  { id: "blutzucker", go: T("„Zimmer 4 hat einen Blutzucker von 300 und isst gerade eine Torte.“", [
    { q: "„Sollen wir die Torte wegnehmen?“", options: [
      opt("„Nur die Kerzen.“", () => say("Er pustet sie aus. Er wünscht sich mehr Torte.", [], 1)),
      opt("„Wir verdünnen die Torte.“", () => bye("Sie schaut dich lange an. Dann: „Weißt du was, geh einfach heim.“")),
      opt("Selbst ein Stück essen, damit weniger übrig ist", () => say("Medizinisch fragwürdig. Kulinarisch hervorragend.", gain({ energy: 20 }), 1))] }]) },
);

TALKS.O.push(
  { id: "paper", go: T("„Kollege, wir schreiben ein Paper. Sie sind Erstautor.“", [
    { q: "„Thema: ‚Einfluss des Feierabends auf ärztliche Motivation‘. Daten haben wir keine. Wollen Sie Proband sein?“", options: [
      opt("„Ich bin Proband, wenn ich jetzt gehen darf.“", () => bye("„Perfekt, das ist die Intervention.“ Er notiert: ‚Proband geht. Motivation: steigt.‘")),
      opt("„Ich hätte gern Letztautor.“", () => say("„Das ist der Chef.“ – „Mittelautor?“ – „Das ist Dr. Kurz.“ Du bist Fußnote 47.", pen({ mins: 5 }))),
      opt("„Ich hab nie Feierabend, Ihre Daten wären leer.“", () => say("Er ist begeistert. „Nullbefund! Das ist publizierbar!“", pen({ tasks: ["Paper „Nullbefund Feierabend“ schreiben"] })))] }]) },
  { id: "golf", go: T("„Spielen Sie Golf?“", [
    { q: "„Wir brauchen einen vierten Mann für Samstag. Oder eine vierte Frau. Hauptsache Handicap unter 20 und keine Dienste. Ach so, Sie haben Dienst.“", options: [
      opt("„Ich spiele nur Minigolf.“", () => bye("Er ist erschüttert. Er geht kopfschüttelnd. Er wird es dem Chef erzählen. Aber jetzt bist du frei.")),
      opt("„Dann tausche ich den Dienst mit Ihnen.“", () => say("Er lacht. Lange. Er klopft dir auf die Schulter. Er tauscht nicht.", pen({ energy: 6 }))),
      opt("„Golf ist ein Risikofaktor für Rückenschmerzen.“", () => say("Er greift sich an den Rücken. „Woher wissen Sie…“ Er geht zur Orthopädie. Er kommt nicht wieder.", [], 1))] }]) },
);

TALKS.C.push(
  { id: "podcast", go: T("„SIE DA! Ich habe einen Podcast.“", [
    { q: "„‚Der Chef hat recht‘. Folge 112. Wollen Sie Gast sein? Thema: Warum Überstunden Freizeit sind.“", options: [
      opt("„Ich bringe das Gegenargument.“", () => say("„Es gibt kein Gegenargument.“ Er schneidet dich raus. Du bist frei, aber nicht bei Spotify.", [], 1)),
      opt("„Ich hab leider eine Stimmband-Lähmung. Seit eben.“", () => bye("Er nickt mitfühlend. „Dann schreiben Sie mir die Fragen auf.“ Er vergisst es sofort.")),
      opt("Begeistert zusagen", () => say("Aufnahme heute 22 Uhr. Im Treppenhaus. Wegen der Akustik.", pen({ duties: 1 })))] }]) },
);

TALKS.V.push(
  { id: "kugelschreiber", go: T("„Inventur! Wie viele Kugelschreiber haben Sie?“", [
    { q: "„Laut Liste wurden Ihnen 2019 drei Kugelschreiber ausgegeben. Ich sehe…“ Er zählt deine Kittel-Tasche.", options: [
      itemOpt("p", "Einen Kuli zurückgeben", "„Danke. Einer fehlt noch.“ – „Der ist leer.“ – „Leere Kulis werden zurückgegeben.“ Er lässt dich trotzdem gehen. Zufrieden."),
      opt("„Den hat Dr. Kurz.“", () => bye("Er notiert: ‚Dr. Kurz: −1 Kugelschreiber‘. Dr. Kurz' Akte ist jetzt dicker als das Telefonbuch.")),
      opt("„Kulis sind Verbrauchsmaterial.“", () => say("„Verbrauchsmaterial muss verbraucht werden. Haben Sie ihn verbraucht?“ Ein 15-minütiges Gespräch über das Wesen der Tinte.", pen({ mins: 15 })))] }]) },
);

TALKS.I.push(
  { id: "zebra", go: T("„Wenn du Hufgetrappel hörst, denk an Pferde. Ich denk immer an Zebras.“", [
    { q: "„Zimmer 12: Müdigkeit. Ich tippe auf Morbus Fabry, Akromegalie oder eine Zeitreise. Du?“", options: [
      opt("„Er war 31 Stunden wach.“", () => say("„…wie langweilig.“ Er ist tief enttäuscht von der Realität.", [], 1)),
      opt("„Zeitreise. Eindeutig.“", () => bye("Er rennt los, um ein Zeitreise-Labor anzufordern. Die Laborkosten trägt das Controlling. Mit Vergnügen.")),
      opt("„Lass uns einen Pferdetest machen.“", () => say("Er versteht den Witz nicht. Er bestellt Pferde-Serologie. Sie kommt sogar.", pen({ tasks: ["Pferde-Serologie erklären"] })))] }]) },
);

TALKS.A.push(
  { id: "befund", go: T("Ein Radiologe im Dunkeln: „Ich hab da was gefunden.“", [
    { q: "„Auf deinem Röntgen von 2015: Du hattest eine Erkältung. Willst du den Befund?“", options: [
      opt("„Elf Jahre später, gerne.“", () => say("Er gibt ihn dir. „Zufallsbefund: Lebensmut, abnehmend.“", pen({ nerves: 1 }))),
      opt("„Schick ihn per Fax.“", () => bye("Er geht zum Faxgerät. Er ist noch heute dort.")),
      opt("„Ich lass mich noch mal röntgen, zum Vergleich.“", () => say("Er strahlt. „Endlich mal jemand mit Voraufnahme!“ Strahlendosis: gering. Zeitdosis: hoch.", pen({ mins: 12 })))] }]) },
);

TALKS.Z.push(
  { id: "fingernagel", go: T("„NOTFALL! Mein Fingernagel ist eingerissen. Seit Ostern.“", [
    { q: "„Ich habe 9 Stunden gewartet. Ich will jetzt eine MRT. Vom Nagel.“", options: [
      opt("Ein Pflaster aufkleben", () => bye("„Endlich nimmt mich jemand ernst.“ Er ist geheilt. Er bewertet die Notaufnahme mit 5 Sternen.")),
      opt("„MRT ist erst wieder 2028 frei.“", () => say("Er nimmt den Termin. Er freut sich drauf.", [], 1)),
      opt("„Ich bin Dermatologe, ich mach nur Gesichter.“", () => say("Er zeigt dir sein Gesicht. Es ist eingerissen. Emotional.", pen({ energy: 8 })))] }]) },
  { id: "hausaufgaben", go: T("Ein Teenager in der Wartehalle: „Sind Sie Arzt? Ich brauche ein Attest für Mathe.“", [
    { q: "„Diagnose: Allergie gegen Bruchrechnung. Ist wissenschaftlich.“", options: [
      opt("„Attest: ‚Kann Brüche nur im Knochen.‘“", () => bye("Er feiert dich wie einen Rockstar. Er wird später Arzt. Leider Orthopäde.")),
      opt("„Was ist 3/4 von 12?“", () => say("„…neun?“ – „Geheilt.“ Er ist entsetzt und geheilt.", [], 1)),
      opt("„Frag deine Eltern.“", () => say("Sie sitzen neben ihm. Sie wollen auch ein Attest. Für ihren Chef.", pen({ tasks: ["Drei Atteste (Familie Müller)"] })))] }]) },
);

TALKS.R.push(
  { id: "rea", go: T("„Darf ich dich was fragen? Wie fühlt sich eine Reanimation an?“", [
    { q: "„Ist das wie Pilates, nur mit Panik?“", options: [
      opt("„Ja. Und du darfst nicht aufhören, wenn's brennt.“", () => say("Sie ist schockiert und tief beeindruckt. Sie gibt dir eine Gesichtsmaske. Mit Gold.", gain({ energy: 15 }), 1)),
      opt("„Wie Botox, nur in die andere Richtung.“", () => bye("Sie braucht einen Moment. Dann flüstert sie: „Das muss ich meinen Kundinnen erzählen.“ Sie eilt davon.")),
      opt("„Probier's an der Puppe.“", () => say("Sie macht 30 Kompressionen. Perfekt im Takt. Sie hätte Notärztin werden sollen. Ihr beide wisst es.", pen({ mins: 6 })))] }]) },
);

TALKS.n.push(
  { id: "kapsel", go: T("„Neueste Technik! Eine Kamera-Kapsel. Man schluckt sie, sie filmt alles.“", [
    { q: "„Willst du mal? Der Livestream geht direkt auf YouTube. 40 Zuschauer! Treue Fans.“", options: [
      opt("„Erst nach Feierabend.“", () => bye("„Dann um 17:00?“ – „Es ist 17:30.“ Sie rechnet. Sie lässt dich laufen.")),
      opt("„Schluck du sie, ich moderiere.“", () => say("Sie schluckt. Du moderierst. Die 40 Zuschauer lieben dich. Du hast jetzt Fans. Merkwürdige Fans.", pen({ mins: 8 }))),
      opt("„Ich hab heute schon genug von innen gesehen.“", () => say("Sie nickt verständnisvoll. „Wie wir alle.“", [], 1))] }]) },
  { id: "lieblingsdarm", go: T("„Mal ehrlich: Was ist dein Lieblings-Darmabschnitt?“", [
    { q: "Sie meint es todernst.", options: [
      opt("„Das Ileum. Klassiker.“", () => say("„Solide. Langweilig, aber solide.“", [], 1)),
      opt("„Die Valvula Bauhini. Ich mag Türen.“", () => bye("Sie hat Tränen in den Augen. „Endlich versteht mich jemand.“ Sie lässt dich gehen. Sie winkt.")),
      opt("„Ich bin Internist, ich mag alle gleich.“", () => say("„Lügner.“ Sie hat recht. Du magst die Leber am liebsten.", pen({ energy: 5 })))] }]) },
);

(TALKS.D || (TALKS.D = [])).push(
  { id: "hindex", go: T("„Buddy! Kurze Frage: Wie ist dein h-Index?“", [
    { q: "„Meiner ist 34. Ich zähle Leserbriefe mit. Und Instagram-Posts.“", options: [
      opt("„Meiner ist 0. Ich habe ein Leben.“", () => bye("Er hält inne. Er denkt nach. Er hat kein Leben. Er geht nachdenklich weg.")),
      opt("„Was ist ein h-Index?“", () => say("Er erklärt es. 20 Minuten. Mit Folien. Auf dem Handy.", pen({ mins: 20 }))),
      itemOpt("8", "Taschenrechner leihen", "Er rechnet seinen h-Index nach. Er ist 3. Er muss sich setzen.")] }]) },
);

if (TALKS.Q) TALKS.Q.push(
  { id: "schlafkoch", go: T("Ein Schlafwandler kocht am Stationsherd. Mit geschlossenen Augen. Es riecht… gut?", [
    { q: "Er hält dir einen Löffel hin. „Probier mal, Schatz.“", options: [
      opt("Probieren", () => say("Es ist das beste Risotto deines Lebens. Er wird sich morgen an nichts erinnern. Du für immer.", gain({ energy: 30 }), 1)),
      opt("„Ich bin nicht Ihr Schatz.“", () => bye("„Natürlich nicht“, murmelt er, und rührt weiter. Du gehst. Er summt.")),
      opt("Herd ausschalten", () => say("Er wacht auf. Er schreit. Du schreist. Hildegard, irgendwo, lächelt.", pen({ nerves: 1 })))] }]) },
);
if (TALKS.Fn) TALKS.Fn.push(
  { id: "nachtbesuch", go: T("3 Uhr nachts. Familie Kowalski. Alle sieben. „Wir waren gerade in der Gegend!“", [
    { q: "„Und weil wir schon mal da sind: Können Sie Oma gleich mitnehmen? Wir haben das Auto voll.“", options: [
      opt("„Oma bleibt. Aber Sie können bleiben, im Wartezimmer.“", () => say("Sie bleiben. Sie bringen Decken. Und Kaffee. Für dich auch.", gain({ energy: 20 }), 1)),
      opt("„Die Besuchszeit endet um 1987.“", () => bye("Sie schauen sich an. Sie nicken. Sie gehen. Es klang sehr offiziell.")),
      opt("„Hildegard zeigt Ihnen den Weg.“", () => say("Sie drehen sich um. Hinter ihnen steht… niemand. Die Familie rennt. Du auch.", pen({ nerves: 1 })))] }]) },
);
