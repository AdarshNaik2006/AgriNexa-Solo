/**
 * AgriNexa-Solo: Crop Management Controller
 */

let allCrops = [];

async function loadCrops() {
    const user = await requireAuth();
    if (!user) return;

    const listContainer = document.getElementById('crops-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<div class="loading-container"><div class="spinner"></div><p>Loading crops...</p></div>';

    // 1. Fetch Crop Summary
    try {
        const sumRes = await apiFetch('/crops/summary');
        if (sumRes && sumRes.success) {
            const s = sumRes.summary;
            document.getElementById('sum-total-crops').innerText = s.total_crops;
            document.getElementById('sum-active-crops').innerText = s.active_crops_count;
            document.getElementById('sum-total-acres').innerText = `${s.total_active_acres} ac`;
        }
    } catch (e) {
        console.warn('Error loading crop summary:', e);
    }

    // 2. Fetch Crops List
    try {
        const stageFilter = document.getElementById('stage-filter') ? document.getElementById('stage-filter').value : '';
        const url = stageFilter ? `/crops?stage=${encodeURIComponent(stageFilter)}` : '/crops';
        const res = await apiFetch(url);
        
        if (res && res.success) {
            allCrops = res.crops;
            renderCrops(allCrops);
        }
    } catch (err) {
        listContainer.innerHTML = `<div class="notice-box notice-warning">⚠️ Failed to load crops: ${err.message}</div>`;
    }
}

function renderCrops(crops) {
    const listContainer = document.getElementById('crops-list');
    if (!listContainer) return;

    if (!crops || crops.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state card" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">🌾</div>
                <div class="empty-state-title">No crops added yet</div>
                <p>Track your planted crops, cultivation acreage, and harvest dates by clicking "Add New Crop".</p>
                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="openModal('add-crop-modal')">+ Add First Crop</button>
            </div>
        `;
        return;
    }

    const stageBadgeMap = {
        sowing: 'badge-info',
        vegetative: 'badge-success',
        flowering: 'badge-warning',
        harvesting: 'badge-warning',
        completed: 'badge-secondary'
    };

    listContainer.innerHTML = crops.map(c => `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${c.crop_name} ${c.crop_name_kn ? `<span style="font-weight: 400; font-size: 0.95rem; color: #4b5563;">(${c.crop_name_kn})</span>` : ''}</h3>
                        ${c.variety ? `<div style="font-size: 0.8rem; color: #6b7280;">Variety: ${c.variety}</div>` : ''}
                    </div>
                    <span class="badge ${stageBadgeMap[c.stage] || 'badge-info'}">${c.stage}</span>
                </div>

                <div style="font-size: 0.9rem; margin-bottom: 0.75rem;">
                    <div style="margin-bottom: 0.25rem;"><strong>Area:</strong> ${c.area_acres} Acres</div>
                    ${c.sowing_date ? `<div style="margin-bottom: 0.25rem;"><strong>Sown:</strong> ${c.sowing_date}</div>` : ''}
                    ${c.expected_harvest_date ? `<div style="margin-bottom: 0.25rem;"><strong>Harvest Target:</strong> ${c.expected_harvest_date}</div>` : ''}
                    ${c.expected_yield_quintals ? `<div><strong>Expected Yield:</strong> ${c.expected_yield_quintals} Quintals</div>` : ''}
                </div>

                ${c.notes ? `
                    <div style="background: #f9fafb; padding: 0.6rem; border-radius: 6px; font-size: 0.82rem; color: #4b5563; margin-bottom: 1rem;">
                        <strong>Notes:</strong> ${c.notes}
                    </div>
                ` : ''}
            </div>

            <div style="display: flex; gap: 0.5rem; justify-content: flex-end; padding-top: 0.75rem; border-top: 1px solid #e5e7eb;">
                <button class="btn btn-secondary btn-sm" onclick="openEditCrop(${c.id})">✏️ Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCrop(${c.id}, '${c.crop_name}')">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

async function handleAddCrop(e) {
    e.preventDefault();
    const form = e.target;
    
    const payload = {
        crop_name: form.crop_name.value.trim(),
        crop_name_kn: form.crop_name_kn.value.trim(),
        variety: form.variety.value.trim(),
        area_acres: parseFloat(form.area_acres.value),
        sowing_date: form.sowing_date.value || null,
        expected_harvest_date: form.expected_harvest_date.value || null,
        stage: form.stage.value,
        expected_yield_quintals: form.expected_yield.value ? parseFloat(form.expected_yield.value) : null,
        notes: form.notes.value.trim()
    };

    try {
        await apiFetch('/crops', { method: 'POST', body: payload });
        showToast('Crop planting record added successfully!', 'success');
        closeModal('add-crop-modal');
        form.reset();
        loadCrops();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function openEditCrop(cropId) {
    const crop = allCrops.find(c => c.id === cropId);
    if (!crop) return;

    const form = document.getElementById('edit-crop-form');
    if (!form) return;

    form.crop_id.value = crop.id;
    form.crop_name.value = crop.crop_name;
    form.crop_name_kn.value = crop.crop_name_kn || '';
    form.variety.value = crop.variety || '';
    form.area_acres.value = crop.area_acres;
    form.stage.value = crop.stage;
    form.sowing_date.value = crop.sowing_date || '';
    form.expected_harvest_date.value = crop.expected_harvest_date || '';
    form.expected_yield.value = crop.expected_yield_quintals || '';
    form.notes.value = crop.notes || '';

    openModal('edit-crop-modal');
}

async function handleEditCrop(e) {
    e.preventDefault();
    const form = e.target;
    const cropId = form.crop_id.value;

    const payload = {
        crop_name: form.crop_name.value.trim(),
        crop_name_kn: form.crop_name_kn.value.trim(),
        variety: form.variety.value.trim(),
        area_acres: parseFloat(form.area_acres.value),
        stage: form.stage.value,
        sowing_date: form.sowing_date.value || null,
        expected_harvest_date: form.expected_harvest_date.value || null,
        expected_yield_quintals: form.expected_yield.value ? parseFloat(form.expected_yield.value) : null,
        notes: form.notes.value.trim()
    };

    try {
        await apiFetch(`/crops/${cropId}`, { method: 'PUT', body: payload });
        showToast('Crop updated successfully!', 'success');
        closeModal('edit-crop-modal');
        loadCrops();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteCrop(cropId, cropName) {
    if (!confirm(`Are you sure you want to remove '${cropName}' from your active crops?`)) {
        return;
    }

    try {
        await apiFetch(`/crops/${cropId}`, { method: 'DELETE' });
        showToast(`'${cropName}' removed successfully.`, 'info');
        loadCrops();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCrops();
    const addForm = document.getElementById('add-crop-form');
    if (addForm) addForm.addEventListener('submit', handleAddCrop);
    const editForm = document.getElementById('edit-crop-form');
    if (editForm) editForm.addEventListener('submit', handleEditCrop);
    const filterSelect = document.getElementById('stage-filter');
    if (filterSelect) filterSelect.addEventListener('change', loadCrops);
});
