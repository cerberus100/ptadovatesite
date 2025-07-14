<?php
/**
 * Plugin Name: HH Body Map
 * Description: Interactive SVG body map for wound location selection
 * Version: 1.0.0
 * Author: Helping Hands Team
 * License: GPL v2 or later
 * Text Domain: hh-bodymap
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('HH_BODYMAP_VERSION', '1.0.0');
define('HH_BODYMAP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('HH_BODYMAP_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main plugin class
 */
class HH_BodyMap {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        add_shortcode('hh_bodymap', array($this, 'bodymap_shortcode'));
        add_action('wp_footer', array($this, 'add_inline_script'));
        
        // AJAX handlers
        add_action('wp_ajax_hh_bodymap_save_selection', array($this, 'save_selection'));
        add_action('wp_ajax_nopriv_hh_bodymap_save_selection', array($this, 'save_selection'));
        
        // Admin hooks
        add_action('admin_menu', array($this, 'admin_menu'));
        
        // Gutenberg block
        add_action('init', array($this, 'register_gutenberg_block'));
    }
    
    /**
     * Initialize plugin
     */
    public function init() {
        // Load text domain
        load_plugin_textdomain('hh-bodymap', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // Register activation hook
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    /**
     * Enqueue frontend scripts and styles
     */
    public function enqueue_scripts() {
        wp_enqueue_style(
            'hh-bodymap-style',
            HH_BODYMAP_PLUGIN_URL . 'assets/bodymap.css',
            array(),
            HH_BODYMAP_VERSION
        );
        
        wp_enqueue_script(
            'hh-bodymap-script',
            HH_BODYMAP_PLUGIN_URL . 'assets/bodymap.js',
            array('jquery'),
            HH_BODYMAP_VERSION,
            true
        );
        
        // Localize script for AJAX
        wp_localize_script('hh-bodymap-script', 'hh_bodymap_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('hh_bodymap_nonce'),
            'strings' => array(
                'select_location' => __('Select wound location', 'hh-bodymap'),
                'location_selected' => __('Location selected', 'hh-bodymap'),
                'multiple_locations' => __('Multiple locations selected', 'hh-bodymap'),
                'clear_selection' => __('Clear selection', 'hh-bodymap'),
            )
        ));
    }
    
    /**
     * Enqueue admin scripts
     */
    public function admin_enqueue_scripts($hook) {
        if ($hook === 'toplevel_page_hh-bodymap') {
            wp_enqueue_style(
                'hh-bodymap-admin-style',
                HH_BODYMAP_PLUGIN_URL . 'assets/admin.css',
                array(),
                HH_BODYMAP_VERSION
            );
        }
    }
    
    /**
     * Body map shortcode
     */
    public function bodymap_shortcode($atts) {
        $atts = shortcode_atts(array(
            'mode' => 'intake',
            'selected' => '',
            'width' => '300',
            'height' => 'auto',
            'show_labels' => 'true',
            'multiple' => 'true',
            'form_field' => 'wound_location',
            'class' => ''
        ), $atts, 'hh_bodymap');
        
        $selected_regions = !empty($atts['selected']) ? explode(',', $atts['selected']) : array();
        $unique_id = 'hh-bodymap-' . uniqid();
        
        ob_start();
        ?>
        <div class="hh-bodymap-container <?php echo esc_attr($atts['class']); ?>" 
             id="<?php echo esc_attr($unique_id); ?>"
             data-mode="<?php echo esc_attr($atts['mode']); ?>"
             data-selected="<?php echo esc_attr($atts['selected']); ?>"
             data-multiple="<?php echo esc_attr($atts['multiple']); ?>"
             data-form-field="<?php echo esc_attr($atts['form_field']); ?>">
            
            <?php if ($atts['show_labels'] === 'true'): ?>
                <div class="hh-bodymap-header">
                    <h3><?php _e('Select wound location:', 'hh-bodymap'); ?></h3>
                    <p class="hh-bodymap-instruction"><?php _e('Click on the body area where the wound is located', 'hh-bodymap'); ?></p>
                </div>
            <?php endif; ?>
            
            <div class="hh-bodymap-svg-container" style="width: <?php echo esc_attr($atts['width']); ?>px; height: <?php echo esc_attr($atts['height']); ?>;">
                <?php echo $this->get_body_svg($selected_regions); ?>
            </div>
            
            <div class="hh-bodymap-selection-info">
                <div class="hh-bodymap-selected-regions">
                    <strong><?php _e('Selected:', 'hh-bodymap'); ?></strong>
                    <span class="hh-bodymap-selected-list">
                        <?php echo !empty($selected_regions) ? implode(', ', array_map(array($this, 'get_region_label'), $selected_regions)) : __('None', 'hh-bodymap'); ?>
                    </span>
                </div>
                
                <div class="hh-bodymap-actions">
                    <button type="button" class="hh-bodymap-clear-btn" style="display: <?php echo !empty($selected_regions) ? 'inline-block' : 'none'; ?>;">
                        <?php _e('Clear Selection', 'hh-bodymap'); ?>
                    </button>
                </div>
            </div>
            
            <!-- Hidden input for form integration -->
            <input type="hidden" 
                   name="<?php echo esc_attr($atts['form_field']); ?>" 
                   id="<?php echo esc_attr($atts['form_field']); ?>" 
                   value="<?php echo esc_attr($atts['selected']); ?>" 
                   class="hh-bodymap-hidden-input">
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Get SVG body map
     */
    private function get_body_svg($selected_regions = array()) {
        $svg_file = HH_BODYMAP_PLUGIN_DIR . 'assets/bodymap.svg';
        
        if (!file_exists($svg_file)) {
            return '<p>' . __('Body map SVG not found', 'hh-bodymap') . '</p>';
        }
        
        $svg_content = file_get_contents($svg_file);
        
        // Add selected class to selected regions
        if (!empty($selected_regions)) {
            foreach ($selected_regions as $region) {
                $svg_content = str_replace(
                    'id="' . esc_attr($region) . '"',
                    'id="' . esc_attr($region) . '" class="bm-region active"',
                    $svg_content
                );
            }
        }
        
        return $svg_content;
    }
    
    /**
     * Get region label
     */
    public function get_region_label($region_id) {
        $labels = array(
            'head_neck' => __('Head & Neck', 'hh-bodymap'),
            'upper_arm_L' => __('Left Upper Arm', 'hh-bodymap'),
            'upper_arm_R' => __('Right Upper Arm', 'hh-bodymap'),
            'forearm_hand_L' => __('Left Forearm & Hand', 'hh-bodymap'),
            'forearm_hand_R' => __('Right Forearm & Hand', 'hh-bodymap'),
            'chest' => __('Chest', 'hh-bodymap'),
            'abdomen' => __('Abdomen', 'hh-bodymap'),
            'groin_hip' => __('Groin & Hip', 'hh-bodymap'),
            'upper_leg_L' => __('Left Upper Leg', 'hh-bodymap'),
            'upper_leg_R' => __('Right Upper Leg', 'hh-bodymap'),
            'lower_leg_foot_L' => __('Left Lower Leg & Foot', 'hh-bodymap'),
            'lower_leg_foot_R' => __('Right Lower Leg & Foot', 'hh-bodymap'),
            'upper_back' => __('Upper Back', 'hh-bodymap'),
            'lower_back' => __('Lower Back', 'hh-bodymap'),
        );
        
        return isset($labels[$region_id]) ? $labels[$region_id] : $region_id;
    }
    
    /**
     * AJAX handler for saving selection
     */
    public function save_selection() {
        check_ajax_referer('hh_bodymap_nonce', 'nonce');
        
        $selected_regions = isset($_POST['selected_regions']) ? sanitize_text_field($_POST['selected_regions']) : '';
        $form_field = isset($_POST['form_field']) ? sanitize_text_field($_POST['form_field']) : 'wound_location';
        
        // Custom hook for other plugins to process the selection
        do_action('hh_bodymap_selection_saved', $selected_regions, $form_field);
        
        wp_send_json_success(array(
            'message' => __('Selection saved successfully', 'hh-bodymap'),
            'selected_regions' => $selected_regions,
            'labels' => array_map(array($this, 'get_region_label'), explode(',', $selected_regions))
        ));
    }
    
    /**
     * Add admin menu
     */
    public function admin_menu() {
        add_menu_page(
            __('Body Map Settings', 'hh-bodymap'),
            __('Body Map', 'hh-bodymap'),
            'manage_options',
            'hh-bodymap',
            array($this, 'admin_page'),
            'dashicons-location-alt',
            30
        );
    }
    
    /**
     * Admin page
     */
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('Body Map Settings', 'hh-bodymap'); ?></h1>
            
            <div class="hh-bodymap-admin-content">
                <div class="hh-bodymap-preview">
                    <h2><?php _e('Preview', 'hh-bodymap'); ?></h2>
                    <?php echo do_shortcode('[hh_bodymap mode="modal" show_labels="true"]'); ?>
                </div>
                
                <div class="hh-bodymap-usage">
                    <h2><?php _e('Usage', 'hh-bodymap'); ?></h2>
                    <p><?php _e('Use the following shortcode to display the body map:', 'hh-bodymap'); ?></p>
                    <code>[hh_bodymap]</code>
                    
                    <h3><?php _e('Shortcode Parameters', 'hh-bodymap'); ?></h3>
                    <ul>
                        <li><strong>mode:</strong> "intake" or "modal" (default: "intake")</li>
                        <li><strong>selected:</strong> comma-separated list of pre-selected regions</li>
                        <li><strong>width:</strong> width in pixels (default: "300")</li>
                        <li><strong>height:</strong> height (default: "auto")</li>
                        <li><strong>show_labels:</strong> "true" or "false" (default: "true")</li>
                        <li><strong>multiple:</strong> "true" or "false" (default: "true")</li>
                        <li><strong>form_field:</strong> hidden input field name (default: "wound_location")</li>
                        <li><strong>class:</strong> additional CSS classes</li>
                    </ul>
                    
                    <h3><?php _e('Examples', 'hh-bodymap'); ?></h3>
                    <p><code>[hh_bodymap mode="intake" selected="chest,abdomen"]</code></p>
                    <p><code>[hh_bodymap mode="modal" width="400" multiple="false"]</code></p>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Register Gutenberg block
     */
    public function register_gutenberg_block() {
        if (!function_exists('register_block_type')) {
            return;
        }
        
        register_block_type('hh/bodymap', array(
            'editor_script' => 'hh-bodymap-block-editor',
            'render_callback' => array($this, 'render_block'),
            'attributes' => array(
                'mode' => array(
                    'type' => 'string',
                    'default' => 'intake'
                ),
                'selected' => array(
                    'type' => 'string',
                    'default' => ''
                ),
                'width' => array(
                    'type' => 'string',
                    'default' => '300'
                ),
                'showLabels' => array(
                    'type' => 'boolean',
                    'default' => true
                ),
                'multiple' => array(
                    'type' => 'boolean',
                    'default' => true
                ),
                'formField' => array(
                    'type' => 'string',
                    'default' => 'wound_location'
                ),
                'className' => array(
                    'type' => 'string',
                    'default' => ''
                )
            )
        ));
    }
    
    /**
     * Render Gutenberg block
     */
    public function render_block($attributes) {
        $shortcode_atts = array(
            'mode' => $attributes['mode'],
            'selected' => $attributes['selected'],
            'width' => $attributes['width'],
            'show_labels' => $attributes['showLabels'] ? 'true' : 'false',
            'multiple' => $attributes['multiple'] ? 'true' : 'false',
            'form_field' => $attributes['formField'],
            'class' => $attributes['className']
        );
        
        return $this->bodymap_shortcode($shortcode_atts);
    }
    
    /**
     * Add inline script to footer
     */
    public function add_inline_script() {
        if (!wp_script_is('hh-bodymap-script', 'enqueued')) {
            return;
        }
        
        ?>
        <script type="text/javascript">
            document.addEventListener('DOMContentLoaded', function() {
                // Initialize body map instances
                var bodymaps = document.querySelectorAll('.hh-bodymap-container');
                
                bodymaps.forEach(function(container) {
                    if (typeof HHBodyMap !== 'undefined') {
                        new HHBodyMap(container);
                    }
                });
                
                // Custom event for form integration
                document.addEventListener('hhBodyMapSelect', function(e) {
                    var formField = document.getElementById(e.detail.formField);
                    if (formField) {
                        formField.value = e.detail.selectedRegions.join(',');
                        
                        // Trigger change event for form validation
                        var changeEvent = new Event('change', { bubbles: true });
                        formField.dispatchEvent(changeEvent);
                    }
                    
                    // Custom hook for other integrations
                    if (typeof window.hhBodyMapCallback === 'function') {
                        window.hhBodyMapCallback(e.detail);
                    }
                });
            });
        </script>
        <?php
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Create plugin options
        add_option('hh_bodymap_version', HH_BODYMAP_VERSION);
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Clean up if needed
        flush_rewrite_rules();
    }
}

// Initialize plugin
new HH_BodyMap();

/**
 * Helper function to get body map
 */
function hh_get_bodymap($atts = array()) {
    $bodymap = new HH_BodyMap();
    return $bodymap->bodymap_shortcode($atts);
}

/**
 * Helper function to check if body map is available
 */
function hh_bodymap_is_available() {
    return class_exists('HH_BodyMap');
}

/**
 * Integration with Gravity Forms
 */
add_action('gform_field_input', 'hh_bodymap_gravity_forms_integration', 10, 5);

function hh_bodymap_gravity_forms_integration($input, $field, $value, $lead_id, $form_id) {
    if ($field->type == 'bodymap' || (isset($field->cssClass) && strpos($field->cssClass, 'hh-bodymap') !== false)) {
        $bodymap_atts = array(
            'mode' => 'intake',
            'selected' => $value,
            'form_field' => 'input_' . $field->id,
            'multiple' => 'true',
            'show_labels' => 'true'
        );
        
        return hh_get_bodymap($bodymap_atts) . $input;
    }
    
    return $input;
}

/**
 * Integration with ACF
 */
add_action('acf/render_field', 'hh_bodymap_acf_integration');

function hh_bodymap_acf_integration($field) {
    if ($field['type'] == 'bodymap' || (isset($field['class']) && strpos($field['class'], 'hh-bodymap') !== false)) {
        $bodymap_atts = array(
            'mode' => 'intake',
            'selected' => $field['value'],
            'form_field' => $field['name'],
            'multiple' => isset($field['multiple']) ? ($field['multiple'] ? 'true' : 'false') : 'true',
            'show_labels' => 'true'
        );
        
        echo hh_get_bodymap($bodymap_atts);
    }
} 