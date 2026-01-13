// src/components/Header.tsx - VERSÃO COM LOGOUT FUNCIONANDO
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
  const { user: authUser, logout: authLogout, isLoggedIn } = useAuth(); // ADICIONE isLoggedIn aqui
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // SEM estado local para user - usa diretamente do auth
  const user = propUser || authUser;

  useEffect(() => {
    // Carregar contagem de favoritos
    const wishlist = getWishlist();
    setWishlistCount(wishlist.length);

    const handleStorageChange = () => {
      // Atualizar contagem de favoritos
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
      console.log('📢 Evento userLoggedOut recebido - fechando menu e recarregando');
      setShowUserMenu(false);
      // Força atualização fechando o menu
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('resize', handleResize);
    window.addEventListener('userLoggedOut', handleUserLoggedOut); // OUVE O EVENTO DE LOGOUT
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

  const handleLogout = async () => { // TORNE ASSÍNCRONA
    if (window.confirm('Tem certeza que deseja sair?')) {
      try {
        setShowUserMenu(false); // Fecha o menu imediatamente
        await authLogout(); // Aguarda o logout
        // O logout já recarrega a página automaticamente
      } catch (error) {
        console.error('Erro no logout:', error);
        window.location.reload(); // Força recarga se der erro
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

  // Use isLoggedIn do useAuth para controle mais preciso
  const isUserLoggedIn = isLoggedIn;

  return (
    <>
      {/* Promo Bar */}
      <div className="promo-bar">
        <p>
          <strong>🎁 LuckPet Já!</strong> Receba em até 1h* 
          <a href="#" className="saiba-mais"> Saiba mais</a>
        </p>
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

          {/* Search - Desktop e Mobile quando ativado */}
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
            
            {/* Search Toggle no Mobile */}
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
              {isUserLoggedIn && user ? ( // ALTERADO: Usa isUserLoggedIn
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
                          <div className="dropdown-level">
                            <span className="level-badge">
                              {user.isGuest ? 'Usuário Convidado' : 'Cliente Premium'}
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
                          <span className="dropdown-badge">Novo</span>
                        </button>
                        
                        {/* Botão de Favoritos no Menu */}
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
                        
                        <Link 
                          to="/configuracoes" 
                          className="dropdown-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <i className="fas fa-cog"></i> 
                          <span>Configurações</span>
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
        /* Estilos para a promo bar */
        .promo-bar {
          background: linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          padding: 0.5rem 0;
          text-align: center;
          font-size: 0.875rem;
        }

        .saiba-mais {
          color: #FBBF24;
          text-decoration: none;
          margin-left: 0.5rem;
        }

        .saiba-mais:hover {
          text-decoration: underline;
        }

        /* Estilos para o header */
        .header {
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

        /* Logo */
        .header-left {
          flex-shrink: 0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: #1F2937;
          font-weight: 700;
          font-size: 1.5rem;
          transition: color 0.2s;
        }

        .logo:hover {
          color: #8B5CF6;
        }

        .logo i {
          color: #8B5CF6;
        }

        /* Search */
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

        /* Actions */
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
          gap: 0.5rem;
          padding: 0.5rem;
          color: #4B5563;
          cursor: pointer;
          text-decoration: none;
          border-radius: 0.5rem;
          transition: all 0.2s;
          position: relative;
        }

        .action-btn:hover {
          background: #F3F4F6;
          color: #8B5CF6;
        }

        /* CARRINHO - ESTILOS ESPECÍFICOS */
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
          font-size: 1.2rem;
          color: #4B5563;
          transition: color 0.2s;
        }

        .cart-btn:hover i {
          color: #8B5CF6;
        }

        .cart-btn .badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #EF4444;
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .btn-text {
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* User Dropdown */
        .user-dropdown-container {
          position: relative;
        }

        .user-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          padding: 0.25rem;
          cursor: pointer;
          border-radius: 2rem;
          transition: all 0.2s;
        }

        .user-btn:hover {
          background: #F3F4F6;
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
          border: 2px solid #E5E7EB;
          transition: border-color 0.2s;
        }

        .user-btn:hover .user-avatar {
          border-color: #8B5CF6;
        }

        .wishlist-indicator {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #EF4444;
          color: white;
          font-size: 0.6rem;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1F2937;
        }

        .dropdown-arrow {
          font-size: 0.75rem;
          color: #6B7280;
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
          top: calc(100% + 0.5rem);
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          min-width: 300px;
          z-index: 100;
          animation: slideDown 0.2s ease-out;
          overflow: hidden;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-header {
          padding: 1.25rem;
          background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .dropdown-avatar-container {
          position: relative;
          width: 60px;
          height: 60px;
          flex-shrink: 0;
        }

        .dropdown-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .dropdown-wishlist-count {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #EF4444;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .dropdown-user-info {
          flex: 1;
          min-width: 0;
        }

        .dropdown-name {
          font-size: 1rem;
          font-weight: 600;
          color: #1F2937;
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .level-badge {
          display: inline-block;
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
        }

        .dropdown-credits {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #8B5CF6;
          font-weight: 600;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .dropdown-divider {
          height: 1px;
          background: #E5E7EB;
          margin: 0.5rem 0;
        }

        .dropdown-items {
          padding: 0.5rem;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: #4B5563;
          text-decoration: none;
          font-size: 0.875rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .dropdown-item:hover {
          background: #F3F4F6;
          color: #8B5CF6;
        }

        .dropdown-item i {
          width: 20px;
          text-align: center;
          color: #9CA3AF;
        }

        .dropdown-item.wishlist-item {
          color: #EF4444;
        }

        .dropdown-item.wishlist-item:hover {
          background: #FEE2E2;
          color: #DC2626;
        }

        .dropdown-item.wishlist-item i {
          color: #EF4444;
        }

        .dropdown-badge {
          position: absolute;
          right: 1rem;
          background: #10B981;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropdown-item.logout {
          color: #EF4444;
        }

        .dropdown-item.logout:hover {
          background: #FEE2E2;
          color: #DC2626;
        }

        .dropdown-item.logout i {
          color: #EF4444;
        }

        /* Mobile */
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

          /* Carrinho mobile */
          .cart-btn i {
            font-size: 1.4rem;
          }

          .cart-btn .badge {
            top: -6px;
            right: -6px;
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
            border-radius: 1rem 1rem 0 0;
            animation: slideUp 0.3s ease-out;
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
            font-size: 1.25rem;
          }

          .cart-btn {
            padding: 0.375rem;
          }
        }
      `}</style>
    </>
  );
};

export default Header;