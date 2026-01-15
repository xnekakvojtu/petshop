// src/pages/AdminSchedule.tsx - COMPLETO E FUNCIONAL
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/Admin/AdminSidebar';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AdminSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAuth();

  const [workingHours, setWorkingHours] = useState({
    openingTime: '08:00',
    closingTime: '18:00',
    slotDuration: 30,
    maxSlotsPerTime: 2,
  });

  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [workingDays, setWorkingDays] = useState([1, 2, 3, 4, 5]); // Segunda a sexta
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (!isAdmin && !isLoading) {
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);

  if (!isAdmin) {
    return null;
  }

  const handleTimeChange = (field: string, value: string | number) => {
    setWorkingHours(prev => ({ ...prev, [field]: value }));
  };

  const handleAddBlockedDate = () => {
    if (newBlockedDate && !blockedDates.includes(newBlockedDate)) {
      setBlockedDates(prev => [...prev, newBlockedDate].sort());
      setNewBlockedDate('');
    }
  };

  const handleRemoveBlockedDate = (date: string) => {
    setBlockedDates(prev => prev.filter(d => d !== date));
  };

  const handleWorkingDayToggle = (day: number) => {
    setWorkingDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const getDayName = (day: number) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[day];
  };

  const generateTimeSlots = () => {
    const slots = [];
    const [openingHour, openingMinute] = workingHours.openingTime.split(':').map(Number);
    const [closingHour, closingMinute] = workingHours.closingTime.split(':').map(Number);
    
    const startTime = openingHour * 60 + openingMinute;
    const endTime = closingHour * 60 + closingMinute;
    const duration = workingHours.slotDuration;
    
    for (let time = startTime; time < endTime; time += duration) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeStr);
    }
    
    return slots;
  };

  const handleSaveSettings = () => {
    const settings = {
      workingHours,
      blockedDates,
      workingDays,
      lastUpdated: new Date().toISOString(),
    };
    
    // Aqui você salvaria no Firebase
    localStorage.setItem('scheduleSettings', JSON.stringify(settings));
    
    const event = new CustomEvent('notification', {
      detail: { 
        message: 'Configurações salvas com sucesso!', 
        type: 'success' 
      }
    });
    window.dispatchEvent(event);
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="admin-schedule">
      <AdminSidebar />
      
      <div className="admin-content">
        <div className="content-header">
          <div>
            <h1>Configurar Horários</h1>
            <p>Defina horários de funcionamento e bloqueie datas especiais</p>
          </div>
          <button 
            className="btn-primary save-btn"
            onClick={handleSaveSettings}
          >
            <i className="fas fa-save"></i> Salvar Configurações
          </button>
        </div>
        
        <div className="schedule-grid">
          {/* Configurações Básicas */}
          <div className="config-section">
            <div className="section-header">
              <h2><i className="fas fa-cog"></i> Configurações Básicas</h2>
            </div>
            <div className="config-grid">
              <div className="config-item">
                <label>Horário de Abertura</label>
                <input
                  type="time"
                  value={workingHours.openingTime}
                  onChange={(e) => handleTimeChange('openingTime', e.target.value)}
                  className="time-input"
                />
              </div>
              
              <div className="config-item">
                <label>Horário de Fechamento</label>
                <input
                  type="time"
                  value={workingHours.closingTime}
                  onChange={(e) => handleTimeChange('closingTime', e.target.value)}
                  className="time-input"
                />
              </div>
              
              <div className="config-item">
                <label>Duração do Horário (min)</label>
                <select
                  value={workingHours.slotDuration}
                  onChange={(e) => handleTimeChange('slotDuration', parseInt(e.target.value))}
                  className="duration-select"
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">60 minutos</option>
                </select>
              </div>
              
              <div className="config-item">
                <label>Agendamentos por Horário</label>
                <select
                  value={workingHours.maxSlotsPerTime}
                  onChange={(e) => handleTimeChange('maxSlotsPerTime', parseInt(e.target.value))}
                  className="slots-select"
                >
                  <option value="1">1 agendamento</option>
                  <option value="2">2 agendamentos</option>
                  <option value="3">3 agendamentos</option>
                  <option value="4">4 agendamentos</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Dias de Funcionamento */}
          <div className="config-section">
            <div className="section-header">
              <h2><i className="fas fa-calendar-week"></i> Dias de Funcionamento</h2>
            </div>
            <div className="days-grid">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <button
                  key={day}
                  className={`day-btn ${workingDays.includes(day) ? 'active' : ''}`}
                  onClick={() => handleWorkingDayToggle(day)}
                >
                  <div className="day-name">{getDayName(day)}</div>
                  <div className="day-status">
                    {workingDays.includes(day) ? (
                      <i className="fas fa-check"></i>
                    ) : (
                      <i className="fas fa-times"></i>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Datas Bloqueadas */}
          <div className="config-section">
            <div className="section-header">
              <h2><i className="fas fa-calendar-times"></i> Datas Bloqueadas</h2>
            </div>
            <div className="blocked-dates">
              <div className="add-date-form">
                <input
                  type="date"
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="date-input"
                />
                <button 
                  onClick={handleAddBlockedDate}
                  className="add-btn"
                  disabled={!newBlockedDate}
                >
                  <i className="fas fa-plus"></i> Adicionar
                </button>
              </div>
              
              {blockedDates.length === 0 ? (
                <div className="empty-dates">
                  <i className="fas fa-calendar-check"></i>
                  <p>Nenhuma data bloqueada</p>
                </div>
              ) : (
                <div className="dates-list">
                  {blockedDates.map((date) => (
                    <div key={date} className="date-item">
                      <span className="date-display">
                        {new Date(date).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <button 
                        onClick={() => handleRemoveBlockedDate(date)}
                        className="remove-btn"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Preview do Horário */}
          <div className="config-section preview-section">
            <div className="section-header">
              <h2><i className="fas fa-eye"></i> Preview do Horário</h2>
            </div>
            <div className="preview-content">
              <div className="preview-info">
                <div className="info-row">
                  <span className="label">Funcionamento:</span>
                  <span className="value">
                    {workingHours.openingTime} - {workingHours.closingTime}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Duração:</span>
                  <span className="value">{workingHours.slotDuration} minutos</span>
                </div>
                <div className="info-row">
                  <span className="label">Dias:</span>
                  <span className="value">
                    {workingDays.map(day => getDayName(day)).join(', ')}
                  </span>
                </div>
              </div>
              
              <div className="time-slots-preview">
                <h3>Horários Disponíveis (Exemplo)</h3>
                <div className="slots-grid">
                  {timeSlots.slice(0, 12).map((time) => (
                    <div key={time} className="time-slot">
                      {time}
                    </div>
                  ))}
                </div>
                {timeSlots.length > 12 && (
                  <div className="more-slots">
                    + {timeSlots.length - 12} horários disponíveis
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style >{`
        .admin-schedule {
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
          margin: 0 0 10px 0;
          color: #1f2937;
          font-size: 32px;
        }
        
        .content-header p {
          margin: 0;
          color: #6b7280;
        }
        
        .save-btn {
          background: #8b5cf6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
        }
        
        .save-btn:hover {
          background: #7c3aed;
        }
        
        .schedule-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
        }
        
        .config-section {
          background: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        
        .section-header {
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .section-header h2 {
          margin: 0;
          color: #374151;
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .config-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .config-item label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
        
        .time-input,
        .duration-select,
        .slots-select,
        .date-input {
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-size: 15px;
          color: #1f2937;
          background: white;
        }
        
        .time-input:focus,
        .duration-select:focus,
        .slots-select:focus,
        .date-input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        /* Dias de Funcionamento */
        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
        }
        
        .day-btn {
          padding: 15px 8px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .day-btn:hover {
          border-color: #8b5cf6;
        }
        
        .day-btn.active {
          background: #8b5cf6;
          border-color: #8b5cf6;
          color: white;
        }
        
        .day-name {
          font-weight: 600;
          font-size: 14px;
        }
        
        .day-status {
          font-size: 12px;
        }
        
        /* Datas Bloqueadas */
        .blocked-dates {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .add-date-form {
          display: flex;
          gap: 12px;
        }
        
        .add-btn {
          background: #8b5cf6;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
        }
        
        .add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .add-btn:not(:disabled):hover {
          background: #7c3aed;
        }
        
        .empty-dates {
          text-align: center;
          padding: 40px 20px;
          color: #9ca3af;
        }
        
        .empty-dates i {
          font-size: 48px;
          margin-bottom: 16px;
          color: #d1d5db;
        }
        
        .dates-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .date-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f9fafb;
          border-radius: 10px;
          border-left: 4px solid #ef4444;
        }
        
        .date-display {
          color: #4b5563;
          font-size: 14px;
        }
        
        .remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        
        .remove-btn:hover {
          background: #fee2e2;
        }
        
        /* Preview */
        .preview-section {
          grid-column: 1 / -1;
        }
        
        .preview-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        
        .preview-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .info-row:last-child {
          border-bottom: none;
        }
        
        .label {
          font-weight: 600;
          color: #374151;
        }
        
        .value {
          color: #6b7280;
        }
        
        .time-slots-preview h3 {
          margin: 0 0 16px 0;
          color: #374151;
          font-size: 16px;
        }
        
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 10px;
        }
        
        .time-slot {
          padding: 10px;
          background: #d1fae5;
          color: #065f46;
          border-radius: 8px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
        }
        
        .more-slots {
          margin-top: 16px;
          text-align: center;
          color: #8b5cf6;
          font-weight: 600;
          font-size: 14px;
        }
        
        @media (max-width: 1024px) {
          .preview-content {
            grid-template-columns: 1fr;
          }
          
          .config-grid {
            grid-template-columns: 1fr;
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
          
          .schedule-grid {
            grid-template-columns: 1fr;
          }
          
          .days-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .add-date-form {
            flex-direction: column;
          }
        }
        
        @media (max-width: 480px) {
          .days-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .save-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSchedule;