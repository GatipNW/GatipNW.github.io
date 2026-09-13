# ดึงข้อมูลเกมจาก Steam appdetails (EN + TH) → scratchpad/steam/games.json
import json, time, urllib.request, os, sys
IDS = [1830780,2777820,3381190,3528490,3595490,3732490,4006150,4063960,4217380,4233640,4468740,4565560,
       3361340,2228720,1025600,3513350,3774980,4269040]
OUT = os.path.join(os.path.dirname(__file__), 'games.json')
data = json.load(open(OUT, encoding='utf-8')) if os.path.exists(OUT) else {}
def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en'})
    return json.loads(urllib.request.urlopen(req, timeout=30).read().decode('utf-8'))
for a in IDS:
    k = str(a)
    if k in data and data[k].get('th'): continue
    try:
        en = get(f'https://store.steampowered.com/api/appdetails?appids={a}&l=english&cc=us')[k]
        th = get(f'https://store.steampowered.com/api/appdetails?appids={a}&l=thai&cc=th')[k]
    except Exception as e:
        print('ERR', a, e); continue
    if not en.get('success'):
        print('no data', a); data[k] = {'success': False}; continue
    d = en['data']; t = th['data']
    data[k] = {
        'name_en': d.get('name'), 'name_th': t.get('name'), 'type': d.get('type'),
        'required_age': d.get('required_age'), 'developers': d.get('developers'), 'publishers': d.get('publishers'),
        'release': d.get('release_date'), 'header': d.get('header_image'), 'capsule': d.get('capsule_image'),
        'langs': d.get('supported_languages'), 'content_descriptors': d.get('content_descriptors'),
        'genres': [g['description'] for g in d.get('genres', [])], 'short_en': d.get('short_description'),
        'short_th': t.get('short_description'), 'fullgame': d.get('fullgame'),
        'coming_soon': d.get('release_date', {}).get('coming_soon'),
    }
    print(a, data[k]['name_en'], '|', data[k]['name_th'], '| age', data[k]['required_age'], '| thai' , 'Thai' in (data[k]['langs'] or ''))
    json.dump(data, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    time.sleep(1.5)
