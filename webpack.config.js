/**
 * Webpack Configuration for Helping Hands Patient Advocates
 * Implements code splitting, asset optimization, and performance features
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    mode: isProduction ? 'production' : 'development',
    
    entry: {
        // Main bundle
        main: './assets/js/main.js',
        
        // Separate bundle for performance features
        performance: './assets/js/performance.js',
        
        // Lazy loading as separate chunk
        'lazy-loading': './assets/js/lazy-loading.js',
        
        // Admin bundle (only loaded on admin pages)
        admin: './admin/admin.js'
    },
    
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: isProduction ? '[name].[contenthash].js' : '[name].js',
        chunkFilename: isProduction ? '[name].[contenthash].chunk.js' : '[name].chunk.js',
        clean: true,
        publicPath: '/'
    },
    
    optimization: {
        minimize: isProduction,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: isProduction,
                        drop_debugger: isProduction
                    },
                    format: {
                        comments: false
                    }
                },
                extractComments: false
            }),
            new CssMinimizerPlugin()
        ],
        
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                // Vendor libraries
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                    priority: 10
                },
                
                // Common code shared across pages
                common: {
                    name: 'common',
                    minChunks: 2,
                    chunks: 'all',
                    priority: 5,
                    reuseExistingChunk: true
                },
                
                // CSS files
                styles: {
                    name: 'styles',
                    type: 'css/mini-extract',
                    chunks: 'all',
                    enforce: true
                }
            }
        },
        
        runtimeChunk: {
            name: 'runtime'
        }
    },
    
    module: {
        rules: [
            // JavaScript
            {
                test: /\\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                targets: {
                                    browsers: ['> 1%', 'last 2 versions', 'not ie <= 11']
                                },
                                useBuiltIns: 'usage',
                                corejs: 3
                            }]
                        ],
                        plugins: [
                            '@babel/plugin-syntax-dynamic-import',
                            '@babel/plugin-proposal-class-properties'
                        ]
                    }
                }
            },
            
            // SCSS/CSS
            {
                test: /\\.(scss|css)$/,
                use: [
                    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: !isProduction
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    ['autoprefixer'],
                                    ...(isProduction ? [['cssnano', { preset: 'default' }]] : [])
                                ]
                            }
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: !isProduction
                        }
                    }
                ]
            },
            
            // Images
            {
                test: /\\.(png|jpe?g|gif|svg|webp)$/i,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 8192 // 8kb
                    }
                },
                generator: {
                    filename: 'assets/images/[name].[hash][ext]'
                }
            },
            
            // Fonts
            {
                test: /\\.(woff2?|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/fonts/[name].[hash][ext]'
                }
            }
        ]
    },
    
    plugins: [
        // Clean dist folder
        new CleanWebpackPlugin(),
        
        // Extract CSS
        ...(isProduction ? [
            new MiniCssExtractPlugin({
                filename: '[name].[contenthash].css',
                chunkFilename: '[name].[contenthash].css'
            })
        ] : []),
        
        // HTML pages
        new HtmlWebpackPlugin({
            template: './index.html',
            filename: 'index.html',
            chunks: ['runtime', 'vendors', 'common', 'main', 'performance'],
            minify: isProduction
        }),
        
        new HtmlWebpackPlugin({
            template: './about.html',
            filename: 'about.html',
            chunks: ['runtime', 'vendors', 'common', 'main'],
            minify: isProduction
        }),
        
        new HtmlWebpackPlugin({
            template: './financial-help/index.html',
            filename: 'financial-help/index.html',
            chunks: ['runtime', 'vendors', 'common', 'main'],
            minify: isProduction
        }),
        
        new HtmlWebpackPlugin({
            template: './admin/dashboard.html',
            filename: 'admin/dashboard.html',
            chunks: ['runtime', 'vendors', 'common', 'admin'],
            minify: isProduction
        }),
        
        // Gzip compression
        ...(isProduction ? [
            new CompressionPlugin({
                algorithm: 'gzip',
                test: /\\.(js|css|html|svg)$/,
                threshold: 8192,
                minRatio: 0.8
            })
        ] : []),
        
        // Service Worker
        ...(isProduction ? [
            new WorkboxPlugin.GenerateSW({
                clientsClaim: true,
                skipWaiting: true,
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
                runtimeCaching: [
                    {
                        urlPattern: /\\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
                            }
                        }
                    },
                    {
                        urlPattern: /\\.(?:js|css)$/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'static-resources'
                        }
                    }
                ]
            })
        ] : [])
    ],
    
    // Development server
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist')
        },
        compress: true,
        port: 3000,
        hot: true,
        open: true,
        historyApiFallback: true
    },
    
    // Source maps
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    
    // Performance hints
    performance: {
        hints: isProduction ? 'warning' : false,
        maxEntrypointSize: 250000,
        maxAssetSize: 250000
    },
    
    // Resolve
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'assets'),
            '@components': path.resolve(__dirname, 'assets/js/components'),
            '@utils': path.resolve(__dirname, 'assets/js/utils')
        }
    }
};

// Image optimization plugin for production
if (isProduction) {
    module.exports.plugins.push(
        new ImageMinimizerPlugin({
            minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                    plugins: [
                        ['imagemin-mozjpeg', { quality: 80 }],
                        ['imagemin-pngquant', { quality: [0.6, 0.8] }],
                        ['imagemin-svgo', {
                            plugins: [
                                {
                                    name: 'preset-default',
                                    params: {
                                        overrides: {
                                            removeViewBox: false
                                        }
                                    }
                                }
                            ]
                        }],
                        ['imagemin-webp', { quality: 75 }]
                    ]
                }
            }
        })
    );
}