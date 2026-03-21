'use client'

import { useState } from 'react'
import Image from 'next/image'
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
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-slate-200 bg-white">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">RallyPoint</span>
          </div>

          {/* User info */}
          {user && (
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.displayName}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-600">
                      {user.displayName[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium text-slate-900">{user.displayName}</p>
                  {user.primaryAddress && (
                    <p className="truncate text-xs text-slate-500">
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
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {active && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-600" />
                  )}
                </Link>
              )
            })}

            {/* Admin section */}
            {visibleAdminItems.length > 0 && (
              <>
                <div className="my-4 border-t border-slate-200 pt-4">
                  <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          active
                            ? 'bg-orange-50 text-orange-700'
                            : 'text-slate-700 hover:bg-slate-100'
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
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-200 ease-in-out lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900">RallyPoint</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile navigation - same as desktop */}
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
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-slate-700 hover:bg-slate-100'
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-700 hover:text-slate-900"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">RallyPoint</span>
          </div>

          <div className="w-6" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white lg:hidden">
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
                    active ? 'text-orange-600' : 'text-slate-600'
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
    </div>
  )
}
