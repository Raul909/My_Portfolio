import { escapeHTML, sanitizeUrl } from '../utils/security.js';

const YT_CHANNEL_ID = 'UCjsOF9jvN-39lHfgEnIWEbw';
const YT_CHANNEL_URL = 'https://www.youtube.com/@sirius_shutterup';

/** @type {Array<(url: string) => string>} */
const CORS_PROXIES = [
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
];

/** @returns {Promise<string[]>} */
async function fetchYouTubeFeed() {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`;

    for (const makeProxy of CORS_PROXIES) {
        try {
            const res = await fetch(makeProxy(rssUrl), { signal: AbortSignal.timeout(8000) });
            if (!res.ok) continue;
            const text = await res.text();
            const xml = new DOMParser().parseFromString(text, 'text/xml');
            const ids = [...xml.querySelectorAll('entry')].map(e => {
                const vid = e.querySelector('videoId');
                return vid ? vid.textContent.trim() : null;
            }).filter(Boolean);
            if (ids.length > 0) return /** @type {string[]} */ (ids);
        } catch {
            // try next proxy
        }
    }
    return [];
}

/**
 * @param {string[]} videoIds
 * @param {HTMLElement} container
 */
function renderVideos(videoIds, container) {
    container.innerHTML = '';
    videoIds.forEach(id => {
        if (!/^[a-zA-Z0-9_-]{10,12}$/.test(id)) {
            console.warn(`Invalid YouTube video ID detected and skipped: ${id}`);
            return;
        }

        const safeUrl = sanitizeUrl(`https://www.youtube.com/watch?v=${escapeHTML(id)}`);
        const safeImgSrc = sanitizeUrl(`https://img.youtube.com/vi/${escapeHTML(id)}/hqdefault.jpg`);

        const card = document.createElement('a');
        card.href = safeUrl;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'video-card';
        card.setAttribute('aria-label', 'Watch video on YouTube');
        card.innerHTML = `
            <img src="${safeImgSrc}" alt="Video thumbnail" loading="lazy" width="480" height="360" class="video-thumbnail-img">
            <div class="video-play-overlay">
                <svg width="56" height="40" viewBox="0 0 68 48" aria-hidden="true">
                    <path d="M66.52,7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13,34,0,34,0S12.21.13,6.9,1.55C3.97,2.33,2.27,4.81,1.48,7.74.06,13.05,0,24,0,24s.06,10.95,1.48,16.26c.78,2.93,2.49,5.41,5.42,6.19C12.21,47.87,34,48,34,48s21.79-.13,27.1-1.55c2.93-.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"/>
                    <path d="M45,24 27,14 27,34" fill="#fff"/>
                </svg>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * @param {string} [containerId='youtube-videos']
 * @returns {Promise<void>}
 */
export async function loadYouTubeVideos(containerId = 'youtube-videos') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<p class="loading-text">Loading videos...</p>';

    const videoIds = [
        'wugRU6GvD68', 'edykfAgI6Jc', 'Iey_2E3rWpw', 'ZmNAsYlUNPo',
        'wXemUTEDaIQ', '6q9LHVkWDrY', 'SiGMTxQR21c', 'ICysoJgsHrA'
    ];

    renderVideos(videoIds, container);

    // Auto-scroll ping-pong slider
    let direction = 1;
    /** @type {ReturnType<typeof setInterval> | null} */
    let scrollInterval = null;

    const startScrolling = () => {
        if (scrollInterval) return;
        scrollInterval = setInterval(() => {
            container.scrollLeft += direction;
            if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 1) {
                direction = -1;
            } else if (container.scrollLeft <= 0) {
                direction = 1;
            }
        }, 40);
    };

    const stopScrolling = () => {
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
    };

    const sliderObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) startScrolling();
            else stopScrolling();
        });
    }, { threshold: 0.05 });
    sliderObserver.observe(container);

    container.addEventListener('mouseenter', stopScrolling);
    container.addEventListener('mouseleave', startScrolling);
}
