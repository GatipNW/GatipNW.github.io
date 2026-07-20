# ============================================
# serve.py — dev server สำหรับทดสอบในเครื่อง (ES Modules เปิดผ่าน file:// ไม่ได้)
# ★ ห้ามใช้ `python -m http.server` เปล่าๆ: ไม่ส่ง Cache-Control ทำให้ browser
#   จำโมดูลเก่าหลายชั่วโมง แก้ไฟล์แล้วรีเฟรชไม่เห็นผล (เจอมาแล้ว 2026-07-17)
# วิธีรัน:  python tools/serve.py   → เปิด http://localhost:8123
# ============================================
import http.server
import os

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
PORT = 8123


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, *args):
        pass  # เงียบไว้ ไม่ spam console


print(f'serving on http://localhost:{PORT}')
http.server.ThreadingHTTPServer(('127.0.0.1', PORT), NoCacheHandler).serve_forever()
