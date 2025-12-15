const CONFIG = {
    charSets: {
        lowercase: "abcdefghijklmnopqrstuvwxyz",
        uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", 
        numbers: "0123456789",
        special: "!@#$%^&*"
    },
    passwordLength: {
        min: 8,
        max: 32,
        default: 16
    },
    strengthLevels: {
        low: { name: 'Низкая', class: 'strength-low', minTypes: 1, minLength: 8 },
        medium: { name: 'Средняя', class: 'strength-medium', minTypes: 2, minLength: 12 },
        high: { name: 'Высокая', class: 'strength-high', minTypes: 3, minLength: 16 },
        veryHigh: { name: 'Очень высокая', class: 'strength-very-high', minTypes: 4, minLength: 20 }
    }
};

class PasswordGenerator {
    constructor() {
        this.elements = this.initElements();
        this.state = this.initState();
        this.init();
    }

    initElements() {
        return {
            password: document.getElementById('password'),
            passwordTruncated: document.getElementById('passwordTruncated'),
            passwordHint: document.getElementById('passwordHint'),
            length: document.getElementById('length'),
            lengthValue: document.getElementById('lengthValue'),
            generateBtn: document.getElementById('generateBtn'),
            copyBtn: document.getElementById('copyBtn'),
            notification: document.getElementById('notification'),
            themeToggle: document.getElementById('themeToggle'),
            themeIcon: document.getElementById('themeIcon'),
            strengthText: document.getElementById('strengthText'),
            pwaInstall: document.getElementById('pwaInstall'),
            pwaInstallBtn: document.getElementById('pwaInstallBtn'),
            pwaDismissBtn: document.getElementById('pwaDismissBtn'),
            specialSymbols: document.getElementById('specialSymbols')
        };
    }

    initState() {
        return {
            currentPassword: '',
            pwaDismissed: localStorage.getItem('pwaDismissed') === 'true',
            deferredPrompt: null
        };
    }

    init() {
        this.initTheme();
        this.updateSpecialSymbols();
        this.initPWA();
        this.initEventListeners();
        this.generateInitialPassword();
        
        window.addEventListener('resize', () => this.checkAndShowTruncation());
        
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('ServiceWorker зарегистрирован:', reg.scope))
                    .catch(err => console.log('Ошибка регистрации ServiceWorker:', err));
            });
        }
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 
                          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.elements.themeIcon.style.transform = 'scale(0.8) rotate(180deg)';
        
        setTimeout(() => {
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(newTheme);
            this.elements.themeIcon.style.transform = 'scale(1) rotate(0deg)';
        }, 200);
    }

    updateThemeIcon(theme) {
        this.elements.themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }

    updateSpecialSymbols() {
        this.elements.specialSymbols.textContent = CONFIG.charSets.special;
    }

    generatePassword() {
        const length = parseInt(this.elements.length.value);
        const charPool = this.getCharPool();
        
        if (!charPool) {
            this.showNotification('Выберите хотя бы один тип символов!', 'error');
            return '';
        }

        try {
            const array = new Uint32Array(length);
            window.crypto.getRandomValues(array);
            
            let password = '';
            for (let i = 0; i < length; i++) {
                password += charPool[array[i] % charPool.length];
            }
            
            this.state.currentPassword = password;
            this.updatePasswordStrength(length, this.getSelectedTypesCount());
            return password;
        } catch (error) {
            console.warn('Используется Math.random()');
            return this.generateFallbackPassword(length, charPool);
        }
    }

    getCharPool() {
        let pool = '';
        ['lowercase', 'uppercase', 'numbers', 'special'].forEach(type => {
            if (document.getElementById(type).checked) {
                pool += CONFIG.charSets[type];
            }
        });
        return pool;
    }

    getSelectedTypesCount() {
        return ['lowercase', 'uppercase', 'numbers', 'special']
            .filter(type => document.getElementById(type).checked).length;
    }

    generateFallbackPassword(length, charPool) {
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charPool[Math.floor(Math.random() * charPool.length)];
        }
        this.state.currentPassword = password;
        return password;
    }

    updatePasswordStrength(length, typesCount) {
        let strengthLevel = this.calculateStrengthLevel(length, typesCount);
        
        this.elements.strengthText.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            this.elements.strengthText.textContent = strengthLevel.name;
            this.elements.strengthText.style.backgroundColor = `var(--${strengthLevel.class})`;
            this.elements.strengthText.style.borderColor = `var(--${strengthLevel.class})`;
            this.elements.strengthText.style.transform = 'scale(1)';
        }, 150);
    }

    calculateStrengthLevel(length, typesCount) {
        if (length >= 20 && typesCount >= 4) return CONFIG.strengthLevels.veryHigh;
        if (length >= 16 && typesCount >= 3) return CONFIG.strengthLevels.high;
        if (length >= 12 && typesCount >= 2) return CONFIG.strengthLevels.medium;
        return CONFIG.strengthLevels.low;
    }

    updatePasswordDisplay(password) {
        this.elements.password.style.opacity = '0';
        this.elements.password.style.transform = 'translateY(-5px)';
        
        setTimeout(() => {
            this.elements.password.value = password;
            this.elements.password.style.opacity = '1';
            this.elements.password.style.transform = 'translateY(0)';
            this.checkAndShowTruncation();
        }, 150);
    }

    checkAndShowTruncation() {
        const input = this.elements.password;
        const isTruncated = input.scrollWidth > input.clientWidth;
        
        this.elements.passwordTruncated.style.display = isTruncated ? 'block' : 'none';
        this.elements.passwordHint.style.display = isTruncated ? 'block' : 'none';
        input.title = isTruncated ? 'Полный пароль: ' + this.elements.password.value : 'Пароль для использования';
    }

    async generateAndCopy() {
        this.elements.generateBtn.style.transform = 'scale(0.95)';
        
        const password = this.generatePassword();
        if (!password) {
            this.elements.generateBtn.style.transform = '';
            return;
        }
        
        this.updatePasswordDisplay(password);
        
        setTimeout(async () => {
            await this.copyToClipboard(password);
            
            setTimeout(() => {
                this.elements.generateBtn.style.transform = '';
            }, 100);
        }, 200);
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Пароль скопирован в буфер обмена!');
        } catch (err) {
            this.copyFallback(text);
        }
    }

    copyFallback(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('Пароль скопирован в буфер обмена!');
        } catch (err) {
            this.showNotification('Не удалось скопировать пароль', 'error');
        } finally {
            document.body.removeChild(textArea);
        }
    }

    showNotification(message, type = 'success') {
        this.elements.notification.textContent = message;
        this.elements.notification.className = 'notification dynamic-island';
        if (type === 'error') this.elements.notification.classList.add('error');
        
        this.elements.notification.style.display = 'block';
        
        setTimeout(() => {
            this.elements.notification.classList.add('hiding');
            setTimeout(() => {
                this.elements.notification.style.display = 'none';
                this.elements.notification.classList.remove('hiding', 'error');
            }, 300);
        }, 2000);
    }

    initPWA() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.state.deferredPrompt = e;
            
            if (!this.state.pwaDismissed) {
                setTimeout(() => {
                    this.elements.pwaInstall.style.display = 'block';
                }, 3000);
            }
        });

        window.addEventListener('appinstalled', () => {
            this.elements.pwaInstall.classList.add('hiding');
            setTimeout(() => {
                this.elements.pwaInstall.style.display = 'none';
            }, 300);
        });

        this.elements.pwaInstallBtn.addEventListener('click', async () => {
            if (this.state.deferredPrompt) {
                this.state.deferredPrompt.prompt();
                const { outcome } = await this.state.deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('PWA установлено');
                }
                this.state.deferredPrompt = null;
            }
            this.hidePWAInstall();
        });

        this.elements.pwaDismissBtn.addEventListener('click', () => {
            this.state.pwaDismissed = true;
            localStorage.setItem('pwaDismissed', 'true');
            this.hidePWAInstall();
        });
    }

    hidePWAInstall() {
        this.elements.pwaInstall.classList.add('hiding');
        setTimeout(() => {
            this.elements.pwaInstall.style.display = 'none';
        }, 300);
    }
    initEventListeners() {
        this.elements.length.addEventListener('input', () => this.handleLengthChange());
        this.elements.generateBtn.addEventListener('click', () => this.generateAndCopy());
        this.elements.copyBtn.addEventListener('click', () => this.copyToClipboard(this.state.currentPassword));
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        document.querySelectorAll('.checkbox-label input').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.handleCheckboxChange());
        });
    }

    handleLengthChange() {
        this.updateLengthValue();
        const password = this.generatePassword();
        if (password) this.updatePasswordDisplay(password);
    }

    handleCheckboxChange() {
        const password = this.generatePassword();
        if (password) this.updatePasswordDisplay(password);
    }

    updateLengthValue() {
        this.elements.lengthValue.textContent = this.elements.length.value;
        this.elements.lengthValue.classList.add('updating');
        
        setTimeout(() => {
            this.elements.lengthValue.classList.remove('updating');
        }, 300);
    }

    generateInitialPassword() {
        const password = this.generatePassword();
        if (password) this.updatePasswordDisplay(password);
        this.updateLengthValue();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PasswordGenerator();
});