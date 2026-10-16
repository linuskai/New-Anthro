# Hospital Escape

A browser game for iPhone (and any other browser). Your shift ended at 17:00. Get out of the hospital before anyone hands you more work.

## Hospital Escape 3D (`index.html`)

First-person 3D in Three.js (r128, loaded from cdnjs). German UI. Five areas: Station 5B (Innere), 4A (Chirurgie), Intensivstation, the haunted cellar (Pathologie & Archiv) and the Notaufnahme, then the staff parking lot.

- **Missions per floor:** car key from the doctors' room, handover to the night-shift colleague, a scripted cardiac arrest on the ICU, a fuse from the caretaker to restore power in the cellar. Optional: secret passage, Approbationsurkunde from the locker, Arbeitszeugnis from the chief's office.
- **Conversations:** every run-in opens a dialogue with 2–3 answers (excuses with success chances, honest answers, running away). Friendly NPCs: cleaner (secret passage, coffee), night-shift colleague, caretaker, PJ student (takes tasks).
- **Stats:** nerves (health), energy (drains while walking, fast while sprinting; empty = crawl), overtime clock, tasks, shifts on next month's roster.
- **Dangers:** patients, relatives, nursing staff, a patrolling Oberarzt with a sight cone, the Chefarzt, Controlling, the ghost Dr. Ewig (moves through walls), runaway bed transports, sparking cables, slippery puddles, rubble, flickering and broken lights, blackouts, lab printouts that become tasks.
- **Rescues:** cardiac-arrest alarms; reach the patient and do CPR in rhythm (110/min).
- **Calls and the way out:** calls arrive every 20–40 s. A headhunter from a fictional pharma company calls on 4A; other offers (consulting, cruise-ship doctor, telemedicine) come in randomly. At the parking lot you choose an ending depending on accepted offers and collected documents.
- **Controls:** phone: left half drag to walk, right half drag to look, RENNEN to sprint, yellow button to talk/use. Keyboard: WASD, mouse (click to capture) or arrows/Q to turn, Shift sprint, E action, 1–3 answers, J/N calls, Tab missions, P pause. Pause menu has look sensitivity, invert-Y, sound and head-bob settings.

## Classic 2D (`classic.html`)

The original top-down version in English.

## Play

Open the HTML file in a browser; there is no build step. On iPhone, host it (for example with GitHub Pages), open it in Safari, then Share → Add to Home Screen to play full screen.
