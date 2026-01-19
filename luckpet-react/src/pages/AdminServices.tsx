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

  useEffect(() => {
    if (!isAdmin && !isLoading) {
      navigate('/');
    }
    fetchAllServices();
  }, [isAdmin, isLoading, navigate, fetchAllServices]);

  useEffect(() => {
    // Atualiza preview do preço
    const price = parseFloat(formData.price) || 0;
    setPreviewPrice(price.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }));
  }, [formData.price]);

  // Data atual formatada
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
        showNotification('Serviço atualizado com sucesso!', 'success');
      } else {
        await handleCreateService(serviceData);
        showNotification('Serviço criado com sucesso!', 'success');
      }
      
      resetForm();
      fetchAllServices();
    } catch (error) {
      showNotification('Erro ao salvar serviço', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const event = new CustomEvent('notification', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
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
      category: service.category || 'banho', // Fallback para 'banho' se não houver category
      active: service.active,
    });
    setShowForm(true);
  };

  const handleToggleActive = async (service: ServiceType) => {
    try {
      await updateService(service.id, { active: !service.active });
      showNotification(`Serviço ${!service.active ? 'ativado' : 'desativado'} com sucesso!`, 'success');
      fetchAllServices();
    } catch (error) {
      showNotification('Erro ao atualizar serviço', 'error');
    }
  };

  const handleDelete = async (service: ServiceType) => {
    if (window.confirm(`Tem certeza que deseja excluir o serviço "${service.name}"? Esta ação não pode ser desfeita.`)) {
      showNotification('Funcionalidade de exclusão em desenvolvimento', 'info');
    }
  };

  // Função segura para formatar categoria (com fallback)
  const formatCategory = (category?: string) => {
    if (!category) return 'Outro';
    
    const categories: Record<string, string> = {
      'banho': 'Banho',
      'tosa': 'Tosa',
      'consulta': 'Consulta',
      'vacinacao': 'Vacinação',
      'exame': 'Exame',
      'outro': 'Outro'
    };
    return categories[category] || category;
  };

  // Função segura para obter ícone (com fallback)
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

  // Função para obter a categoria de forma segura
  const getSafeCategory = (service: ServiceType) => {
    return service.category || 'outro';
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-services">
      <AdminSidebar />
      
      <div className="admin-content">
        {/* Header com Data */}
        <div className="content-header">
          <div className="header-main">
            <div>
              <h1>Gerenciar Serviços</h1>
              <p>Gerencie os serviços disponíveis para agendamento</p>
            </div>
            <div className="current-date">
              <i className="fas fa-calendar-day"></i>
              <span>{currentDate.weekday}, {currentDate.day} {currentDate.month}</span>
            </div>
          </div>
          
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-cut"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{services.length}</div>
                <div className="stat-label">Total</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{services.filter(s => s.active).length}</div>
                <div className="stat-label">Ativos</div>
              </div>
            </div>
            
            <div className="header-actions">
              <button 
                className="btn-refresh"
                onClick={() => fetchAllServices()}
                disabled={loading.services}
                title="Atualizar lista"
                aria-label="Atualizar lista de serviços"
              >
                <i className="fas fa-sync"></i>
              </button>
              <button 
                className="btn-primary"
                onClick={() => setShowForm(true)}
                aria-label="Adicionar novo serviço"
              >
                <i className="fas fa-plus"></i>
                <span>Novo Serviço</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Formulário de Serviço */}
        {showForm && (
          <div className="service-form-section">
            <div className="form-header">
              <h2>
                <i className={editingService ? 'fas fa-edit' : 'fas fa-plus-circle'}></i>
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <button 
                className="close-btn"
                onClick={resetForm}
                aria-label="Fechar formulário"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="form-content">
              <form onSubmit={handleSubmit} className="service-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">
                      <i className="fas fa-tag"></i>
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
                      aria-required="true"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="category">
                      <i className="fas fa-filter"></i>
                      Categoria
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      aria-label="Selecione a categoria do serviço"
                    >
                      <option value="banho">Banho</option>
                      <option value="tosa">Tosa</option>
                      <option value="consulta">Consulta Veterinária</option>
                      <option value="vacinacao">Vacinação</option>
                      <option value="exame">Exames</option>
                      <option value="outro">Outros</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="price">
                      <i className="fas fa-dollar-sign"></i>
                      Preço (R$) *
                    </label>
                    <div className="price-input">
                      <span className="currency">R$</span>
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
                        aria-required="true"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="duration">
                      <i className="fas fa-clock"></i>
                      Duração *
                    </label>
                    <div className="duration-select">
                      <select
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                        aria-required="true"
                      >
                        <option value="15">15 minutos</option>
                        <option value="30">30 minutos</option>
                        <option value="45">45 minutos</option>
                        <option value="60">1 hora</option>
                        <option value="90">1 hora 30</option>
                        <option value="120">2 horas</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group full-width">
                    <label htmlFor="description">
                      <i className="fas fa-align-left"></i>
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Descreva o serviço em detalhes..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleInputChange}
                        aria-label="Serviço ativo para agendamento"
                      />
                      <i className="fas fa-check-circle"></i>
                      <span>Serviço ativo para agendamento</span>
                    </label>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn-cancel"
                    onClick={resetForm}
                    aria-label="Cancelar edição"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-save"
                    aria-label={editingService ? 'Atualizar serviço' : 'Salvar serviço'}
                  >
                    <i className={editingService ? 'fas fa-save' : 'fas fa-check'}></i>
                    {editingService ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
              
              {/* Preview do Serviço */}
              <div className="service-preview">
                <div className="preview-header">
                  <h3>
                    <i className="fas fa-eye"></i>
                    Preview
                  </h3>
                  <span className={`status-badge ${formData.active ? 'active' : 'inactive'}`}>
                    {formData.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <div className="preview-content">
                  <div className="preview-service">
                    <div className="preview-icon">
                      <i className={`fas ${getCategoryIcon(formData.category)}`}></i>
                    </div>
                    <div className="preview-details">
                      <h4>{formData.name || 'Nome do Serviço'}</h4>
                      <div className="preview-meta">
                        <span className="preview-category">
                          <i className="fas fa-tag"></i>
                          {formatCategory(formData.category)}
                        </span>
                        <span className="preview-duration">
                          <i className="fas fa-clock"></i>
                          {formData.duration} min
                        </span>
                      </div>
                      <div className="preview-price">
                        R$ {previewPrice}
                      </div>
                      <p className="preview-description">
                        {formData.description || 'Descrição do serviço...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Lista de Serviços */}
        <div className="services-list-section">
          <div className="section-header">
            <h2>Serviços Cadastrados</h2>
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Visualização em grade"
                aria-label="Visualização em grade"
              >
                <i className="fas fa-th"></i>
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Visualização em lista"
                aria-label="Visualização em lista"
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>
          
          {loading.services ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Carregando serviços...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-cut"></i>
              <h3>Nenhum serviço cadastrado</h3>
              <p>Comece criando seu primeiro serviço!</p>
              <button 
                className="btn-primary"
                onClick={() => setShowForm(true)}
              >
                <i className="fas fa-plus"></i>
                Criar Primeiro Serviço
              </button>
            </div>
          ) : (
            <div className={`services-container ${viewMode}`}>
              {services.map((service) => {
                const safeCategory = getSafeCategory(service);
                return (
                  <div key={service.id} className={`service-card ${!service.active ? 'inactive' : ''}`}>
                    <div className="card-header">
                      <div className="service-icon">
                        <i className={`fas ${getCategoryIcon(safeCategory)}`}></i>
                      </div>
                      <div className="service-info">
                        <h3>{service.name}</h3>
                        <div className="service-meta">
                          <span className="category">
                            {formatCategory(safeCategory)}
                          </span>
                          <span className="duration">
                            <i className="fas fa-clock"></i>
                            {service.duration} min
                          </span>
                        </div>
                      </div>
                      <div className="service-price">
                        R$ {service.price.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="card-body">
                      {service.description && (
                        <p className="service-description">{service.description}</p>
                      )}
                      
                      <div className="service-stats">
                        <div className="stat">
                          <i className="fas fa-calendar-alt"></i>
                          <span>Agendamentos</span>
                        </div>
                        <span className={`status ${service.active ? 'active' : 'inactive'}`}>
                          <i className={`fas fa-${service.active ? 'check-circle' : 'times-circle'}`}></i>
                          {service.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(service)}
                        title="Editar serviço"
                        aria-label={`Editar serviço ${service.name}`}
                      >
                        <i className="fas fa-edit"></i>
                        <span>Editar</span>
                      </button>
                      <button 
                        className={`btn-toggle ${service.active ? 'inactive' : 'active'}`}
                        onClick={() => handleToggleActive(service)}
                        title={service.active ? 'Desativar serviço' : 'Ativar serviço'}
                        aria-label={service.active ? 'Desativar serviço' : 'Ativar serviço'}
                      >
                        <i className={`fas fa-${service.active ? 'eye-slash' : 'eye'}`}></i>
                        <span>{service.active ? 'Desativar' : 'Ativar'}</span>
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(service)}
                        title="Excluir serviço"
                        aria-label={`Excluir serviço ${service.name}`}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .admin-services {
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
        
        /* Header */
        .content-header {
          margin-bottom: 24px;
        }
        
        .header-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
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
        
        .current-date {
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
        
        .current-date i {
          color: #8b5cf6;
        }
        
        .header-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }
        
        .stat-icon {
          width: 36px;
          height: 36px;
          background: #f5f3ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8b5cf6;
          font-size: 16px;
        }
        
        .stat-content .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
        }
        
        .stat-content .stat-label {
          font-size: 12px;
          color: #6b7280;
        }
        
        .header-actions {
          display: flex;
          gap: 12px;
        }
        
        .btn-refresh {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: white;
          border: 1px solid #e5e7eb;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .btn-refresh:hover {
          background: #f3f4f6;
        }
        
        .btn-refresh:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }
        
        /* Formulário */
        .service-form-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .form-header h2 {
          margin: 0;
          color: #1f2937;
          font-size: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .form-header h2 i {
          color: #8b5cf6;
        }
        
        .close-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #f3f4f6;
          border: none;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .close-btn:hover {
          background: #e5e7eb;
        }
        
        .form-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        
        .service-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        
        .form-group label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .form-group label i {
          color: #8b5cf6;
          font-size: 13px;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          color: #1f2937;
          background: white;
          transition: all 0.2s;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        .price-input {
          position: relative;
        }
        
        .price-input .currency {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-weight: 600;
        }
        
        .price-input input {
          padding-left: 36px !important;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-weight: normal;
          margin-top: 8px;
        }
        
        .checkbox-label input {
          width: 18px;
          height: 18px;
          margin: 0;
        }
        
        .checkbox-label i {
          color: #10b981;
        }
        
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }
        
        .btn-cancel {
          padding: 10px 16px;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-cancel:hover {
          background: #e5e7eb;
        }
        
        .btn-save {
          padding: 10px 16px;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        
        .btn-save:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }
        
        /* Preview do Serviço */
        .service-preview {
          background: #f9fafb;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        
        .preview-header {
          padding: 16px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .preview-header h3 {
          margin: 0;
          font-size: 16px;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .status-badge.active {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status-badge.inactive {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .preview-content {
          padding: 20px;
        }
        
        .preview-service {
          display: flex;
          gap: 16px;
        }
        
        .preview-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          flex-shrink: 0;
        }
        
        .preview-details h4 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 18px;
        }
        
        .preview-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .preview-category,
        .preview-duration {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6b7280;
        }
        
        .preview-price {
          font-size: 22px;
          font-weight: 700;
          color: #059669;
          margin-bottom: 16px;
        }
        
        .preview-description {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }
        
        /* Lista de Serviços */
        .services-list-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .section-header h2 {
          margin: 0;
          color: #374151;
          font-size: 20px;
          font-weight: 600;
        }
        
        .view-controls {
          display: flex;
          gap: 4px;
          background: #f3f4f6;
          padding: 4px;
          border-radius: 8px;
        }
        
        .view-btn {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .view-btn.active {
          background: white;
          color: #8b5cf6;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        /* Cards/Lista de Serviços */
        .services-container.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .services-container.list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .service-card {
          background: #f9fafb;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          transition: all 0.3s;
        }
        
        .services-container.grid .service-card {
          display: flex;
          flex-direction: column;
        }
        
        .services-container.list .service-card {
          display: flex;
          align-items: center;
          padding: 16px;
          gap: 16px;
        }
        
        .service-card.inactive {
          opacity: 0.7;
          background: #f3f4f6;
        }
        
        .service-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .card-header {
          padding: 20px 20px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .services-container.list .card-header {
          flex: 1;
          padding: 0;
          align-items: center;
        }
        
        .service-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          flex-shrink: 0;
        }
        
        .services-container.list .service-icon {
          width: 40px;
          height: 40px;
          font-size: 16px;
        }
        
        .service-info {
          flex: 1;
        }
        
        .service-info h3 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
        }
        
        .services-container.list .service-info h3 {
          margin: 0;
        }
        
        .service-meta {
          display: flex;
          gap: 12px;
        }
        
        .category {
          padding: 4px 10px;
          background: #e5e7eb;
          border-radius: 12px;
          font-size: 12px;
          color: #4b5563;
        }
        
        .duration {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
        }
        
        .service-price {
          font-size: 20px;
          font-weight: 700;
          color: #059669;
          flex-shrink: 0;
        }
        
        .services-container.list .service-price {
          font-size: 18px;
        }
        
        .card-body {
          padding: 0 20px 16px;
        }
        
        .services-container.list .card-body {
          flex: 1;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .service-description {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .services-container.list .service-description {
          margin: 0;
          -webkit-line-clamp: 1;
        }
        
        .service-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .services-container.list .service-stats {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6b7280;
        }
        
        .status {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .status.active {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status.inactive {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .card-actions {
          padding: 16px 20px 20px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
        }
        
        .services-container.list .card-actions {
          padding: 0;
          border-top: none;
        }
        
        .card-actions button {
          flex: 1;
          padding: 8px 12px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .services-container.list .card-actions button {
          width: 40px;
          height: 40px;
          flex: none;
        }
        
        .services-container.list .card-actions button span {
          display: none;
        }
        
        .btn-edit {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .btn-edit:hover {
          background: #bfdbfe;
        }
        
        .btn-toggle {
          background: #f3f4f6;
          color: #374151;
        }
        
        .btn-toggle.active {
          background: #d1fae5;
          color: #065f46;
        }
        
        .btn-toggle.inactive {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .btn-delete {
          background: #f3f4f6;
          color: #ef4444;
        }
        
        .btn-delete:hover {
          background: #fee2e2;
        }
        
        /* Loading e Empty States */
        .loading-state,
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px dashed #d1d5db;
        }
        
        .loading-state i {
          font-size: 32px;
          color: #8b5cf6;
          margin-bottom: 16px;
        }
        
        .loading-state p {
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
          margin: 0 0 20px 0;
          color: #6b7280;
        }
        
        /* ===== RESPONSIVIDADE ===== */
        
        /* Tablet (1024px) */
        @media (max-width: 1024px) {
          .admin-content {
            margin-left: 220px;
            width: calc(100% - 220px);
            padding: 20px;
          }
          
          .form-content {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          
          .services-container.grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
        }
        
        /* Mobile Landscape (768px) */
        @media (max-width: 768px) {
          .admin-content {
            margin-left: 60px;
            width: calc(100% - 60px);
            padding: 16px;
          }
          
          .header-main {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .current-date {
            align-self: stretch;
            justify-content: center;
          }
          
          .header-stats {
            flex-direction: column;
            align-items: stretch;
          }
          
          .stat-card {
            justify-content: flex-start;
          }
          
          .header-actions {
            justify-content: flex-end;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .service-form-section {
            padding: 20px;
          }
          
          .services-list-section {
            padding: 20px;
          }
          
          .services-container.grid {
            grid-template-columns: 1fr;
          }
          
          .services-container.list .service-card {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          
          .services-container.list .card-body {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          
          .services-container.list .service-stats {
            margin-left: 0;
            justify-content: space-between;
          }
          
          .services-container.list .card-actions {
            justify-content: center;
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
            font-size: 24px;
          }
          
          .btn-primary span {
            display: none;
          }
          
          .btn-primary {
            width: 40px;
            height: 40px;
            padding: 0;
            justify-content: center;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .btn-cancel,
          .btn-save {
            width: 100%;
            justify-content: center;
          }
          
          .view-controls {
            align-self: flex-start;
          }
          
          .services-container.list .card-actions button span {
            display: inline;
          }
          
          .services-container.list .card-actions {
            flex-direction: column;
          }
          
          .services-container.list .card-actions button {
            width: 100%;
            height: auto;
          }
        }
        
        /* Small Mobile (360px) */
        @media (max-width: 360px) {
          .admin-content {
            padding: 12px;
            padding-top: 70px;
          }
          
          .header-main h1 {
            font-size: 20px;
          }
          
          .form-header h2 {
            font-size: 18px;
          }
          
          .service-form-section {
            padding: 16px;
          }
          
          .services-list-section {
            padding: 16px;
          }
          
          .service-card {
            padding: 12px;
          }
          
          .card-actions {
            flex-direction: column;
          }
          
          .card-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminServices;