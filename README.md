# Hospital Escape

A browser game for iPhone (and any other browser). Your shift ended at 17:00. Get out of the hospital before anyone hands you more work.

## Hospital Escape 3D (`index.html`)

First-person 3D in Three.js (r128, loaded from cdnjs). German UI. A thoroughly cost-cut hospital in seven sections: Arztzimmer/Innere (5B), Orthopädie, Radiologie, Dermatologie, Keller, Notaufnahme, Parkhaus P2.

- **Start:** you begin in the doctors' room; the whiteboard holds the mission plan (also via pause menu or M).
- **People are 3D figures** built from primitives (coats, scrubs, gowns, glasses, stethoscopes, props) with walk animations. Anyone who catches you opens a dialogue; pick an answer to break free. Afterwards that person leaves you alone.
- **Departments:** Innere = internist nerds (distract them with a rare case report), Orthopädie = bouncers at every door (protein shake, anatomy question or arm-wrestling), Radiologie = pitch dark with a battery-limited flashlight and an MRT that pulls metal items, Dermatologie = safe "rescue station" with wellness and creams, Keller = blackouts and the ghost Dr. Ewig, Notaufnahme = endless shuffling pseudo-emergencies, Parkhaus = barrier, reversing chief's car, your car.
- **PD Dr. Phil:** an overconfident habilitand who quizzes you with three statistics questions (a calculator item shows the right answer).
- **Navigation:** compass strip with the target, an on-screen waypoint with distance, glowing route dots on the floor and a minimap.
- **Inventory:** coffee, energy drink, donut, cream, clipboard, disinfectant spray, PA mic, airplane-mode pager, case report, protein shake, calculator, batteries.
- **Also:** energy and nerves, creepy flickering corridors where lighting was "saved", leaking roofs, cost-cutting signs, lab printouts on the floor, phone calls, CPR mini-game, job offers and six endings, a duty roster for next month.
- **Controls:** phone: left stick walk, right side look (joystick or swipe, set in pause menu), RENNEN to sprint, yellow button to use, tap inventory slots. Keyboard: WASD, mouse (click to capture) or arrows/Q, Shift sprint, E action, 1–6 inventory, J/N calls, Tab missions, M mission plan, P pause.

## Classic 2D (`classic.html`)

The original top-down version in English.

## Play

Open the HTML file in a browser; there is no build step. On iPhone, host it (for example with GitHub Pages), open it in Safari, then Share → Add to Home Screen to play full screen.
