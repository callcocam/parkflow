# 🗄️ Configuração do Supabase para ParkFlow

Este guia irá te ajudar a configurar o banco de dados Supabase para o projeto ParkFlow.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com) (gratuita)
- Projeto ParkFlow configurado localmente

## 🚀 Passo a Passo

### 1. Criar Conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub, Google ou email

### 2. Criar Novo Projeto

1. No dashboard, clique em "New Project"
2. Escolha sua organização
3. Preencha os dados:
   - **Project Name**: `parkflow`
   - **Database Password**: Crie uma senha forte (anote-a!)
   - **Region**: Escolha a região mais próxima do Brasil
4. Clique em "Create new project"
5. Aguarde alguns minutos para o projeto ser criado

### 3. Configurar o Banco de Dados

1. No painel do seu projeto, vá para **SQL Editor** (ícone de dados na lateral)
2. Clique em "New Query"
3. Copie todo o conteúdo do arquivo `supabase-setup.sql` deste projeto
4. Cole no editor SQL
5. Clique em "Run" para executar o script
6. Verifique se todas as tabelas foram criadas sem erros

### 4. Obter Credenciais

1. Vá para **Settings** → **API** (ícone de engrenagem)
2. Copie as seguintes informações:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon public key**: Uma chave longa que começa com `eyJ...`

### 5. Configurar no Projeto

1. Abra o arquivo `src/lib/supabase.ts`
2. Substitua as linhas:
   ```typescript
   const supabaseUrl = 'YOUR_SUPABASE_URL'
   const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
   ```
   
   Por suas credenciais reais:
   ```typescript
   const supabaseUrl = 'https://seu-projeto.supabase.co'
   const supabaseKey = 'eyJ...' // Sua chave anon
   ```

### 6. Testar a Conexão

1. Salve o arquivo e reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
2. Abra o projeto no navegador
3. Tente adicionar um voluntário para testar se está funcionando
4. Verifique no Supabase Dashboard → **Table Editor** se os dados estão sendo salvos

## 🔧 Migração dos Dados Existentes

Se você já tem dados no localStorage, você pode migrá-los:

1. Acesse o Dashboard do ParkFlow
2. Clique em "Exportar Backup" para salvar seus dados atuais
3. Após configurar o Supabase, use "Importar Backup" para restaurar os dados

## 📊 Verificar Dados no Supabase

1. No dashboard do Supabase, vá para **Table Editor**
2. Você verá as tabelas:
   - `volunteers` - Voluntários cadastrados
   - `shifts` - Turnos criados
   - `allocations` - Alocações de voluntários
   - `captains` - Capitães designados

## 🔒 Segurança

As políticas de segurança estão configuradas de forma permissiva para desenvolvimento. Para produção, considere:

1. Configurar autenticação de usuários
2. Restringir políticas de acesso
3. Configurar backup automático
4. Monitorar uso da API

## ❗ Problemas Comuns

### Erro de Conexão
- Verifique se as credenciais estão corretas
- Confirme se o projeto Supabase está ativo
- Verifique a conexão com internet

### Dados Não Aparecem
- Confirme se o script SQL foi executado completamente
- Verifique se não há erros no console do navegador
- Teste com dados simples primeiro

### Performance Lenta
- Verifique se está usando a região mais próxima
- Considere otimizar consultas se necessário

## 🆘 Suporte

- [Documentação Oficial do Supabase](https://supabase.com/docs)
- [Discord da Comunidade Supabase](https://discord.supabase.com)
- [GitHub Issues do projeto](se aplicável)

---

✅ **Após seguir estes passos, seu ParkFlow estará usando um banco de dados real e robusto!** 