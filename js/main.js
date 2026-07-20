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
import { buildLinks } from './ui/panels.js';

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
  // ★ ป้ายวิธีเล่นต้องไม่ลอยทับกล่องข้อความ (z-index สูงกว่า panel)
  if (panels.isOpen || resumeMode.isOpen) hintEl?.classList.add('gone');
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

// ★ 2026-07-20: การ์ดปิดท้ายเมื่อสำรวจครบทุกโซน — เปลี่ยน "คนดู" เป็น "คนทัก"
//   (เดิมครบแล้วได้แค่ป้ายทอง ซึ่งไม่ได้พาไปไหนต่อ)
const ctaEl = document.getElementById('cta');
function showCta() {
  document.getElementById('cta-head').textContent = i18n.t('resume.ctaHead');
  document.getElementById('cta-body').textContent = i18n.t('resume.ctaBody');
  const box = document.getElementById('cta-links');
  box.innerHTML = '';
  const contact = i18n.t('panels.desk');
  if (contact?.links) box.appendChild(buildLinks(contact.links));
  ctaEl.classList.remove('hidden');
}
document.getElementById('cta-close').addEventListener('click', () => {
  audio.play('click');
  ctaEl.classList.add('hidden');
});

const panels = new Panels({
  onOpenChange: refreshInputLock,
  onOpenZone: (id) => {
    if (seenZones.has(id)) return;
    seenZones.add(id);
    renderProgress();
    if (seenZones.size === OBJECTS.length) {
      audio.play('sparkle');
      setTimeout(showCta, 700);   // รอ panel ที่เพิ่งเปิดให้ผู้ใช้อ่านก่อนสักครู่
    }
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

// ★ 2026-07-20: คลิกเพื่อเดิน + คลิกขวา interact (เจ้าของ: "การควบคุมไม่สมูทเลย")
//   คลิกบนวัตถุ = เดินไปหาแล้ว "เปิด panel ให้เอง" เมื่อถึงระยะ (คลิกเดียวจบ)
let clickIntent = null;   // id ของวัตถุที่ตั้งใจจะเปิดเมื่อเดินไปถึง
let goalStuck = 0;        // จับเวลาเดินไม่ขยับ = ติดกำแพง → เลิกเดิน

function screenToWorld(sx, sy) {
  return { x: camera.left + sx / camera.scale, y: camera.top + sy / camera.scale };
}

// วัตถุที่ถูกคลิก (เผื่อขอบ 10px ให้กดง่ายขึ้น)
function objectAt(wx, wy) {
  return OBJECTS.find((o) => wx > o.x - 10 && wx < o.x + o.w + 10
    && wy > o.y - 10 && wy < o.y + o.h + 10) ?? null;
}

// จุดยืนหน้าวัตถุ — ★ เลือก "ด้านที่ผู้เล่นอยู่ใกล้ที่สุด" ไม่ใช่ใต้วัตถุเสมอ
//   ระบบเดินเป็นเส้นตรงไม่มี pathfinding ถ้าเล็งจุดฝั่งตรงข้าม ตัวละครจะไปโขกวัตถุแล้วค้าง
//   (เจอตอนเทส: ยืนอยู่เหนือศิลาภาษาแล้วคลิก → เดินชนแล้วเลิก ไม่เปิด panel)
function standPoint(o, from) {
  const pad = 44;
  const cx = o.x + o.w / 2;
  const cy = o.y + o.h / 2;
  const dx = from.x - cx;
  const dy = from.y - cy;
  const hx = o.w / 2 + pad;
  const hy = o.h / 2 + pad;
  let p = Math.abs(dx) / hx > Math.abs(dy) / hy
    ? { x: cx + Math.sign(dx || 1) * hx, y: cy }
    : { x: cx, y: cy + Math.sign(dy || 1) * hy };
  // จุดที่เลือกต้องอยู่ในพื้นที่เดินได้จริง ไม่งั้นถอยไปใช้ "ด้านล่างวัตถุ"
  const f = MAP.floor;
  if (p.x < f.x0 + 30 || p.x > f.x1 - 30 || p.y < f.y0 + 30 || p.y > f.y1 - 30) {
    p = { x: cx, y: Math.min(o.y + o.h + pad, f.y1 - 30) };
  }
  return p;
}

// วัตถุ solid ชิ้นแรกที่เส้นตรง (x0,y0)→(x1,y1) พาดผ่าน — ใช้กับการหลบสิ่งกีดขวาง
// sample 12 จุดตามเส้น พอสำหรับห้องขนาดนี้ (วัตถุเล็กสุดกว้าง 90px)
function blockerOnPath(x0, y0, x1, y1) {
  const pad = 26;   // เผื่อครึ่งตัวผู้เล่น
  for (let i = 1; i <= 12; i++) {
    const k = i / 12;
    const px = x0 + (x1 - x0) * k;
    const py = y0 + (y1 - y0) * k;
    for (const o of OBJECTS) {
      if (!o.solid) continue;
      if (px > o.x - pad && px < o.x + o.w + pad
        && py > o.y - pad && py < o.y + o.h + pad) return o;
    }
  }
  return null;
}

// ระยะจากขอบ AABB ถึงผู้เล่น (สูตรเดียวกับ findHover) — ใช้ตัดสินว่าเปิด panel ได้ไหม
function edgeDist(o) {
  const dx = Math.max(o.x - player.x, 0, player.x - (o.x + o.w));
  const dy = Math.max(o.y - player.y, 0, player.y - (o.y + o.h));
  return Math.hypot(dx, dy);
}

function setGoal(wx, wy, obj) {
  clickIntent = obj ? obj.id : null;
  const p = obj ? standPoint(obj, player) : { x: wx, y: wy };
  input.moveGoal = { x: p.x, y: p.y, px: player.x, py: player.y };
  goalStuck = 0;
  renderer.addClickFx(wx, wy, obj ? obj.color : '#bfe3ff');
  audio.play('blip');
}

input.onRightClick = (sx, sy) => {
  // คลิกขวา = หยุดเดิน + คุยกับวัตถุที่อยู่ในระยะ (แทนเมนูบันทึกภาพของเบราว์เซอร์)
  clickIntent = null;
  const w = screenToWorld(sx, sy);
  renderer.addClickFx(w.x, w.y, '#ffd24d');
  if (hover && !panels.isOpen && !resumeMode.isOpen) panels.open(hover.id);
};

// ★ 2026-07-20: ป้ายบอกวิธีเล่น — โผล่ 6 วิแรกหลังเข้าห้องแล้วจางหายเอง
//   ข้อความเปลี่ยนตามอุปกรณ์ (เมาส์/คีย์บอร์ด vs จอสัมผัส) และตามภาษา
const hintEl = document.getElementById('hint');
let hintTimer = null;
function showHint() {
  hintEl.textContent = i18n.t(input.touch ? 'ui.hintTouch' : 'ui.hintKeys');
  hintEl.classList.remove('hidden', 'gone');
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => {
    hintEl.classList.add('gone');
    setTimeout(() => hintEl.classList.add('hidden'), 600);
  }, 6000);
}

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
    showHint();
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
  // ป้ายวิธีเล่นยังโชว์อยู่ → เปลี่ยนภาษาตามทันที (ไม่งั้นค้างเป็นภาษาเดิม)
  if (hintEl && !hintEl.classList.contains('hidden')) {
    hintEl.textContent = i18n.t(input.touch ? 'ui.hintTouch' : 'ui.hintKeys');
  }
  if (!ctaEl.classList.contains('hidden')) showCta();
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

  // ---- คลิกเพื่อเดิน ----
  if (input.clickTarget) {
    const t = input.clickTarget;
    input.clickTarget = null;
    const w = screenToWorld(t.sx, t.sy);
    setGoal(w.x, w.y, objectAt(w.x, w.y));
  }
  // จุดหมายถูกยกเลิก (กด WASD / จับจอย / คลิกขวา) → ล้างความตั้งใจจะเปิด panel ด้วย
  if (!input.moveGoal && clickIntent) clickIntent = null;
  if (input.moveGoal) {
    const g = input.moveGoal;
    const before = Math.hypot(player.x - g.px, player.y - g.py);
    g.px = player.x;                     // ให้ getMoveVector รู้ตำแหน่งล่าสุด
    g.py = player.y;
    const d = Math.hypot(g.x - player.x, g.y - player.y);

    // ★ A13: หลบสิ่งกีดขวาง 1 ระดับ (ไม่ใช่ A* เต็ม — ห้องโล่งพอ)
    //   ถ้าเส้นตรงไปหาเป้าพาดผ่านวัตถุ solid ให้ตั้ง "จุดพัก" ที่มุมของวัตถุนั้น
    //   ฝั่งที่อ้อมสั้นกว่า แล้วค่อยเดินต่อ = ไม่ไปยืนโขกอยู่หน้าตู้
    if (!g.via && d > 40) {
      const hit = blockerOnPath(player.x, player.y, g.x, g.y);
      if (hit) {
        const pad = 52;
        const left = hit.x - pad;
        const right = hit.x + hit.w + pad;
        const viaX = Math.abs(left - player.x) < Math.abs(right - player.x) ? left : right;
        const viaY = player.y < hit.y ? hit.y - pad : hit.y + hit.h + pad;
        g.via = {
          x: Math.min(Math.max(viaX, MAP.floor.x0 + 30), MAP.floor.x1 - 30),
          y: Math.min(Math.max(viaY, MAP.floor.y0 + 30), MAP.floor.y1 - 30),
        };
        g.finalX = g.x;
        g.finalY = g.y;
        g.x = g.via.x;
        g.y = g.via.y;
      }
    }
    // ถึงจุดพักแล้ว → เล็งเป้าจริงต่อ
    if (g.via && Math.hypot(g.x - player.x, g.y - player.y) < 26) {
      g.x = g.finalX;
      g.y = g.finalY;
      g.via = null;
      goalStuck = 0;
    }

    // ถึงแล้ว หรือเดินชนกำแพงจนไม่ขยับ 0.5 วิ → เลิก
    goalStuck = before < 0.4 * dt * player.speed ? goalStuck + dt : 0;
    if (d < 8 || goalStuck > 0.5) {
      input.moveGoal = null;
      // ★ เช็คด้วย "ระยะจากขอบวัตถุ" แบบเดียวกับระบบ interact — ถึงจะเดินไปติดขัด
      //   แต่ถ้ายืนใกล้พอแล้วก็เปิดให้เลย (คลิกเดียวจบตามที่ตั้งใจ)
      const target = clickIntent ? OBJECTS.find((o) => o.id === clickIntent) : null;
      if (target && edgeDist(target) < INTERACT_RANGE + 12) panels.open(target.id);
      clickIntent = null;
    }
  }

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
  // ป้ายวิธีเล่นยังโชว์อยู่แล้วเพิ่งรู้ว่าเป็นจอสัมผัส → สลับข้อความให้ตรงอุปกรณ์
  if (input.touch && !hintEl.classList.contains('hidden')
      && hintEl.textContent !== i18n.t('ui.hintTouch')) {
    hintEl.textContent = i18n.t('ui.hintTouch');
  }

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
  camera,         // ★ ให้เทสแปลง world ↔ screen ได้ (scratchpad/clickmove.py)
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
