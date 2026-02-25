// Custom Cursor - Removed for better performance

// Active navigation state with Intersection Observer
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
};

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${entry.target.id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => navObserver.observe(section));

// Scroll progress indicator
const scrollProgress = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    scrollProgress.style.width = scrolled + '%';
});

// Smooth navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Typing animation
const typingText = document.querySelector('.typing-text');
const phrases = ['Developer', 'Video Editor', 'Photographer', 'Problem Solver', 'Creative Mind'];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    const current = phrases[phraseIndex];
    
    if (isDeleting) {
        typingText.textContent = current.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingText.textContent = current.substring(0, charIndex + 1);
        charIndex++;
    }
    
    if (!isDeleting && charIndex === current.length) {
        setTimeout(() => isDeleting = true, 2000);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
    }
    
    setTimeout(type, isDeleting ? 50 : 150);
}

type();

// Smooth scroll with navbar offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navbarHeight = document.getElementById('navbar').offsetHeight;
            const targetPosition = target.offsetTop - navbarHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Parallax effect for hero content
window.addEventListener('scroll', () => {
    const heroContent = document.querySelector('.hero-content');
    const scrolled = window.pageYOffset;
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.8;
    }
});

// Magnetic effect for project cards
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
    });
});

// Smooth section reveal
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        }
    });
}, { threshold: 0.1 });

sections.forEach(section => sectionObserver.observe(section));

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.getElementById('navbar');
const bgVideo = document.getElementById('bg-video');

// Set video playback speed to 1.5x
if (bgVideo) {
    bgVideo.playbackRate = 1.5;
    bgVideo.addEventListener('loadedmetadata', () => {
        bgVideo.playbackRate = 1.5;
    });
}

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.boxShadow = 'none';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    }
    
    // Video scroll interaction - subtle zoom
    const scrollPercent = Math.min(currentScroll / window.innerHeight, 1);
    const scale = 1 + (scrollPercent * 0.15);
    const brightness = 0.5 - (scrollPercent * 0.2);
    
    bgVideo.style.transform = `translate(-50%, -50%) scale(${scale})`;
    bgVideo.style.filter = `brightness(${brightness}) saturate(1.2)`;
    
    lastScroll = currentScroll;
});

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links a');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
    const isExpanded = menuToggle.classList.contains('active');
    menuToggle.setAttribute('aria-expanded', isExpanded);
    document.body.style.overflow = isExpanded ? 'hidden' : '';
});

// Close menu when clicking nav links
navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
});

// Fetch GitHub repos
async function fetchGitHubRepos() {
    const container = document.getElementById('github-projects');
    
    try {
        const response = await fetch('https://api.github.com/users/Raul909/repos?sort=updated&per_page=6');
        const repos = await response.json();
        
        repos.forEach(repo => {
            if (!repo.fork) {
                const card = document.createElement('div');
                card.className = 'project-card';
                
                let liveUrl = repo.homepage;
                if (repo.name.toLowerCase().includes('portfolio') || repo.name === 'My_Portfolio') {
                    liveUrl = 'https://raul909portfolio.netlify.app/';
                }
                
                card.innerHTML = `
                    <h3>${repo.name.replace(/-|_/g, ' ')}</h3>
                    <p>${repo.description || 'No description available'}</p>
                    <div class="project-tags">
                        ${repo.language ? `<span class="tag">${repo.language}</span>` : ''}
                        ${repo.stargazers_count > 0 ? `<span class="tag">⭐ ${repo.stargazers_count}</span>` : ''}
                        ${repo.forks_count > 0 ? `<span class="tag">🔱 ${repo.forks_count}</span>` : ''}
                    </div>
                    <div class="project-links">
                        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">View Code →</a>
                        ${liveUrl ? `<a href="${liveUrl}" target="_blank" rel="noopener noreferrer" class="live-demo-btn">Live Demo →</a>` : ''}
                    </div>
                `;
                container.appendChild(card);
            }
        });
    } catch (error) {
        container.innerHTML = '<p>Unable to load projects. Visit <a href="https://github.com/Raul909" target="_blank">GitHub</a></p>';
    }
}

fetchGitHubRepos();

// YouTube Channel Videos - Real-time scraping with auto-refresh
async function loadYouTubeVideos() {
    const container = document.getElementById('youtube-videos');
    const channelId = 'UCjsOF9jvN-39lHfgEnIWEbw';
    
    const manualVideoIds = [];
    
    container.innerHTML = '<p style="text-align: center; color: var(--secondary); padding: 2rem;">Loading videos...</p>';
    
    async function fetchVideos() {
        try {
            const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
            const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`;
            
            const response = await fetch(proxyUrl);
            const text = await response.text();
            
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'text/xml');
            const entries = xml.querySelectorAll('entry');
            
            const videoIds = [];
            entries.forEach(entry => {
                const videoId = entry.querySelector('videoId');
                if (videoId) {
                    videoIds.push(videoId.textContent);
                }
            });
            
            if (videoIds.length > 0) {
                displayVideos(videoIds, container);
                return true;
            }
            return false;
        } catch (error) {
            console.log('YouTube fetch error:', error);
            return false;
        }
    }
    
    const success = await fetchVideos();
    
    if (!success) {
        if (manualVideoIds.length > 0) {
            displayVideos(manualVideoIds, container);
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <p>Check out my latest videos on <a href="https://www.youtube.com/@sirius_shutterup" target="_blank" style="color: var(--primary);">YouTube @sirius_shutterup</a></p>
                </div>
            `;
        }
    }
    
    // Auto-refresh every 5 minutes
    setInterval(async () => {
        const updated = await fetchVideos();
        if (updated) console.log('YouTube videos refreshed');
    }, 300000);
}

function displayVideos(videoIds, container) {
    container.innerHTML = '';
    videoIds.forEach(videoId => {
        const card = document.createElement('a');
        card.href = `https://www.youtube.com/watch?v=${videoId}`;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'video-card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" 
                 onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'"
                 alt="Video thumbnail" 
                 style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;">
            <div class="video-overlay" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); transition: all 0.3s;">
                <svg width="68" height="48" viewBox="0 0 68 48" style="filter: drop-shadow(0 2px 8px rgba(0,0,0,0.6));">
                    <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
                    <path d="M 45,24 27,14 27,34" fill="#fff"></path>
                </svg>
            </div>
        `;
        container.appendChild(card);
    });
}

loadYouTubeVideos();

// Photo Gallery with Slideshow
async function loadPhotoGallery() {
    const container = document.getElementById('photo-gallery');
    const username = 'sirius_shutterup';
    
    const manualPhotos = [
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
    
    displayPhotos(manualPhotos, container, username);
    
    // Auto-refresh every 10 minutes
    setInterval(async () => {
        const updated = await fetchPhotos();
        if (updated) console.log('Instagram photos refreshed');
    }, 600000);
}

function displayPhotos(imageUrls, container, username) {
    container.innerHTML = '';
    container.className = 'gallery-grid';
    
    imageUrls.forEach((url, index) => {
        const item = document.createElement('a');
        item.href = url;
        item.target = '_blank';
        item.rel = 'noopener noreferrer';
        item.className = 'gallery-item';
        item.innerHTML = `<img src="${url}" alt="Photography ${index + 1}" loading="lazy">`;
        container.appendChild(item);
    });
}

loadPhotoGallery();

// Contact form with validation
document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const formMessage = document.getElementById('form-message');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    // Get form data
    const name = form.querySelector('input[name="name"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const message = form.querySelector('textarea[name="message"]').value.trim();
    
    // Validation
    if (!name || !email || !message) {
        formMessage.textContent = 'Please fill in all fields.';
        formMessage.className = 'form-message error';
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        formMessage.textContent = 'Please enter a valid email address.';
        formMessage.className = 'form-message error';
        return;
    }
    
    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    formMessage.style.display = 'none';
    
    // Simulate form submission (replace with actual backend call)
    setTimeout(() => {
        formMessage.textContent = 'Thank you for your message! I\'ll get back to you soon.';
        formMessage.className = 'form-message success';
        form.reset();
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        
        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }, 1000);
});

// Intersection Observer for animations
const animationObserverOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}, animationObserverOptions);

document.querySelectorAll('.about-card, .project-card, .video-card, .gallery-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
    animationObserver.observe(el);
});
