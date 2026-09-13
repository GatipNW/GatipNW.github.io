// ============================================
// objects.js — วัตถุในห้องสมุดดวงจันทร์ (★ ผังใหม่ 2026-09-13 ตามบรีฟฉบับรวม)
// แต่ละวัตถุ: { id, type, x, y, w, h, color, cat, solid, chapters, icon? }
//   chapters = รายการ panel id (STRINGS[lang].panels.*) ที่วัตถุนี้เปิด — ข้อมูลทุกหมวดเดิม
//              ยังอยู่ครบ แค่ย้ายที่อยู่ (mapping ด้านล่าง) · ชื่อโซนอยู่ที่ STRINGS[lang].zones[id]
//   cat      = สีขีดบอกหมวดบนป้ายชื่อ (work / about / connect)
//
// ผัง (world 1400×900 · พื้นที่เดินได้ x 48–1352 · y 170–852):
//   เหนือ     = หน้าต่างโค้งใหญ่ (ไม่มีวัตถุ)
//   ตะวันตก   = Arcade Wing — ตู้เกม 4 ตู้ (2×2) ผลงานเกม = ผลงานหลัก
//   ตะวันออก  = ชั้นหนังสือ 6 ชุด (2×3) หมวดประสบการณ์ · 1 ชุด = 1 หมวด (แตะง่าย)
//   ใต้กลาง   = โต๊ะต้อนรับ (Contact · เอกสาร · นามบัตร) ใกล้จุดเกิด
//   ระยะห่างแถวเดียวกัน ≥ 100px · ต่างแถว ≥ 90px → ระยะ interact 64px ไม่ตีกัน
// ============================================

export const OBJECTS = [
  // ── Arcade Wing (ตะวันตก) — ตู้เวกเตอร์เดิมที่เจ้าของชอบ แค่ย้ายที่ ──
  { id: 'cab-sticky', type: 'arcade', x: 70,  y: 200, w: 110, h: 130, color: '#4de3ff', cat: 'work', solid: true, chapters: ['arcade-1'] },
  { id: 'cab-dh',     type: 'arcade', x: 280, y: 200, w: 110, h: 130, color: '#ff6bd6', cat: 'work', solid: true, chapters: ['arcade-3'] },
  { id: 'cab-free',   type: 'arcade', x: 70,  y: 440, w: 110, h: 130, color: '#a06bff', cat: 'work', solid: true, chapters: ['arcade-2'] },
  { id: 'cab-next',   type: 'arcade', x: 280, y: 440, w: 110, h: 130, color: '#ffd24d', cat: 'work', solid: true, chapters: ['arcade-4'] },

  // ── ห้องสมุด (ตะวันออก) — ชุดหนังสือ 1 ชุดต่อหมวด + สัญลักษณ์ช่วยจำ ──
  //   ตั๋ว/เวที = อีเวนต์ · ปุ่มเล่น = คอนเทนต์ · ฟองคำพูด = ภาษา · เข็มทิศ = ประวัติ ·
  //   ปากกา = งานเขียน(+ถ้วย = อีสปอร์ต) · แฟ้ม = งานอื่น
  { id: 'book-events',  type: 'book', icon: 'ticket',  x: 1020, y: 200, w: 104, h: 124, color: '#ff9d4d', cat: 'work',    solid: true, chapters: ['event'] },
  { id: 'book-content', type: 'book', icon: 'play',    x: 1240, y: 200, w: 104, h: 124, color: '#ff5f6d', cat: 'work',    solid: true, chapters: ['youtube', 'network'] },
  { id: 'book-lang',    type: 'book', icon: 'speech',  x: 1020, y: 420, w: 104, h: 124, color: '#9db8ff', cat: 'about',   solid: true, chapters: ['language', 'skills'] },
  { id: 'book-journey', type: 'book', icon: 'compass', x: 1240, y: 420, w: 104, h: 124, color: '#7de0c3', cat: 'about',   solid: true, chapters: ['bookshelf'] },
  { id: 'book-write',   type: 'book', icon: 'pen',     x: 1020, y: 640, w: 104, h: 124, color: '#ffb0d8', cat: 'work',    solid: true, chapters: ['writing', 'esport'] },
  { id: 'book-other',   type: 'book', icon: 'folder',  x: 1240, y: 640, w: 104, h: 124, color: '#c9a4ff', cat: 'about',   solid: true, chapters: ['other'] },

  // ── โต๊ะต้อนรับ (ใต้ ใกล้จุดเกิด) — Contact + เอกสาร + นามบัตร ──
  { id: 'reception', type: 'reception', x: 590, y: 700, w: 220, h: 84, color: '#d9a441', cat: 'connect', solid: true, chapters: ['desk'] },
];

// ของตกแต่ง (ชน แต่กดไม่ได้) — น้อยชิ้นตามบรีฟ: โคมอ่านหนังสือ + ต้นไม้ในโดม (ลูกโลก/วงเวทกลางห้องถูกถอด 2026-09-13 เจ้าของสั่ง)
export const DECOR = [
  { type: 'lamp',  x: 1290, y: 800, w: 26, h: 26 },
  { type: 'plant', x: 232,  y: 172, w: 56, h: 40 },   // ขนาบสองข้างหน้าต่าง (บนพื้น ชิดผนังเหนือ)
  { type: 'plant', x: 1112, y: 172, w: 56, h: 40 },
];
