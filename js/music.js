/* Hospital Escape 3D · music that reacts to the game: a quiet, uneasy pad while you sneak, a driving chase loop
   (bass, heartbeat, staccato strings) as soon as someone is after you, a ticking clock and a racing heart when the
   deadline is close. Plus: sound on the iPhone even with the silent switch on (the game is meant to be heard). */

// ---------- iPhone: play through the silent switch ----------
// Safari 17+: the Audio Session API. Older iOS: a silent looping <audio> element puts the page in "playback" mode,
// then Web Audio is no longer muted by the ringer switch. Both only after a tap, which is when initAudio runs.
let silentEl = null;
function unlockPlayback() {
  try { if (navigator.audioSession && navigator.audioSession.type !== "playback") navigator.audioSession.type = "playback"; } catch (e) {}
  if (!/iphone|ipad|ipod/i.test(navigator.userAgent) && !(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return;
  try {
    if (!silentEl) {
      // 0.25 s of silence as a tiny WAV
      const n = 2000, b = new Uint8Array(44 + n), v = new DataView(b.buffer), w = (o, s) => [...s].forEach((c, i) => b[o + i] = c.charCodeAt(0));
      w(0, "RIFF"); v.setUint32(4, 36 + n, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
      v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, "data"); v.setUint32(40, n, true); b.fill(128, 44);
      silentEl = new Audio(URL.createObjectURL(new Blob([b], { type: "audio/wav" })));
      silentEl.loop = true; silentEl.setAttribute("playsinline", ""); silentEl.volume = .01;
    }
    if (settings.sound) silentEl.play().catch(() => {}); else silentEl.pause();
  } catch (e) {}
}
document.addEventListener("pointerdown", () => { if (actx) unlockPlayback(); }, { passive: true });
document.addEventListener("visibilitychange", () => { if (!document.hidden && actx && actx.state === "suspended") actx.resume().catch(() => {}); });

// ---------- adaptive score ----------
const MUS = { t: null, step: 0, chase: 0, tension: 0, pad: null };
function musicPad(on) {
  if (!actx) return;
  if (!MUS.pad) { // an uneasy minor pad: A, C, E flat, slowly breathing through a filter
    const g = actx.createGain(); g.gain.value = 0; const lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 500; lp.Q.value = 4; g.connect(master); lp.connect(g);
    const lfo = actx.createOscillator(), lg = actx.createGain(); lfo.frequency.value = .07; lg.gain.value = 260; lfo.connect(lg).connect(lp.frequency); lfo.start();
    for (const f of [110, 130.8, 155.6, 220.4]) { const o = actx.createOscillator(); o.type = f > 200 ? "triangle" : "sawtooth"; o.frequency.value = f; o.detune.value = (Math.random() - .5) * 14; o.connect(lp); o.start(); }
    MUS.pad = g;
  }
  MUS.pad.gain.setTargetAtTime(on, actx.currentTime, 1.2);
}
function musicTick() {
  if (!actx || !settings.sound || !run || typeof fightOn !== "undefined" && fightOn || bossMus) return;
  const k = MUS.step++ % 16, c = MUS.chase, t = MUS.tension;
  if (c > .05) { // the chase: pumping bass, heartbeat on 1 and 3, staccato strings, hats when it gets close
    const bass = [55, 55, 65.4, 55, 49, 49, 58.3, 49][k % 8];
    tone(bass, 0, .11, "sawtooth", .018 * c);
    if (k % 4 === 0) { tone(62, 0, .14, "sine", .07 * c, 38); }
    if (k % 4 === 1) tone(58, 0, .1, "sine", .035 * c, 40);
    if (k % 2 === 0) tone([440, 466, 523, 466, 440, 415, 392, 415][(k >> 1) % 8], 0, .07, "square", .006 * c);
    if (c > .5) noise(0, .03, 7000, .8, .012 * c, "highpass");
    if (k === 15 && c > .7) tone(880, 0, .3, "sawtooth", .008, 1320);
  }
  if (t > .05 && k % 4 === 0) { // the clock: a tick every beat, a heartbeat that speeds up when it gets tight
    tone(2200, 0, .025, "square", .01 * t);
    if (t > .5 || k % 8 === 0) { tone(70, .0, .12, "sine", .055 * t, 45); tone(62, .16, .12, "sine", .035 * t, 42); }
  }
}
function updateMusic(dt) {
  if (!actx || !run) return;
  const live = (mode === "play" || mode === "dialog") && run.mode;
  // how hard are they after you? the nearest pursuer counts, a hunting boss counts double
  let chase = 0;
  if (live && level) for (const e of level.enemies) {
    if (e.done || e.gone || TYPES[e.type].static) continue;
    const d = Math.hypot(e.x - player.x, e.y - player.y), hunt = e.hunting || e.hunter;
    if (e.state === "spot" || hunt) chase = Math.max(chase, Math.min(1, (hunt ? 1.2 : 1) * (1 - d / 14)));
  }
  MUS.chase += ((live ? chase : 0) - MUS.chase) * Math.min(1, dt * (chase > MUS.chase ? 2.5 : .5));
  let tension = 0;
  if (live && run.mode === "mission" && !run.routeFailed) { const left = routeDeadline(run.route) - run.minutes; tension = left < 30 ? Math.min(1, (30 - left) / 25 + .35) : 0; }
  if (live && run.mode === "night" && run.task) { const left = run.task.deadline - run.minutes; if (left < 20) tension = Math.max(tension, (20 - left) / 20); }
  MUS.tension += (tension - MUS.tension) * Math.min(1, dt * 1.5);
  musicPad(0); // no background music: only danger gets music
  const want = MUS.chase > .05 || MUS.tension > .05, period = MUS.chase > .6 || MUS.tension > .7 ? 110 : 140;
  if (want && (!MUS.t || MUS.period !== period)) { clearInterval(MUS.t); MUS.period = period; MUS.t = setInterval(musicTick, period); }
  else if (!want && MUS.t) { clearInterval(MUS.t); MUS.t = null; MUS.step = 0; }
}

// ---------- a little fanfare when something is done: small for a floor task, big for an item from your exit list ----------
function successJingle(kind) {
  if (!actx || !settings.sound) return;
  if (MUS.pad) { MUS.pad.gain.setTargetAtTime(0, actx.currentTime, .1); } // the uneasy pad steps aside for a moment
  const big = kind === "big", notes = big ? [523, 659, 784, 1047] : [659, 784, 988];
  notes.forEach((f, i) => { tone(f, i * .1, .22, "triangle", .05); tone(f / 2, i * .1, .22, "square", .012); });
  const end = notes.length * .1;
  if (big) { [1047, 1319, 1568].forEach(f => tone(f, end, .9, "triangle", .035)); tone(523, end, .9, "sine", .05); noise(end, .5, 6000, .6, .015, "highpass"); }
  else tone(1319, end, .45, "triangle", .03);
}

// ---------- sound effects for actions (no background music any more; music only when you are in danger) ----------
// a muted trombone "wah-wah-wah" while someone talks at you: the sound of every meeting you ever sat through
function wahWah(n = 5, base = 200, vol = .05, delay = 0) {
  if (!actx || !settings.sound) return;
  const t0 = actx.currentTime + delay;
  for (let i = 0; i < n; i++) {
    const t = t0 + i * .17 + Math.random() * .03, f = base * (.85 + Math.random() * .35), d = .13 + Math.random() * .06;
    const o = actx.createOscillator(), g = actx.createGain(), lp = actx.createBiquadFilter();
    o.type = "sawtooth"; o.frequency.setValueAtTime(f * 1.06, t); o.frequency.linearRampToValueAtTime(f * .92, t + d);
    lp.type = "lowpass"; lp.Q.value = 6; lp.frequency.setValueAtTime(350, t); lp.frequency.linearRampToValueAtTime(1300, t + d * .4); lp.frequency.linearRampToValueAtTime(420, t + d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .025); g.gain.setValueAtTime(vol, t + d * .7); g.gain.linearRampToValueAtTime(0, t + d);
    o.connect(lp).connect(g).connect(master); o.start(t); o.stop(t + d + .02);
  }
}
let lastBlabla = 0;
function blabla(text) {
  const now = performance.now(); if (now - lastBlabla < 600) return; lastBlabla = now;
  wahWah(Math.max(3, Math.min(9, Math.round((text || "").length / 22))), 170 + Math.random() * 70);
}
Object.assign(sfx, {
  // the hospital PA: ding-dong, then a muffled announcement voice
  pa: () => { tone(784, 0, .5, "sine", .06); tone(622, .45, .8, "sine", .06); noise(.9, 1.6, 900, 2, .012); wahWah(7, 150, .03, 1.0); },
  energyUp: () => { [523, 659, 784].forEach((f, i) => tone(f, i * .06, .14, "triangle", .04)); },
  energyDown: () => { tone(330, 0, .18, "square", .035, 220); tone(220, .12, .22, "square", .03, 150); },
  // door: a click of the handle, then a creak
  door: () => { noise(0, .05, 2500, 1, .08); tone(210, .05, .35, "sawtooth", .012, 150); noise(.05, .3, 600, 3, .04); },
  useItem: k => {
    const s = {
      "1": () => { noise(0, .35, 1800, 2, .05); tone(180, .3, .2, "sine", .04, 120); },                 // coffee: slurp, gulp
      "0": () => { noise(0, .12, 5000, .6, .07, "highpass"); noise(.1, .5, 3000, 1, .03); },              // energy drink: tssss
      "$": () => { tone(160, 0, .12, "sine", .05); tone(140, .15, .12, "sine", .05); },                  // donut: nom nom
      "+": () => { [880, 1175, 1568].forEach((f, i) => tone(f, i * .07, .3, "sine", .03)); },            // cream: shimmer
      "2": () => { noise(0, .25, 2500, 1.2, .05); tone(400, .1, .2, "triangle", .03, 600); },            // clipboard: paper flip
      c: () => { noise(0, .3, 1200, .8, .05); },                                                          // coat: rustle
      m: () => { tone(300, 0, .06, "square", .04); noise(.05, .2, 4000, 1, .03); },                     // mask: snap
      f: () => { [0, .25].forEach(t => { tone(1320, t, .12, "square", .03); tone(1650, t + .06, .12, "square", .03); }); }, // fake call: ring ring
      p: () => { noise(0, .25, 3000, .7, .04); tone(1800, .35, .05, "square", .04); },                  // pen: whoosh, clack
    }[k];
    if (s) s(); else { tone(660, 0, .1, "triangle", .04); tone(990, .08, .14, "triangle", .04); }
  },
});
