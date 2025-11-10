// include.js
document.addEventListener('DOMContentLoaded', () => {
    const includes = document.querySelectorAll('include-html');
    let loaded = 0;

    if (!includes.length) {
        dispatchEvent(new Event('componentsLoaded'));
        return;
    }

    includes.forEach(el => {
        const src = el.getAttribute('src');
        fetch(src)
            .then(r => r.text())
            .then(html => {
                el.outerHTML = html;
                if (++loaded === includes.length) {
                    dispatchEvent(new Event('componentsLoaded'));
                }
            })
            .catch(err => {
                console.error(`Failed to load ${src}`, err);
                el.outerHTML = `<div style="color:red">Error: ${src}</div>`;
            });
    });
});