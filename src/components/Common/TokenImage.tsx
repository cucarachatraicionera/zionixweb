'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCachedTokenImage } from '@/utils/tokens';

interface TokenImageProps {
  src: string;
  alt: string;
  size: number;
  className?: string;
}

const TokenImage: React.FC<TokenImageProps> = ({ src, alt, size, className }) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        
        // Try to get cached image first
        let imageUrl = src;
        
        // If src is a token address, try to get cached image
        if (src && src.length > 30 && !src.startsWith('http')) {
          imageUrl = getCachedTokenImage(src);
        } else if (src) {
          // For regular URLs, use as is
          imageUrl = src;
        }
        
        // Validate the image URL
        if (imageUrl && imageUrl !== '/default-token-icon.svg') {
          const img = new window.Image();
          img.onload = () => {
            setImgSrc(imageUrl);
            setIsLoading(false);
          };
          img.onerror = () => {
            console.warn(`Failed to load image: ${imageUrl}`);
            setImgSrc('/default-token-icon.svg');
            setIsLoading(false);
          };
          img.src = imageUrl;
        } else {
          setImgSrc('/default-token-icon.svg');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading token image:', error);
        setImgSrc('/default-token-icon.svg');
        setIsLoading(false);
      }
    };

    loadImage();
  }, [src]);

  if (isLoading) {
    return (
      <div 
        className={`animate-pulse bg-gray-300 rounded-full ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
      onError={() => setImgSrc('/default-token-icon.svg')}
      unoptimized
    />
  );
};

export default TokenImage;