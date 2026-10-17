# Hospital Escape

A browser game for iPhone (and any other browser). Your shift ended at 17:00. Get out of the hospital before anyone hands you more work.

## Hospital Escape 3D (`index.html` + `js/`)

A satirical first-person stealth game in Three.js (r128, loaded from cdnjs). German UI. A thoroughly cost-cut hospital in seven sections: Innere (5B), Orthopädie, Radiologie, Dermatologie, Keller, Notaufnahme, Parkhaus P2. The full design is in [`GAME_DESIGN.md`](GAME_DESIGN.md).

- **Start:** a short story scene in the doctors' room (typewriter text, camera pan, pager beeps), then the whiteboard briefing ("Flucht-Zentrale") where you pick up to three side missions, then "Mission verstanden" and you play.
- **Missions:** Frau Bozkurt (cleaning, 31 years in the building) runs the escape. Each floor opens with a GTA-style mission title card and a pager briefing; completed missions and side jobs get their own banner.
- **Hospital layout:** corridors with rooms on both sides, loops and open halls instead of a maze. Doors open and close (people sometimes open them too), locked doors with jokes, a real stairwell with steps going down behind a fire door, and an elevator that might strand you or trap you with the chief.
- **Doctors' room:** desks with computers, phones, lamps, mugs, sticky notes, a broken office chair, on-call bed, kitchenette with a broken coffee machine. The computer, phone and coffee machine can be used.
- **Stealth instead of a chase:** everyone has a floating triangle. White = unaware, yellow = suspicious and looking at you, red = coming over to talk, green = friendly. Awareness builds up gradually and depends on distance, view cone, light and how you move (standing, sneaking, walking, running). Running makes noise, the flashlight gives you away in the dark.
- **Sneak:** pull the left stick only slightly, or toggle SCHLEICHEN (C).
- **Safe rooms:** on-call room, ward kitchen, store room. Nobody follows you in, and the sofa restores energy and nerves once.
- **One conversation per person:** whoever catches you gets one dialogue and then leaves for good. 61 different conversations across all character types (quizzes, yes/no, bets, excuses with odds, trades), no repeats within a run.
- **People are articulated 3D figures** (legs, knees, arms, elbows, faces, hair, glasses, coats, props) with walk animations. No emoji heads.
- **Side missions:** Bewerbungsmappe, Pünktlich, Dienstfrei, Phantom, Held:in der Nacht, Glow-up.
- **Job offers / endings:** Pharma, Dermatologie (Praxis Dr. Glatt), Beratung, Startup, Gesundheitsamt, Kreuzfahrt, or back on Monday. The end screen shows your duty roster for next month.
- **Radar minimap** that rotates with you and shows your view cone; tap it (or M) for the full map. Tap anywhere except the bottom-left stick area to look around. Compact HUD in landscape; tap the pager to collapse it.
- **Graphics:** real-time shadows (can be switched off), furniture library, merged static geometry for performance.
- **Also:** creepy dark corridors, flickering lamps, thunderstorm at the windows, shadow figures, the ghost Dr. Ewig in the cellar, MRT pulling metal items, CPR mini-game, phone calls, lab papers on the floor, inventory, compass, waypoint, floor route dots and minimap.
- **Difficulty:** "Entspannt" (default) or "Dienstalltag".
- **Controls:** phone: left stick walk (light = sneak), right side look (joystick or swipe), SCHLEICHEN / RENNEN, yellow button to use, tap LAMPE to switch the flashlight. Keyboard: WASD, mouse (click to capture) or arrows/Q, C sneak, Shift sprint, E action (also doors), F flashlight, 1–6 inventory, J/N calls, Tab mission panel, M map, B whiteboard, P pause.

Code layout (plain `<script>` files sharing one global scope, no build step): `js/data.js` (levels, story, data), `js/world.js` (renderer, textures, 3D people), `js/props.js` (furniture models, geometry merging), `js/build.js` (doors, stairwell, elevator, rooms, doctors' room), `js/level.js` (level construction), `js/game.js` (run state, HUD, items, audio), `js/dialog.js` (dialogue engine), `js/talks.js` + `js/talks2.js` (conversation pools, gadgets), `js/play.js` (input, stealth AI, hazards, events), `js/flow.js` (story, missions, endings, radar, rendering, boot).

## Classic 2D (`classic.html`)

The original top-down version in English.

## Play

Open `index.html` in a browser; there is no build step. On iPhone, host the folder (for example with GitHub Pages), open it in Safari, then Share → Add to Home Screen to play full screen.
