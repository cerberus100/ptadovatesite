/**
 * Performance Optimization Module
 * Helping Hands Patient Advocates
 */

class PerformanceManager {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        this.measurePageLoad();
        this.optimizeResourceLoading();
        this.setupCriticalResourceHints();
        this.monitorPerformance();
    }

    measurePageLoad() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const navigation = performance.getEntriesByType('navigation')[0];
                
                this.metrics = {
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                    domInteractive: navigation.domInteractive - navigation.navigationStart,
                    firstPaint: this.getFirstPaint(),
                    largestContentfulPaint: this.getLCP()
                };
                
                this.reportMetrics();
            });
        }
    }

    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : null;
    }

    getLCP() {
        return new Promise((resolve) => {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    resolve(lastEntry.startTime);
                });
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
                
                // Timeout after 5 seconds
                setTimeout(() => resolve(null), 5000);
            } else {
                resolve(null);
            }
        });
    }

    optimizeResourceLoading() {
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Defer non-critical JavaScript
        this.deferNonCriticalJS();
        
        // Optimize font loading
        this.optimizeFontLoading();
    }

    preloadCriticalResources() {
        const criticalResources = [
            { href: 'assets/css/style.min.css', as: 'style' },
            { href: 'assets/js/main.js', as: 'script' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            document.head.appendChild(link);
        });
    }

    deferNonCriticalJS() {
        // Load non-critical JavaScript after page load
        window.addEventListener('load', () => {
            // Intentionally empty: avoid double-loading modules or 404s
            // Lazy loading is already included via a script tag, and analytics is not used.
        });
    }

    loadScriptAsync(src) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
    }

    optimizeFontLoading() {
        // Add font-display: swap to improve perceived performance
        if ('fonts' in document) {
            document.fonts.ready.then(() => {
                document.body.classList.add('fonts-loaded');
            });
        }
    }

    setupCriticalResourceHints() {
        // DNS prefetch for external domains
        const externalDomains = [
            'fonts.googleapis.com',
            'fonts.gstatic.com'
        ];

        externalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = `//${domain}`;
            document.head.appendChild(link);
        });
    }

    monitorPerformance() {
        // Monitor Core Web Vitals
        if ('PerformanceObserver' in window) {
            this.observeLCP();
            this.observeFID();
            this.observeCLS();
        }
    }

    observeLCP() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            this.metrics.lcp = lastEntry.startTime;
            this.checkLCPThreshold(lastEntry.startTime);
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    observeFID() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                this.metrics.fid = entry.processingStart - entry.startTime;
                this.checkFIDThreshold(entry.processingStart - entry.startTime);
            });
        });
        
        observer.observe({ entryTypes: ['first-input'] });
    }

    observeCLS() {
        let cumulativeLayoutShift = 0;
        
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    cumulativeLayoutShift += entry.value;
                }
            });
            
            this.metrics.cls = cumulativeLayoutShift;
            this.checkCLSThreshold(cumulativeLayoutShift);
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
    }

    checkLCPThreshold(lcp) {
        // LCP should be under 2.5 seconds for good user experience
        if (lcp > 2500) {
            console.warn(`LCP is ${lcp}ms - consider optimizing largest content element`);
        }
    }

    checkFIDThreshold(fid) {
        // FID should be under 100ms for good user experience
        if (fid > 100) {
            console.warn(`FID is ${fid}ms - consider optimizing JavaScript execution`);
        }
    }

    checkCLSThreshold(cls) {
        // CLS should be under 0.1 for good user experience
        if (cls > 0.1) {
            console.warn(`CLS is ${cls} - consider adding dimensions to images and ads`);
        }
    }

    reportMetrics() {
        // In production, send metrics to analytics
        if (this.metrics.lcp !== undefined) {
            console.log('Performance Metrics:', this.metrics);
            
            // Example: Send to Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'performance_metrics', {
                    custom_parameter_lcp: this.metrics.lcp,
                    custom_parameter_fid: this.metrics.fid,
                    custom_parameter_cls: this.metrics.cls
                });
            }
        }
    }
}

// Resource Loading Optimizer
class ResourceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeImages();
        this.optimizeCSS();
        this.optimizeJavaScript();
    }

    optimizeImages() {
        // Convert images to WebP when supported
        this.convertToWebP();
        
        // Implement responsive images
        this.setupResponsiveImages();
        
        // Add loading="lazy" to images
        this.addLazyLoading();
    }

    convertToWebP() {
        // This would typically be done at build time
        // Here we detect WebP support and update image sources
        const webP = new Image();
        webP.onload = webP.onerror = () => {
            const supportsWebP = (webP.height === 2);
            if (supportsWebP) {
                document.body.classList.add('webp-supported');
            }
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    }

    setupResponsiveImages() {
        const images = document.querySelectorAll('img[data-srcset]');
        images.forEach(img => {
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                img.sizes = img.dataset.sizes || '100vw';
            }
        });
    }

    addLazyLoading() {
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            // Don't add lazy loading to above-the-fold images
            if (img.getBoundingClientRect().top > window.innerHeight) {
                img.loading = 'lazy';
            }
        });
    }

    optimizeCSS() {
        // Remove unused CSS (this would typically be done at build time)
        this.removeUnusedCSS();
        
        // Inline critical CSS
        this.inlineCriticalCSS();
    }

    removeUnusedCSS() {
        // This is a placeholder - in production, use tools like PurgeCSS
        console.log('CSS optimization would happen at build time');
    }

    inlineCriticalCSS() {
        // Extract and inline critical CSS for above-the-fold content
        // This would typically be done at build time with tools like Critical
        const criticalCSS = `
            .hero { font-size: 2rem; }
            .navbar { position: fixed; top: 0; }
        `;
        
        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.appendChild(style);
    }

    optimizeJavaScript() {
        // Implement code splitting
        this.implementCodeSplitting();
        
        // Tree shake unused code
        this.treeShakeCode();
    }

    implementCodeSplitting() {
        // Load modules dynamically when needed
        this.loadModuleOnDemand();
    }

    async loadModuleOnDemand() {
        // Example: Load heavy modules only when needed
        if (document.querySelector('.chart-container')) {
            const { default: Chart } = await import('./chart-module.js');
            // Initialize chart
        }
    }

    treeShakeCode() {
        // This would be done at build time with bundlers like Webpack
        console.log('Tree shaking would happen at build time');
    }
}

// Network Optimization
class NetworkOptimizer {
    constructor() {
        this.connectionType = this.getConnectionType();
        this.init();
    }

    init() {
        this.adaptToConnection();
        this.implementServiceWorker();
        this.setupHTTP2Push();
    }

    getConnectionType() {
        if ('connection' in navigator) {
            return navigator.connection.effectiveType;
        }
        return 'unknown';
    }

    adaptToConnection() {
        // Adapt content based on connection speed
        if (this.connectionType === 'slow-2g' || this.connectionType === '2g') {
            this.enableLowBandwidthMode();
        }
    }

    enableLowBandwidthMode() {
        document.body.classList.add('low-bandwidth');
        
        // Reduce image quality
        const images = document.querySelectorAll('img[data-lazy-src]');
        images.forEach(img => {
            if (img.dataset.lowBandwidth) {
                img.dataset.lazySrc = img.dataset.lowBandwidth;
            }
        });
        
        // Disable auto-play videos
        const videos = document.querySelectorAll('video[autoplay]');
        videos.forEach(video => {
            video.removeAttribute('autoplay');
        });
    }

    implementServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        }
    }

    setupHTTP2Push() {
        // HTTP/2 Server Push hints
        const pushResources = [
            'assets/css/style.min.css',
            'assets/js/main.js'
        ];

        pushResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    window.performanceManager = new PerformanceManager();
    window.resourceOptimizer = new ResourceOptimizer();
    window.networkOptimizer = new NetworkOptimizer();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PerformanceManager,
        ResourceOptimizer,
        NetworkOptimizer
    };
}