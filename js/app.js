// === CONFIG ===
const CATALOG_URL = 'json/catalog.json';
const IMAGES_BASE = 'json';

// === STATE ===
let catalog = {};
let images = [];
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
    closeAbout: document.getElementById('close-about'),
    placeholder: document.getElementById('placeholder')
};

// === LOAD CATALOG ===
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

        els.status.textContent = 'Select Year and Product';
    } catch (err) {
        console.error(err);
        els.status.textContent = 'Failed to load catalog';
    }
}

// Year → Product
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

// Product → Load Images
els.product.onchange = async () => {
    const year = els.year.value;
    const product = els.product.value;
    if (!year || !product) return;

    const filename = catalog[year][product];
    const url = `${IMAGES_BASE}/${filename}`;

    try {
        els.status.textContent = `Loading ${filename}...`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`File not found: ${filename}`);

        images = await res.json();
        if (!Array.isArray(images) || images.length === 0) throw new Error('No images');

        // Switch to real image
        els.placeholder.style.display = 'none';
        els.slide.style.display = 'block';

        current = 0;
        updateSliderMax();
        show(0);
        els.count.textContent = images.length;
        els.status.textContent = `Loaded ${images.length} images`;
    } catch (err) {
        console.warn(err);
        resetPlayer();
        els.status.textContent = `No data for ${product}`;
    }
};

// === PLAYER ===
function resetPlayer() {
    images = [];
    current = 0;
    pause();
    els.slide.src = '';
    els.slide.style.display = 'none';
    els.placeholder.style.display = 'flex';
    els.curNum.textContent = '0';
    els.count.textContent = '0';
    updateProgress();
    updateSliderMax();
}

function show(idx) {
    if (images.length === 0) return;
    current = idx % images.length;
    els.slide.src = images[current].src;
    els.curNum.textContent = current + 1;
    updateProgress();
}
function next() { show(current + 1); if (playing) restart(); }
function prev() { show(current - 1); if (playing) restart(); }

function toggle() { playing ? pause() : play(); }
function play() {
    if (images.length < 2) return;
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
        if (!document.getElementById('loop').checked && current === images.length - 1) {
            pause(); return;
        }
        next();
    }, delay);
}
function restart() { if (playing) start(); }

function updateProgress() {
    if (images.length <= 1) {
        els.progress.style.width = '0%';
        els.thumb.style.left = '0%';
        return;
    }
    const pct = (current / (images.length - 1)) * 100;
    els.progress.style.width = pct + '%';
    els.thumb.style.left = pct + '%';
    els.slider.value = current;
}
function updateSliderMax() {
    els.slider.max = Math.max(0, images.length - 1);
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

// About
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