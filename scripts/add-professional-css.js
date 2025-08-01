#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

// Function to add professional UI CSS to a file if not already present
function addProfessionalCSS(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Skip if already has professional UI CSS
        if (content.includes('professional-ui.css')) {
            return false;
        }
        
        // Skip admin files
        if (filePath.includes('admin/')) {
            return false;
        }
        
        // Find the style.min.css line and add professional-ui.css after it
        const styleMinRegex = /(\s*<link rel="stylesheet" href="(\.\.\/)?assets\/css\/style\.min\.css">)/;
        
        if (styleMinRegex.test(content)) {
            // Determine if this is a subdirectory file
            const isSubdir = content.includes('href="../assets/css/style.min.css"');
            const cssPath = isSubdir ? '../assets/css/professional-ui.css' : 'assets/css/professional-ui.css';
            
            content = content.replace(
                styleMinRegex,
                `$1\n    <link rel="stylesheet" href="${cssPath}">`
            );
            
            fs.writeFileSync(filePath, content);
            console.log(`✅ Added professional CSS to: ${filePath}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Find all HTML files and add CSS
function addCSSToAllFiles() {
    const htmlFiles = glob.sync('**/*.html', {
        ignore: ['node_modules/**', 'dist/**', 'build/**', 'admin/**']
    });
    
    let totalModified = 0;
    
    console.log('💅 Adding professional UI CSS to all healthcare pages...\n');
    
    htmlFiles.forEach(file => {
        if (addProfessionalCSS(file)) {
            totalModified++;
        }
    });
    
    console.log(`\n✨ Professional CSS added to ${totalModified} files.`);
    console.log('🏥 All patient-facing pages now have professional healthcare styling.');
}

// Run the CSS addition
addCSSToAllFiles();