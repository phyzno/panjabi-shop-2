import Link from 'next/link'
import SignupForm from './SignupForm'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const resolvedParams = await searchParams
  const error = resolvedParams?.error
  const message = resolvedParams?.message

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#FAF7F2]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-heading text-3xl font-bold text-[#6B1E2E]">
            Panjabi Shop
          </Link>
          <h1 className="font-heading text-2xl font-semibold text-gray-900 mt-6">
            Create Your Account
          </h1>
          <p className="text-gray-600 mt-2">
            Join Panjabi Shop for custom tailoring
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <SignupForm error={error} message={message} />
        </div>
      </div>
    </div>
  )
}
