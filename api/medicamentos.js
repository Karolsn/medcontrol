// Função serverless para consulta de medicamentos
import { getMedicamentos } from '../backend/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const medicamentos = await getMedicamentos();
      res.status(200).json(medicamentos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Método não permitido' });
  }
}
