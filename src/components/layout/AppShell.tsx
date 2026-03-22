'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  Home,
  Compass,
  TrendingUp,
  Bookmark,
  Users,
  User,
  LayoutDashboard,
  Shield,
  Menu,
  X,
} from 'lucide-react'
import { UserRole } from '@prisma/client'
import { FloatingContactButton } from './FloatingContactButton'

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  requiresRole?: UserRole[]
}

interface AppShellProps {
  user?: {
    id: string
    displayName: string
    avatarUrl: string | null
    role: UserRole
    primaryAddress?: {
      city: string
      state: string
    } | null
  }
  children: React.ReactNode
}

const RallyPointLogo = () => (
  <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" />
  </svg>
)

export function AppShell({ user, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { icon: Home, label: 'Home', href: '/feed' },
    { icon: Compass, label: 'Discover', href: '/discover' },
    { icon: TrendingUp, label: 'My Impact', href: '/impact' },
    { icon: Bookmark, label: 'Saved', href: '/saved' },
    { icon: Users, label: 'Community', href: '/community' },
    { icon: User, label: 'Profile', href: '/profile' },
  ]

  const adminNavItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/admin/dashboard',
      requiresRole: ['ORGANIZER', 'ADMIN'],
    },
    {
      icon: Shield,
      label: 'Moderation',
      href: '/admin/moderation',
      requiresRole: ['MODERATOR', 'ADMIN'],
    },
  ]

  const visibleAdminItems = adminNavItems.filter((item) =>
    item.requiresRole?.includes(user?.role as UserRole)
  )

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed' || pathname === '/'
    return pathname?.startsWith(href)
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-outline-variant/15 bg-surface-container-lowest">
          {/* Logo */}
          <Link href="/" className="flex h-16 items-center gap-3 border-b border-outline-variant/15 px-6">
            <div className="size-6 text-primary">
              <RallyPointLogo />
            </div>
            <span className="text-xl font-bold tracking-tight text-on-surface font-headline">RallyPoint</span>
          </Link>

          {/* User info */}
          {user && (
            <div className="border-b border-outline-variant/15 p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-surface-container-high">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-medium text-on-surface-variant">
                      {user.displayName[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium text-on-surface">{user.displayName}</p>
                  {user.primaryAddress && (
                    <p className="truncate text-xs text-on-surface-variant">
                      {user.primaryAddress.city}, {user.primaryAddress.state}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/8 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {active && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              )
            })}

            {/* Admin section */}
            {visibleAdminItems.length > 0 && (
              <>
                <div className="my-4 border-t border-outline-variant/15 pt-4">
                  <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Admin
                  </p>
                  {visibleAdminItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary/8 text-primary'
                            : 'text-on-surface-variant hover:bg-surface-container-high'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </>
            )}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-on-surface/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-surface-container-lowest transition-transform duration-200 ease-in-out lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-outline-variant/15 px-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="size-6 text-primary">
                <RallyPointLogo />
              </div>
              <span className="text-xl font-bold tracking-tight text-on-surface font-headline">RallyPoint</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/8 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant/15 bg-surface/80 backdrop-blur-md px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex items-center gap-3">
            <div className="size-6 text-primary">
              <RallyPointLogo />
            </div>
            <span className="text-xl font-bold tracking-tight text-on-surface font-headline">RallyPoint</span>
          </Link>

          <div className="w-6" />
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-outline-variant/15 bg-surface-container-lowest lg:hidden">
          <div className="flex items-center justify-around">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-3 text-xs font-medium transition-colors',
                    active ? 'text-primary' : 'text-on-surface-variant'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Floating Contact Button */}
      <FloatingContactButton />
    </div>
  )
}
