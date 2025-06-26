import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp,
  Firestore
} from 'firebase/firestore';

// Configuração Firebase - será preenchida pelo usuário
let firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

let app: any = null;
let db: Firestore | null = null;
let isConfigured = false;

// Interface para os dados sincronizados
export interface SyncData {
  volunteers: any[];
  shifts: any[];
  allocations: Record<string, string[]>;
  captains: any[];
  lastUpdated: any;
  version: string;
  deviceId?: string;
  syncTimestamp?: number;
}

// Configurar Firebase
export const configureFirebase = (config: typeof firebaseConfig) => {
  try {
    firebaseConfig = config;
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isConfigured = true;
    
    // Salvar configuração no localStorage
    localStorage.setItem('firebase_config', JSON.stringify(config));
    
    console.log('🔥 Firebase configurado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar Firebase:', error);
    return false;
  }
};

// Carregar configuração salva
export const loadFirebaseConfig = () => {
  try {
    const savedConfig = localStorage.getItem('firebase_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      return configureFirebase(config);
    }
  } catch (error) {
    console.error('Erro ao carregar configuração Firebase:', error);
  }
  return false;
};

// Verificar se Firebase está configurado
export const isFirebaseConfigured = () => isConfigured;

// Salvar dados no Firestore
export const saveToFirestore = async (data: SyncData, deviceId: string) => {
  if (!db || !isConfigured) return false;
  
  try {
    const docRef = doc(db, 'parkflow_data', 'main');
    const syncData = {
      ...data,
      lastUpdated: serverTimestamp(),
      deviceId,
      syncTimestamp: Date.now()
    };
    
    await setDoc(docRef, syncData, { merge: true });
    console.log('☁️ Dados salvos no Firebase');
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar no Firebase:', error);
    return false;
  }
};

// Carregar dados do Firestore
export const loadFromFirestore = async (): Promise<SyncData | null> => {
  if (!db || !isConfigured) return null;
  
  try {
    const docRef = doc(db, 'parkflow_data', 'main');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as SyncData;
      console.log('☁️ Dados carregados do Firebase');
      return data;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar do Firebase:', error);
  }
  
  return null;
};

// Escutar mudanças em tempo real
export const subscribeToChanges = (callback: (data: SyncData) => void) => {
  if (!db || !isConfigured) return () => {};
  
  const docRef = doc(db, 'parkflow_data', 'main');
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data() as SyncData;
      console.log('🔄 Mudanças detectadas no Firebase');
      callback(data);
    }
  }, (error) => {
    console.error('❌ Erro no listener Firebase:', error);
  });
};

// Resetar configuração
export const resetFirebaseConfig = () => {
  isConfigured = false;
  app = null;
  db = null;
  localStorage.removeItem('firebase_config');
};

// Gerar ID único do dispositivo
export const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}; 