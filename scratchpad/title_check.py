# title_check.py — จับภาพช่วงเปิดเว็บทีละวินาที ดูว่ามีโลโก้กระติ๊บค้างมุมซ้ายบนไหม
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
        c.send('Network.enable')
        c.send('Network.setCacheDisabled', cacheDisabled=True)
        c.send('Page.bringToFront')
        c.send('Page.reload', ignoreCache=True)
        for i in range(1, 6):
            time.sleep(0.85)
            c.shot(f't{i}')
            s = c.js("""JSON.stringify({
              kratib: (()=>{const k=document.getElementById('kratib');
                if(!k) return 'ไม่มี';
                const r=k.getBoundingClientRect();
                return getComputedStyle(k).visibility+' @'+Math.round(r.x)+','+Math.round(r.y);})(),
              press: document.getElementById('press-start')?.textContent || '(ว่าง)',
            })""")
            print(f'  ~{i*0.85:.1f}s  {s}')
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
