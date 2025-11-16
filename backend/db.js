import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env da raiz do projeto (um nível acima do backend)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
// Para operações no backend, usar SERVICE_ROLE_KEY que bypassa RLS
// Se não existir, usar SUPABASE_KEY como fallback
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_KEY) devem estar configurados no arquivo .env');
}

// Criar cliente com service role key para bypassar RLS no backend
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Função para converter status do formato interno para o formato do banco
function convertStatusToDB(status) {
  switch(status) {
    case 'in-stock':
      return 'Em estoque';
    case 'low-stock':
      return 'Estoque baixo';
    case 'out-of-stock':
      return 'Fora de estoque';
    default:
      return 'Em estoque';
  }
}

export async function atualizarQuantidadeMedicamento(nome, quantidade) {
  console.log(`Tentando atualizar medicamento: nome="${nome}", quantidade=${quantidade}`);
  
  // Primeiro, verificar se o medicamento existe
  const { data: medicamentoExistente, error: errorBusca } = await supabase
    .from('medicamentos')
    .select('id, nome, quantidade, status')
    .eq('nome', nome)
    .maybeSingle();
    
  if (errorBusca) {
    console.error('Erro ao buscar medicamento:', errorBusca);
    throw errorBusca;
  }
  
  if (!medicamentoExistente) {
    // Tentar buscar sem case sensitivity
    const { data: medicamentoCaseInsensitive } = await supabase
      .from('medicamentos')
      .select('id, nome, quantidade, status')
      .ilike('nome', nome)
      .maybeSingle();
      
    if (medicamentoCaseInsensitive) {
      console.log(`Medicamento encontrado com busca case-insensitive: ${medicamentoCaseInsensitive.nome}`);
      nome = medicamentoCaseInsensitive.nome; // Usar o nome exato do banco
    } else {
      throw new Error(`Medicamento com nome "${nome}" não encontrado no banco de dados`);
    }
  } else {
    console.log(`Medicamento encontrado: id=${medicamentoExistente.id}, nome="${medicamentoExistente.nome}"`);
  }
  
  // Determinar o status baseado na quantidade (formato interno)
  let statusInternal = 'in-stock';
  if (quantidade === 0) {
    statusInternal = 'out-of-stock';
  } else if (quantidade < 50) {
    statusInternal = 'low-stock';
  }
  
  // Converter para o formato do banco de dados
  const statusDB = convertStatusToDB(statusInternal);
  
  console.log(`Atualizando: quantidade=${quantidade}, status=${statusDB}`);
  
  // Atualizar quantidade e status usando o nome exato do banco
  const { data, error } = await supabase
    .from('medicamentos')
    .update({ 
      quantidade: parseInt(quantidade),
      status: statusDB
    })
    .eq('nome', nome)
    .select();
    
  if (error) {
    console.error('Erro ao atualizar medicamento no Supabase:', error);
    console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
    throw error;
  }
  
  if (!data || data.length === 0) {
    throw new Error(`Falha ao atualizar: nenhum registro foi modificado para o medicamento "${nome}"`);
  }
  
  console.log(`Medicamento "${nome}" atualizado com sucesso: quantidade=${quantidade}, status=${statusDB}`);
  return data[0];
}

export async function getMedicamentos() {
  const { data, error } = await supabase
    .from('medicamentos')
    .select('*');
  if (error) throw error;
  // Agrupar por categoria para compatibilidade com o frontend
  const agrupados = {};
  data.forEach(med => {
    if (!agrupados[med.categoria]) agrupados[med.categoria] = [];
    agrupados[med.categoria].push(med);
  });
  return agrupados;
}
