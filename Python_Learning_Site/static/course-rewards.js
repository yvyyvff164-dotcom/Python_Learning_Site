(() => {
    'use strict';
    const dayMs = 86400000;
    const offset = 5 * 3600000;
    const dailyCoins = Object.freeze([10, 15, 20, 25, 30]);
    const prices = Object.freeze({classic: 0, beach: 60, newyear: 90, sakura: 100, aurora: 120, glass: 140, cyberpunk: 150, ocean: 180});
    const xpRates = Object.freeze({lesson: 20, daily: 15, game: 10, practice: 5});
    const changeKey = 'pls_rewards_change_v1';
    const skinKey = 'pls_skin_v1';
    const t = window.courseText;
    let dbPromise;
    let toastTimer;
    let available = true;
    let loaded = false;
    const ranks = [
        [0, t('Жаңадан бастаушы', 'Новичок')], [60, t('Үйренуші', 'Ученик')],
        [180, t('Код жазушы', 'Кодер')], [360, t('Әзірлеуші', 'Разработчик')], [600, t('Python шебері', 'Python-мастер')]
    ];
    const fresh = () => ({balance: 0, skin: 'classic', owned: ['classic'], days: [], daily: {}, practice: [], modules: [], revision: 0, lessonCredits: [], games: {}, title: ''});
    let current = fresh();

    function dayAt(time = Date.now()) { return Math.floor((time + offset) / dayMs); }
    function nextReset(day) { return (day + 1) * dayMs - offset; }

    function setSkin(skin) {
        const root = document.documentElement;
        const name = Object.hasOwn(prices, skin) && skin !== 'classic' ? skin : undefined;
        if (root.dataset.skin === name) return;
        if (name) root.dataset.skin = name;
        else delete root.dataset.skin;
        document.dispatchEvent(new Event('course:skin'));
    }
    // The cached selection avoids a flash while the browser opens the wallet.
    try { setSkin(localStorage.getItem(skinKey)); } catch {}

    function database() {
        if (!dbPromise) {
            dbPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open('pls_course_rewards_v1', 1);
                request.onupgradeneeded = () => request.result.createObjectStore('wallet');
                request.onsuccess = () => {
                    const db = request.result;
                    db.onversionchange = () => { db.close(); dbPromise = undefined; };
                    resolve(db);
                };
                request.onerror = () => reject(request.error);
            }).catch(error => { dbPromise = undefined; throw error; });
        }
        return dbPromise;
    }

    function profile(state = current) {
        const games = Object.values(state.games);
        const daily = Object.values(state.daily).reduce((total, solved) => total + solved.length, 0);
        const xp = state.lessonCredits.length * xpRates.lesson + daily * xpRates.daily
            + games.length * xpRates.game + state.practice.length * xpRates.practice;
        const level = ranks.filter(([threshold]) => xp >= threshold).length;
        const unique = mode => new Set(games.filter(game => game.mode === mode).map(game => game.scenario)).size;
        const titles = [
            {id: 'hunter', name: t('Қате іздеуші', 'Охотник за ошибками'), count: unique('bugs'), goal: 3},
            {id: 'loops', name: t('Циклдер шебері', 'Мастер циклов'), count: Number(state.lessonCredits.includes('/loops')) + Number(games.some(game => game.scenario === 'loop')), goal: 2},
            {id: 'perfect', name: t('Қатесіз', 'Без единой ошибки'), count: games.filter(game => game.clean).length, goal: 3},
            {id: 'architect', name: t('Сәулетші', 'Архитектор'), count: unique('build'), goal: 3}
        ];
        return {xp, level, rank: ranks[level - 1][1], floor: ranks[level - 1][0], next: ranks[level], daily, games: games.length, titles};
    }

    function notifyPage() {
        document.querySelectorAll('[data-coin-balance]').forEach(el => { el.textContent = current.balance; });
        const status = profile();
        document.querySelectorAll('[data-profile-level]').forEach(el => { el.textContent = status.level; });
        const shortcut = document.querySelector('.profile-shortcut');
        if (shortcut) shortcut.title = t('Бағдарламашы профилі', 'Профиль программиста') + ' · ' + status.rank + ' · ' + status.xp + ' XP';
        document.dispatchEvent(new Event('course:rewards'));
    }

    // IndexedDB serializes these transactions across tabs. A claim and its coins,
    // or a purchase and its price, are always committed together.
    async function update(change) {
        try {
            const db = await database();
            return await new Promise((resolve, reject) => {
                const tx = db.transaction('wallet', change ? 'readwrite' : 'readonly');
                const store = tx.objectStore('wallet');
                const request = store.get('profile');
                let state, result;
                request.onsuccess = () => {
                    state = request.result || fresh();
                    // Wallets created before the arcade retain their purchases and activity.
                    state.games ??= {};
                    state.lessonCredits ??= [];
                    state.title ??= '';
                    result = change?.(state) || {};
                    if (result.changed) {
                        state.revision++;
                        store.put(state, 'profile');
                    }
                };
                tx.onabort = () => reject(tx.error || new Error('Wallet transaction aborted'));
                tx.oncomplete = () => {
                    available = true;
                    loaded = true;
                    current = state;
                    setSkin(state.skin);
                    try {
                        if (localStorage.getItem(skinKey) !== state.skin) localStorage.setItem(skinKey, state.skin);
                        if (result.changed) localStorage.setItem(changeKey, String(state.revision));
                    } catch {}
                    notifyPage();
                    resolve(result);
                };
            });
        } catch {
            available = false;
            loaded = true;
            notifyPage();
            return {error: true};
        }
    }

    function addDay(state, day) {
        if (state.days.includes(day)) return false;
        state.days.push(day);
        return true;
    }
    function streak(days, today = dayAt()) {
        const active = [...new Set(days)].filter(day => day <= today).sort((a,b) => a-b);
        let best = 0, run = 0, last;
        for (const day of active) {
            run = day === last + 1 ? run + 1 : 1;
            best = Math.max(best, run);
            last = day;
        }
        return {current: last >= today - 1 ? run : 0, best};
    }

    function toast(message) {
        const el = document.getElementById('reward-toast');
        if (!el) return;
        clearTimeout(toastTimer);
        el.textContent = message;
        el.classList.add('visible');
        toastTimer = setTimeout(() => { el.classList.remove('visible'); el.textContent = ''; }, 4200);
    }

    function claimDaily(day, level) {
        return update(state => {
            if (day !== dayAt() || !Number.isInteger(level) || !dailyCoins[level - 1]) return {expired: true};
            const solved = state.daily[day] || [];
            if (solved.includes(level)) return {already: true};
            state.daily[day] = [...solved, level];
            const coins = dailyCoins[level - 1];
            state.balance += coins;
            addDay(state, day);
            return {changed: true, coins};
        });
    }

    async function practice(id) {
        if (window.courseLanguage?.restoring) return;
        const result = await update(state => {
            const newDay = addDay(state, dayAt());
            if (state.practice.includes(id)) return {changed: newDay};
            state.practice.push(id);
            state.balance += 5;
            return {changed: true, coins: 5};
        });
        if (result.coins) toast(t('Дұрыс жауап! +5 монета', 'Верный ответ! +5 монет') + ' · +' + xpRates.practice + ' XP');
        if (result.error) toast(t('Монеталарды браузерге сақтау мүмкін болмады.', 'Не удалось сохранить монеты в браузере.'));
    }

    function chooseSkin(skin) {
        return update(state => {
            if (!Object.hasOwn(prices, skin)) return {error: true};
            const owned = state.owned.includes(skin);
            if (!owned && state.balance < prices[skin]) return {insufficient: true};
            if (state.skin === skin) return {already: true};
            if (!owned) {
                state.balance -= prices[skin];
                state.owned.push(skin);
            }
            state.skin = skin;
            return {changed: true, purchased: !owned};
        });
    }

    function finishGame(mode, round, scenario, clean) {
        return update(state => {
            const key = mode + ':' + round;
            if (Object.hasOwn(state.games, key)) return {already: true};
            state.games[key] = {mode, scenario, clean};
            addDay(state, dayAt());
            return {changed: true, xp: xpRates.game};
        });
    }

    function chooseTitle(id) {
        return update(state => {
            const title = profile(state).titles.find(title => title.id === id);
            if (id && (!title || title.count < title.goal)) return {locked: true};
            if (state.title === id) return {already: true};
            state.title = id;
            return {changed: true};
        });
    }

    // Existing completion dates also count for learners who started before rewards.
    async function syncLessons(levels, done, announce = false) {
        const result = await update(state => {
            let changed = false;
            const badges = [];
            let xp = 0;
            levels.forEach((level, index) => {
                for (const lesson of level.lessons) {
                    const stamp = done[lesson.url];
                    if (stamp && !state.lessonCredits.includes(lesson.url)) {
                        state.lessonCredits.push(lesson.url);
                        xp += xpRates.lesson;
                        changed = true;
                    }
                    if (Number.isFinite(stamp) && stamp > 0 && stamp <= Date.now()) {
                        if (addDay(state, dayAt(stamp))) changed = true;
                    }
                }
                if (level.lessons.length && level.lessons.every(lesson => done[lesson.url]) && !state.modules.includes(index + 1)) {
                    state.modules.push(index + 1);
                    badges.push(level.short);
                    changed = true;
                }
            });
            return {changed, badges, xp};
        });
        if (announce && result.xp) {
            const label = result.badges.length ? t('Жетістік ашылды', 'Получено достижение') + ' · ' + result.badges.join(', ') : t('Сабақ аяқталды', 'Урок пройден');
            toast(label + ' · +' + result.xp + ' XP');
        }
    }

    window.CourseRewards = Object.freeze({
        dailyCoins, prices, xpRates, ranks, dayAt, nextReset, streak, claimDaily, practice, chooseSkin, syncLessons, profile, finishGame, chooseTitle,
        get state() { return current; }, get available() { return available; }, get loaded() { return loaded; }, refresh: () => update()
    });
    update();
    window.addEventListener('storage', e => { if (e.key === changeKey || e.key === null) update(); });
    window.addEventListener('pageshow', e => { if (e.persisted) update(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
    document.addEventListener('DOMContentLoaded', () => {
        const course = window.PLS;
        if (course) syncLessons(course.LEVELS, course.load().done);
        else update();
    }, {once: true});
})();
