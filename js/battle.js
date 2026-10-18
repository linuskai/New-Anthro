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
  ],
  intern: [
    { q: "Häufigste Ursache einer Hyponatriämie im Krankenhaus?", o: ["Medikamente und SIADH", "Zu wenig Salz auf den Pommes", "Mondphase"], a: 0 },
    { q: "Kalium 6,8 mmol/l. Was zuerst?", o: ["EKG, dann Calciumgluconat, Insulin-Glukose", "Bananen absetzen", "Nochmal abnehmen, bestimmt hämolytisch"], a: 0 },
    { q: "Troponin positiv. Ist es immer ein Herzinfarkt?", o: ["Nein, auch Niere, Sepsis, Lungenembolie …", "Ja, immer", "Nur montags"], a: 0 },
  ],
  hygiene: [
    { q: "Wie lange dauert die hygienische Händedesinfektion?", o: ["30 Sekunden", "3 Sekunden", "Bis es nicht mehr klebt"], a: 0 },
    { q: "Händehygiene: Was ist einer der 5 Momente?", o: ["Vor Patientenkontakt", "Vor dem Mittagessen in der Kantine", "Vor dem Instagram-Post"], a: 0 },
    { q: "Dürfen Ringe und Uhr bei der Arbeit am Patienten getragen werden?", o: ["Nein", "Ja, wenn sie teuer sind", "Nur die Apple Watch"], a: 0 },
  ],
  rules: [
    { q: "Maximale werktägliche Arbeitszeit laut Arbeitszeitgesetz?", o: ["8 Stunden, bis 10 mit Ausgleich", "24 Stunden", "So lange der Chef will"], a: 0 },
    { q: "Mindestruhezeit nach Dienstende?", o: ["11 Stunden", "6 Stunden", "Ein Powernap im Aufzug"], a: 0 },
    { q: "Dürfen Patienten ohne Einwilligung in einem Reel gezeigt werden?", o: ["Nein", "Ja, mit Filter", "Ja, wenn man nur die Nase verpixelt"], a: 0 },
    { q: "Ein Kugelschreiber von der Pharmafirma. Was tun?", o: ["Ablehnen oder melden (Compliance)", "Sammeln, ab 100 gibt's ein Auto", "Verkaufen"], a: 0 },
  ],
  chief: [
    { q: "Wann beginnt die Chefvisite?", o: ["Wenn der Chef kommt", "Um 7:30", "Gar nicht, er ist auf Kongress"], a: 0 },
    { q: "Wer hat bei der Visite immer recht?", o: ["Der Chefarzt (leider)", "Die Evidenz", "Die Pflege (eigentlich)"], a: 0 },
    { q: "Wie viele Patienten stellst du morgen um 6:30 vor?", o: ["Alle 34, auswendig", "Die interessanten", "Keinen, ich bin dann in Davos"], a: 0 },
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
const MY_MOVES = [
  { n: "AUSKULTATION", t: "DIAGNOSTIK", p: 40, pp: 15, txt: "hört ihn ab. Systolikum! Er ist verunsichert." },
  { n: "FACHFRAGE", t: "DIAGNOSTIK", p: 75, pp: 5, quiz: true, txt: "stellt eine Fachfrage." },
  { n: "LEITLINIE", t: "PAPIER", p: 50, pp: 10, txt: "zitiert die S3-Leitlinie. Seite 412. Mit Fußnote." },
  { n: "KAFFEEPAUSE", t: "KOFFEIN", heal: 35, pp: 3, txt: "trinkt lauwarmen Stationskaffee." },
];
const FOES = {
  U: { type: "KRAFT", lvl: 52, quiz: "ortho", moves: [
    { n: "REFLEXHAMMER", p: 22, txt: "schwingt den REFLEXHAMMER! Patellarsehne getroffen!" },
    { n: "BIZEPS-FLEX", buff: 1, txt: "setzt BIZEPS-FLEX ein! Sein ANGRIFF steigt stark!" },
    { n: "PROTEINWOLKE", debuff: 1, txt: "schüttelt seinen Shake. Eine PROTEINWOLKE! Deine Genauigkeit sinkt!" },
    { n: "FACHFRAGE", quiz: true, txt: "stellt dir eine orthopädische Frage!" }] },
  boss: { lvl: 70, moves: [
    { n: "DIENSTPLAN", p: 24, txt: "zückt den DIENSTPLAN! Ostern UND Pfingsten!" },
    { n: "FORMULAR-HAGEL", p: 18, txt: "setzt FORMULAR-HAGEL ein! Durchschlag gelb, rosa, blau!" },
    { n: "STRENGER BLICK", buff: 1, txt: "setzt STRENGER BLICK ein! Du fühlst dich klein. Sein ANGRIFF steigt!" },
    { n: "FACHFRAGE", quiz: true, txt: "prüft dein Wissen!" }] },
};
const BOSS_TYPE = { stay: ["HIERARCHIE", "chief"], pharma: ["BÜROKRATIE", "rules"], consult: ["GREMIUM", "rules"], botox: ["BÜROKRATIE", "hygiene"], ship: ["BÜROKRATIE", "rules"], influ: ["BÜROKRATIE", "rules"] };

// ---------- the battle ----------
function pokeBattle(e, done, o = {}) {
  const isBoss = !!o.boss, foe = isBoss ? FOES.boss : FOES.U;
  const ftype = isBoss ? (BOSS_TYPE[run.route] || BOSS_TYPE.stay)[0] : foe.type, qpool = QUIZ[isBoss ? (BOSS_TYPE[run.route] || BOSS_TYPE.stay)[1] : foe.quiz];
  const name = (e.name || "Gegner").toUpperCase(), kind = isBoss ? (e.def ? e.def.role.split(" · ")[0] : "Endgegner") : "Orthopäde";
  const S = { me: 100, foe: 100, foeAtk: 1, myAcc: 1, pp: MY_MOVES.map(m => m.pp), jonas: true, over: false, busy: true, asked: new Set() };
  const ov = document.createElement("div"); ov.id = "battle";
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
    ov.querySelector(".pb-box.me .num").textContent = Math.max(0, Math.round(S.me)) + "/100";
  };
  const hit = (who, dmg) => { const mon = who === "foe" ? foeMon : meMon; mon.classList.remove("hit"); void mon.offsetWidth; mon.classList.add("hit"); sfx.knock(); if (who === "foe") S.foe -= dmg; else S.me -= dmg; hpUi(); };
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
    menu.innerHTML = MY_MOVES.map((m, i) => `<button type="button" data-mv="${i}" ${S.pp[i] ? "" : "disabled"}><b>${m.n}</b><small>AP ${S.pp[i]}/${m.pp} · ${m.t}${m.t !== "KOFFEIN" && (EFFECT[m.t][ftype] || 1) > 1 ? " ★" : ""}</small></button>`).join("") + `<button type="button" class="back" data-m="back">◀ ZURÜCK</button>`;
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
    if (b.dataset.mv != null) await myMove(+b.dataset.mv);
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
    await say(`DU setzt ${m.n} ein!`, 350); lunge("me");
    if (m.heal) { S.me = Math.min(100, S.me + m.heal); hpUi(); sfx.spa(); await say(`DU ${m.txt} KP +${m.heal}!`); return; }
    if (Math.random() > .92 * S.myAcc && !m.quiz) { await say("Die Attacke ging daneben!"); return; }
    let mult = (EFFECT[m.t][ftype] || 1), crit = false;
    if (m.quiz) { await say(`DU ${m.txt} Wenn er sie nicht kann, sitzt sie.`, 300); const ok = await quiz(qpool); if (!ok) { await say("Falsch! Er lacht. Die Attacke verpufft."); return; } crit = true; }
    else crit = Math.random() < .1;
    const dmg = Math.round(m.p * mult * (crit ? 1.5 : 1) * (.85 + Math.random() * .3) * .55);
    hit("foe", dmg);
    if (!m.quiz) await say(`DU ${m.txt}`, 500);
    if (crit) await say("Volltreffer!", 500);
    if (mult > 1) await say("Es ist sehr effektiv!", 500); else if (mult < 1) await say("Es ist nicht sehr effektiv …", 500);
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
    if (S.fakeEscape || Math.random() < (isBoss ? .2 : .45)) { await say("Du bist entkommen!"); finish(false, true); return true; }
    await say(isBoss ? `Du kannst nicht fliehen! ${name} steht in der Tür.` : "Du kannst nicht fliehen! Er versperrt den Flur. Mit Bizeps."); return false;
  }
  async function foeTurn() {
    const mv = Math.random() < .25 ? foe.moves.find(m => m.quiz) : pick(foe.moves.filter(m => !m.quiz || Math.random() < .3));
    await say(`${name} ${mv.txt}`, 450); lunge("foe");
    if (mv.buff) { S.foeAtk *= 1.3; return; }
    if (mv.debuff) { S.myAcc *= .8; return; }
    if (mv.quiz) { const ok = await quiz(qpool); if (ok) { await say(`Richtig! ${name} ist verwirrt. Er trifft sich selbst!`); hit("foe", 10); } else { if (S.shield) { S.shield = false; await say("Jonas wirft sich dazwischen und beantwortet sie falsch. Jonas ist besiegt!"); return; } hit("me", 22); await say("Falsch! Die Blamage tut weh. Sehr effektiv!"); } return; }
    if (S.shield) { S.shield = false; await say(`Jonas fängt den Treffer ab! Jonas ist besiegt! Er war sowieso unterbezahlt.`); return; }
    const dmg = Math.round(mv.p * S.foeAtk * (settings.diff === "easy" ? .75 : 1) * (.85 + Math.random() * .3));
    hit("me", dmg); if (dmg > 25) await say("Ein Volltreffer!", 450);
  }
  async function win() { foeMon.classList.add("faint"); sfx.ding(); await say(`${name} wurde besiegt!`); await say(`DU erhältst ${isBoss ? 300 : 120} EP (Überstunden, unbezahlt)!`, 900); finish(true); }
  async function lose() { meMon.classList.add("faint"); await say("DU bist besiegt …"); await say("DU hast alles Geld fallen gelassen. Du hattest keins. Er nimmt deinen Kugelschreiber.", 900); finish(false); }
  function finish(ok, fled) { if (S.over) return; S.over = true; ov.remove(); fightOn = false; run.energy = Math.max(1, run.energy - (ok ? 5 : fled ? 8 : 10)); energyHit(); done(ok, fled); }
  ov.cheat = () => { S.foe = 0; hpUi(); win(); };
  hpUi();
  (async () => { foeMon.classList.add("enter"); meMon.classList.add("enter"); await say(isBoss ? `${kind.toUpperCase()} ${name} stellt sich dir in den Weg!` : `Ein wilder ${kind.toUpperCase()} erscheint!`, 700); await say("Los, DU!", 400); showMenu(); })();
}
// the old reflex arena is gone: every fight is a battle now
function fightGame(e, done, o) { pokeBattle(e, done, o); }
