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
      image: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      icon: 'fas fa-tshirt'
    },
    {
      title: 'Cuidados Especiais',
      description: 'Tosa, banho e tratamentos estéticos profissionais',
      link: '#servicos',
      image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      icon: 'fas fa-spa'
    },
    {
      title: 'Experiência VIP',
      description: 'Atendimento personalizado e produtos exclusivos',
      link: '#vip',
      image: 'https://images.unsplash.com/photo-1581888227599-779811939961?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      icon: 'fas fa-crown'
    }
  ]
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ⭐ Pré-carregar imagens de forma otimizada
  useEffect(() => {
    const loadedStates = slides.map(() => false);
    setImagesLoaded(loadedStates);

    slides.forEach((slide, index) => {
      const img = new Image();
      img.src = slide.image;
      img.onload = () => {
        setImagesLoaded(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      };
    });
  }, [slides]);

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
                className={`carousel-slide ${!imagesLoaded[index] ? 'loading' : ''}`}
              >
                {/* ⭐ TROCADO background-image por img */}
                <div className="slide-background">
                  {!imagesLoaded[index] && (
                    <div className="slide-loading">
                      <div className="spinner"></div>
                    </div>
                  )}
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    onLoad={() => {
                      setImagesLoaded(prev => {
                        const newState = [...prev];
                        newState[index] = true;
                        return newState;
                      });
                    }}
                  />
                </div>
                <div className="slide-overlay"></div>
                <div className="slide-content">
                  {slide.icon && (
                    <div className="slide-icon">
                      <i className={slide.icon}></i>
                    </div>
                  )}
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
              disabled={isTransitioning}
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
                  disabled={isTransitioning}
                />
              ))}
            </div>
            
            <button 
              className="carousel-next"
              onClick={handleNext}
              aria-label="Próximo slide"
              disabled={isTransitioning}
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