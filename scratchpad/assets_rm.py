# assets_rm.py — (1) asset ทุกตัวที่หน้าเว็บอ้างถึงโหลดได้ (2) โหมด prefers-reduced-motion เข้าเกมได้ ไม่มี error
import time, sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch
proc, ws = launch(); c = CDP(ws)
try:
    c.send('Page.enable'); c.send('Runtime.enable'); c.send('Page.bringToFront')
    c.js("window.__errs=[];addEventListener('error',e=>__errs.push(''+e.message),true);")
    time.sleep(3.5)
    c.js("document.getElementById('press-start').click()")
    for _ in range(24):
        c.send('Page.bringToFront'); time.sleep(0.4)
        if c.js('!!(window.__game && window.__game.inGame)'): break
    ids = json.loads(c.js("JSON.stringify(window.__game.objects.map(o=>o.id))"))
    urls=set()
    for oid in ids:
        c.js(f"window.__game.panels.open('{oid}')"); time.sleep(0.4)
        c.js("document.querySelectorAll('.gcard-reveal').forEach(b=>b.click())"); time.sleep(0.3)
        urls.update(json.loads(c.js("JSON.stringify([...document.querySelectorAll('#panel img')].map(i=>i.getAttribute('src')))")))
        urls.update(json.loads(c.js("JSON.stringify([...document.querySelectorAll('#panel a[href]')].map(a=>a.getAttribute('href')).filter(h=>h.startsWith('assets/')))")))
    c.js("window.__game.panels.close(); document.getElementById('resume-btn').click()"); time.sleep(0.8)
    urls.update(json.loads(c.js("JSON.stringify([...document.querySelectorAll('#resume-box a[href]')].map(a=>a.getAttribute('href')).filter(h=>h.startsWith('assets/')))")))
    urls.update(['assets/lib-base.webp','assets/lib-view.webp','assets/kratib.webp','assets/bg-sky.webp','assets/bg-mid.webp','assets/bg-near.webp','assets/moon1.webp','assets/moon2.webp','assets/audio/303pm-sharou.mp3','css/style.css'])
    urls={u for u in urls if u}
    res = c.js("(async()=>{const out=[];for(const u of %s){try{const r=await fetch(u,{method:'HEAD'});if(!r.ok)out.push(u+' → '+r.status);}catch(e){out.push(u+' → '+e)}}return JSON.stringify(out)})()" % json.dumps(sorted(urls)), awaitp=True)
    print(f'asset ที่อ้างถึง {len(urls)} รายการ · โหลดไม่ได้:', res)
    print('JS errors:', c.js("JSON.stringify(window.__errs)"))
    # ---- reduced motion ----
    c.send('Emulation.setEmulatedMedia', features=[{'name':'prefers-reduced-motion','value':'reduce'}])
    c.send('Page.navigate', url='http://localhost:8123/?rm=1'); time.sleep(3.5); c.send('Page.bringToFront')
    c.js("window.__errs=[];addEventListener('error',e=>__errs.push(''+e.message),true);")
    print('reduced: renderer.reduced =', c.js("window.__game.renderer.reduced"), '| ปุ่ม FULL FX โผล่ =', c.js("!!document.getElementById('fx-btn')"))
    c.js("document.getElementById('press-start').click()")
    ok=False
    for _ in range(24):
        c.send('Page.bringToFront'); time.sleep(0.4)
        if c.js('!!(window.__game && window.__game.inGame)'): ok=True; break
    print('  เข้าเกมได้ =', ok, '| tilt ปิด =', c.js("!window.__game.renderer.tiltOn"), '| errors:', c.js("JSON.stringify(window.__errs)"))
    c.shot('rm-room')
finally:
    c.close(); proc.terminate()
