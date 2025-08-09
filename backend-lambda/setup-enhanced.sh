#!/bin/bash

# Enhanced Backend Setup Script for True North Advocates
# This script helps migrate from basic to enhanced Lambda backend

echo "🚀 True North Advocates - Enhanced Backend Setup"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI found${NC}"

# Function to create parameter if it doesn't exist
create_parameter() {
    local name=$1
    local prompt=$2
    local type=${3:-"SecureString"}
    
    # Check if parameter exists
    if aws ssm get-parameter --name "$name" &> /dev/null; then
        echo -e "${YELLOW}⚠️  Parameter $name already exists, skipping...${NC}"
    else
        echo -e "${GREEN}Creating parameter: $name${NC}"
        read -p "$prompt: " value
        aws ssm put-parameter --name "$name" --value "$value" --type "$type"
        echo -e "${GREEN}✅ Created $name${NC}"
    fi
}

echo ""
echo "📝 Step 1: Setting up AWS Parameters"
echo "------------------------------------"

# Email service
echo -e "${YELLOW}Choose email service:${NC}"
echo "1) SendGrid (recommended)"
echo "2) AWS SES (already configured)"
read -p "Enter choice (1 or 2): " email_choice

if [ "$email_choice" = "1" ]; then
    create_parameter "/tna/prod/SENDGRID_API_KEY" "Enter your SendGrid API key"
fi

# SMS service
echo ""
echo -e "${YELLOW}Choose SMS service:${NC}"
echo "1) Twilio (recommended)"
echo "2) AWS SNS (basic)"
echo "3) Skip SMS setup"
read -p "Enter choice (1, 2, or 3): " sms_choice

if [ "$sms_choice" = "1" ]; then
    create_parameter "/tna/prod/TWILIO_ACCOUNT_SID" "Enter your Twilio Account SID"
    create_parameter "/tna/prod/TWILIO_AUTH_TOKEN" "Enter your Twilio Auth Token"
    create_parameter "/tna/prod/TWILIO_PHONE_NUMBER" "Enter your Twilio phone number (e.g., +1234567890)"
fi

# Admin phone for alerts
create_parameter "/tna/prod/ADMIN_PHONE" "Enter admin phone for urgent alerts (e.g., +1234567890)"

# Encryption key
echo ""
echo -e "${YELLOW}Generating encryption key...${NC}"
ENCRYPTION_KEY=$(openssl rand -base64 32)
aws ssm put-parameter --name "/tna/prod/ENCRYPTION_KEY" --value "$ENCRYPTION_KEY" --type "SecureString" --overwrite
echo -e "${GREEN}✅ Encryption key generated and stored${NC}"

echo ""
echo "📊 Step 2: Creating CloudWatch Log Groups"
echo "-----------------------------------------"

# Create log groups
aws logs create-log-group --log-group-name /aws/lambda/tna-audit-logs 2>/dev/null || echo "Audit log group already exists"
aws logs put-retention-policy --log-group-name /aws/lambda/tna-audit-logs --retention-in-days 2557 # 7 years for HIPAA

echo -e "${GREEN}✅ Log groups configured${NC}"

echo ""
echo "🔧 Step 3: Updating Database Schema"
echo "-----------------------------------"

# Get database URL from parameter store
DB_URL=$(aws ssm get-parameter --name "/tna/prod/DATABASE_URL" --with-decryption --query "Parameter.Value" --output text)

if [ -n "$DB_URL" ]; then
    echo "Creating audit_logs table..."
    
    # Create SQL file
    cat > /tmp/enhance-db.sql << 'EOF'
-- Audit logs table for HIPAA compliance
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    action VARCHAR(255),
    resource VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(45),
    request_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_requests_status ON patient_requests(status);
CREATE INDEX IF NOT EXISTS idx_patient_requests_created ON patient_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_provider_applications_status ON provider_applications(status);
CREATE INDEX IF NOT EXISTS idx_provider_applications_created ON provider_applications(created_at);

-- Add urgency column if missing
ALTER TABLE patient_requests 
ADD COLUMN IF NOT EXISTS urgency VARCHAR(50);

-- Add updated_at column if missing
ALTER TABLE patient_requests 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE provider_applications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patient_requests_updated_at BEFORE UPDATE
    ON patient_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_applications_updated_at BEFORE UPDATE
    ON provider_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EOF

    # Execute SQL
    psql "$DB_URL" -f /tmp/enhance-db.sql
    echo -e "${GREEN}✅ Database schema updated${NC}"
else
    echo -e "${YELLOW}⚠️  Could not get database URL. Please run database updates manually.${NC}"
fi

echo ""
echo "📦 Step 4: Deploying Enhanced Lambda"
echo "------------------------------------"

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Create deployment package
echo "Creating deployment package..."
zip -r enhanced-function.zip enhanced-index.js node_modules/ enhanced-package.json -x "*.git*" "*.md" "*.sh"

# Get Lambda function ARN
FUNCTION_NAME="tna-backend"
FUNCTION_ARN=$(aws lambda get-function --function-name $FUNCTION_NAME --query "Configuration.FunctionArn" --output text 2>/dev/null)

if [ -n "$FUNCTION_ARN" ]; then
    echo "Updating Lambda function..."
    
    # Update function code
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://enhanced-function.zip
    
    # Wait for update to complete
    aws lambda wait function-updated --function-name $FUNCTION_NAME
    
    # Update configuration
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --handler enhanced-index.handler \
        --timeout 30 \
        --memory-size 512 \
        --environment Variables="{NODE_ENV=production}"
    
    echo -e "${GREEN}✅ Lambda function updated${NC}"
else
    echo -e "${RED}❌ Lambda function not found. Please check the function name.${NC}"
fi

echo ""
echo "🌐 Step 5: Adding API Gateway Routes"
echo "------------------------------------"

# Get API Gateway ID
API_ID=$(aws apigatewayv2 get-apis --query "Items[?Name=='tna-api'].ApiId" --output text)

if [ -n "$API_ID" ]; then
    echo "Adding new routes to API Gateway..."
    
    # Add routes (ignore if already exist)
    aws apigatewayv2 create-route --api-id $API_ID --route-key "POST /api/communications/send" 2>/dev/null || echo "Route already exists"
    aws apigatewayv2 create-route --api-id $API_ID --route-key "GET /api/export/{format}" 2>/dev/null || echo "Route already exists"
    aws apigatewayv2 create-route --api-id $API_ID --route-key "GET /api/analytics" 2>/dev/null || echo "Route already exists"
    aws apigatewayv2 create-route --api-id $API_ID --route-key "GET /api/health" 2>/dev/null || echo "Route already exists"
    
    echo -e "${GREEN}✅ API routes configured${NC}"
else
    echo -e "${YELLOW}⚠️  Could not find API Gateway. Routes may need manual configuration.${NC}"
fi

echo ""
echo "🔒 Step 6: Setting up CloudWatch Alarms"
echo "---------------------------------------"

# Create SNS topic for alarms
aws sns create-topic --name tna-alerts 2>/dev/null || echo "SNS topic already exists"

# Create error alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "TNA-Lambda-High-Errors" \
    --alarm-description "Alert when Lambda errors are high" \
    --metric-name Errors \
    --namespace AWS/Lambda \
    --statistic Sum \
    --period 300 \
    --threshold 10 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 1 \
    --dimensions Name=FunctionName,Value=$FUNCTION_NAME \
    --alarm-actions arn:aws:sns:us-east-1:$(aws sts get-caller-identity --query Account --output text):tna-alerts

echo -e "${GREEN}✅ CloudWatch alarms configured${NC}"

echo ""
echo "✨ Step 7: Testing Enhanced Features"
echo "------------------------------------"

# Test health endpoint
echo "Testing health check endpoint..."
HEALTH_RESPONSE=$(curl -s https://3zkisn905d.execute-api.us-east-1.amazonaws.com/prod/api/health)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
fi

echo ""
echo "🎉 Enhanced Backend Setup Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Test the new endpoints using the admin dashboard"
echo "2. Configure your monitoring email in SNS topic 'tna-alerts'"
echo "3. Review CloudWatch logs for any errors"
echo "4. Update frontend to use new features"
echo ""
echo "Useful commands:"
echo "- View logs: aws logs tail /aws/lambda/tna-backend --follow"
echo "- View audit logs: aws logs tail /aws/lambda/tna-audit-logs --follow"
echo "- Test export: curl https://3zkisn905d.execute-api.us-east-1.amazonaws.com/prod/api/export/csv"
echo ""
echo -e "${GREEN}✨ Your enhanced backend is ready!${NC}"

# Cleanup
rm -f enhanced-function.zip /tmp/enhance-db.sql
