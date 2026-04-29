// ─── Navigation ───────────────────────────────────────────────────────────────

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
            });
        }
    });
}, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

sections.forEach(s => navObserver.observe(s));

// Scroll progress
const scrollProgress = document.getElementById('scroll-progress');
const navbar = document.getElementById('navbar');
const bgVideo = document.getElementById('bg-video');

window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    scrollProgress.style.width = (window.scrollY / total * 100) + '%';
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    // Video parallax
    if (bgVideo) {
        const p = Math.min(window.scrollY / window.innerHeight, 1);
        bgVideo.style.transform = `translate(-50%, -50%) scale(${1 + p * 0.12})`;
        bgVideo.style.filter = `brightness(${0.5 - p * 0.2}) saturate(1.2)`;
    }

    // Hero fade
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && window.scrollY < window.innerHeight) {
        heroContent.style.transform = `translateY(${window.scrollY * 0.25}px)`;
        heroContent.style.opacity = 1 - (window.scrollY / window.innerHeight) * 0.9;
    }
}, { passive: true });

// Video speed
if (bgVideo) {
    bgVideo.playbackRate = 1.5;
    bgVideo.addEventListener('loadedmetadata', () => { bgVideo.playbackRate = 1.5; });
}

// ─── Typing Animation ─────────────────────────────────────────────────────────

const typingText = document.querySelector('.typing-text');
const phrases = ['Developer', 'Video Editor', 'Photographer', 'Problem Solver', 'Creative Mind'];
let phraseIndex = 0, charIndex = 0, isDeleting = false;

function type() {
    const current = phrases[phraseIndex];
    typingText.textContent = current.substring(0, isDeleting ? --charIndex : ++charIndex);

    if (!isDeleting && charIndex === current.length) {
        setTimeout(() => { isDeleting = true; setTimeout(type, 50); }, 2000);
        return;
    }
    if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
    }
    setTimeout(type, isDeleting ? 50 : 150);
}
type();

// ─── Smooth Scroll ────────────────────────────────────────────────────────────

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({ top: target.offsetTop - navbar.offsetHeight, behavior: 'smooth' });
        }
    });
});

// ─── Mobile Menu ──────────────────────────────────────────────────────────────

const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active', open);
    menuToggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    });
});

document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
});

// ─── Section Reveal ───────────────────────────────────────────────────────────

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('in-view'); });
}, { threshold: 0.08 });

sections.forEach(s => sectionObserver.observe(s));

// ─── 3D Tilt ──────────────────────────────────────────────────────────────────

function add3DTiltEffect() {
    document.querySelectorAll('.project-card, .about-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / 12;
            const y = (e.clientY - rect.top - rect.height / 2) / 12;
            card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) translateZ(8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ─── Animation Observer ───────────────────────────────────────────────────────

const animObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, i * 80);
            animObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

function observeCards() {
    document.querySelectorAll('.about-card, .project-card, .video-card, .gallery-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animObserver.observe(el);
    });
}
observeCards();

// ─── GitHub Projects ──────────────────────────────────────────────────────────

async function fetchGitHubRepos() {
    const container = document.getElementById('github-projects');
    container.innerHTML = '<p class="loading-text">Loading projects...</p>';

    try {
        const res = await fetch('https://api.github.com/users/Raul909/repos?sort=updated&per_page=12');
        if (!res.ok) throw new Error('GitHub API error');
        const repos = await res.json();

        const filtered = repos.filter(r => !r.fork).slice(0, 6);
        container.innerHTML = '';

        filtered.forEach(repo => {
            // Determine live URL: prefer homepage, fallback for portfolio repo
            let liveUrl = repo.homepage && repo.homepage.trim() ? repo.homepage.trim() : null;
            if (!liveUrl && (repo.name === 'My_Portfolio' || repo.name.toLowerCase().includes('portfolio'))) {
                liveUrl = 'https://raul909portfolio.netlify.app/';
            }

            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-preview">
                    <img src="https://opengraph.githubassets.com/1/${repo.full_name}"
                         alt="${repo.name} preview"
                         loading="lazy">
                </div>
                <div class="project-content">
                    <h3>${repo.name.replace(/[-_]/g, ' ')}</h3>
                    <p>${repo.description || 'No description available.'}</p>
                    <div class="project-tags">
                        ${repo.language ? `<span class="tag">${repo.language}</span>` : ''}
                        ${repo.stargazers_count > 0 ? `<span class="tag">⭐ ${repo.stargazers_count}</span>` : ''}
                        ${repo.forks_count > 0 ? `<span class="tag">🔱 ${repo.forks_count}</span>` : ''}
                    </div>
                    <div class="project-links">
                        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="code-link">View Code →</a>
                        ${liveUrl ? `<a href="${liveUrl}" target="_blank" rel="noopener noreferrer" class="live-demo-btn">Live Demo →</a>` : ''}
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        observeCards();
        add3DTiltEffect();
    } catch {
        container.innerHTML = `<p class="error-text">Unable to load projects. Visit <a href="https://github.com/Raul909" target="_blank" rel="noopener noreferrer">GitHub →</a></p>`;
    }
}

fetchGitHubRepos();

// ─── YouTube Videos ───────────────────────────────────────────────────────────

const YT_CHANNEL_ID = 'UCjsOF9jvN-39lHfgEnIWEbw';
const YT_CHANNEL_URL = 'https://www.youtube.com/@sirius_shutterup';

// Multiple CORS proxies to try in order
const CORS_PROXIES = [
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

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
            if (ids.length > 0) return ids;
        } catch {
            // try next proxy
        }
    }
    return [];
}

function renderVideos(videoIds, container) {
    container.innerHTML = '';
    videoIds.forEach(id => {
        const card = document.createElement('a');
        card.href = `https://www.youtube.com/watch?v=${id}`;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'video-card';
        card.setAttribute('aria-label', 'Watch video on YouTube');
        card.innerHTML = `
            <img src="https://img.youtube.com/vi/${id}/maxresdefault.jpg"
                 onerror="this.src='https://img.youtube.com/vi/${id}/hqdefault.jpg'"
                 alt="Video thumbnail" loading="lazy">
            <div class="video-play-overlay">
                <svg width="56" height="40" viewBox="0 0 68 48" aria-hidden="true">
                    <path d="M66.52,7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13,34,0,34,0S12.21.13,6.9,1.55C3.97,2.33,2.27,4.81,1.48,7.74.06,13.05,0,24,0,24s.06,10.95,1.48,16.26c.78,2.93,2.49,5.41,5.42,6.19C12.21,47.87,34,48,34,48s21.79-.13,27.1-1.55c2.93-.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"/>
                    <path d="M45,24 27,14 27,34" fill="#fff"/>
                </svg>
            </div>
        `;
        container.appendChild(card);
    });
    observeCards();
}

async function loadYouTubeVideos() {
    const container = document.getElementById('youtube-videos');
    container.innerHTML = '<p class="loading-text">Loading videos...</p>';

    const ids = await fetchYouTubeFeed();

    if (ids.length > 0) {
        renderVideos(ids, container);
        // Refresh every 10 minutes
        setInterval(async () => {
            const fresh = await fetchYouTubeFeed();
            if (fresh.length > 0) renderVideos(fresh, container);
        }, 600000);
    } else {
        container.innerHTML = `
            <div class="empty-state">
                <p>Visit my channel for the latest videos</p>
                <a href="${YT_CHANNEL_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                    Watch on YouTube →
                </a>
            </div>
        `;
    }
}

loadYouTubeVideos();

// ─── Photo Gallery ────────────────────────────────────────────────────────────

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
    'https://res.cloudinary.com/dgf8kbruq/image/upload/v1771450020/IMG_20251214_143411272_hiujue.jpg',
];

function loadPhotoGallery() {
    const container = document.getElementById('photo-gallery');
    container.innerHTML = '';

    PHOTOS.forEach((url, i) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `<img src="${url}" alt="Photography ${i + 1}" loading="lazy">`;
        item.addEventListener('click', () => openLightbox(PHOTOS, i));
        container.appendChild(item);
    });

    observeCards();
}

loadPhotoGallery();

// ─── Lightbox ─────────────────────────────────────────────────────────────────

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
            <img src="${images[current]}" alt="Photo ${current + 1} of ${images.length}">
            <button class="lightbox-next" aria-label="Next photo">&#10095;</button>
            <div class="lightbox-counter">${current + 1} / ${images.length}</div>
        </div>
    `;
    document.body.appendChild(lb);
    document.body.style.overflow = 'hidden';

    const img = lb.querySelector('img');
    const counter = lb.querySelector('.lightbox-counter');

    function go(idx) {
        current = (idx + images.length) % images.length;
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = images[current];
            img.alt = `Photo ${current + 1} of ${images.length}`;
            counter.textContent = `${current + 1} / ${images.length}`;
            img.style.opacity = '1';
        }, 150);
    }

    function close() {
        document.body.removeChild(lb);
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onKey);
    }

    function onKey(e) {
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') go(current - 1);
        else if (e.key === 'ArrowRight') go(current + 1);
    }

    lb.querySelector('.lightbox-close').onclick = close;
    lb.querySelector('.lightbox-prev').onclick = () => go(current - 1);
    lb.querySelector('.lightbox-next').onclick = () => go(current + 1);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', onKey);
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const msg = document.getElementById('form-message');
    const btn = form.querySelector('button[type="submit"]');

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
        msg.textContent = 'Please fill in all fields.';
        msg.className = 'form-message error';
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = 'Please enter a valid email address.';
        msg.className = 'form-message error';
        return;
    }

    const orig = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
        msg.textContent = "Thanks for your message! I'll get back to you soon.";
        msg.className = 'form-message success';
        form.reset();
        btn.textContent = orig;
        btn.disabled = false;
        setTimeout(() => { msg.className = 'form-message'; }, 5000);
    }, 1000);
});
