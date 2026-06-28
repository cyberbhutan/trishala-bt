import { createServerSupabase } from '@/lib/supabase/server'
import { createClassified } from '@/lib/actions/classifieds'
import { BHUTAN_CITIES } from '@/lib/utils'
import type { ClassifiedCategory } from '@/lib/types'
import Link from 'next/link'
import { ArrowLeft, ImagePlus } from 'lucide-react'

export default async function NewClassifiedPage() {
  const supabase = await createServerSupabase()
  const { data: rawCategories } = await supabase
    .from('classified_categories')
    .select('*')
    .order('name')
  const categories = (rawCategories || []) as ClassifiedCategory[]

  const priceTypes = [
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'negotiable', label: 'Negotiable' },
    { value: 'free', label: 'Free' },
    { value: 'exchange', label: 'Exchange' },
  ]

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'used', label: 'Used' },
  ]

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Back link ── */}
        <Link
          href="/classifieds"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to classifieds
        </Link>

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Post a Classified Ad</h1>
          <p className="mt-1 text-sm text-white/40">
            List your item for sale, trade, or free giveaway
          </p>
        </div>

        {/* ── Form ── */}
        <form
          action={createClassified}
          className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8"
        >
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-1.5 block text-sm font-medium text-white/80"
              >
                Title <span className="text-[#FF8A00]">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                minLength={3}
                placeholder="e.g. iPhone 14 Pro Max 256GB - Like New"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-medium text-white/80"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Describe your item — condition, reason for selling, what's included, etc."
                className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
              />
            </div>

            {/* Price & Price Type */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="price"
                  className="mb-1.5 block text-sm font-medium text-white/80"
                >
                  Price (Nu.)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 25000"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
                />
              </div>

              <div>
                <label
                  htmlFor="price_type"
                  className="mb-1.5 block text-sm font-medium text-white/80"
                >
                  Price Type
                </label>
                <select
                  id="price_type"
                  name="price_type"
                  defaultValue="fixed"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white backdrop-blur-sm transition-all focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
                >
                  {priceTypes.map((pt) => (
                    <option key={pt.value} value={pt.value} className="bg-[#0F172A]">
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category & Condition */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="category_id"
                  className="mb-1.5 block text-sm font-medium text-white/80"
                >
                  Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white backdrop-blur-sm transition-all focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
                >
                  <option value="" className="bg-[#0F172A]">
                    Select a category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#0F172A]">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="condition"
                  className="mb-1.5 block text-sm font-medium text-white/80"
                >
                  Condition
                </label>
                <select
                  id="condition"
                  name="condition"
                  defaultValue="good"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white backdrop-blur-sm transition-all focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
                >
                  {conditions.map((c) => (
                    <option key={c.value} value={c.value} className="bg-[#0F172A]">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location & City */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="city"
                  className="mb-1.5 block text-sm font-medium text-white/80"
                >
                  City / Dzongkhag
                </label>
                <select
                  id="city"
                  name="city"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white backdrop-blur-sm transition-all focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
                >
                  <option value="" className="bg-[#0F172A]">
                    Select city
                  </option>
                  {BHUTAN_CITIES.map((c) => (
                    <option key={c} value={c} className="bg-[#0F172A]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="mb-1.5 block text-sm font-medium text-white/80"
                >
                  Specific Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. Norzin Lam, Thimphu"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
                />
              </div>
            </div>

            {/* Images (URLs, one per line) */}
            <div>
              <label
                htmlFor="images"
                className="mb-1.5 flex items-center gap-2 text-sm font-medium text-white/80"
              >
                <ImagePlus className="h-4 w-4 text-[#FF8A00]" />
                Image URLs
              </label>
              <textarea
                id="images"
                name="images"
                rows={3}
                placeholder="Paste image URLs, one per line&#10;https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
              />
              <p className="mt-1 text-[11px] text-white/30">
                Add one URL per line. Host your images elsewhere and paste the links here.
              </p>
            </div>

            {/* Contact Section */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
                Contact Information
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-xs font-medium text-white/60"
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+975 17 123 456"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-medium text-white/60"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="whatsapp"
                    className="mb-1.5 block text-xs font-medium text-white/60"
                  >
                    WhatsApp
                  </label>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    placeholder="+975 17 123 456"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/classifieds"
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/60 transition-colors hover:text-white/80"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="rounded-xl bg-[#FF8A00] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#E67A00]"
              >
                Post Classified
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
