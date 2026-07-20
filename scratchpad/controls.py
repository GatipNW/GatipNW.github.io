# ============================================
# controls.py — เทสบั๊กการควบคุมที่เจ้าของแจ้ง (2026-07-20 รอบ 12)
#   1) คลิกขวาปิดกล่องข้อความแล้วต้องไม่วนเปิดใหม่
#   2) สลับ WASD กับเมาส์แล้วต้องไม่ "เดินเอง" หรือ "เดินติด"
#   3) ปุ่มปิด Resume ต้องไม่โดนตัวนับความคืบหน้าทับ
# ============================================
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch  # noqa: E402


def key(c, code, down=True):
    c.send('Input.dispatchKeyEvent', type='keyDown' if down else 'keyUp',
           code=code, key={'KeyW': 'w', 'KeyD': 'd', 'KeyA': 'a', 'KeyS': 's'}[code],
           windowsVirtualKeyCode={'KeyW': 87, 'KeyD': 68, 'KeyA': 65, 'KeyS': 83}[code])


def mouse(c, kind, x, y, button='left'):
    c.send('Input.dispatchMouseEvent', type=kind, x=x, y=y, button=button,
           buttons=(1 if button == 'left' else 2) if kind == 'mousePressed' else 0,
           clickCount=1)


def pos(c):
    return json.loads(c.js("JSON.stringify([window.__game.player.x|0, window.__game.player.y|0])"))


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

        # ---- 1) คลิกขวาปิด panel แล้วห้ามวนเปิดใหม่ ----
        c.send('Page.bringToFront')
        c.js("""(() => { const g = window.__game, o = g.objects.find(o => o.id === 'youtube');
          g.player.x = o.x + o.w / 2; g.player.y = o.y - 40; })()""")
        time.sleep(0.6)
        c.send('Page.bringToFront')
        c.js("window.__game.panels.open('youtube')")
        time.sleep(0.6)
        c.send('Page.bringToFront')
        c.js("""document.getElementById('panel').dispatchEvent(
          new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))""")
        time.sleep(0.9)
        c.send('Page.bringToFront')
        still = c.js("window.__game.panels.openId")
        print('  คลิกขวาบน panel → openId =', still, '(ต้องเป็น None)')
        if still:
            bad.append(f'คลิกขวาแล้ว panel ไม่ปิด/วนเปิดใหม่ ({still})')

        # ---- 2) เดินด้วยคลิก แล้วกด WASD แทรก ----
        c.send('Page.bringToFront')
        c.js("window.__game.player.x = 800; window.__game.player.y = 500;"
             "window.__game.input.moveGoal = null")
        time.sleep(0.4)
        mouse(c, 'mousePressed', 1150, 260)
        mouse(c, 'mouseReleased', 1150, 260)
        time.sleep(0.35)
        c.send('Page.bringToFront')
        print('  ตั้งจุดหมายจากคลิก =', bool(c.js('!!window.__game.input.moveGoal')))
        key(c, 'KeyA', True)                       # กดปุ่มแทรกระหว่างเดินอัตโนมัติ
        time.sleep(0.25)
        c.send('Page.bringToFront')
        goal_after_key = c.js('!!window.__game.input.moveGoal')
        print('  กด A แล้ว moveGoal ยังอยู่ไหม =', goal_after_key, '(ต้องเป็น False)')
        if goal_after_key:
            bad.append('กดปุ่มเดินแล้วจุดหมายจากคลิกไม่ถูกยกเลิก → ปล่อยปุ่มแล้วเดินเอง')
        p1 = pos(c)
        time.sleep(0.7)
        c.send('Page.bringToFront')
        p2 = pos(c)
        key(c, 'KeyA', False)
        print(f'  ระหว่างกด A: {p1} → {p2} (ต้องเดินไปทางซ้าย)')
        if p2[0] >= p1[0]:
            bad.append(f'กด A แล้วไม่เดินซ้าย ({p1}→{p2})')

        # ---- ปล่อยปุ่มแล้วต้อง "หยุด" ไม่ใช่เดินต่อไปหาจุดเก่า ----
        time.sleep(0.6)
        c.send('Page.bringToFront')
        p3 = pos(c)
        time.sleep(0.8)
        c.send('Page.bringToFront')
        p4 = pos(c)
        drift = abs(p4[0] - p3[0]) + abs(p4[1] - p3[1])
        print(f'  ปล่อยปุ่มแล้ว 0.8 วิ ขยับต่อ {drift}px (ต้องใกล้ 0)')
        if drift > 25:
            bad.append(f'ปล่อยปุ่มแล้วตัวละครเดินต่อเอง {drift}px')

        # ---- 3) ปุ่มปิด Resume ต้องไม่โดนตัวนับทับ ----
        c.send('Page.bringToFront')
        c.js("document.getElementById('resume-btn').click()")
        time.sleep(1.0)
        c.send('Page.bringToFront')
        clash = c.js("""(() => {
          const r = document.getElementById('resume-close').getBoundingClientRect();
          const p = document.getElementById('progress');
          const vis = p && !p.classList.contains('hidden')
            && getComputedStyle(p).display !== 'none';
          if (!vis) return 'ตัวนับถูกซ่อน = ไม่ทับ';
          const q = p.getBoundingClientRect();
          const hit = !(q.right < r.left || q.left > r.right
                     || q.bottom < r.top || q.top > r.bottom);
          return hit ? 'ทับกัน!' : 'ไม่ทับ'; })()""")
        print('  ปุ่มปิด Resume vs ตัวนับ =', clash)
        if 'ทับกัน' in str(clash):
            bad.append('ตัวนับความคืบหน้าทับปุ่มปิด Resume')

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
