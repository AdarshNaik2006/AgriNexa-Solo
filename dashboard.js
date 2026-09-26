/**
 * AgriNexa-Solo: Dashboard Controller
 */

async function loadDashboard() {
    const user = await requireAuth();
    if (!user) return;

    // Welcome greeting
    const greetingEl = document.getElementById('dash-farmer-name');
    if (greetingEl) {
        greetingEl.innerText = user.full_name;
    }
    const districtEl = document.getElementById('dash-farmer-district');
    if (districtEl) {
        districtEl.innerText = user.district ? `📍 ${user.district}, Karnataka` : '📍 Karnataka, India';
    }

    // 1. Fetch Crop Summary
    try {
        const cropRes = await apiFetch('/crops/summary');
        if (cropRes && cropRes.success) {
            const summary = cropRes.summary;
            document.getElementById('stat-active-crops').innerText = summary.active_crops_count;
            document.getElementById('stat-total-acres').innerText = `${summary.total_active_acres} ac`;

            const upcomingContainer = document.getElementById('dash-upcoming-harvests');
            if (upcomingContainer) {
                if (summary.upcoming_harvests.length === 0) {
                    upcomingContainer.innerHTML = '<p class="text-muted" style="font-size: 0.9rem;" data-i18n="no_data">No upcoming harvests in the next 45 days.</p>';
                } else {
                    upcomingContainer.innerHTML = summary.upcoming_harvests.map(h => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #f3f4f6;">
                            <div>
                                <strong>${h.crop_name} ${h.crop_name_kn ? `(${h.crop_name_kn})` : ''}</strong>
                                <div style="font-size: 0.8rem; color: #6b7280;">Target: ${h.expected_harvest_date}</div>
                            </div>
                            <span class="badge badge-warning">${h.days_remaining} days left</span>
                        </div>
                    `).join('');
                }
            }
        }
    } catch (e) {
        console.warn('Error loading crop summary:', e);
    }

    // 2. Fetch Live Weather & Advisory for User's District
    try {
        const districtParam = user.district ? `?district=${encodeURIComponent(user.district)}` : '';
        const weatherRes = await apiFetch(`/weather/current${districtParam}`);
        if (weatherRes && weatherRes.success) {
            const w = weatherRes.data;
            const current = w.current;
            const advisory = w.agricultural_advisory;

            document.getElementById('dash-weather-temp').innerText = `${current.temperature_c}°C`;
            document.getElementById('dash-weather-cond').innerText = getCurrentLanguage() === 'kn' ? current.condition_kn : current.condition_en;
            document.getElementById('dash-weather-wind').innerText = `💨 ${current.wind_speed_kmh} km/h`;
            document.getElementById('dash-weather-humid').innerText = `💧 ${current.humidity_percent}%`;

            // Spraying & Irrigation Advisory
            const advContainer = document.getElementById('dash-advisory-cards');
            if (advContainer && advisory) {
                const sprayingStatus = getCurrentLanguage() === 'kn' ? advisory.spraying.status_kn : advisory.spraying.status;
                const sprayingReason = getCurrentLanguage() === 'kn' ? advisory.spraying.reason_kn : advisory.spraying.reason_en;
                
                const irrigationStatus = getCurrentLanguage() === 'kn' ? advisory.irrigation.status_kn : advisory.irrigation.status;
                const irrigationReason = getCurrentLanguage() === 'kn' ? advisory.irrigation.reason_kn : advisory.irrigation.reason_en;

                advContainer.innerHTML = `
                    <div style="background: #f9fafb; padding: 0.85rem; border-radius: 8px; margin-bottom: 0.75rem; border-left: 4px solid #2e7d32;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                            <strong style="color: #1b5e20;">🚜 Spraying Guidance</strong>
                            <span class="badge badge-${advisory.spraying.badge_color}">${sprayingStatus}</span>
                        </div>
                        <p style="font-size: 0.85rem; margin: 0; color: #4b5563;">${sprayingReason}</p>
                    </div>

                    <div style="background: #f9fafb; padding: 0.85rem; border-radius: 8px; border-left: 4px solid #0288d1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                            <strong style="color: #0288d1;">💧 Smart Irrigation</strong>
                            <span class="badge badge-${advisory.irrigation.badge_color}">${irrigationStatus}</span>
                        </div>
                        <p style="font-size: 0.85rem; margin: 0; color: #4b5563;">${irrigationReason}</p>
                    </div>
                `;
            }
        }
    } catch (e) {
        console.warn('Error loading weather on dashboard:', e);
        const wCard = document.getElementById('dash-weather-temp');
        if (wCard) wCard.innerText = '--';
    }

    // 3. Fetch Produce Listings & Inquiries Counts
    try {
        const listingsRes = await apiFetch('/marketplace/my-listings');
        if (listingsRes && listingsRes.success) {
            document.getElementById('stat-my-listings').innerText = listingsRes.count;
        }
        const inquiriesRes = await apiFetch('/marketplace/my-inquiries');
        if (inquiriesRes && inquiriesRes.success) {
            document.getElementById('stat-inquiries').innerText = inquiriesRes.count;
        }
    } catch (e) {
        console.warn('Error loading marketplace stats:', e);
    }

    // 4. Fetch Mandi Trends Highlights
    try {
        const mandiRes = await apiFetch('/market/trends');
        if (mandiRes && mandiRes.success) {
            const trendsContainer = document.getElementById('dash-mandi-trends');
            if (trendsContainer) {
                const sample = mandiRes.trends.slice(0, 5);
                trendsContainer.innerHTML = sample.map(item => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid #f3f4f6;">
                        <div>
                            <strong>${getCurrentLanguage() === 'kn' ? (item.commodity_kn || item.commodity_en) : item.commodity_en}</strong>
                            <div style="font-size: 0.75rem; color: #9ca3af;">Avg Modal Rate across ${item.reporting_markets} APMCs</div>
                        </div>
                        <span style="font-weight: 700; color: #2e7d32;">₹${item.average_modal} <small style="font-weight: 400; color: #6b7280;">/Q</small></span>
                    </div>
                `).join('');
            }
        }
    } catch (e) {
        console.warn('Error loading mandi trends:', e);
    }

    applyTranslations();
}

document.addEventListener('DOMContentLoaded', loadDashboard);
