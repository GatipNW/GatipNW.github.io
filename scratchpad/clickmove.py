# ============================================
# clickmove.py — เทสระบบ "คลิกเพื่อเดิน" + คลิกขวา + เอฟเฟกต์คลิก + เด้งกล่องข้อความ
#   (เพิ่ม 2026-07-20 รอบ 10)
#   ★ ต้องยิงเมาส์จริงผ่าน Input.dispatchMouseEvent — เกมอ่านจาก pointerdown บน canvas
# ============================================
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch  # noqa: E402


def mouse(c, kind, x, y, button='left'):
    c.send('Input.dispatchMouseEvent', type=kind, x=x, y=y, button=button,
           buttons=(1 if button == 'left' else 2) if kind == 'mousePressed' else 0,
           clickCount=1)


def main():
    proc, ws = launch()
    c = None
    bad = []
    try:
        c = CDP(ws)
        c.send('Page.enable')
        c.send('Runtime.enable')
        time.sleep(2.5)
        c.js("document.getElementById('intro').dispatchEvent("
             "new PointerEvent('pointerdown',{bubbles:true}))")
        for _ in range(20):
            c.send('Page.bringToFront')
            c.js("document.getElementById('intro-skip')?.click()")
            c.js("document.querySelector('#lang-pick button, .choice-btn')?.click()")
            time.sleep(0.5)
            if c.js('!!(window.__game && window.__game.inGame)'):
                break

        # ---- 1) คลิกพื้นเปล่า → ต้องเดินไปหาจุดนั้น ----
        c.send('Page.bringToFront')
        c.js("window.__game.player.x = 800; window.__game.player.y = 500")
        time.sleep(0.4)
        p0 = c.js("JSON.stringify([window.__game.player.x|0, window.__game.player.y|0])")
        mouse(c, 'mousePressed', 1100, 300)
        mouse(c, 'mouseReleased', 1100, 300)
        time.sleep(0.25)
        c.send('Page.bringToFront')
        print('  clickFx หลังคลิก =', c.js('window.__game.renderer.clickFx.length'),
              '· moveGoal =', c.js('JSON.stringify(window.__game.input.moveGoal)'))
        if not c.js('window.__game.renderer.clickFx.length'):
            bad.append('คลิกแล้วไม่มีเอฟเฟกต์')
        for _ in range(8):
            c.send('Page.bringToFront')
            time.sleep(0.35)
        p1 = c.js("JSON.stringify([window.__game.player.x|0, window.__game.player.y|0])")
        print(f'  ตำแหน่ง {p0} → {p1}')
        if p0 == p1:
            bad.append('คลิกแล้วตัวละครไม่เดิน')

        # ---- 2) คลิกที่วัตถุ → เดินไปแล้วเปิด panel ให้เอง ----
        c.send('Page.bringToFront')
        c.js("""(() => { const g = window.__game, o = g.objects.find(o => o.id === 'language');
          g.player.x = o.x + o.w / 2; g.player.y = o.y - 220; })()""")
        time.sleep(0.5)
        c.send('Page.bringToFront')
        scr = c.js("""(() => { const g = window.__game;
          const o = g.objects.find(o => o.id === 'language');
          const cam = g.camera;
          return JSON.stringify([
            Math.round((o.x + o.w / 2 - cam.left) * cam.scale),
            Math.round((o.y + o.h / 2 - cam.top) * cam.scale)]); })()""")
        print('  จุดวัตถุบนจอ =', scr)
        if scr:
            import json
            sx, sy = json.loads(scr)
            mouse(c, 'mousePressed', sx, sy)
            mouse(c, 'mouseReleased', sx, sy)
            for _ in range(10):
                c.send('Page.bringToFront')
                time.sleep(0.35)
                if c.js("window.__game.panels.isOpen"):
                    break
            opened = c.js("window.__game.panels.openId")
            print('  คลิกวัตถุแล้วเปิด panel =', opened)
            if opened != 'language':
                bad.append(f'คลิกวัตถุแล้วไม่เปิด panel (ได้ {opened})')
            # ---- 3) เอฟเฟกต์เด้งกล่องข้อความ ----
            print('  class ตอนเปิด =', c.js("document.getElementById('panel-box').className"))
            c.js("window.__game.panels.close()")
            time.sleep(0.05)
            c.send('Page.bringToFront')
            cls = c.js("document.getElementById('panel').className")
            print('  class ตอนปิด =', repr(cls))
            if 'closing' not in (cls or ''):
                bad.append('ปิด panel แล้วไม่มีอนิเมชัน closing')
            time.sleep(0.4)
            c.send('Page.bringToFront')
            print('  ปิดสนิทแล้ว =', c.js(
                "document.getElementById('panel').classList.contains('hidden')"))

        # ---- 4) คลิกขวา: ห้ามมีเมนูเบราว์เซอร์ + ต้อง interact ----
        c.send('Page.bringToFront')
        prevented = c.js("""(() => {
          const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
          document.getElementById('game-canvas').dispatchEvent(e);
          return e.defaultPrevented; })()""")
        print('  คลิกขวาถูกบล็อกเมนูเบราว์เซอร์ =', prevented)
        if not prevented:
            bad.append('คลิกขวายังเปิดเมนูบันทึกภาพอยู่')

        print('\n' + ('🎉 ผ่านทั้งหมด' if not bad else '❌ พบปัญหา:'))
        for b in bad:
            print('  -', b)
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
