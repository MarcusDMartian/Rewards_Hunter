import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function enableMocking() {
    // Enable Mocking in development environments only
    if (process.env.NODE_ENV !== 'development') {
        return;
    }

    const { worker } = await import('./tests/mocks/browser');

    // `worker.start()` returns a Promise that resolves
    // once the Service Worker is up and ready to intercept requests.
    return worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
            url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
        },
    });
}

enableMocking().then(() => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
});
