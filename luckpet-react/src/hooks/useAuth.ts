// src/hooks/useAuth.ts - VERSÃO CORRIGIDA (CONSOME O CONTEXTO)
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User } from '../types';
import { 
  loginWithEmail as firebaseLogin,
  registerWithEmail as firebaseRegister,
  loginWithGoogle as firebaseGoogleLogin,
  logout as firebaseLogout
} from '../firebase/auth';

// Hook personalizado que consome o AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  
  const { 
    user, 
    credits, 
    login: contextLogin, 
    logout: contextLogout,
    updateCredits, 
    addCredits, 
    deductCredits, 
    isLoggedIn, 
    isGuest, 
    isAdmin,
    isLoading 
  } = context;

  // Função para adicionar créditos iniciais (wapper)
  const addInitialCredits = () => {
    addCredits(200);
  };

  // Funções Firebase que usam o contexto
  const handleLoginWithEmail = async (email: string, password: string): Promise<User> => {
    try {
      console.log('useAuth: Tentando login com email...');
      const userData = await firebaseLogin(email, password);
      contextLogin(userData);
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
    avatar?: string
  ): Promise<User> => {
    try {
      console.log('useAuth: Tentando registro...');
      const userData = await firebaseRegister(
        email, 
        password, 
        name, 
        avatar ?? 'cachorro'
      );
      contextLogin(userData);
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
      contextLogin(userData);
      return userData;
    } catch (error) {
      console.error('useAuth: Erro no login Google:', error);
      throw error;
    }
  };

  // ⭐ Versão melhorada do logout que usa o contexto e faz limpeza adicional
  const handleLogout = async () => {
    try {
      console.log('Iniciando logout...');
      
      // 1. Logout do Firebase primeiro
      try {
        await firebaseLogout();
        console.log('✅ Logout do Firebase realizado');
      } catch (firebaseError) {
        console.log('⚠️  Erro no logout do Firebase, continuando com logout local...');
      }
      
      // 2. Limpar dados específicos do Firebase/Google (além do que o contexto já limpa)
      const firebaseKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('firebase') || 
        key.includes('google') ||
        key.startsWith('CognitoIdentityServiceProvider')
      );
      
      firebaseKeys.forEach(key => {
        console.log('Removendo chave Firebase:', key);
        localStorage.removeItem(key);
      });
      
      // 3. Limpar sessionStorage
      sessionStorage.clear();
      
      // 4. Limpar cookies relacionados a autenticação
      document.cookie.split(';').forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim();
        if (cookieName.includes('auth') || cookieName.includes('session')) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
      
      // 5. Usar o logout do contexto (limpa user, credits e localStorage básico)
      contextLogout();
      
      // 6. Disparar eventos personalizados
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      
      console.log('✅ Logout realizado com sucesso');
      
      // 7. Redirecionar para home
      setTimeout(() => {
        if (window.location.pathname !== '/') {
          // Verifica se está usando HashRouter
          const isHashRouter = window.location.hash !== '';
          if (isHashRouter) {
            window.location.hash = '#/';
          } else {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
        }
      }, 100);
      
      return true;
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      
      // Fallback: força logout completo
      localStorage.clear();
      sessionStorage.clear();
      contextLogout(); // Tenta novamente
      window.location.href = '/';
      
      return false;
    }
  };

  // Retorna tudo que o hook original tinha, mas agora vindo do contexto
  return {
    // Dados do contexto
    user,
    credits,
    isLoading,
    isLoggedIn,
    isGuest,
    isAdmin,
    
    // Funções do contexto (renomeadas para manter compatibilidade)
    login: contextLogin,
    logout: handleLogout, // Versão melhorada
    updateCredits,
    addCredits,
    deductCredits,
    
    // Funções adicionais
    addInitialCredits,
    
    // Funções Firebase
    loginWithEmail: handleLoginWithEmail,
    registerWithEmail: handleRegisterWithEmail,
    loginWithGoogle: handleLoginWithGoogle,
  };
};