const UI = {
    els: {},

    init() {
        this.cache();
        this.renderThumbnails();
        this.bindSpeed();
        this.initMobileToggle();
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
    },

    async renderThumbnails() {
        const images = await Player.getImages();
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

        if (window.innerWidth < 768 && images.length > 0) {
            this.els.sidebar.classList.add('open');
            if (this.els.toggle) this.els.toggle.textContent = 'X';
        }
    },

    updateProgress(idx, total) {
        const pct = total ? (idx / (total - 1)) * 100 : 0;
        this.els.progress.style.width = `${pct}%`;
    },

    setActiveThumb(idx) {
        document.querySelectorAll('.thumbnail').forEach((t, i) => {
            t.classList.toggle('active', i === idx);
        });
    },

    updateImage(src) {
        this.els.img.src = src;
    },

    bindSpeed() {
        this.els.speed.addEventListener('input', (e) => {
            const s = parseFloat(e.target.value).toFixed(1);
            this.els.speedVal.textContent = `${s}x`;
            Player.setSpeed(s);
        });
    },

    initMobileToggle() {
        if (!this.els.toggle || !this.els.sidebar) return;
        this.els.toggle.addEventListener('click', () => {
            this.els.sidebar.classList.toggle('open');
            const isOpen = this.els.sidebar.classList.contains('open');
            this.els.toggle.textContent = isOpen ? 'X' : 'Menu';
        });
        if (this.els.sidebar.classList.contains('open')) {
            this.els.toggle.textContent = 'X';
        }
    }
};