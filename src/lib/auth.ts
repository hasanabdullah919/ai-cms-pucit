import bcrypt from 'bcryptjs'
import { getSession } from './session'
import { SessionUser, UserRole } from '@/types'
import { redirect } from 'next/navigation'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireRole(role: UserRole | UserRole[]): Promise<SessionUser> {
  const user = await requireAuth()
  const roles = Array.isArray(role) ? role : [role]
  if (!roles.includes(user.role)) {
    redirect('/dashboard')
  }
  return user
}
