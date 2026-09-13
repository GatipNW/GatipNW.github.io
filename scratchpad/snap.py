# snap.py — จับภาพชุดพรีวิว + ดัก JS error (ใช้ระหว่างพัฒนาฉากใหม่)
import time, sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch
proc, ws = launch()
c = CDP(ws)
try:
    c.send('Page.enable'); c.send('Runtime.enable'); c.send('Log.enable'); c.send('Page.bringToFront')
    c.js("window.__errs=[];addEventListener('error',e=>__errs.push(''+e.message+' @'+(e.filename||'')+':'+e.lineno));addEventListener('unhandledrejection',e=>__errs.push('rej:'+e.reason));")
    time.sleep(3.5)
    print('errs:', c.js("JSON.stringify(window.__errs)"), '| __game:', c.js('typeof window.__game'))
    c.shot('01-title')
    c.js("document.getElementById('press-start')?.click()")
    for _ in range(24):
        c.send('Page.bringToFront'); time.sleep(0.4)
        if c.js('!!(window.__game && window.__game.inGame)'): break
    time.sleep(1.5); c.send('Page.bringToFront')
    print('inGame', c.js('window.__game && window.__game.inGame'), 'errs:', c.js("JSON.stringify(window.__errs)"))
    c.shot('02-room')
    c.js("window.__game.panels.open('cab-sticky')"); time.sleep(0.8); c.send('Page.bringToFront'); c.shot('03-panel-games')
    c.js("window.__game.panels.close(); window.__game.panels.open('book-content')"); time.sleep(0.6); c.send('Page.bringToFront'); c.shot('04-panel-book')
    c.js("window.__game.panels.close(); window.__game.panels.open('reception')"); time.sleep(0.6); c.send('Page.bringToFront'); c.shot('05-panel-reception')
    c.js("window.__game.panels.close(); document.getElementById('resume-btn').click()"); time.sleep(1); c.send('Page.bringToFront'); c.shot('06-resume')
    c.js("document.getElementById('resume-btn').click(); document.getElementById('menu-btn').click()"); time.sleep(0.5); c.send('Page.bringToFront'); c.shot('07-menu')
    print('errs final:', c.js("JSON.stringify(window.__errs)"))
finally:
    c.close(); proc.terminate()
