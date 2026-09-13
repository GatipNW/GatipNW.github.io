import time, sys, os, base64, subprocess, shutil, json, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import drive
from drive import CDP
from PIL import Image
import numpy as np
PDF='file:///C:/Users/Gatip/Desktop/Reume Game Web/ฐานข้อมูล/Nipith_Gogoprint_90x55mm_Final.pdf'  # ★ ไฟนอล 2026-09-13 (เจ้าของวางในฐานข้อมูล/)
shutil.rmtree(drive.UDD, ignore_errors=True)
proc = subprocess.Popen([drive.EDGE, f'--remote-debugging-port={drive.PORT}', '--remote-allow-origins=*',
    f'--user-data-dir={drive.UDD}', '--headless=new', '--mute-audio', '--no-first-run',
    '--force-device-scale-factor=4', '--window-size=1440,1100', PDF], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
ws=None
for _ in range(60):
    time.sleep(0.5)
    try: tabs=json.load(urllib.request.urlopen(f'http://127.0.0.1:{drive.PORT}/json/list',timeout=3))
    except Exception: continue
    for t in tabs:
        if t.get('type')=='page' and 'Gogoprint' in t.get('url',''): ws=t['webSocketDebuggerUrl']
    if ws: break
c = CDP(ws)
try:
    c.send('Page.enable'); time.sleep(6); c.send('Page.bringToFront')
    data = c.send('Page.captureScreenshot', format='png')['data']
    open('scratchpad/shots/card-raw.png','wb').write(base64.b64decode(data))
finally:
    c.close(); proc.terminate()
im = Image.open('scratchpad/shots/card-raw.png').convert('RGB'); a = np.asarray(im).astype(int)
print(im.size)
bg = a[a.shape[0]-50, 50]; print('bg', bg)
mask = (np.abs(a - bg).sum(axis=2) > 30)
mask[:int(im.height*0.06), :] = False
rowany = mask.any(axis=1); runs=[]; start=None
for y in range(len(rowany)):
    if rowany[y] and start is None: start=y
    if not rowany[y] and start is not None:
        if y-start>100: runs.append((start,y))
        start=None
print('pages', runs)
# ★ หน้าแรกโดน mask toolbar ตัดหัว → ใช้ความสูงของหน้า 2 (ครบ) เป็นมาตรฐาน แล้วนับย้อนจากขอบล่างของหน้า 1
y0b, y1b = runs[1]
Hp = y1b - y0b
sub = mask[y0b:y1b]; cs = np.where(sub.any(axis=0))[0]; x0, x1 = cs.min(), cs.max() + 1
Wp = x1 - x0
for i, (y0, y1) in enumerate([(runs[0][1] - Hp, runs[0][1]), (y0b, y1b)]):
    page = im.crop((x0, y0, x1, y1))
    tx = round(Wp * 8.50393701 / 272.126); ty = round(Hp * 8.50393701 / 172.9134)
    trimmed = page.crop((tx, ty, Wp - tx, Hp - ty))
    trimmed.save(f'scratchpad/shots/card-{["front", "back"][i]}.png')
    print(' trimmed', trimmed.size, round(trimmed.size[0] / trimmed.size[1], 3))
