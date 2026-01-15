import React, { useState } from 'react';
import { Booking } from '../../types';

interface BookingTableProps {
  bookings: Booking[];
  onUpdateStatus: (bookingId: string, status: Booking['status'], reason?: string) => void;
  loading?: boolean;
}

const BookingTable: React.FC<BookingTableProps> = ({ bookings, onUpdateStatus, loading }) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const getStatusBadge = (status: Booking['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    
    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Concluído',
    };
    
    return (
      <span className={`status-badge ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleConfirm = (bookingId: string) => {
    if (window.confirm('Confirmar este agendamento?')) {
      onUpdateStatus(bookingId, 'confirmed');
    }
  };

  const handleCancel = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const submitCancel = () => {
    if (selectedBooking && cancelReason.trim()) {
      onUpdateStatus(selectedBooking.id, 'cancelled', cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedBooking(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-table">
        <div className="spinner"></div>
        <p>Carregando agendamentos...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="empty-table">
        <i className="fas fa-calendar-times"></i>
        <p>Nenhum agendamento encontrado</p>
      </div>
    );
  }

  return (
    <>
      <div className="booking-table">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Pet</th>
              <th>Serviço</th>
              <th>Data/Hora</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">{booking.customerName || booking.userId}</div>
                    <div className="customer-contact">{booking.petName}</div>
                  </div>
                </td>
                <td>
                  <div className="pet-info">
                    <div className="pet-name">{booking.petName}</div>
                    <div className="pet-details">{booking.petType} • {booking.petBreed || 'SRD'}</div>
                  </div>
                </td>
                <td>
                  <div className="service-info">
                    <div className="service-name">{booking.serviceName}</div>
                    <div className="service-duration">{booking.duration}min</div>
                  </div>
                </td>
                <td>
                  <div className="datetime-info">
                    <div className="date">{new Date(booking.date).toLocaleDateString('pt-BR')}</div>
                    <div className="time">{booking.time}</div>
                  </div>
                </td>
                <td>
                  <div className="price-info">
                    R$ {booking.servicePrice.toFixed(2)}
                  </div>
                </td>
                <td>{getStatusBadge(booking.status)}</td>
                <td>
                  <div className="actions">
                    {booking.status === 'pending' && (
                      <>
                        <button 
                          className="btn-confirm"
                          onClick={() => handleConfirm(booking.id)}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button 
                          className="btn-cancel"
                          onClick={() => handleCancel(booking)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button 
                        className="btn-complete"
                        onClick={() => onUpdateStatus(booking.id, 'completed')}
                      >
                        <i className="fas fa-check-circle"></i>
                      </button>
                    )}
                    <button className="btn-view">
                      <i className="fas fa-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Cancelamento */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Cancelar Agendamento</h3>
              <button onClick={() => setShowCancelModal(false)} className="close-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Informe o motivo do cancelamento:</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Cliente desistiu, horário indisponível, etc."
                rows={4}
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCancelModal(false)} className="btn-secondary">
                Voltar
              </button>
              <button onClick={submitCancel} className="btn-primary" disabled={!cancelReason.trim()}>
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      <style >{`
        .booking-table {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th {
          background: #f9fafb;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        
        td {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        tr:hover {
          background: #f9fafb;
        }
        
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }
        
        .actions {
          display: flex;
          gap: 8px;
        }
        
        .actions button {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .btn-confirm {
          background: #10b981;
          color: white;
        }
        
        .btn-cancel {
          background: #ef4444;
          color: white;
        }
        
        .btn-complete {
          background: #3b82f6;
          color: white;
        }
        
        .btn-view {
          background: #6b7280;
          color: white;
        }
        
        .actions button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        .customer-info,
        .pet-info,
        .service-info,
        .datetime-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .customer-name,
        .pet-name,
        .service-name,
        .date {
          font-weight: 600;
          color: #1f2937;
        }
        
        .customer-contact,
        .pet-details,
        .service-duration,
        .time {
          font-size: 12px;
          color: #6b7280;
        }
        
        .price-info {
          font-weight: 700;
          color: #059669;
        }
        
        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-header h3 {
          margin: 0;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #6b7280;
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .modal-body textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          margin-top: 10px;
          font-family: inherit;
          resize: vertical;
        }
        
        .modal-footer {
          padding: 20px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .btn-primary {
          background: #8b5cf6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .btn-secondary {
          background: #e5e7eb;
          color: #374151;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .loading-table,
        .empty-table {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          background: white;
          border-radius: 12px;
          color: #6b7280;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        .empty-table i {
          font-size: 48px;
          margin-bottom: 20px;
          color: #d1d5db;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 1024px) {
          .booking-table {
            overflow-x: auto;
          }
          
          table {
            min-width: 900px;
          }
        }
      `}</style>
    </>
  );
};

export default BookingTable;