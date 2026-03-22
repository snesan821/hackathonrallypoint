import type { Metadata } from 'next'
import { Newsreader, Manrope } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import '@/styles/globals.css'
import { Toaster } from '@/components/ui/Toaster'
import { defaultMetadata } from '@/lib/seo/metadata'

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-headline',
  display: 'swap',
})

const manrope = Manrope({
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
      <html lang="en" className={`${newsreader.variable} ${manrope.variable}`} suppressHydrationWarning>
        <body className="min-h-screen" suppressHydrationWarning>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
