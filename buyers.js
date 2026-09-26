/**
 * AgriNexa-Solo: Produce Marketplace Browser for Buyers & Traders
 */

let selectedListing = null;

async function loadProduceListings() {
    const container = document.getElementById('produce-grid');
    if (!container) return;

    container.innerHTML = '<div class="loading-container" style="grid-column: 1 / -1;"><div class="spinner"></div><p>Loading available farm produce...</p></div>';

    const cropVal = document.getElementById('filter-crop') ? document.getElementById('filter-crop').value.trim() : '';
    const distVal = document.getElementById('filter-district') ? document.getElementById('filter-district').value.trim() : '';
    const maxPriceVal = document.getElementById('filter-max-price') ? document.getElementById('filter-max-price').value.trim() : '';

    const params = new URLSearchParams();
    if (cropVal) params.append('crop', cropVal);
    if (distVal) params.append('district', distVal);
    if (maxPriceVal) params.append('max_price', maxPriceVal);
    params.append('status', 'available');

    try {
        const res = await apiFetch(`/marketplace/listings?${params.toString()}`);
        if (res && res.success) {
            renderProduceListings(res.listings);
        }
    } catch (err) {
        container.innerHTML = `<div class="notice-box notice-warning" style="grid-column: 1 / -1;">⚠️ Failed to load produce: ${err.message}</div>`;
    }
}

function renderProduceListings(listings) {
    const container = document.getElementById('produce-grid');
    if (!container) return;

    if (!listings || listings.length === 0) {
        container.innerHTML = `
            <div class="empty-state card" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">📦</div>
                <div class="empty-state-title">No produce listings found</div>
                <p>Try clearing filters or search for another crop.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = listings.map(item => `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${item.crop_name}</h3>
                        ${item.variety ? `<div style="font-size: 0.8rem; color: #6b7280;">${item.variety}</div>` : ''}
                    </div>
                    <span class="badge badge-success">Available</span>
                </div>

                <div style="font-size: 1.4rem; font-weight: 800; color: #1b5e20; margin-bottom: 0.5rem;">
                    ₹${item.expected_price_per_quintal} <span style="font-size: 0.85rem; font-weight: 400; color: #6b7280;">/ Quintal</span>
                </div>

                <div style="font-size: 0.9rem; margin-bottom: 0.75rem;">
                    <div style="margin-bottom: 0.25rem;"><strong>Quantity:</strong> ${item.quantity_quintals} Quintals</div>
                    <div style="margin-bottom: 0.25rem;"><strong>Farmer:</strong> 👨‍🌾 ${item.farmer_name}</div>
                    <div style="margin-bottom: 0.25rem;"><strong>Location:</strong> 📍 ${item.village ? `${item.village}, ` : ''}${item.taluk ? `${item.taluk}, ` : ''}${item.district}</div>
                    ${item.harvest_date ? `<div style="margin-bottom: 0.25rem;"><strong>Harvest Date:</strong> ${item.harvest_date}</div>` : ''}
                </div>

                ${item.description ? `
                    <p style="font-size: 0.85rem; color: #4b5563; background: #f9fafb; padding: 0.6rem; border-radius: 6px; margin-bottom: 0.75rem;">
                        ${item.description}
                    </p>
                ` : ''}
            </div>

            <div style="display: flex; gap: 0.5rem; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid #e5e7eb;">
                <a href="tel:${item.contact_phone}" class="btn btn-secondary btn-sm" title="Call Farmer">
                    📞 ${item.contact_phone}
                </a>
                <button class="btn btn-primary btn-sm" onclick="openInquiryModal(${item.id}, '${item.crop_name}', '${item.farmer_name}')">
                    💬 Send Inquiry
                </button>
            </div>
        </div>
    `).join('');
}

function openInquiryModal(listingId, cropName, farmerName) {
    selectedListing = { id: listingId, cropName, farmerName };
    const form = document.getElementById('inquiry-form');
    if (!form) return;

    form.listing_id.value = listingId;
    document.getElementById('inquiry-target-title').innerText = `${cropName} (Farmer: ${farmerName})`;

    // Pre-fill user name and phone if logged in
    if (currentUser) {
        form.sender_name.value = currentUser.full_name || '';
        form.sender_phone.value = currentUser.phone || '';
    }

    openModal('inquiry-modal');
}

async function handleSendInquiry(e) {
    e.preventDefault();
    const form = e.target;

    const payload = {
        listing_id: parseInt(form.listing_id.value),
        sender_name: form.sender_name.value.trim(),
        sender_phone: form.sender_phone.value.trim(),
        message: form.message.value.trim()
    };

    try {
        await apiFetch('/marketplace/inquire', { method: 'POST', body: payload });
        showToast('Your purchase inquiry has been sent to the farmer!', 'success');
        closeModal('inquiry-modal');
        form.reset();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProduceListings();

    const form = document.getElementById('inquiry-form');
    if (form) form.addEventListener('submit', handleSendInquiry);

    const filterBtn = document.getElementById('apply-filter-btn');
    if (filterBtn) filterBtn.addEventListener('click', loadProduceListings);
});
