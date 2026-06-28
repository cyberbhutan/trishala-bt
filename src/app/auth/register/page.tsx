import Link from 'next/link'
import { signUp } from '@/lib/actions/auth'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-sm text-white/50">Join Trishala and list your business</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-8 backdrop-blur-sm">
          <form action={signUp} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-white/70">Full Name</label>
              <input
                id="full_name" name="full_name" type="text" required
                className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
                placeholder="Sonam Wangchuk"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70">Email</label>
              <input
                id="email" name="email" type="email" required
                className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/70">Password</label>
              <input
                id="password" name="password" type="password" required minLength={6}
                className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
                placeholder="Min. 6 characters"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#FF8A00] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#E67A00]"
            >
              Create Account
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-white/30">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#FF8A00] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
