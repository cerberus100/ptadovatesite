/**
 * Image Optimization Script
 * Converts images to WebP format and optimizes file sizes
 */

const fs = require('fs').promises;
const path = require('path');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const imageminWebp = require('imagemin-webp');

class ImageOptimizer {
    constructor() {
        this.inputDir = 'assets/images';
        this.outputDir = 'assets/images/optimized';
        this.webpDir = 'assets/images/webp';
        this.stats = {
            processed: 0,
            saved: 0,
            errors: []
        };
    }

    async run() {
        console.log('🖼️  Starting image optimization...');
        
        try {
            await this.ensureDirectories();
            await this.optimizeImages();
            await this.generateWebP();
            await this.generateResponsiveImages();
            this.printStats();
        } catch (error) {
            console.error('❌ Image optimization failed:', error);
            process.exit(1);
        }
    }

    async ensureDirectories() {
        const dirs = [this.outputDir, this.webpDir, `${this.outputDir}/responsive`];
        
        for (const dir of dirs) {
            try {
                await fs.access(dir);
            } catch {
                await fs.mkdir(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        }
    }

    async optimizeImages() {
        console.log('🔧 Optimizing images...');
        
        try {
            const files = await imagemin([`${this.inputDir}/*.{jpg,jpeg,png,svg}`], {
                destination: this.outputDir,
                plugins: [
                    imageminMozjpeg({
                        quality: 80,
                        progressive: true
                    }),
                    imageminPngquant({
                        quality: [0.6, 0.8]
                    }),
                    imageminSvgo({
                        plugins: [
                            {
                                name: 'preset-default',
                                params: {
                                    overrides: {
                                        removeViewBox: false,
                                        cleanupIDs: false
                                    }
                                }
                            }
                        ]
                    })
                ]
            });

            this.stats.processed += files.length;
            
            for (const file of files) {
                const originalPath = file.sourcePath;
                const optimizedPath = file.destinationPath;
                
                const originalSize = (await fs.stat(originalPath)).size;
                const optimizedSize = (await fs.stat(optimizedPath)).size;
                const saved = originalSize - optimizedSize;
                
                this.stats.saved += saved;
                
                console.log(`  ✅ ${path.basename(originalPath)}: ${this.formatBytes(originalSize)} → ${this.formatBytes(optimizedSize)} (${this.formatBytes(saved)} saved)`);
            }
        } catch (error) {
            this.stats.errors.push(`Image optimization: ${error.message}`);
        }
    }

    async generateWebP() {
        console.log('🔄 Generating WebP versions...');
        
        try {
            const files = await imagemin([`${this.inputDir}/*.{jpg,jpeg,png}`], {
                destination: this.webpDir,
                plugins: [
                    imageminWebp({
                        quality: 75,
                        method: 6 // Best compression
                    })
                ]
            });

            for (const file of files) {
                const originalSize = (await fs.stat(file.sourcePath)).size;
                const webpSize = (await fs.stat(file.destinationPath)).size;
                const saved = originalSize - webpSize;
                
                console.log(`  ✅ ${path.basename(file.sourcePath)} → WebP: ${this.formatBytes(originalSize)} → ${this.formatBytes(webpSize)} (${this.formatBytes(saved)} saved)`);
            }
        } catch (error) {
            this.stats.errors.push(`WebP generation: ${error.message}`);
        }
    }

    async generateResponsiveImages() {
        console.log('📱 Generating responsive image variants...');
        
        const sizes = [320, 640, 960, 1280, 1920];
        
        try {
            // This would require additional libraries like sharp for resizing
            // For now, we'll just log the intended functionality
            console.log(`  📋 Would generate ${sizes.length} responsive variants for each image`);
            console.log(`  📏 Sizes: ${sizes.join('w, ')}w`);
            
            // Implementation would involve:
            // - Loading each optimized image
            // - Resizing to each target width
            // - Saving with size suffix (e.g., image-640w.jpg)
            // - Generating WebP versions of each size
        } catch (error) {
            this.stats.errors.push(`Responsive images: ${error.message}`);
        }
    }

    printStats() {
        console.log('\\n📊 Optimization Summary:');
        console.log(`  📁 Images processed: ${this.stats.processed}`);
        console.log(`  💾 Total space saved: ${this.formatBytes(this.stats.saved)}`);
        
        if (this.stats.errors.length > 0) {
            console.log(`  ⚠️  Errors: ${this.stats.errors.length}`);
            this.stats.errors.forEach(error => console.log(`    - ${error}`));
        }
        
        console.log('\\n✨ Image optimization complete!');
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Run optimization
if (require.main === module) {
    const optimizer = new ImageOptimizer();
    optimizer.run();
}

module.exports = ImageOptimizer;