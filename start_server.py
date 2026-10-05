#!/usr/bin/env python3
import os
import sys
import http.server
import socketserver

PORT = 8000

class DebugHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def log_message(self, format, *args):
        print(f"[HTTP] {args[0]}")

if __name__ == "__main__":
    # 获取当前目录
    cwd = os.getcwd()
    print(f"📁 当前目录: {cwd}")
    print(f"📄 可用的文件:")
    
    # 列出当前目录下的 HTML 文件
    for f in ['test_avatar.html', 'index.html', 'test_avatar.css']:
        if os.path.exists(f):
            print(f"  - {f}")
    
    print("\n" + "=" * 60)
    print("🔥 本地调试服务器已启动")
    print("=" * 60)
    print(f"📱 在手机上打开浏览器访问:")
    print(f"   http://127.0.0.1:{PORT}")
    print("\n💡 提示:")
    print("  - 保留此 Termux 窗口，查看控制台日志")
    print("  - 在手机上输入 http://127.0.0.1:8000")
    print("  - 点击测试头像，查看 Termux 输出")
    print("=" * 60)
    print("按 Ctrl+C 停止服务器")
    
    with socketserver.TCPServer(("", PORT), DebugHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务器已停止")
