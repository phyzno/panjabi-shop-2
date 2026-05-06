'use client'

import { useTransition, useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'

interface InstantDeleteButtonProps {
  action: () => Promise<void>;
  className?: string;
}

export function InstantDeleteButton({ action, className = "cursor-pointer p-2 hover:bg-red-50 rounded-lg transition-colors" }: InstantDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [deleted, setDeleted] = useState(false)

  if (deleted) return null;

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this?')) {
      setDeleted(true); // hide instantly
      startTransition(async () => {
        await action();
      })
    }
  }

  return (
    <button 
      type="button" 
      onClick={handleDelete}
      disabled={isPending}
      className={className}
    >
      {isPending ? <Loader2 size={16} className="text-red-400 animate-spin" /> : <Trash2 size={16} className="text-red-600" />}
    </button>
  )
}
