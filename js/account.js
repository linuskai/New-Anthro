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
  if (on) $("acctInfo").textContent = "Spielstand, Bestzeiten und Name hängen an deinem Konto. Auf einem anderen Gerät einfach mit derselben E-Mail anmelden.";
}
$("btnAcctSend").addEventListener("click", async () => {
  const email = ($("acctEmail").value || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { $("acctMsg").textContent = "Bitte eine gültige E-Mail-Adresse eingeben."; return; }
  $("acctMsg").textContent = "Sende Code …";
  try {
    await authCall("otp?redirect_to=" + encodeURIComponent(location.origin + location.pathname), { email, create_user: true });
    $("acctCodeRow").hidden = false; $("acctCode").focus();
    $("acctMsg").textContent = `Wir haben dir eine E-Mail an ${email} geschickt. Gib den Code ein (oder tippe in der E-Mail auf den Link). Auch im Spam-Ordner nachsehen.`;
  } catch (e) { $("acctMsg").textContent = "Das hat nicht geklappt: " + e.message + ". Später nochmal versuchen."; }
});
$("btnAcctVerify").addEventListener("click", async () => {
  const email = ($("acctEmail").value || "").trim().toLowerCase(), code = ($("acctCode").value || "").replace(/\D/g, "");
  if (code.length < 6) { $("acctMsg").textContent = "Der Code hat 6 Ziffern."; return; }
  $("acctMsg").textContent = "Prüfe …";
  try { saveAuth(await authCall("verify", { type: "email", email, token: code }), email); await afterLogin(); $("acctMsg").textContent = "Angemeldet. Dein Fortschritt ist jetzt an dein Konto gebunden."; }
  catch (e) { $("acctMsg").textContent = "Code falsch oder abgelaufen. Neuen Code anfordern?"; }
});
$("btnAcctOut").addEventListener("click", async () => {
  try { const tok = await authToken(); if (tok) await authCall("logout", {}, tok); } catch (e) {}
  auth = null; store.del(AUTH_KEY);
  token = newToken(); store.set(TOKEN_KEY, token); // this device starts fresh; the account keeps its progress
  store.del(SAVE_KEY); store.del(REC_KEY); store.del("hospital-escape-night-board"); profile = { name: "", av: "🧑‍⚕️" }; store.del(PROF_KEY);
  renderAcct(); $("acctMsg").textContent = "Abgemeldet. Mit derselben E-Mail kommst du jederzeit zurück."; refreshTitle(); openBoard(boardReturn);
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
