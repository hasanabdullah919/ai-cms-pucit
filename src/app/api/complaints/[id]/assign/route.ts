import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sql from '@/lib/db'
import { getSession } from '@/lib/session'

const assignSchema = z.object({
  department_id: z.string().uuid().optional().nullable(),
  staff_id: z.string().uuid().optional().nullable(),
  category: z.enum(['Academic', 'Financial', 'IT', 'Harassment', 'Hostel', 'Infrastructure', 'Other']).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = assignSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { department_id, staff_id, category } = parsed.data

    const [complaint] = await sql`SELECT * FROM complaints WHERE complaint_id = ${id}`
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    const oldStatus = complaint.status
    const newStatus = staff_id ? 'assigned' : oldStatus

    const [updated] = await sql`
      UPDATE complaints
      SET
        assigned_department_id = COALESCE(${department_id ?? null}, assigned_department_id),
        assigned_staff_id = ${staff_id !== undefined ? staff_id : complaint.assigned_staff_id},
        category = COALESCE(${category ?? null}, category),
        status = ${newStatus},
        updated_at = NOW()
      WHERE complaint_id = ${id}
      RETURNING *
    `

    // Log assignment
    await sql`
      INSERT INTO status_history (complaint_id, action, old_status, new_status, performed_by, notes)
      VALUES (
        ${complaint.id},
        'Assignment updated',
        ${oldStatus},
        ${newStatus},
        ${user.id},
        ${[
          department_id ? `Department assigned` : null,
          staff_id ? `Staff assigned` : null,
          category ? `Category updated to ${category}` : null,
        ].filter(Boolean).join(', ')}
      )
    `

    // Notify assigned staff
    if (staff_id) {
      await sql`
        INSERT INTO notifications (user_id, complaint_id, title, message)
        VALUES (
          ${staff_id}, ${complaint.id},
          'New Complaint Assigned',
          ${`Complaint ${complaint.complaint_id} has been assigned to you.`}
        )
      `
    }

    return NextResponse.json({ complaint: updated })
  } catch (error) {
    console.error('Assign complaint error:', error)
    return NextResponse.json({ error: 'Failed to assign complaint' }, { status: 500 })
  }
}
