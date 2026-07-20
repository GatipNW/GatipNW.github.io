# drive3.py — เทสการเดิน/ชนกำแพงเหนือ + FPS (ทนต่อการที่ rAF หยุดตอน headless)
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch  # noqa: E402

FPS_JS = """
new Promise(res => {
  let n = 0; const t0 = performance.now();
  const done = () => res({fps: +(n/((performance.now()-t0)/1000)).toFixed(1),
                          frames: n, hidden: document.hidden});
  const guard = setTimeout(done, %(ms)d + 1500);   // กัน rAF หยุดแล้วค้าง
  (function t(){ n++;
    if (performance.now()-t0 < %(ms)d) requestAnimationFrame(t);
    else { clearTimeout(guard); done(); } })();
});
"""


def fps(c, ms=2500):
    c.send('Page.bringToFront')   # ★ ไม่ส่งอันนี้ = แท็บหลุด foreground → rAF หยุด → วัดได้ 0
    return c.js(FPS_JS % {'ms': ms}, awaitp=True)


def key(c, down, code, vk):
    c.send('Page.bringToFront')
    c.send('Input.dispatchKeyEvent', type='keyDown' if down else 'keyUp',
           code=code, key=code[-1].lower(), windowsVirtualKeyCode=vk,
           nativeVirtualKeyCode=vk)


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
        print('inGame:', c.js('window.__game.inGame'), '| hidden:', c.js('document.hidden'))

        print('FPS idle  :', fps(c))

        # ---- ชนกำแพงเหนือ ----
        c.js("window.__game.player.x=800; window.__game.player.y=300; window.__game.player.vy=0;")
        key(c, True, 'KeyW', 87)
        time.sleep(2.5)
        key(c, False, 'KeyW', 87)
        time.sleep(0.3)
        y = c.js("Math.round(window.__game.player.y)")
        half = c.js("window.__game.player.h/2")
        nh = c.js("window.__game.renderer.lastObjects && 110")
        print(f'กำแพงเหนือ: player.y={y} (ครึ่งตัว={half}) → ขอบบนตัว = {y-half}  ต้อง >= 110')
        print('  ผ่าน' if (y - half) >= 109.5 else '  ❌ ยังทะลุเข้าไปในกำแพง')
        c.shot('wall-north')

        # ---- ชนกำแพงล่าง/ซ้าย/ขวา ----
        for name, code, vk, expect in [('ซ้าย', 'KeyA', 65, None), ('ล่าง', 'KeyS', 83, None)]:
            key(c, True, code, vk)
            time.sleep(2.5)
            key(c, False, code, vk)
            time.sleep(0.2)
            print(f'  ชนกำแพง{name}: x={c.js("Math.round(window.__game.player.x)")} '
                  f'y={c.js("Math.round(window.__game.player.y)")}')

        # ---- FPS ตอนเดิน ----
        c.js("window.__game.player.x=800; window.__game.player.y=620;")
        key(c, True, 'KeyD', 68)
        r = fps(c)
        key(c, False, 'KeyD', 68)
        print('FPS walking:', r)
        c.shot('walk')

        # ---- เปรียบเทียบ tilt-shift เปิด/ปิด ----
        c.js("window.__game.player.x=800; window.__game.player.y=400;")
        time.sleep(0.5)
        c.js("window.__game.renderer.tiltOn = false")
        time.sleep(0.4)
        c.shot('tilt-OFF')
        c.js("window.__game.renderer.tiltOn = true")
        time.sleep(0.4)
        c.shot('tilt-ON')

        # ---- ตรวจว่ารูปในการ์ดเครือข่ายโหลดครบ (บังคับโหลดก่อนวัด) ----
        c.js("window.__game.panels.open('network')")
        time.sleep(0.6)
        c.js("document.querySelectorAll('.car-img').forEach(i=>i.loading='eager')")
        time.sleep(2.5)
        print('network imgs:', c.js("""JSON.stringify(
          [...document.querySelectorAll('.car-slide img')].map(i =>
            i.src.split('/').pop() + (i.naturalWidth>0 ? ' ✓' : ' ✗')))"""))
        c.js("window.__game.panels.close()")

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
