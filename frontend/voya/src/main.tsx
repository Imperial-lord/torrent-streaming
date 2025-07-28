import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.error('SW failed:', err));

    navigator.serviceWorker.ready.then(() => import('./utils/auth')
        .then(m => m.sendCredsToSW()));

    // ② repeat every time a *new* SW takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        navigator.serviceWorker.ready.then(() => import('./utils/auth')
            .then(m => m.sendCredsToSW()));
    });
}

createRoot(document.getElementById("root")!).render(<App />);
