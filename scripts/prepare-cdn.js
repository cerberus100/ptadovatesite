/**
 * CDN Preparation Script
 * Prepares assets for CDN deployment with optimization and cache headers
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const brotli = promisify(zlib.brotliCompress);

class CDNPreparer {
    constructor() {
        this.distDir = 'dist';
        this.cdnDir = 'cdn-ready';
        this.manifestPath = 'cdn-manifest.json';
        this.stats = {
            processed: 0,
            compressed: 0,
            totalSize: 0,
            compressedSize: 0
        };
    }

    async run() {
        console.log('🚀 Preparing assets for CDN deployment...');
        
        try {
            await this.ensureDirectories();
            await this.copyAssets();
            await this.compressAssets();
            await this.generateCacheHeaders();
            await this.createManifest();
            await this.generateCloudFrontConfig();
            this.printStats();
        } catch (error) {
            console.error('❌ CDN preparation failed:', error);
            process.exit(1);
        }
    }

    async ensureDirectories() {
        const dirs = [
            this.cdnDir,
            `${this.cdnDir}/assets`,
            `${this.cdnDir}/assets/css`,
            `${this.cdnDir}/assets/js`,
            `${this.cdnDir}/assets/images`,
            `${this.cdnDir}/compressed`
        ];
        
        for (const dir of dirs) {
            try {
                await fs.access(dir);
            } catch {
                await fs.mkdir(dir, { recursive: true });
            }
        }
    }

    async copyAssets() {
        console.log('📁 Copying assets...');
        
        const sourceDir = this.distDir;
        const targetDir = this.cdnDir;
        
        await this.copyDirectory(sourceDir, targetDir);
    }

    async copyDirectory(source, target) {
        const entries = await fs.readdir(source, { withFileTypes: true });
        
        for (const entry of entries) {
            const sourcePath = path.join(source, entry.name);
            const targetPath = path.join(target, entry.name);
            
            if (entry.isDirectory()) {
                await fs.mkdir(targetPath, { recursive: true });
                await this.copyDirectory(sourcePath, targetPath);
            } else {
                await fs.copyFile(sourcePath, targetPath);
                this.stats.processed++;
                
                const stats = await fs.stat(sourcePath);
                this.stats.totalSize += stats.size;
            }
        }
    }

    async compressAssets() {
        console.log('🗜️  Compressing assets...');
        
        const compressibleExtensions = ['.js', '.css', '.html', '.svg', '.json'];
        const files = await this.findFiles(this.cdnDir, compressibleExtensions);
        
        for (const file of files) {
            await this.compressFile(file);
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

    async compressFile(filePath) {
        const content = await fs.readFile(filePath);
        const originalSize = content.length;
        
        // Generate Gzip version
        const gzipContent = await gzip(content, { level: 9 });
        const gzipPath = `${filePath}.gz`;
        await fs.writeFile(gzipPath, gzipContent);
        
        // Generate Brotli version
        const brotliContent = await brotli(content, {
            params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
                [zlib.constants.BROTLI_PARAM_SIZE_HINT]: content.length
            }
        });
        const brotliPath = `${filePath}.br`;
        await fs.writeFile(brotliPath, brotliContent);
        
        this.stats.compressed++;
        this.stats.compressedSize += Math.min(gzipContent.length, brotliContent.length);
        
        console.log(`  ✅ ${path.basename(filePath)}: ${this.formatBytes(originalSize)} → Gzip: ${this.formatBytes(gzipContent.length)} | Brotli: ${this.formatBytes(brotliContent.length)}`);
    }

    async generateCacheHeaders() {
        console.log('📋 Generating cache header configurations...');
        
        const cacheConfig = {
            // Static assets with versioning - cache for 1 year
            'static_assets': {
                pattern: '/assets/**/*',
                headers: {
                    'Cache-Control': 'public, max-age=31536000, immutable',
                    'Expires': new Date(Date.now() + 31536000000).toUTCString()
                }
            },
            
            // HTML files - cache for 1 hour with revalidation
            'html_files': {
                pattern: '/**/*.html',
                headers: {
                    'Cache-Control': 'public, max-age=3600, must-revalidate',
                    'ETag': true
                }
            },
            
            // API responses - no cache
            'api_responses': {
                pattern: '/api/**/*',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            },
            
            // Images - cache for 30 days
            'images': {
                pattern: '**/*.{jpg,jpeg,png,gif,svg,webp}',
                headers: {
                    'Cache-Control': 'public, max-age=2592000',
                    'Expires': new Date(Date.now() + 2592000000).toUTCString()
                }
            }
        };
        
        await fs.writeFile(
            path.join(this.cdnDir, 'cache-config.json'),
            JSON.stringify(cacheConfig, null, 2)
        );
    }

    async createManifest() {
        console.log('📄 Creating asset manifest...');
        
        const manifest = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            assets: {},
            compressionMap: {},
            cacheHeaders: {}
        };
        
        // Find all assets and generate hashes
        const assetFiles = await this.findFiles(this.cdnDir, ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']);
        
        for (const file of assetFiles) {
            const relativePath = path.relative(this.cdnDir, file);
            const content = await fs.readFile(file);
            const hash = crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
            
            manifest.assets[relativePath] = {
                hash,
                size: content.length,
                lastModified: (await fs.stat(file)).mtime.toISOString()
            };
            
            // Check for compressed versions
            const gzipPath = `${file}.gz`;
            const brotliPath = `${file}.br`;
            
            try {
                await fs.access(gzipPath);
                const gzipSize = (await fs.stat(gzipPath)).size;
                manifest.compressionMap[relativePath] = {
                    ...manifest.compressionMap[relativePath],
                    gzip: { size: gzipSize, path: `${relativePath}.gz` }
                };
            } catch {}
            
            try {
                await fs.access(brotliPath);
                const brotliSize = (await fs.stat(brotliPath)).size;
                manifest.compressionMap[relativePath] = {
                    ...manifest.compressionMap[relativePath],
                    brotli: { size: brotliSize, path: `${relativePath}.br` }
                };
            } catch {}
        }
        
        await fs.writeFile(
            path.join(this.cdnDir, this.manifestPath),
            JSON.stringify(manifest, null, 2)
        );
    }

    async generateCloudFrontConfig() {
        console.log('☁️  Generating CloudFront configuration...');
        
        const cloudFrontConfig = {
            "Comment": "Helping Hands Patient Advocates CDN Configuration",
            "Origins": [
                {
                    "Id": "helping-hands-origin",
                    "DomainName": "helpinghands.com",
                    "CustomOriginConfig": {
                        "HTTPPort": 80,
                        "HTTPSPort": 443,
                        "OriginProtocolPolicy": "https-only",
                        "OriginSslProtocols": {
                            "Quantity": 1,
                            "Items": ["TLSv1.2"]
                        }
                    }
                }
            ],
            "DefaultCacheBehavior": {
                "TargetOriginId": "helping-hands-origin",
                "ViewerProtocolPolicy": "redirect-to-https",
                "Compress": true,
                "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad", // Managed-CachingOptimized
                "ResponseHeadersPolicyId": "67f7725c-6f97-4210-82d7-5512b31e9d03" // Managed-SecurityHeadersPolicy
            },
            "CacheBehaviors": [
                {
                    "PathPattern": "/assets/*",
                    "TargetOriginId": "helping-hands-origin",
                    "ViewerProtocolPolicy": "redirect-to-https",
                    "Compress": true,
                    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6", // Managed-CachingOptimizedForUncompressedObjects
                    "TTL": {
                        "DefaultTTL": 31536000,
                        "MaxTTL": 31536000
                    }
                },
                {
                    "PathPattern": "*.html",
                    "TargetOriginId": "helping-hands-origin",
                    "ViewerProtocolPolicy": "redirect-to-https",
                    "Compress": true,
                    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
                    "TTL": {
                        "DefaultTTL": 3600,
                        "MaxTTL": 86400
                    }
                }
            ],
            "PriceClass": "PriceClass_100",
            "Enabled": true,
            "HttpVersion": "http2",
            "IPV6Enabled": true
        };
        
        await fs.writeFile(
            path.join(this.cdnDir, 'cloudfront-config.json'),
            JSON.stringify(cloudFrontConfig, null, 2)
        );
        
        // Generate deployment script
        const deployScript = `#!/bin/bash
# CloudFront Deployment Script for Helping Hands Patient Advocates

echo "🚀 Deploying to CDN..."

# Upload to S3
aws s3 sync ./cdn-ready s3://helping-hands-cdn --delete --exclude "*.gz" --exclude "*.br"

# Upload compressed versions with proper content encoding
find ./cdn-ready -name "*.gz" | while read file; do
    key="\${file#./cdn-ready/}"
    key="\${key%.gz}"
    aws s3 cp "\$file" "s3://helping-hands-cdn/\$key" --content-encoding gzip
done

find ./cdn-ready -name "*.br" | while read file; do
    key="\${file#./cdn-ready/}"
    key="\${key%.br}"
    aws s3 cp "\$file" "s3://helping-hands-cdn/\$key" --content-encoding br
done

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"

echo "✅ CDN deployment complete!"
`;
        
        await fs.writeFile(path.join(this.cdnDir, 'deploy-cdn.sh'), deployScript);
        await fs.chmod(path.join(this.cdnDir, 'deploy-cdn.sh'), 0o755);
    }

    printStats() {
        const compressionRatio = ((this.stats.totalSize - this.stats.compressedSize) / this.stats.totalSize * 100).toFixed(1);
        
        console.log('\\n📊 CDN Preparation Summary:');
        console.log(`  📁 Files processed: ${this.stats.processed}`);
        console.log(`  🗜️  Files compressed: ${this.stats.compressed}`);
        console.log(`  📦 Original size: ${this.formatBytes(this.stats.totalSize)}`);
        console.log(`  📦 Compressed size: ${this.formatBytes(this.stats.compressedSize)}`);
        console.log(`  💾 Compression ratio: ${compressionRatio}%`);
        console.log(`  📁 CDN-ready files: ${this.cdnDir}/`);
        console.log('\\n✨ CDN preparation complete!');
        console.log('\\n🚀 Next steps:');
        console.log('  1. Review cache-config.json for your CDN settings');
        console.log('  2. Update cloudfront-config.json with your distribution settings');
        console.log('  3. Run deploy-cdn.sh to upload to your CDN');
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Run CDN preparation
if (require.main === module) {
    const preparer = new CDNPreparer();
    preparer.run();
}

module.exports = CDNPreparer;