# ============================================
# gen_furniture.py — คริสตัล v2 (4 ดีไซน์ไม่ซ้ำกัน) + เฟอร์นิเจอร์สไปรต์ + โคมลอย
# สไตล์เพนต์ 4K ชุดเดียวกับ poring (SSAA 4x, seed ล็อก)
# ผลลัพธ์ใน assets/:
#   crystal-0.webp  ฟ้า "หอคู่"        — แท่งเรียวสูงคู่ โค้งสอบปลาย
#   crystal-1.webp  ชมพู "ดอกบาน"      — แท่งกางออกเป็นพัดเหมือนกลีบดอก
#   crystal-2.webp  ม่วง "จีโอด"       — หินผ่าเปิด ข้างในเรียงคริสตัลเรืองแสง
#   crystal-3.webp  ทอง "โทเท็มลอย"    — แท่งใหญ่แยก 3 ท่อนลอยซ้อนกลางอากาศ (JS ทำให้ลอย)
#   furn-bookshelf.webp / furn-trophy.webp / furn-desk.webp / furn-door.webp
#   lantern.webp — โคมไฟทองลอย
# ★ ตำแหน่งชิ้นส่วนไดนามิก (จอโต๊ะ/รูนประตู/ไอน้ำ) ต้องตรงกับ renderer.js
# ใช้: python tools/gen_furniture.py
# ============================================

import colorsys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SS = 4  # supersample


def hls(h, l, s):
    r, g, b = colorsys.hls_to_rgb((h % 360) / 360.0, l, s)
    return np.array([r, g, b], np.float32)


def col(r, g, b):
    return np.array([r, g, b], np.float32) / 255.0


def downsave(path, rgb, alpha, ss=SS, q=92):
    im = Image.fromarray(
        np.dstack([(np.clip(rgb, 0, 1) * 255).astype(np.uint8),
                   (np.clip(alpha, 0, 1) * 255).astype(np.uint8)]), 'RGBA')
    im = im.resize((im.width // ss, im.height // ss), Image.LANCZOS)
    im.save(path, quality=q, method=6)
    print('saved', path, im.size)


def smooth(t):
    return t * t * (3.0 - 2.0 * t)


# ============================================================
# CRYSTAL v2 — เรนเดอร์แท่งคริสตัลแบบ prism ต่อพิกเซล
# u = ตำแหน่งขวาง (-1..1), t = ตามแกน (0 ฐาน → 1 ปลาย)
# หน้าตัด 3 เหลี่ยม: ซ้ายมืด/กลางสว่าง/ขวากลางๆ + ขอบ fresnel + แกนเรือง
# ============================================================

def draw_spike(rgb, alpha, XX, YY, bx, by, tx, ty, w0, hue,
               light=1.0, back=False, core=0.8, taper=0.94):
    """taper=0.94 = ปลายแหลม / ~0.3 = ท่อนตัดปลาย (ใช้ทำโทเท็มซ้อนท่อน)"""
    dx, dy = tx - bx, ty - by
    length = np.sqrt(dx * dx + dy * dy)
    ux, uy = dx / length, dy / length
    px, py = -uy, ux
    t = ((XX - bx) * ux + (YY - by) * uy) / length
    d = (XX - bx) * px + (YY - by) * py
    wt = w0 * (1 - np.clip(t, 0, 1) ** 1.6 * taper)         # สอบปลายแบบโค้ง
    u = d / np.maximum(wt, 1e-3)
    inside = (np.abs(u) <= 1) & (t >= 0) & (t <= 1)
    if not inside.any():
        return
    tt = np.clip(t, 0, 1)

    # facet 3 หน้า (ซ้าย/กลาง/ขวา) ขอบคม + ไล่ตามแกน
    f_left = smooth(np.clip((-u - 0.25) / 0.12, 0, 1))
    f_right = smooth(np.clip((u - 0.18) / 0.12, 0, 1))
    shade = 0.95 - f_left * 0.58 - f_right * 0.34
    shade = shade * (0.42 + 0.75 * tt) * light

    c_deep = hls(hue, 0.20, 0.95)
    c_mid = hls(hue, 0.55, 0.92)
    c_top = hls(hue, 0.88, 0.9)
    sh = np.clip(shade, 0, 1.4)
    color = (c_deep[None, None, :] * np.clip(1 - sh, 0, 1)[..., None]
             + c_mid[None, None, :] * np.clip(sh, 0, 1)[..., None]
             + c_top[None, None, :] * np.clip(sh - 0.72, 0, 1)[..., None] * 1.1)

    # แกนเรืองในเนื้อ + ขอบ fresnel ขาว
    color += hls(hue, 0.9, 0.85)[None, None, :] * (
        np.exp(-(u / 0.3) ** 2) * (0.15 + 0.5 * tt) * core)[..., None]
    edge = smooth(np.clip((np.abs(u) - 0.82) / 0.14, 0, 1))
    color += (edge * (0.35 + 0.45 * tt))[..., None] * np.array([1, 1, 1], np.float32)

    if back:  # แท่งด้านหลัง: หม่นกว่า + อมฟ้า (หมอกระยะ)
        color = color * 0.62 + col(30, 40, 90)[None, None, :] * 0.25

    m = inside.astype(np.float32)
    rgb[...] = rgb * (1 - m[..., None]) + np.clip(color, 0, 2) * m[..., None]
    alpha[...] = np.maximum(alpha, m)


def crystal_canvas(S=512):
    G = S * SS
    yy, xx = np.mgrid[0:G, 0:G].astype(np.float32)
    return G, xx, yy, np.zeros((G, G, 3), np.float32), np.zeros((G, G), np.float32)


def rock_base(rgb, alpha, xx, yy, cx, by, w, hue):
    r_ = np.random.default_rng(int(hue))
    d = ((xx - cx) / w) ** 2 + ((yy - by) / (w * 0.28)) ** 2
    m = smooth(np.clip((1 - d) / 0.08, 0, 1))
    tex = 0.75 + 0.5 * np.clip(np.sin(xx * 0.01 + r_.random() * 9) * np.sin(yy * 0.013), -0.5, 0.5)
    base_c = col(24, 30, 58)[None, None, :] * tex[..., None]
    rim = smooth(np.clip((1 - d) / 0.08, 0, 1)) * smooth(np.clip((d - 0.55) / 0.45, 0, 1))
    base_c += (rim * 0.4)[..., None] * hls(hue, 0.6, 0.6)[None, None, :]
    rgb[...] = rgb * (1 - m[..., None]) + base_c * m[..., None]
    alpha[...] = np.maximum(alpha, m)


def finish_crystal(path, rgb, alpha, hue, tips, G):
    yy, xx = np.mgrid[0:G, 0:G].astype(np.float32)
    # ประกายดาวที่ยอด
    star = np.zeros((G, G), np.float32)
    for tx, ty, s in tips:
        dx = np.abs(xx - tx)
        dy = np.abs(yy - ty)
        star += np.clip(1 - (dx + dy * 5) / (G * 0.045 * s), 0, 1) ** 2.2
        star += np.clip(1 - (dx * 5 + dy) / (G * 0.045 * s), 0, 1) ** 2.2
    rgb += star[..., None] * np.array([1, 1, 1], np.float32)
    alpha = np.maximum(alpha, np.clip(star * 1.4, 0, 1))
    # sparkle เกล็ดในเนื้อ
    r_ = np.random.default_rng(int(hue) + 5)
    sp = (r_.random((G, G)) > 0.99985).astype(np.float32) * alpha
    spb = np.asarray(Image.fromarray((sp * 255).astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(G * 0.002)), np.float32) / 255.0
    rgb += (sp + spb * 1.5)[..., None] * np.array([1, 1, 1], np.float32) * 0.8
    # halo นุ่มรอบคลัสเตอร์
    halo = np.asarray(Image.fromarray((np.clip(alpha, 0, 1) * 255).astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(G * 0.035)), np.float32) / 255.0
    halo = halo * (1 - alpha) * 0.5
    rgb += halo[..., None] * hls(hue, 0.62, 0.9)[None, None, :]
    alpha = np.clip(alpha + halo, 0, 1)
    downsave(path, rgb, alpha)


def crystal_twin():  # 0 ฟ้า: หอคู่เรียวสูง
    hue = 187
    G, xx, yy, rgb, alpha = crystal_canvas()
    by = G * 0.90
    cx = G * 0.5
    rock_base(rgb, alpha, xx, yy, cx, by, G * 0.30, hue)
    draw_spike(rgb, alpha, xx, yy, cx + G * 0.14, by, cx + G * 0.23, by - G * 0.38,
               G * 0.05, hue, light=0.8, back=True)
    draw_spike(rgb, alpha, xx, yy, cx - G * 0.17, by, cx - G * 0.30, by - G * 0.30,
               G * 0.045, hue, light=0.75, back=True)
    draw_spike(rgb, alpha, xx, yy, cx - G * 0.06, by, cx - G * 0.14, by - G * 0.62,
               G * 0.075, hue, light=1.0)
    draw_spike(rgb, alpha, xx, yy, cx + G * 0.06, by, cx + G * 0.13, by - G * 0.80,
               G * 0.085, hue, light=1.12)
    finish_crystal('assets/crystal-0.webp', rgb, alpha, hue,
                   [(G * 0.13 + cx, by - G * 0.80, 1.2), (cx - G * 0.14, by - G * 0.62, 0.8)], G)


def crystal_bloom():  # 1 ชมพู: บานออกเหมือนกลีบดอก
    hue = 322
    G, xx, yy, rgb, alpha = crystal_canvas()
    by = G * 0.88
    cx = G * 0.5
    rock_base(rgb, alpha, xx, yy, cx, by, G * 0.34, hue)
    tips = []
    petals = [(-1.0, 0.34, 0.75), (1.0, 0.32, 0.75), (-0.55, 0.48, 0.9),
              (0.55, 0.46, 0.9), (0.0, 0.58, 1.15)]
    for k, (lean, hgt, li) in enumerate(petals):
        bx = cx + lean * G * 0.045
        tx = cx + lean * G * 0.26
        ty = by - hgt * G
        back = k < 2
        draw_spike(rgb, alpha, xx, yy, bx, by - G * 0.02, tx, ty,
                   G * (0.055 + 0.03 * (k == 4)), hue, light=li, back=back)
        if not back:
            tips.append((tx, ty, 0.7 + 0.4 * (k == 4)))
    finish_crystal('assets/crystal-1.webp', rgb, alpha, hue, tips, G)


def crystal_geode():  # 2 ม่วง: จีโอดผ่าตั้ง — เปลือกหิน ข้างในฟันคริสตัลอ้วนชี้ขึ้น
    hue = 268
    G, xx, yy, rgb, alpha = crystal_canvas()
    cx, cy = G * 0.5, G * 0.60
    # เปลือกหินทรงไข่
    d = ((xx - cx) / (G * 0.30)) ** 2 + ((yy - cy) / (G * 0.27)) ** 2
    shell = smooth(np.clip((1 - d) / 0.06, 0, 1))
    tex = 0.8 + 0.45 * (np.sin(xx * 0.008 + 3) * np.sin(yy * 0.011 + 1))
    rgb += col(30, 34, 62)[None, None, :] * (tex * shell)[..., None]
    alpha = np.maximum(alpha, shell)
    # โพรงมืด + ขอบเปลือกด้านในรับแสงม่วง
    d2 = ((xx - cx) / (G * 0.235)) ** 2 + ((yy - (cy - G * 0.01)) / (G * 0.21)) ** 2
    ring = smooth(np.clip((1 - d2) / 0.05, 0, 1)) * smooth(np.clip((d2 - 0.5) / 0.45, 0, 1))
    rgb += ring[..., None] * hls(hue, 0.55, 0.7)[None, None, :] * 0.55
    cav = smooth(np.clip((1 - d2) / 0.05, 0, 1))
    depth = np.clip(1 - d2, 0, 1)
    cave_c = (hls(hue, 0.13, 0.9)[None, None, :]
              + hls(hue, 0.4, 0.95)[None, None, :] * (depth ** 1.6)[..., None])
    rgb = rgb * (1 - cav[..., None]) + cave_c * cav[..., None]
    # แสงเรืองก้นโพรง (ใต้ฟันคริสตัล)
    gl = np.exp(-(((xx - cx) / (G * 0.17)) ** 2 + ((yy - (cy + G * 0.11)) / (G * 0.1)) ** 2))
    rgb += (gl * cav)[..., None] * hls(hue, 0.8, 0.95)[None, None, :] * 0.85
    # ฟันคริสตัลอ้วนชี้ขึ้นจากก้นโพรง (หลัง 2 ซี่ + หน้า 3 ซี่)
    tips = []
    teeth = [(-0.15, 0.20, 0.05, -0.5, True), (0.16, 0.19, 0.05, 0.55, True),
             (-0.09, 0.26, 0.06, -0.25, False), (0.09, 0.25, 0.06, 0.28, False),
             (0.0, 0.32, 0.07, 0.02, False)]
    for ox, hgt, w, lean, back in teeth:
        bx = cx + ox * G
        byy = cy + G * 0.155
        tx = bx + lean * hgt * G * 0.5
        ty = byy - hgt * G
        draw_spike(rgb, alpha, xx, yy, bx, byy, tx, ty, w * G, hue,
                   light=0.75 if back else 1.05, back=back, core=1.05)
        if not back:
            tips.append((tx, ty, 0.5))
    finish_crystal('assets/crystal-2.webp', rgb, alpha, hue, tips[-1:], G)


def crystal_totem():  # 3 ทอง: แท่งแยก 3 ท่อนลอยซ้อน (JS ทำให้โยกลอย)
    hue = 46
    G, xx, yy, rgb, alpha = crystal_canvas()
    by = G * 0.9
    cx = G * 0.5
    rock_base(rgb, alpha, xx, yy, cx, by, G * 0.26, hue)
    # ท่อนล่าง/กลาง = แท่งตัดปลาย เอียงสลับซ้ายขวา (ลอยหมุนคนละนิด) / ยอดแหลม
    segs = [(cx + G * 0.01, by - G * 0.02, cx - G * 0.025, by - G * 0.335, G * 0.115, 0.95, 0.30),
            (cx - G * 0.02, by - G * 0.40, cx + G * 0.045, by - G * 0.60, G * 0.09, 1.1, 0.28),
            (cx + G * 0.02, by - G * 0.66, cx - G * 0.01, by - G * 0.88, G * 0.068, 1.25, 0.94)]
    for bx, b, tx, t, w, li, tp in segs:
        draw_spike(rgb, alpha, xx, yy, bx, b, tx, t, w, hue, light=li, taper=tp, core=1.0)
    # แสงรั่วตามรอยแยก + ประกายรอบรอยแยก
    for gy in [by - G * 0.372, by - G * 0.632]:
        leak = np.exp(-((yy - gy) / (G * 0.014)) ** 2) * np.exp(-((xx - cx) / (G * 0.10)) ** 2)
        rgb += leak[..., None] * hls(hue, 0.88, 0.95)[None, None, :] * 1.35
        alpha = np.maximum(alpha, np.clip(leak * 1.4, 0, 1))
    finish_crystal('assets/crystal-3.webp', rgb, alpha, hue,
                   [(cx - G * 0.01, by - G * 0.88, 1.1),
                    (cx + G * 0.1, by - G * 0.372, 0.5),
                    (cx - G * 0.1, by - G * 0.632, 0.45)], G)


# ============================================================
# FURNITURE — สไปรต์เพนต์ (วาดใน "พิกัด world ของกล่อง obj + ขอบยื่น" × SS×2)
# ============================================================

class Painter:
    """ผืนวาดขนาด (world w+pads) × 2 × SS — มีตัวช่วย gradient/glow"""

    def __init__(self, w, h, padL, padT, padR, padB):
        self.scale = 2 * SS
        self.padL, self.padT = padL, padT
        self.W = int((w + padL + padR) * self.scale)
        self.H = int((h + padT + padB) * self.scale)
        self.img = Image.new('RGBA', (self.W, self.H), (0, 0, 0, 0))
        self.dr = ImageDraw.Draw(self.img)

    def px(self, x, y):  # world (สัมพัทธ์กับมุม obj) → พิกเซลผืน
        return ((x + self.padL) * self.scale, (y + self.padT) * self.scale)

    def s(self, v):
        return v * self.scale

    def rrect(self, x, y, w, h, r, fill):
        x0, y0 = self.px(x, y)
        self.dr.rounded_rectangle([x0, y0, x0 + self.s(w), y0 + self.s(h)],
                                  radius=self.s(r), fill=fill)

    def vgrad(self, x, y, w, h, c0, c1, r=0):
        """สี่เหลี่ยม (มุมโค้ง r) ไล่สีแนวตั้ง"""
        x0, y0 = self.px(x, y)
        gw, gh = int(self.s(w)), int(self.s(h))
        t = np.linspace(0, 1, gh, dtype=np.float32)[:, None, None]
        grad = (np.array(c0, np.float32)[None, None, :] * (1 - t)
                + np.array(c1, np.float32)[None, None, :] * t)
        grad = np.repeat(grad, gw, axis=1).astype(np.uint8)
        tile = Image.fromarray(grad, 'RGB').convert('RGBA')
        if r > 0:
            m = Image.new('L', (gw, gh), 0)
            ImageDraw.Draw(m).rounded_rectangle([0, 0, gw - 1, gh - 1], radius=self.s(r), fill=255)
            tile.putalpha(m)
        self.img.alpha_composite(tile, (int(x0), int(y0)))

    def glow(self, x, y, rad, color, strength=1.0):
        x0, y0 = self.px(x, y)
        rr = int(self.s(rad))
        lay = Image.new('RGBA', self.img.size, (0, 0, 0, 0))
        ImageDraw.Draw(lay).ellipse([x0 - rr, y0 - rr, x0 + rr, y0 + rr],
                                    fill=color + (int(180 * strength),))
        lay = lay.filter(ImageFilter.GaussianBlur(rr * 0.55))
        self.img.alpha_composite(lay)

    def save(self, path):
        arr = np.asarray(self.img, np.float32) / 255.0
        downsave(path, arr[..., :3], arr[..., 3], ss=SS)


WOOD_D = (34, 28, 62)
WOOD = (58, 48, 96)
WOOD_L = (84, 70, 132)
GOLD_D = (146, 96, 24)
GOLD = (232, 178, 64)
GOLD_L = (255, 232, 150)


def furn_bookshelf():  # obj 90×220
    p = Painter(90, 220, 10, 30, 10, 6)
    # เสาข้าง + ซุ้มโค้งบน
    p.dr.rounded_rectangle([*p.px(-6, -22), *[a + b for a, b in zip(p.px(-6, -22), (p.s(102), p.s(244)))]][:4],
                           radius=p.s(10), fill=WOOD_D)
    p.vgrad(-3, -19, 96, 238, WOOD, WOOD_D, r=8)
    # โค้งหน้าจั่ว + รูนพระจันทร์
    x0, y0 = p.px(45, -22)
    p.dr.pieslice([x0 - p.s(50), y0 - p.s(16), x0 + p.s(50), y0 + p.s(44)], 180, 360, fill=WOOD)
    p.glow(45, -12, 9, (140, 210, 255), 0.9)
    p.dr.ellipse([x0 - p.s(7), y0 + p.s(4), x0 + p.s(7), y0 + p.s(18)], fill=(190, 230, 255, 255))
    p.dr.ellipse([x0 - p.s(2), y0 + p.s(4), x0 + p.s(10), y0 + p.s(16)], fill=WOOD)
    # ชั้น 4 ชั้น + หนังสือ
    spines = [(102, 220, 255), (196, 140, 255), (255, 150, 214), (255, 214, 110), (150, 255, 210)]
    r_ = np.random.default_rng(9)
    for row in range(4):
        sy = 14 + row * 49
        p.vgrad(4, sy, 82, 44, (16, 14, 34), (30, 26, 56), r=3)   # ช่องมืดลึก
        bx = 8.0
        while bx < 76:
            bw = 7 + r_.random() * 8
            bh = 30 + r_.random() * 11
            tilt = r_.random() < 0.18
            c = spines[int(r_.random() * len(spines))]
            cc = tuple(int(v * (0.75 + r_.random() * 0.35)) for v in c)
            x1, y1 = p.px(bx, sy + 44 - bh)
            if tilt:
                p.dr.polygon([(x1, y1 + p.s(bh)), (x1 + p.s(bw), y1 + p.s(bh)),
                              (x1 + p.s(bw + 4), y1 + p.s(3)), (x1 + p.s(4), y1)],
                             fill=cc + (255,))
            else:
                p.dr.rounded_rectangle([x1, y1, x1 + p.s(bw), y1 + p.s(bh)],
                                       radius=p.s(1.4), fill=cc + (255,))
                p.dr.rectangle([x1 + p.s(bw * 0.25), y1 + p.s(3),
                                x1 + p.s(bw * 0.75), y1 + p.s(4.6)],
                               fill=(255, 255, 255, 120))
            bx += bw + 2.4
        # หิ้งไม้รับแสง
        p.vgrad(2, sy + 44, 86, 6, WOOD_L, WOOD_D, r=2)
    # ขวดยาเรืองบนหิ้งบนสุด (แทนหนังสือท้ายแถว)
    p.glow(76, 34, 7, (140, 255, 220), 0.8)
    p.vgrad(72, 34, 8, 22, (60, 220, 190), (20, 120, 110), r=3)
    p.rrect(74.4, 29, 3.2, 6, 1.4, (200, 240, 235, 255))
    p.save('assets/furn-bookshelf.webp')


def furn_trophy():  # obj 90×220
    p = Painter(90, 220, 10, 26, 10, 6)
    # โครงตู้ทอง + หลังตู้กำมะหยี่น้ำเงิน
    p.vgrad(-6, -18, 102, 240, GOLD, GOLD_D, r=10)
    p.vgrad(0, -12, 90, 228, (30, 26, 66), (16, 14, 40), r=7)
    # ยอดตู้: จั่วทอง + ดาว
    x0, y0 = p.px(45, -18)
    p.dr.polygon([(x0 - p.s(30), y0), (x0, y0 - p.s(10)), (x0 + p.s(30), y0)], fill=GOLD)
    p.glow(45, -22, 6, (255, 235, 170), 0.9)
    nicheH = 66
    for row in range(3):
        ny = 4 + row * (nicheH + 4)
        # ช่องบุกำมะหยี่ + สปอตไลต์จากบน
        p.vgrad(7, ny, 76, nicheH, (44, 38, 92), (18, 16, 44), r=5)
        p.glow(45, ny + 8, 26, (255, 240, 200), 0.35)
        p.vgrad(12, ny + nicheH - 9, 66, 9, GOLD_L, GOLD_D, r=3)  # แท่นวางทอง
    cx = 45
    # ชิ้นบน: ถ้วยทอง
    ny = 4
    p.glow(cx, ny + 34, 18, (255, 214, 110), 0.7)
    p.vgrad(cx - 13, ny + 14, 26, 17, GOLD_L, GOLD, r=8)          # ปากถ้วย
    p.dr.polygon([(*p.px(cx - 11, ny + 30),), (*p.px(cx + 11, ny + 30),),
                  (*p.px(cx + 4, ny + 44),), (*p.px(cx - 4, ny + 44),)], fill=GOLD)
    for sgn in (-1, 1):  # หูถ้วย
        bx0, by0 = p.px(cx + sgn * 16, ny + 16)
        p.dr.arc([bx0 - p.s(6), by0, bx0 + p.s(6), by0 + p.s(14)],
                 0, 360, fill=GOLD_L, width=int(p.s(2.4)))
    p.vgrad(cx - 9, ny + 46, 18, 6, GOLD_L, GOLD_D, r=2)
    p.dr.ellipse([*p.px(cx - 9, ny + 17), *p.px(cx - 3, ny + 24)], fill=(255, 250, 220, 200))
    # ชิ้นกลาง: เพชรดาวชมพู
    ny = 4 + nicheH + 4
    p.glow(cx, ny + 30, 16, (255, 150, 214), 0.8)
    for wf, cc in [(1.0, (255, 130, 205)), (0.55, (255, 190, 235))]:
        p.dr.polygon([(*p.px(cx, ny + 12),), (*p.px(cx + 12 * wf, ny + 30),),
                      (*p.px(cx, ny + 50),), (*p.px(cx - 12 * wf, ny + 30),)],
                     fill=cc + (255,))
    p.dr.line([*p.px(cx, ny + 12), *p.px(cx, ny + 50)], fill=(255, 255, 255, 170), width=int(p.s(1)))
    # ชิ้นล่าง: เหรียญรางวัลริบบิ้นฟ้า
    ny = 4 + (nicheH + 4) * 2
    for sgn in (-1, 1):
        p.dr.polygon([(*p.px(cx, ny + 12),), (*p.px(cx + sgn * 12, ny + 10),),
                      (*p.px(cx + sgn * 5, ny + 30),), (*p.px(cx, ny + 26),)],
                     fill=(90, 200, 255, 255) if sgn < 0 else (60, 150, 230, 255))
    p.glow(cx, ny + 36, 12, (120, 220, 255), 0.7)
    p.dr.ellipse([*p.px(cx - 10, ny + 26), *p.px(cx + 10, ny + 46)], fill=(240, 250, 255, 255))
    p.dr.ellipse([*p.px(cx - 6.5, ny + 29.5), *p.px(cx + 6.5, ny + 42.5)], fill=(140, 215, 255, 255))
    # เงากระจกหน้าตู้: แถบเฉียงโปร่ง 2 แถบ
    lay = Image.new('RGBA', p.img.size, (0, 0, 0, 0))
    dl = ImageDraw.Draw(lay)
    for off, wdt, al in [(0, 16, 46), (26, 7, 30)]:
        pts = [p.px(6 + off, 214), p.px(22 + off + wdt, -12), p.px(6 + off + wdt, -12), p.px(-10 + off, 214)]
        dl.polygon([c for pt in pts for c in pt][:8] if False else pts, fill=(255, 255, 255, al))
    p.img.alpha_composite(lay)
    p.save('assets/furn-trophy.webp')


def furn_desk():  # obj 200×100 — จอคริสตัลอยู่ (cx±40, y+10..48) ให้ JS วาดคลื่นทับ
    p = Painter(200, 100, 8, 38, 8, 6)
    cx = 100
    # ท็อปโต๊ะไม้ + ลายไม้ + ขอบเรือง
    p.vgrad(0, 0, 200, 100, WOOD_L, WOOD_D, r=12)
    r_ = np.random.default_rng(4)
    for k in range(9):
        yv = 8 + k * 10 + r_.random() * 4
        x0, y0 = p.px(6, yv)
        x1, _ = p.px(194, yv + r_.random() * 2)
        p.dr.line([x0, y0, x1, y0 + p.s(r_.random() * 2 - 1)],
                  fill=(30, 24, 55, 90), width=int(p.s(1.1)))
    # จอคริสตัลหกเหลี่ยมมน: กรอบเรือง + จอมืด (คลื่น = JS)
    p.glow(cx, 28, 40, (77, 200, 255), 0.35)
    p.vgrad(cx - 44, 6, 88, 46, (60, 200, 240), (20, 80, 140), r=9)
    p.vgrad(cx - 40, 10, 80, 38, (7, 16, 40), (10, 24, 56), r=7)
    p.vgrad(cx - 5, 52, 10, 8, (40, 60, 100), (20, 30, 60), r=2)   # ขาจอ
    p.vgrad(cx - 16, 59, 32, 4, (60, 90, 140), (30, 45, 80), r=2)
    # คีย์บอร์ดคริสตัล + ปุ่มเรือง
    p.vgrad(cx - 34, 66, 68, 17, (44, 52, 96), (24, 28, 60), r=4)
    for r in range(2):
        for k in range(8):
            x0, y0 = p.px(cx - 30 + k * 8, 68.5 + r * 6.5)
            cc = (120, 220, 255, 200) if (k + r) % 3 else (200, 160, 255, 200)
            p.dr.rounded_rectangle([x0, y0, x0 + p.s(6), y0 + p.s(4.6)], radius=p.s(1), fill=cc)
    # แก้วชา (ไอน้ำ = JS ที่ x+w-32, y+54)
    p.glow(168, 62, 9, (255, 190, 120), 0.5)
    p.vgrad(158, 56, 20, 24, (150, 90, 200), (90, 50, 130), r=5)
    p.dr.ellipse([*p.px(160, 55), *p.px(176, 61)], fill=(80, 40, 40, 255))
    bx0, by0 = p.px(179, 62)
    p.dr.arc([bx0 - p.s(2), by0, bx0 + p.s(7), by0 + p.s(10)], 270, 90, fill=(200, 170, 230, 255), width=int(p.s(2)))
    # ต้นไม้เรืองแสงจิ๋วซ้าย + ม้วนกระดาษ
    p.glow(26, 58, 10, (140, 255, 200), 0.6)
    p.vgrad(18, 70, 16, 12, (110, 70, 60), (70, 44, 40), r=3)
    for ang in [-0.5, 0, 0.5]:
        x0, y0 = p.px(26, 70)
        p.dr.line([x0, y0, x0 + p.s(np.sin(ang) * 12), y0 - p.s(10 + 4 * (ang == 0))],
                  fill=(120, 240, 190, 230), width=int(p.s(2)))
        p.dr.ellipse([x0 + p.s(np.sin(ang) * 12) - p.s(2.4), y0 - p.s(12 + 4 * (ang == 0)),
                      x0 + p.s(np.sin(ang) * 12) + p.s(2.4), y0 - p.s(7 + 4 * (ang == 0))],
                     fill=(160, 255, 215, 255))
    p.vgrad(42, 74, 22, 8, (225, 215, 240), (170, 160, 190), r=4)
    p.dr.ellipse([*p.px(40, 74), *p.px(46, 82)], fill=(240, 235, 250, 255))
    p.save('assets/furn-desk.webp')


def furn_door():  # obj 140×76 — รูน/ตราจันทร์เรือง = JS วาดตำแหน่งเดิม
    p = Painter(140, 76, 12, 46, 12, 4)
    cx = 70
    # ซุ้มหินโค้ง (กรอบนอก)
    x0, y0 = p.px(cx, 30)
    p.dr.pieslice([x0 - p.s(78), y0 - p.s(72), x0 + p.s(78), y0 + p.s(72)], 180, 360, fill=(52, 58, 96, 255))
    p.dr.rectangle([*p.px(-8, 28), *p.px(148, 76)], fill=(52, 58, 96, 255))
    x0, y0 = p.px(cx, 32)
    p.dr.pieslice([x0 - p.s(64), y0 - p.s(58), x0 + p.s(64), y0 + p.s(58)], 180, 360, fill=(30, 34, 62, 255))
    p.dr.rectangle([*p.px(6, 30), *p.px(134, 76)], fill=(30, 34, 62, 255))
    # หินก้อนเรียงตามโค้ง
    for k in range(7):
        ang = np.pi * (1 + (k + 0.5) / 7)
        sx = cx + np.cos(ang) * 71
        sy = 31 + np.sin(ang) * 65 * 0.98
        x0, y0 = p.px(sx, sy)
        p.dr.ellipse([x0 - p.s(7), y0 - p.s(5), x0 + p.s(7), y0 + p.s(5)],
                     fill=(72, 80, 124, 255))
    # บานประตูไม้คู่โค้ง (โทนอุ่นขึ้น ไม่ให้ดูเป็นกรง)
    WD = (86, 64, 118)
    WD_D = (52, 38, 78)
    x0, y0 = p.px(cx, 34)
    p.dr.pieslice([x0 - p.s(58), y0 - p.s(52), x0 + p.s(58), y0 + p.s(52)], 180, 360, fill=WD)
    p.vgrad(12, 32, 116, 44, WD, WD_D)
    # แผงบานเว้าข้างละ 1 แผง (inset panel) + ลายไม้จางๆ
    for sgn in (-1, 1):
        px0 = cx + sgn * 33
        x1, y1 = p.px(px0 - 20, 18)
        x2, y2 = p.px(px0 + 20, 70)
        p.dr.rounded_rectangle([min(x1, x2), y1, max(x1, x2), y2], radius=p.s(14),
                               fill=(WD_D[0] - 10, WD_D[1] - 8, WD_D[2] - 14, 255))
        p.dr.rounded_rectangle([min(x1, x2) + p.s(3), y1 + p.s(3),
                                max(x1, x2) - p.s(3), y2 - p.s(3)],
                               radius=p.s(11), fill=WD_D + (255,))
        for k in range(3):
            xv = px0 - 10 + k * 10
            xg, yg = p.px(xv, 24)
            _, yg2 = p.px(xv, 66)
            p.dr.line([xg, yg, xg + p.s(1), yg2], fill=(30, 24, 55, 55), width=int(p.s(1)))
    # เส้นแบ่งบานกลาง
    x0, y0 = p.px(cx, -16)
    p.dr.line([x0, y0, *p.px(cx, 76)], fill=(24, 18, 44, 220), width=int(p.s(2)))
    # มือจับวงแหวนทอง
    for sgn in (-1, 1):
        x0, y0 = p.px(cx + sgn * 11, 47)
        p.dr.arc([x0 - p.s(4.4), y0 - p.s(4.4), x0 + p.s(4.4), y0 + p.s(4.4)],
                 0, 360, fill=GOLD_L, width=int(p.s(1.8)))
        p.dr.ellipse([x0 - p.s(1.6), y0 - p.s(4.6), x0 + p.s(1.6), y0 - p.s(1.4)], fill=GOLD)
    # แสงลอดใต้ประตู
    lay = Image.new('RGBA', p.img.size, (0, 0, 0, 0))
    dl = ImageDraw.Draw(lay)
    dl.rectangle([*p.px(14, 73), *p.px(126, 76)], fill=(255, 170, 230, 150))
    lay = lay.filter(ImageFilter.GaussianBlur(p.s(2.4)))
    p.img.alpha_composite(lay)
    p.save('assets/furn-door.webp')


def lantern():  # โคมทองลอย — วาดที่ ~26×40 world
    p = Painter(26, 40, 8, 8, 8, 8)
    cx = 13
    p.glow(cx, 20, 16, (255, 200, 110), 0.55)
    # ห่วงบน + ฝา
    x0, y0 = p.px(cx, 2)
    p.dr.arc([x0 - p.s(4), y0 - p.s(6), x0 + p.s(4), y0 + p.s(2)], 0, 360,
             fill=GOLD_L, width=int(p.s(1.6)))
    p.dr.polygon([(*p.px(cx - 7, 6),), (*p.px(cx + 7, 6),), (*p.px(cx + 4, 2),),
                  (*p.px(cx - 4, 2),)], fill=GOLD)
    # ตัวโคมแก้ว: กรอบทอง 4 เสา + แก้วเรืองอุ่น
    p.vgrad(cx - 8, 6, 16, 24, (255, 226, 160), (200, 120, 50), r=5)
    p.vgrad(cx - 6, 8, 12, 20, (255, 246, 210), (255, 170, 80), r=4)
    p.glow(cx, 17, 6, (255, 250, 220), 0.95)
    for xv in [cx - 7.6, cx - 2.5, cx + 2.5, cx + 7.6]:
        x0, y0 = p.px(xv, 6)
        p.dr.line([x0, y0, x0, y0 + p.s(24)], fill=GOLD_D + (255,), width=int(p.s(1.2)))
    # ฐาน + ตุ้มห้อย
    p.dr.polygon([(*p.px(cx - 7, 30),), (*p.px(cx + 7, 30),), (*p.px(cx + 4, 34),),
                  (*p.px(cx - 4, 34),)], fill=GOLD)
    x0, y0 = p.px(cx, 36)
    p.dr.ellipse([x0 - p.s(1.8), y0 - p.s(1), x0 + p.s(1.8), y0 + p.s(2.6)], fill=GOLD_L)
    p.save('assets/lantern.webp')


if __name__ == '__main__':
    crystal_twin()
    crystal_bloom()
    crystal_geode()
    crystal_totem()
    furn_bookshelf()
    furn_trophy()
    furn_desk()
    furn_door()
    lantern()
    print('done')
