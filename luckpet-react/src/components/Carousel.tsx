// src/components/Carousel.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Carousel.css';

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
      image: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
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
    </section>
  );
};

export default Carousel;