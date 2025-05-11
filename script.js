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

// Generate random password with better options
function generatePassword() {
    const options = {
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeSimilar: true
    };

    const result = createPassword(options);
    document.getElementById('password').value = result;
    showAddForm();
}

function createPassword(options = {}) {
    const defaults = {
        length: 12,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
        excludeSimilar: false
    };

    const config = { ...defaults, ...options };
    let charset = '';
    let requiredChars = [];

    if (config.includeLowercase) {
        const lowercase = config.excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
        charset += lowercase;
        requiredChars.push(lowercase[Math.floor(Math.random() * lowercase.length)]);
    }

    if (config.includeUppercase) {
        const uppercase = config.excludeSimilar ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        charset += uppercase;
        requiredChars.push(uppercase[Math.floor(Math.random() * uppercase.length)]);
    }

    if (config.includeNumbers) {
        const numbers = config.excludeSimilar ? '23456789' : '0123456789';
        charset += numbers;
        requiredChars.push(numbers[Math.floor(Math.random() * numbers.length)]);
    }

    if (config.includeSymbols) {
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        charset += symbols;
        requiredChars.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }

    if (charset === '') {
        charset = 'abcdefghijklmnopqrstuvwxyz';
        requiredChars.push('a');
    }

    let password = '';
    for (const char of requiredChars) {
        password += char;
    }

    for (let i = password.length; i < config.length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }

    return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('masterPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            authenticate();
        }
    });
});