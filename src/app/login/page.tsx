'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error || 'Login failed')
        return
      }

      toast.success(`Welcome back, ${json.user.full_name}!`)

      // Redirect based on role
      if (json.user.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (json.user.role === 'staff') {
        router.push('/staff/dashboard')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#fbf9fa', fontFamily: 'Inter, sans-serif', color: '#1b1c1d' }}
    >
      {/* Navbar */}
      <nav
        className="border-b"
        style={{ backgroundColor: '#ffffff', borderColor: '#c3c6d1' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight"
            style={{ color: '#001e40' }}
          >
            AI-CMS PUCIT
          </Link>
          <Link
            href="/submit"
            className="text-sm transition-colors hover:bg-gray-50 px-3 py-1.5 rounded"
            style={{ color: '#43474f' }}
          >
            Submit Complaint
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold"
              style={{ backgroundColor: '#003366', color: '#ffffff' }}
            >
              P
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#001e40' }}>AI-CMS PUCIT</h1>
            <p className="mt-1 text-sm" style={{ color: '#43474f' }}>Sign in to your account</p>
          </div>

          {/* Card */}
          <div
            className="rounded-xl shadow-sm border p-8"
            style={{ backgroundColor: '#ffffff', borderColor: '#c3c6d1' }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1b1c1d' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="you@pucit.edu.pk"
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-all"
                  style={{
                    border: `1px solid #c3c6d1`,
                    backgroundColor: '#ffffff',
                    color: '#1b1c1d',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#003366'
                    e.target.style.boxShadow = '0 0 0 2px rgba(0,51,102,0.15)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#c3c6d1'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                {errors.email && <p className="text-xs mt-1" style={{ color: '#ba1a1a' }}>{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1b1c1d' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className="w-full rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none transition-all"
                    style={{
                      border: `1px solid #c3c6d1`,
                      backgroundColor: '#ffffff',
                      color: '#1b1c1d',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#003366'
                      e.target.style.boxShadow = '0 0 0 2px rgba(0,51,102,0.15)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#c3c6d1'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: '#43474f' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs mt-1" style={{ color: '#ba1a1a' }}>{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
                style={{ backgroundColor: '#003366', color: '#ffffff' }}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Sign In
              </button>
            </form>

            {/* Demo credentials */}
            <div
              className="mt-6 p-4 rounded-lg border"
              style={{ backgroundColor: '#efedee', borderColor: '#c3c6d1' }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: '#43474f' }}>Demo Credentials:</p>
              <div className="space-y-1 text-xs" style={{ color: '#43474f' }}>
                <p><span className="font-medium">Admin:</span> admin@ai-cms.pucit.edu.pk / Admin@123</p>
                <p><span className="font-medium">Staff:</span> staff.academic@ai-cms.pucit.edu.pk / Staff@123</p>
                <p><span className="font-medium">Student:</span> student@example.com / student123</p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: '#43474f' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold hover:underline" style={{ color: '#003366' }}>
              Register here
            </Link>
          </p>
          <p className="text-center text-sm mt-2" style={{ color: '#43474f' }}>
            Or{' '}
            <Link href="/submit" className="hover:underline" style={{ color: '#003366' }}>
              submit without an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
