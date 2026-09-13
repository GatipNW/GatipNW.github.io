# final.py — ตรวจรอบสุดท้าย: ทุก panel ครบ 3 ภาษา + ไม่มี console error
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch  # noqa: E402

# ★ 2026-07-20: + 'esport' (ตู้ที่ 5 แถวเหนือ) = 13 วัตถุ / Resume Mode 13 section
#   (Resume มี 'skills' เพิ่มแต่ไม่มี 'door' → จำนวนเท่ากันพอดี)
# ★ 2026-09-13 ห้องสมุดดวงจันทร์: 11 โซน (ตู้เกม 4 · หนังสือ 6 · โต๊ะต้อนรับ 1) — บางโซนมีหลายบท
#   Resume Mode = 14 section (panel id เดิมทั้งหมด รวม skills)
IDS = ['cab-sticky', 'cab-dh', 'cab-free', 'cab-next', 'book-events', 'book-content',
       'book-lang', 'book-journey', 'book-write', 'book-other', 'reception']
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
            pass
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
                # โซนหลายบท: กดทุกแท็บต้องมีเนื้อหา
                ntab = c.js("document.querySelectorAll('#panel-tabs .tab').length")
                tab_ok = True
                for k in range(1, ntab):
                    c.js(f"document.querySelectorAll('#panel-tabs .tab')[{k}].click()")
                    time.sleep(0.2)
                    if not c.js("document.getElementById('panel-body')?.textContent?.length"):
                        tab_ok = False
                if not t or not body or not tab_ok:
                    missing.append(pid)
                else:
                    print(f'  ✓ {pid:13} {t}  ({body} ตัวอักษร · {ntab} บท)')
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
