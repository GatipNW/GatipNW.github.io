// ============================================
// panels.js — modal แสดงเนื้อหาเมื่อ interact กับวัตถุในสตูดิโอ
// สไตล์ "showcase": สไลด์ภาพเลื่อนได้ + stat chip ตัวเลขใหญ่ + คลิปแตะแล้วเล่น
// ปิดด้วย Esc / ปุ่ม ✕ / คลิกนอกกรอบ — ไม่ reload หน้า
// ============================================

import { i18n } from '../i18n.js';
import { audio } from '../audio.js';
import { SHOWCASE } from '../data/content.js';

// เครื่องที่ตั้ง reduce motion (และไม่ได้กด FULL FX) → เลื่อนสไลด์แบบตัดทันที ไม่ smooth
const SCROLL_BEHAVIOR =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  localStorage.getItem('fx') !== 'full'
    ? 'auto' : 'smooth';

// caption ของสไลด์เป็นได้ทั้ง string เดียว (ใช้ทุกภาษา) หรือ { th, en, ja }
function capText(cap) {
  if (!cap) return '';
  return typeof cap === 'string' ? cap : (cap[i18n.lang] ?? cap.en ?? '');
}

// แถว stat chip ตัวเลขใหญ่ (14 เกม / 1M+ ตัวอักษร ฯลฯ) — ใช้ทั้ง panel และ Resume Mode
export function buildStats(stats) {
  const row = document.createElement('div');
  row.className = 'stat-row';
  for (const s of stats) {
    const chip = document.createElement('div');
    chip.className = 'stat-chip';
    const v = document.createElement('div');
    v.className = 'stat-v';
    v.textContent = s.v;
    const l = document.createElement('div');
    l.className = 'stat-l';
    l.textContent = s.l;
    chip.append(v, l);
    row.appendChild(chip);
  }
  return row;
}

// แถบระดับภาษา (JLPT/TOEIC) — หลอดไล่สีเรืองแสง เติมตาม p (0..1)
// ★ 2026-07-20: เลิกใช้แล้ว (เจ้าของสั่งถอดหลอดพลังออก ใช้ buildUses แทน)
//    เก็บฟังก์ชันไว้เผื่ออยากได้กลับ — ไม่มีที่ไหนเรียกอยู่ตอนนี้
export function buildBars(bars) {
  const wrap = document.createElement('div');
  wrap.className = 'bar-list';
  for (const b of bars) {
    const row = document.createElement('div');
    row.className = 'bar-item';
    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = b.l;
    const track = document.createElement('div');
    track.className = 'bar-track';
    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.width = `${Math.round(b.p * 100)}%`;
    track.appendChild(fill);
    row.append(label, track);
    wrap.appendChild(row);
  }
  return wrap;
}

// ★ 2026-07-20: การ์ด "ใช้ภาษาทำอะไรจริง" — แทนหลอดพลังเดิมที่เจ้าของสั่งถอด
// { l: ธง+ชื่อภาษา, lv: ระดับ/คะแนน, d: กรณีใช้งานจริง }
export function buildUses(uses) {
  const wrap = document.createElement('div');
  wrap.className = 'use-list';
  for (const u of uses) {
    const row = document.createElement('div');
    row.className = 'use-item';

    const head = document.createElement('div');
    head.className = 'use-head';
    const name = document.createElement('span');
    name.className = 'use-lang';
    name.textContent = u.l;
    head.appendChild(name);
    if (u.lv) {
      const lv = document.createElement('span');
      lv.className = 'use-level';
      lv.textContent = u.lv;
      head.appendChild(lv);
    }

    const desc = document.createElement('p');
    desc.className = 'use-desc';
    desc.textContent = u.d;

    row.append(head, desc);
    wrap.appendChild(row);
  }
  return wrap;
}

// ★ 2026-07-20: "Arcade Selection Screen" — การ์ดเกมที่ยืนแนะนำหน้าบูท JETRO
// แทน tag สี่เหลี่ยมเดิม: อาร์ตเวิร์กจริง + ชื่อค่าย + คำอธิบาย + ปุ่มไป Steam
function buildGames(games) {
  const zone = document.createElement('section');
  zone.className = 'game-zone';

  const head = document.createElement('h3');
  head.className = 'game-head';
  head.textContent = capText(games.head);
  zone.appendChild(head);

  const role = document.createElement('p');
  role.className = 'game-role';
  role.innerHTML = capText(games.role); // มี <b> ในข้อความ (มาจาก content.js ของเราเอง)
  zone.appendChild(role);

  const grid = document.createElement('div');
  grid.className = 'game-grid';
  for (const g of games.items) {
    const card = document.createElement('article');
    card.className = 'game-card';

    const art = document.createElement('div');
    art.className = 'game-art';
    const im = document.createElement('img');
    im.src = g.img;
    im.alt = g.title;
    im.loading = 'lazy';
    art.appendChild(im);

    // แถบค่ายเกม: โลโก้จริง (ถ้ามีไฟล์) + ชื่อค่าย
    const studio = document.createElement('div');
    studio.className = 'game-studio';
    if (g.studioLogo) {
      const lg = document.createElement('img');
      lg.src = g.studioLogo;
      lg.alt = '';
      lg.loading = 'lazy';
      lg.addEventListener('error', () => lg.remove()); // ไม่มีไฟล์ = เหลือแค่ชื่อ
      studio.appendChild(lg);
    }
    const sname = document.createElement('span');
    sname.textContent = g.studio;
    studio.appendChild(sname);

    const title = document.createElement('h4');
    title.className = 'game-title';
    title.textContent = g.title;

    const desc = document.createElement('p');
    desc.className = 'game-desc';
    desc.textContent = capText(g.d);

    const body = document.createElement('div');
    body.className = 'game-body';
    body.append(studio, title, desc);

    card.append(art, body);

    if (g.url) {
      const a = document.createElement('a');
      a.className = 'game-btn';
      a.href = g.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = '▶ STEAM';
      a.addEventListener('click', () => audio.play('click'));
      body.appendChild(a);
    }
    grid.appendChild(card);
  }
  zone.appendChild(grid);
  return zone;
}

// ★ 2026-07-20: "กำแพงโลโก้" ของโซนเครือข่าย — แทน carousel ที่ต้องเลื่อนดูทีละใบ
// เห็นทุกเพจ/องค์กรพร้อมกันในจอเดียว = รู้สึกถึงขนาดของเครือข่ายทันที
// แตะการ์ด → กางรายละเอียดใต้กลุ่มนั้น (แนวเดียวกับ buildBrands ของโซน YouTube)
function buildLogoWall(wall) {
  const zone = document.createElement('section');
  zone.className = 'net-wall';

  if (wall.hint) {
    const h = document.createElement('div');
    h.className = 'net-hint';
    h.textContent = capText(wall.hint);
    zone.appendChild(h);
  }

  for (const g of wall.groups) {
    const head = document.createElement('h3');
    head.className = 'net-head';
    head.textContent = capText(g.head);

    const grid = document.createElement('div');
    grid.className = 'net-grid';
    const detail = document.createElement('div');
    detail.className = 'net-detail hidden';
    let active = null;

    for (const it of g.items) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'net-card' + (it.light ? ' light' : '');

      const box = document.createElement('div');
      box.className = 'net-logo';
      const img = document.createElement('img');
      img.src = it.img;
      img.alt = it.name;
      img.loading = 'lazy';
      box.appendChild(img);

      const nm = document.createElement('span');
      nm.className = 'net-name';
      nm.textContent = it.name;
      card.append(box, nm);

      // ยอดผู้ติดตามจริง (ดึงจากหน้าเพจ ก.ค. 2026 — ดู scratchpad/followers.py)
      if (it.stat) {
        const st = document.createElement('span');
        st.className = 'net-stat';
        st.textContent = it.stat;
        card.appendChild(st);
      }

      card.addEventListener('click', () => {
        audio.play('blip');
        if (active === card) { // กดซ้ำ = หุบ
          card.classList.remove('active');
          detail.classList.add('hidden');
          active = null;
          return;
        }
        if (active) active.classList.remove('active');
        active = card;
        card.classList.add('active');
        detail.innerHTML = '';
        const t = document.createElement('strong');
        t.textContent = it.name;
        const p = document.createElement('span');
        p.textContent = capText(it.d);
        detail.append(t, p);
        if (it.url) {
          const a = document.createElement('a');
          a.className = 'net-link';
          a.href = it.url;
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = i18n.t('ui.openLink');
          a.addEventListener('click', (e) => {
            e.stopPropagation();
            audio.play('click');
          });
          detail.appendChild(a);
        }
        detail.classList.remove('hidden');
      });
      grid.appendChild(card);
    }
    zone.append(head, grid, detail);
  }
  return zone;
}

// ★ 2026-07-20: เนื้อหาบรรยายทุกโซนเป็น bullet (เจ้าของสั่ง "เข้าใจง่าย")
// ใช้ร่วมกันทั้ง panel ในเกมและ Resume Mode → รูปแบบเดียวกันทั้งเว็บ
export function buildBullets(lines, cls = '') {
  const ul = document.createElement('ul');
  ul.className = 'bullets' + (cls ? ` ${cls}` : '');
  for (const line of lines) {
    const li = document.createElement('li');
    li.textContent = line;
    if (line.startsWith('TODO')) li.className = 'todo';
    ul.appendChild(li);
  }
  return ul;
}

// ชิปรายชื่อ (เครือข่าย/พันธมิตร) — ใช้ทั้ง panel และ Resume Mode
export function buildTags(tags) {
  const row = document.createElement('div');
  row.className = 'tag-row';
  for (const t of tags) {
    const chip = document.createElement('span');
    chip.className = 'tag';
    chip.textContent = t;
    row.appendChild(chip);
  }
  return row;
}

// แถวปุ่มลิงก์ท้าย panel (email / LinkedIn / ดาวน์โหลด PDF ฯลฯ)
// ใช้ร่วมกันทั้ง panel ในเกมและ Resume Mode — โครงจาก data.links ใน content.js
export function buildLinks(links) {
  const row = document.createElement('div');
  row.className = 'panel-links';
  for (const l of links) {
    const a = document.createElement('a');
    a.className = 'panel-link';
    a.textContent = l.label;
    a.href = l.url;
    if (l.download) {
      a.setAttribute('download', '');
    } else if (!l.url.startsWith('mailto:')) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    a.addEventListener('click', () => audio.play('click'));
    row.appendChild(a);
  }
  return row;
}

// ส่วนหัวโชว์ภาพเดี่ยว: key art เต็มกว้าง หรือโลโก้บนการ์ด gradient
function buildHero(show, alt) {
  const img = document.createElement('img');
  img.src = show.hero || show.heroLogo;
  img.alt = alt;
  if (show.hero) {
    img.className = 'panel-hero';
    return img;
  }
  const card = document.createElement('div');
  card.className = 'panel-hero logo-card';
  card.appendChild(img);
  return card;
}

// คลิป YouTube แบบ "แตะแล้วเล่น": โชว์ thumbnail ในเครื่องก่อน (เบา ไม่ยิง request)
// แตะ → สลับเป็น iframe autoplay — โหลด YouTube เฉพาะคลิปที่ผู้ชมกดจริง
function buildVideoThumb({ id, vertical }) {
  const box = document.createElement('div');
  // ทุกคลิปใช้กรอบ 16:9 เท่ากันหมด (thumb ของ Shorts ถูก normalize บนพื้นเบลอแล้ว)
  box.className = 'panel-video thumb';
  const img = document.createElement('img');
  img.src = `assets/showcase/slides/yt${vertical ? 's' : ''}-${id}.webp`;
  img.alt = '';
  img.loading = 'lazy';
  const play = document.createElement('div');
  play.className = 'video-play';
  box.append(img, play);
  box.addEventListener('click', () => {
    if (box.dataset.playing) return;
    box.dataset.playing = '1';
    audio.play('click');
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    f.title = 'YouTube video';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    f.allowFullscreen = true;
    box.innerHTML = '';
    box.appendChild(f);
  });
  return box;
}

// สไลด์โชว์เลื่อนได้ (scroll-snap — ปัดนิ้วบนมือถือ / ปุ่ม ‹ › บนเดสก์ท็อป)
function buildCarousel(slides) {
  const wrap = document.createElement('div');
  wrap.className = 'car-wrap';
  const track = document.createElement('div');
  track.className = 'carousel';

  for (const s of slides) {
    const slide = document.createElement('div');
    slide.className = 'car-slide';
    let inner;
    if (s.video) {
      inner = buildVideoThumb(s.video);
    } else if (s.mystery) {
      inner = document.createElement('div');
      inner.className = 'mystery-card';
      inner.textContent = '?';
    } else if (s.text) {
      inner = document.createElement('div');
      inner.className = 'text-card';
      inner.textContent = s.text;
    } else {
      inner = document.createElement('img');
      inner.src = s.img;
      inner.alt = capText(s.cap);
      inner.loading = 'lazy';
      inner.className = 'car-img' + (s.tall ? ' tall' : '');
      if (s.logoCard) {
        const card = document.createElement('div');
        // โลโก้พื้นขาว (เช่นโลโก้องค์กรราชการ) → การ์ดพื้นสว่าง ไม่ให้เป็นก้อนขาวลอยบนพื้นมืด
        card.className = 'logo-card car-img' + (s.light ? ' light' : '');
        card.appendChild(inner);
        inner.className = '';
        inner = card;
      }
    }
    // ห่อลิงก์ (ยกเว้นคลิป — คลิกคือเล่นในที่)
    if (s.url && !s.video) {
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.className = 'car-link';
      a.addEventListener('click', () => audio.play('click'));
      a.appendChild(inner);
      inner = a;
    }
    slide.appendChild(inner);
    if (s.cap) {
      const c = document.createElement('div');
      c.className = 'car-cap';
      c.textContent = capText(s.cap);
      slide.appendChild(c);
    }
    track.appendChild(slide);
  }
  wrap.appendChild(track);

  // สไลด์เดียวไม่ต้องมีปุ่ม/จุดบอกตำแหน่ง
  if (slides.length > 1) {
    const dots = document.createElement('div');
    dots.className = 'car-dots';
    const dotEls = slides.map((_, i) => {
      const d = document.createElement('button');
      d.className = 'car-dot' + (i === 0 ? ' on' : '');
      d.setAttribute('aria-label', `slide ${i + 1}`);
      d.addEventListener('click', () => {
        track.scrollTo({ left: track.clientWidth * i, behavior: SCROLL_BEHAVIOR });
      });
      dots.appendChild(d);
      return d;
    });
    track.addEventListener('scroll', () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      dotEls.forEach((d, k) => d.classList.toggle('on', k === i));
    }, { passive: true });

    for (const [cls, dir] of [['prev', -1], ['next', 1]]) {
      const b = document.createElement('button');
      b.className = `car-btn ${cls}`;
      b.textContent = dir < 0 ? '‹' : '›';
      b.addEventListener('click', () => {
        audio.play('blip');
        track.scrollBy({ left: track.clientWidth * dir, behavior: SCROLL_BEHAVIOR });
      });
      wrap.appendChild(b);
    }
    wrap.appendChild(dots);
  }
  return wrap;
}

// แถบโลโก้แบรนด์ที่ร่วมงาน — ★ v4: การ์ดกดได้ กางรายละเอียดใต้แถบ (b.d = {th,en,ja})
function buildBrands(brands) {
  const wrap = document.createElement('div');
  wrap.className = 'brand-zone';
  const row = document.createElement('div');
  row.className = 'brand-strip';
  const detail = document.createElement('div');
  detail.className = 'brand-detail hidden';
  let activeCard = null;

  for (const b of brands) {
    const card = document.createElement('div');
    card.className = 'brand-card' + (b.light ? ' light' : '');
    if (b.img) {
      const img = document.createElement('img');
      img.src = b.img;
      img.alt = b.alt || '';
      img.title = b.alt || '';
      card.appendChild(img);
    } else {
      card.classList.add('text');
      card.textContent = b.text;
    }
    if (b.d) {
      card.classList.add('clickable');
      card.setAttribute('role', 'button');
      card.tabIndex = 0;
      const toggle = () => {
        audio.play('blip');
        if (activeCard === card) {
          // กดซ้ำ = หุบ
          card.classList.remove('active');
          detail.classList.add('hidden');
          activeCard = null;
          return;
        }
        if (activeCard) activeCard.classList.remove('active');
        activeCard = card;
        card.classList.add('active');
        detail.innerHTML = '';
        const nm = document.createElement('strong');
        nm.textContent = b.name || b.alt || b.text || '';
        const p = document.createElement('span');
        p.textContent = capText(b.d);
        detail.append(nm, p);
        detail.classList.remove('hidden');
      };
      card.addEventListener('click', toggle);
      card.addEventListener('keydown', (e) => {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          toggle();
        }
      });
    }
    row.appendChild(card);
  }
  wrap.append(row, detail);
  return wrap;
}

// โลโก้เด่นขององค์กรที่ทำงานภายใต้ (TGS → JETRO → AFA) — การ์ดใหญ่เรียงกัน
// ★ 2026-07-20: รองรับมากกว่า 2 ใบแล้ว (class .n3 เมื่อมี 3 ใบขึ้นไป)
function buildBigLogos(logos) {
  const row = document.createElement('div');
  row.className = 'logo-duo' + (logos.length > 2 ? ' n3' : '');
  for (const l of logos) {
    const card = document.createElement(l.url ? 'a' : 'div');
    if (l.url) {
      card.href = l.url;
      card.target = '_blank';
      card.rel = 'noopener';
      card.addEventListener('click', () => audio.play('click'));
    }
    card.className = 'logo-card duo' + (l.light ? ' light' : '') + (l.tile ? ' tile' : '');
    const img = document.createElement('img');
    img.src = l.img;
    img.alt = l.alt || '';
    img.title = l.alt || '';
    card.appendChild(img);
    row.appendChild(card);
  }
  return row;
}

// หัวช่อง YouTube: avatar กลม + ชื่อช่อง
function buildChannelHead(show) {
  const head = document.createElement('div');
  head.className = 'yt-head';
  const av = document.createElement('img');
  av.src = show.avatar;
  av.alt = '';
  const name = document.createElement('span');
  name.textContent = show.channelName || '';
  head.append(av, name);
  return head;
}

export class Panels {
  /**
   * @param onOpenChange  callback(isOpen) — main ใช้หยุด/คืนการเดินของผู้เล่น
   * @param onOpenZone    callback(id) — main ใช้นับว่าสำรวจโซนไหนไปแล้วบ้าง
   */
  constructor({ onOpenChange, onOpenZone }) {
    this.onOpenChange = onOpenChange;
    this.onOpenZone = onOpenZone;
    this.root = document.getElementById('panel');
    this.box = document.getElementById('panel-box');
    this.titleEl = document.getElementById('panel-title');
    this.bodyEl = document.getElementById('panel-body');
    this.closeBtn = document.getElementById('panel-close');
    this.openId = null;

    this.scrollEl = document.getElementById('panel-scroll');

    // ★ A4: เงาขอบล่างบอกว่ายังมีเนื้อหาต่อ — ซ่อนเองเมื่อเลื่อนถึงท้าย
    //   (โซน Sticky Rice สูง 838px แต่จอเห็น 554px หายไป 1/3 โดยไม่มีสัญญาณ)
    this.scrollEl.addEventListener('scroll', () => this.syncScrollCue(), { passive: true });
    window.addEventListener('resize', () => this.syncScrollCue());

    // ★ N5: focus trap — กด Tab แล้วโฟกัสต้องวนอยู่ในกล่อง ไม่หลุดไปหลังฉากมืด
    this.root.addEventListener('keydown', (e) => {
      if (e.code !== 'Tab' || !this.openId) return;
      const items = [...this.box.querySelectorAll(
        'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])')]
        .filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    this.closeBtn.addEventListener('click', () => this.close());
    // คลิกฉากหลังมืด (นอกกรอบ) = ปิด
    this.root.addEventListener('pointerdown', (e) => {
      // ★ 2026-07-20: เฉพาะปุ่มซ้ายเท่านั้น — เดิมคลิกขวาบนฉากมืดก็ปิด panel
      //   แล้ว contextmenu ที่ตามมาไปโดน onRightClick ซึ่งเปิด panel เดิมซ้ำ = วนไม่รู้จบ
      if (e.button === 0 && e.target === this.root) this.close();
    });
    // คลิกขวาบนตัวกล่อง/ฉากมืด = ปิด (และห้ามเมนู "บันทึกภาพ" ของเบราว์เซอร์โผล่)
    this.root.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.openId) this.close();
    });
    window.addEventListener('keydown', (e) => {
      if (this.openId && e.code === 'Escape') this.close();
    });
  }

  get isOpen() {
    return this.openId !== null;
  }

  // มีเนื้อหาต่อข้างล่างไหม → เติม/ถอด class ที่ #panel-box (CSS วาดเงาไล่)
  syncScrollCue() {
    const el = this.scrollEl;
    const more = el.scrollHeight - el.clientHeight - el.scrollTop > 12;
    this.box.classList.toggle('has-more', more);
  }

  open(id) {
    if (!this.render(id)) return;
    clearTimeout(this._closeTimer);
    // ★ 2026-07-20: เอฟเฟกต์เด้งเข้า (CSS `.opening`) — เอาออกหลังจบเพื่อให้เล่นซ้ำได้
    this.root.classList.remove('hidden', 'closing');
    this.box.classList.remove('opening');
    void this.box.offsetWidth;              // บังคับ reflow ให้ animation เริ่มใหม่จริง
    this.box.classList.add('opening');
    this.scrollEl.scrollTop = 0;
    this.syncScrollCue();
    audio.play('pop');
    this.onOpenChange(true);
    this.onOpenZone?.(id);
    // โฟกัสเข้ากล่องเพื่อให้ Tab/Esc ทำงานกับ panel ทันที (a11y)
    this.closeBtn.focus({ preventScroll: true });
  }

  // สลับภาษาระหว่าง panel เปิดอยู่ → วาดเนื้อหาใหม่เงียบๆ (ไม่เล่นเสียง/ไม่ยุ่ง state)
  refresh() {
    if (this.openId) this.render(this.openId);
  }

  render(id) {
    const data = i18n.t(`panels.${id}`);
    if (!data) return false;
    this.openId = id;
    const show = SHOWCASE[id] || {};
    this.titleEl.textContent = data.title;
    this.bodyEl.innerHTML = '';

    // brandsTop: หัวข้อ "เคยร่วมงานกับแบรนด์เหล่านี้" + โลโก้กดได้ อยู่บนสุดของ panel
    // (เจ้าของสั่ง 2026-07-18 — ต้องมาก่อนทุกอย่าง)
    if (show.brands && show.brandsTop) {
      if (data.brandsHead) {
        const bh = document.createElement('div');
        bh.className = 'brand-head';
        bh.textContent = data.brandsHead;
        this.bodyEl.appendChild(bh);
      }
      const zone = buildBrands(show.brands);
      zone.classList.add('top');
      this.bodyEl.appendChild(zone);
    }
    if (show.avatar) this.bodyEl.appendChild(buildChannelHead(show));
    if (show.hero || show.heroLogo) this.bodyEl.appendChild(buildHero(show, data.title));
    if (show.slides) this.bodyEl.appendChild(buildCarousel(show.slides));
    // กำแพงโลโก้เครือข่าย (แทน carousel ในโซน network)
    if (show.wall) this.bodyEl.appendChild(buildLogoWall(show.wall));
    if (data.uses) this.bodyEl.appendChild(buildUses(data.uses));
    if (data.stats) this.bodyEl.appendChild(buildStats(data.stats));

    // ภาพสถิติจาก YouTube Studio — โชว์อัตโนมัติเมื่อเจ้าของวางไฟล์ไว้ (ไม่มีไฟล์ = ซ่อน)
    if (show.statImg) {
      const si = document.createElement('img');
      si.className = 'panel-hero stat-img';
      si.src = show.statImg;
      si.alt = '';
      si.addEventListener('error', () => si.remove());
      this.bodyEl.appendChild(si);
    }

    // ในเกมโชว์ฉบับย่อ (brief) เน้นภาพ+ตัวเลข — ฉบับเต็ม (lines) อยู่ใน Resume Mode
    // ★ 2026-07-20: เจ้าของสั่งให้ทุกโซนเป็น bullet (อ่านง่ายกว่าย่อหน้ายาว)
    this.bodyEl.appendChild(buildBullets(data.brief || data.lines));
    // โลโก้องค์กรเด่น (TGS → JETRO → AFA) วางใหญ่หลังข้อความ — "ทำงานภายใต้เขา"
    if (show.bigLogos) this.bodyEl.appendChild(buildBigLogos(show.bigLogos));
    // การ์ดเกมที่ยืนแนะนำหน้าบูท (Arcade Selection UI) — แทน tag เดิม
    if (show.games) this.bodyEl.appendChild(buildGames(show.games));
    // มีโลโก้แบรนด์จริง → ใช้แทนชิปตัวอักษร (tags ยังใช้ใน Resume Mode)
    // brandsTop = โชว์ไปแล้วด้านบน ไม่ต้องซ้ำล่าง
    if (show.brands && !show.brandsTop) this.bodyEl.appendChild(buildBrands(show.brands));
    else if (data.tags && !show.brandsTop) this.bodyEl.appendChild(buildTags(data.tags));
    if (data.links) this.bodyEl.appendChild(buildLinks(data.links));
    this.closeBtn.setAttribute('aria-label', i18n.t('ui.close'));
    // เนื้อหาเปลี่ยน = ความสูงเปลี่ยน → คำนวณเงา "มีต่อข้างล่าง" ใหม่หลังจัดหน้าเสร็จ
    requestAnimationFrame(() => this.syncScrollCue());
    return true;
  }

  close() {
    if (!this.openId) return;
    this.openId = null;
    // ★ เด้งกลับก่อนค่อยซ่อนจริง — reduce motion ข้ามอนิเมชันไปเลย
    const quick = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      && localStorage.getItem('fx') !== 'full';
    this.box.classList.remove('opening');
    this.root.classList.add('closing');
    clearTimeout(this._closeTimer);
    this._closeTimer = setTimeout(() => {
      this.root.classList.add('hidden');
      this.root.classList.remove('closing');
      // ถอด iframe คลิปทิ้ง — ไม่งั้นเสียงคลิปเล่นต่อทั้งที่ panel ปิดไปแล้ว
      this.bodyEl.querySelectorAll('iframe').forEach((f) => f.remove());
    }, quick ? 0 : 190);
    audio.play('click');
    this.onOpenChange(false);
  }
}
