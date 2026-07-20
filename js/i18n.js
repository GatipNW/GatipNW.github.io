// ============================================
// i18n.js — ระบบ 3 ภาษา (th / en / ja)
// จำภาษาใน localStorage, เดาครั้งแรกจาก navigator.language
// ============================================

import { STRINGS } from './data/content.js';

const STORAGE_KEY = 'resume-game-lang';

function guessLang() {
  const nav = (navigator.language || 'en').toLowerCase();
  if (nav.startsWith('th')) return 'th';
  if (nav.startsWith('ja')) return 'ja';
  return 'en';
}

class I18n {
  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    this.lang = STRINGS[saved] ? saved : guessLang();
    this.listeners = [];
  }

  set(lang) {
    if (!STRINGS[lang]) return;
    this.lang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* private mode */ }
    this.listeners.forEach((cb) => cb(lang));
  }

  onChange(cb) {
    this.listeners.push(cb);
  }

  // ดึงข้อความจาก key แบบ dot path เช่น t('intro.ask')
  // ถ้าภาษาปัจจุบันไม่มี ให้ fallback เป็น en
  t(path) {
    const get = (lang) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), STRINGS[lang]);
    const val = get(this.lang);
    return val != null ? val : get('en');
  }
}

export const i18n = new I18n();
