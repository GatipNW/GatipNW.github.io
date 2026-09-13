// ============================================
// renderer.js — วาดฉาก "ห้องสมุดบนดวงจันทร์" (★ ฉากใหม่ 2026-09-13 ตามบรีฟฉบับรวม)
//
// ชั้นภาพ (วาดตามลำดับ — ไม่ใช่ภาพแบนใบเดียว):
//   1. lib-view.webp  วิวนอกหน้าต่าง (parallax เบาๆ ตามกล้อง) + ดาวกะพริบ
//   2. lib-base.webp  พื้น + ผนัง + กรอบหน้าต่าง (RGBA ช่องหน้าต่างโปร่ง) — แสง/เงาอบไว้แล้ว
//   3. วงแสงบนพื้นใต้วัตถุกดได้ + เอฟเฟกต์คลิก
//   4. วัตถุ (ตู้เกม/ชั้นหนังสือ/โต๊ะ/ของตกแต่ง) + ตัวละคร เรียงตามแกน Y (depth sort)
//   5. composite เบา (bloom ต่ำมาก + tilt-shift ล่างสุด) → ป้ายชื่อบนจอจริง = คมเสมอ
//
// กติกา perf เดิม (CLAUDE.md): ห้าม shadowBlur/gradient ในลูปเฟรม — ใช้สไปรต์แคช (glowFor/poolFor)
// ห้ามสร้าง object ใหม่ทุกเฟรม (this._dr + sortByY ถาวร) · particle เหลือแค่ฝุ่นเท้า cap 40
// ★ ตู้ arcade = เวกเตอร์เดิมที่เจ้าของชอบ (drawArcade ยกมาทั้งก้อน แค่เพิ่มฐาน/เงา)
// ============================================

const COLORS = {
  space: '#0b0914',
  shadow: 'rgba(8, 6, 16, 0.5)',
  wood: '#2e2540',             // ไม้เข้มอมม่วง (ชั้นหนังสือ/โต๊ะ)
  woodDark: '#1d1730',
  woodLite: '#463a5e',
  gold: '#c9a25a',
  goldDim: '#7d6236',
  paper: '#f3ecdd',
  playerGlow: '#b9a6ff',
};

// ---- HD-2D เบามาก: bloom ต่ำ + เบลอเฉพาะ 6% ล่างสุด (บรีฟ: ลด bloom/แสงเคลื่อนไหวที่แย่งข้อความ) ----
const TILT = {
  scale: 0.14,
  sharpTop: 0,      // ★ ห้ามเบลอด้านบน — หน้าต่าง/โลกอยู่ตรงนั้น
  sharpBot: 0.94,
  maxAlpha: 0.30,
  bloom: 0.05,
};

const PART_CAP = 40;

// สีขีดบอกหมวดบนป้ายชื่อ (work / about / connect)
const LABEL_CATS = {
  work: '#e5484d',
  about: '#7c6cff',
  connect: '#d9a441',
};

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sortByY(a, b) { return a.sortY - b.sortY; }

export class Renderer {
  constructor(canvas, sprites = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sprites = sprites; // { player: HTMLImageElement }
    this.dpr = 1;
    this.screenW = 0;
    this.screenH = 0;

    this.baseImg = new Image();
    this.viewImg = new Image();
    this.roomLoaded = false;
    this.fx = null;
    this.parts = [];
    this.wake = new Map();
    this.clickFx = [];
    this.prevTime = null;
    this.dustT = 0;
    this.objPools = new Map();
    this.labelWidths = new Map();
    this.decor = [];
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      && !document.documentElement.classList.contains('fx-full');

    // ดาวกะพริบในหน้าต่าง (จุดเล็กๆ ไม่กี่ดวง — ไม่ใช่ particle)
    const rnd = mulberry32(2026);
    this.twinkles = Array.from({ length: 14 }, () => ({
      x: 0.05 + rnd() * 0.9, y: 0.06 + rnd() * 0.55, p: rnd() * Math.PI * 2, f: 0.6 + rnd() * 1.2,
    }));

    this.sceneBuf = document.createElement('canvas');
    this.sceneCtx = this.sceneBuf.getContext('2d');
    this.blurBuf = document.createElement('canvas');
    this.blurCtx = this.blurBuf.getContext('2d');
    this.tiltReady = false;
    this.tiltOn = !this.reduced;
  }

  // ภาพห้อง (~50KB รวม) — เรียกหลัง Title พร้อม (main.js) · ระหว่างนี้มี fallback วาดสด
  preloadRoom() {
    if (this.roomLoaded) return;
    this.roomLoaded = true;
    this.baseImg.src = 'assets/lib-base.webp';
    this.viewImg.src = 'assets/lib-view.webp';
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.screenW = window.innerWidth;
    this.screenH = window.innerHeight;
    this.canvas.width = Math.round(this.screenW * this.dpr);
    this.canvas.height = Math.round(this.screenH * this.dpr);
    const w = this.canvas.width, h = this.canvas.height;
    if (!w || !h) return;
    this.sceneBuf.width = w;
    this.sceneBuf.height = h;
    this.blurBuf.width = Math.max(1, Math.round(w * TILT.scale));
    this.blurBuf.height = Math.max(1, Math.round(h * TILT.scale));
    this.tiltReady = true;
  }

  // ---------- วาดหนึ่งเฟรม ----------
  draw(state) {
    const { camera, map, objects, player, time, waypoint, hover, prompt } = state;
    const dt = this.prevTime == null ? 0 : Math.min(time - this.prevTime, 0.05);
    this.prevTime = time;

    const useTilt = this.tiltOn && this.tiltReady === true;
    const ctx = useTilt ? this.sceneCtx : this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = COLORS.space;
    ctx.fillRect(0, 0, this.screenW, this.screenH);

    ctx.save();
    ctx.scale(camera.scale, camera.scale);
    ctx.translate(-camera.left, -camera.top);

    if (!this.fx) this.buildFxSprites();
    this.drawView(ctx, camera, map, time);
    if (this.baseImg.complete && this.baseImg.naturalWidth > 0) {
      ctx.drawImage(this.baseImg, 0, 0, map.width, map.height);
    } else {
      this.drawFallbackRoom(ctx, map);
    }

    this.drawObjectPools(ctx, objects, time);
    this.drawClickFx(ctx, dt);
    if (!player.hidden) this.drawPlayerLight(ctx, player);

    for (const o of objects) {
      const w0 = this.wake.get(o.id) ?? 0;
      const target = o === hover ? 1 : 0;
      this.wake.set(o.id, w0 + (target - w0) * Math.min(1, dt * 6));
    }

    // depth sort: วัตถุ + ของตกแต่ง + ผู้เล่น ตามขอบล่าง (จุดสัมผัสพื้น)
    const dr = this._dr || (this._dr = []);
    let n = 0;
    const put = (sortY, kind, obj) => {
      const slot = dr[n] || (dr[n] = { sortY: 0, kind: '', obj: null });
      slot.sortY = sortY; slot.kind = kind; slot.obj = obj;
      n++;
    };
    for (const o of objects) put(o.y + o.h, 'object', o);
    for (const d of this.decor) put(d.y + d.h, 'decor', d);
    put(player.y + player.h / 2, 'player', player);
    if (dr.length > n) dr.length = n;
    dr.sort(sortByY);
    for (let i = 0; i < n; i++) {
      const d = dr[i];
      if (d.kind === 'player') this.drawPlayer(ctx, d.obj, time);
      else if (d.kind === 'decor') this.drawDecor(ctx, d.obj, time);
      else this.drawObject(ctx, d.obj, time, this.wake.get(d.obj.id) ?? 0);
    }

    this.updateDust(dt, player);
    this.drawDust(ctx);
    ctx.restore();

    if (useTilt) this.composite();

    const top = this.ctx;
    top.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    top.save();
    top.scale(camera.scale, camera.scale);
    top.translate(-camera.left, -camera.top);
    this.drawLabels(top, objects, state.labels, hover, prompt, time, camera);
    if (waypoint) this.drawWaypoint(top, waypoint, time);
    top.restore();
  }

  // วิวนอกหน้าต่าง: ภาพนิ่ง + เลื่อนตามกล้องเล็กน้อย (parallax ของที่อยู่ไกล = ขยับน้อยกว่าห้อง)
  drawView(ctx, camera, map, time) {
    const w = map.window;
    const img = this.viewImg;
    const k = 0.05; // ยิ่งไกล ยิ่งขยับน้อย
    const ox = (camera.x - map.width / 2) * k;
    const oy = (camera.y - map.height / 2) * k * 0.5;
    const pad = 40;
    const vx = w.x0 - pad + ox;
    const vy = w.top - 20 + oy;
    const vw = (w.x1 - w.x0) + pad * 2;
    const vh = (w.bottom - w.top) + 40;
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, vx, vy, vw, vh);
    } else {
      ctx.fillStyle = '#0a0816';
      ctx.fillRect(vx, vy, vw, vh);
    }
    if (this.reduced) return;
    // ดาวกะพริบ (สไปรต์ soft เล็กๆ)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const s of this.twinkles) {
      const a = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(time * s.f + s.p));
      ctx.globalAlpha = a;
      const r = 3;
      ctx.drawImage(this.fx.soft, vx + s.x * vw - r, vy + s.y * vh - r, r * 2, r * 2);
    }
    ctx.restore();
  }

  // fallback ระหว่างรอภาพ (พื้นเรียบ + ผนัง — ไม่ให้จอว่าง)
  drawFallbackRoom(ctx, map) {
    ctx.fillStyle = '#403a54';
    ctx.fillRect(0, 0, map.width, map.height);
    ctx.fillStyle = '#2a2240';
    ctx.fillRect(0, 0, map.width, map.northWallH);
    const T = map.wallThickness;
    ctx.fillRect(0, 0, T, map.height);
    ctx.fillRect(map.width - T, 0, T, map.height);
    ctx.fillRect(0, map.height - T, map.width, T);
  }

  composite() {
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    const bw = this.blurBuf.width, bh = this.blurBuf.height;
    const bc = this.blurCtx;
    bc.setTransform(1, 0, 0, 1, 0, 0);
    bc.globalAlpha = 1;
    bc.globalCompositeOperation = 'source-over';
    bc.clearRect(0, 0, bw, bh);
    bc.drawImage(this.sceneBuf, 0, 0, bw, bh);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(this.sceneBuf, 0, 0);
    if (TILT.bloom > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = TILT.bloom;
      ctx.drawImage(this.blurBuf, 0, 0, bw, bh, 0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (TILT.sharpBot < 1) this.tiltBand(ctx, h * TILT.sharpBot, h, 8);
    ctx.globalAlpha = 1;
  }

  tiltBand(ctx, y0, y1, slices) {
    const h = this.canvas.height, w = this.canvas.width;
    const bw = this.blurBuf.width, bh = this.blurBuf.height;
    const span = y1 - y0;
    if (span <= 0) return;
    const step = span / slices;
    for (let i = 0; i < slices; i++) {
      const dy = y0 + step * i;
      const t = 1 - (i + 0.5) / slices;
      const a = TILT.maxAlpha * (1 - t) * (1 - t);
      if (a < 0.01) continue;
      ctx.globalAlpha = a;
      ctx.drawImage(this.blurBuf, 0, (dy / h) * bh, bw, (step / h) * bh, 0, dy, w, step);
    }
  }

  // ---------- sprite cache ----------
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
    let [c, g] = mk(64);
    radial(g, 64, [[0, 'rgba(235, 228, 255, 0.9)'], [1, 'rgba(235, 228, 255, 0)']]);
    this.fx.soft = c;
    [c, g] = mk(384);
    radial(g, 384, [[0, 'rgba(200, 185, 255, 0.22)'], [0.5, 'rgba(180, 160, 255, 0.08)'], [1, 'rgba(180, 160, 255, 0)']]);
    this.fx.light = c;
    [c, g] = mk(256);
    radial(g, 256, [[0, 'rgba(185, 166, 255, 0.5)'], [0.42, 'rgba(185, 166, 255, 0.16)'], [1, 'rgba(185, 166, 255, 0)']]);
    this.fx.glow = c;
    // แสงอุ่นของโคม (สำหรับของตกแต่ง/โต๊ะ)
    [c, g] = mk(256);
    radial(g, 256, [[0, 'rgba(255, 205, 140, 0.55)'], [0.4, 'rgba(255, 190, 120, 0.18)'], [1, 'rgba(255, 190, 120, 0)']]);
    this.fx.warm = c;
  }

  glowFor(color) {
    if (!this._glows) this._glows = new Map();
    let c = this._glows.get(color);
    if (!c) {
      const S = 256;
      c = document.createElement('canvas');
      c.width = c.height = S;
      const g = c.getContext('2d');
      const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      gr.addColorStop(0, `${color}aa`);
      gr.addColorStop(0.38, `${color}44`);
      gr.addColorStop(1, `${color}00`);
      g.fillStyle = gr;
      g.fillRect(0, 0, S, S);
      this._glows.set(color, c);
    }
    return c;
  }

  poolFor(color) {
    let c = this.objPools.get(color);
    if (!c) {
      c = document.createElement('canvas');
      c.width = c.height = 192;
      const g = c.getContext('2d');
      const gr = g.createRadialGradient(96, 96, 0, 96, 96, 96);
      gr.addColorStop(0, `${color}55`);
      gr.addColorStop(1, `${color}00`);
      g.fillStyle = gr;
      g.fillRect(0, 0, 192, 192);
      this.objPools.set(color, c);
    }
    return c;
  }

  // ---------- เอฟเฟกต์คลิก (วงกระเพื่อม = รู้ว่าคลิกติด) ----------
  addClickFx(x, y, color = '#d9c8ff') {
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
      ctx.globalAlpha = a * 0.5;
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.ellipse(f.x, f.y, 3.5, 1.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    this.clickFx = this.clickFx.filter((f) => f.t < 0.55);
    ctx.restore();
  }

  // วงแสงสีจางบนพื้นใต้วัตถุกดได้ (นิ่ง — reduced motion ไม่ต่างกัน)
  drawObjectPools(ctx, objects, time) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const o of objects) {
      const wake = this.wake.get(o.id) ?? 0;
      const pulse = this.reduced ? 0.8 : 0.8 + 0.2 * Math.sin(time * 1.1 + o.x * 0.02);
      ctx.globalAlpha = (0.22 + 0.4 * wake) * pulse;
      const w = o.w * 1.7;
      const h = o.w * 0.9;
      ctx.drawImage(this.poolFor(o.color), o.x + o.w / 2 - w / 2, o.y + o.h - h / 2 + 4, w, h);
    }
    ctx.restore();
  }

  drawPlayerLight(ctx, player) {
    const s = 300;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.7;
    ctx.drawImage(this.fx.light, player.x - s / 2, player.y - s / 2 + 10, s, s);
    ctx.restore();
  }

  // ---------- ฝุ่นเท้า (particle เดียวที่เหลือ — cap 40) ----------
  updateDust(dt, player) {
    if (this.reduced) return;
    for (const p of this.parts) p.t += dt;
    this.parts = this.parts.filter((p) => p.t < p.life);
    if (player.moving && !player.hidden) {
      this.dustT -= dt;
      if (this.dustT <= 0 && this.parts.length < PART_CAP) {
        this.dustT = 0.12;
        this.parts.push({
          x: player.x + (Math.random() - 0.5) * 20, y: player.y + player.h / 2 - 2,
          r: 4 + Math.random() * 4, t: 0, life: 0.5,
        });
      }
    }
  }

  drawDust(ctx) {
    if (!this.parts.length) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.parts) {
      const k = p.t / p.life;
      ctx.globalAlpha = 0.28 * (1 - k);
      const r = p.r * (1 + k * 1.5);
      ctx.drawImage(this.fx.soft, p.x - r, p.y - r - k * 8, r * 2, r * 2);
    }
    ctx.restore();
  }

  // ---------- วัตถุ interact ----------
  drawObject(ctx, obj, time, wake = 0) {
    // เงาสัมผัสพื้น (วัตถุไม่ลอย)
    ctx.fillStyle = COLORS.shadow;
    ctx.beginPath();
    ctx.ellipse(obj.x + obj.w / 2, obj.y + obj.h + 2, obj.w * 0.56, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // ฮาโลสีประจำ — ตู้เกมสว่างกว่าชั้นหนังสือเล็กน้อย (ผลงานเกม = หลัก)
    {
      const cx = obj.x + obj.w / 2;
      const cy = obj.y + obj.h / 2;
      const base = obj.type === 'arcade' ? 0.30 : 0.16;
      const r = Math.max(obj.w, obj.h) * (1.35 + 0.4 * wake);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = base + 0.45 * wake;
      ctx.drawImage(this.glowFor(obj.color), cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
    }

    ctx.save();
    switch (obj.type) {
      case 'arcade': this.drawArcade(ctx, obj, time, wake); break;
      case 'book': this.drawBookSet(ctx, obj, time, wake); break;
      case 'reception': this.drawReception(ctx, obj, time, wake); break;
    }
    if (wake > 0.02) {
      ctx.strokeStyle = 'rgba(255, 250, 235, 0.8)';
      ctx.globalAlpha = wake;
      ctx.lineWidth = 2;
      this.roundRect(ctx, obj.x - 4, obj.y - 4, obj.w + 8, obj.h + 8, 12);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // ตู้เกม — ★ เวกเตอร์เดิมที่เจ้าของชอบ (คงรูปทรง/บุคลิก) + ฐานหินเข้าฉากห้องสมุด
  drawArcade(ctx, obj, time, wake = 0) {
    const { x, y, w, h } = obj;
    // ฐานเตี้ยสีหิน ให้ตู้ "วางบนพื้น"
    ctx.fillStyle = '#1a1526';
    this.roundRect(ctx, x - 3, y + h - 8, w + 6, 12, 4);
    ctx.fill();
    // ตัวตู้
    ctx.fillStyle = '#1c1a3a';
    this.roundRect(ctx, x, y + 14, w, h - 14, 10);
    ctx.fill();
    ctx.strokeStyle = obj.color;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 2;
    this.roundRect(ctx, x, y + 14, w, h - 14, 10);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // marquee โค้ง
    ctx.fillStyle = obj.color;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 16);
    ctx.quadraticCurveTo(x + w / 2, y - 10, x + w - 4, y + 16);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    // จอ: อวกาศจิ๋ว + ยานเด้งไปมา
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
    const tt = this.reduced ? 0 : time;
    for (let i = 0; i < 5; i++) {
      const stY = sy + ((tt * 26 + i * 23) % sh);
      ctx.fillStyle = 'rgba(210, 230, 255, 0.7)';
      ctx.fillRect(sx + ((i * 37) % sw), stY, 1.6, 1.6);
    }
    const shipX = sx + sw / 2 + Math.sin(tt * 2 + obj.x) * sw * 0.26;
    ctx.fillStyle = obj.color;
    ctx.beginPath();
    ctx.moveTo(shipX, sy + sh - 12);
    ctx.lineTo(shipX - 6, sy + sh - 4);
    ctx.lineTo(shipX + 6, sy + sh - 4);
    ctx.closePath();
    ctx.fill();
    if (wake > 0.05) {
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
    // แผงคุม
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

  // ชุดหนังสือ 1 หมวด: ตู้ไม้เข้มขอบทองหม่น 3 ชั้น + สันหนังสือโทนสีประจำ + ป้ายสัญลักษณ์
  drawBookSet(ctx, obj, time, wake = 0) {
    const { x, y, w, h } = obj;
    const c = obj.color;
    // ตัวตู้
    ctx.fillStyle = COLORS.woodDark;
    this.roundRect(ctx, x, y, w, h, 5);
    ctx.fill();
    ctx.fillStyle = COLORS.wood;
    ctx.fillRect(x + 4, y + 6, w - 8, h - 12);
    // ขอบทองหม่นบน/ล่าง
    ctx.fillStyle = COLORS.goldDim;
    ctx.fillRect(x, y + 4, w, 2);
    ctx.fillRect(x, y + h - 8, w, 2);
    // ชั้น 3 ชั้น + หนังสือ (ตำแหน่งล็อกตามสีวัตถุ = ไม่สุ่มใหม่ทุกเฟรม)
    const rnd = mulberry32(obj.x * 7 + obj.y);
    const shelves = 3;
    const shelfH = (h - 20) / shelves;
    for (let s = 0; s < shelves; s++) {
      const sy = y + 8 + s * shelfH;
      ctx.fillStyle = COLORS.woodLite;
      ctx.fillRect(x + 4, sy + shelfH - 3, w - 8, 3);
      let bx = x + 7;
      const top = sy + 5;
      const maxX = x + w - 7;
      while (bx < maxX - 5) {
        const bw = 5 + rnd() * 7;
        if (bx + bw > maxX) break;
        const bh = shelfH - 9 - rnd() * 6;
        const tone = rnd();
        ctx.fillStyle = tone < 0.55 ? c : tone < 0.8 ? COLORS.gold : '#e9e1f5';
        ctx.globalAlpha = tone < 0.55 ? 0.75 + rnd() * 0.25 : 0.6;
        ctx.fillRect(bx, top + (shelfH - 9 - bh), bw, bh);
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#000';
        ctx.fillRect(bx + bw - 1.5, top + (shelfH - 9 - bh), 1.5, bh);
        ctx.globalAlpha = 1;
        bx += bw + 1.5;
      }
    }
    // ป้ายสัญลักษณ์บนหน้าตู้ (วงกลมสีประจำ + ไอคอนเส้น) — ชื่อหมวดเป็นป้ายข้อความข้างบน (เปลี่ยนภาษาได้)
    const px = x + w / 2;
    const py = y + h - 20;
    ctx.fillStyle = '#17121f';
    ctx.beginPath();
    ctx.arc(px, py, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(px, py, 12, 0, Math.PI * 2);
    ctx.stroke();
    this.drawIcon(ctx, obj.icon, px, py, c);
    // โคมอ่านหนังสือเล็กบนหลังตู้ (ไฟอุ่น)
    const lx = x + w - 14;
    const ly = y - 2;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.5 + 0.25 * wake;
    ctx.drawImage(this.fx.warm, lx - 40, ly - 26, 80, 80);
    ctx.restore();
    ctx.fillStyle = COLORS.goldDim;
    ctx.fillRect(lx - 1, ly - 10, 2, 12);
    ctx.fillStyle = '#ffd9a3';
    ctx.beginPath();
    ctx.moveTo(lx - 7, ly - 8);
    ctx.lineTo(lx + 7, ly - 8);
    ctx.lineTo(lx + 4, ly - 14);
    ctx.lineTo(lx - 4, ly - 14);
    ctx.closePath();
    ctx.fill();
  }

  // ไอคอนเส้นเล็กๆ (ตั๋ว/ปุ่มเล่น/ฟองคำพูด/เข็มทิศ/ปากกา/แฟ้ม)
  drawIcon(ctx, icon, cx, cy, c) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = c;
    ctx.fillStyle = c;
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    switch (icon) {
      case 'ticket':
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(-7, -4.5, 14, 9, 1.5) : ctx.rect(-7, -4.5, 14, 9);
        ctx.stroke();
        ctx.setLineDash([1.5, 1.5]);
        ctx.beginPath(); ctx.moveTo(-2, -4.5); ctx.lineTo(-2, 4.5); ctx.stroke();
        ctx.setLineDash([]);
        break;
      case 'play':
        ctx.beginPath(); ctx.moveTo(-4, -6); ctx.lineTo(6, 0); ctx.lineTo(-4, 6); ctx.closePath(); ctx.fill();
        break;
      case 'speech':
        ctx.beginPath();
        ctx.moveTo(-7, -5); ctx.lineTo(7, -5); ctx.lineTo(7, 2); ctx.lineTo(-1, 2); ctx.lineTo(-4, 6); ctx.lineTo(-4, 2); ctx.lineTo(-7, 2); ctx.closePath();
        ctx.stroke();
        break;
      case 'compass':
        ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(3, -3); ctx.lineTo(-1.5, 1.5); ctx.lineTo(-3, 3); ctx.lineTo(1.5, -1.5); ctx.closePath(); ctx.fill();
        break;
      case 'pen':
        ctx.beginPath(); ctx.moveTo(-6, 6); ctx.lineTo(4, -4); ctx.lineTo(6, -2); ctx.lineTo(-4, 8); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-6, 6); ctx.lineTo(-7, 9); ctx.lineTo(-4, 8); ctx.stroke();
        // ถ้วยเล็ก (อีสปอร์ต) มุมขวาล่าง
        ctx.beginPath(); ctx.moveTo(3, 3); ctx.lineTo(8, 3); ctx.lineTo(7, 7); ctx.lineTo(4, 7); ctx.closePath(); ctx.stroke();
        break;
      case 'folder':
        ctx.beginPath(); ctx.moveTo(-7, -4); ctx.lineTo(-2, -4); ctx.lineTo(0, -2); ctx.lineTo(7, -2); ctx.lineTo(7, 5); ctx.lineTo(-7, 5); ctx.closePath(); ctx.stroke();
        break;
      default:
        ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // โต๊ะต้อนรับ: โต๊ะไม้เข้มขอบทอง + สมุดเยี่ยม + โคมอุ่น + ที่ใส่นามบัตร
  drawReception(ctx, obj, time, wake = 0) {
    const { x, y, w, h } = obj;
    // แสงโคมบนโต๊ะ
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.6 + 0.2 * wake;
    ctx.drawImage(this.fx.warm, x + w - 60, y - 60, 130, 130);
    ctx.restore();
    // หน้าโต๊ะ (มองเฉียงจากบน: ท็อป + หน้าตัด)
    ctx.fillStyle = COLORS.woodDark;
    this.roundRect(ctx, x, y + 18, w, h - 18, 8);
    ctx.fill();
    ctx.fillStyle = COLORS.wood;
    this.roundRect(ctx, x, y, w, 40, 8);
    ctx.fill();
    ctx.strokeStyle = COLORS.goldDim;
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, x + 2, y + 2, w - 4, 36, 6);
    ctx.stroke();
    // หน้าตัดโต๊ะ: ลายไม้เส้นบางๆ + ตราดวงจันทร์
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 48 + i * 7);
      ctx.lineTo(x + w - 10, y + 48 + i * 7);
      ctx.stroke();
    }
    ctx.strokeStyle = COLORS.goldDim;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 60, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(x + w / 2 + 3, y + 58, 5.5, 0, Math.PI * 2);
    ctx.fill();
    // สมุดเยี่ยม (เปิดอยู่) ซ้าย
    ctx.fillStyle = COLORS.paper;
    ctx.fillRect(x + 22, y + 8, 46, 26);
    ctx.fillStyle = '#d8ccbd';
    ctx.fillRect(x + 45, y + 8, 1, 26);
    ctx.strokeStyle = 'rgba(60,50,80,0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 26, y + 14 + i * 6);
      ctx.lineTo(x + 42, y + 14 + i * 6);
      ctx.moveTo(x + 49, y + 14 + i * 6);
      ctx.lineTo(x + 64, y + 14 + i * 6);
      ctx.stroke();
    }
    // ที่ใส่นามบัตร (กลาง) — การ์ดดำขอบทอง
    ctx.fillStyle = '#0c0a12';
    ctx.fillRect(x + 92, y + 10, 36, 22);
    ctx.strokeStyle = COLORS.gold;
    ctx.strokeRect(x + 92.5, y + 10.5, 35, 21);
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(x + 97, y + 16, 16, 2);
    ctx.fillStyle = '#eee';
    ctx.fillRect(x + 97, y + 21, 22, 1.5);
    // โคมอ่านหนังสือ (ขวา)
    const lx = x + w - 28;
    ctx.fillStyle = COLORS.goldDim;
    ctx.fillRect(lx - 1.5, y - 14, 3, 30);
    ctx.fillStyle = '#ffd9a3';
    ctx.beginPath();
    ctx.moveTo(lx - 14, y - 10);
    ctx.lineTo(lx + 14, y - 10);
    ctx.lineTo(lx + 8, y - 22);
    ctx.lineTo(lx - 8, y - 22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f7ead2';
    ctx.beginPath();
    ctx.ellipse(lx, y + 16, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // กระดิ่งเล็ก
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(x + 150, y + 22, 6, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x + 142, y + 22, 16, 2.5);
  }

  // ของตกแต่ง (ชนได้ กดไม่ได้): โคมตั้งพื้น / ลูกโลกดวงจันทร์ / ต้นไม้ในโดม
  drawDecor(ctx, d, time) {
    ctx.fillStyle = COLORS.shadow;
    ctx.beginPath();
    ctx.ellipse(d.x + d.w / 2, d.y + d.h + 1, d.w * 0.55, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    const cx = d.x + d.w / 2;
    if (d.type === 'lamp') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.75;
      ctx.drawImage(this.fx.warm, cx - 90, d.y - 130, 180, 180);
      ctx.restore();
      ctx.fillStyle = COLORS.goldDim;
      ctx.fillRect(cx - 2, d.y - 60, 4, 84);
      ctx.fillStyle = '#2a2140';
      ctx.beginPath();
      ctx.ellipse(cx, d.y + d.h - 2, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f3d8a8';
      ctx.beginPath();
      ctx.moveTo(cx - 18, d.y - 56);
      ctx.lineTo(cx + 18, d.y - 56);
      ctx.lineTo(cx + 11, d.y - 84);
      ctx.lineTo(cx - 11, d.y - 84);
      ctx.closePath();
      ctx.fill();
    } else if (d.type === 'globe') {
      // ฐาน + วงแหวน + ลูกโลกจันทร์ (เทา มีหลุม)
      ctx.fillStyle = COLORS.woodDark;
      ctx.beginPath();
      ctx.ellipse(cx, d.y + d.h - 4, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.goldDim;
      ctx.fillRect(cx - 2, d.y + 10, 4, d.h - 14);
      const gy = d.y + 8;
      ctx.fillStyle = '#b9b6c6';
      ctx.beginPath();
      ctx.arc(cx, gy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(70, 66, 90, 0.55)';
      for (const [hx, hy, hr] of [[-6, -5, 4], [5, 4, 3], [-2, 8, 2.5], [8, -6, 2]]) {
        ctx.beginPath();
        ctx.arc(cx + hx, gy + hy, hr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(20, 14, 40, 0.45)';   // ด้านมืด
      ctx.beginPath();
      ctx.arc(cx + 6, gy + 3, 18, -Math.PI * 0.35, Math.PI * 0.65);
      ctx.fill();
      ctx.strokeStyle = COLORS.gold;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, gy, 23, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    } else if (d.type === 'plant') {
      // กระถางไม้ + โดมแก้ว + ต้นไม้เล็ก
      ctx.fillStyle = COLORS.woodDark;
      this.roundRect(ctx, cx - 18, d.y + d.h - 16, 36, 16, 4);
      ctx.fill();
      ctx.fillStyle = '#3f8f6a';
      ctx.beginPath();
      ctx.ellipse(cx - 6, d.y + 8, 9, 12, -0.4, 0, Math.PI * 2);
      ctx.ellipse(cx + 7, d.y + 10, 8, 11, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5fb58a';
      ctx.beginPath();
      ctx.ellipse(cx, d.y + 2, 7, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(210, 225, 255, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, d.y + 12, 24, 26, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(210, 225, 255, 0.08)';
      ctx.beginPath();
      ctx.ellipse(cx, d.y + 12, 24, 26, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---------- ป้ายชื่อ (บนจอจริง หลัง composite = คม) ----------
  drawLabels(ctx, objects, labels, hover, prompt, time, camera) {
    if (!labels) return;
    const viewL = camera ? camera.left : -Infinity;
    // ★ เว้นขวา 100px (CSS) ให้ HUD — ป้ายฝั่งขวาสุดเคยมุดใต้ปุ่มภาษา/Resume
    const viewR = camera ? camera.left + camera.viewW - 100 / camera.scale : Infinity;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 14px "Noto Sans Thai", "Noto Sans JP", system-ui, sans-serif';
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
      const half = (bw / 2) * (1 + wake * 0.08) + 8;
      let cx = Math.min(Math.max(objCx, viewL + half), viewR - half);
      if (!Number.isFinite(cx)) cx = objCx;
      cx = Math.min(Math.max(cx, objCx - 60), objCx + 60);
      const bob = this.reduced ? 0 : Math.sin(time * 1.6 + o.x * 0.013) * 2;
      const y = o.y - 18 + bob;
      const scale = 1 + wake * 0.08;
      const tail = objCx - cx;

      ctx.save();
      ctx.translate(cx, y - bh / 2);
      ctx.scale(scale, scale);
      // ป้ายม่วงเข้มโปร่ง ขอบทองหม่น ตัวหนังสือขาวนวล
      ctx.fillStyle = 'rgba(24, 18, 40, 0.88)';
      this.roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 8);
      ctx.fill();
      const tx = Math.min(Math.max(tail / scale, -bw / 2 + 10), bw / 2 - 10);
      ctx.beginPath();
      ctx.moveTo(tx - 6, bh / 2 - 1);
      ctx.lineTo(tx + 6, bh / 2 - 1);
      ctx.lineTo(tx, bh / 2 + 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = wake > 0.35 ? o.color : 'rgba(201, 162, 90, 0.7)';
      ctx.globalAlpha = 0.7 + wake * 0.3;
      ctx.lineWidth = 1.4;
      this.roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 8);
      ctx.stroke();
      ctx.globalAlpha = 1;
      const catCol = LABEL_CATS[o.cat];
      if (catCol) {
        ctx.fillStyle = catCol;
        this.roundRect(ctx, -bw / 2 + 5, -bh / 2 + 6, 3, bh - 12, 1.5);
        ctx.fill();
      }
      ctx.fillStyle = wake > 0.35 ? '#ffffff' : '#f3ecdd';
      ctx.fillText(text, catCol ? 3 : 0, 1);
      ctx.restore();
    }
    ctx.restore();
  }

  drawWaypoint(ctx, obj, time) {
    const cx = obj.x + obj.w / 2;
    const bob = this.reduced ? 0 : Math.sin(time * 4) * 6;
    const y = obj.y - 36 + bob;
    ctx.save();
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.moveTo(cx, y + 16);
    ctx.lineTo(cx - 12, y - 6);
    ctx.lineTo(cx + 12, y - 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ---------- ตัวละคร: กระติ๊บ — ★ แอนิเมชันจาก "ภาพเดิม" ด้วยโค้ด (2026-09-13) ไม่ได้สร้างสไปรต์ใหม่ ----------
  //   idle  = หายใจ (scaleY เบาๆ) + โยกตัวช้าๆ · walk = เด้งตามจังหวะก้าว + เอียงตัวเข้าหาทิศที่เดิน +
  //   ย่อ/ยืดตอนลงพื้น · interact = ย่อตัวสั้นๆ · flip ซ้าย/ขวา · เงาสัมผัสพื้นนุ่มๆ ที่หดตอนตัวลอย
  //   (ตามบรีฟ: ไม่ฝืนแยกชิ้นส่วน/วาดทิศใหม่ — รักษาหน้าตาเดิม 100%)
  drawPlayer(ctx, player, time) {
    if (player.hidden) return;
    const feetY = player.y + player.h / 2;
    const sprite = this.sprites.player;
    const R = this.reduced;
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      const h = player.spriteH;
      const w = h * (sprite.naturalWidth / sprite.naturalHeight);
      const spd = Math.hypot(player.vx, player.vy) / Math.max(1, player.speed); // 0..1
      const ph = player.walkTime * 10;                                          // เฟสก้าว (ตรงกับเสียงฝีเท้า 0.26s)
      let bob = 0, sx = 1, sy = 1, rot = 0;
      if (player.moving) {
        const k = 0.35 + 0.65 * spd;
        bob = Math.abs(Math.sin(ph)) * 5 * k;
        const land = Math.max(0, Math.cos(ph * 2)) * k;     // จังหวะเท้าแตะพื้น → ย่อนิด
        sy = 1 - 0.04 * land;
        sx = 1 + 0.03 * land;
        const dirX = player.facingLeft ? -1 : 1;
        const lean = (Math.abs(player.vx) > Math.abs(player.vy) ? 0.05 : 0.02) * k;
        rot = Math.sin(ph) * 0.035 * k + lean * dirX;   // เอียงตัวเข้าหาทิศที่เดิน
      } else if (!R) {
        const br = Math.sin(time * 1.7);
        sy = 1 + 0.012 * br;                                 // หายใจ
        sx = 1 - 0.006 * br;
        rot = Math.sin(time * 0.9) * 0.01;                    // โยกช้าๆ
      }
      if (player.interactT > 0) {
        const q = Math.sin(Math.min(player.interactT / 0.25, 1) * Math.PI);
        sy *= 1 - 0.12 * q;
        sx *= 1 + 0.08 * q;
      }
      if (R) { bob = Math.min(bob, 2); rot = 0; }

      // เงาสัมผัสพื้น (สัมพันธ์กับตัวละคร: หด/จางตอนตัวลอยขึ้น)
      ctx.save();
      ctx.globalAlpha = 0.30 * (1 - bob / 14);
      ctx.fillStyle = '#08060f';
      ctx.beginPath();
      ctx.ellipse(player.x, feetY + 2, w * 0.38 * (1 - bob / 40) * sx, 7 * (1 - bob / 30), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(player.x, feetY - bob);
      ctx.rotate(rot);
      if (player.facingLeft) ctx.scale(-1, 1);
      ctx.scale(sx, sy);
      const gl = this.fx && this.fx.glow;
      if (gl) {
        ctx.globalAlpha = 0.3;
        const gs = h * 1.4;
        ctx.drawImage(gl, -gs / 2, -h - (gs - h) / 2, gs, gs);
        ctx.globalAlpha = 1;
      }
      ctx.drawImage(sprite, -w / 2, -h, w, h);
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.fillStyle = '#e8ecf8';
    this.roundRect(ctx, player.x - player.w / 2, player.y - player.h / 2, player.w, player.h, 16);
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
