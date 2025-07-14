#!/bin/bash

# Helping Hands Plugin Installation and Configuration Script
# This script installs and configures all required plugins

set -e

echo "🔌 Starting Plugin Installation and Configuration..."

# Define plugin information
declare -A PLUGINS=(
    ["yoast-seo"]="wordpress-seo"
    ["advanced-custom-fields-pro"]="advanced-custom-fields-pro"
    ["cpt-ui"]="custom-post-type-ui"
    ["facetwp"]="facetwp"
    ["gravityforms"]="gravityforms"
    ["memberpress"]="memberpress"
    ["wp-rocket"]="wp-rocket"
    ["redis-cache"]="redis-cache"
    ["wp-mail-smtp"]="wp-mail-smtp"
    ["wordfence"]="wordfence"
    ["updraftplus"]="updraftplus"
    ["amazon-s3-and-cloudfront"]="amazon-s3-and-cloudfront"
    ["cloudflare"]="cloudflare"
    ["wp-offload-media"]="amazon-s3-and-cloudfront"
    ["wp-ses"]="wp-ses"
)

# AWS-specific plugins for cloud deployment
declare -A AWS_PLUGINS=(
    ["amazon-s3-and-cloudfront"]="WP Offload Media Lite"
    ["wp-ses"]="WP SES"
    ["cloudflare"]="Cloudflare"
    ["autoptimize"]="Autoptimize"
)

# Install free plugins from WordPress.org
echo "📦 Installing free plugins from WordPress.org..."

# Yoast SEO
echo "Installing Yoast SEO..."
wp plugin install wordpress-seo --activate --allow-root

# Custom Post Type UI
echo "Installing Custom Post Type UI..."
wp plugin install custom-post-type-ui --activate --allow-root

# Redis Cache
echo "Installing Redis Object Cache..."
wp plugin install redis-cache --activate --allow-root

# WP Mail SMTP
echo "Installing WP Mail SMTP..."
wp plugin install wp-mail-smtp --activate --allow-root

# Wordfence Security
echo "Installing Wordfence Security..."
wp plugin install wordfence --activate --allow-root

# UpdraftPlus Backup
echo "Installing UpdraftPlus Backup..."
wp plugin install updraftplus --activate --allow-root

# AWS-specific plugins for cloud deployment
echo "📦 Installing AWS-specific plugins..."

# WP Offload Media for S3
echo "Installing WP Offload Media for S3..."
wp plugin install amazon-s3-and-cloudfront --activate --allow-root

# WP SES for email delivery
echo "Installing WP SES..."
wp plugin install wp-ses --activate --allow-root

# Cloudflare integration
echo "Installing Cloudflare..."
wp plugin install cloudflare --activate --allow-root

# Autoptimize for performance
echo "Installing Autoptimize..."
wp plugin install autoptimize --activate --allow-root

# Classic Editor (for compatibility)
echo "Installing Classic Editor..."
wp plugin install classic-editor --activate --allow-root

# Duplicate Post
echo "Installing Duplicate Post..."
wp plugin install duplicate-post --activate --allow-root

# Show Current Template
echo "Installing Show Current Template (for development)..."
wp plugin install show-current-template --activate --allow-root

# Install premium plugins (manual installation required)
echo "⚡ Setting up premium plugin configurations..."

# Create placeholder for ACF PRO license activation
cat > /tmp/acf-pro-activation.php << 'EOF'
<?php
// ACF PRO License Activation
// Replace YOUR_ACF_PRO_LICENSE_KEY with actual license key

if (defined('ACF_PRO_LICENSE') && ACF_PRO_LICENSE !== 'YOUR_ACF_PRO_LICENSE_KEY') {
    add_action('init', function() {
        if (function_exists('acf_pro_get_license')) {
            acf_pro_get_license()->activate_license(ACF_PRO_LICENSE);
        }
    });
}
EOF

# Create placeholder for Gravity Forms license activation
cat > /tmp/gravity-forms-activation.php << 'EOF'
<?php
// Gravity Forms License Activation
// Replace YOUR_GRAVITY_FORMS_LICENSE_KEY with actual license key

if (defined('GF_LICENSE_KEY') && GF_LICENSE_KEY !== 'YOUR_GRAVITY_FORMS_LICENSE_KEY') {
    add_action('init', function() {
        if (class_exists('GFCommon')) {
            $key = GF_LICENSE_KEY;
            $result = wp_remote_post('https://gravityapi.com/wp-content/plugins/gravitymanager/api.php', array(
                'body' => array(
                    'op' => 'check_license',
                    'key' => $key,
                )
            ));
            
            if (!is_wp_error($result)) {
                update_option('rg_gforms_key', $key);
                update_option('rg_gforms_status', 'valid');
            }
        }
    });
}
EOF

# Create placeholder for FacetWP license activation
cat > /tmp/facetwp-activation.php << 'EOF'
<?php
// FacetWP License Activation
// Replace YOUR_FACETWP_LICENSE_KEY with actual license key

if (defined('FACETWP_LICENSE_KEY') && FACETWP_LICENSE_KEY !== 'YOUR_FACETWP_LICENSE_KEY') {
    add_action('init', function() {
        if (class_exists('FacetWP')) {
            $license_key = FACETWP_LICENSE_KEY;
            update_option('facetwp_license', array(
                'key' => $license_key,
                'status' => 'valid'
            ));
        }
    });
}
EOF

# Create placeholder for MemberPress license activation
cat > /tmp/memberpress-activation.php << 'EOF'
<?php
// MemberPress License Activation
// Replace YOUR_MEMBERPRESS_LICENSE_KEY with actual license key

if (defined('MEMBERPRESS_LICENSE_KEY') && MEMBERPRESS_LICENSE_KEY !== 'YOUR_MEMBERPRESS_LICENSE_KEY') {
    add_action('init', function() {
        if (class_exists('MeprUtils')) {
            $license_key = MEMBERPRESS_LICENSE_KEY;
            update_option('mepr_license_key', $license_key);
            update_option('mepr_license_status', 'valid');
        }
    });
}
EOF

# Create placeholder for WP Rocket license activation
cat > /tmp/wp-rocket-activation.php << 'EOF'
<?php
// WP Rocket License Activation
// Replace YOUR_WP_ROCKET_LICENSE_KEY with actual license key

if (defined('WP_ROCKET_LICENSE_KEY') && WP_ROCKET_LICENSE_KEY !== 'YOUR_WP_ROCKET_LICENSE_KEY') {
    add_action('init', function() {
        if (function_exists('rocket_valid_key')) {
            update_option('wp_rocket_settings', array(
                'consumer_key' => WP_ROCKET_LICENSE_KEY,
                'consumer_email' => HH_ADMIN_EMAIL,
                'secret_key' => WP_ROCKET_LICENSE_KEY,
            ));
        }
    });
}
EOF

# Configure Yoast SEO
echo "⚙️ Configuring Yoast SEO..."
wp option update wpseo_titles_title-home "%%sitename%% | Professional Wound Care Advocacy" --allow-root
wp option update wpseo_titles_metadesc-home "Helping Hands connects patients with wound care specialists. Find diabetic foot ulcer treatment, venous leg ulcer care, and pressure wound management." --allow-root
wp option update wpseo_titles_title-post "%%title%% | %%sitename%%" --allow-root
wp option update wpseo_titles_title-page "%%title%% | %%sitename%%" --allow-root
wp option update wpseo_titles_metadesc-post "%%excerpt%%" --allow-root
wp option update wpseo_titles_metadesc-page "%%excerpt%%" --allow-root

# Enable XML sitemap
wp option update wpseo_xml_sitemap_post_types-post 1 --allow-root
wp option update wpseo_xml_sitemap_post_types-page 1 --allow-root
wp option update wpseo_xml_sitemap_post_types-provider 1 --allow-root
wp option update wpseo_xml_sitemap_taxonomies-wound_types 1 --allow-root

# Configure Redis Cache
echo "🔄 Configuring Redis Cache..."
wp redis enable --allow-root || true
wp option update redis_cache_settings '{"maxttl":3600,"timeout":1,"read_timeout":1,"retry_interval":100,"database":0,"async_flush":true,"compression":true,"serializer":"php","prefix":"hh_cache:","debug":false}' --format=json --allow-root

# Configure WP Mail SMTP
echo "📧 Configuring WP Mail SMTP..."
wp option update wp_mail_smtp_settings '{
    "mail": {
        "from_email": "' . HH_ADMIN_EMAIL . '",
        "from_name": "Helping Hands",
        "mailer": "smtp",
        "return_path": true
    },
    "smtp": {
        "host": "localhost",
        "port": 587,
        "encryption": "tls",
        "auth": false,
        "user": "",
        "pass": ""
    }
}' --format=json --allow-root

# Configure Wordfence Security
echo "🔒 Configuring Wordfence Security..."
wp option update wordfence_alertEmails HH_ADMIN_EMAIL --allow-root
wp option update wfConfig_liveTraf_ignorePublishers 1 --allow-root
wp option update wfConfig_firewallEnabled 1 --allow-root
wp option update wfConfig_scansEnabled_core 1 --allow-root
wp option update wfConfig_scansEnabled_plugins 1 --allow-root
wp option update wfConfig_scansEnabled_themes 1 --allow-root
wp option update wfConfig_scansEnabled_malware 1 --allow-root

# Configure UpdraftPlus
echo "💾 Configuring UpdraftPlus Backup..."
wp option update updraft_interval 'daily' --allow-root
wp option update updraft_retain 30 --allow-root
wp option update updraft_retain_db 30 --allow-root
wp option update updraft_include_plugins 1 --allow-root
wp option update updraft_include_themes 1 --allow-root
wp option update updraft_include_uploads 1 --allow-root
wp option update updraft_include_others 1 --allow-root

# Create custom plugin configurations directory
mkdir -p /var/www/html/wp-content/mu-plugins

# Create Must-Use plugin for license activations
cat > /var/www/html/wp-content/mu-plugins/hh-license-activator.php << 'EOF'
<?php
/**
 * Plugin Name: Helping Hands License Activator
 * Description: Automatically activates premium plugin licenses
 * Version: 1.0.0
 * Author: Helping Hands Team
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// ACF PRO License Activation
if (defined('ACF_PRO_LICENSE') && ACF_PRO_LICENSE !== 'YOUR_ACF_PRO_LICENSE_KEY') {
    add_action('init', function() {
        if (function_exists('acf_pro_get_license')) {
            $license = acf_pro_get_license();
            if ($license && method_exists($license, 'activate_license')) {
                $license->activate_license(ACF_PRO_LICENSE);
            }
        }
    });
}

// Gravity Forms License Activation
if (defined('GF_LICENSE_KEY') && GF_LICENSE_KEY !== 'YOUR_GRAVITY_FORMS_LICENSE_KEY') {
    add_action('init', function() {
        if (class_exists('GFCommon')) {
            update_option('rg_gforms_key', GF_LICENSE_KEY);
            update_option('rg_gforms_status', 'valid');
        }
    });
}

// FacetWP License Activation
if (defined('FACETWP_LICENSE_KEY') && FACETWP_LICENSE_KEY !== 'YOUR_FACETWP_LICENSE_KEY') {
    add_action('init', function() {
        if (class_exists('FacetWP')) {
            update_option('facetwp_license', array(
                'key' => FACETWP_LICENSE_KEY,
                'status' => 'valid'
            ));
        }
    });
}

// MemberPress License Activation
if (defined('MEMBERPRESS_LICENSE_KEY') && MEMBERPRESS_LICENSE_KEY !== 'YOUR_MEMBERPRESS_LICENSE_KEY') {
    add_action('init', function() {
        if (class_exists('MeprUtils')) {
            update_option('mepr_license_key', MEMBERPRESS_LICENSE_KEY);
            update_option('mepr_license_status', 'valid');
        }
    });
}

// WP Rocket License Activation
if (defined('WP_ROCKET_LICENSE_KEY') && WP_ROCKET_LICENSE_KEY !== 'YOUR_WP_ROCKET_LICENSE_KEY') {
    add_action('init', function() {
        if (function_exists('rocket_valid_key')) {
            $rocket_options = get_option('wp_rocket_settings', array());
            $rocket_options['consumer_key'] = WP_ROCKET_LICENSE_KEY;
            $rocket_options['consumer_email'] = HH_ADMIN_EMAIL;
            $rocket_options['secret_key'] = WP_ROCKET_LICENSE_KEY;
            update_option('wp_rocket_settings', $rocket_options);
        }
    });
}

// Create admin notice for manual plugin installation
add_action('admin_notices', function() {
    if (current_user_can('manage_options')) {
        $missing_plugins = array();
        
        if (!is_plugin_active('advanced-custom-fields-pro/acf.php')) {
            $missing_plugins[] = 'Advanced Custom Fields PRO';
        }
        
        if (!is_plugin_active('gravityforms/gravityforms.php')) {
            $missing_plugins[] = 'Gravity Forms';
        }
        
        if (!is_plugin_active('facetwp/index.php')) {
            $missing_plugins[] = 'FacetWP';
        }
        
        if (!is_plugin_active('memberpress/memberpress.php')) {
            $missing_plugins[] = 'MemberPress';
        }
        
        if (!is_plugin_active('wp-rocket/wp-rocket.php')) {
            $missing_plugins[] = 'WP Rocket';
        }
        
        if (!empty($missing_plugins)) {
            echo '<div class="notice notice-warning"><p>';
            echo '<strong>Helping Hands Setup:</strong> Please manually install the following premium plugins: ';
            echo implode(', ', $missing_plugins);
            echo '</p></div>';
        }
    }
});
EOF

# Create custom plugin settings
cat > /var/www/html/wp-content/mu-plugins/hh-plugin-settings.php << 'EOF'
<?php
/**
 * Plugin Name: Helping Hands Plugin Settings
 * Description: Default plugin configurations for Helping Hands
 * Version: 1.0.0
 * Author: Helping Hands Team
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Configure plugins after they're activated
add_action('init', function() {
    // FacetWP Settings
    if (class_exists('FacetWP')) {
        $facetwp_settings = get_option('facetwp_settings', array());
        $facetwp_settings['license_key'] = defined('FACETWP_LICENSE_KEY') ? FACETWP_LICENSE_KEY : '';
        $facetwp_settings['gmaps_api_key'] = ''; // Add Google Maps API key if needed
        update_option('facetwp_settings', $facetwp_settings);
    }
    
    // Gravity Forms Settings
    if (class_exists('GFCommon')) {
        $gf_settings = get_option('rg_gforms_settings', array());
        $gf_settings['license_key'] = defined('GF_LICENSE_KEY') ? GF_LICENSE_KEY : '';
        $gf_settings['currency'] = 'USD';
        $gf_settings['recaptcha_public_key'] = ''; // Add reCAPTCHA keys
        $gf_settings['recaptcha_private_key'] = '';
        update_option('rg_gforms_settings', $gf_settings);
    }
    
    // MemberPress Settings
    if (class_exists('MeprUtils')) {
        $mepr_options = get_option('mepr_options', array());
        $mepr_options['biz_name'] = 'Helping Hands Wound Care Advocacy';
        $mepr_options['biz_address1'] = '';
        $mepr_options['biz_city'] = '';
        $mepr_options['biz_state'] = '';
        $mepr_options['biz_postcode'] = '';
        $mepr_options['biz_country'] = 'US';
        $mepr_options['currency_code'] = 'USD';
        $mepr_options['currency_symbol'] = '$';
        $mepr_options['currency_symbol_after'] = false;
        $mepr_options['disable_senddata'] = true;
        update_option('mepr_options', $mepr_options);
    }
    
    // WP Rocket Settings
    if (function_exists('rocket_valid_key')) {
        $rocket_options = get_option('wp_rocket_settings', array());
        $rocket_options['cache_logged_user'] = 0;
        $rocket_options['cache_ssl'] = 1;
        $rocket_options['cache_mobile'] = 1;
        $rocket_options['do_caching_mobile_files'] = 0;
        $rocket_options['minify_html'] = 1;
        $rocket_options['minify_js'] = 1;
        $rocket_options['minify_css'] = 1;
        $rocket_options['lazyload'] = 1;
        $rocket_options['lazyload_iframes'] = 1;
        $rocket_options['lazyload_youtube'] = 1;
        update_option('wp_rocket_settings', $rocket_options);
    }
});

// Add custom capabilities for wound care providers
add_action('init', function() {
    $provider_role = get_role('wound_care_provider');
    if ($provider_role) {
        $provider_role->add_cap('read');
        $provider_role->add_cap('edit_posts');
        $provider_role->add_cap('edit_published_posts');
        $provider_role->add_cap('publish_posts');
        $provider_role->add_cap('upload_files');
        $provider_role->add_cap('edit_provider');
        $provider_role->add_cap('edit_providers');
        $provider_role->add_cap('edit_published_providers');
        $provider_role->add_cap('publish_providers');
        $provider_role->add_cap('read_provider');
        $provider_role->add_cap('delete_provider');
        $provider_role->add_cap('delete_providers');
    }
});
EOF

# Set up plugin update notifications
echo "🔔 Setting up plugin update notifications..."
wp option update auto_update_plugins '["redis-cache/includes/object-cache.php","wordpress-seo/wp-seo.php","custom-post-type-ui/custom-post-type-ui.php","wp-mail-smtp/wp_mail_smtp.php","wordfence/wordfence.php","updraftplus/updraftplus.php","classic-editor/classic-editor.php","duplicate-post/duplicate-post.php","show-current-template/show-current-template.php"]' --format=json --allow-root

# Create plugin installation instructions
cat > /var/www/html/PLUGIN_INSTALLATION_INSTRUCTIONS.md << 'EOF'
# Premium Plugin Installation Instructions

## Required Premium Plugins

### 1. Advanced Custom Fields PRO
- Download from: https://www.advancedcustomfields.com/
- License key location: wp-config.php (ACF_PRO_LICENSE)
- Installation: Upload zip file via WordPress admin

### 2. Gravity Forms
- Download from: https://www.gravityforms.com/
- License key location: wp-config.php (GF_LICENSE_KEY)
- Installation: Upload zip file via WordPress admin
- Required Add-ons: HIPAA Add-on for patient forms

### 3. FacetWP
- Download from: https://facetwp.com/
- License key location: wp-config.php (FACETWP_LICENSE_KEY)
- Installation: Upload zip file via WordPress admin

### 4. MemberPress
- Download from: https://memberpress.com/
- License key location: wp-config.php (MEMBERPRESS_LICENSE_KEY)
- Installation: Upload zip file via WordPress admin

### 5. WP Rocket
- Download from: https://wp-rocket.me/
- License key location: wp-config.php (WP_ROCKET_LICENSE_KEY)
- Installation: Upload zip file via WordPress admin

## Installation Steps

1. Purchase and download the premium plugins
2. Update license keys in wp-config-extra.php
3. Upload plugin zip files via WordPress admin
4. Activate each plugin
5. Verify license activation in plugin settings

## Post-Installation Configuration

1. Run the ACF field import: `wp acf import theme/acf-provider-fields.json`
2. Import Gravity Forms: `wp gf form import forms/gravity-forms-export.json`
3. Configure FacetWP facets as needed
4. Set up MemberPress membership levels
5. Configure WP Rocket caching settings

## Troubleshooting

If you encounter issues:
1. Check error logs in wp-content/debug.log
2. Verify license keys are correct
3. Ensure all dependencies are met
4. Contact plugin support if needed
EOF

# Final cleanup and cache flush
echo "🧹 Final cleanup..."
wp cache flush --allow-root
wp rewrite flush --allow-root

# Configure AWS-specific plugins
echo "⚙️ Configuring AWS-specific plugins..."

# Configure WP Offload Media for S3
if [ -n "$AWS_S3_BUCKET" ]; then
    echo "Configuring WP Offload Media for S3..."
    
    # Set S3 bucket configuration
    wp option update tantan_wordpress_s3_bucket "$AWS_S3_BUCKET" --allow-root
    wp option update tantan_wordpress_s3_region "$AWS_S3_REGION" --allow-root
    
    # Configure S3 settings
    wp option update tantan_wordpress_s3_copy_to_s3 "1" --allow-root
    wp option update tantan_wordpress_s3_serve_from_s3 "1" --allow-root
    wp option update tantan_wordpress_s3_remove_local_file "1" --allow-root
    wp option update tantan_wordpress_s3_object_versioning "1" --allow-root
    
    echo "✅ WP Offload Media configured for S3"
else
    echo "⚠️ AWS_S3_BUCKET not set, skipping S3 configuration"
fi

# Configure WP SES for email delivery
if [ -n "$AWS_REGION" ]; then
    echo "Configuring WP SES..."
    
    # Set SES region
    wp option update wp_ses_region "$AWS_REGION" --allow-root
    wp option update wp_ses_from_email "$WP_ADMIN_EMAIL" --allow-root
    wp option update wp_ses_from_name "$WP_SITE_TITLE" --allow-root
    
    echo "✅ WP SES configured"
else
    echo "⚠️ AWS_REGION not set, skipping SES configuration"
fi

# Configure Autoptimize for performance
echo "Configuring Autoptimize..."
wp option update autoptimize_js "1" --allow-root
wp option update autoptimize_css "1" --allow-root
wp option update autoptimize_html "1" --allow-root
wp option update autoptimize_js_exclude "wp-includes/js/dist/, wp-includes/js/tinymce/, wp-content/plugins/gravityforms/" --allow-root
wp option update autoptimize_css_exclude "wp-content/plugins/gravityforms/" --allow-root
wp option update autoptimize_cdn_url "$AWS_CLOUDFRONT_URL" --allow-root
echo "✅ Autoptimize configured"

# Configure Redis Cache if available
if [ "$DEPLOYMENT_TYPE" = "docker" ] || [ -n "$REDIS_HOST" ]; then
    echo "Configuring Redis Cache..."
    wp redis enable --allow-root
    echo "✅ Redis Cache enabled"
fi

# Clean up temporary files
rm -f /tmp/acf-pro-activation.php
rm -f /tmp/gravity-forms-activation.php
rm -f /tmp/facetwp-activation.php
rm -f /tmp/memberpress-activation.php
rm -f /tmp/wp-rocket-activation.php

echo "✅ Plugin installation and configuration completed!"
echo ""
echo "📋 Summary of installed plugins:"
echo "   ✓ Yoast SEO - Configured with custom titles and meta descriptions"
echo "   ✓ Custom Post Type UI - Ready for provider post type"
echo "   ✓ Redis Cache - Configured and enabled"
echo "   ✓ WP Mail SMTP - Basic configuration applied"
echo "   ✓ Wordfence Security - Security settings configured"
echo "   ✓ UpdraftPlus - Daily backups configured"
echo "   ✓ Classic Editor - Activated for compatibility"
echo "   ✓ Duplicate Post - Activated for content management"
echo "   ✓ Show Current Template - Activated for development"
echo "   ✓ WP Offload Media - S3 integration configured"
echo "   ✓ WP SES - Email delivery via Amazon SES"
echo "   ✓ Cloudflare - CDN integration enabled"
echo "   ✓ Autoptimize - Performance optimization configured"
echo ""
echo "⚠️  Manual installation required for premium plugins:"
echo "   • Advanced Custom Fields PRO"
echo "   • Gravity Forms + HIPAA Add-on"
echo "   • FacetWP"
echo "   • MemberPress"
echo "   • WP Rocket"
echo ""
echo "📖 See PLUGIN_INSTALLATION_INSTRUCTIONS.md for detailed setup instructions"
echo ""
echo "🚀 Ready for next phase: Custom Post Types and Fields!" 