import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItem {
  path: string;
  label: string;
  icon: string;
}

interface AdminSidebarProps {
  onMobileClose?: () => void;
  isMobileOpen?: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onMobileClose, isMobileOpen }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  
  const menuItems: SidebarItem[] = [
    { path: '/admin', label: 'Dashboard', icon: 'fas fa-chart-pie' },
    { path: '/admin/bookings', label: 'Agendamentos', icon: 'fas fa-calendar-check' },
    { path: '/admin/services', label: 'Serviços', icon: 'fas fa-scissors' },
    { path: '/admin/clients', label: 'Clientes', icon: 'fas fa-user-friends' },
    { path: '/admin/schedule', label: 'Horários', icon: 'fas fa-clock' },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleItemClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile Toggle Button - Design Mais Clean */}
      {isMobile && !isMobileOpen && (
        <button 
          className="sidebar-mobile-toggle"
          onClick={() => onMobileClose && onMobileClose()}
          style={{
            position: 'fixed',
            top: '24px',
            left: '20px',
            zIndex: 1001,
            background: 'white',
            color: '#7c3aed',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '12px',
            cursor: 'pointer',
            fontSize: '20px',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.12)';
            e.currentTarget.style.borderColor = '#7c3aed';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          <i className="fas fa-bars"></i>
        </button>
      )}
      
      <div 
        className={`admin-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: '260px',
          background: '#ffffff',
          color: '#333',
          height: '100vh',
          position: 'fixed',
          left: '0',
          top: '0',
          display: 'flex',
          flexDirection: 'column',
          zIndex: '1100',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isMobileOpen ? '8px 0 40px rgba(0, 0, 0, 0.12)' : '1px 0 0 rgba(0, 0, 0, 0.05)',
          overflowY: 'auto',
          transform: isMobile ? (isMobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        }}
      >
        <div 
          className="sidebar-logo"
          style={{
            padding: '28px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '20px',
            fontWeight: '700',
            background: '#ffffff',
          }}
        >
          <div 
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-spa"></i>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ 
              color: '#111827',
              fontSize: '16px',
              fontWeight: '700',
              lineHeight: '1.2'
            }}>LuckPet</span>
            <span style={{ 
              color: '#6b7280',
              fontSize: '12px',
              fontWeight: '500',
              marginTop: '2px'
            }}>Painel Admin</span>
          </div>
          
          {isMobile && (
            <button 
              className="sidebar-close-btn"
              onClick={onMobileClose}
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.color = '#111827';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        
        <nav 
          className="sidebar-nav"
          style={{
            flex: '1',
            padding: '16px 0',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '0 8px', marginBottom: '8px' }}>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '8px 20px',
              marginBottom: '4px'
            }}>
              Menu Principal
            </div>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 20px',
                  margin: '0 8px',
                  color: '#4b5563',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  borderRadius: '10px',
                  position: 'relative',
                }}
                onClick={handleItemClick}
                onMouseEnter={(e) => {
                  if (!location.pathname.startsWith(item.path)) {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.color = '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!location.pathname.startsWith(item.path)) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#4b5563';
                  }
                }}
              >
                <i 
                  className={item.icon}
                  style={{
                    fontSize: '16px',
                    width: '20px',
                    textAlign: 'center',
                    color: location.pathname.startsWith(item.path) ? '#7c3aed' : '#9ca3af',
                    transition: 'color 0.2s ease',
                  }}
                ></i>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: location.pathname.startsWith(item.path) ? '600' : '500',
                  color: location.pathname.startsWith(item.path) ? '#111827' : 'inherit',
                }}>{item.label}</span>
                
                {location.pathname.startsWith(item.path) && (
                  <div 
                    style={{
                      position: 'absolute',
                      right: '16px',
                      width: '6px',
                      height: '6px',
                      background: '#7c3aed',
                      borderRadius: '50%',
                    }}
                  ></div>
                )}
              </Link>
            ))}
          </div>
        </nav>
        
        <div 
          className="sidebar-footer"
          style={{
            padding: '20px 16px',
            borderTop: '1px solid #f3f4f6',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#ffffff',
            marginTop: 'auto',
          }}
        >
          <div 
            className="user-profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '10px',
              background: '#f9fafb',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f9fafb';
            }}
          >
            <div 
              className="profile-avatar"
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                color: 'white',
                fontSize: '14px',
              }}
            >
              <i className="fas fa-user-cog"></i>
            </div>
            <div 
              className="profile-info"
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: '1',
              }}
            >
              <span 
                className="profile-name"
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '2px',
                }}
              >
                Administrador
              </span>
              <span 
                className="profile-email"
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                admin@luckpet.com
              </span>
            </div>
          </div>
          
          <Link 
            to="/" 
            className="back-to-site"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#7c3aed',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              padding: '12px 16px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '14px',
              border: '1px solid #ede9fe',
              background: '#f5f3ff',
            }}
            onClick={handleItemClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ede9fe';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f3ff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <i className="fas fa-external-link-alt" style={{ fontSize: '12px' }}></i>
            <span>Voltar ao Site</span>
          </Link>
        </div>
      </div>
      
      {isMobile && isMobileOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={onMobileClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1050,
            backdropFilter: 'blur(2px)',
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
      
      <style>{`
        .sidebar-item.active {
          background: #f5f3ff !important;
          color: #7c3aed !important;
        }
        
        .sidebar-item.active i {
          color: #7c3aed !important;
        }
        
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }
        
        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 2px;
        }
        
        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        
        @media (max-width: 768px) {
          .admin-sidebar {
            width: 280px !important;
          }
        }
        
        @media (max-width: 480px) {
          .admin-sidebar {
            width: 100% !important;
            max-width: 300px;
          }
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;