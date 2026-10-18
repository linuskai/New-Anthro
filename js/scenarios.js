/* Hospital Escape 3D · scenarios: little situations on the way, each with a decision and a consequence. */
const scn = (text, stamps, score, after) => Object.assign(say(text, stamps, score), { after });
const SCENARIOS = [
  { id: "rollstuhl", av: "♿", title: "Führerloser Rollstuhl", text: "Ein Rollstuhl rollt den Flur hinunter. Leer. Er hat Tempo. Unten am Ende: die Glastür der Cafeteria.",
    options: [
      { label: "Hinterher und aufhalten", hint: "−8 Energie · Karma", act: () => scn("Du hechtest. Du fängst ihn. Ein Pfleger klatscht. Er schenkt dir einen Kaffee.", pen({ energy: 8 }).concat([good("☕ geschenkt")]), 1, () => addItem("1")) },
      { label: "Ausweichen und weitergehen", act: () => scn("KLIRR. Die Cafeteria hat jetzt einen Durchgang mehr. Niemand hat dich gesehen. Glaubst du.", []) },
      { label: "Reinsetzen und mitfahren", hint: "50 %", act: () => chance(.5) ? scn("Du rollst 30 Meter in Rekordzeit. Die Station applaudiert. Wieso hast du das nicht immer so gemacht?", [good("Abkürzung")], 1, () => { run.minutes = Math.max(0, run.minutes - 20); }) : scn("Ihr kippt um. Der Rollstuhl und du. Ein Patient filmt.", pen({ nerves: 1 })) },
    ] },
  { id: "drucker", av: "🖨️", title: "Drucker-Notfall", text: "Eine Pflegekraft winkt panisch: „Der Drucker! Er druckt seit 20 Minuten Seite 1 von 1 von Hr. Meiers Entlassbrief. Er ist schon bei 400!“",
    options: [
      { label: "Stecker ziehen", act: () => scn("Stille. Dann applaudiert der ganze Stützpunkt. Du bist ein Held. Ein Held mit 400 Entlassbriefen.", [good("Held:in")], 1) },
      { label: "„Das ist ein IT-Fall.“", act: () => scn("Die IT hat Urlaub. Das Ticket ist #48212. Seite 401 kommt raus.", pen({ tasks: ["Drucker-Ticket nachhalten"] })) },
      { label: "Seite 1 nehmen und Hr. Meier entlassen", hint: "−5 Min", act: () => scn("Hr. Meier ist so glücklich, dass er dir seine Zeitung schenkt. Von 2019.", pen({ mins: 5 }), 1) },
    ] },
  { id: "geburtstag", av: "🎂", title: "Geburtstag im Stationszimmer", text: "Im Stationszimmer: Kuchen, Kerzen, „Zum 60.!“ Alle drehen sich zu dir. „Komm, ein Stück! Und eine Rede!“",
    options: [
      { label: "Ein Stück nehmen, kurze Rede", hint: "+30 Energie · −10 Min", act: () => scn("„Auf 60 Jahre … äh … Station!“ Applaus. Der Kuchen ist der beste seit 2019.", gain({ energy: 30 }).concat(pen({ mins: 10 })), 1) },
      { label: "„Ich muss zum Notfall!“", act: () => scn("Du rennst los. Es gibt keinen Notfall. Aber jetzt musst du rennen. Die ganze Station schaut zu.", []) },
      { label: "Kuchen einpacken, Rede schwänzen", hint: "40 %", act: () => chance(.4) ? scn("Unbemerkt. Du hast einen Donut. Fast so gut wie Kuchen.", [good("🍩")], 1, () => addItem("$")) : scn("„Hey! Das ist für Gerda!“ Gerda ist 60. Gerda ist sauer.", pen({ nerves: 1 })) },
    ] },
  { id: "kaffeeautomat", av: "☕", title: "Der Kaffeeautomat lebt", text: "Der neue Kaffeeautomat blinkt: „WARTUNG ERFORDERLICH“. Daneben ein Zettel: „Bitte NICHT treten.“ Er riecht nach frischem Kaffee.",
    options: [
      { label: "Treten", hint: "60 %", act: () => chance(.6) ? scn("BAMM. Er spuckt drei Kaffee aus. Gleichzeitig. Ins gleiche Loch. Einer landet im Becher.", [good("☕")], 1, () => addItem("1")) : scn("Er spuckt heißes Wasser auf deinen Schuh. Und einen Zettel: „Ich hab's doch gesagt.“", pen({ energy: 6 })) },
      { label: "Höflich fragen", act: () => scn("Du sagst „Bitte“. Er blinkt grün. Er hat noch nie jemand „Bitte“ gesagt. Er gibt dir einen Kaffee.", [good("☕")], 1, () => addItem("1")) },
      { label: "Weitergehen", act: () => scn("Der Duft verfolgt dich bis zum Treppenhaus.", []) },
    ] },
  { id: "aufzugmusik", av: "🎵", title: "Visite im Flur", text: "Eine Visite blockiert den Flur: zwölf Leute, ein Chefarzt, ein Patient. Der Patient schläft. Der Chefarzt redet über Golf.",
    options: [
      { label: "Hinten anschließen und mitlaufen", hint: "−6 Min · getarnt", act: () => scn("Du nickst wichtig. Niemand merkt, dass du gar nicht dazugehörst. Am Ende des Flurs biegst du einfach ab.", pen({ mins: 6 }).concat([good("Getarnt")]), 1, () => { player.inv = 6; }) },
      { label: "Mitten durch", hint: "Risiko", act: () => chance(.5) ? scn("„Pardon, Notfall.“ Sie teilen sich wie das Rote Meer.", [], 1) : scn("Der Chefarzt sieht dich. „Ah! Sie präsentieren den nächsten Fall!“", pen({ mins: 12, tasks: ["Fallvorstellung für den Chef vorbereiten"] })) },
      { label: "Warten", hint: "−4 Min", act: () => scn("Nach dem Golf kommt Segeln. Dann ist der Flur frei.", pen({ mins: 4 })) },
    ] },
  { id: "verlaufen", av: "🗺️", title: "Verlaufener Besucher", text: "Ein Mann mit Blumenstrauß: „Entschuldigung, wo ist Zimmer 4.117? Ich suche seit Dienstag.“",
    options: [
      { label: "Hinbringen", hint: "−8 Min · +Karma", act: () => scn("Du bringst ihn hin. Er weint vor Glück. Er schenkt dir eine Blume. Sie riecht besser als die Station.", pen({ mins: 8 }).concat(gain({ nerves: 1 })), 1) },
      { label: "Den Weg erklären", act: () => scn("„Zweimal links, Treppe runter, dann fragen Sie Frau Bozkurt.“ Er nickt. Er wird es nie finden.", []) },
      { label: "„4.117 ist das Gesundheitsamt.“", act: () => scn("Er geht zum Gesundheitsamt. Er bekommt dort einen Job. Sein Leben ändert sich.", [], 1) },
    ] },
  { id: "putzwagen", av: "🧹", title: "Frisch gewischt", text: "Frau Bozkurt hat gerade den ganzen Flur gewischt. Sie schaut dich an. Sie schaut deine Schuhe an.",
    options: [
      { label: "Auf Zehenspitzen", hint: "langsam, leise", act: () => scn("Du balancierst wie ein Ballerino. Frau Bozkurt nickt anerkennend. „Sie haben Manieren.“", [good("Respekt")], 1) },
      { label: "Rüberrutschen!", hint: "50 %", act: () => chance(.5) ? scn("Du schlitterst elegant bis zur Tür. Frau Bozkurt vergibt eine 9,5.", [good("Schneller")], 1, () => { player.coffee = 6; }) : scn("Du liegst. Frau Bozkurt seufzt. Sie wischt um dich herum.", pen({ energy: 10 })) },
      { label: "Den Wischmopp übernehmen", hint: "−6 Min", act: () => scn("Du wischst. Schlecht. Frau Bozkurt erklärt dir eine Geheimtür als Dank.", pen({ mins: 6 }).concat([good("Geheimtipp")]), 1, () => { if (typeof openSecrets === "function") openSecrets(); run.flags.add("secret1"); }) },
    ] },
  { id: "fax", av: "📠", title: "Eingehendes Fax", text: "Das Faxgerät piept. Ein Fax kommt an. Langsam. Zeile für Zeile. Oben steht: „DRINGEND – An den diensthabenden Arzt“.",
    options: [
      { label: "Warten und lesen", hint: "−7 Min", act: () => scn("Nach sieben Minuten: „Bitte bestätigen Sie den Erhalt dieses Faxes per Fax.“", pen({ mins: 7, tasks: ["Fax-Empfang per Fax bestätigen"] })) },
      { label: "„Ich bin nicht der diensthabende Arzt.“", act: () => scn("Das Fax hört kurz auf. Dann druckt es: „Doch.“", pen({ nerves: 1 })) },
      { label: "Papier rausziehen", act: () => scn("Das Fax endet mit „…ist erfolgt.“ Was auch immer es war: Es ist erfolgt.", [], 1) },
    ] },
  { id: "katze", av: "🐈", title: "Eine Katze auf Station", text: "Eine Katze sitzt auf dem Visitenwagen. Sie trägt ein Namensschild: „Dr. Miau, Palliativ“. Sie schaut dich an.",
    options: [
      { label: "Streicheln", hint: "+1 Nerv", act: () => scn("Sie schnurrt. Für einen Moment ist alles gut. Dann geht sie, wie Katzen gehen: ohne Übergabe.", gain({ nerves: 1 }), 1) },
      { label: "„Haben Sie eine Approbation?“", act: () => scn("Sie hat. Sie zeigt sie dir. Sie hat bessere Noten als du.", []) },
      { label: "Ignorieren", act: () => scn("Sie folgt dir drei Meter, dann verliert sie das Interesse. Wie die Personalabteilung.", []) },
    ] },
  { id: "evaluation", av: "📋", title: "Mitarbeiterbefragung", text: "Ein Tablet am Ausgang: „Wie zufrieden sind Sie mit Ihrem Arbeitsplatz? 😀 🙂 😐 🙁 😡“",
    options: [
      { label: "😡 drücken", act: () => scn("„Danke! Ihr Feedback wurde gespeichert und gelöscht.“", [], 1) },
      { label: "😀 drücken", act: () => scn("„Großartig! Sie wurden für Zusatzdienste vorgeschlagen.“", pen({ duties: 1 })) },
      { label: "Tablet umdrehen", act: () => scn("Auf der Rückseite klebt ein Zettel: „Auch schon versucht. – Dr. Kurz“", [], 1) },
    ] },
  { id: "patientflucht", av: "🏃", title: "Patient auf der Flucht", text: "Ein Patient im Hemd, mit Infusionsständer, schleicht Richtung Ausgang. Er sieht dich. Du siehst ihn. Ihr versteht euch.",
    options: [
      { label: "Zunicken. Komplizen.", act: () => scn("Er salutiert. Ihr schleicht gemeinsam. An der Tür trennen sich eure Wege. Er nimmt den Aufzug. Mutig.", [good("Komplize")], 1, () => { player.inv = 5; }) },
      { label: "Zurückbringen", hint: "−10 Min · Karma", act: () => scn("Er seufzt. „Sie auch nicht, Herr Doktor?“ Du bringst ihn zurück. Die Pflege liebt dich.", pen({ mins: 10 }), 1, () => { run.goodwill.N = (run.goodwill.N || 0) + 1; }) },
      { label: "„Nehmen Sie mich mit!“", act: () => scn("„Nur mit Entlassbrief.“ Selbst die Patienten wollen Papierkram.", pen({ tasks: ["Entlassbrief für flüchtigen Patienten"] })) },
    ] },
  { id: "leiter", av: "🪜", title: "Hausmeister auf der Leiter", text: "Hausmeister Schraube auf der Leiter, eine Neonröhre im Mund. „Halt mal die Leiter. Nur kurz.“",
    options: [
      { label: "Leiter halten", hint: "−5 Min", act: () => scn("Das Licht geht an. Der ganze Flur sieht plötzlich viel ehrlicher aus. Er gibt dir eine Batterie.", pen({ mins: 5 }).concat([good("🔋")]), 1, () => addItem("9")) },
      { label: "„Ich hab keine Leiter-Schulung.“", act: () => scn("„Ich auch nicht.“ Er fällt nicht. Aber knapp.", []) },
    ] },
];

let scenarioT = 110;
function updateScenarios(dt) {
  if (run.mode !== "mission" || call || LEVELS[run.idx].safe || LEVELS[run.idx].final || playerSafe()) return;
  if ((scenarioT -= dt) > 0) return;
  if (!quiet(20000)) { scenarioT = 8; return; }
  scenarioT = 150 + Math.random() * 60;
  const pool = SCENARIOS.filter(s => !(run.usedScen || (run.usedScen = new Set())).has(s.id)); if (!pool.length) return;
  const sc = pick(pool); run.usedScen.add(sc.id);
  openDialog({ av: sc.av, color: "#f2b33d", name: sc.title, role: "Situation · du entscheidest", text: sc.text,
    options: sc.options.map(o => ({ label: o.label, hint: o.hint, act: () => { const r = o.act(); if (r && r.after) r.after(); updateHud(); return r; } })) });
}
