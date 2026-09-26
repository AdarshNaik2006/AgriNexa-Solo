/**
 * AgriNexa-Solo: Browser-Native Voice Assistant (Web Speech API)
 * Supports Speech Recognition and Speech Synthesis in English & Kannada
 */

const VoiceAssistant = {
    recognition: null,
    isListening: false,
    synth: window.speechSynthesis || null,

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.log('Web Speech API is not supported in this browser.');
            return false;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceButtonUI(true);
            const promptText = getCurrentLanguage() === 'kn' ? 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... ಮಾತನಾಡಿ' : 'Listening... Speak your query';
            showToast(promptText, 'info', 2500);
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            console.log('Voice recognized:', transcript);
            this.handleVoiceCommand(transcript);
        };

        this.recognition.onerror = (event) => {
            console.warn('Voice recognition error:', event.error);
            this.isListening = false;
            this.updateVoiceButtonUI(false);
            if (event.error !== 'no-speech') {
                showToast(`Voice error: ${event.error}`, 'warning');
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceButtonUI(false);
        };

        return true;
    },

    toggleListening() {
        if (!this.recognition) {
            const ok = this.init();
            if (!ok) {
                const msg = getCurrentLanguage() === 'kn' ? 
                    'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಸೌಲಭ್ಯ ಲಭ್ಯವಿಲ್ಲ (Chrome/Edge ಬಳಸಿ).' : 
                    'Voice recognition is not supported in this browser (Use Chrome or Edge).';
                showToast(msg, 'warning');
                return;
            }
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            const lang = getCurrentLanguage();
            this.recognition.lang = lang === 'kn' ? 'kn-IN' : 'en-IN';
            try {
                this.recognition.start();
            } catch (e) {
                console.error('Recognition start error:', e);
            }
        }
    },

    speak(text, lang = null) {
        if (!this.synth) return;
        this.synth.cancel(); // Cancel any ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);
        const activeLang = lang || getCurrentLanguage();
        utterance.lang = activeLang === 'kn' ? 'kn-IN' : 'en-IN';
        utterance.rate = 0.95;
        this.synth.speak(utterance);
    },

    handleVoiceCommand(transcript) {
        const lang = getCurrentLanguage();
        showToast(`🎙️ "${transcript}"`, 'info', 3000);

        // Command routing
        // 1. Weather
        if (transcript.includes('weather') || transcript.includes('rain') || transcript.includes('ಹವಾಮಾನ') || transcript.includes('ಮಳೆ')) {
            const reply = lang === 'kn' ? 'ಹವಾಮಾನ ಪುಟಕ್ಕೆ ತೆರಳುತ್ತಿದ್ದೇವೆ' : 'Opening weather forecast';
            this.speak(reply);
            setTimeout(() => { window.location.href = '/weather.html'; }, 800);
            return;
        }

        // 2. Mandi / Market
        if (transcript.includes('market') || transcript.includes('mandi') || transcript.includes('price') || transcript.includes('rate') || transcript.includes('ಮಾರುಕಟ್ಟೆ') || transcript.includes('ದರ') || transcript.includes('ಬೆಲೆ')) {
            const reply = lang === 'kn' ? 'ಮಾರುಕಟ್ಟೆ ದರಗಳ ಪುಟಕ್ಕೆ ತೆರಳುತ್ತಿದ್ದೇವೆ' : 'Opening mandi market prices';
            this.speak(reply);
            setTimeout(() => { window.location.href = '/market.html'; }, 800);
            return;
        }

        // 3. Crops
        if (transcript.includes('crop') || transcript.includes('ಬೆಳೆ') || transcript.includes('ಭತ್ತ') || transcript.includes('ರಾಗಿ')) {
            const reply = lang === 'kn' ? 'ಬೆಳೆ ನಿರ್ವಹಣೆ ಪುಟಕ್ಕೆ ತೆರಳುತ್ತಿದ್ದೇವೆ' : 'Opening crop management';
            this.speak(reply);
            setTimeout(() => { window.location.href = '/crops.html'; }, 800);
            return;
        }

        // 4. Disease / Advisory
        if (transcript.includes('disease') || transcript.includes('medicine') || transcript.includes('spray') || transcript.includes('ರೋಗ') || transcript.includes('ಔಷಧ') || transcript.includes('ಬ್ಲಾಸ್ಟ್')) {
            const reply = lang === 'kn' ? 'ಬೆಳೆ ರೋಗ ಸಲಹಾ ಮಾರ್ಗದರ್ಶಿಗೆ ತೆರಳುತ್ತಿದ್ದೇವೆ' : 'Opening disease advisory guide';
            this.speak(reply);
            setTimeout(() => { window.location.href = '/disease.html'; }, 800);
            return;
        }

        // 5. Produce / Buyers
        if (transcript.includes('buyer') || transcript.includes('sell') || transcript.includes('produce') || transcript.includes('ಮಾರಾಟ') || transcript.includes('ಖರೀದಿ')) {
            const reply = lang === 'kn' ? 'ಬೆಳೆ ಮಾರಾಟ ಮಾರುಕಟ್ಟೆಗೆ ತೆರಳುತ್ತಿದ್ದೇವೆ' : 'Opening produce marketplace';
            this.speak(reply);
            setTimeout(() => { window.location.href = '/buyers.html'; }, 800);
            return;
        }

        // 6. Workers / Machinery
        if (transcript.includes('worker') || transcript.includes('tractor') || transcript.includes('drone') || transcript.includes('ಯಂತ್ರ') || transcript.includes('ಕಾರ್ಮಿಕ')) {
            const reply = lang === 'kn' ? 'ಕೃಷಿ ಸೇವೆಗಳು ಮತ್ತು ಯಂತ್ರ ಬಾಡಿಗೆಗೆ ತೆರಳುತ್ತಿದ್ದೇವೆ' : 'Opening agricultural machinery services';
            this.speak(reply);
            setTimeout(() => { window.location.href = '/workers.html'; }, 800);
            return;
        }

        // 7. Societies / RSK
        if (transcript.includes('society') || transcript.includes('rsk') || transcript.includes('kvk') || transcript.includes('ಸಂಪರ್ಕ') || transcript.includes('ಕೇಂದ್ರ') || transcript.includes('ಸಂಘ')) {
            const reply = lang === 'kn' ? 'ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರಗಳ ಪಟ್ಟಿಗೆ ತೆರಳುತ್ತಿದ್ದೇವೆ' : 'Opening nearby agricultural societies';
            this.speak(reply);
            setTimeout(() => { window.location.href = '/societies.html'; }, 800);
            return;
        }

        // 8. Dashboard
        if (transcript.includes('dashboard') || transcript.includes('home') || transcript.includes('ಮುಖಪುಟ')) {
            const reply = lang === 'kn' ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ' : 'Opening farmer dashboard';
            this.speak(reply);
            setTimeout(() => { window.location.href = '/dashboard.html'; }, 800);
            return;
        }

        // Fallback search
        const fallback = lang === 'kn' ? `"${transcript}" ಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಹುಡುಕುತ್ತಿದ್ದೇವೆ` : `Searching for "${transcript}"`;
        this.speak(fallback);
        setTimeout(() => { window.location.href = `/disease.html?search=${encodeURIComponent(transcript)}`; }, 800);
    },

    updateVoiceButtonUI(listening) {
        const btn = document.getElementById('floating-voice-btn');
        if (btn) {
            if (listening) {
                btn.classList.add('listening');
                btn.innerHTML = '🛑';
                btn.title = 'Listening... click to stop';
            } else {
                btn.classList.remove('listening');
                btn.innerHTML = '🎙️';
                btn.title = 'AgriNexa Voice Assistant (Click to Speak)';
            }
        }
    },

    attachFloatingButton() {
        if (document.getElementById('floating-voice-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'floating-voice-btn';
        btn.className = 'floating-voice-btn';
        btn.innerHTML = '🎙️';
        btn.title = 'AgriNexa Voice Assistant (Click to Speak)';
        btn.onclick = () => this.toggleListening();
        document.body.appendChild(btn);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    VoiceAssistant.attachFloatingButton();
});
