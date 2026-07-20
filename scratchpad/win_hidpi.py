# win_hidpi.py — จำลองจอความละเอียดสูง (dpr 2) เพื่อพิสูจน์ว่า "หน้าต่างแตก" เพราะอะไร
#   ถ้าภาพ bake 2x ไม่พอ → world→device = camScale × dpr จะเกิน 2 แล้วเห็นเป็นการขยาย
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import drive  # noqa: E402
from drive import CDP  # noqa: E402

drive.URL = 'http://localhost:8123/?room=v2'


def main():
    proc, ws = drive.launch()
    c = None
    try:
        c = CDP(ws)
        c.send('Page.enable')
        c.send('Runtime.enable')
        c.send('Page.bringToFront')
        # จอ 1920x1080 CSS + dpr 2 = แบบ 4K/retina ที่พบบ่อย
        c.send('Emulation.setDeviceMetricsOverride', width=1920, height=1080,
               deviceScaleFactor=2, mobile=False)
        time.sleep(2.5)
        c.js("document.getElementById('press-start')?.click()")
        for _ in range(20):
            c.send('Page.bringToFront')
            c.js("document.getElementById('intro-skip')?.click()")
            c.js("document.querySelector('#lang-pick button, .choice-btn')?.click()")
            time.sleep(0.5)
            if c.js('!!(window.__game && window.__game.inGame)'):
                break

        env = c.js("""(() => {
          const r = window.__game.renderer;
          const sc = Math.max(Math.min(Math.max(innerHeight/900, innerWidth/1500),1.6),0.5);
          return JSON.stringify({
            cssScreen: innerWidth+'x'+innerHeight, dpr: r.dpr,
            canvas: r.canvas.width+'x'+r.canvas.height,
            camScale: +sc.toFixed(3),
            worldToDevice: +(sc*r.dpr).toFixed(3),
            bake: '2x',
            verdict: (sc*r.dpr) > 2 ? 'ขยายภาพ ' + (sc*r.dpr/2).toFixed(2) + 'x → แตก'
                                    : 'ย่อภาพ → ไม่ควรแตก',
          });
        })()""")
        print(env)

        # ยืนใต้หน้าต่าง แล้วปิด tilt เพื่อแยกตัวแปร
        c.js("window.__game.renderer.tiltOn=false;"
             "window.__game.player.x=880; window.__game.player.y=260;")
        for _ in range(8):
            c.send('Page.bringToFront')
            time.sleep(0.25)
        c.shot('hidpi-tiltOFF')
        c.js("window.__game.renderer.tiltOn=true;")
        for _ in range(6):
            c.send('Page.bringToFront')
            time.sleep(0.25)
        c.shot('hidpi-tiltON')
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
