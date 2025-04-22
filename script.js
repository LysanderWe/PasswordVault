let masterPassword = '';
let passwords = [];
let isAuthenticated = false;

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('passwordVault');
    if (savedData) {
        const data = JSON.parse(savedData);
        passwords = data.passwords || [];
    }
}

// Save data to localStorage
function saveData() {
    const data = {
        passwords: passwords
    };
    localStorage.setItem('passwordVault', JSON.stringify(data));
}

// Authentication
function authenticate() {
    const inputPassword = document.getElementById('masterPassword').value;
    if (inputPassword.length < 4) {
        alert('Master password must be at least 4 characters');
        return;
    }

    masterPassword = inputPassword;
    isAuthenticated = true;

    document.getElementById('authSection').style.display = 'none';
    document.getElementById('vaultSection').style.display = 'block';

    loadData();
    displayPasswords();
}

// Show add password form
function showAddForm() {
    document.getElementById('addForm').style.display = 'block';
}

// Cancel adding password
function cancelAdd() {
    document.getElementById('addForm').style.display = 'none';
    clearAddForm();
}

// Clear add form
function clearAddForm() {
    document.getElementById('siteName').value = '';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Add new password
function addPassword() {
    const siteName = document.getElementById('siteName').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!siteName || !username || !password) {
        alert('All fields are required');
        return;
    }

    const newPassword = {
        id: Date.now(),
        site: siteName,
        username: username,
        password: password,
        created: new Date().toISOString()
    };

    passwords.push(newPassword);
    saveData();
    displayPasswords();
    cancelAdd();
}

// Display passwords
function displayPasswords() {
    const passwordList = document.getElementById('passwordList');

    if (passwords.length === 0) {
        passwordList.innerHTML = '<p style="text-align: center; color: #666;">No passwords saved yet</p>';
        return;
    }

    passwordList.innerHTML = passwords.map(pwd => `
        <div class="password-item">
            <div class="password-info">
                <h4>${pwd.site}</h4>
                <p>Username: ${pwd.username}</p>
                <p>Password: <span id="pwd-${pwd.id}" class="hidden-password">••••••••</span></p>
            </div>
            <div class="password-actions">
                <button onclick="togglePassword(${pwd.id})">Show</button>
                <button onclick="copyToClipboard('${pwd.password}')">Copy</button>
                <button class="delete-btn" onclick="deletePassword(${pwd.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Toggle password visibility
function togglePassword(id) {
    const passwordSpan = document.getElementById(`pwd-${id}`);
    const password = passwords.find(p => p.id === id).password;
    const button = event.target;

    if (passwordSpan.classList.contains('hidden-password')) {
        passwordSpan.textContent = password;
        passwordSpan.className = 'visible-password';
        button.textContent = 'Hide';
    } else {
        passwordSpan.textContent = '••••••••';
        passwordSpan.className = 'hidden-password';
        button.textContent = 'Show';
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Password copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy password');
    });
}

// Delete password
function deletePassword(id) {
    if (confirm('Are you sure you want to delete this password?')) {
        passwords = passwords.filter(p => p.id !== id);
        saveData();
        displayPasswords();
    }
}

// Generate random password
function generatePassword() {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    document.getElementById('password').value = password;
    showAddForm();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('masterPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            authenticate();
        }
    });
});