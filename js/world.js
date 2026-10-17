/* Hospital Escape 3D · world basics: grid helpers, textures, renderer, 3D people and item models. */
const $ = id => document.getElementById(id);
const fmtTime = mins => { const t = Math.floor(SHIFT_END + mins); return String(Math.floor(t / 60) % 24).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0"); };
const fmtDur = mins => { const m = Math.round(mins); return Math.floor(m / 60) + " h " + String(m % 60).padStart(2, "0") + " min"; };
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// ---------- grid ----------
let grid = [], GW = 17, GH = 17;
const SOLID_MOVE = "#BTMXHLYGvmWa=jtUdl^K%y", SOLID_SIGHT = "#MHLXvmUdl^K%";
const solidMove = ch => SOLID_MOVE.includes(ch);
const solidSight = ch => SOLID_SIGHT.includes(ch);
const cell = (x, y) => (x < 0 || y < 0 || x >= GW || y >= GH) ? "#" : grid[y][x];
const openTile = (x, y) => !solidMove(cell(x, y));
const playerPass = (x, y) => !solidMove(cell(x, y)) || cell(x, y) === "d";
/* doors: "d" closed, "," open. Enemies may open ordinary doors, never the ones into safe rooms. */
let doorMap = new Map();
const doorAt = (x, y) => doorMap.get(x + "," + y);
const enemyPass = (x, y) => { const c = cell(x, y); if (c === "d" || c === ",") { const d = doorAt(x, y); return !!d && !d.safe; } return !solidMove(c) && c !== "_" && c !== "w"; };
const blockedAt = (x, y) => {
  const tx = Math.floor(x), ty = Math.floor(y), c = cell(tx, ty);
  if (solidMove(c)) return true;
  if (c === ",") { const d = doorAt(tx, ty); if (d) return d.axis === "x" ? Math.abs(y - ty - .5) > .42 : Math.abs(x - tx - .5) > .42; }
  return false;
};
function los(x0, y0, x1, y1) {
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / .2);
  for (let i = 1; i < n; i++) if (solidSight(cell(Math.floor(x0 + (x1 - x0) * i / n), Math.floor(y0 + (y1 - y0) * i / n)))) return false;
  return true;
}
function bfs(sx, sy, gx, gy, goalSolidOk, pass = openTile) {
  if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) return null;
  const prev = new Int16Array(GW * GH).fill(-1), start = sy * GW + sx, goal = gy * GW + gx;
  const q = [start]; prev[start] = start;
  for (let h = 0; h < q.length; h++) {
    const c = q[h]; if (c === goal) break;
    const cx = c % GW, cy = (c / GW) | 0;
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx, ny = cy + dy, ni = ny * GW + nx;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      if (!pass(nx, ny) && !(goalSolidOk && ni === goal)) continue;
      if (prev[ni] !== -1) continue;
      prev[ni] = c; q.push(ni);
    }
  }
  if (prev[goal] === -1) return null;
  const path = [goal]; let c = goal;
  while (c !== start) { c = prev[c]; path.push(c); }
  return path.reverse().map(i => [i % GW, (i / GW) | 0]);
}
function distMap(sx, sy, pass = enemyPass) {
  const d = new Int16Array(GW * GH).fill(-1), q = [sy * GW + sx]; d[q[0]] = 0;
  for (let h = 0; h < q.length; h++) {
    const c = q[h], cx = c % GW, cy = (c / GW) | 0;
    for (const [dx, dy] of DIRS) { const nx = cx + dx, ny = cy + dy; if (!pass(nx, ny)) continue; const ni = ny * GW + nx; if (d[ni] !== -1) continue; d[ni] = d[c] + 1; q.push(ni); }
  }
  return d;
}
const bfsNextEnemy = (sx, sy, gx, gy) => { if (sx === gx && sy === gy) return null; const p = bfs(sx, sy, gx, gy, false, enemyPass); return p && p.length > 1 ? p[1] : null; };

// ---------- settings ----------
const SET_KEY = "hospital-escape-3d-settings-v6";
const settings = { sens: 1, invert: false, sound: true, bob: true, look: "swipe", navi: true, diff: "easy", shadows: true };
try { Object.assign(settings, JSON.parse(localStorage.getItem(SET_KEY) || "{}")); } catch (e) {}
const saveSettings = () => { try { localStorage.setItem(SET_KEY, JSON.stringify(settings)); } catch (e) {} };

// ---------- textures ----------
const texCache = new Map();
function canvasTex(w, h, draw, key) {
  if (key && texCache.has(key)) return texCache.get(key);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4;
  if (key) texCache.set(key, t);
  return t;
}
const SF = '"Helvetica Neue", Arial, sans-serif';
const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const labelTex = (text, bg, fg) => canvasTex(512, 96, (g, w, h) => {
  g.font = `800 52px ${SF}`; const tw = Math.min(w - 8, g.measureText(text).width + 40);
  g.fillStyle = bg; rr(g, (w - tw) / 2, 10, tw, h - 20, 14); g.fill();
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, w / 2, h / 2 + 2, w - 30);
}, "label:" + text + bg + fg);
const textTex = (lines, bg, fg, w = 256, h = 128, size = 26) => canvasTex(w, h, g => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  lines.forEach((l, i) => { g.font = `${i === 0 ? 800 : 600} ${i === 0 ? size : Math.round(size * .7)}px ${SF}`; g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.05, w - 16); });
}, "txt:" + lines.join("|") + bg + fg + w + h);
const emoteTex = txt => canvasTex(96, 96, (g, w) => { g.fillStyle = "#fff"; g.beginPath(); g.arc(48, 44, 38, 0, 7); g.fill(); g.beginPath(); g.moveTo(38, 76); g.lineTo(48, 94); g.lineTo(58, 76); g.fill(); g.font = `46px ${EF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 48, 46); }, "emote:" + txt);
const glowTex = color => canvasTex(64, 64, (g, w) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, color); gr.addColorStop(.35, color.replace(/[\d.]+\)$/, ".5)")); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); }, "glow:" + color);

const WALL_COL = { gastro: ["#e6e4d2", "#b4ae84"], ward: ["#e4ece6", "#a9c3b8"], ortho: ["#e3eaf0", "#9fb4c6"], er: ["#efeee2", "#c8c39e"], derma: ["#f4e6d6", "#b88a5e"], radio: ["#4a5058", "#2e333a"] };
function drawWall(g, w, h, theme) {
  const r = rng(theme.length * 13);
  if (theme === "cellar" || theme === "park") {
    g.fillStyle = theme === "park" ? "#9a9a94" : "#8e918b"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${r() < .5 ? "0,0,0" : "255,255,255"},${r() * .08})`; g.fillRect(r() * w, r() * h, 3, 3); }
    if (theme === "cellar") {
      g.strokeStyle = "rgba(40,40,40,.25)"; g.lineWidth = 2;
      for (let y = 0; y < h; y += 34) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y / 34) % 2 ? 0 : 32; x < w; x += 64) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 34); g.stroke(); } }
      g.fillStyle = "rgba(90,70,40,.25)"; for (let i = 0; i < 5; i++) g.fillRect(r() * w, h * .55, 6 + r() * 10, h * .45);
    } else {
      for (let x = -40; x < w; x += 40) { g.fillStyle = "#f2c300"; g.beginPath(); g.moveTo(x, h * .86); g.lineTo(x + 20, h * .86); g.lineTo(x + 40, h); g.lineTo(x + 20, h); g.fill(); g.fillStyle = "#222"; g.beginPath(); g.moveTo(x + 20, h * .86); g.lineTo(x + 40, h * .86); g.lineTo(x + 60, h); g.lineTo(x + 40, h); g.fill(); }
      g.fillStyle = "rgba(60,50,30,.25)"; for (let i = 0; i < 4; i++) g.fillRect(r() * w, 0, 4 + r() * 6, h * .8);
    }
    return;
  }
  const [top, low] = WALL_COL[theme] || WALL_COL.ward;
  g.fillStyle = top; g.fillRect(0, 0, w, h);
  // wall panels with seams
  g.strokeStyle = "rgba(0,0,0,.07)"; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h * .6); g.stroke();
  g.fillStyle = "rgba(0,0,0,.06)"; g.fillRect(0, 0, w, h * .05);
  if (theme === "derma") { for (let x = 0; x < w; x += 16) { g.fillStyle = x % 32 ? "#a97a50" : "#b88a5e"; g.fillRect(x, h * .58, 16, h * .42); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(x, h * .58, 1, h * .42); } }
  else { g.fillStyle = low; g.fillRect(0, h * .62, w, h * .38); g.fillStyle = "rgba(255,255,255,.08)"; g.fillRect(0, h * .62, w, 3); }
  g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(0, h * .6, w, h * .02);
  for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(0,0,0,${r() * .05})`; g.fillRect(r() * w, r() * h * .6, 3, 3); }
  if (theme !== "derma") { g.fillStyle = "rgba(120,90,40,.12)"; g.beginPath(); g.ellipse(r() * w, h * .05, 30, 18, 0, 0, 7); g.fill(); g.fillStyle = "rgba(60,50,40,.08)"; g.fillRect(r() * w, h * .64, 30, 4); }
}
/* baked ambient occlusion: walls darken into the ceiling corner and towards the floor */
function wallAO(g, w, h) {
  let gr = g.createLinearGradient(0, 0, 0, h * .22); gr.addColorStop(0, "rgba(0,0,0,.38)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h * .22);
  gr = g.createLinearGradient(0, h, 0, h * .78); gr.addColorStop(0, "rgba(0,0,0,.42)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, h * .78, w, h * .22);
  gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(0,0,0,.1)"); gr.addColorStop(.12, "rgba(0,0,0,0)"); gr.addColorStop(.88, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.1)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
}
const wallTex = theme => canvasTex(256, 272, (g, w, h) => { drawWall(g, w, h, theme); wallAO(g, w, h); }, "wall:" + theme);
const poolTex = () => canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,250,235,.55)"); gr.addColorStop(.45, "rgba(255,250,235,.2)"); gr.addColorStop(1, "rgba(255,250,235,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); }, "pool");
const aoTex = () => canvasTex(16, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(0,0,0,.5)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, "ao");
const FLOOR_COL = { gastro: "#d4d0b8", cellar: "#6d706a", park: "#7a7a74", radio: "#3e434a", ortho: "#c9d6df", er: "#dcd8c2", ward: "#cfdcd3" };
const floorTex = theme => canvasTex(256, 256, (g, w, h) => {
  const r = rng(7);
  if (theme === "derma") {
    for (let y = 0; y < h; y += 32) { g.fillStyle = (y / 32) % 2 ? "#c49a6c" : "#b98e60"; g.fillRect(0, y, w, 32); g.fillStyle = "rgba(0,0,0,.15)"; g.fillRect(0, y, w, 2); g.fillRect(((y * 7) % w), y, 2, 32); for (let i = 0; i < 6; i++) { g.fillStyle = "rgba(90,50,20,.15)"; g.fillRect(r() * w, y + 4 + r() * 24, 30 + r() * 40, 1); } }
    return;
  }
  const base = FLOOR_COL[theme] || FLOOR_COL.ward;
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 1400; i++) { const v = r(); g.fillStyle = v < .4 ? "rgba(60,70,65,.18)" : v < .7 ? "rgba(255,255,255,.2)" : "rgba(60,120,110,.08)"; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2); }
  if (theme === "cellar" || theme === "park") { g.fillStyle = "rgba(20,20,10,.25)"; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(r() * w, r() * h, 20 + r() * 40, 10 + r() * 20, r() * 3, 0, 7); g.fill(); } return; }
  // 2x2 vinyl tiles with grout and a scuffed walking track
  g.strokeStyle = "rgba(40,50,45,.28)"; g.lineWidth = 3; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
  for (let i = 0; i < 4; i++) { g.fillStyle = `rgba(0,0,0,${.02 + r() * .04})`; g.fillRect((i % 2) * w / 2 + 2, Math.floor(i / 2) * h / 2 + 2, w / 2 - 4, h / 2 - 4); }
  g.fillStyle = "rgba(0,0,0,.05)"; for (let i = 0; i < 12; i++) { g.save(); g.translate(r() * w, r() * h); g.rotate(r() * 3); g.fillRect(0, 0, 20 + r() * 30, 2); g.restore(); }
}, "floor:" + theme);
const ceilTex = theme => canvasTex(128, 128, (g, w, h) => {
  const r = rng(3), conc = theme === "cellar" || theme === "park";
  g.fillStyle = conc ? "#5d605a" : theme === "radio" ? "#2a2e33" : theme === "derma" ? "#f6efe6" : "#eef1ee"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 300; i++) { g.fillStyle = "rgba(60,70,65,.25)"; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
  if (!conc) { g.strokeStyle = "#a9b1ac"; g.lineWidth = 4; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke(); }
  g.fillStyle = "rgba(120,90,40,.2)"; g.beginPath(); g.ellipse(r() * w, r() * h, 22, 16, 0, 0, 7); g.fill();
}, "ceil:" + theme);
const doorTex = (num, plate, color) => canvasTex(128, 256, (g, w, h) => {
  g.fillStyle = color; g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(255,255,255,.08)"; g.fillRect(0, 0, 10, h); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(w - 8, 0, 8, h);
  g.fillStyle = "#b9d3dd"; g.fillRect(36, 34, 56, 70); g.strokeStyle = "#556"; g.lineWidth = 4; g.strokeRect(36, 34, 56, 70);
  g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.moveTo(40, 100); g.lineTo(60, 38); g.lineTo(70, 38); g.lineTo(50, 100); g.fill();
  g.fillStyle = "#c9ccc8"; g.fillRect(96, 138, 22, 8); g.fillStyle = "#9aa"; g.fillRect(100, 146, 8, 10);
  g.fillStyle = "#fff"; g.fillRect(24, 6, 80, 22);
  g.fillStyle = "#123"; g.font = `800 17px ${SF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(num, 64, 18);
  if (plate) { g.fillStyle = "#f6f6ef"; g.fillRect(10, 112, 108, 20); g.fillStyle = "#333"; g.font = `700 11px ${SF}`; g.fillText(plate, 64, 122, 104); }
  g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, h - 26, w, 26);
}, "door:" + num + plate + color);
const posterTex = p => canvasTex(256, 352, (g, w, h) => {
  g.fillStyle = "#fbfaf4"; g.fillRect(0, 0, w, h);
  g.fillStyle = p.bg; g.fillRect(0, 0, w, p.t2 ? 110 : 80);
  g.fillStyle = "#fff"; g.font = `800 30px ${SF}`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(p.t, w / 2, 42, w - 20); if (p.t2) g.fillText(p.t2, w / 2, 82, w - 20);
  g.font = `84px ${EF}`; g.fillText(p.i, w / 2, p.t2 ? 172 : 152);
  g.fillStyle = "#1d2622"; g.font = `700 21px ${SF}`;
  p.b.forEach((l, i) => g.fillText(l, w / 2, (p.t2 ? 245 : 232) + i * 29, w - 20));
  g.strokeStyle = "#c9ccc8"; g.lineWidth = 6; g.strokeRect(0, 0, w, h);
  g.fillStyle = "rgba(200,200,180,.8)"; g.fillRect(w / 2 - 30, -4, 60, 14);
}, "poster:" + p.t + p.b[0]);
const graffitiTex = text => canvasTex(512, 128, (g, w, h) => {
  g.font = `italic 700 48px "Marker Felt","Comic Sans MS",${SF}`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = "rgba(130,20,20,.85)"; g.save(); g.translate(w / 2, h / 2); g.rotate(-.04); g.fillText(text, 0, 0, w - 20); g.restore();
  g.fillStyle = "rgba(130,20,20,.6)"; for (let i = 0; i < 5; i++) g.fillRect(60 + i * 90, h / 2 + 18, 3, 20 + i * 7);
}, "graf:" + text);
const crackTex = () => canvasTex(256, 256, (g, w, h) => {
  g.strokeStyle = "rgba(30,30,30,.7)"; g.lineWidth = 2; const r = rng(42);
  for (let k = 0; k < 4; k++) { g.beginPath(); let x = w / 2, y = h / 2; g.moveTo(x, y); for (let i = 0; i < 10; i++) { x += (r() - .5) * 50; y += (r() - .5) * 50; g.lineTo(x, y); } g.stroke(); }
  g.fillStyle = "rgba(60,50,40,.25)"; g.beginPath(); g.arc(w / 2, h / 2, 30, 0, 7); g.fill();
}, "crack");
const tapeTex = () => canvasTex(256, 32, (g, w, h) => {
  for (let x = -32; x < w; x += 32) { g.fillStyle = "#f2c300"; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 16, 0); g.lineTo(x + 32, h); g.lineTo(x + 16, h); g.fill(); g.fillStyle = "#111"; g.beginPath(); g.moveTo(x + 16, 0); g.lineTo(x + 32, 0); g.lineTo(x + 48, h); g.lineTo(x + 32, h); g.fill(); }
}, "tape");
const ductTex = () => canvasTex(128, 32, (g, w, h) => { g.fillStyle = "#a8aaa6"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(0,0,0,.15)"; for (let x = 0; x < w; x += 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 3, h); g.stroke(); } g.fillStyle = "#333"; g.font = `700 13px ${SF}`; g.fillText("PROVISORIUM 2011", 6, 21); }, "duct");
const paperTex = () => canvasTex(64, 90, (g, w, h) => { g.fillStyle = "#fbfaf4"; g.fillRect(0, 0, w, h); g.fillStyle = "#c0322a"; g.fillRect(4, 4, w - 8, 8); g.fillStyle = "#555"; for (let i = 0; i < 9; i++) g.fillRect(6, 18 + i * 7, 20 + (i * 13 % 30), 2); }, "paper");
const screenTex = () => canvasTex(128, 96, (g, w, h) => {
  g.fillStyle = "#08130e"; g.fillRect(0, 0, w, h); g.strokeStyle = "#5ee08a"; g.lineWidth = 2; g.beginPath();
  for (let x = 0; x < w; x++) { const p = x % 40; const y = p === 18 ? 18 : p === 20 ? 62 : p === 22 ? 40 : 40 + Math.sin(x * .3) * 1.5; x ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke(); g.fillStyle = "#ffd27a"; g.font = "700 18px monospace"; g.fillText("HF 112", 6, 88);
}, "screen");
const pcTex = () => canvasTex(128, 96, (g, w, h) => { g.fillStyle = "#1a3a6a"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.fillRect(8, 8, w - 16, 14); g.fillStyle = "#123"; g.font = "700 10px monospace"; g.fillText("ARZTBRIEFE: 23 OFFEN", 10, 18); g.fillStyle = "#e2483d"; g.fillRect(8, 30, 70, 10); g.fillStyle = "#cfe"; for (let i = 0; i < 5; i++) g.fillRect(8, 48 + i * 9, 40 + (i * 23) % 60, 4); }, "pc");
const xrayTex = () => canvasTex(128, 160, (g, w, h) => {
  g.fillStyle = "#0b0f14"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(220,235,255,.8)"; g.lineWidth = 3;
  for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(64, 50 + i * 15, 40 - i * 2, 8, 0, Math.PI, 0); g.stroke(); }
  g.fillStyle = "rgba(220,235,255,.85)"; g.fillRect(60, 30, 8, 110); g.beginPath(); g.ellipse(80, 110, 18, 22, 0, 0, 7); g.fillStyle = "rgba(220,235,255,.35)"; g.fill();
}, "xray");
const nightTex = () => canvasTex(256, 192, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#050914"); gr.addColorStop(1, "#1a2440"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = "#e8e4c8"; g.beginPath(); g.arc(200, 40, 14, 0, 7); g.fill();
  const r = rng(5); for (let i = 0; i < 14; i++) { const bw = 14 + r() * 26, bh = 30 + r() * 70, x = i * 19; g.fillStyle = "#0a0e18"; g.fillRect(x, h - bh, bw, bh); for (let k = 0; k < 6; k++) if (r() < .4) { g.fillStyle = "#f2d38a"; g.fillRect(x + 3 + r() * (bw - 6), h - bh + 5 + r() * (bh - 10), 3, 4); } }
  g.strokeStyle = "rgba(180,200,230,.25)"; g.lineWidth = 1; for (let i = 0; i < 60; i++) { const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y + 12); g.stroke(); }
}, "night");
const clockTex = () => canvasTex(128, 128, (g, w) => {
  g.fillStyle = "#fbfaf4"; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.strokeStyle = "#222"; g.lineWidth = 6; g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillStyle = "#222"; g.fillRect(64 + Math.sin(a) * 50 - 2, 64 - Math.cos(a) * 50 - 5, 4, 10); }
  g.fillStyle = "#c0322a"; g.font = `700 10px ${SF}`; g.textAlign = "center"; g.fillText("KOSTENSTELLE 4711", 64, 92);
}, "clock");
const vendTex = () => canvasTex(128, 192, (g, w, h) => {
  g.fillStyle = "#b8352d"; g.fillRect(0, 0, w, h); g.fillStyle = "#1b2a33"; g.fillRect(10, 30, 76, 120);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { g.fillStyle = r === 1 && c === 2 ? "#1b2a33" : ["#f2b33d", "#4fb3a9", "#e26fa0"][(r + c) % 3]; g.fillRect(16 + c * 24, 38 + r * 28, 16, 18); }
  g.fillStyle = "#fff"; g.font = `800 18px ${SF}`; g.fillText("SNACKS", 14, 22); g.font = `700 11px ${SF}`; g.fillText("Kaffee 4,50 €", 12, 168);
  g.fillStyle = "#ddd"; g.fillRect(94, 60, 22, 40); g.fillStyle = "#333"; g.fillRect(98, 66, 14, 6);
}, "vend");
const laundryTex = () => canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#3f6fb3"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(255,255,255,.18)"; for (let i = 0; i < w; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); } g.fillStyle = "#fff"; g.font = `800 18px ${SF}`; g.textAlign = "center"; g.fillText("WÄSCHE", w / 2, 70); }, "laundry");
const lockerTex = () => canvasTex(128, 256, (g, w, h) => {
  g.fillStyle = "#7d8f99"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2; i++) { g.strokeStyle = "#54626a"; g.lineWidth = 4; g.strokeRect(6 + i * 60, 6, 56, h - 12); for (let s = 0; s < 5; s++) { g.fillStyle = "#54626a"; g.fillRect(16 + i * 60, 20 + s * 8, 36, 3); } g.fillStyle = "#ddd"; g.fillRect(48 + i * 60, 120, 6, 24); }
  g.fillStyle = "#fff"; g.fillRect(70, 60, 48, 16); g.fillStyle = "#123"; g.font = `700 11px ${SF}`; g.fillText("DU", 86, 72);
}, "locker");
const fuseTex = () => canvasTex(128, 160, (g, w, h) => {
  g.fillStyle = "#9aa39e"; g.fillRect(0, 0, w, h); g.fillStyle = "#2b2f33"; g.fillRect(12, 30, 104, 110);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { g.fillStyle = r === 2 && c === 1 ? "#c0322a" : "#e8e8e0"; g.fillRect(20 + c * 25, 38 + r * 25, 16, 18); }
  g.fillStyle = "#f2c300"; g.beginPath(); g.moveTo(64, 2); g.lineTo(84, 26); g.lineTo(44, 26); g.fill();
}, "fuse");
const shelfTex = () => canvasTex(256, 256, (g, w, h) => {
  const r = rng(77); g.fillStyle = "#4a3f33"; g.fillRect(0, 0, w, h);
  for (let row = 0; row < 4; row++) { let x = 6; const y = 8 + row * 62; while (x < w - 12) { const bw = 12 + r() * 14; g.fillStyle = ["#2b5d8a", "#8a2b2b", "#c9a14a", "#3d6b3d", "#ddd"][Math.floor(r() * 5)]; g.fillRect(x, y + 6 + r() * 6, bw - 2, 48); g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(x + 2, y + 24, bw - 6, 6); x += bw; } g.fillStyle = "#2f271f"; g.fillRect(0, y + 54, w, 6); }
}, "shelf");
const boardTex = () => canvasTex(512, 320, (g, w, h) => {
  g.fillStyle = "#f6f6f2"; g.fillRect(0, 0, w, h); g.strokeStyle = "#9aa3a0"; g.lineWidth = 14; g.strokeRect(0, 0, w, h);
  g.fillStyle = "#c0322a"; g.font = `800 34px "Marker Felt","Comic Sans MS",${SF}`; g.fillText("MISSION FEIERABEND", 26, 52);
  g.fillStyle = "#1d2622"; g.font = `600 24px "Marker Felt","Comic Sans MS",${SF}`;
  ["1. Schlüssel (Dr. Kurz!!)", "2. Ortho: Bizeps-Docs", "3. Radio: Taschenlampe", "4. Gastro: LÜFTUNG!", "5. DERMA = Wellness!!", "6. Keller (Dr. Ewig??)", "7. ZNA → Ticket", "8. Parkhaus → AUTO"].forEach((l, i) => g.fillText(l, 30, 92 + i * 28));
  g.strokeStyle = "#2d3f8f"; g.lineWidth = 4; g.beginPath(); g.moveTo(330, 210); g.lineTo(470, 120); g.stroke(); g.fillStyle = "#2d3f8f"; g.fillText("Pharma?", 380, 108);
}, "board");
const machineTex = () => canvasTex(128, 192, (g, w, h) => {
  g.fillStyle = "#2b4a7a"; g.fillRect(0, 0, w, h); g.fillStyle = "#cfe8ff"; g.fillRect(14, 20, 100, 50);
  g.fillStyle = "#123"; g.font = `800 16px ${SF}`; g.textAlign = "center"; g.fillText("PARKTICKET", 64, 40); g.fillText("12,00 €", 64, 60);
  g.fillStyle = "#ddd"; g.fillRect(40, 90, 48, 10); g.fillStyle = "#f2c300"; g.fillRect(30, 120, 68, 30); g.fillStyle = "#222"; g.font = `700 12px ${SF}`; g.fillText("nur Münzen", 64, 140);
}, "machine");
const shirtPrintTex = text => canvasTex(256, 96, (g, w, h) => { g.fillStyle = "#1d1d1d"; g.fillRect(0, 0, w, h); g.fillStyle = "#f2c300"; g.font = `800 34px ${SF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, w / 2, h / 2, w - 10); }, "print:" + text);
const carGlassTex = () => canvasTex(64, 64, (g, w, h) => { g.fillStyle = "#1b2430"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.moveTo(8, h); g.lineTo(28, 0); g.lineTo(40, 0); g.lineTo(20, h); g.fill(); }, "carglass");
const signFloorTex = () => canvasTex(128, 192, (g, w, h) => { g.fillStyle = "#f2c300"; g.fillRect(0, 0, w, h); g.fillStyle = "#111"; g.beginPath(); g.moveTo(64, 20); g.lineTo(110, 100); g.lineTo(18, 100); g.closePath(); g.fill(); g.fillStyle = "#f2c300"; g.font = `800 40px ${SF}`; g.textAlign = "center"; g.fillText("!", 64, 92); g.fillStyle = "#111"; g.font = `800 17px ${SF}`; g.fillText("VORSICHT", 64, 134); g.fillText("RUTSCHGEFAHR", 64, 158, 120); }, "wetsign");
const canTex = () => canvasTex(64, 64, (g, w, h) => { g.fillStyle = "#1f9d55"; g.fillRect(0, 0, w, h); g.fillStyle = "#f2c300"; g.font = `800 18px ${SF}`; g.textAlign = "center"; g.fillText("VOLT", 32, 38); }, "can");
const bookTex = () => canvasTex(64, 96, (g, w, h) => { g.fillStyle = "#a02828"; g.fillRect(0, 0, w, h); g.fillStyle = "#f2d38a"; g.font = `800 10px ${SF}`; g.textAlign = "center"; g.fillText("SELTENER", 32, 40); g.fillText("FALL", 32, 54); }, "book");
const calcTex = () => canvasTex(64, 96, (g, w, h) => { g.fillStyle = "#5a6a7a"; g.fillRect(0, 0, w, h); g.fillStyle = "#b8d8a8"; g.fillRect(6, 6, w - 12, 22); for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { g.fillStyle = "#ddd"; g.fillRect(8 + c * 17, 36 + r * 14, 13, 10); } }, "calc");

// ---------- three ----------
const canvas = $("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(1.75, window.devicePixelRatio || 1));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcbd8d1);
scene.fog = new THREE.Fog(0xcbd8d1, 5, 30);
const camera = new THREE.PerspectiveCamera(72, 1, .05, 90);
camera.rotation.order = "YXZ"; scene.add(camera);
const hemi = new THREE.HemisphereLight(0xffffff, 0x7f9a90, .55); scene.add(hemi);
const amb = new THREE.AmbientLight(0xffffff, .25); scene.add(amb);
const sun = new THREE.DirectionalLight(0xffffff, .3); sun.position.set(3, 10, 2); scene.add(sun); scene.add(sun.target);
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 40 }); sun.shadow.bias = -.0006; sun.shadow.normalBias = .03;
const lampLight = new THREE.PointLight(0xe8f4ff, 0, 10, 1.6); scene.add(lampLight);
/* a handful of real point lights hop between the ceiling panels closest to the player: local light, falloff, depth */
const ceilLights = [0, 1, 2, 3].map(() => { const l = new THREE.PointLight(0xfff6e8, 0, 8.5, 2); scene.add(l); return l; });
const flashlight = new THREE.SpotLight(0xfff2d8, 0, 20, .5, .55, 1.1);
flashlight.shadow.mapSize.set(512, 512); flashlight.shadow.bias = -.002; flashlight.shadow.camera.near = .3; flashlight.shadow.camera.far = 20;
flashlight.position.set(.15, -.15, 0); camera.add(flashlight); flashlight.target.position.set(0, -.08, -1); camera.add(flashlight.target);
const reaLight = new THREE.PointLight(0xff3020, 0, 8); scene.add(reaLight);

const matCache = new Map();
/* physically based materials: matte by default, glossy/metal on request; lit by a small generated environment map */
const lambert = (color, map) => { const key = color + ":" + (map ? map.uuid : ""); if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, map: map || null, roughness: .82, metalness: 0 })); return matCache.get(key); };
const phong = (color, shininess = 40) => { const key = "p" + color + ":" + shininess; if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: Math.max(.12, Math.min(.8, 1 - shininess / 110)), metalness: shininess >= 70 ? .55 : .05 })); return matCache.get(key); };
const basic = color => { const key = "b" + color; if (!matCache.has(key)) matCache.set(key, new THREE.MeshBasicMaterial({ color, toneMapped: false })); return matCache.get(key); };
const glossy = (color, rough = .25, metal = 0, extra) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal }, extra || {}));
function makeEnv(bright) {
  const s = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(24, 8, 24), new THREE.MeshBasicMaterial({ color: bright ? 0x323a37 : 0x040505, side: THREE.BackSide })); room.position.y = 3; s.add(room);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.MeshBasicMaterial({ color: bright ? 0x4a504c : 0x060707 })); fl.rotation.x = -Math.PI / 2; fl.position.y = -.98; s.add(fl);
  const pm = new THREE.MeshBasicMaterial({ color: bright ? 0xffffff : 0x1a2a3a });
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.4), pm); p.rotation.x = Math.PI / 2; p.position.set(i * 6.5, 6.95, j * 6.5); s.add(p); }
  if (bright) { const w = new THREE.Mesh(new THREE.PlaneGeometry(10, 3), new THREE.MeshBasicMaterial({ color: 0xbcd4ff })); w.position.set(0, 3, -11.9); s.add(w); }
  try { const g = new THREE.PMREMGenerator(renderer), rt = g.fromScene(s, .035); g.dispose(); return rt.texture; } catch (e) { return null; }
}
const ENV_BRIGHT = makeEnv(true), ENV_DARK = makeEnv(false);
scene.environment = ENV_BRIGHT;
const lathe = pts => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 20);
const taper = (() => { const g = new THREE.CylinderGeometry(1, .8, 1, 12); g.translate(0, -.5, 0); return g; })();
const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1), plane: new THREE.PlaneGeometry(1, 1), ball: new THREE.SphereGeometry(1, 14, 10), taper,
  torso: lathe([[0, -.5], [.84, -.5], [.86, -.2], [.97, .12], [1, .28], [.94, .41], [.72, .49], [.3, .53], [0, .53]]), coat: lathe([[0, -.5], [1.14, -.5], [1.06, -.1], [1, .25], [.95, .4], [.74, .49], [.35, .53], [0, .53]]), cap: new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI * .52),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 14), torus: new THREE.TorusGeometry(1, .35, 8, 18), steth: new THREE.TorusGeometry(.12, .012, 6, 18, Math.PI * 1.2),
  spike: new THREE.ConeGeometry(.035, .12, 5), tri: new THREE.ConeGeometry(.13, .24, 3), shadow: new THREE.CircleGeometry(.38, 18),
  pole: new THREE.CylinderGeometry(.025, .025, 1.9, 6), ring: new THREE.RingGeometry(.3, .42, 28), pipe: new THREE.CylinderGeometry(.09, .09, S, 8),
  cable: new THREE.CylinderGeometry(.02, .02, 1.2, 5), puddle: new THREE.CircleGeometry(1, 20), wheel: new THREE.CylinderGeometry(.3, .3, .2, 12),
  bucket: new THREE.CylinderGeometry(.22, .17, .32, 12), drop: new THREE.SphereGeometry(.03, 6, 4), dot: new THREE.CircleGeometry(.1, 10),
  leaf: new THREE.SphereGeometry(.35, 8, 6), pot: new THREE.CylinderGeometry(.22, .16, .4, 10), mrt: new THREE.TorusGeometry(1.0, .35, 12, 24), disc: new THREE.CylinderGeometry(1, 1, .04, 24),
};
const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .28, depthWrite: false });
const TRI_MAT = { idle: new THREE.MeshBasicMaterial({ color: 0xdfe6e3, toneMapped: false }), sus: new THREE.MeshBasicMaterial({ color: 0xf2b33d, toneMapped: false }), spot: new THREE.MeshBasicMaterial({ color: 0xe2483d, toneMapped: false }), friend: new THREE.MeshBasicMaterial({ color: 0x6fcf97, toneMapped: false }) };
const TRI_OUTLINE = new THREE.MeshBasicMaterial({ color: 0x111614, side: THREE.BackSide });
const triMesh = mat => { const t = new THREE.Mesh(GEO.tri, mat); const o = new THREE.Mesh(GEO.tri, TRI_OUTLINE); o.scale.setScalar(1.22); t.add(o); t.rotation.x = Math.PI; return t; };
const sprite = (tex, sx, sy) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, fog: true, toneMapped: false })); m.scale.set(sx, sy, 1); return m; };
const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
const boxMesh = (w, h, d, color, map) => { const m = new THREE.Mesh(GEO.box, lambert(color, map)); m.scale.set(w, h, d); return m; };
const mesh = (geo, mat, sx, sy, sz) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy === undefined ? sx : sy, sz === undefined ? sx : sz); return m; };
const screenMats = new Map();
const monitorMesh = map => { const side = phong(0x1c1e20, 60), t = map || screenTex(); if (!screenMats.has(t.uuid)) screenMats.set(t.uuid, new THREE.MeshBasicMaterial({ map: t, toneMapped: false, color: 0xd8d8d8 })); const face = screenMats.get(t.uuid); return new THREE.Mesh(GEO.box, [side, side, side, side, face, side]); };

// ---------- 3D people ----------
let ghostMat = null;
function makePerson(sp) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  body.scale.setScalar(sp.scale || 1);
  const M = c => sp.ghost && ghostMat ? ghostMat : sp.shadowFig ? lambert(0x050505) : lambert(c);
  const add = (geo, c, sx, sy, sz, x, y, z, parent = body) => { const m = mesh(geo, M(c), sx, sy, sz); m.position.set(x, y, z); parent.add(m); return m; };
  const shade = (c, k) => new THREE.Color(c).multiplyScalar(k).getHex(), warm = c => new THREE.Color(c).lerp(new THREE.Color(0xe07a6a), .14).getHex();
  const build = sp.build || "normal";
  const tw = { muscle: .62, big: .5, thin: .36, kid: .3 }[build] || .42;
  const td = { muscle: .36, big: .34, thin: .22, kid: .2 }[build] || .25;
  const limbR = { muscle: 1.6, big: 1.25, thin: .85, kid: .8 }[build] || 1;
  const skin = sp.skin || SKIN[0], pants = sp.gown || sp.robe ? skin : (sp.pants || 0x333a44), shoes = sp.shoes || 0x2b2b2b;
  const sleeve = sp.coat ? 0xf4f4f0 : sp.jacket || sp.shirt || 0x777777;
  const fore = sp.short || build === "muscle" ? skin : sleeve;
  const legs = [], knees = [], arms = [], elbows = [];
  if (!sp.noShadow) { const sh = mesh(GEO.shadow, shadowMat, 1); sh.rotation.x = -Math.PI / 2; sh.position.y = .012; g.add(sh); }
  add(GEO.ball, pants, tw * .5, .12, td * .5, 0, .92, 0);
  for (const side of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(side * tw * .23, .92, 0); body.add(hip);
    add(GEO.taper, pants, .08 * limbR, .45, .08 * limbR, 0, 0, 0, hip);
    const knee = new THREE.Group(); knee.position.y = -.44; hip.add(knee);
    add(GEO.ball, pants, .062 * limbR, .062 * limbR, .062 * limbR, 0, 0, 0, knee);
    add(GEO.taper, pants, .062 * limbR, .43, .062 * limbR, 0, 0, 0, knee);
    const sw = .11 * Math.max(1, limbR * .8);
    add(GEO.box, shoes, sw, .07, .2, 0, -.44, .03, knee); add(GEO.ball, shoes, sw * .5, .045, .07, 0, -.45, .13, knee);
    add(GEO.box, new THREE.Color(shoes).multiplyScalar(.45).getHex(), sw * 1.04, .022, .27, 0, -.485, .055, knee);
    legs.push(hip); knees.push(knee);
  }
  add(GEO.torso, sp.shirt || 0x777777, tw / 2, .58, td / 2, 0, 1.2, 0);
  if (sp.coat || sp.gown || sp.robe || sp.jacket) {
    const c = sp.coat ? 0xf4f4f0 : sp.gown ? 0x9cc6e6 : sp.robe ? sp.shirt : sp.jacket;
    const len = sp.coat ? .9 : sp.gown || sp.robe ? .95 : .6;
    add(GEO.coat, c, tw / 2 + .025, len, td / 2 + .03, 0, 1.49 - len / 2, 0);
    if (sp.coat || sp.jacket) {
      add(GEO.box, sp.shirt || 0x777777, .13, .42, .01, 0, 1.28, td / 2 + .03);
      for (const s of [-1, 1]) { const l = add(GEO.box, c, .06, .26, .012, s * .07, 1.34, td / 2 + .035); l.rotation.z = s * .35; }
      if (sp.coat) {
        add(GEO.box, 0xdcdcdc, .09, .07, .012, -tw * .26, 1.26, td / 2 + .036);
        for (const s2 of [-1, 1]) add(GEO.box, 0xe4e4df, .13, .11, .012, s2 * tw * .3, .86, td / 2 + .07);   // lower pockets
        if (!sp.pens) add(GEO.box, 0x2d3f8f, .012, .08, .012, -tw * .3, 1.3, td / 2 + .045);
        add(GEO.box, 0xffffff, .055, .075, .006, tw * .27, 1.3, td / 2 + .045); add(GEO.box, 0xc0322a, .055, .014, .007, tw * .27, 1.33, td / 2 + .046); // name badge
        for (let i = 0; i < 3; i++) add(GEO.ball, 0xd0d0cc, .009, .009, .004, tw * .07, 1.12 - i * .12, td / 2 + .065);
      }
    }
    if (sp.gown) for (let i = 0; i < 6; i++) add(GEO.ball, 0x6f9fc6, .02, .02, .005, -.12 + (i % 3) * .12, 1.15 + Math.floor(i / 3) * .2, td / 2 + .034);
  }
  if (sp.scrubs) { for (const s of [-1, 1]) { const v = add(GEO.box, shade(sp.shirt, .7), .016, .17, .012, s * .045, 1.38, td / 2 + .012); v.rotation.z = s * -.45; } add(GEO.box, shade(sp.shirt, .85), tw * .34, .12, .012, tw * .2, 1.1, td / 2 + .012); }
  if (sp.badge) { add(GEO.box, 0xffffff, .06, .085, .008, -tw * .26, 1.3, td / 2 + .03); add(GEO.box, 0x2d3f8f, .06, .018, .009, -tw * .26, 1.335, td / 2 + .031); }
  if (!sp.gown && !sp.robe && !sp.coat && !sp.scrubs) { const belt = add(GEO.cyl, 0x2a2420, tw / 2 + .006, .04, td / 2 + .006, 0, 1.0, 0); belt.userData.belt = true; add(GEO.box, 0xc0b080, .035, .03, .01, 0, 1.0, td / 2 + .01); }
  if (sp.tie) add(GEO.box, sp.tie, .045, .32, .012, 0, 1.24, td / 2 + .04);
  if (sp.pens) for (let i = 0; i < 3; i++) add(GEO.box, [0x2d3f8f, 0xc0322a, 0x1f9d55][i], .014, .09, .014, -tw * .3 + i * .03, 1.36, td / 2 + .04);
  if (sp.apron) add(GEO.box, 0x4a5568, tw + .06, .78, .03, 0, 1.12, td / 2 + .045);
  if (sp.print) { const pm = new THREE.Mesh(GEO.plane, lambert(0xffffff, shirtPrintTex(sp.print))); pm.scale.set(tw * .8, tw * .3, 1); pm.position.set(0, 1.32, td / 2 + .02); body.add(pm); }
  add(GEO.taper, skin, .05, .1, .05, 0, 1.56, 0);
  const head = new THREE.Group(); head.position.set(0, 1.67, 0); body.add(head);
  add(GEO.ball, skin, .112, .132, .118, 0, .005, 0, head);
  add(GEO.ball, skin, .083, .07, .085, 0, -.072, .028, head);
  if (!sp.ghost && !sp.shadowFig) for (const sx of [-1, 1]) add(GEO.ball, warm(skin), .03, .024, .02, sx * .06, -.028, .084, head);
  const mood = sp.mood || pick(["neutral", "neutral", "tired", "smile", "angry", "worried"]), eyeC = sp.eye || pick([0x4a6fa5, 0x5a3a22, 0x3a6a4a, 0x2a2420, 0x6a8aa0]);
  sp.mood = mood; sp.eye = eyeC;
  const face = { brows: [], lids: [], corners: [], up: null, lo: null, o: null, tired: mood === "tired" || !!sp.coat };
  for (const sx of [-1, 1]) {
    add(GEO.ball, skin, .022, .034, .018, sx * .112, -.005, 0, head);
    add(GEO.ball, shade(skin, .7), .011, .018, .008, sx * .118, -.005, .006, head);
    if (sp.glowEyes) add(GEO.ball, 0xff2010, .018, .012, .01, sx * .042, .015, .105, head).material = basic(0xff2010);
    else if (!sp.ghost) {
      add(GEO.ball, 0xf8f8f4, .023, .017, .012, sx * .041, .016, .1, head);
      add(GEO.ball, sp.pose === "zombie" ? 0x8a1a1a : eyeC, .0115, .0115, .006, sx * .041, .015, .11, head);
      add(GEO.ball, 0x0a0c10, .0058, .0058, .004, sx * .041, .015, .1145, head);
      add(GEO.ball, 0xffffff, .0022, .0022, .002, sx * .041 + .004, .019, .1175, head).material = basic(0xffffff);
      const lid = add(GEO.ball, skin, .025, .011, .013, sx * .041, .029, .101, head); lid.userData.sx = sx; face.lids.push(lid);
      if (sp.coat || sp.chart || mood === "tired") add(GEO.ball, shade(skin, .78), .021, .007, .006, sx * .041, -.004, .1, head);
      const brow = add(GEO.box, new THREE.Color(sp.hair || 0x333333).multiplyScalar(.7).getHex(), .05, .015, .014, sx * .044, .054, .108, head); brow.userData.sx = sx; face.brows.push(brow);
    } else add(GEO.ball, 0x222233, .02, .025, .01, sx * .042, .015, .108, head);
  }
  if (!sp.ghost && !sp.shadowFig) {
    add(GEO.ball, skin, .011, .03, .014, 0, .03, .112, head);
    const nose = add(GEO.taper, skin, .019, .045, .023, 0, .012, .118, head); nose.rotation.x = .25;
    add(GEO.ball, shade(skin, .9), .02, .011, .012, 0, -.022, .121, head);
    const lipC = sp.pose === "zombie" ? 0x5a2a2a : warm(shade(skin, .82));
    face.up = add(GEO.ball, lipC, .026, .007, .008, 0, -.052, .115, head); face.lo = add(GEO.ball, warm(shade(skin, .9)), .022, .008, .008, 0, -.063, .113, head);
    for (const sx of [-1, 1]) { const c = add(GEO.ball, shade(lipC, .75), .012, .006, .007, sx * .028, -.05, .111, head); c.userData.sx = sx; face.corners.push(c); }
    face.o = add(GEO.ball, 0x3a1414, .019, .024, .006, 0, -.058, .115, head); face.o.visible = false;
  }
  const hs = sp.hairStyle || "short", hc = sp.hair || 0x333333;
  if (["short", "messy", "long", "bun", "spiky"].includes(hs)) { add(GEO.cap, hc, .122, hs === "messy" ? .15 : .13, .127, 0, .01, -.008, head); const fr = add(GEO.ball, hc, .1, .035, .05, hs === "long" ? -.02 : .015, .088, .07, head); fr.rotation.z = hs === "long" ? .3 : -.2; for (const sx of [-1, 1]) add(GEO.ball, hc, .024, .055, .07, sx * .103, .03, -.025, head); }
  if (hs === "messy") for (let i = 0; i < 5; i++) add(GEO.ball, hc, .045, .04, .045, -.08 + i * .04, .11 + (i % 2) * .02, -.02 + (i % 3) * .03, head);
  if (hs === "long") add(GEO.box, hc, .24, .3, .07, 0, -.11, -.085, head);
  if (hs === "bun") add(GEO.ball, hc, .06, .06, .06, 0, .09, -.11, head);
  if (hs === "spiky") for (let i = 0; i < 7; i++) { const s2 = add(GEO.spike, hc, 1, 1, 1, -.08 + (i % 4) * .055, .13, -.04 + Math.floor(i / 4) * .06, head); s2.rotation.x = -.3; }
  if (hs === "baldSides") { for (const sx of [-1, 1]) add(GEO.ball, hc, .026, .05, .075, sx * .102, .0, -.03, head); add(GEO.ball, hc, .1, .06, .05, 0, -.005, -.085, head); }
  if (hs === "cap") { add(GEO.cap, 0x2d3f8f, .125, .1, .13, 0, .03, 0, head); add(GEO.box, 0x2d3f8f, .2, .015, .12, 0, .045, .14, head); }
  if (sp.beard) add(GEO.ball, sp.beard, .095, .07, .06, 0, -.08, .075, head);
  if (sp.glasses === "normal" || sp.glasses === "thick") {
    const th = sp.glasses === "thick" ? .012 : .007;
    for (const sx of [-1, 1]) { const r = add(GEO.torus, 0x1b1b1b, .03, .025, th * 3, sx * .042, .015, .118, head); r.rotation.y = 0; }
    add(GEO.box, 0x1b1b1b, .03, th, th, 0, .02, .12, head);
  }
  if (sp.glasses === "sun") add(GEO.box, 0x050505, .2, .045, .02, 0, .015, .118, head);
  if (sp.glasses === "sunTop") add(GEO.box, 0x050505, .2, .04, .02, 0, .12, .07, head);
  if (sp.lamp) add(GEO.ball, 0xff3020, .02, .02, .02, 0, .12, .1, head).material = basic(0xff3020);
  for (const side of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(side * (tw / 2 + .02), 1.44, 0); body.add(sh);
    add(GEO.ball, sleeve, .052 * limbR, .055 * limbR, .055 * limbR, 0, 0, 0, sh);
    if (build === "muscle" && sp.short) {
      // short white sleeve, then a bare upper arm with a ridiculous biceps
      add(GEO.taper, sleeve, .056 * limbR, .1, .056 * limbR, 0, 0, 0, sh);
      add(GEO.taper, skin, .046 * limbR, .29, .046 * limbR, 0, 0, 0, sh);
      add(GEO.ball, skin, .096, .115, .09, 0, -.15, .045, sh);
      add(GEO.ball, shade(skin, .9), .06, .085, .06, 0, -.14, -.035, sh);
    } else add(GEO.taper, sleeve, .05 * limbR, .29, .05 * limbR, 0, 0, 0, sh);
    const el = new THREE.Group(); el.position.y = -.29; sh.add(el);
    add(GEO.taper, fore, .043 * limbR, .26, .043 * limbR, 0, 0, 0, el);
    add(GEO.ball, skin, .046 * Math.max(1, limbR * .8), .055, .03 * Math.max(1, limbR * .9), 0, -.3, 0, el);
    const th = add(GEO.ball, skin, .016, .03, .016, side * -.03, -.29, .022, el); th.rotation.z = side * .5;
    arms.push(sh); elbows.push(el);
  }
  if (sp.steth) { const st = new THREE.Mesh(GEO.steth, lambert(0x2b2b2b)); st.rotation.set(Math.PI / 2 - .3, 0, Math.PI * .9); st.position.set(0, 1.47, .05); body.add(st); }
  const hand = elbows[1], acc = sp.acc;
  if (acc === "clipboard") { add(GEO.box, 0x8a6f52, .2, .28, .015, 0, -.3, .08, hand); add(GEO.box, 0xffffff, .17, .22, .005, 0, -.32, .09, hand); }
  if (acc === "chart") add(GEO.box, 0x3f8fb3, .2, .28, .015, 0, -.3, .08, hand);
  if (acc === "book") add(GEO.box, 0xc0322a, .05, .28, .2, .04, -.3, .05, hand);
  if (acc === "folder") add(GEO.box, 0xc0322a, .03, .3, .22, .05, -.3, .04, hand);
  if (acc === "laptop") add(GEO.box, 0xb9c1c8, .03, .24, .32, .05, -.27, .04, hand);
  if (acc === "mug") add(GEO.cyl, 0xf2f2ee, .04, .09, .04, 0, -.34, .06, hand);
  if (sp.pose === "curl") { const db = new THREE.Group(); db.position.set(0, -.32, .02); hand.add(db); const bar = mesh(GEO.cyl, phong(0x8a8f94, 80), .015, .3, .015); bar.rotation.z = Math.PI / 2; db.add(bar); for (const sx of [-1, 1]) { const w = mesh(GEO.cyl, lambert(0x1e1f22), .07, .06, .07); w.rotation.z = Math.PI / 2; w.position.x = sx * .13; db.add(w); } }
  if (acc === "shake") { const h0 = elbows[0]; add(GEO.cyl, 0x2b2b2b, .045, .16, .045, 0, -.36, .05, h0); add(GEO.cyl, 0xf2c300, .047, .03, .047, 0, -.27, .05, h0); }
  if (acc === "jar") add(GEO.cyl, 0xf6c1d4, .05, .07, .05, 0, -.34, .06, hand);
  if (acc === "phone") add(GEO.box, 0x111111, .065, .13, .012, 0, -.36, .07, hand);
  if (acc === "handbag") add(GEO.box, 0x6a3a2a, .24, .18, .09, .04, -.42, 0, hand);
  if (acc === "toolbox") add(GEO.box, 0xc0322a, .34, .16, .15, .08, -.44, 0, hand);
  if (acc === "mop") add(GEO.pole, 0x8a6f52, 1, 1, 1, .04, -.1, .08, hand);
  if (acc === "iv") { add(GEO.pole, 0xb9c1bc, 1, 1, 1, .45, .95, .05, g); add(GEO.box, 0xd8eef8, .16, .26, .05, .5, 1.75, .05, g); add(GEO.ball, 0x444444, .06, .03, .06, .45, .02, .05, g); }
  if (sp.trolley) { add(GEO.box, 0xf2c300, .52, .68, .78, .66, .38, .1, g); add(GEO.cyl, 0x3f8fb3, .14, .3, .14, .66, .85, .2, g); }
  g.traverse(o => { if (o.isMesh && o.material !== shadowMat) o.castShadow = true; });
  const person = { group: g, body, legs, knees, arms, elbows, head, sp, face, phase: Math.random() * 6, amp: 0, expr: null };
  setExpression(person, mood);
  return person;
}
/* faces: brows, lids and mouth are moved, not rebuilt, so people can react live */
const EXPR = {
  neutral:   { brow: -.05, by: 0, lid: 0, up: [1, 1], lo: -.063, cy: -.051, cr: 0, cv: false, o: false },
  smile:     { brow: -.1, by: .004, lid: -.003, up: [1.15, .5], lo: -.059, cy: -.044, cr: .75, cv: true, o: false },
  angry:     { brow: -.48, by: -.009, lid: -.006, up: [1, 1.1], lo: -.065, cy: -.062, cr: -.6, cv: true, o: false },
  worried:   { brow: .45, by: .007, lid: 0, up: [.85, 1], lo: -.065, cy: -.062, cr: -.6, cv: true, o: false },
  surprised: { brow: -.02, by: .018, lid: .007, up: [.4, .6], lo: -.074, cy: -.055, cr: 0, cv: false, o: true },
  tired:     { brow: .15, by: -.002, lid: -.008, up: [1, 1], lo: -.063, cy: -.052, cr: 0, cv: false, o: false },
  disgust:   { brow: -.32, by: -.004, lid: -.006, up: [.9, 1.3], lo: -.066, cy: -.06, cr: -.5, cv: true, o: false, skew: .5 },
  happy:     { brow: .05, by: .01, lid: -.004, up: [.4, .6], lo: -.066, cy: -.046, cr: .6, cv: true, o: true },
};
function setExpression(p, name) {
  const f = p.face; if (!f || p.expr === name) return; p.expr = name;
  const e = EXPR[name] || EXPR.neutral, tiredLid = f.tired && name === "neutral" ? -.006 : 0;
  for (const b of f.brows) { const sx = b.userData.sx; b.rotation.z = sx * e.brow + (e.skew && sx > 0 ? e.skew * .3 : 0); b.position.y = .054 + e.by; }
  for (const l of f.lids) { l.position.y = .029 + e.lid + tiredLid; l.rotation.z = l.userData.sx * (name === "tired" ? -.12 : .05); }
  if (f.up) { f.up.scale.set(.026 * e.up[0], .007 * e.up[1], .008); f.up.position.y = -.052 + (e.skew ? .003 : 0); f.up.rotation.z = e.skew ? .2 : 0; f.lo.position.y = e.lo; f.lo.visible = !e.o || name === "happy"; }
  for (const c of f.corners) { const sx = c.userData.sx; c.visible = e.cv; c.position.y = e.cy + (e.skew && sx > 0 ? .006 : 0); c.rotation.z = sx * e.cr; }
  if (f.o) f.o.visible = e.o;
}
function animatePerson(p, dt, moving, speed) {
  p.amp += ((moving ? 1 : 0) - p.amp) * Math.min(1, dt * 8);
  p.phase += dt * (3 + speed * 4);
  const s = Math.sin(p.phase) * p.amp, c = Math.cos(p.phase) * p.amp, pose = p.sp.pose;
  if (p.seated) { for (let i = 0; i < 2; i++) { p.legs[i].rotation.x = -1.5; p.knees[i].rotation.x = 1.5; } p.body.position.y = -.45; p.arms[0].rotation.x = p.arms[1].rotation.x = -.3; p.elbows[0].rotation.x = p.elbows[1].rotation.x = -.8; return; }
  p.legs[0].rotation.x = s * .55; p.legs[1].rotation.x = -s * .55;
  p.knees[0].rotation.x = Math.max(0, -c) * .8; p.knees[1].rotation.x = Math.max(0, c) * .8;
  if (pose === "zombie") { p.arms[0].rotation.x = -1.45 + s * .12; p.arms[1].rotation.x = -1.4 - s * .12; p.elbows[0].rotation.x = p.elbows[1].rotation.x = -.15; p.head.rotation.z = Math.sin(p.phase * .5) * .15; }
  else if (pose === "flex") {
    // right arm: classic biceps flex, pumping a little; left arm holds the shake
    const pump = Math.sin(p.phase * .6) * .12;
    p.arms[1].rotation.set(-.15, 0, 1.35 + pump * .3); p.elbows[1].rotation.set(0, 0, 1.75 + pump);
    p.arms[0].rotation.set(-.3, 0, -.12); p.elbows[0].rotation.set(-1.1, 0, 0);
    p.head.rotation.y = -.35 + (p.look || 0);
  }
  else if (pose === "curl") {
    // biceps curls, endlessly, while blocking the corridor
    const c2 = (Math.sin(p.phase * .9) + 1) / 2;
    p.arms[1].rotation.set(-.12, 0, .12); p.elbows[1].rotation.set(-.25 - c2 * 1.9, 0, 0);
    p.arms[0].rotation.set(-.3, 0, -.12); p.elbows[0].rotation.set(-1.1, 0, 0);
    p.head.rotation.y = .5 + (p.look || 0); p.head.rotation.x = -.05 * c2;
  }
  else if (pose === "crossed") { p.arms[0].rotation.set(-.55, 0, .25); p.arms[1].rotation.set(-.55, 0, -.25); p.elbows[0].rotation.set(-1.7, 0, 0); p.elbows[1].rotation.set(-1.7, 0, 0); p.arms[0].position.z = p.arms[1].position.z = .02; }
  else {
    const holding = p.sp.acc && !["iv", "mop", "handbag", "toolbox"].includes(p.sp.acc);
    p.arms[0].rotation.x = -s * .45; p.elbows[0].rotation.x = -.25 - Math.max(0, s) * .4;
    p.arms[1].rotation.x = holding ? -.35 + s * .1 : s * .45; p.elbows[1].rotation.x = holding ? -1.0 : -.25 - Math.max(0, -s) * .4;
    p.head.rotation.y = p.look || 0;
    // idle life: while standing, people scratch their head, check the watch or the phone, stretch, look around
    if (p.amp < .3 && !p.sp.lowDetail) {
      p.idleT = (p.idleT ?? 2 + Math.random() * 4) - dt;
      if (p.idleT <= 0) { p.idleT = 4 + Math.random() * 6; p.gesture = pick(holding ? ["watch", "look", "none"] : ["scratch", "watch", "phone", "stretch", "look", "none", "none"]); p.gT = 0; }
      if (p.gesture && p.gesture !== "none") {
        p.gT += dt; const k = Math.min(1, p.gT * 3, Math.max(0, 2.6 - p.gT) * 3) * (1 - p.amp / .3);
        const A = p.arms[1], E = p.elbows[1], L = p.arms[0], F = p.elbows[0];
        if (p.gesture === "scratch") { A.rotation.x += (-2.6 - A.rotation.x) * k; A.rotation.z = -.4 * k; E.rotation.x += (-1.6 - E.rotation.x) * k + Math.sin(p.gT * 18) * .08 * k; p.head.rotation.z = -.12 * k; }
        if (p.gesture === "watch") { L.rotation.x += (-1.1 - L.rotation.x) * k; L.rotation.z = .3 * k; F.rotation.x += (-1.4 - F.rotation.x) * k; p.head.rotation.x = .35 * k; p.head.rotation.y = .25 * k; }
        if (p.gesture === "phone") { A.rotation.x += (-.9 - A.rotation.x) * k; E.rotation.x += (-1.5 - E.rotation.x) * k; p.head.rotation.x = .45 * k; }
        if (p.gesture === "stretch") { A.rotation.x += (-3 - A.rotation.x) * k; L.rotation.x += (-3 - L.rotation.x) * k; E.rotation.x *= 1 - k; F.rotation.x *= 1 - k; p.head.rotation.x = -.25 * k; }
        if (p.gesture === "look") p.head.rotation.y = Math.sin(p.gT * 1.6) * .8 * k;
        if (p.gT > 2.6) { p.gesture = null; p.head.rotation.x = p.head.rotation.z = 0; }
      }
    }
  }
  // breathing, and a mouth that moves while they talk
  const breath = Math.sin(p.phase * .35 + 1) * .012 * (1 - p.amp);
  p.body.position.y = Math.abs(Math.sin(p.phase)) * .025 * p.amp + (p.amp < .1 ? Math.sin(p.phase * .3) * .006 : 0);
  p.body.scale.y = (p.sp.scale || 1) * (1 + breath * .5);
  if (p.face && p.face.lo) {
    if (p.talking) { p.tk = (p.tk || 0) + dt * 14; p.face.lo.position.y = -.063 - Math.abs(Math.sin(p.tk)) * .012; if (p.face.o) p.face.o.visible = Math.sin(p.tk) > .4; }
    else if (p.tk) { p.tk = 0; const e = p.expr; p.expr = null; setExpression(p, e || "neutral"); }
  }
}

// ---------- items as 3D objects ----------
function itemModel(k) {
  const g = new THREE.Group(), A = (geo, c, sx, sy, sz, x, y, z, map) => { const m = new THREE.Mesh(geo, map ? lambert(0xffffff, map) : lambert(c)); m.scale.set(sx, sy, sz); m.position.set(x, y, z); g.add(m); return m; };
  switch (k) {
    case "1": A(GEO.cyl, 0xf4f4f0, .12, .015, .12, 0, .008, 0); A(GEO.cyl, 0xf4f4f0, .07, .1, .07, 0, .065, 0); A(GEO.cyl, 0x4a2a14, .062, .005, .062, 0, .113, 0); A(GEO.torus, 0xf4f4f0, .03, .03, .03, .075, .07, 0).rotation.y = Math.PI / 2; break;
    case "0": A(GEO.cyl, 0, .045, .15, .045, 0, .075, 0, canTex()); A(GEO.cyl, 0xc0c4c8, .042, .01, .042, 0, .155, 0); break;
    case "$": A(GEO.cyl, 0xf4f4f0, .13, .01, .13, 0, .005, 0); A(GEO.torus, 0xc98a4a, .065, .065, .09, 0, .035, 0).rotation.x = Math.PI / 2; A(GEO.torus, 0xf27aa8, .066, .066, .05, 0, .05, 0).rotation.x = Math.PI / 2; break;
    case "+": A(GEO.cyl, 0xf6c1d4, .07, .08, .07, 0, .04, 0); A(GEO.cyl, 0xf4f4f0, .074, .025, .074, 0, .092, 0); break;
    case "2": A(GEO.box, 0x8a6f52, .22, .012, .3, 0, .006, 0); A(GEO.box, 0xffffff, .19, .004, .24, 0, .014, .015); A(GEO.box, 0x9aa0a6, .08, .02, .03, 0, .02, -.13); break;
    case "3": A(GEO.cyl, 0x3f8fb3, .04, .18, .04, 0, .09, 0); A(GEO.box, 0xf4f4f0, .03, .04, .05, 0, .2, .015); break;
    case "4": A(GEO.box, 0x1b1b1b, .08, .025, .05, 0, .013, 0); A(GEO.box, 0x6fcf97, .05, .004, .025, 0, .027, 0); break;
    case "5": A(GEO.cyl, 0x2b2b2b, .02, .16, .02, 0, .08, 0); A(GEO.ball, 0x9aa0a6, .04, .04, .04, 0, .18, 0); A(GEO.cyl, 0x2b2b2b, .1, .015, .1, 0, .008, 0); break;
    case "6": A(GEO.cyl, 0x7a5fae, .05, .2, .05, 0, .1, 0); A(GEO.cyl, 0x1b1b1b, .052, .04, .052, 0, .21, 0); break;
    case "7": A(GEO.box, 0, .16, .04, .22, 0, .02, 0, bookTex()); break;
    case "8": A(GEO.box, 0, .1, .02, .16, 0, .01, 0, calcTex()); break;
    case "9": A(GEO.cyl, 0x1b1b1b, .03, .1, .03, 0, .05, 0); A(GEO.cyl, 0xc98a4a, .012, .015, .012, 0, .108, 0); A(GEO.cyl, 0xd8a83a, .031, .02, .031, 0, .09, 0); break;
    case "&": A(GEO.box, 0xf3ecd6, .22, .006, .3, 0, .003, 0); A(GEO.cyl, 0xc0322a, .03, .008, .03, .06, .01, .1); break;
  }
  g.scale.setScalar(1.6);
  return g;
}
function wetSign() {
  const g = new THREE.Group(), m = lambert(0xffffff, signFloorTex());
  for (const s of [-1, 1]) { const p = mesh(GEO.box, m, .34, .62, .015); p.position.set(0, .3, s * .09); p.rotation.x = s * .28; g.add(p); }
  return g;
}

// first-person hand with flashlight
const fpHand = new THREE.Group();
/* first-person hand holding a doctor's penlight between thumb and fingers, tilted like you'd check pupils */
{ const sleeve = mesh(GEO.cyl, lambert(0xf4f4f0), .055, .3, .05); sleeve.rotation.x = Math.PI / 2 - .25; sleeve.position.set(.03, -.05, .12); fpHand.add(sleeve);
  const cuff = mesh(GEO.cyl, lambert(0xdfe3e0), .057, .02, .052); cuff.rotation.x = Math.PI / 2 - .25; cuff.position.set(.03, -.04, -.02); fpHand.add(cuff);
  const skin = lambert(SKIN[0]);
  const palm = mesh(GEO.ball, skin, .045, .03, .055); palm.position.set(.02, -.03, -.07); palm.rotation.z = .5; fpHand.add(palm);
  for (let i = 0; i < 3; i++) { const f = mesh(GEO.cyl, skin, .012, .05, .012); f.position.set(-.012 + i * .016, -.035 - i * .004, -.115); f.rotation.x = Math.PI / 2 + .9; f.rotation.z = -.2; fpHand.add(f); }
  const thumb = mesh(GEO.cyl, skin, .013, .05, .013); thumb.position.set(-.03, -.005, -.1); thumb.rotation.set(1.2, 0, .9); fpHand.add(thumb);
  const pen = new THREE.Group();
  const body = mesh(GEO.cyl, phong(0xc9ced4, 90), .0085, .15, .0085); pen.add(body);
  pen.add(at(mesh(GEO.cyl, phong(0x2b5fae, 50), .009, .035, .009), 0, -.045, 0));
  const clip = boxMesh(.003, .07, .004, 0xdfe3e8); clip.position.set(0, .03, .01); pen.add(clip);
  pen.add(at(mesh(GEO.ball, basic(0xfff6d8), .0075), 0, .077, 0));
  pen.position.set(-.02, -.01, -.13); pen.rotation.set(-1.15, 0, .55); fpHand.add(pen); fpHand.userData.pen = pen; }
fpHand.position.set(.2, -.2, -.34); fpHand.visible = false; camera.add(fpHand);

// floating dust motes around the player, catching the light
let dust = null;
{
  const N = 140, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 12; pos[i * 3 + 1] = .3 + Math.random() * 2.7; pos[i * 3 + 2] = (Math.random() - .5) * 12; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: .03, map: glowTex("rgba(255,250,235,1)"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .35, toneMapped: false });
  dust = new THREE.Points(geo, mat); dust.frustumCulled = false; scene.add(dust); dust.userData.t = 0;
}
function updateDust(dt) {
  const p = dust.geometry.attributes.position, a = p.array, px = player.x * S, pz = player.y * S; dust.userData.t += dt;
  for (let i = 0; i < a.length; i += 3) {
    a[i] += Math.sin(dust.userData.t * .3 + i) * dt * .05; a[i + 1] += Math.sin(dust.userData.t * .21 + i * .7) * dt * .03 - dt * .006; a[i + 2] += Math.cos(dust.userData.t * .27 + i) * dt * .05;
    if (a[i] - px > 6) a[i] -= 12; else if (a[i] - px < -6) a[i] += 12;
    if (a[i + 2] - pz > 6) a[i + 2] -= 12; else if (a[i + 2] - pz < -6) a[i + 2] += 12;
    if (a[i + 1] < .2) a[i + 1] = 2.9;
  }
  p.needsUpdate = true;
  dust.visible = typeof mode === "undefined" || mode !== "outro";
}
