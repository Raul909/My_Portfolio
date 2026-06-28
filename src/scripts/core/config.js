/** @type {{ [key: number]: { name: string; label: string; ascii: { fontSize: number; fps: number; maxCells: number; playbackRate: number; mouseDistortion: boolean; filter: string; }; tilt: { enabled: boolean; throttle?: number; }; reveal: { threshold: number; stagger: boolean; }; typing: { animated: boolean; }; videoPreload: string; }; }} */
export const TIER_CONFIG = {
    1: {
        name: 'low',
        label: 'Efficiency',
        ascii: {
            fontSize: 18,
            fps: 12,
            maxCells: 5000,
            playbackRate: 0.8,
            mouseDistortion: false,
            filter: 'none'
        },
        tilt: { enabled: false },
        reveal: { threshold: 0.2, stagger: false },
        typing: { animated: false },
        videoPreload: 'none'
    },
    2: {
        name: 'mid',
        label: 'Balanced',
        ascii: {
            fontSize: 12,
            fps: 24,
            maxCells: 10000,
            playbackRate: 1.0,
            mouseDistortion: true,
            filter: 'none'
        },
        tilt: { enabled: true, throttle: 16 },
        reveal: { threshold: 0.1, stagger: true },
        typing: { animated: true },
        videoPreload: 'metadata'
    },
    3: {
        name: 'high',
        label: 'Performance',
        ascii: {
            fontSize: 6,
            fps: 30,
            maxCells: 15000,
            playbackRate: 1.2,
            mouseDistortion: true,
            filter: 'contrast(1.6) saturate(1.8) brightness(1.2)'
        },
        tilt: { enabled: true, throttle: 0 },
        reveal: { threshold: 0.05, stagger: true },
        typing: { animated: true },
        videoPreload: 'auto'
    }
};

/**
 * @param {number} tier
 * @returns {{ name: string; label: string; ascii: { fontSize: number; fps: number; maxCells: number; playbackRate: number; mouseDistortion: boolean; filter: string; }; tilt: { enabled: boolean; throttle?: number; }; reveal: { threshold: number; stagger: boolean; }; typing: { animated: boolean; }; videoPreload: string; }}
 */
export function getTierConfig(tier) {
    return TIER_CONFIG[tier] || TIER_CONFIG[1];
}
