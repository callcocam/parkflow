import { allocationService } from '../services/database';

// Teste simples de alocações
export async function testAllocations() {
  console.log('🧪 Testando sincronização de alocações...');
  
  try {
    // 1. Buscar alocações existentes
    console.log('1. Buscando alocações existentes...');
    const existing = await allocationService.getAll();
    console.log('Alocações encontradas:', Object.keys(existing).length, 'turnos com alocações');
    
    // 2. Testar adição de alocação
    console.log('2. Testando adição de alocação...');
    const testShiftId = 'test-shift-123';
    const testVolunteerId = 'test-volunteer-456';
    
    try {
      await allocationService.add(testShiftId, testVolunteerId);
      console.log('✅ Alocação adicionada com sucesso');
      
      // 3. Verificar se foi adicionada
      const updated = await allocationService.getAll();
      const wasAdded = updated[testShiftId]?.includes(testVolunteerId);
      console.log('Alocação foi persistida?', wasAdded ? '✅ Sim' : '❌ Não');
      
      // 4. Remover alocação de teste
      await allocationService.remove(testShiftId, testVolunteerId);
      console.log('✅ Alocação de teste removida');
      
    } catch (error) {
      console.error('❌ Erro no teste de alocação:', error);
    }
    
    // 5. Teste de substituição
    console.log('3. Testando substituição de alocações...');
    const testAllocations = {
      'test-shift-1': ['vol-1', 'vol-2'],
      'test-shift-2': ['vol-3']
    };
    
    try {
      await allocationService.replaceAll(testAllocations);
      console.log('✅ Substituição executada');
      
      // Verificar resultado
      const result = await allocationService.getAll();
      console.log('Resultado da substituição:', result);
      
      // Limpar dados de teste
      await allocationService.replaceAll({});
      console.log('✅ Dados de teste limpos');
      
    } catch (error) {
      console.error('❌ Erro no teste de substituição:', error);
    }
    
    console.log('🎉 Teste de alocações concluído!');
    return true;
    
  } catch (error) {
    console.error('💥 Erro geral no teste de alocações:', error);
    return false;
  }
} 