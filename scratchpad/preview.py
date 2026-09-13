# preview.py — ชุดภาพพรีวิวส่งเจ้าของ (desktop 1440×900 + มือถือ 390×844) — ★ ต้องเปิด serve.py ก่อน
import time, sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch
proc, ws = launch(); c = CDP(ws)
def enter():
    c.js("document.getElementById('press-start').click()")
    for _ in range(24):
        c.send('Page.bringToFront'); time.sleep(0.4)
        if c.js('!!(window.__game && window.__game.inGame)'): break
    time.sleep(1.2)
try:
    c.send('Page.enable'); c.send('Runtime.enable')
    c.send('Emulation.setDeviceMetricsOverride', width=1440, height=900, deviceScaleFactor=1, mobile=False)
    c.send('Page.navigate', url='http://localhost:8123/?p=1'); time.sleep(4); c.send('Page.bringToFront')
    c.shot('pv-1-title'); enter()
    # เดินไปใกล้ตู้เกม แล้วจับตอนขยับ
    c.js("(()=>{const g=window.__game;const o=g.objects.find(o=>o.id==='cab-dh');g.input.moveGoal={x:o.x+o.w/2,y:o.y+o.h+60,px:g.player.x,py:g.player.y};})()")
    time.sleep(0.9); c.send('Page.bringToFront'); c.shot('pv-2-walk')
    time.sleep(2.5); c.send('Page.bringToFront'); c.shot('pv-3-room-near-cabinet')
    c.js("window.__game.panels.open('cab-sticky')"); time.sleep(0.8); c.js("document.getElementById('panel-scroll').scrollTop=820"); time.sleep(0.4); c.send('Page.bringToFront'); c.shot('pv-4-games')
    c.js("window.__game.panels.close(); window.__game.panels.open('book-lang')"); time.sleep(0.8); c.send('Page.bringToFront'); c.shot('pv-5-book')
    c.js("window.__game.panels.close(); document.getElementById('resume-btn').click()"); time.sleep(0.9); c.send('Page.bringToFront'); c.shot('pv-6-resume')
    c.js("document.getElementById('resume-mode').scrollTop=document.getElementById('resume-box').scrollHeight"); time.sleep(0.4); c.send('Page.bringToFront'); c.shot('pv-6b-resume-foot')
    c.js("document.getElementById('resume-btn').click(); window.__game.panels.open('reception')"); time.sleep(0.8); c.js("document.getElementById('panel-scroll').scrollTop=420"); time.sleep(0.4); c.send('Page.bringToFront'); c.shot('pv-7-reception')
    # มือถือ
    c.send('Emulation.setDeviceMetricsOverride', width=390, height=844, deviceScaleFactor=2, mobile=True)
    c.send('Page.navigate', url='http://localhost:8123/?p=2&lang=th'); time.sleep(4.5); c.send('Page.bringToFront')
    c.shot('pv-8-mobile-title'); enter(); c.send('Page.bringToFront'); c.shot('pv-8b-mobile-room')
    c.js("window.__game.panels.open('cab-sticky')"); time.sleep(0.8); c.js("document.getElementById('panel-scroll').scrollTop=900"); time.sleep(0.4); c.send('Page.bringToFront'); c.shot('pv-8c-mobile-games')
finally:
    c.close(); proc.terminate()
