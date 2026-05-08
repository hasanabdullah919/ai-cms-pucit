import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sql from '@/lib/db'
import { verifyPassword } from '@/lib/auth'
import { createSession, setSessionOnResponse } from '@/lib/session'
import { SessionUser } from '@/types'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { email, password } = parsed.data

    const [user] = await sql`
      SELECT id, email, full_name, role, department_id, password_hash
      FROM users WHERE email = ${email}
    `

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const isValid = await verifyPassword(password, user.password_hash as string)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const sessionUser: SessionUser = {
      id: user.id as string,
      email: user.email as string,
      full_name: user.full_name as string,
      role: user.role as SessionUser['role'],
      department_id: user.department_id as string | null,
    }

    const token = await createSession(sessionUser)
    const response = NextResponse.json({ user: sessionUser })
    return setSessionOnResponse(response, token)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Login error:', msg)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
