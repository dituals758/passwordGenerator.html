const APP_NAME = "Генератор паролей";

const charSets = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    special: "!@#$%^&*"
};

const SIMILAR_CHARS = "0O1lI|";

const sunSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/>
    <path d="M12 3V5M12 19V21M5 12H3M21 12H19M7.05 7.05L5.64 5.64M18.36 18.36L16.95 16.95M7.05 16.95L5.64 18.36M18.36 5.64L16.95 7.05" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</svg>`;

const moonSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const elements = {
    password: document.getElementById('password'),
    length: document.getElementById('length'),
    lengthValue: document.getElementById('lengthValue'),
    generateBtn: document.getElementById('generateBtn'),
    copyBtn: document.getElementById('copyBtn'),
    notificationArea: document.getElementById('notificationArea'),
    subtitle: document.getElementById('subtitle'),
    themeToggle: document.getElementById('themeToggle'),
    installPWA: document.getElementById('installPWA'),
    footerVersion: document.getElementById('footerVersion'),
    lowercase: document.getElementById('lowercase'),
    uppercase: document.getElementById('uppercase'),
    numbers: document.getElementById('numbers'),
    special: document.getElementById('special'),
    excludeSimilar: document.getElementById('excludeSimilar'),
    excludeRepeating: document.getElementById('excludeRepeating'),
    resetSettingsBtn: document.getElementById('resetSettingsBtn'),
    aboutBtn: document.getElementById('aboutBtn'),
    aboutModal: document.getElementById('aboutModal'),
    closeAboutModal: document.getElementById('closeAboutModal'),
    aboutVersion: document.getElementById('aboutVersion')
};

let notificationTimeout = null;
let deferredPrompt = null;
let isAppInstalled = false;
let touchStartY = 0;
let touchCurrentY = 0;

function initAppVersion() {
    if (elements.footerVersion) {
        elements.footerVersion.textContent = APP_VERSION;
    }
    if (elements.aboutVersion) {
        elements.aboutVersion.textContent = APP_VERSION;
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemTheme;
    applyTheme(theme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeUI(theme);
    try {
        localStorage.setItem('theme', theme);
    } catch (e) {}
}

function updateThemeUI(theme) {
    if (!elements.themeToggle) return;
    const isDark = theme === 'dark';
    const svg = isDark ? sunSvg : moonSvg;
    const tooltipText = isDark ? 'Светлая тема' : 'Тёмная тема';
    elements.themeToggle.innerHTML = svg + '<span class="tooltip" id="themeTooltip">' + tooltipText + '</span>';
    elements.themeToggle.setAttribute('aria-label', isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему');
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}

function loadSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('passwordSettings')) || {};
        if (elements.length) elements.length.value = settings.length || 16;
        if (elements.lowercase) elements.lowercase.checked = settings.lowercase ?? true;
        if (elements.uppercase) elements.uppercase.checked = settings.uppercase ?? true;
        if (elements.numbers) elements.numbers.checked = settings.numbers ?? true;
        if (elements.special) elements.special.checked = settings.special ?? true;
        if (elements.excludeSimilar) elements.excludeSimilar.checked = settings.excludeSimilar || false;
        if (elements.excludeRepeating) elements.excludeRepeating.checked = settings.excludeRepeating || false;
        updateLengthValue();
    } catch (e) {}
}

function saveSettings() {
    const settings = {
        length: elements.length ? parseInt(elements.length.value, 10) : 16,
        lowercase: elements.lowercase?.checked ?? true,
        uppercase: elements.uppercase?.checked ?? true,
        numbers: elements.numbers?.checked ?? true,
        special: elements.special?.checked ?? true,
        excludeSimilar: elements.excludeSimilar?.checked || false,
        excludeRepeating: elements.excludeRepeating?.checked || false
    };
    try {
        localStorage.setItem('passwordSettings', JSON.stringify(settings));
    } catch (e) {}
}

function resetSettingsToDefault() {
    if (elements.length) elements.length.value = 16;
    if (elements.lowercase) elements.lowercase.checked = true;
    if (elements.uppercase) elements.uppercase.checked = true;
    if (elements.numbers) elements.numbers.checked = true;
    if (elements.special) elements.special.checked = true;
    if (elements.excludeSimilar) elements.excludeSimilar.checked = false;
    if (elements.excludeRepeating) elements.excludeRepeating.checked = false;
    updateLengthValue();
    saveSettings();
    generateAndShow();
    showNotification('Настройки сброшены', 'success');
}

function filterCharSet(charSet, excludeSimilar) {
    if (!excludeSimilar) return charSet;
    return [...charSet].filter(c => !SIMILAR_CHARS.includes(c)).join('');
}

function getCharPool() {
    const excludeSimilar = elements.excludeSimilar?.checked || false;
    const pool = [];
    if (elements.lowercase?.checked) {
        const filtered = filterCharSet(charSets.lowercase, excludeSimilar);
        if (filtered.length > 0) pool.push(filtered);
    }
    if (elements.uppercase?.checked) {
        const filtered = filterCharSet(charSets.uppercase, excludeSimilar);
        if (filtered.length > 0) pool.push(filtered);
    }
    if (elements.numbers?.checked) {
        const filtered = filterCharSet(charSets.numbers, excludeSimilar);
        if (filtered.length > 0) pool.push(filtered);
    }
    if (elements.special?.checked) {
        const filtered = filterCharSet(charSets.special, excludeSimilar);
        if (filtered.length > 0) pool.push(filtered);
    }
    return pool;
}

function generatePassword() {
    const length = elements.length ? parseInt(elements.length.value, 10) : 16;
    const excludeRepeating = elements.excludeRepeating?.checked || false;
    const charPool = getCharPool();

    if (charPool.length === 0) {
        showNotification('Выберите хотя бы один тип символов', 'error');
        return '';
    }

    const pool = charPool.join('');
    const selectedSets = charPool;

    try {
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);
        let attempts = 0;
        const maxAttempts = 1000;

        while (attempts < maxAttempts) {
            let password = '';
            let lastChar = '';
            for (let i = 0; i < length; i++) {
                let validChar = false;
                let localAttempts = 0;
                let chosenChar;
                while (!validChar && localAttempts < 20) {
                    const randomIndex = array[i] % pool.length;
                    chosenChar = pool[randomIndex];
                    if (excludeRepeating && chosenChar === lastChar && pool.length > 1) {
                        window.crypto.getRandomValues(array);
                        localAttempts++;
                    } else {
                        validChar = true;
                    }
                }
                password += chosenChar;
                lastChar = chosenChar;
            }

            const hasAllTypes = selectedSets.every(chars => 
                [...password].some(c => chars.includes(c))
            );

            if (hasAllTypes) {
                return password;
            }

            window.crypto.getRandomValues(array);
            attempts++;
        }
        return password;
    } catch {
        let password = '';
        let lastChar = '';
        for (let i = 0; i < length; i++) {
            let validChar = false;
            let localAttempts = 0;
            let chosenChar;
            while (!validChar && localAttempts < 20) {
                chosenChar = pool[Math.floor(Math.random() * pool.length)];
                if (excludeRepeating && chosenChar === lastChar && pool.length > 1) {
                    localAttempts++;
                } else {
                    validChar = true;
                }
            }
            password += chosenChar;
            lastChar = chosenChar;
        }
        return password;
    }
}

function generateAndShow() {
    const password = generatePassword();
    if (!password) return;

    if (elements.password) elements.password.value = password;
    clearNotification();
    updatePasswordStrength();
    saveSettings();
}

async function copyToClipboard() {
    if (!elements.password?.value) {
        showNotification('Сначала создайте пароль', 'error');
        return;
    }

    triggerHapticFeedback();

    try {
        await navigator.clipboard.writeText(elements.password.value);
        showNotification('Пароль скопирован', 'success');
    } catch {
        showNotification('Не удалось скопировать', 'error');
    }
}

async function generateAndCopy() {
    const btn = elements.generateBtn;
    if (!btn) return;

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⌛ Создание...';
    btn.style.opacity = '0.8';

    triggerHapticFeedback();

    try {
        const password = generatePassword();
        if (!password) return;

        if (elements.password) elements.password.value = password;

        await navigator.clipboard.writeText(password);
        showNotification('Пароль создан и скопирован в буфер обмена', 'success');

        updatePasswordStrength();
        saveSettings();
    } catch {
        showNotification('Пароль создан, но не скопирован', 'warning');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
        btn.style.opacity = '';
    }
}

function showNotification(message, type = 'success') {
    clearNotification();

    const area = elements.notificationArea;
    const subtitle = elements.subtitle;
    if (!area || !subtitle) return;

    area.textContent = message;
    area.className = `toast-notification show notification-${type}`;
    subtitle.classList.add('hidden');

    notificationTimeout = setTimeout(clearNotification, 3000);
}

function clearNotification() {
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
    }
    const area = elements.notificationArea;
    const subtitle = elements.subtitle;
    if (area && subtitle) {
        area.className = 'toast-notification';
        area.textContent = '';
        subtitle.classList.remove('hidden');
    }
}

function updateLengthValue() {
    if (elements.length && elements.lengthValue) {
        elements.lengthValue.textContent = elements.length.value;
    }
}

function updatePasswordStrength() {
    if (!elements.password) return;
    const length = elements.length ? parseInt(elements.length.value, 10) : 16;
    const complexity = document.querySelectorAll('.switch input:checked').length;
    const strength = length * complexity;

    let strengthText = '';
    if (strength >= 96) strengthText = 'очень надёжный';
    else if (strength >= 64) strengthText = 'надёжный';
    else if (strength >= 32) strengthText = 'средний';
    else strengthText = 'слабый';

    elements.password.setAttribute('aria-label', 
        `Сгенерированный пароль длиной ${length} символов, ${strengthText} уровень защиты`);
}

function handleSettingChange() {
    generateAndShow();
    clearNotification();
}

function checkPWAInstallStatus() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function initPWAInstall() {
    if (checkPWAInstallStatus()) {
        elements.installPWA?.classList.add('hide');
        return;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        elements.installPWA?.classList.remove('hide');
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        isAppInstalled = true;
        elements.installPWA?.classList.add('hide');
        showNotification('Приложение установлено!', 'success');
    });
}

async function installPWA() {
    if (!deferredPrompt || isAppInstalled) {
        showNotification('Приложение уже установлено', 'warning');
        elements.installPWA?.classList.add('hide');
        return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    deferredPrompt = null;

    if (outcome === 'accepted') {
        isAppInstalled = true;
        elements.installPWA?.classList.add('hide');
    } else {
        showNotification('Установка отменена', 'error');
    }
}

function triggerHapticFeedback() {
    if ('vibrate' in navigator) {
        navigator.vibrate(50);
    }
}

function addPasswordVisibilityToggle() {
    const passwordField = elements.password;
    if (!passwordField?.parentNode) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'visibility-toggle';
    toggleBtn.type = 'button';

    const eyeClosedSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;

    const eyeOpenSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="1.8" fill="none"/>
    </svg>`;

    const savedVisible = localStorage.getItem('passwordVisible') === 'true';
    const initialSvg = savedVisible ? eyeOpenSvg : eyeClosedSvg;
    const initialLabel = savedVisible ? 'Скрыть пароль' : 'Показать пароль';
    toggleBtn.innerHTML = initialSvg + '<span class="tooltip">' + initialLabel + '</span>';
    toggleBtn.setAttribute('aria-label', initialLabel);
    if (savedVisible) {
        passwordField.type = 'text';
    }

    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordField.type === 'password';
        passwordField.type = isPassword ? 'text' : 'password';
        const newLabel = isPassword ? 'Скрыть пароль' : 'Показать пароль';
        toggleBtn.innerHTML = (isPassword ? eyeClosedSvg : eyeOpenSvg) + '<span class="tooltip">' + newLabel + '</span>';
        toggleBtn.setAttribute('aria-label', newLabel);
        try {
            localStorage.setItem('passwordVisible', String(!isPassword));
        } catch (e) {}
        triggerHapticFeedback();
    });

    passwordField.parentNode.appendChild(toggleBtn);
}

function initServiceWorker() {
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration failed:', err));
    }
}

// Закрытие модального окна по свайпу вниз (iOS-style)
function initModalSwipe() {
    const modal = elements.aboutModal;
    const content = modal?.querySelector('.modal-content');
    if (!content) return;

    content.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    content.addEventListener('touchmove', (e) => {
        touchCurrentY = e.touches[0].clientY;
        const diff = touchCurrentY - touchStartY;
        if (diff > 0) {
            e.preventDefault();
            content.style.transform = `translateY(${diff}px) scale(0.9)`;
        }
    }, { passive: false });

    content.addEventListener('touchend', () => {
        const diff = touchCurrentY - touchStartY;
        if (diff > 100) {
            modal.classList.remove('show');
        }
        content.style.transform = '';
        touchStartY = 0;
        touchCurrentY = 0;
    });
}

function initAboutModal() {
    elements.aboutBtn?.addEventListener('click', () => {
        elements.aboutModal.classList.add('show');
    });
    elements.closeAboutModal?.addEventListener('click', () => {
        elements.aboutModal.classList.remove('show');
    });
    window.addEventListener('click', (e) => {
        if (e.target === elements.aboutModal) {
            elements.aboutModal.classList.remove('show');
        }
    });
    initModalSwipe();
}

function initApp() {
    initAppVersion();
    initTheme();
    loadSettings();
    generateAndShow();
    initPWAInstall();
    initServiceWorker();
    addPasswordVisibilityToggle();
    initAboutModal();

    elements.length?.addEventListener('input', () => {
        updateLengthValue();
        handleSettingChange();
    });

    elements.generateBtn?.addEventListener('click', generateAndCopy);
    elements.copyBtn?.addEventListener('click', copyToClipboard);
    elements.themeToggle?.addEventListener('click', toggleTheme);
    elements.installPWA?.addEventListener('click', installPWA);
    elements.resetSettingsBtn?.addEventListener('click', resetSettingsToDefault);

    document.querySelectorAll('.switch input').forEach(input => {
        input.addEventListener('change', handleSettingChange);
    });

    updateLengthValue();
    updatePasswordStrength();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            clearNotification();
            elements.aboutModal.classList.remove('show');
        }
        if (e.key === ' ' && e.target === document.body) {
            e.preventDefault();
            generateAndCopy();
        }
    });

    window.addEventListener('beforeunload', clearNotification);
}

document.addEventListener('DOMContentLoaded', initApp);