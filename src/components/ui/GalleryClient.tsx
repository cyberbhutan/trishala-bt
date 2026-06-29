'use client'

import { useState } from 'react'
import { ImageLightbox } from './ImageLightbox'

interface GalleryClientProps {
  images: string[]
  children: React.ReactNode
}

export default function GalleryClient({ images, children }: GalleryClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (images.length === 0) return <>{children}</>

  return (
    <>
      <div onClick={() => setLightboxIndex(0)} className="cursor-pointer">
        {children}
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
