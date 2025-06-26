import { useState, useEffect, useRef } from 'react';
import { parkFlowDB, LocalStorageFallback, ParkFlowDB } from '../lib/indexeddb';
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

interface UseIndexedDBReturn {
  // Estados
  volunteers: Volunteer[];
  shifts: Shift[];
  allocations: Record<string, string[]>;
  captains: Captain[];
  
  // Status
  isLoading: boolean;
  isReady: boolean;
  usingFallback: boolean;
  isFirebaseConfigured: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  
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
  
  // Sincronização Firebase
  forceSyncToCloud: () => Promise<void>;
}

export function useIndexedDB(seedData?: {
  volunteers: Volunteer[];
  shifts: Shift[];
  allocations: Record<string, string[]>;
  captains: Captain[];
}): UseIndexedDBReturn {
  // Estados locais
  const [volunteers, setVolunteersState] = useState<Volunteer[]>([]);
  const [shifts, setShiftsState] = useState<Shift[]>([]);
  const [allocations, setAllocationsState] = useState<Record<string, string[]>>({});
  const [captains, setCaptainsState] = useState<Captain[]>([]);
  
  // Estados de controle
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  
  // Estados de sincronização Firebase
  const [isFirebaseConfiguredState, setIsFirebaseConfiguredState] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  // Referências para controle de sincronização
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const deviceId = useRef(getDeviceId());
  const lastSyncTimestamp = useRef<number>(0);

  // Inicialização
  useEffect(() => {
    initializeDatabase();
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

  const initializeDatabase = async () => {
    setIsLoading(true);
    
    try {
      // Verificar se IndexedDB está disponível
      if (!ParkFlowDB.isSupported()) {
        console.warn('⚠️ IndexedDB não suportado, usando localStorage');
        await initializeFallback();
        return;
      }

      // Inicializar IndexedDB
      await parkFlowDB.init();
      
      // Tentar migração do localStorage
      await parkFlowDB.migrateFromLocalStorage();
      
      // Carregar dados do IndexedDB
      await loadFromIndexedDB();
      
      console.log('✅ IndexedDB inicializado e dados carregados');
      setUsingFallback(false);
      
    } catch (error) {
      console.error('❌ Erro ao inicializar IndexedDB:', error);
      console.warn('🔄 Fallback para localStorage');
      await initializeFallback();
    } finally {
      setIsReady(true);
      setIsLoading(false);
    }
  };

  const initializeFallback = async () => {
    try {
      const fallbackVolunteers = LocalStorageFallback.getVolunteers();
      const fallbackShifts = LocalStorageFallback.getShifts();
      const fallbackAllocations = LocalStorageFallback.getAllocations();
      const fallbackCaptains = LocalStorageFallback.getCaptains();

      // Se não há dados e temos seed data, usar os dados seed
      if (fallbackVolunteers.length === 0 && seedData) {
        setVolunteersState(seedData.volunteers);
        setShiftsState(seedData.shifts);
        setAllocationsState(seedData.allocations);
        setCaptainsState(seedData.captains);
        
        // Salvar dados seed no localStorage
        LocalStorageFallback.saveVolunteers(seedData.volunteers);
        LocalStorageFallback.saveShifts(seedData.shifts);
        LocalStorageFallback.saveAllocations(seedData.allocations);
        LocalStorageFallback.saveCaptains(seedData.captains);
      } else {
        setVolunteersState(fallbackVolunteers);
        setShiftsState(fallbackShifts);
        setAllocationsState(fallbackAllocations);
        setCaptainsState(fallbackCaptains);
      }
      
      setUsingFallback(true);
      console.log('📦 localStorage fallback ativo');
      
    } catch (error) {
      console.error('❌ Erro no fallback localStorage:', error);
      // Em último caso, usar dados seed se disponíveis
      if (seedData) {
        setVolunteersState(seedData.volunteers);
        setShiftsState(seedData.shifts);
        setAllocationsState(seedData.allocations);
        setCaptainsState(seedData.captains);
      }
    }
  };

  const loadFromIndexedDB = async () => {
    try {
      const [dbVolunteers, dbShifts, dbAllocations, dbCaptains] = await Promise.all([
        parkFlowDB.getVolunteers(),
        parkFlowDB.getShifts(),
        parkFlowDB.getAllocations(),
        parkFlowDB.getCaptains()
      ]);

      // Se não há dados e temos seed data, usar os dados seed
      if (dbVolunteers.length === 0 && seedData) {
        await parkFlowDB.saveVolunteers(seedData.volunteers);
        await parkFlowDB.saveShifts(seedData.shifts);
        await parkFlowDB.saveAllocations(seedData.allocations);
        await parkFlowDB.saveCaptains(seedData.captains);
        
        setVolunteersState(seedData.volunteers);
        setShiftsState(seedData.shifts);
        setAllocationsState(seedData.allocations);
        setCaptainsState(seedData.captains);
      } else {
        setVolunteersState(dbVolunteers);
        setShiftsState(dbShifts);
        setAllocationsState(dbAllocations);
        setCaptainsState(dbCaptains);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do IndexedDB:', error);
      throw error;
    }
  };

  // === FIREBASE SYNC ===
  const initializeFirebase = async () => {
    try {
      // Firebase já configurado automaticamente no código
      const configured = isFirebaseConfigured();
      setIsFirebaseConfiguredState(configured);
      
      if (configured) {
        console.log('🔥 Firebase configurado automaticamente');
        // Tentar sincronizar dados da nuvem
        await syncFromCloud();
        // Configurar listener para mudanças
        setupRealtimeSync();
      }
    } catch (error) {
      console.error('Erro ao inicializar Firebase:', error);
    }
  };

  const syncFromCloud = async () => {
    if (!isFirebaseConfiguredState) return;
    
    try {
      setIsSyncing(true);
      const cloudData = await loadFromFirestore();
      
             if (cloudData && (cloudData.syncTimestamp || 0) > lastSyncTimestamp.current) {
        console.log('📥 Sincronizando dados da nuvem');
        
        // Atualizar estados locais
        setVolunteersState(cloudData.volunteers);
        setShiftsState(cloudData.shifts);  
        setAllocationsState(cloudData.allocations);
        setCaptainsState(cloudData.captains);
        
        // Salvar localmente
        if (!usingFallback) {
          await parkFlowDB.saveVolunteers(cloudData.volunteers);
          await parkFlowDB.saveShifts(cloudData.shifts);
          await parkFlowDB.saveAllocations(cloudData.allocations);
          await parkFlowDB.saveCaptains(cloudData.captains);
        } else {
          LocalStorageFallback.saveVolunteers(cloudData.volunteers);
          LocalStorageFallback.saveShifts(cloudData.shifts);
          LocalStorageFallback.saveAllocations(cloudData.allocations);
          LocalStorageFallback.saveCaptains(cloudData.captains);
        }
        
        lastSyncTimestamp.current = cloudData.syncTimestamp || Date.now();
        setLastSyncTime(new Date().toLocaleString('pt-BR'));
        toast.success('📥 Dados sincronizados da nuvem!');
      }
    } catch (error) {
      console.error('Erro ao sincronizar da nuvem:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncToCloud = async () => {
    if (!isFirebaseConfiguredState) return;
    
    try {
      const syncData: SyncData = {
        volunteers,
        shifts,
        allocations,
        captains,
        lastUpdated: new Date().toISOString(), 
        version: '2.0-firebase-sync'
      };
      
      const success = await saveToFirestore(syncData, deviceId.current);
      if (success) {
        setLastSyncTime(new Date().toLocaleString('pt-BR'));
        console.log('📤 Dados sincronizados para nuvem');
      }
    } catch (error) {
      console.error('Erro ao sincronizar para nuvem:', error);
    }
  };

  const setupRealtimeSync = () => {
    if (!isFirebaseConfiguredState) return;
    
    // Limpar listener anterior se existir
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    
    unsubscribeRef.current = subscribeToChanges((cloudData) => {
      // Verificar se mudança não veio deste dispositivo
             if (cloudData.deviceId !== deviceId.current && 
           (cloudData.syncTimestamp || 0) > lastSyncTimestamp.current) {
        console.log('🔄 Mudanças detectadas de outro dispositivo');
        
        // Atualizar dados locais
        setVolunteersState(cloudData.volunteers);
        setShiftsState(cloudData.shifts);
        setAllocationsState(cloudData.allocations);
        setCaptainsState(cloudData.captains);
        
        lastSyncTimestamp.current = cloudData.syncTimestamp || Date.now();
        setLastSyncTime(new Date().toLocaleString('pt-BR'));
        
        toast.success('🔄 Dados atualizados de outro dispositivo!');
      }
    });
  };

  // === SETTERS ===
  const setVolunteers = async (newVolunteers: Volunteer[]) => {
    setVolunteersState(newVolunteers);
    
    if (usingFallback) {
      LocalStorageFallback.saveVolunteers(newVolunteers);
    } else {
      try {
        await parkFlowDB.saveVolunteers(newVolunteers);
      } catch (error) {
        console.error('Erro ao salvar voluntários:', error);
        toast.error('Erro ao salvar dados dos voluntários');
      }
    }
    
    // Sincronizar com Firebase se configurado
    if (isFirebaseConfiguredState) {
      setTimeout(() => syncToCloud(), 1000); // Debounce
    }
  };

  const setShifts = async (newShifts: Shift[]) => {
    setShiftsState(newShifts);
    
    if (usingFallback) {
      LocalStorageFallback.saveShifts(newShifts);
    } else {
      try {
        await parkFlowDB.saveShifts(newShifts);
      } catch (error) {
        console.error('Erro ao salvar turnos:', error);
        toast.error('Erro ao salvar dados dos turnos');
      }
    }
    
    // Sincronizar com Firebase se configurado
    if (isFirebaseConfiguredState) {
      setTimeout(() => syncToCloud(), 1000); // Debounce
    }
  };

  const setAllocations = async (newAllocations: Record<string, string[]>) => {
    setAllocationsState(newAllocations);
    
    if (usingFallback) {
      LocalStorageFallback.saveAllocations(newAllocations);
    } else {
      try {
        await parkFlowDB.saveAllocations(newAllocations);
      } catch (error) {
        console.error('Erro ao salvar alocações:', error);
        toast.error('Erro ao salvar dados das alocações');
      }
    }
    
    // Sincronizar com Firebase se configurado
    if (isFirebaseConfiguredState) {
      setTimeout(() => syncToCloud(), 1000); // Debounce
    }
  };

  const setCaptains = async (newCaptains: Captain[]) => {
    setCaptainsState(newCaptains);
    
    if (usingFallback) {
      LocalStorageFallback.saveCaptains(newCaptains);
    } else {
      try {
        await parkFlowDB.saveCaptains(newCaptains);
      } catch (error) {
        console.error('Erro ao salvar capitães:', error);
        toast.error('Erro ao salvar dados dos capitães');
      }
    }
    
    // Sincronizar com Firebase se configurado
    if (isFirebaseConfiguredState) {
      setTimeout(() => syncToCloud(), 1000); // Debounce
    }
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
    if (usingFallback) {
      return {
        volunteers,
        shifts,
        allocations,
        captains,
        exportDate: new Date().toISOString(),
        version: "2.0-localStorage-fallback"
      };
    } else {
      try {
        return await parkFlowDB.exportAllData();
      } catch (error) {
        console.error('Erro ao exportar dados:', error);
        // Fallback para dados em memória
        return {
          volunteers,
          shifts,
          allocations,
          captains,
          exportDate: new Date().toISOString(),
          version: "2.0-memory-fallback"
        };
      }
    }
  };

  const importData = async (data: any) => {
    try {
      // Validar estrutura dos dados
      if (!data.volunteers || !data.shifts || !data.allocations) {
        throw new Error('Estrutura de dados inválida');
      }

      // Atualizar estados
      setVolunteersState(data.volunteers);
      setShiftsState(data.shifts);
      setAllocationsState(data.allocations);
      setCaptainsState(data.captains || []);

      // Salvar no banco
      if (usingFallback) {
        LocalStorageFallback.saveVolunteers(data.volunteers);
        LocalStorageFallback.saveShifts(data.shifts);
        LocalStorageFallback.saveAllocations(data.allocations);
        LocalStorageFallback.saveCaptains(data.captains || []);
      } else {
        await parkFlowDB.importAllData({
          volunteers: data.volunteers,
          shifts: data.shifts,
          allocations: data.allocations,
          captains: data.captains || []
        });
      }

      toast.success('Dados importados com sucesso!');
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast.error('Erro ao importar dados: ' + (error instanceof Error ? error.message : 'Formato inválido'));
      throw error;
    }
  };

  // === MÉTODOS DE SINCRONIZAÇÃO ===
  const forceSyncToCloud = async () => {
    if (!isFirebaseConfiguredState) {
      toast.error('Firebase não configurado');
      return;
    }
    
    setIsSyncing(true);
    try {
      await syncToCloud();
      toast.success('📤 Dados enviados para nuvem!');
    } catch (error) {
      console.error('Erro ao forçar sincronização:', error);
      toast.error('Erro ao sincronizar');
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
    usingFallback,
    isFirebaseConfigured: isFirebaseConfiguredState,
    isSyncing,
    lastSyncTime,
    
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
    
    // Sincronização Firebase
    forceSyncToCloud
  };
} 