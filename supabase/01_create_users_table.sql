
-- 1) extensão para uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2) criar tabela users
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email varchar(255) UNIQUE NOT NULL,
  password_hash varchar(255) NOT NULL,
  name varchar(255),
  role varchar(50),
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  is_active boolean DEFAULT true
);

-- índice em email (já há UNIQUE mas deixo explícito)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

-- 3) habilitar Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4) policies

-- Usuários podem ver apenas seus próprios dados (SELECT)
CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem inserir apenas registros com seu próprio id (INSERT)
-- (normalmente o app define id = auth.uid() no INSERT)
CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar apenas seus próprios dados (UPDATE)
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Usuários podem excluir apenas seus próprios dados (DELETE)
CREATE POLICY "Users can delete own data"
  ON public.users
  FOR DELETE
  USING (auth.uid() = id);

-- Admins podem gerenciar todos os dados
-- Recomenda-se checar a role a partir dos claims JWT (suporta Supabase auth)
CREATE POLICY "Admins can manage all users"
  ON public.users
  FOR ALL
  USING ( current_setting('jwt.claims.role', true) = 'admin' )
  WITH CHECK ( current_setting('jwt.claims.role', true) = 'admin' );

-- Alternativa: se a verificação de admin for via coluna da própria row (menos comum),
-- descomente a seguinte policy (substituir a anterior) — NÃO recomendado por segurança:
-- CREATE POLICY "Admins can manage all users (row-based)" ON public.users FOR ALL USING (role = 'admin') WITH CHECK (role = 'admin');

-- 5) Exemplo: criar um usuário (nota: em produção insira password_hash gerado com bcrypt)
-- INSERT INTO public.users (id, email, password_hash, name, role)
-- VALUES ('00000000-0000-0000-0000-000000000001', 'admin@example.com', '<bcrypt-hash>', 'Admin', 'admin');

-- FIM
