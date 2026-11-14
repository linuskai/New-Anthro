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
  if (on) $("acctMail").textContent = auth.email || "dein Konto";
  $("acctTitle").textContent = on ? `Hallo, ${displayName()}` : "Du bist angemeldet";
  if (typeof refreshTitle === "function") refreshTitle();
}
const acctNote = (t, kind) => { const el = $("acctMsg"); el.textContent = t; el.className = "small fb-note" + (kind ? " " + kind : ""); el.hidden = !t; };

/* the staff entrance: one screen for everything about signing in.
   choose (guest or account) → email → code → signed in. "Zurück" always leads back to the choice. */
const WELCOME_KEY = "hospital-escape-welcome";
let welReturn = "title";
function welStep(st) {
  $("welBox").dataset.step = st; acctNote("");
  if (st === "email") { $("acctMailStep").hidden = false; $("acctCodeRow").hidden = true; setTimeout(() => $("acctEmail").focus(), 250); }
}
function openWelcome(from, step) {
  welReturn = from || mode; mode = "welcome"; show("ovWelcome"); $("ovWelcome").scrollTop = 0;
  const first = !store.get(WELCOME_KEY);
  $("welTitle").textContent = first ? "Willkommen zum Dienst" : "Personaleingang";
  $("welLead").textContent = first ? "Wie willst du spielen?" : "Du spielst gerade als Gast. Willst du ein Konto?";
  $("welGuestT").textContent = first ? "Als Gast spielen" : "Als Gast weiterspielen";
  renderAcct(); welStep(auth ? "signed" : step || "choose");
}
function leaveWelcome(how) {
  if (how) { store.set(WELCOME_KEY, { at: Date.now(), how }); track("welcome_choice", { how }); }
  if (welReturn === "board") return openBoard(boardReturn);
  if (welReturn === "pause" && run) { mode = "pause"; show("ovPause"); return; }
  mode = "title"; show("ovTitle"); refreshTitle();
}
function maybeWelcome() {
  if (store.get(WELCOME_KEY) || mode !== "title") return false;
  const known = !!auth || !!store.get(SAVE_KEY) || Object.keys(loadRecords() || {}).length > 0 || !!(profile && profile.name);
  if (known) { store.set(WELCOME_KEY, { at: Date.now(), known: true }); return false; }
  track("welcome", {}); openWelcome("title"); return true;
}
$("btnWelGuest").addEventListener("click", () => { sfx.tick(); leaveWelcome("guest"); });
$("btnWelAcct").addEventListener("click", () => { sfx.tick(); welStep("email"); });
$("btnWelBack").addEventListener("click", () => welStep("choose"));
$("btnAcctOther").addEventListener("click", () => welStep("email"));
$("btnWelPlay").addEventListener("click", () => leaveWelcome("account"));
// name, avatar and the device code: a small page of its own, back leads to where you came from
let acctReturn = "title";
function openAccount(from) {
  acctReturn = from || mode; mode = "account"; show("ovAccount"); $("ovAccount").scrollTop = 0;
  $("profName").value = profile.name; $("profName").placeholder = "Dr. Anonym";
  $("profAvs").innerHTML = AVATARS.map(a => `<button type="button" class="av-pick${a === profile.av ? " on" : ""}" data-a="${a}">${a}</button>`).join("");
  $("devCode").textContent = fmtCode(token); $("codeMsg").textContent = ""; renderAchievements();
}
function closeAccount() {
  if (acctReturn === "welcome") { mode = "welcome"; show("ovWelcome"); renderAcct(); return; }
  if (acctReturn === "board") return openBoard(boardReturn);
  if (acctReturn === "pause" && run) { mode = "pause"; show("ovPause"); return; }
  mode = "title"; show("ovTitle"); refreshTitle();
}
$("btnAcctClose").addEventListener("click", closeAccount);
$("btnWelProf").addEventListener("click", () => openAccount("welcome"));
$("btnWelProf2").addEventListener("click", () => openAccount("welcome"));
$("btnAcctPause").addEventListener("click", () => openWelcome("pause"));
$("btnAcctSend").addEventListener("click", async () => {
  const email = ($("acctEmail").value || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { acctNote("Bitte eine gültige E-Mail-Adresse eingeben.", "bad"); return; }
  acctNote("Sende Code …");
  try {
    await authCall("otp?redirect_to=" + encodeURIComponent(location.origin + location.pathname), { email, create_user: true });
    $("acctMailStep").hidden = true; $("acctCodeRow").hidden = false; $("acctSentTo").textContent = email; $("acctCode").value = ""; setTimeout(() => $("acctCode").focus(), 100);
    acctNote("✓ E-Mail ist unterwegs.", "ok");
  } catch (e) { acctNote("✗ Das hat nicht geklappt: " + e.message + ". Später nochmal versuchen.", "bad"); }
});
$("btnAcctVerify").addEventListener("click", async () => {
  const email = ($("acctEmail").value || "").trim().toLowerCase(), code = ($("acctCode").value || "").replace(/\D/g, "");
  if (code.length < 6) { acctNote("Der Code hat 6 Ziffern.", "bad"); return; }
  acctNote("Prüfe …");
  try { saveAuth(await authCall("verify", { type: "email", email, token: code }), email); await afterLogin(); store.set(WELCOME_KEY, { at: Date.now(), how: "account" }); welStep("signed"); acctNote("✓ Angemeldet. Dein Fortschritt ist jetzt sicher in deinem Konto.", "ok"); }
  catch (e) { acctNote("✗ Code falsch oder abgelaufen. Neuen Code anfordern?", "bad"); }
});
$("btnAcctOut").addEventListener("click", async () => {
  try { const tok = await authToken(); if (tok) await authCall("logout", {}, tok); } catch (e) {}
  auth = null; store.del(AUTH_KEY);
  token = newToken(); store.set(TOKEN_KEY, token); // this device starts fresh; the account keeps its progress
  store.del(SAVE_KEY); store.del(REC_KEY); store.del("hospital-escape-night-board"); profile = { name: "", av: "🧑‍⚕️" }; store.del(PROF_KEY);
  renderAcct(); welStep("choose"); acctNote(""); $("welLead").textContent = "Abgemeldet. Mit derselben E-Mail kommst du jederzeit zurück."; $("welGuestT").textContent = "Als Gast weiterspielen";
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
$("acctEmail").addEventListener("keydown", e => { if (e.key === "Enter") $("btnAcctSend").click(); });
$("acctCode").addEventListener("keydown", e => { if (e.key === "Enter") $("btnAcctVerify").click(); });
$("acctCode").addEventListener("input", e => { const v = e.target.value.replace(/\D/g, "").slice(0, 6); e.target.value = v; if (v.length === 6) $("btnAcctVerify").click(); });
