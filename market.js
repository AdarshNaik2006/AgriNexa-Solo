/**
 * AgriNexa-Solo: Mandi Market Prices Controller
 * Note: Data is explicitly identified and presented as REFERENCE / DEMO DATA.
 */

async function initMarketPage() {
    await loadFilterOptions();
    await loadMandiPrices();
    await loadMandiTrends();
}

async function loadFilterOptions() {
    // 1. Commodities
    try {
        const commsRes = await apiFetch('/market/commodities');
        const commSelect = document.getElementById('filter-commodity');
        if (commsRes && commsRes.success && commSelect) {
            const lang = getCurrentLanguage();
            commSelect.innerHTML = '<option value="">All Commodities / ಎಲ್ಲಾ ಬೆಳೆಗಳು</option>' +
                commsRes.commodities.map(c => `
                    <option value="${c.commodity_en}">${c.commodity_en} (${c.commodity_kn || ''})</option>
                `).join('');
        }
    } catch (e) {
        console.warn('Error loading commodities:', e);
    }

    // 2. Districts
    try {
        const distRes = await apiFetch('/weather/districts');
        const distSelect = document.getElementById('filter-district');
        if (distRes && distRes.success && distSelect) {
            distSelect.innerHTML = '<option value="">All Districts / ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು</option>' +
                distRes.districts.map(d => `
                    <option value="${d.name_en}">${d.name_en} (${d.name_kn})</option>
                `).join('');
        }
    } catch (e) {
        console.warn('Error loading districts:', e);
    }
}

async function loadMandiPrices() {
    const tableBody = document.getElementById('mandi-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="7" class="loading-container"><div class="spinner"></div></td></tr>';

    const commVal = document.getElementById('filter-commodity') ? document.getElementById('filter-commodity').value : '';
    const distVal = document.getElementById('filter-district') ? document.getElementById('filter-district').value : '';

    const params = new URLSearchParams();
    if (commVal) params.append('commodity', commVal);
    if (distVal) params.append('district', distVal);

    try {
        const res = await apiFetch(`/market/prices?${params.toString()}`);
        if (res && res.success) {
            renderMandiPrices(res.prices);
        }
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="7" style="color: #d32f2f; text-align: center; padding: 1.5rem;">Failed to load prices: ${err.message}</td></tr>`;
    }
}

function renderMandiPrices(prices) {
    const tableBody = document.getElementById('mandi-table-body');
    if (!tableBody) return;

    if (!prices || prices.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="empty-state"><p>No mandi records found matching your filters.</p></td></tr>';
        return;
    }

    const lang = getCurrentLanguage();
    const trendIcons = {
        up: '<span style="color: #2e7d32; font-weight: 700;">▲ Rising</span>',
        down: '<span style="color: #d32f2f; font-weight: 700;">▼ Falling</span>',
        stable: '<span style="color: #6b7280; font-weight: 600;">▬ Stable</span>'
    };

    tableBody.innerHTML = prices.map(p => `
        <tr>
            <td>
                <strong>${lang === 'kn' ? (p.commodity_kn || p.commodity_en) : p.commodity_en}</strong>
                ${p.variety ? `<div style="font-size: 0.8rem; color: #6b7280;">${p.variety}</div>` : ''}
            </td>
            <td>${p.district}</td>
            <td>${p.market_name}</td>
            <td style="font-size: 0.85rem; color: #4b5563;">₹${p.min_price}</td>
            <td style="font-size: 0.85rem; color: #4b5563;">₹${p.max_price}</td>
            <td style="font-weight: 700; color: #1b5e20; font-size: 1rem;">₹${p.modal_price}</td>
            <td>${trendIcons[p.trend] || p.trend}</td>
        </tr>
    `).join('');
}

async function loadMandiTrends() {
    const container = document.getElementById('market-trends-grid');
    if (!container) return;

    try {
        const res = await apiFetch('/market/trends');
        if (res && res.success) {
            const lang = getCurrentLanguage();
            container.innerHTML = res.trends.slice(0, 6).map(t => `
                <div class="card" style="padding: 1rem;">
                    <div style="font-size: 1.1rem; font-weight: 700; color: #1b5e20; margin-bottom: 0.25rem;">
                        ${lang === 'kn' ? (t.commodity_kn || t.commodity_en) : t.commodity_en}
                    </div>
                    <div style="font-size: 1.5rem; font-weight: 800; color: #1f2937;">
                        ₹${t.average_modal} <span style="font-size: 0.85rem; font-weight: 400; color: #6b7280;">/ Quintal</span>
                    </div>
                    <div style="font-size: 0.8rem; color: #6b7280; margin-top: 0.35rem; display: flex; justify-content: space-between;">
                        <span>Range: ₹${t.lowest_modal} - ₹${t.highest_modal}</span>
                        <span>${t.reporting_markets} APMCs</span>
                    </div>
                    <div style="margin-top: 0.5rem;">
                        <span class="badge badge-demo">Reference Data</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {
        console.warn('Error loading mandi trends:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initMarketPage();

    const commSelect = document.getElementById('filter-commodity');
    if (commSelect) commSelect.addEventListener('change', loadMandiPrices);
    const distSelect = document.getElementById('filter-district');
    if (distSelect) distSelect.addEventListener('change', loadMandiPrices);
});
