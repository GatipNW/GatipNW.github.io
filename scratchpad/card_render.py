import time, sys, os, base64, subprocess, shutil, json, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import drive
from drive import CDP
from PIL import Image
import numpy as np
PDF='file:///C:/Users/Gatip/Desktop/Resume/นามบัตร/Business_Card.pdf'
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
        if t.get('type')=='page' and 'Business_Card' in t.get('url',''): ws=t['webSocketDebuggerUrl']
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
for i,(y0,y1) in enumerate(runs[:2]):
    sub = mask[y0:y1]; cs = np.where(sub.any(axis=0))[0]
    page = im.crop((cs.min(), y0, cs.max()+1, y1))
    W,H = page.size; print('page',i,W,H, W/H)
    tx = round(W*8.50393701/272.126); ty = round(H*8.50393701/172.9134)
    trimmed = page.crop((tx,ty,W-tx,H-ty))
    trimmed.save(f'scratchpad/shots/card-{["front","back"][i]}.png')
    print(' trimmed', trimmed.size, trimmed.size[0]/trimmed.size[1])
