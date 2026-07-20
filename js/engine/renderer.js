// ============================================
// renderer.js — วาดฉากสตูดิโอ "โพรงในดวงจันทร์" (ธีมแฟนตาซีต่อจาก Title)
// - พื้นหินจันทร์: หลุมอุกกาบาต + แร่ระยิบ + วงเวทกลางห้อง (pre-render ครั้งเดียว)
// - ผนังเหนือสูงแบบ Zelda มีหน้าต่างโค้งเห็นวิวข้างนอก (ดวงจันทร์ชมพู/มังกร/ทะเลสาบ)
// - คริสตัลเรืองแสง 4 มุม + ฝุ่นแสงลอยในห้อง
// - เฟอร์นิเจอร์แฟนตาซี + glow ตอนเข้าใกล้ + ป้าย prompt
// รองรับ devicePixelRatio
// ============================================

const COLORS = {
  space: '#04060f',            // นอกโพรง
  floorLight: '#39466f',       // พื้นหินจันทร์ (กลางห้อง สว่าง)
  floorDark: '#20294a',        // พื้นขอบห้อง
  crater: '#1a2240',
  craterRim: 'rgba(190, 212, 255, 0.16)',
  wallFill: '#151b36',
  wallEdge: 'rgba(150, 185, 255, 0.35)',
  playerGlow: '#4de3ff',
  shadow: 'rgba(0, 0, 0, 0.45)',
  wood: '#413a66',             // ไม้แฟนตาซีโทนม่วง
  woodDark: '#2c2749',
};

const NORTH_WALL_H = 110; // ผนังเหนือวาดสูงมีมิติ — ★ collision ใช้ค่านี้แล้ว (MAP.northWallH)

// ---- HD-2D (Octopath) : tilt-shift + bloom ----
// เบลอขอบบน/ล่างของ "จอ" เหลือคมช่วงกลาง = ภาพดูเป็นไดโอรามาจำลอง
// ★★ 2026-07-20 บทเรียนสำคัญ: tilt-shift แบบ "อิงตำแหน่งบนจอ" ไม่เข้ากับฉากนี้
//   ผนังเหนือ+หน้าต่าง = ของที่สวยที่สุดในห้อง และมัน "อยู่บนสุดของจอเสมอ"
//   → แถบเบลอบนจึงไปลบของดีทิ้งทุกครั้ง (เจ้าของทักว่า "มัว" 3 รอบ ตัวการคืออันนี้)
//   สรุป: ปิดแถบบนถาวร (sharpTop = 0) เหลือเบลอเฉพาะขอบล่างสุดบางๆ พอให้ได้ฟีลไดโอรามา
//   ★ ห้ามเพิ่ม sharpTop กลับมาโดยไม่ถูกสั่ง
const TILT = {
  scale: 0.14,      // บัฟเฟอร์เบลอย่อเหลือ ~1/7 (ยิ่งเล็ก = ยิ่งเบลอ) — ถูกมาก 1 blit
  sharpTop: 0,      // ★ ไม่เบลอด้านบนเลย (หน้าต่างอยู่ตรงนั้น)
  sharpBot: 0.94,   // ★ v3: เบลอเฉพาะ 6% ล่างสุด (เดิม 10%) — แถวล่างมีวัตถุ 5 ชิ้น
                    //   เบลอกว้างกว่านี้ = เจ้าของเห็นเป็น 'ห้องมัว'
  maxAlpha: 0.36,   // ★ v3: 0.90 → 0.55 → 0.36 เป็นใบ้ความลึก ไม่ใช่ลบรายละเอียด
  bloom: 0.09,      // ★ ลดจาก 0.18 — bloom แรงไปทำให้ภาพรวมดูฟุ้ง/ไม่คม
};

// เรขาคณิตหน้าต่าง 3 บาน — ★ ต้องตรงกับ tools/gen_room.py (ภาพอบวิวนิ่งไว้ตามนี้)
const WINDOWS = [470, 815, 1160];
const WIN_W = 130;
const WIN_TOP = 14;
const WIN_BOT = NORTH_WALL_H - 12;
const WIN_ARC = 34;

// ความสูงแถบผนังความละเอียดสูง (world px) — ★ ต้องตรงกับ BAND_H ใน tools/gen_room_v2.py
const WALL_HI_H = 124;

const PART_CAP = 90; // เพดาน particle ในห้อง (ฝุ่นเท้า + ประกาย)

// RNG แบบ seed ล็อก — ลายพื้น/หินเหมือนเดิมทุกครั้งที่โหลด
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// comparator ถาวร (กัน closure ใหม่ทุกเฟรมตอน sort)
function sortByY(a, b) { return a.sortY - b.sortY; }

// (คริสตัลมุมห้อง + โคมไฟลอย ถูกถอดออกแล้ว — เจ้าของสั่ง 2026-07-16
//  ตัวเจนยังอยู่ใน tools/gen_furniture.py ถ้าอยากเอากลับ)

// ★ 2026-07-20: สีขีดบอกหมวดบนป้ายชื่อ (ดู field `cat` ใน objects.js)
//   ใช้สีธีมล้วน — ชาด/คราม/ทอง ไม่เพิ่มสีใหม่ให้ฉูดฉาด
const LABEL_CATS = {
  work: '#e5484d',     // ผลงาน
  about: '#33418a',    // ประวัติ/ทักษะ
  connect: '#d9a441',  // เครือข่าย/ติดต่อ
};

// ขอบยื่นของสไปรต์เฟอร์นิเจอร์รอบกล่อง obj (ซ้าย/บน/ขวา/ล่าง — ตรงกับ Painter ใน gen)
const FURN_PADS = {
  bookshelf: [10, 30, 10, 6],
  desk: [8, 38, 8, 6],
  door: [12, 46, 12, 4],
};

export class Renderer {
  constructor(canvas, sprites = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sprites = sprites; // { player: HTMLImageElement }
    this.dpr = 1;
    this.screenW = 0;
    this.screenH = 0;
    this.roomCanvas = null; // ห้อง pre-render (พื้น+ผนัง+หน้าต่าง)

    // ฝุ่นแสงลอยในโพรง
    const rnd = mulberry32(99);
    this.motes = Array.from({ length: 12 }, () => ({
      x: 120 + rnd() * 1360,
      y: 160 + rnd() * 760,
      r: 2 + rnd() * 3,
      f: 0.3 + rnd() * 0.5,
      p: rnd() * Math.PI * 2,
      amp: 20 + rnd() * 30,
    }));

    // ---- M4: ภาพห้องเจน (แผน A) + ห้องมีชีวิต (แผน B) ----
    // ★ 2026-07-20: ไม่ตั้ง .src ตรงนี้แล้ว — ภาพห้อง/เฟอร์นิเจอร์/โปริ่ง รวม ~490KB
    //   เคยแย่งแบนด์วิดท์กับฉากหลัง Title ทำให้จอแรกค้างหลายวินาที
    //   main.js เรียก preloadRoom() หลัง Title พร้อมแล้ว (ระหว่างนี้มี buildRoom เวกเตอร์รอง)
    this.roomImg = new Image();
    this.fgImg = new Image();
    // ★ แถบผนังเหนือความละเอียดสูง 4x (เฉพาะฉาก v2) — วาดทับภาพฐานเพื่อให้หน้าต่างคม
    //   ภาพฐานอบที่ 3x แต่จอ dpr2 + camera scale 1.6 ต้องการถึง 3.2x
    //   หน้าต่างเป็นรายละเอียดคอนทราสต์สูงที่สุด จึงอัดความละเอียดเฉพาะแถบนี้
    this.wallHiImg = new Image();
    this.fx = null;         // sprite cache เอฟเฟกต์ (สร้างครั้งเดียว)
    this.parts = [];        // particle ในห้อง (ฝุ่นเท้า/ประกายถ้วย)
    this.wake = new Map();  // object id → 0..1 ระดับ "ตื่น" (fade ตอนเข้าใกล้/ออกห่าง)
    this.clickFx = [];      // ★ วงกระเพื่อมตรงจุดที่คลิก (2026-07-20)
    this.prevTime = null;
    this.dustT = 0;
    // (กิมมิคแมวโผล่จากกระติ๊บ ถูกถอดถาวร 2026-07-20 — เจ้าของสั่ง)
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      && !document.documentElement.classList.contains('fx-full');

    // ---- HD-2D: บัฟเฟอร์ฉาก + ชั้นเบลอ tilt-shift (สร้าง/ปรับขนาดใน resize) ----
    this.sceneBuf = document.createElement('canvas');
    this.sceneCtx = this.sceneBuf.getContext('2d');
    this.blurBuf = document.createElement('canvas');
    this.blurCtx = this.blurBuf.getContext('2d');
    this.tiltReady = false; // true หลัง buildTilt() ใน resize()
    this.tiltOn = !this.reduced;

    // แฟรี่ประจำห้อง 4 ตัว (ฟ้า 3 ทอง 1) — บินสุ่ม + หนีผู้เล่นเมื่อเข้าใกล้
    const fr = mulberry32(7);
    this.fairies = Array.from({ length: 4 }, (_, i) => ({
      x: 200 + fr() * 1200, y: 220 + fr() * 560,
      vx: 0, vy: 0,
      tx: 200 + fr() * 1200, ty: 220 + fr() * 560,
      retarget: 1 + fr() * 3,
      gold: i === 3,
      p: fr() * Math.PI * 2,
    }));

    // สไปรต์คุณภาพสูงจาก tools/gen_sprites.py
    this.poringImg = new Image();
    this.furnImgs = {};
    // (trophy ถูกถอดจากห้องแล้ว 2026-07-18 — ไม่ต้องโหลดสไปรต์)
    for (const type of ['bookshelf', 'desk']) {
      this.furnImgs[type] = new Image();
    }
    this.roomLoaded = false;
    this.objPools = new Map(); // สีวัตถุ → sprite วงแสงบนพื้น (สร้างครั้งแรกที่ใช้)
    this.labelWidths = new Map(); // cache ความกว้างข้อความป้ายชื่อ (ต่อ text)
    this.lastObjects = []; // เก็บไว้ให้โปริ่งเลี่ยงกระโดดชนเฟอร์นิเจอร์

    // โปริ่ง 5 ตัว (สีวนฟ้า/ชมพู/ม่วง/ทอง) กระโดดดึ๋งๆ ทั่วห้อง
    // ★ 2026-07-20: 4→9 แล้วเจ้าของสั่งลดครึ่งเหลือ 5 + ทำตัวใหญ่ขึ้นแทน (40–52 → 62–80)
    //   ถอดเงาใต้ตัว + เฟรมหน้าดีใจออกแล้ว, เฟสไม่ตรงกัน = ดูเป็นธรรมชาติ
    const pr = mulberry32(13);
    this.porings = Array.from({ length: 5 }, (_, i) => ({
      i,
      col: i % 4,                               // คอลัมน์ในสไปรต์ชีต (4 สี)
      x: 180 + pr() * 1240, y: 230 + pr() * 640,
      state: 'idle', t: 0, wait: 1.2 + pr() * 5.0,
      sx: 0, sy: 0, tx: 0, ty: 0, dur: 0.5, hopH: 30, z: 0,
      land: 0, face: 1, blink: 2 + pr() * 3, happy: false,
      sz: 62 + pr() * 18,                       // 62–80px (เดิมล็อก 47)
      ph: pr() * Math.PI * 2,                   // เฟสส่วนตัว กันเด้งพร้อมกัน
    }));
  }

  // เริ่มโหลดภาพห้องทั้งชุด — เรียกหลังจอ Title พร้อมแล้ว (main.js)
  // เรียกซ้ำได้ ไม่โหลดซ้ำ
  preloadRoom() {
    if (this.roomLoaded) return;
    this.roomLoaded = true;
    // ★ prototype 2026-07-20: สลับฉากพื้นด้วย ?room=v2 (หรือ localStorage.room='v2')
    //   v1 = Python/gen_room.py (noise ล้วน) · v2 = tools/gen_room_v2.py (จัดองค์ประกอบ+ลานหิน)
    // ★ 2026-07-20: เจ้าของเลือก **v2 เป็น default** แล้ว ("v2 ดีกว่า v1")
    //   สวิตช์ ?room=v1 ยังอยู่ไว้เทียบภาพ — v2 ยังไม่ถูกใจ 100% รอปรับต่อ
    const pick = new URLSearchParams(location.search).get('room')
      || localStorage.getItem('room') || 'v2';
    this.roomVariant = pick === 'v1' ? 'v1' : 'v2';
    this.roomImg.src = this.roomVariant === 'v2'
      ? 'assets/room-base-v2.webp'
      : 'assets/room-base.webp';
    if (this.roomVariant === 'v2') this.wallHiImg.src = 'assets/room-wall-hi.webp';
    this.fgImg.src = 'assets/room-fg.webp';
    this.poringImg.src = 'assets/poring-sheet.webp';
    for (const type of ['bookshelf', 'desk']) {
      this.furnImgs[type].src = `assets/furn-${type}.webp`;
    }
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2); // จำกัดที่ 2 กัน GPU หนักเกิน
    this.screenW = window.innerWidth;
    this.screenH = window.innerHeight;
    this.canvas.width = Math.round(this.screenW * this.dpr);
    this.canvas.height = Math.round(this.screenH * this.dpr);
    this.buildTilt();
  }

  // ---------- HD-2D: เตรียมบัฟเฟอร์ฉาก + ชั้นเบลอ + mask (ทำตอน resize เท่านั้น) ----------
  buildTilt() {
    const w = this.canvas.width, h = this.canvas.height;
    if (!w || !h) return;
    this.sceneBuf.width = w;
    this.sceneBuf.height = h;
    // บัฟเฟอร์เบลอ = ย่อ 1/4 แล้วขยายกลับ → ได้ blur แบบ bilinear ที่แทบไม่กินแรง
    this.blurBuf.width = Math.max(1, Math.round(w * TILT.scale));
    this.blurBuf.height = Math.max(1, Math.round(h * TILT.scale));

    this.tiltReady = true;
  }

  // ---------- pre-render ห้องทั้งใบ (วาดครั้งเดียว แล้ว drawImage ทุกเฟรม) ----------

  buildRoom(map) {
    const c = document.createElement('canvas');
    c.width = map.width;
    c.height = map.height;
    const g = c.getContext('2d');
    const rnd = mulberry32(20260715);

    // พื้น: ไล่สว่างกลางห้อง → มืดขอบ (แสงจากคริสตัล/หน้าต่าง)
    const fg = g.createRadialGradient(
      map.width / 2, map.height * 0.55, 80,
      map.width / 2, map.height * 0.55, map.width * 0.62);
    fg.addColorStop(0, COLORS.floorLight);
    fg.addColorStop(1, COLORS.floorDark);
    g.fillStyle = fg;
    g.fillRect(0, 0, map.width, map.height);

    // หลุมอุกกาบาตบนพื้น
    for (let i = 0; i < 26; i++) {
      const x = 80 + rnd() * (map.width - 160);
      const y = NORTH_WALL_H + 60 + rnd() * (map.height - NORTH_WALL_H - 140);
      const r = 14 + rnd() * 40;
      g.fillStyle = COLORS.crater;
      g.globalAlpha = 0.5 + rnd() * 0.3;
      g.beginPath();
      g.ellipse(x, y, r, r * 0.62, 0, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 0.8;
      g.strokeStyle = COLORS.craterRim;
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(x, y - 2, r, r * 0.62, 0, Math.PI, Math.PI * 2); // ขอบบนรับแสง
      g.stroke();
      g.globalAlpha = 1;
    }

    // แร่ระยิบบนพื้น
    for (let i = 0; i < 220; i++) {
      const x = 40 + rnd() * (map.width - 80);
      const y = NORTH_WALL_H + 30 + rnd() * (map.height - NORTH_WALL_H - 70);
      g.globalAlpha = 0.12 + rnd() * 0.3;
      g.fillStyle = rnd() < 0.3 ? '#ffd9f2' : '#cfe6ff';
      g.fillRect(x, y, 1.6, 1.6);
    }
    g.globalAlpha = 1;

    // วงเวทจางๆ กลางห้อง (จุด spawn)
    g.save();
    g.translate(map.spawn.x, map.spawn.y + 30);
    g.strokeStyle = 'rgba(140, 190, 255, 0.14)';
    g.lineWidth = 3;
    for (const r of [130, 100]) {
      g.beginPath();
      g.ellipse(0, 0, r, r * 0.5, 0, 0, Math.PI * 2);
      g.stroke();
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.fillStyle = 'rgba(140, 190, 255, 0.2)';
      g.beginPath();
      g.arc(Math.cos(a) * 115, Math.sin(a) * 57, 3, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();

    // ผนังซ้าย/ขวา/ล่าง: หินหนา + ขอบโพรงขรุขระ
    const T = map.wallThickness;
    g.fillStyle = COLORS.wallFill;
    g.fillRect(0, 0, T, map.height);
    g.fillRect(map.width - T, 0, T, map.height);
    g.fillRect(0, map.height - T, map.width, T);
    // ปุ่มหินตะปุ่มตามขอบใน (ให้ดูเป็นโพรงธรรมชาติ)
    const bump = (x, y, r) => {
      g.fillStyle = COLORS.wallFill;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    };
    for (let y = 30; y < map.height; y += 26 + rnd() * 40) {
      bump(T, y, 5 + rnd() * 11);
      bump(map.width - T, y + 10, 5 + rnd() * 11);
    }
    for (let x = 30; x < map.width; x += 26 + rnd() * 40) {
      bump(x, map.height - T, 5 + rnd() * 11);
    }

    // ผนังเหนือสูง (แบบเห็นหน้าผนัง) + หน้าต่างโค้ง 3 บาน
    const wg = g.createLinearGradient(0, 0, 0, NORTH_WALL_H);
    wg.addColorStop(0, '#0d1228');
    wg.addColorStop(1, '#1b2342');
    g.fillStyle = wg;
    g.fillRect(0, 0, map.width, NORTH_WALL_H);
    // ลายหินผนัง
    for (let i = 0; i < 40; i++) {
      g.globalAlpha = 0.1 + rnd() * 0.12;
      g.fillStyle = rnd() < 0.5 ? '#26305a' : '#0a0e22';
      const w = 30 + rnd() * 80;
      g.beginPath();
      g.ellipse(rnd() * map.width, rnd() * NORTH_WALL_H, w, 8 + rnd() * 16, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
    // ขอบล่างผนังเหนือรับแสง
    g.fillStyle = 'rgba(160, 195, 255, 0.22)';
    g.fillRect(0, NORTH_WALL_H - 3, map.width, 3);

    this.drawWindow(g, 470, 'bigmoon', rnd);
    this.drawWindow(g, 815, 'pinkmoon', rnd);
    this.drawWindow(g, 1160, 'dragon', rnd);

    // vignette ขอบห้อง
    const vg = g.createRadialGradient(
      map.width / 2, map.height / 2, map.height * 0.35,
      map.width / 2, map.height / 2, map.width * 0.72);
    vg.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vg.addColorStop(1, 'rgba(2, 4, 12, 0.5)');
    g.fillStyle = vg;
    g.fillRect(0, 0, map.width, map.height);

    this.roomCanvas = c;
  }

  // หน้าต่างโค้งบนผนังเหนือ — วิวข้างนอกเชื่อมกับฉาก Title
  drawWindow(g, x, view, rnd) {
    const w = 130;
    const top = 14;
    const bottom = NORTH_WALL_H - 12;
    const arcH = 34;

    g.save();
    // กรอบเรืองแสง
    g.strokeStyle = 'rgba(170, 205, 255, 0.55)';
    g.lineWidth = 5;
    this.windowPath(g, x, top, w, bottom, arcH);
    g.stroke();
    // เจาะช่อง + วิวท้องฟ้า
    this.windowPath(g, x, top, w, bottom, arcH);
    g.clip();
    const sky = g.createLinearGradient(0, top, 0, bottom);
    sky.addColorStop(0, '#0a1230');
    sky.addColorStop(1, '#1d2f60');
    g.fillStyle = sky;
    g.fillRect(x, top, w, bottom - top);
    // ดาว
    for (let i = 0; i < 24; i++) {
      g.globalAlpha = 0.3 + rnd() * 0.6;
      g.fillStyle = '#e8f2ff';
      g.fillRect(x + rnd() * w, top + rnd() * (bottom - top - 20), 1.5, 1.5);
    }
    g.globalAlpha = 1;
    // แนวเขา+น้ำล่างวิว
    g.fillStyle = '#0c1330';
    g.beginPath();
    g.moveTo(x, bottom - 16);
    g.lineTo(x + w * 0.3, bottom - 26);
    g.lineTo(x + w * 0.55, bottom - 14);
    g.lineTo(x + w * 0.8, bottom - 22);
    g.lineTo(x + w, bottom - 12);
    g.lineTo(x + w, bottom);
    g.lineTo(x, bottom);
    g.closePath();
    g.fill();

    if (view === 'bigmoon') {
      g.fillStyle = '#e6f2ff';
      g.shadowColor = '#bcd8ff';
      g.shadowBlur = 18;
      g.beginPath();
      g.arc(x + w * 0.68, top + 34, 20, 0, Math.PI * 2);
      g.fill();
      g.shadowBlur = 0;
    } else if (view === 'pinkmoon') {
      g.fillStyle = '#ffc0da';
      g.shadowColor = '#ff9ecb';
      g.shadowBlur = 16;
      g.beginPath();
      g.arc(x + w * 0.35, top + 30, 13, 0, Math.PI * 2);
      g.fill();
      g.shadowBlur = 0;
      // เงาเสี้ยว
      g.fillStyle = '#131b3c';
      g.beginPath();
      g.arc(x + w * 0.35 + 6, top + 27, 11, 0, Math.PI * 2);
      g.fill();
    } else if (view === 'dragon') {
      // เงามังกรตัวจิ๋วบินผ่าน
      g.fillStyle = 'rgba(10, 15, 30, 0.9)';
      const dx = x + w * 0.45;
      const dy = top + 34;
      g.beginPath();
      g.moveTo(dx - 14, dy);
      g.quadraticCurveTo(dx - 4, dy - 3, dx + 8, dy - 1);
      g.lineTo(dx + 13, dy - 4);
      g.lineTo(dx + 9, dy + 1);
      g.quadraticCurveTo(dx - 4, dy + 3, dx - 14, dy);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(dx, dy - 1);
      g.lineTo(dx - 3, dy - 10);
      g.lineTo(dx + 4, dy - 2);
      g.closePath();
      g.fill();
    }
    g.restore();

    // ขอบหน้าต่างล่าง (หิ้ง)
    g.fillStyle = 'rgba(170, 205, 255, 0.3)';
    g.fillRect(x - 6, bottom, w + 12, 4);
  }

  windowPath(g, x, top, w, bottom, arcH) {
    g.beginPath();
    g.moveTo(x, bottom);
    g.lineTo(x, top + arcH);
    g.quadraticCurveTo(x + w / 2, top - arcH * 0.6, x + w, top + arcH);
    g.lineTo(x + w, bottom);
    g.closePath();
  }

  // ---------- วาดหนึ่งเฟรม ----------

  draw(state) {
    const { camera, map, objects, player, time, waypoint, hover, prompt } = state;

    // dt ภายใน renderer (ใช้กับ particle/wake) — cap เท่า game loop
    const dt = this.prevTime == null ? 0 : Math.min(time - this.prevTime, 0.05);
    this.prevTime = time;

    // ★ HD-2D: วาดโลกลงบัฟเฟอร์ก่อน แล้วค่อย composite (bloom + tilt-shift) ลงจอจริง
    //   ป้ายชื่อ/waypoint วาดทีหลังบนจอจริง → ตัวหนังสือคมเสมอ ไม่โดนเบลอ
    const useTilt = this.tiltOn && this.tiltReady === true;
    const ctx = useTilt ? this.sceneCtx : this.ctx;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = COLORS.space;
    ctx.fillRect(0, 0, this.screenW, this.screenH);

    ctx.save();
    ctx.scale(camera.scale, camera.scale);
    ctx.translate(-camera.left, -camera.top);

    // ฉากหลัก: ภาพเจน 4K (เจน 2x → ย่อเหลือ world size = คมบน retina)
    // ระหว่างรอโหลด/โหลดพลาด ใช้ห้องเวกเตอร์เดิมเป็น fallback
    if (this.roomImg.complete && this.roomImg.naturalWidth > 0) {
      ctx.drawImage(this.roomImg, 0, 0, map.width, map.height);
      // แถบผนังเหนือ 4x วาดทับ (มี alpha ไล่จางที่ขอบล่าง จึงไม่เห็นรอยต่อ)
      const wh = this.wallHiImg;
      if (wh.complete && wh.naturalWidth > 0) {
        ctx.drawImage(wh, 0, 0, map.width, WALL_HI_H);
      }
    } else {
      if (!this.roomCanvas) this.buildRoom(map);
      ctx.drawImage(this.roomCanvas, 0, 0);
    }
    if (!this.fx) this.buildFxSprites();

    this.drawWindowLife(ctx, time);
    this.drawGodRays(ctx, time);
    this.drawMagicRing(ctx, map, time);
    this.drawObjectPools(ctx, objects, time);
    this.drawClickFx(ctx, dt);
    if (!player.hidden) this.drawPlayerLight(ctx, player);
    this.drawMotes(ctx, time);

    // ระดับ "ตื่น" ของวัตถุ — ค่อยๆ สว่างตอนเข้าใกล้ / หรี่ตอนออกห่าง
    for (const o of objects) {
      const w0 = this.wake.get(o.id) ?? 0;
      const target = o === hover ? 1 : 0;
      this.wake.set(o.id, w0 + (target - w0) * Math.min(1, dt * 6));
    }

    // วัตถุ + โปริ่ง + ผู้เล่น เรียงตามแกน Y (top-down depth)
    // ★ perf: ใช้อาร์เรย์ถาวร (this._dr) แทนการสร้าง object ใหม่ ~20 ตัวทุกเฟรม
    this.lastObjects = objects;
    const dr = this._dr || (this._dr = []);
    let n = 0;
    const put = (sortY, kind, obj) => {
      const slot = dr[n] || (dr[n] = { sortY: 0, kind: '', obj: null });
      slot.sortY = sortY; slot.kind = kind; slot.obj = obj;
      n++;
    };
    for (const o of objects) put(o.y + o.h, 'object', o);
    for (const po of this.porings) put(po.y, 'poring', po);
    put(player.y + player.h / 2, 'player', player);
    if (dr.length > n) dr.length = n;
    dr.sort(sortByY);

    for (let i = 0; i < n; i++) {
      const d = dr[i];
      if (d.kind === 'player') this.drawPlayer(ctx, d.obj, time);
      else if (d.kind === 'poring') this.drawPoring(ctx, d.obj, time);
      else this.drawObject(ctx, d.obj, time, this.wake.get(d.obj.id) ?? 0);
    }

    this.updateWorldFx(dt, player, hover, time, map);
    this.drawWorldFx(ctx, time);

    // เพดานถ้ำ/หินย้อยชั้นหน้า (parallax กลับทิศ = ความลึกแบบมองลงโพรง)
    this.drawForeground(ctx, camera, map);

    ctx.restore();

    // ---- HD-2D composite: bloom ฟุ้ง + tilt-shift เบลอขอบบน/ล่าง ----
    if (useTilt) this.composite();

    // ป้ายชื่อ/waypoint วาดบนจอจริงหลัง composite → คมเสมอ อ่านง่าย
    const top = this.ctx;
    top.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    top.save();
    top.scale(camera.scale, camera.scale);
    top.translate(-camera.left, -camera.top);
    this.drawLabels(top, objects, state.labels, hover, prompt, time, camera);
    if (waypoint) this.drawWaypoint(top, waypoint, time);
    top.restore();
  }

  // ฉากที่วาดไว้ใน sceneBuf → จอจริง พร้อม bloom + tilt-shift
  // ทุกขั้นเป็น drawImage ล้วน (GPU blit) ไม่มี ctx.filter / getImageData
  composite() {
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    const bw = this.blurBuf.width, bh = this.blurBuf.height;

    // 1) ย่อฉากลง 1/4 ครั้งเดียว → ใช้ต่อทั้ง bloom และ tilt-shift
    const bc = this.blurCtx;
    bc.setTransform(1, 0, 0, 1, 0, 0);
    bc.globalAlpha = 1;
    bc.globalCompositeOperation = 'source-over';
    bc.imageSmoothingEnabled = true;
    bc.clearRect(0, 0, bw, bh);
    bc.drawImage(this.sceneBuf, 0, 0, bw, bh);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.imageSmoothingEnabled = true;

    // 2) ฉากคมเต็มจอ
    ctx.drawImage(this.sceneBuf, 0, 0);

    // 3) bloom — ซ้อนภาพย่อแบบ additive จางๆ ให้แสงฟุ้งแบบ HD-2D
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = TILT.bloom;
    ctx.drawImage(this.blurBuf, 0, 0, bw, bh, 0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';

    // 4) tilt-shift — ซ้อนชั้นเบลอเฉพาะแถบบน/ล่าง ไล่ alpha เป็นสไลซ์
    //    (ถูกกว่าการทำ mask ทั้งจอ เพราะช่วงกลางที่คมไม่ต้องเขียนซ้ำเลย)
    const SLICES = 10;
    if (TILT.sharpTop > 0) this.tiltBand(ctx, 0, h * TILT.sharpTop, SLICES, true);
    if (TILT.sharpBot < 1) this.tiltBand(ctx, h * TILT.sharpBot, h, SLICES, false);
    ctx.globalAlpha = 1;
  }

  // ซ้อนชั้นเบลอในแถบ [y0,y1] ไล่ความเข้ม — invert=true คือเข้มที่ขอบบน
  tiltBand(ctx, y0, y1, slices, invert) {
    const h = this.canvas.height, w = this.canvas.width;
    const bw = this.blurBuf.width, bh = this.blurBuf.height;
    const span = y1 - y0;
    if (span <= 0) return;
    const step = span / slices;
    for (let i = 0; i < slices; i++) {
      const dy = y0 + step * i;
      // t = 0 ที่ขอบจอ → 1 ตรงรอยต่อกับช่วงคม
      const t = invert ? (i + 0.5) / slices : 1 - (i + 0.5) / slices;
      const a = TILT.maxAlpha * (1 - t) * (1 - t); // โค้งกำลังสอง = รอยต่อเนียน
      if (a < 0.01) continue;
      ctx.globalAlpha = a;
      const sy = (dy / h) * bh;
      const sh = (step / h) * bh;
      ctx.drawImage(this.blurBuf, 0, sy, bw, sh, 0, dy, w, step);
    }
  }

  // ---------- M4: sprite cache เอฟเฟกต์ (สร้างครั้งเดียว — ทุกเฟรมเหลือแค่ drawImage) ----------

  buildFxSprites() {
    const mk = (s) => {
      const c = document.createElement('canvas');
      c.width = c.height = s;
      return [c, c.getContext('2d')];
    };
    const radial = (g2, s, stops) => {
      const gr = g2.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      for (const [t, col2] of stops) gr.addColorStop(t, col2);
      g2.fillStyle = gr;
      g2.fillRect(0, 0, s, s);
    };
    this.fx = {};

    // จุดแสงนุ่ม (ฝุ่นเท้า/ประกาย)
    let [c, g] = mk(64);
    radial(g, 64, [[0, 'rgba(210, 230, 255, 0.9)'], [1, 'rgba(210, 230, 255, 0)']]);
    this.fx.soft = c;

    // แสงรอบตัวผู้เล่น
    [c, g] = mk(384);
    radial(g, 384, [[0, 'rgba(140, 200, 255, 0.34)'], [0.5, 'rgba(120, 170, 255, 0.12)'], [1, 'rgba(120, 170, 255, 0)']]);
    this.fx.light = c;

    // ลำแสงจันทร์จากหน้าต่าง (สี่เหลี่ยมคางหมู gradient — วาดเฉียงด้วย transform)
    const rc = document.createElement('canvas');
    rc.width = 220;
    rc.height = 340;
    const rg = rc.getContext('2d');
    const lg = rg.createLinearGradient(0, 0, 0, 340);
    lg.addColorStop(0, 'rgba(170, 210, 255, 0.4)');
    lg.addColorStop(1, 'rgba(170, 210, 255, 0)');
    rg.fillStyle = lg;
    rg.beginPath();
    rg.moveTo(45, 0);
    rg.lineTo(175, 0);
    rg.lineTo(220, 340);
    rg.lineTo(0, 340);
    rg.closePath();
    rg.fill();
    this.fx.ray = rc;

    // พระจันทร์ใหญ่ (ขาวฟ้า) + ดวงเล็กชมพูเสี้ยว — วิวในหน้าต่าง
    [c, g] = mk(72);
    g.shadowColor = '#bcd8ff';
    g.shadowBlur = 16;
    g.fillStyle = '#e6f2ff';
    g.beginPath();
    g.arc(36, 36, 19, 0, Math.PI * 2);
    g.fill();
    g.shadowBlur = 0;
    g.fillStyle = 'rgba(180, 200, 235, 0.5)'; // หลุมจางๆ
    for (const [hx, hy, hr] of [[30, 28, 4], [44, 40, 3], [34, 45, 2.5]]) {
      g.beginPath();
      g.arc(hx, hy, hr, 0, Math.PI * 2);
      g.fill();
    }
    this.fx.moonBig = c;

    [c, g] = mk(48);
    g.shadowColor = '#ff9ecb';
    g.shadowBlur = 12;
    g.fillStyle = '#ffc0da';
    g.beginPath();
    g.arc(24, 24, 12, 0, Math.PI * 2);
    g.fill();
    g.shadowBlur = 0;
    g.fillStyle = '#131b3c'; // เงาคราสกินเป็นเสี้ยว
    g.beginPath();
    g.arc(29, 21, 10.5, 0, Math.PI * 2);
    g.fill();
    this.fx.moonPink = c;

    // แฟรี่ (ฟ้า/ทอง)
    this.fx.fairy = ['#8df0ff', '#ffd98a'].map((tint) => {
      const [fc, fg2] = mk(48);
      radial(fg2, 48, [[0, tint], [0.25, `${tint}aa`], [1, `${tint}00`]]);
      return fc;
    });

    // วงแหวนรูนหมุน (ซ้อนบนวงเวทที่อบไว้ในพื้น) — วาดเป็นวงกลมแล้วบี้เป็นวงรีตอนใช้
    const rr = document.createElement('canvas');
    rr.width = rr.height = 360;
    const rg2 = rr.getContext('2d');
    rg2.translate(180, 180);
    // ★ v2.2 (เจ้าของสั่ง 2026-07-20): ถอด "วง 2 ข้างนอก" ออก
    //    เดิมมี วงทึบ r=160 + ขีดรูน 12 อัน r≈170 + วงประ r=138 → ดูรก
    //    เหลือวงประวงเดียว = วงเวทบางเบา ไม่แย่งสายตากับตัวละคร
    rg2.strokeStyle = 'rgba(150, 205, 255, 0.9)';
    rg2.lineWidth = 1.8;
    rg2.setLineDash([18, 12]);
    rg2.beginPath();
    rg2.arc(0, 0, 138, 0, Math.PI * 2);
    rg2.stroke();
    rg2.setLineDash([]);
    this.fx.runeRing = rr;

    // ★ perf: glow รอบสไปรต์ผู้เล่น (แทน ctx.shadowBlur ที่เดิมเรียกทุกเฟรม)
    [c, g] = mk(256);
    radial(g, 256, [[0, 'rgba(77, 227, 255, 0.55)'], [0.42, 'rgba(77, 227, 255, 0.18)'], [1, 'rgba(77, 227, 255, 0)']]);
    this.fx.glow = c;

    // ★ perf: จุดฝุ่นแสงลอย (เดิม drawMotes สร้าง createRadialGradient 12 ครั้ง/เฟรม)
    [c, g] = mk(64);
    radial(g, 64, [[0, 'rgba(198, 224, 255, 0.85)'], [0.45, 'rgba(160, 200, 255, 0.28)'], [1, 'rgba(160, 200, 255, 0)']]);
    this.fx.mote = c;
  }

  // ★ perf: halo เรืองแสงตามสีวัตถุ — pre-render ต่อสี แทน shadowBlur ต่อชิ้นต่อเฟรม
  // Canvas2D shadowBlur = blur pass ต่อ 1 draw call; เดิมมี ~30 ครั้ง/เฟรม = คอขวดหลัก
  glowFor(color) {
    if (!this._glows) this._glows = new Map();
    let c = this._glows.get(color);
    if (!c) {
      const S = 256;
      c = document.createElement('canvas');
      c.width = c.height = S;
      const g = c.getContext('2d');
      const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      gr.addColorStop(0, `${color}cc`);
      gr.addColorStop(0.38, `${color}55`);
      gr.addColorStop(1, `${color}00`);
      g.fillStyle = gr;
      g.fillRect(0, 0, S, S);
      this._glows.set(color, c);
    }
    return c;
  }

  // วงแสงสีบนพื้นใต้เฟอร์นิเจอร์ (สร้าง sprite ตามสีวัตถุครั้งแรกที่เจอ)
  poolFor(color) {
    let c = this.objPools.get(color);
    if (!c) {
      c = document.createElement('canvas');
      c.width = c.height = 192;
      const g = c.getContext('2d');
      const gr = g.createRadialGradient(96, 96, 0, 96, 96, 96);
      gr.addColorStop(0, `${color}66`);
      gr.addColorStop(1, `${color}00`);
      g.fillStyle = gr;
      g.fillRect(0, 0, 192, 192);
      this.objPools.set(color, c);
    }
    return c;
  }

  // ★ 2026-07-20: เอฟเฟกต์ตอนคลิก — วงกระเพื่อม 2 วง + กากบาทจุดหมายจางๆ
  //   ให้ผู้เล่นเห็นว่า "คลิกติดแล้ว" ทันที (เจ้าของบอกการควบคุมไม่สมูท = ไม่มี feedback)
  addClickFx(x, y, color = '#bfe3ff') {
    if (this.clickFx.length > 6) this.clickFx.shift();
    this.clickFx.push({ x, y, color, t: 0 });
  }

  drawClickFx(ctx, dt) {
    if (!this.clickFx.length) return;
    ctx.save();
    for (const f of this.clickFx) {
      f.t += dt;
      const p = f.t / 0.55;
      if (p >= 1) continue;
      const a = (1 - p) ** 1.6;
      // วงรีแบนตามมุมกล้อง top-down เอียง (เหมือนวงแสงใต้วัตถุ)
      for (const [d, w] of [[0, 2.2], [0.18, 1.4]]) {
        const q = (p - d) / (1 - d);
        if (q <= 0) continue;
        ctx.globalAlpha = a * (1 - q) * 0.9;
        ctx.strokeStyle = f.color;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, 10 + q * 34, (10 + q * 34) * 0.42, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = a * 0.5;      // จุดกลาง
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.ellipse(f.x, f.y, 3.5, 1.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    this.clickFx = this.clickFx.filter((f) => f.t < 0.55);
    ctx.restore();
  }

  drawObjectPools(ctx, objects, time) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const o of objects) {
      const pulse = this.reduced ? 0.75 : 0.7 + 0.3 * Math.sin(time * 1.2 + o.x * 0.02);
      ctx.globalAlpha = 0.42 * pulse;
      const w = o.w * 1.6;
      ctx.drawImage(this.poolFor(o.color), o.x + o.w / 2 - w / 2, o.y + o.h - w / 4, w, w / 2);
    }
    ctx.restore();
  }

  // วงแหวนรูนหมุนช้าๆ กลางห้อง (บนวงเวทที่อบไว้ในภาพพื้น)
  drawMagicRing(ctx, map, time) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.28 + (this.reduced ? 0 : 0.10 * Math.sin(time * 1.1));
    ctx.translate(map.spawn.x, map.spawn.y + 30);
    ctx.scale(1, 0.5); // มุมมอง top-down
    if (!this.reduced) ctx.rotate(time * 0.22);
    ctx.drawImage(this.fx.runeRing, -152, -152, 304, 304);
    ctx.restore();
  }

  // ---------- M4: หน้าต่างมีชีวิต (พระจันทร์ลอย/มังกรโฉบ/ดาวตก — วาดสดใน clip) ----------

  drawWindowLife(ctx, time) {
    // ใช้ภาพเจนเท่านั้น (fallback เวกเตอร์อบวิวของตัวเองไว้แล้ว)
    if (!(this.roomImg.complete && this.roomImg.naturalWidth > 0)) return;
    const anim = !this.reduced;

    // มังกรบินผ่านหลังหน้าต่างทุก ~40s (พาดผ่านทั้ง 3 บาน ขวา→ซ้าย)
    const tt = time % 40;
    const flying = anim && tt < 8;
    const dgx = 1400 - (tt / 8) * 1080;
    const dgy = 44 + Math.sin(tt * 1.6) * 7;

    for (let i = 0; i < WINDOWS.length; i++) {
      const x = WINDOWS[i];
      ctx.save();
      this.windowPath(ctx, x, WIN_TOP, WIN_W, WIN_BOT, WIN_ARC);
      ctx.clip();

      if (i === 0) {
        const bob = anim ? Math.sin(time * 0.5) * 3 : 0;
        ctx.globalAlpha = 0.92 + (anim ? 0.08 * Math.sin(time * 1.1) : 0);
        ctx.drawImage(this.fx.moonBig, x + WIN_W * 0.68 - 36, WIN_TOP + 34 - 36 + bob);
        ctx.globalAlpha = 1;
      } else if (i === 1) {
        const bob = anim ? Math.sin(time * 0.4 + 1.7) * 2.5 : 0;
        ctx.drawImage(this.fx.moonPink, x + WIN_W * 0.35 - 24, WIN_TOP + 30 - 24 + bob);
      }

      if (flying) this.drawDragonSil(ctx, dgx, dgy, Math.sin(tt * 9));

      // ดาวตกในวิว นานๆ ครั้ง (คนละจังหวะต่อบาน)
      if (anim) {
        const st = (time + i * 4.7) % 13;
        if (st < 0.6) {
          const p = st / 0.6;
          const sx = x + WIN_W * (0.25 + 0.5 * ((i * 0.37) % 1)) + p * 34;
          const sy = WIN_TOP + 12 + p * 26;
          ctx.strokeStyle = `rgba(225, 240, 255, ${0.85 * (1 - p)})`;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(sx - 14, sy - 11);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  // เงามังกรตัวจิ๋ว (ปีกกระพือ) — silhouette เดียวกับสายเลือดมังกรหน้า Title
  drawDragonSil(ctx, dx, dy, flap) {
    ctx.fillStyle = 'rgba(8, 12, 26, 0.92)';
    ctx.beginPath();
    ctx.moveTo(dx - 16, dy);
    ctx.quadraticCurveTo(dx - 4, dy - 3, dx + 9, dy - 1);
    ctx.lineTo(dx + 15, dy - 4);
    ctx.lineTo(dx + 10, dy + 1.5);
    ctx.quadraticCurveTo(dx - 4, dy + 3.5, dx - 16, dy);
    ctx.closePath();
    ctx.fill();
    // ปีกขยับขึ้นลง
    ctx.beginPath();
    ctx.moveTo(dx, dy - 1);
    ctx.lineTo(dx - 4, dy - 4 - 8 * (0.4 + 0.6 * Math.abs(flap)) * Math.sign(flap || 1));
    ctx.lineTo(dx + 5, dy - 2);
    ctx.closePath();
    ctx.fill();
  }

  drawGodRays(ctx, time) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < WINDOWS.length; i++) {
      const alpha = this.reduced ? 0.11 : 0.09 + 0.05 * Math.sin(time * 0.55 + i * 2.1);
      ctx.globalAlpha = Math.max(alpha, 0.04);
      ctx.save();
      ctx.translate(WINDOWS[i] + WIN_W / 2, WIN_BOT);
      ctx.transform(1, 0, 0.10, 1, 0, 0); // เฉียงตามลำแสงที่อบไว้ในภาพพื้น
      ctx.drawImage(this.fx.ray, -(WIN_W + 90) / 2, 0, WIN_W + 90, 330);
      ctx.restore();
    }
    ctx.restore();
  }

  drawPlayerLight(ctx, player) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.55;
    ctx.drawImage(this.fx.light, player.x - 190, player.y - 130, 380, 265);
    ctx.restore();
  }

  // ---------- M4: particle ในห้อง (ฝุ่นเท้า/ประกายถ้วย) + แฟรี่ + จังหวะแมวดำ ----------

  updateWorldFx(dt, player, hover, time, map) {
    if (this.reduced || dt === 0) return;

    // ฝุ่นจันทร์ปลายเท้าตอนเดิน
    this.dustT += dt;
    if (player.moving && !player.hidden && this.dustT > 0.13 && this.parts.length < PART_CAP) {
      this.dustT = 0;
      this.parts.push({
        kind: 'dust',
        x: player.x + (Math.random() - 0.5) * 20,
        y: player.y + player.h / 2 - 2,
        vx: (Math.random() - 0.5) * 26,
        vy: -(6 + Math.random() * 14),
        r: 4 + Math.random() * 4,
        t: 0, life: 0.55,
      });
    }

    // (กิมมิคแมวดำโผล่ตอนยืนนิ่ง 7s ถูกถอดถาวร 2026-07-20 — เจ้าของสั่ง)

    // ประกายดาว/คอนเฟตติพุ่งจากบูทอีเวนต์ตอน "ตื่น" (แทน trophy เดิมที่ถูกถอด)
    if (hover && hover.type === 'event' && (this.wake.get(hover.id) ?? 0) > 0.5
        && this.parts.length < PART_CAP && Math.random() < dt * 7) {
      this.parts.push({
        kind: 'spark',
        x: hover.x + 12 + Math.random() * (hover.w - 24),
        y: hover.y + 10 + Math.random() * (hover.h - 40),
        vx: (Math.random() - 0.5) * 14,
        vy: -(18 + Math.random() * 22),
        r: 3 + Math.random() * 2.5,
        hue: Math.random() < 0.5 ? 20 : 48,
        t: 0, life: 0.9,
      });
    }

    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.t += dt;
      if (p.t >= p.life) {
        this.parts.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'dust') p.vy *= 1 - dt * 2; // ฝุ่นลอยช้าลง
    }

    this.updatePorings(dt, player, time, map);

    // แฟรี่: บินหาเป้าสุ่ม + หนีผู้เล่น
    for (const f of this.fairies) {
      f.retarget -= dt;
      if (f.retarget <= 0) {
        f.retarget = 2.5 + Math.random() * 3;
        f.tx = 150 + Math.random() * (map.width - 300);
        f.ty = 180 + Math.random() * (map.height - 320);
      }
      let ax = (f.tx - f.x) * 0.6;
      let ay = (f.ty - f.y) * 0.6;
      if (!player.hidden) {
        const dx = f.x - player.x;
        const dy = f.y - player.y;
        const d = Math.hypot(dx, dy);
        if (d < 150 && d > 1) {
          ax += (dx / d) * 1000;
          ay += (dy / d) * 1000;
        }
      }
      f.vx += ax * dt;
      f.vy += ay * dt;
      const sp = Math.hypot(f.vx, f.vy);
      const max = 250;
      if (sp > max) {
        f.vx *= max / sp;
        f.vy *= max / sp;
      }
      f.x = Math.min(Math.max(f.x + f.vx * dt, 90), map.width - 90);
      f.y = Math.min(Math.max(f.y + f.vy * dt + Math.sin(time * 3 + f.p) * 14 * dt, NORTH_WALL_H + 40), map.height - 70);
    }
  }

  // ---------- โปริ่ง: สไลม์เจลลี่กระโดดทั่วห้อง (แบบโปริ่ง RO) ----------

  updatePorings(dt, player, time, map) {
    for (const po of this.porings) {
      const near = !player.hidden
        && Math.hypot(player.x - po.x, player.y - po.y) < 120;
      po.happy = near;
      po.blink -= dt;
      if (po.blink < -0.16) po.blink = 2.5 + Math.random() * 3.5; // ติดลบ = กำลังกะพริบ
      if (po.land > 0) po.land -= dt;

      if (po.state === 'idle') {
        po.t += dt;
        if (near) {
          // ดีใจ: หันหาผู้เล่น เด้งอยู่กับที่ + หัวใจลอย
          po.face = player.x >= po.x ? 1 : -1;
          po.z = Math.abs(Math.sin(time * 7 + po.ph)) * 8;
          po.t = 0; // ไม่กระโดดหนีระหว่างเล่นด้วย
          if (this.parts.length < PART_CAP && Math.random() < dt * 1.3) {
            this.parts.push({
              kind: 'heart',
              x: po.x + (Math.random() - 0.5) * 18,
              y: po.y - 50,
              vx: (Math.random() - 0.5) * 8, vy: -30,
              r: 6.5 + Math.random() * 3,
              t: 0, life: 1.2,
            });
          }
        } else {
          po.z = 0;
          if (po.t >= po.wait) this.startHop(po, map);
        }
      } else if (po.state === 'pre') {
        // ย่อตัวเก็บแรงก่อนพุ่ง (anticipation) — ทำให้จังหวะกระโดดดูมีน้ำหนัก
        po.t += dt;
        if (po.t >= 0.14) {
          po.state = 'jump';
          po.t = 0;
        }
      } else {
        // ลอยตามโค้งพาราโบลา + เงายุบตามความสูง
        po.t += dt;
        const k = Math.min(po.t / po.dur, 1);
        po.x = po.sx + (po.tx - po.sx) * k;
        po.y = po.sy + (po.ty - po.sy) * k;
        po.z = po.hopH * 4 * k * (1 - k);
        if (k >= 1) {
          po.state = 'idle';
          po.t = 0;
          po.z = 0;
          po.land = 0.22; // จังหวะแป้กตอนลงพื้น (squash)
          // ★ 2026-07-20: เจ้าของสั่งให้ "ขยับถี่น้อยลง" — 0.7–3.1s → 2.2–7.2s
          po.wait = 2.2 + Math.random() * 5.0;
        }
      }
    }
  }

  // จุด (x,y) ทับวัตถุในห้องไหม (นับ pad รอบ AABB) — ใช้เช็คทั้งจุดลงและตลอดเส้นทาง
  hitsObject(x, y, pad) {
    return this.lastObjects.some((o) =>
      x > o.x - pad && x < o.x + o.w + pad && y > o.y - pad && y < o.y + o.h + pad);
  }

  startHop(po, map) {
    // ★ 2026-07-20 (เจ้าของสั่ง): โปริ่งต้อง "กระโดดข้ามของไม่ได้" แบบมอนในเกม
    //   เดิมเช็คแค่ *จุดลง* → ตัวลอยพาดผ่านบนตู้/โต๊ะได้ ดูเหมือนทะลุของ
    //   ตอนนี้เช็คทั้งเส้นทาง (sample 8 จุด) + ลดระยะกระโดดลง (70–220 → 45–115)
    const PAD = 40; // ครึ่งตัวโปริ่ง (ใหญ่สุด 80) + เผื่ออีกนิด
    // เกิดมาทับของพอดี (ตำแหน่งเริ่มต้นสุ่ม) → ยอมให้ออกได้ ไม่งั้นติดแหง็กตลอดเกม
    const stuck = this.hitsObject(po.x, po.y, PAD);
    for (let tries = 0; tries < 10; tries++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = 45 + Math.random() * 70;
      const tx = Math.min(Math.max(po.x + Math.cos(ang) * dist, 150), map.width - 150);
      const ty = Math.min(Math.max(po.y + Math.sin(ang) * dist, NORTH_WALL_H + 150), map.height - 100);
      if (this.hitsObject(tx, ty, PAD)) continue; // จุดลงทับของ
      // เส้นทางลอยพาดผ่านของหรือเปล่า (ไล่ sample จากจุดเริ่มถึงจุดลง)
      let crosses = false;
      for (let s = 1; s <= 8 && !stuck; s++) {
        const k = s / 8;
        if (this.hitsObject(po.x + (tx - po.x) * k, po.y + (ty - po.y) * k, PAD)) {
          crosses = true;
          break;
        }
      }
      if (crosses) continue;
      po.state = 'pre'; // ย่อตัวก่อน แล้วค่อยพุ่ง (ดู updatePorings)
      po.t = 0;
      po.sx = po.x;
      po.sy = po.y;
      po.tx = tx;
      po.ty = ty;
      po.dur = 0.4 + dist / 480;
      po.hopH = 20 + dist * 0.12;
      po.face = tx >= po.x ? 1 : -1;
      return;
    }
    po.t = 0; // หาที่ลงไม่ได้ก็รอรอบหน้า
  }

  drawPoring(ctx, po, time) {
    const sheet = this.poringImg;
    if (!sheet.complete || !sheet.naturalWidth) return;
    const SZ = po.sz; // ขนาดบนจอ (world px) — สุ่มรายตัวให้ดูไม่โคลนกัน

    // (เงาวงรีใต้ตัวถูกถอดออก 2026-07-20 — เจ้าของบอกดูไม่เป็นธรรมชาติ
    //  ความสูงสื่อด้วย squash & stretch + ขนาดแทน)

    // squash & stretch: ยืดกลางอากาศ / แป้กตอนลงพื้น / วูบวาบตอนนั่งเฉยๆ
    let sqx = 1;
    let sqy = 1;
    if (po.state === 'pre') {
      const k = Math.min(po.t / 0.14, 1);
      sqx = 1 + 0.2 * k; // ย่อแบนเก็บแรง
      sqy = 1 - 0.2 * k;
    } else if (po.state === 'jump') {
      const k = Math.min(po.t / po.dur, 1);
      sqy = 1 + 0.22 * Math.sin(Math.PI * k);
      sqx = 1 / sqy;
    } else if (po.land > 0) {
      const k = (po.land / 0.22) ** 2; // ease-out — คืนตัวนุ่ม ไม่เด้งตัด
      sqx = 1 + 0.30 * k;
      sqy = 1 - 0.30 * k;
    } else if (!this.reduced) {
      const wob = Math.sin(time * 3.2 + po.ph) * 0.035;
      sqx = 1 + wob;
      sqy = 1 - wob;
    }

    // ★ 2026-07-20: ใช้เฉพาะหน้าปกติ + กะพริบตา (แถวล่าง)
    //   "หน้าดีใจ" ตอนผู้เล่นเข้าใกล้ถูกถอดออก — เจ้าของบอกดูแปลก
    const frame = po.blink < 0 ? 1 : 0;
    ctx.save();
    ctx.translate(po.x, po.y - po.z);
    ctx.scale(po.face * sqx, sqy);
    ctx.drawImage(sheet, po.col * 256, frame * 256, 256, 256, -SZ / 2, -SZ, SZ, SZ);
    ctx.restore();
  }

  drawWorldFx(ctx, time) {
    if (this.reduced) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (const p of this.parts) {
      const k = p.t / p.life;
      if (p.kind === 'dust') {
        ctx.globalAlpha = 0.4 * (1 - k);
        const r = p.r * (1 + k * 1.6);
        ctx.drawImage(this.fx.soft, p.x - r, p.y - r, r * 2, r * 2);
      } else if (p.kind === 'heart') {
        // หัวใจชมพูลอยจากโปริ่งตอนดีใจ
        ctx.globalAlpha = 0.9 * (1 - k);
        ctx.fillStyle = '#ff8fc8';
        const s = p.r * (1 + k * 0.35);
        const hx = p.x + Math.sin((p.t + p.x) * 5) * 3;
        const hy = p.y;
        ctx.beginPath();
        ctx.moveTo(hx, hy + s * 0.9);
        ctx.bezierCurveTo(hx - s * 1.3, hy - s * 0.1, hx - s * 0.55, hy - s, hx, hy - s * 0.35);
        ctx.bezierCurveTo(hx + s * 0.55, hy - s, hx + s * 1.3, hy - s * 0.1, hx, hy + s * 0.9);
        ctx.fill();
      } else {
        // ประกายดาว 4 แฉก
        ctx.globalAlpha = 0.9 * (1 - k);
        ctx.fillStyle = `hsl(${p.hue}, 95%, 78%)`;
        const r = p.r * (1 - k * 0.4);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - r * 2);
        ctx.quadraticCurveTo(p.x + r * 0.4, p.y - r * 0.4, p.x + r * 2, p.y);
        ctx.quadraticCurveTo(p.x + r * 0.4, p.y + r * 0.4, p.x, p.y + r * 2);
        ctx.quadraticCurveTo(p.x - r * 0.4, p.y + r * 0.4, p.x - r * 2, p.y);
        ctx.quadraticCurveTo(p.x - r * 0.4, p.y - r * 0.4, p.x, p.y - r * 2);
        ctx.fill();
      }
    }

    for (const f of this.fairies) {
      const flick = 0.65 + 0.35 * Math.sin(time * 9 + f.p);
      const s = 22 + Math.sin(time * 5 + f.p) * 4;
      ctx.globalAlpha = flick;
      ctx.drawImage(this.fx.fairy[f.gold ? 1 : 0], f.x - s / 2, f.y - s / 2, s, s);
    }

    ctx.restore();
  }

  // เพดานถ้ำชั้นหน้า — ขยับสวนทางกล้องเล็กน้อย (ใกล้ตากว่า = เลื่อนไวกว่า)
  drawForeground(ctx, camera, map) {
    const img = this.fgImg;
    if (!img.complete || !img.naturalWidth) return;
    const k = 0.06;
    const s = 1 + k * 2.4;
    const cx = camera.left + this.screenW / (2 * camera.scale);
    const cy = camera.top + this.screenH / (2 * camera.scale);
    const ox = -(cx - map.width / 2) * k - (map.width * (s - 1)) / 2;
    const oy = -(cy - map.height / 2) * k - (map.height * (s - 1)) / 2;
    ctx.drawImage(img, ox, oy, map.width * s, map.height * s);
  }

  // ฝุ่นแสงลอยในโพรง
  drawMotes(ctx, time) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const m of this.motes) {
      const x = m.x + Math.sin(time * m.f + m.p) * m.amp;
      const y = m.y + Math.cos(time * m.f * 0.7 + m.p) * m.amp * 0.6;
      const tw = 0.35 + 0.3 * Math.sin(time * 1.3 + m.p * 3);
      ctx.globalAlpha = tw;
      // ★ perf: เดิมสร้าง createRadialGradient 12 ครั้ง/เฟรม → ใช้สไปรต์แคชแทน
      const r = m.r * 3;
      ctx.drawImage(this.fx.mote, x - r, y - r, r * 2, r * 2);
    }
    ctx.restore();
  }

  // ---------- วัตถุ interact ----------

  drawObject(ctx, obj, time, wake = 0) {
    const pulse = 0.75 + 0.25 * Math.sin(time * 1.8 + obj.x * 0.01);

    // เงาใต้วัตถุ
    ctx.fillStyle = COLORS.shadow;
    ctx.beginPath();
    ctx.ellipse(obj.x + obj.w / 2, obj.y + obj.h, obj.w * 0.55, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // ★ perf 2026-07-20: ฮาโล "เรืองตลอดเวลา" ใช้สไปรต์ pre-render (glowFor)
    //   แทน createRadialGradient + shadowBlur ที่เดิมเรียกทุกชิ้นทุกเฟรม
    //   ผลลัพธ์ภาพเกือบเหมือนเดิม แต่เหลือ drawImage ใบเดียว
    {
      const cx = obj.x + obj.w / 2;
      const cy = obj.y + obj.h / 2;
      const r = Math.max(obj.w, obj.h) * (1.5 + 0.45 * wake) * pulse;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.34 + 0.5 * wake;
      ctx.drawImage(this.glowFor(obj.color), cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
    }

    ctx.save();

    // เฟอร์นิเจอร์สไปรต์เพนต์ (gen_furniture.py) + ชิ้นส่วนไดนามิกวาดทับ
    // ตู้ arcade เจ้าของชอบเวอร์ชัน canvas เดิม — คงไว้
    const spr = this.furnImgs[obj.type];
    if (spr && spr.complete && spr.naturalWidth > 0) {
      const [L, T, R, B] = FURN_PADS[obj.type];
      ctx.drawImage(spr, obj.x - L, obj.y - T, obj.w + L + R, obj.h + T + B);
      switch (obj.type) {
        case 'bookshelf': this.drawFloatBook(ctx, obj, time, wake); break;
        case 'desk': this.drawDeskFx(ctx, obj, time, wake); break;
      }
    } else {
      switch (obj.type) {
        case 'arcade': this.drawArcade(ctx, obj, time, wake); break;
        case 'bookshelf': this.drawBookshelf(ctx, obj, time, wake); break;
        case 'desk': this.drawDesk(ctx, obj, time, wake); break;
        case 'door': this.drawDoor(ctx, obj, time, wake); break;
        case 'youtube': this.drawYoutube(ctx, obj, time, wake); break;
        case 'network': this.drawNetwork(ctx, obj, time, wake); break;
        case 'language': this.drawLanguage(ctx, obj, time, wake); break;
        case 'event': this.drawEventBooth(ctx, obj, time, wake); break;
        case 'other': this.drawOtherWorks(ctx, obj, time, wake); break;
        case 'writing': this.drawWriting(ctx, obj, time, wake); break;
      }
    }

    // เส้นขอบสว่างพิเศษตอน hover
    if (wake > 0.02) {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.globalAlpha = wake;
      ctx.lineWidth = 2;
      this.roundRect(ctx, obj.x - 4, obj.y - 4, obj.w + 8, obj.h + 8, 14);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // ตู้เกมคริสตัล: จอมีเกมจิ๋วเล่นเองอยู่ข้างใน (wake: จอสว่าง + ยานพ่นไฟ)
  drawArcade(ctx, obj, time, wake = 0) {
    const { x, y, w, h } = obj;
    // ตัวตู้
    ctx.fillStyle = '#1c2246';
    this.roundRect(ctx, x, y + 14, w, h - 14, 10);
    ctx.fill();
    ctx.strokeStyle = obj.color;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 2;
    this.roundRect(ctx, x, y + 14, w, h - 14, 10);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // ป้ายหัวโค้ง (marquee)
    ctx.fillStyle = obj.color;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 16);
    ctx.quadraticCurveTo(x + w / 2, y - 10, x + w - 4, y + 16);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    // จอ: อวกาศจิ๋ว + ยานเด้งไปมา (เกมกำลังเดินอยู่)
    const sx = x + 14;
    const sy = y + 26;
    const sw = w - 28;
    const sh = h * 0.4;
    ctx.fillStyle = '#070d22';
    this.roundRect(ctx, sx, sy, sw, sh, 6);
    ctx.fill();
    ctx.save();
    this.roundRect(ctx, sx, sy, sw, sh, 6);
    ctx.clip();
    for (let i = 0; i < 5; i++) {
      const stY = sy + ((time * 26 + i * 23) % sh);
      ctx.fillStyle = 'rgba(210, 230, 255, 0.7)';
      ctx.fillRect(sx + ((i * 37) % sw), stY, 1.6, 1.6);
    }
    const shipX = sx + sw / 2 + Math.sin(time * 2 + obj.x) * sw * 0.26;
    ctx.fillStyle = obj.color;
    ctx.beginPath();
    ctx.moveTo(shipX, sy + sh - 12);
    ctx.lineTo(shipX - 6, sy + sh - 4);
    ctx.lineTo(shipX + 6, sy + sh - 4);
    ctx.closePath();
    ctx.fill();
    if (wake > 0.05) {
      // เข้าใกล้แล้วเกม "ตื่น": จอสว่างขึ้น + ยานพ่นไฟท้าย
      const fl = (0.5 + 0.5 * Math.sin(time * 18)) * wake;
      ctx.fillStyle = `rgba(255, 190, 90, ${0.85 * fl})`;
      ctx.beginPath();
      ctx.moveTo(shipX - 3, sy + sh - 4);
      ctx.lineTo(shipX + 3, sy + sh - 4);
      ctx.lineTo(shipX, sy + sh - 4 + 6 + fl * 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(160, 210, 255, ${0.10 * wake})`;
      ctx.fillRect(sx, sy, sw, sh);
    }
    ctx.restore();
    // แผงคุม: จอยสติ๊ก + ปุ่ม
    const cy2 = y + h * 0.78;
    ctx.strokeStyle = obj.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.3, cy2 + 6);
    ctx.lineTo(x + w * 0.3, cy2 - 6);
    ctx.stroke();
    ctx.fillStyle = obj.color;
    ctx.beginPath();
    ctx.arc(x + w * 0.3, cy2 - 8, 5, 0, Math.PI * 2);
    ctx.arc(x + w * 0.62, cy2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w * 0.8, cy2 - 4, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ชั้นหนังสือไม้: สันหนังสือหลากสี (wake: หนังสือเวทลอยออกมาเปิดอ่าน)
  drawBookshelf(ctx, obj, time = 0, wake = 0) {
    const { x, y, w, h } = obj;
    ctx.fillStyle = COLORS.wood;
    this.roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = obj.color;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    this.roundRect(ctx, x, y, w, h, 8);
    ctx.stroke();
    ctx.globalAlpha = 1;
    const spineColors = ['#4de3ff', '#a06bff', '#ff6bd6', '#ffd24d', '#7dffcf'];
    const rnd = mulberry32(obj.x | 0);
    for (let row = 0; row < 4; row++) {
      const shelfY = y + 14 + row * ((h - 24) / 4);
      const shelfH = (h - 24) / 4 - 8;
      // หนังสือ
      let bx = x + 10;
      while (bx < x + w - 16) {
        const bw = 8 + rnd() * 8;
        const bh = shelfH * (0.7 + rnd() * 0.3);
        ctx.fillStyle = spineColors[(rnd() * spineColors.length) | 0];
        ctx.globalAlpha = 0.8;
        ctx.fillRect(bx, shelfY + shelfH - bh, bw, bh);
        bx += bw + 3;
      }
      ctx.globalAlpha = 1;
      // แผ่นชั้น
      ctx.fillStyle = COLORS.woodDark;
      ctx.fillRect(x + 6, shelfY + shelfH, w - 12, 5);
    }

    this.drawFloatBook(ctx, obj, time, wake);
  }

  // หนังสือเวทลอยออกมากางอ่านตอนเข้าใกล้ (ใช้ทั้งเวอร์ชันสไปรต์และเวกเตอร์)
  drawFloatBook(ctx, obj, time, wake) {
    if (wake <= 0.05) return;
    const bx = obj.x + obj.w + 26;
    const by = obj.y + obj.h * 0.32 - wake * 16 + Math.sin(time * 2.6) * 4;
    const flap = Math.sin(time * 4) * 0.18;
    ctx.save();
    ctx.globalAlpha = wake;
    ctx.translate(bx, by);
    ctx.rotate(Math.sin(time * 1.4) * 0.08);
    ctx.shadowColor = '#4de3ff';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#dcebff';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(side * 12, -8 - flap * side * 18, side * 22, -3 - flap * side * 22);
      ctx.lineTo(side * 20, 5);
      ctx.quadraticCurveTo(side * 10, 1, 0, 6);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // ชิ้นส่วนไดนามิกบนสไปรต์โต๊ะ: คลื่นสัญญาณบนจอ + ไอน้ำชา
  // (ตำแหน่งจอ/แก้วต้องตรงกับที่วาดไว้ใน gen_furniture.py)
  drawDeskFx(ctx, obj, time, wake) {
    const { x, y, w } = obj;
    const cx = x + w / 2;
    ctx.save();
    ctx.strokeStyle = '#4de3ff';
    ctx.shadowColor = '#4de3ff';
    ctx.shadowBlur = 8 + wake * 8;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 28; i++) {
      const px = cx - 32 + i * (64 / 28);
      const py = y + 29 + Math.sin(i * 0.6 + time * 4) * (7 + wake * 5);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
    // ไอน้ำชา (เข้าใกล้ = พวยพุ่งสองสาย)
    ctx.save();
    ctx.strokeStyle = `rgba(220, 235, 255, ${0.5 + wake * 0.3})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const steamX = x + w - 32 + Math.sin(time * 2.4) * 3;
    const rise = 16 + wake * 16;
    ctx.moveTo(steamX, y + 54);
    ctx.quadraticCurveTo(steamX + 4, y + 54 - rise / 2, steamX, y + 54 - rise);
    ctx.stroke();
    if (wake > 0.3) {
      ctx.globalAlpha = (wake - 0.3) / 0.7;
      ctx.beginPath();
      const s2 = steamX - 6 + Math.sin(time * 2.9 + 1) * 3;
      ctx.moveTo(s2, y + 52);
      ctx.quadraticCurveTo(s2 - 4, y + 40, s2, y + 28);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // ชิ้นส่วนไดนามิกบนสไปรต์ประตู: ตราจันทร์เรือง + รูนกะพริบ (ติดครบตอน wake)
  drawDoorFx(ctx, obj, time, wake) {
    const { x, y, w, h } = obj;
    const cx = x + w / 2;
    const cy = y + h * 0.42;
    ctx.save();
    ctx.shadowColor = obj.color;
    ctx.shadowBlur = 14 + 18 * wake;
    ctx.fillStyle = obj.color;
    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a3264'; // สีไม้บานประตูในสไปรต์
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 2, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    for (let i = 0; i < 5; i++) {
      const t = (i + 1) / 6;
      const rx = x + w * t;
      const ry = y + 14 - Math.sin(t * Math.PI) * 34;
      const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(time * 2.5 + i * 1.3));
      ctx.fillStyle = `rgba(255, 160, 225, ${Math.min(1, tw + wake * 0.6)})`;
      ctx.beginPath();
      ctx.arc(rx, ry, 2.5 + wake, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // โต๊ะทำงาน: จอคริสตัล + คีย์บอร์ด + แก้วชา (wake: คลื่นจอแรง + ไอน้ำพวยพุ่ง)
  drawDesk(ctx, obj, time, wake = 0) {
    const { x, y, w, h } = obj;
    ctx.fillStyle = COLORS.wood;
    this.roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = obj.color;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    this.roundRect(ctx, x, y, w, h, 10);
    ctx.stroke();
    ctx.globalAlpha = 1;
    const cx = x + w / 2;
    // จอคริสตัล (หกเหลี่ยมมน) + คลื่นสัญญาณวิ่ง
    ctx.save();
    ctx.shadowColor = '#4de3ff';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#0a1430';
    this.roundRect(ctx, cx - 40, y + 10, 80, 38, 7);
    ctx.fill();
    ctx.strokeStyle = '#4de3ff';
    ctx.lineWidth = 2;
    this.roundRect(ctx, cx - 40, y + 10, 80, 38, 7);
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= 28; i++) {
      const px = cx - 32 + i * (64 / 28);
      const py = y + 29 + Math.sin(i * 0.6 + time * 4) * (7 + wake * 5);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
    // ขาจอ + คีย์บอร์ด + แก้ว
    ctx.fillStyle = COLORS.woodDark;
    ctx.fillRect(cx - 4, y + 48, 8, 8);
    ctx.fillStyle = '#232b4e';
    this.roundRect(ctx, cx - 30, y + 62, 60, 14, 4);
    ctx.fill();
    ctx.fillStyle = '#a06bff';
    this.roundRect(ctx, x + w - 42, y + 58, 20, 22, 5);
    ctx.fill();
    // ไอน้ำชา (เข้าใกล้ = พวยพุ่งขึ้นสองสาย)
    ctx.strokeStyle = `rgba(220, 235, 255, ${0.5 + wake * 0.3})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const steamX = x + w - 32 + Math.sin(time * 2.4) * 3;
    const rise = 16 + wake * 16;
    ctx.moveTo(steamX, y + 54);
    ctx.quadraticCurveTo(steamX + 4, y + 54 - rise / 2, steamX, y + 54 - rise);
    ctx.stroke();
    if (wake > 0.3) {
      ctx.globalAlpha = (wake - 0.3) / 0.7;
      ctx.beginPath();
      const s2 = steamX - 6 + Math.sin(time * 2.9 + 1) * 3;
      ctx.moveTo(s2, y + 52);
      ctx.quadraticCurveTo(s2 - 4, y + 40, s2, y + 28);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // ประตูโค้งคู่: ตราดวงจันทร์ + รูนเรือง (wake: รูนติดครบ + ตราเรืองแรง)
  // ★ v3 2026-07-20: "ชั้นวางม้วนเอกสาร" — จุดดาวน์โหลด Resume (ไม่ใช่ทางออก)
  //   ★ กล่องวัตถุกว้าง 140 สูงแค่ 76 → ของแนวตั้ง (ม้วนแขวน) ตัวอักษรซ้อนกันอ่านไม่ออก
  //     ดีไซน์นี้เลยวางแนวนอน: ชั้นไม้ + ม้วนเอกสาร 3 ม้วน (EN / 履歴書 / 職務経歴書)
  //     + ป้ายวาชิเล็กด้านหลัง · ★ ห้ามใส่เส้นไม้ถี่/แถบเหล็ก (ดูเป็นกรงขัง)
  drawDoor(ctx, obj, time, wake = 0) {
    const { x, y, w, h } = obj;
    const T = this.reduced ? 0 : time;
    const cx = x + w / 2;

    // ---- ป้ายวาชิตั้งด้านหลัง (บอกว่านี่คือ "เอกสาร") ----
    const sgW = w * 0.46;
    const sgH = 22;
    const sgX = cx - sgW / 2;
    const sgY = y + 2;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    this.roundRect(ctx, sgX + 2, sgY + 3, sgW, sgH, 3);
    ctx.fill();
    ctx.fillStyle = '#efe6d2';
    this.roundRect(ctx, sgX, sgY, sgW, sgH, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.75)';
    ctx.lineWidth = 1.2;
    this.roundRect(ctx, sgX, sgY, sgW, sgH, 3);
    ctx.stroke();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 14px "Shippori Mincho", "Noto Serif Thai", serif';
    ctx.fillStyle = `rgba(60, 44, 40, ${0.85 + wake * 0.15})`;
    ctx.fillText('履歴書', cx, sgY + sgH / 2 + 1);
    ctx.restore();

    // ---- ชั้นไม้ (แผ่นบน + ขาสองข้าง) ----
    const deckY = y + h - 20;
    ctx.fillStyle = '#3a2f28';
    ctx.fillRect(x + 12, deckY + 6, 8, 14);
    ctx.fillRect(x + w - 20, deckY + 6, 8, 14);
    ctx.fillStyle = '#5b4839';
    this.roundRect(ctx, x + 4, deckY, w - 8, 9, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 214, 150, 0.32)';
    ctx.fillRect(x + 6, deckY + 0.5, w - 12, 2.5);

    // ---- ม้วนเอกสาร 3 ม้วน วางเอียงพิงชั้น (ยกลอยขึ้นตอนเข้าใกล้) ----
    const rolls = [
      { c: '#8fd7ff', t: 'EN' },
      { c: '#ffd24d', t: '履' },
      { c: '#ff9ec4', t: '職' },
    ];
    for (let i = 0; i < 3; i++) {
      const rx = x + w * (0.26 + i * 0.24);
      const lift = (this.reduced ? 0 : Math.sin(T * 1.6 + i * 2.1) * 2) + wake * 6;
      const ry = deckY - 4 - lift;
      const rw = 15;
      const rh = 30;

      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate((i - 1) * 0.13);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';          // เงาม้วน
      this.roundRect(ctx, -rw / 2 + 2, -rh + 3, rw, rh, 4);
      ctx.fill();
      ctx.fillStyle = '#f2ead7';                     // กระดาษม้วน
      this.roundRect(ctx, -rw / 2, -rh, rw, rh, 4);
      ctx.fill();
      ctx.fillStyle = 'rgba(120, 100, 78, 0.22)';    // เงาข้างในม้วน (ทรงกระบอก)
      ctx.fillRect(-rw / 2 + rw * 0.62, -rh, rw * 0.32, rh);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(-rw / 2 + 2, -rh, 2.5, rh);

      ctx.fillStyle = rolls[i].c;                    // ริบบิ้นคาดม้วน
      ctx.globalAlpha = 0.85 + wake * 0.15;
      ctx.fillRect(-rw / 2, -rh * 0.55, rw, 5);
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#d9a441';                     // หัวแกนทองบน-ล่าง
      ctx.beginPath();
      ctx.ellipse(0, -rh, rw / 2, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(0, 0, rw / 2, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.textAlign = 'center';                      // ตัวอักษรบอกว่าเป็นเอกสารอะไร
      ctx.textBaseline = 'middle';
      ctx.font = '700 8px "Shippori Mincho", "Noto Sans Thai", sans-serif';
      ctx.fillStyle = 'rgba(70, 52, 44, 0.85)';
      ctx.fillText(rolls[i].t, 0, -rh * 0.78);
      ctx.restore();
    }

    // ---- แสงอุ่นส่องชั้นวาง (เข้าใกล้แล้วสว่างขึ้น) ----
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.13 + wake * 0.27;
    ctx.drawImage(this.glowFor(obj.color), cx - w * 0.65, y - 6, w * 1.3, h * 1.2);
    ctx.restore();
  }

  // จอ YouTube (ช่อง NPC Gatip) — บิลบอร์ดจอโค้งบนขาตั้ง + ปุ่ม play แดงเรืองแสง
  drawYoutube(ctx, obj, time, wake = 0) {
    const { x, y, w, h } = obj;
    const pulse = 0.75 + 0.25 * Math.sin(time * 2.2);
    const scrH = h * 0.72;

    // ขาตั้งโลหะสองข้าง
    ctx.fillStyle = '#1a2038';
    ctx.fillRect(x + w * 0.14, y + scrH - 4, w * 0.07, h - scrH + 4);
    ctx.fillRect(x + w * 0.79, y + scrH - 4, w * 0.07, h - scrH + 4);

    // ตัวจอ (กระจกเข้ม) + กรอบสีแดงเรือง
    ctx.fillStyle = '#0d1122';
    this.roundRect(ctx, x, y, w, scrH, 10);
    ctx.fill();
    ctx.strokeStyle = obj.color;
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, x, y, w, scrH, 10);
    ctx.stroke();

    // แสงในจอหายใจ (เข้าใกล้ = สว่างขึ้น)
    const g = ctx.createLinearGradient(x, y, x, y + scrH);
    g.addColorStop(0, `rgba(255, 77, 77, ${0.10 + 0.16 * wake})`);
    g.addColorStop(1, 'rgba(255, 77, 77, 0.02)');
    ctx.fillStyle = g;
    this.roundRect(ctx, x + 3, y + 3, w - 6, scrH - 6, 8);
    ctx.fill();

    // โลโก้ play แดงกลางจอ (ทรงแคปซูล YouTube) + สามเหลี่ยมขาว
    const cx = x + w / 2;
    const cy = y + scrH / 2;
    ctx.save();
    ctx.shadowColor = '#ff2244';
    ctx.shadowBlur = (14 + 18 * wake) * pulse;
    ctx.fillStyle = '#ff0033';
    this.roundRect(ctx, cx - 24, cy - 15, 48, 30, 10);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 8);
    ctx.lineTo(cx + 10, cy);
    ctx.lineTo(cx - 6, cy + 8);
    ctx.closePath();
    ctx.fill();

    // แถบ progress ล่างจอ วิ่งวนช้าๆ = จอ "กำลังเล่น"
    const prog = (time * 0.12) % 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(x + 8, y + scrH - 9, w - 16, 3);
    ctx.fillStyle = '#ff0033';
    ctx.fillRect(x + 8, y + scrH - 9, (w - 16) * prog, 3);
  }

  // โฮโลแกรมเครือข่าย — แท่นฉายแสง + กราฟโหนดโคจรเชื่อมเส้นถึงกัน (เพจ/สื่อ/อินฟลูที่รู้จัก)
  drawNetwork(ctx, obj, time, wake = 0) {
    const { x, y, w, h } = obj;
    const cx = x + w / 2;
    const cy = y + h * 0.42;
    const T = this.reduced ? 0 : time;

    // แท่นฉาย
    ctx.fillStyle = '#1a2038';
    this.roundRect(ctx, x + w * 0.2, y + h * 0.82, w * 0.6, h * 0.16, 6);
    ctx.fill();
    ctx.strokeStyle = obj.color;
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, x + w * 0.2, y + h * 0.82, w * 0.6, h * 0.16, 6);
    ctx.stroke();
    // ลำแสงฉายขึ้น
    const beam = ctx.createLinearGradient(0, y + h * 0.82, 0, y);
    beam.addColorStop(0, 'rgba(125, 255, 168, 0.28)');
    beam.addColorStop(1, 'rgba(125, 255, 168, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.32, y + h * 0.84);
    ctx.lineTo(x + w * 0.68, y + h * 0.84);
    ctx.lineTo(x + w * 0.92, y);
    ctx.lineTo(x + w * 0.08, y);
    ctx.closePath();
    ctx.fill();

    // โหนดกลาง + 5 โหนดโคจร (หมุนช้า เชื่อมเส้นถึงกัน = "คอนเนกชัน")
    const nodes = [];
    for (let i = 0; i < 5; i++) {
      const a = T * 0.5 + (i * Math.PI * 2) / 5;
      const rx = w * 0.36;
      const ry = h * 0.22;
      nodes.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry * 0.9 - Math.sin(a * 2) * 3]);
    }
    ctx.strokeStyle = `rgba(125, 255, 168, ${0.35 + 0.3 * wake})`;
    ctx.lineWidth = 1;
    for (const [nx, ny] of nodes) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(nx, ny);
      ctx.stroke();
    }
    ctx.save();
    ctx.shadowColor = obj.color;
    ctx.shadowBlur = 10 + 12 * wake;
    ctx.fillStyle = '#c7ffd9';
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = obj.color;
    for (const [nx, ny] of nodes) {
      ctx.beginPath();
      ctx.arc(nx, ny, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ศิลาจารึก 3 ภาษา — หินจันทร์ตั้ง สลักอักษร ก・あ・A เรืองแสงคนละสี
  // (แทนหลอดภาษาที่แยกออกมาจากตู้ trophy — เจ้าของสั่ง 2026-07-18)
  drawLanguage(ctx, obj, time, wake = 0) {
    const { x, y, w, h } = obj;
    const cx = x + w / 2;
    const T = this.reduced ? 0 : time;

    // แท่นฐานหิน
    ctx.fillStyle = '#1a2038';
    this.roundRect(ctx, x + 4, y + h - 18, w - 8, 18, 5);
    ctx.fill();

    // ตัวศิลา: ทรงหินตั้งหัวโค้ง ขอบขรุขระเล็กน้อย
    ctx.fillStyle = '#2c3358';
    ctx.beginPath();
    ctx.moveTo(x + 10, y + h - 14);
    ctx.lineTo(x + 6, y + h * 0.42);
    ctx.quadraticCurveTo(x + 8, y + 12, cx, y + 4);
    ctx.quadraticCurveTo(x + w - 8, y + 12, x + w - 6, y + h * 0.42);
    ctx.lineTo(x + w - 10, y + h - 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = obj.color;
    ctx.globalAlpha = 0.65;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
    // ไฮไลต์รับแสงฝั่งซ้าย
    ctx.strokeStyle = 'rgba(210, 228, 255, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 11, y + h * 0.7);
    ctx.quadraticCurveTo(x + 11, y + 20, cx - 6, y + 10);
    ctx.stroke();

    // อักษร 3 ภาษาเรืองแสง — ไทยทอง / ญี่ปุ่นชาด / อังกฤษฟ้า (กะพริบไล่จังหวะกัน)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 24px "Shippori Mincho", "Noto Serif Thai", serif';
    const glyphs = [
      ['ก', '#ffd24d', 0],
      ['あ', '#ff7a80', 1.1],
      ['A', '#8fd7ff', 2.2],
    ];
    glyphs.forEach(([ch, col, ph], i) => {
      const gy = y + h * 0.24 + i * h * 0.24;
      const tw = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(T * 1.8 + ph));
      ctx.save();
      ctx.shadowColor = col;
      ctx.shadowBlur = 10 + 14 * Math.max(tw, wake);
      ctx.fillStyle = col;
      ctx.globalAlpha = Math.min(1, 0.55 + 0.45 * tw + wake * 0.4);
      ctx.fillText(ch, cx, gy);
      ctx.restore();
    });

    // เข้าใกล้: อักษรจิ๋วลอยออกจากศิลา (วาดสดแบบเบาๆ ไม่ใช้ particle system)
    if (wake > 0.1 && !this.reduced) {
      ctx.textAlign = 'center';
      ctx.font = '600 11px "Noto Sans Thai", "Noto Sans JP", sans-serif';
      const floats = ['ん', 'ไ', 'B', 'く', 'ะ'];
      floats.forEach((ch, i) => {
        const p = ((T * 0.35 + i * 0.2) % 1);
        const fx = cx + Math.sin(i * 2.4 + T) * (w * 0.5 + 8);
        const fy = y + h - p * (h + 26);
        ctx.globalAlpha = wake * Math.sin(Math.PI * p) * 0.8;
        ctx.fillStyle = ['#ffd24d', '#ff7a80', '#8fd7ff'][i % 3];
        ctx.fillText(ch, fx, fy);
      });
      ctx.globalAlpha = 1;
    }
  }

  // ตู้เก็บแฟ้ม "งานอื่นๆ" (Accenture / Pasona) — โซนใหม่ 2026-07-20
  // ทรงตู้ลิ้นชักไม้ 3 ชั้น + แฟ้มเรืองแสงโผล่จากลิ้นชักบน + ตรา 他 (อื่นๆ)
  // ★ v2 2026-07-20: ตู้ลิ้นชักไม้แบบ "ทันสุ" (箪笥) — ของเดิมเป็นกล่องม่วงแบนๆ
  //   เจ้าของบอกไม่สวย · ตัวใหม่: ไม้เข้ม 2 โทน + ลายเสี้ยน + ลิ้นชักลึกมีเงา
  //   + ห่วงจับทองเหลือง + ลิ้นชักบนเปิดโชว์แฟ้ม + ป้ายไม้แขวน 他
  drawOtherWorks(ctx, obj, time, wake = 0) {
    const { x, y, w, h } = obj;
    const T = this.reduced ? 0 : time;

    // โครงตู้ + ขอบบนหนา (ให้ดูเป็นเฟอร์นิเจอร์มีความหนา ไม่ใช่สี่เหลี่ยมแบน)
    ctx.fillStyle = '#3a2f28';
    this.roundRect(ctx, x, y + 6, w, h - 6, 6);
    ctx.fill();
    ctx.fillStyle = '#4a3b31';                       // หน้าไม้สว่างกว่าตัวตู้
    this.roundRect(ctx, x + 3, y + 9, w - 6, h - 12, 5);
    ctx.fill();
    ctx.fillStyle = '#5b4839';                       // แผ่นท็อป
    this.roundRect(ctx, x - 3, y, w + 6, 11, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 214, 150, 0.30)';     // แสงกระทบขอบบน
    ctx.fillRect(x - 3, y, w + 6, 2.5);

    // ลายเสี้ยนไม้แนวตั้งจางๆ
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = '#1d1712';
    ctx.lineWidth = 1;
    for (let i = 1; i < 7; i++) {
      const gx = x + 6 + (i * (w - 12)) / 7;
      ctx.beginPath();
      ctx.moveTo(gx, y + 12);
      ctx.lineTo(gx + Math.sin(i * 2.3) * 2, y + h - 6);
      ctx.stroke();
    }
    ctx.restore();

    // ลิ้นชัก 3 ชั้น (ช่องลึก + หน้าลิ้นชักนูน + ห่วงจับทองเหลือง)
    const top = y + 16;
    const dh = (h - 26) / 3;
    for (let i = 0; i < 3; i++) {
      const dy = top + i * dh;
      ctx.fillStyle = '#241c18';                     // ช่องลึก (เงาใน)
      this.roundRect(ctx, x + 8, dy, w - 16, dh - 5, 3);
      ctx.fill();
      ctx.fillStyle = i === 0 ? '#6b543f' : '#5c4938'; // หน้าลิ้นชัก
      this.roundRect(ctx, x + 9, dy + 1, w - 18, dh - 8, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 220, 170, 0.22)';   // ไฮไลต์ขอบบนลิ้นชัก
      ctx.fillRect(x + 10, dy + 1.5, w - 20, 1.5);

      // ห่วงจับทองเหลือง + แผ่นรอง
      const hx = x + w / 2;
      const hy = dy + (dh - 8) / 2 + 2;
      ctx.fillStyle = 'rgba(217, 164, 65, 0.9)';
      this.roundRect(ctx, hx - 9, hy - 4, 18, 5, 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(240, 200, 120, ${0.85 + wake * 0.15})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hx, hy + 3, 5, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }

    // แฟ้มโผล่จากลิ้นชักบนสุด — ลอยขึ้นลงเบาๆ (เข้าใกล้แล้วยกสูงขึ้น)
    const lift = 5 + Math.sin(T * 1.6) * 2 + wake * 9;
    const fy = y + 12 - lift;
    const tabs = ['#c9a4ff', '#8fd7ff', '#ffd24d'];
    for (let i = 0; i < 3; i++) {
      const fx2 = x + 18 + i * 21;
      ctx.fillStyle = 'rgba(20, 16, 14, 0.35)';      // เงาแฟ้มบนหน้าตู้
      this.roundRect(ctx, fx2 + 2, fy - i * 3 + 3, 18, 22, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(245, 239, 226, 0.96)';
      this.roundRect(ctx, fx2, fy - i * 3, 18, 22, 3);
      ctx.fill();
      ctx.fillStyle = tabs[i];
      ctx.globalAlpha = 0.6 + wake * 0.4;
      ctx.fillRect(fx2 + 2, fy - i * 3 + 3, 14, 3);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(90, 80, 70, 0.35)';    // เส้นบรรทัดในแฟ้ม
      ctx.lineWidth = 1;
      for (let k = 0; k < 2; k++) {
        ctx.beginPath();
        ctx.moveTo(fx2 + 3, fy - i * 3 + 11 + k * 4);
        ctx.lineTo(fx2 + 15, fy - i * 3 + 11 + k * 4);
        ctx.stroke();
      }
    }

    // ป้ายไม้แขวนข้างตู้ (木札) เขียน 他 — แกว่งเบาๆ
    const tagX = x + w - 6;
    const tagY = y + h * 0.62;
    const swing = Math.sin(T * 1.3) * 0.06;
    ctx.save();
    ctx.translate(tagX, tagY - 12);
    ctx.rotate(swing);
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.8)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 8);
    ctx.stroke();
    ctx.fillStyle = '#efe3c8';
    this.roundRect(ctx, -9, 8, 18, 24, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(140, 105, 55, 0.7)';
    this.roundRect(ctx, -9, 8, 18, 24, 3);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 15px "Shippori Mincho", "Noto Serif Thai", serif';
    ctx.fillStyle = `rgba(120, 60, 45, ${0.75 + wake * 0.25})`;
    ctx.fillText('他', 0, 21);
    ctx.restore();
  }

  // ★ v2 2026-07-20: ยาไต (屋台) ร้านงานเทศกาลเต็มตัว — ของเดิมเจ้าของบอกไม่สวย
  //   ตัวใหม่: เสาไม้มีข้อต่อ + หลังคาริ้วมีเงา/ชายหยัก + โคมกระดาษแดง 2 ใบแกว่ง
  //   + โนเรน (ผ้าม่านสั้น) หน้าเคาน์เตอร์ + แสงอุ่นกองบนเคาน์เตอร์ + ธงราว
  drawEventBooth(ctx, obj, time, wake = 0) {
    const { x, y, w, h } = obj;
    const T = this.reduced ? 0 : time;
    const roofY = y + 30;
    const roofH = 20;
    const counterY = y + h * 0.60;

    // ---- เสาไม้ 2 ข้าง (มีด้านมืด/ด้านสว่าง = มีความหนา) ----
    for (const px of [x + 7, x + w - 14]) {
      ctx.fillStyle = '#4a3b31';
      ctx.fillRect(px, roofY + roofH - 6, 8, y + h - (roofY + roofH) + 4);
      ctx.fillStyle = 'rgba(255, 214, 150, 0.22)';
      ctx.fillRect(px, roofY + roofH - 6, 2.5, y + h - (roofY + roofH) + 4);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';         // ข้อต่อไม้
      ctx.fillRect(px, counterY - 6, 8, 2);
    }

    // ---- เคาน์เตอร์ ----
    ctx.fillStyle = '#3a2f28';
    this.roundRect(ctx, x + 4, counterY, w - 8, y + h - counterY, 5);
    ctx.fill();
    ctx.fillStyle = '#5b4839';                       // แผ่นท็อปเคาน์เตอร์
    this.roundRect(ctx, x, counterY - 5, w, 10, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 214, 150, 0.28)';
    ctx.fillRect(x, counterY - 5, w, 2.5);

    // แสงอุ่นกองบนเคาน์เตอร์ (จากโคม) — แรงขึ้นตอนเข้าใกล้
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.16 + wake * 0.22;
    ctx.drawImage(this.glowFor('#ffb45a'), x - 6, counterY - 34, w + 12, 62);
    ctx.restore();

    // โนเรน (ผ้าม่านสั้น) หน้าเคาน์เตอร์ — ผ้าคราม 3 ผืน มีรอยผ่า + ตรา 祭
    const nY = counterY + 6;
    const nH = (y + h) - nY - 4;
    for (let i = 0; i < 3; i++) {
      const nx = x + 10 + i * ((w - 20) / 3);
      const nw = (w - 20) / 3 - 2.5;
      ctx.fillStyle = i === 1 ? '#20305e' : '#1b2950';
      ctx.fillRect(nx, nY, nw, nH);
      ctx.fillStyle = 'rgba(210, 228, 255, 0.14)';   // ไฮไลต์ผ้า
      ctx.fillRect(nx, nY, nw, 2);
    }
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 19px "Shippori Mincho", serif';
    ctx.fillStyle = `rgba(245, 239, 226, ${0.85 + wake * 0.15})`;
    ctx.fillText('祭', x + w / 2, nY + nH * 0.52);
    ctx.restore();

    // ---- หลังคาผ้าริ้ว ชาดสลับวาชิ ----
    const stripes = 7;
    const sw = w / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#d8434a' : '#f2e9d8';
      ctx.fillRect(x + i * sw, roofY, sw + 1, roofH - 5);
      ctx.beginPath();                                // ชายหยักครึ่งวงกลม
      ctx.arc(x + (i + 0.5) * sw, roofY + roofH - 5, sw / 2, 0, Math.PI);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';            // เงาใต้ชายผ้า = ผ้ามีความหนา
    ctx.fillRect(x, roofY + roofH - 7, w, 2);
    ctx.fillStyle = 'rgba(255, 235, 205, 0.35)';      // แสงบนสันหลังคา
    ctx.fillRect(x, roofY, w, 2.5);

    // คานสันหลังคา + ธงยอด
    ctx.fillStyle = '#5b4839';
    this.roundRect(ctx, x - 3, roofY - 6, w + 6, 8, 2);
    ctx.fill();
    const flagWave = Math.sin(T * 4) * 4;
    ctx.strokeStyle = '#5b4839';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, roofY - 30);
    ctx.lineTo(x + w / 2, roofY - 4);
    ctx.stroke();
    ctx.fillStyle = '#ffd24d';
    ctx.beginPath();
    ctx.moveTo(x + w / 2, roofY - 28);
    ctx.quadraticCurveTo(x + w / 2 + 12, roofY - 24 + flagWave * 0.4,
                         x + w / 2 + 21, roofY - 20 + flagWave);
    ctx.lineTo(x + w / 2, roofY - 13);
    ctx.closePath();
    ctx.fill();

    // ---- โคมกระดาษแดง 2 ใบ ห้อยใต้ชายหลังคา (แกว่งคนละจังหวะ) ----
    const drawLantern = (lx, ly, r, phase) => {
      const sway = Math.sin(T * 1.8 + phase) * 0.07;
      ctx.save();
      ctx.translate(lx, ly - r - 6);
      ctx.rotate(sway);
      ctx.strokeStyle = 'rgba(90, 72, 57, 0.9)';      // เชือกแขวน
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 6);
      ctx.stroke();
      ctx.fillStyle = '#3a2f28';                      // ฝาบน/ล่าง
      ctx.fillRect(-r * 0.42, 6, r * 0.84, 3);
      ctx.save();                                     // ตัวโคมเรืองแสง
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.5 + wake * 0.4;
      ctx.drawImage(this.glowFor('#ff6a4a'), -r * 2.2, 6 - r * 0.8, r * 4.4, r * 4.4);
      ctx.restore();
      ctx.fillStyle = '#e5484d';
      ctx.beginPath();
      ctx.ellipse(0, 9 + r, r * 0.78, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 226, 190, 0.55)';  // ซี่โครงกระดาษ
      ctx.lineWidth = 0.9;
      for (const off of [-0.5, 0, 0.5]) {
        ctx.beginPath();
        ctx.moveTo(off * r * 0.9, 9 + r * 0.12);
        ctx.quadraticCurveTo(off * r * 1.15, 9 + r, off * r * 0.9, 9 + r * 1.88);
        ctx.stroke();
      }
      ctx.fillStyle = '#3a2f28';
      ctx.fillRect(-r * 0.42, 9 + r * 1.95, r * 0.84, 3);
      ctx.restore();
    };
    drawLantern(x + 20, roofY + roofH + 16, 9, 0);
    drawLantern(x + w - 20, roofY + roofH + 16, 9, 1.7);

    // ---- ธงราวสามเหลี่ยมพาดหน้าบูท ----
    const gy0 = roofY + roofH + 6;
    ctx.strokeStyle = 'rgba(245, 239, 226, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x + 10, gy0);
    ctx.quadraticCurveTo(x + w / 2, gy0 + 11, x + w - 10, gy0);
    ctx.stroke();
    const pennants = 5;
    for (let i = 0; i < pennants; i++) {
      const t = (i + 0.5) / pennants;
      const px = x + 10 + t * (w - 20);
      const py = gy0 + Math.sin(Math.PI * t) * 10;
      const sway = Math.sin(T * 3 + i) * 2;
      ctx.fillStyle = ['#4de3ff', '#ffd24d', '#ff6bd6', '#7dffa8', '#ff9d4d'][i];
      ctx.beginPath();
      ctx.moveTo(px - 5, py);
      ctx.lineTo(px + 5, py);
      ctx.lineTo(px + sway * 0.4, py + 10);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ★ โซนใหม่ 2026-07-20 รอบ 7: โต๊ะเขียนต่ำ (文机) — งานเขียนนิยายเว็บ
  //   ต้นฉบับกองบนโต๊ะ + เล่มเปิดค้างมีบรรทัดหมึก + ปากกาหมึกซึม + หน้ากระดาษปลิว
  drawWriting(ctx, obj, time, wake = 0) {
    const { x, y, w, h } = obj;
    const T = this.reduced ? 0 : time;
    const deckY = y + h * 0.52;

    // ---- ขาโต๊ะ + แผ่นท็อป (ทรงโต๊ะญี่ปุ่นเตี้ย) ----
    ctx.fillStyle = '#3a2f28';
    ctx.fillRect(x + 10, deckY + 8, 9, h - (deckY - y) - 8);
    ctx.fillRect(x + w - 19, deckY + 8, 9, h - (deckY - y) - 8);
    ctx.fillStyle = '#5b4839';
    this.roundRect(ctx, x, deckY, w, 11, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 214, 150, 0.32)';
    ctx.fillRect(x + 3, deckY + 0.5, w - 6, 2.5);

    // ---- เล่มเปิดค้างกลางโต๊ะ (หน้าซ้าย-ขวา + สันกลาง + บรรทัดหมึก) ----
    const bw = w * 0.62;
    const bh = 26;
    const bx = x + (w - bw) / 2;
    const by = deckY - bh + 2;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.roundRect(ctx, bx + 2, by + 3, bw, bh, 2);
    ctx.fill();
    for (const sgn of [-1, 1]) {                   // หน้ากระดาษ 2 ฝั่ง เอียงเข้าหาสัน
      ctx.save();
      ctx.translate(x + w / 2, by + bh);
      ctx.transform(1, 0, sgn * 0.06, 1, 0, 0);
      ctx.fillStyle = '#f4ecd9';
      ctx.fillRect(sgn < 0 ? -bw / 2 : 0, -bh, bw / 2, bh);
      ctx.strokeStyle = 'rgba(70, 55, 48, 0.35)'; // บรรทัดหมึก
      ctx.lineWidth = 0.9;
      for (let i = 0; i < 4; i++) {
        const ly = -bh + 6 + i * 5;
        ctx.beginPath();
        ctx.moveTo(sgn < 0 ? -bw / 2 + 4 : 5, ly);
        ctx.lineTo(sgn < 0 ? -5 : bw / 2 - 4, ly);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.strokeStyle = 'rgba(90, 72, 57, 0.75)';    // สันกลาง
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, by);
    ctx.lineTo(x + w / 2, by + bh);
    ctx.stroke();

    // ---- ปึกต้นฉบับข้างซ้าย + ปากกาหมึกซึมวางพาด ----
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i % 2 ? '#e8dfc9' : '#f4ecd9';
      this.roundRect(ctx, x + 8 + i * 1.5, deckY - 8 - i * 3, 22, 4, 1);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(x + w - 26, deckY - 6);
    ctx.rotate(-0.42);
    ctx.fillStyle = '#241c2e';
    this.roundRect(ctx, 0, 0, 22, 4, 2);
    ctx.fill();
    ctx.fillStyle = '#d9a441';                     // ปลายปากกาทอง
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(28, 2);
    ctx.lineTo(22, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // ---- หน้ากระดาษปลิวลอยเหนือโต๊ะ (เข้าใกล้แล้วลอยสูง/ถี่ขึ้น) ----
    for (let i = 0; i < 3; i++) {
      const ph = T * 0.7 + i * 2.1;
      const px = x + w * (0.3 + 0.2 * i) + Math.sin(ph) * 9;
      const py = by - 12 - i * 11 - (this.reduced ? 0 : Math.sin(ph * 1.3) * 3) - wake * 7;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(Math.sin(ph) * 0.35);
      ctx.globalAlpha = 0.55 + wake * 0.45;
      ctx.fillStyle = '#f7f0df';
      this.roundRect(ctx, -6, -8, 12, 16, 1.5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(90, 75, 65, 0.4)';
      ctx.lineWidth = 0.8;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(-4, -4 + k * 4);
        ctx.lineTo(4, -4 + k * 4);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // ---- โคมอ่านหนังสือเล็กๆ สาดลงหน้ากระดาษ ----
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.16 + wake * 0.26;
    ctx.drawImage(this.glowFor(obj.color), x + w / 2 - w * 0.7, by - 26, w * 1.4, h * 1.1);
    ctx.restore();
  }

  // ป้ายชื่อลอยเหนือวัตถุกดได้ "ทุกชิ้นตลอดเวลา" — เห็นปุ๊บรู้เลยว่าอะไรกดได้/คืออะไร
  // เข้าใกล้ (wake ขึ้น) = ป้ายสว่าง ขยาย และต่อท้ายวิธีกด "· กด E เพื่อดู"
  drawLabels(ctx, objects, labels, hover, prompt, time, camera) {
    if (!labels) return;
    // ★ 2026-07-20: ขอบเขตที่มองเห็นจริง (world px) — ใช้หนีบป้ายไม่ให้ล้นขอบจอ
    //   วัตถุชิดผนังซ้าย/ขวา (bookshelf x=60, event x=1410) เดิมป้ายโดนตัดครึ่ง
    const viewL = camera ? camera.left : -Infinity;
    const viewR = camera ? camera.left + camera.viewW : Infinity;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 14px "Noto Sans Thai", "Noto Sans JP", sans-serif';
    for (const o of objects) {
      const name = labels[o.id];
      if (!name) continue;
      const wake = this.wake.get(o.id) ?? 0;
      const text = wake > 0.35 && prompt ? `${name} · ${prompt}` : name;

      let tw = this.labelWidths.get(text);
      if (tw === undefined) {
        tw = ctx.measureText(text).width;
        this.labelWidths.set(text, tw);
      }
      const bw = tw + 26;
      const bh = 29;
      const objCx = o.x + o.w / 2;
      // หนีบให้ป้ายอยู่ในจอเสมอ (เผื่อขอบ 8px) แต่ไม่ให้หลุดไปไกลจากวัตถุเกิน 60px
      const half = (bw / 2) * (1 + wake * 0.1) + 8;
      let cx = Math.min(Math.max(objCx, viewL + half), viewR - half);
      if (!Number.isFinite(cx)) cx = objCx;
      cx = Math.min(Math.max(cx, objCx - 60), objCx + 60);
      const bob = this.reduced ? 0 : Math.sin(time * 2 + o.x * 0.013) * 3;
      const y = o.y - 16 + bob;
      const scale = 1 + wake * 0.1;
      const tail = objCx - cx; // หางชี้กลับไปหาวัตถุจริง

      ctx.save();
      ctx.translate(cx, y - bh / 2);
      ctx.scale(scale, scale);
      // ป้ายกระดาษวาชิ + หางชี้ลง (THEME v2 ราตรีญี่ปุ่น)
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 7;
      ctx.fillStyle = 'rgba(245, 239, 226, 0.96)';
      this.roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 8);
      ctx.fill();
      const tx = Math.min(Math.max(tail / scale, -bw / 2 + 10), bw / 2 - 10);
      ctx.beginPath();
      ctx.moveTo(tx - 6, bh / 2 - 1);
      ctx.lineTo(tx + 6, bh / 2 - 1);
      ctx.lineTo(tx, bh / 2 + 6);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      // ขอบทองหายใจเบาๆ / เข้าใกล้เปลี่ยนเป็นสีประจำวัตถุเต็มเส้น
      ctx.strokeStyle = wake > 0.35 ? o.color : 'rgba(179, 134, 50, 0.9)';
      ctx.globalAlpha = Math.min(1,
        0.6 + wake * 0.4 + (this.reduced ? 0 : 0.12 * Math.sin(time * 2.4 + o.x)));
      ctx.lineWidth = 1.6;
      this.roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 8);
      ctx.stroke();
      ctx.globalAlpha = 1;
      // ★ 2026-07-20: ขีดสีบอกหมวดที่ขอบซ้ายของป้าย (work/about/connect)
      //   เจ้าของสั่ง "อย่าฉูดฉาด" → เป็นขีดบาง 3px ไม่ใช่ย้อมป้ายทั้งใบ
      const catCol = LABEL_CATS[o.cat];
      if (catCol) {
        ctx.fillStyle = catCol;
        this.roundRect(ctx, -bw / 2 + 5, -bh / 2 + 6, 3, bh - 12, 1.5);
        ctx.fill();
      }
      ctx.fillStyle = wake > 0.35 ? '#b23a3f' : '#2b2740';
      ctx.fillText(text, catCol ? 3 : 0, 1);
      ctx.restore();
    }
    ctx.restore();
  }

  drawWaypoint(ctx, obj, time) {
    const cx = obj.x + obj.w / 2;
    const bob = Math.sin(time * 4) * 7;
    const y = obj.y - 34 + bob;

    ctx.save();
    ctx.shadowColor = '#ffd24d';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#ffd24d';
    ctx.beginPath();
    ctx.moveTo(cx, y + 16);
    ctx.lineTo(cx - 13, y - 6);
    ctx.lineTo(cx + 13, y - 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawPlayer(ctx, player, time) {
    if (player.hidden) return;

    const feetY = player.y + player.h / 2;

    // เงาตัวละคร
    ctx.fillStyle = COLORS.shadow;
    ctx.beginPath();
    ctx.ellipse(player.x, feetY - 3, player.w * 0.55, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    const sprite = this.sprites.player;
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      // สไปรต์กระติ๊บ: เด้ง + เอียงนิดๆ ตอนเดิน, flip ตามทิศซ้าย/ขวา
      const bob = player.moving ? Math.abs(Math.sin(player.walkTime * 10)) * 6 : Math.sin(time * 2.2) * 2;
      const tilt = player.moving ? Math.sin(player.walkTime * 10) * 0.06 : 0;
      const h = player.spriteH;
      const w = h * (sprite.naturalWidth / sprite.naturalHeight);

      ctx.save();
      ctx.translate(player.x, feetY - bob);
      ctx.rotate(tilt);
      if (player.facingLeft) ctx.scale(-1, 1);

      // (easter egg แมวดำโผล่จากกระติ๊บ ถูกถอดถาวร 2026-07-20 — เจ้าของสั่ง)

      // perf: ใช้สไปรต์ glow ที่ pre-render ไว้ แทน shadowBlur ทุกเฟรม
      const gl = this.fx && this.fx.glow;
      if (gl) {
        ctx.globalAlpha = 0.5;
        const gs = h * 1.5;
        ctx.drawImage(gl, -gs / 2, -h - (gs - h) / 2, gs, gs);
        ctx.globalAlpha = 1;
      }
      ctx.drawImage(sprite, -w / 2, -h, w, h);
      ctx.restore();
      return;
    }

    // fallback: แคปซูลเรืองแสง (กรณีโหลดรูปไม่สำเร็จ)
    const bob = player.moving ? Math.sin(player.walkTime * 12) * 3 : 0;
    ctx.save();
    ctx.shadowColor = COLORS.playerGlow;
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#e8ecf8';
    this.roundRect(ctx, player.x - player.w / 2, player.y - player.h / 2 + bob, player.w, player.h, 16);
    ctx.fill();
    ctx.restore();
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
