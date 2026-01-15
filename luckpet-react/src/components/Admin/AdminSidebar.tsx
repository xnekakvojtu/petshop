import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItem {
  path: string;
  label: string;
  icon: string;
}

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  
  const menuItems: SidebarItem[] = [
    { path: '/admin', label: 'Dashboard', icon: 'fas fa-chart-line' },
    { path: '/admin/bookings', label: 'Agendamentos', icon: 'fas fa-calendar-alt' },
    { path: '/admin/services', label: 'Serviços', icon: 'fas fa-cut' },
    { path: '/admin/clients', label: 'Clientes', icon: 'fas fa-users' },
    { path: '/admin/schedule', label: 'Horários', icon: 'fas fa-clock' },
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-logo">
        <i className="fas fa-crown"></i>
        <span>Painel Admin</span>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <Link to="/" className="back-to-site">
          <i className="fas fa-home"></i>
          Voltar ao Site
        </Link>
      </div>
      
      <style >{`
        .admin-sidebar {
          width: 250px;
          background: #1f2937;
          color: white;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
        }
        
        .sidebar-logo {
          padding: 20px;
          border-bottom: 1px solid #374151;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 600;
        }
        
        .sidebar-logo i {
          color: #8b5cf6;
          font-size: 22px;
        }
        
        .sidebar-nav {
          flex: 1;
          padding: 20px 0;
        }
        
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 20px;
          color: #d1d5db;
          text-decoration: none;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }
        
        .sidebar-item:hover {
          background: #374151;
          color: white;
        }
        
        .sidebar-item.active {
          background: #374151;
          color: white;
          border-left-color: #8b5cf6;
        }
        
        .sidebar-item i {
          width: 20px;
          text-align: center;
        }
        
        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid #374151;
        }
        
        .back-to-site {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #9ca3af;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .back-to-site:hover {
          color: white;
        }
        
        @media (max-width: 768px) {
          .admin-sidebar {
            width: 60px;
            overflow: hidden;
          }
          
          .sidebar-logo span,
          .sidebar-item span,
          .back-to-site span {
            display: none;
          }
          
          .sidebar-logo {
            justify-content: center;
          }
          
          .sidebar-item {
            justify-content: center;
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSidebar;