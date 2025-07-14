<?php
/**
 * HelpingHands Child Theme Functions
 * Custom Post Types, Taxonomies, and WordPress Customizations
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Theme setup
function helpinghands_setup() {
    // Add theme support
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));
    add_theme_support('customize-selective-refresh-widgets');
    add_theme_support('editor-styles');
    add_theme_support('wp-block-styles');
    add_theme_support('align-wide');
    add_theme_support('responsive-embeds');
    
    // Set content width
    if (!isset($content_width)) {
        $content_width = 1200;
    }
    
    // Add image sizes
    add_image_size('provider-card', 300, 200, true);
    add_image_size('provider-hero', 800, 400, true);
    add_image_size('bodymap-preview', 150, 200, true);
}
add_action('after_setup_theme', 'helpinghands_setup');

// Enqueue styles and scripts
function helpinghands_enqueue_styles() {
    // Parent theme style
    wp_enqueue_style('generatepress-style', get_template_directory_uri() . '/style.css');
    
    // Child theme style
    wp_enqueue_style('helpinghands-style', get_stylesheet_uri(), array('generatepress-style'), '1.0.0');
    
    // Palette CSS
    wp_enqueue_style('helpinghands-palette', get_stylesheet_directory_uri() . '/assets/css/palette.css', array(), '1.0.0');
    
    // Compiled styles
    wp_enqueue_style('helpinghands-compiled', get_stylesheet_directory_uri() . '/assets/css/style.min.css', array('helpinghands-palette'), '1.0.0');
    
    // Google Fonts
    wp_enqueue_style('helpinghands-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@400;700&display=swap', array(), null);
    
    // Font Awesome for icons
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', array(), '6.4.0');
}
add_action('wp_enqueue_scripts', 'helpinghands_enqueue_styles');

// Enqueue admin styles
function helpinghands_admin_styles() {
    wp_enqueue_style('helpinghands-admin', get_stylesheet_directory_uri() . '/assets/css/admin.css', array(), '1.0.0');
}
add_action('admin_enqueue_scripts', 'helpinghands_admin_styles');

/**
 * SECTION 3: CUSTOM POST TYPE AND TAXONOMY REGISTRATION
 * Register the 'provider' custom post type and 'wound_types' taxonomy
 */

// Register wound_types taxonomy
function helpinghands_register_wound_types_taxonomy() {
    $labels = array(
        'name'              => _x('Wound Types', 'taxonomy general name', 'helpinghands'),
        'singular_name'     => _x('Wound Type', 'taxonomy singular name', 'helpinghands'),
        'search_items'      => __('Search Wound Types', 'helpinghands'),
        'all_items'         => __('All Wound Types', 'helpinghands'),
        'parent_item'       => __('Parent Wound Type', 'helpinghands'),
        'parent_item_colon' => __('Parent Wound Type:', 'helpinghands'),
        'edit_item'         => __('Edit Wound Type', 'helpinghands'),
        'update_item'       => __('Update Wound Type', 'helpinghands'),
        'add_new_item'      => __('Add New Wound Type', 'helpinghands'),
        'new_item_name'     => __('New Wound Type Name', 'helpinghands'),
        'menu_name'         => __('Wound Types', 'helpinghands'),
    );

    $args = array(
        'hierarchical'      => true,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_nav_menus' => true,
        'show_tagcloud'     => true,
        'show_in_rest'      => true,
        'rest_base'         => 'wound-types',
        'rest_controller_class' => 'WP_REST_Terms_Controller',
        'public'            => true,
        'publicly_queryable' => true,
        'query_var'         => true,
        'rewrite'           => array(
            'slug' => 'wound-type',
            'with_front' => false,
            'hierarchical' => true,
        ),
        'capabilities' => array(
            'manage_terms' => 'manage_categories',
            'edit_terms'   => 'manage_categories',
            'delete_terms' => 'manage_categories',
            'assign_terms' => 'edit_posts',
        ),
        'meta_box_cb' => 'post_categories_meta_box',
    );

    register_taxonomy('wound_types', array('provider', 'post'), $args);
}

// Register provider custom post type
function helpinghands_register_provider_post_type() {
    $labels = array(
        'name'                  => _x('Providers', 'Post Type General Name', 'helpinghands'),
        'singular_name'         => _x('Provider', 'Post Type Singular Name', 'helpinghands'),
        'menu_name'             => __('Providers', 'helpinghands'),
        'name_admin_bar'        => __('Provider', 'helpinghands'),
        'archives'              => __('Provider Archives', 'helpinghands'),
        'attributes'            => __('Provider Attributes', 'helpinghands'),
        'parent_item_colon'     => __('Parent Provider:', 'helpinghands'),
        'all_items'             => __('All Providers', 'helpinghands'),
        'add_new_item'          => __('Add New Provider', 'helpinghands'),
        'add_new'               => __('Add New', 'helpinghands'),
        'new_item'              => __('New Provider', 'helpinghands'),
        'edit_item'             => __('Edit Provider', 'helpinghands'),
        'update_item'           => __('Update Provider', 'helpinghands'),
        'view_item'             => __('View Provider', 'helpinghands'),
        'view_items'            => __('View Providers', 'helpinghands'),
        'search_items'          => __('Search Providers', 'helpinghands'),
        'not_found'             => __('Not found', 'helpinghands'),
        'not_found_in_trash'    => __('Not found in Trash', 'helpinghands'),
        'featured_image'        => __('Provider Photo', 'helpinghands'),
        'set_featured_image'    => __('Set provider photo', 'helpinghands'),
        'remove_featured_image' => __('Remove provider photo', 'helpinghands'),
        'use_featured_image'    => __('Use as provider photo', 'helpinghands'),
        'insert_into_item'      => __('Insert into provider', 'helpinghands'),
        'uploaded_to_this_item' => __('Uploaded to this provider', 'helpinghands'),
        'items_list'            => __('Providers list', 'helpinghands'),
        'items_list_navigation' => __('Providers list navigation', 'helpinghands'),
        'filter_items_list'     => __('Filter providers list', 'helpinghands'),
    );

    $args = array(
        'label'                 => __('Provider', 'helpinghands'),
        'description'           => __('Wound care healthcare providers', 'helpinghands'),
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'revisions', 'page-attributes'),
        'taxonomies'            => array('wound_types'),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 20,
        'menu_icon'             => 'dashicons-groups',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'show_in_rest'          => true,
        'rest_base'             => 'providers',
        'rest_controller_class' => 'WP_REST_Posts_Controller',
        'rewrite'               => array(
            'slug' => 'providers',
            'with_front' => false,
            'feeds' => true,
            'pages' => true,
        ),
        'capability_type'       => 'post',
        'capabilities'          => array(
            'edit_post'          => 'edit_provider',
            'read_post'          => 'read_provider',
            'delete_post'        => 'delete_provider',
            'edit_posts'         => 'edit_providers',
            'edit_others_posts'  => 'edit_others_providers',
            'publish_posts'      => 'publish_providers',
            'read_private_posts' => 'read_private_providers',
            'delete_posts'       => 'delete_providers',
            'delete_private_posts' => 'delete_private_providers',
            'delete_published_posts' => 'delete_published_providers',
            'delete_others_posts' => 'delete_others_providers',
            'edit_private_posts' => 'edit_private_providers',
            'edit_published_posts' => 'edit_published_providers',
            'create_posts'       => 'create_providers',
        ),
        'map_meta_cap'          => true,
    );

    register_post_type('provider', $args);
}

// Hook into init with priority 0
add_action('init', 'helpinghands_register_wound_types_taxonomy', 0);
add_action('init', 'helpinghands_register_provider_post_type', 0);

// Add default wound types on theme activation
function helpinghands_create_default_wound_types() {
    $wound_types = array(
        'diabetic-foot' => array(
            'name' => 'Diabetic Foot Ulcers',
            'description' => 'Wounds commonly found on the feet of diabetic patients, often requiring specialized care and monitoring.',
            'slug' => 'diabetic-foot'
        ),
        'venous-leg' => array(
            'name' => 'Venous Leg Ulcers',
            'description' => 'Chronic wounds typically found on the lower legs, caused by poor venous circulation.',
            'slug' => 'venous-leg'
        ),
        'pressure' => array(
            'name' => 'Pressure Ulcers',
            'description' => 'Wounds caused by prolonged pressure on the skin, also known as bedsores or decubitus ulcers.',
            'slug' => 'pressure'
        ),
        'arterial' => array(
            'name' => 'Arterial Ulcers',
            'description' => 'Wounds caused by poor arterial blood flow, typically found on the feet and ankles.',
            'slug' => 'arterial'
        ),
        'surgical' => array(
            'name' => 'Surgical Wounds',
            'description' => 'Post-operative wounds requiring specialized care and monitoring.',
            'slug' => 'surgical'
        ),
        'traumatic' => array(
            'name' => 'Traumatic Wounds',
            'description' => 'Wounds caused by injury or trauma requiring immediate and ongoing care.',
            'slug' => 'traumatic'
        )
    );

    foreach ($wound_types as $term_data) {
        if (!term_exists($term_data['slug'], 'wound_types')) {
            wp_insert_term(
                $term_data['name'],
                'wound_types',
                array(
                    'description' => $term_data['description'],
                    'slug' => $term_data['slug']
                )
            );
        }
    }
}
add_action('after_switch_theme', 'helpinghands_create_default_wound_types');

// Add custom capabilities to administrator role
function helpinghands_add_provider_capabilities() {
    $role = get_role('administrator');
    if ($role) {
        $role->add_cap('edit_provider');
        $role->add_cap('read_provider');
        $role->add_cap('delete_provider');
        $role->add_cap('edit_providers');
        $role->add_cap('edit_others_providers');
        $role->add_cap('publish_providers');
        $role->add_cap('read_private_providers');
        $role->add_cap('delete_providers');
        $role->add_cap('delete_private_providers');
        $role->add_cap('delete_published_providers');
        $role->add_cap('delete_others_providers');
        $role->add_cap('edit_private_providers');
        $role->add_cap('edit_published_providers');
        $role->add_cap('create_providers');
    }
}
add_action('after_switch_theme', 'helpinghands_add_provider_capabilities');

// Add custom columns to provider admin list
function helpinghands_provider_columns($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = $columns['title'];
    $new_columns['provider_specialty'] = __('Specialty', 'helpinghands');
    $new_columns['provider_location'] = __('Location', 'helpinghands');
    $new_columns['wound_types'] = __('Wound Types', 'helpinghands');
    $new_columns['telehealth'] = __('Telehealth', 'helpinghands');
    $new_columns['date'] = $columns['date'];
    
    return $new_columns;
}
add_filter('manage_provider_posts_columns', 'helpinghands_provider_columns');

// Populate custom columns with data
function helpinghands_provider_column_data($column, $post_id) {
    switch ($column) {
        case 'provider_specialty':
            $specialty = get_post_meta($post_id, 'specialty', true);
            echo $specialty ? esc_html($specialty) : '—';
            break;
            
        case 'provider_location':
            $address = get_post_meta($post_id, 'address', true);
            $state = get_post_meta($post_id, 'state', true);
            $location = '';
            if ($address) {
                $location .= esc_html($address);
            }
            if ($state) {
                $location .= ($location ? ', ' : '') . esc_html($state);
            }
            echo $location ?: '—';
            break;
            
        case 'wound_types':
            $terms = get_the_terms($post_id, 'wound_types');
            if ($terms && !is_wp_error($terms)) {
                $term_names = array();
                foreach ($terms as $term) {
                    $term_names[] = $term->name;
                }
                echo esc_html(implode(', ', $term_names));
            } else {
                echo '—';
            }
            break;
            
        case 'telehealth':
            $telehealth = get_post_meta($post_id, 'telehealth', true);
            if ($telehealth) {
                echo '<span class="dashicons dashicons-yes-alt" style="color: #46b450;"></span>';
            } else {
                echo '<span class="dashicons dashicons-dismiss" style="color: #dc3232;"></span>';
            }
            break;
    }
}
add_action('manage_provider_posts_custom_column', 'helpinghands_provider_column_data', 10, 2);

// Make columns sortable
function helpinghands_provider_sortable_columns($columns) {
    $columns['provider_specialty'] = 'specialty';
    $columns['provider_location'] = 'state';
    $columns['telehealth'] = 'telehealth';
    return $columns;
}
add_filter('manage_edit-provider_sortable_columns', 'helpinghands_provider_sortable_columns');

// Handle sorting
function helpinghands_provider_column_orderby($query) {
    if (!is_admin() || !$query->is_main_query()) {
        return;
    }
    
    $orderby = $query->get('orderby');
    
    if ($orderby == 'specialty') {
        $query->set('meta_key', 'specialty');
        $query->set('orderby', 'meta_value');
    } elseif ($orderby == 'state') {
        $query->set('meta_key', 'state');
        $query->set('orderby', 'meta_value');
    } elseif ($orderby == 'telehealth') {
        $query->set('meta_key', 'telehealth');
        $query->set('orderby', 'meta_value');
    }
}
add_action('pre_get_posts', 'helpinghands_provider_column_orderby');

// Add custom filters to provider admin list
function helpinghands_provider_admin_filters() {
    global $typenow;
    
    if ($typenow == 'provider') {
        // State filter
        $states = get_posts(array(
            'post_type' => 'provider',
            'posts_per_page' => -1,
            'meta_key' => 'state',
            'meta_query' => array(
                array(
                    'key' => 'state',
                    'value' => '',
                    'compare' => '!='
                )
            )
        ));
        
        $state_options = array();
        foreach ($states as $state_post) {
            $state_value = get_post_meta($state_post->ID, 'state', true);
            if ($state_value) {
                $state_options[$state_value] = $state_value;
            }
        }
        
        if (!empty($state_options)) {
            ksort($state_options);
            echo '<select name="provider_state">';
            echo '<option value="">' . __('All States', 'helpinghands') . '</option>';
            foreach ($state_options as $value => $label) {
                $selected = (isset($_GET['provider_state']) && $_GET['provider_state'] == $value) ? ' selected="selected"' : '';
                echo '<option value="' . esc_attr($value) . '"' . $selected . '>' . esc_html($label) . '</option>';
            }
            echo '</select>';
        }
        
        // Telehealth filter
        $telehealth_value = isset($_GET['provider_telehealth']) ? $_GET['provider_telehealth'] : '';
        echo '<select name="provider_telehealth">';
        echo '<option value="">' . __('All Telehealth Options', 'helpinghands') . '</option>';
        echo '<option value="1"' . selected($telehealth_value, '1', false) . '>' . __('Telehealth Available', 'helpinghands') . '</option>';
        echo '<option value="0"' . selected($telehealth_value, '0', false) . '>' . __('In-Person Only', 'helpinghands') . '</option>';
        echo '</select>';
    }
}
add_action('restrict_manage_posts', 'helpinghands_provider_admin_filters');

// Filter provider posts by custom fields
function helpinghands_filter_providers_by_meta($query) {
    global $pagenow;
    
    if (is_admin() && $pagenow == 'edit.php' && isset($_GET['post_type']) && $_GET['post_type'] == 'provider') {
        $meta_query = array();
        
        if (isset($_GET['provider_state']) && $_GET['provider_state'] != '') {
            $meta_query[] = array(
                'key' => 'state',
                'value' => $_GET['provider_state'],
                'compare' => '='
            );
        }
        
        if (isset($_GET['provider_telehealth']) && $_GET['provider_telehealth'] != '') {
            $meta_query[] = array(
                'key' => 'telehealth',
                'value' => $_GET['provider_telehealth'],
                'compare' => '='
            );
        }
        
        if (!empty($meta_query)) {
            $query->set('meta_query', $meta_query);
        }
    }
}
add_action('pre_get_posts', 'helpinghands_filter_providers_by_meta');

// Add REST API custom fields
function helpinghands_add_provider_rest_fields() {
    // Add custom fields to provider REST API
    register_rest_field('provider', 'specialty', array(
        'get_callback' => function($object) {
            return get_post_meta($object['id'], 'specialty', true);
        },
        'update_callback' => function($value, $object) {
            return update_post_meta($object->ID, 'specialty', $value);
        },
        'schema' => array(
            'description' => __('Provider specialty', 'helpinghands'),
            'type' => 'string',
            'context' => array('view', 'edit'),
        ),
    ));
    
    register_rest_field('provider', 'address', array(
        'get_callback' => function($object) {
            return get_post_meta($object['id'], 'address', true);
        },
        'update_callback' => function($value, $object) {
            return update_post_meta($object->ID, 'address', $value);
        },
        'schema' => array(
            'description' => __('Provider address', 'helpinghands'),
            'type' => 'string',
            'context' => array('view', 'edit'),
        ),
    ));
    
    register_rest_field('provider', 'state', array(
        'get_callback' => function($object) {
            return get_post_meta($object['id'], 'state', true);
        },
        'update_callback' => function($value, $object) {
            return update_post_meta($object->ID, 'state', $value);
        },
        'schema' => array(
            'description' => __('Provider state', 'helpinghands'),
            'type' => 'string',
            'context' => array('view', 'edit'),
        ),
    ));
    
    register_rest_field('provider', 'telehealth', array(
        'get_callback' => function($object) {
            return (bool) get_post_meta($object['id'], 'telehealth', true);
        },
        'update_callback' => function($value, $object) {
            return update_post_meta($object->ID, 'telehealth', (bool) $value);
        },
        'schema' => array(
            'description' => __('Provider offers telehealth', 'helpinghands'),
            'type' => 'boolean',
            'context' => array('view', 'edit'),
        ),
    ));
    
    register_rest_field('provider', 'wound_types', array(
        'get_callback' => function($object) {
            $terms = get_the_terms($object['id'], 'wound_types');
            if ($terms && !is_wp_error($terms)) {
                return wp_list_pluck($terms, 'slug');
            }
            return array();
        },
        'update_callback' => function($value, $object) {
            return wp_set_object_terms($object->ID, $value, 'wound_types');
        },
        'schema' => array(
            'description' => __('Provider wound types', 'helpinghands'),
            'type' => 'array',
            'items' => array('type' => 'string'),
            'context' => array('view', 'edit'),
        ),
    ));
}
add_action('rest_api_init', 'helpinghands_add_provider_rest_fields');

// Add custom logo support
function helpinghands_custom_logo_setup() {
    $defaults = array(
        'height'      => 60,
        'width'       => 200,
        'flex-height' => true,
        'flex-width'  => true,
        'header-text' => array('site-title', 'site-description'),
    );
    add_theme_support('custom-logo', $defaults);
}
add_action('after_setup_theme', 'helpinghands_custom_logo_setup');

// Customize excerpt length
function helpinghands_excerpt_length($length) {
    return 25;
}
add_filter('excerpt_length', 'helpinghands_excerpt_length', 999);

// Add custom excerpt more
function helpinghands_excerpt_more($more) {
    return '...';
}
add_filter('excerpt_more', 'helpinghands_excerpt_more');

// Add custom body classes
function helpinghands_body_classes($classes) {
    $classes[] = 'helpinghands-theme';
    
    if (is_post_type_archive('provider')) {
        $classes[] = 'provider-archive';
    }
    
    if (is_singular('provider')) {
        $classes[] = 'single-provider';
    }
    
    if (is_tax('wound_types')) {
        $classes[] = 'wound-types-archive';
    }
    
    return $classes;
}
add_filter('body_class', 'helpinghands_body_classes');

// Add customizer options
function helpinghands_customize_register($wp_customize) {
    // Brand Colors Section
    $wp_customize->add_section('helpinghands_colors', array(
        'title' => __('Helping Hands Colors', 'helpinghands'),
        'priority' => 40,
    ));
    
    // Navy Color
    $wp_customize->add_setting('helpinghands_navy_color', array(
        'default' => '#26547C',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'helpinghands_navy_color', array(
        'label' => __('Navy Color', 'helpinghands'),
        'section' => 'helpinghands_colors',
    )));
    
    // Teal Color
    $wp_customize->add_setting('helpinghands_teal_color', array(
        'default' => '#46B5A4',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'helpinghands_teal_color', array(
        'label' => __('Teal Color', 'helpinghands'),
        'section' => 'helpinghands_colors',
    )));
    
    // Coral Color
    $wp_customize->add_setting('helpinghands_coral_color', array(
        'default' => '#FF6B5D',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'helpinghands_coral_color', array(
        'label' => __('Coral Color', 'helpinghands'),
        'section' => 'helpinghands_colors',
    )));
    
    // Provider Directory Section
    $wp_customize->add_section('helpinghands_provider_directory', array(
        'title' => __('Provider Directory', 'helpinghands'),
        'priority' => 50,
    ));
    
    // Providers per page
    $wp_customize->add_setting('helpinghands_providers_per_page', array(
        'default' => 12,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('helpinghands_providers_per_page', array(
        'label' => __('Providers per Page', 'helpinghands'),
        'section' => 'helpinghands_provider_directory',
        'type' => 'number',
        'input_attrs' => array(
            'min' => 1,
            'max' => 50,
        ),
    ));
    
    // Show provider search
    $wp_customize->add_setting('helpinghands_show_provider_search', array(
        'default' => true,
        'sanitize_callback' => 'wp_validate_boolean',
    ));
    $wp_customize->add_control('helpinghands_show_provider_search', array(
        'label' => __('Show Provider Search', 'helpinghands'),
        'section' => 'helpinghands_provider_directory',
        'type' => 'checkbox',
    ));
}
add_action('customize_register', 'helpinghands_customize_register');

// Output custom colors as CSS variables
function helpinghands_custom_colors() {
    $navy = get_theme_mod('helpinghands_navy_color', '#26547C');
    $teal = get_theme_mod('helpinghands_teal_color', '#46B5A4');
    $coral = get_theme_mod('helpinghands_coral_color', '#FF6B5D');
    ?>
    <style type="text/css">
        :root {
            --hh-navy: <?php echo esc_html($navy); ?>;
            --hh-teal: <?php echo esc_html($teal); ?>;
            --hh-coral: <?php echo esc_html($coral); ?>;
        }
    </style>
    <?php
}
add_action('wp_head', 'helpinghands_custom_colors');

// Add theme version
function helpinghands_theme_version() {
    return '1.0.0';
}

// Flush rewrite rules on theme activation
function helpinghands_flush_rewrite_rules() {
    helpinghands_register_wound_types_taxonomy();
    helpinghands_register_provider_post_type();
    flush_rewrite_rules();
}
add_action('after_switch_theme', 'helpinghands_flush_rewrite_rules');

// Provider archive query modifications
function helpinghands_provider_archive_query($query) {
    if (!is_admin() && $query->is_main_query()) {
        if (is_post_type_archive('provider')) {
            $providers_per_page = get_theme_mod('helpinghands_providers_per_page', 12);
            $query->set('posts_per_page', $providers_per_page);
            $query->set('meta_key', 'specialty');
            $query->set('orderby', 'meta_value title');
            $query->set('order', 'ASC');
        }
    }
}
add_action('pre_get_posts', 'helpinghands_provider_archive_query');

// Add admin notice for ACF fields
function helpinghands_acf_admin_notice() {
    if (current_user_can('manage_options') && !function_exists('get_field')) {
        echo '<div class="notice notice-warning"><p>';
        echo '<strong>Helping Hands:</strong> Please install and activate Advanced Custom Fields PRO to manage provider details.';
        echo '</p></div>';
    }
}
add_action('admin_notices', 'helpinghands_acf_admin_notice'); 