// src/pages/AdminClients.tsx - MELHORADO
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

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  // Estatísticas
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const guestUsers = users.filter(u => u.isGuest).length;
  const regularUsers = users.filter(u => !u.isGuest && u.role === 'user').length;

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="admin-clients">
      <AdminSidebar />
      
      <div className="admin-content">
        <div className="content-header">
          <div>
            <h1>Gerenciar Clientes</h1>
            <p>Total: {totalUsers} clientes • Admin: {adminUsers} • Convidados: {guestUsers}</p>
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
            <div className="search-input">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            
            <div className="filter-group">
              <label>Filtrar por:</label>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${selectedRole === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('all')}
                >
                  Todos
                </button>
                <button 
                  className={`filter-btn ${selectedRole === 'user' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('user')}
                >
                  Clientes
                </button>
                <button 
                  className={`filter-btn ${selectedRole === 'admin' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('admin')}
                >
                  Administradores
                </button>
                <button 
                  className={`filter-btn ${selectedRole === 'guest' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('guest')}
                >
                  Convidados
                </button>
              </div>
            </div>
          </div>
          
          {searchTerm || selectedRole !== 'all' ? (
            <div className="filter-summary">
              <span>Mostrando {filteredUsers.length} de {totalUsers} clientes</span>
              {searchTerm && <span className="filter-tag">Busca: "{searchTerm}"</span>}
              {selectedRole !== 'all' && (
                <span className={`filter-tag role-${selectedRole}`}>
                  Tipo: {
                    selectedRole === 'user' ? 'Clientes' :
                    selectedRole === 'admin' ? 'Administradores' : 'Convidados'
                  }
                </span>
              )}
              <button 
                className="clear-filters"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRole('all');
                }}
              >
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
            >
              <i className="fas fa-file-export"></i> Exportar
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
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="client-cell">
                          <div 
                            className={`client-avatar ${user.role === 'admin' ? 'admin' : user.isGuest ? 'guest' : ''}`}
                            style={{
                              background: user.role === 'admin' ? '#fbbf24' : 
                                        user.isGuest ? '#9ca3af' : '#8b5cf6'
                            }}
                          >
                            {getInitials(user.name)}
                          </div>
                          <div className="client-info">
                            <div className="client-name">{user.name}</div>
                            <div className="client-id">ID: {user.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div className="email">{user.email}</div>
                          {user.phone && (
                            <div className="phone">
                              <i className="fas fa-phone"></i> {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="credits-cell">
                          <div className="credits-amount">{user.credits}</div>
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
                        <div className="date-cell">
                          {formatDate(user.createdAt || '')}
                        </div>
                      </td>
                      <td>
                        <div className="status-cell">
                          <span className={`status-dot ${user.emailVerified ? 'verified' : 'pending'}`}></span>
                          {user.emailVerified ? 'Verificado' : 'Pendente'}
                        </div>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => alert(`Ver detalhes de ${user.name}`)}
                            title="Ver detalhes"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => alert(`Editar ${user.name}`)}
                            title="Editar cliente"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {user.role !== 'admin' && (
                            <button 
                              className="action-btn promote-btn"
                              onClick={() => alert(`Tornar ${user.name} administrador`)}
                              title="Tornar administrador"
                            >
                              <i className="fas fa-crown"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <style >{`
        .admin-clients {
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
        
        .content-header h1 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 32px;
        }
        
        .content-header p {
          margin: 0;
          color: #6b7280;
        }
        
        /* Estatísticas */
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 25px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: transform 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
        }
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }
        
        .stat-label {
          color: #6b7280;
          font-size: 14px;
          margin-top: 4px;
        }
        
        /* Filtros */
        .filters-section {
          background: white;
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .filter-row {
          display: flex;
          gap: 20px;
          align-items: flex-end;
          margin-bottom: 15px;
        }
        
        .search-input {
          flex: 1;
          position: relative;
        }
        
        .search-input i {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }
        
        .search-input input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          font-size: 15px;
          color: #1f2937;
          transition: all 0.2s;
        }
        
        .search-input input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }
        
        .clear-search:hover {
          background: #f3f4f6;
        }
        
        .filter-group {
          flex-shrink: 0;
        }
        
        .filter-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
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
          font-size: 14px;
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
          gap: 12px;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
          flex-wrap: wrap;
        }
        
        .filter-tag {
          background: #f3f4f6;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          color: #4b5563;
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
          margin-left: auto;
          background: none;
          border: none;
          color: #8b5cf6;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          padding: 8px;
        }
        
        /* Tabela */
        .clients-section {
          background: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        
        .section-header h2 {
          margin: 0;
          color: #374151;
          font-size: 20px;
        }
        
        .export-btn {
          padding: 10px 20px;
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
        }
        
        .export-btn:hover {
          background: #7c3aed;
        }
        
        .clients-table-container {
          overflow-x: auto;
        }
        
        .clients-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .clients-table th {
          text-align: left;
          padding: 16px;
          font-weight: 600;
          color: #6b7280;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e5e7eb;
          white-space: nowrap;
        }
        
        .clients-table td {
          padding: 20px 16px;
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
        }
        
        .client-avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
        }
        
        .client-avatar.admin {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%) !important;
        }
        
        .client-avatar.guest {
          background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%) !important;
        }
        
        .client-info {
          min-width: 0;
        }
        
        .client-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }
        
        .client-id {
          font-size: 12px;
          color: #9ca3af;
        }
        
        .contact-info {
          min-width: 200px;
        }
        
        .email {
          color: #4b5563;
          margin-bottom: 4px;
          word-break: break-all;
        }
        
        .phone {
          font-size: 13px;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .credits-cell {
          text-align: center;
        }
        
        .credits-amount {
          font-size: 20px;
          font-weight: 700;
          color: #059669;
          line-height: 1;
        }
        
        .credits-label {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
        }
        
        .type-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
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
          font-size: 14px;
          white-space: nowrap;
        }
        
        .status-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 14px;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
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
          width: 36px;
          height: 36px;
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
        
        .edit-btn {
          background: #8b5cf6;
        }
        
        .promote-btn {
          background: #f59e0b;
        }
        
        .action-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        .loading-state,
        .empty-state {
          text-align: center;
          padding: 60px;
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
        }
        
        @media (max-width: 1024px) {
          .filter-row {
            flex-direction: column;
            align-items: stretch;
          }
        }
        
        @media (max-width: 768px) {
          .admin-content {
            margin-left: 60px;
            padding: 20px;
          }
          
          .stats-cards {
            grid-template-columns: 1fr;
          }
          
          .clients-table th,
          .clients-table td {
            padding: 12px 8px;
          }
          
          .client-cell {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .client-avatar {
            width: 40px;
            height: 40px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminClients;