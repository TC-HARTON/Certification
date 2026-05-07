#!/usr/bin/env python
"""ローカル preview 用 no-cache HTTP server
代表のブラウザで cache 問題で最新 HTML が見えない問題を強制解消。
全 response に Cache-Control: no-store, no-cache, must-revalidate + Pragma: no-cache 付与。
ブラウザは毎回 fresh fetch する。
"""
import http.server
import sys

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    http.server.test(HandlerClass=NoCacheHandler, port=port, bind='0.0.0.0')
