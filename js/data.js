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
            n gastroenterologist · Z pseudo-emergency · D PD Dr. Phil · g ghost · q moving car
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
  park:  { theme: "park", fog: 0x1d1a14, near: 3, far: 24, hemi: .28, amb: .16, dir: .05, flicker: .25, broken: .15, creep: 2, lamp: 0xffb35a },
};

const LEVELS = [
  { key: "innere", short: "5B · INNERE", name: "Station 5B · Innere Medizin", floor: "5. OG", room: 5, env: "ward",
    safeNames: [["ARZTZIMMER 5B", "Bitte nicht stören (stört trotzdem jeder)"], ["STATIONSKÜCHE", "Kaffee: eingespart. Sofa: noch da."]],
    tip: "Die Internisten hier sind Nerds: Wer dich erwischt, will Differentialdiagnosen hören. Ein seltener Fallbericht lenkt sie ab. Türen kannst du öffnen und hinter dir schließen.",
    objectives: [
      { id: "key", title: "Der Schlüsseldienst", text: "Autoschlüssel von Dr. Kurz zurückholen", main: true, at: "friend:k",
        brief: "Dr. Kurz hat deinen Autoschlüssel „nur kurz“ ausgeliehen, um Brötchen zu holen. Das war um 9 Uhr. Er versteckt sich in einem Patientenzimmer. Da sucht ihn niemand." },
      { id: "approbation", title: "Spind-Raid", text: "Approbationsurkunde aus dem Spind (Umkleide)", at: "prop:L",
        brief: "Ohne Approbation nimmt dich keine Firma. Sie liegt im Spind, unter 14 Kugelschreibern und einer Banane aus dem letzten Quartal." },
      { id: "secret1", title: "Die Abkürzung", text: "Frau Bozkurt nach dem Geheimgang fragen", at: "friend:b",
        brief: "Frau Bozkurt putzt hier seit 1994 und kennt jeden Gang. Auch die, die es laut Bauplan nicht gibt." }],
    exitText: "Treppenhaus → Orthopädie", lock: "Ohne Autoschlüssel bringt dir das Parkhaus nichts. Erst zu Dr. Kurz.", reaRandom: true,
    map: ["#########################", "#1__v#:B:B#:::#:B:B:#:L:#", "#_S__#::::#:k:#:::::#:::#", "#____#::$:#1::#::P::#:::#", "###d###d####d####d####d##", "#.........I.........x...#", "#.##d###.##d###.###d###.#", "#.#____#.#:::x#.#:::::#.#", "#b#_M__#F#:7::#O#:B:P:#.#", "#.#____#.#::::#.#:::::#.#", "#.###H##.###d##.##d##^###", "#..2...x...I...3....N..E#", "############l############"] },
  { key: "ortho", short: "4 · ORTHOPÄDIE", name: "Orthopädie · 4. OG", floor: "4. OG", room: 4, env: "ortho",
    safeNames: [["UMKLEIDE", "Riecht nach Deo und Verzweiflung"]],
    tip: "In der Orthopädie stehen die Orthopäden einfach im Flur herum, zwischen zwei Sätzen Bizeps-Curls. Lauchige Futzis wie Internisten lassen sie nicht durch. Beweise, dass du keiner bist: Proteinshake, Fachwissen, Liegestütze. Oder Schmeicheln.",
    objectives: [
      { id: "gates", title: "Bizeps-Bürokratie", text: () => `An den Orthopäden vorbeikommen (${bouncersCleared()}/${bouncersTotal()})`, main: true, at: "bouncer", done: () => bouncersCleared() >= bouncersTotal(),
        brief: "Drei Orthopäden stehen im Flur herum und halten jeden für einen Internisten. Internisten kommen hier nicht durch. Zu lauchig. Beweis das Gegenteil: Shake, Liegestütze, Rotatorenmanschette oder ein ehrliches Kompliment für den Bizeps." },
      { id: "protein", title: "Flüssige Bestechung", text: "Proteinshake aus dem Kraftraum", at: "item:6", done: () => run.picked.has("6"),
        brief: "Im Kraftraum steht ein Proteinshake. Vanille. Für Orthopäden die härteste Währung der Welt." }],
    exitText: "Treppenhaus → Radiologie", lock: "", headhunter: true,
    map: ["################l########", "#S........x.....O.......#", "####d#######d#######d####", "#:::::::#:Y:::x:#_______#", "#6::Y:::#:::::::#_____1_#", "############U############", "#..............D......w.#", "#.....#.V.........#.....^", "#............x..........#", "###U#####################", "#..x........O...........#", "######d########d#######U#", "#::::::::P::#:::2::::##E#", "#::0::::::::#:::::B::####", "########l################"] },
  { key: "radio", short: "3 · RADIOLOGIE", name: "Radiologie · 3. OG", floor: "3. OG", room: 3, env: "radio",
    safeNames: [["DUNKELKAMMER", "Dunkel. Ruhig. Perfekt."]],
    tip: "Die Radiologie spart Strom, indem sie grundsätzlich im Dunkeln befundet. Die Taschenlampe hilft beim Sehen, verrät dich aber. Tipp auf LAMPE, um sie auszuschalten. Im MRT-Raum: kein Metall!",
    objectives: [
      { id: "rea3", title: "Licht aus, Herz aus", text: "REA-Alarm im CT", main: true, at: "rea",
        brief: "Im CT hat ein Patient keinen Puls. Das Notfallteam wurde 2021 eingespart. Du bist jetzt das Notfallteam." },
      { id: "zeugnis", title: "Stets bemüht", text: "Arbeitszeugnis aus dem Befundungsraum", at: "item:&",
        brief: "Dein Arbeitszeugnis liegt seit drei Monaten zur Unterschrift in der Radiologie. Im Dunkeln. Die Pharma will es sehen." }],
    exitText: "Treppenhaus → Gastroenterologie", lock: "Im CT wird reanimiert. Du gehst jetzt nicht.", reaScript: 8,
    map: ["#########################", "#S......................#", "#.####d#######d########.#", "#.#:Y:::::#:::::::::::#.#", "#.#:::r:::#:::::m:::::#.^", "#O#:::::::#:::::::::::#.#", "#.######d#########d####.#", "#...........A.........x.#", "#.####d######d#########.#", "#.#::::::9#:::::#_____#.#", "#9#:&:::A:#:::B:#_____#.#", "#.#:::::::#:x:::#_____#.#", "#.####l######d#####d###.#", "#.................C.9...#", "############E############", "#########################"] },
  { key: "gastro", short: "2 · GASTRO", name: "Gastroenterologie · Endoskopie", floor: "2. OG", room: 2, env: "gastro",
    safeNames: [["ENDO-AUFWACHRAUM", "Niemand wacht hier freiwillig auf"]],
    tip: "Die Lüftung wurde 2017 eingespart. Seitdem riecht die Gastroenterologie nach… Gastroenterologie. Die grünen Wolken kosten Energie und Nerven. Luft anhalten hilft nicht. Lüftung einschalten schon.",
    objectives: [
      { id: "vent", title: "Operation Frischluft", text: "Lüftung im Endoskopie-Raum einschalten", main: true, at: "prop:y",
        brief: "Im Endoskopie-Raum hängt der Lüftungsschalter. Aus „Kostengründen“ seit 2017 aus. Die Gastroenterologen merken nichts mehr. Du schon." }],
    exitText: "Treppenhaus → Dermatologie", lock: "Ohne Lüftung gehst du hier nicht durch. Du würdest es nicht überleben. Dein Kittel auch nicht.",
    map: ["###########################", "#S......nffff.P...........#", "#.###d#######d######d####.#", "#.#:\"\":::#:::::::#:B::::#.#", "#.#:B::B:#::y::::#::::B:#.^", "#f#::::::#:::::::#::::::#.#", "#f##########l############.#", "#...$............nfffff...#", "#f####d######d#######d###.#", "#f#:::::::#______#:::::9#f#", "#n#::x::\"\"#_0__1_#::B:::#f#", "#.#:::::::#______#::::::#f#", "#.#######################.#", "#........x....ffff....N...#", "#########################E#"] },
  { key: "derma", short: "1 · DERMATOLOGIE", name: "Dermatologie · Rettungsstation", floor: "1. OG", room: 1, env: "derma", safe: true,
    safeNames: [],
    tip: "Geschafft: die Dermatologie. Holzboden, Gurkenduft, niemand hat Dienst. Die Wellness-Liegen füllen Energie auf. Und vielleicht gibt es einen Job mit Feierabend um 15 Uhr.",
    objectives: [
      { id: "spa", title: "Gurkenscheiben-Protokoll", text: "Bei Dr. Glatt melden (oder auf eine Wellness-Liege)", main: true, at: "friend:e",
        brief: "Die Dermatologie ist die einzige Abteilung mit Feierabend. Dr. Glatt besteht auf einer Behandlung, bevor du weiterdarfst. Medizinisch notwendig, sagt sie." },
      { id: "cream", title: "Glanz für unterwegs", text: "Wundercreme einpacken", at: "item:+", done: () => run.picked.has("+"),
        brief: "Die Wundercreme von Dr. Glatt: +1 Nerv, +60 Energie. Nebenwirkung: Du glänzt." }],
    exitText: "Treppenhaus → Keller", lock: "Dr. Glatt besteht auf Wellness. Ohne Gurkenscheibe kein Weiterkommen.",
    map: ["#########################", "#:::::::#:::::::#:::::::#", "#::W::::#::W:W::#:+:R:+:#", "#:::::::#:::::::#:::::::#", "####d#######d#######d####", "#S.......$...R.......i..^", "######d#########d######.#", "#:::::::::::#:::::::###E#", "#:+:::e::R::#:::W:::#####", "#:::::::::::#:::::::#####", "#########################"] },
  { key: "cellar", short: "UG · KELLER", name: "Keller · Pathologie & Archiv", floor: "UG", room: 0, env: "cellar", envOn: "cellarOn",
    safeNames: [["WERKSTATT", "Hausmeister Schraube · Zutritt nur mit Bier"]],
    tip: "Das Treppenhaus ins EG ist gesperrt (Brandschutzbegehung seit 2021). Der Weg führt durch den Keller. Strom: weg. Wartung: gestrichen. Und Dr. Ewig ist noch da.",
    objectives: [
      { id: "fuse", title: "Keine Sicherung, kein Feierabend", text: "Ersatzsicherung beim Hausmeister holen", main: true, at: "friend:h",
        brief: "Hausmeister Schraube hat eine Ersatzsicherung. Privat gekauft, im Baumarkt. Er sitzt in seiner Werkstatt und hört Radio von 1987." },
      { id: "power", title: "Es werde Licht", text: "Sicherung im Technikraum einsetzen", main: true, at: "prop:G",
        brief: "Sicherungskasten im Technikraum. Danach geht die elektrische Tür zum Treppenhaus auf. Dr. Ewig mag kein Licht." }],
    exitText: "Treppenhaus → Notaufnahme", lock: "Die Tür zum Treppenhaus ist elektrisch. Ohne Strom bleibt sie zu.", blackouts: true, fogOfWar: true,
    map: ["#########################", "#S..o...........u.......#", "#.####d#####.####d#####.#", "#.#:x::::::#.#::::::::#.#", "#.#::Y::Y::#X#:::::x::#.#", "#.#::::::::#.#::::::::#.#", "#.#######d##.##d#######.#", "#.....x.....g.....V.....#", "#.###d######.#####d####.#", "#.#________#.#::::::::#.#", "#9#___h____#z#::::::::#.^", "#.#________#.#::::::G:#.#", "#.######d###.###d######.#", "#....z..............o.0.#", "#######################E#", "#########################"] },
  { key: "er", short: "EG · NOTAUFNAHME", name: "Zentrale Notaufnahme", floor: "EG", room: 0, env: "er",
    safeNames: [["PERSONALRAUM", "Hier gibt es seit 2017 keinen Kaffee mehr"]],
    tip: "Wartezeit: 9 Stunden. Aus dem Wartezimmer schlurfen Pseudo-Notfälle: Schnupfen seit drei Wochen, Zeckenbiss 2019, Rezept nur kurz. Sie sind langsam. Triagiere sie weg.",
    objectives: [{ id: "ticket", title: "Das teuerste Stück Papier", text: "Parkticket am Automaten ziehen", main: true, at: "prop:t",
      brief: "Die Schranke im Parkhaus öffnet nur mit Ticket. Der Automat steht hinten in der Notaufnahme, hinter 40 Pseudo-Notfällen. Er nimmt nur Münzen." }],
    exitText: "Ausgang → Parkhaus", lock: "Ohne Parkticket kommst du aus dem Parkhaus nie raus. Erst zum Automaten.", reaRandom: true, horde: true,
    map: ["####################^############", "#.......#.....................S.#", "#.%..%..#..~....~....~..........#", "#.......#.......................#", "#.......#.....Z...........TT....#", "#...x...#...............Z...N...#", "#.......#.3.....................#", "#.......####..########..######.##", "#.........Z........O............#", "#.||#||#||#||#||####d######d###.#", "#.:5#::#::#::#::#::::::::#1___#.#", "#.B:#B:#B:#B:#B:#:x::Y:::#___0#.#", "#.#############################.#", "#.....x....................w....#", "########M#######t#######L######E#", "#################################"] },
  { key: "park", short: "P2 · PARKHAUS", name: "Parkhaus P2 · Personal", floor: "P2", room: 0, env: "park", safeNames: [],
    tip: "Das Personalparkhaus. Die Ärzteparkplätze wurden 2022 gestrichen, du parkst ganz hinten. Die Schranke öffnet nur mit Ticket. Der Chef parkt gerade aus. Rückwärts. Ohne zu schauen.",
    objectives: [
      { id: "barrier", title: "Schranke des Schicksals", text: "Schranke mit Parkticket öffnen", main: true, at: "prop:=",
        brief: "Die Schranke. 12 Euro für neun Stunden Überstunden-Parken. Steck das Ticket rein und bete." },
      { id: "car", title: "Freiheit, Diesel", text: "Zu deinem Auto", main: true, at: "prop:j",
        brief: "Dein Auto. Ganz hinten. Es hat Staub angesetzt. Du auch." }],
    exitText: "", lock: "", final: true,
    map: ["#################", "#S......a.a.a...#", "#.a.a.a.......a.#", "#.......a.a.a.D.#", "#.a.a.a.......a.#", "#.q.............#", "########=########", "#.a.a.....a.a.a.#", "#...........q...#", "#.a.a.a.O.a...j.#", "#################"] },
];

const PLAN = ["Innere: Dr. Kurz hat deinen Autoschlüssel. Übergabe machen, Schlüssel zurück.", "Orthopädie: an drei Bizeps-Orthopäden vorbei. Proteinshake hilft.", "Radiologie: im Dunkeln durch. REA im CT.", "Gastro: Es stinkt. Lüftung einschalten, Luft anhalten.", "Dermatologie: Rettungsstation. Wellness, Creme, Jobangebot.", "Keller: Strom an. Dr. Ewig ausweichen.", "Notaufnahme: durch die Pseudo-Notfälle. Parkticket ziehen.", "Parkhaus: Schranke, Auto, Entscheidung."];

const STORY = [
  ["16:59", "Station 5B, Arztzimmer. Du bist seit 31 Stunden wach. Dein letzter Kaffee war gestern. Die Kaffeemaschine wurde im März eingespart."],
  ["16:59", "Auf dem Bildschirm: 23 ungeschriebene Arztbriefe. Daneben ein Zettel vom Controlling: „Bitte effizienter sterben lassen.“ Nein, Moment: „Bitte effizienter entlassen.“"],
  ["17:00", "Die Wanduhr springt auf 17:00. Feierabend. Offiziell. Dein Pager vibriert. 14 neue Nachrichten. Du schaust nicht hin."],
  ["17:00", "Deine Jackentasche ist leer. Dein Autoschlüssel ist weg. Auf dem Tisch ein Zettel: „Bin kurz Brötchen holen, hab deinen Schlüssel. LG Dr. Kurz“"],
  ["17:00", "Draußen auf dem Flur: Schritte. Stimmen. „Ist der Doktor noch da?“ – „Ich hab nur eine ganz kurze Frage.“ – „Wir sind die Familie. Alle sieben.“"],
  ["17:00", "Irgendwo flackert eine Neonröhre. Irgendwo weiter unten, im Keller, flüstert jemand."],
  ["17:01", "Dein Pager vibriert. Frau Bozkurt, Reinigung, seit 1994 im Haus: „Ich hol dich hier raus. Ich kenne jeden Gang. Lies das Whiteboard. Und schleich.“"],
];

const DUTIES = { WE: "Wochenenddienst", N: "Nachtdienst", "24": "24-h-Dienst", RB: "Rufbereitschaft", ST: "Studienambulanz (Sa)" };

/* hostile people: detect = awareness per second at close range, fov = cos of half view angle, approach = walking speed once spotted */
const TYPES = {
  P: { label: "PATIENT", role: "Patient", who: () => rnd(["Hr. Meier, Zi. 12", "Fr. Schulze, Zi. 7", "Hr. Brösel, Flurbett 9"]), av: "🤒", color: "#8fc1e8",
       spec: () => ({ skin: rnd(SKIN), hair: 0x8c8c8c, hairStyle: rnd(["messy", "bald", "short"]), gown: true, shirt: 0x9cc6e6, pants: 0x9cc6e6, shoes: 0xd9d4c8, acc: "iv" }),
       walk: .4, approach: .8, range: 4, fov: .45, detect: .55, barks: ["Herr Doktor! Hallo! HALLO!", "Sie da! Im Kittel!", "Nur ganz kurz!"] },
  F: { label: "ANGEHÖRIGE ×3", role: "Angehörige", who: () => rnd(["Familie Kowalski (alle 7)", "Die Tochter aus München", "Neffe Dirk (Heilpraktiker)"]), av: "👵", color: "#f2b33d",
       spec: () => ({ skin: rnd(SKIN), hair: 0xd8d8d8, hairStyle: "bun", shirt: 0xc0503a, pants: 0x3a4a6a, acc: "handbag", jacket: 0x7a3a2a }), group: true,
       walk: .4, approach: 1.0, range: 5, fov: .4, detect: .65, barks: ["Da ist er! Der Doktor!", "Wir haben nur drei Fragen!", "Dirk, film das!"] },
  N: { label: "PFLEGE", role: "Pflege", who: () => rnd(["Schwester Gertrud", "Pfleger Kevin", "Schwester Ayşe"]), av: "🩺", color: "#4fb3a9",
       spec: () => ({ skin: rnd(SKIN), hair: rnd(HAIR), hairStyle: rnd(["bun", "short", "long"]), shirt: 0x3f8fb3, pants: 0x3f8fb3, shoes: 0xf2f2f2, acc: "chart", short: true }),
       walk: .6, approach: 1.0, range: 5, fov: .45, detect: .65, barks: ["Ah, gut dass du noch da bist!", "Kurz abzeichnen!", "Nicht weglaufen!"] },
  O: { label: "OBERARZT", role: "Oberarzt", who: () => rnd(["OA Dr. Kranich", "OÄ Dr. Stahlhart", "OA Dr. Hammer"]), av: "🧐", color: "#e2483d",
       spec: () => ({ skin: rnd(SKIN), hair: 0x8c8c8c, hairStyle: rnd(["short", "baldSides"]), coat: true, shirt: 0x9fc0e0, pants: 0x2f3440, tie: 0xb02a2a, glasses: "normal", steth: true, acc: "clipboard" }),
       walk: .75, approach: 1.35, range: 6, fov: .75, detect: .95, cone: true, barks: ["Kollege! Auf ein Wort!", "Ah, Sie sind ja noch da. Perfekt.", "Haben Sie Samstag schon was vor?"] },
  C: { label: "CHEFARZT", role: "Chefarzt", who: () => "Prof. Dr. Dr. h.c. Übermut", av: "🤴", color: "#9b6bff",
       spec: () => ({ skin: SKIN[0], hair: 0xbbbbbb, hairStyle: "baldSides", coat: true, shirt: 0x23262e, pants: 0x23262e, tie: 0xd4af37, glasses: "normal", scale: 1.07, build: "big" }),
       walk: .6, approach: 1.05, range: 7, fov: .3, detect: .8, barks: ["SIE DA!", "Mein Büro. Jetzt.", "Ich sehe alles."] },
  V: { label: "CONTROLLING", role: "Controlling", who: () => "Hr. Paragraf", av: "🤓", color: "#9aa3a0",
       spec: () => ({ skin: SKIN[4], hair: 0x3a2a1a, hairStyle: "short", shirt: 0xdfe6ee, pants: 0x5b6270, tie: 0x2d3f8f, glasses: "normal", acc: "folder", jacket: 0x5b6270 }),
       walk: .5, approach: 1.0, range: 5, fov: .45, detect: .6, barks: ["Moment! Ihre Kodierung!", "Das kostet!", "Formular 17b!"] },
  I: { label: "INTERNIST", role: "Internist · Nerd", who: () => rnd(["Dr. Differential", "Dr. Zebra", "Dr. Natrium"]), av: "🤓", color: "#7cc4ff",
       spec: () => ({ skin: rnd(SKIN), hair: rnd(HAIR), hairStyle: "messy", coat: true, shirt: 0xd9c46b, pants: 0x4a4a3a, glasses: "thick", pens: true, acc: "book", build: "thin" }),
       walk: .55, approach: 1.0, range: 5, fov: .45, detect: .7, barks: ["Warte! Hast du an Morbus Whipple gedacht?", "Interessanter Fall!", "Natrium 134!"] },
  U: { label: "ORTHOPÄDE", role: "Orthopädie · Oberarzt Kraftraum", who: () => rnd(["Dr. Bizeps", "Dr. Quadrizeps", "Dr. Kreuzband"]), av: "💪", color: "#3a3a3a",
       spec: () => ({ skin: rnd(SKIN), hair: rnd([0x1b1b1b, 0x5a3a22, 0x8a6a3a]), hairStyle: rnd(["short", "baldSides", "spiky"]), shirt: 0x2a5f8a, pants: 0x2a5f8a, scrubs: true, pens: true, badge: true, build: "muscle", steth: true, pose: rnd(["flex", "curl", "curl"]), scale: 1.06, short: true, acc: "shake", mood: rnd(["smile", "neutral"]) }),
       static: true },
  A: { label: "RADIOLOGE", role: "Radiologie", who: () => rnd(["Dr. Schatten", "Dr. Kontrast", "Dr. Voraufnahme"]), av: "🩻", color: "#6a7a9a",
       spec: () => ({ skin: rnd(SKIN), hair: rnd(HAIR), hairStyle: "short", coat: true, apron: true, shirt: 0x333a44, pants: 0x2a2f38, glasses: "normal", acc: "mug", lamp: true }),
       walk: .4, approach: .85, range: 4, fov: .5, detect: .5, barks: ["Wer ist da?", "Befund folgt…", "Psst!"] },
  n: { label: "GASTROENTEROLOGE", role: "Gastroenterologie · riecht nichts mehr", who: () => rnd(["Dr. Darmstadt", "Dr. Flatulenzia", "Dr. Pförtner", "Dr. Kolon-Kowalski"]), av: "🧻", color: "#9a8a4a",
       spec: () => ({ skin: rnd(SKIN), hair: rnd(HAIR), hairStyle: rnd(["short", "bun", "baldSides"]), shirt: 0x6a8a5a, pants: 0x6a8a5a, scrubs: true, apron: true, glasses: rnd(["normal", "none"]), acc: rnd(["mug", "clipboard"]), mood: "smile" }),
       walk: .5, approach: 1.0, range: 5, fov: .45, detect: .65, barks: ["Riechen Sie das auch? Nein? Gut.", "Kurze Frage zum Stuhlgang!", "Haben Sie schon gegessen?"] },
  Z: { label: "NOTFALL?", role: "Pseudo-Notfall", who: () => rnd(["Hr. Schnupfen", "Fr. Zeckenbiss (2019)", "Hr. Rezept-nur-kurz", "Fr. Seit-gestern-komisch"]), av: "🧟", color: "#a7c48a",
       spec: () => ({ skin: rnd([0xc9d6b0, 0xd8d0b0, 0xb8c8a0]), hair: rnd(HAIR), hairStyle: rnd(["messy", "bald", "long"]), robe: true, shirt: rnd([0x8a6fae, 0x6a8fae, 0xae6a6a, 0x7aa07a]), pants: 0x5a5a6a, pose: "zombie", lowDetail: true }),
       walk: .25, approach: .55, range: 5, fov: .2, detect: .55, barks: ["Ist das… ein Arzt?", "Ich hab Schnupfen!", "Rezept…"] },
  D: { label: "PD DR. PHIL", role: "Habilitand · übermütig", who: () => "PD Dr. Phil", av: "📊", color: "#ff7ab8",
       spec: () => ({ skin: SKIN[1], hair: 0xd9b26c, hairStyle: "spiky", coat: true, shirt: 0x4a7fd0, pants: 0x1f2a44, glasses: "sunTop", acc: "laptop", shoes: 0xb08850 }),
       walk: .9, approach: 1.5, range: 6, fov: .4, detect: .8, barks: ["Buddy! Kurze Statistikfrage!", "Impact Factor, Baby!", "Du wärst perfekter Co-Autor!"],
       lines: ["Hey Buddy! Kurze Frage für mein Paper. Ich habilitier halt nebenbei.", "Ich hab da eine Studie. Drei Fragen, dann darfst du gehen. Vielleicht.", "Impact Factor, Baby! Hilf mir mal kurz mit der Statistik."] },
  R: { label: "DERMATOLOGIN", role: "Dermatologie · neugierig", who: () => rnd(["Dr. Seidig", "Dr. Porenrein", "Dr. Glow", "Dr. Hyaluron"]), av: "💅", color: "#f6c1d4",
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
  i: { name: "@doc.wellness", role: "Patientin · Influencerin", av: "🤳", color: "#ff9fd0",
       spec: { skin: SKIN[0], hair: 0xd9b26c, hairStyle: "long", shirt: 0xff7ab8, pants: 0xf2f2f2, acc: "phone", glasses: "sun", short: true } },
};

const ITEMS = {
  "1": { emoji: "☕", name: "Kaffee", desc: "+35 Energie, 8 s schneller" },
  "2": { emoji: "📋", name: "Klemmbrett", desc: "10 s beschäftigt wirken", metal: true },
  "3": { emoji: "🧴", name: "Desinfektionsspray", desc: "Alle in der Nähe 6 s außer Gefecht" },
  "4": { emoji: "✈️", name: "Flugmodus-Pieper", desc: "60 s keine Anrufe" },
  "5": { emoji: "📢", name: "Durchsage-Mikro", desc: "Alle rennen zur Cafeteria" },
  "6": { emoji: "🥤", name: "Proteinshake", desc: "Für Orthopäden. Oder +25 Energie" },
  "7": { emoji: "📕", name: "Seltener Fallbericht", desc: "Köder für Nerds" },
  "8": { emoji: "🧮", name: "Taschenrechner", desc: "Hilft gegen PD-Phil", metal: true },
  "9": { emoji: "🔋", name: "Batterie", desc: "Taschenlampe voll" },
  "0": { emoji: "🥫", name: "Energydrink", desc: "+55 Energie" },
  "$": { emoji: "🍩", name: "Donut", desc: "+1 Nerv, +15 Energie" },
  "+": { emoji: "🫙", name: "Wundercreme", desc: "+60 Energie, +1 Nerv" },
  p: { emoji: "✏️", name: "Kugelschreiber", desc: "Werfen: macht Lärm, lenkt ab" },
  c: { emoji: "🥼", name: "Kittel", desc: "Ausziehen: Personal erkennt dich nicht mehr" },
  f: { emoji: "📱", name: "Fake-Telefonat", desc: "10 s lang wichtig telefonieren: Personal stört dich nicht" },
  "&": { emoji: "📜", name: "Arbeitszeugnis", desc: "„…war stets bemüht…“", mission: "zeugnis" },
};
const INV_ORDER = ["c", "p", "f", "1", "0", "$", "+", "2", "3", "5", "4", "7", "6", "8", "9"];

const OFFERS = {
  pharma: { name: "Pharmazeutika AG (Pharma)", need: ["approbation", "zeugnis"] },
  botox: { name: "Praxis Dr. Glatt (Dermatologie)", need: ["approbation"] },
  consult: { name: "Consultwerk GmbH (Beratung)", need: [] },
  tele: { name: "DocFlix (Startup)", need: [] },
  amt: { name: "Gesundheitsamt (Behörde)", need: ["approbation"] },
  ship: { name: "MS Sorgenfrei (Kreuzfahrt)", need: ["approbation"] },
};
const BAG_NAMES = { key: "Autoschlüssel", approbation: "Approbationsurkunde", zeugnis: "Arbeitszeugnis", ticket: "Parkticket", fuse: "Ersatzsicherung", cream: "Sonnencreme", a38: "Formular A38", stamp1: "Stempel Controlling", stamp2: "Stempel Archiv", stamp3: "Stempel Notaufnahme", meds: "Reisetabletten", photo0: "Foto: Faxgerät", photo1: "Foto: Wartezeit", photo5: "Foto: Nummer 999" };

const CALLS = [
  { from: "Station 3B", dept: "N", sub: "Pflege", av: "🏥", text: "Hr. Lehmann hat Fieber. 37,6 °C! Kommen Sie mal?", acc: { mins: 10, task: "Hr. Lehmann: „Fieber“ 37,6 °C anschauen" }, dec: { task: "Rückruf Station 3B" } },
  { from: "Bettendisposition", dept: "V", sub: "Verwaltung", av: "🛏️", text: "Wir haben 0 freie Betten und 14 Aufnahmen. Haben Sie eine Idee? Flur? Keller? Dach?", acc: { mins: 10, task: "Flurbett 24 organisieren" }, dec: { task: "Rückruf Bettendisposition" } },
  { from: "IT-Abteilung", dept: "I", sub: "Helpdesk", av: "💻", text: "Ihr Passwort läuft in 5 Minuten ab. Das neue braucht 24 Zeichen, ein Emoji und eine Hieroglyphe.", acc: { mins: 8, note: "Neues Passwort: Feierabend2026!🙃𓀀" }, dec: { task: "Passwort zurücksetzen (Ticket #48211)" } },
  { from: "Kantine", sub: "Küche", av: "🍲", text: "Das Mittagessen von heute Mittag ist jetzt fertig. Möchten Sie?", acc: { mins: 5, energy: 25, note: "Lauwarme Kartoffeln. Beste Mahlzeit des Tages." }, dec: { note: "Die Kartoffeln warten. Bis morgen." } },
  { from: "Chefsekretariat", dept: "C", sub: "Fr. Vorzimmer", av: "🗂️", text: "Der Chef möchte Sie sprechen. Es geht um den Dienstplan.", acc: { mins: 10, duties: 1 }, dec: { task: "Chefsekretariat zurückrufen (!!!)" } },
  { from: "Mama", dept: "N", sub: "Mobil", av: "👩", text: "Isst du auch genug? Komm doch Sonntag zum Kuchen!", acc: { mins: 3, nerves: 1, energy: 10, note: "Mama ist glücklich. Du auch, kurz." }, dec: { task: "Mama zurückrufen (sie zählt mit)" } },
  { from: "Personalabteilung", sub: "Zeiterfassung", av: "⏱️", text: "Ihre Überstunden aus 2024 verfallen heute um Mitternacht.", acc: { nerves: -1, note: "Das tat weh." }, dec: { task: "Personalabteilung zurückrufen" } },
  { from: "Einkauf", sub: "Kostenstelle 4711", av: "🧻", text: "Ab morgen gibt es Toilettenpapier nur noch auf Antrag. Formular 88a. Möchten Sie vorbestellen?", acc: { mins: 5, task: "Formular 88a (Toilettenpapier)" }, dec: { note: "Viel Glück morgen." } },
  { from: "Consultwerk GmbH", sub: "Recruiting", av: "📈", offer: "consult", text: "Wir suchen Ärztinnen und Ärzte, die Krankenhäuser „effizienter“ machen. Sechsstellig. Interesse?", acc: { offer: "consult", note: "Angebot gespeichert. Deine Seele auch." }, dec: { note: "Sie melden sich „bei Gelegenheit“ wieder." } },
  { from: "MS Sorgenfrei", sub: "Reederei", av: "🛳️", offer: "ship", text: "Schiffsarzt gesucht. Karibik. Sie bräuchten nur Ihre Approbation. Und Sonnencreme.", acc: { offer: "ship", note: "Angebot gespeichert. Approbation nicht vergessen." }, dec: { note: "Das Schiff legt ohne dich ab." } },
  { from: "DocFlix", sub: "Telemedizin-Startup", av: "📱", offer: "tele", text: "Krankschreibungen per Video, aus dem Bett. Wir duzen uns übrigens alle. Bist du dabei?", acc: { offer: "tele", note: "Angebot gespeichert. Es gibt einen Obstkorb." }, dec: { note: "„Kein Ding, Bro.“" } },
  { from: "Gesundheitsamt", sub: "Amtsärztlicher Dienst", av: "🏛️", offer: "amt", text: "Wir suchen eine Amtsärztin oder einen Amtsarzt. Gleitzeit, Beamtenstatus, und das Wort „Notfall“ ist bei uns verboten.", acc: { offer: "amt", note: "Angebot gespeichert. Bitte in dreifacher Ausfertigung bestätigen." }, dec: { note: "„Wir melden uns schriftlich. In 6 bis 8 Wochen.“" } },
];
const HEADHUNTER = { from: "Fr. Goldmann", sub: "Headhunterin · Pharmazeutika AG", av: "💼", offer: "pharma", forced: true,
  text: "Medical Advisor, Firmenwagen, Homeoffice, keine Dienste. Bringen Sie Approbationsurkunde und Arbeitszeugnis mit. Ich warte im Parkhaus.",
  acc: { offer: "pharma", note: "Angebot gespeichert. Du brauchst Approbation und Arbeitszeugnis." }, dec: { note: "„Ich rufe nochmal an. Wir geben nicht auf.“", retry: true } };

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
  { q: "Wie viele Patienten hatte PD-Phils Kontrollgruppe?", o: ["0", "Kontroll-was?", "Beides richtig."], a: 2 },
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
  pharma: { title: "Medical Advisor", eyebrow: "Pharmazeutika AG", text: "Fr. Goldmann wartet mit einer schwarzen Limousine. Firmenwagen, Homeoffice, Feierabend um 16:00. Deine größte Sorge ab jetzt: die Folienfarben im PowerPoint." },
  botox: { title: "Ästhetische Dermatologie", eyebrow: "Praxis Dr. Glatt · Innenstadt", text: "Montag bis Donnerstag, 9 bis 15 Uhr. Deine Patienten fragen nie „nur ganz kurz“. Sie buchen einen Termin. Und bezahlen ihn. Gurkenscheiben inklusive." },
  consult: { title: "Senior Consultant", eyebrow: "Consultwerk GmbH", text: "Du optimierst ab jetzt Krankenhäuser. Dein erstes Projekt ist deine alte Klinik. Deine Empfehlung: noch weniger Licht. Dr. Kurz schreibt dir nie wieder." },
  tele: { title: "Chief Wellbeing Officer", eyebrow: "DocFlix · Startup", text: "Du schreibst Leute per Video krank. Aus dem Bett. Oben Hemd, unten Jogginghose. Es gibt Obstkorb, Kicker und Equity, die nichts wert ist." },
  amt: { title: "Amtsärztin / Amtsarzt", eyebrow: "Gesundheitsamt · Zimmer 4.117", text: "Gleitzeit 7:30 bis 15:30. Dein größter Notfall: ein Formular in der falschen Farbe. Die Kaffeemaschine hat einen eigenen Dienstplan. Du bist nicht drauf." },
  ship: { title: "Schiffsarzt", eyebrow: "MS Sorgenfrei · Karibik", text: "Häufigste Diagnose an Bord: Sonnenbrand. Zweithäufigste: Sonnenbrand nach dem Buffet. Dein Pager liegt auf dem Grund des Atlantiks." },
};

const SIDE = [
  { id: "bewerbung", name: "Bewerbungsmappe", desc: "Approbation (Innere) und Arbeitszeugnis (Radiologie) einsammeln", check: () => run.flags.has("approbation") && run.flags.has("zeugnis") },
  { id: "puenktlich", name: "Pünktlich", desc: "Vor 18:30 im Auto sitzen", check: () => run.minutes < 90 },
  { id: "dienstfrei", name: "Dienstfrei", desc: "Keinen einzigen neuen Dienst annehmen", check: () => run.duties.length === 0 },
  { id: "phantom", name: "Phantom", desc: "Höchstens 3 Gespräche bis zum Auto", check: () => run.talks <= 3 },
  { id: "held", name: "Held:in der Nacht", desc: "Jede Reanimation erfolgreich", check: () => run.lives > 0 && !run.reaFail },
  { id: "glow", name: "Glow-up", desc: "Alle vier Wellness-Liegen in der Dermatologie benutzen", check: () => run.spa >= 4 },
];

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
];
const GRAFFITI = ["ER GEHT NIE HEIM", "Dr. Ewig war hier · 2009", "NUR KURZ", "FEIERABEND IST EINE LÜGE", "Hilfe. Bin noch im Dienst.", "Budget: 0 €", "Dreh dich nicht um."];
const SAFE_NAMES = [["BEREITSCHAFTSRAUM", "Hier findet dich keiner"], ["STATIONSKÜCHE", "Kaffee: eingespart. Sofa: noch da."], ["ABSTELLKAMMER", "Perfekt zum Verstecken"], ["WÄSCHEKAMMER", "Riecht nach Station 4"]];

/* Career routes: chosen at the start in the inbox. Each adds its own goals per floor and ends with its own ride in the car park. */
const ROUTES = {
  pharma: { name: "Pharma", vehicle: "limo", av: "💼", from: "Fr. Goldmann · Pharmazeutika AG", subject: "Medical Advisor (m/w/d) · Firmenwagen · Feierabend 16:00",
    mail: "Sehr geehrte Ärztin, sehr geehrter Arzt, wir haben Ihr Profil gesehen (Sie waren 31 Stunden online). Wir bieten: Firmenwagen, Homeoffice, Kongresse mit Buffet. Bringen Sie nur Approbation und Arbeitszeugnis mit. Ich warte heute Abend mit der Limousine im Parkhaus P2. Mit freundlichen Grüßen, Fr. Goldmann",
    perks: ["Limousine wartet in P2", "Feierabend 16:00", "PowerPoint statt Pieper"], promote: ["approbation", "zeugnis"], goals: [] },
  botox: { name: "Dermatologie", vehicle: "cabrio", av: "🧴", from: "Dr. Glatt · Praxis für ästhetische Dermatologie", subject: "Re: Ihre Augenringe · Stellenangebot (Mo–Do, 9–15 Uhr)",
    mail: "Liebe Kollegin, lieber Kollege, ich habe Sie gestern im Aufzug gesehen und war erschüttert. Ihre Augenringe sind ein medizinischer Notfall. Kommen Sie zum Probetag in die Dermatologie (2. OG), Approbation mitbringen. Danach fahren wir mit meinem Cabrio in die Praxis. Gurkenwasser steht bereit. Herzlich, Dr. Glatt",
    perks: ["Pinkes Cabrio", "Keine Nachtdienste", "Patienten bezahlen vorher"], promote: ["approbation"],
    goals: [{ lvl: 4, id: "probe", title: "Probetag", text: "Probetag bei Dr. Glatt bestehen", at: "friend:e", brief: "Dr. Glatt will sehen, ob du „Dermatologie kannst“. Kleiner Test. Es geht vor allem um Gurken." }] },
  consult: { name: "Beratung", vehicle: "taxi", av: "📈", from: "Consultwerk GmbH · Healthcare Excellence", subject: "Wir suchen Sie: Senior Consultant Krankenhaus-Effizienz",
    mail: "Hi! Wir optimieren Krankenhäuser (hauptsächlich ihre Lichtschalter). Für Ihr Bewerbungsdeck brauchen wir drei Beweisfotos von Ineffizienz aus Ihrer eigenen Klinik. Sollte nicht schwer sein. Ein Business-Taxi holt Sie im Parkhaus ab. Best, Kevin (Partner, 27)",
    perks: ["Business-Taxi", "Sechsstellig", "Folien statt Patienten"], promote: [],
    goals: [
      { lvl: 0, id: "photo0", title: "Beweisfoto 1/3", text: "Das Faxgerät fotografieren (in Betrieb!)", at: "prop:photo", kind: "photo", spot: [6, 5], obj: "fax", brief: "Ein Faxgerät. 2026. Es faxt gerade Befunde. Kevin wird weinen vor Glück." },
      { lvl: 1, id: "photo1", title: "Beweisfoto 2/3", text: "Die Wartezeit-Anzeige fotografieren", at: "prop:photo", kind: "photo", spot: [5, 1], obj: "board", brief: "Die Anzeige im Gang zeigt „Wartezeit: 14 Std.“ Perfekt für Folie 12." },
      { lvl: 6, id: "photo5", title: "Beweisfoto 3/3", text: "Die Wartenummer 999 fotografieren", at: "prop:photo", kind: "photo", spot: [12, 1], obj: "ticketboard", brief: "Wartenummer 999, aufgerufen: 12. Das Deck schreibt sich von selbst." }] },
  tele: { name: "Startup", vehicle: "scooter", av: "📱", from: "DocFlix · Telemedizin, aber cool", subject: "yo 👋 Chief Wellbeing Officer?",
    mail: "Hey du! Wir sind DocFlix: Krankschreibung per Video, aus dem Bett. Für unseren Pitch brauchen wir 3 echte Patienten-Testimonials (einfach mit Leuten reden!) und eine Kooperation mit einer Influencerin. Dein E-Scooter steht im Parkhaus. Obstkorb ist da. Equity auch (wert: 0 €). LG das Team (alle 24)",
    perks: ["E-Scooter", "Kicker, Obstkorb", "Hoodie statt Kittel"], promote: [],
    goals: [
      { lvl: 4, id: "collab", title: "Kooperation", text: "Selfie mit @doc.wellness", at: "friend:i", brief: "Die Influencerin in der Dermatologie hat 400.000 Follower. Ein Selfie, und der Pitch läuft." },
      { lvl: 6, id: "testi", title: "Content Creation", text: () => `3 Testimonials von Patienten (${Math.min(3, run.testi || 0)}/3)`, done: () => (run.testi || 0) >= 3, at: "enemy:Z", brief: "Lass dich von Patienten oder Pseudo-Notfällen ansprechen. Jedes Gespräch ist ein Testimonial. Ja, wirklich: Diesmal SOLLST du reden." }] },
  amt: { name: "Behörde", vehicle: "bike", av: "🏛️", from: "Gesundheitsamt · Amtsärztlicher Dienst", subject: "Az. 4.117/26-B: Einstellung zum 01. (Formular A38 erforderlich)",
    mail: "Sehr geehrte/r Bewerber/in, Ihre Einstellung ist beschlossen. Es fehlt lediglich Formular A38 (im KIS druckbar) mit drei Stempeln: Controlling, Archiv, Anmeldung der Notaufnahme. Ein Dienstfahrrad steht im Parkhaus bereit. Gleitzeit 7:30 bis 15:30. Hochachtungsvoll, i. A. Behrens",
    perks: ["Dienstfahrrad", "Gleitzeit", "Beamtenstatus"], promote: [],
    goals: [
      { lvl: 0, id: "a38", title: "Formular A38", text: "Formular A38 am Computer im Arztzimmer drucken", at: "prop:pc", brief: "Das KIS kann drucken. Theoretisch. Der Drucker hat Papierstau seit Montag. Versuch's trotzdem." },
      { lvl: 1, id: "stamp1", title: "Stempel 1/3", text: "Stempel von Hr. Paragraf (Controlling)", at: "enemy:V", brief: "Hr. Paragraf vom Controlling hat einen Stempel. Er gibt ihn nicht gern her. Sprich ihn an (ja, freiwillig)." },
      { lvl: 5, id: "stamp2", title: "Stempel 2/3", text: "Archiv-Stempel im Keller", at: "prop:stamp", kind: "stamp", spot: [19, 3], obj: "stamp", brief: "Der Archiv-Stempel liegt im Keller. Neben Akten von 1987. Und Dr. Ewig." },
      { lvl: 6, id: "stamp3", title: "Stempel 3/3", text: "Stempel der Notaufnahme-Anmeldung", at: "prop:stamp", kind: "stamp", spot: [26, 1], obj: "stamp", brief: "Die Anmeldung der Notaufnahme stempelt alles. Wirklich alles." }] },
  ship: { name: "Kreuzfahrt", vehicle: "bus", av: "🛳️", from: "MS Sorgenfrei · Reederei Wellengang", subject: "Schiffsarzt gesucht · Karibik · Abfahrt heute 22:00",
    mail: "Ahoi! Unser Schiffsarzt ist leider an Bord geblieben (Liebe). Wir legen heute um 22 Uhr ab. Bitte mitbringen: Approbation, Sonnencreme, Reisetabletten. Der Hafen-Shuttle wartet im Parkhaus. Häufigste Diagnose an Bord: Sonnenbrand. Kapitän Hansen",
    perks: ["Hafen-Shuttle", "Karibik", "Diagnose: Sonnenbrand"], promote: ["approbation", "cream"],
    goals: [{ lvl: 6, id: "meds", title: "Seefest", text: "Reisetabletten aus dem Schockraum", at: "prop:meds", kind: "meds", spot: [17, 10], obj: "meds", brief: "Reisetabletten liegen im Schockraum. Zwischen Defibrillator und einem sehr alten Butterbrot." }] },
  stay: { name: "Einfach heim", vehicle: "car", av: "🛋️", from: "Dein Sofa", subject: "Wo bleibst du?",
    mail: "Hey. Ich bin's, dein Sofa. Die Decke liegt bereit, der Fernseher ist warm. Kein Jobwechsel, keine Formulare. Nur heim. Montag ist ein anderes Problem. Gruß, Sofa",
    perks: ["Dein eigenes Auto", "Montag: wieder hier", "Kein Papierkram"], promote: [], goals: [] },
};
const ROUTE_ORDER = ["pharma", "botox", "consult", "tele", "amt", "ship", "stay"];

/* ---------- Night shift (survival mode) ---------- */
ENV.night = { theme: "ward", fog: 0x05080a, near: 2, far: 17, hemi: .12, amb: .06, dir: .04, flicker: .5, broken: .25, creep: 0, lamp: 0x9ab0c0, dark: true, storm: true };
TYPES.Q = { label: "SCHLAFWANDLER", role: "Patient · schläft (eigentlich)", who: () => rnd(["Hr. Brösel, Zi. 5.03", "Fr. Mond, Zi. 5.07", "Hr. Gähn, Flurbett 3"]), av: "😴", color: "#9fb8d8",
  spec: () => ({ skin: rnd(SKIN), hair: 0x8c8c8c, hairStyle: rnd(["messy", "bald"]), gown: true, shirt: 0x9cc6e6, pants: 0x9cc6e6, shoes: 0xd9d4c8, pose: "zombie", mood: "tired" }),
  walk: .3, approach: .55, range: 3.5, fov: .3, detect: .5, barks: ["Mama…?", "Ist schon Frühstück?", "Zzzz… Herr Doktor…"] };
TYPES.J = { label: "SCHW. HILDEGARD", role: "Nachtwache · seit 1978", who: () => "Schwester Hildegard", av: "🕯️", color: "#e8e4d0",
  spec: () => ({ skin: 0xd8d0c8, hair: 0xf2f2f2, hairStyle: "bun", shirt: 0xf2efe6, pants: 0xf2efe6, robe: true, shoes: 0xf2f2f2, mood: "neutral", acc: "chart", scale: .97 }),
  walk: 0, approach: 2.3, range: 99, fov: -1, detect: 0, barks: ["…", "Kurven…", "Abzeichnen…"] };
LEVELS.push({ key: "night", short: "5B · NACHTDIENST", name: "Station 5B · Nachtdienst", floor: "5. OG", room: 5, env: "night", final: true, night: true,
  safeNames: [["ARZTZIMMER 5B", "Hier bist du sicher. Fast."], ["STATIONSKÜCHE", "Der Kühlschrank brummt. Laut."]],
  tip: "Überlebe bis 07:00. Der Pager schickt dich in die Zimmer. Jede Stunde wird es schlimmer. Und Schwester Hildegard bewegt sich nur, wenn du nicht hinsiehst.",
  objectives: [], exitText: "", lock: "Das Treppenhaus ist nachts verriegelt. Dienstende 07:00.",
  map: LEVELS[0].map.map(r => r.replace(/[bIO]/g, ".").replace(/k/g, "9").replace(/F/g, "1").replace(/N/g, "9").replace(/P/g, "Q")) });
const MISSION_LEVELS = 8;
const NIGHT_START = 300, NIGHT_END = 840;
const STORY_NIGHT = [
  ["21:58", "Station 5B, Arztzimmer. Du hast Nachtdienst. Allein. Für 34 Patienten, zwei Stationen und „bei Bedarf“ die Notaufnahme."],
  ["22:00", "Der Spätdienst geht. „Alles ruhig. Zi. 5.07 klingelt manchmal. Und Schwester Hildegard macht ihre Runde.“ – „Welche Hildegard?“ – Er ist schon weg."],
  ["22:01", "Das Licht im Flur springt auf Nachtmodus. Irgendwo tropft etwas. Der Pager vibriert. Überlebe bis 07:00. Dann kommt der Frühdienst. Hoffentlich."],
];
const NIGHT_HOURS = [
  ["22:00", "Übergabe", "Der Pager schickt dich in die Zimmer. Erledige die Aufgaben, bevor die Zeit abläuft."],
  ["23:00", "Schlafenszeit", "Die Patienten schlafen. Einige davon im Stehen. Auf dem Flur."],
  ["00:00", "Geisterstunde", "Die Wanduhr schlägt zwölf. Sie hat keine Glocke. Dr. Ewig ist aus dem Keller hochgekommen."],
  ["01:00", "Schwester Hildegard", "Am Ende des Flurs: eine Schwesternhaube. Sie bewegt sich nur, wenn du NICHT hinsiehst."],
  ["02:00", "Nachtstrom", "Das Haus schaltet in den Sparmodus. Stromausfälle. Türen fallen von allein zu."],
  ["03:00", "Besuchszeit (inoffiziell)", "Familie Kowalski war „gerade in der Gegend“. Um drei Uhr nachts. Alle sieben."],
  ["04:00", "Die Notaufnahme ist voll", "Die ZNA schickt Pseudo-Notfälle hoch. „Nur zur Beobachtung.“"],
  ["05:00", "Frühaufsteher", "Der Chefarzt kommt früher. Er will „nur kurz die Kurven sehen“."],
  ["06:00", "Morgengrauen", "Es wird hell. Fast geschafft. Hildegard wird schneller. Sie mag keine Übergaben."],
];
const NIGHT_TASKS = [
  "will wissen, wie spät es ist", "Infusion piept (sie piept immer)", "Patientin sieht Geister (sie hat recht)", "will eine Schlaftablette, aber homöopathisch",
  "hat die Braunüle gezogen. Selbst. Mit Stolz.", "Blutzucker 487 (Schokoladen-Schmuggel)", "will das WLAN-Passwort. Um drei Uhr.", "Bettnachbar schnarcht in Dur",
  "ist aus dem Bett gefallen. Ins andere Bett.", "Fieber 37,9 °C, Angehörige schon informiert (per WhatsApp)", "will Frühstück. Jetzt.", "Monitor zeigt Asystolie (Elektrode ab)",
];
