import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.error('SW failed:', err));
}

createRoot(document.getElementById("root")!).render(<App />);
