// src/pages/Home.tsx (REMOVER o loading state e seu JSX)
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
  // REMOVER: const [isLoading, setIsLoading] = useState(true); // ← REMOVER ESTA LINHA

  // Produtos memoizados
  const clothingProducts = useMemo(() => 
    Object.values(products).filter(p => p.type === 'vestimenta'),
    [products]
  );

  const foodProducts = useMemo(() =>
    Object.values(products).filter(p => p.type === 'alimento'),
    [products]
  );

  // Efeito de carregamento SIMPLIFICADO (sem loading state)
  useEffect(() => {
    // Carregar dados iniciais
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

    // Pré-carregar imagens críticas APENAS (opcional)
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

  // REMOVER TODO O BLOCO DE LOADING ABAIXO:
  /*
  if (isLoading) {
    return (
      <div className="loading-screen">
        ...código de loading...
      </div>
    );
  }
  */

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

      {/* Banners promocionais */}
      <PromoBanners />

      {/* Carrossel */}
      <Carousel />

      {/* Categorias */}
      <CategoriesGrid />

      {/* Seção de Moda Pet */}
      <section className="products-section" id="moda-pet">
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
      <section className="products-section alt" id="nutricao-pet">
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
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
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
  font-size: 42px !important; /* 42px! GRANDE PRA CARALHO! */
  color: #1f2937;
  margin: 0;
  font-weight: 800 !important; /* NEGRÃO! */
  line-height: 1.2;
}

.section-title span {
  color: #8b5cf6;
  display: block;
  font-weight: 700 !important;
  font-size: 36px !important; /* Também grande! */
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
  font-size: 18px; /* Aumentado também */
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

/* Otimização para reduzir movimento */
@media (prefers-reduced-motion: reduce) {
  .product-card {
    animation: none !important;
    transition: none !important;
  }
  
  .section-link:hover {
    gap: 8px;
  }
}

@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  /* 🔥 TABLET GRANDE - TÍTULO AINDA GRANDE! */
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
  
  /* 🔥 TABLET - TÍTULO AINDA BEM GRANDE! */
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

  /* 🔥 MOBILE - TÍTULO GRANDE TAMBÉM! */
  .section-title {
    font-size: 32px !important; /* 32px no mobile! GRANDE! */
  }

  .section-title span {
    font-size: 28px !important; /* 28px! */
  }

  .section-link {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }
  
  /* 🔥 MOBILE PEQUENO - AINDA GRANDE! */
  .section-title {
    font-size: 28px !important; /* 28px! Ninguém reclama! */
  }
  
  .section-title span {
    font-size: 24px !important; /* 24px! */
  }
  
  .section-link {
    font-size: 14px;
  }
}

/* NOVO: CENTRALIZA TÍTULOS EM MOBILE/TABLET */
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

/* 📱 iPhone SE - AINDA LEGÍVEL! */
@media (max-width: 375px) {
  .section-title {
    font-size: 26px !important; /* 26px! */
  }
  
  .section-title span {
    font-size: 22px !important; /* 22px! */
  }
}

/* 📱 MUITO PEQUENO - ÚLTIMO RECURSO */
@media (max-width: 320px) {
  .section-title {
    font-size: 24px !important; /* 24px mínimo! */
  }
  
  .section-title span {
    font-size: 20px !important; /* 20px! */
  }
}

/* 🔥 PARA OS OUTROS TÍTULOS DA HOME (como "Estilo Premium" etc) 🔥 */
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

/* 🔥🔥🔥 SECTION-SUBTITLE - TAMBÉM GRANDE PRA CARALHO! 🔥🔥🔥 */
.section-subtitle {
  font-size: 20px !important; /* 24px no desktop! GRANDE! */
  color: #6b7280;
  font-weight: 500;
  margin-top: 12px;
  line-height: 1.5;
  max-width: 800px;
}

/* Responsividade do section-subtitle */
@media (max-width: 992px) {
  .section-subtitle {
    font-size: 22px !important; /* 22px no tablet! */
    text-align: center !important;
    margin-left: auto;
    margin-right: auto;
  }
}

@media (max-width: 768px) {
  .section-subtitle {
    font-size: 20px !important; /* 20px no mobile! */
    padding: 0 16px;
  }
}

@media (max-width: 480px) {
  .section-subtitle {
    font-size: 18px !important; /* 18px no mobile pequeno! */
    padding: 0 12px;
  }
}

@media (max-width: 375px) {
  .section-subtitle {
    font-size: 16px !important; /* 16px mínimo aceitável! */
  }
}

/* Se for um subtítulo dentro do section-title */
.section-title + .section-subtitle {
  margin-top: 8px;
}

/* Se for um subtítulo dentro do hero/carousel */
.hero-subtitle {
  font-size: 28px !important; /* Para o carousel também */
}

@media (max-width: 768px) {
  .hero-subtitle {
    font-size: 24px !important;
  }
}

@media (max-width: 480px) {
  .hero-subtitle {
    font-size: 20px !important;
  }
}
      `}</style>
    </div>
  );
};

export default Home;