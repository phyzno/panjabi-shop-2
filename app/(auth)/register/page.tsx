import { signup } from '@/lib/actions/auth'
import Link from 'next/link'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string; error: string }>
}) {
  const { error } = await searchParams;
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto py-24">
      <h1 className="text-3xl font-heading font-bold text-primary mb-8 text-center">Create Account</h1>
      <form
        className="animate-in flex-1 flex flex-col w-full justify-center gap-6 text-foreground"
        action={signup}
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="email">
            Email
          </label>
          <input
            className="rounded-lg px-4 py-3 bg-white border border-border focus:ring-2 focus:ring-primary outline-none"
            name="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="password">
            Password
          </label>
          <input
            className="rounded-lg px-4 py-3 bg-white border border-border focus:ring-2 focus:ring-primary outline-none"
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
        </div>
        <button className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-3 font-medium transition-colors shadow-md">
          Sign Up
        </button>
        {error && (
          <p className="p-4 bg-red-50 text-red-700 text-center rounded-lg text-sm">
            {error}
          </p>
        )}
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Login
          </Link>
        </div>
      </form>
    </div>
  )
}
