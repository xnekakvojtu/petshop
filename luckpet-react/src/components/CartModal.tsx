// src/components/CartModal.tsx
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { products } from '../data/products';
import { Link, useNavigate } from 'react-router-dom';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface CartItemProps {
  productId: string;
  quantity: number;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

// Funções de storage
const getCart = (): Record<string, number> => {
  try {
    const cart = localStorage.getItem('cart');
    if (!cart) return {};
    
    const parsed = JSON.parse(cart);
    if (typeof parsed === 'object' && parsed !== null) {
      const result: Record<string, number> = {};
      Object.entries(parsed).forEach(([key, value]) => {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue > 0) {
          result[key] = numValue;
        }
      });
      return result;
    }
    return {};
  } catch (error) {
    console.error('Erro ao ler carrinho:', error);
    return {};
  }
};

const saveCart = (cart: Record<string, number>) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Erro ao salvar carrinho:', error);
  }
};

const removeFromCart = (id: string) => {
  const cart = getCart();
  delete cart[id];
  saveCart(cart);
};

const updateCartQuantity = (id: string, quantity: number) => {
  const cart = getCart();
  if (quantity <= 0) {
    delete cart[id];
  } else {
    cart[id] = quantity;
  }
  saveCart(cart);
};

const clearCart = () => {
  localStorage.removeItem('cart');
};

/* =====================
   ITEM DO CARRINHO
===================== */
const CartItem = memo(
  ({ productId, quantity, onRemove, onUpdateQuantity }: CartItemProps) => {
    const product = products[productId];
    if (!product) return null;

    const subtotal = product.price * quantity;

    return (
      <div className="cart-item">
        <div className="item-image">
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src = `https://placehold.co/80x80/e5e7eb/6b7280?text=${product.name.slice(0, 2)}`;
            }}
          />
        </div>

        <div className="item-details">
          <div className="item-header">
            <h3 className="item-name">{product.name}</h3>
            <button 
              className="remove-btn" 
              onClick={() => onRemove(productId)}
              aria-label="Remover"
            >
              ×
            </button>
          </div>
          
          <div className="item-footer">
            <div className="quantity-control">
              <button 
                className="qty-btn" 
                onClick={() => onUpdateQuantity(productId, -1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="qty-value">{quantity}</span>
              <button 
                className="qty-btn" 
                onClick={() => onUpdateQuantity(productId, 1)}
              >
                +
              </button>
            </div>
            <div className="price-info">
              <span className="unit-price">R$ {product.price.toFixed(2)}</span>
              <span className="subtotal">R$ {subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CartItem.displayName = 'CartItem';

/* =====================
   MODAL DO CARRINHO
===================== */
const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  onUpdate
}) => {
  const navigate = useNavigate();
  const [creditsBalance, setCreditsBalance] = useState(0);
  const [appliedCredits, setAppliedCredits] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      setCartItems(getCart());
    }
  }, [isOpen]);

  const items = useMemo(() => Object.entries(cartItems), [cartItems]);

  const total = useMemo(() => {
    return items.reduce((sum, [id, qty]) => {
      const product = products[id];
      return sum + (product ? product.price * qty : 0);
    }, 0);
  }, [items]);

  const maxCredits = Math.min(creditsBalance, total);
  const finalTotal = Math.max(0, total - appliedCredits);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';

    const savedCredits = localStorage.getItem('userCredits');
    setCreditsBalance(savedCredits ? parseInt(savedCredits, 10) : 0);

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleRemove = useCallback((id: string) => {
    removeFromCart(id);
    setCartItems(getCart());
    onUpdate();
  }, [onUpdate]);

  const handleUpdateQuantity = useCallback((id: string, delta: number) => {
    const currentQuantity = cartItems[id] || 0;
    const newQuantity = currentQuantity + delta;
    
    if (newQuantity <= 0) {
      removeFromCart(id);
    } else {
      updateCartQuantity(id, newQuantity);
    }
    
    setCartItems(getCart());
    onUpdate();
  }, [cartItems, onUpdate]);

  const handleClearCart = useCallback(() => {
    if (window.confirm('Tem certeza que deseja limpar o carrinho?')) {
      clearCart();
      setCartItems({});
      onUpdate();
    }
  }, [onUpdate]);

  const handleApplyMaxCredits = () => {
    setAppliedCredits(maxCredits);
  };

  const handleRemoveCredits = () => {
    setAppliedCredits(0);
  };

  const handleCheckout = async () => {
    if (processing || total === 0 || items.length === 0) return;
    setProcessing(true);

    try {
      if (appliedCredits > 0 && creditsBalance >= appliedCredits) {
        const newBalance = creditsBalance - appliedCredits;
        localStorage.setItem('userCredits', newBalance.toString());
        setCreditsBalance(newBalance);
      }

      const checkoutItems = items.map(([id, qty]) => {
        const product = products[id];
        return {
          id,
          name: product?.name || 'Produto',
          price: product?.price || 0,
          quantity: qty,
          image: product?.image || ''
        };
      });
      
      localStorage.setItem('checkout_cart', JSON.stringify(checkoutItems));

      clearCart();
      setCartItems({});
      onUpdate();
      onClose();
      
      navigate('/payment');
      
    } catch (error) {
      console.error('Erro no checkout:', error);
      alert('Erro ao processar compra. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div className="header-content">
            <div className="cart-icon-title">
              <svg className="cart-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <h2>Carrinho</h2>
            </div>
            <span className="items-count">({items.length})</span>
          </div>
          <div className="header-actions">
            {items.length > 0 && (
              <button 
                className="clear-header-btn"
                onClick={handleClearCart}
                title="Limpar carrinho"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-cart-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <p>Seu carrinho está vazio</p>
            <Link to="/" onClick={onClose} className="shop-link">
              Ver produtos
            </Link>
          </div>
        ) : (
          <>
            <div className="items-list">
              {items.map(([id, qty]) => (
                <CartItem
                  key={id}
                  productId={id}
                  quantity={qty}
                  onRemove={handleRemove}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              ))}
            </div>

            <div className="summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>

              {creditsBalance > 0 && (
                <div className="credits-section">
                  <div className="credits-label">
                    <div className="credits-info">
                      <svg className="credits-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      <span>LuckCoins: {creditsBalance}</span>
                    </div>
                    <div className="credits-actions">
                      {appliedCredits > 0 ? (
                        <>
                          <span className="applied-credits">
                            -R$ {appliedCredits.toFixed(2)}
                          </span>
                          <button 
                            className="remove-credits-btn"
                            onClick={handleRemoveCredits}
                            title="Remover LuckCoins"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <button 
                          className="use-max"
                          onClick={handleApplyMaxCredits}
                        >
                          Usar máximo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="total-row">
                <strong>Total</strong>
                <strong>R$ {finalTotal.toFixed(2)}</strong>
              </div>
            </div>

            <div className="actions">
              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={processing}
              >
                <svg className="cart-icon-white" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {processing ? 'Processando...' : 'Ir para pagamento'}
              </button>
              
              <button className="continue-btn" onClick={onClose}>
                Continuar comprando
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .modal {
          width: 100%;
          max-width: 400px;
          max-height: 80vh;
          background: #fff;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }

        /* HEADER MELHORADO */
        .modal-header {
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f3f4f6;
          background: #fafafa;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .clear-header-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid #fee2e2;
          background: #fef2f2;
          color: #dc2626;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          padding: 0;
        }

        .clear-header-btn:hover {
          background: #fecaca;
          border-color: #fca5a5;
        }

        .cart-icon-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cart-icon {
          color: #7c3aed;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .items-count {
          color: #6b7280;
          font-size: 14px;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #6b7280;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        /* LISTA DE ITENS */
        .items-list {
          flex: 1;
          overflow-y: auto;
          max-height: 300px;
          padding: 0 20px;
        }

        /* ITEM DO CARRINHO */
        .cart-item {
          display: flex;
          gap: 12px;
          padding: 16px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .cart-item:last-child {
          border-bottom: none;
        }

        .item-image img {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          object-fit: cover;
          background: #f9fafb;
        }

        .item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .item-name {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          line-height: 1.4;
          max-width: 200px;
        }

        .remove-btn {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 1px solid #f3f4f6;
          background: #fff;
          color: #9ca3af;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .remove-btn:hover {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fecaca;
        }

        .item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
        }

        .qty-btn {
          width: 28px;
          height: 28px;
          border: none;
          background: #f9fafb;
          color: #4b5563;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qty-btn:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .qty-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .qty-value {
          width: 32px;
          text-align: center;
          font-weight: 500;
          font-size: 14px;
          color: #111827;
        }

        .price-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .unit-price {
          font-size: 12px;
          color: #6b7280;
        }

        .subtotal {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        /* CARRINHO VAZIO */
        .empty-state {
          padding: 48px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .empty-cart-icon {
          color: #d1d5db;
          margin-bottom: 12px;
        }

        .empty-state p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .shop-link {
          color: #7c3aed;
          font-size: 14px;
          text-decoration: none;
          font-weight: 500;
          padding: 8px 16px;
          border: 1px solid #7c3aed;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .shop-link:hover {
          background: #7c3aed;
          color: white;
        }

        /* RESUMO */
        .summary {
          padding: 16px 20px;
          border-top: 1px solid #f3f4f6;
          background: #fafafa;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          color: #4b5563;
        }

        /* CRÉDITOS */
        .credits-section {
          margin: 12px 0;
        }

        .credits-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: #6b7280;
        }

        .credits-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .credits-icon {
          color: #f59e0b;
        }

        .credits-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .use-max {
          padding: 4px 8px;
          background: #fef3c7;
          color: #92400e;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .use-max:hover {
          background: #fde68a;
        }

        .applied-credits {
          color: #059669;
          font-weight: 600;
          font-size: 13px;
        }

        .remove-credits-btn {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1px solid #fca5a5;
          background: #fef2f2;
          color: #dc2626;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .remove-credits-btn:hover {
          background: #fecaca;
          border-color: #f87171;
        }

        /* TOTAL */
        .total-row {
          display: flex;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          margin-top: 12px;
          font-size: 16px;
          color: #111827;
        }

        /* AÇÕES */
        .actions {
          padding: 16px 20px;
          border-top: 1px solid #f3f4f6;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .checkout-btn {
          padding: 12px;
          background: #7c3aed;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .checkout-btn:hover:not(:disabled) {
          background: #6d28d9;
        }

        .checkout-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cart-icon-white {
          color: white;
        }

        .continue-btn {
          padding: 10px;
          background: transparent;
          color: #6b7280;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .continue-btn:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        /* SCROLLBAR */
        .items-list::-webkit-scrollbar {
          width: 4px;
        }

        .items-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .items-list::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }

        .items-list::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        /* RESPONSIVIDADE */
        @media (max-width: 480px) {
          .modal {
            max-width: 92%;
            max-height: 85vh;
          }
          
          .items-list {
            max-height: 250px;
          }
          
          .item-name {
            max-width: 160px;
          }
          
          .modal-header {
            padding: 14px 16px;
          }
          
          .header-actions {
            gap: 6px;
          }
        }

        @media (max-width: 360px) {
          .modal-header,
          .summary,
          .actions {
            padding: 12px 16px;
          }
          
          .items-list {
            padding: 0 16px;
          }
          
          .item-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .price-info {
            align-items: flex-start;
          }
          
          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default memo(CartModal);