# ============================================
# serve.py — dev server สำหรับทดสอบในเครื่อง (แทน python -m http.server)
# ส่ง Cache-Control: no-cache บังคับ browser เช็คไฟล์ใหม่กับ server ทุกครั้ง
# (http.server เปล่าๆ ไม่ส่ง header นี้ → browser ใช้ heuristic cache
#  แล้วจำโมดูลเก่าไว้หลายชั่วโมง — แก้ไฟล์แล้วรีเฟรชไม่เห็นผล)
# วิธีใช้:  python tools/serve.py   → เปิด http://localhost:8123
# ============================================
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = 8123

# เสิร์ฟจาก root ของโปรเจ็คเสมอ ไม่ว่าจะรันสคริปต์จากโฟลเดอร์ไหน
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # no-cache = ใช้ cache ได้แต่ต้องถาม server ก่อนทุกครั้ง (ไฟล์ไม่เปลี่ยน = 304 เร็วเท่าเดิม)
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()


if __name__ == '__main__':
    print(f'dev server: http://localhost:{PORT}')
    ThreadingHTTPServer(('', PORT), NoCacheHandler).serve_forever()
