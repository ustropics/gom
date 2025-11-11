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
            const res = await fetch('static/json/images.json');
            this.images = await res.json();
            if (!this.images.length) {
                console.warn('No images found in static/json/images.json');
            }
        } catch (e) {
            console.error('Failed to load static/json/images.json', e);
            this.images = [];
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

        // Fallback if image fails to load
        UI.updateImage(img.src);
        UI.els.img.onerror = () => {
            UI.els.img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2FhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
        };

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