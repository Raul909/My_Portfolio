export async function onRequest(context: { request: Request }): Promise<Response> {
    const url = new URL(context.request.url);
    const channelId = url.searchParams.get('channel_id') || 'UCjsOF9jvN-39lHfgEnIWEbw';
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    try {
        const response = await fetch(rssUrl, {
            headers: {
                'User-Agent': 'rahul-biswas-portfolio-worker'
            }
        });
        
        if (!response.ok) {
            throw new Error(`YouTube RSS returned ${response.status}`);
        }

        const text = await response.text();
        return new Response(text, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Failed to fetch YouTube feed' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
