(function() {
    try {
        const savedTheme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (systemDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-no-transition', '');
        const isDark = theme === 'dark';
        const sk = document.getElementById('skeleton');
        if (sk) {
            sk.style.background = isDark ? '#000' : '#fff';
            sk.querySelectorAll('.sk-header,.sk-subtitle,.sk-field,.sk-section').forEach(el => {
                el.style.background = isDark ? '#2C2C2E' : '#E5E5EA';
            });
            const btn = sk.querySelector('.sk-btn');
            if (btn) btn.style.background = isDark ? '#0A84FF' : '#007AFF';
        }
    } catch(e) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
})();
