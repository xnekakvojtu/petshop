import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Payment from './pages/Payment';
import BookingsPage from './pages/BookingsPage';
import CartModal from './components/CartModal';
import WishlistModal from './components/WishlistModal';
import BookingModal from './components/BookingModal';
import LoginAlert from './components/LoginAlert';
import Notification from './components/Notification';
import { getCart } from './utils/storage';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminBookings from './pages/AdminBookings';
import AdminServices from './pages/AdminServices';
import AdminClients from './pages/AdminClients';
import AdminSchedule from './pages/AdminSchedule';
import './App.css';

type NotificationState = {
  message: string;
  type: 'success' | 'error';
} | null;

const AppContent: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const [cartCount, setCartCount] = useState(0);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingService, setBookingService] = useState('');
  const [notification, setNotification] = useState<NotificationState>(null);

  const isAdminPage = location.pathname.startsWith('/admin');
  const hideHeaderFooter = ['/login', '/payment', '/agendamentos'].some(path =>
    location.pathname.startsWith(path)
  ) || isAdminPage;

  const updateCounts = () => {
    const cart = getCart();
    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    setCartCount(totalItems);
  };

  useEffect(() => {
    updateCounts();

    const handleStorageUpdate = () => updateCounts();

    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string; type: 'success' | 'error' }>;
      setNotification(customEvent.detail);
      setTimeout(() => setNotification(null), 3000);
    };

    const handleOpenWishlistModal = () => setIsWishlistModalOpen(true);

    const handleOpenBookingModal = (event: Event) => {
      const customEvent = event as CustomEvent<{ serviceType?: string }>;
      setBookingService(customEvent.detail.serviceType || 'banho');
      setIsBookingModalOpen(true);
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('notification', handleNotification);
    window.addEventListener('openWishlistModal', handleOpenWishlistModal);
    window.addEventListener('openBookingModal', handleOpenBookingModal);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('notification', handleNotification);
      window.removeEventListener('openWishlistModal', handleOpenWishlistModal);
      window.removeEventListener('openBookingModal', handleOpenBookingModal);
    };
  }, []);

  const handleServiceClick = (serviceType: string) => {
    setBookingService(serviceType);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="App">
      {!hideHeaderFooter && (
        <Header
          cartCount={cartCount}
          onCartClick={() => setIsCartModalOpen(true)}
          user={user}
        />
      )}

      <main className={hideHeaderFooter ? 'full-page' : ''}>
        <Routes>
          <Route path="/" element={<Home onServiceClick={handleServiceClick} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/payment" element={<Payment />} />
          <Route
            path="/agendamentos"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute requireAdmin>
                <AdminBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute requireAdmin>
                <AdminServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute requireAdmin>
                <AdminClients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/schedule"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSchedule />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!hideHeaderFooter && <Footer />}

      {!isAdminPage && (
        <>
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
            onBookingComplete={() => {
              setNotification({ message: 'Serviço agendado com sucesso!', type: 'success' });
              setTimeout(() => setNotification(null), 3000);
            }}
          />
          <LoginAlert />
        </>
      )}

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

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;