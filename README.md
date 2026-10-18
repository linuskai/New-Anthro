# Hospital Escape

A browser game for iPhone (and any other browser). Your shift ended at 17:00. Get out of the hospital before anyone hands you more work.

## Hospital Escape 3D (`index.html` + `js/`)

A satirical first-person stealth game in Three.js (r128, loaded from cdnjs). German UI. A thoroughly cost-cut hospital: Innere (5B), Orthopädie, Radiologie, Gastroenterologie, Dermatologie, Intensivstation, Keller, Notaufnahme, Parkhaus P2. Each mission uses its own selection of floors. The full design is in [`GAME_DESIGN.md`](GAME_DESIGN.md).

- **Two modes:** *Feierabend* (the missions below) and *Nachtdienst*, a survival horror night shift from 22:00 to 07:00 on a bigger ward with loops: nobody may find you. Sleepwalking patients with glowing red eyes, night nurses on their rounds and Schwester Hildegard (who only moves while you are not looking); being found means a jump scare and a strike, three strikes and the night is over. Pager tasks still send you into the rooms, missed ones send the night nurse after you. Your heartbeat speeds up when something has noticed you.
- **IV line mini-game:** when a nurse catches you, you place a peripheral line, step by step and realistically (hand hygiene, tourniquet, palpate, disinfect and wait, puncture at 15–30°, advance until flashback, release the tourniquet before pulling the needle, fix and flush).
- **The attending:** three rounds of "only a minute", every answer costs time, tasks or shifts.
- **Gastroenterology:** the ventilation was cut in 2017. Stink clouds drain energy and nerves until you switch it back on.
- **Big emergency department:** ambulance bay, waiting hall, triage desk, curtained treatment bays, resuscitation room.
- **Declining work:** night-shift pager jobs arrive as a card you can accept or decline; tasks in the mission panel can be declined (sometimes the PJ student takes them, sometimes you get a Saturday shift).
- **Six escape missions, free choice:** *Einfach heim* (home before midnight), *Pharma* (Medical Advisor, limousine at 22:00), *Beratung* (Senior Consultant, limousine at the main entrance), *Ästhetik* (Dr. Glatt's practice, pink convertible), *Kreuzfahrt* (ship's doctor, harbour shuttle) and *Medfluencer* (10,000 followers before 23:30). Each has its own intro film (the job offer arrives on your phone as WhatsApp chat, video call, slide deck, voice message, call or Instagram DM), its own floors (some missions use the new intensive care unit), its own sub-missions, a deadline on the game clock and a boss at the way out (talk, fill in a form or fight).
- **Briefing and Mission Control:** before you start, a sheet explains the story, sub-missions, route, boss, your gear (what hides you, what distracts, what defends you) and how the game works (clock, losing time, being seen, nerves, failing). In the game the 🎯 button opens Mission Control (pauses): time now, deadline, time left, time lost, checklist, open tasks, gear. You can save there.
- **A clock you can read:** one real second is half a game minute. Every lost minute (conversations, accepted calls, paperwork, CPR) flashes red at the clock with "+12 Min · Papierkram". Open tasks come due in the stairwell as a paperwork mini-game (tap the right form fields; mistakes and slowness cost minutes).
- **Failing:** miss the deadline and the job is gone (with a news ticker). Lose all nerves and you take the night shift (and can play it right away).
- **Scoring as the hospital sees it:** a "DRG revenue" in euros with ranks from *Kostenstelle* to *Leistungsträger:in*, records per mission.
- **Profile, leaderboard, sharing:** pick a player name and avatar. As a shared claude.ai artifact, everyone who plays lands on one leaderboard per mission (most euros or fastest escape) and saves follow you between devices; elsewhere it stays in the browser. Share your result with the system share sheet.
- **Satire layer:** hospital PA announcements ("Lächeln ist ab sofort Teil der Dienstkleidung"), posters ("Wir sind Familie" next to "Stellenabbau"), news tickers at the end.
- **Sound** on/off from the HUD and the title screen.
- **Scenarios:** every minute or two a situation with a decision (runaway wheelchair, printer stuck on page 1 of 1, birthday cake, a cat called Dr. Miau…).
- **Fair pursuit:** out of sight means out of mind: chasers go to where they last saw you, look around and give up (only the chief and a paged attending always know where you are). Nobody walks through walls, not even ghosts.
- **Real windows:** holes in the outer walls with rainy glass, two rain layers and the city 9 m outside (real parallax).
- **Closing scene:** after the mission your escape vehicle drives away from the hospital into the sunset, with a punchline per route.
- **Start:** a title screen with a glowing exit-sign logo and a camera dolly through the ward, then the mission choice, the mission's intro film in the doctors' room, the briefing, and you play.
- **Calls are the hospital trying to keep you:** a ward, controlling, IT, the chief's office, relatives, quality management, fire safety training. Accepting costs game time; declining saves it, but the caller comes looking for you (red "SUCHT DICH" sign) until you hide long enough.
- **Tricks:** throw a pen to distract, take off the white coat to blend in with visitors, fake an important phone call (staff leave you alone for 10 s), hide under the blanket next to a patient, pull the fire alarm (20 seconds of empty corridors, then paperwork).
- **People react:** live facial expressions (surprised, angry, delighted, disgusted), emoji bubbles, idle gestures and talking mouths.
- **Orthopaedics:** the orthopaedists hang around in the corridor doing curls and won't let 'weedy internists' pass: protein shake, a push-up tap mini-game, compliments, an anatomy quiz or a decoy.
- **Clear missions:** the mission note shows what to do, how to do it, and distance plus direction; messages can be swiped away.
- **Missions:** each floor opens with a GTA-style title card and a pager briefing from Frau Bozkurt (cleaning, 31 years in the building); completed sub-missions get their own banner.
- **Hospital layout:** corridors with rooms on both sides, loops and open halls instead of a maze. Doors open and close (people sometimes open them too), locked doors with jokes, a real stairwell with steps going down behind a fire door, and an elevator that might strand you or trap you with the chief.
- **Doctors' room:** desks with computers, phones, lamps, mugs, sticky notes, a broken office chair, on-call bed, kitchenette with a broken coffee machine. The computer, phone and coffee machine can be used.
- **Stealth instead of a chase:** everyone has a floating triangle. White = unaware, yellow = suspicious and looking at you, red = coming over to talk, green = friendly. Awareness builds up gradually and depends on distance, view cone, light and how you move (standing, sneaking, walking, running). Running makes noise, the flashlight gives you away in the dark.
- **Sneak:** pull the left stick only slightly, or toggle SCHLEICHEN (C).
- **Safe rooms:** on-call room, ward kitchen, store room. Nobody follows you in, and the sofa restores energy and nerves once.
- **One conversation per person:** whoever catches you gets one dialogue and then leaves for good. 125 different conversations across all character types (quizzes, yes/no, bets, excuses with odds, trades), no repeats within a run.
- **People are articulated 3D figures** (legs, knees, arms, elbows, faces, hair, glasses, coats, props) with walk animations. No emoji heads.
- **Endings:** one per mission, with its own vehicle driving away. The end screen shows your duty roster for next month.
- **Dialogues** look like a hospital ID badge with a rendered 3D portrait of the person, a typewriter speech bubble and answer cards with icons.
- **Wayfinding:** small translucent arrows on the floor, hanging escape-route signs to the stairwell, a lit sign and a blue ⇅ map icon for the elevator.
- **Radar minimap** that rotates with you and shows your view cone; tap it (or M) for the full map. Tap anywhere except the bottom-left stick area to look around. Compact HUD in landscape; tap the pager to collapse it.
- **Graphics:** physically based materials with ACES tone mapping and a generated environment map, point lights that follow you between ceiling lamps, light pools and contact shadows, real-time shadows (can be switched off), rounded detailed models (hospital beds, stretchers, desks, monitors, cars, ambulance), merged static geometry for performance.
- **Also:** creepy dark corridors, flickering lamps, thunderstorm at the windows, shadow figures, the ghost Dr. Ewig in the cellar, MRT pulling metal items, CPR mini-game, phone calls, lab papers on the floor, inventory, compass, waypoint, floor route dots and minimap.
- **Difficulty:** "Entspannt" (default) or "Dienstalltag".
- **Controls:** phone: bottom-left stick walk (light = sneak), drag anywhere else to look, SCHLEICHEN / RENNEN, yellow button to use, tap LAMPE to switch the flashlight. Keyboard: WASD, mouse (click to capture) or arrows/Q, C sneak, Shift sprint, E action (also doors), F flashlight, 1–6 inventory, J/N calls, Tab or B Mission Control, M map, P pause.

Code layout (plain `<script>` files sharing one global scope, no build step): `js/data.js` (levels, story, data), `js/world.js` (renderer, textures, 3D people), `js/props.js` (furniture models, geometry merging), `js/models.js` (detailed rounded models: beds, stretchers, loungers, desks, monitors, cars, ambulance), `js/build.js` (doors, stairwell, elevator, rooms, doctors' room), `js/level.js` (level construction), `js/game.js` (run state, HUD, items, audio), `js/dialog.js` (dialogue engine), `js/talks.js` … `js/talks4.js`, `js/scenarios.js` (situations with decisions), `js/score.js` (DRG revenue, ranks, records), `js/play.js` (input, stealth AI, hazards, calls, events), `js/outro.js` (closing scene), `js/missions.js` (mission choice, intro phone scenes, briefing, Mission Control, bosses, paperwork, clock), `js/social.js` (profile, saving, leaderboard, sharing), `js/flow.js` (modes, story, floors, endings, radar, rendering, boot).

## Classic 2D (`classic.html`)

The original top-down version in English.

## Play

Open `index.html` in a browser; there is no build step. On iPhone, host the folder (for example with GitHub Pages), open it in Safari, then Share → Add to Home Screen to play full screen.

To let other people play with a shared leaderboard, publish it as a claude.ai artifact (it declares the `db` and `user` capabilities) and share the link from the artifact's Share menu. Hosted anywhere else, the game works the same but profile, saves and records stay in each player's browser.
