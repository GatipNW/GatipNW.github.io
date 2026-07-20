// ============================================
// audio.js — SFX สังเคราะห์ด้วย WebAudio (ยังไม่ต้องมีไฟล์เสียง)
// AudioContext สร้างหลัง user gesture แรกเท่านั้น (autoplay policy)
// ============================================

const STORAGE_KEY = 'resume-game-muted';

// ---- BGM ambient loop (สังเคราะห์ทั้งเพลง ไม่มีไฟล์เสียง) ----
// คอร์ดโทนฝันแฟนตาซี (A minor): Am9 → Fmaj7 → Cmaj7 → Gsus2 วนไปเรื่อยๆ
const BGM_BAR = 4.8; // วินาทีต่อคอร์ด — ช้าๆ ล่องลอยแบบ ambient
const BGM_CHORDS = [
  [110.0, 164.81, 246.94, 261.63],  // Am9  (A2 E3 B3 C4)
  [87.31, 130.81, 220.0, 329.63],   // Fmaj7 (F2 C3 A3 E4)
  [130.81, 196.0, 246.94, 329.63],  // Cmaj7 (C3 G3 B3 E4)
  [98.0, 146.83, 220.0, 293.66],    // Gsus2 (G2 D3 A3 D4)
];
const BGM_VOL = 0.9; // gain รวมของ BGM สังเคราะห์ (คุมผ่าน bgmGain — mute แล้ว ramp เหลือ 0)

// ---- BGM ไฟล์จริง ----
// ★ 2026-07-20: เจ้าของเปลี่ยนเพลงเป็น "3:03 PM" — しゃろう (Sharou)
//   ไฟล์เป็นเวอร์ชัน 1 loop ทางการจาก dl.tracks.co.jp (ที่ศิลปินแจกเอง) → ต่อวนเนียน
//   License: ศิลปินอนุญาตใช้เป็น BGM ในเว็บ/แอป ทั้งเชิงพาณิชย์ ฟรี ไม่บังคับเครดิต
//   (แต่เจ้าของสั่งให้ใส่เครดิต — อยู่ใน STRINGS[*].resume.credit)
//   ห้ามเอาไฟล์ไปแจกต่อ/ทำเป็นคอนเทนต์ที่มีเพลงเป็นตัวเอก (ตามข้อห้ามของศิลปิน)
const BGM_FILE = 'assets/audio/303pm-sharou.mp3';
const BGM_FILE_VOL = 0.025; // ★ ประวัติที่เจ้าของสั่ง: 0.35 → 0.175 → 0.05 → 0.025

class AudioSys {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem(STORAGE_KEY) === '1';
    this.bgmGain = null;   // master gain ของ BGM (แยกจาก SFX เพื่อ ramp ตอน mute)
    this._bgmTimer = null; // setInterval ของ scheduler
    this._bgmNext = 0;     // เวลา (ctx.currentTime) ของ bar ถัดไปที่ยังไม่จอง
    this._bgmBar = 0;

    this._bgmEl = null; // <audio> ของ BGM ไฟล์จริง (null = ยังไม่เริ่ม/ใช้ซินธ์)

    // แท็บ hidden → หยุดเสียงทั้งระบบ (BGM เงียบ + ประหยัดแบต) กลับมาแล้วเล่นต่อ
    document.addEventListener('visibilitychange', () => {
      if (this._bgmEl) {
        if (document.hidden) this._bgmEl.pause();
        else if (!this.muted || this._bgmEl.volume === 0) this._bgmEl.play().catch(() => {});
      }
      if (!this.ctx || this._bgmTimer === null) return;
      if (document.hidden) this.ctx.suspend();
      else this.ctx.resume();
    });
  }

  // เรียกได้เฉพาะหลัง user gesture (เช่น กด PRESS START)
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return true;
  }

  setMuted(m) {
    this.muted = m;
    try { localStorage.setItem(STORAGE_KEY, m ? '1' : '0'); } catch { /* private mode */ }
    // BGM ไม่ใช่ one-shot — ต้องหรี่/คืนเสียงตอนกด mute (เพลงเล่นต่อเงียบๆ
    // พอเปิดเสียงกลับมาจะต่อจากจุดเดิมพอดี ไม่เริ่มเพลงใหม่)
    if (this._bgmEl) this._bgmEl.volume = m ? 0 : BGM_FILE_VOL;
    if (this.bgmGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.bgmGain.gain.cancelScheduledValues(t);
      this.bgmGain.gain.setTargetAtTime(m ? 0 : BGM_VOL, t, 0.25);
    }
  }

  // ---- BGM ----
  // เรียกหลัง user gesture แรก (กด PRESS START) — เล่นวนไปตลอดจนปิดแท็บ
  // ใช้ไฟล์เพลงจริงก่อน ("3:03 PM") — โหลด/เล่นไม่ได้ค่อย fallback เป็นซินธ์เดิม
  startBgm() {
    if (this._bgmEl || this._bgmTimer !== null) return;
    const el = new Audio(BGM_FILE);
    el.loop = true;
    el.volume = this.muted ? 0 : BGM_FILE_VOL;
    el.addEventListener('error', () => {
      this._bgmEl = null;
      this._startSynthBgm();
    });
    el.play().then(() => {
      this._bgmEl = el;
    }).catch(() => {
      // autoplay ถูกปฏิเสธ (ไม่น่าเกิด — เราเรียกหลัง gesture) → ซินธ์แทน
      this._startSynthBgm();
    });
  }

  // BGM สังเคราะห์เดิม (fallback ตอนไฟล์เพลงหาย/เล่นไม่ได้)
  _startSynthBgm() {
    if (this._bgmTimer !== null || !this.ensure()) return;
    if (!this.bgmGain) {
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.connect(this.ctx.destination);
    }
    this.bgmGain.gain.value = this.muted ? 0 : BGM_VOL;
    this._bgmBar = 0;
    this._bgmNext = this.ctx.currentTime + 0.15;
    this._scheduleBgm();
    // scheduler แบบ lookahead: จองโน้ตล่วงหน้า 2 วิ — ต่อให้ timer โดน throttle
    // เพลงก็ไม่สะดุด (ctx.suspend ตอนแท็บ hidden ทำให้ currentTime หยุดไปด้วย)
    this._bgmTimer = setInterval(() => this._scheduleBgm(), 1000);
  }

  _scheduleBgm() {
    while (this._bgmNext < this.ctx.currentTime + 2) {
      this._scheduleBar(this._bgmNext, this._bgmBar);
      this._bgmNext += BGM_BAR;
      this._bgmBar++;
    }
  }

  // จองเสียง 1 bar: แพด 4 โน้ต (เหลื่อมเข้า bar ถัดไปให้ crossfade เนียน) + ระฆังสุ่ม
  _scheduleBar(t0, barIdx) {
    const chord = BGM_CHORDS[barIdx % BGM_CHORDS.length];
    for (const f of chord) this._padNote(f, t0, BGM_BAR * 1.25, 0.05);
    const nBells = Math.random() < 0.7 ? (Math.random() < 0.35 ? 2 : 1) : 0;
    for (let i = 0; i < nBells; i++) {
      // เลือกโน้ตในคอร์ดเดียวกันขึ้นไป 2 octave = กลมกลืนเสมอ ไม่มีเสียงหลุดคีย์
      const f = chord[1 + Math.floor(Math.random() * (chord.length - 1))] * 4;
      this._bell(f, t0 + 0.4 + Math.random() * (BGM_BAR - 1.4));
    }
  }

  // โน้ตแพด: sine + triangle detune นิดๆ ให้เสียงหนานุ่ม, envelope ขึ้น-ลงช้า
  _padNote(freq, t0, dur, gain) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + dur * 0.35);
    g.gain.setValueAtTime(gain, t0 + dur * 0.6);
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    g.connect(this.bgmGain);
    for (const [type, mul, mix] of [['sine', 1, 1], ['triangle', 1.005, 0.4]]) {
      const o = this.ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq * mul;
      const og = this.ctx.createGain();
      og.gain.value = mix;
      o.connect(og).connect(g);
      o.start(t0);
      o.stop(t0 + dur + 0.1);
    }
  }

  // ระฆังใสๆ ประปราย — เสียง "หยดแสง" ให้ฉากรู้สึกมีชีวิต
  _bell(freq, t0, gain = 0.035) {
    const o = this.ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
    o.connect(g).connect(this.bgmGain);
    o.start(t0);
    o.stop(t0 + 1.5);
  }

  // โน้ตเดียว: ไล่ความถี่ freq → freqEnd พร้อม envelope เสียงนุ่ม
  tone({ freq, freqEnd = null, type = 'sine', dur = 0.15, gain = 0.15, delay = 0 }) {
    if (this.muted || !this.ensure()) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  // เสียง noise ผ่าน filter — ใช้ทำ riser / impact
  noise({ dur = 0.3, gain = 0.2, filter = 'bandpass', freq = 800, freqEnd = null, delay = 0 }) {
    if (this.muted || !this.ensure()) return;
    const t0 = this.ctx.currentTime + delay;
    const len = Math.ceil(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = filter;
    f.frequency.setValueAtTime(freq, t0);
    if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(this.ctx.destination);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  play(name) {
    if (this.muted) return;
    switch (name) {
      case 'riser': // เกร็งก่อนพุ่ง — เสียงไต่ขึ้นสร้างความคาดหวัง
        this.noise({ dur: 0.6, gain: 0.14, freq: 300, freqEnd: 2600 });
        this.tone({ freq: 90, freqEnd: 720, type: 'sawtooth', dur: 0.6, gain: 0.06 });
        break;
      case 'impact': // ตูม! ตอนถึงจุดสูงสุด
        this.tone({ freq: 170, freqEnd: 42, type: 'sine', dur: 0.42, gain: 0.34 });
        this.noise({ dur: 0.28, gain: 0.24, filter: 'lowpass', freq: 1000, freqEnd: 120 });
        break;
      case 'boing': // กระติ๊บพุ่งขึ้น — เสียงเด้งน่ารัก
        this.tone({ freq: 170, freqEnd: 640, type: 'sine', dur: 0.16, gain: 0.22 });
        this.tone({ freq: 640, freqEnd: 420, type: 'sine', dur: 0.22, gain: 0.18, delay: 0.16 });
        break;
      case 'sparkle': // ประกายตอนลอยถึงจุดสูงสุด
        for (let i = 0; i < 5; i++) {
          this.tone({
            freq: 1300 + Math.random() * 1300,
            type: 'triangle', dur: 0.09, gain: 0.09, delay: i * 0.045,
          });
        }
        break;
      case 'pop': // แตะพื้น
        this.tone({ freq: 320, freqEnd: 90, type: 'sine', dur: 0.1, gain: 0.18 });
        break;
      case 'click': // กดปุ่ม UI
        this.tone({ freq: 880, type: 'square', dur: 0.05, gain: 0.08 });
        break;
      case 'blip': // ตัวอักษร dialog
        this.tone({ freq: 620, type: 'triangle', dur: 0.03, gain: 0.03 });
        break;
      case 'step': // ฝีเท้านุ่มบนพื้นหินจันทร์ — สุ่ม pitch เล็กน้อยกันฟังซ้ำเป็นหุ่นยนต์
        this.noise({
          dur: 0.07, gain: 0.05, filter: 'lowpass',
          freq: 340 + Math.random() * 140, freqEnd: 110,
        });
        break;
    }
  }
}

export const audio = new AudioSys();
