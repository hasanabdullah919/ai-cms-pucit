import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const user = await getSession()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const staff = await sql`
      SELECT
        u.id, u.email, u.full_name, u.role, u.department_id,
        d.name as department_name,
        COUNT(c.id) as assigned_count,
        COUNT(c.id) FILTER (WHERE c.status IN ('assigned', 'in_progress')) as active_count
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN complaints c ON c.assigned_staff_id = u.id
      WHERE u.role = 'staff'
      GROUP BY u.id, u.email, u.full_name, u.role, u.department_id, d.name
      ORDER BY u.full_name
    `

    return NextResponse.json({ staff })
  } catch (error) {
    console.error('Get staff error:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}
