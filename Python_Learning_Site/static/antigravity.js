// The layer paints copies. The original controls keep their layout, names, and hit areas.
let stopEffect = null;

export function setAntigravity(enabled) {
    if (!enabled) {
        stopEffect?.();
        return;
    }
    if (stopEffect) return;

    const layer = document.createElement('div');
    layer.className = 'antigravity-sky';
    layer.setAttribute('aria-hidden', 'true');
    layer.inert = true;
    document.body.append(layer);

    const copies = new Map();
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let pendingFrame = 0;

    function removeCopy(source, copy) {
        copy.flight?.cancel();
        copy.glyph.remove();
        source.removeAttribute('data-weightless');
        copies.delete(source);
    }

    function refresh() {
        pendingFrame = 0;
        const width = layer.clientWidth;
        const height = layer.clientHeight;
        if (!width || !height) return;

        const visible = [];
        const found = new Set();
        for (const source of document.querySelectorAll('[data-float-icon]')) {
            const rect = source.getBoundingClientRect();
            if (!rect.width || !rect.height || source.closest('[hidden], [inert]')) continue;
            const style = getComputedStyle(source);
            if (style.visibility !== 'visible' || (source.checkVisibility && !source.checkVisibility())) continue;
            const before = getComputedStyle(source, '::before').content;
            const label = source.textContent.trim() || (/^".*"$/.test(before) ? before.slice(1, -1) : '');
            if (!label) continue;

            found.add(source);
            let copy = copies.get(source);
            if (!copy) {
                const glyph = document.createElement('span');
                glyph.className = 'antigravity-glyph';
                layer.append(glyph);
                copy = {glyph, flight: null, destination: '', rect};
                copies.set(source, copy);
                source.setAttribute('data-weightless', '');
            }
            const glyph = copy.glyph;
            if (glyph.textContent !== label) glyph.textContent = label;
            // Keep the actual icon's type, colors and badge outline in either theme.
            for (const property of ['fontFamily', 'fontSize', 'fontWeight', 'color', 'backgroundColor',
                'backgroundImage', 'borderRadius', 'border', 'textShadow']) {
                glyph.style[property] = style[property];
            }
            glyph.style.width = rect.width + 'px';
            glyph.style.height = rect.height + 'px';
            copy.rect = rect;
            visible.push(copy);
        }
        for (const [source, copy] of copies) {
            if (!found.has(source)) removeCopy(source, copy);
        }
        if (!visible.length) return;

        // Allocate ceiling space in screen order so icons from the same sidebar column stay distinct.
        visible.sort((a, b) => a.rect.left - b.rect.left);
        const gap = 3;
        const total = visible.reduce((sum, item) => sum + item.rect.width + gap, 0);
        const scale = Math.min(1, width / total);
        let freeFrom = 0;
        let remaining = total * scale;
        for (const copy of visible) {
            const {glyph, rect} = copy;
            const left = Math.max(freeFrom, Math.min(rect.left, width - remaining));
            const space = (rect.width + gap) * scale;
            freeFrom = left + space;
            remaining -= space;
            const destination = `translate(${left}px, 1px) scale(${scale})`;
            if (destination === copy.destination) continue;

            const start = copy.destination ? glyph.getBoundingClientRect() : rect;
            const x = Math.max(0, Math.min(width - rect.width, start.left));
            const y = Math.max(1, Math.min(height, start.top));
            copy.flight?.cancel();
            copy.destination = destination;
            glyph.style.transform = destination;
            if (!motion.matches) {
                copy.flight = glyph.animate([
                    {transform: `translate(${x}px, ${y}px) scale(${scale})`, easing: 'ease-in'},
                    {offset: .82, transform: destination, easing: 'ease-out'},
                    {offset: .91, transform: `translate(${left}px, 5px) scale(${scale})`, easing: 'ease-in'},
                    {transform: destination}
                ], {duration: 400 + Math.min(950, y)});
            }
        }
    }

    function schedule() {
        if (!pendingFrame) pendingFrame = requestAnimationFrame(refresh);
    }
    function reduceMotion() {
        if (motion.matches) {
            for (const copy of copies.values()) copy.flight?.finish();
        }
    }

    const observer = new MutationObserver(records => {
        if (records.some(record => !layer.contains(record.target))) schedule();
    });
    stopEffect = () => {
        observer.disconnect();
        cancelAnimationFrame(pendingFrame);
        window.removeEventListener('resize', schedule);
        window.removeEventListener('pagehide', stopEffect);
        motion.removeEventListener('change', reduceMotion);
        for (const [source, copy] of copies) removeCopy(source, copy);
        layer.remove();
        stopEffect = null;
    };
    window.addEventListener('resize', schedule);
    window.addEventListener('pagehide', stopEffect);
    motion.addEventListener('change', reduceMotion);
    refresh();
    observer.observe(document.body, {
        subtree: true, childList: true, characterData: true, attributes: true,
        attributeFilter: ['open', 'hidden', 'inert', 'class']
    });
    observer.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
}
