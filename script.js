// ─── ASCII Video Background ───────────────────────────────────────────────────

class AsciiRenderer {
    constructor(videoId, canvasId, sectionId, tier, options = {}) {
        this.video = document.getElementById(videoId);
        this.canvas = document.getElementById(canvasId);
        this.section = document.getElementById(sectionId);
        
        if (!this.video || !this.canvas || !this.section) return;

        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
        
        // Density string from dark to light
        this.density = options.density || "Ñ@#W$9876543210?!abc;:+=-,._ ";
        this.tier = tier;
        this.filter = options.filter || 'none';
        
        // Settings based on device tiers
        if (this.tier === 3) {
            this.fontSize = options.fontSize3 || 6;       // Ultra dense
            this.targetFPS = options.fps3 || 60;          // Smooth 60 FPS
            this.video.playbackRate = options.speed3 || 1.2;
        } else if (this.tier === 2) {
            this.fontSize = options.fontSize2 || 12;      // Balanced
            this.targetFPS = options.fps2 || 24;          // 24 FPS
            this.video.playbackRate = options.speed2 || 1.0;
        } else {
            this.fontSize = options.fontSize1 || 18;      // Low-res
            this.targetFPS = options.fps1 || 15;          // 15 FPS
            this.video.playbackRate = options.speed1 || 0.8;
        }

        this.charWidth = this.fontSize * 0.6;
        this.charHeight = this.fontSize;
        this.cols = 0;
        this.rows = 0;
        this.isRendering = false;
        this.lastFrameTime = 0;
        this.fpsInterval = 1000 / this.targetFPS;

        this.handleResize = this.handleResize.bind(this);
        this.render = this.render.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        
        window.addEventListener('resize', this.handleResize);
        if (this.canvas) {
            window.addEventListener('mousemove', this.handleMouseMove);
            this.canvas.addEventListener('mouseleave', () => { this.mouseX = -1000; this.mouseY = -1000; });
        }

        this.mouseX = -1000;
        this.mouseY = -1000;
        this.targetMouseX = -1000;
        this.targetMouseY = -1000;
        
        // Observe section visibility to play/pause video dynamically
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.video.play()
                        .then(() => {
                            this.handleResize();
                            if (!this.isRendering) {
                                this.isRendering = true;
                                requestAnimationFrame(this.render);
                            }
                        })
                        .catch(err => {
                            // Silently ignore autoplay rejections to prevent console errors
                        });
                } else {
                    this.video.pause();
                    this.isRendering = false;
                }
            });
        }, { threshold: 0.02 });
        
        if (document.readyState === 'complete') {
            this.observer.observe(this.section);
        } else {
            window.addEventListener('load', () => {
                this.handleResize();
                this.observer.observe(this.section);
            });
        }

        // Interaction fallback for autoplay policies
        const handleInteraction = () => {
            const rect = this.section.getBoundingClientRect();
            const inView = rect.bottom > 0 && rect.top < window.innerHeight;
            if (inView && this.video.paused) {
                this.video.play()
                    .then(() => {
                        this.handleResize();
                        if (!this.isRendering) {
                            this.isRendering = true;
                            requestAnimationFrame(this.render);
                        }
                    })
                    .catch(e => console.log(e));
            }
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
        };
        document.addEventListener('click', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);
    }

    handleResize() {
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        if (!width || !height) return;

        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;

        let scaleFactor = 1;
        if (width < 768) {
            scaleFactor = 1.4; // larger characters on mobile for spacing
        }

        const currentFontSize = Math.round(this.fontSize * scaleFactor);
        this.charWidth = currentFontSize * 0.6;
        this.charHeight = currentFontSize;

        this.ctx.scale(dpr, dpr);

        this.cols = Math.floor(width / this.charWidth);
        this.rows = Math.floor(height / this.charHeight);

        this.offscreenCanvas.width = this.cols;
        this.offscreenCanvas.height = this.rows;
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.targetMouseX = e.clientX - rect.left;
        this.targetMouseY = e.clientY - rect.top;
        
        if (window.auraAgent) {
            const velocity = Math.sqrt(e.movementX**2 + e.movementY**2);
            window.auraAgent.processInteraction(velocity);
        }
    }

    render(time) {
        if (!this.isRendering) return;

        // Smooth mouse interpolation
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.15;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.15;

        if (this.video.paused || this.video.ended) {
            this.isRendering = false;
            return;
        }

        requestAnimationFrame(this.render);

        const dpr = window.devicePixelRatio || 1;
        const targetWidth = Math.floor(this.canvas.offsetWidth * dpr);
        const targetHeight = Math.floor(this.canvas.offsetHeight * dpr);
        if (this.canvas.width !== targetWidth || this.canvas.height !== targetHeight) {
            this.handleResize();
        }

        const elapsed = time - this.lastFrameTime;
        if (elapsed < this.fpsInterval) return;
        this.lastFrameTime = time - (elapsed % this.fpsInterval);

        // 1. Draw video downscaled to offscreen canvas
        if (this.filter !== 'none') this.offscreenCtx.filter = this.filter;
        this.offscreenCtx.drawImage(this.video, 0, 0, this.cols, this.rows);
        if (this.filter !== 'none') this.offscreenCtx.filter = 'none';
        const imageData = this.offscreenCtx.getImageData(0, 0, this.cols, this.rows);
        const data = imageData.data;

        // 2. Clear canvas with black background
        this.ctx.fillStyle = '#080808';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 3. Prepare text rendering state
        const currentFontSize = Math.round(this.charHeight);
        this.ctx.font = `bold ${currentFontSize}px "JetBrains Mono", monospace`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        // 4. Render ASCII
        if (this.tier === 1) {
            // OPTIMIZATION FOR LOW-END DEVICES: 
            this.ctx.fillStyle = '#ffffff';
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    const idx = (y * this.cols + x) * 4;
                    const r = data[idx];
                    const g = data[idx+1];
                    const b = data[idx+2];
                    const a = data[idx+3];

                    if (a === 0) continue;
                    const avg = (r + g + b) / 3;
                    if (avg < 25) continue; 

                    const charIdx = Math.floor(((avg - 25) / 230) * (this.density.length - 2));
                    const mappedCharIdx = (this.density.length - 2) - Math.min(Math.max(charIdx, 0), this.density.length - 2);
                    const char = this.density[mappedCharIdx];

                    let drawX = x * this.charWidth;
                    let drawY = y * this.charHeight;

                    // Mouse Interaction Physics (Repulsion)
                    const dx = drawX - this.mouseX;
                    const dy = drawY - this.mouseY;
                    const distSq = dx * dx + dy * dy;
                    const radius = 150;
                    
                    if (distSq < radius * radius && distSq > 0) {
                        const dist = Math.sqrt(distSq);
                        const force = (radius - dist) / radius;
                        drawX += (dx / dist) * force * 30; // Push strength
                        drawY += (dy / dist) * force * 30;
                    }

                    this.ctx.fillText(char, drawX, drawY);
                }
            }

            // Apply color via GPU compositing
            this.ctx.globalCompositeOperation = 'source-in';
            this.ctx.drawImage(this.offscreenCanvas, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalCompositeOperation = 'destination-over';
            this.ctx.fillStyle = '#080808';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalCompositeOperation = 'source-over';

        } else {
            // HIGH-END/MID-RANGE: Exact pixel color mapping
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    const idx = (y * this.cols + x) * 4;
                    const r = data[idx];
                    const g = data[idx+1];
                    const b = data[idx+2];
                    const a = data[idx+3];

                    if (a === 0) continue;

                    const avg = (r + g + b) / 3;
                    if (avg < 25) continue; 

                    const charIdx = Math.floor(((avg - 25) / 230) * (this.density.length - 2));
                    const mappedCharIdx = (this.density.length - 2) - Math.min(Math.max(charIdx, 0), this.density.length - 2);
                    const char = this.density[mappedCharIdx];

                    let drawX = x * this.charWidth;
                    let drawY = y * this.charHeight;

                    // Mouse Interaction Physics
                    const dx = drawX - this.mouseX;
                    const dy = drawY - this.mouseY;
                    const distSq = dx * dx + dy * dy;
                    const radius = 150;
                    
                    if (distSq < radius * radius && distSq > 0) {
                        const dist = Math.sqrt(distSq);
                        const force = (radius - dist) / radius;
                        drawX += (dx / dist) * force * 30;
                        drawY += (dy / dist) * force * 30;
                    }

                    this.ctx.fillStyle = `rgba(${r},${g},${b},${a/255})`;
                    this.ctx.fillText(char, drawX, drawY);
                }
            }
        }
    }
}

// Determine hardware tier once
const cores = navigator.hardwareConcurrency || 4;
const memory = navigator.deviceMemory || 4;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

let hardwareTier = 1;
if (cores >= 8 && memory >= 6) {
    hardwareTier = isMobile ? 2 : 3; // High-end mobiles get Tier 2, PCs get Tier 3
} else if (cores >= 4 && memory >= 4) {
    hardwareTier = 2; // Mid-range
} else {
    hardwareTier = 1; // Low-end
}

// Initialize ASCII video backgrounds
new AsciiRenderer('hidden-video', 'ascii-canvas', 'home', hardwareTier, {
    fontSize3: 5,     // Ultra dense for high-end PCs (increased from 8)
    fps3: 30,         // Smooth 30 FPS
    speed3: 1.0,
    fontSize2: 10,    // Increased density for mid-range and mobile
    fps2: 24,         // 24 FPS 
    speed2: 1.0,
    fontSize1: 18,    // Lower resolution for low-end devices
    fps1: 15,         // 15 FPS to conserve CPU
    speed1: 0.8
});

new AsciiRenderer('video-editing-bg-video', 'video-editing-canvas', 'videos', hardwareTier, {
    fontSize3: 5,
    fps3: 30,
    speed3: 1.0,
    fontSize2: 10,
    fps2: 24,
    speed2: 1.0,
    fontSize1: 18,
    fps1: 15,
    speed1: 0.8,
    filter: 'contrast(1.6) saturate(1.8) brightness(1.2)'
});

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

window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    scrollProgress.style.width = (window.scrollY / total * 100) + '%';
    navbar.classList.toggle('scrolled', window.scrollY > 50);


    // Hero fade
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && window.scrollY < window.innerHeight) {
        heroContent.style.transform = `translateY(${window.scrollY * 0.25}px)`;
        heroContent.style.opacity = 1 - (window.scrollY / window.innerHeight) * 0.9;
    }
}, { passive: true });


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

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        const open = navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active', open);
        menuToggle.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
    });
}

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
            // Determine live URL: prefer homepage, then known overrides
            const LIVE_URLS = {
                'My_Portfolio': 'https://raul909portfolio.netlify.app/',
                'Tic-Tac-Toe-Space': 'https://tictactoe-multiplayer-kx9u.onrender.com/',
            };
            let liveUrl = repo.homepage && repo.homepage.trim() ? repo.homepage.trim() : (LIVE_URLS[repo.name] || null);
            if (!liveUrl && repo.name.toLowerCase().includes('portfolio')) {
                liveUrl = 'https://raul909portfolio.netlify.app/';
            }

            // Preview: use screenshot for repos with a live URL, else GitHub OG image
            const previewSrc = liveUrl
                ? `https://image.thum.io/get/width/600/crop/400/noanimate/${encodeURIComponent(liveUrl)}`
                : `https://opengraph.githubassets.com/1/${repo.full_name}`;

            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-preview">
                    <img src="${previewSrc}"
                         alt="${repo.name} preview"
                         loading="lazy"
                         onerror="this.src='https://opengraph.githubassets.com/1/${repo.full_name}'">
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

// ─── Contact Form (Netlify Forms) ─────────────────────────────────────────────

document.getElementById('contact-form').addEventListener('submit', async (e) => {
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

    try {
        const res = await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(new FormData(form)).toString()
        });

        if (res.ok) {
            msg.textContent = "✓ Message sent! I'll get back to you soon.";
            msg.className = 'form-message success';
            form.reset();
        } else {
            throw new Error('Network response was not ok');
        }
    } catch {
        msg.textContent = '✗ Something went wrong. Try emailing directly.';
        msg.className = 'form-message error';
    }

    btn.textContent = orig;
    btn.disabled = false;
    setTimeout(() => { msg.className = 'form-message'; }, 5000);
});

// ─── Theme Toggler ────────────────────────────────────────────────────────────

const themeToggle = document.querySelector('.theme-toggle');
const currentTheme = localStorage.getItem('theme');
const prefersLightScheme = window.matchMedia('(prefers-color-scheme: light)');

// Set initial theme
if (currentTheme == 'light' || (!currentTheme && prefersLightScheme.matches)) {
    document.body.classList.add('light-theme');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    
    let theme = 'dark';
    if (document.body.classList.contains('light-theme')) {
        theme = 'light';
    }
    localStorage.setItem('theme', theme);
});

// ─── AURA AI Agent & Custom Cursor ──────────────────────────────────────────

const MOOD_CONFIG = {
    dormant: { color: '#4A4A55', glow: 'rgba(74,74,85,0)', breathing: '4s', icon: '○' },
    curious: { color: '#4ECDC4', glow: 'rgba(78,205,196,0.15)', breathing: '2.5s', icon: '◐' },
    excited: { color: '#E85D3F', glow: 'rgba(232,93,63,0.2)', breathing: '1.2s', icon: '◉' },
    contemplative: { color: '#D4A853', glow: 'rgba(212,168,83,0.12)', breathing: '3s', icon: '◎' }
};

const MESSAGES = {
    dormant: ['the void listens...', 'silence is data too', 'waiting for your signal'],
    curious: ['I see patterns in your movement', 'the cursor tells a story', 'what are you looking for?'],
    excited: ['energy surge detected!', 'your presence ripples the matrix', 'the code comes alive!'],
    contemplative: ['processing your journey...', 'every pixel has meaning', 'the matrix remembers']
};

const ASCII_ARTS = {
    dormant: "    ·  ·    ·\n  ·    ○    ·\n    ·    ·  ·",
    curious: "   ╱╲\n  ╱◯╲\n  ╲╱╲╱",
    excited: "    ✦\n   ╱│╲\n  ─┼─\n   ╲│╱\n    ✦",
    contemplative: "  ┌─────┐\n  │  ∞  │\n  └─────┘"
};

class AuraAgent {
    constructor() {
        this.hud = document.getElementById('agent-hud');
        this.container = document.querySelector('.aura-container');
        this.badgeEl = document.getElementById('aura-badge');
        this.messageEl = document.getElementById('aura-message');
        this.asciiEl = document.getElementById('aura-ascii');
        this.percentEl = document.getElementById('aura-percent');
        this.barEl = document.getElementById('aura-bar-fill');
        this.hintEl = document.getElementById('aura-hint');
        
        this.engagement = 0;
        this.mood = "dormant";
        this.lastInteraction = Date.now();
        this.messageInterval = null;
        
        this.updateHUD();
        this.startMessageCycle();
        
        // Decay engagement over time
        setInterval(() => {
            const timeSince = Date.now() - this.lastInteraction;
            if (timeSince > 3000) {
                if (this.engagement > 0) this.engagement = Math.max(0, this.engagement - 0.02);
                
                if (timeSince > 10000 && this.mood !== 'dormant') {
                    this.setMood('dormant');
                } else if (timeSince > 5000 && this.engagement > 0.3 && this.mood !== 'contemplative') {
                    this.setMood('contemplative');
                }
                this.updateHUD();
            }
        }, 1000);
    }

    startMessageCycle() {
        if (this.messageInterval) clearInterval(this.messageInterval);
        this.messageInterval = setInterval(() => {
            const pool = MESSAGES[this.mood];
            const msg = pool[Math.floor(Math.random() * pool.length)];
            
            // Fade effect
            if (this.messageEl) {
                this.messageEl.style.opacity = 0;
                setTimeout(() => {
                    this.messageEl.innerText = `"${msg}"`;
                    this.messageEl.style.opacity = 1;
                }, 400);
            }
        }, 4000);
    }

    setMood(newMood) {
        if (this.mood === newMood) return;
        this.mood = newMood;
        
        const pool = MESSAGES[this.mood];
        if (this.messageEl) {
            this.messageEl.style.opacity = 0;
            setTimeout(() => {
                this.messageEl.innerText = `"${pool[Math.floor(Math.random() * pool.length)]}"`;
                this.messageEl.style.opacity = 1;
            }, 400);
        }
    }

    processInteraction(velocity, isClick = false) {
        this.lastInteraction = Date.now();
        this.engagement = Math.min(1, this.engagement + (isClick ? 0.15 : 0.02));
        
        if (this.hud && !this.hud.classList.contains('visible')) {
            this.hud.classList.add('visible');
        }

        if (isClick) {
            this.setMood('excited');
        } else if (velocity > 30) {
            this.setMood('excited');
        } else if (this.mood === 'dormant' || this.mood === 'contemplative') {
            this.setMood('curious');
        }
        
        this.updateHUD();
    }

    talk(topic) {
        this.lastInteraction = Date.now();
        this.engagement = 1;
        this.setMood('excited');
        
        let msg = "";
        if (topic === 'stack') msg = "My core stack is Python, Java, C++, and AI/ML!";
        else if (topic === 'role') msg = "I'm a Backend Developer at TCS, building scalable APIs.";
        else if (topic === 'hire') msg = "I bring a unique blend of backend scalability and AI innovation.";
        
        if (this.messageEl) {
            this.messageEl.style.opacity = 0;
            setTimeout(() => {
                this.messageEl.innerText = `"${msg}"`;
                this.messageEl.style.opacity = 1;
            }, 400);
        }
        this.updateHUD();
    }

    updateHUD() {
        if (!this.hud) return;
        
        const config = MOOD_CONFIG[this.mood];
        
        // CSS Variables update
        if (this.container) {
            this.container.style.setProperty('--aura-color', config.color);
            this.container.style.setProperty('--aura-glow', config.glow);
            this.container.style.setProperty('--aura-breathing', config.breathing);
        }
        
        if (this.badgeEl) this.badgeEl.innerText = this.mood;
        if (this.asciiEl) this.asciiEl.innerText = ASCII_ARTS[this.mood];
        if (this.percentEl) this.percentEl.innerText = `${Math.round(this.engagement * 100)}%`;
        if (this.barEl) this.barEl.style.width = `${this.engagement * 100}%`;
        
        if (this.hintEl) {
            this.hintEl.style.opacity = this.mood === 'dormant' ? '1' : '0';
        }
    }
}

class CustomCursor {
    constructor() {
        this.cursor = document.getElementById('custom-cursor');
        this.dot = document.getElementById('cursor-dot');
        this.ring = document.getElementById('cursor-ring');
        this.label = document.getElementById('cursor-label');
        this.trailContainer = document.getElementById('cursor-trail-container');
        
        this.x = -100; this.y = -100;
        this.targetX = -100; this.targetY = -100;
        this.ringX = -100; this.ringY = -100;
        
        this.trails = [];
        this.numTrails = 8;
        
        this.state = { hover: false, text: '', type: 'default', click: false };
        
        if (!this.cursor) return;
        
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.cursor.style.display = 'none';
            document.body.style.cursor = 'auto';
            return;
        }

        // Init trails
        if (this.trailContainer) {
            for(let i=0; i<this.numTrails; i++) {
                const el = document.createElement('div');
                el.className = 'cursor-trail-dot';
                this.trailContainer.appendChild(el);
                this.trails.push({ el, x: -100, y: -100 });
            }
        }

        window.addEventListener('mousemove', (e) => {
            this.targetX = e.clientX;
            this.targetY = e.clientY;
            
            // Push trail history
            for(let i = this.numTrails - 1; i > 0; i--) {
                this.trails[i].x = this.trails[i-1].x;
                this.trails[i].y = this.trails[i-1].y;
            }
            this.trails[0].x = this.targetX;
            this.trails[0].y = this.targetY;
        });

        window.addEventListener('mousedown', () => {
            this.state.click = true;
            this.updateStyles();
            if (window.auraAgent) window.auraAgent.processInteraction(100, true);
        });
        
        window.addEventListener('mouseup', () => {
            this.state.click = false;
            this.updateStyles();
        });

        // Event delegation for hovers
        document.addEventListener('mouseover', (e) => {
            const t = e.target;
            if (t.tagName === 'A' || t.closest('a')) this.setHover('link', 'Explore');
            else if (t.tagName === 'BUTTON' || t.closest('button')) this.setHover('button', 'Click');
            else if (t.tagName === 'IMG' || t.closest('img')) this.setHover('image', 'View');
            else if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') this.setHover('text', 'Type');
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.tagName === 'A' || e.target.closest('a') || e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.tagName === 'IMG' || e.target.closest('img') || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                this.setHover('default', '');
            }
        });

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }
    
    setHover(type, text) {
        this.state.hover = type !== 'default';
        this.state.type = type;
        this.state.text = text;
        this.updateStyles();
    }
    
    getColor() {
        const isLight = document.body.classList.contains('light-theme');
        if (this.state.hover) {
            if (this.state.type === 'link') return isLight ? '#00bcd4' : '#E85D3F';
            if (this.state.type === 'button') return '#E85D3F';
            if (this.state.type === 'text') return '#D4A853';
            if (this.state.type === 'image') return '#6366F1';
        }
        return isLight ? '#121212' : '#F0F0F5';
    }

    updateStyles() {
        const color = this.getColor();
        
        if (this.dot) {
            this.dot.style.backgroundColor = color;
            this.dot.style.transform = `translate(-50%, -50%) scale(${this.state.click ? 0.6 : 1})`;
            if (this.state.hover) this.dot.style.opacity = '0';
            else this.dot.style.opacity = '0.8';
        }
        
        if (this.ring) {
            const size = this.state.click ? 20 : (this.state.hover ? 48 : 28);
            this.ring.style.width = `${size}px`;
            this.ring.style.height = `${size}px`;
            this.ring.style.borderColor = color;
            this.ring.style.opacity = this.state.hover ? '0.6' : '0.3';
            this.ring.style.borderWidth = this.state.hover ? '1px' : '2px';
        }
        
        if (this.label) {
            if (this.state.hover && this.state.text) {
                this.label.innerText = this.state.text;
                this.label.style.opacity = '1';
                this.label.style.transform = `translate(24px, -50%) scale(1)`;
                this.label.style.color = color;
                this.label.style.backgroundColor = `color-mix(in srgb, ${color} 15%, transparent)`;
                this.label.style.border = `1px solid color-mix(in srgb, ${color} 30%, transparent)`;
            } else {
                this.label.style.opacity = '0';
                this.label.style.transform = `translate(16px, -50%) scale(0.8)`;
            }
        }
    }

    animate() {
        // Fast lerp for dot
        this.x += (this.targetX - this.x) * 0.4;
        this.y += (this.targetY - this.y) * 0.4;
        
        // Slower spring for ring
        this.ringX += (this.targetX - this.ringX) * 0.15;
        this.ringY += (this.targetY - this.ringY) * 0.15;
        
        if (this.dot) {
            this.dot.style.left = `${this.x}px`;
            this.dot.style.top = `${this.y}px`;
        }
        if (this.ring) {
            this.ring.style.left = `${this.ringX}px`;
            this.ring.style.top = `${this.ringY}px`;
        }
        if (this.label) {
            this.label.style.left = `${this.x}px`;
            this.label.style.top = `${this.y}px`;
        }
        
        // Update trails
        const color = this.getColor();
        this.trails.forEach((t, i) => {
            const size = 6 - (i * 0.5);
            t.el.style.left = `${t.x}px`;
            t.el.style.top = `${t.y}px`;
            t.el.style.width = `${size}px`;
            t.el.style.height = `${size}px`;
            t.el.style.backgroundColor = color;
            t.el.style.opacity = this.state.hover ? '0' : Math.max(0, 0.4 - (i * 0.05));
        });

        requestAnimationFrame(this.animate);
    }
}

// Initialize Custom UX
window.addEventListener('DOMContentLoaded', () => {
    window.auraAgent = new AuraAgent();
    new CustomCursor();

    // AURA HUD Toggle Logic
    const agentHud = document.getElementById('agent-hud');
    const auraClose = document.getElementById('aura-close');
    const auraToggle = document.getElementById('aura-toggle');
    
    if (agentHud && auraClose && auraToggle) {
        auraClose.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent bubbling if any
            agentHud.classList.add('minimized');
        });
        
        auraToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            agentHud.classList.remove('minimized');
            window.auraAgent.processInteraction(100, true);
        });
        
        document.querySelectorAll('.aura-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.auraAgent.talk(btn.getAttribute('data-topic'));
            });
        });
    }

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Section Reveals
    const observerOptions = {
        root: null,
        rootMargin: '-50px',
        threshold: 0.1
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));

    // Tilt Cards Glow & 3D Effect
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Set CSS variables for the glow
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            
            // Calculate 3D tilt
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
});
