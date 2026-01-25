// src/components/BookingModal.tsx - VERSÃO FINAL CORRIGIDA
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { services } from '../data/products';
import { createBooking } from '../firebase/bookings';
import { Booking, Service, PaymentMethod, PaymentOption } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType?: string;
  onBookingComplete?: (bookingData: Booking) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  serviceType = 'banho',
  onBookingComplete 
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableDates, setAvailableDates] = useState<{ date: string, label: string }[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ time: string, available: boolean }[]>([]);
  
  // Bloquear scroll do body quando modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  // APENAS DINHEIRO DISPONÍVEL
  const paymentOptions: PaymentOption[] = [
    {
      id: 'money',
      name: 'Dinheiro',
      icon: 'fas fa-money-bill-wave',
      description: 'Pagamento na chegada',
      available: true
    }
  ];

  const [formData, setFormData] = useState({
    petName: '',
    petType: 'cachorro',
    petBreed: '',
    petAge: '',
    petSize: 'médio',
    customerPhone: '11999999999',
    serviceId: serviceType,
    selectedDate: '',
    selectedTime: '',
    selectedProfessional: '',
    notes: '',
    paymentMethod: 'money' as PaymentMethod,
  });

  const service: Service | undefined = services.find(s => s.id === serviceType);
  
  useEffect(() => {
    if (isOpen) {
      fetchAvailableDates();
      // Resetar para dinheiro sempre que abrir
      setFormData(prev => ({ 
        ...prev, 
        paymentMethod: 'money',
        customerPhone: '11999999999' // Telefone padrão
      }));
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.selectedDate) {
      fetchTimeSlots();
    }
  }, [formData.selectedDate]);

  const fetchAvailableDates = () => {
    const today = new Date();
    const dates = [];
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Apenas dias úteis (segunda a sexta)
      if (date.getDay() >= 1 && date.getDay() <= 5) {
        const dateStr = date.toISOString().split('T')[0];
        const label = date.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        }).replace('.', '');
        
        dates.push({ date: dateStr, label });
      }
    }
    
    setAvailableDates(dates);
  };

  const fetchTimeSlots = async () => {
    // Horários de funcionamento: 8h às 18h, com intervalos de 1 hora
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      // Simular disponibilidade (85% dos horários disponíveis)
      const available = Math.random() > 0.15;
      slots.push({ time, available });
    }
    
    setTimeSlots(slots);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleDateSelect = (date: string) => {
    setFormData(prev => ({ ...prev, selectedDate: date, selectedTime: '' }));
  };

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, selectedTime: time }));
  };

  const handleNextStep = () => {
    setError('');
    
    if (step === 1) {
      if (!formData.petName.trim()) {
        setError('Por favor, informe o nome do seu pet');
        return;
      }
      if (!formData.petType) {
        setError('Por favor, selecione o tipo de pet');
        return;
      }
      if (!formData.customerPhone.trim()) {
        setError('Por favor, informe seu telefone para contato');
        return;
      }
    }
    
    if (step === 2) {
      if (!formData.selectedDate) {
        setError('Por favor, selecione uma data');
        return;
      }
      if (!formData.selectedTime) {
        setError('Por favor, selecione um horário');
        return;
      }
    }
    
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
    setError('');
  };

  const handleSubmitBooking = async () => {
    if (!user || !service) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const bookingData = {
        userId: user.id,
        petName: formData.petName,
        petType: formData.petType,
        petBreed: formData.petBreed || '',
        petAge: Number(formData.petAge) || 0,
        petSize: formData.petSize,
        serviceId: formData.serviceId,
        serviceName: service.title,
        servicePrice: service.price,
        date: formData.selectedDate,
        time: formData.selectedTime,
        status: 'confirmed' as const,
        notes: formData.notes || '',
        duration: service.duration,
        professional: 'Profissional LuckPet',
        paymentMethod: formData.paymentMethod,
        customerName: user.name,
        customerPhone: formData.customerPhone,
        customerEmail: user.email,
      };

      const bookingId = await createBooking(bookingData);

      const completeBooking: Booking = {
        id: bookingId,
        ...bookingData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (onBookingComplete) {
        onBookingComplete(completeBooking);
      }

      setSuccess('Agendamento confirmado com sucesso!');
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error('Erro ao criar agendamento:', err);
      setError('Erro ao processar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      petName: '',
      petType: 'cachorro',
      petBreed: '',
      petAge: '',
      petSize: 'médio',
      customerPhone: '11999999999',
      serviceId: serviceType,
      selectedDate: '',
      selectedTime: '',
      selectedProfessional: '',
      notes: '',
      paymentMethod: 'money',
    });
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={e => e.stopPropagation()}>
        
        {/* Header SIMPLIFICADO */}
        <div className="modal-header">
          <div className="header-content">
            <button 
              className="close-btn" 
              onClick={onClose}
              aria-label="Fechar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <h2 className="modal-title">Agendar Serviço</h2>
            
            {/* PROGRESS SIMPLES E CLEAN */}
            <div className="progress-simple">
              <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-text">Pet</span>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-text">Data/Hora</span>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-text">Confirmar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && (
            <div className="alert-message error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert-message success">
              <i className="fas fa-check-circle"></i>
              <span>{success}</span>
            </div>
          )}

          {/* Step 1: Pet Info */}
          {step === 1 && (
            <div className="step-content">
              <div className="step-header">
                <h3>Informações do Pet</h3>
                <p>Preencha os dados do seu pet para o atendimento</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Nome do Pet *
                  </label>
                  <input
                    type="text"
                    name="petName"
                    value={formData.petName}
                    onChange={handleInputChange}
                    placeholder="Ex: Rex, Luna..."
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Tipo *
                  </label>
                  <select
                    name="petType"
                    value={formData.petType}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={loading}
                  >
                    <option value="cachorro">🐶 Cachorro</option>
                    <option value="gato">🐱 Gato</option>
                    <option value="coelho">🐰 Coelho</option>
                    <option value="outro">🐾 Outro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Porte
                  </label>
                  <select
                    name="petSize"
                    value={formData.petSize}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={loading}
                  >
                    <option value="pequeno">Pequeno</option>
                    <option value="médio">Médio</option>
                    <option value="grande">Grande</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Idade (anos)
                  </label>
                  <input
                    type="number"
                    name="petAge"
                    value={formData.petAge}
                    onChange={handleInputChange}
                    placeholder="Ex: 3"
                    className="form-input"
                    min="0"
                    max="30"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Raça (opcional)
                  </label>
                  <input
                    type="text"
                    name="petBreed"
                    value={formData.petBreed}
                    onChange={handleInputChange}
                    placeholder="Ex: Poodle, SRD..."
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Telefone para Contato *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    placeholder="(11) 99999-9999"
                    className="form-input"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="service-preview">
                <div className="preview-content">
                  <div className="preview-icon">
                    <i className={service?.icon || 'fas fa-paw'}></i>
                  </div>
                  <div className="preview-details">
                    <h4>{service?.title}</h4>
                    <p>{service?.description}</p>
                    <div className="preview-meta">
                      <span className="meta-item">
                        <i className="fas fa-clock"></i>
                        {service?.duration} min
                      </span>
                      <span className="meta-item">
                        <i className="fas fa-money-bill-wave"></i>
                        R$ {service?.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="step-content">
              <div className="step-header">
                <h3>Escolha Data e Horário</h3>
                <p>Selecione quando deseja trazer seu pet</p>
              </div>
              
              <div className="date-selection">
                <label className="section-label">
                  Data do Agendamento *
                </label>
                <div className="date-grid">
                  {availableDates.map(({ date, label }) => (
                    <button
                      key={date}
                      type="button"
                      className={`date-option ${formData.selectedDate === date ? 'selected' : ''}`}
                      onClick={() => handleDateSelect(date)}
                      disabled={loading}
                    >
                      <span className="date-day">{label.split(' ')[0]}</span>
                      <span className="date-number">{label.split(' ')[1]}</span>
                      <span className="date-month">{label.split(' ')[2]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.selectedDate && (
                <div className="time-selection">
                  <label className="section-label">
                    Horário Disponível *
                  </label>
                  <div className="time-grid">
                    {timeSlots.map(({ time, available }) => (
                      <button
                        key={time}
                        type="button"
                        className={`time-option ${formData.selectedTime === time ? 'selected' : ''} ${!available ? 'unavailable' : ''}`}
                        onClick={() => available && handleTimeSelect(time)}
                        disabled={!available || loading}
                      >
                        {time}
                        {!available && <span className="badge">Lotado</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="notes-section">
                <label className="form-label">
                  Observações Especiais
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Alguma observação importante sobre seu pet..."
                  className="form-textarea"
                  rows={4}
                  disabled={loading}
                />
                <p className="form-hint">
                  Ex: comportamento, alergias, medicamentos, etc.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="step-content">
              <div className="step-header">
                <h3>Confirmação</h3>
                <p>Revise os dados do seu agendamento</p>
              </div>
              
              <div className="confirmation-grid">
                <div className="confirmation-card">
                  <div className="card-header">
                    <h4>Resumo do Agendamento</h4>
                  </div>
                  <div className="card-body">
                    <div className="info-row">
                      <span className="info-label">Serviço:</span>
                      <span className="info-value">{service?.title}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Data:</span>
                      <span className="info-value">
                        {new Date(formData.selectedDate).toLocaleDateString('pt-BR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Horário:</span>
                      <span className="info-value">{formData.selectedTime}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Duração:</span>
                      <span className="info-value">{service?.duration} minutos</span>
                    </div>
                  </div>
                </div>

                <div className="confirmation-card">
                  <div className="card-header">
                    <h4>Informações do Pet</h4>
                  </div>
                  <div className="card-body">
                    <div className="info-row">
                      <span className="info-label">Nome:</span>
                      <span className="info-value">{formData.petName}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Tipo:</span>
                      <span className="info-value">
                        {formData.petType === 'cachorro' ? '🐶 Cachorro' : 
                         formData.petType === 'gato' ? '🐱 Gato' : 
                         formData.petType === 'coelho' ? '🐰 Coelho' : '🐾 Outro'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Porte:</span>
                      <span className="info-value">{formData.petSize}</span>
                    </div>
                    {formData.petAge && (
                      <div className="info-row">
                        <span className="info-label">Idade:</span>
                        <span className="info-value">{formData.petAge} anos</span>
                      </div>
                    )}
                    {formData.petBreed && (
                      <div className="info-row">
                        <span className="info-label">Raça:</span>
                        <span className="info-value">{formData.petBreed}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="confirmation-card">
                  <div className="card-header">
                    <h4>Pagamento</h4>
                  </div>
                  <div className="card-body">
                    <div className="info-row">
                      <span className="info-label">Método:</span>
                      <div className="payment-method-display">
                        <i className="fas fa-money-bill-wave"></i>
                        <span>Dinheiro na chegada</span>
                      </div>
                    </div>
                    <div className="price-row">
                      <span className="price-label">Total:</span>
                      <span className="price-value">R$ {service?.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="confirmation-card">
                  <div className="card-header">
                    <h4>Informações Importantes</h4>
                  </div>
                  <div className="card-body">
                    <div className="info-item">
                      <i className="fas fa-clock"></i>
                      <span>Chegar com 10 min de antecedência</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-calendar-times"></i>
                      <span>Cancelamentos com até 24h de antecedência</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-paw"></i>
                      <span>Trazer coleira e documentos do pet</span>
                    </div>
                    {formData.notes && (
                      <div className="notes-preview">
                        <strong>Suas observações:</strong>
                        <p>{formData.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="terms-section">
                <label className="checkbox-label">
                  <input type="checkbox" required />
                  <span>
                    Concordo com os 
                    <a href="/termos" target="_blank"> Termos</a> e 
                    <a href="/politica" target="_blank"> Política de Cancelamento</a>
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="footer-content">
            {step > 1 && (
              <button 
                className="btn btn-outline" 
                onClick={handlePrevStep}
                disabled={loading}
              >
                <i className="fas fa-arrow-left"></i>
                Voltar
              </button>
            )}
            
            {step < 3 ? (
              <button 
                className="btn btn-primary" 
                onClick={handleNextStep}
                disabled={loading}
              >
                Continuar
                <i className="fas fa-arrow-right"></i>
              </button>
            ) : (
              <button 
                className="btn btn-confirm" 
                onClick={handleSubmitBooking}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Confirmando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-calendar-check"></i>
                    Confirmar Agendamento
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <style>{`
          /* Bloquear scroll do body quando modal aberto */
          body.modal-open {
            overflow: hidden;
          }

          /* Overlay e Modal */
          .booking-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 16px;
            animation: fadeIn 0.3s ease;
            overflow-y: auto;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .booking-modal {
            background: white;
            border-radius: 20px;
            width: 100%;
            max-width: 800px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            animation: slideUp 0.4s ease;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Header SIMPLIFICADO */
          .modal-header {
            background: #7C3AED;
            color: white;
            padding: 0;
            position: relative;
          }

          .header-content {
            padding: 24px;
            position: relative;
          }

          .close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: white;
            transition: all 0.2s;
            z-index: 10;
          }

          .close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: rotate(90deg);
          }

          .modal-title {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 24px 0;
            color: white;
            text-align: center;
          }

          /* PROGRESS SIMPLES E CLEAN */
          .progress-simple {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .progress-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
          }

          .step-number {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            color: white;
            transition: all 0.3s ease;
          }

          .progress-step.active .step-number {
            background: white;
            color: #7C3AED;
            transform: scale(1.1);
          }

          .step-text {
            font-size: 12px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.8);
          }

          .progress-step.active .step-text {
            color: white;
            font-weight: 600;
          }

          .progress-line {
            width: 40px;
            height: 2px;
            background: rgba(255, 255, 255, 0.2);
            margin: 0 4px;
          }

          /* Body */
          .modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
            background: #F9FAFB;
          }

          .modal-body::-webkit-scrollbar {
            width: 6px;
          }

          .modal-body::-webkit-scrollbar-track {
            background: #F3F4F6;
            border-radius: 3px;
          }

          .modal-body::-webkit-scrollbar-thumb {
            background: #D1D5DB;
            border-radius: 3px;
          }

          /* Alerts */
          .alert-message {
            padding: 14px 16px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 500;
            animation: slideDown 0.3s ease;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .alert-message.error {
            background: #FEF2F2;
            color: #DC2626;
            border: 1px solid #FECACA;
          }

          .alert-message.error i {
            color: #DC2626;
          }

          .alert-message.success {
            background: #F0FDF4;
            color: #059669;
            border: 1px solid #A7F3D0;
          }

          .alert-message.success i {
            color: #059669;
          }

          /* Step Content */
          .step-content {
            animation: fadeInUp 0.4s ease;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .step-header {
            margin-bottom: 24px;
          }

          .step-header h3 {
            font-size: 20px;
            font-weight: 700;
            color: #1F2937;
            margin: 0 0 6px 0;
          }

          .step-header p {
            color: #6B7280;
            font-size: 14px;
            margin: 0;
          }

          /* Form Styles */
          .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }

          .form-group {
            margin-bottom: 0;
          }

          .form-label {
            display: block;
            margin-bottom: 6px;
            font-weight: 600;
            color: #374151;
            font-size: 13px;
          }

          .form-input,
          .form-select,
          .form-textarea {
            width: 100%;
            padding: 12px 14px;
            border: 1.5px solid #E5E7EB;
            border-radius: 10px;
            font-size: 14px;
            transition: all 0.2s;
            background: white;
            color: #1F2937;
          }

          .form-input:focus,
          .form-select:focus,
          .form-textarea:focus {
            outline: none;
            border-color: #8B5CF6;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
          }

          .form-textarea {
            resize: vertical;
            min-height: 80px;
          }

          .form-hint {
            color: #6B7280;
            font-size: 12px;
            margin-top: 6px;
            margin-bottom: 0;
          }

          /* Service Preview */
          .service-preview {
            background: white;
            border-radius: 14px;
            padding: 20px;
            border: 1.5px solid #EDE9FE;
          }

          .preview-content {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .preview-icon {
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1.5px solid #DDD6FE;
          }

          .preview-icon i {
            font-size: 24px;
            color: #7C3AED;
          }

          .preview-details h4 {
            margin: 0 0 6px 0;
            font-size: 18px;
            font-weight: 700;
            color: #1F2937;
          }

          .preview-details p {
            color: #6B7280;
            font-size: 13px;
            margin: 0 0 14px 0;
            line-height: 1.5;
          }

          .preview-meta {
            display: flex;
            gap: 16px;
          }

          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #6B7280;
            font-size: 13px;
            font-weight: 500;
          }

          .meta-item i {
            color: #8B5CF6;
            font-size: 13px;
          }

          /* Date Selection */
          .section-label {
            display: block;
            margin-bottom: 12px;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
          }

          .date-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 10px;
            margin-bottom: 24px;
          }

          .date-option {
            padding: 10px 6px;
            border: 1.5px solid #E5E7EB;
            border-radius: 10px;
            background: white;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            transition: all 0.2s;
          }

          .date-option:hover:not(:disabled) {
            border-color: #8B5CF6;
            transform: translateY(-1px);
          }

          .date-option.selected {
            background: #7C3AED;
            border-color: #7C3AED;
            color: white;
            font-weight: 600;
          }

          .date-day {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .date-number {
            font-size: 16px;
            font-weight: 700;
          }

          .date-month {
            font-size: 10px;
            text-transform: uppercase;
          }

          /* Time Selection */
          .time-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            margin-bottom: 24px;
          }

          .time-option {
            padding: 12px;
            border: 1.5px solid #E5E7EB;
            border-radius: 10px;
            background: white;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            color: #4B5563;
            transition: all 0.2s;
            position: relative;
          }

          .time-option:hover:not(:disabled):not(.unavailable) {
            border-color: #8B5CF6;
            color: #8B5CF6;
            transform: translateY(-1px);
          }

          .time-option.selected {
            background: #7C3AED;
            border-color: #7C3AED;
            color: white;
          }

          .time-option.unavailable {
            opacity: 0.4;
            cursor: not-allowed;
            background: #F3F4F6;
          }

          .badge {
            position: absolute;
            top: -6px;
            right: -6px;
            background: #EF4444;
            color: white;
            font-size: 9px;
            padding: 1px 4px;
            border-radius: 8px;
            font-weight: 700;
          }

          /* Confirmation Grid */
          .confirmation-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }

          .confirmation-card {
            background: white;
            border-radius: 14px;
            overflow: hidden;
            border: 1.5px solid #E5E7EB;
          }

          .card-header {
            background: #F9FAFB;
            padding: 16px;
            border-bottom: 1.5px solid #E5E7EB;
          }

          .card-header h4 {
            margin: 0;
            font-size: 15px;
            font-weight: 700;
            color: #1F2937;
          }

          .card-body {
            padding: 16px;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #F3F4F6;
          }

          .info-row:last-child {
            border-bottom: none;
          }

          .info-label {
            color: #6B7280;
            font-size: 13px;
            font-weight: 500;
          }

          .info-value {
            color: #1F2937;
            font-size: 14px;
            font-weight: 600;
            text-align: right;
          }

          .price-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            margin-top: 12px;
            border-top: 1.5px solid #F3F4F6;
          }

          .price-label {
            color: #1F2937;
            font-size: 15px;
            font-weight: 600;
          }

          .price-value {
            color: #7C3AED;
            font-size: 20px;
            font-weight: 700;
          }

          .payment-method-display {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .payment-method-display i {
            color: #7C3AED;
            font-size: 16px;
          }

          .info-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 0;
            color: #6B7280;
            font-size: 13px;
            border-bottom: 1px solid #F3F4F6;
          }

          .info-item:last-child {
            border-bottom: none;
          }

          .info-item i {
            color: #8B5CF6;
            font-size: 13px;
            width: 14px;
            text-align: center;
          }

          .notes-preview {
            margin-top: 12px;
            padding: 12px;
            background: #F9FAFB;
            border-radius: 8px;
            border-left: 3px solid #8B5CF6;
          }

          .notes-preview strong {
            display: block;
            margin-bottom: 6px;
            color: #1F2937;
            font-size: 13px;
          }

          .notes-preview p {
            margin: 0;
            color: #6B7280;
            font-size: 13px;
            line-height: 1.5;
          }

          /* Terms Section */
          .terms-section {
            background: white;
            padding: 20px;
            border-radius: 14px;
            border: 1.5px solid #EDE9FE;
          }

          .checkbox-label {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            cursor: pointer;
            font-size: 13px;
            color: #6B7280;
            line-height: 1.4;
          }

          .checkbox-label input {
            margin-top: 2px;
          }

          .checkbox-label a {
            color: #7C3AED;
            text-decoration: none;
            font-weight: 600;
            margin: 0 3px;
          }

          .checkbox-label a:hover {
            text-decoration: underline;
          }

          /* Footer */
          .modal-footer {
            padding: 20px 24px;
            background: white;
            border-top: 1.5px solid #F3F4F6;
          }

          .footer-content {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          }

          .btn {
            padding: 14px 24px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            min-width: 120px;
          }

          .btn-outline {
            background: white;
            color: #6B7280;
            border: 1.5px solid #E5E7EB;
          }

          .btn-outline:hover:not(:disabled) {
            background: #F9FAFB;
            border-color: #D1D5DB;
            transform: translateY(-1px);
          }

          .btn-primary {
            background: #7C3AED;
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            background: #6D28D9;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
          }

          .btn-confirm {
            background: #10B981;
            color: white;
          }

          .btn-confirm:hover:not(:disabled) {
            background: #059669;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          }

          .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none !important;
          }

          .spinner {
            width: 18px;
            height: 18px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          /* RESPONSIVIDADE COMPLETA */
          @media (max-width: 768px) {
            .booking-modal {
              max-height: 95vh;
              border-radius: 16px;
              max-width: 100%;
            }

            .header-content {
              padding: 20px;
            }

            .modal-body {
              padding: 20px;
            }

            .modal-footer {
              padding: 16px 20px;
            }

            .modal-title {
              font-size: 20px;
              margin-bottom: 20px;
            }

            .form-grid {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .date-grid {
              grid-template-columns: repeat(4, 1fr);
            }

            .time-grid {
              grid-template-columns: repeat(3, 1fr);
            }

            .confirmation-grid {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .footer-content {
              flex-direction: column;
              gap: 10px;
            }

            .btn {
              width: 100%;
              min-width: 0;
            }

            .progress-simple {
              gap: 6px;
            }

            .progress-line {
              width: 20px;
            }

            .step-number {
              width: 28px;
              height: 28px;
              font-size: 12px;
            }

            .step-text {
              font-size: 11px;
            }
          }

          @media (max-width: 640px) {
            .date-grid {
              grid-template-columns: repeat(3, 1fr);
            }

            .time-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .step-header h3 {
              font-size: 18px;
            }

            .step-header p {
              font-size: 13px;
            }

            .service-preview {
              padding: 16px;
            }

            .preview-content {
              flex-direction: column;
              text-align: center;
              gap: 12px;
            }

            .preview-meta {
              justify-content: center;
            }
          }

          @media (max-width: 480px) {
            .booking-modal-overlay {
              padding: 12px;
            }

            .header-content {
              padding: 16px;
            }

            .modal-body {
              padding: 16px;
            }

            .modal-footer {
              padding: 16px;
            }

            .close-btn {
              top: 16px;
              right: 16px;
              width: 36px;
              height: 36px;
            }

            .modal-title {
              font-size: 18px;
              margin-bottom: 16px;
            }

            .date-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
            }

            .time-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
            }

            .btn {
              padding: 12px 20px;
              font-size: 13px;
            }

            .progress-simple {
              gap: 4px;
            }

            .progress-line {
              width: 15px;
            }

            .step-number {
              width: 24px;
              height: 24px;
              font-size: 11px;
            }

            .step-text {
              font-size: 10px;
            }
          }

          @media (max-width: 360px) {
            .date-grid {
              grid-template-columns: repeat(1, 1fr);
            }

            .time-grid {
              grid-template-columns: repeat(1, 1fr);
            }

            .progress-simple {
              flex-wrap: wrap;
              gap: 8px;
            }

            .progress-line {
              display: none;
            }

            .step-number {
              width: 22px;
              height: 22px;
              font-size: 10px;
            }

            .step-text {
              font-size: 9px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default BookingModal;