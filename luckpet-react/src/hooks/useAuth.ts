// src/hooks/useAuth.ts - VERSÃO COM isAdmin
import { useState, useEffect } from 'react';
import { User } from '../types';
import { 
  loginWithEmail as firebaseLogin,
  registerWithEmail as firebaseRegister,
  loginWithGoogle as firebaseGoogleLogin,
  logout as firebaseLogout
} from '../firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do usuário
  const loadUserData = () => {
    const savedUser = localStorage.getItem('user');
    const savedCredits = localStorage.getItem('userCredits');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setCredits(parsedUser.credits || parseInt(savedCredits || '100'));
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('userCredits');
        setUser(null);
        setCredits(0);
      }
    } else {
      setUser(null);
      setCredits(0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUserData();

    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'userCredits') {
        loadUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData: User) => {
    try {
      // Garantir que tenha role
      const userWithRole = {
        ...userData,
        credits: userData.credits || 200,
        role: userData.role || 'user'
      };
      
      localStorage.setItem('user', JSON.stringify(userWithRole));
      localStorage.setItem('userCredits', userWithRole.credits.toString());
      setUser(userWithRole);
      setCredits(userWithRole.credits);
      
      // Disparar eventos
      window.dispatchEvent(new Event('authChange'));
      window.dispatchEvent(new Event('storage'));
      
      console.log('Login realizado:', userWithRole);
      return true;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('Iniciando logout...');
      
      // 1. Logout do Firebase primeiro
      try {
        await firebaseLogout();
        console.log('✅ Logout do Firebase realizado');
      } catch (firebaseError) {
        console.log('⚠️  Erro no logout do Firebase, continuando com logout local...');
      }
      
      // 2. Limpar dados do localStorage
      const itemsToRemove = [
        'user',
        'userCredits',
        'isGuest',
        'isNewUser',
        'logoutTime',
        'wishlist', 
        'forceNewGoogleLogin',
        'cart'
      ];
      
      itemsToRemove.forEach(item => localStorage.removeItem(item));
      
      // 3. Limpar dados específicos do Firebase/Google
      const firebaseKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('firebase') || 
        key.includes('google') ||
        key.startsWith('CognitoIdentityServiceProvider')
      );
      
      firebaseKeys.forEach(key => {
        console.log('Removendo:', key);
        localStorage.removeItem(key);
      });
      
      // 4. Limpar sessionStorage completamente
      sessionStorage.clear();
      
      // 5. Limpar cookies relacionados a autenticação
      document.cookie.split(';').forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim();
        if (cookieName.includes('auth') || cookieName.includes('session')) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
      
      // 6. Atualizar estado local
      setUser(null);
      setCredits(0);
      
      // 7. Disparar eventos
      window.dispatchEvent(new Event('authChange'));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      
      console.log('✅ Logout realizado com sucesso');
      
      // 8. Redirecionar para home sem recarregar a página inteira
      setTimeout(() => {
        if (window.location.pathname !== '/') {
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      }, 100);
      
      return true;
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      
      // Força o logout mesmo com erro
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      setCredits(0);
      window.location.href = '/';
      
      return false;
    }
  };

  const updateCredits = (newCredits: number) => {
    try {
      localStorage.setItem('userCredits', newCredits.toString());
      setCredits(newCredits);
      
      if (user) {
        const updatedUser = { ...user, credits: newCredits };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('authChange'));
      }
    } catch (error) {
      console.error('Erro ao atualizar créditos:', error);
    }
  };

  const addCredits = (amount: number) => {
    const newCredits = credits + amount;
    updateCredits(newCredits);
  };

  const deductCredits = (amount: number): boolean => {
    if (credits >= amount) {
      const newCredits = credits - amount;
      updateCredits(newCredits);
      return true;
    }
    return false;
  };

  const addInitialCredits = () => {
    addCredits(200);
  };

  // Funções Firebase
  const handleLoginWithEmail = async (email: string, password: string): Promise<User> => {
    try {
      console.log('useAuth: Tentando login com email...');
      const userData = await firebaseLogin(email, password);
      login(userData);
      return userData;
    } catch (error) {
      console.error('useAuth: Erro no login:', error);
      throw error;
    }
  };

  const handleRegisterWithEmail = async (
    email: string, 
    password: string, 
    name: string,
    avatar: string
  ): Promise<User> => {
    try {
      console.log('useAuth: Tentando registro...');
      const userData = await firebaseRegister(email, password, name, avatar);
      login(userData);
      return userData;
    } catch (error) {
      console.error('useAuth: Erro no registro:', error);
      throw error;
    }
  };

  const handleLoginWithGoogle = async (): Promise<User> => {
    try {
      console.log('useAuth: Tentando login com Google...');
      const userData = await firebaseGoogleLogin();
      login(userData);
      return userData;
    } catch (error) {
      console.error('useAuth: Erro no login Google:', error);
      throw error;
    }
  };

  return {
    user,
    credits,
    isLoading,
    login,
    logout,
    updateCredits,
    addCredits,
    deductCredits,
    addInitialCredits,
    isLoggedIn: !!user,
    isGuest: !!user?.isGuest,
    isAdmin: user?.role === 'admin', // ⭐ ADICIONE ESTA LINHA
    // Funções Firebase
    loginWithEmail: handleLoginWithEmail,
    registerWithEmail: handleRegisterWithEmail,
    loginWithGoogle: handleLoginWithGoogle,
  };
};