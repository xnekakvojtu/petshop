// src/components/Carousel.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Slide {
  title: string;
  description: string;
  link: string;
  image: string;
  icon?: string;
}

interface CarouselProps {
  slides?: Slide[];
}

const Carousel: React.FC<CarouselProps> = ({ 
  slides = [
    {
      title: 'Moda Pet Premium',
      description: 'Roupas e acessórios da temporada com 25% OFF',
      link: '#moda-pet',
      image: 'https://images.unsplash.com/photo-1554456854-55a089fd4cb2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      icon: 'fas fa-tshirt'
    },
    {
      title: 'Cuidados Especiais',
      description: 'Tosa, banho e tratamentos estéticos profissionais',
      link: '#servicos',
      image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      icon: 'fas fa-spa'
    },
    {
      title: 'Experiência VIP',
      description: 'Atendimento personalizado e produtos exclusivos',
      link: '#vip',
      image: 'https://images.unsplash.com/photo-1581888227599-779811939961?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      icon: 'fas fa-crown'
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

  useEffect(() => {
    if (slides.length <= 1) return;
    
    intervalRef.current = setInterval(() => {
      handleNext();
    }, 8000);
    
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
              >
                <div 
                  className="slide-background"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="slide-overlay"></div>
                </div>
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
                    <span>Saiba Mais</span>
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

      <style>{`
        .hero-section {
          padding: 32px 0 24px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .carousel-container {
          overflow: hidden;
          border-radius: 24px;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.1),
            0 8px 24px -4px rgba(0, 0, 0, 0.08),
            0 0 0 1px rgba(0, 0, 0, 0.02);
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          height: 520px;
        }

        .carousel-wrapper {
          position: relative;
          height: 100%;
        }

        .carousel-track {
          display: flex;
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
          height: 100%;
        }

        .carousel-slide {
          flex: 0 0 100%;
          min-width: 100%;
          position: relative;
          height: 100%;
        }

        .slide-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transition: transform 8s ease-out;
        }

        .carousel-slide.active .slide-background {
          transform: scale(1.05);
        }

        .slide-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to right,
            rgba(15, 23, 42, 0.85) 0%,
            rgba(15, 23, 42, 0.6) 50%,
            rgba(15, 23, 42, 0.3) 100%
          );
        }

        .slide-content {
          position: relative;
          width: 100%;
          height: 100%;
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          text-align: left;
          gap: 28px;
          padding: 0 80px;
          color: white;
          z-index: 2;
        }

        .slide-icon {
          font-size: 60px;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 12px;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .slide-text h2 {
          font-size: 44px;
          margin-bottom: 20px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.5px;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          background: linear-gradient(90deg, #ffffff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        .slide-text h2::after {
          content: '';
          position: absolute;
          bottom: -12px;
          left: 0;
          width: 80px;
          height: 4px;
          background: linear-gradient(90deg, #8B5CF6, #7C3AED);
          border-radius: 2px;
        }

        .slide-text p {
          font-size: 20px;
          opacity: 0.95;
          max-width: 500px;
          margin-bottom: 12px;
          line-height: 1.6;
          font-weight: 500;
          letter-spacing: 0.3px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .btn-slide {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          padding: 18px 44px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: 20px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 10px 30px rgba(139, 92, 246, 0.4),
            0 4px 15px rgba(139, 92, 246, 0.3),
            inset 0 1px 1px rgba(255, 255, 255, 0.2);
        }

        .btn-slide::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.7s ease;
        }

        .btn-slide:hover {
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          transform: translateY(-3px);
          box-shadow: 
            0 15px 40px rgba(139, 92, 246, 0.5),
            0 6px 20px rgba(139, 92, 246, 0.4),
            inset 0 1px 1px rgba(255, 255, 255, 0.3);
        }

        .btn-slide:hover::before {
          left: 100%;
        }

        .btn-slide:active {
          transform: translateY(-1px);
        }

        .carousel-nav {
          position: absolute;
          bottom: 40px;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 60px;
          z-index: 10;
        }

        .carousel-prev,
        .carousel-next {
          background: rgba(255, 255, 255, 0.12);
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          color: white;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          font-size: 20px;
        }

        .carousel-prev:hover,
        .carousel-next:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          transform: scale(1.08);
          box-shadow: 
            0 8px 25px rgba(255, 255, 255, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .carousel-dots {
          display: flex;
          gap: 16px;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 40px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.4);
          background: transparent;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 0;
          position: relative;
        }

        .carousel-dot.active {
          background: white;
          border-color: white;
          transform: scale(1.3);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
        }

        .carousel-dot.active::after {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .carousel-dot:hover:not(.active) {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.6);
        }

        @media (prefers-reduced-motion: reduce) {
          .carousel-track,
          .slide-icon,
          .carousel-dot.active::after,
          .btn-slide::before {
            animation: none;
            transition: none;
          }
          
          .btn-slide:hover,
          .carousel-prev:hover,
          .carousel-next:hover {
            transform: none;
          }
        }

        /* ⭐⭐ CORREÇÃO MOBILE - Botão em cima dos dots */
        
        @media (max-width: 900px) {
          .carousel-container {
            height: 440px;
            margin: 0 24px;
          }
          
          .slide-content {
            padding: 0 60px;
            align-items: center;
            text-align: center;
            justify-content: flex-start;
            padding-top: 60px;
          }
          
          .slide-text h2::after {
            left: 50%;
            transform: translateX(-50%);
          }
          
          /* ⭐ Aumentar espaço entre botão e dots */
          .slide-content {
            gap: 32px;
          }
          
          .btn-slide {
            margin-top: 40px;
            margin-bottom: 20px;
          }
          
          /* ⭐ Mover dots mais para baixo */
          .carousel-nav {
            bottom: 70px;
            padding: 0 40px;
          }
        }

        @media (max-width: 768px) {
          .carousel-container {
            height: 400px;
            border-radius: 20px;
            margin: 0 20px;
          }
          
          .hero-section {
            padding: 24px 0 16px;
          }
          
          .slide-content {
            padding: 0 40px;
            padding-top: 50px;
            gap: 28px;
          }
          
          .btn-slide {
            margin-top: 35px;
            margin-bottom: 25px;
            padding: 16px 36px;
          }
          
          .carousel-prev,
          .carousel-next {
            width: 48px;
            height: 48px;
            font-size: 18px;
          }
          
          .slide-text h2 {
            font-size: 32px;
          }
          
          .slide-text p {
            font-size: 17px;
          }
          
          .slide-icon {
            font-size: 48px;
          }
          
          /* ⭐ Mais espaço entre conteúdo e dots */
          .carousel-nav {
            bottom: 85px;
          }
        }

        @media (max-width: 640px) {
          .carousel-container {
            height: 380px;
            margin: 0 16px;
          }
          
          .slide-content {
            padding: 0 32px;
            padding-top: 45px;
            gap: 24px;
          }
          
          .slide-text h2 {
            font-size: 28px;
            margin-bottom: 16px;
          }
          
          .slide-text h2::after {
            bottom: -8px;
            height: 3px;
            width: 60px;
          }
          
          .slide-text p {
            font-size: 16px;
          }
          
          .btn-slide {
            padding: 14px 32px;
            font-size: 15px;
            margin-top: 30px;
            margin-bottom: 30px;
          }
          
          .carousel-nav {
            padding: 0 24px;
            bottom: 20px;
          }
          
          .carousel-dots {
           position: absolute;
           bottom: 80px;
           left: 50%;
           transform: translateX(-50%);
            gap: 12px;
            padding: 6px 12px;
          }
        }

        @media (max-width: 480px) {
          .carousel-container {
            height: 340px;
            margin: 0 12px;
            border-radius: 16px;
          }
          
          .slide-content {
            padding: 0 24px;
            padding-top: 40px;
            gap: 20px;
          }
          
          .slide-text h2 {
            font-size: 24px;
          }
          
          .slide-text p {
            font-size: 15px;
            max-width: 100%;
          }
          
          .slide-icon {
            font-size: 40px;
            margin-bottom: 8px;
          }
          
          .btn-slide {
            padding: 12px 28px;
            font-size: 14px;
            gap: 10px;
            margin-top: 25px;
            margin-bottom: 40px; /* ⭐ MAIS ESPAÇO AQUI */
          }
          
          .carousel-prev,
          .carousel-next {
            display: none;
          }
          
          /* ⭐ Dots centralizados e com mais espaço */
          .carousel-dots {
            position: absolute;
            bottom: 75px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.3);
            padding: 5px 10px;
          }
        }

        @media (max-width: 375px) {
          .carousel-container {
            height: 320px;
          }
          
          .slide-content {
            padding-top: 35px;
            gap: 18px;
          }
          
          .slide-text h2 {
            font-size: 22px;
          }
          
          .slide-text p {
            font-size: 14px;
          }
          
          .btn-slide {
            padding: 10px 24px;
            font-size: 13px;
            margin-top: 20px;
            margin-bottom: 45px; /* ⭐ Ainda mais espaço */
          }
          
          .carousel-dots {
            bottom: 55px;
          }
        }

        /* Efeito de brilho sutil nas bordas */
        .carousel-container::before {
          content: '';
          position: absolute;
          top: 1px;
          left: 1px;
          right: 1px;
          bottom: 1px;
          border-radius: 23px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 20%,
            transparent 80%,
            rgba(255, 255, 255, 0.05) 100%
          );
          pointer-events: none;
          z-index: 1;
        }
      `}</style>
    </section>
  );
};

export default Carousel;