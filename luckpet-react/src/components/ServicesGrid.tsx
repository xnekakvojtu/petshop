// src/components/ServicesGrid.tsx - CARDS SIMPLES E BONITOS
import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface Service {
  id: string;
  icon: string;
  title: string;
  features: string[];
}

interface ServicesGridProps {
  services: Service[];
  onServiceClick: (serviceType: string) => void;
}

const ServicesGrid: React.FC<ServicesGridProps> = ({ services, onServiceClick }) => {
  const { isLoggedIn } = useAuth();

  const handleServiceClick = (serviceId: string) => {
    if (!isLoggedIn) {
      window.dispatchEvent(new CustomEvent('showLoginAlert', {
        detail: { 
          message: 'Faça login para agendar serviços para seu pet!'
        }
      }));
      return;
    }
    onServiceClick(serviceId);
  };

  return (
    <section className="services-section" id="servicos">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <span className="accent">Cuidado</span> Profissional
          </h2>
          <p className="section-subtitle">
            Atendimento especializado com amor e qualidade
          </p>
        </div>
        
        <div className="services-grid">
          {services.map((service, index) => (
            <div 
              key={service.id} 
              className="service-card"
              style={{ '--index': index } as React.CSSProperties}
            >
              <div className="card-content">
                {/* ÍCONE CIRCULAR E SIMPLES */}
                <div className="icon-wrapper">
                  <div className="icon-circle">
                    <i className={service.icon}></i>
                  </div>
                </div>
                
                <div className="card-body">
                  <h3 className="service-title">{service.title}</h3>
                  
                  {/* FEATURES COM DESIGN MINIMALISTA */}
                  <div className="features-list">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="feature">
                        <span className="feature-text">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="card-footer">
                    <button 
                      className={`action-btn ${!isLoggedIn ? 'login-btn' : 'book-btn'}`}
                      onClick={() => handleServiceClick(service.id)}
                      aria-label={!isLoggedIn ? 'Faça login para agendar' : `Agendar ${service.title}`}
                    >
                      {!isLoggedIn ? (
                        <>
                          <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M12 15V3M12 15L8 11M12 15L16 11M2 17L2 22H22V17C22 15.8954 21.1046 15 20 15H4C2.89543 15 2 15.8954 2 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Fazer Login
                        </>
                      ) : (
                        <>
                          <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Agendar Agora
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style >{`
        .services-section {
          padding: 80px 0;
          background: #fafafa;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* HEADER - MANTIDO IGUAL */
        .section-header {
          margin-bottom: 60px;
          text-align: left;
        }

        .section-title {
          font-size: 40px;
          font-weight: 700;
          color: #1A1A1A;
          margin: 0 0 8px 0;
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
          display: block;
          font-size: 16px;
          font-weight: 400;
          color: #666;
          letter-spacing: 0.5px;
          margin: 0;
        }

        /* GRID SIMPLES E LIMPO */
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 30px;
        }

        .service-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          border: 1px solid #f0f0f0;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
          opacity: 0;
          animation: fadeInUp 0.5s ease-out forwards;
          animation-delay: calc(var(--index) * 0.1s);
        }

        .service-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(124, 58, 237, 0.1);
          border-color: #e5deff;
        }

        .card-content {
          padding: 32px;
          position: relative;
        }

        /* ÍCONE CIRCULAR MINIMALISTA */
        .icon-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f8f7ff 0%, #f1eeff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ede9fe;
        }

        .icon-circle i {
          font-size: 28px;
          color: #7C3AED;
          background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .card-body {
          text-align: center;
        }

        .service-title {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 24px 0;
          line-height: 1.3;
        }

        /* FEATURES SIMPLES E LIMPAS */
        .features-list {
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feature {
          padding: 0;
          background: none;
          border: none;
          text-align: left;
        }

        .feature-text {
          font-size: 15px;
          color: #666;
          line-height: 1.5;
          position: relative;
          padding-left: 24px;
        }

        .feature-text::before {
          content: "✓";
          position: absolute;
          left: 0;
          top: 0;
          color: #7C3AED;
          font-weight: bold;
          font-size: 14px;
        }

        /* BOTÕES SIMPLES */
        .card-footer {
          padding-top: 24px;
          border-top: 1px solid #f0f0f0;
        }

        .action-btn {
          width: 100%;
          padding: 14px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
          letter-spacing: 0.2px;
        }

        .book-btn {
          background: #7C3AED;
          color: white;
        }

        .book-btn:hover {
          background: #6D28D9;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.25);
        }

        .login-btn {
          background: white;
          color: #7C3AED;
          border: 2px solid #e5deff;
        }

        .login-btn:hover {
          background: #f9f7ff;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.1);
          border-color: #7C3AED;
        }

        .icon {
          stroke: currentColor;
        }

        /* ANIMAÇÃO */
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

        /* RESPONSIVIDADE */
        @media (max-width: 992px) {
          .services-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .section-header {
            text-align: center;
          }
        }

        @media (max-width: 768px) {
          .services-section {
            padding: 60px 0;
          }
          
          .section-header {
            text-align: center;
            margin-bottom: 40px;
          }
          
          .section-title {
            font-size: 32px;
          }
          
          .section-subtitle {
            font-size: 15px;
          }
          
          .services-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 0 auto;
          }
          
          .card-content {
            padding: 28px 24px;
          }
          
          .service-card:hover {
            transform: translateY(-4px);
          }
        }

        @media (max-width: 480px) {
          .services-section {
            padding: 48px 0;
          }
          
          .section-title {
            font-size: 28px;
          }
          
          .service-title {
            font-size: 20px;
          }
          
          .action-btn {
            padding: 12px 20px;
            font-size: 14px;
          }
          
          .icon-circle {
            width: 56px;
            height: 56px;
          }
          
          .icon-circle i {
            font-size: 24px;
          }
        }
      `}</style>
    </section>
  );
};

export default ServicesGrid;