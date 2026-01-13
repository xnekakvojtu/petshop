// src/App.tsx (VERSÃO COMPLETA COM AGENDAMENTO)
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Payment from './pages/Payment';
import BookingsPage from './pages/BookingsPage';
import CartModal from './components/CartModal';
import WishlistModal from './components/WishlistModal';
import BookingModal from './components/BookingModal';
import BookingsHistory from './components/BookingsHistory';
import LoginAlert from './components/LoginAlert';
import Notification from './components/Notification';
import { getCart } from './utils/storage';
import { useAuth } from './hooks/useAuth';
import './App.css';
import './styles/components.css';

// Componente wrapper para condicionalmente mostrar Header/Footer
const AppContent: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingService, setBookingService] = useState('');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // NÃO mostrar Header e Footer nas seguintes páginas:
  const hideHeaderFooterPages = ['/login', '/payment', '/agendamentos'];
  const shouldShowHeaderFooter = !hideHeaderFooterPages.includes(location.pathname);

  const updateCounts = () => {
    const cart = getCart();
    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    setCartCount(totalItems);
  };

  // Otimização: Evitar múltiplos renders
  useEffect(() => {
    // Inicializar com loading
    setIsLoading(true);
    
    // Carregar dados iniciais
    updateCounts();
    
    // Configurar listeners
    const handleStorageUpdate = () => {
      updateCounts();
    };

    const handleNotification = (event: CustomEvent) => {
      setNotification(event.detail);
      setTimeout(() => setNotification(null), 3000);
    };

    const handleOpenWishlistModal = () => {
      setIsWishlistModalOpen(true);
    };

    // Listener para abrir modal de agendamento
    const handleOpenBookingModal = (event: CustomEvent) => {
      setBookingService(event.detail.serviceType || 'banho');
      setIsBookingModalOpen(true);
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('notification', handleNotification as EventListener);
    window.addEventListener('openWishlistModal', handleOpenWishlistModal);
    window.addEventListener('openBookingModal', handleOpenBookingModal as EventListener);

    // Simular tempo de carregamento
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('notification', handleNotification as EventListener);
      window.removeEventListener('openWishlistModal', handleOpenWishlistModal);
      window.removeEventListener('openBookingModal', handleOpenBookingModal as EventListener);
      clearTimeout(timer);
    };
  }, []);

  // Prevenir zoom em mobile
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchstart', preventZoom, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', preventZoom);
    };
  }, []);

  const handleServiceClick = (serviceType: string) => {
    setBookingService(serviceType);
    setIsBookingModalOpen(true);
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBookingComplete = (bookingData: any) => {
    showNotification('Serviço agendado com sucesso!');
    // Aqui você pode adicionar lógica adicional após o agendamento
    console.log('Agendamento concluído:', bookingData);
  };

  // Tela de carregamento inicial
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-content">
          <div className="loading-logo">
            <i className="fas fa-paw"></i>
            <span>LuckPet</span>
          </div>
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando...</p>
        </div>
        <style >{`
          .app-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
          }
          .loading-content {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
          }
          .loading-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 32px;
            font-weight: 700;
          }
          .loading-logo i {
            font-size: 40px;
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s linear infinite;
          }
          .loading-text {
            font-size: 16px;
            opacity: 0.8;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            .loading-spinner {
              animation: none;
              border: 3px solid white;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Mostrar Header apenas se NÃO for login */}
      {shouldShowHeaderFooter && (
        <Header
          cartCount={cartCount}
          onCartClick={() => setIsCartModalOpen(true)}
          user={user}
        />
      )}
      
      <main className={!shouldShowHeaderFooter ? 'full-page' : ''}>
        <Routes>
          <Route path="/" element={<Home onServiceClick={handleServiceClick} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/agendamentos" element={
            user ? <BookingsPage /> : <Navigate to="/login" replace />
          } />
          {/* Rota de fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Mostrar Footer apenas se NÃO for login */}
      {shouldShowHeaderFooter && <Footer />}
      
      {/* Modais e Alertas - sempre disponíveis */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        onUpdate={updateCounts}
      />
      
      <WishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        onUpdate={updateCounts}
      />
      
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        serviceType={bookingService}
        onBookingComplete={handleBookingComplete}
      />
      
      <LoginAlert />
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

// Componente principal App com otimizações
const App: React.FC = () => {
  // Otimização: Prevenir re-renders desnecessários
  const MemoizedAppContent = React.memo(AppContent);

  return (
    <Router>
      <MemoizedAppContent />
    </Router>
  );
};

export default App;