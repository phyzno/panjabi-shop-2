'use client'

import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  label: string
  loadingLabel?: string
  className?: string
}

export function SubmitButton({ 
  label, 
  loadingLabel = 'Saving...', 
  className = "bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-[#8B2222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={className}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {loadingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  )
}
