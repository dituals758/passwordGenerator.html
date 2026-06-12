const LOCALES = {
    ru: {
        appTitle: 'Генератор паролей',
        appSubtitle: 'Быстрое создание надёжных паролей. Полностью офлайн — ваши данные остаются на устройстве.',

        modePassword: 'Пароль',
        modePassphrase: 'Фраза',

        settingsTitle: 'Настройки',
        settingsBasic: 'Основные',
        settingsLength: 'Длина пароля:',
        settingsLengthUnit: 'симв.',
        settingsLowercase: 'Строчные буквы (a-z)',
        settingsUppercase: 'Заглавные буквы (A-Z)',
        settingsNumbers: 'Цифры (0-9)',
        settingsSpecial: 'Специальные символы',
        settingsAdvanced: 'Дополнительные',
        settingsExcludeSimilar: 'Без похожих символов (0 O 1 l I |)',
        settingsExcludeRepeating: 'Без повторов подряд',
        settingsOnlyUnique: 'Только уникальные символы',

        passphraseTitle: 'Фраза',
        passphraseDesc: 'Парольная фраза — это серия случайных слов (например: Correct-Horse-Battery-Staple). Легко запомнить, при этом крайне устойчива к подбору за счёт длины.',
        passphraseWordCount: 'Кол-во слов:',
        passphraseCapitalize: 'Заглавная буква в каждом слове',
        passphraseAppendNumber: 'Добавить цифру в конец',

        featuresTitle: 'Возможности',
        featureOffline: 'Генерация на вашем устройстве — данные никуда не отправляются.',
        featureCopy: 'Одно нажатие — пароль скопирован и готов к использованию.',
        featurePwa: 'Работает офлайн. Установите как приложение на свой смартфон.',
        featureTheme: 'Тёмная и светлая тема автоматически подстраиваются под систему.',

        historyTitle: 'История',
        historyEmpty: 'Здесь появятся ваши пароли',
        historyClear: 'Очистить',
        msgNoHistory: 'Нет паролей для экспорта',

        footerName: 'Генератор паролей',
        footerVersion: 'Версия',
        footerLicense: 'MIT',

        modalTitle: 'О приложении',
        modalDesc: 'Бесплатное PWA для генерации криптографически стойких паролей. Работает полностью офлайн.',
        modalVersion: 'Версия',
        modalLicense: 'Лицензия',
        modalAuthor: 'Автор',
        modalContacts: 'Контакты',

        msgNoCharSet: 'Выберите хотя бы один набор символов',
        msgNotEnoughUnique: 'Символов недостаточно для заданной длины',
        msgLengthTooShort: 'Длина не может быть меньше числа наборов символов',
        msgCopied: 'Скопировано',
        msgCreatedAndCopied: 'Пароль создан и скопирован',
        msgCopyFailed: 'Не удалось скопировать',
        msgNotGenerated: 'Сначала создайте пароль',
        msgSettingsReset: 'Настройки сброшены',
        msgInstalled: 'Приложение установлено',
        msgAlreadyInstalled: 'Приложение уже установлено',
        msgInstallCancelled: 'Установка отменена',
        msgUpdateAvailable: 'Доступно обновление. Установить?',
        msgHistoryCleared: 'История очищена',
        msgInstallIOS: 'Нажмите «Поделиться» → «На экран «Домой»»',

        strengthWeak: 'Слабый',
        strengthMedium: 'Средний',
        strengthStrong: 'Надёжный',
        strengthVeryStrong: 'Отличный',

        timeJustNow: 'только что',
        timeMinutes: 'мин',
        timeHours: 'ч',

        tipShare: 'Поделиться паролем',
        tipExport: 'Экспорт истории',
        msgShareFailed: 'Не удалось поделиться',
        msgExported: 'История экспортирована',
        msgExportFailed: 'Не удалось экспортировать',

        tipCopy: 'Копировать пароль',
        tipReset: 'Сбросить настройки',
        tipThemeDark: 'Тёмная тема',
        tipThemeLight: 'Светлая тема',
        tipInstall: 'Установить приложение',
        tipAbout: 'О приложении',
        tipGithub: 'Исходный код',
        tipClose: 'Закрыть',
        tipLength: 'Длина от 8 до 32 символов',
        tipLowercase: 'Буквы a-z',
        tipUppercase: 'Буквы A-Z',
        tipNumbers: 'Цифры 0-9',
        tipSpecial: 'Знаки !@#$% и др.',
        tipExcludeSimilar: 'Убрать похожие: 0 O 1 l I |',
        tipExcludeRepeating: 'Нельзя одинаковые символы подряд',
        tipOnlyUnique: 'Каждый символ встречается только раз',
        tipWordCount: 'От 3 до 8 слов',
        tipCapitalize: 'Делать первую букву заглавной',
        tipAppendNumber: 'Добавить случайное число в конец',
        tipClearHistory: 'Очистить историю',

        ariaPassword: 'Сгенерированный пароль',
        ariaCopy: 'Копировать',
        ariaShare: 'Поделиться',
        ariaExport: 'Экспорт',
        ariaGenerate: 'Создать и скопировать пароль',
        ariaLength: 'Длина пароля от 8 до 32 символов',
        ariaLowercase: 'Использовать строчные буквы',
        ariaUppercase: 'Использовать заглавные буквы',
        ariaNumbers: 'Использовать цифры',
        ariaSpecial: 'Использовать специальные символы',
        ariaExcludeSimilar: 'Исключить похожие символы',
        ariaExcludeRepeating: 'Исключить повторы подряд',
        ariaOnlyUnique: 'Только уникальные символы',
        ariaWordCount: 'Количество слов от 3 до 8',
        ariaCapitalize: 'Заглавная буква в каждом слове',
        ariaAppendNumber: 'Добавить цифру в конец',
        ariaReset: 'Сбросить настройки',
        ariaTheme: 'Переключить тему',
        ariaInstall: 'Установить приложение',
        ariaAbout: 'О приложении',
        ariaClose: 'Закрыть',
        ariaClearHistory: 'Очистить историю',
        ariaModePassword: 'Режим: пароль',
        ariaModePassphrase: 'Режим: фраза',
        ariaCopyHistory: 'Копировать из истории',
        ariaDeleteHistory: 'Удалить из истории'
    },

    en: {
        appTitle: 'Password Generator',
        appSubtitle: 'Create strong passwords instantly. Fully offline — your data stays on your device.',

        modePassword: 'Password',
        modePassphrase: 'Passphrase',

        settingsTitle: 'Settings',
        settingsBasic: 'Basic',
        settingsLength: 'Length:',
        settingsLengthUnit: 'chars',
        settingsLowercase: 'Lowercase (a-z)',
        settingsUppercase: 'Uppercase (A-Z)',
        settingsNumbers: 'Numbers (0-9)',
        settingsSpecial: 'Special characters',
        settingsAdvanced: 'Advanced',
        settingsExcludeSimilar: 'No similar chars (0 O 1 l I |)',
        settingsExcludeRepeating: 'No consecutive repeats',
        settingsOnlyUnique: 'Unique characters only',

        passphraseTitle: 'Passphrase',
        passphraseDesc: 'A passphrase is a series of random words (e.g., Correct-Horse-Battery-Staple). Easy to remember, yet extremely resistant to guessing due to its length.',
        passphraseWordCount: 'Words:',
        passphraseCapitalize: 'Capitalize each word',
        passphraseAppendNumber: 'Add number at end',

        featuresTitle: 'Features',
        featureOffline: 'Generated on your device — nothing is sent anywhere.',
        featureCopy: 'One tap — password copied and ready to use.',
        featurePwa: 'Works offline. Install it as an app on your phone.',
        featureTheme: 'Dark and light themes auto-match your system settings.',

        historyTitle: 'History',
        historyEmpty: 'Your passwords will appear here',
        historyClear: 'Clear',
        msgNoHistory: 'No passwords to export',

        footerName: 'Password Generator',
        footerVersion: 'Version',
        footerLicense: 'MIT',

        modalTitle: 'About',
        modalDesc: 'Free PWA for generating cryptographically strong passwords. Works fully offline.',
        modalVersion: 'Version',
        modalLicense: 'License',
        modalAuthor: 'Author',
        modalContacts: 'Contacts',

        msgNoCharSet: 'Select at least one character set',
        msgNotEnoughUnique: 'Not enough unique characters for this length',
        msgLengthTooShort: 'Length must be at least the number of character sets',
        msgCopied: 'Copied',
        msgCreatedAndCopied: 'Password created and copied',
        msgCopyFailed: 'Failed to copy',
        msgNotGenerated: 'Generate a password first',
        msgSettingsReset: 'Settings reset',
        msgInstalled: 'App installed',
        msgAlreadyInstalled: 'Already installed',
        msgInstallCancelled: 'Installation cancelled',
        msgUpdateAvailable: 'Update available. Install now?',
        msgHistoryCleared: 'History cleared',
        msgInstallIOS: 'Tap "Share" → "Add to Home Screen"',

        strengthWeak: 'Weak',
        strengthMedium: 'Fair',
        strengthStrong: 'Strong',
        strengthVeryStrong: 'Excellent',

        timeJustNow: 'just now',
        timeMinutes: 'min',
        timeHours: 'h',

        tipShare: 'Share password',
        tipExport: 'Export history',
        msgShareFailed: 'Failed to share',
        msgExported: 'History exported',
        msgExportFailed: 'Failed to export',

        tipCopy: 'Copy password',
        tipReset: 'Reset settings',
        tipThemeDark: 'Dark theme',
        tipThemeLight: 'Light theme',
        tipInstall: 'Install app',
        tipAbout: 'About',
        tipGithub: 'Source code',
        tipClose: 'Close',
        tipLength: 'Length from 8 to 32 characters',
        tipLowercase: 'Letters a-z',
        tipUppercase: 'Letters A-Z',
        tipNumbers: 'Digits 0-9',
        tipSpecial: 'Symbols !@#$% etc.',
        tipExcludeSimilar: 'Remove similar: 0 O 1 l I |',
        tipExcludeRepeating: 'No repeated characters in a row',
        tipOnlyUnique: 'Each character used only once',
        tipWordCount: 'From 3 to 8 words',
        tipCapitalize: 'Capitalize first letter of each word',
        tipAppendNumber: 'Add random number at end',
        tipClearHistory: 'Clear history',

        ariaPassword: 'Generated password',
        ariaCopy: 'Copy',
        ariaShare: 'Share',
        ariaExport: 'Export',
        ariaGenerate: 'Create and copy password',
        ariaLength: 'Password length from 8 to 32 characters',
        ariaLowercase: 'Use lowercase letters',
        ariaUppercase: 'Use uppercase letters',
        ariaNumbers: 'Use numbers',
        ariaSpecial: 'Use special characters',
        ariaExcludeSimilar: 'Exclude similar characters',
        ariaExcludeRepeating: 'Exclude consecutive repeats',
        ariaOnlyUnique: 'Unique characters only',
        ariaWordCount: 'Number of words from 3 to 8',
        ariaCapitalize: 'Capitalize each word',
        ariaAppendNumber: 'Add number at end',
        ariaReset: 'Reset settings',
        ariaTheme: 'Toggle theme',
        ariaInstall: 'Install app',
        ariaAbout: 'About',
        ariaClose: 'Close',
        ariaClearHistory: 'Clear history',
        ariaModePassword: 'Mode: password',
        ariaModePassphrase: 'Mode: passphrase',
        ariaCopyHistory: 'Copy from history',
        ariaDeleteHistory: 'Delete from history'
    }
};

function getSystemLang() {
    try {
        const saved = localStorage.getItem('appLang');
        if (saved && LOCALES[saved]) return saved;
    } catch {}
    const sys = navigator.language || navigator.userLanguage || '';
    return sys.startsWith('en') ? 'en' : 'ru';
}

let currentLang = getSystemLang();
let t = LOCALES[currentLang];

function applyTranslations() {
    t = LOCALES[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-tip]').forEach(el => {
        const key = el.getAttribute('data-i18n-tip');
        if (t[key] !== undefined) el.setAttribute('data-tooltip', t[key]);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
    });
    document.documentElement.lang = currentLang;
}
