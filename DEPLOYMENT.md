# AWS Amplify Deployment Guide
## Helping Hands WordPress Site

### 🎉 Deployment Status: SUCCESS!

Your WordPress build has been successfully deployed on AWS Amplify. This guide will help you complete the setup.

## 📋 Current Status

✅ **Build Completed Successfully**
✅ **Assets Compiled** (CSS, SCSS)
✅ **Repository Connected** to AWS Amplify
✅ **Environment Variables** properly configured
✅ **Error Handling** implemented

## 🔧 Next Steps for WordPress Setup

### 1. **Configure AWS Resources**

#### RDS Database (Production)
```bash
# Create RDS MySQL instance
aws rds create-db-instance \
  --db-instance-identifier helping-hands-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password [YOUR_PASSWORD] \
  --allocated-storage 20 \
  --db-name helping_hands_prod
```

#### S3 Bucket for Media
```bash
# Create S3 bucket for WordPress uploads
aws s3api create-bucket \
  --bucket helping-hands-media \
  --region us-east-1
```

#### CloudFront Distribution
```bash
# Create CloudFront distribution for CDN
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### 2. **Environment Variables in AWS Amplify**

Go to AWS Amplify Console → Your App → Environment Variables and add:

```
# WordPress Config
WP_SITE_URL=https://your-domain.com
WP_ADMIN_USER=admin
WP_ADMIN_PASSWORD=secure_password_here
WP_ADMIN_EMAIL=admin@your-domain.com

# Database
DB_HOST=your-rds-endpoint.amazonaws.com
DB_NAME=helping_hands_prod
DB_USER=admin
DB_PASSWORD=your_db_password

# AWS Services
AWS_S3_BUCKET=helping-hands-media
AWS_CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id
AWS_REGION=us-east-1

# Security Keys (Generate at https://api.wordpress.org/secret-key/1.1/salt/)
AUTH_KEY=your-auth-key-here
SECURE_AUTH_KEY=your-secure-auth-key-here
LOGGED_IN_KEY=your-logged-in-key-here
NONCE_KEY=your-nonce-key-here
AUTH_SALT=your-auth-salt-here
SECURE_AUTH_SALT=your-secure-auth-salt-here
LOGGED_IN_SALT=your-logged-in-salt-here
NONCE_SALT=your-nonce-salt-here
```

### 3. **WordPress Installation Options**

#### Option A: Docker Local Development
```bash
# Clone the repository
git clone https://github.com/contentkingpins/patientadvocates.git
cd patientadvocates

# Copy environment file
cp build/env.example build/.env

# Edit environment variables
nano build/.env

# Start Docker containers
npm run docker:up

# Install WordPress
npm run wp:setup

# Install plugins
npm run wp:plugins
```

#### Option B: Cloud WordPress Installation
For production deployment, you'll need to:

1. **Set up a WordPress hosting service** (AWS EC2, AWS Lightsail, or managed WordPress hosting)
2. **Configure the database** connection to your RDS instance
3. **Upload theme files** from the `theme/` directory
4. **Import ACF fields** from `theme/acf-provider-fields.json`
5. **Import Gravity Forms** from `forms/gravity-forms-export.json`
6. **Install and configure plugins** using the list in `build/plugins-setup.sh`

### 4. **Domain and SSL Setup**

#### Custom Domain
1. Go to AWS Amplify Console → Your App → Domain Management
2. Add your custom domain
3. Configure DNS records as instructed

#### SSL Certificate
AWS Amplify automatically provides SSL certificates for your domain.

### 5. **Performance Optimization**

#### Enable Caching
```bash
# CloudFront caching is configured in amplify.yml
# S3 static assets are automatically cached
```

#### Plugin Configuration
- **WP Rocket**: Configure caching settings
- **Autoptimize**: Enable CSS/JS optimization
- **WP Offload Media**: Connect to S3 bucket

### 6. **Security Setup**

#### Plugin Security
- **Wordfence**: Configure firewall rules
- **SSL enforcement**: Ensure HTTPS redirects
- **Security headers**: Configure in server settings

#### Database Security
- Restrict RDS access to specific IP ranges
- Use strong passwords
- Enable encryption at rest

### 7. **Content Import**

#### Provider Directory
1. Import ACF field groups
2. Create provider post types
3. Configure FacetWP templates

#### Forms Setup
1. Import Gravity Forms
2. Configure HIPAA compliance
3. Set up form notifications

### 8. **Monitoring and Maintenance**

#### AWS CloudWatch
- Monitor application performance
- Set up alerts for errors
- Track resource usage

#### Backup Strategy
- RDS automated backups
- S3 versioning for media files
- UpdraftPlus for WordPress backups

## 🚀 Going Live Checklist

- [ ] RDS database configured
- [ ] S3 bucket created and configured
- [ ] CloudFront distribution set up
- [ ] Environment variables configured in Amplify
- [ ] WordPress installed and configured
- [ ] Plugins installed and licensed
- [ ] Theme customized and tested
- [ ] Forms imported and tested
- [ ] Domain pointed to Amplify
- [ ] SSL certificate active
- [ ] Security measures in place
- [ ] Monitoring configured
- [ ] Backups scheduled

## 📞 Support Resources

- **AWS Amplify Documentation**: https://docs.aws.amazon.com/amplify/
- **WordPress Documentation**: https://wordpress.org/support/
- **Repository Issues**: https://github.com/contentkingpins/patientadvocates/issues

## 🔄 Continuous Deployment

Every push to the `main` branch will trigger:
1. Build process (CSS compilation, asset optimization)
2. Deployment to AWS Amplify
3. Cache invalidation (if CloudFront configured)
4. Environment-specific configurations

---

**Deployment Date**: {{ DATE }}
**Build Status**: ✅ SUCCESS
**Repository**: https://github.com/contentkingpins/patientadvocates 