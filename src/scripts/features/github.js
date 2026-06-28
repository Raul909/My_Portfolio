import { sanitizeUrl, escapeHTML } from '../utils/security.js';

/**
 * @param {string} [containerId='github-projects']
 * @returns {Promise<void>}
 */
export async function fetchGitHubRepos(containerId = 'github-projects') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<p class="loading-text">Loading projects...</p>';

    const CACHE_KEY = 'github_repos_cache';
    const CACHE_TTL_MS = 60 * 60 * 1000;

    try {
        /** @type {Array<{ fork: boolean; name: string; homepage: string | null; description: string | null; language: string | null; html_url: string; stargazers_count: number; forks_count: number; }> | null} */
        let repos = null;

        try {
            const cachedData = sessionStorage.getItem(CACHE_KEY);
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
                    repos = parsed.data;
                }
            }
        } catch (e) {
            console.warn('Failed to read from cache:', e);
        }

        if (!repos) {
            const res = await fetch('/api/github');
            if (!res.ok) throw new Error('GitHub API error');
            repos = /** @type {Array<any>} */ (await res.json());

            try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: Date.now(),
                    data: repos
                }));
            } catch (e) {
                console.warn('Failed to save to cache:', e);
            }
        }

        const filtered = /** @type {Array<{ fork: boolean; name: string; homepage: string | null; description: string | null; language: string | null; html_url: string; stargazers_count: number; forks_count: number; }>} */ (repos.filter(r => !r.fork)).slice(0, 6);
        container.innerHTML = '';

        filtered.forEach(repo => {
            const LIVE_URLS = /** @type {{ [key: string]: string }} */ ({
                'My_Portfolio': 'https://raul909portfolio.netlify.app/',
                'Tic-Tac-Toe-Space': 'https://tic-tac-toe-space.pages.dev/'
            });
            let liveUrl = repo.homepage && repo.homepage.trim() ? repo.homepage.trim() : (LIVE_URLS[repo.name] || null);
            if (!liveUrl && repo.name.toLowerCase().includes('portfolio')) {
                liveUrl = 'https://raul909portfolio.netlify.app/';
            }
            if (liveUrl) liveUrl = sanitizeUrl(liveUrl);

            const previewSrc = liveUrl
                ? `https://image.thum.io/get/width/600/crop/400/noanimate/${encodeURIComponent(liveUrl)}`
                : null;

            const safePreviewSrc = previewSrc ? sanitizeUrl(previewSrc) : '';
            const safeRepoName = escapeHTML(repo.name);
            const safeDescription = escapeHTML(repo.description || 'No description available.');
            const safeLanguage = escapeHTML(repo.language || '');
            const safeHtmlUrl = sanitizeUrl(repo.html_url);

            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                ${safePreviewSrc ? `
                <div class="project-preview">
                    <img src="${safePreviewSrc}" alt="${safeRepoName} preview" class="project-preview-image" loading="lazy" width="600" height="340">
                </div>
                ` : ''}
                <div class="project-content">
                    <h3>${safeRepoName.replace(/[-_]/g, ' ')}</h3>
                    <p>${safeDescription}</p>
                    <div class="project-tags">
                        ${safeLanguage ? `<span class="tag">${safeLanguage}</span>` : ''}
                        ${repo.stargazers_count > 0 ? `<span class="tag">⭐ ${Number(repo.stargazers_count)}</span>` : ''}
                        ${repo.forks_count > 0 ? `<span class="tag">🔱 ${Number(repo.forks_count)}</span>` : ''}
                    </div>
                    <div class="project-links">
                        <a href="${safeHtmlUrl}" target="_blank" rel="noopener noreferrer" class="code-link">View Code →</a>
                        ${liveUrl && liveUrl !== '#' ? `<a href="${liveUrl}" target="_blank" rel="noopener noreferrer" class="live-demo-btn">Live Demo →</a>` : ''}
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch {
        container.innerHTML = `<p class="error-text">Unable to load projects. Visit <a href="https://github.com/Raul909" target="_blank" rel="noopener noreferrer">GitHub →</a></p>`;
    }
}
