const Player = {
    images: [], current: 0, playing: false, speed: 1, timer: null,

    async init() {
        await this.load();
        this.bind();
        this.show(0);
        UI.renderThumbnails();
    },

    async load() {
        try {
            const res = await fetch('images.json');
            this.images = await res.json();
        } catch (e) {
            console.error('Failed to load images.json', e);
        }
    },

    getImages() { return this.images; },

    bind() {
        document.getElementById('play-pause').onclick = () => this.toggle();
        document.getElementById('prev').onclick = () => this.prev();
        document.getElementById('next').onclick = () => this.next();
    },

    show(idx) {
        if (!this.images.length) return;
        this.current = (idx + this.images.length) % this.images.length;
        const img = this.images[this.current];
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
        document.getElementById('play-pause').classList.add('playing');
        this.start();
    },

    pause() {
        this.playing = false;
        document.getElementById('play-pause').classList.remove('playing');
        clearInterval(this.timer);
    },

    start() {
        clearInterval(this.timer);
        const delay = 1000 / this.speed;
        this.timer = setInterval(() => {
            if (!document.getElementById('loop').checked && this.current === this.images.length - 1) {
                this.pause();
                return;
            }
            this.next();
        }, delay);
    },

    restart() { if (this.playing) this.start(); },

    setSpeed(s) { this.speed = s; if (this.playing) this.start(); }
};