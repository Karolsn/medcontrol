// Função serverless para consulta de medicamentos
import medicamentos from '../backend/medicamentos.js';

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(medicamentos);
  } else {
    res.status(405).json({ message: 'Método não permitido' });
  }
}
