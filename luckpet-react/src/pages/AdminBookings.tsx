import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/Admin/AdminSidebar';
import BookingTable from '../components/Admin/BookingTable';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AdminBookings: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAuth();
  const { 
    bookings, 
    loading, 
    fetchAllBookings, 
    handleUpdateBookingStatus,
    stats
  } = useAdmin();
  
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  
  const [filters, setFilters] = useState({
    date: '',
    status: 'all',
    serviceId: 'all',
    search: '',
  });

  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  useEffect(() => {
    if (!isAdmin && !isLoading) {
      navigate('/');
    }
    fetchAllBookings();
    
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setScreenWidth(window.innerWidth);
      if (!mobile) setSidebarOpen(false);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAdmin, isLoading, navigate, fetchAllBookings]);

  const formatCustomerName = (customerName?: string, userId?: string) => {
    if (customerName && customerName.trim() !== '') {
      const names = customerName.split(' ');
      return names[0];
    }
    
    if (userId) {
      return `Cliente #${userId.substring(0, 6)}`;
    }
    
    return 'Cliente';
  };

  const normalizeDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const dateObj = new Date(dateString);
      
      if (isNaN(dateObj.getTime())) {
        const dateParts = dateString.split(/[/\-T]/);
        if (dateParts.length >= 3) {
          const year = dateParts[0].length === 4 ? dateParts[0] : dateParts[2];
          const month = dateParts[1].padStart(2, '0');
          const day = dateParts[0].length === 4 ? dateParts[2] : dateParts[0];
          return `${year}-${month}-${day}`;
        }
        return '';
      }
      
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Erro ao normalizar data:', dateString, error);
      return '';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      const customerName = formatCustomerName(booking.customerName, booking.userId).toLowerCase();
      
      const matchesSearch = 
        (booking.petName && booking.petName.toLowerCase().includes(searchLower)) ||
        (customerName && customerName.includes(searchLower)) ||
        (booking.serviceName && booking.serviceName.toLowerCase().includes(searchLower)) ||
        (booking.customerPhone && booking.customerPhone.includes(searchLower)) ||
        (booking.customerEmail && booking.customerEmail.toLowerCase().includes(searchLower)) ||
        (booking.id && booking.id.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }
    
    if (filters.date) {
      const normalizedFilterDate = filters.date;
      const normalizedBookingDate = normalizeDate(booking.date || '');
      
      if (normalizedFilterDate !== normalizedBookingDate) {
        return false;
      }
    }
    
    if (filters.status !== 'all') {
      if (booking.status !== filters.status) return false;
    }
    
    if (filters.serviceId !== 'all') {
      const serviceIdLower = filters.serviceId.toLowerCase();
      const bookingServiceNameLower = booking.serviceName?.toLowerCase() || '';
      
      const serviceMapping: Record<string, string[]> = {
        'banho_completo': ['banho completo', 'banho_completo', 'banho'],
        'consulta_veterinaria': ['consulta veterinária', 'consulta_veterinaria', 'consulta', 'veterinário', 'veterinaria'],
        'tosa': ['tosa', 'tosa completa', 'tosa_higienica', 'tosa higiênica']
      };
      
      let matchesService = false;
      
      if (serviceMapping[serviceIdLower]) {
        matchesService = serviceMapping[serviceIdLower].some(service => 
          bookingServiceNameLower.includes(service)
        );
      }
      
      if (!matchesService) {
        matchesService = bookingServiceNameLower.includes(serviceIdLower);
      }
      
      if (!matchesService) return false;
    }
    
    return true;
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleStatusUpdate = async (
    bookingId: string, 
    status: any,
    reason?: string
  ) => {
    const success = await handleUpdateBookingStatus(bookingId, status, reason);
    if (success) {
      const event = new CustomEvent('notification', {
        detail: { 
          message: 'Status atualizado com sucesso!', 
          type: 'success' 
        }
      });
      window.dispatchEvent(event);
    }
  };

  const clearFilters = () => {
    setFilters({ date: '', status: 'all', serviceId: 'all', search: '' });
  };

  const getFilterStats = () => {
    const stats = {
      total: bookings.length,
      filtered: filteredBookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };
    return stats;
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!isAdmin && !isLoading) {
    return null;
  }

  const getCurrentDate = () => {
    const today = new Date();
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    
    return {
      day: today.getDate(),
      month: months[today.getMonth()],
      year: today.getFullYear(),
      weekday: weekdays[today.getDay()]
    };
  };

  const currentDate = getCurrentDate();
  const filterStats = getFilterStats();
  const pendingCount = stats?.pendingBookings || filterStats.pending;
  const totalBookings = bookings.length;

  const exportToCSV = () => {
    const headers = ['ID', 'Pet', 'Cliente', 'Data', 'Serviço', 'Status', 'Telefone', 'Email'];
    const csvData = filteredBookings.map(b => [
      b.id,
      b.petName || '',
      formatCustomerName(b.customerName, b.userId),
      b.date,
      b.serviceName || '',
      b.status,
      b.customerPhone || '',
      b.customerEmail || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `agendamentos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFiltersGridColumns = () => {
    if (screenWidth < 640) return '1fr';
    if (screenWidth < 1024) return 'repeat(2, 1fr)';
    return 'repeat(4, 1fr)';
  };

  return (
    <div className="admin-bookings" style={{ 
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
                <i className="fas fa-calendar-check"></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Agendamentos</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>LuckPet</span>
              </div>
            </div>
          </div>
        )}
        
        <main 
          className="bookings-main"
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
                }}>Gerenciar Agendamentos</h1>
                <p style={{ 
                  margin: 0, 
                  color: '#6b7280', 
                  fontSize: isMobile ? '0.9375rem' : '1rem',
                  lineHeight: 1.5
                }}>
                  {filteredBookings.length === totalBookings 
                    ? `Total: ${totalBookings} agendamentos` 
                    : `${filteredBookings.length} de ${totalBookings} filtrados`
                  }
                  {pendingCount > 0 && ` • ${pendingCount} pendentes`}
                </p>
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
                    <i className="fas fa-calendar-day"></i>
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
                  Encontre agendamentos por data, status ou serviço
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
                  gridColumn: screenWidth < 1024 ? '1 / -1' : 'auto',
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
                    placeholder="Pet, cliente, telefone ou email..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
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
                  {filters.search && (
                    <button 
                      onClick={() => handleFilterChange('search', '')}
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
              
              {/* Filtro por Data */}
              <div className="filter-group">
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
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
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {filters.date && (
                    <button 
                      onClick={() => handleFilterChange('date', '')}
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
              
              {/* Filtro por Status */}
              <div className="filter-group">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#1a1a1a',
                    background: 'white',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#7c3aed';
                    e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="all">Todos os Status ({totalBookings})</option>
                  <option value="pending">Pendentes ({filterStats.pending})</option>
                  <option value="confirmed">Confirmados ({filterStats.confirmed})</option>
                  <option value="completed">Concluídos ({filterStats.completed})</option>
                  <option value="cancelled">Cancelados ({filterStats.cancelled})</option>
                </select>
              </div>
              
              {/* Filtro por Serviço */}
              <div className="filter-group">
                <select
                  value={filters.serviceId}
                  onChange={(e) => handleFilterChange('serviceId', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#1a1a1a',
                    background: 'white',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#7c3aed';
                    e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="all">Todos os Serviços</option>
                  <option value="banho_completo">Banho Completo</option>
                  <option value="consulta_veterinaria">Consulta Veterinária</option>
                  <option value="tosa">Tosa</option>
                  <option value="outro">Outros</option>
                </select>
              </div>
            </div>
            
            <div 
              className="filter-actions"
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: '1rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #e5e7eb',
                marginTop: '1.25rem',
              }}
            >
              <div 
                className="view-toggle"
                style={{
                  display: 'flex',
                  background: '#f3f4f6',
                  padding: '0.25rem',
                  borderRadius: '8px',
                  alignSelf: isMobile ? 'stretch' : 'flex-start',
                }}
              >
                <button 
                  className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Visualizar em tabela"
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    background: viewMode === 'table' ? 'white' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: viewMode === 'table' ? '#7c3aed' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (viewMode !== 'table') {
                      e.currentTarget.style.background = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (viewMode !== 'table') {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <i className="fas fa-table"></i>
                  <span>Tabela</span>
                </button>
                <button 
                  className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                  onClick={() => setViewMode('calendar')}
                  title="Visualizar em calendário"
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    background: viewMode === 'calendar' ? 'white' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: viewMode === 'calendar' ? '#7c3aed' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (viewMode !== 'calendar') {
                      e.currentTarget.style.background = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (viewMode !== 'calendar') {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <i className="fas fa-calendar"></i>
                  <span>Calendário</span>
                </button>
              </div>
              
              <div 
                className="filter-summary-actions"
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'stretch' : 'center',
                  gap: '1rem',
                }}
              >
                {(filters.date || filters.status !== 'all' || filters.serviceId !== 'all' || filters.search) && (
                  <button 
                    className="clear-filters-btn"
                    onClick={clearFilters}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e5e7eb';
                      e.currentTarget.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                  >
                    <i className="fas fa-times"></i>
                    <span>Limpar Filtros</span>
                  </button>
                )}
                
                <div 
                  className="results-count"
                  style={{
                    fontWeight: 600,
                    color: '#7c3aed',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    padding: '0.5rem 1rem',
                  }}
                >
                  {filteredBookings.length} resultado{filteredBookings.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </section>
          
          {/* Resumo dos filtros */}
          {(filters.date || filters.status !== 'all' || filters.serviceId !== 'all' || filters.search) && (
            <section 
              className="filter-summary-section"
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem',
                border: '1px solid #e5e7eb',
              }}
            >
              <div 
                className="filter-tags"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '0.75rem',
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
                  Filtros ativos:
                </span>
                
                {filters.search && (
                  <span 
                    className="filter-tag"
                    style={{
                      background: 'white',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <i className="fas fa-search"></i>
                    "{filters.search}"
                  </span>
                )}
                {filters.date && (
                  <span 
                    className="filter-tag"
                    style={{
                      background: 'white',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <i className="far fa-calendar"></i>
                    {formatDisplayDate(filters.date)}
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span 
                    className={`filter-tag status-${filters.status}`}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      border: '1px solid',
                      ...(filters.status === 'pending' ? { 
                        background: '#fef3c7', 
                        color: '#92400e',
                        borderColor: '#fde68a'
                      } :
                      filters.status === 'confirmed' ? { 
                        background: '#d1fae5', 
                        color: '#065f46',
                        borderColor: '#a7f3d0'
                      } :
                      filters.status === 'cancelled' ? { 
                        background: '#fee2e2', 
                        color: '#991b1b',
                        borderColor: '#fecaca'
                      } :
                      { 
                        background: '#dbeafe', 
                        color: '#1e40af',
                        borderColor: '#bfdbfe'
                      })
                    }}
                  >
                    <i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i>
                    {filters.status === 'pending' ? 'Pendentes' :
                     filters.status === 'confirmed' ? 'Confirmados' :
                     filters.status === 'cancelled' ? 'Cancelados' : 'Concluídos'}
                  </span>
                )}
                {filters.serviceId !== 'all' && (
                  <span 
                    className="filter-tag"
                    style={{
                      background: 'white',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <i className="fas fa-cut"></i>
                    {filters.serviceId === 'banho_completo' ? 'Banho Completo' :
                     filters.serviceId === 'consulta_veterinaria' ? 'Consulta Veterinária' :
                     filters.serviceId === 'tosa' ? 'Tosa' : 'Outros'}
                  </span>
                )}
              </div>
            </section>
          )}
          
          {/* Conteúdo Principal */}
          <section 
            className="bookings-section"
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
                  {viewMode === 'table' ? 'Lista de Agendamentos' : 'Calendário'}
                </h2>
                <p style={{ 
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '0.875rem',
                }}>
                  Gerencie e visualize todos os agendamentos do sistema
                </p>
              </div>
            </div>
            
            <div className="bookings-content">
              {loading.bookings ? (
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
                    Carregando agendamentos...
                  </p>
                </div>
              ) : viewMode === 'table' ? (
                <>
                  {filteredBookings.length === 0 ? (
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
                        className="fas fa-calendar-times"
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
                        Nenhum agendamento encontrado
                      </h3>
                      <p style={{ 
                        margin: '0 0 1rem 0', 
                        color: '#6b7280', 
                        maxWidth: '300px',
                        fontSize: '0.875rem', 
                        lineHeight: 1.5 
                      }}>
                        {totalBookings === 0 
                          ? 'Não há agendamentos registrados no sistema.'
                          : 'Nenhum agendamento corresponde aos filtros aplicados.'}
                      </p>
                      {(filters.date || filters.status !== 'all' || filters.serviceId !== 'all' || filters.search) && (
                        <button 
                          className="btn-primary"
                          onClick={clearFilters}
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
                    <BookingTable 
                      bookings={filteredBookings}
                      onUpdateStatus={handleStatusUpdate}
                      loading={false}
                      formatCustomerName={formatCustomerName}
                    />
                  )}
                </>
              ) : (
                <div 
                  className="calendar-view"
                  style={{
                    background: '#f9fafb',
                    borderRadius: '12px',
                    padding: '3rem 1.5rem',
                    textAlign: 'center',
                    border: '2px dashed #e5e7eb',
                  }}
                >
                  <div className="coming-soon">
                    <i 
                      className="fas fa-calendar-alt"
                      style={{ 
                        fontSize: '3rem', 
                        color: '#d1d5db', 
                        marginBottom: '1rem' 
                      }}
                    ></i>
                    <h3 style={{ 
                      margin: '0 0 0.5rem 0', 
                      color: '#4b5563', 
                      fontSize: '1.25rem' 
                    }}>
                      Visualização em Calendário
                    </h3>
                    <p style={{ 
                      margin: '0 0 1.5rem 0', 
                      color: '#6b7280', 
                      maxWidth: '400px',
                     
                      fontSize: '0.875rem', 
                      lineHeight: 1.5 
                    }}>
                      Em breve você poderá visualizar os agendamentos em um calendário interativo.
                    </p>
                    <button 
                      className="btn-primary"
                      onClick={() => setViewMode('table')}
                      style={{
                        padding: '0.75rem 1.5rem',
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
                      <i className="fas fa-arrow-left"></i>
                      Voltar para Tabela
                    </button>
                  </div>
                </div>
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
          
          .bookings-main {
            padding-top: calc(1.5rem + 72px) !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-header {
            display: none !important;
          }
        }
        
        @media (max-width: 640px) {
          .bookings-main {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          
          .filters-section,
          .bookings-section {
            padding: 1rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .bookings-main {
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
          
          .view-toggle {
            width: 100% !important;
          }
          
          .filter-summary-actions {
            align-items: stretch !important;
          }
          
          .clear-filters-btn,
          .btn-primary {
            width: 100% !important;
            justify-content: center !important;
          }
          
          .filter-tag {
            font-size: 0.6875rem !important;
            padding: 0.25rem 0.5rem !important;
          }
        }
        
        @media (max-width: 320px) {
          .bookings-main {
            padding: calc(0.75rem + 72px) 0.5rem 0.5rem 0.5rem !important;
          }
          
          .greeting-section h1 {
            font-size: 1.5rem !important;
          }
          
          .export-btn span,
          .toggle-btn span {
            font-size: 0.75rem !important;
          }
          
          .search-input,
          .date-input,
          select {
            font-size: 0.75rem !important;
            padding: 0.5rem 0.625rem !important;
          }
          
          .search-input {
            padding-left: 2.25rem !important;
          }
          
          .empty-state,
          .calendar-view {
            padding: 2rem 1rem !important;
          }
          
          .coming-soon h3,
          .empty-state h3 {
            font-size: 1.125rem !important;
          }
          
          .coming-soon p,
          .empty-state p {
            font-size: 0.8125rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminBookings;