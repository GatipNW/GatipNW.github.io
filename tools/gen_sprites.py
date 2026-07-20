# ============================================
# gen_sprites.py — สไปรต์โปริ่งในห้องสตูดิโอ
# ★ v3 (2026-07-18 รอบสอง): เจ้าของวางภาพโปริ่ง RO ไว้ใน ฐานข้อมูล/ ("RO_poring 2.jpg")
#   → ใช้ภาพนั้นเป็นฐานจริง แล้ว "ดัดแปลงนิดหน่อย เปลี่ยนสีให้เข้ากับธีม":
#   - ตัดพื้นขาว (floodfill จากมุม กัน highlight ขาวในตัวโดนลบ)
#   - ทำ 4 สี: ชมพู (ต้นฉบับ) / ฟ้า / ม่วง / ทอง — หมุน hue เฉพาะพิกเซลที่มีสีสด
#   - แถวล่าง = หลับตายิ้ม (ตรวจจับตาดำอัตโนมัติ → ปิดด้วยสีตัว + วาดเส้นตาหลับ ∩)
# sheet: 1024×512 → ช่องละ 256×256, คอลัมน์ = ฟ้า/ชมพู/ม่วง/ทอง (ลำดับเดิมที่ renderer ใช้)
# วิธีรัน: python tools/gen_sprites.py   (ต้องมี pillow + numpy)
# ============================================
import colorsys
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'ฐานข้อมูล', 'RO_poring 2.jpg')
OUT = os.path.join(ROOT, 'assets', 'poring-sheet.webp')

CELL = 256

# ลำดับคอลัมน์ต้องตรง renderer.js: 0=ฟ้า 1=ชมพู 2=ม่วง 3=ทอง
# (ค่า = องศา hue เป้าหมายของ "เนื้อตัว" — ชมพูต้นฉบับ ~350°)
VARIANTS = [
    ('blue', 210.0, 1.0, 1.0),
    ('pink', None, 1.0, 1.0),      # None = คงสีต้นฉบับ
    ('purple', 268.0, 1.0, 1.0),
    ('gold', 42.0, 1.15, 0.99),    # ทอง: อิ่มสีขึ้นนิดให้ดูเป็นตัวแรร์
]


def cutout(src):
    """ตัดพื้นขาวด้วย floodfill จากมุม (เนื้อในตัวที่เป็นขาวไม่โดน) + feather ขอบ"""
    im = Image.open(src).convert('RGB')
    KEY = (0, 255, 0)
    for xy in [(2, 2), (im.width - 3, 2), (2, im.height - 3), (im.width - 3, im.height - 3)]:
        ImageDraw.floodfill(im, xy, KEY, thresh=42)
    arr = np.asarray(im)
    bg = (arr[..., 0] < 90) & (arr[..., 1] > 200) & (arr[..., 2] < 90)
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    # feather ขอบ 1px กันขอบหยักจาก jpg
    a_img = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(1.2))
    rgba = np.dstack([np.asarray(Image.open(src).convert('RGB')), np.asarray(a_img)])
    out = Image.fromarray(rgba, 'RGBA')
    ys, xs = np.where(np.asarray(a_img) > 20)
    return out.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def recolor(im, target_hue, sat_k=1.0, val_k=1.0):
    """หมุน hue เฉพาะพิกเซลสีสด (เนื้อตัวชมพู) — ตาดำ/ไฮไลต์ขาวคงเดิม"""
    arr = np.asarray(im).astype(np.float32) / 255.0
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    mx = np.max(arr[..., :3], axis=2)
    mn = np.min(arr[..., :3], axis=2)
    v = mx
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    if target_hue is None and sat_k == 1.0 and val_k == 1.0:
        return im.copy()
    # hue ปัจจุบันของแต่ละพิกเซล
    hsv = np.vectorize(colorsys.rgb_to_hsv)(r, g, b)
    h = hsv[0]
    if target_hue is not None:
        # เนื้อตัวชมพู hue ~0.97 — เลื่อนทั้งก้อนไป hue เป้าหมาย (รักษาระยะห่างสัมพัทธ์)
        base = 350.0 / 360.0
        dh = (target_hue / 360.0) - base
        h = (h + dh) % 1.0
    s2 = np.clip(s * sat_k, 0, 1)
    v2 = np.clip(v * val_k, 0, 1)
    # ผสมตามความสด: พิกเซลสีจาง (ตาดำ/ขาว) แทบไม่ขยับ
    w = np.clip(s * 2.4, 0, 1)
    rgb2 = np.vectorize(colorsys.hsv_to_rgb)(h, s2, v2)
    out = arr.copy()
    for i in range(3):
        out[..., i] = rgb2[i] * w + arr[..., i] * (1 - w)
    out[..., 3] = a
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), 'RGBA')


def find_eyes(im):
    """หา blob ตาดำ 2 ข้าง — จำกัดแถบความสูงช่วงกลางหน้า กันจับเงา/ปากพลาด"""
    arr = np.asarray(im).astype(np.float32)
    H = arr.shape[0]
    a = arr[..., 3] > 120
    v = arr[..., :3].max(axis=2) / 255.0
    s = (arr[..., :3].max(axis=2) - arr[..., :3].min(axis=2)) / np.maximum(arr[..., :3].max(axis=2), 1)
    dark = a & (v < 0.38) & (s < 0.6)
    dark[: int(H * 0.30)] = False   # เหนือแถบตา = เงา/ขอบ ไม่ใช่ตา
    dark[int(H * 0.64):] = False    # ใต้แถบตา = ปาก/เงาใต้ตัว
    ys, xs = np.where(dark)
    if len(xs) == 0:
        return []
    # แบ่งกลุ่มตามช่องว่างแกน X (ตา 2 ข้างเว้นช่องกลาง) แล้วเลือก 2 กลุ่มพิกเซลใหญ่สุด
    order = np.argsort(xs)
    xs_s, ys_s = xs[order], ys[order]
    gaps = np.where(np.diff(xs_s) > 6)[0]
    clusters = []
    start = 0
    for g in list(gaps) + [len(xs_s) - 1]:
        seg = slice(start, g + 1)
        if (g + 1 - start) > 150:
            clusters.append((xs_s[seg], ys_s[seg]))
        start = g + 1
    clusters.sort(key=lambda c: -len(c[0]))
    eyes = []
    for ex, ey in sorted(clusters[:2], key=lambda c: c[0].min()):
        x0, x1 = np.percentile(ex, [2, 98])
        y0, y1 = np.percentile(ey, [2, 98])
        w = float(x1 - x0)
        h = float(y1 - y0)
        # ตาข้างที่มีไฮไลต์ขาวใหญ่ พิกเซลดำจะเหลือแค่เสี้ยวล่าง → h เพี้ยน
        # ตาในภาพนี้เกือบกลม: บังคับ h จากความกว้าง แล้ววัดตำแหน่งจากขอบล่างขึ้นไป
        eh = max(h, w * 1.05)
        eyes.append((float((x0 + x1) / 2), float(y1) - eh / 2, w, eh))
    return eyes


def make_happy(im):
    """ปิดตา: ทาทับตาด้วยสีแก้มฝั่งใน แล้ววาดเส้นตาหลับโค้ง ∩"""
    im = im.copy()
    arr = np.asarray(im)
    dr = ImageDraw.Draw(im)
    W = im.width
    for (cx, cy, w, h) in find_eyes(im):
        # สีตัว: เก็บจากฝั่ง "ด้านในหน้า" ระดับเดียวกับตา (เลี่ยงแถบไฮไลต์ขาวด้านบน)
        inner = 1 if cx < W / 2 else -1
        sx = int(cx + inner * w * 1.35)
        patch = arr[int(cy) - 4:int(cy) + 4, sx - 5:sx + 5, :3]
        col = tuple(int(c) for c in np.median(patch.reshape(-1, 3), axis=0))
        # ทาทับตา (วงรีใหญ่กว่าตาเล็กน้อย)
        dr.ellipse([cx - w * 0.8, cy - h * 0.78, cx + w * 0.8, cy + h * 0.78], fill=col)
        # เส้นตาหลับ: โค้งคว่ำ ∩ สีเข้มโทนเดียวกับตา
        lw = max(3, int(w * 0.14))
        dr.arc([cx - w * 0.62, cy - h * 0.55, cx + w * 0.62, cy + h * 0.6],
               200, 340, fill=(58, 34, 40, 255), width=lw)
    return im


base = cutout(SRC)
# ย่อรอไว้ก่อนที่ขนาดใหญ่กว่า cell เล็กน้อย (คม + งานเร็ว)
scale = (CELL * 0.92) / max(base.width, base.height)
work = base.resize((round(base.width * scale * 2), round(base.height * scale * 2)), Image.LANCZOS)

sheet = Image.new('RGBA', (CELL * 4, CELL * 2), (0, 0, 0, 0))
for col, (kind, hue, sk, vk) in enumerate(VARIANTS):
    tinted = recolor(work, hue, sk, vk)
    for row, happy in enumerate((False, True)):
        art = make_happy(tinted) if happy else tinted
        art = art.resize((art.width // 2, art.height // 2), Image.LANCZOS)
        cell = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
        # วางกลาง ชิดล่าง (renderer วาง origin ที่ตีนสไปรต์)
        cell.paste(art, ((CELL - art.width) // 2, CELL - art.height - int(CELL * 0.04)), art)
        sheet.paste(cell, (col * CELL, row * CELL))
        print(f'{kind:7} {"happy" if happy else "idle "} ok')

sheet.save(OUT, lossless=False, quality=95)
print('saved', OUT, sheet.size)
