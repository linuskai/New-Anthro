/* Hospital Escape 3D · turn-based battles in the style of the classic handheld monster games:
   enemy box top left, enemy on a platform top right, you from behind bottom left, text box and FIGHT / BAG / COLLEAGUES / RUN.
   Some moves are medical quiz questions: answer right for a critical hit; the enemy quizzes you too. */

// ---------- quiz pools ----------
const QUIZ = {
  ortho: [
    { q: "Kahnbeinfraktur. Welche Schraube?", o: ["Herbert-Schraube", "Spax 4 × 40 aus dem Baumarkt", "Die vom IKEA-Regal, Teil 112"], a: 0 },
    { q: "Pertrochantäre Femurfraktur, 85 Jahre. Versorgung?", o: ["Gammanagel / PFNA", "Gips bis zur Hüfte", "Ibuprofen und Daumen drücken"], a: 0 },
    { q: "Dislozierte Schenkelhalsfraktur (Garden IV), 82 Jahre?", o: ["Endoprothese (Duokopf oder TEP)", "Drei Schrauben und Hoffnung", "Kühlen, hochlegen, beten"], a: 0 },
    { q: "Wie viele Knochen hat ein Erwachsener?", o: ["206", "212", "So viele, wie ich brechen kann"], a: 0 },
    { q: "Größter Muskel des Menschen?", o: ["M. gluteus maximus", "Der Bizeps (offensichtlich)", "Das Ego eines Orthopäden"], a: 0 },
    { q: "Welcher Muskel gehört NICHT zur Rotatorenmanschette?", o: ["M. deltoideus", "M. supraspinatus", "M. teres minor"], a: 0 },
    { q: "Bester Proteinshake für den Bizeps?", o: ["20 bis 30 g Eiweiß nach dem Training, egal welcher", "Vanille. Immer Vanille.", "Drei Shakes, dann zählt es doppelt"], a: 0 },
    { q: "Vorderes Kreuzband. Welcher Test?", o: ["Lachman-Test", "Lasègue", "Reflexhammer auf den Kopf"], a: 0 },
    { q: "Riss der langen Bizepssehne. Typisches Zeichen?", o: ["Popeye-Zeichen", "Hulk-Zeichen", "Arnold-Zeichen"], a: 0 },
    { q: "Wann röntgt man nach Ottawa Ankle Rules?", o: ["Druckschmerz an der Knöchelhinterkante oder kein Auftreten möglich", "Immer, wir haben ja ein Röntgengerät", "Nie, Röntgen ist was für Internisten"], a: 0 },
    { q: "Frühes Leitsymptom beim Kompartmentsyndrom?", o: ["Schmerz, der nicht zur Verletzung passt (Dehnungsschmerz)", "Pulslosigkeit", "Gute Laune"], a: 0 },
    { q: "Karpaltunnelsyndrom. Welcher Nerv?", o: ["N. medianus", "N. ulnaris", "N. bizepsualis"], a: 0 },
    { q: "Wie viele Halswirbel hat der Mensch?", o: ["7", "12", "Einen, aber sehr stabil"], a: 0 },
    { q: "Achillessehnenruptur. Welcher Test?", o: ["Thompson-Test", "Proteinshake-Test", "Lachman-Test"], a: 0 },
    { q: "Wie heißt der Oberarmknochen?", o: ["Humerus", "Femur", "Der Lange"], a: 0 },
    { q: "Weber-B-Fraktur: Wo liegt die Fibulafraktur?", o: ["Auf Höhe der Syndesmose", "Unterhalb der Syndesmose", "Im Bizeps"], a: 0 },
    { q: "Humerusschaftfraktur. Welcher Nerv ist gefährdet?", o: ["N. radialis", "N. medianus", "N. orthopaedicus"], a: 0 },
    { q: "Monteggia-Fraktur?", o: ["Ulnafraktur plus Radiuskopfluxation", "Radiusfraktur plus Luxation im distalen Radioulnargelenk", "Ein Cocktail mit Protein"], a: 0 },
    { q: "„Unhappy Triad“ am Knie?", o: ["Vorderes Kreuzband, Innenband, Innenmeniskus", "Bizeps, Trizeps, Ego", "Patella, Fibula, Feierabend"], a: 0 },
    { q: "Was klassifiziert Salter-Harris?", o: ["Frakturen mit Wachstumsfuge bei Kindern", "Proteinshakes nach Geschmack", "Schraubenlängen"], a: 0 },
    { q: "Was ist der Ort des Scaphoid-Druckschmerzes?", o: ["Tabatière (Fossa radialis)", "Ellenbogen", "Bizepsbauch"], a: 0 },
  ],
  intern: [
    { q: "Häufigste Ursache einer Hyponatriämie im Krankenhaus?", o: ["Medikamente und SIADH", "Zu wenig Salz auf den Pommes", "Mondphase"], a: 0 },
    { q: "Kalium 6,8 mmol/l. Was zuerst?", o: ["EKG, dann Calciumgluconat, Insulin-Glukose", "Bananen absetzen", "Nochmal abnehmen, bestimmt hämolytisch"], a: 0 },
    { q: "Troponin positiv. Ist es immer ein Herzinfarkt?", o: ["Nein, auch Niere, Sepsis, Lungenembolie …", "Ja, immer", "Nur montags"], a: 0 },
    { q: "Anionenlücke bei Na 140, Cl 100, HCO₃ 24 mmol/l?", o: ["16", "40", "264"], a: 0 },
    { q: "Anaphylaxie. Erstes Medikament?", o: ["Adrenalin i.m.", "Antihistaminikum als Tablette", "Ein Glas Wasser und gut zureden"], a: 0 },
    { q: "Digitalis-Intoxikation. Klassisches Symptom?", o: ["Gelbsehen (Xanthopsie)", "Grünsehen", "Rotsehen bei der Chefvisite"], a: 0 },
    { q: "Wofür nutzt man den CHA₂DS₂-VASc-Score?", o: ["Schlaganfallrisiko bei Vorhofflimmern", "Wie lange die Visite dauert", "Kaliumverlust durch Bananenmangel"], a: 0 },
    { q: "Hyperkaliämie im EKG, früh?", o: ["Hohe, spitze (zeltförmige) T-Wellen", "Delta-Welle", "Ein Smiley"], a: 0 },
    { q: "Was spiegelt der HbA1c wider?", o: ["Den Blutzucker der letzten etwa 8 bis 12 Wochen", "Den Zucker im Stationskaffee von heute", "Die Laune des Diabetologen"], a: 0 },
    { q: "qSOFA: Welches ist ein Kriterium?", o: ["Atemfrequenz ab 22 pro Minute", "Temperatur ab 37,6 °C (Hr. Lehmann)", "Mehr als 7 Angehörige im Zimmer"], a: 0 },
    { q: "Hohes Wells-Score-Risiko für Lungenembolie. Nächster Schritt?", o: ["Direkt CT-Angiographie, D-Dimer bringt hier nichts", "Erst D-Dimer, dann abwarten", "Ein Kaffee, dann sehen wir weiter"], a: 0 },
    { q: "Häufigste Ursache einer Hyperkalzämie ambulant?", o: ["Primärer Hyperparathyreoidismus", "Zu viel Milch im Kaffee", "Karies"], a: 0 },
  ],
  hygiene: [
    { q: "Wie lange dauert die hygienische Händedesinfektion?", o: ["30 Sekunden", "3 Sekunden", "Bis es nicht mehr klebt"], a: 0 },
    { q: "Händehygiene: Was ist einer der 5 Momente?", o: ["Vor Patientenkontakt", "Vor dem Mittagessen in der Kantine", "Vor dem Instagram-Post"], a: 0 },
    { q: "Dürfen Ringe und Uhr bei der Arbeit am Patienten getragen werden?", o: ["Nein", "Ja, wenn sie teuer sind", "Nur die Apple Watch"], a: 0 },
    { q: "Clostridioides difficile: Was hilft bei den Händen?", o: ["Waschen mit Seife (Sporen!), dann desinfizieren", "Nur Alkohol, das tötet alles", "Pusten"], a: 0 },
    { q: "MRSA-Isolierung: Was ziehst du an?", o: ["Schutzkittel und Handschuhe (je nach Lage Maske)", "Den Kittel von gestern", "Nur ein Lächeln"], a: 0 },
  ],
  rules: [
    { q: "Maximale werktägliche Arbeitszeit laut Arbeitszeitgesetz?", o: ["8 Stunden, bis 10 mit Ausgleich", "24 Stunden", "So lange der Chef will"], a: 0 },
    { q: "Mindestruhezeit nach Dienstende?", o: ["11 Stunden", "6 Stunden", "Ein Powernap im Aufzug"], a: 0 },
    { q: "Dürfen Patienten ohne Einwilligung in einem Reel gezeigt werden?", o: ["Nein", "Ja, mit Filter", "Ja, wenn man nur die Nase verpixelt"], a: 0 },
    { q: "Ein Kugelschreiber von der Pharmafirma. Was tun?", o: ["Ablehnen oder melden (Compliance)", "Sammeln, ab 100 gibt's ein Auto", "Verkaufen"], a: 0 },
    { q: "Was bedeutet Opt-out bei der Arbeitszeit?", o: ["Freiwillig im Schnitt über 48 Stunden pro Woche arbeiten", "Raus aus dem Dienstplan, für immer", "Ein neues Gericht in der Kantine"], a: 0 },
    { q: "Bereitschaftsdienst zählt arbeitsrechtlich als …?", o: ["Arbeitszeit", "Freizeit mit Pieper", "Wellness"], a: 0 },
  ],
  chief: [
    { q: "Wann beginnt die Chefvisite?", o: ["Wenn der Chef kommt", "Um 7:30", "Gar nicht, er ist auf Kongress"], a: 0 },
    { q: "Wer hat bei der Visite immer recht?", o: ["Der Chefarzt (leider)", "Die Evidenz", "Die Pflege (eigentlich)"], a: 0 },
    { q: "Wie viele Patienten stellst du morgen um 6:30 vor?", o: ["Alle 34, auswendig", "Die interessanten", "Keinen, ich bin dann in Davos"], a: 0 },
    { q: "Wie nennt der Chef deine 312 Überstunden?", o: ["„Lernerfahrung“", "„Vergütete Mehrarbeit“", "„Burnout-Risiko“"], a: 0 },
    { q: "Wer parkt direkt am Haupteingang?", o: ["Der Chefarzt", "Der Rettungswagen", "Patienten mit Gehbehinderung"], a: 0 },
  ],
};
QUIZ.boss = QUIZ.rules;

// ---------- full-body sprites, rendered from the game's own 3D people ----------
let bR = null, bScene = null, bCam = null;
const spriteCache = new Map();
function battleSprite(sp, back, key) {
  const k = key + (back ? ":b" : ":f"); if (spriteCache.has(k)) return spriteCache.get(k);
  try {
    if (!bR) {
      const c = document.createElement("canvas"); c.width = 384; c.height = 384;
      bR = new THREE.WebGLRenderer({ canvas: c, antialias: true, preserveDrawingBuffer: true, alpha: true }); bR.setPixelRatio(1);
      bScene = new THREE.Scene(); bScene.add(new THREE.HemisphereLight(0xffffff, 0x7a8a84, .9));
      const dl = new THREE.DirectionalLight(0xfff4e8, .8); dl.position.set(1.5, 2.5, 3); bScene.add(dl);
      bCam = new THREE.PerspectiveCamera(30, 1, .1, 20);
    }
    const p = makePerson({ ...sp, noShadow: true, trolley: false });
    p.group.rotation.y = back ? Math.PI + .5 : -.35; bScene.add(p.group); p.group.updateMatrixWorld(true);
    const h = 1.9 * (sp.scale || 1);
    bCam.position.set(0, h * .55, h * 1.62); bCam.lookAt(0, h * .5, 0);
    bR.setClearColor(0x000000, 0); bR.render(bScene, bCam);
    const url = bR.domElement.toDataURL("image/png"); bScene.remove(p.group);
    spriteCache.set(k, url); return url;
  } catch (e) { return null; }
}
const PLAYER_SP = { skin: SKIN[0], hair: 0x5a3a22, hairStyle: "short", coat: true, shirt: 0x9fc0e0, pants: 0x2f3440, steth: true, mood: "tired" };

// ---------- moves ----------
/* Every opponent is fought with moves that fit this opponent: an orthopaedist with internal medicine, the chief with guidelines,
   the hygiene inspector with bare hands. se = hits where it hurts (×1.6), weak = bounces off (×.6). Two of the pool are drawn per battle,
   plus the quiz move and the coffee break. */
const ORTHO_POOL = [
  { n: "MRT-BEFUND VORLESEN", fx: "scan", t: "DIAGNOSTIK", se: 1, p: 48, pp: 5, txt: "liest seinen MRT-Befund vor: „Degenerative Veränderungen, altersentsprechend.“ Altersentsprechend! Er ist 38!" },
  { n: "LEG-DAY ANSPRECHEN", fx: "legs", t: "PSYCHE", p: 36, pp: 6, weaken: 1, txt: "fragt nach seinem letzten Leg-Day. Er schaut auf seine Waden. Lange Stille. Sein Angriff sinkt." },
  { n: "LEBERWERTE ZEIGEN", fx: "lab", t: "DIAGNOSTIK", se: 1, p: 54, pp: 3, txt: "zeigt ihm seine Leberwerte vom Betriebsarzt. GGT 340. Er wird blass. Unter der Bräune." },
  { n: "INTERNISTISCHES KONSIL", fx: "paper", t: "PAPIER", p: 34, pp: 6, txt: "schickt ein internistisches Konsil. Drei Seiten Freitext, keine Stichpunkte. Er muss es lesen. Ganz." },
  { n: "RÖNTGEN VERKEHRT HERUM", fx: "xray", t: "PSYCHE", p: 40, pp: 4, txt: "hängt sein Röntgenbild verkehrt herum auf. Er merkt es nicht. Die ganze Station schon." },
  { n: "„ERST MAL KONSERVATIV“", fx: "pill", t: "DIAGNOSTIK", se: 1, p: 46, pp: 4, txt: "schlägt konservative Therapie vor. Physio statt OP. Er muss sich an der Hantelbank festhalten." },
  { n: "SHAKE VERSTECKEN", fx: "hide", t: "PSYCHE", p: 20, pp: 3, weaken: 1, txt: "versteckt seinen Proteinshake im Medikamentenkühlschrank. Er sucht. Er zittert. Sein Angriff sinkt." },
  { n: "EKG KLEBEN", fx: "ekg", t: "DIAGNOSTIK", p: 42, pp: 4, txt: "klebt ihm ein EKG. Auf die Brustbehaarung. Und reißt es wieder ab. Sinusrhythmus. Mit Schrei." },
  { n: "DIFFERENZIALDIAGNOSE", fx: "bubbles", t: "DIAGNOSTIK", p: 38, pp: 5, txt: "nennt zwölf Differenzialdiagnosen. Er kennt zwei: „gebrochen“ und „nicht gebrochen“. Ihm wird schwindelig." },
  { n: "KALIUM NACHFRAGEN", fx: "lab", t: "DIAGNOSTIK", p: 44, pp: 4, txt: "fragt: „Wie war eigentlich das Kalium?“ Er schaut, als hättest du nach dem Wetter auf dem Mars gefragt." },
];
const MOVE_QUIZ = { n: "FACHFRAGE", fx: "quiz", t: "WISSEN", p: 75, pp: 5, quiz: true, txt: "stellt eine Fachfrage." };
const MOVE_HEAL = { n: "KAFFEEPAUSE", fx: "coffee", t: "KOFFEIN", heal: 30, pp: 3, txt: "trinkt lauwarmen Stationskaffee von gestern. Mit Haut drauf." };
const pickMoves = kit => { const pool = (kit ? kit.my : ORTHO_POOL).slice().sort(() => Math.random() - .5); return [MOVE_QUIZ, pool[0], pool[1], MOVE_HEAL]; };
const FOES = {
  U: { type: "KRAFT", lvl: 52, quiz: "ortho", moves: [
    { n: "REFLEXHAMMER", fx: "hammer", p: 22, txt: "schwingt den REFLEXHAMMER! Patellarsehne getroffen! Dein Bein tritt von selbst. Sehr peinlich." },
    { n: "BIZEPS-FLEX", fx: "flex", buff: 1, txt: "setzt BIZEPS-FLEX ein und schaut dabei in den Spiegel der Glastür! Sein ANGRIFF steigt stark!" },
    { n: "PROTEINWOLKE", fx: "cloud", debuff: 1, txt: "schüttelt seinen Shake ohne Deckel. Eine PROTEINWOLKE! Deine Genauigkeit sinkt!" },
    { n: "„IST DOCH NUR EIN KNIE“", fx: "bubbles", p: 18, txt: "sagt „Ist doch nur ein Knie, das macht die Innere!“ Du bekommst drei Konsile. Es tut weh." },
    { n: "OP-PLAN GEÄNDERT", fx: "calendar", p: 20, txt: "ändert den OP-PLAN! Dein Patient ist jetzt um 22:00 dran. Mit dir als Assistenz." },
    { n: "BANKDRÜCKEN-ANEKDOTE", fx: "bubbles", p: 16, txt: "erzählt von seinem Bankdrücken. 140 Kilo. Dreimal. Mit Videobeweis. Du verlierst den Lebenswillen." },
    { n: "PRÄVENTIVER GIPS", fx: "cast", p: 10, stun: "DU steckst im Gips und kannst dich nicht bewegen! Er macht ein Foto für Instagram.", txt: "legt dir einen GIPS an. Präventiv. „Sicher ist sicher.“ Du setzt eine Runde aus!" },
    { n: "SCHRAUBEN-SALVE", fx: "screws", p: 7, multi: 3, txt: "wirft mit Titanschrauben. Übrig vom letzten Knie. Und vom vorletzten." },
    { n: "HIGH FIVE", fx: "hand", p: 24, txt: "gibt dir ein HIGH FIVE. Mit voller Kraft. Deine Hand ist jetzt ein Fall für die Handchirurgie." },
    { n: "„INTERNISTISCH ABKLÄREN“", fx: "paper", p: 19, txt: "schreibt „Bitte internistisch abklären“ auf einen Zettel. Ohne Fragestellung. Ohne Patient. Mit Stempel." },
    { n: "FACHFRAGE", quiz: true, txt: "stellt dir eine orthopädische Frage! Mit Blickkontakt!" }] },
};
/* the six end bosses: each with its own arena, its own attacks, and your own answers to exactly this person */
const BOSS_KIT = {
  stay: { type: "HIERARCHIE", quiz: "chief", arena: "chief", lvl: 99,
    intro: "Er trägt die Visitenmappe wie ein Zepter. Hinter ihm: dein Auto. Vor ihm: du.", ko: "„Das … besprechen wir in der Frühbesprechung.“ Er sinkt auf seinen reservierten Parkplatz.",
    my: [
      { n: "LEITLINIE ZITIEREN", fx: "law", t: "EVIDENZ", se: 1, p: 56, pp: 4, txt: "zitiert die aktuelle Leitlinie. Von 2025. Seine ist von 1998. Er nennt das „Erfahrung“." },
      { n: "PRIVATPATIENT ERWÄHNEN", fx: "phone", t: "LIST", p: 30, pp: 5, weaken: 1, txt: "ruft: „Ihr Privatpatient wartet!“ Er dreht sich um. Niemand da. Aber er hat sich umgedreht." },
      { n: "„GIBT ES DAZU EVIDENZ?“", fx: "quiz", t: "EVIDENZ", se: 1, p: 50, pp: 4, txt: "fragt: „Gibt es dazu Evidenz?“ Stille im Raum. Irgendwo platzt eine Neonröhre." },
      { n: "OBERARZT VORSCHIEBEN", fx: "shield", t: "LIST", p: 18, pp: 3, guard: 1, txt: "stellt sich hinter den Oberarzt. Der merkt nichts, er diktiert. Der nächste Treffer prallt halb ab." },
      { n: "AUGENRING-BLICK", fx: "rings", t: "MITLEID", weak: 1, p: 30, pp: 6, txt: "zeigt die Augenringe. Er sagt: „Wir hatten früher 72-Stunden-Dienste. Barfuß.“" }],
    foe: [
      { n: "DIENSTPLAN", fx: "calendar", p: 22, txt: "zückt den DIENSTPLAN! Ostern UND Pfingsten! Und Silvester, „weil Sie ja eh nichts vorhaben“!" },
      { n: "CHEFVISITE", fx: "bubbles", p: 8, multi: 3, txt: "kommt mit 14 Leuten zur CHEFVISITE! Jeder stellt eine Frage. Keiner hört die Antwort." },
      { n: "FRÜHER WAR ALLES HÄRTER", fx: "up", buff: 1, txt: "erzählt, dass FRÜHER ALLES HÄRTER war! Sein ANGRIFF steigt. Dein Gehalt nicht." },
      { n: "KONGRESS IN DAVOS", fx: "drain", p: 16, drain: 1, txt: "fliegt kurz nach DAVOS. Zur „Fortbildung“. Er kommt erholt zurück. Du hast derweil seine Station." },
      { n: "NUR GANZ KURZ", fx: "bubbles", p: 15, acc: 1, txt: "sagt „NUR GANZ KURZ …“! Es dauert 45 Minuten. Deine Genauigkeit sinkt!" },
      { n: "„UND IHRE HABILITATION?“", fx: "rings", p: 21, txt: "fragt nach deiner HABILITATION. Du hast keine. Er schaut. Lange. Sehr lange." },
      { n: "FACHFRAGE", quiz: true, txt: "prüft dein Wissen! Vor versammelter Mannschaft! In der Frühbesprechung!" }],
    sig: { fx: "calendar", n: "OSTERDIENST", p: 30, txt: "trägt dich für OSTERN, PFINGSTEN UND WEIHNACHTEN ein!" } },
  pharma: { type: "BÜROKRATIE", quiz: "rules", arena: "office", lvl: 77,
    intro: "Sie hat den Compliance-Ordner dabei. Er hat ein Inhaltsverzeichnis. Das Inhaltsverzeichnis hat ein Inhaltsverzeichnis.", ko: "„Das … muss ich dokumentieren.“ Sie heftet sich selbst ab. Unter N wie Niederlage.",
    my: [
      { n: "KUGELSCHREIBER ANNEHMEN", fx: "pen", t: "REGELBRUCH", se: 1, p: 54, pp: 4, txt: "nimmt vor ihren Augen einen Pharma-Kugelschreiber an. Wert: 38 Cent. Sie hyperventiliert." },
      { n: "FORMULAR IN ROSA", fx: "paper", t: "PAPIER", p: 32, pp: 5, weaken: 1, txt: "reicht das Formular in Rosa ein. Vorgeschrieben ist Lachs. Sie muss das prüfen. Drei Wochen. Ihr Angriff sinkt." },
      { n: "GEGENFRAGE", fx: "quiz", t: "PARAGRAF", p: 44, pp: 5, txt: "fragt: „Und wer kontrolliert eigentlich Sie?“ Sie blättert. Sie blättert immer noch." },
      { n: "DIENSTWEG EINHALTEN", fx: "shield", t: "PAPIER", p: 18, pp: 3, guard: 1, txt: "besteht auf dem Dienstweg. Ihr nächster Angriff muss erst durch drei Vorzimmer." },
      { n: "§ 3 ARBEITSZEITGESETZ", fx: "law", t: "PARAGRAF", se: 1, p: 52, pp: 3, txt: "zitiert § 3 Arbeitszeitgesetz. Sie kennt ihn. Sie hat nur nie erlebt, dass ihn jemand ernst meint." }],
    foe: [
      { n: "PARAGRAFENREITEN", fx: "law", p: 20, txt: "reitet auf § 7 Absatz 3 Satz 2 herum! Im Galopp! Über dich drüber!" },
      { n: "INTERESSENKONFLIKT-ERKLÄRUNG", fx: "paper", p: 10, stun: "DU füllst noch die Interessenkonflikt-Erklärung aus. Seite 31 von 48.", txt: "legt dir die INTERESSENKONFLIKT-ERKLÄRUNG vor. 48 Seiten. Du setzt eine Runde aus!" },
      { n: "PFLICHTSCHULUNG", fx: "slides", p: 14, acc: 1, txt: "ordnet eine PFLICHTSCHULUNG an! 90 Minuten, kein Vorspulen. Deine Genauigkeit sinkt!" },
      { n: "ZWEITE UNTERSCHRIFT FEHLT", fx: "audit", p: 19, txt: "stellt fest: Die ZWEITE UNTERSCHRIFT FEHLT! Alles, was du heute getan hast, ist ungültig. Auch das Mittagessen." },
      { n: "ABMAHNUNG (ENTWURF)", fx: "paper", p: 24, txt: "zeigt dir eine ABMAHNUNG. Im Entwurf. „Nur, damit Sie wissen, dass es sie gibt.“" },
      { n: "VIER-AUGEN-PRINZIP", fx: "up", buff: 1, txt: "holt eine Kollegin. VIER AUGEN! Beide schauen streng. Ihr ANGRIFF steigt!" },
      { n: "FACHFRAGE", quiz: true, txt: "prüft deine Regelkenntnis! Schriftlich! Mit Zweitkorrektur!" }],
    sig: { fx: "audit", n: "COMPLIANCE-AUDIT", p: 18, acc: 1, txt: "startet ein COMPLIANCE-AUDIT! Alle deine Kugelschreiber werden beschlagnahmt! Deine Genauigkeit sinkt!" } },
  consult: { type: "GREMIUM", quiz: "rules", arena: "strike", lvl: 68,
    intro: "Freigestellt seit 1998. Er hat Zeit. Sehr viel Zeit. Und eine Trillerpfeife.", ko: "„Das … muss erst durchs Gremium.“ Er vertagt sich. Auf unbestimmte Zeit.",
    my: [
      { n: "EIGENINITIATIVE", fx: "flex", t: "TEMPO", se: 1, p: 54, pp: 4, txt: "zeigt Eigeninitiative. Ohne Beschluss. Ohne Sitzung. Ohne Protokoll. Er muss sich setzen." },
      { n: "SITZUNG VERTAGEN", fx: "calendar", t: "VERFAHREN", p: 30, pp: 5, weaken: 1, txt: "beantragt Vertagung. Einstimmig angenommen. Von ihm. Aus Gewohnheit. Sein Angriff sinkt." },
      { n: "TOP 14: VERSCHIEDENES", fx: "bubbles", t: "VERFAHREN", p: 42, pp: 5, txt: "bringt TOP 14 ein: Verschiedenes. Das dauert. Er verliert den Faden. Und die Mittagspause." },
      { n: "BERATER-FOLIE ZEIGEN", fx: "slides", t: "TEMPO", se: 1, p: 50, pp: 3, txt: "zeigt ihm eine Folie von McKinny: „Synergien heben“. Er bekommt Ausschlag. Am ganzen Tarifvertrag." },
      { n: "KAFFEEKASSE PRÜFEN", fx: "audit", t: "VERFAHREN", p: 40, pp: 4, txt: "verlangt Einsicht in die Kaffeekasse des Gremiums. Ungeprüft seit 1998. Er schwitzt." }],
    foe: [
      { n: "MITBESTIMMUNG", fx: "hand", p: 21, txt: "pocht auf MITBESTIMMUNG! Dein Fluchtplan ist zustimmungspflichtig. Abgelehnt. Mit Begründung. Vier Seiten." },
      { n: "FLUGBLATT-SALVE", fx: "paper", p: 7, multi: 3, txt: "verteilt FLUGBLÄTTER! „Bleib! Gemeinsam sind wir unterbesetzt!“" },
      { n: "FREISTELLUNG", fx: "drain", p: 14, drain: 1, txt: "nimmt sich FREISTELLUNG. Für Gremienarbeit. Er erholt sich. Deine Arbeit bleibt liegen. Bei dir." },
      { n: "TRILLERPFEIFE", fx: "rings", p: 13, acc: 1, txt: "bläst in die TRILLERPFEIFE! Griffbereit seit 1998. Deine Genauigkeit sinkt!" },
      { n: "„SOLIDARITÄT!“", fx: "up", buff: 1, txt: "ruft „SOLIDARITÄT!“ und meint damit: Du bleibst. Sein ANGRIFF steigt!" },
      { n: "ANTRAG ZUR GESCHÄFTSORDNUNG", fx: "paper", p: 10, stun: "Der Antrag zur Geschäftsordnung wird noch beraten. DU bist nicht dran.", txt: "stellt einen ANTRAG ZUR GESCHÄFTSORDNUNG. Der geht vor. Immer. Du setzt eine Runde aus!" },
      { n: "FACHFRAGE", quiz: true, txt: "fragt die Betriebsvereinbarung ab! Alle 214 Seiten!" }],
    sig: { fx: "storm", n: "WARNSTREIK", p: 9, multi: 3, txt: "ruft den WARNSTREIK aus! Alle streiken. Außer dir. Du machst jetzt alles allein!" } },
  botox: { type: "STERIL", quiz: "hygiene", arena: "steril", lvl: 81,
    intro: "Sie lächelt nie. Lächeln öffnet den Mund. Im Mund sind Keime.", ko: "„Ich … ich muss mich desinfizieren.“ Sie verschwindet in einer Wolke aus 70 % Ethanol.",
    my: [
      { n: "HAND GEBEN", fx: "hand", t: "KEIM", se: 1, p: 56, pp: 4, txt: "streckt ihr die Hand hin. Ohne Handschuh. Warm. Sie weicht zurück bis an die Wand." },
      { n: "NIESEN", fx: "cloud", t: "KEIM", se: 1, p: 48, pp: 4, txt: "niest. Ohne Ellenbeuge. Sie sieht die Tröpfchen in Zeitlupe. Jedes einzelne." },
      { n: "EHERING ZEIGEN", fx: "rings", t: "REGELBRUCH", p: 28, pp: 5, weaken: 1, txt: "zeigt den Ring. Am Finger. Im Dienst. Ihr linkes Auge zuckt. Ihr Angriff sinkt." },
      { n: "ABKLATSCHPROBE", fx: "lab", t: "DIAGNOSTIK", p: 46, pp: 3, txt: "hält ihr die Abklatschprobe ihres eigenen Bürotürgriffs hin. Es wächst. Es winkt." },
      { n: "KITTEL VON GESTERN", fx: "shield", t: "KEIM", p: 16, pp: 3, guard: 1, txt: "zieht den Kittel von gestern an. Sie kommt nicht näher als zwei Meter. Der nächste Treffer prallt halb ab." }],
    foe: [
      { n: "SCHWARZLICHT", fx: "scan", p: 20, txt: "leuchtet deine Hände mit SCHWARZLICHT ab! Es leuchtet. Überall. Sogar am Ellbogen. Peinlich." },
      { n: "DESINFEKTIONS-FONTÄNE", fx: "wave", p: 14, acc: 1, txt: "sprüht 3 Milliliter. Dann 30. Dann den ganzen Spender! Deine Augen tränen, deine Genauigkeit sinkt!" },
      { n: "„30 SEKUNDEN!“", fx: "needle", p: 10, stun: "DU desinfizierst noch die Hände. Sie zählt mit. Laut. Bei 29 fängt sie neu an.", txt: "zwingt dich zur HÄNDEDESINFEKTION. 30 Sekunden. Du setzt eine Runde aus!" },
      { n: "BEGEHUNGSPROTOKOLL", fx: "paper", p: 22, txt: "zückt das BEGEHUNGSPROTOKOLL! 41 Mängel. 40 davon bist du." },
      { n: "ISOLATION ANORDNEN", fx: "cast", p: 18, txt: "ordnet deine ISOLATION an! Vorsorglich. Mit Schild an der Stirn." },
      { n: "STERILE AURA", fx: "up", buff: 1, txt: "hüllt sich in eine STERILE AURA! Ihr ANGRIFF steigt. Die Keimzahl nicht." },
      { n: "FACHFRAGE", quiz: true, txt: "fragt den Hygieneplan ab! Mit Schwarzlicht im Gesicht!" }],
    sig: { fx: "paper", n: "KEIMZAHL-BERICHT", p: 9, multi: 3, txt: "verliest den KEIMZAHL-BERICHT deiner Tastatur! Drei Seiten! Jede tut weh!" } },
  ship: { type: "SCHRANKE", quiz: "rules", arena: "gate", lvl: 79,
    intro: "Pförtner seit 1979. An ihm ist noch nie jemand vorbeigekommen. Auch nicht der Notarzt.", ko: "„Na gut. Aber nur dieses eine Mal.“ Die Schranke hebt sich. Zum ersten Mal seit 1979 ohne Formular.",
    my: [
      { n: "„WIE WAR DAS 1979?“", fx: "bubbles", t: "NOSTALGIE", se: 1, p: 54, pp: 4, txt: "fragt: „Wie war das eigentlich 1979?“ Er erzählt. Er hört nicht mehr auf. Seine Deckung ist offen." },
      { n: "AUSWEIS VON 2019", fx: "paper", t: "PAPIER", p: 34, pp: 5, txt: "zeigt den abgelaufenen Ausweis. Er prüft ihn. Mit Lupe. Und mit einem Anruf. Das dauert." },
      { n: "„ICH BIN LIEFERANT“", fx: "pj", t: "LIST", p: 44, pp: 4, txt: "sagt: „Ich bin Lieferant.“ Er sucht die Lieferantenliste. Sie ist von 1994. Niemand steht mehr drauf." },
      { n: "SCHLÜSSEL KLIMPERN", fx: "screws", t: "LIST", p: 26, pp: 5, weaken: 1, txt: "klimpert mit dem Schlüsselbund. Drei Schlüssel. Er hat 214. Trotzdem: Er ist irritiert. Sein Angriff sinkt." },
      { n: "KUCHEN VOM STATIONSFEST", fx: "shield", t: "NOSTALGIE", se: 1, p: 22, pp: 3, guard: 1, txt: "stellt ihm Kuchen hin. Er kaut. Der nächste Treffer kommt mit vollem Mund und halber Kraft." }],
    foe: [
      { n: "SCHRANKE RUNTER", fx: "hammer", p: 23, txt: "lässt die SCHRANKE runter! Auf dich! „Die ist automatisch.“ Ist sie nicht." },
      { n: "BESUCHERSCHEIN", fx: "paper", p: 10, stun: "DU füllst den Besucherschein aus. Für dich selbst. In dreifacher Ausfertigung.", txt: "verlangt einen BESUCHERSCHEIN. Du setzt eine Runde aus!" },
      { n: "„DA KÖNNTE JA JEDER KOMMEN“", fx: "bubbles", p: 18, txt: "sagt: „DA KÖNNTE JA JEDER KOMMEN!“ Es könnte tatsächlich jeder kommen. Es will nur keiner." },
      { n: "SCHLÜSSELBUND-WIRBEL", fx: "screws", p: 7, multi: 3, txt: "wirbelt den SCHLÜSSELBUND! 214 Schlüssel! Keiner passt! Alle treffen!" },
      { n: "KREUZWORTRÄTSEL", fx: "drain", p: 12, drain: 1, txt: "löst in Ruhe sein KREUZWORTRÄTSEL. Fluss mit drei Buchstaben. Er erholt sich. Du alterst." },
      { n: "FUNKGERÄT", fx: "up", buff: 1, txt: "spricht ins FUNKGERÄT: „Pforte an alle.“ Niemand antwortet. Sein ANGRIFF steigt trotzdem!" },
      { n: "FACHFRAGE", quiz: true, txt: "fragt die Hausordnung ab! Auswendig! Rückwärts!" }],
    sig: { fx: "bubbles", n: "HAUSORDNUNG § 1–40", p: 7, multi: 4, txt: "verliest die HAUSORDNUNG! Paragraf 1 bis 40! Jeder einzelne trifft!" } },
  influ: { type: "GEHEIM", quiz: "rules", arena: "server", lvl: 84,
    intro: "Datenschutzbeauftragte. Ihr Gesicht ist verpixelt. Vorsorglich.", ko: "„Diese Niederlage … ist personenbezogen. Bitte löschen Sie sie.“ Sie schwärzt sich selbst.",
    my: [
      { n: "ALLEN ANTWORTEN", fx: "storm", t: "LECK", se: 1, p: 56, pp: 3, txt: "klickt auf ALLEN ANTWORTEN. 1.400 Empfänger. Mit Anhang. Sie schreit lautlos." },
      { n: "COOKIE-BANNER", fx: "slides", t: "LECK", p: 38, pp: 5, txt: "blendet ihr einen Cookie-Banner ein. Sie muss alle 214 Partner einzeln ablehnen. „Berechtigtes Interesse“ inklusive." },
      { n: "STATIONS-WHATSAPP", fx: "phone", t: "LECK", se: 1, p: 50, pp: 4, txt: "erwähnt die WhatsApp-Gruppe der Station. Mit Röntgenbildern. Und dem Chef. Sie bekommt Nasenbluten." },
      { n: "PASSWORT AM MONITOR", fx: "paper", t: "REGELBRUCH", p: 28, pp: 5, weaken: 1, txt: "zeigt auf den Zettel am Monitor: „Sommer2026!“ Ihre Knie werden weich. Ihr Angriff sinkt." },
      { n: "EINWILLIGUNG WIDERRUFEN", fx: "shield", t: "PARAGRAF", p: 18, pp: 3, guard: 1, txt: "widerruft die Einwilligung. In alles. Sie darf dich nicht mehr ansehen. Der nächste Treffer prallt halb ab." }],
    foe: [
      { n: "SCHWÄRZUNG", fx: "cloud", p: 13, acc: 1, txt: "SCHWÄRZT dein Sichtfeld! Zu deinem Schutz. Deine Genauigkeit sinkt!" },
      { n: "AUSKUNFTSERSUCHEN", fx: "paper", p: 20, txt: "stellt ein AUSKUNFTSERSUCHEN nach Art. 15! Frist: ein Monat. Sie meint: jetzt." },
      { n: "LÖSCHFRIST", fx: "drain", p: 24, txt: "löscht deine Überstunden. FRISTGERECHT. Unwiederbringlich. DSGVO-konform." },
      { n: "EINWILLIGUNG FEHLT", fx: "audit", p: 10, stun: "DU darfst dich nicht bewegen: Für diese Bewegung fehlt die Einwilligung.", txt: "stellt fest: Für deinen Angriff FEHLT DIE EINWILLIGUNG. Du setzt eine Runde aus!" },
      { n: "TOM-KATALOG", fx: "slides", p: 7, multi: 3, txt: "wirft mit technischen und organisatorischen Maßnahmen! Jede einzelne ist ein Ordner!" },
      { n: "VERSCHLÜSSELUNG", fx: "up", buff: 1, txt: "verschlüsselt sich. Ende-zu-Ende. Ihr ANGRIFF steigt. Glaubt man. Man kann es nicht lesen." },
      { n: "FACHFRAGE", quiz: true, txt: "fragt die DSGVO ab! Mit Erwägungsgründen!" }],
    sig: { fx: "audit", n: "BUSSGELDBESCHEID", p: 30, txt: "stellt einen BUSSGELDBESCHEID aus! 4 % deines Jahresumsatzes! Zum Glück ist das wenig. Es tut trotzdem weh." } },
};
/* boss music: a proper little chiptune. Bass, arpeggio, drums and a lead melody over two sections (Am F G Am | Dm Dm E E),
   one semitone up and faster once the boss is angry. */
let bossMus = null;
const NOTE = { A2: 110, C3: 130.8, D3: 146.8, E3: 164.8, F2: 87.3, G2: 98, E2: 82.4, D2: 73.4, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784, Gs5: 830.6, A5: 880, B5: 987.8, C6: 1046.5, D6: 1174.7, E6: 1318.5 };
const BM_CH = [[NOTE.A2, [NOTE.A4, NOTE.C5, NOTE.E5]], [NOTE.F2, [NOTE.A4, NOTE.C5, NOTE.F5]], [NOTE.G2, [NOTE.B4, NOTE.D5, NOTE.G5]], [NOTE.A2, [NOTE.A4, NOTE.C5, NOTE.E5]], [NOTE.D2, [NOTE.A4, NOTE.D5, NOTE.F5]], [NOTE.D2, [NOTE.A4, NOTE.D5, NOTE.F5]], [NOTE.E2, [NOTE.B4, NOTE.E5, NOTE.Gs5]], [NOTE.E2, [NOTE.B4, NOTE.E5, NOTE.Gs5]]];
const BM_LEAD = [
  [NOTE.A5, 0, 0, NOTE.E5, 0, 0, NOTE.A5, 0, NOTE.C6, 0, NOTE.B5, 0, NOTE.A5, 0, NOTE.E5, 0], [NOTE.F5, 0, 0, NOTE.A5, 0, 0, NOTE.C6, 0, NOTE.A5, 0, NOTE.F5, 0, NOTE.A5, 0, 0, 0],
  [NOTE.G5, 0, 0, NOTE.B5, 0, 0, NOTE.D6, 0, NOTE.B5, 0, NOTE.G5, 0, NOTE.D5, 0, NOTE.G5, 0], [NOTE.A5, 0, NOTE.E5, 0, NOTE.C5, 0, NOTE.E5, 0, NOTE.A5, 0, 0, 0, 0, 0, NOTE.E5, NOTE.A5],
  [NOTE.D6, 0, 0, NOTE.A5, 0, 0, NOTE.F5, 0, NOTE.A5, 0, NOTE.D6, 0, NOTE.F5, 0, NOTE.A5, 0], [NOTE.D6, 0, NOTE.C6, 0, NOTE.A5, 0, NOTE.F5, 0, NOTE.D5, 0, NOTE.F5, 0, NOTE.A5, 0, NOTE.D6, 0],
  [NOTE.E6, 0, 0, NOTE.B5, 0, 0, NOTE.Gs5, 0, NOTE.B5, 0, NOTE.E6, 0, NOTE.D6, 0, NOTE.B5, 0], [NOTE.E6, 0, NOTE.D6, 0, NOTE.B5, 0, NOTE.Gs5, 0, NOTE.E5, NOTE.Gs5, NOTE.B5, NOTE.E6, 0, 0, 0, 0]];
function bossMusic(on, fast) {
  if (bossMus) { clearInterval(bossMus.t); bossMus = null; }
  if (!on || !actx) return;
  let i = 0; const step = fast ? 108 : 135, up = fast ? 1.0595 : 1, d = step / 1000;
  bossMus = { t: setInterval(() => { const v = settings.mus ?? .7; if (v < .05) { i++; return; } const k = i % 16, bar = Math.floor(i / 16) % 8; i++;
    const [root, chord] = BM_CH[bar], lead = BM_LEAD[bar][k];
    tone(root * up * (k % 4 === 2 ? 2 : 1), 0, d * .9, "triangle", .07 * v);                       // bass: root, root, octave, root
    if (k % 2 === 1) tone(chord[(k >> 1) % 3] * up, 0, d * .5, "square", .010 * v);                  // arpeggio on the off-beats
    if (lead) { tone(lead * up, 0, d * 1.7, "square", .022 * v); tone(lead * up * 1.005, 0, d * 1.7, "square", .012 * v); } // lead, slightly detuned
    if (k % 8 === 0) { tone(120, 0, .12, "sine", .13 * v, 42); }                                     // kick
    if (k % 8 === 4) noise(0, .1, 1900, .8, .06 * v);                                                // snare
    if (k % 2 === 0) noise(0, .025, 9000, .6, .012 * v, "highpass");                                 // hat
    if (fast && k % 4 === 2) tone(120, 0, .09, "sine", .08 * v, 42);
  }, step) };
}
/* the orthopaedist's battle music: a cheesy gym groove, four on the floor, slap bass, brass stabs and a bragging brass riff */
let gymMus = null;
const GYM_RIFF = [NOTE.E5, 0, NOTE.E5, NOTE.G5, 0, NOTE.A5, 0, NOTE.G5, NOTE.E5, 0, NOTE.D5, 0, NOTE.E5, 0, 0, 0];
function gymMusic(on) {
  if (gymMus) { clearInterval(gymMus); gymMus = null; }
  if (!on || !actx) return;
  const bass = [82.4, 0, 82.4, 98, 0, 82.4, 110, 98, 73.4, 0, 73.4, 87.3, 0, 73.4, 98, 87.3]; let i = 0;
  gymMus = setInterval(() => { const v = settings.mus ?? .7, k = i % 16, bar = Math.floor(i / 16) % 4; i++; if (v < .05) return;
    if (k % 4 === 0) tone(110, 0, .12, "sine", .13 * v, 45);
    if (k % 8 === 4) { noise(0, .09, 1800, .9, .07 * v); noise(0, .05, 5000, .5, .03 * v, "highpass"); }   // clap
    if (bass[k]) tone(bass[k] * (bar === 3 ? 1.122 : 1), 0, .1, "square", .03 * v);
    if (k % 2 === 1) noise(0, .02, 8000, .7, .014 * v, "highpass");
    if ((k === 0 || k === 3 || k === 6) && bar % 2 === 0) [330, 415, 494].forEach((f, n) => tone(f, 0, .12, "sawtooth", (.02 - n * .003) * v));
    if (bar % 2 === 1 && GYM_RIFF[k]) { tone(GYM_RIFF[k] * (bar === 3 ? 1.122 : 1), 0, .13, "sawtooth", .02 * v); tone(GYM_RIFF[k] / 2 * (bar === 3 ? 1.122 : 1), 0, .13, "square", .012 * v); }
  }, 125);
}
// ---------- the battle ----------
function pokeBattle(e, done, o = {}) {
  const isBoss = !!o.boss, kit = isBoss ? BOSS_KIT[run.route] || BOSS_KIT.stay : null, foe = isBoss ? { lvl: kit.lvl, moves: kit.foe } : FOES.U;
  const ftype = isBoss ? kit.type : foe.type, qpool = QUIZ[isBoss ? kit.quiz : foe.quiz];
  const name = (e.name || "Gegner").toUpperCase(), kind = isBoss ? (e.def ? e.def.role.split(" · ")[0] : "Endgegner") : "Orthopäde";
  const MOVES = pickMoves(kit);
  const S = { me: isBoss ? Math.max(1, Math.round(run.energy)) : 100, foe: 100, foeAtk: 1, myAcc: 1, pp: MOVES.map(m => m.pp), jonas: true, over: false, busy: true, asked: new Set() }, sig = isBoss ? kit.sig : null;
  const ov = document.createElement("div"); ov.id = "battle"; if (isBoss) ov.classList.add("boss"); typeof track === "function" && track("battle", { boss: isBoss, foe: e.name || e.type, route: run && run.route });
  const fs = battleSprite(e.person.sp, false, "e" + e.name), ps = battleSprite(PLAYER_SP, true, "player");
  ov.innerHTML = `<div class="pb-field">
      <div class="pb-box foe"><b>${esc(name)}</b><span class="lv">Lv${foe.lvl}</span><div class="hp"><i>KP</i><div class="hpbar"><div class="hpfill"></div></div></div><small class="ty">${esc(ftype)}</small></div>
      <div class="pb-plat foe"></div><div class="pb-mon foe">${fs ? `<img src="${fs}" alt="">` : `<span>${esc(e.person && TYPES[e.type] ? TYPES[e.type].av : "💪")}</span>`}</div>
      <div class="pb-plat me"></div><div class="pb-mon me">${ps ? `<img src="${ps}" alt="">` : "<span>🧑‍⚕️</span>"}</div>
      <div class="pb-box me"><b>DU</b><span class="lv">Lv31</span><div class="hp"><i>KP</i><div class="hpbar"><div class="hpfill"></div></div></div><small class="num">100/100</small><div class="exp"><div></div></div></div>
    </div>
    <div class="pb-bottom"><div class="pb-text"></div><div class="pb-menu"></div></div>`;
  ov.classList.add(isBoss ? "arena-boss" : "arena-gym"); if (isBoss) ov.classList.add("arena-" + kit.arena);
  document.body.appendChild(ov); mode = "dialog"; fightOn = true; clearInputs(); if (!isBoss) gymMusic(true);
  const textEl = ov.querySelector(".pb-text"), menu = ov.querySelector(".pb-menu"), foeMon = ov.querySelector(".pb-mon.foe"), meMon = ov.querySelector(".pb-mon.me");
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let skip = false; ov.querySelector(".pb-text").addEventListener("pointerdown", () => { skip = true; });
  const say = async (t, hold = 650) => { skip = false; textEl.textContent = ""; for (let i = 0; i <= t.length; i += 2) { if (skip) { textEl.textContent = t; break; } textEl.textContent = t.slice(0, i); await sleep(16); } textEl.textContent = t; await sleep(skip ? 150 : hold); };
  const hpUi = () => {
    for (const [who, v] of [["foe", S.foe], ["me", S.me]]) { const f = ov.querySelector(`.pb-box.${who} .hpfill`); f.style.width = Math.max(0, v) + "%"; f.className = "hpfill " + (v > 50 ? "" : v > 20 ? "mid" : "low"); }
    const numEl = ov.querySelector(".pb-box.me .num"), from = +numEl.dataset.v || Math.round(S.me), to = Math.max(0, Math.round(S.me)), t0 = performance.now(); numEl.dataset.v = to;
    const tick = t => { const k = Math.min(1, (t - t0) / 600); numEl.textContent = Math.round(from + (to - from) * k) + "/100"; if (k < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  };
  // ---------- move animations: projectiles, rings, sparkles, stat arrows, all flying across the field ----------
  const field = ov.querySelector(".pb-field");
  const ctr = el => { const f = field.getBoundingClientRect(), r = el.getBoundingClientRect(); return [r.left - f.left + r.width / 2, r.top - f.top + r.height * .55, r.width]; };
  const spawn = (html, x, y, cls = "") => { const d = document.createElement("div"); d.className = "pb-fx " + cls; d.innerHTML = html; d.style.left = x + "px"; d.style.top = y + "px"; field.appendChild(d); return d; };
  const fly = (html, a, b, ms, delay = 0, arc = 60, spin = 0, size = 1) => new Promise(res => setTimeout(() => {
    const d = spawn(html, a[0], a[1]); d.style.fontSize = 34 * size + "px";
    const dx = b[0] - a[0], dy = b[1] - a[1];
    d.animate([{ transform: "translate(-50%,-50%) scale(.6) rotate(0deg)", opacity: 0 }, { transform: `translate(calc(-50% + ${dx * .5}px), calc(-50% + ${dy * .5 - arc}px)) scale(1.1) rotate(${spin / 2}deg)`, opacity: 1, offset: .5 }, { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${spin}deg)`, opacity: 1 }], { duration: ms, easing: "ease-in" }).onfinish = () => { d.remove(); res(); };
  }, delay));
  const burst = (html, c, n, spread, ms) => Promise.all(Array.from({ length: n }, (_, i) => new Promise(res => setTimeout(() => {
    const d = spawn(html, c[0] + (Math.random() - .5) * spread, c[1] + (Math.random() - .5) * spread * .6); d.style.fontSize = "26px";
    d.animate([{ transform: "translate(-50%,-50%) scale(0)", opacity: 1 }, { transform: "translate(-50%,-90%) scale(1.2)", opacity: 1, offset: .4 }, { transform: "translate(-50%,-170%) scale(.8)", opacity: 0 }], { duration: ms, easing: "ease-out" }).onfinish = () => { d.remove(); res(); };
  }, i * 90))));
  const arrows = (who, up) => { const mon = who === "foe" ? foeMon : meMon; mon.classList.remove("statup", "statdown"); void mon.offsetWidth; mon.classList.add(up ? "statup" : "statdown"); tone(up ? 500 : 700, 0, .4, "square", .03, up ? 1000 : 300); return burst(up ? '<b class="arr up">▲</b>' : '<b class="arr down">▼</b>', ctr(mon), 6, ctr(mon)[2] * .7, 800); };
  const flashField = color => { const d = spawn("", 0, 0, "flash"); d.style.background = color; d.animate([{ opacity: .85 }, { opacity: 0 }], { duration: 380 }).onfinish = () => d.remove(); };
  async function fx(kind, from) {
    if (!kind) return;
    const A = ctr(from === "foe" ? foeMon : meMon), B = ctr(from === "foe" ? meMon : foeMon);
    const volley = (e, n, gap, ms, arc, spin, size) => Promise.all(Array.from({ length: n }, (_, i) => fly(e, A, B, ms, i * gap, arc, spin, size)));
    if (kind === "scan") { flashField("rgba(120,180,255,.5)"); await burst("🩻", B, 1, 0, 600); await burst("📉", B, 4, B[2] * .7, 600); }
    else if (kind === "legs") { await burst("🦵", B, 2, B[2] * .5, 500); await burst("🐔", B, 3, B[2] * .8, 700); }
    else if (kind === "lab") { await volley("🧪", 2, 140, 480, 60, 360, 1.2); flashField("rgba(255,230,120,.5)"); await burst("📈", B, 3, B[2] * .6, 500); }
    else if (kind === "xray") { await volley("🩻", 1, 0, 520, 50, 540, 1.6); await burst("🙃", B, 3, B[2] * .6, 600); }
    else if (kind === "pill") { await volley("💊", 4, 90, 420, 70, 360, 1); await burst("🧘", B, 1, 0, 600); }
    else if (kind === "hide") { await burst("🥤", B, 1, 0, 400); await volley("🧊", 3, 100, 450, 40, 0, 1); await burst("😰", B, 3, B[2] * .6, 500); }
    else if (kind === "ekg") { tone(990, 0, .1, "sine", .04); tone(990, .3, .1, "sine", .04); await volley("📈", 2, 120, 450, 30, 0, 1.2); await burst("😱", B, 1, 0, 500); }
    else if (kind === "cast") { await volley("🦴", 1, 0, 500, 60, 360, 1.4); await burst("🧱", B, 4, B[2] * .5, 600); }
    else if (kind === "screws") { await volley("🔩", 3, 90, 380, 40, 720, 1); }
    else if (kind === "hand") { await volley("✋", 1, 0, 380, 30, 0, 2); flashField("rgba(255,255,255,.7)"); }
    else if (kind === "law") { flashField("rgba(255,255,255,.6)"); await volley("§", 5, 90, 460, 60, 0, 1.6); tone(330, 0, .3, "square", .04, 660); }
    else if (kind === "shield") { await burst("🛡️", A, 1, 0, 700); await burst("🕗", A, 4, A[2] * .6, 600); }
    else if (kind === "pj") { await volley("🥺", 1, 0, 600, 40, 0, 1.6); await burst("❓", B, 5, B[2] * .7, 600); }
    else if (kind === "phone") { tone(880, 0, .12, "square", .04); tone(880, .25, .12, "square", .04); await volley("📞", 1, 0, 600, 90, 0, 1.6); await burst("✊", B, 5, B[2] * .8, 700); }
    else if (kind === "heart") { await volley("💖", 3, 120, 700, 60, 0, 1); await burst("💨", B, 3, B[2] * .4, 400); }
    else if (kind === "pen") { await volley("🖊️", 3, 110, 440, 60, 720, 1.1); await burst("😱", B, 2, B[2] * .5, 500); }
    else if (kind === "paper") { noise(0, .4, 3000, .8, .05); await volley("📄", 4, 110, 480, 70, 540); }
    else if (kind === "quiz") { flashField("rgba(255,240,120,.6)"); tone(1200, 0, .08, "square", .04); await burst("❓", B, 6, B[2] * .8, 700); }
    else if (kind === "rings") { await Promise.all([0, 1, 2].map(i => new Promise(res => setTimeout(() => { const d = spawn("", A[0], A[1] - 30, "ring"); d.animate([{ transform: "translate(-50%,-50%) scale(.3)", opacity: 1 }, { transform: `translate(calc(-50% + ${B[0] - A[0]}px), calc(-50% + ${B[1] - A[1]}px)) scale(1.6)`, opacity: .2 }], { duration: 650, easing: "ease-out" }).onfinish = () => { d.remove(); res(); }; tone(300 - i * 40, 0, .3, "sine", .04); }, i * 160)))); }
    else if (kind === "coffee") { await burst("☕", A, 1, 0, 700); await burst("✨", A, 7, A[2] * .8, 800); }
    else if (kind === "hammer") { await volley("🔨", 1, 0, 420, 120, 720, 1.5); flashField("rgba(255,255,255,.6)"); }
    else if (kind === "flex") { await burst("💪", A, 3, A[2] * .6, 600); }
    else if (kind === "cloud") { await volley("☁️", 3, 140, 650, 20, 0, 1.4); }
    else if (kind === "calendar") { await volley("📅", 3, 140, 520, 60, 360, 1.1); }
    else if (kind === "bubbles") { await volley("💬", 5, 100, 560, 30, 0, .9); }
    else if (kind === "up") { await burst("🤝", A, 2, A[2] * .5, 600); }
    else if (kind === "drain") { await Promise.all(Array.from({ length: 5 }, (_, i) => fly('<b class="orb"></b>', B, A, 600, i * 110, 40, 0, .8))); }
    else if (kind === "audit") { await volley("⚖️", 2, 160, 520, 80, 0, 1.3); await burst("📎", B, 5, B[2] * .7, 600); }
    else if (kind === "slides") { await volley("📊", 6, 70, 420, 50, 200, .9); }
    else if (kind === "needle") { await volley("💉", 3, 120, 380, 10, 0, 1.1); flashField("rgba(255,180,220,.5)"); }
    else if (kind === "wave") { const d = spawn("🌊🌊🌊", field.clientWidth + 60, B[1], "wave"); d.animate([{ transform: "translate(0,-50%)" }, { transform: `translate(${-field.clientWidth - 260}px,-50%)` }], { duration: 900, easing: "ease-in-out" }).onfinish = () => d.remove(); noise(0, .9, 500, .6, .1, "lowpass"); await sleep(800); }
    else if (kind === "storm") { await Promise.all(["👎", "💩", "💬", "👎", "😡", "💬", "👎"].map((e, i) => fly(e, [field.clientWidth * Math.random(), -20], B, 500, i * 70, 0, 360, .9))); }
  }
  const pop = (who, txt, cls) => { const c = ctr(who === "foe" ? foeMon : meMon); const d = spawn(`<b>${txt}</b>`, c[0] + (Math.random() - .5) * 30, c[1] - 30, "dmg " + (cls || "")); d.animate([{ transform: "translate(-50%,-50%) scale(.6)", opacity: 0 }, { transform: "translate(-50%,-80%) scale(1.25)", opacity: 1, offset: .2 }, { transform: "translate(-50%,-260%) scale(1)", opacity: 0 }], { duration: 1100, easing: "ease-out" }).onfinish = () => d.remove(); };
  const callout = (txt, foeSide) => { const d = document.createElement("div"); d.className = "pb-call" + (foeSide ? " foe" : ""); d.innerHTML = `<b>${esc(txt)}</b>`; ov.appendChild(d); setTimeout(() => d.remove(), 1200); };
  const hit = (who, dmg) => { if (dmg > 0) pop(who, "−" + dmg, dmg >= 25 ? "big" : ""); const mon = who === "foe" ? foeMon : meMon; mon.classList.remove("hit"); void mon.offsetWidth; mon.classList.add("hit"); sfx.knock(); if (dmg >= 25) { ov.classList.remove("shake"); void ov.offsetWidth; ov.classList.add("shake"); } if (who === "foe") S.foe -= dmg; else S.me -= dmg; hpUi(); };
  const lunge = who => { const mon = who === "foe" ? foeMon : meMon; mon.classList.remove("lunge"); void mon.offsetWidth; mon.classList.add("lunge"); };
  const quiz = (pool) => new Promise(res => {
    let fresh = pool.filter((_, i) => !S.asked.has(i)); if (!fresh.length) { S.asked.clear(); fresh = pool; }
    const q = pick(fresh); S.asked.add(pool.indexOf(q));
    const order = q.o.map((t, i) => i).sort(() => Math.random() - .5);
    const qb = document.createElement("div"); qb.className = "pb-quiz";
    qb.innerHTML = `<b>${esc(q.q)}</b>` + order.map(i => `<button type="button" data-i="${i}">${esc(q.o[i])}</button>`).join("");
    ov.appendChild(qb);
    qb.addEventListener("click", ev => { const b = ev.target.closest("button"); if (!b) return; const ok = +b.dataset.i === q.a; b.classList.add(ok ? "ok" : "bad"); if (!ok) qb.querySelector(`[data-i="${q.a}"]`).classList.add("ok"); sfx[ok ? "ding" : "knock"](); setTimeout(() => { qb.remove(); res(ok); }, 900); });
  });
  const showMenu = () => {
    S.busy = false; textEl.textContent = "Was soll DU tun?";
    menu.innerHTML = `<button type="button" data-m="fight">KAMPF</button><button type="button" data-m="bag">KITTELTASCHE</button><button type="button" data-m="mates">KOLLEGEN</button><button type="button" data-m="run">FLUCHT</button>`;
  };
  const showMoves = () => {
    const ult = isBoss && S.foe <= 35 && !S.ultUsed ? `<button type="button" class="ult" data-ult="1"><b>KÜNDIGUNG</b><small>EINMALIG · ENDGÜLTIG ★★★</small></button>` : "";
    menu.innerHTML = ult + MOVES.map((m, i) => `<button type="button" data-mv="${i}" ${S.pp[i] ? "" : "disabled"}><b>${m.n}</b><small>AP ${S.pp[i]}/${m.pp} · ${m.t}${m.se ? " ★" : ""}</small></button>`).join("") + `<button type="button" class="back" data-m="back">◀ ZURÜCK</button>`;
  };
  /* the coat pocket: everything that gives energy in the corridors gives KP here (same numbers), plus two tricks. And there is always one old glucose tablet. */
  const HEALS = { "1": 35, "0": 55, "$": 30, "+": 75, "6": 25 };
  const bagItems = () => [["1", "KAFFEE"], ["0", "ENERGYDRINK"], ["$", "DONUT"], ["+", "WUNDERCREME"], ["6", "PROTEINSHAKE"], ["3", "DESINFEKTION"], ["f", "FAKE-TELEFONAT"]].filter(([k]) => hasItem(k));
  const bagHint = k => k === "6" && !isBoss ? "Er gibt sofort auf" : HEALS[k] ? `+${HEALS[k]} KP` : k === "3" ? "Angriff sinkt" : isBoss ? "wirkt hier nicht" : "Flucht klappt sicher";
  const showBag = () => {
    const items = bagItems();
    menu.innerHTML = items.map(([k, n]) => `<button type="button" data-it="${k}"><b>${ITEMS[k].emoji} ${n}</b><small>${bagHint(k)} · ×${run.inv[k]}</small></button>`).join("")
      + (S.sugar ? "" : `<button type="button" data-it="sugar"><b>🍬 TRAUBENZUCKER</b><small>+15 KP · von 2021</small></button>`)
      + (!items.length && S.sugar ? `<button type="button" disabled><b>LEER</b><small>Nur Fusseln und ein Kassenbon</small></button>` : "") + `<button type="button" class="back" data-m="back">◀ ZURÜCK</button>`;
    textEl.textContent = "KITTELTASCHE: Was Energie gibt, gibt hier KP.";
  };
  menu.addEventListener("click", async ev => {
    const b = ev.target.closest("button"); if (!b || S.busy || S.over) return;
    if (b.dataset.m === "fight") return showMoves();
    if (b.dataset.m === "bag") return showBag();
    if (b.dataset.m === "back") return showMenu();
    S.busy = true; menu.innerHTML = "";
    if (S.stunned) { const t = S.stunned; S.stunned = false; await say(typeof t === "string" ? t : "DU kannst dich nicht bewegen!"); }
    else if (b.dataset.ult) await ultimate();
    else if (b.dataset.mv != null) await myMove(+b.dataset.mv);
    else if (b.dataset.it) await useBag(b.dataset.it);
    else if (b.dataset.m === "mates") await jonas();
    else if (b.dataset.m === "run") { if (await flee()) return; }
    if (S.over) return;
    if (S.foe <= 0) return win();
    await foeTurn();
    if (S.me <= 0) return lose();
    showMenu();
  });
  async function myMove(i) {
    const m = MOVES[i]; S.pp[i]--;
    callout(m.n, false); await say(`DU setzt ${m.n} ein!`, 350); lunge("me"); await fx(m.fx, "me");
    if (m.heal) { S.me = Math.min(100, S.me + m.heal); hpUi(); pop("me", "+" + m.heal, "heal"); sfx.spa(); await say(`DU ${m.txt} KP +${m.heal}!`); return; }
    if (m.weaken) { S.foeAtk *= .85; }
    if (m.guard) { S.guard = true; }
    if (Math.random() > .92 * S.myAcc && !m.quiz) { await say("Die Attacke ging daneben!"); return; }
    let mult = m.se ? 1.6 : m.weak ? .6 : 1, crit = false;
    if (m.quiz) { await say(`DU ${m.txt} Wenn er sie nicht kann, sitzt sie.`, 300); const ok = await quiz(qpool); if (!ok) { await say("Falsch! Er lacht. Die Attacke verpufft."); return; } crit = true; }
    else crit = Math.random() < .1;
    const dmg = Math.round(m.p * mult * (crit ? 1.5 : 1) * (.85 + Math.random() * .3) * .55 * (isBoss ? .8 : 1));
    hit("foe", dmg);
    if (!m.quiz) await say(`DU ${m.txt}`, 500);
    if (m.weaken) { await arrows("foe", false); await say(`Der ANGRIFF von ${name} sinkt!`, 450); }
    if (crit) await say("Volltreffer!", 500);
    if (mult > 1) { flashField("rgba(255,255,255,.7)"); await say(pick(["Es ist sehr effektiv!", "Es ist sehr effektiv! Das Controlling notiert einen Mehrerlös.", "Sehr effektiv! Irgendwo weint eine Kostenstelle."]), 500); } else if (mult < 1) await say(pick(["Es ist nicht sehr effektiv …", "Nicht sehr effektiv. Wie die letzte Umstrukturierung."]), 500);
  }
  async function useBag(k) {
    if (k === "sugar") { S.sugar = true; await fx("coffee", "me"); S.me = Math.min(100, S.me + 15); hpUi(); pop("me", "+15", "heal"); sfx.spa(); await say("DU findest TRAUBENZUCKER in der Kitteltasche. Von 2021. Leicht pelzig. KP +15!"); return; }
    takeItem(k); const it = ITEMS[k];
    if (k === "6" && !isBoss) { await say(`DU gibst ${name} einen PROTEINSHAKE.`); await say(`${name} trinkt ihn in einem Zug. „Vanille. Respekt.“ Er will nicht mehr kämpfen!`); S.foe = 0; hpUi(); return; }
    if (k === "3") { await say("DU sprühst DESINFEKTIONSMITTEL! Er reibt sich die Augen."); S.foeAtk *= .7; await say(`Der ANGRIFF von ${name} sinkt!`); return; }
    if (k === "f") { await say("DU täuschst ein wichtiges Telefonat vor. „Ja, Herr Professor …“"); if (isBoss) { await say(`${name} wartet höflich. Dann nicht mehr. Vor einem Endkampf hilft kein Telefonat.`); return; } S.fakeEscape = true; await say("Beim nächsten Fluchtversuch klappt es sicher!"); return; }
    const heal = HEALS[k] || 20; await fx("coffee", "me"); S.me = Math.min(100, S.me + heal); hpUi(); pop("me", "+" + heal, "heal"); sfx.spa();
    await say(`DU ${{ "1": "trinkst den KAFFEE. Er ist kalt. Er wirkt trotzdem.", "0": "kippst den ENERGYDRINK. Dein Herz macht ein Geräusch.", "$": "isst den DONUT vom Pharmavertreter. Ethisch fragwürdig, kalorisch eindeutig.", "+": "cremst dich mit WUNDERCREME ein. Du glänzt. Auch innerlich.", "6": "trinkst den PROTEINSHAKE. Vanille. Dein Bizeps meldet sich zum ersten Mal." }[k] || "benutzt " + it.name.toUpperCase() + "."} KP +${heal}!`);
  }
  async function jonas() {
    if (!S.jonas) { await say("Jonas ist schon besiegt. Er liegt im Bereitschaftsraum und weint."); return; }
    S.jonas = false; await say("Jonas, ich wähle dich!"); await say("Jonas, der PJler, springt dazwischen. Er hat 0 € und 100 % Motivation."); S.shield = true;
  }
  async function flee() {
    if (isBoss) { await say("Vor einem Endkampf kann man nicht fliehen! Hinter dir ist nur die Klinik."); return false; }
    if (S.fakeEscape || Math.random() < .45) { await say("Du bist entkommen!"); finish(false, true); return true; }
    await say(isBoss ? `Du kannst nicht fliehen! ${name} steht in der Tür.` : "Du kannst nicht fliehen! Er versperrt den Flur. Mit Bizeps."); return false;
  }
  async function ultimate() {
    S.ultUsed = true; await say("DU greifst in die Kitteltasche. Ein Umschlag. Unterschrieben.", 500);
    const fx = document.createElement("div"); fx.className = "pb-ult"; fx.innerHTML = "<b>📝 KÜNDIGUNG!</b>"; ov.appendChild(fx); sfx.slam(); tone(220, 0, .5, "sawtooth", .06, 880);
    ov.classList.add("shake"); await sleep(900); fx.remove(); ov.classList.remove("shake");
    hit("foe", 48); await say(`${name} liest den Brief. Die Hände zittern. „Aber … der Dienstplan …“`, 600); await say("Ein kritischer Treffer! Es ist SEHR effektiv!", 500);
  }
  async function rage() {
    S.phase2 = true; ov.classList.add("rage"); bossMusic(true, true); sfx.stinger(); ov.classList.add("shake"); setTimeout(() => ov.classList.remove("shake"), 600);
    await say(`${name} ist wütend! Die Neonröhren flackern rot.`, 600); S.foeAtk *= 1.2; await say(`Der ANGRIFF von ${name} steigt! Jetzt wird es ernst.`, 500);
  }
  async function foeTurn(again) {
    if (isBoss && !S.phase2 && S.foe <= 50) await rage();
    if (isBoss && (S.phase2 ? Math.random() < .4 : Math.random() < .15)) {
      await say(`${name} setzt ${sig.n} ein! ${name} ${sig.txt}`, 500); lunge("foe"); await fx(sig.fx, "foe");
      if (S.shield) { S.shield = false; await say("Jonas wirft sich in den Weg. Jonas ist besiegt! Respekt, Jonas."); }
      else { for (let h = 0; h < (sig.multi || 1); h++) { hit("me", Math.round(sig.p * S.foeAtk * (settings.diff === "easy" ? .75 : 1))); await sleep(260); if (S.me <= 0) break; } if (sig.multi) await say(`${sig.multi} Treffer!`, 400); }
      if (sig.acc) S.myAcc *= .8; if (sig.stun) S.stunned = sig.stun;
    } else await foeMove();
    if (isBoss && S.phase2 && !again && S.me > 0 && Math.random() < .25) { await say(`${name} ist so wütend, dass er gleich nochmal angreift!`, 400); await foeTurn(true); }
  }
  async function foeMove() {
    const mv = Math.random() < .25 ? foe.moves.find(m => m.quiz) : pick(foe.moves.filter(m => !m.quiz || Math.random() < .3));
    callout(mv.n, true); await say(`${name} ${mv.txt}`, 450); lunge("foe"); await fx(mv.fx, "foe");
    if (mv.buff) { S.foeAtk *= 1.3; await arrows("foe", true); return; }
    if (mv.debuff) { S.myAcc *= .8; await arrows("me", false); return; }
    if (mv.quiz) { const ok = await quiz(qpool); if (ok) { await say(`Richtig! ${name} ist verwirrt. Er trifft sich selbst!`); hit("foe", 10); } else { if (S.shield) { S.shield = false; await say("Jonas wirft sich dazwischen und beantwortet sie falsch. Jonas ist besiegt!"); return; } hit("me", 22); await say("Falsch! Die Blamage tut weh. Sehr effektiv!"); } return; }
    if (S.shield) { S.shield = false; await say(`Jonas fängt den Treffer ab! Jonas ist besiegt! Er war sowieso unterbezahlt.`); return; }
    if (mv.zero) { await say(pick(["Es ist nicht sehr effektiv …", "Es ist überhaupt nicht effektiv. Wie immer.", "Du fühlst dich wertgeschätzt. Für 0,3 Sekunden."]), 600); return; }
    if (mv.stun) S.stunned = mv.stun;
    if (mv.multi) { for (let h = 0; h < mv.multi; h++) { hit("me", Math.round(mv.p * S.foeAtk * (settings.diff === "easy" ? .75 : 1))); await sleep(240); if (S.me <= 0) break; } await say(`${mv.multi} Treffer!`, 400); return; }
    const dmg = Math.round(mv.p * (S.guard ? .5 : 1) * S.foeAtk * (settings.diff === "easy" ? .75 : 1) * (.85 + Math.random() * .3));
    hit("me", dmg); if (S.guard) { S.guard = false; await say("Die Hälfte prallt ab. Der Rest ist nicht dein Problem.", 450); } else if (dmg > 25) await say("Ein Volltreffer!", 450);
    if (mv.acc) { S.myAcc *= .85; await arrows("me", false); }
    if (mv.drain) { S.foe = Math.min(100, S.foe + Math.round(dmg / 2)); hpUi(); sfx.spa(); await say(`${name} erholt sich um ${Math.round(dmg / 2)} KP!`, 450); }
  }
  async function win() {
    gymMusic(false); tone(520, 0, .5, "sawtooth", .05, 120); foeMon.classList.add("faint"); setTimeout(() => sfx.ding(), 500);
    if (isBoss) { bossMusic(false); const ko = document.createElement("div"); ko.className = "pb-ko"; ko.innerHTML = "<b>K.O.!</b><small>Du bist frei.</small>"; ov.appendChild(ko); [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .14, .3, "square", .05)); tone(1047, .6, .9, "triangle", .06); await sleep(1600); }
    await say(`${name} wurde besiegt!`); if (isBoss) await say(kit.ko, 900);
    const exp = ov.querySelector(".pb-box.me .exp div"); if (exp) { exp.style.transition = "width 1.2s ease-out"; exp.style.width = "100%"; tone(880, 0, 1.1, "sine", .03, 1760); await sleep(1250); exp.style.transition = "none"; exp.style.width = "8%"; ov.querySelector(".pb-box.me .lv").textContent = "Lv32"; [659, 784, 1047].forEach((f, i) => tone(f, i * .12, .2, "square", .04)); await say("DU erreicht Lv32! Dein Gehalt steigt um 0 €.", 700); } await say(`DU erhältst ${isBoss ? 300 : 120} EP! Sie werden als Überstunden erfasst. Und verfallen am 31. März.`, 900); finish(true); }
  async function lose() { bossMusic(false); gymMusic(false); meMon.classList.add("faint"); await say("DU bist besiegt …"); await say(pick(["DU hast alles Geld fallen gelassen. Du hattest keins. Er nimmt deinen Kugelschreiber.", "DU wirst ins Arztzimmer getragen. Dort wartet schon der nächste Dienst.", "DU bist besiegt. Die Personalabteilung nennt das „Lernerfahrung“."]), 900); finish(false); }
  function finish(ok, fled) { if (S.over) return; S.over = true; gymMusic(false); typeof track === "function" && track("battle_end", { boss: isBoss, ok: !!ok, fled: !!fled, kp: Math.round(S.me) }); bossMusic(false); ov.remove(); fightOn = false; run.energy = isBoss ? (ok ? Math.max(1, Math.round(S.me)) : 0) : Math.max(1, run.energy - (ok ? 5 : fled ? 8 : 10)); energyHit(); done(ok, fled); }
  ov.cheat = () => { S.foe = 0; hpUi(); win(); };
  hpUi();
  (async () => {
    if (isBoss) { // the versus screen: both slide in, ENDKAMPF, flash, music
      const vs = document.createElement("div"); vs.className = "pb-vs";
      vs.innerHTML = `<div class="vs-me">${ps ? `<img src="${ps}" alt="">` : "🧑‍⚕️"}<b>DU</b></div><div class="vs-mid"><small>ENDKAMPF</small><b>VS</b></div><div class="vs-foe">${fs ? `<img src="${fs}" alt="">` : esc(e.def ? e.def.av : "👔")}<b>${esc(name)}</b><small>${esc(e.def ? e.def.role : kind)}</small></div>`;
      ov.appendChild(vs); sfx.slam(); setTimeout(() => sfx.stinger(), 300); bossMusic(true, false); await sleep(2600); vs.classList.add("out"); await sleep(400); vs.remove();
    }
    foeMon.classList.add("enter"); ov.querySelector(".pb-plat.foe").classList.add("enter"); ov.querySelector(".pb-plat.me").classList.add("enter"); meMon.classList.add("hidden");
    await say(isBoss ? `ENDKAMPF! ${name} versperrt dir den Weg in die Freiheit!` : pick([`Ein wilder ${kind.toUpperCase()} erscheint! Er hat „nur eine kurze Frage“.`, `Ein wilder ${kind.toUpperCase()} versperrt den Flur! Zwischen zwei Sätzen Bizeps.`, `Ein wilder ${kind.toUpperCase()} erscheint! Er riecht nach Proteinshake und Überlegenheit.`]), 700);
    if (isBoss) await say(kit.intro, 700);
    if (isBoss) await say(`Deine KP sind deine Energie: ${Math.round(S.me)} von 100. Wer vorher viel verloren hat, hat jetzt wenig.`, 600);
    if (isBoss) await say(`Hinter ${name} wartet ${mission().ride}. Der Dienstplan sagt: Los, DU!`, 500); else await say(pick(["Der Dienstplan sagt: Los, DU!", "Niemand sonst ist da. Los, DU!", "Laut Dienstplan bist DU dran. Wie immer."]), 400);
    { const m = ctr(meMon); const ball = spawn('<b class="ball">📋</b>', -20, m[1] + 40); tone(600, 0, .25, "square", .03, 300); noise(0, .3, 2500, .8, .04);
      await new Promise(res => { ball.animate([{ transform: "translate(-50%,-50%) rotate(0)" }, { transform: `translate(calc(-50% + ${(m[0] + 20) * .5}px), calc(-50% - 120px)) rotate(360deg)`, offset: .5 }, { transform: `translate(calc(-50% + ${m[0] + 20}px), calc(-50% - 40px)) rotate(720deg)` }], { duration: 650, easing: "ease-out" }).onfinish = () => { ball.remove(); res(); }; });
      const fl = spawn("", m[0], m[1] - 40, "pop"); fl.animate([{ transform: "translate(-50%,-50%) scale(.1)", opacity: 1 }, { transform: "translate(-50%,-50%) scale(3)", opacity: 0 }], { duration: 450 }).onfinish = () => fl.remove();
      tone(1100, 0, .15, "triangle", .05); meMon.classList.remove("hidden"); meMon.classList.add("popin"); await sleep(450); }
    showMenu(); })();
}
// the old reflex arena is gone: every fight is a battle now
function fightGame(e, done, o) { pokeBattle(e, done, o); }
