/* Hospital Escape 3D · fighting mini-game: you (stethoscope) vs. an orthopaedist (reflex hammer). Tekken-ish, one round. */
let fightOn = false;
function fightGame(e, done) {
  const ov = document.createElement("div"); ov.id = "fight";
  ov.innerHTML = `<div class="fg-top"><div class="fg-bar you"><b>DU</b><i></i><span>Stethoskop</span></div><div class="fg-timer">45</div><div class="fg-bar him"><b>${esc((e.name || "Dr. Bizeps").toUpperCase())}</b><i></i><span>Reflexhammer</span></div></div>
    <canvas class="fg-cv"></canvas><div class="fg-msg"></div>
    <div class="fg-btns"><button type="button" data-a="light">👂<b>Abhören</b><small>schnell</small></button><button type="button" data-a="heavy">🌀<b>Stethoskop-Peitsche</b><small>stark, langsam</small></button><button type="button" data-a="block">🛡️<b>Block</b><small>halten</small></button><button type="button" data-a="dodge">↩️<b>Ausweichen</b><small>Konter!</small></button></div>`;
  document.body.appendChild(ov); mode = "dialog"; fightOn = true;
  const cv = ov.querySelector(".fg-cv"), g = cv.getContext("2d"), msgEl = ov.querySelector(".fg-msg");
  const dpr = Math.min(2, devicePixelRatio || 1);
  const fit = () => { const r = cv.getBoundingClientRect(); cv.width = r.width * dpr; cv.height = r.height * dpr; }; fit();
  const easy = settings.diff === "easy";
  const P = { hp: 100, st: "idle", t: 0, block: false, counter: 0, x: .3 }, E = { hp: 100, st: "idle", t: 1.4, x: .7, shake: 1 };
  let time = 45, over = false, last = performance.now(), shake = 0, sparks = [], intro = 1.6;
  const say = (t, ms = 1100) => { msgEl.textContent = t; msgEl.classList.remove("pop"); void msgEl.offsetWidth; msgEl.classList.add("pop"); clearTimeout(say.to); say.to = setTimeout(() => { msgEl.textContent = ""; }, ms); };
  const spark = (x, y, txt, col) => sparks.push({ x, y, txt, col, t: 0 });
  const hurt = (who, dmg, txt) => { who.hp = Math.max(0, who.hp - dmg); shake = .25; spark(who === E ? .66 : .34, .38, txt, who === E ? "#f2b33d" : "#ff6a5a"); sfx.knock(); if (who === E) { E.st = "hit"; E.t = .35; } else { P.st = "hit"; P.t = .35; } };
  say("RUNDE 1 · FIGHT!", 1500);

  // player actions
  const act = a => {
    if (over || intro > 0) return;
    if (a === "block") return;
    if (P.st !== "idle") return;
    if (a === "light") { P.st = "light"; P.t = .28; }
    if (a === "heavy") { P.st = "heavy"; P.t = .75; P.hitAt = .35; }
    if (a === "dodge") { P.st = "dodge"; P.t = .45; }
  };
  const btns = ov.querySelector(".fg-btns");
  btns.addEventListener("pointerdown", ev => { const b = ev.target.closest("button"); if (!b) return; ev.preventDefault(); const a = b.dataset.a; if (a === "block") P.block = true; else act(a); });
  const up = () => { P.block = false; }; addEventListener("pointerup", up); addEventListener("pointercancel", up);
  const key = ev => { const k = ev.key.toLowerCase(); if (k === "a" || k === "j") act("light"); if (k === "s" || k === "k") act("heavy"); if (k === "d" || k === "l") P.block = ev.type === "keydown"; if (k === "f" || k === " ") act("dodge"); };
  addEventListener("keydown", key); addEventListener("keyup", key);

  function step(dt) {
    if (intro > 0) { intro -= dt; return; }
    if (over) { sparks.forEach(s => s.t += dt); return; }
    time -= dt;
    // player state machine
    if (P.st !== "idle") {
      P.t -= dt;
      if (P.st === "light" && P.t < .14 && !P.done) { P.done = true; const mult = (P.counter > 0 ? 2 : 1) * (E.st === "flex" ? 1.5 : 1); if (E.st === "wind" && Math.random() < .55) { E.st = "stagger"; E.t = .6; say("Unterbrochen!"); } hurt(E, 6 * mult, P.counter > 0 ? "KONTER!" : pick(["Puls 140!", "Abgehört!", "Pfff"])); }
      if (P.st === "heavy" && P.t < P.hitAt && !P.done) { P.done = true; const mult = (P.counter > 0 ? 2 : 1) * (E.st === "flex" ? 1.5 : 1); if (E.st === "block") { hurt(E, 3, "geblockt"); } else hurt(E, 16 * mult, pick(["WHIPP!", "Lasso!", "Auskultiert!"])); }
      if (P.t <= 0) { P.st = "idle"; P.done = false; }
    }
    if (P.counter > 0) P.counter -= dt;
    // enemy AI: idle → wind-up (telegraphed) → strike; sometimes flexes (open for punishment) or blocks
    E.t -= dt;
    if (E.t <= 0) {
      if (E.st === "idle" || E.st === "hit" || E.st === "stagger" || E.st === "recover" || E.st === "block") {
        const r = Math.random();
        if (r < .14 && E.hp < 100) { E.st = "flex"; E.t = 1.3; say(pick(["Er flext. Jetzt!", "„Schau dir DAS an.“ Er flext.", "Er bewundert seinen Bizeps."])); }
        else if (r < .26 && P.st === "idle") { E.st = "block"; E.t = .9; }
        else { E.st = "wind"; E.t = easy ? .75 : .55; E.kind = Math.random() < .3 ? "smash" : "tap"; say(E.kind === "smash" ? "⚠️ PATELLA-SMASH!" : "⚠️ Er holt aus!", 700); }
      } else if (E.st === "wind") {
        E.st = "strike"; E.t = .3;
        const dmg = (E.kind === "smash" ? 22 : 12) * (easy ? .7 : 1);
        if (P.st === "dodge") { P.counter = 1.2; say("Ausgewichen! Konter!"); spark(.34, .3, "MISS", "#8affc0"); }
        else if (P.block) { hurt(P, Math.round(dmg * .2), "geblockt"); }
        else { hurt(P, dmg, E.kind === "smash" ? "REFLEX 4+!" : "TOCK!"); run.energy = Math.max(0, run.energy - 3); }
      } else if (E.st === "strike") { E.st = "recover"; E.t = .5 + Math.random() * .5; }
      else if (E.st === "flex") { E.st = "idle"; E.t = .4; }
    }
    shake = Math.max(0, shake - dt);
    sparks.forEach(s => s.t += dt); sparks = sparks.filter(s => s.t < .8);
    if (!over && (E.hp <= 0 || P.hp <= 0 || time <= 0)) { over = true; const win = E.hp <= 0 || (time <= 0 && E.hp < P.hp); say(win ? "K.O.! DU GEWINNST" : time <= 0 ? "ZEIT!" : "K.O.…", 2000); setTimeout(() => finish(win), 1700); }
  }

  // drawing: corridor backdrop, two stylised fighters
  function fighter(x, y, s, flip, coat, skin, st, t, hp) {
    g.save(); g.translate(x, y); g.scale(flip ? -s : s, s);
    const bob = Math.sin(performance.now() / 180 + (flip ? 1 : 0)) * 3, lean = st === "dodge" ? -22 : st === "hit" ? -14 : st === "light" || st === "strike" ? 14 : st === "heavy" ? 18 : 0;
    g.translate(lean, bob);
    g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(-lean, 98 - bob, 46, 9, 0, 0, 7); g.fill();
    // legs
    g.strokeStyle = flip ? "#2a5f8a" : "#2f3440"; g.lineWidth = 15; g.lineCap = "round";
    const kick = (st === "hit" && flip === false) ? -30 : 0;
    g.beginPath(); g.moveTo(-10, 40); g.lineTo(-18, 95); g.moveTo(10, 40); g.lineTo(20 + kick, 95 + kick * .3); g.stroke();
    // body
    g.fillStyle = coat; g.beginPath(); g.roundRect ? g.roundRect(flip ? -34 : -26, -30, flip ? 68 : 52, 76, 14) : g.rect(-26, -30, 52, 76); g.fill();
    if (!flip) { g.fillStyle = "#9fc0e0"; g.fillRect(-6, -30, 12, 30); g.fillStyle = "#c0322a"; g.fillRect(-2, -26, 4, 24); }
    // arms
    const arm = st === "light" ? 1 : st === "heavy" ? (t > .35 ? -.4 : 1.3) : st === "block" || (st === "idle" && flip === false && t === "block") ? .2 : st === "wind" ? -1.1 : st === "strike" ? 1.2 : st === "flex" ? -1.6 : .35;
    g.strokeStyle = flip ? skin : coat; g.lineWidth = flip ? 22 : 13;
    g.beginPath(); g.moveTo(20, -18); const ax = 20 + Math.cos(arm) * 42, ay = -18 - Math.sin(arm) * 42; g.lineTo(ax, ay); g.stroke();
    if (flip && st === "flex") { g.fillStyle = skin; g.beginPath(); g.arc(30, -40, 15, 0, 7); g.fill(); }
    // weapon
    if (flip) { g.save(); g.translate(ax, ay); g.rotate(-arm - .6); g.fillStyle = "#c8ccd0"; g.fillRect(-3, -2, 6, 40); g.fillStyle = "#e25a3d"; g.beginPath(); g.ellipse(0, 42, 16, 9, 0, 0, 7); g.fill(); g.restore(); }
    else { g.strokeStyle = "#222"; g.lineWidth = 4; g.beginPath(); g.moveTo(ax, ay); const reach = st === "heavy" && t < .4 ? 70 : st === "light" ? 26 : 8; g.quadraticCurveTo(ax + reach * .6, ay + 30, ax + reach, ay + (reach > 30 ? -6 : 18)); g.stroke(); g.fillStyle = "#b8bec4"; g.beginPath(); g.arc(ax + reach, ay + (reach > 30 ? -6 : 18), 6, 0, 7); g.fill(); }
    g.strokeStyle = flip ? skin : coat; g.lineWidth = flip ? 22 : 13; g.beginPath(); g.moveTo(-20, -18); g.lineTo(-30, st === "block" ? -46 : 18); g.stroke();
    // head
    g.fillStyle = skin; g.beginPath(); g.arc(0, -52, 21, 0, 7); g.fill();
    g.fillStyle = flip ? "#3a2a1a" : "#5a3a22"; g.beginPath(); g.arc(0, -60, 20, Math.PI, 0); g.fill();
    g.fillStyle = "#111"; const eyeY = st === "hit" ? -50 : -53; g.fillRect(6, eyeY, 4, st === "hit" ? 1.5 : 4); g.fillRect(14, eyeY, 4, st === "hit" ? 1.5 : 4);
    g.strokeStyle = "#5a2a2a"; g.lineWidth = 2; g.beginPath(); if (st === "hit") g.arc(12, -38, 4, 0, 7); else g.arc(12, -42, 5, .2, Math.PI - .2, st === "wind" || st === "strike"); g.stroke();
    g.restore();
  }
  function draw() {
    const W = cv.width, H = cv.height, sx = shake > 0 ? (Math.random() - .5) * 14 * dpr : 0;
    g.setTransform(1, 0, 0, 1, sx, 0);
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#dfe6e2"); bg.addColorStop(.62, "#b9c6c0"); bg.addColorStop(.63, "#8fa29a"); bg.addColorStop(1, "#6f827a"); g.fillStyle = bg; g.fillRect(-20, 0, W + 40, H);
    g.fillStyle = "rgba(255,255,255,.6)"; for (let i = 0; i < 5; i++) g.fillRect(W * (.1 + i * .2) - 30 * dpr, 6 * dpr, 60 * dpr, 6 * dpr);
    g.fillStyle = "#b08a62"; g.fillRect(0, H * .5, W, 5 * dpr);
    g.fillStyle = "rgba(0,0,0,.08)"; g.font = `800 ${28 * dpr}px ${SF}`; g.textAlign = "center"; g.fillText("ORTHOPÄDIE · KRAFTRAUM-FLUR", W / 2, H * .3);
    const s = Math.min(W / 380, H / 290), y = H * .66;
    fighter(W * P.x, y, s, false, "#f4f4f0", "#f1c9a5", P.block ? "block" : P.st, P.t, P.hp);
    fighter(W * E.x, y, s * 1.12, true, "#2a5f8a", "#e0ac7e", E.st, E.t, E.hp);
    if (E.st === "wind") { g.fillStyle = "#e2483d"; g.font = `900 ${40 * dpr}px ${SF}`; g.fillText("!", W * E.x, y - 120 * s); }
    for (const sp of sparks) { g.globalAlpha = 1 - sp.t / .8; g.fillStyle = sp.col; g.font = `900 ${26 * dpr}px ${SF}`; g.fillText(sp.txt, W * sp.x, H * sp.y - sp.t * 60 * dpr); g.globalAlpha = 1; }
    ov.querySelector(".you i").style.width = P.hp + "%"; ov.querySelector(".him i").style.width = E.hp + "%";
    ov.querySelector(".fg-timer").textContent = Math.max(0, Math.ceil(time));
  }
  function loop(now) { if (!ov.isConnected) return; const dt = Math.min(.1, (now - last) / 1000); last = now; step(dt); draw(); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  function finish(win) {
    removeEventListener("keydown", key); removeEventListener("keyup", key); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
    ov.remove(); fightOn = false; done(win);
  }
}
