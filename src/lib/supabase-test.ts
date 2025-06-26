import { supabase } from './supabase'

// Função para testar a conexão com o Supabase
export async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...')
  
  try {
    // Teste 1: Verificar se o cliente foi criado
    console.log('✅ Cliente Supabase criado')
    
    // Teste 2: Tentar fazer uma consulta simples (corrigida)
    const { data, error, count } = await supabase
      .from('volunteers')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Erro na consulta:', error)
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return false
    }
    
    console.log('✅ Consulta bem-sucedida! Total de voluntários:', count)
    return true
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error)
    return false
  }
}

// Função para verificar se as tabelas existem
export async function checkTables() {
  console.log('🔍 Verificando se as tabelas existem...')
  
  const tables = ['volunteers', 'shifts', 'allocations', 'captains']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.error(`❌ Tabela ${table} não existe ou erro:`, error.message)
      } else {
        console.log(`✅ Tabela ${table} existe`)
      }
    } catch (error) {
      console.error(`❌ Erro ao verificar tabela ${table}:`, error)
    }
  }
}

// Função para testar inserção de dados
export async function testInsert() {
  console.log('🔍 Testando inserção de dados...')
  
  try {
    const { data, error } = await supabase
      .from('volunteers')
      .insert({
        name: 'Teste Conexão',
        phone: '(11) 99999-9999',
        congregation: 'Teste',
        city: 'Teste',
        is_team_leader: false
      })
      .select()
    
    if (error) {
      console.error('❌ Erro na inserção:', error)
      return false
    }
    
    console.log('✅ Inserção bem-sucedida:', data)
    
    // Limpar dados de teste
    if (data && data[0]) {
      await supabase
        .from('volunteers')
        .delete()
        .eq('id', data[0].id)
      console.log('🧹 Dados de teste removidos')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erro na inserção:', error)
    return false
  }
} 