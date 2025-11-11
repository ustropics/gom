console.log('[player.js] loaded');

const Player = {
    images: [], current: 0, playing: false, speed: 1, timer: null,

    async init() {
        console.log('[Player] init()');
        await this.load();
        this.bind();
        if (this.images.length) {
            console.log('[Player] showing first image');
            this.show(0);
        } else {
            console.warn('[Player] no images');
            UI.showError('No images in images.json');
        }
        UI.renderThumbnails();
    },

    async load() {
        console.log('[Player] loading static/json/images.json...');
        try {
            const r = await fetch('static/json/images.json');
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            this.images = await r.json();
            console.log('[Player] images loaded:', this.images);
        } catch (e) {
            console.error('[Player] load failed:', e);
            this.images = [];
        }
    },

    getImages() { return this.images; },

    bind() {
        console.log('[Player] binding controls');
        const play = document.getElementById('play-pause');
        const prev = document.getElementById('prev');
        const next = document.getElementById('next');
        if (play) play.addEventListener('click', () => this.toggle());
        if (prev) prev.addEventListener('click', () => this.prev());
        if (next) next.addEventListener('click', () => this.next());
    },

    show(idx) {
        if (!this.images.length) return;
        this.current = (idx + this.images.length) % this.images.length;
        const img = this.images[this.current];
        console.log(`[Player] show(${idx}) → ${img.src}`);
        UI.updateImage(img.src);
        UI.updateProgress(this.current, this.images.length);
        UI.setActiveThumb(this.current);
    },

    next() { this.show(this.current + 1); if (this.playing) this.restart(); },
    prev() { this.show(this.current - 1); if (this.playing) this.restart(); },
    goTo(i) { this.show(i); if (this.playing) this.restart(); },

    toggle() { this.playing ? this.pause() : this.play(); },

    play() {
        if (this.images.length < 2) return;
        this.playing = true;
        document.getElementById('play-pause')?.classList.add('playing');
        this.start();
    },
    pause() {
        this.playing = false;
        document.getElementById('play-pause')?.classList.remove('playing');
        clearInterval(this.timer);
    },
    start() {
        clearInterval(this.timer);
        const delay = 1000 / this.speed;
        this.timer = setInterval(() => {
            if (!document.getElementById('loop')?.checked && this.current === this.images.length - 1) {
                this.pause(); return;
            }
            this.next();
        }, delay);
    },
    restart() { if (this.playing) this.start(); },
    setSpeed(s) { this.speed = parseFloat(s); if (this.playing) this.start(); }
};