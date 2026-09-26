import os
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure root directory is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.app import create_app, init_db
from backend.models import db, User
from sqlalchemy import inspect

def test_phase2():
    print("=" * 60)
    print("RUNNING PHASE 2 VERIFICATION SUITE")
    print("=" * 60)

    # 1. Initialize App & DB
    app = create_app()
    app.config['TESTING'] = True
    
    with app.app_context():
        init_db(app)
        
        # 2. Inspect Database Tables
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"\n[1] Checking Database Tables in SQLite:")
        expected_tables = [
            'users', 'crops', 'produce_listings', 'inquiries',
            'service_listings', 'agricultural_societies', 'crop_diseases', 'mandi_prices'
        ]
        for tbl in expected_tables:
            assert tbl in tables, f"Missing table: {tbl}"
            print(f"    [OK] Table '{tbl}' verified.")

    client = app.test_client()

    # 3. Test Health Check Endpoint
    print(f"\n[2] Testing Health Check (/api/health):")
    res = client.get('/api/health')
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    health_data = res.get_json()
    assert health_data['status'] == 'healthy'
    print(f"    [OK] Health check returned: {health_data}")

    # 4. Test Registration (Farmer Ramesh Kumar)
    print(f"\n[3] Testing Registration (POST /api/auth/register):")
    with app.app_context():
        existing_u = User.query.filter_by(phone='9876543210').first()
        if existing_u:
            # Delete dependent crops/listings if any
            from backend.models.crop import Crop
            from backend.models.marketplace import ProduceListing, Inquiry
            from backend.models.service import ServiceListing
            Inquiry.query.filter((Inquiry.sender_id == existing_u.id)).delete()
            ProduceListing.query.filter_by(user_id=existing_u.id).delete()
            Crop.query.filter_by(user_id=existing_u.id).delete()
            ServiceListing.query.filter_by(user_id=existing_u.id).delete()
            db.session.delete(existing_u)
            db.session.commit()

    farmer_payload = {
        "full_name": "Ramesh Gowda",
        "phone": "9876543210",
        "password": "farmerSecret123",
        "role": "farmer",
        "district": "Mandya",
        "taluk": "Maddur",
        "village": "Gejjalagere",
        "farm_size_acres": 4.5,
        "soil_type": "Red Sandy Loam",
        "preferred_language": "kn"
    }
    res = client.post('/api/auth/register', json=farmer_payload)
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.get_json()}"
    reg_data = res.get_json()
    assert reg_data['success'] is True
    assert reg_data['user']['phone'] == '9876543210'
    assert reg_data['user']['district'] == 'Mandya'
    print(f"    [OK] Registration successful: User ID {reg_data['user']['id']} ({reg_data['user']['full_name']})")

    # 5. Verify Password is NOT plain text
    print(f"\n[4] Verifying Secure Password Hashing (Werkzeug):")
    with app.app_context():
        user = User.query.filter_by(phone='9876543210').first()
        assert user is not None
        assert user.password_hash != "farmerSecret123", "ERROR: Password stored in plain text!"
        assert user.password_hash.startswith(('scrypt:', 'pbkdf2:')), "ERROR: Not a valid Werkzeug hash!"
        assert user.check_password("farmerSecret123") is True
        assert user.check_password("wrongPassword") is False
        print(f"    [OK] Password hash format: {user.password_hash[:25]}... (Plaintext never stored)")
        print(f"    [OK] Password validation check passed.")

    # 6. Test Duplicate Registration Prevention
    print(f"\n[5] Testing Duplicate Phone Validation:")
    res_dup = client.post('/api/auth/register', json=farmer_payload)
    assert res_dup.status_code == 409, f"Expected 409, got {res_dup.status_code}"
    print(f"    [OK] Duplicate phone properly rejected with 409 Conflict: {res_dup.get_json()['message']}")

    # 7. Test Short Password Validation
    print(f"\n[6] Testing Password Length Validation:")
    res_short = client.post('/api/auth/register', json={
        "full_name": "Short Pass User",
        "phone": "9999988888",
        "password": "123"
    })
    assert res_short.status_code == 400
    print(f"    [OK] Short password rejected with 400 Bad Request: {res_short.get_json()['message']}")

    # 8. Test Logout
    print(f"\n[7] Testing Logout (POST /api/auth/logout):")
    res_logout = client.post('/api/auth/logout')
    assert res_logout.status_code == 200
    print(f"    [OK] Logged out successfully.")

    # 9. Test Current User when logged out (/api/auth/me)
    print(f"\n[8] Testing /api/auth/me after logout:")
    res_me_unauth = client.get('/api/auth/me')
    assert res_me_unauth.status_code == 401
    print(f"    [OK] Unauthenticated request rejected with 401.")

    # 10. Test Login (POST /api/auth/login)
    print(f"\n[9] Testing Login (POST /api/auth/login):")
    login_payload = {
        "phone": "9876543210",
        "password": "farmerSecret123"
    }
    res_login = client.post('/api/auth/login', json=login_payload)
    assert res_login.status_code == 200, f"Expected 200, got {res_login.status_code}: {res_login.get_json()}"
    login_data = res_login.get_json()
    assert login_data['success'] is True
    print(f"    [OK] Login successful for: {login_data['user']['full_name']}")

    # 11. Test /api/auth/me with active session
    print(f"\n[10] Testing /api/auth/me with active session:")
    res_me_auth = client.get('/api/auth/me')
    assert res_me_auth.status_code == 200
    me_data = res_me_auth.get_json()
    assert me_data['authenticated'] is True
    assert me_data['user']['phone'] == '9876543210'
    print(f"    [OK] Active session verified for: {me_data['user']['full_name']} (District: {me_data['user']['district']})")

    # 12. Test Login Failure
    print(f"\n[11] Testing Login with invalid password:")
    bad_login = client.post('/api/auth/login', json={
        "phone": "9876543210",
        "password": "wrongPassword123"
    })
    assert bad_login.status_code == 401
    print(f"    [OK] Invalid login properly rejected with 401 Unauthorized.")

    print("\n" + "=" * 60)
    print("ALL 11 VERIFICATION CHECKS PASSED SUCCESSFULLY! :)")
    print("=" * 60)

if __name__ == '__main__':
    test_phase2()
