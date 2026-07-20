# ============================================
# check_v3.py — ตรวจงานรอบ 2026-07-20 #3 (เพลงใหม่ · Title · โปริ่ง · ตู้ Esport)
#   - จับภาพ Title (ต้องไม่มีลำแสงจันทร์/god rays แล้ว + ปุ่ม PRESS START เด่น)
#   - จับภาพห้องแถวตู้เกม 5 ตู้ (ตู้ที่ 5 = Esport)
#   - เปิด panel esport / event ดูการ์ดเกม + แถวโลโก้
#   - เฝ้าดูโปริ่ง 20 วิ ว่ามีตัวไหนไปทับ AABB ของวัตถุไหม
#   - เก็บ console error / exception จริงผ่าน CDP
# ============================================
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch  # noqa: E402


def drain(c):
    """อ่าน event ที่ค้างใน socket (console error / exception) แบบไม่บล็อก"""
    out = []
    c.ws.settimeout(0.25)
    try:
        while True:
            m = json.loads(c.ws.recv())
            meth = m.get('method')
            if meth == 'Runtime.exceptionThrown':
                d = m['params']['exceptionDetails']
                out.append('EXC: ' + (d.get('text') or '') + ' ' + str(d.get('exception', {}).get('description', ''))[:200])
            elif meth == 'Log.entryAdded' and m['params']['entry']['level'] == 'error':
                out.append('LOG: ' + m['params']['entry']['text'][:200])
            elif meth == 'Runtime.consoleAPICalled' and m['params']['type'] == 'error':
                out.append('CONSOLE: ' + str(m['params']['args'])[:200])
    except Exception:
        pass
    finally:
        c.ws.settimeout(30)
    return out


def main():
    proc, ws = launch()
    c = None
    errs = []
    try:
        c = CDP(ws)
        c.send('Page.enable')
        c.send('Runtime.enable')
        c.send('Log.enable')
        c.send('Page.bringToFront')
        time.sleep(3.0)

        print('BGM src =', c.js("document.querySelector('audio')?.src || '(ยังไม่เริ่ม)'"))
        c.shot('v3-01-title')
        errs += drain(c)

        # เข้าเกม
        c.send('Page.bringToFront')
        c.js("document.getElementById('press-start')?.click()")
        time.sleep(1.0)
        for _ in range(20):
            c.send('Page.bringToFront')
            c.js("document.getElementById('intro-skip')?.click()")
            c.js("document.querySelector('#lang-pick button, .choice-btn')?.click()")
            time.sleep(0.5)
            if c.js('!!(window.__game && window.__game.inGame)'):
                break
        print('inGame =', c.js('window.__game && window.__game.inGame'))
        print('BGM src =', c.js("document.querySelector('audio')?.src"))

        # แถวตู้เกม: วาร์ปไปหน้าตู้ Esport
        c.send('Page.bringToFront')
        c.js("""(() => { const g = window.__game;
          const o = g.objects.find(o => o.id === 'esport');
          g.player.x = o.x + o.w / 2; g.player.y = o.y + o.h + 48; })()""")
        time.sleep(1.2)
        c.shot('v3-02-esport-cabinet')
        print('hover =', c.js("window.__game.hover && window.__game.hover.id"))

        for pid in ['esport', 'event', 'bookshelf']:
            c.send('Page.bringToFront')
            c.js(f"window.__game.panels.open('{pid}')")
            time.sleep(0.8)
            print(f'  panel {pid}: title={c.js("document.getElementById(\'panel-title\').textContent")!r}'
                  f' slides={c.js("document.querySelectorAll(\'.car-slide\').length")}'
                  f' games={c.js("document.querySelectorAll(\'.game-card\').length")}'
                  f' bigLogos={c.js("document.querySelectorAll(\'.logo-card.duo\').length")}')
            c.shot(f'v3-panel-{pid}')
            c.js("window.__game.panels.close()")
            time.sleep(0.3)

        # ---- โปริ่งทับวัตถุไหม (เฝ้า 20 วินาที) ----
        c.send('Page.bringToFront')
        c.js("""window.__poCheck = { bad: 0, hops: 0, maxD: 0, prev: null };
          window.__poTimer = setInterval(() => {
            const g = window.__game, R = g.renderer, s = window.__poCheck;
            for (const po of R.porings) {
              // ทับวัตถุ = จุดกลางตัวอยู่ใน AABB (ไม่เผื่อ pad — เอาเคสชัดๆ)
              for (const o of g.objects) {
                if (po.x > o.x && po.x < o.x + o.w && po.y > o.y && po.y < o.y + o.h) s.bad++;
              }
              if (po.state === 'pre' && po._c !== 1) {
                po._c = 1; s.hops++;
                s.maxD = Math.max(s.maxD, Math.hypot(po.tx - po.sx, po.ty - po.sy));
              }
              if (po.state === 'idle') po._c = 0;
            }
          }, 50);""")
        # ★ ต้อง bringToFront เรื่อยๆ ระหว่างรอ — ไม่งั้นแท็บหลุด foreground →
        #   document.hidden=true → game loop หยุด → โปริ่งแข็งค้าง วัดอะไรไม่ได้เลย
        for _ in range(10):
            c.send('Page.bringToFront')
            time.sleep(2)
        c.send('Page.bringToFront')
        st = c.js("JSON.stringify(window.__poCheck)")
        c.js("clearInterval(window.__poTimer)")
        print('poring 20s:', st, '(bad ต้องเป็น 0)')
        s = json.loads(st)
        if s['bad'] > 0:
            errs.append(f'poring ทับวัตถุ {s["bad"]} เฟรม')

        errs += drain(c)
        print('\nerrors:', errs or 'ไม่มี')
        print('🎉 ผ่าน' if not errs else '❌ มีปัญหา')
    finally:
        if c:
            c.close()
        proc.terminate()
        try:
            proc.wait(timeout=6)
        except Exception:
            proc.kill()


if __name__ == '__main__':
    main()
