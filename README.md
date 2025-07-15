# 🤝 Helping Hands Patient Advocate Website

A comprehensive **static site** for patient advocacy designed to connect patients with wound care specialists and provide assistance with navigating healthcare systems. Built for **AWS Amplify** deployment.

## 🎯 Project Overview

This project provides a complete patient advocacy platform as a **static website** with the following key features:

### Core Features
- **Provider Directory**: Searchable database of wound care specialists
- **Interactive Body Map**: Professional SVG-based wound location selection tool
- **Patient Assistance Forms**: Streamlined request submission
- **Admin Dashboard**: Complete request management system with authentication
- **Mobile-Responsive Design**: Optimized for all devices
- **Static Site Architecture**: No backend dependencies, optimized for AWS Amplify

### Target Audience
- Patients seeking wound care specialists
- Healthcare navigators and advocates
- Medical administrators and case managers
- Insurance coordinators

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ptadvocatesite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build CSS**
   ```bash
   npm run build-css
   ```

4. **Start development server**
   ```bash
   # For local development, use any static server
   npx serve .
   # or use Live Server extension in VS Code
   ```

The site will be available at `http://localhost:3000`

## 📁 Project Structure

```
ptadvocatesite/
├── index.html                 # Main landing page
├── assets/
│   ├── css/
│   │   └── style.min.css     # Compiled CSS
│   ├── scss/
│   │   ├── style.scss        # Main SCSS file
│   │   ├── _variables.scss   # Design system variables
│   │   └── _buttons.scss     # Button styles
│   ├── js/
│   │   └── main.js          # Main JavaScript functionality
│   └── bodymap.svg          # Interactive body map SVG
├── admin/
│   ├── index.html           # Admin login page
│   ├── dashboard.html       # Admin dashboard
│   └── admin.js            # Admin functionality
├── forms/
│   └── gravity-forms-export.json  # Form configurations (reference)
├── theme/
│   ├── functions.php        # WordPress functions (reference only)
│   └── acf-provider-fields.json   # ACF field configurations (reference)
├── wp-content/              # WordPress plugin assets (reference)
│   └── plugins/
│       └── hh-bodymap/     # Original WordPress body map plugin
├── package.json             # Dependencies and scripts
├── amplify.yml             # AWS Amplify build configuration
└── README.md               # This file
```

## 🎨 Design System

### Brand Colors
- **Primary Navy**: #26547C
- **Secondary Teal**: #46B5A4  
- **Accent Coral**: #FF6B5D
- **Neutral Gray**: #6C757D

### Typography
- **Primary Font**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- **Headings**: Bold, Navy (#26547C)
- **Body Text**: Regular, Dark Gray (#333)

### Components
- **Buttons**: Rounded corners, hover animations
- **Cards**: Subtle shadows, clean borders
- **Forms**: Inline validation, accessibility features
- **Navigation**: Sticky header, mobile hamburger menu

## 🔧 Technical Features

### Frontend Technologies
- **HTML5**: Semantic markup with accessibility features
- **CSS3/SCSS**: Modern styling with variables and mixins
- **JavaScript**: Vanilla JS for optimal performance
- **SVG**: Interactive body map with clickable regions

### Key Functionality
- **Provider Search**: Filter by location, specialty, and wound type
- **Body Map Interaction**: Click regions to find relevant specialists
- **Form Validation**: Real-time validation with user feedback
- **Admin Dashboard**: Complete request management with filtering
- **Data Export**: CSV export capability for admin users
- **Responsive Design**: Mobile-first approach

### Performance Optimizations
- **Minified CSS**: Compressed stylesheets
- **Static Assets**: No database dependencies
- **Lazy Loading**: Efficient resource loading
- **Caching Headers**: Browser caching optimization

## 🌐 Deployment

### AWS Amplify Deployment

This project is **specifically configured** for AWS Amplify static site hosting:

1. **Connect Repository**: Link your Git repository to AWS Amplify
2. **Build Settings**: Uses the included `amplify.yml` configuration
3. **Deploy**: Automatic deployments on code changes

### Build Configuration
The `amplify.yml` file includes:
- Node.js 18 runtime
- SCSS compilation via npm scripts
- Static file deployment
- Asset optimization

### Environment Variables
No environment variables required for basic functionality.

## 👥 Usage Guide

### For Patients
1. **Find Providers**: Use the search and filter tools to locate specialists
2. **Body Map**: Click on wound locations to see relevant providers
3. **Request Help**: Submit assistance requests through the form
4. **Get Connected**: Receive follow-up from patient advocates

### For Administrators
1. **Login**: Access the admin dashboard at `/admin/`
2. **Demo Login**: Use any username/password for demonstration
3. **Manage Requests**: View, filter, and update patient requests
4. **Track Progress**: Monitor request status and outcomes
5. **Export Data**: Download request data for reporting

## 🎯 Core Sections

### 1. Hero Section
- **Purpose**: Immediate value proposition
- **Features**: Call-to-action buttons, professional imagery
- **Goal**: Convert visitors to users

### 2. Provider Directory
- **Search Functionality**: Location, specialty, wound type filters
- **Provider Cards**: Contact info, specialties, ratings
- **Integration**: Connected to body map selections

### 3. Interactive Body Map
- **Professional SVG**: 14 anatomical regions with hover effects
- **Click Regions**: Head/neck, chest, arms, legs, back areas
- **Specialist Matching**: Contextual provider recommendations
- **Accessibility**: ARIA labels, keyboard navigation

### 4. Patient Assistance
- **Request Form**: Comprehensive intake process
- **Validation**: Real-time form validation
- **Submission**: Streamlined request processing

### 5. Admin Dashboard
- **Authentication**: Simple login system (demo mode)
- **Request Management**: View, update, delete operations
- **Filtering**: Status, date, and search filters
- **Export**: CSV data export functionality
- **Statistics**: Real-time request metrics

## 📊 Data & Mock Content

### Mock Data Included
- **8 Sample Providers**: Wound care specialists with detailed profiles
- **14 Body Regions**: Comprehensive anatomical coverage
- **8 Sample Requests**: Patient assistance requests for demo
- **Multiple Specialties**: Wound care, dermatology, vascular, podiatry

### Data Structure
- **Providers**: Name, specialty, location, contact, wound types
- **Requests**: Patient info, wound details, status, priority
- **Body Map**: Region IDs, labels, associated specialties

## 🔒 Security & Privacy

### Data Protection
- **Form Validation**: Input sanitization
- **Admin Authentication**: Login protection (demo mode)
- **Session Management**: Local storage for demo
- **HTTPS**: SSL encryption required

### Privacy Considerations
- **Data Collection**: Minimal necessary information
- **Storage**: Local storage for demo purposes
- **Compliance**: HIPAA-ready architecture

## 🚀 Future Enhancements

### Planned Features
- **Real Backend**: Replace mock data with API
- **Database Integration**: Patient and provider data storage
- **Authentication**: Real user management system
- **Payment Processing**: Insurance and payment handling
- **Mobile App**: Native mobile applications

### Technical Improvements
- **API Development**: RESTful API for data management
- **Advanced Analytics**: Detailed reporting dashboard
- **Performance Monitoring**: Real-time error tracking
- **Content Management**: Dynamic content updates

## 🛠️ Development

### Build Scripts
```bash
# Install dependencies
npm install

# Build CSS from SCSS
npm run build-css

# Watch for SCSS changes
npm run watch-css

# Clean build files
npm run clean
```

### Development Guidelines
1. **Code Style**: Follow existing patterns
2. **Testing**: Ensure cross-browser compatibility
3. **Documentation**: Update README for new features
4. **Accessibility**: Maintain WCAG compliance

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Modern healthcare websites
- **Icon Library**: Emoji-based icons for accessibility
- **Color Palette**: Healthcare-focused color psychology
- **Typography**: System fonts for performance

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: Production Ready for AWS Amplify**
