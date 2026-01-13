// src/components/OptimizedImage.tsx
import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  lazy?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
  lazy = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder);

  useEffect(() => {
    const img = new Image();
    
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setHasError(true);
      // Fallback para placeholder genérico baseado no texto
      const fallbackText = alt.substring(0, 2).toUpperCase();
      setImageSrc(`https://via.placeholder.com/${width || 300}x${height || 300}/8B5CF6/FFFFFF?text=${fallbackText}`);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, alt, width, height]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
      width={width}
      height={height}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
};

export default OptimizedImage;