const UI = {
    els: {},

    init() {
        this.cache();
        this.renderThumbnails();
        this.bindSpeed();
    },

    cache() {
        this.els = {
            thumbs: document.getElementById('thumbnail-list'),
            progress: document.getElementById('progress-fill'),
            speed: document.getElementById('speed'),
            speedVal: document.getElementById('speed-value'),
            img: document.getElementById('current-slide')
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
    }
};