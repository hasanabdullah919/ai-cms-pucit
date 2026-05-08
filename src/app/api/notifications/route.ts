import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await sql`
      SELECT
        n.*,
        c.complaint_id as complaint_ref
      FROM notifications n
      LEFT JOIN complaints c ON n.complaint_id = c.id
      WHERE n.user_id = ${user.id}
      ORDER BY n.created_at DESC
      LIMIT 50
    `

    const [{ count }] = await sql`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ${user.id} AND is_read = false
    `

    return NextResponse.json({
      notifications,
      unread_count: Number(count),
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notification_id, mark_all } = body

    if (mark_all) {
      await sql`
        UPDATE notifications SET is_read = true
        WHERE user_id = ${user.id}
      `
    } else if (notification_id) {
      await sql`
        UPDATE notifications SET is_read = true
        WHERE id = ${notification_id} AND user_id = ${user.id}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark notification error:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
