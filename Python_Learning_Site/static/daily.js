import {dailyTasks} from './daily-tasks.js';

const rewards = window.CourseRewards;
const t = window.courseText;
const byId = id => document.getElementById(id);
const hub = byId('daily-hub');
const levels = [...hub.querySelectorAll('[data-daily-level]')];
const skins = [...hub.querySelectorAll('[data-shop-skin]')];
const tabs = [...hub.querySelectorAll('[data-tab]')];
const answer = byId('daily-answer');
const form = byId('daily-answer-form');
const feedback = byId('daily-feedback');
const locale = document.documentElement.lang;
const dateFormat = options => new Intl.DateTimeFormat(locale, {...options, timeZone: 'UTC'});
const fullDate = dateFormat({weekday: 'long', day: 'numeric', month: 'long'});
const weekday = dateFormat({weekday: 'short'});
const plurals = new Intl.PluralRules('ru');
const dateFor = day => new Date(day * 86400000);
let day = rewards.dayAt();
let tasks = dailyTasks(day);
let level = 1;
let drafts = {};
let mistakes = {};
let claimPending = false;
let shopPending = false;

function coins(amount) {
    const word = {one: 'монета', few: 'монеты', many: 'монет'}[plurals.select(amount)];
    return amount + ' ' + t('монета', word);
}

function solvedLevels() { return rewards.state.daily[day] || []; }

function selectTab() {
    const requested = location.hash.slice(1);
    const current = tabs.some(tab => tab.dataset.tab === requested) ? requested : 'tasks';
    for (const tab of tabs) {
        const name = tab.dataset.tab;
        byId(name).hidden = name !== current;
        if (name === current) tab.setAttribute('aria-current', 'page');
        else tab.removeAttribute('aria-current');
    }
}

for (const tab of tabs) {
    tab.addEventListener('click', event => {
        if (event.button || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
        event.preventDefault();
        if (location.hash === tab.hash) return;
        history.pushState(null, '', tab.hash);
        window.dispatchEvent(new Event('hashchange'));
    });
}
window.addEventListener('hashchange', selectTab);
selectTab();

function showExercise() {
    const task = tasks[level - 1];
    const solved = solvedLevels();
    const complete = solved.includes(level);
    const price = rewards.dailyCoins[level - 1];
    byId('daily-level-title').textContent = t(level + '-деңгей', 'Уровень ' + level) + ' · ' + window.PLS.LEVELS[level - 1].short;
    byId('task-value').textContent = '+ ' + coins(price);
    byId('daily-task-title').textContent = task.title;
    byId('daily-prompt').textContent = task.prompt;
    byId('daily-code').textContent = task.code;
    byId('daily-lesson').href = task.url;
    const value = complete ? task.answer : drafts[level] || '';
    if (answer.value !== value) answer.value = value;
    answer.readOnly = complete;
    answer.setAttribute('aria-invalid', String(!complete && Boolean(mistakes[level])));
    form.querySelector('button').disabled = complete || claimPending || !rewards.loaded;
    byId('daily-next').hidden = !complete || solved.length === levels.length;
    if (complete) {
        feedback.dataset.tone = 'success';
        feedback.textContent = t('Орындалды', 'Решено') + ' · +' + coins(price) + ' · +' + rewards.xpRates.daily + ' XP. ' + task.explanation;
    } else if (mistakes[level]) {
        feedback.dataset.tone = 'error';
        feedback.textContent = t('Әзірге қате. Кодты жол бойынша қарап, қайта көріңіз.', 'Пока неверно. Пройдите по коду строка за строкой и попробуйте ещё раз.');
    } else {
        delete feedback.dataset.tone;
        feedback.textContent = '';
    }
}

function renderTasks() {
    const solved = solvedLevels();
    byId('daily-progress').textContent = t('Бүгін орындалғаны', 'Решено сегодня') + ' · ' + solved.length + ' / ' + levels.length;
    byId('daily-meter').value = solved.length;
    for (const button of levels) {
        const i = Number(button.dataset.dailyLevel);
        const complete = solved.includes(i);
        button.setAttribute('aria-pressed', String(i === level));
        button.classList.toggle('earned', complete);
        button.querySelector('.level-status').textContent = complete ? '✓ ' + t('Орындалды', 'Решено') : '+' + coins(rewards.dailyCoins[i - 1]);
    }
    showExercise();
}

for (const button of levels) button.addEventListener('click', () => {
    level = Number(button.dataset.dailyLevel);
    renderTasks();
});
byId('daily-next').addEventListener('click', () => {
    for (let step = 1; step <= levels.length; step++) {
        const candidate = (level - 1 + step) % levels.length + 1;
        if (!solvedLevels().includes(candidate)) {
            level = candidate;
            renderTasks();
            answer.focus();
            return;
        }
    }
});

answer.addEventListener('input', () => {
    drafts[level] = answer.value;
    if (mistakes[level]) {
        delete mistakes[level];
        showExercise();
    }
});

function matches(value, expected) {
    const trimmed = value.trim();
    if (!/^-?\d+$/.test(expected)) return trimmed === expected;
    return /^[+-]?\d+(?:[.,]0+)?$/.test(trimmed) && Number(trimmed.replace(',', '.')) === Number(expected);
}

form.addEventListener('submit', async event => {
    event.preventDefault();
    if (tick() || claimPending || solvedLevels().includes(level)) return;
    drafts[level] = answer.value;
    if (!matches(answer.value, tasks[level - 1].answer)) {
        mistakes[level] = true;
        showExercise();
        answer.focus();
        return;
    }
    const submittedDay = day;
    const submittedLevel = level;
    claimPending = true;
    showExercise();
    const result = await rewards.claimDaily(submittedDay, submittedLevel);
    claimPending = false;
    tick();
    renderTasks();
    if (result.error && submittedDay === day && submittedLevel === level) {
        feedback.dataset.tone = 'success';
        feedback.textContent = t('Жауап дұрыс. ', 'Ответ верный. ') + tasks[level - 1].explanation;
    }
});

window.courseLanguage.preserveActivity(
    () => ({day, level, drafts, mistakes}),
    saved => {
        if (saved.day !== day || !levels[saved.level - 1]) return;
        level = saved.level;
        drafts = saved.drafts || {};
        mistakes = saved.mistakes || {};
    }
);

function renderAchievements() {
    const state = rewards.state;
    const streak = rewards.streak(state.days, day);
    byId('streak-count').textContent = streak.current;
    byId('streak-best').textContent = t('Ең ұзақ серия', 'Самая длинная серия') + ' · ' + streak.best;
    const week = document.createDocumentFragment();
    for (let d = day - 6; d <= day; d++) {
        const item = document.createElement('li');
        const label = document.createElement('span');
        const mark = document.createElement('b');
        const active = state.days.includes(d);
        const date = dateFor(d);
        item.classList.toggle('earned', active);
        if (d === day) item.setAttribute('aria-current', 'date');
        item.setAttribute('aria-label', fullDate.format(date) + ' · ' + (active ? t('Сабақ оқыдыңыз', 'Было занятие') : t('Белгі жоқ', 'Занятие не отмечено')));
        label.textContent = weekday.format(date);
        mark.textContent = active ? '✓' : date.getUTCDate();
        item.append(label, mark);
        week.append(item);
    }
    byId('streak-week').replaceChildren(week);
    const {done} = window.PLS.load();
    for (const card of hub.querySelectorAll('[data-module]')) {
        const id = Number(card.dataset.module);
        const lessons = window.PLS.LEVELS[id - 1].lessons;
        const earned = state.modules.includes(id);
        card.classList.toggle('earned', earned);
        const count = lessons.filter(lesson => done[lesson.url]).length;
        card.querySelector('.module-progress').textContent = earned
            ? '✓ ' + t('Белгі алынды', 'Значок получен')
            : t('Аяқталған сабақтар', 'Пройдено уроков') + ' · ' + count + ' / ' + lessons.length;
    }
}

function renderShop() {
    const {balance, owned, skin} = rewards.state;
    for (const card of skins) {
        const name = card.dataset.shopSkin;
        const price = rewards.prices[name];
        const active = name === skin;
        const unlocked = owned.includes(name);
        const missing = !unlocked && balance < price;
        const priceEl = card.querySelector('[data-price]');
        if (priceEl) priceEl.textContent = price;
        card.classList.toggle('equipped', active);
        const button = card.querySelector('[data-skin-action]');
        button.disabled = active || missing || shopPending || !rewards.loaded;
        button.textContent = active ? '✓ ' + t('Қосулы', 'Включено') : unlocked ? t('Қосу', 'Включить') : t('Сатып алу', 'Купить');
        const note = card.querySelector('[data-skin-note]');
        if (note) note.textContent = unlocked ? t('Жинағыңызда бар', 'Уже в коллекции') : missing
            ? t('Тағы ' + coins(price - balance) + ' қажет', 'Нужно ещё ' + coins(price - balance))
            : t('Сатып алғанда бірден қосылады', 'Включится сразу после покупки');
    }
}

for (const card of skins) card.querySelector('[data-skin-action]').addEventListener('click', async () => {
    if (shopPending) return;
    shopPending = true;
    renderShop();
    const result = await rewards.chooseSkin(card.dataset.shopSkin);
    shopPending = false;
    renderShop();
    const message = byId('shop-feedback');
    message.dataset.tone = result.error || result.insufficient ? 'error' : 'success';
    if (result.error) message.textContent = t('Таңдауды сақтау мүмкін болмады. Қайта көріңіз.', 'Не удалось сохранить выбор. Попробуйте ещё раз.');
    else if (result.insufficient) message.textContent = t('Монеталар жеткіліксіз.', 'Пока недостаточно монет.');
    else message.textContent = card.querySelector('h3').textContent + ' · ' + (result.purchased
        ? t('Сатып алынды және қосылды', 'Куплено и включено') : t('Безендіру қосылды', 'Оформление включено'));
});

function render() {
    const time = byId('daily-date');
    time.dateTime = dateFor(day).toISOString().slice(0, 10);
    time.textContent = fullDate.format(dateFor(day));
    byId('reward-storage-issue').hidden = rewards.available;
    renderTasks();
    renderAchievements();
    renderShop();
}

function tick() {
    const now = Date.now();
    const today = rewards.dayAt(now);
    const changed = today !== day;
    if (changed) {
        day = today;
        tasks = dailyTasks(day);
        drafts = {};
        mistakes = {};
        render();
        byId('daily-announcement').textContent = t('Жаңа күн басталды. Тапсырмалар жаңарды.', 'Наступил новый день. Открыт свежий набор задач.');
    }
    const left = Math.ceil((rewards.nextReset(day) - now) / 1000);
    byId('daily-clock').textContent = [Math.floor(left / 3600), Math.floor(left / 60) % 60, left % 60]
        .map(part => String(part).padStart(2, '0')).join(':');
    return changed;
}

document.addEventListener('course:rewards', render);
window.addEventListener('storage', event => {
    if (event.key === 'pls_progress_v1') renderAchievements();
});
window.addEventListener('pageshow', tick);
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
render();
tick();
setInterval(tick, 1000);
