// script.js (ES module)
import './version.js';

const APP_NAME = "Генератор паролей";

const CHAR_SETS = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    special: "!@#$%^&*"
};

const SIMILAR_CHARS = "0O1lI|";

const SVG_ICONS = {
    sun: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M12 3V5M12 19V21M5 12H3M21 12H19M7.05 7.05L5.64 5.64M18.36 18.36L16.95 16.95M7.05 16.95L5.64 18.36M18.36 5.64L16.95 7.05" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    moon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    eyeClosed: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    eyeOpen: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>`
};

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
    aboutVersion: document.getElementById('aboutVersion'),
    mainContent: document.getElementById('main-content')
};

let notificationTimeout = null;
let deferredPrompt = null;
let isAppInstalled = false;
let focusableElements = null;
let previouslyFocused = null;

function triggerHapticFeedback() {
    if ('vibrate' in navigator) navigator.vibrate(50);
}

// ---- Тема ----
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch {}
    updateThemeUI(theme);
}

function updateThemeUI(theme) {
    if (!elements.themeToggle) return;
    const isDark = theme === 'dark';
    const svg = isDark ? SVG_ICONS.sun : SVG_ICONS.moon;
    const tooltipText = isDark ? 'Светлая тема' : 'Тёмная тема';
    elements.themeToggle.innerHTML = svg + '<span class="tooltip">' + tooltipText + '</span>';
    elements.themeToggle.setAttribute('aria-label', isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему');
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'light' ? 'dark' : 'light');
}

function initTheme() {
    const saved = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (systemDark ? 'dark' : 'light'));

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}

// ---- Настройки ----
function loadSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('passwordSettings')) || {};
        if (elements.length) elements.length.value = settings.length ?? 16;
        if (elements.lowercase) elements.lowercase.checked = settings.lowercase ?? true;
        if (elements.uppercase) elements.uppercase.checked = settings.uppercase ?? true;
        if (elements.numbers) elements.numbers.checked = settings.numbers ?? true;
        if (elements.special) elements.special.checked = settings.special ?? true;
        if (elements.excludeSimilar) elements.excludeSimilar.checked = settings.excludeSimilar ?? false;
        if (elements.excludeRepeating) elements.excludeRepeating.checked = settings.excludeRepeating ?? false;
        updateLengthValue();
    } catch {}
}

function saveSettings() {
    const settings = {
        length: elements.length ? parseInt(elements.length.value, 10) : 16,
        lowercase: elements.lowercase?.checked ?? true,
        uppercase: elements.uppercase?.checked ?? true,
        numbers: elements.numbers?.checked ?? true,
        special: elements.special?.checked ?? true,
        excludeSimilar: elements.excludeSimilar?.checked ?? false,
        excludeRepeating: elements.excludeRepeating?.checked ?? false
    };
    try { localStorage.setItem('passwordSettings', JSON.stringify(settings)); } catch {}
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

function updateLengthValue() {
    if (elements.length && elements.lengthValue) {
        elements.lengthValue.textContent = elements.length.value;
    }
}

// ---- Генерация пароля ----
function filterCharSet(charSet, excludeSimilar) {
    if (!excludeSimilar) return charSet;
    return [...charSet].filter(c => !SIMILAR_CHARS.includes(c)).join('');
}

function getActiveCharSets() {
    const excludeSimilar = elements.excludeSimilar?.checked ?? false;
    const sets = [];
    if (elements.lowercase?.checked) {
        const filtered = filterCharSet(CHAR_SETS.lowercase, excludeSimilar);
        if (filtered) sets.push(filtered);
    }
    if (elements.uppercase?.checked) {
        const filtered = filterCharSet(CHAR_SETS.uppercase, excludeSimilar);
        if (filtered) sets.push(filtered);
    }
    if (elements.numbers?.checked) {
        const filtered = filterCharSet(CHAR_SETS.numbers, excludeSimilar);
        if (filtered) sets.push(filtered);
    }
    if (elements.special?.checked) {
        const filtered = filterCharSet(CHAR_SETS.special, excludeSimilar);
        if (filtered) sets.push(filtered);
    }
    return sets;
}

function generatePassword(length, sets, excludeRepeating) {
    if (sets.length === 0) return '';

    const fullPool = sets.join('');
    if (fullPool.length === 0) return '';

    if (length < sets.length) length = sets.length;

    const getRandomInt = (max) => {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] % max;
    };

    let passwordChars = [];
    for (const set of sets) {
        const idx = getRandomInt(set.length);
        passwordChars.push(set[idx]);
    }

    while (passwordChars.length < length) {
        const idx = getRandomInt(fullPool.length);
        passwordChars.push(fullPool[idx]);
    }

    for (let i = passwordChars.length - 1; i > 0; i--) {
        const j = getRandomInt(i + 1);
        [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }

    if (excludeRepeating && fullPool.length > 1) {
        let attempts = 0;
        const maxAttempts = 100;
        while (attempts < maxAttempts) {
            let ok = true;
            for (let i = 1; i < passwordChars.length; i++) {
                if (passwordChars[i] === passwordChars[i - 1]) {
                    ok = false;
                    break;
                }
            }
            if (ok) break;
            for (let i = passwordChars.length - 1; i > 0; i--) {
                const j = getRandomInt(i + 1);
                [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
            }
            attempts++;
        }
    }

    return passwordChars.join('');
}

function generateAndShow() {
    const length = elements.length ? parseInt(elements.length.value, 10) : 16;
    const sets = getActiveCharSets();
    if (sets.length === 0) {
        showNotification('Выберите хотя бы один тип символов', 'error');
        return;
    }
    const excludeRepeating = elements.excludeRepeating?.checked ?? false;

    const password = generatePassword(length, sets, excludeRepeating);
    if (elements.password) elements.password.value = password;

    clearNotification();
    updatePasswordStrength();
    saveSettings();
}

// ---- Копирование ----
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
        const length = elements.length ? parseInt(elements.length.value, 10) : 16;
        const sets = getActiveCharSets();
        if (sets.length === 0) {
            showNotification('Выберите хотя бы один тип символов', 'error');
            return;
        }
        const excludeRepeating = elements.excludeRepeating?.checked ?? false;

        const password = generatePassword(length, sets, excludeRepeating);
        if (elements.password) elements.password.value = password;

        await navigator.clipboard.writeText(password);
        showNotification('Пароль создан и скопирован', 'success');

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

// ---- Уведомления ----
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

// ---- Оценка сложности ----
function updatePasswordStrength() {
    if (!elements.password) return;
    const length = elements.length ? parseInt(elements.length.value, 10) : 16;
    const complexity = [elements.lowercase, elements.uppercase, elements.numbers, elements.special].filter(c => c?.checked).length;
    const strength = length * complexity;

    let strengthText = '';
    if (strength >= 96) strengthText = 'очень надёжный';
    else if (strength >= 64) strengthText = 'надёжный';
    else if (strength >= 32) strengthText = 'средний';
    else strengthText = 'слабый';

    elements.password.setAttribute('aria-label',
        `Сгенерированный пароль длиной ${length} символов, ${strengthText} уровень защиты`);
}

// ---- Кнопка видимости пароля ----
function addPasswordVisibilityToggle() {
    if (document.querySelector('.visibility-toggle')) return;

    const passwordField = elements.password;
    if (!passwordField?.parentNode) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'visibility-toggle';
    toggleBtn.type = 'button';

    const savedVisible = localStorage.getItem('passwordVisible') === 'true';
    const initialSvg = savedVisible ? SVG_ICONS.eyeOpen : SVG_ICONS.eyeClosed;
    const initialLabel = savedVisible ? 'Скрыть пароль' : 'Показать пароль';
    toggleBtn.innerHTML = initialSvg + '<span class="tooltip">' + initialLabel + '</span>';
    toggleBtn.setAttribute('aria-label', initialLabel);
    if (savedVisible) passwordField.type = 'text';

    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordField.type === 'password';
        passwordField.type = isPassword ? 'text' : 'password';
        const newLabel = isPassword ? 'Скрыть пароль' : 'Показать пароль';
        toggleBtn.innerHTML = (isPassword ? SVG_ICONS.eyeClosed : SVG_ICONS.eyeOpen) + '<span class="tooltip">' + newLabel + '</span>';
        toggleBtn.setAttribute('aria-label', newLabel);
        try { localStorage.setItem('passwordVisible', String(!isPassword)); } catch {}
        triggerHapticFeedback();
    });

    passwordField.parentNode.appendChild(toggleBtn);
}

// ---- PWA установка ----
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

// ---- Модальное окно с управлением фокусом и inert ----
function getFocusableElements(container) {
    if (!container) return [];
    return Array.from(
        container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
    ).filter(el => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1');
}

function trapFocus(event, focusable) {
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.key === 'Tab') {
        if (event.shiftKey) {
            if (document.activeElement === first) {
                event.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    }
}

function openModal() {
    const modal = elements.aboutModal;
    const mainContent = elements.mainContent;
    if (!modal || !mainContent) return;

    // Сохранить текущий фокус
    previouslyFocused = document.activeElement;

    // Показать модалку
    modal.classList.add('show');
    // Обновить aria-expanded на кнопке
    if (elements.aboutBtn) elements.aboutBtn.setAttribute('aria-expanded', 'true');

    // Найти фокусируемые элементы внутри модалки
    focusableElements = getFocusableElements(modal);
    if (focusableElements.length) {
        focusableElements[0].focus();
    }

    // Установить inert на основной контент
    mainContent.inert = true;

    // Добавить обработчик клавиш для ловушки фокуса
    const keyHandler = (e) => trapFocus(e, focusableElements);
    document.addEventListener('keydown', keyHandler);

    // Обработчик закрытия по Escape
    const escapeHandler = (e) => {
        if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', escapeHandler);

    // Сохранить обработчики для последующего удаления
    modal._keyHandler = keyHandler;
    modal._escapeHandler = escapeHandler;
}

function closeModal() {
    const modal = elements.aboutModal;
    const mainContent = elements.mainContent;
    if (!modal || !mainContent) return;

    modal.classList.remove('show');
    if (elements.aboutBtn) elements.aboutBtn.setAttribute('aria-expanded', 'false');

    // Снять inert
    mainContent.inert = false;

    // Удалить обработчики
    if (modal._keyHandler) {
        document.removeEventListener('keydown', modal._keyHandler);
        delete modal._keyHandler;
    }
    if (modal._escapeHandler) {
        document.removeEventListener('keydown', modal._escapeHandler);
        delete modal._escapeHandler;
    }

    // Вернуть фокус
    if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
    }
}

function initAboutModal() {
    const modal = elements.aboutModal;
    const closeBtn = elements.closeAboutModal;
    const content = modal?.querySelector('.modal-content');

    if (!modal || !closeBtn || !content) return;

    elements.aboutBtn?.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // iOS-style swipe down to close (оставляем как есть)
    let touchStartY = 0, touchCurrentY = 0;
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
        if (diff > 100) closeModal();
        content.style.transform = '';
        touchStartY = touchCurrentY = 0;
    });
}

// ---- Service Worker ----
function initServiceWorker() {
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
}

// ---- Версия ----
function initVersion() {
    if (elements.footerVersion) elements.footerVersion.textContent = APP_VERSION;
    if (elements.aboutVersion) elements.aboutVersion.textContent = APP_VERSION;
}

// ---- Инициализация ----
function initApp() {
    initVersion();
    initTheme();
    loadSettings();
    generateAndShow();
    initPWAInstall();
    initServiceWorker();
    addPasswordVisibilityToggle();
    initAboutModal();

    elements.length?.addEventListener('input', () => {
        updateLengthValue();
        generateAndShow();
    });

    elements.generateBtn?.addEventListener('click', generateAndCopy);
    elements.copyBtn?.addEventListener('click', copyToClipboard);
    elements.themeToggle?.addEventListener('click', toggleTheme);
    elements.installPWA?.addEventListener('click', installPWA);
    elements.resetSettingsBtn?.addEventListener('click', resetSettingsToDefault);

    document.querySelectorAll('.switch input').forEach(input => {
        input.addEventListener('change', generateAndShow);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' && e.target === document.body) {
            e.preventDefault();
            generateAndCopy();
        }
        // Escape уже обрабатывается в модалке отдельно
    });

    updatePasswordStrength();
}

document.addEventListener('DOMContentLoaded', initApp);