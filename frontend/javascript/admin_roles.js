// ── Admin Roles JavaScript ─────────────────────────────────────────────────

// API Base URL
const API_BASE = 'http://localhost:5000';

// ── State ───────────────────────────────────────────────────────────────────
let admins = [];
let isLoading = false;

// ── API Functions ───────────────────────────────────────────────────────────

// Fetch all admins
async function fetchAdmins() {
    try {
        const response = await fetch(`${API_BASE}/admins`);
        const data = await response.json();
        if (data.status === 'success') {
            admins = data.admins || [];
            renderAdmins();
        }
    } catch (error) {
        console.error('Error fetching admins:', error);
        showToast('Failed to load admins', 'error');
    }
}

// Add new admin
async function addAdmin(adminData) {
    try {
        const response = await fetch(`${API_BASE}/admins/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminData)
        });
        const data = await response.json();
        if (data.status === 'success') {
            showToast('Admin added successfully', 'success');
            fetchAdmins();
            return true;
        } else {
            showToast(data.message || 'Failed to add admin', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error adding admin:', error);
        showToast('Failed to add admin', 'error');
        return false;
    }
}

// Delete/Revoke admin access
async function deleteAdmin(adminId) {
    try {
        const response = await fetch(`${API_BASE}/admins/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: adminId })
        });
        const data = await response.json();
        if (data.status === 'success') {
            showToast('Admin access revoked', 'success');
            fetchAdmins();
            return true;
        } else {
            showToast(data.message || 'Failed to revoke access', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error deleting admin:', error);
        showToast('Failed to revoke access', 'error');
        return false;
    }
}

// ── Render Functions ────────────────────────────────────────────────────────

function renderAdmins() {
    const grid = document.getElementById('admin-card-grid');
    
    if (!admins.length) {
        grid.innerHTML = `
            <div class="roles-empty">
                <i class="fas fa-users-slash"></i>
                <p>No admins found. Add an admin to get started.</p>
            </div>`;
        return;
    }

    grid.innerHTML = admins.map(admin => `
        <div class="admin-item-card">
            <div class="admin-item-top">
                <div class="admin-avatar">${getInitials(admin.name)}</div>
                <div>
                    <h4>${escapeHtml(admin.name)}</h4>
                    <p>${escapeHtml(admin.email)}</p>
                </div>
            </div>
            <div class="admin-item-mid">
                <div class="admin-item-badge">
                    <i class="fas fa-${getRoleIcon(admin.role)}"></i>
                    ${escapeHtml(admin.role).toUpperCase()}
                </div>
                <span class="admin-item-time">${formatTimeAgo(admin.last_login)}</span>
            </div>
            <button class="admin-item-btn" onclick="confirmDelete(${admin.id}, '${escapeHtml(admin.name)}')">
                <i class="far fa-trash-alt"></i> REVOKE ACCESS
            </button>
        </div>
    `).join('');
}

// ── Helper Functions ────────────────────────────────────────────────────────

function getInitials(name) {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function getRoleIcon(role) {
    const icons = {
        'super admin': 'user-shield',
        'manager': 'user-cog',
        'support': 'headset',
        'admin': 'user-gear'
    };
    return icons[role.toLowerCase()] || 'user';
}

function formatTimeAgo(dateString) {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} MIN AGO`;
    if (hours < 24) return `${hours} HR AGO`;
    if (days === 1) return 'YESTERDAY';
    return `${days} DAYS AGO`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ── Modal Functions ─────────────────────────────────────────────────────────

function openAddModal() {
    document.getElementById('add-admin-form').reset();
    document.getElementById('roles-modal-overlay').classList.add('open');
}

function closeAddModal() {
    document.getElementById('roles-modal-overlay').classList.remove('open');
}

function confirmDelete(adminId, adminName) {
    document.getElementById('delete-admin-id').value = adminId;
    document.getElementById('delete-admin-name').textContent = adminName;
    document.getElementById('delete-modal-overlay').classList.add('open');
}

function closeDeleteModal() {
    document.getElementById('delete-modal-overlay').classList.remove('open');
}

// ── Form Handlers ───────────────────────────────────────────────────────────

async function handleAddAdmin(event) {
    event.preventDefault();
    
    const name = document.getElementById('admin-name').value.trim();
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const role = document.getElementById('admin-role').value;
    
    if (!name || !email || !password || !role) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    const success = await addAdmin({ name, email, password, role });
    if (success) {
        closeAddModal();
    }
}

async function handleDeleteAdmin() {
    const adminId = document.getElementById('delete-admin-id').value;
    
    const success = await deleteAdmin(adminId);
    if (success) {
        closeDeleteModal();
    }
}

// ── Toast ───────────────────────────────────────────────────────────────────

function showToast(message, type = 'success') {
    const toast = document.getElementById('roles-toast');
    const icon = document.getElementById('roles-toast-icon');
    const msg = document.getElementById('roles-toast-msg');
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle'
    };
    
    toast.className = `roles-toast ${type}`;
    icon.className = `fas ${icons[type]}`;
    msg.textContent = message;
    
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Initialize ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners
    document.getElementById('add-admin-form').addEventListener('submit', handleAddAdmin);
    document.getElementById('confirm-delete-btn').addEventListener('click', handleDeleteAdmin);
    
    // Close modals on overlay click
    document.getElementById('roles-modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeAddModal();
    });
    document.getElementById('delete-modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeDeleteModal();
    });
    
    // Load admins
    fetchAdmins();
});