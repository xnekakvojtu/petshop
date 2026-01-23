import React, { useState } from 'react';

interface BookingTableProps {
  bookings: any[];
  onUpdateStatus: (bookingId: string, status: string, reason?: string) => void;
  loading: boolean;
  formatCustomerName: (customerName?: string, userId?: string) => string;
}

interface BookingDetailsModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (status: string, reason?: string) => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  if (!isOpen) return null;

  const statusColors = {
    pending: { bg: '#fef3c7', text: '#92400e', label: 'Pendente' },
    confirmed: { bg: '#d1fae5', text: '#065f46', label: 'Confirmado' },
    cancelled: { bg: '#fee2e2', text: '#991b1b', label: 'Cancelado' },
    completed: { bg: '#dbeafe', text: '#1e40af', label: 'Concluído' },
  };

  const statusInfo = statusColors[booking.status as keyof typeof statusColors] || statusColors.pending;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="booking-details-modal">
        <div className="modal-header">
          <h2>Detalhes do Agendamento</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-content">
          <div className="details-grid">
            <div className="detail-section">
              <h3>Informações do Cliente</h3>
              <div className="detail-item">
                <span className="detail-label">Nome:</span>
                <span className="detail-value">{booking.customerName || 'Não informado'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Telefone:</span>
                <span className="detail-value">{booking.customerPhone || 'Não informado'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">E-mail:</span>
                <span className="detail-value">{booking.customerEmail || 'Não informado'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">ID do Cliente:</span>
                <span className="detail-value">{booking.userId || 'Não cadastrado'}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Informações do Pet</h3>
              <div className="detail-item">
                <span className="detail-label">Nome do Pet:</span>
                <span className="detail-value">{booking.petName || 'Não informado'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tipo/Raça:</span>
                <span className="detail-value">{booking.petType || 'Não informado'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Idade:</span>
                <span className="detail-value">{booking.petAge || 'Não informada'}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Detalhes do Serviço</h3>
              <div className="detail-item">
                <span className="detail-label">Serviço:</span>
                <span className="detail-value">{booking.serviceName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Data:</span>
                <span className="detail-value">
                  {booking.date ? new Date(booking.date).toLocaleDateString('pt-BR') : 'Não informado'} às {booking.time || 'Não informado'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Valor:</span>
                <span className="detail-value price">
                  R$ {(booking.servicePrice || booking.price || 0).toFixed(2)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Duração:</span>
                <span className="detail-value">{booking.duration || 'Não informada'}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Status do Agendamento</h3>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span 
                  className="status-badge" 
                  style={{ 
                    backgroundColor: statusInfo.bg, 
                    color: statusInfo.text,
                    border: `1px solid ${statusInfo.text}` 
                  }}
                >
                  {statusInfo.label}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Criado em:</span>
                <span className="detail-value">
                  {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('pt-BR') : 'Não informado'}
                </span>
              </div>
              {booking.updatedAt && (
                <div className="detail-item">
                  <span className="detail-label">Última atualização:</span>
                  <span className="detail-value">
                    {new Date(booking.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>

            {booking.notes && (
              <div className="detail-section full-width">
                <h3>Observações</h3>
                <div className="notes-container">
                  <p>{booking.notes}</p>
                </div>
              </div>
            )}

            {booking.cancellationReason && booking.status === 'cancelled' && (
              <div className="detail-section full-width">
                <h3>Motivo do Cancelamento</h3>
                <div className="cancellation-reason">
                  <p>{booking.cancellationReason}</p>
                </div>
              </div>
            )}
          </div>

          <div className="modal-actions">
            {booking.status === 'pending' && (
              <div className="status-actions">
                <button 
                  className="btn btn-success" 
                  onClick={() => onUpdateStatus('confirmed')}
                >
                  <i className="fas fa-check"></i>
                  Confirmar
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => {
                    const reason = prompt('Motivo do cancelamento:');
                    if (reason) onUpdateStatus('cancelled', reason);
                  }}
                >
                  <i className="fas fa-times"></i>
                  Cancelar
                </button>
              </div>
            )}

            {booking.status === 'confirmed' && (
              <div className="status-actions">
                <button 
                  className="btn btn-success" 
                  onClick={() => onUpdateStatus('completed')}
                >
                  <i className="fas fa-check-double"></i>
                  Marcar como Concluído
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => {
                    const reason = prompt('Motivo do cancelamento:');
                    if (reason) onUpdateStatus('cancelled', reason);
                  }}
                >
                  <i className="fas fa-times"></i>
                  Cancelar
                </button>
              </div>
            )}

            {booking.status === 'completed' && (
              <button 
                className="btn btn-secondary"
                onClick={onClose}
              >
                <i className="fas fa-history"></i>
                Ver Histórico Completo
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const BookingTable: React.FC<BookingTableProps> = ({ 
  bookings, 
  onUpdateStatus, 
  loading,
  formatCustomerName 
}) => {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const openDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setTimeout(() => {
      setSelectedBooking(null);
    }, 300);
  };

  const handleUpdateStatus = (status: string, reason?: string) => {
    if (selectedBooking) {
      onUpdateStatus(selectedBooking.id, status, reason);
      closeDetails();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Carregando agendamentos...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-calendar-times"></i>
        <h3>Nenhum agendamento encontrado</h3>
        <p>Tente ajustar os filtros ou criar um novo agendamento.</p>
      </div>
    );
  }

  return (
    <>
      <div className="booking-table-container">
        <div className="table-responsive">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Pet</th>
                <th>Serviço</th>
                <th>Data e Hora</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div className="client-cell">
                      <div className="avatar">
                        {formatCustomerName(booking.customerName, booking.userId)?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="client-name">
                          {formatCustomerName(booking.customerName, booking.userId)}
                        </div>
                        {booking.customerPhone && (
                          <div className="client-phone">
                            <i className="fas fa-phone-alt" style={{ fontSize: '10px', marginRight: '4px' }}></i>
                            {booking.customerPhone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="pet-info">
                      <span className="pet-name">{booking.petName}</span>
                      <span className="pet-type">{booking.petType || 'Não informado'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="service-info">
                      <span className="service-name">{booking.serviceName}</span>
                      <span className="service-price">
                        R$ {(booking.servicePrice || booking.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="datetime-info">
                      <div className="date">
                        {booking.date ? new Date(booking.date).toLocaleDateString('pt-BR') : 'Não informado'}
                      </div>
                      <div className="time">{booking.time || 'Não informado'}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${booking.status || 'pending'}`}>
                      {booking.status === 'pending' && 'Pendente'}
                      {booking.status === 'confirmed' && 'Confirmado'}
                      {booking.status === 'cancelled' && 'Cancelado'}
                      {booking.status === 'completed' && 'Concluído'}
                      {!['pending', 'confirmed', 'cancelled', 'completed'].includes(booking.status) && 'Pendente'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() => openDetails(booking)}
                        title="Ver detalhes"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <style>{`
          .booking-table-container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            border: 1px solid #e5e7eb;
          }
          
          .table-responsive {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          
          .bookings-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 800px;
          }
          
          .bookings-table th {
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #e5e7eb;
            background: #f9fafb;
          }
          
          .bookings-table td {
            padding: 16px;
            border-bottom: 1px solid #f3f4f6;
            color: #4b5563;
            font-size: 14px;
          }
          
          .bookings-table tr:last-child td {
            border-bottom: none;
          }
          
          .client-cell {
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }
          
          .avatar {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            flex-shrink: 0;
            margin-top: 2px;
          }
          
          .client-name {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
            line-height: 1.2;
          }
          
          .client-phone {
            font-size: 12px;
            color: #666;
            margin-top: 2px;
            display: flex;
            align-items: center;
            gap: 4px;
            line-height: 1.2;
          }
          
          .client-phone i {
            opacity: 0.7;
          }
          
          .pet-info {
            display: flex;
            flex-direction: column;
          }
          
          .pet-name {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
          }
          
          .pet-type {
            font-size: 12px;
            color: #6b7280;
            background: #f3f4f6;
            padding: 2px 8px;
            border-radius: 12px;
            display: inline-block;
          }
          
          .service-info {
            display: flex;
            flex-direction: column;
          }
          
          .service-name {
            font-weight: 500;
            color: #374151;
            margin-bottom: 4px;
          }
          
          .service-price {
            font-size: 12px;
            color: #059669;
            font-weight: 600;
          }
          
          .datetime-info {
            min-width: 120px;
          }
          
          .date {
            font-weight: 500;
            color: #374151;
          }
          
          .time {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 4px;
          }
          
          .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
            text-align: center;
            min-width: 90px;
          }
          
          .status-pending {
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #fcd34d;
          }
          
          .status-confirmed {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #10b981;
          }
          
          .status-cancelled {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #ef4444;
          }
          
          .status-completed {
            background: #dbeafe;
            color: #1e40af;
            border: 1px solid #3b82f6;
          }
          
          .actions {
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
            background: #6b7280;
          }
          
          .view-btn:hover {
            background: #4b5563;
          }
          
          .loading-container,
          .empty-state {
            text-align: center;
            padding: 60px 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            border: 1px solid #e5e7eb;
          }
          
          .loading-container i {
            font-size: 32px;
            color: #8b5cf6;
            margin-bottom: 16px;
          }
          
          .loading-container p {
            color: #6b7280;
            margin: 0;
          }
          
          .empty-state i {
            font-size: 48px;
            color: #d1d5db;
            margin-bottom: 16px;
          }
          
          .empty-state h3 {
            margin: 0 0 8px 0;
            color: #374151;
          }
          
          .empty-state p {
            margin: 0;
            color: #6b7280;
          }
          
          @media (max-width: 768px) {
            .bookings-table {
              min-width: 700px;
            }
            
            .bookings-table th,
            .bookings-table td {
              padding: 12px;
              font-size: 13px;
            }
            
            .status-badge {
              min-width: 80px;
              padding: 4px 8px;
              font-size: 11px;
            }
            
            .avatar {
              width: 32px;
              height: 32px;
              font-size: 12px;
            }
            
            .client-phone {
              font-size: 11px;
            }
            
            .action-btn {
              width: 28px;
              height: 28px;
              font-size: 12px;
            }
          }
          
          /* Modal Styles */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
          }
          
          .booking-details-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            z-index: 1000;
          }
          
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .modal-header h2 {
            margin: 0;
            font-size: 20px;
            color: #1f2937;
          }
          
          .close-btn {
            background: none;
            border: none;
            font-size: 18px;
            color: #6b7280;
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            transition: background 0.2s;
          }
          
          .close-btn:hover {
            background: #f3f4f6;
          }
          
          .modal-content {
            padding: 24px;
          }
          
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 32px;
          }
          
          .detail-section {
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
          }
          
          .detail-section.full-width {
            grid-column: 1 / -1;
          }
          
          .detail-section h3 {
            margin: 0 0 16px 0;
            font-size: 16px;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
          }
          
          .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          
          .detail-item:last-child {
            margin-bottom: 0;
          }
          
          .detail-label {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
          }
          
          .detail-value {
            font-size: 14px;
            color: #1f2937;
            font-weight: 600;
            text-align: right;
          }
          
          .detail-value.price {
            color: #059669;
            font-size: 16px;
          }
          
          .notes-container,
          .cancellation-reason {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            margin-top: 8px;
          }
          
          .notes-container p,
          .cancellation-reason p {
            margin: 0;
            color: #4b5563;
            line-height: 1.5;
          }
          
          .modal-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            gap: 16px;
          }
          
          .btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border-radius: 8px;
            border: none;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .btn i {
            font-size: 14px;
          }
          
          .btn-secondary {
            background: #6b7280;
            color: white;
          }
          
          .btn-secondary:hover {
            background: #4b5563;
          }
          
          .btn-success {
            background: #10b981;
            color: white;
          }
          
          .btn-success:hover {
            background: #059669;
          }
          
          .btn-danger {
            background: #ef4444;
            color: white;
          }
          
          .btn-danger:hover {
            background: #dc2626;
          }
          
          .status-actions {
            display: flex;
            gap: 12px;
          }
          
          @media (max-width: 768px) {
            .details-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }
            
            .modal-actions {
              flex-direction: column;
              gap: 12px;
            }
            
            .status-actions {
              width: 100%;
              justify-content: space-between;
            }
            
            .btn {
              flex: 1;
              justify-content: center;
            }
          }
        `}</style>
      </div>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={showDetails}
          onClose={closeDetails}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </>
  );
};

export default BookingTable;