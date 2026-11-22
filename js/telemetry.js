/* Hospital Escape 3D · statistics and feedback: a session heartbeat with play time, game events (missions, nights, battles),
   every script error with where it happened, and improvement suggestions. Sent to Supabase in small batches. */
const GAME_VERSION = HX_BUILD;
const SESSION = (crypto.randomUUID && crypto.randomUUID()) || "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
const isStandalone = () => !!(navigator.standalone || (window.matchMedia && matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches));
let tq = [], playSec = 0, lastVis = performance.now(), errCount = 0;
function track(k, d) { try { tq.push({ k, d: d || {} }); if (tq.length >= 40) flushTrack(); } catch (e) {} }
function flushTrack(final) {
  if (!document.hidden) { playSec += (performance.now() - lastVis) / 1000; lastVis = performance.now(); }
  const ev = tq.splice(0, 50);
  const meta = { ua: navigator.userAgent, standalone: isStandalone(), screen: `${screen.width}x${screen.height}`, lang: navigator.language, v: GAME_VERSION, seconds: Math.round(playSec) };
  fetch(`${SB.url}/rest/v1/rpc/hx_track`, { method: "POST", keepalive: true, headers: { apikey: SB.key, "Content-Type": "application/json" }, body: JSON.stringify({ p_token: token, p_session: SESSION, p_meta: meta, p_events: ev }) })
    .catch(() => { if (!final && tq.length < 200) tq.unshift(...ev); });
}
document.addEventListener("visibilitychange", () => { if (document.hidden) { playSec += (performance.now() - lastVis) / 1000; flushTrack(true); } else lastVis = performance.now(); });
setInterval(() => flushTrack(), 30000);
track("session_start", { ref: (document.referrer || "").slice(0, 80), w: innerWidth, h: innerHeight });
setTimeout(() => flushTrack(), 4000);
// a crash leaves no error behind (iOS simply kills the page): a heartbeat in localStorage, reported on the next start if it did not end cleanly
const BEAT_KEY = "hx-beat";
try { const b = JSON.parse(localStorage.getItem(BEAT_KEY) || "null"); if (b && !b.end && Date.now() - b.t < 15 * 60000) track("crash_prev", b); } catch (e) {}
const beat = end => { try { localStorage.setItem(BEAT_KEY, JSON.stringify({ t: Date.now(), v: GAME_VERSION, mode: typeof mode === "string" ? mode : "", lvl: run && run.idx, night: !!(run && run.mode === "night"), sec: Math.round(playSec + (performance.now() - lastVis) / 1000), gfx: typeof settings === "object" ? settings.gfx : "", end: !!end })); } catch (e) {} };
setInterval(() => { if (!document.hidden) beat(false); }, 4000);
addEventListener("pagehide", () => beat(true)); document.addEventListener("visibilitychange", () => beat(document.hidden));
if (window.HX_HEALING) track("heal", { why: String(window.HX_HEALING) });
if (window.HX_CRASH) { const c = window.HX_CRASH, nm = id => (GFX_TIERS[id] || {}).name || id; track("crash_step", c);
  setTimeout(() => {
    const d = document.createElement("div"); d.id = "crashNote";
    d.style.cssText = "position:fixed;left:50%;top:calc(14px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:60;width:min(92vw,460px);box-sizing:border-box;background:#fff8e6;color:#2a2210;border:2px solid #e0a83a;border-radius:14px;padding:12px 14px;font:500 14px/1.4 system-ui;box-shadow:0 10px 30px rgba(0,0,0,.35)";
    d.innerHTML = `<b style="display:block;font-size:15px;margin-bottom:4px">📱💥 Die App ist eben abgestürzt</b>`
      + (c.same ? "Dem Handy ist der Speicher ausgegangen, obwohl die Grafik schon auf der niedrigsten Stufe ist. Schließ am besten andere Apps und starte neu."
        : `Dem Handy ist der Grafikspeicher ausgegangen. Die Grafik steht jetzt auf <b>${nm(c.to)}</b> statt „${nm(c.from)}“, damit das nicht wieder passiert. Ändern kannst du das unter Einstellungen → Grafik.`)
      + (c.night ? " Der Nachtdienst beginnt leider von vorn." : "") + `<button type="button" style="display:block;margin:10px 0 0 auto;font:800 14px system-ui;padding:8px 16px;border-radius:10px;border:0;background:#1f9d55;color:#fff">Verstanden</button>`;
    d.querySelector("button").onclick = () => d.remove(); document.body.appendChild(d);
  }, 1200); }
// every script error, with file:line and what the player was doing
const where = () => ({ mode: typeof mode === "string" ? mode : "", route: run && run.route, idx: run && run.idx });
addEventListener("error", e => { if (errCount++ > 25) return; track("error", { msg: String(e.message || "Fehler").slice(0, 200), at: String(e.filename || "").split("/").pop() + ":" + e.lineno + ":" + e.colno, ...where() }); flushTrack(); });
addEventListener("unhandledrejection", e => { const m = String(e.reason && (e.reason.message || e.reason) || "").slice(0, 200); if (/fetch|abort|network|load failed/i.test(m) || errCount++ > 25) return; track("error", { msg: "Promise: " + m, at: (e.reason && e.reason.stack || "").split("\n")[1] || "", ...where() }); flushTrack(); });

// ---------- feedback ----------
let fbReturn = "title";
function openFeedback() {
  fbReturn = mode === "pause" ? "pause" : "title"; show("ovFeedback"); fbNote("", "");
  if (auth && auth.email && !$("fbContact").value) $("fbContact").value = auth.email;
  setTimeout(() => $("fbText").focus(), 50);
}
function closeFeedback() { if (fbReturn === "pause" && run) { mode = "pause"; show("ovPause"); } else { mode = "title"; show("ovTitle"); } }
$("btnFeedback").addEventListener("click", openFeedback); $("btnFeedbackPause").addEventListener("click", openFeedback); $("btnFbCancel").addEventListener("click", closeFeedback);
$("btnFbSend").addEventListener("click", async () => {
  const text = ($("fbText").value || "").trim(); if (text.length < 3) { fbNote("Ein paar Worte mehr, bitte.", "bad"); return; }
  fbNote("Wird gesendet …", "");
  try {
    await rpc("hx_feedback", { p_token: token, p_text: text, p_contact: ($("fbContact").value || "").trim() || null, p_meta: { ...where(), ua: navigator.userAgent.slice(0, 160), standalone: isStandalone(), v: GAME_VERSION, screen: `${innerWidth}x${innerHeight}` } });
    $("fbText").value = ""; fbNote("✓ Danke! Dein Vorschlag ist angekommen.", "ok"); track("feedback", {}); setTimeout(closeFeedback, 2200);
  } catch (e) { fbNote("✗ Hat nicht geklappt: gerade kein Netz. Dein Text bleibt stehen, bitte gleich nochmal senden.", "bad"); }
});

/* the feedback result as a coloured banner: green = arrived, red = failed */
function fbNote(text, kind) { const el = $("fbMsg"); el.textContent = text; el.className = "small fb-note" + (kind ? " " + kind : ""); el.hidden = !text; }
