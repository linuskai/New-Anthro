# Hospital Escape

A browser game for iPhone (and any other browser). Your shift ended at 17:00. Get out of the hospital before anyone hands you more work.

## Hospital Escape 3D (`index.html`)

First-person 3D in Three.js (r128, loaded from cdnjs). German UI. Four floors: Station 5B (Innere), 4A (Chirurgie), Intensivstation and the Notaufnahme, then the staff parking lot.

- **Avoid:** patients, relatives (in packs of three), nursing staff with things to sign, the Oberarzt (patrols, red sight cone, hands out weekend shifts), the Chefarzt (always knows where you are) and Controlling (DRG coding).
- **Penalties:** every run-in costs nerves, overtime minutes and tasks; doctors also add shifts to next month's duty roster, which is shown as a calendar at the end.
- **Traps:** lab printouts and fever charts lying on the floor. Walk over them and they become your tasks.
- **Phone calls:** your phone rings every 20–40 s (ward, ER, lab, Chefsekretariat, Mama, pharma rep…). Accept or decline; ignore it and it rings loudly and pulls nearby people toward you.
- **Help:** coffee (speed), clipboard (look busy), airplane mode (no calls), cake (+1 nerve), PJ student (takes 3 tasks), PA announcement (everyone runs to the cafeteria), laundry cart (stand still inside to hide).
- Open tasks are documented in the stairwell between floors: +8 minutes each.

**Controls:** on a phone, drag on the left half to walk and on the right half to look. Keyboard: WASD to walk, arrow keys or Q/E to turn, J/N to accept/decline calls.

## Classic 2D (`classic.html`)

The original top-down version in English.

## Play

Open the HTML file in a browser; there is no build step. On iPhone, host it (for example with GitHub Pages), open it in Safari, then Share → Add to Home Screen to play full screen.
