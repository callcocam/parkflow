-- Script SQL Simplificado para ParkFlow
-- Execute este script no SQL Editor do Supabase

-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('volunteers', 'shifts', 'allocations', 'captains');

-- Se as tabelas não existirem, criar elas:

-- 1. Tabela de Voluntários (versão simplificada)
CREATE TABLE IF NOT EXISTS volunteers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    congregation TEXT NOT NULL,
    city TEXT NOT NULL,
    is_team_leader BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    unavailable_shifts TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Turnos
CREATE TABLE IF NOT EXISTS shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT NOT NULL,
    required_volunteers INTEGER NOT NULL DEFAULT 1,
    period_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Alocações
CREATE TABLE IF NOT EXISTS allocations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(shift_id, volunteer_id)
);

-- 4. Tabela de Capitães
CREATE TABLE IF NOT EXISTS captains (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) - versão permissiva para desenvolvimento
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE captains ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (CUIDADO: apenas para desenvolvimento)
DROP POLICY IF EXISTS "Enable all operations for volunteers" ON volunteers;
DROP POLICY IF EXISTS "Enable all operations for shifts" ON shifts;
DROP POLICY IF EXISTS "Enable all operations for allocations" ON allocations;
DROP POLICY IF EXISTS "Enable all operations for captains" ON captains;

CREATE POLICY "Enable all operations for volunteers" ON volunteers FOR ALL USING (true);
CREATE POLICY "Enable all operations for shifts" ON shifts FOR ALL USING (true);
CREATE POLICY "Enable all operations for allocations" ON allocations FOR ALL USING (true);
CREATE POLICY "Enable all operations for captains" ON captains FOR ALL USING (true);

-- Inserir um voluntário de teste para verificar se está funcionando
INSERT INTO volunteers (name, phone, congregation, city, is_team_leader) 
VALUES ('Teste Conexão', '(11) 99999-9999', 'Congregação Teste', 'Cidade Teste', false)
ON CONFLICT DO NOTHING;

-- Verificar se o voluntário foi inserido
SELECT * FROM volunteers WHERE name = 'Teste Conexão';

-- Mensagem de sucesso
SELECT 'Tabelas criadas e configuradas com sucesso!' as status; 