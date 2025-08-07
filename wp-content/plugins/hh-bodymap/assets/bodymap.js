/**
 * HH Body Map Interactive JavaScript
 * Version: 1.0.0
 * Author: Helping Hands Team
 */

(function($) {
    'use strict';

    // Body Map Constructor
    window.HHBodyMap = function(container) {
        this.container = container;
        this.svg = container.querySelector('svg');
        this.regions = container.querySelectorAll('.bm-region');
        this.selectedRegions = [];
        this.isMultiple = container.dataset.multiple === 'true';
        this.formField = container.dataset.formField || 'wound_location';
        this.mode = container.dataset.mode || 'intake';
        
        // Parse pre-selected regions
        if (container.dataset.selected) {
            this.selectedRegions = container.dataset.selected.split(',').filter(Boolean);
        }
        
        this.init();
    };

    HHBodyMap.prototype = {
        init: function() {
            this.bindEvents();
            this.updateUI();
            this.setupAccessibility();
        },

        bindEvents: function() {
            var self = this;
            
            // Click handlers for regions
            this.regions.forEach(function(region) {
                region.addEventListener('click', function(e) {
                    e.preventDefault();
                    self.toggleRegion(region);
                });
                
                // Keyboard support
                region.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        self.toggleRegion(region);
                    }
                });
            });
            
            // Clear button
            var clearBtn = this.container.querySelector('.hh-bodymap-clear-btn');
            if (clearBtn) {
                clearBtn.addEventListener('click', function() {
                    self.clearAll();
                });
            }
            
            // Hover effects
            this.regions.forEach(function(region) {
                region.addEventListener('mouseenter', function() {
                    self.showTooltip(region);
                });
                
                region.addEventListener('mouseleave', function() {
                    self.hideTooltip();
                });
                
                region.addEventListener('focus', function() {
                    self.showTooltip(region);
                });
                
                region.addEventListener('blur', function() {
                    self.hideTooltip();
                });
            });
        },

        toggleRegion: function(region) {
            var regionId = region.id;
            var index = this.selectedRegions.indexOf(regionId);
            
            if (index > -1) {
                // Remove from selection
                this.selectedRegions.splice(index, 1);
                region.classList.remove('active');
                region.setAttribute('aria-pressed', 'false');
            } else {
                // Add to selection
                if (!this.isMultiple) {
                    // Single selection mode - clear others first
                    this.clearAll();
                }
                this.selectedRegions.push(regionId);
                region.classList.add('active');
                region.setAttribute('aria-pressed', 'true');
            }
            
            this.updateUI();
            this.triggerChange();
            
            // Save via AJAX if in modal mode
            if (this.mode === 'modal' && typeof hh_bodymap_ajax !== 'undefined') {
                this.saveSelection();
            }
        },

        clearAll: function() {
            this.selectedRegions = [];
            this.regions.forEach(function(region) {
                region.classList.remove('active');
                region.setAttribute('aria-pressed', 'false');
            });
            this.updateUI();
            this.triggerChange();
        },

        updateUI: function() {
            var self = this;
            var selectedList = this.container.querySelector('.hh-bodymap-selected-list');
            var clearBtn = this.container.querySelector('.hh-bodymap-clear-btn');
            var hiddenInput = this.container.querySelector('.hh-bodymap-hidden-input');
            
            // Update selected regions display
            if (selectedList) {
                if (this.selectedRegions.length > 0) {
                    var labels = this.selectedRegions.map(function(regionId) {
                        return self.getRegionLabel(regionId);
                    });
                    selectedList.textContent = labels.join(', ');
                } else {
                    selectedList.textContent = selectedList.dataset.noneText || 'None';
                }
            }
            
            // Show/hide clear button
            if (clearBtn) {
                clearBtn.style.display = this.selectedRegions.length > 0 ? 'inline-block' : 'none';
            }
            
            // Update hidden input
            if (hiddenInput) {
                hiddenInput.value = this.selectedRegions.join(',');
            }
            
            // Update active states
            this.regions.forEach(function(region) {
                if (self.selectedRegions.includes(region.id)) {
                    region.classList.add('active');
                    region.setAttribute('aria-pressed', 'true');
                } else {
                    region.classList.remove('active');
                    region.setAttribute('aria-pressed', 'false');
                }
            });
        },

        getRegionLabel: function(regionId) {
            var labels = {
                'head_neck': 'Head & Neck',
                'upper_arm_L': 'Left Upper Arm',
                'upper_arm_R': 'Right Upper Arm',
                'forearm_hand_L': 'Left Forearm & Hand',
                'forearm_hand_R': 'Right Forearm & Hand',
                'chest': 'Chest',
                'abdomen': 'Abdomen',
                'groin_hip': 'Groin & Hip',
                'upper_leg_L': 'Left Upper Leg',
                'upper_leg_R': 'Right Upper Leg',
                'lower_leg_foot_L': 'Left Lower Leg & Foot',
                'lower_leg_foot_R': 'Right Lower Leg & Foot',
                'upper_back': 'Upper Back',
                'lower_back': 'Lower Back'
            };
            
            return labels[regionId] || regionId;
        },

        showTooltip: function(region) {
            var tooltip = this.getOrCreateTooltip();
            var label = this.getRegionLabel(region.id);
            var rect = region.getBoundingClientRect();
            var containerRect = this.container.getBoundingClientRect();
            
            tooltip.textContent = label;
            tooltip.style.opacity = '0';
            tooltip.style.display = 'block';
            
            // Position tooltip
            var left = rect.left + (rect.width / 2) - containerRect.left;
            var top = rect.top - containerRect.top - tooltip.offsetHeight - 10;
            
            // Adjust if tooltip goes off screen
            if (top < 0) {
                top = rect.bottom - containerRect.top + 10;
            }
            
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
            tooltip.style.transform = 'translateX(-50%)';
            
            // Fade in
            setTimeout(function() {
                tooltip.style.opacity = '1';
            }, 10);
        },

        hideTooltip: function() {
            var tooltip = this.container.querySelector('.hh-bodymap-tooltip');
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(function() {
                    tooltip.style.display = 'none';
                }, 300);
            }
        },

        getOrCreateTooltip: function() {
            var tooltip = this.container.querySelector('.hh-bodymap-tooltip');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'hh-bodymap-tooltip';
                tooltip.style.cssText = 'position: absolute; background: #333; color: white; padding: 5px 10px; border-radius: 4px; font-size: 14px; pointer-events: none; z-index: 1000; transition: opacity 0.3s ease;';
                this.container.style.position = 'relative';
                this.container.appendChild(tooltip);
            }
            return tooltip;
        },

        triggerChange: function() {
            var event = new CustomEvent('hhBodyMapChange', {
                detail: {
                    selectedRegions: this.selectedRegions,
                    formField: this.formField,
                    container: this.container
                }
            });
            document.dispatchEvent(event);
            
            // Also trigger for form integration
            var hiddenInput = this.container.querySelector('.hh-bodymap-hidden-input');
            if (hiddenInput) {
                var changeEvent = new Event('change', { bubbles: true });
                hiddenInput.dispatchEvent(changeEvent);
            }
        },

        saveSelection: function() {
            if (typeof hh_bodymap_ajax === 'undefined') return;
            
            var self = this;
            $.ajax({
                url: hh_bodymap_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'hh_bodymap_save_selection',
                    nonce: hh_bodymap_ajax.nonce,
                    selected_regions: this.selectedRegions.join(','),
                    form_field: this.formField
                },
                success: function(response) {
                    if (response.success) {
                        console.log('Body map selection saved');
                    }
                },
                error: function() {
                    console.error('Failed to save body map selection');
                }
            });
        },

        setupAccessibility: function() {
            // Add ARIA labels
            this.svg.setAttribute('role', 'img');
            this.svg.setAttribute('aria-label', 'Interactive body diagram for selecting wound locations');
            
            // Make regions keyboard navigable
            this.regions.forEach(function(region, index) {
                region.setAttribute('role', 'button');
                region.setAttribute('tabindex', '0');
                region.setAttribute('aria-pressed', 'false');
                
                // Add descriptive title if not present
                if (!region.querySelector('title')) {
                    var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                    title.textContent = region.getAttribute('aria-label') || region.id;
                    region.appendChild(title);
                }
            });
        }
    };

    // Auto-initialize on DOM ready
    $(document).ready(function() {
        // Initialize all body map instances
        $('.hh-bodymap-container').each(function() {
            new HHBodyMap(this);
        });
        
        // Listen for dynamically added body maps
        $(document).on('hhBodyMapInit', '.hh-bodymap-container', function() {
            if (!this.hhBodyMapInstance) {
                this.hhBodyMapInstance = new HHBodyMap(this);
            }
        });
    });

})(jQuery);
