# Hospital Escape · To-do für später

## E-Mail (braucht dich, nicht den Code)
Alles im Code ist fertig (Anmelde-Code, Willkommens-Mail, Meldung an dich bei neuem Konto und neuem Vorschlag). Es fehlt nur der Mail-Versand.

1. **Resend-Konto** anlegen (resend.com), am besten mit deiner eigenen E-Mail.
2. Dort einen **API-Schlüssel** erstellen.
3. Supabase-Dashboard → Projekt „hospital-escape“ → **Edge Functions → Secrets**: `RESEND_API_KEY` = der Schlüssel.
   → Ab dann kommen die Meldungen über neue Konten und Vorschläge bei dir an.
4. Für Mails an **Fremde** (Anmelde-Code, Willkommens-Mail): in Resend eine **eigene Domain** verifizieren, dann
   - Supabase → Edge Functions → Secrets: `MAIL_FROM` = z. B. `Hospital Escape <spiel@deine-domain.de>`
   - Supabase → Authentication → **SMTP Settings**: Resend als SMTP eintragen (Host `smtp.resend.com`, Port 465, Benutzer `resend`, Passwort = API-Schlüssel)
   - Supabase → Authentication → **URL Configuration**: Site URL `https://hospital-escape.vercel.app`
   - Supabase → Authentication → **Email Templates → Magic Link**: `{{ .Token }}` in den Text einfügen (der 6-stellige Code)

## Datenbank (kurze Bestätigung in Supabase nötig)
- Admin-Schlüssel für die Statistik-Seite (`admin.html`) per Migration anlegen. Bis dahin: Statistik-Seite nur per Anmeldung mit deiner E-Mail.
- Testspieler aus den Bot-Tests löschen („Testbot Alpha/Beta“ und namenlose Testspieler).

## Rechtliches
- Datenschutzerklärung und Impressum: Entwurf liegt im Spiel unter „Datenschutz & Impressum“. **Bitte prüfen lassen** und deine Anbieter-Angaben (Name, Anschrift) eintragen.

## Später / Ideen
- Nachtdienst ausbauen (mehr Ereignisse, Steigerung über die Nacht)
- Englische Version
- Echte Tests mit 3–5 Leuten, die das Spiel nicht kennen
