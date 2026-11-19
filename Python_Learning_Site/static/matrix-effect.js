const duration = 5000;
let activeEffect;

function digit() {
    const roll = Math.random();
    if (roll < .005) return '0.2';
    if (roll < .025) return '2';
    return roll < .51 ? '0' : '1';
}

export function showMatrixEffect() {
    if (activeEffect) {
        activeEffect.extend();
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'matrix-effect';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.inert = true;
    document.body.append(overlay);
    document.documentElement.classList.add('matrix-active');

    let timer;
    let columnCount = 0;
    function renderStreams() {
        const count = Math.min(96, Math.max(1, Math.ceil(overlay.clientWidth / 24)));
        if (columnCount === count) return;
        columnCount = count;
        const streams = document.createDocumentFragment();
        for (let index = 0; index < count; index++) {
            const stream = document.createElement('span');
            stream.className = 'matrix-stream';
            const seconds = 2.8 + Math.random() * 3.2;
            const length = 8 + Math.floor(Math.random() * 16);
            stream.style.left = (index + Math.random() * .4) / count * 100 + '%';
            stream.style.fontSize = (12 + Math.random() * 5) + 'px';
            stream.style.setProperty('--fall-time', seconds + 's');
            stream.style.setProperty('--fall-delay', -Math.random() * seconds + 's');
            stream.style.setProperty('--still-y', (-16 + Math.random() * 106) + '%');
            stream.textContent = Array.from({length}, digit).join('\n');
            stream.dataset.head = digit();
            streams.append(stream);
        }
        overlay.replaceChildren(streams);
    }

    function stop() {
        clearTimeout(timer);
        window.removeEventListener('resize', renderStreams);
        window.removeEventListener('pagehide', stop);
        document.documentElement.classList.remove('matrix-active');
        overlay.remove();
        activeEffect = undefined;
    }
    function extend() {
        clearTimeout(timer);
        timer = setTimeout(stop, duration);
    }

    activeEffect = {extend};
    renderStreams();
    window.addEventListener('resize', renderStreams);
    window.addEventListener('pagehide', stop);
    extend();
}
