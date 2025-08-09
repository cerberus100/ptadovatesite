// Simple Admin API for True North Advocates
// No complex notifications - just login and view submissions

const { Pool } = require('pg');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const crypto = require('crypto');

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
        '/tna/prod/ADMIN_USERNAME',
        '/tna/prod/ADMIN_PASSWORD_HASH'
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
            console.log(`Parameter ${name} not found, using defaults`);
        }
    }

    // Default admin credentials if not set
    if (!params.ADMIN_USERNAME) params.ADMIN_USERNAME = 'admin';
    if (!params.ADMIN_PASSWORD_HASH) {
        // Default password: TrueNorth2024!
        params.ADMIN_PASSWORD_HASH = crypto.createHash('sha256').update('TrueNorth2024!').digest('hex');
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

// Simple authentication
async function authenticate(username, password) {
    const params = await getParameters();
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    if (username === params.ADMIN_USERNAME && passwordHash === params.ADMIN_PASSWORD_HASH) {
        // Generate simple session token
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = Date.now() + (2 * 60 * 60 * 1000); // 2 hours
        
        return {
            success: true,
            token,
            expiry
        };
    }
    
    return { success: false };
}

// Get all submissions
async function getSubmissions(filters = {}) {
    const db = await getDbConnection();
    
    try {
        // Get patient requests
        const patientQuery = `
            SELECT 
                id,
                'patient' as type,
                name,
                email,
                phone,
                location,
                wound_type,
                urgency,
                message,
                status,
                created_at
            FROM patient_requests
            ORDER BY created_at DESC
            LIMIT 100
        `;
        
        // Get provider applications
        const providerQuery = `
            SELECT 
                id,
                'provider' as type,
                name,
                email,
                phone,
                location,
                credentials,
                specialties,
                NULL as urgency,
                NULL as message,
                status,
                created_at
            FROM provider_applications
            ORDER BY created_at DESC
            LIMIT 100
        `;
        
        const [patientResults, providerResults] = await Promise.all([
            db.query(patientQuery),
            db.query(providerQuery)
        ]);
        
        // Combine and sort by date
        const allSubmissions = [
            ...patientResults.rows,
            ...providerResults.rows
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Calculate stats
        const stats = {
            total: allSubmissions.length,
            pending: allSubmissions.filter(s => s.status === 'pending').length,
            patients: patientResults.rows.length,
            providers: providerResults.rows.length,
            urgent: patientResults.rows.filter(p => p.urgency === 'high' || p.urgency === 'emergency').length
        };
        
        return {
            submissions: allSubmissions,
            stats
        };
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
}

// Update submission status
async function updateStatus(id, type, newStatus) {
    const db = await getDbConnection();
    const table = type === 'patient' ? 'patient_requests' : 'provider_applications';
    
    try {
        const result = await db.query(
            `UPDATE ${table} SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 RETURNING *`,
            [newStatus, id]
        );
        
        return result.rows[0];
    } catch (error) {
        console.error('Update error:', error);
        throw error;
    }
}

// Main Lambda handler
exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event));
    
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Handle OPTIONS
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
        // Admin login
        if (path === '/api/admin/login' && method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { username, password } = body;
            
            if (!username || !password) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Username and password required' })
                };
            }
            
            const authResult = await authenticate(username, password);
            
            if (authResult.success) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        token: authResult.token,
                        expiry: authResult.expiry
                    })
                };
            } else {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Invalid credentials' })
                };
            }
        }
        
        // Get submissions (simple auth check)
        if (path === '/api/admin/submissions' && method === 'GET') {
            // Simple token check (in production, use proper JWT)
            const authHeader = event.headers?.Authorization || event.headers?.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Authentication required' })
                };
            }
            
            const data = await getSubmissions();
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(data)
            };
        }
        
        // Update status
        if (path.match(/^\/api\/admin\/submissions\/\d+\/status$/) && method === 'PUT') {
            // Simple auth check
            const authHeader = event.headers?.Authorization || event.headers?.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Authentication required' })
                };
            }
            
            const matches = path.match(/^\/api\/admin\/submissions\/(\d+)\/status$/);
            const id = matches[1];
            const body = JSON.parse(event.body || '{}');
            const { type, status } = body;
            
            if (!type || !status) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Type and status required' })
                };
            }
            
            const updated = await updateStatus(id, type, status);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    submission: updated
                })
            };
        }
        
        // Health check
        if (path === '/api/admin/health' && method === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    status: 'healthy',
                    timestamp: new Date().toISOString()
                })
            };
        }
        
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Not found' })
        };
        
    } catch (error) {
        console.error('Handler error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
