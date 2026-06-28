import Link from 'next/link'
import { signIn, signInWithGoogle } from '@/lib/actions/auth'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-white/50">Sign in to manage your businesses</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-8 backdrop-blur-sm">
          <form action={signIn} className="space-y-4">
            <input type="hidden" name="redirect" id="redirect-input" />
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
                id="password" name="password" type="password" required
                className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#FF8A00] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#E67A00]"
            >
              Sign In
            </button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-[#0F172A] px-2 text-white/30">or</span></div>
          </div>
          <form action={async () => { 'use server'; await signInWithGoogle() }}>
            <button
              type="submit"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              Continue with Google
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-white/30">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-[#FF8A00] hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
