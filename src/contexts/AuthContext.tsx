
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const tecnicos = [
  { id: 1, nome: 'Thomaz', senha: 'tiimmich', tipo: 'tecnico' as const },
  { id: 2, nome: 'Pedro', senha: 'tiimmich', tipo: 'tecnico' as const },
  { id: 3, nome: 'Henrique', senha: 'tiimmich', tipo: 'tecnico' as const },
  { id: 4, nome: 'Vinicius', senha: 'tiimmich', tipo: 'tecnico' as const },
  { id: 5, nome: 'Admin', senha: 'tiimmich@admin', tipo: 'admin' as const }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar se existe um usuário logado no localStorage
    const storedUser = localStorage.getItem('ordemFacilUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const foundUser = tecnicos.find(
      (u) => u.nome.toLowerCase() === username.toLowerCase() && 
             ((u.tipo === 'admin' && password === 'tiimmich@admin') || 
              (u.tipo === 'tecnico' && password === 'tiimmich'))
    );

    if (foundUser) {
      const userObj: User = {
        id: foundUser.id,
        nome: foundUser.nome,
        tipo: foundUser.tipo
      };
      setUser(userObj);
      localStorage.setItem('ordemFacilUser', JSON.stringify(userObj));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ordemFacilUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
