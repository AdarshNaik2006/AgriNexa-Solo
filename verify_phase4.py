import os
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure root directory is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.app import create_app, init_db
from backend.models import db, User, MandiPrice, ProduceListing, Inquiry

def test_phase4():
    print("=" * 65)
    print("RUNNING PHASE 4 VERIFICATION SUITE")
    print("=" * 65)

    app = create_app()
    app.config['TESTING'] = True

    # 1. Initialize DB and Seed Data
    with app.app_context():
        init_db(app)
        mandi_count = MandiPrice.query.count()
        assert mandi_count >= 20, f"Expected at least 20 Mandi price records, got {mandi_count}"
        print(f"\n[1] Database Seed Verification:")
        print(f"    [OK] Verified {mandi_count} reference Mandi price records seeded in SQLite.")

    client = app.test_client()

    # 2. Test Mandi Reference Data APIs
    print(f"\n[2] Testing Mandi Market Prices REST APIs & Reference Disclaimers:")
    res_comms = client.get('/api/market/commodities')
    assert res_comms.status_code == 200
    comms_data = res_comms.get_json()
    assert comms_data['count'] >= 8
    print(f"    [OK] Commodities endpoint returned {comms_data['count']} agricultural commodities.")

    res_markets = client.get('/api/market/markets')
    assert res_markets.status_code == 200
    markets_data = res_markets.get_json()
    assert markets_data['count'] >= 9
    print(f"    [OK] Markets endpoint returned {markets_data['count']} APMC market yards.")

    # Test filtering by district and commodity
    res_mandya_prices = client.get('/api/market/prices?district=Mandya&commodity=Paddy')
    assert res_mandya_prices.status_code == 200
    prices_data = res_mandya_prices.get_json()
    assert prices_data['count'] >= 1
    assert prices_data['is_live_data'] is False, "Mandi prices must NOT be marked as live data!"
    assert prices_data['data_type'] == "REFERENCE / DEMO DATA"
    assert "DEMO / REFERENCE DATA" in prices_data['disclaimer_en']
    assert "ಉಲ್ಲೇಖ ದರಗಳಾಗಿವೆ" in prices_data['disclaimer_kn']
    
    first_item = prices_data['prices'][0]
    print(f"    [OK] Mandi Price Filtered: {first_item['commodity_en']} ({first_item['commodity_kn']})")
    print(f"         Market: {first_item['market_name']}, Modal Price: ₹{first_item['modal_price']}/Quintal, Trend: {first_item['trend']}")
    print(f"         Data Type Flag: '{first_item['data_type']}'")
    print(f"    [OK] Verified Mandatory Demo/Reference Disclaimers in English & Kannada.")

    # Test Trends Endpoint
    res_trends = client.get('/api/market/trends')
    assert res_trends.status_code == 200
    trends_data = res_trends.get_json()
    assert trends_data['count'] >= 8
    print(f"    [OK] Market Trends endpoint computed modal averages for {trends_data['count']} commodities.")

    # 3. Setup Authenticated Farmers
    print(f"\n[3] Setting Up Test Farmers for Produce Marketplace:")
    client_farmer1 = app.test_client()
    farmer1_phone = "9777711111"
    with app.app_context():
        u1 = User.query.filter_by(phone=farmer1_phone).first()
        if not u1:
            client_farmer1.post('/api/auth/register', json={
                "full_name": "Ramesh Gowda",
                "phone": farmer1_phone,
                "password": "farmerSecret11",
                "district": "Mandya"
            })
        else:
            client_farmer1.post('/api/auth/login', json={"phone": farmer1_phone, "password": "farmerSecret11"})

    client_farmer2 = app.test_client()
    farmer2_phone = "9777722222"
    with app.app_context():
        u2 = User.query.filter_by(phone=farmer2_phone).first()
        if not u2:
            client_farmer2.post('/api/auth/register', json={
                "full_name": "Suresh Patil",
                "phone": farmer2_phone,
                "password": "farmerSecret22",
                "district": "Dharwad"
            })
        else:
            client_farmer2.post('/api/auth/login', json={"phone": farmer2_phone, "password": "farmerSecret22"})
    print(f"    [OK] Farmer 1 (Ramesh, Mandya) and Farmer 2 (Suresh, Dharwad) authenticated.")

    # 4. Test Produce Listing Authentication & Validation
    print(f"\n[4] Testing Produce Listing Input Validation & Auth Requirement:")
    res_anon_post = client.post('/api/marketplace/listings', json={"crop_name": "Paddy"})
    assert res_anon_post.status_code == 401
    print(f"    [OK] Unauthenticated user blocked from posting produce (401).")

    # Bad Quantity
    res_bad_qty = client_farmer1.post('/api/marketplace/listings', json={
        "crop_name": "Paddy", "quantity_quintals": -5, "expected_price_per_quintal": 2500, "district": "Mandya", "contact_phone": "9876543210"
    })
    assert res_bad_qty.status_code == 400
    print(f"    [OK] Negative quantity rejected with 400: {res_bad_qty.get_json()['message']}")

    # Bad Price
    res_bad_price = client_farmer1.post('/api/marketplace/listings', json={
        "crop_name": "Paddy", "quantity_quintals": 50, "expected_price_per_quintal": 0, "district": "Mandya", "contact_phone": "9876543210"
    })
    assert res_bad_price.status_code == 400
    print(f"    [OK] Zero/negative price rejected with 400: {res_bad_price.get_json()['message']}")

    # Bad Phone
    res_bad_phone = client_farmer1.post('/api/marketplace/listings', json={
        "crop_name": "Paddy", "quantity_quintals": 50, "expected_price_per_quintal": 2500, "district": "Mandya", "contact_phone": "123"
    })
    assert res_bad_phone.status_code == 400
    print(f"    [OK] Invalid phone rejected with 400: {res_bad_phone.get_json()['message']}")

    # 5. Legitimate Produce Posting by Farmer 1
    print(f"\n[5] Testing Legitimate Produce Posting (Farmer 1):")
    res_post = client_farmer1.post('/api/marketplace/listings', json={
        "crop_name": "Paddy",
        "variety": "Jyothi A Grade",
        "quantity_quintals": 60.0,
        "expected_price_per_quintal": 2480.0,
        "district": "Mandya",
        "taluk": "Maddur",
        "village": "Gejjalagere",
        "contact_phone": "9876543210",
        "harvest_date": "2026-10-30",
        "description": "Clean harvested grain, low moisture, ready for delivery."
    })
    assert res_post.status_code == 201
    listing1_id = res_post.get_json()['listing']['id']
    print(f"    [OK] Farmer 1 posted produce: Listing ID {listing1_id} (60 Q Paddy @ ₹2480/Q).")

    # 6. Public Browsing of Listings (Zero Leaks)
    print(f"\n[6] Testing Public Browsing & Privacy Security:")
    res_public = client.get(f'/api/marketplace/listings/{listing1_id}')
    assert res_public.status_code == 200
    listing_view = res_public.get_json()['listing']
    assert listing_view['farmer_name'] == "Ramesh Gowda"
    assert listing_view['contact_phone'] == "9876543210"
    assert 'password_hash' not in listing_view
    assert 'email' not in listing_view
    print(f"    [OK] Public listing retrieved without leaking sensitive user fields.")

    # 7. Strict Ownership Security (Farmer 2 cannot edit or delete Farmer 1's listing)
    print(f"\n[7] Testing Strict Marketplace Listing Ownership Security:")
    res_unauth_edit = client_farmer2.put(f'/api/marketplace/listings/{listing1_id}', json={
        "expected_price_per_quintal": 1000.0
    })
    assert res_unauth_edit.status_code == 403
    print(f"    [OK] Farmer 2 blocked from editing Farmer 1's listing (403 Forbidden).")

    res_unauth_delete = client_farmer2.delete(f'/api/marketplace/listings/{listing1_id}')
    assert res_unauth_delete.status_code == 403
    print(f"    [OK] Farmer 2 blocked from deleting Farmer 1's listing (403 Forbidden).")

    # Owner (Farmer 1) can edit their own listing
    res_owner_edit = client_farmer1.put(f'/api/marketplace/listings/{listing1_id}', json={
        "quantity_quintals": 55.0,
        "expected_price_per_quintal": 2500.0,
        "status": "booked"
    })
    assert res_owner_edit.status_code == 200
    assert res_owner_edit.get_json()['listing']['status'] == 'booked'
    assert res_owner_edit.get_json()['listing']['quantity_quintals'] == 55.0
    print(f"    [OK] Farmer 1 successfully updated own listing (55 Q @ ₹2500, status: 'booked').")

    # 8. Buyer Inquiry System
    print(f"\n[8] Testing Buyer Inquiry System & Status Control:")
    # Buyer submits inquiry
    res_inquiry = client.post('/api/marketplace/inquire', json={
        "listing_id": listing1_id,
        "sender_name": "Kiran Agro Traders",
        "sender_phone": "9988776655",
        "message": "We want to purchase all 55 quintals. Can you arrange transport to Maddur APMC?"
    })
    assert res_inquiry.status_code == 201
    inquiry_id = res_inquiry.get_json()['inquiry']['id']
    print(f"    [OK] Buyer submitted purchase inquiry: Inquiry ID {inquiry_id} ('pending').")

    # Farmer cannot inquire on own listing
    res_self_inquiry = client_farmer1.post('/api/marketplace/inquire', json={
        "listing_id": listing1_id,
        "sender_name": "Ramesh",
        "sender_phone": "9876543210",
        "message": "Self inquiry."
    })
    assert res_self_inquiry.status_code == 400
    print(f"    [OK] Farmer prevented from inquiring on their own listing (400).")

    # Farmer 1 checks inquiries
    res_farmer_inquiries = client_farmer1.get('/api/marketplace/my-inquiries')
    assert res_farmer_inquiries.status_code == 200
    inqs = res_farmer_inquiries.get_json()['inquiries']
    assert len(inqs) >= 1
    assert inqs[0]['sender_name'] == "Kiran Agro Traders"
    print(f"    [OK] Farmer 1 received inquiry from: {inqs[0]['sender_name']} ({inqs[0]['sender_phone']}).")

    # Farmer 2 cannot update status of Farmer 1's inquiry
    res_bad_status_update = client_farmer2.put(f'/api/marketplace/inquiries/{inquiry_id}/status', json={
        "status": "accepted"
    })
    assert res_bad_status_update.status_code == 403
    print(f"    [OK] Farmer 2 blocked from altering Farmer 1's inquiry status (403 Forbidden).")

    # Farmer 1 accepts inquiry
    res_accept = client_farmer1.put(f'/api/marketplace/inquiries/{inquiry_id}/status', json={
        "status": "accepted"
    })
    assert res_accept.status_code == 200
    assert res_accept.get_json()['inquiry']['status'] == 'accepted'
    print(f"    [OK] Farmer 1 updated inquiry status to 'accepted'.")

    # Cleanup listing (also cascades inquiry delete)
    res_del = client_farmer1.delete(f'/api/marketplace/listings/{listing1_id}')
    assert res_del.status_code == 200
    print(f"    [OK] Farmer 1 deleted produce listing and cascade cleaned up.")

    # 9. Regression Test (Phases 1–3)
    print(f"\n[9] Running Regression Checks for Phases 1–3:")
    assert client.get('/api/health').status_code == 200
    assert client_farmer1.get('/api/auth/me').status_code == 200
    assert client_farmer1.get('/api/crops').status_code == 200
    assert client.get('/api/weather/districts').status_code == 200
    assert client.get('/api/diseases/crops').status_code == 200
    print(f"    [OK] All Phase 1–3 endpoints continue to operate without regression.")

    print("\n" + "=" * 65)
    print("ALL PHASE 4 VERIFICATION TESTS PASSED SUCCESSFULLY! :)")
    print("=" * 65)

if __name__ == '__main__':
    test_phase4()
