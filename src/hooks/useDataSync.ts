import { useCallback } from 'react';
import { volunteerService, shiftService, allocationService, captainService } from '../services/database';
import type { Volunteer, Shift, Captain } from '../types';
import toast from 'react-hot-toast';

// Dados seed do Root.tsx (importados para sincronização)
const seedVolunteers: Volunteer[] = [
  { id: 'seed-1', name: 'Tiago Davila Jaques Da Silva', phone: '51998590784', congregation: 'Sul de sapiranga', city: 'Sapiranga', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-2', name: 'Vitor Rodrigues', phone: '51994666754', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: ['shift-27-tarde-patio-1', 'shift-27-manha-patio-5', 'shift-27-manha-patio-4', 'shift-27-tarde-portaria-2', 'shift-27-manha-portaria-5', 'shift-27-manha-portaria-4'] },
  // ... outros voluntários (truncado para brevidade)
];

// Hook para sincronização de dados
export function useDataSync() {
  
  // Verificar se é a primeira execução
  const isFirstRun = useCallback(() => {
    return !localStorage.getItem('supabase_synced');
  }, []);

  // Marcar como sincronizado
  const markAsSynced = useCallback(() => {
    localStorage.setItem('supabase_synced', 'true');
    localStorage.setItem('supabase_sync_date', new Date().toISOString());
  }, []);

  // Sincronizar voluntários
  const syncVolunteers = useCallback(async (volunteers: Volunteer[]) => {
    console.log('🔄 Sincronizando voluntários...');
    
    try {
      // Verificar se já existem voluntários no Supabase
      const existing = await volunteerService.getAll();
      
      if (existing.length === 0) {
        // Inserir todos os voluntários seed
        for (const volunteer of volunteers) {
          try {
            await volunteerService.create({
              name: volunteer.name,
              phone: volunteer.phone,
              congregation: volunteer.congregation,
              city: volunteer.city,
              isTeamLeader: volunteer.isTeamLeader || false,
              imageUrl: volunteer.imageUrl || '',
              unavailableShifts: volunteer.unavailableShifts || []
            });
          } catch (error) {
            // Se o voluntário já existe (por ID), apenas continue
            console.warn(`Voluntário ${volunteer.name} já existe, pulando...`);
          }
        }
        console.log('✅ Voluntários sincronizados com sucesso');
      } else {
        console.log('ℹ️ Voluntários já existem no Supabase, pulando sincronização');
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar voluntários:', error);
      throw error;
    }
  }, []);

  // Sincronizar turnos
  const syncShifts = useCallback(async (shifts: Shift[]) => {
    console.log('🔄 Sincronizando turnos...');
    
    try {
      // Verificar se já existem turnos no Supabase
      const existing = await shiftService.getAll();
      
      if (existing.length === 0) {
        // Inserir todos os turnos seed
        for (const shift of shifts) {
          try {
            await shiftService.create({
              date: shift.date,
              startTime: shift.startTime,
              endTime: shift.endTime,
              location: shift.location,
              requiredVolunteers: shift.requiredVolunteers,
              periodName: shift.periodName
            });
          } catch (error) {
            console.warn(`Turno ${shift.id} já existe, pulando...`);
          }
        }
        console.log('✅ Turnos sincronizados com sucesso');
      } else {
        console.log('ℹ️ Turnos já existem no Supabase, pulando sincronização');
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar turnos:', error);
      throw error;
    }
  }, []);

  // Sincronizar alocações
  const syncAllocations = useCallback(async (allocations: Record<string, string[]>) => {
    console.log('🔄 Sincronizando alocações...');
    
    try {
      // Verificar se já existem alocações no Supabase
      const existing = await allocationService.getAll();
      
      if (Object.keys(existing).length === 0) {
        // Inserir todas as alocações seed
        await allocationService.replaceAll(allocations);
        console.log('✅ Alocações sincronizadas com sucesso');
      } else {
        console.log('ℹ️ Alocações já existem no Supabase, pulando sincronização');
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar alocações:', error);
      throw error;
    }
  }, []);

  // Sincronizar capitães
  const syncCaptains = useCallback(async (captains: Captain[]) => {
    console.log('🔄 Sincronizando capitães...');
    
    try {
      // Verificar se já existem capitães no Supabase
      const existing = await captainService.getAll();
      
      if (existing.length === 0) {
        // Inserir todos os capitães seed
        for (const captain of captains) {
          try {
            await captainService.set(captain.date, captain.volunteerId, captain.location);
          } catch (error) {
            console.warn(`Capitão para ${captain.date} já existe, pulando...`);
          }
        }
        console.log('✅ Capitães sincronizados com sucesso');
      } else {
        console.log('ℹ️ Capitães já existem no Supabase, pulando sincronização');
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar capitães:', error);
      throw error;
    }
  }, []);

  // Sincronização completa
  const syncAllData = useCallback(async (
    volunteers: Volunteer[],
    shifts: Shift[],
    allocations: Record<string, string[]>,
    captains: Captain[]
  ) => {
    if (!isFirstRun()) {
      console.log('ℹ️ Dados já foram sincronizados anteriormente');
      return;
    }

    console.log('🚀 Iniciando sincronização inicial com Supabase...');
    
    try {
      // Executar sincronizações em sequência para evitar conflitos
      await syncVolunteers(volunteers);
      await syncShifts(shifts);
      await syncAllocations(allocations);
      await syncCaptains(captains);
      
      // Marcar como sincronizado
      markAsSynced();
      
      console.log('🎉 Sincronização inicial concluída com sucesso!');
      toast.success('Dados iniciais sincronizados com o banco de dados!');
      
    } catch (error) {
      console.error('💥 Erro na sincronização inicial:', error);
      toast.error('Erro na sincronização inicial. Usando dados locais.');
      throw error;
    }
  }, [isFirstRun, syncVolunteers, syncShifts, syncAllocations, syncCaptains, markAsSynced]);

  // Forçar nova sincronização (útil para desenvolvimento)
  const forceSyncReset = useCallback(() => {
    localStorage.removeItem('supabase_synced');
    localStorage.removeItem('supabase_sync_date');
    console.log('🔄 Sincronização resetada. Próxima inicialização fará nova sincronização.');
  }, []);

  return {
    isFirstRun,
    syncAllData,
    forceSyncReset,
    syncVolunteers,
    syncShifts,
    syncAllocations,
    syncCaptains
  };
} 