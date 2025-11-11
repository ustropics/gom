console.log('[include.js] loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('[include.js] DOM ready – scanning <include-html>');
    const els = document.querySelectorAll('include-html');
    let loaded = 0;

    if (!els.length) {
        console.log('[include.js] No components – dispatching componentsLoaded');
        dispatchEvent(new Event('componentsLoaded'));
        return;
    }

    els.forEach(el => {
        const src = el.getAttribute('src');
        console.log(`[include.js] fetching ${src}`);
        fetch(src)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.text();
            })
            .then(html => {
                console.log(`[include.js] ${src} → OK`);
                el.outerHTML = html;
                if (++loaded === els.length) {
                    console.log('[include.js] ALL components loaded – dispatching componentsLoaded');
                    dispatchEvent(new Event('componentsLoaded'));
                }
            })
            .catch(err => {
                console.error(`[include.js] ${src} FAILED`, err);
                el.outerHTML = `<div style="color:red;padding:10px;">ERROR: ${src}</div>`;
            });
    });
});