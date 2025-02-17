// components/profile/ProfileImage.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User2 } from 'lucide-react';

interface ProfileImageProps {
  src: string | null | undefined; // Allow null or undefined src
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string; // Allow extra className for customization
}

const sizes = {
  sm: { container: 'w-12 h-12', icon: 'h-6 w-6' }, // Adjusted sizes for 'sm'
  md: { container: 'w-24 h-24', icon: 'h-12 w-12' },
  lg: { container: 'w-32 h-32', icon: 'h-16 w-16' },
};

export function ProfileImage({ src, alt, size = 'md', className }: ProfileImageProps) {
  const [error, setError] = useState(false);
  const { container, icon } = sizes[size];

  const imageSrc = src || ''; // Treat null or undefined src as empty string for Image component

  return (
    <div className={`${container} relative rounded-full bg-muted flex items-center justify-center overflow-hidden ${className || ''}`}>
      {imageSrc && !error ? ( // Only render Image if src is truthy and no error
        <Image
          src={imageSrc}
          alt={alt}
          fill // Use fill and parent container for responsive sizing
          sizes="100%" // Ensure image takes full width and height of container
          className="rounded-full object-cover"
          onError={() => setError(true)}
          priority
        />
      ) : (
        <User2 className={`${icon} absolute text-muted-foreground`} /> // Absolute positioning for icon inside container
      )}
    </div>
  );
}