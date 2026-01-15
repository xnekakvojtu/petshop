// src/context/AuthContext.tsx - VERSÃO COMPLETA COM ADMIN
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  credits: number;
  login: (userData: User) => void;
  logout: () => void;
  updateCredits: (newCredits: number) => void;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => boolean;
  isLoggedIn: boolean;
  isGuest: boolean;
  isAdmin: boolean; // ⭐ NOVO
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(0);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedCredits = localStorage.getItem('userCredits');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Se não tem créditos, dá 200 créditos iniciais
        const userCredits = parsedUser.credits || (savedCredits ? parseInt(savedCredits) : 200);
        setCredits(userCredits);
        
        // Atualiza localStorage com créditos
        if (!parsedUser.credits) {
          parsedUser.credits = userCredits;
          localStorage.setItem('user', JSON.stringify(parsedUser));
        }
        localStorage.setItem('userCredits', userCredits.toString());
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('userCredits');
        setUser(null);
        setCredits(0);
      }
    } else {
      // Verifica se é convidado
      const isGuest = localStorage.getItem('isGuest');
      if (isGuest) {
        const guestUser: User = {
          id: 'guest_' + Date.now(),
          name: 'Convidado',
          email: 'convidado@luckpet.com',
          credits: 100,
          isGuest: true,
          avatar: 'cachorro',
          role: 'user'
        };
        setUser(guestUser);
        setCredits(100);
        localStorage.setItem('user', JSON.stringify(guestUser));
        localStorage.setItem('userCredits', '100');
      }
    }

    // Listener para mudanças no localStorage
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      const updatedCredits = localStorage.getItem('userCredits');
      
      if (updatedUser) {
        try {
          setUser(JSON.parse(updatedUser));
        } catch (error) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      if (updatedCredits) {
        setCredits(parseInt(updatedCredits));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData: User) => {
    // Garantir que o usuário tenha role
    const userWithRole = {
      ...userData,
      credits: userData.credits || 200,
      role: userData.role || 'user' // ⭐ Garantir role
    };
    
    localStorage.setItem('user', JSON.stringify(userWithRole));
    localStorage.setItem('userCredits', userWithRole.credits.toString());
    setUser(userWithRole);
    setCredits(userWithRole.credits);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userCredits');
    localStorage.removeItem('isGuest');
    // Não limpa carrinho e favoritos para convidados manterem
    if (!localStorage.getItem('isGuest')) {
      localStorage.removeItem('carrinho');
      localStorage.removeItem('favoritos');
    }
    setUser(null);
    setCredits(0);
  };

  const updateCredits = (newCredits: number) => {
    localStorage.setItem('userCredits', newCredits.toString());
    setCredits(newCredits);
    
    // Atualiza também no objeto user
    if (user) {
      const updatedUser = { ...user, credits: newCredits };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const addCredits = (amount: number) => {
    const newCredits = credits + amount;
    updateCredits(newCredits);
    
    // Notificação
    const event = new CustomEvent('notification', {
      detail: { 
        message: `+${amount} LuckCoins adicionados! Saldo: ${newCredits}`, 
        type: 'success' 
      }
    });
    window.dispatchEvent(event);
  };

  const deductCredits = (amount: number): boolean => {
    if (credits >= amount) {
      const newCredits = credits - amount;
      updateCredits(newCredits);
      return true;
    }
    return false;
  };

  const value: AuthContextType = {
    user,
    credits,
    login,
    logout,
    updateCredits,
    addCredits,
    deductCredits,
    isLoggedIn: !!user,
    isGuest: !!user?.isGuest,
    isAdmin: user?.role === 'admin', // ⭐ CALCULA isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook useAuth - deve ser usado dentro de AuthProvider
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};