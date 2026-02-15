const APP_VERSION = "20260215";
const APP_NAME = "Генератор паролей";

const charSets = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    special: "!@#$%^&*"
};

const elements = {
    password: document.getElementById('password'),
    length: document.getElementById('length'),
    lengthValue: document.getElementById('lengthValue'),
    generateBtn: document.getElementById('generateBtn'),
    copyBtn: document.getElementById('copyBtn'),
    notificationArea: document.getElementById('notificationArea'),
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    themeText: document.getElementById('themeText'),
    installPWA: document.getElementById('installPWA'),
    footerVersion: document.getElementById('footerVersion'),
    lengthIndicator: document.getElementById('lengthIndicator')
};

let notificationTimeout = null;
let deferredPrompt = null;
let isAppInstalled = false;

function initAppVersion() {
    elements.footerVersion.textContent = APP_VERSION;
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
    const isDark = theme === 'dark';
    elements.themeIcon.textContent = isDark ? '☀️' : '🌙';
    elements.themeText.textContent = isDark ? 'Светлая' : 'Темная';
    elements.themeToggle.setAttribute('aria-label', 
        isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему');
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}

function generatePassword() {
    const length = parseInt(elements.length.value);
    const charPool = [];
    
    if (document.getElementById('lowercase').checked) charPool.push(charSets.lowercase);
    if (document.getElementById('uppercase').checked) charPool.push(charSets.uppercase);
    if (document.getElementById('numbers').checked) charPool.push(charSets.numbers);
    if (document.getElementById('special').checked) charPool.push(charSets.special);

    if (charPool.length === 0) {
        showNotification('⚠️ Выберите хотя бы один тип символов', 'error');
        return '';
    }

    try {
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);
        const pool = charPool.join('');
        const selectedSets = charPool;
        let password = '';
        let attempts = 0;
        const maxAttempts = 100;
        
        while (attempts < maxAttempts) {
            password = '';
            for (let i = 0; i < length; i++) {
                password += pool[array[i] % pool.length];
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
        for (let i = 0; i < length; i++) {
            password += pool[Math.floor(Math.random() * pool.length)];
        }
        return password;
    }
}

function generateAndShow() {
    const password = generatePassword();
    if (!password) return;
    
    elements.password.value = password;
    clearNotification();
    updatePasswordStrength();
}

async function copyToClipboard() {
    if (!elements.password.value) {
        showNotification('⚠️ Сначала создайте пароль', 'error');
        return;
    }
    
    triggerHapticFeedback();
    
    try {
        await navigator.clipboard.writeText(elements.password.value);
        showNotification('✅ Пароль создан и скопирован в буфер обмена', 'success');
    } catch (err) {
        console.error('Clipboard API failed:', err);
        showNotification('❌ Не удалось скопировать', 'error');
    }
}

async function generateAndCopy() {
    const generateBtn = elements.generateBtn;
    const originalText = generateBtn.textContent;
    
    generateBtn.disabled = true;
    generateBtn.textContent = '⌛ Создание...';
    generateBtn.style.opacity = '0.8';
    
    triggerHapticFeedback();
    
    try {
        const password = generatePassword();
        if (!password) return;
        
        elements.password.value = password;
        
        await navigator.clipboard.writeText(password);
        // No background color change
        showNotification('✅ Пароль создан и скопирован в буфер обмена', 'success');
        
        updatePasswordStrength();
        
    } catch (err) {
        console.error('Ошибка при генерации:', err);
        showNotification('⚠️ Пароль создан, но не скопирован в буфер обмена', 'warning');
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = originalText;
        generateBtn.style.opacity = '';
    }
}

function showNotification(message, type = 'success') {
    clearNotification();
    
    elements.notificationArea.textContent = message;
    elements.notificationArea.className = `notification-area show notification-${type}`;
    
    notificationTimeout = setTimeout(() => {
        clearNotification();
    }, 3000);
}

function clearNotification() {
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
    }
    elements.notificationArea.className = 'notification-area';
    elements.notificationArea.textContent = '';
}

function updateLengthValue() {
    const value = elements.length.value;
    elements.lengthValue.textContent = value;
    updateLengthIndicator();
}

function updateLengthIndicator() {
    const value = parseInt(elements.length.value);
    if (elements.lengthIndicator) {
        elements.lengthIndicator.querySelectorAll('span').forEach(span => {
            const length = parseInt(span.dataset.length);
            span.classList.toggle('active', value >= length);
        });
    }
}

function updatePasswordStrength() {
    const length = parseInt(elements.length.value);
    const complexity = document.querySelectorAll('.switch input:checked').length;
    const strength = length * complexity;
    
    let strengthText = '';
    if (strength >= 96) strengthText = 'очень надежный';
    else if (strength >= 64) strengthText = 'надежный';
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
        elements.installPWA.classList.remove('show');
        return;
    }
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        elements.installPWA.classList.add('show');
    });
    
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        isAppInstalled = true;
        elements.installPWA.classList.remove('show');
        showNotification('✅ Приложение установлено!', 'success');
    });
}

async function installPWA() {
    if (!deferredPrompt || isAppInstalled) {
        showNotification('ℹ️ Приложение уже установлено', 'warning');
        elements.installPWA.classList.remove('show');
        return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    deferredPrompt = null;
    
    if (outcome === 'accepted') {
        isAppInstalled = true;
        elements.installPWA.classList.remove('show');
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
    generateAndShow();
    initPWAInstall();
    initServiceWorker();
    addPasswordVisibilityToggle();
    
    elements.length.addEventListener('input', () => {
        updateLengthValue();
        handleSettingChange();
    });
    
    elements.generateBtn.addEventListener('click', generateAndCopy);
    elements.copyBtn.addEventListener('click', copyToClipboard);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.installPWA.addEventListener('click', installPWA);
    
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