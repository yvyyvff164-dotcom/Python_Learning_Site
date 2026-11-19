(() => {
    "use strict";

    // Skulpt 1.2.0 browser bundles from the npm release. See vendor/skulpt/LICENSE.
    const assets = new URL("vendor/skulpt/", document.currentScript.src);
    const loadFailure = window.courseText("Python ортасы жүктелмеді. Қайта іске қосып көріңіз.", "Не удалось загрузить Python. Попробуйте запустить код ещё раз.");
    let ready;
    let guide;
    let automaticHelp;
    let openedGuide, openedExplanation;

    function clearHelp() {
        if (!automaticHelp) return;
        if (openedExplanation) automaticHelp.open = false;
        if (openedGuide) guide.open = false;
        automaticHelp = null;
        guide.querySelector('.guide-location').textContent = '';
    }

    function explain(error) {
        if (!guide) return;
        const kind = String(error).match(/^(SyntaxError|IndexError|TypeError)\b/)?.[1];
        if (!kind) return;
        automaticHelp = guide.querySelector('[data-exception="' + kind + '"]');
        openedGuide = !guide.open;
        openedExplanation = !automaticHelp.open;
        const line = error.traceback?.[0]?.lineno;
        guide.querySelector('.guide-location').textContent = Number.isInteger(line) && line > 0
            ? window.courseText('Қате шыққан жол', 'Строка с ошибкой') + ' · ' + line : kind;
        guide.open = true;
        automaticHelp.open = true;
    }

    function loadScript(name) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");

            function fail() {
                clearTimeout(timeout);
                script.remove();
                reject(new Error(loadFailure));
            }

            const timeout = setTimeout(fail, 10000);
            script.src = new URL(name, assets).href;
            script.onload = () => {
                clearTimeout(timeout);
                resolve();
            };
            script.onerror = fail;
            document.head.append(script);
        });
    }

    async function loadRuntime() {
        if (!window.Sk?.configure) await loadScript("skulpt.min.js");
        if (!window.Sk?.configure) throw new Error(loadFailure);
        if (!window.Sk.builtinFiles?.files) await loadScript("skulpt-stdlib.js");
        if (!window.Sk.builtinFiles?.files) throw new Error(loadFailure);
        return window.Sk;
    }

    function getRuntime() {
        if (!ready) {
            ready = loadRuntime().catch(error => {
                ready = undefined;
                throw error;
            });
        }
        return ready;
    }

    function isMatrixCommand(source) {
        const word = source.trim();
        return word === "hack" || word === "хак";
    }

    async function run(source, output) {
        clearHelp();
        if (isMatrixCommand(source)) {
            const {showMatrixEffect} = await import("./matrix-effect.js");
            showMatrixEffect();
            output(window.courseText("Матрица режимі 5 секундқа қосылды.\n", "Режим «Матрица» включён на 5 секунд.\n"));
            return;
        }
        const command = /^import[ \t]+(anti[ \t]+gravity|gravity)$/.exec(source.trim());
        if (command) {
            const enabled = command[1] !== "gravity";
            const {setAntigravity} = await import("./antigravity.js");
            setAntigravity(enabled);
            output(enabled
                ? window.courseText("Белгішелер жоғары көтерілді! Оларды орнына қайтару үшін import gravity командасын іске қосыңыз.\n", "Значки взлетели! Чтобы вернуть их на место, запустите команду import gravity.\n")
                : window.courseText("Белгішелер өз орнында.\n", "Значки вернулись на свои места.\n"));
            return;
        }
        const python = await getRuntime();
        const files = python.builtinFiles.files;
        python.configure({
            output,
            read(path) {
                if (!Object.hasOwn(files, path)) throw new Error(window.courseText("Файл табылмады: ", "Файл не найден: ") + path);
                return files[path];
            },
            __future__: python.python3,
            inputfun: prompt => window.prompt(prompt || window.courseText("Мәнді енгізіңіз:", "Введите значение:")) ?? "",
            execLimit: 10000
        });
        try {
            await python.misceval.asyncToPromise(() => python.importMainWithBody("<stdin>", false, source, true));
        } catch (error) {
            explain(error);
            throw error;
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        const result = document.getElementById('output');
        const template = document.getElementById('python-guide-template');
        if (result && template) {
            guide = template.content.firstElementChild.cloneNode(true);
            result.after(guide);
            // Clear, restore and FlowRun examples already remove the error state.
            new MutationObserver(() => {
                if (!result.classList.contains('error')) clearHelp();
            }).observe(result, {attributes: true, attributeFilter: ['class']});
        }
        const editor = document.querySelector("textarea#code");
        const runButton = document.getElementById("run-btn");
        if (!editor || !runButton) return;

        function submitCommand(event) {
            if (event.defaultPrevented || event.isComposing || !isMatrixCommand(editor.value)) return;
            event.preventDefault();
            if (!event.repeat) runButton.click();
        }

        let enterKeyDown = false;
        editor.addEventListener("keydown", event => {
            enterKeyDown = event.key === "Enter";
            if (enterKeyDown && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
                submitCommand(event);
            }
        });
        editor.addEventListener("keyup", () => { enterKeyDown = false; });
        editor.addEventListener("blur", () => { enterKeyDown = false; });
        // Some virtual keyboards deliver the line break without a keydown event.
        editor.addEventListener("beforeinput", event => {
            if (!enterKeyDown && event.cancelable && event.inputType === "insertLineBreak") submitCommand(event);
        });
    }, {once: true});

    window.PythonRuntime = Object.freeze({run});
})();
