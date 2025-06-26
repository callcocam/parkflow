import { useCallback } from 'react';
import { shiftService } from '../services/database';
import type { Shift } from '../types';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';

// Hook para operações de turnos com sincronização híbrida
export function useShiftOperations(
  shifts: Shift[],
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>,
  saveToLocalStorage: (key: string, data: any) => void
) {
  
  // Adicionar turno
  const handleAddShift = useCallback(async (shiftData: Omit<Shift, 'id'>) => {
    const newShift: Shift = {
      id: nanoid(),
      ...shiftData,
    };

    try {
      // 1. Primeiro salvar no Supabase
      const savedShift = await shiftService.create(shiftData);
      
      // 2. Atualizar estado local com dados do Supabase (garantir consistência)
      const updatedShifts = [...shifts, savedShift];
      setShifts(updatedShifts);
      
      // 3. Backup no localStorage
      saveToLocalStorage('shifts', updatedShifts);
      
      toast.success(`Turno de ${savedShift.location} adicionado com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao adicionar turno:', error);
      
      // Fallback: salvar apenas localmente
      const updatedShifts = [...shifts, newShift];
      setShifts(updatedShifts);
      saveToLocalStorage('shifts', updatedShifts);
      
      toast.error('Erro ao salvar no banco. Salvo localmente.');
    }
  }, [shifts, setShifts, saveToLocalStorage]);

  // Deletar turno
  const handleDeleteShift = useCallback(async (id: string) => {
    const shiftToDelete = shifts.find(s => s.id === id);
    
    try {
      // 1. Primeiro deletar do Supabase
      await shiftService.delete(id);
      
      // 2. Atualizar estado local
      const updatedShifts = shifts.filter((s) => s.id !== id);
      setShifts(updatedShifts);
      
      // 3. Backup no localStorage
      saveToLocalStorage('shifts', updatedShifts);
      
      const shiftInfo = shiftToDelete 
        ? `${shiftToDelete.location} (${shiftToDelete.startTime}-${shiftToDelete.endTime})`
        : 'desconhecido';
      toast.success(`Turno ${shiftInfo} removido com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao deletar turno:', error);
      
      // Fallback: deletar apenas localmente
      const updatedShifts = shifts.filter((s) => s.id !== id);
      setShifts(updatedShifts);
      saveToLocalStorage('shifts', updatedShifts);
      
      toast.error('Erro ao deletar do banco. Removido localmente.');
    }
  }, [shifts, setShifts, saveToLocalStorage]);

  // Adicionar múltiplos turnos (usado para criação em lote)
  const handleAddMultipleShifts = useCallback(async (shiftsToAdd: Shift[]) => {
    try {
      // 1. Salvar todos os turnos no Supabase
      const savedShifts: Shift[] = [];
      
      for (const shiftData of shiftsToAdd) {
        try {
          const savedShift = await shiftService.create({
            date: shiftData.date,
            startTime: shiftData.startTime,
            endTime: shiftData.endTime,
            location: shiftData.location,
            requiredVolunteers: shiftData.requiredVolunteers,
            periodName: shiftData.periodName
          });
          savedShifts.push(savedShift);
        } catch (error) {
          console.warn(`Erro ao salvar turno ${shiftData.id}:`, error);
          // Se falhar, usar dados originais como fallback
          savedShifts.push(shiftData);
        }
      }
      
      // 2. Atualizar estado local
      const updatedShifts = [...shifts, ...savedShifts];
      setShifts(updatedShifts);
      
      // 3. Backup no localStorage
      saveToLocalStorage('shifts', updatedShifts);
      
      toast.success(`${savedShifts.length} turnos adicionados com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao adicionar múltiplos turnos:', error);
      
      // Fallback: salvar apenas localmente
      const updatedShifts = [...shifts, ...shiftsToAdd];
      setShifts(updatedShifts);
      saveToLocalStorage('shifts', updatedShifts);
      
      toast.error('Erro ao salvar no banco. Salvos localmente.');
    }
  }, [shifts, setShifts, saveToLocalStorage]);

  // Atualizar turno (para futuras necessidades)
  const handleUpdateShift = useCallback(async (updatedShift: Shift) => {
    try {
      // Para turnos, vamos implementar update no service primeiro
      // Por enquanto, usar abordagem de delete + create
      await shiftService.delete(updatedShift.id);
      const savedShift = await shiftService.create({
        date: updatedShift.date,
        startTime: updatedShift.startTime,
        endTime: updatedShift.endTime,
        location: updatedShift.location,
        requiredVolunteers: updatedShift.requiredVolunteers,
        periodName: updatedShift.periodName
      });
      
      // Atualizar estado local
      const updatedShifts = shifts.map((shift) =>
        shift.id === updatedShift.id ? savedShift : shift
      );
      setShifts(updatedShifts);
      
      // Backup no localStorage
      saveToLocalStorage('shifts', updatedShifts);
      
      toast.success(`Turno atualizado com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao atualizar turno:', error);
      
      // Fallback: atualizar apenas localmente
      const updatedShifts = shifts.map((shift) =>
        shift.id === updatedShift.id ? updatedShift : shift
      );
      setShifts(updatedShifts);
      saveToLocalStorage('shifts', updatedShifts);
      
      toast.error('Erro ao atualizar no banco. Salvo localmente.');
    }
  }, [shifts, setShifts, saveToLocalStorage]);

  return {
    handleAddShift,
    handleDeleteShift,
    handleAddMultipleShifts,
    handleUpdateShift
  };
} 