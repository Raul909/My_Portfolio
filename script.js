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

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

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
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    if (navLinks.style.display === 'flex') {
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.flexDirection = 'column';
        navLinks.style.background = 'rgba(10, 10, 10, 0.98)';
        navLinks.style.padding = '1rem';
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
                card.innerHTML = `
                    <h3>${repo.name.replace(/-|_/g, ' ')}</h3>
                    <p>${repo.description || 'No description available'}</p>
                    <div class="project-tags">
                        ${repo.language ? `<span class="tag">${repo.language}</span>` : ''}
                        <span class="tag">⭐ ${repo.stargazers_count}</span>
                    </div>
                    <div class="project-links">
                        <a href="${repo.html_url}" target="_blank">View Code →</a>
                        ${repo.homepage ? `<a href="${repo.homepage}" target="_blank">Live Demo →</a>` : ''}
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

// YouTube Channel Videos - Fixed with multiple fallbacks
async function loadYouTubeVideos() {
    const container = document.getElementById('youtube-videos');
    const channelHandle = '@sirius_shutterup';
    
    // Add your video IDs here for guaranteed display
    const manualVideoIds = [
        'dQw4w9WgXcQ', // Example - replace with your actual video IDs
    ];
    
    container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--secondary);">Loading videos...</p>';
    
    try {
        // Method 1: Try RSS feed via CORS proxy
        const channelId = 'UCjsOF9jvN-39lHfgEnIWEbw';
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
            if (videoId && videoIds.length < 6) {
                videoIds.push(videoId.textContent);
            }
        });
        
        if (videoIds.length > 0) {
            displayVideos(videoIds, container);
            return;
        }
        throw new Error('No videos in RSS');
    } catch (error) {
        console.log('RSS failed, trying manual IDs:', error);
        
        // Fallback to manual video IDs
        if (manualVideoIds.length > 0 && manualVideoIds[0] !== 'dQw4w9WgXcQ') {
            displayVideos(manualVideoIds, container);
        } else {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <p>Check out my latest videos on <a href="https://www.youtube.com/@sirius_shutterup" target="_blank" style="color: var(--primary);">YouTube @sirius_shutterup</a></p>
                    <p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.7;">Add your video IDs to script.js line 120 for display</p>
                </div>
            `;
        }
    }
}

function displayVideos(videoIds, container) {
    container.innerHTML = '';
    videoIds.forEach(videoId => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" 
                 onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'"
                 alt="Video thumbnail" 
                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 15px; transition: all 0.3s;">
            <div class="video-overlay" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); border-radius: 15px; transition: all 0.3s; opacity: 0;">
                <svg width="68" height="48" viewBox="0 0 68 48">
                    <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#fff"></path>
                    <path d="M 45,24 27,14 27,34" fill="#000"></path>
                </svg>
            </div>
        `;
        
        card.addEventListener('mouseenter', () => {
            card.querySelector('.video-overlay').style.opacity = '1';
        });
        
        card.addEventListener('mouseleave', () => {
            card.querySelector('.video-overlay').style.opacity = '0';
        });
        
        card.addEventListener('click', () => {
            window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
        });
        
        container.appendChild(card);
    });
}

loadYouTubeVideos();

// Instagram Photos - Fixed with CORS proxy
async function loadPhotoGallery() {
    const container = document.getElementById('photo-gallery');
    const username = 'sirius_shutterup';
    
    // Add your photo URLs here for guaranteed display
    const manualPhotos = [
        // Example: 'https://i.imgur.com/xxxxx.jpg',
    ];
    
    container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--secondary);">Loading photos...</p>';
    
    try {
        // Try CORS proxy
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://www.instagram.com/${username}/`)}`;
        const response = await fetch(proxyUrl);
        const html = await response.text();
        
        const imageUrls = [];
        const regex = /"display_url":"(https:\\u002F\\u002F[^"]+)"/g;
        let match;
        
        while ((match = regex.exec(html)) !== null && imageUrls.length < 12) {
            const url = match[1]
                .replace(/\\u002F/g, '/')
                .replace(/\\u0026/g, '&');
            if (!imageUrls.includes(url)) {
                imageUrls.push(url);
            }
        }
        
        if (imageUrls.length > 0) {
            displayPhotos(imageUrls, container, username);
            return;
        }
        throw new Error('No photos found');
    } catch (error) {
        console.log('Instagram scraping failed:', error);
        
        if (manualPhotos.length > 0) {
            displayPhotos(manualPhotos, container, username);
        } else {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <p>View my photography on <a href="https://www.instagram.com/sirius_shutterup/" target="_blank" style="color: var(--primary);">Instagram @sirius_shutterup</a></p>
                    <p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.7;">Add image URLs to script.js line 180 for display</p>
                </div>
            `;
        }
    }
}

function displayPhotos(imageUrls, container, username) {
    container.innerHTML = '';
    imageUrls.forEach((url, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <img src="${url}" alt="Photography ${index + 1}" loading="lazy">
            <div class="gallery-overlay">
                <span style="color: white; font-size: 2rem;">📸</span>
            </div>
        `;
        item.addEventListener('click', () => {
            window.open(`https://www.instagram.com/${username}/`, '_blank');
        });
        container.appendChild(item);
    });
}

loadPhotoGallery();

// Contact form
document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your message! I\'ll get back to you soon.');
    e.target.reset();
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.about-card, .project-card, .video-card, .gallery-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});
