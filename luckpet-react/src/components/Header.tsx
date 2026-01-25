// src/components/Header.tsx - VERSÃO MAIS RESPONSIVA
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
    if (isAdmin) {
      alert('Administradores não podem acessar agendamentos de clientes. Use o Painel Admin para gerenciar todos os agendamentos.');
      return;
    }
    
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
      'admin': '/img/avatares/cachorro.jpg'
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
    const avatarClass = isAdmin ? 'admin-avatar' : 'user-avatar';
    
    return (
      <div className="user-avatar-container">
        <div className="avatar-wrapper">
          <img 
            src={getAvatarImage(user?.avatar || 'cachorro')} 
            alt={user?.name || 'Usuário'}
            className={avatarClass}
            onError={(e) => {
              e.currentTarget.src = '/img/avatares/cachorro.jpg';
            }}
          />
        </div>
        {/* ⭐⭐ COROA FORA DA FOTO - AGORA VISÍVEL */}
        {isAdmin && (
          <div className="admin-badge-small">
            <i className="fas fa-crown"></i>
          </div>
        )}
        {wishlistCount > 0 && !isAdmin && (
          <span className="wishlist-indicator">{wishlistCount}</span>
        )}
      </div>
    );
  };

  return (
    <>
      {!isInAdminArea && (
        <div className="promo-bar">
          <p>
            <strong>🚚 Entrega em até 1 hora</strong> 
          </p>
        </div>
      )}

      <header className="header">
        <div className="header-container">
          
          <div className="header-left">
            <Link to={isInAdminArea ? "/admin" : "/"} className="logo">
              <i className="fas fa-paw"></i>
              <span className="logo-text">{isInAdminArea ? 'LuckPet Admin' : 'LuckPet'}</span>
              {isInAdminArea && (
                <span className="admin-badge-header">
                  <i className="fas fa-crown"></i> Admin
                </span>
              )}
            </Link>
          </div>

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

          <div className="header-actions">
            
            {isMobile && !showSearchMobile && !isInAdminArea && (
              <button 
                className="action-btn search-toggle"
                onClick={() => setShowSearchMobile(true)}
                aria-label="Buscar"
              >
                <i className="fas fa-search"></i>
              </button>
            )}

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

                  {showUserMenu && isMobile && (
                    <div 
                      className="dropdown-overlay"
                      onClick={() => setShowUserMenu(false)}
                    />
                  )}

                  {showUserMenu && (
                    <div className={`dropdown-menu ${isMobile ? 'mobile-dropdown' : ''}`}>
                      <div className={`dropdown-header ${isAdmin ? 'admin-header' : ''}`}>
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
                          </div>
                          {/* ⭐⭐ COROA FORA DA FOTO NO DROPDOWN TAMBÉM */}
                          {isAdmin && (
                            <div className="admin-badge-dropdown">
                              <i className="fas fa-crown"></i>
                            </div>
                          )}
                        </div>
                        <div className="dropdown-user-info">
                          <h3 className={`dropdown-name ${isAdmin ? 'admin-name' : ''}`}>
                            {user.name}
                          </h3>
                          <div className="dropdown-level">
                            <span className={`level-badge ${isAdmin ? 'admin-level' : ''}`}>
                              {isAdmin ? 'Administrador' : (user.isGuest ? 'Convidado' : 'Cliente')}
                            </span>
                          </div>
                          <div className={`dropdown-credits ${isAdmin ? 'admin-credits' : ''}`}>
                            <i className="fas fa-coins"></i>
                            <span>{getUserCredits()} LuckCoins</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="dropdown-divider"></div>
                      
                      <div className="dropdown-items">
                        {isAdmin && !isInAdminArea && (
                          <button 
                            className="dropdown-item admin-item"
                            onClick={handleAdminPanel}
                          >
                            <i className="fas fa-crown"></i> 
                            <span>Painel Admin</span>
                          </button>
                        )}

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

                        <div className="dropdown-item disabled" title="Em breve">
                          <i className="fas fa-user"></i> 
                          <span>Meu Perfil</span>
                        </div>
                        
                        <button 
                          className={`dropdown-item ${isAdmin ? 'disabled' : ''}`}
                          onClick={handleMyBookings}
                          title={isAdmin ? 'Administradores não podem acessar agendamentos' : undefined}
                        >
                          <i className="fas fa-calendar-alt"></i> 
                          <span>Meus Agendamentos</span>
                          {isAdmin && (
                            <span className="dropdown-item-lock">
                              <i className="fas fa-lock"></i>
                            </span>
                          )}
                        </button>
                        
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

                        {!isAdmin && (
                          <div className="dropdown-item disabled" title="Em breve">
                            <i className="fas fa-box"></i> 
                            <span>Meus Pedidos</span>
                          </div>
                        )}

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
          font-size: 0.8rem;
          font-weight: 500;
          position: relative;
          overflow: hidden;
        }

        .promo-bar::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: shimmer 3s infinite;
        }

        .promo-bar p {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin: 0;
          letter-spacing: 0.3px;
        }

        .promo-bar strong {
          font-weight: 600;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        /* Header Admin */
        .admin-badge-header {
          margin-left: 8px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #92400e;
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        /* Avatar Container - POSICIONAMENTO CORRIGIDO */
        .user-avatar-container {
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          z-index: 1;
        }

        /* Avatar Admin - BORDA DOURADA */
        .admin-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: 2px solid #fbbf24 !important;
          border-radius: 50% !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 3px 10px rgba(251, 191, 36, 0.3);
        }

        .user-btn:hover .admin-avatar {
          border-color: #f59e0b !important;
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
        }

        /* Avatar normal */
        .user-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: 2px solid #E5E7EB !important;
          border-radius: 50% !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .user-btn:hover .user-avatar {
          border-color: #8B5CF6 !important;
          transform: scale(1.05);
          box-shadow: 0 3px 10px rgba(139, 92, 246, 0.3);
        }

        /* ⭐⭐ COROA FORA DA FOTO - VISÍVEL! */
        .admin-badge-small {
          position: absolute;
          top: -2px;
          right: -2px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #92400e;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          border: 1.5px solid white;
          z-index: 10;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }

        /* Avatar Dropdown */
        .dropdown-avatar-container {
          position: relative;
          width: 60px;
          height: 60px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-dropdown-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          z-index: 1;
        }

        .dropdown-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: 3px solid white;
          border-radius: 50% !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }

        .admin-dropdown-avatar {
          border: 3px solid #fbbf24 !important;
          box-shadow: 0 6px 20px rgba(251, 191, 36, 0.25);
        }

        /* ⭐⭐ COROA DO DROPDOWN FORA DA FOTO */
        .admin-badge-dropdown {
          position: absolute;
          top: -4px;
          right: -4px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #92400e;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          border: 2px solid white;
          z-index: 10;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
        }

        .admin-icon {
          margin-left: 4px;
          color: #fbbf24;
          font-size: 12px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        /* MODAL ADMIN COM CORES DOURADAS */
        .admin-header {
          background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%) !important;
          border-bottom: 2px solid #fbbf24 !important;
        }

        .admin-name {
          color: #92400e !important;
          text-shadow: 0 1px 2px rgba(146, 64, 14, 0.1);
        }

        /* Menu Dropdown Admin */
        .admin-level {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%) !important;
          color: #92400e !important;
          box-shadow: 0 3px 8px rgba(251, 191, 36, 0.3);
        }

        .admin-credits {
          background: white !important;
          border: 1px solid #fbbf24 !important;
          color: #92400e !important;
        }

        .admin-credits i {
          color: #fbbf24 !important;
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
          top: -3px;
          right: -3px;
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          color: white;
          font-size: 9px;
          font-weight: 700;
          min-width: 15px;
          height: 15px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid white;
          z-index: 2;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }

        /* Quando tiver coroa E wishlist (não deveria acontecer, mas vamos garantir) */
        .admin-badge-small + .wishlist-indicator {
          display: none;
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

        /* Ícone de cadeado para itens bloqueados */
        .dropdown-item-lock {
          position: absolute;
          right: 1rem;
          color: #9CA3AF;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Tooltip para itens bloqueados */
        .dropdown-item[title] {
          position: relative;
        }

        .dropdown-item[title]:hover::after {
          content: attr(title);
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          background: #374151;
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          white-space: nowrap;
          margin-left: 10px;
          z-index: 1000;
          pointer-events: none;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
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
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .header-left {
          flex-shrink: 0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: #1F2937;
          font-weight: 800;
          font-size: 1.4rem;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .logo-text {
          font-size: inherit;
        }

        .logo:hover {
          color: #8B5CF6;
          transform: scale(1.02);
        }

        .logo i {
          color: #8B5CF6;
          font-size: 1.6rem;
        }

        .header-search {
          flex: 1;
          max-width: 600px;
          position: relative;
        }

        .close-search {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6B7280;
          cursor: pointer;
          padding: 0.4rem;
          z-index: 10;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .action-btn {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem;
          color: #4B5563;
          cursor: pointer;
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .action-btn:hover {
          background: #F3F4F6;
          color: #8B5CF6;
          transform: translateY(-1px);
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
          font-size: 1.3rem;
          color: #4B5563;
          transition: color 0.3s;
        }

        .cart-btn:hover i {
          color: #8B5CF6;
        }

        .cart-btn .badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid white;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }

        .btn-text {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }

        .user-dropdown-container {
          position: relative;
        }

        .user-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          padding: 0.4rem 0.5rem;
          cursor: pointer;
          border-radius: 50px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .user-btn:hover {
          background: #F3F4F6;
          transform: translateY(-1px);
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1F2937;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dropdown-arrow {
          font-size: 0.75rem;
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
          top: calc(100% + 0.5rem);
          background: white;
          border-radius: 14px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
          min-width: 280px;
          z-index: 100;
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          border: 1px solid #E5E7EB;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .dropdown-header {
          padding: 1.25rem;
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .dropdown-user-info {
          flex: 1;
          min-width: 0;
        }

        .dropdown-name {
          font-size: 1rem;
          font-weight: 700;
          color: #1F2937;
          margin-bottom: 0.4rem;
          line-height: 1.2;
          word-break: break-word;
        }

        .level-badge {
          display: inline-block;
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.3rem 0.8rem;
          border-radius: 15px;
          box-shadow: 0 3px 8px rgba(139, 92, 246, 0.25);
        }

        .dropdown-credits {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #8B5CF6;
          font-weight: 700;
          font-size: 0.85rem;
          margin-top: 0.5rem;
          background: white;
          padding: 0.4rem 0.6rem;
          border-radius: 10px;
          box-shadow: 0 1px 4px rgba(139, 92, 246, 0.1);
        }

        .dropdown-credits i {
          color: #fbbf24;
        }

        .dropdown-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #E5E7EB, transparent);
          margin: 0.4rem 0;
        }

        .dropdown-items {
          padding: 0.6rem;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.7rem 0.8rem;
          background: none;
          border: none;
          color: #4B5563;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .dropdown-item:hover {
          background: #F3F4F6;
          color: #8B5CF6;
          transform: translateX(4px);
        }

        .dropdown-item i {
          width: 18px;
          text-align: center;
          color: #9CA3AF;
          font-size: 0.9rem;
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
          transform: translateX(4px);
        }

        .dropdown-item.wishlist-item i {
          color: #EF4444;
        }

        .dropdown-badge {
          position: absolute;
          right: 0.8rem;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 4px rgba(16, 185, 129, 0.3);
        }

        .dropdown-item.logout {
          color: #EF4444;
        }

        .dropdown-item.logout:hover {
          background: #FEE2E2;
          color: #DC2626;
          transform: translateX(4px);
        }

        .dropdown-item.logout i {
          color: #EF4444;
        }

        .search-toggle {
          display: none;
        }

        @media (max-width: 768px) {
          .header-container {
            padding: 0.5rem 0.75rem;
            gap: 0.5rem;
          }

          .header-left {
            order: 1;
          }

          .header-actions {
            order: 2;
            gap: 0.4rem;
          }

          .header-search {
            order: 3;
            width: 100%;
            max-width: 100%;
            margin-top: 0.5rem;
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
            font-size: 1.2rem;
          }

          .cart-btn .badge {
            top: -5px;
            right: -5px;
            font-size: 0.65rem;
            min-width: 16px;
            height: 16px;
          }

          .dropdown-menu.mobile-dropdown {
            position: fixed;
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            max-width: 100%;
            border-radius: 16px 16px 0 0;
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
            width: 32px;
            height: 32px;
          }

          /* ⭐ AJUSTE DA COROA NO MOBILE */
          .admin-badge-small {
            width: 14px;
            height: 14px;
            font-size: 7px;
            top: -1px;
            right: -1px;
            border-width: 1px;
          }

          .dropdown-item[title]:hover::after {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .header-container {
            padding: 0.4rem 0.5rem;
            gap: 0.4rem;
          }

          .promo-bar {
            font-size: 0.7rem;
            padding: 0.3rem;
          }

          .promo-bar p {
            gap: 0.3rem;
          }

          .logo {
            font-size: 1.1rem;
            gap: 0.4rem;
          }

          .logo i {
            font-size: 1.3rem;
          }

          .logo-text {
            font-size: 1.1rem;
          }

          .cart-btn {
            padding: 0.4rem;
          }

          .user-avatar-container {
            width: 30px;
            height: 30px;
          }

          .action-btn {
            padding: 0.4rem;
          }

          .header-actions {
            gap: 0.3rem;
          }

          /* ⭐ AJUSTE DA COROA NO MOBILE PEQUENO */
          .admin-badge-small {
            width: 12px;
            height: 12px;
            font-size: 6px;
            top: 0px;
            right: 0px;
          }

          .wishlist-indicator {
            top: -2px;
            right: -2px;
            font-size: 8px;
            min-width: 13px;
            height: 13px;
          }

          /* Ajuste do dropdown para telas muito pequenas */
          .dropdown-header {
            padding: 1rem;
            gap: 0.8rem;
          }

          .dropdown-avatar-container {
            width: 50px;
            height: 50px;
          }

          .admin-badge-dropdown {
            width: 18px;
            height: 18px;
            font-size: 8px;
            border-width: 1.5px;
          }

          .dropdown-name {
            font-size: 0.9rem;
          }

          .level-badge {
            font-size: 0.65rem;
            padding: 0.25rem 0.6rem;
          }

          .dropdown-credits {
            font-size: 0.8rem;
            padding: 0.3rem 0.5rem;
          }

          .dropdown-item {
            padding: 0.6rem 0.7rem;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 360px) {
          .logo {
            font-size: 1rem;
          }

          .logo-text {
            font-size: 1rem;
          }

          .logo i {
            font-size: 1.2rem;
          }

          .user-avatar-container {
            width: 28px;
            height: 28px;
          }

          .admin-badge-small {
            width: 11px;
            height: 11px;
            font-size: 5px;
          }

          .cart-btn i {
            font-size: 1.1rem;
          }

          .cart-btn .badge {
            min-width: 14px;
            height: 14px;
            font-size: 0.6rem;
          }

          .dropdown-header {
            flex-direction: column;
            text-align: center;
            gap: 0.6rem;
          }

          .dropdown-user-info {
            text-align: center;
          }

          .dropdown-credits {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default Header;