# perf.py — วัดต้นทุนจริงของ renderer.draw() เป็นมิลลิวินาที/เฟรม
# rAF ใน headless ถูก throttle ไม่นิ่ง → วัด FPS ตรงๆ เชื่อไม่ได้
# จึงห่อ renderer.draw ด้วย performance.now() แล้วดู median/p95 แทน
# งบสำหรับ 60fps = 16.7ms ต่อเฟรม (รวมทุกอย่าง) — renderer ควรกินไม่เกิน ~8ms
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch  # noqa: E402

INSTRUMENT = """
(() => {
  const r = window.__game.renderer;
  if (!r.__orig) r.__orig = r.draw.bind(r);
  window.__t = [];
  r.draw = function (s) {
    const a = performance.now();
    r.__orig(s);
    window.__t.push(performance.now() - a);
  };
  return true;
})()
"""

COLLECT = """
(() => {
  const t = window.__t.slice(10);            // ทิ้ง 10 เฟรมแรก (warm-up)
  if (t.length < 20) return {n: t.length, err: 'เฟรมน้อยเกิน'};
  const s = [...t].sort((a, b) => a - b);
  const q = (p) => +s[Math.floor(s.length * p)].toFixed(2);
  return {n: s.length, median: q(0.5), p95: q(0.95), max: +s[s.length-1].toFixed(2),
          avg: +(t.reduce((x, y) => x + y, 0) / t.length).toFixed(2)};
})()
"""


def measure(c, label, seconds=4):
    c.send('Page.bringToFront')
    c.js(INSTRUMENT)
    end = time.time() + seconds
    while time.time() < end:      # ส่ง bringToFront ถี่ๆ กันแท็บหลุด → rAF หยุด
        c.send('Page.bringToFront')
        time.sleep(0.25)
    r = c.js(COLLECT)
    print(f'  {label:28} {r}')
    return r


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

        print('เวลา renderer.draw ต่อเฟรม (ms) — งบ 60fps = 16.7ms')
        c.js("window.__game.renderer.tiltOn = true")
        measure(c, 'HD-2D เปิด (ยืนนิ่ง)')

        c.send('Page.bringToFront')
        c.send('Input.dispatchKeyEvent', type='keyDown', code='KeyD', key='d',
               windowsVirtualKeyCode=68, nativeVirtualKeyCode=68)
        measure(c, 'HD-2D เปิด (เดิน)')
        c.send('Input.dispatchKeyEvent', type='keyUp', code='KeyD', key='d',
               windowsVirtualKeyCode=68, nativeVirtualKeyCode=68)

        c.js("window.__game.renderer.tiltOn = false")
        measure(c, 'HD-2D ปิด (ยืนนิ่ง)')

        print('viewport:', c.js("JSON.stringify({w:innerWidth,h:innerHeight,dpr:devicePixelRatio,cw:window.__game.renderer.canvas.width})"))
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
