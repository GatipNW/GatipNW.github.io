# Interactive Game Resume — Nipith Wongsirikul (Gatip)

เว็บเรซูเม่แบบเกม top-down ที่ "เดินสำรวจ" ผลงานได้จริง
สำหรับสมัครงานสาย **Game Localization (JA/EN→TH) · LQA · Publishing · PR & Marketing**

A playable top-down resume — walk around a studio and open each zone to read the work.

**▶ Live:** (https://gatipnw.github.io/)

---

## จุดเด่น

- **3 ภาษาเต็มรูปแบบ (ไทย / English / 日本語)** — สลับได้ทันทีโดยไม่ reload
  ข้อความทุกตัวมาจากที่เดียว (`js/data/content.js`) ไม่มี hardcode
- **14 โซนเนื้อหา** ในห้องสตูดิโอ (ผลงานแปลเกม · YouTube · อีเวนต์ · eSports ·
  งานเขียน · เครือข่ายวงการ · การศึกษา · ติดต่อ ฯลฯ)
- **Resume Mode** — หน้า HTML เลื่อนอ่านปกติสำหรับคนที่ไม่อยากเล่นเกม
  (เปิดได้ตั้งแต่หน้าแรก · screen reader อ่านได้ = a11y fallback)
- **รองรับจอสัมผัส** ตั้งแต่ 360px ขึ้นไป — จอยสติ๊กลอยตามจุดแตะ + ปุ่ม interact
- **เคารพ `prefers-reduced-motion`** — มีเวอร์ชันนิ่ง + ปุ่ม opt-in เปิดเอฟเฟกต์เต็ม

## เทคโนโลยี

HTML + CSS + **Vanilla JS (ES Modules) + Canvas 2D** — ไม่มี build step, ไม่มี framework,
ไม่มี dependency ตอนรัน (ยกเว้น Google Fonts ซึ่งมี fallback) → วางไฟล์ที่ไหนก็เปิดได้

งบประสิทธิภาพ 60fps: `renderer.draw` ≈ **1.3 ms/เฟรม**

## โครงสร้าง

```
index.html · css/style.css
js/     main.js · i18n.js · audio.js
        engine/  camera · input · collision · particles · renderer
        world/   player · objects · map
        ui/      title(intro) · panels · resume
        data/    content.js   ← เนื้อหาทั้งหมดอยู่ที่นี่ที่เดียว
assets/ ภาพ/เสียง/PDF (เจนด้วยสคริปต์ใน tools/)
tools/  สคริปต์ Python เจนฉาก/สไลด์/โลโก้ (numpy + pillow, seed ล็อก)
```

## รันในเครื่อง

```bash
python tools/serve.py     # → http://localhost:8123
```

## เครดิต

- เพลงประกอบ: **"3:03 PM" — しゃろう (Sharou)** ใช้ตามเงื่อนไขการใช้งานที่ศิลปินกำหนด
- โลโก้บริษัท/องค์กรที่ปรากฏ เป็นเครื่องหมายการค้าของเจ้าของนั้นๆ
  แสดงเพื่อระบุผลงานที่เคยร่วมงานเท่านั้น
