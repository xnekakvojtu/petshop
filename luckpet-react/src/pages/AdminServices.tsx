import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/Admin/AdminSidebar';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ServiceType } from '../types';

const AdminServices: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAuth();
  const { 
    services, 
    loading, 
    fetchAllServices, 
    handleCreateService, 
    updateService 
  } = useAdmin();
  
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '30',
    category: 'banho',
    active: true,
  });
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  const [previewPrice, setPreviewPrice] = useState('0.00');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isAdmin && !isLoading) {
      navigate('/login');
    }
    fetchAllServices();
    
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setScreenWidth(window.innerWidth);
      if (!mobile) setSidebarOpen(false);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAdmin, isLoading, navigate, fetchAllServices]);

  useEffect(() => {
    const price = parseFloat(formData.price) || 0;
    setPreviewPrice(price.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }));
  }, [formData.price]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      category: formData.category,
      active: formData.active,
    };

    try {
      if (editingService) {
        await updateService(editingService.id, serviceData);
        showSuccessMessage('Serviço atualizado com sucesso!');
      } else {
        await handleCreateService(serviceData);
        showSuccessMessage('Serviço criado com sucesso!');
      }
      
      resetForm();
      fetchAllServices();
    } catch (error) {
      showSuccessMessage('Erro ao salvar serviço. Tente novamente.');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '30',
      category: 'banho',
      active: true,
    });
    setEditingService(null);
  };

  const handleEdit = (service: ServiceType) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category || 'banho',
      active: service.active,
    });
    setShowForm(true);
  };

  const handleToggleActive = async (service: ServiceType) => {
    try {
      await updateService(service.id, { active: !service.active });
      showSuccessMessage(`Serviço ${!service.active ? 'ativado' : 'desativado'} com sucesso!`);
      fetchAllServices();
    } catch (error) {
      showSuccessMessage('Erro ao atualizar serviço');
    }
  };

  const handleDelete = async (service: ServiceType) => {
    if (window.confirm(`Tem certeza que deseja excluir o serviço "${service.name}"? Esta ação não pode ser desfeita.`)) {
      showSuccessMessage('Funcionalidade de exclusão em desenvolvimento');
    }
  };

  const formatCategory = (category?: string) => {
    if (!category) return 'Outro';
    
    const categories: Record<string, string> = {
      'banho': 'Banho',
      'tosa': 'Tosa',
      'consulta': 'Consulta Veterinária',
      'vacinacao': 'Vacinação',
      'exame': 'Exame',
      'outro': 'Outro'
    };
    return categories[category] || category;
  };

  const getCategoryIcon = (category?: string) => {
    if (!category) return 'fa-paw';
    
    const icons: Record<string, string> = {
      'banho': 'fa-shower',
      'tosa': 'fa-cut',
      'consulta': 'fa-stethoscope',
      'vacinacao': 'fa-syringe',
      'exame': 'fa-microscope',
      'outro': 'fa-paw'
    };
    return icons[category] || 'fa-paw';
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return '#6b7280';
    
    const colors: Record<string, string> = {
      'banho': '#3b82f6',
      'tosa': '#7c3aed',
      'consulta': '#10b981',
      'vacinacao': '#ef4444',
      'exame': '#f59e0b',
      'outro': '#6b7280'
    };
    return colors[category] || '#6b7280';
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

  const currentDate = getCurrentDate();

  const getServicesGridColumns = () => {
    if (screenWidth < 640) return '1fr';
    if (screenWidth < 1024) return 'repeat(2, 1fr)';
    return 'repeat(3, 1fr)';
  };

  if (!isAdmin && !isLoading) {
    return null;
  }

  return (
    <div className="admin-services" style={{ 
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
                color: '#7c3aed',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f3ff';
                e.currentTarget.style.borderColor = '#ddd6fe';
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
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                <i className="fas fa-scissors"></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Serviços</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>LuckPet</span>
              </div>
            </div>
          </div>
        )}
        
        <main 
          className="services-main"
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
                }}>Gerenciar Serviços</h1>
                <p style={{ 
                  margin: 0, 
                  color: '#6b7280', 
                  fontSize: isMobile ? '0.9375rem' : '1rem',
                  lineHeight: 1.5
                }}>Modelos base para agendamentos</p>
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
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}
                  >
                    <i className="fas fa-calendar-alt"></i>
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
                  className="new-service-btn"
                  onClick={() => setShowForm(true)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center',
                    fontSize: '0.9375rem',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <i className="fas fa-plus"></i>
                  <span style={{ fontSize: '0.875rem' }}>Novo Serviço</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Formulário de Serviço */}
          {showForm && (
            <section 
              className="service-form-section"
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
                className="form-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <div 
                  className="form-title"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <i 
                    className={editingService ? 'fas fa-edit' : 'fas fa-plus-circle'}
                    style={{ color: '#7c3aed', fontSize: '1.25rem' }}
                  ></i>
                  <h2 style={{ 
                    margin: 0,
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#111827',
                  }}>
                    {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                  </h2>
                </div>
                <button 
                  className="close-btn"
                  onClick={resetForm}
                  aria-label="Fechar formulário"
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '8px',
                    background: '#f3f4f6',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    fontSize: '1rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e5e7eb';
                    e.currentTarget.style.color = '#4b5563';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div 
                className="form-container"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                }}
              >
                <form onSubmit={handleSubmit} 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                  }}
                >
                  <div 
                    className="form-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: '1rem',
                    }}
                  >
                    {/* Nome do Serviço */}
                    <div className="form-group">
                      <label htmlFor="name" style={{
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        marginBottom: '0.375rem',
                      }}>
                        <i className="fas fa-tag" style={{ color: '#7c3aed', fontSize: '0.875rem' }}></i>
                        Nome do Serviço *
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ex: Banho Completo"
                        required
                        autoFocus
                        style={{
                          padding: '0.625rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          color: '#1a1a1a',
                          background: 'white',
                          transition: 'all 0.2s',
                          width: '100%',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#7c3aed';
                          e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    {/* Categoria */}
                    <div className="form-group">
                      <label htmlFor="category" style={{
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        marginBottom: '0.375rem',
                      }}>
                        <i className="fas fa-filter" style={{ color: '#7c3aed', fontSize: '0.875rem' }}></i>
                        Categoria
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        style={{
                          padding: '0.625rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          color: '#1a1a1a',
                          background: 'white',
                          transition: 'all 0.2s',
                          width: '100%',
                          cursor: 'pointer',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#7c3aed';
                          e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="banho">Banho</option>
                        <option value="tosa">Tosa</option>
                        <option value="consulta">Consulta Veterinária</option>
                        <option value="vacinacao">Vacinação</option>
                        <option value="exame">Exame</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    
                    {/* Preço */}
                    <div className="form-group">
                      <label htmlFor="price" style={{
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        marginBottom: '0.375rem',
                      }}>
                        <i className="fas fa-dollar-sign" style={{ color: '#7c3aed', fontSize: '0.875rem' }}></i>
                        Preço (R$) *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{
                          position: 'absolute',
                          left: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#6b7280',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                        }}>R$</span>
                        <input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="45.00"
                          required
                          style={{
                            padding: '0.625rem 2.25rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            color: '#1a1a1a',
                            background: 'white',
                            transition: 'all 0.2s',
                            width: '100%',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#7c3aed';
                            e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Duração */}
                    <div className="form-group">
                      <label htmlFor="duration" style={{
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        marginBottom: '0.375rem',
                      }}>
                        <i className="fas fa-clock" style={{ color: '#7c3aed', fontSize: '0.875rem' }}></i>
                        Duração *
                      </label>
                      <select
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                        style={{
                          padding: '0.625rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          color: '#1a1a1a',
                          background: 'white',
                          transition: 'all 0.2s',
                          width: '100%',
                          cursor: 'pointer',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#7c3aed';
                          e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="15">15 minutos</option>
                        <option value="30">30 minutos</option>
                        <option value="45">45 minutos</option>
                        <option value="60">1 hora</option>
                        <option value="90">1 hora 30</option>
                        <option value="120">2 horas</option>
                      </select>
                    </div>
                    
                    {/* Descrição */}
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label htmlFor="description" style={{
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        marginBottom: '0.375rem',
                      }}>
                        <i className="fas fa-align-left" style={{ color: '#7c3aed', fontSize: '0.875rem' }}></i>
                        Descrição
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Descreva os detalhes do serviço..."
                        rows={3}
                        style={{
                          padding: '0.625rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          color: '#1a1a1a',
                          background: 'white',
                          transition: 'all 0.2s',
                          width: '100%',
                          resize: 'vertical',
                          minHeight: '80px',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#7c3aed';
                          e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    {/* Status Ativo */}
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: 500,
                        color: '#4b5563',
                        fontSize: '0.875rem',
                      }}>
                        <input
                          type="checkbox"
                          name="active"
                          checked={formData.active}
                          onChange={handleInputChange}
                          style={{
                            width: '1rem',
                            height: '1rem',
                            margin: 0,
                          }}
                        />
                        <i className="fas fa-check-circle" style={{ color: '#10b981', fontSize: '0.875rem' }}></i>
                        <span>Serviço ativo para agendamentos</span>
                      </label>
                    </div>
                  </div>
                  
                  <div 
                    className="form-actions"
                    style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: '0.75rem',
                      paddingTop: '1.25rem',
                      borderTop: '1px solid #e5e7eb',
                    }}
                  >
                    <button 
                      type="button"
                      className="btn-cancel"
                      onClick={resetForm}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        color: '#6b7280',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.875rem',
                        flex: 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e5e7eb';
                        e.currentTarget.style.color = '#4b5563';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f3f4f6';
                        e.currentTarget.style.color = '#6b7280';
                      }}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn-save"
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                        fontSize: '0.875rem',
                        flex: 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <i className={editingService ? 'fas fa-save' : 'fas fa-check'}></i>
                      {editingService ? 'Atualizar Serviço' : 'Criar Serviço'}
                    </button>
                  </div>
                </form>
                
                {/* Preview do Serviço */}
                <div 
                  className="service-preview-card"
                  style={{
                    background: '#f9fafb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div 
                    className="preview-header"
                    style={{
                      padding: '1rem 1.25rem',
                      background: 'white',
                      borderBottom: '1px solid #e5e7eb',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <h3 style={{ 
                      margin: 0,
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: '#1a1a1a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      <i className="fas fa-eye" style={{ color: '#7c3aed' }}></i>
                      Preview do Serviço
                    </h3>
                    <span 
                      className={`status-badge ${formData.active ? 'active' : 'inactive'}`}
                      style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '1rem',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        background: formData.active ? '#d1fae5' : '#fee2e2',
                        color: formData.active ? '#065f46' : '#991b1b',
                      }}
                    >
                      {formData.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div 
                        className="preview-icon"
                        style={{ 
                          width: '3.5rem',
                          height: '3.5rem',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1.25rem',
                          flexShrink: 0,
                          background: `linear-gradient(135deg, ${getCategoryColor(formData.category)} 0%, color-mix(in srgb, ${getCategoryColor(formData.category)} 70%, white) 100%)`,
                        }}
                      >
                        <i className={`fas ${getCategoryIcon(formData.category)}`}></i>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          margin: '0 0 0.5rem 0', 
                          fontSize: '1.125rem', 
                          fontWeight: 600, 
                          color: '#1a1a1a' 
                        }}>
                          {formData.name || 'Nome do Serviço'}
                        </h4>
                        <div 
                          className="preview-meta"
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.75rem',
                          }}
                        >
                          <span 
                            className="preview-category"
                            style={{
                              padding: '0.25rem 0.625rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              backgroundColor: `${getCategoryColor(formData.category)}20`,
                              color: getCategoryColor(formData.category),
                            }}
                          >
                            <i className="fas fa-tag"></i>
                            {formatCategory(formData.category)}
                          </span>
                          <span 
                            className="preview-duration"
                            style={{
                              padding: '0.25rem 0.625rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              background: '#f3f4f6',
                              color: '#6b7280',
                            }}
                          >
                            <i className="fas fa-clock"></i>
                            {formData.duration} min
                          </span>
                        </div>
                        <div 
                          className="preview-price"
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: '#10b981',
                            marginBottom: '0.75rem',
                          }}
                        >
                          R$ {previewPrice}
                        </div>
                        {formData.description && (
                          <p 
                            className="preview-description"
                            style={{
                              color: '#6b7280',
                              fontSize: '0.875rem',
                              lineHeight: 1.5,
                              margin: '0 0 1rem 0',
                            }}
                          >
                            {formData.description}
                          </p>
                        )}
                        <div 
                          className="preview-footer"
                          style={{
                            borderTop: '1px solid #e5e7eb',
                            paddingTop: '0.75rem',
                          }}
                        >
                          <div 
                            className="preview-info"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              color: '#6b7280',
                              fontSize: '0.6875rem',
                            }}
                          >
                            <i className="fas fa-info-circle" style={{ color: '#3b82f6' }}></i>
                            <span>Este é um modelo base para criar agendamentos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
          
          {/* Lista de Serviços */}
          <section 
            className="services-section"
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
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div className="section-title-group">
                <h2 
                  className="section-title"
                  style={{
                    margin: 0,
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <i className="fas fa-list" style={{ color: '#7c3aed' }}></i>
                  Serviços Cadastrados
                </h2>
                <p style={{ 
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '0.875rem',
                }}>
                  {services.length} {services.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}
                </p>
              </div>
              
              <div 
                className="section-controls"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <div 
                  className="view-toggle"
                  style={{
                    display: 'flex',
                    background: '#f3f4f6',
                    padding: '0.25rem',
                    borderRadius: '8px',
                  }}
                >
                  <button 
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Visualização em grade"
                    style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      borderRadius: '6px',
                      background: viewMode === 'grid' ? 'white' : 'transparent',
                      border: 'none',
                      color: viewMode === 'grid' ? '#7c3aed' : '#6b7280',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      fontSize: '0.875rem',
                    }}
                    onMouseEnter={(e) => {
                      if (viewMode !== 'grid') {
                        e.currentTarget.style.background = '#e5e7eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (viewMode !== 'grid') {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <i className="fas fa-th-large"></i>
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="Visualização em lista"
                    style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      borderRadius: '6px',
                      background: viewMode === 'list' ? 'white' : 'transparent',
                      border: 'none',
                      color: viewMode === 'list' ? '#7c3aed' : '#6b7280',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      fontSize: '0.875rem',
                    }}
                    onMouseEnter={(e) => {
                      if (viewMode !== 'list') {
                        e.currentTarget.style.background = '#e5e7eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (viewMode !== 'list') {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <i className="fas fa-list"></i>
                  </button>
                </div>
                
                <button 
                  className="refresh-btn"
                  onClick={() => fetchAllServices()}
                  disabled={loading.services}
                  title="Atualizar lista"
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '8px',
                    background: '#f3f4f6',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                >
                  <i className={`fas fa-sync ${loading.services ? 'fa-spin' : ''}`}></i>
                </button>
              </div>
            </div>
            
            <div className="services-content">
              {loading.services ? (
                <div 
                  className="loading-state"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3rem 1.5rem',
                    textAlign: 'center',
                  }}
                >
                  <div 
                    className="spinner"
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      border: '3px solid #e5e7eb',
                      borderTopColor: '#7c3aed',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginBottom: '1rem',
                    }}
                  ></div>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                    Carregando serviços...
                  </p>
                </div>
              ) : services.length === 0 ? (
                <div 
                  className="empty-state"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3rem 1.5rem',
                    textAlign: 'center',
                  }}
                >
                  <i 
                    className="fas fa-cut"
                    style={{ 
                      fontSize: '2.5rem', 
                      color: '#d1d5db', 
                      marginBottom: '1rem' 
                    }}
                  ></i>
                  <h3 style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: '#4b5563', 
                    fontSize: '1.125rem' 
                  }}>
                    Nenhum serviço cadastrado
                  </h3>
                  <p style={{ 
                    margin: '0 0 1rem 0', 
                    color: '#6b7280', 
                    maxWidth: '300px',
                    fontSize: '0.875rem', 
                    lineHeight: 1.5 
                  }}>
                    Crie seu primeiro serviço para começar a receber agendamentos
                  </p>
                  <button 
                    className="btn-primary"
                    onClick={() => setShowForm(true)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s',
                      fontSize: '0.875rem',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <i className="fas fa-plus"></i>
                    Criar Primeiro Serviço
                  </button>
                </div>
              ) : (
                <div 
                  className={`services-container ${viewMode}`}
                  style={{
                    display: viewMode === 'grid' ? 'grid' : 'flex',
                    gridTemplateColumns: viewMode === 'grid' ? getServicesGridColumns() : 'none',
                    flexDirection: viewMode === 'list' ? 'column' : 'row',
                    gap: '1rem',
                  }}
                >
                  {services.map((service) => {
                    const safeCategory = service.category || 'outro';
                    return (
                      <div 
                        key={service.id} 
                        className={`service-card ${!service.active ? 'inactive' : ''}`}
                        style={{
                          background: 'white',
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          transition: 'all 0.2s',
                          overflow: 'hidden',
                          opacity: !service.active ? 0.7 : 1,
                         
                          display: viewMode === 'list' ? 'flex' : 'block',
                         
                          ...(viewMode === 'list' && isMobile ? { flexDirection: 'column' } : 
                              viewMode === 'list' ? { flexDirection: 'row', alignItems: 'center', padding: '1.25rem', gap: '1rem' } : {})
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#7c3aed';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.1)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div 
                          className="card-header"
                          style={{
                            padding: viewMode === 'list' && !isMobile ? '0' : '1rem',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            flex: viewMode === 'list' && !isMobile ? 1 : 'none',
                          }}
                        >
                          <div 
                            className="service-icon"
                            style={{ 
                              width: viewMode === 'list' ? '2.5rem' : '3rem',
                              height: viewMode === 'list' ? '2.5rem' : '3rem',
                              borderRadius: viewMode === 'list' ? '8px' : '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: viewMode === 'list' ? '1rem' : '1.25rem',
                              flexShrink: 0,
                              background: `linear-gradient(135deg, ${getCategoryColor(safeCategory)} 0%, color-mix(in srgb, ${getCategoryColor(safeCategory)} 70%, white) 100%)`,
                            }}
                          >
                            <i className={`fas ${getCategoryIcon(safeCategory)}`}></i>
                          </div>
                          <div 
                            className="service-info"
                            style={{
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <h3 
                              className="service-name"
                              style={{
                                margin: '0 0 0.375rem 0',
                                fontSize: viewMode === 'list' ? '1rem' : '1.125rem',
                                fontWeight: 600,
                                color: '#1a1a1a',
                                wordBreak: 'break-word',
                              }}
                            >
                              {service.name}
                            </h3>
                            <div 
                              className="service-meta"
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}
                            >
                              <span 
                                className="service-category"
                                style={{
                                  padding: '0.25rem 0.625rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  backgroundColor: `${getCategoryColor(safeCategory)}20`,
                                  color: getCategoryColor(safeCategory),
                                }}
                              >
                                {formatCategory(safeCategory)}
                              </span>
                              <span 
                                className="service-duration"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  color: '#6b7280',
                                  fontSize: '0.75rem',
                                }}
                              >
                                <i className="fas fa-clock" style={{ fontSize: '0.6875rem' }}></i>
                                {service.duration} min
                              </span>
                            </div>
                          </div>
                          <div 
                            className="service-price"
                            style={{
                              fontSize: viewMode === 'list' ? '1rem' : '1.25rem',
                              fontWeight: 700,
                              color: '#10b981',
                              flexShrink: 0,
                              ...(viewMode === 'list' && { marginLeft: 'auto' })
                            }}
                          >
                            R$ {service.price.toFixed(2)}
                          </div>
                        </div>
                        
                        <div 
                          className="card-body"
                          style={{
                            padding: viewMode === 'list' && !isMobile ? '0' : '0 1rem 1rem',
                            flex: viewMode === 'list' && !isMobile ? 2 : 'none',
                          }}
                        >
                          {service.description && (
                            <p 
                              className="service-description"
                              style={{
                                color: '#6b7280',
                                fontSize: '0.875rem',
                                lineHeight: 1.4,
                                margin: viewMode === 'list' ? '0' : '0 0 0.75rem 0',
                                display: '-webkit-box',
                                WebkitLineClamp: viewMode === 'list' ? 1 : 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {service.description}
                            </p>
                          )}
                          
                          <div 
                            className="service-footer"
                            style={{
                              display: 'flex',
                              flexDirection: viewMode === 'list' && isMobile ? 'column' : 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '0.75rem',
                            }}
                          >
                            <div 
                              className="service-type-info"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                color: '#6b7280',
                                fontSize: '0.75rem',
                              }}
                            >
                              <i className="fas fa-cube" style={{ color: '#3b82f6', fontSize: '0.75rem' }}></i>
                              <span>Modelo base para agendamentos</span>
                            </div>
                            <span 
                              className={`service-status ${service.active ? 'active' : 'inactive'}`}
                              style={{
                                padding: '0.25rem 0.625rem',
                                borderRadius: '1rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                background: service.active ? '#d1fae5' : '#fee2e2',
                                color: service.active ? '#065f46' : '#991b1b',
                                alignSelf: 'flex-start',
                              }}
                            >
                              <span 
                                className="status-dot"
                                style={{
                                  width: '0.375rem',
                                  height: '0.375rem',
                                  borderRadius: '50%',
                                  background: service.active ? '#10b981' : '#ef4444',
                                }}
                              ></span>
                              {service.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </div>
                        
                        <div 
                          className="card-actions"
                          style={{
                            padding: viewMode === 'list' && !isMobile ? '0' : '0.75rem 1rem',
                            borderTop: viewMode === 'list' && !isMobile ? 'none' : '1px solid #e5e7eb',
                            display: 'flex',
                            gap: '0.5rem',
                            ...(viewMode === 'list' && !isMobile && { width: 'auto' })
                          }}
                        >
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => handleEdit(service)}
                            title="Editar serviço"
                            style={{
                              flex: viewMode === 'list' && !isMobile ? 'none' : 1,
                              padding: viewMode === 'list' && !isMobile ? '0.375rem' : '0.5rem 0.75rem',
                              borderRadius: '8px',
                              border: 'none',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.375rem',
                              fontSize: '0.875rem',
                              transition: 'all 0.2s',
                              background: '#dbeafe',
                              color: '#1e40af',
                              width: viewMode === 'list' && !isMobile ? '2.5rem' : 'auto',
                              height: viewMode === 'list' && !isMobile ? '2.5rem' : 'auto',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#bfdbfe';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#dbeafe';
                            }}
                          >
                            <i className="fas fa-edit"></i>
                            {viewMode === 'list' && !isMobile ? '' : <span>Editar</span>}
                          </button>
                          <button 
                            className={`action-btn toggle-btn ${service.active ? 'deactivate' : 'activate'}`}
                            onClick={() => handleToggleActive(service)}
                            title={service.active ? 'Desativar serviço' : 'Ativar serviço'}
                            style={{
                              flex: viewMode === 'list' && !isMobile ? 'none' : 1,
                              padding: viewMode === 'list' && !isMobile ? '0.375rem' : '0.5rem 0.75rem',
                              borderRadius: '8px',
                              border: 'none',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.375rem',
                              fontSize: '0.875rem',
                              transition: 'all 0.2s',
                              background: service.active ? '#fee2e2' : '#d1fae5',
                              color: service.active ? '#991b1b' : '#065f46',
                              width: viewMode === 'list' && !isMobile ? '2.5rem' : 'auto',
                              height: viewMode === 'list' && !isMobile ? '2.5rem' : 'auto',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = service.active ? '#fecaca' : '#a7f3d0';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = service.active ? '#fee2e2' : '#d1fae5';
                            }}
                          >
                            <i className={`fas fa-${service.active ? 'eye-slash' : 'eye'}`}></i>
                            {viewMode === 'list' && !isMobile ? '' : <span>{service.active ? 'Desativar' : 'Ativar'}</span>}
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(service)}
                            title="Excluir serviço"
                            style={{
                              flex: viewMode === 'list' && !isMobile ? 'none' : 1,
                              padding: viewMode === 'list' && !isMobile ? '0.375rem' : '0.5rem 0.75rem',
                              borderRadius: '8px',
                              border: 'none',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.375rem',
                              fontSize: '0.875rem',
                              transition: 'all 0.2s',
                              background: '#f3f4f6',
                              color: '#ef4444',
                              width: viewMode === 'list' && !isMobile ? '2.5rem' : 'auto',
                              height: viewMode === 'list' && !isMobile ? '2.5rem' : 'auto',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#fee2e2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f3f4f6';
                            }}
                          >
                            <i className="fas fa-trash"></i>
                            {viewMode === 'list' && !isMobile ? '' : <span>Excluir</span>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>
        
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
              borderRadius: '8px',
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
              <i className="fas fa-check-circle" style={{ color: '#10b981', fontSize: '1rem' }}></i>
              <span style={{ fontWeight: 500, color: '#065f46', fontSize: '0.875rem' }}>
                {successMessage}
              </span>
            </div>
          </div>
        )}
      </div>
      
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
          
          .services-main {
            padding-top: calc(1.5rem + 72px) !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-header {
            display: none !important;
          }
        }
        
        @media (max-width: 640px) {
          .services-main {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          
          .service-form-section,
          .services-section {
            padding: 1rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .services-main {
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
          
          .form-grid {
            grid-template-columns: 1fr !important;
          }
          
          .service-card.list {
            flex-direction: column !important;
          }
          
          .card-actions.list {
            width: 100% !important;
          }
          
          .action-btn.list span {
            display: inline !important;
          }
          
          .action-btn.list {
            width: auto !important;
            flex: 1 !important;
          }
        }
        
        @media (max-width: 320px) {
          .services-main {
            padding: calc(0.75rem + 72px) 0.5rem 0.5rem 0.5rem !important;
          }
          
          .greeting-section h1 {
            font-size: 1.5rem !important;
          }
          
          .new-service-btn span,
          .action-btn span {
            font-size: 0.75rem !important;
          }
          
          .service-price {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminServices;