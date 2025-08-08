const { Pool } = require('pg');
const Redis = require('redis');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize SSM client
const ssm = new SSMClient({ region: process.env.AWS_REGION });

// Cache for parameters
let cachedParams = null;
let cacheExpiry = 0;

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
        '/tna/prod/ADMIN_EMAIL'
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
            console.error(`Failed to get parameter ${name}:`, error);
        }
    }

    cachedParams = params;
    cacheExpiry = now + 300000; // Cache for 5 minutes
    return params;
}

// Database connection
let pool = null;
async function getDbConnection() {
    if (!pool) {
        const params = await getParameters();
        pool = new Pool({
            connectionString: params.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 1
        });
    }
    return pool;
}

// Main handler
exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event));
    
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Handle OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    const path = event.path;
    const method = event.httpMethod;

    try {
        // Route handling
        if (path === '/api/patient-assistance' && method === 'POST') {
            return await handlePatientAssistance(event, headers);
        } else if (path === '/api/provider-application' && method === 'POST') {
            return await handleProviderApplication(event, headers);
        } else if (path === '/api/submissions' && method === 'GET') {
            return await handleGetSubmissions(event, headers);
        } else if (path.match(/^\/api\/submissions\/\d+\/status$/) && method === 'PUT') {
            return await handleUpdateStatus(event, headers);
        } else if (path === '/api/health' && method === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() })
            };
        } else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Not found' })
            };
        }
    } catch (error) {
        console.error('Handler error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

// Handle patient assistance request
async function handlePatientAssistance(event, headers) {
    const body = JSON.parse(event.body || '{}');
    const { name, email, phone, location, wound_type, urgency, message } = body;

    // Validate required fields
    if (!name || !email || !location) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing required fields' })
        };
    }

    const db = await getDbConnection();
    
    try {
        const result = await db.query(
            `INSERT INTO patient_requests (name, email, phone, location, wound_type, urgency, message) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [name, email, phone, location, wound_type, urgency || 'medium', message]
        );

        const request = result.rows[0];

        // Send notification email (simplified)
        await sendNotificationEmail('patient_request', request);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Your request has been submitted successfully. We will contact you within 24 hours.',
                requestId: request.id
            })
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to submit request' })
        };
    }
}

// Handle provider application
async function handleProviderApplication(event, headers) {
    const body = JSON.parse(event.body || '{}');
    const { name, email, phone, credentials, specialties, location } = body;

    // Validate required fields
    if (!name || !email || !phone || !location) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing required fields' })
        };
    }

    const db = await getDbConnection();
    
    try {
        const result = await db.query(
            `INSERT INTO provider_applications (name, email, phone, credentials, specialties, location) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, email, phone, credentials, specialties, location]
        );

        const application = result.rows[0];

        // Send notification email
        await sendNotificationEmail('provider_application', application);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Your application has been submitted successfully. We will review it within 48 hours.',
                applicationId: application.id
            })
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to submit application' })
        };
    }
}

// Handle get submissions (simplified - no auth for now)
async function handleGetSubmissions(event, headers) {
    const { status, type, page = '1', limit = '20' } = event.queryStringParameters || {};
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const db = await getDbConnection();
    
    try {
        let query = 'SELECT * FROM ';
        const params = [];

        if (type === 'patient') {
            query += 'patient_requests';
        } else if (type === 'provider') {
            query += 'provider_applications';
        } else {
            // Return both types
            query = `
                (SELECT id, 'patient' as type, name, email, location, status, created_at 
                 FROM patient_requests
                 ORDER BY created_at DESC
                 LIMIT ${parseInt(limit)})
                UNION ALL
                (SELECT id, 'provider' as type, name, email, location, status, created_at 
                 FROM provider_applications
                 ORDER BY created_at DESC
                 LIMIT ${parseInt(limit)})
            `;
        }

        if (type && status) {
            query += ` WHERE status = $1`;
            params.push(status);
        }

        if (type) {
            query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
            params.push(parseInt(limit), offset);
        }

        const result = await db.query(query, params);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                submissions: result.rows,
                page: parseInt(page),
                limit: parseInt(limit)
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

// Handle update status
async function handleUpdateStatus(event, headers) {
    const matches = event.path.match(/^\/api\/submissions\/(\d+)\/status$/);
    const id = matches ? matches[1] : null;
    
    if (!id) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid submission ID' })
        };
    }

    const body = JSON.parse(event.body || '{}');
    const { status, type } = body;

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

// Send notification email (simplified)
async function sendNotificationEmail(type, data) {
    try {
        const params = await getParameters();
        
        // For now, just log the notification
        console.log('Email notification:', {
            type,
            to: params.ADMIN_EMAIL,
            from: params.EMAIL_FROM,
            subject: `New ${type === 'patient_request' ? 'Patient Request' : 'Provider Application'}`,
            data
        });
        
        // TODO: Implement actual email sending with SendGrid when API key is available
    } catch (error) {
        console.error('Failed to send notification:', error);
    }
}
