// src/pages/Payment.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string>('pix');
  const [userCredits, setUserCredits] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    loadCartFromStorage();
    loadCredits();
  }, []);

  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('checkout_cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(Array.isArray(parsedCart) ? parsedCart : []);
      }
    } catch (error) {
      console.log('Erro ao carregar carrinho:', error);
    }
  };

  const loadCredits = () => {
    const savedCredits = localStorage.getItem('userCredits');
    if (savedCredits) {
      setUserCredits(parseInt(savedCredits));
    }
  };

  // Função para remover um produto do carrinho
  const removeProduct = (productId: string) => {
    if (window.confirm('Tem certeza que deseja remover este produto do carrinho?')) {
      const updatedCart = cart.filter(item => item.id !== productId);
      setCart(updatedCart);
      
      // Atualizar localStorage
      localStorage.setItem('checkout_cart', JSON.stringify(updatedCart));
      
      // Se não houver mais itens, redirecionar para home
      if (updatedCart.length === 0) {
        alert('Carrinho vazio! Redirecionando para a loja...');
        setTimeout(() => navigate('/'), 1000);
      }
    }
  };

  // Cálculos
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = selectedMethod === 'pix' ? subtotal * 0.05 : 0;
  const total = Math.max(0, subtotal - discount);
  const creditsCost = Math.floor(total);

  const handlePayment = async () => {
    if (cart.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }

    if (selectedMethod === 'credits' && userCredits < creditsCost) {
      alert('Saldo insuficiente de LuckCoins!');
      return;
    }

    setIsProcessing(true);

    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (selectedMethod === 'credits') {
      const newCredits = userCredits - creditsCost;
      setUserCredits(newCredits);
      localStorage.setItem('userCredits', newCredits.toString());
      
      alert(`Pagamento realizado com ${creditsCost} LuckCoins! Saldo restante: ${newCredits}`);
    } else {
      alert(`Pagamento ${selectedMethod.toUpperCase()} confirmado! Total: R$ ${total.toFixed(2)}`);
    }
    
    // Limpar carrinhos
    localStorage.removeItem('checkout_cart');
    localStorage.removeItem('cart');
    
    setIsProcessing(false);
    navigate('/');
  };

  const cancelPurchase = () => {
    if (window.confirm('Tem certeza que deseja cancelar a compra? Todos os itens serão removidos.')) {
      localStorage.removeItem('checkout_cart');
      localStorage.removeItem('cart');
      navigate('/');
    }
  };

  return (
    <div className="payment-page">
      {/* Header */}
      <div className="payment-header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="4.5" cy="9.5" r="2.5"/>
                <circle cx="9" cy="5.5" r="2.5"/>
                <circle cx="15" cy="5.5" r="2.5"/>
                <circle cx="19.5" cy="9.5" r="2.5"/>
                <path d="M17.3 14.7c.2-.2.4-.4.7-.6c1-1 2.5-1.6 4-1.6s3 .6 4 1.6"/>
                <path d="M2.7 14.7c-.2-.2-.4-.4-.7-.6C1 13 0 12.4 0 12s1-1 2-1.6c1-.6 2.5-1.6 4-1.6s3 1 4 1.6"/>
                <path d="M7 14c.2 0 .4 0 .6.1c.6.2 1.2.4 1.9.4s1.3-.2 1.9-.4c.2-.1.4-.1.6-.1"/>
              </svg>
              <span>LuckPet</span>
            </Link>
            <button onClick={cancelPurchase} className="cancel-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Cancelar compra
            </button>
          </div>
        </div>
      </div>

      <main className="payment-main">
        <div className="container">
          <div className="page-header">
            <h1>Finalizar Compra</h1>
            <p>Revise seu pedido e escolha a forma de pagamento</p>
          </div>

          <div className="checkout-grid">
            {/* Resumo do Pedido */}
            <div className="order-summary">
              <div className="summary-header">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 1 1-8 0"/>
                  </svg>
                  Resumo do Pedido
                </h2>
                <span className="item-count">{cart.length} itens</span>
              </div>

              <div className="cart-items">
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <p>Carrinho vazio</p>
                    <Link to="/" className="back-to-shop">
                      Voltar para a loja
                    </Link>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="item-info">
                        <h3>{item.name}</h3>
                        <div className="item-details">
                          <span>Qtd: {item.quantity}</span>
                          <span className="price">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeProduct(item.id)}
                        aria-label="Remover produto"
                        title="Remover do carrinho"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="order-totals">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Frete</span>
                    <span className="free">Grátis</span>
                  </div>
                  {selectedMethod === 'pix' && discount > 0 && (
                    <div className="total-row discount">
                      <span>Desconto PIX (5%)</span>
                      <span>- R$ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="total-row grand-total">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Pagamento */}
            <div className="payment-section">
              {cart.length === 0 ? (
                <div className="empty-payment">
                  <p>Adicione produtos ao carrinho para continuar</p>
                  <Link to="/" className="shop-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 1 1-8 0"/>
                    </svg>
                    Ver produtos
                  </Link>
                </div>
              ) : (
                <>
                  <div className="section-header">
                    <h2>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                      Forma de Pagamento
                    </h2>
                  </div>

                  {/* Métodos de Pagamento */}
                  <div className="payment-methods">
                    <div 
                      className={`payment-method ${selectedMethod === 'pix' ? 'selected' : ''}`}
                      onClick={() => setSelectedMethod('pix')}
                    >
                      <div className="method-icon" style={{ background: '#7c3aed' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="6" width="20" height="12" rx="2"/>
                          <circle cx="12" cy="12" r="2"/>
                          <line x1="18" y1="6" x2="18" y2="8"/>
                          <line x1="6" y1="6" x2="6" y2="8"/>
                        </svg>
                      </div>
                      <div className="method-info">
                        <h3>PIX</h3>
                        <p>Pagamento instantâneo com 5% OFF</p>
                        {selectedMethod === 'pix' && (
                          <span className="method-badge">5% de desconto</span>
                        )}
                      </div>
                    </div>

                    <div 
                      className={`payment-method ${selectedMethod === 'credit' ? 'selected' : ''}`}
                      onClick={() => setSelectedMethod('credit')}
                    >
                      <div className="method-icon" style={{ background: '#3b82f6' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                          <line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                      </div>
                      <div className="method-info">
                        <h3>Cartão de Crédito</h3>
                        <p>Parcelamento em até 12x</p>
                      </div>
                    </div>

                    <div 
                      className={`payment-method ${selectedMethod === 'debit' ? 'selected' : ''}`}
                      onClick={() => setSelectedMethod('debit')}
                    >
                      <div className="method-icon" style={{ background: '#10b981' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                          <line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                      </div>
                      <div className="method-info">
                        <h3>Cartão de Débito</h3>
                        <p>Débito automático</p>
                      </div>
                    </div>

                    <div 
                      className={`payment-method ${selectedMethod === 'credits' ? 'selected' : ''}`}
                      onClick={() => setSelectedMethod('credits')}
                    >
                      <div className="method-icon" style={{ background: '#f59e0b' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 6v6l4 2"/>
                        </svg>
                      </div>
                      <div className="method-info">
                        <h3>LuckCoins</h3>
                        <p>Use seus créditos</p>
                        <div className="credits-balance">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                            <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
                          </svg>
                          <span>Saldo: {userCredits} coins</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes do Pagamento */}
                  <div className="payment-details">
                    {selectedMethod === 'pix' && (
                      <div className="pix-section">
                        <div className="qr-placeholder">
                          <div className="qr-code">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <path d="M16 8v8M8 8v8M8 16h8M8 8h8"/>
                            </svg>
                          </div>
                          <div className="qr-info">
                            <p>Escaneie o QR Code com seu app bancário</p>
                            <div className="total-amount">R$ {total.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="pix-instructions">
                          <h4>Como pagar:</h4>
                          <ol>
                            <li>Abra o app do seu banco</li>
                            <li>Acesse a opção PIX</li>
                            <li>Escaneie o código QR</li>
                            <li>Confirme o pagamento</li>
                          </ol>
                        </div>
                      </div>
                    )}

                    {selectedMethod === 'credits' && (
                      <div className="credits-section">
                        <div className="credits-summary">
                          <div className="summary-item">
                            <span>Total da compra</span>
                            <span>R$ {total.toFixed(2)}</span>
                          </div>
                          <div className="summary-item">
                            <span>Seu saldo</span>
                            <span>{userCredits} LuckCoins</span>
                          </div>
                          <div className="summary-item total">
                            <span>Custo em coins</span>
                            <span>{creditsCost} LuckCoins</span>
                          </div>
                          
                          {userCredits >= creditsCost ? (
                            <div className="credits-success">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                              </svg>
                              <span>Saldo suficiente! Após compra: {userCredits - creditsCost} coins</span>
                            </div>
                          ) : (
                            <div className="credits-error">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12" y2="16"/>
                              </svg>
                              <span>Saldo insuficiente! Faltam {creditsCost - userCredits} coins</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botão de Finalizar */}
                  <button 
                    className="checkout-btn"
                    onClick={handlePayment}
                    disabled={isProcessing || (selectedMethod === 'credits' && userCredits < creditsCost)}
                  >
                    {isProcessing ? (
                      <>
                        <div className="spinner"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                          <line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                        Finalizar Compra • R$ {total.toFixed(2)}
                      </>
                    )}
                  </button>

                  {/* Segurança */}
                  <div className="security-info">
                    <div className="security-badges">
                      <div className="badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        <span>Pagamento Seguro</span>
                      </div>
                      <div className="badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <span>Dados Protegidos</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        /* Base */
        .payment-page {
          min-height: 100vh;
          background: #f8fafc;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Header */
        .payment-header {
          background: white;
          padding: 20px 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #1f2937;
          font-size: 24px;
          font-weight: 700;
        }

        .logo svg {
          color: #7c3aed;
        }

        .cancel-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          background: #fecaca;
          border-color: #fca5a5;
        }

        /* Main */
        .payment-main {
          padding: 40px 0;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .page-header h1 {
          font-size: 32px;
          color: #1f2937;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .page-header p {
          color: #6b7280;
          font-size: 16px;
        }

        /* Grid */
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        /* Order Summary */
        .order-summary {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f3f4f6;
        }

        .summary-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 20px;
          color: #1f2937;
          font-weight: 600;
        }

        .item-count {
          background: #7c3aed;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Cart Items */
        .cart-items {
          margin-bottom: 30px;
        }

        .cart-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: #f9fafb;
          border-radius: 12px;
          margin-bottom: 15px;
          position: relative;
        }

        .cart-item:last-child {
          margin-bottom: 0;
        }

        .item-image {
          width: 70px;
          height: 70px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-info {
          flex: 1;
        }

        .item-info h3 {
          margin: 0 0 8px 0;
          font-size: 15px;
          color: #1f2937;
          font-weight: 600;
          line-height: 1.3;
        }

        .item-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .item-details span:first-child {
          color: #6b7280;
          font-size: 14px;
        }

        .item-details .price {
          font-weight: 700;
          color: #1f2937;
          font-size: 15px;
        }

        /* Botão Remover */
        .remove-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid #fee2e2;
          background: #fef2f2;
          color: #dc2626;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
          margin-left: 10px;
        }

        .remove-btn:hover {
          background: #fecaca;
          border-color: #fca5a5;
        }

        /* Carrinho Vazio */
        .empty-cart, .empty-payment {
          text-align: center;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .empty-cart svg {
          color: #d1d5db;
        }

        .empty-cart p, .empty-payment p {
          color: #6b7280;
          font-size: 16px;
          margin: 0;
        }

        .back-to-shop, .shop-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #7c3aed;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .back-to-shop:hover, .shop-btn:hover {
          background: #6d28d9;
          transform: translateY(-2px);
        }

        /* Order Totals */
        .order-totals {
          padding-top: 20px;
          border-top: 2px solid #f3f4f6;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          color: #6b7280;
        }

        .total-row .free {
          color: #10b981;
          font-weight: 600;
        }

        .total-row.discount {
          color: #10b981;
          font-weight: 600;
        }

        .total-row.grand-total {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
        }

        /* Payment Section */
        .payment-section {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .section-header {
          margin-bottom: 30px;
        }

        .section-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 20px;
          color: #1f2937;
          font-weight: 600;
        }

        /* Payment Methods */
        .payment-methods {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }

        .payment-method {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }

        .payment-method:hover {
          border-color: #7c3aed;
          transform: translateY(-2px);
        }

        .payment-method.selected {
          border-color: #7c3aed;
          background: rgba(124, 58, 237, 0.05);
        }

        .method-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 15px;
        }

        .method-info h3 {
          margin: 0 0 5px 0;
          font-size: 16px;
          color: #1f2937;
          font-weight: 600;
        }

        .method-info p {
          margin: 0 0 10px 0;
          color: #6b7280;
          font-size: 14px;
        }

        .method-badge {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .credits-balance {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #f59e0b;
          font-size: 13px;
          font-weight: 600;
          margin-top: 8px;
        }

        /* Payment Details */
        .payment-details {
          margin-bottom: 30px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 12px;
        }

        /* PIX */
        .qr-placeholder {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .qr-code {
          width: 140px;
          height: 140px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #7c3aed;
        }

        .qr-info p {
          margin: 0 0 10px 0;
          color: #6b7280;
        }

        .total-amount {
          font-size: 28px;
          font-weight: 800;
          color: #7c3aed;
        }

        .pix-instructions {
          background: white;
          padding: 15px;
          border-radius: 8px;
        }

        .pix-instructions h4 {
          margin: 0 0 10px 0;
          font-size: 16px;
          color: #1f2937;
          font-weight: 600;
        }

        .pix-instructions ol {
          margin: 0;
          padding-left: 20px;
          color: #6b7280;
        }

        .pix-instructions li {
          margin-bottom: 5px;
        }

        /* Credits */
        .credits-summary {
          background: white;
          padding: 15px;
          border-radius: 8px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f3f4f6;
          color: #6b7280;
        }

        .summary-item.total {
          font-weight: 700;
          color: #1f2937;
          border-bottom: none;
        }

        .credits-success {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px;
          background: #d1fae5;
          border-radius: 8px;
          margin-top: 15px;
          color: #065f46;
          font-weight: 600;
        }

        .credits-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px;
          background: #fee2e2;
          border-radius: 8px;
          margin-top: 15px;
          color: #991b1b;
          font-weight: 600;
        }

        /* Checkout Button */
        .checkout-btn {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
        }

        .checkout-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(124, 58, 237, 0.3);
        }

        .checkout-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Security */
        .security-info {
          margin-top: 20px;
          text-align: center;
        }

        .security-badges {
          display: flex;
          justify-content: center;
          gap: 30px;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .checkout-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .payment-methods {
            grid-template-columns: 1fr;
          }

          .qr-placeholder {
            flex-direction: column;
            text-align: center;
          }

          .security-badges {
            flex-direction: column;
            gap: 15px;
          }
          
          .cart-item {
            flex-wrap: wrap;
          }
          
          .remove-btn {
            position: absolute;
            top: 10px;
            right: 10px;
          }
        }

        @media (max-width: 480px) {
          .payment-main {
            padding: 20px 0;
          }

          .order-summary,
          .payment-section {
            padding: 20px;
          }

          .page-header h1 {
            font-size: 24px;
          }
          
          .header-content {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Payment;