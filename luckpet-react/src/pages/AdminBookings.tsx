// src/pages/AdminBookings.tsx - MELHORADO
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

  // Filtrar localmente pela busca
  const filteredBookings = bookings.filter(booking => {
    if (!filters.search) return true;
    
    const searchLower = filters.search.toLowerCase();
    return (
      booking.petName.toLowerCase().includes(searchLower) ||
      booking.customerName?.toLowerCase().includes(searchLower) ||
      booking.serviceName.toLowerCase().includes(searchLower) ||
      booking.userId.toLowerCase().includes(searchLower)
    );
  });

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-bookings">
      <AdminSidebar />
      
      <div className="admin-content">
        <div className="content-header">
          <div>
            <h1>Gerenciar Agendamentos</h1>
            <p>Total: {bookings.length} agendamentos • Pendentes: {stats?.pendingBookings || 0}</p>
          </div>
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <i className="fas fa-table"></i> Tabela
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              <i className="fas fa-calendar"></i> Calendário
            </button>
          </div>
        </div>
        
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Buscar:</label>
              <div className="search-input">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Buscar por pet, cliente ou serviço..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Data:</label>
              <div className="date-input">
                <i className="fas fa-calendar"></i>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Status:</label>
              <div className="status-select">
                <i className="fas fa-filter"></i>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
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
              <label>Serviço:</label>
              <div className="service-select">
                <i className="fas fa-cut"></i>
                <select
                  value={filters.serviceId}
                  onChange={(e) => handleFilterChange('serviceId', e.target.value)}
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
            >
              <i className="fas fa-times"></i> Limpar Filtros
            </button>
            
            <button 
              className="export-btn"
              onClick={() => alert('Exportar para CSV em breve!')}
            >
              <i className="fas fa-file-export"></i> Exportar
            </button>
          </div>
        </div>
        
        {/* Resumo dos filtros */}
        {filters.date || filters.status !== 'all' || filters.serviceId !== 'all' || filters.search ? (
          <div className="filter-summary">
            <div className="summary-content">
              <i className="fas fa-filter"></i>
              <span>Filtros aplicados:</span>
              {filters.search && (
                <span className="filter-tag">Busca: "{filters.search}"</span>
              )}
              {filters.date && (
                <span className="filter-tag">Data: {new Date(filters.date).toLocaleDateString('pt-BR')}</span>
              )}
              {filters.status !== 'all' && (
                <span className={`filter-tag status-${filters.status}`}>
                  Status: {
                    filters.status === 'pending' ? 'Pendentes' :
                    filters.status === 'confirmed' ? 'Confirmados' :
                    filters.status === 'cancelled' ? 'Cancelados' : 'Concluídos'
                  }
                </span>
              )}
              {filters.serviceId !== 'all' && (
                <span className="filter-tag">
                  Serviço: {
                    filters.serviceId === 'banho' ? 'Banho' :
                    filters.serviceId === 'tosa' ? 'Tosa' : 'Consulta'
                  }
                </span>
              )}
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
                >
                  Voltar para Tabela
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style >{`
        .admin-bookings {
          display: flex;
          min-height: 100vh;
        }
        
        .admin-content {
          flex: 1;
          margin-left: 250px;
          padding: 30px;
          background: #f8fafc;
          min-height: 100vh;
        }
        
        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .content-header h1 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 32px;
        }
        
        .content-header p {
          margin: 0;
          color: #6b7280;
          font-size: 15px;
        }
        
        .view-toggle {
          display: flex;
          gap: 10px;
          background: #f3f4f6;
          padding: 4px;
          border-radius: 10px;
        }
        
        .toggle-btn {
          padding: 10px 20px;
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
        
        .filters-section {
          background: white;
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
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
        
        .search-input,
        .date-input,
        .status-select,
        .service-select {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .search-input i,
        .date-input i,
        .status-select i,
        .service-select i {
          position: absolute;
          left: 12px;
          color: #9ca3af;
          font-size: 14px;
        }
        
        .search-input input,
        .date-input input,
        .status-select select,
        .service-select select {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-size: 15px;
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
          gap: 15px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        
        .clear-filters,
        .export-btn {
          padding: 10px 20px;
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
          padding: 16px 20px;
          margin-bottom: 20px;
          border-left: 4px solid #8b5cf6;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .summary-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .summary-content i {
          color: #8b5cf6;
        }
        
        .summary-content > span:first-of-type {
          font-weight: 600;
          color: #374151;
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
        }
        
        /* Calendário */
        .calendar-view {
          background: white;
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        
        .coming-soon i {
          font-size: 64px;
          color: #d1d5db;
          margin-bottom: 20px;
        }
        
        .coming-soon h3 {
          margin: 0 0 10px 0;
          color: #1f2937;
        }
        
        .coming-soon p {
          margin: 0 0 20px 0;
          color: #6b7280;
          max-width: 400px;
          margin: 0 auto 20px;
        }
        
        .btn-primary {
          background: #8b5cf6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .btn-primary:hover {
          background: #7c3aed;
        }
        
        @media (max-width: 1024px) {
          .filters-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .admin-content {
            margin-left: 60px;
            padding: 20px;
          }
          
          .content-header {
            flex-direction: column;
          }
          
          .content-header h1 {
            font-size: 24px;
          }
          
          .filters-grid {
            grid-template-columns: 1fr;
          }
          
          .filter-actions {
            flex-direction: column;
          }
          
          .summary-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .filter-count {
            margin-left: 0;
            margin-top: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminBookings;