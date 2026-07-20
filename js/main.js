// ============================================
// main.js — bootstrap + game loop + เชื่อม intro เข้ากับเกม
// ============================================

import { Input } from './engine/input.js';
import { Camera } from './engine/camera.js';
import { Renderer } from './engine/renderer.js';
import { Player } from './world/player.js';
import { MAP } from './world/map.js';
import { OBJECTS } from './world/objects.js';
import { IntroScene } from './ui/title.js';
import { Panels } from './ui/panels.js';
import { ResumeMode } from './ui/resume.js';
import { i18n } from './i18n.js';
import { audio } from './audio.js';
import { BRAND } from './data/content.js';

// สไปรต์ตัวละคร (กระติ๊บ) — ใช้ webp ตัวเดียวกับ <img id="kratib"> ใน intro
// จึงมาจาก cache ทันที ไม่ยิง request ซ้ำ (png เดิม 343KB → webp 60KB)
const playerSprite = new Image();
playerSprite.src = 'assets/kratib.webp';

const canvas = document.getElementById('game-canvas');
const renderer = new Renderer(canvas, { player: playerSprite });
const input = new Input();
const camera = new Camera(MAP.width, MAP.height);
const player = new Player(MAP.spawn.x, MAP.spawn.y);

// สิ่งกีดขวางทั้งหมด = กำแพง + วัตถุ solid
const solids = [...MAP.walls, ...OBJECTS.filter((o) => o.solid)];

// ระหว่าง intro: ห้ามเดิน และยังไม่วาดตัวละคร (กระติ๊บจะบินลงมาเอง)
input.enabled = false;
player.hidden = true;
let inGame = false; // true หลัง intro จบ

// ลูกศรชี้ทางไปวัตถุที่เลือกจาก intro
let waypoint = null;

// ---- ระบบ interact (M2) ----
const INTERACT_RANGE = 64; // ระยะจากขอบวัตถุ (world px)
let hover = null;          // วัตถุที่อยู่ในระยะ interact ตอนนี้

// หา "วัตถุที่ใกล้ที่สุดในระยะ" — วัดจากขอบ AABB ไม่ใช่จุดกลาง
function findHover() {
  let best = null;
  let bestD = Infinity;
  for (const o of OBJECTS) {
    const dx = Math.max(o.x - player.x, 0, player.x - (o.x + o.w));
    const dy = Math.max(o.y - player.y, 0, player.y - (o.y + o.h));
    const d = Math.hypot(dx, dy);
    if (d < INTERACT_RANGE && d < bestD) {
      bestD = d;
      best = o;
    }
  }
  return best;
}

// เดินได้เฉพาะตอนอยู่ในเกม และไม่มี overlay (panel/resume) เปิดทับอยู่
function refreshInputLock() {
  input.enabled = inGame && !panels.isOpen && !resumeMode.isOpen;
  // ★ 2026-07-20: จอ ≤820px ต้องซ่อน HUD ตอนมี overlay เปิด — ไม่งั้นปุ่ม HUD
  //   (fixed มุมขวาบน) ไปทับปุ่มปิด ✕ ของ panel จนกดไม่ได้ (ดู CSS THEME v2.9)
  document.documentElement.classList.toggle(
    'overlay-open', panels.isOpen || resumeMode.isOpen,
  );
}

// ★ 2026-07-20: ตัวนับความคืบหน้า "สำรวจแล้ว x/13 โซน"
// ทำให้ผู้ชมอยากเปิดดูให้ครบ — ครบแล้วขึ้นข้อความฉลองสั้นๆ
const progressEl = document.getElementById('progress');
const seenZones = new Set();
function renderProgress() {
  if (!inGame) return;
  const total = OBJECTS.length;
  progressEl.textContent = seenZones.size >= total
    ? i18n.t('ui.progressDone')
    : `${i18n.t('ui.progress')} ${seenZones.size}/${total}`;
  progressEl.classList.toggle('done', seenZones.size >= total);
}

const panels = new Panels({
  onOpenChange: refreshInputLock,
  onOpenZone: (id) => {
    if (seenZones.has(id)) return;
    seenZones.add(id);
    renderProgress();
    if (seenZones.size === OBJECTS.length) audio.play('sparkle');
  },
});
const resumeMode = new ResumeMode({ onOpenChange: refreshInputLock });

window.addEventListener('keydown', (e) => {
  if (!inGame || panels.isOpen || resumeMode.isOpen) return;
  if (['KeyE', 'Enter', 'Space'].includes(e.code) && hover) {
    e.preventDefault();
    panels.open(hover.id);
  }
});

// ปุ่ม interact ลอยสำหรับจอสัมผัส — โชว์เฉพาะตอนมีวัตถุในระยะ
const interactBtn = document.getElementById('interact-btn');
let interactShown = false;
interactBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (hover && !panels.isOpen) panels.open(hover.id);
});

function handleResize() {
  renderer.resize();
  camera.setViewport(renderer.screenW, renderer.screenH);
}
window.addEventListener('resize', handleResize);
handleResize();
camera.snapTo(player.x, player.y);

// ---- ช่วงเปิดตัว ----
const intro = new IntroScene({
  // ตำแหน่ง/ขนาดของตัวละครบนจอ (px) — จุดหมายที่กระติ๊บใน intro จะบินลงไป
  getPlayerRect: () => {
    const s = camera.scale;
    const feetY = (player.y + player.h / 2 - camera.top) * s;
    const h = player.spriteH * s;
    return {
      cx: (player.x - camera.left) * s,
      cy: feetY - h / 2,
      h,
    };
  },
  onFinish: (targetId) => {
    player.hidden = false;
    inGame = true;
    refreshInputLock();
    waypoint = targetId ? OBJECTS.find((o) => o.id === targetId) ?? null : null;
    homeBtn.classList.remove('hidden'); // เข้าสตูดิโอแล้วค่อยโชว์ปุ่มกลับหน้าหลัก
    progressEl.classList.remove('hidden');
    renderProgress();
  },
});
intro.start();

// Title วาดเสร็จแล้ว → ค่อยเริ่มดึงภาพห้อง (~490KB) แบบเงียบๆ เบื้องหลัง
// ถ้าโหลดไม่ทันตอนเข้าห้อง renderer มี buildRoom เวกเตอร์เป็น fallback อยู่แล้ว
requestAnimationFrame(() => requestAnimationFrame(() => renderer.preloadRoom()));

// ---- ปุ่มกลับหน้าหลัก (Title) ----
// screen transition: fade มืดก่อนค่อย reload (reduce motion = reload ทันที)
const homeBtn = document.getElementById('home-btn');
const screenFade = document.getElementById('screen-fade');
const REDUCED_MOTION =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  localStorage.getItem('fx') !== 'full';
homeBtn.addEventListener('click', () => {
  audio.play('click');
  if (REDUCED_MOTION) {
    location.reload(); // ภาษา/เสียง/FULL FX จำใน localStorage อยู่แล้ว
    return;
  }
  screenFade.classList.add('active');
  setTimeout(() => location.reload(), 430); // รอ fade จบ (CSS 0.4s) ค่อยเริ่ม intro ใหม่
});

// ---- ปุ่มเสียง ----
const muteBtn = document.getElementById('mute-btn');
function renderMuteBtn() {
  muteBtn.textContent = audio.muted ? '🔇' : '🔊';
}
muteBtn.addEventListener('click', () => {
  audio.setMuted(!audio.muted);
  renderMuteBtn();
  audio.play('click');
});
renderMuteBtn();

// ---- ปุ่มสลับภาษา (กดวน ไทย → EN → 日本語 ไม่ reload) ----
const langBtn = document.getElementById('lang-btn');
const LANG_ORDER = BRAND.langs.map((l) => l.id);
function renderLangBtn() {
  const cur = BRAND.langs.find((l) => l.id === i18n.lang);
  langBtn.textContent = cur ? cur.label : i18n.lang;
  langBtn.setAttribute('aria-label', i18n.t('ui.langBtn'));
}
langBtn.addEventListener('click', () => {
  const next = LANG_ORDER[(LANG_ORDER.indexOf(i18n.lang) + 1) % LANG_ORDER.length];
  i18n.set(next);
  audio.play('blip');
});

// ---- ปุ่ม Resume Mode (สำหรับ HR ที่รีบ — เปิดได้ตั้งแต่หน้า Title) ----
const resumeBtn = document.getElementById('resume-btn');
function renderResumeBtn() {
  resumeBtn.textContent = i18n.t('resume.open');
  resumeBtn.setAttribute('aria-label', i18n.t('resume.heading'));
}
resumeBtn.addEventListener('click', () => {
  audio.play('click');
  if (resumeMode.isOpen) {
    resumeMode.close();
  } else {
    panels.close(); // เปิดทีละ overlay พอ
    resumeMode.open();
  }
});

// ป้ายชื่อลอยเหนือวัตถุ (ใช้หัวข้อเดียวกับ panel — ครบ 3 ภาษา) rebuild ตอนสลับภาษา
let objectLabels = {};
// perf: prompt เปลี่ยนแค่ตอนสลับภาษา/สลับ touch — เดิมเรียก i18n.t() ทุกเฟรม
let promptText = '';
let promptTouch = null;
function rebuildLabels() {
  objectLabels = {};
  for (const o of OBJECTS) {
    const d = i18n.t(`panels.${o.id}`);
    if (d) objectLabels[o.id] = d.title;
  }
  promptTouch = null; // บังคับคำนวณ prompt ใหม่เฟรมถัดไป
}

// สลับภาษา → อัปเดตทุกอย่างที่แสดงข้อความอยู่ (resume/panel วาดใหม่ของตัวเองผ่าน onChange)
i18n.onChange(() => {
  document.documentElement.lang = i18n.lang;
  renderLangBtn();
  renderResumeBtn();
  rebuildLabels();
  panels.refresh();
  renderProgress();
});
document.documentElement.lang = i18n.lang;
renderLangBtn();
renderResumeBtn();
rebuildLabels();

// ---- game loop ----
let lastTime = performance.now();
let running = true;
let elapsed = 0; // เวลารวม (วินาที) ใช้กับ animation glow
let stepTimer = 0; // จังหวะเสียงฝีเท้า (วินาทีจนถึงก้าวถัดไป)

// perf: object เดิมทุกเฟรม (เดิมสร้าง literal ใหม่ ~60 ครั้ง/วินาที)
const drawState = {
  camera, map: MAP, objects: OBJECTS, player,
  time: 0, waypoint: null, hover: null, labels: null, prompt: '',
};

function frame(now) {
  if (!running) return;

  // delta time เป็นวินาที, cap ที่ 50ms กัน physics กระโดดหลังแท็บค้าง
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  dt = Math.min(dt, 0.05);
  elapsed += dt;

  player.update(dt, input, solids);
  camera.follow(player.x, player.y, dt);

  // SFX ฝีเท้า: เล่นเป็นจังหวะระหว่างเดิน (ก้าวแรกดังทันทีที่ขยับ)
  if (player.moving && !player.hidden) {
    stepTimer -= dt;
    if (stepTimer <= 0) {
      audio.play('step');
      stepTimer = 0.26; // ให้เข้ากับจังหวะ bob ของสไปรต์ตอนเดิน
    }
  } else {
    stepTimer = 0;
  }

  // เดินถึงจุดหมายแล้ว → เอาลูกศรชี้ทางออก
  if (waypoint) {
    const dx = player.x - (waypoint.x + waypoint.w / 2);
    const dy = player.y - (waypoint.y + waypoint.h / 2);
    if (Math.hypot(dx, dy) < 170) waypoint = null;
  }

  // วัตถุใกล้ตัว → เรืองแสง + ป้าย prompt (ปิดไว้ตอน panel/resume เปิด)
  hover = inGame && !panels.isOpen && !resumeMode.isOpen ? findHover() : null;

  // จอสัมผัส: โชว์ปุ่ม ✦ เฉพาะตอนมีวัตถุในระยะ (toggle class เฉพาะตอนสถานะเปลี่ยน)
  const showInteract = !!(input.touch && hover);
  if (showInteract !== interactShown) {
    interactShown = showInteract;
    interactBtn.classList.toggle('hidden', !showInteract);
  }

  if (promptTouch !== input.touch) {
    promptTouch = input.touch;
    promptText = i18n.t(input.touch ? 'ui.interactTouch' : 'ui.interact');
  }

  drawState.time = elapsed;
  drawState.waypoint = waypoint;
  drawState.hover = hover;
  drawState.labels = objectLabels;
  drawState.prompt = promptText;
  renderer.draw(drawState);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// hook เล็กๆ สำหรับ automated test (อ่านสถานะเกมจากภายนอกได้ ไม่กระทบ logic)
window.__game = {
  player,
  panels,
  input,
  renderer,
  map: MAP,       // ให้เทสอ่านเรขาคณิตกำแพงได้ (scratchpad/walls.py)
  objects: OBJECTS,
  resume: resumeMode,
  get hover() { return hover; },
  get inGame() { return inGame; },
};

// หยุด loop เมื่อแท็บไม่ active (ประหยัดแบตและกัน dt สะสม)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    running = false;
  } else {
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(frame);
  }
});
