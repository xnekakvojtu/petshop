// src/components/Carousel.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Slide {
  title: string;
  description: string;
  link: string;
  bgColor?: string;
  icon?: string;
}

interface CarouselProps {
  slides?: Slide[];
}

const Carousel: React.FC<CarouselProps> = ({ 
  slides = [
    {
      title: 'Nutrição Premium para Seu Pet',
      description: 'Alimentos de alta qualidade com até 30% OFF',
      link: '#nutricao-pet',
      bgColor: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      icon: 'fas fa-apple-alt'
    },
    {
      title: 'Estilo e Conforto',
      description: 'Acessórios e roupas para todos os gostos',
      link: '#moda-pet',
      bgColor: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      icon: 'fas fa-tshirt'
    },
    {
      title: 'Cuidados Especiais',
      description: 'Serviços profissionais para seu companheiro',
      link: '#servicos',
      bgColor: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      icon: 'fas fa-spa'
    }
  ]
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handlePrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [slides.length, isTransitioning]);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(prev => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [slides.length, isTransitioning]);

  const handleDotClick = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning]);

  // Otimizar timer - aumentar intervalo
  useEffect(() => {
    if (slides.length <= 1) return;
    
    intervalRef.current = setInterval(() => {
      handleNext();
    }, 10000); // 10 segundos
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slides.length, handleNext]);

  return (
    <section className="hero-section">
      <div className="carousel-container">
        <div className="carousel-wrapper">
          <div 
            className="carousel-track" 
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div 
                key={index} 
                className="carousel-slide"
                style={{ background: slide.bgColor }}
              >
                <div className="slide-content">
                  <div className="slide-icon">
                    <i className={slide.icon}></i>
                  </div>
                  <div className="slide-text">
                    <h2>{slide.title}</h2>
                    <p>{slide.description}</p>
                  </div>
                  <a href={slide.link} className="btn-slide">
                    <i className="fas fa-arrow-right"></i>
                    <span>Ver Ofertas</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="carousel-nav">
            <button 
              className="carousel-prev"
              onClick={handlePrev}
              aria-label="Slide anterior"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <div className="carousel-dots">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${currentSlide === index ? 'active' : ''}`}
                  onClick={() => handleDotClick(index)}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              className="carousel-next"
              onClick={handleNext}
              aria-label="Próximo slide"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <style >{`
        .hero-section {
          padding: 24px 0;
          background: #f9fafb;
        }

        .carousel-container {
          overflow: hidden;
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          max-width: 1200px;
          margin: 0 auto;
          background: white;
        }

        .carousel-wrapper {
          position: relative;
        }

        .carousel-track {
          display: flex;
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }

        .carousel-slide {
          flex: 0 0 100%;
          min-width: 100%;
          padding: 40px;
          min-height: 300px;
          display: flex;
          align-items: center;
          color: white;
        }

        .slide-content {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 24px;
        }

        .slide-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.9;
        }

        .slide-text h2 {
          font-size: 32px;
          margin-bottom: 12px;
          font-weight: 700;
          line-height: 1.2;
        }

        .slide-text p {
          font-size: 18px;
          opacity: 0.9;
          max-width: 600px;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .btn-slide {
          background: rgba(255,255,255,0.9);
          color: #1f2937;
          padding: 12px 32px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          margin-top: 16px;
        }

        .btn-slide:hover {
          background: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .carousel-nav {
          position: absolute;
          bottom: 24px;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          z-index: 10;
        }

        .carousel-prev,
        .carousel-next {
          background: rgba(255,255,255,0.2);
          border: 2px solid rgba(255,255,255,0.4);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(4px);
          font-size: 16px;
        }

        .carousel-prev:hover,
        .carousel-next:hover {
          background: rgba(255,255,255,0.3);
          border-color: white;
        }

        .carousel-dots {
          display: flex;
          gap: 8px;
        }

        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4);
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }

        .carousel-dot.active {
          background: white;
          border-color: white;
          transform: scale(1.2);
        }

        /* Desabilitar animações se preferir reduzir movimento */
        @media (prefers-reduced-motion: reduce) {
          .carousel-track {
            transition: none;
          }
          
          .btn-slide:hover {
            transform: none;
          }
        }

        @media (max-width: 768px) {
          .carousel-slide {
            padding: 32px 24px;
            min-height: 250px;
          }
          
          .carousel-nav {
            padding: 0 16px;
            bottom: 16px;
          }

          .carousel-prev,
          .carousel-next {
            width: 36px;
            height: 36px;
            font-size: 14px;
          }

          .slide-text h2 {
            font-size: 24px;
          }

          .slide-text p {
            font-size: 16px;
          }

          .slide-icon {
            font-size: 36px;
          }

          .btn-slide {
            padding: 10px 24px;
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .carousel-slide {
            padding: 24px 16px;
          }
          
          .slide-text h2 {
            font-size: 20px;
          }
          
          .slide-text p {
            font-size: 14px;
          }
          
          .carousel-prev,
          .carousel-next {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default Carousel;