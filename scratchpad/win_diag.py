# win_diag.py — วินิจฉัยว่า "หน้าต่างภาพแตก" มาจากอะไรกันแน่
#   สมมติฐาน A: ภาพต้นฉบับความละเอียดไม่พอ (bake 2x < world→device)
#   สมมติฐาน B: tilt-shift เบลอแถบบนของจอ ซึ่งเป็นตำแหน่งที่หน้าต่างอยู่พอดี
#               (บัฟเฟอร์เบลอย่อเหลือ 0.14x → ถ้าโดนจะเละมาก)
import time
import sys
import os

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

        info = c.js("""JSON.stringify({
          screenCss: innerWidth + 'x' + innerHeight,
          dpr: window.__game.renderer.dpr,
          camScale: +window.__game.map ? 0 : 0,
          canvas: window.__game.renderer.canvas.width + 'x' + window.__game.renderer.canvas.height,
          blurBuf: window.__game.renderer.blurBuf.width + 'x' + window.__game.renderer.blurBuf.height,
        })""")
        print('env:', info)

        # ยืนใต้หน้าต่างบานกลาง (x=880 world) ให้หน้าต่างอยู่บนจอ
        for tilt in (True, False):
            c.send('Page.bringToFront')
            c.js(f"window.__game.renderer.tiltOn = {str(tilt).lower()};"
                 "window.__game.player.x=880; window.__game.player.y=300;")
            for _ in range(6):
                c.send('Page.bringToFront')
                time.sleep(0.25)
            c.shot(f'win-tilt-{"ON" if tilt else "OFF"}')

        # ตำแหน่งหน้าต่างบนจอ + แถบที่โดนเบลอ
        pos = c.js("""(() => {
          const r = window.__game.renderer, cam = window.__game.renderer;
          const g = window.__game;
          // ประมาณ: หน้าต่างอยู่ world y 14..98
          const sc = innerHeight / (innerHeight / 1);   // placeholder
          return JSON.stringify({
            note: 'ดูจากภาพ win-tilt-ON/OFF ประกอบ',
            sharpBandCss: [Math.round(innerHeight*0.32), Math.round(innerHeight*0.76)],
            screenH: innerHeight,
          });
        })()""")
        print('tilt band:', pos)
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
