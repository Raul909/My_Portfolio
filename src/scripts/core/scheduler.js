export class RenderScheduler {
    constructor() {
        /** @type {Array<{ isActive: () => boolean; renderFrame: (time: number) => void }>} */
        this.renderers = [];
        /** @type {number | null} */
        this.animId = null;
    }

    /**
     * @param {{ isActive: () => boolean; renderFrame: (time: number) => void }} renderer
     */
    register(renderer) {
        if (this.renderers.includes(renderer)) return;
        this.renderers.push(renderer);
        this._startLoop();
    }

    /**
     * @param {{ isActive: () => boolean; renderFrame: (time: number) => void }} renderer
     */
    unregister(renderer) {
        const idx = this.renderers.indexOf(renderer);
        if (idx !== -1) this.renderers.splice(idx, 1);
        if (this.renderers.length === 0) this._stopLoop();
    }

    _startLoop() {
        if (this.animId) return;
        /** @param {number} time */
        const tick = (time) => {
            this.animId = requestAnimationFrame(tick);
            for (let i = 0; i < this.renderers.length; i++) {
                const r = this.renderers[i];
                if (r.isActive()) r.renderFrame(time);
            }
        };
        this.animId = requestAnimationFrame(tick);
    }

    _stopLoop() {
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
    }
}

export const renderScheduler = new RenderScheduler();
