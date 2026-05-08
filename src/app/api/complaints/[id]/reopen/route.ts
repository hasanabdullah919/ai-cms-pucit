import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sql from '@/lib/db'
import { differenceInDays } from 'date-fns'

const reopenSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason for reopening (min 10 characters)'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = reopenSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { reason } = parsed.data

    const [complaint] = await sql`SELECT * FROM complaints WHERE complaint_id = ${id}`
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    if (complaint.status !== 'resolved') {
      return NextResponse.json(
        { error: 'Only resolved complaints can be reopened' },
        { status: 400 }
      )
    }

    // Check if within 7 days of resolution
    if (complaint.resolved_at) {
      const daysSinceResolution = differenceInDays(new Date(), new Date(complaint.resolved_at))
      if (daysSinceResolution > 7) {
        return NextResponse.json(
          { error: 'Complaints can only be reopened within 7 days of resolution' },
          { status: 400 }
        )
      }
    }

    const [updated] = await sql`
      UPDATE complaints
      SET status = 'reopened', resolved_at = NULL, updated_at = NOW()
      WHERE complaint_id = ${id}
      RETURNING *
    `

    await sql`
      INSERT INTO status_history (complaint_id, action, old_status, new_status, notes)
      VALUES (
        ${complaint.id},
        'Complaint reopened',
        'resolved',
        'reopened',
        ${reason}
      )
    `

    // Notify admins
    const admins = await sql`SELECT id FROM users WHERE role = 'admin'`
    for (const admin of admins) {
      await sql`
        INSERT INTO notifications (user_id, complaint_id, title, message)
        VALUES (
          ${admin.id}, ${complaint.id},
          ${`Complaint ${complaint.complaint_id} Reopened`},
          ${`A complaint has been reopened. Reason: ${reason}`}
        )
      `
    }

    return NextResponse.json({ complaint: updated })
  } catch (error) {
    console.error('Reopen complaint error:', error)
    return NextResponse.json({ error: 'Failed to reopen complaint' }, { status: 500 })
  }
}
