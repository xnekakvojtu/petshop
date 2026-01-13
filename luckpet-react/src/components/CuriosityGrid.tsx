// src/components/CuriosityGrid.tsx - VERSÃO MODERNA E RESPONSIVA
import React from 'react';

const CuriosityGrid: React.FC = () => {
  const curiosities = [
    { 
      src: '/img/curiosidades/curi-cachorro1.png', 
      alt: 'Cachorro preto', 
      text: 'Cães ouvem sons até 4 vezes mais distantes do que os humanos',
      color: '#7C3AED',
      icon: 'fas fa-ear-deaf'
    },
    { 
      src: '/img/curiosidades/curi-gato.png', 
      alt: 'Gato pulando', 
      text: 'Gatos podem pular até seis vezes a altura do seu corpo',
      color: '#10B981',
      icon: 'fas fa-running'
    },
    { 
      src: '/img/curiosidades/curi-cachorro2.png', 
      alt: 'Cachorro farejando', 
      text: 'Cachorros têm olfato até 10.000 vezes mais forte que o nosso!',
      color: '#F59E0B',
      icon: 'fas fa-wind'
    }
  ];

  return (
    <section className="curiosities-section" id="curiosidades">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <span className="accent">Curiosidades</span> Pet
          </h2>
          <p className="section-subtitle">Fatos fascinantes sobre o mundo animal</p>
        </div>
        
        <div className="curiosities-grid">
          {curiosities.map((fact, index) => (
            <div 
              key={index} 
              className="curiosity-card"
              style={{ 
                '--index': index,
                '--card-color': fact.color
              } as React.CSSProperties}
            >
              <div className="card-image">
                <div className="image-wrapper">
                  <img 
                    src={fact.src} 
                    alt={fact.alt}
                    loading={index > 0 ? "lazy" : "eager"}
                    className="curiosity-img"
                  />
                </div>
                <div className="card-overlay">
                  <div className="icon-container">
                    <i className={fact.icon}></i>
                  </div>
                </div>
              </div>
              
              <div className="card-content">
                <div className="content-inner">
                  <div className="tag">
                    <span>Você sabia?</span>
                  </div>
                  <p className="curiosity-text">{fact.text}</p>
                </div>
              </div>
              
              <div className="card-decoration"></div>
            </div>
          ))}
        </div>
      </div>

      <style >{`
        .curiosities-section {
          padding: 80px 0;
          background: linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* HEADER - CENTRALIZADO EM MOBILE */
        .section-header {
          margin-bottom: 60px;
          text-align: left;
        }

        .section-title {
          font-size: 40px;
          font-weight: 700;
          color: #1A1A1A;
          margin: 0 0 12px 0;
          line-height: 1.2;
        }

        .section-title .accent {
          color: #7C3AED;
          position: relative;
        }

        .section-title .accent::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 0;
          right: 0;
          height: 6px;
          background: rgba(124, 58, 237, 0.15);
          z-index: -1;
          border-radius: 3px;
        }

        .section-subtitle {
          font-size: 16px;
          color: #666;
          margin: 0;
          max-width: 500px;
        }

        .curiosities-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .curiosity-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          border: 1px solid #F0F0F0;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
          opacity: 0;
          animation: fadeInUp 0.6s ease-out forwards;
          animation-delay: calc(var(--index) * 0.1s);
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .curiosity-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 40px rgba(124, 58, 237, 0.12);
          border-color: #E8E0FF;
        }

        .card-image {
          position: relative;
          height: 240px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .image-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .curiosity-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s ease;
        }

        .curiosity-card:hover .curiosity-img {
          transform: scale(1.08);
        }

        .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, 
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.05) 50%,
            rgba(0, 0, 0, 0.1) 100%);
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          padding: 24px;
          pointer-events: none;
        }

        .icon-container {
          width: 56px;
          height: 56px;
          background: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--card-color, #7C3AED);
          font-size: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .curiosity-card:hover .icon-container {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .card-content {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .content-inner {
          flex: 1;
        }

        .tag {
          display: inline-block;
          background: var(--card-color, #7C3AED);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 20px;
        }

        .curiosity-text {
          font-size: 17px;
          color: #1A1A1A;
          line-height: 1.5;
          margin: 0;
          font-weight: 500;
        }

        .card-decoration {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(124, 58, 237, 0.02) 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .curiosity-card:hover .card-decoration {
          opacity: 1;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* RESPONSIVIDADE - CENTRALIZA EM MOBILE */
        @media (max-width: 992px) {
          .curiosities-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .section-header {
            text-align: center;
          }
          
          .section-subtitle {
            margin: 0 auto;
            text-align: center;
          }
        }

        @media (max-width: 768px) {
          .curiosities-section {
            padding: 60px 0;
          }
          
          .section-header {
            text-align: center;
            margin-bottom: 40px;
          }
          
          .section-title {
            font-size: 32px;
            text-align: center;
          }
          
          .section-subtitle {
            font-size: 15px;
            text-align: center;
          }
          
          .curiosities-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 0 auto;
          }
          
          .card-image {
            height: 220px;
          }
          
          .card-content {
            padding: 20px;
          }
          
          .curiosity-text {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .curiosities-section {
            padding: 48px 0;
          }
          
          .section-title {
            font-size: 28px;
          }
          
          .section-subtitle {
            font-size: 14px;
          }
          
          .card-image {
            height: 200px;
          }
          
          .icon-container {
            width: 48px;
            height: 48px;
            font-size: 20px;
            border-radius: 12px;
          }
          
          .tag {
            padding: 5px 12px;
            font-size: 11px;
            margin-bottom: 16px;
          }
          
          .curiosity-text {
            font-size: 15px;
          }
        }
      `}</style>
    </section>
  );
};

export default CuriosityGrid;