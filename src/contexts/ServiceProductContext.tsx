import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ServiceProduct } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { isValidUrl, syncWithNetwork } from '@/lib/networkUtils';

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
  sincronizarComRede: (caminhoRede: string) => Promise<boolean>;
}

const ServiceProductContext = createContext<ServiceProductContextType | undefined>(undefined);

export const ServiceProductProvider = ({ children, servicosDbPath = "Precos_Servicos.json" }: ServiceProductProviderProps) => {
  const [items, setItems] = useState<ServiceProduct[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedItems = localStorage.getItem('serviceProdutoItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
    
    if (servicosDbPath && isValidUrl(servicosDbPath)) {
      sincronizarComRede(servicosDbPath)
        .then(sucesso => {
          if (sucesso) {
            toast({
              title: "Sincronização automática",
              description: "Dados carregados com sucesso do servidor de rede.",
            });
          }
        })
        .catch(err => {
          console.error("Erro na sincronização inicial:", err);
        });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('serviceProdutoItems', JSON.stringify(items));
    
    if (servicosDbPath && isValidUrl(servicosDbPath)) {
      syncWithNetwork(servicosDbPath, items, 'PUT')
        .then(result => {
          if (result.success) {
            console.log(`Dados sincronizados automaticamente com FTP: ${servicosDbPath}`);
          } else {
            console.error(`Falha ao sincronizar com FTP: ${servicosDbPath} - Erro: ${result.error}`);
          }
        })
        .catch(error => {
          console.error('Erro ao salvar no servidor FTP:', error);
        });
    }
  }, [items, servicosDbPath]);

  const sincronizarComRede = async (caminhoRede: string): Promise<boolean> => {
    if (!isValidUrl(caminhoRede)) {
      console.error("O caminho fornecido não é uma URL válida:", caminhoRede);
      return false;
    }

    try {
      const result = await syncWithNetwork(caminhoRede);
      
      if (result.success && result.data) {
        const sucesso = importItems(JSON.stringify(result.data));
        return sucesso;
      }
      
      return false;
    } catch (error) {
      console.error("Erro ao sincronizar com a rede:", error);
      return false;
    }
  };

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
      importItems,
      sincronizarComRede
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
