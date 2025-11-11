console.log('[ui.js] loaded');

const UI = {
    els: {},

    init() {
        console.log('[UI] init()');
        this.cache();
        this.renderThumbnails();
        this.bindSpeed();
        this.initToggle();
    },

    cache() {
        this.els = {
            thumbs: document.getElementById('thumbnail-list'),
            progress: document.getElementById('progress-fill'),
            speed: document.getElementById('speed'),
            speedVal: document.getElementById('speed-value'),
            img: document.getElementById('current-slide'),
            sidebar: document.getElementById('sidebar'),
            toggle: document.getElementById('sidebar-toggle')
        };
        console.log('[UI] cached elements:', Object.keys(this.els));
    },

    async renderThumbnails() {
        const images = await Player.getImages();
        console.log('[UI] rendering thumbnails, count:', images.length);
        if (!this.els.thumbs) return console.error('[UI] thumbnail-list missing');

        const frag = document.createDocumentFragment();
        images.forEach((img, i) => {
            const thumb = document.createElement('img');
            thumb.src = img.src;
            thumb.className = 'thumbnail';
            thumb.dataset.index = i;
            thumb.onclick = () => Player.goTo(i);
            frag.appendChild(thumb);
        });
        this.els.thumbs.innerHTML = '';
        this.els.thumbs.appendChild(frag);

        if (window.innerWidth < 768 && images.length) {
            this.els.sidebar?.classList.add('open');
            this.els.toggle && (this.els.toggle.textContent = 'X');
        }
    },

    updateProgress(idx, total) {
        const pct = total ? (idx / (total - 1)) * 100 : 0;
        this.els.progress && (this.els.progress.style.width = pct + '%');
    },

    setActiveThumb(idx) {
        document.querySelectorAll('.thumbnail').forEach((t, i) => t.classList.toggle('active', i === idx));
    },

    updateImage(src) {
        if (!this.els.img) return console.error('[UI] current-slide missing');
        console.log('[UI] setting image src:', src);
        this.els.img.src = src;
        this.els.img.onerror = () => {
            console.warn('[UI] image failed to load:', src);
            this.els.img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSIgZm9udC1zaXplPSIzMiIgZmlsbD0iI2FhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5PIElNQUdFPC90ZXh0Pjwvc3ZnPg==';
        };
    },

    showError(msg) {
        const area = document.getElementById('image-area');
        if (area) {
            area.innerHTML = `<div style="color:#faa;text-align:center;padding:40px;">${msg}</div>`;
        }
    },

    bindSpeed() {
        this.els.speed && this.els.speed.addEventListener('input', e => {
            const s = parseFloat(e.target.value).toFixed(1);
            this.els.speedVal && (this.els.speedVal.textContent = s + 'x');
            Player.setSpeed(s);
        });
    },

    initToggle() {
        if (!this.els.toggle || !this.els.sidebar) return;
        this.els.toggle.addEventListener('click', () => {
            this.els.sidebar.classList.toggle('open');
            this.els.toggle.textContent = this.els.sidebar.classList.contains('open') ? 'X' : 'Menu';
        });
    }
};