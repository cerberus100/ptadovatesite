#!/bin/bash

# ============================================
# Helping Hands AWS Deployment Script
# ============================================

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment file exists
if [ ! -f "../env.example" ]; then
    log_error "Environment file not found. Please create a .env file based on env.example"
    exit 1
fi

# Load environment variables
log_info "Loading environment variables..."
source ../env.example

# Validate required AWS variables
required_vars=(
    "AWS_REGION"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "AWS_S3_BUCKET"
    "AWS_CLOUDFRONT_DISTRIBUTION_ID"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        log_error "Required environment variable $var is not set"
        exit 1
    fi
done

# Parse command line arguments
DEPLOY_TYPE=${1:-"staging"}
SKIP_BUILD=${2:-false}

log_info "Starting AWS deployment for environment: $DEPLOY_TYPE"

# Set environment-specific variables
case $DEPLOY_TYPE in
    "production")
        export APP_ENV=production
        export WP_SITE_URL="https://helpinghands.com"
        export S3_BUCKET_PATH="production"
        ;;
    "staging")
        export APP_ENV=staging
        export WP_SITE_URL="https://staging.helpinghands.com"
        export S3_BUCKET_PATH="staging"
        ;;
    *)
        export APP_ENV=development
        export WP_SITE_URL="https://dev.helpinghands.com"
        export S3_BUCKET_PATH="development"
        ;;
esac

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    log_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
log_info "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    log_error "AWS credentials not configured properly"
    exit 1
fi

log_success "AWS credentials verified"

# Build assets if not skipped
if [ "$SKIP_BUILD" != "true" ]; then
    log_info "Building WordPress assets..."
    
    # Navigate to project root
    cd ..
    
    # Install dependencies
    log_info "Installing npm dependencies..."
    npm install
    
    # Build CSS and optimize images
    log_info "Building CSS and optimizing assets..."
    npm run build
    
    # Navigate back to build directory
    cd build
    
    log_success "Assets built successfully"
else
    log_info "Skipping asset build"
fi

# Create S3 bucket if it doesn't exist
log_info "Checking S3 bucket: $AWS_S3_BUCKET"
if ! aws s3api head-bucket --bucket "$AWS_S3_BUCKET" 2>/dev/null; then
    log_info "Creating S3 bucket: $AWS_S3_BUCKET"
    aws s3api create-bucket \
        --bucket "$AWS_S3_BUCKET" \
        --region "$AWS_REGION" \
        --create-bucket-configuration LocationConstraint="$AWS_REGION"
    
    # Configure bucket for website hosting
    aws s3api put-bucket-website \
        --bucket "$AWS_S3_BUCKET" \
        --website-configuration file://aws-s3-website-config.json
    
    log_success "S3 bucket created and configured"
else
    log_info "S3 bucket already exists"
fi

# Sync WordPress files to S3
log_info "Syncing WordPress files to S3..."

# Sync theme files
aws s3 sync ../theme/ s3://$AWS_S3_BUCKET/$S3_BUCKET_PATH/wp-content/themes/helpinghands/ \
    --exclude "*.scss" \
    --exclude "node_modules/*" \
    --exclude ".git/*" \
    --delete

# Sync built assets
aws s3 sync ../assets/ s3://$AWS_S3_BUCKET/$S3_BUCKET_PATH/wp-content/themes/helpinghands/assets/ \
    --exclude "scss/*" \
    --exclude "*.map" \
    --delete

# Sync plugins directory
if [ -d "wp-content/plugins" ]; then
    aws s3 sync wp-content/plugins/ s3://$AWS_S3_BUCKET/$S3_BUCKET_PATH/wp-content/plugins/ \
        --exclude "*.log" \
        --exclude "cache/*" \
        --delete
fi

# Sync uploads directory if it exists
if [ -d "wp-content/uploads" ]; then
    aws s3 sync wp-content/uploads/ s3://$AWS_S3_BUCKET/$S3_BUCKET_PATH/wp-content/uploads/ \
        --delete
fi

log_success "Files synced to S3"

# Update CloudFront distribution
log_info "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
    --distribution-id "$AWS_CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*"

log_success "CloudFront cache invalidated"

# Deploy to AWS Amplify if app ID is provided
if [ -n "$AWS_APP_ID" ]; then
    log_info "Deploying to AWS Amplify..."
    
    # Create a deployment
    aws amplify start-job \
        --app-id "$AWS_APP_ID" \
        --branch-name "$AWS_BRANCH_NAME" \
        --job-type RELEASE
    
    log_success "Amplify deployment started"
    
    # Wait for deployment to complete
    log_info "Waiting for deployment to complete..."
    aws amplify get-job \
        --app-id "$AWS_APP_ID" \
        --branch-name "$AWS_BRANCH_NAME" \
        --job-id $(aws amplify start-job --app-id "$AWS_APP_ID" --branch-name "$AWS_BRANCH_NAME" --job-type RELEASE --query 'jobSummary.jobId' --output text)
        
    log_success "Amplify deployment completed"
fi

# Run WordPress setup on production if specified
if [ "$DEPLOY_TYPE" = "production" ] && [ "$3" = "setup" ]; then
    log_info "Running WordPress setup on production..."
    
    # This would typically involve connecting to your production server
    # and running the setup script with production database credentials
    log_warning "Production setup requires manual configuration of database and WordPress installation"
fi

# Final deployment summary
log_success "=== DEPLOYMENT SUMMARY ==="
log_success "Environment: $APP_ENV"
log_success "Site URL: $WP_SITE_URL"
log_success "S3 Bucket: $AWS_S3_BUCKET/$S3_BUCKET_PATH"
log_success "CloudFront Distribution: $AWS_CLOUDFRONT_DISTRIBUTION_ID"

if [ -n "$AWS_APP_ID" ]; then
    log_success "Amplify App: $AWS_APP_ID"
fi

log_success "Deployment completed successfully!"

# Print next steps
log_info "=== NEXT STEPS ==="
log_info "1. Update DNS records to point to CloudFront distribution"
log_info "2. Configure SSL certificates in AWS Certificate Manager"
log_info "3. Set up monitoring and logging"
log_info "4. Configure WordPress database with production credentials"
log_info "5. Run WordPress setup script on production server"

exit 0 