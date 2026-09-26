/**
 * AgriNexa-Solo: Agricultural Societies & Extension Offices Controller
 */

async function loadSocieties() {
    const container = document.getElementById('societies-list');
    if (!container) return;

    container.innerHTML = '<div class="loading-container" style="grid-column: 1 / -1;"><div class="spinner"></div><p>Loading agricultural societies & RSK offices...</p></div>';

    const distVal = document.getElementById('filter-district') ? document.getElementById('filter-district').value : '';
    const typeVal = document.getElementById('filter-type') ? document.getElementById('filter-type').value : '';
    const searchVal = document.getElementById('search-query') ? document.getElementById('search-query').value.trim() : '';

    const params = new URLSearchParams();
    if (distVal) params.append('district', distVal);
    if (typeVal) params.append('type', typeVal);
    if (searchVal) params.append('search', searchVal);

    try {
        const res = await apiFetch(`/societies?${params.toString()}`);
        if (res && res.success) {
            renderSocieties(res.societies);
        }
    } catch (err) {
        container.innerHTML = `<div class="notice-box notice-warning" style="grid-column: 1 / -1;">⚠️ Failed to load societies: ${err.message}</div>`;
    }
}

function renderSocieties(societies) {
    const container = document.getElementById('societies-list');
    if (!container) return;

    if (!societies || societies.length === 0) {
        container.innerHTML = `
            <div class="empty-state card" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">🏛️</div>
                <div class="empty-state-title">No agricultural offices found</div>
                <p>Try searching for a different district or society type.</p>
            </div>
        `;
        return;
    }

    const lang = getCurrentLanguage();
    const typeBadges = {
        RSK: 'badge-success',
        KVK: 'badge-info',
        APMC: 'badge-warning',
        PACS: 'badge-secondary',
        HORTICULTURE: 'badge-success'
    };

    container.innerHTML = societies.map(s => `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <div class="card-header">
                    <div>
                        <h3 class="card-title" style="font-size: 1.1rem;">
                            ${lang === 'kn' ? (s.name_kn || s.name_en) : s.name_en}
                        </h3>
                        <span style="font-size: 0.8rem; color: #6b7280;">📍 ${s.taluk ? `${s.taluk}, ` : ''}${s.district}</span>
                    </div>
                    <span class="badge ${typeBadges[s.society_type] || 'badge-info'}">${s.society_type}</span>
                </div>

                <div style="font-size: 0.88rem; color: #4b5563; margin-bottom: 0.75rem;">
                    <div style="margin-bottom: 0.35rem;">
                        <strong>Address:</strong> ${s.address || 'District Center'}
                    </div>
                    ${s.contact_person ? `
                        <div style="margin-bottom: 0.35rem;">
                            <strong>Officer:</strong> 👤 ${s.contact_person}
                        </div>
                    ` : ''}
                </div>

                ${s.services_offered ? `
                    <div style="background: #f9fafb; padding: 0.65rem; border-radius: 6px; font-size: 0.82rem; color: #374151; border-left: 3px solid #2e7d32; margin-bottom: 0.75rem;">
                        <strong>Services Offered:</strong> ${s.services_offered}
                    </div>
                ` : ''}
            </div>

            <div style="padding-top: 0.75rem; border-top: 1px solid #e5e7eb;">
                ${s.phone ? `
                    <a href="tel:${s.phone}" class="btn btn-secondary btn-sm" style="width: 100%; display: flex; justify-content: center;" title="Call Office">
                        📞 Call ${s.phone}
                    </a>
                ` : '<span style="font-size: 0.8rem; color: #9ca3af;">Contact number on visit</span>'}
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    loadSocieties();

    const distSelect = document.getElementById('filter-district');
    if (distSelect) distSelect.addEventListener('change', loadSocieties);

    const typeSelect = document.getElementById('filter-type');
    if (typeSelect) typeSelect.addEventListener('change', loadSocieties);

    const searchInput = document.getElementById('search-query');
    if (searchInput) {
        let timeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(loadSocieties, 300);
        });
    }
});
