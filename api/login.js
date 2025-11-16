// Função serverless para login
export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    const usuarios = [
      { username: 'admin', password: '123456' },
      { username: 'usuario', password: 'senha' }
    ];
    const user = usuarios.find(u => u.username === username && u.password === password);
    if (user) {
      res.status(200).json({ success: true, message: 'Login realizado com sucesso!' });
    } else {
      res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
    }
  } else {
    res.status(405).json({ message: 'Método não permitido' });
  }
}
