
import { createContext, useState, useContext, ReactNode } from 'react';
import { ServiceProduct } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ServiceProductContextType {
  items: ServiceProduct[];
  addItem: (item: Omit<ServiceProduct, 'id'>) => void;
  removeItem: (id: number) => void;
  updateItem: (id: number, item: Partial<ServiceProduct>) => void;
}

const ServiceProductContext = createContext<ServiceProductContextType | undefined>(undefined);

export const ServiceProductProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ServiceProduct[]>([]);
  const { toast } = useToast();

  // Load items from localStorage on mount
  useState(() => {
    const savedItems = localStorage.getItem('serviceProdutoItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  });

  // Save items to localStorage when they change
  useState(() => {
    localStorage.setItem('serviceProdutoItems', JSON.stringify(items));
  }, [items]);

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

  return (
    <ServiceProductContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateItem,
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
