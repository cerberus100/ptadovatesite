// Helping Hands - Main JavaScript

// Provider data (would normally come from API)
const providers = [
    {
        id: 1,
        name: "Dr. Sarah Johnson",
        specialty: "wound-care",
        location: "New York, NY",
        woundTypes: ["chronic", "diabetic", "pressure"],
        rating: 4.8,
        distance: "2.3 miles",
        phone: "(555) 123-4567",
        address: "123 Medical Center Dr, New York, NY 10001"
    },
    {
        id: 2,
        name: "Dr. Michael Chen",
        specialty: "vascular",
        location: "Los Angeles, CA",
        woundTypes: ["venous", "arterial"],
        rating: 4.9,
        distance: "1.8 miles",
        phone: "(555) 234-5678",
        address: "456 Health Plaza, Los Angeles, CA 90210"
    },
    {
        id: 3,
        name: "Dr. Emily Rodriguez",
        specialty: "dermatology",
        location: "Chicago, IL",
        woundTypes: ["chronic", "surgical"],
        rating: 4.7,
        distance: "3.1 miles",
        phone: "(555) 345-6789",
        address: "789 Wellness Ave, Chicago, IL 60601"
    },
    {
        id: 4,
        name: "Dr. David Wilson",
        specialty: "plastic",
        location: "Houston, TX",
        woundTypes: ["surgical", "chronic"],
        rating: 4.8,
        distance: "2.7 miles",
        phone: "(555) 456-7890",
        address: "321 Surgery Center, Houston, TX 77001"
    },
    {
        id: 5,
        name: "Dr. Lisa Thompson",
        specialty: "podiatry",
        location: "Phoenix, AZ",
        woundTypes: ["diabetic", "pressure"],
        rating: 4.6,
        distance: "1.5 miles",
        phone: "(555) 567-8901",
        address: "654 Foot Care Clinic, Phoenix, AZ 85001"
    }
];

// Body map areas
const bodyAreas = {
    head_neck: {
        title: "Head & Neck",
        specialties: ["dermatology", "plastic", "wound-care"],
        commonConditions: ["Facial wounds", "Scalp injuries", "Neck trauma", "Post-surgical care"]
    },
    chest: {
        title: "Chest",
        specialties: ["wound-care", "plastic", "vascular"],
        commonConditions: ["Surgical wounds", "Chest trauma", "Post-surgical care", "Pressure sores"]
    },
    upper_arm_L: {
        title: "Left Upper Arm",
        specialties: ["wound-care", "vascular", "plastic"],
        commonConditions: ["Arm ulcers", "Surgical wounds", "Traumatic injuries", "Pressure sores"]
    },
    upper_arm_R: {
        title: "Right Upper Arm",
        specialties: ["wound-care", "vascular", "plastic"],
        commonConditions: ["Arm ulcers", "Surgical wounds", "Traumatic injuries", "Pressure sores"]
    },
    forearm_hand_L: {
        title: "Left Forearm & Hand",
        specialties: ["wound-care", "plastic", "vascular"],
        commonConditions: ["Hand injuries", "Forearm wounds", "Diabetic ulcers", "Traumatic injuries"]
    },
    forearm_hand_R: {
        title: "Right Forearm & Hand",
        specialties: ["wound-care", "plastic", "vascular"],
        commonConditions: ["Hand injuries", "Forearm wounds", "Diabetic ulcers", "Traumatic injuries"]
    },
    abdomen: {
        title: "Abdomen",
        specialties: ["wound-care", "plastic", "vascular"],
        commonConditions: ["Surgical wounds", "Abdominal trauma", "Post-operative care", "Pressure sores"]
    },
    groin_hip: {
        title: "Groin & Hip",
        specialties: ["wound-care", "vascular", "plastic"],
        commonConditions: ["Pressure sores", "Surgical wounds", "Hip injuries", "Groin trauma"]
    },
    upper_leg_L: {
        title: "Left Upper Leg",
        specialties: ["wound-care", "vascular", "plastic"],
        commonConditions: ["Leg ulcers", "Pressure sores", "Surgical wounds", "Traumatic injuries"]
    },
    upper_leg_R: {
        title: "Right Upper Leg",
        specialties: ["wound-care", "vascular", "plastic"],
        commonConditions: ["Leg ulcers", "Pressure sores", "Surgical wounds", "Traumatic injuries"]
    },
    lower_leg_foot_L: {
        title: "Left Lower Leg & Foot",
        specialties: ["podiatry", "vascular", "wound-care"],
        commonConditions: ["Diabetic foot ulcers", "Venous ulcers", "Arterial ulcers", "Pressure sores"]
    },
    lower_leg_foot_R: {
        title: "Right Lower Leg & Foot",
        specialties: ["podiatry", "vascular", "wound-care"],
        commonConditions: ["Diabetic foot ulcers", "Venous ulcers", "Arterial ulcers", "Pressure sores"]
    },
    upper_back: {
        title: "Upper Back",
        specialties: ["wound-care", "plastic", "vascular"],
        commonConditions: ["Pressure sores", "Surgical wounds", "Back injuries", "Post-operative care"]
    },
    lower_back: {
        title: "Lower Back",
        specialties: ["wound-care", "plastic", "vascular"],
        commonConditions: ["Pressure sores", "Surgical wounds", "Back injuries", "Spinal care"]
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeProviderSearch();
    initializeBodyMap();
    initializeFormHandling();
    initializeNetworkForms();
    initializeSmoothScrolling();
    initializeJoinNetworkForms();
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Provider search functionality
function initializeProviderSearch() {
    const searchBtn = document.getElementById('search-providers');
    const locationInput = document.getElementById('location-search');
    const specialtyFilter = document.getElementById('specialty-filter');
    const woundTypeFilter = document.getElementById('wound-type-filter');
    const resultsContainer = document.getElementById('providers-results');
    
    // Initial load of providers
    displayProviders(providers);
    
    searchBtn.addEventListener('click', function() {
        const location = locationInput.value.toLowerCase();
        const specialty = specialtyFilter.value;
        const woundType = woundTypeFilter.value;
        
        const filteredProviders = providers.filter(provider => {
            const matchesLocation = !location || provider.location.toLowerCase().includes(location);
            const matchesSpecialty = !specialty || provider.specialty === specialty;
            const matchesWoundType = !woundType || provider.woundTypes.includes(woundType);
            
            return matchesLocation && matchesSpecialty && matchesWoundType;
        });
        
        displayProviders(filteredProviders);
    });
    
    // Search on Enter key
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
}

// Display providers in the results grid
function displayProviders(providersToShow) {
    const resultsContainer = document.getElementById('providers-results');
    
    if (providersToShow.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No providers found matching your criteria. Please adjust your search.</p>';
        return;
    }
    
    resultsContainer.innerHTML = providersToShow.map(provider => `
        <div class="provider-card">
            <div class="provider-header">
                <h3>${provider.name}</h3>
                <div class="provider-rating">
                    <span class="stars">${generateStars(provider.rating)}</span>
                    <span class="rating-number">${provider.rating}</span>
                </div>
            </div>
            <div class="provider-details">
                <p class="specialty">${formatSpecialty(provider.specialty)}</p>
                <p class="location">📍 ${provider.location}</p>
                <p class="distance">🚗 ${provider.distance}</p>
                <p class="phone">📞 ${provider.phone}</p>
                <p class="address">${provider.address}</p>
            </div>
            <div class="provider-specialties">
                <strong>Wound Types:</strong>
                <div class="wound-types">
                    ${provider.woundTypes.map(type => `<span class="wound-type-tag">${formatWoundType(type)}</span>`).join('')}
                </div>
            </div>
            <div class="provider-actions">
                <button class="btn btn-primary" onclick="contactProvider(${provider.id})">Contact Provider</button>
                <button class="btn btn-secondary" onclick="requestConnection(${provider.id})">Request Connection</button>
            </div>
        </div>
    `).join('');
}

// Generate star rating display
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + (halfStar ? '☆' : '') + '☆'.repeat(emptyStars);
}

// Format specialty for display
function formatSpecialty(specialty) {
    const specialties = {
        'wound-care': 'Wound Care Specialist',
        'dermatology': 'Dermatologist',
        'vascular': 'Vascular Surgeon',
        'plastic': 'Plastic Surgeon',
        'podiatry': 'Podiatrist'
    };
    return specialties[specialty] || specialty;
}

// Format wound type for display
function formatWoundType(type) {
    const types = {
        'chronic': 'Chronic Wounds',
        'diabetic': 'Diabetic Ulcers',
        'pressure': 'Pressure Sores',
        'venous': 'Venous Ulcers',
        'arterial': 'Arterial Ulcers',
        'surgical': 'Surgical Wounds'
    };
    return types[type] || type;
}

// Body map functionality
function initializeBodyMap() {
    // SVG is now embedded directly in HTML, just setup interactions
    setupBodyMapInteractions();
}

// Setup body map interactions
function setupBodyMapInteractions() {
    const selectedAreaInfo = document.getElementById('selected-area-info');
    let selectedRegions = [];

    // Add click handlers to body regions
    document.querySelectorAll('.body-region').forEach(region => {
        region.addEventListener('click', function() {
            const regionData = this.getAttribute('data-region');
            const regionId = this.id;
            
            // Convert region data to readable name
            const regionName = formatRegionName(regionData || regionId);
            
            // Toggle selection
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                selectedRegions = selectedRegions.filter(r => r.id !== regionId);
            } else {
                this.classList.add('active');
                selectedRegions.push({
                    id: regionId,
                    name: regionName,
                    data: regionData
                });
            }
            
            // Update display and form
            updateSelectedRegions(selectedRegions);
            
            // Provide visual feedback
            if (this.classList.contains('active')) {
                showSelectionFeedback(this);
            }
        });
        
        // Enhanced hover effects
        region.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                const regionName = formatRegionName(this.getAttribute('data-region') || this.id);
                showTooltip(this, regionName);
            }
        });
        
        region.addEventListener('mouseleave', function() {
            hideTooltip();
        });
        
        // Keyboard accessibility
        region.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    function formatRegionName(regionData) {
        if (!regionData) return 'Unknown region';
        
        // Convert data-region values to proper names
        const regionMap = {
            'head': 'Head',
            'head-back': 'Back of Head',
            'neck': 'Neck',
            'neck-back': 'Back of Neck',
            'chest': 'Chest',
            'upper-back': 'Upper Back',
            'left-shoulder': 'Left Shoulder',
            'right-shoulder': 'Right Shoulder',
            'left-shoulder-back': 'Left Shoulder (Back)',
            'right-shoulder-back': 'Right Shoulder (Back)',
            'left-arm': 'Left Arm',
            'right-arm': 'Right Arm',
            'left-arm-back': 'Left Arm (Back)',
            'right-arm-back': 'Right Arm (Back)',
            'abdomen': 'Abdomen',
            'lower-back': 'Lower Back',
            'left-hand': 'Left Hand',
            'right-hand': 'Right Hand',
            'left-hand-back': 'Left Hand (Back)',
            'right-hand-back': 'Right Hand (Back)',
            'pelvis': 'Pelvis/Hip',
            'buttocks': 'Buttocks',
            'left-thigh': 'Left Thigh',
            'right-thigh': 'Right Thigh',
            'left-thigh-back': 'Left Thigh (Back)',
            'right-thigh-back': 'Right Thigh (Back)',
            'left-knee': 'Left Knee',
            'right-knee': 'Right Knee',
            'left-knee-back': 'Left Knee (Back)',
            'right-knee-back': 'Right Knee (Back)',
            'left-lower-leg': 'Left Shin',
            'right-lower-leg': 'Right Shin',
            'left-calf': 'Left Calf',
            'right-calf': 'Right Calf',
            'left-ankle': 'Left Ankle',
            'right-ankle': 'Right Ankle',
            'left-ankle-back': 'Left Ankle (Back)',
            'right-ankle-back': 'Right Ankle (Back)',
            'left-foot': 'Left Foot',
            'right-foot': 'Right Foot',
            'left-foot-back': 'Left Foot (Back)',
            'right-foot-back': 'Right Foot (Back)'
        };
        
        return regionMap[regionData] || regionData.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    function showSelectionFeedback(element) {
        // Add a subtle animation to show selection
        element.style.transform = 'scale(1.05)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }

    function showTooltip(element, text) {
        // Create or update tooltip
        let tooltip = document.getElementById('body-map-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'body-map-tooltip';
            tooltip.style.cssText = `
                position: absolute;
                background: #2c3e50;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-family: 'Segoe UI', sans-serif;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(tooltip);
        }
        
        tooltip.textContent = text;
        
        // Position tooltip near the element
        const rect = element.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
        tooltip.style.opacity = '1';
    }

    function hideTooltip() {
        const tooltip = document.getElementById('body-map-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
        }
    }

    function updateSelectedRegions(regions) {
        const selectedAreaInfo = document.getElementById('selected-area-info');
        const hiddenInput = document.getElementById('wound-location');
        
        if (regions.length > 0) {
            selectedAreaInfo.innerHTML = `
                <div class="selected-regions">
                    <h4>Selected Areas (${regions.length}):</h4>
                    <div class="selected-regions-list">
                        ${regions.map(region => `
                            <div class="selected-region-item">
                                <span class="region-name">${region.name}</span>
                                <button type="button" onclick="removeRegion('${region.id}')" class="remove-region" title="Remove ${region.name}">×</button>
                            </div>
                        `).join('')}
                    </div>
                    <button type="button" onclick="clearBodyMapSelections()" class="clear-all-btn">Clear All</button>
                </div>
            `;
            if (hiddenInput) {
                hiddenInput.value = regions.map(r => r.name).join(', ');
            }
        } else {
            selectedAreaInfo.innerHTML = `
                <div class="no-selection">
                    <p>Click on the body area where you need assistance</p>
                    <small>You can select multiple areas</small>
                </div>
            `;
            if (hiddenInput) {
                hiddenInput.value = '';
            }
        }
    }

    // Make functions globally available
    window.clearBodyMapSelections = function() {
        const regions = document.querySelectorAll('.body-region.active');
        regions.forEach(region => region.classList.remove('active'));
        selectedRegions = [];
        updateSelectedRegions([]);
    };

    window.removeRegion = function(regionId) {
        const region = document.getElementById(regionId);
        if (region) {
            region.classList.remove('active');
            selectedRegions = selectedRegions.filter(r => r.id !== regionId);
            updateSelectedRegions(selectedRegions);
        }
    };
}

// Handle body area selection
function selectBodyArea(area) {
    const areaData = bodyAreas[area];
    const infoContainer = document.getElementById('selected-area-info');
    
    if (areaData) {
        infoContainer.innerHTML = `
            <h4>${areaData.title}</h4>
            <p><strong>Recommended Specialists:</strong></p>
            <div class="specialty-tags">
                ${areaData.specialties.map(spec => `<span class="specialty-tag">${formatSpecialty(spec)}</span>`).join('')}
            </div>
            <p><strong>Common Conditions:</strong></p>
            <ul>
                ${areaData.commonConditions.map(condition => `<li>${condition}</li>`).join('')}
            </ul>
            <button class="btn btn-primary" onclick="filterProvidersByArea('${area}')">Find Specialists</button>
        `;
    }
}

// Filter providers by body area
function filterProvidersByArea(area) {
    const areaData = bodyAreas[area];
    const filteredProviders = providers.filter(provider => 
        areaData.specialties.includes(provider.specialty)
    );
    
    // Scroll to providers section
    document.getElementById('providers').scrollIntoView({ behavior: 'smooth' });
    
    // Update the specialty filter
    const specialtyFilter = document.getElementById('specialty-filter');
    specialtyFilter.value = areaData.specialties[0] || '';
    
    // Display filtered results
    displayProviders(filteredProviders);
}

// Form handling
function initializeFormHandling() {
    const form = document.getElementById('assistance-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Validate required fields
        if (!data['patient-name'] || !data['patient-email'] || !data['patient-location'] || !data['description']) {
            alert('Please fill in all required fields.');
            return;
        }
        
        if (!data['hipaa-consent']) {
            alert('Please consent to the privacy policy to continue.');
            return;
        }
        
        // Simulate form submission
        submitAssistanceRequest(data);
    });
}

// Submit assistance request
function submitAssistanceRequest(data) {
    // Show loading state
    const submitBtn = document.querySelector('#assistance-form button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        alert('Thank you for your request! A patient advocate will contact you within 24 hours.');
        
        // Reset form
        document.getElementById('assistance-form').reset();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // In a real application, you would send this data to your backend
        console.log('Form submitted:', data);
    }, 2000);
}

// Initialize network forms (nomination and application)
function initializeNetworkForms() {
    const nominationForm = document.getElementById('nomination-form');
    const applicationForm = document.getElementById('application-form');
    
    // Provider nomination form
    if (nominationForm) {
        nominationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(nominationForm);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!data['nominator-name'] || !data['nominator-email'] || !data['provider-name'] || !data['nomination-reason']) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data['nominator-email'])) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Simulate nomination submission
            alert(`Thank you for nominating ${data['provider-name']}! We will review this provider and contact them about joining our patient-first network.`);
            
            // Reset form
            nominationForm.reset();
            
            console.log('Provider nomination submitted:', data);
        });
    }
    
    // Provider application form
    if (applicationForm) {
        applicationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(applicationForm);
            const data = {};
            
            // Handle multiple values (like checkboxes)
            for (let [key, value] of formData.entries()) {
                if (data[key]) {
                    if (Array.isArray(data[key])) {
                        data[key].push(value);
                    } else {
                        data[key] = [data[key], value];
                    }
                } else {
                    data[key] = value;
                }
            }
            
            // Basic validation
            if (!data['applicant-name'] || !data['applicant-email'] || !data['applicant-phone'] || 
                !data['applicant-specialty'] || !data['patient-commitment'] || !data['insurance-acceptance']) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data['applicant-email'])) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Check non-profit agreement
            if (!data['non-profit-agreement']) {
                alert('Please confirm your commitment to patient-first care in our non-profit network.');
                return;
            }
            
            // Simulate application submission
            alert(`Thank you for your application, ${data['applicant-name']}! We will review your information and contact you within 5 business days regarding your application to join the Helping Hands network.`);
            
            // Reset form
            applicationForm.reset();
            
            console.log('Provider application submitted:', data);
        });
    }
}

// Provider action handlers
function contactProvider(providerId) {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
        window.location.href = `tel:${provider.phone}`;
    }
}

function requestConnection(providerId) {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
        alert(`Connection request sent to ${provider.name}. They will contact you within 24 hours.`);
    }
}

// Smooth scrolling for navigation links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Utility functions
function showLoading() {
    // Add loading spinner or indicator
    console.log('Loading...');
}

function hideLoading() {
    // Remove loading spinner or indicator
    console.log('Loading complete');
}

// Initialize analytics (placeholder)
function initializeAnalytics() {
    console.log('Helping Hands Patient Advocates - Static Site Loaded');
    
    // Track page views
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_TRACKING_ID', {
            page_title: document.title,
            page_location: window.location.href
        });
    }
}

// Initialize join network forms
function initializeJoinNetworkForms() {
    // Make showForm and showOptions functions available globally
    window.showForm = function(formType) {
        const optionsContainer = document.getElementById('join-options');
        const nominationContainer = document.getElementById('nomination-form-container');
        const applicationContainer = document.getElementById('application-form-container');
        
        // Hide options
        optionsContainer.style.display = 'none';
        
        // Show appropriate form
        if (formType === 'nomination') {
            nominationContainer.style.display = 'block';
            applicationContainer.style.display = 'none';
        } else if (formType === 'application') {
            applicationContainer.style.display = 'block';
            nominationContainer.style.display = 'none';
        }
    };
    
    window.showOptions = function() {
        const optionsContainer = document.getElementById('join-options');
        const nominationContainer = document.getElementById('nomination-form-container');
        const applicationContainer = document.getElementById('application-form-container');
        
        // Show options
        optionsContainer.style.display = 'block';
        
        // Hide forms
        nominationContainer.style.display = 'none';
        applicationContainer.style.display = 'none';
    };
}

// Call analytics on load
document.addEventListener('DOMContentLoaded', initializeAnalytics); 