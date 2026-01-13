// src/components/ServicesGrid.tsx - LEGENDA CORRIGIDA
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
           <span className="accent">Cuidado</span> Especializado para Seu Pet
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
                <div className="icon-container">
                  <div className="icon-bg">
                    <i className={service.icon}></i>
                  </div>
                </div>
                
                <div className="card-body">
                  <h3 className="service-title">{service.title}</h3>
                  
                  <div className="features-list">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="feature">
                        <div className="checkmark">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
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
          background: linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%);
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

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 30px;
        }

        .service-card {
          background: white;
          border-radius: 20px;
          padding: 32px;
          position: relative;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          border: 1px solid #F0F0F0;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
          overflow: hidden;
          opacity: 0;
          animation: fadeInUp 0.6s ease-out forwards;
          animation-delay: calc(var(--index) * 0.1s);
        }

        .service-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 40px rgba(124, 58, 237, 0.12);
          border-color: #E8E0FF;
        }

        .card-content {
          position: relative;
          z-index: 2;
        }

        .icon-container {
          margin-bottom: 28px;
          display: flex;
          justify-content: center;
        }

        .icon-bg {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #F8F5FF 0%, #F0EBFF 100%);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #EDE9FE;
        }

        .icon-bg i {
          font-size: 32px;
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
          color: #1A1A1A;
          margin: 0 0 24px 0;
          line-height: 1.3;
        }

        .features-list {
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .feature {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          text-align: left;
        }

        .checkmark {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          background: rgba(124, 58, 237, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7C3AED;
          margin-top: 2px;
        }

        .feature-text {
          font-size: 15px;
          color: #666;
          line-height: 1.5;
          flex: 1;
        }

        .card-footer {
          padding-top: 24px;
          border-top: 1px solid #F0F0F0;
        }

        .action-btn {
          width: 100%;
          padding: 16px 24px;
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
          letter-spacing: 0.3px;
        }

        .book-btn {
          background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
          color: white;
        }

        .book-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.25);
          background: linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%);
        }

        .login-btn {
          background: #F9FAFB;
          color: #7C3AED;
          border: 1.5px solid #E8E0FF;
        }

        .login-btn:hover {
          background: #F5F3FF;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.12);
          border-color: #7C3AED;
        }

        .icon {
          stroke: currentColor;
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
            text-align: center;
          }
          
          .section-subtitle {
            text-align: center;
            font-size: 15px;
          }
          
          .services-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 0 auto;
          }
          
          .service-card {
            padding: 28px 24px;
          }
        }

        @media (max-width: 480px) {
          .services-section {
            padding: 48px 0;
          }
          
          .section-title {
            font-size: 28px;
          }
          
          .section-subtitle {
            font-size: 14px;
          }
          
          .service-title {
            font-size: 20px;
          }
          
          .action-btn {
            padding: 14px 20px;
            font-size: 14px;
          }
          
          .icon-bg {
            width: 64px;
            height: 64px;
            border-radius: 16px;
          }
          
          .icon-bg i {
            font-size: 28px;
          }
        }
      `}</style>
    </section>
  );
};

export default ServicesGrid;