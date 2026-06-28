'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════
   Props
   ═══════════════════════════════════════════════════════════════════ */

interface ImageLightboxProps {
  images: string[]
  startIndex?: number
  onClose: () => void
}

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */

export function ImageLightbox({
  images,
  startIndex = 0,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex)
  const overlayRef = useRef<HTMLDivElement>(null)

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  /* ── Keyboard support ── */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        goNext()
      } else if (e.key === 'ArrowLeft') {
        goPrev()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll while lightbox is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose, goNext, goPrev])

  /* ── Click outside image to close ── */
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  if (!images.length) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
    >
      {/* ── Close button ── */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        aria-label="Close lightbox"
      >
        <X className="h-5 w-5" />
      </button>

      {/* ── Images counter ── */}
      <div className="absolute left-4 top-4 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* ── Left navigation ── */}
      {images.length > 1 && (
        <button
          onClick={goPrev}
          className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white max-sm:left-2 max-sm:h-10 max-sm:w-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* ── Main image ── */}
      <div className="relative flex h-full w-full items-center justify-center p-4 pb-24 animate-scale-in">
        <div className="relative h-full w-full max-w-5xl">
          <Image
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>
      </div>

      {/* ── Right navigation ── */}
      {images.length > 1 && (
        <button
          onClick={goNext}
          className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white max-sm:right-2 max-sm:h-10 max-sm:w-10"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* ── Thumbnail strip ── */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 overflow-x-auto px-4 py-2">
          {images.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                idx === currentIndex
                  ? 'border-[#FF8A00] opacity-100 ring-1 ring-[#FF8A00]/50'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <Image
                src={src}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
