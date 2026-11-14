/* Hospital Escape 3D · the creepy layer for the day missions: the lights die and something stands at the end of the corridor,
   an empty wheelchair rolls by on its own, footsteps right behind you, a patient call from a room that does not exist,
   a clock that says 03:33. Never dangerous, always a little funny, one thing at a time, more often on dark floors. */

const CREEPY_ANNOUNCE = [
  "Code Blau auf Station 6. … Korrektur: Wir haben keine Station 6. Bitte gehen Sie nicht zur Station 6.",
  "Der Patient aus Zimmer 13 wird gebeten, in sein Bett zurückzukehren. Er wurde 1987 entlassen.",
  "Die Pathologie meldet: drei Zugänge, zwei Abgänge. Bitte zählen Sie nach. Und drehen Sie sich nicht um.",
  "Wer im Keller Schritte hört: Das ist der Personalrat. Er tagt seit 2011. Bitte nicht stören.",
  "Das Controlling hat die Hausgeister auf 0,5 Vollkräfte reduziert. Sie arbeiten jetzt doppelt so hart.",
  "In Aufzug 3 sitzt wieder jemand. Bitte nicht grüßen. Er grüßt zurück.",
  "Schwester Hildegard sucht noch Vertretung für heute Nacht. Sie hat Sie bereits gesehen.",
  "Die Uhren im Treppenhaus zeigen 03:33. Das ist kein Defekt. Bitte beeilen Sie sich.",
  "Liebe Mitarbeitende: Der Spiegel im Personal-WC zeigt ab sofort nur noch Kolleginnen und Kollegen im Dienst. Bitte nicht erschrecken.",
  "Die Station 5B bittet um Rückgabe des Rollstuhls Nr. 7. Er ist allein losgefahren. Schon wieder.",
];
const SPOOK_LINES = {
  hilde: ["Eine Schwesternhaube. Am Ende des Flurs. Hildegard? Die hat doch nur nachts Dienst…", "Schwester Hildegard. Mitten am Tag. Sie zählt schon mal die Kurven für heute Nacht. Und dich.", "Für einen Lidschlag: eine Haube, eine Kerze, ein Lächeln. Dann nur noch der Flur."],
  ghost: ["Ein Patient im Flügelhemd. Rote Augen. In der Hand ein Entlassbrief von 1998. Dann: weg.", "Herr Kowalski, Zimmer 13. Wartet auf die Visite. Seit 1987. Er winkt.", "Da stand jemand. Barfuß. Mit Tropfständer. Ohne Tropf. Ohne… Gesicht?"],
  chair: ["Ein leerer Rollstuhl rollt quer über den Flur. Niemand schiebt. Er hält kurz an. Als würde er dich ansehen.", "Rollstuhl Nr. 7 fährt allein Richtung Cafeteria. Wie alle hier: ohne Pause, ohne Ziel.", "Ein Rollstuhl. Leer. Er quietscht im Takt deines Herzschlags."],
  steps: ["Schritte. Direkt hinter dir. Du drehst dich um: niemand. Nur ein Formular, das vorher nicht da war.", "Tapp. Tapp. Tapp. Hinter dir. Dann Stille. Und ein Hauch von Desinfektionsmittel.", "Jemand geht genau in deinem Takt. Bleibst du stehen, bleibt er stehen."],
  monitor: ["Aus einem leeren Zimmer: ein Monitor-Dauerton. Niemand angeschlossen. Der Monitor ist trotzdem besorgt.", "Piep. Piep. Piiiiiiep. Im Zimmer ist niemand. Das Bett ist noch warm."],
  whisper: ["„… bleib doch noch …“ Wer hat das gesagt? Der Dienstplan?", "Jemand flüstert deinen Namen. Und deine Personalnummer.", "„… nur noch eine Aufnahme …“ flüstert es aus dem Lüftungsschacht."],
  clock: ["Die Uhr zeigt 03:33. Dann wieder die richtige Zeit. Gefühlt hast du trotzdem eine Stunde verloren."],
};
let spook = null;
function spookReset() { spook = null; if (run) run.spookT = 30 + Math.random() * 25; }
function spookFx(kind) { const f = $("spookFx"); f.className = ""; void f.offsetWidth; f.className = "on" + (kind ? " " + kind : ""); }
function spookSay(k) { setMsg(pick(SPOOK_LINES[k]), 5, true); }
function aheadSpot(min, max) {
  const fx = -Math.sin(player.yaw), fy = -Math.cos(player.yaw);
  for (let d = max; d >= min; d -= .5) {
    const tx = Math.floor(player.x + fx * d), ty = Math.floor(player.y + fy * d);
    if (cell(tx, ty) === "." && los(player.x, player.y, tx + .5, ty + .5) && !level.enemies.some(e => !e.gone && Math.hypot(e.x - tx - .5, e.y - ty - .5) < 2)) return [tx + .5, ty + .5, d];
  }
  return null;
}

const SPOOKS = [
  { k: "apparition", w: 3, run() {
    const at = aheadSpot(3.5, 6.5); if (!at) return false;
    const hilde = Math.random() < .45, sp = hilde ? { ...TYPES.J.spec(), glowEyes: true, noShadow: true } : { skin: 0xd8d4cc, hair: 0x9a9a9a, hairStyle: "messy", gown: true, glowEyes: true, noShadow: true, mood: "neutral", scale: 1.04 };
    blackout = Math.max(blackout, 1.1); sfx.powerDown();
    let t = 0, shown = null;
    spook = { upd(dt) {
      t += dt;
      if (!shown && t > 1.05) {
        const p = makePerson(sp); p.group.position.set(at[0] * S, 0, at[1] * S); p.group.rotation.y = Math.atan2(player.x - at[0], player.y - at[1]);
        level.group.add(p.group); shown = p.group; sfx.stinger(); spookFx();
      }
      const d = Math.hypot(at[0] - player.x, at[1] - player.y);
      if (shown && (t > 2.9 || d < 2)) { blackout = Math.max(blackout, .3); level.group.remove(shown); shown = null; sfx.whisper(); spookSay(hilde ? "hilde" : "ghost"); spook = null; }
      else if (t > 6) spook = null;
    } };
    return true; } },
  { k: "chair", w: 2, run() {
    const at = aheadSpot(3, 6.5); if (!at) return false;
    const tx = Math.floor(at[0]), ty = Math.floor(at[1]), fx = -Math.sin(player.yaw), fy = -Math.cos(player.yaw);
    const dir = [[1, 0], [-1, 0], [0, 1], [0, -1]].sort(() => Math.random() - .5).find(([dx, dy]) => Math.abs(dx * fx + dy * fy) < .6 && [1, 2, 3].every(k => cell(tx + dx * k, ty + dy * k) === "."));
    if (!dir) return false;
    const ch = wheelchair(); ch.position.set(at[0] * S, 0, at[1] * S); ch.rotation.y = Math.atan2(dir[0], dir[1]); level.group.add(ch);
    let t = 0, said = false;
    spook = { upd(dt) {
      t += dt; const k = Math.min(1, t / 4), e = k * k * (3 - 2 * k);
      ch.position.set((at[0] + dir[0] * 3 * e) * S, 0, (at[1] + dir[1] * 3 * e) * S);
      if (Math.random() < dt * 2.2 && k < 1) sfx.creak();
      if (!said && t > .8) { said = true; spookSay("chair"); }
      if (t > 4.4) spook = null;
    } };
    return true; } },
  { k: "steps", w: 2, run() {
    for (let i = 0; i < 6; i++) noise(i * .42, .06, 330, 1.2, .03 + i * .02);
    setTimeout(() => { if (mode !== "play") return; spookFx("cold"); spookSay("steps"); if (Math.random() < .35) { const st = pen({ tasks: ["Formular von niemandem ausfüllen"] }); showToast("📄", "#7b8a85", "Ein Formular. Von niemandem.", "Es lag plötzlich hinter dir. Ausgefüllt ist nur ein Feld: dein Name. In deiner Handschrift.", st); updateHud(); } }, 2700);
    return true; } },
  { k: "room13", w: 1, run() {
    for (let i = 0; i < 3; i++) { tone(1250, i * .9, .5, "sine", .03); tone(1000, i * .9 + .25, .5, "sine", .03); }
    showToast("🔔", "#5a1a14", "Patientenruf · Zimmer 13", pick(["Zimmer 13 klingelt. Diese Station hat zwölf Zimmer.", "Zimmer 13 klingelt. Schon wieder. Die Pflege sagt: „Nicht hingehen. Nie.“", "Zimmer 13 bittet um ein Glas Wasser. Und um Gesellschaft. Für immer."]), []);
    return true; } },
  { k: "monitor", w: 1, run() { tone(980, 0, .12, "sine", .03); tone(980, .9, .12, "sine", .03); tone(980, 1.8, 3.2, "sine", .03); setTimeout(() => mode === "play" && spookSay("monitor"), 1900); return true; } },
  { k: "whisper", w: 1, run() { sfx.whisper(); setTimeout(() => sfx.whisper(), 700); spookFx("cold"); spookSay("whisper"); return true; } },
  { k: "clock", w: 1, run() { run.glitchT = 1.4; tone(55, 0, 1.3, "sawtooth", .04, 40); spookFx(); setTimeout(() => mode === "play" && spookSay("clock"), 1500); return true; } },
  { k: "pa", w: 2, run() {
    tone(392, 0, .5, "sine", .05, 370); tone(311, .5, .9, "sine", .05, 280);
    noise(.9, 1.6, 700, 2, .012); typeof wahWah === "function" && wahWah(6, 120, .03, 1.0); showToast("📢", "#3a1210", "Durchsage · Lautsprecher knackt", "„" + pick(CREEPY_ANNOUNCE) + "“", []);
    return true; } },
];
function updateSpook(dt) {
  if (!run || run.mode !== "mission") return;
  if (run.glitchT > 0) run.glitchT -= dt;
  if (spook) { spook.upd(dt); return; }
  if (run.spookT == null) spookReset();
  const dark = currentEnv().dark || inDarkness() || cellarDark();
  run.spookT -= dt * (dark ? 1.7 : 1);
  if (run.spookT > 0 || call || playerSafe() || player.hidden || toastT > 0 || !quiet(9000)) return;
  run.spookT = 45 + Math.random() * 35;
  const pool = SPOOKS.flatMap(s => Array(s.w).fill(s)).filter(s => s.k !== run.lastSpook);
  for (let i = 0; i < 4; i++) { const s = pick(pool); if (s.run() !== false) { run.lastSpook = s.k; return; } }
}
