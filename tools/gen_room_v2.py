# ============================================
# gen_room_v2.py — ฉากห้อง "โพรงในดวงจันทร์" เวอร์ชัน 2 (prototype HD-2D)
#
# ต่างจาก Python/gen_room.py เดิมยังไง:
#   เดิม = เอา fbm noise คูณสีพื้น → ได้ผิวหินมีเท็กซ์เจอร์ แต่ "ไม่มีการจัดองค์ประกอบ"
#   ใหม่ = วาดแบบจิตรกรรม: วางผังพื้นที่ก่อน → ลงโครงค่าน้ำหนัก (value) → ลงแสงมีทิศทาง
#          → เก็บเงา contact/AO → เก็บไฮไลต์ ซึ่งเป็นลำดับเดียวกับที่คนวาดฉากเกมทำ
#
# หลักการ HD-2D ที่อบลงภาพ:
#   1. โครงค่าน้ำหนักชัด — ขอบห้องมืด กลางห้องสว่าง (เวทีไดโอรามา)
#   2. แสงมีทิศทางจริง — ลำแสงเย็นจากหน้าต่าง 3 บาน + แสงอุ่นจากวงเวทกลางห้อง
#   3. พื้น "ถูกสร้าง" ไม่ใช่ถ้ำสุ่ม — ลานหินปูเป็นวงรอบวงเวท + ขอบทอง แล้วค่อยไล่
#      ออกเป็นหินดิบ/หลุมอุกกาบาตด้านนอก = สายตารู้ทันทีว่าตรงไหนคือใจกลางฉาก
#   4. AO/contact shadow เชิงผนังทุกด้าน = วัตถุดู "วางอยู่บนพื้น" ไม่ลอย
#   5. atmospheric perspective — ยิ่งไกลจากกลางเวที สียิ่งจมเข้าหาสีบรรยากาศ
#
# ★ เรขาคณิตต้องตรงกับ js/engine/renderer.js เป๊ะ:
#   NORTH_WALL_H=110 · WINDOWS x=470/815/1160 w=130 · T=24 · spawn=(800,620)
#
# ผลลัพธ์: assets/room-base-v2.webp  (สลับดูในเกมด้วย ?room=v2 หรือปุ่มใน HUD)
# ใช้: python tools/gen_room_v2.py
# ============================================
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

# ★ 2 โหมด (2026-07-20) — แก้อาการ "หน้าต่างภาพแตก"
#   สาเหตุ: จอ dpr 2 + camera scale 1.28 ต้องการภาพ 2.56x แต่เดิมอบไว้แค่ 2x → ถูกขยาย
#   room : ห้องทั้งใบที่ 3x  → assets/room-base-v2.webp   (worst case 3.2x = ขยาย 1.07x)
#   wall : แถบผนังเหนือ 4x   → assets/room-wall-hi.webp  (RGBA วาดทับ = คมเต็มที่)
#   ใช้:  python tools/gen_room_v2.py       (ห้อง)
#        python tools/gen_room_v2.py wall  (แถบผนัง)
MODE = (sys.argv[1] if len(sys.argv) > 1 else 'room').lower()
assert MODE in ('room', 'wall'), 'โหมดต้องเป็น room หรือ wall'

MW, MH = 1600, 1000
S = 3 if MODE == 'room' else 4
BAND_H = 124               # ความสูงแถบผนัง (world px) — เผื่อเลย WALL_H=110 ไว้ไล่ alpha
W = MW * S
H = (MH if MODE == 'room' else BAND_H) * S
# ความสูง "ห้องเต็ม" ในหน่วยพิกเซลของโหมดนี้ — โหมด wall เรนเดอร์แค่แถบบน
# แต่สูตรบรรยากาศ/vignette ต้องอิงห้องเต็ม ไม่งั้นแถบจะสีไม่ตรงกับภาพฐาน
HFULL = MH * S

WALL_H = 110 * S
T = 56 * S                 # ★ ต้องตรงกับ MAP.wallThickness ใน js/world/map.js (24 → 56)
WINDOWS = [470, 815, 1160]
WIN_W, WIN_TOP, WIN_BOT, ARC_H = 130, 14, 98, 34
SPAWN = (800, 530)         # จุดกลางวงเวท = MAP.spawn (800,500) + 30 ตาม drawMagicRing

rng = np.random.default_rng(20260720)

# ---- จานสี (ธีมราตรีญี่ปุ่น คราม×ชาด) ----
AI_DEEP = (7, 9, 22)        # ครามลึกสุด (เงา)
AI_MID = (26, 32, 62)       # ครามกลาง
AI_LIT = (74, 90, 138)      # ครามสว่าง (โดนแสง)
MOON = (176, 208, 255)      # แสงจันทร์เย็น
# ★ v3: จุดสีสว่างสุด — เดิมเพดานคือ AI_LIT (74,90,138) ทั้งภาพเลยไม่มีไฮไลต์
#   ทำให้ห้องดู 'มัว' ตลอด ต่อให้เพิ่มแสงแค่ไหนก็ตันที่ค่าสีนี้
AI_HI = (150, 182, 236)     # หินโดนแสงจันทร์เต็มๆ
KIN = (214, 168, 92)        # ทอง
SHU = (196, 78, 72)         # ชาด


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


def col(c):
    return np.array(c, np.float32) / 255.0


def mix(a, b, t):
    return a * (1 - t) + b * t


def blur(arr, radius):
    im = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(radius)), np.float32) / 255.0


X, Y = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
mx, my = SPAWN[0] * S, SPAWN[1] * S

# ระยะจากใจกลางเวที (บีบแกน Y ให้เป็นวงรี = มุมมอง top-down เอียง)
d_stage = np.sqrt((X - mx) ** 2 + ((Y - my) / 0.68) ** 2)

# ============================================================
# 1) โครงค่าน้ำหนัก (value structure) — ขั้นแรกสุดของการวาดฉาก
#    ทำเป็นภาพขาวดำก่อน แล้วค่อยลงสี = คุมความชัดของภาพรวมได้
# ============================================================
val = np.full((H, W), 0.40, np.float32)

# เวทีกลางสว่าง ไล่มืดออกขอบ (โค้งนุ่ม ไม่ใช่ vignette แข็งๆ)
val += np.exp(-(d_stage / (W * 0.46)) ** 2) * 0.24   # ★ v3.1 ลดจาก 0.36 (กลางห้องขาวโพลน)

# ก้อนหินสว่าง/มืดสเกลใหญ่ (แบบ mare บนดวงจันทร์) — คุมไม่ให้พื้นเรียบเป็นแผ่น
val += (fbm(W, H, 9, 6, 4) - 0.5) * 0.18

# ร่องหินเป็นเส้นสาย (ridge noise) — ผิวมีชั้นหินเหมือน v1 ไม่งั้นดูเรียบเป็นพลาสติก
ridge = np.abs(fbm(W, H, 24, 15, 5) - 0.5) * 2
# ★ v3.1: ลดจาก 1.1 → 0.55 — พอภาพคอนทราสต์สูงขึ้น ร่องหินเดิมเด้งเป็น
#   'เส้นขยุกขยิก' เต็มพื้น (เจ้าของเคยบอกว่ารก) ต้องเบาลงให้เป็นแค่พื้นผิว
val -= np.clip(0.12 - ridge, 0, 1) * 0.55

# ============================================================
# 2) ลานหินปู — "พื้นที่ถูกสร้าง" รอบวงเวท (จุดต่างหลักจาก v1)
#    วงแหวนหินเรียงเป็นชั้น + ร่องยาแนว → สายตาอ่านว่าเป็นสถานที่ ไม่ใช่ถ้ำสุ่ม
# ============================================================
# ★ v2.1 (เจ้าของสั่ง 2026-07-20): ลานเดิม "ใหญ่ไป รกเกิน"
#   → ยุบรัศมี 330→215, ตัดตารางแผ่นหิน/ลายวงซ้อนทิ้งทั้งหมด
#   เหลือแค่ "แท่นหินกลม + ขอบทองเส้นเดียว" ให้เป็นฐานรองวงแหวนรูนที่ JS วาดทับ
PAVE_R = 215 * S
ang = np.arctan2((Y - my) / 0.68, X - mx)

# ขอบลานเป็นวงรีบิดเบาๆ — ★ ต้องใช้ noise ความถี่ต่ำมาก (4×3) ไม่งั้นขอบหยักเป็นก้อน
pave_edge = fbm(W, H, 4, 3, 2)
pave_out = PAVE_R * (0.95 + pave_edge * 0.10)
pave_m = smooth(np.clip((pave_out - d_stage) / (46 * S), 0, 1))

# แท่นหินเรียบ สว่างกว่าพื้นรอบนอกเล็กน้อย + ผิวละเอียดกว่า (ขัดมาแล้ว)
val += pave_m * 0.10
val += pave_m * (fbm(W, H, 150, 95, 4) - 0.5) * 0.07

# เงาขอบแท่น (แท่นยกสูงจากพื้นนิดหน่อย) — ใส่แค่ด้านล่าง = แสงมาจากทิศเหนือ
lip = np.exp(-(((d_stage - pave_out) / (9 * S)) ** 2)) * np.clip((Y - my) / (d_stage + 1), 0, 1)
val -= lip * 0.16

# ============================================================
# 3) หลุมอุกกาบาต — เฉพาะ "นอกลาน" (ในลานปูหินทับไปแล้ว)
#    ขอบบนรับแสง ขอบล่างเงา = อ่านเป็นหลุม 3 มิติ ไม่ใช่วงกลมแบนๆ
# ============================================================
r2 = np.random.default_rng(88)
for _ in range(26):
    hx = (70 + r2.random() * (MW - 140)) * S
    hy = (WALL_H / S + 40 + r2.random() * (MH - WALL_H / S - 110)) * S
    if np.hypot(hx - mx, (hy - my) / 0.68) < PAVE_R * 1.05:
        continue                                      # ไม่เจาะหลุมกลางลาน
    cr = (16 + r2.random() * 40) * S
    dd = np.sqrt((X - hx) ** 2 + ((Y - hy) / 0.62) ** 2)
    bowl = 1 - smooth(np.clip((dd - cr * 0.62) / (cr * 0.45), 0, 1))
    rim = np.exp(-(((dd - cr) / (cr * 0.24)) ** 2))
    top_lit = np.clip(-(Y - hy) / np.maximum(dd, 1), 0, 1)   # แสงหลักมาจากทิศเหนือ
    val -= bowl * 0.20
    val += rim * top_lit * 0.30
    val -= rim * (1 - top_lit) * 0.16

# เกรนหิน — ★ v3 ลดความถี่สูงลงครึ่งหนึ่ง (0.16/0.09 → 0.09/0.045)
#   เกรนถี่ๆ เต็มพื้นทำให้ตาอ่านเป็น 'ฝ้า/ฝุ่น' ไม่ใช่หิน = ต้นเหตุความรู้สึก 'มัว'
val += (fbm(W, H, 70, 44, 5) - 0.5) * 0.09
val += (fbm(W, H, 220, 140, 3) - 0.5) * 0.045
# แทนด้วยลายเส้นหินยาวสเกลใหญ่ = พื้นดูเป็นแผ่นหินจริง อ่านง่ายขึ้นเวลาย่อ
vein = np.abs(fbm(W, H, 7, 11, 4) - 0.5) * 2
val += np.clip(0.10 - vein, 0, 1) * 0.85

# ============================================================
# 4) ลงสี — map ค่าน้ำหนักเข้าจานสี 3 จุด (เงา→กลาง→สว่าง)
#    ไล่ 2 ช่วงแบบนี้ให้สีอิ่มกว่าการ lerp 2 สีตรงๆ (สีกลางไม่ซีด)
# ============================================================
# ★ v3: ไล่ 3 ช่วง (เงา → กลาง → สว่าง → ไฮไลต์) แทน 2 ช่วง
#   ช่วงบนสุดวิ่งไปถึง AI_HI จึงมีที่ให้แสงจันทร์ 'สว่างจริง' ไม่ตันอยู่ที่สีกลาง
v = np.clip(val, 0, 1)[..., None]
lo = mix(col(AI_DEEP), col(AI_MID), np.clip(v / 0.42, 0, 1))
md = mix(col(AI_MID), col(AI_LIT), np.clip((v - 0.42) / 0.30, 0, 1))
hi = mix(col(AI_LIT), col(AI_HI), np.clip((v - 0.72) / 0.28, 0, 1))
img = np.where(v < 0.42, lo, np.where(v < 0.72, md, hi))

# ============================================================
# 5) แสงมีทิศทาง
# ============================================================
# 5a) ★ v3: ลำแสงจันทร์จากหน้าต่าง 3 บาน = "พระเอก" ของฉาก
#   เจ้าของบอก "ไม่มีความว้าว" แต่ก็ไม่เอาของตกแต่งเพิ่ม → ให้แสงทำงานแทน
#   เดิมความเข้ม 0.30 + จางหมดใน 30% ของความสูง = แทบมองไม่เห็น
#   ใหม่: ลำแสงบานออกตามระยะ (เหมือนแสงลอดช่องจริง) + สว่างขึ้นเท่าตัว
#         + "แอ่งแสง" ตรงที่ลำแสงตกกระทบพื้น = จุดที่สายตาไปหยุด
for wx in WINDOWS:
    bx = (wx + WIN_W / 2) * S
    depth = np.clip(Y - WALL_H, 0, None)               # ระยะจากผนังเหนือลงมา
    spread = 1.0 + depth / (HFULL * 0.75)              # ลำแสงบานออกตามระยะ
    beam_cx = bx + depth * 0.13
    beam = np.exp(-(((X - beam_cx) / (WIN_W * S * 0.52 * spread)) ** 2))
    fall = np.exp(-depth / (HFULL * 0.52))
    img += (beam * fall * 0.30)[..., None] * col(MOON)   # ★ v3.1 ลดจาก 0.62

    # แอ่งแสงที่พื้น: จุดตกกระทบราว 42% ของความสูงห้อง (มุมแสงเฉียงจากหน้าต่างสูง)
    pool_y = WALL_H + HFULL * 0.42
    pool = np.exp(-(((X - (bx + (pool_y - WALL_H) * 0.13)) / (WIN_W * S * 0.95)) ** 2)
                  - (((Y - pool_y) / (HFULL * 0.20)) ** 2))
    img += pool[..., None] * col(MOON) * 0.13            # ★ v3.1 ลดจาก 0.30

# 5b) แสงอุ่นกลางห้อง — ★ v2.2: เจ้าของสั่ง "เอาแสงรอบๆ ออก"
#     ลดเหลือจางมากและแผ่กว้าง = ยังคุมโทนอุ่น-เย็นไว้ได้ แต่ไม่เห็นเป็นวงแสงรอบวงเวท
warm = np.exp(-(d_stage / (620 * S)) ** 2)
img += warm[..., None] * col(KIN) * 0.05

# 5c) (ขอบทองรอบแท่นหิน ถูกถอดออก v2.2 — เจ้าของสั่งเอา "วง 2 ข้างนอก" ออก)
#     ขอบแท่นตอนนี้อ่านจากค่าน้ำหนัก (สว่างกว่าพื้น + เงาขอบล่าง) อย่างเดียว = เนียนกว่า

# (5d) วงแหวน/รูนกลางลานที่เคยอบไว้ ถูกถอดออก v2.1 — เจ้าของบอก "รกเกิน"
#      วงแหวนรูนที่ JS วาดสด (drawMagicRing) ทำหน้าที่นี้อยู่แล้ว ไม่ต้องซ้อน 2 ชั้น

# 5e) แร่ระยิบบนพื้น (ฟ้า/ชมพู) — หนาแน่นในลานหินน้อยกว่าหินดิบ
#     (โหมด wall ไม่มีพื้นให้โรย — ข้ามไป ไม่งั้นช่วงสุ่มติดลบ)
spark = np.zeros((H, W), np.float32)
n_sp = 760 if MODE == 'room' else 0
spx = rng.integers(30 * S, W - 30 * S, max(n_sp, 1))
spy = rng.integers(int(WALL_H * 1.08), H - 30 * S, max(n_sp, 1)) if n_sp else spx * 0
if n_sp:
    spark[spy, spx] = 0.2 + rng.random(n_sp).astype(np.float32) ** 3 * 0.8
    sp = spark + blur(spark, 3) * 1.15
    pink = fbm(W, H, 6, 4, 3) > 0.56
    img += sp[..., None] * np.where(pink[..., None], col((255, 186, 232)), col(MOON)) * 0.5

# ============================================================
# 5f) ★ เงาใต้เฟอร์นิเจอร์ — อบติดภาพ (2026-07-20 เจ้าของอนุมัติหลังผังห้องล็อกแล้ว)
#   ทำไมต้องอบ: เงาที่ JS วาดต่อเฟรมได้แค่วงรีเล็กๆ ใต้ตัววัตถุ (contact) จะทำ
#   "เงาทอดยาวตามทิศแสง + AO นุ่มๆ กว้างๆ" ไม่ไหว (ต้องเบลอทุกเฟรม = แพง)
#   อบลงภาพครั้งเดียวจบ ต้นทุนรันไทม์ = 0
#
#   ★★ อ่านตำแหน่งวัตถุจาก js/world/objects.js **ตรงๆ** ไม่ hardcode
#      → ย้ายเฟอร์นิเจอร์เมื่อไหร่ แค่รันตัวเจนใหม่ เงาก็ตามไปเอง ไม่มีเงาค้างที่เดิม
#      (นี่คือเหตุผลที่รอให้ผังล็อกก่อนถึงทำ — ถ้า hardcode จะเจอปัญหานั้น)
#
#   ทิศแสง: หน้าต่าง 3 บานบนผนังเหนือคือแหล่งแสงหลัก → เงาทอดออกจากหน้าต่างที่
#   ใกล้ที่สุดของวัตถุนั้น (ลงล่าง + เฉียงออกด้านข้าง) = ทิศเดียวกับลำแสงที่อบไว้แล้ว
if MODE == 'room':
    import io
    import re

    obj_src = io.open(os.path.join(ROOT, 'js', 'world', 'objects.js'),
                      encoding='utf-8').read()
    OBJS = [(m[0], *map(int, m[1:])) for m in re.findall(
        r"\{\s*id:\s*'([^']+)'[^}]*?x:\s*(\d+),\s*y:\s*(\d+),"
        r"\s*w:\s*(\d+),\s*h:\s*(\d+)", obj_src)]
    assert len(OBJS) >= 10, f'อ่าน objects.js ได้แค่ {len(OBJS)} ชิ้น — regex เพี้ยนแล้ว'

    shadow = np.zeros((H, W), np.float32)
    for oid, ox, oy, ow, oh in OBJS:
        fx = (ox + ow / 2) * S          # กลางฐานวัตถุ
        fy = (oy + oh) * S
        rw = ow * S
        rh = oh * S

        # ทิศเงา = จากหน้าต่างที่ใกล้ที่สุด → ตัววัตถุ
        wx = min(WINDOWS, key=lambda v: abs((v + WIN_W / 2) - (ox + ow / 2)))
        lx, ly = (wx + WIN_W / 2) * S, WALL_H * 0.5
        dx, dy = fx - lx, max(fy - ly, 1.0)
        ln = np.hypot(dx, dy)
        ux, uy = dx / ln, dy / ln

        # กรอบทำงานเฉพาะรอบวัตถุ (ไม่ต้องคำนวณทั้งภาพ = เร็ว/กินแรมน้อย)
        pad = int(max(rw, rh) * 1.9 + 40 * S)
        x0 = max(int(fx - pad), 0); x1 = min(int(fx + pad), W)
        y0 = max(int(fy - pad), 0); y1 = min(int(fy + pad), H)
        gx = X[y0:y1, x0:x1] - fx
        gy = Y[y0:y1, x0:x1] - fy

        # (ก) AO นุ่มๆ ใต้ตัว — วงรีแบนตามมุมมอง top-down เอียง
        ao = np.exp(-((gx / (rw * 0.72)) ** 2 + (gy / (rh * 0.34 + 12 * S)) ** 2))

        # (ข) เงาทอด — ยืดไปตามทิศแสง ยิ่งไกลยิ่งจาง/ฟุ้ง
        clen = rh * 0.55 + 26 * S
        cx = ux * clen * 0.55
        cy = uy * clen * 0.55
        px = (gx - cx) * ux + (gy - cy) * uy          # แกนตามทิศเงา
        py = -(gx - cx) * uy + (gy - cy) * ux         # แกนขวางทิศเงา
        cast = np.exp(-((px / (clen * 0.95)) ** 2 + (py / (rw * 0.52)) ** 2))

        shadow[y0:y1, x0:x1] = np.maximum(shadow[y0:y1, x0:x1],
                                          ao * 0.62 + cast * 0.34)

    shadow = blur(shadow, 4 * S)                       # ขอบเงานุ่มแบบแสงกระจาย
    img *= (1 - np.clip(shadow, 0, 0.62))[..., None]
    print(f'  อบเงาใต้เฟอร์นิเจอร์ {len(OBJS)} ชิ้นแล้ว')

# ============================================================
# 6) ผนังเหนือ + หน้าต่างโค้ง 3 บาน
# ============================================================
wall_zone = Y < WALL_H
wg = np.clip(Y / WALL_H, 0, 1)
# ผนังมืดบน สว่างล่าง (แสงสะท้อนจากพื้น) + ชั้นหินแนวนอน
wall_v = 0.10 + wg * 0.30
strata = fbm(W, H, 34, 7, 5)
wall_v += (strata - 0.5) * 0.16
crack = np.abs(fbm(W, H, 55, 9, 4) - 0.5) * 2
wall_v -= np.clip(0.11 - crack, 0, 1) * 1.6
wv = np.clip(wall_v, 0, 1)[..., None]
wall_col = mix(col(AI_DEEP), col(AI_MID), np.clip(wv / 0.42, 0, 1))
img = np.where(wall_zone[..., None], wall_col, img)

sky_top, sky_bot = col((6, 13, 40)), col((30, 50, 102))
for wx in WINDOWS:
    x0, x1 = wx * S, (wx + WIN_W) * S
    top, bot, arc = WIN_TOP * S, WIN_BOT * S, ARC_H * S
    xs = np.clip((X - x0) / (x1 - x0), 0, 1)
    y_top = top + arc - 4 * (arc * 0.8) * xs * (1 - xs)
    inside = (X >= x0) & (X <= x1) & (Y >= y_top) & (Y <= bot)

    vy = np.clip((Y - top) / (bot - top), 0, 1)
    view = mix(sky_top, sky_bot, (vy ** 1.2)[..., None])

    # ★ ดาว: เดิมเป็นจุด 1 พิกเซลแข็ง → พอย่อลงจอกลายเป็นจุดกระพริบ/แตก
    #   แก้เป็นจุดขนาด 2×2 px + bloom 2 ชั้น = กลมนุ่ม ไม่แตกตอนย่อ
    st_r = np.random.default_rng(wx)
    stars = np.zeros((H, W), np.float32)
    n_st = 58
    stx = st_r.integers(int(x0) + 2, int(x1) - 2, n_st)
    sty = st_r.integers(int(top) + 2, int(bot - 16 * S), n_st)
    br = 0.3 + st_r.random(n_st).astype(np.float32) ** 3 * 0.7
    for dx in (0, 1):
        for dy in (0, 1):
            np.maximum.at(stars, (sty + dy, stx + dx), br)
    view += (blur(stars, 1.1) * 1.5 + blur(stars, 3.4) * 1.1)[..., None] * col((222, 236, 255))

    # ★ แนวเขา: เดิมใช้เงื่อนไข Y > ridge ตรงๆ → ขอบเป็นบันไดหยัก (ภาพแตก)
    #   แก้เป็น smoothstep คร่อมเส้นสัน = ขอบเนียนระดับ sub-pixel
    for k, (amp, off, tone) in enumerate(((10, 26, 0.55), (14, 14, 1.0))):
        ridge = bot - (off + fbm(W, 1, 26 + k * 12, 1, 4,
                                 r=np.random.default_rng(wx + 7 + k))[0] * amp) * S
        mtn = smooth(np.clip((Y - ridge[None, :]) / (1.6 * S) + 0.5, 0, 1))
        mcol = mix(sky_bot, col(AI_DEEP), tone * 0.9)
        view = mix(view, mcol[None, None, :], mtn[..., None])

    # ★ ประกายผิวน้ำ: เดิมใช้ noise ตัดค่า → กลายเป็นแท่งสี่เหลี่ยมสว่างเป็นก้อน
    #   แก้เป็น "จุดประกายกระจาย" แบบเดียวกับดาว (สุ่มจุด + bloom) = วิบวับจริง ไม่เป็นแท่ง
    g_r = np.random.default_rng(wx + 2)
    gpts = np.zeros((H, W), np.float32)
    n_g = 46
    gx = g_r.integers(int(x0) + 3, int(x1) - 3, n_g)
    gy = (bot - 6 * S + g_r.normal(0, 2.2 * S, n_g)).astype(np.int32)
    gy = np.clip(gy, int(top), H - 2)
    gb = 0.25 + g_r.random(n_g).astype(np.float32) ** 2 * 0.75
    for dx in (0, 1, 2):
        np.maximum.at(gpts, (gy, gx + dx), gb)     # ขีดสั้นแนวนอน = ประกายบนผิวน้ำ
    view += (blur(gpts, 1.0) * 1.4 + blur(gpts, 3.0) * 0.8)[..., None] * col(MOON) * 0.75
    img = np.where(inside[..., None], view, img)

    # ★ กรอบหน้าต่าง: เดิมสลับสูตรระยะระหว่างช่วงโค้งกับช่วงตรง → เส้นขาดเป็นท่อน
    #   แก้เป็น distance field จาก mask: เบลอ mask แล้วใช้ 4·m·(1−m) ซึ่งพีคที่ขอบพอดี
    #   → ได้เส้นต่อเนื่องรอบวงรวมช่วงโค้ง ไม่มีรอยต่อ
    mb = blur(inside.astype(np.float32), 2.2 * S)
    edge = np.clip(4 * mb * (1 - mb), 0, 1) ** 1.5
    img += edge[..., None] * col(MOON) * 0.55
    sill = smooth(np.clip((bot + 5 * S - Y) / (2 * S), 0, 1)) * \
        smooth(np.clip((Y - bot) / (2 * S), 0, 1)) * \
        ((X > x0 - 7 * S) & (X < x1 + 7 * S))
    img += sill[..., None] * col(KIN) * 0.34

# ============================================================
# 7) กำแพงข้าง/ล่าง + AO เชิงผนัง (ขั้นที่ทำให้ห้อง "มีปริมาตร")
# ============================================================
# ★ v2.2: ผนังหนา 56px และ "วาดเป็นหน้าผนังจริง" (เจ้าของติว่าเดิมภาพไม่ชัด)
#   โครง: ขอบนอกมืดสุด → ไล่สว่างเข้าหาห้อง (หน้าผนังรับแสงจากกลางห้อง)
#   + ชั้นหินแนวตั้ง/แนวนอน + สันขอบบนสว่าง = อ่านออกว่ามีความสูง ไม่ใช่เส้นแบน
prof_l = T + (fbm(1, H, 1, 20, 5, r=np.random.default_rng(5))[:, 0] - 0.4) * 22 * S
prof_r = T + (fbm(1, H, 1, 20, 5, r=np.random.default_rng(6))[:, 0] - 0.4) * 22 * S
prof_b = T + (fbm(W, 1, 30, 1, 5, r=np.random.default_rng(7))[0] - 0.4) * 20 * S
if MODE == 'wall':
    prof_b = prof_b * 0 - 1e9   # แถบผนังบนไม่มีกำแพงล่าง (ไม่งั้นจะมีแถบหินพาดกลางภาพ)

# ระยะ "เข้ามาในห้อง" จากขอบนอกแต่ละด้าน (บวก = อยู่ในเนื้อผนัง)
d_l = prof_l[:, None] - X
d_r = X - (W - prof_r[:, None])
d_b = Y - (H - prof_b[None, :])
d_in = np.maximum.reduce([d_l, d_r, d_b])

# ★ v2.3 (เจ้าของสั่ง 2026-07-20): "ขอบผนังมีเส้นตัดกันเป็นสี่เหลี่ยมตรงมุม"
#   สาเหตุ: เดิมวาดเส้นขอบ/AO แยกทีละด้าน เส้นของด้านซ้ายเลยลากยาวทะลุเข้าไปใน
#   เนื้อผนังล่าง (และกลับกัน) → ไปตัดกันเป็นกากบาท/สี่เหลี่ยมที่มุมห้อง
#   แก้: รวมเป็น distance field เดียวของ "ขอบห้องทั้งใบ" (รวมผนังเหนือ)
#   เส้นระดับศูนย์ของ max() จะหักมุม 90° เองที่มุมห้อง ไม่มีเส้นวิ่งต่อเข้าเนื้อผนัง
d_room = np.maximum(d_in, WALL_H - Y)

# ★ mask แบบนุ่ม (sub-pixel) — ใช้ boolean ตรงๆ แล้วขอบเป็นบันไดหยักเหมือนที่เจอในหน้าต่าง
wall_soft = smooth(np.clip(d_in / (1.6 * S) + 0.5, 0, 1)) * (~wall_zone)

in_l, in_r, in_b = d_l > 0, d_r > 0, d_b > 0
# t = 0 ที่ขอบนอกสุด → 1 ที่ขอบในสุด (ติดพื้นห้อง)
t_l = np.clip(X / np.maximum(prof_l[:, None], 1), 0, 1)
t_r = np.clip((W - X) / np.maximum(prof_r[:, None], 1), 0, 1)
t_b = np.clip((H - Y) / np.maximum(prof_b[None, :], 1), 0, 1)
t_face = np.where(in_l, t_l, np.where(in_r, t_r, np.where(in_b, t_b, 1.0)))

# ★ v3 (เจ้าของ: "ผนังก็ด้วย" ไม่สวย) — เดิมหน้าผนังค่าน้ำหนักต่ำเกือบทั้งแถบ
#   เห็นสว่างแค่เส้น rim 1-2px → อ่านเป็น 'เส้นขอบ' ไม่ใช่ 'แท่งหินหนา 56px'
#   ใหม่: หน้าผนังไล่สว่างกว้างขึ้นมาก + แถบไฮไลต์กลางหน้าผนัง + ชั้นหินคมขึ้น
face_v = 0.14 + t_face * 0.62                       # ไล่สว่างเข้าหาห้อง
face_v += np.exp(-((t_face - 0.62) / 0.22) ** 2) * 0.22   # แถบไฮไลต์กลางหน้าผนัง
face_v += (fbm(W, H, 26, 40, 5) - 0.5) * 0.26       # ชั้นหินยาวตามแนวผนัง
crk = np.abs(fbm(W, H, 44, 60, 4) - 0.5) * 2
face_v -= np.clip(0.11 - crk, 0, 1) * 1.7           # รอยแตก
face_v += np.exp(-((1 - t_face) / 0.11) ** 2) * 0.42  # สันขอบในรับแสงเต็มๆ
fv = np.clip(face_v, 0, 1)[..., None]
# ★ v3: หน้าผนังไล่ถึง AI_HI ด้วย (เดิมตันที่ AI_LIT = ผนังหม่นกว่าพื้น)
wall_face = np.where(fv < 0.6,
                     mix(col(AI_DEEP), col(AI_LIT), np.clip(fv / 0.6, 0, 1)),
                     mix(col(AI_LIT), col(AI_HI), np.clip((fv - 0.6) / 0.4, 0, 1)))
img = mix(img, wall_face, wall_soft[..., None])

# ★ AO เชิงผนัง — v2.3 คิดจาก "ขอบห้อง" อันเดียว (d_room) จึงไม่ทับซ้อนกันที่มุม
#   เดิมวนทีละด้านแล้วคูณกัน → มุมห้องเงาเข้มเป็นสองเท่าและเห็นเป็นสี่เหลี่ยม
AO = 30 * S
img *= (1 - np.exp(-np.clip(-d_room, 0, None) / AO) * 0.34)[..., None]

# ★ v3: เงาผนังทอดลงพื้น (contact shadow) — ทำให้ผนัง 'ยกสูง' จากพื้นจริงๆ
#   เดิมมีแค่ AO ซึ่งมืดทั้งสองฝั่งของขอบ เลยดูเป็นรอยเปื้อนมากกว่าเงา
cast = np.exp(-np.clip(-d_room, 0, None) / (14 * S)) * (d_room < 0)
img *= (1 - cast * 0.30)[..., None]

# rim light ขอบในของผนัง — เส้นเดียวรอบห้องทั้งใบ หักมุม 90° เองที่มุม
# ไม่มีเส้นของด้านหนึ่งลากทะลุเข้าไปในเนื้อผนังของอีกด้าน (ที่เจ้าของทักว่าเป็นสี่เหลี่ยม)
img += np.exp(-((np.abs(d_room) / (2.4 * S)) ** 2))[..., None] * col(MOON) * 0.42

# ============================================================
# 8) เก็บงาน: atmospheric perspective + vignette + เกรดสี + grain
# ============================================================
# ยิ่งไกลจากเวที สีจมเข้าหาสีบรรยากาศ (ลด contrast/ความอิ่ม) = ความลึกแบบภาพวาด
# ★ v3: ลดจาก 0.20 → 0.09 — ชั้นนี้ + vignette + palette เพดานต่ำ ซ้อนกัน 3 ชั้น
#   คือสาเหตุรวมของอาการ 'มัว' (วัดได้: ภาพเดิมสว่างสุดแค่ 146/255)
far = np.clip(d_stage / (W * 0.70), 0, 1)[..., None]
img = mix(img, col(AI_DEEP)[None, None, :], far ** 2 * 0.09)

# ★ vignette ต้องอิง "ห้องเต็ม" (HFULL) ไม่ใช่ความสูงของภาพที่กำลังเรนเดอร์
#   ไม่งั้นแถบผนัง 4x จะสว่าง/มืดไม่ตรงกับภาพฐาน แล้วเห็นรอยต่อชัด
vin = np.exp(-((np.sqrt(((X - W / 2) / (W * 0.72)) ** 2 +
                        ((Y - HFULL * 0.54) / (HFULL * 0.82)) ** 2)) ** 3))
img *= (0.80 + 0.20 * vin)[..., None]

# ★ v3: เกรดแบบ S-curve — ดันไฮไลต์ขึ้น กดเงาลง = ภาพ 'ใส' ขึ้นชัดเจน
img = np.clip(img, 0, 1)
img = np.clip(img ** 0.95 * 1.05, 0, 1)
img = img * img * (3 - 2 * img) * 0.22 + img * 0.78      # smoothstep ผสมของเดิม
img += rng.normal(0, 0.005, img.shape).astype(np.float32)    # ฟิล์มเกรน

rgb8 = (np.clip(img, 0, 1) * 255).astype(np.uint8)
if MODE == 'room':
    out = Image.fromarray(rgb8, 'RGB')
    out = out.filter(ImageFilter.UnsharpMask(radius=3, percent=105, threshold=2))
    path = os.path.join(ROOT, 'assets', 'room-base-v2.webp')
    out.save(path, quality=88, method=6)
else:
    # แถบผนังความละเอียดสูง: ทึบจนถึงขอบล่างผนัง แล้วไล่ alpha หายไปในพื้น
    # → วาดทับภาพฐานได้เนียน ไม่เห็นเส้นรอยต่อ
    fade_top = WALL_H + 4 * S            # เริ่มจางหลังพ้นขอบผนังนิดหน่อย
    fade_len = (BAND_H * S) - fade_top
    a = np.clip((H - Y) / max(fade_len, 1), 0, 1) ** 1.4
    a = np.where(Y < fade_top, 1.0, a).astype(np.float32)
    a8 = (np.clip(a, 0, 1) * 255).astype(np.uint8)
    out = Image.fromarray(np.dstack([rgb8, a8]), 'RGBA')
    out = out.filter(ImageFilter.UnsharpMask(radius=3, percent=105, threshold=2))
    path = os.path.join(ROOT, 'assets', 'room-wall-hi.webp')
    out.save(path, quality=90, method=6)
print(f'saved [{MODE} @{S}x] {path} {out.size}  '
      f'{os.path.getsize(path)//1024}KB')
