import Image from 'next/image'
import { useState } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  isThumb?: boolean  // Add this to differentiate thumbnails
}

export function LazyImage({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  isThumb = false
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority && !isThumb}  // Only prioritize non-thumbnail images
        className={`object-cover duration-700 ease-in-out ${
          isLoading ? 'scale-110 blur-2xl grayscale' 
          : 'scale-100 blur-0 grayscale-0'
        } ${className}`}
        onLoad={() => setIsLoading(false)}
        loading={priority && !isThumb ? undefined : 'lazy'}
        sizes={isThumb ? "128px" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      />
    </div>
  )
}
