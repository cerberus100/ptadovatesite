// Helping Hands - Main JavaScript

// Provider data (would normally come from API)
const providers = [
    {
        id: 1,
        name: "Dr. Sarah Johnson, CDE",
        specialty: "diabetic-wound-care",
        location: "New York, NY",
        woundTypes: ["diabetic-foot", "chronic", "venous"],
        rating: 4.9,
        distance: "2.3 miles",
        phone: "(555) 123-4567",
        address: "123 Diabetic Care Center, New York, NY 10001",
        specializations: ["Diabetic Foot Ulcers", "Certified Diabetes Educator", "Wound Care Specialist"]
    },
    {
        id: 2,
        name: "Dr. Michael Chen, DPM",
        specialty: "diabetic-podiatry",
        location: "Los Angeles, CA",
        woundTypes: ["diabetic-foot", "venous", "arterial"],
        rating: 4.9,
        distance: "1.8 miles",
        phone: "(555) 234-5678",
        address: "456 Diabetic Foot Care Clinic, Los Angeles, CA 90210",
        specializations: ["Diabetic Foot Care", "Podiatric Surgery", "Limb Salvage"]
    },
    {
        id: 3,
        name: "Dr. Emily Rodriguez, MD",
        specialty: "endocrinology",
        location: "Chicago, IL",
        woundTypes: ["diabetic-foot", "chronic", "pressure"],
        rating: 4.8,
        distance: "3.1 miles",
        phone: "(555) 345-6789",
        address: "789 Diabetes & Endocrine Center, Chicago, IL 60601",
        specializations: ["Diabetes Management", "Diabetic Complications", "Endocrinology"]
    },
    {
        id: 4,
        name: "Dr. David Wilson, MD",
        specialty: "vascular-surgery",
        location: "Houston, TX",
        woundTypes: ["diabetic-foot", "arterial", "venous"],
        rating: 4.8,
        distance: "2.7 miles",
        phone: "(555) 456-7890",
        address: "321 Vascular & Diabetic Wound Center, Houston, TX 77001",
        specializations: ["Diabetic Limb Salvage", "Vascular Surgery", "Bypass Surgery"]
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

// Body map functionality using ImageMapster
function initializeBodyMap() {
    // Wait for image to load before initializing
    const bodyImage = document.getElementById('body-image');
    if (bodyImage) {
        if (bodyImage.complete) {
            setupImageMapInteractions();
        } else {
            bodyImage.onload = function() {
                setupImageMapInteractions();
            };
        }
    } else {
        // Body image element not found - skip initialization
    }
}

// Setup image map interactions using ImageMapster
function setupImageMapInteractions() {
    // Check if jQuery is available
    if (typeof $ === 'undefined') {
        // jQuery is required for ImageMapster - fall back to basic clicks
        fallbackToBasicClicks();
        return;
    }
    
    // Check if ImageMapster is available
    if (typeof $.fn.mapster === 'undefined') {
        // ImageMapster library not loaded - fall back to basic clicks
        fallbackToBasicClicks();
        return;
    }
    
    const selectedAreaInfo = document.getElementById('selected-area-info');
    let selectedRegions = [];

    // Initialize ImageMapster with better configuration
    $('#body-image').mapster({
        fillColor: 'ff6b5d',
        fillOpacity: 0.4,
        stroke: true,
        strokeColor: '00d4ff',
        strokeWidth: 3,
        staticState: false,
        mapKey: 'id', // Use the id attribute instead of data-region
        singleSelect: false,
        
        onClick: function(data) {
            const area = $(data.e.target);
            const regionId = area.attr('id');
            const regionData = area.attr('data-region');
            const regionName = formatRegionName(regionData || regionId);
            
            // Check if already selected
            const existingIndex = selectedRegions.findIndex(r => r.id === regionId);
            
            if (existingIndex > -1) {
                // Remove from selection
                selectedRegions.splice(existingIndex, 1);
                $('#body-image').mapster('deselect', regionId);
            } else {
                // Add to selection
                selectedRegions.push({
                    id: regionId,
                    name: regionName,
                    data: regionData
                });
                $('#body-image').mapster('select', regionId);
            }
            
            // Update display and form
            updateSelectedRegions(selectedRegions);
        },
        
        onMouseover: function(data) {
            const area = $(data.e.target);
            const regionName = formatRegionName(area.attr('data-region') || area.attr('id'));
            showTooltip(data.e.target, regionName);
        },
        
        onMouseout: function() {
            hideTooltip();
        }
    });
    
    // Add fallback click handlers
    setTimeout(function() {
        if (!$('#body-image').data('mapster')) {
            // ImageMapster failed to initialize, using fallback
            fallbackToBasicClicks();
        }
    }, 1000);

    // Add keyboard support
    $('.bodyParts').each(function() {
        $(this).attr('tabindex', '0');
        $(this).on('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                $(this).trigger('click');
            }
        });
    });

    function formatRegionName(regionData) {
        if (!regionData) return 'Unknown region';
        
        // Convert data-region values to proper names
        const regionMap = {
            'head': 'Head',
            'face': 'Face', 
            'neck': 'Neck',
            'chest': 'Chest',
            'abdomen': 'Abdomen',
            'pelvis': 'Pelvis',
            'right-shoulder': 'Right Shoulder',
            'left-shoulder': 'Left Shoulder',
            'right-arm': 'Right Arm',
            'left-arm': 'Left Arm',
            'right-elbow': 'Right Elbow',
            'left-elbow': 'Left Elbow',
            'right-forearm': 'Right Forearm',
            'left-forearm': 'Left Forearm',
            'right-wrist': 'Right Wrist',
            'left-wrist': 'Left Wrist',
            'right-hand': 'Right Hand',
            'left-hand': 'Left Hand',
            'left-hip': 'Left Hip',
            'right-hip': 'Right Hip',
            'left-thigh': 'Left Thigh',
            'right-thigh': 'Right Thigh',
            'left-knee': 'Left Knee',
            'right-knee': 'Right Knee',
            'right-shin': 'Right Shin',
            'left-shin': 'Left Shin',
            'left-ankle': 'Left Ankle',
            'right-ankle': 'Right Ankle',
            'right-foot': 'Right Foot',
            'left-foot': 'Left Foot'
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
        if ($('#body-image').data('mapster')) {
            $('#body-image').mapster('deselect');
        }
        selectedRegions = [];
        updateSelectedRegions([]);
    };

    window.removeRegion = function(regionId) {
        if ($('#body-image').data('mapster')) {
            $('#body-image').mapster('deselect', regionId);
        }
        selectedRegions = selectedRegions.filter(r => r.id !== regionId);
        updateSelectedRegions(selectedRegions);
    };
}

// Fallback to basic click handling if ImageMapster fails
function fallbackToBasicClicks() {
    let selectedRegions = [];
    const selectedAreaInfo = document.getElementById('selected-area-info');
    
    // Add click handlers to all area elements
    document.querySelectorAll('area.bodyParts').forEach(area => {
        area.addEventListener('click', function(e) {
            e.preventDefault();
            
            const regionId = this.id;
            const regionData = this.getAttribute('data-region');
            const regionName = formatRegionNameFallback(regionData || regionId);
            
            // Check if already selected
            const existingIndex = selectedRegions.findIndex(r => r.id === regionId);
            
            if (existingIndex > -1) {
                // Remove from selection
                selectedRegions.splice(existingIndex, 1);
                this.style.backgroundColor = '';
            } else {
                // Add to selection
                selectedRegions.push({
                    id: regionId,
                    name: regionName,
                    data: regionData
                });
                this.style.backgroundColor = 'rgba(255, 107, 93, 0.4)';
            }
            
            updateSelectedRegionsFallback(selectedRegions);
        });
        
        // Add hover effects
        area.addEventListener('mouseenter', function() {
            if (!selectedRegions.find(r => r.id === this.id)) {
                this.style.backgroundColor = 'rgba(0, 212, 255, 0.3)';
            }
        });
        
        area.addEventListener('mouseleave', function() {
            if (!selectedRegions.find(r => r.id === this.id)) {
                this.style.backgroundColor = '';
            }
        });
    });
    
    function formatRegionNameFallback(regionData) {
        if (!regionData) return 'Unknown region';
        
        const regionMap = {
            'head': 'Head',
            'face': 'Face', 
            'neck': 'Neck',
            'chest': 'Chest',
            'abdomen': 'Abdomen',
            'pelvis': 'Pelvis',
            'right-shoulder': 'Right Shoulder',
            'left-shoulder': 'Left Shoulder',
            'right-arm': 'Right Arm',
            'left-arm': 'Left Arm',
            'right-elbow': 'Right Elbow',
            'left-elbow': 'Left Elbow',
            'right-forearm': 'Right Forearm',
            'left-forearm': 'Left Forearm',
            'right-wrist': 'Right Wrist',
            'left-wrist': 'Left Wrist',
            'right-hand': 'Right Hand',
            'left-hand': 'Left Hand',
            'left-hip': 'Left Hip',
            'right-hip': 'Right Hip',
            'left-thigh': 'Left Thigh',
            'right-thigh': 'Right Thigh',
            'left-knee': 'Left Knee',
            'right-knee': 'Right Knee',
            'right-shin': 'Right Shin',
            'left-shin': 'Left Shin',
            'left-ankle': 'Left Ankle',
            'right-ankle': 'Right Ankle',
            'right-foot': 'Right Foot',
            'left-foot': 'Left Foot'
        };
        
        return regionMap[regionData] || regionData.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    function updateSelectedRegionsFallback(regions) {
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
                                <button type="button" onclick="removeRegionFallback('${region.id}')" class="remove-region" title="Remove ${region.name}">×</button>
                            </div>
                        `).join('')}
                    </div>
                    <button type="button" onclick="clearBodyMapSelectionsFallback()" class="clear-all-btn">Clear All</button>
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
    
    // Global fallback functions
    window.clearBodyMapSelectionsFallback = function() {
        selectedRegions = [];
        document.querySelectorAll('area.bodyParts').forEach(area => {
            area.style.backgroundColor = '';
        });
        updateSelectedRegionsFallback([]);
    };

    window.removeRegionFallback = function(regionId) {
        selectedRegions = selectedRegions.filter(r => r.id !== regionId);
        const area = document.getElementById(regionId);
        if (area) {
            area.style.backgroundColor = '';
        }
        updateSelectedRegionsFallback(selectedRegions);
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
            notifications.error('Please fill in all required fields.', 'Validation Error');
            return;
        }
        
        if (!data['hipaa-consent']) {
            notifications.error('Please consent to the privacy policy to continue.', 'Consent Required');
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
        notifications.success('Thank you for your request! A patient advocate will contact you within 24 hours.', 'Request Submitted');
        
        // Reset form
        document.getElementById('assistance-form').reset();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // In a real application, you would send this data to your backend
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
                notifications.error('Please fill in all required fields.', 'Validation Error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data['nominator-email'])) {
                notifications.error('Please enter a valid email address.', 'Invalid Email');
                return;
            }
            
            // Simulate nomination submission
            notifications.success(`Thank you for nominating ${data['provider-name']}! We will review this provider and contact them about joining our patient-first network.`, 'Nomination Submitted');
            
            // Reset form
            nominationForm.reset();
        });
    }
    
    // Provider application form
    if (applicationForm) {
        // Multi-step controls
        const steps = Array.from(applicationForm.querySelectorAll('.form-step'));
        const dots = Array.from(document.querySelectorAll('#app-progress .step-dot'));
        const nextBtn = document.getElementById('app-next');
        const prevBtn = document.getElementById('app-prev');
        const submitBtnEl = document.getElementById('app-submit');
        const thankyouEl = document.getElementById('application-thankyou');
        let currentStep = 0;

        function showStep(index) {
            steps.forEach((s, i) => s.style.display = i === index ? '' : 'none');
            dots.forEach((d, i) => d.style.background = i <= index ? '#46B5A4' : '#cbd5e1');
            prevBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
            nextBtn.style.display = index === steps.length - 1 ? 'none' : '';
            submitBtnEl.style.display = index === steps.length - 1 ? '' : 'none';
        }

        function validateCurrentStep() {
            const stepEl = steps[currentStep];
            const inputs = Array.from(stepEl.querySelectorAll('input, select, textarea'));
            for (const el of inputs) {
                if (el.hasAttribute('required')) {
                    if (el.type === 'radio') {
                        const group = stepEl.querySelectorAll(`input[name="${el.name}"]`);
                        const checked = Array.from(group).some(r => r.checked);
                        if (!checked) return false;
                    } else if (!el.value) {
                        return false;
                    }
                }
                if (el.id === 'applicant-email' && el.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(el.value)) return false;
                }
                if (el.id === 'npi' && el.value) {
                    if (!/^\d{10}$/.test(String(el.value).replace(/\D/g, ''))) return false;
                }
                if (el.id === 'num-woundcare-doctors' && el.value) {
                    if (Number(el.value) < 0) return false;
                }
            }
            return true;
        }

        showStep(currentStep);

        nextBtn.addEventListener('click', () => {
            if (!validateCurrentStep()) {
                notifications.error('Please complete the required fields on this step.', 'Validation Error');
                return;
            }
            currentStep = Math.min(currentStep + 1, steps.length - 1);
            showStep(currentStep);
        });

        prevBtn.addEventListener('click', () => {
            currentStep = Math.max(currentStep - 1, 0);
            showStep(currentStep);
        });

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
                notifications.error('Please fill in all required fields.', 'Validation Error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data['applicant-email'])) {
                notifications.error('Please enter a valid email address.', 'Invalid Email');
                return;
            }
            
            // New questionnaire validation
            if (!data['num-woundcare-doctors'] || Number(data['num-woundcare-doctors']) < 0) {
                notifications.error('Please provide a valid number of practicing wound care clinicians.', 'Validation Error');
                return;
            }
            if (!data['npi'] || !/^\d{10}$/.test(String(data['npi']).replace(/\D/g, ''))) {
                notifications.error('Please provide a valid 10-digit NPI number.', 'Validation Error');
                return;
            }
            if (!data['acute-wound-care'] || !data['advanced-wound-care'] || !data['mobile-services']) {
                notifications.error('Please answer the acute/advanced/mobile practice questions.', 'Validation Error');
                return;
            }

            // Check non-profit agreement
            if (!data['non-profit-agreement']) {
                notifications.error('Please confirm your commitment to patient-first care in our non-profit network.', 'Agreement Required');
                return;
            }
            // TCPA consent
            if (!data['tcpa-consent']) {
                notifications.error('Please provide consent to be contacted to verify your information (TCPA).', 'Consent Required');
                return;
            }
            
            // Simulate application submission
            notifications.success(`Thank you for your application, ${data['applicant-name']}!`, 'Application Submitted');

            // Show thank you
            applicationForm.style.display = 'none';
            thankyouEl.style.display = '';
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
        notifications.success(`Connection request sent to ${provider.name}. They will contact you within 24 hours.`, 'Connection Requested');
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
}

// Initialize analytics (placeholder)
function initializeAnalytics() {
    // Only track in production environment
    if (typeof gtag !== 'undefined' && (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
        gtag('config', 'GA_TRACKING_ID', {
            page_title: document.title,
            page_location: window.location.href
        });
    }
}

// Notification System
class NotificationManager {
    constructor() {
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            // Create container if it doesn't exist
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', title = '', duration = 5000) {
        const notification = this.createNotification(message, type, title, duration);
        this.container.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-remove
        if (duration > 0) {
            setTimeout(() => this.removeNotification(notification), duration);
        }
        
        return notification;
    }

    createNotification(message, type, title, duration) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icons[type] || icons.info}</div>
                <div class="notification-text">
                    ${title ? `<div class="notification-title">${title}</div>` : ''}
                    <div class="notification-message">${message}</div>
                </div>
                <button class="notification-close" onclick="this.closest('.notification').remove()">×</button>
            </div>
            ${duration > 0 ? '<div class="notification-progress"><div class="notification-progress-bar"></div></div>' : ''}
        `;
        
        // Progress bar animation
        if (duration > 0) {
            const progressBar = notification.querySelector('.notification-progress-bar');
            if (progressBar) {
                progressBar.style.width = '100%';
                progressBar.style.transitionDuration = `${duration}ms`;
                setTimeout(() => {
                    progressBar.style.width = '0%';
                }, 100);
            }
        }
        
        return notification;
    }

    removeNotification(notification) {
        notification.classList.add('removing');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    success(message, title = 'Success') {
        return this.show(message, 'success', title);
    }

    error(message, title = 'Error') {
        return this.show(message, 'error', title);
    }

    warning(message, title = 'Warning') {
        return this.show(message, 'warning', title);
    }

    info(message, title = 'Info') {
        return this.show(message, 'info', title);
    }
}

// Initialize notification manager
const notifications = new NotificationManager();

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