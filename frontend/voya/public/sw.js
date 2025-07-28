let basicAuth = '';

self.addEventListener('message', event => {
    if (event.data?.type === 'SET_CREDENTIALS') {
        basicAuth = event.data.basicAuth || '';
    }
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // only handle your protected endpoints
    if (url.pathname.startsWith('/api/video') ||
        url.pathname.startsWith('/api/subtitles')) {
        const headers = new Headers(event.request.headers);
        if (basicAuth) headers.set('Authorization', `Basic ${basicAuth}`);

        const authReq = new Request(event.request, {
            method: event.request.method,
            headers,
            mode: event.request.mode,
            credentials: event.request.credentials,
            redirect: event.request.redirect,
        });
        event.respondWith(fetch(authReq));
    }
});