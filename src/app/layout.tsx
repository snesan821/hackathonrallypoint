import type { Metadata } from 'next'
import { Instrument_Serif, DM_Sans } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import '@/styles/globals.css'
import { Toaster } from '@/components/ui/Toaster'
import { defaultMetadata } from '@/lib/seo/metadata'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = defaultMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
        <body className="min-h-screen">
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
