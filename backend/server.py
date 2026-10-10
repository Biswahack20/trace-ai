"""
TraceMind AI — Lightweight Forensic Development Server
Runs out-of-the-box with standard Python 3 (no pip packages required).
"""

import http.server
import json
import os
import socketserver
import sys

PORT = 8000
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")


class ForensicHandler(http.server.SimpleHTTPRequestHandler):

  def __init__(self, *args, **kwargs):
    super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

  def do_GET(self):
    if self.path == "/health":
      self.send_response(200)
      self.send_header("Content-Type", "application/json")
      self.send_header("Access-Control-Allow-Origin", "*")
      self.end_headers()
      data = {
          "status": "healthy",
          "service": "TraceMind AI Forensic Server (Standard Library)",
          "active_case": "TF-2026-1010",
      }
      self.wfile.write(json.dumps(data).encode("utf-8"))
      return

    return super().do_GET()


def main():
  print("=" * 60)
  print(" TraceMind AI — Digital Forensic Investigation Platform")
  print("=" * 60)
  print(f" * Serving frontend from: {FRONTEND_DIR}")
  print(f" * Forensic Laboratory URL: http://127.0.0.1:{PORT}")
  print(f" * Health endpoint:        http://127.0.0.1:{PORT}/health")
  print(" Press Ctrl+C to stop.")
  print("=" * 60)

  socketserver.TCPServer.allow_reuse_address = True
  with socketserver.TCPServer(("127.0.0.1", PORT), ForensicHandler) as httpd:
    try:
      httpd.serve_forever()
    except KeyboardInterrupt:
      print("\nForensic server stopped.")


if __name__ == "__main__":
  main()
