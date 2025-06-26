# 🔍 Diagnóstico de Conexão Supabase - ParkFlow

## Passos para Identificar e Resolver Problemas

### 1. Verificar Credenciais ✅
- URL do projeto: `https://xwgdcsqjyibrreppyrdv.supabase.co`
- Chave anônima: Configurada
- Status: ✅ Credenciais estão corretas no arquivo `src/lib/supabase.ts`

### 2. Executar Script SQL no Supabase 🗄️

**IMPORTANTE**: Execute o arquivo `quick-setup.sql` no SQL Editor do Supabase:

1. Acesse: https://supabase.com/dashboard/project/xwgdcsqjyibrreppyrdv
2. Vá em **SQL Editor** (menu lateral)
3. Cole todo o conteúdo do arquivo `quick-setup.sql`
4. Clique em **RUN** para executar
5. Verifique se aparece a mensagem: "Tabelas criadas e configuradas com sucesso!"

### 3. Testar Conexão no Dashboard 🧪

1. Abra o sistema ParkFlow no navegador
2. Vá para a página **Dashboard**
3. Clique no botão **🔍 Testar DB**
4. Abra o **Console do Navegador** (F12)
5. Verifique as mensagens de log

### 4. Possíveis Problemas e Soluções 🛠️

#### Problema: "relation 'volunteers' does not exist"
**Solução**: Execute o script `quick-setup.sql` no Supabase

#### Problema: "Invalid API key"
**Solução**: Verifique se a chave anônima está correta em `src/lib/supabase.ts`

#### Problema: "CORS error"
**Solução**: 
1. Vá em **Settings > API** no Supabase
2. Adicione `http://localhost:5173` em **Site URL**
3. Adicione `http://localhost:5173` em **Redirect URLs**

#### Problema: "Row Level Security policy violation"
**Solução**: O script `quick-setup.sql` já configura políticas permissivas

### 5. Verificar Configurações do Projeto Supabase ⚙️

No painel do Supabase, verifique:

1. **Settings > API**:
   - Project URL: `https://xwgdcsqjyibrreppyrdv.supabase.co`
   - Anon key: Deve coincidir com o arquivo `supabase.ts`

2. **Settings > Authentication**:
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173`

3. **Database > Tables**:
   - Deve ter as tabelas: `volunteers`, `shifts`, `allocations`, `captains`

### 6. Logs de Debug 📝

Quando clicar em "🔍 Testar DB", você deve ver no console:

```
✅ Cliente Supabase criado
✅ Consulta bem-sucedida: [dados]
✅ Tabela volunteers existe
✅ Tabela shifts existe  
✅ Tabela allocations existe
✅ Tabela captains existe
✅ Inserção bem-sucedida: [dados]
🧹 Dados de teste removidos
```

### 7. Se Nada Funcionar 🆘

1. **Recrie o projeto Supabase**:
   - Crie um novo projeto
   - Atualize as credenciais em `src/lib/supabase.ts`
   - Execute o script `quick-setup.sql`

2. **Verifique a rede**:
   - Teste se consegue acessar: https://xwgdcsqjyibrreppyrdv.supabase.co
   - Desabilite VPN/proxy temporariamente

3. **Limpe o cache**:
   - Ctrl+Shift+R no navegador
   - Limpe o localStorage

## Status Atual 📊

- ✅ Credenciais configuradas
- ✅ Cliente Supabase criado
- ✅ Funções de teste implementadas
- ✅ Botão de teste no Dashboard
- ⏳ **Próximo passo**: Executar `quick-setup.sql` no Supabase

## Comandos Úteis 💻

```bash
# Ver logs em tempo real no navegador
# Abra F12 > Console e execute:
console.clear()

# Testar conexão manualmente
import { supabase } from './src/lib/supabase'
supabase.from('volunteers').select('*').limit(1)
``` 