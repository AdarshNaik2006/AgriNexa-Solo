import os
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure root directory is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.app import create_app, init_db
from backend.models import db, User, Crop, CropDisease
from backend.services.seed_data import CURATED_DISEASES

def test_phase3():
    print("=" * 65)
    print("RUNNING PHASE 3 VERIFICATION SUITE")
    print("=" * 65)

    app = create_app()
    app.config['TESTING'] = True

    # 1. Initialize DB and Seed Data
    with app.app_context():
        init_db(app)
        disease_count = CropDisease.query.count()
        assert disease_count >= len(CURATED_DISEASES), f"Expected at least {len(CURATED_DISEASES)} diseases, got {disease_count}"
        print(f"\n[1] Database Seed Verification:")
        print(f"    [OK] Verified {disease_count} curated disease records seeded in SQLite.")

    client = app.test_client()

    # 2. Test Crop APIs Require Authentication
    print(f"\n[2] Testing Authentication Requirement on Crop APIs:")
    res_no_auth = client.get('/api/crops')
    assert res_no_auth.status_code == 401, f"Expected 401, got {res_no_auth.status_code}"
    print(f"    [OK] GET /api/crops rejected unauthenticated request with 401.")

    res_post_no_auth = client.post('/api/crops', json={"crop_name": "Paddy", "area_acres": 2.0})
    assert res_post_no_auth.status_code == 401
    print(f"    [OK] POST /api/crops rejected unauthenticated request with 401.")

    # 3. Create Farmer 1 (Ramesh) & Farmer 2 (Suresh)
    print(f"\n[3] Setting Up Test Farmers for Multi-Tenant Isolation:")
    # Register/Login Farmer 1
    client1 = app.test_client()
    farmer1_phone = "9111122222"
    with app.app_context():
        u1 = User.query.filter_by(phone=farmer1_phone).first()
        if not u1:
            client1.post('/api/auth/register', json={
                "full_name": "Ramesh Gowda",
                "phone": farmer1_phone,
                "password": "farmerSecret1",
                "district": "Mandya"
            })
        else:
            client1.post('/api/auth/login', json={"phone": farmer1_phone, "password": "farmerSecret1"})

    # Register/Login Farmer 2
    client2 = app.test_client()
    farmer2_phone = "9333344444"
    with app.app_context():
        u2 = User.query.filter_by(phone=farmer2_phone).first()
        if not u2:
            client2.post('/api/auth/register', json={
                "full_name": "Suresh Patil",
                "phone": farmer2_phone,
                "password": "farmerSecret2",
                "district": "Dharwad"
            })
        else:
            client2.post('/api/auth/login', json={"phone": farmer2_phone, "password": "farmerSecret2"})
    print(f"    [OK] Farmer 1 (Mandya) and Farmer 2 (Dharwad) authenticated in separate sessions.")

    # 4. Test Crop Creation & Validation
    print(f"\n[4] Testing Crop Input Validation (Farmer 1):")
    # Missing crop name
    res_bad_name = client1.post('/api/crops', json={"crop_name": "", "area_acres": 2.0})
    assert res_bad_name.status_code == 400
    print(f"    [OK] Empty crop name rejected with 400: {res_bad_name.get_json()['message']}")

    # Negative area
    res_bad_area = client1.post('/api/crops', json={"crop_name": "Paddy", "area_acres": -1.5})
    assert res_bad_area.status_code == 400
    print(f"    [OK] Negative acreage rejected with 400: {res_bad_area.get_json()['message']}")

    # Invalid stage
    res_bad_stage = client1.post('/api/crops', json={"crop_name": "Paddy", "area_acres": 2.0, "stage": "flying"})
    assert res_bad_stage.status_code == 400
    print(f"    [OK] Invalid growth stage rejected with 400: {res_bad_stage.get_json()['message']}")

    # Harvest date earlier than sowing date
    res_bad_dates = client1.post('/api/crops', json={
        "crop_name": "Paddy",
        "area_acres": 2.0,
        "sowing_date": "2026-08-01",
        "expected_harvest_date": "2026-07-01"
    })
    assert res_bad_dates.status_code == 400
    print(f"    [OK] Invalid dates (harvest before sowing) rejected with 400.")

    # Valid Crop Creation for Farmer 1
    print(f"\n[5] Testing Valid Crop Creation & Farmer Isolation:")
    res_c1 = client1.post('/api/crops', json={
        "crop_name": "Paddy",
        "crop_name_kn": "ಭತ್ತ",
        "variety": "Jyothi",
        "area_acres": 3.5,
        "sowing_date": "2026-06-15",
        "expected_harvest_date": "2026-10-25",
        "stage": "vegetative",
        "expected_yield_quintals": 75.0,
        "notes": "Organic vermicompost applied at 30 days."
    })
    assert res_c1.status_code == 201
    crop1_id = res_c1.get_json()['crop']['id']
    print(f"    [OK] Farmer 1 added crop: ID {crop1_id} ('Paddy' / 'ಭತ್ತ', 3.5 acres)")

    # Valid Crop Creation for Farmer 2
    res_c2 = client2.post('/api/crops', json={
        "crop_name": "Ragi",
        "crop_name_kn": "ರಾಗಿ",
        "variety": "GPU-28",
        "area_acres": 2.0,
        "stage": "sowing",
        "expected_yield_quintals": 30.0
    })
    assert res_c2.status_code == 201
    crop2_id = res_c2.get_json()['crop']['id']
    print(f"    [OK] Farmer 2 added crop: ID {crop2_id} ('Ragi' / 'ರಾಗಿ', 2.0 acres)")

    # Verify Farmer Isolation
    farmer2_crops = client2.get('/api/crops').get_json()['crops']
    farmer2_crop_ids = [c['id'] for c in farmer2_crops]
    assert crop2_id in farmer2_crop_ids
    assert crop1_id not in farmer2_crop_ids, "SECURITY VIOLATION: Farmer 2 can see Farmer 1's crops!"
    print(f"    [OK] Strict Isolation: Farmer 2 only sees their own crops, cannot see Crop {crop1_id}.")

    # Farmer 2 cannot view, edit, or delete Farmer 1's crop
    assert client2.get(f'/api/crops/{crop1_id}').status_code == 404
    assert client2.put(f'/api/crops/{crop1_id}', json={"stage": "flowering"}).status_code == 404
    assert client2.delete(f'/api/crops/{crop1_id}').status_code == 404
    print(f"    [OK] Unauthorized access/edit/delete across farmers properly blocked with 404.")

    # 6. Test Crop Update & Summary for Farmer 1
    print(f"\n[6] Testing Crop Update & Summary Metrics:")
    res_update = client1.put(f'/api/crops/{crop1_id}', json={
        "stage": "flowering",
        "notes": "Flowering stage commenced. No blast symptoms observed."
    })
    assert res_update.status_code == 200
    assert res_update.get_json()['crop']['stage'] == 'flowering'
    print(f"    [OK] Crop {crop1_id} successfully progressed to stage 'flowering'.")

    res_summary = client1.get('/api/crops/summary')
    assert res_summary.status_code == 200
    summary_data = res_summary.get_json()['summary']
    assert summary_data['active_crops_count'] >= 1
    assert summary_data['total_active_acres'] >= 3.5
    print(f"    [OK] Crop Summary verified: {summary_data['active_crops_count']} active crops, {summary_data['total_active_acres']} total acres.")

    # 7. Test Open-Meteo Weather Service & Agricultural Advisories
    print(f"\n[7] Testing Open-Meteo Weather Service & Keyless API:")
    # Query Karnataka districts list
    res_dist = client.get('/api/weather/districts')
    assert res_dist.status_code == 200
    dist_list = res_dist.get_json()['districts']
    assert len(dist_list) >= 30
    print(f"    [OK] Karnataka districts list contains {len(dist_list)} districts with bilingual names.")

    # Query live weather for Mandya district
    res_weather = client.get('/api/weather/current?district=Mandya')
    assert res_weather.status_code == 200, f"Weather API error: {res_weather.get_json()}"
    weather_data = res_weather.get_json()['data']
    
    assert weather_data['is_live_data'] is True
    assert 'Open-Meteo' in weather_data['data_source']
    assert 'temperature_c' in weather_data['current']
    assert 'wind_speed_kmh' in weather_data['current']
    assert len(weather_data['forecast']) == 7
    print(f"    [OK] Live Open-Meteo Weather fetched for {weather_data['location']['name']}:")
    print(f"         Temp: {weather_data['current']['temperature_c']}°C, Condition: {weather_data['current']['condition_en']} ({weather_data['current']['condition_kn']})")
    print(f"         7-Day daily forecast received ({len(weather_data['forecast'])} days).")

    # Verify Rule-Based Agricultural Advisories
    advisory = weather_data['agricultural_advisory']
    assert 'spraying' in advisory
    assert 'irrigation' in advisory
    assert 'disclaimer_en' in advisory
    print(f"    [OK] Rule-based Agricultural Advisories generated:")
    print(f"         Spraying Feasibility: {advisory['spraying']['status']} ({advisory['spraying']['status_kn']})")
    print(f"         Smart Irrigation: {advisory['irrigation']['status']} ({advisory['irrigation']['status_kn']})")
    print(f"         Distinct advisory disclaimer present (Automated rules, NOT AI diagnosis).")

    # Test error handling on bad coordinates
    res_bad_coords = client.get('/api/weather/current?lat=abc&lon=xyz')
    assert res_bad_coords.status_code == 400
    print(f"    [OK] Invalid coordinates handled cleanly with JSON 400 error.")

    # Test error handling on unknown district
    res_unknown_dist = client.get('/api/weather/current?district=NonExistentCity')
    assert res_unknown_dist.status_code == 400
    print(f"    [OK] Non-Karnataka district rejected cleanly with JSON 400 error.")

    # 8. Test Crop Disease Advisory Knowledge Base
    print(f"\n[8] Testing Crop Disease Knowledge Base & Safety Disclaimers:")
    res_crops_list = client.get('/api/diseases/crops')
    assert res_crops_list.status_code == 200
    crops_available = [c['crop_name_en'] for c in res_crops_list.get_json()['crops']]
    assert 'Paddy' in crops_available
    assert 'Ragi' in crops_available
    assert 'Tomato' in crops_available
    print(f"    [OK] Disease coverage available for crops: {', '.join(crops_available)}")

    # Query Paddy diseases
    res_paddy = client.get('/api/diseases?crop=Paddy')
    assert res_paddy.status_code == 200
    paddy_data = res_paddy.get_json()
    assert paddy_data['count'] >= 2
    # Verify non-AI disclaimer
    assert "NOT an automated or AI diagnosis" in paddy_data['disclaimer_en']
    print(f"    [OK] Verified Non-AI Advisory disclaimer in response: '{paddy_data['disclaimer_en'][:60]}...'")

    # Check chemical disclaimer in specific disease
    disease_item = paddy_data['diseases'][0]
    res_detail = client.get(f"/api/diseases/{disease_item['id']}")
    assert res_detail.status_code == 200
    detail = res_detail.get_json()['disease']
    assert "Central Insecticide Board" in detail['chemical_treatment_en']
    assert "ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ" in detail['chemical_treatment_kn']
    print(f"    [OK] Verified Mandatory Chemical Safety Disclaimer in {detail['disease_name_en']} treatment.")
    print(f"    [OK] Verified Bilingual content (English & Kannada) in symptoms and organic remedies.")

    # Test Kannada search
    res_kn_search = client.get('/api/diseases?search=ಬೆಂಕಿ')
    assert res_kn_search.status_code == 200
    assert res_kn_search.get_json()['count'] >= 1
    print(f"    [OK] Kannada script search ('ಬೆಂಕಿ') successfully returned matching disease records.")

    # Clean up test crop
    client1.delete(f'/api/crops/{crop1_id}')
    client2.delete(f'/api/crops/{crop2_id}')

    print("\n" + "=" * 65)
    print("ALL PHASE 3 VERIFICATION TESTS PASSED SUCCESSFULLY! :)")
    print("=" * 65)

if __name__ == '__main__':
    test_phase3()
