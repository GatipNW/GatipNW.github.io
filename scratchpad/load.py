# load.py — วัดว่าอะไรทำให้ช่วงก่อนเข้า Title ช้า (cold cache)
import json
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
        c.send('Network.setCacheDisabled', cacheDisabled=True)   # จำลอง cold cache
        c.send('Page.bringToFront')
        c.send('Page.reload', ignoreCache=True)
        time.sleep(7)

        t = c.js("""JSON.stringify((() => {
          const n = performance.getEntriesByType('navigation')[0] || {};
          const res = performance.getEntriesByType('resource')
            .map(r => ({name: r.name.split('/').slice(-1)[0],
                        start: +r.startTime.toFixed(0),
                        end: +r.responseEnd.toFixed(0),
                        ms: +r.duration.toFixed(0),
                        kb: +(r.transferSize/1024).toFixed(0)}))
            .sort((a,b) => b.end - a.end).slice(0, 14);
          return { domContentLoaded: +n.domContentLoadedEventEnd.toFixed(0),
                   loadEvent: +n.loadEventEnd.toFixed(0),
                   firstPaint: +(performance.getEntriesByName('first-contentful-paint')[0]?.startTime||0).toFixed(0),
                   slowest: res };
        })())""")
        d = json.loads(t)
        print(f"DOMContentLoaded : {d['domContentLoaded']} ms")
        print(f"first paint      : {d['firstPaint']} ms")
        print(f"load event       : {d['loadEvent']} ms")
        print('\nทรัพยากรที่จบช้าที่สุด (end = เวลาที่โหลดเสร็จนับจากเริ่มโหลดหน้า):')
        for r in d['slowest']:
            print(f"  end={r['end']:>6} ms  ({r['ms']:>5} ms, {r['kb']:>4} KB)  {r['name'][:60]}")

        vis = c.js("""JSON.stringify({
          kratibReady: document.getElementById('kratib')?.classList.contains('ready'),
          kratibVisible: getComputedStyle(document.getElementById('kratib')).visibility,
          pressStart: document.getElementById('press-start')?.textContent,
        })""")
        print('\nสถานะ:', vis)
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
