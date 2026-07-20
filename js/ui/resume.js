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

// ★ 2026-07-20: ลำดับ/หัวข้อกลุ่มย้ายไปอยู่ใน content.js (`resume.groups`) แล้ว
//   เพราะ **แต่ละภาษาต้องจัดกลุ่มไม่เหมือนกัน** — ฉบับ ja ใช้โครง 職務経歴書 ของญี่ปุ่นจริง
//   (職務経歴 → 実績 → 活かせる経験・知識・技術 → 学歴 → コンタクト)
//   ซึ่งเป็นสิ่งที่ HR ญี่ปุ่นคุ้นตา และพิสูจน์ว่าเจ้าของพอร์ตทำงานกับเอกสารญี่ปุ่นเป็น
//   ('door' ไม่อยู่ในกลุ่มไหน — แทนด้วยปุ่มดาวน์โหลด PDF ด้านบน
//    'skills' ไม่มีวัตถุในห้อง เป็น section ของ Resume Mode อย่างเดียว)

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

    // ★ 2026-07-20: สรุปตัวเอง 3 บรรทัด — HR อ่านย่อหน้านี้อย่างเดียวก็ตัดสินใจได้แล้ว
    //   (เดิมเปิดมาเจอหัวข้องานแรกเลย ไม่มีบทสรุปว่าเป็นใคร)
    const summary = i18n.t('resume.summary');
    if (summary) {
      const sec = document.createElement('section');
      sec.className = 'resume-summary';
      sec.appendChild(buildBullets(summary));
      box.appendChild(sec);
    }

    // ★ กล่อง "ข้อมูลที่ HR ถามเสมอ" — ตอบก่อนที่เขาจะต้องถาม
    const facts = i18n.t('resume.facts');
    if (facts) {
      const sec = document.createElement('section');
      sec.className = 'resume-facts';
      const h = document.createElement('h2');
      h.textContent = i18n.t('resume.factsHead');
      sec.appendChild(h);
      const dl = document.createElement('dl');
      for (const f of facts) {
        const dt = document.createElement('dt');
        dt.textContent = f.k;
        const dd = document.createElement('dd');
        dd.textContent = f.v;
        dl.append(dt, dd);
      }
      sec.appendChild(dl);
      // ปุ่มติดต่อไว้บนสุดด้วย — เดิมอยู่ล่างสุดของหน้า 7,000px
      const contact = i18n.t('panels.desk');
      if (contact?.links) sec.appendChild(buildLinks(contact.links));
      box.appendChild(sec);
    }

    // เนื้อหา: จัดเป็นกลุ่มตาม resume.groups (ต่างกันตามภาษา) การ์ดละ 1 หัวข้อ
    for (const g of i18n.t('resume.groups')) {
      const gh = document.createElement('h2');
      gh.className = 'resume-group';
      gh.textContent = g.head;
      box.appendChild(gh);

      for (const id of g.ids) {
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
    }

    // ★ ท้ายหน้า: วันที่อัปเดต · ที่มาของเว็บ · เครดิตเพลง
    const foot = document.createElement('footer');
    foot.className = 'resume-foot';
    for (const key of ['resume.updated', 'resume.colophon', 'resume.credit']) {
      const txt = i18n.t(key);
      if (!txt) continue;
      const p = document.createElement('p');
      p.className = key === 'resume.updated' ? 'resume-updated' : 'resume-note';
      p.textContent = txt;
      foot.appendChild(p);
    }
    box.appendChild(foot);

    this.closeBtn.setAttribute('aria-label', i18n.t('ui.close'));
  }
}
