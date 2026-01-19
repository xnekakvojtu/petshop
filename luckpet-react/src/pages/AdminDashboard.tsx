import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/Admin/AdminSidebar';
import StatsCard from '../components/Admin/StatsCard';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAuth();
  const { stats, loading, fetchStats, bookings, services } = useAdmin();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!isAdmin && !isLoading) {
      navigate('/');
    }
    if (isAdmin) {
      fetchStats();
    }

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isAdmin, isLoading, navigate, fetchStats]);

  if (!isAdmin) return null;

  const getFormattedDate = () => {
    const today = new Date();
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    
    return {
      header: `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]}`,
      weekDay: days[today.getDay()],
      day: today.getDate(),
      month: months[today.getMonth()],
      year: today.getFullYear()
    };
  };

  const dateInfo = getFormattedDate();

  const formatClient = (name?: string, userId?: string) => {
    if (name?.trim()) return name.split(' ')[0];
    if (userId) return `Cliente #${userId.substring(0, 6)}`;
    return 'Cliente';
  };

  const recentBookings = bookings.slice(0, 5).map(b => ({
    ...b,
    clientName: formatClient(b.customerName, b.userId),
    avatarLetter: formatClient(b.customerName, b.userId)[0].toUpperCase(),
    formattedDate: new Date(b.date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    }).replace(/ de /g, '/')
  }));

  const activeServices = services.length;
  const totalRevenue = stats?.monthlyRevenue || 0;
  const conversionRate = stats?.totalBookings 
    ? Math.round((stats.confirmedBookings / stats.totalBookings) * 100) 
    : 0;

  const popularServices = stats?.popularServices?.length 
    ? stats.popularServices.slice(0, 5)
    : services.slice(0, 5).map((s, i) => ({
        serviceName: s.name,
        count: 15 - (i * 2)
      }));

  const metrics = [
    { 
      title: 'Agendamentos Hoje', 
      value: stats?.todayBookings || 0, 
      icon: 'fas fa-calendar-day', 
      color: '#8b5cf6', 
      change: '+12%' 
    },
    { 
      title: 'Pendentes', 
      value: stats?.pendingBookings || 0, 
      icon: 'fas fa-clock', 
      color: '#f59e0b', 
      change: '+5%' 
    },
    { 
      title: 'Confirmados', 
      value: stats?.confirmedBookings || 0, 
      icon: 'fas fa-check-circle', 
      color: '#10b981', 
      change: '+18%' 
    },
    { 
      title: 'Taxa de Conversão', 
      value: `${conversionRate}%`, 
      icon: 'fas fa-chart-line', 
      color: '#3b82f6', 
      change: '+3%' 
    },
    { 
      title: 'Faturamento Mensal', 
      value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: 'fas fa-dollar-sign', 
      color: '#059669', 
      change: '+22%' 
    },
    { 
      title: 'Serviços Cadastrados', 
      value: activeServices, 
      icon: 'fas fa-cut', 
      color: '#ef4444', 
      change: '+2' 
    }
  ];

  const quickActions = [
    { 
      title: 'Agendamentos', 
      desc: 'Gerencie agendamentos', 
      icon: 'fas fa-calendar-plus', 
      path: '/admin/bookings',
      color: '#8b5cf6'
    },
    { 
      title: 'Serviços', 
      desc: 'Adicione serviços', 
      icon: 'fas fa-plus-circle', 
      path: '/admin/services',
      color: '#10b981'
    },
    { 
      title: 'Clientes', 
      desc: 'Visualize clientes', 
      icon: 'fas fa-user-plus', 
      path: '/admin/clients',
      color: '#3b82f6'
    },
    { 
      title: 'Horários', 
      desc: 'Configure horários', 
      icon: 'fas fa-clock', 
      path: '/admin/schedule',
      color: '#f59e0b'
    }
  ];

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      
      <div className="admin-content">
        {isMobile && (
          <div className="mobile-header">
            <div className="mobile-header-content">
              <div className="mobile-title">
                <h1>Dashboard</h1>
                <p>Painel de controle</p>
              </div>
              <button 
                className="mobile-menu-btn"
                onClick={() => {
                  const sidebar = document.querySelector('.admin-sidebar') as HTMLElement;
                  if (sidebar) sidebar.style.transform = 'translateX(0)';
                }}
              >
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>
        )}
        
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div className="header-content">
              <div className="greeting-section">
                <h1>Bem-vindo, Admin!</h1>
                <p className="subtitle">Aqui está o resumo do seu negócio hoje</p>
              </div>
              
              <div className="date-section">
                <div className="date-card">
                  <div className="date-icon">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <div className="date-info">
                    <div className="weekday">{dateInfo.weekDay}</div>
                    <div className="date-display">
                      <span className="day">{dateInfo.day}</span>
                      <span className="month-year">{dateInfo.month} • {dateInfo.year}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="new-booking-btn"
                  onClick={() => navigate('/admin/bookings/new')}
                  aria-label="Criar novo agendamento"
                >
                  <i className="fas fa-plus"></i>
                  <span>Novo Agendamento</span>
                </button>
              </div>
            </div>
          </div>
          
          <section className="metrics-section">
            <div className="section-header">
              <h2 className="section-title">
                <i className="fas fa-chart-bar"></i>
                Métricas do Dia
              </h2>
              <div className="time-filter">
                <span className="active">Hoje</span>
                <span>Semana</span>
                <span>Mês</span>
              </div>
            </div>
            
            <div className="metrics-grid">
              {metrics.map((metric, index) => (
                <StatsCard
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  icon={metric.icon}
                  color={metric.color}
                  change={metric.change}
                />
              ))}
            </div>
          </section>
          
          <div className="main-content-grid">
            <section className="content-card bookings-card">
              <div className="card-header">
                <div className="card-title-section">
                  <h2 className="card-title">
                    <i className="fas fa-history"></i>
                    Agendamentos Recentes
                  </h2>
                  <span className="card-subtitle">Últimos 5 agendamentos</span>
                </div>
                <button 
                  className="card-action-btn"
                  onClick={() => navigate('/admin/bookings')}
                  aria-label="Ver todos os agendamentos"
                >
                  Ver Todos
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
              
              <div className="card-body">
                {loading.bookings ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Carregando agendamentos...</p>
                  </div>
                ) : recentBookings.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-calendar-times"></i>
                    <p>Nenhum agendamento recente</p>
                  </div>
                ) : (
                  <>
                    {!isMobile && (
                      <div className="bookings-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Cliente</th>
                              <th>Pet</th>
                              <th>Serviço</th>
                              <th>Data</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentBookings.map((booking) => (
                              <tr 
                                key={booking.id} 
                                className="booking-row"
                                onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                              >
                                <td>
                                  <div className="client-info">
                                    <div className="client-avatar">
                                      {booking.avatarLetter}
                                    </div>
                                    <div className="client-details">
                                      <div className="client-name">{booking.clientName}</div>
                                      <div className="client-phone">{booking.customerPhone || 'Sem telefone'}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="pet-info">
                                    <span className="pet-name">{booking.petName}</span>
                                    <span className="pet-type">{booking.petType || 'Não informado'}</span>
                                  </div>
                                </td>
                                <td className="service-name">{booking.serviceName}</td>
                                <td>
                                  <div className="booking-date">
                                    <span className="date">{booking.formattedDate}</span>
                                    <span className="time">{booking.time}</span>
                                  </div>
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
                      </div>
                    )}
                    
                    {isMobile && (
                      <div className="mobile-bookings">
                        {recentBookings.map((booking) => (
                          <div 
                            key={booking.id} 
                            className="booking-card-mobile"
                            onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                          >
                            <div className="booking-header-mobile">
                              <div className="client-info-mobile">
                                <div className="client-avatar-mobile">
                                  {booking.avatarLetter}
                                </div>
                                <div className="client-details-mobile">
                                  <div className="client-name-mobile">{booking.clientName}</div>
                                  <div className="client-phone-mobile">{booking.customerPhone || 'Sem telefone'}</div>
                                  <div className="pet-info-mobile">{booking.petName}</div>
                                </div>
                              </div>
                              <span className={`status-badge-mobile status-${booking.status}`}>
                                {booking.status === 'pending' && 'Pendente'}
                                {booking.status === 'confirmed' && 'Confirmado'}
                                {booking.status === 'cancelled' && 'Cancelado'}
                                {booking.status === 'completed' && 'Concluído'}
                              </span>
                            </div>
                            <div className="booking-body-mobile">
                              <div className="service-info-mobile">
                                <i className="fas fa-cut"></i>
                                <span>{booking.serviceName}</span>
                              </div>
                              <div className="date-info-mobile">
                                <i className="far fa-calendar"></i>
                                <span>{booking.formattedDate} • {booking.time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
            
            <section className="content-card services-card">
              <div className="card-header">
                <div className="card-title-section">
                  <h2 className="card-title">
                    <i className="fas fa-fire"></i>
                    Serviços Mais Populares
                  </h2>
                  <span className="card-subtitle">Este mês</span>
                </div>
              </div>
              
              <div className="card-body">
                {loading.stats ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Carregando serviços...</p>
                  </div>
                ) : popularServices.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-chart-bar"></i>
                    <p>Sem dados de serviços</p>
                  </div>
                ) : (
                  <div className="services-list">
                    {popularServices.map((service, index) => (
                      <div 
                        key={index} 
                        className="service-item"
                        onClick={() => navigate('/admin/services')}
                      >
                        <div className="service-rank">
                          <span className="rank-number">#{index + 1}</span>
                          <div className="rank-bar">
                            <div 
                              className="rank-fill"
                              style={{ 
                                width: `${Math.min((service.count / (popularServices[0]?.count || 1)) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="service-info">
                          <div className="service-name">{service.serviceName}</div>
                          <div className="service-count">
                            <i className="fas fa-calendar-check"></i>
                            {service.count} agendamentos
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
          
          <section className="quick-actions-section">
            <h2 className="section-title">
              <i className="fas fa-bolt"></i>
              Ações Rápidas
            </h2>
            
            <div className="actions-grid">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="action-card"
                  onClick={() => navigate(action.path)}
                  style={{ '--action-color': action.color } as React.CSSProperties}
                >
                  <div className="action-icon">
                    <i className={action.icon}></i>
                  </div>
                  <div className="action-content">
                    <h3>{action.title}</h3>
                    <p>{action.desc}</p>
                  </div>
                  <div className="action-arrow">
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
      
      <style>{`
        /* CSS COMPLETO */
        :root {
          --primary: #8b5cf6;
          --primary-light: #a78bfa;
          --secondary: #10b981;
          --warning: #f59e0b;
          --danger: #ef4444;
          --info: #3b82f6;
          --success: #059669;
          --gray-50: #f8fafc;
          --gray-100: #f1f5f9;
          --gray-200: #e2e8f0;
          --gray-300: #cbd5e1;
          --gray-400: #94a3b8;
          --gray-500: #64748b;
          --gray-600: #475569;
          --gray-700: #334155;
          --gray-800: #1e293b;
          --gray-900: #0f172a;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          --shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          --radius-sm: 0.375rem;
          --radius: 0.5rem;
          --radius-md: 0.75rem;
          --radius-lg: 1rem;
          --radius-xl: 1.5rem;
          --radius-full: 9999px;
        }
        
        .admin-dashboard {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: var(--gray-50);
        }
        
        .admin-content {
          flex: 1;
          margin-left: 280px;
          min-height: 100vh;
          width: calc(100% - 280px);
          transition: all 0.3s ease;
        }
        
        .dashboard-main {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: white;
          padding: 1rem;
          box-shadow: var(--shadow-sm);
          border-bottom: 1px solid var(--gray-200);
        }
        
        .mobile-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .mobile-title h1 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
        }
        
        .mobile-title p {
          margin: 0.25rem 0 0 0;
          font-size: 0.75rem;
          color: var(--gray-500);
        }
        
        .mobile-menu-btn {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: var(--radius);
          background: var(--gray-100);
          border: none;
          color: var(--gray-600);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .mobile-menu-btn:hover {
          background: var(--gray-200);
        }
        
        .dashboard-header {
          margin-bottom: 2.5rem;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        
        .greeting-section h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          font-weight: 700;
          color: var(--gray-900);
          line-height: 1.2;
        }
        
        .subtitle {
          margin: 0;
          color: var(--gray-500);
          font-size: 1rem;
        }
        
        .date-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .date-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow);
          border: 1px solid var(--gray-200);
        }
        
        .date-icon {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
        }
        
        .date-info {
          display: flex;
          flex-direction: column;
        }
        
        .weekday {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-500);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .date-display {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        
        .day {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--gray-900);
          line-height: 1;
        }
        
        .month-year {
          font-size: 0.875rem;
          color: var(--gray-500);
          font-weight: 500;
        }
        
        .new-booking-btn {
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
        }
        
        .new-booking-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
        }
        
        .metrics-section {
          margin-bottom: 2.5rem;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .section-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--gray-900);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .section-title i {
          color: var(--primary);
        }
        
        .time-filter {
          display: flex;
          gap: 0.5rem;
          background: var(--gray-100);
          padding: 0.25rem;
          border-radius: var(--radius);
        }
        
        .time-filter span {
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-500);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .time-filter span:hover {
          background: var(--gray-200);
        }
        
        .time-filter span.active {
          background: white;
          color: var(--primary);
          box-shadow: var(--shadow-sm);
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .main-content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2.5rem;
        }
        
        .content-card {
          background: white;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow);
          border: 1px solid var(--gray-200);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .content-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        
        .card-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--gray-200);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .card-title-section {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .card-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .card-subtitle {
          font-size: 0.875rem;
          color: var(--gray-500);
        }
        
        .card-action-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
          transition: all 0.2s;
        }
        
        .card-action-btn:hover {
          background: var(--gray-100);
        }
        
        .card-body {
          padding: 1.5rem 2rem;
        }
        
        .bookings-table {
          overflow-x: auto;
        }
        
        .bookings-table table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .bookings-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: var(--gray-500);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid var(--gray-200);
        }
        
        .bookings-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--gray-100);
        }
        
        .booking-row {
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .booking-row:hover {
          background: var(--gray-50);
        }
        
        .client-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .client-avatar {
          width: 2.5rem;
          height: 2.5rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          flex-shrink: 0;
        }
        
        .client-details {
          display: flex;
          flex-direction: column;
        }
        
        .client-name {
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.125rem;
        }
        
        .client-phone {
          font-size: 0.75rem;
          color: var(--gray-500);
        }
        
        .pet-info {
          display: flex;
          flex-direction: column;
        }
        
        .pet-name {
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.25rem;
        }
        
        .pet-type {
          font-size: 0.75rem;
          color: var(--gray-500);
          background: var(--gray-100);
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-full);
          display: inline-block;
        }
        
        .service-name {
          font-weight: 500;
          color: var(--gray-700);
        }
        
        .booking-date {
          display: flex;
          flex-direction: column;
        }
        
        .date {
          font-weight: 500;
          color: var(--gray-900);
        }
        
        .time {
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-top: 0.25rem;
        }
        
        .status-badge {
          padding: 0.375rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-block;
          text-align: center;
          min-width: 6rem;
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
        
        .mobile-bookings {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .booking-card-mobile {
          padding: 1rem;
          background: var(--gray-50);
          border-radius: var(--radius);
          border: 1px solid var(--gray-200);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .booking-card-mobile:hover {
          background: white;
          border-color: var(--primary);
          transform: translateX(4px);
        }
        
        .booking-header-mobile {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }
        
        .client-info-mobile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .client-avatar-mobile {
          width: 2.25rem;
          height: 2.25rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        .client-details-mobile {
          display: flex;
          flex-direction: column;
        }
        
        .client-name-mobile {
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.125rem;
        }
        
        .client-phone-mobile {
          font-size: 0.7rem;
          color: var(--gray-500);
          margin-bottom: 0.125rem;
        }
        
        .pet-info-mobile {
          font-size: 0.75rem;
          color: var(--gray-400);
        }
        
        .status-badge-mobile {
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.625rem;
          font-weight: 600;
        }
        
        .booking-body-mobile {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .service-info-mobile,
        .date-info-mobile {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--gray-600);
          font-size: 0.875rem;
        }
        
        .service-info-mobile i,
        .date-info-mobile i {
          color: var(--primary);
          font-size: 0.75rem;
          width: 1rem;
        }
        
        .services-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .service-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem;
          background: var(--gray-50);
          border-radius: var(--radius);
          border: 1px solid var(--gray-200);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .service-item:hover {
          background: white;
          border-color: var(--primary);
          transform: translateX(4px);
        }
        
        .service-rank {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          flex-shrink: 0;
        }
        
        .rank-number {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary);
          background: var(--gray-100);
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius);
        }
        
        .rank-bar {
          width: 0.25rem;
          height: 2rem;
          background: var(--gray-200);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        
        .rank-fill {
          height: 100%;
          background: linear-gradient(to top, var(--primary), var(--primary-light));
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
        }
        
        .service-info {
          flex: 1;
        }
        
        .service-name {
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.25rem;
        }
        
        .service-count {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          color: var(--gray-500);
        }
        
        .service-count i {
          color: var(--primary);
          font-size: 0.625rem;
        }
        
        .quick-actions-section {
          margin-top: 2rem;
        }
        
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }
        
        .action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--gray-200);
          cursor: pointer;
          text-align: left;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .action-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--action-color, var(--primary));
        }
        
        .action-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--action-color, var(--primary));
        }
        
        .action-icon {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, var(--action-color, var(--primary)) 0%, 
                    color-mix(in srgb, var(--action-color, var(--primary)) 70%, white) 100%);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        
        .action-content {
          flex: 1;
        }
        
        .action-content h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-900);
        }
        
        .action-content p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--gray-500);
          line-height: 1.4;
        }
        
        .action-arrow {
          color: var(--gray-400);
          transition: transform 0.3s ease;
        }
        
        .action-card:hover .action-arrow {
          color: var(--action-color, var(--primary));
          transform: translateX(4px);
        }
        
        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          text-align: center;
        }
        
        .spinner {
          width: 3rem;
          height: 3rem;
          border: 3px solid var(--gray-200);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading-state p,
        .empty-state p {
          margin: 0;
          color: var(--gray-500);
          font-size: 0.875rem;
        }
        
        .empty-state i {
          font-size: 3rem;
          color: var(--gray-300);
          margin-bottom: 1rem;
        }
        
        @media (max-width: 1200px) {
          .admin-content {
            margin-left: 240px;
            width: calc(100% - 240px);
          }
          
          .main-content-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 1024px) {
          .admin-content {
            margin-left: 200px;
            width: calc(100% - 200px);
          }
          
          .dashboard-main {
            padding: 1.5rem;
          }
          
          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .date-section {
            width: 100%;
            justify-content: space-between;
          }
        }
        
        @media (max-width: 768px) {
          .mobile-header {
            display: block;
          }
          
          .admin-content {
            margin-left: 0;
            width: 100%;
            padding-top: 5rem;
          }
          
          .dashboard-main {
            padding: 1rem;
          }
          
          .date-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .new-booking-btn {
            justify-content: center;
          }
          
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          
          .actions-grid {
            grid-template-columns: 1fr;
          }
          
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .time-filter {
            align-self: stretch;
            justify-content: center;
          }
          
          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .card-action-btn {
            align-self: flex-end;
          }
        }
        
        @media (max-width: 480px) {
          .dashboard-main {
            padding: 0.75rem;
          }
          
          .greeting-section h1 {
            font-size: 1.5rem;
          }
          
          .date-card {
            padding: 0.75rem 1rem;
          }
          
          .date-icon {
            width: 2.5rem;
            height: 2.5rem;
            font-size: 1rem;
          }
          
          .day {
            font-size: 1.5rem;
          }
          
          .card-header,
          .card-body {
            padding: 1rem;
          }
          
          .action-card {
            padding: 1rem;
          }
          
          .action-icon {
            width: 2.5rem;
            height: 2.5rem;
            font-size: 1rem;
          }
        }
        
        @media (max-width: 360px) {
          .dashboard-main {
            padding: 0.5rem;
          }
          
          .date-card {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }
          
          .date-display {
            justify-content: center;
          }
          
          .new-booking-btn span {
            display: none;
          }
          
          .new-booking-btn i {
            margin: 0;
          }
          
          .bookings-table th,
          .bookings-table td {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;