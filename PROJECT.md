# ParkFlow - Sistema de Gestão de Voluntários para Estacionamento

## Especificações Técnicas para Desenvolvimento

O ParkFlow é um sistema web para organização automática de voluntários em turnos de estacionamento durante eventos. Sistema deve ser intuitivo, com validações inteligentes e exportação de dados.

## Funcionalidades Core

### 1. Cadastro de Voluntários
**Campos obrigatórios:**
- Nome completo (string)
- Telefone (string, validação formato)
- Congregação (string)
- Role especial (string, opcional)

**Sistema de Roles:**
- Role "normal" ou vazio: Voluntários comuns
- Role especial: Voluntários capacitados (ex: "coordenador", "supervisor", "operador_radio")

**Regras de validação:**
- Todos os voluntários: Máximo 1 turno por dia (independente da role)
- Role especial: Máximo 1 voluntário com a mesma role especial por turno/equipe
- Role especial tem prioridade na escalação automática
- Validação de telefone brasileiro
- Nome único por congregação

### 2. Gerenciamento de Locais e Equipes
**Locais fixos:**
- Portaria (entrada/saída)
- Pátio (organização interna)

**Estrutura de dados:**
```json
{
  "local": "portaria|patio",
  "equipe": ["voluntario_id1", "voluntario_id2"],
  "capacidade_por_turno": number,
  "roles_especiais_permitidas": ["coordenador", "supervisor"]
}
```

### 3. Sistema de Turnos Dinâmicos

**Configuração de turno:**
- Data (date)
- Hora início (time)
- Hora fim (time)
- Duração calculada automaticamente
- Voluntários necessários por local (number)
- Horários não contabilizados (array de períodos)

**Algoritmos necessários:**
- Divisão inteligente de turnos
- Redistribuição de tempo entre turnos existentes
- Criação automática de novos turnos

**Regras de negócio:**
- TODOS os voluntários: máximo 1 turno por dia (rule especial ou normal)
- Role especial: apenas 1 por turno (ex: só 1 "coordenador" por turno)
- Role especial tem prioridade na distribuição automática
- Validação de sobreposição de horários
- Distribuição equilibrada entre congregações

### 4. Sistema de Capitães
**Estrutura:**
```json
{
  "capitao_id": "voluntario_id",
  "data": "YYYY-MM-DD",
  "local": "portaria|patio",
  "contato_emergencia": "telefone"
}
```

### 5. Persistência de Dados
**Armazenamento local:**
- LocalStorage para dados temporários
- IndexedDB para dados persistentes
- Backup automático a cada alteração

**Estrutura de dados principal:**
```json
{
  "voluntarios": [],
  "turnos": [],
  "escalas": [],
  "capitaes": [],
  "configuracoes": {},
  "ultima_atualizacao": "timestamp"
}
```

### 6. Exportação de Dados
**Formatos suportados:**
- JSON completo (backup/restore)
- Excel (.xlsx) com múltiplas abas:
  - Aba "Voluntários"
  - Aba "Turnos por Data"
  - Aba "Escala Portaria"
  - Aba "Escala Pátio"
  - Aba "Capitães"

**Funcionalidades de export:**
- Filtros por data/local
- Seleção de campos
- Formatação para impressão

### 7. Geração de PDF
**Biblioteca recomendada:** jsPDF + autoTable

**Estrutura do documento:**
- Header com logo e título do evento
- Tabela por local (Portaria/Pátio)
- Informações de contato dos voluntários
- Dados dos capitães
- Footer com data de geração

**Layout responsivo para impressão A4**

## Algoritmos Críticos

### Distribuição Automática de Voluntários
```
PARA cada turno:
  1. Filtrar voluntários disponíveis (sem conflito de data - TODOS)
  2. Priorizar roles especiais necessárias (1 por tipo por turno)
  3. Completar com voluntários normais
  4. Distribuir por congregação (balanceamento)
  5. Aplicar preferências/restrições
  6. Validar regras de negócio
```

### Validação de Conflitos
```
ANTES de escalar qualquer voluntário:
  1. Verificar se já está escalado no mesmo dia (TODOS - especial ou normal)
  2. Se role especial: verificar se já existe outro com mesma role no turno
  3. Confirmar disponibilidade de horário
  4. Checar limite de voluntários por turno
```

## Requisitos Técnicos

### Frontend
- HTML5, CSS3, JavaScript ES6+
- Framework: Vanilla JS ou React/Vue
- Responsividade mobile-first
- PWA (offline-first)

### Bibliotecas Essenciais
- jsPDF (geração PDF)
- SheetJS (export Excel)
- Date-fns (manipulação datas)
- Validação de formulários

### Armazenamento
- IndexedDB (principal)
- LocalStorage (cache)
- Sem backend necessário

## Interface do Usuário

### Telas Principais
1. **Dashboard**: Visão geral, estatísticas
2. **Voluntários**: CRUD completo
3. **Turnos**: Criação e gestão
4. **Escalação**: Drag-and-drop de voluntários
5. **Capitães**: Designação de líderes
6. **Relatórios**: Visualização e export
7. **Configurações**: Parâmetros do sistema

### UX Critical Points
- Drag-and-drop para escalação
- Validação em tempo real
- Feedback visual para conflitos
- Undo/Redo para alterações
- Busca e filtros inteligentes

## Validações e Regras

### Voluntários
- Nome: obrigatório, min 3 caracteres
- Telefone: formato brasileiro válido
- Congregação: obrigatória
- Role especial: única por equipe

### Turnos
- Data: não pode ser passada
- Horário: início < fim
- Duração: mínimo 30 minutos
- Voluntários: mínimo 1 por local

### Escalação
- TODOS os voluntários: máximo 1 turno por dia (regra universal)
- Role especial: apenas 1 do mesmo tipo por turno (ex: 1 coordenador por turno)
- Role especial tem prioridade na seleção automática
- Balanceamento entre congregações
- Capitão deve estar escalado no dia e pode ter role especial

## Casos de Teste

### Cenários Críticos
1. Voluntário com role especial duplicada no mesmo turno
2. Qualquer voluntário escalado duas vezes no mesmo dia
3. Sobreposição de horários
4. Export com dados vazios
5. Validação de datas passadas
6. Divisão de turnos com horários não contabilizados
7. Priorização de roles especiais na distribuição automática

---

## Implementação Recomendada

### Fase 1: Core
- CRUD voluntários
- CRUD turnos
- Validações básicas

### Fase 2: Escalação
- Interface drag-and-drop
- Algoritmo de distribuição
- Sistema de capitães

### Fase 3: Export
- Geração PDF
- Export Excel/JSON
- Relatórios avançados

### Fase 4: UX
- PWA features
- Offline mode
- Mobile optimization