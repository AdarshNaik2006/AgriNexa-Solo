/**
 * AgriNexa-Solo: Farmer's Own Produce Listing Management
 */

let myProduceListings = [];

async function loadMyListings() {
    const user = await requireAuth();
    if (!user) return;

    const container = document.getElementById('my-produce-list');
    if (!container) return;

    container.innerHTML = '<div class="loading-container"><div class="spinner"></div><p>Loading your produce listings...</p></div>';

    try {
        const res = await apiFetch('/marketplace/my-listings');
        if (res && res.success) {
            myProduceListings = res.listings;
            renderMyListings(myProduceListings);
        }
    } catch (err) {
        container.innerHTML = `<div class="notice-box notice-warning">⚠️ Failed to load your listings: ${err.message}</div>`;
    }
}

function renderMyListings(listings) {
    const container = document.getElementById('my-produce-list');
    if (!container) return;

    if (!listings || listings.length === 0) {
        container.innerHTML = `
            <div class="empty-state card" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">🌾</div>
                <div class="empty-state-title">No produce listed for sale yet</div>
                <p>List your harvested crops or upcoming yield directly to buyers and traders without middleman cuts.</p>
                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="openModal('add-produce-modal')">+ Post Produce for Sale</button>
            </div>
        `;
        return;
    }

    const statusBadge = {
        available: 'badge-success',
        booked: 'badge-warning',
        sold: 'badge-danger'
    };

    container.innerHTML = listings.map(item => `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${item.crop_name}</h3>
                        ${item.variety ? `<div style="font-size: 0.8rem; color: #6b7280;">${item.variety}</div>` : ''}
                    </div>
                    <span class="badge ${statusBadge[item.status] || 'badge-info'}">${item.status}</span>
                </div>

                <div style="font-size: 1.4rem; font-weight: 800; color: #1b5e20; margin-bottom: 0.5rem;">
                    ₹${item.expected_price_per_quintal} <span style="font-size: 0.85rem; font-weight: 400; color: #6b7280;">/ Quintal</span>
                </div>

                <div style="font-size: 0.9rem; margin-bottom: 0.75rem;">
                    <div style="margin-bottom: 0.25rem;"><strong>Quantity:</strong> ${item.quantity_quintals} Quintals</div>
                    <div style="margin-bottom: 0.25rem;"><strong>Contact:</strong> 📞 ${item.contact_phone}</div>
                    <div style="margin-bottom: 0.25rem;"><strong>Location:</strong> 📍 ${item.district}</div>
                    ${item.harvest_date ? `<div style="margin-bottom: 0.25rem;"><strong>Harvest Date:</strong> ${item.harvest_date}</div>` : ''}
                </div>

                <div style="background: #e8f5e9; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.85rem; color: #1b5e20; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <span>💬 Buyer Inquiries</span>
                    <strong style="font-size: 1rem;">${item.inquiry_count || 0}</strong>
                </div>

                ${item.description ? `
                    <p style="font-size: 0.82rem; color: #4b5563; background: #f9fafb; padding: 0.5rem; border-radius: 6px;">
                        ${item.description}
                    </p>
                ` : ''}
            </div>

            <div style="display: flex; gap: 0.5rem; justify-content: flex-end; padding-top: 0.75rem; border-top: 1px solid #e5e7eb;">
                <button class="btn btn-secondary btn-sm" onclick="openEditProduce(${item.id})">✏️ Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduce(${item.id}, '${item.crop_name}')">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

async function handleAddProduce(e) {
    e.preventDefault();
    const form = e.target;

    const payload = {
        crop_name: form.crop_name.value.trim(),
        variety: form.variety.value.trim(),
        quantity_quintals: parseFloat(form.quantity.value),
        expected_price_per_quintal: parseFloat(form.price.value),
        district: form.district.value.trim(),
        taluk: form.taluk.value.trim(),
        village: form.village.value.trim(),
        contact_phone: form.contact_phone.value.trim(),
        harvest_date: form.harvest_date.value || null,
        description: form.description.value.trim()
    };

    try {
        await apiFetch('/marketplace/listings', { method: 'POST', body: payload });
        showToast('Produce listed for sale successfully!', 'success');
        closeModal('add-produce-modal');
        form.reset();
        loadMyListings();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function openEditProduce(listingId) {
    const item = myProduceListings.find(l => l.id === listingId);
    if (!item) return;

    const form = document.getElementById('edit-produce-form');
    if (!form) return;

    form.listing_id.value = item.id;
    form.crop_name.value = item.crop_name;
    form.variety.value = item.variety || '';
    form.quantity.value = item.quantity_quintals;
    form.price.value = item.expected_price_per_quintal;
    form.status.value = item.status;
    form.district.value = item.district;
    form.contact_phone.value = item.contact_phone;
    form.harvest_date.value = item.harvest_date || '';
    form.description.value = item.description || '';

    openModal('edit-produce-modal');
}

async function handleEditProduce(e) {
    e.preventDefault();
    const form = e.target;
    const listingId = form.listing_id.value;

    const payload = {
        crop_name: form.crop_name.value.trim(),
        variety: form.variety.value.trim(),
        quantity_quintals: parseFloat(form.quantity.value),
        expected_price_per_quintal: parseFloat(form.price.value),
        status: form.status.value,
        district: form.district.value.trim(),
        contact_phone: form.contact_phone.value.trim(),
        harvest_date: form.harvest_date.value || null,
        description: form.description.value.trim()
    };

    try {
        await apiFetch(`/marketplace/listings/${listingId}`, { method: 'PUT', body: payload });
        showToast('Produce listing updated successfully!', 'success');
        closeModal('edit-produce-modal');
        loadMyListings();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteProduce(listingId, cropName) {
    if (!confirm(`Are you sure you want to delete your listing for '${cropName}'?`)) {
        return;
    }

    try {
        await apiFetch(`/marketplace/listings/${listingId}`, { method: 'DELETE' });
        showToast(`'${cropName}' listing deleted.`, 'info');
        loadMyListings();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadMyListings();
    const addForm = document.getElementById('add-produce-form');
    if (addForm) addForm.addEventListener('submit', handleAddProduce);
    const editForm = document.getElementById('edit-produce-form');
    if (editForm) editForm.addEventListener('submit', handleEditProduce);
});
