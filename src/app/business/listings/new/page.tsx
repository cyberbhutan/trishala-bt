import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createBusiness } from '@/lib/actions/businesses'
import { BHUTAN_CITIES } from '@/lib/utils'

export default async function NewBusinessPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/business/listings" className="text-sm text-white/40 hover:text-white/60">← Back to listings</Link>
          <h1 className="mt-2 text-2xl font-bold text-white">List Your Business</h1>
          <p className="mt-1 text-sm text-white/50">Fill in your business details below</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-8">
          <form action={createBusiness} className="space-y-6">
            {/* Business Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/70">Business Name *</label>
              <input id="name" name="name" required
                className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
                placeholder="e.g. Mountain Cafe Thimphu"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-white/70">Category *</label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {categories?.map((cat) => (
                  <label key={cat.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm text-white/60 hover:border-white/10 has-[:checked]:border-[#FF8A00]/30 has-[:checked]:bg-[#FF8A00]/5 has-[:checked]:text-[#FF8A00]">
                    <input type="checkbox" name="category_ids" value={cat.id} className="sr-only" />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="short_description" className="block text-sm font-medium text-white/70">Short Description</label>
              <input id="short_description" name="short_description"
                className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none"
                placeholder="Brief description (max 200 chars)"
                maxLength={200}
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white/70">Full Description</label>
              <textarea id="description" name="description" rows={4}
                className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none"
                placeholder="Tell customers about your business..."
              />
            </div>

            {/* Contact */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white/70">Phone</label>
                <input id="phone" name="phone" type="tel"
                  className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none"
                  placeholder="+975 17 123456"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/70">Email</label>
                <input id="email" name="email" type="email"
                  className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-white/70">WhatsApp</label>
                <input id="whatsapp" name="whatsapp" type="tel"
                  className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none"
                  placeholder="+975 17 123456"
                />
              </div>
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-white/70">Website</label>
                <input id="website" name="website" type="url"
                  className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none"
                  placeholder="https://"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-white/70">City *</label>
                <select id="city" name="city" required
                  className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-[#FF8A00]/50 focus:outline-none"
                >
                  <option value="">Select city</option>
                  {BHUTAN_CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="area" className="block text-sm font-medium text-white/70">Area</label>
                <input id="area" name="area"
                  className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none"
                  placeholder="e.g. Norzin Lam"
                />
              </div>
            </div>

            {/* Social */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="facebook" className="block text-sm font-medium text-white/70">Facebook URL</label>
                <input id="facebook" name="facebook"
                  className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-white/70">Instagram URL</label>
                <input id="instagram" name="instagram"
                  className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#FF8A00] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#E67A00]"
            >
              Submit for Review
            </button>
            <p className="text-center text-xs text-white/30">Your listing will be reviewed before going live</p>
          </form>
        </div>
      </div>
    </div>
  )
}
