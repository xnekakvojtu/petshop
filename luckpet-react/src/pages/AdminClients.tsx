import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/Admin/AdminSidebar';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AdminClients: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAuth();
  const { users, loading, fetchAllUsers, bookings } = useAdmin();

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    if (!isAdmin && !isLoading) {
      navigate('/login');
    }
    fetchAllUsers();
    
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setScreenWidth(window.innerWidth);
      if (!mobile) setSidebarOpen(false);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAdmin, isLoading, navigate, fetchAllUsers]);

  if (!isAdmin && !isLoading) {
    return null;
  }

  // Formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    }
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    }).replace(/ de /g, '/');
  };

  // Obter última data de agendamento
  const getLastBookingDate = (userId: string) => {
    const userBookings = bookings
      .filter(b => b.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (userBookings.length > 0) {
      return formatDate(userBookings[0].createdAt);
    }
    
    return 'Nenhum agendamento';
  };

  // Formatar telefone
  const formatPhone = (phone: string) => {
    if (!phone || phone === 'Não informado') return 'Não informado';
    
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length === 11) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
    }
    
    if (numbers.length === 10) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`;
    }
    
    if (phone.includes('(') && phone.includes(')')) {
      return phone;
    }
    
    return phone;
  };

  // Buscar telefone dos agendamentos para cada usuário
  const getUserPhone = (userId: string) => {
    const userBookings = bookings.filter(b => b.userId === userId);
    if (userBookings.length > 0) {
      const lastBooking = userBookings.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      
      if (lastBooking.customerPhone) {
        return formatPhone(lastBooking.customerPhone);
      }
    }
    
    const user = users.find(u => u.id === userId);
    if (user?.phone) {
      return formatPhone(user.phone);
    }
    
    return 'Não informado';
  };

  // Função para obter iniciais do nome
  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return '??';
    
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Função para formatar nome do cliente
  const formatClientInfo = (user: any) => {
    const displayName = user.name?.trim() || 'Cliente sem nome';
    const displayId = user.id ? `#${user.id.substring(0, 8)}` : '';
    
    const phone = getUserPhone(user.id);
    
    return {
      displayName,
      displayId,
      initials: getInitials(displayName),
      phone,
      email: user.email || 'Não informado',
      totalBookings: bookings.filter(b => b.userId === user.id).length,
      lastBooking: getLastBookingDate(user.id)
    };
  };

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const userInfo = formatClientInfo(user);
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      userInfo.displayName.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      userInfo.phone.toLowerCase().includes(searchLower) ||
      userInfo.displayId.toLowerCase().includes(searchLower);
    
    const matchesRole = selectedRole === 'all' || 
      (selectedRole === 'user' && user.role === 'user' && !user.isGuest) ||
      (selectedRole === 'admin' && user.role === 'admin') ||
      (selectedRole === 'guest' && user.isGuest);
    
    return matchesSearch && matchesRole;
  });

  // Estatísticas
  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    guest: users.filter(u => u.isGuest).length,
    regular: users.filter(u => !u.isGuest && u.role === 'user').length,
    verified: users.filter(u => u.emailVerified).length,
    pending: users.filter(u => !u.emailVerified).length,
    withPhone: users.filter(u => {
      const phone = getUserPhone(u.id);
      return phone !== 'Não informado';
    }).length
  };

  // Exportar para CSV
  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Tipo', 'Créditos', 'Status', 'Agendamentos', 'Último Agendamento'];
    const csvData = filteredUsers.map(user => {
      const info = formatClientInfo(user);
      return [
        info.displayName,
        user.email || '',
        info.phone,
        user.role === 'admin' ? 'Administrador' : user.isGuest ? 'Convidado' : 'Cliente',
        user.credits || 0,
        user.emailVerified ? 'Verificado' : 'Pendente',
        info.totalBookings,
        info.lastBooking
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCurrentDate = () => {
    const today = new Date();
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    
    return {
      day: today.getDate(),
      weekday: weekdays[today.getDay()],
      month: months[today.getMonth()],
      year: today.getFullYear()
    };
  };

  const currentDate = getCurrentDate();

  const handleViewClient = (userId: string) => {
    navigate(`/admin/clients/${userId}`);
  };

  const handleEditClient = (userId: string, userName: string) => {
    if (confirm(`Editar cliente ${userName}?`)) {
      navigate(`/admin/clients/${userId}/edit`);
    }
  };

  const handlePromoteToAdmin = (userId: string, userName: string) => {
    if (confirm(`Tornar ${userName} administrador?\n\nEsta ação dará acesso total ao painel administrativo.`)) {
      alert(`Cliente ${userName} promovido a administrador!`);
    }
  };

  const getFiltersGridColumns = () => {
    if (screenWidth < 640) return '1fr';
    return '1fr 1fr';
  };

  return (
    <div className="admin-clients" style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#fafafa',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <AdminSidebar 
        onMobileClose={() => setSidebarOpen(!sidebarOpen)}
        isMobileOpen={sidebarOpen}
      />
      
      <div 
        className="admin-content"
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : '260px',
          width: isMobile ? '100%' : 'calc(100% - 260px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div 
            className="mobile-header"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              background: 'white',
              padding: '1rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                color: '#7c3aed',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f3ff';
                e.currentTarget.style.borderColor = '#ddd6fe';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <i className="fas fa-bars"></i>
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div 
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                <i className="fas fa-users"></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Clientes</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>LuckPet</span>
              </div>
            </div>
          </div>
        )}
        
        <main 
          className="clients-main"
          style={{
            padding: isMobile ? 'calc(1.5rem + 72px) 1rem 1rem 1rem' : '2rem 2.5rem',
            maxWidth: '1400px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* Header */}
          <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
            <div 
              className="header-content"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1.5rem',
                flexDirection: isMobile ? 'column' : 'row',
              }}
            >
              <div className="greeting-section">
                <h1 style={{ 
                  margin: '0 0 0.5rem 0', 
                  fontSize: isMobile ? '1.75rem' : '2rem', 
                  fontWeight: 700, 
                  color: '#111827',
                  lineHeight: 1.2 
                }}>Gerenciar Clientes</h1>
                <p style={{ 
                  margin: 0, 
                  color: '#6b7280', 
                  fontSize: isMobile ? '0.9375rem' : '1rem',
                  lineHeight: 1.5
                }}>Total: {stats.total} clientes • {stats.withPhone} com telefone</p>
              </div>
              
              <div 
                className="header-actions"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexDirection: isMobile ? 'column' : 'row',
                  width: isMobile ? '100%' : 'auto',
                }}
              >
                <div 
                  className="date-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    background: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb',
                    width: isMobile ? '100%' : 'auto',
                    minWidth: isMobile ? 'auto' : '180px',
                  }}
                >
                  <div 
                    className="date-icon"
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}
                  >
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="date-info">
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      color: '#6b7280', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '2px'
                    }}>{currentDate.weekday}</div>
                    <div 
                      className="date-display"
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '0.25rem',
                      }}
                    >
                      <span style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: 700, 
                        color: '#111827',
                        lineHeight: 1 
                      }}>{currentDate.day}</span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280', 
                        fontWeight: 500 
                      }}>{currentDate.month} {currentDate.year}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="export-btn"
                  onClick={exportToCSV}
                  title="Exportar para CSV"
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center',
                    fontSize: '0.9375rem',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#059669';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#10b981';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <i className="fas fa-file-export"></i>
                  <span style={{ fontSize: '0.875rem' }}>Exportar CSV</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Filtros */}
          <section 
            className="filters-section"
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #f3f4f6',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div 
              className="section-header"
              style={{
                marginBottom: '1.25rem',
              }}
            >
              <div className="section-title-group">
                <h2 
                  className="section-title"
                  style={{
                    margin: '0 0 0.375rem 0',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <i className="fas fa-filter" style={{ color: '#7c3aed' }}></i>
                  Filtros
                </h2>
                <p style={{ 
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '0.875rem',
                }}>
                  Encontre clientes por nome, email ou telefone
                </p>
              </div>
            </div>
            
            <div 
              className="filters-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: getFiltersGridColumns(),
                gap: '1rem',
              }}
            >
              {/* Campo de Busca */}
              <div 
                className="filter-group"
                style={{
                  gridColumn: screenWidth < 768 ? '1 / -1' : 'auto',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <i 
                    className="fas fa-search" 
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6b7280',
                      fontSize: '0.875rem',
                    }}
                  ></i>
                  <input
                    type="text"
                    placeholder="Nome, email, telefone ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 2.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      color: '#1a1a1a',
                      background: 'white',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#7c3aed';
                      e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        borderRadius: '0.25rem',
                        transition: 'all 0.2s',
                        fontSize: '0.75rem',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e5e7eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Filtro por Tipo */}
              <div className="filter-group">
                <div 
                  className="role-buttons"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                    gap: '0.5rem',
                  }}
                >
                  <button 
                    className={`role-btn ${selectedRole === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedRole('all')}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: selectedRole === 'all' ? '#7c3aed' : '#f3f4f6',
                      border: selectedRole === 'all' ? '1px solid #7c3aed' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      color: selectedRole === 'all' ? 'white' : '#4b5563',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      transition: 'all 0.2s',
                      justifyContent: 'center',
                      flexDirection: isMobile ? 'column' : 'row',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedRole !== 'all') {
                        e.currentTarget.style.background = '#e5e7eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedRole !== 'all') {
                        e.currentTarget.style.background = '#f3f4f6';
                      }
                    }}
                  >
                    <span 
                      className="role-dot all"
                      style={{
                        width: '0.5rem',
                        height: '0.5rem',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: selectedRole === 'all' ? 'white' : '#9ca3af',
                      }}
                    ></span>
                    Todos ({stats.total})
                  </button>
                  <button 
                    className={`role-btn ${selectedRole === 'user' ? 'active' : ''}`}
                    onClick={() => setSelectedRole('user')}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: selectedRole === 'user' ? '#7c3aed' : '#f3f4f6',
                      border: selectedRole === 'user' ? '1px solid #7c3aed' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      color: selectedRole === 'user' ? 'white' : '#4b5563',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      transition: 'all 0.2s',
                      justifyContent: 'center',
                      flexDirection: isMobile ? 'column' : 'row',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedRole !== 'user') {
                        e.currentTarget.style.background = '#e5e7eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedRole !== 'user') {
                        e.currentTarget.style.background = '#f3f4f6';
                      }
                    }}
                  >
                    <span 
                      className="role-dot user"
                      style={{
                        width: '0.5rem',
                        height: '0.5rem',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: selectedRole === 'user' ? 'white' : '#10b981',
                      }}
                    ></span>
                    Clientes ({stats.regular})
                  </button>
                  <button 
                    className={`role-btn ${selectedRole === 'admin' ? 'active' : ''}`}
                    onClick={() => setSelectedRole('admin')}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: selectedRole === 'admin' ? '#7c3aed' : '#f3f4f6',
                      border: selectedRole === 'admin' ? '1px solid #7c3aed' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      color: selectedRole === 'admin' ? 'white' : '#4b5563',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      transition: 'all 0.2s',
                      justifyContent: 'center',
                      flexDirection: isMobile ? 'column' : 'row',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedRole !== 'admin') {
                        e.currentTarget.style.background = '#e5e7eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedRole !== 'admin') {
                        e.currentTarget.style.background = '#f3f4f6';
                      }
                    }}
                  >
                    <span 
                      className="role-dot admin"
                      style={{
                        width: '0.5rem',
                        height: '0.5rem',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: selectedRole === 'admin' ? 'white' : '#f59e0b',
                      }}
                    ></span>
                    Admin ({stats.admin})
                  </button>
                  <button 
                    className={`role-btn ${selectedRole === 'guest' ? 'active' : ''}`}
                    onClick={() => setSelectedRole('guest')}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: selectedRole === 'guest' ? '#7c3aed' : '#f3f4f6',
                      border: selectedRole === 'guest' ? '1px solid #7c3aed' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      color: selectedRole === 'guest' ? 'white' : '#4b5563',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      transition: 'all 0.2s',
                      justifyContent: 'center',
                      flexDirection: isMobile ? 'column' : 'row',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedRole !== 'guest') {
                        e.currentTarget.style.background = '#e5e7eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedRole !== 'guest') {
                        e.currentTarget.style.background = '#f3f4f6';
                      }
                    }}
                  >
                    <span 
                      className="role-dot guest"
                      style={{
                        width: '0.5rem',
                        height: '0.5rem',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: selectedRole === 'guest' ? 'white' : '#6b7280',
                      }}
                    ></span>
                    Convidados ({stats.guest})
                  </button>
                </div>
              </div>
            </div>
            
            {/* Resumo de Filtros */}
            {(searchTerm || selectedRole !== 'all') && (
              <div 
                className="filter-summary"
                style={{
                  marginTop: '1.25rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid #e5e7eb',
                }}
              >
                <div 
                  className="summary-content"
                  style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'stretch' : 'center',
                    gap: '1rem',
                  }}
                >
                  <div 
                    className="summary-tags"
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span 
                      className="summary-label"
                      style={{
                        fontWeight: 600,
                        color: '#4b5563',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <i className="fas fa-filter"></i>
                      Filtros aplicados:
                    </span>
                    {searchTerm && (
                      <span 
                        className="filter-tag"
                        style={{
                          background: '#f3f4f6',
                          padding: '0.25rem 0.625rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <i className="fas fa-search"></i>
                        "{searchTerm}"
                      </span>
                    )}
                    {selectedRole !== 'all' && (
                      <span 
                        className={`filter-tag role-${selectedRole}`}
                        style={{
                          padding: '0.25rem 0.625rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          whiteSpace: 'nowrap',
                          ...(selectedRole === 'user' ? { 
                            background: '#d1fae5', 
                            color: '#065f46',
                          } :
                          selectedRole === 'admin' ? { 
                            background: '#fef3c7', 
                            color: '#92400e',
                          } :
                          { 
                            background: '#e5e7eb', 
                            color: '#4b5563',
                          })
                        }}
                      >
                        {selectedRole === 'user' ? '👤 Clientes' :
                         selectedRole === 'admin' ? '👑 Admin' : '👥 Convidados'}
                      </span>
                    )}
                  </div>
                  <div 
                    className="summary-actions"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <span 
                      className="results-count"
                      style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {filteredUsers.length} de {stats.total} resultados
                    </span>
                    <button 
                      className="clear-filters-btn"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedRole('all');
                      }}
                      style={{
                        padding: '0.375rem 0.75rem',
                        background: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e5e7eb';
                        e.currentTarget.style.color = '#4b5563';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f3f4f6';
                        e.currentTarget.style.color = '#6b7280';
                      }}
                    >
                      <i className="fas fa-times"></i>
                      Limpar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
          
          {/* Lista de Clientes */}
          <section 
            className="clients-section"
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid #f3f4f6',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div 
              className="section-header"
              style={{
                marginBottom: '1.5rem',
              }}
            >
              <div className="section-title-group">
                <h2 
                  className="section-title"
                  style={{
                    margin: '0 0 0.375rem 0',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <i className="fas fa-list" style={{ color: '#7c3aed' }}></i>
                  Lista de Clientes
                </h2>
                <p style={{ 
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '0.875rem',
                }}>
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
                </p>
              </div>
            </div>
            
            <div className="clients-content">
              {loading.users ? (
                <div 
                  className="loading-state"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                  }}
                >
                  <div 
                    className="spinner"
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      border: '3px solid #e5e7eb',
                      borderTopColor: '#7c3aed',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginBottom: '1rem',
                    }}
                  ></div>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                    Carregando clientes...
                  </p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div 
                  className="empty-state"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3rem 1.5rem',
                    textAlign: 'center',
                  }}
                >
                  <i 
                    className="fas fa-users-slash"
                    style={{ 
                      fontSize: '2.5rem', 
                      color: '#d1d5db', 
                      marginBottom: '1rem' 
                    }}
                  ></i>
                  <h3 style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: '#4b5563', 
                    fontSize: '1.125rem' 
                  }}>
                    Nenhum cliente encontrado
                  </h3>
                  <p style={{ 
                    margin: '0 0 1rem 0', 
                    color: '#6b7280', 
                    maxWidth: '300px',
                    fontSize: '0.875rem', 
                    lineHeight: 1.5 
                  }}>
                    {searchTerm || selectedRole !== 'all' 
                      ? 'Tente ajustar os filtros ou buscar por um termo diferente.'
                      : 'Não há clientes cadastrados no sistema.'
                    }
                  </p>
                  {(searchTerm || selectedRole !== 'all') && (
                    <button 
                      className="btn-primary"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedRole('all');
                      }}
                      style={{
                        padding: '0.625rem 1.25rem',
                        background: '#7c3aed',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                        fontSize: '0.875rem',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#6d28d9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#7c3aed';
                      }}
                    >
                      <i className="fas fa-times"></i>
                      Limpar Filtros
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop View */}
                  {!isMobile && (
                    <div 
                      className="clients-table-wrapper"
                      style={{
                        overflowX: 'auto',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <table 
                        className="clients-table"
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          minWidth: '1000px',
                        }}
                      >
                        <thead>
                          <tr>
                            <th style={{ 
                              textAlign: 'left',
                              padding: '1rem',
                              fontWeight: 600,
                              color: '#6b7280',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderBottom: '2px solid #e5e7eb',
                              background: '#f9fafb',
                              whiteSpace: 'nowrap',
                            }}>Cliente</th>
                            <th style={{ 
                              textAlign: 'left',
                              padding: '1rem',
                              fontWeight: 600,
                              color: '#6b7280',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderBottom: '2px solid #e5e7eb',
                              background: '#f9fafb',
                              whiteSpace: 'nowrap',
                            }}>Contato</th>
                            <th style={{ 
                              textAlign: 'left',
                              padding: '1rem',
                              fontWeight: 600,
                              color: '#6b7280',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderBottom: '2px solid #e5e7eb',
                              background: '#f9fafb',
                              whiteSpace: 'nowrap',
                            }}>Tipo</th>
                            <th style={{ 
                              textAlign: 'left',
                              padding: '1rem',
                              fontWeight: 600,
                              color: '#6b7280',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderBottom: '2px solid #e5e7eb',
                              background: '#f9fafb',
                              whiteSpace: 'nowrap',
                            }}>Status</th>
                            <th style={{ 
                              textAlign: 'left',
                              padding: '1rem',
                              fontWeight: 600,
                              color: '#6b7280',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderBottom: '2px solid #e5e7eb',
                              background: '#f9fafb',
                              whiteSpace: 'nowrap',
                            }}>Créditos</th>
                            <th style={{ 
                              textAlign: 'left',
                              padding: '1rem',
                              fontWeight: 600,
                              color: '#6b7280',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderBottom: '2px solid #e5e7eb',
                              background: '#f9fafb',
                              whiteSpace: 'nowrap',
                            }}>Agendamentos</th>
                            <th style={{ 
                              textAlign: 'left',
                              padding: '1rem',
                              fontWeight: 600,
                              color: '#6b7280',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderBottom: '2px solid #e5e7eb',
                              background: '#f9fafb',
                              whiteSpace: 'nowrap',
                            }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => {
                            const clientInfo = formatClientInfo(user);
                            return (
                              <tr 
                                key={user.id} 
                                className="client-row"
                                style={{ 
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <td style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }}>
                                  <div 
                                    className="client-info-cell"
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.75rem',
                                      minWidth: '180px',
                                    }}
                                  >
                                    <div 
                                      className={`client-avatar ${user.role} ${user.isGuest ? 'guest' : ''}`}
                                      title={clientInfo.displayName}
                                      style={{
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '0.875rem',
                                        flexShrink: 0,
                                        ...(user.role === 'admin' ? { 
                                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                                        } : user.isGuest ? { 
                                          background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                                        } : { 
                                          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' 
                                        })
                                      }}
                                    >
                                      {clientInfo.initials}
                                    </div>
                                    <div 
                                      className="client-details"
                                      style={{
                                        minWidth: 0,
                                      }}
                                    >
                                      <div 
                                        className="client-name" 
                                        title={clientInfo.displayName}
                                        style={{
                                          fontWeight: 600,
                                          color: '#1f2937',
                                          marginBottom: '0.25rem',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          maxWidth: '150px',
                                        }}
                                      >
                                        {clientInfo.displayName}
                                      </div>
                                      <div 
                                        className="client-id" 
                                        title={`ID: ${user.id}`}
                                        style={{
                                          fontSize: '0.75rem',
                                          color: '#6b7280',
                                          fontFamily: 'monospace',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {clientInfo.displayId}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }}>
                                  <div 
                                    className="contact-cell"
                                    style={{
                                      minWidth: '200px',
                                    }}
                                  >
                                    <div 
                                      className="contact-email" 
                                      title={clientInfo.email}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: '#6b7280',
                                        fontSize: '0.875rem',
                                        marginBottom: '0.375rem',
                                        minWidth: 0,
                                      }}
                                    >
                                      <i 
                                        className="far fa-envelope"
                                        style={{
                                          color: '#7c3aed',
                                          fontSize: '0.75rem',
                                          width: '1rem',
                                          flexShrink: 0,
                                        }}
                                      ></i>
                                      <span style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1,
                                      }}>
                                        {clientInfo.email}
                                      </span>
                                    </div>
                                    <div 
                                      className="contact-phone" 
                                      title={clientInfo.phone}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: '#6b7280',
                                        fontSize: '0.875rem',
                                        minWidth: 0,
                                      }}
                                    >
                                      <i 
                                        className="fas fa-phone"
                                        style={{
                                          color: '#7c3aed',
                                          fontSize: '0.75rem',
                                          width: '1rem',
                                          flexShrink: 0,
                                        }}
                                      ></i>
                                      <span style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1,
                                      }}>
                                        {clientInfo.phone}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }}>
                                  <div 
                                    className={`type-cell ${user.role} ${user.isGuest ? 'guest' : ''}`}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                    }}
                                  >
                                    <div 
                                      className="type-icon"
                                      style={{
                                        fontSize: '0.875rem',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {user.role === 'admin' ? '👑' : user.isGuest ? '👥' : '👤'}
                                    </div>
                                    <div 
                                      className="type-text"
                                      style={{
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#4b5563',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {user.role === 'admin' ? 'Administrador' : 
                                       user.isGuest ? 'Convidado' : 'Cliente'}
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }}>
                                  <div 
                                    className={`status-cell ${user.emailVerified ? 'verified' : 'pending'}`}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      padding: '0.375rem 0.625rem',
                                      borderRadius: '1rem',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      width: 'fit-content',
                                      flexShrink: 0,
                                      ...(user.emailVerified ? { 
                                        background: '#d1fae5', 
                                        color: '#065f46',
                                      } : { 
                                        background: '#fef3c7', 
                                        color: '#92400e',
                                      })
                                    }}
                                  >
                                    <span 
                                      className="status-dot"
                                      style={{
                                        width: '0.5rem',
                                        height: '0.5rem',
                                        borderRadius: '50%',
                                        flexShrink: 0,
                                        background: user.emailVerified ? '#10b981' : '#f59e0b',
                                      }}
                                    ></span>
                                    <span className="status-text">
                                      {user.emailVerified ? 'Verificado' : 'Pendente'}
                                    </span>
                                  </div>
                                </td>
                                <td style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }}>
                                  <div 
                                    className="credits-cell"
                                    style={{
                                      textAlign: 'center',
                                      minWidth: '100px',
                                    }}
                                  >
                                    <div 
                                      className="credits-value"
                                      style={{
                                        fontSize: '1.125rem',
                                        fontWeight: 700,
                                        color: '#10b981',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.375rem',
                                      }}
                                    >
                                      <i className="fas fa-coins"></i>
                                      {user.credits || 0}
                                    </div>
                                    <div 
                                      className="credits-label"
                                      style={{
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        marginTop: '0.25rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                      }}
                                    >
                                      LuckCoins
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }}>
                                  <div 
                                    className="bookings-cell"
                                    style={{
                                      textAlign: 'center',
                                      minWidth: '120px',
                                    }}
                                  >
                                    <div 
                                      className="bookings-count"
                                      style={{
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: '#7c3aed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.375rem',
                                      }}
                                    >
                                      <i className="fas fa-calendar-check"></i>
                                      {clientInfo.totalBookings}
                                    </div>
                                    <div 
                                      className="last-booking"
                                      style={{
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        marginTop: '0.25rem',
                                      }}
                                    >
                                      {clientInfo.lastBooking}
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }}>
                                  <div 
                                    className="actions-cell"
                                    style={{
                                      display: 'flex',
                                      gap: '0.375rem',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <button 
                                      className="action-btn view-btn"
                                      onClick={() => handleViewClient(user.id)}
                                      title="Ver detalhes"
                                      style={{
                                        width: '2rem',
                                        height: '2rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s',
                                        color: 'white',
                                        flexShrink: 0,
                                        fontSize: '0.875rem',
                                        background: '#3b82f6',
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#2563eb';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#3b82f6';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                      }}
                                    >
                                      <i className="fas fa-eye"></i>
                                    </button>
                                    <button 
                                      className="action-btn edit-btn"
                                      onClick={() => handleEditClient(user.id, clientInfo.displayName)}
                                      title="Editar cliente"
                                      style={{
                                        width: '2rem',
                                        height: '2rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s',
                                        color: 'white',
                                        flexShrink: 0,
                                        fontSize: '0.875rem',
                                        background: '#7c3aed',
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#6d28d9';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#7c3aed';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                      }}
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    {user.role !== 'admin' && (
                                      <button 
                                        className="action-btn promote-btn"
                                        onClick={() => handlePromoteToAdmin(user.id, clientInfo.displayName)}
                                        title="Promover a admin"
                                        style={{
                                          width: '2rem',
                                          height: '2rem',
                                          borderRadius: '6px',
                                          border: 'none',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          transition: 'all 0.2s',
                                          color: 'white',
                                          flexShrink: 0,
                                          fontSize: '0.875rem',
                                          background: '#f59e0b',
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = '#d97706';
                                          e.currentTarget.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = '#f59e0b';
                                          e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                      >
                                        <i className="fas fa-crown"></i>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {/* Mobile View */}
                  {isMobile && (
                    <div 
                      className="mobile-clients-list"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                      }}
                    >
                      {filteredUsers.map((user) => {
                        const clientInfo = formatClientInfo(user);
                        return (
                          <div 
                            key={user.id} 
                            className="mobile-client-card"
                            style={{
                              background: '#f9fafb',
                              borderRadius: '12px',
                              padding: '1rem',
                              border: '1px solid #e5e7eb',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.borderColor = '#7c3aed';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f9fafb';
                              e.currentTarget.style.borderColor = '#e5e7eb';
                            }}
                          >
                            <div 
                              className="card-header"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '0.75rem',
                              }}
                            >
                              <div 
                                className="client-avatar-mobile"
                                style={{
                                  width: '2.5rem',
                                  height: '2.5rem',
                                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                                  borderRadius: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: '0.875rem',
                                  flexShrink: 0,
                                }}
                              >
                                {clientInfo.initials}
                              </div>
                              <div 
                                className="client-info-mobile"
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                }}
                              >
                                <div 
                                  className="client-name-mobile"
                                  style={{
                                    fontWeight: 600,
                                    color: '#1f2937',
                                    marginBottom: '0.125rem',
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word',
                                    fontSize: '0.9375rem',
                                  }}
                                >
                                  {clientInfo.displayName}
                                </div>
                                <div 
                                  className="client-id-mobile"
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                    marginBottom: '0.375rem',
                                    wordWrap: 'break-word',
                                  }}
                                >
                                  {clientInfo.displayId}
                                </div>
                                <div 
                                  className="client-type-mobile"
                                  style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  <span 
                                    className={`type-badge ${user.role} ${user.isGuest ? 'guest' : ''}`}
                                    style={{
                                      padding: '0.1875rem 0.5rem',
                                      borderRadius: '8px',
                                      fontSize: '0.6875rem',
                                      fontWeight: 600,
                                      whiteSpace: 'nowrap',
                                      ...(user.role === 'admin' ? { 
                                        background: '#fef3c7', 
                                        color: '#92400e',
                                      } : user.isGuest ? { 
                                        background: '#e5e7eb', 
                                        color: '#4b5563',
                                      } : { 
                                        background: '#d1fae5', 
                                        color: '#065f46',
                                      })
                                    }}
                                  >
                                    {user.role === 'admin' ? '👑 Admin' : 
                                     user.isGuest ? '👥 Convidado' : '👤 Cliente'}
                                  </span>
                                  <span 
                                    className={`status-badge ${user.emailVerified ? 'verified' : 'pending'}`}
                                    style={{
                                      padding: '0.1875rem 0.5rem',
                                      borderRadius: '8px',
                                      fontSize: '0.6875rem',
                                      fontWeight: 600,
                                      whiteSpace: 'nowrap',
                                      ...(user.emailVerified ? { 
                                        background: '#d1fae5', 
                                        color: '#065f46',
                                      } : { 
                                        background: '#fef3c7', 
                                        color: '#92400e',
                                      })
                                    }}
                                  >
                                    {user.emailVerified ? '✓ Verificado' : '⏳ Pendente'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div 
                              className="card-body"
                              style={{
                                borderTop: '1px solid #e5e7eb',
                                borderBottom: '1px solid #e5e7eb',
                                padding: '0.75rem 0',
                                margin: '0.75rem 0',
                              }}
                            >
                              <div 
                                className="contact-info-mobile"
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.5rem',
                                  marginBottom: '0.75rem',
                                }}
                              >
                                <div 
                                  className="contact-item"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.5rem',
                                    color: '#6b7280',
                                    fontSize: '0.8125rem',
                                  }}
                                >
                                  <i 
                                    className="far fa-envelope"
                                    style={{
                                      color: '#7c3aed',
                                      width: '1rem',
                                      flexShrink: 0,
                                      marginTop: '0.125rem',
                                      fontSize: '0.75rem',
                                    }}
                                  ></i>
                                  <span 
                                    className="contact-text"
                                    style={{
                                      flex: 1,
                                      wordWrap: 'break-word',
                                      overflowWrap: 'break-word',
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {clientInfo.email}
                                  </span>
                                </div>
                                <div 
                                  className="contact-item"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.5rem',
                                    color: '#6b7280',
                                    fontSize: '0.8125rem',
                                  }}
                                >
                                  <i 
                                    className="fas fa-phone"
                                    style={{
                                      color: '#7c3aed',
                                      width: '1rem',
                                      flexShrink: 0,
                                      marginTop: '0.125rem',
                                      fontSize: '0.75rem',
                                    }}
                                  ></i>
                                  <span 
                                    className="contact-text"
                                    style={{
                                      flex: 1,
                                      wordWrap: 'break-word',
                                      overflowWrap: 'break-word',
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {clientInfo.phone}
                                  </span>
                                </div>
                              </div>
                              <div 
                                className="client-meta"
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: '0.75rem',
                                }}
                              >
                                <div 
                                  className="meta-item"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    color: '#6b7280',
                                    fontSize: '0.8125rem',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  <i 
                                    className="fas fa-coins"
                                    style={{
                                      color: '#9ca3af',
                                      fontSize: '0.75rem',
                                    }}
                                  ></i>
                                  <span>{user.credits || 0} LuckCoins</span>
                                </div>
                                <div 
                                  className="meta-item"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    color: '#6b7280',
                                    fontSize: '0.8125rem',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  <i 
                                    className="fas fa-calendar-check"
                                    style={{
                                      color: '#9ca3af',
                                      fontSize: '0.75rem',
                                    }}
                                  ></i>
                                  <span>{clientInfo.totalBookings} agendamentos</span>
                                </div>
                              </div>
                            </div>
                            <div 
                              className="card-footer"
                              style={{
                                display: 'flex',
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                              }}
                            >
                              <button 
                                className="mobile-action-btn"
                                onClick={() => handleViewClient(user.id)}
                                style={{
                                  flex: 1,
                                  padding: '0.5rem 0.75rem',
                                  background: 'white',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '8px',
                                  color: '#6b7280',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.375rem',
                                  transition: 'all 0.2s',
                                  minWidth: '70px',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#f3f4f6';
                                  e.currentTarget.style.borderColor = '#9ca3af';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'white';
                                  e.currentTarget.style.borderColor = '#d1d5db';
                                }}
                              >
                                <i className="fas fa-eye"></i>
                                <span className="action-text" style={{ whiteSpace: 'nowrap' }}>Ver</span>
                              </button>
                              <button 
                                className="mobile-action-btn"
                                onClick={() => handleEditClient(user.id, clientInfo.displayName)}
                                style={{
                                  flex: 1,
                                  padding: '0.5rem 0.75rem',
                                  background: 'white',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '8px',
                                  color: '#6b7280',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.375rem',
                                  transition: 'all 0.2s',
                                  minWidth: '70px',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#f3f4f6';
                                  e.currentTarget.style.borderColor = '#9ca3af';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'white';
                                  e.currentTarget.style.borderColor = '#d1d5db';
                                }}
                              >
                                <i className="fas fa-edit"></i>
                                <span className="action-text" style={{ whiteSpace: 'nowrap' }}>Editar</span>
                              </button>
                              {user.role !== 'admin' && (
                                <button 
                                  className="mobile-action-btn"
                                  onClick={() => handlePromoteToAdmin(user.id, clientInfo.displayName)}
                                  style={{
                                    flex: 1,
                                    padding: '0.5rem 0.75rem',
                                    background: 'white',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    color: '#6b7280',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.375rem',
                                    transition: 'all 0.2s',
                                    minWidth: '70px',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f3f4f6';
                                    e.currentTarget.style.borderColor = '#9ca3af';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white';
                                    e.currentTarget.style.borderColor = '#d1d5db';
                                  }}
                                >
                                  <i className="fas fa-crown"></i>
                                  <span className="action-text" style={{ whiteSpace: 'nowrap' }}>Promover</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </main>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .mobile-header {
            display: flex !important;
          }
          
          .clients-main {
            padding-top: calc(1.5rem + 72px) !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-header {
            display: none !important;
          }
        }
        
        @media (max-width: 640px) {
          .clients-main {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          
          .filters-section,
          .clients-section {
            padding: 1rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .clients-main {
            padding: calc(1rem + 72px) 0.75rem 0.75rem 0.75rem !important;
          }
          
          .date-card {
            flex-direction: column !important;
            text-align: center !important;
            gap: 0.5rem !important;
            padding: 0.75rem !important;
          }
          
          .date-display {
            justify-content: center !important;
          }
          
          .client-meta {
            grid-template-columns: 1fr !important;
          }
          
          .card-footer {
            flex-direction: column !important;
          }
          
          .mobile-action-btn {
            width: 100% !important;
          }
        }
        
        @media (max-width: 320px) {
          .clients-main {
            padding: calc(0.75rem + 72px) 0.5rem 0.5rem 0.5rem !important;
          }
          
          .greeting-section h1 {
            font-size: 1.5rem !important;
          }
          
          .role-buttons {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminClients;