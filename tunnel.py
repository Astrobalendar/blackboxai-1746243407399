import http.server
import socketserver
import threading
import requests
import time

# Custom handler to proxy requests to the frontend
class FrontendProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Forward requests to the frontend container
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        # Forward the request to the frontend container
        try:
            response = requests.get(f'http://localhost:4173{self.path}')
            self.wfile.write(response.content)
        except Exception as e:
            self.wfile.write(f'Error: {str(e)}'.encode())

def start_tunnel(port, handler):
    server = socketserver.TCPServer(("0.0.0.0", port), handler)
    print(f"Starting tunnel on port {port}...")
    server.serve_forever()

def main():
    print("Starting AstroBalendar Tunnel Setup...")
    
    # Start frontend proxy
    frontend_thread = threading.Thread(
        target=start_tunnel,
        args=(3000, FrontendProxyHandler)
    )
    frontend_thread.daemon = True
    frontend_thread.start()
    
    print("\nTunnel servers started:")
    print(f"Frontend Proxy: http://localhost:3000")
    print("Backend: http://localhost:3001")
    print("\nApplication should now be accessible via:")
    print("http://localhost:3000 (frontend)")
    print("http://localhost:3001 (backend)")
    
    print("\nPress Ctrl+C to stop the tunnels...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping tunnels...")

if __name__ == "__main__":
    main()
