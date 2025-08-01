#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Emoji replacements for professional healthcare UI
const emojiReplacements = {
    // Brand logos
    '🤝 Helping Hands': 'Helping Hands',
    '🤝 Admin Dashboard': 'Admin Dashboard',
    '🤝 Helping Hands Admin Dashboard': 'Helping Hands Admin Dashboard',
    
    // Remove standalone emojis in headers and text
    '🤝': '',
    '💉': '',
    '🗺️': '',
    '🔗': '',
    '🩸': '',
    '👨‍🦳': 'RM',
    '👩‍💼': 'JM', 
    '🏃‍♂️': 'CA',
    '👵': 'DH',
    '💡': '',
    '📊': '',
    '📈': '',
    '📋': '',
    '♿': '',
    '📰': '',
    '❓': '',
    '🏆': '',
    '⚡': '',
    '📦': '',
    '🗜️': '',
    '🚀': '',
    
    // Replace emoji star ratings with clean text
    '⭐⭐⭐⭐⭐': '★★★★★',
    
    // Clean up section headers
    '🚀 Getting Started': 'Getting Started',
    '♿ Our Commitment': 'Our Commitment',
    '♿ Accessible': 'Accessible',
    '⚡ Fast Loading': 'Fast Loading',
    '🤝 Professional Memberships': 'Professional Memberships',
    '💡 Quick Tip': 'Quick Tip',
    '💡 Tip:': 'Tip:',
    '📋 If You Have Immediate Medical Bills': 'If You Have Immediate Medical Bills',
    '📋 Related Resources': 'Related Resources',
    '📋 View Sitemap': 'View Sitemap',
    '📋 Appointment Preparation': 'Appointment Preparation',
    '📋 Directory Listing': 'Directory Listing',
    '📊 Clinical Guidelines': 'Clinical Guidelines',
    '🔗 Referral Network': 'Referral Network',
    '🔗 NeedyMeds Database': 'NeedyMeds Database',
    '🔗 Patient Advocate Foundation': 'Patient Advocate Foundation',
    '🔗 Good Days Foundation': 'Good Days Foundation',
    '🔗 HealthWell Foundation': 'HealthWell Foundation',
    '🔗 Medicare.gov': 'Medicare.gov',
    '🗺️ Interactive Body Map': 'Interactive Body Map',
    '🗺️ Sitemap': 'Sitemap',
    '🤝 Join Our Network': 'Join Our Network',
    '♿ Accessibility Statement': 'Accessibility Statement',
    
    // Diabetes-specific cleanups
    '🩸 Insulin Assistance Programs': 'Insulin Assistance Programs',
    '🩸 Diabetic Foot Ulcer': 'Diabetic Foot Ulcer (Priority)',
    '🩸 Other Diabetic Ulcer': 'Other Diabetic Ulcer (Priority)',
    '🩸 Diabetes Financial Assistance': 'Diabetes Financial Assistance',
    
    // Service icon cleanups - replace with clean text or remove
    'service-icon" aria-hidden="true">🩸</div>': 'service-icon professional-icon" aria-hidden="true"><div class="trust-badge">Diabetes Care</div></div>',
    
    // Medical icon cleanups
    '🩺': '',
    '<span style="font-size: 4rem; color: white;">🩺</span>': '<div class="professional-avatar">MD</div>',
    '<div style="font-size: 3rem; margin-bottom: 1rem;">🩺</div>': '<div class="section-icon-professional">MD</div>',
    '🩺 Our Services': 'Our Services',
    '🩺 Find Providers': 'Find Providers',
    
    // Legal & Professional symbols
    '⚖️': '',
    '<span style="font-size: 4rem; color: white;">⚖️</span>': '<div class="professional-avatar">LAW</div>',
    '<div style="font-size: 3rem; margin-bottom: 1rem;">⚖️</div>': '<div class="section-icon-professional">LAW</div>',
    '<div style="font-size: 4rem; margin-bottom: 1.5rem;">⚖️</div>': '<div class="section-icon-professional">LAW</div>',
    '⚖️ Important Notice': 'Important Notice',
    '⚖️ Know Your Rights': 'Know Your Rights',
    
    // Medical caduceus
    '⚕️': '',
    '<div style="font-size: 3rem; margin-bottom: 1rem;">⚕️</div>': '<div class="section-icon-professional">MD</div>',
    
    // Faith-based
    '⛪': '',
    '⛪ Faith-Based Help': 'Faith-Based Help',
    '⛪ Faith-Based Organizations': 'Faith-Based Organizations',
    
    // Insurance & Protection
    '🛡️': '',
    '🛡️ Insurance & Coverage': 'Insurance & Coverage',
    '🛡️ Insurance Navigation': 'Insurance Navigation',
    
    // Timing symbols
    '⏱️': '',
    '⏱️ Processing:': 'Processing:',
    
    // Government
    '🏛️': '',
    '🏛️ Government Diabetes Assistance Programs': 'Government Diabetes Assistance Programs',
    
    // Veterans
    '🎖️': '',
    '🎖️ Veterans Resources': 'Veterans Resources',
    
    // Info
    'ℹ️': '',
    'ℹ️ About Us': 'About Us',
    
    // Accessibility
    '⌨️': '',
    '⌨️ Keyboard Accessibility': 'Keyboard Accessibility',
    '⚠️': '',
    '⚠️ Legacy Browser Notice': 'Legacy Browser Notice',
    
    // Professional people - replace with professional avatars
    '👩‍⚕️': '',
    '<span style="font-size: 3rem; color: white;">👩‍⚕️</span>': '<div class="professional-avatar">RN</div>',
    '👨‍💼': '',
    '<span style="font-size: 3rem; color: white;">👨‍💼</span>': '<div class="professional-avatar">ADM</div>',
    '👩‍🎓': '',
    '<span style="font-size: 3rem; color: white;">👩‍🎓</span>': '<div class="professional-avatar">PhD</div>',
    '👨‍💻': '',
    '<span style="font-size: 3rem; color: white;">👨‍💻</span>': '<div class="professional-avatar">IT</div>',
    
    // Additional symbols found
    '🔥': '',
    '<div style="font-size: 3rem; margin-bottom: 1rem;">🔥</div>': '<div class="section-icon-professional">CARE</div>',
    '💰': '',
    '<div style="font-size: 3rem; margin-bottom: 1rem;">💰</div>': '<div class="section-icon-professional">$</div>',
    '🔬': '',
    '<div style="font-size: 3rem; margin-bottom: 1rem;">🔬</div>': '<div class="section-icon-professional">LAB</div>',
    '🔒': '',
    '🔒 Your Privacy Matters': 'Your Privacy Matters',
};

// Function to clean up a file
function cleanFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        for (const [emoji, replacement] of Object.entries(emojiReplacements)) {
            if (content.includes(emoji)) {
                content = content.replaceAll(emoji, replacement);
                modified = true;
            }
        }
        
        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`✅ Cleaned: ${filePath}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Find all HTML files and clean them
function cleanAllHtmlFiles() {
    const htmlFiles = glob.sync('**/*.html', {
        ignore: ['node_modules/**', 'dist/**', 'build/**']
    });
    
    let totalCleaned = 0;
    
    console.log('🧹 Starting emoji cleanup for professional healthcare UI...\n');
    
    htmlFiles.forEach(file => {
        if (cleanFile(file)) {
            totalCleaned++;
        }
    });
    
    console.log(`\n✨ Cleanup complete! ${totalCleaned} files modified.`);
    console.log('🏥 Your site now has professional healthcare UI without childish emojis.');
}

// Run the cleanup
cleanAllHtmlFiles();