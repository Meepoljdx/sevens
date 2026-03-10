// ==================== SOUND SYSTEM (Web Audio API) ====================
class SoundSystem {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.3;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio not supported');
            this.enabled = false;
        }
    }

    // Ensure AudioContext is resumed (browser autoplay policy)
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    // ---- Utility ----
    createGain(vol, t) {
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(vol * this.volume, t);
        return g;
    }

    // ---- Sound Effects ----

    // 裂空斩 Q - sharp slash
    slash() {
        if (!this.enabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.createGain(0.4, t);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);

        // Noise burst for impact
        this._noiseBurst(t, 0.06, 0.25);
    }

    // 盾击冲锋 W - heavy bash
    shieldBash() {
        if (!this.enabled || !this.ctx) return;
        const t = this.ctx.currentTime;

        // Low thud
        const osc = this.ctx.createOscillator();
        const gain = this.createGain(0.5, t);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);

        // Metal clang
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.createGain(0.3, t);
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(600, t);
        osc2.frequency.exponentialRampToValueAtTime(300, t + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc2.connect(gain2).connect(this.ctx.destination);
        osc2.start(t);
        osc2.stop(t + 0.1);

        this._noiseBurst(t, 0.08, 0.35);
    }

    // 战吼 E - roar/buff
    warCry() {
        if (!this.enabled || !this.ctx) return;
        const t = this.ctx.currentTime;

        // Rising tone
        const osc = this.ctx.createOscillator();
        const gain = this.createGain(0.3, t);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(500, t + 0.3);
        osc.frequency.linearRampToValueAtTime(400, t + 0.5);
        gain.gain.linearRampToValueAtTime(0.4 * this.volume, t + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.6);

        // Sub rumble
        const sub = this.ctx.createOscillator();
        const subG = this.createGain(0.25, t);
        sub.type = 'sine';
        sub.frequency.setValueAtTime(60, t);
        subG.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        sub.connect(subG).connect(this.ctx.destination);
        sub.start(t);
        sub.stop(t + 0.5);
    }

    // 七星审判 R - epic ultimate
    ultimate() {
        if (!this.enabled || !this.ctx) return;
        const t = this.ctx.currentTime;

        // Charge-up rising
        const osc = this.ctx.createOscillator();
        const gain = this.createGain(0.15, t);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.5);
        gain.gain.linearRampToValueAtTime(0.5 * this.volume, t + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.8);

        // Explosion at 0.5s
        setTimeout(() => {
            if (!this.ctx) return;
            const t2 = this.ctx.currentTime;
            this._noiseBurst(t2, 0.3, 0.5);

            const boom = this.ctx.createOscillator();
            const boomG = this.createGain(0.5, t2);
            boom.type = 'sine';
            boom.frequency.setValueAtTime(80, t2);
            boom.frequency.exponentialRampToValueAtTime(20, t2 + 0.4);
            boomG.gain.exponentialRampToValueAtTime(0.001, t2 + 0.5);
            boom.connect(boomG).connect(this.ctx.destination);
            boom.start(t2);
            boom.stop(t2 + 0.5);
        }, 400);

        // Chime tones (stars)
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                if (!this.ctx) return;
                const t3 = this.ctx.currentTime;
                const chime = this.ctx.createOscillator();
                const cg = this.createGain(0.15, t3);
                chime.type = 'sine';
                chime.frequency.setValueAtTime(800 + i * 200, t3);
                cg.gain.exponentialRampToValueAtTime(0.001, t3 + 0.2);
                chime.connect(cg).connect(this.ctx.destination);
                chime.start(t3);
                chime.stop(t3 + 0.2);
            }, 500 + i * 80);
        }
    }

    // Hit enemy
    hit() {
        if (!this.enabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        this._noiseBurst(t, 0.04, 0.2);

        const osc = this.ctx.createOscillator();
        const gain = this.createGain(0.2, t);
        osc.type = 'square';
        osc.frequency.setValueAtTime(300 + Math.random() * 200, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
    }

    // Critical hit
    crit() {
        if (!this.enabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        this._noiseBurst(t, 0.06, 0.35);

        // High pitch ping
        const osc = this.ctx.createOscillator();
        const gain = this.createGain(0.3, t);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
    }

    // Pickup item
    pickup() {
        if (!this.enabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        const notes = [523, 659, 784]; // C5, E5, G5 arpeggio
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.createGain(0.2, t + i * 0.06);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(notes[i], t + i * 0.06);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.2 * this.volume, t + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.15);
            osc.connect(gain).connect(this.ctx.destination);
            osc.start(t + i * 0.06);
            osc.stop(t + i * 0.06 + 0.15);
        }
    }

    // Pickup legendary/epic - special jingle
    pickupRare(rarity) {
        if (!this.enabled || !this.ctx) return;
        this.pickup();
        if (rarity < 3) return; // only epic+ get extra

        const t = this.ctx.currentTime;
        setTimeout(() => {
            if (!this.ctx) return;
            const t2 = this.ctx.currentTime;
            // Shimmering chord
            const freqs = rarity >= 4 ? [523, 659, 784, 1047] : [440, 554, 659];
            for (const f of freqs) {
                const osc = this.ctx.createOscillator();
                const gain = this.createGain(0.12, t2);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, t2);
                gain.gain.linearRampToValueAtTime(0.15 * this.volume, t2 + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.6);
                osc.connect(gain).connect(this.ctx.destination);
                osc.start(t2);
                osc.stop(t2 + 0.6);
            }
        }, 200);
    }

    // Level up
    levelUp() {
        if (!this.enabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        const notes = [523, 659, 784, 1047, 1319]; // C E G C E ascending
        for (let i = 0; i < notes.length; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.createGain(0.25, t + i * 0.1);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(notes[i], t + i * 0.1);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.25 * this.volume, t + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.3);
            osc.connect(gain).connect(this.ctx.destination);
            osc.start(t + i * 0.1);
            osc.stop(t + i * 0.1 + 0.3);
        }
    }

    // Wave announcement
    waveStart() {
        if (!this.enabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        // War horn
        const osc = this.ctx.createOscillator();
        const gain = this.createGain(0.0, t);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.linearRampToValueAtTime(165, t + 0.8);
        gain.gain.linearRampToValueAtTime(0.2 * this.volume, t + 0.3);
        gain.gain.setValueAtTime(0.2 * this.volume, t + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 1.2);

        // Sub
        const sub = this.ctx.createOscillator();
        const subG = this.createGain(0.15, t);
        sub.type = 'sine';
        sub.frequency.setValueAtTime(55, t);
        subG.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
        sub.connect(subG).connect(this.ctx.destination);
        sub.start(t);
        sub.stop(t + 1.0);
    }

    // Boss wave - ominous
    bossWave() {
        if (!this.enabled || !this.ctx) return;
        this.waveStart();
        const t = this.ctx.currentTime;
        // Low ominous rumble
        setTimeout(() => {
            if (!this.ctx) return;
            const t2 = this.ctx.currentTime;
            for (let i = 0; i < 3; i++) {
                const osc = this.ctx.createOscillator();
                const gain = this.createGain(0.1, t2 + i * 0.25);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(40 + i * 10, t2 + i * 0.25);
                gain.gain.setValueAtTime(0, t2);
                gain.gain.linearRampToValueAtTime(0.15 * this.volume, t2 + i * 0.25 + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, t2 + i * 0.25 + 0.5);
                osc.connect(gain).connect(this.ctx.destination);
                osc.start(t2 + i * 0.25);
                osc.stop(t2 + i * 0.25 + 0.5);
            }
        }, 600);
    }

    // Player takes damage
    playerHurt() {
        if (!this.enabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.createGain(0.25, t);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
    }

    // Walk step (subtle)
    step() {
        if (!this.enabled || !this.ctx) return;
        const t = this.ctx.currentTime;
        this._noiseBurst(t, 0.03, 0.05);
    }

    // ---- Internals ----
    _noiseBurst(t, duration, vol) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        const gain = this.createGain(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        src.connect(gain).connect(this.ctx.destination);
        src.start(t);
        src.stop(t + duration);
    }
}

const sfx = new SoundSystem();
