(() => {
    function parseVersions(value) {
        try {
            const record = value ? JSON.parse(value) : null;
            return {
                latest: typeof record?.latest === 'string' ? record.latest : null,
                previous: typeof record?.previous === 'string' ? record.previous : null,
            };
        } catch {
            return {latest: null, previous: null};
        }
    }

    function action(label) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        return button;
    }

    function start() {
        const code = document.querySelector('textarea#code');
        if (!code) return;

        const path = window.location.pathname.replace(/\/+$/, '') || '/';
        const storageKey = 'pls_editor_draft_v1:' + path;
        const starter = code.defaultValue;
        const actionRow = document.getElementById('run-btn')?.closest('.btn-row');
        const oldRestore = document.getElementById('restore-btn');
        const clearOutput = document.getElementById('clear-btn');
        let storageWorks = true;
        let versions = parseVersions(null);
        try {
            versions = parseVersions(localStorage.getItem(storageKey));
        } catch {
            storageWorks = false;
        }

        const panel = document.createElement('div');
        panel.className = 'editor-drafts';
        panel.setAttribute('role', 'group');
        panel.setAttribute('aria-label', window.courseText("Код нұсқалары", "Версии кода"));

        const status = document.createElement('p');
        status.className = 'editor-drafts-status';
        status.setAttribute('role', 'status');

        const buttons = document.createElement('div');
        buttons.className = 'editor-drafts-actions';
        const restore = oldRestore || action(window.courseText("Бастапқы кодты қайтару", "Вернуть исходный код"));
        const resume = action(window.courseText("Сақталған кодты ашу", "Открыть сохранённый код"));
        const previous = action(window.courseText("Алдыңғы нұсқаны ашу", "Открыть предыдущую версию"));
        buttons.append(restore, resume, previous);
        panel.append(status, buttons);
        (actionRow || code.closest('.editor-container') || code).after(panel);

        if (versions.latest !== null) code.value = versions.latest;
        let displayedValue = code.value;
        let previewing = versions.latest === null;

        function showStatus(message) {
            restore.hidden = code.value === starter;
            resume.hidden = versions.latest === null || code.value === versions.latest;
            previous.hidden = versions.previous === null || code.value === versions.previous;

            if (!storageWorks) {
                message = window.courseText("Браузерге сақтау мүмкін болмады. Соңғы өзгерістер осы бетте ғана қалады.", "Не удалось сохранить код в браузере. Последние изменения доступны только на этой странице.");
            } else if (!message) {
                message = versions.latest === null ?
                    window.courseText("Өзгерістер осы браузерде автоматты түрде сақталады.", "Изменения автоматически сохраняются в этом браузере.") :
                    window.courseText("Өзгерістер сақталды.", "Изменения сохранены.");
            }

            if (message !== status.textContent) status.textContent = message;
        }

        function persist() {
            try {
                localStorage.setItem(storageKey, JSON.stringify(versions));
                storageWorks = true;
            } catch {
                storageWorks = false;
            }
        }

        function showCode(value, isPreview) {
            code.value = value;
            displayedValue = code.value;
            previewing = isPreview;
            code.focus({preventScroll: true});
        }

        function saveEdit() {
            const value = code.value;
            if (value === displayedValue) return;

            if (previewing && versions.latest !== null && value !== versions.latest) {
                versions.previous = versions.latest;
            }
            versions.latest = value;
            displayedValue = value;
            previewing = false;
            persist();
            showStatus();
        }

        code.addEventListener('input', saveEdit);
        code.addEventListener('keydown', event => {
            if (event.key === 'Tab' && event.defaultPrevented) saveEdit();
        });

        restore.addEventListener('click', () => {
            showCode(starter, true);
            if (!oldRestore) clearOutput?.click();
            showStatus(versions.latest === null ?
                window.courseText("Бастапқы код ашылды.", "Исходный код открыт.") :
                window.courseText("Бастапқы код ашылды. Жазған кодыңызды қайта аша аласыз.", "Исходный код открыт. Вы можете вернуться к своему черновику."));
        });

        resume.addEventListener('click', () => {
            showCode(versions.latest, false);
            clearOutput?.click();
            showStatus(window.courseText("Сақталған код ашылды.", "Сохранённый код открыт."));
        });

        previous.addEventListener('click', () => {
            [versions.latest, versions.previous] = [versions.previous, versions.latest];
            showCode(versions.latest, false);
            clearOutput?.click();
            persist();
            showStatus(window.courseText("Алдыңғы нұсқа ашылды.", "Предыдущая версия открыта."));
        });

        // The first lesson loads sample text directly without firing an input event.
        code.closest('.course-practice')?.querySelector('.foundation-presets')?.addEventListener('click', event => {
            if (!event.target.closest('button[data-example]')) return;
            displayedValue = code.value;
            previewing = true;
            showStatus(versions.latest === null ? window.courseText("Үлгі ашылды.", "Пример открыт.") : window.courseText("Үлгі ашылды. Жазған кодыңызды қайта аша аласыз.", "Пример открыт. Вы можете вернуться к своему черновику."));
        });

        window.addEventListener('storage', event => {
            if (event.key !== storageKey) return;
            versions = parseVersions(event.newValue);
            previewing = code.value !== versions.latest;
            showStatus(window.courseText("Код басқа қойындыда жаңартылды.", "Код обновлён в другой вкладке."));
        });

        showStatus(versions.latest === null ? '' : window.courseText("Сақталған код ашылды.", "Сохранённый код открыт."));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, {once: true});
    } else {
        start();
    }
})();
