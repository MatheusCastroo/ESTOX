// Authentication JavaScript
// API_URL is defined in config.js

// Toggle password visibility
document.addEventListener('DOMContentLoaded', function() {
    // Login form password toggle
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            if (eyeIcon) {
                eyeIcon.classList.toggle('bi-eye');
                eyeIcon.classList.toggle('bi-eye-slash');
            }
        });
    }
    
    // Register form password toggle
    const togglePasswordRegister = document.getElementById('togglePasswordRegister');
    const passwordInputRegister = document.getElementById('password');
    const eyeIconRegister = document.getElementById('eyeIconRegister');
    
    if (togglePasswordRegister && passwordInputRegister) {
        togglePasswordRegister.addEventListener('click', function() {
            const type = passwordInputRegister.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInputRegister.setAttribute('type', type);
            
            if (eyeIconRegister) {
                eyeIconRegister.classList.toggle('bi-eye');
                eyeIconRegister.classList.toggle('bi-eye-slash');
            }
        });
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    // Check if API_URL is defined
    if (typeof API_URL === 'undefined') {
        const errorAlert = document.getElementById('errorAlert');
        if (errorAlert) {
            errorAlert.textContent = 'Erro: API_URL não está definido. Verifique se config.js está carregado.';
            errorAlert.classList.remove('d-none');
        }
        console.error('API_URL is not defined');
        return;
    }
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('submitBtn');
    const spinner = document.getElementById('spinner');
    const errorAlert = document.getElementById('errorAlert');
    
    // Show loading
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');
    errorAlert.classList.add('d-none');
    
    try {
        const response = await fetch(`${API_URL}/auth?action=login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        // Check if response is ok before parsing JSON
        if (!response.ok) {
            let errorMessage = 'Erro ao fazer login';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
            }
            errorAlert.textContent = errorMessage;
            errorAlert.classList.remove('d-none');
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Save token
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Show error
            errorAlert.textContent = data.error || 'Erro ao fazer login';
            errorAlert.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        console.error('API_URL:', API_URL);
        console.error('URL completa:', `${API_URL}/auth?action=login`);
        
        let errorMessage = 'Erro de conexão. Tente novamente.';
        
        // More specific error messages
        if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
            errorMessage = `Erro de conexão. Verifique se a API está acessível em: ${API_URL}\n\n` +
                          `Teste acessando: ${API_URL}/test.php no navegador para verificar se a API está funcionando.`;
        } else if (error.message && error.message.includes('CORS')) {
            errorMessage = 'Erro de CORS. Verifique a configuração do servidor.';
        } else if (error.message) {
            errorMessage = 'Erro: ' + error.message;
        }
        
        errorAlert.textContent = errorMessage;
        errorAlert.classList.remove('d-none');
    } finally {
        submitBtn.disabled = false;
        spinner.classList.add('d-none');
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    
    // Check if API_URL is defined
    if (typeof API_URL === 'undefined') {
        const errorAlert = document.getElementById('registerError');
        if (errorAlert) {
            errorAlert.textContent = 'Erro: API_URL não está definido. Verifique se config.js está carregado.';
            errorAlert.classList.remove('d-none');
        }
        console.error('API_URL is not defined');
        return;
    }
    
    // Get form elements
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const storeNameInput = document.getElementById('storeName');
    const phoneInput = document.getElementById('phone');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    const planInput = document.getElementById('plan');
    
    // Get UI elements
    const submitBtn = document.getElementById('registerSubmitBtn');
    const spinner = document.getElementById('registerSpinner');
    const errorAlert = document.getElementById('registerError');
    
    // Validate all required fields exist
    if (!nameInput || !emailInput || !passwordInput || !submitBtn || !spinner || !errorAlert) {
        console.error('Elementos do formulário não encontrados');
        return;
    }
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validate required fields
    if (!name || !email || !password) {
        errorAlert.textContent = 'Por favor, preencha todos os campos obrigatórios';
        errorAlert.classList.remove('d-none');
        return;
    }
    
    // Show loading
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');
    errorAlert.classList.add('d-none');
    
    try {
        // First, register the user
        const registerResponse = await fetch(`${API_URL}/auth?action=register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email, 
                password, 
                name 
            })
        });
        
        // Check if response is ok before parsing JSON
        if (!registerResponse.ok) {
            let errorMessage = 'Erro ao criar conta';
            try {
                const errorData = await registerResponse.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                errorMessage = `Erro HTTP ${registerResponse.status}: ${registerResponse.statusText}`;
            }
            errorAlert.textContent = errorMessage;
            errorAlert.classList.remove('d-none');
            return;
        }
        
        const registerData = await registerResponse.json();
        
        if (!registerData.success) {
            errorAlert.textContent = registerData.error || 'Erro ao criar conta';
            errorAlert.classList.remove('d-none');
            return;
        }
        
        // Save token and user
        localStorage.setItem('token', registerData.data.token);
        localStorage.setItem('user', JSON.stringify(registerData.data.user));
        
        // If store information is provided, create the store
        if (storeNameInput && storeNameInput.value.trim()) {
            try {
                const storeData = {
                    name: storeNameInput.value.trim(),
                    slug: storeNameInput.value.trim()
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, ''),
                    phone: phoneInput ? phoneInput.value.trim() : null,
                    city: cityInput ? cityInput.value.trim() : null,
                    state: stateInput ? stateInput.value : null,
                    plan_slug: planInput ? planInput.value : null
                };
                
                const storeResponse = await fetch(`${API_URL}/stores`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${registerData.data.token}`
                    },
                    body: JSON.stringify(storeData)
                });
                
                // Even if store creation fails, redirect to onboarding
                // The user can complete store setup there
            } catch (storeError) {
                console.error('Erro ao criar loja:', storeError);
                // Continue to redirect anyway
            }
        }
        
        // Redirect to onboarding
        window.location.href = 'onboarding.html';
        
    } catch (error) {
        console.error('Erro ao criar conta:', error);
        console.error('API_URL:', API_URL);
        console.error('URL completa:', `${API_URL}/auth?action=register`);
        
        let errorMessage = 'Erro de conexão. Verifique se a API está rodando e tente novamente.';
        
        // More specific error messages
        if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
            errorMessage = `Erro de conexão. Verifique se a API está acessível em: ${API_URL}\n\n` +
                          `Teste acessando: ${API_URL}/test.php no navegador para verificar se a API está funcionando.`;
        } else if (error.message && error.message.includes('CORS')) {
            errorMessage = 'Erro de CORS. Verifique a configuração do servidor.';
        } else if (error.message) {
            errorMessage = 'Erro: ' + error.message;
        }
        
        errorAlert.textContent = errorMessage;
        errorAlert.classList.remove('d-none');
    } finally {
        submitBtn.disabled = false;
        spinner.classList.add('d-none');
    }
}

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}



