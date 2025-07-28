// Utility for encoding and storing credentials
export const getStoredCreds = (): string | null => {
    return localStorage.getItem('authCreds');
};

export const setCreds = (username: string, password: string) => {
    const encoded = btoa(`${username}:${password}`);
    localStorage.setItem('authCreds', encoded);
};

export const clearCreds = () => {
    localStorage.removeItem('authCreds');
};

export const sendCredsToSW = () => {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'SET_CREDENTIALS',
            basicAuth: getStoredCreds() || ''
        });
    }
};


export const getAuthHeader = (): { Authorization: string } | {} => {
    const creds = getStoredCreds();
    return creds ? { Authorization: `Basic ${creds}` } : {};
};