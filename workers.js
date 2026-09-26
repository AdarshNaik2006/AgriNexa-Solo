/**
 * AgriNexa-Solo: Agricultural Workers & Machinery Services Controller
 */

async function loadServices() {
    const container = document.getElementById('services-grid');
    if (!container) return;

    container.innerHTML = '<div class="loading-container" style="grid-column: 1 / -1;"><div class="spinner"></div><p>Loading agricultural services...</p></div>';

    const categoryVal = document.getElementById('filter-category') ? document.getElementById('filter-category').value : '';
    const distVal = document.getElementById('filter-district') ? document.getElementById('filter-district').value : '';

    const params = new URLSearchParams();
    if (categoryVal) params.append('category', categoryVal);
    if (distVal) params.append('district', distVal);

    try {
        const res = await apiFetch(`/services?${params.toString()}`);
        if (res && res.success) {
            renderServices(res.services);
        }
    } catch (err) {
        container.innerHTML = `<div class="notice-box notice-warning" style="grid-column: 1 / -1;">⚠️ Failed to load services: ${err.message}</div>`;
    }
}

function renderServices(services) {
    const container = document.getElementById('services-grid');
    if (!container) return;

    if (!services || services.length === 0) {
        container.innerHTML = `
            <div class="empty-state card" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">🚜</div>
                <div class="empty-state-title">No agricultural services found</div>
                <p>Try selecting another category or district.</p>
            </div>
        `;
        return;
    }

    const lang = getCurrentLanguage();
    const categoryIcons = {
        machinery: '🚜 Machinery',
        drone: '🛸 Drone Tech',
        labor: '👥 Farm Labor',
        transport: '🚚 Transport'
    };

    container.innerHTML = services.map(s => `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <div class="card-header">
                    <div>
                        <h3 class="card-title" style="font-size: 1.05rem;">
                            ${lang === 'kn' ? (s.title_kn || s.title_en) : s.title_en}
                        </h3>
                        <span class="badge badge-info" style="margin-top: 0.3rem;">
                            ${categoryIcons[s.category] || s.category}
                        </span>
                    </div>
                </div>

                <div style="font-size: 1.35rem; font-weight: 800; color: #1b5e20; margin-bottom: 0.5rem;">
                    ₹${s.rate_per_unit} <span style="font-size: 0.85rem; font-weight: 400; color: #6b7280;">/ ${s.unit.replace('_', ' ')}</span>
                </div>

                <div style="font-size: 0.9rem; margin-bottom: 0.75rem;">
                    <div style="margin-bottom: 0.25rem;"><strong>Provider:</strong> 👤 ${s.contact_name}</div>
                    <div style="margin-bottom: 0.25rem;"><strong>Location:</strong> 📍 ${s.taluk ? `${s.taluk}, ` : ''}${s.district}</div>
                </div>

                ${s.description ? `
                    <p style="font-size: 0.85rem; color: #4b5563; background: #f9fafb; padding: 0.6rem; border-radius: 6px; margin-bottom: 0.75rem;">
                        ${s.description}
                    </p>
                ` : ''}
            </div>

            <div style="padding-top: 0.75rem; border-top: 1px solid #e5e7eb;">
                <a href="tel:${s.contact_phone}" class="btn btn-primary" style="width: 100%;" title="Call Provider">
                    📞 Call Provider (${s.contact_phone})
                </a>
            </div>
        </div>
    `).join('');
}

async function handleAddService(e) {
    e.preventDefault();
    const form = e.target;

    const payload = {
        category: form.category.value,
        title_en: form.title_en.value.trim(),
        title_kn: form.title_kn.value.trim(),
        description: form.description.value.trim(),
        rate_per_unit: parseFloat(form.rate.value),
        unit: form.unit.value,
        district: form.district.value.trim(),
        taluk: form.taluk.value.trim(),
        contact_name: form.contact_name.value.trim(),
        contact_phone: form.contact_phone.value.trim()
    };

    try {
        await apiFetch('/services', { method: 'POST', body: payload });
        showToast('Service listing posted successfully!', 'success');
        closeModal('add-service-modal');
        form.reset();
        loadServices();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadServices();

    const catSelect = document.getElementById('filter-category');
    if (catSelect) catSelect.addEventListener('change', loadServices);

    const distSelect = document.getElementById('filter-district');
    if (distSelect) distSelect.addEventListener('change', loadServices);

    const addForm = document.getElementById('add-service-form');
    if (addForm) addForm.addEventListener('submit', handleAddService);
});
