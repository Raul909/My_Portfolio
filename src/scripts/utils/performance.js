/** @returns {number} */
export function detectStaticTier() {
    const cores = /** @type {*} */ (navigator).deviceMemory || 4;
    const memory = /** @type {*} */ (navigator).hardwareConcurrency || 4;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (cores >= 8 && memory >= 8 && !isMobile) return 3;
    if (cores >= 4 && memory >= 4) return 2;
    return 1;
}

/** @returns {Promise<number>} */
export async function detectBenchmarkTier() {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 100;
    const ctx = /** @type {CanvasRenderingContext2D | null} */ (canvas.getContext('2d'));
    if (!ctx) return 1;
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    const start = performance.now();
    for (let i = 0; i < 150; i++) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 200, 100);
        for (let c = 0; c < 40; c++) {
            ctx.fillText('@W$9876', c * 10, (i % 10) * 10);
        }
    }
    const elapsed = performance.now() - start;
    const cores = /** @type {*} */ (navigator).hardwareConcurrency || 4;
    const memory = /** @type {*} */ (navigator).deviceMemory || 4;
    let score = 0;
    score += Math.min(cores / 8, 1) * 25;
    score += Math.min(memory / 8, 1) * 25;
    score += elapsed < 25 ? 50 : elapsed < 60 ? 35 : elapsed < 120 ? 20 : 10;
    return score >= 70 ? 3 : score >= 40 ? 2 : 1;
}

/**
 * @param {number} tier
 * @returns {void}
 */
export function applyTier(tier) {
    document.documentElement.classList.remove('tier-1', 'tier-2', 'tier-3');
    document.documentElement.classList.add(`tier-${tier}`);
    window.dispatchEvent(new CustomEvent('tier-change', { detail: { tier } }));
}
