/**
 * AgriNexa-Solo: Crop Disease Knowledge Base & Reference Advisory Controller
 * Notice: This is an educational reference guide, NOT an automated AI diagnosis.
 */

async function initDiseasePage() {
    await loadCropFilter();

    // Check URL parameters (e.g. ?crop=Paddy or ?search=...)
    const urlParams = new URLSearchParams(window.location.search);
    const cropParam = urlParams.get('crop');
    const searchParam = urlParams.get('search');

    if (cropParam) {
        const select = document.getElementById('filter-crop');
        if (select) select.value = cropParam;
    }
    if (searchParam) {
        const input = document.getElementById('search-query');
        if (input) input.value = searchParam;
    }

    loadDiseases();
}

async function loadCropFilter() {
    try {
        const res = await apiFetch('/diseases/crops');
        const select = document.getElementById('filter-crop');
        if (res && res.success && select) {
            const lang = getCurrentLanguage();
            select.innerHTML = '<option value="">All Crops / ಎಲ್ಲಾ ಬೆಳೆಗಳು</option>' +
                res.crops.map(c => `
                    <option value="${c.crop_name_en}">${c.crop_name_en} (${c.crop_name_kn})</option>
                `).join('');
        }
    } catch (e) {
        console.warn('Error loading crops filter:', e);
    }
}

async function loadDiseases() {
    const container = document.getElementById('diseases-list');
    if (!container) return;

    container.innerHTML = '<div class="loading-container"><div class="spinner"></div><p>Loading disease knowledge base...</p></div>';

    const cropVal = document.getElementById('filter-crop') ? document.getElementById('filter-crop').value : '';
    const searchVal = document.getElementById('search-query') ? document.getElementById('search-query').value.trim() : '';
    const sevVal = document.getElementById('filter-severity') ? document.getElementById('filter-severity').value : '';

    const params = new URLSearchParams();
    if (cropVal) params.append('crop', cropVal);
    if (searchVal) params.append('search', searchVal);
    if (sevVal) params.append('severity', sevVal);

    try {
        const res = await apiFetch(`/diseases?${params.toString()}`);
        if (res && res.success) {
            renderDiseases(res.diseases, res.disclaimer_en, res.disclaimer_kn);
        }
    } catch (err) {
        container.innerHTML = `<div class="notice-box notice-warning">⚠️ Failed to load diseases: ${err.message}</div>`;
    }
}

function renderDiseases(diseases, disclaimerEn, disclaimerKn) {
    const container = document.getElementById('diseases-list');
    if (!container) return;

    const lang = getCurrentLanguage();

    if (!diseases || diseases.length === 0) {
        container.innerHTML = `
            <div class="empty-state card">
                <div class="empty-state-icon">🔬</div>
                <div class="empty-state-title">No diseases found</div>
                <p>Try searching with another keyword or select a different crop from the dropdown.</p>
            </div>
        `;
        return;
    }

    const sevBadge = {
        high: 'badge-danger',
        medium: 'badge-warning',
        low: 'badge-info'
    };

    container.innerHTML = `
        <div class="notice-box notice-info" style="margin-bottom: 1.25rem;">
            ℹ️ ${lang === 'kn' ? disclaimerKn : disclaimerEn}
        </div>

        <div class="grid grid-2">
            ${diseases.map(d => `
                <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div class="card-header">
                            <div>
                                <span class="badge badge-success" style="margin-bottom: 0.3rem;">${d.crop_name}</span>
                                <h3 class="card-title" style="font-size: 1.2rem; color: #1b5e20;">
                                    ${lang === 'kn' ? (d.disease_name_kn || d.disease_name_en) : d.disease_name_en}
                                </h3>
                                ${lang !== 'kn' && d.disease_name_kn ? `<div style="font-size: 0.85rem; color: #4b5563;">${d.disease_name_kn}</div>` : ''}
                            </div>
                            <span class="badge ${sevBadge[d.severity] || 'badge-warning'}">Severity: ${d.severity}</span>
                        </div>

                        <!-- Symptoms -->
                        <div style="margin-bottom: 1rem;">
                            <strong style="color: #374151; font-size: 0.95rem;">🔍 Symptoms:</strong>
                            <p style="font-size: 0.9rem; color: #4b5563; margin-top: 0.2rem;">
                                ${lang === 'kn' ? (d.symptoms_kn || d.symptoms_en) : d.symptoms_en}
                            </p>
                        </div>

                        <!-- Organic Remedies -->
                        <div style="background: #f0fdf4; padding: 0.75rem; border-radius: 8px; margin-bottom: 0.85rem; border-left: 3px solid #2e7d32;">
                            <strong style="color: #1b5e20; font-size: 0.9rem;">🌿 Organic & Bio Remedies:</strong>
                            <p style="font-size: 0.85rem; color: #166534; margin-top: 0.25rem;">
                                ${lang === 'kn' ? (d.organic_remedy_kn || d.organic_remedy_en) : d.organic_remedy_en}
                            </p>
                        </div>

                        <!-- Chemical Treatment with CIBRC Disclaimer -->
                        <div style="background: #fff8f8; padding: 0.75rem; border-radius: 8px; margin-bottom: 0.85rem; border-left: 3px solid #d32f2f;">
                            <strong style="color: #b91c1c; font-size: 0.9rem;">🧪 Chemical Treatment Advisory:</strong>
                            <p style="font-size: 0.85rem; color: #991b1b; margin-top: 0.25rem;">
                                ${lang === 'kn' ? (d.chemical_treatment_kn || d.chemical_treatment_en) : d.chemical_treatment_en}
                            </p>
                        </div>

                        <!-- Preventive Measures -->
                        <div style="font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">
                            <strong>🛡️ Preventive Cultural Practices:</strong>
                            <div style="margin-top: 0.2rem;">
                                ${lang === 'kn' ? (d.preventive_measures_kn || d.preventive_measures_en) : d.preventive_measures_en}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    initDiseasePage();

    const cropSelect = document.getElementById('filter-crop');
    if (cropSelect) cropSelect.addEventListener('change', loadDiseases);

    const sevSelect = document.getElementById('filter-severity');
    if (sevSelect) sevSelect.addEventListener('change', loadDiseases);

    const searchInput = document.getElementById('search-query');
    if (searchInput) {
        let timer;
        searchInput.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(loadDiseases, 350);
        });
    }
});
