import { useCallback } from 'react';
import { volunteerService, shiftService, allocationService, captainService } from '../services/database';
import type { Volunteer, Shift, Captain } from '../types';
import toast from 'react-hot-toast';

// Interface para o backup completo
interface BackupData {
  volunteers: Volunteer[];
  shifts: Shift[];
  allocations: Record<string, string[]>;
  captains: Captain[];
  exportDate: string;
  version: string;
}

// Hook para operações de backup e restore com Supabase
export function useBackupRestore(
  volunteers: Volunteer[],
  shifts: Shift[],
  allocations: Record<string, string[]>,
  captains: Captain[],
  setVolunteers: React.Dispatch<React.SetStateAction<Volunteer[]>>,
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>,
  setAllocations: React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
  setCaptains: React.Dispatch<React.SetStateAction<Captain[]>>,
  saveToLocalStorage: (key: string, data: any) => void
) {

  // Exportar backup completo
  const exportBackup = useCallback(() => {
    try {
      const backupData: BackupData = {
        volunteers,
        shifts,
        allocations,
        captains,
        exportDate: new Date().toISOString(),
        version: '2.0' // Versão com Supabase
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      
      const now = new Date();
      const fileName = `parkflow-backup-${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}-${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}.json`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Backup exportado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      toast.error('Erro ao exportar backup');
    }
  }, [volunteers, shifts, allocations, captains]);

  // Importar backup com sincronização completa
  const importBackup = useCallback(async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const backupData: BackupData = JSON.parse(e.target?.result as string);
          
          // Validar estrutura do backup
          if (!backupData.volunteers || !backupData.shifts || !backupData.allocations || !backupData.captains) {
            throw new Error('Arquivo de backup inválido: estrutura incompleta');
          }

          const loadingToast = toast.loading('Importando backup e sincronizando com banco...');

          try {
            // 1. Primeiro sincronizar com Supabase
            console.log('🔄 Iniciando sincronização completa com Supabase...');
            
            // Limpar dados existentes no Supabase (opcional - comentado para segurança)
            // await this.clearAllSupabaseData();
            
            // Sincronizar voluntários
            console.log('📥 Sincronizando voluntários...');
            for (const volunteer of backupData.volunteers) {
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
                // Se já existe, tentar atualizar
                try {
                  await volunteerService.update(volunteer);
                } catch (updateError) {
                  console.warn(`Erro ao sincronizar voluntário ${volunteer.name}:`, updateError);
                }
              }
            }

            // Sincronizar turnos
            console.log('📥 Sincronizando turnos...');
            for (const shift of backupData.shifts) {
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
                console.warn(`Erro ao sincronizar turno ${shift.id}:`, error);
              }
            }

            // Sincronizar alocações
            console.log('📥 Sincronizando alocações...');
            await allocationService.replaceAll(backupData.allocations);

            // Sincronizar capitães
            console.log('📥 Sincronizando capitães...');
            for (const captain of backupData.captains) {
              try {
                await captainService.set(captain.date, captain.volunteerId, captain.location);
              } catch (error) {
                console.warn(`Erro ao sincronizar capitão para ${captain.date}:`, error);
              }
            }

            // 2. Atualizar estado local
            setVolunteers(backupData.volunteers);
            setShifts(backupData.shifts);
            setAllocations(backupData.allocations);
            setCaptains(backupData.captains);

            // 3. Backup no localStorage
            saveToLocalStorage('volunteers', backupData.volunteers);
            saveToLocalStorage('shifts', backupData.shifts);
            saveToLocalStorage('allocations', backupData.allocations);
            saveToLocalStorage('captains', backupData.captains);

            toast.dismiss(loadingToast);
            toast.success('Backup importado e sincronizado com sucesso!');
            
            console.log('✅ Sincronização completa finalizada');
            resolve();

          } catch (syncError) {
            console.error('Erro na sincronização com Supabase:', syncError);
            
            // Fallback: importar apenas localmente
            setVolunteers(backupData.volunteers);
            setShifts(backupData.shifts);
            setAllocations(backupData.allocations);
            setCaptains(backupData.captains);

            saveToLocalStorage('volunteers', backupData.volunteers);
            saveToLocalStorage('shifts', backupData.shifts);
            saveToLocalStorage('allocations', backupData.allocations);
            saveToLocalStorage('captains', backupData.captains);

            toast.dismiss(loadingToast);
            toast.error('Backup importado localmente. Erro na sincronização com banco.');
            resolve();
          }

        } catch (error) {
          console.error('Erro ao processar backup:', error);
          toast.error('Erro ao processar arquivo de backup');
          reject(error);
        }
      };

      reader.onerror = () => {
        toast.error('Erro ao ler arquivo');
        reject(new Error('Erro ao ler arquivo'));
      };

      reader.readAsText(file);
    });
  }, [setVolunteers, setShifts, setAllocations, setCaptains, saveToLocalStorage]);

  // Sincronizar dados locais com Supabase (forçar upload)
  const syncLocalToSupabase = useCallback(async () => {
    const loadingToast = toast.loading('Sincronizando dados locais com Supabase...');
    
    try {
      // Sincronizar voluntários
      for (const volunteer of volunteers) {
        try {
          await volunteerService.update(volunteer);
        } catch (error) {
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
          } catch (createError) {
            console.warn(`Erro ao sincronizar voluntário ${volunteer.name}:`, createError);
          }
        }
      }

      // Sincronizar turnos
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
          console.warn(`Erro ao sincronizar turno ${shift.id}:`, error);
        }
      }

      // Sincronizar alocações
      await allocationService.replaceAll(allocations);

      // Sincronizar capitães
      for (const captain of captains) {
        try {
          await captainService.set(captain.date, captain.volunteerId, captain.location);
        } catch (error) {
          console.warn(`Erro ao sincronizar capitão para ${captain.date}:`, error);
        }
      }

      toast.dismiss(loadingToast);
      toast.success('Dados locais sincronizados com Supabase!');

    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast.dismiss(loadingToast);
      toast.error('Erro na sincronização com Supabase');
    }
  }, [volunteers, shifts, allocations, captains]);

  // Baixar dados do Supabase (forçar download)
  const syncSupabaseToLocal = useCallback(async () => {
    const loadingToast = toast.loading('Baixando dados do Supabase...');
    
    try {
      // Carregar todos os dados do Supabase
      const [
        supabaseVolunteers,
        supabaseShifts,
        supabaseAllocations,
        supabaseCaptains
      ] = await Promise.all([
        volunteerService.getAll(),
        shiftService.getAll(),
        allocationService.getAll(),
        captainService.getAll()
      ]);

      // Atualizar estado local
      setVolunteers(supabaseVolunteers);
      setShifts(supabaseShifts);
      setAllocations(supabaseAllocations);
      setCaptains(supabaseCaptains);

      // Backup no localStorage
      saveToLocalStorage('volunteers', supabaseVolunteers);
      saveToLocalStorage('shifts', supabaseShifts);
      saveToLocalStorage('allocations', supabaseAllocations);
      saveToLocalStorage('captains', supabaseCaptains);

      toast.dismiss(loadingToast);
      toast.success('Dados baixados do Supabase com sucesso!');

    } catch (error) {
      console.error('Erro ao baixar dados do Supabase:', error);
      toast.dismiss(loadingToast);
      toast.error('Erro ao baixar dados do Supabase');
    }
  }, [setVolunteers, setShifts, setAllocations, setCaptains, saveToLocalStorage]);

  return {
    exportBackup,
    importBackup,
    syncLocalToSupabase,
    syncSupabaseToLocal
  };
} 