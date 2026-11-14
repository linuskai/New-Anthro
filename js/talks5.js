/* Hospital Escape 3D · v35 conversations with colleagues: sharper, meaner, closer to the real corridor. */

TALKS.O.push(
  { id: "feedback", go: T("„Haben Sie fünf Minuten für ein Feedbackgespräch? Ich fange mit dem Positiven an.“", [
    { q: "Er schaut auf seinen Zettel. Er dreht ihn um. Er dreht ihn wieder um. „… Sie sind pünktlich.“", options: [
      opt("„Danke. Das bedeutet mir viel.“", () => say("„Gut. Dann zum Rest.“ Der Rest hat Gliederungspunkte. Bis 4.3.2.", pen({ mins: 14, energy: 6 }))),
      opt("„Und das Negative?“", () => say("„Dass Sie gehen wollen. Um 17 Uhr. Wie ein Angestellter.“", pen({ energy: 8 }))),
      opt("„Darf ich Ihnen auch Feedback geben?“", () => bye("Er lacht. Dann merkt er, dass du es ernst meinst. Er muss dringend in den OP. Er ist Internist.")),
      bluff("„Das war jetzt schon das ganze Gespräch, oder?“", .5, "„… Ja. Doch. Eigentlich schon.“ Er ist erleichtert. Er hatte auch nicht mehr.", "„Nein. Ich habe Folien.“ Er hat wirklich Folien.", { mins: 12 })] }]) },
  { id: "vorbild", go: T("„Als ich Assistent war, habe ich 36 Stunden am Stück gearbeitet. Und es hat mir nicht geschadet.“", [
    { q: "Sein linkes Augenlid zuckt. Er hat seit 2011 nicht mehr gelacht. Er hat drei Ex-Ehen.", options: [
      opt("„Man sieht es Ihnen gar nicht an.“", () => say("„Nicht wahr?“ Er richtet seine Krawatte. Sie ist auf links.", [], 1)),
      opt("„Beeindruckend. Wie hieß noch mal Ihre Tochter?“", () => bye("Er überlegt. Er überlegt lange. Du gehst. Er überlegt noch.")),
      opt("„Und was hat es dem Patienten in Stunde 35 gebracht?“", () => say("Stille. „Das war eine andere Zeit.“ Er trägt dich für Sonntag ein. Aus pädagogischen Gründen.", pen({ duties: 1 })))] }]) },
  { id: "kurvenvisite", go: T("„Kurvenvisite. Jetzt. Ich weiß, es ist nach fünf, aber um fünf hatte ich Golf.“", [
    { q: "34 Kurven. Er liest jede einzelne vor. Auch die Körpergröße.", options: [
      opt("Mitgehen und nicken", () => say("Du nickst 34 Mal. Bei Kurve 19 nickst du im Schlaf weiter. Er merkt es nicht.", pen({ mins: 22, energy: 5 }))),
      opt("„Ich hab alle schon gesehen. Alles stabil.“", () => say("„Auch Zimmer 9?“ Es gibt kein Zimmer 9. Er nickt zufrieden.", [], 1)),
      bluff("„Die Pflege sucht Sie. Dringend. Wegen des Parkplatzes.“", .6, "„MEIN PARKPLATZ?“ Er rennt. Du hast ihn noch nie rennen sehen. Niemand hat das.", "„Mein Parkplatz ist videoüberwacht. Schöner Versuch.“ Kurvenvisite. Mit Körpergröße.", { mins: 22 })] }]) },
  { id: "privat", go: T("„Mein Privatpatient in Zimmer 1 braucht einen Arztbrief. Einen schönen. Mit Serifen.“", [
    { q: "„Und schreiben Sie ruhig ‚komplexer Verlauf‘. Er hatte einen eingewachsenen Zehennagel.“", options: [
      opt("„Komplexer Zehennagel. Verstanden.“", () => say("Du schreibst zwei Seiten über einen Zeh. Es wird dein bester Brief. Leider.", pen({ mins: 12 }))),
      opt("„Soll ich auch die Rechnung schreiben?“", () => bye("„Um Gottes willen, nein. Die schreibe ICH.“ Er hat es plötzlich eilig.")),
      opt("„Und die 33 Kassenpatienten?“", () => say("„Die haben ja Sie.“ Er lächelt. Es ist das Lächeln eines Mannes mit Liquidationsrecht.", pen({ energy: 6 })))] }]) },
);

TALKS.I.push(
  { id: "konsil", go: T("„Ich hab dein Konsil gelesen. Sieben Zeilen. Wo ist die Diskussion?“", [
    { q: "Seine eigenen Konsile haben ein Literaturverzeichnis. Und einen Anhang.", options: [
      opt("„Die Frage war: ‚Thrombose ja/nein?‘ Antwort: nein.“", () => say("„Aber WARUM nein? Und was ist mit dem anderen Bein? Und der Seele?“", pen({ mins: 10 }))),
      opt("„Die Diskussion ist im Supplement.“", () => bye("„Es gibt ein Supplement?!“ Er geht es suchen. Es gibt keins. Das merkt er Donnerstag.")),
      opt("„Schreib du sie. Du kannst das besser.“", () => say("Er errötet. Er schreibt elf Seiten. Mit Abbildung. Du musst nur gegenlesen. Elf Seiten.", pen({ mins: 8 })))] }]) },
  { id: "labor", go: T("„Ich hab bei deinem Patienten noch 23 Laborwerte nachgemeldet. Zur Sicherheit.“", [
    { q: "„Kupfer im Urin, Coeruloplasmin, und was Genetisches. Er hat Husten, oder?“", options: [
      opt("„Er hat Husten. Er ist 82. Er raucht.“", () => say("„Eben. Das ist verdächtig banal.“ Er meldet noch ein CT nach.", pen({ mins: 8 }))),
      opt("„Und wer bespricht die 23 Zufallsbefunde?“", () => bye("Er wird blass. Er storniert 22. Den Kupferwert behält er. Aus Prinzip.")),
      opt("„Meld gleich ein Ganzkörper-MRT an.“", () => say("„Du machst Witze.“ – „Ja.“ – „Schade.“ Er meldet es trotzdem an.", [], 1))] }]) },
  { id: "morgen", go: T("„Kurze Frage: Darf ich deinen Patienten morgen in der Fallkonferenz vorstellen?“", [
    { q: "„Es ist nichts Besonderes. Aber ich habe 60 Folien, und irgendwer muss sie sehen.“", options: [
      opt("„Klar. Viel Spaß.“", () => bye("Er strahlt. Er geht üben. Vor dem Spiegel. Mit Laserpointer.")),
      opt("„Nur, wenn ich nicht kommen muss.“", () => say("„Du bist Co-Referent!“ Folie 2 trägt schon deinen Namen. Falsch geschrieben.", pen({ duties: 1 }))),
      opt("„60 Folien für eine Pneumonie?“", () => say("„Die ersten 40 sind Anatomie.“ Er zeigt dir Folie 1. Es ist die Lunge. Von 1543.", pen({ mins: 7 })))] }]) },
);

TALKS.A.push(
  { id: "korrelieren", go: T("„Dein CT ist befundet: ‚Unklare Struktur, DD vieles. Klinisch korrelieren.‘“", [
    { q: "Er sitzt im Dunkeln. Er hat seit 2017 keinen Patienten mehr gesehen. Er ist glücklich.", options: [
      opt("„Was heißt ‚vieles‘?“", () => say("„Alles zwischen nichts und allem.“ Er empfiehlt eine Kontrolle. In sechs Monaten. Wie immer.", pen({ mins: 6 }))),
      opt("„Ich korreliere: Der Patient hat nichts.“", () => bye("„Dann ist es ein Zufallsbefund.“ Er ist zufrieden. Du bist zufrieden. Nur der Patient weiß von nichts.")),
      opt("„Kommst du mal mit ans Bett?“", () => say("Er zuckt zusammen wie ein Vampir bei Sonnenaufgang. „Ans … BETT?“ Er dimmt das Licht noch weiter.", [], 1))] }]) },
  { id: "anmeldung", go: T("„Deine Anmeldung fürs MRT: Fragestellung fehlt. Da steht nur ‚bitte‘.“", [
    { q: "„Ohne Fragestellung kein Bild. Das ist kein Wunschkonzert. Das ist Radiologie.“", options: [
      opt("„Fragestellung: Was hat er?“", () => say("„Das ist keine Fragestellung. Das ist ein Hilferuf.“ Er lehnt ab. Formal korrekt.", pen({ mins: 8 }))),
      opt("„Fragestellung: Ausschluss von allem.“", () => bye("„Das können wir.“ Er nimmt es an. Befund in 14 Tagen: ‚Alles nicht sicher ausgeschlossen.‘")),
      bluff("„Der Chef will es. Persönlich.“", .65, "„Sag das doch gleich.“ Der Termin ist in zehn Minuten. Für den Chef geht immer was.", "Er ruft den Chef an. Der Chef weiß von nichts. Der Chef will jetzt wissen, wer du bist.", { energy: 8 })] }]) },
);

TALKS.n.push(
  { id: "vorbereitung", go: T("„Dein Patient für die Kolo morgen: Hat er abgeführt? Wirklich? Richtig?“", [
    { q: "„Ich will klares Wasser sehen. Bergquell. Gebirgsbach. Nicht Elbe.“", options: [
      opt("„Er sagt: ja.“", () => say("„Das sagen sie alle.“ Sie gibt dir vier Liter mit. Für ihn. Und einen Blick. Für dich.", pen({ mins: 6 }))),
      opt("„Bergquell. Ich hab selbst nachgesehen.“", () => bye("Sie legt dir die Hand auf die Schulter. „Du bist einer von uns.“ Du willst keiner von ihnen sein. Aber du bist frei.")),
      opt("„Er hat stattdessen Schnitzel gegessen.“", () => say("Sie setzt sich. Sie atmet. Sie verschiebt alles. Auf dich.", pen({ duties: 1 })))] }]) },
);

TALKS.R.push(
  { id: "konsilhaut", go: T("„Du wolltest ein Hautkonsil? Ich komme. Dienstag in drei Wochen. Zwischen 10 und 10:15.“", [
    { q: "„Bis dahin: eincremen. Womit? Egal. Hauptsache teuer.“", options: [
      opt("„Der Patient wird morgen entlassen.“", () => bye("„Perfekt, dann hat es sich erledigt.“ Sie streicht das Konsil. Ihr Tag ist gerettet. Deiner auch.")),
      opt("„Es juckt ihn aber jetzt.“", () => say("„Jucken ist ein Gefühl. Gefühle macht die Psychosomatik.“ Sie schreibt eine Überweisung.", pen({ mins: 6 }))),
      opt("„Kannst du kurz draufschauen? Ist nur ein Fleck.“", () => say("Sie schaut. Aus vier Metern. „Hm. Fleck.“ Das ist der Befund. Er kostet 84 Euro.", [], 1))] }]) },
);

TALKS.C.push(
  { id: "vision", go: T("„Bleiben Sie stehen. Ich möchte Ihnen meine Vision für die Klinik 2040 erläutern.“", [
    { q: "„Exzellenz. Wachstum. Leuchtturm.“ Er macht eine Pause, damit du mitschreiben kannst.", options: [
      opt("Mitschreiben", () => say("Du schreibst: „Exzellenz. Wachstum. Leuchtturm.“ Er nickt. Du bist jetzt in der Strategiegruppe. Sie tagt samstags.", pen({ duties: 1 }))),
      opt("„Und mehr Personal?“", () => say("Er schaut dich an, als hättest du im OP gepfiffen. „Ich sagte: VISION.“", pen({ energy: 8 }))),
      bluff("„Die Presse wartet unten auf Sie, Herr Professor.“", .6, "Er richtet die Haare. Er geht. Unten wartet der Paketbote. Er gibt ihm trotzdem ein Interview.", "„Die Presse kommt erst, wenn ICH sie rufe.“ Die Vision hat 12 Kapitel.", { mins: 18 })] }]) },
);
