(() => {
    'use strict';
    const lessonText = window.courseText;

    const questions = [
        {
            id: 'print-separator',
            kind: lessonText('Нәтижені болжау', 'Предскажите результат'),
            prompt: lessonText('Бұл код экранға не шығарады?', 'Что выведет программа?'),
            code: lessonText('print("Оқу", "күні", sep=" · ")', 'print("Учебный", "день", sep=" · ")'),
            options: [lessonText('Оқу күні', 'Учебный день'), lessonText('Оқу · күні', 'Учебный · день'), lessonText('Оқу · күні ·', 'Учебный · день ·')],
            correct: 1,
            explanation: lessonText(
                'sep мәні print() аргументтерінің арасына қойылады. Соңында қосымша бөлгіш болмайды.',
                'sep задаёт разделитель между аргументами print(). После последнего аргумента разделитель не добавляется.'
            ),
            lesson: [lessonText('Print командасы', 'Команда print'), '/print']
        },
        {
            id: 'input-integer',
            kind: lessonText('Қатені түзету', 'Исправьте ошибку'),
            prompt: lessonText(
                'Пайдаланушы 3 енгізгенде, нәтиже дәл 5 шығуы үшін соңғы жолды қалай өзгертесіз?',
                'Пользователь ввёл 3. Как заменить последнюю строку, чтобы программа вывела именно 5?'
            ),
            code: 'count = input()\nprint(count + 2)',
            options: ['print(count + "2")', 'print(float(count) + 2)', 'print(int(count) + 2)'],
            correct: 2,
            explanation: lessonText(
                'input() мәтін қайтарады. int(count) оны бүтін санға айналдырады. Сонда 3 + 2 нәтижесі 5 болады.',
                'input() возвращает строку. int(count) преобразует её в целое число, поэтому 3 + 2 даст 5.'
            ),
            lesson: [lessonText('Айнымалылар', 'Переменные'), '/variables']
        },
        {
            id: 'condition-boundary',
            kind: lessonText('Нәтижені болжау', 'Предскажите результат'),
            prompt: lessonText('Жас 18-ге тең болғанда қай сөз шығады?', 'Какое сообщение появится, если возраст равен 18?'),
            code: lessonText(
                'age = 18\nif age >= 18:\n    print("Рұқсат")\nelse:\n    print("Күтіңіз")',
                'age = 18\nif age >= 18:\n    print("Можно")\nelse:\n    print("Подождите")'
            ),
            options: [lessonText('Рұқсат', 'Можно'), lessonText('Күтіңіз', 'Подождите'), lessonText('Ештеңе шықпайды', 'Ничего не появится')],
            correct: 0,
            explanation: lessonText(
                '>= операторы үлкен немесе тең дегенді білдіреді. 18 >= 18 шарты ақиқат, сондықтан if блогы орындалады.',
                '>= означает «больше или равно». Условие 18 >= 18 истинно, поэтому выполнится блок if.'
            ),
            lesson: [lessonText('Шарттар', 'Условия'), '/conditions']
        },
        {
            id: 'loop-step',
            kind: lessonText('Нәтижені болжау', 'Предскажите результат'),
            prompt: lessonText('Цикл аяқталғанда total мәні нешеге тең болады?', 'Чему будет равна переменная total после завершения цикла?'),
            code: 'total = 0\nfor n in range(2, 7, 2):\n    total += n\nprint(total)',
            options: ['8', '12', '14'],
            correct: 1,
            explanation: lessonText(
                'range(2, 7, 2) тізбегінде 2, 4 және 6 бар. 7 шегі кірмейді. Қосындысы 12 болады.',
                'range(2, 7, 2) даёт числа 2, 4 и 6. Правая граница 7 в диапазон не входит. Сумма равна 12.'
            ),
            lesson: [lessonText('Циклдер', 'Циклы'), '/loops']
        },
        {
            id: 'string-slice',
            kind: lessonText('Нәтижені болжау', 'Предскажите результат'),
            prompt: lessonText('Тілімді экранға шығарғанда қандай мәтін көрінеді?', 'Какую строку выведет этот срез?'),
            code: 'text = "Python"\nprint(text[1:4])',
            options: ['Pyt', 'ytho', 'yth'],
            correct: 2,
            explanation: lessonText(
                'Индекстер нөлден басталады. [1:4] тілімі 1, 2 және 3 индекстеріндегі y, t, h таңбаларын алады.',
                'Нумерация начинается с нуля. Срез [1:4] берёт символы с индексами 1, 2 и 3 — это y, t и h.'
            ),
            lesson: [lessonText('Мәтіндік жолдар', 'Строки'), '/strings']
        },
        {
            id: 'number-padding',
            kind: lessonText('Нәтижені болжау', 'Предскажите результат'),
            prompt: lessonText('Пішімделген ұпай экранда қалай көрінеді?', 'Как будет выглядеть количество баллов после форматирования?'),
            code: 'score = 7\nprint(f"{score:03d}")',
            options: ['007', '7.000', '700'],
            correct: 0,
            explanation: lessonText(
                '03d бүтін санды кемінде үш орынға жазады. Жетіспеген орындар сол жақтан нөлмен толтырылады.',
                '03d отводит под целое число не меньше трёх позиций. Недостающие позиции слева заполняются нулями.'
            ),
            lesson: [lessonText('Форматтау', 'Форматирование строк'), '/formatting']
        },
        {
            id: 'list-pop',
            kind: lessonText('Нәтижені болжау', 'Предскажите результат'),
            prompt: lessonText('print() қай санды шығарады?', 'Какое число выведет print()?'),
            code: 'numbers = [4, 8, 12]\nremoved = numbers.pop(1)\nprint(removed)',
            options: ['4', '8', '12'],
            correct: 1,
            explanation: lessonText(
                'pop(1) индексі 1 болатын элементті тізімнен алып, сол элементті қайтарады. Ол 8-ге тең.',
                'pop(1) удаляет элемент с индексом 1 и возвращает его значение. В этом списке это число 8.'
            ),
            lesson: [lessonText('Элемент қосу және жою', 'Добавление и удаление элементов'), '/add_remove']
        },
        {
            id: 'sort-copy',
            kind: lessonText('Нәтижені болжау', 'Предскажите результат'),
            prompt: lessonText('print() екі тізімнің алғашқы элементтерін қандай ретпен шығарады?', 'В каком порядке print() выведет первые элементы двух списков?'),
            code: 'numbers = [7, 2, 5]\nordered = sorted(numbers)\nprint(numbers[0], ordered[0])',
            options: ['2 2', '2 7', '7 2'],
            correct: 2,
            explanation: lessonText(
                'sorted() сұрыпталған жаңа тізім қайтарады. numbers тізімінің алғашқы элементі 7, ordered тізімінікі 2.',
                'sorted() возвращает новый отсортированный список. Первый элемент numbers равен 7, а первый элемент ordered равен 2.'
            ),
            lesson: [lessonText('Сұрыптау', 'Сортировка'), '/sorting']
        },
        {
            id: 'matrix-lookup',
            kind: lessonText('Нәтижені болжау', 'Предскажите результат'),
            prompt: lessonText('Код матрицадан қай санды алады?', 'Какое число программа извлечёт из матрицы?'),
            code: 'matrix = [[2, 5], [7, 9]]\nprint(matrix[1][0])',
            options: ['7', '5', '9'],
            correct: 0,
            explanation: lessonText(
                'matrix[1] екінші жолды, яғни [7, 9] тізімін таңдайды. [0] сол жолдың бірінші элементін алады.',
                'matrix[1] выбирает вторую строку матрицы — список [7, 9]. Следующий индекс [0] указывает на первый элемент этой строки.'
            ),
            lesson: [lessonText('Екіөлшемді массив', 'Двумерный массив'), '/arrays2']
        },
        {
            id: 'return-double',
            kind: lessonText('Қатені түзету', 'Исправьте ошибку'),
            prompt: lessonText('Экранға тек 9 шығуы үшін n * 2 жолын немен алмастырасыз?', 'Чем заменить строку n * 2, чтобы программа вывела только число 9?'),
            code: 'def double(n):\n    n * 2\n\nprint(double(4) + 1)',
            options: ['print(n * 2)', 'return n + 2', 'return n * 2'],
            correct: 2,
            explanation: lessonText(
                'return n * 2 шақырған жерге 8 қайтарады. Сыртқы өрнек оған 1 қосады. Функция ішіндегі print() мәнді қайтара алмайды.',
                'return n * 2 возвращает число 8 туда, где была вызвана функция. Во внешнем выражении к нему прибавляется 1. Команда print() внутри функции лишь напечатала бы значение.'
            ),
            lesson: [lessonText('Өз функцияларың', 'Собственные функции'), '/custom-functions']
        },
        {
            id: 'guess-lower-bound',
            kind: lessonText('Шешімді таңдау', 'Выберите решение'),
            prompt: lessonText(
                '1–20 аралығындағы ойында бағдарлама «Үлкенірек сан енгізіңіз» деді. Келесі болжамға болатын ең кіші сан қандай?',
                'В игре загадано число от 1 до 20. Вы ввели 8 и получили подсказку «Введите число побольше». Какое наименьшее число ещё может быть загадано?'
            ),
            code: lessonText(
                'def give_hint(guess, secret):\n    if guess < secret:\n        return "Үлкенірек сан енгізіңіз"\n\n# guess = 8',
                'def give_hint(guess, secret):\n    if guess < secret:\n        return "Введите число побольше"\n\n# guess = 8'
            ),
            options: ['8', '9', '10'],
            correct: 1,
            explanation: lessonText(
                'Хабарлама жасырын сан 8-ден үлкен болғанда шығады. Сондықтан іздеу аралығы 9-дан басталады.',
                'Эта подсказка появляется, когда загаданное число больше 8. Поэтому следующий диапазон поиска начинается с 9.'
            ),
            lesson: [lessonText('Санды тап ойыны', 'Игра «Угадай число»'), '/guess-number']
        },
        {
            id: 'coordinate-row',
            kind: lessonText('Нәтижені болжау', 'Предскажите результат'),
            prompt: lessonText(
                'Код қанша нүкте және ең соңында қай координата жұбын шығарады?',
                'Сколько точек окажется в списке и какие координаты будут у последней точки?'
            ),
            code: 'points = []\nfor x in range(1, 4):\n    points.append((x, 2))\nprint(len(points), points[-1])',
            options: ['3 (3, 2)', '4 (4, 2)', '3 (2, 3)'],
            correct: 0,
            explanation: lessonText(
                'x мәндері 1, 2 және 3 болады, ал y мәні 2. Үш нүкте қосылады. points[-1] соңғы (3, 2) нүктесін қайтарады.',
                'Координата x принимает значения 1, 2 и 3, а y всегда равна 2. В список попадут три точки. points[-1] вернёт последнюю из них — (3, 2).'
            ),
            lesson: [lessonText('Координаталар және циклдер', 'Координаты и циклы'), '/coordinate-practice']
        }
    ];

    const tracks = [
        { id: 'basics', title: lessonText('Негіздер мен алгоритмдер', 'Основы и алгоритмы'), description: lessonText('Шығару, деректер типі, шарттар және циклдер.', 'Вывод, типы данных, условия и циклы.'), ids: questions.slice(0, 4).map(question => question.id) },
        { id: 'data', title: lessonText('Деректермен жұмыс', 'Работа с данными'), description: lessonText('Мәтіндік жолдар, пішімдеу, тізімдер және сұрыптау.', 'Строки, форматирование, списки и сортировка.'), ids: questions.slice(4, 8).map(question => question.id) },
        { id: 'projects', title: lessonText('Функциялар мен жобалар', 'Функции и проекты'), description: lessonText('Матрица, функция, сан табу және координаталар.', 'Матрицы, функции, угадывание числа и координаты.'), ids: questions.slice(8).map(question => question.id) }
    ];

    const root = document.querySelector('.practice');
    const select = name => root.querySelector('[data-practice-' + name + ']');
    const byId = new Map(questions.map(question => [question.id, question]));
    const trackById = new Map(tracks.map(track => [track.id, track]));
    const storageKey = 'pls_practice_hub_v1';
    const reviewLimit = 4;
    const form = select('form');
    const fieldset = form.querySelector('fieldset');
    const optionList = select('options');
    const submit = select('submit');
    const feedback = select('feedback');
    const next = select('next');

    const dict = () => Object.create(null);
    const validChoice = (id, value) => Number.isInteger(value) && value >= 0 && value < byId.get(id).options.length;
    const currentSession = () => state.sessions[state.active];
    const complete = session => session.index === session.ids.length;

    function normalizeSession(group, stored) {
        if (!Array.isArray(stored?.ids)) return null;
        const ids = [...new Set(stored.ids.filter(id => byId.has(id)))];
        if (ids.length === 0 || ids.length > reviewLimit) return null;
        if (group !== 'review' && ids.join(',') !== trackById.get(group).ids.join(',')) return null;

        const answers = dict();
        const storedIndex = Number.isInteger(stored.index) ? Math.max(0, Math.min(stored.index, ids.length)) : 0;
        let index = storedIndex;
        for (let i = 0; i < ids.length && i <= storedIndex; i++) {
            const id = ids[i];
            const value = stored.answers?.[id];
            if (validChoice(id, value)) {
                answers[id] = value;
            } else {
                index = i;
                break;
            }
        }
        const id = ids[index];
        const draft = id && index === storedIndex && validChoice(id, stored.draft) ? stored.draft : null;
        return { ids, answers, index, draft };
    }

    function load() {
        const restored = { active: null, mistakes: dict(), sessions: dict() };
        let json;
        try {
            json = localStorage.getItem(storageKey);
        } catch {
            select('storage').hidden = false;
            return restored;
        }
        let stored;
        try {
            stored = JSON.parse(json);
        } catch {
            return restored;
        }
        if (!stored || stored.version !== 1) return restored;

        for (const id of byId.keys()) {
            const choice = stored.mistakes?.[id];
            if (validChoice(id, choice) && choice !== byId.get(id).correct) restored.mistakes[id] = choice;
        }
        for (const group of [...trackById.keys(), 'review']) {
            const session = normalizeSession(group, stored.sessions?.[group]);
            if (session) restored.sessions[group] = session;
        }
        if (typeof stored.active === 'string' && Object.hasOwn(restored.sessions, stored.active)) restored.active = stored.active;
        return restored;
    }

    let state = load();

    function save() {
        try {
            localStorage.setItem(storageKey, JSON.stringify({ version: 1, ...state }));
        } catch {
            select('storage').hidden = false;
        }
    }

    function node(tag, text, className) {
        const element = document.createElement(tag);
        if (text !== undefined) element.textContent = text;
        if (className) element.className = className;
        return element;
    }

    function updateLessonLink(anchor, question) {
        const [name, path] = question.lesson;
        anchor.textContent = lessonText('Сабаққа өту · ', 'Перейти к уроку · ') + name;
        anchor.href = path;
    }

    function correctCount(session) {
        return session.ids.filter(id => session.answers[id] === byId.get(id).correct).length;
    }

    function showMistakes(container, ids, mistakes) {
        const items = ids.map(id => {
            const question = byId.get(id);
            const item = node('article', undefined, 'practice-review-item');
            const title = node('h4', question.prompt);
            const snippet = node('pre', undefined, 'practice-code');
            snippet.tabIndex = 0;
            snippet.setAttribute('aria-label', lessonText('Python коды', 'Код Python'));
            snippet.append(node('code', question.code));
            const response = node('p');
            response.append(lessonText('Сіздің жауабыңыз — ', 'Ваш ответ — '), node('code', question.options[mistakes[id]]));
            const correct = node('p');
            correct.append(lessonText('Дұрыс жауап — ', 'Правильный ответ — '), node('code', question.options[question.correct]));
            const link = node('a');
            updateLessonLink(link, question);
            item.append(title, snippet, response, correct, node('p', question.explanation), link);
            return item;
        });
        container.replaceChildren(...items);
    }

    function showReviewButtons() {
        const session = state.sessions.review;
        const inProgress = session && !complete(session);
        const hasMistakes = Object.keys(state.mistakes).length > 0;
        const alreadyActive = state.active === 'review' && inProgress;
        for (const button of root.querySelectorAll('[data-practice-start-review]')) {
            button.hidden = alreadyActive || !(hasMistakes || inProgress);
            button.textContent = inProgress ? lessonText('Қайталауды жалғастыру', 'Продолжить повторение') : lessonText('Қателерді жаттықтыру', 'Повторить задания с ошибками');
        }
    }

    function renderMenu() {
        const cards = tracks.map(track => {
            const session = state.sessions[track.id];
            const started = session !== undefined;
            const finished = started && complete(session);
            const card = node('article', undefined, 'practice-track');
            const action = started ? (finished ? lessonText('Қайта бастау', 'Начать заново') : lessonText('Жалғастыру', 'Продолжить')) : lessonText('Бастау', 'Начать');
            const button = node('button', action, 'practice-button');
            button.type = 'button';
            button.setAttribute('aria-label', action + ' · ' + track.title);
            button.addEventListener('click', () => start(track.id));
            const message = finished
                ? lessonText('Дұрыс жауаптар · ', 'Правильные ответы · ') + correctCount(session) + ' / ' + session.ids.length
                : started ? lessonText('Тексерілгені · ', 'Проверено · ') + Object.keys(session.answers).length + ' / ' + session.ids.length
                    : track.ids.length + lessonText(' тапсырма', ' задания');
            card.append(node('h3', track.title), node('p', track.description), node('p', message, 'practice-track-status'), button);
            return card;
        });
        select('tracks').replaceChildren(...cards);

        const ids = Object.keys(state.mistakes);
        select('pending-text').textContent = ids.length
            ? lessonText('Қайталауға қалғаны — ', 'Заданий для повторения: ') + ids.length + lessonText(' тапсырма.', '.')
            : lessonText('Әзірге қайталайтын қате жауап жоқ.', 'Пока нет заданий для повторения.');
        select('pending-details').hidden = ids.length === 0;
        showMistakes(select('pending-list'), ids, state.mistakes);
    }

    function renderRound(session) {
        const id = session.ids[session.index];
        const question = byId.get(id);
        const answer = session.answers[id];
        const answered = answer !== undefined;
        select('position').textContent = lessonText(
            (session.index + 1) + '-тапсырма · Барлығы ' + session.ids.length,
            'Задание ' + (session.index + 1) + ' из ' + session.ids.length
        );
        const progress = select('progress');
        progress.max = session.ids.length;
        progress.value = Object.keys(session.answers).length;
        select('kind').textContent = question.kind;
        root.querySelector('#practice-round-title').textContent = question.prompt;
        select('code').textContent = question.code;

        optionList.replaceChildren(...question.options.map((text, index) => {
            const label = node('label', undefined, 'practice-option');
            const radio = node('input');
            radio.type = 'radio';
            radio.name = 'answer';
            radio.value = index;
            radio.checked = index === (answered ? answer : session.draft);

            let caption = '';
            if (answered && index === question.correct) {
                label.dataset.result = 'correct';
                caption = lessonText('Дұрыс жауап', 'Правильный ответ');
            } else if (answered && index === answer) {
                label.dataset.result = 'wrong';
                caption = lessonText('Сіздің жауабыңыз', 'Ваш ответ');
            }
            label.append(radio, node('code', text), node('span', caption));
            return label;
        }));

        fieldset.disabled = answered;
        submit.hidden = answered;
        submit.disabled = session.draft === null;
        feedback.hidden = !answered;
        next.hidden = !answered;
        if (answered) {
            const correct = answer === question.correct;
            feedback.dataset.verdict = correct ? 'correct' : 'wrong';
            root.querySelector('#practice-verdict').textContent = correct ? lessonText('Дұрыс жауап!', 'Верно!') : lessonText('Жауабыңыз қате', 'Ответ неверный');
            select('detail').textContent = question.explanation;
            updateLessonLink(select('lesson'), question);
            next.textContent = session.index + 1 === session.ids.length ? lessonText('Нәтижені көру', 'Посмотреть результат') : lessonText('Келесі тапсырма', 'Следующее задание');
        }
    }

    function renderSummary(session) {
        const missed = session.ids.filter(id => session.answers[id] !== byId.get(id).correct);
        select('score').textContent = correctCount(session) + ' / ' + session.ids.length;
        select('summary-errors').hidden = missed.length === 0;
        showMistakes(select('summary-list'), missed, session.answers);
    }

    function render() {
        const session = currentSession();
        const finished = session && complete(session);
        select('menu').hidden = Boolean(session);
        select('round').hidden = !session || finished;
        select('summary').hidden = !finished;
        if (!session) renderMenu();
        else if (finished) renderSummary(session);
        else renderRound(session);
        showReviewButtons();
    }

    function focusView() {
        const session = currentSession();
        const id = !session ? 'practice-menu-title' : complete(session) ? 'practice-summary-title' : 'practice-round-title';
        root.querySelector('#' + id).focus();
    }

    function commitView() {
        save();
        render();
        focusView();
    }

    function start(group) {
        const existing = state.sessions[group];
        if (!existing || complete(existing)) {
            const ids = group === 'review'
                ? Object.keys(state.mistakes).slice(0, reviewLimit)
                : trackById.get(group).ids;
            if (ids.length === 0) return;
            state.sessions[group] = { ids, answers: dict(), index: 0, draft: null };
        }
        state.active = group;
        commitView();
    }

    for (const button of root.querySelectorAll('[data-practice-menu-link]')) {
        button.addEventListener('click', () => {
            state.active = null;
            commitView();
        });
    }

    for (const button of root.querySelectorAll('[data-practice-start-review]')) {
        button.addEventListener('click', () => start('review'));
    }

    form.addEventListener('change', event => {
        const session = currentSession();
        const id = session?.ids[session.index];
        const choice = Number(event.target.value);
        if (!id || session.answers[id] !== undefined || !validChoice(id, choice)) return;
        session.draft = choice;
        submit.disabled = false;
        save();
    });

    form.addEventListener('submit', event => {
        event.preventDefault();
        const session = currentSession();
        const id = session?.ids[session.index];
        if (!id || session.answers[id] !== undefined || !validChoice(id, session.draft)) return;

        const choice = session.draft;
        session.answers[id] = choice;
        session.draft = null;
        if (choice === byId.get(id).correct) {
            delete state.mistakes[id];
            window.CourseRewards.practice('trainer:' + id);
        } else state.mistakes[id] = choice;

        save();
        renderRound(session);
        feedback.focus();
    });

    next.addEventListener('click', () => {
        const session = currentSession();
        const id = session?.ids[session.index];
        if (!id || session.answers[id] === undefined) return;
        session.index += 1;
        commitView();
    });

    window.addEventListener('storage', event => {
        if (event.key !== storageKey && event.key !== null) return;
        state = load();
        render();
    });

    render();
    select('app').hidden = false;
})();
