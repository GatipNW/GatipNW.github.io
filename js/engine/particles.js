// ============================================
// particles.js — ระบบ particle ใช้ร่วมกันทั้ง intro และในเกม
// จำกัดจำนวนเพื่อรักษา 60fps
// ============================================

const MAX_PARTICLES = 420;

export class Particles {
  constructor() {
    this.items = [];
  }

  // ระเบิดประกายจากจุดเดียว (ตอนกระติ๊บพุ่งถึงจุดสูงสุด ฯลฯ)
  burst(x, y, { count = 26, colors = ['#4de3ff', '#a06bff', '#ff6bd6', '#ffd24d'], speed = 320, life = 0.9, gravity = 420, size = 5 } = {}) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.35 + Math.random() * 0.65);
      this.push({
        kind: 'dot', x, y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v - speed * 0.3,
        gravity,
        life: life * (0.5 + Math.random() * 0.5), age: 0,
        size: size * (0.5 + Math.random() * 0.8),
        color: colors[(Math.random() * colors.length) | 0],
      });
    }
  }

  // วงแหวนคลื่นกระแทกขยายออก
  ring(x, y, { color = '#4de3ff', life = 0.6, r0 = 12, r1 = 260, width = 4 } = {}) {
    this.push({ kind: 'ring', x, y, color, life, age: 0, r0, r1, width });
  }

  // ฝุ่นแสงลอยขึ้นช้าๆ (บรรยากาศ)
  floatDust(x, y, { color = 'rgba(160, 107, 255, 0.5)', life = 4 } = {}) {
    this.push({
      kind: 'dot', x, y,
      vx: (Math.random() - 0.5) * 18, vy: -12 - Math.random() * 22,
      gravity: 0,
      life, age: 0,
      size: 1.5 + Math.random() * 2.5,
      color,
    });
  }

  // เส้นสปีดพุ่งออกจากจุดศูนย์กลางทั้งจอ (จังหวะ "ตูม")
  speedBurst(x, y, { count = 22, color = 'rgba(232, 236, 248, 0.9)', life = 0.4, reach = 900 } = {}) {
    for (let i = 0; i < count; i++) {
      this.push({
        kind: 'line', x, y,
        angle: Math.random() * Math.PI * 2,
        life: life * (0.6 + Math.random() * 0.4), age: 0,
        r0: 70 + Math.random() * 60,
        r1: reach * (0.7 + Math.random() * 0.5),
        color,
      });
    }
  }

  push(p) {
    if (this.items.length >= MAX_PARTICLES) this.items.shift();
    this.items.push(p);
  }

  update(dt) {
    for (const p of this.items) {
      p.age += dt;
      if (p.kind === 'dot') {
        p.vy += (p.gravity || 0) * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    }
    this.items = this.items.filter((p) => p.age < p.life);
  }

  draw(ctx) {
    for (const p of this.items) {
      const k = 1 - p.age / p.life; // 1 → 0
      if (p.kind === 'dot') {
        ctx.globalAlpha = Math.min(1, k * 1.5);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.4 + 0.6 * k), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'line') {
        const t = p.age / p.life;
        const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
        const r = p.r0 + (p.r1 - p.r0) * e;
        const len = 120 * (1 - t) + 24;
        ctx.globalAlpha = (1 - t) * 0.85;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5 * (1 - t) + 0.5;
        ctx.beginPath();
        ctx.moveTo(p.x + Math.cos(p.angle) * r, p.y + Math.sin(p.angle) * r);
        ctx.lineTo(p.x + Math.cos(p.angle) * (r + len), p.y + Math.sin(p.angle) * (r + len));
        ctx.stroke();
      } else if (p.kind === 'ring') {
        const t = p.age / p.life;
        const r = p.r0 + (p.r1 - p.r0) * (1 - Math.pow(1 - t, 3)); // easeOutCubic
        ctx.globalAlpha = k * 0.8;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.width * k + 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
}
