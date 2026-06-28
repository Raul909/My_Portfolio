interface Env {
    WEB3FORMS_KEY: string;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
    try {
        const body = await context.request.json() as { name?: string; email?: string; message?: string };
        const name = body.name?.trim();
        const email = body.email?.trim();
        const message = body.message?.trim();

        if (!name || !email || !message) {
            return new Response(JSON.stringify({ error: 'All fields are required.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const payload = {
            access_key: context.env.WEB3FORMS_KEY,
            name: name.toString(),
            email: email.toString(),
            message: message.toString(),
        };

        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch {
        return new Response(JSON.stringify({ error: 'Internal server error.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
