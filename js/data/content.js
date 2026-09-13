// ============================================
// content.js — ★ ข้อความ/ข้อมูลทั้งหมดอยู่ที่นี่ที่เดียว
// ห้าม hardcode ข้อความในโค้ดไฟล์อื่น
// เนื้อหาจริงจาก Resume.pdf + คำสั่งเจ้าของรอบ showcase v2 (2026-07-17)
// ============================================

// ไฟล์ resume จริง — ★ 2026-09-13: อัปเดตเป็นฉบับ 13 ก.ย. 2026 จาก Desktop/Resume
//   (Resume.pdf ↔ HTML/Resume.html · 職務経歴書.pdf ↔ HTML/職務経歴書.html)
//   ★ `?v=` ต่อท้าย = กัน cache ของ GitHub Pages/เบราว์เซอร์ที่ยังจำฉบับเก่า (ชื่อไฟล์คงเดิม)
//   ★ 履歴書/職務経歴書 = ฉบับทั่วไปสำหรับเว็บ (2026-09-13 เจ้าของสั่ง): HTML/履歴書_一般_web.html +
//     HTML/職務経歴書_一般_web.html → *_web.pdf (志望動機 ไม่เจาะบริษัท · ไม่ระบุ tool · เรียงทุกสาย เอียงทางเกม)
//     ฉบับยื่นบริษัท (root 履歴書.html/職務経歴書.html) แยกต่างหาก ห้ามเอาขึ้นเว็บ
const DOC_V = '?v=20260913';
const RESUME_PDF = 'assets/resume-nipith-wongsirikul.pdf' + DOC_V;
const RESUME_PDF_JA = 'assets/resume-nipith-wongsirikul-ja.pdf' + DOC_V;         // 履歴書
const RESUME_PDF_JA_CV = 'assets/resume-nipith-wongsirikul-ja-cv.pdf' + DOC_V;   // 職務経歴書
const CARD_PDF = 'assets/business-card-nipith-wongsirikul.pdf' + DOC_V;
const CARD_FRONT = 'assets/card-front.webp';
const CARD_BACK = 'assets/card-back.webp';
// โบรชัวร์ทางการ GCA×TGS 2026 (เจ้าของมีติดตัว — ใช้ประกอบพิตช์ "สะพานสู่อีเวนต์เกมไทย" ในโซน event)
const TGS_BROCHURE = 'assets/tgs26-brochure.pdf';

// ข้อความกลางที่ไม่ผูกกับภาษา (โลโก้/ชื่อแบรนด์)
export const BRAND = {
  logo: 'NIPITH WONGSIRIKUL', // ชื่อจริงเจ้าของพอร์ต (ยืนยันแล้ว) — แสดง 2 บรรทัดแบบโลโก้เกม
  tagline: 'PORTFOLIO', // เจ้าของยืนยันคงคำนี้ (2026-07-17)
  pressStart: 'PRESS START',
  resumePdf: RESUME_PDF,
  resumePdfJa: RESUME_PDF_JA,
  resumePdfJaCv: RESUME_PDF_JA_CV,
  cardPdf: CARD_PDF,
  cardFront: CARD_FRONT,
  cardBack: CARD_BACK,
  // ★ 2026-09-13: ข้อมูลที่ต้องเห็นบนหน้าแรกทันที (ไม่ต้องรอภาษา — เป็นชื่อสายงานสากล)
  role: 'Game Localization · LQA · Thai-market Marketing',
  rolePair: 'JA / EN → TH',
  // ปุ่มเปิดเอฟเฟกต์เต็ม — โชว์เฉพาะคนที่ OS ตั้ง reduce motion ไว้ (ก่อนเลือกภาษา เลยใช้คำสากล)
  fullFx: '✨ FULL FX',
  // prompt เลือกภาษา — โชว์ก่อนรู้ภาษา เลยต้องมีครบ 3 ภาษาในบรรทัดเดียว
  langPrompt: 'เลือกภาษา · Choose Language · 言語選択',
  langs: [
    { id: 'th', label: 'ไทย' },
    { id: 'en', label: 'English' },
    { id: 'ja', label: '日本語' },
  ],
};

// ============================================
// ★ GAMES — dataset เดียวของ "เกมที่แปล" ใช้ร่วมกันทั้ง Game Mode (ตู้เกม) และ Resume Mode
//   (2026-09-13) ตัวเลขทุกตัวบนเว็บ **นับจากลิสต์นี้** ห้าม hardcode จำนวนซ้ำที่อื่น
//   ชื่อ EN/TH คัดจาก Steam appdetails (13 ก.ย. 2026 — scratchpad/steam/games.json) ห้ามแก้เอง
//   group:  cherrykiss = เกมหลัก Cherry Kiss (Sticky Rice Games) · related = เกมในเครือที่ร่วมพัฒนา
//           pending = แปลเสร็จ รอเผยแพร่ · freelance = งานอิสระ
//   roles:  loc=แปล · edit=ตรวจแก้ · naming=ตั้งชื่อไทย · store=หน้าร้าน Steam · lqa=LQA
//           promo=โปรโมต · keyart=ภาพปกไทย   (ป้ายข้อความอยู่ใน STRINGS[lang].games.roles)
//   status: th = มีภาษาไทยบน Steam · pending = แปลเสร็จ รอเผยแพร่ · unlisted = ส่งงานแล้ว
//           แต่หน้าร้านยังไม่ระบุภาษาไทย (ตรวจ ก.ย. 2026)
//   mature: ปกไม่เหมาะกับที่ทำงาน → การ์ดตัวอักษรก่อน กดแล้วค่อยโหลดภาพ (ไม่โหลดล่วงหน้า)
// ============================================
const CK_ROLES = ['loc', 'edit', 'naming', 'store', 'lqa', 'promo'];
export const GAMES = [
  { appid: 1830780, en: 'Hentai Houseparty: Gyaru Gangbang', th: 'บ้านพักหรรษา เซ็กซ์หมู่สาวแกล~', group: 'cherrykiss', roles: CK_ROLES, status: 'th', mature: true },
  { appid: 2777820, en: 'Otoko Orgy at Maid Boy Manor', th: 'ปาร์ตี้เดือดกับเหล่าเมดหนุ่มสุดน่ารัก', group: 'cherrykiss', roles: CK_ROLES, status: 'th', mature: true },
  { appid: 3381190, en: 'I Am Motherfucker', th: 'ผมคือ ไอ้เย็ดแม่', group: 'cherrykiss', roles: CK_ROLES, status: 'th', mature: true },
  { appid: 3528490, en: 'Swipe Right for Sugar Mama Sensei', th: 'ปัดขวาในแอปเจอครูสาวเสี่ยเลี้ยง', group: 'cherrykiss', roles: CK_ROLES, status: 'th', mature: true },
  { appid: 3595490, en: 'Pussylympics', th: 'มหากีฬาตกเบ็ด', group: 'cherrykiss', roles: CK_ROLES, status: 'th', mature: true },
  { appid: 3732490, en: 'Mizuki and Me Make a Porno', th: 'ผมกับแม่เลี้ยงตั้งกล่องซั่ม', group: 'cherrykiss', roles: CK_ROLES, status: 'th', mature: true },
  { appid: 4006150, en: 'Secrets of a Porn Shop Princess', th: 'ความลับของเจ้าหญิงแห่งร้านลามก', group: 'cherrykiss', roles: CK_ROLES, status: 'th', mature: true },
  { appid: 4063960, en: 'Oppai Party Creampie Quest', th: 'ภารกิจราดนมบนหน่มนม', group: 'cherrykiss', roles: CK_ROLES, status: 'th', mature: true },
  { appid: 4217380, en: 'Femdom First Timers', th: 'แฟนสาวสายซาดิสม์', group: 'cherrykiss', roles: CK_ROLES, status: 'th', mature: true },
  { appid: 4233640, en: 'I was Reborn in a Fantasy World with a Cock as Long as the Name of this Game!', th: 'ผมมาเกิดใหม่ที่ต่างโลก พร้อมกับดุ้นที่ใหญ่ยาวเหมือนชื่อนิยายไลท์โนเวล', group: 'cherrykiss', roles: CK_ROLES, status: 'th', mature: true },
  { appid: 4468740, en: 'Countryside Cumsluts', th: 'สาวบ้านนอกสุดร่าน', group: 'cherrykiss', roles: CK_ROLES, status: 'th', mature: true },
  { appid: 4565560, en: 'Princess Knight Concedes to Cum', th: 'อัศวินสาวแพ้น้ำว่าว', group: 'cherrykiss', roles: CK_ROLES, status: 'th', mature: true },
  // เกมในเครือ: Cherry Kiss เป็นผู้พัฒนาร่วม / ผู้จัดจำหน่าย Three River Games (ปกไทย + ซับไทย — ตามที่เจ้าของยืนยันรอบ showcase v2)
  { appid: 3361340, en: 'Shop Simulator: Waifu Pillows', th: 'Shop Simulator: หมอนไวฟุ', group: 'related', roles: ['loc', 'keyart'], status: 'th', mature: true,
    dev: 'Cherry Kiss Games · Three River Games', pub: 'Three River Games' },
  // แปลเสร็จแล้ว รอเผยแพร่ (งานผ่าน Sticky Rice Games · ผู้จัดจำหน่ายบน Steam = Dodo Tako)
  { appid: 2228720, en: 'Hack ’n’ Stack', th: 'Hack ’n’ Stack', group: 'pending', roles: ['loc'], status: 'pending', mature: false,
    dev: 'Triple Boris · Dodo Tako', pub: 'Dodo Tako' },
  // Freelance
  { appid: 1025600, en: 'Battle Realms: Zen Edition', th: 'Battle Realms: Zen Edition', group: 'freelance', roles: ['loc', 'lqa'], status: 'unlisted', mature: false,
    dev: 'Ed Del Castillo', pub: 'Ed Del Castillo' },
  { appid: 3513350, en: 'Wuthering Waves', th: 'Wuthering Waves', group: 'freelance', roles: ['loc'], status: 'th', mature: false, via: 'Marano Business',
    dev: 'KURO GAMES', pub: 'KURO GAMES' },
];
for (const g of GAMES) {
  g.img = `assets/showcase/games/steam-${g.appid}.webp`;
  g.url = `https://store.steampowered.com/app/${g.appid}/?l=thai`;
}
// ตัวนับที่ทุกหน้าใช้ร่วมกัน (นับจาก dataset — ไม่ใช่ตัวเลขพิมพ์มือ)
export const GAME_COUNTS = {
  cherrykiss: GAMES.filter((g) => g.group === 'cherrykiss').length,          // 12
  shipped: GAMES.filter((g) => g.group !== 'freelance' && g.status === 'th').length, // 13 = CK 12 + Shop Simulator
  pending: GAMES.filter((g) => g.status === 'pending').length,               // 1
  freelance: GAMES.filter((g) => g.group === 'freelance').length,            // 2
  total: GAMES.length,                                                       // 16
};

// ============================================
// SHOWCASE — ส่วน "โชว์" ของแต่ละ panel (ภาพ/สไลด์/คลิป — ไม่ผูกกับภาษา
// ยกเว้น cap ที่เป็น {th,en,ja} ได้) — asset จากเว็บสาธารณะ 2026-07-17:
// Steam CDN / stickyricegames.com / digitalhearts.com / YouTube / firstpagepro
// โครงสไลด์: { img | video:{id,vertical} | text | mystery, url?, cap?, tall?, logoCard? }
// ============================================
export const SHOWCASE = {
  'arcade-1': {
    // ★ 2026-09-13: รายชื่อเกมทั้งหมดมาจาก GAMES (carousel + กริด) — สไลด์เหลือแค่โลโก้ค่าย
    gameGroups: ['cherrykiss', 'related', 'pending'],
    slides: [
      {
        img: 'assets/showcase/slides/stickyrice.webp',
        url: 'https://store.steampowered.com/publisher/stickyricegames',
        cap: {
          th: 'Sticky Rice Games — publisher เกมญี่ปุ่นบน Steam',
          en: 'Sticky Rice Games — Japanese games on Steam',
          ja: 'Sticky Rice Games — 日本のゲームをSteamへ',
        },
      },
      {
        img: 'assets/showcase/slides/cherrykiss.webp',
        url: 'https://store.steampowered.com/developer/cherrykiss',
        cap: {
          th: 'Cherry Kiss — แบรนด์เกม 18+ ในเครือ (95+ เกมบน Steam)',
          en: 'Cherry Kiss — the group\'s 18+ label (95+ games on Steam)',
          ja: 'Cherry Kiss — グループの18+レーベル（Steamで95作品以上）',
        },
      },
    ],
  },
  'arcade-2': {
    gameGroups: ['freelance'],
    slides: [
      {
        img: 'assets/showcase/slides/manga.webp',
        url: 'https://www.firstpagepro.com/category/110/manga-%E0%B8%AB%E0%B8%99%E0%B8%B1%E0%B8%87%E0%B8%AA%E0%B8%B7%E0%B8%AD%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%8C%E0%B8%95%E0%B8%B9%E0%B8%99/%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%8C%E0%B8%95%E0%B8%B9%E0%B8%99%E0%B9%80%E0%B8%A3%E0%B8%97%E0%B8%97%E0%B8%B1%E0%B9%88%E0%B8%A7%E0%B9%84%E0%B8%9B/%E0%B8%A3%E0%B8%A7%E0%B8%A1%E0%B9%80%E0%B8%A3%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%A2%E0%B8%B9%E0%B8%A3%E0%B8%B4%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B9%82%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%A1%E0%B8%B0-%E0%B9%80%E0%B8%AD%E0%B8%A1%E0%B8%B0-%E0%B8%8A%E0%B9%88%E0%B8%A7%E0%B8%87%E0%B9%80%E0%B8%A7%E0%B8%A5%E0%B8%B2%E0%B8%81%E0%B8%B1%E0%B8%9A%E0%B8%84%E0%B8%B8%E0%B8%93%E0%B8%84%E0%B8%A3%E0%B8%B9',
        cap: {
          th: 'มังงะลิขสิทธิ์ "ช่วงเวลากับคุณครู" — แปลให้ Kadokawa Thailand',
          en: 'Licensed manga — translated for Kadokawa Thailand',
          ja: 'ライセンス漫画 — KADOKAWAタイランドにて翻訳',
        },
      },
      // ★ 2026-07-20: รูปงานล่ามจริง (เจ้าของส่งมา)
      {
        img: 'assets/showcase/slides/interpreter.webp',
        cap: {
          th: '🎧 งานล่าม JA⇄TH ในบริษัทญี่ปุ่น — ล่ามพูดตามในการประชุมและการเจรจาธุรกิจ',
          en: '🎧 On-site JA⇄TH interpreting at a Japanese company — consecutive interpreting in meetings and negotiations',
          ja: '🎧 日系企業での日タイ通訳業務 — 会議・商談での逐次通訳',
        },
      },
    ],
  },
  'arcade-3': { hero: 'assets/showcase/slides/dh.webp' },
  'arcade-4': {
    slides: [
      {
        mystery: true,
        cap: {
          th: 'ภายใต้ NDA — เปิดเผยเมื่อถึงเวลา 🤫',
          en: 'Under NDA — revealed when the time comes 🤫',
          ja: 'NDAのため非公開 — 時が来たら発表 🤫',
        },
      },
    ],
  },
  // ทุนญี่ปุ่นทั้ง 3 — โลโก้องค์กรจริง (เจ้าของส่งไฟล์มาแล้ว 2026-07-17 ใน ฐานข้อมูล/)
  bookshelf: {
    slides: [
      {
        img: 'assets/showcase/slides/tni.webp',
        cap: {
          th: '🎓 สถาบันเทคโนโลยีไทย-ญี่ปุ่น (TNI) — ป.ตรี Business Japanese เกียรตินิยมอันดับ 2 (นักเรียนทุนเต็มจำนวน)',
          en: '🎓 Thai-Nichi Institute of Technology (TNI) — B.A. Business Japanese, 2nd-class honours, full scholarship',
          ja: '🎓 泰日工業大学（TNI）— ビジネス日本語学科 卒業（second-class honours・全額奨学生）',
        },
      },
      {
        img: 'assets/showcase/slides/tokyo.webp',
        cap: {
          th: '🏙️ ทุนรัฐบาลกรุงโตเกียว (Tokyo Internship) — Zeal Team ประจำที่โตเกียว 3 เดือน (2023)',
          en: '🏙️ Tokyo Metropolitan Gov\'t program — 3 months on-site at Zeal Team (2023)',
          ja: '🏙️ 東京都主催 Tokyo Internship — Zeal Teamにて東京常駐3か月（2023）',
        },
      },
      {
        img: 'assets/showcase/slides/japan-internship.webp',
        cap: {
          th: '🇯🇵 ทุน METI — JAPAN Internship Program ฝึกงาน Touhou Bussan (2021)',
          en: '🇯🇵 METI — JAPAN Internship Program, Touhou Bussan (2021)',
          ja: '🇯🇵 経済産業省 JAPAN Internship Program — 東邦物産（2021）',
        },
      },
      {
        img: 'assets/showcase/slides/jtecs.webp',
        cap: {
          th: '🥇 ทุน JTECS สอบคัดเลือกได้ที่ 1 — Haru Urarakana Shobo โตเกียว (2019–2020)',
          en: '🥇 JTECS scholarship, ranked 1st in selection — Haru Urarakana Shobo, Tokyo',
          ja: '🥇 JTECS奨学金・選考1位 — はるうららかな書房（東京）',
        },
      },
      {
        img: 'assets/showcase/slides/jamboree.webp',
        cap: {
          th: '⚜️ ชุมนุมลูกเสือโลกครั้งที่ 23 ที่ยามากุจิ ญี่ปุ่น (2015) — ก้าวแรกสู่ญี่ปุ่นตั้งแต่ ม.ปลาย',
          en: '⚜️ 23rd World Scout Jamboree, Yamaguchi, Japan (2015) — first step into Japan in high school',
          ja: '⚜️ 第23回世界スカウトジャンボリー（山口・2015）— 高校時代、日本との出会い',
        },
      },
    ],
  },
  // (ตู้ "สกิล & รางวัล" ถูกถอดจากห้องแล้ว 2026-07-18 รอบสอง — สกิลย้ายไป
  //  section 'skills' ใน Resume Mode, รางวัล/แบรนด์ไปอยู่ใน youtube brands)
  // ★ ตู้อีเวนต์ (ใหม่ 2026-07-18) — JETRO / สาวม้า / AFA NicoNico / TGS Business Day
  // รูปจริงจาก ฐานข้อมูล/ — ผ่าน gen_slides.py เป็น 1920×1080 หมดแล้ว
  event: {
    slides: [
      {
        img: 'assets/showcase/slides/event-uma.webp',
        cap: {
          th: 'อีเวนต์ Uma Musume สุดยิ่งใหญ่ — คอสเพลย์ 100+ คน ผู้ร่วมกิจกรรมหลายพัน',
          en: 'The massive Uma Musume event — 100+ cosplayers, thousands joining in',
          ja: '『ウマ娘』ビッグイベント — コスプレイヤー100名超・数千人が参加',
        },
      },
      {
        img: 'assets/showcase/slides/event-tgs2024.webp',
        cap: {
          th: 'บูท JETRO @ Thailand Game Show — ล่ามประจำบูท + Business Matching',
          en: 'JETRO booth @ Thailand Game Show — booth interpreter + business matching',
          ja: 'JETROブース @ Thailand Game Show — ブース通訳＆ビジネスマッチング',
        },
      },
      // ★ 2026-07-20: รูปทีมงานบูทจริง (เจ้าของส่งมาเพิ่ม)
      {
        img: 'assets/showcase/slides/event-jetro-team.webp',
        cap: {
          th: 'ทีมบูท JETRO เต็มทีม @ Thailand Game Show — ผนังโชว์เคสเกมญี่ปุ่นเต็มบูท',
          en: 'The full JETRO booth team @ Thailand Game Show — walls of Japanese titles on show',
          ja: 'JETROブースのチーム全員 @ Thailand Game Show — 日本タイトルがずらり並ぶブース',
        },
      },
      // ★ 2026-07-20: Book Expo Thailand — เจ้าของเป็นสตาฟงานปี 2017 และ 2019
      //   ภาพที่ใช้คือ key visual ทางการของปี 2025 (โหลดจากหน้าอีเวนต์ QSNCC)
      {
        img: 'assets/showcase/slides/bookexpo.webp',
        url: 'https://www.thaibookfair.com/',
        cap: {
          th: '📚 Book Expo Thailand — มหกรรมหนังสือระดับชาติ · เข้าร่วมเป็นสตาฟของงานทั้งปี 2017 และ 2019',
          en: '📚 Book Expo Thailand — the national book fair · joined as event staff in both 2017 and 2019',
          ja: '📚 Book Expo Thailand — タイ最大級のブックフェア · 2017年・2019年ともにスタッフとして参加',
        },
      },
      // ★ 2026-07-20 รอบ 6: เจ้าของสั่งย้ายหมวดโยซาโค่ยจากโซนประวัติมาโซนอีเวนต์
      //   (เป็นงานแสดง/อีเวนต์จริงๆ ไม่ใช่ประวัติการศึกษา) · ภาพสนามกีฬาถูกตัดออกตามสั่ง
      {
        img: 'assets/showcase/slides/yosakoi.webp',
        cap: {
          th: '🏮 ชมรมโยซาโค่ย (ผมเป็นประธานชมรม) — ถือนารุโกะเต้นในชุดฮัปปิ ที่หมู่บ้านญี่ปุ่น อยุธยา',
          en: '🏮 Yosakoi club (I was the club president) — naruko in hand at the Japanese Village, Ayutthaya',
          ja: '🏮 よさこいサークル（部長を務めました）— アユタヤの日本人村にて鳴子を持って',
        },
      },
      {
        img: 'assets/showcase/slides/event-jetro-booth.webp',
        cap: {
          th: 'JETRO "Made in Japan Collection" — วันเซ็ตบูทก่อนงานเปิด',
          en: 'JETRO "Made in Japan Collection" — booth build day before the show opened',
          ja: 'JETRO「Made in Japan Collection」— 開場前のブース設営日',
        },
      },
      {
        img: 'assets/showcase/slides/event-nico.webp',
        cap: {
          th: 'NicoNico Stage @ AFA Bangkok — ดูแลทั้งโซน คุมเอฟเฟกต์ และขึ้น MC',
          en: 'NicoNico Stage @ AFA Bangkok — ran the whole zone, effects ops & MC',
          ja: 'ニコニコステージ @ AFA Bangkok — ゾーン統括・演出オペ・MC担当',
        },
      },
      {
        img: 'assets/showcase/slides/afa.webp',
        cap: {
          th: 'Anime Festival Asia Bangkok — งานป๊อปคัลเจอร์ญี่ปุ่นระดับภูมิภาค',
          en: 'Anime Festival Asia Bangkok — the region\'s Japan pop-culture festival',
          ja: 'Anime Festival Asia Bangkok — 日本ポップカルチャーの祭典',
        },
      },
      {
        img: 'assets/showcase/slides/event-tgs.webp',
        cap: {
          th: 'Tokyo Game Show Business Day — บุกหาลูกค้ากับ Sticky Rice 2 วันเต็ม',
          en: 'Tokyo Game Show Business Day — 2 full days of client hunting with Sticky Rice',
          ja: '東京ゲームショウ ビジネスデイ — Sticky Riceと2日間商談行脚',
        },
      },
    ],
    // ★ v4 2026-07-20: เจ้าของสั่ง — ถอดการ์ด JETRO ออกจากแถวโลโก้ (เนื้อหา/สไลด์ JETRO
    //   ยังอยู่ครบ) + เปลี่ยนภาพ Thailand Game Show จากรูปถ่ายบูท เป็นโลโก้จริงที่ส่งมาให้
    bigLogos: [
      // tile = โลโก้ทรงสี่เหลี่ยมจัตุรัสที่มีพื้นหลังของตัวเอง → ให้เต็มความสูงการ์ด + มุมมน
      // (ไฟล์อบมุมมน+alpha มาแล้ว จาก FB profile 720px ตัดขอบว่างออก)
      { img: 'assets/showcase/logos/sm/tgs.webp', alt: 'Thailand Game Show', url: 'https://www.thailandgameshow.com/', tile: true },
      { img: 'assets/showcase/logos/sm/afa.webp', alt: 'Anime Festival Asia', url: 'https://animefestival.asia/', light: true },
    ],
    // ★ NEW 2026-07-20: "Arcade Selection Screen" — เกมที่ยืนหน้าบูท JETRO
    //   เลิกใช้ tag สี่เหลี่ยมทื่อๆ → การ์ดไอเทมเกมพร้อมอาร์ตเวิร์ก + ปุ่มไป Steam
    //   ภาพ header ดึงจาก Steam CDN (assets/showcase/games/) — appid กำกับไว้ในคอมเมนต์
    games: {
      head: {
        // ★ เจ้าของสั่งเปลี่ยนหัวข้อ 2026-07-20: เน้นว่าเป็น "เกมดัง" ที่อยู่ในบูท
        th: '🕹️ ตัวอย่างเกมดังที่อยู่ในบูท',
        en: '🕹️ Some of the big titles in the booth',
        ja: '🕹️ ブースに並んだ話題のタイトル（一部）',
      },
      role: {
        th: 'หน้าที่ในบูท: <b>Staff / Game Presenter</b> — ยืนประกบเครื่องเล่นสาธิต แนะนำเกมให้ผู้เล่นชาวไทย สอนวิธีเล่นตั้งแต่ศูนย์ แปลสดให้ทีมพัฒนาชาวญี่ปุ่น แจกใบปลิว และชวนผู้เล่นกด Wishlist บน Steam',
        en: 'Booth role: <b>Staff / Game Presenter</b> — manned the demo stations, pitched each title to Thai players, taught the controls from scratch, interpreted live for the Japanese developers, handed out flyers and drove Steam wishlist adds',
        ja: 'ブースでの役割: <b>スタッフ / ゲームプレゼンター</b> — 試遊台に常駐し、タイのプレイヤーへ各タイトルを紹介。操作説明、日本の開発者向けの逐次通訳、チラシ配布、Steamウィッシュリスト登録の promotion を担当',
      },
      items: [
        {
          // Steam appid 2459750
          studio: 'BeXide Inc.',
          studioLogo: 'assets/showcase/logos/sm/bexide.webp',
          title: 'Yohane the Parhelion - NUMAZU in the MIRAGE -',
          img: 'assets/showcase/games/yohane.jpg',
          url: 'https://store.steampowered.com/app/2459750/',
          d: {
            th: 'เกมแอ็กชัน 2D สำรวจดันเจี้ยน จากอนิเมะ Yohane the Parhelion (Love Live! Sunshine!!)',
            en: '2D dungeon-crawling action game based on the anime Yohane the Parhelion (Love Live! Sunshine!!)',
            ja: 'アニメ『幻日のヨハネ』を原作とした2Dダンジョン探索アクション',
          },
        },
        {
          // Steam appid 2468550
          studio: 'Asobism Co., Ltd.',
          studioLogo: 'assets/showcase/logos/sm/asobism.webp',
          title: 'Vivid World',
          img: 'assets/showcase/games/vividworld.jpg',
          url: 'https://store.steampowered.com/app/2468550/',
          d: {
            th: 'เกมผจญภัยโลกกว้างสไตล์อาร์ตสดใส — ใช้สีชุบชีวิตโลกที่ไร้สีสัน',
            en: 'A vivid open-world adventure — bring colour back to a world drained of it',
            ja: '色を失った世界に彩りを取り戻す、鮮やかなオープンワールドアドベンチャー',
          },
        },
        {
          // Steam appid 2369900
          studio: 'KONAMI',
          studioLogo: 'assets/showcase/logos/sm/konami.webp',
          title: 'Castlevania Dominus Collection',
          img: 'assets/showcase/games/castlevania-dominus.jpg',
          url: 'https://store.steampowered.com/app/2369900/',
          d: {
            th: 'รวมชุด Castlevania ภาค Nintendo DS 3 ภาค + Haunted Castle Revisited จาก KONAMI',
            en: 'KONAMI\'s collection of the three Nintendo DS Castlevania titles plus Haunted Castle Revisited',
            ja: 'ニンテンドーDS『悪魔城ドラキュラ』3作品＋Haunted Castle Revisitedを収録したKONAMIのコレクション',
          },
        },
        {
          // Steam appid 3081840 — ★ เจ้าของสั่งเพิ่ม 2026-07-20
          studio: 'holo Indie',
          studioLogo: 'assets/showcase/logos/sm/holoindie.webp',
          title: 'Chrono Gear: Warden of Time',
          img: 'assets/showcase/games/chronogear.jpg',
          url: 'https://store.steampowered.com/app/3081840/',
          d: {
            th: 'แอ็กชันแพลตฟอร์มย้อนเวลา จากค่าย holo Indie (โครงการอินดี้ของ hololive)',
            en: 'A time-rewinding action platformer published under holo Indie (hololive\'s indie label)',
            ja: '時を巻き戻すアクションプラットフォーマー。ホロライブのインディーレーベル holo Indie 作品',
          },
        },
        {
          // Steam appid 2157560 — ★ เจ้าของสั่งเพิ่ม 2026-07-20
          studio: 'Cygames, Inc.',
          studioLogo: 'assets/showcase/logos/sm/cygames.webp',
          title: 'Granblue Fantasy Versus: Rising',
          img: 'assets/showcase/games/gbvsr.jpg',
          url: 'https://store.steampowered.com/app/2157560/',
          d: {
            th: 'เกมต่อสู้ 2.5D จากจักรวาล Granblue Fantasy — Cygames × Arc System Works',
            en: '2.5D fighting game set in the Granblue Fantasy universe — Cygames × Arc System Works',
            ja: '『グランブルーファンタジー』の2.5D対戦格闘ゲーム — Cygames × アークシステムワークス',
          },
        },
      ],
    },
  },
  // ★ โซนใหม่ 2026-07-20: ตู้เกม Esport — ประวัตินักแข่ง Dota 2 + Pokémon UNITE
  //   (ตู้ที่ 5 ของแถวเหนือ) — คลิปแข่งจริง 2 รายการ + ภาพงาน LAN Finals
  esport: {
    slides: [
      {
        video: { id: 'BwjusMBK0ps' },
        cap: {
          th: 'IT LADKRABANG OPEN HOUSE — DOTA 2 Tournament (ถ่ายทอดการแข่งจริง)',
          en: 'IT Ladkrabang Open House — DOTA 2 Tournament (full match broadcast)',
          ja: 'IT Ladkrabang Open House — DOTA 2 大会（実際の試合中継）',
        },
      },
      {
        img: 'assets/showcase/slides/esport-bodin.webp',
        cap: {
          th: 'LAN Finals "Bodindecha The Battle" (17 ก.พ. 2017) — รอบชิงออฟไลน์ สปอนเซอร์โดย Alienware',
          en: 'LAN Finals "Bodindecha The Battle" (17 Feb 2017) — offline finals sponsored by Alienware',
          ja: 'LAN決勝「Bodindecha The Battle」（2017年2月17日）— Alienware協賛のオフライン決勝',
        },
      },
      {
        video: { id: '_1Nymo9wWY8' },
        cap: {
          th: 'AIS 5G eSports OPEN Thailand 2022 : Pokémon UNITE — เข้ารอบ Top 8 ของรายการ',
          en: 'AIS 5G eSports OPEN Thailand 2022: Pokémon UNITE — finished in the Top 8',
          ja: 'AIS 5G eSports OPEN Thailand 2022：ポケモンユナイト — ベスト8進出',
        },
      },
    ],
  },
  // ★ โซนใหม่ 2026-07-20 รอบ 7: งานเขียนนิยายเว็บ (โต๊ะเขียนแถวล่าง)
  //   เหตุผลที่ควรอยู่ในพอร์ตแปลเกม: งานแปล = งานเขียน "ภาษาปลายทาง"
  //   ตัวเลขคนอ่านจริงคือหลักฐานว่าคุมสำนวน/โทน/เล่าเรื่องยาวจบได้
  writing: {
    slides: [
      {
        img: 'assets/showcase/slides/novel.webp',
        url: 'https://www.tunwalai.com/story/233324',
        cap: {
          th: '📖 "นักแปรธาตุติดคำสาปกับสาวๆ หลากหลายพันธุ์" — นิยายแฟนตาซีบน Tunwalai · 172,000 วิว · 139 ตอน',
          en: '📖 A cursed-alchemist fantasy web novel on Tunwalai — 172,000 reads · 139 chapters',
          ja: '📖 Tunwalaiで連載中のファンタジーWeb小説 — 17.2万閲覧・139話',
        },
      },
    ],
  },
  // ★ v3 2026-07-20: "กำแพงโลโก้" แทน carousel — เจ้าของบอกเลื่อนทีละใบแล้วไม่เห็น
  //   ภาพรวมว่าเครือข่ายใหญ่แค่ไหน · ตอนนี้เห็นทุกเพจ/องค์กรพร้อมกันในจอเดียว
  //   แยก 2 กลุ่ม (สื่อ/คอมมูนิตี้ กับ องค์กรที่มีความสัมพันธ์อันดี) แตะการ์ด = กางรายละเอียด
  //   ★ ห้ามใช้คำว่า "พันธมิตร/partner" กับกลุ่มหลัง — เจ้าของย้ำว่าไม่ได้เป็นพาร์ตเนอร์กัน
  //   ยอด follower ตัวเลขเป๊ะยังรอเจ้าของยืนยัน (TODO)
  network: {
    wall: {
      hint: {
        th: 'แตะโลโก้เพื่อดูรายละเอียด · ยอดผู้ติดตาม ณ ก.ค. 2026',
        en: 'Tap a logo for details · follower counts as of July 2026',
        ja: 'ロゴをタップで詳細 · フォロワー数は2026年7月時点',
      },
      groups: [
        {
          head: {
            th: '📣 สื่อ · เพจ · อินฟลูเอนเซอร์เกมไทย',
            en: '📣 Thai gaming media, pages & influencers',
            ja: '📣 タイのゲームメディア・ページ・インフルエンサー',
          },
          items: [
            {
              img: 'assets/showcase/net-pochi.jpg',
              name: 'โปจิโปจิ (Pochi Pochi)',
              stat: '103K subscribers',
              url: 'https://www.youtube.com/@pochix2',
              d: {
                th: 'ยูทูบเบอร์/เพจข่าวอนิเมะ-เกมชื่อดัง ฐานแฟนสายญี่ปุ่นเหนียวแน่น',
                en: 'Popular anime/game news YouTuber with a loyal Japan-culture fanbase',
                ja: 'アニメ・ゲームニュース系の人気YouTuber。日本カルチャー層に強い',
              },
            },
            {
              img: 'assets/showcase/net-sheap.png',
              name: 'เกมถูกบอกด้วย (SheapGamer)',
              stat: '832K followers',
              url: 'https://www.facebook.com/sheapgamer',
              d: {
                th: 'เพจดีลเกมลดราคารายใหญ่ที่สุดแห่งหนึ่งของไทย กระบอกเสียงถึงเกมเมอร์ทั่วประเทศ',
                en: "One of Thailand's biggest game-deals pages — a megaphone to gamers nationwide",
                ja: 'タイ最大級のゲームセール情報ページ。全国のゲーマーへ届く発信力',
              },
            },
            {
              img: 'assets/showcase/net-omteen.jpg',
              name: 'เกมเมอร์อมตีน (GamerOmTeen)',
              stat: '517K followers',
              url: 'https://www.facebook.com/gameromteen',
              d: {
                th: 'เพจมีม/คอมมูนิตี้เกมสุดฮิต เข้าถึงเกมเมอร์ไทยวงกว้าง',
                en: 'Hit gaming meme/community page reaching a huge Thai audience',
                ja: 'タイで大人気のゲームミーム・コミュニティページ',
              },
            },
            {
              img: 'assets/showcase/net-kagami.jpg',
              name: 'Kagami Visual Novel',
              stat: '12K followers',
              url: 'https://www.facebook.com/kagamivisualnovel',
              d: {
                th: 'เพจสาย visual novel ตัวหลักของไทย — พันธมิตรคอนเทนต์ของ Cherry Kiss Thai',
                en: "Thailand's go-to visual-novel page — Cherry Kiss Thai content partner",
                ja: 'タイのビジュアルノベル専門ページ。Cherry Kiss Thaiのコンテンツパートナー',
              },
            },
            {
              img: 'assets/showcase/logos/sm/consolehub.webp',
              name: 'ConSole Hub',
              stat: '90K followers',
              url: 'https://www.facebook.com/ConSoleHubTH/',
              light: true,
              d: {
                th: 'เพจคอมมูนิตี้เกมคอนโซลของไทย',
                en: 'Thai console-gaming community page',
                ja: 'タイのコンシューマーゲームコミュニティページ',
              },
            },
          ],
        },
        {
          head: {
            th: '🤝 องค์กรที่มีความสัมพันธ์อันดี',
            en: '🤝 Organizations I have good working relationships with',
            ja: '🤝 良好な関係のある団体・企業',
          },
          items: [
            {
              // ★ 2026-07-20: เจ้าของแก้ — องค์กรที่ทำงานด้วยจริงคือ JETRO ไม่ใช่ JTECS
              //   (JTECS เป็นผู้ให้ทุนสมัยเรียน ยังอยู่ในโซนประวัติ/การศึกษาตามเดิม)
              img: 'assets/showcase/logos/sm/jetro.webp',
              name: 'JETRO',
              url: 'https://www.jetro.go.jp/en/',
              light: true,
              d: {
                th: 'องค์การส่งเสริมการค้าต่างประเทศของญี่ปุ่น — ร่วมงานกันที่บูทเกม Thailand Game Show ปี 2024 และ 2025 ในฐานะล่ามประจำบูทและผู้ประสาน business matching',
                en: 'Japan External Trade Organization — worked together on the game booth at Thailand Game Show in 2024 and 2025 as booth interpreter and business-matching coordinator',
                ja: '日本貿易振興機構（JETRO）— Thailand Game Show 2024・2025のゲームブースにて、ブース通訳およびビジネスマッチングの調整を担当',
              },
            },
            {
              img: 'assets/showcase/logos/sm/digitalhearts.webp',
              name: 'DIGITAL HEARTS',
              url: 'https://www.digitalhearts.com/',
              light: true,
              d: {
                th: 'บริษัท QA/LQA เกมระดับโลกจากญี่ปุ่น — เคยร่วมงานสาย LQA คอนโซล AAA',
                en: 'Global game QA/LQA company from Japan — worked with them on AAA console LQA',
                ja: '日本発のグローバルゲームQA/LQA企業。AAAコンソールLQAで協業',
              },
            },
            {
              img: 'assets/showcase/logos/sm/kadokawa.webp',
              name: 'Kadokawa Thailand',
              light: true,
              d: {
                th: 'สำนักพิมพ์ญี่ปุ่นรายใหญ่ สาขาไทย — งานแปลมังงะผ่าน First Page Pro',
                en: 'Thai branch of the major Japanese publisher — manga translation via First Page Pro',
                ja: '大手出版社KADOKAWAのタイ拠点。First Page Pro経由でマンガ翻訳を担当',
              },
            },
            {
              img: 'assets/showcase/logos/sm/firstpagepro.webp',
              name: 'First Page Pro',
              light: true,
              d: {
                th: 'เอเจนซีแปล/จัดทำหนังสือ ผู้ประสานงานแปลมังงะให้ Kadokawa',
                en: 'Translation & publishing agency, coordinator for Kadokawa manga translation work',
                ja: '翻訳・出版エージェンシー。KADOKAWAのマンガ翻訳案件の窓口',
              },
            },
          ],
        },
      ],
    },
  },
  // ★ โซนใหม่ 2026-07-20: งานอื่นๆ (Accenture / Pasona) — ย้ายออกจากโซนประวัติ
  other: {
    slides: [
      {
        // ★ 2026-07-20: เจ้าของส่งโลโก้จริงมาแล้ว (เดิมเป็นการ์ดตัวหนังสือ)
        img: 'assets/showcase/slides/accenture.webp',
        cap: {
          th: '💼 Accenture — Data Analyst (Japanese), Trust & Safety (2022–2023)',
          en: '💼 Accenture — Data Analyst (Japanese), Trust & Safety (2022–2023)',
          ja: '💼 アクセンチュア — データアナリスト（日本語）Trust & Safety（2022–2023）',
        },
      },
      {
        img: 'assets/showcase/slides/pasona.webp',
        cap: {
          th: '🧑‍💼 Pasona Thailand — HR Consultant (3 เดือน)',
          en: '🧑‍💼 Pasona Thailand — HR Consultant (3 months)',
          ja: '🧑‍💼 パソナタイランド — HRコンサルタント（3か月）',
        },
      },
    ],
  },
  youtube: {
    avatar: 'assets/showcase/npcgatip-avatar.jpg',
    channelName: 'NPC Gatip',
    // ★ v4 (เจ้าของสั่ง 2026-07-18 รอบสอง): หัวข้อ "เคยร่วมงานกับแบรนด์เหล่านี้"
    // อยู่บนสุด + โลโก้ 5 อัน **กดแล้วกางรายละเอียด** (d = คำอธิบาย 3 ภาษา)
    // — Shopee ถูกรวมกับ YouTube×Shopee (อันเดียวกัน ชื่อจริง:
    //   YouTube Shopping Creator Accelerator 2025) / เพิ่ม MagicMic
    brandsTop: true,
    brands: [
      {
        img: 'assets/showcase/logos/sm/kai.webp',
        alt: 'KAÏ Grooming',
        name: 'KAÏ Grooming',
        d: {
          th: 'แบรนด์กรูมมิ่งผู้ชายชื่อดังที่ร่วมงานกับอินฟลูเอนเซอร์ระดับประเทศมากมาย — จ้างโปรโมทสินค้าผ่านคลิปรีวิวบนช่อง NPC Gatip',
          en: 'A leading men\'s grooming brand that collabs with Thailand\'s top influencers — hired me for a sponsored product review on the channel',
          ja: 'タイのトップインフルエンサーと多数コラボする男性向けグルーミングブランド — チャンネルでのPRレビュー動画を依頼される',
        },
      },
      {
        img: 'assets/showcase/logos/sm/pokemon-unite.webp',
        alt: 'Pokémon UNITE Championship Series',
        name: 'Pokémon UNITE Championship Series 2026',
        d: {
          th: 'ร่วมโปรโมตรายการแข่ง Pokémon UNITE Championship Series 2026 ในไทย ร่วมกับ Invate Agency',
          en: 'Promoted the Pokémon UNITE Championship Series 2026 in Thailand together with Invate Agency',
          ja: 'Invate Agencyと共にポケモンユナイト Championship Series 2026のタイでのプロモーションに協力',
        },
      },
      {
        img: 'assets/showcase/logos/sm/fifine.webp',
        alt: 'FIFINE',
        name: 'FIFINE',
        light: true,
        d: {
          th: 'แบรนด์ไมโครโฟนระดับโลก — ได้รับไมค์สเปกสูงเป็นค่าตอบแทนจากการรีวิวสินค้า',
          en: 'Global microphone brand — received a high-spec mic in return for a product review',
          ja: '世界的マイクブランド — 製品レビューの報酬としてハイスペックマイクを提供される',
        },
      },
      {
        text: 'YouTube × Shopee',
        name: 'YouTube Shopping Creator Accelerator 2025',
        d: {
          th: 'ได้รับเชิญเข้าโครงการ YouTube Shopping Creator Accelerator 2025 (YouTube × Shopee) ในฐานะครีเอเตอร์หน้าใหม่ศักยภาพสูง',
          en: 'Invited to the YouTube Shopping Creator Accelerator 2025 (YouTube × Shopee) as a high-potential new creator',
          ja: 'YouTube Shopping Creator Accelerator 2025（YouTube × Shopee）に新鋭クリエイターとして招待される',
        },
      },
      {
        img: 'assets/showcase/logos/sm/magicmic.webp',
        alt: 'iMyFone MagicMic',
        name: 'iMyFone MagicMic',
        d: {
          th: 'แอปเปลี่ยนเสียง AI จาก iMyFone — ได้รับจ้างทำคลิปรีวิวการใช้งานแอป',
          en: 'AI voice-changer app by iMyFone — commissioned to create an app review video',
          ja: 'iMyFoneのAIボイスチェンジャーアプリ — レビュー動画の制作を依頼される',
        },
      },
    ],
    slides: [
      {
        video: { id: '8vhh2Yo2yBQ' },
        cap: {
          th: 'ประเด็นน่าสนใจกับ Vtuber 9 ขวบ · 45K views',
          en: 'The 9-year-old VTuber controversy · 45K views',
          ja: '9歳VTuberの騒動を解説 · 4.5万回再生',
        },
      },
      {
        video: { id: '8VmGQ52IpFo', vertical: true },
        cap: {
          th: 'Shorts: ไม่ได้เข้าเกมนาน = อ้วนขึ้น?',
          en: 'Short: log in after a break… why am I fatter?!',
          ja: 'ショート: 久々にログインしたら太ってた!?',
        },
      },
      {
        video: { id: 'tiOiohuE8Os', vertical: true },
        cap: {
          th: 'Shorts: เพลงที่คุณเสิร์ชหายังไงก็ไม่เจอ!?',
          en: 'Short: the song you can never find by searching!?',
          ja: 'ショート: 検索しても絶対出てこない曲!?',
        },
      },
    ],
  },
};

// หมายเหตุ: คำถาม "อยากดูอะไรก่อน" (ช้อย) ถูกตัดออกแล้ว
// แต่บทแนะนำตัวกระติ๊บยังอยู่ — พูดจบ 3 บรรทัดแล้วเข้าห้องสตูดิโอทันที
//
// โครงสร้าง panel:
//   title — หัวข้อ (ใช้เป็นป้ายลอยเหนือวัตถุด้วย) / brief — ไฮไลต์สั้นใน panel เกม
//   lines — ฉบับเต็มใน Resume Mode / stats — chip ตัวเลขใหญ่ [{v,l}]
//   tags — ชิปรายชื่อ (เครือข่าย/พันธมิตร) / links — ปุ่มลิงก์
// ★ เบอร์โทรไม่ใส่บนเว็บ (เจ้าของยืนยัน — เว็บ public, เบอร์อยู่ใน PDF อยู่แล้ว)
// ★ โปรเจ็คลับ (arcade-4): ห้ามเผยชื่อคนดัง/ชื่อเกม — เจ้าของสั่งอุบไว้ (NDA)
export const STRINGS = {
  th: {
    intro: {
      role: 'Game Localization · LQA · การตลาดตลาดไทย',
      pair: 'JA / EN → TH',
      explore: '🎮 สำรวจพอร์ตแบบเกม',
      exploreSub: 'ห้องสมุดเล็กๆ บนดวงจันทร์ เดินดูได้ทั้งห้อง',
      resume: '📄 อ่าน Resume',
      resumeSub: 'หน้าอ่านปกติ · เอกสาร · ช่องทางติดต่อ',
      langHead: 'ภาษา',
      skip: 'ข้าม ▸▸',
    },
    ui: {
      interact: 'กด E เพื่อเปิด',
      interactTouch: 'แตะ ✦ เพื่อเปิด',
      close: 'ปิด',
      back: 'ย้อนกลับ',
      langBtn: 'เปลี่ยนภาษา',
      hintKeys: '🖱️ คลิกที่พื้นเพื่อเดิน · หรือ WASD / ลูกศร — ใกล้ตู้เกมหรือหนังสือแล้วกด E · ☰ ข้ามไปหมวดไหนก็ได้',
      hintTouch: '👆 แตะค้างครึ่งซ้ายของจอเพื่อเดิน — ใกล้วัตถุแล้วแตะ ✦ · ☰ ข้ามไปหมวดไหนก็ได้',
      progress: 'สำรวจแล้ว',
      progressDone: '🎉 ดูครบทุกชั้นแล้ว!',
      openLink: '↗ เปิดหน้าเพจ',
      menu: 'เมนู',
      menuTitle: 'ข้ามไปหมวดที่ต้องการ',
      menuHint: 'ไม่ต้องเดิน — เปิดเนื้อหาเดียวกันได้ทันที',
      menuGroups: { arcade: '🕹️ Arcade Wing — ผลงานเกม', library: '📚 ห้องสมุด — ประสบการณ์', reception: '🪔 โต๊ะต้อนรับ' },
      chapters: 'บท',
      prev: 'ก่อนหน้า',
      next: 'ถัดไป',
      of: '/',
      details: 'รายละเอียด',
      copy: 'คัดลอก',
      copied: 'คัดลอกแล้ว ✓',
      download: 'ดาวน์โหลด',
      mute: 'เปิด/ปิดเสียง',
      home: 'กลับหน้าแรก',
    },
    zones: {
      'cab-sticky': 'Sticky Rice · Cherry Kiss',
      'cab-dh': 'DIGITAL HEARTS',
      'cab-free': 'งานฟรีแลนซ์',
      'cab-next': 'โปรเจกต์ที่กำลังจะมา',
      'book-events': 'อีเวนต์ & พาร์ตเนอร์ชิป',
      'book-content': 'คอนเทนต์ & คอมมูนิตี้',
      'book-lang': 'ภาษา & ทักษะ',
      'book-journey': 'เส้นทาง & การศึกษา',
      'book-write': 'งานเขียน & อีสปอร์ต',
      'book-other': 'ประสบการณ์อื่น',
      reception: 'โต๊ะต้อนรับ · ติดต่อ & เอกสาร',
    },
    games: {
      roles: { loc: 'แปล', edit: 'ตรวจแก้', naming: 'ตั้งชื่อไทย', store: 'หน้าร้าน Steam', lqa: 'LQA', promo: 'โปรโมต', keyart: 'ภาพปกไทย' },
      status: { th: 'มีภาษาไทยบน Steam แล้ว', pending: 'แปลเสร็จ · รอเผยแพร่', unlisted: 'ส่งงานแล้ว · หน้าร้านยังไม่ระบุภาษาไทย (ก.ย. 2026)' },
      groups: {
        cherrykiss: {
          head: 'Cherry Kiss — Thai Localization & Marketing ครบวงจร',
          desc: 'งาน localization เกม visual novel สำหรับผู้ใหญ่ (18+) — ทุกเกมของ Cherry Kiss ผมทำครบ 6 หน้าที่: แปลบทเกม · ตรวจแก้ · ตั้งชื่อไทย · แปลหน้าร้าน Steam · LQA · โปรโมตผ่านช่องทางไทย — ชื่อเกมด้านล่างเป็นชื่อทางการบน Steam',
        },
        related: { head: 'เกมในเครือ (Cherry Kiss ร่วมพัฒนา)', desc: 'Cherry Kiss Games เป็นผู้พัฒนาร่วม ผู้จัดจำหน่ายคือ Three River Games' },
        pending: { head: 'แปลเสร็จ · รอเผยแพร่', desc: 'แปลไทยผ่าน Sticky Rice Games เรียบร้อยแล้ว ภาษาไทยจะออกกับอัปเดตในภายหลัง' },
        freelance: { head: 'งานเกมฟรีแลนซ์', desc: 'ทั้งงานตรงและผ่านเอเจนซี — บทบาทต่างกันไปตามเกม ดูที่ป้ายกำกับ' },
      },
      mature: 'เกม 18+ — ซ่อนภาพปกไว้',
      showCover: 'แสดงภาพปก (18+)',
      hideCover: 'ซ่อนภาพปก',
      matureLink: 'ลิงก์ไปหน้า Steam ของเกมสำหรับผู้ใหญ่ (18+)',
      steam: 'หน้า Steam ภาษาไทย ↗',
      via: 'ผ่าน',
      pub: 'ผู้จัดจำหน่าย',
      dev: 'ผู้พัฒนา',
      gridHint: 'แตะรูปย่อเพื่อข้ามไปเกมนั้น',
      counts: { shipped: 'เกมที่มีภาษาไทยบน Steam', pending: 'แปลเสร็จ รอเผยแพร่', freelance: 'เกมฟรีแลนซ์' },
    },
    resume: {
      openTitle: '📄 อ่าน Resume',
      open: '📄 Resume',
      groups: [
        { head: '💼 ประสบการณ์ทำงาน', ids: ['arcade-1', 'arcade-3', 'arcade-2', 'arcade-4', 'other'] },
        { head: '📣 อีเวนต์ · สื่อ · คอมมูนิตี้', ids: ['event', 'youtube', 'network'] },
        { head: '🛠️ ทักษะ & ภาษา', ids: ['skills', 'language'] },
        { head: '🎓 การศึกษา & ประสบการณ์อื่น', ids: ['bookshelf', 'writing', 'esport'] },
        { head: '📮 ติดต่อ & เอกสาร', ids: ['desk'] },
      ],
      heading: 'Resume',
      subtitle: 'Game Localization · LQA · การตลาดตลาดไทย — JA / EN → TH',
      docsHead: 'เอกสาร',
      download: '📄 Resume (English)',
      downloadJa: '📄 履歴書（日本語）',
      downloadJaCv: '📄 職務経歴書（日本語）',
      downloadCard: '💳 นามบัตร (PDF)',
      docNote: 'PDF · เปิดในแท็บใหม่ · อัปเดต 13 ก.ย. 2026',
      back: '🎮 กลับเข้าเกม',
      summary: [
        'ทำงาน localization เกม, LQA และการตลาดสำหรับตลาดไทย — ญี่ปุ่น / อังกฤษ → ไทย · ปัจจุบันเป็น Thai Localization & LQA ที่ DIGITAL HEARTS (Thailand) และ Thailand Localization & Marketing Manager ที่ Sticky Rice Games',
        'ส่งเกมที่มีภาษาไทยขึ้น Steam แล้ว 13 เกม แปลและตรวจแก้กว่า 1,000,000 ตัวอักษร พร้อมคลังศัพท์และ style guide ที่ใช้ร่วมกัน · LQA บนเครื่องคอนโซลจริงกับเกม AAA โดยทีมมอบหมายให้เป็นผู้ตัดสินใจข้อความไทยขั้นสุดท้าย',
        'นอกเหนือจากงานแปล: ประสานงานอีเวนต์และเป็นล่ามที่พาวิลเลียน JETRO (Thailand Game Show 2024–2025), ดูแลโซน NicoNico Stage ที่ AFA Bangkok และทำช่อง YouTube เกี่ยวกับเกมและป๊อปคัลเจอร์ญี่ปุ่น',
        'เคยทำงานที่โตเกียว 3 เดือน (โครงการ Tokyo Internship) — มองหางานในอุตสาหกรรมเกม/บันเทิงที่ญี่ปุ่น',
      ],
      factsHead: 'ข้อมูลที่ HR ถามบ่อย',
      facts: [
        { k: 'ตำแหน่งที่มองหา', v: 'Localization · LQA · Publishing · PR & Marketing — บริษัทเกม/บันเทิง โดยเฉพาะในญี่ปุ่น' },
        { k: 'ภาษา', v: 'ไทย (เจ้าของภาษา) · ญี่ปุ่น JLPT N2 · อังกฤษ TOEIC 820' },
        { k: 'ประสบการณ์ในญี่ปุ่น', v: 'ทำงานที่โตเกียว 3 เดือน — Zeal Team (โครงการ Tokyo Internship, 2023)' },
        { k: 'เริ่มงานได้เมื่อไร', v: 'สัญญาปัจจุบันสิ้นสุด พ.ย. 2026 · เริ่มงานได้ตั้งแต่ ธ.ค. 2026 (ปรับวันได้)' },
        { k: 'สถานะการทำงาน', v: 'อยู่ประเทศไทย — การทำงานที่ญี่ปุ่นต้องขอวีซ่าทำงาน · วุฒิ ป.ตรี Business Japanese ตรงกับเงื่อนไขวีซ่า 技術・人文知識・国際業務' },
        { k: 'ที่อยู่', v: 'นนทบุรี ประเทศไทย' },
      ],
      ctaHead: '🎉 ครบทุกชั้นแล้ว — ขอบคุณที่สละเวลาครับ',
      ctaBody: 'ถ้าโปรไฟล์นี้ตรงกับตำแหน่งที่กำลังหาอยู่ ผมยินดีคุยต่อทุกช่องทางเลยครับ',
      updated: 'อัปเดตล่าสุด: กันยายน 2026',
      colophon: 'เว็บนี้ผมออกแบบและคุมทิศทางเอง เขียนโค้ดโดยมี Claude เป็นคู่เขียนหลัก · Vanilla JS + Canvas 2D ไม่ใช้ framework · ฉากและภาพประกอบเจนด้วยสคริปต์ Python · ผมเทสและตัดสินใจทุกอย่างเอง — ตัวเว็บก็นับเป็นผลงานอีกชิ้นหนึ่ง',
      credit: 'เพลงประกอบ: "3:03 PM" — しゃろう (Sharou) · ใช้ภายใต้เงื่อนไขการใช้งานที่ศิลปินกำหนด',
    },
    panels: {
      'arcade-1': {
        title: '🕹️ Sticky Rice · Cherry Kiss',
        sub: 'Thailand Localization & Marketing Manager · ธ.ค. 2024 – ปัจจุบัน · remote',
        brief: [
          'ดูแล localization และการตลาดโซนไทยให้ publisher แคนาดาที่นำเกมญี่ปุ่นขึ้น Steam (Sticky Rice Games และแบรนด์ 18+ ในเครือ Cherry Kiss) รายงานตรงต่อผู้ก่อตั้ง',
          'รับผิดชอบการเลือกเกม ทิศทางชื่อ/โลโก้ไทย แปล ตรวจแก้ หน้าร้าน LQA และโปรโมต — ส่งเกมที่มีภาษาไทยแล้ว 13 เกม แปลและตรวจแก้กว่า 1,000,000 ตัวอักษร',
          'อยากดูงานแปลจริง: เปิดเกมด้านล่างแล้วสลับภาษาหน้าร้าน Steam เป็นไทย — ชื่อเกม คำโปรย และข้อความในเกมเป็นงานของผม',
        ],
        stats: [
          { v: '13', l: 'เกมที่มีภาษาไทยแล้ว' },
          { v: '1M+', l: 'ตัวอักษรที่แปลและตรวจแก้' },
          { v: '+15%', l: 'ยอดขายของเกมที่เพิ่มภาษาไทย' },
          { v: '1.6K+', l: 'followers จาก 0 (FB + X)' },
        ],
        lines: [
          'Thailand Localization & Marketing Manager (ธ.ค. 2024 – ปัจจุบัน, remote) — Sticky Rice Games publisher แคนาดาที่นำเกมญี่ปุ่นขึ้น Steam (แบรนด์ Sticky Rice Games + Cherry Kiss)',
          'ดูแล localization และการตลาดโซนไทย รายงานตรงต่อผู้ก่อตั้ง: เลือกเกม กำหนดทิศทางชื่อ/โลโก้ไทย แปล ตรวจแก้ คำโปรยหน้าร้าน LQA และโปรโมต',
          'ส่งงาน localization ภาษาไทยให้เกมที่วางขายบน Steam แล้ว 13 เกม — แปลและตรวจแก้กว่า 1,000,000 ตัวอักษร (JA→TH) พร้อมคลังศัพท์และ style guide ที่ใช้ร่วมกัน · Hack ’n’ Stack แปลเสร็จแล้ว รอเผยแพร่',
          'ยอดขายของเกมที่เพิ่มภาษาไทยเพิ่มขึ้น 15% หลังอัปเดต localization (ข้อมูลยอดขาย Steam ภายในบริษัท — เฉพาะเกมที่เพิ่มภาษาไทย ไม่ใช่ทั้งแค็ตตาล็อก)',
          'สร้างและดูแลช่องทางภาษาไทยของ publisher (Facebook, X) จาก 0 เป็น 1,600+ followers · ตอบผู้เล่น หาอินฟลูเอนเซอร์ และประสานคอนเทนต์กับสื่อไทย เช่น Kagami Visual Novel',
          'เป็นตัวแทนบริษัทที่ Tokyo Game Show 2025 Business Day พบผู้พัฒนานานาชาติ 15+ ราย',
          'กระบวนการต่อ 1 เกม: ตั้งชื่อไทยให้ขายได้ → เลือกฟอนต์ไทยที่เข้ากับอาร์ตและอ่านออกใน UI → วางมุมการตลาดร่วมกับทีม → แปลและตรวจแก้บนสเปรดชีตพร้อมคุมคลังศัพท์/โทน → ติดต่อเพจและพาร์ตเนอร์สื่อ → ทำการตลาดช่วงวางขาย',
        ],
        links: [
          { label: '🎮 Sticky Rice บน Steam', url: 'https://store.steampowered.com/publisher/stickyricegames' },
          { label: '🍒 Cherry Kiss บน Steam', url: 'https://store.steampowered.com/publisher/cherrykiss', mature: true },
          { label: '📘 Cherry Kiss Thailand (FB)', url: 'https://www.facebook.com/cherrykissthai', mature: true },
          { label: '𝕏 @cherrykissthai', url: 'https://x.com/cherrykissthai', mature: true },
        ],
      },
      'arcade-2': {
        title: '🕹️ งานฟรีแลนซ์',
        sub: 'Freelance Game Localizer & Interpreter · JA / EN → TH · 2024 – ปัจจุบัน',
        stats: [
          { v: '2', l: 'เกม (บทบาทดูที่ป้ายกำกับ)' },
          { v: '1', l: 'มังงะลิขสิทธิ์' },
          { v: 'JA⇄TH', l: 'ล่ามพูดตาม & พูดพร้อม' },
        ],
        brief: [
          'Wuthering Waves — แปลไทย (ผ่าน Marano Business) · Battle Realms: Zen Edition — แปลไทย + LQA',
          'แปลมังงะลิขสิทธิ์ (JA→TH) ให้ Kadokawa Thailand (First Page Pro) · ล่าม JA⇄TH ในการประชุม เจรจาธุรกิจ และงานอีเวนต์',
        ],
        lines: [
          'Freelance Game Localizer & Interpreter — JA / EN → TH (2024 – ปัจจุบัน, รับเป็นโปรเจกต์)',
          'Wuthering Waves — แปลภาษาไทย ผ่าน Marano Business',
          'Battle Realms: Zen Edition — แปลภาษาไทยและ LQA',
          'แปลมังงะลิขสิทธิ์ (JA→TH) ให้ Kadokawa Thailand (First Page Pro)',
          'ล่ามพูดตามและพูดพร้อม JA⇄TH ในการประชุม การเจรจาธุรกิจ และงานอีเวนต์',
        ],
        links: [
          { label: '🌊 Wuthering Waves — หน้า Steam ภาษาไทย', url: 'https://store.steampowered.com/app/3513350/?l=thai' },
          { label: '⚔️ Battle Realms: Zen Edition บน Steam', url: 'https://store.steampowered.com/app/1025600/' },
        ],
      },
      'arcade-3': {
        title: '🕹️ DIGITAL HEARTS',
        sub: 'Thai Game Localization & LQA · มี.ค. 2026 – ปัจจุบัน (สัญญาถึง พ.ย. 2026) · กรุงเทพฯ on-site',
        brief: [
          'แปลข้อความ EN/JA→TH ให้เกมคอนโซล AAA ของ publisher ญี่ปุ่นรายใหญ่ (80,000+ คำ; ชื่อเกมอยู่ภายใต้ NDA) และทำ LQA บนเครื่องคอนโซลกับเกมชุดเดียวกัน',
          'ได้รับความไว้วางใจจาก PM และทีมให้เป็นผู้ตัดสินใจข้อความไทยขั้นสุดท้าย · เป็นล่ามให้ผู้บริหารจากสำนักงานใหญ่',
        ],
        stats: [
          { v: '80K+', l: 'คำที่แปล' },
          { v: 'AAA', l: 'เกมคอนโซล (NDA)' },
          { v: 'JA', l: 'ภาษาที่ใช้รายงาน' },
        ],
        lines: [
          'Thai Game Localization & LQA — DIGITAL HEARTS (Thailand) กรุงเทพฯ (มี.ค. 2026 – ปัจจุบัน สัญญาถึง พ.ย. 2026, on-site)',
          'แปลข้อความ EN/JA→TH ให้เกมคอนโซล AAA ของ publisher ญี่ปุ่นรายใหญ่ (80,000+ คำจนถึงตอนนี้) ชื่อเกมอยู่ภายใต้ NDA',
          'LQA บนเครื่องคอนโซล: ตรวจพบและแก้ข้อความไทยที่ถูกตัด ตัดบรรทัดผิด ศัพท์ไม่ตรงคลัง และแปลผิดบริบท · PM และทีมมอบหมายให้เป็นผู้ตัดสินใจข้อความไทยขั้นสุดท้าย',
          'ช่วยปรับขั้นตอนการรายงานและคัดกรองบั๊กเพื่อลดรายงานซ้ำ · ตรวจซ้ำผลการแก้ผ่าน regression test',
          'รายงานและ escalate ต่อผู้บริหารญี่ปุ่นเป็นภาษาญี่ปุ่นโดยตรง · เป็นล่ามพูดตามและพูดพร้อมให้ผู้บริหารที่มาเยือนจากสำนักงานใหญ่',
          'ลักษณะการทำงาน: ทำงานในสภาพแวดล้อมปิดของลูกค้า ใช้ระบบแปลและระบบรายงานบั๊กเฉพาะของลูกค้า (ระบุชื่อไม่ได้ตาม NDA) — คุ้นกับการปรับตัวเข้ากับ toolchain ของแต่ละลูกค้าและงานที่มีข้อกำหนดความลับสูง',
        ],
        links: [
          { label: '🏢 digitalhearts.com', url: 'https://www.digitalhearts.com/' },
        ],
      },
      'arcade-4': {
        title: '🕹️ โปรเจกต์ที่กำลังจะมา (NDA)',
        sub: 'Game PR & Marketing Lead / Localization (TH→EN/JA) · มิ.ย. 2026 – ปัจจุบัน · part-time',
        brief: [
          'เกมอินดี้ไทยที่ยังไม่เปิดตัว ตั้งเป้าตลาดญี่ปุ่น กำหนดออกปี 2028',
          'ดูแล PR การตลาด และ social media พร้อม localize คอนเทนต์สาธารณะทั้งหมดจากไทยเป็นอังกฤษและญี่ปุ่น',
        ],
        stats: [
          { v: '2028', l: 'กำหนดเปิดตัว' },
          { v: 'TH→EN/JA', l: 'ทิศทางการแปล' },
          { v: 'NDA', l: 'ยังเปิดเผยชื่อไม่ได้' },
        ],
        lines: [
          'Game PR & Marketing Lead / Localization (TH→EN/JA) — เกมอินดี้ไทยยังไม่เปิดตัว (NDA) กำหนดออก 2028 (มิ.ย. 2026 – ปัจจุบัน, part-time)',
          'ดูแล PR การตลาด และ social media ให้เกมไทยที่ตั้งเป้าตลาดญี่ปุ่น',
          'localize คอนเทนต์สาธารณะทั้งหมดจากไทยเป็นอังกฤษและญี่ปุ่น คุมโทนและ brand voice ให้ตรงกันทั้ง 3 ภาษา',
        ],
      },
      youtube: {
        title: '▶️ NPC Gatip',
        sub: 'ช่อง YouTube · เกม อนิเมะ VTuber · ทำคนเดียว',
        brandsHead: 'งานร่วมกับแบรนด์ — แตะโลโก้เพื่อดูรายละเอียด',
        brief: [
          'ช่อง YouTube สายเกม/อนิเมะ/VTuber — subscribers 9,400+ ยอดชมรวม 6,100,000+ (ก.ย. 2026) วางแผนและผลิตคนเดียว · คลิปด้านบนแตะเล่นได้เลย',
        ],
        stats: [
          { v: '9.4K+', l: 'subscribers (ก.ย. 2026)' },
          { v: '6.1M+', l: 'ยอดชมรวม' },
          { v: '370K', l: 'คลิปยอดชมสูงสุด' },
        ],
        tags: ['KAÏ Grooming', 'Pokémon UNITE', 'FIFINE', 'YouTube × Shopee 2025', 'MagicMic'],
        lines: [
          'YouTube "NPC Gatip" (youtube.com/@NPCGatip): ช่องเกม/อนิเมะ/VTuber — subscribers 9,400+ ยอดชมรวม 6,100,000+ (ก.ย. 2026) วางแผนและผลิตคนเดียว',
          'ได้รับเชิญเข้าโครงการ YouTube Shopping Creator Accelerator 2025 (YouTube × Shopee)',
          'งานแบรนด์และแคมเปญ: Pokémon UNITE Championship Series 2026 (โปรโมตในไทยร่วมกับ Invate Agency) · KAÏ Grooming (จ้างโปรโมท) · FIFINE (รีวิวไมโครโฟน) · iMyFone MagicMic (จ้างรีวิวแอป)',
          'คลิปเด่น: ประเด็น VTuber 9 ขวบ (45K) · ลาก่อน Gawr Gura (37K) · ดราม่าวงการ VTuber ไทย (36K) · Shorts ยอดชมสูงสุด 370K',
        ],
        links: [
          { label: '▶️ เข้าชมช่อง NPC Gatip', url: 'https://youtube.com/@NPCGatip' },
        ],
      },
      bookshelf: {
        title: '📚 เส้นทาง & การศึกษา',
        sub: 'สถาบันเทคโนโลยีไทย-ญี่ปุ่น · โครงการของรัฐบาลญี่ปุ่น 3 โครงการ',
        brief: [
          'ป.ตรี Business Japanese — สถาบันเทคโนโลยีไทย-ญี่ปุ่น เกียรตินิยมอันดับ 2 (GPA 3.49) นักเรียนทุนเต็มจำนวน (2016 – 2021)',
          'ได้รับคัดเลือกครบทั้ง 3 โครงการที่ญี่ปุ่นสนับสนุน — รัฐบาลกรุงโตเกียว (ทำงานที่โตเกียว 3 เดือน) · METI · JTECS (สอบคัดเลือกได้ที่ 1)',
        ],
        stats: [
          { v: '3', l: 'โครงการจากญี่ปุ่น' },
          { v: '3.49', l: 'GPA · เกียรตินิยมอันดับ 2' },
          { v: '3 เดือน', l: 'ทำงานที่โตเกียว' },
        ],
        lines: [
          'ป.ตรี Business Japanese — สถาบันเทคโนโลยีไทย-ญี่ปุ่น (TNI) เกียรตินิยมอันดับ 2 (GPA 3.49) นักเรียนทุนเต็มจำนวน (2016 – 2021)',
          'Tokyo Internship — รัฐบาลกรุงโตเกียว (ต.ค. – ธ.ค. 2023): ทำงานที่โตเกียว 3 เดือนที่บริษัท Zeal Team (ฮามามัตสึโจ)',
          'METI Internship — กระทรวงเศรษฐกิจ การค้า และอุตสาหกรรมญี่ปุ่น (ต.ค. – ธ.ค. 2021): แบบ remote บริษัทรับ Touhou Bussan Co., Ltd.',
          'JTECS Internship Program — ผู้รับทุน สอบคัดเลือกได้ที่ 1 (2019 – 2020): บริษัทรับ Haru Urarakana Shobo Co., Ltd. โตเกียว',
          'เข้าร่วมงานชุมนุมลูกเสือโลกครั้งที่ 23 ที่จังหวัดยามากุจิ ประเทศญี่ปุ่น สมัย ม.ปลาย (2015) — จุดเริ่มต้นความผูกพันกับญี่ปุ่น',
        ],
      },
      other: {
        title: '🗂️ ประสบการณ์อื่น',
        sub: 'ก่อนเข้าวงการเกม — ภาษาญี่ปุ่นเชิงธุรกิจในทีมนานาชาติขนาดใหญ่',
        brief: [
          'Data Analyst (Japanese), Trust & Safety ที่ Accenture (Thailand) ให้ลูกค้า social media ระดับโลก · HR Consultant ที่ Pasona Thailand',
        ],
        stats: [
          { v: '17 เดือน', l: 'ไม่มี complaint จากลูกค้า @Accenture' },
          { v: '450', l: 'คนในทีม · 30 สัญชาติ' },
        ],
        lines: [
          'Data Analyst (Japanese), Trust & Safety — Accenture (Thailand) พ.ค. 2022 – ต.ค. 2023: วิเคราะห์ข้อมูลคอนเทนต์ภาษาญี่ปุ่นและอังกฤษให้แพลตฟอร์ม social media ระดับโลก พร้อมรายงานลูกค้ารายสัปดาห์ ในทีม 450 คน 30 สัญชาติ — ไม่มี complaint จากลูกค้าในงานที่รับผิดชอบตลอด 17 เดือน',
          'HR Consultant — Pasona Thailand (3 เดือน): งานที่ปรึกษาด้านทรัพยากรบุคคลให้บริษัทญี่ปุ่นในไทย — ลาออกด้วยเหตุผลส่วนตัว',
        ],
      },
      skills: {
        title: '🛠️ สกิลหลัก',
        lines: [
          'Game localization (JA/EN→TH) · transcreation และ culturalization · จัดการคลังศัพท์และ style guide · ตั้งชื่อเกมไทยและเลือกฟอนต์ไทยให้ปลอดภัยกับ UI',
          'LQA: ทดสอบด้านภาษาและ UI บนเครื่องคอนโซล · รายงานและคัดกรองบั๊ก · regression test · ทำงานในสภาพแวดล้อมปิดและระบบเฉพาะของลูกค้า',
          'การตลาดและ publishing สำหรับตลาดไทย: คำโปรยหน้าร้าน · social media · ติดต่ออินฟลูเอนเซอร์และสื่อ · คอมมูนิตี้ · บูทอีเวนต์และ business matching',
          'ล่าม JA⇄TH (พูดตามและพูดพร้อม) · ผลิตคอนเทนต์ · ใช้ AI tools ในกระบวนการแปลและทำคอนเทนต์',
        ],
      },
      language: {
        title: '🗣️ ภาษา',
        sub: 'ไทยเจ้าของภาษา · ญี่ปุ่น JLPT N2 · อังกฤษ TOEIC 820',
        brief: [
          'ไทย — เจ้าของภาษา · ญี่ปุ่น — JLPT N2 (2023) ใช้ทำงานทุกวัน · อังกฤษ — TOEIC 820 (2023) ภาษาที่ใช้ทำงาน',
        ],
        uses: [
          { l: '🇹🇭 ไทย', lv: 'เจ้าของภาษา', d: 'ภาษาแม่ — ปลายทางของงานแปลเกมทุกชิ้น' },
          { l: '🇬🇧 อังกฤษ', lv: 'TOEIC 820', d: 'ภาษาทำงานกับ Sticky Rice Games (แคนาดา) และในทีมผสม — ใช้ทั้งวัน' },
          { l: '🇯🇵 ญี่ปุ่น', lv: 'JLPT N2', d: 'อ่านต้นฉบับเกม รายงานต่อหัวหน้าชาวญี่ปุ่น และเป็นล่ามพูดตาม/พูดพร้อม' },
        ],
        stats: [
          { v: 'N2', l: 'JLPT ภาษาญี่ปุ่น (2023)' },
          { v: '820', l: 'TOEIC ภาษาอังกฤษ (2023)' },
          { v: '3', l: 'โครงการญี่ปุ่นที่สอบผ่านด้วยภาษาญี่ปุ่น' },
        ],
        lines: [
          'ไทย — เจ้าของภาษา · ญี่ปุ่น — JLPT N2 (2023) ใช้ทุกวันทั้งอ่านต้นฉบับ รายงาน และล่าม · อังกฤษ — TOEIC 820 (2023) ภาษาที่ใช้ทำงาน',
          'ภาษาญี่ปุ่นในสนามจริง: ผ่านการคัดเลือกและสัมภาษณ์ของโครงการที่ญี่ปุ่นสนับสนุนครบทั้ง 3 · ล่ามพูดตามและพูดพร้อมในการประชุม การเจรจา และงานอีเวนต์',
        ],
      },
      event: {
        title: '🎪 อีเวนต์ & พาร์ตเนอร์ชิป',
        sub: 'พาวิลเลียน JETRO · NicoNico Stage · Tokyo Game Show',
        brief: [
          'พาวิลเลียน JETRO ที่ Thailand Game Show 2024 & 2025 — ล่ามและ game presenter ในทีมไทย 2 คนเมื่อปี 2024 · ปี 2025 ขยายเป็นทีม 6 คนและบูทใหญ่ขึ้น 10 เท่า',
          'ดูแลโซน NicoNico Stage ที่ Anime Festival Asia Bangkok 2026 · ร่วม Tokyo Game Show 2025 Business Day ในนาม Sticky Rice Games',
          'นอกจากงานในบูท ช่วยสตูดิโอที่อยากเข้าอีเวนต์เกมไทยได้ — คอนแทคและข้อมูลจากหน้างานอย่าง Thailand Game Show ไปจนถึงอีเวนต์แฟนขนาดเล็ก',
        ],
        stats: [
          { v: '10×', l: 'บูท JETRO โต 2024→2025' },
          { v: '50+', l: 'เกมโชว์เคสที่ดูแล' },
          { v: '100+', l: 'คอสเพลย์เยอร์งานสาวม้า' },
          { v: '10,000+', l: 'ผู้แวะบูทรวมทุกงาน' },
        ],
        lines: [
          'พาวิลเลียน JETRO — ล่าม & Game Presenter, Thailand Game Show 2024 & 2025 (กรุงเทพฯ): ทีมไทย 2 คนของ JETRO ในปี 2024 ประสานผู้พัฒนา สื่อ และผู้เข้าชมด้วยภาษาญี่ปุ่น · ปี 2025 ขยายเป็นทีม 6 คน บูทใหญ่ขึ้น 10 เท่า',
          'สนับสนุน showcase เกม 50+ และ business matching 20+ นัดระหว่างบริษัทญี่ปุ่นกับไทย · ในบูทมีเกมจาก Cygames, KONAMI, holo Indie และอินดี้ญี่ปุ่นอีกมาก',
          'ในฐานะ game presenter: ประจำเครื่องสาธิต แนะนำเกมให้ผู้เล่นไทย สอนวิธีเล่น แปลสดให้ทีมพัฒนาญี่ปุ่น และชวนกด Wishlist บน Steam — เช่น Yohane the Parhelion - NUMAZU in the MIRAGE - (BeXide) · Vivid World (Asobism) · Castlevania Dominus Collection (KONAMI)',
          'จัดอีเวนต์แฟน Uma Musume ที่บูทร่วมกับอินฟลูเอนเซอร์ไทย: คอสเพลย์เยอร์ 100+ คน ผู้เข้าชมหลายพันคนร่วมกิจกรรม',
          'NicoNico Stage — ดูแลโซน & MC, Anime Festival Asia Bangkok 2026: ประสานทีมไฟชาวญี่ปุ่นและทีมผู้จัดด้วยภาษาอังกฤษ/ญี่ปุ่น คุมเอฟเฟกต์ สั่งการทีมงาน และเป็น MC',
          'Tokyo Game Show 2025 Business Day: เป็นตัวแทน Sticky Rice Games 2 วัน พบผู้พัฒนานานาชาติ 15+ ราย',
          'Book Expo Thailand 2017 และ 2019: สตาฟบูท First Page Pro · ปีหลังดูแลทั้งบูท',
          'ประธานชมรมโยซาโค่ย (การเต้นพื้นบ้านญี่ปุ่น) สมัยมหาวิทยาลัย — นำทีมแสดงที่สนามกีฬาแห่งชาติและหมู่บ้านญี่ปุ่น จ.พระนครศรีอยุธยา',
          '━━━ ช่วยเรื่องอีเวนต์เกมในไทยได้อย่างไร ━━━',
          'คอนแทคและข้อมูลจากหน้างานของงานใหญ่อย่าง Thailand Game Show — ค่าเข้าร่วม รูปแบบบูท กลุ่มผู้ชม และช่วงเวลา (โบรชัวร์ทางการ GCA×TGS 2026 อยู่ด้านล่าง)',
          'ให้คำแนะนำว่างานกลาง/เล็กงานไหนในไทยตรงกลุ่มเป้าหมายจริง — งานใหญ่ไม่ได้ตอบโจทย์เสมอไป',
          'วางคอนเซ็ปต์และประสานออร์แกไนเซอร์สำหรับอีเวนต์แฟนขนาดเล็กแต่แฟนแน่น คุมทั้งงบและกลุ่มเป้าหมาย',
        ],
        links: [
          { label: '📋 โบรชัวร์ GCA×TGS 2026', url: TGS_BROCHURE, download: true },
        ],
      },
      esport: {
        title: '🏆 อีสปอร์ต',
        sub: 'อดีตนักแข่ง Dota 2 · Pokémon UNITE',
        brief: [
          'อดีตนักแข่ง Dota 2 — Top 4 ระดับมัธยมปลายทั่วประเทศ (Bodindecha The Battle, 2017) · ในสายเปิดได้เจอทีมโปรอย่าง NeXT Esports by RPG, Team Finite และ Baby Build House ซึ่งแพ้ทุกทีม แต่ได้เห็นช่องว่างกับระดับอาชีพจากในสนามจริง',
          'Top 8 รายการ AIS 5G eSports OPEN Thailand 2022: Pokémon UNITE · คลิปแข่งอยู่ด้านบน',
        ],
        stats: [
          { v: 'TOP 4', l: 'ระดับ ม.ปลายทั่วประเทศ' },
          { v: 'TOP 8', l: 'Pokémon UNITE ไทย 2022' },
          { v: '4', l: 'รายการที่ลงแข่ง' },
        ],
        lines: [
          'อดีตนักแข่ง Dota 2 — ลงแข่งรายการต่างๆ ตั้งแต่มัธยมปลายจนถึงมหาวิทยาลัย',
          'Bodin E-Sport Championship ("Bodindecha The Battle") — Top 4 ระดับมัธยมปลายทั่วประเทศ รอบชิงแบบ LAN ที่โรงเรียนบดินทรเดชา 17 ก.พ. 2017 · สนับสนุนโดย Alienware · Logitech G · GODLIKE · Invate',
          'ROG MASTERS 2017 Open Qualifier Thailand — ได้เจอทีมโปร NeXT Esports by RPG',
          'ได้ลงสนามกับทีมโปรของไทย — NeXT Esports by RPG, Team Finite, Baby Build House — แพ้ทุกทีม แต่ได้เห็นมาตรฐานระดับอาชีพจากอีกฝั่งของสนาม',
          'IT Ladkrabang Open House — DOTA 2 Tournament (มีคลิปถ่ายทอดเต็มแมตช์)',
          'AIS 5G eSports OPEN Thailand 2022: Pokémon UNITE — Top 8 ของรายการ',
          'เคยลงแข่ง CS:GO ด้วย — ไม่ได้ไปรอบลึก แต่ได้สัมผัสวงการ FPS สายแข่งจากในสนาม',
          'เกี่ยวกับงานอย่างไร: เข้าใจศัพท์ในเกม จังหวะเกม และวัฒนธรรมคอมมูนิตี้จากมุมผู้เล่น — ต่อยอดกับงานแปลเกมและการตลาดอีสปอร์ตได้โดยตรง',
        ],
        links: [
          { label: '▶️ DOTA 2 — IT Ladkrabang Open House', url: 'https://www.youtube.com/watch?v=BwjusMBK0ps' },
          { label: '▶️ Pokémon UNITE — AIS 5G eSports OPEN 2022', url: 'https://www.youtube.com/watch?v=_1Nymo9wWY8' },
          { label: '📸 LAN Finals — Bodindecha The Battle', url: 'https://www.facebook.com/photo/?fbid=1754261091556771' },
        ],
      },
      writing: {
        title: '📖 งานเขียน',
        sub: 'นักเขียนนิยายเว็บบน Tunwalai · 139 ตอน',
        brief: [
          'นักเขียนนิยายเว็บบน Tunwalai — นิยายแฟนตาซีเรื่องยาว 139 ตอน ยอดอ่าน 172,000 ครั้ง เคยติดท็อป 30 ของหมวด · ได้รับการยอมรับจากเว็บระดับ "นักเขียนเหรียญทอง"',
          'ทำไมถึงเกี่ยวกับงานแปล: งานแปลคือการเขียนภาษาปลายทาง — นิยายยาวที่เขียนจบเป็นหลักฐานว่าคุมสำนวน โทนตัวละคร และจังหวะภาษาไทยได้',
        ],
        stats: [
          { v: '172K', l: 'ยอดอ่านรวม' },
          { v: 'TOP 30', l: 'หมวดแฟนตาซี' },
          { v: '139', l: 'ตอน' },
          { v: '1,170', l: 'เพิ่มในชั้นหนังสือ' },
        ],
        lines: [
          'นักเขียนนิยายเว็บบน Tunwalai — "นักแปรธาตุติดคำสาปกับสาวๆ หลากหลายพันธุ์" นิยายแฟนตาซี 139 ตอน (เนื้อหา 20+)',
          'ยอดอ่านรวมกว่า 172,000 ครั้ง · ผู้อ่านเพิ่มเข้าชั้นหนังสือ 1,170 คน · เคยติดท็อป 30 หมวดแฟนตาซี · ได้รับการยอมรับระดับ "นักเขียนเหรียญทอง"',
          'ทักษะที่ต่อยอดกับ localization: คุมสำนวนและโทนตัวละครให้คงเส้นคงวาตลอดงานยาว · วางจังหวะการเล่า · เขียนบทสนทนาไทยให้เป็นธรรมชาติ — สิ่งเดียวกับที่ใช้ตอน transcreate บทเกม',
        ],
        links: [
          { label: '📖 อ่านบน Tunwalai (20+)', url: 'https://www.tunwalai.com/story/233324' },
        ],
      },
      network: {
        title: '🤝 เครือข่ายวงการ',
        sub: 'เพจเกม สื่อ และครีเอเตอร์ไทยที่ทำงานด้วย',
        brief: [
          'มีความสัมพันธ์ในการทำงานกับเพจเกม สื่อ และครีเอเตอร์ไทย รวมถึงบริษัทเกมและองค์กรญี่ปุ่นที่รู้จักผ่านพาวิลเลียน JETRO, Tokyo Game Show และลูกค้างานแปล',
          'ยอดผู้ติดตามรวมของเพจที่ประสานงานด้วยราว 1.5M (ก.ค. 2026) — เป็นตัวเลขบอกขนาด ไม่ใช่ยอด reach ที่การันตีได้',
        ],
        stats: [
          { v: '~1.5M', l: 'ผู้ติดตามรวมของเพจที่ทำงานด้วย (ก.ค. 2026)' },
          { v: '9+', l: 'เพจ สื่อ และองค์กร' },
        ],
        lines: [
          'ประสานงานสื่อและแคมเปญกับเพจเกมและยูทูบเบอร์ไทย — โปจิโปจิ (ยูทูบเบอร์ข่าวอนิเมะ/เกม) · เกมถูกบอกด้วย (เพจดีลเกม) · เกมเมอร์อมตีน (เพจมีม/คอมมูนิตี้เกม) · Kagami Visual Novel (เพจ VN) · ConSole Hub (คอมมูนิตี้เกมคอนโซล)',
          'องค์กรที่มีความสัมพันธ์อันดี: JETRO (พาวิลเลียน Thailand Game Show 2024 + 2025) · DIGITAL HEARTS · Kadokawa Thailand · First Page Pro',
          'เป็นสมาชิก Thailand Game Development and Media — คอมมูนิตี้คนทำเกมและสื่อเกมของไทย',
          'ยอดผู้ติดตามรวมของเพจเหล่านี้ (ราว 1.5M ณ ก.ค. 2026) บอกขนาดของช่องทาง — reach จริงขึ้นกับแต่ละแคมเปญและแต่ละเพจ',
        ],
      },
      desk: {
        title: '📮 ติดต่อ & เอกสาร',
        sub: 'โต๊ะต้อนรับ — ทักทาย หยิบเอกสาร รับนามบัตร',
        lines: [
          'มองหาตำแหน่ง Localization / LQA / Publishing / PR & Marketing ในอุตสาหกรรมเกมหรือบันเทิง — โดยเฉพาะที่ญี่ปุ่น พร้อมย้ายไปประจำ',
          'อยู่ที่นนทบุรี ประเทศไทย · สัญญาปัจจุบันสิ้นสุด พ.ย. 2026 · เริ่มงานได้ตั้งแต่ ธ.ค. 2026 (ปรับวันได้) · การทำงานที่ญี่ปุ่นต้องขอวีซ่าทำงาน',
          'สัมภาษณ์ออนไลน์ได้ตลอด · นัดเจอตัวที่ญี่ปุ่นก็จัดได้',
        ],
        contactHead: 'ช่องทางติดต่อ',
        links: [
          { label: '✉️ nipith.w@gmail.com', url: 'mailto:nipith.w@gmail.com', copy: 'nipith.w@gmail.com' },
          { label: '💼 linkedin.com/in/nipithw', url: 'https://linkedin.com/in/nipithw' },
          { label: '▶️ YouTube — NPC Gatip', url: 'https://youtube.com/@NPCGatip' },
        ],
        docsHead: 'เอกสาร (PDF)',
        docs: [
          { label: 'Resume (English)', url: RESUME_PDF },
          { label: '履歴書（日本語）', url: RESUME_PDF_JA },
          { label: '職務経歴書（日本語）', url: RESUME_PDF_JA_CV },
        ],
        cardHead: 'นามบัตร',
        cardNote: 'นามบัตรที่แจกในงาน Thailand Game Show — แตะเพื่อดูใหญ่ · QR บนนามบัตรลิงก์มาที่เว็บนี้',
        cardFront: 'ด้านหน้า',
        cardBack: 'ด้านหลัง',
        cardDownload: '💳 ดาวน์โหลดนามบัตร (PDF)',
      },
    },
  },
  en: {
    intro: {
      role: 'Game Localization · LQA · Thai-market Marketing',
      pair: 'JA / EN → TH',
      explore: '🎮 Explore the portfolio',
      exploreSub: 'a small moon library you can walk around',
      resume: '📄 Read the resume',
      resumeSub: 'plain page · documents · contact',
      langHead: 'Language',
      skip: 'Skip ▸▸',
    },
    ui: {
      interact: 'Press E to open',
      interactTouch: 'Tap ✦ to open',
      close: 'Close',
      back: 'Back',
      langBtn: 'Change language',
      hintKeys: '🖱️ Click the floor to walk · or WASD / arrows — press E near a cabinet or book · ☰ jumps anywhere',
      hintTouch: '👆 Hold the left half of the screen to walk — tap ✦ near an object · ☰ jumps anywhere',
      progress: 'Explored',
      progressDone: '🎉 Every shelf visited!',
      openLink: '↗ Open page',
      menu: 'Menu',
      menuTitle: 'Jump to a section',
      menuHint: 'No walking needed — opens the same content',
      menuGroups: { arcade: '🕹️ Arcade wing — game work', library: '📚 Library — experience', reception: '🪔 Reception' },
      chapters: 'Chapters',
      prev: 'Previous',
      next: 'Next',
      of: 'of',
      details: 'Details',
      copy: 'Copy',
      copied: 'Copied ✓',
      download: 'Download',
      mute: 'Sound on/off',
      home: 'Back to the front page',
    },
    zones: {
      'cab-sticky': 'Sticky Rice · Cherry Kiss',
      'cab-dh': 'DIGITAL HEARTS',
      'cab-free': 'Freelance projects',
      'cab-next': 'Upcoming project',
      'book-events': 'Events & Partnerships',
      'book-content': 'Content & Community',
      'book-lang': 'Languages & Skills',
      'book-journey': 'Journey & Education',
      'book-write': 'Writing & Esports',
      'book-other': 'Other Experience',
      reception: 'Reception · Contact & Documents',
    },
    games: {
      roles: { loc: 'Translation', edit: 'Editing', naming: 'Thai title', store: 'Steam store page', lqa: 'LQA', promo: 'Promotion', keyart: 'Thai key art' },
      status: { th: 'Thai available on Steam', pending: 'Translated · release pending', unlisted: 'Delivered · store page does not list Thai yet (Sep 2026)' },
      groups: {
        cherrykiss: {
          head: 'Cherry Kiss — End-to-end Thai Localization & Marketing',
          desc: 'Adult visual novel localization (18+). For every Cherry Kiss title I handled all six steps: script translation, editing, Thai title naming, Steam store page translation, LQA, and promotion on the Thai channels. Titles below are the official Steam names.',
        },
        related: { head: 'Related title (Cherry Kiss co-developed)', desc: 'Co-developed by Cherry Kiss Games; published by Three River Games.' },
        pending: { head: 'Translated · awaiting release', desc: 'Thai translation delivered through Sticky Rice Games; the Thai build ships with a later update.' },
        freelance: { head: 'Freelance game projects', desc: 'Direct and agency work — roles differ per title, see the tags.' },
      },
      mature: '18+ title — cover hidden',
      showCover: 'Show cover (18+)',
      hideCover: 'Hide cover',
      matureLink: 'Opens the Steam page of an adult (18+) game',
      steam: 'Thai Steam page ↗',
      via: 'via',
      pub: 'Publisher',
      dev: 'Developer',
      gridHint: 'Tap a thumbnail to jump to that title',
      counts: { shipped: 'titles with Thai on Steam', pending: 'translated, awaiting release', freelance: 'freelance titles' },
    },
    resume: {
      openTitle: '📄 Read the resume',
      open: '📄 Resume',
      groups: [
        { head: '💼 Work experience', ids: ['arcade-1', 'arcade-3', 'arcade-2', 'arcade-4', 'other'] },
        { head: '📣 Events · media · community', ids: ['event', 'youtube', 'network'] },
        { head: '🛠️ Skills & languages', ids: ['skills', 'language'] },
        { head: '🎓 Education & other experience', ids: ['bookshelf', 'writing', 'esport'] },
        { head: '📮 Contact & documents', ids: ['desk'] },
      ],
      heading: 'Resume',
      subtitle: 'Game Localization · LQA · Thai-market Marketing — JA / EN → TH',
      docsHead: 'Documents',
      download: '📄 Resume (English)',
      downloadJa: '📄 履歴書（日本語）',
      downloadJaCv: '📄 職務経歴書（日本語）',
      downloadCard: '💳 Business card (PDF)',
      docNote: 'PDF · opens in a new tab · updated 13 Sep 2026',
      back: '🎮 Back to the game',
      summary: [
        'Game localization, LQA and marketing for the Thai market — Japanese / English → Thai. Currently Thai Localization & LQA at DIGITAL HEARTS (Thailand) and Thailand Localization & Marketing Manager at Sticky Rice Games',
        '13 titles shipped with Thai on Steam, 1,000,000+ characters translated and edited, with a shared glossary and style guide; console LQA on AAA titles where the team trusts me with the final call on Thai wording',
        'Beyond translation: event coordination and interpreting at the JETRO pavilion (Thailand Game Show 2024–2025), NicoNico Stage at AFA Bangkok, and a YouTube channel about games and Japanese pop culture',
        'Worked in Tokyo for 3 months (Tokyo Internship programme) — seeking a role in the game or entertainment industry in Japan',
      ],
      factsHead: 'Quick facts for recruiters',
      facts: [
        { k: 'Looking for', v: 'Localization · LQA · Publishing · PR & Marketing — game / entertainment companies, Japan preferred' },
        { k: 'Languages', v: 'Thai (native) · Japanese JLPT N2 · English TOEIC 820' },
        { k: 'Experience in Japan', v: '3 months working in Tokyo — Zeal Team (Tokyo Internship programme, 2023)' },
        { k: 'Availability', v: 'Current contract ends Nov 2026 · available from Dec 2026 (dates negotiable)' },
        { k: 'Work status', v: 'Based in Thailand — a Japanese work visa would be required; B.A. in Business Japanese meets the Engineer/Specialist in Humanities/International Services criteria' },
        { k: 'Based in', v: 'Nonthaburi, Thailand' },
      ],
      ctaHead: '🎉 That is every shelf — thank you for your time',
      ctaBody: 'If this looks like a fit for the role you are hiring for, I would love to talk.',
      updated: 'Last updated: September 2026',
      colophon: 'I designed and art-directed this site myself and wrote the code with Claude as my main pair-programmer · vanilla JS + Canvas 2D, no framework · the scenes and illustrations are generated by Python scripts · the testing and every design call were mine — the site itself is part of the portfolio.',
      credit: 'Music: "3:03 PM" by しゃろう (Sharou) · used under the composer\'s terms of use',
    },
    panels: {
      'arcade-1': {
        title: '🕹️ Sticky Rice · Cherry Kiss',
        sub: 'Thailand Localization & Marketing Manager · Dec 2024 – present · remote',
        brief: [
          'Lead Thai-market localization and marketing for a Canadian publisher of Japanese games on Steam (Sticky Rice Games and its 18+ label Cherry Kiss), reporting directly to the founder',
          'Oversee title selection, Thai naming and logo direction, translation, editing, store copy, LQA and promotion — 13 titles shipped with Thai, 1,000,000+ characters translated and edited',
          'Want to see the actual translation? Open any title below and switch the Steam store language to Thai — the title, the store copy and the in-game text are my work',
        ],
        stats: [
          { v: '13', l: 'titles shipped with Thai' },
          { v: '1M+', l: 'characters translated & edited' },
          { v: '+15%', l: 'sales on titles that received Thai' },
          { v: '1.6K+', l: 'followers from 0 (FB + X)' },
        ],
        lines: [
          'Thailand Localization & Marketing Manager (Dec 2024 – present, remote) — Sticky Rice Games, a Canadian publisher of Japanese games on Steam (Sticky Rice Games + Cherry Kiss labels)',
          'Lead Thai-market localization and marketing, reporting directly to the founder: title selection, Thai naming and logo direction, translation, editing, store copy, LQA and promotion',
          'Delivered Thai localization for 13 titles released on Steam — translating and editing 1,000,000+ characters (JA→TH) and maintaining a shared glossary and style guide; Hack ’n’ Stack translated, release pending',
          'Sales of titles that received Thai localization increased by 15% after the localization update (internal Steam sales data — the figure covers those titles, not the whole catalogue)',
          'Built and run the publisher\'s Thai-language channels (Facebook, X) from zero to 1,600+ followers; reply to players, source influencers and coordinate content with Thai media partners such as Kagami Visual Novel',
          'Represented the company at Tokyo Game Show 2025 Business Day, meeting 15+ international developers',
          'Per-title workflow: Thai title that sells → Thai font that fits the art and stays legible in the UI → marketing angle agreed with the team → translation and editing in spreadsheets with glossary and tone control → media pages and partners lined up → launch push',
        ],
        links: [
          { label: '🎮 Sticky Rice on Steam', url: 'https://store.steampowered.com/publisher/stickyricegames' },
          { label: '🍒 Cherry Kiss on Steam', url: 'https://store.steampowered.com/publisher/cherrykiss', mature: true },
          { label: '📘 Cherry Kiss Thailand (FB)', url: 'https://www.facebook.com/cherrykissthai', mature: true },
          { label: '𝕏 @cherrykissthai', url: 'https://x.com/cherrykissthai', mature: true },
        ],
      },
      'arcade-2': {
        title: '🕹️ Freelance projects',
        sub: 'Freelance Game Localizer & Interpreter · JA / EN → TH · 2024 – present',
        stats: [
          { v: '2', l: 'games (see tags for roles)' },
          { v: '1', l: 'licensed manga series' },
          { v: 'JA⇄TH', l: 'consecutive & simultaneous interpreting' },
        ],
        brief: [
          'Wuthering Waves — Thai translation (via Marano Business) · Battle Realms: Zen Edition — Thai translation and LQA',
          'Licensed manga translation (JA→TH) for Kadokawa Thailand (First Page Pro) · JA⇄TH interpreting at business meetings, negotiations and live events',
        ],
        lines: [
          'Freelance Game Localizer & Interpreter — JA / EN → TH (2024 – present, project-based)',
          'Wuthering Waves — Thai translation, via Marano Business',
          'Battle Realms: Zen Edition — Thai translation and LQA',
          'Licensed manga translation (JA→TH) for Kadokawa Thailand (First Page Pro)',
          'Consecutive and simultaneous JA⇄TH interpreting at business meetings, negotiations and live events',
        ],
        links: [
          { label: '🌊 Wuthering Waves — Thai Steam page', url: 'https://store.steampowered.com/app/3513350/?l=thai' },
          { label: '⚔️ Battle Realms: Zen Edition on Steam', url: 'https://store.steampowered.com/app/1025600/' },
        ],
      },
      'arcade-3': {
        title: '🕹️ DIGITAL HEARTS',
        sub: 'Thai Game Localization & LQA · Mar 2026 – present (contract through Nov 2026) · Bangkok, on-site',
        brief: [
          'Translate EN/JA→TH text for AAA console titles from a major Japanese publisher (80,000+ words to date; titles under NDA) and perform console LQA on the same titles',
          'Trusted by the project manager and team to make the final decision on Thai wording · interpret for visiting head-office executives',
        ],
        stats: [
          { v: '80K+', l: 'words translated' },
          { v: 'AAA', l: 'console titles (NDA)' },
          { v: 'JA', l: 'reporting language' },
        ],
        lines: [
          'Thai Game Localization & LQA — DIGITAL HEARTS (Thailand), Bangkok (Mar 2026 – present, contract through Nov 2026, on-site)',
          'Translate EN/JA→TH text for AAA console titles from a major Japanese publisher (80,000+ words to date). Titles under NDA',
          'Perform console LQA: identify and correct Thai truncation, line-break, terminology and contextual issues; trusted by the project manager and team to make the final decision on Thai wording',
          'Helped streamline bug logging and triage to reduce duplicate reports; verify fixes through regression testing',
          'Report and escalate to Japanese management directly in Japanese; interpret (consecutive and simultaneous) for visiting head-office executives',
          'How the work runs: inside the client\'s closed environment, using their own translation and bug-tracking systems (unnamed under NDA) — used to adapting to each client\'s toolchain and to strict confidentiality',
        ],
        links: [
          { label: '🏢 digitalhearts.com', url: 'https://www.digitalhearts.com/' },
        ],
      },
      'arcade-4': {
        title: '🕹️ Upcoming project (NDA)',
        sub: 'Game PR & Marketing Lead / Localization (TH→EN/JA) · Jun 2026 – present · part-time',
        brief: [
          'An unannounced Thai indie title aimed at the Japanese market, planned for 2028',
          'Run PR, marketing and social media, and localize all public-facing assets from Thai into English and Japanese',
        ],
        stats: [
          { v: '2028', l: 'planned release' },
          { v: 'TH→EN/JA', l: 'localization direction' },
          { v: 'NDA', l: 'title not yet public' },
        ],
        lines: [
          'Game PR & Marketing Lead / Localization (TH→EN/JA) — unannounced Thai indie title (NDA), planned 2028 release (Jun 2026 – present, part-time)',
          'Run PR, marketing and social media for a Thai game aimed at the Japanese market',
          'Localize all public-facing assets from Thai into English and Japanese, keeping tone and brand voice consistent across the three languages',
        ],
      },
      youtube: {
        title: '▶️ NPC Gatip',
        sub: 'YouTube channel · games, anime & VTubers · run solo',
        brandsHead: 'Brand work — tap a logo for details',
        brief: [
          'YouTube channel about games, anime and VTubers — 9,400+ subscribers and 6,100,000+ total views (Sep 2026), planned and produced solo. Tap any clip above to play it',
        ],
        stats: [
          { v: '9.4K+', l: 'subscribers (Sep 2026)' },
          { v: '6.1M+', l: 'total views' },
          { v: '370K', l: 'most-viewed clip' },
        ],
        tags: ['KAÏ Grooming', 'Pokémon UNITE', 'FIFINE', 'YouTube × Shopee 2025', 'MagicMic'],
        lines: [
          'YouTube "NPC Gatip" (youtube.com/@NPCGatip): games, anime and VTubers — 9,400+ subscribers and 6,100,000+ total views (Sep 2026), planned and produced solo',
          'Invited to the YouTube Shopping Creator Accelerator 2025 (YouTube × Shopee)',
          'Brand work and campaigns: Pokémon UNITE Championship Series 2026 (promotion in Thailand with Invate Agency) · KAÏ Grooming (sponsored promo) · FIFINE (microphone review) · iMyFone MagicMic (commissioned app review)',
          'Featured clips: the 9-year-old VTuber controversy (45K) · Farewell Gawr Gura (37K) · Thai VTuber drama of the year (36K) · top short at 370K views',
        ],
        links: [
          { label: '▶️ Visit NPC Gatip', url: 'https://youtube.com/@NPCGatip' },
        ],
      },
      bookshelf: {
        title: '📚 Journey & Education',
        sub: 'Thai-Nichi Institute of Technology · three Japanese government programmes',
        brief: [
          'B.A. Business Japanese — Thai-Nichi Institute of Technology, Second-Class Honors (GPA 3.49), full scholarship (2016 – 2021)',
          'Selected for all three Japan-sponsored programmes — Tokyo Metropolitan Government (3 months in Tokyo) · METI · JTECS (ranked 1st in the selection exam)',
        ],
        stats: [
          { v: '3', l: 'Japanese programmes' },
          { v: '3.49', l: 'GPA · Second-Class Honors' },
          { v: '3 mo', l: 'working in Tokyo' },
        ],
        lines: [
          'B.A. Business Japanese — Thai-Nichi Institute of Technology (TNI), Second-Class Honors (GPA 3.49), full scholarship student (2016 – 2021)',
          'Tokyo Internship — Tokyo Metropolitan Government (Oct – Dec 2023): 3 months on-site in Tokyo at Zeal Team (Hamamatsuchō)',
          'METI Internship — Ministry of Economy, Trade and Industry (Oct – Dec 2021): remote, host Touhou Bussan Co., Ltd.',
          'JTECS Internship Program — scholarship recipient, ranked 1st in the selection exam (2019 – 2020): host Haru Urarakana Shobo Co., Ltd., Tokyo',
          'Attended the 23rd World Scout Jamboree in Yamaguchi, Japan, in high school (2015) — where the connection with Japan began',
        ],
      },
      other: {
        title: '🗂️ Other Experience',
        sub: 'Before games — business Japanese in large international teams',
        brief: [
          'Data Analyst (Japanese), Trust & Safety at Accenture (Thailand) for a leading global social-media platform · HR Consultant at Pasona Thailand',
        ],
        stats: [
          { v: '17 mo', l: 'no client complaints @Accenture' },
          { v: '450', l: 'team members · 30 nationalities' },
        ],
        lines: [
          'Data Analyst (Japanese), Trust & Safety — Accenture (Thailand), May 2022 – Oct 2023: analyzed Japanese- and English-language content data for a leading global social-media platform with weekly client reporting, in a 450-person, 30-nationality team; no client complaints on my work in 17 months',
          'HR Consultant — Pasona Thailand (3 months): HR consulting for Japanese companies operating in Thailand — resigned for personal reasons',
        ],
      },
      skills: {
        title: '🛠️ Core Skills',
        lines: [
          'Game localization (JA/EN→TH) · transcreation and culturalization · glossary and style-guide management · Thai title naming and UI-safe font selection',
          'LQA: linguistic and UI testing on console hardware · bug logging and triage · regression testing · working inside clients\' closed environments and proprietary systems',
          'Thai-market marketing and publishing: store copy · social media · influencer and media outreach · community · event booths and business matching',
          'Interpreting JA⇄TH (consecutive and simultaneous) · content creation · AI tools in the translation and content workflow',
        ],
      },
      language: {
        title: '🗣️ Languages',
        sub: 'Thai native · Japanese JLPT N2 · English TOEIC 820',
        brief: [
          'Thai — native · Japanese — JLPT N2 (2023), used daily at work · English — TOEIC 820 (2023), working language',
        ],
        uses: [
          { l: '🇹🇭 Thai', lv: 'Native', d: 'My mother tongue — the target language of every localization job I take' },
          { l: '🇬🇧 English', lv: 'TOEIC 820', d: 'Working language with Sticky Rice Games (Canada) and in mixed teams — used all day' },
          { l: '🇯🇵 Japanese', lv: 'JLPT N2', d: 'Game source text, reporting to Japanese managers, and consecutive / simultaneous interpreting' },
        ],
        stats: [
          { v: 'N2', l: 'JLPT Japanese (2023)' },
          { v: '820', l: 'TOEIC English (2023)' },
          { v: '3', l: 'Japanese programmes passed in Japanese' },
        ],
        lines: [
          'Thai — native · Japanese — JLPT N2 (2023), used daily for source text, reporting and interpreting · English — TOEIC 820 (2023), working language',
          'Japanese in practice: passed the selection and interviews of all three Japan-sponsored programmes · consecutive and simultaneous interpreting at meetings, negotiations and live events',
        ],
      },
      event: {
        title: '🎪 Events & Partnerships',
        sub: 'JETRO Japan Pavilion · NicoNico Stage · Tokyo Game Show',
        brief: [
          'JETRO Japan Pavilion at Thailand Game Show 2024 & 2025 — interpreter and game presenter on the two-person Thai team in 2024; the pavilion grew to six staff and a 10× larger booth in 2025',
          'Managed the NicoNico Stage zone at Anime Festival Asia Bangkok 2026 · joined Tokyo Game Show 2025 Business Day for Sticky Rice Games',
          'Beyond booth work, I can help a studio approach Thai game events — contacts and first-hand intel on shows like Thailand Game Show, and small fan events',
        ],
        stats: [
          { v: '10×', l: 'JETRO booth growth 2024→2025' },
          { v: '50+', l: 'game showcases supported' },
          { v: '100+', l: 'Uma Musume cosplayers' },
          { v: '10,000+', l: 'visitors across booths' },
        ],
        lines: [
          'JETRO Japan Pavilion — Interpreter & Game Presenter, Thailand Game Show 2024 & 2025 (Bangkok): on JETRO\'s two-person Thai team in 2024, liaising with developers, media and visitors in Japanese; the pavilion expanded to six staff and a 10× larger booth in 2025',
          'Supported 50+ game showcases and 20+ business-matching sessions between Japanese and Thai companies; titles on show included games from Cygames, KONAMI and holo Indie among many Japanese indies',
          'As game presenter: manned the demo stations, pitched each title to Thai players, taught the controls, interpreted live for the Japanese developers and drove Steam wishlist adds — e.g. Yohane the Parhelion - NUMAZU in the MIRAGE - (BeXide) · Vivid World (Asobism) · Castlevania Dominus Collection (KONAMI)',
          'Organized an Uma Musume fan event at the booth with Thai influencers: 100+ cosplayers, with thousands of visitors joining the activities',
          'NicoNico Stage — Zone Management & MC, Anime Festival Asia Bangkok 2026: coordinated with the Japanese lighting crew and organizer staff in English and Japanese, ran effects, directed crew and stepped in as MC',
          'Tokyo Game Show 2025 Business Day: represented Sticky Rice Games for two days, meeting 15+ international developers',
          'Book Expo Thailand 2017 and 2019: booth staff for First Page Pro; ran the whole booth in the final year',
          'President of the university Yosakoi club (Japanese folk dance) — led performances at the National Stadium and at the Japanese Village in Ayutthaya',
          '━━━ How I can help with Thai game events ━━━',
          'Contacts and first-hand intel on major shows like Thailand Game Show — entry costs, booth formats, audience make-up and timing (official GCA×TGS 2026 brochure attached below)',
          'Advice on which mid-size or smaller Thai events actually fit your audience — bigger is not always better',
          'Concept and organizer coordination for a small, dedicated fan event, keeping budget and audience on target',
        ],
        links: [
          { label: '📋 GCA×TGS 2026 brochure', url: TGS_BROCHURE, download: true },
        ],
      },
      esport: {
        title: '🏆 Esports',
        sub: 'Former competitive Dota 2 player · Pokémon UNITE',
        brief: [
          'Former competitive Dota 2 player — Top 4 at national high-school level (Bodindecha The Battle, 2017); in open brackets faced pro rosters such as NeXT Esports by RPG, Team Finite and Baby Build House and lost every time — but saw first-hand how wide the gap to professional play is',
          'Top 8 at AIS 5G eSports OPEN Thailand 2022: Pokémon UNITE · match footage above',
        ],
        stats: [
          { v: 'TOP 4', l: 'national high-school level' },
          { v: 'TOP 8', l: 'Pokémon UNITE Thailand 2022' },
          { v: '4', l: 'tournaments played' },
        ],
        lines: [
          'Former competitive Dota 2 player — tournaments from high school through university',
          'Bodin E-Sport Championship ("Bodindecha The Battle") — Top 4 at national high-school level, offline LAN finals at Bodindecha School on 17 Feb 2017 · sponsored by Alienware · Logitech G · GODLIKE · Invate',
          'ROG MASTERS 2017 Open Qualifier Thailand — faced the pro team NeXT Esports by RPG',
          'Played Thai pro rosters — NeXT Esports by RPG, Team Finite and Baby Build House — and lost every time; standing on the other side of the server showed what professional standards look like',
          'IT Ladkrabang Open House — DOTA 2 tournament (full match broadcast available)',
          'AIS 5G eSports OPEN Thailand 2022: Pokémon UNITE — tournament Top 8',
          'Also competed in CS:GO — never deep in the bracket, but inside the competitive FPS scene first-hand',
          'Why it matters: in-game terminology, match pacing and community culture from the player\'s side feed directly into game localization and esports marketing work',
        ],
        links: [
          { label: '▶️ DOTA 2 — IT Ladkrabang Open House', url: 'https://www.youtube.com/watch?v=BwjusMBK0ps' },
          { label: '▶️ Pokémon UNITE — AIS 5G eSports OPEN 2022', url: 'https://www.youtube.com/watch?v=_1Nymo9wWY8' },
          { label: '📸 LAN Finals — Bodindecha The Battle', url: 'https://www.facebook.com/photo/?fbid=1754261091556771' },
        ],
      },
      writing: {
        title: '📖 Fiction Writing',
        sub: 'Web novelist on Tunwalai · 139 chapters',
        brief: [
          'Web novelist on Tunwalai — a 139-chapter original fantasy series with 172,000 reads that reached the Top 30 of its category; recognised by the platform as a "Gold Medal Writer"',
          'Why it matters for localization: translation is writing in the target language — a finished long-form novel shows I can hold voice, character tone and pacing in Thai',
        ],
        stats: [
          { v: '172K', l: 'total reads' },
          { v: 'TOP 30', l: 'fantasy category' },
          { v: '139', l: 'chapters' },
          { v: '1,170', l: 'library adds' },
        ],
        lines: [
          'Web novelist on Tunwalai — a 139-chapter original fantasy series about a cursed alchemist (rated 20+)',
          'Over 172,000 total reads · 1,170 readers added it to their library · reached the Top 30 of the fantasy category · "Gold Medal Writer" recognition from the platform',
          'Skills that carry into localization: consistent voice and character tone across a long work · narrative pacing · natural Thai dialogue — what transcreating game scripts demands',
        ],
        links: [
          { label: '📖 Read on Tunwalai (20+)', url: 'https://www.tunwalai.com/story/233324' },
        ],
      },
      network: {
        title: '🤝 Industry Network',
        sub: 'Thai gaming pages, media and creators I work with',
        brief: [
          'Working relationships with Thai gaming pages, media and creators, and with Japanese game companies and organizations met through the JETRO pavilion, Tokyo Game Show and localization clients',
          'Combined audience of the pages I coordinate with is about 1.5M followers (Jul 2026) — a reference for scale, not a guaranteed campaign reach',
        ],
        stats: [
          { v: '~1.5M', l: 'combined followers of pages I work with (Jul 2026)' },
          { v: '9+', l: 'pages, media and organizations' },
        ],
        lines: [
          'Media outreach and campaign coordination with Thai gaming pages and YouTubers — Pochi Pochi (anime/game news YouTuber) · SheapGamer (game-deals page) · GamerOmTeen (gaming meme/community page) · Kagami Visual Novel (visual-novel page) · ConSole Hub (console gaming community)',
          'Organizations I have good working relationships with: JETRO (Thailand Game Show pavilion 2024 + 2025) · DIGITAL HEARTS · Kadokawa Thailand · First Page Pro',
          'Member of Thailand Game Development and Media — the community of Thai game developers and games media',
          'The combined follower count of these pages (about 1.5M as of Jul 2026) shows the scale of the channels — actual reach depends on each campaign and page',
        ],
      },
      desk: {
        title: '📮 Contact & documents',
        sub: 'Reception desk — say hello, grab the documents, take a card',
        lines: [
          'Seeking a Localization / LQA / Publishing / PR & Marketing role in the game or entertainment industry — Japan preferred, ready to relocate',
          'Based in Nonthaburi, Thailand · current contract ends Nov 2026 · available from Dec 2026 (dates negotiable) · a Japanese work visa would be required',
          'Happy to interview online any time; in-person in Japan can be arranged',
        ],
        contactHead: 'Contact',
        links: [
          { label: '✉️ nipith.w@gmail.com', url: 'mailto:nipith.w@gmail.com', copy: 'nipith.w@gmail.com' },
          { label: '💼 linkedin.com/in/nipithw', url: 'https://linkedin.com/in/nipithw' },
          { label: '▶️ YouTube — NPC Gatip', url: 'https://youtube.com/@NPCGatip' },
        ],
        docsHead: 'Documents (PDF)',
        docs: [
          { label: 'Resume (English)', url: RESUME_PDF },
          { label: '履歴書（日本語）', url: RESUME_PDF_JA },
          { label: '職務経歴書（日本語）', url: RESUME_PDF_JA_CV },
        ],
        cardHead: 'Business card',
        cardNote: 'The card handed out at Thailand Game Show — tap to enlarge · the QR code on it leads to this site',
        cardFront: 'Front',
        cardBack: 'Back',
        cardDownload: '💳 Download card (PDF)',
      },
    },
  },
  ja: {
    intro: {
      role: 'ゲームローカライズ · LQA · タイ市場マーケティング',
      pair: '日本語 / 英語 → タイ語',
      explore: '🎮 ゲーム形式で見る',
      exploreSub: '月の小さな図書館を歩いて回れます',
      resume: '📄 職務経歴を読む',
      resumeSub: '通常ページ · 応募書類 · 連絡先',
      langHead: '言語',
      skip: 'スキップ ▸▸',
    },
    ui: {
      interact: 'Eキーで開く',
      interactTouch: '✦をタップで開く',
      close: '閉じる',
      back: '戻る',
      langBtn: '言語を変更',
      hintKeys: '🖱️ 床をクリックで移動 · WASD／矢印キーでも可 — 筐体や本の近くで E キー · ☰ でどこへでもジャンプ',
      hintTouch: '👆 画面左半分を長押しで移動 — オブジェクトの近くで ✦ をタップ · ☰ でどこへでもジャンプ',
      progress: '探索済み',
      progressDone: '🎉 すべての棚を見ました！',
      openLink: '↗ ページを開く',
      menu: 'メニュー',
      menuTitle: 'セクションへジャンプ',
      menuHint: '歩かなくても同じ内容を開けます',
      menuGroups: { arcade: '🕹️ アーケードウィング — ゲーム実績', library: '📚 ライブラリ — 経験', reception: '🪔 受付' },
      chapters: '章',
      prev: '前へ',
      next: '次へ',
      of: '/',
      details: '詳細',
      copy: 'コピー',
      copied: 'コピーしました ✓',
      download: 'ダウンロード',
      mute: 'サウンド オン/オフ',
      home: 'トップページへ戻る',
    },
    zones: {
      'cab-sticky': 'Sticky Rice · Cherry Kiss',
      'cab-dh': 'DIGITAL HEARTS',
      'cab-free': 'フリーランス案件',
      'cab-next': '進行中の新規案件',
      'book-events': 'イベント＆パートナーシップ',
      'book-content': 'コンテンツ＆コミュニティ',
      'book-lang': '言語＆スキル',
      'book-journey': '経歴＆学歴',
      'book-write': '執筆＆eスポーツ',
      'book-other': 'その他の職務経験',
      reception: '受付 · 連絡先＆応募書類',
    },
    games: {
      roles: { loc: '翻訳', edit: '校正', naming: 'タイ語タイトル命名', store: 'Steamストアページ', lqa: 'LQA', promo: 'プロモーション', keyart: 'タイ語版キービジュアル' },
      status: { th: 'Steamでタイ語版配信中', pending: '翻訳完了 · リリース待ち', unlisted: '納品済み · ストアページにタイ語の記載なし（2026年9月時点）' },
      groups: {
        cherrykiss: {
          head: 'Cherry Kiss — タイ語ローカライズ＆マーケティングを一気通貫で担当',
          desc: 'アダルトビジュアルノベル（18+）のローカライズ。Cherry Kissの全タイトルで、シナリオ翻訳・校正・タイ語タイトル命名・Steamストアページ翻訳・LQA・タイ向けプロモーションの6工程をすべて担当しました。以下はSteam上の正式タイトルです。',
        },
        related: { head: '関連タイトル（Cherry Kiss 共同開発）', desc: 'Cherry Kiss Gamesが共同開発、パブリッシャーは Three River Games。' },
        pending: { head: '翻訳完了 · リリース待ち', desc: 'Sticky Rice Games経由でタイ語翻訳を納品済み。タイ語版は後日のアップデートで配信予定。' },
        freelance: { head: 'フリーランスのゲーム案件', desc: '直接受注および代理店経由 — 担当範囲はタイトルごとに異なります（タグ参照）。' },
      },
      mature: '18+タイトル — カバー画像は非表示',
      showCover: 'カバーを表示（18+）',
      hideCover: 'カバーを隠す',
      matureLink: '成人向け（18+）ゲームのSteamページを開きます',
      steam: 'Steamタイ語ページ ↗',
      via: '経由',
      pub: 'パブリッシャー',
      dev: 'デベロッパー',
      gridHint: 'サムネイルをタップするとそのタイトルへ移動',
      counts: { shipped: 'Steamでタイ語版を配信中のタイトル', pending: '翻訳完了・リリース待ち', freelance: 'フリーランス案件' },
    },
    resume: {
      openTitle: '📄 職務経歴を読む',
      open: '📄 Resume',
      // ★ 日本の職務経歴書の一般的な構成に合わせた並び（th/en とは順番も見出しも異なる）
      groups: [
        { head: '職務経歴', ids: ['arcade-1', 'arcade-3', 'arcade-2', 'arcade-4', 'other'] },
        { head: '実績（イベント・メディア・コミュニティ）', ids: ['event', 'youtube', 'network'] },
        { head: '活かせる経験・知識・技術', ids: ['skills', 'language'] },
        { head: '学歴・その他の経験', ids: ['bookshelf', 'writing', 'esport'] },
        { head: 'コンタクト・応募書類', ids: ['desk'] },
      ],
      heading: '職務経歴',
      subtitle: 'ゲームローカライズ · LQA · タイ市場マーケティング — 日本語 / 英語 → タイ語',
      docsHead: '応募書類',
      download: '📄 Resume（英語）',
      downloadJa: '📄 履歴書（日本語）',
      downloadJaCv: '📄 職務経歴書（日本語）',
      downloadCard: '💳 名刺（PDF）',
      docNote: 'PDF · 新しいタブで開きます · 2026年9月13日更新',
      back: '🎮 ゲームにもどる',
      summary: [
        'ゲームのタイ語ローカライズ・LQA・タイ市場向けマーケティングに従事（日本語 / 英語 → タイ語）。現在は DIGITAL HEARTS（タイランド）でタイ語ローカライズ・LQA、Sticky Rice Games でタイ担当ローカライズ＆マーケティングマネージャーを務めています',
        'Steamで13タイトルのタイ語版をリリース、累計100万文字以上を翻訳・校正（用語集・スタイルガイドを整備）。AAA家庭用タイトルの実機LQAでは、タイ語表現の最終判断を任されています',
        '翻訳にとどまらず、JETROジャパンパビリオン（Thailand Game Show 2024–2025）での通訳・出展者対応、AFA Bangkok ニコニコステージのゾーン運営、ゲーム・日本のポップカルチャーを扱うYouTubeチャンネルの運営経験があります',
        '東京都主催プログラムで東京に3か月勤務した経験があり、日本のゲーム・エンタメ業界での就業を希望しています',
      ],
      factsHead: '採用ご担当者さまへ（要点）',
      facts: [
        { k: '希望職種', v: 'ローカライズ · LQA · パブリッシング · PR＆マーケティング — ゲーム／エンタメ企業（日本を希望）' },
        { k: '言語', v: 'タイ語（母語）· 日本語 JLPT N2 · 英語 TOEIC 820' },
        { k: '日本での経験', v: '東京で3か月の実務経験 — Zeal Team（Tokyo Internship・2023年）' },
        { k: '就業可能時期', v: '現契約は2026年11月に終了予定 · 2026年12月以降の入社を希望（日程は相談可能）' },
        { k: '在留資格', v: '現在タイ在住 — 日本での就業には在留資格の取得が必要。学士号（ビジネス日本語）を有し、「技術・人文知識・国際業務」の要件に該当' },
        { k: '居住地', v: 'タイ・ノンタブリー' },
      ],
      ctaHead: '🎉 すべての棚を見ていただきました — ありがとうございます',
      ctaBody: '募集中のポジションに合いそうでしたら、ぜひお気軽にご連絡ください。',
      updated: '最終更新: 2026年9月',
      colophon: 'このサイトは自ら設計・アートディレクションし、Claudeをペアプログラマーとしてコードを書きました · Vanilla JS + Canvas 2D、フレームワーク不使用 · シーンとイラストはPythonスクリプトで生成 · テストとすべての判断は自分自身で行いました — サイト自体もポートフォリオの一部です。',
      credit: '音楽: 「3:03 PM」しゃろう · 作曲者の利用規約に基づき使用',
    },
    panels: {
      'arcade-1': {
        title: '🕹️ Sticky Rice · Cherry Kiss',
        sub: 'タイ担当ローカライズ＆マーケティングマネージャー · 2024年12月〜現在 · フルリモート',
        brief: [
          '日本のゲームをSteamで展開するカナダのパブリッシャー（Sticky Rice Games と18+レーベル Cherry Kiss）で、タイ市場向けローカライズ・マーケティングの責任者として創業者直属で担当',
          '翻訳タイトルの選定、タイ語タイトル・ロゴの方向性、翻訳・校正、ストア文言、LQA、プロモーションを統括 — 13タイトルのタイ語版をリリース、累計100万文字以上を翻訳・校正',
          '実際の訳文は、下のタイトルをSteamで開き表示言語をタイ語に切り替えるとご覧いただけます — タイトル名・ストア文言・ゲーム内テキストが私の担当分です',
        ],
        stats: [
          { v: '13', l: 'タイ語版リリース済みタイトル' },
          { v: '100万+', l: '翻訳・校正した文字数' },
          { v: '+15%', l: 'タイ語追加タイトルの売上' },
          { v: '1,600+', l: 'フォロワー（0から・FB + X）' },
        ],
        lines: [
          'タイ担当ローカライズ＆マーケティングマネージャー（2024年12月〜現在・フルリモート）— Sticky Rice Games：日本のゲームをSteamで展開するカナダのパブリッシャー（Sticky Rice Games + Cherry Kiss レーベル）',
          'タイ市場向けローカライズ・マーケティングの責任者として創業者直属で業務を統括：翻訳タイトルの選定、タイ語タイトル・ロゴの方向性、翻訳・校正、ストア文言、LQA、プロモーション',
          'Steam配信13タイトルのタイ語版をリリース — 累計100万文字以上（日→タイ語）を翻訳・校正し、用語集・スタイルガイドで全タイトルの用語・文体を統一 ·『Hack ’n’ Stack』はタイ語翻訳完了・リリース待ち',
          'タイ語ローカライズを追加したタイトルでは、更新後の売上が15％増加（Steamの社内販売データに基づく — 対象は当該タイトルであり、カタログ全体ではありません）',
          'タイ向けSNS（Facebook・X）をゼロから立ち上げ、フォロワー1,600人超 · プレイヤー対応、インフルエンサーの選定、Kagami Visual Novel などタイのメディアとのコンテンツ調整を担当',
          '会社代表として東京ゲームショウ2025ビジネスデイに参加し、海外開発会社15社以上と面談',
          '1タイトルあたりの進め方：売れるタイ語タイトルの命名 → アートに合いUI内で可読なタイ語フォントの選定 → チームとマーケ方針をすり合わせ → スプレッドシート上で翻訳・校正しつつ用語集とトーンを統一 → メディア・パートナーとの調整 → 発売時のプロモーション実施',
        ],
        links: [
          { label: '🎮 Sticky Rice on Steam', url: 'https://store.steampowered.com/publisher/stickyricegames' },
          { label: '🍒 Cherry Kiss on Steam', url: 'https://store.steampowered.com/publisher/cherrykiss', mature: true },
          { label: '📘 Cherry Kiss Thailand (FB)', url: 'https://www.facebook.com/cherrykissthai', mature: true },
          { label: '𝕏 @cherrykissthai', url: 'https://x.com/cherrykissthai', mature: true },
        ],
      },
      'arcade-2': {
        title: '🕹️ フリーランス案件',
        sub: 'フリーランス ゲームローカライザー＆通訳 · 日・英 → タイ語 · 2024年〜現在',
        stats: [
          { v: '2', l: 'ゲーム（担当範囲はタグ参照）' },
          { v: '1', l: 'ライセンス漫画' },
          { v: '日⇄タイ', l: '逐次・同時通訳' },
        ],
        brief: [
          '『鳴潮（Wuthering Waves）』— タイ語翻訳（Marano Business経由）·『Battle Realms: Zen Edition』— タイ語翻訳およびLQA',
          'KADOKAWAタイランド（First Page Pro）でライセンス漫画の日→タイ語翻訳 · 商談・会議・イベントでの日⇄タイ通訳',
        ],
        lines: [
          'フリーランス ゲームローカライザー＆通訳 — 日・英 → タイ語（2024年〜現在・案件ベース）',
          '『鳴潮（Wuthering Waves）』— タイ語翻訳（Marano Business経由）',
          '『Battle Realms: Zen Edition』— タイ語翻訳およびLQA',
          'KADOKAWAタイランド（First Page Pro）の契約翻訳者として、漫画の日→タイ語翻訳を担当',
          '商談・会議・イベントにおける逐次・同時通訳（日⇄タイ語）',
        ],
        links: [
          { label: '🌊 鳴潮（Wuthering Waves）— Steamタイ語ページ', url: 'https://store.steampowered.com/app/3513350/?l=thai' },
          { label: '⚔️ Battle Realms: Zen Edition on Steam', url: 'https://store.steampowered.com/app/1025600/' },
        ],
      },
      'arcade-3': {
        title: '🕹️ DIGITAL HEARTS',
        sub: 'タイ語ローカライズ・LQA · 2026年3月〜現在（2026年11月契約満了予定）· バンコク常駐',
        brief: [
          '日本の大手パブリッシャーによるAAA家庭用ゲームタイトルの英・日→タイ語翻訳（8万語以上・NDAのためタイトル名は非公開）と、同タイトルの実機LQAを担当',
          'PM・チームからタイ語表現の最終判断を任される · 日本本社役員の来訪時に通訳を担当',
        ],
        stats: [
          { v: '8万+', l: '翻訳ワード数' },
          { v: 'AAA', l: '家庭用タイトル（NDA）' },
          { v: '日本語', l: '報告・エスカレーションの言語' },
        ],
        lines: [
          'タイ語ローカライズ・LQA — DIGITAL HEARTS（タイランド）バンコク（2026年3月〜現在・2026年11月契約満了予定・常駐）',
          '日本の大手パブリッシャーによるAAA家庭用ゲームタイトル等の英・日→タイ語翻訳（8万語以上）を担当。NDAのためタイトル名は非公開',
          '家庭用ゲーム機実機でのLQA：文字切れ・改行崩れ・用語不統一・文脈誤訳を検出してタイ語テキストを修正 · PM・チームからタイ語表現の最終判断を任される',
          'バグ起票・トリアージのフロー改善に協力し、重複起票を削減 · 修正内容を回帰テストで確認',
          '日本人マネージャーへの報告・エスカレーションを日本語で直接行い、日本本社役員の来訪時には逐次・同時通訳を担当',
          '作業形態：クライアントのクローズドな環境内で、クライアント専用の翻訳・バグ管理システムを使用（NDAのため名称非開示）— 各社のツールチェーンへの適応と機密案件の進め方に慣れています',
        ],
        links: [
          { label: '🏢 digitalhearts.com', url: 'https://www.digitalhearts.com/' },
        ],
      },
      'arcade-4': {
        title: '🕹️ 進行中の新規案件（NDA）',
        sub: 'PR・マーケティング責任者 / ローカライズ（タイ語→英・日）· 2026年6月〜現在 · 兼業',
        brief: [
          '2028年発売予定・日本市場向けの未発表タイ産インディーゲーム',
          'PR・マーケティング・SNS運用と、公開コンテンツのタイ語→英語・日本語ローカライズを担当',
        ],
        stats: [
          { v: '2028', l: '発売予定' },
          { v: 'タイ→英・日', l: 'ローカライズ方向' },
          { v: 'NDA', l: 'タイトル未公開' },
        ],
        lines: [
          'PR・マーケティング責任者 / ローカライズ担当（タイ語→英語・日本語）— 未発表のタイ産インディーゲーム（NDA・2028年発売予定・2026年6月〜現在・兼業）',
          '日本市場向けのタイ産ゲームのPR・マーケティング・SNS運用を担当',
          '公開コンテンツをタイ語から英語・日本語へローカライズし、3言語のトーンとブランドボイスを統一',
        ],
      },
      youtube: {
        title: '▶️ NPC Gatip',
        sub: 'YouTubeチャンネル · ゲーム・アニメ・VTuber · 単独運営',
        brandsHead: 'ブランド案件 — ロゴをタップで詳細',
        brief: [
          'ゲーム・アニメ・VTuberを扱うYouTubeチャンネル — 登録者9,400人超・総再生610万回以上（2026年9月時点）、企画から制作まで単独で運営。上のクリップはタップで再生できます',
        ],
        stats: [
          { v: '9,400+', l: '登録者数（2026年9月）' },
          { v: '610万+', l: '総再生回数' },
          { v: '37万', l: '最多再生クリップ' },
        ],
        tags: ['KAÏ Grooming', 'Pokémon UNITE', 'FIFINE', 'YouTube × Shopee 2025', 'MagicMic'],
        lines: [
          'YouTube「NPC Gatip」(youtube.com/@NPCGatip)：ゲーム・アニメ・VTuberチャンネル — 登録者9,400人超・総再生610万回以上（2026年9月時点）、企画から制作まで単独で運営',
          'YouTube Shopping Creator Accelerator 2025（YouTube × Shopee）に招待',
          'ブランド案件・キャンペーン：ポケモンユナイト Championship Series 2026（Invate Agencyとタイでのプロモーション）· KAÏ Grooming（PR案件）· FIFINE（マイクレビュー）· iMyFone MagicMic（アプリレビュー依頼）',
          '人気動画：9歳VTuber騒動（4.5万）· さよならGawr Gura（3.7万）· タイVTuber界の大炎上（3.6万）· 最多再生ショート37万回',
        ],
        links: [
          { label: '▶️ NPC Gatipチャンネルへ', url: 'https://youtube.com/@NPCGatip' },
        ],
      },
      bookshelf: {
        title: '📚 経歴＆学歴',
        sub: '泰日工業大学 · 日本の公的プログラム3件',
        brief: [
          '泰日工業大学 経営学部 ビジネス日本語学科 卒業 — 優等〈Second-Class Honors〉・GPA 3.49・全額奨学生（2016〜2021年）',
          '日本の公的プログラム3件すべてに選出 — 東京都（東京で3か月勤務）· 経済産業省（METI）· JTECS（選抜試験1位）',
        ],
        stats: [
          { v: '3', l: '日本の公的プログラム' },
          { v: '3.49', l: 'GPA · 優等' },
          { v: '3か月', l: '東京での実務' },
        ],
        lines: [
          '泰日工業大学（Thai-Nichi Institute of Technology）経営学部 ビジネス日本語学科 卒業 — 優等〈Second-Class Honors〉・GPA 3.49・全額奨学生（2016〜2021年）',
          '東京都主催「Tokyo Internship」（2023年10月〜12月）：受入企業 Zeal Team（東京・浜松町）にて3か月間の実務',
          '経済産業省（METI）主催インターンシップ（2021年10月〜12月）：リモート・受入企業 東方物産株式会社',
          'JTECS（日タイ経済協力協会）インターンシップ・プログラム（奨学金・選抜試験1位・2019〜2020年）：受入企業 春うららかな書房（東京）',
          '高校時代に第23回世界スカウトジャンボリー（山口県・2015年）へ参加 — 日本との縁の原点',
        ],
      },
      other: {
        title: '🗂️ その他の職務経験',
        sub: 'ゲーム業界以前 — 多国籍チームでのビジネス日本語',
        brief: [
          'アクセンチュア（タイランド）Trust & Safety部門 データアナリスト（日本語）— 大手グローバルSNS企業向け · パソナタイランド HRコンサルタント',
        ],
        stats: [
          { v: '17か月', l: '顧客からの苦情ゼロ @アクセンチュア' },
          { v: '450', l: 'チーム規模 · 30か国籍' },
        ],
        lines: [
          'Trust & Safety部門 データアナリスト（日本語）— アクセンチュア（タイランド）2022年5月〜2023年10月：大手グローバルSNS企業のコンテンツデータを日本語・英語で分析し、クライアントへ週次で報告 · 450名・30か国籍の24時間体制チームで業務調整を担当 · 担当業務に関する顧客からの苦情は17か月間ゼロで、チーム表彰を受ける',
          'HRコンサルタント — パソナタイランド（3か月）：タイ進出日系企業向けの人材コンサルティング業務 · 一身上の都合により退職',
        ],
      },
      skills: {
        title: '🛠️ コアスキル',
        lines: [
          'ゲームローカライズ（日・英→タイ語）· トランスクリエーション／カルチャライズ · 用語集・スタイルガイドの作成と管理 · タイ語タイトル命名・UIで可読なタイ語フォントの選定',
          'LQA：家庭用ゲーム機実機での言語テスト・UIテスト · バグ起票・トリアージ · 回帰テスト · クライアントのクローズド環境・専用システムでの作業',
          'タイ市場向けマーケティング・パブリッシング：ストア文言 · SNS運用 · インフルエンサー・メディア折衝 · コミュニティ運営 · イベント出展・商談マッチング',
          '日⇄タイ通訳（逐次・同時）· コンテンツ制作 · 翻訳・コンテンツ制作フローでのAIツール活用',
        ],
      },
      language: {
        title: '🗣️ 言語',
        sub: 'タイ語ネイティブ · 日本語 JLPT N2 · 英語 TOEIC 820',
        brief: [
          'タイ語 — 母語 · 日本語 — JLPT N2（2023年）業務で日常的に使用 · 英語 — TOEIC 820（2023年）業務使用言語',
        ],
        uses: [
          { l: '🇹🇭 タイ語', lv: '母語', d: '母国語 — すべてのローカライズ業務における訳出先言語' },
          { l: '🇬🇧 英語', lv: 'TOEIC 820', d: 'Sticky Rice Games（カナダ）および多国籍チームでの業務言語 — 終日使用' },
          { l: '🇯🇵 日本語', lv: 'JLPT N2', d: 'ゲームの原文読解、日本人マネージャーへの報告、逐次・同時通訳に使用' },
        ],
        stats: [
          { v: 'N2', l: 'JLPT 日本語（2023年）' },
          { v: '820', l: 'TOEIC 英語（2023年）' },
          { v: '3', l: '日本語で選考を突破した公的プログラム' },
        ],
        lines: [
          'タイ語 — 母語 · 日本語 — JLPT N2（2023年）原文読解・報告・通訳に日常的に使用 · 英語 — TOEIC 820（2023年）業務使用言語',
          '日本語の実務経験：日本の公的プログラム3件の選考・面接をすべて突破 · 会議・商談・イベントでの逐次・同時通訳',
        ],
      },
      event: {
        title: '🎪 イベント＆パートナーシップ',
        sub: 'JETROジャパンパビリオン · ニコニコステージ · 東京ゲームショウ',
        brief: [
          'Thailand Game Show 2024・2025 のJETROジャパンパビリオン — 2024年はタイ人スタッフ2名体制の一員として通訳・ゲームプレゼンターを担当。2025年はパビリオンが6名体制・ブース面積10倍に拡大',
          'Anime Festival Asia Bangkok 2026 ニコニコステージのゾーン運営 · 東京ゲームショウ2025ビジネスデイに Sticky Rice Games として参加',
          'ブース業務にとどまらず、タイのゲームイベント参入をサポートできます — Thailand Game Show などの人脈・一次情報から、小規模なファンイベントまで',
        ],
        stats: [
          { v: '10倍', l: 'JETROブース拡大 2024→2025' },
          { v: '50+', l: '支援したゲーム展示' },
          { v: '100+', l: 'ウマ娘コスプレイヤー' },
          { v: '10,000+', l: 'ブース来場者（全イベント合計）' },
        ],
        lines: [
          'JETROジャパンパビリオン — 通訳・ゲームプレゼンター｜Thailand Game Show 2024・2025（バンコク）：2024年はJETROのタイ人スタッフ2名体制の一員として、開発者・メディア・来場者との間に立ち日本語で対応 · 2025年はパビリオンが6名体制・ブース面積10倍に拡大',
          'ゲーム作品50件以上の展示・紹介と、日タイ企業間の商談マッチング20件以上を支援 · ブースには Cygames、KONAMI、holo Indie をはじめ日本のインディー作品が多数出展',
          'ゲームプレゼンターとして試遊台に常駐 — タイのプレイヤーへ各タイトルを紹介し、操作説明、日本の開発者向けの逐次通訳、Steamウィッシュリスト登録の促進を担当。担当例：『幻日のヨハネ - NUMAZU in the MIRAGE -』（BeXide）·『Vivid World』（Asobism）·『悪魔城ドラキュラ ドミナスコレクション』（KONAMI）',
          'タイのインフルエンサーと共同で『ウマ娘』のファンイベントをブースで企画・運営 — コスプレイヤー100名超・来場者数千人規模が参加',
          'ニコニコステージ — ゾーン運営・MC｜Anime Festival Asia Bangkok 2026：日本の照明クルーおよび主催者スタッフと英語・日本語で調整し、演出オペレーション、クルーへの指示、MCを担当',
          '東京ゲームショウ2025ビジネスデイ：Sticky Rice Games の代表として2日間参加し、海外開発会社15社以上と面談',
          'Book Expo Thailand 2017・2019：First Page Pro ブースの運営スタッフ · 最終年はブース全体の運営を担当',
          '大学ではよさこいサークルの部長を担当 — ナショナルスタジアムおよびアユタヤの日本人村で演舞',
          '━━━ タイのゲームイベントでお手伝いできること ━━━',
          'Thailand Game Show などの大型イベントに関する人脈と一次情報 — 出展費用・ブース形態・来場者層・時期（公式のGCA×TGS 2026ブローシャーを下に添付）',
          'タイの中小規模イベントのうち、ターゲット層に本当に合うものの見極め — 大きければ良いとは限りません',
          '小規模でも熱量の高いファンイベントのコンセプト設計とオーガナイザーとの調整 — 予算とターゲットをコントロール',
        ],
        links: [
          { label: '📋 GCA×TGS 2026 ブローシャー', url: TGS_BROCHURE, download: true },
        ],
      },
      esport: {
        title: '🏆 eスポーツ',
        sub: '元Dota 2競技プレイヤー · ポケモンユナイト',
        brief: [
          '元Dota 2競技プレイヤー — 高校生全国レベルでベスト4（Bodindecha The Battle・2017年）。オープン予選では NeXT Esports by RPG・Team Finite・Baby Build House などのプロチームと対戦し、いずれも敗退したものの、プロとの差を対戦相手として体感',
          'AIS 5G eSports OPEN Thailand 2022：ポケモンユナイトでベスト8 · 試合映像は上のスライドから',
        ],
        stats: [
          { v: 'TOP 4', l: '高校生全国レベル' },
          { v: 'TOP 8', l: 'ポケモンユナイト タイ 2022' },
          { v: '4', l: '出場した大会数' },
        ],
        lines: [
          '元Dota 2競技プレイヤー — 高校時代から大学時代にかけて各種大会に出場',
          'Bodin E-Sport Championship（「Bodindecha The Battle」）— 高校生全国レベルでベスト4。2017年2月17日、ボディンデーチャ校でのオフライン（LAN）決勝 · 協賛：Alienware · Logitech G · GODLIKE · Invate',
          'ROG MASTERS 2017 タイ オープン予選 — プロチーム NeXT Esports by RPG と対戦',
          'NeXT Esports by RPG・Team Finite・Baby Build House などタイのプロチームと対戦し、いずれも敗退 — 対戦相手として立った経験から、プロの基準を肌で理解',
          'IT Ladkrabang Open House — DOTA 2 大会（試合中継の映像あり）',
          'AIS 5G eSports OPEN Thailand 2022：ポケモンユナイト — 大会ベスト8',
          'CS:GOの大会にも出場 — 上位進出はならなかったが、競技FPSシーンを現場から体感',
          '仕事との関係：ゲーム内用語・試合のテンポ・コミュニティ文化をプレイヤー視点で理解 — ゲームローカライズやeスポーツのマーケティング業務に直結',
        ],
        links: [
          { label: '▶️ DOTA 2 — IT Ladkrabang Open House', url: 'https://www.youtube.com/watch?v=BwjusMBK0ps' },
          { label: '▶️ ポケモンユナイト — AIS 5G eSports OPEN 2022', url: 'https://www.youtube.com/watch?v=_1Nymo9wWY8' },
          { label: '📸 LAN決勝 — Bodindecha The Battle', url: 'https://www.facebook.com/photo/?fbid=1754261091556771' },
        ],
      },
      writing: {
        title: '📖 小説執筆',
        sub: 'Web小説サイト Tunwalai · 全139話',
        brief: [
          'タイのWeb小説サイト Tunwalai で執筆 — 全139話のオリジナルファンタジー、累計17.2万閲覧、部門トップ30入り · サイトから「ゴールドメダル作家」として認定',
          'ローカライズとの関係：翻訳とは訳出先の言語で「書く」仕事。長編を完結させた経験は、タイ語で文体・キャラクターの口調・テンポを保てる証明になります',
        ],
        stats: [
          { v: '17.2万', l: '累計閲覧数' },
          { v: 'TOP 30', l: 'ファンタジー部門' },
          { v: '139', l: '話数' },
          { v: '1,170', l: '本棚追加数' },
        ],
        lines: [
          'タイのWeb小説サイト Tunwalai にて、呪われた錬金術師を主人公とする全139話のオリジナルファンタジーを連載（20歳以上向け）',
          '累計閲覧17.2万回 · 1,170人が本棚に追加 · ファンタジー部門でトップ30入り · サイトより「ゴールドメダル作家」として認定',
          'ローカライズに直結するスキル：長い分量を通して文体とキャラクターの口調を一貫させる · 物語のテンポを設計する · 自然なタイ語の台詞を書く — ゲームシナリオのトランスクリエーションに必要な力そのもの',
        ],
        links: [
          { label: '📖 Tunwalaiで読む（20歳以上向け）', url: 'https://www.tunwalai.com/story/233324' },
        ],
      },
      network: {
        title: '🤝 業界ネットワーク',
        sub: '協力関係にあるタイのゲームページ・メディア・クリエイター',
        brief: [
          'タイのゲームページ・メディア・クリエイターとの協力関係に加え、JETROパビリオン・東京ゲームショウ・ローカライズ案件を通じて知り合った日本のゲーム企業・団体との関係があります',
          '連携先ページの合計フォロワーは約150万（2026年7月時点）— 規模の目安であり、キャンペーンのリーチを保証するものではありません',
        ],
        stats: [
          { v: '約150万', l: '連携先ページの合計フォロワー（2026年7月）' },
          { v: '9+', l: 'ページ・メディア・団体' },
        ],
        lines: [
          'タイのゲームページ・YouTuberとのメディア対応・キャンペーン調整 — Pochi Pochi（アニメ・ゲームニュース系YouTuber）· SheapGamer（ゲームセール情報ページ）· GamerOmTeen（ゲームミーム／コミュニティページ）· Kagami Visual Novel（ビジュアルノベル専門ページ）· ConSole Hub（コンシューマーゲームコミュニティ）',
          '良好な関係のある団体・企業：JETRO（Thailand Game Show パビリオン 2024・2025）· DIGITAL HEARTS · KADOKAWAタイランド · First Page Pro',
          'Thailand Game Development and Media のメンバー — タイのゲーム開発者・ゲームメディアのコミュニティ',
          'これらのページの合計フォロワー（2026年7月時点で約150万）はチャネルの規模を示すものです — 実際のリーチはキャンペーンと各ページによって異なります',
        ],
      },
      desk: {
        title: '📮 コンタクト・応募書類',
        sub: '受付 — ご挨拶・書類のダウンロード・名刺',
        lines: [
          'ゲーム・エンタメ業界でのローカライズ / LQA / パブリッシング / PR＆マーケティング職を希望 — 日本を希望、転居可能',
          'タイ・ノンタブリー在住 · 現契約は2026年11月に終了予定 · 2026年12月以降の入社を希望（日程は相談可能）· 日本での就業には在留資格の取得が必要',
          'オンライン面接は随時対応可能 · 日本での対面面接も調整いたします',
        ],
        contactHead: '連絡先',
        links: [
          { label: '✉️ nipith.w@gmail.com', url: 'mailto:nipith.w@gmail.com', copy: 'nipith.w@gmail.com' },
          { label: '💼 linkedin.com/in/nipithw', url: 'https://linkedin.com/in/nipithw' },
          { label: '▶️ YouTube — NPC Gatip', url: 'https://youtube.com/@NPCGatip' },
        ],
        docsHead: '応募書類（PDF）',
        docs: [
          { label: '履歴書（日本語）', url: RESUME_PDF_JA },
          { label: '職務経歴書（日本語）', url: RESUME_PDF_JA_CV },
          { label: 'Resume（英語）', url: RESUME_PDF },
        ],
        cardHead: '名刺',
        cardNote: 'Thailand Game Show でお渡ししている名刺です — タップで拡大 · 名刺のQRコードはこのサイトにつながります',
        cardFront: '表面',
        cardBack: '裏面',
        cardDownload: '💳 名刺をダウンロード（PDF）',
      },
    },
  },
};
