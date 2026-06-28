/**
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * @param {string} url
 * @returns {string}
 */
export function sanitizeUrl(url) {
    if (!url) return '';
    try {
        const parsed = new URL(url);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return parsed.toString();
        }
        return '#';
    } catch {
        if (url.startsWith('/') && !url.startsWith('//')) {
            return url;
        }
        return '#';
    }
}
