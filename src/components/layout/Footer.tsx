import Link from 'next/link'
import { Globe, MessageCircle, Mail } from 'lucide-react'

const RallyPointLogo = () => (
  <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" />
  </svg>
)

export function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/15 py-12 px-6 lg:px-20">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="flex flex-col gap-6 col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 text-on-surface">
            <div className="size-6 text-primary">
              <RallyPointLogo />
            </div>
            <h2 className="text-xl font-bold tracking-tight">RallyPoint</h2>
          </div>
          <p className="text-on-surface-variant max-w-sm">
            Empowering communities through digital democracy and transparent civic participation.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-lg font-headline">Platform</h4>
          {[
            { label: 'Discover Issues', href: '/discover' },
            { label: 'Community', href: '/community' },
            { label: 'How It Works', href: '/about' },
          ].map((link) => (
            <Link key={link.label} href={link.href} className="text-on-surface-variant hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-lg font-headline">Support</h4>
          {[
            { label: 'About', href: '/about' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
          ].map((link) => (
            <Link key={link.label} href={link.href} className="text-on-surface-variant hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto border-t border-outline-variant/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-outline text-sm">
          &copy; {new Date().getFullYear()} RallyPoint. Built for the citizens.
        </span>
        <div className="flex gap-6">
          <Globe className="text-outline cursor-pointer hover:text-primary transition-colors" size={20} />
          <MessageCircle className="text-outline cursor-pointer hover:text-primary transition-colors" size={20} />
          <Mail className="text-outline cursor-pointer hover:text-primary transition-colors" size={20} />
        </div>
      </div>
    </footer>
  )
}
