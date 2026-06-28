interface Env {
    GITHUB_TOKEN?: string;
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
    const url = new URL(context.request.url);
    const githubPath = url.searchParams.get('path') || 'users/Raul909/repos?sort=updated&per_page=12&type=owner';

    const headers: Record<string, string> = {
        'User-Agent': 'rahul-biswas-portfolio',
        Accept: 'application/vnd.github.v3+json',
    };

    if (context.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${context.env.GITHUB_TOKEN}`;
    }

    try {
        const response = await fetch(`https://api.github.com/${githubPath}`, { headers });
        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300, s-maxage=300',
            },
        });
    } catch {
        return new Response(JSON.stringify({ error: 'GitHub API request failed' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
