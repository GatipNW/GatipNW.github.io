// ============================================
// title.js — ช่วงเปิดตัว (First Impression!) — ★ ดีไซน์ FINAL แล้ว (ดู CLAUDE.md 8.5)
// ฉาก: แฟนตาซีสีฟ้า 4K แบบเลเยอร์ parallax (sky/พระจันทร์ 2 ดวง/เขา/ทะเลสาบ)
//       + เมฆ/หมอก/ผิวน้ำระยิบ + mouse parallax + แฟรี่บินพาดจอ + โลโก้ slam ทีละตัว
//       (★ มังกรถูกถอดออกแล้ว — เจ้าของสั่ง 2026-07-18 อย่าใส่กลับ)
// flow: Title → PRESS START → charge (เกร็งก่อนพุ่ง) → leap (พุ่งทะลุโลโก้ ตูม!)
//       → เลือกภาษา → แนะนำตัว typewriter → ตัดเข้าเกม (ไม่มีคำถามช้อย)
// ============================================

import { BRAND } from '../data/content.js';
import { i18n } from '../i18n.js';
import { audio } from '../audio.js';
import { Particles } from '../engine/particles.js';

// ผู้ชมที่ OS ตั้ง reduce motion ไว้ จะได้เวอร์ชันนิ่ง แต่กดปุ่ม FULL FX บนจอ Title
// เพื่อ override เป็นเอฟเฟกต์เต็มได้ (จำไว้ใน localStorage, CSS อ่านผ่าน class fx-full)
const FX_OVERRIDE = localStorage.getItem('fx') === 'full';
if (FX_OVERRIDE) document.documentElement.classList.add('fx-full');
const REDUCED =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches && !FX_OVERRIDE;

// easing
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t) => {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const smoothstep = (t) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

// ไล่สีตัวอักษรโลโก้ เงินแสงจันทร์ → ทองโคม → ชาด (THEME v2 ราตรีญี่ปุ่น —
// ใช้ทั้ง CSS gradient และ particle ตอนโลโก้แตก)
const LOGO_STOPS = [
  [235, 240, 252],
  [217, 164, 65],
  [229, 72, 77],
];
function logoColorAt(t) {
  const seg = clamp(t, 0, 1) * (LOGO_STOPS.length - 1);
  const i = Math.min(Math.floor(seg), LOGO_STOPS.length - 2);
  const f = seg - i;
  const [a, b] = [LOGO_STOPS[i], LOGO_STOPS[i + 1]];
  const c = a.map((v, k) => Math.round(lerp(v, b[k], f)));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

// แสงหายใจซ้อนบนภาพพื้นหลัง — ล็อกโทนฟ้า (ธีมแฟนตาซีสีฟ้า) แกว่ง hue แค่เล็กน้อย
const AURORA = [
  { hue: 205, r: 0.6, ox: 0.24, oy: 0.28, spx: 0.31, spy: 0.23, a: 0.08 },
  { hue: 195, r: 0.66, ox: 0.72, oy: 0.22, spx: 0.22, spy: 0.29, a: 0.08 },
  { hue: 215, r: 0.5, ox: 0.5, oy: 0.7, spx: 0.18, spy: 0.21, a: 0.06 },
];

// วาดวงแสงนุ่ม (บอเก้/orb) ลง sprite เล็กๆ ครั้งเดียว — ตอนใช้แค่ drawImage = เร็ว
function makeOrbSprite(rgb) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(0.25, `rgba(${rgb}, 0.5)`);
  grad.addColorStop(1, `rgba(${rgb}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

// ประกายดาว 4 แฉกแบบอนิเมะ (แกนตั้ง/นอน = วงกลม gradient บีบแบน)
function makeSparkSprite() {
  const c = document.createElement('canvas');
  c.width = c.height = 96;
  const g = c.getContext('2d');
  g.globalCompositeOperation = 'lighter';
  const ray = g.createRadialGradient(48, 48, 0, 48, 48, 44);
  ray.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  ray.addColorStop(0.35, 'rgba(210, 240, 255, 0.5)');
  ray.addColorStop(1, 'rgba(210, 240, 255, 0)');
  for (const rot of [0, Math.PI / 2]) {
    g.save();
    g.translate(48, 48);
    g.rotate(rot);
    g.scale(0.14, 1);
    g.translate(-48, -48);
    g.fillStyle = ray;
    g.beginPath();
    g.arc(48, 48, 44, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  const core = g.createRadialGradient(48, 48, 0, 48, 48, 12);
  core.addColorStop(0, 'rgba(255, 255, 255, 1)');
  core.addColorStop(1, 'rgba(255, 255, 255, 0)');
  g.fillStyle = core;
  g.fillRect(0, 0, 96, 96);
  return c;
}

export class IntroScene {
  /**
   * @param onFinish        เรียกเมื่ออินโทรจบ (รับ targetId ของวัตถุที่จะชี้ทาง หรือ null)
   * @param getPlayerRect   คืน { cx, cy, h } ตำแหน่ง/ขนาดตัวละครบนจอ (px) ใช้ตอนกระติ๊บบินลงไปเป็นตัวละคร
   */
  constructor({ onFinish, getPlayerRect }) {
    this.onFinish = onFinish;
    this.getPlayerRect = getPlayerRect;

    this.root = document.getElementById('intro');
    this.fxCanvas = document.getElementById('fx-canvas');
    this.fxCtx = this.fxCanvas.getContext('2d');
    this.img = document.getElementById('kratib');
    this.title = document.getElementById('intro-title');
    this.flash = document.getElementById('intro-flash');
    this.dialog = document.getElementById('intro-dialog');
    this.dialogText = document.getElementById('dialog-text');
    this.dialogNext = document.getElementById('dialog-next');
    this.dialogChoices = document.getElementById('dialog-choices');
    this.skipBtn = document.getElementById('intro-skip');

    this.particles = new Particles();
    this.state = 'title';      // title → charge → leap → lang → dialog → enter → zoom → done
    this.zoomK = 1;            // ระดับซูมตอนพุ่งเข้าดวงจันทร์
    this.zoomP = 0;
    this.zoomFlashDone = false;
    this.t = 0;                // เวลารวมของ intro
    this.stateT = 0;           // เวลาในสถานะปัจจุบัน
    this.lastNow = performance.now();
    this.typing = null;        // ตัวจับ typewriter
    this.lineIndex = 0;
    this.dustTimer = 0;
    this.trail = [];           // motion trail ตอนพุ่ง
    this.flyFrom = null;
    this.shooters = [];        // ดาวตกบนจอ Title
    this.shootTimer = 1.6;
    this.glints = [];          // ประกายดาว 4 แฉกแบบอนิเมะ (โลโก้/กระติ๊บ/apex)
    this.glintTimer = 0.6;
    this.apexFlash = null;     // แสงวาบสีฟ้าเต็มจอตอนตูม
    this.logoRect = null;      // ตำแหน่งโลโก้ (cache ไว้ ไม่อ่าน DOM ทุกเฟรม)

    // ★ v9: mouse parallax — เลื่อนเมาส์แล้วทั้งฉากขยับตามความลึกของแต่ละชั้น
    this.px = 0.5;
    this.py = 0.5;
    this.ptx = 0.5;
    this.pty = 0.5;
    this.mouseSeen = false; // ยังไม่ขยับเมาส์ → แฟรี่ร่อนเล่นเอง (ดู drawFairies)
    if (!REDUCED) {
      window.addEventListener('pointermove', (e) => {
        this.ptx = e.clientX / innerWidth;
        this.pty = e.clientY / innerHeight;
        this.mouseSeen = true;
      }, { passive: true });
    }
    this.atmo = null; // เมฆ/หมอก/แถบแสงผิวน้ำ (สร้างตอนใช้ครั้งแรก)

    // sprite pre-render ครั้งเดียว — ตอนวาดจริงใช้ drawImage ล้วนๆ เพื่อคง 60fps
    this.sparkSprite = makeSparkSprite();
    this.orbSprites = ['77, 227, 255', '150, 200, 255', '190, 230, 255', '110, 190, 255']
      .map(makeOrbSprite);
    this.fairyGlow = { blue: makeOrbSprite('170, 225, 255'), gold: makeOrbSprite('255, 214, 140') };

    // ฉากหลังแบบเลเยอร์ (parallax 2.5D) — เจนจาก tools/gen_bg.py
    const asset = (n) => {
      const im = new Image();
      im.src = `assets/${n}`;
      return im;
    };
    this.bg = {
      sky: asset('bg-sky.webp'),
      mid: asset('bg-mid.webp'),
      near: asset('bg-near.webp'),
      moon1: asset('moon1.webp'),
      moon2: asset('moon2.webp'),
    };

    // ★ 2026-07-20: แฟรี่ "วิ่งตามเมาส์" (เจ้าของสั่ง) — เดิมบินพาดจอชนขอบแล้วกลับตัว
    //   แต่ละตัวเล็งจุดของตัวเองบนวงโคจรรอบเคอร์เซอร์ แล้วบินเข้าหาแบบสปริง
    //   (stiff ต่างกัน = ตัวหน้าตัวหลัง ไม่กองทับกัน) · ยังไม่ขยับเมาส์ = ร่อนเล่นเอง
    this.fairies = Array.from({ length: 6 }, (_, i) => {
      const r = () => Math.random();
      return {
        gold: i === 5,                    // ตัวสุดท้ายสีทอง ตัดกับธีมฟ้า
        size: 7 + r() * 7,
        x: r() * innerWidth,
        y: innerHeight * (0.08 + r() * 0.45),
        vx: 0,
        vy: 0,
        dir: r() < 0.5 ? -1 : 1,          // ทิศที่หันหน้า (คำนวณจาก vx ทุกเฟรม)
        orbitR: 46 + r() * 90,            // รัศมีวงโคจรรอบเคอร์เซอร์
        orbitA: r() * Math.PI * 2,
        orbitSpd: (r() < 0.5 ? -1 : 1) * (0.7 + r() * 1.1),
        stiff: 3.4 + r() * 3.2,           // ตัวที่ค่าสูง = ไล่ทันเร็ว ตัวต่ำ = ตามหลังเรื่อยๆ
        bobA: 8 + r() * 16,
        bobF: 2 + r() * 2.5,
        p: r() * Math.PI * 2,
        flap: 22 + r() * 8,               // กระพือถี่ขึ้นตามความเร็ว
        trailTimer: r() * 0.05,
      };
    });

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.fxCanvas.width = Math.round(innerWidth * dpr);
    this.fxCanvas.height = Math.round(innerHeight * dpr);
    this.dpr = dpr;

    // ดาว 3 ชั้นแบบ parallax: ไกล=เล็ก/ลอยช้า, ใกล้=ใหญ่/ลอยเร็ว/มีประกาย 4 แฉก
    // ดาวกะพริบซ้อนบนภาพ — เฉพาะท้องฟ้าส่วนบน ไม่ทับแนวเขาในภาพ
    const makeStars = (count, size0, size1, drift) =>
      Array.from({ length: count }, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight * 0.48,
        size: size0 + Math.random() * (size1 - size0),
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.6,
        drift,
      }));
    this.starLayers = [
      makeStars(70, 0.5, 1.2, 2),
      makeStars(50, 1.0, 1.9, 5),
      makeStars(26, 1.6, 2.6, 9),
    ];

    // บอเก้แสงลอยขึ้นช้าๆ (ความลึกต่างกัน = ขนาด/ความชัดต่างกัน)
    this.orbs = Array.from({ length: 14 }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: 5 + Math.random() * 20,
      speed: 6 + Math.random() * 16,
      sway: 20 + Math.random() * 40,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.14 + Math.random() * 0.3,
      sprite: this.orbSprites[(Math.random() * this.orbSprites.length) | 0],
    }));

    if (this.state !== 'title') this.logoRect = null;
    else this.cacheLogoRect();
  }

  cacheLogoRect() {
    const r = document.getElementById('intro-logo').getBoundingClientRect();
    if (r.width) this.logoRect = r;
  }

  start() {
    // ใส่ข้อความจาก content.js (ห้าม hardcode ใน HTML)
    document.title = `${BRAND.logo} — ${BRAND.tagline}`;
    this.buildLogo();
    document.getElementById('intro-tagline').textContent = BRAND.tagline;
    // ★ 2026-07-20: บรรทัดบอกสายงาน (ครบ 3 ภาษา) — วาดใหม่ตอนสลับภาษาด้วย
    const roleEl = document.getElementById('intro-role');
    const titleResume = document.getElementById('title-resume');
    const syncTitleText = () => {
      roleEl.textContent = i18n.t('intro.role');
      titleResume.textContent = i18n.t('resume.openTitle');
      this.skipBtn.textContent = i18n.t('intro.skip');
    };
    syncTitleText();
    i18n.onChange(syncTitleText);
    // ปุ่มลัดไป Resume Mode — ต้อง stopPropagation กันไปโดน handler PRESS START
    titleResume.addEventListener('pointerdown', (e) => e.stopPropagation());
    titleResume.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.play('click');
      document.getElementById('resume-btn').click();
    });
    document.getElementById('press-start').textContent = BRAND.pressStart;

    // เครื่องนี้ตั้ง reduce motion ไว้ → เสนอปุ่มเปิดเอฟเฟกต์เต็ม (opt-in แล้วจำค่า)
    if (REDUCED) {
      const fxBtn = document.createElement('button');
      fxBtn.id = 'fx-btn';
      fxBtn.textContent = BRAND.fullFx;
      fxBtn.addEventListener('pointerdown', (e) => e.stopPropagation()); // กันชน PRESS START
      fxBtn.addEventListener('click', () => {
        localStorage.setItem('fx', 'full');
        location.reload();
      });
      this.title.appendChild(fxBtn);
    }

    // กระติ๊บโผล่หัวแอบมองจากขอบล่างจอ (key visual) — จะมุดลงตอน charge แล้วค่อยพุ่ง
    this.imgState = { cx: innerWidth / 2, cy: innerHeight + 320, sx: 1, sy: 1, rot: 0 };
    this.applyImgTransform();
    this.img.classList.add('ready'); // ตั้งตำแหน่งเสร็จแล้วค่อยให้มองเห็น (กันค้างมุมซ้ายบน)

    // Title พร้อมแล้ว → เอาจอ boot ออก
    const boot = document.getElementById('boot');
    if (boot) {
      boot.classList.add('gone');
      setTimeout(() => boot.remove(), 500);
    }

    // เริ่ม: คลิก/แตะ/Enter/Space ที่ไหนก็ได้
    const startHandler = (e) => {
      if (this.state !== 'title') return;
      if (e.type === 'keydown' && !['Enter', 'Space'].includes(e.code)) return;
      audio.ensure(); // user gesture แรก — ปลุก AudioContext ตรงนี้
      audio.startBgm(); // BGM ambient เริ่มตรงนี้แล้ววนตลอดทั้งเว็บ (mute ก็แค่เงียบ)
      this.beginCharge();
    };
    this.root.addEventListener('pointerdown', startHandler);
    window.addEventListener('keydown', startHandler);

    // คลิก dialog / กดปุ่ม เพื่อไปบรรทัดต่อไปของบทแนะนำตัว
    this.dialog.addEventListener('pointerdown', (e) => {
      if (this.state === 'dialog' && !e.target.closest('button')) this.advanceLine();
    });
    window.addEventListener('keydown', (e) => {
      if (this.state === 'dialog' && ['Enter', 'Space', 'KeyE'].includes(e.code)) this.advanceLine();
    });

    this.skipBtn.addEventListener('click', () => {
      audio.play('click');
      this.finish(null, true);
    });

    requestAnimationFrame((now) => this.loop(now));
  }

  // โลโก้แบบตัวอักษรแยก: แต่ละตัว slam ลงจอทีละตัว + ไล่สีต่อเนื่องทั้งคำ
  buildLogo() {
    const logoEl = document.getElementById('intro-logo');
    logoEl.innerHTML = '';
    // ชื่อ-นามสกุลแยกคนละบรรทัดแบบโลโก้เกม (split ที่ช่องว่าง)
    const words = BRAND.logo.split(' ');
    const n = BRAND.logo.replace(/ /g, '').length;
    let i = 0;
    this.lastLogoSpan = null;
    for (const word of words) {
      const row = document.createElement('div');
      row.className = 'logo-row';
      [...word].forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'logo-letter';
      span.textContent = ch === ' ' ? ' ' : ch;
      // ตัดช่วง gradient ของทั้งคำมาเป็นสีของตัวอักษรนี้ → ต่อกันเนียนทั้งโลโก้
      // (ต้องใช้ backgroundImage ไม่ใช่ background — shorthand จะ reset background-clip: text)
      span.style.backgroundImage =
        `linear-gradient(115deg, ${logoColorAt(i / n)}, ${logoColorAt((i + 1) / n)})`;
      // delay 2 ค่า = slam เข้าทีละตัว, จากนั้นคลื่นแสงวิ่งไล่ผ่านทีละตัว
      span.style.animationDelay = `${0.2 + i * 0.07}s, ${1.6 + i * 0.1}s`;
      row.appendChild(span);
      this.lastLogoSpan = span;
      i++;
      });
      logoEl.appendChild(row);
    }
    // ตัวสุดท้ายตอกลงจอ → จอสะเทือน + วงแหวนคลื่นกระแทก
    if (!REDUCED) {
      this.lastLogoSpan?.addEventListener('animationend', (e) => {
        if (e.animationName === 'letter-slam' && !this.titleBoomDone) {
          this.titleBoomDone = true;
          this.titleBoom();
        }
      });
    } else {
      this.cacheLogoRect(); // ไม่มีอนิเมชัน → rect นิ่งตั้งแต่แรก
    }
  }

  titleBoom() {
    const r = document.getElementById('intro-logo').getBoundingClientRect();
    if (!r.width || this.state !== 'title') return;
    this.logoRect = r; // ตัวอักษรลงครบแล้ว rect นิ่ง — เริ่มวาดฮาโล/ประกายจากจุดนี้
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    this.particles.ring(cx, cy, { color: '#ffffff', life: 0.5, r1: r.width * 0.75, width: 5 });
    this.particles.ring(cx, cy, { color: '#a06bff', life: 0.7, r1: r.width * 1.05, width: 3 });
    this.particles.burst(cx, cy, { count: 26, speed: 300, life: 0.8, size: 3.5 });
    this.root.classList.add('title-boom');
    setTimeout(() => this.root.classList.remove('title-boom'), 400);
  }

  // ---------- state transitions ----------

  beginCharge() {
    this.skipBtn.classList.remove('hidden');

    if (REDUCED) {
      // ผู้ใช้ตั้งค่า reduce motion: fade เข้ากลางจอเฉยๆ
      this.title.classList.add('fade-out');
      this.setState('leap');
      this.imgState.cy = innerHeight * 0.44;
      this.img.classList.add('fade-in');
      setTimeout(() => this.showLang(), 500);
      return;
    }

    // ซ่อนเฉพาะ tagline + PRESS START — โลโก้อยู่ต่อ รอโดนกระติ๊บพุ่งทะลุให้แตกกระจาย
    this.setState('charge');
    this.chargeFromY = this.imgState.cy;
    this.root.classList.add('bars', 'charging', 'go'); // letterbox + สั่นรัวเบาๆ
    audio.play('riser');
  }

  beginLeap() {
    this.setState('leap');
    this.leapFromY = this.imgState.cy;
    this.root.classList.remove('charging');
    audio.play('boing');
  }

  // โลโก้ระเบิดเป็น particle สีเดียวกับตัวอักษร ตอนกระติ๊บพุ่งทะลุ
  shatterLogo() {
    const logo = document.getElementById('intro-logo');
    if (logo.classList.contains('shattered')) return;
    const r = logo.getBoundingClientRect();
    logo.classList.add('shattered');
    if (!r.width) return;
    for (let i = 0; i < 70; i++) {
      const t = Math.random();
      this.particles.push({
        kind: 'dot',
        x: r.left + t * r.width,
        y: r.top + Math.random() * r.height,
        vx: (Math.random() - 0.5) * 460,
        vy: -80 - Math.random() * 340,
        gravity: 560,
        life: 0.7 + Math.random() * 0.8,
        age: 0,
        size: 2 + Math.random() * 3.6,
        color: Math.random() < 0.25 ? '#ffffff' : logoColorAt(t),
      });
    }
  }

  apexImpact() {
    // ตูม! จังหวะที่ทุกอย่างระเบิดพร้อมกัน — คลื่นกระแทกกวาดเต็มจอ
    this.shatterLogo();
    const s = this.imgState;
    const R = Math.max(innerWidth, innerHeight);
    this.particles.burst(s.cx, s.cy, { count: 90, speed: 640, life: 1.1 });
    this.particles.burst(s.cx, s.cy, { count: 50, speed: 260, life: 2.0, gravity: 140, size: 3.6 }); // confetti ร่วงช้า
    // วงแหวน 4 ชั้นไล่กันออกไปจนสุดขอบจอ
    this.particles.ring(s.cx, s.cy, { color: '#ffffff', life: 0.5, r1: R * 0.55, width: 11 });
    this.particles.ring(s.cx, s.cy, { color: '#4de3ff', life: 0.8, r1: R * 0.9, width: 6 });
    this.particles.ring(s.cx, s.cy, { color: '#a06bff', life: 1.0, r1: R * 1.15, width: 4 });
    this.particles.ring(s.cx, s.cy, { color: '#ff6bd6', life: 1.2, r1: R * 1.4, width: 3 });
    this.particles.speedBurst(s.cx, s.cy, { count: 36, reach: R * 1.1 });

    // แสงวาบสีเต็มจอ + ประกายดาวโปรยทั่วจอ
    this.apexFlash = { x: s.cx, y: s.cy, age: 0 };
    for (let i = 0; i < 10; i++) {
      this.spawnGlint(s.cx + (Math.random() - 0.5) * 300, s.cy + (Math.random() - 0.5) * 220,
        34 + Math.random() * 40, 0.5 + Math.random() * 0.5);
    }
    for (let i = 0; i < 10; i++) {
      this.spawnGlint(Math.random() * innerWidth, Math.random() * innerHeight * 0.8,
        22 + Math.random() * 30, 0.6 + Math.random() * 0.8);
    }

    this.flash.classList.add('go');            // จอแฟลชขาว
    this.root.classList.add('apex-hit');       // ซูมกระแทก + จอสั่น
    setTimeout(() => {
      this.flash.classList.remove('go');
      this.root.classList.remove('apex-hit');
    }, 700);

    audio.play('impact');
    audio.play('sparkle');
  }

  showLang() {
    this.setState('lang');
    this.root.classList.remove('bars'); // เก็บ letterbox ไม่ให้ทับกรอบกล่องเลือกภาษา
    this.dialog.classList.remove('hidden');
    this.dialogText.textContent = BRAND.langPrompt;
    this.dialogChoices.innerHTML = '';
    for (const lang of BRAND.langs) {
      const btn = document.createElement('button');
      btn.className = 'choice-btn lang-btn';
      btn.textContent = lang.label;
      btn.addEventListener('click', () => {
        audio.play('click');
        i18n.set(lang.id);
        this.skipBtn.textContent = i18n.t('intro.skip');
        this.showDialog();
      });
      this.dialogChoices.appendChild(btn);
    }
  }

  // บทแนะนำตัวกระติ๊บแบบ typewriter — จบบรรทัดสุดท้ายแล้วเข้าห้องสตูดิโอเลย (ไม่มีช้อย)
  showDialog() {
    this.setState('dialog');
    this.dialog.classList.add('talk'); // โหมดบทพูด: ชิดซ้าย + สูงคงที่ ไม่กระตุกตอนพิมพ์
    this.dialogChoices.innerHTML = '';
    this.lineIndex = 0;
    this.typeLine(i18n.t('intro.lines')[0]);
  }

  advanceLine() {
    const lines = i18n.t('intro.lines');
    if (this.typing) {
      // กำลังพิมพ์อยู่ → โชว์ทั้งบรรทัดทันที
      clearInterval(this.typing);
      this.typing = null;
      this.dialogText.textContent = lines[this.lineIndex];
      this.dialogNext.classList.remove('hidden');
      return;
    }
    this.lineIndex++;
    if (this.lineIndex < lines.length) {
      this.typeLine(lines[this.lineIndex]);
    } else {
      this.finish(null, false);
    }
  }

  typeLine(text) {
    this.dialogNext.classList.add('hidden');
    if (REDUCED) {
      this.dialogText.textContent = text;
      this.dialogNext.classList.remove('hidden');
      return;
    }
    this.dialogText.textContent = '';
    let i = 0;
    this.typing = setInterval(() => {
      i++;
      this.dialogText.textContent = text.slice(0, i);
      if (i % 3 === 0) audio.play('blip');
      if (i >= text.length) {
        clearInterval(this.typing);
        this.typing = null;
        this.dialogNext.classList.remove('hidden');
      }
    }, 28);
  }

  finish(targetId, fast) {
    if (this.state === 'enter' || this.state === 'zoom' || this.state === 'done') return;
    this.finishTarget = targetId;
    this.finishFast = fast;
    this.dialog.classList.add('hidden');
    this.skipBtn.classList.add('hidden');
    this.title.classList.add('fade-out');
    this.root.classList.remove('bars', 'charging');
    if (REDUCED) {
      // reduce motion: ไม่ซูม — fade เบาๆ แล้วเข้าเกม
      this.root.classList.add('intro-exit');
      this.setState('enter');
      return;
    }
    // เข้าสตูดิโอ = กระติ๊บบินพุ่งเข้าดวงจันทร์ใหญ่ แล้วกล้องซูมตามเข้าไป
    this.flyFrom = { ...this.imgState };
    this.setState('enter');
    audio.play('pop');
  }

  setState(s) {
    this.state = s;
    this.stateT = 0;
  }

  // ---------- loop ----------

  loop(now) {
    if (this.state === 'done') return;
    let dt = (now - this.lastNow) / 1000;
    this.lastNow = now;
    dt = Math.min(dt, 0.05);
    this.t += dt;
    this.stateT += dt;

    this.update(dt);

    // วาด fx canvas
    const ctx = this.fxCtx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    // ฉากหลังแบบเลเยอร์ parallax: ฟ้า → พระจันทร์ 2 ดวง (ลอยขึ้นลง) → เขาไกล →
    // เขาใกล้+น้ำ → เมฆ/หมอก/ผิวน้ำระยิบ — แต่ละชั้นขยับคนละจังหวะ = ความลึกแบบ 2.5D
    // (reduced motion: ยังวาดครบ แค่หยุดนิ่ง)
    // ตอนเข้าสตูดิโอ: ซูมทั้งฉากพุ่งเข้าหาดวงจันทร์ใหญ่
    const zooming = this.state === 'zoom';
    const zx = innerWidth * 0.72;
    const zy = innerHeight * 0.19;
    if (zooming) {
      ctx.save();
      ctx.translate(zx, zy);
      ctx.scale(this.zoomK, this.zoomK);
      ctx.translate(-zx, -zy);
    }
    this.drawLayer(ctx, this.bg.sky, 5, 2, 1.04, 0);
    this.drawAurora(ctx);
    this.drawStars(ctx);
    this.drawMoons(ctx);
    this.drawClouds(ctx);       // ★ v9: เมฆบางลอยผ่านหน้าดวงจันทร์
    this.drawLayer(ctx, this.bg.mid, 13, 5, 1.06, 2.1);
    this.drawMist(ctx);         // ★ v9: หมอกเชิงเขา คั่นระยะไกล-ใกล้
    this.drawLayer(ctx, this.bg.near, 22, 9, 1.09, 4.2);
    this.drawWaterShimmer(ctx); // ★ v9: ผิวน้ำระยิบตามทางแสงจันทร์ (มังกรถูกถอดแล้ว)
    // ★ 2026-07-20 เจ้าของสั่งถอด "ลำแสงจันทร์ (drawMoonbeam)" + "god rays หลังโลโก้
    //   (drawRays)" ออก — บอกว่ารกเกินไป · ห้ามใส่กลับโดยไม่ถูกสั่ง
    this.drawGrade(ctx);        // ★ v9: เกรดสีให้ภาพลึกแบบซีนภาพยนตร์
    this.drawLogoHalo(ctx);
    this.drawOrbs(ctx, dt);
    this.drawFairies(ctx, dt);
    this.drawKratibGlow(ctx);
    if (zooming) {
      ctx.restore();
      // แสงจันทร์ท่วมจอเพิ่มขึ้นเรื่อยๆ ก่อนแฟลชตัดเข้าสตูดิโอ
      const g = ctx.createRadialGradient(zx, zy, 0, zx, zy, Math.max(innerWidth, innerHeight));
      g.addColorStop(0, `rgba(226, 242, 255, ${0.92 * this.zoomP})`);
      g.addColorStop(1, `rgba(185, 218, 255, ${0.4 * this.zoomP})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, innerWidth, innerHeight);
    }
    if (!REDUCED) {
      this.drawShooters(ctx, dt);
      this.drawGlints(ctx, dt);
      if (this.state === 'charge') this.drawChargeGlow(ctx);
      this.drawApexFlash(ctx, dt);
      this.drawTrail(ctx, dt);
    }

    this.particles.update(dt);
    this.particles.draw(ctx);

    requestAnimationFrame((n) => this.loop(n));
  }

  drawAurora(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const base = Math.max(innerWidth, innerHeight);
    const T = REDUCED ? 0 : this.t; // reduced motion: แสงนิ่งแต่ยังสวย
    for (const b of AURORA) {
      const x = innerWidth * b.ox + Math.sin(T * b.spx) * innerWidth * 0.09;
      const y = innerHeight * b.oy + Math.cos(T * b.spy) * innerHeight * 0.07;
      const r = base * b.r;
      const hue = b.hue + Math.sin(T * 0.15 + b.ox * 7) * 12; // แกว่งในย่านฟ้าเท่านั้น
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `hsla(${hue}, 100%, 68%, ${b.a})`);
      g.addColorStop(1, `hsla(${hue}, 100%, 68%, 0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.restore();
  }

  // (drawRays — ลำแสง god rays หลังโลโก้ ถูกถอดออก 2026-07-20 ตามคำสั่งเจ้าของ "รกเกินไป")

  // แผ่นเงามืดหายใจอยู่หลังโลโก้ — กดฉากลงให้ตัวหนังสือเด่นแบบโลโก้เกม
  drawLogoHalo(ctx) {
    if (!this.logoRect || this.state !== 'title' && this.state !== 'charge') return;
    if (document.getElementById('intro-logo').classList.contains('shattered')) return;
    const T = REDUCED ? 0 : this.t;
    const cx = this.logoRect.left + this.logoRect.width / 2;
    const cy = this.logoRect.top + this.logoRect.height / 2;
    const r = this.logoRect.width * (0.72 + 0.04 * Math.sin(T * 1.2));
    ctx.save();
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(3, 8, 20, 0.36)');
    g.addColorStop(0.6, 'rgba(3, 8, 20, 0.2)');
    g.addColorStop(1, 'rgba(3, 8, 20, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  }

  // บอเก้แสงลอยขึ้น (sprite สำเร็จรูป — เร็ว)
  drawOrbs(ctx, dt) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const o of this.orbs) {
      if (!REDUCED) {
        o.y -= o.speed * dt;
        if (o.y < -40) {
          o.y = innerHeight + 40;
          o.x = Math.random() * innerWidth;
        }
      }
      const T = REDUCED ? 0 : this.t;
      const x = o.x + Math.sin(T * 0.5 + o.phase) * o.sway;
      const tw = 0.7 + 0.3 * Math.sin(T * 1.2 + o.phase * 2);
      ctx.globalAlpha = o.alpha * tw;
      ctx.drawImage(o.sprite, x - o.r, o.y - o.r, o.r * 2, o.r * 2);
    }
    ctx.restore();
  }

  // วาดเลเยอร์ภาพแบบ cover เต็มจอ + ขยับ parallax ตามเวลา (ชั้นใกล้ขยับแรงกว่า)
  // ★ v9: บวก parallax ตามเมาส์ด้วย — depth ใช้ค่า ax เดียวกัน (ชั้นใกล้ขยับแรง)
  drawLayer(ctx, img, ax, ay, zoom, phase) {
    if (!img.complete || !img.naturalWidth) return;
    const T = REDUCED ? 0 : this.t;
    const ms = this.mouseShift(ax);
    const s = Math.max(innerWidth / img.naturalWidth, innerHeight / img.naturalHeight) * zoom;
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    const dx = (innerWidth - w) / 2 + Math.sin(T * 0.07 + phase) * ax + ms.x;
    const dy = (innerHeight - h) / 2 + Math.cos(T * 0.055 + phase) * ay + ms.y;
    ctx.drawImage(img, dx, dy, w, h);
  }

  // พระจันทร์ 2 ดวง — เลเยอร์แยก ลอยขึ้นลงคนละจังหวะ (วาด additive ให้ halo ฟุ้งรับฟ้า)
  drawMoons(ctx) {
    const T = REDUCED ? 0 : this.t;
    const msn = this.mouseShift(4); // ★ v9: ดวงจันทร์อยู่ไกล ขยับตามเมาส์เบาๆ
    ctx.save();
    ctx.translate(msn.x, msn.y);
    const base = Math.min(innerWidth, innerHeight);
    // วาดทึบ (source-over) ให้ดวงบังฟ้า/ออโรร่าจริงๆ แล้วซ้อน additive บางๆ เสริม glow
    const drawMoon = (img, x, y, s, glow) => {
      ctx.drawImage(img, x - s / 2, y - s / 2, s, s);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha *= glow;
      ctx.drawImage(img, x - s / 2, y - s / 2, s, s);
      ctx.restore();
    };
    const m1 = this.bg.moon1;
    if (m1.complete && m1.naturalWidth) {
      const s = base * 0.52 * (1 + Math.sin(T * 0.5) * 0.012); // หายใจเบาๆ ด้วย
      const x = innerWidth * 0.72;
      const y = innerHeight * 0.19 + Math.sin(T * 0.5) * 14;
      drawMoon(m1, x, y, s, 0.35);

      // เงาคราสเคลื่อนผ่านหน้าดวงทุก ~36s (โผล่มาแล้วหายไป) — clip ในดวงแล้ว multiply
      const ph = (T % 36) / 36;
      if (ph > 0.72) {
        const q = (ph - 0.72) / 0.28;                 // 0→1 ช่วงเงาพาดผ่าน
        const discR = s * 0.26;                        // รัศมีดวงจริงใน sprite (R = S*0.26)
        const sx = x + (q * 2 - 1) * discR * 2.8;
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        ctx.arc(x, y, discR, 0, Math.PI * 2);
        ctx.clip();
        const sg = ctx.createRadialGradient(sx, y, discR * 0.2, sx, y, discR * 1.25);
        sg.addColorStop(0, 'rgba(10, 16, 34, 0.8)');
        sg.addColorStop(0.7, 'rgba(10, 16, 34, 0.55)');
        sg.addColorStop(1, 'rgba(10, 16, 34, 0)');
        ctx.fillStyle = sg;
        ctx.fillRect(x - discR, y - discR, discR * 2, discR * 2);
        ctx.restore();
      }
    }
    const m2 = this.bg.moon2;
    if (m2.complete && m2.naturalWidth) {
      // ดวงชมพูเสี้ยวคราส: แสงเต้นเป็นจังหวะหัวใจช้าๆ + ลอยคนละทางกับดวงใหญ่
      ctx.globalAlpha = 0.85 + 0.15 * Math.sin(T * 0.9);
      const s = base * 0.26 * (1 + Math.cos(T * 0.42) * 0.02);
      const x = innerWidth * 0.22 + Math.sin(T * 0.3) * 8;
      const y = innerHeight * 0.12 + Math.sin(T * 0.42 + 2.4) * 12;
      drawMoon(m2, x, y, s, 0.4);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // ============ ★ v9: ชั้นบรรยากาศ (มังกรถูกถอดออก — เจ้าของสั่ง 2026-07-18) ============

  // sprite เมฆ/หมอก/แถบแสงผิวน้ำ สร้างครั้งเดียว — ตอนวาดจริงเหลือแค่ drawImage (60fps)
  buildAtmoSprites() {
    const cloud = (seed) => {
      const c = document.createElement('canvas');
      c.width = 640;
      c.height = 200;
      const g = c.getContext('2d');
      let s = seed * 99991 + 7;
      const r = () => {
        s = (s * 16807) % 2147483647;
        return s / 2147483647;
      };
      for (let i = 0; i < 26; i++) {
        const bx = 60 + r() * 520;
        const by = 84 + Math.sin((bx / 640) * Math.PI) * 26 + (r() - 0.5) * 44;
        const br = 24 + r() * 46;
        const grad = g.createRadialGradient(bx, by, 0, bx, by, br);
        grad.addColorStop(0, 'rgba(225, 238, 255, 0.15)');
        grad.addColorStop(1, 'rgba(225, 238, 255, 0)');
        g.fillStyle = grad;
        g.fillRect(bx - br, by - br, br * 2, br * 2);
      }
      return c;
    };
    const mist = () => {
      const c = document.createElement('canvas');
      c.width = 640;
      c.height = 160;
      const g = c.getContext('2d');
      for (let i = 0; i < 20; i++) {
        const bx = Math.random() * 640;
        const by = 80 + (Math.random() - 0.5) * 56;
        const br = 40 + Math.random() * 70;
        const grad = g.createRadialGradient(bx, by, 0, bx, by, br);
        grad.addColorStop(0, 'rgba(180, 212, 255, 0.09)');
        grad.addColorStop(1, 'rgba(180, 212, 255, 0)');
        g.fillStyle = grad;
        g.fillRect(bx - br, by - br, br * 2, br * 2);
      }
      return c;
    };
    const streak = () => {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 10;
      const g = c.getContext('2d');
      const grad = g.createLinearGradient(0, 0, 128, 0);
      grad.addColorStop(0, 'rgba(210, 238, 255, 0)');
      grad.addColorStop(0.5, 'rgba(210, 238, 255, 0.9)');
      grad.addColorStop(1, 'rgba(210, 238, 255, 0)');
      g.fillStyle = grad;
      g.fillRect(0, 2, 128, 6);
      return c;
    };
    this.atmo = { clouds: [cloud(3), cloud(7)], mist: mist(), streak: streak() };
  }

  // ★ v9: parallax ตามเมาส์ — ชั้นลึก (depth สูง) ขยับแรงกว่า = ฉากมีมิติ 2.5D จริง
  mouseShift(depth) {
    return {
      x: (0.5 - this.px) * depth * 3.0,
      y: (0.5 - this.py) * depth * 2.2,
    };
  }

  // เมฆบางลอยช้าๆ — ชั้นหน้า "ดวงจันทร์" แต่หลังแนวเขา = ลอยผ่านหน้าดวงได้
  drawClouds(ctx) {
    if (!this.atmo) this.buildAtmoSprites();
    const T = REDUCED ? 0 : this.t;
    const defs = [
      { y: 0.10, s: 0.9, sp: 9, a: 0.8, i: 0, off: 0 },
      { y: 0.235, s: 1.25, sp: 5.5, a: 0.6, i: 1, off: 700 },
      { y: 0.045, s: 0.65, sp: 13, a: 0.5, i: 1, off: 1400 },
    ];
    const ms = this.mouseShift(7);
    ctx.save();
    for (const d of defs) {
      const w = innerWidth * 0.55 * d.s;
      const h = w * (200 / 640);
      const span = innerWidth + w * 2;
      const x = ((T * d.sp + d.off) % span) - w;
      ctx.globalAlpha = d.a;
      ctx.drawImage(this.atmo.clouds[d.i], x + ms.x, innerHeight * d.y + ms.y, w, h);
    }
    ctx.restore();
  }

  // หมอกบางเชิงเขา — ลอยสวนทิศกันช้าๆ ระหว่างเขาไกลกับเขาใกล้ (คั่นระยะ = ลึกขึ้น)
  drawMist(ctx) {
    if (!this.atmo) this.buildAtmoSprites();
    const T = REDUCED ? 0 : this.t;
    const ms = this.mouseShift(14);
    const defs = [
      { y: 0.565, s: 1.4, sp: 7, a: 0.5 },
      { y: 0.635, s: 1.1, sp: -10, a: 0.65 },
      { y: 0.705, s: 1.7, sp: 4.5, a: 0.5 },
    ];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const d of defs) {
      const w = innerWidth * 0.7 * d.s;
      const h = w * (160 / 640);
      const span = innerWidth + w * 2;
      const x = ((((T * d.sp) % span) + span) % span) - w;
      ctx.globalAlpha = d.a * (REDUCED ? 0.8 : 0.75 + 0.25 * Math.sin(T * 0.3 + d.y * 20));
      ctx.drawImage(this.atmo.mist, x + ms.x, innerHeight * d.y - h / 2 + ms.y, w, h);
    }
    ctx.restore();
  }

  // ผิวน้ำระยิบ: แถบแสงนอนวิบวับตามทางแสงจันทร์ (ชั้นบนสุดของทะเลสาบ)
  drawWaterShimmer(ctx) {
    if (!this.atmo) this.buildAtmoSprites();
    const T = REDUCED ? 0 : this.t;
    const ms = this.mouseShift(22);
    const y0 = innerHeight * 0.79;
    const yr = innerHeight * 0.15;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 11; i++) {
      const fy = y0 + yr * (i / 11) + Math.sin(i * 7.3) * 6;
      const cx = innerWidth * (0.71 + Math.sin(i * 2.63) * (0.05 + 0.09 * (i / 11)));
      const w = innerWidth * (0.05 + 0.05 * (((i * 53) % 7) / 7)) * (0.7 + 0.6 * (i / 11));
      const tw = REDUCED ? 0.5 : Math.max(0, Math.sin(T * (0.7 + (i % 5) * 0.23) + i * 2.1));
      ctx.globalAlpha = 0.05 + 0.30 * tw * tw;
      ctx.drawImage(this.atmo.streak, cx - w / 2 + ms.x, fy + ms.y, w, 5 + (i / 11) * 5);
    }
    ctx.restore();
  }

  // เกรดสีทั้งจอ: ฟ้าเย็นด้านบน → ครามลึกด้านล่าง (cache gradient ต่อขนาดจอ)
  drawGrade(ctx) {
    const key = innerWidth * 100000 + innerHeight;
    if (!this.gradeGrad || this.gradeKey !== key) {
      this.gradeKey = key;
      const g = ctx.createLinearGradient(0, 0, 0, innerHeight);
      g.addColorStop(0, 'rgba(90, 150, 255, 0.05)');
      g.addColorStop(0.45, 'rgba(0, 0, 0, 0)');
      g.addColorStop(1, 'rgba(8, 12, 40, 0.16)');
      this.gradeGrad = g;
    }
    ctx.fillStyle = this.gradeGrad;
    ctx.fillRect(0, 0, innerWidth, innerHeight);
  }

  // แฟรี่: แสงฟุ้ง + ปีกกระพือ + แกนเรืองแสง + โปรยฝุ่นแสง/ประกายตามหลัง
  drawFairies(ctx, dt) {
    const T = REDUCED ? 0 : this.t;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // จุดที่แฟรี่ทั้งฝูงเล็ง: เคอร์เซอร์ (ผ่าน px/py ที่ smooth แล้ว) — ยังไม่ขยับเมาส์
    // ก็ร่อนวนช้าๆ กลางจอบนแทน ไม่ให้ไปกองนิ่งอยู่จุดเดียว
    const anchorX = this.mouseSeen ? this.px * innerWidth : innerWidth * 0.5;
    // ยังไม่ขยับเมาส์ → ให้ร่อนแถวเชิงเขา/ผิวน้ำ ไม่ใช่กลางจอบน (จะไปกวนโลโก้)
    const anchorY = this.mouseSeen ? this.py * innerHeight : innerHeight * 0.62;
    for (const f of this.fairies) {
      if (!REDUCED) {
        f.orbitA += f.orbitSpd * dt;
        // เป้าหมายส่วนตัว = จุดบนวงรีรอบเคอร์เซอร์ (ตัวละจุด จึงไม่ทับกัน)
        const wob = this.mouseSeen ? 0 : Math.sin(T * 0.35 + f.p) * innerWidth * 0.22;
        const tx = anchorX + wob + Math.cos(f.orbitA) * f.orbitR;
        const ty = anchorY + Math.sin(f.orbitA) * f.orbitR * 0.7;
        // สปริงแบบมีแรงหน่วง: เร่งเข้าหาเป้า แล้วโดนหน่วงไว้ = พุ่งตามแล้วเลยนิดๆ
        f.vx += ((tx - f.x) * f.stiff - f.vx * 3.2) * dt;
        f.vy += ((ty - f.y) * f.stiff - f.vy * 3.2) * dt;
        const sp = Math.hypot(f.vx, f.vy);
        if (sp > 900) { // เพดานความเร็ว กันพุ่งข้ามจอตอนเมาส์กระโดดไกล
          f.vx = (f.vx / sp) * 900;
          f.vy = (f.vy / sp) * 900;
        }
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        if (Math.abs(f.vx) > 20) f.dir = f.vx > 0 ? 1 : -1;
      }
      const x = f.x;
      const y = f.y + Math.sin(T * f.bobF + f.p) * f.bobA;
      // เอียงตัวตามทิศบิน (ยิ่งพุ่งแรง ยิ่งเอียง)
      const tilt = Math.atan2(f.vy, Math.abs(f.vx) + 60) * 0.35 * f.dir;
      const flap = REDUCED ? 0.5 : 0.5 + 0.5 * Math.sin(T * f.flap + f.p);
      const spr = f.gold ? this.fairyGlow.gold : this.fairyGlow.blue;
      const bodyCol = f.gold ? '255, 214, 140' : '170, 225, 255';

      // แสงฟุ้งรอบตัว (หายใจตามจังหวะปีก)
      const g = f.size * 4.4;
      ctx.globalAlpha = 0.5 + flap * 0.25;
      ctx.drawImage(spr, x - g / 2, y - g / 2, g, g);

      // ปีกโปร่งแสง 2 ข้าง กระพือ (มุมกางเปลี่ยนตาม flap)
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tilt);
      ctx.globalAlpha = 0.3 + flap * 0.4;
      ctx.fillStyle = 'rgba(225, 246, 255, 0.9)';
      const ws = f.size * (0.8 + flap * 0.7);
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(s * f.size * 0.55, -f.size * 0.2,
          ws * 0.72, ws * 0.3, s * (1.05 - flap * 0.55), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // แกนตัวเรืองแสง
      ctx.globalAlpha = 1;
      const core = ctx.createRadialGradient(x, y, 0, x, y, f.size * 0.7);
      core.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      core.addColorStop(0.5, `rgba(${bodyCol}, 0.8)`);
      core.addColorStop(1, `rgba(${bodyCol}, 0)`);
      ctx.fillStyle = core;
      ctx.fillRect(x - f.size, y - f.size, f.size * 2, f.size * 2);

      // ฝุ่นแสงโปรยตามหลัง + วิบเป็นประกายนานๆ ที
      if (!REDUCED) {
        f.trailTimer -= dt;
        if (f.trailTimer <= 0) {
          f.trailTimer = 0.025 + Math.random() * 0.035; // บินเร็ว → โปรยถี่ให้เห็นเป็นสาย
          this.particles.push({
            kind: 'dot',
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 12,
            vy: 8 + Math.random() * 14,
            gravity: 0,
            life: 0.5 + Math.random() * 0.5,
            age: 0,
            size: 1 + Math.random() * 1.6,
            color: f.gold ? '#ffd98c' : '#aee4ff',
          });
        }
        if (Math.random() < dt * 0.4) this.spawnGlint(x, y, 12 + Math.random() * 12, 0.5);
      }
    }
    ctx.restore();
  }

  // สปอตไลท์นุ่มๆ + เงาสัมผัส ใต้กระติ๊บช่วงเลือกภาษา/แนะนำตัว
  drawKratibGlow(ctx) {
    if (this.state !== 'lang' && this.state !== 'dialog') return;
    const s = this.imgState;
    const gy = s.cy + (this.img.offsetHeight || 300) * 0.55;

    // ★ v8: เงาสัมผัสมืดใต้ตัวก่อน (ให้กระติ๊บ "ยืนอยู่ในฉากจริง" ไม่ลอยแปะ)
    ctx.save();
    ctx.translate(s.cx, gy + 8);
    ctx.scale(1, 0.26);
    const sh = ctx.createRadialGradient(0, 0, 0, 0, 0, 115);
    sh.addColorStop(0, 'rgba(2, 6, 16, 0.42)');
    sh.addColorStop(1, 'rgba(2, 6, 16, 0)');
    ctx.fillStyle = sh;
    ctx.fillRect(-115, -115, 230, 230);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(s.cx, gy);
    ctx.scale(1, 0.3);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 170);
    g.addColorStop(0, 'rgba(120, 190, 255, 0.14)');
    g.addColorStop(1, 'rgba(120, 190, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(-170, -170, 340, 340);
    ctx.restore();
  }

  // (drawMoonbeam — ลำแสงจันทร์สาดลงทะเลสาบ ถูกถอดออก 2026-07-20 ตามคำสั่งเจ้าของ)

  // ประกายดาว 4 แฉก วิบวับตามโลโก้/กระติ๊บ/จังหวะตูม
  drawGlints(ctx, dt) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const gl of this.glints) {
      gl.age += dt;
      const p = gl.age / gl.life;
      if (p >= 1) continue;
      const k = Math.sin(Math.PI * p); // โผล่-โต-หด
      const sz = gl.size * (0.35 + 0.65 * k);
      ctx.globalAlpha = k;
      ctx.save();
      ctx.translate(gl.x, gl.y);
      ctx.rotate(gl.rot + gl.spin * gl.age);
      ctx.drawImage(this.sparkSprite, -sz / 2, -sz / 2, sz, sz);
      ctx.restore();
    }
    this.glints = this.glints.filter((gl) => gl.age < gl.life);
    ctx.restore();
  }

  spawnGlint(x, y, size = 30, life = 0.9) {
    if (this.glints.length >= 24) return;
    this.glints.push({
      x, y, size, life, age: 0,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 1.2,
    });
  }

  // แสงวาบสีฟ้ากระจายเต็มจอตอนตูม (เสริม flash ขาวของ DOM)
  drawApexFlash(ctx, dt) {
    if (!this.apexFlash) return;
    this.apexFlash.age += dt;
    const k = 1 - this.apexFlash.age / 0.5;
    if (k <= 0) {
      this.apexFlash = null;
      return;
    }
    const R = Math.max(innerWidth, innerHeight);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(
      this.apexFlash.x, this.apexFlash.y, 0,
      this.apexFlash.x, this.apexFlash.y, R,
    );
    g.addColorStop(0, `rgba(190, 235, 255, ${0.4 * k})`);
    g.addColorStop(0.5, `rgba(160, 107, 255, ${0.18 * k})`);
    g.addColorStop(1, 'rgba(190, 235, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    ctx.restore();
  }

  // ดาวตกวิ่งเฉียงผ่านท้องฟ้าเป็นระยะ (เฉพาะจอ Title)
  drawShooters(ctx, dt) {
    if (this.state === 'title') {
      this.shootTimer -= dt;
      if (this.shootTimer <= 0 && this.shooters.length < 3) {
        this.shootTimer = 1.8 + Math.random() * 2.6;
        this.shooters.push({
          x: Math.random() * innerWidth * 0.7,
          y: Math.random() * innerHeight * 0.3,
          vx: 620 + Math.random() * 320,
          vy: 150 + Math.random() * 110,
          age: 0,
          life: 0.85,
        });
      }
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const sh of this.shooters) {
      sh.age += dt;
      const k = 1 - sh.age / sh.life;
      if (k <= 0) continue;
      const hx = sh.x + sh.vx * sh.age;
      const hy = sh.y + sh.vy * sh.age;
      const tail = 0.15; // ความยาวหางเป็นวินาทีของการเคลื่อนที่
      const g = ctx.createLinearGradient(hx, hy, hx - sh.vx * tail, hy - sh.vy * tail);
      g.addColorStop(0, `rgba(255, 255, 255, ${0.9 * k})`);
      g.addColorStop(0.4, `rgba(77, 227, 255, ${0.5 * k})`);
      g.addColorStop(1, 'rgba(160, 107, 255, 0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx - sh.vx * tail, hy - sh.vy * tail);
      ctx.stroke();
    }
    this.shooters = this.shooters.filter((sh) => sh.age < sh.life);
    ctx.restore();
  }

  drawStars(ctx) {
    ctx.fillStyle = '#e8ecf8';
    const T = REDUCED ? 0 : this.t;
    for (const layer of this.starLayers) {
      for (const st of layer) {
        // parallax: ชั้นใกล้ลอยเร็วกว่า (ห่อกลับเมื่อพ้นขอบ)
        const x = REDUCED ? st.x : (st.x - T * st.drift) % innerWidth;
        const px = x < 0 ? x + innerWidth : x;
        const tw = 0.5 + 0.5 * Math.sin(T * st.speed + st.phase);
        ctx.globalAlpha = 0.15 + tw * 0.55;
        ctx.fillRect(px, st.y, st.size, st.size);
        // ดาวชั้นใกล้ตอนสว่างสุด = ประกาย 4 แฉกวิบ
        if (!REDUCED && st.drift === 9 && tw > 0.92) {
          ctx.globalAlpha = (tw - 0.92) * 8;
          const sz = st.size * 11;
          ctx.drawImage(this.sparkSprite, px - sz / 2, st.y - sz / 2, sz, sz);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  // แสงรวมตัวที่พื้นก่อนพุ่ง
  drawChargeGlow(ctx) {
    const T_CHARGE = 0.65;
    const p = Math.min(this.stateT / T_CHARGE, 1);
    const cx = innerWidth / 2;
    const cy = innerHeight * 0.97;
    const r = 60 + p * 260;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(77, 227, 255, ${0.45 * p})`);
    g.addColorStop(0.5, `rgba(160, 107, 255, ${0.2 * p})`);
    g.addColorStop(1, 'rgba(77, 227, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  }

  drawTrail(ctx, dt) {
    for (const tr of this.trail) tr.age += dt;
    this.trail = this.trail.filter((tr) => tr.age < 0.28);
    for (const tr of this.trail) {
      const k = 1 - tr.age / 0.28;
      ctx.globalAlpha = k * 0.3;
      ctx.drawImage(this.img, tr.cx - tr.w / 2, tr.cy - tr.h / 2, tr.w, tr.h);
    }
    ctx.globalAlpha = 1;
  }

  update(dt) {
    // ★ v9: smooth เมาส์ parallax (lerp นุ่มๆ ไม่กระตุกตามเคอร์เซอร์)
    this.px += (this.ptx - this.px) * Math.min(1, dt * 4);
    this.py += (this.pty - this.py) * Math.min(1, dt * 4);

    // ฝุ่นแสงลอยตลอดช่วง intro (ยกเว้น reduce motion)
    if (!REDUCED && this.state !== 'enter') {
      this.dustTimer -= dt;
      if (this.dustTimer <= 0) {
        this.dustTimer = 0.12;
        this.particles.floatDust(Math.random() * innerWidth, innerHeight + 10);
      }

      // ประกายดาววิบวับบนโลโก้ (ก่อนแตก) และรอบกระติ๊บ
      this.glintTimer -= dt;
      if (this.glintTimer <= 0) {
        this.glintTimer = 0.45 + Math.random() * 0.5;
        // (ประกายดาว 4 แฉกบนตัวอักษรโลโก้ ถูกถอดออก 2026-07-20 — เจ้าของว่ารกเกินไป
        //  ประกายรอบกระติ๊บและบนผิวน้ำยังอยู่)
        if (this.state === 'title' || this.state === 'lang' || this.state === 'dialog') {
          const s0 = this.imgState;
          const h0 = this.img.offsetHeight || 300;
          this.spawnGlint(s0.cx + (Math.random() - 0.5) * h0 * 0.8,
            s0.cy - h0 * (0.15 + Math.random() * 0.3), 14 + Math.random() * 18);
        }
        // ★ v8: ประกายระยิบบนทางแสงจันทร์กลางทะเลสาบ (จุดเล็ก วิบไว)
        this.spawnGlint(innerWidth * (0.58 + Math.random() * 0.28),
          innerHeight * (0.77 + Math.random() * 0.05),
          7 + Math.random() * 10, 0.45 + Math.random() * 0.35);
      }
    }

    const s = this.imgState;
    const restY = innerHeight * 0.44;
    const imgH = this.img.offsetHeight || 300;
    const peekY = innerHeight + imgH * 0.18; // โผล่หัว ~1/3 บนของภาพพ้นขอบล่าง

    if (this.state === 'title') {
      // กระติ๊บแอบมองจากขอบล่างจอ โยกตัวเบาๆ
      s.cx = innerWidth / 2;
      s.cy = peekY + (REDUCED ? 0 : Math.sin(this.t * 2.1) * 6);
      s.rot = REDUCED ? 0 : Math.sin(this.t * 1.5) * 2.5;
      s.sx = 1;
      s.sy = 1;
    } else if (this.state === 'charge') {
      // เกร็งก่อนพุ่ง: มุดลงใต้จอ (ท่าเตรียม) + particle ถูกดูดเข้าหาจุดปล่อยตัว
      const T_CHARGE = 0.65;
      const duck = Math.min(this.stateT / T_CHARGE, 1);
      s.cy = lerp(this.chargeFromY ?? peekY, innerHeight + imgH * 0.62, duck * duck);
      s.rot = 0;
      const target = { x: innerWidth / 2, y: innerHeight * 0.95 };
      for (let i = 0; i < 3; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = 180 + Math.random() * 420;
        const px = target.x + Math.cos(a) * d;
        const py = target.y + Math.sin(a) * d * 0.6;
        const spd = 3.2; // วิ่งถึงใน ~0.3s
        this.particles.push({
          kind: 'dot', x: px, y: py,
          vx: (target.x - px) * spd, vy: (target.y - py) * spd,
          gravity: 0, life: 0.3, age: 0,
          size: 1.6 + Math.random() * 2.4,
          color: ['#4de3ff', '#a06bff', '#ff6bd6'][(Math.random() * 3) | 0],
        });
      }
      if (this.stateT >= T_CHARGE) this.beginLeap();
    } else if (this.state === 'leap' && !REDUCED) {
      const T_RISE = 0.5, T_SETTLE = 0.55;
      const t = this.stateT;
      if (t < T_RISE) {
        // พุ่งขึ้น: ยืดตัวตามความเร็ว + motion trail
        const p = easeOutCubic(t / T_RISE);
        s.cy = lerp(this.leapFromY ?? innerHeight + 320, innerHeight * 0.30, p);
        s.sy = 1 + 0.3 * (1 - p);
        s.sx = 1 - 0.18 * (1 - p);
        s.rot = Math.sin(t * 18) * 4 * (1 - p);
        this.trail.push({
          cx: s.cx, cy: s.cy,
          w: this.img.offsetWidth * s.sx, h: this.img.offsetHeight * s.sy,
          age: 0,
        });
      } else if (t < T_RISE + T_SETTLE) {
        if (!this.burstDone) {
          this.burstDone = true;
          this.apexImpact();
        }
        // ย้วยลงมานั่งตำแหน่งพัก แบบเด้ง overshoot
        const p = easeOutBack((t - T_RISE) / T_SETTLE);
        s.cy = lerp(innerHeight * 0.30, restY, p);
        const squash = Math.sin(Math.min((t - T_RISE) / T_SETTLE, 1) * Math.PI);
        s.sy = 1 - 0.14 * squash;
        s.sx = 1 + 0.1 * squash;
        s.rot = 0;
      } else {
        this.showLang();
      }
    } else if (this.state === 'lang' || this.state === 'dialog') {
      // ลอยหายใจนุ่มๆ ระหว่างรอเลือกภาษา/แนะนำตัว
      s.cy = restY + Math.sin(this.t * 2.2) * (REDUCED ? 0 : 8);
      s.rot = REDUCED ? 0 : Math.sin(this.t * 1.7) * 2;
      s.sx = 1;
      s.sy = 1;
    } else if (this.state === 'enter') {
      if (REDUCED) {
        // reduce motion: รอ fade จบแล้วเข้าเกมเลย
        if (this.stateT >= 0.65) {
          this.setState('done');
          this.root.style.display = 'none';
          this.onFinish(this.finishTarget);
          return;
        }
      } else {
        // กระติ๊บบินพุ่งเข้าดวงจันทร์ใหญ่ (ย่อเล็กลงจนหายเข้าไป)
        const dur = this.finishFast ? 0.3 : 0.8;
        const p = Math.min(this.stateT / dur, 1);
        const e = p * p; // เร่งความเร็วเข้า
        const mx = innerWidth * 0.72;
        const my = innerHeight * 0.19;
        s.cx = lerp(this.flyFrom.cx, mx, e);
        s.cy = lerp(this.flyFrom.cy, my, e);
        const sc = lerp(this.flyFrom.sx, 0.04, e);
        s.sx = sc;
        s.sy = sc;
        s.rot = e * 30; // ควงตัวนิดๆ ระหว่างพุ่ง
        if (p >= 1) {
          this.img.style.opacity = '0'; // หายเข้าไปในดวงจันทร์
          this.spawnGlint(mx, my, 70, 0.6);
          audio.play('riser');
          this.setState('zoom');
        }
      }
    } else if (this.state === 'zoom') {
      // กล้องซูมพุ่งเข้าดวงจันทร์ → แสงท่วมจอ → แฟลชขาว → โผล่ในสตูดิโอ
      const dur = this.finishFast ? 0.55 : 1.15;
      const p = Math.min(this.stateT / dur, 1);
      this.zoomP = p;
      this.zoomK = 1 + p * p * p * 7;
      if (p > 0.8 && !this.zoomFlashDone) {
        this.zoomFlashDone = true;
        this.flash.classList.add('go');
        this.root.classList.add('intro-exit');
        audio.play('impact');
        audio.play('sparkle');
      }
      if (p >= 1) {
        this.setState('done');
        this.root.style.display = 'none';
        this.onFinish(this.finishTarget);
        return;
      }
    }

    this.applyImgTransform();
  }

  applyImgTransform() {
    const s = this.imgState;
    const h = this.img.offsetHeight || 300;
    const w = this.img.offsetWidth || 300;
    this.img.style.transform =
      `translate(${s.cx - w / 2}px, ${s.cy - h / 2}px) scale(${s.sx}, ${s.sy}) rotate(${s.rot}deg)`;
  }
}
