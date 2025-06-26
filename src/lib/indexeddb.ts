import type { Volunteer, Shift, Captain } from '../types';

// Configuração do banco de dados
const DB_NAME = 'parkflow_db';
const DB_VERSION = 1;

// Nome das tabelas (object stores)
export const STORES = {
  VOLUNTEERS: 'volunteers',
  SHIFTS: 'shifts', 
  ALLOCATIONS: 'allocations',
  CAPTAINS: 'captains',
  METADATA: 'metadata'
} as const;

// Tipos para os dados
export interface AllocationRecord {
  id: string;
  shiftId: string;
  volunteerIds: string[];
}

export interface MetadataRecord {
  key: string;
  value: any;
  lastUpdated: string;
}

// Classe principal para gerenciar IndexedDB
export class ParkFlowDB {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  // Inicializar o banco de dados
  async init(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('✅ IndexedDB inicializado com sucesso');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Criar object stores se não existirem
        if (!db.objectStoreNames.contains(STORES.VOLUNTEERS)) {
          const volunteerStore = db.createObjectStore(STORES.VOLUNTEERS, { keyPath: 'id' });
          volunteerStore.createIndex('congregation', 'congregation', { unique: false });
          volunteerStore.createIndex('city', 'city', { unique: false });
          volunteerStore.createIndex('isTeamLeader', 'isTeamLeader', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.SHIFTS)) {
          const shiftStore = db.createObjectStore(STORES.SHIFTS, { keyPath: 'id' });
          shiftStore.createIndex('date', 'date', { unique: false });
          shiftStore.createIndex('location', 'location', { unique: false });
          shiftStore.createIndex('periodName', 'periodName', { unique: false });
          shiftStore.createIndex('dateLocation', ['date', 'location'], { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.ALLOCATIONS)) {
          const allocationStore = db.createObjectStore(STORES.ALLOCATIONS, { keyPath: 'id' });
          allocationStore.createIndex('shiftId', 'shiftId', { unique: true });
        }

        if (!db.objectStoreNames.contains(STORES.CAPTAINS)) {
          const captainStore = db.createObjectStore(STORES.CAPTAINS, { keyPath: 'id' });
          captainStore.createIndex('date', 'date', { unique: false });
          captainStore.createIndex('location', 'location', { unique: false });
          captainStore.createIndex('volunteerId', 'volunteerId', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
        }

        console.log('🔧 Estrutura do banco IndexedDB criada');
      };
    });
  }

  // Garantir que o DB está inicializado
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  // === VOLUNTEERS ===
  async getVolunteers(): Promise<Volunteer[]> {
    await this.ensureInitialized();
    return this.getAll<Volunteer>(STORES.VOLUNTEERS);
  }

  async saveVolunteers(volunteers: Volunteer[]): Promise<void> {
    await this.ensureInitialized();
    await this.saveAll(STORES.VOLUNTEERS, volunteers);
  }

  async addVolunteer(volunteer: Volunteer): Promise<void> {
    await this.ensureInitialized();
    await this.add(STORES.VOLUNTEERS, volunteer);
  }

  async updateVolunteer(volunteer: Volunteer): Promise<void> {
    await this.ensureInitialized();
    await this.update(STORES.VOLUNTEERS, volunteer);
  }

  async deleteVolunteer(id: string): Promise<void> {
    await this.ensureInitialized();
    await this.delete(STORES.VOLUNTEERS, id);
  }

  // === SHIFTS ===
  async getShifts(): Promise<Shift[]> {
    await this.ensureInitialized();
    return this.getAll<Shift>(STORES.SHIFTS);
  }

  async saveShifts(shifts: Shift[]): Promise<void> {
    await this.ensureInitialized();
    await this.saveAll(STORES.SHIFTS, shifts);
  }

  async addShift(shift: Shift): Promise<void> {
    await this.ensureInitialized();
    await this.add(STORES.SHIFTS, shift);
  }

  async deleteShift(id: string): Promise<void> {
    await this.ensureInitialized();
    await this.delete(STORES.SHIFTS, id);
  }

  // === ALLOCATIONS ===
  async getAllocations(): Promise<Record<string, string[]>> {
    await this.ensureInitialized();
    const allocations = await this.getAll<AllocationRecord>(STORES.ALLOCATIONS);
    
    // Converter de array para objeto
    const result: Record<string, string[]> = {};
    allocations.forEach(allocation => {
      result[allocation.shiftId] = allocation.volunteerIds;
    });
    
    return result;
  }

  async saveAllocations(allocations: Record<string, string[]>): Promise<void> {
    await this.ensureInitialized();
    
    // Converter objeto para array de registros
    const allocationRecords: AllocationRecord[] = Object.entries(allocations).map(([shiftId, volunteerIds]) => ({
      id: shiftId, // Usar shiftId como ID principal
      shiftId,
      volunteerIds
    }));

    await this.saveAll(STORES.ALLOCATIONS, allocationRecords);
  }

  // === CAPTAINS ===
  async getCaptains(): Promise<Captain[]> {
    await this.ensureInitialized();
    return this.getAll<Captain>(STORES.CAPTAINS);
  }

  async saveCaptains(captains: Captain[]): Promise<void> {
    await this.ensureInitialized();
    await this.saveAll(STORES.CAPTAINS, captains);
  }

  // === METADATA ===
  async getMetadata(key: string): Promise<any> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.METADATA], 'readonly');
      const store = transaction.objectStore(STORES.METADATA);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.value || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async setMetadata(key: string, value: any): Promise<void> {
    await this.ensureInitialized();
    const record: MetadataRecord = {
      key,
      value,
      lastUpdated: new Date().toISOString()
    };

    await this.add(STORES.METADATA, record);
  }

  // === BACKUP E RESTORE ===
  async exportAllData(): Promise<{
    volunteers: Volunteer[];
    shifts: Shift[];
    allocations: Record<string, string[]>;
    captains: Captain[];
    exportDate: string;
    version: string;
  }> {
    await this.ensureInitialized();
    
    const [volunteers, shifts, allocations, captains] = await Promise.all([
      this.getVolunteers(),
      this.getShifts(),
      this.getAllocations(),
      this.getCaptains()
    ]);

    return {
      volunteers,
      shifts,
      allocations,
      captains,
      exportDate: new Date().toISOString(),
      version: "2.0-indexeddb"
    };
  }

  async importAllData(data: {
    volunteers: Volunteer[];
    shifts: Shift[];
    allocations: Record<string, string[]>;
    captains: Captain[];
  }): Promise<void> {
    await this.ensureInitialized();

    // Limpar todos os dados existentes
    await this.clearAll();

    // Importar novos dados
    await Promise.all([
      this.saveVolunteers(data.volunteers),
      this.saveShifts(data.shifts),
      this.saveAllocations(data.allocations),
      this.saveCaptains(data.captains)
    ]);

    // Marcar como migrado
    await this.setMetadata('migrated_from_localstorage', true);
    await this.setMetadata('last_import', new Date().toISOString());
  }

  // === MIGRAÇÃO DO LOCALSTORAGE ===
  async migrateFromLocalStorage(): Promise<boolean> {
    try {
      await this.ensureInitialized();

      // Verificar se já foi migrado
      const alreadyMigrated = await this.getMetadata('migrated_from_localstorage');
      if (alreadyMigrated) {
        console.log('🔄 Dados já foram migrados do localStorage');
        return true;
      }

      // Verificar se há dados no localStorage
      const localStorageData = this.getLocalStorageData();
      if (!localStorageData.hasData) {
        console.log('📭 Nenhum dado encontrado no localStorage para migrar');
        await this.setMetadata('migrated_from_localstorage', true);
        return true;
      }

      console.log('🔄 Iniciando migração do localStorage para IndexedDB...');

      // Migrar dados
      await this.importAllData({
        volunteers: localStorageData.volunteers,
        shifts: localStorageData.shifts,
        allocations: localStorageData.allocations,
        captains: localStorageData.captains
      });

      console.log('✅ Migração do localStorage concluída com sucesso!');
      console.log(`📊 Migrados: ${localStorageData.volunteers.length} voluntários, ${localStorageData.shifts.length} turnos`);

      return true;
    } catch (error) {
      console.error('❌ Erro na migração do localStorage:', error);
      return false;
    }
  }

  // Obter dados do localStorage
  private getLocalStorageData(): {
    hasData: boolean;
    volunteers: Volunteer[];
    shifts: Shift[];
    allocations: Record<string, string[]>;
    captains: Captain[];
  } {
    try {
      const volunteers = JSON.parse(localStorage.getItem('volunteers') || '[]');
      const shifts = JSON.parse(localStorage.getItem('shifts') || '[]');
      const allocations = JSON.parse(localStorage.getItem('allocations') || '{}');
      const captains = JSON.parse(localStorage.getItem('captains') || '[]');

      const hasData = volunteers.length > 0 || shifts.length > 0 || Object.keys(allocations).length > 0;

      return {
        hasData,
        volunteers,
        shifts,
        allocations,
        captains
      };
    } catch (error) {
      console.error('Erro ao ler localStorage:', error);
      return {
        hasData: false,
        volunteers: [],
        shifts: [],
        allocations: {},
        captains: []
      };
    }
  }

  // === MÉTODOS UTILITÁRIOS PRIVADOS ===
  private async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private async saveAll<T>(storeName: string, data: T[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      // Limpar store antes de salvar novos dados
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        // Adicionar todos os novos dados
        let completed = 0;
        let hasError = false;

        if (data.length === 0) {
          resolve();
          return;
        }

        data.forEach(item => {
          const addRequest = store.add(item);
          
          addRequest.onsuccess = () => {
            completed++;
            if (completed === data.length && !hasError) {
              resolve();
            }
          };

          addRequest.onerror = () => {
            if (!hasError) {
              hasError = true;
              reject(addRequest.error);
            }
          };
        });
      };

      clearRequest.onerror = () => {
        reject(clearRequest.error);
      };
    });
  }

  private async add<T>(storeName: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data); // Usar put em vez de add para permitir updates

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async update<T>(storeName: string, data: T): Promise<void> {
    return this.add(storeName, data); // put() funciona tanto para add quanto update
  }

  private async delete(storeName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async clearAll(): Promise<void> {
    const storeNames = [STORES.VOLUNTEERS, STORES.SHIFTS, STORES.ALLOCATIONS, STORES.CAPTAINS];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeNames, 'readwrite');
      let completed = 0;

      storeNames.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          completed++;
          if (completed === storeNames.length) {
            resolve();
          }
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    });
  }

  // Verificar se IndexedDB está disponível
  static isSupported(): boolean {
    return 'indexedDB' in window && indexedDB !== null;
  }

  // Fechar conexão com o banco
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

// Instância singleton
export const parkFlowDB = new ParkFlowDB();

// Fallback para localStorage caso IndexedDB falhe
export class LocalStorageFallback {
  static getVolunteers(): Volunteer[] {
    try {
      return JSON.parse(localStorage.getItem('volunteers') || '[]');
    } catch {
      return [];
    }
  }

  static saveVolunteers(volunteers: Volunteer[]): void {
    localStorage.setItem('volunteers', JSON.stringify(volunteers));
  }

  static getShifts(): Shift[] {
    try {
      return JSON.parse(localStorage.getItem('shifts') || '[]');
    } catch {
      return [];
    }
  }

  static saveShifts(shifts: Shift[]): void {
    localStorage.setItem('shifts', JSON.stringify(shifts));
  }

  static getAllocations(): Record<string, string[]> {
    try {
      return JSON.parse(localStorage.getItem('allocations') || '{}');
    } catch {
      return {};
    }
  }

  static saveAllocations(allocations: Record<string, string[]>): void {
    localStorage.setItem('allocations', JSON.stringify(allocations));
  }

  static getCaptains(): Captain[] {
    try {
      return JSON.parse(localStorage.getItem('captains') || '[]');
    } catch {
      return [];
    }
  }

  static saveCaptains(captains: Captain[]): void {
    localStorage.setItem('captains', JSON.stringify(captains));
  }
} 