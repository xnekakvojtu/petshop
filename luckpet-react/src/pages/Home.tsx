// src/pages/Home.tsx - VERSÃO OTIMIZADA
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { products, services, plans } from '../data/products';
import { addToCart, toggleWishlist, getWishlist } from '../utils/storage';
import './Home.css';

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

  // ⭐ Produtos memoizados com useMemo
  const clothingProducts = useMemo(() => 
    Object.values(products).filter(p => p.type === 'vestimenta'),
    []
  );

  const foodProducts = useMemo(() =>
    Object.values(products).filter(p => p.type === 'alimento'),
    []
  );

  // ⭐ Efeito de carregamento - otimizado
  useEffect(() => {
    // Carregar wishlist
    const wishlistData = getWishlist();
    setWishlist(wishlistData);
    
    // Verificar usuário novo
    const savedUser = localStorage.getItem('user');
    if (localStorage.getItem('isNewUser') === 'true' && savedUser) {
      setShowWelcome(true);
    }
    
    // Carregar créditos
    const savedCredits = localStorage.getItem('userCredits');
    if (savedCredits) {
      setUserCredits(parseInt(savedCredits) || 0);
    }
  }, []); // ⭐ Sem dependências desnecessárias

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
    
    // ⭐ REMOVIDO window.dispatchEvent(new Event('storage'));
    // Isso causava re-render desnecessário
  }, [showNotification]); // ⭐ products removido das dependências

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
    
    // ⭐ REMOVIDO window.dispatchEvent(new Event('storage'));
  }, [showNotification]); // ⭐ products removido das dependências

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
    </div>
  );
};

export default Home;