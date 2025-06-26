import { useCallback } from 'react';
import { allocationService } from '../services/database';
import toast from 'react-hot-toast';

// Hook para operações de alocações com sincronização híbrida
export function useAllocationOperations(
  allocations: Record<string, string[]>,
  setAllocations: React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
  saveToLocalStorage: (key: string, data: any) => void
) {
  
  // Adicionar voluntário a um turno
  const handleAddAllocation = useCallback(async (shiftId: string, volunteerId: string) => {
    try {
      // 1. Primeiro salvar no Supabase
      await allocationService.add(shiftId, volunteerId);
      
      // 2. Atualizar estado local
      const updatedAllocations = {
        ...allocations,
        [shiftId]: [...(allocations[shiftId] || []), volunteerId]
      };
      setAllocations(updatedAllocations);
      
      // 3. Backup no localStorage
      saveToLocalStorage('allocations', updatedAllocations);
      
      // Toast será exibido pela página que chama esta função
      
    } catch (error) {
      console.error('Erro ao adicionar alocação:', error);
      
      // Fallback: salvar apenas localmente
      const updatedAllocations = {
        ...allocations,
        [shiftId]: [...(allocations[shiftId] || []), volunteerId]
      };
      setAllocations(updatedAllocations);
      saveToLocalStorage('allocations', updatedAllocations);
      
      toast.error('Erro ao salvar no banco. Salvo localmente.');
    }
  }, [allocations, setAllocations, saveToLocalStorage]);

  // Remover voluntário de um turno
  const handleRemoveAllocation = useCallback(async (shiftId: string, volunteerId: string) => {
    try {
      // 1. Primeiro remover do Supabase
      await allocationService.remove(shiftId, volunteerId);
      
      // 2. Atualizar estado local
      const updatedAllocations = {
        ...allocations,
        [shiftId]: (allocations[shiftId] || []).filter(id => id !== volunteerId)
      };
      setAllocations(updatedAllocations);
      
      // 3. Backup no localStorage
      saveToLocalStorage('allocations', updatedAllocations);
      
      // Toast será exibido pela página que chama esta função
      
    } catch (error) {
      console.error('Erro ao remover alocação:', error);
      
      // Fallback: remover apenas localmente
      const updatedAllocations = {
        ...allocations,
        [shiftId]: (allocations[shiftId] || []).filter(id => id !== volunteerId)
      };
      setAllocations(updatedAllocations);
      saveToLocalStorage('allocations', updatedAllocations);
      
      toast.error('Erro ao remover do banco. Removido localmente.');
    }
  }, [allocations, setAllocations, saveToLocalStorage]);

  // Substituir todas as alocações (usado para drag-and-drop e importação)
  const handleReplaceAllAllocations = useCallback(async (newAllocations: Record<string, string[]>) => {
    try {
      // 1. Primeiro substituir no Supabase
      await allocationService.replaceAll(newAllocations);
      
      // 2. Atualizar estado local
      setAllocations(newAllocations);
      
      // 3. Backup no localStorage
      saveToLocalStorage('allocations', newAllocations);
      
      console.log('✅ Todas as alocações sincronizadas com sucesso');
      
    } catch (error) {
      console.error('Erro ao substituir alocações:', error);
      
      // Fallback: atualizar apenas localmente
      setAllocations(newAllocations);
      saveToLocalStorage('allocations', newAllocations);
      
      toast.error('Erro ao sincronizar com banco. Salvo localmente.');
    }
  }, [setAllocations, saveToLocalStorage]);

  // Mover voluntário entre turnos (operação atômica)
  const handleMoveAllocation = useCallback(async (
    fromShiftId: string, 
    toShiftId: string, 
    volunteerId: string
  ) => {
    try {
      // 1. Operações no Supabase
      await allocationService.remove(fromShiftId, volunteerId);
      await allocationService.add(toShiftId, volunteerId);
      
      // 2. Atualizar estado local
      const updatedAllocations = {
        ...allocations,
        [fromShiftId]: (allocations[fromShiftId] || []).filter(id => id !== volunteerId),
        [toShiftId]: [...(allocations[toShiftId] || []), volunteerId]
      };
      setAllocations(updatedAllocations);
      
      // 3. Backup no localStorage
      saveToLocalStorage('allocations', updatedAllocations);
      
      toast.success('Voluntário movido com sucesso!');
      
    } catch (error) {
      console.error('Erro ao mover alocação:', error);
      
      // Fallback: mover apenas localmente
      const updatedAllocations = {
        ...allocations,
        [fromShiftId]: (allocations[fromShiftId] || []).filter(id => id !== volunteerId),
        [toShiftId]: [...(allocations[toShiftId] || []), volunteerId]
      };
      setAllocations(updatedAllocations);
      saveToLocalStorage('allocations', updatedAllocations);
      
      toast.error('Erro ao sincronizar com banco. Movido localmente.');
    }
  }, [allocations, setAllocations, saveToLocalStorage]);

  // Limpar todas as alocações de um turno
  const handleClearShiftAllocations = useCallback(async (shiftId: string) => {
    const currentAllocations = allocations[shiftId] || [];
    
    try {
      // 1. Remover todas as alocações do turno no Supabase
      for (const volunteerId of currentAllocations) {
        await allocationService.remove(shiftId, volunteerId);
      }
      
      // 2. Atualizar estado local
      const updatedAllocations = {
        ...allocations,
        [shiftId]: []
      };
      setAllocations(updatedAllocations);
      
      // 3. Backup no localStorage
      saveToLocalStorage('allocations', updatedAllocations);
      
      toast.success(`Turno limpo! ${currentAllocations.length} voluntários removidos.`);
      
    } catch (error) {
      console.error('Erro ao limpar alocações do turno:', error);
      
      // Fallback: limpar apenas localmente
      const updatedAllocations = {
        ...allocations,
        [shiftId]: []
      };
      setAllocations(updatedAllocations);
      saveToLocalStorage('allocations', updatedAllocations);
      
      toast.error('Erro ao sincronizar com banco. Limpo localmente.');
    }
  }, [allocations, setAllocations, saveToLocalStorage]);

  // Adicionar múltiplas alocações (para operações em lote)
  const handleAddMultipleAllocations = useCallback(async (
    allocationPairs: { shiftId: string; volunteerId: string }[]
  ) => {
    try {
      // 1. Adicionar todas no Supabase
      for (const { shiftId, volunteerId } of allocationPairs) {
        await allocationService.add(shiftId, volunteerId);
      }
      
      // 2. Atualizar estado local
      const updatedAllocations = { ...allocations };
      for (const { shiftId, volunteerId } of allocationPairs) {
        if (!updatedAllocations[shiftId]) {
          updatedAllocations[shiftId] = [];
        }
        if (!updatedAllocations[shiftId].includes(volunteerId)) {
          updatedAllocations[shiftId].push(volunteerId);
        }
      }
      setAllocations(updatedAllocations);
      
      // 3. Backup no localStorage
      saveToLocalStorage('allocations', updatedAllocations);
      
      toast.success(`${allocationPairs.length} alocações adicionadas com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao adicionar múltiplas alocações:', error);
      
      // Fallback: adicionar apenas localmente
      const updatedAllocations = { ...allocations };
      for (const { shiftId, volunteerId } of allocationPairs) {
        if (!updatedAllocations[shiftId]) {
          updatedAllocations[shiftId] = [];
        }
        if (!updatedAllocations[shiftId].includes(volunteerId)) {
          updatedAllocations[shiftId].push(volunteerId);
        }
      }
      setAllocations(updatedAllocations);
      saveToLocalStorage('allocations', updatedAllocations);
      
      toast.error('Erro ao sincronizar com banco. Salvo localmente.');
    }
  }, [allocations, setAllocations, saveToLocalStorage]);

  return {
    handleAddAllocation,
    handleRemoveAllocation,
    handleReplaceAllAllocations,
    handleMoveAllocation,
    handleClearShiftAllocations,
    handleAddMultipleAllocations
  };
} 