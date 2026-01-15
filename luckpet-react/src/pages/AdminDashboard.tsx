// src/pages/AdminDashboard.tsx - MELHORADO
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/Admin/AdminSidebar';
import StatsCard from '../components/Admin/StatsCard';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAuth();
  const { stats, loading, fetchStats, bookings, services, users } = useAdmin();

  useEffect(() => {
    if (!isAdmin && !isLoading) {
      navigate('/');
    }
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, isLoading, navigate, fetchStats]);

  if (!isAdmin) {
    return null;
  }

  // Calcular dados adicionais
  const recentBookings = bookings.slice(0, 5);
  const activeServices = services.filter(s => s.active).length;
  const totalRevenue = stats?.monthlyRevenue || 0;
  const conversionRate = stats?.totalBookings ? 
    Math.round((stats.confirmedBookings / stats.totalBookings) * 100) : 0;

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      
      <div className="admin-content">
        <div className="content-header">
          <div className="header-with-date">
            <div>
              <h1>Dashboard Admin</h1>
              <p>Bem-vindo ao painel de controle</p>
            </div>
            <div className="current-date">
              <i className="fas fa-calendar-day"></i>
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>
        
        {/* Cards de Estatísticas */}
        <div className="dashboard-stats">
          <div className="stats-grid">
            <StatsCard
              title="Agendamentos Hoje"
              value={stats?.todayBookings || 0}
              icon="fas fa-calendar-day"
              color="#8b5cf6"
              change="+12%"
            />
            <StatsCard
              title="Agendamentos Pendentes"
              value={stats?.pendingBookings || 0}
              icon="fas fa-clock"
              color="#f59e0b"
              change="+5%"
            />
            <StatsCard
              title="Agendamentos Confirmados"
              value={stats?.confirmedBookings || 0}
              icon="fas fa-check-circle"
              color="#10b981"
              change="+18%"
            />
            <StatsCard
              title="Taxa de Conversão"
              value={`${conversionRate}%`}
              icon="fas fa-chart-line"
              color="#3b82f6"
              change="+3%"
            />
            <StatsCard
              title="Faturamento Mensal"
              value={`R$ ${totalRevenue.toLocaleString('pt-BR')}`}
              icon="fas fa-dollar-sign"
              color="#059669"
              change="+22%"
            />
            <StatsCard
              title="Serviços Ativos"
              value={activeServices}
              icon="fas fa-cut"
              color="#ef4444"
              change="+2"
            />
          </div>
        </div>
        
        <div className="dashboard-sections">
          {/* Seção de Agendamentos Recentes */}
          <div className="section">
            <div className="section-header">
              <h2>Agendamentos Recentes</h2>
              <button 
                className="view-all-btn"
                onClick={() => navigate('/admin/bookings')}
              >
                Ver Todos <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            <div className="recent-bookings">
              {loading.bookings ? (
                <div className="loading">Carregando...</div>
              ) : recentBookings.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-calendar-times"></i>
                  <p>Nenhum agendamento recente</p>
                </div>
              ) : (
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Serviço</th>
                      <th>Data</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="clickable" onClick={() => navigate(`/admin/bookings`)}>
                        <td>
                          <div className="client-cell">
                            <div className="avatar-circle">{booking.customerName?.[0] || 'C'}</div>
                            <div>
                              <div className="client-name">{booking.customerName || booking.userId}</div>
                              <div className="client-pet">{booking.petName}</div>
                            </div>
                          </div>
                        </td>
                        <td>{booking.serviceName}</td>
                        <td>
                          {new Date(booking.date).toLocaleDateString('pt-BR')}
                          <div className="time">{booking.time}</div>
                        </td>
                        <td>
                          <span className={`status-badge status-${booking.status}`}>
                            {booking.status === 'pending' && 'Pendente'}
                            {booking.status === 'confirmed' && 'Confirmado'}
                            {booking.status === 'cancelled' && 'Cancelado'}
                            {booking.status === 'completed' && 'Concluído'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
          {/* Seção de Serviços Populares */}
          <div className="section">
            <div className="section-header">
              <h2>Serviços Mais Populares</h2>
            </div>
            {loading.stats ? (
              <div className="loading">Carregando...</div>
            ) : stats?.popularServices?.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-chart-bar"></i>
                <p>Sem dados de serviços</p>
              </div>
            ) : (
              <div className="popular-services">
                {stats?.popularServices?.map((service, index) => (
                  <div key={index} className="service-rank">
                    <div className="rank-number">{index + 1}</div>
                    <div className="service-details">
                      <div className="service-name">{service.serviceName}</div>
                      <div className="service-count">{service.count} agendamentos</div>
                    </div>
                    <div className="service-bar">
                      <div 
                        className="bar-fill"
                        style={{ 
                          width: `${(service.count / (stats.popularServices?.[0]?.count || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Ações Rápidas */}
        <div className="quick-actions-section">
          <h2>Ações Rápidas</h2>
          <div className="actions-grid">
            <button onClick={() => navigate('/admin/bookings')} className="action-card">
              <div className="action-icon">
                <i className="fas fa-calendar-plus"></i>
              </div>
              <div className="action-content">
                <h3>Gerenciar Agendamentos</h3>
                <p>Confirme, cancele ou edite agendamentos</p>
              </div>
              <i className="fas fa-arrow-right action-arrow"></i>
            </button>
            
            <button onClick={() => navigate('/admin/services')} className="action-card">
              <div className="action-icon">
                <i className="fas fa-plus-circle"></i>
              </div>
              <div className="action-content">
                <h3>Adicionar Serviço</h3>
                <p>Crie novos serviços para o pet shop</p>
              </div>
              <i className="fas fa-arrow-right action-arrow"></i>
            </button>
            
            <button onClick={() => navigate('/admin/clients')} className="action-card">
              <div className="action-icon">
                <i className="fas fa-user-plus"></i>
              </div>
              <div className="action-content">
                <h3>Ver Clientes</h3>
                <p>Visualize todos os clientes cadastrados</p>
              </div>
              <i className="fas fa-arrow-right action-arrow"></i>
            </button>
            
            <button onClick={() => navigate('/admin/schedule')} className="action-card">
              <div className="action-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="action-content">
                <h3>Configurar Horários</h3>
                <p>Defina horários de funcionamento</p>
              </div>
              <i className="fas fa-arrow-right action-arrow"></i>
            </button>
          </div>
        </div>
      </div>
      
      <style >{`
        .admin-dashboard {
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
          margin-bottom: 30px;
        }
        
        .header-with-date {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .header-with-date h1 {
          margin: 0 0 10px 0;
          color: #1f2937;
          font-size: 32px;
        }
        
        .header-with-date p {
          margin: 0;
          color: #6b7280;
        }
        
        .current-date {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: white;
          border-radius: 12px;
          color: #6b7280;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .current-date i {
          color: #8b5cf6;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .dashboard-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .section {
          background: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .section h2 {
          margin: 0;
          color: #374151;
          font-size: 20px;
        }
        
        .view-all-btn {
          background: none;
          border: none;
          color: #8b5cf6;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        
        .view-all-btn:hover {
          background: #f3f4f6;
        }
        
        /* Tabela Simples */
        .simple-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .simple-table th {
          text-align: left;
          padding: 12px 16px;
          font-weight: 600;
          color: #6b7280;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .simple-table td {
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
          color: #4b5563;
          font-size: 14px;
        }
        
        .simple-table tr:last-child td {
          border-bottom: none;
        }
        
        .simple-table tr.clickable {
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .simple-table tr.clickable:hover {
          background: #f9fafb;
        }
        
        .client-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .avatar-circle {
          width: 36px;
          height: 36px;
          background: #8b5cf6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }
        
        .client-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
        }
        
        .client-pet {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }
        
        .time {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 2px;
        }
        
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }
        
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        
        .status-confirmed {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .status-completed {
          background: #dbeafe;
          color: #1e40af;
        }
        
        /* Serviços Populares */
        .popular-services {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .service-rank {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 10px;
          transition: transform 0.2s;
        }
        
        .service-rank:hover {
          transform: translateX(5px);
        }
        
        .rank-number {
          width: 32px;
          height: 32px;
          background: #8b5cf6;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
        }
        
        .service-details {
          flex: 1;
          min-width: 0;
        }
        
        .service-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
          font-size: 14px;
        }
        
        .service-count {
          font-size: 12px;
          color: #6b7280;
        }
        
        .service-bar {
          flex: 1;
          max-width: 100px;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }
        
        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #7c3aed);
          border-radius: 3px;
        }
        
        /* Ações Rápidas */
        .quick-actions-section {
          background: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        
        .quick-actions-section h2 {
          margin: 0 0 20px 0;
          color: #374151;
          font-size: 20px;
        }
        
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .action-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border: 2px solid #f3f4f6;
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          transition: all 0.3s;
        }
        
        .action-card:hover {
          border-color: #8b5cf6;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.15);
        }
        
        .action-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }
        
        .action-content {
          flex: 1;
        }
        
        .action-content h3 {
          margin: 0 0 6px 0;
          font-size: 16px;
          color: #1f2937;
        }
        
        .action-content p {
          margin: 0;
          font-size: 13px;
          color: #6b7280;
          line-height: 1.4;
        }
        
        .action-arrow {
          color: #9ca3af;
          transition: transform 0.2s;
        }
        
        .action-card:hover .action-arrow {
          color: #8b5cf6;
          transform: translateX(4px);
        }
        
        .loading,
        .empty-state {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }
        
        .empty-state i {
          font-size: 48px;
          margin-bottom: 20px;
          color: #d1d5db;
        }
        
        @media (max-width: 1024px) {
          .dashboard-sections {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .admin-content {
            margin-left: 60px;
            padding: 20px;
          }
          
          .header-with-date {
            flex-direction: column;
          }
          
          .header-with-date h1 {
            font-size: 24px;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;