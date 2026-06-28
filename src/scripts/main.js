import { TIER_CONFIG } from './core/config.js';
import { AsciiRenderer } from './renderers/ascii-renderer.js';
import { fetchGitHubRepos } from './features/github.js';
import { loadYouTubeVideos } from './features/youtube.js';
import { loadPhotoGallery } from './features/gallery.js';

// ─── Globals ───────────────────────────────────────────────────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Tier Detection (must be declared early) ───────────────────────────────
const cores = /** @type {*} */ (navigator).hardwareConcurrency || 4;
const memory = /** @type {*} */ (navigator).deviceMemory || 4;
const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

let hardwareTier = 1;
if (cores >= 8 && memory >= 8 && !isMobile) {
    hardwareTier = 3;
} else if (cores >= 4 && memory >= 4) {
    hardwareTier = 2;
}

document.documentElement.classList.add(`tier-${hardwareTier}`);

// ─── Preloader ──────────────────────────────────────────────────────────────
setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => preloader.remove(), 500);
    }
}, 3000);

// ─── Navigation ────────────────────────────────────────────────────────────
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

const navbar = /** @type {HTMLElement | null} */ (document.getElementById('navbar'));

let isScrolling = false;
window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
            const heroContent = /** @type {HTMLElement | null} */ (document.querySelector('.hero-content'));
            if (heroContent && window.scrollY < window.innerHeight) {
                if (!prefersReducedMotion && hardwareTier > 1) {
                    heroContent.style.transform = `translateY(${window.scrollY * 0.25}px)`;
                }
                heroContent.style.opacity = `${1 - (window.scrollY / window.innerHeight) * 0.9}`;
            }
            isScrolling = false;
        });
        isScrolling = true;
    }
}, { passive: true });

// ─── Smooth Scroll ─────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const link = /** @type {HTMLElement} */ (e.currentTarget);
        e.preventDefault();
        const href = link.getAttribute('href');
        if (!href) return;
        const target = /** @type {HTMLElement | null} */ (document.querySelector(href));
        if (target && navbar) {
            window.scrollTo({ top: target.offsetTop - navbar.offsetHeight, behavior: 'smooth' });
        }
    });
});

// ─── Mobile Menu ───────────────────────────────────────────────────────────
const menuToggle = /** @type {HTMLElement | null} */ (document.querySelector('.menu-toggle'));
const navMenu = /** @type {HTMLElement | null} */ (document.querySelector('.nav-links'));
const navOverlay = document.querySelector('.nav-overlay');

function closeMenu() {
    if (navMenu) navMenu.classList.remove('active');
    if (menuToggle) {
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
    if (navOverlay) navOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function openMenu() {
    if (navMenu) navMenu.classList.add('active');
    if (menuToggle) {
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
    }
    if (navOverlay) navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.contains('active');
        if (isOpen) closeMenu();
        else openMenu();
    });
}

if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', closeMenu);
});

document.addEventListener('click', (e) => {
    if (navMenu && menuToggle && !navMenu.contains(/** @type {Node} */ (e.target)) && !menuToggle.contains(/** @type {Node} */ (e.target)) && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
});

// ─── Section Reveal Observer ───────────────────────────────────────────────
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            if (entry.target.classList.contains('section-reveal')) {
                entry.target.classList.add('is-visible');
            }
        }
    });
}, { threshold: 0.08 });

sections.forEach(s => sectionObserver.observe(s));
document.querySelectorAll('.section-reveal').forEach(r => sectionObserver.observe(r));

// ─── Animation Observer ────────────────────────────────────────────────────
const animObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                const el = /** @type {HTMLElement} */ (entry.target);
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, i * 80);
            animObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

/**
 * @param {Document | HTMLElement} [container=document]
 */
function observeCards(container = document) {
    if (hardwareTier === 1) {
        container.querySelectorAll('.about-card, .project-card, .video-card, .gallery-item').forEach(el => {
            const elem = /** @type {HTMLElement} */ (el);
            elem.style.opacity = '1';
            elem.style.transform = 'none';
        });
        return;
    }
    container.querySelectorAll('.about-card, .project-card, .video-card, .gallery-item').forEach(el => {
        const elem = /** @type {HTMLElement & { dataset: { observed?: string } }} */ (el);
        if (elem.dataset.observed) return;
        elem.dataset.observed = 'true';
        elem.style.opacity = '0';
        elem.style.transform = 'translateY(24px)';
        elem.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animObserver.observe(elem);
    });
}

// ─── 3D Tilt Effect ────────────────────────────────────────────────────────
function add3DTiltEffect() {
    if (prefersReducedMotion || hardwareTier === 1) return;
    document.querySelectorAll('.tilt-card, .project-card, .about-card').forEach(card => {
        const c = /** @type {HTMLElement} */ (card);
        let isHovering = false;
        /** @type {number | null} */
        let animationFrameId = null;

        c.addEventListener('mousemove', (e) => {
            if (!isHovering) isHovering = true;
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(() => {
                    const rect = c.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    c.style.setProperty('--mouse-x', `${x}px`);
                    c.style.setProperty('--mouse-y', `${y}px`);
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -10;
                    const rotateY = ((x - centerX) / centerX) * 10;
                    if (isHovering) {
                        c.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                    }
                    animationFrameId = null;
                });
            }
        });

        c.addEventListener('mouseleave', () => {
            isHovering = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            c.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

// ─── Typing Animation ──────────────────────────────────────────────────────
const typingText = /** @type {HTMLElement | null} */ (document.querySelector('.typing-text'));
const phrases = ['Developer', 'Video Editor', 'Photographer', 'Problem Solver', 'Creative Mind'];
let phraseIndex = 0, charIndex = 0, isDeleting = false;

function type() {
    const current = phrases[phraseIndex];
    if (typingText) typingText.textContent = current.substring(0, isDeleting ? --charIndex : ++charIndex);

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

if (prefersReducedMotion || hardwareTier === 1) {
    if (typingText) typingText.textContent = phrases[0];
} else {
    type();
}

// ─── Theme Toggler ─────────────────────────────────────────────────────────
const themeToggle = /** @type {HTMLElement | null} */ (document.querySelector('.theme-toggle'));
const currentTheme = localStorage.getItem('theme');
const prefersLightScheme = window.matchMedia('(prefers-color-scheme: light)');

if (currentTheme == 'light' || (!currentTheme && prefersLightScheme.matches)) {
    document.documentElement.classList.add('light-theme');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('light-theme');
        let theme = 'dark';
        if (document.documentElement.classList.contains('light-theme')) {
            theme = 'light';
        }
        localStorage.setItem('theme', theme);
    });
}

// ─── Contact Form ──────────────────────────────────────────────────────────
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailInput = /** @type {HTMLInputElement | null} */ (document.querySelector('input[name="email"]'));
if (emailInput) {
    emailInput.addEventListener('input', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        const val = target.value.trim();
        if (val === '') {
            target.style.borderColor = 'var(--border)';
        } else if (emailRegex.test(val)) {
            target.style.borderColor = '#00D4AA';
        } else {
            target.style.borderColor = '#E85D3F';
        }
    });
}

const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = /** @type {HTMLFormElement} */ (e.target);
        const msg = document.getElementById('form-message');
        const btn = /** @type {HTMLButtonElement | null} */ (form.querySelector('button[type="submit"]'));

        const formData = new FormData(form);
        const name = /** @type {string} */ (formData.get('name') || '').trim();
        const email = /** @type {string} */ (formData.get('email') || '').trim();
        const message = /** @type {string} */ (formData.get('message') || '').trim();

        if (!name || !email || !message) {
            if (msg) {
                msg.textContent = 'Please fill in all fields.';
                msg.className = 'form-message error';
            }
            return;
        }
        if (!emailRegex.test(email)) {
            if (msg) {
                msg.textContent = 'Please enter a valid email address.';
                msg.className = 'form-message error';
            }
            return;
        }

        const orig = btn ? btn.textContent : '';
        if (btn) {
            btn.textContent = 'Sending...';
            btn.disabled = true;
        }

        try {
            const object = Object.fromEntries(new FormData(form));
            const json = JSON.stringify(object);

            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: json
            });

            if (res.ok) {
                if (msg) {
                    msg.textContent = "✓ Message sent! I'll get back to you soon.";
                    msg.className = 'form-message success';
                }
                form.reset();
            } else {
                throw new Error('Network response was not ok');
            }
        } catch {
            if (msg) {
                msg.textContent = '✗ Something went wrong. Try emailing directly.';
                msg.className = 'form-message error';
            }
        }

        if (btn) {
            btn.textContent = orig;
            btn.disabled = false;
        }
        if (msg) setTimeout(() => { msg.className = 'form-message'; }, 5000);
    });
}

// ─── Benchmark Tier Detection ──────────────────────────────────────────────
/** @returns {Promise<number>} */
async function detectHardwareTier() {
    const bc = document.createElement('canvas');
    bc.width = 200; bc.height = 100;
    const bctx = /** @type {CanvasRenderingContext2D | null} */ (bc.getContext('2d'));
    if (!bctx) return hardwareTier;

    bctx.font = 'bold 18px "JetBrains Mono", monospace';

    const start = performance.now();
    for (let i = 0; i < 150; i++) {
        bctx.fillStyle = '#ffffff';
        bctx.fillRect(0, 0, 200, 100);
        for (let c = 0; c < 40; c++) {
            bctx.fillText('@W$9876', c * 10, (i % 10) * 10);
        }
    }
    const elapsed = performance.now() - start;

    let score = 0;
    score += Math.min(cores / 8, 1) * 25;
    score += Math.min(memory / 8, 1) * 25;
    score += elapsed < 25 ? 50 : elapsed < 60 ? 35 : elapsed < 120 ? 20 : 10;

    return score >= 70 ? 3 : score >= 40 ? 2 : 1;
}

/**
 * @param {number} tier
 */
function applyTier(tier) {
    hardwareTier = tier;
    document.documentElement.classList.remove('tier-1', 'tier-2', 'tier-3');
    document.documentElement.classList.add(`tier-${tier}`);
    window.dispatchEvent(new CustomEvent('tier-change', { detail: { tier } }));
}

// ─── Boot ──────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => preloader.remove(), 500);
    }

    if (prefersReducedMotion) return;

    requestIdleCallback(async () => {
        const refined = await detectHardwareTier();
        applyTier(refined);

        const config = TIER_CONFIG[refined].ascii;

        new AsciiRenderer('bg-video-source', 'ascii-video', 'home', refined, config);

        setTimeout(() => {
            new AsciiRenderer('video-editing-source', 'video-editing-ascii', 'videos', refined, config);
        }, 500);
    }, { timeout: 1000 });

    // Initialize features
    fetchGitHubRepos();
    loadYouTubeVideos();
    loadPhotoGallery();

    // Now observe cards that were just added
    requestAnimationFrame(() => {
        observeCards();
        add3DTiltEffect();
    });
});
