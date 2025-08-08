// Enhanced UI Features for True North Advocates

// Sticky Navigation with Scroll Transparency
class StickyNavigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.scrollThreshold = 100;
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll());
        this.handleScroll(); // Check initial state
    }

    handleScroll() {
        const scrolled = window.pageYOffset > this.scrollThreshold;
        
        if (scrolled) {
            this.navbar.classList.add('scrolled');
            this.navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            this.navbar.style.backdropFilter = 'blur(10px)';
            this.navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            this.navbar.classList.remove('scrolled');
            this.navbar.style.backgroundColor = '#fff';
            this.navbar.style.backdropFilter = 'none';
            this.navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    }
}

// Back to Top Button
class BackToTop {
    constructor() {
        this.createButton();
        this.init();
    }

    createButton() {
        const button = document.createElement('button');
        button.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12H8V20H16V12H20L12 4Z" fill="currentColor"/>
            </svg>
        `;
        button.className = 'back-to-top';
        button.setAttribute('aria-label', 'Back to top');
        button.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: #46B5A4;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(70, 181, 164, 0.3);
        `;
        document.body.appendChild(button);
        this.button = button;
    }

    init() {
        window.addEventListener('scroll', () => this.toggleVisibility());
        this.button.addEventListener('click', () => this.scrollToTop());
    }

    toggleVisibility() {
        if (window.pageYOffset > 300) {
            this.button.style.opacity = '1';
            this.button.style.visibility = 'visible';
        } else {
            this.button.style.opacity = '0';
            this.button.style.visibility = 'hidden';
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Breadcrumbs Navigation
class Breadcrumbs {
    constructor() {
        this.createBreadcrumbs();
    }

    createBreadcrumbs() {
        const breadcrumbContainer = document.createElement('nav');
        breadcrumbContainer.className = 'breadcrumbs';
        breadcrumbContainer.setAttribute('aria-label', 'Breadcrumb');
        breadcrumbContainer.style.cssText = `
            padding: 10px 0;
            font-size: 0.9rem;
            color: #6c757d;
        `;

        const path = window.location.pathname;
        const paths = path.split('/').filter(p => p);
        
        let breadcrumbHTML = '<ol style="list-style: none; padding: 0; margin: 0; display: flex; align-items: center;">';
        breadcrumbHTML += '<li><a href="/" style="color: #46B5A4; text-decoration: none;">Home</a></li>';
        
        let currentPath = '';
        paths.forEach((segment, index) => {
            currentPath += '/' + segment;
            const isLast = index === paths.length - 1;
            const formattedSegment = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            if (isLast) {
                breadcrumbHTML += `<li style="margin-left: 10px;"><span style="color: #6c757d;"> › </span>${formattedSegment}</li>`;
            } else {
                breadcrumbHTML += `<li style="margin-left: 10px;"><span style="color: #6c757d;"> › </span><a href="${currentPath}" style="color: #46B5A4; text-decoration: none;">${formattedSegment}</a></li>`;
            }
        });
        
        breadcrumbHTML += '</ol>';
        breadcrumbContainer.innerHTML = breadcrumbHTML;
        
        // Insert after navbar
        const navbar = document.querySelector('.navbar');
        if (navbar && paths.length > 0) {
            navbar.insertAdjacentElement('afterend', breadcrumbContainer);
        }
    }
}

// Real-time Form Validation
class FormValidator {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                // Create error message element
                const errorElement = document.createElement('span');
                errorElement.className = 'error-message';
                errorElement.style.cssText = `
                    color: #dc3545;
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                    display: block;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                `;
                input.parentNode.appendChild(errorElement);

                // Real-time validation
                input.addEventListener('blur', () => this.validateField(input, errorElement));
                input.addEventListener('input', () => {
                    if (input.classList.contains('is-invalid')) {
                        this.validateField(input, errorElement);
                    }
                });
            });

            // Form submission validation
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.validateForm(form)) {
                    this.handleFormSubmission(form);
                }
            });
        });
    }

    validateField(input, errorElement) {
        let isValid = true;
        let errorMessage = '';

        // Remove previous validation classes
        input.classList.remove('is-valid', 'is-invalid');

        // Required field validation
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Phone validation
        if (input.type === 'tel' && input.value) {
            const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
            if (!phoneRegex.test(input.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }

        // Update UI
        if (isValid) {
            input.classList.add('is-valid');
            errorElement.style.opacity = '0';
            errorElement.textContent = '';
        } else {
            input.classList.add('is-invalid');
            errorElement.style.opacity = '1';
            errorElement.textContent = errorMessage;
        }

        return isValid;
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        let isValid = true;

        inputs.forEach(input => {
            const errorElement = input.parentNode.querySelector('.error-message');
            if (!this.validateField(input, errorElement)) {
                isValid = false;
            }
        });

        return isValid;
    }

    handleFormSubmission(form) {
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            showNotification('success', 'Form submitted successfully!');
            form.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            // Remove validation classes
            form.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
                el.classList.remove('is-valid', 'is-invalid');
            });
        }, 2000);
    }
}

// Auto-save Functionality
class AutoSave {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.saveInterval = 30000; // Save every 30 seconds
        this.init();
    }

    init() {
        this.forms.forEach((form, index) => {
            const formId = form.id || `form-${index}`;
            
            // Load saved data
            this.loadFormData(form, formId);
            
            // Save on input change
            form.addEventListener('input', debounce(() => {
                this.saveFormData(form, formId);
                this.showSaveIndicator();
            }, 1000));

            // Clear saved data on successful submission
            form.addEventListener('submit', () => {
                localStorage.removeItem(`truenorth-${formId}`);
            });

            // Auto-save interval
            setInterval(() => {
                if (this.hasUnsavedChanges(form, formId)) {
                    this.saveFormData(form, formId);
                    this.showSaveIndicator();
                }
            }, this.saveInterval);
        });
    }

    saveFormData(form, formId) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        localStorage.setItem(`truenorth-${formId}`, JSON.stringify(data));
    }

    loadFormData(form, formId) {
        const savedData = localStorage.getItem(`truenorth-${formId}`);
        
        if (savedData) {
            const data = JSON.parse(savedData);
            
            Object.keys(data).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = data[key];
                }
            });
            
            showNotification('info', 'Form data restored from previous session');
        }
    }

    hasUnsavedChanges(form, formId) {
        const currentData = this.getFormData(form);
        const savedData = localStorage.getItem(`truenorth-${formId}`);
        
        return JSON.stringify(currentData) !== savedData;
    }

    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    showSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.textContent = 'Saving...';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 1000;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(indicator);
        
        // Animate in
        setTimeout(() => {
            indicator.style.opacity = '1';
            indicator.style.transform = 'translateY(0)';
        }, 10);
        
        // Change text and remove
        setTimeout(() => {
            indicator.textContent = 'Saved';
            setTimeout(() => {
                indicator.style.opacity = '0';
                indicator.style.transform = 'translateY(20px)';
                setTimeout(() => indicator.remove(), 300);
            }, 1000);
        }, 500);
    }
}

// City/State Autocomplete
class LocationAutocomplete {
    constructor() {
        this.locationInputs = document.querySelectorAll('input[name*="location"], input[name*="city"], input[name*="address"]');
        this.init();
    }

    init() {
        this.locationInputs.forEach(input => {
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            const suggestions = document.createElement('div');
            suggestions.className = 'autocomplete-suggestions';
            suggestions.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
                max-height: 200px;
                overflow-y: auto;
                display: none;
                z-index: 1000;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            `;
            wrapper.appendChild(suggestions);

            input.addEventListener('input', debounce(() => {
                this.getSuggestions(input.value, suggestions);
            }, 300));

            input.addEventListener('blur', () => {
                setTimeout(() => suggestions.style.display = 'none', 200);
            });
        });
    }

    async getSuggestions(query, suggestionsElement) {
        if (query.length < 3) {
            suggestionsElement.style.display = 'none';
            return;
        }

        // Simulated suggestions (replace with actual API)
        const cities = [
            'New York, NY',
            'Los Angeles, CA',
            'Chicago, IL',
            'Houston, TX',
            'Phoenix, AZ',
            'Philadelphia, PA',
            'San Antonio, TX',
            'San Diego, CA',
            'Dallas, TX',
            'San Jose, CA'
        ];

        const filtered = cities.filter(city => 
            city.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length > 0) {
            suggestionsElement.innerHTML = filtered.map(city => `
                <div class="suggestion-item" style="padding: 10px; cursor: pointer; hover: background: #f5f5f5;">
                    ${city}
                </div>
            `).join('');

            suggestionsElement.style.display = 'block';

            // Add click handlers
            suggestionsElement.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    const input = suggestionsElement.previousElementSibling;
                    input.value = item.textContent.trim();
                    suggestionsElement.style.display = 'none';
                });

                item.addEventListener('mouseenter', () => {
                    item.style.background = '#f5f5f5';
                });

                item.addEventListener('mouseleave', () => {
                    item.style.background = 'white';
                });
            });
        } else {
            suggestionsElement.style.display = 'none';
        }
    }
}

// Scroll Animations
class ScrollAnimations {
    constructor() {
        this.animatedElements = document.querySelectorAll('.service-card, .provider-card, .mission-card, section > .container > *');
        this.init();
    }

    init() {
        // Add initial styles
        this.animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });

        // Create intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.animatedElements.forEach(el => observer.observe(el));
    }
}

// Skeleton Loaders
class SkeletonLoader {
    static show(container) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-loader';
        skeleton.innerHTML = `
            <div class="skeleton-card">
                <div class="skeleton-header"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-button"></div>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .skeleton-card {
                background: #fff;
                padding: 1.5rem;
                border-radius: 0.5rem;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .skeleton-header {
                height: 24px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
                border-radius: 4px;
                margin-bottom: 1rem;
            }
            .skeleton-line {
                height: 16px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
                border-radius: 4px;
                margin-bottom: 0.5rem;
            }
            .skeleton-line.short {
                width: 60%;
            }
            .skeleton-button {
                height: 40px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
                border-radius: 4px;
                margin-top: 1rem;
            }
            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `;
        
        document.head.appendChild(style);
        container.appendChild(skeleton);
        
        return skeleton;
    }

    static hide(skeleton) {
        skeleton.remove();
    }
}

// Enhanced Button Interactions
class ButtonEnhancements {
    constructor() {
        this.buttons = document.querySelectorAll('.btn');
        this.init();
    }

    init() {
        this.buttons.forEach(button => {
            // Add ripple effect
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    transform: scale(0);
                    animation: ripple-animation 0.6s ease-out;
                    left: ${x}px;
                    top: ${y}px;
                    pointer-events: none;
                `;
                
                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });

            // Add hover scale effect
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
            });
        });

        // Add ripple animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Keyboard Navigation
class KeyboardNavigation {
    constructor() {
        this.init();
    }

    init() {
        // Skip links
        document.addEventListener('keydown', (e) => {
            // Alt + 1: Go to main content
            if (e.altKey && e.key === '1') {
                e.preventDefault();
                document.getElementById('main-content')?.focus();
            }

            // Alt + 2: Go to navigation
            if (e.altKey && e.key === '2') {
                e.preventDefault();
                document.querySelector('.nav-menu a')?.focus();
            }

            // Alt + 3: Go to search
            if (e.altKey && e.key === '3') {
                e.preventDefault();
                document.getElementById('location-search')?.focus();
            }

            // Escape: Close modals
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });

        // Improve focus indicators
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 2px solid #46B5A4;
                outline-offset: 2px;
            }
            
            .btn:focus {
                box-shadow: 0 0 0 3px rgba(70, 181, 164, 0.25);
            }
            
            input:focus, select:focus, textarea:focus {
                border-color: #46B5A4;
                box-shadow: 0 0 0 3px rgba(70, 181, 164, 0.25);
            }
        `;
        document.head.appendChild(style);
    }

    closeModals() {
        // Close any open modals or dropdowns
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
        });
    }
}

// ARIA Live Regions
class ARIALiveRegions {
    constructor() {
        this.createLiveRegions();
    }

    createLiveRegions() {
        // Create polite live region for general updates
        const politeRegion = document.createElement('div');
        politeRegion.setAttribute('aria-live', 'polite');
        politeRegion.setAttribute('aria-atomic', 'true');
        politeRegion.className = 'sr-only';
        politeRegion.id = 'aria-live-polite';
        document.body.appendChild(politeRegion);

        // Create assertive live region for important updates
        const assertiveRegion = document.createElement('div');
        assertiveRegion.setAttribute('aria-live', 'assertive');
        assertiveRegion.setAttribute('aria-atomic', 'true');
        assertiveRegion.className = 'sr-only';
        assertiveRegion.id = 'aria-live-assertive';
        document.body.appendChild(assertiveRegion);
    }

    static announce(message, priority = 'polite') {
        const region = document.getElementById(`aria-live-${priority}`);
        if (region) {
            region.textContent = message;
            setTimeout(() => region.textContent = '', 3000);
        }
    }
}

// High Contrast Mode
class HighContrastMode {
    constructor() {
        this.isEnabled = localStorage.getItem('highContrast') === 'true';
        this.createToggle();
        this.init();
    }

    createToggle() {
        const toggle = document.createElement('button');
        toggle.innerHTML = '◐';
        toggle.className = 'contrast-toggle';
        toggle.setAttribute('aria-label', 'Toggle high contrast mode');
        toggle.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 40px;
            height: 40px;
            background: #26547C;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(toggle);
        toggle.addEventListener('click', () => this.toggle());
    }

    init() {
        if (this.isEnabled) {
            this.enable();
        }
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        localStorage.setItem('highContrast', this.isEnabled);
        
        if (this.isEnabled) {
            this.enable();
        } else {
            this.disable();
        }
    }

    enable() {
        document.body.classList.add('high-contrast');
        
        const style = document.createElement('style');
        style.id = 'high-contrast-styles';
        style.textContent = `
            .high-contrast {
                filter: contrast(1.5);
            }
            
            .high-contrast * {
                border-color: #000 !important;
            }
            
            .high-contrast .btn-primary {
                background: #000 !important;
                color: #fff !important;
                border: 2px solid #fff !important;
            }
            
            .high-contrast a {
                color: #0066cc !important;
                text-decoration: underline !important;
            }
            
            .high-contrast input, 
            .high-contrast select, 
            .high-contrast textarea {
                border: 2px solid #000 !important;
                background: #fff !important;
                color: #000 !important;
            }
        `;
        document.head.appendChild(style);
        
        ARIALiveRegions.announce('High contrast mode enabled');
    }

    disable() {
        document.body.classList.remove('high-contrast');
        document.getElementById('high-contrast-styles')?.remove();
        ARIALiveRegions.announce('High contrast mode disabled');
    }
}

// Mobile Enhancements
class MobileEnhancements {
    constructor() {
        this.init();
    }

    init() {
        // Improve touch targets
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .btn, button, a, input, select, textarea {
                    min-height: 44px;
                    min-width: 44px;
                }
                
                .provider-card {
                    touch-action: pan-y;
                }
            }
        `;
        document.head.appendChild(style);

        // Add swipe gestures for provider cards
        this.initSwipeGestures();

        // Pull to refresh
        this.initPullToRefresh();
    }

    initSwipeGestures() {
        const cards = document.querySelectorAll('.provider-card');
        
        cards.forEach(card => {
            let startX = 0;
            let currentX = 0;
            let cardX = 0;

            card.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });

            card.addEventListener('touchmove', (e) => {
                currentX = e.touches[0].clientX;
                const diffX = currentX - startX;
                
                if (Math.abs(diffX) > 10) {
                    card.style.transform = `translateX(${diffX}px)`;
                }
            });

            card.addEventListener('touchend', (e) => {
                const diffX = currentX - startX;
                
                if (Math.abs(diffX) > 100) {
                    // Swipe action
                    card.style.transform = `translateX(${diffX > 0 ? '100%' : '-100%'})`;
                    card.style.opacity = '0';
                    
                    setTimeout(() => {
                        card.style.transform = '';
                        card.style.opacity = '';
                    }, 300);
                } else {
                    card.style.transform = '';
                }
            });
        });
    }

    initPullToRefresh() {
        let startY = 0;
        let pullDistance = 0;
        const threshold = 150;

        const pullIndicator = document.createElement('div');
        pullIndicator.className = 'pull-to-refresh';
        pullIndicator.innerHTML = '↓ Pull to refresh';
        pullIndicator.style.cssText = `
            position: fixed;
            top: -50px;
            left: 50%;
            transform: translateX(-50%);
            background: #46B5A4;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            transition: top 0.3s ease;
            z-index: 1000;
        `;
        document.body.appendChild(pullIndicator);

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (window.scrollY === 0 && startY > 0) {
                pullDistance = e.touches[0].clientY - startY;
                
                if (pullDistance > 0 && pullDistance < threshold) {
                    pullIndicator.style.top = `${Math.min(pullDistance - 50, 10)}px`;
                }
                
                if (pullDistance > threshold) {
                    pullIndicator.innerHTML = '↑ Release to refresh';
                }
            }
        });

        document.addEventListener('touchend', () => {
            if (pullDistance > threshold) {
                pullIndicator.innerHTML = 'Refreshing...';
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                pullIndicator.style.top = '-50px';
            }
            
            startY = 0;
            pullDistance = 0;
        });
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">${getNotificationIcon(type)}</div>
        <div class="notification-content">${message}</div>
        <button class="notification-close">&times;</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;

    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };

    notification.style.borderLeft = `4px solid ${colors[type]}`;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto close
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || 'ℹ';
}

// Initialize all features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StickyNavigation();
    new BackToTop();
    new Breadcrumbs();
    new FormValidator();
    new AutoSave();
    new LocationAutocomplete();
    new ScrollAnimations();
    new ButtonEnhancements();
    new KeyboardNavigation();
    new ARIALiveRegions();
    new HighContrastMode();
    new MobileEnhancements();

    // Initialize lazy loading for images
    if ('IntersectionObserver' in window) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
});
