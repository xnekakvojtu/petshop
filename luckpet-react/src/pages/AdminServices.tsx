// src/pages/AdminServices.tsx - MELHORADO
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/Admin/AdminSidebar';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ServiceType } from '../types';

const AdminServices: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAuth();
  const { services, loading, fetchAllServices, handleCreateService, updateService } = useAdmin();
  
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

  useEffect(() => {
    if (!isAdmin && !isLoading) {
      navigate('/');
    }
    fetchAllServices();
  }, [isAdmin, isLoading, navigate, fetchAllServices]);

  useEffect(() => {
    // Atualiza preview do preço
    const price = parseFloat(formData.price) || 0;
    setPreviewPrice(price.toFixed(2));
  }, [formData.price]);

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
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      category: formData.category,
      active: formData.active,
    };

    try {
      if (editingService) {
        await updateService(editingService.id, serviceData);
        const event = new CustomEvent('notification', {
          detail: { 
            message: 'Serviço atualizado com sucesso!', 
            type: 'success' 
          }
        });
        window.dispatchEvent(event);
      } else {
        await handleCreateService(serviceData);
        const event = new CustomEvent('notification', {
          detail: { 
            message: 'Serviço criado com sucesso!', 
            type: 'success' 
          }
        });
        window.dispatchEvent(event);
      }
      
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
      fetchAllServices();
    } catch (error) {
      const event = new CustomEvent('notification', {
        detail: { 
          message: 'Erro ao salvar serviço', 
          type: 'error' 
        }
      });
      window.dispatchEvent(event);
    }
  };

  const handleEdit = (service: ServiceType) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
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
      const event = new CustomEvent('notification', {
        detail: { 
          message: `Serviço ${!service.active ? 'ativado' : 'desativado'} com sucesso!`, 
          type: 'success' 
        }
      });
      window.dispatchEvent(event);
      fetchAllServices();
    } catch (error) {
      const event = new CustomEvent('notification', {
        detail: { 
          message: 'Erro ao atualizar serviço', 
          type: 'error' 
        }
      });
      window.dispatchEvent(event);
    }
  };

  const handleDelete = async (service: ServiceType) => {
    if (window.confirm(`Tem certeza que deseja excluir o serviço "${service.name}"?`)) {
      // Aqui você implementaria a função deleteService
      const event = new CustomEvent('notification', {
        detail: { 
          message: 'Funcionalidade de exclusão em breve!', 
          type: 'info' 
        }
      });
      window.dispatchEvent(event);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-services">
      <AdminSidebar />
      
      <div className="admin-content">
        <div className="content-header">
          <div className="header-top">
            <div>
              <h1>Gerenciar Serviços</h1>
              <p>Total: {services.length} serviços • Ativos: {services.filter(s => s.active).length}</p>
            </div>
            <div className="header-actions">
              <button 
                className="btn-secondary"
                onClick={() => fetchAllServices()}
                disabled={loading.services}
              >
                <i className="fas fa-sync"></i> Atualizar
              </button>
              <button 
                className="btn-primary"
                onClick={() => setShowForm(true)}
              >
                <i className="fas fa-plus"></i> Novo Serviço
              </button>
            </div>
          </div>
        </div>
        
        {/* Formulário de Serviço com Preview */}
        {showForm && (
          <div className="service-form-section">
            <div className="form-header">
              <h2>
                <i className={`fas ${editingService ? 'fa-edit' : 'fa-plus-circle'}`}></i>
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <div className="form-actions-top">
                {editingService && (
                  <button className="btn-preview">
                    <i className="fas fa-eye"></i> Preview
                  </button>
                )}
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingService(null);
                    setFormData({
                      name: '',
                      description: '',
                      price: '',
                      duration: '30',
                      category: 'banho',
                      active: true,
                    });
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <div className="form-preview-grid">
              <form onSubmit={handleSubmit} className="form-column">
                <div className="form-section">
                  <h3>Informações do Serviço</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nome do Serviço *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ex: Banho Completo"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Categoria</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        <option value="banho">Banho</option>
                        <option value="tosa">Tosa</option>
                        <option value="consulta">Consulta</option>
                        <option value="vacinacao">Vacinação</option>
                        <option value="exame">Exame</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Preço (R$) *</label>
                      <div className="price-input">
                        <span className="currency">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="45.00"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Duração (minutos) *</label>
                      <div className="duration-select">
                        <select
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="15">15 min</option>
                          <option value="30">30 min</option>
                          <option value="45">45 min</option>
                          <option value="60">60 min</option>
                          <option value="90">90 min</option>
                          <option value="120">120 min</option>
                        </select>
                        <i className="fas fa-clock"></i>
                      </div>
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Descrição</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Descreva detalhadamente o serviço..."
                        rows={4}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="active"
                          checked={formData.active}
                          onChange={handleInputChange}
                        />
                        <span>Serviço ativo para agendamento</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    <i className={`fas ${editingService ? 'fa-save' : 'fa-check'}`}></i>
                    {editingService ? 'Atualizar' : 'Criar'} Serviço
                  </button>
                </div>
              </form>
              
              {/* Preview */}
              <div className="preview-column">
                <div className="preview-card">
                  <div className="preview-header">
                    <h3>Preview do Serviço</h3>
                    <span className={`preview-status ${formData.active ? 'active' : 'inactive'}`}>
                      {formData.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="preview-content">
                    <div className="preview-title">{formData.name || 'Nome do Serviço'}</div>
                    <div className="preview-price">
                      R$ {previewPrice}
                      <span className="preview-duration">• {formData.duration} min</span>
                    </div>
                    <div className="preview-category">
                      <i className={`fas ${
                        formData.category === 'banho' ? 'fa-shower' :
                        formData.category === 'tosa' ? 'fa-cut' :
                        formData.category === 'consulta' ? 'fa-stethoscope' :
                        'fa-paw'
                      }`}></i>
                      {formData.category === 'banho' ? 'Banho' :
                       formData.category === 'tosa' ? 'Tosa' :
                       formData.category === 'consulta' ? 'Consulta' :
                       formData.category === 'vacinacao' ? 'Vacinação' :
                       formData.category === 'exame' ? 'Exame' : 'Outro'}
                    </div>
                    <div className="preview-description">
                      {formData.description || 'Descrição do serviço aparecerá aqui...'}
                    </div>
                  </div>
                  <div className="preview-footer">
                    <div className="preview-actions">
                      <button className="preview-btn">
                        <i className="fas fa-calendar-plus"></i> Agendar
                      </button>
                      <button className="preview-btn secondary">
                        <i className="fas fa-info-circle"></i> Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Lista de Serviços */}
        <div className="services-section">
          <div className="section-header">
            <h2>Lista de Serviços</h2>
            <div className="view-controls">
              <button className="view-btn active">
                <i className="fas fa-th"></i> Cards
              </button>
              <button className="view-btn">
                <i className="fas fa-list"></i> Lista
              </button>
            </div>
          </div>
          
          {loading.services ? (
            <div className="loading-state">
              <div className="spinner"></div>
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
                <i className="fas fa-plus"></i> Criar Primeiro Serviço
              </button>
            </div>
          ) : (
            <div className="services-grid">
              {services.map((service) => (
                <div key={service.id} className={`service-card ${!service.active ? 'inactive' : ''}`}>
                  <div className="service-header">
                    <div className="service-icon">
                      <i className={`fas ${
                        service.category === 'banho' ? 'fa-shower' :
                        service.category === 'tosa' ? 'fa-cut' :
                        service.category === 'consulta' ? 'fa-stethoscope' :
                        'fa-paw'
                      }`}></i>
                    </div>
                    <div className="service-title">
                      <h3>{service.name}</h3>
                      <span className={`service-badge ${service.active ? 'active' : 'inactive'}`}>
                        {service.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="service-price">
                      R$ {service.price.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="service-body">
                    <p className="service-description">{service.description}</p>
                    
                    <div className="service-details">
                      <div className="detail">
                        <i className="fas fa-clock"></i>
                        <span>{service.duration} min</span>
                      </div>
                      <div className="detail">
                        <i className="fas fa-tag"></i>
                        <span>{service.category}</span>
                      </div>
                      <div className="detail">
                        <i className="fas fa-calendar-alt"></i>
                        <span>20 agendamentos</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="service-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(service)}
                    >
                      <i className="fas fa-edit"></i>
                      Editar
                    </button>
                    <button 
                      className={`btn-toggle ${service.active ? 'btn-deactivate' : 'btn-activate'}`}
                      onClick={() => handleToggleActive(service)}
                    >
                      <i className={`fas fa-${service.active ? 'eye-slash' : 'eye'}`}></i>
                      {service.active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(service)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style >{`
        /* Estilos específicos para AdminServices - já foram fornecidos anteriormente */
        /* Vou adicionar apenas os novos estilos */
        
        .admin-services {
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
        
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        
        .header-top h1 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 32px;
        }
        
        .header-top p {
          margin: 0;
          color: #6b7280;
        }
        
        .header-actions {
          display: flex;
          gap: 12px;
        }
        
        .btn-primary, .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          font-size: 15px;
          transition: all 0.2s;
        }
        
        .btn-primary {
          background: #8b5cf6;
          color: white;
        }
        
        .btn-primary:hover {
          background: #7c3aed;
        }
        
        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
        }
        
        .btn-secondary:hover {
          background: #e5e7eb;
        }
        
        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        /* Formulário com Preview */
        .service-form-section {
          background: white;
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.1);
        }
        
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        
        .form-header h2 {
          margin: 0;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .form-actions-top {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        .btn-preview {
          background: #f3f4f6;
          color: #374151;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          color: #6b7280;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s;
        }
        
        .close-btn:hover {
          background: #f3f4f6;
        }
        
        .form-preview-grid {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 30px;
        }
        
        .form-column {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .form-section h3 {
          margin: 0 0 20px 0;
          color: #374151;
          font-size: 18px;
          padding-bottom: 10px;
          border-bottom: 2px solid #f3f4f6;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
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
        }
        
        .price-input {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .currency {
          position: absolute;
          left: 12px;
          color: #6b7280;
          font-weight: 600;
        }
        
        .price-input input {
          padding-left: 40px !important;
        }
        
        .duration-select {
          position: relative;
        }
        
        .duration-select select {
          padding-left: 40px !important;
        }
        
        .duration-select i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px 15px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-size: 15px;
          color: #1f2937;
          background: white;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        
        .checkbox-label input {
          width: 18px;
          height: 18px;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        
        /* Preview */
        .preview-column {
          position: sticky;
          top: 30px;
        }
        
        .preview-card {
          background: white;
          border: 2px solid #f3f4f6;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .preview-header {
          padding: 20px;
          background: #f8fafc;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .preview-header h3 {
          margin: 0;
          font-size: 16px;
          color: #6b7280;
        }
        
        .preview-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .preview-status.active {
          background: #d1fae5;
          color: #065f46;
        }
        
        .preview-status.inactive {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .preview-content {
          padding: 20px;
        }
        
        .preview-title {
          font-size: 22px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 10px;
        }
        
        .preview-price {
          font-size: 24px;
          font-weight: 700;
          color: #059669;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .preview-duration {
          font-size: 14px;
          color: #6b7280;
          font-weight: normal;
        }
        
        .preview-category {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f3f4f6;
          border-radius: 8px;
          color: #4b5563;
          font-size: 14px;
          margin-bottom: 20px;
        }
        
        .preview-category i {
          color: #8b5cf6;
        }
        
        .preview-description {
          color: #6b7280;
          line-height: 1.6;
          font-size: 14px;
        }
        
        .preview-footer {
          padding: 20px;
          background: #f8fafc;
          border-top: 1px solid #e5e7eb;
        }
        
        .preview-actions {
          display: flex;
          gap: 10px;
        }
        
        .preview-btn {
          flex: 1;
          padding: 12px;
          border-radius: 10px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .preview-btn:first-child {
          background: #8b5cf6;
          color: white;
        }
        
        .preview-btn.secondary {
          background: #f3f4f6;
          color: #374151;
        }
        
        /* Lista de Serviços */
        .services-section {
          background: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        
        .section-header h2 {
          margin: 0;
          color: #374151;
          font-size: 20px;
        }
        
        .view-controls {
          display: flex;
          gap: 8px;
          background: #f3f4f6;
          padding: 4px;
          border-radius: 10px;
        }
        
        .view-btn {
          padding: 8px 16px;
          border: none;
          background: none;
          border-radius: 8px;
          color: #6b7280;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .view-btn.active {
          background: white;
          color: #8b5cf6;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        /* Restante dos estilos... */
        
        @media (max-width: 1200px) {
          .form-preview-grid {
            grid-template-columns: 1fr;
          }
          
          .preview-column {
            position: static;
          }
        }
        
        @media (max-width: 768px) {
          .admin-content {
            margin-left: 60px;
            padding: 20px;
          }
          
          .header-top {
            flex-direction: column;
            gap: 20px;
          }
          
          .header-actions {
            width: 100%;
            justify-content: flex-start;
          }
          
          .form-preview-grid {
            gap: 20px;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .view-controls {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminServices;