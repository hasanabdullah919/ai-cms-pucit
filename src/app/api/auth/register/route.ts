import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sql from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { createSession, setSessionCookie } from '@/lib/session'
import { SessionUser } from '@/types'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password, full_name } = parsed.data

    // Check if user already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const password_hash = await hashPassword(password)

    const [user] = await sql`
      INSERT INTO users (email, full_name, password_hash, role)
      VALUES (${email}, ${full_name}, ${password_hash}, 'student')
      RETURNING id, email, full_name, role, department_id
    `

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      department_id: user.department_id,
    }

    const token = await createSession(sessionUser)
    await setSessionCookie(token)

    return NextResponse.json({ user: sessionUser }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
