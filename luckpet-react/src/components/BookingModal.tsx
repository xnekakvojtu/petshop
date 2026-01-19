// src/components/BookingModal.tsx - ATUALIZADO COM TELEFONE
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { services } from '../data/products';
import { createBooking, generatePixPayment } from '../firebase/bookings';
import { Booking, Service, PaymentMethod, PaymentOption, PixPayment } from '../types';

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
  const [pixData, setPixData] = useState<PixPayment | null>(null);
  const [showPix, setShowPix] = useState(false);
  
  const paymentOptions: PaymentOption[] = [
    {
      id: 'luckcoins',
      name: 'LuckCoins',
      icon: 'fas fa-coins',
      description: 'Use seus créditos acumulados',
      available: true
    },
    {
      id: 'pix',
      name: 'PIX',
      icon: 'fas fa-qrcode',
      description: 'Pagamento instantâneo',
      available: true
    },
    {
      id: 'credit_card',
      name: 'Cartão de Crédito',
      icon: 'fas fa-credit-card',
      description: 'Em até 12x',
      available: true
    },
    {
      id: 'debit_card',
      name: 'Cartão de Débito',
      icon: 'fas fa-credit-card',
      description: 'Débito em conta',
      available: true
    },
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
    customerPhone: '', // ⭐⭐ NOVO CAMPO - TELEFONE ⭐⭐
    serviceId: serviceType,
    selectedDate: '',
    selectedTime: '',
    selectedProfessional: '',
    notes: '',
    paymentMethod: 'luckcoins' as PaymentMethod,
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const service: Service | undefined = services.find(s => s.id === serviceType);
  
  useEffect(() => {
    if (isOpen) {
      fetchAvailableDates();
      setPixData(null);
      setShowPix(false);
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
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const dateStr = date.toISOString().split('T')[0];
        const label = date.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        });
        
        dates.push({ date: dateStr, label });
      }
    }
    
    setAvailableDates(dates);
  };

  const fetchTimeSlots = async () => {
    const slots = [
      '08:00', '09:00', '10:00', '11:00',
      '13:00', '14:00', '15:00', '16:00'
    ];
    
    setTimeSlots(slots.map(time => ({ time, available: true })));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
    setPixData(null);
    setShowPix(false);
  };

  const handleDateSelect = (date: string) => {
    setFormData(prev => ({ ...prev, selectedDate: date, selectedTime: '' }));
  };

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, selectedTime: time }));
  };

  const handleNextStep = () => {
    setError('');
    
    if (step === 1 && !formData.petName.trim()) {
      setError('Por favor, informe o nome do seu pet');
      return;
    }
    
    if (step === 2 && !formData.selectedDate) {
      setError('Por favor, selecione uma data');
      return;
    }
    
    if (step === 2 && !formData.selectedTime) {
      setError('Por favor, selecione um horário');
      return;
    }
    
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
    setError('');
    setPixData(null);
    setShowPix(false);
  };

  const handleSubmitBooking = async () => {
    if (!user || !service) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (formData.paymentMethod === 'luckcoins') {
        const currentCredits = user.credits || parseInt(localStorage.getItem('userCredits') || '0');
        
        if (currentCredits < service.price) {
          setError(`Saldo insuficiente. Você tem ${currentCredits} LC, precisa de ${service.price} LC`);
          setLoading(false);
          return;
        }
        
        const newCredits = currentCredits - service.price;
        localStorage.setItem('userCredits', newCredits.toString());
        
        const updatedUser = { ...user, credits: newCredits };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
        
      } else if (formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card') {
        if (!formData.cardNumber || !formData.cardName || !formData.cardExpiry || !formData.cardCvv) {
          setError('Preencha todos os dados do cartão');
          setLoading(false);
          return;
        }
      }

      const bookingData = {
        userId: user.id,
        petName: formData.petName || 'Meu Pet',
        petType: formData.petType || 'cachorro',
        petBreed: formData.petBreed || '',
        petAge: Number(formData.petAge) || 0,
        serviceId: formData.serviceId,
        serviceName: service.title,
        servicePrice: service.price,
        date: formData.selectedDate || new Date().toISOString().split('T')[0],
        time: formData.selectedTime || '10:00',
        status: 'pending' as const,
        notes: formData.notes || '',
        duration: service.duration,
        professional: formData.selectedProfessional || 'Profissional',
        paymentMethod: formData.paymentMethod,
        customerName: user.name, // ⭐⭐ Nome do usuário
        customerPhone: formData.customerPhone, // ⭐⭐ Telefone
        customerEmail: user.email, // ⭐⭐ Email
      };

      console.log('📤 Criando agendamento com:', bookingData);

      if (formData.paymentMethod === 'pix') {
        const pix = await generatePixPayment('temp', service.price);
        setPixData(pix);
        setShowPix(true);
        setSuccess('QR Code PIX gerado! Escaneie para pagar.');
        setLoading(false);
        return;
      }

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

      const event = new CustomEvent('notification', {
        detail: { 
          message: `Agendamento confirmado! ID: ${bookingId.substring(0, 8)}...`, 
          type: 'success' 
        }
      });
      window.dispatchEvent(event);

      resetForm();
      onClose();

    } catch (err: any) {
      console.error('❌ Erro:', err);
      setError('Erro ao processar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePixPaid = async () => {
    setLoading(true);
    try {
      setSuccess('Pagamento PIX confirmado! Criando agendamento...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await handleSubmitBooking();
    } catch (err) {
      setError('Erro ao confirmar pagamento PIX');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      petName: '',
      petType: 'cachorro',
      petBreed: '',
      petAge: '',
      customerPhone: '', // ⭐⭐ Resetar telefone
      serviceId: serviceType,
      selectedDate: '',
      selectedTime: '',
      selectedProfessional: '',
      notes: '',
      paymentMethod: 'luckcoins',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCvv: '',
    });
    setStep(1);
    setPixData(null);
    setShowPix(false);
  };

  if (!isOpen) return null;

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <button className="close-btn" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h2 className="modal-title">Agendar Serviço</h2>
            <div className="progress-indicator">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }}></div>
              </div>
              <div className="step-labels">
                <span className={`step-label ${step >= 1 ? 'active' : ''}`}>Pet</span>
                <span className={`step-label ${step >= 2 ? 'active' : ''}`}>Data</span>
                <span className={`step-label ${step >= 3 ? 'active' : ''}`}>Pagamento</span>
                <span className={`step-label ${step >= 4 ? 'active' : ''}`}>Confirmação</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && (
            <div className="alert-message error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8V12M12 16H12.01" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert-message success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Step 1: Pet Info */}
          {step === 1 && (
            <div className="step-content">
              <div className="step-header">
                <h3>Informações do Pet</h3>
                <p className="step-description">Preencha os dados do seu pet</p>
              </div>
              
              <div className="form-group">
                <label className="form-label">Nome do Pet *</label>
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

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tipo *</label>
                  <select
                    name="petType"
                    value={formData.petType}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={loading}
                  >
                    <option value="cachorro">🐶 Cachorro</option>
                    <option value="gato">🐱 Gato</option>
                    <option value="outro">🐾 Outro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Idade (anos)</label>
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
              </div>

              <div className="form-group">
                <label className="form-label">Raça (opcional)</label>
                <input
                  type="text"
                  name="petBreed"
                  value={formData.petBreed}
                  onChange={handleInputChange}
                  placeholder="Ex: Poodle, Vira-lata..."
                  className="form-input"
                  disabled={loading}
                />
              </div>

              {/* ⭐⭐ NOVO: CAMPO DE TELEFONE ⭐⭐ */}
              <div className="form-group">
                <label className="form-label">Telefone para Contato (opcional)</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  className="form-input"
                  disabled={loading}
                />
                <small className="form-hint">
                  Usaremos apenas para confirmar o agendamento
                </small>
              </div>

              <div className="service-summary-card">
                <div className="summary-icon">
                  <i className={`fas ${
                    serviceType === 'banho' ? 'fa-bath' :
                    serviceType === 'tosa' ? 'fa-cut' :
                    'fa-stethoscope'
                  }`}></i>
                </div>
                <div className="summary-content">
                  <h4>{service?.title}</h4>
                  <p className="summary-description">{service?.description}</p>
                  <div className="summary-details">
                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6V12L16 14" strokeLinecap="round"/>
                      </svg>
                      <span>{service?.duration} min</span>
                    </div>
                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1V23M5 6H19C20.1046 6 21 6.89543 21 8V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V8C3 6.89543 3.89543 6 5 6Z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>R$ {service?.price.toFixed(2)}</span>
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
                <h3>Data e Horário</h3>
                <p className="step-description">Escolha quando deseja agendar</p>
              </div>
              
              <div className="dates-section">
                <label className="section-label">Selecione a Data *</label>
                <div className="dates-grid">
                  {availableDates.map(({ date, label }) => (
                    <button
                      key={date}
                      type="button"
                      className={`date-card ${formData.selectedDate === date ? 'selected' : ''}`}
                      onClick={() => handleDateSelect(date)}
                      disabled={loading}
                    >
                      <span className="date-label">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.selectedDate && (
                <div className="times-section">
                  <label className="section-label">Selecione o Horário *</label>
                  <div className="times-grid">
                    {timeSlots.map(({ time, available }) => (
                      <button
                        key={time}
                        type="button"
                        className={`time-slot ${formData.selectedTime === time ? 'selected' : ''} ${!available ? 'disabled' : ''}`}
                        onClick={() => available && handleTimeSelect(time)}
                        disabled={!available || loading}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Observações (opcional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Alguma observação importante..."
                  className="form-textarea"
                  rows={3}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Step 3: Pagamento */}
          {step === 3 && (
            <div className="step-content">
              <div className="step-header">
                <h3>Forma de Pagamento</h3>
                <p className="step-description">Escolha como deseja pagar</p>
              </div>
              
              {showPix && pixData ? (
                <div className="pix-container">
                  <div className="pix-header">
                    <div className="pix-icon">
                      <i className="fas fa-qrcode"></i>
                    </div>
                    <h4>Pagamento via PIX</h4>
                    <p className="pix-subtitle">Escaneie o QR Code abaixo</p>
                  </div>
                  
                  <div className="pix-qrcode">
                    <div className="qr-code-placeholder">
                      <div className="qr-grid">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div key={i} className={`qr-cell ${Math.random() > 0.5 ? 'filled' : ''}`}></div>
                        ))}
                      </div>
                    </div>
                    <div className="pix-amount">
                      <span className="amount-label">Valor:</span>
                      <span className="amount-value">R$ {service?.price.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="pix-code-section">
                    <label className="code-label">Código PIX (copie e cole):</label>
                    <div className="code-display">
                      <code className="pix-code">{pixData.code.substring(0, 50)}...</code>
                      <button 
                        className="copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(pixData.code);
                          alert('Código copiado!');
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="pix-info">
                    <div className="info-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6V12L16 14" strokeLinecap="round"/>
                      </svg>
                      <span>Expira em 30 minutos</span>
                    </div>
                    <div className="info-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 4L12 14.01L9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Pagamento confirmado automaticamente</span>
                    </div>
                  </div>
                  
                  <div className="pix-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => {
                        setShowPix(false);
                        setPixData(null);
                      }}
                      disabled={loading}
                    >
                      Voltar
                    </button>
                    <button 
                      className="btn-primary"
                      onClick={handlePixPaid}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="spinner"></div>
                          Confirmando...
                        </>
                      ) : (
                        'Já paguei'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="payment-methods-grid">
                    {paymentOptions.map((option) => (
                      <label 
                        key={option.id}
                        className={`payment-method ${formData.paymentMethod === option.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={option.id}
                          checked={formData.paymentMethod === option.id}
                          onChange={() => handlePaymentMethodChange(option.id)}
                          disabled={loading}
                        />
                        <div className="method-card">
                          <div className="method-icon">
                            <i className={option.icon}></i>
                          </div>
                          <div className="method-details">
                            <h5>{option.name}</h5>
                            <p>{option.description}</p>
                          </div>
                          <div className="method-check">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {(formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card') && (
                    <div className="card-form">
                      <h4 className="form-title">Dados do Cartão</h4>
                      
                      <div className="form-group">
                        <label className="form-label">Número do Cartão</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="0000 0000 0000 0000"
                          className="form-input"
                          disabled={loading}
                          maxLength={19}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Nome no Cartão</label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          placeholder="Como está no cartão"
                          className="form-input"
                          disabled={loading}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Validade (MM/AA)</label>
                          <input
                            type="text"
                            name="cardExpiry"
                            value={formData.cardExpiry}
                            onChange={handleInputChange}
                            placeholder="MM/AA"
                            className="form-input"
                            disabled={loading}
                            maxLength={5}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">CVV</label>
                          <input
                            type="text"
                            name="cardCvv"
                            value={formData.cardCvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            className="form-input"
                            disabled={loading}
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="payment-summary">
                    <h4 className="summary-title">Resumo do Pagamento</h4>
                    <div className="summary-items">
                      <div className="summary-row">
                        <span>{service?.title}</span>
                        <span>R$ {service?.price.toFixed(2)}</span>
                      </div>
                      <div className="summary-total">
                        <span>Total</span>
                        <span className="total-amount">R$ {service?.price.toFixed(2)}</span>
                      </div>
                    </div>

                    {formData.paymentMethod === 'luckcoins' && user && (
                      <div className="balance-info">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 6V12L16 14" strokeLinecap="round"/>
                        </svg>
                        <span>Seu saldo: {user.credits || 0} LuckCoins</span>
                        {user.credits < (service?.price || 0) && (
                          <span className="insufficient">(Saldo insuficiente)</span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Confirmação */}
          {step === 4 && !showPix && (
            <div className="step-content">
              <div className="step-header">
                <h3>Confirmação</h3>
                <p className="step-description">Revise os dados do seu agendamento</p>
              </div>
              
              <div className="confirmation-card">
                <div className="confirmation-section">
                  <h4 className="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Detalhes do Agendamento
                  </h4>
                  <div className="detail-row">
                    <span>Serviço:</span>
                    <strong>{service?.title}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Data:</span>
                    <strong>
                      {new Date(formData.selectedDate).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Horário:</span>
                    <strong>{formData.selectedTime}</strong>
                  </div>
                </div>

                <div className="confirmation-section">
                  <h4 className="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Informações do Pet
                  </h4>
                  <div className="detail-row">
                    <span>Nome:</span>
                    <strong>{formData.petName}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Tipo:</span>
                    <strong>{formData.petType}</strong>
                  </div>
                  {formData.petAge && (
                    <div className="detail-row">
                      <span>Idade:</span>
                      <strong>{formData.petAge} anos</strong>
                    </div>
                  )}
                  {formData.petBreed && (
                    <div className="detail-row">
                      <span>Raça:</span>
                      <strong>{formData.petBreed}</strong>
                    </div>
                  )}
                  {formData.customerPhone && ( // ⭐⭐ MOSTRAR TELEFONE SE PREENCHIDO ⭐⭐
                    <div className="detail-row">
                      <span>Telefone:</span>
                      <strong>{formData.customerPhone}</strong>
                    </div>
                  )}
                </div>

                <div className="confirmation-section">
                  <h4 className="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1V23M5 6H19C20.1046 6 21 6.89543 21 8V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V8C3 6.89543 3.89543 6 5 6Z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Pagamento
                  </h4>
                  <div className="payment-display">
                    <div className="method-display">
                      <i className={paymentOptions.find(p => p.id === formData.paymentMethod)?.icon}></i>
                      <span>{paymentOptions.find(p => p.id === formData.paymentMethod)?.name}</span>
                    </div>
                    <div className="payment-amount">
                      <span>Total:</span>
                      <span className="amount">R$ {service?.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {formData.notes && (
                  <div className="confirmation-section">
                    <h4 className="section-title">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2V8H20" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 13H8" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 17H8" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 9H9H8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Observações
                    </h4>
                    <p className="notes-text">{formData.notes}</p>
                  </div>
                )}

                <div className="terms-section">
                  <label className="terms-checkbox">
                    <input type="checkbox" required />
                    <span>
                      Concordo com os 
                      <a href="/termos" target="_blank" rel="noopener noreferrer"> Termos de Serviço</a> e 
                      <a href="/politica" target="_blank" rel="noopener noreferrer"> Política de Cancelamento</a>
                    </span>
                  </label>
                  <div className="terms-note">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 8V12M12 16H12.01" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Cancelamentos gratuitos com até 24h de antecedência</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="footer-actions">
            {step > 1 && !showPix && (
              <button 
                className="btn-secondary" 
                onClick={handlePrevStep}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19L5 12L12 5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Voltar
              </button>
            )}
            
            {step < 4 && !showPix ? (
              <button 
                className="btn-primary" 
                onClick={handleNextStep}
                disabled={loading}
              >
                {step === 3 ? 'Revisar' : 'Continuar'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12H19M12 5L19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ) : !showPix ? (
              <button 
                className="btn-confirm" 
                onClick={handleSubmitBooking}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 4L12 14.01L9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Confirmar Agendamento
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>

        <style>{`
          /* ⭐⭐ NOVO ESTILO PARA HINT DO TELEFONE ⭐⭐ */
          .form-hint {
            display: block;
            margin-top: 4px;
            font-size: 12px;
            color: #6B7280;
          }

          .booking-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
            animation: fadeIn 0.3s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .booking-modal {
            background: white;
            border-radius: 24px;
            width: 100%;
            max-width: 600px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          }

          /* Header */
          .modal-header {
            padding: 0;
            border-bottom: 1px solid #F0F0F0;
          }

          .header-content {
            padding: 24px 30px;
            position: relative;
          }

          .close-btn {
            position: absolute;
            top: 24px;
            right: 24px;
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #666;
            transition: all 0.2s;
            z-index: 10;
          }

          .close-btn:hover {
            background: #7C3AED;
            color: white;
            border-color: #7C3AED;
          }

          .modal-title {
            font-size: 24px;
            font-weight: 700;
            color: #1A1A1A;
            margin: 0 0 20px 0;
          }

          .progress-indicator {
            margin-top: 16px;
          }

          .progress-bar {
            height: 4px;
            background: #F3F4F6;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 12px;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%);
            border-radius: 2px;
            transition: width 0.3s ease;
          }

          .step-labels {
            display: flex;
            justify-content: space-between;
          }

          .step-label {
            font-size: 12px;
            color: #9CA3AF;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: color 0.3s ease;
          }

          .step-label.active {
            color: #7C3AED;
          }

          /* Body */
          .modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 30px;
          }

          /* Alerts */
          .alert-message {
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            animation: slideDown 0.3s ease;
          }

          .alert-message.error {
            background: #FEF2F2;
            color: #DC2626;
            border: 1px solid #FECACA;
          }

          .alert-message.success {
            background: #F0FDF4;
            color: #059669;
            border: 1px solid #A7F3D0;
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

          /* Step Content */
          .step-header {
            margin-bottom: 32px;
          }

          .step-header h3 {
            font-size: 20px;
            font-weight: 700;
            color: #1A1A1A;
            margin: 0 0 8px 0;
          }

          .step-description {
            color: #666;
            font-size: 14px;
            margin: 0;
          }

          /* Form Styles */
          .form-group {
            margin-bottom: 20px;
          }

          .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
          }

          .section-label {
            display: block;
            margin-bottom: 16px;
            font-weight: 600;
            color: #374151;
            font-size: 15px;
          }

          .form-input,
          .form-select,
          .form-textarea {
            width: 100%;
            padding: 14px 16px;
            border: 1.5px solid #E5E7EB;
            border-radius: 12px;
            font-size: 15px;
            transition: all 0.2s;
            background: white;
            color: #1A1A1A;
          }

          .form-input:focus,
          .form-select:focus,
          .form-textarea:focus {
            outline: none;
            border-color: #7C3AED;
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .form-textarea {
            resize: vertical;
            min-height: 100px;
          }

          /* Service Summary */
          .service-summary-card {
            background: linear-gradient(135deg, #F8F5FF 0%, #F0EBFF 100%);
            border-radius: 16px;
            padding: 24px;
            border: 1px solid #EDE9FE;
            display: flex;
            gap: 20px;
            align-items: flex-start;
            margin-top: 16px;
          }

          .summary-icon {
            width: 56px;
            height: 56px;
            background: white;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #EDE9FE;
          }

          .summary-icon i {
            font-size: 24px;
            background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .summary-content h4 {
            margin: 0 0 8px 0;
            font-size: 18px;
            color: #1A1A1A;
            font-weight: 700;
          }

          .summary-description {
            color: #666;
            font-size: 14px;
            margin: 0 0 16px 0;
            line-height: 1.5;
          }

          .summary-details {
            display: flex;
            gap: 20px;
          }

          .detail-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #666;
            font-size: 14px;
            font-weight: 500;
          }

          /* Dates & Times */
          .dates-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 32px;
          }

          .date-card {
            padding: 16px 8px;
            border: 1.5px solid #E5E7EB;
            border-radius: 12px;
            background: white;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            color: #4B5563;
            transition: all 0.2s;
            text-align: center;
          }

          .date-card:hover:not(:disabled) {
            border-color: #7C3AED;
            color: #7C3AED;
            transform: translateY(-2px);
          }

          .date-card.selected {
            background: #7C3AED;
            border-color: #7C3AED;
            color: white;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
          }

          .times-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 32px;
          }

          .time-slot {
            padding: 14px;
            border: 1.5px solid #E5E7EB;
            border-radius: 12px;
            background: white;
            cursor: pointer;
            font-size: 15px;
            font-weight: 600;
            color: #4B5563;
            transition: all 0.2s;
            text-align: center;
          }

          .time-slot:hover:not(:disabled) {
            border-color: #7C3AED;
            color: #7C3AED;
            transform: translateY(-2px);
          }

          .time-slot.selected {
            background: #7C3AED;
            border-color: #7C3AED;
            color: white;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
          }

          .time-slot.disabled {
            opacity: 0.4;
            cursor: not-allowed;
            background: #F3F4F6;
          }

          /* Payment Methods */
          .payment-methods-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 32px;
          }

          .payment-method {
            position: relative;
          }

          .payment-method input {
            position: absolute;
            opacity: 0;
          }

          .method-card {
            border: 1.5px solid #E5E7EB;
            border-radius: 16px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.2s;
            background: white;
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .method-card:hover {
            border-color: #7C3AED;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }

          .payment-method.selected .method-card {
            border-color: #7C3AED;
            background: rgba(124, 58, 237, 0.05);
          }

          .method-icon {
            width: 48px;
            height: 48px;
            background: #F3F4F6;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #7C3AED;
            font-size: 20px;
            flex-shrink: 0;
          }

          .payment-method.selected .method-icon {
            background: #7C3AED;
            color: white;
          }

          .method-details {
            flex: 1;
          }

          .method-details h5 {
            margin: 0 0 6px 0;
            font-size: 16px;
            color: #1A1A1A;
            font-weight: 600;
          }

          .method-details p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }

          .method-check {
            color: #7C3AED;
            opacity: 0;
            transition: opacity 0.2s;
          }

          .payment-method.selected .method-check {
            opacity: 1;
          }

          /* Card Form */
          .form-title {
            font-size: 18px;
            font-weight: 700;
            color: #1A1A1A;
            margin: 0 0 20px 0;
          }

          /* Payment Summary */
          .payment-summary {
            background: #F9FAFB;
            border-radius: 16px;
            padding: 24px;
            border: 1px solid #E5E7EB;
          }

          .summary-title {
            font-size: 18px;
            font-weight: 700;
            color: #1A1A1A;
            margin: 0 0 20px 0;
          }

          .summary-items {
            margin-bottom: 20px;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #E5E7EB;
            color: #666;
            font-size: 15px;
          }

          .summary-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 2px solid #E5E7EB;
            margin-top: 12px;
            font-weight: 700;
            color: #1A1A1A;
            font-size: 18px;
          }

          .total-amount {
            color: #7C3AED;
            font-size: 22px;
          }

          .balance-info {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #666;
            font-size: 14px;
            margin-top: 16px;
            padding: 12px 16px;
            background: white;
            border-radius: 10px;
            border: 1px solid #E5E7EB;
          }

          .insufficient {
            color: #EF4444;
            font-weight: 600;
          }

          /* PIX Container */
          .pix-container {
            background: white;
            border-radius: 20px;
            padding: 24px;
            border: 1.5px solid #E5E7EB;
          }

          .pix-header {
            text-align: center;
            margin-bottom: 24px;
          }

          .pix-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            color: white;
            font-size: 28px;
          }

          .pix-header h4 {
            font-size: 20px;
            font-weight: 700;
            color: #1A1A1A;
            margin: 0 0 8px 0;
          }

          .pix-subtitle {
            color: #666;
            font-size: 14px;
            margin: 0;
          }

          .pix-qrcode {
            text-align: center;
            margin-bottom: 32px;
            padding: 20px;
            background: #F9FAFB;
            border-radius: 16px;
          }

          .qr-code-placeholder {
            width: 200px;
            height: 200px;
            background: white;
            border-radius: 12px;
            margin: 0 auto 16px;
            padding: 15px;
            border: 2px dashed #D1D5DB;
          }

          .qr-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 4px;
            height: 100%;
          }

          .qr-cell {
            background: #F3F4F6;
            border-radius: 2px;
          }

          .qr-cell.filled {
            background: #1F2937;
          }

          .pix-amount {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .amount-label {
            color: #666;
            font-size: 14px;
          }

          .amount-value {
            font-size: 28px;
            font-weight: 700;
            color: #1A1A1A;
          }

          .pix-code-section {
            margin-bottom: 24px;
          }

          .code-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
          }

          .code-display {
            display: flex;
            align-items: center;
            gap: 12px;
            background: #F3F4F6;
            padding: 12px 16px;
            border-radius: 12px;
            border: 1px solid #E5E7EB;
          }

          .pix-code {
            flex: 1;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            color: #6B7280;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .copy-btn {
            background: white;
            color: #6B7280;
            border: 1px solid #D1D5DB;
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
          }

          .copy-btn:hover {
            background: #7C3AED;
            color: white;
            border-color: #7C3AED;
          }

          .pix-info {
            background: #F0FDF4;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
            border: 1px solid #A7F3D0;
          }

          .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #065F46;
            font-size: 14px;
            margin-bottom: 8px;
          }

          .info-item:last-child {
            margin-bottom: 0;
          }

          .pix-actions {
            display: flex;
            gap: 12px;
          }

          /* Confirmation Card */
          .confirmation-card {
            background: #F9FAFB;
            border-radius: 20px;
            padding: 24px;
            border: 1px solid #E5E7EB;
          }

          .confirmation-section {
            margin-bottom: 24px;
            padding-bottom: 24px;
            border-bottom: 1px solid #E5E7EB;
          }

          .confirmation-section:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }

          .section-title {
            font-size: 17px;
            font-weight: 700;
            color: #1A1A1A;
            margin: 0 0 16px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }

          .detail-row:last-child {
            margin-bottom: 0;
          }

          .detail-row span {
            color: #666;
            font-size: 15px;
          }

          .detail-row strong {
            color: #1A1A1A;
            font-size: 16px;
            font-weight: 600;
            text-align: right;
          }

          .payment-display {
            background: white;
            border-radius: 12px;
            padding: 20px;
          }

          .method-display {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }

          .method-display i {
            font-size: 24px;
            color: #7C3AED;
          }

          .method-display span {
            font-size: 16px;
            font-weight: 600;
            color: #1A1A1A;
          }

          .payment-amount {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid #E5E7EB;
            font-weight: 700;
            color: #1A1A1A;
          }

          .amount {
            color: #7C3AED;
            font-size: 20px;
          }

          .notes-text {
            margin: 0;
            padding: 16px;
            background: white;
            border-radius: 12px;
            border-left: 4px solid #7C3AED;
            color: #666;
            font-size: 15px;
            line-height: 1.5;
          }

          .terms-section {
            margin-top: 24px;
          }

          .terms-checkbox {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            cursor: pointer;
            margin-bottom: 12px;
            font-size: 14px;
            color: #666;
          }

          .terms-checkbox a {
            color: #7C3AED;
            text-decoration: none;
            margin: 0 4px;
            font-weight: 600;
          }

          .terms-checkbox a:hover {
            text-decoration: underline;
          }

          .terms-note {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #666;
            font-size: 13px;
            margin: 0;
          }

          /* Footer */
          .modal-footer {
            padding: 24px 30px;
            border-top: 1px solid #F0F0F0;
            background: white;
          }

          .footer-actions {
            display: flex;
            gap: 12px;
          }

          .btn-secondary,
          .btn-primary,
          .btn-confirm {
            flex: 1;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            letter-spacing: 0.3px;
          }

          .btn-secondary {
            background: white;
            color: #666;
            border: 1.5px solid #E5E7EB;
          }

          .btn-secondary:hover:not(:disabled) {
            background: #F9FAFB;
            border-color: #D1D5DB;
            transform: translateY(-2px);
          }

          .btn-secondary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .btn-primary {
            background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
            background: linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%);
          }

          .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .btn-confirm {
            background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
            color: white;
          }

          .btn-confirm:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
            background: linear-gradient(135deg, #059669 0%, #10B981 100%);
          }

          .btn-confirm:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .spinner {
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          /* Scrollbar */
          .modal-body::-webkit-scrollbar {
            width: 6px;
          }

          .modal-body::-webkit-scrollbar-track {
            background: #F9FAFB;
            border-radius: 3px;
          }

          .modal-body::-webkit-scrollbar-thumb {
            background: #D1D5DB;
            border-radius: 3px;
          }

          .modal-body::-webkit-scrollbar-thumb:hover {
            background: #9CA3AF;
          }

          /* Responsive */
          @media (max-width: 768px) {
            .booking-modal {
              max-height: 100vh;
              border-radius: 0;
              max-width: 100%;
            }

            .header-content {
              padding: 20px;
            }

            .modal-body {
              padding: 20px;
            }

            .modal-footer {
              padding: 20px;
            }

            .dates-grid,
            .times-grid {
              grid-template-columns: repeat(3, 1fr);
            }

            .form-row {
              grid-template-columns: 1fr;
            }

            .footer-actions {
              flex-direction: column;
            }

            .qr-code-placeholder {
              width: 150px;
              height: 150px;
            }
          }

          @media (max-width: 480px) {
            .dates-grid,
            .times-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .modal-title {
              font-size: 20px;
            }

            .step-header h3 {
              font-size: 18px;
            }

            .btn-secondary,
            .btn-primary,
            .btn-confirm {
              padding: 14px 20px;
              font-size: 14px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default BookingModal;