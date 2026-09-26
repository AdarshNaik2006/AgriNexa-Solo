/**
 * AgriNexa-Solo: Farmer Profile Controller
 */

async function loadProfile() {
    const user = await requireAuth();
    if (!user) return;

    const form = document.getElementById('profile-form');
    if (!form) return;

    form.full_name.value = user.full_name || '';
    form.phone.value = user.phone || '';
    form.email.value = user.email || '';
    form.district.value = user.district || '';
    form.taluk.value = user.taluk || '';
    form.village.value = user.village || '';
    form.farm_size.value = user.farm_size_acres || 0;
    form.soil_type.value = user.soil_type || '';
    form.preferred_language.value = user.preferred_language || 'en';

    document.getElementById('profile-farmer-name').innerText = user.full_name;
    document.getElementById('profile-farmer-phone').innerText = `📱 ${user.phone} (${user.role.toUpperCase()})`;
}

async function handleProfileSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const payload = {
        full_name: form.full_name.value.trim(),
        email: form.email.value.trim(),
        district: form.district.value.trim(),
        taluk: form.taluk.value.trim(),
        village: form.village.value.trim(),
        farm_size_acres: parseFloat(form.farm_size.value || 0),
        soil_type: form.soil_type.value.trim(),
        preferred_language: form.preferred_language.value
    };

    try {
        const res = await apiFetch('/auth/profile', { method: 'PUT', body: payload });
        showToast('Profile updated successfully!', 'success');
        
        // If preferred language changed, apply it
        if (payload.preferred_language !== getCurrentLanguage()) {
            applyTranslations(payload.preferred_language);
        }
        loadProfile();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    const form = document.getElementById('profile-form');
    if (form) form.addEventListener('submit', handleProfileSubmit);
});
