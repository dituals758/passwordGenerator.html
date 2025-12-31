/**
 * iOS Touch Password Generator
 * Version: 1.4.0
 * Fully touch-compatible
 */

'use strict';

const CONFIG = {
    charSets: {
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        numbers: '0123456789',
        special: '!@#$%^&*'
    },
    strengthLevels: [
        { name: 'Очень низкая', color: '#ff453a', width: '25%', description: 'Рекомендуем увеличить длину' },
        { name: 'Низкая', color: '#ff9f0a', width: '35%', description: 'Добавьте больше типов символов' },
        { name: 'Средняя', color: '#ffd60a', width: '50%', description: 'Хороший пароль для сервисов' },
        { name: 'Хорошая', color: '#30d158', width: '65%', description: 'Надежная защита для аккаунтов' },
        { name: 'Высокая', color: '#0a84ff', width: '80%', description: 'Отличный пароль для банков' },
        { name: 'Очень высокая', color: '#bf5af2', width: '95%', description: 'Максимальная защита данных' }
    ],
    minPasswordLength: 8,
    maxPasswordLength: 32,
    defaultPasswordLength: 16
};

class PasswordGenerator {
    constructor() {
        this.currentPassword = '';
        this.isGenerating = false;
        this.deferredPrompt = null;
        this.elements = {};
        this.isTouchDevice = 'ontouchstart' in window;
        
        console.log('Touch device detected:', this.isTouchDevice);
        
        this.init();
    }
    
    init() {
        this.createAppStructure();
        this.cacheElements();
        this.setupTouchEvents();
        this.setupTheme();
        this.setupPWA();
        this.generatePassword();
    }
    
    createAppStructure() {
        const app = document.getElementById('app');
        if (!app) return;
        
        app.innerHTML = `
            <nav class="navigation">
                <div class="nav-content">
                    <h1 class="nav-title">Генератор паролей</h1>
                    <button class="nav-button" id="themeToggle">
                        <span>🌙</span>
                    </button>
                </div>
            </nav>
            
            <main class="content">
                <section class="card password-card">
                    <div class="password-display-container">
                        <div class="password-display">
                            <div id="passwordOutput" class="password-output">
                                Нажмите "Сгенерировать пароль"
                            </div>
                        </div>
                    </div>
                    
                    <div class="strength-indicator">
                        <div class="strength-header">
                            <span class="strength-label">Сложность:</span>
                            <span id="strengthBadge" class="strength-badge">Средняя</span>
                        </div>
                        <div class="strength-meter">
                            <div id="strengthFill" class="strength-fill"></div>
                        </div>
                        <div id="strengthDescription" class="strength-description">
                            Хороший пароль для большинства сервисов
                        </div>
                    </div>
                    
                    <div class="generate-button-container">
                        <button class="generate-button" id="generateButton">
                            <span>🔐</span>
                            <span>Сгенерировать и скопировать</span>
                        </button>
                    </div>
                </section>
                
                <section class="card settings-card">
                    <h2 class="settings-title">Настройки генерации</h2>
                    
                    <div class="length-control">
                        <div class="length-header">
                            <span class="length-label">Длина пароля:</span>
                            <span id="lengthValue" class="length-value">16</span>
                        </div>
                        <div class="slider-container">
                            <div class="slider-track">
                                <div id="sliderFill" class="slider-fill"></div>
                            </div>
                            <input type="range" class="slider-input" id="lengthSlider" 
                                   min="8" max="32" value="16" step="1">
                        </div>
                    </div>
                    
                    <div class="character-options">
                        <div class="option-row" data-switch="lowercaseSwitch">
                            <label class="option-label">
                                Строчные буквы (a-z)
                            </label>
                            <div class="switch-container">
                                <input type="checkbox" class="switch-input" id="lowercaseSwitch" checked>
                                <div class="switch-track">
                                    <div class="switch-thumb"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="option-row" data-switch="uppercaseSwitch">
                            <label class="option-label">
                                Заглавные буквы (A-Z)
                            </label>
                            <div class="switch-container">
                                <input type="checkbox" class="switch-input" id="uppercaseSwitch" checked>
                                <div class="switch-track">
                                    <div class="switch-thumb"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="option-row" data-switch="numbersSwitch">
                            <label class="option-label">
                                Цифры (0-9)
                            </label>
                            <div class="switch-container">
                                <input type="checkbox" class="switch-input" id="numbersSwitch" checked>
                                <div class="switch-track">
                                    <div class="switch-thumb"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="option-row" data-switch="specialSwitch">
                            <label class="option-label">
                                Специальные символы
                            </label>
                            <div class="switch-container">
                                <input type="checkbox" class="switch-input" id="specialSwitch" checked>
                                <div class="switch-track">
                                    <div class="switch-thumb"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="special-preview">
                        <div id="specialPreview" class="special-preview-text">
                            ! @ # $ % ^ & *
                        </div>
                    </div>
                </section>
                
                <section class="card info-card">
                    <div class="info-content">
                        <p>🔒 <strong>Локальная генерация</strong> - все пароли создаются только на вашем устройстве</p>
                        <p>⚡ <strong>Криптографически безопасно</strong> - используется Web Crypto API</p>
                        <p>📱 <strong>Работает оффлайн</strong> - не требует подключения к интернету</p>
                    </div>
                </section>
            </main>
            
            <div id="toast" class="toast"></div>
            
            <div id="pwaBanner" class="pwa-banner" hidden>
                <div class="pwa-content">
                    <div class="pwa-icon">🔐</div>
                    <div class="pwa-text">
                        <h3 class="pwa-title">Установить приложение</h3>
                        <p class="pwa-description">Добавьте на домашний экран для быстрого доступа</p>
                    </div>
                </div>
                <div class="pwa-actions">
                    <button id="pwaLaterButton" class="pwa-button secondary">Позже</button>
                    <button id="pwaInstallButton" class="pwa-button primary">Установить</button>
                </div>
            </div>
        `;
    }
    
    cacheElements() {
        this.elements = {
            passwordOutput: document.getElementById('passwordOutput'),
            strengthBadge: document.getElementById('strengthBadge'),
            strengthFill: document.getElementById('strengthFill'),
            strengthDescription: document.getElementById('strengthDescription'),
            lengthValue: document.getElementById('lengthValue'),
            lengthSlider: document.getElementById('lengthSlider'),
            sliderFill: document.getElementById('sliderFill'),
            lowercaseSwitch: document.getElementById('lowercaseSwitch'),
            uppercaseSwitch: document.getElementById('uppercaseSwitch'),
            numbersSwitch: document.getElementById('numbersSwitch'),
            specialSwitch: document.getElementById('specialSwitch'),
            themeToggle: document.getElementById('themeToggle'),
            refreshButton: document.getElementById('refreshButton'),
            copyButton: document.getElementById('copyButton'),
            generateButton: document.getElementById('generateButton'),
            toast: document.getElementById('toast'),
            pwaBanner: document.getElementById('pwaBanner'),
            pwaInstallButton: document.getElementById('pwaInstallButton'),
            pwaLaterButton: document.getElementById('pwaLaterButton')
        };
    }
    
    setupTouchEvents() {
        console.log('Setting up touch events...');
        
        // Theme toggle
        this.elements.themeToggle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.toggleTheme();
        });
        
        // Password actions
        this.elements.refreshButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.generatePassword();
        });
        
        this.elements.copyButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.copyPassword();
        });
        
        this.elements.generateButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.generateAndCopy();
        });
        
        // Length slider
        this.elements.lengthSlider.addEventListener('input', () => {
            this.updateSlider();
            this.generatePassword();
        });
        
        // Switch handlers - ВАЖНО: Обработка клика на всю строку
        document.querySelectorAll('.option-row').forEach(row => {
            row.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const switchId = row.getAttribute('data-switch');
                const switchElement = document.getElementById(switchId);
                if (switchElement) {
                    switchElement.checked = !switchElement.checked;
                    this.generatePassword();
                    
                    // Визуальная обратная связь
                    row.style.backgroundColor = 'var(--system-background-tertiary)';
                    setTimeout(() => {
                        row.style.backgroundColor = '';
                    }, 150);
                }
            });
            
            // Для десктопов тоже
            row.addEventListener('click', (e) => {
                e.preventDefault();
                const switchId = row.getAttribute('data-switch');
                const switchElement = document.getElementById(switchId);
                if (switchElement) {
                    switchElement.checked = !switchElement.checked;
                    this.generatePassword();
                }
            });
        });
        
        // Также привязываемся к самим инпутам на случай прямого клика
        [this.elements.lowercaseSwitch, this.elements.uppercaseSwitch, 
         this.elements.numbersSwitch, this.elements.specialSwitch].forEach(switchEl => {
            switchEl.addEventListener('change', () => this.generatePassword());
        });
        
        // Touch feedback for all buttons
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('touchstart', () => {
                button.style.transform = 'scale(0.95)';
                button.style.opacity = '0.8';
            });
            
            button.addEventListener('touchend', () => {
                button.style.transform = '';
                button.style.opacity = '';
            });
        });
        
        // Prevent context menu on touch hold
        document.addEventListener('contextmenu', (e) => {
            if (this.isTouchDevice) {
                e.preventDefault();
            }
        });
    }
    
    updateSlider() {
        const value = this.elements.lengthSlider.value;
        const min = this.elements.lengthSlider.min;
        const max = this.elements.lengthSlider.max;
        const percentage = ((value - min) / (max - min)) * 100;
        
        this.elements.sliderFill.style.width = `${percentage}%`;
        this.elements.lengthValue.textContent = value;
    }
    
    setupTheme() {
        const savedTheme = localStorage.getItem('password-generator-theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        
        document.documentElement.setAttribute('data-theme', initialTheme);
        this.updateThemeButton(initialTheme);
    }
    
    updateThemeButton(theme) {
        const icon = this.elements.themeToggle.querySelector('span');
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('password-generator-theme', newTheme);
        this.updateThemeButton(newTheme);
        
        this.showToast(`Тема: ${newTheme === 'dark' ? 'Тёмная' : 'Светлая'}`);
    }
    
    getCharPool() {
        let pool = '';
        if (this.elements.lowercaseSwitch.checked) pool += CONFIG.charSets.lowercase;
        if (this.elements.uppercaseSwitch.checked) pool += CONFIG.charSets.uppercase;
        if (this.elements.numbersSwitch.checked) pool += CONFIG.charSets.numbers;
        if (this.elements.specialSwitch.checked) pool += CONFIG.charSets.special;
        return pool;
    }
    
    calculateStrength(password, charPool) {
        if (!password || !charPool) return 0;
        
        const poolSize = charPool.length;
        const length = password.length;
        const entropy = length * Math.log2(poolSize);
        
        let varietyBonus = 0;
        if (/[a-z]/.test(password)) varietyBonus += 10;
        if (/[A-Z]/.test(password)) varietyBonus += 10;
        if (/[0-9]/.test(password)) varietyBonus += 10;
        if (/[^a-zA-Z0-9]/.test(password)) varietyBonus += 10;
        
        return entropy + varietyBonus;
    }
    
    getStrengthLevel(strength) {
        if (strength < 30) return CONFIG.strengthLevels[0];
        if (strength < 45) return CONFIG.strengthLevels[1];
        if (strength < 60) return CONFIG.strengthLevels[2];
        if (strength < 75) return CONFIG.strengthLevels[3];
        if (strength < 90) return CONFIG.strengthLevels[4];
        return CONFIG.strengthLevels[5];
    }
    
    generatePassword() {
        const charPool = this.getCharPool();
        const length = parseInt(this.elements.lengthSlider.value);
        
        if (!charPool) {
            this.showToast('Выберите хотя бы один тип символов');
            this.elements.passwordOutput.textContent = 'Выберите типы символов';
            this.updateStrength('', '');
            return '';
        }
        
        try {
            const array = new Uint32Array(length);
            window.crypto.getRandomValues(array);
            
            let password = '';
            for (let i = 0; i < length; i++) {
                password += charPool[array[i] % charPool.length];
            }
            
            this.currentPassword = password;
            this.elements.passwordOutput.textContent = password;
            this.updateStrength(password, charPool);
            
            return password;
        } catch (error) {
            console.error('Web Crypto error:', error);
            return this.generateFallbackPassword(length, charPool);
        }
    }
    
    generateFallbackPassword(length, charPool) {
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charPool[Math.floor(Math.random() * charPool.length)];
        }
        
        this.currentPassword = password;
        this.elements.passwordOutput.textContent = password;
        this.updateStrength(password, charPool);
        
        return password;
    }
    
    updateStrength(password, charPool) {
        if (!password) {
            this.elements.strengthBadge.textContent = '—';
            this.elements.strengthBadge.style.background = '#98989d';
            this.elements.strengthFill.style.width = '0%';
            this.elements.strengthDescription.textContent = 'Сгенерируйте пароль';
            return;
        }
        
        const strength = this.calculateStrength(password, charPool);
        const strengthLevel = this.getStrengthLevel(strength);
        
        this.elements.strengthBadge.textContent = strengthLevel.name;
        this.elements.strengthBadge.style.background = strengthLevel.color;
        this.elements.strengthFill.style.width = strengthLevel.width;
        this.elements.strengthFill.style.background = strengthLevel.color;
        this.elements.strengthDescription.textContent = strengthLevel.description;
    }
    
    async generateAndCopy() {
        if (this.isGenerating) return;
        
        this.isGenerating = true;
        this.elements.generateButton.disabled = true;
        
        const buttonText = this.elements.generateButton.querySelector('span:last-child');
        const originalText = buttonText.textContent;
        buttonText.textContent = 'Генерация...';
        
        const password = this.generatePassword();
        
        if (!password) {
            this.resetGenerateButton(originalText);
            this.isGenerating = false;
            return;
        }
        
        // Задержка для визуальной обратной связи
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await this.copyPassword();
        
        buttonText.textContent = 'Скопировано!';
        setTimeout(() => {
            this.resetGenerateButton(originalText);
        }, 1500);
        
        this.isGenerating = false;
    }
    
    resetGenerateButton(originalText) {
        this.elements.generateButton.disabled = false;
        const buttonText = this.elements.generateButton.querySelector('span:last-child');
        buttonText.textContent = originalText;
    }
    
    async copyPassword() {
        if (!this.currentPassword) {
            this.showToast('Сначала сгенерируйте пароль');
            return false;
        }
        
        try {
            await navigator.clipboard.writeText(this.currentPassword);
            this.showToast('Пароль скопирован');
            
            // Визуальная обратная связь
            const icon = this.elements.copyButton.querySelector('span');
            icon.textContent = '✓';
            setTimeout(() => {
                icon.textContent = '📋';
            }, 2000);
            
            return true;
        } catch (err) {
            console.warn('Clipboard API failed:', err);
            return this.copyFallback();
        }
    }
    
    copyFallback() {
        const textArea = document.createElement('textarea');
        textArea.value = this.currentPassword;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (success) {
                this.showToast('Пароль скопирован');
                return true;
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        
        this.showToast('Не удалось скопировать');
        return false;
    }
    
    showToast(message) {
        const toast = this.elements.toast;
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
    
    setupPWA() {
        let pwaDismissed = localStorage.getItem('pwa-dismissed') === 'true';
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            
            if (!pwaDismissed) {
                setTimeout(() => {
                    this.elements.pwaBanner.hidden = false;
                    setTimeout(() => {
                        this.elements.pwaBanner.classList.add('show');
                    }, 100);
                }, 5000);
            }
        });
        
        window.addEventListener('appinstalled', () => {
            this.elements.pwaBanner.classList.remove('show');
            this.showToast('Приложение установлено');
            localStorage.setItem('pwa-dismissed', 'true');
        });
        
        this.elements.pwaInstallButton.addEventListener('touchstart', async (e) => {
            e.preventDefault();
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('PWA installed');
                }
                this.deferredPrompt = null;
            }
            this.elements.pwaBanner.classList.remove('show');
            localStorage.setItem('pwa-dismissed', 'true');
        });
        
        this.elements.pwaLaterButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.elements.pwaBanner.classList.remove('show');
            localStorage.setItem('pwa-dismissed', 'true');
        });
    }
}

// Initialize immediately
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    new PasswordGenerator();
});

// Also try to initialize if DOM is already loaded
if (document.readyState !== 'loading') {
    console.log('DOM already ready, initializing now...');
    setTimeout(() => new PasswordGenerator(), 100);
}