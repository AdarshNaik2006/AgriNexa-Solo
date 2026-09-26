/**
 * AgriNexa-Solo: Bilingual Localization Engine (English & Kannada)
 */

const TRANSLATIONS = {
    en: {
        app_name: "AgriNexa-Solo",
        tagline: "Smart Agriculture Platform for Farmers",
        
        // Navigation
        nav_home: "Home",
        nav_dashboard: "Dashboard",
        nav_crops: "My Crops",
        nav_weather: "Weather",
        nav_market: "Mandi Prices",
        nav_buyers: "Produce Hub",
        nav_marketplace: "My Produce",
        nav_inquiries: "Inquiries",
        nav_workers: "Agri Services",
        nav_societies: "RSK / Societies",
        nav_disease: "Disease Guide",
        nav_advisory: "Advisory",
        nav_profile: "Profile",
        nav_login: "Login",
        nav_register: "Register",
        nav_logout: "Logout",

        // Common Actions & Labels
        btn_save: "Save Changes",
        btn_submit: "Submit",
        btn_cancel: "Cancel",
        btn_close: "Close",
        btn_edit: "Edit",
        btn_delete: "Delete",
        btn_view: "View Details",
        btn_add: "Add New",
        btn_search: "Search",
        btn_filter: "Filter",
        btn_clear: "Clear",
        btn_use_location: "Use My Location",
        loading: "Loading information...",
        no_data: "No records found.",
        demo_notice: "NOTICE: REFERENCE / DEMO DATA (Not live commercial spot rates)",

        // Dashboard
        dash_welcome: "Welcome back",
        dash_weather_title: "Today's Farm Weather",
        dash_crops_title: "Active Crops Overview",
        dash_market_title: "Mandi Price Benchmark",
        dash_quick_actions: "Quick Actions",
        dash_advisory_title: "Agricultural Advisories",
        stat_active_crops: "Active Crops",
        stat_total_acres: "Total Cultivated Acres",
        stat_my_listings: "Produce Listings",
        stat_inquiries: "Received Inquiries",

        // Forms
        lbl_phone: "Phone Number (10 Digits)",
        lbl_password: "Password (Min 6 characters)",
        lbl_full_name: "Full Name",
        lbl_role: "Account Role",
        lbl_district: "District",
        lbl_taluk: "Taluk",
        lbl_village: "Village",
        lbl_farm_size: "Farm Size (in Acres)",
        lbl_soil_type: "Soil Type",
        lbl_pref_lang: "Preferred Language",

        // Crops
        crop_title: "Crop Management & Harvest Tracker",
        crop_name: "Crop Name",
        crop_variety: "Variety",
        crop_area: "Cultivation Area (Acres)",
        crop_sowing_date: "Sowing Date",
        crop_harvest_date: "Expected Harvest Date",
        crop_stage: "Growth Stage",
        crop_expected_yield: "Expected Yield (Quintals)",
        crop_notes: "Field Notes & Observations",

        // Weather
        weather_title: "Agricultural Weather & Smart Advisories",
        weather_temp: "Temperature",
        weather_humidity: "Humidity",
        weather_wind: "Wind Speed",
        weather_rain_chance: "Rain Probability",
        spraying_advisory: "Spraying Feasibility",
        irrigation_advisory: "Smart Irrigation Guidance",

        // Mandi
        mandi_title: "Karnataka APMC Mandi Price Tracker",
        commodity: "Commodity",
        market_yard: "APMC Market Yard",
        modal_price: "Modal Rate (₹/Q)",
        min_price: "Min Rate",
        max_price: "Max Rate",
        trend: "Price Trend",

        // Produce & Buyers
        buyers_title: "Farmer Produce Marketplace",
        post_produce: "Post Produce for Sale",
        quantity_q: "Quantity (Quintals)",
        price_per_q: "Expected Price (₹/Quintal)",
        contact_seller: "Send Buyer Inquiry",
        inbox_title: "Produce Inquiries Received",

        // Voice Assistant
        voice_title: "AgriNexa Voice Assistant",
        voice_prompt: "Speak your agricultural query (e.g., 'Weather today', 'Ragi mandi price', 'Crop disease')",
        voice_listening: "Listening... Speak now",
        voice_not_supported: "Voice recognition is not supported in this browser."
    },

    kn: {
        app_name: "ಅಗ್ರಿನೆಕ್ಸಾ-ಸೋಲೋ",
        tagline: "ರೈತರಿಗಾಗಿ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಡಿಜಿಟಲ್ ವೇದಿಕೆ",

        // Navigation
        nav_home: "ಮುಖಪುಟ",
        nav_dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        nav_crops: "ನನ್ನ ಬೆಳೆಗಳು",
        nav_weather: "ಹವಾಮಾನ",
        nav_market: "ಮಾರುಕಟ್ಟೆ ದರ",
        nav_buyers: "ಬೆಳೆ ಮಾರುಕಟ್ಟೆ",
        nav_marketplace: "ನನ್ನ ಮಾರಾಟ",
        nav_inquiries: "ವಿಚಾರಣೆಗಳು",
        nav_workers: "ಕೃಷಿ ಸೇವೆಗಳು",
        nav_societies: "ಆರ್‌ಎಸ್‌ಕೆ / ಸಂಘಗಳು",
        nav_disease: "ಬೆಳೆ ರೋಗ ಮಾಹಿತಿ",
        nav_advisory: "ಕೃಷಿ ಸಲಹೆ",
        nav_profile: "ನನ್ನ ಪ್ರೊಫೈಲ್",
        nav_login: "ಲಾಗಿನ್",
        nav_register: "ನೋಂದಣಿ",
        nav_logout: "ಲಾಗೌಟ್",

        // Common Actions & Labels
        btn_save: "ಬದಲಾವಣೆ ಉಳಿಸಿ",
        btn_submit: "ಸಲ್ಲಿಸಿ",
        btn_cancel: "ರದ್ದುಮಾಡಿ",
        btn_close: "ಮುಚ್ಚಿ",
        btn_edit: "ತಿದ್ದುಪಡಿ",
        btn_delete: "ಅಳಿಸಿ",
        btn_view: "ವಿವರ ನೋಡಿ",
        btn_add: "ಹೊಸ ಸೇರ್ಪಡೆ",
        btn_search: "ಹುಡುಕಿ",
        btn_filter: "ಫಿಲ್ಟರ್",
        btn_clear: "ತೆರವುಗೊಳಿಸಿ",
        btn_use_location: "ನನ್ನ ಸ್ಥಳ ಬಳಸಿ",
        loading: "ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        no_data: "ಯಾವುದೇ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.",
        demo_notice: "ಸೂಚನೆ: ಮಾದರಿ/ಉಲ್ಲೇಖ ದರಗಳು (ಅಧಿಕೃತ ಲೈವ್ ಮಾರುಕಟ್ಟೆ ದರಗಳಲ್ಲ)",

        // Dashboard
        dash_welcome: "ಸ್ವಾಗತ",
        dash_weather_title: "ಇಂದಿನ ಜಮೀನಿನ ಹವಾಮಾನ",
        dash_crops_title: "ಹಾಲಿ ಬೆಳೆಗಳ ವಿವರ",
        dash_market_title: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಮುನ್ನೋಟ",
        dash_quick_actions: "ತ್ವರಿತ ಸೇವೆಗಳು",
        dash_advisory_title: "ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆಗಳು",
        stat_active_crops: "ಹಾಲಿ ಬೆಳೆಗಳು",
        stat_total_acres: "ಒಟ್ಟು ಕೃಷಿ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)",
        stat_my_listings: "ಮಾರಾಟದ ಪಟ್ಟಿಗಳು",
        stat_inquiries: "ಬಂದ ವಿಚಾರಣೆಗಳು",

        // Forms
        lbl_phone: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (೧೦ ಅಂಕಿಗಳು)",
        lbl_password: "ಪಾಸ್‌ವರ್ಡ್ (ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳು)",
        lbl_full_name: "ಪೂರ್ಣ ಹೆಸರು",
        lbl_role: "ಖಾತೆ ವಿಧ",
        lbl_district: "ಜಿಲ್ಲೆ",
        lbl_taluk: "ತಾಲೂಕು",
        lbl_village: "ಗ್ರಾಮ",
        lbl_farm_size: "ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)",
        lbl_soil_type: "ಮಣ್ಣಿನ ವಿಧ",
        lbl_pref_lang: "ಆದ್ಯತೆಯ ಭಾಷೆ",

        // Crops
        crop_title: "ಬೆಳೆ ನಿರ್ವಹಣೆ ಮತ್ತು ಕೊಯ್ಲು ಟ್ರ್ಯಾಕರ್",
        crop_name: "ಬೆಳೆಯ ಹೆಸರು",
        crop_variety: "ತಳಿ",
        crop_area: "ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)",
        crop_sowing_date: "ಬಿತ್ತನೆ ದಿನಾಂಕ",
        crop_harvest_date: "ಅಂದಾಜು ಕೊಯ್ಲು ದಿನಾಂಕ",
        crop_stage: "ಬೆಳವಣಿಗೆಯ ಹಂತ",
        crop_expected_yield: "ನಿರೀಕ್ಷಿತ ಇಳುವರಿ (ಕ್ವಿಂಟಾಲ್)",
        crop_notes: "ಜಮೀನಿನ ಟಿಪ್ಪಣಿಗಳು",

        // Weather
        weather_title: "ಕೃಷಿ ಹವಾಮಾನ ಮತ್ತು ಸ್ಮಾರ್ಟ್ ಸಲಹೆಗಳು",
        weather_temp: "ತಾಪಮಾನ",
        weather_humidity: "ತೇವಾಂಶ",
        weather_wind: "ಗಾಳಿಯ ವೇಗ",
        weather_rain_chance: "ಮಳೆಯ ಸಂಭವನೀಯತೆ",
        spraying_advisory: "ಔಷಧ ಸಿಂಪಡಣೆ ಸಲಹೆ",
        irrigation_advisory: "ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ ಮಾರ್ಗದರ್ಶನ",

        // Mandi
        mandi_title: "ಕರ್ನಾಟಕ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ ದರಗಳು",
        commodity: "ಕೃಷಿ ಉತ್ಪನ್ನ",
        market_yard: "ಎಪಿಎಂಸಿ ಪ್ರಾಂಗಣ",
        modal_price: "ಸರಾಸರಿ ದರ (ರೂ/ಕ್ವಿಂಟಾಲ್)",
        min_price: "ಕನಿಷ್ಠ ದರ",
        max_price: "ಗರಿಷ್ಠ ದರ",
        trend: "ದರದ ಏರಿಳಿತ",

        // Produce & Buyers
        buyers_title: "ರೈತರ ಉತ್ಪನ್ನ ಮಾರುಕಟ್ಟೆ",
        post_produce: "ಮಾರಾಟಕ್ಕೆ ಬೆಳೆ ಸೇರಿಸಿ",
        quantity_q: "ಪ್ರಮಾಣ (ಕ್ವಿಂಟಾಲ್)",
        price_per_q: "ನಿರೀಕ್ಷಿತ ದರ (ರೂ/ಕ್ವಿಂಟಾಲ್)",
        contact_seller: "ಖರೀದಿ ವಿಚಾರಣೆ ಕಳುಹಿಸಿ",
        inbox_title: "ಬಂದ ಖರೀದಿ ವಿಚಾರಣೆಗಳು",

        // Voice Assistant
        voice_title: "ಅಗ್ರಿನೆಕ್ಸಾ ಧ್ವನಿ ಸಹಾಯಕ",
        voice_prompt: "ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಮಾತನಾಡಿ (ಉದಾ: 'ಇಂದಿನ ಹವಾಮಾನ', 'ರಾಗಿ ಬೆಲೆ', 'ಭತ್ತದ ಬೆಂಕಿ ರೋಗ')",
        voice_listening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... ಈಗ ಮಾತನಾಡಿ",
        voice_not_supported: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ."
    }
};

/**
 * Get currently selected language ('en' or 'kn')
 */
function getCurrentLanguage() {
    return localStorage.getItem('agrinexa_lang') || 'en';
}

/**
 * Get translated text for key
 */
function t(key, defaultText = '') {
    const lang = getCurrentLanguage();
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
        return TRANSLATIONS[lang][key];
    }
    if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
        return TRANSLATIONS['en'][key];
    }
    return defaultText || key;
}

/**
 * Apply translations to DOM elements with data-i18n
 */
function applyTranslations(lang = null) {
    const activeLang = lang || getCurrentLanguage();
    localStorage.setItem('agrinexa_lang', activeLang);

    // Update document lang
    document.documentElement.lang = activeLang;

    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = t(key);
        if (translated) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.getAttribute('placeholder')) {
                    el.placeholder = translated;
                }
            } else {
                el.innerText = translated;
            }
        }
    });

    // Update toggle button text
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
        langBtn.innerHTML = activeLang === 'en' ? '🌐 ಕನ್ನಡ' : '🌐 English';
    }
}

/**
 * Toggle between English and Kannada
 */
function toggleLanguage() {
    const current = getCurrentLanguage();
    const next = current === 'en' ? 'kn' : 'en';
    applyTranslations(next);
}

// Auto apply on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) {
        btn.addEventListener('click', toggleLanguage);
    }
});
