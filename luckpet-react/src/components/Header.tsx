// src/components/Header.tsx - VERSÃO CLEAN
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const { user: authUser, logout: authLogout, isLoggedIn } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const user = propUser || authUser;

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

  const getAvatarImage = (avatarName: string) => {
    const avatars: Record<string, string> = {
      'cachorro': '/img/avatares/cachorro.jpg',
      'gato': '/img/avatares/gato.jpg',
      'coelho': '/img/avatares/coelho.jpg',
      'passaro': '/img/avatares/passaro.jpg'
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

  const isUserLoggedIn = isLoggedIn;

  return (
    <>
      {/* Promo Bar Clean */}
      <div className="promo-bar">
        <p>🚚 Entrega em até 1 hora</p>
      </div>

      <header className="header">
        <div className="header-container">
          
          {/* Logo */}
          <div className="header-left">
            <Link to="/" className="logo">
              <i className="fas fa-paw"></i>
              <span>LuckPet</span>
            </Link>
          </div>

          {/* Search */}
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

          {/* Actions */}
          <div className="header-actions">
            
            {isMobile && !showSearchMobile && (
              <button 
                className="action-btn search-toggle"
                onClick={() => setShowSearchMobile(true)}
                aria-label="Buscar"
              >
                <i className="fas fa-search"></i>
              </button>
            )}

            {/* Carrinho */}
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

            {/* Usuário */}
            <div className="user-dropdown-container" ref={userMenuRef}>
              {isUserLoggedIn && user ? (
                <>
                  <button 
                    className="user-btn"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-label="Menu do usuário"
                    aria-expanded={showUserMenu}
                  >
                    <div className="user-avatar-container">
                      <img 
                        src={getAvatarImage(user.avatar)} 
                        alt={user.name}
                        className="user-avatar"
                        onError={(e) => {
                          e.currentTarget.src = '/img/avatares/cachorro.jpg';
                        }}
                      />
                      {wishlistCount > 0 && (
                        <span className="wishlist-indicator">{wishlistCount}</span>
                      )}
                    </div>
                    {!isMobile && (
                      <span className="user-name">{user.name.split(' ')[0]}</span>
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
                      <div className="dropdown-header">
                        <div className="dropdown-avatar-container">
                          <img 
                            src={getAvatarImage(user.avatar)} 
                            alt={user.name}
                            className="dropdown-avatar"
                          />
                          {wishlistCount > 0 && (
                            <span className="dropdown-wishlist-count">{wishlistCount}</span>
                          )}
                        </div>
                        <div className="dropdown-user-info">
                          <h3 className="dropdown-name">{user.name}</h3>
                          <div className="dropdown-credits">
                            <i className="fas fa-coins"></i>
                            <span>{getUserCredits()} LuckCoins</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="dropdown-divider"></div>
                      
                      <div className="dropdown-items">
                        <Link 
                          to="/perfil" 
                          className="dropdown-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <i className="fas fa-user"></i> 
                          <span>Meu Perfil</span>
                        </Link>
                        
                        <button 
                          className="dropdown-item"
                          onClick={handleMyBookings}
                        >
                          <i className="fas fa-calendar-alt"></i> 
                          <span>Meus Agendamentos</span>
                        </button>
                        
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
                        
                        <Link 
                          to="/pedidos" 
                          className="dropdown-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <i className="fas fa-box"></i> 
                          <span>Meus Pedidos</span>
                        </Link>
                        
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
        /* Promo Bar Clean */
        .promo-bar {
          background: #7C3AED;
          color: white;
          padding: 8px 0;
          text-align: center;
          font-size: 14px;
          font-weight: 500;
        }

        /* Header */
        .header {
          background: white;
          border-bottom: 1px solid #F0F0F0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        /* Logo */
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #1A1A1A;
          font-weight: 700;
          font-size: 20px;
        }

        .logo i {
          color: #7C3AED;
        }

        /* Search */
        .header-search {
          flex: 1;
          max-width: 500px;
          position: relative;
        }

        .close-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 6px;
        }

        /* Actions */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-btn {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          color: #666;
          cursor: pointer;
          text-decoration: none;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .action-btn:hover {
          background: #F5F5F5;
        }

        /* Carrinho */
        .cart-btn {
          position: relative;
        }

        .cart-btn .btn-icon {
          position: relative;
        }

        .cart-btn i {
          font-size: 20px;
          color: #666;
        }

        .cart-btn .badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #EF4444;
          color: white;
          font-size: 12px;
          font-weight: 600;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-text {
          font-size: 14px;
        }

        /* User Dropdown */
        .user-dropdown-container {
          position: relative;
        }

        .user-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          border-radius: 20px;
        }

        .user-avatar-container {
          position: relative;
          width: 36px;
          height: 36px;
        }

        .user-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #F0F0F0;
        }

        .wishlist-indicator {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #EF4444;
          color: white;
          font-size: 11px;
          font-weight: 600;
          min-width: 16px;
          height: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-name {
          font-size: 14px;
          color: #333;
        }

        .dropdown-arrow {
          font-size: 12px;
          color: #666;
          transition: transform 0.2s;
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
          z-index: 99;
        }

        .dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          width: 280px;
          z-index: 100;
          overflow: hidden;
        }

        .dropdown-header {
          padding: 16px;
          background: #FAFAFA;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dropdown-avatar-container {
          position: relative;
          width: 48px;
          height: 48px;
        }

        .dropdown-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid white;
        }

        .dropdown-wishlist-count {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #EF4444;
          color: white;
          font-size: 12px;
          font-weight: 600;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropdown-user-info {
          flex: 1;
        }

        .dropdown-name {
          font-size: 16px;
          font-weight: 600;
          color: #1A1A1A;
          margin-bottom: 4px;
        }

        .dropdown-credits {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #7C3AED;
          font-size: 14px;
          font-weight: 500;
        }

        .dropdown-divider {
          height: 1px;
          background: #F0F0F0;
          margin: 8px 0;
        }

        .dropdown-items {
          padding: 8px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px;
          background: none;
          border: none;
          color: #666;
          text-decoration: none;
          font-size: 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .dropdown-item:hover {
          background: #F5F5F5;
        }

        .dropdown-item i {
          width: 20px;
          text-align: center;
          color: #888;
        }

        .wishlist-item {
          color: #EF4444;
        }

        .wishlist-item i {
          color: #EF4444;
        }

        .dropdown-badge {
          position: absolute;
          right: 12px;
          background: #EF4444;
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .logout {
          color: #EF4444;
        }

        .logout i {
          color: #EF4444;
        }

        /* Mobile */
        .search-toggle {
          display: none;
        }

        @media (max-width: 768px) {
          .promo-bar {
            padding: 6px 0;
            font-size: 13px;
          }

          .header-container {
            padding: 12px 16px;
            flex-wrap: wrap;
          }

          .header-left {
            order: 1;
          }

          .header-actions {
            order: 2;
          }

          .header-search {
            order: 3;
            width: 100%;
            max-width: 100%;
            margin-top: 12px;
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
            font-size: 22px;
          }

          .dropdown-menu.mobile-dropdown {
            position: fixed;
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            border-radius: 12px 12px 0 0;
          }
        }

        @media (max-width: 480px) {
          .header-container {
            padding: 10px 12px;
            gap: 12px;
          }

          .logo {
            font-size: 18px;
          }

          .cart-btn {
            padding: 6px;
          }
        }
      `}</style>
    </>
  );
};

export default Header;