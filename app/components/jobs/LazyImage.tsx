'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from "@/app/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  isThumb?: boolean;
}

export function LazyImage({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  isThumb = false,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Handle the image source URL
  const imageUrl = src.startsWith('http') 
  ? src 
  : `${process.env.NEXT_PUBLIC_API_URL}/media${src}`;

  if (error) {
    return (
      <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
        <span className="text-sm text-gray-500">Failed to load image</span>
      </div>
    );
  }

  console.log('Loading image:', imageUrl); // Debug log

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <Image
        src={imageUrl}
        alt={alt}
        fill
        unoptimized // Add this to bypass Next.js image optimization
        priority={priority && !isThumb}
        className={cn(
          'object-cover duration-700 ease-in-out',
          isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0',
          className
        )}
        onLoad={() => {
          console.log('Image loaded successfully:', imageUrl); // Debug log
          setIsLoading(false);
        }}
        onError={(e) => {
          console.error('Image load error details:', {
            url: imageUrl,
            error: e,
            timestamp: new Date().toISOString()
          });
          setError(true);
        }}
        loading={priority && !isThumb ? undefined : 'lazy'}
        sizes={isThumb ? "128px" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      />
    </div>
  );
}
