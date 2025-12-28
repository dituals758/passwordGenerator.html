/**
 * iOS 18 Password Generator - GitHub Pages Edition
 * Version: 1.3.1
 */

'use strict';

// GitHub Pages safe configuration
const CONFIG = {
    charSets: {
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        numbers: '0123456789',
        special: '!@#$%^&*'
    },
    strengthLevels: [
        {
            name: 'Очень низкая',
            color: 'var(--red)',
            width: '25%',
            description: 'Рекомендуем увеличить длину и добавить символы'
        },
        {
            name: 'Низкая',
            color: 'var(--orange)',
            width: '35%',
            description: 'Добавьте больше типов символов для улучшения'
        },
        {
            name: 'Средняя',
            color: 'var(--yellow)',
            width: '50%',
            description: 'Хороший пароль для большинства сервисов'
        },
        {
            name: 'Хорошая',
            color: 'var(--green)',
            width: '65%',
            description: 'Надежная защита для важных аккаунтов'
        },
        {
            name: 'Высокая',
            color: 'var(--blue)',
            width: '80%',
            description: 'Отличный пароль для банковских сервисов'
        },
        {
            name: 'Очень высокая',
            color: 'var(--purple)',
            width: '95%',
            description: 'Максимальная защита для критических данных'
        }
    ],
    minPasswordLength: 8,
    maxPasswordLength: 32,
    defaultPasswordLength: 16
};

class PasswordGenerator {
    constructor() {
        this.currentPassword = '';
        this.deferredPrompt = null;
        this.isGenerating = false;
        this.elements = {};
        
        // Check if we're on GitHub Pages
        this.isGitHubPages = window.location.hostname.includes('github.io');
        
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        this.createAppStructure();
        this.cacheElements();
        this.setupTheme();
        this.setupEventListeners();
        this.setupSlider();
        this.setupPWA();
        this.preventZoom();
        this.generatePassword();
        
        console.log('Password Generator initialized for GitHub Pages');
    }
    
    /**
     * Create app structure for GitHub Pages
     */
    createAppStructure() {
        const app = document.getElementById('app');
        if (!app) return;
        
        app.innerHTML = `
            <!-- iOS 18 Navigation -->
            <nav class="navigation" role="navigation" aria-label="Основная навигация">
                <div class="nav-content">
                    <h1 class="nav-title">Генератор паролей</h1>
                    <div class="nav-actions">
                        <button class="nav-button" id="themeToggle" aria-label="Переключить тему" aria-pressed="false">
                            <span class="nav-button-icon" aria-hidden="true">🌙</span>
                        </button>
                    </div>
                </div>
            </nav>

            <!-- Main Content -->
            <main class="content" role="main">
                <!-- Password Card -->
                <section class="card password-card">
                    <div class="password-display-container">
                        <div class="password-display" role="textbox" aria-label="Пароль" tabindex="0">
                            <output id="passwordOutput" class="password-output" aria-live="polite">
                                Нажмите "Сгенерировать пароль"
                            </output>
                            <div class="password-actions">
                                <button class="action-button" id="refreshButton" aria-label="Сгенерировать новый пароль">
                                    <span class="action-button-icon" aria-hidden="true">🔄</span>
                                </button>
                                <button class="action-button" id="copyButton" aria-label="Копировать пароль">
                                    <span class="action-button-icon" aria-hidden="true">📋</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Strength Indicator -->
                    <div class="strength-indicator" aria-live="polite">
                        <div class="strength-header">
                            <span class="strength-label">Сложность:</span>
                            <span id="strengthBadge" class="strength-badge" role="status">Средняя</span>
                        </div>
                        <div class="strength-meter">
                            <div id="strengthFill" class="strength-fill"></div>
                        </div>
                        <div id="strengthDescription" class="strength-description">
                            Хороший пароль для большинства сервисов
                        </div>
                    </div>

                    <!-- Generate Button -->
                    <div class="generate-button-container">
                        <button class="generate-button" id="generateButton">
                            <span class="generate-button-icon" aria-hidden="true">🔐</span>
                            <span class="generate-button-text">Сгенерировать и скопировать</span>
                        </button>
                    </div>
                </section>

                <!-- Settings Card -->
                <section class="card settings-card">
                    <h2 class="settings-title">Настройки генерации</h2>
                    
                    <!-- Length Control -->
                    <div class="length-control">
                        <div class="length-header">
                            <span class="length-label">Длина пароля:</span>
                            <output id="lengthValue" class="length-value" aria-live="polite">16</output>
                        </div>
                        <div class="slider-container">
                            <div class="slider-track" aria-hidden="true">
                                <div id="sliderFill" class="slider-fill"></div>
                            </div>
                            <input type="range" 
                                   class="slider-input" 
                                   id="lengthSlider" 
                                   min="8" 
                                   max="32" 
                                   value="16" 
                                   step="1"
                                   aria-label="Длина пароля от 8 до 32 символов">
                        </div>
                    </div>

                    <!-- Character Options -->
                    <div class="character-options">
                        <div class="option-row">
                            <label class="option-label">
                                Строчные буквы (a-z)
                            </label>
                            <div class="switch-container">
                                <input type="checkbox" 
                                       class="switch-input" 
                                       id="lowercaseSwitch" 
                                       checked>
                                <span class="switch-track" aria-hidden="true">
                                    <span class="switch-thumb"></span>
                                </span>
                            </div>
                        </div>
                        
                        <div class="option-row">
                            <label class="option-label">
                                Заглавные буквы (A-Z)
                            </label>
                            <div class="switch-container">
                                <input type="checkbox" 
                                       class="switch-input" 
                                       id="uppercaseSwitch" 
                                       checked>
                                <span class="switch-track" aria-hidden="true">
                                    <span class="switch-thumb"></span>
                                </span>
                            </div>
                        </div>
                        
                        <div class="option-row">
                            <label class="option-label">
                                Цифры (0-9)
                            </label>
                            <div class="switch-container">
                                <input type="checkbox" 
                                       class="switch-input" 
                                       id="numbersSwitch" 
                                       checked>
                                <span class="switch-track" aria-hidden="true">
                                    <span class="switch-thumb"></span>
                                </span>
                            </div>
                        </div>
                        
                        <div class="option-row">
                            <label class="option-label">
                                Специальные символы
                            </label>
                            <div class="switch-container">
                                <input type="checkbox" 
                                       class="switch-input" 
                                       id="specialSwitch" 
                                       checked>
                                <span class="switch-track" aria-hidden="true">
                                    <span class="switch-thumb"></span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Special Characters Preview -->
                    <div class="special-preview" aria-label="Доступные специальные символы">
                        <div id="specialPreview" class="special-preview-text">
                            ! @ # $ % ^ & *
                        </div>
                    </div>
                </section>

                <!-- Information Section -->
                <section class="card info-card">
                    <div class="info-content">
                        <p>🔒 <strong>Локальная генерация</strong> - все пароли создаются только на вашем устройстве</p>
                        <p>⚡ <strong>Криптографически безопасно</strong> - используется Web Crypto API</p>
                        <p>📱 <strong>Работает оффлайн</strong> - не требует подключения к интернету</p>
                    </div>
                </section>
            </main>

            <!-- Toast Notification -->
            <div id="toast" class="toast" role="alert" aria-live="assertive"></div>

            <!-- PWA Install Banner -->
            <div id="pwaBanner" class="pwa-banner" role="dialog" aria-modal="true" hidden>
                <div class="pwa-content">
                    <div class="pwa-icon" aria-hidden="true">🔐</div>
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
        
        // Show the app
        app.style.display = 'flex';
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            // Display elements
            passwordOutput: document.getElementById('passwordOutput'),
            strengthBadge: document.getElementById('strengthBadge'),
            strengthFill: document.getElementById('strengthFill'),
            strengthDescription: document.getElementById('strengthDescription'),
            lengthValue: document.getElementById('lengthValue'),
            specialPreview: document.getElementById('specialPreview'),
            sliderFill: document.getElementById('sliderFill'),
            sliderInput: document.getElementById('lengthSlider'),
            
            // Input elements
            lowercaseSwitch: document.getElementById('lowercaseSwitch'),
            uppercaseSwitch: document.getElementById('uppercaseSwitch'),
            numbersSwitch: document.getElementById('numbersSwitch'),
            specialSwitch: document.getElementById('specialSwitch'),
            
            // Buttons
            themeToggle: document.getElementById('themeToggle'),
            themeIcon: document.querySelector('#themeToggle .nav-button-icon'),
            refreshButton: document.getElementById('refreshButton'),
            copyButton: document.getElementById('copyButton'),
            generateButton: document.getElementById('generateButton'),
            
            // Notifications
            toast: document.getElementById('toast'),
            
            // PWA
            pwaBanner: document.getElementById('pwaBanner'),
            pwaInstallButton: document.getElementById('pwaInstallButton'),
            pwaLaterButton: document.getElementById('pwaLaterButton')
        };
    }
    
    /**
     * Setup theme management
     */
    setupTheme() {
        // Get saved theme or use system preference
        const savedTheme = localStorage.getItem('themePreference');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        
        document.documentElement.setAttribute('data-theme', initialTheme);
        this.updateThemeButton(initialTheme);
        
        // Theme toggle button
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    /**
     * Update theme button icon
     */
    updateThemeButton(theme) {
        if (this.elements.themeIcon) {
            this.elements.themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
        this.elements.themeToggle.setAttribute('aria-pressed', theme === 'dark');
    }
    
    /**
     * Toggle between dark and light themes
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Update theme
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('themePreference', newTheme);
        this.updateThemeButton(newTheme);
        
        // Show toast
        this.showToast(`Тема изменена: ${newTheme === 'dark' ? 'Тёмная' : 'Светлая'}`);
    }
    
    /**
     * Setup slider functionality
     */
    setupSlider() {
        const updateSlider = () => {
            const value = parseInt(this.elements.sliderInput.value);
            const min = parseInt(this.elements.sliderInput.min);
            const max = parseInt(this.elements.sliderInput.max);
            
            const percentage = ((value - min) / (max - min)) * 100;
            
            // Update visual elements
            this.elements.sliderFill.style.width = `${percentage}%`;
            this.elements.lengthValue.textContent = value;
            
            // Generate new password
            this.generatePassword();
        };
        
        this.elements.sliderInput.addEventListener('input', updateSlider);
        updateSlider(); // Initial update
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Generate password
        this.elements.generateButton.addEventListener('click', () => {
            if (!this.isGenerating) {
                this.generateAndCopy();
            }
        });
        
        // Refresh password
        this.elements.refreshButton.addEventListener('click', () => {
            this.generatePassword();
        });
        
        // Copy password
        this.elements.copyButton.addEventListener('click', () => this.copyPassword());
        
        // Character type switches
        [this.elements.lowercaseSwitch, this.elements.uppercaseSwitch, 
         this.elements.numbersSwitch, this.elements.specialSwitch].forEach(switchEl => {
            switchEl.addEventListener('change', () => this.generatePassword());
        });
    }
    
    /**
     * Get character pool based on selected options
     */
    getCharPool() {
        let pool = '';
        
        if (this.elements.lowercaseSwitch.checked) pool += CONFIG.charSets.lowercase;
        if (this.elements.uppercaseSwitch.checked) pool += CONFIG.charSets.uppercase;
        if (this.elements.numbersSwitch.checked) pool += CONFIG.charSets.numbers;
        if (this.elements.specialSwitch.checked) pool += CONFIG.charSets.special;
        
        return pool;
    }
    
    /**
     * Calculate password strength
     */
    calculateStrength(password, charPool) {
        if (!password || !charPool) return 0;
        
        const poolSize = charPool.length;
        const length = password.length;
        
        // Basic strength calculation
        const strength = length * Math.log2(poolSize);
        
        // Bonus for character variety
        let varietyBonus = 0;
        if (/[a-z]/.test(password)) varietyBonus += 10;
        if (/[A-Z]/.test(password)) varietyBonus += 10;
        if (/[0-9]/.test(password)) varietyBonus += 10;
        if (/[^a-zA-Z0-9]/.test(password)) varietyBonus += 10;
        
        return strength + varietyBonus;
    }
    
    /**
     * Get strength level
     */
    getStrengthLevel(strength) {
        if (strength < 30) return CONFIG.strengthLevels[0];
        if (strength < 45) return CONFIG.strengthLevels[1];
        if (strength < 60) return CONFIG.strengthLevels[2];
        if (strength < 75) return CONFIG.strengthLevels[3];
        if (strength < 90) return CONFIG.strengthLevels[4];
        return CONFIG.strengthLevels[5];
    }
    
    /**
     * Generate a secure password
     */
    generatePassword() {
        const charPool = this.getCharPool();
        const length = parseInt(this.elements.sliderInput.value);
        
        if (!charPool) {
            this.showToast('Выберите хотя бы один тип символов');
            this.updateDisplay('Выберите типы символов');
            this.updateStrength('', '');
            return '';
        }
        
        try {
            // Use Web Crypto API for secure random generation
            const array = new Uint32Array(length);
            window.crypto.getRandomValues(array);
            
            let password = '';
            for (let i = 0; i < length; i++) {
                password += charPool[array[i] % charPool.length];
            }
            
            this.currentPassword = password;
            this.updateDisplay(password);
            this.updateStrength(password, charPool);
            
            return password;
        } catch (error) {
            console.error('Web Crypto API error, using fallback:', error);
            return this.generateFallbackPassword(length, charPool);
        }
    }
    
    /**
     * Fallback password generation
     */
    generateFallbackPassword(length, charPool) {
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charPool[Math.floor(Math.random() * charPool.length)];
        }
        
        this.currentPassword = password;
        this.updateDisplay(password);
        this.updateStrength(password, charPool);
        
        return password;
    }
    
    /**
     * Update password display
     */
    updateDisplay(password) {
        this.elements.passwordOutput.textContent = password;
    }
    
    /**
     * Update strength indicator
     */
    updateStrength(password, charPool) {
        if (!password) {
            this.elements.strengthBadge.textContent = '—';
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
    
    /**
     * Generate and copy password
     */
    async generateAndCopy() {
        if (this.isGenerating) return;
        
        this.isGenerating = true;
        
        // Button animation
        this.elements.generateButton.disabled = true;
        const originalText = this.elements.generateButton.querySelector('.generate-button-text').textContent;
        this.elements.generateButton.querySelector('.generate-button-text').textContent = 'Генерация...';
        
        const password = this.generatePassword();
        
        if (!password) {
            this.resetGenerateButton(originalText);
            this.isGenerating = false;
            return;
        }
        
        // Small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await this.copyPassword();
        
        // Reset button
        this.resetGenerateButton(originalText);
        this.isGenerating = false;
    }
    
    /**
     * Reset generate button
     */
    resetGenerateButton(originalText) {
        this.elements.generateButton.disabled = false;
        this.elements.generateButton.querySelector('.generate-button-text').textContent = originalText;
    }
    
    /**
     * Copy password to clipboard
     */
    async copyPassword() {
        if (!this.currentPassword) {
            this.showToast('Сначала сгенерируйте пароль');
            return false;
        }
        
        try {
            await navigator.clipboard.writeText(this.currentPassword);
            this.showToast('Пароль скопирован');
            this.updateCopyButtonFeedback();
            return true;
        } catch (err) {
            console.error('Clipboard API error:', err);
            return this.copyFallback();
        }
    }
    
    /**
     * Fallback copy method
     */
    copyFallback() {
        const textArea = document.createElement('textarea');
        textArea.value = this.currentPassword;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            const success = document.execCommand('copy');
            if (success) {
                this.showToast('Пароль скопирован');
                return true;
            } else {
                this.showToast('Не удалось скопировать');
                return false;
            }
        } catch (err) {
            this.showToast('Не удалось скопировать');
            return false;
        } finally {
            document.body.removeChild(textArea);
        }
    }
    
    /**
     * Update copy button feedback
     */
    updateCopyButtonFeedback() {
        const icon = this.elements.copyButton.querySelector('.action-button-icon');
        icon.textContent = '✓';
        setTimeout(() => {
            icon.textContent = '📋';
        }, 2000);
    }
    
    /**
     * Show toast notification
     */
    showToast(message) {
        this.elements.toast.textContent = message;
        this.elements.toast.classList.add('show');
        
        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, 2000);
    }
    
    /**
     * Setup PWA installation
     */
    setupPWA() {
        let pwaDismissed = localStorage.getItem('pwaDismissed') === 'true';
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            
            if (!pwaDismissed) {
                setTimeout(() => {
                    this.elements.pwaBanner.hidden = false;
                    this.elements.pwaBanner.classList.add('show');
                }, 3000);
            }
        });
        
        window.addEventListener('appinstalled', () => {
            this.elements.pwaBanner.classList.remove('show');
            this.showToast('Приложение установлено');
        });
        
        this.elements.pwaInstallButton.addEventListener('click', async () => {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('PWA установлено');
                }
                this.deferredPrompt = null;
            }
            this.elements.pwaBanner.classList.remove('show');
        });
        
        this.elements.pwaLaterButton.addEventListener('click', () => {
            localStorage.setItem('pwaDismissed', 'true');
            this.elements.pwaBanner.classList.remove('show');
        });
    }
    
    /**
     * Prevent zoom
     */
    preventZoom() {
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
        document.addEventListener('gestureend', (e) => e.preventDefault());
    }
}

// GitHub Pages initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize app
        const app = new PasswordGenerator();
        
        // Store app reference globally for debugging
        window.passwordGenerator = app;
        
        console.log('Password Generator ready for GitHub Pages');
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        
        // Show error message
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.innerHTML = `
                <div style="text-align: center; padding: 20px; color: white;">
                    <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                    <h3 style="margin-bottom: 10px;">Ошибка загрузки</h3>
                    <p>Не удалось загрузить приложение. Пожалуйста, обновите страницу.</p>
                    <button onclick="location.reload()" style="
                        background: #0a84ff;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 16px;
                        margin-top: 20px;
                        cursor: pointer;
                    ">Обновить страницу</button>
                </div>
            `;
        }
    }
});