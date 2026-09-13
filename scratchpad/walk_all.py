# walk_all.py — คลิกไปทุกวัตถุจากจุดเกิด ต้องเดินถึงและเปิด panel ได้เอง + วัด ms/เฟรม
import time, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch
proc, ws = launch()
c = CDP(ws)
try:
    c.send('Page.enable'); c.send('Runtime.enable'); c.send('Page.bringToFront'); time.sleep(3.5)
    c.js("document.getElementById('press-start')?.click()")
    for _ in range(24):
        c.send('Page.bringToFront'); time.sleep(0.4)
        if c.js('!!(window.__game && window.__game.inGame)'): break
    time.sleep(1)
    ids = c.js("JSON.stringify(window.__game.objects.map(o=>o.id))")
    fails = []
    for oid in eval(ids):
        c.send('Page.bringToFront')
        c.js(f"""(()=>{{const g=window.__game; g.panels.close(); g.player.x=g.map.spawn.x; g.player.y=g.map.spawn.y; g.player.vx=g.player.vy=0;
          const o=g.objects.find(o=>o.id==='{oid}'); const cam=g.camera;
          const sx=(o.x+o.w/2-cam.left)*cam.scale, sy=(o.y+o.h/2-cam.top)*cam.scale;
          g.input.clickTarget={{sx,sy}};}})()""")
        ok=False
        for _ in range(40):
            time.sleep(0.2); c.send('Page.bringToFront')
            if c.js("window.__game.panels.openId")==oid: ok=True; break
        d = c.js(f"(()=>{{const g=window.__game;const o=g.objects.find(o=>o.id==='{oid}');return Math.round(Math.hypot(g.player.x-(o.x+o.w/2), g.player.y-(o.y+o.h/2)))}})()")
        print(f"  {oid:13} {'✓ เปิดได้' if ok else '❌ ไม่เปิด'} (ห่างศูนย์กลาง {d}px)")
        if not ok: fails.append(oid)
    c.js("window.__game.panels.close()")
    ms = c.js("""new Promise(res=>{const r=window.__game.renderer;const st={camera:window.__game.camera,map:window.__game.map,objects:window.__game.objects,player:window.__game.player,time:0,waypoint:null,hover:null,labels:{},prompt:''};
      const ts=[];for(let i=0;i<120;i++){st.time=i/60;const t0=performance.now();r.draw(st);ts.push(performance.now()-t0);}ts.sort((a,b)=>a-b);res(ts[60].toFixed(2)+' / p90 '+ts[108].toFixed(2));})""", awaitp=True)
    print('renderer.draw ms median / p90 =', ms)
    print('🎉 เดินถึงทุกวัตถุ' if not fails else f'❌ {fails}')
finally:
    c.close(); proc.terminate()
