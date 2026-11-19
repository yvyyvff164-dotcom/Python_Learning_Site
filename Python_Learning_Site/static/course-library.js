(() => {
    const key = 'pls_bookmarks_v1';
    const button = document.getElementById('lesson-bookmark');
    const form = document.getElementById('lesson-filters');

    function savedLessons() {
        try {
            const items = JSON.parse(localStorage.getItem(key));
            return new Set(Array.isArray(items) ? items.filter(item => typeof item === 'string') : []);
        } catch {
            return new Set();
        }
    }

    function onStoredChange(event) {
        if (event.key === key || event.key === null) updateBookmark();
        if (form && [key, 'pls_progress_v1', null].includes(event.key)) updateFilters();
    }

    function updateBookmark() {
        if (!button) return;
        const saved = savedLessons().has(location.pathname);
        button.setAttribute('aria-pressed', String(saved));
        button.querySelector('.bookmark-symbol').textContent = saved ? '★' : '☆';
        button.querySelector('.bookmark-label').textContent = saved ? window.courseText("Сақталған", "Сохранено") : window.courseText("Сақтау", "Сохранить");
        button.setAttribute('aria-label', saved ? window.courseText("Сабақты сақталғандардан алып тастау", "Убрать урок из сохранённых") : window.courseText("Сабақты сақталғандарға қосу", "Добавить урок в сохранённые"));
    }

    if (button) {
        button.hidden = false;
        updateBookmark();
        button.addEventListener('click', () => {
            const saved = savedLessons();
            if (saved.has(location.pathname)) saved.delete(location.pathname);
            else saved.add(location.pathname);
            const feedback = document.getElementById('bookmark-feedback');
            try {
                localStorage.setItem(key, JSON.stringify([...saved]));
                feedback.textContent = '';
                updateBookmark();
            } catch {
                feedback.textContent = window.courseText("Браузер бұл өзгерісті сақтай алмады.", "Не удалось сохранить изменение в браузере.");
            }
        });
    }

    window.addEventListener('storage', onStoredChange);
    window.addEventListener('pageshow', event => {
        if (event.persisted) {
            updateBookmark();
            if (form) updateFilters();
        }
    });
    if (!form) return;

    const search = document.getElementById('lesson-search');
    const filter = document.getElementById('lesson-filter');
    const reset = document.getElementById('library-reset');
    const status = document.getElementById('library-results');
    const groups = Array.from(document.querySelectorAll('#course-levels-list .lv')).map(group => {
        const level = group.querySelector('.lv-title').textContent;
        const rows = Array.from(group.querySelectorAll('li[data-keywords]')).map(row => {
            const link = row.querySelector('a');
            const text = [level, link.textContent, row.dataset.keywords].join(' ');
            return {row, url: link.dataset.url, text: normalize(text)};
        });
        return {group, rows};
    });
    let openBeforeFilter = null;

    function normalize(text) {
        return text.normalize('NFKC').trim().toLocaleLowerCase(document.documentElement.lang).replace(/\s+/g, ' ');
    }

    function updateFilters() {
        const terms = normalize(search.value).split(' ').filter(Boolean);
        const mode = filter.value;
        const active = terms.length > 0 || mode !== 'all';
        if (active && openBeforeFilter === null) {
            openBeforeFilter = new Set(groups.filter(({group}) => group.open).map(({group}) => group));
        }
        const saved = savedLessons();
        const {done} = window.PLS.load();
        let count = 0;
        for (const {group, rows} of groups) {
            let matches = 0;
            for (const {row, url, text} of rows) {
                const inScope = mode === 'all' || (mode === 'saved' && saved.has(url))
                    || (mode === 'done' && done[url]) || (mode === 'unfinished' && !done[url]);
                const show = inScope && terms.every(term => text.includes(term));
                row.hidden = !show;
                if (show) matches++;
            }
            count += matches;
            group.hidden = active && !matches;
            if (active) group.open = Boolean(matches);
            else if (openBeforeFilter !== null) group.open = openBeforeFilter.has(group);
        }
        if (!active) openBeforeFilter = null;
        reset.hidden = !active;
        status.textContent = !active ? '' : count ? window.courseText("Табылған сабақ саны — ", "Найдено уроков — ") + count
            : mode === 'saved' && !saved.size ? window.courseText("Сақталған сабақтар әзірге жоқ. Қажетті сабақтың бетінде «Сақтау» батырмасын басыңыз.", "У вас пока нет сохранённых уроков. Откройте нужный урок и нажмите «Сохранить».")
            : window.courseText("Сабақ табылмады. Басқа сөз енгізіңіз немесе сүзгіні тазалаңыз.", "Уроки не найдены. Введите другое слово или сбросьте фильтр.");
    }

    form.addEventListener('input', updateFilters);
    form.addEventListener('submit', event => event.preventDefault());
    form.addEventListener('reset', event => {
        event.preventDefault();
        search.value = '';
        filter.value = 'all';
        updateFilters();
        search.focus();
    });
    form.hidden = false;
    updateFilters();
})();
