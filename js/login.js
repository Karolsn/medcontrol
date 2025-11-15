// Elementos DOM
const loginForm = document.getElementById('loginForm');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const toast = document.getElementById('toast');

// Alternar visibilidade da senha
togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Alterar ícone
    this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

// Função para mostrar notificações toast
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast';
    
    if (type === 'error') {
        toast.classList.add('error');
    } else {
        toast.style.background = 'var(--success)';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Processar login
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Validação simples
    if (!username || !password) {
        showToast('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Login realizado com sucesso!', 'success');
            
            // Salvar info do usuário
            localStorage.setItem('user', JSON.stringify(data.user));
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showToast('Usuário ou senha incorretos!', 'error');
            document.getElementById('password').value = '';
            loginForm.classList.add('shake');
            setTimeout(() => loginForm.classList.remove('shake'), 500);
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showToast('Erro de conexão com o servidor', 'error');
        
        // Fallback para credenciais locais se o servidor estiver offline
        const validCredentials = {
            'karol': 'karol',
            'admin': 'admin123',
            'usuario': 'senha123'
        };
        
        if (validCredentials[username] && validCredentials[username] === password) {
            showToast('Login realizado com sucesso! (Modo Offline)', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showToast('Usuário ou senha incorretos!', 'error');
            document.getElementById('password').value = '';
            loginForm.classList.add('shake');
            setTimeout(() => loginForm.classList.remove('shake'), 500);
        }
    }
});

// Adicionar estilo para animação de shake
const style = document.createElement('style');
style.textContent = `
    .shake {
        animation: shake 0.5s;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);