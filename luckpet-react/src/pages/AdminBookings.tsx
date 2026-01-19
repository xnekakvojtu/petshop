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
  }, [isAdmin, isLoading, navigate]);

  // Função para formatar nome do cliente SEM UID
  const formatCustomerName = (customerName?: string, userId?: string) => {
    if (customerName && customerName.trim() !== '') {
      const names = customerName.split(' ');
      return names[0]; // Primeiro nome apenas
    }
    
    if (userId) {
      // Para UIDs, mostrar apenas os primeiros 6 caracteres
      return `Cliente #${userId.substring(0, 6)}`;
    }
    
    return 'Cliente';
  };

  // Filtrar localmente pela busca (NÃO incluir UID na busca)
  const filteredBookings = bookings.filter(booking => {
    if (!filters.search) return true;
    
    const searchLower = filters.search.toLowerCase();
    const customerName = formatCustomerName(booking.customerName, booking.userId);
    
    return (
      booking.petName.toLowerCase().includes(searchLower) ||
      customerName.toLowerCase().includes(searchLower) ||
      booking.serviceName.toLowerCase().includes(searchLower)
      // NÃO incluir userId na busca!
    );
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Aplica filtros
    applyFilters(newFilters);
  };

  const applyFilters = (filterData: typeof filters) => {
    const filteredData = {
      date: filterData.date || undefined,
      status: filterData.status !== 'all' ? filterData.status : undefined,
      serviceId: filterData.serviceId !== 'all' ? filterData.serviceId : undefined,
    };
    fetchAllBookings(filteredData);
  };

  const handleStatusUpdate = async (
    bookingId: string, 
    status: any,
    reason?: string
  ) => {
    const success = await handleUpdateBookingStatus(bookingId, status, reason);
    if (success) {
      // Notificação visual
      const event = new CustomEvent('notification', {
        detail: { 
          message: 'Status atualizado com sucesso!', 
          type: 'success' 
        }
      });
      window.dispatchEvent(event);
    }
  };

  if (!isAdmin) {
    return null;
  }

  // Função para obter data formatada
  const getFormattedDate = () => {
    const today = new Date();
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    
    return {
      day: today.getDate(),
      month: months[today.getMonth()],
      weekday: weekdays[today.getDay()],
      fullDate: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
    };
  };

  const currentDate = getFormattedDate();

  return (
    <div className="admin-bookings">
      <AdminSidebar />
      
      <div className="admin-content">
        <div className="content-header">
          <div className="header-main">
            <h1>Gerenciar Agendamentos</h1>
            <p>Total: {bookings.length} agendamentos • Pendentes: {stats?.pendingBookings || 0}</p>
          </div>
          
          <div className="header-actions">
            <div className="date-badge">
              <i className="fas fa-calendar-day"></i>
              <span>{currentDate.weekday}, {currentDate.day} {currentDate.month}</span>
            </div>
            
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Visualizar em tabela"
              >
                <i className="fas fa-table"></i>
                <span className="toggle-text">Tabela</span>
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
                title="Visualizar em calendário"
              >
                <i className="fas fa-calendar"></i>
                <span className="toggle-text">Calendário</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="search">
                <i className="fas fa-search"></i>
                Buscar
              </label>
              <div className="search-input">
                <input
                  id="search"
                  type="text"
                  placeholder="Buscar por pet, cliente ou serviço..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  aria-label="Buscar agendamentos"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label htmlFor="date">
                <i className="fas fa-calendar"></i>
                Data
              </label>
              <div className="date-input">
                <input
                  id="date"
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  aria-label="Filtrar por data"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label htmlFor="status">
                <i className="fas fa-filter"></i>
                Status
              </label>
              <div className="status-select">
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  aria-label="Filtrar por status"
                >
                  <option value="all">Todos os Status</option>
                  <option value="pending">Pendentes</option>
                  <option value="confirmed">Confirmados</option>
                  <option value="cancelled">Cancelados</option>
                  <option value="completed">Concluídos</option>
                </select>
              </div>
            </div>
            
            <div className="filter-group">
              <label htmlFor="service">
                <i className="fas fa-cut"></i>
                Serviço
              </label>
              <div className="service-select">
                <select
                  id="service"
                  value={filters.serviceId}
                  onChange={(e) => handleFilterChange('serviceId', e.target.value)}
                  aria-label="Filtrar por serviço"
                >
                  <option value="all">Todos os Serviços</option>
                  <option value="banho">Banho</option>
                  <option value="tosa">Tosa</option>
                  <option value="consulta">Consulta</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="filter-actions">
            <button 
              className="clear-filters"
              onClick={() => {
                setFilters({ date: '', status: 'all', serviceId: 'all', search: '' });
                fetchAllBookings();
              }}
              aria-label="Limpar todos os filtros"
            >
              <i className="fas fa-times"></i>
              <span>Limpar Filtros</span>
            </button>
            
            <button 
              className="export-btn"
              onClick={() => alert('Exportar para CSV em breve!')}
              aria-label="Exportar agendamentos"
            >
              <i className="fas fa-file-export"></i>
              <span>Exportar</span>
            </button>
          </div>
        </div>
        
        {/* Resumo dos filtros */}
        {filters.date || filters.status !== 'all' || filters.serviceId !== 'all' || filters.search ? (
          <div className="filter-summary">
            <div className="summary-content">
              <i className="fas fa-filter"></i>
              <span className="summary-label">Filtros aplicados:</span>
              
              <div className="filter-tags">
                {filters.search && (
                  <span className="filter-tag">
                    <i className="fas fa-search"></i>
                    "{filters.search}"
                  </span>
                )}
                {filters.date && (
                  <span className="filter-tag">
                    <i className="far fa-calendar"></i>
                    {new Date(filters.date).toLocaleDateString('pt-BR')}
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className={`filter-tag status-${filters.status}`}>
                    <i className="fas fa-circle"></i>
                    {filters.status === 'pending' ? 'Pendentes' :
                     filters.status === 'confirmed' ? 'Confirmados' :
                     filters.status === 'cancelled' ? 'Cancelados' : 'Concluídos'}
                  </span>
                )}
                {filters.serviceId !== 'all' && (
                  <span className="filter-tag">
                    <i className="fas fa-cut"></i>
                    {filters.serviceId === 'banho' ? 'Banho' :
                     filters.serviceId === 'tosa' ? 'Tosa' : 'Consulta'}
                  </span>
                )}
              </div>
              
              <span className="filter-count">
                {filteredBookings.length} de {bookings.length} agendamentos
              </span>
            </div>
          </div>
        ) : null}
        
        <div className="bookings-section">
          {viewMode === 'table' ? (
            <BookingTable 
              bookings={filteredBookings}
              onUpdateStatus={handleStatusUpdate}
              loading={loading.bookings}
              // Passar função para formatar nome
              formatCustomerName={formatCustomerName}
            />
          ) : (
            <div className="calendar-view">
              <div className="coming-soon">
                <i className="fas fa-calendar-alt"></i>
                <h3>Visualização em Calendário</h3>
                <p>Em breve você poderá visualizar os agendamentos em um calendário interativo.</p>
                <button 
                  className="btn-primary"
                  onClick={() => setViewMode('table')}
                  aria-label="Voltar para visualização em tabela"
                >
                  <i className="fas fa-arrow-left"></i>
                  Voltar para Tabela
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .admin-bookings {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }
        
        .admin-content {
          flex: 1;
          margin-left: 250px;
          padding: 24px;
          background: #f8fafc;
          min-height: 100vh;
          width: calc(100% - 250px);
        }
        
        .content-header {
          margin-bottom: 24px;
        }
        
        .header-main h1 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 28px;
          font-weight: 700;
        }
        
        .header-main p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }
        
        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .date-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border-radius: 10px;
          color: #374151;
          font-weight: 500;
          font-size: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .date-badge i {
          color: #8b5cf6;
        }
        
        .view-toggle {
          display: flex;
          gap: 8px;
          background: #f3f4f6;
          padding: 4px;
          border-radius: 10px;
        }
        
        .toggle-btn {
          padding: 8px 16px;
          border: none;
          background: none;
          border-radius: 8px;
          color: #6b7280;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        
        .toggle-btn:hover {
          background: #e5e7eb;
        }
        
        .toggle-btn.active {
          background: white;
          color: #8b5cf6;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .toggle-text {
          display: inline;
        }
        
        .filters-section {
          background: white;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .filter-group label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .filter-group label i {
          color: #8b5cf6;
          font-size: 13px;
        }
        
        .search-input input,
        .date-input input,
        .status-select select,
        .service-select select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          color: #1f2937;
          background: white;
          transition: all 0.2s;
        }
        
        .search-input input:focus,
        .date-input input:focus,
        .status-select select:focus,
        .service-select select:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        .filter-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }
        
        .clear-filters,
        .export-btn {
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          border: none;
        }
        
        .clear-filters {
          background: #f3f4f6;
          color: #374151;
        }
        
        .clear-filters:hover {
          background: #e5e7eb;
        }
        
        .export-btn {
          background: #8b5cf6;
          color: white;
        }
        
        .export-btn:hover {
          background: #7c3aed;
        }
        
        /* Resumo de Filtros */
        .filter-summary {
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          border-left: 4px solid #8b5cf6;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .summary-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .summary-content i {
          color: #8b5cf6;
          font-size: 14px;
        }
        
        .summary-label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
        
        .filter-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .filter-tag {
          background: #f3f4f6;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          color: #4b5563;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .filter-tag i {
          font-size: 11px;
        }
        
        .filter-tag.status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        
        .filter-tag.status-confirmed {
          background: #d1fae5;
          color: #065f46;
        }
        
        .filter-tag.status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .filter-tag.status-completed {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .filter-count {
          margin-left: auto;
          font-weight: 600;
          color: #8b5cf6;
          font-size: 14px;
        }
        
        /* Calendário */
        .calendar-view {
          background: white;
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .coming-soon i {
          font-size: 48px;
          color: #d1d5db;
          margin-bottom: 20px;
        }
        
        .coming-soon h3 {
          margin: 0 0 10px 0;
          color: #1f2937;
          font-size: 20px;
        }
        
        .coming-soon p {
          margin: 0 0 20px 0;
          color: #6b7280;
          max-width: 400px;
          margin: 0 auto 20px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .btn-primary {
          background: #8b5cf6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 auto;
          transition: background 0.2s;
        }
        
        .btn-primary:hover {
          background: #7c3aed;
        }
        
        /* ===== RESPONSIVIDADE ===== */
        
        /* Tablet (1024px) */
        @media (max-width: 1024px) {
          .admin-content {
            margin-left: 220px;
            width: calc(100% - 220px);
            padding: 20px;
          }
          
          .filters-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        /* Mobile Landscape (768px) */
        @media (max-width: 768px) {
          .admin-content {
            margin-left: 60px;
            width: calc(100% - 60px);
            padding: 16px;
          }
          
          .header-main h1 {
            font-size: 24px;
          }
          
          .header-actions {
            flex-direction: column;
            align-items: stretch;
          }
          
          .date-badge {
            justify-content: center;
          }
          
          .filters-grid {
            grid-template-columns: 1fr;
          }
          
          .filter-actions {
            flex-direction: column;
          }
          
          .clear-filters,
          .export-btn {
            justify-content: center;
          }
          
          .summary-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .filter-tags {
            width: 100%;
          }
          
          .filter-count {
            margin-left: 0;
            align-self: flex-start;
          }
          
          .toggle-text {
            display: none;
          }
          
          .toggle-btn {
            padding: 8px 12px;
          }
        }
        
        /* Mobile Portrait (480px) */
        @media (max-width: 480px) {
          .admin-content {
            margin-left: 0;
            width: 100%;
            padding: 16px;
            padding-top: 80px;
          }
          
          .header-main h1 {
            font-size: 20px;
          }
          
          .header-main p {
            font-size: 13px;
          }
          
          .filters-section {
            padding: 16px;
          }
          
          .calendar-view {
            padding: 24px;
          }
          
          .coming-soon h3 {
            font-size: 18px;
          }
          
          .coming-soon p {
            font-size: 13px;
          }
        }
        
        /* Small Mobile (360px) */
        @media (max-width: 360px) {
          .admin-content {
            padding: 12px;
            padding-top: 70px;
          }
          
          .header-main h1 {
            font-size: 18px;
          }
          
          .filters-section {
            padding: 12px;
          }
          
          .filter-tag {
            font-size: 12px;
            padding: 4px 8px;
          }
          
          .btn-primary {
            padding: 10px 16px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminBookings;