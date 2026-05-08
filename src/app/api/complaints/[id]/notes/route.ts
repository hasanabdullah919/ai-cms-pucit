import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sql from '@/lib/db'
import { getSession } from '@/lib/session'

const noteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  note_type: z.enum(['internal', 'public']).default('internal'),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const [complaint] = await sql`SELECT id FROM complaints WHERE complaint_id = ${id}`
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    const notes = await sql`
      SELECT
        cn.*,
        u.full_name as author_name,
        u.role as author_role
      FROM complaint_notes cn
      LEFT JOIN users u ON cn.author_id = u.id
      WHERE cn.complaint_id = ${complaint.id}
      ORDER BY cn.created_at DESC
    `

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Get notes error:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(
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
    const parsed = noteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { content, note_type } = parsed.data

    const [complaint] = await sql`SELECT id FROM complaints WHERE complaint_id = ${id}`
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    const [note] = await sql`
      INSERT INTO complaint_notes (complaint_id, author_id, note_type, content)
      VALUES (${complaint.id}, ${user.id}, ${note_type}, ${content})
      RETURNING *
    `

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('Add note error:', error)
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 })
  }
}
