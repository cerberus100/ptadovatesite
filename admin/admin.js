/**
 * Admin Dashboard JavaScript
 * Handles patient assistance request management
 */

// Mock data for demonstration
let requestsData = [
    {
        id: 'REQ-001',
        patientName: 'John Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567',
        dateSubmitted: '2024-01-15',
        woundLocation: 'lower_leg_foot_L',
        woundDescription: 'Diabetic ulcer on left foot, non-healing for 3 months',
        insurance: 'Medicare',
        previousTreatment: 'Topical antibiotics, wound dressing changes',
        status: 'pending',
        priority: 'high',
        assignedTo: null,
        notes: 'Patient reports increasing pain and discharge',
        preferredContact: 'phone'
    },
    {
        id: 'REQ-002',
        patientName: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        phone: '(555) 234-5678',
        dateSubmitted: '2024-01-14',
        woundLocation: 'chest',
        woundDescription: 'Post-surgical wound dehiscence after cardiac surgery',
        insurance: 'Blue Cross Blue Shield',
        previousTreatment: 'Surgical revision, antibiotics',
        status: 'in-progress',
        priority: 'urgent',
        assignedTo: 'Dr. Johnson',
        notes: 'Referred to wound care specialist. Follow-up scheduled for next week.',
        preferredContact: 'email'
    },
    {
        id: 'REQ-003',
        patientName: 'Robert Wilson',
        email: 'robert.wilson@email.com',
        phone: '(555) 345-6789',
        dateSubmitted: '2024-01-13',
        woundLocation: 'upper_back',
        woundDescription: 'Pressure ulcer stage 3 from prolonged bed rest',
        insurance: 'Medicaid',
        previousTreatment: 'Pressure relief, wound cleaning',
        status: 'completed',
        priority: 'medium',
        assignedTo: 'Dr. Martinez',
        notes: 'Successfully connected with wound care specialist. Treatment plan established.',
        preferredContact: 'phone'
    },
    {
        id: 'REQ-004',
        patientName: 'Jennifer Brown',
        email: 'jennifer.brown@email.com',
        phone: '(555) 456-7890',
        dateSubmitted: '2024-01-12',
        woundLocation: 'forearm_hand_R',
        woundDescription: 'Burn wound on right hand from kitchen accident',
        insurance: 'Aetna',
        previousTreatment: 'Emergency care, initial wound cleaning',
        status: 'pending',
        priority: 'medium',
        assignedTo: null,
        notes: 'Patient seeking plastic surgeon for cosmetic considerations',
        preferredContact: 'email'
    },
    {
        id: 'REQ-005',
        patientName: 'Michael Davis',
        email: 'michael.davis@email.com',
        phone: '(555) 567-8901',
        dateSubmitted: '2024-01-11',
        woundLocation: 'upper_leg_R',
        woundDescription: 'Venous leg ulcer, chronic condition',
        insurance: 'Medicare',
        previousTreatment: 'Compression therapy, wound dressings',
        status: 'in-progress',
        priority: 'medium',
        assignedTo: 'Dr. Lee',
        notes: 'Vascular consultation recommended. Insurance approval pending.',
        preferredContact: 'phone'
    },
    {
        id: 'REQ-006',
        patientName: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 678-9012',
        dateSubmitted: '2024-01-10',
        woundLocation: 'abdomen',
        woundDescription: 'Infected surgical site after appendectomy',
        insurance: 'United Healthcare',
        previousTreatment: 'Antibiotics, wound irrigation',
        status: 'completed',
        priority: 'high',
        assignedTo: 'Dr. Smith',
        notes: 'Successfully treated with IV antibiotics. Wound healing well.',
        preferredContact: 'email'
    },
    {
        id: 'REQ-007',
        patientName: 'David Thompson',
        email: 'david.thompson@email.com',
        phone: '(555) 789-0123',
        dateSubmitted: '2024-01-09',
        woundLocation: 'head_neck',
        woundDescription: 'Facial laceration from accident requiring reconstruction',
        insurance: 'Cigna',
        previousTreatment: 'Emergency suturing, wound care',
        status: 'pending',
        priority: 'urgent',
        assignedTo: null,
        notes: 'Patient needs plastic surgeon for facial reconstruction',
        preferredContact: 'phone'
    },
    {
        id: 'REQ-008',
        patientName: 'Lisa Anderson',
        email: 'lisa.anderson@email.com',
        phone: '(555) 890-1234',
        dateSubmitted: '2024-01-08',
        woundLocation: 'lower_leg_foot_R',
        woundDescription: 'Arterial ulcer on right ankle, poor circulation',
        insurance: 'Medicare',
        previousTreatment: 'Vascular assessment, wound dressing',
        status: 'in-progress',
        priority: 'high',
        assignedTo: 'Dr. Rodriguez',
        notes: 'Vascular surgery consultation scheduled. Revascularization being considered.',
        preferredContact: 'email'
    }
];

// Current filtered data
let filteredRequests = [...requestsData];

// Region labels mapping
const regionLabels = {
    'head_neck': 'Head & Neck',
    'upper_arm_L': 'Left Upper Arm',
    'upper_arm_R': 'Right Upper Arm',
    'forearm_hand_L': 'Left Forearm & Hand',
    'forearm_hand_R': 'Right Forearm & Hand',
    'chest': 'Chest',
    'abdomen': 'Abdomen',
    'groin_hip': 'Groin & Hip',
    'upper_leg_L': 'Left Upper Leg',
    'upper_leg_R': 'Right Upper Leg',
    'lower_leg_foot_L': 'Left Lower Leg & Foot',
    'lower_leg_foot_R': 'Right Lower Leg & Foot',
    'upper_back': 'Upper Back',
    'lower_back': 'Lower Back',
};

// Load and display requests
function loadRequests() {
    const tbody = document.getElementById('requests-table-body');
    tbody.innerHTML = '';
    
    filteredRequests.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.id}</td>
            <td>${request.patientName}</td>
            <td>${formatDate(request.dateSubmitted)}</td>
            <td>${getRegionLabel(request.woundLocation)}</td>
            <td><span class="status-badge status-${request.status}">${formatStatus(request.status)}</span></td>
            <td>
                <button class="action-btn" onclick="viewRequest('${request.id}')">View</button>
                <button class="action-btn" onclick="updateStatus('${request.id}')">Update</button>
                <button class="action-btn danger" onclick="deleteRequest('${request.id}')">Delete</button>
            </td>
        `;
        
        // Add click event to row for expanding details
        row.addEventListener('click', function(e) {
            if (!e.target.classList.contains('action-btn')) {
                toggleRequestDetails(request.id, row);
            }
        });
        
        tbody.appendChild(row);
    });
}

// Toggle request details
function toggleRequestDetails(requestId, row) {
    const existingDetails = row.nextElementSibling;
    
    if (existingDetails && existingDetails.classList.contains('request-details')) {
        existingDetails.remove();
        return;
    }
    
    const request = requestsData.find(r => r.id === requestId);
    if (!request) return;
    
    const detailsRow = document.createElement('tr');
    detailsRow.classList.add('request-details', 'active');
    detailsRow.innerHTML = `
        <td colspan="6">
            <div class="details-grid">
                <div class="detail-section">
                    <h4>Patient Information</h4>
                    <p><strong>Name:</strong> ${request.patientName}</p>
                    <p><strong>Email:</strong> ${request.email}</p>
                    <p><strong>Phone:</strong> ${request.phone}</p>
                    <p><strong>Preferred Contact:</strong> ${request.preferredContact}</p>
                    <p><strong>Insurance:</strong> ${request.insurance}</p>
                </div>
                <div class="detail-section">
                    <h4>Wound Details</h4>
                    <p><strong>Location:</strong> ${getRegionLabel(request.woundLocation)}</p>
                    <p><strong>Description:</strong> ${request.woundDescription}</p>
                    <p><strong>Previous Treatment:</strong> ${request.previousTreatment}</p>
                </div>
                <div class="detail-section">
                    <h4>Request Status</h4>
                    <p><strong>Status:</strong> <span class="status-badge status-${request.status}">${formatStatus(request.status)}</span></p>
                    <p><strong>Priority:</strong> ${request.priority}</p>
                    <p><strong>Assigned To:</strong> ${request.assignedTo || 'Unassigned'}</p>
                    <p><strong>Date Submitted:</strong> ${formatDate(request.dateSubmitted)}</p>
                </div>
                <div class="detail-section">
                    <h4>Notes</h4>
                    <p>${request.notes}</p>
                </div>
            </div>
        </td>
    `;
    
    row.after(detailsRow);
}

// Apply filters
function applyFilters() {
    const statusFilter = document.getElementById('status-filter').value;
    const dateFromFilter = document.getElementById('date-from').value;
    const dateToFilter = document.getElementById('date-to').value;
    const searchFilter = document.getElementById('search-filter').value.toLowerCase();
    
    filteredRequests = requestsData.filter(request => {
        // Status filter
        if (statusFilter && request.status !== statusFilter) {
            return false;
        }
        
        // Date range filter
        if (dateFromFilter && request.dateSubmitted < dateFromFilter) {
            return false;
        }
        if (dateToFilter && request.dateSubmitted > dateToFilter) {
            return false;
        }
        
        // Search filter
        if (searchFilter && !request.patientName.toLowerCase().includes(searchFilter) && 
            !request.id.toLowerCase().includes(searchFilter)) {
            return false;
        }
        
        return true;
    });
    
    loadRequests();
    updateStats();
}

// View request details
function viewRequest(requestId) {
    const request = requestsData.find(r => r.id === requestId);
    if (!request) return;
    
            // Create a detailed view modal or notification instead of alert
        const requestDetails = `ID: ${request.id}\nPatient: ${request.patientName}\nStatus: ${formatStatus(request.status)}\nLocation: ${getRegionLabel(request.woundLocation)}\n\nDescription: ${request.woundDescription}`;
        // For now, use a structured notification
        alert(requestDetails); // TODO: Replace with proper modal dialog
}

// Update request status
function updateStatus(requestId) {
    const request = requestsData.find(r => r.id === requestId);
    if (!request) return;
    
            // TODO: Replace with proper status dropdown modal
        const newStatus = prompt(`Current Status: ${formatStatus(request.status)}\n\nSelect new status:\n1. Pending\n2. In Progress\n3. Completed\n4. Cancelled\n\nEnter number (1-4):`);
    
    const statusMap = {
        '1': 'pending',
        '2': 'in-progress',
        '3': 'completed',
        '4': 'cancelled'
    };
    
    if (statusMap[newStatus]) {
        request.status = statusMap[newStatus];
        
        // Update assigned person if moving to in-progress
        if (statusMap[newStatus] === 'in-progress' && !request.assignedTo) {
            // TODO: Replace with proper assignment dropdown
        const assignedTo = prompt('Assign to (optional):');
            if (assignedTo) {
                request.assignedTo = assignedTo;
            }
        }
        
        loadRequests();
        updateStats();
        // TODO: Replace with notification system
        alert('Status updated successfully!');
    }
}

// Delete request
function deleteRequest(requestId) {
    // TODO: Replace with proper confirmation modal
    if (confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
        const index = requestsData.findIndex(r => r.id === requestId);
        if (index > -1) {
            requestsData.splice(index, 1);
            filteredRequests = filteredRequests.filter(r => r.id !== requestId);
            loadRequests();
            updateStats();
            // TODO: Replace with notification system
        alert('Request deleted successfully!');
        }
    }
}

// Update statistics
function updateStats() {
    const total = filteredRequests.length;
    const pending = filteredRequests.filter(r => r.status === 'pending').length;
    const inProgress = filteredRequests.filter(r => r.status === 'in-progress').length;
    const completed = filteredRequests.filter(r => r.status === 'completed').length;
    
    document.getElementById('total-requests').textContent = total;
    document.getElementById('pending-requests').textContent = pending;
    document.getElementById('in-progress-requests').textContent = inProgress;
    document.getElementById('completed-requests').textContent = completed;
}

// Export requests data
function exportRequests() {
    const csvContent = generateCSV(filteredRequests);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-requests-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Generate CSV content
function generateCSV(data) {
    const headers = ['ID', 'Patient Name', 'Email', 'Phone', 'Date Submitted', 'Wound Location', 'Status', 'Priority', 'Assigned To', 'Insurance'];
    const rows = data.map(request => [
        request.id,
        request.patientName,
        request.email,
        request.phone,
        request.dateSubmitted,
        getRegionLabel(request.woundLocation),
        formatStatus(request.status),
        request.priority,
        request.assignedTo || 'Unassigned',
        request.insurance
    ]);
    
    return [headers, ...rows].map(row => 
        row.map(field => `"${field}"`).join(',')
    ).join('\n');
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

function getRegionLabel(regionId) {
    return regionLabels[regionId] || regionId;
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Filter event listeners
    document.getElementById('status-filter').addEventListener('change', applyFilters);
    document.getElementById('date-from').addEventListener('change', applyFilters);
    document.getElementById('date-to').addEventListener('change', applyFilters);
    document.getElementById('search-filter').addEventListener('input', 
        debounce(applyFilters, 300)
    );
});

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Auto-refresh data every 30 seconds (in a real app, this would fetch from server)
setInterval(function() {
    // In a real application, this would fetch fresh data from the server
    // For demo purposes, we'll just update the timestamp
    // Auto-refreshing data
}, 30000); 