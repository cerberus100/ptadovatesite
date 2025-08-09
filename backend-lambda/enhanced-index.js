const { Pool } = require('pg');
const Redis = require('redis');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { CloudWatchLogsClient, PutLogEventsCommand } = require('@aws-sdk/client-cloudwatch-logs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Initialize AWS clients
const ssm = new SSMClient({ region: process.env.AWS_REGION });
const ses = new SESClient({ region: process.env.AWS_REGION });
const sns = new SNSClient({ region: process.env.AWS_REGION });
const cloudwatchLogs = new CloudWatchLogsClient({ region: process.env.AWS_REGION });

// Cache for parameters
let cachedParams = null;
let cacheExpiry = 0;

// Rate limiting cache
const rateLimitCache = new Map();

// Get parameters from SSM
async function getParameters() {
    const now = Date.now();
    if (cachedParams && now < cacheExpiry) {
        return cachedParams;
    }

    const paramNames = [
        '/tna/prod/DATABASE_URL',
        '/tna/prod/REDIS_URL',
        '/tna/prod/JWT_SECRET',
        '/tna/prod/FRONTEND_URL',
        '/tna/prod/EMAIL_FROM',
        '/tna/prod/ADMIN_EMAIL',
        '/tna/prod/ADMIN_PHONE',
        '/tna/prod/SENDGRID_API_KEY',
        '/tna/prod/TWILIO_ACCOUNT_SID',
        '/tna/prod/TWILIO_AUTH_TOKEN',
        '/tna/prod/TWILIO_PHONE_NUMBER',
        '/tna/prod/ENCRYPTION_KEY'
    ];

    const params = {};
    for (const name of paramNames) {
        try {
            const command = new GetParameterCommand({
                Name: name,
                WithDecryption: true
            });
            const response = await ssm.send(command);
            const key = name.split('/').pop();
            params[key] = response.Parameter.Value;
        } catch (error) {
            console.log(`Parameter ${name} not found, skipping...`);
        }
    }

    cachedParams = params;
    cacheExpiry = now + 300000; // Cache for 5 minutes
    return params;
}

// Database connection pool
let pool = null;
async function getDbConnection() {
    if (!pool) {
        const params = await getParameters();
        pool = new Pool({
            connectionString: params.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 1,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }
    return pool;
}

// Redis connection
let redisClient = null;
async function getRedisClient() {
    if (!redisClient) {
        const params = await getParameters();
        redisClient = Redis.createClient({
            url: params.REDIS_URL,
            socket: {
                connectTimeout: 5000,
                reconnectStrategy: (retries) => Math.min(retries * 50, 500)
            }
        });
        
        redisClient.on('error', (err) => console.log('Redis Client Error', err));
        await redisClient.connect();
    }
    return redisClient;
}

// HIPAA Compliance Audit Logger
async function auditLog(userId, action, resource, details) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        userId: userId || 'anonymous',
        action,
        resource,
        details,
        requestId: details.requestId || uuidv4(),
        ip: details.ip || 'unknown'
    };
    
    // Log to CloudWatch
    try {
        const logGroupName = '/aws/lambda/tna-audit-logs';
        const logStreamName = new Date().toISOString().split('T')[0]; // Daily streams
        
        await cloudwatchLogs.send(new PutLogEventsCommand({
            logGroupName,
            logStreamName,
            logEvents: [{
                timestamp: Date.now(),
                message: JSON.stringify(logEntry)
            }]
        }));
    } catch (error) {
        console.error('Audit logging error:', error);
    }
    
    // Also store in database for long-term retention
    try {
        const db = await getDbConnection();
        await db.query(
            'INSERT INTO audit_logs (user_id, action, resource, details, ip_address, request_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId || 'anonymous', action, resource, JSON.stringify(details), details.ip, details.requestId]
        );
    } catch (error) {
        console.error('Database audit logging error:', error);
    }
}

// Rate limiting
async function checkRateLimit(ip, limit = 100, window = 900000) { // 15 minutes
    const key = `rate_limit:${ip}`;
    const now = Date.now();
    
    // Clean old entries
    const windowStart = now - window;
    const requests = rateLimitCache.get(key) || [];
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= limit) {
        return false;
    }
    
    recentRequests.push(now);
    rateLimitCache.set(key, recentRequests);
    
    // Try Redis if available
    try {
        const redis = await getRedisClient();
        await redis.incr(key);
        await redis.expire(key, Math.floor(window / 1000));
    } catch (error) {
        console.log('Redis rate limit error, using in-memory cache');
    }
    
    return true;
}

// JWT Authentication
async function verifyToken(token) {
    if (!token) return null;
    
    try {
        const params = await getParameters();
        const decoded = jwt.verify(token, params.JWT_SECRET);
        
        // Check if token is blacklisted in Redis
        try {
            const redis = await getRedisClient();
            const isBlacklisted = await redis.get(`blacklist_${token}`);
            if (isBlacklisted) return null;
        } catch (error) {
            console.log('Redis blacklist check failed');
        }
        
        return decoded;
    } catch (error) {
        return null;
    }
}

// Input validation and sanitization
function validateAndSanitize(data, rules) {
    const errors = [];
    const sanitized = {};
    
    for (const [field, rule] of Object.entries(rules)) {
        const value = data[field];
        
        // Required check
        if (rule.required && !value) {
            errors.push(`${field} is required`);
            continue;
        }
        
        if (!value && !rule.required) continue;
        
        // Type validation
        if (rule.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errors.push(`${field} must be a valid email`);
                continue;
            }
        }
        
        if (rule.type === 'phone') {
            const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
            if (!phoneRegex.test(value)) {
                errors.push(`${field} must be a valid phone number`);
                continue;
            }
        }
        
        // Sanitization
        let sanitizedValue = value;
        if (typeof value === 'string') {
            sanitizedValue = value.trim();
            if (rule.escape) {
                sanitizedValue = sanitizedValue
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;');
            }
        }
        
        sanitized[field] = sanitizedValue;
    }
    
    return { errors, data: sanitized };
}

// Enhanced notification system
async function sendNotifications(type, data) {
    const params = await getParameters();
    const notifications = [];
    
    // Email notification
    if (params.SENDGRID_API_KEY) {
        try {
            const sgMail = require('@sendgrid/mail');
            sgMail.setApiKey(params.SENDGRID_API_KEY);
            
            const emailContent = {
                to: params.ADMIN_EMAIL,
                from: params.EMAIL_FROM,
                subject: `New ${type === 'patient_request' ? 'Patient Request' : 'Provider Application'}`,
                html: generateEmailTemplate(type, data),
                text: generateEmailText(type, data)
            };
            
            await sgMail.send(emailContent);
            notifications.push('email');
            
            // Send confirmation to user
            if (data.email) {
                await sgMail.send({
                    to: data.email,
                    from: params.EMAIL_FROM,
                    subject: 'We received your request - True North Advocates',
                    html: generateUserConfirmationEmail(type, data),
                    text: generateUserConfirmationText(type, data)
                });
            }
        } catch (error) {
            console.error('SendGrid error:', error);
            // Fallback to AWS SES
            try {
                await ses.send(new SendEmailCommand({
                    Source: params.EMAIL_FROM,
                    Destination: { ToAddresses: [params.ADMIN_EMAIL] },
                    Message: {
                        Subject: { Data: `New ${type === 'patient_request' ? 'Patient Request' : 'Provider Application'}` },
                        Body: { 
                            Html: { Data: generateEmailTemplate(type, data) },
                            Text: { Data: generateEmailText(type, data) }
                        }
                    }
                }));
                notifications.push('email-ses');
            } catch (sesError) {
                console.error('SES error:', sesError);
            }
        }
    }
    
    // SMS notification for urgent requests
    if ((data.urgency === 'emergency' || data.urgency === 'high') && params.TWILIO_ACCOUNT_SID) {
        try {
            const twilio = require('twilio')(params.TWILIO_ACCOUNT_SID, params.TWILIO_AUTH_TOKEN);
            await twilio.messages.create({
                body: `URGENT: New ${type === 'patient_request' ? 'patient' : 'provider'} request from ${data.name} in ${data.location}. Check dashboard immediately.`,
                from: params.TWILIO_PHONE_NUMBER,
                to: params.ADMIN_PHONE
            });
            notifications.push('sms');
        } catch (error) {
            console.error('Twilio error:', error);
            // Fallback to AWS SNS
            try {
                await sns.send(new PublishCommand({
                    PhoneNumber: params.ADMIN_PHONE,
                    Message: `URGENT: New request from ${data.name}. Check True North Advocates dashboard.`
                }));
                notifications.push('sms-sns');
            } catch (snsError) {
                console.error('SNS error:', snsError);
            }
        }
    }
    
    // Store notification record
    try {
        const db = await getDbConnection();
        await db.query(
            `INSERT INTO notifications (type, recipient, message, methods) VALUES ($1, $2, $3, $4)`,
            ['admin_notification', params.ADMIN_EMAIL, `New ${type} from ${data.name}`, notifications.join(',')]
        );
    } catch (error) {
        console.error('Notification logging error:', error);
    }
    
    return notifications;
}

// Email templates
function generateEmailTemplate(type, data) {
    const urgencyBadge = data.urgency === 'emergency' 
        ? '<p style="background: #ff0000; color: white; padding: 10px; font-weight: bold;">🚨 EMERGENCY REQUEST</p>'
        : data.urgency === 'high'
        ? '<p style="background: #ff6b5d; color: white; padding: 10px; font-weight: bold;">⚠️ HIGH PRIORITY</p>'
        : '';
    
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #26547C; color: white; padding: 20px; text-align: center;">
                <h1>True North Advocates</h1>
                <h2>New ${type === 'patient_request' ? 'Patient Request' : 'Provider Application'}</h2>
            </div>
            ${urgencyBadge}
            <div style="padding: 20px; background: #f8f9fa;">
                <h3>Details:</h3>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
                <p><strong>Location:</strong> ${data.location}</p>
                ${data.wound_type ? `<p><strong>Wound Type:</strong> ${data.wound_type}</p>` : ''}
                ${data.message ? `<p><strong>Message:</strong><br>${data.message}</p>` : ''}
                ${data.credentials ? `<p><strong>Credentials:</strong> ${data.credentials}</p>` : ''}
                ${data.specialties ? `<p><strong>Specialties:</strong> ${data.specialties.join(', ')}</p>` : ''}
            </div>
            <div style="background: #26547C; color: white; padding: 20px; text-align: center;">
                <a href="${cachedParams?.FRONTEND_URL || 'https://truenorthadvocates.org'}/admin/submissions.html" 
                   style="background: #46B5A4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                   View in Dashboard
                </a>
            </div>
        </div>
    `;
}

function generateEmailText(type, data) {
    return `
New ${type === 'patient_request' ? 'Patient Request' : 'Provider Application'}

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Location: ${data.location}
${data.urgency ? `Urgency: ${data.urgency.toUpperCase()}` : ''}
${data.message ? `\nMessage:\n${data.message}` : ''}

Login to the admin dashboard to view and respond.
    `.trim();
}

function generateUserConfirmationEmail(type, data) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #26547C; color: white; padding: 20px; text-align: center;">
                <h1>True North Advocates</h1>
            </div>
            <div style="padding: 20px;">
                <h2>Thank you for reaching out, ${data.name}!</h2>
                <p>We have received your ${type === 'patient_request' ? 'patient assistance request' : 'provider application'} and will review it promptly.</p>
                <p><strong>What happens next:</strong></p>
                <ul>
                    <li>Our team will review your submission within ${type === 'patient_request' && data.urgency === 'emergency' ? '2-4 hours' : '24-48 hours'}</li>
                    <li>We will contact you via ${data.phone ? 'phone or email' : 'email'} with next steps</li>
                    <li>If urgent, please don't hesitate to call us at 1-800-TRUENORTH</li>
                </ul>
                <p>Your reference number is: <strong>#${data.id || Date.now()}</strong></p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
                <p>Questions? Contact us at help@truenorthadvocates.org</p>
            </div>
        </div>
    `;
}

function generateUserConfirmationText(type, data) {
    return `
Thank you for reaching out, ${data.name}!

We have received your ${type === 'patient_request' ? 'patient assistance request' : 'provider application'}.

What happens next:
- Review within ${type === 'patient_request' && data.urgency === 'emergency' ? '2-4 hours' : '24-48 hours'}
- We'll contact you via ${data.phone ? 'phone or email' : 'email'}
- For urgent needs, call 1-800-TRUENORTH

Your reference number: #${data.id || Date.now()}

Questions? Email help@truenorthadvocates.org
    `.trim();
}

// Enhanced data export
async function exportData(format, filters) {
    const db = await getDbConnection();
    
    let query = 'SELECT * FROM ';
    const params = [];
    
    if (filters.type === 'patient') {
        query += 'patient_requests';
    } else if (filters.type === 'provider') {
        query += 'provider_applications';
    } else {
        query = `
            (SELECT *, 'patient' as record_type FROM patient_requests)
            UNION ALL
            (SELECT *, 'provider' as record_type FROM provider_applications)
        `;
    }
    
    const conditions = [];
    if (filters.from_date) {
        conditions.push(`created_at >= $${params.length + 1}`);
        params.push(filters.from_date);
    }
    if (filters.to_date) {
        conditions.push(`created_at <= $${params.length + 1}`);
        params.push(filters.to_date);
    }
    if (filters.status) {
        conditions.push(`status = $${params.length + 1}`);
        params.push(filters.status);
    }
    
    if (conditions.length > 0 && filters.type) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await db.query(query, params);
    
    if (format === 'csv') {
        return convertToCSV(result.rows);
    } else if (format === 'json') {
        return JSON.stringify(result.rows, null, 2);
    }
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');
    
    return csv;
}

// Main Lambda handler with enhanced routing
exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event));
    
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    };

    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    const path = event.path;
    const method = event.httpMethod;
    const ip = event.requestContext?.identity?.sourceIp || 'unknown';
    const requestId = event.requestContext?.requestId || uuidv4();

    // Rate limiting
    const rateLimitOk = await checkRateLimit(ip);
    if (!rateLimitOk) {
        await auditLog('anonymous', 'RATE_LIMIT_EXCEEDED', path, { ip, requestId });
        return {
            statusCode: 429,
            headers,
            body: JSON.stringify({ error: 'Too many requests. Please try again later.' })
        };
    }

    // Authentication for protected routes
    const protectedRoutes = [
        '/api/submissions',
        '/api/submissions/[id]/status',
        '/api/communications/send',
        '/api/export',
        '/api/analytics'
    ];
    
    let user = null;
    if (protectedRoutes.some(route => path.match(new RegExp(route.replace('[id]', '\\d+'))))) {
        const authHeader = event.headers?.Authorization || event.headers?.authorization;
        const token = authHeader?.split(' ')[1];
        
        user = await verifyToken(token);
        if (!user) {
            await auditLog('anonymous', 'UNAUTHORIZED_ACCESS_ATTEMPT', path, { ip, requestId });
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Authentication required' })
            };
        }
    }

    try {
        // Enhanced routing
        if (path === '/api/patient-assistance' && method === 'POST') {
            return await handlePatientAssistance(event, headers, { ip, requestId });
        } else if (path === '/api/provider-application' && method === 'POST') {
            return await handleProviderApplication(event, headers, { ip, requestId });
        } else if (path === '/api/submissions' && method === 'GET') {
            return await handleGetSubmissions(event, headers, { user, ip, requestId });
        } else if (path.match(/^\/api\/submissions\/\d+\/status$/) && method === 'PUT') {
            return await handleUpdateStatus(event, headers, { user, ip, requestId });
        } else if (path === '/api/communications/send' && method === 'POST') {
            return await handleSendCommunication(event, headers, { user, ip, requestId });
        } else if (path.match(/^\/api\/export\/(csv|json)$/) && method === 'GET') {
            return await handleExport(event, headers, { user, ip, requestId });
        } else if (path === '/api/analytics' && method === 'GET') {
            return await handleAnalytics(event, headers, { user, ip, requestId });
        } else if (path === '/api/health' && method === 'GET') {
            return await handleHealthCheck(headers);
        } else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Endpoint not found' })
            };
        }
    } catch (error) {
        console.error('Handler error:', error);
        await auditLog(user?.id || 'anonymous', 'ERROR', path, { 
            error: error.message,
            ip,
            requestId 
        });
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'An error occurred processing your request',
                requestId // Include for support reference
            })
        };
    }
};

// Enhanced handler functions
async function handlePatientAssistance(event, headers, context) {
    const body = JSON.parse(event.body || '{}');
    
    // Validation rules
    const validation = validateAndSanitize(body, {
        name: { required: true, escape: true },
        email: { required: true, type: 'email' },
        phone: { required: false, type: 'phone' },
        location: { required: true, escape: true },
        wound_type: { required: false, escape: true },
        urgency: { required: false, escape: true },
        message: { required: false, escape: true }
    });
    
    if (validation.errors.length > 0) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ errors: validation.errors })
        };
    }
    
    const db = await getDbConnection();
    
    try {
        const result = await db.query(
            `INSERT INTO patient_requests (name, email, phone, location, wound_type, urgency, message) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                validation.data.name,
                validation.data.email,
                validation.data.phone,
                validation.data.location,
                validation.data.wound_type,
                validation.data.urgency,
                validation.data.message
            ]
        );
        
        const request = result.rows[0];
        
        // Send notifications
        const notifications = await sendNotifications('patient_request', request);
        
        // Audit log
        await auditLog('anonymous', 'PATIENT_REQUEST_CREATED', 'patient_requests', {
            requestId: request.id,
            urgency: request.urgency,
            ip: context.ip,
            requestId: context.requestId
        });
        
        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Your request has been submitted successfully. We will contact you within 24 hours.',
                requestId: request.id,
                notifications: notifications.length > 0 ? 'sent' : 'pending'
            })
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to submit request',
                requestId: context.requestId
            })
        };
    }
}

async function handleProviderApplication(event, headers, context) {
    const body = JSON.parse(event.body || '{}');
    
    // Validation rules
    const validation = validateAndSanitize(body, {
        name: { required: true, escape: true },
        email: { required: true, type: 'email' },
        phone: { required: true, type: 'phone' },
        credentials: { required: true, escape: true },
        specialties: { required: false },
        location: { required: true, escape: true }
    });
    
    if (validation.errors.length > 0) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ errors: validation.errors })
        };
    }
    
    const db = await getDbConnection();
    
    try {
        const result = await db.query(
            `INSERT INTO provider_applications (name, email, phone, credentials, specialties, location) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                validation.data.name,
                validation.data.email,
                validation.data.phone,
                validation.data.credentials,
                validation.data.specialties || [],
                validation.data.location
            ]
        );
        
        const application = result.rows[0];
        
        // Send notifications
        const notifications = await sendNotifications('provider_application', application);
        
        // Audit log
        await auditLog('anonymous', 'PROVIDER_APPLICATION_CREATED', 'provider_applications', {
            applicationId: application.id,
            ip: context.ip,
            requestId: context.requestId
        });
        
        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Your application has been submitted successfully. We will review it within 48 hours.',
                applicationId: application.id,
                notifications: notifications.length > 0 ? 'sent' : 'pending'
            })
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to submit application',
                requestId: context.requestId
            })
        };
    }
}

async function handleGetSubmissions(event, headers, context) {
    const { status, type, from_date, to_date, page = '1', limit = '20' } = event.queryStringParameters || {};
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Audit log
    await auditLog(context.user.id, 'VIEW_SUBMISSIONS', 'submissions', {
        filters: { status, type, from_date, to_date },
        ip: context.ip,
        requestId: context.requestId
    });
    
    const db = await getDbConnection();
    
    try {
        let query;
        let countQuery;
        const params = [];
        
        if (type === 'patient') {
            query = 'SELECT * FROM patient_requests';
            countQuery = 'SELECT COUNT(*) FROM patient_requests';
        } else if (type === 'provider') {
            query = 'SELECT * FROM provider_applications';
            countQuery = 'SELECT COUNT(*) FROM provider_applications';
        } else {
            query = `
                (SELECT id, 'patient' as type, name, email, location, status, created_at, urgency
                 FROM patient_requests)
                UNION ALL
                (SELECT id, 'provider' as type, name, email, location, status, created_at, NULL as urgency
                 FROM provider_applications)
            `;
            countQuery = `
                SELECT 
                    (SELECT COUNT(*) FROM patient_requests) + 
                    (SELECT COUNT(*) FROM provider_applications) as count
            `;
        }
        
        // Add filters
        const conditions = [];
        if (status) {
            conditions.push(`status = $${params.length + 1}`);
            params.push(status);
        }
        if (from_date) {
            conditions.push(`created_at >= $${params.length + 1}`);
            params.push(from_date);
        }
        if (to_date) {
            conditions.push(`created_at <= $${params.length + 1}`);
            params.push(to_date);
        }
        
        if (conditions.length > 0 && type) {
            query += ' WHERE ' + conditions.join(' AND ');
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(parseInt(limit), offset);
        
        const [submissions, totalCount] = await Promise.all([
            db.query(query, params),
            db.query(countQuery, params.slice(0, -2))
        ]);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                submissions: submissions.rows,
                total: totalCount.rows[0].count || 0,
                page: parseInt(page),
                pages: Math.ceil((totalCount.rows[0].count || 0) / parseInt(limit))
            })
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to retrieve submissions' })
        };
    }
}

async function handleUpdateStatus(event, headers, context) {
    const matches = event.path.match(/^\/api\/submissions\/(\d+)\/status$/);
    const id = matches ? matches[1] : null;
    
    const body = JSON.parse(event.body || '{}');
    const { status, type, notes } = body;
    
    if (!status || !type) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing status or type' })
        };
    }
    
    const db = await getDbConnection();
    const table = type === 'patient' ? 'patient_requests' : 'provider_applications';
    
    try {
        // Get current status for audit
        const current = await db.query(`SELECT status FROM ${table} WHERE id = $1`, [id]);
        const oldStatus = current.rows[0]?.status;
        
        const result = await db.query(
            `UPDATE ${table} SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 RETURNING *`,
            [status, id]
        );
        
        if (result.rows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Submission not found' })
            };
        }
        
        // Send status update notification
        await sendStatusUpdateNotification(result.rows[0], status);
        
        // Audit log
        await auditLog(context.user.id, 'UPDATE_SUBMISSION_STATUS', table, {
            submissionId: id,
            oldStatus,
            newStatus: status,
            notes,
            ip: context.ip,
            requestId: context.requestId
        });
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                submission: result.rows[0]
            })
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to update status' })
        };
    }
}

async function handleSendCommunication(event, headers, context) {
    const body = JSON.parse(event.body || '{}');
    const { recipientId, type, method, subject, message } = body;
    
    if (!recipientId || !type || !method || !message) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing required fields' })
        };
    }
    
    const db = await getDbConnection();
    const table = type === 'patient' ? 'patient_requests' : 'provider_applications';
    
    try {
        const recipient = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [recipientId]);
        
        if (recipient.rows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Recipient not found' })
            };
        }
        
        const recipientData = recipient.rows[0];
        const params = await getParameters();
        let result = { success: false };
        
        if (method === 'email' && params.SENDGRID_API_KEY) {
            const sgMail = require('@sendgrid/mail');
            sgMail.setApiKey(params.SENDGRID_API_KEY);
            
            await sgMail.send({
                to: recipientData.email,
                from: params.EMAIL_FROM,
                subject: subject || 'Update from True North Advocates',
                html: message,
                text: message.replace(/<[^>]*>/g, '')
            });
            
            result.success = true;
            result.method = 'email';
        } else if (method === 'sms' && recipientData.phone && params.TWILIO_ACCOUNT_SID) {
            const twilio = require('twilio')(params.TWILIO_ACCOUNT_SID, params.TWILIO_AUTH_TOKEN);
            
            await twilio.messages.create({
                body: message.substring(0, 160), // SMS limit
                from: params.TWILIO_PHONE_NUMBER,
                to: recipientData.phone
            });
            
            result.success = true;
            result.method = 'sms';
        }
        
        // Log communication
        await db.query(
            `INSERT INTO notifications (type, recipient, message, read_status) VALUES ($1, $2, $3, $4)`,
            [method, recipientData.email, message, true]
        );
        
        // Audit log
        await auditLog(context.user.id, 'SEND_COMMUNICATION', 'communications', {
            recipientId,
            method,
            type,
            ip: context.ip,
            requestId: context.requestId
        });
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Communication sent successfully',
                ...result
            })
        };
    } catch (error) {
        console.error('Communication error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to send communication' })
        };
    }
}

async function handleExport(event, headers, context) {
    const matches = event.path.match(/^\/api\/export\/(csv|json)$/);
    const format = matches ? matches[1] : 'json';
    
    const filters = event.queryStringParameters || {};
    
    // Audit log
    await auditLog(context.user.id, 'EXPORT_DATA', 'export', {
        format,
        filters,
        ip: context.ip,
        requestId: context.requestId
    });
    
    try {
        const data = await exportData(format, filters);
        
        if (format === 'csv') {
            return {
                statusCode: 200,
                headers: {
                    ...headers,
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="tna-export-${Date.now()}.csv"`
                },
                body: data
            };
        } else {
            return {
                statusCode: 200,
                headers,
                body: data
            };
        }
    } catch (error) {
        console.error('Export error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to export data' })
        };
    }
}

async function handleAnalytics(event, headers, context) {
    const { from_date, to_date } = event.queryStringParameters || {};
    
    const db = await getDbConnection();
    
    try {
        const dateFilter = from_date && to_date 
            ? `WHERE created_at BETWEEN '${from_date}' AND '${to_date}'`
            : '';
        
        const [
            totalPatients,
            totalProviders,
            urgentRequests,
            responseTime,
            statusBreakdown
        ] = await Promise.all([
            db.query(`SELECT COUNT(*) FROM patient_requests ${dateFilter}`),
            db.query(`SELECT COUNT(*) FROM provider_applications ${dateFilter}`),
            db.query(`SELECT COUNT(*) FROM patient_requests ${dateFilter} ${dateFilter ? 'AND' : 'WHERE'} urgency IN ('high', 'emergency')`),
            db.query(`
                SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_hours 
                FROM patient_requests 
                ${dateFilter} ${dateFilter ? 'AND' : 'WHERE'} status != 'pending'
            `),
            db.query(`
                SELECT status, COUNT(*) as count 
                FROM (
                    SELECT status FROM patient_requests ${dateFilter}
                    UNION ALL
                    SELECT status FROM provider_applications ${dateFilter}
                ) combined 
                GROUP BY status
            `)
        ]);
        
        // Audit log
        await auditLog(context.user.id, 'VIEW_ANALYTICS', 'analytics', {
            dateRange: { from_date, to_date },
            ip: context.ip,
            requestId: context.requestId
        });
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                totalSubmissions: parseInt(totalPatients.rows[0].count) + parseInt(totalProviders.rows[0].count),
                patientRequests: parseInt(totalPatients.rows[0].count),
                providerApplications: parseInt(totalProviders.rows[0].count),
                urgentRequests: parseInt(urgentRequests.rows[0].count),
                averageResponseTime: Math.round(responseTime.rows[0].avg_hours || 0),
                statusBreakdown: statusBreakdown.rows.reduce((acc, row) => {
                    acc[row.status] = parseInt(row.count);
                    return acc;
                }, {})
            })
        };
    } catch (error) {
        console.error('Analytics error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to retrieve analytics' })
        };
    }
}

async function handleHealthCheck(headers) {
    const params = await getParameters();
    const checks = {
        lambda: 'healthy',
        parameters: Object.keys(params).length > 0 ? 'healthy' : 'missing',
        timestamp: new Date().toISOString()
    };
    
    // Check database
    try {
        const db = await getDbConnection();
        await db.query('SELECT 1');
        checks.database = 'healthy';
    } catch (error) {
        checks.database = 'unhealthy';
    }
    
    // Check Redis
    try {
        const redis = await getRedisClient();
        await redis.ping();
        checks.redis = 'healthy';
    } catch (error) {
        checks.redis = 'unhealthy';
    }
    
    const allHealthy = Object.values(checks).every(status => 
        status === 'healthy' || status instanceof Date
    );
    
    return {
        statusCode: allHealthy ? 200 : 503,
        headers,
        body: JSON.stringify({
            status: allHealthy ? 'healthy' : 'degraded',
            checks
        })
    };
}

// Helper function for status update notifications
async function sendStatusUpdateNotification(data, newStatus) {
    const params = await getParameters();
    
    if (!params.SENDGRID_API_KEY || !data.email) return;
    
    try {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(params.SENDGRID_API_KEY);
        
        const statusMessages = {
            approved: 'Your request has been approved! We will be contacting you shortly with next steps.',
            contacted: 'We have attempted to contact you. Please check your email and phone for our message.',
            in_progress: 'Your request is being actively processed by our team.',
            completed: 'Your request has been completed. Thank you for choosing True North Advocates!',
            rejected: 'Unfortunately, we are unable to process your request at this time. Please contact us for more information.'
        };
        
        await sgMail.send({
            to: data.email,
            from: params.EMAIL_FROM,
            subject: 'Update on Your True North Advocates Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #26547C; color: white; padding: 20px; text-align: center;">
                        <h1>True North Advocates</h1>
                    </div>
                    <div style="padding: 20px;">
                        <h2>Status Update</h2>
                        <p>Dear ${data.name},</p>
                        <p>${statusMessages[newStatus] || 'Your request status has been updated.'}</p>
                        <p><strong>New Status:</strong> ${newStatus.toUpperCase()}</p>
                        <p><strong>Reference Number:</strong> #${data.id}</p>
                        <hr>
                        <p>If you have any questions, please don't hesitate to contact us:</p>
                        <p>📧 help@truenorthadvocates.org<br>📞 1-800-TRUENORTH</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px;">
                        <p>&copy; 2024 True North Advocates. All rights reserved.</p>
                    </div>
                </div>
            `,
            text: `Status Update\n\nDear ${data.name},\n\n${statusMessages[newStatus] || 'Your request status has been updated.'}\n\nNew Status: ${newStatus.toUpperCase()}\nReference Number: #${data.id}\n\nQuestions? Contact us at help@truenorthadvocates.org or call 1-800-TRUENORTH.`
        });
    } catch (error) {
        console.error('Status notification error:', error);
    }
}
