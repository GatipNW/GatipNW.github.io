// ============================================
// camera.js — กล้อง smooth-follow แบบ lerp
// แปลง world → screen และ clamp ไม่ให้เห็นนอกห้อง
// ============================================

export class Camera {
  constructor(mapWidth, mapHeight) {
    this.mapW = mapWidth;
    this.mapH = mapHeight;
    this.x = 0;             // ตำแหน่งกล้อง = จุดกึ่งกลางจอใน world
    this.y = 0;
    this.viewW = 0;         // ขนาดจอในหน่วย world (หลัง scale)
    this.viewH = 0;
    this.scale = 1;
    this.smoothing = 6;     // ยิ่งมากยิ่งตามไว
  }

  // เรียกเมื่อ resize — คำนวณ scale ให้ห้องดูพอดีจอ
  setViewport(screenW, screenH) {
    // ให้เห็นห้องอย่างน้อย ~900px แนวตั้ง หรือ ~1200px แนวนอน แล้วแต่จอ
    const targetView = Math.min(this.mapH, 900);
    this.scale = Math.max(screenH / targetView, screenW / 1500);
    // จอเล็ก (มือถือ) อย่าซูมเข้าเกินไปจนมองไม่เห็นรอบตัว
    this.scale = Math.min(this.scale, 1.6);
    this.scale = Math.max(this.scale, 0.5);

    this.viewW = screenW / this.scale;
    this.viewH = screenH / this.scale;
  }

  snapTo(x, y) {
    this.x = x;
    this.y = y;
    this.clamp();
  }

  follow(targetX, targetY, dt) {
    // exponential lerp — ลื่นเท่ากันทุก frame rate
    const t = 1 - Math.exp(-this.smoothing * dt);
    this.x += (targetX - this.x) * t;
    this.y += (targetY - this.y) * t;
    this.clamp();
  }

  clamp() {
    const halfW = this.viewW / 2;
    const halfH = this.viewH / 2;

    // ถ้าห้องเล็กกว่าจอ ให้จัดกึ่งกลาง ไม่ต้อง clamp
    if (this.viewW >= this.mapW) {
      this.x = this.mapW / 2;
    } else {
      this.x = Math.min(Math.max(this.x, halfW), this.mapW - halfW);
    }
    if (this.viewH >= this.mapH) {
      this.y = this.mapH / 2;
    } else {
      this.y = Math.min(Math.max(this.y, halfH), this.mapH - halfH);
    }
  }

  // มุมซ้ายบนของจอใน world coords (ใช้ตอนวาด)
  get left() { return this.x - this.viewW / 2; }
  get top() { return this.y - this.viewH / 2; }
}
