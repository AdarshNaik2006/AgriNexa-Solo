/**
 * AgriNexa-Solo: Weather & Agricultural Advisory Controller
 */

let currentWeatherAdvisory = null;

async function initWeatherPage() {
    await loadDistrictsDropdown();
    
    // Check if farmer has a saved district
    if (currentUser && currentUser.district) {
        const select = document.getElementById('district-select');
        if (select) {
            select.value = currentUser.district;
        }
        loadWeather({ district: currentUser.district });
    } else {
        loadWeather({ district: 'Mandya' }); // Default agricultural heartland
    }
}

async function loadDistrictsDropdown() {
    try {
        const res = await apiFetch('/weather/districts');
        const select = document.getElementById('district-select');
        if (res && res.success && select) {
            const lang = getCurrentLanguage();
            select.innerHTML = '<option value="">-- Select Karnataka District --</option>' + 
                res.districts.map(d => `
                    <option value="${d.name_en}">${d.name_en} (${d.name_kn})</option>
                `).join('');
        }
    } catch (e) {
        console.warn('Could not load districts:', e);
    }
}

async function loadWeather(params = {}) {
    const container = document.getElementById('weather-display');
    if (!container) return;

    container.innerHTML = '<div class="loading-container"><div class="spinner"></div><p>Fetching forecast from Open-Meteo...</p></div>';

    let queryStr = '';
    if (params.lat && params.lon) {
        queryStr = `?lat=${params.lat}&lon=${params.lon}`;
    } else if (params.district) {
        queryStr = `?district=${encodeURIComponent(params.district)}`;
    }

    try {
        const res = await apiFetch(`/weather/current${queryStr}`);
        if (res && res.success) {
            renderWeatherData(res.data);
        }
    } catch (err) {
        container.innerHTML = `
            <div class="notice-box notice-warning">
                ⚠️ Weather Service Notice: ${err.message}
                <p style="margin-top: 0.5rem; font-size: 0.85rem;">You can select another district from the dropdown above to retry.</p>
            </div>
        `;
    }
}

function renderWeatherData(data) {
    const container = document.getElementById('weather-display');
    if (!container) return;

    const lang = getCurrentLanguage();
    const cur = data.current;
    const loc = data.location;
    const adv = data.agricultural_advisory;
    currentWeatherAdvisory = adv;

    const conditionText = lang === 'kn' ? cur.condition_kn : cur.condition_en;

    container.innerHTML = `
        <!-- Current Weather Overview -->
        <div class="card" style="margin-bottom: 1.5rem; background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%); color: #ffffff;">
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem;">
                <div>
                    <div style="font-size: 0.95rem; opacity: 0.9;">📍 ${loc.name}</div>
                    <div style="font-size: 3rem; font-weight: 800; line-height: 1.1; margin: 0.4rem 0;">
                        ${cur.temperature_c}°C
                    </div>
                    <div style="font-size: 1.15rem; font-weight: 600;">
                        ${conditionText}
                    </div>
                    <div style="font-size: 0.85rem; opacity: 0.85;">Feels like ${cur.feels_like_c}°C</div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; background: rgba(255,255,255,0.12); padding: 1rem; border-radius: 12px;">
                    <div>
                        <div style="font-size: 0.75rem; opacity: 0.85;">Humidity</div>
                        <div style="font-size: 1.15rem; font-weight: 700;">💧 ${cur.humidity_percent}%</div>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; opacity: 0.85;">Wind Speed</div>
                        <div style="font-size: 1.15rem; font-weight: 700;">💨 ${cur.wind_speed_kmh} km/h</div>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; opacity: 0.85;">Precipitation</div>
                        <div style="font-size: 1.15rem; font-weight: 700;">🌧️ ${cur.precipitation_mm} mm</div>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; opacity: 0.85;">Provider</div>
                        <div style="font-size: 0.85rem; font-weight: 600;">Open-Meteo</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Rule-Based Agricultural Advisories -->
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #1b5e20; margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: space-between;">
            <span>🌱 Agricultural Field Guidance (Rule-Based Heuristics)</span>
            <button class="btn btn-secondary btn-sm" onclick="speakWeatherAdvisory()" title="Read advisory aloud">🔊 Listen</button>
        </h3>

        <div class="grid grid-2" style="margin-bottom: 1.5rem;">
            <!-- Spraying Feasibility -->
            <div class="card" style="border-left: 5px solid ${adv.spraying.badge_color === 'success' ? '#2e7d32' : (adv.spraying.badge_color === 'danger' ? '#d32f2f' : '#ed6c02')};">
                <div class="card-header">
                    <strong style="color: #1b5e20;">🚜 Foliar & Chemical Spraying</strong>
                    <span class="badge badge-${adv.spraying.badge_color}">
                        ${lang === 'kn' ? adv.spraying.status_kn : adv.spraying.status}
                    </span>
                </div>
                <p style="font-size: 0.9rem; color: #374151;">
                    ${lang === 'kn' ? adv.spraying.reason_kn : adv.spraying.reason_en}
                </p>
            </div>

            <!-- Irrigation Guidance -->
            <div class="card" style="border-left: 5px solid #0288d1;">
                <div class="card-header">
                    <strong style="color: #0288d1;">💧 Smart Irrigation Schedule</strong>
                    <span class="badge badge-${adv.irrigation.badge_color}">
                        ${lang === 'kn' ? adv.irrigation.status_kn : adv.irrigation.status}
                    </span>
                </div>
                <p style="font-size: 0.9rem; color: #374151;">
                    ${lang === 'kn' ? adv.irrigation.reason_kn : adv.irrigation.reason_en}
                </p>
            </div>
        </div>

        <!-- 7-Day Forecast Cards -->
        <h3 style="font-size: 1.2rem; font-weight: 700; color: #1f2937; margin-bottom: 0.75rem;">
            📅 7-Day Agricultural Forecast
        </h3>

        <div class="grid grid-4" style="margin-bottom: 1.5rem;">
            ${data.forecast.map(day => `
                <div class="card" style="padding: 1rem; text-align: center;">
                    <div style="font-weight: 700; color: #1b5e20; font-size: 0.95rem;">${formatDateName(day.date)}</div>
                    <div style="font-size: 0.8rem; color: #6b7280; margin-bottom: 0.5rem;">${day.date}</div>
                    <div style="font-size: 1.35rem; font-weight: 800; color: #1f2937;">${day.temp_max_c}° <span style="font-size: 0.95rem; font-weight: 400; color: #6b7280;">/ ${day.temp_min_c}°</span></div>
                    <div style="font-size: 0.85rem; font-weight: 600; margin: 0.35rem 0;">${lang === 'kn' ? day.condition_kn : day.condition_en}</div>
                    <div style="font-size: 0.8rem; color: #0288d1; margin-top: 0.35rem;">🌧️ ${day.precipitation_probability}% Rain (${day.precipitation_mm}mm)</div>
                </div>
            `).join('')}
        </div>

        <div class="notice-box notice-info" style="font-size: 0.82rem;">
            ℹ️ ${lang === 'kn' ? adv.disclaimer_kn : adv.disclaimer_en}
        </div>
    `;
}

function formatDateName(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short' });
}

function useBrowserLocation() {
    if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser.', 'warning');
        return;
    }

    showToast('Locating your farm coordinates...', 'info', 2000);
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            loadWeather({ lat, lon });
            showToast('Loaded weather for your current GPS location!', 'success');
        },
        (err) => {
            console.warn('Geolocation error:', err);
            showToast('Location permission denied or unavailable. Please select your district from the dropdown.', 'warning', 4000);
        },
        { timeout: 10000, enableHighAccuracy: false }
    );
}

function speakWeatherAdvisory() {
    if (!currentWeatherAdvisory || !window.VoiceAssistant) return;
    const lang = getCurrentLanguage();
    const spraying = lang === 'kn' ? 
        `ಔಷಧ ಸಿಂಪಡಣೆ: ${currentWeatherAdvisory.spraying.status_kn}. ${currentWeatherAdvisory.spraying.reason_kn}` : 
        `Spraying guidance: ${currentWeatherAdvisory.spraying.status}. ${currentWeatherAdvisory.spraying.reason_en}`;
    
    const irrigation = lang === 'kn' ? 
        `ನೀರಾವರಿ ಸಲಹೆ: ${currentWeatherAdvisory.irrigation.status_kn}. ${currentWeatherAdvisory.irrigation.reason_kn}` : 
        `Irrigation guidance: ${currentWeatherAdvisory.irrigation.status}. ${currentWeatherAdvisory.irrigation.reason_en}`;

    VoiceAssistant.speak(`${spraying}. ${irrigation}`);
}

document.addEventListener('DOMContentLoaded', () => {
    initWeatherPage();

    const select = document.getElementById('district-select');
    if (select) {
        select.addEventListener('change', (e) => {
            if (e.target.value) {
                loadWeather({ district: e.target.value });
            }
        });
    }

    const gpsBtn = document.getElementById('use-gps-btn');
    if (gpsBtn) {
        gpsBtn.addEventListener('click', useBrowserLocation);
    }
});
