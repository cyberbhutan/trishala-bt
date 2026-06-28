import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getWhatsAppLink(phone: string, message?: string) {
  const cleaned = phone.replace(/[^0-9]/g, '')
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${cleaned}${text}`
}

export function getGoogleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`
}

export const TIERS = {
  free: { name: 'Free', price: 0, color: 'gray' },
  featured: { name: 'Featured', price: 500, currency: 'BTN', color: 'blue' },
  spotlight: { name: 'Spotlight', price: 1500, currency: 'BTN', color: 'amber' },
} as const

export const BHUTAN_CITIES = [
  'Thimphu', 'Paro', 'Punakha', 'Wangdue Phodrang',
  'Phuntsholing', 'Gelephu', 'Samdrup Jongkhar',
  'Trashigang', 'Bumthang', 'Mongar', 'Lhuntse',
  'Trongsa', 'Zhemgang', 'Dagana', 'Tsirang',
  'Sarpang', 'Samtse', 'Chukha', 'Haa', 'Gasa',
] as const
