window.courseText = (kazakh, russian) =>
    document.documentElement.lang === 'ru' ? russian : kazakh;

(() => {
    const key = 'pls_language_view_v1';
    const path = location.pathname + location.search;
    const language = document.documentElement.lang;
    let previous;
    let captureActivity;
    let restoring = false;
    try {
        const saved = JSON.parse(sessionStorage.getItem(key));
        sessionStorage.removeItem(key);
        if (saved?.path === path && saved.language === language) previous = saved;
    } catch {}

    // Keep a page's unfinished project in this tab during a language change.
    window.courseLanguage = {
        get restoring() { return restoring; },
        preserveActivity(capture, restore) {
            captureActivity = capture;
            if (previous?.activity) {
                restoring = true;
                try { restore(previous.activity); } finally { restoring = false; }
            }
        },
        restoreFields(form, values) {
            for (const field of form.elements) {
                if (field.name && typeof values?.[field.name] === 'string') field.value = values[field.name];
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        const menu = document.querySelector('.course-language');
        const links = menu.querySelectorAll('a');
        function keepFragment() {
            for (const link of links) link.hash = location.hash;
        }
        keepFragment();
        window.addEventListener('hashchange', keepFragment);

        menu.addEventListener('click', event => {
            const link = event.target.closest('a[hreflang]');
            if (!link || event.defaultPrevented || event.button !== 0 ||
                event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            if (link.hreflang === language) {
                event.preventDefault();
                return;
            }
            const top = document.querySelector('.course-topbar').getBoundingClientRect().bottom;
            const sections = document.querySelectorAll('main :is(h1,h2,h3,textarea,form,section)[id]');
            let anchor;
            let offset;
            for (const section of sections) {
                const bounds = section.getBoundingClientRect();
                if (bounds.height && bounds.top <= top + 24 && (offset === undefined || bounds.top >= offset)) {
                    anchor = section.id;
                    offset = bounds.top;
                }
            }
            try {
                sessionStorage.setItem(key, JSON.stringify({
                    path, language: link.hreflang, anchor, offset, y: window.scrollY,
                    keyboard: event.detail === 0, activity: captureActivity?.()
                }));
            } catch {}
        });

        if (previous) {
            requestAnimationFrame(() => {
                const anchor = document.getElementById(previous.anchor);
                const target = anchor && Number.isFinite(previous.offset)
                    ? window.scrollY + anchor.getBoundingClientRect().top - previous.offset : previous.y;
                if (Number.isFinite(target)) window.scrollTo({top: target, behavior: 'instant'});
                if (previous.keyboard) menu.querySelector('[aria-current]')?.focus({preventScroll: true});
            });
        }
    }, {once: true});
})();
