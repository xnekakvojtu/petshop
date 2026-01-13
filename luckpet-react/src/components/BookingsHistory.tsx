// src/components/BookingsHistory.tsx - VERSÃO COM MAIS FALLBACKS
import React, { useState, useEffect, useCallback } from 'react';
import { getUserBookings, cancelBooking, updatePaymentStatus } from '../firebase/bookings';
import { Booking, PaymentMethod } from '../types';
import { useAuth } from '../hooks/useAuth';

const BookingsHistory: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Mapeamento COMPLETO dos serviços
  const serviceDetails = {
    // IDs específicos
    'banho_completo': {
      title: 'Banho Completo',
      description: 'Higienização completa e cuidados especiais',
      icon: 'fas fa-bath',
      color: '#3B82F6',
      features: [
        'Banho higiênico',
        'Secagem profissional', 
        'Corte de unhas',
        'Limpeza de ouvidos'
      ]
    },
    'banho_higienico': {
      title: 'Banho Higiênico',
      description: 'Limpeza básica e essencial',
      icon: 'fas fa-bath',
      color: '#3B82F6',
      features: [
        'Banho higiênico',
        'Secagem rápida',
        'Limpeza básica'
      ]
    },
    'banho': {
      title: 'Banho Completo',
      description: 'Higienização completa e cuidados especiais',
      icon: 'fas fa-bath',
      color: '#3B82F6',
      features: [
        'Banho higiênico',
        'Secagem profissional', 
        'Corte de unhas',
        'Limpeza de ouvidos'
      ]
    },
    
    'tosa_premium': {
      title: 'Tosa Premium',
      description: 'Modelagem e estética para seu pet',
      icon: 'fas fa-cut',
      color: '#8B5CF6',
      features: [
        'Tosa na máquina',
        'Modelagem personalizada',
        'Estética completa',
        'Hidratação'
      ]
    },
    'tosa_maquina': {
      title: 'Tosa na Máquina',
      description: 'Tosa prática e eficiente',
      icon: 'fas fa-cut',
      color: '#8B5CF6',
      features: ['Tosa na máquina', 'Acabamento profissional', 'Limpeza pós-tosa']
    },
    'tosa': {
      title: 'Tosa Premium',
      description: 'Modelagem e estética para seu pet',
      icon: 'fas fa-cut',
      color: '#8B5CF6',
      features: [
        'Tosa na máquina',
        'Modelagem personalizada',
        'Estética completa',
        'Hidratação'
      ]
    },
    
    'consulta_veterinaria': {
      title: 'Consulta Veterinária',
      description: 'Cuidados médicos especializados',
      icon: 'fas fa-stethoscope',
      color: '#10B981',
      features: [
        'Check-up completo',
        'Vacinação',
        'Exames laboratoriais',
        'Prescrição de medicamentos'
      ]
    },
    'checkup_completo': {
      title: 'Check-up Completo',
      description: 'Avaliação de saúde completa',
      icon: 'fas fa-stethoscope',
      color: '#10B981',
      features: ['Check-up completo', 'Avaliação clínica', 'Recomendações médicas']
    },
    'consulta': {
      title: 'Consulta Veterinária',
      description: 'Cuidados médicos especializados',
      icon: 'fas fa-stethoscope',
      color: '#10B981',
      features: [
        'Check-up completo',
        'Vacinação',
        'Exames laboratoriais',
        'Prescrição de medicamentos'
      ]
    },
    
    'corte_unhas': {
      title: 'Corte de Unhas',
      description: 'Cuidados com as unhas do pet',
      icon: 'fas fa-cut',
      color: '#F59E0B',
      features: ['Corte de unhas profissional', 'Lixamento', 'Controle de sangramento']
    },
    'limpeza_ouvidos': {
      title: 'Limpeza de Ouvidos',
      description: 'Higienização auricular',
      icon: 'fas fa-ear-deaf',
      color: '#F59E0B',
      features: ['Limpeza de ouvidos profunda', 'Inspeção auditiva', 'Aplicação de produtos']
    },
    'hidratação': {
      title: 'Hidratação',
      description: 'Hidratação profunda da pelagem',
      icon: 'fas fa-spa',
      color: '#F59E0B',
      features: ['Hidratação profunda', 'Brilho da pelagem', 'Nutrição dos pelos']
    },
    
    // Serviços extras
    'secagem_profissional': {
      title: 'Secagem Profissional',
      description: 'Secagem completa e cuidadosa',
      icon: 'fas fa-wind',
      color: '#3B82F6',
      features: ['Secagem profissional', 'Cuidados com a pelagem', 'Finalização']
    },
    'modelagem_personalizada': {
      title: 'Modelagem Personalizada',
      description: 'Tosa com design exclusivo',
      icon: 'fas fa-cut',
      color: '#8B5CF6',
      features: ['Modelagem personalizada', 'Design exclusivo', 'Estética completa']
    },
    'exames_laboratoriais': {
      title: 'Exames Laboratoriais',
      description: 'Análises clínicas e diagnósticos',
      icon: 'fas fa-vial',
      color: '#10B981',
      features: ['Exames laboratoriais', 'Análises clínicas', 'Laudo detalhado']
    },
    'prescricao_medicamentos': {
      title: 'Prescrição de Medicamentos',
      description: 'Prescrição e orientação médica',
      icon: 'fas fa-pills',
      color: '#10B981',
      features: ['Prescrição de medicamentos', 'Orientação médica', 'Receituário']
    },
    'vacinação': {
      title: 'Vacinação',
      description: 'Aplicação de vacinas essenciais',
      icon: 'fas fa-syringe',
      color: '#10B981',
      features: ['Vacinação completa', 'Controle de carteirinha', 'Monitoramento pós-vacina']
    },
    
    'default': {
      title: 'Serviço Especial',
      description: 'Serviço personalizado para seu pet',
      icon: 'fas fa-paw',
      color: '#7C3AED',
      features: ['Atendimento personalizado', 'Cuidados especiais', 'Profissional qualificado']
    }
  };

  // Carregar agendamentos
  const loadBookings = useCallback(async () => {
    if (!user) {
      setError('Faça login para ver agendamentos');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const userBookings = await getUserBookings(user.id);
      
      const sortedBookings = userBookings.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setBookings(sortedBookings);
      
    } catch (err: any) {
      console.error('Erro ao carregar agendamentos:', err);
      
      if (err.message?.includes('index') || err.code === 'failed-precondition') {
        setError('O sistema de agendamentos está sendo configurado. Tente novamente em alguns segundos.');
      } else {
        setError('Erro ao carregar agendamentos. Tente novamente.');
      }
      
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (mounted && user) {
        await loadBookings();
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [loadBookings, user]);

  // Cancelar agendamento
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

    try {
      await cancelBooking(bookingId);
      
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' as const }
          : booking
      ));
      
      window.dispatchEvent(new CustomEvent('notification', {
        detail: { 
          message: 'Agendamento cancelado com sucesso!', 
          type: 'success' 
        }
      }));
    } catch (err: any) {
      console.error('Erro ao cancelar:', err);
      window.dispatchEvent(new CustomEvent('notification', {
        detail: { 
          message: 'Erro ao cancelar agendamento', 
          type: 'error' 
        }
      }));
    }
  };

  // Formatar data
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Hoje';
      }
      if (date.toDateString() === tomorrow.toDateString()) {
        return 'Amanhã';
      }
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Obter detalhes do serviço - AGORA COM MAIS FALLBACKS INTELIGENTES
  const getServiceDetails = (serviceId: string, booking: Booking) => {
    // Se o serviceName já tem o nome completo, use ele
    if (booking.serviceName) {
      const serviceKey = Object.keys(serviceDetails).find(key => 
        serviceDetails[key as keyof typeof serviceDetails].title === booking.serviceName
      );
      
      if (serviceKey) {
        const detailedService = serviceDetails[serviceKey as keyof typeof serviceDetails];
        return {
          title: detailedService.title,
          description: detailedService.description,
          icon: detailedService.icon,
          color: detailedService.color,
          features: detailedService.features
        };
      }
    }
    
    // Tenta pegar pelo serviceId
    const serviceKey = serviceId as keyof typeof serviceDetails;
    const detailedService = serviceDetails[serviceKey];
    
    if (detailedService) {
      return {
        title: detailedService.title,
        description: detailedService.description,
        icon: detailedService.icon,
        color: detailedService.color,
        features: detailedService.features
      };
    }
    
    // Fallback baseado no nome do serviço no booking
    const serviceName = booking.serviceName || '';
    
    if (serviceName.includes('Banho') || serviceName.includes('banho')) {
      return serviceDetails['banho'];
    }
    
    if (serviceName.includes('Tosa') || serviceName.includes('tosa')) {
      return serviceDetails['tosa'];
    }
    
    if (serviceName.includes('Consulta') || serviceName.includes('consulta') || serviceName.includes('Veterinária') || serviceName.includes('veterinária')) {
      return serviceDetails['consulta'];
    }
    
    // Fallback genérico baseado no serviceId
    if (serviceId.includes('banho')) {
      return serviceDetails['banho'];
    }
    
    if (serviceId.includes('tosa')) {
      return serviceDetails['tosa'];
    }
    
    if (serviceId.includes('consulta') || serviceId.includes('veterinaria')) {
      return serviceDetails['consulta'];
    }
    
    // Último fallback
    return serviceDetails['default'];
  };

  // Status com cores
  const getStatusConfig = (status: Booking['status']) => {
    const configs = {
      pending: { text: 'Pendente', color: '#F59E0B', bg: '#FEF3C7' },
      confirmed: { text: 'Confirmado', color: '#10B981', bg: '#D1FAE5' },
      cancelled: { text: 'Cancelado', color: '#EF4444', bg: '#FEE2E2' },
      completed: { text: 'Concluído', color: '#6B7280', bg: '#F3F4F6' }
    };
    return configs[status] || configs.pending;
  };

  // Método de pagamento
  const getPaymentMethod = (method?: PaymentMethod) => {
    const methods: Record<string, { text: string, icon: string }> = {
      pix: { text: 'PIX', icon: 'fas fa-qrcode' },
      credit_card: { text: 'Cartão', icon: 'fas fa-credit-card' },
      debit_card: { text: 'Débito', icon: 'fas fa-credit-card' },
      money: { text: 'Dinheiro', icon: 'fas fa-money-bill-wave' },
      luckcoins: { text: 'LuckCoins', icon: 'fas fa-coins' }
    };
    return methods[method || ''] || { text: 'Não definido', icon: 'fas fa-question-circle' };
  };

  // Render loading
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Carregando agendamentos...</p>
      </div>
    );
  }

  // Render error
  if (error && bookings.length === 0) {
    return (
      <div className="error-state">
        <svg className="error-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5">
          <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3>Ops! Algo deu errado</h3>
        <p>{error}</p>
        <button 
          className="retry-btn"
          onClick={loadBookings}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Render empty
  if (!loading && bookings.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5">
          <path d="M8 7V3m8 4V3M7 11h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3>Nenhum agendamento</h3>
        <p>Agende seu primeiro serviço para seu pet!</p>
        <button 
          className="new-booking-btn"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('openBookingModal', {
              detail: { serviceType: 'banho_completo' }
            }));
          }}
        >
          Agendar Serviço
        </button>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      {/* Badge de Recentes */}
      <div className="recent-badge">
        <span className="recent-dot"></span>
        <span className="recent-text">Agendamentos Recentes</span>
      </div>

      {/* Lista de agendamentos */}
      <div className="bookings-list">
        {bookings.map((booking) => {
          const service = getServiceDetails(booking.serviceId, booking);
          const statusConfig = getStatusConfig(booking.status);
          const paymentMethod = getPaymentMethod(booking.paymentMethod);

          return (
            <div key={booking.id} className="booking-card">
              {/* Header do card */}
              <div className="card-header">
                <div className="service-info">
                  <div className="service-icon" style={{ backgroundColor: `${service.color}15` }}>
                    <i className={service.icon} style={{ color: service.color }}></i>
                  </div>
                  <div className="service-details">
                    <h3>{service.title}</h3>
                    <div className="service-meta">
                      <span className="date-time">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 6v6l4 2"/>
                        </svg>
                        {formatDate(booking.date)} • {booking.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="status-badge" style={{ 
                  backgroundColor: statusConfig.bg,
                  color: statusConfig.color
                }}>
                  {statusConfig.text}
                </div>
              </div>

              {/* Detalhes ESPECÍFICOS do serviço */}
              <div className="service-features">
                <h4>Este serviço inclui:</h4>
                <div className="features-grid">
                  {service.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <div className="feature-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={service.color} strokeWidth="2.5">
                          <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="feature-text">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detalhes */}
              <div className="card-details">
                <div className="detail-row">
                  <span className="detail-label">Pet:</span>
                  <span className="detail-value">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 1v3M10 1v3M14 1v3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {booking.petName} ({booking.petType})
                    {booking.petAge && booking.petAge > 0 && ` • ${booking.petAge} ano(s)`}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Profissional:</span>
                  <span className="detail-value">
                    <i className="fas fa-user-md"></i>
                    {booking.professional || 'A definir'}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Pagamento:</span>
                  <span className="detail-value">
                    <i className={paymentMethod.icon}></i>
                    {paymentMethod.text}
                    {booking.paymentStatus === 'pending' && booking.paymentMethod !== 'luckcoins' && (
                      <span className="payment-pending"> • Aguardando</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Valor e Ações */}
              <div className="card-footer">
                <div className="price-section">
                  <span className="price-label">Valor:</span>
                  <span className="price-value">R$ {booking.servicePrice.toFixed(2)}</span>
                  {booking.paymentMethod === 'luckcoins' && (
                    <span className="luckcoins-badge">
                      <i className="fas fa-coins"></i>
                      {booking.servicePrice} LC
                    </span>
                  )}
                </div>

                <div className="actions">
                  {booking.status === 'pending' && (
                    <button 
                      className="action-btn cancel-btn"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancelar
                    </button>
                  )}
                  
                  {booking.status === 'pending' && 
                   booking.paymentStatus === 'pending' && 
                   booking.paymentMethod !== 'luckcoins' && (
                    <button 
                      className="action-btn pay-btn"
                      onClick={() => updatePaymentStatus(booking.id, 'paid').then(() => loadBookings())}
                    >
                      Marcar Pago
                    </button>
                  )}
                  
                  <button 
                    className="action-btn details-btn"
                    onClick={() => {
                      alert(`Detalhes do agendamento:\n\n` +
                            `Pet: ${booking.petName}\n` +
                            `Serviço: ${service.title}\n` +
                            `Descrição: ${service.description}\n` +
                            `Inclui: ${service.features.join(', ')}\n` +
                            `Data: ${formatDate(booking.date)} às ${booking.time}\n` +
                            `Status: ${statusConfig.text}\n` +
                            `Pagamento: ${paymentMethod.text}`);
                    }}
                  >
                    Detalhes
                  </button>
                </div>
              </div>

              {/* Observações */}
              {booking.notes && (
                <div className="notes-section">
                  <div className="notes-header">
                    <i className="fas fa-sticky-note"></i>
                    <span>Observações</span>
                  </div>
                  <p className="notes-content">{booking.notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botão para novo agendamento */}
      <div className="new-booking-section">
        <button 
          className="primary-btn"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('openBookingModal', {
              detail: { serviceType: 'banho_completo' }
            }));
          }}
        >
          <i className="fas fa-plus"></i>
          Agendar Novo Serviço
        </button>
      </div>

      <style >{`
        .bookings-container {
          width: 100%;
          animation: fadeIn 0.4s ease;
          padding: 20px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Badge de Recentes Global */
        .recent-badge {
  margin-bottom: 20px;
}

.recent-text {
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #6D28D9;
}


        /* Lista de agendamentos */
        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 40px;
        }

        /* Booking Card */
        .booking-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #F0F0F0;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .booking-card:hover {
          border-color: #E8E0FF;
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.08);
        }

        /* Card Header */
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px;
          border-bottom: 1px solid #F0F0F0;
        }

        .service-info {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .service-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .service-details {
          flex: 1;
        }

        .service-details h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1A1A1A;
          margin: 0 0 8px 0;
        }

        .service-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 14px;
        }

        .date-time {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .date-time svg {
          color: #7C3AED;
        }

        .status-badge {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }

        /* Service Features */
        .service-features {
          padding: 20px 24px;
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          border-bottom: 1px solid #F0F0F0;
        }

        .service-features h4 {
          font-size: 15px;
          font-weight: 600;
          color: #475569;
          margin: 0 0 12px 0;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .feature-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          border: 1px solid #E2E8F0;
        }

        .feature-text {
          font-size: 14px;
          color: #475569;
          line-height: 1.4;
          text-transform: lowercase;
        }

        .feature-text:first-letter {
          text-transform: uppercase;
        }

        /* Card Details */
        .card-details {
          padding: 20px 24px;
          background: #FAFAFA;
          border-bottom: 1px solid #F0F0F0;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .detail-label {
          font-size: 13px;
          color: #666;
          font-weight: 500;
          min-width: 100px;
        }

        .detail-value {
          font-size: 15px;
          color: #1A1A1A;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .detail-value svg,
        .detail-value i {
          color: #7C3AED;
        }

        .payment-pending {
          color: #F59E0B;
          font-weight: 500;
        }

        /* Card Footer */
        .card-footer {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .price-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .price-label {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .price-value {
          font-size: 20px;
          font-weight: 700;
          color: #10B981;
        }

        .luckcoins-badge {
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Actions */
        .actions {
          display: flex;
          gap: 10px;
        }

        .action-btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .cancel-btn {
          background: #FEE2E2;
          color: #DC2626;
        }

        .cancel-btn:hover {
          background: #FECACA;
        }

        .pay-btn {
          background: #D1FAE5;
          color: #065F46;
        }

        .pay-btn:hover {
          background: #A7F3D0;
        }

        .details-btn {
          background: #F3F4F6;
          color: #4B5563;
        }

        .details-btn:hover {
          background: #E5E7EB;
        }

        /* Notes */
        .notes-section {
          padding: 20px 24px;
          background: #FFFBF0;
          border-top: 1px solid #FEF3C7;
        }

        .notes-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #92400E;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .notes-content {
          margin: 0;
          color: #92400E;
          font-size: 14px;
          line-height: 1.5;
        }

        /* New Booking Button */
        .new-booking-section {
          text-align: center;
          padding-top: 40px;
          border-top: 1px solid #F0F0F0;
        }

        .primary-btn {
          background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
          background: linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%);
        }

        /* States */
        .loading-state,
        .error-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 3px solid #F3F4F6;
          border-top-color: #7C3AED;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        .loading-state p {
          color: #666;
          font-size: 16px;
        }

        .error-state h3,
        .empty-state h3 {
          font-size: 20px;
          color: #1A1A1A;
          margin: 20px 0 8px 0;
        }

        .error-state p,
        .empty-state p {
          color: #666;
          font-size: 15px;
          margin: 0 0 20px 0;
          max-width: 400px;
        }

        .retry-btn {
          background: #7C3AED;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .retry-btn:hover {
          background: #6D28D9;
        }

        .new-booking-btn {
          background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .new-booking-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .bookings-container {
            padding: 16px;
          }

          .recent-badge {
            margin-bottom: 16px;
            padding: 8px 12px;
          }

          .card-header {
            flex-direction: column;
            gap: 16px;
            padding: 20px;
          }

          .card-footer {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
            padding: 16px;
          }

          .price-section {
            justify-content: space-between;
          }

          .actions {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
          }

          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .detail-label {
            min-width: auto;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .primary-btn {
            width: 100%;
            padding: 14px 24px;
          }
        }

        @media (max-width: 480px) {
          .service-info {
            flex-direction: column;
            gap: 12px;
          }

          .service-icon {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }

          .service-details h3 {
            font-size: 16px;
          }

          .service-features h4 {
            font-size: 14px;
          }

          .feature-text {
            font-size: 13px;
          }

          .primary-btn {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingsHistory;