/* Hospital Escape 3D · game data (levels, people, items, dialogue content). Shared globals, loaded before world/level/game. */
const S = 3, WALL_H = 3.2, EYE = 1.62, SHIFT_END = 17 * 60;
const PLAYER_R = .22, PLAYER_SPEED = 2.15;

const rnd = a => a[Math.floor(Math.random() * a.length)];
const pick = rnd;
const chance = p => Math.random() < p;
const SKIN = [0xf1c9a5, 0xe0ac7e, 0xc68863, 0x8d5a3b, 0xf6d7bd, 0xb98058];
const HAIR = [0x2b1d14, 0x5a3a22, 0x9a6b3f, 0xd9b26c, 0x1b1b1b, 0x8c8c8c, 0xb5462a];

/* Map legend
   # wall · H secret door · X rubble · B corridor bed · T desk · M vending machine · L locker · Y gurney · G fuse box · v whiteboard · m MRT
   W spa lounger · a parked car · = barrier · j your car · t ticket machine · w laundry cart · o puddle · z sparking cable · u leaking bucket
   % ambulance · y ventilation switch · | treatment bay with curtain · f/" stinking corridor/room
   S start · E stairwell (dead end) · r REA spot · ~ spawn point (ER) · x lab printout
   : room floor · _ safe room floor · d door (openable) · l locked door · ^ elevator (in a wall) · K furniture block
   hostile: P patient · F relatives · N nurse · O attending · C chief · V controlling · I internist nerd · U bouncer · A radiologist
            n gastroenterologist · Z pseudo-emergency · D Dr. PD Phil · g ghost · q moving car
   friendly: k Dr. Kurz · b Frau Bozkurt · h caretaker · s PJ student · e Dr. Glatt · i influencer
   items: 1 coffee · 2 clipboard · 3 disinfectant · 4 airplane pager · 5 PA mic · 6 protein shake · 7 case report · 8 calculator
          9 battery · 0 energy drink · $ donut · + cream · & reference letter */

const ENV = {
  ward:  { theme: "ward", fog: 0xcbd8d1, near: 5, far: 30, hemi: .55, amb: .25, dir: .3, flicker: .1, broken: .06, creep: 2, lamp: 0xfdfdf6, storm: true },
  ortho: { theme: "ortho", fog: 0xc4d0d8, near: 5, far: 30, hemi: .55, amb: .26, dir: .3, flicker: .1, broken: .1, creep: 1, lamp: 0xfdfdf6, storm: true },
  radio: { theme: "radio", fog: 0x040607, near: 1, far: 11, hemi: .05, amb: .035, dir: 0, flicker: .25, broken: .5, creep: 0, lamp: 0x2a2d2b, dark: true, storm: true },
  derma: { theme: "derma", fog: 0xf0e2d2, near: 6, far: 32, hemi: .7, amb: .35, dir: .3, flicker: 0, broken: 0, creep: 0, lamp: 0xfff1d6 },
  cellar:{ theme: "cellar", fog: 0x070b0a, near: 1.2, far: 12, hemi: .08, amb: .05, dir: 0, flicker: .45, broken: .35, creep: 0, lamp: 0x2a2d2b, dark: true },
  cellarOn: { theme: "cellar", fog: 0x18221f, near: 2.5, far: 19, hemi: .3, amb: .16, dir: .08, flicker: .3, broken: .35, creep: 2, lamp: 0xe8f0e8, dark: true },
  gastro:{ theme: "gastro", fog: 0xb8c4a0, near: 4, far: 26, hemi: .52, amb: .25, dir: .25, flicker: .12, broken: .08, creep: 1, lamp: 0xf4f6e0 },
  er:    { theme: "er", fog: 0xd2d9d0, near: 5, far: 30, hemi: .58, amb: .27, dir: .3, flicker: .12, broken: .08, creep: 1, lamp: 0xfdfdf6, storm: true },
  icu:   { theme: "ward", fog: 0xc8d8de, near: 5, far: 28, hemi: .6, amb: .28, dir: .3, flicker: .06, broken: .04, creep: 1, lamp: 0xf4fbff },
  park:  { theme: "park", fog: 0x1d1a14, near: 3, far: 24, hemi: .28, amb: .16, dir: .05, flicker: .25, broken: .15, creep: 2, lamp: 0xffb35a },
};

const LEVELS = [
  { key: "innere", short: "5B · INNERE", name: "Station 5B · Innere Medizin", floor: "5. OG", room: 5, env: "ward",
    safeNames: [["ARZTZIMMER 5B", "Bitte nicht stören (stört trotzdem jeder)"], ["STATIONSKÜCHE", "Kaffee: eingespart. Sofa: noch da."]],
    tip: "Die Internisten hier sind Nerds: Wer dich erwischt, will Differentialdiagnosen hören. Ein seltener Fallbericht lenkt sie ab. Türen kannst du öffnen und hinter dir schließen.",
    objectives: [],
    reaRandom: true,
    map: ["#########################", "#1__v#:B:B#:::#:B:B:#:L:#", "#_S__#::::#:k:#:::::#:::#", "#____#::$:#1::#::P::#:::#", "###d###d####d####d####d##", "#.........I.........x...#", "#.##d###.##d###.###d###.#", "#.#____#.#:::x#.#:::::#.#", "#b#_M__#F#:7::#O#:B:P:#.#", "#.#____#.#::::#.#:::::#.#", "#.###H##.###d##.##d##^###", "#..2.8.x...I...3....N..E#", "############l############"] },
  { key: "ortho", short: "4 · ORTHOPÄDIE", name: "Orthopädie · 4. OG", floor: "4. OG", room: 4, env: "ortho",
    safeNames: [["UMKLEIDE", "Riecht nach Deo und Verzweiflung"]],
    tip: "In der Orthopädie stehen die Orthopäden einfach im Flur herum, zwischen zwei Sätzen Bizeps-Curls. Lauchige Futzis wie Internisten lassen sie nicht durch. Beweise, dass du keiner bist: Proteinshake, Fachwissen, Liegestütze. Oder Schmeicheln.",
    objectives: [
      { id: "gates", title: "Bizeps-Bürokratie", text: () => `An den Orthopäden vorbeikommen (${bouncersCleared()}/${bouncersTotal()})`, main: true, at: "bouncer", done: () => bouncersCleared() >= bouncersTotal(),
        brief: "Drei Orthopäden stehen im Flur herum und halten jeden für einen Internisten. Internisten kommen hier nicht durch. Zu lauchig. Beweis das Gegenteil: Shake, Liegestütze, Rotatorenmanschette oder ein ehrliches Kompliment für den Bizeps." },
      ],
    map: ["################l########", "#S........x.....O.......#", "####d#######d#######d####", "#:::::::#:Y:::x:#_______#", "#6::Y:::#:::::::#_____1_#", "############U############", "#..............D......w.#", "#.....#.V.........#.....^", "#............x..........#", "###U#####################", "#..x....4...O...........#", "######d########d#######U#", "#::::::::P::#:::2::::##E#", "#::0::::::::#:::::B::####", "########l################"] },
  { key: "radio", short: "3 · RADIOLOGIE", name: "Radiologie · 3. OG", floor: "3. OG", room: 3, env: "radio",
    safeNames: [["DUNKELKAMMER", "Dunkel. Ruhig. Perfekt."]],
    tip: "Die Radiologie spart Strom, indem sie grundsätzlich im Dunkeln befundet. Die Taschenlampe hilft beim Sehen, verrät dich aber. Tipp auf LAMPE, um sie auszuschalten. Im MRT-Raum: kein Metall!",
    objectives: [
      { id: "rea3", title: "Licht aus, Herz aus", text: "REA-Alarm im CT", main: true, at: "rea",
        brief: "Im CT hat ein Patient keinen Puls. Das Notfallteam wurde 2021 eingespart. Du bist jetzt das Notfallteam." }],
    lock: "Im CT wird reanimiert. Du gehst jetzt nicht.", reaScript: 8,
    map: ["#########################", "#S......................#", "#.####d#######d########.#", "#.#:Y:::::#:::::::::::#.#", "#.#:::r:::#:::::m:::::#.^", "#O#:::::::#:::::::::::#.#", "#.######d#########d####.#", "#...........A.........x.#", "#.####d######d#########.#", "#.#::::::9#:::::#_____#.#", "#9#:&:::A:#:::B:#_____#.#", "#.#:::::::#:x:::#_____#.#", "#.####l######d#####d###.#", "#.................C.9...#", "############E############", "#########################"] },
  { key: "gastro", short: "2 · GASTRO", name: "Gastroenterologie · Endoskopie", floor: "2. OG", room: 2, env: "gastro",
    safeNames: [["ENDO-AUFWACHRAUM", "Niemand wacht hier freiwillig auf"]],
    tip: "Die Lüftung wurde 2017 eingespart. Seitdem riecht die Gastroenterologie nach… Gastroenterologie. Die Wolken sind inzwischen giftig: Wer drin steht, verliert schnell Energie, der Bildschirm wird rot und die Warnleuchten blinken. Luft anhalten hilft nicht. Lüftung im Endoskopie-Raum einschalten schon.",
    objectives: [
      { id: "vent", title: "Operation Frischluft", text: "Lüftung im Endoskopie-Raum einschalten", main: true, at: "prop:y",
        brief: "Im Endoskopie-Raum hängt der Lüftungsschalter. Aus „Kostengründen“ seit 2017 aus. Die Gastroenterologen merken nichts mehr. Du schon." }],
    lock: "Ohne Lüftung gehst du hier nicht durch. Du würdest es nicht überleben. Dein Kittel auch nicht.",
    map: ["###########################", "#S......nffff.P...........#", "#.###d#######d######d####.#", "#.#:\"\":::#:::::::#:B::::#.#", "#.#:B::B:#::y::::#::::B:#.^", "#f#::::::#:::::::#::::::#.#", "#f##########l############.#", "#...$............nfffff...#", "#f####d######d#######d###.#", "#f#:::::::#______#:::::9#f#", "#n#::x::\"\"#_0__1_#::B:::#f#", "#.#:::::::#______#::::::#f#", "#.#######################.#", "#........x....ffff....N...#", "#########################E#"] },
  { key: "derma", short: "1 · DERMATOLOGIE", name: "Dermatologie · Rettungsstation", floor: "1. OG", room: 1, env: "derma", safe: true,
    safeNames: [],
    tip: "Geschafft: die Dermatologie. Holzboden, Gurkenduft, Spa und Beauty-Studio. Butler Ambrosius empfängt dich am Eingang. Gurkenscheiben und Kortison-Tuben am Boden: drüberschleichen, sonst rutschst du aus. Und sag NIE, dass du heute noch keine Sonnencreme mit LSF 50 aufgetragen hast.",
    objectives: [
      { id: "spa", title: "Gurkenscheiben-Protokoll", text: "Bei Dr. Glatt melden (oder auf eine Wellness-Liege)", main: true, at: "friend:e",
        brief: "Die Dermatologie ist die einzige Abteilung mit Feierabend. Dr. Glatt besteht auf einer Behandlung, bevor du weiterdarfst. Medizinisch notwendig, sagt sie." }],
    lock: "Dr. Glatt besteht auf Wellness. Ohne Gurkenscheibe kein Weiterkommen.",
    map: ["#################################", "#:::::::#:::::::#:::::::#:::::::#", "#::W::::#::W:W::#:+:R:+:#:W:W:W:#", "#:::::::#:::::::#:::::::#:::R:::#", "####d#######d#######d#######d####", "#S.!.....$...R.......i...R......^", "######d#########d######.####d####", "#:::::::::::#:::::::###E#:::::::#", "#:+:::e::R::#:::W:::#####::W:W::#", "#:::::::::::#:::::::#####:::R:::#", "#################################"] },
  { key: "cellar", short: "UG · KELLER", name: "Keller · Pathologie & Archiv", floor: "UG", room: 0, env: "cellar", envOn: "cellarOn",
    safeNames: [["WERKSTATT", "Hausmeister Schraube · Zutritt nur mit Bier"]],
    tip: "Das Treppenhaus ins EG ist gesperrt (Brandschutzbegehung seit 2021). Der Weg führt durch den Keller. Strom: weg. Wartung: gestrichen. Und Dr. Ewig ist noch da.",
    objectives: [
      { id: "fuse", title: "Keine Sicherung, kein Feierabend", text: "Ersatzsicherung beim Hausmeister holen", main: true, at: "friend:h",
        brief: "Hausmeister Schraube hat eine Ersatzsicherung. Privat gekauft, im Baumarkt. Er sitzt in seiner Werkstatt und hört Radio von 1987." },
      { id: "power", title: "Es werde Licht", text: "Sicherung im Technikraum einsetzen", main: true, at: "prop:G",
        brief: "Sicherungskasten im Technikraum. Danach geht die elektrische Tür zum Treppenhaus auf. Dr. Ewig mag kein Licht." }],
    lock: "Die Tür zum Treppenhaus ist elektrisch. Ohne Strom bleibt sie zu.", blackouts: true, fogOfWar: true,
    map: ["#########################", "#S..o...........u.......#", "#.####d#####.####d#####.#", "#.#:x::::::#.#::::::::#.#", "#.#::Y::Y::#X#:::::x::#.#", "#.#::::::::#.#::::::::#.#", "#.#######d##.##d#######.#", "#.....x.....g.....V.....#", "#.###d######.#####d####.#", "#.#________#.#::::::::#.#", "#9#___h____#z#::::::::#.^", "#.#________#.#::::::G:#.#", "#.######d###.###d######.#", "#....z..............o.0.#", "#######################E#", "#########################"] },
  { key: "er", short: "EG · NOTAUFNAHME", name: "Zentrale Notaufnahme", floor: "EG", room: 0, env: "er",
    safeNames: [["PERSONALRAUM", "Hier gibt es seit 2017 keinen Kaffee mehr"]],
    tip: "Wartezeit: 9 Stunden. Aus dem Wartezimmer schlurfen Pseudo-Notfälle: Schnupfen seit drei Wochen, Zeckenbiss 2019, Rezept nur kurz. Sie sind langsam. Triagiere sie weg.",
    objectives: [],
    reaRandom: true, horde: true,
    map: ["####################^############", "#.......#.....................S.#", "#.%..%..#..~....~....~..........#", "#.......#.......................#", "#.......#.....Z...........TT....#", "#...x...#...............Z...N...#", "#.......#.3.....................#", "#.......####..########..######.##", "#.........Z........O............#", "#.||#||#||#||#||####d######d###.#", "#.:5#::#::#::#::#::::::::#1___#.#", "#.B:#B:#B:#B:#B:#:x::Y:::#___0#.#", "#.#############################.#", "#.....x....................w....#", "########M#######t#######L######E#", "#################################"] },
  { key: "park", short: "P2 · PARKHAUS", name: "Parkhaus P2 · Personal", floor: "P2", room: 0, env: "park", safeNames: [],
    tip: "Das Personalparkhaus. Die Ärzteparkplätze wurden 2022 gestrichen, du parkst ganz hinten. Die Schranke öffnet nur mit Ticket. ACHTUNG: Die Autos hier bremsen nicht. Der Chef parkt gerade aus, rückwärts, ohne zu schauen, und die Oberärzte haben es eilig. Fußgänger sind ihnen egal. Wirst du überfahren, kostet das 30 % Energie. Warte am Rand, bis sie vorbei sind.",
    objectives: [
      { id: "barrier", title: "Schranke des Schicksals", text: "Schranke mit Parkticket öffnen", main: true, at: "prop:=", for: ["stay"],
        brief: "Die Schranke. 12 Euro für neun Stunden Überstunden-Parken. Steck das Ticket rein und bete." },
      { id: "car", fin: true, title: "Freiheit", text: () => run.route === "stay" ? "Zu deinem Auto" : "Einsteigen: " + ROUTES[run.route].ride, main: true, at: "prop:j",
        brief: "Ganz hinten im Parkhaus wartet dein Ausweg. Er hat Staub angesetzt. Du auch." }],
    final: true,
    map: ["#################", "#S......a.a.a...#", "#.a.a.a.......a.#", "#.......a.a.a.D.#", "#.a.a.a.......a.#", "#.q.............#", "########=########", "#.a.a.....a.a.a.#", "#...........q...#", "#.a.a.a.O.a...j.#", "#################"] },
  { key: "icu", short: "ITS · INTENSIV", name: "Intensivstation · 6. OG", floor: "6. OG", room: 6, env: "icu",
    safeNames: [["SCHLEUSE", "Haube, Kittel, Maske. Und Ruhe."]],
    tip: "Die Intensivstation: das hellste Licht im Haus, die strengste Pflege und Monitore, die bei jedem Atemzug piepen. Wer hier ohne Haube herumläuft, wird höflich, aber bestimmt gefressen. Leise sein. Wirklich leise.",
    objectives: [],
    map: ["#########################", "#:B:#:B:#:B:#:B:#____#::#", "#:::#:::#:P:#:::#_S1_#:x#", "#|###|###|###|###d####d##", "#.......N.......O.......#", "#.TT.......F............#", "#|###|###|###|###d###.^##", "#:::#:::#:P:#:::#:::#..3#", "#:B:#:B:#:B:#:B:#:::#..E#", "#########################"] },
];


const DUTIES = { WE: "Wochenenddienst", N: "Nachtdienst", "24": "24-h-Dienst", RB: "Rufbereitschaft", ST: "Studienambulanz (Sa)" };

/* hostile people: detect = awareness per second at close range, fov = cos of half view angle, approach = walking speed once spotted */
const TYPES = {
  P: { label: "PATIENT", role: "Patient", who: () => rnd(["Hr. Meier, Zi. 12", "Fr. Schulze, Zi. 7", "Hr. Brösel, Flurbett 9"]), av: "🤒", color: "#8fc1e8",
       spec: () => ({ skin: rnd(SKIN), hair: 0x8c8c8c, hairStyle: rnd(["messy", "bald", "short"]), gown: true, shirt: 0x9cc6e6, pants: 0x9cc6e6, shoes: 0xd9d4c8, acc: "iv" }),
       walk: .4, approach: .8, range: 4, fov: .45, detect: .55, barks: ["Herr Doktor! Hallo! HALLO!", "Sie da! Im Kittel!", "Nur ganz kurz!"] },
  F: { label: "ANGEHÖRIGE ×3", role: "Angehörige", who: () => rnd(["Familie Kowalski (alle 7)", "Die Tochter aus München", "Neffe Dirk (Heilpraktiker)", "Schwiegersohn Dr. Google", "Tante Renate (hat gegoogelt)", "Enkel Kevin (filmt alles)", "Die Nachbarin (keine Vollmacht)", "Sohn Bernd (Anwalt, angeblich)"]), av: "👵", color: "#f2b33d",
       spec: () => ({ skin: rnd(SKIN), hair: 0xd8d8d8, hairStyle: "bun", shirt: 0xc0503a, pants: 0x3a4a6a, acc: "handbag", jacket: 0x7a3a2a }), group: true,
       walk: .4, approach: 1.0, range: 5, fov: .4, detect: .65, barks: ["Da ist er! Der Doktor!", "Wir haben nur drei Fragen!", "Dirk, film das!"] },
  N: { label: "PFLEGE", role: "Pflege", who: () => rnd(["Schwester Gertrud", "Pfleger Kevin", "Schwester Ayşe", "Schwester Einspringen", "Pfleger Doppelschicht", "Schwester Unterbesetzt", "Pfleger Holger (Personalschlüssel 1:30)", "Schwester Seit-1987", "Pfleger Frei-war-gestern"]), av: "🩺", color: "#4fb3a9",
       spec: () => ({ skin: rnd(SKIN), hair: rnd(HAIR), hairStyle: rnd(["bun", "short", "long"]), shirt: 0x3f8fb3, pants: 0x3f8fb3, shoes: 0xf2f2f2, acc: "chart", short: true }),
       walk: .6, approach: 1.0, range: 5, fov: .45, detect: .65, barks: ["Ah, gut dass du noch da bist!", "Kurz abzeichnen!", "Nicht weglaufen!"] },
  O: { label: "OBERARZT", role: "Oberarzt", who: () => rnd(["OA Dr. Kranich", "OÄ Dr. Stahlhart", "OA Dr. Hammer", "OA Dr. Nurkurz", "OÄ Dr. Gnadenlos", "OA Dr. Überstunde", "OÄ Dr. Kaltherz", "OA Dr. Samstag", "OA PD Dr. Ehrgeiz", "OÄ Dr. Dienstplan", "OA Dr. Feierabendlos", "OA Dr. Morgenvisite", "OÄ Dr. Eiskalt-Lächelnd", "OA Dr. Wiedermal", "OA Dr. h.c. Vorbild", "OÄ Dr. Ohnepause", "OA Dr. Mehrarbeit", "OA Dr. Freiwillig", "OA Dr. Gleichkurz", "OÄ Dr. Unabkömmlich", "OA Dr. Bereitschaft", "OA Dr. Zweitmeinung", "OÄ Dr. Exzellenz", "OA Dr. Kostenstelle", "OA Dr. Wochenende", "OÄ Dr. Spätdienst", "OA Dr. Alleskönner", "OA Dr. Frühbesprechung", "OÄ Dr. Hab-ich-doch-gesagt", "OA Dr. Leistungsträger", "OA Dr. Sofort", "OA Dr. Mitarbeitergespräch", "OÄ Dr. Ehrenamt", "OA Dr. Burnout-Resistent", "OÄ Dr. Kurzvorher", "OA Dr. Nochwas", "OA Dr. Präsenzpflicht", "OÄ Dr. Rückruf-Sofort", "OA Dr. Ich-hab-da-noch-was", "OÄ Dr. Zielvereinbarung", "OA Dr. Kann-ich-mal-kurz", "OA Dr. Vorbildfunktion", "OÄ Dr. Resilienz", "OA Dr. Lob-gibt's-nicht", "OA Dr. Wir-sind-ein-Team", "OÄ Dr. Jahresgespräch", "OA Dr. Früher-war-alles-härter", "OA Dr. Ehrgeiz-Ehrgeizig", "OÄ Dr. Unterschrift-fehlt", "OA Dr. Golfplatz"]), av: "🧐", color: "#e2483d",
       spec: () => ({ skin: rnd(SKIN), hair: 0x8c8c8c, hairStyle: rnd(["short", "baldSides"]), coat: true, shirt: 0x9fc0e0, pants: 0x2f3440, tie: 0xb02a2a, glasses: "normal", steth: true, acc: "clipboard" }),
       walk: .75, approach: 1.35, range: 6, fov: .75, detect: .95, cone: true, barks: ["Kollege! Auf ein Wort!", "Ah, Sie sind ja noch da. Perfekt.", "Haben Sie Samstag schon was vor?", "Gehen Sie etwa schon? Um DIESE Uhrzeit?", "Ich hab da noch was Kleines für Sie!", "Wir müssen über Ihre Einstellung reden.", "Feierabend ist ein Gefühl, kein Zeitpunkt!", "Zu meiner Zeit gab es keinen Feierabend. Und es hat uns nicht geschadet!", "Sie sehen müde aus. Gut, dann sind Sie im Flow."] },
  C: { label: "CHEFARZT", role: "Chefarzt", who: () => "Prof. Dr. Dr. h.c. mult. Übermut", av: "🤴", color: "#9b6bff",
       spec: () => ({ skin: SKIN[0], hair: 0xbbbbbb, hairStyle: "baldSides", coat: true, shirt: 0x23262e, pants: 0x23262e, tie: 0xd4af37, glasses: "normal", scale: 1.07, build: "big" }),
       walk: .6, approach: 1.05, range: 7, fov: .3, detect: .8, barks: ["SIE DA!", "Mein Büro. Jetzt.", "Ich sehe alles."] },
  V: { label: "CONTROLLING", role: "Controlling", who: () => "Hr. Paragraf", av: "🤓", color: "#9aa3a0",
       spec: () => ({ skin: SKIN[4], hair: 0x3a2a1a, hairStyle: "short", shirt: 0xdfe6ee, pants: 0x5b6270, tie: 0x2d3f8f, glasses: "normal", acc: "folder", jacket: 0x5b6270 }),
       walk: .5, approach: 1.0, range: 5, fov: .45, detect: .6, barks: ["Moment! Ihre Kodierung!", "Das kostet!", "Formular 17b!"] },
  I: { label: "INTERNIST", role: "Internist · Nerd", who: () => rnd(["Dr. Differential", "Dr. Zebra", "Dr. Natrium", "Dr. Seltene-Erkrankung", "Dr. Kalium", "Dr. Leitlinienkonform", "Dr. Lupus-ist-es-nie"]), av: "🤓", color: "#7cc4ff",
       spec: () => ({ skin: rnd(SKIN), hair: rnd(HAIR), hairStyle: "messy", coat: true, shirt: 0xd9c46b, pants: 0x4a4a3a, glasses: "thick", pens: true, acc: "book", build: "thin" }),
       walk: .55, approach: 1.0, range: 5, fov: .45, detect: .7, barks: ["Warte! Hast du an Morbus Whipple gedacht?", "Interessanter Fall!", "Natrium 134!"] },
  U: { label: "ORTHOPÄDE", role: "Orthopädie · Oberarzt Kraftraum", who: () => rnd(["Dr. Bizeps", "Dr. Quadrizeps", "Dr. Kreuzband", "Dr. Meniskus", "Dr. Bankdrücken", "Dr. Proteinpulver", "Dr. Schraube-Locker"]), av: "💪", color: "#3a3a3a",
       spec: () => ({ skin: rnd(SKIN), hair: rnd([0x1b1b1b, 0x5a3a22, 0x8a6a3a]), hairStyle: rnd(["short", "baldSides", "spiky"]), shirt: 0x2a5f8a, pants: 0x2a5f8a, scrubs: true, pens: true, badge: true, build: "muscle", steth: true, pose: rnd(["flex", "curl", "curl"]), scale: 1.06, short: true, acc: "shake", mood: rnd(["smile", "neutral"]) }),
       static: true },
  A: { label: "RADIOLOGE", role: "Radiologie", who: () => rnd(["Dr. Schatten", "Dr. Kontrast", "Dr. Voraufnahme", "Dr. Zufallsbefund", "Dr. Klinisch-Korrelieren", "Dr. Kontrolle-in-6-Monaten"]), av: "🩻", color: "#6a7a9a",
       spec: () => ({ skin: rnd(SKIN), hair: rnd(HAIR), hairStyle: "short", coat: true, apron: true, shirt: 0x333a44, pants: 0x2a2f38, glasses: "normal", acc: "mug", lamp: true }),
       walk: .4, approach: .85, range: 4, fov: .5, detect: .5, barks: ["Wer ist da?", "Befund folgt…", "Psst!"] },
  n: { label: "GASTROENTEROLOGE", role: "Gastroenterologie · riecht nichts mehr", who: () => rnd(["Dr. Darmstadt", "Dr. Flatulenzia", "Dr. Pförtner", "Dr. Kolon-Kowalski", "Dr. Blähfeld", "Dr. Spiegel-Hintermann"]), av: "🧻", color: "#9a8a4a",
       spec: () => ({ skin: rnd(SKIN), hair: rnd(HAIR), hairStyle: rnd(["short", "bun", "baldSides"]), shirt: 0x6a8a5a, pants: 0x6a8a5a, scrubs: true, apron: true, glasses: rnd(["normal", "none"]), acc: rnd(["mug", "clipboard"]), mood: "smile" }),
       walk: .5, approach: 1.0, range: 5, fov: .45, detect: .65, barks: ["Riechen Sie das auch? Nein? Gut.", "Kurze Frage zum Stuhlgang!", "Haben Sie schon gegessen?"] },
  Z: { label: "NOTFALL?", role: "Pseudo-Notfall", who: () => rnd(["Hr. Schnupfen", "Fr. Zeckenbiss (2019)", "Hr. Rezept-nur-kurz", "Fr. Seit-gestern-komisch", "Hr. Seit-2004-Rücken", "Fr. Dr.-Google", "Hr. Nur-ein-Pflaster", "Fr. Ich-war-zuerst-da", "Hr. Krankenschein-für-Montag", "Fr. Hausarzt-hat-zu", "Hr. Kater-seit-Samstag", "Fr. Zweitmeinung-zur-Zweitmeinung"]), av: "🧟", color: "#a7c48a",
       spec: () => ({ skin: rnd([0xc9d6b0, 0xd8d0b0, 0xb8c8a0]), hair: rnd(HAIR), hairStyle: rnd(["messy", "bald", "long"]), robe: true, shirt: rnd([0x8a6fae, 0x6a8fae, 0xae6a6a, 0x7aa07a]), pants: 0x5a5a6a, pose: "zombie", lowDetail: true }),
       walk: .25, approach: .55, range: 5, fov: .2, detect: .55, barks: ["Ist das… ein Arzt?", "Doktor… mein Knie… seit März…", "Ich hab seit Monaten Rücken…", "Krankmeldung… für letzte Woche…", "Ein Wehwehchen… von 2022…", "Nur… ganz… kurz…", "Rezept…"] },
  D: { label: "DR. PD PHIL", role: "Habilitand · stellt Statistikfragen", who: () => "Dr. PD Phil", av: "📊", color: "#ff7ab8",
       spec: () => ({ skin: SKIN[1], hair: 0xd9b26c, hairStyle: "spiky", coat: true, shirt: 0x4a7fd0, pants: 0x1f2a44, glasses: "sunTop", acc: "laptop", shoes: 0xb08850 }),
       walk: .9, approach: 1.5, range: 6, fov: .4, detect: .8, barks: ["Buddy! Kurze Statistikfrage!", "Impact Factor, Baby!", "Du wärst perfekter Co-Autor!"],
       lines: ["Hey Buddy! Kurze Frage für mein Paper. Ich habilitier halt nebenbei.", "Ich hab da eine Studie. Drei Fragen, dann darfst du gehen. Vielleicht.", "Impact Factor, Baby! Hilf mir mal kurz mit der Statistik."] },
  R: { label: "DERMATOLOGIN", role: "Dermatologie · neugierig", who: () => rnd(["Dr. Seidig", "Dr. Porenrein", "Dr. Glow", "Dr. Hyaluron", "Dr. Filler", "Dr. Pfirsichhaut", "Dr. LSF-Fünfzig"]), av: "💅", color: "#f6c1d4",
       spec: () => ({ skin: rnd([0xf6dcc8, 0xf1c9a5, 0xe0ac7e]), hair: rnd([0xd9b26c, 0x2b1d14, 0x9a6b3f]), hairStyle: rnd(["long", "bun"]), coat: true, shirt: 0xf6c1d4, pants: 0xf2f2f2, shoes: 0xf2f2f2, glasses: "sunTop", acc: "mug", mood: "smile" }),
       walk: .45, approach: 1.0, range: 5, fov: .45, detect: .7, barks: ["Oh! Ein ECHTER Arzt!", "Darf ich was fragen?", "Wie aufregend, Blut!"] },
  g: { label: "DR. EWIG", role: "Assistenzarzt seit 2009", who: () => "Dr. Ewig", av: "👻", color: "#d9e4ff",
       spec: () => ({ skin: 0xe8eeff, hair: 0xe8eeff, hairStyle: "messy", coat: true, shirt: 0xe8eeff, pants: 0xe8eeff, ghost: true, pose: "zombie" }),
       walk: .3, approach: .55, range: 7, fov: -1, detect: .6, ghost: true, barks: ["Bleib doch…", "Nur kurz…", "Für immer…"] },
};

const FRIENDS = {
  k: { name: "Dr. Kurz", role: "Assistenzarzt · Nachtdienst", av: "🙏", color: "#9fd0ff",
       spec: { skin: SKIN[2], hair: 0x2b1d14, hairStyle: "messy", coat: true, shirt: 0x5aa17a, pants: 0x5aa17a, acc: "mug" } },
  b: { name: "Frau Bozkurt", role: "Reinigung · kennt jeden Gang", av: "🧹", color: "#7ec8a0",
       spec: { skin: SKIN[1], hair: 0x2b1d14, hairStyle: "bun", shirt: 0xc77da3, pants: 0x4a4a5a, acc: "mop", trolley: true, short: true } },
  h: { name: "Hausmeister Schraube", role: "Technik · seit 1987 im Keller", av: "🔧", color: "#f0a35e",
       spec: { skin: SKIN[0], hair: 0x8c8c8c, hairStyle: "cap", shirt: 0x3a5a8a, pants: 0x3a5a8a, beard: 0x8c8c8c, acc: "toolbox", build: "big" } },
  s: { name: "Jonas", role: "PJ-Student · motiviert (noch)", av: "🥺", color: "#6fcf97",
       spec: { skin: SKIN[4], hair: 0x9a6b3f, hairStyle: "short", coat: true, shirt: 0xe8e8e8, pants: 0x3a4a6a, acc: "book", build: "thin", scale: .96 } },
  e: { name: "Dr. Glatt", role: "Dermatologie · Oberärztin für Wohlbefinden", av: "🧴", color: "#f6c1d4",
       spec: { skin: 0xf6dcc8, hair: 0xd9b26c, hairStyle: "long", coat: true, shirt: 0xf6c1d4, pants: 0xf2f2f2, shoes: 0xf2f2f2, acc: "jar" } },
  "!": { name: "Butler Ambrosius", role: "Empfang · Dermatologie & Spa", av: "🤵", color: "#e8e2d0",
       spec: { skin: SKIN[0], hair: 0xc8c8c8, hairStyle: "short", shirt: 0xf4f4f0, jacket: 0x16181c, pants: 0x16181c, shoes: 0x111111, acc: "tray", pose: "butler", glasses: "none", mood: "neutral" } },
  i: { name: "@doc.wellness", role: "Patientin · Influencerin", av: "🤳", color: "#ff9fd0",
       spec: { skin: SKIN[0], hair: 0xd9b26c, hairStyle: "long", shirt: 0xff7ab8, pants: 0xf2f2f2, acc: "phone", glasses: "sun", short: true } },
};

/* cat: what it is for · dur: how long it lasts · where: where to get more */
const ITEMS = {
  "2": { emoji: "📋", name: "Klemmbrett", cat: "Unsichtbar", dur: "12 s", where: "Start, Stationen", desc: "Klemmbrett hoch, Stirn runzeln, schnell gehen: Du wirkst so beschäftigt, dass dich NIEMAND sieht. Echte Unsichtbarkeit.", metal: true },
  c: { emoji: "🥼", name: "Kittel", cat: "Tarnen", dur: "an/aus", where: "Start", desc: "Kittel ausziehen: Pflege, Ärzte und Verwaltung erkennen dich nicht mehr und drehen ab. Patienten und Angehörige finden dich dafür noch interessanter." },
  m: { emoji: "😷", name: "Noro-Maske", cat: "Tarnen", dur: "15 s", where: "Start", desc: "Maske auf, laut husten: ALLE halten Abstand, auch Patienten und Angehörige." },
  f: { emoji: "📱", name: "Fake-Telefonat", cat: "Verteidigen", dur: "10 s", where: "Start", desc: "Ernst ins Handy reden: Personal spricht dich nicht an, wer schon kommt, dreht ab." },
  "3": { emoji: "🧴", name: "Desinfektionsspray", cat: "Verteidigen", dur: "7 s", where: "Flure, Stationen", desc: "Alle im Umkreis von etwa 12 m (mit Sicht) sind 7 Sekunden außer Gefecht." },
  "4": { emoji: "✈️", name: "Flugmodus-Pieper", cat: "Verteidigen", dur: "60 s", where: "Orthopädie, Snackautomat", desc: "60 Sekunden lang keine Anrufe. Offiziell: Funkloch." },
  p: { emoji: "✏️", name: "Kugelschreiber", cat: "Ablenken", dur: "8 s", where: "Start", desc: "In Blickrichtung werfen: Es klackt da hinten, alle in der Nähe gehen nachsehen." },
  "5": { emoji: "📢", name: "Durchsage-Mikro", cat: "Ablenken", dur: "12 s", where: "Innere, Notaufnahme", desc: "„Gratis Kuchen in der Cafeteria!“ Alle auf dem Stockwerk rennen hin." },
  "7": { emoji: "📕", name: "Seltener Fallbericht", cat: "Ablenken", dur: "16 s", where: "Innere", desc: "Hinlegen: Alle Internisten-Nerds bleiben lesend daran kleben." },
  "1": { emoji: "☕", name: "Kaffee", cat: "Energie", dur: "sofort + 8 s", where: "überall", desc: "+35 % Energie und 8 Sekunden schneller." },
  "0": { emoji: "🥫", name: "Energydrink", cat: "Energie", dur: "sofort", where: "Snackautomat, Räume", desc: "+55 % Energie." },
  "$": { emoji: "🍩", name: "Donut", cat: "Energie", dur: "sofort", where: "Snackautomat, Räume", desc: "+30 % Energie. Vom Pharmavertreter. Ethisch fragwürdig." },
  "6": { emoji: "🥤", name: "Proteinshake", cat: "Energie", dur: "sofort", where: "Orthopädie (Kraftraum)", desc: "+25 % Energie. Oder einem Orthopäden geben: Er lässt dich sofort durch (auch mitten im Kampf)." },
  "+": { emoji: "🫙", name: "Wundercreme", cat: "Energie", dur: "sofort", where: "Dermatologie", desc: "+75 % Energie. Nebenwirkung: Du glänzt." },
  "9": { emoji: "🔋", name: "Batterie", cat: "Werkzeug", dur: "sofort", where: "dunkle Etagen", desc: "Taschenlampe wieder 100 %." },
  "8": { emoji: "🧮", name: "Taschenrechner", cat: "Werkzeug", dur: "einmal", where: "Innere", desc: "Dr. PD Phil fragt Statistik? Der Taschenrechner beantwortet alles richtig. Achtung: Metall (MRT!)." , metal: true },
  "&": { emoji: "📜", name: "Arbeitszeugnis", cat: "Mission", desc: "„…war stets bemüht…“", mission: "zeugnis" },
};
const ITEM_CATS = [["Unsichtbar", "👻", "Niemand sieht dich"], ["Tarnen", "🥸", "Bestimmte Leute erkennen dich nicht"], ["Verteidigen", "🛡️", "Leute drehen ab oder fallen aus"], ["Ablenken", "🎯", "Leute schauen woanders hin"], ["Energie", "⚡", "Lädt deine Energie auf"], ["Werkzeug", "🔧", "Für bestimmte Situationen"]];
const INV_ORDER = ["2", "c", "m", "f", "p", "3", "1", "0", "$", "+", "6", "5", "4", "7", "8", "9"];

const OFFERS = {};
const BAG_NAMES = { excel: "Controlling-Excel", koffer: "Koffer", reel: "Intensiv-Reel", collab: "Collab-Selfie", probe: "Probetag-Zertifikat", binder: "Studienordner", lanyard: "Kongress-Lanyard", bizepsfoto: "Bizeps-Foto", ringlight: "Ringlicht", lunchbox: "Brotdose", helmet: "Fahrradhelm", key: "Autoschlüssel", approbation: "Approbationsurkunde", zeugnis: "Arbeitszeugnis", ticket: "Parkticket", fuse: "Ersatzsicherung", cream: "Sonnencreme", a38: "Formular A38", stamp1: "Stempel Controlling", stamp2: "Stempel Archiv", stamp3: "Stempel Notaufnahme", meds: "Reisetabletten", photo0: "Foto: Faxgerät", photo1: "Foto: Wartezeit", photo5: "Foto: Nummer 999" };

/* Phone calls are the hospital trying to keep you. Accept: costs time, sometimes helps. Decline: the caller comes looking for you (hunt = who). */
const CALLS = [
  { from: "Station 3B", hunt: "N", sub: "Pflege", av: "🏥", text: "Hr. Lehmann hat Fieber. 37,6 °C! Kommen Sie mal? Er hat auch schon gegoogelt.", acc: { mins: 12, note: "Hr. Lehmann hat 37,6 °C und eine Liste mit 14 Fragen. Du beantwortest drei. Er ist zufrieden. Du nicht." } },
  { from: "Controlling", hunt: "V", sub: "Hr. Paragraf · Kodierung", av: "📉", text: "Ihr Fall von 2024 ist noch nicht kodiert. Das kostet uns 312 Euro. Pro Tag. Kommen Sie kurz rüber?", acc: { mins: 10, note: "Du kodierst „Z99.9: Abhängigkeit von Arbeitgeber“. Er ist begeistert." } },
  { from: "IT-Abteilung", hunt: "V", sub: "Helpdesk · Ticket #48211", av: "💻", text: "Ihr Passwort läuft in 5 Minuten ab. Das neue braucht 24 Zeichen, ein Emoji und eine Hieroglyphe. Bitte persönlich vorbeikommen.", acc: { mins: 8, note: "Neues Passwort: Feierabend2026!🙃𓀀. Du wirst es nie wieder eintippen können." } },
  { from: "Chefsekretariat", hunt: "O", sub: "Fr. Vorzimmer", av: "🗂️", text: "Der Chef möchte Sie sprechen. Es geht um den Dienstplan. Und um Ostern.", acc: { mins: 10, duties: 1, note: "Ostern. Und Pfingsten. „Sie haben ja keine Kinder.“ Du hast zwei." } },
  { from: "Angehörige Kowalski", hunt: "F", sub: "Mobil · alle 7", av: "👵", text: "Wir sind die Familie von Zimmer 12. Wir haben nur drei Fragen. Pro Person.", acc: { mins: 15, note: "21 Fragen. Eine davon: „Ist das Essen hier immer so?“ Ja." } },
  { from: "Bettendisposition", hunt: "N", sub: "Verwaltung", av: "🛏️", text: "Wir haben 0 freie Betten und 14 Aufnahmen. Haben Sie eine Idee? Flur? Keller? Dach?", acc: { mins: 10, note: "Flurbett 24 steht jetzt im Aufzug. Er fährt nicht mehr. Das Bett schon." } },
  { from: "Qualitätsmanagement", hunt: "V", sub: "Zertifizierung", av: "📋", text: "Morgen ist Audit. Bitte füllen Sie kurz den Fragebogen „Wie zufrieden sind Sie mit Ihrer Zufriedenheit?“ aus. 140 Fragen.", acc: { mins: 8, note: "Du kreuzt überall „sehr zufrieden“ an. Das Krankenhaus ist jetzt zertifiziert glücklich." } },
  { from: "Oberarzt Dr. Kranich", hunt: "O", sub: "Hintergrund · gähnt", av: "🧐", text: "Kollege, ganz kurz: Können Sie noch die Aufnahme in der ZNA machen? Ist nur ein Schnupfen. Seit 2019.", acc: { mins: 14, note: "Es ist ein Schnupfen. Seit 2019. Du verschreibst Taschentücher. Kostenstelle 4711." } },
  { from: "Kantine", sub: "Küche", av: "🍲", text: "Das Mittagessen von heute Mittag ist jetzt fertig. Möchten Sie?", acc: { mins: 5, energy: 30, note: "Lauwarme Kartoffeln. Beste Mahlzeit des Tages." }, dec: { note: "Die Kartoffeln warten. Bis morgen. Sie warten immer." } },
  { from: "Mama", sub: "Mobil", av: "👩", text: "Isst du auch genug? Komm doch Sonntag zum Kuchen! Ach, du hast Dienst? Schon wieder?", acc: { mins: 3, nerves: 1, energy: 10, note: "Mama ist glücklich. Du auch, kurz." }, dec: { note: "Mama schickt 14 Sprachnachrichten. Du hörst sie im Urlaub. 2031." } },
  { from: "Personalabteilung", sub: "Zeiterfassung", av: "⏱️", text: "Ihre Überstunden aus 2024 verfallen heute um Mitternacht. Wir wollten nur Bescheid sagen. Schönen Feierabend!", acc: { nerves: -1, note: "Das tat weh. 312 Stunden. Einfach weg." }, dec: { note: "Sie verfallen trotzdem. Aber du hast es nicht gehört." } },
  { from: "Brandschutz", hunt: "V", sub: "Pflichtunterweisung", av: "🧯", text: "Ihre Brandschutz-Unterweisung ist abgelaufen. Das Online-Modul dauert nur 90 Minuten. Bitte heute noch.", acc: { mins: 12, note: "Du klickst 90 Folien durch. Letzte Frage: „Was tun bei Feuer?“ Antwort C: „Formular 12b ausfüllen.“" } },
];
const DEPT_HUNT = { N: "Die Pflege", V: "Die Verwaltung", O: "Der Oberarzt", F: "Die Familie" };
const DEPT_NAME = { N: "Pflege", V: "Verwaltung", O: "Oberärzte", F: "Familie" };

const LAB_POOL = [
  ["Kalium", "6,8", "mmol/l", "↑↑"], ["Natrium", "121", "mmol/l", "↓"], ["CRP", "287", "mg/l", "↑↑"], ["Hb", "6,1", "g/dl", "↓↓"],
  ["Troponin T", "0,9", "ng/ml", "↑↑"], ["Laktat", "4,2", "mmol/l", "↑"], ["Kreatinin", "3,4", "mg/dl", "↑"], ["INR", "4,8", "", "↑"],
  ["Glukose", "487", "mg/dl", "↑↑"], ["Lipase", "1240", "U/l", "↑↑"], ["Koffein", "0", "mg/l", "↓↓↓"], ["Schlaf (24 h)", "2,5", "h", "↓↓"],
  ["Motivation", "–", "", "n.n."], ["Budget", "−4,2", "Mio €", "↓↓"],
];

const STATS_Q = [
  { q: "Deine Studie: n = 12, p = 0,049. Was steht im Abstract?", o: ["„Hochsignifikanter Durchbruch!“", "„Explorativ, kleine Fallzahl, Replikation nötig.“", "„Wir erhöhen n, bis p noch kleiner wird.“"], a: 1 },
  { q: "Mittelwert von 2, 4 und 9?", o: ["4", "5", "6"], a: 1 },
  { q: "Median von 1, 3, 3, 8 und 100?", o: ["3", "23", "8"], a: 0 },
  { q: "Eisverkauf und Sonnenbrand korrelieren mit r = 0,8. Also?", o: ["Eis verursacht Sonnenbrand.", "Confounder: die Sonne.", "Eisverbot für alle Patienten."], a: 1 },
  { q: "20 Endpunkte getestet, einer ist signifikant. Das ist…", o: ["ein Nature-Paper.", "multiples Testen, vermutlich Zufall.", "ein Grund für eine Pressemitteilung."], a: 1 },
  { q: "Absolute Risikoreduktion 5 %. Wie groß ist die NNT?", o: ["5", "20", "0,05"], a: 1 },
  { q: "Odds Ratio = 1,0 bedeutet…", o: ["kein Unterschied.", "doppeltes Risiko.", "jemand hat die Tabelle falsch kopiert."], a: 0 },
  { q: "Die Power ist zu niedrig. Was hilft?", o: ["Größere Stichprobe.", "Mehr Sternchen in der Tabelle.", "Den Reviewer bestechen."], a: 0 },
  { q: "p = 0,051. Was tust du?", o: ["Ehrlich berichten.", "„Trend zur Signifikanz“ schreiben.", "Ausreißer „bereinigen“."], a: 0 },
  { q: "Wie viele Patienten hatte Dr. PD Phils Kontrollgruppe?", o: ["0", "Kontroll-was?", "Beides richtig."], a: 2 },
];

const PAT_QUIZ = [
  { q: "„Stimmt es, dass verschluckter Kaugummi sieben Jahre im Magen bleibt?“", o: ["Ja", "Nein"], a: 1,
    right: "„HA! Der Pudding gehört mir!“ Er ist so glücklich, dass er dich sofort vergisst.", wrong: "„Wusste ich's!“ Jetzt will er wissen, ob sein Kaugummi von 1987 noch drin ist." },
  { q: "„Hat ein Baby mehr Knochen als ein Erwachsener?“", o: ["Ja", "Nein"], a: 0,
    right: "„Echt? Wo sind die hin?“ Er schaut misstrauisch auf seine Knie. Du gehst.", wrong: "Sein Bettnachbar, Biologielehrer a. D., korrigiert dich. Ausführlich." },
  { q: "„Wachsen Haare und Nägel nach dem Tod weiter?“", o: ["Ja", "Nein"], a: 1,
    right: "„Gut. Ich hatte schon Angst um meine Frisur.“", wrong: "„Dann brauch ich ja einen Friseur für danach!“ Er will eine Überweisung." },
  { q: "„Wo genau ist das Herz?“", o: ["Links", "Eher Mitte, Spitze nach links", "Am rechten Fleck"], a: 1,
    right: "„Dann ist mein Tattoo an der falschen Stelle.“ Er wird nachdenklich. Du verschwindest.", wrong: "Er zeigt dir sein Herz-Tattoo. Es ist am Knie." },
  { q: "„Hilft Hühnersuppe bei Erkältung?“", o: ["Ein bisschen, ja", "Nein, reines Placebo"], a: 0,
    right: "„Oma hatte also recht!“ Er ruft sofort Oma an. Du bist frei.", wrong: "„Dann erklären Sie das meiner Oma.“ Er reicht dir das Telefon." },
  { q: "„Kriegt man vom Fernsehen viereckige Augen?“", o: ["Ja", "Nein"], a: 1,
    right: "„Schade. Ich hätte gern welche gehabt.“", wrong: "Er schaltet den Fernseher aus und will jetzt mit dir reden. Über alles." },
];

const ENDINGS = {
  stay: { title: "Montag, 7:00", eyebrow: "Parkhaus P2", text: "Du fährst heim, schläfst sechs Stunden und kommst wieder. Natürlich. Die Station braucht dich. Und das Controlling auch: Es hat schon deine Parkgebühr erhöht." },
  pharma: { title: "Medical Advisor", eyebrow: "Pharmazeutika AG", text: "Fr. Goldmann wartet mit einer schwarzen Limousine. Ab morgen: Flat White um 9:30, Feierabend um 16:00 auf der Dachterrasse, Kongress in Lissabon im Mai. Deine größte Sorge ab jetzt: die Folienfarben im PowerPoint." },
  botox: { title: "Ästhetische Dermatologie", eyebrow: "Praxis Dr. Glatt · Innenstadt", text: "Montag bis Donnerstag, 9 bis 15 Uhr. Freitags Yoga, samstags Brunch, sonntags: nichts. Deine Patienten fragen nie „nur ganz kurz“. Sie buchen einen Termin, bezahlen ihn und bringen Pralinen mit. Gurkenscheiben inklusive." },
  consult: { title: "Senior Consultant", eyebrow: "McKinny Consulting", text: "Business Class nach Zürich, Hotel mit Spa, Partner-Track. Du optimierst ab jetzt Krankenhäuser. Dein erstes Projekt ist deine alte Klinik. Deine Empfehlung: mehr Personal. Kevin (27) ist schockiert. Der Kunde auch. Du bekommst trotzdem den Bonus." },
  tele: { title: "Chief Wellbeing Officer", eyebrow: "DocFlix · Startup", text: "Du schreibst Leute per Video krank. Aus dem Bett. Oben Hemd, unten Jogginghose. Es gibt Obstkorb, Kicker und Equity, die nichts wert ist." },
  amt: { title: "Amtsärztin / Amtsarzt", eyebrow: "Gesundheitsamt · Zimmer 4.117", text: "Gleitzeit 7:30 bis 15:30. Dein größter Notfall: ein Formular in der falschen Farbe. Die Kaffeemaschine hat einen eigenen Dienstplan. Du bist nicht drauf." },
  influ: { title: "@dr.feierabend", eyebrow: "GlowUp Talents · Influencer-Van", text: "2,1 Millionen Follower, ein Podcast-Studio und ein Van mit Fahrer. Du erklärst in 15 Sekunden, warum Krankenhäuser kaputt sind. Nächste Woche Bali. Deine Ex-Kollegen liken heimlich. Der Chefarzt hat dich blockiert. Und wieder entblockt, um zu schauen." },
  ship: { title: "Schiffsarzt", eyebrow: "MS Sorgenfrei · Karibik", text: "Kabine mit Balkon, weiße Uniform, Delfine zum Frühstück. Häufigste Diagnose an Bord: Sonnenbrand. Zweithäufigste: Sonnenbrand nach dem Buffet. Dein Pager liegt auf dem Grund des Atlantiks. Er klingelt noch. Niemand hört ihn." },
};


const POSTERS = [
  { bg: "#2b7bb9", t: "HÄNDE-", t2: "DESINFEKTION", b: ["30 Sekunden.", "20 ct pro Sprühstoß."], i: "🧴" },
  { bg: "#e2483d", t: "LÄCHELN!", b: ["Sie sind im Dienst.", "Lächeln ist kostenlos.", "(noch)"], i: "😁" },
  { bg: "#6b4fd0", t: "FORTBILDUNG", b: ["Burnout-Prävention", "Samstag 07:00 Uhr", "Anwesenheit Pflicht"], i: "🧘" },
  { bg: "#f2b33d", t: "STATIONSFEST", b: ["ABGESAGT", "(Kostengründe)"], i: "🎉" },
  { bg: "#1f9d55", t: "MITARBEITER", t2: "DES MONATS", b: ["Der Kaffeeautomat", "(wurde abgebaut)"], i: "☕" },
  { bg: "#34514c", t: "ÜBERSTUNDEN?", b: ["Antrag 23c ausfüllen.", "Bearbeitung: 6–8 Monate.", "Ablehnung garantiert."], i: "📝" },
  { bg: "#c0322a", t: "STROM SPAREN!", b: ["Jede 2. Lampe bleibt aus.", "Dunkelheit ist", "patientenorientiert."], i: "💡" },
  { bg: "#2d3f8f", t: "DIENSTTAUSCH", b: ["Biete: Heiligabend", "Suche: irgendwas", "Tel. 4711"], i: "🎄" },
  { bg: "#111111", t: "KARRIERE IN", t2: "DER INDUSTRIE?", b: ["Keine Dienste.", "Abreißen: 0800-PHARMA"], i: "💼" },
  { bg: "#7a1fa2", t: "NEUBAU", b: ["Fertigstellung:", "2016 2019 2023 2029", "bald"], i: "🏗️" },
  { bg: "#b7791f", t: "TOILETTENPAPIER", b: ["nur auf Antrag", "Formular 88a", "Kostenstelle 4711"], i: "🧻" },
  { bg: "#1f7a8c", t: "WASSERSPENDER", b: ["2 € pro Becher", "Leitungswasser", "nach Kostenübernahme"], i: "🚰" },
  { bg: "#c0322a", t: "STELLENABBAU", b: ["Diese Stelle wurde", "abgebaut.", "Danke für Ihr Verständnis."], i: "✂️" },
  { bg: "#333333", t: "DEFIBRILLATOR", b: ["zur Wartung", "seit 2018", "Bitte nicht sterben."], i: "⚡" },
  { bg: "#e2483d", t: "WIR SIND", t2: "FAMILIE", b: ["Und Familie", "arbeitet unbezahlt."], i: "❤️" },
  { bg: "#6b4fd0", t: "RESILIENZ-", t2: "WORKSHOP", b: ["Lernen Sie, mehr auszuhalten.", "Damit wir mehr", "verlangen können."], i: "🧱" },
  { bg: "#1f7a8c", t: "WELLBEING-RAUM", b: ["Jetzt neu im Keller!", "(ehem. Besenkammer)", "Max. 3 Min. pro Quartal"], i: "🧖" },
  { bg: "#f2b33d", t: "DANKE!", b: ["Für Ihren Einsatz:", "1 Pizza Margherita", "für 40 Mitarbeitende"], i: "🍕" },
  { bg: "#34514c", t: "KPI DER WOCHE", b: ["Patientenzufriedenheit: 2/10", "Mitarbeiterzufriedenheit:", "nicht erhoben"], i: "📉" },
  { bg: "#2b7bb9", t: "MEHR ZEIT", t2: "FÜR PATIENTEN", b: ["durch weniger Personal.", "— Die Geschäftsführung"], i: "⏳" },
  { bg: "#c0322a", t: "APPLAUS!", b: ["2020 haben wir geklatscht.", "Das muss reichen."], i: "👏" },
  { bg: "#2d3f8f", t: "UNSER LEITBILD", b: ["Der Mensch im Mittelpunkt", "(der Kostenrechnung)"], i: "🎯" },
  { bg: "#1f9d55", t: "FEEDBACK?", b: ["Kritik bitte schriftlich", "an die Geschäftsführung.", "Briefkasten: zugeklebt."], i: "📮" },
  { bg: "#c13584", t: "FOLGE UNS!", b: ["@klinikum.st.sparen", "Wir posten, was wir", "nicht bezahlen."], i: "📱" },
];
const CREEPY_SCRAWL = ["DU GEHST NIE NACH HAUSE", "WIR SEHEN DEINE ÜBERSTUNDEN", "NICHT DOKUMENTIERT = NICHT PASSIERT", "Zimmer 13 ist frei. Für immer.", "Hier war Dr. Kurz · 2009 – ∞", "LAUF.", "Hinter dir: das Controlling", "Hildegard sieht alles", "Nur noch eine Aufnahme…"];
const GRAFFITI = ["ER GEHT NIE HEIM", "Dr. Ewig war hier · 2009", "NUR KURZ", "FEIERABEND IST EINE LÜGE", "Hilfe. Bin noch im Dienst.", "Budget: 0 €", "Dreh dich nicht um."];
const SAFE_NAMES = [["BEREITSCHAFTSRAUM", "Hier findet dich keiner"], ["STATIONSKÜCHE", "Kaffee: eingespart. Sofa: noch da."], ["ABSTELLKAMMER", "Perfekt zum Verstecken"], ["WÄSCHEKAMMER", "Riecht nach Station 4"]];

/* Escape missions. Each one is its own evening: own story and intro, own floors, own sub-missions, own deadline (game minutes after 17:00),
   own boss at the way out and own ride. The game clock runs at CLOCK game minutes per real second. */
const CLOCK = .5;
const ICU = 8;
const STORY_OPEN = [
  ["16:40", "Klinikum St. Sparen, Station 5B. Du bist seit 31 Stunden wach. Die Kaffeemaschine wurde im März eingespart. Der Kaffee auch.", 0],
  ["16:48", "Arztbrief Nummer 23. Das KIS stürzt ab. Es speichert nicht. Es hat noch nie gespeichert. Auf dem Zettel vom Controlling: „Bitte effizienter entlassen.“", 1],
];
const ROUTES = {
  stay: { name: "Einfach heim", title: "Feierabend", av: "🏠", color: "#1f9d55", deadline: 420, stars: 1, floors: [0, 1, 5, 6, 7], vehicle: "car", ride: "dein Auto",
    client: "Kim · per WhatsApp", tagline: "Du willst einfach nur noch nach Hause. Vor Mitternacht. Mehr nicht.",
    story: [["16:58", "Dein Handy vibriert. Kim.", 3, { kind: "chat", from: "Kim ❤️", msgs: [["them", "Kommst du heute pünktlich? 🍝"], ["them", "Ich koche. Ausnahmsweise."], ["them", "Wenn du nicht vor Mitternacht da bist, esse ich deine Portion. Und schlafe auf deiner Seite."], ["me", "Bin gleich weg. Versprochen 🙏"], ["them", "Das hast du gestern auch gesagt."]] }],
      ["17:00", "17:00. Dein Dienst ist offiziell vorbei. Ab jetzt läuft die Uhr: Bis Mitternacht musst du an deinem Auto sein. Vorher brauchst du: den Autoschlüssel (bei Dr. Kurz), deine Brotdose (Flur) und das Parkticket (Automat in der Notaufnahme).", 2]],
    goals: [
      { lvl: 0, id: "key", title: "Autoschlüssel", text: "Autoschlüssel von Dr. Kurz zurückholen", at: "friend:k", brief: "Dr. Kurz hat deinen Autoschlüssel „nur kurz“ ausgeliehen, um Brötchen zu holen. Das war um 9 Uhr. Er versteckt sich in einem Patientenzimmer." },
      { lvl: 0, id: "lunchbox", title: "Brotdose", text: "Deine Brotdose retten", at: "prop:grab", kind: "grab", spot: [16, 11], obj: "lunchbox", grab: ["🥪", "Retten", "Deine Brotdose. Seit Montag im Flur. Der Inhalt hat inzwischen einen eigenen Lebenslauf. Kim hat sie dir geschenkt. Ohne Brotdose brauchst du gar nicht heimkommen."], brief: "Die Brotdose von Kim steht seit Montag auf Station. Ohne sie brauchst du gar nicht heimkommen." },
      { lvl: 6, id: "ticket", title: "Parkticket", text: "Parkticket am Automaten ziehen", at: "prop:t", brief: "Die Schranke im Parkhaus öffnet nur mit Ticket. Der Automat steht hinten in der Notaufnahme, hinter 40 Pseudo-Notfällen. Er nimmt nur Münzen." }],
    boss: { type: "C", name: "Prof. Dr. Dr. h.c. mult. Übermut", role: "Chefarzt · steht neben deinem Auto", av: "🤴", color: "#9b6bff", weapon: "Visitenmappe", coat: "#f4f4f0",
      line: "„Ah, Kollege! Gut, dass ich Sie noch erwische. Hätten Sie fünf Minuten? Nur kurz die Kurven von morgen. Und Ostern.“",
      talk: ["„Meine Frau wartet. Sie ist Anwältin für Arbeitsrecht.“", "Er wird blass. „Ah. Arbeitsrecht. Natürlich. Gehen Sie. Grüßen Sie sie. Bitte nicht von mir.“"],
      form: "Er reicht dir den Dienstplan für Ostern. Und Pfingsten. Und ein Formular zur „freiwilligen Mehrarbeit“." },
    failText: "00:00. Kim hat deine Portion gegessen. Und den Nachtisch. Auf dem Kühlschrank klebt ein Zettel: „Wir müssen reden. Morgen. Wenn du Zeit hast. Haha.“",
    ticker: "Sensation im Klinikum St. Sparen: Arzt verlässt Gebäude vor Mitternacht. Personalabteilung prüft Konsequenzen.",
    failTicker: "Klinikum St. Sparen: Arzt verbringt 14. Nacht in Folge im Haus. „Er wollte es so“, sagt die Geschäftsführung." },
  pharma: { name: "Pharma", title: "Medical Advisor", av: "💊", color: "#2d6fd8", deadline: 300, stars: 2, floors: [0, 2, 3, 7], vehicle: "limo", ride: "die Limousine von Fr. Goldmann",
    client: "Fr. Goldmann · Pharmazeutika AG", tagline: "Firmenwagen, Homeoffice, keine Dienste. Unterschrift heute, 22:00, Parkhaus.",
    story: [["16:57", "Ein Videocall. Mitten in der Visite. Ein JOBANGEBOT. Deine Chance, endlich raus aus der Klinik. Am Bildschirm: eine Frau in einem Büro mit Ausblick und funktionierender Kaffeemaschine.", 3, { kind: "video", from: "Fr. Goldmann · Pharmazeutika AG", msgs: ["Wir suchen einen Medical Advisor. Firmenwagen, Homeoffice, keine Dienste. Kongresse mit Buffet.", "Bringen Sie Approbation, Arbeitszeugnis und ein bisschen Studienkompetenz mit.", "Ich unterschreibe heute um 22:00 im Parkhaus P2. In der Limousine. Danach fliege ich nach Davos. Ich warte keine Minute."] }],
      ["17:00", "17:00. Dein Dienst ist offiziell vorbei. Ab jetzt läuft die Uhr: Um 22:00 fährt die Limousine im Parkhaus ab. Mit oder ohne dich. Vorher holst du: Approbation (Spind), Arbeitszeugnis (Radiologie, seit drei Monaten zur Unterschrift) und den Studienordner „Wunderpille“ (Gastro).", 2]],
    goals: [
      { lvl: 0, id: "approbation", title: "Approbation", text: "Approbationsurkunde aus deinem Spind", at: "prop:L", brief: "Ohne Approbation nimmt dich keine Firma. Sie liegt im Spind, unter 14 Kugelschreibern und einer Banane aus dem letzten Quartal." },
      { lvl: 2, id: "zeugnis", title: "Arbeitszeugnis", text: "Arbeitszeugnis aus dem dunklen Befundungsraum", at: "item:&", brief: "„Er war stets bemüht.“ Seit drei Monaten zur Unterschrift in der Radiologie. Im Dunkeln. Natürlich." },
      { lvl: 3, id: "binder", title: "Studienordner", text: "Studienordner „Wunderpille“ im Gastro-Flur", at: "prop:grab", kind: "grab", spot: [5, 7], obj: "binder", grab: ["📂", "Mitnehmen", "Studie „Wunderpille“: 12 Probanden, 11 fühlen sich besser, einer ist umgezogen. Signifikant!"], brief: "Fr. Goldmann will „ein bisschen Studienkompetenz“ sehen. Der Ordner liegt im Gastro-Flur. Er riecht. Wie alles dort." }],
    boss: { type: "V", name: "Fr. Dr. jur. Regelwerk", role: "Compliance-Beauftragte · vor der Limousine", av: "⚖️", color: "#2d3f8f", weapon: "Compliance-Ordner", coat: "#3a3f4a",
      line: "„Halt. Jede Zuwendung über fünf Euro ist meldepflichtig. Diese Limousine kostet 400 Euro pro Stunde. Formular C-17, bitte. In dreifacher Ausfertigung.“",
      talk: ["„Ich habe den Kugelschreiber von 2019 nie benutzt.“", "Sie prüft ihn. Er schreibt nicht. „Nie benutzt. Korrekt. Sie dürfen passieren.“"],
      form: "Formular C-17: „Erklärung über den Erhalt geldwerter Vorteile (Limousine, Snacks, Hoffnung)“." },
    failText: "22:01. Die Limousine ist weg. Fr. Goldmann hat jemanden aus der Kardiologie genommen. Der hatte sein Zeugnis dabei. Und eine eigene PowerPoint.",
    ticker: "Pharmazeutika AG gewinnt erfahrene Fachkraft. Klinikum St. Sparen: „Wir haben das nicht kommen sehen.“ (Es war die 11. Kündigung diesen Monat.)",
    failTicker: "Pharmazeutika AG besetzt Stelle mit Kardiologen. Klinikum St. Sparen: „Wir freuen uns, dass Sie geblieben sind. Ihr Dienstplan ist im Postfach.“" },
  consult: { name: "Beratung", title: "Senior Consultant", av: "📊", color: "#e8682a", deadline: 240, stars: 3, floors: [0, 1, 6], vehicle: "stretch", ride: "die Limousine von McKinny",
    client: "Kevin (27) · McKinny Consulting", tagline: "Drei Beweisfotos und eine Excel. Die Limousine kommt um 21:00 an den Haupteingang.",
    story: [["16:56", "Eine Mail mit 14 Anhängen. Betreff: „Quick Win? 🚀“ Es ist ein JOBANGEBOT. Endlich ein Weg raus aus der Klinik.", 3, { kind: "slides", from: "McKinny Consulting · Healthcare Excellence", msgs: ["FOLIE 1 · Ihr Krankenhaus hat Potenzial. (Zum Sparen.)", "FOLIE 2 · Wir brauchen Beweise: drei Fotos von Ineffizienz und die Excel vom Controlling.", "FOLIE 3 · Unsere Limousine holt Sie um 21:00 am Haupteingang ab. Wir rechnen in 6-Minuten-Takten ab. Auch die Wartezeit."] }],
      ["17:00", "17:00. Dein Dienst ist offiziell vorbei. Ab jetzt läuft die Uhr: Um 21:00 hält die Limousine von McKinny am Haupteingang. Vorher sammelst du Beweise: Foto vom Faxgerät (deine Station), Foto der Wartezeit-Anzeige und die Excel von Hr. Paragraf (beides Orthopädie), Wartenummer 999 (Notaufnahme).", 2]],
    goals: [
      { lvl: 0, id: "photo0", title: "Beweisfoto: Fax", text: "Das Faxgerät fotografieren (in Betrieb!)", at: "prop:photo", kind: "photo", spot: [6, 5], obj: "fax", brief: "Ein Faxgerät. 2026. Es faxt gerade Befunde. Kevin wird weinen vor Glück." },
      { lvl: 1, id: "photo1", title: "Beweisfoto: Wartezeit", text: "Die Wartezeit-Anzeige fotografieren", at: "prop:photo", kind: "photo", spot: [5, 1], obj: "board", brief: "Die Anzeige im Gang zeigt „Wartezeit: 14 Std.“ Perfekt für Folie 12." },
      { lvl: 1, id: "excel", title: "Die Excel", text: "Hr. Paragraf (Controlling) die Excel abschwatzen", at: "enemy:V", brief: "Hr. Paragraf hat die Excel mit allen Kosten. 48 Reiter. Er gibt sie nicht her. Sprich ihn an. Ja, freiwillig." },
      { lvl: 6, id: "photo5", title: "Beweisfoto: Nr. 999", text: "Die Wartenummer 999 fotografieren", at: "prop:photo", kind: "photo", spot: [12, 1], obj: "ticketboard", brief: "Wartenummer 999, aufgerufen: 12. Das Deck schreibt sich von selbst." }],
    boss: { type: "O", name: "Hr. Solidar", role: "Betriebsrat · freigestellt seit 1998 · am Haupteingang", av: "✊", color: "#c0322a", weapon: "Tarifvertrag", coat: "#7a2a2a",
      line: "„Ein Arzt, der zur Unternehmensberatung wechselt? Um hier Stellen zu streichen? Nur über meine Leiche. Und über drei Gremien.“",
      talk: ["„Ich empfehle als Erstes: mehr Personal.“", "Er starrt dich an. Dann umarmt er dich. „Das hat noch nie ein Berater gesagt.“ Er weint ein bisschen."],
      form: "Antrag auf Anhörung des Betriebsrats, Anlage 4: „Begründung, warum Sie gehen (max. 3 Zeichen)“." },
    failText: "21:01. Kevin hat das Deck ohne dich gepitcht. Die Fotos hat er aus einer Stockfoto-Datenbank. Er wurde befördert. Die Limousine auch.",
    ticker: "McKinny Consulting empfiehlt Klinikum St. Sparen: 30 % weniger Licht, 50 % weniger Ärzte. Erster Berater: ein ehemaliger Arzt des Hauses.",
    failTicker: "McKinny Consulting: „Wir haben uns für einen Kandidaten mit mehr Folien entschieden.“ Klinikum St. Sparen spart weiter. Ohne Beratung. Wie immer." },
  botox: { name: "Ästhetik", title: "Ästhetische Dermatologie", av: "💉", color: "#ff7ab8", deadline: 300, stars: 2, floors: [0, 1, 4, 7], vehicle: "cabrio", ride: "das pinke Cabrio von Dr. Glatt",
    client: "Dr. Glatt · Praxis für Ästhetik", tagline: "Mo bis Do, 9 bis 15 Uhr. Probetag heute, Cabrio um 22:00.",
    story: [["16:55", "Eine Sprachnachricht. 4 Minuten 12. Ein JOBANGEBOT! Dein Weg raus aus der Klinik. Im Hintergrund plätschert ein Zimmerbrunnen.", 3, { kind: "voice", from: "Dr. Glatt 🧴", msgs: ["Hallo, hier ist Dr. Glatt, Praxis für Ästhetik. Wir kennen uns aus dem Aufzug. Ich biete dir einen Job in meiner Praxis an. Ehrlich gesagt: Deine Augenringe sind ein medizinischer Notfall.", "Komm zum Probetag in die Dermatologie. Approbation mitbringen. Und ein Vorher-Foto für Instagram: der Bizeps des Monats aus der Orthopädie.", "Ich hol dich um 22:00 im Parkhaus P2 ab, mit dem Cabrio. Danach: Mo bis Do, 9 bis 15 Uhr. Gurkenwasser steht bereit. Namasté."] }],
      ["17:00", "17:00. Dein Dienst ist offiziell vorbei. Ab jetzt läuft die Uhr: Um 22:00 wartet das pinke Cabrio im Parkhaus. Vorher brauchst du: Approbation (Spind), ein Vorher-Foto (Orthopädie) und den Probetag bei Dr. Glatt (Dermatologie).", 2]],
    goals: [
      { lvl: 0, id: "approbation", title: "Approbation", text: "Approbationsurkunde aus deinem Spind", at: "prop:L", brief: "Ohne Approbation keine Praxis. Sie liegt im Spind, unter 14 Kugelschreibern und einer Banane." },
      { lvl: 1, id: "bizepsfoto", title: "Vorher-Foto", text: "Das Poster „Bizeps des Monats“ fotografieren", at: "prop:photo", kind: "photo", spot: [3, 6], obj: "poster", brief: "Dr. Glatt braucht Vorher-Nachher-Bilder für Instagram. Vorher: Bizeps. Nachher: auch Bizeps, aber mit Glow." },
      { lvl: 4, id: "probe", title: "Probetag", text: "Probetag bei Dr. Glatt bestehen", at: "friend:e", brief: "Dr. Glatt will sehen, ob du „Dermatologie kannst“. Kleiner Test. Es geht vor allem um Gurken." }],
    boss: { type: "N", name: "Fr. Keimfrei", role: "Hygienefachkraft · lächelt nie (Keime) · vor dem Cabrio", av: "🧼", color: "#1f7a8c", weapon: "Desinfektionsspender", coat: "#e8f4f4",
      line: "„Stopp. Händedesinfektion. 30 Sekunden. Ich zähle mit. Und Ihr Kittel war seit 2019 nicht in der Wäsche. Das sehe ich unter UV-Licht.“",
      talk: ["„Ich desinfiziere seit 30 Sekunden. Innerlich.“", "Sie hält die UV-Lampe auf deine Hände. Sie leuchten. „Sauber. Verdächtig sauber. Gehen Sie.“"],
      form: "Hygieneprotokoll H-9: „Liste aller Oberflächen, die Sie heute berührt haben (alphabetisch)“." },
    failText: "22:01. Dr. Glatt ist zur Yogastunde gefahren. Ein Zettel am Parkplatz: „Namasté. Vielleicht nächstes Jahr. Deine Augenringe warten.“",
    ticker: "Neue Praxis für Ästhetik eröffnet: 9 bis 15 Uhr, keine Notfälle, Gurkenwasser. Klinikum St. Sparen meldet: Augenring-Abteilung jetzt unterbesetzt.",
    failTicker: "Praxis Dr. Glatt: Stelle vergeben an Influencerin ohne Approbation. „Sie hatte den besseren Glow.“" },
  ship: { name: "Kreuzfahrt", title: "Schiffsarzt", av: "🚢", color: "#1f7a8c", deadline: 360, stars: 3, floors: [0, 4, ICU, 5, 6], vehicle: "bus", ride: "der Hafen-Shuttle",
    client: "Kapitän Hansen · MS Sorgenfrei", tagline: "Karibik statt Keller. Ablegen um 23:00, der Shuttle wartet am Haupteingang.",
    story: [["16:54", "Ein Anruf mit Rauschen. Möwen im Hintergrund. Ein JOBANGEBOT! Raus aus der Klinik, rauf aufs Meer. Jemand ruft „Leinen los!“.", 3, { kind: "call", from: "Kapitän Hansen · MS Sorgenfrei", msgs: ["Ahoi! Unser Schiffsarzt ist in der Karibik geblieben. Liebe. Oder Rum.", "Wir legen heute um 23:00 ab. Bringen Sie Approbation, Sonnencreme, Reisetabletten und Ihren Koffer mit.", "Der Hafen-Shuttle wartet am Haupteingang. Häufigste Diagnose an Bord: Sonnenbrand. Zweithäufigste: Sonnenbrand nach dem Buffet."] }],
      ["17:00", "17:00. Dein Dienst ist offiziell vorbei. Ab jetzt läuft die Uhr: Um 23:00 fährt der Hafen-Shuttle. Vorher brauchst du: Approbation (Spind), Sonnencreme (Dermatologie), Reisetabletten (Intensivstation) und deinen Koffer (Keller, seit dem letzten abgesagten Urlaub).", 2]],
    goals: [
      { lvl: 0, id: "approbation", title: "Approbation", text: "Approbationsurkunde aus deinem Spind", at: "prop:L", brief: "Ohne Approbation lässt dich Kapitän Hansen nicht an Bord. Sagt er. Er hat selbst keine." },
      { lvl: 4, id: "cream", title: "Sonnencreme", text: "Dr. Glatts Wundercreme einpacken (LSF 50)", at: "item:+", done: () => run.picked.has("+"), brief: "Die Wundercreme von Dr. Glatt ist auch Sonnencreme. Und Nachtcreme. Und Ausrede." },
      { lvl: ICU, id: "meds", title: "Reisetabletten", text: "Reisetabletten aus dem Medikamentenraum der Intensiv", at: "prop:meds", kind: "meds", spot: [19, 8], obj: "meds", grab: ["💊", "Einpacken", "Reisetabletten. Haltbar bis 2019. Auf See zählt das nicht."], brief: "Der Medikamentenraum der Intensivstation ist abgeschlossen. Offiziell. Inoffiziell klemmt ein Kugelschreiber in der Tür." },
      { lvl: 5, id: "koffer", title: "Koffer", text: "Deinen Koffer aus dem Keller holen", at: "prop:grab", kind: "grab", spot: [16, 7], obj: "suitcase", grab: ["🧳", "Mitnehmen", "Dein Koffer. Gepackt für den Urlaub 2023, der wegen eines Dienstes ausfiel. Die Badehose ist noch drin. Und die Hoffnung."], brief: "Dein Koffer steht seit dem letzten abgesagten Urlaub im Keller. Neben Dr. Ewig. Der will auch mal raus." }],
    boss: { type: "O", name: "Hr. Schranke", role: "Pförtner · seit 1979 · am Haupteingang", av: "🗝️", color: "#6a4a2a", weapon: "Schlüsselbund", coat: "#5a5a6a",
      line: "„Ohne Besucherausweis kommt hier keiner raus. Auch Personal nicht. Vor allem Personal nicht. Wo wollen Sie überhaupt hin? Karibik? Ha!“",
      talk: ["„Ich bringe Ihnen eine Postkarte aus der Karibik mit.“", "Seine Augen werden feucht. „Seit 1979 hat mir keiner eine Postkarte geschickt.“ Er öffnet die Tür. Und salutiert."],
      form: "Antrag auf Verlassen des Gebäudes (Formular P-1), mit Begründung und Rückkehrdatum." },
    failText: "23:01. Die MS Sorgenfrei hat abgelegt. Kapitän Hansen winkt vom Oberdeck. Mit deiner Sonnencreme.",
    ticker: "MS Sorgenfrei sticht mit neuem Schiffsarzt in See. Erste Diagnose: Sonnenbrand. Klinikum St. Sparen schreibt den Dezember-Dienstplan neu.",
    failTicker: "MS Sorgenfrei legt ohne Arzt ab. „Wir haben einen Erste-Hilfe-Kasten“, so der Kapitän. Klinikum St. Sparen: „Unser Arzt bleibt. Er weiß es nur noch nicht.“" },
  influ: { name: "Medfluencer", title: "@dr.feierabend", av: "🤳", color: "#c13584", deadline: 390, stars: 2, floors: [0, 2, ICU, 4, 6], vehicle: "van", ride: "der Van von GlowUp Talents",
    client: "GlowUp Talents · Influencer-Agentur", tagline: "10.000 Follower bis 23:30. Dann Vertrag, Van und Ringlicht für immer.",
    story: [["16:53", "Eine Instagram-DM. Blauer Haken. 2,1 Mio. Follower. Ein JOBANGEBOT! Dein Ticket raus aus der Klinik.", 3, { kind: "insta", from: "glowup.talents ✔️", msgs: ["hey doc!! 💅 dein Reel „Wenn der OA ‚nur kurz‘ sagt“ hat 400k views 🔥🔥", "wir machen dich zum medfluencer!! 10.000 neue follower bis 23:30 und du bist unter vertrag ✨", "du brauchst: ringlicht, ein reel von der intensiv, ein collab mit @doc.wellness und 3 patienten-storys. der van holt dich um 23:30 am haupteingang ab 🚐💨"] }],
      ["17:00", "17:00. Dein Dienst ist offiziell vorbei. Ab jetzt läuft die Uhr: Um 23:30 holt dich der Van ab. Vorher brauchst du: das Ringlicht (dunkle Radiologie), ein Reel (Intensivstation, bestes Licht im Haus), ein Collab mit @doc.wellness (Dermatologie) und Storys aus der Notaufnahme. #feierabend", 2]],
    goals: [
      { lvl: 2, id: "ringlight", title: "Ringlicht", text: "Ringlicht aus dem dunklen Radiologie-Flur", at: "prop:grab", kind: "grab", spot: [5, 7], obj: "ringlight", grab: ["💡", "Mitnehmen", "Ein Ringlicht. In der Radiologie. Niemand weiß warum. +800 Follower allein für das Unboxing."], brief: "Ohne Ringlicht kein Content. Irgendwer hat eins in der Radiologie vergessen. Im Dunkeln. Natürlich." },
      { lvl: ICU, id: "reel", title: "Intensiv-Reel", text: "Reel drehen: „Ein Tag auf der Intensiv“", at: "prop:film", kind: "film", spot: [9, 2], obj: "reel", grab: ["🎬", "Drehen", "„Hey Leute, heute zeig ich euch die Intensiv!“ Die Pflege schaut dich an wie einen Keim. Du verpixelst alle. Auch dich. +3.200 Follower."], brief: "Die Intensiv hat das beste Licht im Haus und die strengste Pflege. Ein Reel, 15 Sekunden. Datenschutz? Später." },
      { lvl: 4, id: "collab", title: "Collab", text: "Selfie mit @doc.wellness", at: "friend:i", brief: "Die Influencerin in der Dermatologie hat 400.000 Follower. Ein Selfie, und der Algorithmus liebt dich." },
      { lvl: 6, id: "testi", title: "Patienten-Storys", text: () => `3 Patienten-Storys aufnehmen (${Math.min(3, run.testi || 0)}/3)`, done: () => (run.testi || 0) >= 3, at: "enemy:Z", brief: "Lass dich von Pseudo-Notfällen ansprechen. Jedes Gespräch ist eine Story. Diesmal SOLLST du reden." }],
    boss: { type: "V", name: "Dr. Schwärzung", role: "Datenschutzbeauftragte · am Haupteingang", av: "🔏", color: "#111111", weapon: "DSGVO-Kommentar", coat: "#222222",
      line: "„Moment. Haben Sie von allen 412 Personen in Ihren Videos eine schriftliche Einwilligung? Auch vom Patienten im Hintergrund? Auch von der Topfpflanze?“",
      talk: ["„Ich hab alle verpixelt. Auch mich. Auch die Pflanze.“", "Sie scrollt durch dein Reel. Nur Pixel. „Datenschutzrechtlich… einwandfrei. Künstlerisch fragwürdig.“ Sie tritt zur Seite."],
      form: "Datenschutz-Folgenabschätzung für 1 Reel (34 Seiten, Anhang B: Topfpflanze)." },
    failText: "23:31. Der Van ist weg. GlowUp Talents hat einen Zahnarzt unter Vertrag genommen, der beim Bohren tanzt. 2 Millionen Follower. Du hast 212. Davon 40 Bots.",
    ticker: "Neuer Medfluencer @dr.feierabend erklärt in 15 Sekunden, warum niemand mehr im Krankenhaus arbeiten will. 3 Mio. Aufrufe. Klinikum St. Sparen: „Kein Kommentar.“",
    failTicker: "Tanzender Zahnarzt erreicht 2 Mio. Follower. @dr.feierabend postet Story aus dem Arztzimmer: „Noch kurz Briefe. 🙃“ 12 Likes." },
};
/* the exit list as a sentence: "Du brauchst deine Approbation, dein Arbeitszeugnis und den Studienordner." */
const NEED = { key: "deinen Autoschlüssel", lunchbox: "deine Brotdose", ticket: "ein Parkticket", approbation: "deine Approbation", zeugnis: "dein Arbeitszeugnis", binder: "den Studienordner „Wunderpille“",
  photo0: "ein Beweisfoto vom Faxgerät", photo1: "ein Beweisfoto der Wartezeit-Anzeige", excel: "die Excel vom Controlling", photo5: "ein Beweisfoto von Wartenummer 999",
  bizepsfoto: "ein Vorher-Foto vom Bizeps des Monats", probe: "einen bestandenen Probetag", cream: "Sonnencreme (LSF 50)", meds: "Reisetabletten", koffer: "deinen Koffer",
  ringlight: "ein Ringlicht", reel: "ein Reel von der Intensiv", collab: "ein Collab-Selfie mit @doc.wellness", testi: "drei Patienten-Storys" };
const needList = R => { const a = R.goals.map(g => NEED[g.id] || g.title); return a.length > 1 ? a.slice(0, -1).join(", ") + " und " + a[a.length - 1] : a[0] || ""; };
const ROUTE_ORDER = ["stay", "pharma", "consult", "botox", "ship", "influ"];
/* what each exit offers, set against what the hospital gives you: [what, Klinikum St. Sparen, the offer] */
const DEALS = {
  stay: { org: "Zuhause", head: "Was dich zu Hause erwartet", hook: "🍝 Kims Pasta · 🛏️ eigenes Bett · 📵 Pager in der Schublade",
    rows: [["🍝 Abendessen", "Automat, Snickers, 1,80 €", "Kims Pasta. Warm. Mit Parmesan."], ["🛏️ Schlaf", "Bereitschaftsraum, Matratze von 1994", "dein Bett. Sechs Stunden am Stück."], ["📺 Abend", "Arztbriefe bis 23 Uhr", "eine Folge Serie. Vielleicht zwei."], ["📵 Pager", "vibriert", "liegt in der Schublade. Aus."]],
    perks: ["❤️ Kim", "🛋️ Sofa", "🌙 ein Abend ohne Klinik"] },
  pharma: { org: "Pharmazeutika AG", head: "Das Angebot", hook: "💶 11.500 € + Bonus · 🚗 Audi e-tron GT · 🌙 nie wieder Dienste",
    rows: [["💶 Gehalt", "4.900 € brutto, Stufe 2", "11.500 € + 20 % Bonus"], ["🕘 Arbeitszeit", "7:00 bis „gleich“", "9 bis 16 Uhr, Gleitzeit"], ["🌙 Dienste", "6 Nächte im Monat", "keine. Nie wieder."], ["🚗 Auto", "Parkticket 12 €/Std.", "Audi e-tron GT, auch privat"], ["✈️ Reisen", "Fortbildung im Keller", "Kongresse in Lissabon, Barcelona, Davos"], ["☕ Kaffee", "eingespart", "Barista im Foyer, Hafermilch"]],
    perks: ["🏠 3 Tage Homeoffice", "🎁 15.000 € Startbonus", "📵 kein Pager"] },
  consult: { org: "McKinny Consulting", head: "Das Angebot", hook: "💶 13.000 € + Bonus · ✈️ Business Class · 🏨 5 Sterne",
    rows: [["💶 Gehalt", "4.900 € brutto", "13.000 € + Bonus, Partner-Track"], ["🏨 Schlafen", "Bereitschaftsraum, Matratze von 1994", "5-Sterne-Hotel mit Spa, Mo bis Do"], ["✈️ Reisen", "Treppenhaus, 5 Stockwerke", "Business Class, Lounge, Meilen"], ["🌙 Wochenende", "Dienst", "frei. Freitags Homeoffice."], ["🎓 Fortbildung", "Pflicht, Samstag, unbezahlt", "MBA in Fontainebleau, bezahlt"], ["🍽️ Essen", "Kantinen-Schnitzel, kalt", "Spesen: großzügig"]],
    perks: ["💳 Firmen-Kreditkarte", "🚖 Limousine überallhin", "📈 Partner in 6 Jahren"] },
  botox: { org: "Praxis Dr. Glatt", head: "Das Angebot", hook: "🕘 Mo–Do 9–15 Uhr · 💶 9.000 € + 30 % Umsatz · 🚘 pinkes Cabrio",
    rows: [["🕘 Arbeitszeit", "60 Stunden pro Woche", "Mo bis Do, 9 bis 15 Uhr. Freitag frei."], ["💶 Gehalt", "4.900 € brutto", "9.000 € + 30 % vom Umsatz"], ["🚨 Notfälle", "jede Stunde", "keine. Höchstens ein Pickel."], ["🌙 Nächte", "6 im Monat", "nie"], ["🛋️ Arbeitsplatz", "Neonröhre, Schimmel", "Zimmerbrunnen, Duftkerzen, Barista"], ["🤝 Patienten", "„Nur ganz kurz …“", "buchen Termine. Und bezahlen sie."]],
    perks: ["🚘 Cabrio-Leasing", "✨ Behandlungen gratis", "🧘 Team-Yoga am Mittwoch"] },
  ship: { org: "MS Sorgenfrei", head: "Das Angebot", hook: "🌴 Karibik · 🛏️ Kabine mit Balkon · 🍹 All-inclusive",
    rows: [["🌴 Arbeitsort", "Station 5B, Fenster zum Hof", "Karibik, Mittelmeer, Fjorde"], ["🛏️ Wohnen", "Bereitschaftsraum", "Offizierskabine mit Balkon"], ["🍽️ Essen", "Automat, Snickers", "5 Restaurants, Buffet rund um die Uhr"], ["👔 Kleidung", "Kittel mit Kaffeefleck", "weiße Uniform mit Goldstreifen"], ["🚨 Notfälle", "Polytrauma um 3 Uhr", "Sonnenbrand, Seekrankheit"], ["🗓️ Urlaub", "„Gerade ganz schlecht.“", "4 Monate an Bord, 2 Monate frei"]],
    perks: ["🌅 Sonnenuntergang inklusive", "🐬 Delfine statt Oberarzt", "🎰 Offiziersrabatt im Casino"] },
  influ: { org: "GlowUp Talents", head: "Das Angebot", hook: "📱 2,1 Mio. Reichweite · 💸 5.000 € pro Post · 🌍 Bali, Dubai, Tulum",
    rows: [["📱 Reichweite", "Hausmitteilung (gelesen: 3)", "2,1 Mio. Follower ab Tag 1"], ["💸 Einkommen", "4.900 € brutto", "5.000 € pro Werbe-Post"], ["🕘 Arbeitszeit", "immer", "wann du willst. Hauptsache: Story."], ["🚐 Unterwegs", "Bus, Linie 7, 40 Minuten", "Van mit Fahrer und Ringlicht"], ["🌍 Reisen", "nie", "Content-Trips: Bali, Dubai, Tulum"], ["👕 Kleidung", "Kasack, Größe „passt schon“", "eigene Kollektion „Dr. Feierabend“"]],
    perks: ["✔️ Blauer Haken", "🎙️ eigenes Podcast-Studio", "🍹 Gästeliste, überall"] },
};

/* the gear you start with, and what it is for */
const KIT_HELP = {
  c: ["Tarnen", "Kittel ausziehen: Pflege, Ärzte und Verwaltung erkennen dich nicht mehr und drehen ab. Patienten und Angehörige fragen dich dafür nach der Toilette."],
  p: ["Ablenken", "Kugelschreiber werfen: Es klackt da hinten, alle drehen sich um und gehen nachsehen."],
  f: ["Verteidigen", "Fake-Telefonat: 10 Sekunden ernst ins Handy reden. Niemand vom Personal spricht dich an, wer schon auf dich zukommt, dreht ab."],
  m: ["Abstand", "Noro-Maske: 15 Sekunden lang hält JEDER Abstand (Patienten, Angehörige, Personal). Hust."],
  "2": ["Unsichtbar", "Klemmbrett: 12 Sekunden lang so beschäftigt wirken, dass dich niemand sieht."],
};
const ANNOUNCE = [
  "Die Gehaltserhöhung wurde dieses Jahr in Wertschätzung ausgezahlt. Bitte prüfen Sie Ihr Herz.",
  "Herzlichen Glückwunsch an Station 5B: null Krankmeldungen! Wer krank war, kam trotzdem.",
  "Das Controlling bittet, Reanimationen künftig unter 20 Minuten zu halten. Ab Minute 21 wird es unwirtschaftlich.",
  "Der Ruheraum ist ab sofort ein Besprechungsraum. Ruhe finden Sie nach Dienstende. Theoretisch.",
  "Die Mitarbeiterbefragung ergab 98 Prozent Unzufriedenheit. Die Befragung wird daher eingestellt.",
  "Notaufnahme: Die Wartezeit beträgt elf Stunden. Selbstzahler-Express: 499 Euro, zwei Stunden. Wir wünschen gute Besserung.",
  "Der Personalschlüssel wurde optimiert. Ab heute gilt: eine Pflegekraft zu ja.",
  "Liebe Mitarbeitende, ab sofort ist Lächeln Teil der Dienstkleidung. Bitte tragen Sie es korrekt.",
  "Der Kaffeeautomat im 2. OG ist wieder in Betrieb. Er nimmt nur noch Münzen von 1997.",
  "Die Geschäftsführung bedankt sich für 1,2 Millionen Überstunden. Als Dank gibt es: diese Durchsage.",
  "Wegen Sparmaßnahmen wird jede zweite Durchsage gestrichen.",
  "Der Defibrillator im Erdgeschoss ist zur Wartung. Seit 2018. Bitte sterben Sie im 1. OG.",
  "Die Burnout-Prävention am Samstag um 7 Uhr ist Pflicht. Unentschuldigtes Fehlen wird als Burnout gewertet.",
  "Das Klinikum St. Sparen ist erneut „Top-Arbeitgeber“. Die Urkunde haben wir selbst gedruckt.",
  "Hr. Dr. Kurz, bitte den Autoschlüssel zurückbringen. Oder die Brötchen. Oder beides.",
  "Die Kantine bietet heute: Kartoffeln. Morgen: die Kartoffeln von heute.",
  "Ab Montag ist Toilettenpapier antragspflichtig. Formular 88a, erhältlich auf der Toilette. Ohne Papier.",
  "Liebe Patientinnen und Patienten, die Wartezeit beträgt aktuell 14 Stunden. Wir arbeiten daran, das zu erhöhen.",
  "Der Neubau wird 2029 fertig. Ursprünglich geplant: 2016. Wir sind stolz auf unsere Konstanz.",
  "Im Rahmen des Programms „Green Hospital“ wird das Licht in allen Fluren gedimmt. Bitte nicht stolpern. Stolpern ist nicht budgetiert.",
  "Die Personalabteilung erinnert: Überstunden, die nicht erfasst werden, gibt es nicht. Philosophisch gesehen.",
  "Hr. Hausmeister Schraube, bitte in den Keller. Dr. Ewig hat wieder die Sicherungen gegessen.",
  "Die Ärztin oder der Arzt vom Dienst wird gebeten, nicht nach Hause zu gehen. Danke für Ihr Verständnis.",
];

/* ---------- Night shift (survival mode) ---------- */
ENV.night = { theme: "ward", fog: 0x05080a, near: 2, far: 17, hemi: .12, amb: .06, dir: .04, flicker: .5, broken: .25, creep: 0, lamp: 0x9ab0c0, dark: true, storm: true };
TYPES.Q = { label: "SCHLAFWANDLER", role: "Patient · schläft (eigentlich)", who: () => rnd(["Hr. Brösel, Zi. 5.03", "Fr. Mond, Zi. 5.07", "Hr. Gähn, Flurbett 3", "Fr. Nacht, Zi. 5.11", "Hr. Grau, Zi. 5.02"]), av: "🧟", color: "#9fb8d8",
  spec: () => ({ skin: rnd([0xc9d0c4, 0xd8d0c4, 0xbfc8bc]), hair: 0x8c8c8c, hairStyle: rnd(["messy", "bald"]), gown: true, shirt: 0x9cc6e6, pants: 0x9cc6e6, shoes: 0xd9d4c8, pose: "zombie", mood: "tired", glowEyes: true, acc: rnd(["iv", null]) }),
  walk: .32, approach: .72, range: 5, fov: .35, detect: .62, barks: ["Herr… Doktor…", "Ist… schon… Frühstück?", "Bleib… da…", "Mmmh… Schlaftablette…"] };
TYPES.J = { label: "SCHW. HILDEGARD", role: "Nachtwache · seit 1978", who: () => "Schwester Hildegard", av: "🕯️", color: "#e8e4d0",
  spec: () => ({ skin: 0xd8d0c8, hair: 0xf2f2f2, hairStyle: "bun", shirt: 0xf2efe6, pants: 0xf2efe6, robe: true, shoes: 0xf2f2f2, mood: "neutral", acc: "chart", scale: .97 }),
  walk: 0, approach: 2.3, range: 99, fov: -1, detect: 0, barks: ["…", "Kurven…", "Abzeichnen…"] };
LEVELS.push({ key: "night", short: "5B · NACHTDIENST", name: "Station 5B · Nachtdienst", floor: "5. OG", room: 5, env: "night", final: true, night: true,
  safeNames: [["ARZTZIMMER 5B", "Hier bist du sicher. Fast."]],
  tip: "Überlebe bis 07:30, ohne dass dich jemand findet. Die Patienten schlafwandeln mit roten Augen über die Flure, die Nachtschwestern machen Runde. Wer dich erwischt, zählt: Dreimal gefunden, und die Nacht ist vorbei. Der Pager schickt dich trotzdem in die Zimmer.",
  objectives: [], exitText: "", lock: "Das Treppenhaus ist nachts verriegelt. Dienstende 07:00.",
  // a bigger ward with loops: two ring corridors, a cross corridor and side corridors, so you can always slip away (or get cornered)
  map: ["###################################", "#B::B#B::B#B::B#B::B#B::B#B::B#B:B#", "#::::#::::#::::#::x:#::::#::::#:9:#", "#::::#::::#::$:#::::#::::#::::#:::#", "##d####d####d####d####d####d####d##", "#........w....o.....N...Q.........#", "#..###d#####d###..##############..#", "#..#_____#:::::#..#:::::#::::::#..#", "#..#_S___#:::::#..#:::::#:w::::#..#", "#..#_____#:::::#..#::3::#::::::#..#", "#E.#__1__#::1::#.N#:::::#::9:::#..^", "#..#_____#:::::#..#:::::#::::::#..#", "#..#_____#::::M#..#::x::#::::w:#Q.#", "#..#_____#:::::#..#:::::#::::::#..#", "#..#############..###d#####d####..#", "#.....u....Q................w.....#", "##d####d####d####d####d####d####d##", "#::::#::::#:Q::#::::#::::#::x:#:::#", "#::$:#::::#::::#::::#::::#::::#:1:#", "#B::B#B::B#B::B#B::B#B::B#B::B#B:B#", "###################################"] });
LEVELS.push({ key: "nightER", short: "ZNA · NACHTDIENST", name: "Zentrale Notaufnahme · Nachtdienst", floor: "EG", room: 0, env: "night", final: true, night: true,
  safeNames: [["PERSONALRAUM", "Die Tür klemmt. Gut so."]],
  tip: "Die Notaufnahme bei Nacht: Wartehalle, Behandlungskabinen mit Vorhängen, der Schockraum. Die Wartenden sind eingeschlafen. Im Stehen. Mit roten Augen. Lass dich von niemandem finden, bis um 07:30 die Ablösung kommt.",
  objectives: [], exitText: "", lock: "Der Ausgang ist nachts verriegelt. Ablösung um 07:30.",
  map: ["####################^############", "#.......#.....................S.#", "#.%..%..#.......................#", "#.......#.......................#", "#.......#.....Q...........TT....#", "#...x...#...............Q...N...#", "#.......#.3.....................#", "#.......####..########..######.##", "#.........Q.....................#", "#.||#||#||#||#||####d######d###.#", "#.:5#::#::#::#::#::::::::#1___#.#", "#.B:#B:#B:#B:#B:#:x::Y:::#___0#.#", "#.#############################.#", "#.....x....................w....#", "########M#######t#######L######E#", "#################################"] });
const MISSION_LEVELS = 8; // legacy (night mode stats)
const NIGHT_START = 300, NIGHT_END = 870, NIGHT_DAWN = 810; // 22:00 … 07:30 handover, first light at 06:30
const STORY_NIGHT = [
  ["21:58", "Station 5B, Arztzimmer. Du hast Nachtdienst. Allein. Für 34 Patienten, zwei Stationen und „bei Bedarf“ die Notaufnahme."],
  ["22:00", "Der Spätdienst geht. „Alles ruhig. Die Patienten schlafwandeln manchmal. Mit offenen Augen. Rot. Ist normal. Und Schwester Hildegard macht ihre Runde.“ – „Welche Hildegard?“ – Er ist schon weg."],
  ["22:01", "Regel Nummer eins im Nachtdienst: Lass dich nicht finden. Wer dich findet, will etwas. Dreimal gefunden, und du kommst hier nie wieder raus. Überlebe bis 07:30."],
];
const STORY_NIGHT_ER = [
  ["21:58", "Zentrale Notaufnahme, Personalraum. Nachtdienst. Allein. Für 41 Wartende, sechs Kabinen, einen Schockraum und „bei Bedarf“ alle Stationen im Haus."],
  ["22:00", "Der Spätdienst übergibt im Rausgehen: „Wartehalle ist voll. Manche warten seit gestern. Ein paar sind im Stehen eingeschlafen. Mit offenen Augen. Rot. Ist normal. Und Schwester Hildegard macht die Triage.“ – „Welche Hildegard?“ – Die Schiebetür schließt sich hinter ihm."],
  ["22:01", "Die Wartenummer-Anzeige springt auf 999. Dann auf 000. Die Schiebetür geht auf. Niemand kommt herein. Regel Nummer eins: Lass dich nicht finden. Wer dich findet, will etwas. Dreimal gefunden, und du kommst hier nie wieder raus. Überlebe bis 07:30."],
];
const NIGHT_HOURS_ER = [
  ["22:00", "Übergabe", "Der Pager schickt dich in die Kabinen. Erledige die Aufgaben, bevor die Zeit abläuft."],
  ["23:00", "Wartehalle", "Die Wartenden sind eingeschlafen. Im Stehen. Mit roten Augen. Sie schlurfen Richtung Anmeldung."],
  ["00:00", "Geisterstunde", "Die Schiebetür öffnet sich von allein. Draußen ist niemand. Drinnen jetzt schon: Dr. Ewig aus dem Keller."],
  ["01:00", "Triage nach Hildegard", "Am Ende der Wartehalle: eine Schwesternhaube. Sie sortiert nach Dringlichkeit. Sie bewegt sich nur, wenn du NICHT hinsiehst."],
  ["02:00", "Nachtstrom", "Das Haus schaltet in den Sparmodus. Der Schockraum geht aus. Die Monitore piepen trotzdem weiter."],
  ["03:00", "Besuch von draußen", "Familie Kowalski bringt Opa. „Er hat seit 2019 Rücken. Wir waren gerade in der Gegend.“ Alle sieben."],
  ["04:00", "RTW-Welle", "Drei Rettungswagen gleichzeitig. Keiner hat einen Patienten dabei. Nur Formulare. Die Wartehalle füllt sich trotzdem."],
  ["05:00", "Frühaufsteher", "Der Chefarzt kommt früher. Er will „nur kurz die Wartezeiten sehen“."],
  ["06:00", "Morgengrauen", "Ab 06:30 wird es draußen hell. Sie spüren, dass die Nacht endet. Alle werden schneller. Hildegard mag keine Übergaben."],
  ["07:00", "Übergabe", "Um 07:30 kommt der Frühdienst. Schaff es in den Personalraum zur Übergabe. Ohne gefunden zu werden."],
];
const NIGHT_TASKS_ER = [
  "Wartenummer 312 fragt, wie lange noch (wartet seit 14 Uhr)", "Zeh gestoßen. Vor drei Wochen. Jetzt hat er Zeit", "will eine Krankmeldung. Für gestern", "hat Dr. Google gefragt: entweder nichts oder Ebola",
  "RTW bringt jemanden, der „nur mal gucken“ wollte", "Betrunkener singt im Schockraum. In Dur", "will das WLAN-Passwort. Um drei Uhr", "Fieber 37,9 °C, mit dem Taxi gekommen, Taxi wartet",
  "Schnitt am Finger, 40 Fotos davon auf dem Handy", "Monitor zeigt Asystolie (Elektrode ab)", "Bauchschmerzen seit 2017, heute Nacht besonders", "hat sich selbst eingewiesen. Wegen Langeweile",
];
/* night shift wording that depends on where you spend it */
const nightER = () => !!(run && run.place === "er");
const nightRoom = r => (nightER() ? "Kabine " : "Zi. ") + r;
const nightSafe = () => nightER() ? "Personalraum" : "Arztzimmer", nightSafeTo = () => nightER() ? "in den Personalraum" : "ins Arztzimmer", nightSafeIn = () => nightER() ? "im Personalraum" : "im Arztzimmer";
const nightPlace = () => nightER() ? "Notaufnahme" : "Station 5B";
const nightHours = () => nightER() ? NIGHT_HOURS_ER : NIGHT_HOURS;
const NIGHT_HOURS = [
  ["22:00", "Übergabe", "Der Pager schickt dich in die Zimmer. Erledige die Aufgaben, bevor die Zeit abläuft."],
  ["23:00", "Schlafenszeit", "Die Patienten schlafen. Einige davon im Stehen. Auf dem Flur. Mit roten Augen."],
  ["00:00", "Geisterstunde", "Die Wanduhr schlägt zwölf. Sie hat keine Glocke. Dr. Ewig ist aus dem Keller hochgekommen."],
  ["01:00", "Schwester Hildegard", "Am Ende des Flurs: eine Schwesternhaube. Sie bewegt sich nur, wenn du NICHT hinsiehst."],
  ["02:00", "Nachtstrom", "Das Haus schaltet in den Sparmodus. Stromausfälle. Türen fallen von allein zu."],
  ["03:00", "Besuchszeit (inoffiziell)", "Familie Kowalski war „gerade in der Gegend“. Um drei Uhr nachts. Alle sieben."],
  ["04:00", "Die Notaufnahme ist voll", "Die ZNA schickt Pseudo-Notfälle hoch. „Nur zur Beobachtung.“"],
  ["05:00", "Frühaufsteher", "Der Chefarzt kommt früher. Er will „nur kurz die Kurven sehen“."],
  ["06:00", "Morgengrauen", "Ab 06:30 wird es draußen hell. Sie spüren, dass die Nacht endet. Alle werden schneller. Hildegard mag keine Übergaben."],
  ["07:00", "Übergabe", "Um 07:30 kommt der Frühdienst. Schaff es ins Arztzimmer zur Übergabe. Ohne gefunden zu werden."],
];
const NIGHT_TASKS = [
  "will wissen, wie spät es ist", "Infusion piept (sie piept immer)", "Patientin sieht Geister (sie hat recht)", "will eine Schlaftablette, aber homöopathisch",
  "hat die Braunüle gezogen. Selbst. Mit Stolz.", "Blutzucker 487 (Schokoladen-Schmuggel)", "will das WLAN-Passwort. Um drei Uhr.", "Bettnachbar schnarcht in Dur",
  "ist aus dem Bett gefallen. Ins andere Bett.", "Fieber 37,9 °C, Angehörige schon informiert (per WhatsApp)", "will Frühstück. Jetzt.", "Monitor zeigt Asystolie (Elektrode ab)",
];
