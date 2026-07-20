# ============================================
# drive.py — ขับ Edge headless ผ่าน CDP เพื่อเทสเกม + จับภาพ + วัด FPS
# ★ กติกาจาก CLAUDE.md:
#   - ลบ user-data-dir ก่อนทุกครั้ง (session restore เปิดแท็บผี → rAF หยุด)
#   - ใส่ --remote-allow-origins=* + เลือกแท็บ localhost:8123 เท่านั้น
#   - ส่ง Page.bringToFront ก่อนทุกขั้นสำคัญ (แท็บ sync แย่ง foreground → เกมค้าง)
#   - ปิด Edge ด้วย PID ที่เราสร้างเอง ห้าม taskkill /IM msedge.exe
# ใช้: python scratchpad/drive.py [ชื่อชุดเทส]
# ============================================
import base64
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request

import websocket  # pip install websocket-client

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOT = os.path.join(ROOT, 'scratchpad', 'shots')
UDD = os.path.join(ROOT, 'scratchpad', 'edge-profile')
PORT = 9222
URL = 'http://localhost:8123'

EDGE = None
for p in (r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
          r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'):
    if os.path.exists(p):
        EDGE = p
        break
assert EDGE, 'ไม่พบ msedge.exe'


class CDP:
    def __init__(self, ws_url):
        self.ws = websocket.create_connection(ws_url, timeout=30)
        self.i = 0

    def send(self, method, **params):
        self.i += 1
        self.ws.send(json.dumps({'id': self.i, 'method': method, 'params': params}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get('id') == self.i:
                if 'error' in msg:
                    raise RuntimeError(f'{method}: {msg["error"]}')
                return msg.get('result', {})

    def js(self, expr, awaitp=False):
        r = self.send('Runtime.evaluate', expression=expr, returnByValue=True,
                      awaitPromise=awaitp, userGesture=True)
        if 'exceptionDetails' in r:
            raise RuntimeError(r['exceptionDetails'].get('text') or str(r['exceptionDetails']))
        return r.get('result', {}).get('value')

    def shot(self, name):
        self.send('Page.bringToFront')
        data = self.send('Page.captureScreenshot', format='png')['data']
        os.makedirs(SHOT, exist_ok=True)
        path = os.path.join(SHOT, f'{name}.png')
        with open(path, 'wb') as f:
            f.write(base64.b64decode(data))
        print(f'  📸 {name}.png')
        return path

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
        # ★ ห้ามมีเสียงตอนเทส (เจ้าของสั่ง 2026-07-20) — เกมเล่น BGM/SFX ตอนกด PRESS START
        '--mute-audio',
        '--disable-gpu-sandbox',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-features=Translate,AcceptCHFrame',
        '--window-size=1440,900',
        URL,
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # รอ target ของเราโผล่
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


def main():
    proc, ws = launch()
    c = None
    try:
        c = CDP(ws)
        c.send('Page.enable')
        c.send('Runtime.enable')
        c.send('Log.enable')
        c.send('Page.bringToFront')
        time.sleep(2.5)

        # ---- 1) console error ----
        errs = c.js("""
          (() => { const e = window.__errs || []; return JSON.stringify(e); })()
        """)
        print('console errors captured by page:', errs)

        # ตรวจว่าโมดูลโหลดจริง (window.__game ต้องมี)
        ok = c.js('typeof window.__game')
        print('window.__game =', ok)
        if ok != 'object':
            body = c.js('document.body.innerHTML.length')
            print('  ⚠ โมดูลไม่โหลด — body len', body)

        c.shot('01-title')

        # ---- 2) ข้าม intro ----
        c.send('Page.bringToFront')
        c.js("document.getElementById('press-start')?.click()")
        time.sleep(1.0)
        for _ in range(20):
            c.send('Page.bringToFront')
            # กดปุ่มข้าม + ปุ่มเลือกภาษาใดๆ ที่โผล่มา
            c.js("document.getElementById('intro-skip')?.click()")
            c.js("document.querySelector('#lang-pick button, .choice-btn')?.click()")
            time.sleep(0.5)
            if c.js('!!(window.__game && window.__game.inGame)'):
                break
        print('inGame =', c.js('window.__game && window.__game.inGame'))
        c.shot('02-room')

        # ---- 3) วัด FPS 3 วินาที ----
        c.send('Page.bringToFront')
        fps = c.js("""
          new Promise(res => {
            let n = 0; const t0 = performance.now();
            function tick(){ n++; if (performance.now() - t0 < 3000) requestAnimationFrame(tick);
                             else res(+(n / ((performance.now()-t0)/1000)).toFixed(1)); }
            requestAnimationFrame(tick);
          })
        """, awaitp=True)
        print(f'FPS (idle) = {fps}')

        # ---- 4) เดินไปหาวัตถุแต่ละชิ้น + เปิด panel ----
        ids = c.js("JSON.stringify(window.__game ? window.__game.panels && Object.keys({}) : [])")
        objs = c.js("""JSON.stringify(
          [...(window.__objectsDebug||[])].map(o=>o.id))""")
        print('objects:', objs)

        for pid in ['event', 'language', 'network', 'bookshelf', 'other']:
            c.send('Page.bringToFront')
            opened = c.js(f"window.__game.panels.open('{pid}')")
            time.sleep(0.7)
            title = c.js("document.getElementById('panel-title')?.textContent")
            n_games = c.js("document.querySelectorAll('.game-card').length")
            n_uses = c.js("document.querySelectorAll('.use-item').length")
            n_logos = c.js("document.querySelectorAll('.logo-card.duo').length")
            print(f'  panel {pid}: open={opened} title={title!r} games={n_games} uses={n_uses} bigLogos={n_logos}')
            c.shot(f'panel-{pid}')
            c.js("window.__game.panels.close()")
            time.sleep(0.3)

        # ---- 5) วัด FPS ตอนเดิน ----
        c.send('Page.bringToFront')
        fps2 = c.js("""
          new Promise(res => {
            const k = new KeyboardEvent('keydown', {code:'KeyD', key:'d', bubbles:true});
            window.dispatchEvent(k);
            let n = 0; const t0 = performance.now();
            function tick(){ n++; if (performance.now() - t0 < 3000) requestAnimationFrame(tick);
                             else { window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyD',key:'d',bubbles:true}));
                                    res(+(n / ((performance.now()-t0)/1000)).toFixed(1)); } }
            requestAnimationFrame(tick);
          })
        """, awaitp=True)
        print(f'FPS (walking) = {fps2}')
        c.shot('03-room-walk')

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
