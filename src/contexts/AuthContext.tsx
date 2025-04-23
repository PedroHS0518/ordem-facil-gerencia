
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, remember?: boolean) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
  changeUsername: (newUsername: string, password: string) => boolean;
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
  const [userDatabase, setUserDatabase] = useState(tecnicos);

  useEffect(() => {
    // Verificar se existe um usuário logado no localStorage
    const storedUser = localStorage.getItem('ordemFacilUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Carregar banco de dados de usuários do localStorage se existir
    const storedUserDb = localStorage.getItem('ordemFacilUserDb');
    if (storedUserDb) {
      setUserDatabase(JSON.parse(storedUserDb));
    }
  }, []);

  // Atualizar banco de dados de usuários no localStorage quando mudar
  useEffect(() => {
    if (userDatabase !== tecnicos) {
      localStorage.setItem('ordemFacilUserDb', JSON.stringify(userDatabase));
    }
  }, [userDatabase]);

  const login = (username: string, password: string, remember: boolean = false): boolean => {
    // Verificar se é o Admin (case insensitive)
    const foundUser = userDatabase.find(
      (u) => u.nome.toLowerCase() === username.toLowerCase() && u.senha === password
    );

    if (foundUser) {
      const userObj: User = {
        id: foundUser.id,
        nome: foundUser.nome,
        tipo: foundUser.tipo
      };
      setUser(userObj);
      
      // Salvar no localStorage apenas se remember for true
      if (remember) {
        localStorage.setItem('ordemFacilUser', JSON.stringify(userObj));
      } else {
        // Garante que qualquer usuário anteriormente salvo seja removido
        localStorage.removeItem('ordemFacilUser');
      }
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ordemFacilUser');
  };

  const changePassword = (oldPassword: string, newPassword: string): boolean => {
    if (!user) return false;

    // Encontrar o usuário atual no banco de dados
    const userIndex = userDatabase.findIndex(u => u.id === user.id);
    if (userIndex === -1) return false;

    // Verificar se a senha antiga está correta
    if (userDatabase[userIndex].senha !== oldPassword) return false;

    // Atualizar a senha
    const updatedUserDb = [...userDatabase];
    updatedUserDb[userIndex] = {
      ...updatedUserDb[userIndex],
      senha: newPassword
    };

    setUserDatabase(updatedUserDb);
    return true;
  };

  const changeUsername = (newUsername: string, password: string): boolean => {
    if (!user) return false;

    // Verificar se o nome de usuário já existe
    const usernameExists = userDatabase.some(
      u => u.nome.toLowerCase() === newUsername.toLowerCase() && u.id !== user.id
    );
    if (usernameExists) return false;

    // Encontrar o usuário atual no banco de dados
    const userIndex = userDatabase.findIndex(u => u.id === user.id);
    if (userIndex === -1) return false;

    // Verificar se a senha está correta
    if (userDatabase[userIndex].senha !== password) return false;

    // Atualizar o nome de usuário
    const updatedUserDb = [...userDatabase];
    updatedUserDb[userIndex] = {
      ...updatedUserDb[userIndex],
      nome: newUsername
    };

    // Atualizar o objeto de usuário local
    const updatedUser = {
      ...user,
      nome: newUsername
    };

    setUserDatabase(updatedUserDb);
    setUser(updatedUser);

    // Se o usuário estiver salvo no localStorage, atualize lá também
    const storedUser = localStorage.getItem('ordemFacilUser');
    if (storedUser) {
      localStorage.setItem('ordemFacilUser', JSON.stringify(updatedUser));
    }

    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user, 
      changePassword,
      changeUsername
    }}>
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
