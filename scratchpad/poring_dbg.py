# poring_dbg.py — ทำไมโปริ่งไม่ขยับ? ดูสถานะดิบ + ลองเรียก startHop ตรงๆ
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch  # noqa: E402


def main():
    proc, ws = launch()
    c = None
    try:
        c = CDP(ws)
        c.send('Page.enable')
        c.send('Runtime.enable')
        c.send('Page.bringToFront')
        time.sleep(2.5)
        c.js("document.getElementById('press-start')?.click()")
        for _ in range(20):
            c.send('Page.bringToFront')
            c.js("document.getElementById('intro-skip')?.click()")
            c.js("document.querySelector('#lang-pick button, .choice-btn')?.click()")
            time.sleep(0.5)
            if c.js('!!(window.__game && window.__game.inGame)'):
                break

        c.send('Page.bringToFront')
        print('lastObjects =', c.js("window.__game.renderer.lastObjects.length"))
        for i in range(6):
            c.send('Page.bringToFront')
            print(c.js("""JSON.stringify(window.__game.renderer.porings.map(
              p => [p.state, +p.t.toFixed(2), +p.wait.toFixed(2), p.x|0, p.y|0]))"""))
            time.sleep(3)

        # ลองบังคับ startHop 200 รอบ ดูว่าสำเร็จกี่ครั้ง
        c.send('Page.bringToFront')
        r = c.js("""(() => {
          const R = window.__game.renderer, m = window.__game.map;
          let ok = 0, fail = 0;
          for (let i = 0; i < 200; i++) {
            const po = R.porings[i % 5];
            po.state = 'idle';
            R.startHop(po, m);
            if (po.state === 'pre') { ok++; po.state = 'idle'; } else fail++;
          }
          return JSON.stringify({ ok, fail });
        })()""")
        print('startHop 200 ครั้ง =', r)
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
