# ============================================
# gen_bg.py — พื้นหลังหน้า Title v3: แฟนตาซีสีฟ้า "ชัดตาแตก" แบบแยกเลเยอร์ (parallax 2.5D)
# ผลลัพธ์ 5 ไฟล์ใน assets/:
#   bg-sky.webp   — ท้องฟ้า (ดาว/ทางช้างเผือก/ออโรร่า/เมฆ) ไม่มีพระจันทร์
#   moon1.webp    — พระจันทร์ใหญ่ (RGBA + halo) แยกไว้ให้ JS ขยับขึ้นลง
#   moon2.webp    — พระจันทร์เล็กสีม่วงอ่อน (แฟนตาซี 2 ดวง)
#   bg-mid.webp   — ภูเขา 3 ชั้นไกล (RGBA โปร่งด้านบน)
#   bg-near.webp  — สันเขาหน้าสุด+แนวสน+ทะเลสาบสะท้อน (RGBA)
# ใช้: python tools/gen_bg.py [width height]  (ดีฟอลต์ 3840x2160)
# ============================================

import sys
import numpy as np
from PIL import Image, ImageFilter

W = int(sys.argv[1]) if len(sys.argv) > 2 else 3840
H = int(sys.argv[2]) if len(sys.argv) > 2 else 2160
PREFIX = sys.argv[3] if len(sys.argv) > 3 else 'assets/'

rng = np.random.default_rng(20260714)
WL = 0.76
WLpx = int(H * WL)
# ตำแหน่งพระจันทร์ "ตั้งต้น" ใช้อบแสง/เงาสะท้อน (JS วาดจริงที่ตำแหน่งใกล้เคียงกัน)
M1 = (W * 0.72, H * 0.19, H * 0.10)
M2 = (W * 0.22, H * 0.12, H * 0.045)


def smooth(t):
    return t * t * (3.0 - 2.0 * t)


def value_noise(w, h, fx, fy, r):
    gw, gh = int(fx) + 2, int(fy) + 2
    g = r.random((gh, gw), dtype=np.float32)
    xs = np.linspace(0, fx, w, endpoint=False, dtype=np.float32)
    ys = np.linspace(0, fy, h, endpoint=False, dtype=np.float32)
    xi = xs.astype(np.int32)
    yi = ys.astype(np.int32)
    xf = smooth(xs - xi)[None, :]
    yf = smooth(ys - yi)[:, None]
    g00 = g[np.ix_(yi, xi)]
    g10 = g[np.ix_(yi, xi + 1)]
    g01 = g[np.ix_(yi + 1, xi)]
    g11 = g[np.ix_(yi + 1, xi + 1)]
    return (g00 * (1 - xf) + g10 * xf) * (1 - yf) + (g01 * (1 - xf) + g11 * xf) * yf


def fbm(w, h, fx, fy, octaves=6, gain=0.5, lac=2.0, r=rng):
    out = np.zeros((h, w), np.float32)
    amp, total = 1.0, 0.0
    for _ in range(octaves):
        out += amp * value_noise(w, h, fx, fy, r)
        total += amp
        amp *= gain
        fx *= lac
        fy *= lac
    return out / total


def fbm1d(w, fx, octaves=5, gain=0.5, lac=2.0, r=rng):
    return fbm(w, 1, fx, 1, octaves, gain, lac, r)[0]


def bilinear_sample(img2d, x, y):
    h, w = img2d.shape
    x = np.clip(x, 0, w - 1.001)
    y = np.clip(y, 0, h - 1.001)
    x0 = x.astype(np.int32)
    y0 = y.astype(np.int32)
    xf = (x - x0).astype(np.float32)
    yf = (y - y0).astype(np.float32)
    return (img2d[y0, x0] * (1 - xf) * (1 - yf) + img2d[y0, x0 + 1] * xf * (1 - yf)
            + img2d[y0 + 1, x0] * (1 - xf) * yf + img2d[y0 + 1, x0 + 1] * xf * yf)


def mix(a, b, t):
    return a * (1 - t) + b * t


def col(r, g, b):
    return np.array([r, g, b], np.float32) / 255.0


def blur_map(arr, radius):
    im = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(radius)), np.float32) / 255.0


def paint_over(rgb, a, src_col, sa):
    """วางสี src (alpha=sa) ทับเลเยอร์ (rgb, a) แบบ source-over"""
    if src_col.ndim == 1:
        src_col = src_col[None, None, :]
    out_a = sa + a * (1 - sa)
    safe = np.maximum(out_a, 1e-6)[..., None]
    out_rgb = (src_col * sa[..., None] + rgb * (a * (1 - sa))[..., None]) / safe
    return out_rgb.astype(np.float32), out_a.astype(np.float32)


def grade(img):
    img = np.clip(img, 0, 1) ** 1.04 * 1.07
    return np.clip(img, 0, 1)


def save_webp(path, rgb, alpha=None, q=90, sharpen=True):
    rgb8 = (np.clip(rgb, 0, 1) * 255).astype(np.uint8)
    if alpha is None:
        im = Image.fromarray(rgb8, 'RGB')
    else:
        a8 = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
        im = Image.fromarray(np.dstack([rgb8, a8]), 'RGBA')
    if sharpen:
        im = im.filter(ImageFilter.UnsharpMask(radius=3, percent=110, threshold=2))
    im.save(path, quality=q, method=6)
    print('saved', path)


X, Y = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))

# ============================================================
# 1) SKY — ท้องฟ้า (ไม่มีพระจันทร์: JS วาดแยกให้ขยับได้)
# ============================================================
sky = np.zeros((H, W, 3), np.float32)
ty = np.clip(Y / (H * WL), 0, 1)
sky += mix(col(3, 9, 24), col(12, 34, 72), smooth(np.clip(ty / 0.6, 0, 1))[..., None])
sky += col(64, 130, 192) * (smooth(np.clip((ty - 0.3) / 0.7, 0, 1)) * 0.5)[..., None]
sky += (fbm(W, H, 4, 2, 3) - 0.5)[..., None] * 0.02

# ทางช้างเผือก
ang = -0.55
ca, sa_ = np.cos(ang), np.sin(ang)
Yr = -(X - W * 0.30) * sa_ + (Y - H * 0.28) * ca
band = np.exp(-(Yr / (H * 0.085)) ** 2).astype(np.float32)
mwneb = fbm(W, H, 13, 8, 6)
sky += (band * (0.3 + 0.7 * mwneb))[..., None] * col(120, 160, 235) * 0.18
lane = np.exp(-((Yr - H * 0.015) / (H * 0.02)) ** 2).astype(np.float32)
sky -= (lane * band * mwneb * 0.10)[..., None]

# ดาว (คมขึ้น: bloom รัศมีสั้น + แกนชัด)
stars = np.zeros((H, W), np.float32)
sx = rng.integers(0, W, 1700)
sy = (rng.random(1700) ** 1.5 * H * 0.62).astype(np.int64)
stars[sy, sx] = 0.15 + rng.random(1700).astype(np.float32) ** 4 * 0.85
mx_ = rng.integers(0, W, 6000)
my_ = (rng.random(6000) * H * 0.62).astype(np.int64)
keep = rng.random(6000) < band[my_, mx_] * 0.9
stars[my_[keep], mx_[keep]] = np.maximum(
    stars[my_[keep], mx_[keep]], 0.1 + rng.random(int(keep.sum())).astype(np.float32) ** 3 * 0.6)
for i in rng.choice(1700, 40, replace=False):
    x0, y0 = int(sx[i]), int(sy[i])
    if 1 <= x0 < W - 1 and 1 <= y0 < H - 1:
        stars[y0 - 1:y0 + 2, x0 - 1:x0 + 2] = np.maximum(stars[y0 - 1:y0 + 2, x0 - 1:x0 + 2], 0.5)
        stars[y0, x0] = 1.0
sky += (np.clip(stars + blur_map(stars, 2) * 0.8, 0, 1))[..., None] * col(212, 230, 255) * 1.05

# ม่านออโรร่า (แรงขึ้นเพื่อความแฟนตาซี)
def curtain(y0, height, strength, cx_frac, spread):
    path = fbm1d(W, 2.4)
    yc = H * y0 + (path - 0.5) * H * 0.14
    dy = (Y - yc[None, :]) / (H * height)
    fall = np.exp(-np.clip(dy, 0, None) * 2.6) * np.exp(-np.clip(-dy, 0, None) * 12)
    wx = fbm(W, H, 3, 2, 3)
    st = bilinear_sample(fbm(W, H, 120, 3, 4), X + (wx - 0.5) * W * 0.06, Y * 0.25)
    st = np.clip((st - 0.34) / 0.66, 0, 1) ** 1.6
    env = np.exp(-((X / W - cx_frac) / spread) ** 2)
    a = fall * st * env * strength
    cmap = mix(col(140, 255, 235), col(100, 140, 255), np.clip(dy * 0.8 + 0.5, 0, 1)[..., None])
    return a[..., None] * cmap

sky += curtain(0.13, 0.2, 0.62, 0.3, 0.34)
sky += curtain(0.28, 0.15, 0.34, 0.62, 0.3)

# สนามแสงจันทร์ (ใช้อบเมฆ/เขา — สองดวงรวมกัน)
d1 = np.sqrt((X - M1[0]) ** 2 + (Y - M1[1]) ** 2)
d2 = np.sqrt((X - M2[0]) ** 2 + (Y - M2[1]) ** 2)
moonlight = np.exp(-d1 / (H * 0.6)) + 0.35 * np.exp(-d2 / (H * 0.5))

# เมฆ (octave สูงขึ้น = เส้นสายชัดขึ้น)
w1 = fbm(W, H, 5, 3, 5)
w2 = fbm(W, H, 5, 3, 5)
cbase = fbm(W, H, 10, 5, 8)
cl = bilinear_sample(cbase, X + (w1 - 0.5) * W * 0.16, Y + (w2 - 0.5) * H * 0.22)
cl = np.clip((cl - 0.42) / 0.58, 0, 1) ** 1.4
cl *= np.clip(1.25 - (Y / (H * WL)) * 1.35, 0, 1)
cloud_col = mix(col(14, 28, 56), col(158, 206, 250), np.clip(0.22 + 0.78 * moonlight, 0, 1)[..., None])
sky = mix(sky, cloud_col, (cl * 0.8)[..., None])
sky = grade(sky)
sky += rng.normal(0, 0.004, sky.shape).astype(np.float32)

# ============================================================
# 2) MOON SPRITES — RGBA แยกดวง (JS วาดแบบ additive + ขยับได้)
# ============================================================
def moon_sprite(path, S, tint, halo_tint, seed, mare_contrast=0.3, craters=0, crescent=False):
    r_ = np.random.default_rng(seed)
    axx = np.arange(S, dtype=np.float32)
    XX, YY = np.meshgrid(axx, axx)
    c = S / 2
    R = S * 0.26
    d = np.sqrt((XX - c) ** 2 + (YY - c) ** 2)
    disc = 1 - smooth(np.clip((d - R * 0.96) / (R * 0.04), 0, 1))
    mare = fbm(S, S, 7, 7, 6, r=r_)          # mare ก้อนใหญ่แบบพระจันทร์จริง
    limb = np.sqrt(np.clip(1 - (d / R) ** 2, 0, 1))
    surf = ((1 - mare_contrast) + mare_contrast
            * smooth(np.clip((mare - 0.28) / 0.5, 0, 1))) * (0.72 + 0.28 * limb) * 1.06
    # หลุมอุกกาบาต: พื้นหลุมมืด + ขอบนูนสว่าง กระจายทั่วดวง
    if craters:
        r2 = np.random.default_rng(seed + 7)
        for _ in range(craters):
            aa = r2.random() * 2 * np.pi
            rr = R * (0.12 + 0.72 * np.sqrt(r2.random()))
            cx0 = c + np.cos(aa) * rr
            cy0 = c + np.sin(aa) * rr
            cr = R * (0.04 + 0.07 * r2.random())
            dd = np.sqrt((XX - cx0) ** 2 + (YY - cy0) ** 2)
            floor = 1 - smooth(np.clip((dd - cr * 0.7) / (cr * 0.4), 0, 1))
            rim = np.exp(-(((dd - cr) / (cr * 0.25)) ** 2))
            surf = surf * (1 - floor * 0.10) + rim * 0.05
    # โหมดเสี้ยวคราส: เงากลมกินดวงจากขวาบน — ด้านมืด+ขอบ halo ยังเรือง = แฟนตาซีจัด
    if crescent:
        sd = np.sqrt((XX - (c + R * 0.5)) ** 2 + (YY - (c - R * 0.2)) ** 2)
        shade = 1 - smooth(np.clip((sd - R * 0.85) / (R * 0.35), 0, 1))
        surf = surf * (1 - shade * 0.85)
    # บังคับ halo จางเป็นศูนย์ก่อนถึงขอบ sprite — กันเห็นกรอบสี่เหลี่ยมตอนวาด additive
    edge = smooth(np.clip((S * 0.5 - d) / (S * 0.12), 0, 1))
    halo = np.clip((np.exp(-np.maximum(d - R, 0) / (R * 0.45)) * 0.8
                    + np.exp(-(d / (R * 2.4)) ** 2) * 0.5) * (1 - disc), 0, 1) * edge
    rgb = tint[None, None, :] * np.clip(surf, 0, 1)[..., None] * disc[..., None] \
        + halo_tint[None, None, :] * halo[..., None]
    alpha = np.clip(disc + halo, 0, 1)
    save_webp(path, rgb, alpha, q=92, sharpen=True)

# ดวงใหญ่ = ขาวฟ้า มีหลุม 11 จุด / ดวงเล็ก = ชมพูกุหลาบ เสี้ยวคราส — ต่างกันสุดขั้ว
moon_sprite(PREFIX + 'moon1.webp', 1400, col(230, 243, 255), col(150, 198, 250), 11, 0.3, craters=7)
moon_sprite(PREFIX + 'moon2.webp', 800, col(255, 186, 212), col(255, 150, 200), 22, 0.4,
            craters=5, crescent=True)

# ============================================================
# 3) ภูเขา — mid (3 ชั้นไกล) / near (สันหน้า+สน) + คอมโพสิตไว้ทำเงาสะท้อน
# ============================================================
# comp = ฉากเต็มไว้คำนวณเงาสะท้อน (รวมพระจันทร์ตำแหน่งตั้งต้น)
comp = sky.copy()
for (mx0, my0, mr0), tint, halo_tint in [
        (M1, col(230, 243, 255), col(150, 198, 250)),
        (M2, col(255, 186, 212), col(255, 150, 200))]:
    dd = np.sqrt((X - mx0) ** 2 + (Y - my0) ** 2)
    disc = 1 - smooth(np.clip((dd - mr0 * 0.96) / (mr0 * 0.04), 0, 1))
    halo = (np.exp(-np.maximum(dd - mr0, 0) / (mr0 * 0.45)) * 0.8
            + np.exp(-(dd / (mr0 * 2.4)) ** 2) * 0.5) * (1 - disc)
    comp = mix(comp, tint[None, None, :] * 0.94, disc[..., None])
    comp += halo[..., None] * halo_tint

rock = fbm(W, H, 70, 40, 5)                     # เท็กซ์เจอร์ผิวหิน
lx = 0.45 + 0.55 * np.exp(-np.abs(X[0] / W - M1[0] / W) * 2.2)  # แสงเข้มฝั่งพระจันทร์

mid_rgb = np.zeros((H, W, 3), np.float32)
mid_a = np.zeros((H, W), np.float32)
near_rgb = np.zeros((H, W, 3), np.float32)
near_a = np.zeros((H, W), np.float32)
ridge_cols = [col(88, 130, 172), col(52, 88, 130), col(26, 52, 88), col(8, 20, 40)]
mist_col = col(125, 175, 220)

for k in range(4):
    t = k / 3.0
    base = H * (0.54 + 0.06 * k)
    amp = H * (0.05 + 0.03 * t)
    prof = fbm1d(W, 3.5 + k * 2.5, octaves=7)
    ridge = base - (prof - 0.35) * amp * 2.2
    if k == 3:
        trees = fbm1d(W, 160, octaves=3) ** 2.5 * H * 0.016
        ridge = ridge - trees
    dY = ridge[None, :] - Y
    mask = smooth(np.clip((-dY) / 2.5, 0, 1)) * (0.5 + 0.5 * t)
    # สีเขา: ผิวหิน + rim light ที่สันฝั่งพระจันทร์
    rim = np.clip(1 + dY / (H * 0.005), 0, 1) * (dY < 0)
    col_map = (ridge_cols[k][None, None, :]
               * (1 + (rock[..., None] - 0.5) * (0.25 + 0.45 * t))
               + (rim * lx[None, :] * (0.30 - 0.14 * t))[..., None] * col(185, 220, 255))
    mist = np.clip(1 - dY / (H * 0.05 + k * H * 0.012), 0, 1) * (dY > 0)
    if k < 3:
        mid_rgb, mid_a = paint_over(mid_rgb, mid_a, np.clip(col_map, 0, 1), mask)
        mid_rgb, mid_a = paint_over(mid_rgb, mid_a, mist_col, mist * (0.32 - 0.06 * k))
    else:
        near_rgb, near_a = paint_over(near_rgb, near_a, np.clip(col_map, 0, 1), mask)
        near_rgb, near_a = paint_over(near_rgb, near_a, mist_col, mist * 0.16)
    comp = mix(comp, np.clip(col_map, 0, 1), mask[..., None])
    comp += (mist * (0.15 - 0.02 * k))[..., None] * mist_col

# ============================================================
# 4) ทะเลสาบสะท้อน (อบลง layer near — น้ำเป็นของชั้นหน้าสุด)
# ============================================================
wh = H - WLpx
Yw = np.arange(wh, dtype=np.float32)[:, None]
depth = Yw / wh
rip = fbm(W, wh, 90, 14, 4)
xoff = (rip - 0.5) * (4 + 70 * depth)
yoff = (fbm(W, wh, 45, 26, 3) - 0.5) * (3 + 30 * depth)
Xw = np.arange(W, dtype=np.float32)[None, :] + xoff
sy_src = np.clip((WLpx - 1) - Yw * 1.15 + yoff, 0, WLpx - 2)
refl = np.stack([bilinear_sample(comp[..., c], Xw, sy_src) for c in range(3)], axis=-1)
refl = refl * (0.5 - 0.28 * depth)[..., None] + col(4, 10, 22) * (0.5 + 0.34 * depth)[..., None]
refl[..., 2] += 0.012
rip2 = fbm(W, wh, 90, 55, 3)
gx = np.exp(-(((Xw - M1[0]) / (M1[2] * (0.4 + depth * 1.7))) ** 2))
sparkle = np.clip(rip2 - 0.6, 0, 1) * 3.0
glitter = gx * (np.exp(-depth * 2.2) * 0.12 + sparkle * np.exp(-depth * 1.4) * 0.6)
refl += glitter[..., None] * col(205, 232, 255)
# มืดก้นจอให้ UI/กระติ๊บเด่น
refl *= (1 - smooth(np.clip((depth - 0.55) / 0.45, 0, 1)) * 0.4)[..., None]
near_rgb[WLpx:] = np.clip(refl, 0, 1)
near_a[WLpx:] = 1.0
near_rgb[WLpx - 2:WLpx + 2] += col(150, 200, 245) * 0.12
near_a[WLpx - 2:WLpx + 2] = np.maximum(near_a[WLpx - 2:WLpx + 2], 0.85)

# หิ่งห้อยริมน้ำ (อยู่ชั้น near)
ff = np.zeros((H, W), np.float32)
fx_ = rng.integers(int(W * 0.04), int(W * 0.96), 52)
fy_ = rng.integers(int(H * 0.7), int(H * 0.96), 52)
ff[fy_, fx_] = 0.5 + rng.random(52).astype(np.float32) * 0.5
ffl = (ff + blur_map(ff, 4) * 1.9)
near_rgb += ffl[..., None] * col(160, 235, 255)
near_a = np.maximum(near_a, np.clip(ffl * 2, 0, 1) * 0.9)

mid_rgb = grade(mid_rgb)
near_rgb = grade(near_rgb)

# ============================================================
# 5) SAVE
# ============================================================
save_webp(PREFIX + 'bg-sky.webp', sky, None, q=88)
save_webp(PREFIX + 'bg-mid.webp', mid_rgb, mid_a, q=88)
save_webp(PREFIX + 'bg-near.webp', near_rgb, near_a, q=88)
print(f'done ({W}x{H})')
