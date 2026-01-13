// src/components/WishlistModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { products } from '../data/products';
import { getWishlist, toggleWishlist, addToCart } from '../utils/storage';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const WishlistModal: React.FC<WishlistModalProps> = ({ isOpen, onClose, onUpdate }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);

  // Atualizar wishlist quando modal abrir
  useEffect(() => {
    if (isOpen) {
      setWishlist(getWishlist());
    }
  }, [isOpen]);

  const handleToggleWishlist = useCallback(async (productId: string) => {
    setIsRemoving(productId);
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulação de delay
    toggleWishlist(productId);
    const updatedWishlist = getWishlist();
    setWishlist(updatedWishlist);
    onUpdate();
    setIsRemoving(null);
  }, [onUpdate]);

  const handleAddToCart = useCallback(async (productId: string) => {
    setIsAddingToCart(productId);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulação de delay
    addToCart(productId);
    onUpdate();
    setIsAddingToCart(null);
    
    // Notificação visual (pode ser substituída pelo seu sistema de notificações)
    const event = new CustomEvent('notification', {
      detail: { message: 'Produto adicionado ao carrinho!', type: 'success' }
    });
    window.dispatchEvent(event);
  }, [onUpdate]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="modal-overlay" onClick={handleClose} />
      
      {/* Modal Content */}
      <div className="wishlist-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-title">
              <i className="fas fa-heart"></i>
              <h2>Meus Favoritos</h2>
              {wishlist.length > 0 && (
                <span className="wishlist-count">{wishlist.length}</span>
              )}
            </div>
            <button className="modal-close" onClick={handleClose} aria-label="Fechar">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {wishlist.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>Sua lista de favoritos está vazia</h3>
              <p>Adicione produtos que você gosta para encontrá-los facilmente depois</p>
              <button className="btn-explore" onClick={handleClose}>
                <i className="fas fa-shopping-bag"></i>
                Explorar Produtos
              </button>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlist.map(productId => {
                const product = products[productId];
                if (!product) return null;

                const isRemovingThis = isRemoving === productId;
                const isAddingThisToCart = isAddingToCart === productId;

                return (
                  <div key={productId} className="wishlist-card">
                    {/* Product Image */}
                    <div className="card-image">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        loading="lazy"
                      />
                      <button 
                        className={`wishlist-btn ${isRemovingThis ? 'removing' : ''}`}
                        onClick={() => handleToggleWishlist(productId)}
                        disabled={isRemovingThis || isAddingThisToCart}
                        aria-label="Remover dos favoritos"
                      >
                        {isRemovingThis ? (
                          <div className="spinner"></div>
                        ) : (
                          <i className="fas fa-heart"></i>
                        )}
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="card-info">
                      <h3 className="product-title">{product.name}</h3>
                      <div className="product-category">
                        <span className="category-tag">
                          {product.type === 'vestimenta' ? 'Roupas' : 'Alimentos'}
                        </span>
                      </div>
                      <div className="product-price">
                        <span className="price-currency">R$</span>
                        <span className="price-value">{product.price.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="card-actions">
                      <button 
                        className={`btn-add-cart ${isAddingThisToCart ? 'adding' : ''}`}
                        onClick={() => handleAddToCart(productId)}
                        disabled={isRemovingThis || isAddingThisToCart}
                      >
                        {isAddingThisToCart ? (
                          <>
                            <div className="spinner"></div>
                            Adicionando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-shopping-cart"></i>
                            Adicionar ao Carrinho
                          </>
                        )}
                      </button>
                      <button 
                        className="btn-view"
                        onClick={() => {
                          // Aqui você pode adicionar navegação para a página do produto
                          handleClose();
                        }}
                        disabled={isRemovingThis || isAddingThisToCart}
                      >
                        <i className="fas fa-eye"></i>
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="modal-footer">
            <div className="footer-content">
              <div className="footer-info">
                <p><strong>{wishlist.length}</strong> {wishlist.length === 1 ? 'item' : 'itens'} nos favoritos</p>
                <p className="footer-note">
                  <i className="fas fa-info-circle"></i>
                  Seus itens favoritos ficam salvos mesmo depois de fechar o site
                </p>
              </div>
              <button className="btn-clear-all" onClick={() => {
                // Limpar todos os favoritos
                wishlist.forEach(productId => toggleWishlist(productId));
                setWishlist([]);
                onUpdate();
              }}>
                <i className="fas fa-trash-alt"></i>
                Limpar Todos
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        /* Modal Container */
        .wishlist-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          z-index: 1001;
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Header */
        .modal-header {
          padding: 24px 32px;
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-title h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }

        .header-title i {
          font-size: 24px;
        }

        .wishlist-count {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 14px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          border: 2px solid white;
        }

        .modal-close {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }

        /* Body */
        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
          background: #f8fafc;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          max-width: 400px;
          margin: 0 auto;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: #8B5CF6;
          font-size: 32px;
        }

        .empty-state h3 {
          font-size: 24px;
          color: #1f2937;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .empty-state p {
          color: #6b7280;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .btn-explore {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s;
        }

        .btn-explore:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
        }

        /* Wishlist Grid */
        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        /* Wishlist Card */
        .wishlist-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .wishlist-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .card-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .wishlist-card:hover .card-image img {
          transform: scale(1.05);
        }

        .wishlist-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 40px;
          height: 40px;
          background: white;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .wishlist-btn:hover:not(:disabled) {
          background: #ef4444;
          color: white;
          transform: scale(1.1);
        }

        .wishlist-btn.removing {
          background: #ef4444;
          color: white;
        }

        .wishlist-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Card Info */
        .card-info {
          padding: 20px;
          flex: 1;
        }

        .product-title {
          font-size: 16px;
          color: #1f2937;
          margin: 0 0 8px 0;
          font-weight: 600;
          line-height: 1.4;
        }

        .product-category {
          margin-bottom: 12px;
        }

        .category-tag {
          display: inline-block;
          background: rgba(139, 92, 246, 0.1);
          color: #8B5CF6;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
        }

        .product-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .price-currency {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .price-value {
          font-size: 20px;
          color: #1f2937;
          font-weight: 700;
        }

        /* Card Actions */
        .card-actions {
          padding: 0 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-add-cart {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-add-cart:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(139, 92, 246, 0.3);
        }

        .btn-add-cart.adding {
          opacity: 0.8;
        }

        .btn-add-cart:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-view {
          background: #f3f4f6;
          color: #4b5563;
          border: 2px solid #e5e7eb;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-view:hover:not(:disabled) {
          background: #e5e7eb;
          border-color: #d1d5db;
          transform: translateY(-1px);
        }

        .btn-view:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Footer */
        .modal-footer {
          padding: 20px 32px;
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-info p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .footer-info strong {
          color: #8B5CF6;
        }

        .footer-note {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
          font-size: 12px;
          opacity: 0.8;
        }

        .footer-note i {
          font-size: 14px;
          color: #8B5CF6;
        }

        .btn-clear-all {
          background: none;
          color: #ef4444;
          border: 2px solid #ef4444;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-clear-all:hover {
          background: #ef4444;
          color: white;
          transform: translateY(-1px);
        }

        /* Spinner */
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .wishlist-modal {
            width: 95%;
            max-height: 95vh;
            border-radius: 16px;
          }

          .modal-header {
            padding: 20px;
          }

          .modal-body {
            padding: 20px;
          }

          .modal-footer {
            padding: 16px 20px;
          }

          .wishlist-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .header-title h2 {
            font-size: 20px;
          }

          .footer-content {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .footer-info {
            text-align: center;
          }

          .btn-clear-all {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .empty-state {
            padding: 40px 20px;
          }

          .empty-state h3 {
            font-size: 20px;
          }

          .btn-explore {
            width: 100%;
            justify-content: center;
          }

          .card-actions {
            flex-direction: column;
          }
        }

        /* Scrollbar styling */
        .modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .modal-body::-webkit-scrollbar-thumb {
          background: #8B5CF6;
          border-radius: 3px;
        }

        .modal-body::-webkit-scrollbar-thumb:hover {
          background: #7C3AED;
        }
      `}</style>
    </>
  );
};

export default WishlistModal;