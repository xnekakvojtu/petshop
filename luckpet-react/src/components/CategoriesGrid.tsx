// src/components/CategoriesGrid.tsx
import React from 'react';

const CategoriesGrid: React.FC = () => {
  const categories = [
    { icon: 'fas fa-pills', label: 'Saúde Pet', color: '#EF4444', href: '#saude-pet' },
    { icon: 'fas fa-tshirt', label: 'Moda Pet', color: '#8B5CF6', href: '#moda-pet' },
    { icon: 'fas fa-apple-alt', label: 'Nutrição', color: '#10B981', href: '#nutricao-pet' },
    { icon: 'fas fa-lightbulb', label: 'Curiosidades', color: '#F59E0B', href: '#curiosidades' },
    { icon: 'fas fa-concierge-bell', label: 'Serviços', color: '#3B82F6', href: '#servicos' }
  ];

  return (
    <section className="categories-section">
      <div className="container">
        <h2 className="section-title">Explore Nossas Categorias</h2>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <a 
              key={index} 
              href={category.href} 
              className="category-card"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                '--category-color': category.color 
              } as React.CSSProperties}
            >
              <div className="category-icon-wrapper">
                <i className={category.icon}></i>
              </div>
              <span className="category-label">{category.label}</span>
            </a>
          ))}
        </div>
      </div>

      <style >{`
        .categories-section {
          padding: 3rem 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .section-title {
          font-size: 2rem;
          color: #1F2937;
          margin-bottom: 2rem;
          text-align: center;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }

        .category-card {
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 0.75rem;
          padding: 1.5rem;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          animation: slideUp 0.5s ease-out forwards;
        }

        .category-card:hover {
          border-color: var(--category-color);
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
        }

        .category-icon-wrapper {
          width: 64px;
          height: 64px;
          background: #F9FAFB;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: var(--category-color);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .category-card:hover .category-icon-wrapper {
          background: var(--category-color);
          color: white;
          transform: scale(1.1);
        }

        .category-label {
          color: #1F2937;
          font-weight: 600;
          font-size: 0.875rem;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 992px) {
          .categories-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .categories-grid {
            grid-template-columns: 1fr;
          }

          .section-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
};

export default CategoriesGrid;