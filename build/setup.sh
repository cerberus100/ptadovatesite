#!/bin/bash

# Helping Hands WordPress Setup Script
# This script sets up WordPress with the HelpingHands child theme

set -e

echo "🚀 Starting Helping Hands WordPress Setup..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if WordPress is already installed
if ! wp core is-installed --allow-root; then
    echo "📦 Downloading WordPress core..."
    wp core download --version=6.6 --allow-root

    echo "⚙️ Creating wp-config.php..."
    wp config create \
        --dbname=${DB_NAME} \
        --dbuser=${DB_USER} \
        --dbpass=${DB_PASSWORD} \
        --dbhost=${DB_HOST} \
        --dbcharset=utf8mb4 \
        --allow-root

    echo "🔧 Installing WordPress..."
    wp core install \
        --url=${WP_SITE_URL} \
        --title="${WP_SITE_TITLE}" \
        --admin_user=${WP_ADMIN_USER} \
        --admin_password=${WP_ADMIN_PASSWORD} \
        --admin_email=${WP_ADMIN_EMAIL} \
        --allow-root

    echo "✅ WordPress installed successfully!"
else
    echo "ℹ️ WordPress is already installed, skipping core installation."
fi

# Install GeneratePress theme
echo "🎨 Installing GeneratePress theme..."
wp theme install generatepress --activate --allow-root

# Create HelpingHands child theme directory
echo "👶 Creating HelpingHands child theme..."
mkdir -p /var/www/html/wp-content/themes/helpinghands
mkdir -p /var/www/html/wp-content/themes/helpinghands/assets/css
mkdir -p /var/www/html/wp-content/themes/helpinghands/assets/js

# Create child theme style.css
cat > /var/www/html/wp-content/themes/helpinghands/style.css << 'EOF'
/*
Theme Name: HelpingHands
Description: Child theme of GeneratePress for Helping Hands Wound Care Advocacy
Author: Helping Hands Team
Template: generatepress
Version: 1.0.0
Text Domain: helpinghands
*/

@import url("../generatepress/style.css");

/* Import brand palette */
@import url("assets/css/palette.css");

/* Import compiled styles */
@import url("assets/css/style.min.css");

/* Base theme overrides */
body {
    font-family: var(--hh-font-family-primary);
    color: var(--hh-text-primary);
    line-height: var(--hh-line-height-normal);
}

h1, h2, h3, h4, h5, h6 {
    font-family: var(--hh-font-family-secondary);
    color: var(--hh-navy);
}

a {
    color: var(--hh-teal);
    transition: var(--hh-transition-fast);
}

a:hover {
    color: var(--hh-hover-teal);
}

/* Primary navigation */
.main-navigation a {
    color: var(--hh-navy);
}

.main-navigation a:hover {
    color: var(--hh-teal);
}

/* Buttons */
.button,
.wp-block-button__link {
    background-color: var(--hh-teal);
    color: var(--hh-white);
    border-radius: var(--hh-border-radius-md);
    transition: var(--hh-transition-fast);
}

.button:hover,
.wp-block-button__link:hover {
    background-color: var(--hh-hover-teal);
}

/* Footer */
.site-footer {
    background-color: var(--hh-navy);
    color: var(--hh-white);
}

.site-footer a {
    color: var(--hh-teal-light);
}

.site-footer a:hover {
    color: var(--hh-white);
}
EOF

# Create child theme functions.php
cat > /var/www/html/wp-content/themes/helpinghands/functions.php << 'EOF'
<?php
/**
 * HelpingHands Child Theme Functions
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
    
    // Set content width
    if (!isset($content_width)) {
        $content_width = 1200;
    }
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
}
add_action('wp_enqueue_scripts', 'helpinghands_enqueue_styles');

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
            --hh-navy: <?php echo $navy; ?>;
            --hh-teal: <?php echo $teal; ?>;
            --hh-coral: <?php echo $coral; ?>;
        }
    </style>
    <?php
}
add_action('wp_head', 'helpinghands_custom_colors');

// Add theme version to body class
function helpinghands_theme_version() {
    return '1.0.0';
}
EOF

# Copy palette.css to child theme
cp /var/www/html/wp-content/themes/helpinghands/assets/css/palette.css /var/www/html/wp-content/themes/helpinghands/assets/css/palette.css 2>/dev/null || true

# Activate child theme
echo "🎭 Activating HelpingHands child theme..."
wp theme activate helpinghands --allow-root

# Set up WordPress options
echo "⚙️ Configuring WordPress options..."
wp option update blogname "${WP_SITE_TITLE}" --allow-root
wp option update blogdescription "Professional wound care advocacy and provider network" --allow-root
wp option update start_of_week 1 --allow-root
wp option update timezone_string "America/New_York" --allow-root
wp option update date_format "F j, Y" --allow-root
wp option update time_format "g:i a" --allow-root
wp option update permalink_structure "/%postname%/" --allow-root

# Enable Redis Object Cache
echo "🔄 Enabling Redis Object Cache..."
wp plugin install redis-cache --activate --allow-root || true
wp redis enable --allow-root || true

# Create necessary pages
echo "📄 Creating necessary pages..."
wp post create --post_type=page --post_title="Home" --post_status=publish --post_content="Welcome to Helping Hands Wound Care Advocacy" --allow-root
wp post create --post_type=page --post_title="Find a Provider" --post_status=publish --post_content="Search our network of wound care professionals" --allow-root
wp post create --post_type=page --post_title="Patient Resources" --post_status=publish --post_content="Resources and support for wound care patients" --allow-root
wp post create --post_type=page --post_title="Join Our Network" --post_status=publish --post_content="Healthcare professionals can join our network" --allow-root
wp post create --post_type=page --post_title="About Us" --post_status=publish --post_content="Learn about Helping Hands Wound Care Advocacy" --allow-root
wp post create --post_type=page --post_title="Contact" --post_status=publish --post_content="Get in touch with our team" --allow-root

# Set front page
HOME_ID=$(wp post list --post_type=page --title="Home" --format=ids --allow-root)
wp option update show_on_front page --allow-root
wp option update page_on_front $HOME_ID --allow-root

# Create navigation menu
echo "🧭 Creating navigation menu..."
wp menu create "Main Menu" --allow-root
wp menu item add-post main-menu $HOME_ID --allow-root
PROVIDER_ID=$(wp post list --post_type=page --title="Find a Provider" --format=ids --allow-root)
wp menu item add-post main-menu $PROVIDER_ID --allow-root
RESOURCES_ID=$(wp post list --post_type=page --title="Patient Resources" --format=ids --allow-root)
wp menu item add-post main-menu $RESOURCES_ID --allow-root
JOIN_ID=$(wp post list --post_type=page --title="Join Our Network" --format=ids --allow-root)
wp menu item add-post main-menu $JOIN_ID --allow-root
ABOUT_ID=$(wp post list --post_type=page --title="About Us" --format=ids --allow-root)
wp menu item add-post main-menu $ABOUT_ID --allow-root
CONTACT_ID=$(wp post list --post_type=page --title="Contact" --format=ids --allow-root)
wp menu item add-post main-menu $CONTACT_ID --allow-root

# Assign menu to theme location
wp menu location assign main-menu primary --allow-root

# Set up widgets
echo "🔧 Setting up widgets..."
wp widget delete search-2 recent-posts-2 recent-comments-2 archives-2 categories-2 meta-2 --allow-root || true

# Create sample content
echo "📝 Creating sample content..."
wp post create --post_title="Understanding Diabetic Foot Ulcers" --post_content="Diabetic foot ulcers are a serious complication of diabetes that requires immediate attention..." --post_status=publish --allow-root
wp post create --post_title="Wound Care Best Practices" --post_content="Proper wound care is essential for healing and preventing infection..." --post_status=publish --allow-root
wp post create --post_title="When to See a Wound Care Specialist" --post_content="Knowing when to seek professional help can make the difference in wound healing..." --post_status=publish --allow-root

# Set up user roles
echo "👥 Setting up user roles..."
wp role create wound_care_provider "Wound Care Provider" --allow-root
wp role create patient "Patient" --allow-root

# Final cleanup
echo "🧹 Running final cleanup..."
wp cache flush --allow-root
wp rewrite flush --allow-root

# Create environment variables file
echo "📋 Creating environment variables template..."
cat > /var/www/html/.env.example << 'EOF'
# Copy this file to .env and update with your values

# Database Configuration
DB_NAME=helping_hands_wp
DB_USER=hh_user
DB_PASSWORD=hh_secure_password_2024
DB_ROOT_PASSWORD=hh_root_password_2024
DB_HOST=mariadb

# WordPress Configuration
WP_DEBUG=0
XDEBUG_MODE=off

# Admin Configuration
WP_ADMIN_USER=helping_admin
WP_ADMIN_PASSWORD=HelpingHands2024!
WP_ADMIN_EMAIL=admin@helpinghands.com

# Site Configuration
WP_SITE_URL=http://localhost
WP_SITE_TITLE=Helping Hands Wound Care Advocacy

# WordPress Salts (Generate new ones for production)
AUTH_KEY=put_your_unique_phrase_here_auth_key_helping_hands_2024
SECURE_AUTH_KEY=put_your_unique_phrase_here_secure_auth_key_helping_hands_2024
LOGGED_IN_KEY=put_your_unique_phrase_here_logged_in_key_helping_hands_2024
NONCE_KEY=put_your_unique_phrase_here_nonce_key_helping_hands_2024
AUTH_SALT=put_your_unique_phrase_here_auth_salt_helping_hands_2024
SECURE_AUTH_SALT=put_your_unique_phrase_here_secure_auth_salt_helping_hands_2024
LOGGED_IN_SALT=put_your_unique_phrase_here_logged_in_salt_helping_hands_2024
NONCE_SALT=put_your_unique_phrase_here_nonce_salt_helping_hands_2024
EOF

echo "✅ Helping Hands WordPress setup completed successfully!"
echo "🌐 You can now access your site at: ${WP_SITE_URL}"
echo "🔐 Admin login: ${WP_ADMIN_USER} / ${WP_ADMIN_PASSWORD}"
echo "📧 Admin email: ${WP_ADMIN_EMAIL}"
echo ""
echo "Next steps:"
echo "1. Install and configure required plugins"
echo "2. Set up custom post types and fields"
echo "3. Configure forms and body map"
echo "4. Set up admin dashboard"
echo ""
echo "Happy coding! 🚀" 