// src/components/ProductCard.tsx - VERSÃO COM AJUSTES
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
  const { isLoggedIn } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('M');

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
      {/* Container da imagem */}
      <div className="image-container">
        <div className="image-wrapper">
          <img 
            src={product.image} 
            alt={product.name}
            loading={index > 2 ? "lazy" : "eager"}
          />
        </div>
        
        {/* Botão favorito */}
        <button 
          className={`wishlist-btn ${isInWishlist ? 'active' : ''} ${!isLoggedIn ? 'disabled' : ''}`}
          onClick={handleToggleWishlist}
          aria-label={isInWishlist ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          disabled={!isLoggedIn}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        
        {/* Indicador de login */}
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
      
      {/* Informações do produto */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        {/* Tamanhos (apenas para roupas) - REDUZIDO */}
        {isClothing && (
          <div className="size-selector">
            <div className="sizes">
              {['P', 'M', 'G'].map(size => (
                <button
                  key={size}
                  className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => handleSizeSelect(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Preço - AUMENTADO */}
        <div className="price-section">
          <div className="price">
            <span className="currency">R$</span>
            <span className="amount">{product.price.toFixed(2)}</span>
          </div>
          <div className="credits-info">
            <svg className="coin-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2" strokeLinecap="round"/>
            </svg>
            <span className="credits-text">{Math.floor(product.price)} LuckCoins</span>
          </div>
        </div>
        
        {/* Botão de ação */}
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
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
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
          box-shadow: 0 12px 32px rgba(124, 58, 237, 0.12);
          border-color: #E8E0FF;
        }

        /* Container da imagem */
        .image-container {
          position: relative;
          height: 200px;
          background: #F9FAFB;
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

        /* Botão favorito */
        .wishlist-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          border: 1px solid #EDE9FE;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #A5A5A5;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .wishlist-btn:hover:not(.disabled) {
          color: #EF4444;
          border-color: #FECACA;
          background: white;
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

        /* Hint de login */
        .login-hint {
          position: absolute;
          top: 56px;
          right: 12px;
        }

        .hint-btn {
          width: 32px;
          height: 32px;
          background: rgba(124, 58, 237, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(10px);
        }

        .product-card:hover .hint-btn {
          opacity: 1;
          transform: translateY(0);
        }

        .hint-btn:hover {
          background: rgba(109, 40, 217, 0.9);
          transform: translateY(0) scale(1.1);
        }

        /* Informações do produto */
        .product-info {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-name {
          font-size: 16px;
          font-weight: 600;
          color: #1A1A1A;
          margin: 0 0 12px 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        /* Seletor de tamanhos - REDUZIDO */
        .size-selector {
          margin-bottom: 16px;
        }

        .sizes {
          display: flex;
          gap: 8px;
        }

        .size-option {
          flex: 1;
          padding: 6px 4px;
          border: 1px solid #E5E7EB;
          background: white;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          min-height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .size-option:hover {
          border-color: #7C3AED;
          color: #7C3AED;
        }

        .size-option.selected {
          background: #7C3AED;
          border-color: #7C3AED;
          color: white;
        }

        /* Preço - AUMENTADO */
        .price-section {
          margin-bottom: 16px;
        }

        .price {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 6px;
        }

        .currency {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .amount {
          font-size: 24px;
          font-weight: 700;
          color: #1A1A1A;
          line-height: 1;
        }

        .credits-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .coin-icon {
          color: #F59E0B;
          flex-shrink: 0;
        }

        .credits-text {
          font-size: 13px;
          color: #F59E0B;
          font-weight: 600;
        }

        /* Botões de ação */
        .action-btn {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          margin-top: auto;
        }

        /* Botão adicionar (logado) */
        .add-cart-btn {
          background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
          color: white;
        }

        .add-cart-btn:hover:not(.adding):not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.25);
          background: linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%);
        }

        .add-cart-btn.adding {
          background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
        }

        .add-cart-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Botão login required (não logado) */
        .login-required-btn {
          background: #F9FAFB;
          color: #7C3AED;
          border: 1.5px solid #E8E0FF;
        }

        .login-required-btn:hover {
          background: #F5F3FF;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.12);
          border-color: #7C3AED;
        }

        .btn-icon {
          stroke: currentColor;
        }

        /* Animações */
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

        /* Responsividade */
        @media (max-width: 768px) {
          .image-container {
            height: 180px;
          }
          
          .product-info {
            padding: 16px;
          }
          
          .product-name {
            font-size: 15px;
            margin-bottom: 10px;
          }
          
          .amount {
            font-size: 22px;
          }
          
          .action-btn {
            padding: 12px;
            font-size: 13px;
          }
          
          .size-option {
            padding: 5px 3px;
            font-size: 12px;
            min-height: 28px;
          }
        }

        @media (max-width: 480px) {
          .image-container {
            height: 160px;
          }
          
          .product-name {
            font-size: 14px;
          }
          
          .amount {
            font-size: 20px;
          }
          
          .wishlist-btn {
            width: 32px;
            height: 32px;
          }
          
          .hint-btn {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;