# ============================================
# gen_room.py — ฉากห้องสตูดิโอ "โพรงในดวงจันทร์" แบบภาพเจนสมจริง (M4 แผน A)
# เทคนิคชุดเดียวกับ gen_bg.py (fbm noise + rim light + UnsharpMask) — seed ล็อก
# ผลลัพธ์ 2 ไฟล์ใน assets/:
#   room-base.webp — พื้น+ผนังหินจันทร์ทั้งห้อง (RGB, เจน 2x ของ world = คมบน retina)
#     * หน้าต่าง 3 บานอบเฉพาะ "วิวนิ่ง" (ฟ้า/ดาว/เขา) — พระจันทร์/มังกร/ดาวตก JS วาดสด
#   room-fg.webp   — เพดานถ้ำ/หินย้อยยื่นจากขอบ (RGBA) JS วาดทับสุดพร้อม parallax กลับทิศ
# ★ เรขาคณิตต้องตรงกับ js/engine/renderer.js: WALL_H=110, หน้าต่าง x=470/815/1160 w=130,
#   T=24, CRYSTALS, spawn=(800,500) — ถ้าแก้ฝั่ง JS ต้องแก้ที่นี่ด้วย
# ใช้: python tools/gen_room.py
# ============================================

import numpy as np
from PIL import Image, ImageFilter

# world px ของห้อง (map.js) และสเกลภาพ
MW, MH = 1600, 1000
S = 2                       # เจน 2x
W, H = MW * S, MH * S

WALL_H = 110 * S
T = 24 * S                  # ความหนากำแพง collision
WINDOWS = [470, 815, 1160]  # x ซ้ายของหน้าต่าง (world px)
WIN_W = 130
WIN_TOP = 14
WIN_BOT = 98                # NORTH_WALL_H - 12
ARC_H = 34
SPAWN = (800, 530)  # = MAP.spawn.y 500 + 30 (ย้าย 2026-07-20)          # จุดวงเวท (spawn.y + 30)
# (คริสตัลมุมห้องถูกถอดออกแล้ว 2026-07-16 — ไม่อบแสงมุมห้องอีก)

rng = np.random.default_rng(20260715)


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


def fbm1d(w, fx, octaves=5, r=rng):
    return fbm(w, 1, fx, 1, octaves, r=r)[0]


def mix(a, b, t):
    return a * (1 - t) + b * t


def col(r, g, b):
    return np.array([r, g, b], np.float32) / 255.0


def blur_map(arr, radius):
    im = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(radius)), np.float32) / 255.0


def save_webp(path, rgb, alpha=None, q=88):
    rgb8 = (np.clip(rgb, 0, 1) * 255).astype(np.uint8)
    if alpha is None:
        im = Image.fromarray(rgb8, 'RGB')
    else:
        a8 = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
        im = Image.fromarray(np.dstack([rgb8, a8]), 'RGBA')
    im = im.filter(ImageFilter.UnsharpMask(radius=3, percent=110, threshold=2))
    im.save(path, quality=q, method=6)
    print('saved', path)


X, Y = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))

# ============================================================
# 1) พื้นหินจันทร์
# ============================================================
img = np.zeros((H, W, 3), np.float32)

# แสงรวมกลางห้อง (สว่างกลาง มืดขอบ) + เท็กซ์เจอร์หิน 2 สเกล
cx0, cy0 = W / 2, H * 0.55
dcenter = np.sqrt((X - cx0) ** 2 + (Y - cy0) ** 2)
light = np.exp(-(dcenter / (W * 0.52)) ** 2)
rock_hi = fbm(W, H, 90, 56, 5)     # เกรนหินละเอียด
rock_lo = fbm(W, H, 14, 9, 5)      # ก้อนสว่าง/มืดใหญ่ (แบบ mare บนดวงจันทร์)
floor_col = mix(col(30, 38, 70), col(62, 76, 118), (light * 0.85)[..., None])
floor_col *= (0.88 + 0.24 * rock_hi + (rock_lo - 0.5) * 0.3)[..., None]
img += floor_col

# ร่องหินเป็นเส้นสาย (ridge noise) จางๆ ให้ผิวดูมีชั้นหิน
ridge = np.abs(fbm(W, H, 26, 16, 5) - 0.5) * 2
img *= (1 - np.clip(0.10 - ridge, 0, 1) * 1.0)[..., None]

# แสงสาดจากหน้าต่าง 3 บาน: ลำแสงจันทร์ตกบนพื้น (อบไว้ — JS เติม ray เต้นทีหลัง)
for wx in WINDOWS:
    bx = (wx + WIN_W / 2) * S
    beam_cx = bx + (Y - WALL_H) * 0.10                       # เอียงลงขวานิด
    beam = np.exp(-(((X - beam_cx) / (WIN_W * S * 0.62)) ** 2))
    fall = np.exp(-np.clip(Y - WALL_H, 0, None) / (H * 0.24))
    img += (beam * fall * 0.16)[..., None] * col(170, 210, 255)

# หลุมอุกกาบาต — พื้นหลุมมืด + ขอบนูนรับแสงด้านบน (แสงหลักมาจากหน้าต่างทิศเหนือ)
r2 = np.random.default_rng(77)
for _ in range(30):
    hx = (80 + r2.random() * (MW - 160)) * S
    hy = (140 + r2.random() * (MH - 260)) * S
    if abs(hx - SPAWN[0] * S) < 190 * S / 2 and abs(hy - SPAWN[1] * S) < 120 * S / 2:
        continue  # เว้นบริเวณวงเวทกลางห้อง
    cr = (12 + r2.random() * 34) * S
    dd = np.sqrt((X - hx) ** 2 + ((Y - hy) / 0.62) ** 2)
    floor_m = 1 - smooth(np.clip((dd - cr * 0.66) / (cr * 0.42), 0, 1))
    rim = np.exp(-(((dd - cr) / (cr * 0.22)) ** 2))
    top_lit = np.clip(-(Y - hy) / np.maximum(dd, 1), 0, 1)   # ขอบบนสว่าง
    img *= (1 - floor_m[..., None] * 0.42)
    img += (rim * top_lit * 0.24)[..., None] * col(185, 210, 255)
    img *= (1 - (rim * (1 - top_lit) * 0.16))[..., None]     # ขอบล่างเงา

# แร่ระยิบบนพื้น — ฟ้า/ชมพู, หนาแน่นขึ้นใกล้คริสตัลมุมห้อง
spark = np.zeros((H, W), np.float32)
n_sp = 900
spx = rng.integers(30 * S, W - 30 * S, n_sp)
spy = rng.integers(int(WALL_H * 1.1), H - 30 * S, n_sp)
spark[spy, spx] = 0.25 + rng.random(n_sp).astype(np.float32) ** 3 * 0.75
sp_glow = spark + blur_map(spark, 3) * 1.2
pinkm = fbm(W, H, 6, 4, 3) > 0.55
img += sp_glow[..., None] * np.where(pinkm[..., None], col(255, 190, 235), col(190, 230, 255)) * 0.55

# วงเวทกลางห้อง — วงแหวนคู่ + รูน 8 ทิศ + glow ฟ้า
mx, my = SPAWN[0] * S, SPAWN[1] * S
de = np.sqrt((X - mx) ** 2 + ((Y - my) / 0.5) ** 2)
ring = np.exp(-(((de - 130 * S) / (5 * S)) ** 2)) + np.exp(-(((de - 100 * S) / (3.4 * S)) ** 2))
img += ring[..., None] * col(150, 200, 255) * 0.45
img += np.exp(-(de / (150 * S)) ** 2)[..., None] * col(90, 150, 255) * 0.10
ang = np.arctan2((Y - my) / 0.5, X - mx)
seg = np.abs(((ang * 8 / (2 * np.pi)) % 1) - 0.5) < 0.16    # ขีดรูนบนวงนอก
img += (np.exp(-(((de - 115 * S) / (7 * S)) ** 2)) * seg)[..., None] * col(170, 215, 255) * 0.22
for i in range(8):
    aa = i / 8 * 2 * np.pi
    px_, py_ = mx + np.cos(aa) * 115 * S, my + np.sin(aa) * 115 * S * 0.5
    dd = np.sqrt((X - px_) ** 2 + (Y - py_) ** 2)
    img += np.exp(-(dd / (5 * S)) ** 2)[..., None] * col(190, 225, 255) * 0.5

# ============================================================
# 2) ผนังเหนือ (เห็นหน้าผนัง) + หน้าต่างโค้ง 3 บาน (วิวนิ่ง)
# ============================================================
wall_zone = Y < WALL_H
wg = np.clip(Y / WALL_H, 0, 1)
wall_col = mix(col(10, 14, 34), col(30, 39, 74), wg[..., None])
strata = fbm(W, H, 40, 6, 5)                                 # ชั้นหินแนวนอน
wall_col *= (0.82 + 0.36 * strata)[..., None]
crack = np.abs(fbm(W, H, 60, 8, 4) - 0.5) * 2
wall_col *= (1 - np.clip(0.1 - crack, 0, 1) * 2.2)[..., None]
img = np.where(wall_zone[..., None], wall_col, img)
# ขอบล่างผนังรับแสง
edge_glow = np.exp(-((Y - WALL_H) / (3 * S)) ** 2) * (Y <= WALL_H)
img += edge_glow[..., None] * col(160, 195, 255) * 0.25

sky_grad_top = col(8, 16, 44)
sky_grad_bot = col(34, 54, 106)
for wx in WINDOWS:
    x0, x1 = wx * S, (wx + WIN_W) * S
    top, bot = WIN_TOP * S, WIN_BOT * S
    arc = ARC_H * S
    xs = np.clip((X - x0) / (x1 - x0), 0, 1)
    # ขอบบนโค้ง (พาราโบลาผ่านจุด quadratic เดิม)
    y_top = top + arc - 4 * (arc * 0.8) * xs * (1 - xs)
    inside = (X >= x0) & (X <= x1) & (Y >= y_top) & (Y <= bot)
    # วิว: ฟ้าไล่สี + ดาว + แนวเขา + ประกายน้ำ (พระจันทร์/มังกร JS วาดสด)
    vy = np.clip((Y - top) / (bot - top), 0, 1)
    view = mix(sky_grad_top, sky_grad_bot, vy[..., None] ** 1.2)
    # ดาว: จุดสุ่มจริง + bloom สั้น (แบบ gen_bg ไม่ใช่ noise ก้อน)
    st_r = np.random.default_rng(wx)
    stars = np.zeros((H, W), np.float32)
    n_st = 60
    stx = st_r.integers(int(x0), int(x1), n_st)
    sty = st_r.integers(int(top), int(bot - 14 * S), n_st)
    stars[sty, stx] = 0.3 + st_r.random(n_st).astype(np.float32) ** 3 * 0.7
    view += (stars + blur_map(stars, 2) * 0.9)[..., None] * col(220, 235, 255)
    ridge_y = bot - (14 + fbm1d(W, 30, r=np.random.default_rng(wx + 1)) * 14) * S
    mtn = Y > ridge_y[None, :]
    view = np.where(mtn[..., None], col(10, 16, 40)[None, None, :] * (0.8 + 0.4 * strata)[..., None], view)
    glint = np.exp(-((Y - bot + 6 * S) / (3 * S)) ** 2) * (fbm(W, H, 200, 3, 2, r=np.random.default_rng(wx + 2)) > 0.6)
    view += glint[..., None] * col(180, 220, 255) * 0.4
    img = np.where(inside[..., None], view, img)
    # กรอบเรืองแสง + หิ้งล่าง (★ จำกัดเฉพาะแถบ x ของหน้าต่าง — ไม่งั้น exp(0)=1 รั่วทั้งจอ)
    near_x = (X >= x0 - 8 * S) & (X <= x1 + 8 * S)
    d_arc = np.abs(Y - y_top)
    d_side = np.minimum(np.abs(X - x0), np.abs(X - x1))
    dedge = np.where((Y > y_top) & (Y <= bot), d_side, d_arc)
    frame = np.exp(-(dedge / (2.4 * S)) ** 2) * near_x * ((Y >= top - 8 * S) & (Y <= bot))
    img += frame[..., None] * col(175, 208, 255) * 0.42
    sill = ((Y > bot) & (Y < bot + 4 * S) & (X > x0 - 6 * S) & (X < x1 + 6 * S)).astype(np.float32)
    img += sill[..., None] * col(170, 205, 255) * 0.28

# ============================================================
# 3) กำแพงข้าง/ล่าง — หินขอบโพรงขรุขระ
# ============================================================
prof_l = (T + (fbm1d(H, 26, r=np.random.default_rng(5)) - 0.3) * 26 * S)
prof_r = (T + (fbm1d(H, 26, r=np.random.default_rng(6)) - 0.3) * 26 * S)
prof_b = (T + (fbm1d(W, 40, r=np.random.default_rng(7)) - 0.3) * 24 * S)
rock_wall = (0.8 + 0.5 * fbm(W, H, 50, 32, 5))
wall_rock_col = col(16, 21, 44)[None, None, :] * rock_wall[..., None]
in_l = X < prof_l[:, None]
in_r = X > W - prof_r[:, None]
in_b = Y > H - prof_b[None, :]
wall_mask = (in_l | in_r | in_b) & ~wall_zone
img = np.where(wall_mask[..., None], wall_rock_col, img)
# ขอบในรับแสงเรือง
for mask, dist in [(in_l, X - prof_l[:, None]), (in_r, (W - prof_r[:, None]) - X),
                   (in_b, (H - prof_b[None, :]) - Y)]:
    rim = np.exp(-(np.abs(dist) / (2.5 * S)) ** 2) * ~wall_zone
    img += rim[..., None] * col(140, 180, 240) * 0.22

# ============================================================
# 4) vignette + เกรดสี + noise film
# ============================================================
vin = np.exp(-((dcenter / (W * 0.75)) ** 3))
img *= (0.55 + 0.45 * vin)[..., None]
img = np.clip(img, 0, 1) ** 1.04 * 1.06
img += rng.normal(0, 0.004, img.shape).astype(np.float32)
save_webp('assets/room-base.webp', img)

# ============================================================
# 5) FOREGROUND — เพดานถ้ำ/หินย้อยยื่นจากขอบ (RGBA, JS วาด parallax กลับทิศ)
# ============================================================
fg_rgb = np.zeros((H, W, 3), np.float32)
fg_a = np.zeros((H, W), np.float32)

# ความลึกที่หินยื่นเข้ามาจากแต่ละขอบ (โปรไฟล์ noise + หินย้อยแหลมด้านบน)
r3 = np.random.default_rng(99)
prof_top = (34 + (fbm1d(W, 16, r=r3) - 0.35) * 56) * S
spikes = fbm1d(W, 70, octaves=3, r=r3)
prof_top += np.clip(spikes - 0.66, 0, 1) ** 1.4 * 480 * S    # หินย้อยแหลม นานๆ แท่ง
prof_bot = (26 + (fbm1d(W, 22, r=r3) - 0.35) * 44) * S
prof_le = (24 + (fbm1d(H, 14, r=r3) - 0.35) * 52) * S
prof_ri = (24 + (fbm1d(H, 14, r=r3) - 0.35) * 52) * S

d_top = prof_top[None, :] - Y
d_bot = Y - (H - prof_bot[None, :])
d_le = prof_le[:, None] - X
d_ri = X - (W - prof_ri[:, None])
d_in = np.maximum.reduce([d_top, d_bot, d_le, d_ri])          # >0 = อยู่ใต้หิน
rockm = smooth(np.clip(d_in / (3 * S) + 0.5, 0, 1))

rock_fg = fbm(W, H, 60, 38, 5, r=r3)
fg_col = col(7, 10, 24)[None, None, :] * (0.7 + 0.5 * rock_fg)[..., None]
# เงาถ่างใต้หิน (ambient occlusion) — สีดำ alpha จาง เฉพาะฝั่งในห้อง (d_in < 0)
shadow_band = np.exp(-np.clip(-d_in, 0, None) / (18 * S)) * (d_in < 0)
fg_rgb = np.where((rockm > 0.02)[..., None], fg_col, col(0, 0, 0)[None, None, :])
fg_a = np.maximum(rockm, shadow_band * 0.4)
# rim light ขอบหินด้านใน (รับแสงจากห้อง) — เติมทีหลังไม่ให้โดนเงากลบ
rim_fg = np.exp(-(np.abs(d_in) / (2.2 * S)) ** 2)
fg_rgb += (rim_fg * (rockm > 0.4))[..., None] * col(120, 170, 240) * 0.30

save_webp('assets/room-fg.webp', fg_rgb, fg_a)
print(f'done ({W}x{H})')
