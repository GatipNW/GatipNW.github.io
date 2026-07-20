# ============================================
# mobile.py — เทสจอมือถือ/จอสัมผัสจริง (ค้างมาตั้งแต่ M6)
#   จำลอง 3 ขนาด: 360×640 (เล็กสุดที่รองรับ) · 390×844 (iPhone) · 768×1024 (tablet)
#   เช็ค: ล้นขอบจอแนวนอนไหม · ปุ่ม/ป้ายอยู่ในจอครบไหม · panel เปิด+เลื่อนได้ไหม
#         · จอยสติ๊ก+ปุ่ม ✦ โผล่ตอนแตะไหม · Resume Mode อ่านได้ไหม
#   ★ ตรวจ touch ต้องยิง Input.dispatchTouchEvent จริง — เกมเช็ค pointerType==='touch'
# ============================================
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch  # noqa: E402

SIZES = [
    ('360x640', 360, 640, 3),
    ('390x844', 390, 844, 3),
    ('768x1024', 768, 1024, 2),
]


def metrics(c, w, h, dpr):
    c.send('Emulation.setDeviceMetricsOverride', width=w, height=h,
           deviceScaleFactor=dpr, mobile=True)


# ★★ กับดัก 2 อัน (เจอตอนเขียนเทสนี้):
#   1) `Emulation.setTouchEmulationEnabled` **ต้องสั่งหลัง Page.reload เสมอ**
#      ถ้าสั่งก่อน navigation จะล้างทิ้ง → หน้าเว็บได้ pointerType 'mouse' ตลอด
#      แล้วเข้าใจผิดว่าโหมดมือถือพัง (ทั้งที่โค้ดถูก)
#   2) **ห้ามใช้ `Emulation.setEmitTouchEventsForMouse`** — พอสั่งแล้วยิง
#      dispatchMouseEvent ต่อ Edge จะไม่ตอบกลับ websocket ค้างยาว
def enable_touch(c):
    c.send('Emulation.setTouchEmulationEnabled', enabled=True, maxTouchPoints=5)


def wait_title(c, tries=30):
    """รอจน Title พร้อมจริง (อย่าใช้ sleep ตายตัว — บางขนาดโหลดช้ากว่า)"""
    for _ in range(tries):
        c.send('Page.bringToFront')
        time.sleep(0.4)
        if c.js("!!document.getElementById('intro-logo')?.getBoundingClientRect().width")                 and not c.js('!!(window.__game && window.__game.inGame)'):
            return True
    return False


def overflow(c):
    return c.js("""(() => {
      const d = document.documentElement;
      const wide = [...document.querySelectorAll('body *')]
        .filter(e => { const r = e.getBoundingClientRect();
                       return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1); })
        .map(e => (e.id || e.className || e.tagName) + '@' +
                  Math.round(e.getBoundingClientRect().left) + '..' +
                  Math.round(e.getBoundingClientRect().right))
        .slice(0, 8);
      return JSON.stringify({ scrollW: d.scrollWidth, innerW: innerWidth, wide });
    })()""")


def tap(c, x, y):
    """แตะจริงแบบ touch (ไม่ใช่ click) — เกมแยก touch/mouse จาก pointerType"""
    try:
        c.send('Input.dispatchTouchEvent', type='touchStart',
               touchPoints=[{'x': x, 'y': y, 'radiusX': 12, 'radiusY': 12}])
        time.sleep(0.1)
        c.send('Input.dispatchTouchEvent', type='touchEnd', touchPoints=[])
    except Exception as e:
        print('   (touch tap ล้มเหลว:', type(e).__name__, ') — ใช้ pointerdown แทน')
        c.js("document.getElementById('intro').dispatchEvent("
             "new PointerEvent('pointerdown',{pointerType:'touch',bubbles:true}))")
    time.sleep(0.2)


def main():
    proc, ws = launch()
    c = None
    problems = []
    try:
        c = CDP(ws)
        c.send('Page.enable')
        c.send('Runtime.enable')

        # ★ warm-up: โหลดหน้าแรกให้จบก่อนเข้าลูป — ไม่งั้นรอบแรก navigate ไปชนกับ
        #   การโหลดครั้งแรกตอน launch() แล้ว "หน้าเก่าถูกแทนที่กลางคัน"
        #   → คำสั่ง js/touch ไปตกที่เอกสารเก่า (เห็นเป็น touch=False, hover=None
        #     เฉพาะขนาดแรกเท่านั้น ทั้งที่โค้ดถูก — หลงคิดว่า 360px พังอยู่ 2 รอบ)
        c.send('Page.navigate', url='http://localhost:8123/?warm=1')
        wait_title(c)

        for name, w, h, dpr in SIZES:
            print(f'\n=== {name} (dpr {dpr}) ===')
            c.send('Page.bringToFront')
            metrics(c, w, h, dpr)
            # ★ ใช้ Page.navigate + query กันแคช แทน Page.reload —
            #   reload รอบที่ 2 เป็นต้นไปมักไม่โหลดใหม่จริง (ยังค้างสถานะในเกมอยู่)
            c.send('Page.navigate', url=f'http://localhost:8123/?m={w}')
            ready = wait_title(c)
            # ★ ต้องรอต่ออีก ~2.5s ให้จอ #boot จางหมด + ตัวอักษรโลโก้ slam ลงครบ
            #   ไม่งั้นภาพที่จับได้จะเห็นแค่ม่านมืด+ตรา 月 ของจอโหลด แล้วเข้าใจผิดว่า
            #   "โลโก้หายไปบนมือถือ" (หลงมาแล้ว)
            time.sleep(2.6)
            enable_touch(c)            # ★ ต้องหลัง reload (ดูคอมเมนต์ด้านบน)
            print('  Title พร้อม =', ready)
            if not ready:
                problems.append(f'{name} Title ไม่ขึ้นภายในเวลา')

            ov = json.loads(overflow(c))
            print(f'  Title: scrollW={ov["scrollW"]} innerW={ov["innerW"]}')
            if ov['scrollW'] > ov['innerW'] + 1:
                problems.append(f'{name} title ล้นแนวนอน {ov["scrollW"]}>{ov["innerW"]} {ov["wide"]}')
                print('   ⚠ ล้น:', ov['wide'])
            c.shot(f'mob-{name}-1title')

            # ปุ่มบนหน้า Title ต้องอยู่ในจอครบ
            box = c.js("""JSON.stringify(['press-start','title-resume','intro-role','hud']
              .map(id => { const e = document.getElementById(id); if (!e) return [id, null];
                const r = e.getBoundingClientRect();
                return [id, Math.round(r.left), Math.round(r.right), Math.round(r.top)]; }))""")
            print('  ปุ่ม/ข้อความ:', box)

            # เข้าเกมด้วยการ "แตะ" จริง
            c.send('Page.bringToFront')
            # ★ แตะ "ที่ว่าง" ด้านบนเพื่อเริ่มเกม — ห้ามแตะช่วงล่าง เพราะจอ 360px
            #   ตรงนั้นคือปุ่ม PRESS START / ดู Resume พอดี (เคยแตะโดนปุ่ม Resume
            #   แล้วเปิด Resume Mode ค้าง → เทสรายงานว่า "360px ไม่เข้าโหมด touch"
            #   ทั้งที่เว็บไม่ได้พัง — เสียเวลาไล่อยู่ 3 รอบ)
            tap(c, w // 2, int(h * 0.22))
            for _ in range(20):
                c.send('Page.bringToFront')
                c.js("document.getElementById('intro-skip')?.click()")
                c.js("document.querySelector('#lang-pick button, .choice-btn')?.click()")
                time.sleep(0.5)
                if c.js('!!(window.__game && window.__game.inGame)'):
                    break
            print('  inGame =', c.js('window.__game && window.__game.inGame'))

            # จอยสติ๊ก: แตะค้างครึ่งซ้าย
            c.send('Page.bringToFront')
            enable_touch(c)   # ★ สั่งซ้ำก่อนใช้จริง — รอบแรกสุด emulation ชนกับ
                              #   navigation ตอน launch แล้วโดนล้าง (เจอมาแล้ว)
            c.send('Input.dispatchTouchEvent', type='touchStart',
                   touchPoints=[{'x': int(w * 0.22), 'y': int(h * 0.78)}])
            time.sleep(0.6)
            print('  touch mode =', c.js('window.__game.input.touch'),
                  '· joystick โผล่ =', c.js("!document.getElementById('joystick').classList.contains('hidden')"))
            if not c.js('window.__game.input.touch'):
                problems.append(f'{name} ไม่เข้าโหมด touch')
            c.shot(f'mob-{name}-2joystick')
            # ★ ปล่อยนิ้วด้วย pointerup ทาง JS — CDP touchEnd (touchPoints ว่าง) ทำให้
            #   Edge ไม่ตอบกลับแล้ว websocket ค้าง (เจอมาแล้ว) อย่าใช้
            c.js("window.dispatchEvent(new PointerEvent('pointerup',"
                 "{pointerType:'touch', bubbles:true}))")

            # ปุ่ม ✦ ต้องโผล่เมื่อเข้าใกล้วัตถุ
            c.send('Page.bringToFront')
            c.js("""(() => { const g = window.__game;
              const o = g.objects.find(o => o.id === 'youtube');
              g.player.x = o.x + o.w / 2; g.player.y = o.y - 40; })()""")
            time.sleep(0.8)
            c.send('Page.bringToFront')
            print('  hover =', c.js('window.__game.hover && window.__game.hover.id'),
                  '· ปุ่ม ✦ โผล่ =', c.js("!document.getElementById('interact-btn').classList.contains('hidden')"))

            # เปิด panel แล้วเช็คว่าอ่าน/เลื่อนได้ ไม่ล้นจอ
            c.js("window.__game.panels.open('event')")
            time.sleep(1.0)
            c.send('Page.bringToFront')
            pv = c.js("""(() => { const b = document.getElementById('panel-box');
              const s = document.getElementById('panel-scroll'); const r = b.getBoundingClientRect();
              return JSON.stringify({ w: Math.round(r.width), h: Math.round(r.height),
                left: Math.round(r.left), scrollable: s.scrollHeight > s.clientHeight + 2,
                fontPx: getComputedStyle(document.querySelector('#panel-body .bullets li')).fontSize }); })()""")
            print('  panel:', pv)
            pvj = json.loads(pv)
            if pvj['left'] < -1 or pvj['w'] > w + 1:
                problems.append(f'{name} panel ล้นจอ {pv}')
            # ★ เช็คว่าปุ่ม HUD ไปทับปุ่มปิด panel ไหม (จอแคบ panel เกือบเต็มจอ)
            hit = c.js("""(() => {
              const cl = document.getElementById('panel-close').getBoundingClientRect();
              const hits = [...document.querySelectorAll('#hud button')]
                .filter(b => !b.classList.contains('hidden'))
                .filter(b => { const r = b.getBoundingClientRect();
                  return !(r.right < cl.left || r.left > cl.right ||
                           r.bottom < cl.top || r.top > cl.bottom); })
                .map(b => b.id);
              return JSON.stringify(hits); })()""")
            print('  HUD ทับปุ่มปิด panel:', hit)
            if hit != '[]':
                problems.append(f'{name} HUD ทับปุ่มปิด panel {hit}')
            c.shot(f'mob-{name}-3panel')
            ov2 = json.loads(overflow(c))
            if ov2['scrollW'] > ov2['innerW'] + 1:
                problems.append(f'{name} panel ล้นแนวนอน {ov2["wide"]}')
                print('   ⚠ ล้น:', ov2['wide'])
            c.js("window.__game.panels.close()")

            # Resume Mode
            c.send('Page.bringToFront')
            c.js("document.getElementById('resume-btn').click()")
            time.sleep(1.2)
            c.send('Page.bringToFront')
            ov3 = json.loads(overflow(c))
            print('  resume: scrollW=%s innerW=%s cards=%s' %
                  (ov3['scrollW'], ov3['innerW'], c.js("document.querySelectorAll('.resume-card').length")))
            if ov3['scrollW'] > ov3['innerW'] + 1:
                problems.append(f'{name} resume ล้นแนวนอน {ov3["wide"]}')
                print('   ⚠ ล้น:', ov3['wide'])
            c.shot(f'mob-{name}-4resume')
            c.js("document.getElementById('resume-btn').click()")

        print('\n' + ('🎉 ผ่านทุกขนาด' if not problems else '❌ พบปัญหา:'))
        for p in problems:
            print('  -', p)
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
