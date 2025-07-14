<?php
/**
 * FacetWP Provider Template
 * Displays provider cards with filtering capabilities
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

get_header(); ?>

<div class="provider-directory-container">
    <div class="provider-directory-header">
        <div class="container">
            <h1 class="provider-directory-title">Find a Wound Care Provider</h1>
            <p class="provider-directory-subtitle">Search our network of qualified wound care specialists</p>
        </div>
    </div>
    
    <div class="provider-filters-section">
        <div class="container">
            <div class="provider-filters-wrapper">
                <div class="filters-header">
                    <h2>Filter Providers</h2>
                    <button class="filters-reset" onclick="FWP.reset()">Clear All Filters</button>
                </div>
                
                <div class="filters-grid">
                    <div class="filter-group">
                        <label for="facet-state">State:</label>
                        <div class="facet-wrapper">
                            <?php echo facetwp_display('facet', 'provider_state'); ?>
                        </div>
                    </div>
                    
                    <div class="filter-group">
                        <label for="facet-wound-types">Wound Types:</label>
                        <div class="facet-wrapper">
                            <?php echo facetwp_display('facet', 'provider_wound_types'); ?>
                        </div>
                    </div>
                    
                    <div class="filter-group">
                        <label for="facet-telehealth">Telehealth:</label>
                        <div class="facet-wrapper">
                            <?php echo facetwp_display('facet', 'provider_telehealth'); ?>
                        </div>
                    </div>
                    
                    <div class="filter-group">
                        <label for="facet-specialty">Specialty:</label>
                        <div class="facet-wrapper">
                            <?php echo facetwp_display('facet', 'provider_specialty'); ?>
                        </div>
                    </div>
                    
                    <div class="filter-group">
                        <label for="facet-accepting-patients">Accepting New Patients:</label>
                        <div class="facet-wrapper">
                            <?php echo facetwp_display('facet', 'provider_accepting_patients'); ?>
                        </div>
                    </div>
                    
                    <div class="filter-group">
                        <label for="facet-insurance">Insurance:</label>
                        <div class="facet-wrapper">
                            <?php echo facetwp_display('facet', 'provider_insurance'); ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="provider-results-section">
        <div class="container">
            <div class="provider-results-header">
                <div class="results-count">
                    <?php echo facetwp_display('counts'); ?>
                </div>
                <div class="results-sort">
                    <?php echo facetwp_display('sort'); ?>
                </div>
            </div>
            
            <div class="provider-grid facetwp-template">
                <?php
                // Custom query for providers
                $args = array(
                    'post_type' => 'provider',
                    'posts_per_page' => 12,
                    'post_status' => 'publish',
                    'meta_query' => array(
                        array(
                            'key' => 'accepts_new_patients',
                            'value' => '1',
                            'compare' => '='
                        )
                    )
                );

                $providers_query = new WP_Query($args);
                
                if ($providers_query->have_posts()) :
                    while ($providers_query->have_posts()) : $providers_query->the_post();
                        // Get ACF fields
                        $specialty = get_field('specialty');
                        $address = get_field('address');
                        $state = get_field('state');
                        $phone = get_field('phone_number');
                        $email = get_field('email_address');
                        $website = get_field('website');
                        $telehealth = get_field('telehealth');
                        $accepts_new = get_field('accepts_new_patients');
                        $credentials = get_field('credentials');
                        $practice_name = get_field('practice_name');
                        $insurance = get_field('insurance_accepted');
                        $languages = get_field('languages_spoken');
                        $services = get_field('services_offered');
                        $wound_types = get_the_terms(get_the_ID(), 'wound_types');
                        
                        // Get featured image
                        $featured_image = get_the_post_thumbnail_url(get_the_ID(), 'provider-card');
                        $default_image = get_template_directory_uri() . '/assets/images/default-provider.svg';
                        ?>
                        
                        <div class="provider-card">
                            <div class="provider-card-header">
                                <div class="provider-image">
                                    <img src="<?php echo $featured_image ?: $default_image; ?>" 
                                         alt="<?php echo esc_attr(get_the_title()); ?>" 
                                         loading="lazy">
                                </div>
                                <div class="provider-info">
                                    <h3 class="provider-name">
                                        <?php the_title(); ?>
                                        <?php if ($credentials) : ?>
                                            <span class="provider-credentials"><?php echo esc_html($credentials); ?></span>
                                        <?php endif; ?>
                                    </h3>
                                    <?php if ($specialty) : ?>
                                        <p class="provider-specialty"><?php echo esc_html($specialty); ?></p>
                                    <?php endif; ?>
                                    <?php if ($practice_name) : ?>
                                        <p class="provider-practice"><?php echo esc_html($practice_name); ?></p>
                                    <?php endif; ?>
                                </div>
                            </div>
                            
                            <div class="provider-card-body">
                                <?php if ($address) : ?>
                                    <div class="provider-address">
                                        <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                                        <span><?php echo nl2br(esc_html($address)); ?></span>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if ($wound_types && !is_wp_error($wound_types)) : ?>
                                    <div class="provider-wound-types">
                                        <i class="fas fa-stethoscope" aria-hidden="true"></i>
                                        <span>Treats: 
                                            <?php 
                                            $wound_type_names = array();
                                            foreach ($wound_types as $wound_type) {
                                                $wound_type_names[] = $wound_type->name;
                                            }
                                            echo esc_html(implode(', ', $wound_type_names));
                                            ?>
                                        </span>
                                    </div>
                                <?php endif; ?>
                                
                                <div class="provider-badges">
                                    <?php if ($telehealth) : ?>
                                        <span class="provider-badge telehealth">
                                            <i class="fas fa-video" aria-hidden="true"></i>
                                            Telehealth Available
                                        </span>
                                    <?php endif; ?>
                                    
                                    <?php if ($accepts_new) : ?>
                                        <span class="provider-badge accepting-patients">
                                            <i class="fas fa-user-plus" aria-hidden="true"></i>
                                            Accepting New Patients
                                        </span>
                                    <?php endif; ?>
                                </div>
                                
                                <?php if ($insurance && is_array($insurance) && !empty($insurance)) : ?>
                                    <div class="provider-insurance">
                                        <i class="fas fa-credit-card" aria-hidden="true"></i>
                                        <span>Insurance: <?php echo esc_html(implode(', ', array_slice($insurance, 0, 3))); ?>
                                        <?php if (count($insurance) > 3) echo ' +' . (count($insurance) - 3) . ' more'; ?>
                                        </span>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if ($languages && is_array($languages) && !empty($languages)) : ?>
                                    <div class="provider-languages">
                                        <i class="fas fa-globe" aria-hidden="true"></i>
                                        <span>Languages: <?php echo esc_html(implode(', ', array_slice($languages, 0, 3))); ?>
                                        <?php if (count($languages) > 3) echo ' +' . (count($languages) - 3) . ' more'; ?>
                                        </span>
                                    </div>
                                <?php endif; ?>
                            </div>
                            
                            <div class="provider-card-footer">
                                <div class="provider-contact">
                                    <?php if ($phone) : ?>
                                        <a href="tel:<?php echo esc_attr(preg_replace('/[^0-9]/', '', $phone)); ?>" 
                                           class="provider-phone">
                                            <i class="fas fa-phone" aria-hidden="true"></i>
                                            <?php echo esc_html($phone); ?>
                                        </a>
                                    <?php endif; ?>
                                    
                                    <?php if ($website) : ?>
                                        <a href="<?php echo esc_url($website); ?>" 
                                           class="provider-website" 
                                           target="_blank" 
                                           rel="noopener noreferrer">
                                            <i class="fas fa-external-link-alt" aria-hidden="true"></i>
                                            Visit Website
                                        </a>
                                    <?php endif; ?>
                                </div>
                                
                                <div class="provider-actions">
                                    <a href="<?php the_permalink(); ?>" class="btn btn-primary">
                                        View Details
                                    </a>
                                    <?php if ($email) : ?>
                                        <a href="mailto:<?php echo esc_attr($email); ?>?subject=Wound Care Inquiry" 
                                           class="btn btn-outline">
                                            <i class="fas fa-envelope" aria-hidden="true"></i>
                                            Contact
                                        </a>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                        
                        <?php
                    endwhile;
                    wp_reset_postdata();
                else :
                    ?>
                    <div class="no-providers-found">
                        <div class="no-results-icon">
                            <i class="fas fa-search" aria-hidden="true"></i>
                        </div>
                        <h3>No providers found</h3>
                        <p>Try adjusting your search criteria or <button onclick="FWP.reset()">clear all filters</button> to see all providers.</p>
                    </div>
                    <?php
                endif;
                ?>
            </div>
            
            <div class="provider-pagination">
                <?php echo facetwp_display('pager'); ?>
            </div>
        </div>
    </div>
</div>

<style>
/* Provider Directory Styles */
.provider-directory-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.provider-directory-header {
    background: linear-gradient(135deg, var(--hh-navy), var(--hh-teal));
    color: var(--hh-white);
    padding: 60px 0;
    text-align: center;
    margin-bottom: 40px;
}

.provider-directory-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 15px;
    font-family: var(--hh-font-family-secondary);
}

.provider-directory-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
}

.provider-filters-section {
    background: var(--hh-bg-secondary);
    border-radius: var(--hh-border-radius-lg);
    padding: 30px;
    margin-bottom: 40px;
}

.filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
}

.filters-header h2 {
    color: var(--hh-navy);
    font-size: 1.5rem;
    margin: 0;
}

.filters-reset {
    background: var(--hh-coral);
    color: var(--hh-white);
    border: none;
    padding: 8px 16px;
    border-radius: var(--hh-border-radius-md);
    cursor: pointer;
    font-size: 0.9rem;
    transition: var(--hh-transition-fast);
}

.filters-reset:hover {
    background: var(--hh-coral-dark);
}

.filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.filter-group {
    display: flex;
    flex-direction: column;
}

.filter-group label {
    font-weight: 600;
    color: var(--hh-navy);
    margin-bottom: 8px;
    font-size: 0.9rem;
}

.facet-wrapper {
    background: var(--hh-white);
    border-radius: var(--hh-border-radius-md);
    padding: 10px;
    border: 1px solid var(--hh-border-light);
}

.provider-results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 20px;
    background: var(--hh-bg-secondary);
    border-radius: var(--hh-border-radius-md);
}

.results-count {
    font-weight: 600;
    color: var(--hh-navy);
}

.provider-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
    margin-bottom: 40px;
}

.provider-card {
    background: var(--hh-white);
    border-radius: var(--hh-border-radius-lg);
    box-shadow: 0 4px 6px var(--hh-shadow-light);
    overflow: hidden;
    transition: var(--hh-transition-normal);
    border: 1px solid var(--hh-border-light);
}

.provider-card:hover {
    box-shadow: 0 8px 25px var(--hh-shadow-medium);
    transform: translateY(-2px);
}

.provider-card-header {
    display: flex;
    align-items: center;
    padding: 20px;
    background: var(--hh-bg-secondary);
}

.provider-image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 15px;
    flex-shrink: 0;
}

.provider-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.provider-info {
    flex: 1;
}

.provider-name {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--hh-navy);
    margin-bottom: 5px;
    line-height: 1.3;
}

.provider-credentials {
    font-size: 0.9rem;
    color: var(--hh-teal);
    font-weight: 500;
    margin-left: 8px;
}

.provider-specialty {
    color: var(--hh-text-secondary);
    font-size: 0.95rem;
    margin-bottom: 3px;
}

.provider-practice {
    color: var(--hh-text-muted);
    font-size: 0.9rem;
    font-style: italic;
}

.provider-card-body {
    padding: 20px;
}

.provider-address,
.provider-wound-types,
.provider-insurance,
.provider-languages {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;
    font-size: 0.9rem;
    color: var(--hh-text-secondary);
}

.provider-address i,
.provider-wound-types i,
.provider-insurance i,
.provider-languages i {
    color: var(--hh-teal);
    margin-right: 8px;
    margin-top: 2px;
    width: 14px;
    flex-shrink: 0;
}

.provider-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 15px 0;
}

.provider-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: var(--hh-border-radius-sm);
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--hh-white);
}

.provider-badge.telehealth {
    background: var(--hh-teal);
}

.provider-badge.accepting-patients {
    background: var(--hh-success);
}

.provider-badge i {
    margin-right: 4px;
}

.provider-card-footer {
    padding: 20px;
    border-top: 1px solid var(--hh-border-light);
}

.provider-contact {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
}

.provider-phone,
.provider-website {
    color: var(--hh-teal);
    text-decoration: none;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    transition: var(--hh-transition-fast);
}

.provider-phone:hover,
.provider-website:hover {
    color: var(--hh-hover-teal);
}

.provider-phone i,
.provider-website i {
    margin-right: 5px;
}

.provider-actions {
    display: flex;
    gap: 10px;
}

.btn {
    padding: 8px 16px;
    border-radius: var(--hh-border-radius-md);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: var(--hh-transition-fast);
    border: 1px solid transparent;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.btn-primary {
    background: var(--hh-teal);
    color: var(--hh-white);
}

.btn-primary:hover {
    background: var(--hh-hover-teal);
}

.btn-outline {
    background: transparent;
    color: var(--hh-teal);
    border-color: var(--hh-teal);
}

.btn-outline:hover {
    background: var(--hh-teal);
    color: var(--hh-white);
}

.btn i {
    margin-right: 5px;
}

.no-providers-found {
    text-align: center;
    padding: 60px 20px;
    color: var(--hh-text-secondary);
}

.no-results-icon {
    font-size: 3rem;
    color: var(--hh-gray-400);
    margin-bottom: 20px;
}

.no-providers-found h3 {
    color: var(--hh-navy);
    margin-bottom: 15px;
}

.no-providers-found button {
    background: none;
    border: none;
    color: var(--hh-teal);
    cursor: pointer;
    text-decoration: underline;
}

.provider-pagination {
    display: flex;
    justify-content: center;
    padding: 20px 0;
}

/* Responsive Design */
@media (max-width: 768px) {
    .provider-directory-title {
        font-size: 2rem;
    }
    
    .provider-directory-subtitle {
        font-size: 1rem;
    }
    
    .filters-grid {
        grid-template-columns: 1fr;
    }
    
    .provider-results-header {
        flex-direction: column;
        gap: 15px;
    }
    
    .provider-grid {
        grid-template-columns: 1fr;
    }
    
    .provider-card-header {
        flex-direction: column;
        text-align: center;
    }
    
    .provider-image {
        margin-right: 0;
        margin-bottom: 15px;
    }
    
    .provider-contact {
        flex-direction: column;
        gap: 10px;
    }
    
    .provider-actions {
        flex-direction: column;
    }
}
</style>

<script>
// Initialize FacetWP
document.addEventListener('DOMContentLoaded', function() {
    // Auto-refresh on filter change
    (function($) {
        $(document).on('facetwp-loaded', function() {
            // Update URL with current filters
            if (typeof FWP !== 'undefined') {
                var query_string = FWP.build_query_string();
                if (query_string) {
                    window.history.replaceState({}, '', '?' + query_string);
                }
            }
        });
    })(jQuery);
});
</script>

<?php
get_footer();

// FacetWP Configuration (to be imported)
/*
{
    "facets": [
        {
            "name": "provider_state",
            "label": "State",
            "type": "dropdown",
            "source": "cf/state",
            "parent_term": "",
            "modifier_type": "off",
            "modifier_values": "",
            "hierarchical": "no",
            "show_ghosts": "no",
            "ghosts_text": "",
            "expand_text": "",
            "collapse_text": "",
            "soft_limit": 0,
            "search_text": "Search states...",
            "no_results_text": "No states found",
            "overflowed_text": "Show more",
            "orderby": "display_value",
            "count": 5,
            "all_values_text": "All States"
        },
        {
            "name": "provider_wound_types",
            "label": "Wound Types",
            "type": "checkboxes",
            "source": "tax/wound_types",
            "parent_term": "",
            "modifier_type": "off",
            "modifier_values": "",
            "hierarchical": "no",
            "show_ghosts": "no",
            "ghosts_text": "",
            "expand_text": "",
            "collapse_text": "",
            "soft_limit": 0,
            "search_text": "",
            "no_results_text": "",
            "overflowed_text": "Show more",
            "orderby": "display_value",
            "count": 5
        },
        {
            "name": "provider_telehealth",
            "label": "Telehealth",
            "type": "radio",
            "source": "cf/telehealth",
            "parent_term": "",
            "modifier_type": "off",
            "modifier_values": "",
            "hierarchical": "no",
            "show_ghosts": "no",
            "ghosts_text": "",
            "expand_text": "",
            "collapse_text": "",
            "soft_limit": 0,
            "search_text": "",
            "no_results_text": "",
            "overflowed_text": "Show more",
            "orderby": "display_value",
            "count": 5
        },
        {
            "name": "provider_specialty",
            "label": "Specialty",
            "type": "dropdown",
            "source": "cf/specialty",
            "parent_term": "",
            "modifier_type": "off",
            "modifier_values": "",
            "hierarchical": "no",
            "show_ghosts": "no",
            "ghosts_text": "",
            "expand_text": "",
            "collapse_text": "",
            "soft_limit": 0,
            "search_text": "Search specialties...",
            "no_results_text": "No specialties found",
            "overflowed_text": "Show more",
            "orderby": "display_value",
            "count": 5,
            "all_values_text": "All Specialties"
        },
        {
            "name": "provider_accepting_patients",
            "label": "Accepting New Patients",
            "type": "radio",
            "source": "cf/accepts_new_patients",
            "parent_term": "",
            "modifier_type": "off",
            "modifier_values": "",
            "hierarchical": "no",
            "show_ghosts": "no",
            "ghosts_text": "",
            "expand_text": "",
            "collapse_text": "",
            "soft_limit": 0,
            "search_text": "",
            "no_results_text": "",
            "overflowed_text": "Show more",
            "orderby": "display_value",
            "count": 5
        },
        {
            "name": "provider_insurance",
            "label": "Insurance",
            "type": "checkboxes",
            "source": "cf/insurance_accepted",
            "parent_term": "",
            "modifier_type": "off",
            "modifier_values": "",
            "hierarchical": "no",
            "show_ghosts": "no",
            "ghosts_text": "",
            "expand_text": "",
            "collapse_text": "",
            "soft_limit": 5,
            "search_text": "",
            "no_results_text": "",
            "overflowed_text": "Show more",
            "orderby": "display_value",
            "count": 5
        }
    ],
    "templates": [
        {
            "name": "provider_directory",
            "label": "Provider Directory",
            "query": {
                "post_type": ["provider"],
                "post_status": ["publish"],
                "orderby": "title",
                "order": "ASC",
                "posts_per_page": 12
            }
        }
    ]
}
*/ 