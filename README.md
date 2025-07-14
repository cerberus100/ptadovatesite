# Helping Hands WordPress Site - Enhanced AWS Setup

A comprehensive WordPress build stack for the "Helping Hands" wound care advocacy site with Docker development environment and AWS Amplify deployment support.

## 🚀 Features

### Core WordPress Stack
- **Docker Environment**: nginx 1.25, PHP 8.3-fpm, MariaDB 10.11, Redis 7
- **WordPress 6.6** with GeneratePress child theme "HelpingHands"
- **Premium Plugins**: Yoast SEO, ACF PRO, Gravity Forms, FacetWP, MemberPress, WP Rocket
- **Custom Post Types**: Provider directory with wound_types taxonomy
- **Interactive Body Map**: SVG-based wound location selection
- **Admin Dashboard**: Request management system

### AWS Cloud Integration
- **AWS Amplify**: Automated deployment pipeline
- **S3 Storage**: Media files and static assets
- **CloudFront CDN**: Global content delivery
- **RDS Database**: Production database hosting
- **ElastiCache**: Redis caching in production
- **SES Email**: Professional email delivery

## 📁 Project Structure

```
ptadvocatesite/
├── build/                          # Docker & deployment configs
│   ├── docker-compose.yml         # Enhanced Docker setup
│   ├── env.example                # Environment variables template
│   ├── setup.sh                   # WordPress installation script
│   ├── plugins-setup.sh           # Plugin installation & AWS config
│   ├── aws-deploy.sh              # AWS deployment script
│   ├── aws-s3-website-config.json # S3 website configuration
│   ├── nginx/                     # Nginx configuration
│   ├── php/                       # PHP configuration
│   └── wp-config-extra.php        # WordPress configuration
├── theme/                          # WordPress theme files
│   ├── functions.php              # Custom functions & post types
│   ├── acf-provider-fields.json   # ACF field definitions
│   └── facetwp-provider-template.php # Provider directory template
├── assets/                         # Frontend assets
│   ├── css/                       # Compiled CSS
│   └── scss/                      # SCSS source files
├── forms/                          # Form configurations
│   └── gravity-forms-export.json  # Patient & provider forms
├── wp-content/                     # WordPress content
│   └── plugins/                   # Custom plugins
├── amplify.yml                     # AWS Amplify build spec
├── package.json                    # Build scripts & dependencies
└── README.md                       # This file
```

## 🛠️ Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 16+ & npm 8+
- AWS CLI (for cloud deployment)
- Git

### 1. Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd ptadvocatesite

# Copy environment configuration
cp build/env.example build/.env

# Edit environment variables
nano build/.env

# Install npm dependencies
npm install

# Start Docker containers
npm run docker:up

# Install WordPress
npm run wp:setup

# Install and configure plugins
npm run wp:plugins

# Build assets
npm run build
```

### 2. AWS Amplify Setup

```bash
# Configure AWS credentials
aws configure

# Update AWS variables in build/.env
nano build/.env

# Deploy to AWS
cd build
./aws-deploy.sh production

# Or use npm scripts
npm run aws:deploy
```

## 🔧 Configuration

### Environment Variables

Copy `build/env.example` to `build/.env` and configure:

#### WordPress Settings
```bash
WP_SITE_URL=http://localhost
WP_ADMIN_USER=admin
WP_ADMIN_PASSWORD=admin123!
WP_ADMIN_EMAIL=admin@helpinghands.com
```

#### Database Settings
```bash
DB_NAME=helping_hands
DB_USER=wp_user
DB_PASSWORD=wp_secure_password_2024!
DB_HOST=mariadb
```

#### AWS Configuration
```bash
AWS_REGION=us-east-1
AWS_S3_BUCKET=helping-hands-media
AWS_CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Premium Plugin Licenses

Add license keys to environment file:
```bash
YOAST_LICENSE_KEY=your-yoast-license-key
ACF_PRO_LICENSE_KEY=your-acf-pro-license-key
GRAVITY_FORMS_LICENSE_KEY=your-gravity-forms-license-key
MEMBERPRESS_LICENSE_KEY=your-memberpress-license-key
WP_ROCKET_LICENSE_KEY=your-wp-rocket-license-key
FACETWP_LICENSE_KEY=your-facetwp-license-key
```

## 🐳 Docker Commands

```bash
# Start containers
npm run docker:up

# Stop containers
npm run docker:down

# View logs
npm run docker:logs

# Rebuild containers
npm run docker:build
```

## ☁️ AWS Deployment

### Initial Setup

1. **Create AWS Resources**:
   - S3 bucket for media storage
   - CloudFront distribution
   - RDS database (production)
   - ElastiCache cluster (production)
   - SES email configuration

2. **Configure Amplify**:
   - Connect your Git repository
   - Set environment variables
   - Configure build settings

### Deployment Commands

```bash
# Deploy to staging
./build/aws-deploy.sh staging

# Deploy to production
./build/aws-deploy.sh production

# Deploy with custom build
./build/aws-deploy.sh production false

# Skip build and deploy
./build/aws-deploy.sh staging true
```

## 📦 Build Scripts

```bash
# Build all assets
npm run build

# Build CSS only
npm run build-css

# Watch for changes
npm run watch

# Optimize images
npm run images:optimize

# AWS deployment
npm run aws:deploy
```

## 🔌 Plugins & Features

### Core Plugins
- **Yoast SEO**: SEO optimization
- **Advanced Custom Fields PRO**: Custom fields
- **Gravity Forms**: Patient & provider forms
- **FacetWP**: Provider directory search
- **MemberPress**: Membership management
- **WP Rocket**: Performance optimization

### AWS Plugins
- **WP Offload Media**: S3 media storage
- **WP SES**: Email delivery via Amazon SES
- **Cloudflare**: CDN integration
- **Autoptimize**: Asset optimization

### Custom Features
- **Provider Directory**: Search by location, specialty, wound type
- **Interactive Body Map**: SVG-based wound selection
- **Patient Forms**: HIPAA-compliant assistance requests
- **Admin Dashboard**: Request management system

## 🎨 Theme Customization

### Color Palette
- **Navy**: #26547C (Primary)
- **Teal**: #46B5A4 (Secondary)
- **Coral**: #FF6B5D (Accent)
- **White**: #FFFFFF (Background)

### SCSS Structure
```scss
assets/scss/
├── style.scss          # Main stylesheet
├── _variables.scss     # Colors, fonts, spacing
└── _buttons.scss       # Button styles
```

### Custom Post Types
- **Provider**: Healthcare provider profiles
- **Wound Types**: Taxonomy for wound classifications

## 🔒 Security Features

- **Wordfence Security**: Firewall and malware scanning
- **Security Headers**: CSP, HSTS, X-Frame-Options
- **HIPAA Compliance**: Secure form handling
- **Environment Variables**: Secure configuration
- **SSL/TLS**: Enforced HTTPS

## 📊 Performance Optimization

### Caching Strategy
- **Redis**: Object caching
- **WP Rocket**: Page caching
- **CloudFront**: CDN caching
- **OpCache**: PHP bytecode caching

### Asset Optimization
- **Autoptimize**: CSS/JS minification
- **Image Optimization**: Compressed media files
- **GZIP Compression**: Server-level compression
- **CDN Integration**: Global asset delivery

## 🚀 Deployment Environments

### Local Development
- Docker containers
- Debug mode enabled
- Hot reloading
- Database adminer

### Staging
- AWS infrastructure
- Production-like environment
- Testing database
- Limited access

### Production
- Full AWS stack
- Performance optimizations
- Monitoring enabled
- Backup automation

## 📋 Maintenance

### Regular Tasks
- **Plugin Updates**: Monthly security updates
- **Database Backups**: Daily automated backups
- **Security Scans**: Weekly vulnerability checks
- **Performance Monitoring**: Continuous optimization

### Troubleshooting
- Check Docker logs: `npm run docker:logs`
- WordPress debug log: `wp-content/debug.log`
- AWS CloudWatch: Monitor application metrics
- Database queries: Use Query Monitor plugin

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the GPL-2.0-or-later license.

## 🆘 Support

- **Documentation**: See individual plugin documentation
- **AWS Support**: AWS documentation and support
- **WordPress Support**: WordPress.org forums
- **Issues**: GitHub issues for project-specific problems

---

Built with ❤️ for the Helping Hands wound care advocacy community. # patientadvocates
