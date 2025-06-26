import { useState } from 'react';
import { X, Cloud, Key, Database, Shield, Globe, Hash } from 'lucide-react';

interface FirebaseConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigure: (config: any) => Promise<boolean>;
  isLoading?: boolean;
}

export function FirebaseConfig({ 
  isOpen, 
  onClose, 
  onConfigure, 
  isLoading = false 
}: FirebaseConfigProps) {
  const [config, setConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!config.apiKey || !config.authDomain || !config.projectId) {
      alert('⚠️ Preencha pelo menos API Key, Auth Domain e Project ID');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onConfigure(config);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao configurar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Cloud className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              🔥 Configurar Sincronização Firebase
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              📋 Como obter as credenciais Firebase:
            </h3>
            <ol className="text-sm text-blue-800 space-y-1 ml-4">
              <li>1. Acesse <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
              <li>2. Crie um projeto ou selecione existente</li>
              <li>3. Vá em "Configurações do projeto" → "Seus aplicativos"</li>
              <li>4. Adicione um app da web e copie a configuração</li>
              <li>5. Ative o Firestore Database (modo teste)</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Key className="h-4 w-4" />
                API Key *
              </label>
              <input
                type="text"
                value={config.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                placeholder="AIzaSyC-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Globe className="h-4 w-4" />
                Auth Domain *
              </label>
              <input
                type="text"
                value={config.authDomain}
                onChange={(e) => handleInputChange('authDomain', e.target.value)}
                placeholder="meu-projeto.firebaseapp.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Database className="h-4 w-4" />
                Project ID *
              </label>
              <input
                type="text"
                value={config.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                placeholder="meu-projeto"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Shield className="h-4 w-4" />
                Storage Bucket
              </label>
              <input
                type="text"
                value={config.storageBucket}
                onChange={(e) => handleInputChange('storageBucket', e.target.value)}
                placeholder="meu-projeto.appspot.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Hash className="h-4 w-4" />
                Messaging Sender ID
              </label>
              <input
                type="text"
                value={config.messagingSenderId}
                onChange={(e) => handleInputChange('messagingSenderId', e.target.value)}
                placeholder="123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Database className="h-4 w-4" />
                App ID
              </label>
              <input
                type="text"
                value={config.appId}
                onChange={(e) => handleInputChange('appId', e.target.value)}
                placeholder="1:123:web:abc123"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                🔒 <strong>Privacidade:</strong> Essas credenciais são salvas apenas localmente no seu navegador. 
                Não compartilhamos essas informações com terceiros.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Configurando...
                  </>
                ) : (
                  <>
                    <Cloud className="h-4 w-4" />
                    Configurar Sincronização
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 