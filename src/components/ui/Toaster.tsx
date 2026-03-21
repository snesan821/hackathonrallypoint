'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-slate-600',
          actionButton:
            'group-[.toast]:bg-orange-600 group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600',
          error: 'group-[.toaster]:bg-red-50 group-[.toaster]:border-red-200',
          success: 'group-[.toaster]:bg-green-50 group-[.toaster]:border-green-200',
          warning: 'group-[.toaster]:bg-yellow-50 group-[.toaster]:border-yellow-200',
          info: 'group-[.toaster]:bg-blue-50 group-[.toaster]:border-blue-200',
        },
      }}
    />
  )
}
