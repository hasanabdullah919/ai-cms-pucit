import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [complaint] = await sql`
      SELECT
        c.*,
        d.name as department_name,
        u.full_name as staff_name,
        sub.full_name as submitter_name
      FROM complaints c
      LEFT JOIN departments d ON c.assigned_department_id = d.id
      LEFT JOIN users u ON c.assigned_staff_id = u.id
      LEFT JOIN users sub ON c.user_id = sub.id
      WHERE c.complaint_id = ${id}
    `

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    // Build submitter label
    let submitter_label = 'Anonymous'
    if (!complaint.is_anonymous) {
      if (complaint.user_id && complaint.submitter_name) {
        submitter_label = complaint.submitter_name
      } else if (!complaint.user_id && complaint.email) {
        submitter_label = `Guest: ${complaint.email}`
      }
    }

    // Get status history
    const history = await sql`
      SELECT
        sh.*,
        u.full_name as performed_by_name
      FROM status_history sh
      LEFT JOIN users u ON sh.performed_by = u.id
      WHERE sh.complaint_id = ${complaint.id}
      ORDER BY sh.created_at ASC
    `

    // Get feedback if resolved
    const feedback = await sql`
      SELECT * FROM feedback WHERE complaint_id = ${complaint.id} LIMIT 1
    `

    return NextResponse.json({
      complaint: { ...complaint, submitter_label },
      history,
      feedback: feedback[0] || null,
    })
  } catch (error) {
    console.error('Get complaint error:', error)
    return NextResponse.json({ error: 'Failed to fetch complaint' }, { status: 500 })
  }
}
