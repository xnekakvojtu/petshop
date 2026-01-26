// src/components/ProductCard.tsx:
import React, { memo, useCallback, useState } from 'react';
import { Product } from '../types/index';
import { useAuth } from '../hooks/useAuth';

interface ProductCardProps {
  product: Product;
  isClothing?: boolean;
  isInWishlist: boolean;
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = memo(({
  product,
  isClothing = false,
  isInWishlist,
  onAddToCart,
  onToggleWishlist,
  index = 0
}) => {
  const { isLoggedIn, user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('M');

  // Verificar se é admin
  const isAdmin = user?.role === 'admin';

  const handleAddToCart = useCallback(() => {
    if (!isLoggedIn) {
      window.dispatchEvent(new CustomEvent('showLoginAlert', {
        detail: {
          message: 'Faça login para adicionar produtos!'
        }
      }));
      return;
    }
    setIsAdding(true);
    onAddToCart(product.id);
    setTimeout(() => setIsAdding(false), 500);
  }, [product.id, onAddToCart, isLoggedIn]);

  const handleToggleWishlist = useCallback(() => {
    if (!isLoggedIn) {
      window.dispatchEvent(new CustomEvent('showLoginAlert', {
        detail: {
          message: 'Faça login para favoritar produtos!'
        }
      }));
      return;
    }
    onToggleWishlist(product.id);
  }, [product.id, onToggleWishlist, isLoggedIn]);

  const handleSizeSelect = useCallback((size: string) => {
    setSelectedSize(size);
  }, []);

  const openLoginAlert = useCallback(() => {
    window.dispatchEvent(new Event('openLoginAlert'));
  }, []);

  return (
    <div className="product-card" style={{ '--index': index } as React.CSSProperties}>
      <div className="image-container">
        <div className="image-wrapper">
          <img 
            src={product.image} 
            alt={product.name}
            loading={index > 2 ? "lazy" : "eager"}
          />
        </div>
        
        <button 
          className={`wishlist-btn ${isInWishlist ? 'active' : ''} ${!isLoggedIn ? 'disabled' : ''}`}
          onClick={handleToggleWishlist}
          aria-label={isInWishlist ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          disabled={!isLoggedIn}
          style={isAdmin ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        
        {!isLoggedIn && (
          <div className="login-hint">
            <button 
              className="hint-btn"
              onClick={openLoginAlert}
              aria-label="Faça login para favoritar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15V3M12 15L8 11M12 15L16 11M2 17L2 22H22V17C22 15.8954 21.1046 15 20 15H4C2.89543 15 2 15.8954 2 17Z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        {isClothing && (
          <div className="size-selector">
            <div className="sizes">
              {['P', 'M', 'G'].map(size => (
                <button
                  key={size}
                  className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => handleSizeSelect(size)}
                  style={isAdmin ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="price-section">
          <div className="price-display">
            <div className="price-row">
              <span className="currency">R$</span>
              <span className="amount">{product.price.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="credits-hint">
              <svg className="coin-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2" strokeLinecap="round"/>
              </svg>
              <span className="credits-text">Ganhe {Math.floor(product.price)} LuckCoins</span>
            </div>
          </div>
        </div>
        
        {!isLoggedIn ? (
          <button 
            className="action-btn login-required-btn"
            onClick={openLoginAlert}
          >
            <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 15V3M12 15L8 11M12 15L16 11M2 17L2 22H22V17C22 15.8954 21.1046 15 20 15H4C2.89543 15 2 15.8954 2 17Z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Fazer Login</span>
          </button>
        ) : isAdmin ? (
          <button 
            className="action-btn add-cart-btn"
            style={{ cursor: 'not-allowed', opacity: 0.5 }}
            disabled
          >
            <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Adicionar</span>
          </button>
        ) : (
          <button 
            className={`action-btn add-cart-btn ${isAdding ? 'adding' : ''}`}
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Adicionado</span>
              </>
            ) : (
              <>
                <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Adicionar</span>
              </>
            )}
          </button>
        )}
      </div>

      <style>{`
        .product-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #F0F0F0;
          transition: all 0.3s ease;
          position: relative;
          opacity: 0;
          animation: fadeInUp 0.6s ease-out forwards;
          animation-delay: calc(var(--index) * 0.1s);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: #E5E7EB;
        }

        .image-container {
          position: relative;
          height: 200px;
          background: #F8FAFC;
          overflow: hidden;
          flex-shrink: 0;
        }

        .image-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .product-card:hover .image-wrapper img {
          transform: scale(1.05);
        }

        .wishlist-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: white;
          border: 1px solid #E5E7EB;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #9CA3AF;
          transition: all 0.2s ease;
          z-index: 10;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        .wishlist-btn:hover:not(.disabled):not([style*="cursor: not-allowed"]) {
          color: #EF4444;
          border-color: #FECACA;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
        }

        .wishlist-btn.active {
          color: #EF4444;
          background: #FEF2F2;
          border-color: #FCA5A5;
        }

        .wishlist-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-hint {
          position: absolute;
          top: 56px;
          right: 12px;
        }

        .hint-btn {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.9);
          color: #6B7280;
          border: 1px solid #E5E7EB;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0;
          transform: translateY(8px);
        }

        .product-card:hover .hint-btn {
          opacity: 1;
          transform: translateY(0);
        }

        .hint-btn:hover {
          background: white;
          border-color: #9CA3AF;
          color: #374151;
        }

        .product-info {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* 🔥🔥🔥 TÍTULO DOS PRODUTOS - GRANDE PRA CARALHO 🔥🔥🔥 */
        .product-name {
          font-size: 20px !important;
          font-weight: 700 !important;
          color: #1F2937;
          margin: 0;
          line-height: 1.3 !important;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
          letter-spacing: -0.2px;
        }

        .size-selector {
          margin-bottom: 8px;
        }

        .sizes {
          display: flex;
          gap: 8px;
        }

        .size-option {
          flex: 1;
          padding: 8px;
          border: 1px solid #E5E7EB;
          background: white;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          min-height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .size-option:hover:not([style*="cursor: not-allowed"]) {
          border-color: #7C3AED;
          color: #7C3AED;
        }

        .size-option.selected {
          background: #7C3AED;
          border-color: #7C3AED;
          color: white;
        }

        .price-section {
          margin: 12px 0 4px;
        }

        .price-display {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .currency {
          font-size: 18px;
          color: #6B7280;
          font-weight: 600;
        }

        .amount {
          font-size: 28px;
          font-weight: 700;
          color: #1F2937;
          line-height: 1;
          letter-spacing: -0.5px;
        }

        .credits-hint {
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .product-card:hover .credits-hint {
          opacity: 0.9;
        }

        .coin-icon {
          color: #F59E0B;
          flex-shrink: 0;
          stroke-width: 2;
        }

        .credits-text {
          font-size: 13px;
          color: #6B7280;
          font-weight: 500;
        }

        .action-btn {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          margin-top: auto;
        }

        .add-cart-btn {
          background: #7C3AED;
          color: white;
        }

        .add-cart-btn:hover:not(.adding):not(:disabled):not([style*="cursor: not-allowed"]) {
          background: #6D28D9;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
        }

        .add-cart-btn.adding {
          background: #10B981;
        }

        .add-cart-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-required-btn {
          background: white;
          color: #7C3AED;
          border: 1px solid #E5E7EB;
        }

        .login-required-btn:hover {
          background: #F9FAFB;
          border-color: #7C3AED;
        }

        .btn-icon {
          stroke: currentColor;
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

        /* 🔥🔥🔥 RESPONSIVIDADE - TÍTULOS GRANDES EM TODAS AS TELAS 🔥🔥🔥 */
        @media (max-width: 768px) {
          .product-card {
            border-radius: 14px;
          }
            #nutricao-pet {
            padding-top: 70px;
            }
          
          .image-container {
            height: 180px;
          }
          
          .product-info {
            padding: 16px;
            gap: 14px;
          }
          
          .product-name {
            font-size: 22px !important;
            font-weight: 700 !important;
            line-height: 1.3 !important;
          }
          
          .currency {
            font-size: 16px;
          }
          
          .amount {
            font-size: 24px;
          }
          
          .credits-text {
            font-size: 12px;
          }
          
          .action-btn {
            padding: 12px;
            font-size: 13px;
            border-radius: 6px;
          }
          
          .wishlist-btn {
            width: 32px;
            height: 32px;
            top: 10px;
            right: 10px;
          }
          
          .hint-btn {
            top: 50px;
            right: 10px;
            width: 28px;
            height: 28px;
          }
          
          .size-option {
            padding: 6px;
            font-size: 12px;
            min-height: 30px;
          }
        }

        @media (max-width: 480px) {
          .image-container {
            height: 160px;
          }
          
          .product-info {
            padding: 14px;
            gap: 12px;
          }
            #nutricao-pet {
            padding-top: 70px;
            }
          
          .product-name {
            font-size: 20px !important;
            font-weight: 700 !important;
            line-height: 1.3 !important;
          }
          
          .currency {
            font-size: 15px;
          }
          
          .amount {
            font-size: 22px;
          }
          
          .action-btn {
            padding: 11px;
            font-size: 13px;
          }
          
          .credits-hint {
            gap: 4px;
          }
          
          .coin-icon {
            width: 10px;
            height: 10px;
          }
          
          .credits-text {
            font-size: 11px;
          }
        }

        @media (max-width: 375px) {
          .image-container {
            height: 150px;
          }
          
          .product-name {
            font-size: 16px !important;
            font-weight: 700 !important;
            line-height: 1.3 !important;
          }
          
          .amount {
            font-size: 20px;
          }
          
          .currency {
            font-size: 14px;
          }
          
          .action-btn {
            font-size: 12px;
          }
          
          .size-option {
            min-height: 28px;
            font-size: 11px;
            padding: 5px;
          }
          
          .credits-text {
            font-size: 10px;
          }
        }

        @media (max-width: 320px) {
          .product-name {
            font-size: 15px !important;
            font-weight: 700 !important;
            line-height: 1.3 !important;
          }
          
          .amount {
            font-size: 19px;
          }
          
          .currency {
            font-size: 13px;
          }
          
          .product-info {
            padding: 12px;
            gap: 10px;
          }
          
          .action-btn {
            font-size: 11px;
          }
        }

        @media (max-width: 280px) {
          .product-name {
            font-size: 14px !important;
            line-height: 1.2 !important;
          }
        }
      `}</style>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;