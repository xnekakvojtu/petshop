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
  const [saving, setSaving] = useState(false);

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

  const getFullDayName = (day: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
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

  const handleSaveSettings = async () => {
    setSaving(true);
    
    const settings = {
      workingHours,
      blockedDates,
      workingDays,
      lastUpdated: new Date().toISOString(),
    };
    
    try {
      // Simular salvamento no Firebase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('scheduleSettings', JSON.stringify(settings));
      
      const event = new CustomEvent('notification', {
        detail: { 
          message: 'Configurações salvas com sucesso!', 
          type: 'success' 
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      const event = new CustomEvent('notification', {
        detail: { 
          message: 'Erro ao salvar configurações', 
          type: 'error' 
        }
      });
      window.dispatchEvent(event);
    } finally {
      setSaving(false);
    }
  };

  const timeSlots = generateTimeSlots();

  // Data atual formatada
  const getCurrentDateInfo = () => {
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

  const currentDate = getCurrentDateInfo();

  return (
    <div className="admin-schedule">
      <AdminSidebar />
      
      <div className="admin-content">
        <div className="content-header">
          <div className="header-main">
            <h1>Configurar Horários</h1>
            <p>Defina horários de funcionamento e bloqueie datas especiais</p>
          </div>
          
          <div className="header-actions">
            <div className="date-badge">
              <i className="fas fa-calendar-day"></i>
              <span>{currentDate.full}</span>
            </div>
            
            <button 
              className={`save-btn ${saving ? 'saving' : ''}`}
              onClick={handleSaveSettings}
              disabled={saving}
              aria-label="Salvar configurações"
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  <span>Salvar Configurações</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="schedule-sections">
          {/* Configurações Básicas */}
          <div className="config-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-clock"></i>
                Horários de Funcionamento
              </h2>
            </div>
            
            <div className="config-grid">
              <div className="config-item">
                <label htmlFor="openingTime">
                  <i className="far fa-sun"></i>
                  Horário de Abertura
                </label>
                <div className="time-input-wrapper">
                  <input
                    id="openingTime"
                    type="time"
                    value={workingHours.openingTime}
                    onChange={(e) => handleTimeChange('openingTime', e.target.value)}
                    aria-label="Horário de abertura"
                  />
                </div>
              </div>
              
              <div className="config-item">
                <label htmlFor="closingTime">
                  <i className="far fa-moon"></i>
                  Horário de Fechamento
                </label>
                <div className="time-input-wrapper">
                  <input
                    id="closingTime"
                    type="time"
                    value={workingHours.closingTime}
                    onChange={(e) => handleTimeChange('closingTime', e.target.value)}
                    aria-label="Horário de fechamento"
                  />
                </div>
              </div>
              
              <div className="config-item">
                <label htmlFor="slotDuration">
                  <i className="fas fa-hourglass-half"></i>
                  Duração do Horário
                </label>
                <div className="select-wrapper">
                  <select
                    id="slotDuration"
                    value={workingHours.slotDuration}
                    onChange={(e) => handleTimeChange('slotDuration', parseInt(e.target.value))}
                    aria-label="Duração dos horários"
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">60 minutos</option>
                  </select>
                </div>
              </div>
              
              <div className="config-item">
                <label htmlFor="maxSlots">
                  <i className="fas fa-users"></i>
                  Agendamentos por Horário
                </label>
                <div className="select-wrapper">
                  <select
                    id="maxSlots"
                    value={workingHours.maxSlotsPerTime}
                    onChange={(e) => handleTimeChange('maxSlotsPerTime', parseInt(e.target.value))}
                    aria-label="Agendamentos por horário"
                  >
                    <option value="1">1 agendamento</option>
                    <option value="2">2 agendamentos</option>
                    <option value="3">3 agendamentos</option>
                    <option value="4">4 agendamentos</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Dias de Funcionamento */}
          <div className="config-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-calendar-week"></i>
                Dias de Funcionamento
              </h2>
            </div>
            
            <div className="days-selection">
              <p className="section-description">
                Selecione os dias da semana em que o pet shop estará aberto:
              </p>
              
              <div className="days-grid">
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <button
                    key={day}
                    className={`day-btn ${workingDays.includes(day) ? 'active' : ''}`}
                    onClick={() => handleWorkingDayToggle(day)}
                    type="button"
                    aria-label={`${workingDays.includes(day) ? 'Remover' : 'Adicionar'} ${getFullDayName(day)}`}
                    title={getFullDayName(day)}
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
              
              <div className="selected-days-info">
                <span className="label">Dias selecionados:</span>
                <span className="value">
                  {workingDays.map(day => getDayName(day)).join(', ') || 'Nenhum'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Datas Bloqueadas */}
          <div className="config-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-calendar-times"></i>
                Datas Bloqueadas
              </h2>
            </div>
            
            <div className="blocked-dates-section">
              <p className="section-description">
                Adicione datas especiais em que o pet shop não funcionará:
              </p>
              
              <div className="add-date-form">
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    aria-label="Selecione uma data para bloquear"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <button 
                  onClick={handleAddBlockedDate}
                  className="add-btn"
                  disabled={!newBlockedDate}
                  aria-label="Adicionar data bloqueada"
                >
                  <i className="fas fa-plus"></i>
                  <span>Adicionar</span>
                </button>
              </div>
              
              {blockedDates.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-calendar-check"></i>
                  <p>Nenhuma data bloqueada</p>
                </div>
              ) : (
                <div className="dates-list">
                  <div className="list-header">
                    <span>Datas bloqueadas ({blockedDates.length})</span>
                  </div>
                  <div className="dates-scroll">
                    {blockedDates.map((date) => (
                      <div key={date} className="date-item">
                        <div className="date-info">
                          <i className="far fa-calendar-times"></i>
                          <div className="date-details">
                            <span className="date-display">
                              {new Date(date).toLocaleDateString('pt-BR', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="date-relative">
                              {new Date(date).toDateString() === new Date().toDateString() 
                                ? 'Hoje' 
                                : new Date(date) > new Date() 
                                  ? 'Futuro' 
                                  : 'Passado'}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveBlockedDate(date)}
                          className="remove-btn"
                          aria-label="Remover data bloqueada"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Preview do Horário */}
          <div className="config-section preview-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-eye"></i>
                Preview do Horário
              </h2>
            </div>
            
            <div className="preview-content">
              <div className="preview-summary">
                <div className="summary-item">
                  <i className="fas fa-door-open"></i>
                  <div>
                    <div className="label">Abertura</div>
                    <div className="value">{workingHours.openingTime}</div>
                  </div>
                </div>
                
                <div className="summary-item">
                  <i className="fas fa-door-closed"></i>
                  <div>
                    <div className="label">Fechamento</div>
                    <div className="value">{workingHours.closingTime}</div>
                  </div>
                </div>
                
                <div className="summary-item">
                  <i className="fas fa-hourglass-end"></i>
                  <div>
                    <div className="label">Duração</div>
                    <div className="value">{workingHours.slotDuration} min</div>
                  </div>
                </div>
                
                <div className="summary-item">
                  <i className="fas fa-calendar-alt"></i>
                  <div>
                    <div className="label">Dias</div>
                    <div className="value">{workingDays.length} dias</div>
                  </div>
                </div>
              </div>
              
              <div className="time-slots-preview">
                <h3>Horários Disponíveis (Exemplo)</h3>
                <div className="slots-info">
                  <span>{timeSlots.length} horários disponíveis</span>
                  <span className="slots-count">
                    <i className="fas fa-user-clock"></i>
                    {workingHours.maxSlotsPerTime} por horário
                  </span>
                </div>
                
                <div className="slots-grid">
                  {timeSlots.slice(0, 12).map((time) => (
                    <div key={time} className="time-slot" title={`Horário: ${time}`}>
                      {time}
                    </div>
                  ))}
                </div>
                
                {timeSlots.length > 12 && (
                  <div className="more-slots">
                    <i className="fas fa-ellipsis-h"></i>
                    + {timeSlots.length - 12} horários disponíveis
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .admin-schedule {
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
          margin-bottom: 24px;
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
        
        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          flex-wrap: wrap;
          gap: 16px;
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
          transition: all 0.2s;
          font-size: 14px;
        }
        
        .save-btn:hover:not(:disabled) {
          background: #7c3aed;
          transform: translateY(-1px);
        }
        
        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .save-btn.saving {
          background: #6b7280;
        }
        
        .schedule-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        
        .config-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .section-header {
          margin-bottom: 20px;
        }
        
        .section-header h2 {
          margin: 0;
          color: #374151;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .section-header i {
          color: #8b5cf6;
          font-size: 16px;
        }
        
        .section-description {
          margin: 0 0 16px 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .config-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        
        .config-item label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
        
        .config-item label i {
          color: #8b5cf6;
          font-size: 13px;
        }
        
        .time-input-wrapper,
        .select-wrapper,
        .date-input-wrapper {
          width: 100%;
        }
        
        .time-input-wrapper input,
        .select-wrapper select,
        .date-input-wrapper input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          color: #1f2937;
          background: white;
          transition: all 0.2s;
        }
        
        .time-input-wrapper input:focus,
        .select-wrapper select:focus,
        .date-input-wrapper input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        /* Dias de Funcionamento */
        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .day-btn {
          padding: 12px 8px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        
        .day-btn:hover {
          border-color: #8b5cf6;
          background: #f5f3ff;
        }
        
        .day-btn.active {
          background: #8b5cf6;
          border-color: #8b5cf6;
          color: white;
        }
        
        .day-name {
          font-weight: 600;
          font-size: 13px;
        }
        
        .day-status {
          font-size: 11px;
        }
        
        .selected-days-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          font-size: 14px;
        }
        
        .selected-days-info .label {
          font-weight: 600;
          color: #374151;
        }
        
        .selected-days-info .value {
          color: #8b5cf6;
          font-weight: 500;
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        /* Datas Bloqueadas */
        .add-date-form {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .add-btn {
          background: #8b5cf6;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          font-size: 14px;
        }
        
        .add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .add-btn:not(:disabled):hover {
          background: #7c3aed;
        }
        
        .empty-state {
          text-align: center;
          padding: 32px 20px;
          color: #9ca3af;
        }
        
        .empty-state i {
          font-size: 40px;
          margin-bottom: 12px;
          color: #d1d5db;
        }
        
        .empty-state p {
          margin: 0;
          font-size: 14px;
        }
        
        .dates-list {
          background: #f9fafb;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        
        .list-header {
          padding: 12px 16px;
          background: #f3f4f6;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .dates-scroll {
          max-height: 200px;
          overflow-y: auto;
        }
        
        .date-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .date-item:last-child {
          border-bottom: none;
        }
        
        .date-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .date-info i {
          color: #ef4444;
          font-size: 16px;
        }
        
        .date-details {
          display: flex;
          flex-direction: column;
        }
        
        .date-display {
          color: #4b5563;
          font-size: 14px;
          font-weight: 500;
        }
        
        .date-relative {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 2px;
        }
        
        .remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        
        .remove-btn:hover {
          background: #fee2e2;
        }
        
        /* Preview Section */
        .preview-section {
          grid-column: 1 / -1;
        }
        
        .preview-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        
        .preview-summary {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        
        .summary-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
        }
        
        .summary-item i {
          font-size: 20px;
          color: #8b5cf6;
        }
        
        .summary-item .label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }
        
        .summary-item .value {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .time-slots-preview h3 {
          margin: 0 0 16px 0;
          color: #374151;
          font-size: 16px;
          font-weight: 600;
        }
        
        .slots-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-size: 14px;
          color: #6b7280;
        }
        
        .slots-count {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #d1fae5;
          color: #065f46;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 8px;
        }
        
        .time-slot {
          padding: 10px 8px;
          background: #d1fae5;
          color: #065f46;
          border-radius: 8px;
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          transition: transform 0.2s;
        }
        
        .time-slot:hover {
          transform: translateY(-2px);
        }
        
        .more-slots {
          margin-top: 16px;
          text-align: center;
          color: #8b5cf6;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px;
        }
        
        .more-slots i {
          font-size: 12px;
        }
        
        /* ===== RESPONSIVIDADE ===== */
        
        /* Tablet (1024px) */
        @media (max-width: 1024px) {
          .admin-content {
            margin-left: 220px;
            width: calc(100% - 220px);
            padding: 20px;
          }
          
          .preview-content {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .preview-summary {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        /* Mobile Landscape (768px) */
        @media (max-width: 768px) {
          .admin-content {
            margin-left: 60px;
            width: calc(100% - 60px);
            padding: 16px;
          }
          
          .header-main h1 {
            font-size: 24px;
          }
          
          .header-actions {
            flex-direction: column;
            align-items: stretch;
          }
          
          .date-badge {
            justify-content: center;
          }
          
          .save-btn {
            justify-content: center;
          }
          
          .days-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .add-date-form {
            grid-template-columns: 1fr;
          }
          
          .preview-summary {
            grid-template-columns: repeat(2, 1fr);
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
          
          .section-header h2 {
            font-size: 16px;
          }
          
          .days-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .selected-days-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .selected-days-info .value {
            max-width: 100%;
          }
          
          .preview-summary {
            grid-template-columns: 1fr;
          }
          
          .summary-item {
            justify-content: space-between;
          }
          
          .slots-grid {
            grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
          }
        }
        
        /* Small Mobile (360px) */
        @media (max-width: 360px) {
          .admin-content {
            padding: 12px;
            padding-top: 70px;
          }
          
          .config-section {
            padding: 16px;
          }
          
          .days-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .save-btn span {
            font-size: 13px;
          }
          
          .add-btn span {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSchedule;