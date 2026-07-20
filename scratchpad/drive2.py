# drive2.py — เทสเจาะ: เลื่อน panel ดูการ์ดเกม + เช็คสถานะ tilt-shift + FPS ตอนเดิน
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch  # noqa: E402


def main():
    proc, ws = launch()
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

        # ---- สถานะ HD-2D ----
        st = c.js("""JSON.stringify({
          reduced: window.__game.renderer.reduced,
          tiltOn: window.__game.renderer.tiltOn,
          hasMask: !!window.__game.renderer.tiltMask,
          sceneW: window.__game.renderer.sceneBuf.width,
          blurW: window.__game.renderer.blurBuf.width,
          canvasW: window.__game.renderer.canvas.width,
          porings: window.__game.renderer.porings.length,
          hasCatImg: 'catImg' in window.__game.renderer,
          hasCatPeek: typeof window.__game.renderer.catPeek,
        })""")
        print('HD-2D state:', st)

        # ---- ภาษาไทย ----
        c.js("window.__game && document.getElementById('lang-btn').click()")
        time.sleep(0.4)

        # ---- panel event: เลื่อนดูการ์ดเกม ----
        c.send('Page.bringToFront')
        c.js("window.__game.panels.open('event')")
        time.sleep(0.8)
        c.js("document.getElementById('panel-scroll').scrollTop = 99999")
        time.sleep(0.6)
        c.shot('event-bottom')
        info = c.js("""JSON.stringify({
          games: [...document.querySelectorAll('.game-card')].map(x=>({
            studio: x.querySelector('.game-studio')?.textContent,
            title: x.querySelector('.game-title')?.textContent,
            img: x.querySelector('img')?.src.split('/').pop(),
            loaded: x.querySelector('img')?.naturalWidth > 0,
            btn: x.querySelector('.game-btn')?.href,
          })),
          logos: [...document.querySelectorAll('.logo-card.duo img')].map(i=>
            i.alt + (i.naturalWidth>0 ? ' ✓' : ' ✗MISSING')),
          role: document.querySelector('.game-role')?.textContent.slice(0,60),
        }, null, 1)""")
        print('EVENT panel:', info)

        # ---- panel language ----
        c.js("window.__game.panels.open('language')")
        time.sleep(0.7)
        c.shot('lang-th')
        print('LANG:', c.js("""JSON.stringify(
          [...document.querySelectorAll('.use-item')].map(x=>
            x.querySelector('.use-lang').textContent + ' | ' +
            (x.querySelector('.use-level')?.textContent||'') + ' | ' +
            x.querySelector('.use-desc').textContent.slice(0,50)), null, 1)"""))
        print('bars left over?', c.js("document.querySelectorAll('.bar-item').length"))

        # ---- panel network ----
        c.js("window.__game.panels.open('network')")
        time.sleep(0.8)
        c.js("document.getElementById('panel-scroll').scrollTop = 99999")
        time.sleep(0.4)
        c.shot('network-th')
        print('NETWORK slides:', c.js("""JSON.stringify(
          [...document.querySelectorAll('.car-slide')].map(s=>{
            const im=s.querySelector('img');
            return (im ? im.src.split('/').pop() + (im.naturalWidth>0?' ✓':' ✗')
                       : (s.querySelector('.text-card')?.textContent||'?'));
          }))"""))

        # ---- panel other ----
        c.js("window.__game.panels.open('other')")
        time.sleep(0.7)
        c.shot('other-th')
        print('OTHER:', c.js("document.getElementById('panel-body').textContent.slice(0,200)"))

        # ---- bookshelf: TNI + Accenture ต้องหายไป ----
        c.js("window.__game.panels.open('bookshelf')")
        time.sleep(0.7)
        c.shot('bookshelf-th')
        txt = c.js("document.getElementById('panel-body').textContent")
        print('bookshelf has Accenture?', 'Accenture' in (txt or ''))
        print('bookshelf has TNI?', 'TNI' in (txt or ''))

        c.js("window.__game.panels.close()")
        time.sleep(0.4)

        # ---- Resume Mode ----
        c.send('Page.bringToFront')
        c.js("document.getElementById('resume-btn').click()")
        time.sleep(1.0)
        c.shot('resume')
        rtxt = c.js("document.getElementById('resume-body')?.textContent || document.body.textContent")
        for k in ['Pasona', 'Accenture', 'ConSole Hub', 'Thailand Game Development', 'First Page Pro']:
            print(f'  resume contains {k}:', k in (rtxt or ''))
        c.js("document.getElementById('resume-btn').click()")
        time.sleep(0.5)

        # ---- FPS ตอนเดิน (ยิง input ผ่าน CDP จริง) ----
        c.send('Page.bringToFront')
        c.send('Input.dispatchKeyEvent', type='keyDown', code='KeyD', key='d',
               windowsVirtualKeyCode=68, nativeVirtualKeyCode=68)
        fps = c.js("""
          new Promise(res => { let n=0; const t0=performance.now();
            (function t(){ n++; performance.now()-t0 < 2500
              ? requestAnimationFrame(t)
              : res(+(n/((performance.now()-t0)/1000)).toFixed(1)); })(); })
        """, awaitp=True)
        c.send('Input.dispatchKeyEvent', type='keyUp', code='KeyD', key='d',
               windowsVirtualKeyCode=68, nativeVirtualKeyCode=68)
        print(f'FPS while walking = {fps}')
        c.shot('walk')
        print('player pos:', c.js("JSON.stringify({x:Math.round(window.__game.player.x),y:Math.round(window.__game.player.y)})"))

        # ---- ทดสอบกำแพงเหนือ: เทเลพอร์ตขึ้นบน แล้วเดินขึ้นต่อ ----
        c.js("window.__game.player.x=800; window.__game.player.y=200;")
        c.send('Input.dispatchKeyEvent', type='keyDown', code='KeyW', key='w',
               windowsVirtualKeyCode=87, nativeVirtualKeyCode=87)
        time.sleep(2.0)
        c.send('Input.dispatchKeyEvent', type='keyUp', code='KeyW', key='w',
               windowsVirtualKeyCode=87, nativeVirtualKeyCode=87)
        y = c.js("Math.round(window.__game.player.y)")
        print(f'เดินชนกำแพงเหนือแล้วหยุดที่ y={y}  (ต้อง >= 110 + ครึ่งตัว 21 = 131)')
        c.shot('north-wall')

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
