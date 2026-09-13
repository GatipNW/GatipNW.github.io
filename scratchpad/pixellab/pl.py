# PixelLab helper — token read at runtime from the owner's own Claude config; never written anywhere
import json, os, re, sys, base64, time, urllib.request, urllib.error
def token():
    d = json.load(open(os.path.expanduser('~/.claude.json'), encoding='utf-8'))
    for proj in d.get('projects', {}).values():
        srv = (proj.get('mcpServers') or {}).get('pixellab')
        if srv:
            return srv['headers']['Authorization'].split()[-1]
    raise SystemExit('no pixellab token in config')
BASE = 'https://api.pixellab.ai/v1'
def call(path, body=None, method=None, timeout=300):
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body is not None else None,
        method=method or ('POST' if body is not None else 'GET'),
        headers={'Authorization': 'Bearer ' + token(), 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        raise SystemExit(f'HTTP {e.code} {path}: {e.read().decode()[:800]}')
def img_b64(path):
    return {'type': 'base64', 'base64': base64.b64encode(open(path, 'rb').read()).decode()}
def save_b64(b64, path):
    open(path, 'wb').write(base64.b64decode(b64)); return path
if __name__ == '__main__':
    print(json.dumps(call('/balance'), indent=1))
