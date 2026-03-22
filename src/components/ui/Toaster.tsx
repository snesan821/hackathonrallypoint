'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-[var(--co-surface-container-lowest)] group-[.toaster]:text-[var(--co-on-surface)] group-[.toaster]:border-[var(--co-outline-variant)] group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-[var(--co-on-surface-variant)]',
          actionButton:
            'group-[.toast]:bg-[var(--co-primary)] group-[.toast]:text-[var(--co-on-primary)]',
          cancelButton:
            'group-[.toast]:bg-[var(--co-surface-container-high)] group-[.toast]:text-[var(--co-on-surface-variant)]',
          error: 'group-[.toaster]:bg-[var(--co-error)]/5 group-[.toaster]:border-[var(--co-error)]/20',
          success: 'group-[.toaster]:bg-[var(--co-success)]/5 group-[.toaster]:border-[var(--co-success)]/20',
        },
      }}
    />
  )
}
