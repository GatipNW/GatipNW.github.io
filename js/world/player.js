// ============================================
// player.js — ตัวละครผู้เล่น (เดิน 4 ทิศ + ทแยง)
// ============================================

import { resolveCollision } from '../engine/collision.js';

export class Player {
  constructor(x, y) {
    this.x = x;             // จุดกึ่งกลาง hitbox (ช่วงเท้าของสไปรต์)
    this.y = y;
    this.w = 54;            // hitbox เล็กกว่าสไปรต์ ให้เดินมุดใกล้วัตถุได้สวย
    this.h = 42;
    this.spriteH = 96;      // ความสูงที่วาดสไปรต์กระติ๊บ (world px)
    this.speed = 300;       // world px / วินาที
    this.facing = 'down';   // up | down | left | right
    this.facingLeft = false; // ใช้ flip สไปรต์ซ้าย/ขวา
    this.moving = false;
    this.hidden = true;     // ซ่อนไว้จนกว่า intro จะจบ (กระติ๊บบินลงมาแทนที่)
    this.walkTime = 0;      // สะสมเวลาเดิน ใช้ทำ animation bob
    // ความเร็วจริง (มี accel/decel — ออกตัวนุ่ม หยุดมีแรงไถลนิดๆ ไม่กระตุกทันที)
    this.vx = 0;
    this.vy = 0;
  }

  // AABB ของตัวละคร (มุมซ้ายบน)
  get box() {
    return { x: this.x - this.w / 2, y: this.y - this.h / 2, w: this.w, h: this.h };
  }

  update(dt, input, solids) {
    const dir = input.getMoveVector(); // {x, y} normalized แล้ว
    const pressing = dir.x !== 0 || dir.y !== 0;

    // ไล่ความเร็วจริงเข้าหาเป้า (exponential smoothing อิสระจาก frame rate)
    // กด = เร่งไว (ตอบสนองทันใจ) / ปล่อย = หน่วงไวกว่านิดให้หยุดไม่ยืด
    const k = 1 - Math.exp(-(pressing ? 14 : 18) * dt);
    this.vx += (dir.x * this.speed - this.vx) * k;
    this.vy += (dir.y * this.speed - this.vy) * k;
    if (!pressing && Math.hypot(this.vx, this.vy) < 8) {
      this.vx = 0;
      this.vy = 0;
    }

    this.moving = Math.hypot(this.vx, this.vy) > 20;

    if (pressing) {
      // ทิศที่หันหน้า — ยึดแกนที่กดแรงกว่า
      if (Math.abs(dir.x) >= Math.abs(dir.y)) {
        this.facing = dir.x > 0 ? 'right' : 'left';
      } else {
        this.facing = dir.y > 0 ? 'down' : 'up';
      }
      if (dir.x !== 0) this.facingLeft = dir.x < 0;
    }

    if (this.moving) {
      this.walkTime += dt;
      // แยกแกน X/Y เพื่อให้ไถลตามกำแพงได้ลื่นๆ
      const moved = resolveCollision(this.box, this.vx * dt, this.vy * dt, solids);
      this.x = moved.x + this.w / 2;
      this.y = moved.y + this.h / 2;
    } else {
      this.walkTime = 0;
    }
  }
}
