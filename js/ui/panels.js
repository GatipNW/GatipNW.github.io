// ============================================
// panels.js — แผงเนื้อหาเมื่อเปิดวัตถุในห้องสมุดดวงจันทร์ (★ 2026-09-13)
// - 1 วัตถุ = 1 "โซน" ที่มีหลาย "บท" (chapters = panel id เดิม) → หัวคงที่ + แถบเลือกบท
// - ตู้เกม: รายชื่อเกมจาก GAMES (carousel + กริด + การ์ดรายละเอียด) — dataset เดียวกับ Resume Mode
// - โต๊ะต้อนรับ: ติดต่อ (คัดลอกได้) · เอกสาร PDF (ซ่อนอัตโนมัติถ้าไฟล์ยังไม่พร้อม) · นามบัตร
// - ปิดด้วย Esc / ✕ / คลิกนอกกรอบ (ปุ่มซ้ายเท่านั้น) — ไม่ reload หน้า
// ============================================

import { i18n } from '../i18n.js';
import { audio } from '../audio.js';
import { BRAND, SHOWCASE, GAMES } from '../data/content.js';
import { OBJECTS } from '../world/objects.js';

const REDUCED = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  && localStorage.getItem('fx') !== 'full';
const SCROLL_BEHAVIOR = () => (REDUCED() ? 'auto' : 'smooth');

function capText(cap) {
  if (!cap) return '';
  return typeof cap === 'string' ? cap : (cap[i18n.lang] ?? cap.en ?? '');
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

// ---------- ชิ้นส่วนที่ใช้ร่วมกับ Resume Mode ----------

export function buildStats(stats) {
  const row = el('div', 'stat-row');
  for (const s of stats) {
    const chip = el('div', 'stat-chip');
    chip.append(el('div', 'stat-v', s.v), el('div', 'stat-l', s.l));
    row.appendChild(chip);
  }
  return row;
}

export function buildUses(uses) {
  const wrap = el('div', 'use-list');
  for (const u of uses) {
    const row = el('div', 'use-item');
    const head = el('div', 'use-head');
    head.appendChild(el('span', 'use-lang', u.l));
    if (u.lv) head.appendChild(el('span', 'use-level', u.lv));
    row.append(head, el('p', 'use-desc', u.d));
    wrap.appendChild(row);
  }
  return wrap;
}

export function buildBullets(lines, cls = '') {
  const ul = el('ul', 'bullets' + (cls ? ` ${cls}` : ''));
  for (const line of lines) {
    const li = el('li', null, line);
    if (line.startsWith('━')) li.className = 'divider';
    ul.appendChild(li);
  }
  return ul;
}

export function buildTags(tags) {
  const row = el('div', 'tag-row');
  for (const t of tags) row.appendChild(el('span', 'tag', t));
  return row;
}

// แถวปุ่มลิงก์ — l.copy = มีปุ่มคัดลอกข้อความ · l.mature = เตือนก่อนเปิด (title)
export function buildLinks(links) {
  const row = el('div', 'panel-links');
  for (const l of links) {
    if (!l.url) continue;
    const a = el('a', 'panel-link', l.label);
    a.href = l.url;
    if (l.download) a.setAttribute('download', '');
    else if (!l.url.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
    if (l.mature) a.title = i18n.t('games.matureLink');
    a.addEventListener('click', () => audio.play('click'));
    row.appendChild(a);
    if (l.copy) row.appendChild(buildCopyBtn(l.copy));
  }
  return row;
}

function buildCopyBtn(text) {
  const b = el('button', 'copy-btn', i18n.t('ui.copy'));
  b.type = 'button';
  b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text);
      b.textContent = i18n.t('ui.copied');
      audio.play('blip');
      setTimeout(() => { b.textContent = i18n.t('ui.copy'); }, 1600);
    } catch {
      // clipboard ถูกบล็อก → เลือกข้อความให้แทน
      const r = document.createRange();
      r.selectNodeContents(b.previousSibling);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
    }
  });
  return b;
}

// เอกสาร PDF: เปิดในแท็บใหม่ + ปุ่มดาวน์โหลด — ไฟล์ที่เป็น null ถูกซ่อน (ยังไม่พร้อมเผยแพร่)
export function buildDocs(docs, head) {
  const list = docs.filter((d) => d.url);
  if (!list.length) return null;
  const sec = el('section', 'doc-list');
  if (head) sec.appendChild(el('h3', 'sec-head', head));
  for (const d of list) {
    const row = el('div', 'doc-row');
    const open = el('a', 'doc-open', `📄 ${d.label}`);
    open.href = d.url;
    open.target = '_blank';
    open.rel = 'noopener';
    const dl = el('a', 'doc-dl', `⤓ ${i18n.t('ui.download')}`);
    dl.href = d.url;
    dl.setAttribute('download', '');
    for (const a of [open, dl]) a.addEventListener('click', () => audio.play('click'));
    row.append(open, dl);
    sec.appendChild(row);
  }
  sec.appendChild(el('p', 'doc-note', i18n.t('resume.docNote')));
  return sec;
}

// นามบัตร: หน้า–หลัง (ขนาดตัดจริง) แตะดูใหญ่ + ดาวน์โหลด PDF
export function buildCard(data) {
  const sec = el('section', 'card-zone');
  sec.appendChild(el('h3', 'sec-head', data.cardHead));
  sec.appendChild(el('p', 'card-note', data.cardNote));
  const row = el('div', 'card-row');
  for (const [side, src] of [[data.cardFront, BRAND.cardFront], [data.cardBack, BRAND.cardBack]]) {
    const fig = el('button', 'card-fig');
    fig.type = 'button';
    fig.setAttribute('aria-label', `${data.cardHead} — ${side}`);
    const img = el('img');
    img.src = src.replace('.webp', '-sm.webp');
    img.alt = `${data.cardHead} — ${side}`;
    img.loading = 'lazy';
    img.width = 460; img.height = 283;
    fig.append(img, el('span', 'card-side', side));
    fig.addEventListener('click', () => { audio.play('pop'); openLightbox(src, img.alt); });
    row.appendChild(fig);
  }
  sec.appendChild(row);
  const dl = el('a', 'panel-link', data.cardDownload);
  dl.href = BRAND.cardPdf;
  dl.setAttribute('download', '');
  dl.addEventListener('click', () => audio.play('click'));
  sec.appendChild(el('div', 'panel-links')).appendChild(dl);
  return sec;
}

// กล่องดูภาพใหญ่ (นามบัตร) — ปิดด้วยคลิก/Esc
function openLightbox(src, alt) {
  let box = document.getElementById('lightbox');
  if (!box) {
    box = el('div');
    box.id = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    const img = el('img');
    const close = el('button', 'lb-close', '✕');
    close.type = 'button';
    close.addEventListener('click', () => box.classList.add('hidden'));
    box.addEventListener('click', (e) => { if (e.target === box) box.classList.add('hidden'); });
    window.addEventListener('keydown', (e) => { if (e.code === 'Escape') box.classList.add('hidden'); });
    box.append(img, close);
    document.body.appendChild(box);
  }
  const img = box.querySelector('img');
  img.src = src;
  img.alt = alt;
  box.querySelector('.lb-close').setAttribute('aria-label', i18n.t('ui.close'));
  box.classList.remove('hidden');
  box.querySelector('.lb-close').focus({ preventScroll: true });
}

// ---------- ★ ผลงานเกม: carousel + กริด + การ์ด (dataset = GAMES) ----------
function gameCard(g, T, idx) {
  const card = el('article', 'gcard');
  card.dataset.idx = idx;
  const art = el('div', 'gcard-art' + (g.mature ? ' mature' : ''));
  const img = el('img');
  img.alt = g.en;
  img.width = 460; img.height = 215;
  if (g.mature) {
    // การ์ดตัวอักษรก่อน — โหลดภาพเฉพาะเมื่อกด (ไม่โหลดล่วงหน้า)
    const tcard = el('div', 'gcard-text');
    tcard.append(el('strong', null, g.en), el('span', null, g.th !== g.en ? g.th : ''));
    const tag = el('span', 'gcard-18', '18+');
    const btn = el('button', 'gcard-reveal', T.showCover);
    btn.type = 'button';
    btn.setAttribute('aria-label', `${T.showCover} — ${g.en}`);
    btn.addEventListener('click', () => {
      audio.play('blip');
      if (art.classList.toggle('revealed')) {
        if (!img.src) { img.src = g.img; art.appendChild(img); }
        btn.textContent = T.hideCover;
      } else {
        btn.textContent = T.showCover;
      }
    });
    art.append(tcard, tag, btn);
  } else {
    img.src = g.img;
    img.loading = 'lazy';
    art.appendChild(img);
  }
  const body = el('div', 'gcard-body');
  body.appendChild(el('h4', 'gcard-title', g.en));
  if (g.th !== g.en) body.appendChild(el('div', 'gcard-th', g.th));
  const roles = el('div', 'gcard-roles');
  for (const r of g.roles) roles.appendChild(el('span', 'role-tag', T.roles[r] ?? r));
  body.appendChild(roles);
  body.appendChild(el('div', `gcard-status s-${g.status}`, T.status[g.status]));
  // รายละเอียดเมื่อกด
  const det = el('div', 'gcard-det hidden');
  const meta = [];
  if (g.via) meta.push(`${T.via} ${g.via}`);
  if (g.dev) meta.push(`${T.dev}: ${g.dev}`);
  if (g.pub) meta.push(`${T.pub}: ${g.pub}`);
  meta.push(`Steam app ${g.appid}`);
  det.appendChild(el('p', null, meta.join(' · ')));
  const btns = el('div', 'gcard-btns');
  const more = el('button', 'gcard-more', i18n.t('ui.details'));
  more.type = 'button';
  more.setAttribute('aria-expanded', 'false');
  more.addEventListener('click', () => {
    const open = det.classList.toggle('hidden');
    more.setAttribute('aria-expanded', String(!open));
    audio.play('blip');
  });
  const steam = el('a', 'gcard-steam', T.steam);
  steam.href = g.url;
  steam.target = '_blank';
  steam.rel = 'noopener';
  if (g.mature) steam.title = T.matureLink;
  steam.addEventListener('click', () => audio.play('click'));
  btns.append(more, steam);
  body.append(btns, det);
  card.append(art, body);
  return card;
}

function buildGamesShowcase(groups) {
  const T = i18n.t('games');
  const wrap = el('section', 'games-zone');
  const list = GAMES.filter((g) => groups.includes(g.group));
  // หัวหมวด + คำอธิบายระดับหมวด (ไม่ซ้ำทุกการ์ด)
  for (const gid of groups) {
    const grp = T.groups[gid];
    const n = list.filter((g) => g.group === gid).length;
    if (!grp || !n) continue;
    const h = el('div', 'games-group');
    h.appendChild(el('h3', 'sec-head', `${grp.head} · ${n}`));
    h.appendChild(el('p', 'games-desc', grp.desc));
    wrap.appendChild(h);
  }
  // carousel
  const car = el('div', 'gcar');
  const track = el('div', 'gcar-track');
  track.setAttribute('tabindex', '0');
  list.forEach((g, i) => {
    const slide = el('div', 'gcar-slide');
    slide.appendChild(gameCard(g, T, i));
    track.appendChild(slide);
  });
  const nav = el('div', 'gcar-nav');
  const prev = el('button', 'gcar-btn prev', '‹');
  prev.type = 'button';
  prev.setAttribute('aria-label', i18n.t('ui.prev'));
  const next = el('button', 'gcar-btn next', '›');
  next.type = 'button';
  next.setAttribute('aria-label', i18n.t('ui.next'));
  const counter = el('span', 'gcar-count');
  counter.setAttribute('aria-live', 'polite');
  nav.append(prev, counter, next);
  car.append(track, nav);
  wrap.appendChild(car);
  // กริดรูปย่อ: ข้ามไปเกมใดก็ได้ทันที
  const grid = el('div', 'ggrid');
  grid.setAttribute('role', 'list');
  wrap.appendChild(el('p', 'ggrid-hint', T.gridHint));
  const thumbs = list.map((g, i) => {
    const b = el('button', 'gthumb' + (g.mature ? ' mature' : ''));
    b.type = 'button';
    b.setAttribute('role', 'listitem');
    b.setAttribute('aria-label', `${i + 1}. ${g.en}`);
    b.title = g.en;
    if (g.mature) {
      b.append(el('span', 'gthumb-n', String(i + 1)), el('span', 'gthumb-t', g.th || g.en));
    } else {
      const im = el('img');
      im.src = g.img;
      im.alt = '';
      im.loading = 'lazy';
      b.append(im, el('span', 'gthumb-n', String(i + 1)));
    }
    b.addEventListener('click', () => { audio.play('blip'); goTo(i); });
    grid.appendChild(b);
    return b;
  });
  wrap.appendChild(grid);

  let cur = 0;
  const goTo = (i) => {
    cur = (i + list.length) % list.length;
    track.scrollTo({ left: track.clientWidth * cur, behavior: SCROLL_BEHAVIOR() });
    sync();
  };
  const sync = () => {
    counter.textContent = `${cur + 1} ${i18n.t('ui.of')} ${list.length}`;
    thumbs.forEach((t, k) => t.classList.toggle('on', k === cur));
  };
  prev.addEventListener('click', () => { audio.play('blip'); goTo(cur - 1); });
  next.addEventListener('click', () => { audio.play('blip'); goTo(cur + 1); });
  track.addEventListener('scroll', () => {
    const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    if (i !== cur) { cur = i; sync(); }
  }, { passive: true });
  track.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') { e.preventDefault(); goTo(cur + 1); }
    if (e.code === 'ArrowLeft') { e.preventDefault(); goTo(cur - 1); }
  });
  sync();
  return wrap;
}

// รายการเกมแบบกะทัดรัดสำหรับ Resume Mode (ข้อความล้วน ไม่มีปก — อ่านเร็ว/พิมพ์ได้)
export function buildGamesList(groups) {
  const T = i18n.t('games');
  const wrap = el('section', 'games-list');
  for (const gid of groups) {
    const items = GAMES.filter((g) => g.group === gid);
    const grp = T.groups[gid];
    if (!items.length || !grp) continue;
    wrap.appendChild(el('h3', 'sec-head', `${grp.head} · ${items.length}`));
    wrap.appendChild(el('p', 'games-desc', grp.desc));
    const ul = el('ul', 'glist');
    for (const g of items) {
      const li = el('li', 'glist-item');
      const name = el('div', 'glist-name');
      const a = el('a', null, g.en);
      a.href = g.url;
      a.target = '_blank';
      a.rel = 'noopener';
      if (g.mature) a.title = T.matureLink;
      name.appendChild(a);
      if (g.th !== g.en) name.appendChild(el('span', 'glist-th', g.th));
      const meta = el('div', 'glist-meta');
      for (const r of g.roles) meta.appendChild(el('span', 'role-tag', T.roles[r] ?? r));
      meta.appendChild(el('span', `gcard-status s-${g.status}`, T.status[g.status]));
      if (g.via) meta.appendChild(el('span', 'glist-via', `${T.via} ${g.via}`));
      if (g.mature) meta.appendChild(el('span', 'gcard-18 inline', '18+'));
      li.append(name, meta);
      ul.appendChild(li);
    }
    wrap.appendChild(ul);
  }
  return wrap;
}

// ---------- ชิ้นส่วนเดิม (โลโก้/สไลด์/คลิป) ----------
function buildHero(show, alt) {
  const img = el('img');
  img.src = show.hero || show.heroLogo;
  img.alt = alt;
  img.loading = 'lazy';
  if (show.hero) { img.className = 'panel-hero'; return img; }
  const card = el('div', 'panel-hero logo-card');
  card.appendChild(img);
  return card;
}

function buildVideoThumb({ id, vertical }) {
  const box = el('div', 'panel-video thumb');
  const img = el('img');
  img.src = `assets/showcase/slides/yt${vertical ? 's' : ''}-${id}.webp`;
  img.alt = '';
  img.loading = 'lazy';
  const play = el('button', 'video-play');
  play.type = 'button';
  play.setAttribute('aria-label', 'Play video');
  box.append(img, play);
  box.addEventListener('click', () => {
    if (box.dataset.playing) return;
    box.dataset.playing = '1';
    audio.play('click');
    const f = el('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    f.title = 'YouTube video';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    f.allowFullscreen = true;
    box.innerHTML = '';
    box.appendChild(f);
  });
  return box;
}

function buildCarousel(slides) {
  const wrap = el('div', 'car-wrap');
  const track = el('div', 'carousel');
  for (const s of slides) {
    const slide = el('div', 'car-slide');
    let inner;
    if (s.video) inner = buildVideoThumb(s.video);
    else if (s.mystery) inner = el('div', 'mystery-card', '?');
    else if (s.text) inner = el('div', 'text-card', s.text);
    else {
      inner = el('img', 'car-img' + (s.tall ? ' tall' : ''));
      inner.src = s.img;
      inner.alt = capText(s.cap);
      inner.loading = 'lazy';
      if (s.logoCard) {
        const card = el('div', 'logo-card car-img' + (s.light ? ' light' : ''));
        card.appendChild(inner);
        inner.className = '';
        inner = card;
      }
    }
    if (s.url && !s.video) {
      const a = el('a', 'car-link');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.addEventListener('click', () => audio.play('click'));
      a.appendChild(inner);
      inner = a;
    }
    slide.appendChild(inner);
    if (s.cap) slide.appendChild(el('div', 'car-cap', capText(s.cap)));
    track.appendChild(slide);
  }
  wrap.appendChild(track);
  if (slides.length > 1) {
    const dots = el('div', 'car-dots');
    const dotEls = slides.map((_, i) => {
      const d = el('button', 'car-dot' + (i === 0 ? ' on' : ''));
      d.type = 'button';
      d.setAttribute('aria-label', `slide ${i + 1}`);
      d.addEventListener('click', () => track.scrollTo({ left: track.clientWidth * i, behavior: SCROLL_BEHAVIOR() }));
      dots.appendChild(d);
      return d;
    });
    track.addEventListener('scroll', () => {
      const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      dotEls.forEach((d, k) => d.classList.toggle('on', k === i));
    }, { passive: true });
    for (const [cls, dir, lbl] of [['prev', -1, 'ui.prev'], ['next', 1, 'ui.next']]) {
      const b = el('button', `car-btn ${cls}`, dir < 0 ? '‹' : '›');
      b.type = 'button';
      b.setAttribute('aria-label', i18n.t(lbl));
      b.addEventListener('click', () => {
        audio.play('blip');
        track.scrollBy({ left: track.clientWidth * dir, behavior: SCROLL_BEHAVIOR() });
      });
      wrap.appendChild(b);
    }
    wrap.appendChild(dots);
  }
  return wrap;
}

function buildBrands(brands) {
  const wrap = el('div', 'brand-zone');
  const row = el('div', 'brand-strip');
  const detail = el('div', 'brand-detail hidden');
  let activeCard = null;
  for (const b of brands) {
    const card = el('div', 'brand-card' + (b.light ? ' light' : ''));
    if (b.img) {
      const img = el('img');
      img.src = b.img;
      img.alt = b.alt || '';
      img.title = b.alt || '';
      img.loading = 'lazy';
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
          card.classList.remove('active');
          detail.classList.add('hidden');
          activeCard = null;
          return;
        }
        if (activeCard) activeCard.classList.remove('active');
        activeCard = card;
        card.classList.add('active');
        detail.innerHTML = '';
        detail.append(el('strong', null, b.name || b.alt || b.text || ''), el('span', null, capText(b.d)));
        detail.classList.remove('hidden');
      };
      card.addEventListener('click', toggle);
      card.addEventListener('keydown', (e) => {
        if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); toggle(); }
      });
    }
    row.appendChild(card);
  }
  wrap.append(row, detail);
  return wrap;
}

function buildBigLogos(logos) {
  const row = el('div', 'logo-duo' + (logos.length > 2 ? ' n3' : ''));
  for (const l of logos) {
    const card = el(l.url ? 'a' : 'div', 'logo-card duo' + (l.light ? ' light' : '') + (l.tile ? ' tile' : ''));
    if (l.url) {
      card.href = l.url;
      card.target = '_blank';
      card.rel = 'noopener';
      card.addEventListener('click', () => audio.play('click'));
    }
    const img = el('img');
    img.src = l.img;
    img.alt = l.alt || '';
    img.title = l.alt || '';
    img.loading = 'lazy';
    card.appendChild(img);
    row.appendChild(card);
  }
  return row;
}

function buildGames(games) {
  const zone = el('section', 'game-zone');
  zone.appendChild(el('h3', 'game-head', capText(games.head)));
  const role = el('p', 'game-role');
  role.innerHTML = capText(games.role); // มี <b> จาก content.js ของเราเอง
  zone.appendChild(role);
  const grid = el('div', 'game-grid');
  for (const g of games.items) {
    const card = el('article', 'game-card');
    const art = el('div', 'game-art');
    const im = el('img');
    im.src = g.img;
    im.alt = g.title;
    im.loading = 'lazy';
    art.appendChild(im);
    const studio = el('div', 'game-studio');
    if (g.studioLogo) {
      const lg = el('img');
      lg.src = g.studioLogo;
      lg.alt = '';
      lg.loading = 'lazy';
      lg.addEventListener('error', () => lg.remove());
      studio.appendChild(lg);
    }
    studio.appendChild(el('span', null, g.studio));
    const body = el('div', 'game-body');
    body.append(studio, el('h4', 'game-title', g.title), el('p', 'game-desc', capText(g.d)));
    card.append(art, body);
    if (g.url) {
      const a = el('a', 'game-btn', '▶ STEAM');
      a.href = g.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.addEventListener('click', () => audio.play('click'));
      body.appendChild(a);
    }
    grid.appendChild(card);
  }
  zone.appendChild(grid);
  return zone;
}

function buildLogoWall(wall) {
  const zone = el('section', 'net-wall');
  if (wall.hint) zone.appendChild(el('div', 'net-hint', capText(wall.hint)));
  for (const g of wall.groups) {
    const head = el('h3', 'net-head', capText(g.head));
    const grid = el('div', 'net-grid');
    const detail = el('div', 'net-detail hidden');
    let active = null;
    for (const it of g.items) {
      const card = el('button', 'net-card' + (it.light ? ' light' : ''));
      card.type = 'button';
      const box = el('div', 'net-logo');
      const img = el('img');
      img.src = it.img;
      img.alt = it.name;
      img.loading = 'lazy';
      box.appendChild(img);
      card.append(box, el('span', 'net-name', it.name));
      if (it.stat) card.appendChild(el('span', 'net-stat', it.stat));
      card.addEventListener('click', () => {
        audio.play('blip');
        if (active === card) {
          card.classList.remove('active');
          detail.classList.add('hidden');
          active = null;
          return;
        }
        if (active) active.classList.remove('active');
        active = card;
        card.classList.add('active');
        detail.innerHTML = '';
        detail.append(el('strong', null, it.name), el('span', null, capText(it.d)));
        if (it.url) {
          const a = el('a', 'net-link', i18n.t('ui.openLink'));
          a.href = it.url;
          a.target = '_blank';
          a.rel = 'noopener';
          a.addEventListener('click', (e) => { e.stopPropagation(); audio.play('click'); });
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

function buildChannelHead(show) {
  const head = el('div', 'yt-head');
  const av = el('img');
  av.src = show.avatar;
  av.alt = '';
  head.append(av, el('span', null, show.channelName || ''));
  return head;
}

// เนื้อหาของ 1 บท (panel id เดิม) — ใช้ทั้งใน panel เกมและเป็นฐานให้ Resume Mode
export function buildChapter(id, { full = false } = {}) {
  const data = i18n.t(`panels.${id}`);
  if (!data) return null;
  const show = SHOWCASE[id] || {};
  const frag = document.createDocumentFragment();
  if (data.sub) frag.appendChild(el('p', 'chapter-sub', data.sub));
  if (!full && show.brands && show.brandsTop) {
    if (data.brandsHead) frag.appendChild(el('div', 'brand-head', data.brandsHead));
    const zone = buildBrands(show.brands);
    zone.classList.add('top');
    frag.appendChild(zone);
  }
  if (!full && show.avatar) frag.appendChild(buildChannelHead(show));
  if (!full && (show.hero || show.heroLogo)) frag.appendChild(buildHero(show, data.title));
  if (!full && show.slides) frag.appendChild(buildCarousel(show.slides));
  if (!full && show.wall) frag.appendChild(buildLogoWall(show.wall));
  if (data.uses) frag.appendChild(buildUses(data.uses));
  if (data.stats) frag.appendChild(buildStats(data.stats));
  frag.appendChild(buildBullets(full ? data.lines : (data.brief || data.lines)));
  if (show.gameGroups) frag.appendChild(full ? buildGamesList(show.gameGroups) : buildGamesShowcase(show.gameGroups));
  if (!full && show.bigLogos) frag.appendChild(buildBigLogos(show.bigLogos));
  if (!full && show.games) frag.appendChild(buildGames(show.games));
  if (!full && show.brands && !show.brandsTop) frag.appendChild(buildBrands(show.brands));
  else if (data.tags && (full || !show.brandsTop)) frag.appendChild(buildTags(data.tags));
  if (data.contactHead) frag.appendChild(el('h3', 'sec-head', data.contactHead));
  if (data.links) frag.appendChild(buildLinks(data.links));
  if (data.docs) {
    const docs = buildDocs(data.docs, data.docsHead);
    if (docs) frag.appendChild(docs);
  }
  if (data.cardHead) frag.appendChild(buildCard(data));
  return frag;
}

export class Panels {
  /**
   * @param onOpenChange  callback(isOpen) — main ใช้หยุด/คืนการเดินของผู้เล่น
   * @param onOpenZone    callback(zoneId) — main ใช้นับความคืบหน้า
   */
  constructor({ onOpenChange, onOpenZone }) {
    this.onOpenChange = onOpenChange;
    this.onOpenZone = onOpenZone;
    this.root = document.getElementById('panel');
    this.box = document.getElementById('panel-box');
    this.titleEl = document.getElementById('panel-title');
    this.tabsEl = document.getElementById('panel-tabs');
    this.bodyEl = document.getElementById('panel-body');
    this.closeBtn = document.getElementById('panel-close');
    this.scrollEl = document.getElementById('panel-scroll');
    this.openId = null;     // zone id (หรือ panel id ตรงๆ)
    this.chapter = 0;

    this.scrollEl.addEventListener('scroll', () => this.syncScrollCue(), { passive: true });
    window.addEventListener('resize', () => this.syncScrollCue());

    // focus trap
    this.root.addEventListener('keydown', (e) => {
      if (e.code !== 'Tab' || !this.openId) return;
      const items = [...this.box.querySelectorAll(
        'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])')]
        .filter((it) => it.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    this.closeBtn.addEventListener('click', () => this.close());
    this.root.addEventListener('pointerdown', (e) => {
      if (e.button === 0 && e.target === this.root) this.close();
    });
    this.root.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.openId) this.close();
    });
    window.addEventListener('keydown', (e) => {
      if (this.openId && e.code === 'Escape') this.close();
    });
  }

  get isOpen() { return this.openId !== null; }

  syncScrollCue() {
    const s = this.scrollEl;
    this.box.classList.toggle('has-more', s.scrollHeight - s.clientHeight - s.scrollTop > 12);
  }

  // รายการบทของโซน (วัตถุในห้อง) — ถ้าไม่ใช่โซนก็ถือว่าเป็น panel id เดี่ยว
  chaptersOf(id) {
    const zone = OBJECTS.find((o) => o.id === id);
    return zone ? zone.chapters : [id];
  }

  open(id, chapter = 0) {
    if (!this.render(id, chapter)) return;
    clearTimeout(this._closeTimer);
    this.root.classList.remove('hidden', 'closing');
    this.box.classList.remove('opening');
    void this.box.offsetWidth;
    this.box.classList.add('opening');
    this.scrollEl.scrollTop = 0;
    this.syncScrollCue();
    audio.play('pop');
    this.onOpenChange(true);
    this.onOpenZone?.(id);
    this.closeBtn.focus({ preventScroll: true });
  }

  refresh() {
    if (this.openId) this.render(this.openId, this.chapter);
  }

  render(id, chapter = 0) {
    const chapters = this.chaptersOf(id);
    const zoneName = i18n.t('zones')?.[id];
    const first = i18n.t(`panels.${chapters[0]}`);
    if (!first) return false;
    this.openId = id;
    this.chapter = Math.min(chapter, chapters.length - 1);
    const cur = chapters[this.chapter];
    const data = i18n.t(`panels.${cur}`);
    this.titleEl.textContent = zoneName || data.title;

    // แถบเลือกบท (เฉพาะโซนที่มี >1 บท) — role tablist + ลูกศรซ้ายขวา
    this.tabsEl.innerHTML = '';
    this.tabsEl.classList.toggle('hidden', chapters.length < 2);
    if (chapters.length > 1) {
      this.tabsEl.setAttribute('role', 'tablist');
      this.tabsEl.setAttribute('aria-label', i18n.t('ui.chapters'));
      chapters.forEach((cid, i) => {
        const d = i18n.t(`panels.${cid}`);
        const b = el('button', 'tab' + (i === this.chapter ? ' on' : ''), d?.title || cid);
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', String(i === this.chapter));
        b.tabIndex = i === this.chapter ? 0 : -1;
        b.addEventListener('click', () => {
          if (i === this.chapter) return;
          audio.play('blip');
          this.render(id, i);
          this.scrollEl.scrollTop = 0;
          this.tabsEl.querySelectorAll('.tab')[i]?.focus();
        });
        b.addEventListener('keydown', (e) => {
          if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
            e.preventDefault();
            const n = (i + (e.code === 'ArrowRight' ? 1 : -1) + chapters.length) % chapters.length;
            this.render(id, n);
            this.tabsEl.querySelectorAll('.tab')[n]?.focus();
          }
        });
        this.tabsEl.appendChild(b);
      });
    }

    this.bodyEl.innerHTML = '';
    if (chapters.length > 1) this.bodyEl.appendChild(el('h3', 'chapter-title', data.title));
    const frag = buildChapter(cur);
    if (frag) this.bodyEl.appendChild(frag);
    this.closeBtn.setAttribute('aria-label', i18n.t('ui.close'));
    requestAnimationFrame(() => this.syncScrollCue());
    return true;
  }

  close() {
    if (!this.openId) return;
    this.openId = null;
    this.box.classList.remove('opening');
    this.root.classList.add('closing');
    clearTimeout(this._closeTimer);
    this._closeTimer = setTimeout(() => {
      this.root.classList.add('hidden');
      this.root.classList.remove('closing');
      this.bodyEl.querySelectorAll('iframe').forEach((f) => f.remove());
    }, REDUCED() ? 0 : 190);
    audio.play('click');
    this.onOpenChange(false);
  }
}
