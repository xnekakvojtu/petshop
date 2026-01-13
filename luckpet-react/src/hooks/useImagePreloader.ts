// src/hooks/useImagePreloader.ts
'use client';

import { useEffect, useState } from 'react';

export const useImagePreloader = (imageUrls: string[]) => {
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
  const [loadedCount, setLoadedCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    
    const loadImage = (url: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        
        img.onload = () => {
          if (isMounted) {
            setLoadedCount((prev) => {
              const newCount = prev + 1;
              if (newCount === imageUrls.length) {
                setImagesLoaded(true);
              }
              return newCount;
            });
          }
          resolve();
        };
        
        img.onerror = () => {
          console.warn(`Failed to load image: ${url}`);
          if (isMounted) {
            setLoadedCount((prev) => {
              const newCount = prev + 1;
              if (newCount === imageUrls.length) {
                setImagesLoaded(true);
              }
              return newCount;
            });
          }
          resolve();
        };
      });
    };

    // Carregar as primeiras 3 imagens imediatamente
    const priorityImages = imageUrls.slice(0, 3);
    const promises = priorityImages.map(url => loadImage(url));
    
    Promise.all(promises).then(() => {
      // Carregar o restante após um delay
      const remainingImages = imageUrls.slice(3);
      setTimeout(() => {
        if (isMounted && remainingImages.length > 0) {
          remainingImages.forEach(url => loadImage(url));
        }
      }, 1000);
    });

    return () => {
      isMounted = false;
    };
  }, [imageUrls]);

  return { imagesLoaded, loadedCount, total: imageUrls.length };
};