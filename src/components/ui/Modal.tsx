'use client'

import {
  type ReactNode,
  type HTMLAttributes,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
} from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlay?: boolean
  closeOnEsc?: boolean
  showCloseButton?: boolean
  /** For sidebar-style modals */
  side?: 'center' | 'right'
  footer?: ReactNode
}

/* ═══════════════════════════════════════════════════════════════════
   Sizes
   ═══════════════════════════════════════════════════════════════════ */

const sizeClasses: Record<string, string> = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'max-w-[calc(100vw-2rem)]',
}

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      title,
      description,
      size = 'md',
      closeOnOverlay = true,
      closeOnEsc = true,
      showCloseButton = true,
      side = 'center',
      footer,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const overlayRef = useRef<HTMLDivElement>(null)
    const previousActiveElement = useRef<HTMLElement | null>(null)

    /* ── Trap focus / body scroll ── */
    useEffect(() => {
      if (open) {
        previousActiveElement.current = document.activeElement as HTMLElement
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
        previousActiveElement.current?.focus()
      }
      return () => {
        document.body.style.overflow = ''
      }
    }, [open])

    /* ── Escape key ── */
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (closeOnEsc && e.key === 'Escape') {
          onClose()
        }
      },
      [closeOnEsc, onClose]
    )

    useEffect(() => {
      if (open) {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
      }
    }, [open, handleKeyDown])

    /* ── Overlay click ── */
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (closeOnOverlay && e.target === overlayRef.current) {
        onClose()
      }
    }

    if (!open) return null

    /* ── Side variant: slide from right ── */
    if (side === 'right') {
      return (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-label={title ?? 'Modal'}
        >
          <div
            ref={ref}
            className={cn(
              'flex w-full max-w-lg flex-col bg-white shadow-2xl overflow-y-auto',
              'animate-slide-in-right',
              className
            )}
            {...props}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                {title && <h2 className="text-lg font-semibold text-navy">{title}</h2>}
                {description && (
                  <p className="mt-0.5 text-sm text-gray-500">{description}</p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-navy"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="flex-1 px-6 py-5">{children}</div>
            {footer && (
              <div className="border-t border-gray-100 px-6 py-4">{footer}</div>
            )}
          </div>
        </div>
      )
    }

    /* ── Center variant ── */
    return (
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Modal'}
      >
        <div
          ref={ref}
          className={cn(
            'relative w-full rounded-2xl bg-white shadow-2xl animate-fade-in-scale',
            'max-h-[90vh] overflow-y-auto',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {/* Close button (absolute) */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-navy"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Header */}
          {(title || description) && (
            <div className={cn('px-6 pt-6', !footer && 'pb-2')}>
              {title && (
                <h2 className="text-xl font-semibold text-navy pr-8">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              )}
            </div>
          )}

          {/* Body */}
          <div className={cn('px-6', title || description ? 'py-5' : 'pt-6 pb-5')}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    )
  }
)

Modal.displayName = 'Modal'

export { Modal }
