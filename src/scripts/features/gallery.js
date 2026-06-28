import { sanitizeUrl } from '../utils/security.js';

const PHOTOS = [
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771450464/IMG20250121130452_resized_under_5MB_o5iili.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771448417/IMG_20240101_000125_Greatness-01_lwzgn4.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771448415/20230905_091920_v97py4.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771448415/IMG_20231013_212310_Greatness-01_srlgyv.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771448413/IMG_20241008_172749_Greatness_vv8mxz.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771448413/20230503_143837_wz0e0c.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771448414/IMG_20240213_204559_Greatness_nfg6ab.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771448410/IMG_20250824_105708145_1_r2mazx.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771448409/Raul_20250712_133741_lmc_8.4_a7bf9l.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771450025/IMG_20251210_114226713_ciwwux.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771450025/IMG_20250929_185616270_wv5pgk.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771450025/IMG_20251210_113623989_d1ou6a.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771450021/IMG_20251215_171143486_ekvo9g.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771450023/IMG_20251214_131630537_ipiukx.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771450022/IMG_20251214_135910522_ck8dpz.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771450023/IMG_20251210_114727148_t1egtw.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771450020/IMG_20251215_171550148_pxzwqq.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771450020/IMG_20251228_174643730_v0gsnd.jpg',
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771450020/IMG_20251214_143411272_hiujue.jpg'
];

/**
 * @param {string} url
 * @param {number} [width=600]
 * @returns {string}
 */
function getCloudinaryUrl(url, width = 600) {
    if (!url.includes('cloudinary.com')) return url;
    return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width}/`);
}

/**
 * @param {string[]} images
 * @param {number} startIndex
 */
function openLightbox(images, startIndex) {
    let current = startIndex;

    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
            <button class="lightbox-prev" aria-label="Previous photo">&#10094;</button>
            <div class="lightbox-loader"></div>
            <img src="${getCloudinaryUrl(images[current], 1600)}" width="1600" height="900"
                 alt="Photo ${current + 1} of ${images.length}">
            <button class="lightbox-next" aria-label="Next photo">&#10095;</button>
            <div class="lightbox-counter">${current + 1} / ${images.length}</div>
        </div>
    `;
    document.body.appendChild(lb);
    document.body.style.overflow = 'hidden';

    const img = /** @type {HTMLImageElement | null} */ (lb.querySelector('img'));
    const counter = lb.querySelector('.lightbox-counter');
    const loader = lb.querySelector('.lightbox-loader');

    /** @type {string | null} */
    let expectedSrc = null;
    /** @type {HTMLImageElement | null} */
    let tempImg = null;

    /**
     * @param {number} idx
     */
    function go(idx) {
        current = (idx + images.length) % images.length;
        const newSrc = getCloudinaryUrl(images[current], 1600);
        expectedSrc = newSrc;
        if (counter) counter.textContent = `${current + 1} / ${images.length}`;
        if (img) img.style.opacity = '0';

        let loaderTimeout = setTimeout(() => {
            if (expectedSrc === newSrc && loader) loader.classList.add('active');
        }, 100);

        tempImg = new Image();
        tempImg.onload = () => {
            if (expectedSrc !== newSrc) return;
            clearTimeout(loaderTimeout);
            if (loader) loader.classList.remove('active');
            if (img) {
                img.src = newSrc;
                img.alt = `Photo ${current + 1} of ${images.length}`;
                img.style.opacity = '1';
            }
        };
        tempImg.src = newSrc;
    }

    function close() {
        document.body.removeChild(lb);
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onKey);
    }

    /**
     * @param {KeyboardEvent} e
     */
    function onKey(e) {
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') go(current - 1);
        else if (e.key === 'ArrowRight') go(current + 1);
    }

    const closeBtn = lb.querySelector('.lightbox-close');
    const prevBtn = lb.querySelector('.lightbox-prev');
    const nextBtn = lb.querySelector('.lightbox-next');
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (prevBtn) prevBtn.addEventListener('click', () => go(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => go(current + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', onKey);
}

/**
 * @param {string} [containerId='photo-gallery']
 * @returns {void}
 */
export function loadPhotoGallery(containerId = 'photo-gallery') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    PHOTOS.forEach((url, i) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `<img src="${getCloudinaryUrl(url, 600)}" alt="Photography ${i + 1}" width="600" height="600" loading="lazy">`;
        item.addEventListener('click', () => openLightbox(PHOTOS, i));
        container.appendChild(item);
    });
}
