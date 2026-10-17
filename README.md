# Hospital Escape

A browser game for iPhone (and any other browser). Your shift ended at 17:00. Get out of the hospital before anyone hands you more work.

## Hospital Escape 3D (`index.html` + `js/`)

A satirical first-person stealth game in Three.js (r128, loaded from cdnjs). German UI. A thoroughly cost-cut hospital in eight sections: Innere (5B), Orthopädie, Radiologie, Gastroenterologie, Dermatologie, Keller, Notaufnahme, Parkhaus P2. The full design is in [`GAME_DESIGN.md`](GAME_DESIGN.md).

- **Two modes:** *Feierabend* (the mission below) and *Nachtdienst*, a survival horror night shift from 22:00 to 07:00: pager tasks in the patient rooms, an escalating schedule (sleepwalkers, Dr. Ewig, blackouts, slamming doors, relatives at 3 am, the chief at 5), and Schwester Hildegard, who only moves while you are not looking at her. Win at dawn.
- **Gastroenterology:** the ventilation was cut in 2017. Stink clouds drain energy and nerves until you switch it back on.
- **Big emergency department:** ambulance bay, waiting hall, triage desk, curtained treatment bays, resuscitation room.
- **Declining work:** night-shift pager jobs arrive as a card you can accept or decline; tasks in the mission panel can be declined (sometimes the PJ student takes them, sometimes you get a Saturday shift).
- **Escape structure:** every way out (Pharma, Dermatology, Consulting, Startup, Health office, Cruise ship, just home) is a chain of sub-missions across the floors with a deadline, difficulty stars, a dossier in the inbox, a route chip with countdown, failing (missed deadline: only home is left) and points with ranks S–D and records per route.
- **Scenarios:** every minute or two a situation with a decision (runaway wheelchair, printer stuck on page 1 of 1, birthday cake, a cat called Dr. Miau…).
- **Real windows:** holes in the outer walls with rainy glass, two rain layers and the city 9 m outside (real parallax).
- **Closing scene:** after the mission your escape vehicle drives away from the hospital into the sunset, with a punchline per route.
- **Start:** a title screen with a glowing exit-sign logo and a camera dolly through the ward, then a short film in the doctors' room (shots of the screen, the wall clock, the note, the rattling door), then the whiteboard briefing ("Flucht-Zentrale") where you pick up to three side missions, then "Mission verstanden" and you play.
- **Career routes:** after the story you pick your way out in the inbox: Pharma, Dermatology, Consulting, Startup, Public health office, Cruise ship or just going home. Each route adds its own goals across the floors (stamps, evidence photos, testimonials, a trial day…) and its own ride in the car park.
- **Calls with consequences:** answering costs time but earns goodwill with that department; missed calls pile up, and with two open callbacks you get paged across the building and an attending starts hunting you.
- **Tricks:** throw a pen to distract, take off the white coat to blend in with visitors, fake an important phone call (staff leave you alone for 10 s), hide under the blanket next to a patient, pull the fire alarm (20 seconds of empty corridors, then paperwork).
- **People react:** live facial expressions (surprised, angry, delighted, disgusted), emoji bubbles, idle gestures and talking mouths.
- **Orthopaedics:** the orthopaedists hang around in the corridor doing curls and won't let 'weedy internists' pass: protein shake, a push-up tap mini-game, compliments, an anatomy quiz or a decoy.
- **Clear missions:** the mission note shows what to do, how to do it, and distance plus direction; messages can be swiped away.
- **Missions:** Frau Bozkurt (cleaning, 31 years in the building) runs the escape. Each floor opens with a GTA-style mission title card and a pager briefing; completed missions and side jobs get their own banner.
- **Hospital layout:** corridors with rooms on both sides, loops and open halls instead of a maze. Doors open and close (people sometimes open them too), locked doors with jokes, a real stairwell with steps going down behind a fire door, and an elevator that might strand you or trap you with the chief.
- **Doctors' room:** desks with computers, phones, lamps, mugs, sticky notes, a broken office chair, on-call bed, kitchenette with a broken coffee machine. The computer, phone and coffee machine can be used.
- **Stealth instead of a chase:** everyone has a floating triangle. White = unaware, yellow = suspicious and looking at you, red = coming over to talk, green = friendly. Awareness builds up gradually and depends on distance, view cone, light and how you move (standing, sneaking, walking, running). Running makes noise, the flashlight gives you away in the dark.
- **Sneak:** pull the left stick only slightly, or toggle SCHLEICHEN (C).
- **Safe rooms:** on-call room, ward kitchen, store room. Nobody follows you in, and the sofa restores energy and nerves once.
- **One conversation per person:** whoever catches you gets one dialogue and then leaves for good. 125 different conversations across all character types (quizzes, yes/no, bets, excuses with odds, trades), no repeats within a run.
- **People are articulated 3D figures** (legs, knees, arms, elbows, faces, hair, glasses, coats, props) with walk animations. No emoji heads.
- **Side missions:** Bewerbungsmappe, Pünktlich, Dienstfrei, Phantom, Held:in der Nacht, Glow-up.
- **Job offers / endings:** Pharma, Dermatologie (Praxis Dr. Glatt), Beratung, Startup, Gesundheitsamt, Kreuzfahrt, or back on Monday. The end screen shows your duty roster for next month.
- **Dialogues** look like a hospital ID badge with a rendered 3D portrait of the person, a typewriter speech bubble and answer cards with icons.
- **Wayfinding:** small translucent arrows on the floor, hanging escape-route signs to the stairwell, a lit sign and a blue ⇅ map icon for the elevator.
- **Radar minimap** that rotates with you and shows your view cone; tap it (or M) for the full map. Tap anywhere except the bottom-left stick area to look around. Compact HUD in landscape; tap the pager to collapse it.
- **Graphics:** physically based materials with ACES tone mapping and a generated environment map, point lights that follow you between ceiling lamps, light pools and contact shadows, real-time shadows (can be switched off), rounded detailed models (hospital beds, stretchers, desks, monitors, cars, ambulance), merged static geometry for performance.
- **Also:** creepy dark corridors, flickering lamps, thunderstorm at the windows, shadow figures, the ghost Dr. Ewig in the cellar, MRT pulling metal items, CPR mini-game, phone calls, lab papers on the floor, inventory, compass, waypoint, floor route dots and minimap.
- **Difficulty:** "Entspannt" (default) or "Dienstalltag".
- **Controls:** phone: bottom-left stick walk (light = sneak), drag anywhere else to look, SCHLEICHEN / RENNEN, yellow button to use, tap LAMPE to switch the flashlight. Keyboard: WASD, mouse (click to capture) or arrows/Q, C sneak, Shift sprint, E action (also doors), F flashlight, 1–6 inventory, J/N calls, Tab mission panel, M map, B whiteboard, P pause.

Code layout (plain `<script>` files sharing one global scope, no build step): `js/data.js` (levels, story, data), `js/world.js` (renderer, textures, 3D people), `js/props.js` (furniture models, geometry merging), `js/models.js` (detailed rounded models: beds, stretchers, loungers, desks, monitors, cars, ambulance), `js/build.js` (doors, stairwell, elevator, rooms, doctors' room), `js/level.js` (level construction), `js/game.js` (run state, HUD, items, audio), `js/dialog.js` (dialogue engine), `js/talks.js` … `js/talks4.js`, `js/scenarios.js` (situations with decisions), `js/score.js` (deadlines, points, records) (conversation pools incl. dermatologists, gadgets, elevator), `js/play.js` (input, stealth AI, hazards, events), `js/outro.js` (closing scene), `js/flow.js` (modes, story, missions, endings, radar, rendering, boot).

## Classic 2D (`classic.html`)

The original top-down version in English.

## Play

Open `index.html` in a browser; there is no build step. On iPhone, host the folder (for example with GitHub Pages), open it in Safari, then Share → Add to Home Screen to play full screen.
