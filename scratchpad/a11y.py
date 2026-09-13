# a11y.py — focus trap / คืนโฟกัส / Escape ของ Resume · panel · เมนู · lightbox + ตรวจ label hardcode + asset โหลด
import time, sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch
proc, ws = launch()
c = CDP(ws); bad=[]
def key(code, shift=False):
    for t in ('keyDown','keyUp'):
        c.send('Input.dispatchKeyEvent', type=t, key='Tab' if code=='Tab' else 'Escape', code=code, windowsVirtualKeyCode=9 if code=='Tab' else 27, modifiers=8 if shift else 0)
try:
    c.send('Page.enable'); c.send('Runtime.enable'); c.send('Network.enable'); c.send('Page.bringToFront')
    c.js("window.__errs=[];window.__fail=[];addEventListener('error',e=>__errs.push(''+e.message));")
    time.sleep(3.5)
    # 1) Resume จากหน้าแรก: โฟกัสวนใน modal, Esc ปิด, โฟกัสกลับปุ่มที่เปิด
    c.js("document.getElementById('title-resume').focus(); document.getElementById('title-resume').click()"); time.sleep(0.8)
    key('Tab', shift=True)
    inside = c.js("document.getElementById('resume-mode').contains(document.activeElement)")
    print('resume: Shift+Tab จากปุ่มปิดยังอยู่ใน modal =', inside)
    if not inside: bad.append('resume trap')
    for _ in range(3): key('Tab')
    print('  หลัง Tab ×3 ยังอยู่ใน modal =', c.js("document.getElementById('resume-mode').contains(document.activeElement)"))
    key('Escape'); time.sleep(0.3)
    ret = c.js("document.activeElement && document.activeElement.id")
    print('  Esc ปิดแล้ว โฟกัสกลับที่ =', ret, '| ปิดจริง =', c.js("document.getElementById('resume-mode').classList.contains('hidden')"))
    if ret != 'title-resume': bad.append('resume return focus')
    # เข้าเกม
    c.js("document.getElementById('press-start').click()")
    for _ in range(24):
        c.send('Page.bringToFront'); time.sleep(0.4)
        if c.js('!!(window.__game && window.__game.inGame)'): break
    # 2) เมนู: M เปิด → Esc ปิด → โฟกัสกลับปุ่มเมนู
    c.js("document.getElementById('menu-btn').focus(); document.getElementById('menu-btn').click()"); time.sleep(0.4)
    print('menu: โฟกัสอยู่ในเมนู =', c.js("document.getElementById('menu').contains(document.activeElement)"))
    key('Tab', shift=True); print('  Shift+Tab ยังอยู่ในเมนู =', c.js("document.getElementById('menu').contains(document.activeElement)"))
    key('Escape'); time.sleep(0.2); print('  Esc → โฟกัส =', c.js("document.activeElement.id"))
    # 3) panel + รายละเอียดเกม + lightbox
    c.js("document.getElementById('menu-btn').click()"); time.sleep(0.3)
    c.js("[...document.querySelectorAll('.menu-item')].find(b=>b.textContent.includes('Reception')||b.textContent.includes('โต๊ะ')||b.textContent.includes('受付')).click()"); time.sleep(0.8)
    print('panel: โฟกัสในกล่อง =', c.js("document.getElementById('panel').contains(document.activeElement)"))
    c.js("document.querySelector('.card-fig').focus(); document.querySelector('.card-fig').click()"); time.sleep(0.4)
    print('lightbox: เปิด =', c.js("!document.getElementById('lightbox').classList.contains('hidden')"), '| โฟกัสที่ปุ่มปิด =', c.js("document.activeElement.className"))
    key('Tab'); print('  Tab ยังอยู่ที่ปุ่มปิด =', c.js("document.activeElement.className==='lb-close'"))
    key('Escape'); time.sleep(0.2); print('  Esc → โฟกัสกลับ =', c.js("document.activeElement.className"), '| lightbox ปิด =', c.js("document.getElementById('lightbox').classList.contains('hidden')"))
    if c.js("document.activeElement.className")!='card-fig': bad.append('lightbox return focus')
    key('Escape'); time.sleep(0.3)
    print('  Esc อีกครั้ง → panel ปิด =', c.js("!window.__game.panels.isOpen"), '| โฟกัส =', c.js("document.activeElement.id||document.activeElement.className"))
    # 4) ชื่อเกมตามภาษา
    c.js("window.__game.panels.open('cab-sticky')"); time.sleep(0.6)
    en_t = c.js("document.querySelector('.gcard-title').textContent"); en_th = c.js("!!document.querySelector('.gcard-th')")
    c.js("document.getElementById('lang-btn').click()"); time.sleep(0.5)
    print('ชื่อเกม EN =', en_t[:40], '| มีชื่อรอง =', en_th)
    cur=c.js("document.documentElement.lang"); t2=c.js("document.querySelector('.gcard-title').textContent"); print(' ภาษา',cur,'ชื่อหลัก =', t2[:40])
    c.js("document.querySelector('.gcard-more').click()"); time.sleep(0.2); print('  รายละเอียดมีชื่อไทย =', c.js("!!document.querySelector('.gcard-thai')"))
    # 5) label hardcode ที่เหลือ
    print('labels:', c.js("JSON.stringify(['interact-btn','mute-btn','home-btn','cta-close','menu-btn'].map(i=>[i,document.getElementById(i).getAttribute('aria-label')]))"))
    print('viewport:', c.js("document.querySelector('meta[name=viewport]').content"))
    print('JS errors:', c.js("JSON.stringify(window.__errs)"))
    print('✅ a11y ok' if not bad else f'❌ {bad}')
finally:
    c.close(); proc.terminate()
