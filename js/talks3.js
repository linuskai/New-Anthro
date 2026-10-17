/* Hospital Escape 3D · even more absurd conversations (v9). Pushed into the existing pools. */
const outFree = (text, extra) => Object.assign(free(text, extra), { stop: true });

TALKS.P.push(
  { id: "horoskop", go: T("„Herr Doktor, ganz kurz: Ich bin Skorpion mit Aszendent Blutdruck.“", [
    { q: "„Mein Horoskop sagt, ich soll heute keine Tabletten nehmen. Wer hat recht, Sie oder die Sterne?“", options: [
      opt("„Die Sterne. Aber die Sterne sagen: Tabletten nehmen.“", () => outFree("Er nickt ehrfürchtig. „Dann muss es wohl so sein.“ Er schluckt alles auf einmal. Auch die Packungsbeilage.")),
      opt("„Ich bin Waage. Ich kann mich nicht entscheiden.“", () => say("„Das erklärt Ihre Frisur.“ Er will jetzt dein Geburtsdatum. Für ein Gutachten.", pen({ mins: 6 }))),
      bluff("„Merkur ist rückläufig. Keine Visite heute.“", .7, "„Oh nein. Dann gehen Sie lieber schnell.“ Er hält dir die Tür auf.", "„Merkur ist erst nächste Woche rückläufig.“ Er hat eine App dafür.")] },
    { q: "„Letzte Frage: Darf ich zur Entlassung meinen Tropf mitnehmen? Als Andenken.“", options: yesNo(() => say("Er strahlt. Die Station hat jetzt einen Ständer weniger. Das Controlling merkt es in 2031.", [], 1), () => say("„Dann nehm ich den Rollstuhl.“ Er rollt davon. Er braucht keinen Rollstuhl.", pen({ tasks: ["Rollstuhl zurückholen (Parkplatz)"] }))) }]) },
  { id: "bewertung", go: T("„Ich schreibe gerade eine Bewertung über dieses Krankenhaus.“", [
    { q: "„Wie viele Sterne würden SIE geben? Ehrlich.“", options: [
      opt("„Fünf. Für die Kaffeemaschine. Sie war mal da.“", () => say("Er tippt: „Personal nostalgisch.“ Vier Sterne.", [], 1)),
      opt("„Null. Aber man kann nicht null geben.“", () => outFree("„Endlich ein ehrlicher Arzt!“ Er gibt dir fünf Sterne. Persönlich. Mit Foto. Du bist jetzt bei Google.")),
      opt("Sein Handy nehmen und selbst schreiben", () => say("Du schreibst: „Flurbett war gemütlich.“ Er liest es vor. Alle Flurbetten applaudieren.", pen({ energy: 6 })))] }]) },
);

TALKS.F.push(
  { id: "powerpoint", go: T("Die Familie hat einen Beamer dabei. Der Enkel startet eine PowerPoint: „Opa – unsere Fragen (47 Folien)“.", [
    { q: "Folie 1: „Warum ist Opa krank?“", options: [
      opt("„Weiter zur Zusammenfassung.“", () => say("Der Enkel springt auf Folie 46: „Fazit: Wir sind sehr besorgt.“ Applaus der Familie.", [], 1)),
      opt("„Haben Sie das auch als PDF?“", () => outFree("„Natürlich!“ Sie schicken es per Mail. An die Klinik-Adresse von 2009. Du bist frei.")),
      opt("Den Beamer ausstecken und Licht an", () => say("Dunkelheit. Dann Licht. Dann sieben Gesichter, enttäuscht wie bei einem abgesagten Feuerwerk.", pen({ nerves: 1 })))] },
    { q: "Letzte Folie: „Dürfen wir heute Nacht hier schlafen? Alle?“", options: yesNo(() => say("Sie bauen ein Zelt auf. In Zimmer 12. Mit Grill.", pen({ tasks: ["Zelt in Zimmer 12 abbauen", "Grill löschen"] })), () => say("„Dann kommen wir morgen um sechs. Mit Folie 48.“", [], 1)) }]) },
  { id: "heilpraktiker", go: T("Neffe Dirk, Heilpraktiker, hält eine Wünschelrute über Oma.", [
    { q: "„Die Rute sagt: Erdstrahlen unter Bett 3. Können Sie das Bett umstellen? Und die Medikamente homöopathisieren?“", options: [
      opt("„Die Rute hat recht. Bett 3 ist verflucht. Sagen Sie's niemandem.“", () => outFree("Dirk ist zutiefst befriedigt. Er räuchert jetzt den Flur. Du nutzt den Rauch und verschwindest.")),
      opt("„Ich verdünne die Tabletten 1:10.000. Wirkt dann stärker.“", () => say("Dirk weint vor Glück. Oma bekommt trotzdem die echten. Ihr seid alle zufrieden.", [], 1)),
      bluff("Mit dem Stethoskop seine Rute abhören", .5, "„Sie… hören die Rute?“ Ehrfurcht. Er lässt dich gehen, ohne Blickkontakt.", "„Das ist keine Wissenschaft!“, sagt der Mann mit der Wünschelrute.")] }]) },
);

TALKS.N.push(
  { id: "formular", go: T("„Gut, dass ich dich erwische!“", [
    { q: "„Du musst bitte unterschreiben, dass du unterschrieben hast. Für das QM.“", options: [
      opt("Unterschreiben", () => say("Sie zieht ein zweites Formular hervor: „Und hier, dass du das Erste unterschrieben hast.“", pen({ mins: 4 }))),
      opt("Mit „Dr. Kurz“ unterschreiben", () => outFree("„Perfekt.“ Sie heftet es ab. Dr. Kurz hat jetzt 14 Dienste mehr. Karma.")),
      opt("„Ich unterschreibe nur mit Füller. Hab keinen.“", () => say("Sie hat einen. Sie hat immer einen. Sie hat eine ganze Schublade.", pen({ mins: 3 })))] },
    { q: "„Und kannst du Zimmer 7 noch kurz… nein, vergiss es. Geh. Lauf. Ich hab dich nicht gesehen.“", options: [opt("„Danke, Gertrud.“", () => say("„Ayşe.“ – „Danke, Ayşe.“ – „Kevin.“ Egal. Du bist weg.", [], 1))] }]) },
);

TALKS.O.push(
  { id: "nureiner", go: T("„Kollege! Nur EIN Dienst. Samstag. Ganz entspannt.“", [
    { q: "Er zeigt dir den Dienstplan. Samstag ist rot markiert. Sonntag auch. Und der Samstag danach. Insgesamt acht „nur EIN“ Dienste.", options: [
      opt("„Ich hab Samstag Hochzeit.“ – „Wessen?“ – „Meine.“", () => outFree("Er ist kurz sprachlos. Dann gratuliert er. Dann trägt er dich für den Tag nach der Hochzeit ein. Aber jetzt darfst du gehen.", pen({ duties: 1 }))),
      opt("„Ich bin Samstag krank. Ich spüre es schon.“", () => say("„Krankmeldung bitte bis Freitag 12 Uhr.“ Er meint es ernst.", pen({ duties: 1 }))),
      opt("Den Dienstplan nehmen und „Dr. Kurz“ eintragen", () => outFree("Er schaut drauf. „Kurz? Der hat doch Oma-Geburtstag.“ – „Wieder?“ – „Wieder.“ Er streicht beide. Du bist frei."))] }]) },
  { id: "drittmeinung", go: T("„Gut, dass Sie da sind. Ich brauche eine dritte Meinung.“", [
    { q: "„Erste Meinung: Appendizitis. Zweite Meinung, von mir: auch Appendizitis. Was sagen Sie?“", options: [
      opt("„Appendizitis.“", () => outFree("„Sehen Sie! Konsens!“ Er ist glücklich. Er hatte nur Angst, allein recht zu haben.")),
      opt("„Lupus.“", () => say("„Es ist nie Lupus.“ – „Diesmal schon.“ Er schreibt 3 Seiten Konsil. An dich.", pen({ tasks: ["Lupus-Konsil (3 Seiten, handschriftlich)"] }))),
      opt("„Ich hab Feierabend, das ist meine vierte Meinung.“", () => say("„Feierabend ist keine Diagnose.“ – „Noch nicht.“ Er notiert es für ein Paper.", pen({ energy: 6 })))] }]) },
);

TALKS.C.push(
  { id: "maskottchen", go: T("„SIE DA! Sie haben doch Fantasie.“", [
    { q: "„Das Klinikum braucht ein Maskottchen. Die Unternehmensberater schlagen ein sparsames Schwein vor. Ihre Idee?“", options: [
      opt("„Ein Faultier. Wegen der Wartezeiten.“", () => say("Er lacht. Laut. Dann ernst: „Gekauft.“ Du bekommst dafür nichts. Außer seinem Respekt. Für 4 Minuten.", [], 1)),
      opt("„Ein Phönix. Steigt aus der Asche, wie wir nach jedem Dienst.“", () => outFree("Er hat Tränen in den Augen. Er umarmt dich. Unbeholfen. Du nutzt den Moment.")),
      opt("„Sie selbst. In Bronze.“", () => say("„Ich hab schon eine Büste. Im Treppenhaus. Haben Sie die nie gesehen?“ Du hast. Du wolltest es vergessen.", pen({ nerves: 1 })))] }]) },
);

TALKS.V.push(
  { id: "atmen", go: T("„Moment! Ihre Atmung.“", [
    { q: "„Sie atmen seit 17:00 auf Station. Das ist nach Dienstende. Das muss ich als Überstunde erfassen. Oder als Diebstahl. Was ist Ihnen lieber?“", options: [
      opt("„Ich halte ab jetzt die Luft an.“", () => say("„Vorbildlich.“ Er stoppt die Zeit. Nach 40 Sekunden bist du blau. Er ist zufrieden.", pen({ energy: 10 }))),
      opt("„Erfassen Sie es als Fortbildung.“", () => outFree("Er grübelt. „Fortbildung… im Atmen… 0,25 Punkte.“ Er stempelt etwas. Du darfst gehen. Mit Punkten!")),
      bluff("„Ich atme nur aus. Das ist kostenneutral.“", .6, "Er rechnet. Er rechnet nochmal. „Das… stimmt.“ Er sieht erschüttert aus.", "„Ausatmen erzeugt CO₂. CO₂-Abgabe. 4,20 €.“")] }]) },
);

TALKS.I.push(
  { id: "natrium45", go: T("„Warte! Natrium 131. Lass uns das kurz besprechen.“", [
    { q: "„Kurz heißt: 45 Minuten. Ich hab Folien. Wollen wir mit der Physiologie der Henle-Schleife anfangen?“", options: [
      opt("„Lass uns mit dem Ende anfangen.“", () => outFree("„Das Ende ist: Wasser trinken.“ Er ist enttäuscht, wie kurz es ist. Du bist es nicht.")),
      opt("„Ist das schon SIADH oder noch Persönlichkeit?“", () => say("Er ist so begeistert, dass er dich umarmt. Dann redet er weiter. 20 Minuten.", pen({ mins: 20 }))),
      itemOpt("7", "Fallbericht zustecken", "Er schnappt ihn. „Morbus Whipple?!“ Er setzt sich auf den Boden und liest. Du bist Luft für ihn.")] }]) },
);

TALKS.Z.push(
  { id: "wlan", go: T("„Notfall! Mein WLAN ist krank.“", [
    { q: "„Es hat nur noch einen Balken. Seit Dienstag. Können Sie da was geben?“", options: [
      opt("„Zwei Tropfen Ethernet, dreimal täglich.“", () => outFree("Er schreibt es auf. Er dankt dir. Er geht zur Apotheke. Die Apotheke wird dich hassen.")),
      opt("„Haben Sie es schon aus- und wieder eingeschaltet?“", () => say("Er schaltet sich selbst aus und wieder ein. Er blinzelt. „Besser!“ Triage abgeschlossen.", [], 1)),
      opt("„Das ist kein Notfall.“", () => say("„Für mich schon!“ Er setzt sich in die Wartehalle. Wartenummer 999. Er wird ewig warten. Auf dich.", pen({ nerves: 1 })))] }]) },
);

TALKS.A.push(
  { id: "ichsehewas", go: T("Aus dem Dunkeln: „Ich sehe was, was du nicht siehst.“", [
    { q: "„Und das ist… grau.“", options: [
      opt("„Ein Röntgenbild.“", () => say("„Richtig.“ – „Welches?“ – „Alle.“ Er seufzt glücklich.", [], 1)),
      opt("„Die Zukunft der Radiologie.“", () => outFree("„Oh. Tief.“ Er denkt sehr lange darüber nach. Im Dunkeln. Du gehst einfach.")),
      opt("„Deine Voraufnahme von 2014.“", () => say("„Die hab ich gesucht!“ Er sucht weiter. Zusammen mit dir. Zehn Minuten.", pen({ mins: 10 })))] }]) },
);

TALKS.R.push(
  { id: "blutvegan", go: T("„Ein echter Arzt! Darf ich was fragen?“", [
    { q: "„Ist Blut eigentlich vegan? Wegen meiner Kundinnen.“", options: [
      opt("„Nur Eigenblut.“", () => outFree("„WOW.“ Sie schreibt es auf ihren Unterarm. Morgen hat die Praxis ein neues Angebot: Eigenblut-Glow.")),
      opt("„Blut ist ein Gefühl.“", () => say("Sie nickt tief bewegt. „Das ist so wahr.“ Sie gibt dir ein Peeling. Für die Seele.", gain({ nerves: 1 }), 1)),
      opt("„Kommt auf den Spender an.“", () => say("Sie will jetzt nur noch Blut von Veganern. Für Botox. Sie fragt, wo man das bestellt.", pen({ tasks: ["Erklären, dass man Blut nicht bestellt"] })))] }]) },
);
