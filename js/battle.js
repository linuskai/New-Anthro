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
      const c = document.createElement("canvas"); c.width = 112; c.height = 112;
      bR = new THREE.WebGLRenderer({ canvas: c, antialias: false, preserveDrawingBuffer: true, alpha: true }); bR.setPixelRatio(1);
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

// ---------- types and moves ----------
const EFFECT = { DIAGNOSTIK: { KRAFT: 2, HIERARCHIE: .5 }, PAPIER: { BÜROKRATIE: 2, KRAFT: .5 }, EMPATHIE: { GREMIUM: 2, HIERARCHIE: 2, BÜROKRATIE: .5 }, KOFFEIN: {} };
/* what an assistant doctor brings to a fight: paper, knowledge, exhaustion and bad coffee */
const MY_MOVES = [
  { n: "ARZTBRIEF-WURF", fx: "paper", t: "PAPIER", p: 46, pp: 15, txt: "wirft einen 14-seitigen Arztbrief. Ungelesen. Mit Tippfehlern. Mitten ins Gesicht." },
  { n: "FACHFRAGE", fx: "quiz", t: "DIAGNOSTIK", p: 75, pp: 5, quiz: true, txt: "stellt eine Fachfrage." },
  { n: "AUGENRING-BLICK", fx: "rings", t: "EMPATHIE", p: 30, pp: 8, weaken: 1, txt: "zeigt die Augenringe. 31 Stunden wach. Der Gegner fühlt sich kurz schuldig." },
  { n: "KAFFEEPAUSE", fx: "coffee", t: "KOFFEIN", heal: 30, pp: 3, txt: "trinkt lauwarmen Stationskaffee von gestern." },
];
const FOES = {
  U: { type: "KRAFT", lvl: 52, quiz: "ortho", moves: [
    { n: "REFLEXHAMMER", fx: "hammer", p: 22, txt: "schwingt den REFLEXHAMMER! Patellarsehne getroffen!" },
    { n: "BIZEPS-FLEX", fx: "flex", buff: 1, txt: "setzt BIZEPS-FLEX ein! Sein ANGRIFF steigt stark!" },
    { n: "PROTEINWOLKE", fx: "cloud", debuff: 1, txt: "schüttelt seinen Shake. Eine PROTEINWOLKE! Deine Genauigkeit sinkt!" },
    { n: "FACHFRAGE", quiz: true, txt: "stellt dir eine orthopädische Frage!" }] },
  boss: { lvl: 70, moves: [
    { n: "DIENSTPLAN", fx: "calendar", p: 22, txt: "zückt den DIENSTPLAN! Ostern UND Pfingsten! Und Silvester, „weil du ja eh nichts vorhast“!" },
    { n: "NUR GANZ KURZ", fx: "bubbles", p: 15, acc: 1, txt: "sagt „NUR GANZ KURZ …“! Es dauert 45 Minuten. Deine Genauigkeit sinkt!" },
    { n: "WIR SIND FAMILIE", fx: "up", buff: 1, txt: "sagt „WIR SIND DOCH EINE FAMILIE“! Sein ANGRIFF steigt. Dein Gehalt nicht." },
    { n: "ÜBERSTUNDEN-SOG", fx: "drain", p: 18, drain: 1, txt: "saugt deine Überstunden ab! Er fühlt sich erholt. Du nicht." },
    { n: "FACHFRAGE", quiz: true, txt: "prüft dein Wissen! Vor versammelter Mannschaft!" }] },
};
/* every boss has a signature move, used more often once it is angry (phase 2, under half its KP) */
const BOSS_SIG = {
  stay: { fx: "calendar", n: "OSTERDIENST", p: 30, txt: "trägt dich für OSTERN, PFINGSTEN UND WEIHNACHTEN ein!" },
  pharma: { fx: "audit", n: "COMPLIANCE-AUDIT", p: 18, acc: 1, txt: "startet ein COMPLIANCE-AUDIT! Alle deine Kugelschreiber werden beschlagnahmt! Deine Genauigkeit sinkt!" },
  consult: { fx: "slides", n: "POWERPOINT-SALVE", p: 10, multi: 3, txt: "feuert eine POWERPOINT-SALVE ab! 84 Folien, alle mit Animation!" },
  botox: { fx: "needle", n: "BOTOX-STARRE", p: 15, stun: 1, txt: "setzt BOTOX-STARRE ein! Dein Gesicht bewegt sich nicht mehr. Der Rest auch nicht!" },
  ship: { fx: "wave", n: "SEEGANG", p: 18, acc: 1, txt: "lässt das Deck schaukeln! SEEGANG! Dir wird übel, deine Genauigkeit sinkt!" },
  influ: { fx: "storm", n: "SHITSTORM", p: 8, multi: 4, txt: "löst einen SHITSTORM aus! 4.000 Kommentare in Sekunden!" },
};
/* boss music: a driving minor bassline with an arpeggio on top, faster once the boss is angry */
let bossMus = null;
function bossMusic(on, fast) {
  if (bossMus) { clearInterval(bossMus.t); bossMus = null; }
  if (!on || !actx) return;
  const bass = [110, 110, 131, 110, 98, 98, 117, 98, 87, 87, 104, 87, 98, 104, 117, 131], arp = [440, 523, 659, 523, 392, 494, 587, 494, 349, 440, 523, 440, 392, 466, 587, 659];
  let i = 0; const step = fast ? 105 : 140;
  bossMus = { t: setInterval(() => { const k = i++ % 16; tone(bass[k] * (fast ? 1.06 : 1), 0, step / 1000 * .9, "sawtooth", .03); if (k % 2 === 0) tone(arp[k] * (fast ? 1.06 : 1), 0, step / 1000 * .6, "square", .014); if (k % 4 === 0) noise(0, .06, 120, 1, .12, "lowpass"); if (k % 4 === 2) noise(0, .04, 3000, .6, .03, "highpass"); }, step) };
}
const BOSS_TYPE = { stay: ["HIERARCHIE", "chief"], pharma: ["BÜROKRATIE", "rules"], consult: ["GREMIUM", "rules"], botox: ["BÜROKRATIE", "hygiene"], ship: ["BÜROKRATIE", "rules"], influ: ["BÜROKRATIE", "rules"] };

// ---------- the battle ----------
function pokeBattle(e, done, o = {}) {
  const isBoss = !!o.boss, foe = isBoss ? FOES.boss : FOES.U;
  const ftype = isBoss ? (BOSS_TYPE[run.route] || BOSS_TYPE.stay)[0] : foe.type, qpool = QUIZ[isBoss ? (BOSS_TYPE[run.route] || BOSS_TYPE.stay)[1] : foe.quiz];
  const name = (e.name || "Gegner").toUpperCase(), kind = isBoss ? (e.def ? e.def.role.split(" · ")[0] : "Endgegner") : "Orthopäde";
  const S = { me: isBoss ? Math.max(1, Math.round(run.energy)) : 100, foe: 100, foeAtk: 1, myAcc: 1, pp: MY_MOVES.map(m => m.pp), jonas: true, over: false, busy: true, asked: new Set() }, sig = isBoss ? BOSS_SIG[run.route] || BOSS_SIG.stay : null;
  const ov = document.createElement("div"); ov.id = "battle"; if (isBoss) ov.classList.add("boss"); typeof track === "function" && track("battle", { boss: isBoss, foe: e.name || e.type, route: run && run.route });
  const fs = battleSprite(e.person.sp, false, "e" + e.name), ps = battleSprite(PLAYER_SP, true, "player");
  ov.innerHTML = `<div class="pb-field">
      <div class="pb-box foe"><b>${esc(name)}</b><span class="lv">Lv${foe.lvl}</span><div class="hp"><i>KP</i><div class="hpbar"><div class="hpfill"></div></div></div><small class="ty">${esc(ftype)}</small></div>
      <div class="pb-plat foe"></div><div class="pb-mon foe">${fs ? `<img src="${fs}" alt="">` : `<span>${esc(e.person && TYPES[e.type] ? TYPES[e.type].av : "💪")}</span>`}</div>
      <div class="pb-plat me"></div><div class="pb-mon me">${ps ? `<img src="${ps}" alt="">` : "<span>🧑‍⚕️</span>"}</div>
      <div class="pb-box me"><b>DU</b><span class="lv">Lv31</span><div class="hp"><i>KP</i><div class="hpbar"><div class="hpfill"></div></div></div><small class="num">100/100</small><div class="exp"><div></div></div></div>
    </div>
    <div class="pb-bottom"><div class="pb-text"></div><div class="pb-menu"></div></div>`;
  document.body.appendChild(ov); mode = "dialog"; fightOn = true; clearInputs();
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
    if (kind === "paper") { noise(0, .4, 3000, .8, .05); await volley("📄", 4, 110, 480, 70, 540); }
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
  const hit = (who, dmg) => { const mon = who === "foe" ? foeMon : meMon; mon.classList.remove("hit"); void mon.offsetWidth; mon.classList.add("hit"); sfx.knock(); if (dmg >= 25) { ov.classList.remove("shake"); void ov.offsetWidth; ov.classList.add("shake"); } if (who === "foe") S.foe -= dmg; else S.me -= dmg; hpUi(); };
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
    menu.innerHTML = `<button type="button" data-m="fight">KAMPF</button><button type="button" data-m="bag">BEUTEL</button><button type="button" data-m="mates">KOLLEGEN</button><button type="button" data-m="run">FLUCHT</button>`;
  };
  const showMoves = () => {
    const ult = isBoss && S.foe <= 35 && !S.ultUsed ? `<button type="button" class="ult" data-ult="1"><b>KÜNDIGUNG</b><small>EINMALIG · ENDGÜLTIG ★★★</small></button>` : "";
    menu.innerHTML = ult + MY_MOVES.map((m, i) => `<button type="button" data-mv="${i}" ${S.pp[i] ? "" : "disabled"}><b>${m.n}</b><small>AP ${S.pp[i]}/${m.pp} · ${m.t}${m.t !== "KOFFEIN" && (EFFECT[m.t][ftype] || 1) > 1 ? " ★" : ""}</small></button>`).join("") + `<button type="button" class="back" data-m="back">◀ ZURÜCK</button>`;
  };
  const bagItems = () => [["1", "KAFFEE", 40], ["0", "ENERGYDRINK", 55], ["$", "DONUT", 20], ["6", "PROTEINSHAKE", 25], ["3", "DESINFEKTION", 0], ["f", "FAKE-TELEFONAT", 0]].filter(([k]) => hasItem(k));
  const showBag = () => {
    const items = bagItems();
    menu.innerHTML = (items.length ? items.map(([k, n]) => `<button type="button" data-it="${k}">${ITEMS[k].emoji} <b>${n}</b><small>×${run.inv[k]}</small></button>`).join("") : `<button type="button" disabled>Beutel leer</button>`) + `<button type="button" class="back" data-m="back">◀ ZURÜCK</button>`;
  };
  menu.addEventListener("click", async ev => {
    const b = ev.target.closest("button"); if (!b || S.busy || S.over) return;
    if (b.dataset.m === "fight") return showMoves();
    if (b.dataset.m === "bag") return showBag();
    if (b.dataset.m === "back") return showMenu();
    S.busy = true; menu.innerHTML = "";
    if (S.stunned) { S.stunned = false; await say("DU bist starr vor Botox und kannst dich nicht bewegen!"); }
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
    const m = MY_MOVES[i]; S.pp[i]--;
    await say(`DU setzt ${m.n} ein!`, 350); lunge("me"); await fx(m.fx, "me");
    if (m.heal) { S.me = Math.min(100, S.me + m.heal); hpUi(); sfx.spa(); await say(`DU ${m.txt} KP +${m.heal}!`); return; }
    if (m.weaken) { S.foeAtk *= .85; }
    if (Math.random() > .92 * S.myAcc && !m.quiz) { await say("Die Attacke ging daneben!"); return; }
    let mult = (EFFECT[m.t][ftype] || 1), crit = false;
    if (m.quiz) { await say(`DU ${m.txt} Wenn er sie nicht kann, sitzt sie.`, 300); const ok = await quiz(qpool); if (!ok) { await say("Falsch! Er lacht. Die Attacke verpufft."); return; } crit = true; }
    else crit = Math.random() < .1;
    const dmg = Math.round(m.p * mult * (crit ? 1.5 : 1) * (.85 + Math.random() * .3) * .55 * (isBoss ? .8 : 1));
    hit("foe", dmg);
    if (!m.quiz) await say(`DU ${m.txt}`, 500);
    if (m.weaken) { await arrows("foe", false); await say(`Der ANGRIFF von ${name} sinkt!`, 450); }
    if (crit) await say("Volltreffer!", 500);
    if (mult > 1) { flashField("rgba(255,255,255,.7)"); await say("Es ist sehr effektiv!", 500); } else if (mult < 1) await say("Es ist nicht sehr effektiv …", 500);
  }
  async function useBag(k) {
    takeItem(k); const it = ITEMS[k];
    if (k === "6" && !isBoss) { await say(`DU gibst ${name} einen PROTEINSHAKE.`); await say(`${name} trinkt ihn in einem Zug. „Vanille. Respekt.“ Er will nicht mehr kämpfen!`); S.foe = 0; hpUi(); return; }
    if (k === "3") { await say("DU sprühst DESINFEKTIONSMITTEL! Er reibt sich die Augen."); S.foeAtk *= .7; await say(`Der ANGRIFF von ${name} sinkt!`); return; }
    if (k === "f") { await say("DU täuschst ein wichtiges Telefonat vor. „Ja, Herr Professor …“"); S.fakeEscape = true; await say("Beim nächsten Fluchtversuch klappt es sicher!"); return; }
    const heal = { "1": 40, "0": 55, "$": 20, "6": 25 }[k] || 20; S.me = Math.min(100, S.me + heal); hpUi(); sfx.spa(); await say(`DU benutzt ${it.name.toUpperCase()}. KP +${heal}!`);
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
      if (sig.acc) S.myAcc *= .8; if (sig.stun) S.stunned = true;
    } else await foeMove();
    if (isBoss && S.phase2 && !again && S.me > 0 && Math.random() < .25) { await say(`${name} ist so wütend, dass er gleich nochmal angreift!`, 400); await foeTurn(true); }
  }
  async function foeMove() {
    const mv = Math.random() < .25 ? foe.moves.find(m => m.quiz) : pick(foe.moves.filter(m => !m.quiz || Math.random() < .3));
    await say(`${name} ${mv.txt}`, 450); lunge("foe"); await fx(mv.fx, "foe");
    if (mv.buff) { S.foeAtk *= 1.3; await arrows("foe", true); return; }
    if (mv.debuff) { S.myAcc *= .8; await arrows("me", false); return; }
    if (mv.quiz) { const ok = await quiz(qpool); if (ok) { await say(`Richtig! ${name} ist verwirrt. Er trifft sich selbst!`); hit("foe", 10); } else { if (S.shield) { S.shield = false; await say("Jonas wirft sich dazwischen und beantwortet sie falsch. Jonas ist besiegt!"); return; } hit("me", 22); await say("Falsch! Die Blamage tut weh. Sehr effektiv!"); } return; }
    if (S.shield) { S.shield = false; await say(`Jonas fängt den Treffer ab! Jonas ist besiegt! Er war sowieso unterbezahlt.`); return; }
    const dmg = Math.round(mv.p * S.foeAtk * (settings.diff === "easy" ? .75 : 1) * (.85 + Math.random() * .3));
    hit("me", dmg); if (dmg > 25) await say("Ein Volltreffer!", 450);
    if (mv.acc) { S.myAcc *= .85; await arrows("me", false); }
    if (mv.drain) { S.foe = Math.min(100, S.foe + Math.round(dmg / 2)); hpUi(); sfx.spa(); await say(`${name} erholt sich um ${Math.round(dmg / 2)} KP!`, 450); }
  }
  async function win() {
    tone(520, 0, .5, "sawtooth", .05, 120); foeMon.classList.add("faint"); setTimeout(() => sfx.ding(), 500);
    if (isBoss) { bossMusic(false); const ko = document.createElement("div"); ko.className = "pb-ko"; ko.innerHTML = "<b>K.O.!</b><small>Du bist frei.</small>"; ov.appendChild(ko); [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .14, .3, "square", .05)); tone(1047, .6, .9, "triangle", .06); await sleep(1600); }
    await say(`${name} wurde besiegt!`);
    const exp = ov.querySelector(".pb-box.me .exp div"); if (exp) { exp.style.transition = "width 1.2s ease-out"; exp.style.width = "100%"; tone(880, 0, 1.1, "sine", .03, 1760); await sleep(1250); exp.style.transition = "none"; exp.style.width = "8%"; ov.querySelector(".pb-box.me .lv").textContent = "Lv32"; [659, 784, 1047].forEach((f, i) => tone(f, i * .12, .2, "square", .04)); await say("DU erreicht Lv32! Dein Gehalt steigt um 0 €.", 700); } await say(`DU erhältst ${isBoss ? 300 : 120} EP (Überstunden, unbezahlt)!`, 900); finish(true); }
  async function lose() { bossMusic(false); meMon.classList.add("faint"); await say("DU bist besiegt …"); await say("DU hast alles Geld fallen gelassen. Du hattest keins. Er nimmt deinen Kugelschreiber.", 900); finish(false); }
  function finish(ok, fled) { if (S.over) return; S.over = true; typeof track === "function" && track("battle_end", { boss: isBoss, ok: !!ok, fled: !!fled, kp: Math.round(S.me) }); bossMusic(false); ov.remove(); fightOn = false; run.energy = isBoss ? (ok ? Math.max(1, Math.round(S.me)) : 0) : Math.max(1, run.energy - (ok ? 5 : fled ? 8 : 10)); energyHit(); done(ok, fled); }
  ov.cheat = () => { S.foe = 0; hpUi(); win(); };
  hpUi();
  (async () => {
    if (isBoss) { // the versus screen: both slide in, ENDKAMPF, flash, music
      const vs = document.createElement("div"); vs.className = "pb-vs";
      vs.innerHTML = `<div class="vs-me">${ps ? `<img src="${ps}" alt="">` : "🧑‍⚕️"}<b>DU</b></div><div class="vs-mid"><small>ENDKAMPF</small><b>VS</b></div><div class="vs-foe">${fs ? `<img src="${fs}" alt="">` : esc(e.def ? e.def.av : "👔")}<b>${esc(name)}</b><small>${esc(e.def ? e.def.role : kind)}</small></div>`;
      ov.appendChild(vs); sfx.slam(); setTimeout(() => sfx.stinger(), 300); bossMusic(true, false); await sleep(2600); vs.classList.add("out"); await sleep(400); vs.remove();
    }
    foeMon.classList.add("enter"); ov.querySelector(".pb-plat.foe").classList.add("enter"); ov.querySelector(".pb-plat.me").classList.add("enter"); meMon.classList.add("hidden");
    await say(isBoss ? `ENDKAMPF! ${name} versperrt dir den Weg in die Freiheit!` : `Ein wilder ${kind.toUpperCase()} erscheint!`, 700);
    if (isBoss) await say(`Deine KP sind deine Energie: ${Math.round(S.me)} von 100. Wer vorher viel verloren hat, hat jetzt wenig.`, 600);
    if (isBoss) await say(`Hinter ${name} wartet ${mission().ride}. Los, DU!`, 500); else await say("Los, DU!", 400);
    { const m = ctr(meMon); const ball = spawn('<b class="ball"></b>', -20, m[1] + 40); tone(600, 0, .25, "square", .03, 300);
      await new Promise(res => { ball.animate([{ transform: "translate(-50%,-50%) rotate(0)" }, { transform: `translate(calc(-50% + ${(m[0] + 20) * .5}px), calc(-50% - 120px)) rotate(360deg)`, offset: .5 }, { transform: `translate(calc(-50% + ${m[0] + 20}px), calc(-50% - 40px)) rotate(720deg)` }], { duration: 650, easing: "ease-out" }).onfinish = () => { ball.remove(); res(); }; });
      const fl = spawn("", m[0], m[1] - 40, "pop"); fl.animate([{ transform: "translate(-50%,-50%) scale(.1)", opacity: 1 }, { transform: "translate(-50%,-50%) scale(3)", opacity: 0 }], { duration: 450 }).onfinish = () => fl.remove();
      tone(1100, 0, .15, "triangle", .05); meMon.classList.remove("hidden"); meMon.classList.add("popin"); await sleep(450); }
    showMenu(); })();
}
// the old reflex arena is gone: every fight is a battle now
function fightGame(e, done, o) { pokeBattle(e, done, o); }
