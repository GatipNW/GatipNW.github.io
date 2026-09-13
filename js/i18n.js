// ============================================
// i18n.js — ระบบ 3 ภาษา (th / en / ja)
// ★ 2026-09-13 ลำดับความสำคัญ (บรีฟฉบับรวม):
//   1) ภาษาที่ระบุใน URL  ?lang=th|en|ja  (นามบัตร/ลิงก์ที่ส่งให้คนญี่ปุ่นใส่ ?lang=ja ได้)
//   2) ภาษาที่ผู้ใช้เคยเลือก (localStorage — ถ้าใช้ไม่ได้ก็ข้าม ไม่พัง)
//   3) English (ผู้เข้าชมใหม่ = อังกฤษเสมอ ไม่เดาจาก navigator.language แล้ว)
// ============================================

import { STRINGS } from './data/content.js';

const STORAGE_KEY = 'resume-game-lang';

function fromUrl() {
  try {
    const v = new URLSearchParams(location.search).get('lang');
    return v && STRINGS[v] ? v : null;
  } catch { return null; }
}

function fromStorage() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && STRINGS[v] ? v : null;
  } catch { return null; } // private mode / storage ถูกบล็อก → ข้าม
}

class I18n {
  constructor() {
    this.lang = fromUrl() || fromStorage() || 'en';
    this.listeners = [];
    this._cache = new Map();
  }

  set(lang) {
    if (!STRINGS[lang] || lang === this.lang) return;
    this.lang = lang;
    this._cache.clear();
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* storage ใช้ไม่ได้ก็ยังสลับภาษาได้ */ }
    // อัปเดต ?lang ใน URL แบบเงียบๆ (ไม่ reload) — copy ลิงก์ไปแปะต่อแล้วได้ภาษาเดิม
    try {
      const u = new URL(location.href);
      u.searchParams.set('lang', lang);
      history.replaceState(null, '', u);
    } catch { /* ignore */ }
    this.listeners.forEach((cb) => cb(lang));
  }

  onChange(cb) {
    this.listeners.push(cb);
  }

  // ดึงข้อความจาก key แบบ dot path เช่น t('intro.role')
  // ถ้าภาษาปัจจุบันไม่มี ให้ fallback เป็น en
  t(path) {
    const hit = this._cache.get(path);
    if (hit !== undefined) return hit;
    const get = (lang) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), STRINGS[lang]);
    const val = get(this.lang);
    const out = val != null ? val : get('en');
    this._cache.set(path, out);
    return out;
  }
}

export const i18n = new I18n();
