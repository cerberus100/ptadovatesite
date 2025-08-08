# True North Advocates Backend API

## Overview
This is the backend API for True North Advocates patient advocacy platform. It handles patient requests, provider applications, admin dashboard functionality, and ensures HIPAA compliance.

## Features
- ✅ Patient assistance request submission
- ✅ Provider application processing
- ✅ Admin dashboard API
- ✅ Real-time notifications (Email & SMS)
- ✅ HIPAA-compliant data handling
- ✅ Role-based access control (RBAC)
- ✅ Comprehensive audit logging
- ✅ Data export (CSV/PDF)
- ✅ Rate limiting and security headers
- ✅ Auto-save form data
- ✅ SSL/TLS encryption

## Tech Stack
- Node.js + Express
- PostgreSQL (primary database)
- Redis (caching & session management)
- SendGrid (email notifications)
- Twilio (SMS notifications)
- JWT (authentication)
- Helmet (security headers)
- Winston (logging)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database:
```bash
createdb truenorth_advocates
```

3. Set up Redis:
```bash
redis-server
```

4. Copy environment variables:
```bash
cp .env.example .env
```

5. Configure your `.env` file with actual values

6. Run database migrations:
```bash
npm run migrate
```

7. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## API Endpoints

### Public Endpoints
- `POST /api/patient-assistance` - Submit patient request
- `POST /api/provider-application` - Submit provider application

### Protected Endpoints (Requires Authentication)
- `GET /api/submissions` - Get all submissions
- `PUT /api/submissions/:id/status` - Update submission status
- `POST /api/communications/send` - Send email/SMS
- `GET /api/export/:format` - Export data (CSV/JSON)
- `GET /api/analytics` - Get analytics data

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

## Security & Compliance

### HIPAA Compliance
- All PHI (Protected Health Information) is encrypted at rest and in transit
- Comprehensive audit logging for all data access
- Automatic session timeout after 15 minutes of inactivity
- Role-based access control with granular permissions
- Data retention policies (7 years for medical records)

### Security Features
- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- JWT token blacklisting

## Database Schema

### patient_requests
- id (SERIAL PRIMARY KEY)
- name (VARCHAR 255)
- email (VARCHAR 255)
- phone (VARCHAR 20)
- location (VARCHAR 255)
- wound_type (VARCHAR 100)
- urgency (VARCHAR 50)
- message (TEXT)
- status (VARCHAR 50)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### provider_applications
- id (SERIAL PRIMARY KEY)
- name (VARCHAR 255)
- credentials (VARCHAR 255)
- specialties (TEXT[])
- location (VARCHAR 255)
- phone (VARCHAR 20)
- email (VARCHAR 255)
- status (VARCHAR 50)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### users
- id (SERIAL PRIMARY KEY)
- name (VARCHAR 255)
- email (VARCHAR 255 UNIQUE)
- password_hash (VARCHAR 255)
- role (VARCHAR 50)
- permissions (JSONB)
- created_at (TIMESTAMP)
- last_login (TIMESTAMP)

### audit_logs
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER)
- action (VARCHAR 255)
- resource (VARCHAR 255)
- details (JSONB)
- ip_address (VARCHAR 45)
- created_at (TIMESTAMP)

## Monitoring & Logging

### Logging Levels
- Error: Application errors
- Warn: Warning conditions
- Info: General information
- Debug: Debugging information

### Log Files
- `error.log` - Error-level logs only
- `combined.log` - All logs
- `audit.log` - HIPAA compliance audit trail

## Deployment

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Use strong JWT secret
- [ ] Configure SSL certificates
- [ ] Set up database backups
- [ ] Configure monitoring (Sentry)
- [ ] Set up log rotation
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Test all security headers

### Recommended Hosting
- AWS EC2 or ECS for application
- AWS RDS for PostgreSQL
- AWS ElastiCache for Redis
- AWS S3 for file storage
- CloudFlare for CDN/DDoS protection

## Testing

Run tests:
```bash
npm test
```

Run linting:
```bash
npm run lint
```

## Support

For technical support, contact: tech@truenorthadvocates.org

## License

Copyright © 2024 True North Advocates. All rights reserved.
