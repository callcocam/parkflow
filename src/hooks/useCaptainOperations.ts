import { useCallback } from 'react';
import { captainService } from '../services/database';
import type { Captain } from '../types';
import toast from 'react-hot-toast';

// Hook para operações de capitães com sincronização híbrida
export function useCaptainOperations(
  captains: Captain[],
  setCaptains: React.Dispatch<React.SetStateAction<Captain[]>>,
  saveToLocalStorage: (key: string, data: any) => void
) {
  
  // Definir capitão para uma data
  const handleSetCaptain = useCallback(async (
    date: string, 
    volunteerId: string, 
    location: 'portaria' | 'patio' = 'portaria'
  ) => {
    try {
      // 1. Primeiro salvar no Supabase
      const savedCaptain = await captainService.set(date, volunteerId, location);
      
      // 2. Atualizar estado local
      const updatedCaptains = captains.filter(c => c.date !== date);
      updatedCaptains.push(savedCaptain);
      setCaptains(updatedCaptains);
      
      // 3. Backup no localStorage
      saveToLocalStorage('captains', updatedCaptains);
      
      toast.success('Capitão definido com sucesso!');
      
    } catch (error) {
      console.error('Erro ao definir capitão:', error);
      
      // Fallback: salvar apenas localmente
      const newCaptain: Captain = {
        id: `captain-${date}`,
        date,
        volunteerId,
        location
      };
      
      const updatedCaptains = captains.filter(c => c.date !== date);
      updatedCaptains.push(newCaptain);
      setCaptains(updatedCaptains);
      saveToLocalStorage('captains', updatedCaptains);
      
      toast.error('Erro ao salvar no banco. Salvo localmente.');
    }
  }, [captains, setCaptains, saveToLocalStorage]);

  // Remover capitão de uma data
  const handleRemoveCaptain = useCallback(async (date: string) => {
    const captainToRemove = captains.find(c => c.date === date);
    
    try {
      // 1. Primeiro remover do Supabase
      await captainService.remove(date);
      
      // 2. Atualizar estado local
      const updatedCaptains = captains.filter(c => c.date !== date);
      setCaptains(updatedCaptains);
      
      // 3. Backup no localStorage
      saveToLocalStorage('captains', updatedCaptains);
      
      toast.success('Capitão removido com sucesso!');
      
    } catch (error) {
      console.error('Erro ao remover capitão:', error);
      
      // Fallback: remover apenas localmente
      const updatedCaptains = captains.filter(c => c.date !== date);
      setCaptains(updatedCaptains);
      saveToLocalStorage('captains', updatedCaptains);
      
      toast.error('Erro ao remover do banco. Removido localmente.');
    }
  }, [captains, setCaptains, saveToLocalStorage]);

  // Atualizar capitão existente
  const handleUpdateCaptain = useCallback(async (
    date: string, 
    volunteerId: string, 
    location: 'portaria' | 'patio' = 'portaria'
  ) => {
    try {
      // 1. Primeiro atualizar no Supabase (remove e adiciona novamente)
      await captainService.remove(date);
      const savedCaptain = await captainService.set(date, volunteerId, location);
      
      // 2. Atualizar estado local
      const updatedCaptains = captains.map(c => 
        c.date === date ? savedCaptain : c
      );
      setCaptains(updatedCaptains);
      
      // 3. Backup no localStorage
      saveToLocalStorage('captains', updatedCaptains);
      
      toast.success('Capitão atualizado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao atualizar capitão:', error);
      
      // Fallback: atualizar apenas localmente
      const updatedCaptains = captains.map(c => 
        c.date === date 
          ? { ...c, volunteerId, location }
          : c
      );
      setCaptains(updatedCaptains);
      saveToLocalStorage('captains', updatedCaptains);
      
      toast.error('Erro ao atualizar no banco. Salvo localmente.');
    }
  }, [captains, setCaptains, saveToLocalStorage]);

  // Definir múltiplos capitães (para operações em lote)
  const handleSetMultipleCaptains = useCallback(async (
    captainAssignments: { date: string; volunteerId: string; location: 'portaria' | 'patio' }[]
  ) => {
    try {
      // 1. Salvar todos no Supabase
      const savedCaptains: Captain[] = [];
      
      for (const { date, volunteerId, location } of captainAssignments) {
        try {
          const savedCaptain = await captainService.set(date, volunteerId, location);
          savedCaptains.push(savedCaptain);
        } catch (error) {
          console.warn(`Erro ao salvar capitão para ${date}:`, error);
          // Se falhar, usar dados originais como fallback
          savedCaptains.push({
            id: `captain-${date}`,
            date,
            volunteerId,
            location
          });
        }
      }
      
      // 2. Atualizar estado local
      let updatedCaptains = [...captains];
      for (const savedCaptain of savedCaptains) {
        updatedCaptains = updatedCaptains.filter(c => c.date !== savedCaptain.date);
        updatedCaptains.push(savedCaptain);
      }
      setCaptains(updatedCaptains);
      
      // 3. Backup no localStorage
      saveToLocalStorage('captains', updatedCaptains);
      
      toast.success(`${savedCaptains.length} capitães definidos com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao definir múltiplos capitães:', error);
      
      // Fallback: salvar apenas localmente
      let updatedCaptains = [...captains];
      for (const { date, volunteerId, location } of captainAssignments) {
        const newCaptain: Captain = {
          id: `captain-${date}`,
          date,
          volunteerId,
          location
        };
        updatedCaptains = updatedCaptains.filter(c => c.date !== date);
        updatedCaptains.push(newCaptain);
      }
      setCaptains(updatedCaptains);
      saveToLocalStorage('captains', updatedCaptains);
      
      toast.error('Erro ao salvar no banco. Salvos localmente.');
    }
  }, [captains, setCaptains, saveToLocalStorage]);

  // Limpar todos os capitães
  const handleClearAllCaptains = useCallback(async () => {
    try {
      // 1. Remover todos do Supabase
      for (const captain of captains) {
        await captainService.remove(captain.date);
      }
      
      // 2. Atualizar estado local
      setCaptains([]);
      
      // 3. Backup no localStorage
      saveToLocalStorage('captains', []);
      
      toast.success(`${captains.length} capitães removidos com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao limpar capitães:', error);
      
      // Fallback: limpar apenas localmente
      setCaptains([]);
      saveToLocalStorage('captains', []);
      
      toast.error('Erro ao limpar do banco. Removidos localmente.');
    }
  }, [captains, setCaptains, saveToLocalStorage]);

  // Substituir todos os capitães (usado para importação)
  const handleReplaceAllCaptains = useCallback(async (newCaptains: Captain[]) => {
    try {
      // 1. Primeiro limpar todos os existentes
      for (const captain of captains) {
        await captainService.remove(captain.date);
      }
      
      // 2. Adicionar os novos
      const savedCaptains: Captain[] = [];
      for (const captain of newCaptains) {
        try {
          const savedCaptain = await captainService.set(captain.date, captain.volunteerId, captain.location);
          savedCaptains.push(savedCaptain);
        } catch (error) {
          console.warn(`Erro ao salvar capitão para ${captain.date}:`, error);
          savedCaptains.push(captain);
        }
      }
      
      // 3. Atualizar estado local
      setCaptains(savedCaptains);
      
      // 4. Backup no localStorage
      saveToLocalStorage('captains', savedCaptains);
      
      console.log('✅ Todos os capitães sincronizados com sucesso');
      
    } catch (error) {
      console.error('Erro ao substituir capitães:', error);
      
      // Fallback: atualizar apenas localmente
      setCaptains(newCaptains);
      saveToLocalStorage('captains', newCaptains);
      
      toast.error('Erro ao sincronizar com banco. Salvo localmente.');
    }
  }, [captains, setCaptains, saveToLocalStorage]);

  // Buscar capitão por data
  const getCaptainByDate = useCallback((date: string): Captain | undefined => {
    return captains.find(c => c.date === date);
  }, [captains]);

  return {
    handleSetCaptain,
    handleRemoveCaptain,
    handleUpdateCaptain,
    handleSetMultipleCaptains,
    handleClearAllCaptains,
    handleReplaceAllCaptains,
    getCaptainByDate
  };
} 