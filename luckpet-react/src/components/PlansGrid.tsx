// src/components/PlansGrid.tsx
import React from 'react';

interface Plan {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  features: string[];
  popular?: boolean;
}

interface PlansGridProps {
  plans: Plan[];
  userCredits?: number;
}

const PlansGrid: React.FC<PlansGridProps> = ({ plans, userCredits = 0 }) => {
  return (
    <section className="plans-section">
      <div className="container">
        <div className="section-header">
          <h2>Saúde para seu Pet</h2>
          <p>Planos completos para o bem-estar do seu companheiro</p>
        </div>
        
        <div className="plans-grid">
          {plans.map((plan, index) => (
            <div 
              key={plan.id} 
              className={`plan-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && (
                <div className="popular-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Mais Popular
                </div>
              )}
              
              <div className="plan-header">
                <h3>{plan.title}</h3>
                <p>{plan.subtitle}</p>
              </div>
              
              <div className="price">
                {plan.price}
                <span>/mês</span>
              </div>
              
              <div className="features">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="feature">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <button className="select-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Escolher Plano
              </button>
              
              {userCredits > 0 && (
                <div className="credits-info">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  Use {userCredits} LuckCoins
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .plans-section {
          padding: 80px 0;
          background: #f8fafc;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* HEADER */
        .section-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .section-header h2 {
          font-size: 32px;
          color: #1f2937;
          margin-bottom: 12px;
          font-weight: 700;
        }

        .section-header p {
          color: #6b7280;
          font-size: 16px;
          max-width: 500px;
          margin: 0 auto;
        }

        /* GRID */
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        /* CARD */
        .plan-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid #e5e7eb;
        }

        .plan-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }

        .plan-card.popular {
          border-color: #8b5cf6;
          background: linear-gradient(135deg, #f8fafc 0%, white 100%);
        }

        /* BADGE */
        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          padding: 6px 20px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .popular-badge svg {
          color: white;
        }

        /* HEADER DO PLANO */
        .plan-header {
          margin-bottom: 24px;
          text-align: center;
        }

        .plan-header h3 {
          font-size: 20px;
          color: #1f2937;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .plan-header p {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }

        /* PREÇO */
        .price {
          text-align: center;
          margin-bottom: 32px;
          color: #1f2937;
        }

        .price {
          font-size: 40px;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 4px;
        }

        .price span {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .plan-card.popular .price {
          color: #8b5cf6;
        }

        /* FEATURES */
        .features {
          margin-bottom: 32px;
        }

        .feature {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .feature svg {
          color: #10b981;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .feature span {
          color: #4b5563;
          font-size: 14px;
          line-height: 1.5;
        }

        .plan-card.popular .feature svg {
          color: #8b5cf6;
        }

        /* BOTÃO */
        .select-btn {
          width: 100%;
          background: #1f2937;
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s ease;
          font-size: 15px;
        }

        .select-btn:hover {
          background: #374151;
          transform: translateY(-2px);
        }

        .plan-card.popular .select-btn {
          background: #8b5cf6;
        }

        .plan-card.popular .select-btn:hover {
          background: #7c3aed;
        }

        /* CRÉDITOS */
        .credits-info {
          margin-top: 20px;
          padding: 12px;
          background: #fef3c7;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #92400e;
          font-size: 13px;
          font-weight: 600;
        }

        .credits-info svg {
          color: #f59e0b;
        }

        /* RESPONSIVO */
        @media (max-width: 1024px) {
          .plans-grid {
            gap: 20px;
          }
          
          .plan-card {
            padding: 24px;
          }
        }

        @media (max-width: 768px) {
          .plans-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 0 auto;
          }
          
          .section-header h2 {
            font-size: 28px;
          }
          
          .price {
            font-size: 36px;
          }
        }

        @media (max-width: 480px) {
          .plans-section {
            padding: 60px 0;
          }
          
          .plan-card {
            padding: 20px;
          }
          
          .price {
            font-size: 32px;
          }
          
          .section-header h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </section>
  );
};

export default PlansGrid;