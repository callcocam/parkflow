-- Script SQL para configurar o banco de dados ParkFlow no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Tabela de Voluntários
CREATE TABLE volunteers (
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
CREATE TABLE shifts (
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

-- 3. Tabela de Alocações (relacionamento muitos-para-muitos entre voluntários e turnos)
CREATE TABLE allocations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(shift_id, volunteer_id)
);

-- 4. Tabela de Capitães
CREATE TABLE captains (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_volunteers_congregation ON volunteers(congregation);
CREATE INDEX idx_volunteers_city ON volunteers(city);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_location ON shifts(location);
CREATE INDEX idx_allocations_shift_id ON allocations(shift_id);
CREATE INDEX idx_allocations_volunteer_id ON allocations(volunteer_id);
CREATE INDEX idx_captains_date ON captains(date);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_volunteers_updated_at 
    BEFORE UPDATE ON volunteers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at 
    BEFORE UPDATE ON shifts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_captains_updated_at 
    BEFORE UPDATE ON captains 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança (RLS - Row Level Security)
-- Por enquanto, permitir acesso total para desenvolvimento
-- Em produção, você deve configurar políticas mais restritivas

ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE captains ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para desenvolvimento (CUIDADO: em produção, seja mais restritivo)
CREATE POLICY "Enable all operations for volunteers" ON volunteers FOR ALL USING (true);
CREATE POLICY "Enable all operations for shifts" ON shifts FOR ALL USING (true);
CREATE POLICY "Enable all operations for allocations" ON allocations FOR ALL USING (true);
CREATE POLICY "Enable all operations for captains" ON captains FOR ALL USING (true);

-- Comentários das tabelas
COMMENT ON TABLE volunteers IS 'Tabela de voluntários do sistema ParkFlow';
COMMENT ON TABLE shifts IS 'Tabela de turnos de trabalho';
COMMENT ON TABLE allocations IS 'Tabela de alocações de voluntários em turnos';
COMMENT ON TABLE captains IS 'Tabela de capitães designados por dia';

-- Inserir dados de exemplo (opcional)
-- Descomente as linhas abaixo se quiser dados de teste

/*
INSERT INTO volunteers (name, phone, congregation, city, is_team_leader) VALUES
('João Silva', '(11) 99999-9999', 'Congregação Central', 'São Paulo', true),
('Maria Santos', '(11) 88888-8888', 'Congregação Norte', 'São Paulo', false),
('Pedro Oliveira', '(11) 77777-7777', 'Congregação Sul', 'São Paulo', false);

INSERT INTO shifts (date, start_time, end_time, location, required_volunteers, period_name) VALUES
('2025-06-27', '07:00', '09:00', 'portaria', 32, 'Sexta Manhã'),
('2025-06-27', '16:00', '17:30', 'patio', 32, 'Sexta Tarde'),
('2025-06-28', '07:00', '09:00', 'portaria', 32, 'Sábado Manhã');
*/ 