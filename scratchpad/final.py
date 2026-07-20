# final.py — ตรวจรอบสุดท้าย: ทุก panel ครบ 3 ภาษา + ไม่มี console error
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch  # noqa: E402

# ★ 2026-07-20: + 'esport' (ตู้ที่ 5 แถวเหนือ) = 13 วัตถุ / Resume Mode 13 section
#   (Resume มี 'skills' เพิ่มแต่ไม่มี 'door' → จำนวนเท่ากันพอดี)
IDS = ['arcade-1', 'arcade-2', 'arcade-3', 'arcade-4', 'youtube',
       'bookshelf', 'other', 'event', 'esport', 'writing', 'network', 'language', 'desk', 'door']
RESUME_SECTIONS = 14


def main():
    proc, ws = launch()
    c = None
    errors = []
    try:
        c = CDP(ws)
        c.send('Page.enable')
        c.send('Runtime.enable')
        c.send('Log.enable')
        c.send('Page.bringToFront')

        # ดัก error ทุกชนิดตั้งแต่ต้น
        c.js("window.__errs=[];addEventListener('error',e=>__errs.push(''+e.message));"
             "addEventListener('unhandledrejection',e=>__errs.push('rej:'+e.reason));")
        time.sleep(2.5)
        c.js("document.getElementById('press-start')?.click()")
        for _ in range(20):
            c.send('Page.bringToFront')
            c.js("document.getElementById('intro-skip')?.click()")
            c.js("document.querySelector('#lang-pick button, .choice-btn')?.click()")
            time.sleep(0.5)
            if c.js('!!(window.__game && window.__game.inGame)'):
                break

        for lang in ['th', 'en', 'ja']:
            c.send('Page.bringToFront')
            # หมุนปุ่มภาษาจนตรง
            for _ in range(4):
                if c.js("document.documentElement.lang") == lang:
                    break
                c.js("document.getElementById('lang-btn').click()")
                time.sleep(0.35)
            cur = c.js("document.documentElement.lang")
            print(f'\n=== ภาษา {cur} ===')
            missing = []
            for pid in IDS:
                c.js(f"window.__game.panels.open('{pid}')")
                time.sleep(0.28)
                t = c.js("document.getElementById('panel-title')?.textContent")
                body = c.js("document.getElementById('panel-body')?.textContent?.length")
                if not t or not body:
                    missing.append(pid)
                else:
                    print(f'  ✓ {pid:10} {t}  ({body} ตัวอักษร)')
            if missing:
                print('  ❌ panel ที่พัง:', missing)
                errors.append(f'{cur}: {missing}')
            c.js("window.__game.panels.close()")

            # Resume Mode ต้องมีทุก section
            c.js("document.getElementById('resume-btn').click()")
            time.sleep(0.9)
            n = c.js("document.querySelectorAll('.resume-card').length")
            print(f'  Resume Mode: {n} section (ควรเป็น {RESUME_SECTIONS})')
            if n != RESUME_SECTIONS:
                errors.append(f'{cur}: resume {n} sections')
            c.js("document.getElementById('resume-btn').click()")
            time.sleep(0.4)

        errs = c.js("JSON.stringify(window.__errs)")
        print('\nJS errors:', errs)
        if errs and errs != '[]':
            errors.append('js:' + errs)

        print('\n' + ('🎉 ผ่านทั้งหมด' if not errors else f'❌ พบปัญหา: {errors}'))
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
