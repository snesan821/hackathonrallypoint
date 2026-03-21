'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle, X, Mail } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg transition-all hover:bg-orange-700 hover:shadow-xl"
        aria-label="Contact us"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Contact Options */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 space-y-2">
          <Link
            href="/contact"
            className="flex items-center gap-2 rounded-lg bg-white p-4 shadow-lg transition-all hover:bg-slate-50"
          >
            <Mail className="h-5 w-5 text-slate-600" />
            <span className="font-medium text-slate-900">Contact Us</span>
          </Link>
          <Link
            href="/privacy"
            className="flex items-center gap-2 rounded-lg bg-white p-4 shadow-lg transition-all hover:bg-slate-50"
          >
            <span className="font-medium text-slate-900">Privacy Policy</span>
          </Link>
          <Link
            href="/terms"
            className="flex items-center gap-2 rounded-lg bg-white p-4 shadow-lg transition-all hover:bg-slate-50"
          >
            <span className="font-medium text-slate-900">Terms & Conditions</span>
          </Link>
        </div>
      )}
    </>
  )
}