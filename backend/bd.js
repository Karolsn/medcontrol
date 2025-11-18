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
        // Tentar login usando o banco local
        const result = await localDB.verifyCredentials(username, password);
        
        if (result.success) {
            showToast('Login realizado com sucesso!', 'success');
            
            // Salvar info do usuário
            localStorage.setItem('user', JSON.stringify(result.user));
            
            setTimeout(() => {
                window.location.href = 'principal.html';
            }, 1500);
        } else {
            showToast('Usuário ou senha incorretos!', 'error');
            document.getElementById('password').value = '';
            loginForm.classList.add('shake');
            setTimeout(() => loginForm.classList.remove('shake'), 500);
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showToast('Erro ao processar login', 'error');
    }
});