const APP_VERSION = "20260215_hotfix3";
const APP_NAME = "Генератор паролей";

const charSets = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    special: "!@#$%^&*"
};

const SIMILAR_CHARS = "0O1lI|";

const sunSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/><path d="M12 2V4M12 20V22M4 12H2M22 12H20M6 6L4 4M20 20L18 18M6 18L4 20M20 4L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const moonSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const elements = {
    password: document.getElementById('password'),
    length: document.getElementById('length'),
    lengthValue: document.getElementById('lengthValue'),
    generateBtn: document.getElementById('generateBtn'),
    copyBtn: document.getElementById('copyBtn'),
    notificationArea: document.getElementById('notificationArea'),
    themeToggle: document.getElementById('themeToggle'),
    installPWA: document.getElementById('installPWA'),
    footerVersion: document.getElementById('footerVersion'),
    lowercase: document.getElementById('lowercase'),
    uppercase: document.getElementById('uppercase'),
    numbers: document.getElementById('numbers'),
    special: document.getElementById('special'),
    excludeSimilar: document.getElementById('excludeSimilar'),
    excludeRepeating: document.getElementById('excludeRepeating'),
    resetSettingsBtn: document.getElementById('resetSettingsBtn')
};

let notificationTimeout = null;
let deferredPrompt = null;
let isAppInstalled = false;

function initAppVersion() {
    if (elements.footerVersion) {
        elements.footerVersion.textContent = APP_VERSION;
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
    localStorage.setItem('theme', theme);
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
    const settings = JSON.parse(localStorage.getItem('passwordSettings')) || {};
    if (elements.length) elements.length.value = settings.length || 16;
    if (elements.lowercase) elements.lowercase.checked = settings.lowercase !== undefined ? settings.lowercase : true;
    if (elements.uppercase) elements.uppercase.checked = settings.uppercase !== undefined ? settings.uppercase : true;
    if (elements.numbers) elements.numbers.checked = settings.numbers !== undefined ? settings.numbers : true;
    if (elements.special) elements.special.checked = settings.special !== undefined ? settings.special : true;
    if (elements.excludeSimilar) elements.excludeSimilar.checked = settings.excludeSimilar || false;
    if (elements.excludeRepeating) elements.excludeRepeating.checked = settings.excludeRepeating || false;
    updateLengthValue();
}

function saveSettings() {
    const settings = {
        length: elements.length ? parseInt(elements.length.value) : 16,
        lowercase: elements.lowercase ? elements.lowercase.checked : true,
        uppercase: elements.uppercase ? elements.uppercase.checked : true,
        numbers: elements.numbers ? elements.numbers.checked : true,
        special: elements.special ? elements.special.checked : true,
        excludeSimilar: elements.excludeSimilar ? elements.excludeSimilar.checked : false,
        excludeRepeating: elements.excludeRepeating ? elements.excludeRepeating.checked : false
    };
    localStorage.setItem('passwordSettings', JSON.stringify(settings));
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
    showNotification('↻ Настройки сброшены', 'success');
}

function filterCharSet(charSet, excludeSimilar) {
    if (!excludeSimilar) return charSet;
    return charSet.split('').filter(c => !SIMILAR_CHARS.includes(c)).join('');
}

function generatePassword() {
    const length = elements.length ? parseInt(elements.length.value) : 16;
    const excludeSimilar = elements.excludeSimilar ? elements.excludeSimilar.checked : false;
    const excludeRepeating = elements.excludeRepeating ? elements.excludeRepeating.checked : false;

    const charPool = [];
    if (elements.lowercase && elements.lowercase.checked) charPool.push(filterCharSet(charSets.lowercase, excludeSimilar));
    if (elements.uppercase && elements.uppercase.checked) charPool.push(filterCharSet(charSets.uppercase, excludeSimilar));
    if (elements.numbers && elements.numbers.checked) charPool.push(filterCharSet(charSets.numbers, excludeSimilar));
    if (elements.special && elements.special.checked) charPool.push(filterCharSet(charSets.special, excludeSimilar));

    if (charPool.length === 0) {
        showNotification('Выберите хотя бы один тип символов', 'error');
        return '';
    }

    try {
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);
        const pool = charPool.join('');
        const selectedSets = charPool;
        let attempts = 0;
        const maxAttempts = 100;
        
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
                password.split('').some(c => chars.includes(c))
            );
            
            if (hasAllTypes) {
                return password;
            }
            
            window.crypto.getRandomValues(array);
            attempts++;
        }
        
        return password;
        
    } catch {
        const pool = charPool.join('');
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
    if (!elements.password || !elements.password.value) {
        showNotification('Сначала создайте пароль', 'error');
        return;
    }
    
    triggerHapticFeedback();
    
    try {
        await navigator.clipboard.writeText(elements.password.value);
        showNotification('Пароль скопирован', 'success');
    } catch (err) {
        console.error('Clipboard API failed:', err);
        showNotification('Не удалось скопировать', 'error');
    }
}

async function generateAndCopy() {
    const generateBtn = elements.generateBtn;
    if (!generateBtn) return;
    
    const originalText = generateBtn.textContent;
    
    generateBtn.disabled = true;
    generateBtn.textContent = '⌛ Создание...';
    generateBtn.style.opacity = '0.8';
    
    triggerHapticFeedback();
    
    try {
        const password = generatePassword();
        if (!password) return;
        
        if (elements.password) elements.password.value = password;
        
        await navigator.clipboard.writeText(password);
        showNotification('Пароль создан и скопирован в буфер обмена', 'success');
        
        updatePasswordStrength();
        saveSettings();
        
    } catch (err) {
        console.error('Ошибка при генерации:', err);
        showNotification('Пароль создан, но не скопирован', 'warning');
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = originalText;
        generateBtn.style.opacity = '';
    }
}

function showNotification(message, type = 'success') {
    clearNotification();
    
    if (!elements.notificationArea) return;
    
    elements.notificationArea.textContent = message;
    elements.notificationArea.className = `toast-notification show notification-${type}`;
    
    notificationTimeout = setTimeout(() => {
        clearNotification();
    }, 3000);
}

function clearNotification() {
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
    }
    if (elements.notificationArea) {
        elements.notificationArea.className = 'toast-notification';
        elements.notificationArea.textContent = '';
    }
}

function updateLengthValue() {
    if (elements.length && elements.lengthValue) {
        const value = elements.length.value;
        elements.lengthValue.textContent = value;
    }
}

function updatePasswordStrength() {
    if (!elements.password) return;
    const length = elements.length ? parseInt(elements.length.value) : 16;
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
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true;
}

function initPWAInstall() {
    if (checkPWAInstallStatus()) {
        if (elements.installPWA) elements.installPWA.classList.add('hide');
        return;
    }
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (elements.installPWA) elements.installPWA.classList.remove('hide');
    });
    
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        isAppInstalled = true;
        if (elements.installPWA) elements.installPWA.classList.add('hide');
        showNotification('✅ Приложение установлено!', 'success');
    });
}

async function installPWA() {
    if (!deferredPrompt || isAppInstalled) {
        showNotification('ℹ️ Приложение уже установлено', 'warning');
        if (elements.installPWA) elements.installPWA.classList.add('hide');
        return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    deferredPrompt = null;
    
    if (outcome === 'accepted') {
        isAppInstalled = true;
        if (elements.installPWA) elements.installPWA.classList.add('hide');
    } else {
        showNotification('❌ Установка отменена', 'error');
    }
}

function triggerHapticFeedback() {
    if ('vibrate' in navigator) {
        navigator.vibrate(50);
    }
}

function addPasswordVisibilityToggle() {
    if (!elements.password || !elements.password.parentNode) return;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'visibility-toggle';
    toggleBtn.setAttribute('type', 'button');
    
    const eyeClosedSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M12 5C19 5 22 12 22 12C22 12 20.5 15 17 17M8 8C4 10 2 12 2 12C2 12 5 19 12 19C14 19 16 18 18 16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`;
    
    const eyeOpenSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
        <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" stroke-width="2" fill="none"/>
    </svg>`;
    
    toggleBtn.innerHTML = eyeClosedSvg + '<span class="tooltip">Скрыть пароль</span>';
    toggleBtn.setAttribute('aria-label', 'Скрыть пароль');
    
    toggleBtn.addEventListener('click', () => {
        const isPassword = elements.password.type === 'password';
        elements.password.type = isPassword ? 'text' : 'password';
        const newLabel = isPassword ? 'Скрыть пароль' : 'Показать пароль';
        toggleBtn.innerHTML = (isPassword ? eyeClosedSvg : eyeOpenSvg) + '<span class="tooltip">' + newLabel + '</span>';
        toggleBtn.setAttribute('aria-label', newLabel);
        triggerHapticFeedback();
    });
    
    elements.password.parentNode.appendChild(toggleBtn);
}

function initServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker зарегистрирован:', registration.scope);
                
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showNotification('🔄 Доступно обновление приложения', 'warning');
                        }
                    });
                });
            })
            .catch(err => {
                console.log('ServiceWorker регистрация не удалась:', err);
            });
    }
}

function initApp() {
    initAppVersion();
    initTheme();
    loadSettings();
    generateAndShow();
    initPWAInstall();
    initServiceWorker();
    addPasswordVisibilityToggle();
    
    if (elements.length) {
        elements.length.addEventListener('input', () => {
            updateLengthValue();
            handleSettingChange();
        });
    }
    
    if (elements.generateBtn) elements.generateBtn.addEventListener('click', generateAndCopy);
    if (elements.copyBtn) elements.copyBtn.addEventListener('click', copyToClipboard);
    if (elements.themeToggle) elements.themeToggle.addEventListener('click', toggleTheme);
    if (elements.installPWA) elements.installPWA.addEventListener('click', installPWA);
    if (elements.resetSettingsBtn) elements.resetSettingsBtn.addEventListener('click', resetSettingsToDefault);
    
    document.querySelectorAll('.switch input').forEach(switchInput => {
        switchInput.addEventListener('change', handleSettingChange);
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
        }
        if (e.key === ' ' && e.target === document.body) {
            e.preventDefault();
            generateAndCopy();
        }
    });
    
    window.addEventListener('beforeunload', () => {
        clearNotification();
    });
}

document.addEventListener('DOMContentLoaded', initApp);