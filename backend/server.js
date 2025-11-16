
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..')));

// Rota para raiz exibe index.html
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'intex.html'));
});

app.use(cors());
app.use(express.json());

// Simulação de usuários
const usuarios = [
	{ username: 'admin', password: '123456' },
	{ username: 'usuario', password: 'senha' }
];

// Simulação de medicamentos (pode ser expandido)
const medicamentos = require('./medicamentos');

// Rota de login
app.post('/api/login', (req, res) => {
	const { username, password } = req.body;
	const user = usuarios.find(u => u.username === username && u.password === password);
	if (user) {
		res.json({ success: true, message: 'Login realizado com sucesso!' });
	} else {
		res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
	}
});

// Rota para consulta de medicamentos
app.get('/api/medicamentos', (req, res) => {
	res.json(medicamentos);
});

app.listen(PORT, () => {
	console.log(`Servidor rodando em http://localhost:${PORT}`);
});
