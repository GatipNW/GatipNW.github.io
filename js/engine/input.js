// ============================================
// input.js — keyboard + virtual joystick (มือถือ) รวมเป็น API เดียว
// ตรวจ touch device จาก pointer events (ห้ามใช้ user agent)
// จอยสติ๊กแบบ "ลอยตามจุดแตะ": แตะครึ่งซ้ายจอตรงไหน วงจอยก็เกิดตรงนั้น
// ============================================

const KEY_MAP = {
  KeyW: 'up', ArrowUp: 'up',
  KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
};

const JOY_RADIUS = 56;  // ระยะลากนิ้วสุดจากจุดแตะ (px) = ความเร็วเต็ม
const DEAD_ZONE = 0.18; // กันนิ้วสั่นตอนแตะเฉยๆ
const JOY_ZONE = 0.6;   // สัดส่วนความกว้างจอฝั่งซ้ายที่เป็นโซนจอย (ฝั่งขวาเว้นให้ปุ่ม ✦)

export class Input {
  constructor() {
    this.held = new Set();
    this._enabled = true;   // main จะปิดไว้ระหว่าง intro / panel เปิด
    this.touch = false;     // true เมื่อผู้ใช้แตะจอครั้งแรก → main สลับ UI เป็นแบบมือถือ

    // สถานะจอยสติ๊ก: (ox, oy) = จุดแตะแรก, (x, y) = เวกเตอร์ -1..1
    this.joy = { active: false, id: -1, ox: 0, oy: 0, x: 0, y: 0 };
    this.joyEl = document.getElementById('joystick');
    this.knobEl = document.getElementById('joystick-knob');

    window.addEventListener('keydown', (e) => {
      const dir = KEY_MAP[e.code];
      if (dir) {
        this.held.add(dir);
        // ★★ 2026-07-20: กดปุ่มเดิน = ยกเลิกจุดหมายจากการคลิกทันที
        //   เดิมไม่ยกเลิก พอปล่อยปุ่มตัวละครจะ "เดินต่อเอง" ไปหาจุดเก่า
        //   หรือดูเหมือนค้าง/เดินติดเวลาสลับใช้ WASD กับเมาส์ (เจ้าของแจ้ง)
        this.moveGoal = null;
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      const dir = KEY_MAP[e.code];
      if (dir) this.held.delete(dir);
    });

    // กันปุ่มค้างเมื่อสลับแท็บ/หน้าต่าง
    window.addEventListener('blur', () => this.held.clear());

    this.bindJoystick(document.getElementById('game-canvas'));
    this.bindClickMove(document.getElementById('game-canvas'));
  }

  // ★ 2026-07-20: คลิกเพื่อเดิน (เจ้าของบอก "การควบคุมไม่สมูทเลย")
  //   - คลิกซ้ายบนพื้น = ตั้งจุดหมาย ตัวละครเดินไปเอง (main.js เป็นคนพาไป)
  //   - คลิกขวา = ยกเลิกจุดหมาย + สั่ง interact กับวัตถุที่อยู่ในระยะ
  //     ★ ต้อง preventDefault บน contextmenu ไม่งั้นได้เมนู "บันทึกภาพ" ของเบราว์เซอร์
  //   - จอสัมผัสไม่ผูกตรงนี้ (มีจอยสติ๊กอยู่แล้ว) — กันแตะแล้วเดินมั่ว
  bindClickMove(surface) {
    this.clickTarget = null;   // {x, y} ใน world px — main.js อ่านแล้วเคลียร์เอง
    this.onRightClick = null;  // callback ที่ main.js ใส่ให้

    surface.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' || !this._enabled) return;
      if (e.button === 2) return;                    // ปุ่มขวาจัดการที่ contextmenu
      this.clickTarget = { sx: e.clientX, sy: e.clientY };
      // ★ ห้าม held.clear() ตรงนี้ — ปุ่มที่ "ยังกดค้างอยู่จริง" จะหลุดออกจาก set
      //   แล้วต้องปล่อย-กดใหม่ถึงจะเดินได้ (อาการ "เดินติด" ที่เจ้าของเจอ)
      //   ปล่อยให้ getMoveVector จัดลำดับเอง: คีย์บอร์ดชนะจุดหมายจากคลิกอยู่แล้ว
    });

    surface.addEventListener('contextmenu', (e) => {
      e.preventDefault();                            // ★ ห้ามให้เมนูบันทึกภาพโผล่
      if (!this._enabled) return;
      this.clickTarget = null;
      this.moveGoal = null;
      this.onRightClick?.(e.clientX, e.clientY);
    });
  }

  // ปิด input แล้วจอยที่ลากค้างอยู่ต้องหุบทันที (เช่นเปิด panel กลางทางเดิน)
  get enabled() {
    return this._enabled;
  }
  set enabled(v) {
    this._enabled = v;
    if (!v) this.endJoy();
  }

  bindJoystick(surface) {
    surface.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      this.touch = true; // แตะครั้งแรก = จอสัมผัส (โชว์ปุ่ม ✦ / เปลี่ยนข้อความ prompt)
      if (!this._enabled || this.joy.active) return;
      if (e.clientX > window.innerWidth * JOY_ZONE) return;

      const j = this.joy;
      this.moveGoal = null;      // จับจอย = ยกเลิกจุดหมายจากการคลิกเช่นกัน
      j.active = true;
      j.id = e.pointerId;
      j.ox = e.clientX;
      j.oy = e.clientY;
      j.x = 0;
      j.y = 0;
      this.joyEl.style.left = `${j.ox}px`;
      this.joyEl.style.top = `${j.oy}px`;
      this.joyEl.classList.remove('hidden');
      this.moveKnob(0, 0);
    });

    window.addEventListener('pointermove', (e) => {
      const j = this.joy;
      if (!j.active || e.pointerId !== j.id) return;
      const dx = e.clientX - j.ox;
      const dy = e.clientY - j.oy;
      const len = Math.hypot(dx, dy);
      const capped = Math.min(len, JOY_RADIUS);
      const nx = len > 0 ? dx / len : 0;
      const ny = len > 0 ? dy / len : 0;
      // ขนาดเวกเตอร์ 0..1 ตามระยะลาก — ลากนิดเดียว = เดินช้า (analog)
      j.x = (nx * capped) / JOY_RADIUS;
      j.y = (ny * capped) / JOY_RADIUS;
      this.moveKnob(nx * capped, ny * capped);
    });

    const end = (e) => {
      if (this.joy.active && e.pointerId === this.joy.id) this.endJoy();
    };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  }

  moveKnob(px, py) {
    this.knobEl.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
  }

  endJoy() {
    const j = this.joy;
    if (!j.active) return;
    j.active = false;
    j.x = 0;
    j.y = 0;
    this.joyEl.classList.add('hidden');
  }

  // คืนเวกเตอร์ทิศทาง ขนาดไม่เกิน 1 (ทแยงไม่เร็วกว่าปกติ)
  // ★ moveGoal (จุดหมายจากการคลิก) main.js เป็นคนตั้ง/เคลียร์ — ลำดับความสำคัญ:
  //   จอยสติ๊ก → คีย์บอร์ด → จุดหมายจากคลิก (แตะปุ่มไหนก็ยกเลิกการเดินอัตโนมัติทันที)
  getMoveVector() {
    if (!this._enabled) return { x: 0, y: 0 };

    // จอยสติ๊กมาก่อนคีย์บอร์ด — นิ้วลากอยู่แปลว่าตั้งใจเดินด้วยนิ้ว
    if (this.joy.active) {
      if (Math.hypot(this.joy.x, this.joy.y) < DEAD_ZONE) return { x: 0, y: 0 };
      return { x: this.joy.x, y: this.joy.y };
    }

    let x = 0, y = 0;
    if (this.held.has('left')) x -= 1;
    if (this.held.has('right')) x += 1;
    if (this.held.has('up')) y -= 1;
    if (this.held.has('down')) y += 1;

    if (x !== 0 && y !== 0) {
      const inv = 1 / Math.SQRT2;
      x *= inv;
      y *= inv;
      return { x, y };
    }
    if (x !== 0 || y !== 0) return { x, y };

    // ไม่มีใครกดปุ่ม → เดินไปหาจุดหมายที่คลิกไว้ (ถ้ามี)
    // ชะลอความเร็วช่วง 60px สุดท้าย = หยุดนุ่ม ไม่เบรกกึก
    if (this.moveGoal) {
      const dx = this.moveGoal.x - this.moveGoal.px;
      const dy = this.moveGoal.y - this.moveGoal.py;
      const d = Math.hypot(dx, dy);
      if (d < 6) return { x: 0, y: 0 };
      const sp = Math.min(1, d / 60);
      return { x: (dx / d) * sp, y: (dy / d) * sp };
    }
    return { x: 0, y: 0 };
  }
}
