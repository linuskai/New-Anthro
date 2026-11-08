/* Hospital Escape 3D · install as an app: a service worker for offline play and fast starts, and a short guide
   for anyone who opened the link in the browser (iPhone: Share → Add to Home Screen; Android: Install). */
const INSTALL_KEY = "hospital-escape-install";
let installEvt = null;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isMobile = isIOS || /android/i.test(navigator.userAgent);
const inFrame = window.top !== window;
if ("serviceWorker" in navigator && location.protocol === "https:" && !inFrame) navigator.serviceWorker.register("sw.js").catch(() => {});
addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; refreshInstall(); });
addEventListener("appinstalled", () => { installEvt = null; store.set(INSTALL_KEY, { done: true }); track("installed", {}); refreshInstall(); });
function refreshInstall() { const b = $("btnInstall"); if (b) b.hidden = isStandalone() || inFrame || !(isMobile || installEvt); }
function showInstall() {
  const steps = isIOS
    ? [`Unten in Safari auf <span class="ic">⬆️</span> <b>Teilen</b> tippen`, `Nach unten scrollen: <span class="ic">➕</span> <b>Zum Home-Bildschirm</b>`, `Oben rechts <b>Hinzufügen</b>, dann das Icon auf dem Home-Bildschirm öffnen`]
    : installEvt ? [`Unten auf <b>Installieren</b> tippen`, `Bestätigen, dann das Icon öffnen`]
    : [`Oben rechts im Browser auf <span class="ic">⋮</span> tippen`, `<b>App installieren</b> oder <b>Zum Startbildschirm hinzufügen</b>`, `Dann das Icon öffnen`];
  if (isIOS && !/safari/i.test(navigator.userAgent) || /crios|fxios|instagram|fban|fbav|line\//i.test(navigator.userAgent)) steps.unshift(`Den Link zuerst in <b>Safari</b> öffnen (in anderen Apps geht das nicht)`);
  $("instSteps").innerHTML = steps.map(s => `<li><span>${s}</span></li>`).join("");
  $("btnInstGo").firstElementChild.textContent = installEvt ? "Installieren" : "Verstanden";
  show("ovInstall"); track("install_guide", { ios: isIOS });
}
function closeInstall() { const s = store.get(INSTALL_KEY) || {}; s.seen = (s.seen || 0) + 1; store.set(INSTALL_KEY, s); mode = "title"; show("ovTitle"); }
$("btnInstall").addEventListener("click", showInstall);
$("btnInstLater").addEventListener("click", closeInstall);
$("btnInstGo").addEventListener("click", async () => { if (installEvt) { installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} installEvt = null; } closeInstall(); refreshInstall(); });
refreshInstall();
// first visit on a phone, in the browser: show the guide once, and once more on the third visit
setTimeout(() => {
  if (isStandalone() || inFrame || !isMobile || mode !== "title") return;
  const s = store.get(INSTALL_KEY) || {}; s.visits = (s.visits || 0) + 1; store.set(INSTALL_KEY, s);
  if (!s.done && (!s.seen || (s.seen === 1 && s.visits === 3))) showInstall();
}, 2500);
