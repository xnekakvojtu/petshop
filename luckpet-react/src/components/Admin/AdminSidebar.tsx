import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItem {
  path: string;
  label: string;
  icon: string;
}

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const menuItems: SidebarItem[] = [
    { path: '/admin', label: 'Dashboard', icon: 'fas fa-chart-line' },
    { path: '/admin/bookings', label: 'Agendamentos', icon: 'fas fa-calendar-alt' },
    { path: '/admin/services', label: 'Serviços', icon: 'fas fa-cut' },
    { path: '/admin/clients', label: 'Clientes', icon: 'fas fa-users' },
    { path: '/admin/schedule', label: 'Horários', icon: 'fas fa-clock' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="sidebar-mobile-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1001,
          background: '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px',
          cursor: 'pointer',
          fontSize: '20px',
        }}
      >
        <i className="fas fa-bars"></i>
      </button>
      
      <div 
        className="admin-sidebar"
        style={{
          width: '250px',
          background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
          color: 'white',
          height: '100vh',
          position: 'fixed',
          left: '0',
          top: '0',
          display: 'flex',
          flexDirection: 'column',
          zIndex: '1000',
          transition: 'all 0.3s ease',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div 
          className="sidebar-logo"
          style={{
            padding: '25px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            fontSize: '18px',
            fontWeight: '600',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <i 
            className="fas fa-crown"
            style={{
              color: '#8b5cf6',
              fontSize: '24px',
              filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.3))',
            }}
          ></i>
          <span>Painel Admin</span>
        </div>
        
        <nav 
          className="sidebar-nav"
          style={{
            flex: '1',
            padding: '20px 0',
            overflowY: 'auto',
          }}
        >
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '15px 20px',
                margin: '5px 15px',
                color: '#d1d5db',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
              onClick={() => window.innerWidth <= 768 && setIsMobileOpen(false)}
            >
              <i 
                className={item.icon}
                style={{
                  width: '20px',
                  textAlign: 'center',
                  fontSize: '18px',
                  transition: 'transform 0.3s ease',
                }}
              ></i>
              <span>{item.label}</span>
              {location.pathname === item.path && (
                <div 
                  className="active-indicator"
                  style={{
                    position: 'absolute',
                    right: '0',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '20px',
                    background: '#8b5cf6',
                    borderRadius: '2px',
                  }}
                ></div>
              )}
            </Link>
          ))}
        </nav>
        
        <div 
          className="sidebar-footer"
          style={{
            padding: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <Link 
            to="/" 
            className="back-to-site"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#9ca3af',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              padding: '12px',
              borderRadius: '8px',
            }}
            onClick={() => window.innerWidth <= 768 && setIsMobileOpen(false)}
          >
            <i className="fas fa-home"></i>
            <span>Voltar ao Site</span>
          </Link>
          
          <div 
            className="user-profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <div 
              className="profile-avatar"
              style={{
                width: '35px',
                height: '35px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                color: 'white',
              }}
            >
              A
            </div>
            <div 
              className="profile-info"
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span 
                className="profile-name"
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Admin
              </span>
              <span 
                className="profile-role"
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                }}
              >
                Administrador
              </span>
            </div>
          </div>
        </div>
        
        <style>{`
          .sidebar-item:hover {
            background: rgba(139, 92, 246, 0.1);
            color: white;
            transform: translateX(4px);
          }
          
          .sidebar-item.active {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
          }
          
          .sidebar-item:hover i {
            transform: scale(1.1);
          }
          
          .back-to-site:hover {
            background: rgba(139, 92, 246, 0.1);
            color: white;
            transform: translateX(4px);
          }
          
          .user-profile:hover {
            background: rgba(255, 255, 255, 0.1);
          }
          
          /* Responsividade */
          @media (max-width: 1024px) {
            .admin-sidebar {
              width: 220px;
            }
            
            .sidebar-logo {
              padding: 20px 15px;
            }
            
            .sidebar-item {
              padding: 12px 15px;
              margin: 4px 10px;
            }
          }
          
          @media (max-width: 768px) {
            .sidebar-mobile-toggle {
              display: block !important;
            }
            
            .admin-sidebar {
              width: 250px;
              transform: translateX(${isMobileOpen ? '0' : '-100%'});
              box-shadow: ${isMobileOpen ? '4px 0 20px rgba(0, 0, 0, 0.3)' : 'none'};
            }
            
            .admin-content {
              margin-left: 0 !important;
              padding: 20px !important;
            }
          }
          
          @media (max-width: 480px) {
            .admin-sidebar {
              width: 100%;
              max-width: 300px;
            }
          }
          
          /* Scrollbar personalizada */
          .sidebar-nav::-webkit-scrollbar {
            width: 4px;
          }
          
          .sidebar-nav::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
          }
          
          .sidebar-nav::-webkit-scrollbar-thumb {
            background: #8b5cf6;
            border-radius: 2px;
          }
        `}</style>
      </div>
    </>
  );
};

export default AdminSidebar;