// ============================================
// content.js — ★ ข้อความ/ข้อมูลทั้งหมดอยู่ที่นี่ที่เดียว
// ห้าม hardcode ข้อความในโค้ดไฟล์อื่น
// เนื้อหาจริงจาก Resume.pdf + คำสั่งเจ้าของรอบ showcase v2 (2026-07-17)
// ============================================

// ไฟล์ resume จริง (คัดลอกจาก Resume.pdf + 履歴書.pdf ที่ root มาไว้ใน assets)
const RESUME_PDF = 'assets/resume-nipith-wongsirikul.pdf';
const RESUME_PDF_JA = 'assets/resume-nipith-wongsirikul-ja.pdf';        // 履歴書
const RESUME_PDF_JA_CV = 'assets/resume-nipith-wongsirikul-ja-cv.pdf';  // 職務経歴書

// ข้อความกลางที่ไม่ผูกกับภาษา (โลโก้/ชื่อแบรนด์)
export const BRAND = {
  logo: 'NIPITH WONGSIRIKUL', // ชื่อจริงเจ้าของพอร์ต (ยืนยันแล้ว) — แสดง 2 บรรทัดแบบโลโก้เกม
  tagline: 'PORTFOLIO', // เจ้าของยืนยันคงคำนี้ (2026-07-17)
  pressStart: 'PRESS START',
  resumePdf: RESUME_PDF,
  resumePdfJa: RESUME_PDF_JA,
  resumePdfJaCv: RESUME_PDF_JA_CV,
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
// SHOWCASE — ส่วน "โชว์" ของแต่ละ panel (ภาพ/สไลด์/คลิป — ไม่ผูกกับภาษา
// ยกเว้น cap ที่เป็น {th,en,ja} ได้) — asset จากเว็บสาธารณะ 2026-07-17:
// Steam CDN / stickyricegames.com / digitalhearts.com / YouTube / firstpagepro
// โครงสไลด์: { img | video:{id,vertical} | text | mystery, url?, cap?, tall?, logoCard? }
// ============================================
export const SHOWCASE = {
  'arcade-1': {
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
        img: 'assets/showcase/slides/ck-waifu.webp',
        url: 'https://store.steampowered.com/app/3361340/',
        cap: {
          th: 'Shop Simulator: หมอนไวฟุ — ปก & ซับไทยฝีมือผม (Cherry Kiss)',
          en: 'Shop Simulator: Waifu Pillows — Thai key art & subs by me (Cherry Kiss)',
          ja: 'Shop Simulator: หมอนไวฟุ — タイ語版を担当（Cherry Kiss）',
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
    slides: [
      {
        img: 'assets/showcase/slides/wuwa.webp',
        url: 'https://store.steampowered.com/app/3513350/Wuthering_Waves/',
        cap: {
          th: 'Wuthering Waves — ร่วมทีม localization ไทย',
          en: 'Wuthering Waves — Thai localization team',
          ja: '鳴潮（Wuthering Waves）— タイ語ローカライズ参加',
        },
      },
      {
        img: 'assets/showcase/slides/battlerealms.webp',
        url: 'https://store.steampowered.com/app/1025600/Battle_Realms_Zen_Edition/',
        cap: {
          th: 'Battle Realms: Zen Edition — RTS ระดับตำนาน ซับไทยโดยผม',
          en: 'Battle Realms: Zen Edition — legendary RTS, Thai subs by me',
          ja: 'Battle Realms: Zen Edition — 伝説のRTS、タイ語字幕を担当',
        },
      },
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
  //   แยก 2 กลุ่ม (สื่อ/คอมมูนิตี้ กับ องค์กร/พันธมิตรธุรกิจ) แตะการ์ด = กางรายละเอียด
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
            th: '🤝 องค์กร · พันธมิตรธุรกิจ',
            en: '🤝 Organizations & business partners',
            ja: '🤝 団体・ビジネスパートナー',
          },
          items: [
            {
              img: 'assets/showcase/logos/sm/jtecs.webp',
              name: 'J-Tech (JTECS)',
              light: true,
              d: {
                th: 'สมาคมส่งเสริมเทคโนโลยีไทย-ญี่ปุ่น — เครือข่ายสายธุรกิจ/การศึกษาไทย-ญี่ปุ่น',
                en: 'Thailand-Japan Technology Promotion Association — a Thai-Japan business & education network',
                ja: '泰日経済技術振興協会。タイと日本をつなぐビジネス・教育ネットワーク',
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
      lines: [
        'สวัสดี~ เราชื่อ "กระติ๊บ"!',
        'เป็นชื่อเล่นของเจ้าของพอร์ตนี้เอง — กระติ๊บคือภาชนะสานใส่ข้าวเหนียวของไทยนะ',
        'เดี๋ยวเราพาไปชมสตูดิโอกัน!',
      ],
      role: 'Game Localization  JA / EN → TH   ·   LQA   ·   PR & Marketing',
      skip: 'ข้าม ▸▸',
    },
    ui: {
      interact: 'กด E เพื่อดู',
      interactTouch: 'แตะปุ่ม ✦ เพื่อดู',
      close: 'ปิด',
      langBtn: 'เปลี่ยนภาษา',
      progress: 'สำรวจแล้ว',
      progressDone: '🎉 ดูครบทุกโซนแล้ว!',
      openLink: '↗ เปิดหน้าเพจ',
    },
    resume: {
      openTitle: '📄 ดู Resume เลย · ไม่ต้องเล่นเกม',
      open: '📄 Resume',
      heading: 'Resume Mode',
      subtitle: 'Game Localization · PR & Marketing — JA / EN → TH · โหมดอ่านเร็วสำหรับคนมีเวลาน้อย',
      download: '📄 Resume PDF (EN)',
      downloadJa: '📄 履歴書 (日本語)',
      downloadJaCv: '📄 職務経歴書 (日本語)',
      back: '🎮 กลับเข้าเกม',
      credit: 'เพลงประกอบ: "3:03 PM" — しゃろう (Sharou) · ใช้ภายใต้เงื่อนไขการใช้งานที่ศิลปินกำหนด',
    },
    panels: {
      'arcade-1': {
        title: '🕹️ Sticky Rice · Cherry Kiss',
        brief: [
          'ดูแล localization ญี่ปุ่น→ไทย ครบวงจรคนเดียว ให้ Sticky Rice Games และแบรนด์เกม 18+ ในเครือ Cherry Kiss (ธ.ค. 2024 – ปัจจุบัน)',
          'ดูแลเพจ Cherry Kiss Thailand ทั้ง Facebook และ X เองทั้งหมด — พันธมิตรคอนเทนต์: Kagami Visual Novel',
        ],
        stats: [
          { v: '14', l: 'เกมขึ้น Steam' },
          { v: '1M+', l: 'ตัวอักษรที่แปล' },
          { v: '+15%', l: 'ยอดขายเกมแปลไทย' },
          { v: '1.6K+', l: 'followers จาก 0' },
        ],
        lines: [
          'Thailand Localization & Marketing Manager (ธ.ค. 2024 – ปัจจุบัน) — publisher แคนาดาที่นำเกมญี่ปุ่นขึ้น Steam (แบรนด์ Sticky Rice Games + Cherry Kiss)',
          'ดูแลโปรเจ็ค localization ญี่ปุ่น→ไทย ครบวงจรในฐานะทีมฝั่งไทยคนเดียว (วางแผน · แปล · ตรวจแก้ · ปรับให้เข้ากับวัฒนธรรม) — ส่ง visual novel ญี่ปุ่นขึ้น Steam แล้ว 14 เกม',
          'แปลและตรวจแก้กว่า 1,000,000 ตัวอักษร คุมโทน ศัพท์เฉพาะ และสไตล์ให้สม่ำเสมอทุกเกม',
          'transcreate เนื้อเรื่องและคำโปรยสำหรับตลาดไทย ดันยอดขายเกมเก่าที่แปลไทยเพิ่ม 15%',
          'ดูแล social media ของ Cherry Kiss Thailand (Facebook + X) เองทั้งหมด ปั้นจาก 0 เป็น 1,600+ followers — ช่องทางตรงสู่ผู้เล่นไทยช่องแรกของบริษัท พร้อมพันธมิตรคอนเทนต์อย่าง Kagami Visual Novel',
          'เป็นตัวแทนบริษัทที่ Tokyo Game Show 2025 พบผู้พัฒนานานาชาติ 15+ ราย',
        ],
        links: [
          { label: '🎮 Sticky Rice บน Steam', url: 'https://store.steampowered.com/publisher/stickyricegames' },
          { label: '🍒 Cherry Kiss บน Steam', url: 'https://store.steampowered.com/publisher/cherrykiss' },
          { label: '📘 Cherry Kiss Thailand (FB)', url: 'https://www.facebook.com/cherrykissthai' },
          { label: '𝕏 @cherrykissthai', url: 'https://x.com/cherrykissthai' },
        ],
      },
      'arcade-2': {
        title: '🕹️ Freelance',
        brief: [
          'ร่วม localize เกมดังระดับโลก Wuthering Waves และ Battle Realms: Zen Edition · แปลมังงะลิขสิทธิ์ให้ Kadokawa Thailand',
          'ล่ามธุรกิจ JA⇄TH ทั้งพูดตามและพูดพร้อม — เลื่อนดูผลงานด้านบนได้เลย',
        ],
        lines: [
          'Freelance Localizer & Interpreter — JA / EN → TH (2024 – ปัจจุบัน)',
          'ร่วม localize เกมดังระดับโลก Wuthering Waves (ให้ Marano Business) และ Battle Realms: Zen Edition (RTS ระดับตำนาน — ซับไทย)',
          'แปลมังงะลิขสิทธิ์ (JA→TH) ให้ First Page Pro (Kadokawa Thailand)',
          'ล่ามพูดตามและล่ามพูดพร้อม (JA ⇄ TH) ในการประชุม-เจรจาธุรกิจ รวมถึงงานของครีเอเตอร์ญี่ปุ่นชื่อดัง',
        ],
        links: [
          { label: '🌊 Wuthering Waves บน Steam', url: 'https://store.steampowered.com/app/3513350/Wuthering_Waves/' },
        ],
      },
      'arcade-3': {
        title: '🕹️ DIGITAL HEARTS',
        brief: [
          'แปลเกมคอนโซล AAA ระดับแถวหน้า ควบคู่ LQA เต็มเวลาบนเครื่องคอนโซลจริง (มี.ค. – พ.ย. 2026)',
          'เป็นล่ามให้ผู้บริหารจากญี่ปุ่น · รายงานเป็นภาษาญี่ปุ่นทั้งหมด',
        ],
        stats: [
          { v: '80K+', l: 'คำที่แปล' },
          { v: '100%', l: 'บั๊กแก้ก่อนวางขาย' },
          { v: 'AAA', l: 'เกมคอนโซล' },
        ],
        lines: [
          'Thai Localization & LQA — DIGITAL HEARTS (Thailand), กรุงเทพฯ (มี.ค. – พ.ย. 2026, สัญญาจ้าง)',
          'แปลเกมคอนโซล AAA ระดับแถวหน้ากว่า 80,000 คำ (EN/JA → TH) ควบคู่งาน LQA เต็มเวลา ภายใต้กำหนดวางจำหน่ายพร้อมกันทั่วโลก',
          'ตรวจพบและแก้บั๊กด้านภาษา ข้อความล้นกรอบ และปัญหา format ครบ 100% ก่อนเกมวางขาย ผ่าน LQA บนเครื่องคอนโซลจริง',
          'เป็นล่ามให้ผู้บริหารที่มาเยือนจากสำนักงานใหญ่ญี่ปุ่น และรายงานต่อผู้บริหารญี่ปุ่นเป็นภาษาญี่ปุ่นทั้งหมด',
        ],
        links: [
          { label: '🏢 digitalhearts.com', url: 'https://www.digitalhearts.com/' },
        ],
      },
      'arcade-4': {
        title: '🕹️ โปรเจ็คลับ ???',
        brief: [
          'เกมไทยที่กำลังพัฒนา เปิดตัวปี 2028 เจาะตลาดญี่ปุ่น — ร่วมงานกับคนดังมากมายในวงการ (ยังบอกชื่อไม่ได้ 🤫)',
          'ผมดูแลหมดคนเดียว ทั้งการตลาด การแปล (TH→EN/JA) และ PR ทุกช่องทาง',
        ],
        stats: [
          { v: '?', l: 'NDA — ห้ามบอก' },
          { v: '3', l: 'ภาษาที่ดูแล' },
          { v: '2028', l: 'กำหนดเปิดตัว' },
        ],
        lines: [
          'Lead PR & Marketing / Localization (TH→EN/JA) — เกมอินดี้ไทยยังไม่เปิดตัว (NDA, กำหนดออก 2028, part-time มิ.ย. 2026 – ปัจจุบัน)',
          'ดูแล PR การตลาด และ social media ทั้งหมดในฐานะทีมคนเดียว ให้เกมไทยที่ตั้งเป้าเจาะตลาดญี่ปุ่น — ร่วมงานกับบุคคลมีชื่อเสียงในวงการหลายคน (เปิดเผยไม่ได้ตามสัญญา)',
          'localize คอนเทนต์สาธารณะทั้งหมดจากไทยเป็นอังกฤษและญี่ปุ่น คุมโทนและ brand voice ทั้ง 3 ภาษา',
        ],
      },
      youtube: {
        title: '▶️ NPC Gatip',
        brandsHead: 'เคยร่วมงานกับแบรนด์เหล่านี้ — แตะโลโก้เพื่อดูรายละเอียด',
        brief: [
          'ช่อง YouTube สายเกม/อนิเมะ/VTuber ที่ผมปั้นและดูแลคนเดียวทั้งช่อง — คลิปตัวอย่างด้านบนแตะเล่นได้เลย',
        ],
        stats: [
          { v: '~10K', l: 'subscribers (ใกล้แตะ!)' },
          { v: '6M+', l: 'ยอดชมรวม' },
          { v: '370K', l: 'คลิปดังสุด (views)' },
        ],
        tags: ['KAÏ Grooming', 'Pokémon UNITE', 'FIFINE', 'YouTube × Shopee 2025', 'MagicMic'],
        lines: [
          'YouTube "NPC Gatip" (youtube.com/@NPCGatip): ช่องเกม/อนิเมะ/VTuber — subscribers ใกล้แตะ 10,000 · ยอดชมรวม 6,000,000+ ปั้นและดูแลคนเดียวทั้งช่อง',
          'ได้รับเชิญเข้าโครงการ YouTube Shopping Creator Accelerator 2025 (YouTube × Shopee) ในฐานะครีเอเตอร์หน้าใหม่ศักยภาพสูง',
          'ร่วมงานกับแบรนด์: KAÏ Grooming (จ้างโปรโมท) · Pokémon UNITE Championship Series 2026 (ร่วมโปรโมตกับ Invate Agency) · FIFINE (รีวิวรับไมค์สเปกสูง) · iMyFone MagicMic (จ้างรีวิวแอป)',
          'คลิปเด่น: ประเด็น Vtuber 9 ขวบ (45K) · ลาก่อน Gawr Gura (37K) · ดราม่าวงการวีไทย (36K) · Shorts ยอดวิวสูงสุดถึง 370K',
        ],
        links: [
          { label: '▶️ เข้าชมช่อง NPC Gatip', url: 'https://youtube.com/@NPCGatip' },
        ],
      },
      bookshelf: {
        title: '📚 ประวัติ & การศึกษา',
        brief: [
          'ป.ตรี Business Japanese — สถาบันเทคโนโลยีไทย-ญี่ปุ่น เกียรตินิยมอันดับ 2 (นักเรียนทุนเต็มจำนวน)',
          'คว้าทุนไปญี่ปุ่นครบ 3 ทุน — รัฐบาลกรุงโตเกียว · METI · JTECS (สอบได้ที่ 1) — เลื่อนดูด้านบน',
        ],
        stats: [
          { v: '3', l: 'ทุนญี่ปุ่นที่คว้ามา' },
          { v: '3.49', l: 'GPA เกียรตินิยมอันดับ 2' },
          { v: 'TNI', l: 'สถาบันเทคโนโลยีไทย-ญี่ปุ่น' },
        ],
        lines: [
          'ป.ตรี Business Japanese — สถาบันเทคโนโลยีไทย-ญี่ปุ่น (TNI) เกียรตินิยมอันดับ 2 (GPA 3.49) นักเรียนทุนเต็มจำนวน (2016 – 2021)',
          'ฝึกงานกับบริษัทญี่ปุ่น 3 แห่ง: Zeal Team (โครงการรัฐบาลกรุงโตเกียว — ประจำที่โตเกียว 3 เดือน, 2023) · Touhou Bussan (ทุน METI, 2021) · Haru Urarakana Shobo (ทุน JTECS — สอบคัดเลือกได้ที่ 1, 2019–2020)',
          'เข้าร่วมงานชุมนุมลูกเสือโลกครั้งที่ 23 (23rd World Scout Jamboree) ที่จังหวัดยามากุจิ ประเทศญี่ปุ่น ตั้งแต่สมัย ม.ปลาย (2015) — จุดเริ่มต้นความผูกพันกับญี่ปุ่น',
        ],
      },
      // ★ โซนใหม่ 2026-07-20 — ย้าย Accenture ออกจากโซนประวัติมาไว้ที่นี่ + เพิ่ม Pasona
      other: {
        title: '🗂️ งานอื่นๆ',
        brief: [
          'ประสบการณ์นอกสายเกม ที่หล่อหลอมทักษะภาษาญี่ปุ่นเชิงธุรกิจและการทำงานกับทีมนานาชาติ',
        ],
        stats: [
          { v: '0%', l: 'complaint 17 เดือน @Accenture' },
          { v: '450', l: 'ขนาดทีม 30 สัญชาติ' },
        ],
        lines: [
          'Data Analyst (Japanese), Trust & Safety — Accenture (2022 – 2023): วิเคราะห์ข้อมูลคอนเทนต์ภาษาญี่ปุ่น/อังกฤษให้ลูกค้า social media ระดับโลก ในทีม 450 คน 30 สัญชาติ — ไม่มี complaint จากลูกค้าเลยตลอด 17 เดือน',
          'HR Consultant — Pasona Thailand (3 เดือน): งานที่ปรึกษาด้านทรัพยากรบุคคลให้บริษัทญี่ปุ่นในไทย — ลาออกด้วยเหตุผลส่วนตัว',
        ],
      },
      // skills = section ใน Resume Mode เท่านั้น (ตู้ในห้องถูกถอดแล้ว 2026-07-18)
      skills: {
        title: '🛠️ สกิลหลัก',
        lines: [
          'Game Localization (JA/EN→TH) · LQA บนคอนโซลจริง · CAT tools & terminology · Transcreation/marketing copy · ล่ามธุรกิจ (JA⇄TH) · PR & Marketing · Business development & events · Community/social media · AI tools',
        ],
      },
      language: {
        title: '🗣️ ภาษา',
        brief: [
          'ไทยเจ้าของภาษา · ญี่ปุ่น JLPT N2 · อังกฤษ TOEIC 820',
          'ภาษาญี่ปุ่นผ่านสนามจริงมาหมดแล้ว — ใช้คว้าทุนญี่ปุ่นครบ 3 ทุน ใช้สัมภาษณ์งาน และเป็นล่ามในงานจริงมากมาย',
        ],
        // ★ 2026-07-20: เจ้าของสั่งถอด "หลอดพลัง" ออก — เปลี่ยนเป็น Use Case การใช้งานจริง
        //   (ระดับภาษาเป็นเรื่องอัตวิสัย บอก "ใช้ทำอะไรจริง" มีน้ำหนักกับ HR มากกว่า)
        uses: [
          {
            l: '🇹🇭 ไทย',
            lv: 'เจ้าของภาษา',
            d: 'ภาษาแม่ — ปลายทางของงานแปลเกมทุกชิ้น',
          },
          {
            l: '🇬🇧 อังกฤษ',
            lv: 'TOEIC 820',
            d: 'ใช้ตลอดเวลา ปัจจุบันใช้ทำงานร่วมกับ Sticky Rice และทำงานแบบ Remote work กับประเทศแคนาดา',
          },
          {
            l: '🇯🇵 ญี่ปุ่น',
            lv: 'JLPT N2',
            d: 'ใช้สำหรับงานแปลเกม (Game Localization) และใช้สื่อสารกับหัวหน้า/เพื่อนร่วมงานชาวญี่ปุ่น',
          },
        ],
        stats: [
          { v: '3', l: 'ทุนญี่ปุ่นที่คว้าด้วยภาษา' },
          { v: 'N2', l: 'JLPT ภาษาญี่ปุ่น' },
          { v: '820', l: 'TOEIC ภาษาอังกฤษ' },
        ],
        lines: [
          'ไทย — เจ้าของภาษา · ญี่ปุ่น — JLPT N2 (ภาษาทำงานประจำวัน รวมถึงล่ามระดับผู้บริหาร) · อังกฤษ — TOEIC 820',
          'ภาษาญี่ปุ่นใช้งานจริงมาแล้วทั้ง: สอบชิงและสัมภาษณ์จนคว้าทุนไปญี่ปุ่นครบ 3 ทุน · สัมภาษณ์งานกับบริษัทญี่ปุ่น · เป็นล่ามพูดตาม/พูดพร้อมในการประชุม เจรจาธุรกิจ และงานอีเวนต์ต่างๆ',
        ],
      },
      event: {
        title: '🎪 อีเวนต์ & บูทเกม',
        brief: [
          'ทำงานภายใต้ 2 องค์กรใหญ่: บุกเบิกบูทเกม JETRO ที่ Thailand Game Show ปี 2024 + 2025 (ล่ามประจำบูท + Business Matching จนบูทโต 10 เท่า) และคุมโซน NicoNico Stage ที่ AFA Bangkok',
          'จัดอีเวนต์ Uma Musume สุดยิ่งใหญ่ (คอสเพลย์ 100+ คน ผู้ร่วมหลายพัน) · บุกงาน Tokyo Game Show 2025 Business Day กับ Sticky Rice — เดินดูบูทและหาลูกค้า 2 วันเต็ม',
        ],
        stats: [
          { v: '10×', l: 'บูท JETRO โตใน 1 ปี' },
          { v: '50+', l: 'เกมโชว์เคสที่ประสาน' },
          { v: '100+', l: 'คอสเพลย์งานสาวม้า' },
          { v: '10,000+', l: 'ผู้เข้าร่วม/แวะบูท' },
        ],
        lines: [
          'JETRO × Thailand Game Show ปี 2024 + 2025: บุกเบิกบูทเกมครั้งแรกของ JETRO ด้วยทีม 2 คน — เป็นล่ามประจำบูท ประสาน business matching 20+ นัด (ภาษาญี่ปุ่นล้วน) และดูแล showcase 50+ เกม สำเร็จจนปี 2025 ขยายเป็นทีม 6 คน บูทใหญ่ขึ้น 10 เท่า — ในบูทมีเกมจาก Cygames · KONAMI · hololive Indie และอินดี้ญี่ปุ่นอีกมากมายมาให้ลองเล่น',
          'ในบูท JETRO ทำหน้าที่ Staff / Game Presenter — ยืนประกบเครื่องเล่นสาธิต แนะนำเกมให้ผู้เล่นชาวไทย สอนวิธีเล่นตั้งแต่ศูนย์ แปลสดให้ทีมพัฒนาชาวญี่ปุ่น แจกใบปลิว และชวนผู้เล่นกด Wishlist บน Steam — ตัวอย่างเกมที่ดูแล: Yohane the Parhelion - NUMAZU in the MIRAGE - (BeXide) · Vivid World (Asobism) · Castlevania Dominus Collection (KONAMI)',
          'รวมทุกงาน มีผู้เข้าร่วมกิจกรรมและแวะเวียนมาร่วมสนุกที่บูทมากกว่า 10,000 คน',
          'จัดอีเวนต์แฟน Uma Musume (Cygames) สุดยิ่งใหญ่ — คอสเพลย์เยอร์กว่า 100 คน ผู้ชมและผู้ร่วมกิจกรรมหลายพันคน',
          'AFA Bangkok 2026: ดูแลโซน NicoNico Stage ทั้งหมด — ประสานทีมจัดแสงชาวญี่ปุ่นและเจ้าหน้าที่ SOZO ผู้จัดงานด้วยภาษาอังกฤษ/ญี่ปุ่น คุมเอฟเฟกต์ จัดกำลังทีมงาน และขึ้นเป็น MC ในบางช่วง',
          'Tokyo Game Show 2025 Business Day: ลุย 2 วันเต็มกับ Sticky Rice — เดินดูบูท หาลูกค้า เจรจาธุรกิจ และแลกนามบัตรกับผู้พัฒนานานาชาติ 15+ ราย',
          'ประธานชมรมโยซาโค่ย (การเต้นพื้นบ้านญี่ปุ่น) สมัยมหาวิทยาลัย — นำทีมขึ้นแสดงที่สนามกีฬาแห่งชาติ และที่หมู่บ้านญี่ปุ่น จ.พระนครศรีอยุธยา',
          'Book Expo Thailand 2017 และ 2019: เข้าร่วมในฐานะสตาฟของงานมหกรรมหนังสือระดับประเทศทั้งสองปี',
        ],
      },
      // ★ โซนใหม่ 2026-07-20: ตู้เกม Esport (ตู้ที่ 5 แถวเหนือ)
      esport: {
        title: '🏆 Esports',
        brief: [
          'อดีตนักแข่ง Dota 2 ลงแข่งมาหลายรายการตั้งแต่มัธยมถึงมหาวิทยาลัย — ติด Top 4 ระดับมัธยมปลายทั่วประเทศ และเคยเจอทีมโปร NeXT Esports by RPG ในรอบคัดเลือก ROG MASTERS 2017',
          'สายโปเกมอนก็ลง — Pokémon UNITE รายการ AIS 5G eSports OPEN Thailand 2022 เข้ารอบ Top 8 · เลื่อนดูคลิปแข่งจริงด้านบนได้เลย',
        ],
        stats: [
          { v: 'TOP 4', l: 'ระดับ ม.ปลายทั่วประเทศ' },
          { v: 'TOP 8', l: 'Pokémon UNITE ไทย' },
          { v: '4', l: 'รายการที่ลงแข่ง' },
        ],
        lines: [
          'อดีตนักกีฬาอีสปอร์ตสาย Dota 2 — ลงแข่งรายการต่างๆ ตั้งแต่สมัยมัธยมปลายจนถึงมหาวิทยาลัย',
          'Bodin E-Sport Championship ("Bodindecha The Battle") — เข้ารอบ Top 4 ระดับมัธยมปลายทั่วประเทศ ชิงชนะเลิศแบบออฟไลน์ (LAN) ที่โรงเรียนบดินทรเดชา 17 ก.พ. 2017 · สนับสนุนโดย Alienware · Logitech G · GODLIKE · Invate',
          'ROG MASTERS 2017 Open Qualifier Thailand — ลุยสายคัดเลือกจนได้เจอกับทีมโปร NeXT Esports by RPG',
          'IT Ladkrabang Open House — DOTA 2 Tournament (มีคลิปถ่ายทอดการแข่งเต็มแมตช์)',
          'AIS 5G eSports OPEN Thailand 2022 : Pokémon UNITE — เข้ารอบ Top 8 ของรายการ',
          'เคยลงแข่ง CS:GO ด้วยเช่นกัน — ไม่ได้ไปถึงรอบลึก แต่ได้สัมผัสวงการ FPS competitive จากในสนามจริง',
          'การเป็นผู้เล่นสายแข่งขันจริงทำให้เข้าใจศัพท์ในเกม จังหวะเกม และวัฒนธรรมคอมมูนิตี้จากมุมผู้เล่น — ต่อยอดกับงานแปลเกมและงานอีเวนต์/การตลาดสายอีสปอร์ตได้โดยตรง',
        ],
        links: [
          { label: '▶️ DOTA 2 — IT Ladkrabang Open House', url: 'https://www.youtube.com/watch?v=BwjusMBK0ps' },
          { label: '▶️ Pokémon UNITE — AIS 5G eSports OPEN 2022', url: 'https://www.youtube.com/watch?v=_1Nymo9wWY8' },
          { label: '📸 LAN Finals — Bodindecha The Battle', url: 'https://www.facebook.com/photo/?fbid=1754261091556771' },
        ],
      },
      // ★ โซนใหม่ 2026-07-20 รอบ 7 — งานเขียนนิยายเว็บ
      writing: {
        title: '📖 งานเขียน',
        brief: [
          'นักเขียนนิยายเว็บบน Tunwalai — เรื่องแฟนตาซีที่เขียนเองยาว 139 ตอน มีคนอ่าน 172,000 ครั้ง และเคยติดท็อป 30 หมวดแฟนตาซี',
          'ได้รับการยอมรับจากเว็บในระดับ "นักเขียนเหรียญทอง" — มีฐานแฟนคลับที่ตามอ่านต่อเนื่อง',
          'ทำไมถึงเกี่ยวกับงานแปลเกม: งานแปลคือ "งานเขียนภาษาปลายทาง" — การเขียนนิยายยาวจบเป็นหลักฐานว่าคุมสำนวน โทนตัวละคร และจังหวะการเล่าเรื่องภาษาไทยได้จริง',
        ],
        stats: [
          { v: '172K', l: 'ยอดอ่านรวม' },
          { v: 'TOP 30', l: 'หมวดแฟนตาซี' },
          { v: '139', l: 'ตอนที่เขียนเอง' },
          { v: '1,170', l: 'เพิ่มในชั้นหนังสือ' },
        ],
        lines: [
          'นักเขียนนิยายเว็บบน Tunwalai — "นักแปรธาตุติดคำสาปกับสาวๆ หลากหลายพันธุ์" นิยายแฟนตาซีความยาว 139 ตอน',
          'ยอดอ่านรวมกว่า 172,000 ครั้ง · ผู้อ่านเพิ่มเข้าชั้นหนังสือ 1,170 คน · เคยติดท็อป 30 ของหมวดแฟนตาซี',
          'ได้รับการยอมรับจากเว็บในระดับ "นักเขียนเหรียญทอง" (เนื้อหาสำหรับผู้อ่านอายุ 20 ปีขึ้นไป)',
          'ทักษะที่ต่อยอดกับงาน localization โดยตรง: คุมสำนวนและโทนตัวละครให้คงเส้นคงวาตลอดงานยาว · วางจังหวะการเล่าเรื่อง · เขียนบทสนทนาภาษาไทยให้เป็นธรรมชาติ — ทั้งหมดคือสิ่งเดียวกับที่ใช้ตอน transcreate บทเกม',
        ],
        links: [
          { label: '📖 อ่านบน Tunwalai', url: 'https://www.tunwalai.com/story/233324' },
        ],
      },
      network: {
        title: '🤝 เครือข่ายวงการ',
        brief: [
          'รู้จักและทำงานร่วมกับเพจเกม/สื่อ/อินฟลูชั้นนำของไทยโดยตรง — ช่องทางกระจายข่าวพร้อมใช้สำหรับเปิดตัวเกมในตลาดไทย',
        ],
        stats: [
          { v: '1.5M+', l: 'ผู้ติดตามรวมของเครือข่าย' },
          { v: '9+', l: 'เพจ/สื่อ/องค์กรที่ร่วมงาน' },
        ],
        lines: [
          'เครือข่ายในวงการ: รู้จักและทำงานร่วมกับเพจเกม/สื่อ/อินฟลูชั้นนำของไทยโดยตรง — โปจิโปจิ (ยูทูบเบอร์ข่าวอนิเมะ/เกมชื่อดัง) · เกมถูกบอกด้วย (เพจดีลเกมรายใหญ่ระดับประเทศ) · เกมเมอร์อมตีน (เพจมีม/คอมมูนิตี้เกมยอดฮิต) · Kagami Visual Novel (เพจ VN ตัวหลักของไทย) · ConSole Hub (คอมมูนิตี้เกมคอนโซล)',
          'เครือข่ายฝั่งองค์กร/ธุรกิจ: J-Tech (JTECS) · DIGITAL HEARTS · Kadokawa Thailand · First Page Pro',
          'เป็นสมาชิกกลุ่ม Thailand Game Development and Media — คอมมูนิตี้คนทำเกมและสื่อเกมของไทย',
          'ช่องทางกระจายข่าวพร้อมใช้ทันทีสำหรับการเปิดตัว/โปรโมตเกมในตลาดไทย',
        ],
      },
      desk: {
        title: '📮 ติดต่อ',
        lines: [
          'มองหาตำแหน่ง Localization / LQA / Publishing / PR & Marketing ในบริษัทเกมที่ญี่ปุ่น — พร้อมย้ายไปประจำที่ญี่ปุ่น',
          'ปัจจุบันอยู่ที่นนทบุรี ประเทศไทย',
        ],
        links: [
          { label: '✉️ nipith.w@gmail.com', url: 'mailto:nipith.w@gmail.com' },
          { label: '💼 LinkedIn', url: 'https://linkedin.com/in/nipithw' },
          { label: '▶️ YouTube — NPC Gatip', url: 'https://youtube.com/@NPCGatip' },
        ],
      },
      door: {
        title: '📄 Resume PDF',
        lines: [
          'ดาวน์โหลด resume ฉบับเต็ม — ภาษาอังกฤษ + ชุดเอกสารญี่ปุ่นครบ (履歴書 + 職務経歴書)',
        ],
        links: [
          { label: '📄 Resume PDF (EN)', url: RESUME_PDF, download: true },
          { label: '📄 履歴書 (日本語)', url: RESUME_PDF_JA, download: true },
          { label: '📄 職務経歴書 (日本語)', url: RESUME_PDF_JA_CV, download: true },
        ],
      },
    },
  },

  en: {
    intro: {
      lines: [
        'Hi there~ I\'m "Gatip"!',
        'That\'s the owner\'s nickname — a gatip is a Thai woven basket for sticky rice!',
        'Let me show you around the studio!',
      ],
      role: 'Game Localization  JA / EN → TH   ·   LQA   ·   PR & Marketing',
      skip: 'Skip ▸▸',
    },
    ui: {
      interact: 'Press E to view',
      interactTouch: 'Tap ✦ to view',
      close: 'Close',
      langBtn: 'Change language',
      progress: 'Explored',
      progressDone: '🎉 All zones visited!',
      openLink: '↗ Open page',
    },
    resume: {
      openTitle: '📄 Read the resume · no gameplay needed',
      open: '📄 Resume',
      heading: 'Resume Mode',
      subtitle: 'Game Localization · PR & Marketing — JA / EN → TH · quick-read mode for busy people',
      download: '📄 Resume PDF (EN)',
      downloadJa: '📄 履歴書 (JA)',
      downloadJaCv: '📄 職務経歴書 (JA)',
      back: '🎮 Back to the game',
      credit: 'Music: "3:03 PM" by しゃろう (Sharou) · used under the composer\'s terms of use',
    },
    panels: {
      'arcade-1': {
        title: '🕹️ Sticky Rice · Cherry Kiss',
        brief: [
          'End-to-end JA→TH localization as the sole Thai-side staff member for Sticky Rice Games and its 18+ label Cherry Kiss (Dec 2024 – present)',
          'Single-handedly run the Cherry Kiss Thailand pages on Facebook and X — content partner: Kagami Visual Novel',
        ],
        stats: [
          { v: '14', l: 'games on Steam' },
          { v: '1M+', l: 'characters localized' },
          { v: '+15%', l: 'sales uplift' },
          { v: '1.6K+', l: 'followers from 0' },
        ],
        lines: [
          'Thailand Localization & Marketing Manager (Dec 2024 – Present) — Canadian publisher bringing Japanese games to Steam (Sticky Rice Games + Cherry Kiss labels)',
          'Lead end-to-end JA→TH localization as the sole Thai-side staff member (schedules · translation · editing · cultural adaptation) — 14 Japanese visual novels shipped on Steam',
          'Translated and edited 1,000,000+ characters single-handedly, enforcing consistent tone, terminology, and style across every title',
          'Transcreated storylines and store copy for the Thai market, driving a 15% sales uplift on localized back-catalog titles',
          'Single-handedly run Cherry Kiss Thailand\'s social media (Facebook + X), grown from 0 to 1,600+ followers — the company\'s first direct channel to Thai players, with content partners such as Kagami Visual Novel',
          'Represented the company at Tokyo Game Show 2025, meeting 15+ international developers',
        ],
        links: [
          { label: '🎮 Sticky Rice on Steam', url: 'https://store.steampowered.com/publisher/stickyricegames' },
          { label: '🍒 Cherry Kiss on Steam', url: 'https://store.steampowered.com/publisher/cherrykiss' },
          { label: '📘 Cherry Kiss Thailand (FB)', url: 'https://www.facebook.com/cherrykissthai' },
          { label: '𝕏 @cherrykissthai', url: 'https://x.com/cherrykissthai' },
        ],
      },
      'arcade-2': {
        title: '🕹️ Freelance',
        brief: [
          'Localized major titles: Wuthering Waves and Battle Realms: Zen Edition · licensed manga for Kadokawa Thailand',
          'Business interpretation JA⇄TH, consecutive and simultaneous — swipe through the work above',
        ],
        lines: [
          'Freelance Localizer & Interpreter — JA / EN → TH (2024 – Present)',
          'Localized major titles including Wuthering Waves (for Marano Business) and Battle Realms: Zen Edition (legendary RTS — Thai subtitles)',
          'Translated licensed manga (JA→TH) for First Page Pro (Kadokawa Thailand)',
          'Interpreted in consecutive and simultaneous modes (JA ⇄ TH) for business meetings and negotiations, including for a prominent Japanese content creator',
        ],
        links: [
          { label: '🌊 Wuthering Waves on Steam', url: 'https://store.steampowered.com/app/3513350/Wuthering_Waves/' },
        ],
      },
      'arcade-3': {
        title: '🕹️ DIGITAL HEARTS',
        brief: [
          'Localized high-profile AAA console titles alongside full-time LQA on real console hardware (Mar – Nov 2026)',
          'Interpreted for visiting Japanese executives · reported entirely in Japanese',
        ],
        stats: [
          { v: '80K+', l: 'words localized' },
          { v: '100%', l: 'bugs fixed pre-launch' },
          { v: 'AAA', l: 'console titles' },
        ],
        lines: [
          'Thai Localization & LQA — DIGITAL HEARTS (Thailand), Bangkok (Mar – Nov 2026, contract)',
          'Localized 80,000+ words of high-profile AAA console titles (EN/JA → TH) alongside full-time LQA duties on tight, simultaneous release schedules',
          'Uncovered and resolved 100% of linguistic bugs, text truncations, and formatting issues before launch through LQA on proprietary console hardware',
          'Interpreted for executives visiting from the Japan headquarters and reported to Japanese management entirely in Japanese',
        ],
        links: [
          { label: '🏢 digitalhearts.com', url: 'https://www.digitalhearts.com/' },
        ],
      },
      'arcade-4': {
        title: '🕹️ Secret Project ???',
        brief: [
          'An upcoming Thai game (2028) targeting the Japanese market — working with many well-known figures (can\'t name them yet 🤫)',
          'I own everything solo: marketing, localization (TH→EN/JA), and PR across every channel',
        ],
        stats: [
          { v: '?', l: 'NDA — top secret' },
          { v: '3', l: 'languages owned' },
          { v: '2028', l: 'planned release' },
        ],
        lines: [
          'Lead PR & Marketing / Localization (TH→EN/JA) — unannounced Thai indie title (NDA, 2028 release, part-time Jun 2026 – present)',
          'Direct all PR, marketing, and social media as a one-person team for a Thai game targeting the Japanese market — collaborating with several well-known industry figures (undisclosed per NDA)',
          'Localize all public-facing content from Thai into English and Japanese, owning tone and brand voice across three languages',
        ],
      },
      youtube: {
        title: '▶️ NPC Gatip',
        brandsHead: 'Brands I\'ve worked with — tap a logo for details',
        brief: [
          'My YouTube channel on games/anime/VTubers — built and run entirely solo. Tap any clip above to play it',
        ],
        stats: [
          { v: '~10K', l: 'subscribers (almost!)' },
          { v: '6M+', l: 'total views' },
          { v: '370K', l: 'top clip (views)' },
        ],
        tags: ['KAÏ Grooming', 'Pokémon UNITE', 'FIFINE', 'YouTube × Shopee 2025', 'MagicMic'],
        lines: [
          'YouTube "NPC Gatip" (youtube.com/@NPCGatip): games/anime/VTuber channel — approaching 10,000 subscribers · 6,000,000+ total views, built and run entirely solo',
          'Invited to the YouTube Shopping Creator Accelerator 2025 (YouTube × Shopee) as a high-potential new creator',
          'Brand work: KAÏ Grooming (sponsored promo) · Pokémon UNITE Championship Series 2026 (promoted with Invate Agency) · FIFINE (review for a high-spec mic) · iMyFone MagicMic (commissioned app review)',
          'Featured: the 9-year-old VTuber controversy (45K) · Farewell Gawr Gura (37K) · Thai VTuber drama of the year (36K) · top short at 370K views',
        ],
        links: [
          { label: '▶️ Visit NPC Gatip', url: 'https://youtube.com/@NPCGatip' },
        ],
      },
      bookshelf: {
        title: '📚 Background & Education',
        brief: [
          'B.A. Business Japanese — Thai-Nichi Institute of Technology, Second-Class Honors (full scholarship)',
          'Won all 3 Japan-sponsored programs — Tokyo Metropolitan Gov\'t · METI · JTECS (ranked 1st) — swipe above',
        ],
        stats: [
          { v: '3', l: 'Japan scholarships won' },
          { v: '3.49', l: 'GPA, Second-Class Honors' },
          { v: 'TNI', l: 'Thai-Nichi Institute of Technology' },
        ],
        lines: [
          'B.A. Business Japanese — Thai-Nichi Institute of Technology (TNI), Second-Class Honors (GPA 3.49), full scholarship student (2016 – 2021)',
          'Internships at 3 Japanese companies: Zeal Team (Tokyo Metropolitan Gov\'t program — 3 months on-site in Tokyo, 2023) · Touhou Bussan (METI-sponsored, 2021) · Haru Urarakana Shobo (JTECS scholarship — ranked 1st in selection, 2019–2020)',
          'Attended the 23rd World Scout Jamboree in Yamaguchi, Japan, back in high school (2015) — where the bond with Japan began',
        ],
      },
      other: {
        title: '🗂️ Other Work',
        brief: [
          'Experience outside the games industry that shaped my business Japanese and my ability to work in large international teams',
        ],
        stats: [
          { v: '0%', l: 'complaints in 17 months @Accenture' },
          { v: '450', l: 'team size, 30 nationalities' },
        ],
        lines: [
          'Data Analyst (Japanese), Trust & Safety — Accenture (2022 – 2023): analyzed content data in Japanese and English for a leading global social media client within a 450-person, 30-nationality team — 0% client complaint rate for 17 months',
          'HR Consultant — Pasona Thailand (3 months): HR consulting for Japanese companies operating in Thailand — resigned for personal reasons',
        ],
      },
      skills: {
        title: '🛠️ Core Skills',
        lines: [
          'Game localization (JA/EN→TH) · LQA on console hardware · CAT tools & terminology · Transcreation/marketing copy · Business interpretation (JA⇄TH) · PR & Marketing · Business development & events · Community/social media · AI tools',
        ],
      },
      language: {
        title: '🗣️ Languages',
        brief: [
          'Native Thai · Japanese JLPT N2 · English TOEIC 820',
          'My Japanese is battle-tested — it won all 3 Japan scholarships, carried job interviews, and works as an event interpreter',
        ],
        uses: [
          {
            l: '🇹🇭 Thai',
            lv: 'Native',
            d: 'My mother tongue — the target language of every localization job I take',
          },
          {
            l: '🇬🇧 English',
            lv: 'TOEIC 820',
            d: 'In use all day, every day — currently my working language with Sticky Rice and for remote work with a client in Canada',
          },
          {
            l: '🇯🇵 Japanese',
            lv: 'JLPT N2',
            d: 'Used for game localization work and for communicating with my Japanese managers and colleagues',
          },
        ],
        stats: [
          { v: '3', l: 'scholarships won by language' },
          { v: 'N2', l: 'JLPT Japanese' },
          { v: '820', l: 'TOEIC English' },
        ],
        lines: [
          'Thai — native · Japanese — JLPT N2 (daily business working language, incl. executive interpretation) · English — TOEIC 820',
          'Japanese proven in the real world: won all 3 Japan-sponsored scholarship selections and interviews · interviewed with Japanese companies · consecutive and simultaneous interpretation at meetings, negotiations, and live events',
        ],
      },
      event: {
        title: '🎪 Events & Game Booths',
        brief: [
          'Worked under two major organizations: pioneered JETRO\'s game booth at Thailand Game Show in 2024 + 2025 (booth interpreter + business matching, 10× booth growth) and managed the NicoNico Stage zone at AFA Bangkok',
          'Ran a massive Uma Musume event (100+ cosplayers, thousands joining) · hit Tokyo Game Show 2025 Business Day with Sticky Rice — 2 full days of scouting booths and finding clients',
        ],
        stats: [
          { v: '10×', l: 'JETRO booth growth' },
          { v: '50+', l: 'showcases coordinated' },
          { v: '100+', l: 'Uma Musume cosplayers' },
          { v: '10,000+', l: 'visitors reached at booths' },
        ],
        lines: [
          'JETRO × Thailand Game Show 2024 + 2025: pioneered JETRO\'s first game booth on a two-person team — booth interpreter, 20+ business-matching sessions (entirely in Japanese), and 50+ game showcases; its success secured a six-member team and a 10× larger booth in 2025, featuring playable titles from Cygames, KONAMI, hololive Indie, and many Japanese indies',
          'At the JETRO booth I worked as Staff / Game Presenter — manning the demo stations, pitching each title to Thai players, teaching the controls from scratch, interpreting live for the Japanese developers, handing out flyers and driving Steam wishlist adds. Titles I presented include Yohane the Parhelion - NUMAZU in the MIRAGE - (BeXide) · Vivid World (Asobism) · Castlevania Dominus Collection (KONAMI)',
          'Across all events, more than 10,000 people took part in the activities or dropped by the booths',
          'Ran Cygames\' massive Uma Musume fan event — 100+ cosplayers, with thousands of visitors joining the activities',
          'AFA Bangkok 2026: managed the entire NicoNico Stage zone — coordinating with the Japanese lighting crew and SOZO organizer staff in English/Japanese, running effects, directing crew, and stepping in as MC',
          'Tokyo Game Show 2025 Business Day: 2 full days with Sticky Rice — scouting booths, finding clients, negotiating, and exchanging cards with 15+ international developers',
          'President of the university Yosakoi club (Japanese folk dance) — led the team on stage at the National Stadium and at the Japanese Village in Ayutthaya',
          'Book Expo Thailand 2017 and 2019: joined both editions of the national book fair as event staff',
        ],
      },
      // ★ New zone 2026-07-20: Esports cabinet (5th cabinet of the north row)
      esport: {
        title: '🏆 Esports',
        brief: [
          'Former competitive Dota 2 player through high school and university — reached the national high-school Top 4 and ran into the pro team NeXT Esports by RPG in the ROG MASTERS 2017 open qualifiers',
          'Still competing on the Pokémon side — Top 8 at AIS 5G eSports OPEN Thailand 2022: Pokémon UNITE · match footage is right above',
        ],
        stats: [
          { v: 'TOP 4', l: 'national high-school level' },
          { v: 'TOP 8', l: 'Pokémon UNITE Thailand' },
          { v: '4', l: 'tournaments played' },
        ],
        lines: [
          'Former competitive Dota 2 esports player — competed in tournaments from high school through university',
          'Bodin E-Sport Championship ("Bodindecha The Battle") — Top 4 at national high-school level, offline LAN finals held at Bodindecha School on 17 Feb 2017 · sponsored by Alienware · Logitech G · GODLIKE · Invate',
          'ROG MASTERS 2017 Open Qualifier Thailand — fought through the bracket and faced the pro team NeXT Esports by RPG',
          'IT Ladkrabang Open House — DOTA 2 Tournament (full match broadcast available)',
          'AIS 5G eSports OPEN Thailand 2022: Pokémon UNITE — finished in the tournament Top 8',
          'Also competed in CS:GO — never went deep in the bracket, but it put me inside the competitive FPS scene first-hand',
          'Competing as an actual player means knowing in-game terminology, match pacing and community culture from the player\'s side — which feeds directly into game localization and esports event/marketing work',
        ],
        links: [
          { label: '▶️ DOTA 2 — IT Ladkrabang Open House', url: 'https://www.youtube.com/watch?v=BwjusMBK0ps' },
          { label: '▶️ Pokémon UNITE — AIS 5G eSports OPEN 2022', url: 'https://www.youtube.com/watch?v=_1Nymo9wWY8' },
          { label: '📸 LAN Finals — Bodindecha The Battle', url: 'https://www.facebook.com/photo/?fbid=1754261091556771' },
        ],
      },
      // ★ New zone 2026-07-20 — web novel writing
      writing: {
        title: '📖 Fiction Writing',
        brief: [
          'Web novelist on Tunwalai — a 139-chapter fantasy series with 172,000 reads that reached the Top 30 in its category',
          'Recognised by the platform as a "Gold Medal Writer", with a steady returning readership',
          'Why it matters for game localization: translation is writing in the target language — finishing a long-form novel proves I can hold voice, character tone and narrative pacing in Thai',
        ],
        stats: [
          { v: '172K', l: 'total reads' },
          { v: 'TOP 30', l: 'in the fantasy category' },
          { v: '139', l: 'chapters written' },
          { v: '1,170', l: 'library adds' },
        ],
        lines: [
          'Web novelist on Tunwalai — a 139-chapter original fantasy series about a cursed alchemist',
          'Over 172,000 total reads · 1,170 readers added it to their library · reached the Top 30 of the fantasy category',
          'Recognised by the platform as a "Gold Medal Writer" (the work is rated for readers aged 20+)',
          'Skills that carry straight into localization: holding a consistent voice and character tone across a long body of work · pacing a narrative · writing Thai dialogue that sounds natural — exactly what transcreating game scripts demands',
        ],
        links: [
          { label: '📖 Read on Tunwalai', url: 'https://www.tunwalai.com/story/233324' },
        ],
      },
      network: {
        title: '🤝 Industry Network',
        brief: [
          'Direct working relationships with Thailand\'s top gaming pages, media, and influencers — a ready amplification channel for game launches in the Thai market',
        ],
        stats: [
          { v: '1.5M+', l: 'combined network reach' },
          { v: '9+', l: 'pages/media/organizations' },
        ],
        lines: [
          'Industry network: direct working relationships with Thailand\'s top gaming pages, media, and influencers — Pochi Pochi (popular anime/game news YouTuber) · SheapGamer (one of Thailand\'s biggest game-deals pages) · GamerOmTeen (hit gaming meme/community page) · Kagami Visual Novel (Thailand\'s go-to VN page) · ConSole Hub (console gaming community)',
          'Organizational network: J-Tech (JTECS) · DIGITAL HEARTS · Kadokawa Thailand · First Page Pro',
          'Member of Thailand Game Development and Media — the community of Thai game developers and games media',
          'A ready amplification channel for launching and promoting games in the Thai market',
        ],
      },
      desk: {
        title: '📮 Contact',
        lines: [
          'Seeking a Localization / LQA / Publishing / PR & Marketing role at a game company in Japan — ready to relocate',
          'Based in Nonthaburi, Thailand',
        ],
        links: [
          { label: '✉️ nipith.w@gmail.com', url: 'mailto:nipith.w@gmail.com' },
          { label: '💼 LinkedIn', url: 'https://linkedin.com/in/nipithw' },
          { label: '▶️ YouTube — NPC Gatip', url: 'https://youtube.com/@NPCGatip' },
        ],
      },
      door: {
        title: '📄 Resume PDF',
        lines: [
          'Download the full resume — English version plus the complete Japanese set (履歴書 + 職務経歴書)',
        ],
        links: [
          { label: '📄 Resume PDF (EN)', url: RESUME_PDF, download: true },
          { label: '📄 履歴書 (JA)', url: RESUME_PDF_JA, download: true },
          { label: '📄 職務経歴書 (JA)', url: RESUME_PDF_JA_CV, download: true },
        ],
      },
    },
  },

  ja: {
    intro: {
      lines: [
        'やっほー！ボクは「ガティップ」！',
        'サイトのオーナーのニックネームなんだ。ガティップはタイのもち米を入れる竹カゴのことだよ！',
        'スタジオを案内するね！',
      ],
      role: 'ゲームローカライズ  JA / EN → TH   ·   LQA   ·   PR＆マーケティング',
      skip: 'スキップ ▸▸',
    },
    ui: {
      interact: 'Eキーで見る',
      interactTouch: '✦をタップで見る',
      close: '閉じる',
      langBtn: '言語を変更',
      progress: '探索済み',
      progressDone: '🎉 全ゾーン制覇！',
      openLink: '↗ ページを開く',
    },
    resume: {
      openTitle: '📄 履歴書を読む · ゲーム不要',
      open: '📄 Resume',
      heading: 'Resume Mode',
      subtitle: 'ゲームローカライズ · PR＆マーケティング（日・英 → タイ語）· お急ぎの方向けクイック閲覧モード',
      download: '📄 Resume PDF（英語版）',
      downloadJa: '📄 履歴書（日本語）',
      downloadJaCv: '📄 職務経歴書（日本語）',
      back: '🎮 ゲームにもどる',
      credit: '楽曲: 「3:03 PM」しゃろう · 制作者の利用規約に基づき使用',
    },
    panels: {
      'arcade-1': {
        title: '🕹️ Sticky Rice · Cherry Kiss',
        brief: [
          'Sticky Rice Gamesと18+レーベルCherry Kissの日→タイ語ローカライズをタイ側1人で一貫担当（2024年12月〜現在）',
          'Cherry Kiss ThailandのFacebook・Xを単独運営 — コンテンツパートナー: Kagami Visual Novel',
        ],
        stats: [
          { v: '14', l: 'Steamリリース作品' },
          { v: '100万+', l: '翻訳文字数' },
          { v: '+15%', l: '売上増（タイ語版）' },
          { v: '1.6K+', l: 'フォロワー（0から）' },
        ],
        lines: [
          'タイ担当ローカライズ＆マーケティングマネージャー（2024年12月〜現在）— 日本のゲームをSteamで展開するカナダのパブリッシャー（Sticky Rice Games + Cherry Kissレーベル）',
          'タイ側スタッフ1人として日→タイ語ローカライズを一貫担当（進行管理・翻訳・校正・カルチャライズ）— 日本のビジュアルノベル14作品をSteamでリリース',
          '累計100万文字以上を単独で翻訳・校正し、全タイトルのトーン・用語・文体を統一',
          'タイ市場向けのトランスクリエーションにより、ローカライズ済み旧作の売上15%増に貢献',
          'Cherry Kiss ThailandのSNS（Facebook + X）を単独運営し、フォロワー0から1,600人以上へ — タイのプレイヤーへの初の直接チャネルを確立（Kagami Visual Novelなどのパートナーとも連携）',
          '東京ゲームショウ2025に会社代表として参加し、15社以上の海外デベロッパーと商談',
        ],
        links: [
          { label: '🎮 Sticky Rice on Steam', url: 'https://store.steampowered.com/publisher/stickyricegames' },
          { label: '🍒 Cherry Kiss on Steam', url: 'https://store.steampowered.com/publisher/cherrykiss' },
          { label: '📘 Cherry Kiss Thailand (FB)', url: 'https://www.facebook.com/cherrykissthai' },
          { label: '𝕏 @cherrykissthai', url: 'https://x.com/cherrykissthai' },
        ],
      },
      'arcade-2': {
        title: '🕹️ Freelance',
        brief: [
          '『鳴潮（Wuthering Waves）』『Battle Realms: Zen Edition』のローカライズに参加 · KADOKAWAタイランドで漫画翻訳',
          'ビジネス通訳（日⇄タイ・逐次/同時）— 上のスライドで作品をチェック',
        ],
        lines: [
          'フリーランス ローカライザー＆通訳 — 日・英 → タイ語（2024年〜現在）',
          '『鳴潮（Wuthering Waves）』（Marano Business社案件）や『Battle Realms: Zen Edition』（伝説のRTS — タイ語字幕担当）など大型タイトルのローカライズに参加',
          'First Page Pro（KADOKAWAタイランド）にてライセンス漫画の日→タイ語翻訳を担当',
          '商談・交渉における逐次通訳・同時通訳（日⇄タイ）— 著名な日本のクリエイターの案件を含む',
        ],
        links: [
          { label: '🌊 鳴潮（Wuthering Waves）on Steam', url: 'https://store.steampowered.com/app/3513350/Wuthering_Waves/' },
        ],
      },
      'arcade-3': {
        title: '🕹️ DIGITAL HEARTS',
        brief: [
          '大型AAAコンソールタイトルのローカライズと実機LQAをフルタイムで並行（2026年3月〜11月）',
          '日本本社役員の通訳を担当 · 報告はすべて日本語で実施',
        ],
        stats: [
          { v: '8万+', l: '翻訳ワード数' },
          { v: '100%', l: '発売前バグ解決' },
          { v: 'AAA', l: 'コンソール作品' },
        ],
        lines: [
          'タイ語ローカライズ＆LQA — DIGITAL HEARTS（タイランド）バンコク（2026年3月〜11月・契約）',
          '大型AAAコンソールタイトルを8万語以上（英・日→タイ語）ローカライズしつつ、世界同時発売スケジュールの中でフルタイムのLQA業務を並行',
          'コンソール実機でのLQAにより、言語バグ・テキスト切れ・表記の問題を発売前に100%検出・解決',
          '日本本社からの役員来訪時に通訳を務め、日本人マネジメントへの報告はすべて日本語で実施',
        ],
        links: [
          { label: '🏢 digitalhearts.com', url: 'https://www.digitalhearts.com/' },
        ],
      },
      'arcade-4': {
        title: '🕹️ シークレット案件 ???',
        brief: [
          '2028年発売予定・日本市場を狙うタイ産ゲーム — 業界の著名人たちと協業中（まだ名前は言えません 🤫）',
          'マーケティング・翻訳（タイ→英/日）・PRのすべてを1人で統括',
        ],
        stats: [
          { v: '?', l: 'NDA・極秘' },
          { v: '3', l: '担当言語' },
          { v: '2028', l: '発売予定' },
        ],
        lines: [
          'PR＆マーケティング統括 / ローカライズ（タイ→英・日）— 未発表のタイ産インディーゲーム（NDA・2028年発売予定、2026年6月〜現在・兼業）',
          '日本市場を狙うタイ産ゲームのPR・マーケティング・SNSを1人で統括 — 業界の著名人たちとの協業案件（NDAのため非公開）',
          '公開コンテンツ全般をタイ語から英語・日本語へローカライズし、3言語のトーンとブランドボイスを管理',
        ],
      },
      youtube: {
        title: '▶️ NPC Gatip',
        brandsHead: 'コラボしたブランド — ロゴをタップで詳細',
        brief: [
          'ゲーム/アニメ/VTuberを扱うYouTubeチャンネル — 企画から運営まで完全単独。上のクリップはタップで再生できます',
        ],
        stats: [
          { v: '~1万', l: '登録者数（もうすぐ！）' },
          { v: '600万+', l: '総再生回数' },
          { v: '37万', l: '最多再生クリップ' },
        ],
        tags: ['KAÏ Grooming', 'Pokémon UNITE', 'FIFINE', 'YouTube × Shopee 2025', 'MagicMic'],
        lines: [
          'YouTube「NPC Gatip」(youtube.com/@NPCGatip): ゲーム/アニメ/VTuberチャンネル — 登録者まもなく10,000人・総再生600万回以上、企画から運営まで完全単独',
          'YouTube Shopping Creator Accelerator 2025（YouTube × Shopee）に新鋭クリエイターとして招待される',
          'ブランド実績: KAÏ Grooming（PR案件）· ポケモンユナイト Championship Series 2026（Invate Agencyと共同プロモーション）· FIFINE（レビューでハイスペックマイク提供）· iMyFone MagicMic（アプリレビュー依頼）',
          '人気動画: 9歳VTuber騒動（4.5万）· さよならGawr Gura（3.7万）· タイVTuber界の大炎上（3.6万）· 最多再生ショート37万回',
        ],
        links: [
          { label: '▶️ NPC Gatipチャンネルへ', url: 'https://youtube.com/@NPCGatip' },
        ],
      },
      bookshelf: {
        title: '📚 経歴・学歴',
        brief: [
          '泰日工業大学 ビジネス日本語専攻 卒業 — 第二等優等（全額奨学生）',
          '日本行きのプログラムを3つとも獲得 — 東京都 · METI · JTECS（選考1位）— 上のスライドへ',
        ],
        stats: [
          { v: '3', l: '獲得した日本奨学金' },
          { v: '3.49', l: 'GPA・第二等優等' },
          { v: 'TNI', l: '泰日工業大学' },
        ],
        lines: [
          '泰日工業大学（TNI / Thai-Nichi Institute of Technology）ビジネス日本語専攻 卒業 — 第二等優等（GPA 3.49）・全額奨学生（2016 – 2021）',
          '日系企業3社でのインターン経験: Zeal Team（東京都主催プログラム — 東京にて3か月常駐、2023年）· 東邦物産（METI支援、2021年）· はるうららかな書房（JTECS奨学金 — 選考1位、2019–2020年）',
          '高校時代に第23回世界スカウトジャンボリー（山口県・2015年）へ参加 — 日本との縁の原点',
        ],
      },
      other: {
        title: '🗂️ その他の職務',
        brief: [
          'ゲーム業界外での経験 — ビジネス日本語と多国籍チームでの働き方を鍛えた土台',
        ],
        stats: [
          { v: '0%', l: 'クレーム率17か月 @アクセンチュア' },
          { v: '450', l: 'チーム規模・30か国籍' },
        ],
        lines: [
          'データアナリスト（日本語）Trust & Safety — アクセンチュア（2022 – 2023）: 世界的SNS企業向けに日英コンテンツデータを分析。450名・30か国籍のチームにて、17か月連続クライアントクレーム0%を達成',
          'HRコンサルタント — パソナタイランド（3か月）: タイ進出日系企業向けの人材コンサルティング業務。一身上の都合により退職',
        ],
      },
      skills: {
        title: '🛠️ コアスキル',
        lines: [
          'ゲームローカライズ（日・英→タイ）· コンソール実機LQA · CATツール＆用語管理 · トランスクリエーション/マーケティングコピー · ビジネス通訳（日⇄タイ）· PR＆マーケティング · 事業開発・イベント · コミュニティ/SNS運用 · AIツール活用',
        ],
      },
      language: {
        title: '🗣️ 言語',
        brief: [
          'タイ語ネイティブ · 日本語 JLPT N2 · 英語 TOEIC 820',
          '日本語は実戦で証明済み — 3つの日本行きプログラムの選考・面接を突破し、イベント通訳としても活動',
        ],
        uses: [
          {
            l: '🇹🇭 タイ語',
            lv: '母語',
            d: '母国語 — すべてのローカライズ業務における訳出先言語',
          },
          {
            l: '🇬🇧 英語',
            lv: 'TOEIC 820',
            d: '常時使用。現在はSticky Riceでの業務言語として、またカナダのクライアントとのリモートワークで使用',
          },
          {
            l: '🇯🇵 日本語',
            lv: 'JLPT N2',
            d: 'ゲームローカライズ業務に使用。日本人の上司・同僚とのコミュニケーションも日本語で実施',
          },
        ],
        stats: [
          { v: '3', l: '日本語で勝ち取った奨学金' },
          { v: 'N2', l: 'JLPT 日本語' },
          { v: '820', l: 'TOEIC 英語' },
        ],
        lines: [
          'タイ語 — 母語 · 日本語 — JLPT N2（役員通訳を含む日常業務言語）· 英語 — TOEIC 820',
          '日本語の実戦経験: 日本行きプログラム3件の選考・面接をすべて突破 · 日系企業の採用面接 · 会議・商談・イベントでの逐次/同時通訳',
        ],
      },
      event: {
        title: '🎪 イベント＆ゲームブース',
        brief: [
          '2つの大組織のもとで活動: Thailand Game ShowでJETRO初のゲームブースを2024年+2025年に開拓（ブース通訳＆ビジネスマッチング、ブース10倍に）· AFA Bangkokニコニコステージのゾーン統括',
          '『ウマ娘』ビッグイベント運営（コスプレ100名超・数千人参加）· Sticky Riceと東京ゲームショウ2025 ビジネスデイへ — 2日間ブース視察＆顧客開拓',
        ],
        stats: [
          { v: '10倍', l: 'JETROブース拡大' },
          { v: '50+', l: 'ショーケース調整' },
          { v: '100+', l: 'ウマ娘コスプレイヤー' },
          { v: '10,000+', l: 'ブース来場・参加者' },
        ],
        lines: [
          'JETRO × Thailand Game Show 2024年+2025年: JETRO初のゲームブースを2人体制で開拓 — ブース通訳・ビジネスマッチング20件以上（すべて日本語）・50作品以上のショーケースを担当。成功により2025年はチーム6名・ブース10倍に拡大。ブースにはCygames、KONAMI、hololive Indieをはじめ日本のインディー作品が多数出展',
          'JETROブースでは<b>スタッフ / ゲームプレゼンター</b>として試遊台に常駐 — タイのプレイヤーへ各タイトルを紹介し、操作説明、日本の開発者向けの逐次通訳、チラシ配布、Steamウィッシュリスト登録の促進を担当。担当タイトル例: 『幻日のヨハネ - NUMAZU in the MIRAGE -』（BeXide）·『Vivid World』（Asobism）·『Castlevania Dominus Collection』（KONAMI）',
          '全イベント合計で、10,000名を超える方々がブースに来場・参加',
          'Cygames『ウマ娘』ビッグファンイベントを運営 — コスプレイヤー100名超、数千人が来場・参加',
          'AFA Bangkok 2026: ニコニコステージのゾーンを統括 — 日本人照明チームや主催SOZOスタッフと英語/日本語で連携し、演出オペレーション・スタッフ采配・MCまで担当',
          '東京ゲームショウ2025 ビジネスデイ: Sticky Riceと2日間フル稼働 — ブースを視察して顧客を開拓、15社以上の海外デベロッパーと商談・名刺交換',
          '大学ではよさこいサークルの部長を担当 — ナショナルスタジアムおよびアユタヤの日本人村での演舞をチームで実施',
          'Book Expo Thailand 2017・2019: タイ最大級のブックフェアに両年ともスタッフとして参加',
        ],
      },
      // ★ 新ゾーン 2026-07-20: eスポーツ筐体（北側の列・5台目）
      esport: {
        title: '🏆 eスポーツ',
        brief: [
          '高校〜大学時代はDota 2の競技プレイヤー。高校生全国大会でベスト4、ROG MASTERS 2017タイ予選ではプロチーム NeXT Esports by RPG と対戦',
          'ポケモンユナイトでも AIS 5G eSports OPEN Thailand 2022 でベスト8 · 実際の試合映像は上のスライドから',
        ],
        stats: [
          { v: 'TOP 4', l: '高校生全国レベル' },
          { v: 'TOP 8', l: 'ポケモンユナイト タイ' },
          { v: '4', l: '出場した大会数' },
        ],
        lines: [
          '元Dota 2競技プレイヤー — 高校時代から大学時代にかけて各種大会に出場',
          'Bodin E-Sport Championship（「Bodindecha The Battle」）— 高校生全国レベルでベスト4。2017年2月17日、ボディンデーチャ校でのオフライン（LAN）決勝 · 協賛: Alienware · Logitech G · GODLIKE · Invate',
          'ROG MASTERS 2017 タイ オープン予選 — 勝ち上がりプロチーム NeXT Esports by RPG と対戦',
          'IT Ladkrabang Open House — DOTA 2 大会（試合中継の映像あり）',
          'AIS 5G eSports OPEN Thailand 2022：ポケモンユナイト — 大会ベスト8',
          'CS:GOの大会にも出場 — 上位までは進めなかったが、競技FPSシーンを現場から体感',
          '競技者としてプレイしてきた経験から、ゲーム内用語・試合のテンポ・コミュニティ文化をプレイヤー視点で理解している — ゲームローカライズやeスポーツのイベント/マーケティング業務に直結する強み',
        ],
        links: [
          { label: '▶️ DOTA 2 — IT Ladkrabang Open House', url: 'https://www.youtube.com/watch?v=BwjusMBK0ps' },
          { label: '▶️ ポケモンユナイト — AIS 5G eSports OPEN 2022', url: 'https://www.youtube.com/watch?v=_1Nymo9wWY8' },
          { label: '📸 LAN決勝 — Bodindecha The Battle', url: 'https://www.facebook.com/photo/?fbid=1754261091556771' },
        ],
      },
      // ★ 新ゾーン 2026-07-20 — Web小説の執筆
      writing: {
        title: '📖 小説執筆',
        brief: [
          'タイのWeb小説サイト Tunwalai で執筆 — 全139話のファンタジー作品、累計17.2万閲覧、ファンタジー部門トップ30入り',
          'サイトから「ゴールドメダル作家」として認定され、継続的な読者層をもつ',
          'ゲームローカライズとの関係: 翻訳とは「訳文を書く」仕事。長編を完結させた経験は、タイ語で文体・キャラクターの口調・物語のテンポを保てる証明になる',
        ],
        stats: [
          { v: '17.2万', l: '累計閲覧数' },
          { v: 'TOP 30', l: 'ファンタジー部門' },
          { v: '139', l: '執筆した話数' },
          { v: '1,170', l: '本棚追加数' },
        ],
        lines: [
          'タイのWeb小説サイト Tunwalai にて全139話のオリジナルファンタジーを連載',
          '累計閲覧17.2万回 · 1,170人が本棚に追加 · ファンタジー部門でトップ30入り',
          'サイトより「ゴールドメダル作家」として認定（作品は20歳以上向けの内容を含む）',
          'ローカライズに直結するスキル: 長い分量を通して文体とキャラクターの口調を一貫させる · 物語のテンポを設計する · 自然なタイ語の台詞を書く — ゲームシナリオのトランスクリエイションに必要な力そのもの',
        ],
        links: [
          { label: '📖 Tunwalaiで読む', url: 'https://www.tunwalai.com/story/233324' },
        ],
      },
      network: {
        title: '🤝 業界ネットワーク',
        brief: [
          'タイの主要ゲームメディア・コミュニティ・インフルエンサーとの直接的な協力関係 — タイ市場でのゲームローンチに即活用できる拡散チャネル',
        ],
        stats: [
          { v: '1.5M+', l: 'ネットワーク総フォロワー' },
          { v: '9+', l: '協力メディア/団体' },
        ],
        lines: [
          '業界ネットワーク: タイの主要ゲームメディア・コミュニティ・インフルエンサーとの直接的な協力関係 — Pochi Pochi（アニメ・ゲームニュース系人気YouTuber）· SheapGamer（タイ最大級のゲームセール情報ページ）· GamerOmTeen（大人気ゲームミームページ）· Kagami Visual Novel（タイのVN専門ページ）· ConSole Hub（コンシューマーゲームコミュニティ）',
          '団体・企業ネットワーク: J-Tech（JTECS）· DIGITAL HEARTS · Kadokawa Thailand · First Page Pro',
          'Thailand Game Development and Media のメンバー — タイのゲーム開発者・ゲームメディアのコミュニティ',
          'タイ市場でのゲームローンチ・プロモーションに即活用できる拡散チャネル',
        ],
      },
      desk: {
        title: '📮 コンタクト',
        lines: [
          '日本のゲーム会社でのローカライズ / LQA / パブリッシング / PR＆マーケティング職を希望 — 日本への移住準備あり',
          '現在はタイ・ノンタブリー在住',
        ],
        links: [
          { label: '✉️ nipith.w@gmail.com', url: 'mailto:nipith.w@gmail.com' },
          { label: '💼 LinkedIn', url: 'https://linkedin.com/in/nipithw' },
          { label: '▶️ YouTube — NPC Gatip', url: 'https://youtube.com/@NPCGatip' },
        ],
      },
      door: {
        title: '📄 履歴書 PDF',
        lines: [
          '応募書類をダウンロードできます — 日本語の履歴書・職務経歴書、および英語版Resumeをご用意しています',
        ],
        links: [
          { label: '📄 履歴書（日本語）', url: RESUME_PDF_JA, download: true },
          { label: '📄 職務経歴書（日本語）', url: RESUME_PDF_JA_CV, download: true },
          { label: '📄 Resume PDF（英語版）', url: RESUME_PDF, download: true },
        ],
      },
    },
  },
};
