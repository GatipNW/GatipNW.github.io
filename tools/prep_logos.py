# ============================================
# prep_logos.py — ทำ "ชุดโลโก้มาตรฐาน" ให้ทุกอันเท่ากันหมด (เจ้าของสั่ง 2026-07-20)
#   ปัญหาเดิม: ไฟล์โลโก้มาจากคนละที่ คนละขนาด (160px ถึง 3840px) บางอันพื้นขาวทึบ
#              → วางบนการ์ดวาชิ/การ์ดเข้มแล้วเห็นเป็นกล่องขาว ไม่สวย และคมไม่เท่ากัน
#   ผลลัพธ์:  assets/showcase/logos/<ชื่อ>.webp — ด้านยาว 1600px เท่ากันทุกไฟล์
#              พื้นหลังโปร่งใส (ลบพื้นขาวอัตโนมัติ) ตัดขอบว่างออกแล้ว
#
# วิธีลบพื้นขาว (ไม่มี scipy ในเครื่อง — เขียนเอง):
#   1) ย่อภาพเหลือ 256px แล้ว BFS จากขอบภาพ หา "บริเวณนอกโลโก้" ที่เป็นสีขาวต่อเนื่องกัน
#      → สีขาวที่อยู่ *ข้างใน* โลโก้ (เช่นในรูตัว O) ไม่โดนลบ
#   2) ขยาย mask กลับขนาดจริงแบบ bilinear = ขอบนุ่ม
#   3) ขอบภาพที่เป็น antialias ใช้ alpha ตามความเข้มของพิกเซล → ขอบไม่หยัก
#
# วิธีรัน:  python tools/prep_logos.py        (ต้องมี pillow + numpy)
# ★ รันซ้ำได้ ไม่ทำลายไฟล์ต้นทาง (อ่านจาก assets/showcase/ เขียนลง logos/ เท่านั้น)
# ============================================
import os
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'assets', 'showcase')
OUT = os.path.join(SRC, 'logos')          # ตัวใหญ่ — ใช้เป็นต้นทางให้ gen_slides.py
OUT_SM = os.path.join(OUT, 'sm')          # ตัวเล็ก — ตัวที่หน้าเว็บโหลดจริง
os.makedirs(OUT, exist_ok=True)
os.makedirs(OUT_SM, exist_ok=True)

LONG_SIDE = 1600     # ★ ด้านยาวมาตรฐานของโลโก้ทุกอัน
SMALL_SIDE = 320     # ด้านยาวของตัวเล็กที่ฝังใน DOM (พอสำหรับจอ dpr 3)
WHITE_TH = 232       # พิกเซลที่ทุกช่อง > ค่านี้ = ถือว่า "ขาว"
WORK = 256           # ความละเอียดที่ใช้หา mask (พื้นหลังเป็นสีเรียบ ใช้เล็กๆ ก็พอ)

# (ไฟล์ต้นทาง, ชื่อผลลัพธ์, โหมด)
#   auto = ตรวจเองว่าพื้นขาวไหม แล้วลบให้    keep = ห้ามลบพื้น (โลโก้ที่พื้นสีเป็นส่วนหนึ่งของดีไซน์)
JOBS = [
    ('accenture-logo.webp',        'accenture',        'auto'),
    ('afa-logo.png',               'afa',              'auto'),
    ('asobism-logo.png',           'asobism',          'auto'),
    ('bexide-logo.webp',           'bexide',           'auto'),
    ('cherrykiss-logo.png',        'cherrykiss',       'auto'),
    ('consolehub-logo.png',        'consolehub',       'auto'),
    ('src-cygames.png',            'cygames',          'auto'),   # ★ จาก Wikimedia SVG 1280px
    ('dh-ogp.png',                 'digitalhearts',    'auto'),
    ('fifine-logo.png',            'fifine',           'auto'),
    ('firstpagepro-logo.png',      'firstpagepro',     'auto'),
    ('holoindie-logo.webp',        'holoindie',        'auto'),
    ('jamboree-logo.png',          'jamboree',         'auto'),
    ('japan-internship-logo.jpg',  'japan-internship', 'auto'),
    ('jtecs-logo.png',             'jtecs',            'auto'),
    ('src-kadokawa.png',           'kadokawa',         'auto'),   # ★ จาก Wikimedia SVG 1280px
    ('kai-logo.jpg',               'kai',              'auto'),
    ('src-konami.png',             'konami',           'auto'),   # ★ จาก Wikimedia SVG 1280px
    ('magicmic-logo.png',          'magicmic',         'auto'),
    ('src-pasona.png',             'pasona',           'auto'),   # ★ จาก Wikimedia SVG 1280px
    ('pokemon-unite-cs.png',       'pokemon-unite',    'auto'),
    ('stickyrice-logo.png',        'stickyrice',       'auto'),
    ('tgs-logo.webp',              'tgs',              'keep'),   # การ์ดไล่สีของงาน = ตัวโลโก้เอง
    ('tni-logo.png',               'tni',              'auto'),
    ('tokyo-internship-logo.jpg',  'tokyo-internship', 'auto'),
]


def outside_mask(rgb):
    """BFS จากขอบภาพ หาบริเวณสีขาวต่อเนื่องที่เป็น 'พื้นหลัง' (คืน mask ขนาด WORK)"""
    small = Image.fromarray(rgb).resize((WORK, WORK), Image.BILINEAR)
    a = np.asarray(small).astype(np.int16)
    white = (a > WHITE_TH).all(axis=2)
    seen = np.zeros((WORK, WORK), dtype=bool)
    q = deque()
    for x in range(WORK):
        for y in (0, WORK - 1):
            if white[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    for y in range(WORK):
        for x in (0, WORK - 1):
            if white[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < WORK and 0 <= nx < WORK and white[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))
    return seen


def cut_white(im):
    """คืนภาพ RGBA ที่พื้นขาวรอบนอกกลายเป็นโปร่งใส (ขาวข้างในโลโก้ยังอยู่)"""
    rgb = np.asarray(im.convert('RGB'))
    h, w = rgb.shape[:2]
    edge = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    if (edge > WHITE_TH).all(axis=1).mean() < 0.80:
        return im.convert('RGBA'), False      # ขอบไม่ขาว = ไม่ใช่โลโก้พื้นขาว ปล่อยไว้

    om = outside_mask(rgb)
    om_full = np.asarray(
        Image.fromarray((om * 255).astype(np.uint8)).resize((w, h), Image.BILINEAR)
    ).astype(np.float32) / 255.0

    lum = rgb.max(axis=2).astype(np.float32)
    a_edge = np.clip((255.0 - lum) * 1.7, 0, 255)   # ยิ่งเข้ม ยิ่งทึบ = ขอบ antialias เนียน
    alpha = np.where(om_full > 0.5, a_edge, 255.0).astype(np.uint8)

    out = np.dstack([rgb, alpha])
    return Image.fromarray(out, 'RGBA'), True


def trim(im, pad_ratio=0.015):
    a = np.asarray(im)[..., 3]
    ys, xs = np.where(a > 8)
    if len(xs) == 0:
        return im
    p = int(max(im.width, im.height) * pad_ratio)
    box = (max(xs.min() - p, 0), max(ys.min() - p, 0),
           min(xs.max() + 1 + p, im.width), min(ys.max() + 1 + p, im.height))
    return im.crop(box)


def main():
    report = []
    for src, name, mode in JOBS:
        path = os.path.join(SRC, src)
        if not os.path.exists(path):
            print(f'  ⚠ ไม่พบไฟล์ {src}')
            continue
        im = Image.open(path).convert('RGBA')
        native = max(im.size)

        # ★★ ไฟล์ที่ "มี alpha อยู่แล้ว" ห้ามเอาไปตัดพื้นขาวซ้ำ (บั๊ก 2026-07-20 รอบ 6):
        #   ตราลูกเสือโลกเป็น PNG โปร่งใส แต่ค่า RGB ใต้พื้นโปร่งเป็นขาวตรงขอบ/ดำตรงกลาง
        #   → ด่านเช็ค "ขอบขาว" ผ่าน → ไปสร้าง alpha ใหม่จากความสว่าง → พื้นกลายเป็น
        #   ดำทึบทั้งแผ่น (เจ้าของแจ้งว่า "โลโก้ลูกเสือเป็นสีดำ")
        has_alpha = (np.asarray(im)[..., 3] < 8).mean() > 0.02
        if mode == 'keep' or has_alpha:
            cut = False
        else:
            im, cut = cut_white(im)
        im = trim(im)

        s = LONG_SIDE / max(im.size)
        im = im.resize((max(round(im.width * s), 1), max(round(im.height * s), 1)), Image.LANCZOS)
        if s > 1.25:
            # ขยายมาแล้ว → คมขึ้นนิดหน่อยกันภาพเบลอ
            # ★ ชาร์ปเฉพาะช่อง RGB — ห้ามชาร์ป alpha ด้วย ไม่งั้นได้ขอบขาวเป็นวงรอบตัวอักษร
            r, g, b, al = im.split()
            rgb_im = Image.merge('RGB', (r, g, b)).filter(
                ImageFilter.UnsharpMask(radius=1.4, percent=110, threshold=2))
            im = Image.merge('RGBA', (*rgb_im.split(), al))

        dst = os.path.join(OUT, f'{name}.webp')
        im.save(dst, lossless=True, quality=90, method=6)
        kb = os.path.getsize(dst) // 1024
        if kb > 260:   # โลโก้ที่มีไล่สี/ภาพถ่าย lossless แล้วใหญ่ → ใช้ lossy คุณภาพสูงแทน
            im.save(dst, quality=92, method=6)
            kb = os.path.getsize(dst) // 1024

        # ★ ตัวเล็กสำหรับวางใน DOM จริง (แถบค่ายเกม 22px · การ์ดเครือข่าย 88px ·
        #   การ์ดโลโก้ใหญ่ ~110px) — 320px พอสำหรับจอ dpr 3 แล้ว
        #   ★ ห้ามให้หน้าเว็บโหลดตัว 1600px ไปแสดงที่ 22px — เปลืองเป็นสิบเท่า
        sm = im.copy()
        k = SMALL_SIDE / max(sm.size)
        if k < 1:
            sm = sm.resize((max(round(sm.width * k), 1), max(round(sm.height * k), 1)), Image.LANCZOS)
        sm_path = os.path.join(OUT_SM, f'{name}.webp')
        sm.save(sm_path, quality=88, method=6)
        kb_sm = os.path.getsize(sm_path) // 1024

        report.append((name, native, round(s, 1), 'ตัดพื้นขาว' if cut else '-',
                       kb, kb_sm, im.size))

    print(f"{'logo':20} {'ต้นฉบับ':>8} {'ขยาย':>6} {'พื้นหลัง':>12} {'KB':>5} {'smKB':>5}  ขนาดผลลัพธ์")
    for r in report:
        print(f'{r[0]:20} {r[1]:>8} {r[2]:>5}x {r[3]:>12} {r[4]:>5} {r[5]:>5}  {r[6]}')
    weak = [r[0] for r in report if r[1] < 600]
    print(f'\nรวม {len(report)} โลโก้ · ด้านยาว {LONG_SIDE}px (ตัวเล็ก {SMALL_SIDE}px) เท่ากันหมด')
    if weak:
        print('★ ต้นฉบับเล็กกว่า 600px (ขยายมาแล้ว จะนุ่มกว่าตัวอื่น — ถ้ามีไฟล์ใหญ่กว่านี้ส่งมาได้):')
        print('  ' + ', '.join(weak))


if __name__ == '__main__':
    main()
