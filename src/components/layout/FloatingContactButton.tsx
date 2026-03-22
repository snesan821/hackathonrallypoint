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
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-all duration-300 ease-in-out hover:bg-primary-container hover:shadow-xl hover:scale-110 active:scale-95 select-none [-webkit-tap-highlight-color:transparent] lg:bottom-6"
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
        <div className="fixed bottom-40 right-6 z-40 space-y-2 lg:bottom-24">
          <Link
            href="/contact"
            className="flex items-center gap-2 rounded-lg bg-surface-container-lowest p-4 shadow-lg transition-all duration-300 ease-in-out hover:bg-surface-container-low hover:scale-105 select-none [-webkit-tap-highlight-color:transparent]"
          >
            <Mail className="h-5 w-5 text-on-surface-variant" />
            <span className="font-medium text-on-surface">Contact Us</span>
          </Link>
          <Link
            href="/privacy"
            className="flex items-center gap-2 rounded-lg bg-surface-container-lowest p-4 shadow-lg transition-all duration-300 ease-in-out hover:bg-surface-container-low hover:scale-105 select-none [-webkit-tap-highlight-color:transparent]"
          >
            <span className="font-medium text-on-surface">Privacy Policy</span>
          </Link>
          <Link
            href="/terms"
            className="flex items-center gap-2 rounded-lg bg-surface-container-lowest p-4 shadow-lg transition-all duration-300 ease-in-out hover:bg-surface-container-low hover:scale-105 select-none [-webkit-tap-highlight-color:transparent]"
          >
            <span className="font-medium text-on-surface">Terms & Conditions</span>
          </Link>
        </div>
      )}
    </>
  )
}
