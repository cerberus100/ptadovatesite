<?php
/**
 * Additional WordPress Configuration
 * This file should be included in wp-config.php
 */

// Database Configuration
define('DB_NAME', getenv('DB_NAME') ?: 'helping_hands_wp');
define('DB_USER', getenv('DB_USER') ?: 'hh_user');
define('DB_PASSWORD', getenv('DB_PASSWORD') ?: 'hh_secure_password_2024');
define('DB_HOST', getenv('DB_HOST') ?: 'mariadb');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// WordPress Security Keys and Salts
define('AUTH_KEY',         getenv('AUTH_KEY') ?: 'put_your_unique_phrase_here_auth_key_helping_hands_2024');
define('SECURE_AUTH_KEY',  getenv('SECURE_AUTH_KEY') ?: 'put_your_unique_phrase_here_secure_auth_key_helping_hands_2024');
define('LOGGED_IN_KEY',    getenv('LOGGED_IN_KEY') ?: 'put_your_unique_phrase_here_logged_in_key_helping_hands_2024');
define('NONCE_KEY',        getenv('NONCE_KEY') ?: 'put_your_unique_phrase_here_nonce_key_helping_hands_2024');
define('AUTH_SALT',        getenv('AUTH_SALT') ?: 'put_your_unique_phrase_here_auth_salt_helping_hands_2024');
define('SECURE_AUTH_SALT', getenv('SECURE_AUTH_SALT') ?: 'put_your_unique_phrase_here_secure_auth_salt_helping_hands_2024');
define('LOGGED_IN_SALT',   getenv('LOGGED_IN_SALT') ?: 'put_your_unique_phrase_here_logged_in_salt_helping_hands_2024');
define('NONCE_SALT',       getenv('NONCE_SALT') ?: 'put_your_unique_phrase_here_nonce_salt_helping_hands_2024');

// Redis Configuration
define('WP_REDIS_HOST', 'redis');
define('WP_REDIS_PORT', 6379);
define('WP_REDIS_TIMEOUT', 1);
define('WP_REDIS_READ_TIMEOUT', 1);
define('WP_REDIS_DATABASE', 0);

// File System Configuration
define('FS_METHOD', 'direct');
define('FTP_BASE', '/var/www/html/');
define('FTP_CONTENT_DIR', '/var/www/html/wp-content/');
define('FTP_PLUGIN_DIR', '/var/www/html/wp-content/plugins/');

// WordPress Memory and Performance
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');
define('WP_POST_REVISIONS', 5);
define('AUTOSAVE_INTERVAL', 300);
define('WP_AUTO_UPDATE_CORE', true);

// WordPress URLs
define('WP_HOME', getenv('WP_SITE_URL') ?: 'http://localhost');
define('WP_SITEURL', getenv('WP_SITE_URL') ?: 'http://localhost');

// WordPress Security
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', false);
define('FORCE_SSL_ADMIN', false);
define('AUTOMATIC_UPDATER_DISABLED', false);

// WordPress Debug Configuration
define('WP_DEBUG', getenv('WP_DEBUG') === '1' ? true : false);
define('WP_DEBUG_LOG', WP_DEBUG);
define('WP_DEBUG_DISPLAY', false);
define('SCRIPT_DEBUG', WP_DEBUG);
define('SAVEQUERIES', WP_DEBUG);

// WordPress Cache Configuration
define('WP_CACHE', true);
define('WPCACHEHOME', '/var/www/html/wp-content/plugins/wp-super-cache/');

// WordPress Cron
define('DISABLE_WP_CRON', false);
define('WP_CRON_LOCK_TIMEOUT', 60);

// WordPress Content Directory
define('WP_CONTENT_DIR', '/var/www/html/wp-content');
define('WP_CONTENT_URL', 'http://localhost/wp-content');

// WordPress Plugin Directory
define('WP_PLUGIN_DIR', '/var/www/html/wp-content/plugins');
define('WP_PLUGIN_URL', 'http://localhost/wp-content/plugins');

// WordPress Upload Directory
define('UPLOADS', 'wp-content/uploads');

// WordPress Multisite (disabled)
define('MULTISITE', false);

// WordPress REST API
define('WP_REST_API_ENABLED', true);

// WordPress Cookie Settings
define('COOKIE_DOMAIN', '');
define('COOKIEPATH', '/');
define('SITECOOKIEPATH', '/');

// WordPress Theme Directory
define('WP_DEFAULT_THEME', 'helpinghands');

// Helping Hands Specific Configuration
define('HH_ADMIN_EMAIL', getenv('WP_ADMIN_EMAIL') ?: 'admin@helpinghands.com');
define('HH_ADMIN_USER', getenv('WP_ADMIN_USER') ?: 'helping_admin');
define('HH_SITE_TITLE', getenv('WP_SITE_TITLE') ?: 'Helping Hands Wound Care Advocacy');

// Custom Plugin Configuration
define('HH_BODYMAP_ENABLED', true);
define('HH_ADMIN_DASHBOARD_ENABLED', true);
define('HH_PROVIDER_DIRECTORY_ENABLED', true);

// ACF Configuration
define('ACF_PRO_LICENSE', 'YOUR_ACF_PRO_LICENSE_KEY');

// Gravity Forms Configuration
define('GF_LICENSE_KEY', 'YOUR_GRAVITY_FORMS_LICENSE_KEY');

// FacetWP Configuration
define('FACETWP_LICENSE_KEY', 'YOUR_FACETWP_LICENSE_KEY');

// MemberPress Configuration
define('MEMBERPRESS_LICENSE_KEY', 'YOUR_MEMBERPRESS_LICENSE_KEY');

// WP Rocket Configuration
define('WP_ROCKET_LICENSE_KEY', 'YOUR_WP_ROCKET_LICENSE_KEY');

// That's all, stop editing!
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

require_once ABSPATH . 'wp-settings.php'; 