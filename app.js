class PasswordGenerator {
    constructor() {
        this.CONFIG = {
            charSets: {
                lowercase: 'abcdefghijklmnopqrstuvwxyz',
                uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                numbers: '0123456789',
                symbols: '!@#$%^&*'
            },
            strengthLevels: [
                { name: 'Очень слабый', color: '#ff3b30', width: '20%', description: 'Используйте больше символов' },
                { name: 'Слабый', color: '#ff9500', width: '35%', description: 'Добавьте разные типы символов' },
                { name: 'Средний', color: '#ffcc00', width: '50%', description: 'Хорошо для простых аккаунтов' },
                { name: 'Хороший', color: '#34c759', width: '65%', description: 'Надежный пароль' },
                { name: 'Сильный', color: '#007aff', width: '80%', description: 'Отлично для важных аккаунтов' },
                { name: 'Очень сильный', color: '#5856d6', width: '95%', description: 'Максимальная безопасность' }
            ],
            minLength: 8,
            maxLength: 32,
            defaultLength: 16
        };

        this.currentPassword = '';
        this.isGenerating = false;
        this.deferredPrompt = null;
        this.isTouchDevice = 'ontouchstart' in window;
        this.touchTimer = null;
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupTheme();
        this.setupPWA();
        this.generateInitialPassword();
        
        this.updateSafeAreas();
        window.addEventListener('resize', () => this.updateSafeAreas());
    }

    updateSafeAreas() {
        const safeAreaTop = 'env(safe-area-inset-top, 0px)';
        const safeAreaBottom = 'env(safe-area-inset-bottom, 0px)';
        const safeAreaLeft = 'env(safe-area-inset-left, 0px)';
        const safeAreaRight = 'env(safe-area-inset-right, 0px)';
        
        document.documentElement.style.setProperty('--safe-area-top', safeAreaTop);
        document.documentElement.style.setProperty('--safe-area-bottom', safeAreaBottom);
        document.documentElement.style.setProperty('--safe-area-left', safeAreaLeft);
        document.documentElement.style.setProperty('--safe-area-right', safeAreaRight);
        
        const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (isPWA) {
            document.body.classList.add('pwa-mode');
        }
    }

    cacheElements() {
        this.elements = {
            passwordOutput: document.getElementById('passwordOutput'),
            generateButton: document.getElementById('generateButton'),
            shareButton: document.getElementById('shareButton'),
            themeToggle: document.getElementById('themeToggle'),
            
            strengthBadge: document.getElementById('strengthBadge'),
            strengthFill: document.getElementById('strengthFill'),
            strengthDescription: document.getElementById('strengthDescription'),
            
            lengthSlider: document.getElementById('lengthSlider'),
            lengthValue: document.getElementById('lengthValue'),
            sliderFill: document.getElementById('sliderFill'),
            
            lowercaseToggle: document.getElementById('lowercaseToggle'),
            uppercaseToggle: document.getElementById('uppercaseToggle'),
            numbersToggle: document.getElementById('numbersToggle'),
            symbolsToggle: document.getElementById('symbolsToggle'),
            
            toast: document.getElementById('toast'),
            pwaBanner: document.getElementById('pwaBanner'),
            pwaInstall: document.getElementById('pwaInstall'),
            pwaDismiss: document.getElementById('pwaDismiss')
        };
    }

    bindEvents() {
        const addTouchHandler = (element, handler) => {
            if (this.isTouchDevice) {
                element.addEventListener('touchstart', (e) => {
                    if (e.cancelable && e.target === element) {
                        e.preventDefault();
                    }
                    handler(e);
                }, { passive: false });
            }
            element.addEventListener('click', handler);
        };

        addTouchHandler(this.elements.generateButton, () => this.generateAndCopy());
        addTouchHandler(this.elements.shareButton, () => this.sharePassword());
        addTouchHandler(this.elements.themeToggle, () => this.toggleTheme());
        
        this.elements.lengthSlider.addEventListener('input', () => this.updateSlider());
        this.elements.lengthSlider.addEventListener('change', () => this.generatePassword());
        
        document.querySelectorAll('.toggle-item').forEach(item => {
            const toggleId = item.getAttribute('data-for');
            const toggle = document.getElementById(toggleId);
            
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.ios-toggle')) {
                    toggle.checked = !toggle.checked;
                    toggle.dispatchEvent(new Event('change'));
                    
                    item.style.backgroundColor = 'var(--system-background-tertiary)';
                    setTimeout(() => {
                        item.style.backgroundColor = '';
                    }, 150);
                }
            });
            
            toggle.addEventListener('change', () => this.generatePassword());
        });

        addTouchHandler(this.elements.pwaInstall, () => this.installPWA());
        addTouchHandler(this.elements.pwaDismiss, () => this.dismissPWA());
        
        this.elements.passwordOutput.addEventListener('click', () => this.copyPassword());
        
        this.elements.passwordOutput.addEventListener('touchstart', (e) => {
            this.touchTimer = setTimeout(() => {
                this.copyPassword();
                if (e.cancelable) {
                    e.preventDefault();
                }
            }, 500);
        });
        
        this.elements.passwordOutput.addEventListener('touchend', (e) => {
            clearTimeout(this.touchTimer);
        });
        
        this.elements.passwordOutput.addEventListener('touchmove', (e) => {
            clearTimeout(this.touchTimer);
        });
        
        document.addEventListener('touchmove', (e) => {
            if (e.scale !== undefined && e.scale !== 1 && e.cancelable) {
                e.preventDefault();
            }
        }, { passive: false });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300 && e.cancelable) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.updateSafeAreas(), 100);
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

    generateInitialPassword() {
        this.updateSlider();
        this.generatePassword();
    }

    getCharacterPool() {
        let pool = '';
        if (this.elements.lowercaseToggle.checked) pool += this.CONFIG.charSets.lowercase;
        if (this.elements.uppercaseToggle.checked) pool += this.CONFIG.charSets.uppercase;
        if (this.elements.numbersToggle.checked) pool += this.CONFIG.charSets.numbers;
        if (this.elements.symbolsToggle.checked) pool += this.CONFIG.charSets.symbols;
        return pool;
    }

    calculatePasswordStrength(password, charPool) {
        if (!password || !charPool) return 0;
        
        const length = password.length;
        const poolSize = charPool.length;
        
        let entropy = length * Math.log2(poolSize);
        
        let diversityBonus = 0;
        if (/[a-z]/.test(password)) diversityBonus += 10;
        if (/[A-Z]/.test(password)) diversityBonus += 15;
        if (/[0-9]/.test(password)) diversityBonus += 10;
        if (/[^a-zA-Z0-9]/.test(password)) diversityBonus += 20;
        
        const uniqueChars = new Set(password).size;
        const repeatPenalty = (length - uniqueChars) * 2;
        
        return Math.max(0, entropy + diversityBonus - repeatPenalty);
    }

    getStrengthLevel(strength) {
        if (strength < 30) return this.CONFIG.strengthLevels[0];
        if (strength < 45) return this.CONFIG.strengthLevels[1];
        if (strength < 60) return this.CONFIG.strengthLevels[2];
        if (strength < 75) return this.CONFIG.strengthLevels[3];
        if (strength < 90) return this.CONFIG.strengthLevels[4];
        return this.CONFIG.strengthLevels[5];
    }

    updateStrengthIndicator(password, charPool) {
        if (!password) {
            this.elements.strengthBadge.textContent = '—';
            this.elements.strengthBadge.style.backgroundColor = '#8e8e93';
            this.elements.strengthFill.style.width = '0%';
            this.elements.strengthDescription.textContent = 'Сгенерируйте пароль';
            return;
        }
        
        const strength = this.calculatePasswordStrength(password, charPool);
        const level = this.getStrengthLevel(strength);
        
        this.elements.strengthBadge.textContent = level.name;
        this.elements.strengthBadge.style.backgroundColor = level.color;
        this.elements.strengthFill.style.width = level.width;
        this.elements.strengthFill.style.backgroundColor = level.color;
        this.elements.strengthDescription.textContent = level.description;
    }

    generatePassword() {
        const charPool = this.getCharacterPool();
        const length = parseInt(this.elements.lengthSlider.value);
        
        if (!charPool) {
            this.showToast('Выберите хотя бы один тип символов', 'error');
            this.elements.passwordOutput.textContent = 'Выберите типы символов';
            this.updateStrengthIndicator('', '');
            this.elements.shareButton.disabled = true;
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
            this.updateStrengthIndicator(password, charPool);
            this.elements.shareButton.disabled = false;
            
            return password;
        } catch (error) {
            return this.generateFallbackPassword(length, charPool);
        }
    }

    generateFallbackPassword(length, charPool) {
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomArray = new Uint32Array(1);
            window.crypto.getRandomValues(randomArray);
            const randomIndex = Math.floor(randomArray[0] / (0xFFFFFFFF + 1) * charPool.length);
            password += charPool[randomIndex];
        }
        
        this.currentPassword = password;
        this.elements.passwordOutput.textContent = password;
        this.updateStrengthIndicator(password, charPool);
        this.elements.shareButton.disabled = false;
        
        return password;
    }

    async generateAndCopy() {
        if (this.isGenerating) return;
        
        this.isGenerating = true;
        const button = this.elements.generateButton;
        const originalText = button.querySelector('.button-text').textContent;
        const originalIcon = button.querySelector('.button-icon').textContent;
        
        button.querySelector('.button-text').textContent = 'Генерация...';
        button.querySelector('.button-icon').textContent = '⏳';
        button.disabled = true;
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const password = this.generatePassword();
        
        if (password) {
            await this.copyPassword();
            button.querySelector('.button-text').textContent = 'Скопировано!';
            button.querySelector('.button-icon').textContent = '✓';
            
            setTimeout(() => {
                button.querySelector('.button-text').textContent = originalText;
                button.querySelector('.button-icon').textContent = originalIcon;
                button.disabled = false;
                this.isGenerating = false;
            }, 1500);
        } else {
            button.querySelector('.button-text').textContent = originalText;
            button.querySelector('.button-icon').textContent = originalIcon;
            button.disabled = false;
            this.isGenerating = false;
        }
    }

    async copyPassword() {
        if (!this.currentPassword) {
            this.showToast('Сначала сгенерируйте пароль', 'error');
            return false;
        }
        
        try {
            await navigator.clipboard.writeText(this.currentPassword);
            this.showToast('Пароль скопирован в буфер обмена');
            return true;
        } catch (err) {
            return this.fallbackCopy();
        }
    }

    fallbackCopy() {
        const textarea = document.createElement('textarea');
        textarea.value = this.currentPassword;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            
            if (success) {
                this.showToast('Пароль скопирован');
                return true;
            }
        } catch (err) {
            console.error('Резервное копирование не удалось:', err);
        }
        
        this.showToast('Не удалось скопировать', 'error');
        return false;
    }

    async sharePassword() {
        if (!this.currentPassword) {
            this.showToast('Сначала сгенерируйте пароль', 'error');
            return;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Безопасный пароль',
                    text: `Вот сгенерированный пароль: ${this.currentPassword}`,
                    url: window.location.href
                });
                this.showToast('Пароль отправлен');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    this.fallbackShare();
                }
            }
        } else {
            this.fallbackShare();
        }
    }

    fallbackShare() {
        if (!this.currentPassword) return;
        
        const textArea = document.createElement('textarea');
        textArea.value = `Пароль: ${this.currentPassword}\nСгенерировано с помощью Генератора паролей: ${window.location.href}`;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                this.showToast('Текст пароля скопирован для отправки');
            } else {
                this.showToast('Скопируйте пароль вручную', 'error');
            }
        } catch (err) {
            console.error('Не удалось скопировать текст:', err);
            this.showToast('Скопируйте пароль вручную', 'error');
            document.body.removeChild(textArea);
        }
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('password-generator-theme');
        
        if (savedTheme === 'dark' || savedTheme === 'light') {
            this.applyTheme(savedTheme);
        } else {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const defaultTheme = systemPrefersDark ? 'dark' : 'light';
            this.applyTheme(defaultTheme);
        }
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            const savedTheme = localStorage.getItem('password-generator-theme');
            if (!savedTheme) {
                const newTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(newTheme);
            }
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon(theme);
        
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#000000' : '#007AFF');
        }
    }

    updateThemeIcon(theme) {
        const icon = this.elements.themeToggle.querySelector('.theme-icon');
        if (theme === 'dark') {
            icon.textContent = '☀️';
        } else {
            icon.textContent = '🌙';
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        localStorage.setItem('password-generator-theme', newTheme);
        this.applyTheme(newTheme);
        this.showToast(`Тема: ${newTheme === 'dark' ? 'Тёмная' : 'Светлая'}`);
    }

    showToast(message, type = 'success') {
        const toast = this.elements.toast;
        toast.textContent = message;
        toast.className = 'ios-toast';
        
        if (type === 'error') {
            toast.style.background = 'rgba(255, 59, 48, 0.9)';
        } else {
            toast.style.background = '';
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    setupPWA() {
        const pwaDismissed = localStorage.getItem('pwa-dismissed') === 'true';
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            
            if (!pwaDismissed) {
                setTimeout(() => {
                    this.showPWABanner();
                }, 5000);
            }
        });
        
        window.addEventListener('appinstalled', () => {
            this.hidePWABanner();
            this.showToast('Приложение установлено! Работает без интернета.');
            localStorage.setItem('pwa-dismissed', 'true');
            document.body.classList.add('pwa-mode');
        });
        
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            document.body.classList.add('pwa-mode');
            this.hidePWABanner();
        }
    }

    showPWABanner() {
        if (this.elements.pwaBanner && this.deferredPrompt) {
            this.elements.pwaBanner.hidden = false;
            setTimeout(() => {
                this.elements.pwaBanner.classList.add('show');
            }, 100);
        }
    }

    hidePWABanner() {
        if (this.elements.pwaBanner) {
            this.elements.pwaBanner.classList.remove('show');
            setTimeout(() => {
                this.elements.pwaBanner.hidden = true;
            }, 400);
        }
    }

    async installPWA() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                this.showToast('Приложение установлено! Работает без интернета.');
            }
            
            this.deferredPrompt = null;
        }
        this.hidePWABanner();
        localStorage.setItem('pwa-dismissed', 'true');
    }

    dismissPWA() {
        this.hidePWABanner();
        localStorage.setItem('pwa-dismissed', 'true');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.passwordGenerator = new PasswordGenerator();
    }, 100);
});

if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(() => {
        window.passwordGenerator = new PasswordGenerator();
    }, 100);
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const basePath = window.location.pathname.includes('/') 
            ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)
            : './';
        
        navigator.serviceWorker.register(`${basePath}sw.js`)
            .then(registration => {
                console.log('ServiceWorker зарегистрирован:', registration.scope);
            })
            .catch(error => {
                console.log('Регистрация ServiceWorker не удалась:', error);
            });
    });
}