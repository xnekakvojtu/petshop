import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/Admin/AdminSidebar';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AdminSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAuth();

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  const [workingHours, setWorkingHours] = useState({
    openingTime: '08:00',
    closingTime: '18:00',
    slotDuration: 30,
    maxSlotsPerTime: 2,
  });

  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [workingDays, setWorkingDays] = useState([1, 2, 3, 4, 5]);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isAdmin && !isLoading) {
      navigate('/login');
    }
    
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setScreenWidth(window.innerWidth);
      if (!mobile) setSidebarOpen(false);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAdmin, isLoading, navigate]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getCurrentDate = () => {
    const today = new Date();
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    
    return {
      day: today.getDate(),
      weekday: weekdays[today.getDay()],
      month: months[today.getMonth()],
      year: today.getFullYear()
    };
  };

  const handleTimeChange = (field: string, value: string | number) => {
    setWorkingHours(prev => ({ ...prev, [field]: value }));
  };

  const handleAddBlockedDate = () => {
    if (newBlockedDate && !blockedDates.includes(newBlockedDate)) {
      setBlockedDates(prev => [...prev, newBlockedDate].sort());
      setNewBlockedDate('');
      showSuccessMessage('Data bloqueada adicionada!');
    }
  };

  const handleRemoveBlockedDate = (date: string) => {
    setBlockedDates(prev => prev.filter(d => d !== date));
    showSuccessMessage('Data removida!');
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
      await new Promise(resolve => setTimeout(resolve, 800));
      localStorage.setItem('scheduleSettings', JSON.stringify(settings));
      showSuccessMessage('Configurações salvas com sucesso!');
    } catch (error) {
      showSuccessMessage('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  // Funções responsivas
  const getConfigGridColumns = () => {
    if (screenWidth < 640) return '1fr';
    if (screenWidth < 1024) return 'repeat(2, 1fr)';
    return 'repeat(4, 1fr)';
  };

  const getDaysGridColumns = () => {
    if (screenWidth < 640) return 'repeat(2, 1fr)';
    if (screenWidth < 768) return 'repeat(4, 1fr)';
    return 'repeat(7, 1fr)';
  };

  const getPreviewGridColumns = () => {
    if (screenWidth < 640) return '1fr';
    if (screenWidth < 1024) return 'repeat(3, 1fr)';
    return '1fr';
  };

  const getSlotsGridColumns = () => {
    if (screenWidth < 640) return 'repeat(2, 1fr)';
    if (screenWidth < 768) return 'repeat(3, 1fr)';
    if (screenWidth < 1024) return 'repeat(4, 1fr)';
    return 'repeat(3, 1fr)';
  };

  const timeSlots = generateTimeSlots();
  const currentDate = getCurrentDate();

  if (!isAdmin && !isLoading) {
    return null;
  }

  return (
    <div className="admin-schedule" style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#fafafa',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <AdminSidebar 
        onMobileClose={() => setSidebarOpen(!sidebarOpen)}
        isMobileOpen={sidebarOpen}
      />
      
      <div 
        className="admin-content"
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : '260px',
          width: isMobile ? '100%' : 'calc(100% - 260px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div 
            className="mobile-header"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              background: 'white',
              padding: '1rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                color: '#3b82f6',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <i className="fas fa-bars"></i>
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div 
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                <i className="fas fa-clock"></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Horários</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>LuckPet</span>
              </div>
            </div>
          </div>
        )}
        
        <main 
          className="schedule-main"
          style={{
            padding: isMobile ? 'calc(1.5rem + 72px) 1rem 1rem 1rem' : '2rem 2.5rem',
            maxWidth: '1400px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* Header */}
          <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
            <div 
              className="header-content"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1.5rem',
                flexDirection: isMobile ? 'column' : 'row',
              }}
            >
              <div className="greeting-section">
                <h1 style={{ 
                  margin: '0 0 0.5rem 0', 
                  fontSize: isMobile ? '1.75rem' : '2rem', 
                  fontWeight: 700, 
                  color: '#111827',
                  lineHeight: 1.2 
                }}>Configurar Horários</h1>
                <p style={{ 
                  margin: 0, 
                  color: '#6b7280', 
                  fontSize: isMobile ? '0.9375rem' : '1rem',
                  lineHeight: 1.5
                }}>Gerencie horários e datas de funcionamento</p>
              </div>
              
              <div 
                className="header-actions"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexDirection: isMobile ? 'column' : 'row',
                  width: isMobile ? '100%' : 'auto',
                }}
              >
                <div 
                  className="date-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    background: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb',
                    width: isMobile ? '100%' : 'auto',
                    minWidth: isMobile ? 'auto' : '180px',
                  }}
                >
                  <div 
                    className="date-icon"
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}
                  >
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="date-info">
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      color: '#6b7280', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '2px'
                    }}>{currentDate.weekday}</div>
                    <div 
                      className="date-display"
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '0.25rem',
                      }}
                    >
                      <span style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: 700, 
                        color: '#111827',
                        lineHeight: 1 
                      }}>{currentDate.day}</span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280', 
                        fontWeight: 500 
                      }}>{currentDate.month} {currentDate.year}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  className={`save-btn ${saving ? 'saving' : ''}`}
                  onClick={handleSaveSettings}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: saving ? '#6b7280' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    width: isMobile ? '100%' : 'auto',
                    opacity: saving ? 0.6 : 1,
                    fontSize: '0.9375rem',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!saving) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {saving ? (
                    <>
                      <div 
                        className="btn-spinner"
                        style={{
                          width: '1rem',
                          height: '1rem',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderTopColor: 'white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }}
                      ></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      <span>Salvar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Configurações de Horário */}
          <section 
            className="config-section"
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #f3f4f6',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div 
              className="section-header"
              style={{
                marginBottom: '1.25rem',
              }}
            >
              <h2 
                className="section-title"
                style={{
                  margin: '0 0 0.375rem 0',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <i className="fas fa-clock" style={{ color: '#3b82f6' }}></i>
                Horários de Funcionamento
              </h2>
              <p style={{ 
                margin: 0,
                color: '#6b7280',
                fontSize: '0.875rem',
              }}>
                Defina os horários de atendimento da clínica
              </p>
            </div>
            
            <div 
              className="config-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: getConfigGridColumns(),
                gap: '0.875rem',
              }}
            >
              <div 
                className="config-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.background = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#f9fafb';
                }}
              >
                <div 
                  className="config-icon"
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    background: '#3b82f6',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.875rem',
                    flexShrink: 0,
                  }}
                >
                  <i className="fas fa-door-open"></i>
                </div>
                <div className="config-content">
                  <label style={{ 
                    display: 'block',
                    marginBottom: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}>Abertura</label>
                  <input
                    type="time"
                    value={workingHours.openingTime}
                    onChange={(e) => handleTimeChange('openingTime', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.625rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      color: '#1a1a1a',
                      background: 'white',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              
              <div 
                className="config-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.background = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#f9fafb';
                }}
              >
                <div 
                  className="config-icon"
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    background: '#3b82f6',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.875rem',
                    flexShrink: 0,
                  }}
                >
                  <i className="fas fa-door-closed"></i>
                </div>
                <div className="config-content">
                  <label style={{ 
                    display: 'block',
                    marginBottom: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}>Fechamento</label>
                  <input
                    type="time"
                    value={workingHours.closingTime}
                    onChange={(e) => handleTimeChange('closingTime', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.625rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      color: '#1a1a1a',
                      background: 'white',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              
              <div 
                className="config-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.background = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#f9fafb';
                }}
              >
                <div 
                  className="config-icon"
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    background: '#3b82f6',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.875rem',
                    flexShrink: 0,
                  }}
                >
                  <i className="fas fa-hourglass-half"></i>
                </div>
                <div className="config-content">
                  <label style={{ 
                    display: 'block',
                    marginBottom: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}>Duração do Horário</label>
                  <select
                    value={workingHours.slotDuration}
                    onChange={(e) => handleTimeChange('slotDuration', parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.625rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      color: '#1a1a1a',
                      background: 'white',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">60 minutos</option>
                  </select>
                </div>
              </div>
              
              <div 
                className="config-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.background = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#f9fafb';
                }}
              >
                <div 
                  className="config-icon"
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    background: '#3b82f6',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.875rem',
                    flexShrink: 0,
                  }}
                >
                  <i className="fas fa-users"></i>
                </div>
                <div className="config-content">
                  <label style={{ 
                    display: 'block',
                    marginBottom: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}>Agendamentos por Horário</label>
                  <select
                    value={workingHours.maxSlotsPerTime}
                    onChange={(e) => handleTimeChange('maxSlotsPerTime', parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.625rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      color: '#1a1a1a',
                      background: 'white',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="1">1 agendamento</option>
                    <option value="2">2 agendamentos</option>
                    <option value="3">3 agendamentos</option>
                    <option value="4">4 agendamentos</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
          
          {/* Dias de Funcionamento */}
          <section 
            className="config-section"
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #f3f4f6',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div 
              className="section-header"
              style={{
                marginBottom: '1.25rem',
              }}
            >
              <h2 
                className="section-title"
                style={{
                  margin: '0 0 0.375rem 0',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <i className="fas fa-calendar-week" style={{ color: '#3b82f6' }}></i>
                Dias de Funcionamento
              </h2>
              <p style={{ 
                margin: 0,
                color: '#6b7280',
                fontSize: '0.875rem',
              }}>
                Selecione os dias da semana com atendimento
              </p>
            </div>
            
            <div className="days-section">
              <div 
                className="days-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: getDaysGridColumns(),
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <div
                    key={day}
                    className={`day-item ${workingDays.includes(day) ? 'active' : ''}`}
                    onClick={() => handleWorkingDayToggle(day)}
                    style={{
                      padding: '0.75rem 0.5rem',
                      background: workingDays.includes(day) ? '#3b82f6' : '#f9fafb',
                      border: `1px solid ${workingDays.includes(day) ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.375rem',
                      color: workingDays.includes(day) ? 'white' : '#1a1a1a',
                    }}
                    onMouseEnter={(e) => {
                      if (!workingDays.includes(day)) {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.background = '#eff6ff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!workingDays.includes(day)) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.background = '#f9fafb';
                      }
                    }}
                  >
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 500 
                    }}>
                      {getDayName(day)}
                    </div>
                    <div style={{ fontSize: '0.75rem' }}>
                      {workingDays.includes(day) && <i className="fas fa-check"></i>}
                    </div>
                  </div>
                ))}
              </div>
              
              <div 
                className="days-summary"
                style={{
                  padding: '0.875rem',
                  background: '#eff6ff',
                  borderRadius: '0.5rem',
                  border: '1px solid #bfdbfe',
                }}
              >
                <div 
                  className="summary-content"
                  style={{
                    display: 'flex',
                    flexDirection: screenWidth < 768 ? 'column' : 'row',
                    gap: screenWidth < 768 ? '0.25rem' : '0.5rem',
                  }}
                >
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 500, 
                    color: '#0369a1',
                    flexShrink: 0,
                  }}>
                    Dias selecionados:
                  </span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: '#1a1a1a', 
                    lineHeight: 1.4 
                  }}>
                    {workingDays.length > 0 
                      ? workingDays.map(day => getFullDayName(day)).join(', ')
                      : 'Nenhum dia selecionado'
                    }
                  </span>
                </div>
              </div>
            </div>
          </section>
          
          {/* Datas Bloqueadas */}
          <section 
            className="config-section"
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #f3f4f6',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div 
              className="section-header"
              style={{
                marginBottom: '1.25rem',
              }}
            >
              <h2 
                className="section-title"
                style={{
                  margin: '0 0 0.375rem 0',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <i className="fas fa-calendar-times" style={{ color: '#3b82f6' }}></i>
                Datas Bloqueadas
              </h2>
              <p style={{ 
                margin: 0,
                color: '#6b7280',
                fontSize: '0.875rem',
              }}>
                Adicione datas em que não haverá atendimento
              </p>
            </div>
            
            <div className="blocked-dates-section">
              <div 
                className="add-date-container"
                style={{
                  display: 'flex',
                  flexDirection: screenWidth < 640 ? 'column' : 'row',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <input
                    type="date"
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    placeholder="Selecione uma data"
                    style={{
                      width: '100%',
                      padding: '0.5625rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      color: '#1a1a1a',
                      background: 'white',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <button 
                  onClick={handleAddBlockedDate}
                  className="add-btn"
                  disabled={!newBlockedDate}
                  style={{
                    padding: '0.5625rem 1rem',
                    background: !newBlockedDate ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: 500,
                    cursor: !newBlockedDate ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    opacity: !newBlockedDate ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (newBlockedDate) {
                      e.currentTarget.style.background = '#2563eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newBlockedDate) {
                      e.currentTarget.style.background = '#3b82f6';
                    }
                  }}
                >
                  <i className="fas fa-plus"></i>
                  <span>Adicionar</span>
                </button>
              </div>
              
              {blockedDates.length === 0 ? (
                <div 
                  className="empty-state"
                  style={{
                    textAlign: 'center',
                    padding: '2rem 1rem',
                    color: '#9ca3af',
                  }}
                >
                  <i 
                    className="fas fa-calendar-check"
                    style={{ 
                      fontSize: '1.5rem', 
                      marginBottom: '0.5rem', 
                      opacity: 0.5 
                    }}
                  ></i>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>
                    Nenhuma data bloqueada
                  </p>
                </div>
              ) : (
                <div 
                  className="dates-list"
                  style={{
                    background: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                  }}
                >
                  <div 
                    className="list-header"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      background: '#f3f4f6',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    <span>Datas bloqueadas ({blockedDates.length})</span>
                    <button 
                      className="clear-btn"
                      onClick={() => setBlockedDates([])}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                      }}
                    >
                      Limpar tudo
                    </button>
                  </div>
                  
                  <div 
                    className="dates-container"
                    style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}
                  >
                    {blockedDates.map((date) => {
                      const dateObj = new Date(date);
                      const isToday = dateObj.toDateString() === new Date().toDateString();
                      const isFuture = dateObj > new Date();
                      
                      return (
                        <div 
                          key={date} 
                          className="date-item"
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid #e5e7eb',
                          }}
                        >
                          <div 
                            className="date-info"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                            }}
                          >
                            <i 
                              className="fas fa-calendar"
                              style={{ 
                                color: '#6b7280', 
                                fontSize: '0.875rem' 
                              }}
                            ></i>
                            <div 
                              className="date-details"
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <div 
                                className="date-display"
                                style={{
                                  fontSize: '0.875rem',
                                  color: '#1a1a1a',
                                }}
                              >
                                {dateObj.toLocaleDateString('pt-BR', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                              <div 
                                className="date-status"
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#6b7280',
                                  marginTop: '0.125rem',
                                }}
                              >
                                {isToday ? 'Hoje' : isFuture ? 'Futuro' : 'Passado'}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveBlockedDate(date)}
                            className="remove-btn"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#6b7280',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              borderRadius: '0.25rem',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                              e.currentTarget.style.color = '#ef4444';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'none';
                              e.currentTarget.style.color = '#6b7280';
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
          
          {/* Preview do Horário */}
          <section 
            className="preview-section"
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid #f3f4f6',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div 
              className="section-header"
              style={{
                marginBottom: '1.25rem',
              }}
            >
              <h2 
                className="section-title"
                style={{
                  margin: '0 0 0.375rem 0',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <i className="fas fa-eye" style={{ color: '#3b82f6' }}></i>
                Preview do Horário
              </h2>
              <p style={{ 
                margin: 0,
                color: '#6b7280',
                fontSize: '0.875rem',
              }}>
                Visualize as configurações aplicadas
              </p>
            </div>
            
            <div 
              className="preview-content"
              style={{
                display: 'flex',
                flexDirection: screenWidth < 1024 ? 'column' : 'row',
                gap: screenWidth < 1024 ? '1.5rem' : '2rem',
              }}
            >
              <div 
                className="preview-summary"
                style={{
                  display: 'grid',
                  gridTemplateColumns: getPreviewGridColumns(),
                  gap: '0.875rem',
                  width: '100%',
                }}
              >
                <div 
                  className="summary-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div 
                    className="card-icon"
                    style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      background: '#3b82f6',
                      borderRadius: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.875rem',
                      flexShrink: 0,
                    }}
                  >
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="card-content">
                    <div 
                      className="card-value"
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '0.125rem',
                      }}
                    >
                      {workingHours.openingTime} - {workingHours.closingTime}
                    </div>
                    <div 
                      className="card-label"
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                      }}
                    >
                      Horário de funcionamento
                    </div>
                  </div>
                </div>
                
                <div 
                  className="summary-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div 
                    className="card-icon"
                    style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      background: '#3b82f6',
                      borderRadius: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.875rem',
                      flexShrink: 0,
                    }}
                  >
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <div className="card-content">
                    <div 
                      className="card-value"
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '0.125rem',
                      }}
                    >
                      {workingDays.length} dias
                    </div>
                    <div 
                      className="card-label"
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                      }}
                    >
                      Dias ativos na semana
                    </div>
                  </div>
                </div>
                
                <div 
                  className="summary-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div 
                    className="card-icon"
                    style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      background: '#3b82f6',
                      borderRadius: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.875rem',
                      flexShrink: 0,
                    }}
                  >
                    <i className="fas fa-stopwatch"></i>
                  </div>
                  <div className="card-content">
                    <div 
                      className="card-value"
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '0.125rem',
                      }}
                    >
                      {workingHours.slotDuration} min
                    </div>
                    <div 
                      className="card-label"
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                      }}
                    >
                      Duração por horário
                    </div>
                  </div>
                </div>
              </div>
              
              <div 
                className="preview-slots"
                style={{
                  padding: '1.25rem',
                  background: '#f9fafb',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  width: '100%',
                }}
              >
                <div 
                  className="slots-header"
                  style={{
                    marginBottom: '1rem',
                  }}
                >
                  <h3 style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '1rem', 
                    fontWeight: 600, 
                    color: '#1a1a1a' 
                  }}>
                    Horários Disponíveis
                  </h3>
                  <div 
                    className="slots-stats"
                    style={{
                      display: 'flex',
                      flexDirection: screenWidth < 640 ? 'column' : 'row',
                      gap: screenWidth < 640 ? '0.375rem' : '1rem',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                    }}
                  >
                    <span className="slots-count">{timeSlots.length} horários</span>
                    <span 
                      className="slots-capacity"
                      style={{
                        background: '#dbeafe',
                        color: '#1e40af',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontWeight: 500,
                        display: 'inline-block',
                      }}
                    >
                      {workingHours.maxSlotsPerTime} por horário
                    </span>
                  </div>
                </div>
                
                <div 
                  className="slots-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: getSlotsGridColumns(),
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  {timeSlots.slice(0, 12).map((time) => (
                    <div 
                      key={time} 
                      className="slot-item"
                      style={{
                        padding: '0.5rem',
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        color: '#1a1a1a',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.background = '#eff6ff';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {time}
                    </div>
                  ))}
                </div>
                
                {timeSlots.length > 12 && (
                  <div 
                    className="more-slots"
                    style={{
                      textAlign: 'center',
                      color: '#3b82f6',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      padding: '0.5rem',
                      background: '#dbeafe',
                      borderRadius: '0.25rem',
                    }}
                  >
                    + {timeSlots.length - 12} horários disponíveis
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
      
      {/* Notificação de Sucesso */}
      {showSuccess && (
        <div 
          className="success-notification"
          style={{
            position: 'fixed',
            bottom: '1rem',
            left: '1rem',
            right: '1rem',
            background: 'white',
            borderRadius: '0.5rem',
            padding: '0.875rem 1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #bbf7d0',
            animation: 'slideIn 0.3s ease',
            zIndex: 1000,
          }}
        >
          <div 
            className="notification-content"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <i 
              className="fas fa-check-circle"
              style={{ color: '#10b981', fontSize: '1rem' }}
            ></i>
            <span style={{ fontWeight: 500, color: '#065f46', fontSize: '0.875rem' }}>
              {successMessage}
            </span>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .mobile-header {
            display: flex !important;
          }
          
          .schedule-main {
            padding-top: calc(1.5rem + 72px) !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-header {
            display: none !important;
          }
        }
        
        @media (max-width: 640px) {
          .schedule-main {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          
          .config-section,
          .preview-section {
            padding: 1rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .schedule-main {
            padding: calc(1rem + 72px) 0.75rem 0.75rem 0.75rem !important;
          }
          
          .date-card {
            flex-direction: column !important;
            text-align: center !important;
            gap: 0.5rem !important;
            padding: 0.75rem !important;
          }
          
          .date-display {
            justify-content: center !important;
          }
          
          .days-summary {
            padding: 0.75rem !important;
          }
          
          .summary-content {
            align-items: stretch !important;
          }
          
          .save-btn span,
          .add-btn span {
            font-size: 0.75rem !important;
          }
          
          .config-content input,
          .config-content select,
          input[type="date"] {
            font-size: 0.75rem !important;
            padding: 0.5rem 0.625rem !important;
          }
          
          .slot-item {
            font-size: 0.75rem !important;
            padding: 0.375rem !important;
          }
        }
        
        @media (max-width: 320px) {
          .schedule-main {
            padding: calc(0.75rem + 72px) 0.5rem 0.5rem 0.5rem !important;
          }
          
          .greeting-section h1 {
            font-size: 1.5rem !important;
          }
          
          .config-section,
          .preview-section {
            padding: 0.75rem !important;
          }
          
          .config-card {
            padding: 0.75rem !important;
          }
          
          .config-icon {
            width: 2rem !important;
            height: 2rem !important;
          }
          
          .day-item {
            padding: 0.5rem 0.25rem !important;
          }
          
          .days-summary {
            padding: 0.5rem !important;
          }
          
          .summary-card {
            padding: 0.75rem !important;
          }
          
          .card-icon {
            width: 2rem !important;
            height: 2rem !important;
          }
          
          .card-value {
            font-size: 0.875rem !important;
          }
          
          .preview-slots {
            padding: 1rem !important;
          }
          
          .success-notification {
            left: 0.5rem !important;
            right: 0.5rem !important;
            bottom: 0.5rem !important;
            padding: 0.75rem !important;
          }
        }
        
        @media (min-width: 641px) and (max-width: 768px) {
          .days-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
          
          .config-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1023px) {
          .config-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .preview-grid {
            grid-template-columns: 1fr !important;
          }
          
          .slots-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
        
        @media (min-width: 1024px) and (max-width: 1279px) {
          .config-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .preview-summary {
            width: 40% !important;
          }
          
          .preview-slots {
            width: 60% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSchedule;