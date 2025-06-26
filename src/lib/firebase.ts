import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp
} from 'firebase/firestore';

// Configuração Firebase - preencha com suas credenciais
const firebaseConfig = {
  apiKey: "AIzaSyA6M5DTgimgrADrw0W2MchhQDg85NcyAcU",
  authDomain: "parkflow-df0ee.firebaseapp.com", 
  projectId: "parkflow-df0ee",
  storageBucket: "parkflow-df0ee.firebasestorage.app",
  messagingSenderId: "569800792139",
  appId: "1:569800792139:web:15ab158f72681324d4d5ce"
};

// Inicializar Firebase automaticamente
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const isConfigured = true;

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

// Firebase já configurado automaticamente - não precisa resetar

// Gerar ID único do dispositivo
export const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}; 