'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import {
  Bell,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Bot,
  ClipboardList,
} from 'lucide-react'
import { SessionUser } from '@/types'

interface NavbarProps {
  user?: SessionUser | null
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    complaint_ref?: string;
  }>>([])

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.unread_count || 0)
        setNotifications(data.notifications || [])
      }
    } catch {
      // Ignore
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Logged out successfully')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to logout')
    }
  }

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mark_all: true }),
    })
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/complaints', label: 'Complaints', icon: ClipboardList },
    { href: '/admin/ai-review', label: 'AI Review', icon: Bot },
  ]

  const staffLinks = [
    { href: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/staff/complaints', label: 'My Cases', icon: ClipboardList },
  ]

  const studentLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/my-complaints', label: 'My Complaints', icon: FileText },
  ]

  const navLinks = user?.role === 'admin' ? adminLinks : user?.role === 'staff' ? staffLinks : studentLinks

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const initials = user?.full_name?.charAt(0)?.toUpperCase() ?? 'A'

  return (
    <nav
      className="sticky top-0 z-50 border-b shadow-sm"
      style={{ backgroundColor: '#ffffff', borderColor: '#c3c6d1', fontFamily: 'Inter, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href={user ? (user.role === 'admin' ? '/admin/dashboard' : user.role === 'staff' ? '/staff/dashboard' : '/dashboard') : '/'}
            className="flex items-center gap-2"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: '#003366', color: '#ffffff' }}
            >
              P
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold leading-tight" style={{ color: '#001e40' }}>AI-CMS PUCIT</div>
              <div className="text-[10px] leading-tight" style={{ color: '#43474f' }}>Complaint Management System</div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  style={
                    isActive(href)
                      ? { backgroundColor: '#efedee', color: '#001e40', fontWeight: 600 }
                      : { color: '#43474f' }
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Public links when not logged in */}
            {!user && (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/submit"
                  className="text-sm px-3 py-1.5 rounded transition-colors hover:bg-gray-50"
                  style={{ color: '#43474f' }}
                >
                  Submit Complaint
                </Link>
                <Link
                  href="/track"
                  className="text-sm px-3 py-1.5 rounded transition-colors hover:bg-gray-50"
                  style={{ color: '#43474f' }}
                >
                  Track
                </Link>
                <Link
                  href="/login"
                  className="text-sm px-4 py-1.5 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#003366', color: '#ffffff' }}
                >
                  Login
                </Link>
              </div>
            )}

            {user && (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications() }}
                    className="relative p-2 rounded-lg transition-colors hover:bg-gray-50"
                  >
                    <Bell className="w-5 h-5" style={{ color: '#43474f' }} />
                    {unreadCount > 0 && (
                      <span
                        className="absolute top-1 right-1 w-4 h-4 text-white text-[10px] rounded-full flex items-center justify-center font-bold"
                        style={{ backgroundColor: '#ba1a1a' }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification dropdown */}
                  {notifOpen && (
                    <div
                      className="absolute right-0 mt-2 w-80 rounded-xl shadow-lg border overflow-hidden z-50"
                      style={{ backgroundColor: '#ffffff', borderColor: '#c3c6d1' }}
                    >
                      <div
                        className="flex items-center justify-between px-4 py-3 border-b"
                        style={{ backgroundColor: '#efedee', borderColor: '#c3c6d1' }}
                      >
                        <span className="text-sm font-semibold" style={{ color: '#1b1c1d' }}>Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs hover:underline"
                            style={{ color: '#003366' }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm" style={{ color: '#43474f' }}>
                            No notifications
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((n) => (
                            <div
                              key={n.id}
                              className="px-4 py-3 border-b last:border-0 cursor-pointer"
                              style={{
                                borderColor: '#c3c6d1',
                                backgroundColor: !n.is_read ? '#f0f5ff' : '#ffffff',
                              }}
                            >
                              <div className="flex items-start gap-2">
                                {!n.is_read && (
                                  <div
                                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                                    style={{ backgroundColor: '#003366' }}
                                  />
                                )}
                                <div className={!n.is_read ? '' : 'ml-4'}>
                                  <p className="text-sm font-medium" style={{ color: '#1b1c1d' }}>{n.title}</p>
                                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#43474f' }}>{n.message}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User avatar + name */}
                <div
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: '#efedee' }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: '#003366' }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="text-xs font-medium max-w-[120px] truncate" style={{ color: '#1b1c1d' }}>
                      {user.full_name}
                    </div>
                    <div className="text-[10px] capitalize" style={{ color: '#43474f' }}>{user.role}</div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-1 px-2 py-2 rounded-lg text-sm transition-colors hover:bg-gray-50"
                  style={{ color: '#43474f' }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:block">Logout</span>
                </button>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-50"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ color: '#43474f' }}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t" style={{ backgroundColor: '#ffffff', borderColor: '#c3c6d1' }}>
          <div className="px-4 py-3 space-y-1">
            {user ? (
              <>
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
                    style={
                      isActive(href)
                        ? { backgroundColor: '#efedee', color: '#001e40' }
                        : { color: '#43474f' }
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
                <div className="pt-2 border-t" style={{ borderColor: '#c3c6d1' }}>
                  <div className="px-3 py-2 text-sm" style={{ color: '#43474f' }}>
                    {user.full_name} · <span className="capitalize">{user.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full"
                    style={{ color: '#ba1a1a' }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/submit"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium"
                  style={{ color: '#43474f' }}
                >
                  Submit Complaint
                </Link>
                <Link
                  href="/track"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium"
                  style={{ color: '#43474f' }}
                >
                  Track Complaint
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium"
                  style={{ color: '#003366' }}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Backdrop for notification dropdown */}
      {notifOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
      )}
    </nav>
  )
}
