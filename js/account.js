/* Hospital Escape 3D · an optional account by e-mail (Supabase Auth, a code by e-mail, no password).
   The account owns the player: sign in on any device and the progress is there. Playing without an account stays the default. */
const AUTH_KEY = "hospital-escape-auth";
let auth = store.get(AUTH_KEY); // { access_token, refresh_token, expires_at, email }
async function authCall(path, body, bearer) {
  const r = await fetch(`${SB.url}/auth/v1/${path}`, { method: "POST", headers: { apikey: SB.key, "Content-Type": "application/json", ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) }, body: JSON.stringify(body || {}) });
  const txt = await r.text(), j = txt ? JSON.parse(txt) : {};
  if (!r.ok) throw new Error(j.msg || j.error_description || j.message || "Fehler " + r.status);
  return j;
}
function saveAuth(s, email) {
  auth = { access_token: s.access_token, refresh_token: s.refresh_token, expires_at: Date.now() + (s.expires_in || 3600) * 1000, email: (s.user && s.user.email) || email || (auth && auth.email) || "" };
  store.set(AUTH_KEY, auth);
}
async function authToken() {
  if (!auth) return null;
  if (Date.now() > auth.expires_at - 60000) { try { saveAuth(await authCall("token?grant_type=refresh_token", { refresh_token: auth.refresh_token })); } catch (e) { return null; } }
  return auth.access_token;
}
async function rpcAuth(fn, args) {
  const tok = await authToken(); if (!tok) throw new Error("Nicht angemeldet");
  const r = await fetch(`${SB.url}/rest/v1/rpc/${fn}`, { method: "POST", headers: { apikey: SB.key, Authorization: `Bearer ${tok}`, "Content-Type": "application/json" }, body: JSON.stringify(args) });
  if (!r.ok) throw new Error(fn + " " + r.status);
  const t = await r.text(); return t ? JSON.parse(t) : null;
}
// after signing in: this device joins the account's player, or (first time) this device's player becomes the account's
async function afterLogin() {
  const st = await rpcAuth("hx_claim_device", { p_token: token });
  if (!st) await rpcAuth("hx_link_account", { p_token: token });
  await syncCloud();
  if (typeof track === "function") track("account", { first: !st });
  renderAcct();
}
function renderAcct() {
  const on = !!auth;
  $("acctOut").hidden = on; $("acctIn").hidden = !on; if (on) $("acctMail").textContent = auth.email || "dein Konto";
  $("acctInfo").textContent = on ? "Spielstand, Bestzeiten und Name hängen an deinem Konto. Auf einem anderen Gerät einfach mit derselben E-Mail anmelden." : "Kein Passwort: Du bekommst einen 6-stelligen Code per E-Mail. Neu? Dann wird dein Konto dabei automatisch angelegt, und dein bisheriger Fortschritt kommt mit.";
  $("acctHead").textContent = on ? "✓ Konto verbunden" : "📧 Anmelden oder Konto erstellen";
  $("acctTitle").textContent = on ? `Hallo, ${displayName()}` : "Du spielst als Gast";
  $("acctLead").textContent = on ? "Du bist angemeldet. Dein Fortschritt ist sicher und auf jedem Gerät da." : "Dein Fortschritt liegt nur auf diesem Gerät. Mit einem Konto ist er sicher und auf jedem Gerät da.";
  $("ovAccount").classList.toggle("signed", on);
  if (typeof refreshTitle === "function") refreshTitle();
}
const acctNote = (t, kind) => { const el = $("acctMsg"); el.textContent = t; el.className = "small fb-note" + (kind ? " " + kind : ""); el.hidden = !t; };
// the profile & account page: name, avatar, account by e-mail, and the device code for people without an account
let acctReturn = "title";
function openAccount(from, focusMail) {
  acctReturn = from || mode; mode = "account"; show("ovAccount"); $("ovAccount").scrollTop = 0;
  $("profName").value = profile.name; $("profName").placeholder = "Dr. Anonym";
  $("profAvs").innerHTML = AVATARS.map(a => `<button type="button" class="av-pick${a === profile.av ? " on" : ""}" data-a="${a}">${a}</button>`).join("");
  $("devCode").textContent = fmtCode(token); $("codeMsg").textContent = ""; acctNote("");
  renderAcct(); if (focusMail && !auth) setTimeout(() => $("acctEmail").focus(), 250);
}
function closeAccount() {
  if (acctReturn === "board") return openBoard(boardReturn);
  if (acctReturn === "pause" && run) { mode = "pause"; show("ovPause"); return; }
  mode = "title"; show("ovTitle"); refreshTitle();
}
$("btnAcctClose").addEventListener("click", closeAccount);
$("btnAcctPause").addEventListener("click", () => openAccount("pause"));

// first start: guest or account? Shown once; a device that already has progress or an account is simply recognised
const WELCOME_KEY = "hospital-escape-welcome";
function maybeWelcome() {
  if (store.get(WELCOME_KEY) || mode !== "title") return false;
  const known = !!auth || !!store.get(SAVE_KEY) || Object.keys(loadRecords() || {}).length > 0 || !!(profile && profile.name);
  if (known) { store.set(WELCOME_KEY, { at: Date.now(), known: true }); return false; }
  mode = "welcome"; show("ovWelcome"); track("welcome", {}); return true;
}
function leaveWelcome(how) { store.set(WELCOME_KEY, { at: Date.now(), how }); track("welcome_choice", { how }); }
$("btnWelGuest").addEventListener("click", () => { leaveWelcome("guest"); mode = "title"; show("ovTitle"); refreshTitle(); sfx.tick(); });
$("btnWelAcct").addEventListener("click", () => { leaveWelcome("account"); openAccount("title", true); });
$("btnAcctSend").addEventListener("click", async () => {
  const email = ($("acctEmail").value || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { acctNote("Bitte eine gültige E-Mail-Adresse eingeben.", "bad"); return; }
  acctNote("Sende Code …");
  try {
    await authCall("otp?redirect_to=" + encodeURIComponent(location.origin + location.pathname), { email, create_user: true });
    $("acctCodeRow").hidden = false; $("acctCode").focus();
    acctNote(`✓ E-Mail an ${email} ist unterwegs. Gib den 6-stelligen Code ein. Nichts da? Auch im Spam-Ordner nachsehen.`, "ok");
  } catch (e) { acctNote("✗ Das hat nicht geklappt: " + e.message + ". Später nochmal versuchen.", "bad"); }
});
$("btnAcctVerify").addEventListener("click", async () => {
  const email = ($("acctEmail").value || "").trim().toLowerCase(), code = ($("acctCode").value || "").replace(/\D/g, "");
  if (code.length < 6) { acctNote("Der Code hat 6 Ziffern.", "bad"); return; }
  acctNote("Prüfe …");
  try { saveAuth(await authCall("verify", { type: "email", email, token: code }), email); await afterLogin(); acctNote("✓ Angemeldet. Dein Fortschritt ist jetzt sicher in deinem Konto.", "ok"); }
  catch (e) { acctNote("✗ Code falsch oder abgelaufen. Neuen Code anfordern?", "bad"); }
});
$("btnAcctOut").addEventListener("click", async () => {
  try { const tok = await authToken(); if (tok) await authCall("logout", {}, tok); } catch (e) {}
  auth = null; store.del(AUTH_KEY);
  token = newToken(); store.set(TOKEN_KEY, token); // this device starts fresh; the account keeps its progress
  store.del(SAVE_KEY); store.del(REC_KEY); store.del("hospital-escape-night-board"); profile = { name: "", av: "🧑‍⚕️" }; store.del(PROF_KEY);
  openAccount(acctReturn); acctNote("Abgemeldet. Mit derselben E-Mail kommst du jederzeit zurück.", "ok");
});
// coming back from the link in the e-mail: #access_token=…&refresh_token=…
(async () => {
  if (!/access_token=/.test(location.hash)) { renderAcct(); return; }
  const h = new URLSearchParams(location.hash.slice(1)); history.replaceState(null, "", location.pathname + location.search);
  try {
    const s = { access_token: h.get("access_token"), refresh_token: h.get("refresh_token"), expires_in: +h.get("expires_in") || 3600 };
    const u = await fetch(`${SB.url}/auth/v1/user`, { headers: { apikey: SB.key, Authorization: `Bearer ${s.access_token}` } }).then(r => r.json());
    saveAuth(s, u && u.email); await afterLogin();
  } catch (e) {}
  renderAcct();
})();
