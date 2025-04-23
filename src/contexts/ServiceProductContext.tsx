
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ServiceProduct } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Create a type for the path value we'll receive from props
interface ServiceProductProviderProps {
  children: ReactNode;
  servicosDbPath?: string | null;
}

interface ServiceProductContextType {
  items: ServiceProduct[];
  addItem: (item: Omit<ServiceProduct, 'id'>) => void;
  removeItem: (id: number) => void;
  updateItem: (id: number, item: Partial<ServiceProduct>) => void;
  exportItems: () => string;
  importItems: (jsonString: string) => boolean;
}

const ServiceProductContext = createContext<ServiceProductContextType | undefined>(undefined);

export const ServiceProductProvider = ({ children, servicosDbPath = "Precos_Servicos.json" }: ServiceProductProviderProps) => {
  const [items, setItems] = useState<ServiceProduct[]>([]);
  const { toast } = useToast();

  // Load items from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('serviceProdutoItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  // Save items to localStorage when they change
  useEffect(() => {
    localStorage.setItem('serviceProdutoItems', JSON.stringify(items));
    
    // Em uma aplicação real, aqui seria o código que salvaria os dados no arquivo
    // definido por servicosDbPath para manter sincronizado com outros computadores
    if (servicosDbPath) {
      console.log(`Salvando serviços/produtos no arquivo: ${servicosDbPath}`);
      // Simula operação de salvamento em um arquivo externo
      // NOTA: Os dados salvos no localStorage são específicos para este computador.
      // Para sincronizar com outros dispositivos, é necessário exportar os dados e importá-los no outro dispositivo.
    }
  }, [items, servicosDbPath]);

  const addItem = (item: Omit<ServiceProduct, 'id'>) => {
    const newItem = {
      ...item,
      id: items.length ? Math.max(...items.map(i => i.id)) + 1 : 1
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: number, updates: Partial<ServiceProduct>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const exportItems = () => {
    return JSON.stringify(items, null, 2);
  };

  const importItems = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      
      if (Array.isArray(data)) {
        setItems(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  };

  return (
    <ServiceProductContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateItem,
      exportItems,
      importItems
    }}>
      {children}
    </ServiceProductContext.Provider>
  );
};

export const useServiceProduct = () => {
  const context = useContext(ServiceProductContext);
  if (context === undefined) {
    throw new Error('useServiceProduct deve ser usado dentro de um ServiceProductProvider');
  }
  return context;
};
