# ============================================
# gen_slides.py — normalize ภาพ showcase ทุกใบเป็นมาตรฐานเดียว 1920×1080 (FULL HD)
# เจ้าของสั่ง 2026-07-18: "ทุกอันขนาดเท่ากัน อิง Wallpaper Wuthering Waves เป็นหลัก
# โลโก้องค์กรก็ต้องใหญ่เท่ากัน" + รอบสอง: "การ์ดโลโก้ดูไม่สวย ปรับให้สวยๆ"
# - photo  : crop เต็มเฟรม (cover) + sharpen เบาๆ
# - tall   : ภาพแนวตั้ง (ปกมังงะ/โปสเตอร์/Shorts) วางกลางบนพื้นหลังตัวเองเบลอ
# - logo   : การ์ดวาชิ v2 — ลายคลื่นเซกาอิฮะครามจางบนหัว + กรอบทองคู่มุมประดับ
#            + เงานุ่มใต้โลโก้ + ตราประทับชาดมุมขวาล่าง (ธีมราตรีญี่ปุ่น)
# วิธีรัน:  python tools/gen_slides.py   (ต้องมี pillow + numpy)
# ============================================
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# ★ 2026-07-20 รอบ 5 (เจ้าของสั่ง "อยากให้เท่ากันหมด สวยทุกอัน"):
#   - ผืนผ้าใบ 1920×1080 → **2560×1440 (QHD)** ทุกใบเท่ากันหมด
#   - เซฟเป็น **WebP** แทน JPEG — ที่คุณภาพเท่ากันไฟล์เล็กกว่า jpg ~35% จึงอัปขนาด
#     ได้โดยน้ำหนักเว็บรวมไม่เพิ่ม
#   - โลโก้ทุกอันดึงจาก assets/showcase/logos/ (ชุดมาตรฐานพื้นโปร่งใส ด้านยาว 1600px
#     สร้างด้วย tools/prep_logos.py) → ไม่มีกล่องขาวบนกระดาษวาชิอีกแล้ว
W, H = 2560, 1440
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'showcase')
LOGOS = os.path.join(SRC, 'logos')
OUT = os.path.join(SRC, 'slides')
os.makedirs(OUT, exist_ok=True)

rng = np.random.default_rng(7)

K = W / 1920.0  # ★ ตัวคูณสเกลลาย/กรอบ ให้สัดส่วนเท่าเดิมตอนขยายผืนผ้าใบ

AI = (16, 18, 38)        # ครามมิดไนต์
KIN = (217, 164, 65)     # ทองบยศ
SHU = (229, 72, 77)      # ชาด


def washi_bg():
    """กระดาษวาชิ #f5efe2 + เสี้ยนกระดาษ + แสงอุ่นกลางการ์ด + vignette"""
    base = np.full((H, W, 3), (245, 239, 226), dtype=np.float32)
    noise = rng.normal(0, 4.0, (H, W, 1)).astype(np.float32)
    base += noise
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    # แสงอุ่นตรงกลาง (โลโก้เด่นขึ้น) + ขอบหม่นลงนุ่มๆ
    base += (np.clip(0.5 - d, 0, 1) * 14)[..., None] * np.array([1.0, 0.98, 0.9])
    base -= (np.clip(d - 0.55, 0, 1) ** 2 * 30)[..., None]
    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))
    d2 = ImageDraw.Draw(img, 'RGBA')
    for _ in range(90):
        y = int(rng.uniform(0, H))
        x = int(rng.uniform(0, W))
        ln = int(rng.uniform(40, 220))
        d2.line([(x, y), (x + ln, y)], fill=(255, 255, 255, 14), width=1)
    return img


def seigaiha(img, y0, y1, alpha=22):
    """แถบลายคลื่นเซกาอิฮะ (วงโค้งซ้อน) โทนคราม — ลายเซ็นเดียวกับหัว panel"""
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    r = round(56 * K)
    row = 0
    y = y0
    while y < y1 + r:
        off = 0 if row % 2 == 0 else r
        for x in range(-r + off - r, W + r, r * 2):
            for k, rr in enumerate((r, int(r * 0.66), int(r * 0.33))):
                d.arc([x - rr, y - rr, x + rr, y + rr], 180, 360,
                      fill=(AI[0], AI[1], AI[2], alpha - k * 4), width=max(1, round(3 * K)))
        y += r // 2
        row += 1
    # เฟดลายให้จางลงตอนใกล้ขอบล่างของแถบ
    mask = Image.new('L', (W, H), 0)
    md = ImageDraw.Draw(mask)
    for yy2 in range(y0 - r, y1 + r):
        t = max(0.0, min(1.0, (y1 - yy2) / max(1, (y1 - y0))))
        md.line([(0, yy2), (W, yy2)], fill=int(255 * t))
    ov.putalpha(Image.composite(ov.split()[3], Image.new('L', (W, H), 0), mask))
    img.paste(ov, (0, 0), ov)
    return img


def gold_frame_v2(img, inset=None):
    """กรอบทองคู่ + วงเล็บมุมหนา + เพชรทองกึ่งกลางขอบบน/ล่าง"""
    if inset is None:
        inset = round(40 * K)
    d = ImageDraw.Draw(img, 'RGBA')
    x0, y0, x1, y1 = inset, inset, W - inset, H - inset
    d.rectangle([x0, y0, x1, y1], outline=(*KIN, 210), width=max(1, round(3 * K)))
    g12 = round(12 * K)
    d.rectangle([x0 + g12, y0 + g12, x1 - g12, y1 - g12], outline=(43, 39, 64, 70), width=max(1, round(2 * K)))
    # วงเล็บมุม (L-bracket) หนาขึ้น = งานประณีต
    L = round(74 * K)
    for cx, cy, sx, sy in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
        d.line([(cx, cy + sy * L), (cx, cy), (cx + sx * L, cy)], fill=(*KIN, 255), width=max(1, round(7 * K)))
        e12, e18 = round(12 * K), round(18 * K)
        d.line([(cx + sx * e12, cy + sy * (L - e18)), (cx + sx * e12, cy + sy * e12),
                (cx + sx * (L - e18), cy + sy * e12)], fill=(*KIN, 120), width=max(1, round(3 * K)))
    # เพชรเล็กกึ่งกลางขอบบน/ล่าง
    for cy in (y0, y1):
        dm = round(10 * K)
        d.polygon([(W / 2, cy - dm), (W / 2 + dm, cy), (W / 2, cy + dm), (W / 2 - dm, cy)],
                  fill=(*KIN, 235))
    # ตราประทับชาดมุมขวาล่าง (ลายเซ็นธีม)
    s66, s44, s6, s38 = (round(v * K) for v in (66, 44, 6, 38))
    sx0, sy0 = x1 - s66, y1 - s66
    d.rounded_rectangle([sx0, sy0, sx0 + s44, sy0 + s44], round(6 * K), fill=(*SHU, 215))
    d.rectangle([sx0 + s6, sy0 + s6, sx0 + s38, sy0 + s38], outline=(245, 239, 226, 180), width=max(1, round(2 * K)))
    return img


def cover(src):
    im = Image.open(src).convert('RGB')
    s = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = (im.width - W) // 2
    y = (im.height - H) // 2
    im = im.crop((x, y, x + W, y + H))
    return im.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))


def tall(src):
    im = Image.open(src).convert('RGB')
    bg = cover(src).filter(ImageFilter.GaussianBlur(round(28 * K)))
    # กดพื้นหลังให้มืดลงนิด ให้ภาพจริงเด่น
    bg = Image.blend(bg, Image.new('RGB', (W, H), AI), 0.35)
    m80, m40 = round(80 * K), round(40 * K)
    s = (H - m80) / im.height
    fg = im.resize((round(im.width * s), H - m80), Image.LANCZOS)
    bg.paste(fg, ((W - fg.width) // 2, m40))
    d = ImageDraw.Draw(bg, 'RGBA')
    x0 = (W - fg.width) // 2
    d.rectangle([x0 - 2, m40 - 2, x0 + fg.width + 2, m40 + 2 + fg.height], outline=(*KIN, 220), width=max(1, round(3 * K)))
    return bg


# ★ 2026-07-20: เพดานการขยายโลโก้
# ต้นฉบับบางตัวเล็กมาก (tokyo-internship-logo.png = 143×74) เดิมถูกขยาย ~5.8x
# แล้วเบราว์เซอร์ขยายต่ออีก ~2.6x → เบลอรวม ~15x (เจ้าของแจ้งว่า "ภาพมัว")
# แก้ที่ต้นทาง: ไม่ขยายเกิน MAX_UPSCALE แล้ว sharpen — ยอมให้โลโก้เล็กลงแต่คม
MAX_UPSCALE = 4.6


def logo(src, box=(0.56, 0.4)):
    im = Image.open(src).convert('RGBA')
    # โลโก้ทรงสูงแคบ (เช่นตราลูกเสือโลก) — ให้กินความสูงการ์ดมากขึ้น ไม่งั้นดูจิ๋ว
    if im.height > im.width * 1.25:
        box = (box[0], 0.62)
    # ตัดขอบขาว/โปร่งใสรอบโลโก้ก่อน เพื่อให้ทุกตัว scale จากเนื้อโลโก้จริงเท่ากัน
    arr = np.asarray(im)
    if (arr[..., 3] < 250).any():
        mask = arr[..., 3] > 8
    else:
        rgb = arr[..., :3].astype(int)
        mask = (255 * 3 - rgb.sum(axis=2)) > 24  # ไม่ใช่สีขาวเกือบล้วน
    ys, xs = np.where(mask)
    if len(xs) > 0:
        im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    bw, bh = int(W * box[0]), int(H * box[1])
    s = min(bw / im.width, bh / im.height)
    if s > MAX_UPSCALE:
        s = MAX_UPSCALE  # ต้นฉบับเล็กเกิน — ยอมให้การ์ดโล่งกว่าเดิม แลกกับความคม
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    if s > 1.2:
        im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=150, threshold=1))

    bg = washi_bg()
    bg = seigaiha(bg, round(40 * K), round(210 * K))
    lx, ly = (W - im.width) // 2, (H - im.height) // 2 + round(14 * K)

    # เงานุ่มใต้โลโก้ — ยกโลโก้ให้ลอยจากกระดาษ
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    shd = ImageDraw.Draw(sh)
    shd.ellipse([W / 2 - im.width * 0.46, ly + im.height - round(8 * K),
                 W / 2 + im.width * 0.46, ly + im.height + round(34 * K)],
                fill=(43, 39, 64, 70))
    sh = sh.filter(ImageFilter.GaussianBlur(round(16 * K)))
    bg.paste(sh, (0, 0), sh)

    bg.paste(im, (lx, ly), im)
    return gold_frame_v2(bg)


JOBS = [
    # (ชนิด, ไฟล์ต้นทาง, ไฟล์ปลายทาง) — ★ ปลายทางเป็น .webp ทั้งหมด (2026-07-20 รอบ 5)
    #   kind 'logo' อ่านจาก assets/showcase/logos/ (ชุดมาตรฐานพื้นโปร่งใส)
    ('cover', 'wuwa-wallpaper.jpg', 'wuwa.webp'),
    ('cover', 'battlerealms.jpg', 'battlerealms.webp'),
    ('cover', 'ck-waifupillows-th.jpg', 'ck-waifu.webp'),
    # คลิป YouTube ที่ใช้ใน panel (thumbnail ในเครื่อง — แตะแล้วค่อยสร้าง iframe)
    ('cover', 'yt-8vhh2Yo2yBQ.jpg', 'yt-8vhh2Yo2yBQ.webp'),
    ('cover', 'yt-8VmGQ52IpFo.jpg', 'yts-8VmGQ52IpFo.webp'),
    ('cover', 'yt-tiOiohuE8Os.jpg', 'yts-tiOiohuE8Os.webp'),
    ('cover', 'yt-BwjusMBK0ps.jpg', 'yt-BwjusMBK0ps.webp'),
    ('cover', 'yt-_1Nymo9wWY8.jpg', 'yt-_1Nymo9wWY8.webp'),
    ('tall', 'manga-yuri.jpg', 'manga.webp'),
    ('tall', 'afa-2026.jpg', 'afa.webp'),
    # ตู้อีเวนต์
    ('cover', 'event-uma.jpg', 'event-uma.webp'),
    ('cover', 'event-tgs2024.webp', 'event-tgs2024.webp'),
    ('cover', 'event-tgs.webp', 'event-tgs.webp'),
    ('tall', 'event-nico.jpg', 'event-nico.webp'),
    ('cover', 'event-jetro-team.jpg', 'event-jetro-team.webp'),
    ('cover', 'event-jetro-booth.jpg', 'event-jetro-booth.webp'),
    # ชมรมโยซาโค่ย (→ โซนอีเวนต์) + งานล่าม + Esport
    #   ★ ภาพสนามกีฬา + ภาพถ่ายลูกเสือ ถูกถอด 2026-07-20 รอบ 6 (เจ้าของสั่ง)
    ('cover', 'event-yosakoi.jpg', 'yosakoi.webp'),
    ('cover', 'interpreter.jpg', 'interpreter.webp'),
    ('cover', 'esport-bodin.jpg', 'esport-bodin.webp'),
    # ★ Book Expo Thailand 2025 — key visual ทางการจากหน้าอีเวนต์ของ QSNCC
    ('tall', 'bookexpo-2025.jpg', 'bookexpo.webp'),
    # ★ โซนงานเขียน 2026-07-20 รอบ 7 (ปกจาก tunwalai — ต้นฉบับ 250×316 เล็กมาก)
    ('tall', 'novel-cover.jpg', 'novel.webp'),
    # รูปโปรไฟล์เพจเครือข่าย (สี่เหลี่ยมจัตุรัส → tall)
    ('tall', 'net-pochi.jpg', 'net-pochi.webp'),
    ('tall', 'net-sheap.png', 'net-sheap.webp'),
    ('tall', 'net-omteen.jpg', 'net-omteen.webp'),
    ('tall', 'net-kagami.jpg', 'net-kagami.webp'),
    # ---- การ์ดโลโก้ (ทุกอันมาจากชุดมาตรฐาน logos/ ด้านยาว 1600px พื้นโปร่งใส) ----
    ('logo', 'stickyrice.webp', 'stickyrice.webp'),
    ('logo', 'cherrykiss.webp', 'cherrykiss.webp'),
    ('logo', 'tokyo-internship.webp', 'tokyo.webp'),
    ('logo', 'japan-internship.webp', 'japan-internship.webp'),
    ('logo', 'jtecs.webp', 'jtecs.webp'),
    ('logo', 'jamboree.webp', 'jamboree.webp'),
    ('logo', 'tni.webp', 'tni.webp'),
    ('logo', 'consolehub.webp', 'net-consolehub.webp'),
    ('logo', 'kadokawa.webp', 'net-kadokawa.webp'),
    ('logo', 'pasona.webp', 'pasona.webp'),
    ('logo', 'accenture.webp', 'accenture.webp'),
    ('logo', 'firstpagepro.webp', 'firstpagepro.webp'),
    ('logo', 'digitalhearts.webp', 'dh.webp'),
]

total = 0
for kind, src, dst in JOBS:
    fn = {'cover': cover, 'tall': tall, 'logo': logo}[kind]
    base = LOGOS if kind == 'logo' else SRC
    img = fn(os.path.join(base, src))
    out_path = os.path.join(OUT, dst)
    img.save(out_path, quality=82, method=6)
    kb = os.path.getsize(out_path) // 1024
    total += kb
    print(f'{kind:6} {src:28} -> slides/{dst:26} {img.size} {kb:>4}KB')

print(f'done: {len(JOBS)} slides @ {W}x{H} · รวม {total // 1024}.{(total % 1024) * 10 // 1024}MB')
