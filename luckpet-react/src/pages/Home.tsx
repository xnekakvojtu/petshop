// src/pages/Home.tsx - VERSÃO COM MODO LEVE PARA TESTE
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
  // ⭐ FLAG PARA MODO LEVE - ALTERE AQUI PARA TESTAR
  const LIGHT_MODE = true; // true = modo leve, false = completo

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userCredits, setUserCredits] = useState(0);

  const clothingProducts = useMemo(() => 
    Object.values(products).filter(p => p.type === 'vestimenta'),
    []
  );

  const foodProducts = useMemo(() =>
    Object.values(products).filter(p => p.type === 'alimento'),
    []
  );

  useEffect(() => {
    const wishlistData = getWishlist();
    setWishlist(wishlistData);
    
    const savedUser = localStorage.getItem('user');
    if (localStorage.getItem('isNewUser') === 'true' && savedUser) {
      setShowWelcome(true);
    }
    
    const savedCredits = localStorage.getItem('userCredits');
    if (savedCredits) {
      setUserCredits(parseInt(savedCredits) || 0);
    }
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
  }, [showNotification]);

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
  }, [showNotification]);

  return (
    <div className="home-page">
      {/* Notificação - sempre visível */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Welcome Section - sempre visível quando necessário */}
      {showWelcome && <WelcomeSection onClose={closeWelcome} />}

      {/* ⭐ Background com patas - desligado no modo leve */}
      {!LIGHT_MODE && (
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
      )}

      {/* Banners promocionais - sempre visíveis */}
      <PromoBanners />

      {/* ⭐ Carrossel - desligado no modo leve */}
      {!LIGHT_MODE && <Carousel />}

      {/* Categorias - sempre visíveis */}
      <CategoriesGrid />

      {/* Seção de Moda Pet - limitada a 4 produtos no modo leve */}
      <section className="products-section paw-section" id="moda-pet">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Estilo Premium <span>Para Seu Pet</span></h2>
            {!LIGHT_MODE && (
              <a href="#todos" className="section-link">
                Ver todos <i className="fas fa-arrow-right"></i>
              </a>
            )}
          </div>
          
          <div className="products-grid">
            {clothingProducts.slice(0, LIGHT_MODE ? 4 : clothingProducts.length).map((product, index) => (
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

      {/* Seção de Nutrição Pet - limitada a 4 produtos no modo leve */}
      <section className="products-section alt paw-section" id="nutricao-pet">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Nutrição Balanceada <span>Para Uma Vida Saudável</span></h2>
            {!LIGHT_MODE && (
              <a href="#todos-alimentos" className="section-link">
                Ver todos <i className="fas fa-arrow-right"></i>
              </a>
            )}
          </div>
          
          <div className="products-grid">
            {foodProducts.slice(0, LIGHT_MODE ? 4 : foodProducts.length).map((product, index) => (
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

      {/* ⭐ Componentes pesados - desligados no modo leve */}
      {!LIGHT_MODE && <ServicesGrid services={services} onServiceClick={onServiceClick} />}
      {!LIGHT_MODE && <CuriosityGrid />}
      {!LIGHT_MODE && <PlansGrid plans={plans} userCredits={userCredits} />}
    </div>
  );
};

export default Home;