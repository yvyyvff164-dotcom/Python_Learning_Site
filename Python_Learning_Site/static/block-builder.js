import {shuffled} from './game-challenges.js';

export function blockBuilder(task, round, onChange) {
    const t = window.courseText;
    const bank = document.getElementById('block-bank');
    const assembly = document.getElementById('assembly-bin');
    const order = document.getElementById('block-order');
    const pool = shuffled(task.pieces.map((_,i) => i), round.seed);
    if (pool.every((value,i) => value === i)) pool.reverse();
    let dragged = null;

    function control(label, symbol, action, disabled = false) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = symbol;
        button.title = label;
        button.setAttribute('aria-label', label);
        button.disabled = disabled || round.solved;
        button.addEventListener('click', action);
        return button;
    }
    function drag(el, id) {
        el.draggable = !round.solved;
        el.dataset.piece = id;
        el.addEventListener('dragstart', event => {
            dragged = id;
            event.dataTransfer.setData('text/plain', String(id));
            event.dataTransfer.effectAllowed = 'move';
        });
        el.addEventListener('dragend', () => { dragged = null; assembly.classList.remove('drop-active'); });
    }
    function move(id, slot) {
        const next = round.order.filter(value => value !== id);
        if (slot !== null) next.splice(slot, 0, id);
        if (round.solved || String(next) === String(round.order)) return;
        onChange(next);
        render();
    }
    function render() {
        bank.parentElement.hidden = round.solved;
        assembly.parentElement.classList.toggle('assembled',round.solved);
        document.querySelector('.game-instruction').hidden = round.solved;
        bank.replaceChildren();
        order.replaceChildren();
        for (const id of pool.filter(id => !round.order.includes(id))) {
            const label = task.pieces[id][0];
            const piece = control(t('Жинаққа қосу', 'Добавить в сборку') + ' · ' + label, label, () => move(id, round.order.length));
            piece.className = 'snap-piece';
            drag(piece,id);
            bank.append(piece);
        }
        round.order.forEach((id,index) => {
            const row = document.createElement('li');
            const label = task.pieces[id][0];
            drag(row,id);
            const name = document.createElement('span');
            name.textContent = label;
            const actions = document.createElement('div');
            actions.className = 'piece-actions';
            const shift = (by) => {
                move(id,index+by);
                const target = order.querySelector('[data-piece="' + id + '"] button:not(:disabled)');
                target?.focus();
            };
            actions.append(control(t('Жоғары', 'Выше')+' · '+label, '↑', () => shift(-1), index===0),
                control(t('Төмен', 'Ниже')+' · '+label, '↓', () => shift(1), index===round.order.length-1),
                control(t('Алып тастау', 'Убрать')+' · '+label, '×', () => {move(id,null); bank.querySelector('[data-piece="' + id + '"]')?.focus();}));
            row.append(name);
            if (!round.solved) row.append(actions);
            order.append(row);
        });
        document.getElementById('block-empty').hidden = round.order.length > 0;
        document.getElementById('built-code').textContent = round.order.map(id => task.pieces[id][1]).join('\n') || t('# Блоктарды қосыңыз', '# Добавьте блоки');
    }
    assembly.ondragover = event => {
        if (dragged === null || round.solved) return;
        event.preventDefault();
        assembly.classList.add('drop-active');
    };
    assembly.ondragleave = event => {
        if (!assembly.contains(event.relatedTarget)) assembly.classList.remove('drop-active');
    };
    assembly.ondrop = event => {
        if (dragged === null || round.solved) return;
        event.preventDefault();
        assembly.classList.remove('drop-active');
        const item = event.target.closest('#block-order li');
        let slot = round.order.filter(id => id !== dragged).length;
        if (item) {
            const target = Number(item.dataset.piece);
            if (target === dragged) return;
            const bounds = item.getBoundingClientRect();
            slot = round.order.filter(id => id !== dragged).indexOf(target) + Number(event.clientY >= bounds.top + bounds.height/2);
        }
        move(dragged,slot);
        dragged = null;
    };
    bank.ondragover = event => { if (dragged !== null && !round.solved) event.preventDefault(); };
    bank.ondrop = event => {
        event.preventDefault();
        if (dragged !== null) move(dragged,null);
        dragged = null;
    };
    render();
}
