/**
 * AgriNexa-Solo: Farmer Inquiry Inbox Controller
 */

async function loadInquiries() {
    const user = await requireAuth();
    if (!user) return;

    const container = document.getElementById('inquiries-list');
    if (!container) return;

    container.innerHTML = '<div class="loading-container"><div class="spinner"></div><p>Loading buyer inquiries...</p></div>';

    try {
        const res = await apiFetch('/marketplace/my-inquiries');
        if (res && res.success) {
            renderInquiries(res.inquiries);
        }
    } catch (err) {
        container.innerHTML = `<div class="notice-box notice-warning">⚠️ Failed to load inquiries: ${err.message}</div>`;
    }
}

function renderInquiries(inquiries) {
    const container = document.getElementById('inquiries-list');
    if (!container) return;

    if (!inquiries || inquiries.length === 0) {
        container.innerHTML = `
            <div class="empty-state card">
                <div class="empty-state-icon">💬</div>
                <div class="empty-state-title">No buyer inquiries yet</div>
                <p>When buyers or traders submit an inquiry on your produce listings, they will appear here with direct contact details.</p>
                <a href="/marketplace.html" class="btn btn-primary" style="margin-top: 1rem;">View My Produce Listings</a>
            </div>
        `;
        return;
    }

    const statusBadge = {
        pending: 'badge-warning',
        accepted: 'badge-success',
        closed: 'badge-secondary'
    };

    container.innerHTML = inquiries.map(inq => `
        <div class="card" style="margin-bottom: 1rem;">
            <div class="card-header">
                <div>
                    <h3 class="card-title">📦 Produce: ${inq.crop_name || 'Listed Crop'}</h3>
                    <div style="font-size: 0.85rem; color: #6b7280;">Received: ${inq.created_at || 'Recently'}</div>
                </div>
                <span class="badge ${statusBadge[inq.status] || 'badge-info'}">${inq.status}</span>
            </div>

            <div style="margin-bottom: 1rem;">
                <div style="font-size: 1.05rem; font-weight: 700; color: #1f2937;">
                    👤 ${inq.sender_name}
                </div>
                <div style="margin-top: 0.2rem;">
                    <a href="tel:${inq.sender_phone}" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 0.3rem;">
                        📞 Call Buyer: <strong>${inq.sender_phone}</strong>
                    </a>
                </div>
                <div style="background: #f9fafb; padding: 0.85rem; border-radius: 8px; margin-top: 0.75rem; border-left: 3px solid #2e7d32; font-size: 0.95rem; color: #374151;">
                    "${inq.message}"
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; justify-content: flex-end; align-items: center; padding-top: 0.75rem; border-top: 1px solid #e5e7eb;">
                <span style="font-size: 0.85rem; color: #6b7280; margin-right: auto;">Update Status:</span>
                ${inq.status !== 'accepted' ? `
                    <button class="btn btn-success btn-sm" onclick="updateInquiryStatus(${inq.id}, 'accepted')">
                        ✅ Accept Deal
                    </button>
                ` : ''}
                ${inq.status !== 'pending' ? `
                    <button class="btn btn-secondary btn-sm" onclick="updateInquiryStatus(${inq.id}, 'pending')">
                        ⏳ Mark Pending
                    </button>
                ` : ''}
                ${inq.status !== 'closed' ? `
                    <button class="btn btn-danger btn-sm" onclick="updateInquiryStatus(${inq.id}, 'closed')">
                        ✖️ Close
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function updateInquiryStatus(inquiryId, newStatus) {
    try {
        await apiFetch(`/marketplace/inquiries/${inquiryId}/status`, {
            method: 'PUT',
            body: { status: newStatus }
        });
        showToast(`Inquiry marked as '${newStatus}'.`, 'success');
        loadInquiries();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', loadInquiries);
