import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/Admin/AdminSidebar';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AdminClients: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAuth();
  const { users, loading, fetchAllUsers } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    if (!isAdmin && !isLoading) {
      navigate('/');
    }
    fetchAllUsers();
  }, [isAdmin, isLoading, navigate]);

  if (!isAdmin) {
    return null;
  }

  // Função para formatar nome do cliente SEM mostrar UID
  const formatClientInfo = (user: any) => {
    const displayName = user.name || 'Cliente sem nome';
    const displayId = user.id ? `#${user.id.substring(0, 6)}` : '';
    
    return {
      displayName,
      displayId,
      initials: getInitials(displayName),
      phone: user.phone ? formatPhone(user.phone) : 'Não informado'
    };
  };

  // Formatar telefone
  const formatPhone = (phone: string) => {
    // Remove tudo que não é número
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length === 11) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
    }
    
    if (numbers.length === 10) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`;
    }
    
    return phone;
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

  // Filtrar usuários (NÃO incluir UID na busca)
  const filteredUsers = users.filter(user => {
    const userInfo = formatClientInfo(user);
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      userInfo.displayName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.phone && user.phone.includes(searchTerm));
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  // Estatísticas
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const guestUsers = users.filter(u => u.isGuest).length;
  const regularUsers = users.filter(u => !u.isGuest && u.role === 'user').length;

  // Formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ de /g, '/');
  };

  // Obter data atual para o header
  const getCurrentDate = () => {
    const today = new Date();
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    
    return {
      day: today.getDate(),
      month: months[today.getMonth()],
      weekday: weekdays[today.getDay()],
      full: `${weekdays[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]}`
    };
  };

  const currentDate = getCurrentDate();

  return (
    <div className="admin-clients">
      <AdminSidebar />
      
      <div className="admin-content">
        <div className="content-header">
          <div className="header-main">
            <h1>Gerenciar Clientes</h1>
            <p>Total: {totalUsers} clientes • Admin: {adminUsers} • Convidados: {guestUsers}</p>
          </div>
          
          <div className="date-badge">
            <i className="fas fa-calendar-day"></i>
            <span>{currentDate.full}</span>
          </div>
        </div>
        
        {/* Cards de Estatísticas */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#8b5cf6' }}>
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">{totalUsers}</div>
              <div className="stat-label">Total de Clientes</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#10b981' }}>
              <i className="fas fa-user-check"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">{regularUsers}</div>
              <div className="stat-label">Clientes Registrados</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f59e0b' }}>
              <i className="fas fa-user-clock"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">{guestUsers}</div>
              <div className="stat-label">Usuários Convidados</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ef4444' }}>
              <i className="fas fa-crown"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">{adminUsers}</div>
              <div className="stat-label">Administradores</div>
            </div>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="filters-section">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="search">
                <i className="fas fa-search"></i>
                Buscar cliente
              </label>
              <div className="search-input">
                <input
                  id="search"
                  type="text"
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Buscar clientes"
                />
                {searchTerm && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchTerm('')}
                    aria-label="Limpar busca"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
            
            <div className="filter-group">
              <label htmlFor="role-filter">
                <i className="fas fa-filter"></i>
                Filtrar por tipo
              </label>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${selectedRole === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('all')}
                  aria-label="Mostrar todos os tipos"
                >
                  Todos
                </button>
                <button 
                  className={`filter-btn ${selectedRole === 'user' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('user')}
                  aria-label="Filtrar por clientes"
                >
                  Clientes
                </button>
                <button 
                  className={`filter-btn ${selectedRole === 'admin' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('admin')}
                  aria-label="Filtrar por administradores"
                >
                  Admin
                </button>
                <button 
                  className={`filter-btn ${selectedRole === 'guest' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('guest')}
                  aria-label="Filtrar por convidados"
                >
                  Convidados
                </button>
              </div>
            </div>
          </div>
          
          {searchTerm || selectedRole !== 'all' ? (
            <div className="filter-summary">
              <span className="results-count">
                <i className="fas fa-filter"></i>
                Mostrando {filteredUsers.length} de {totalUsers} clientes
              </span>
              
              <div className="filter-tags">
                {searchTerm && (
                  <span className="filter-tag">
                    <i className="fas fa-search"></i>
                    "{searchTerm}"
                  </span>
                )}
                {selectedRole !== 'all' && (
                  <span className={`filter-tag role-${selectedRole}`}>
                    <i className="fas fa-user-tag"></i>
                    {selectedRole === 'user' ? 'Clientes' :
                     selectedRole === 'admin' ? 'Administradores' : 'Convidados'}
                  </span>
                )}
              </div>
              
              <button 
                className="clear-filters"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRole('all');
                }}
                aria-label="Limpar todos os filtros"
              >
                <i className="fas fa-times"></i>
                Limpar Filtros
              </button>
            </div>
          ) : null}
        </div>
        
        {/* Tabela de Clientes */}
        <div className="clients-section">
          <div className="section-header">
            <h2>Lista de Clientes</h2>
            <button 
              className="export-btn"
              onClick={() => alert('Exportar para CSV em breve!')}
              aria-label="Exportar lista de clientes"
            >
              <i className="fas fa-file-export"></i>
              <span className="export-text">Exportar</span>
            </button>
          </div>
          
          {loading.users ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Carregando clientes...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-users-slash"></i>
              <h3>Nenhum cliente encontrado</h3>
              <p>Tente ajustar os filtros ou buscar por um termo diferente.</p>
            </div>
          ) : (
            <div className="clients-table-container">
              <div className="table-responsive">
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Contato</th>
                      <th>Créditos</th>
                      <th>Tipo</th>
                      <th>Cadastro</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const clientInfo = formatClientInfo(user);
                      return (
                        <tr key={user.id}>
                          <td>
                            <div className="client-cell">
                              <div 
                                className={`client-avatar ${user.role === 'admin' ? 'admin' : user.isGuest ? 'guest' : ''}`}
                                title={clientInfo.displayName}
                              >
                                {clientInfo.initials}
                              </div>
                              <div className="client-info">
                                <div className="client-name" title={clientInfo.displayName}>
                                  {clientInfo.displayName}
                                </div>
                                <div className="client-id" title={`ID: ${user.id}`}>
                                  {clientInfo.displayId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="contact-info">
                              <div className="email" title={user.email}>
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="phone" title={clientInfo.phone}>
                                  <i className="fas fa-phone"></i>
                                  <span>{clientInfo.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="credits-cell">
                              <div className="credits-amount">{user.credits || 0}</div>
                              <div className="credits-label">LuckCoins</div>
                            </div>
                          </td>
                          <td>
                            <div className={`type-badge ${user.role} ${user.isGuest ? 'guest' : ''}`}>
                              {user.role === 'admin' ? 'Administrador' : 
                               user.isGuest ? 'Convidado' : 'Cliente'}
                            </div>
                          </td>
                          <td>
                            <div className="date-cell" title={user.createdAt || ''}>
                              {formatDate(user.createdAt)}
                            </div>
                          </td>
                          <td>
                            <div className="status-cell">
                              <span 
                                className={`status-dot ${user.emailVerified ? 'verified' : 'pending'}`}
                                title={user.emailVerified ? 'Email verificado' : 'Email pendente'}
                              ></span>
                              <span>{user.emailVerified ? 'Verificado' : 'Pendente'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="actions-cell">
                              <button 
                                className="action-btn view-btn"
                                onClick={() => navigate(`/admin/clients/${user.id}`)}
                                title="Ver detalhes do cliente"
                                aria-label="Ver detalhes"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button 
                                className="action-btn edit-btn"
                                onClick={() => navigate(`/admin/clients/${user.id}/edit`)}
                                title="Editar cliente"
                                aria-label="Editar cliente"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              {user.role !== 'admin' && (
                                <button 
                                  className="action-btn promote-btn"
                                  onClick={() => alert(`Tornar ${clientInfo.displayName} administrador`)}
                                  title="Tornar administrador"
                                  aria-label="Promover a administrador"
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
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .admin-clients {
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
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
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
        
        /* Estatísticas */
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
          transition: transform 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 22px;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }
        
        .stat-label {
          color: #6b7280;
          font-size: 13px;
          margin-top: 4px;
        }
        
        /* Filtros */
        .filters-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .filter-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          align-items: flex-end;
          margin-bottom: 16px;
        }
        
        .filter-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
        
        .filter-group label i {
          color: #8b5cf6;
          font-size: 13px;
        }
        
        .search-input {
          position: relative;
        }
        
        .search-input input {
          width: 100%;
          padding: 10px 12px 10px 40px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          color: #1f2937;
          transition: all 0.2s;
        }
        
        .search-input input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        .search-input::before {
          content: '🔍';
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: #9ca3af;
        }
        
        .clear-search {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .clear-search:hover {
          background: #f3f4f6;
          color: #6b7280;
        }
        
        .filter-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .filter-btn {
          padding: 8px 16px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .filter-btn:hover {
          background: #e5e7eb;
        }
        
        .filter-btn.active {
          background: #8b5cf6;
          color: white;
          border-color: #8b5cf6;
        }
        
        .filter-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
          flex-wrap: wrap;
        }
        
        .results-count {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 14px;
        }
        
        .filter-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
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
        
        .filter-tag.role-admin {
          background: #fef3c7;
          color: #92400e;
        }
        
        .filter-tag.role-user {
          background: #d1fae5;
          color: #065f46;
        }
        
        .filter-tag.role-guest {
          background: #e5e7eb;
          color: #4b5563;
        }
        
        .clear-filters {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        
        .clear-filters:hover {
          background: #fee2e2;
        }
        
        /* Tabela */
        .clients-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .section-header h2 {
          margin: 0;
          color: #374151;
          font-size: 18px;
          font-weight: 600;
        }
        
        .export-btn {
          padding: 10px 16px;
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
          font-size: 14px;
        }
        
        .export-btn:hover {
          background: #7c3aed;
        }
        
        .clients-table-container {
          overflow: hidden;
        }
        
        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .clients-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }
        
        .clients-table th {
          text-align: left;
          padding: 12px 16px;
          font-weight: 600;
          color: #6b7280;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e5e7eb;
          white-space: nowrap;
        }
        
        .clients-table td {
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }
        
        .clients-table tr:hover {
          background: #f9fafb;
        }
        
        .client-cell {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 180px;
        }
        
        .client-avatar {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 15px;
          flex-shrink: 0;
        }
        
        .client-avatar:not(.admin):not(.guest) {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }
        
        .client-avatar.admin {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        }
        
        .client-avatar.guest {
          background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
        }
        
        .client-info {
          min-width: 0;
        }
        
        .client-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }
        
        .client-id {
          font-size: 11px;
          color: #9ca3af;
          font-family: monospace;
        }
        
        .contact-info {
          min-width: 180px;
        }
        
        .email {
          color: #4b5563;
          margin-bottom: 6px;
          word-break: break-all;
          font-size: 14px;
        }
        
        .phone {
          font-size: 13px;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .phone i {
          color: #8b5cf6;
          font-size: 12px;
        }
        
        .credits-cell {
          text-align: center;
          min-width: 80px;
        }
        
        .credits-amount {
          font-size: 18px;
          font-weight: 700;
          color: #059669;
          line-height: 1;
        }
        
        .credits-label {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .type-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
          text-align: center;
          min-width: 100px;
        }
        
        .type-badge.admin {
          background: #fef3c7;
          color: #92400e;
        }
        
        .type-badge.user {
          background: #d1fae5;
          color: #065f46;
        }
        
        .type-badge.guest {
          background: #e5e7eb;
          color: #4b5563;
        }
        
        .date-cell {
          color: #6b7280;
          font-size: 13px;
          white-space: nowrap;
        }
        
        .status-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 13px;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .status-dot.verified {
          background: #10b981;
        }
        
        .status-dot.pending {
          background: #f59e0b;
        }
        
        .actions-cell {
          display: flex;
          gap: 8px;
        }
        
        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          color: white;
        }
        
        .view-btn {
          background: #3b82f6;
        }
        
        .view-btn:hover {
          background: #2563eb;
        }
        
        .edit-btn {
          background: #8b5cf6;
        }
        
        .edit-btn:hover {
          background: #7c3aed;
        }
        
        .promote-btn {
          background: #f59e0b;
        }
        
        .promote-btn:hover {
          background: #d97706;
        }
        
        .loading-state,
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .empty-state i {
          font-size: 48px;
          margin-bottom: 20px;
          color: #d1d5db;
        }
        
        .empty-state h3 {
          margin: 0 0 10px 0;
          color: #1f2937;
          font-size: 18px;
        }
        
        .empty-state p {
          margin: 0;
          font-size: 14px;
          max-width: 300px;
          margin: 0 auto;
          line-height: 1.5;
        }
        
        /* ===== RESPONSIVIDADE ===== */
        
        /* Tablet (1024px) */
        @media (max-width: 1024px) {
          .admin-content {
            margin-left: 220px;
            width: calc(100% - 220px);
            padding: 20px;
          }
          
          .filter-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .clients-table {
            min-width: 800px;
          }
        }
        
        /* Mobile Landscape (768px) */
        @media (max-width: 768px) {
          .admin-content {
            margin-left: 60px;
            width: calc(100% - 60px);
            padding: 16px;
          }
          
          .content-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .header-main h1 {
            font-size: 24px;
          }
          
          .date-badge {
            align-self: stretch;
            justify-content: center;
          }
          
          .stats-cards {
            grid-template-columns: 1fr;
          }
          
          .filter-summary {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .filter-tags {
            width: 100%;
          }
          
          .clear-filters {
            align-self: flex-end;
          }
          
          .section-header h2 {
            font-size: 16px;
          }
          
          .export-text {
            display: none;
          }
          
          .client-name {
            max-width: 100px;
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
          
          .stat-card {
            padding: 16px;
          }
          
          .stat-icon {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }
          
          .stat-value {
            font-size: 20px;
          }
          
          .filters-section {
            padding: 16px;
          }
          
          .clients-section {
            padding: 16px;
          }
          
          .clients-table {
            min-width: 700px;
          }
          
          .clients-table th,
          .clients-table td {
            padding: 12px 8px;
            font-size: 13px;
          }
          
          .client-avatar {
            width: 36px;
            height: 36px;
            font-size: 13px;
          }
          
          .type-badge {
            min-width: 80px;
            padding: 4px 8px;
            font-size: 11px;
          }
          
          .action-btn {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }
        }
        
        /* Small Mobile (360px) */
        @media (max-width: 360px) {
          .admin-content {
            padding: 12px;
            padding-top: 70px;
          }
          
          .filter-buttons {
            justify-content: center;
          }
          
          .filter-btn {
            padding: 6px 12px;
            font-size: 12px;
          }
          
          .client-cell {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .client-name {
            max-width: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminClients;