"""
프론트엔드 개발용 서버 (Python 표준 라이브러리만 사용, 설치할 것 없음)

- frontend/ 폴더의 html·css·js 파일을 그대로 보여 준다.
- /api/* 요청은 '/api'를 떼고 FastAPI(기본 http://127.0.0.1:8080)로 전달한다.
  백엔드에 CORS 설정이 없어도 같은 주소처럼 호출할 수 있다.

실행:  python dev_server.py            → http://localhost:5173
옵션:  python dev_server.py --port 3000 --api http://127.0.0.1:8080
"""

import argparse
import os
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
HOP_BY_HOP = {'connection', 'keep-alive', 'transfer-encoding', 'te', 'trailer', 'upgrade', 'proxy-authorization', 'proxy-authenticate'}


class Handler(SimpleHTTPRequestHandler):
    api_target = 'http://127.0.0.1:8080'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    # ---------- /api 프록시 ----------
    def _proxy(self):
        path = self.path[len('/api'):] or '/'
        length = int(self.headers.get('Content-Length') or 0)
        body = self.rfile.read(length) if length else None
        headers = {k: v for k, v in self.headers.items() if k.lower() not in HOP_BY_HOP and k.lower() != 'host'}
        req = urllib.request.Request(self.api_target + path, data=body, headers=headers, method=self.command)
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                self._relay(res.status, res.headers, res.read())
        except urllib.error.HTTPError as err:
            self._relay(err.code, err.headers, err.read())
        except (urllib.error.URLError, OSError):
            self.send_error(502, 'Backend not reachable')

    def _relay(self, status, headers, data):
        self.send_response(status)
        for k, v in headers.items():
            if k.lower() not in HOP_BY_HOP and k.lower() != 'content-length':
                self.send_header(k, v)
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _is_api(self):
        return self.path == '/api' or self.path.startswith('/api/')

    def do_GET(self):
        if self._is_api():
            return self._proxy()
        # 없는 파일은 404.html 로
        local = self.translate_path(self.path)
        if not os.path.exists(local):
            return self._not_found()
        return super().do_GET()

    def do_POST(self):
        return self._proxy() if self._is_api() else self.send_error(405)

    def do_PUT(self):
        return self._proxy() if self._is_api() else self.send_error(405)

    def do_DELETE(self):
        return self._proxy() if self._is_api() else self.send_error(405)

    def _not_found(self):
        with open(os.path.join(ROOT, '404.html'), 'rb') as f:
            data = f.read()
        self.send_response(404)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def end_headers(self):
        # 개발 중에는 항상 최신 파일을 받도록
        if not self._is_api():
            self.send_header('Cache-Control', 'no-store')
        super().end_headers()


# Windows 에서 .js 를 text/plain 으로 내보내는 경우가 있어 모듈 스크립트가 막히지 않도록 지정
Handler.extensions_map.update({'.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml'})


def main():
    parser = argparse.ArgumentParser(description='soban 프론트엔드 개발 서버')
    parser.add_argument('--port', type=int, default=5173)
    parser.add_argument('--api', default=os.environ.get('API_PROXY_TARGET', 'http://127.0.0.1:8080'), help='FastAPI 주소')
    args = parser.parse_args()

    Handler.api_target = args.api.rstrip('/')
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    print(f'soban frontend → http://localhost:{args.port}  (/api → {Handler.api_target})')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == '__main__':
    main()
