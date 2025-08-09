# Simple Admin Portal for True North Advocates

## Overview
A straightforward admin portal to view patient requests and provider applications. No complex integrations - just login and view submissions.

## Features
- ✅ Simple login page
- ✅ Dashboard with statistics
- ✅ View all submissions in one place
- ✅ Filter by type (patients/providers)
- ✅ Mark submissions as reviewed
- ✅ Auto-refresh every 30 seconds
- ✅ Session timeout for security

## Access
1. Go to the main website
2. Click the subtle "Admin" link in the footer
3. Login with credentials

## Default Credentials
- Username: `admin`
- Password: `TrueNorth2024!`

**IMPORTANT**: Change these credentials immediately!

## How to Change Password

### Option 1: Update in AWS Parameter Store (Recommended)
```bash
# Set username
aws ssm put-parameter --name "/tna/prod/ADMIN_USERNAME" --value "your-username" --type "SecureString"

# Set password (it will be hashed automatically)
aws ssm put-parameter --name "/tna/prod/ADMIN_PASSWORD_HASH" --value "$(echo -n 'YourNewPassword' | sha256sum | cut -d' ' -f1)" --type "SecureString"
```

### Option 2: Update in login.html (Quick but less secure)
Edit `admin/login.html` and change:
```javascript
const ADMIN_CREDENTIALS = {
    username: 'your-username',
    password: 'YourNewPassword'
};
```

## Dashboard Features

### Statistics Cards
- Total Submissions
- Pending Review
- Patient Requests
- Provider Applications

### Submissions Table
- View all submissions
- Filter by type
- See urgency levels (highlighted in red for emergencies)
- Mark items as reviewed
- Auto-refreshes every 30 seconds

### Security
- Session expires after 30 minutes
- Simple authentication
- Logout button clears session

## API Integration

The dashboard includes commented code to connect to the real API:

```javascript
// Uncomment this in simple-dashboard.html to use real API
async function fetchSubmissions() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('https://your-api-url/api/admin/submissions', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        // Process and display data
    } catch (error) {
        console.error('Failed to fetch submissions:', error);
    }
}
```

## Customization

### Add More Status Options
Edit the status badges in `simple-dashboard.html`:
```css
.status-approved {
    background: #28a745;
    color: #fff;
}
```

### Change Auto-Refresh Interval
Find this line and change 30000 (30 seconds) to your preferred milliseconds:
```javascript
setInterval(() => {
    refreshData();
}, 30000);
```

### Add Email/Phone Links
Make emails and phones clickable:
```javascript
<td><a href="mailto:${submission.email}">${submission.email}</a></td>
<td><a href="tel:${submission.phone}">${submission.phone}</a></td>
```

## Files
- `login.html` - Simple login page
- `simple-dashboard.html` - Main dashboard
- `simple-admin-api.js` - Backend Lambda function (optional)

## No External Dependencies
- No Twilio
- No SendGrid  
- No complex integrations
- Just view submissions!

That's it! A simple, functional admin portal.
