// src/components/ProductCard.tsx - VERSÃO OTIMIZADA
import React, { memo, useCallback, useState } from 'react';
import { Product } from '../types/index';
import { useAuth } from '../hooks/useAuth';
import OptimizedImage from './OptimizedImage'; // ⭐ IMPORT ADICIONADO
import './ProductCard.css';

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

  // ⭐ Classes condicionais em vez de style inline
  const wishlistButtonClass = `wishlist-btn 
    ${isInWishlist ? 'active' : ''} 
    ${!isLoggedIn ? 'disabled' : ''} 
    ${isAdmin ? 'admin-disabled' : ''}`;

  const sizeOptionClass = (size: string) => 
    `size-option ${selectedSize === size ? 'selected' : ''} ${isAdmin ? 'admin-disabled' : ''}`;

  return (
    <div className="product-card" style={{ '--index': index } as React.CSSProperties}>
      <div className="image-container">
        <div className="image-wrapper">
          {/* ⭐ TROCADO <img> POR OptimizedImage */}
          <OptimizedImage
            src={product.image}
            alt={product.name}
            className="product-image"
            lazy={index > 2}
            width={400}
            height={300}
          />
        </div>
        
        <button 
          className={wishlistButtonClass}
          onClick={handleToggleWishlist}
          aria-label={isInWishlist ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          disabled={!isLoggedIn || isAdmin}
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
                  className={sizeOptionClass(size)}
                  onClick={() => handleSizeSelect(size)}
                  disabled={isAdmin}
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
            className="action-btn add-cart-btn admin-disabled"
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
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;