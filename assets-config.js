(function() {
    const ASSETS = [
        './',
        './index.html',
        './styles.css',
        './manifest.json',
        './version.js',
        './theme-init.js',
        './script.js',
        './sw.js',
        './assets-config.js',
        './assets/icons/icon-16.png',
        './assets/icons/icon-32.png',
        './assets/icons/icon-48.png',
        './assets/icons/icon-72.png',
        './assets/icons/icon-96.png',
        './assets/icons/icon-144.png',
        './assets/icons/icon-152.png',
        './assets/icons/icon-167.png',
        './assets/icons/icon-180.png',
        './assets/icons/icon-192.png',
        './assets/icons/icon-256.png',
        './assets/icons/icon-384.png',
        './assets/icons/icon-512.png',
        './assets/icons/apple-touch-icon.png'
    ];
    
    self.APP_ASSETS = ASSETS;
    if (typeof window !== 'undefined') {
        window.APP_ASSETS = ASSETS;
    }
})();