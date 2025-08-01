/**
 * Service Worker for Helping Hands Patient Advocates
 * Provides offline functionality and performance optimization
 */

const CACHE_NAME = 'helping-hands-v1.0.0';
const STATIC_CACHE = 'helping-hands-static-v1';
const DYNAMIC_CACHE = 'helping-hands-dynamic-v1';
const IMAGE_CACHE = 'helping-hands-images-v1';

// Resources to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/about.html',
    '/faq.html',
    '/privacy.html',
    '/terms.html',
    '/accessibility.html',
    '/success-stories.html',
    '/404.html',
    '/assets/css/style.min.css',
    '/assets/js/main.js',
    '/assets/js/lazy-loading.js',
    '/assets/js/performance.js',
    '/assets/js/jquery-3.6.0.min.js',
    '/manifest.json'
];

// Financial help pages
const FINANCIAL_PAGES = [
    '/financial-help/',
    '/financial-help/index.html',
    '/financial-help/medication-help.html',
    '/financial-help/hospital-help.html',
    '/financial-help/emergency-help.html',
    '/financial-help/supplies-help.html'
];

// Blog pages
const BLOG_PAGES = [
    '/blog/',
    '/blog/index.html'
];

// Cache strategies
const CACHE_STRATEGIES = {
    // Cache first, then network (for static assets)
    CACHE_FIRST: 'cache-first',
    // Network first, then cache (for dynamic content)
    NETWORK_FIRST: 'network-first',
    // Stale while revalidate (for frequently updated content)
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
    // Network only (for critical real-time data)
    NETWORK_ONLY: 'network-only'
};

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Caching static assets...');
                return cache.addAll([...STATIC_ASSETS, ...FINANCIAL_PAGES, ...BLOG_PAGES]);
            })
        ])
    );
    
    // Skip waiting to activate immediately
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && 
                        cacheName !== DYNAMIC_CACHE && 
                        cacheName !== IMAGE_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Take control of all pages immediately
    self.clients.claim();
});

// Fetch event - handle all network requests
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (url.pathname.startsWith('/assets/images/')) {
        event.respondWith(handleImageRequest(request));
    } else if (url.pathname.startsWith('/assets/')) {
        event.respondWith(handleStaticAssetRequest(request));
    } else if (url.pathname.startsWith('/financial-help/')) {
        event.respondWith(handleFinancialPageRequest(request));
    } else if (url.pathname.startsWith('/blog/')) {
        event.respondWith(handleBlogPageRequest(request));
    } else if (isHTMLRequest(request)) {
        event.respondWith(handleHTMLRequest(request));
    } else {
        event.respondWith(handleGenericRequest(request));
    }
});

// Handle image requests with aggressive caching
async function handleImageRequest(request) {
    try {
        const cache = await caches.open(IMAGE_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful image responses
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Image request failed:', error);
        
        // Return placeholder image for failed requests
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#f8f9fa"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6c757d">Image not available</text></svg>',
            {
                headers: { 'Content-Type': 'image/svg+xml' }
            }
        );
    }
}

// Handle static assets (CSS, JS) with cache-first strategy
async function handleStaticAssetRequest(request) {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Static asset request failed:', error);
        throw error;
    }
}

// Handle financial help pages with stale-while-revalidate
async function handleFinancialPageRequest(request) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        // Return cached version immediately if available
        if (cachedResponse) {
            // Update cache in background
            fetch(request).then(networkResponse => {
                if (networkResponse.ok) {
                    cache.put(request, networkResponse.clone());
                }
            }).catch(error => {
                console.log('Background update failed:', error);
            });
            
            return cachedResponse;
        }
        
        // No cache, fetch from network
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Financial page request failed:', error);
        
        // Return offline fallback for financial pages
        return createOfflineFallback('Financial assistance information is temporarily unavailable. Please try again later.');
    }
}

// Handle blog pages with network-first strategy
async function handleBlogPageRequest(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Blog page network request failed, trying cache...');
        
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline fallback for blog
        return createOfflineFallback('Blog content is temporarily unavailable. Please check your connection and try again.');
    }
}

// Handle HTML pages
async function handleHTMLRequest(request) {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            // Update cache in background
            fetch(request).then(networkResponse => {
                if (networkResponse.ok) {
                    cache.put(request, networkResponse.clone());
                }
            }).catch(() => {
                // Ignore network errors for background updates
            });
            
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('HTML request failed:', error);
        
        // Return cached 404 page or create offline fallback
        const cache = await caches.open(STATIC_CACHE);
        const fallback = await cache.match('/404.html');
        
        if (fallback) {
            return fallback;
        }
        
        return createOfflineFallback('This page is not available offline. Please check your connection.');
    }
}

// Handle generic requests
async function handleGenericRequest(request) {
    try {
        return await fetch(request);
    } catch (error) {
        console.log('Generic request failed:', error);
        throw error;
    }
}

// Utility functions
function isHTMLRequest(request) {
    return request.headers.get('Accept').includes('text/html');
}

function createOfflineFallback(message) {
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Offline - Helping Hands Patient Advocates</title>
            <style>
                body {
                    font-family: system-ui, -apple-system, sans-serif;
                    margin: 0;
                    padding: 2rem;
                    background: #f8f9fa;
                    color: #26547C;
                    text-align: center;
                }
                .container {
                    max-width: 600px;
                    margin: 2rem auto;
                    background: white;
                    padding: 3rem;
                    border-radius: 1rem;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                }
                .icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }
                h1 {
                    color: #26547C;
                    margin-bottom: 1rem;
                }
                .btn {
                    display: inline-block;
                    background: #46B5A4;
                    color: white;
                    padding: 1rem 2rem;
                    text-decoration: none;
                    border-radius: 0.5rem;
                    margin-top: 2rem;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon">📱</div>
                <h1>You're Offline</h1>
                <p>${message}</p>
                <a href="/" class="btn" onclick="window.location.reload()">Try Again</a>
            </div>
        </body>
        </html>
    `;
    
    return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
    });
}

// Background sync for form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'assistance-request') {
        event.waitUntil(syncAssistanceRequests());
    } else if (event.tag === 'newsletter-signup') {
        event.waitUntil(syncNewsletterSignups());
    }
});

async function syncAssistanceRequests() {
    try {
        // Get pending requests from IndexedDB and submit them
        console.log('Syncing assistance requests...');
        // Implementation would depend on your data storage strategy
    } catch (error) {
        console.log('Failed to sync assistance requests:', error);
    }
}

async function syncNewsletterSignups() {
    try {
        // Get pending signups from IndexedDB and submit them
        console.log('Syncing newsletter signups...');
        // Implementation would depend on your data storage strategy
    } catch (error) {
        console.log('Failed to sync newsletter signups:', error);
    }
}

// Handle push notifications (if implemented)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body,
            icon: '/assets/images/icon-192.png',
            badge: '/assets/images/badge-72.png',
            tag: data.tag || 'general',
            requireInteraction: data.urgent || false,
            actions: data.actions || []
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'open-app') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'financial-help') {
        event.waitUntil(
            clients.openWindow('/financial-help/')
        );
    }
});