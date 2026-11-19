(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const key = 'pls_theme_v1';
    let preference = storedPreference();
    let toggle;

    function storedPreference() {
        try {
            const value = localStorage.getItem(key);
            return value === 'dark' || value === 'light' ? value : null;
        } catch {
            return null;
        }
    }

    function setBrowserColor() {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) return;
        const color = toggle && getComputedStyle(root).getPropertyValue('--bg-main').trim();
        meta.content = color || (root.dataset.theme === 'dark' ? '#100c1d' : '#eceafa');
    }

    function applyTheme() {
        const theme = preference ?? (media.matches ? 'dark' : 'light');
        const dark = theme === 'dark';
        root.dataset.theme = theme;
        setBrowserColor();
        if (toggle) {
            toggle.setAttribute('aria-pressed', String(dark));
            toggle.title = dark ? window.courseText("Жарық тақырыпты қосу", "Включить светлую тему") : window.courseText("Қараңғы тақырыпты қосу", "Включить тёмную тему");
            toggle.querySelector('.course-theme-text').textContent = dark ? window.courseText("Қараңғы", "Тёмная") : window.courseText("Жарық", "Светлая");
        }
    }

    applyTheme();
    document.addEventListener('course:skin', setBrowserColor);
    media.addEventListener('change', applyTheme);
    window.addEventListener('storage', event => {
        if (event.key === key || event.key === null) {
            preference = storedPreference();
            applyTheme();
        }
    });
    document.addEventListener('DOMContentLoaded', () => {
        toggle = document.getElementById('course-theme-toggle');
        if (!toggle) return;
        applyTheme();
        toggle.hidden = false;
        toggle.addEventListener('click', () => {
            preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
            try { localStorage.setItem(key, preference); } catch {}
            applyTheme();
        });
    });
})();
