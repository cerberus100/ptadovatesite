# Enhanced Backend Deployment Guide

## 🚀 Upgrading to Enhanced Lambda Backend

The enhanced backend adds:
- ✅ Comprehensive security (rate limiting, input validation)
- ✅ Full HIPAA compliance audit logging
- ✅ Advanced notification system (Email + SMS)
- ✅ Data export functionality (CSV/JSON)
- ✅ Analytics endpoints
- ✅ JWT authentication with token blacklisting
- ✅ Redis caching support
- ✅ Automated health checks

## Step 1: Add Missing Parameters to AWS

```powershell
# SendGrid API Key (for email)
aws ssm put-parameter --name "/tna/prod/SENDGRID_API_KEY" --value "YOUR_SENDGRID_API_KEY" --type "SecureString"

# Twilio Credentials (for SMS)
aws ssm put-parameter --name "/tna/prod/TWILIO_ACCOUNT_SID" --value "YOUR_TWILIO_SID" --type "SecureString"
aws ssm put-parameter --name "/tna/prod/TWILIO_AUTH_TOKEN" --value "YOUR_TWILIO_TOKEN" --type "SecureString"
aws ssm put-parameter --name "/tna/prod/TWILIO_PHONE_NUMBER" --value "+1234567890" --type "SecureString"

# Admin Phone for urgent SMS alerts
aws ssm put-parameter --name "/tna/prod/ADMIN_PHONE" --value "+1234567890" --type "SecureString"

# Encryption key for sensitive data
aws ssm put-parameter --name "/tna/prod/ENCRYPTION_KEY" --value "32-character-random-string-here!" --type "SecureString"
```

## Step 2: Create Audit Log Group

```powershell
# Create CloudWatch log group for HIPAA audit logs
aws logs create-log-group --log-group-name /aws/lambda/tna-audit-logs
```

## Step 3: Deploy Enhanced Lambda

```bash
# 1. Navigate to lambda directory
cd backend-lambda

# 2. Install dependencies
npm install --production

# 3. Create deployment package
zip -r enhanced-function.zip enhanced-index.js node_modules/ enhanced-package.json

# 4. Update Lambda function
aws lambda update-function-code \
  --function-name tna-backend \
  --zip-file fileb://enhanced-function.zip

# 5. Update handler to use enhanced version
aws lambda update-function-configuration \
  --function-name tna-backend \
  --handler enhanced-index.js.handler \
  --timeout 30 \
  --memory-size 512
```

## Step 4: Add New API Gateway Routes

```powershell
# Get API Gateway ID
$apiId = "3zkisn905d"

# Add new routes
aws apigatewayv2 create-route --api-id $apiId --route-key "POST /api/communications/send"
aws apigatewayv2 create-route --api-id $apiId --route-key "GET /api/export/{format}"
aws apigatewayv2 create-route --api-id $apiId --route-key "GET /api/analytics"
aws apigatewayv2 create-route --api-id $apiId --route-key "GET /api/health"
```

## Step 5: Update Lambda Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "ssm:GetParameter",
        "ses:SendEmail",
        "sns:Publish",
        "cloudwatch:PutMetricData"
      ],
      "Resource": "*"
    }
  ]
}
```

## Step 6: Test Enhanced Features

### Test Health Check
```bash
curl https://3zkisn905d.execute-api.us-east-1.amazonaws.com/prod/api/health
```

### Test Rate Limiting
```bash
# Should block after 100 requests in 15 minutes
for i in {1..101}; do curl -X POST https://3zkisn905d.execute-api.us-east-1.amazonaws.com/prod/api/patient-assistance -d '{}'; done
```

### Test Authentication (for admin endpoints)
```bash
# First, implement login endpoint or use this test token
export TOKEN="your-jwt-token"

# Test protected endpoint
curl -H "Authorization: Bearer $TOKEN" \
  https://3zkisn905d.execute-api.us-east-1.amazonaws.com/prod/api/submissions
```

## Step 7: Configure Monitoring

1. **CloudWatch Alarms**
```powershell
# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "TNA-Lambda-Errors" \
  --alarm-description "Alert on high error rate" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

2. **Enable X-Ray Tracing**
```powershell
aws lambda update-function-configuration \
  --function-name tna-backend \
  --tracing-config Mode=Active
```

## Step 8: Database Updates

Run these SQL commands to add new tables:

```sql
-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    action VARCHAR(255),
    resource VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(45),
    request_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id)
);

-- Add indexes for better performance
CREATE INDEX idx_patient_requests_status ON patient_requests(status);
CREATE INDEX idx_patient_requests_created ON patient_requests(created_at);
CREATE INDEX idx_provider_applications_status ON provider_applications(status);
CREATE INDEX idx_provider_applications_created ON provider_applications(created_at);

-- Add urgency column if missing
ALTER TABLE patient_requests 
ADD COLUMN IF NOT EXISTS urgency VARCHAR(50);
```

## Step 9: Frontend Integration

Update your admin dashboard to use the new endpoints:

```javascript
// Example: Fetch analytics
async function getAnalytics() {
    const response = await fetch('https://3zkisn905d.execute-api.us-east-1.amazonaws.com/prod/api/analytics', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
    });
    return response.json();
}

// Example: Export data
async function exportData(format) {
    const response = await fetch(`https://3zkisn905d.execute-api.us-east-1.amazonaws.com/prod/api/export/${format}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
    });
    
    if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export-${Date.now()}.csv`;
        a.click();
    } else {
        return response.json();
    }
}
```

## Step 10: Security Checklist

- [ ] All parameters stored in SSM (not in code)
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] HIPAA audit logging active
- [ ] SSL/TLS only connections
- [ ] JWT tokens expire after 7 days
- [ ] Database connections use SSL
- [ ] CloudWatch alarms configured
- [ ] Regular security updates scheduled

## Rollback Plan

If issues occur, rollback to original version:

```bash
# Update handler back to original
aws lambda update-function-configuration \
  --function-name tna-backend \
  --handler index.handler

# Or restore from previous version
aws lambda update-function-code \
  --function-name tna-backend \
  --s3-bucket your-backup-bucket \
  --s3-key original-function.zip
```

## Support

For issues or questions:
- Check CloudWatch Logs: `/aws/lambda/tna-backend`
- Check Audit Logs: `/aws/lambda/tna-audit-logs`
- Email: tech@truenorthadvocates.org
