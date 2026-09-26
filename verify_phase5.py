import os
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure root directory is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.app import create_app, init_db
from backend.models import (
    db, User, Crop, CropDisease, MandiPrice,
    ProduceListing, Inquiry, ServiceListing, AgriculturalSociety
)

def test_phase5():
    print("=" * 70)
    print("RUNNING FINAL PHASE 5 VERIFICATION SUITE — FULL AGRINEXA-SOLO INTEGRATION")
    print("=" * 70)

    app = create_app()
    app.config['TESTING'] = True

    # 1. Initialize Database & Seeds
    with app.app_context():
        init_db(app)
        
        disease_count = CropDisease.query.count()
        mandi_count = MandiPrice.query.count()
        soc_count = AgriculturalSociety.query.count()
        
        assert disease_count >= 12, f"Diseases missing: {disease_count}"
        assert mandi_count >= 20, f"Mandi prices missing: {mandi_count}"
        assert soc_count >= 10, f"Societies missing: {soc_count}"
        print(f"\n[1] Database Seed Verification:")
        print(f"    [OK] Seeded {disease_count} curated disease records.")
        print(f"    [OK] Seeded {mandi_count} reference mandi price records.")
        print(f"    [OK] Seeded {soc_count} RSK, KVK, and APMC directory records.")

    client = app.test_client()

    # 2. Health Endpoint
    print(f"\n[2] Testing Health Endpoint (/api/health):")
    res_health = client.get('/api/health')
    assert res_health.status_code == 200
    assert res_health.get_json()['status'] == 'healthy'
    print(f"    [OK] Health check returned healthy.")

    # 3. Frontend HTML & Static Asset Serving
    print(f"\n[3] Testing Frontend Unified Server Routes:")
    pages_to_test = [
        ('/', 'AgriNexa'),
        ('/login', 'Login'),
        ('/register', 'Register'),
        ('/dashboard', 'Dashboard'),
        ('/farmer-profile', 'Profile'),
        ('/crops', 'Crop Management'),
        ('/weather', 'Weather'),
        ('/market', 'Mandi Prices'),
        ('/buyers', 'Produce Hub'),
        ('/marketplace', 'My Produce'),
        ('/inquiries', 'Inquiries'),
        ('/disease', 'Disease Guide'),
        ('/workers', 'Agri Services'),
        ('/societies', 'RSK'),
        ('/advisory', 'Advisory')
    ]
    for route, expected_text in pages_to_test:
        res = client.get(route)
        assert res.status_code == 200, f"Failed route {route}: {res.status_code}"
        assert len(res.data) > 200, f"Empty content for route {route}"
        print(f"    [OK] Route '{route}' serves HTML successfully.")

    # Verify static CSS and JS
    res_css = client.get('/static/css/style.css')
    assert res_css.status_code == 200 and b':root' in res_css.data
    res_js_api = client.get('/static/js/api.js')
    assert res_js_api.status_code == 200 and b'apiFetch' in res_js_api.data
    res_js_lang = client.get('/static/js/language.js')
    assert res_js_lang.status_code == 200 and b'TRANSLATIONS' in res_js_lang.data
    res_js_voice = client.get('/static/js/voice.js')
    assert res_js_voice.status_code == 200 and b'VoiceAssistant' in res_js_voice.data
    print(f"    [OK] Static assets (CSS, api.js, language.js, voice.js) served cleanly.")

    # 4. Authentication & Profile Update
    print(f"\n[4] Testing Authentication & Profile Update:")
    f_phone = "9888811111"
    with app.app_context():
        u = User.query.filter_by(phone=f_phone).first()
        if not u:
            res_reg = client.post('/api/auth/register', json={
                "full_name": "Someshwar Patel",
                "phone": f_phone,
                "password": "strongPassword123",
                "role": "farmer",
                "district": "Shivamogga"
            })
            assert res_reg.status_code == 201
        else:
            client.post('/api/auth/login', json={"phone": f_phone, "password": "strongPassword123"})

    # Check /me
    res_me = client.get('/api/auth/me')
    assert res_me.status_code == 200
    user_data = res_me.get_json()['user']
    assert user_data['phone'] == f_phone
    print(f"    [OK] Logged in as: {user_data['full_name']} ({user_data['district']})")

    # Update Profile
    res_prof_update = client.put('/api/auth/profile', json={
        "full_name": "Someshwar B. Patel",
        "farm_size_acres": 6.2,
        "soil_type": "Laterite Soil",
        "preferred_language": "kn"
    })
    assert res_prof_update.status_code == 200
    updated_user = res_prof_update.get_json()['user']
    assert updated_user['full_name'] == "Someshwar B. Patel"
    assert updated_user['farm_size_acres'] == 6.2
    assert updated_user['preferred_language'] == "kn"
    print(f"    [OK] Profile updated successfully via PUT /api/auth/profile.")

    # 5. Crop Management Flow
    print(f"\n[5] Testing Crop Management Flow:")
    res_crop_add = client.post('/api/crops', json={
        "crop_name": "Arecanut",
        "crop_name_kn": "ಅಡಿಕೆ",
        "variety": "Thirthahalli Intercrop",
        "area_acres": 4.0,
        "stage": "vegetative",
        "expected_harvest_date": "2026-11-20"
    })
    assert res_crop_add.status_code == 201
    crop_id = res_crop_add.get_json()['crop']['id']
    print(f"    [OK] Added Crop: ID {crop_id} ('Arecanut').")

    res_sum = client.get('/api/crops/summary')
    assert res_sum.status_code == 200
    assert res_sum.get_json()['summary']['active_crops_count'] >= 1
    print(f"    [OK] Crop summary verified.")

    # 6. Open-Meteo Weather Service
    print(f"\n[6] Testing Weather Integration & Agronomic Heuristics:")
    res_w = client.get('/api/weather/current?district=Shivamogga')
    assert res_w.status_code == 200
    w_data = res_w.get_json()['data']
    assert 'temperature_c' in w_data['current']
    assert len(w_data['forecast']) == 7
    assert 'spraying' in w_data['agricultural_advisory']
    assert 'irrigation' in w_data['agricultural_advisory']
    print(f"    [OK] Weather for Shivamogga fetched: {w_data['current']['temperature_c']}°C, Condition: {w_data['current']['condition_en']}")

    # 7. Disease Advisory Knowledge Base
    print(f"\n[7] Testing Crop Disease Knowledge Base & Disclaimers:")
    res_dis = client.get('/api/diseases?crop=Arecanut')
    assert res_dis.status_code == 200
    dis_data = res_dis.get_json()
    assert dis_data['count'] >= 1
    assert "NOT an automated or AI diagnosis" in dis_data['disclaimer_en']
    print(f"    [OK] Found {dis_data['count']} diseases for Arecanut with non-AI disclaimer.")

    # 8. Mandi Prices Reference Data
    print(f"\n[8] Testing Mandi APMC Prices & Demo Flagging:")
    res_mandi = client.get('/api/market/prices?commodity=Arecanut')
    assert res_mandi.status_code == 200
    mandi_records = res_mandi.get_json()
    assert mandi_records['count'] >= 1
    assert mandi_records['is_live_data'] is False
    assert mandi_records['data_type'] == "REFERENCE / DEMO DATA"
    print(f"    [OK] Mandi prices returned and strictly flagged as REFERENCE / DEMO DATA.")

    # 9. Produce Marketplace & Inquiry Life Cycle
    print(f"\n[9] Testing Produce Marketplace & Inquiries:")
    res_prod = client.post('/api/marketplace/listings', json={
        "crop_name": "Arecanut",
        "variety": "Rashi Super",
        "quantity_quintals": 25.0,
        "expected_price_per_quintal": 53000.0,
        "district": "Shivamogga",
        "contact_phone": "9888811111"
    })
    assert res_prod.status_code == 201
    prod_id = res_prod.get_json()['listing']['id']
    print(f"    [OK] Posted produce listing: ID {prod_id} (25 Q Arecanut @ ₹53,000/Q).")

    # Owner cannot self-inquire
    res_self_inq = client.post('/api/marketplace/inquire', json={
        "listing_id": prod_id,
        "sender_name": "Someshwar Patel",
        "sender_phone": "9888811111",
        "message": "Self inquiry."
    })
    assert res_self_inq.status_code == 400
    print(f"    [OK] Farmer strictly prevented from self-inquiring (HTTP 400).")

    # Guest buyer submits legitimate inquiry
    guest_client = app.test_client()
    res_inq = guest_client.post('/api/marketplace/inquire', json={
        "listing_id": prod_id,
        "sender_name": "Malnad Traders",
        "sender_phone": "9448833221",
        "message": "We can offer ₹52,800/Q for all 25 quintals. Delivery at Shivamogga APMC."
    })
    assert res_inq.status_code == 201
    inq_id = res_inq.get_json()['inquiry']['id']
    print(f"    [OK] Guest buyer inquiry submitted: ID {inq_id}.")

    # Farmer checks inquiries
    res_my_inq = client.get('/api/marketplace/my-inquiries')
    assert res_my_inq.status_code == 200
    assert len(res_my_inq.get_json()['inquiries']) >= 1

    # Farmer accepts inquiry
    res_inq_acc = client.put(f'/api/marketplace/inquiries/{inq_id}/status', json={"status": "accepted"})
    assert res_inq_acc.status_code == 200
    assert res_inq_acc.get_json()['inquiry']['status'] == 'accepted'
    print(f"    [OK] Inquiry accepted successfully.")

    # 10. Agricultural Machinery & Labor Services
    print(f"\n[10] Testing Agricultural Services APIs:")
    res_serv_list = client.get('/api/services')
    assert res_serv_list.status_code == 200
    servs = res_serv_list.get_json()['services']
    assert len(servs) >= 1
    print(f"    [OK] Services directory returned {len(servs)} active machinery/labor listings.")

    # Post service
    res_post_serv = client.post('/api/services', json={
        "category": "drone",
        "title_en": "Precision Drone Spraying Service",
        "rate_per_unit": 400.0,
        "unit": "per_acre",
        "district": "Shivamogga",
        "contact_name": "Someshwar Patel",
        "contact_phone": "9888811111"
    })
    assert res_post_serv.status_code == 201
    serv_id = res_post_serv.get_json()['service']['id']
    print(f"    [OK] Posted service: ID {serv_id}.")

    # Update service
    res_up_serv = client.put(f'/api/services/{serv_id}', json={"rate_per_unit": 420.0})
    assert res_up_serv.status_code == 200
    assert res_up_serv.get_json()['service']['rate_per_unit'] == 420.0
    print(f"    [OK] Updated service rate successfully.")

    # 11. Agricultural Societies Directory
    print(f"\n[11] Testing Agricultural Societies Directory APIs:")
    res_soc = client.get('/api/societies?district=Mandya')
    assert res_soc.status_code == 200
    soc_items = res_soc.get_json()['societies']
    assert len(soc_items) >= 2
    first_soc = soc_items[0]
    print(f"    [OK] Societies in Mandya: Found {len(soc_items)} offices.")
    print(f"         Example: {first_soc['name_en']} ({first_soc['society_type']}) - Phone: {first_soc['phone']}")

    # Clean up test data
    client.delete(f'/api/crops/{crop_id}')
    client.delete(f'/api/marketplace/listings/{prod_id}')
    client.delete(f'/api/services/{serv_id}')

    # Logout
    res_logout = client.post('/api/auth/logout')
    assert res_logout.status_code == 200
    assert client.get('/api/auth/me').status_code == 401
    print(f"    [OK] Logout verified.")

    print("\n" + "=" * 70)
    print("ALL 11 INTEGRATION & VERIFICATION CHECKS PASSED FOR PHASE 5! :)")
    print("=" * 70)

if __name__ == '__main__':
    test_phase5()
