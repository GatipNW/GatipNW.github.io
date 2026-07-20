// ============================================
// collision.js — AABB collision + slide ตามกำแพง
// ============================================

export function aabbOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// ขยับ box ทีละแกน ถ้าชนให้ดันกลับชิดขอบ — ทำให้ไถลตามกำแพงได้
// รับ box (มุมซ้ายบน), ระยะขยับ dx/dy, รายการ solid AABB
// คืนตำแหน่งมุมซ้ายบนใหม่ { x, y }
export function resolveCollision(box, dx, dy, solids) {
  let { x, y } = box;
  const { w, h } = box;

  // แกน X
  x += dx;
  for (const s of solids) {
    if (aabbOverlap({ x, y, w, h }, s)) {
      x = dx > 0 ? s.x - w : s.x + s.w;
    }
  }

  // แกน Y
  y += dy;
  for (const s of solids) {
    if (aabbOverlap({ x, y, w, h }, s)) {
      y = dy > 0 ? s.y - h : s.y + s.h;
    }
  }

  return { x, y };
}
