import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getMedicamentos, atualizarQuantidadeMedicamento } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.get('/api/medicamentos', async (req, res) => {
	try {
		const meds = await getMedicamentos();
		res.json(meds);
	} catch (err) {
		res.status(500).json({ error: 'Erro ao consultar medicamentos.' });
	}
});

// Rota para atualizar quantidade de medicamento
app.patch('/api/medicamentos/quantidade', async (req, res) => {
	const { nome, quantidade } = req.body;
	
	console.log('Recebida requisição para atualizar:', { nome, quantidade });
	
	if (!nome || quantidade === undefined) {
		return res.status(400).json({ success: false, error: 'Nome e quantidade obrigatórios.' });
	}
	
	try {
		const medicamentoAtualizado = await atualizarQuantidadeMedicamento(nome, quantidade);
		console.log('Medicamento atualizado com sucesso:', medicamentoAtualizado);
		res.json({ 
			success: true, 
			medicamento: medicamentoAtualizado 
		});
	} catch (err) {
		console.error('Erro ao atualizar quantidade:', err);
		res.status(500).json({ 
			success: false, 
			error: err.message || 'Erro ao atualizar quantidade.' 
		});
	}
});

app.listen(PORT, () => {
	console.log(`Servidor rodando em http://localhost:${PORT}`);
});
