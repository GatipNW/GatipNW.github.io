# ============================================
# gen_slides.py — normalize ภาพ showcase ทุกใบเป็นมาตรฐานเดียว 1920×1080 (FULL HD)
# เจ้าของสั่ง 2026-07-18: "ทุกอันขนาดเท่ากัน อิง Wallpaper Wuthering Waves เป็นหลัก
# โลโก้องค์กรก็ต้องใหญ่เท่ากัน" + รอบสอง: "การ์ดโลโก้ดูไม่สวย ปรับให้สวยๆ"
# - photo  : crop เต็มเฟรม (cover) + sharpen เบาๆ
# - tall   : ภาพแนวตั้ง (ปกมังงะ/โปสเตอร์/Shorts) วางกลางบนพื้นหลังตัวเองเบลอ
# - logo   : ★ 2026-09-13 การ์ดม่วงเข้ม + แผ่นรองขาวนวลมุมมน + กรอบทองหม่นบาง (ธีม Moon Library)
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

# ★ 2026-09-13 ธีม Moon Library: ม่วงเข้ม × ทองหม่น × ขาวนวล (ธีมวาชิ×ชาดเดิมถูกแทนที่)
AI = (30, 24, 48)        # ม่วงเข้ม (พื้นการ์ด)
AI2 = (52, 42, 80)       # ม่วงกลาง (ไล่สีตรงกลาง)
KIN = (217, 181, 106)    # ทองหม่น
PAPER = (243, 236, 221)  # ขาวนวล (แผ่นรองโลโก้ — โลโก้สีเข้มยังอ่านออก)


def moon_bg():
    """การ์ดม่วงเข้ม: ไล่สว่างกลางการ์ด + ฝุ่นดาวจางๆ + vignette (แทนกระดาษวาชิเดิม)"""
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    t = np.clip(1 - d * 0.9, 0, 1)[..., None]
    base = np.array(AI, np.float32) * (1 - t) + np.array(AI2, np.float32) * t
    base += rng.normal(0, 2.0, (H, W, 1)).astype(np.float32)
    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))
    d2 = ImageDraw.Draw(img, 'RGBA')
    for _ in range(160):
        x, y = int(rng.uniform(0, W)), int(rng.uniform(0, H))
        r = rng.uniform(1, 2.6) * K
        d2.ellipse([x - r, y - r, x + r, y + r], fill=(235, 228, 255, int(rng.uniform(40, 120))))
    return img


# (seigaiha ลายคลื่นเซกาอิฮะ ถูกถอด 2026-09-13 — ธีมใหม่ไม่ใช้)


def gold_frame_v2(img, inset=None):
    """กรอบทองหม่นเส้นเดียว + วงเล็บมุมบาง (ลดของตกแต่ง — บรีฟ 2026-09-13)"""
    if inset is None:
        inset = round(40 * K)
    d = ImageDraw.Draw(img, 'RGBA')
    x0, y0, x1, y1 = inset, inset, W - inset, H - inset
    d.rectangle([x0, y0, x1, y1], outline=(*KIN, 150), width=max(1, round(2 * K)))
    L = round(60 * K)
    for cx, cy, sx, sy in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
        d.line([(cx, cy + sy * L), (cx, cy), (cx + sx * L, cy)], fill=(*KIN, 255), width=max(1, round(5 * K)))
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

    bg = moon_bg()
    lx, ly = (W - im.width) // 2, (H - im.height) // 2
    # แผ่นรองขาวนวลมุมมน (โลโก้สีเข้ม/ดำยังอ่านออกบนการ์ดม่วง) + เงานุ่ม
    pad = round(90 * K)
    px0, py0 = lx - pad, ly - pad
    px1, py1 = lx + im.width + pad, ly + im.height + pad
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([px0, py0 + round(18 * K), px1, py1 + round(18 * K)], round(28 * K), fill=(0, 0, 0, 110))
    sh = sh.filter(ImageFilter.GaussianBlur(round(22 * K)))
    bg.paste(sh, (0, 0), sh)
    ImageDraw.Draw(bg, 'RGBA').rounded_rectangle([px0, py0, px1, py1], round(28 * K), fill=(*PAPER, 255), outline=(*KIN, 200), width=max(1, round(2 * K)))

    bg.paste(im, (lx, ly), im)
    return gold_frame_v2(bg)


JOBS = [
    # (ชนิด, ไฟล์ต้นทาง, ไฟล์ปลายทาง) — ★ ปลายทางเป็น .webp ทั้งหมด (2026-07-20 รอบ 5)
    #   kind 'logo' อ่านจาก assets/showcase/logos/ (ชุดมาตรฐานพื้นโปร่งใส)
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
