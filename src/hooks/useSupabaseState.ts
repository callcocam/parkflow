import { useState, useEffect, useCallback } from 'react';
import { volunteerService, shiftService, allocationService, captainService } from '../services/database';
import type { Volunteer, Shift, Captain } from '../types';
import toast from 'react-hot-toast';

// Tipos para o estado de carregamento
interface LoadingState {
  volunteers: boolean;
  shifts: boolean;
  allocations: boolean;
  captains: boolean;
  initialLoad: boolean;
}

// Hook personalizado para gerenciar estado híbrido
export function useSupabaseState() {
  // Estados principais
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [allocations, setAllocations] = useState<Record<string, string[]>>({});
  const [captains, setCaptains] = useState<Captain[]>([]);
  
  // Estados de carregamento
  const [loading, setLoading] = useState<LoadingState>({
    volunteers: false,
    shifts: false,
    allocations: false,
    captains: false,
    initialLoad: true
  });
  
  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Função para carregar dados do localStorage (fallback)
  const loadFromLocalStorage = useCallback(<T>(key: string, defaultValue: T): T => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error(`Erro ao carregar '${key}' do localStorage:`, error);
    }
    return defaultValue;
  }, []);

  // Função para salvar no localStorage (backup)
  const saveToLocalStorage = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Erro ao salvar '${key}' no localStorage:`, error);
    }
  }, []);

  // Carregar voluntários do Supabase
  const loadVolunteers = useCallback(async () => {
    setLoading(prev => ({ ...prev, volunteers: true }));
    try {
      const data = await volunteerService.getAll();
      
      // Mapear dados do Supabase para o formato da aplicação
      const mappedVolunteers: Volunteer[] = data.map(v => ({
        id: v.id,
        name: v.name,
        phone: v.phone,
        congregation: v.congregation,
        city: v.city,
        isTeamLeader: v.is_team_leader,
        imageUrl: v.image_url || '',
        unavailableShifts: v.unavailable_shifts || []
      }));
      
      setVolunteers(mappedVolunteers);
      saveToLocalStorage('volunteers', mappedVolunteers);
      
    } catch (error) {
      console.error('Erro ao carregar voluntários do Supabase:', error);
      // Fallback para localStorage
      const localData = loadFromLocalStorage('volunteers', []);
      setVolunteers(localData);
      setError('Usando dados locais - problemas de conexão com o banco');
    } finally {
      setLoading(prev => ({ ...prev, volunteers: false }));
    }
  }, [loadFromLocalStorage, saveToLocalStorage]);

  // Carregar turnos do Supabase
  const loadShifts = useCallback(async () => {
    setLoading(prev => ({ ...prev, shifts: true }));
    try {
      const data = await shiftService.getAll();
      
      // Mapear dados do Supabase para o formato da aplicação
      const mappedShifts: Shift[] = data.map(s => ({
        id: s.id,
        date: s.date,
        startTime: s.start_time,
        endTime: s.end_time,
        location: s.location,
        requiredVolunteers: s.required_volunteers,
        periodName: s.period_name
      }));
      
      setShifts(mappedShifts);
      saveToLocalStorage('shifts', mappedShifts);
      
    } catch (error) {
      console.error('Erro ao carregar turnos do Supabase:', error);
      // Fallback para localStorage
      const localData = loadFromLocalStorage('shifts', []);
      setShifts(localData);
      setError('Usando dados locais - problemas de conexão com o banco');
    } finally {
      setLoading(prev => ({ ...prev, shifts: false }));
    }
  }, [loadFromLocalStorage, saveToLocalStorage]);

  // Carregar alocações do Supabase
  const loadAllocations = useCallback(async () => {
    setLoading(prev => ({ ...prev, allocations: true }));
    try {
      const data = await allocationService.getAll();
      
      // Converter para o formato Record<string, string[]>
      const mappedAllocations: Record<string, string[]> = {};
      data.forEach(allocation => {
        if (!mappedAllocations[allocation.shift_id]) {
          mappedAllocations[allocation.shift_id] = [];
        }
        mappedAllocations[allocation.shift_id].push(allocation.volunteer_id);
      });
      
      setAllocations(mappedAllocations);
      saveToLocalStorage('allocations', mappedAllocations);
      
    } catch (error) {
      console.error('Erro ao carregar alocações do Supabase:', error);
      // Fallback para localStorage
      const localData = loadFromLocalStorage('allocations', {});
      setAllocations(localData);
      setError('Usando dados locais - problemas de conexão com o banco');
    } finally {
      setLoading(prev => ({ ...prev, allocations: false }));
    }
  }, [loadFromLocalStorage, saveToLocalStorage]);

  // Carregar capitães do Supabase
  const loadCaptains = useCallback(async () => {
    setLoading(prev => ({ ...prev, captains: true }));
    try {
      const data = await captainService.getAll();
      
      // Mapear dados do Supabase para o formato da aplicação
      const mappedCaptains: Captain[] = data.map(c => ({
        id: c.id,
        date: c.date,
        volunteerId: c.volunteer_id
      }));
      
      setCaptains(mappedCaptains);
      saveToLocalStorage('captains', mappedCaptains);
      
    } catch (error) {
      console.error('Erro ao carregar capitães do Supabase:', error);
      // Fallback para localStorage
      const localData = loadFromLocalStorage('captains', []);
      setCaptains(localData);
      setError('Usando dados locais - problemas de conexão com o banco');
    } finally {
      setLoading(prev => ({ ...prev, captains: false }));
    }
  }, [loadFromLocalStorage, saveToLocalStorage]);

  // Carregar todos os dados na inicialização
  const loadAllData = useCallback(async () => {
    setLoading(prev => ({ ...prev, initialLoad: true }));
    setError(null);
    
    try {
      // Carregar dados em paralelo para melhor performance
      await Promise.all([
        loadVolunteers(),
        loadShifts(),
        loadAllocations(),
        loadCaptains()
      ]);
      
      console.log('✅ Todos os dados carregados com sucesso do Supabase');
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do banco. Usando dados locais.');
    } finally {
      setLoading(prev => ({ ...prev, initialLoad: false }));
    }
  }, [loadVolunteers, loadShifts, loadAllocations, loadCaptains]);

  // Carregar dados na inicialização do hook
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Função para recarregar dados manualmente
  const refetchData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  // Verificar se está carregando
  const isLoading = loading.initialLoad || loading.volunteers || loading.shifts || loading.allocations || loading.captains;

  return {
    // Estados
    volunteers,
    shifts,
    allocations,
    captains,
    
    // Estados de controle
    loading,
    isLoading,
    error,
    
    // Funções de recarga
    refetchData,
    loadVolunteers,
    loadShifts,
    loadAllocations,
    loadCaptains,
    
    // Setters (para compatibilidade com código existente)
    setVolunteers,
    setShifts,
    setAllocations,
    setCaptains
  };
} 