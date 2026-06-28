import { renderScheduler } from '../core/scheduler.js';
import { TIER_CONFIG } from '../core/config.js';

export class AsciiRenderer {
    /**
     * @param {string} videoId
     * @param {string} canvasId
     * @param {string} sectionId
     * @param {number} tier
     * @param {{ density?: string; filter?: string; fontSize?: number; fps?: number; playbackRate?: number; mouseDistortion?: boolean; }} [options={}]
     */
    constructor(videoId, canvasId, sectionId, tier, options = {}) {
        /** @type {HTMLVideoElement | null} */
        this.video = /** @type {HTMLVideoElement | null} */ (document.getElementById(videoId));
        /** @type {HTMLCanvasElement | null} */
        this.canvas = /** @type {HTMLCanvasElement | null} */ (document.getElementById(canvasId));
        /** @type {HTMLElement | null} */
        this.section = document.getElementById(sectionId);

        // Initialize all properties before early return
        /** @type {CanvasRenderingContext2D | null} */
        this.ctx = null;
        this.offscreenCanvas = document.createElement('canvas');
        /** @type {CanvasRenderingContext2D | null} */
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });

        this.density = options.density || 'Ñ@#W$9876543210?!abc;:+=-,._ ';
        this.tier = tier;
        this.filter = options.filter || 'none';
        this.fontSize = 18;
        this.targetFPS = 12;
        this.mouseDistortion = options.mouseDistortion !== false;
        this.charWidth = 0;
        this.charHeight = 0;
        this.cols = 0;
        this.rows = 0;
        /** @type {ImageData | null} */
        this.frameCache = null;
        this.cachedVideoTime = -1;
        /** @type {Array<{ c: number; x: number; y: number; color?: string }> | null} */
        this.cachedAsciiItems = null;
        /** @type {Uint8ClampedArray | null} */
        this.cachedOffscreenData = null;
        /** @type {HTMLCanvasElement | null} */
        this.atlasCanvas = null;
        this.atlasCharW = 0;
        this.atlasCharH = 0;
        this.isRendering = false;
        this.lastFrameTime = 0;
        this.fpsInterval = 1000 / this.targetFPS;
        this.canvasBounds = new DOMRect(0, 0, 0, 0);
        this.mouseX = -1000;
        this.mouseY = -1000;
        this.targetMouseX = -1000;
        this.targetMouseY = -1000;
        /** @type {ResizeObserver | null} */
        this.resizeObserver = null;
        /** @type {IntersectionObserver | null} */
        this.observer = null;

        if (!this.video || !this.canvas || !this.section) return;

        this.ctx = this.canvas.getContext('2d', { alpha: false });

        if (this.tier === 3) {
            this.fontSize = options.fontSize || 6;
            this.targetFPS = options.fps || 30;
            this.video.playbackRate = options.playbackRate || 1.2;
        } else if (this.tier === 2) {
            this.fontSize = options.fontSize || 12;
            this.targetFPS = options.fps || 24;
            this.video.playbackRate = options.playbackRate || 1.0;
        } else {
            this.fontSize = options.fontSize || 18;
            this.targetFPS = options.fps || 12;
            this.video.playbackRate = options.playbackRate || 0.8;
        }

        this.charWidth = this.fontSize * 0.6;
        this.charHeight = this.fontSize;
        this.fpsInterval = 1000 / this.targetFPS;
        this.canvasBounds = this.canvas.getBoundingClientRect();

        this.handleResize = this.handleResize.bind(this);
        this.renderFrame = this.renderFrame.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.updateBounds = this.updateBounds.bind(this);

        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.updateBounds, { passive: true });

        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(() => this.handleResize());
            this.resizeObserver.observe(this.canvas);
        }

        window.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseleave', () => { this.mouseX = -1000; this.mouseY = -1000; });

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    /** @type {HTMLVideoElement} */ (this.video).play()
                        .then(() => {
                            this.handleResize();
                            if (!this.isRendering) {
                                this.isRendering = true;
                                renderScheduler.register(this);
                            }
                        })
                        .catch(() => {});
                } else {
                    /** @type {HTMLVideoElement} */ (this.video).pause();
                    this.isRendering = false;
                    renderScheduler.unregister(this);
                }
            });
        }, { threshold: 0.02 });

        if (document.readyState === 'complete') {
            this.observer.observe(/** @type {HTMLElement} */ (this.section));
        } else {
            window.addEventListener('load', () => {
                this.handleResize();
                /** @type {IntersectionObserver} */ (this.observer).observe(/** @type {HTMLElement} */ (this.section));
            });
        }

        const handleInteraction = () => {
            if (this.section && this.video) {
                const rect = this.section.getBoundingClientRect();
                const inView = rect.bottom > 0 && rect.top < window.innerHeight;
                if (inView && this.video.paused) {
                    this.video.play()
                        .then(() => {
                            this.handleResize();
                            if (!this.isRendering) {
                                this.isRendering = true;
                                renderScheduler.register(this);
                            }
                        })
                        .catch(() => {});
                }
            }
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
        };
        document.addEventListener('click', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);
    }

    updateBounds() {
        if (!this.canvas) return;
        this.canvasBounds = this.canvas.getBoundingClientRect();
    }

    handleResize() {
        if (!this.canvas || !this.ctx || !this.offscreenCtx) return;
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        if (!width || !height) return;

        this.updateBounds();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;

        let scaleFactor = 1;
        if (width < 768) scaleFactor = 1.2;

        let currentFontSize = Math.max(4, Math.round(this.fontSize * scaleFactor));
        let charWidth = Math.max(1, currentFontSize * 0.6);
        let charHeight = currentFontSize;
        let cols = Math.floor(width / charWidth);
        let rows = Math.floor(height / charHeight);

        const MAX_CELLS = this.tier === 3 ? 15000 : this.tier === 2 ? 10000 : 5000;
        if (cols * rows > MAX_CELLS) {
            const grow = Math.sqrt((cols * rows) / MAX_CELLS);
            currentFontSize = Math.max(currentFontSize, Math.ceil(currentFontSize * grow));
            charWidth = Math.max(1, currentFontSize * 0.6);
            charHeight = currentFontSize;
            cols = Math.floor(width / charWidth);
            rows = Math.floor(height / charHeight);
        }

        this.charWidth = charWidth;
        this.charHeight = charHeight;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.cols = cols;
        this.rows = rows;
        this.offscreenCanvas.width = this.cols;
        this.offscreenCanvas.height = this.rows;
        this.atlasCanvas = null;
        this.cachedVideoTime = -1;
        this.cachedAsciiItems = null;
        this.cachedOffscreenData = null;
    }

    /**
     * @param {MouseEvent} e
     */
    handleMouseMove(e) {
        if (!this.isRendering) return;
        this.targetMouseX = e.clientX - this.canvasBounds.left;
        this.targetMouseY = e.clientY - this.canvasBounds.top;
    }

    /** @returns {boolean} */
    isActive() {
        return !!(this.isRendering && this.video && !this.video.paused && !this.video.ended);
    }

    /** @returns {number} */
    getVideoTimeKey() {
        if (!this.video) return 0;
        return Math.round(this.video.currentTime * 10) / 10;
    }

    buildCharAtlas() {
        if (this.atlasCanvas) return;
        if (!this.offscreenCtx) return;
        const chars = this.density.split('');
        const charW = Math.ceil(this.charWidth);
        const charH = Math.ceil(this.charHeight);
        this.atlasCanvas = document.createElement('canvas');
        this.atlasCanvas.width = chars.length * charW;
        this.atlasCanvas.height = charH;
        const actx = /** @type {CanvasRenderingContext2D | null} */ (this.atlasCanvas.getContext('2d'));
        if (!actx) return;
        actx.fillStyle = '#ffffff';
        const fontSize = Math.round(this.charHeight);
        actx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
        actx.textAlign = 'left';
        actx.textBaseline = 'top';
        chars.forEach((ch, i) => { actx.fillText(ch, i * charW, 0); });
        this.atlasCharW = charW;
        this.atlasCharH = charH;
    }

    drawCachedFrame() {
        if (!this.cachedAsciiItems || !this.ctx || !this.offscreenCtx) return;
        if (!this.canvas) return;
        const currentFontSize = Math.round(this.charHeight);
        this.ctx.font = `bold ${currentFontSize}px "JetBrains Mono", monospace`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        if (this.tier === 1) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = '#080808';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.buildCharAtlas();

        if (this.tier === 1) {
            const items = this.cachedAsciiItems;
            if (this.atlasCanvas) {
                for (let i = 0; i < items.length; i++) {
                    const it = items[i];
                    this.ctx.drawImage(this.atlasCanvas, it.c * this.atlasCharW, 0, this.atlasCharW, this.atlasCharH, it.x, it.y, this.atlasCharW, this.atlasCharH);
                }
            } else {
                for (let i = 0; i < items.length; i++) {
                    const it = items[i];
                    this.ctx.fillText(this.density[it.c], it.x, it.y);
                }
            }
            if (this.cachedOffscreenData) {
                const data = new Uint8ClampedArray(this.cachedOffscreenData);
                this.offscreenCtx.putImageData(new ImageData(data, this.cols, this.rows), 0, 0);
            }
            this.ctx.globalCompositeOperation = 'source-in';
            this.ctx.drawImage(this.offscreenCanvas, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalCompositeOperation = 'destination-over';
            this.ctx.fillStyle = '#080808';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalCompositeOperation = 'source-over';
        } else {
            for (let i = 0; i < this.cachedAsciiItems.length; i++) {
                const it = this.cachedAsciiItems[i];
                if (it.color) this.ctx.fillStyle = it.color;
                this.ctx.fillText(this.density[it.c], it.x, it.y);
            }
        }
    }

    /**
     * @param {number} time
     */
    renderFrame(time) {
        if (!this.isRendering || !this.video || !this.canvas || !this.ctx || !this.offscreenCtx) return;

        if (this.mouseDistortion) {
            this.mouseX += (this.targetMouseX - this.mouseX) * 0.15;
            this.mouseY += (this.targetMouseY - this.mouseY) * 0.15;
        }

        if (this.video.paused || this.video.ended) {
            this.isRendering = false;
            return;
        }

        const elapsed = time - this.lastFrameTime;
        if (elapsed < this.fpsInterval) return;
        this.lastFrameTime = time - (elapsed % this.fpsInterval);

        const timeKey = this.getVideoTimeKey();
        if (timeKey === this.cachedVideoTime && this.cachedAsciiItems) {
            this.drawCachedFrame();
            return;
        }

        const isMouseClose = this.mouseDistortion && this.mouseX > -500 && this.mouseY > -500;

        if (this.video.readyState < 2) return;

        if (this.filter !== 'none') this.offscreenCtx.filter = this.filter;
        this.offscreenCtx.drawImage(this.video, 0, 0, this.cols, this.rows);
        if (this.filter !== 'none') this.offscreenCtx.filter = 'none';
        const imageData = this.offscreenCtx.getImageData(0, 0, this.cols, this.rows);
        const data = imageData.data;

        if (this.tier === 1) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = '#080808';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        const currentFontSize = Math.round(this.charHeight);
        this.ctx.font = `bold ${currentFontSize}px "JetBrains Mono", monospace`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.buildCharAtlas();

        const densityMaxIdx = this.density.length - 2;
        /** @type {Array<{ c: number; x: number; y: number; color?: string }>} */
        const items = [];

        if (this.tier === 1) this.ctx.fillStyle = '#ffffff';

        let idx = 0;
        const useAtlas = this.tier === 1 && !!this.atlasCanvas;

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const r = data[idx++];
                const g = data[idx++];
                const b = data[idx++];
                const a = data[idx++];

                if (a === 0) continue;
                const avg = (r + g + b) / 3;
                if (avg < 25) continue;

                const charIdx = Math.floor(((avg - 25) / 230) * densityMaxIdx);
                const mappedCharIdx = densityMaxIdx - Math.min(Math.max(charIdx, 0), densityMaxIdx);

                let drawX = x * this.charWidth;
                let drawY = y * this.charHeight;

                if (isMouseClose) {
                    const dx = drawX - this.mouseX;
                    const dy = drawY - this.mouseY;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < 22500 && distSq > 0) {
                        const dist = Math.sqrt(distSq);
                        const force = (150 - dist) / 150;
                        drawX += (dx / dist) * force * 30;
                        drawY += (dy / dist) * force * 30;
                    }
                }

                if (this.tier === 1) {
                    if (useAtlas && this.atlasCanvas) {
                        this.ctx.drawImage(this.atlasCanvas, mappedCharIdx * this.atlasCharW, 0, this.atlasCharW, this.atlasCharH, drawX, drawY, this.atlasCharW, this.atlasCharH);
                    } else {
                        this.ctx.fillText(this.density[mappedCharIdx], drawX, drawY);
                    }
                    items.push({ c: mappedCharIdx, x: drawX, y: drawY });
                } else {
                    const color = `rgba(${r},${g},${b},${a / 255})`;
                    this.ctx.fillStyle = color;
                    this.ctx.fillText(this.density[mappedCharIdx], drawX, drawY);
                    items.push({ c: mappedCharIdx, x: drawX, y: drawY, color });
                }
            }
        }

        if (this.tier === 1) {
            this.ctx.globalCompositeOperation = 'source-in';
            this.ctx.drawImage(this.offscreenCanvas, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalCompositeOperation = 'destination-over';
            this.ctx.fillStyle = '#080808';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalCompositeOperation = 'source-over';
        }

        this.cachedVideoTime = timeKey;
        this.cachedAsciiItems = items;
        this.cachedOffscreenData = new Uint8ClampedArray(imageData.data);
    }

    /**
     * @param {number} newTier
     * @param {{ fontSize?: number; fps?: number; playbackRate?: number; filter?: string; mouseDistortion?: boolean; }} config
     */
    updateTier(newTier, config) {
        this.tier = newTier;
        this.fontSize = config.fontSize || 18;
        this.targetFPS = config.fps || 12;
        if (this.video) this.video.playbackRate = config.playbackRate || 0.8;
        this.filter = config.filter || 'none';
        this.mouseDistortion = config.mouseDistortion !== false;
        this.fpsInterval = 1000 / this.targetFPS;
        this.handleResize();
    }
}
