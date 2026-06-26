// Utilidades reutilizables

// Lazy Loading con IntersectionObserver
export const LazyLoader = {
    init() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px 0px',
            threshold: 0.01
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    },

    observeNew(container) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '200px 0px' });

        container.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    }
};

// Animaciones de entrada
export const Animations = {
    init() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.animate-in').forEach(el => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.animate-in').forEach(el => {
            observer.observe(el);
        });
    }
};

// Botón volver arriba
export const BackToTop = {
    init() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });
    }
};

// Service Worker (PWA)
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        const swCode = `
            const CACHE_NAME = 'ruta-v1';
            const ASSETS = ['/'];
            
            self.addEventListener('install', (e) => {
                e.waitUntil(
                    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
                );
                self.skipWaiting();
            });
            
            self.addEventListener('activate', (e) => {
                e.waitUntil(
                    caches.keys().then(keys => 
                        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
                    )
                );
            });
            
            self.addEventListener('fetch', (e) => {
                e.respondWith(
                    caches.match(e.request).then(response => {
                        return response || fetch(e.request).then(fetchResponse => {
                            if (e.request.method === 'GET' && fetchResponse.ok) {
                                const clone = fetchResponse.clone();
                                caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                            }
                            return fetchResponse;
                        });
                    }).catch(() => caches.match('/'))
                );
            });
        `;
        
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        
        navigator.serviceWorker.register(swUrl).catch(err => {
            console.log('SW registration failed:', err);
        });
    }
}