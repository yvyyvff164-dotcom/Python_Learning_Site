(() => {
    const section = document.body.dataset.section;
    const links = [...document.querySelectorAll('.studio-route[data-route]')];
    const contextLabel = document.querySelector('.section-context strong');
    const initialLabel = contextLabel.textContent;
    function updateNavigation() {
        const hash = window.location.hash.slice(1);
        let current = section;
        if (section === 'home' && /^(levels|level-\d+)$/.test(hash)) current = 'lessons';
        if (section === 'daily' && ['shop', 'achievements'].includes(hash)) current = hash;
        if (section === 'mini_game') current = 'games';
        if (document.body.classList.contains('course-lesson')) current = 'lessons';
        for (const link of links) {
            const route = section === 'daily' && link.closest('.studio-dock') ? 'daily' : current;
            if (link.dataset.route === route) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        }
        const selected = links.find(link => link.dataset.route === current);
        contextLabel.textContent = selected?.getAttribute('aria-label') || initialLabel;
    }
    updateNavigation();
    window.addEventListener('hashchange', updateNavigation);
    window.addEventListener('pageshow', updateNavigation);

    for (const button of document.querySelectorAll('.btn-run, [data-practice-submit]')) {
        const glyph = document.createElement('span');
        glyph.className = 'ui-icon ' + (button.matches('.btn-run') ? 'i-play-fill' : 'i-check2-circle');
        glyph.dataset.floatIcon = '';
        glyph.setAttribute('aria-hidden', 'true');
        button.prepend(glyph, ' ');
    }

    const hero = document.querySelector('.studio-hero');
    if (!hero) return;
    const exhibit = hero.querySelector('.studio-exhibit');
    const motion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame = 0;
    function followPointer(event) {
        if (!motion.matches || frame) return;
        frame = window.requestAnimationFrame(() => {
            const box = hero.getBoundingClientRect();
            const dx = (event.clientX - box.left) / box.width - .5;
            const dy = (event.clientY - box.top) / box.height - .5;
            exhibit.style.setProperty('--parallax-x', (dx * 13).toFixed(1) + 'px');
            exhibit.style.setProperty('--parallax-y', (dy * 10).toFixed(1) + 'px');
            frame = 0;
        });
    }
    function resetPosition() {
        window.cancelAnimationFrame(frame);
        frame = 0;
        exhibit.style.removeProperty('--parallax-x');
        exhibit.style.removeProperty('--parallax-y');
    }
    hero.addEventListener('pointermove', followPointer, {passive:true});
    hero.addEventListener('pointerleave', resetPosition);
    motion.addEventListener('change', resetPosition);
})();
