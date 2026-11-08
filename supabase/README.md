# Database (Supabase)

Project `hospital-escape` (eu-central-1). The game talks to it only through the `hx_*` functions; all tables are closed to clients.

- No accounts: each device creates a random 32-hex secret (`hospital-escape-token` in localStorage). Only its SHA-256 is stored.
  The same secret is the device code that moves your progress to another device.
- `players` (name, avatar, `auth_user` prepared for e-mail accounts), `player_tokens`, `saves` (one mission checkpoint), `scores` (best per mission and night shift).
- Client API: `hx_sync`, `hx_save`, `hx_submit`, `hx_board`. Prepared for accounts: `hx_link_account`, `hx_claim_device` (need a signed-in Supabase Auth user).

The schema is in `migrations/`.
