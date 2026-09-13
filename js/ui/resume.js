// ============================================
// resume.js — Resume Mode: หน้าอ่านปกติ (HTML scroll) สำหรับผู้รับนามบัตรที่รีบ
// - เปิดได้ตั้งแต่หน้าแรก (ไม่ต้องเล่นเกม) — ผ่านปุ่ม 📄 บนหน้าแรก / HUD / เมนูทางลัด
// - เนื้อหาชุดเดียวกับ panel ในเกม (STRINGS[lang].panels + GAMES) ผ่าน buildChapter(full)
// - โครงหน้า: ชื่อ + สายงาน → เอกสาร → สรุป → ข้อมูลที่ HR ถาม + ติดต่อ → กลุ่มหัวข้อตาม
//   resume.groups (★ ฉบับ ja เรียงตามโครง 職務経歴書 จริง — อยู่ใน content.js ห้ามยุบ) → ท้ายหน้า
// ============================================

import { BRAND } from '../data/content.js';
import { i18n } from '../i18n.js';
import { audio } from '../audio.js';
import { buildChapter, buildLinks, buildDocs } from './panels.js';

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
    i18n.onChange(() => { if (this._open) this.render(); });
  }

  get isOpen() { return this._open; }

  open() {
    if (this._open) return;
    this._open = true;
    this.render();
    this.root.classList.remove('hidden');
    this.root.scrollTop = 0;
    audio.play('pop');
    this.onOpenChange(true);
    this.closeBtn.focus({ preventScroll: true });
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
    const mk = (tag, cls, text) => {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    };

    // หัวกระดาษ
    const head = mk('header');
    head.id = 'resume-head';
    const name = mk('h1', null, BRAND.logo);
    name.id = 'resume-name';
    const sub = mk('p', null, i18n.t('resume.subtitle'));
    sub.id = 'resume-sub';
    head.append(name, sub);
    box.appendChild(head);

    // เอกสาร (ไฟล์ที่ยังไม่พร้อมถูกซ่อนอัตโนมัติ) + นามบัตร PDF
    const docs = [
      { label: i18n.t('resume.download').replace(/^📄 /, ''), url: BRAND.resumePdf },
      { label: i18n.t('resume.downloadJa').replace(/^📄 /, ''), url: BRAND.resumePdfJa },
      { label: i18n.t('resume.downloadJaCv').replace(/^📄 /, ''), url: BRAND.resumePdfJaCv },
    ];
    if (i18n.lang === 'ja') docs.push(docs.shift()); // ja: ชุดญี่ปุ่นขึ้นก่อน
    const docSec = buildDocs(docs, i18n.t('resume.docsHead'));
    if (docSec) {
      docSec.classList.add('resume-docs');
      box.appendChild(docSec);
    }

    // สรุป 4 บรรทัด
    const summary = i18n.t('resume.summary');
    if (summary) {
      const sec = mk('section', 'resume-summary');
      const ul = mk('ul', 'bullets');
      for (const line of summary) ul.appendChild(mk('li', null, line));
      sec.appendChild(ul);
      box.appendChild(sec);
    }

    // ข้อมูลที่ HR ถามเสมอ + ปุ่มติดต่อ
    const facts = i18n.t('resume.facts');
    if (facts) {
      const sec = mk('section', 'resume-facts');
      sec.appendChild(mk('h2', null, i18n.t('resume.factsHead')));
      const dl = mk('dl');
      for (const f of facts) dl.append(mk('dt', null, f.k), mk('dd', null, f.v));
      sec.appendChild(dl);
      const contact = i18n.t('panels.desk');
      if (contact?.links) sec.appendChild(buildLinks(contact.links));
      box.appendChild(sec);
    }

    // สารบัญสั้นๆ (กระโดดได้ — หน้าอ่านยาว)
    const groups = i18n.t('resume.groups');
    const toc = mk('nav', 'resume-toc');
    toc.setAttribute('aria-label', 'Sections');
    groups.forEach((g, i) => {
      const a = mk('a', null, g.head);
      a.href = `#rs-${i}`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById(`rs-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      toc.appendChild(a);
    });
    box.appendChild(toc);

    // เนื้อหา: กลุ่ม → การ์ดละ 1 หัวข้อ (ฉบับเต็ม)
    groups.forEach((g, gi) => {
      const gh = mk('h2', 'resume-group', g.head);
      gh.id = `rs-${gi}`;
      box.appendChild(gh);
      for (const id of g.ids) {
        const data = i18n.t(`panels.${id}`);
        if (!data) continue;
        const card = mk('article', 'resume-card');
        card.appendChild(mk('h3', null, data.title));
        const frag = buildChapter(id, { full: true });
        if (frag) card.appendChild(frag);
        box.appendChild(card);
      }
    });

    // ท้ายหน้า
    const foot = mk('footer', 'resume-foot');
    for (const key of ['resume.updated', 'resume.colophon', 'resume.credit']) {
      const txt = i18n.t(key);
      if (!txt) continue;
      foot.appendChild(mk('p', key === 'resume.updated' ? 'resume-updated' : 'resume-note', txt));
    }
    box.appendChild(foot);
    this.closeBtn.setAttribute('aria-label', i18n.t('ui.close'));
  }
}
