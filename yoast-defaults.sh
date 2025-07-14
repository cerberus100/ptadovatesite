#!/bin/bash

# Yoast SEO Configuration Script for Helping Hands
# This script configures Yoast SEO with optimized defaults for wound care advocacy

set -e

echo "🔧 Configuring Yoast SEO for Helping Hands Wound Care Advocacy..."

# Check if Yoast SEO is installed and active
if ! wp plugin is-active wordpress-seo --allow-root; then
    echo "❌ Yoast SEO is not active. Please install and activate it first."
    exit 1
fi

echo "✅ Yoast SEO is active. Proceeding with configuration..."

# General SEO Settings
echo "📝 Setting up general SEO settings..."

# Company/Organization settings
wp option update wpseo_titles --format=json '{
    "company_or_person": "company",
    "company_name": "Helping Hands Wound Care Advocacy",
    "company_logo": "",
    "company_logo_id": "",
    "person_name": "",
    "company_or_person_user_id": false,
    "website_name": "Helping Hands",
    "alternate_website_name": "HH Wound Care"
}' --allow-root

# Site-wide SEO settings
wp option update wpseo --format=json '{
    "tracking": false,
    "keyword_analysis_active": true,
    "content_analysis_active": true,
    "enable_cornerstone_content": true,
    "enable_text_link_counter": true,
    "enable_metabox_insights": true,
    "enable_link_suggestions": true,
    "enable_admin_bar_menu": true,
    "enable_xml_sitemap": true,
    "enable_index_now": true,
    "disable_author": false,
    "disable_date": false,
    "disable_post_format": true,
    "disable_attachment_redirect": true,
    "disable_feed": false,
    "breadcrumbs-enable": true,
    "breadcrumbs-sep": "»",
    "breadcrumbs-home": "Home",
    "breadcrumbs-prefix": "",
    "breadcrumbs-archiveprefix": "Archives for",
    "breadcrumbs-searchprefix": "You searched for",
    "breadcrumbs-404crumb": "Error 404",
    "breadcrumbs-blog": "Blog",
    "stripcategorybase": true,
    "trailingslash": false,
    "cleanslugs": true,
    "cleanreplytocom": true,
    "cleanshortlinks": true,
    "cleanpermalinks": true,
    "force_transport": "auto",
    "hide_paginated_contents": false,
    "search_cleanup": true,
    "search_cleanup_emoji": true,
    "search_cleanup_patterns": true
}' --allow-root

# Title Templates
echo "🏷️ Setting up title templates..."

# Homepage title
wp yoast settings set title_template_home "%%sitename%% | Professional Wound Care Advocacy" --allow-root

# Post types
wp yoast settings set title_template_post "%%title%% | %%sitename%%" --allow-root
wp yoast settings set title_template_page "%%title%% | %%sitename%%" --allow-root
wp yoast settings set title_template_provider "%%title%% | Wound Care Provider | %%sitename%%" --allow-root

# Archives
wp yoast settings set title_template_archive_post "Blog Archive | %%sitename%%" --allow-root
wp yoast settings set title_template_archive_provider "Find Wound Care Providers | %%sitename%%" --allow-root

# Taxonomy archives
wp yoast settings set title_template_taxonomy_category "%%term_title%% Articles | %%sitename%%" --allow-root
wp yoast settings set title_template_taxonomy_post_tag "%%term_title%% | %%sitename%%" --allow-root
wp yoast settings set title_template_taxonomy_wound_types "%%term_title%% Treatment | %%sitename%%" --allow-root

# Author archives
wp yoast settings set title_template_author "Articles by %%name%% | %%sitename%%" --allow-root

# Date archives
wp yoast settings set title_template_date "%%date%% | %%sitename%%" --allow-root

# Search results
wp yoast settings set title_template_search "Search Results for %%searchphrase%% | %%sitename%%" --allow-root

# 404 page
wp yoast settings set title_template_404 "Page Not Found | %%sitename%%" --allow-root

# Meta Description Templates
echo "📄 Setting up meta description templates..."

# Homepage meta description
wp yoast settings set meta_description_template_home "Professional wound care advocacy connecting patients with specialists. Expert diabetic foot ulcer care, venous leg ulcer treatment, and comprehensive wound management." --allow-root

# Post types
wp yoast settings set meta_description_template_post "%%excerpt%%" --allow-root
wp yoast settings set meta_description_template_page "%%excerpt%%" --allow-root
wp yoast settings set meta_description_template_provider "%%excerpt%% Contact this wound care specialist for professional treatment." --allow-root

# Archives
wp yoast settings set meta_description_template_archive_post "Latest wound care articles, tips, and resources from Helping Hands advocacy team." --allow-root
wp yoast settings set meta_description_template_archive_provider "Find qualified wound care providers in your area. Search by specialty, location, and wound type." --allow-root

# Taxonomy archives
wp yoast settings set meta_description_template_taxonomy_category "%%term_description%%" --allow-root
wp yoast settings set meta_description_template_taxonomy_post_tag "Articles about %%term_title%% from Helping Hands wound care advocacy." --allow-root
wp yoast settings set meta_description_template_taxonomy_wound_types "Find specialists for %%term_title%% treatment. Professional wound care providers in your area." --allow-root

# Author archives
wp yoast settings set meta_description_template_author "Articles by %%name%% about wound care, treatment options, and patient advocacy." --allow-root

# Social Media Settings
echo "📱 Setting up social media integration..."

# Facebook/Open Graph
wp option update wpseo_social --format=json '{
    "opengraph": true,
    "facebook_site": "",
    "instagram_url": "",
    "linkedin_url": "",
    "myspace_url": "",
    "pinterest_url": "",
    "pinterestverify": "",
    "plus_url": "",
    "twitter": true,
    "twitter_site": "",
    "twitter_card_type": "summary_large_image",
    "youtube_url": "",
    "wikipedia_url": "",
    "fbadminapp": "",
    "facebook_image": "",
    "facebook_image_id": "",
    "og_default_image": "",
    "og_default_image_id": "",
    "og_frontpage_title": "%%sitename%% | Professional Wound Care Advocacy",
    "og_frontpage_desc": "Professional wound care advocacy connecting patients with specialists. Expert diabetic foot ulcer care, venous leg ulcer treatment, and comprehensive wound management.",
    "og_frontpage_image": "",
    "og_frontpage_image_id": "",
    "twitter_description": "Professional wound care advocacy connecting patients with specialists. Expert treatment for diabetic foot ulcers, venous leg ulcers, and more.",
    "twitter_title": "%%sitename%% | Professional Wound Care Advocacy",
    "twitter_image": "",
    "twitter_image_id": ""
}' --allow-root

# XML Sitemap Configuration
echo "🗺️ Configuring XML sitemap..."

# Enable XML sitemap
wp option update wpseo_xml --format=json '{
    "enablexmlsitemap": true,
    "entries-per-page": 1000,
    "excluded-posts": ""
}' --allow-root

# Post types in sitemap
wp option update wpseo_xml_post_types --format=json '{
    "post": {
        "priority": 0.6,
        "changefreq": "weekly",
        "include": true
    },
    "page": {
        "priority": 0.8,
        "changefreq": "monthly",
        "include": true
    },
    "provider": {
        "priority": 0.9,
        "changefreq": "monthly",
        "include": true
    }
}' --allow-root

# Taxonomies in sitemap
wp option update wpseo_xml_taxonomies --format=json '{
    "category": {
        "priority": 0.4,
        "changefreq": "weekly",
        "include": true
    },
    "post_tag": {
        "priority": 0.3,
        "changefreq": "weekly",
        "include": true
    },
    "wound_types": {
        "priority": 0.7,
        "changefreq": "monthly",
        "include": true
    }
}' --allow-root

# Breadcrumbs Configuration
echo "🍞 Setting up breadcrumbs..."

wp option update wpseo_internallinks --format=json '{
    "breadcrumbs-enable": true,
    "breadcrumbs-sep": "»",
    "breadcrumbs-home": "Home",
    "breadcrumbs-prefix": "",
    "breadcrumbs-archiveprefix": "Archives for",
    "breadcrumbs-searchprefix": "You searched for",
    "breadcrumbs-404crumb": "Error 404",
    "breadcrumbs-blog": "Blog",
    "breadcrumbs-boldlast": false,
    "breadcrumbs-display-blog-page": true,
    "post_types-post-maintax": "category",
    "post_types-provider-maintax": "wound_types",
    "taxonomy-category-ptparent": "post",
    "taxonomy-post_tag-ptparent": "post",
    "taxonomy-wound_types-ptparent": "provider"
}' --allow-root

# Advanced Settings
echo "⚙️ Configuring advanced settings..."

# Permalink settings
wp option update wpseo_permalinks --format=json '{
    "cleanpermalinks": true,
    "force_transport": "auto",
    "cleanreplytocom": true,
    "cleanshortlinks": true,
    "redirectattachment": true,
    "stripcategorybase": true,
    "trailingslash": false
}' --allow-root

# RSS settings
wp option update wpseo_rss --format=json '{
    "rssbefore": "This content originally appeared on %%SITENAME%% - %%SITEDESC%%",
    "rssafter": "%%POSTLINK%% - %%SITENAME%%"
}' --allow-root

# Webmaster Tools
echo "🔍 Setting up webmaster tools..."

# Google Search Console, Bing, etc.
wp option update wpseo --format=json '{
    "googleverify": "",
    "bingverify": "",
    "yandexverify": "",
    "baiduverify": "",
    "pinterestverify": "",
    "googleplus": ""
}' --allow-root

# Schema.org Settings
echo "🏗️ Configuring Schema.org structured data..."

# Organization schema
wp option update wpseo_titles --format=json '{
    "company_or_person": "company",
    "company_name": "Helping Hands Wound Care Advocacy",
    "company_logo": "",
    "company_logo_id": "",
    "person_name": "",
    "company_or_person_user_id": false,
    "website_name": "Helping Hands",
    "alternate_website_name": "HH Wound Care",
    "default_tagline": "Professional wound care advocacy and provider network"
}' --allow-root

# Content type specific settings
echo "📋 Setting up content type specific SEO settings..."

# Provider post type settings
wp option update wpseo_titles --format=json '{
    "display-metabox-pt-provider": true,
    "noindex-provider": false,
    "nofollow-provider": false,
    "noarchive-provider": false,
    "nosnippet-provider": false,
    "noimageindex-provider": false,
    "showdate-provider": false,
    "hideeditbox-provider": false
}' --allow-root

# Wound types taxonomy settings
wp option update wpseo_titles --format=json '{
    "display-metabox-tax-wound_types": true,
    "noindex-tax-wound_types": false,
    "nofollow-tax-wound_types": false,
    "noarchive-tax-wound_types": false,
    "nosnippet-tax-wound_types": false,
    "noimageindex-tax-wound_types": false,
    "showdate-tax-wound_types": false,
    "hideeditbox-tax-wound_types": false
}' --allow-root

# Custom Fields Settings
echo "🔧 Configuring custom fields for SEO..."

# Set up some default focus keywords for wound care
wp option update wpseo_titles --format=json '{
    "keyword_analysis_active": true,
    "content_analysis_active": true,
    "enable_cornerstone_content": true,
    "enable_text_link_counter": true,
    "enable_metabox_insights": true,
    "enable_link_suggestions": true
}' --allow-root

# Performance Settings
echo "⚡ Optimizing performance settings..."

# Disable unnecessary features for better performance
wp option update wpseo --format=json '{
    "disable_author": false,
    "disable_date": false,
    "disable_post_format": true,
    "disable_attachment_redirect": true,
    "disable_feed": false,
    "search_cleanup": true,
    "search_cleanup_emoji": true,
    "search_cleanup_patterns": true
}' --allow-root

# Reindex content for better search results
echo "🔄 Reindexing content..."
wp yoast index --reindex --allow-root

# Clear any caches
echo "🧹 Clearing caches..."
wp cache flush --allow-root

# Add some wound care specific focus keywords
echo "🎯 Adding wound care specific focus keywords..."

# Create a simple function to add focus keywords to existing content
wp eval --allow-root '
$posts = get_posts(array(
    "post_type" => "post",
    "posts_per_page" => 10,
    "post_status" => "publish"
));

foreach ($posts as $post) {
    $title = strtolower($post->post_title);
    $content = strtolower($post->post_content);
    
    // Suggest focus keywords based on content
    $keywords = array();
    
    if (strpos($title, "diabetic") !== false || strpos($content, "diabetic") !== false) {
        $keywords[] = "diabetic foot ulcer";
    }
    
    if (strpos($title, "venous") !== false || strpos($content, "venous") !== false) {
        $keywords[] = "venous leg ulcer";
    }
    
    if (strpos($title, "pressure") !== false || strpos($content, "pressure") !== false) {
        $keywords[] = "pressure ulcer";
    }
    
    if (strpos($title, "wound") !== false || strpos($content, "wound") !== false) {
        $keywords[] = "wound care";
    }
    
    if (!empty($keywords)) {
        update_post_meta($post->ID, "_yoast_wpseo_focuskw", $keywords[0]);
        echo "Added focus keyword \"" . $keywords[0] . "\" to post: " . $post->post_title . "\n";
    }
}

// Add focus keywords to provider posts
$providers = get_posts(array(
    "post_type" => "provider",
    "posts_per_page" => 10,
    "post_status" => "publish"
));

foreach ($providers as $provider) {
    $specialty = get_post_meta($provider->ID, "specialty", true);
    $keyword = "";
    
    switch ($specialty) {
        case "wound-care-specialist":
            $keyword = "wound care specialist";
            break;
        case "podiatrist":
            $keyword = "podiatrist wound care";
            break;
        case "vascular-surgeon":
            $keyword = "vascular surgeon";
            break;
        case "plastic-surgeon":
            $keyword = "plastic surgeon wound care";
            break;
        case "dermatologist":
            $keyword = "dermatologist wound care";
            break;
        default:
            $keyword = "wound care provider";
    }
    
    if ($keyword) {
        update_post_meta($provider->ID, "_yoast_wpseo_focuskw", $keyword);
        echo "Added focus keyword \"" . $keyword . "\" to provider: " . $provider->post_title . "\n";
    }
}

echo "Focus keywords added successfully!\n";
'

# Set up robots.txt additions
echo "🤖 Configuring robots.txt..."
wp option update wpseo_robots --format=json '{
    "robots-file": "User-agent: *\nDisallow: /wp-admin/\nDisallow: /wp-includes/\nDisallow: /wp-content/plugins/\nDisallow: /wp-content/cache/\nDisallow: /wp-content/themes/\nDisallow: /trackback/\nDisallow: /feed/\nDisallow: /comments/\nDisallow: /category/*/*\nDisallow: */trackback/\nDisallow: */feed/\nDisallow: */comments/\nDisallow: /*?*\nDisallow: /*?\nAllow: /wp-content/uploads/\nAllow: /wp-content/themes/helpinghands/assets/\n\nSitemap: %%SITEURL%%/sitemap_index.xml"
}' --allow-root

# Final optimizations
echo "🔧 Final SEO optimizations..."

# Set up some default SEO values for new content
wp option update wpseo_defaults --format=json '{
    "post_types": {
        "post": {
            "title": "%%title%% | %%sitename%%",
            "metadesc": "%%excerpt%%",
            "noindex": false,
            "nofollow": false
        },
        "page": {
            "title": "%%title%% | %%sitename%%",
            "metadesc": "%%excerpt%%",
            "noindex": false,
            "nofollow": false
        },
        "provider": {
            "title": "%%title%% | Wound Care Provider | %%sitename%%",
            "metadesc": "%%excerpt%% Contact this wound care specialist for professional treatment.",
            "noindex": false,
            "nofollow": false
        }
    },
    "taxonomies": {
        "category": {
            "title": "%%term_title%% Articles | %%sitename%%",
            "metadesc": "%%term_description%%",
            "noindex": false,
            "nofollow": false
        },
        "wound_types": {
            "title": "%%term_title%% Treatment | %%sitename%%",
            "metadesc": "Find specialists for %%term_title%% treatment. Professional wound care providers in your area.",
            "noindex": false,
            "nofollow": false
        }
    }
}' --allow-root

# Final cache flush and reindex
wp cache flush --allow-root
wp rewrite flush --allow-root

echo "✅ Yoast SEO configuration completed successfully!"
echo ""
echo "📋 Configuration Summary:"
echo "   ✓ Site-wide SEO settings optimized"
echo "   ✓ Title templates configured for wound care"
echo "   ✓ Meta description templates set"
echo "   ✓ XML sitemap enabled with custom priorities"
echo "   ✓ Breadcrumbs configured"
echo "   ✓ Social media integration prepared"
echo "   ✓ Schema.org structured data configured"
echo "   ✓ Focus keywords added to existing content"
echo "   ✓ Robots.txt optimized"
echo "   ✓ Performance settings optimized"
echo ""
echo "🎯 Recommended next steps:"
echo "   1. Add your Google Search Console verification code"
echo "   2. Set up social media profile URLs"
echo "   3. Upload a company logo for schema markup"
echo "   4. Review and customize focus keywords for each page"
echo "   5. Set up Google Analytics integration"
echo ""
echo "📈 Your site is now optimized for wound care related search terms!"
echo "🚀 Ready for search engine success!" 