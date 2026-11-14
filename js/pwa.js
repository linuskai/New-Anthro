/* Hospital Escape 3D · install as an app: a service worker for offline play and fast starts, and a guide for anyone
   who opened the link in the browser. The guide breaks with the game's style on purpose: it shows a real-looking phone
   screen per step (Safari or Chrome), with a pulsing ring and an arrow on exactly the button to tap. */
const INSTALL_KEY = "hospital-escape-install";
let installEvt = null;
const UA = navigator.userAgent;
const isIOS = /iphone|ipad|ipod/i.test(UA) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isMobile = isIOS || /android/i.test(UA);
const inFrame = window.top !== window;
// Safari 26 moved "Share" into the "⋯" menu at the bottom right
const safariMajor = (() => { const m = UA.match(/Version\/(\d+)/); return m ? +m[1] : 0; })();
const inOtherApp = /crios|fxios|edgios|instagram|fban|fbav|line\/|whatsapp|gsa\//i.test(UA) || (isIOS && !/safari/i.test(UA));
if ("serviceWorker" in navigator && location.protocol === "https:" && !inFrame) navigator.serviceWorker.register("sw.js").catch(() => {});
addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; refreshInstall(); });
addEventListener("appinstalled", () => { installEvt = null; store.set(INSTALL_KEY, { done: true }); track("installed", {}); refreshInstall(); });
function refreshInstall() { const b = $("btnInstall"); if (b) b.hidden = isStandalone() || inFrame || !(isMobile || installEvt); }

// ---------- the phone mock-ups ----------
const IC = {
  share: `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" fill="none" stroke="#007aff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 10H6.5A1.5 1.5 0 0 0 5 11.5v8A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 17.5 10H16" fill="none" stroke="#007aff" stroke-width="2" stroke-linecap="round"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" width="20" height="20"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="#1c1c1e" stroke-width="1.8"/><path d="M12 8v8M8 12h8" stroke="#1c1c1e" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  dots: `<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="5.5" cy="12" r="1.8" fill="#1c1c1e"/><circle cx="12" cy="12" r="1.8" fill="#1c1c1e"/><circle cx="18.5" cy="12" r="1.8" fill="#1c1c1e"/></svg>`,
  vdots: `<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="5.5" r="1.9" fill="#3c4043"/><circle cx="12" cy="12" r="1.9" fill="#3c4043"/><circle cx="12" cy="18.5" r="1.9" fill="#3c4043"/></svg>`,
};
const APP_ICON = `<span class="pm-appicon"><img src="icons/icon-192.png" alt=""></span>`;
const pageMini = `<div class="pm-page"><div class="pm-sign">🏃🚪</div><b>HOSPITAL<br><i>ESCAPE</i></b><span>Dein Dienst ist vorbei.</span></div>`;
const tapMark = `<span class="pm-tap"><span class="pm-spot"></span><span class="pm-ring"></span><span class="pm-arrow">👆</span></span>`;
const tapDown = `<span class="pm-tap down"><span class="pm-spot"></span><span class="pm-ring"></span><span class="pm-arrow">👇</span></span>`; // for buttons at the bottom edge
const statusBar = `<div class="pm-status"><b>9:41</b><span>📶 🔋</span></div>`;
const safariBottom = (target) => `<div class="pm-safbar">
  <div class="pm-url">🔒 hospital-escape.vercel.app</div>
  <div class="pm-tools"><span>‹</span><span>›</span><span class="${target === "share" ? "pm-hot" : ""}">${IC.share}${target === "share" ? tapDown : ""}</span><span>📖</span><span>⧉</span></div></div>`;
const safari26Bottom = (target) => `<div class="pm-safbar s26"><div class="pm-tools"><span>‹</span><div class="pm-url">hospital-escape.vercel.app</div><span class="${target === "dots" ? "pm-hot" : ""}">${IC.dots}${target === "dots" ? tapDown : ""}</span></div></div>`;
const shareSheet = (hot) => `<div class="pm-dim"></div><div class="pm-sheet">
  <div class="pm-sheet-head">${APP_ICON}<span><b>Hospital Escape</b><small>hospital-escape.vercel.app</small></span><i>✕</i></div>
  <div class="pm-apps"><span><i style="background:#34c759">💬</i>Nachrichten</span><span><i style="background:#25d366">🟢</i>WhatsApp</span><span><i style="background:#007aff">✉️</i>Mail</span><span><i style="background:#ffcc00">📝</i>Notizen</span></div>
  <div class="pm-list"><div>Kopieren<em>⧉</em></div><div>Zur Leseliste hinzufügen<em>👓</em></div><div>Lesezeichen hinzufügen<em>📖</em></div>
  <div class="${hot ? "pm-hot row" : ""}">Zum Home-Bildschirm<em>${IC.plus}</em>${hot ? tapMark : ""}</div><div>Markierung<em>✎</em></div></div></div>`;
const addScreen = `<div class="pm-add"><div class="pm-add-head"><span>Abbrechen</span><b>Zum Home-Bildschirm</b><span class="pm-hot add">Hinzufügen${tapMark}</span></div>
  <div class="pm-add-card">${APP_ICON}<span><b>Hospital Escape</b><small>hospital-escape.vercel.app</small></span></div>
  <div class="pm-add-row">Als Web-App öffnen<i class="pm-switch"></i></div>
  <p>Ein Symbol wird deinem Home-Bildschirm hinzugefügt, damit du diese Website schnell aufrufen kannst.</p></div>`;
const homeScreen = (android) => `<div class="pm-home${android ? " and" : ""}"><div class="pm-grid">${["📷 Kamera", "🗓 Kalender", "🖼 Fotos", "⏰ Uhr", "🌤 Wetter", "🗺 Karten", "🎵 Musik", "⚙️ Einstellungen"].map(a => `<span><i>${a.split(" ")[0]}</i>${a.split(" ")[1]}</span>`).join("")}
  <span class="pm-new">${APP_ICON}Hospital<span class="pm-ring big"></span></span></div><div class="pm-dock"><i>📞</i><i>🧭</i><i>💬</i><i>🎧</i></div></div>`;
const menu26 = `<div class="pm-dim"></div><div class="pm-menu"><div>⬆ <span class="pm-hot row">Teilen${tapMark}</span></div><div>☆ Zu Favoriten</div><div>📖 Lesezeichen hinzufügen</div><div>🔍 Auf der Seite suchen</div><div>Aa Darstellung</div></div>`;
const chromeTop = (hot) => `<div class="pm-chrome"><span>⌂</span><div class="pm-url">hospital-escape.vercel.app</div><span>▢</span><span class="${hot ? "pm-hot" : ""}">${IC.vdots}${hot ? tapMark : ""}</span></div>`;
const chromeMenu = `<div class="pm-dim"></div><div class="pm-cmenu"><div>Neuer Tab</div><div>Verlauf</div><div>Downloads</div><div>Lesezeichen</div><div class="pm-hot row">📲 App installieren${tapMark}</div><div>Teilen …</div><div>Einstellungen</div></div>`;
const chromeDialog = `<div class="pm-dim"></div><div class="pm-dialog"><b>App installieren?</b>${APP_ICON}<span>Hospital Escape<small>hospital-escape.vercel.app</small></span><div class="pm-dlg-btns"><span>Abbrechen</span><span class="pm-hot pill">Installieren${tapMark}</span></div></div>`;
const phone = (inner, android) => `<div class="pm-phone${android ? " android" : ""}"><div class="pm-notch"></div><div class="pm-screen">${statusBar}${inner}</div></div>`;

function installSteps() {
  const S = [];
  if (inOtherApp) S.push({ cap: isIOS ? "Zuerst in Safari öffnen: Unten rechts auf ⋯ oder 🧭 tippen, dann „In Safari öffnen“. Aus Instagram, WhatsApp oder Chrome heraus klappt es auf dem iPhone nicht." : "Zuerst im Browser (Chrome) öffnen: Oben rechts auf ⋮ tippen, dann „Im Browser öffnen“.",
    html: phone(`${pageMini}<div class="pm-inapp"><span>In Safari öffnen</span><span>Link kopieren</span></div>`) });
  if (isIOS) {
    if (safariMajor >= 26) {
      S.push({ cap: "Unten rechts auf die drei Punkte ⋯ tippen.", html: phone(pageMini + safari26Bottom("dots")) });
      S.push({ cap: "Im Menü auf „Teilen“ tippen.", html: phone(pageMini + safari26Bottom() + menu26) });
    } else S.push({ cap: "Unten in der Mitte auf das Teilen-Symbol tippen (Quadrat mit Pfeil nach oben).", html: phone(pageMini + safariBottom("share")) });
    S.push({ cap: "Etwas nach oben wischen und „Zum Home-Bildschirm“ antippen.", html: phone(pageMini + (safariMajor >= 26 ? safari26Bottom() : safariBottom()) + shareSheet(true)) });
    S.push({ cap: "Oben rechts auf „Hinzufügen“ tippen.", html: phone(addScreen) });
    S.push({ cap: "Fertig! Ab jetzt startest du das Spiel über dieses Icon auf deinem Home-Bildschirm, im Vollbild.", html: phone(homeScreen(false)) });
  } else {
    if (installEvt) S.push({ cap: "Unten auf „Installieren“ tippen und bestätigen.", html: phone(pageMini + chromeDialog, true) });
    else {
      S.push({ cap: "Oben rechts auf die drei Punkte ⋮ tippen.", html: phone(chromeTop(true) + pageMini, true) });
      S.push({ cap: "„App installieren“ antippen (manchmal heißt es „Zum Startbildschirm hinzufügen“).", html: phone(chromeTop() + pageMini + chromeMenu, true) });
      S.push({ cap: "Mit „Installieren“ bestätigen.", html: phone(chromeTop() + pageMini + chromeDialog, true) });
    }
    S.push({ cap: "Fertig! Ab jetzt startest du das Spiel über das Icon, im Vollbild.", html: phone(homeScreen(true), true) });
  }
  return S;
}
let inst = null;
function instGo(i) {
  if (!inst) return;
  inst.i = Math.max(0, Math.min(inst.steps.length - 1, i));
  const st = inst.steps[inst.i], last = inst.i === inst.steps.length - 1;
  $("instDemo").innerHTML = `<div class="inst-step"><div class="inst-num">Schritt ${inst.i + 1} von ${inst.steps.length}</div>${st.html}<p class="inst-cap">${esc(st.cap)}</p></div>`;
  $("instDots").innerHTML = inst.steps.map((_, k) => `<i class="${k === inst.i ? "on" : k < inst.i ? "done" : ""}"></i>`).join("");
  $("btnInstPrev").disabled = inst.i === 0; $("btnInstNext").hidden = last;
  $("btnInstGo").firstElementChild.textContent = installEvt && !isIOS ? "Jetzt installieren" : last ? "Alles klar" : "Verstanden";
  sfx.tick();
}
function showInstall() {
  inst = { steps: installSteps(), i: 0 };
  show("ovInstall"); mode = "install"; instGo(0); track("install_guide", { ios: isIOS, safari: safariMajor, other: inOtherApp });
}
function closeInstall() {
  const s = store.get(INSTALL_KEY) || {}; s.seen = (s.seen || 0) + 1; store.set(INSTALL_KEY, s); inst = null;
  mode = "title"; show("ovTitle"); setTimeout(() => typeof maybeWelcome === "function" && maybeWelcome(), 300);
}
$("btnInstall").addEventListener("click", showInstall);
$("btnInstPrev").addEventListener("click", () => inst && instGo(inst.i - 1));
$("btnInstNext").addEventListener("click", () => inst && instGo(inst.i + 1));
$("instDemo").addEventListener("click", () => { if (inst && inst.i < inst.steps.length - 1) instGo(inst.i + 1); });
$("btnInstLater").addEventListener("click", closeInstall);
$("btnInstGo").addEventListener("click", async () => { if (installEvt && !isIOS) { installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} installEvt = null; } closeInstall(); refreshInstall(); });
refreshInstall();
// first visit on a phone, in the browser: the guide first (the installed app keeps its own storage on the iPhone),
// once more on the third visit; everywhere else straight to the welcome screen
setTimeout(() => {
  if (mode !== "title") return;
  const browserPhone = !isStandalone() && !inFrame && isMobile;
  if (browserPhone) {
    const s = store.get(INSTALL_KEY) || {}; s.visits = (s.visits || 0) + 1; store.set(INSTALL_KEY, s);
    if (!s.done && (!s.seen || (s.seen === 1 && s.visits === 3))) return showInstall();
  }
  if (typeof maybeWelcome === "function") maybeWelcome();
}, 1600);

// ---------- after an update: a small card "Neu in dieser Version" for players who have been here before ----------
const NEWS = ["🏋️ Orthopäden-Kämpfe neu: eigene Attacken, Fitness-Arena, Kampfmusik", "🔊 Geräusche statt Hintergrundmusik: knarrende Türen, leiser Alarm, wenn man dich entdeckt", "🏆 Erfolge sammeln (im Profil)", "📸 Ergebnis als Bild teilen", "💾 Speichern genau da, wo du aufhörst"];
function showNews() {
  const seen = store.get("hospital-escape-news"); store.set("hospital-escape-news", GAME_VERSION);
  if (!seen || seen === GAME_VERSION || !store.get("hospital-escape-welcome") || mode !== "title") return;
  const d = document.createElement("div"); d.className = "news-card";
  d.innerHTML = `<b>Neu in Version ${esc(GAME_VERSION)}</b><ul>${NEWS.map(n => `<li>${esc(n)}</li>`).join("")}</ul><button type="button">Weiter</button>`;
  document.body.appendChild(d); d.querySelector("button").addEventListener("click", () => d.remove()); setTimeout(() => d.isConnected && d.remove(), 15000);
}
setTimeout(() => { if (mode === "title") showNews(); else store.set("hospital-escape-news", store.get("hospital-escape-news") || GAME_VERSION); }, 2600);
