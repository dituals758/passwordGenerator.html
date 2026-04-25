// script.js
const CHAR_SETS = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    special: "!@#$%^&*"
};
const SIMILAR_CHARS = "0O1lI|";

const elements = {
    password: document.getElementById('password'),
    length: document.getElementById('length'),
    lengthValue: document.getElementById('lengthValue'),
    generateBtn: document.getElementById('generateBtn'),
    copyBtn: document.getElementById('copyBtn'),
    themeToggle: document.getElementById('themeToggle'),
    installPWA: document.getElementById('installPWA'),
    footerVersion: document.getElementById('footerVersion'),
    lowercase: document.getElementById('lowercase'),
    uppercase: document.getElementById('uppercase'),
    numbers: document.getElementById('numbers'),
    special: document.getElementById('special'),
    excludeSimilar: document.getElementById('excludeSimilar'),
    excludeRepeating: document.getElementById('excludeRepeating'),
    onlyUnique: document.getElementById('onlyUnique'),
    resetSettingsBtn: document.getElementById('resetSettingsBtn'),
    aboutBtn: document.getElementById('aboutBtn'),
    aboutModal: document.getElementById('aboutModal'),
    closeAboutModal: document.getElementById('closeAboutModal'),
    aboutVersion: document.getElementById('aboutVersion'),
    mainContent: document.getElementById('main-content')
};

let deferredPrompt = null;
let isAppInstalled = false;
let modalFocusable = null;
let previouslyFocused = null;

const triggerHapticFeedback = () => 'vibrate' in navigator && navigator.vibrate(50);
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch {}
    updateThemeUI(theme);
}

function updateThemeUI(theme) {
    if (!elements.themeToggle) return;
    const isDark = theme === 'dark';
    elements.themeToggle.setAttribute('data-tooltip', isDark ? 'Светлая тема' : 'Тёмная тема');
    elements.themeToggle.setAttribute('aria-label', isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему');
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

function initTheme() {
    const saved = (() => { try { return localStorage.getItem('theme'); } catch { return null; } })();
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (systemDark ? 'dark' : 'light'));
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            applyTheme(newTheme);
        }
    });
}

function loadSettings() {
    try {
        const s = JSON.parse(localStorage.getItem('passwordSettings')) || {};
        elements.length.value = s.length ?? 16;
        elements.lowercase.checked = s.lowercase ?? true;
        elements.uppercase.checked = s.uppercase ?? true;
        elements.numbers.checked = s.numbers ?? true;
        elements.special.checked = s.special ?? true;
        elements.excludeSimilar.checked = s.excludeSimilar ?? false;
        elements.excludeRepeating.checked = s.excludeRepeating ?? false;
        elements.onlyUnique.checked = s.onlyUnique ?? true;
        updateLengthValue();
    } catch {}
}

function saveSettings() {
    const settings = {
        length: parseInt(elements.length.value, 10),
        lowercase: elements.lowercase.checked,
        uppercase: elements.uppercase.checked,
        numbers: elements.numbers.checked,
        special: elements.special.checked,
        excludeSimilar: elements.excludeSimilar.checked,
        excludeRepeating: elements.excludeRepeating.checked,
        onlyUnique: elements.onlyUnique.checked
    };
    try { localStorage.setItem('passwordSettings', JSON.stringify(settings)); } catch {}
}

function resetSettingsToDefault() {
    elements.length.value = 16;
    elements.lowercase.checked = true;
    elements.uppercase.checked = true;
    elements.numbers.checked = true;
    elements.special.checked = true;
    elements.excludeSimilar.checked = false;
    elements.excludeRepeating.checked = false;
    elements.onlyUnique.checked = true;
    updateLengthValue();
    saveSettings();
    performGeneration();
    showNotification('Настройки сброшены');
}

function updateLengthValue() {
    elements.lengthValue.textContent = elements.length.value;
}

function filterCharSet(charSet, excludeSimilar) {
    return excludeSimilar ? [...charSet].filter(c => !SIMILAR_CHARS.includes(c)).join('') : charSet;
}

function getActiveCharSets() {
    const excludeSimilar = elements.excludeSimilar.checked;
    const sets = [];
    if (elements.lowercase.checked) sets.push(filterCharSet(CHAR_SETS.lowercase, excludeSimilar));
    if (elements.uppercase.checked) sets.push(filterCharSet(CHAR_SETS.uppercase, excludeSimilar));
    if (elements.numbers.checked) sets.push(filterCharSet(CHAR_SETS.numbers, excludeSimilar));
    if (elements.special.checked) sets.push(filterCharSet(CHAR_SETS.special, excludeSimilar));
    return sets.filter(s => s.length > 0);
}

function getRandomInt(max) {
    if (max <= 0) return 0;
    const maxUint32 = 0xFFFFFFFF;
    const maxValid = maxUint32 - (maxUint32 % max);
    const array = new Uint32Array(1);
    let value;
    do { crypto.getRandomValues(array); value = array[0]; } while (value >= maxValid);
    return value % max;
}

function hasConsecutiveRepeats(password) {
    for (let i = 0; i < password.length - 1; i++) {
        if (password[i] === password[i+1]) return true;
    }
    return false;
}

function generatePassword(length, sets, excludeRepeating, onlyUnique) {
    if (!sets.length) return '';
    const fullPool = sets.join('');
    if (!fullPool.length) return '';

    if (onlyUnique) {
        const used = new Set();
        const result = [];
        for (const set of sets) {
            const char = set[getRandomInt(set.length)];
            if (!used.has(char)) {
                used.add(char);
                result.push(char);
            } else {
                let found = false;
                for (let i = 0; i < set.length; i++) {
                    const c = set[i];
                    if (!used.has(c)) {
                        used.add(c);
                        result.push(c);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    result.push(char);
                    used.add(char);
                }
            }
        }
        while (result.length < length) {
            const char = fullPool[getRandomInt(fullPool.length)];
            if (!used.has(char)) {
                used.add(char);
                result.push(char);
            }
        }
        for (let i = result.length - 1; i > 0; i--) {
            const j = getRandomInt(i + 1);
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result.join('');
    } else {
        let chars = sets.map(set => set[getRandomInt(set.length)]);
        while (chars.length < length) chars.push(fullPool[getRandomInt(fullPool.length)]);
        for (let i = chars.length - 1; i > 0; i--) {
            const j = getRandomInt(i + 1);
            [chars[i], chars[j]] = [chars[j], chars[i]];
        }
        if (excludeRepeating) {
            let attempts = 0;
            while (hasConsecutiveRepeats(chars.join('')) && attempts++ < 100) {
                for (let i = chars.length - 1; i > 0; i--) {
                    const j = getRandomInt(i + 1);
                    [chars[i], chars[j]] = [chars[j], chars[i]];
                }
            }
        }
        return chars.join('');
    }
}

let generateDebounceTimer;
function debouncedPerformGeneration() {
    clearTimeout(generateDebounceTimer);
    generateDebounceTimer = setTimeout(() => { performGeneration(); generateDebounceTimer = null; }, 50);
}

function performGeneration() {
    const length = parseInt(elements.length.value, 10);
    const sets = getActiveCharSets();
    if (!sets.length) { showNotification('Выберите хотя бы один тип символов'); return false; }
    const fullPool = sets.join('');
    const onlyUnique = elements.onlyUnique.checked;
    if (onlyUnique && fullPool.length < length) {
        showNotification('Недостаточно уникальных символов для опции «Только уникальные». Уменьшите длину или отключите опцию.');
        return false;
    }
    if (length < sets.length) {
        showNotification('Длина пароля должна быть не меньше количества выбранных типов');
        return false;
    }
    elements.password.value = generatePassword(length, sets, elements.excludeRepeating.checked, onlyUnique);
    updatePasswordStrength();
    saveSettings();
    return true;
}

async function copyToClipboard() {
    if (!elements.password.value) { showNotification('Сначала создайте пароль'); return; }
    triggerHapticFeedback();
    try {
        await navigator.clipboard.writeText(elements.password.value);
        showNotification('Пароль скопирован');
    } catch { showNotification('Не удалось скопировать'); }
}

async function generateAndCopy() {
    const btn = elements.generateBtn;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⌛ Создание...';
    triggerHapticFeedback();
    try {
        if (!performGeneration()) return;
        await navigator.clipboard.writeText(elements.password.value);
        showNotification('Пароль создан и скопирован');
    } catch { showNotification('Пароль создан, но не скопирован'); }
    finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification('Генератор паролей', { body: message, icon: './assets/icons/icon-192.png' });
        } catch(e) {}
    }
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function checkPWAInstallStatus() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function initPWAInstall() {
    if (checkPWAInstallStatus() || isIOS()) { elements.installPWA.classList.add('hide'); return; }
    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        deferredPrompt = e;
        elements.installPWA.classList.remove('hide');
    });
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        isAppInstalled = true;
        elements.installPWA.classList.add('hide');
        showNotification('Приложение установлено!');
    });
}

async function installPWA() {
    if (!deferredPrompt || isAppInstalled) {
        showNotification('Приложение уже установлено');
        elements.installPWA.classList.add('hide');
        return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (outcome === 'accepted') {
        isAppInstalled = true;
        elements.installPWA.classList.add('hide');
    } else { showNotification('Установка отменена'); }
}

function getFocusableElements(container) {
    return Array.from(container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter(el => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1');
}

function trapFocus(event, focusable) {
    if (!focusable.length) return;
    const [first, last] = [focusable[0], focusable[focusable.length - 1]];
    if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
}

function openModal() {
    const { aboutModal: modal, mainContent } = elements;
    if (!modal || !mainContent) return;
    previouslyFocused = document.activeElement;
    document.body.classList.add('modal-open');
    modal.classList.add('show');
    elements.aboutBtn.setAttribute('aria-expanded', 'true');
    modalFocusable = getFocusableElements(modal);
    if (modalFocusable.length) modalFocusable[0].focus();
    if (!mainContent.hasAttribute('inert')) mainContent.inert = true;
    const keyHandler = e => trapFocus(e, modalFocusable);
    const escapeHandler = e => e.key === 'Escape' && closeModal();
    document.addEventListener('keydown', keyHandler);
    document.addEventListener('keydown', escapeHandler);
    modal._keyHandler = keyHandler;
    modal._escapeHandler = escapeHandler;
}

function closeModal() {
    const { aboutModal: modal, mainContent } = elements;
    if (!modal || !mainContent) return;
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    elements.aboutBtn.setAttribute('aria-expanded', 'false');
    if (mainContent.inert) mainContent.inert = false;
    if (modal._keyHandler) { document.removeEventListener('keydown', modal._keyHandler); delete modal._keyHandler; }
    if (modal._escapeHandler) { document.removeEventListener('keydown', modal._escapeHandler); delete modal._escapeHandler; }
    if (previouslyFocused?.focus) previouslyFocused.focus();
}

function initAboutModal() {
    const { aboutModal: modal, closeAboutModal: closeBtn } = elements;
    const content = modal?.querySelector('.modal-content');
    if (!modal || !closeBtn || !content) return;
    elements.aboutBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    let touchStartY = 0, touchCurrentY = 0, isDragging = false;
    content.addEventListener('touchstart', e => { if (content.scrollTop === 0) { touchStartY = e.touches[0].clientY; isDragging = true; } }, { passive: true });
    content.addEventListener('touchmove', e => {
        if (!isDragging) return;
        touchCurrentY = e.touches[0].clientY;
        const diff = touchCurrentY - touchStartY;
        if (diff > 0) { e.preventDefault(); content.style.transform = `translateY(${diff}px)`; }
    }, { passive: false });
    content.addEventListener('touchend', () => {
        if (!isDragging) return;
        if (touchCurrentY - touchStartY > 100) closeModal(); else content.style.transform = '';
        touchStartY = touchCurrentY = 0; isDragging = false;
    });
    content.addEventListener('touchcancel', () => { content.style.transform = ''; touchStartY = touchCurrentY = 0; isDragging = false; });
}

function initServiceWorker() {
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
}

function initVersion() {
    const version = window.APP_VERSION || 'unknown';
    elements.footerVersion.textContent = version;
    elements.aboutVersion.textContent = version;
}

function updatePasswordStrength() {
    if (!elements.password) return;
    const length = parseInt(elements.length.value, 10);
    const complexity = [elements.lowercase, elements.uppercase, elements.numbers, elements.special].filter(c => c.checked).length;
    const strength = length * complexity;
    const strengthText = strength >= 96 ? 'очень надёжный' : strength >= 64 ? 'надёжный' : strength >= 32 ? 'средний' : 'слабый';
    elements.password.setAttribute('aria-label', `Сгенерированный пароль длиной ${length} символов, ${strengthText} уровень защиты`);
}

function initApp() {
    initVersion();
    initTheme();
    loadSettings();
    performGeneration();
    document.documentElement.setAttribute('data-theme-init', '');
    requestNotificationPermission();
    initPWAInstall();
    initServiceWorker();
    initAboutModal();

    elements.length.addEventListener('input', () => { updateLengthValue(); debouncedPerformGeneration(); });
    elements.generateBtn.addEventListener('click', generateAndCopy);
    elements.copyBtn.addEventListener('click', copyToClipboard);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.installPWA.addEventListener('click', installPWA);
    elements.resetSettingsBtn.addEventListener('click', resetSettingsToDefault);
    document.querySelectorAll('.switch input').forEach(input => input.addEventListener('change', debouncedPerformGeneration));
    document.addEventListener('keydown', e => { if (e.key === ' ' && e.target === document.body) { e.preventDefault(); generateAndCopy(); } });
    updatePasswordStrength();
}

document.addEventListener('DOMContentLoaded', initApp);