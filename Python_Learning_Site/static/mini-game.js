import {challenge} from './game-challenges.js';
import {blockBuilder} from './block-builder.js';
import {motionView} from './game-motion.js';

const t = window.courseText;
const el = id => document.getElementById(id);
const mode = el('game-room').dataset.mode;
const key = 'pls_arcade_round_v1:' + mode;
const check = el('game-check');
const editor = el('game-code');
const notice = el('game-feedback');
const rewards = window.CourseRewards;
let round, task, motion, busy = false;

function newRound(index) {
    const words = crypto.getRandomValues(new Uint32Array(4));
    return {id: Array.from(words,w => w.toString(16).padStart(8,'0')).join(''), index, seed:words[0],
        solved:false, awarded:false, wrong:false, hint:false, order:[], tried:[]};
}
function restore(saved) {
    if (saved && /^[0-9a-f]{32}$/.test(saved.id) && Number.isSafeInteger(saved.index) && saved.index >= 0 &&
        Number.isInteger(saved.seed) && Array.isArray(saved.order) && Array.isArray(saved.tried)) round = saved;
}
function save() { try { sessionStorage.setItem(key, JSON.stringify(round)); } catch {} }
try { restore(JSON.parse(sessionStorage.getItem(key))); } catch {}
window.courseLanguage.preserveActivity(() => round, restore);
if (!round) round = newRound(0);

function status(text, tone = '') { notice.textContent = text; notice.dataset.tone = tone; }
function controls() {
    if (check) check.disabled = busy || round.solved;
    if (editor) editor.readOnly = busy || round.solved;
    el('next-round').disabled = busy;
    el('game-room').setAttribute('aria-busy',String(busy));
}
function completed() {
    status((round.awarded ? t('Раунд аяқталды · +10 XP. ', 'Раунд пройден · +10 XP. ') :
        t('Раунд аяқталды. Браузер XP-ді сақтай алмады. ', 'Раунд пройден. Браузеру не удалось сохранить XP. ')) + task.why, 'success');
}
async function award() {
    busy = true;
    round.solved = true;
    save(); controls();
    const result = await rewards.finishGame(mode,round.id,task.id,!round.wrong);
    round.awarded = !result.error;
    save();
    busy = false;
    completed(); controls();
}
function miss(message) {
    round.wrong = true;
    save(); status(message,'error');
}

function runPython(payload) {
    return new Promise((resolve,reject) => {
        const worker = new Worker(new URL('./game-python-worker.js',import.meta.url));
        function finish(callback, result) {
            clearTimeout(timer);
            worker.terminate();
            window.removeEventListener('pagehide',cancel);
            callback(result);
        }
        function cancel() { finish(reject,new Error('CANCEL')); }
        const timer = setTimeout(() => finish(reject,new Error('TIME')), 8000);
        window.addEventListener('pagehide',cancel,{once:true});
        worker.onerror = () => finish(reject,new Error('LOAD'));
        worker.onmessage = event => finish(resolve,event.data);
        worker.postMessage(payload);
    });
}

function diagnostic(error) {
    const detail = String(error);
    if (detail === 'Error: STEP') return t('step функциясын екі параметрмен анықтаңыз.', 'Определите функцию step с двумя параметрами.');
    if (detail === 'Error: INTEGER') return t('step бүтін сан қайтаруы керек. return жолын тексеріңіз.', 'Функция step должна вернуть целое число. Проверьте строку с return.');
    if (detail === 'Error: OUTPUT') return t('Шығыс тым ұзын. print циклге түсіп кеткенін тексеріңіз.', 'Слишком длинный вывод. Проверьте, где вызывается print.');
    if (detail === 'Error: TIME' || detail.startsWith('TimeLimitError')) return t('Уақыт аяқталды. Циклдің тоқтау шартын тексеріңіз.', 'Время вышло. Проверьте условие остановки цикла.');
    const type = detail.split(':',1)[0];
    const tips = {
        SyntaxError: t('Жақшаларды және жол соңындағы қос нүктені тексеріңіз.', 'Проверьте скобки и двоеточие в конце строки.'),
        IndentationError: t('Блок ішіндегі жолдардың шегіністерін тексеріңіз.', 'Проверьте отступы у строк внутри блока.'),
        TypeError: t('Амалға берілген мәндердің түрін тексеріңіз.', 'Проверьте типы значений, с которыми выполняется операция.'),
        IndexError: t('Индекс тізімнің шекарасынан шықты.', 'Этот индекс выходит за границы списка.'),
        NameError: t('Айнымалыны қолданар алдында оған мән беріңіз.', 'Присвойте переменной значение до её использования.'),
        EOFError: t('Бағдарлама мысалда берілгеннен көп кіріс мәнін сұрады.', 'Программа запросила больше входных значений, чем есть в примере.')
    };
    if (Object.hasOwn(tips,type)) return tips[type]+' '+detail;
    return detail;
}
function updateTests(results = []) {
    const list = el('test-results');
    list.replaceChildren();
    task.tests.forEach((test,i) => {
        const item = results[i];
        const row = document.createElement('tr');
        const values = [test.input.join(', '),test.outputs[0], '—'];
        if (item) {
            const correct = !item.error && test.outputs.includes(item.output);
            row.dataset.correct = String(correct);
            values[2] = (correct ? '✓ ' : '× ') + (item.error ? diagnostic(item.error) : item.output || t('(бос)', '(пусто)'));
        }
        for (const value of values) { const cell = document.createElement('td'); cell.textContent=value; row.append(cell); }
        list.append(row);
    });
}
async function execute(preview = false) {
    if (busy || round.solved) return;
    busy = true; controls();
    const source = preview ? task.starter : editor.value;
    if (!preview) status(t('Тексерілуде…','Проверяем…'));
    try {
        if (mode === 'bugs') {
            const result = await runPython({mode,source,start:task.start,limit:task.limit,trials:task.trials.map(([p,limit])=>[p,limit])});
            if (result.error) {
                if (!preview) miss(diagnostic(result.error));
                return;
            }
            round.frames = result.positions;
            motion.setFrames(round.frames);
            save();
            if (preview) return;
            const failed = task.trials.findIndex((trial,i)=>result.values[i] !== trial[2]);
            const expected = [task.start];
            for (let i = 1; i < result.positions.length; i++) expected.push(task.next(expected[i-1],task.limit));
            if (failed < 0 && expected.every((value,i)=>result.positions[i] === value)) await award();
            else if (failed >= 0) {
                const [p,limit,value] = task.trials[failed];
                miss('step('+p+', '+limit+') → '+result.values[failed]+'. '+t('Күтілетін мән', 'Ожидаемое значение')+' · '+value+'.');
            } else miss(t('Бірнеше тактіні қатар тексеріңіз. Әр қадам алдыңғы координатаға тәуелді.', 'Проверьте несколько тактов подряд. Каждый шаг зависит от предыдущей координаты.'));
        } else {
            const result = await runPython({mode,source,inputs:task.tests.map(test=>test.input)});
            if (result.error) { miss(diagnostic(result.error)); return; }
            round.results = result.results;
            updateTests(round.results);
            const passed = task.tests.filter((test,i)=>!round.results[i].error && test.outputs.includes(round.results[i].output)).length;
            if (passed === task.tests.length) await award();
            else miss(t('Дұрыс мысалдар', 'Пройдено примеров')+' · '+passed+' / '+task.tests.length+'. '+t('Нәтижелерді салыстырып, кодты түзетіңіз.', 'Сравните результаты и поправьте код.'));
        }
    } catch (error) {
        if (error.message === 'CANCEL') return;
        if (error.message === 'TIME' && !preview) miss(diagnostic(error));
        else status(t('Python ортасын іске қосу мүмкін болмады. Қайта тексеріңіз.', 'Не удалось запустить Python. Попробуйте проверить ещё раз.'),'error');
    } finally { busy=false; controls(); }
}

function predictions() {
    const group = el('predict-choices');
    group.querySelectorAll('button').forEach(button=>button.remove());
    task.options.forEach((option,index) => {
        const button = document.createElement('button');
        button.type = 'button';
        const tried = round.tried.includes(option);
        button.disabled = round.solved || tried;
        const mark = document.createElement('span');
        mark.textContent = tried ? (option===task.answer?'✓':'×') : String.fromCharCode(65+index);
        mark.setAttribute('aria-hidden','true');
        button.append(mark,String(option));
        if (tried) button.dataset.correct = String(option===task.answer);
        button.onclick = () => {
            if (busy || round.solved) return;
            round.tried.push(option);
            if (option===task.answer) award();
            else miss(t('Жауап сәйкес келмейді. Мәндердің қалай өзгеретінін қайта қарап шығыңыз.', 'Ответ не совпал. Проследите ещё раз, как меняются значения.'));
            predictions();
            if (!round.solved) group.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
        };
        group.append(button);
    });
}
function mount() {
    task = challenge(mode,round.index,round.seed);
    el('round-title').textContent = task.title;
    el('round-prompt').textContent = task.prompt;
    el('hint-text').textContent = task.hint;
    el('game-hint').open = round.hint;
    const lesson = window.PLS.LEVELS.flatMap(group=>group.lessons).find(item=>item.url===task.lesson);
    el('game-lesson').href = task.lesson;
    el('game-lesson').textContent = t('Сабаққа өту', 'Перейти к уроку') + ' · ' + lesson.title + ' ↗';
    status('');
    if (editor) editor.value = round.code ?? task.starter;
    if (mode === 'bugs') {
        motion?.stop();
        motion = motionView(task);
        if (round.frames) motion.setFrames(round.frames);
        else execute(true);
    } else if (mode === 'predict') {
        el('predict-code').textContent = task.code;
        predictions();
    } else if (mode === 'build') {
        blockBuilder(task,round,order=>{
            round.order=order;
            save();
            if (order.length < task.pieces.length) { status(''); return; }
            if (order.every((value,index)=>value === index)) award();
            else miss(t('Барлық блок қосылды. Командалардың ретін тексеріңіз.', 'Все блоки на месте. Проверьте порядок команд.'));
        });
    } else updateTests(round.results);
    if (round.solved) {
        if (round.awarded) completed();
        else award();
    }
    save(); controls();
}
if (editor) {
    editor.addEventListener('input', () => {
        round.code=editor.value;
        if (mode === 'translate' && round.results) { delete round.results; updateTests(); }
        status(''); save();
    });
    editor.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); execute(); }
    });
    check.onclick = () => execute();
}
el('game-hint').ontoggle = () => { round.hint = el('game-hint').open; save(); };
el('next-round').onclick = () => {
    if (busy) return;
    round = newRound(round.index+1);
    mount();
    el('round-title').tabIndex=-1;
    el('round-title').focus();
};
window.addEventListener('pagehide',()=>motion?.stop());
window.addEventListener('pageshow',event=>{ if (event.persisted && mode === 'bugs' && !round.frames && !round.solved) execute(true); });
mount();
