# ============================================
# gen_library.py — ฉาก "ห้องสมุดบนดวงจันทร์" (2026-09-13 · บรีฟฉบับรวม)
#
# อารมณ์: สงบ อบอุ่น มหัศจรรย์เล็กน้อย เป็นมืออาชีพ — ม่วงเป็นสีหลัก ทองเน้น
# ลด neon/bloom/particle · โลกนอกหน้าต่าง = จุดจำ แต่ไม่เด่นกว่าผลงาน
#
# ผลลัพธ์ (แยกชั้นตามบรีฟ — ไม่ใช่ภาพแบนใบเดียว):
#   assets/lib-view.webp  — วิวนอกหน้าต่าง (อวกาศ · ดาว · โลก · พื้นผิวดวงจันทร์) วาดล่างสุด
#                            ขนาดเท่าช่องหน้าต่าง + เผื่อขอบ → JS เลื่อนช้าๆ (parallax) ได้
#   assets/lib-base.webp  — พื้น + ผนัง + กรอบหน้าต่าง (RGBA · ช่องหน้าต่างโปร่งใส) + แสง/เงาอบ
# วัตถุ (ตู้เกม/ชั้นหนังสือ/โต๊ะ/ของตกแต่ง/ตัวละคร/ป้าย) = JS วาดสด → เรียงลึกได้ถูกต้อง
#
# ★ เรขาคณิตต้องตรงกับ js/world/map.js: 1400×900 · T=48 · NH=170 · window 330–1070 (top16 bot152 arc70)
# ใช้: python tools/gen_library.py   (เจนที่ 2x — worst case ของกล้อง 1.6×dpr2 = 3.2x แต่ฉากนี้
#      เป็นพื้นเรียบ/ไล่สี ไม่มีรายละเอียดถี่ ขยายแล้วไม่แตก · ไฟล์เล็กกว่า)
# ============================================
import os
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
S = 2
MW, MH = 1400, 900
W, H = MW * S, MH * S
T = 48 * S
NH = 170 * S
WIN = dict(x0=330 * S, x1=1070 * S, top=16 * S, bottom=152 * S, arc=70 * S)
SPAWN = (700 * S, 545 * S)
rng = np.random.default_rng(20260913)

# ---- จานสี (ม่วง × ทองหม่น × ขาวนวล) ----
FLOOR_DEEP = (34, 30, 46)      # เทาถ่านอมม่วง (ขอบห้อง)
FLOOR_MID = (64, 57, 84)       # พื้นกลางห้อง
FLOOR_LIT = (108, 98, 138)      # โดนแสงหน้าต่าง
WALL_DEEP = (28, 22, 42)
WALL_MID = (58, 48, 82)
WALL_LIT = (104, 86, 138)
GOLD = (196, 158, 84)
GOLD_DIM = (120, 96, 54)
MOON_BLUE = (150, 160, 230)    # แสงฟ้า–ม่วงอ่อนจากหน้าต่าง
WARM = (255, 196, 120)         # ไฟอ่านหนังสือ


def smooth(t):
    return t * t * (3.0 - 2.0 * t)


def value_noise(w, h, fx, fy, r):
    gw, gh = int(fx) + 2, int(fy) + 2
    g = r.random((gh, gw), dtype=np.float32)
    xs = np.linspace(0, fx, w, endpoint=False, dtype=np.float32)
    ys = np.linspace(0, fy, h, endpoint=False, dtype=np.float32)
    xi, yi = xs.astype(np.int32), ys.astype(np.int32)
    xf, yf = smooth(xs - xi)[None, :], smooth(ys - yi)[:, None]
    g00 = g[np.ix_(yi, xi)]
    g10 = g[np.ix_(yi, xi + 1)]
    g01 = g[np.ix_(yi + 1, xi)]
    g11 = g[np.ix_(yi + 1, xi + 1)]
    return (g00 * (1 - xf) + g10 * xf) * (1 - yf) + (g01 * (1 - xf) + g11 * xf) * yf


def fbm(w, h, fx, fy, octaves=5, gain=0.5, r=rng):
    out = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    for _ in range(octaves):
        out += amp * value_noise(w, h, fx, fy, r)
        tot += amp
        amp *= gain
        fx *= 2
        fy *= 2
    return out / tot


def col(c):
    return np.array(c, np.float32) / 255.0


def mix(a, b, t):
    t = np.asarray(t, np.float32)[..., None] if np.ndim(t) == 2 else t
    return a * (1 - t) + b * t


def blur(arr, radius):
    if radius <= 0:
        return arr
    im = Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(radius)), np.float32) / 255.0


def blur1(m, radius):
    return blur(np.repeat(m[..., None], 3, 2), radius)[..., 0]


def sstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


Y, X = np.mgrid[0:H, 0:W].astype(np.float32)


def window_mask():
    """mask ช่องหน้าต่างโค้ง (1 = ช่อง)"""
    x0, x1, top, bot, arc = WIN['x0'], WIN['x1'], WIN['top'], WIN['bottom'], WIN['arc']
    m = np.zeros((H, W), np.float32)
    inside = (X >= x0) & (X <= x1) & (Y >= top + arc) & (Y <= bot)
    m[inside] = 1
    # ส่วนโค้งด้านบน = ครึ่งวงรี
    cx, cy = (x0 + x1) / 2, top + arc
    rx, ry = (x1 - x0) / 2, arc
    ell = ((X - cx) / rx) ** 2 + ((Y - cy) / ry) ** 2
    m[(ell <= 1) & (Y < cy)] = 1
    return m


# =============== 1) วิวนอกหน้าต่าง ===============
def make_view():
    vw, vh = WIN['x1'] - WIN['x0'] + 80 * S, WIN['bottom'] - WIN['top'] + 40 * S
    vy, vx = np.mgrid[0:vh, 0:vw].astype(np.float32)
    sky = np.zeros((vh, vw, 3), np.float32)
    # อวกาศ: ดำอมม่วง ไล่ขึ้นบน + หมอกเนบิวลาม่วงจางมาก (ไม่ใช่นีออน)
    t = vy / vh
    sky += mix(col((14, 10, 28)), col((5, 4, 12)), (1 - t)[..., None])
    neb = fbm(vw, vh, 3, 2, 4)
    sky += col((70, 40, 110)) * (sstep(0.55, 0.9, neb) * 0.25)[..., None]
    # ดาว
    stars = np.zeros((vh, vw), np.float32)
    n = 420
    sx = rng.integers(0, vw, n)
    sy = rng.integers(0, int(vh * 0.78), n)
    mag = rng.random(n) ** 2.2
    for x, y, mg in zip(sx, sy, mag):
        stars[y, x] = 0.5 + mg
    big = blur1(stars, 1.6) * 3.2
    stars = np.clip(stars * 0.9 + big, 0, 1.4)
    sky += np.repeat(stars[..., None], 3, 2) * col((235, 232, 255))
    # โลก — ทรงกลมสีฟ้า มีเส้น terminator ด้านซ้ายมืด + ขอบบรรยากาศ
    ex, ey, er = vw * 0.70, vh * 0.40, 40 * S
    d = np.hypot(vx - ex, vy - ey) / er
    inside = d <= 1
    nz = np.sqrt(np.clip(1 - d * d, 0, 1))
    nx = (vx - ex) / er
    ny = (vy - ey) / er
    light = np.clip(nx * -0.55 + ny * -0.35 + nz * 0.75, 0, 1)   # แสงจากซ้ายบนไกลๆ
    land = fbm(vw, vh, 9, 6, 5, r=np.random.default_rng(7))
    ocean = col((40, 90, 190))
    landc = col((70, 130, 90))
    cloud = sstep(0.62, 0.8, fbm(vw, vh, 12, 8, 4, r=np.random.default_rng(9)))
    earth = mix(ocean, landc, sstep(0.52, 0.6, land))
    earth = mix(earth, col((240, 244, 255)), cloud * 0.85)
    earth = earth * (0.08 + 0.92 * light)[..., None]
    sky[inside] = earth[inside]
    halo = np.exp(-np.clip(d - 1, 0, 9) * 9) * (d > 0.97)
    sky += col((120, 170, 255)) * (halo * 0.55)[..., None]
    # พื้นผิวดวงจันทร์ (เนินเทา + หลุม) ที่ขอบล่างของวิว — เส้นขอบฟ้าโค้งนุ่ม
    x1d = np.arange(vw, dtype=np.float32)
    ridge = vh * 0.80 + 8 * S * np.sin(x1d / vw * 5.5) + 10 * S * fbm(vw, 1, 6, 1, 3)[0]
    ground = sstep(-3 * S, 3 * S, vy - ridge[None, :])
    reg = fbm(vw, vh, 18, 6, 4, r=np.random.default_rng(11))
    gcol = mix(col((92, 90, 104)), col((150, 146, 162)), reg * 0.8)
    # ไล่มืดลงล่าง + ขอบฟ้าสว่าง
    gcol = gcol * (1.05 - 0.5 * sstep(0, 1, (vy - ridge[None, :]) / (vh * 0.3)))[..., None]
    # หลุมอุกกาบาตเล็กๆ
    for _ in range(14):
        cx = rng.random() * vw
        cy = vh * 0.82 + rng.random() * vh * 0.16
        r = (4 + rng.random() * 12) * S
        dd = np.hypot(vx - cx, (vy - cy) * 1.8) / r
        rim = np.exp(-((dd - 1) ** 2) * 6) * 0.35
        bowl = (dd < 0.9) * 0.35
        gcol = gcol * (1 - bowl)[..., None] + col((200, 200, 215)) * rim[..., None] * 0.6
    sky = mix(sky, gcol, ground)
    # เงาสีฟ้า–ม่วงของบรรยากาศห้องกระทบกระจก (จางมาก)
    sky = sky * 0.92 + col((30, 24, 60)) * 0.08
    im = Image.fromarray(np.clip(sky * 255, 0, 255).astype(np.uint8))
    out = os.path.join(ROOT, 'assets', 'lib-view.webp')
    im.save(out, 'WEBP', quality=84, method=6)
    print('view', im.size, os.path.getsize(out) // 1024, 'KB')


# =============== 2) พื้น + ผนัง + กรอบหน้าต่าง + แสง ===============
def make_base():
    img = np.zeros((H, W, 3), np.float32)

    # ---- พื้น: แผ่นหินเทาถ่าน ตารางใหญ่ 140px + รอยต่อบาง + สุ่มความสว่างรายแผ่น ----
    tile = 140 * S
    tx = np.floor(X / tile)
    ty = np.floor(Y / tile)
    seed = (tx * 73 + ty * 131) % 97 / 97.0
    var = 0.94 + 0.12 * seed
    fx = (X % tile) / tile
    fy = (Y % tile) / tile
    seam = np.minimum(np.minimum(fx, 1 - fx), np.minimum(fy, 1 - fy)) * tile
    seamk = 1 - 0.22 * (1 - sstep(0, 2.2 * S, seam))          # ร่องบาง 2px
    grain = fbm(W, H, 14, 9, 4) * 0.10 + 0.95
    big = fbm(W, H, 3, 2, 3, r=np.random.default_rng(3))
    floor = mix(col(FLOOR_DEEP), col(FLOOR_MID), (0.35 + 0.65 * big)[..., None])
    floor = floor * (var * seamk * grain)[..., None]
    img[:] = floor

    # ---- แสงฟ้า–ม่วงอ่อนจากหน้าต่างทอดลงพื้น (ทรงสี่เหลี่ยมคางหมูบานออก) ----
    wx0, wx1 = WIN['x0'], WIN['x1']
    depth = np.clip((Y - NH) / (MH * S * 0.62), 0, 1)
    spread = 1 + depth * 0.9
    cx = (wx0 + wx1) / 2
    halfw = (wx1 - wx0) / 2 * spread
    inx = sstep(halfw + 40 * S, halfw - 60 * S, np.abs(X - cx))
    fall = (1 - depth) ** 1.6
    wash = inx * fall * (Y > NH)
    # เงาของเสากรอบ 2 เส้นบนพื้น (จางๆ) ให้รู้ว่าแสงมาจากหน้าต่าง
    for k in (1 / 3, 2 / 3):
        bx = wx0 + (wx1 - wx0) * k
        bar = np.exp(-((X - (cx + (bx - cx) * spread)) ** 2) / (2 * (7 * S * spread) ** 2))
        wash = wash * (1 - 0.35 * bar)
    wash = blur1(wash, 6 * S)
    img = mix(img, mix(col(FLOOR_LIT), col(MOON_BLUE), 0.42), (wash * 0.85)[..., None])

    # (ลายวงโคจรกลางห้อง — เจ้าของสั่งถอด 2026-09-13 · ลานกลางเป็นพื้นโล่งเฉยๆ)

    # ---- แสงอุ่นจากไฟอ่านหนังสือ (โต๊ะต้อนรับ · โคมมุมขวาล่าง) ----
    for (lx, ly, lr, la) in ((700, 690, 200, 0.42), (1300, 800, 150, 0.40),
                            (1072, 340, 90, 0.16), (1292, 340, 90, 0.16),
                            (1072, 560, 90, 0.16), (1292, 560, 90, 0.16),
                            (1072, 780, 90, 0.14), (1292, 780, 90, 0.14)):
        d = np.hypot(X - lx * S, (Y - ly * S) * 1.4) / (lr * S)
        pool = np.exp(-d * d * 2.2) * la
        img = mix(img, mix(img, col(WARM), 0.55), pool[..., None])

    # ---- ผนังซ้าย/ขวา/ล่าง: หน้าหินไล่สว่างเข้าหาห้อง + ขอบทองหม่น + AO เชิงผนัง ----
    d_l = X
    d_r = W - 1 - X
    d_b = H - 1 - Y
    d_edge = np.minimum(np.minimum(d_l, d_r), d_b)
    wallm = sstep(T + 1.5 * S, T - 1.5 * S, d_edge) * (Y >= NH - 2 * S)
    wt = np.clip(d_edge / T, 0, 1)               # 0 = ขอบนอกสุด, 1 = ขอบใน (ชิดห้อง)
    stone = fbm(W, H, 40, 26, 3, r=np.random.default_rng(5))
    wcol = mix(col(WALL_DEEP), col(WALL_LIT), (0.25 + 0.75 * wt ** 1.6)[..., None])
    wcol = wcol * (0.92 + 0.16 * stone)[..., None]
    img = mix(img, wcol, wallm[..., None])
    trim = sstep(T - 4.5 * S, T - 2.5 * S, d_edge) * sstep(T + 1.5 * S, T - 0.5 * S, d_edge) * (Y >= NH)
    img = mix(img, col(GOLD_DIM), (trim * 0.9)[..., None])
    ao = (1 - sstep(T, T + 34 * S, d_edge)) * (Y > NH) * (d_edge > T)
    img = img * (1 - 0.35 * ao)[..., None]

    # ---- ผนังเหนือ: หน้าผนังสูง 170 ไล่มืดขึ้นบน + แถบขอบทองที่ฐาน + ช่องหน้าต่าง ----
    nt = np.clip(Y / NH, 0, 1)
    ncol = mix(col(WALL_DEEP), col(WALL_MID), (0.25 + 0.75 * nt ** 1.4)[..., None])
    ncol = ncol * (0.92 + 0.16 * stone)[..., None]
    # แสงจากหน้าต่างสาดขึ้นผนังรอบกรอบ (ให้กรอบไม่ลอย)
    nm = (Y < NH).astype(np.float32)
    img = mix(img, ncol, nm[..., None])
    base = sstep(NH - 6 * S, NH - 3.5 * S, Y) * sstep(NH + 1.5 * S, NH - 0.5 * S, Y)
    img = mix(img, col(GOLD_DIM), (base * 0.9)[..., None])
    # เงาผนังเหนือทอดลงพื้น (ผนังหนา) + AO
    nshadow = (1 - sstep(NH, NH + 40 * S, Y)) * (Y >= NH)
    img = img * (1 - 0.38 * nshadow)[..., None]

    wm = window_mask()
    glow = blur1(wm, 18 * S) * (1 - wm)
    img = mix(img, col(MOON_BLUE), (glow * 0.35 * nm)[..., None])

    # กรอบหน้าต่าง: distance field ของ mask → แถบขอบทองหม่น + เสาแบ่ง 2 เส้น
    dist = blur1(wm, 3.5 * S)
    frame = 4 * dist * (1 - dist)
    frame = sstep(0.45, 0.85, frame)
    frame_col = mix(col(GOLD_DIM), col(GOLD), 0.45)
    # ขอบในกรอบมีไฮไลต์นิดหน่อย
    fr_shade = 0.75 + 0.5 * sstep(WIN['top'], WIN['bottom'], Y)
    img = mix(img, frame_col * fr_shade[..., None], frame[..., None])
    mull = np.zeros((H, W), np.float32)
    for k in (1 / 3, 2 / 3):
        bx = WIN['x0'] + (WIN['x1'] - WIN['x0']) * k
        mull = np.maximum(mull, sstep(3.5 * S, 2.0 * S, np.abs(X - bx)))
    mull = mull * wm
    img = mix(img, col(GOLD_DIM) * 0.9, mull[..., None])
    # ขอบหน้าต่างล่าง (sill) หนาหน่อย
    sill = sstep(WIN['bottom'] - 1 * S, WIN['bottom'] + 2 * S, Y) * sstep(WIN['bottom'] + 9 * S, WIN['bottom'] + 6 * S, Y)
    sill = sill * sstep(WIN['x0'] - 14 * S, WIN['x0'] - 8 * S, X) * sstep(WIN['x1'] + 14 * S, WIN['x1'] + 8 * S, X)
    img = mix(img, col(GOLD) * 0.8, sill[..., None])

    # ---- vignette เบาๆ ----
    vx = (X / W - 0.5) * 2
    vy = (Y / H - 0.5) * 2
    vig = 1 - 0.16 * np.clip(vx * vx * 0.9 + vy * vy * 0.9, 0, 1)
    img = img * vig[..., None]

    # ---- alpha: ช่องหน้าต่าง (ไม่รวมเสาแบ่ง) โปร่งใส ให้ vิวข้างหลังโผล่ ----
    alpha = 1 - wm * (1 - mull)
    rgba = np.concatenate([np.clip(img, 0, 1), alpha[..., None]], axis=2)
    im = Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA')
    out = os.path.join(ROOT, 'assets', 'lib-base.webp')
    im.save(out, 'WEBP', quality=82, method=6)
    print('base', im.size, os.path.getsize(out) // 1024, 'KB',
          'p99', np.percentile(np.clip(img, 0, 1) * 255, 99).round(1))


if __name__ == '__main__':
    make_view()
    make_base()
