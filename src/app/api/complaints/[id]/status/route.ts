import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sql from '@/lib/db'
import { getSession } from '@/lib/session'

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened']),
  notes: z.string().optional(),
  resolution_details: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = updateStatusSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { status, notes, resolution_details } = parsed.data

    // Get complaint
    const [complaint] = await sql`
      SELECT * FROM complaints WHERE complaint_id = ${id}
    `
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    // Staff can only update complaints assigned to them
    if (user.role === 'staff' && complaint.assigned_staff_id !== user.id) {
      return NextResponse.json({ error: 'Not assigned to you' }, { status: 403 })
    }

    const oldStatus = complaint.status
    const resolvedAt = status === 'resolved' ? new Date().toISOString() : null

    const [updated] = await sql`
      UPDATE complaints
      SET
        status = ${status},
        resolution_details = COALESCE(${resolution_details ?? null}, resolution_details),
        resolved_at = CASE WHEN ${status} = 'resolved' THEN NOW() ELSE resolved_at END,
        updated_at = NOW()
      WHERE complaint_id = ${id}
      RETURNING *
    `

    // Insert status history
    await sql`
      INSERT INTO status_history (complaint_id, action, old_status, new_status, performed_by, notes)
      VALUES (
        ${complaint.id},
        ${`Status changed to ${status}`},
        ${oldStatus},
        ${status},
        ${user.id},
        ${notes || null}
      )
    `

    // Notify submitter
    const notifyUserId = complaint.user_id
    const notifyEmail = complaint.email
    if (notifyUserId || notifyEmail) {
      await sql`
        INSERT INTO notifications (user_id, email, complaint_id, title, message)
        VALUES (
          ${notifyUserId}, ${notifyEmail}, ${complaint.id},
          ${`Complaint ${complaint.complaint_id} Status Updated`},
          ${`Your complaint status has been updated from ${oldStatus} to ${status}.${notes ? ` Note: ${notes}` : ''}`}
        )
      `
    }

    return NextResponse.json({ complaint: updated })
  } catch (error) {
    console.error('Update status error:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
