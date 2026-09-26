import sys
import os

# Ensure the root directory is on the Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.app import create_app, init_db

app = create_app()

if __name__ == '__main__':
    # Initialize database tables on startup
    init_db(app)
    
    print("\n" + "=" * 55)
    print("  🌾 AgriNexa-Solo Backend Server Running")
    print("  🌐 URL: http://127.0.0.1:5000")
    print("  📡 Health check: http://127.0.0.1:5000/api/health")
    print("  🔑 Auth endpoints: /api/auth/register, /api/auth/login")
    print("=" * 55 + "\n")
    
    app.run(debug=True, host='127.0.0.1', port=5000)
