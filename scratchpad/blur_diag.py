# blur_diag.py — จำลองหน้าต่างเบราว์เซอร์แบบเจ้าของ แล้วแยกตัวแปรทีละอย่าง
#   1) ปัจจุบัน  2) ปิด tilt-shift  3) ปิดทั้ง tilt + แถบผนัง 4x
# เพื่อชี้ว่า "ยังมัว" มาจาก tilt-shift หรือความละเอียดภาพกันแน่
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import drive  # noqa: E402
from drive import CDP  # noqa: E402

drive.URL = 'http://localhost:8123/?room=v2'
CSS_W, CSS_H = 1479, 820      # ประมาณหน้าต่าง Brave ของเจ้าของ


def main():
    proc, ws = drive.launch()
    c = None
    try:
        c = CDP(ws)
        c.send('Page.enable')
        c.send('Runtime.enable')
        c.send('Page.bringToFront')
        c.send('Emulation.setDeviceMetricsOverride', width=CSS_W, height=CSS_H,
               deviceScaleFactor=1, mobile=False)
        time.sleep(2.5)
        c.js("document.getElementById('press-start')?.click()")
        for _ in range(20):
            c.send('Page.bringToFront')
            c.js("document.getElementById('intro-skip')?.click()")
            c.js("document.querySelector('#lang-pick button, .choice-btn')?.click()")
            time.sleep(0.5)
            if c.js('!!(window.__game && window.__game.inGame)'):
                break

        print(c.js("""(() => {
          const r = window.__game.renderer;
          const sc = Math.max(Math.min(Math.max(innerHeight/900, innerWidth/1500),1.6),0.5);
          return JSON.stringify({
            css: innerWidth+'x'+innerHeight, dpr: r.dpr,
            camScale: +sc.toFixed(3), worldToDevice: +(sc*r.dpr).toFixed(3),
            roomImg: r.roomImg.naturalWidth+'x'+r.roomImg.naturalHeight,
            wallHi: r.wallHiImg.complete && r.wallHiImg.naturalWidth
                      ? r.wallHiImg.naturalWidth+'x'+r.wallHiImg.naturalHeight : 'ไม่ได้โหลด!',
            blurBuf: r.blurBuf.width+'x'+r.blurBuf.height,
            sharpTopPx: Math.round(innerHeight*0.20),
          });
        })()"""))

        # ยืนตำแหน่งเดียวกับภาพที่เจ้าของส่ง (ใต้หน้าต่างบานกลาง)
        setup = "window.__game.player.x=800; window.__game.player.y=200;"
        cases = [
            ('now',      "window.__game.renderer.tiltOn=true;"),
            ('noTilt',   "window.__game.renderer.tiltOn=false;"),
            ('noTiltNoHi', "window.__game.renderer.tiltOn=false;"
                           "window.__game.renderer.wallHiImg = new Image();"),
        ]
        for name, js in cases:
            c.send('Page.bringToFront')
            c.js(setup + js)
            for _ in range(6):
                c.send('Page.bringToFront')
                time.sleep(0.25)
            c.shot(f'blur-{name}')
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
