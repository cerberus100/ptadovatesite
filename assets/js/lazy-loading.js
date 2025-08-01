/**
 * Lazy Loading and Image Optimization Module
 * Helping Hands Patient Advocates
 */

class LazyImageLoader {
    constructor() {
        this.images = [];
        this.imageObserver = null;
        this.init();
    }

    init() {
        // Check for browser support
        if ('IntersectionObserver' in window) {
            this.setupObserver();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
        
        // Setup WebP detection
        this.detectWebPSupport();
    }

    setupObserver() {
        this.imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            // Load images when they're 100px away from viewport
            rootMargin: '100px'
        });

        // Observe all lazy images
        this.observeImages();
    }

    observeImages() {
        const lazyImages = document.querySelectorAll('[data-lazy-src]');
        lazyImages.forEach(img => {
            this.imageObserver.observe(img);
            this.images.push(img);
        });
    }

    loadImage(img) {
        // Create a new image to test loading
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            // Successfully loaded, apply to actual image
            this.applyImage(img, imageLoader.src);
        };
        
        imageLoader.onerror = () => {
            // Failed to load, try fallback
            this.handleImageError(img);
        };

        // Determine best image source
        const imageSrc = this.getBestImageSrc(img);
        imageLoader.src = imageSrc;
    }

    getBestImageSrc(img) {
        const webpSrc = img.dataset.lazyWebp;
        const regularSrc = img.dataset.lazySrc;
        
        // Use WebP if supported and available
        if (this.supportsWebP && webpSrc) {
            return webpSrc;
        }
        
        return regularSrc;
    }

    applyImage(img, src) {
        // Add loading animation
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        img.src = src;
        img.onload = () => {
            img.style.opacity = '1';
            img.classList.add('lazy-loaded');
            
            // Remove data attributes to save memory
            delete img.dataset.lazySrc;
            delete img.dataset.lazyWebp;
        };
    }

    handleImageError(img) {
        // Try fallback image if available
        const fallbackSrc = img.dataset.fallback;
        if (fallbackSrc) {
            img.src = fallbackSrc;
        } else {
            // Use a placeholder
            img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f8f9fa"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23adb5bd">Image not available</text></svg>';
        }
        img.classList.add('lazy-error');
    }

    detectWebPSupport() {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
            this.supportsWebP = (webP.height === 2);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    }

    loadAllImages() {
        // Fallback for browsers without IntersectionObserver
        const lazyImages = document.querySelectorAll('[data-lazy-src]');
        lazyImages.forEach(img => {
            this.loadImage(img);
        });
    }

    // Method to manually trigger loading (useful for dynamic content)
    loadNewImages() {
        if (this.imageObserver) {
            this.observeImages();
        } else {
            this.loadAllImages();
        }
    }
}

// Background Image Lazy Loading
class LazyBackgroundLoader {
    constructor() {
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.setupObserver();
        } else {
            this.loadAllBackgrounds();
        }
    }

    setupObserver() {
        this.backgroundObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadBackground(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px'
        });

        const lazyBackgrounds = document.querySelectorAll('[data-lazy-bg]');
        lazyBackgrounds.forEach(element => {
            this.backgroundObserver.observe(element);
        });
    }

    loadBackground(element) {
        const bgImage = element.dataset.lazyBg;
        if (bgImage) {
            element.style.backgroundImage = `url(${bgImage})`;
            element.classList.add('lazy-bg-loaded');
            delete element.dataset.lazyBg;
        }
    }

    loadAllBackgrounds() {
        const lazyBackgrounds = document.querySelectorAll('[data-lazy-bg]');
        lazyBackgrounds.forEach(element => {
            this.loadBackground(element);
        });
    }
}

// Responsive Image Utility
class ResponsiveImageLoader {
    constructor() {
        this.init();
    }

    init() {
        this.setupResponsiveImages();
        
        // Re-evaluate on window resize (debounced)
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateResponsiveImages();
            }, 250);
        });
    }

    setupResponsiveImages() {
        const responsiveImages = document.querySelectorAll('[data-sizes]');
        responsiveImages.forEach(img => {
            this.setOptimalImageSize(img);
        });
    }

    setOptimalImageSize(img) {
        const sizes = JSON.parse(img.dataset.sizes || '{}');
        const viewportWidth = window.innerWidth;
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        // Find the best size for current viewport
        let bestSize = null;
        let bestWidth = 0;
        
        Object.keys(sizes).forEach(size => {
            const width = parseInt(size);
            if (width >= viewportWidth * devicePixelRatio && (bestSize === null || width < bestWidth)) {
                bestSize = sizes[size];
                bestWidth = width;
            }
        });
        
        // Fallback to largest size if no match
        if (!bestSize) {
            const maxWidth = Math.max(...Object.keys(sizes).map(s => parseInt(s)));
            bestSize = sizes[maxWidth];
        }
        
        if (bestSize && img.dataset.lazySrc !== bestSize) {
            img.dataset.lazySrc = bestSize;
        }
    }

    updateResponsiveImages() {
        this.setupResponsiveImages();
        
        // Trigger lazy loader to reload with new sizes
        if (window.lazyImageLoader) {
            window.lazyImageLoader.loadNewImages();
        }
    }
}

// Image Compression and Optimization Utilities
class ImageOptimizer {
    static createOptimizedImageHTML(src, alt, options = {}) {
        const {
            webpSrc = null,
            sizes = null,
            loading = 'lazy',
            className = '',
            fallback = null
        } = options;
        
        let imgHTML = `<img 
            ${loading === 'lazy' ? 'data-lazy-src' : 'src'}="${src}"
            ${webpSrc ? `data-lazy-webp="${webpSrc}"` : ''}
            ${sizes ? `data-sizes='${JSON.stringify(sizes)}'` : ''}
            ${fallback ? `data-fallback="${fallback}"` : ''}
            alt="${alt}"
            class="${className}"
            loading="${loading}"
        >`;
        
        return imgHTML;
    }
    
    static createPlaceholder(width, height, text = 'Loading...') {
        return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            <rect width="100%" height="100%" fill="%23f8f9fa"/>
            <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236c757d" font-family="system-ui">${text}</text>
        </svg>`;
    }
}

// Progressive Enhancement for Image Loading
class ProgressiveImageLoader {
    constructor() {
        this.loadProgressiveImages();
    }

    loadProgressiveImages() {
        const progressiveImages = document.querySelectorAll('[data-progressive]');
        progressiveImages.forEach(img => {
            this.loadProgressiveImage(img);
        });
    }

    loadProgressiveImage(img) {
        const lowQualitySrc = img.dataset.progressive;
        const highQualitySrc = img.dataset.lazySrc || img.src;
        
        // Load low quality first
        img.src = lowQualitySrc;
        img.style.filter = 'blur(5px)';
        img.style.transition = 'filter 0.3s ease';
        
        // Load high quality in background
        const highQualityImg = new Image();
        highQualityImg.onload = () => {
            img.src = highQualitySrc;
            img.style.filter = 'none';
        };
        highQualityImg.src = highQualitySrc;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize lazy loading
    window.lazyImageLoader = new LazyImageLoader();
    window.lazyBackgroundLoader = new LazyBackgroundLoader();
    window.responsiveImageLoader = new ResponsiveImageLoader();
    window.progressiveImageLoader = new ProgressiveImageLoader();
    
    // Add utility classes to global scope
    window.ImageOptimizer = ImageOptimizer;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LazyImageLoader,
        LazyBackgroundLoader,
        ResponsiveImageLoader,
        ImageOptimizer,
        ProgressiveImageLoader
    };
}