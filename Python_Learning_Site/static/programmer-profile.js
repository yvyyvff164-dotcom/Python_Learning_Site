const rewards = window.CourseRewards;
const t = window.courseText;
const byId = id => document.getElementById(id);
const cards = [...document.querySelectorAll('[data-title]')];
let saving = false;

function render() {
    const state = rewards.state;
    const p = rewards.profile();
    byId('profile-level').textContent = t(p.level+'-деңгей','Уровень '+p.level);
    byId('profile-rank').textContent = p.rank;
    byId('profile-xp').textContent = p.xp+' XP';
    const meter=byId('xp-progress');
    meter.max = p.next ? p.next[0]-p.floor : 1;
    meter.value = p.next ? p.xp-p.floor : 1;
    byId('profile-next').textContent = p.next ? t('Келесі деңгейге дейін','До следующего уровня')+' · '+(p.next[0]-p.xp)+' XP · '+p.next[1] : t('Ең жоғары деңгей', 'Высший уровень');
    const selected = p.titles.find(title=>title.id===state.title);
    byId('active-title').textContent = selected?.name || '';
    byId('active-title').hidden = !selected;
    const course = window.PLS.LEVELS.flatMap(level=>level.lessons);
    const done = window.PLS.load().done;
    const counts = {lessons:course.filter(lesson=>done[lesson.url]).length+' / '+course.length,games:p.games,daily:p.daily,practice:state.practice.length,streak:rewards.streak(state.days).current,coins:state.balance};
    for (const [name,value] of Object.entries(counts)) byId('stat-'+name).textContent=value;
    for (const card of cards) {
        const title = p.titles.find(title=>title.id === card.dataset.title);
        const unlocked = title.count >= title.goal;
        const worn = state.title === title.id;
        card.classList.toggle('unlocked',unlocked);
        card.classList.toggle('worn',worn);
        card.querySelector('[data-counter]').textContent = unlocked ? '✓ '+t('Ашылды','Открыт') : Math.min(title.count,title.goal)+' / '+title.goal;
        const button = card.querySelector('[data-wear]');
        button.hidden = !unlocked;
        button.disabled = saving;
        button.setAttribute('aria-pressed',String(worn));
        button.textContent = worn ? t('Шешу','Снять') : t('Тағу','Выбрать');
    }
    byId('profile-storage').hidden = rewards.available;
}
for (const card of cards) card.querySelector('[data-wear]').onclick = async () => {
    if (saving) return;
    const id = rewards.state.title === card.dataset.title ? '' : card.dataset.title;
    saving = true; render();
    const result = await rewards.chooseTitle(id);
    saving = false; render();
    byId('title-notice').textContent = result.error || result.locked ? t('Атақты сақтау мүмкін болмады.', 'Не удалось сохранить титул.') : (id ? t('Таңдалған атақ', 'Выбран титул') + ' · ' + card.querySelector('h3').textContent : t('Атақ шешілді.', 'Титул снят.'));
};
for (const [xp,name] of rewards.ranks) {
    const li=document.createElement('li');
    li.textContent=name+' · '+xp+' XP';
    byId('rank-ladder').append(li);
}
document.addEventListener('course:rewards',render);
window.addEventListener('storage',e=>{ if(e.key === 'pls_progress_v1') render(); });
render();
