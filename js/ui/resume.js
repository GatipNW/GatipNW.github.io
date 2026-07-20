// ============================================
// resume.js — Resume Mode: หน้า resume แบบ scroll ปกติสำหรับ HR ที่รีบ
// - เปิดได้ตั้งแต่หน้า Title (ไม่ต้องเล่นเกม) ผ่านปุ่ม 📄 ใน HUD
// - เนื้อหาชุดเดียวกับ panel ในเกม (ดึงจาก STRINGS[lang].panels — ที่เดียวกัน)
// - เป็น HTML ปกติ screen reader อ่านได้ = fallback ด้าน accessibility
// ============================================

import { BRAND } from '../data/content.js';
import { i18n } from '../i18n.js';
import { audio } from '../audio.js';
import { buildBullets, buildLinks, buildStats, buildTags, buildUses } from './panels.js';

// ลำดับ section บนหน้า resume (door ไม่อยู่ในนี้ — แทนด้วยปุ่มดาวน์โหลด PDF ด้านบน)
// 'skills' ไม่มีวัตถุในห้อง — เป็น section ของ Resume Mode อย่างเดียว (เจ้าของสั่ง 2026-07-18)
const SECTION_ORDER = [
  'arcade-1', 'arcade-2', 'arcade-3', 'arcade-4', 'youtube', 'event',
  'esport', 'writing', 'bookshelf', 'other', 'language', 'skills', 'network', 'desk',
];

export class ResumeMode {
  /** @param onOpenChange  callback(isOpen) — main ใช้หยุด/คืนการเดินของผู้เล่น */
  constructor({ onOpenChange }) {
    this.onOpenChange = onOpenChange;
    this.root = document.getElementById('resume-mode');
    this.box = document.getElementById('resume-box');
    this.closeBtn = document.getElementById('resume-close');
    this._open = false;

    this.closeBtn.addEventListener('click', () => this.close());
    window.addEventListener('keydown', (e) => {
      if (this._open && e.code === 'Escape') this.close();
    });

    // สลับภาษาระหว่างเปิดอยู่ → วาดเนื้อหาใหม่ทันที
    i18n.onChange(() => {
      if (this._open) this.render();
    });
  }

  get isOpen() {
    return this._open;
  }

  open() {
    if (this._open) return;
    this._open = true;
    this.render();
    this.root.classList.remove('hidden');
    this.root.scrollTop = 0;
    audio.play('pop');
    this.onOpenChange(true);
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this.root.classList.add('hidden');
    audio.play('click');
    this.onOpenChange(false);
  }

  render() {
    const box = this.box;
    box.innerHTML = '';

    // หัวกระดาษ: ชื่อ (โลโก้เดียวกับหน้า Title) + คำอธิบายโหมด
    const head = document.createElement('header');
    head.id = 'resume-head';

    const name = document.createElement('h1');
    name.id = 'resume-name';
    name.textContent = BRAND.logo;
    head.appendChild(name);

    const tagline = document.createElement('p');
    tagline.id = 'resume-tagline';
    tagline.textContent = BRAND.tagline;
    head.appendChild(tagline);

    const sub = document.createElement('p');
    sub.id = 'resume-sub';
    sub.textContent = i18n.t('resume.subtitle');
    head.appendChild(sub);
    box.appendChild(head);

    // แถวปุ่ม: ดาวน์โหลด PDF (ไฟล์จริงใน assets) + กลับเข้าเกม
    const actions = document.createElement('div');
    actions.className = 'resume-actions';

    // ปุ่มดาวน์โหลด 3 ไฟล์: EN + 履歴書 + 職務経歴書 (ภาษา ja เอาชุดญี่ปุ่นขึ้นก่อน)
    const pdfs = [
      { key: 'resume.download', href: BRAND.resumePdf },
      { key: 'resume.downloadJa', href: BRAND.resumePdfJa },
      { key: 'resume.downloadJaCv', href: BRAND.resumePdfJaCv },
    ];
    if (i18n.lang === 'ja') pdfs.push(pdfs.shift()); // ja: 履歴書 → 職務経歴書 → EN
    for (const p of pdfs) {
      const dl = document.createElement('a');
      dl.className = 'choice-btn';
      dl.textContent = i18n.t(p.key);
      dl.href = p.href;
      dl.setAttribute('download', '');
      dl.addEventListener('click', () => audio.play('click'));
      actions.appendChild(dl);
    }

    const back = document.createElement('button');
    back.className = 'choice-btn';
    back.textContent = i18n.t('resume.back');
    back.addEventListener('click', () => this.close());
    actions.appendChild(back);
    box.appendChild(actions);

    // เนื้อหา: การ์ดละ 1 หัวข้อ — ข้อมูลชุดเดียวกับ panel ในเกมเป๊ะๆ
    for (const id of SECTION_ORDER) {
      const data = i18n.t(`panels.${id}`);
      if (!data) continue;

      const card = document.createElement('article');
      card.className = 'resume-card';

      const h2 = document.createElement('h2');
      h2.textContent = data.title;
      card.appendChild(h2);

      // ตัวเลขเด่นเป็น chip ก่อน แล้วตามด้วยเนื้อหาฉบับเต็ม (Resume Mode = อ่านละเอียด)
      if (data.uses) card.appendChild(buildUses(data.uses));
      if (data.stats) card.appendChild(buildStats(data.stats));
      // ★ 2026-07-20: เนื้อหาเป็น bullet เหมือน panel ในเกม (เจ้าของสั่ง)
      card.appendChild(buildBullets(data.lines));
      if (data.tags) card.appendChild(buildTags(data.tags));
      if (data.links) card.appendChild(buildLinks(data.links));
      box.appendChild(card);
    }

    // เครดิตเพลงประกอบ (เงื่อนไข license CC BY 4.0)
    const credit = document.createElement('p');
    credit.className = 'resume-note';
    credit.textContent = i18n.t('resume.credit');
    box.appendChild(credit);

    this.closeBtn.setAttribute('aria-label', i18n.t('ui.close'));
  }
}
