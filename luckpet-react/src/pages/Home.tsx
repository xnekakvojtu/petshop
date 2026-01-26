// src/pages/Home.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { products, services, plans } from '../data/products';
import { addToCart, toggleWishlist, getWishlist } from '../utils/storage';

// Importar componentes
import WelcomeSection from '../components/WelcomeSection';
import PromoBanners from '../components/PromoBanners';
import Carousel from '../components/Carousel';
import CategoriesGrid from '../components/CategoriesGrid';
import ProductCard from '../components/ProductCard';
import ServicesGrid from '../components/ServicesGrid';
import CuriosityGrid from '../components/CuriosityGrid';
import PlansGrid from '../components/PlansGrid';
import Notification from '../components/Notification';

interface HomeProps {
  onServiceClick: (serviceType: string) => void;
}

const Home: React.FC<HomeProps> = ({ onServiceClick }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userCredits, setUserCredits] = useState(0);

  // Produtos memoizados
  const clothingProducts = useMemo(() => 
    Object.values(products).filter(p => p.type === 'vestimenta'),
    [products]
  );

  const foodProducts = useMemo(() =>
    Object.values(products).filter(p => p.type === 'alimento'),
    [products]
  );

  // Efeito de carregamento
  useEffect(() => {
    const wishlistData = getWishlist();
    setWishlist(wishlistData);
    
    const savedUser = localStorage.getItem('user');
    const savedCredits = localStorage.getItem('userCredits');
    
    if (localStorage.getItem('isNewUser') === 'true' && savedUser) {
      setShowWelcome(true);
    }
    
    if (savedCredits) {
      setUserCredits(parseInt(savedCredits) || 0);
    }

    // Pré-carregar imagens
    const criticalImages = [
      '/img/anuncios/racao-anuncio.jpg',
      '/img/anuncios/acessorio-anuncio.jpg'
    ];
    
    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const closeWelcome = useCallback(() => {
    setShowWelcome(false);
    localStorage.removeItem('isNewUser');
  }, []);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleAddToCart = useCallback((productId: string) => {
    const product = products[productId];
    if (!product) return;

    addToCart(productId);
    showNotification(`${product.name} adicionado ao carrinho!`);
    
    window.dispatchEvent(new Event('storage'));
  }, [products, showNotification]);

  const handleToggleWishlist = useCallback((productId: string) => {
    const product = products[productId];
    if (!product) return;

    const newWishlist = toggleWishlist(productId);
    setWishlist(newWishlist);
    
    if (newWishlist.includes(productId)) {
      showNotification(`${product.name} adicionado aos favoritos!`);
    } else {
      showNotification(`${product.name} removido dos favoritos!`, 'error');
    }
    
    window.dispatchEvent(new Event('storage'));
  }, [products, showNotification]);

  return (
    <div className="home-page">
      {/* Notificação */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Welcome Section */}
      {showWelcome && <WelcomeSection onClose={closeWelcome} />}

      {/* Background com patas */}
      <div className="paw-background">
        <div className="paw paw-1">🐾</div>
        <div className="paw paw-2">🐾</div>
        <div className="paw paw-3">🐾</div>
        <div className="paw paw-4">🐾</div>
        <div className="paw paw-5">🐾</div>
        <div className="paw paw-6">🐾</div>
        <div className="paw paw-7">🐾</div>
        <div className="paw paw-8">🐾</div>
      </div>

      {/* Banners promocionais */}
      <PromoBanners />

      {/* Carrossel */}
      <Carousel />

      {/* Categorias */}
      <CategoriesGrid />

      {/* Seção de Moda Pet */}
      <section className="products-section paw-section" id="moda-pet">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Estilo Premium <span>Para Seu Pet</span></h2>
            <a href="#todos" className="section-link">
              Ver todos <i className="fas fa-arrow-right"></i>
            </a>
          </div>
          
          <div className="products-grid">
            {clothingProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                isClothing={true}
                isInWishlist={wishlist.includes(product.id)}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Nutrição Pet */}
      <section className="products-section alt paw-section" id="nutricao-pet">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Nutrição Balanceada <span>Para Uma Vida Saudável</span></h2>
            <a href="#todos-alimentos" className="section-link">
              Ver todos <i className="fas fa-arrow-right"></i>
            </a>
          </div>
          
          <div className="products-grid">
            {foodProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                isClothing={false}
                isInWishlist={wishlist.includes(product.id)}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Serviços */}
      <ServicesGrid services={services} onServiceClick={onServiceClick} />

      {/* Seção de Curiosidades */}
      <CuriosityGrid />

      {/* Seção de Planos de Saúde */}
      <PlansGrid plans={plans} userCredits={userCredits} />

      <style >{`
        .home-page {
          min-height: 100vh;
          background: #f9fafb;
          position: relative;
          overflow-x: hidden;
        }

        /* Background com patas */
        .paw-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          opacity: 0.15;
        }

        .paw {
          position: absolute;
          font-size: 48px;
          opacity: 0.4;
          user-select: none;
        }

        /* Posicionamento das patas */
        .paw-1 { top: 10%; left: 5%; transform: rotate(15deg); }
        .paw-2 { top: 25%; right: 8%; transform: rotate(-10deg); }
        .paw-3 { top: 40%; left: 12%; transform: rotate(25deg); }
        .paw-4 { top: 55%; right: 15%; transform: rotate(-15deg); }
        .paw-5 { bottom: 20%; left: 8%; transform: rotate(10deg); }
        .paw-6 { bottom: 35%; right: 10%; transform: rotate(-25deg); }
        .paw-7 { top: 70%; left: 20%; transform: rotate(20deg); }
        .paw-8 { bottom: 10%; right: 20%; transform: rotate(-30deg); }

        /* Animação sutil das patas */
        @keyframes floatPaw {
          0%, 100% { transform: translateY(0) rotate(var(--rotation)); }
          50% { transform: translateY(-10px) rotate(var(--rotation)); }
        }

        .paw {
          animation: floatPaw 8s ease-in-out infinite;
          animation-delay: var(--delay);
        }

        /* Adiciona delay diferente para cada pata */
        .paw-1 { --rotation: 15deg; --delay: 0s; }
        .paw-2 { --rotation: -10deg; --delay: 1s; }
        .paw-3 { --rotation: 25deg; --delay: 2s; }
        .paw-4 { --rotation: -15deg; --delay: 3s; }
        .paw-5 { --rotation: 10deg; --delay: 4s; }
        .paw-6 { --rotation: -25deg; --delay: 5s; }
        .paw-7 { --rotation: 20deg; --delay: 6s; }
        .paw-8 { --rotation: -30deg; --delay: 7s; }

        /* Seções com patas de fundo mais concentradas */
        .paw-section {
          position: relative;
          z-index: 1;
        }

        .paw-section::before {
          content: "🐾🐾🐾";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          font-size: 32px;
          opacity: 0.08;
          pointer-events: none;
          z-index: -1;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 40px;
          padding: 40px;
          text-align: center;
          letter-spacing: 20px;
          line-height: 2;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
          position: relative;
          z-index: 2;
        }

        .products-section {
          padding: 48px 0;
          background: white;
        }

        .products-section.alt {
          background: #f3f4f6;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 16px;
        }

        /* 🔥🔥🔥 TÍTULOS GRANDES PRA CARALHO - DESKTOP 🔥🔥🔥 */
        .section-title {
          font-size: 42px !important;
          color: #1f2937;
          margin: 0;
          font-weight: 800 !important;
          line-height: 1.2;
        }

        .section-title span {
          color: #8b5cf6;
          display: block;
          font-weight: 700 !important;
          font-size: 36px !important;
          margin-top: 4px;
        }

        .section-link {
          color: #8b5cf6;
          text-decoration: none;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          font-size: 18px;
        }

        .section-link:hover {
          color: #7c3aed;
          gap: 12px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        /* Reduzir animação se preferido */
        @media (prefers-reduced-motion: reduce) {
          .paw {
            animation: none !important;
          }
          
          .section-link:hover {
            gap: 8px;
          }
        }

        /* Responsividade */
        @media (max-width: 1200px) {
          .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .section-title {
            font-size: 38px !important;
          }
          
          .section-title span {
            font-size: 32px !important;
          }
        }

        @media (max-width: 992px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .section-title {
            font-size: 36px !important;
          }
          
          .section-title span {
            font-size: 30px !important;
          }
          
          .section-link {
            font-size: 16px;
          }
        }

        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 0 auto;
          }

          .products-section {
            padding: 32px 0;
          }

          /* Diminuir opacidade das patas no mobile */
          .paw {
            font-size: 32px;
            opacity: 0.2;
          }

          .paw-section::before {
            font-size: 24px;
            opacity: 0.05;
            gap: 20px;
            letter-spacing: 15px;
          }

          .section-title {
            font-size: 32px !important;
          }

          .section-title span {
            font-size: 28px !important;
          }

          .section-link {
            font-size: 15px;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 12px;
          }
          
          .section-title {
            font-size: 28px !important;
          }
          
          .section-title span {
            font-size: 24px !important;
          }
          
          .section-link {
            font-size: 14px;
          }

          .paw {
            font-size: 24px;
          }

          .paw-section::before {
            font-size: 18px;
            letter-spacing: 10px;
            gap: 15px;
          }
        }

        /* Centralizar títulos */
        @media (max-width: 992px) {
          .section-header {
            text-align: center !important;
            flex-direction: column;
            align-items: center !important;
            gap: 16px;
          }

          .section-title {
            text-align: center !important;
          }

          .section-title span {
            text-align: center !important;
          }

          .section-link {
            justify-content: center;
            width: 100%;
            margin-top: 8px;
          }
        }

        @media (max-width: 375px) {
          .section-title {
            font-size: 26px !important;
          }
          
          .section-title span {
            font-size: 22px !important;
          }
        }

        @media (max-width: 320px) {
          .section-title {
            font-size: 24px !important;
          }
          
          .section-title span {
            font-size: 20px !important;
          }
        }

        /* Outros estilos mantidos */
        .hero-title {
          font-size: 48px !important;
          font-weight: 900 !important;
        }

        .hero-subtitle {
          font-size: 32px !important;
          font-weight: 700 !important;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 40px !important;
          }
          
          .hero-subtitle {
            font-size: 28px !important;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 36px !important;
          }
          
          .hero-subtitle {
            font-size: 24px !important;
          }
        }

        .section-subtitle {
          font-size: 20px !important;
          color: #6b7280;
          font-weight: 500;
          margin-top: 12px;
          line-height: 1.5;
          max-width: 800px;
        }

        @media (max-width: 992px) {
          .section-subtitle {
            font-size: 22px !important;
            text-align: center !important;
            margin-left: auto;
            margin-right: auto;
          }
        }

        @media (max-width: 768px) {
          .section-subtitle {
            font-size: 20px !important;
            padding: 0 16px;
          }
        }

        @media (max-width: 480px) {
          .section-subtitle {
            font-size: 18px !important;
            padding: 0 12px;
          }
        }

        @media (max-width: 375px) {
          .section-subtitle {
            font-size: 16px !important;
          }
        }

        .section-title + .section-subtitle {
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
};

export default Home;