// === CONFIG ===
const CATALOG_URL = 'json/catalog.json';   // <-- changed from static/json
const IMAGES_BASE = 'json';                // <-- changed from static/json

// === STATE ===
let catalog = {};
let images = [];
let filtered = [];
let current = 0;
let playing = false;
let speed = 1;
let timer = null;

// === DOM ===
const els = {
    slide:   document.getElementById('current-slide'),
    progress:document.getElementById('progress-fill'),
    thumb:   document.getElementById('progress-thumb'),
    slider:  document.getElementById('progress-slider'),
    status:  document.getElementById('status'),
    count:   document.getElementById('image-count'),
    curNum:  document.getElementById('current-num'),
    year:    document.getElementById('year-filter'),
    product: document.getElementById('product-filter'),
    about:   document.getElementById('about-panel'),
    aboutBtn: document.getElementById('about-btn'),
    closeAbout: document.getElementById('close-about')
};

// === BUILD DROPDOWNS FROM CATALOG ===
async function loadCatalog() {
    try {
        const res = await fetch(CATALOG_URL);
        if (!res.ok) throw new Error('Catalog not found');
        catalog = await res.json();

        // Populate Year dropdown
        els.year.innerHTML = '<option value="">Select Year</option>';
        Object.keys(catalog).sort().reverse().forEach(year => {
            const opt = document.createElement('option');
            opt.value = year;
            opt.textContent = year;
            els.year.appendChild(opt);
        });

        els.status.textContent = 'Catalog loaded. Select Year.';
    } catch (err) {
        console.error(err);
        els.status.textContent = 'Failed to load catalog';
    }
}

// Update Product dropdown when Year changes
els.year.onchange = () => {
    const year = els.year.value;
    els.product.innerHTML = '<option value="">Select Product</option>';
    els.product.disabled = !year;

    if (year && catalog[year]) {
        Object.keys(catalog[year]).sort().forEach(product => {
            const opt = document.createElement('option');
            opt.value = product;
            opt.textContent = product;
            els.product.appendChild(opt);
        });
    }
    resetPlayer();
};

// === LOAD IMAGES FOR SELECTED PRODUCT ===
els.product.onchange = async () => {
    const year = els.year.value;
    const product = els.product.value;
    if (!year || !product) return;

    const filename = catalog[year][product];
    const url = `${IMAGES_BASE}/${filename}`;   // <-- uses new path

    try {
        els.status.textContent = `Loading ${filename}...`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`File not found: ${filename}`);

        images = await res.json();
        if (!Array.isArray(images) || images.length === 0) {
            throw new Error('No images in file');
        }

        filtered = images;
        applyFilters();
        els.status.textContent = `Loaded ${images.length} images`;
    } catch (err) {
        console.warn(err);
        resetPlayer();
        els.status.textContent = `No images for ${product}`;
    }
};

// === PLAYER LOGIC ===
function resetPlayer() {
    images = [];
    filtered = [];
    current = 0;
    pause();
    els.slide.src = '';
    els.curNum.textContent = '0';
    els.count.textContent = '0';
    updateProgress();
    updateSliderMax();
}

function applyFilters() {
    current = 0;
    updateSliderMax();
    show(0);
    els.count.textContent = filtered.length;
}

function show(idx) {
    if (filtered.length === 0) return;
    current = idx % filtered.length;

    const img = els.slide;
    img.src = filtered[current].src;

    // Force reflow to ensure object-fit works immediately
    img.onload = () => {
        if (img.naturalWidth > 1920) {
        img.src = img.src + '?width=1920'; // if using a resizer
    }

        img.style.opacity = '0';
        requestAnimationFrame(() => {
            img.style.opacity = '1';
            img.style.transition = 'opacity 0.2s ease';
        });
    };

    els.curNum.textContent = current + 1;
    updateProgress();
}

function next() { show(current + 1); if (playing) restart(); }
function prev() { show(current - 1); if (playing) restart(); }

function toggle() { playing ? pause() : play(); }
function play() {
    if (filtered.length < 2) return;
    playing = true;
    document.getElementById('play-pause').classList.add('playing');
    start();
}
function pause() {
    playing = false;
    document.getElementById('play-pause').classList.remove('playing');
    clearInterval(timer);
}
function start() {
    clearInterval(timer);
    const delay = 1000 / speed;
    timer = setInterval(() => {
        if (!document.getElementById('loop').checked && current === filtered.length - 1) {
            pause(); return;
        }
        next();
    }, delay);
}
function restart() { if (playing) start(); }

function updateProgress() {
    if (filtered.length <= 1) {
        els.progress.style.width = '0%';
        els.thumb.style.left = '0%';
        return;
    }
    const pct = (current / (filtered.length - 1)) * 100;
    els.progress.style.width = pct + '%';
    els.thumb.style.left = pct + '%';
    els.slider.value = current;
}
function updateSliderMax() {
    els.slider.max = Math.max(0, filtered.length - 1);
}

// === EVENTS ===
document.getElementById('play-pause').onclick = toggle;
document.getElementById('prev').onclick = prev;
document.getElementById('next').onclick = next;
document.getElementById('speed').oninput = (e) => {
    speed = parseFloat(e.target.value);
    document.getElementById('speed-value').textContent = speed.toFixed(1) + 'x';
    if (playing) start();
};

els.slider.addEventListener('input', (e) => {
    const idx = parseInt(e.target.value, 10);
    show(idx);
    if (playing) restart();
});

// About Panel
els.aboutBtn.onclick = () => els.about.classList.add('open');
els.closeAbout.onclick = () => els.about.classList.remove('open');
document.addEventListener('click', (e) => {
    if (els.about.classList.contains('open') && 
        !els.about.contains(e.target) && 
        e.target !== els.aboutBtn) {
        els.about.classList.remove('open');
    }
});

// Keyboard
document.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === ' ')          { e.preventDefault(); toggle(); }
});

// === START ===
window.onload = () => {
    loadCatalog();
    resetPlayer();
};