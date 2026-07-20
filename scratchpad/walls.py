# walls.py — เทสชนกำแพงครบ 4 ด้าน ให้ตรงกับ MAP.wallThickness/northWallH
# ★ ต้องยิง Page.bringToFront ถี่ๆ ระหว่างเดิน ไม่งั้นแท็บหลุด → rAF หยุด → ตัวไม่ขยับ
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch  # noqa: E402

VK = {'KeyW': 87, 'KeyA': 65, 'KeyS': 83, 'KeyD': 68}


def hold(c, code, seconds=3.2):
    c.send('Page.bringToFront')
    c.send('Input.dispatchKeyEvent', type='keyDown', code=code, key=code[-1].lower(),
           windowsVirtualKeyCode=VK[code], nativeVirtualKeyCode=VK[code])
    end = time.time() + seconds
    while time.time() < end:
        c.send('Page.bringToFront')     # กันแท็บหลุด foreground
        time.sleep(0.2)
    c.send('Input.dispatchKeyEvent', type='keyUp', code=code, key=code[-1].lower(),
           windowsVirtualKeyCode=VK[code], nativeVirtualKeyCode=VK[code])
    time.sleep(0.25)


def main():
    proc, ws = launch()
    c = None
    fails = []
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

        T = c.js("window.__game.map.wallThickness")
        NH = c.js("window.__game.map.northWallH")
        MW = c.js("window.__game.map.width")
        MH = c.js("window.__game.map.height")
        hw = c.js("window.__game.player.w/2")
        hh = c.js("window.__game.player.h/2")
        print(f'MAP: {MW}x{MH} · wallThickness={T} · northWallH={NH} · player {hw*2}x{hh*2}')

        # ★ จุดตั้งต้นต้องอยู่ใน "ทางโล่ง" ไม่งั้นชนเฟอร์นิเจอร์ก่อนถึงกำแพง
        #   x=800 โล่งแนวตั้ง (ระหว่าง arcade-2/3 และ youtube/language)
        #   y=600 โล่งแนวนอน (ใต้ bookshelf/event, เหนือ other/network)
        cases = [
            ('เหนือ', 'KeyW', 800, 600, lambda: c.js("window.__game.player.y") - hh, NH, 'ขอบบนตัว'),
            ('ล่าง',  'KeyS', 800, 600, lambda: c.js("window.__game.player.y") + hh, MH - T, 'ขอบล่างตัว'),
            ('ซ้าย',  'KeyA', 800, 600, lambda: c.js("window.__game.player.x") - hw, T, 'ขอบซ้ายตัว'),
            ('ขวา',   'KeyD', 800, 600, lambda: c.js("window.__game.player.x") + hw, MW - T, 'ขอบขวาตัว'),
        ]
        for name, code, sx, sy, get, want, label in cases:
            c.js(f"window.__game.player.x={sx}; window.__game.player.y={sy};"
                 "window.__game.player.vx=0; window.__game.player.vy=0;")
            hold(c, code, 4.5)
            got = round(get(), 1)
            ok = abs(got - want) < 1.5
            print(f'  {name:5} → {label}={got}  (ควรเป็น {want})  {"ผ่าน" if ok else "❌ ไม่ตรง"}')
            if not ok:
                fails.append(name)

        c.shot('walls-final')
        print('\n' + ('🎉 กำแพงตรงกับภาพครบ 4 ด้าน' if not fails else f'❌ ไม่ผ่าน: {fails}'))
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
