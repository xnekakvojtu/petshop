import React from 'react';

interface BookingTableProps {
  bookings: any[];
  onUpdateStatus: (bookingId: string, status: string, reason?: string) => void;
  loading: boolean;
  formatCustomerName: (customerName?: string, userId?: string) => string;
}

const BookingTable: React.FC<BookingTableProps> = ({ 
  bookings, 
  onUpdateStatus, 
  loading,
  formatCustomerName 
}) => {
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
                      {formatCustomerName(booking.customerName, booking.userId)[0]}
                    </div>
                    <div>
                      <div className="client-name">
                        {formatCustomerName(booking.customerName, booking.userId)}
                      </div>
                      <div className="client-info">
                        <i className="fas fa-phone"></i>
                        <span>{booking.phone || 'Não informado'}</span>
                      </div>
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
                      R$ {booking.price?.toFixed(2) || '0,00'}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="datetime-info">
                    <div className="date">
                      {new Date(booking.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="time">{booking.time}</div>
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
                <td>
                  <div className="actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => window.open(`/admin/bookings/${booking.id}`, '_blank')}
                      title="Ver detalhes"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    {booking.status === 'pending' && (
                      <>
                        <button
                          className="action-btn confirm-btn"
                          onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                          title="Confirmar agendamento"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          className="action-btn cancel-btn"
                          onClick={() => {
                            const reason = prompt('Motivo do cancelamento:');
                            if (reason) onUpdateStatus(booking.id, 'cancelled', reason);
                          }}
                          title="Cancelar agendamento"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        className="action-btn complete-btn"
                        onClick={() => onUpdateStatus(booking.id, 'completed')}
                        title="Marcar como concluído"
                      >
                        <i className="fas fa-check-double"></i>
                      </button>
                    )}
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
          align-items: center;
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
        }
        
        .client-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }
        
        .client-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6b7280;
        }
        
        .client-info i {
          font-size: 10px;
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
        
        .confirm-btn {
          background: #10b981;
        }
        
        .confirm-btn:hover {
          background: #059669;
        }
        
        .cancel-btn {
          background: #ef4444;
        }
        
        .cancel-btn:hover {
          background: #dc2626;
        }
        
        .complete-btn {
          background: #3b82f6;
        }
        
        .complete-btn:hover {
          background: #2563eb;
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
          
          .action-btn {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingTable;