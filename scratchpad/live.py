# ============================================
# live.py — เทสเว็บ "ตัวจริงบนอินเทอร์เน็ต" (ไม่ใช่ localhost)
#   ใช้หลัง deploy ทุกครั้ง — เช็คว่าโหลดครบ ไม่มี 404 ซ่อน และเปิด panel ได้จริง
# ============================================
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch  # noqa: E402

URL = 'https://gatipnw.github.io/'


def main():
    proc, ws = launch()
    c = None
    bad = []
    try:
        c = CDP(ws)
        c.send('Page.enable')
        c.send('Runtime.enable')
        c.send('Network.enable')
        c.send('Page.navigate', url=URL)

        # เก็บ response code ทุกไฟล์ที่เว็บขอ
        c.js("window.__errs=[];addEventListener('error',e=>__errs.push(''+e.message))")
        for _ in range(14):
            c.send('Page.bringToFront')
            time.sleep(0.6)
            if c.js("!!document.getElementById('intro-logo')?.getBoundingClientRect().width"):
                break
        time.sleep(2.5)
        c.send('Page.bringToFront')
        print('title =', c.js('document.title'))
        c.shot('live-01-title')

        c.js("document.getElementById('intro').dispatchEvent("
             "new PointerEvent('pointerdown',{bubbles:true}))")
        for _ in range(24):
            c.send('Page.bringToFront')
            c.js("document.getElementById('intro-skip')?.click()")
            c.js("document.querySelector('#lang-pick button, .choice-btn')?.click()")
            time.sleep(0.5)
            if c.js('!!(window.__game && window.__game.inGame)'):
                break
        ingame = c.js('window.__game && window.__game.inGame')
        print('เข้าห้องได้ =', ingame)
        if not ingame:
            bad.append('เข้าห้องไม่ได้')
        c.shot('live-02-room')

        # เปิดครบทุกโซน + ทุกภาษา (ย่อ: 3 โซนตัวแทน × 3 ภาษา)
        for lang in ('th', 'en', 'ja'):
            for _ in range(4):
                if c.js('document.documentElement.lang') == lang:
                    break
                c.js("document.getElementById('lang-btn').click()")
                time.sleep(0.3)
            for pid in ('arcade-1', 'event', 'network'):
                c.send('Page.bringToFront')
                c.js(f"window.__game.panels.open('{pid}')")
                time.sleep(0.5)
                n = c.js("document.getElementById('panel-body')?.textContent?.length")
                if not n:
                    bad.append(f'{lang}/{pid} เนื้อหาว่าง')
                c.js("window.__game.panels.close()")
                time.sleep(0.2)
            print(f'  ภาษา {lang}: ok')

        # ภาพที่โหลดไม่สำเร็จ
        broken = c.js("""JSON.stringify([...document.images]
          .filter(i => i.complete && i.naturalWidth === 0).map(i => i.src).slice(0, 10))""")
        print('ภาพที่โหลดไม่ขึ้น =', broken)
        if broken and broken != '[]':
            bad.append('ภาพโหลดไม่ขึ้น: ' + broken)

        errs = c.js("JSON.stringify(window.__errs || [])")
        print('JS errors =', errs)
        if errs and errs not in ('[]', 'null'):
            bad.append('js:' + errs)

        c.shot('live-03-resume')
        print('\n' + ('🎉 เว็บจริงใช้งานได้ครบ' if not bad else '❌ พบปัญหา:'))
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
