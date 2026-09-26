# 🌾 AgriNexa-Solo — Farmer Advisory & Agricultural Marketplace

**AgriNexa-Solo** is an independent, full-stack, responsive web application engineered specifically for Indian farmers with focused localization for **Karnataka**. It functions seamlessly across laptop, desktop, and mobile browsers without requiring any paid third-party APIs.

---

## 🌟 Core Highlights & Architecture

- **Completely Independent**: Zero dependencies on previous legacy projects.
- **Unified Single Server**: Flask serves both the REST API layer (`/api/*`) and the responsive frontend web application (`/*.html` and static assets) on `http://127.0.0.1:5000`.
- **Zero Paid API Dependencies**:
  - **Weather**: Keyless, free Open-Meteo weather API with 7-day forecasts and rule-based agricultural advisories.
  - **Geolocation**: Browser-native HTML5 Geolocation API with Karnataka district fallback coordinates.
  - **Voice Navigation & TTS**: Browser-native Web Speech API (SpeechRecognition + SpeechSynthesis) supporting English and Kannada.
- **Bilingual Interface**: Seamless instant toggle between **English** and **Kannada (ಕನ್ನಡ)** with persistent user preference storage.
- **Strict Data Integrity & Disclaimers**:
  - Mandi prices are strictly flagged as **REFERENCE / DEMO DATA**, never misleading farmers as live spot rates.
  - Disease advisory is strictly presented as an **agricultural knowledge base**, explicitly disclaiming AI vision diagnosis.
  - Chemical treatments strictly mandate adherence to **CIBRC and Raitha Samparka Kendra (RSK)** approved product labels.
- **Multi-Tenant Security**: Session-based authentication with Werkzeug password hashing; strict data isolation ensures farmers can only mutate their own crops, produce listings, and service offerings.

---

## 📂 Project Structure

```
AgriNexa-Solo/
├── backend/
│   ├── models/
│   │   ├── user.py               # Farmer & Buyer user accounts
│   │   ├── crop.py               # Farmer crop management records
│   │   ├── disease.py            # Bilingual crop disease knowledge base
│   │   ├── mandi.py              # APMC mandi reference price records
│   │   ├── marketplace.py        # Produce listings & buyer purchase inquiries
│   │   ├── service.py            # Machinery rental & farm labor listings
│   │   └── society.py            # RSK, KVK, and APMC agricultural office directory
│   ├── routes/
│   │   ├── auth_routes.py        # /api/auth (register, login, me, logout, profile)
│   │   ├── crop_routes.py        # /api/crops (CRUD + summary metrics)
│   │   ├── weather_routes.py     # /api/weather (Open-Meteo + agronomic rules)
│   │   ├── disease_routes.py     # /api/diseases (knowledge base + symptoms)
│   │   ├── mandi_routes.py       # /api/mandi (APMC reference prices + trends)
│   │   ├── marketplace_routes.py # /api/marketplace (produce listings + inquiries)
│   │   ├── service_routes.py     # /api/services (machinery rental + labor)
│   │   └── society_routes.py     # /api/societies (RSK, KVK, APMC directory)
│   ├── services/
│   │   ├── weather_service.py    # Open-Meteo weather integration & advisory engine
│   │   └── seed_data.py          # Curated seed fixtures (diseases, mandi, societies, services)
│   ├── instance/
│   │   └── agrinexa.db           # SQLite database
│   ├── app.py                    # Flask application factory & frontend router
│   └── config.py                 # Configuration settings
├── frontend/
│   ├── css/
│   │   └── style.css             # Responsive, mobile-first agricultural theme
│   ├── js/
│   │   ├── api.js                # Centralized Fetch client, sessions, toasts, modals
│   │   ├── language.js           # Bilingual English/Kannada engine
│   │   ├── auth.js               # Session auth guards & profile sync
│   │   ├── voice.js              # Browser Speech Recognition & TTS synthesis
│   │   ├── dashboard.js          # Farmer dashboard controller
│   │   ├── crops.js              # Crop CRUD controller
│   │   ├── weather.js            # Weather & spray advisory controller
│   │   ├── market.js             # Mandi price browser controller
│   │   ├── marketplace.js        # Produce marketplace listing controller
│   │   ├── buyers.js             # Public buyer produce directory controller
│   │   ├── inquiries.js          # Farmer inquiry management controller
│   │   ├── disease.js            # Disease advisory knowledge base controller
│   │   ├── advisory.js           # Agronomic heuristics controller
│   │   ├── workers.js            # Equipment & labor directory controller
│   │   ├── societies.js          # RSK & APMC directory controller
│   │   └── profile.js            # Farmer profile editor controller
│   ├── index.html                # Landing page & quick links
│   ├── login.html                # Farmer / Buyer sign-in
│   ├── register.html             # Account registration
│   ├── dashboard.html            # Unified farmer dashboard
│   ├── crops.html                # Crop inventory management
│   ├── weather.html              # 7-day forecast & smart advisory
│   ├── market.html               # Mandi price tracker (Reference data)
│   ├── marketplace.html          # Farmer produce listing manager
│   ├── buyers.html               # Public produce directory & inquiry sender
│   ├── inquiries.html            # Farmer incoming inquiry inbox
│   ├── disease.html              # Crop disease knowledge base
│   ├── advisory.html             # Dedicated agricultural advisory
│   ├── workers.html              # Farm equipment rental & labor directory
│   ├── societies.html            # Raitha Samparka Kendra (RSK) directory
│   └── farmer-profile.html       # Farmer account settings & language toggle
├── verify_phase2.py              # Phase 2 test suite (Auth & DB schema)
├── verify_phase3.py              # Phase 3 test suite (Crops, Weather, Diseases)
├── verify_phase4.py              # Phase 4 test suite (Mandi prices, Marketplace, Inquiries)
├── verify_phase5.py              # Phase 5 test suite (Full end-to-end integration)
├── run.py                        # Application entry point
├── requirements.txt              # Python package dependencies
├── .env.example                  # Environment configuration template
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, CSS3 (Mobile-First Responsive Grid/Flexbox), Vanilla JavaScript (ES6+ Modules) |
| **Backend** | Python (3.10+), Flask 3.1, Flask-SQLAlchemy 3.1, Werkzeug |
| **Database** | SQLite3 via SQLAlchemy ORM |
| **External APIs** | Open-Meteo Weather API (Free, keyless, zero quota limit) |
| **Browser APIs** | HTML5 Geolocation API, Web Speech API (`webkitSpeechRecognition`, `speechSynthesis`) |
| **Localization** | Custom dynamic i18n engine (`data-i18n` bindings) supporting English & Kannada (`kn`) |

---

## 🚀 Quickstart & Running Instructions

### 1. Prerequisites
- Python 3.10, 3.11, 3.12, 3.13, or 3.14 installed on your system.

### 2. Install Dependencies
Open a terminal in the `AgriNexa-Solo` root directory:
```bash
pip install -r requirements.txt
```

### 3. Launch the Unified Server
```bash
py run.py
```
*(Or `python run.py` / `python3 run.py` depending on your environment).*

On startup, AgriNexa-Solo automatically creates the SQLite database tables and seeds:
- **12 Curated Disease Advisory Records**
- **31 Reference APMC Mandi Price Records**
- **15 Karnataka Agricultural Societies & RSK Offices**
- **5 Initial Agricultural Machinery & Service Listings**

### 4. Access the Application
Open your web browser and navigate to:
- **Home / Landing Page**: `http://127.0.0.1:5000/`
- **Farmer Dashboard**: `http://127.0.0.1:5000/dashboard`
- **Login**: `http://127.0.0.1:5000/login`
- **Register**: `http://127.0.0.1:5000/register`
- **Weather & Advisory**: `http://127.0.0.1:5000/weather`
- **Mandi Prices**: `http://127.0.0.1:5000/market`
- **Produce Marketplace**: `http://127.0.0.1:5000/marketplace`
- **Public Produce Directory**: `http://127.0.0.1:5000/buyers`
- **Crop Disease Advisory**: `http://127.0.0.1:5000/disease`
- **Machinery & Labor Services**: `http://127.0.0.1:5000/workers`
- **Agricultural Societies**: `http://127.0.0.1:5000/societies`

---

## 📡 REST API Reference

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new farmer or buyer account.
- `POST /api/auth/login` — Authenticate and create a secure session cookie.
- `GET /api/auth/me` — Retrieve the currently logged-in user profile.
- `PUT /api/auth/profile` — Update farmer profile details and preferred language.
- `POST /api/auth/logout` — Invalidate session.

### 2. Crop Management (`/api/crops`)
- `GET /api/crops` — List all crops owned by the authenticated farmer.
- `POST /api/crops` — Add a new crop (validates name, acreage, growth stage, sowing/harvest dates).
- `GET /api/crops/<id>` — Get single crop details.
- `PUT /api/crops/<id>` — Update crop stage, acreage, or harvest date.
- `DELETE /api/crops/<id>` — Delete a crop.
- `GET /api/crops/summary` — Aggregate acreage and count metrics by crop.

### 3. Weather & Farming Advisories (`/api/weather`)
- `GET /api/weather/current?district=Mandya` — Live Open-Meteo weather + 7-day forecast.
- `GET /api/weather/advisory?district=Shivamogga` — Automated agronomic rule-based advisories for spraying feasibility, smart irrigation schedules, and weather warnings.
- `GET /api/weather/districts` — Supported 31 Karnataka districts with fallback GPS coordinates and bilingual names.

### 4. Crop Disease Knowledge Base (`/api/diseases`)
- `GET /api/diseases` — List curated crop diseases (filter by crop or query).
- `GET /api/diseases/<id>` — Detailed disease guide including symptoms, organic remedies, and chemical controls.
- `GET /api/diseases/crops` — List of all covered crops.

### 5. Mandi Market Prices (`/api/mandi`)
- `GET /api/mandi/prices` — Reference APMC mandi prices (filter by commodity, market, district).
- `GET /api/mandi/commodities` — Distinct commodities tracked.
- `GET /api/mandi/markets` — Active APMC market yards.
- `GET /api/mandi/trends` — Modal price aggregations and trend indicators (up/down/stable).

### 6. Produce Marketplace & Inquiries (`/api/marketplace`)
- `GET /api/marketplace/listings` — Public produce listings available for sale.
- `POST /api/marketplace/listings` — Post a new produce lot (requires authenticated farmer).
- `GET /api/marketplace/listings/<id>` — Public listing details (sanitized, zero sensitive leaks).
- `PUT /api/marketplace/listings/<id>` — Update listing price, quantity, or status (strict owner only).
- `DELETE /api/marketplace/listings/<id>` — Delete listing (strict owner only).
- `POST /api/marketplace/inquire` — Submit a buyer purchase offer (strict self-inquiry rejection).
- `GET /api/marketplace/my-inquiries` — List inquiries received for the farmer's produce.
- `PUT /api/marketplace/inquiries/<id>/status` — Accept, reject, or mark inquiries as completed.

### 7. Farm Machinery & Labor Services (`/api/services`)
- `GET /api/services` — Public directory of equipment rentals and farm labor.
- `POST /api/services` — Post a machinery or labor listing (requires authenticated user).
- `PUT /api/services/<id>` — Update service details or availability (strict owner only).
- `DELETE /api/services/<id>` — Remove service listing (strict owner only).

### 8. Agricultural Societies Directory (`/api/societies`)
- `GET /api/societies` — Directory of Raitha Samparka Kendras (RSK), KVKs, and APMCs with contact phone numbers and office locations.

---

## 🧪 Automated Verification Test Suites

Every single feature of AgriNexa-Solo is rigorously verified through dedicated Python test scripts:

```bash
# 1. Verify Phase 2 (Authentication, SQLite DB schema, password hashing)
py verify_phase2.py

# 2. Verify Phase 3 (Crop CRUD, Open-Meteo weather, rule advisories, diseases)
py verify_phase3.py

# 3. Verify Phase 4 (Mandi prices, marketplace, buyer inquiries, privacy)
py verify_phase4.py

# 4. Verify Phase 5 (Full end-to-end integration, 15 pages, static assets, all APIs)
py verify_phase5.py
```

All 4 test suites execute against the live application context and pass with 100% success.

---

## ⚖️ Safety & Ethical Disclaimers

1. **APMC Mandi Price Disclaimer**:
   All Mandi prices displayed across AgriNexa-Solo are curated **REFERENCE / DEMO DATA** based on Karnataka APMC historical market trends. They are designed for educational, demonstration, and planning purposes and do **not** represent verified live spot-market transactions.

2. **Crop Disease Advisory Disclaimer**:
   The crop disease module provides expert agricultural advisory knowledge curated from agricultural university guides. It is **NOT** an AI automated diagnostic tool. Farmers are advised to consult local Raitha Samparka Kendra (RSK) agricultural officers for conclusive lab diagnosis.

3. **Chemical Safety & Pesticide Dosage**:
   Pesticides and fungicides mentioned are indicative active ingredients. Chemical dosages are not universally applicable to all soil and crop conditions. Farmers must strictly follow the official product label approved by the **Central Insecticides Board & Registration Committee (CIBRC)** and consult local agricultural extension officers before application.
