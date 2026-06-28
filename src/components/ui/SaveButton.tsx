'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleFavorite } from '@/lib/actions/favorites'
import toast from 'react-hot-toast'

interface SaveButtonProps {
  itemType: string
  itemId: number
  initialSaved: boolean
  className?: string
}

export default function SaveButton({
  itemType,
  itemId,
  initialSaved,
  className,
}: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)

    // Optimistic update
    setSaved((prev) => !prev)

    try {
      const result = await toggleFavorite(itemType, itemId)

      if ('error' in result) {
        // Revert optimistic update on error
        setSaved((prev) => !prev)

        if (result.error === 'Not authenticated') {
          toast.error('Please sign in to save items')
        } else {
          toast.error(result.error)
        }
        return
      }

      toast.success(
        result.action === 'added' ? 'Saved to favorites' : 'Removed from favorites'
      )
    } catch {
      // Revert on unexpected error
      setSaved((prev) => !prev)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleToggle()
      }}
      disabled={loading}
      className={cn(
        'flex items-center justify-center rounded-full p-2 transition-all duration-200',
        'bg-black/40 backdrop-blur-sm',
        saved
          ? 'text-red-400 hover:bg-black/50 hover:text-red-300'
          : 'text-white/50 hover:bg-black/50 hover:text-white/80',
        loading && 'opacity-60',
        className
      )}
      aria-label={saved ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn('h-5 w-5 transition-transform duration-200', {
          'fill-current scale-110': saved,
          'scale-100': !saved,
        })}
      />
    </button>
  )
}
