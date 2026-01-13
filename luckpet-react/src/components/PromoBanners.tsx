// src/components/PromoBanners.tsx
import React from 'react';

const PromoBanners: React.FC = () => {
  const banners = [
    { 
      icon: 'fas fa-shopping-bag',
      text: 'Descontos de 15% a 25% OFF + Frete Grátis!',
      link: '#nutricao-pet',
      color: '#8B5CF6'
    },
    { 
      icon: 'fas fa-tag',
      text: 'Ganhe 10% na Primeira Compra! Código: BEMVINHO10',
      link: '#moda-pet',
      color: '#3B82F6'
    },
    { 
      icon: 'fas fa-spa',
      text: 'Banho e Tosa com 15% de Desconto! Agende já!',
      link: '#servicos',
      color: '#10B981'
    }
  ];

  return (
    <section className="promo-section">
      <div className="container">
        <div className="promo-banners-grid">
          {banners.map((banner, index) => (
            <div 
              key={index} 
              className="promo-banner"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div 
                className="banner-icon" 
                style={{ 
                  background: `${banner.color}15`,
                  color: banner.color,
                  border: `1px solid ${banner.color}30`
                }}
              >
                <i className={banner.icon}></i>
              </div>
              <div className="banner-content">
                <p>{banner.text}</p>
                <a href={banner.link} className="banner-link">
                  Saiba mais <i className="fas fa-arrow-right"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style >{`
        .promo-section {
          padding: 1.5rem 0;
          background: #FFFFFF;
          border-bottom: 1px solid #F3F4F6;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .promo-banners-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .promo-banner {
          background: #FFFFFF;
          border-radius: 0.75rem;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #d8d8d8;
          transition: all 0.2s ease;
          opacity: 0;
          animation: fadeIn 0.3s ease forwards;
        }

        .promo-banner:hover {
          border-color: #E5E7EB;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transform: translateY(-2px);
        }

        .banner-icon {
          width: 44px;
          height: 44px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.125rem;
          flex-shrink: 0;
        }

        .banner-content {
          flex: 1;
        }

        .banner-content p {
          margin: 0 0 0.5rem 0;
          color: #1F2937;
          font-weight: 500;
          font-size: 0.9375rem;
          line-height: 1.4;
        }

        .banner-link {
          color: #6B7280;
          text-decoration: none;
          font-size: 0.8125rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          transition: all 0.2s ease;
        }

        .banner-link:hover {
          color: #4B5563;
        }

        .banner-link i {
          font-size: 0.75rem;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Responsividade limpa */
        @media (max-width: 1024px) {
          .promo-banners-grid {
            gap: 0.875rem;
          }
          
          .promo-banner {
            padding: 1rem;
          }
        }

        @media (max-width: 768px) {
          .promo-section {
            padding: 1.25rem 0;
          }
          
          .promo-banners-grid {
            grid-template-columns: 1fr;
            max-width: 500px;
            margin: 0 auto;
          }
          
          .promo-banner {
            padding: 1rem;
          }
          
          .banner-content p {
            font-size: 0.875rem;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 0.75rem;
          }
          
          .promo-section {
            padding: 1rem 0;
          }
          
          .banner-icon {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }
        }

        /* Sem animações se preferir reduzir movimento */
        @media (prefers-reduced-motion: reduce) {
          .promo-banner {
            animation: none;
            opacity: 1;
          }
          
          .promo-banner:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
};

export default PromoBanners;