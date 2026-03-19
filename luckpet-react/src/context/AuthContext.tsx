
import React, { createContext, useState, useEffect, ReactNode } from 'react';
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
  isAdmin: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedCredits = localStorage.getItem('userCredits');

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        let userCredits = parsedUser.credits;
        if (savedCredits) {
          const parsedCredits = Number(savedCredits);
          userCredits = Number.isFinite(parsedCredits) ? parsedCredits : 200;
        } else {
          userCredits = Number.isFinite(userCredits) ? userCredits : 200;
        }

        setCredits(userCredits);

        if (!parsedUser.credits || parsedUser.credits !== userCredits) {
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
      const isGuest = localStorage.getItem('isGuest');
      if (isGuest) {
        const guestId = localStorage.getItem('guestId') || 'guest_' + Date.now();
        if (!localStorage.getItem('guestId')) {
          localStorage.setItem('guestId', guestId);
        }

        const guestUser: User = {
          id: guestId,
          name: 'Convidado',
          email: `convidado_${guestId}@luckpet.com`,
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

    setIsLoading(false);

    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      const updatedCredits = localStorage.getItem('userCredits');

      if (updatedUser) {
        try {
          setUser(JSON.parse(updatedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }

      if (updatedCredits) {
        const parsedCredits = Number(updatedCredits);
        setCredits(Number.isFinite(parsedCredits) ? parsedCredits : 0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData: User) => {
    const userWithRole = {
      ...userData,
      credits: Number.isFinite(userData.credits) ? userData.credits : 200,
      role: userData.role || 'user'
    };

    localStorage.setItem('user', JSON.stringify(userWithRole));
    localStorage.setItem('userCredits', userWithRole.credits.toString());
    setUser(userWithRole);
    setCredits(userWithRole.credits);
  };

  const logout = () => {
    const wasGuest = !!localStorage.getItem('isGuest');

    localStorage.removeItem('user');
    localStorage.removeItem('userCredits');
    localStorage.removeItem('isGuest');
    localStorage.removeItem('guestId');

    if (!wasGuest) {
      localStorage.removeItem('carrinho');
      localStorage.removeItem('favoritos');
    }

    setUser(null);
    setCredits(0);
  };

  const updateCredits = (newCredits: number) => {
    const safeCredits = Number.isFinite(newCredits) ? newCredits : 0;

    localStorage.setItem('userCredits', safeCredits.toString());
    setCredits(safeCredits);

    if (user) {
      const updatedUser = { ...user, credits: safeCredits };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const addCredits = (amount: number) => {
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    const newCredits = credits + safeAmount;
    updateCredits(newCredits);

    const event = new CustomEvent('notification', {
      detail: {
        message: `+${safeAmount} LuckCoins adicionados! Saldo: ${newCredits}`,
        type: 'success'
      }
    });
    window.dispatchEvent(event);
  };

  const deductCredits = (amount: number): boolean => {
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    if (credits >= safeAmount) {
      const newCredits = credits - safeAmount;
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
    isAdmin: user?.role === 'admin',
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};