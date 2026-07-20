# compare_room.py — จับภาพในเกมจริงเทียบฉากพื้น v1 กับ v2 (มุมเดียวกันเป๊ะ)
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import drive  # noqa: E402
from drive import CDP  # noqa: E402

SHOTS = [
    ('center', 800, 620),   # กลางห้อง (วงเวท)
    ('north', 700, 260),    # ใต้หน้าต่าง
    ('left', 260, 560),     # ผนังซ้าย (ชั้นหนังสือ/ตู้แฟ้ม)
]


def run(variant):
    drive.URL = f'http://localhost:8123/?room={variant}'
    proc, ws = drive.launch()
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
        print(f'  [{variant}] roomVariant =', c.js("window.__game.renderer.roomVariant"),
              '| loaded =', c.js("window.__game.renderer.roomImg.naturalWidth > 0"))
        for name, x, y in SHOTS:
            c.send('Page.bringToFront')
            c.js(f"window.__game.player.x={x}; window.__game.player.y={y};"
                 f"window.__game.renderer.prevTime=null;")
            # ให้กล้องตามทัน + FX นิ่ง
            for _ in range(6):
                c.send('Page.bringToFront')
                time.sleep(0.25)
            c.shot(f'room-{variant}-{name}')
    finally:
        if c:
            c.close()
        proc.terminate()
        try:
            proc.wait(timeout=6)
        except Exception:
            proc.kill()


for v in ('v1', 'v2'):
    print(f'=== {v} ===')
    run(v)
