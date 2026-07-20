# ============================================
# gen_sprites.py — สไปรต์ตัวละคร/ของประดับคุณภาพสูง (M4 polish รอบ 2)
# เรนเดอร์แบบ supersample 4x แล้วย่อ (SSAA) = ขอบคมไร้รอยหยัก "4K look"
# ผลลัพธ์ใน assets/:
#   poring-sheet.webp — สไลม์เจลลี่ 4 สี × 2 เฟรม (ตาเปิด/ตาหยียิ้ม) — shading 3D จริง
#   crystal-185/265/320.webp — คริสตัลเหลี่ยมคม 3 สี (ฟ้า/ม่วง/ชมพู) แกนเรือง+ฐานหิน
#   cat-peek.webp — แมวดำ chibi 2 เฟรม (ลืมตา/หลับตา) สำหรับ easter egg โผล่จากกระติ๊บ
# ใช้: python tools/gen_sprites.py
# ============================================

import colorsys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

rng = np.random.default_rng(20260716)


def col(r, g, b):
    return np.array([r, g, b], np.float32) / 255.0


def hls(h, l, s):
    r, g, b = colorsys.hls_to_rgb(h / 360.0, l, s)
    return np.array([r, g, b], np.float32)


def save_webp(path, rgb, alpha, q=92):
    rgb8 = (np.clip(rgb, 0, 1) * 255).astype(np.uint8)
    a8 = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    Image.fromarray(np.dstack([rgb8, a8]), 'RGBA').save(path, quality=q, method=6)
    print('saved', path)


def downsample(rgb, alpha, ss):
    im = Image.fromarray(
        np.dstack([(np.clip(rgb, 0, 1) * 255).astype(np.uint8),
                   (np.clip(alpha, 0, 1) * 255).astype(np.uint8)]), 'RGBA')
    im = im.resize((im.width // ss, im.height // ss), Image.LANCZOS)
    arr = np.asarray(im, np.float32) / 255.0
    return arr[..., :3], arr[..., 3]


# ============================================================
# 1) PORING SLIME — เจลลี่กลมป้อม shading แบบทรงกลม 3 มิติ
# ============================================================
# สูตร: มองตัวสไลม์เป็น height field ครึ่งทรงรี → คำนวณ normal ต่อพิกเซล
# → แสง 3 ดวง (key บนซ้าย / rim ฟ้าจากฉาก / bounce ล่าง) + specular 2 จุด + เนื้อโปร่งแสง

def render_poring(hue, happy):
    # v2 (2026-07-18 เจ้าของสั่ง "ให้เหมือนมอนในเกมออนไลน์"): ทรงเจลลี่ + หยดวุ้น
    # ยอดหัวแบบโปริ่ง MMO, normal จาก gradient ของ height field รวม, ขอบมืดแบบ
    # สไปรต์เกม, สีอิ่มฉ่ำ + แสงทะลุเนื้อ
    S = 1024  # เรนเดอร์ใหญ่แล้วย่อเหลือ 256
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    cx, cy = S * 0.5, S * 0.58
    rx, ry = S * 0.37, S * 0.30

    # height field ก้อนหลัก: ทรงรีฐานบานออก (เจลลี่นั่งกองกับพื้น)
    spread = 1 + 0.18 * np.clip((yy - cy) / ry, 0, 1) ** 1.5
    ex = (xx - cx) / (rx * spread)
    ey = (yy - cy) / ry
    z_body = np.sqrt(np.clip(1 - (ex ** 2 + ey ** 2), 0, 1)) * ry

    # หยดวุ้นยอดหัว (เอียงซ้ายนิดๆ) — เอกลักษณ์สไลม์ MMO
    tx_, ty_ = cx - S * 0.05, cy - ry * 1.06
    trx, try_ = rx * 0.30, ry * 0.42
    ex2 = (xx - tx_) / trx
    ey2 = (yy - ty_) / try_
    z_tip = np.sqrt(np.clip(1 - (ex2 ** 2 + ey2 ** 2), 0, 1)) * try_ * 0.9

    # รวมสองก้อนแบบนุ่ม (smooth max) ให้คอเชื่อมเนียนเป็นเนื้อเดียว
    k = S * 0.02
    Z = np.maximum(z_body, z_tip) + np.minimum(z_body, z_tip) * 0.35
    mask = np.clip(Z / k, 0, 1) ** 0.7

    # normal จาก gradient ของ height field (รองรับรูปทรงรวมอิสระ)
    gy, gx = np.gradient(Z)
    ln = np.sqrt(gx ** 2 + gy ** 2 + 1)
    nx, ny, nz = -gx / ln, -gy / ln, 1 / ln

    def dot_light(lx, ly, lz):
        n = np.sqrt(lx * lx + ly * ly + lz * lz)
        return np.clip(nx * (lx / n) + ny * (ly / n) + nz * (lz / n), 0, 1)

    base_deep = hls(hue, 0.40, 0.95)
    base_lit = hls(hue, 0.68, 0.95)
    base_hi = hls(hue, 0.87, 0.98)

    diff = dot_light(-0.45, -0.6, 0.62)                       # key: บนซ้าย
    rim = np.clip(1 - nz, 0, 1) ** 2.0                        # fresnel ขอบ
    bounce = dot_light(0.1, 0.85, 0.4) * 0.4                  # แสงเด้งจากพื้น

    rgb = base_deep[None, None, :] * 0.6
    rgb = rgb + base_lit[None, None, :] * (diff ** 1.15)[..., None] * 0.85
    rgb = rgb + base_hi[None, None, :] * bounce[..., None]
    rgb = rgb + col(180, 225, 255)[None, None, :] * (rim * 0.45)[..., None]  # rim ฟ้าจากฉาก

    # เนื้อเจลโปร่งแสง: แกนเรืองอุ่นกลางตัวล่าง (subsurface) + ไล่เข้มลงฐานให้ "หนัก"
    glow_d = ((xx - cx) / (rx * 0.7)) ** 2 + ((yy - (cy + ry * 0.3)) / (ry * 0.62)) ** 2
    rgb = rgb + base_hi[None, None, :] * np.exp(-glow_d * 1.5)[..., None] * 0.42
    rgb = rgb * (1 - (np.clip(ey, -0.2, 1) ** 2 * 0.16))[..., None]

    # specular เจลเงาวับ: โค้งใหญ่บนซ้าย + จุดคม + จุดเล็กบนหยดยอดหัว
    spec1 = dot_light(-0.42, -0.62, 0.66) ** 22
    spec2 = dot_light(-0.30, -0.72, 0.62) ** 240
    spec3 = np.exp(-(((xx - tx_ + trx * 0.25) / (trx * 0.34)) ** 2
                     + ((yy - ty_ + try_ * 0.25) / (try_ * 0.3)) ** 2))
    rgb = rgb + (spec1 * 0.4 + spec2 * 0.95 + spec3 * 0.5)[..., None] * np.ones(3, np.float32)

    # ขอบมืดรอบตัวแบบสไปรต์เกม (ink line นุ่มๆ) — อ่านชัดบนฉากทุกสี
    edge = np.clip(1 - Z / (k * 3.2), 0, 1) ** 1.6 * mask
    ink_c = hls(hue, 0.2, 0.85)
    rgb = rgb * (1 - edge[..., None] * 0.72) + ink_c[None, None, :] * edge[..., None] * 0.72

    rgb *= mask[..., None]
    alpha = mask.copy()

    # ---- หน้า (วาดบนเลเยอร์ PIL แล้ว composite) ----
    face = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    dr = ImageDraw.Draw(face)
    ex_, ey_ = S * 0.14, S * 0.05                             # ระยะตา
    eyy = cy - S * 0.05
    ink = (30, 22, 38, 255)
    if not happy:
        # ตากลมโตแบบมอน MMO: ขอบเข้ม + ม่านตาไล่สี + ไฮไลต์ 2 จุด
        for sgn in (-1, 1):
            x0 = cx + sgn * ex_
            w, h = S * 0.062, S * 0.098
            dr.ellipse([x0 - w, eyy - h, x0 + w, eyy + h], fill=ink)
            dr.ellipse([x0 - w * 0.72, eyy - h * 0.5, x0 + w * 0.72, eyy + h * 0.86],
                       fill=(72, 52, 88, 255))  # ม่านตาอมม่วงลึก
            dr.ellipse([x0 - w * 0.46, eyy - h * 0.66, x0 + w * 0.2, eyy - h * 0.06],
                       fill=(255, 255, 255, 245))
            dr.ellipse([x0 + w * 0.12, eyy + h * 0.3, x0 + w * 0.52, eyy + h * 0.66],
                       fill=(255, 255, 255, 150))
        # ปากยิ้มเล็ก
        mw = S * 0.05
        dr.arc([cx - mw, eyy + S * 0.075, cx + mw, eyy + S * 0.145],
               20, 160, fill=ink, width=int(S * 0.013))
    else:
        # ดีใจ: ตาหยี ^ ^ + ปากอ้ากว้างเห็นลิ้น (ท่าประจำสไลม์เกมออนไลน์)
        lw = int(S * 0.017)
        for sgn in (-1, 1):
            x0 = cx + sgn * ex_
            w, h = S * 0.06, S * 0.052
            dr.arc([x0 - w, eyy - h, x0 + w, eyy + h * 1.6], 200, 340, fill=ink, width=lw)
        mw = S * 0.062
        m0, m1 = eyy + S * 0.06, eyy + S * 0.16
        dr.chord([cx - mw, m0, cx + mw, m1], 10, 170, fill=ink)
        # ลิ้นชมพูโค้งในปาก
        dr.chord([cx - mw * 0.55, m0 + (m1 - m0) * 0.45, cx + mw * 0.55, m1 - (m1 - m0) * 0.02],
                 10, 170, fill=(255, 120, 150, 255))
    # แก้มชมพู
    blush = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    db = ImageDraw.Draw(blush)
    for sgn in (-1, 1):
        x0 = cx + sgn * S * 0.235
        db.ellipse([x0 - S * 0.05, eyy + S * 0.035 - S * 0.032,
                    x0 + S * 0.05, eyy + S * 0.035 + S * 0.032], fill=(255, 120, 160, 90))
    blush = blush.filter(ImageFilter.GaussianBlur(S * 0.02))
    face = Image.alpha_composite(blush, face)

    fa = np.asarray(face, np.float32) / 255.0
    fm = fa[..., 3:] * mask[..., None]                        # หน้าอยู่บนตัวเท่านั้น
    rgb = rgb * (1 - fm) + fa[..., :3] * fm

    return rgb, alpha


def build_poring_sheet():
    hues = [195, 325, 265, 45]  # ฟ้า / ชมพู / ม่วง / ทอง (โทน accent ของเว็บ)
    cell = 256
    sheet_rgb = np.zeros((cell * 2, cell * len(hues), 3), np.float32)
    sheet_a = np.zeros((cell * 2, cell * len(hues)), np.float32)
    for i, hue in enumerate(hues):
        for j, happy in enumerate([False, True]):
            rgb, a = render_poring(hue, happy)
            rgb, a = downsample(rgb, a, 4)
            sheet_rgb[j * cell:(j + 1) * cell, i * cell:(i + 1) * cell] = rgb
            sheet_a[j * cell:(j + 1) * cell, i * cell:(i + 1) * cell] = a
    save_webp('assets/poring-sheet.webp', sheet_rgb, sheet_a)


# ============================================================
# 2) CRYSTAL — คลัสเตอร์เหลี่ยมคม แสงไล่ตามหน้าตัด + แกนเรือง + ฐานหิน
# ============================================================

def facet_gradient_fill(dr, pts, c_base, c_tip, steps=28):
    """เติมสี่เหลี่ยม/สามเหลี่ยมแบบไล่สีตามแนวแกน (จากฐานมืด → ปลายสว่าง)"""
    # แบ่ง polygon เป็นแถบตามแกน y ของ centroid ฐาน→ปลาย
    base_y = max(p[1] for p in pts)
    tip_y = min(p[1] for p in pts)
    for k in range(steps):
        t0 = k / steps
        t1 = (k + 1) / steps
        y0 = base_y + (tip_y - base_y) * t0
        y1 = base_y + (tip_y - base_y) * t1
        c = tuple(int(v * 255) for v in (c_base * (1 - t0) + c_tip * t0))
        # clip polygon เป็นแถบแนวนอน — ใช้วิธีง่าย: วาดทั้งชิ้นซ้อนด้วย alpha ต่ำๆ ไม่ได้
        # จึงวาดเป็นแถบ trapezoid ตัดกับ bounding ของ polygon (ประมาณด้วย interpolation ขอบ)
        seg = _clip_band(pts, y1, y0)
        if seg:
            dr.polygon(seg, fill=c + (255,))


def _clip_band(pts, y_top, y_bot):
    """ตัด polygon (convex) ด้วยแถบ y ∈ [y_top, y_bot] แบบ Sutherland–Hodgman"""
    def clip_line(poly, yline, keep_below):
        out = []
        n = len(poly)
        for i in range(n):
            a = poly[i]
            b = poly[(i + 1) % n]
            ina = (a[1] >= yline) if keep_below else (a[1] <= yline)
            inb = (b[1] >= yline) if keep_below else (b[1] <= yline)
            if ina:
                out.append(a)
            if ina != inb:
                t = (yline - a[1]) / (b[1] - a[1])
                out.append((a[0] + (b[0] - a[0]) * t, yline))
        return out
    poly = clip_line(list(pts), y_top, True)
    if not poly:
        return None
    poly = clip_line(poly, y_bot, False)
    return poly if len(poly) >= 3 else None


def render_crystal(hue, seed):
    SS = 4
    S = 512 * SS
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    r_ = np.random.default_rng(seed)

    c_dark = hls(hue, 0.22, 0.9)
    c_mid = hls(hue, 0.52, 0.9)
    c_lit = hls(hue, 0.78, 0.95)
    c_white = hls(hue, 0.93, 0.85)

    base_y = S * 0.88
    cx = S * 0.5

    # แท่งคริสตัล: (offset ฐาน, สูง, กว้าง, เอียง) — หลัง→หน้า
    spikes = [
        (-S * 0.16, S * 0.42, S * 0.10, -0.30),
        (S * 0.17, S * 0.36, S * 0.11, 0.34),
        (-S * 0.30, S * 0.22, S * 0.075, -0.55),
        (S * 0.30, S * 0.20, S * 0.07, 0.6),
        (0, S * 0.62, S * 0.155, 0.02),          # แท่งหลักหน้าสุด
    ]
    tips = []
    for ox, hgt, w, lean in spikes:
        bx = cx + ox
        tx = bx + lean * hgt * 0.55
        ty = base_y - hgt
        tips.append((tx, ty))
        # หน้าตัด 3 เหลี่ยมแนวตั้ง: ซ้าย(มืด) กลาง(สว่างสุด) ขวา(กลาง)
        xs = [-0.5, -0.14, 0.16, 0.5]
        shades = [0.32, 1.0, 0.62]
        for f in range(3):
            p0 = (bx + xs[f] * w, base_y)
            p1 = (bx + xs[f + 1] * w, base_y)
            # ปลายสอบเข้าหา tip แบบมีคอ (ไหล่คริสตัล)
            sh_y = ty + hgt * 0.18
            q1 = (tx + xs[f + 1] * w * 0.5, sh_y)
            q0 = (tx + xs[f] * w * 0.5, sh_y)
            sh = shades[f]
            facet_gradient_fill(dr, [p0, p1, q1, q0],
                                c_dark * (0.5 + 0.5 * sh), c_mid * (0.35 + 0.75 * sh))
            # หน้าปลายแหลม (สว่างขึ้นอีกขั้น — รับแสงบน)
            facet_gradient_fill(dr, [q0, q1, (tx, ty)],
                                c_mid * (0.5 + 0.6 * sh), c_lit * (0.55 + 0.5 * sh))
        # เส้นสันเหลี่ยมสว่าง
        lw = max(2, int(S * 0.004))
        for xf in xs[1:3]:
            dr.line([(bx + xf * w, base_y), (tx + xf * w * 0.5, sh_y)],
                    fill=tuple(int(v * 255) for v in c_lit) + (200,), width=lw)
        dr.line([(tx + xs[0] * w * 0.5, sh_y), (tx, ty), (tx + xs[3] * w * 0.5, sh_y)],
                fill=tuple(int(v * 255) for v in c_white) + (230,), width=lw)

    arr = np.asarray(img, np.float32) / 255.0
    rgb = arr[..., :3]
    alpha = arr[..., 3]

    # แกนเรืองในเนื้อคริสตัล (แสงจากข้างใน) + bloom รอบตัว
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    core = np.zeros((S, S), np.float32)
    for tx, ty in tips:
        mx, my = tx, (ty + base_y) / 2  # กลางแท่ง
        gd = (xx - mx) ** 2 + ((yy - my) * 0.7) ** 2
        core += np.exp(-gd / (S * 0.05) ** 2) * 0.5
    inner = np.exp(-(((xx - cx) / (S * 0.16)) ** 2 + ((yy - base_y + S * 0.28) / (S * 0.22)) ** 2))
    corem = (core + inner * 0.9) * (alpha > 0.5)
    rgb = rgb + corem[..., None] * c_white[None, None, :] * 0.55

    # ประกายดาว 4 แฉกที่ปลายแท่งหลัก
    star = np.zeros((S, S), np.float32)
    for tx, ty in [tips[-1], tips[0]]:
        dx = np.abs(xx - tx)
        dy = np.abs(yy - ty)
        star += np.clip(1 - (dx + dy * 6) / (S * 0.05), 0, 1) ** 2
        star += np.clip(1 - (dx * 6 + dy) / (S * 0.05), 0, 1) ** 2
    rgb = rgb + star[..., None] * np.array([1, 1, 1], np.float32) * 0.85
    alpha = np.maximum(alpha, np.clip(star, 0, 1) * 0.9)

    # ฐานหินจันทร์ + เศษคริสตัลเล็ก
    imgb = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    db = ImageDraw.Draw(imgb)
    db.ellipse([cx - S * 0.36, base_y - S * 0.045, cx + S * 0.36, base_y + S * 0.055],
               fill=(26, 32, 60, 255))
    for _ in range(7):
        px = cx + (r_.random() - 0.5) * S * 0.6
        pr = S * (0.02 + r_.random() * 0.03)
        db.ellipse([px - pr, base_y - pr * 0.5, px + pr, base_y + pr * 0.7],
                   fill=(38, 46, 84, 255))
    ab = np.asarray(imgb, np.float32) / 255.0
    bm = ab[..., 3] * (1 - alpha)
    rgb = rgb + ab[..., :3] * bm[..., None]
    alpha = np.maximum(alpha, ab[..., 3])

    # halo เรืองรอบคลัสเตอร์
    halo_im = Image.fromarray((np.clip(alpha, 0, 1) * 255).astype(np.uint8))
    halo = np.asarray(halo_im.filter(ImageFilter.GaussianBlur(S * 0.03)), np.float32) / 255.0
    halo = halo * (1 - alpha) * 0.55
    rgb = rgb + halo[..., None] * c_mid[None, None, :]
    alpha = np.clip(alpha + halo, 0, 1)

    return downsample(rgb, alpha, SS)


# ============================================================
# 3) CAT — แมวดำ chibi ตาโตเรือง (easter egg โผล่จากกระติ๊บ)
# ============================================================

def render_cat(eyes_open):
    SS = 4
    S = 256 * SS
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    cx, cy = S * 0.5, S * 0.58
    R = S * 0.34

    fur = (19, 18, 28, 255)
    fur_hi = (46, 48, 72, 255)

    # หู 2 ข้าง (โค้งมน) + ในหูชมพู
    for sgn in (-1, 1):
        ex0 = cx + sgn * R * 0.62
        dr.polygon([(ex0 - sgn * R * 0.34, cy - R * 0.55),
                    (ex0 + sgn * R * 0.18, cy - R * 1.28),
                    (ex0 + sgn * R * 0.42, cy - R * 0.42)], fill=fur)
        dr.polygon([(ex0 - sgn * R * 0.14, cy - R * 0.62),
                    (ex0 + sgn * R * 0.14, cy - R * 1.05),
                    (ex0 + sgn * R * 0.28, cy - R * 0.52)], fill=(122, 62, 96, 255))
    # หัวกลมป้อม (กว้างกว่าสูงนิดๆ = น่ารัก)
    dr.ellipse([cx - R, cy - R * 0.92, cx + R, cy + R * 0.92], fill=fur)

    arr = np.asarray(img, np.float32) / 255.0
    rgb = arr[..., :3]
    alpha = arr[..., 3]

    # ไล่แสงบนหัว: บนสว่าง (แสงจันทร์) + rim ฟ้าขอบขวา
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    top_lit = np.clip(1 - (yy - (cy - R)) / (R * 1.6), 0, 1) ** 2
    rgb = rgb + col(46, 48, 72)[None, None, :] * top_lit[..., None] * alpha[..., None]
    edge_d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    side = np.clip((xx - cx) / (R * 0.9), 0, 1)  # ค่อยๆ จางเข้ากลาง — ห้าม mask แข็งเดี๋ยวเป็นตะเข็บ
    rim = np.exp(-((edge_d - R * 0.94) / (R * 0.07)) ** 2) * side * alpha
    rgb = rgb + rim[..., None] * col(90, 160, 235) * 0.5

    img2 = Image.fromarray(np.dstack([(np.clip(rgb, 0, 1) * 255).astype(np.uint8),
                                      (alpha * 255).astype(np.uint8)]), 'RGBA')
    dr = ImageDraw.Draw(img2)

    eye_y = cy - R * 0.05
    if eyes_open:
        for sgn in (-1, 1):
            ex0 = cx + sgn * R * 0.42
            w, h = R * 0.30, R * 0.36
            # ตาเหลืองทอง ไล่สีด้วยวงซ้อน + ม่านตาเรียว + ไฮไลต์โต
            dr.ellipse([ex0 - w, eye_y - h, ex0 + w, eye_y + h], fill=(255, 196, 64, 255))
            dr.ellipse([ex0 - w * 0.82, eye_y - h * 0.78, ex0 + w * 0.82, eye_y + h * 0.85],
                       fill=(255, 228, 120, 255))
            dr.ellipse([ex0 - w * 0.22, eye_y - h * 0.72, ex0 + w * 0.22, eye_y + h * 0.8],
                       fill=(24, 20, 30, 255))
            dr.ellipse([ex0 - w * 0.4, eye_y - h * 0.62, ex0 + w * 0.05, eye_y - h * 0.12],
                       fill=(255, 255, 255, 240))
    else:
        # หลับตายิ้ม ︶︶
        lw = int(S * 0.018)
        for sgn in (-1, 1):
            ex0 = cx + sgn * R * 0.42
            w, h = R * 0.28, R * 0.2
            dr.arc([ex0 - w, eye_y - h * 0.4, ex0 + w, eye_y + h * 1.2],
                   200, 340, fill=(255, 208, 96, 255), width=lw)

    # จมูก + ปาก ω + หนวด
    dr.polygon([(cx - R * 0.07, cy + R * 0.3), (cx + R * 0.07, cy + R * 0.3),
                (cx, cy + R * 0.4)], fill=(255, 140, 170, 255))
    lw = int(S * 0.01)
    mw = R * 0.14
    dr.arc([cx - mw * 2, cy + R * 0.36, cx, cy + R * 0.52], 0, 150, fill=(150, 150, 175, 220), width=lw)
    dr.arc([cx, cy + R * 0.36, cx + mw * 2, cy + R * 0.52], 30, 180, fill=(150, 150, 175, 220), width=lw)
    for sgn in (-1, 1):
        for k in range(3):
            y0 = cy + R * (0.14 + k * 0.13)
            dr.line([(cx + sgn * R * 0.88, y0), (cx + sgn * R * 1.22, y0 - R * (0.08 - k * 0.08))],
                    fill=(200, 212, 240, 80), width=max(2, int(S * 0.004)))

    arr = np.asarray(img2, np.float32) / 255.0
    return downsample(arr[..., :3], arr[..., 3], SS)


def build_cat():
    cell = 256
    sheet_rgb = np.zeros((cell, cell * 2, 3), np.float32)
    sheet_a = np.zeros((cell, cell * 2), np.float32)
    for j, open_ in enumerate([True, False]):
        rgb, a = render_cat(open_)
        sheet_rgb[:, j * cell:(j + 1) * cell] = rgb
        sheet_a[:, j * cell:(j + 1) * cell] = a
    save_webp('assets/cat-peek.webp', sheet_rgb, sheet_a)


# หมายเหตุ: คริสตัลย้ายไป tools/gen_furniture.py แล้ว (v2 — 4 ดีไซน์ crystal-0..3.webp)
if __name__ == '__main__':
    build_poring_sheet()
    build_cat()
    print('done')
