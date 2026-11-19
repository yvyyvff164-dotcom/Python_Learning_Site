export function motionView(task) {
    const t = window.courseText;
    const field = document.getElementById('motion-field');
    const piece = document.getElementById('motion-piece');
    const play = document.getElementById('motion-play');
    const step = document.getElementById('motion-step');
    const position = document.getElementById('motion-position');
    let frames = [task.start], index = 0, timer;
    field.dataset.scene = task.id;
    field.style.setProperty('--goal-x',task.axis === 'vertical' ? 3 : task.limit);
    field.style.setProperty('--goal-y',task.axis === 'vertical' ? task.limit : 3);
    function draw() {
        const value = frames[index];
        const bounded = Math.max(0,Math.min(6,value));
        piece.style.setProperty('--x',task.axis === 'vertical' ? 3 : bounded);
        piece.style.setProperty('--y',task.axis === 'vertical' ? bounded : 3);
        piece.hidden = bounded !== value;
        position.textContent = t('Такт ', 'Такт ') + index + ' · ' + (task.axis === 'vertical' ? 'y' : 'x') + ' = ' + value;
    }
    function stop() { clearInterval(timer); }
    function replay() {
        stop(); index = 0; draw();
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) { index = frames.length-1; draw(); return; }
        timer = setInterval(() => {
            if (index < frames.length-1) { index++; draw(); }
            if (index === frames.length-1) stop();
        }, 420);
    }
    play.onclick = replay;
    step.onclick = () => { stop(); index = (index+1) % frames.length; draw(); };
    draw();
    return {stop, setFrames(values) { frames = values; play.disabled = step.disabled = values.length < 2; replay(); }};
}
