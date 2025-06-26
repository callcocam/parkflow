import { useState, useEffect, useRef } from 'react';
import type { Volunteer, Shift, Captain } from '../types';
import toast from 'react-hot-toast';
import { 
  isFirebaseConfigured,
  saveToFirestore,
  loadFromFirestore,
  subscribeToChanges,
  getDeviceId,
  type SyncData
} from '../lib/firebase';

interface UseFirebaseOnlyReturn {
  // Estados
  volunteers: Volunteer[];
  shifts: Shift[];
  allocations: Record<string, string[]>;
  captains: Captain[];
  
  // Status
  isLoading: boolean;
  isReady: boolean;
  isOnline: boolean;
  lastSyncTime: string | null;
  usingFallback: boolean;
  isFirebaseConfigured: boolean;
  isSyncing: boolean;
  
  // Setters
  setVolunteers: (volunteers: Volunteer[]) => Promise<void>;
  setShifts: (shifts: Shift[]) => Promise<void>;
  setAllocations: (allocations: Record<string, string[]>) => Promise<void>;
  setCaptains: (captains: Captain[]) => Promise<void>;
  
  // Métodos individuais
  addVolunteer: (volunteer: Volunteer) => Promise<void>;
  updateVolunteer: (volunteer: Volunteer) => Promise<void>;
  deleteVolunteer: (id: string) => Promise<void>;
  addShift: (shift: Shift) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  
  // Backup/Restore
  exportData: () => Promise<any>;
  importData: (data: any) => Promise<void>;
  
  // Sincronização
  forceSyncToCloud: () => Promise<void>;
}

export function useFirebaseOnly(seedData?: {
  volunteers: Volunteer[];
  shifts: Shift[];
  allocations: Record<string, string[]>;
  captains: Captain[];
}): UseFirebaseOnlyReturn {
  // Estados locais
  const [volunteers, setVolunteersState] = useState<Volunteer[]>([]);
  const [shifts, setShiftsState] = useState<Shift[]>([]);
  const [allocations, setAllocationsState] = useState<Record<string, string[]>>({});
  const [captains, setCaptainsState] = useState<Captain[]>([]);
  
  // Estados de controle
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Referências
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const deviceId = useRef(getDeviceId());

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Inicialização
  useEffect(() => {
    initializeFirebase();
  }, []);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const initializeFirebase = async () => {
    setIsLoading(true);
    
    try {
      if (!isFirebaseConfigured()) {
        throw new Error('Firebase não configurado');
      }

      console.log('🔥 Inicializando Firebase...');
      
      // Tentar carregar dados do Firebase
      await loadFromFirebase();
      
      // Configurar listener para mudanças em tempo real
      setupRealtimeSync();
      
      console.log('✅ Firebase inicializado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar Firebase:', error);
      
      // Fallback para localStorage
      await loadFromLocalStorage();
      setUsingFallback(true);
      toast.error('🌐 Sem internet. Usando dados locais.');
      
    } finally {
      setIsReady(true);
      setIsLoading(false);
    }
  };

  const loadFromFirebase = async () => {
    try {
      const cloudData = await loadFromFirestore();
      
      if (cloudData) {
        console.log('☁️ Dados carregados do Firebase');
        setVolunteersState(cloudData.volunteers);
        setShiftsState(cloudData.shifts);
        setAllocationsState(cloudData.allocations);
        setCaptainsState(cloudData.captains);
        setLastSyncTime(new Date().toLocaleString('pt-BR'));
        
        // Salvar no localStorage como backup
        saveToLocalStorage(cloudData);
      } else if (seedData) {
        // Se não há dados na nuvem, usar seed data
        console.log('🌱 Usando dados iniciais');
        setVolunteersState(seedData.volunteers);
        setShiftsState(seedData.shifts);
        setAllocationsState(seedData.allocations);
        setCaptainsState(seedData.captains);
        
        // Salvar seed data no Firebase
        await saveAllToFirebase({
          volunteers: seedData.volunteers,
          shifts: seedData.shifts,
          allocations: seedData.allocations,
          captains: seedData.captains
        });
      }
    } catch (error) {
      console.error('Erro ao carregar do Firebase:', error);
      throw error;
    }
  };

  const loadFromLocalStorage = async () => {
    try {
      const localVolunteers = JSON.parse(localStorage.getItem('volunteers') || '[]');
      const localShifts = JSON.parse(localStorage.getItem('shifts') || '[]');
      const localAllocations = JSON.parse(localStorage.getItem('allocations') || '{}');
      const localCaptains = JSON.parse(localStorage.getItem('captains') || '[]');

      if (localVolunteers.length === 0 && seedData) {
        setVolunteersState(seedData.volunteers);
        setShiftsState(seedData.shifts);
        setAllocationsState(seedData.allocations);
        setCaptainsState(seedData.captains);
      } else {
        setVolunteersState(localVolunteers);
        setShiftsState(localShifts);
        setAllocationsState(localAllocations);
        setCaptainsState(localCaptains);
      }
      
      console.log('📦 Dados carregados do localStorage');
    } catch (error) {
      console.error('Erro ao carregar localStorage:', error);
      if (seedData) {
        setVolunteersState(seedData.volunteers);
        setShiftsState(seedData.shifts);
        setAllocationsState(seedData.allocations);
        setCaptainsState(seedData.captains);
      }
    }
  };

  const saveToLocalStorage = (data: any) => {
    try {
      localStorage.setItem('volunteers', JSON.stringify(data.volunteers));
      localStorage.setItem('shifts', JSON.stringify(data.shifts));
      localStorage.setItem('allocations', JSON.stringify(data.allocations));
      localStorage.setItem('captains', JSON.stringify(data.captains));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  const saveAllToFirebase = async (data: any) => {
    if (!isOnline) {
      saveToLocalStorage(data);
      toast.error('🌐 Offline. Dados salvos localmente.');
      return;
    }

    try {
      const syncData: SyncData = {
        volunteers: data.volunteers,
        shifts: data.shifts,
        allocations: data.allocations,
        captains: data.captains,
        lastUpdated: new Date().toISOString(),
        version: '3.0-firebase-only',
        deviceId: deviceId.current,
        syncTimestamp: Date.now()
      };

      const success = await saveToFirestore(syncData, deviceId.current);
      if (success) {
        setLastSyncTime(new Date().toLocaleString('pt-BR'));
        console.log('☁️ Dados salvos no Firebase');
        
        // Backup local
        saveToLocalStorage(data);
      }
    } catch (error) {
      console.error('Erro ao salvar no Firebase:', error);
      // Fallback para localStorage
      saveToLocalStorage(data);
      toast.error('❌ Erro ao salvar na nuvem. Dados salvos localmente.');
    }
  };

  const setupRealtimeSync = () => {
    if (!isFirebaseConfigured()) return;
    
    unsubscribeRef.current = subscribeToChanges((cloudData) => {
      // Verificar se mudança não veio deste dispositivo
      if (cloudData.deviceId !== deviceId.current) {
        console.log('🔄 Mudanças detectadas de outro dispositivo');
        
        setVolunteersState(cloudData.volunteers);
        setShiftsState(cloudData.shifts);
        setAllocationsState(cloudData.allocations);
        setCaptainsState(cloudData.captains);
        setLastSyncTime(new Date().toLocaleString('pt-BR'));
        
        // Backup local
        saveToLocalStorage(cloudData);
        
        toast.success('🔄 Dados atualizados automaticamente!');
      }
    });
  };

  // === SETTERS ===
  const setVolunteers = async (newVolunteers: Volunteer[]) => {
    setVolunteersState(newVolunteers);
    await saveAllToFirebase({
      volunteers: newVolunteers,
      shifts,
      allocations,
      captains
    });
  };

  const setShifts = async (newShifts: Shift[]) => {
    setShiftsState(newShifts);
    await saveAllToFirebase({
      volunteers,
      shifts: newShifts,
      allocations,
      captains
    });
  };

  const setAllocations = async (newAllocations: Record<string, string[]>) => {
    setAllocationsState(newAllocations);
    await saveAllToFirebase({
      volunteers,
      shifts,
      allocations: newAllocations,
      captains
    });
  };

  const setCaptains = async (newCaptains: Captain[]) => {
    setCaptainsState(newCaptains);
    await saveAllToFirebase({
      volunteers,
      shifts,
      allocations,
      captains: newCaptains
    });
  };

  // === MÉTODOS INDIVIDUAIS ===
  const addVolunteer = async (volunteer: Volunteer) => {
    const newVolunteers = [...volunteers, volunteer];
    await setVolunteers(newVolunteers);
  };

  const updateVolunteer = async (updatedVolunteer: Volunteer) => {
    const newVolunteers = volunteers.map((v: Volunteer) => 
      v.id === updatedVolunteer.id ? updatedVolunteer : v
    );
    await setVolunteers(newVolunteers);
  };

  const deleteVolunteer = async (id: string) => {
    const newVolunteers = volunteers.filter((v: Volunteer) => v.id !== id);
    await setVolunteers(newVolunteers);
  };

  const addShift = async (shift: Shift) => {
    const newShifts = [...shifts, shift];
    await setShifts(newShifts);
  };

  const deleteShift = async (id: string) => {
    const newShifts = shifts.filter((s: Shift) => s.id !== id);
    await setShifts(newShifts);
  };

  // === BACKUP/RESTORE ===
  const exportData = async () => {
    return {
      volunteers,
      shifts,
      allocations,
      captains,
      exportDate: new Date().toISOString(),
      version: "3.0-firebase-only"
    };
  };

  const importData = async (data: any) => {
    try {
      if (!data.volunteers || !data.shifts || !data.allocations) {
        throw new Error('Estrutura de dados inválida');
      }

      // Atualizar estados
      setVolunteersState(data.volunteers);
      setShiftsState(data.shifts);
      setAllocationsState(data.allocations);
      setCaptainsState(data.captains || []);

      // Salvar no Firebase
      await saveAllToFirebase({
        volunteers: data.volunteers,
        shifts: data.shifts,
        allocations: data.allocations,
        captains: data.captains || []
      });

      toast.success('✅ Dados importados com sucesso!');
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast.error('❌ Erro ao importar: ' + (error instanceof Error ? error.message : 'Formato inválido'));
      throw error;
    }
  };

  // === SINCRONIZAÇÃO ===
  const forceSyncToCloud = async () => {
    if (!isOnline) {
      toast.error('🌐 Sem conexão com internet');
      return;
    }

    setIsSyncing(true);
    try {
      await loadFromFirebase();
      toast.success('🔄 Dados atualizados do Firebase!');
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      toast.error('❌ Erro ao sincronizar');
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    // Estados
    volunteers,
    shifts,
    allocations,
    captains,
    
    // Status
    isLoading,
    isReady,
    isOnline,
    lastSyncTime,
    usingFallback,
    isFirebaseConfigured: isFirebaseConfigured(),
    isSyncing,
    
    // Setters
    setVolunteers,
    setShifts,
    setAllocations,
    setCaptains,
    
    // Métodos individuais
    addVolunteer,
    updateVolunteer,
    deleteVolunteer,
    addShift,
    deleteShift,
    
    // Backup/Restore
    exportData,
    importData,
    
    // Sincronização
    forceSyncToCloud
  };
} 