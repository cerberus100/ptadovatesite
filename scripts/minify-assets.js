/**
 * Asset Minification Script
 * Advanced minification for CSS, JS, HTML, and other assets
 */

const fs = require('fs').promises;
const path = require('path');
const terser = require('terser');
const CleanCSS = require('clean-css');
const htmlMinifier = require('html-minifier-terser');

class AssetMinifier {
    constructor() {
        this.inputDir = process.argv[2] || 'dist';
        this.outputDir = process.argv[3] || this.inputDir;
        this.stats = {
            js: { files: 0, originalSize: 0, minifiedSize: 0 },
            css: { files: 0, originalSize: 0, minifiedSize: 0 },
            html: { files: 0, originalSize: 0, minifiedSize: 0 },
            errors: []
        };
    }

    async run() {
        console.log('🗜️  Starting asset minification...');
        console.log(`📁 Input: ${this.inputDir}`);
        console.log(`📁 Output: ${this.outputDir}`);
        
        try {
            await this.minifyJavaScript();
            await this.minifyCSS();
            await this.minifyHTML();
            await this.optimizeJSON();
            this.printStats();
        } catch (error) {
            console.error('❌ Minification failed:', error);
            process.exit(1);
        }
    }

    async minifyJavaScript() {
        console.log('📄 Minifying JavaScript files...');
        
        const jsFiles = await this.findFiles(this.inputDir, ['.js']);
        
        for (const file of jsFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const originalSize = Buffer.byteLength(content, 'utf8');
                
                const result = await terser.minify(content, {
                    compress: {
                        dead_code: true,
                        drop_console: true,
                        drop_debugger: true,
                        keep_fargs: false,
                        unsafe_comps: true,
                        unsafe_math: true,
                        unsafe_methods: true,
                        passes: 3
                    },
                    mangle: {
                        toplevel: true,
                        safari10: true
                    },
                    format: {
                        comments: false,
                        ecma: 2020
                    },
                    ecma: 2020,
                    toplevel: true
                });
                
                if (result.error) {
                    throw result.error;
                }
                
                const outputPath = this.getOutputPath(file);
                await fs.writeFile(outputPath, result.code);
                
                const minifiedSize = Buffer.byteLength(result.code, 'utf8');
                const saved = originalSize - minifiedSize;
                const savings = ((saved / originalSize) * 100).toFixed(1);
                
                this.stats.js.files++;
                this.stats.js.originalSize += originalSize;
                this.stats.js.minifiedSize += minifiedSize;
                
                console.log(`  ✅ ${path.basename(file)}: ${this.formatBytes(originalSize)} → ${this.formatBytes(minifiedSize)} (-${savings}%)`);
            } catch (error) {
                this.stats.errors.push(`JS ${path.basename(file)}: ${error.message}`);
                console.log(`  ❌ ${path.basename(file)}: ${error.message}`);
            }
        }
    }

    async minifyCSS() {
        console.log('🎨 Minifying CSS files...');
        
        const cssFiles = await this.findFiles(this.inputDir, ['.css']);
        const cleanCSS = new CleanCSS({
            level: 2,
            returnPromise: true,
            inline: ['remote'],
            rebase: false
        });
        
        for (const file of cssFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const originalSize = Buffer.byteLength(content, 'utf8');
                
                const result = await cleanCSS.minify(content);
                
                if (result.errors.length > 0) {
                    throw new Error(result.errors.join(', '));
                }
                
                const outputPath = this.getOutputPath(file);
                await fs.writeFile(outputPath, result.styles);
                
                const minifiedSize = Buffer.byteLength(result.styles, 'utf8');
                const saved = originalSize - minifiedSize;
                const savings = ((saved / originalSize) * 100).toFixed(1);
                
                this.stats.css.files++;
                this.stats.css.originalSize += originalSize;
                this.stats.css.minifiedSize += minifiedSize;
                
                console.log(`  ✅ ${path.basename(file)}: ${this.formatBytes(originalSize)} → ${this.formatBytes(minifiedSize)} (-${savings}%)`);
                
                if (result.warnings.length > 0) {
                    console.log(`  ⚠️  Warnings: ${result.warnings.join(', ')}`);
                }
            } catch (error) {
                this.stats.errors.push(`CSS ${path.basename(file)}: ${error.message}`);
                console.log(`  ❌ ${path.basename(file)}: ${error.message}`);
            }
        }
    }

    async minifyHTML() {
        console.log('📰 Minifying HTML files...');
        
        const htmlFiles = await this.findFiles(this.inputDir, ['.html']);
        
        const options = {
            caseSensitive: false,
            collapseBooleanAttributes: true,
            collapseInlineTagWhitespace: false,
            collapseWhitespace: true,
            conservativeCollapse: false,
            decodeEntities: false,
            html5: true,
            includeAutoGeneratedTags: true,
            keepClosingSlash: false,
            minifyCSS: true,
            minifyJS: true,
            minifyURLs: false,
            preserveLineBreaks: false,
            preventAttributesEscaping: false,
            processConditionalComments: false,
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeEmptyElements: false,
            removeOptionalTags: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeTagWhitespace: false,
            sortAttributes: true,
            sortClassName: true,
            trimCustomFragments: true,
            useShortDoctype: true
        };
        
        for (const file of htmlFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const originalSize = Buffer.byteLength(content, 'utf8');
                
                const result = await htmlMinifier.minify(content, options);
                
                const outputPath = this.getOutputPath(file);
                await fs.writeFile(outputPath, result);
                
                const minifiedSize = Buffer.byteLength(result, 'utf8');
                const saved = originalSize - minifiedSize;
                const savings = ((saved / originalSize) * 100).toFixed(1);
                
                this.stats.html.files++;
                this.stats.html.originalSize += originalSize;
                this.stats.html.minifiedSize += minifiedSize;
                
                console.log(`  ✅ ${path.basename(file)}: ${this.formatBytes(originalSize)} → ${this.formatBytes(minifiedSize)} (-${savings}%)`);
            } catch (error) {
                this.stats.errors.push(`HTML ${path.basename(file)}: ${error.message}`);
                console.log(`  ❌ ${path.basename(file)}: ${error.message}`);
            }
        }
    }

    async optimizeJSON() {
        console.log('📋 Optimizing JSON files...');
        
        const jsonFiles = await this.findFiles(this.inputDir, ['.json']);
        
        for (const file of jsonFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const originalSize = Buffer.byteLength(content, 'utf8');
                
                const parsed = JSON.parse(content);
                const minified = JSON.stringify(parsed);
                
                const outputPath = this.getOutputPath(file);
                await fs.writeFile(outputPath, minified);
                
                const minifiedSize = Buffer.byteLength(minified, 'utf8');
                const saved = originalSize - minifiedSize;
                const savings = ((saved / originalSize) * 100).toFixed(1);
                
                console.log(`  ✅ ${path.basename(file)}: ${this.formatBytes(originalSize)} → ${this.formatBytes(minifiedSize)} (-${savings}%)`);
            } catch (error) {
                this.stats.errors.push(`JSON ${path.basename(file)}: ${error.message}`);
                console.log(`  ❌ ${path.basename(file)}: ${error.message}`);
            }
        }
    }

    async findFiles(dir, extensions) {
        const files = [];
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                const subFiles = await this.findFiles(fullPath, extensions);
                files.push(...subFiles);
            } else if (extensions.includes(path.extname(entry.name))) {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    getOutputPath(inputPath) {
        if (this.inputDir === this.outputDir) {
            return inputPath;
        }
        
        const relativePath = path.relative(this.inputDir, inputPath);
        return path.join(this.outputDir, relativePath);
    }

    printStats() {
        const totalOriginal = this.stats.js.originalSize + this.stats.css.originalSize + this.stats.html.originalSize;
        const totalMinified = this.stats.js.minifiedSize + this.stats.css.minifiedSize + this.stats.html.minifiedSize;
        const totalSaved = totalOriginal - totalMinified;
        const totalSavings = totalOriginal > 0 ? ((totalSaved / totalOriginal) * 100).toFixed(1) : 0;
        
        console.log('\\n📊 Minification Summary:');
        console.log(`  📄 JavaScript: ${this.stats.js.files} files, ${this.formatBytes(this.stats.js.originalSize - this.stats.js.minifiedSize)} saved`);
        console.log(`  🎨 CSS: ${this.stats.css.files} files, ${this.formatBytes(this.stats.css.originalSize - this.stats.css.minifiedSize)} saved`);
        console.log(`  📰 HTML: ${this.stats.html.files} files, ${this.formatBytes(this.stats.html.originalSize - this.stats.html.minifiedSize)} saved`);
        console.log(`  💾 Total saved: ${this.formatBytes(totalSaved)} (-${totalSavings}%)`);
        
        if (this.stats.errors.length > 0) {
            console.log(`\\n⚠️  Errors (${this.stats.errors.length}):`);
            this.stats.errors.forEach(error => console.log(`    - ${error}`));
        }
        
        console.log('\\n✨ Asset minification complete!');
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Run minification
if (require.main === module) {
    const minifier = new AssetMinifier();
    minifier.run();
}

module.exports = AssetMinifier;