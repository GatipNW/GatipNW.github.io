# ============================================
# gh_media.py — เจนสื่อสำหรับ README บน GitHub
#   1) แบนเนอร์กว้าง (จับจากหน้า Title จริง)
#   2) GIF เดินสำรวจห้อง (Page.startScreencast → PIL)
#   3) ภาพนิ่ง 4 ใบ: title / room / panel / mobile
# ผลลัพธ์ทั้งหมดลง .github/media/
#
# ★ กติกาเดิมจาก CLAUDE.md ยังใช้: --mute-audio · ลบ user-data-dir · bringToFront
#   ★ ตอนอัด screencast ห้ามเรียก captureScreenshot (แท็บหลุด foreground → rAF หยุด)
#   ★ ระหว่างอัดใช้ ws.send ดิบแบบไม่รอ response ไม่งั้นเฟรมหาย
# ใช้: python tools/gh_media.py [banner|stills|gif|all]
# ============================================
import base64
import io
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request

import websocket  # pip install websocket-client
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, '.github', 'media')
UDD = os.path.join(ROOT, 'scratchpad', 'edge-profile-media')
RAW = os.path.join(ROOT, 'scratchpad', 'shots', 'gifsrc')
PORT = 9333
URL = 'http://localhost:8123'

try:                       # เชลล์บางตัวเปิดมาเป็น cp1252 → ปริ้นต์ไทย/อีโมจิพัง
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

EDGE = None
for p in (r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
          r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'):
    if os.path.exists(p):
        EDGE = p
        break
assert EDGE, 'ไม่พบ msedge.exe'


class CDP:
    """ตัวเดียวกับ scratchpad/drive.py แต่ 'เก็บ' event ที่ไม่ใช่ response ไว้ ไม่ทิ้ง"""

    def __init__(self, ws_url):
        self.ws = websocket.create_connection(ws_url, timeout=30)
        self.i = 0
        self.events = []

    def send(self, method, **params):
        self.i += 1
        self.ws.send(json.dumps({'id': self.i, 'method': method, 'params': params}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get('id') == self.i:
                if 'error' in msg:
                    raise RuntimeError(f'{method}: {msg["error"]}')
                return msg.get('result', {})
            if 'method' in msg:
                self.events.append(msg)

    def fire(self, method, **params):
        """ส่งแล้วไม่รอ response — ใช้ตอนอัด screencast"""
        self.i += 1
        self.ws.send(json.dumps({'id': self.i, 'method': method, 'params': params}))

    def js(self, expr, awaitp=False):
        r = self.send('Runtime.evaluate', expression=expr, returnByValue=True,
                      awaitPromise=awaitp, userGesture=True)
        if 'exceptionDetails' in r:
            raise RuntimeError(r['exceptionDetails'].get('text') or str(r['exceptionDetails']))
        return r.get('result', {}).get('value')

    def jsfire(self, expr):
        self.fire('Runtime.evaluate', expression=expr, returnByValue=True, userGesture=True)

    def metrics(self, w, h, dpr=2, mobile=False):
        self.send('Emulation.setDeviceMetricsOverride',
                  width=w, height=h, deviceScaleFactor=dpr, mobile=mobile)

    def shot_img(self):
        self.send('Page.bringToFront')
        data = self.send('Page.captureScreenshot', format='png')['data']
        self.send('Page.bringToFront')  # ★ คืน foreground ทันที ไม่งั้น rAF หยุด
        return Image.open(io.BytesIO(base64.b64decode(data))).convert('RGB')

    def close(self):
        try:
            self.ws.close()
        except Exception:
            pass


def launch():
    shutil.rmtree(UDD, ignore_errors=True)
    proc = subprocess.Popen([
        EDGE,
        f'--remote-debugging-port={PORT}',
        '--remote-allow-origins=*',
        f'--user-data-dir={UDD}',
        '--headless=new',
        '--mute-audio',
        '--disable-gpu-sandbox',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-features=Translate,AcceptCHFrame',
        '--window-size=1440,900',
        URL,
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    for _ in range(60):
        time.sleep(0.5)
        try:
            tabs = json.load(urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json/list', timeout=3))
        except Exception:
            continue
        for t in tabs:
            if t.get('type') == 'page' and 'localhost:8123' in t.get('url', ''):
                return proc, t['webSocketDebuggerUrl']
    proc.kill()
    raise RuntimeError('เปิดแท็บ localhost:8123 ไม่สำเร็จ')


def fresh_load(c, lang='en', touch=False, query=''):
    """โหลดหน้าใหม่ด้วย Page.navigate (ห้าม reload — CLAUDE.md) + ตั้งภาษาไว้ล่วงหน้า"""
    c.js(f"localStorage.setItem('resume-game-lang','{lang}')")
    c.send('Page.navigate', url=f'{URL}/?t={int(time.time()*1000)}{query}')
    time.sleep(3.2)          # รอ #boot จางหมด (CLAUDE.md: ต้องรอ ~2.5s)
    if touch:
        # ★ ต้องสั่ง "หลัง" navigate เสมอ ไม่งั้นโดน navigation ล้าง
        c.send('Emulation.setTouchEmulationEnabled', enabled=True, maxTouchPoints=5)
        time.sleep(0.4)
    c.send('Page.bringToFront')


def enter_game(c, lang='en'):
    """กด PRESS START → ข้าม intro → อยู่ในห้อง"""
    c.send('Page.bringToFront')
    c.js("document.getElementById('press-start')?.click()")
    time.sleep(0.8)
    for _ in range(30):
        c.send('Page.bringToFront')
        c.js("document.getElementById('intro-skip')?.click()")
        c.js(f"""(() => {{
            const b = [...document.querySelectorAll('.lang-btn')]
              .find(x => x.textContent.trim() === {json.dumps({'th':'ไทย','en':'English','ja':'日本語'}[lang])});
            if (b) b.click();
        }})()""")
        time.sleep(0.4)
        if c.js('!!(window.__game && window.__game.inGame)'):
            break
    time.sleep(1.2)
    c.send('Page.bringToFront')
    return c.js('!!(window.__game && window.__game.inGame)')


def key(c, code, down=True):
    ev = 'keydown' if down else 'keyup'
    ch = {'KeyW': 'w', 'KeyA': 'a', 'KeyS': 's', 'KeyD': 'd', 'KeyE': 'e', 'Escape': 'Escape'}[code]
    c.jsfire(f"window.dispatchEvent(new KeyboardEvent('{ev}',"
             f"{{code:'{code}',key:'{ch}',bubbles:true}}))")


# ============================================
# 1) แบนเนอร์ — จับหน้า Title ที่ viewport กว้าง แล้วครอปเป็นแถบ
# ============================================
def make_banner(c):
    # viewport กว้าง 2.5:1 → ฉาก Title จัดองค์ประกอบเองให้พอดีแบนเนอร์
    c.metrics(1500, 600, dpr=2)
    fresh_load(c, 'en')
    # ซ่อน HUD (ปุ่มเสียง/ภาษา/Resume) — เป็น UI ของเว็บ ไม่ใช่ส่วนของภาพ
    c.js("""(() => {
        for (const s of ['#hud', '#title-resume', '#mute-btn', '#lang-btn'])
            document.querySelectorAll(s).forEach(e => { e.style.display = 'none'; });
    })()""")
    time.sleep(1.8)                       # ให้ดาว/หมอก/แฟรี่ตั้งตัว
    img = c.shot_img()                    # 3000×1200
    img = img.resize((1600, round(1600 * img.size[1] / img.size[0])), Image.LANCZOS)
    # ★ กระติ๊บถูกวางให้ "โผล่จากขอบล่างจอ" เสมอ — ในแบนเนอร์จะเหลือแค่เสี้ยวหมวก
    #   ดูเหมือนครอปพลาด เลยตัดทิ้งแล้วไปโชว์กระติ๊บเต็มตัวในตารางภาพ/โปรไฟล์แทน
    img = img.crop((0, 0, 1600, 566))
    path = os.path.join(OUT, 'banner.webp')
    img.save(path, quality=84, method=6)
    print(f'  🖼  banner.webp {img.size} {os.path.getsize(path)//1024}KB')


# ============================================
# 2) ภาพนิ่ง
# ============================================
def make_stills(c):
    # --- title (จอ desktop เต็ม) ---
    c.metrics(1280, 800, dpr=2)
    fresh_load(c, 'en')
    time.sleep(1.5)
    save(c.shot_img(), 'shot-title.webp', 1280)

    # --- ห้อง + panel ---
    assert enter_game(c, 'en'), 'เข้าเกมไม่สำเร็จ'
    time.sleep(1.0)
    save(c.shot_img(), 'shot-room.webp', 1280)

    c.js("window.__game.panels.open('event')")
    time.sleep(1.2)
    save(c.shot_img(), 'shot-panel.webp', 1280)
    c.js("window.__game.panels.close()")
    time.sleep(0.4)

    # --- resume mode ---
    c.js("window.__game.resume && window.__game.resume.open && window.__game.resume.open()")
    time.sleep(1.0)
    save(c.shot_img(), 'shot-resume.webp', 1280)

    # --- มือถือ (ต้อง navigate ใหม่ + เปิด touch หลัง navigate) ---
    c.metrics(390, 844, dpr=3, mobile=True)
    fresh_load(c, 'en', touch=True)
    assert enter_game(c, 'en'), 'เข้าเกมบนมือถือไม่สำเร็จ'
    time.sleep(1.0)
    save(c.shot_img(), 'shot-mobile.webp', 470)


def save(img, name, width):
    # ★ เก็บเป็น WebP หมด — PNG ใบละ ~1MB ส่วน WebP q84 เหลือ ~70KB โดยตาไม่เห็นต่าง
    if img.size[0] != width:
        img = img.resize((width, round(width * img.size[1] / img.size[0])), Image.LANCZOS)
    path = os.path.join(OUT, name)
    img.save(path, quality=84, method=6)
    print(f'  📸 {name} {img.size} {os.path.getsize(path)//1024}KB')


# ============================================
# 3) GIF — screencast จริงระหว่างเดินสำรวจ
# ============================================
# ★ เดินด้วย input.moveGoal (ระบบคลิกเพื่อเดิน) ไม่ใช่กดปุ่มค้างตามเวลา
#   — จะได้ไปหยุดหน้าตู้พอดีเป๊ะทุกครั้ง ไม่ต้องเดาความเร็วตัวละคร
def goto(x, y):
    return (f"(() => {{ const g = window.__game;"
            f" g.input.moveGoal = {{ x: {x}, y: {y}, px: g.player.x, py: g.player.y }};"
            f" return 'goto {x},{y}'; }})()")


# arcade-1 (Sticky Rice · Cherry Kiss) AABB = x245–355 · y150–280 → ยืนใต้ตู้
SCRIPT = [
    (0.30, goto(300, 330)),
    (3.30, "window.__game.panels.open('arcade-1') ?? 'open'"),
    (6.90, "(window.__game.panels.close(), 'close')"),
    (7.40, goto(810, 520)),
]
DUR = 9.6
FPS = int(os.environ.get('GIF_FPS', 12))
GIF_W = int(os.environ.get('GIF_W', 720))
QUALITY = int(os.environ.get('GIF_QUALITY', 70))
# ★ ทำไมเป็น WebP ไม่ใช่ GIF: ฉากนี้กล้องแพนตลอด = ทุกพิกเซลเปลี่ยนทุกเฟรม
#   GIF 256 สีเลยบีบไม่ลง — 600px/9fps ยังได้ 4.8MB ส่วน WebP 720px/12fps เต็มสี = 1.4MB
#   (GitHub เรนเดอร์ animated WebP ใน README ได้ปกติ)
FMT = os.environ.get('GIF_FORMAT', 'webp')


def make_gif(c):
    c.metrics(1280, 720, dpr=1)
    fresh_load(c, 'en')
    assert enter_game(c, 'en'), 'เข้าเกมไม่สำเร็จ'
    time.sleep(1.0)
    c.send('Page.bringToFront')

    # ★★ กับดักเดิมของโปรเจกต์ (CLAUDE.md): แท็บหลุด foreground → document.hidden=true
    #    → main.js ตั้ง running=false → rAF หยุด → screencast ไม่มีเฟรมใหม่เลย
    #    (อาการที่เจอ: เปิด panel ปุ๊บ เฟรมหยุดนิ่งยาวจนจบคลิป)
    #    กันสองชั้น: ล็อก document.hidden ให้เป็น false + ดึงแท็บกลับ foreground ทุก 0.4s
    c.js("""(() => {
        Object.defineProperty(document, 'hidden',
            { get: () => false, configurable: true });
        Object.defineProperty(document, 'visibilityState',
            { get: () => 'visible', configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
    })()""")

    c.send('Page.startScreencast', format='jpeg', quality=92,
           maxWidth=1280, maxHeight=720, everyNthFrame=1)

    frames = []          # (t, jpegbytes)
    pending = list(SCRIPT)
    t0 = time.time()

    def take(msg):
        """เฟรมจาก screencast → ack ทันที (ไม่ ack = ฝั่งเบราว์เซอร์หยุดส่ง)"""
        if msg.get('method') != 'Page.screencastFrame':
            return
        p = msg['params']
        c.fire('Page.screencastFrameAck', sessionId=p['sessionId'])
        frames.append((time.time() - t0, base64.b64decode(p['data'])))

    def blocking(fn):
        """เรียกคำสั่งที่ต้องรอ response ระหว่างอัด แล้วเก็บเฟรมที่ค้างไว้ให้ครบ"""
        c.ws.settimeout(30)
        try:
            return fn()
        finally:
            c.ws.settimeout(0.08)
            for m in c.events:
                take(m)
            c.events.clear()

    c.ws.settimeout(0.08)
    next_front = 0.0
    try:
        while True:
            now = time.time() - t0
            if now > DUR:
                break
            if now >= next_front:
                next_front = now + 0.4
                blocking(lambda: c.send('Page.bringToFront'))
            while pending and pending[0][0] <= now:
                _, expr = pending.pop(0)
                # ★ สั่งแบบรอผล เพื่อให้เห็น exception — เคยสั่งแบบ fire-and-forget
                #   แล้ว panels.close() เงียบหายไปโดยไม่รู้ตัว GIF เลยค้างที่ panel
                try:
                    print(f'    t={now:4.1f}s → {blocking(lambda: c.js(expr))!r}')
                except Exception as e:
                    print(f'    ⚠ t={now:4.1f}s {e}')
            try:
                take(json.loads(c.ws.recv()))
            except Exception:
                continue
    finally:
        c.ws.settimeout(30)
        try:
            c.send('Page.stopScreencast')
        except Exception:
            pass
    print('     สภาพหลังอัด:', c.js("""JSON.stringify({
        openId: window.__game.panels.openId,
        cls: document.getElementById('panel').className,
        hidden: document.hidden,
        inGame: window.__game.inGame,
    })"""))

    print(f'  🎞  จับได้ {len(frames)} เฟรมใน {DUR}s (~{len(frames)/DUR:.1f} fps)')
    hist = [0] * (int(DUR) + 1)
    for t, _ in frames:
        hist[min(int(t), len(hist) - 1)] += 1
    print('     เฟรมต่อวินาที:', hist)   # ★ ต้องกระจายทุกวินาที ถ้ากองต้นๆ = หยุดวาด
    assert len(frames) > 40, 'เฟรมน้อยเกินไป — เช็คว่าแท็บอยู่ foreground ไหม'

    # เก็บเฟรมดิบไว้ → ลองค่าบีบ GIF ใหม่ได้โดยไม่ต้องเปิดเบราว์เซอร์อีก
    shutil.rmtree(RAW, ignore_errors=True)
    os.makedirs(RAW, exist_ok=True)
    for i, (t, raw) in enumerate(frames):
        with open(os.path.join(RAW, f'{i:04d}_{int(t*1000):05d}.jpg'), 'wb') as f:
            f.write(raw)
    encode_gif()


def encode_gif():
    """เข้ารหัส GIF จากเฟรมดิบใน scratchpad — แยกจากการอัดเพื่อลองค่าบีบได้เร็ว"""
    files = sorted(os.listdir(RAW))
    assert files, f'ไม่มีเฟรมดิบใน {RAW} — รัน `gh_media.py gif` ก่อน'
    frames = [(int(n.split('_')[1].split('.')[0]) / 1000,
               os.path.join(RAW, n)) for n in files]

    # resample ให้ตรง FPS คงที่
    step = 1.0 / FPS
    picked, k = [], 0
    for i in range(int(DUR * FPS)):
        want = i * step
        while k + 1 < len(frames) and frames[k + 1][0] <= want:
            k += 1
        picked.append(frames[k][1])

    imgs = []
    for p in picked:
        im = Image.open(p).convert('RGB')
        imgs.append(im.resize((GIF_W, round(GIF_W * im.size[1] / im.size[0])), Image.LANCZOS))

    path = os.path.join(OUT, f'demo.{FMT}')
    if FMT == 'gif':
        # พาเลตต์ร่วมจากเฟรมตัวอย่าง → เล็กกว่าปล่อยให้ quantize ทีละใบ
        sample = Image.new('RGB', (imgs[0].size[0], imgs[0].size[1] * 4))
        for n, idx in enumerate((0, len(imgs) // 3, len(imgs) * 2 // 3, len(imgs) - 1)):
            sample.paste(imgs[idx], (0, imgs[0].size[1] * n))
        pal = sample.quantize(colors=112, method=Image.MEDIANCUT)
        out = [im.quantize(palette=pal, dither=Image.NONE) for im in imgs]
        out[0].save(path, save_all=True, append_images=out[1:],
                    duration=int(1000 / FPS), loop=0, optimize=True, disposal=2)
    else:
        imgs[0].save(path, save_all=True, append_images=imgs[1:],
                     duration=int(1000 / FPS), loop=0, quality=QUALITY, method=5)
    print(f'  🎬 demo.{FMT} {imgs[0].size} × {len(imgs)} เฟรม = '
          f'{os.path.getsize(path)/1024/1024:.2f}MB')


def main():
    what = (sys.argv[1] if len(sys.argv) > 1 else 'all').lower()
    os.makedirs(OUT, exist_ok=True)
    if what == 'encode':          # เข้ารหัสซ้ำจากเฟรมดิบ ไม่เปิดเบราว์เซอร์
        encode_gif()
        return
    proc, ws = launch()
    c = None
    try:
        c = CDP(ws)
        c.send('Page.enable')
        c.send('Runtime.enable')
        c.send('Page.bringToFront')
        time.sleep(2.0)

        if what in ('all', 'banner'):
            print('— แบนเนอร์ —')
            make_banner(c)
        if what in ('all', 'gif'):
            print('— GIF —')
            make_gif(c)
        if what in ('all', 'stills'):
            print('— ภาพนิ่ง —')
            make_stills(c)
    finally:
        if c:
            c.close()
        proc.terminate()
        try:
            proc.wait(timeout=6)
        except Exception:
            proc.kill()
        print('closed edge pid', proc.pid)


if __name__ == '__main__':
    main()
