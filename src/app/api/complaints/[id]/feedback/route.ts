import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sql from '@/lib/db'

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = feedbackSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { rating, comment } = parsed.data

    // Get complaint by complaint_id
    const [complaint] = await sql`SELECT * FROM complaints WHERE complaint_id = ${id}`
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    if (complaint.status !== 'resolved' && complaint.status !== 'closed') {
      return NextResponse.json(
        { error: 'Feedback can only be submitted for resolved complaints' },
        { status: 400 }
      )
    }

    // Check if feedback already submitted
    const existing = await sql`SELECT id FROM feedback WHERE complaint_id = ${complaint.id}`
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Feedback already submitted for this complaint' },
        { status: 409 }
      )
    }

    const [feedback] = await sql`
      INSERT INTO feedback (complaint_id, rating, comment)
      VALUES (${complaint.id}, ${rating}, ${comment || null})
      RETURNING *
    `

    return NextResponse.json({ feedback }, { status: 201 })
  } catch (error) {
    console.error('Submit feedback error:', error)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
