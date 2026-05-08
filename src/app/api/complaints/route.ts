import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sql from '@/lib/db'
import { getSession } from '@/lib/session'
import { classifyComplaint } from '@/lib/ai'

const submitSchema = z.object({
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(['Academic', 'Financial', 'IT', 'Harassment', 'Hostel', 'Infrastructure', 'Other']),
  is_anonymous: z.boolean().default(false),
  email: z.string().email().optional().or(z.literal('')),
  is_urgent: z.boolean().default(false),
  evidence_urls: z.array(z.string()).default([]),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = submitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { description, category, is_anonymous, email, is_urgent, evidence_urls } = parsed.data

    // Get logged in user if any
    const sessionUser = await getSession()

    // Generate complaint ID
    const year = new Date().getFullYear()
    const countResult = await sql`SELECT COUNT(*) as count FROM complaints WHERE EXTRACT(YEAR FROM created_at) = ${year}`
    const seq = Number(countResult[0].count) + 1
    const complaintId = `CMP-${year}-${String(seq).padStart(5, '0')}`

    // AI classification
    const aiResult = await classifyComplaint(description, category)

    // Use AI urgency if complaint is marked urgent, escalate to at least high
    let urgencyLevel = aiResult.urgency
    if (is_urgent && urgencyLevel === 'low') urgencyLevel = 'medium'
    if (is_urgent && urgencyLevel === 'medium') urgencyLevel = 'high'

    // Determine final category (use AI suggestion if confidence > 85%)
    const finalCategory = aiResult.confidence > 85 ? aiResult.category : category

    // Determine email for the complaint
    const complaintEmail = is_anonymous ? null : (sessionUser?.email || email || null)
    const userId = is_anonymous ? null : (sessionUser?.id || null)

    const [complaint] = await sql`
      INSERT INTO complaints (
        complaint_id, user_id, email, is_anonymous, category,
        ai_suggested_category, ai_confidence, description, urgency_level,
        status, evidence_urls
      )
      VALUES (
        ${complaintId}, ${userId}, ${complaintEmail}, ${is_anonymous}, ${finalCategory},
        ${aiResult.category}, ${aiResult.confidence}, ${description}, ${urgencyLevel},
        'pending', ${evidence_urls}
      )
      RETURNING id, complaint_id
    `

    // Insert initial status history
    await sql`
      INSERT INTO status_history (complaint_id, action, old_status, new_status, performed_by, notes)
      VALUES (
        ${complaint.id}, 'submitted', NULL, 'pending', ${userId},
        ${`Complaint submitted. AI Classification: ${aiResult.category} (${aiResult.confidence}% confidence). ${aiResult.reasoning}`}
      )
    `

    // Create notification for admin
    const admins = await sql`SELECT id FROM users WHERE role = 'admin'`
    for (const admin of admins) {
      await sql`
        INSERT INTO notifications (user_id, complaint_id, title, message)
        VALUES (
          ${admin.id}, ${complaint.id},
          'New Complaint Submitted',
          ${`New complaint ${complaintId} submitted in category ${finalCategory} with ${urgencyLevel} urgency.`}
        )
      `
    }

    return NextResponse.json({
      complaint_id: complaint.complaint_id,
      id: complaint.id,
      ai_category: aiResult.category,
      ai_confidence: aiResult.confidence,
      urgency: urgencyLevel,
    }, { status: 201 })
  } catch (error) {
    console.error('Submit complaint error:', error)
    return NextResponse.json({ error: 'Failed to submit complaint' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') || '1')
    const limit = Number(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const complaints = await sql`
      SELECT
        c.*,
        d.name as department_name,
        u.full_name as staff_name
      FROM complaints c
      LEFT JOIN departments d ON c.assigned_department_id = d.id
      LEFT JOIN users u ON c.assigned_staff_id = u.id
      WHERE c.user_id = ${user.id}
      ORDER BY c.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const [{ count }] = await sql`
      SELECT COUNT(*) as count FROM complaints WHERE user_id = ${user.id}
    `

    return NextResponse.json({
      complaints,
      total: Number(count),
      page,
      totalPages: Math.ceil(Number(count) / limit),
    })
  } catch (error) {
    console.error('Get complaints error:', error)
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 })
  }
}
