# ============================================
# followers.py — ลองดึงยอดผู้ติดตามจริงของเพจในเครือข่าย (YouTube / Facebook)
#   ★ CLAUDE.md เคยระบุว่า "ยอด subs จากหน้า channel เชื่อไม่ได้" — สคริปต์นี้ทำให้
#     เห็นว่าดึงอะไรได้จริงบ้าง แล้วค่อยให้เจ้าของยืนยัน ไม่ใช่เอาไปใส่เว็บทันที
#   curl เปล่าไม่ได้ผล (ต้องรัน JS) จึงเปิดผ่าน Edge headless ตัวเดียวกับที่ใช้เทส
# ============================================
import re
import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive import CDP, launch  # noqa: E402

TARGETS = [
    ('NPC Gatip (เจ้าของ)', 'https://www.youtube.com/@NPCGatip'),
    ('โปจิโปจิ', 'https://www.youtube.com/@pochix2'),
    ('เกมถูกบอกด้วย', 'https://www.facebook.com/sheapgamer'),
    ('เกมเมอร์อมตีน', 'https://www.facebook.com/gameromteen'),
    ('Kagami VN', 'https://www.facebook.com/kagamivisualnovel'),
    ('ConSole Hub', 'https://www.facebook.com/ConSoleHubTH'),
    ('Cherry Kiss Thai', 'https://www.facebook.com/cherrykissthai'),
]

PATS = [
    r'([\d.,]+\s*(?:K|M|พัน|หมื่น|แสน|ล้าน)?)\s*(?:subscribers|ผู้ติดตาม|followers)',
    r'(?:ผู้ติดตาม|followers)\s*([\d.,]+\s*(?:K|M|พัน|หมื่น|แสน|ล้าน)?)',
]


def main():
    proc, ws = launch()
    c = None
    try:
        c = CDP(ws)
        c.send('Page.enable')
        c.send('Runtime.enable')
        for name, url in TARGETS:
            c.send('Page.navigate', url=url)
            time.sleep(6)
            c.send('Page.bringToFront')
            try:
                txt = c.js("document.body.innerText.slice(0, 20000)") or ''
                title = c.js("document.title")
            except Exception as e:
                print(f'{name:22} ERROR {e}')
                continue
            hits = []
            for p in PATS:
                hits += re.findall(p, txt)
            hits = [h.strip() for h in hits if h.strip()][:4]
            print(f'{name:22} | {str(title)[:40]:42} | {hits}')
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
