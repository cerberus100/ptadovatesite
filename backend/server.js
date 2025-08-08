const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const Redis = require('redis');
const winston = require('winston');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Redis client for caching
const redis = Redis.createClient({
    url: process.env.REDIS_URL
});

// Logger configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD
    }
});

// Twilio configuration
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// HIPAA Compliance Audit Logger
const auditLog = (userId, action, resource, details) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        userId,
        action,
        resource,
        details,
        ip: details.ip || 'unknown'
    };
    
    logger.info('AUDIT', logEntry);
    
    // Store in database for long-term retention
    pool.query(
        'INSERT INTO audit_logs (user_id, action, resource, details, ip_address) VALUES ($1, $2, $3, $4, $5)',
        [userId, action, resource, JSON.stringify(details), details.ip]
    );
};

// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        
        // Check if token is blacklisted
        const isBlacklisted = await redis.get(`blacklist_${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ error: 'Token revoked' });
        }
        
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Role-based access control
const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            auditLog(req.user.id, 'UNAUTHORIZED_ACCESS_ATTEMPT', req.path, { ip: req.ip });
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

// Database initialization
async function initializeDatabase() {
    try {
        // Create tables if they don't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS patient_requests (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                location VARCHAR(255),
                wound_type VARCHAR(100),
                urgency VARCHAR(50),
                message TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS provider_applications (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                credentials VARCHAR(255),
                specialties TEXT[],
                location VARCHAR(255),
                phone VARCHAR(20),
                email VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                permissions JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                action VARCHAR(255),
                resource VARCHAR(255),
                details JSONB,
                ip_address VARCHAR(45),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                type VARCHAR(50),
                recipient VARCHAR(255),
                message TEXT,
                read_status BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        logger.info('Database initialized successfully');
    } catch (error) {
        logger.error('Database initialization error:', error);
        process.exit(1);
    }
}

// API Routes

// Patient assistance request
app.post('/api/patient-assistance', [
    body('name').notEmpty().trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone(),
    body('location').notEmpty().trim(),
    body('wound_type').optional().trim(),
    body('urgency').optional().isIn(['low', 'medium', 'high', 'emergency']),
    body('message').optional().trim().escape()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, location, wound_type, urgency, message } = req.body;

        // Insert into database
        const result = await pool.query(
            `INSERT INTO patient_requests (name, email, phone, location, wound_type, urgency, message) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [name, email, phone, location, wound_type, urgency, message]
        );

        const request = result.rows[0];

        // Send notifications
        await sendNotifications('patient_request', request);

        // Log audit
        auditLog('anonymous', 'PATIENT_REQUEST_CREATED', 'patient_requests', { 
            requestId: request.id,
            ip: req.ip 
        });

        res.status(201).json({
            success: true,
            message: 'Your request has been submitted successfully. We will contact you within 24 hours.',
            requestId: request.id
        });

    } catch (error) {
        logger.error('Patient assistance error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Provider application
app.post('/api/provider-application', [
    body('name').notEmpty().trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('phone').isMobilePhone(),
    body('credentials').notEmpty().trim(),
    body('specialties').isArray(),
    body('location').notEmpty().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, credentials, specialties, location } = req.body;

        // Insert into database
        const result = await pool.query(
            `INSERT INTO provider_applications (name, email, phone, credentials, specialties, location) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, email, phone, credentials, specialties, location]
        );

        const application = result.rows[0];

        // Send notifications
        await sendNotifications('provider_application', application);

        // Log audit
        auditLog('anonymous', 'PROVIDER_APPLICATION_CREATED', 'provider_applications', { 
            applicationId: application.id,
            ip: req.ip 
        });

        res.status(201).json({
            success: true,
            message: 'Your application has been submitted successfully. We will review it within 48 hours.',
            applicationId: application.id
        });

    } catch (error) {
        logger.error('Provider application error:', error);
        res.status(500).json({ error: 'An error occurred while processing your application' });
    }
});

// Get submissions (admin only)
app.get('/api/submissions', authenticate, authorize(['admin', 'staff']), async (req, res) => {
    try {
        const { status, type, from_date, to_date, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM ';
        let countQuery = 'SELECT COUNT(*) FROM ';
        let params = [];
        let conditions = [];

        // Determine table based on type
        if (type === 'patient') {
            query += 'patient_requests';
            countQuery += 'patient_requests';
        } else if (type === 'provider') {
            query += 'provider_applications';
            countQuery += 'provider_applications';
        } else {
            // Union both tables
            query = `
                (SELECT id, 'patient' as type, name, email, location, status, created_at 
                 FROM patient_requests)
                UNION ALL
                (SELECT id, 'provider' as type, name, email, location, status, created_at 
                 FROM provider_applications)
            `;
            countQuery = `
                SELECT 
                    (SELECT COUNT(*) FROM patient_requests) + 
                    (SELECT COUNT(*) FROM provider_applications) as count
            `;
        }

        // Add filters
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

        // Apply conditions
        if (conditions.length > 0 && type) {
            query += ' WHERE ' + conditions.join(' AND ');
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }

        // Add sorting and pagination
        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        // Execute queries
        const [submissions, totalCount] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, params.slice(0, -2))
        ]);

        // Log audit
        auditLog(req.user.id, 'VIEW_SUBMISSIONS', 'submissions', { 
            filters: { status, type, from_date, to_date },
            ip: req.ip 
        });

        res.json({
            submissions: submissions.rows,
            total: totalCount.rows[0].count || totalCount.rows[0].count,
            page: parseInt(page),
            pages: Math.ceil((totalCount.rows[0].count || 0) / limit)
        });

    } catch (error) {
        logger.error('Get submissions error:', error);
        res.status(500).json({ error: 'Failed to retrieve submissions' });
    }
});

// Update submission status
app.put('/api/submissions/:id/status', authenticate, authorize(['admin', 'staff']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, type, notes } = req.body;

        const table = type === 'patient' ? 'patient_requests' : 'provider_applications';

        const result = await pool.query(
            `UPDATE ${table} SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        // Send status update notification
        await sendStatusUpdateNotification(result.rows[0], status);

        // Log audit
        auditLog(req.user.id, 'UPDATE_SUBMISSION_STATUS', table, { 
            submissionId: id,
            oldStatus: result.rows[0].status,
            newStatus: status,
            notes,
            ip: req.ip 
        });

        res.json({
            success: true,
            submission: result.rows[0]
        });

    } catch (error) {
        logger.error('Update status error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Send email/SMS to patient or provider
app.post('/api/communications/send', authenticate, authorize(['admin', 'staff']), async (req, res) => {
    try {
        const { recipientId, type, method, subject, message } = req.body;

        const table = type === 'patient' ? 'patient_requests' : 'provider_applications';
        const recipient = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [recipientId]);

        if (recipient.rows.length === 0) {
            return res.status(404).json({ error: 'Recipient not found' });
        }

        const recipientData = recipient.rows[0];
        let result;

        if (method === 'email') {
            result = await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: recipientData.email,
                subject: subject,
                html: message
            });
        } else if (method === 'sms' && recipientData.phone) {
            result = await twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: recipientData.phone
            });
        }

        // Log communication
        await pool.query(
            `INSERT INTO notifications (type, recipient, message) VALUES ($1, $2, $3)`,
            [method, recipientData.email, message]
        );

        // Log audit
        auditLog(req.user.id, 'SEND_COMMUNICATION', 'communications', { 
            recipientId,
            method,
            type,
            ip: req.ip 
        });

        res.json({
            success: true,
            message: 'Communication sent successfully'
        });

    } catch (error) {
        logger.error('Send communication error:', error);
        res.status(500).json({ error: 'Failed to send communication' });
    }
});

// Export data
app.get('/api/export/:format', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { format } = req.params;
        const { type, from_date, to_date } = req.query;

        // Query data
        let query = 'SELECT * FROM ';
        const params = [];

        if (type === 'patient') {
            query += 'patient_requests';
        } else if (type === 'provider') {
            query += 'provider_applications';
        }

        if (from_date || to_date) {
            query += ' WHERE ';
            if (from_date) {
                query += `created_at >= $${params.length + 1}`;
                params.push(from_date);
            }
            if (to_date) {
                query += `${from_date ? ' AND ' : ''}created_at <= $${params.length + 1}`;
                params.push(to_date);
            }
        }

        const result = await pool.query(query, params);

        // Log audit
        auditLog(req.user.id, 'EXPORT_DATA', 'export', { 
            format,
            type,
            recordCount: result.rows.length,
            ip: req.ip 
        });

        if (format === 'csv') {
            const csv = convertToCSV(result.rows);
            res.header('Content-Type', 'text/csv');
            res.header('Content-Disposition', `attachment; filename="export-${Date.now()}.csv"`);
            res.send(csv);
        } else if (format === 'json') {
            res.json(result.rows);
        }

    } catch (error) {
        logger.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// Helper functions
async function sendNotifications(type, data) {
    try {
        // Email to admin
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.ADMIN_EMAIL,
            subject: `New ${type === 'patient_request' ? 'Patient Request' : 'Provider Application'}`,
            html: `
                <h2>New ${type === 'patient_request' ? 'Patient Request' : 'Provider Application'}</h2>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Location:</strong> ${data.location}</p>
                ${data.urgency === 'emergency' ? '<p style="color: red;"><strong>URGENT: Emergency Request</strong></p>' : ''}
                <p>Login to the admin dashboard to view details.</p>
            `
        });

        // SMS for urgent requests
        if (data.urgency === 'emergency' || data.urgency === 'high') {
            await twilioClient.messages.create({
                body: `URGENT: New patient request from ${data.name} in ${data.location}. Check admin dashboard.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: process.env.ADMIN_PHONE
            });
        }

        // Store notification in database
        await pool.query(
            `INSERT INTO notifications (type, recipient, message) VALUES ($1, $2, $3)`,
            ['admin_notification', process.env.ADMIN_EMAIL, `New ${type} from ${data.name}`]
        );

    } catch (error) {
        logger.error('Notification error:', error);
    }
}

async function sendStatusUpdateNotification(data, newStatus) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: data.email,
            subject: 'Update on Your True North Advocates Request',
            html: `
                <h2>Status Update</h2>
                <p>Dear ${data.name},</p>
                <p>Your request status has been updated to: <strong>${newStatus}</strong></p>
                <p>We will contact you soon with more information.</p>
                <p>Best regards,<br>True North Advocates Team</p>
            `
        });
    } catch (error) {
        logger.error('Status notification error:', error);
    }
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => 
                JSON.stringify(row[header] || '')
            ).join(',')
        )
    ].join('\n');
    
    return csv;
}

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Initialize and start server
async function startServer() {
    try {
        await initializeDatabase();
        await redis.connect();
        
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Server startup error:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
