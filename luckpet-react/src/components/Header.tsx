// src/components/Header.tsx - AVATAR CORRIGIDO E BONITO
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';
import { getWishlist } from '../utils/storage';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  user?: User | null;
}

const Header: React.FC<HeaderProps> = ({ 
  cartCount, 
  onCartClick,
  user: propUser 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, logout: authLogout, isLoggedIn, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const user = propUser || authUser;
  const isInAdminArea = location.pathname.startsWith('/admin');

  useEffect(() => {
    const wishlist = getWishlist();
    setWishlistCount(wishlist.length);

    const handleStorageChange = () => {
      const updatedWishlist = getWishlist();
      setWishlistCount(updatedWishlist.length);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSearchMobile(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };

    const handleUserLoggedOut = () => {
      setShowUserMenu(false);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('resize', handleResize);
    window.addEventListener('userLoggedOut', handleUserLoggedOut);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('userLoggedOut', handleUserLoggedOut);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showUserMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showUserMenu]);

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      try {
        setShowUserMenu(false);
        await authLogout();
      } catch (error) {
        console.error('Erro no logout:', error);
        window.location.reload();
      }
    }
  };

  const handleMyBookings = () => {
    if (user) {
      navigate('/agendamentos');
    } else {
      navigate('/login');
    }
    setShowUserMenu(false);
  };

  const handleAdminPanel = () => {
    navigate('/admin');
    setShowUserMenu(false);
  };

  const getAvatarImage = (avatarName: string) => {
    const avatars: Record<string, string> = {
      'cachorro': '/img/avatares/cachorro.jpg',
      'gato': '/img/avatares/gato.jpg',
      'coelho': '/img/avatares/coelho.jpg',
      'passaro': '/img/avatares/passaro.jpg',
      'admin': '/img/avatares/cachorro.jpg' // Usa a mesma imagem
    };
    return avatars[avatarName] || avatars['cachorro'];
  };

  const navigateToWishlist = () => {
    setShowUserMenu(false);
    const event = new CustomEvent('openWishlistModal');
    window.dispatchEvent(event);
  };

  const getUserCredits = () => {
    if (user?.credits) return user.credits;
    const savedCredits = localStorage.getItem('userCredits');
    return savedCredits ? parseInt(savedCredits) : 0;
  };

  const renderUserAvatar = () => {
    // ⭐ MUDANÇA: Se for admin, usa classe diferente
    const avatarClass = isAdmin ? 'admin-avatar' : 'user-avatar';
    
    return (
      <div className="user-avatar-container">
        <div className="avatar-wrapper">
          <img 
            src={getAvatarImage(user?.avatar || 'cachorro')} 
            alt={user?.name || 'Usuário'}
            className={avatarClass} // ⭐ Usa classe condicional
            onError={(e) => {
              e.currentTarget.src = '/img/avatares/cachorro.jpg';
            }}
          />
          {isAdmin && (
            <div className="admin-badge-small">
              <i className="fas fa-crown"></i>
            </div>
          )}
          {wishlistCount > 0 && !isAdmin && (
            <span className="wishlist-indicator">{wishlistCount}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Promo Bar - não mostrar na área admin */}
      {!isInAdminArea && (
        <div className="promo-bar">
          <p>
            <strong>🚚 Entrega em até 1 hora</strong> 
          </p>
        </div>
      )}

      <header className="header">
        <div className="header-container">
          
          {/* Logo */}
          <div className="header-left">
            <Link to={isInAdminArea ? "/admin" : "/"} className="logo">
              <i className="fas fa-paw"></i>
              <span>{isInAdminArea ? 'LuckPet Admin' : 'LuckPet'}</span>
              {isInAdminArea && (
                <span className="admin-badge-header">
                  <i className="fas fa-crown"></i> Admin
                </span>
              )}
            </Link>
          </div>

          {/* Search - não mostrar na área admin */}
          {!isInAdminArea && (
            <div className={`header-search ${showSearchMobile ? 'mobile-active' : ''}`}>
              {(!isMobile || showSearchMobile) && (
                <>
                  <SearchBar onClose={() => setShowSearchMobile(false)} isMobile={isMobile} />
                  {isMobile && (
                    <button 
                      className="close-search"
                      onClick={() => setShowSearchMobile(false)}
                      aria-label="Fechar busca"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="header-actions">
            
            {/* Search Toggle no Mobile - apenas fora do admin */}
            {isMobile && !showSearchMobile && !isInAdminArea && (
              <button 
                className="action-btn search-toggle"
                onClick={() => setShowSearchMobile(true)}
                aria-label="Buscar"
              >
                <i className="fas fa-search"></i>
              </button>
            )}

            {/* Carrinho - não mostrar na área admin */}
            {!isInAdminArea && (
              <button 
                className="action-btn cart-btn" 
                onClick={onCartClick}
                aria-label={`Carrinho (${cartCount} itens)`}
              >
                <div className="btn-icon">
                  <i className="fas fa-shopping-cart"></i>
                  {cartCount > 0 && <span className="badge">{cartCount}</span>}
                </div>
                {!isMobile && <span className="btn-text">Carrinho</span>}
              </button>
            )}

            {/* Usuário */}
            <div className="user-dropdown-container" ref={userMenuRef}>
              {isLoggedIn && user ? (
                <>
                  <button 
                    className="user-btn"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-label="Menu do usuário"
                    aria-expanded={showUserMenu}
                  >
                    {renderUserAvatar()}
                    {!isMobile && (
                      <span className="user-name">
                        {user.name.split(' ')[0]}
                        {isAdmin && <i className="fas fa-crown admin-icon"></i>}
                      </span>
                    )}
                    <i className={`fas fa-chevron-down dropdown-arrow ${showUserMenu ? 'rotate' : ''}`}></i>
                  </button>

                  {/* Overlay para mobile */}
                  {showUserMenu && isMobile && (
                    <div 
                      className="dropdown-overlay"
                      onClick={() => setShowUserMenu(false)}
                    />
                  )}

                  {showUserMenu && (
                    <div className={`dropdown-menu ${isMobile ? 'mobile-dropdown' : ''}`}>
                      <div className="dropdown-header">
                        <div className="dropdown-avatar-container">
                          <div className="avatar-dropdown-wrapper">
                            <img 
                              src={getAvatarImage(user?.avatar || 'cachorro')} 
                              alt={user?.name || 'Usuário'}
                              className={isAdmin ? 'dropdown-avatar admin-dropdown-avatar' : 'dropdown-avatar'}
                              onError={(e) => {
                                e.currentTarget.src = '/img/avatares/cachorro.jpg';
                              }}
                            />
                            {isAdmin && (
                              <div className="admin-badge-dropdown">
                                <i className="fas fa-crown"></i>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="dropdown-user-info">
                          <h3 className="dropdown-name">{user.name}</h3>
                          <div className="dropdown-level">
                            <span className={`level-badge ${isAdmin ? 'admin-level' : ''}`}>
                              {isAdmin ? 'Administrador' : (user.isGuest ? 'Convidado' : 'Cliente')}
                            </span>
                          </div>
                          <div className="dropdown-credits">
                            <i className="fas fa-coins"></i>
                            <span>{getUserCredits()} LuckCoins</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="dropdown-divider"></div>
                      
                      <div className="dropdown-items">
                        {/* Link para Painel Admin se for admin */}
                        {isAdmin && !isInAdminArea && (
                          <button 
                            className="dropdown-item admin-item"
                            onClick={handleAdminPanel}
                          >
                            <i className="fas fa-crown"></i> 
                            <span>Painel Admin</span>
                          </button>
                        )}

                        {/* Link para voltar ao Site se estiver no admin */}
                        {isAdmin && isInAdminArea && (
                          <Link 
                            to="/" 
                            className="dropdown-item site-item"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <i className="fas fa-home"></i> 
                            <span>Voltar ao Site</span>
                          </Link>
                        )}

                        {/* Links inativos (sem página) */}
                        <div className="dropdown-item disabled" title="Em breve">
                          <i className="fas fa-user"></i> 
                          <span>Meu Perfil</span>
                        </div>
                        
                        <button 
                          className="dropdown-item"
                          onClick={handleMyBookings}
                        >
                          <i className="fas fa-calendar-alt"></i> 
                          <span>Meus Agendamentos</span>
                        </button>
                        
                        {/* Favoritos apenas para usuários normais */}
                        {!isAdmin && (
                          <button 
                            className="dropdown-item wishlist-item"
                            onClick={navigateToWishlist}
                          >
                            <i className="fas fa-heart"></i> 
                            <span>Meus Favoritos</span>
                            {wishlistCount > 0 && (
                              <span className="dropdown-badge">{wishlistCount}</span>
                            )}
                          </button>
                        )}

                        {/* Pedidos apenas para usuários normais */}
                        {!isAdmin && (
                          <div className="dropdown-item disabled" title="Em breve">
                            <i className="fas fa-box"></i> 
                            <span>Meus Pedidos</span>
                          </div>
                        )}

                        {/* Configurações */}
                        <div className="dropdown-item disabled" title="Em breve">
                          <i className="fas fa-cog"></i> 
                          <span>Configurações</span>
                        </div>
                        
                        <div className="dropdown-divider"></div>
                        
                        <button 
                          onClick={handleLogout} 
                          className="dropdown-item logout"
                        >
                          <i className="fas fa-sign-out-alt"></i> 
                          <span>Sair</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login" className="action-btn login-btn" aria-label="Entrar na conta">
                  <div className="btn-icon">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  {!isMobile && <span className="btn-text">Entrar</span>}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <style >{`
        /* Estilos para a promo bar */
        .promo-bar {
          background: linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          padding: 0.5rem 0;
          text-align: center;
          font-size: 0.875rem;
        }

        /* Header Admin */
        .admin-badge-header {
          margin-left: 10px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #92400e;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        /* Avatar Container - NOVO */
        .user-avatar-container {
          position: relative;
          width: 40px;
          height: 40px;
        }

        .avatar-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
        }

        /* Avatar Admin - BORDA AMARELA E BONITO */
        .admin-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: 3px solid #fbbf24 !important; /* ⭐ BORDA AMARELA */
          border-radius: 50% !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
        }

        .user-btn:hover .admin-avatar {
          border-color: #f59e0b !important; /* ⭐ COR MAIS ESCURA NO HOVER */
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
        }

        /* Avatar normal - BONITO */
        .user-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: 3px solid #E5E7EB !important;
          border-radius: 50% !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .user-btn:hover .user-avatar {
          border-color: #8B5CF6 !important;
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }

        /* Badges Admin */
        .admin-badge-small {
          position: absolute;
          bottom: -2px;
          right: -2px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #92400e;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          border: 2px solid white;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        /* Avatar Dropdown */
        .dropdown-avatar-container {
          position: relative;
          width: 70px;
          height: 70px;
          flex-shrink: 0;
        }

        .avatar-dropdown-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
        }

        .dropdown-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: 4px solid white;
          border-radius: 50% !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }

        .admin-dropdown-avatar {
          border: 4px solid #fbbf24 !important;
          box-shadow: 0 8px 25px rgba(251, 191, 36, 0.25);
        }

        .admin-badge-dropdown {
          position: absolute;
          bottom: -5px;
          right: -5px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #92400e;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          border: 3px solid white;
          z-index: 2;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }

        .admin-icon {
          margin-left: 5px;
          color: #fbbf24;
          font-size: 14px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Menu Dropdown Admin */
        .admin-level {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #92400e;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }

        .admin-item {
          color: #92400e !important;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
        }

        .admin-item:hover {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%) !important;
          color: #92400e !important;
          transform: translateX(5px);
        }

        .admin-item i {
          color: #f59e0b !important;
        }

        .site-item {
          color: #8b5cf6 !important;
          background: rgba(139, 92, 246, 0.1);
        }

        .site-item:hover {
          background: rgba(139, 92, 246, 0.2) !important;
          color: #7c3aed !important;
          transform: translateX(5px);
        }

        .site-item i {
          color: #8b5cf6 !important;
        }

        /* Wishlist Indicator */
        .wishlist-indicator {
          position: absolute;
          top: -4px;
          right: -4px;
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          color: white;
          font-size: 10px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        /* Itens desabilitados */
        .dropdown-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          position: relative;
        }

        .dropdown-item.disabled:hover {
          background: none !important;
          color: #4B5563 !important;
          transform: none;
        }

        .dropdown-item.disabled:hover i {
          color: #9CA3AF !important;
        }

        /* Estilos existentes mantidos */
        .header {
          background: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .header-left {
          flex-shrink: 0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: #1F2937;
          font-weight: 800;
          font-size: 1.6rem;
          transition: all 0.3s;
        }

        .logo:hover {
          color: #8B5CF6;
          transform: scale(1.02);
        }

        .logo i {
          color: #8B5CF6;
          font-size: 1.8rem;
        }

        .header-search {
          flex: 1;
          max-width: 600px;
          position: relative;
        }

        .close-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6B7280;
          cursor: pointer;
          padding: 0.5rem;
          z-index: 10;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        .action-btn {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          color: #4B5563;
          cursor: pointer;
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .action-btn:hover {
          background: #F3F4F6;
          color: #8B5CF6;
          transform: translateY(-2px);
        }

        .cart-btn {
          position: relative;
        }

        .cart-btn .btn-icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cart-btn i {
          font-size: 1.4rem;
          color: #4B5563;
          transition: color 0.3s;
        }

        .cart-btn:hover i {
          color: #8B5CF6;
        }

        .cart-btn .badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .btn-text {
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
        }

        .user-dropdown-container {
          position: relative;
        }

        .user-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: none;
          border: none;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          border-radius: 50px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .user-btn:hover {
          background: #F3F4F6;
          transform: translateY(-2px);
        }

        .user-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1F2937;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dropdown-arrow {
          font-size: 0.85rem;
          color: #6B7280;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dropdown-arrow.rotate {
          transform: rotate(180deg);
        }

        .dropdown-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 99;
        }

        .dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 0.75rem);
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          min-width: 320px;
          z-index: 100;
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          border: 1px solid #E5E7EB;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-15px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .dropdown-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .dropdown-user-info {
          flex: 1;
          min-width: 0;
        }

        .dropdown-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1F2937;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }

        .level-badge {
          display: inline-block;
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.35rem 1rem;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
        }

        .dropdown-credits {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #8B5CF6;
          font-weight: 700;
          font-size: 0.95rem;
          margin-top: 0.75rem;
          background: white;
          padding: 0.5rem 0.75rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
        }

        .dropdown-credits i {
          color: #fbbf24;
        }

        .dropdown-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #E5E7EB, transparent);
          margin: 0.5rem 0;
        }

        .dropdown-items {
          padding: 0.75rem;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.85rem 1rem;
          background: none;
          border: none;
          color: #4B5563;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .dropdown-item:hover {
          background: #F3F4F6;
          color: #8B5CF6;
          transform: translateX(5px);
        }

        .dropdown-item i {
          width: 20px;
          text-align: center;
          color: #9CA3AF;
          font-size: 1rem;
          transition: color 0.3s;
        }

        .dropdown-item:hover i {
          color: #8B5CF6;
        }

        .dropdown-item.wishlist-item {
          color: #EF4444;
        }

        .dropdown-item.wishlist-item:hover {
          background: #FEE2E2;
          color: #DC2626;
          transform: translateX(5px);
        }

        .dropdown-item.wishlist-item i {
          color: #EF4444;
        }

        .dropdown-badge {
          position: absolute;
          right: 1rem;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .dropdown-item.logout {
          color: #EF4444;
        }

        .dropdown-item.logout:hover {
          background: #FEE2E2;
          color: #DC2626;
          transform: translateX(5px);
        }

        .dropdown-item.logout i {
          color: #EF4444;
        }

        .search-toggle {
          display: none;
        }

        @media (max-width: 768px) {
          .header-container {
            padding: 0.75rem 1rem;
            flex-wrap: wrap;
          }

          .header-left {
            order: 1;
          }

          .header-actions {
            order: 2;
            gap: 0.5rem;
          }

          .header-search {
            order: 3;
            width: 100%;
            max-width: 100%;
            margin-top: 0.75rem;
            display: none;
          }

          .header-search.mobile-active {
            display: block;
          }

          .search-toggle {
            display: flex;
          }

          .btn-text {
            display: none;
          }

          .user-name {
            display: none;
          }

          .cart-btn i {
            font-size: 1.4rem;
          }

          .cart-btn .badge {
            top: -6px;
            right: -6px;
            font-size: 0.7rem;
            min-width: 18px;
            height: 18px;
          }

          .dropdown-menu.mobile-dropdown {
            position: fixed;
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            max-width: 100%;
            border-radius: 20px 20px 0 0;
            animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }

          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }

          .dropdown-menu {
            min-width: auto;
            width: 100%;
          }

          .admin-badge-header {
            display: none;
          }

          .user-avatar-container {
            width: 36px;
            height: 36px;
          }

          .admin-badge-small {
            width: 18px;
            height: 18px;
            font-size: 9px;
          }
        }

        @media (max-width: 480px) {
          .header-container {
            padding: 0.5rem;
            gap: 0.5rem;
          }

          .promo-bar {
            font-size: 0.75rem;
            padding: 0.4rem;
          }

          .logo {
            font-size: 1.3rem;
          }

          .logo i {
            font-size: 1.5rem;
          }

          .cart-btn {
            padding: 0.5rem;
          }

          .user-avatar-container {
            width: 34px;
            height: 34px;
          }
        }
      `}</style>
    </>
  );
};

export default Header;