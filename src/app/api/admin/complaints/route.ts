import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') || '1')
    const limit = Number(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const urgency = searchParams.get('urgency')
    const search = searchParams.get('search')
    const submissionType = searchParams.get('submission_type') // anonymous, guest, registered
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    // Build dynamic query with filters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const complaints = (await sql`
      SELECT
        c.*,
        d.name as department_name,
        s.full_name as staff_name,
        sub.full_name as submitter_name
      FROM complaints c
      LEFT JOIN departments d ON c.assigned_department_id = d.id
      LEFT JOIN users s ON c.assigned_staff_id = s.id
      LEFT JOIN users sub ON c.user_id = sub.id
      WHERE 1=1
        ${status ? sql`AND c.status = ${status}` : sql``}
        ${category ? sql`AND c.category = ${category}` : sql``}
        ${urgency ? sql`AND c.urgency_level = ${urgency}` : sql``}
        ${search ? sql`AND (c.complaint_id ILIKE ${'%' + search + '%'} OR c.description ILIKE ${'%' + search + '%'})` : sql``}
        ${submissionType === 'anonymous' ? sql`AND c.is_anonymous = true` : sql``}
        ${submissionType === 'guest' ? sql`AND c.is_anonymous = false AND c.user_id IS NULL AND c.email IS NOT NULL` : sql``}
        ${submissionType === 'registered' ? sql`AND c.user_id IS NOT NULL` : sql``}
        ${dateFrom ? sql`AND c.created_at >= ${dateFrom}` : sql``}
        ${dateTo ? sql`AND c.created_at <= ${dateTo + ' 23:59:59'}` : sql``}
      ORDER BY
        CASE WHEN c.urgency_level = 'critical' THEN 1
             WHEN c.urgency_level = 'high' THEN 2
             WHEN c.urgency_level = 'medium' THEN 3
             ELSE 4 END,
        c.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as any[]

    const [{ count }] = await sql`
      SELECT COUNT(*) as count FROM complaints c
      WHERE 1=1
        ${status ? sql`AND c.status = ${status}` : sql``}
        ${category ? sql`AND c.category = ${category}` : sql``}
        ${urgency ? sql`AND c.urgency_level = ${urgency}` : sql``}
        ${search ? sql`AND (c.complaint_id ILIKE ${'%' + search + '%'} OR c.description ILIKE ${'%' + search + '%'})` : sql``}
        ${submissionType === 'anonymous' ? sql`AND c.is_anonymous = true` : sql``}
        ${submissionType === 'guest' ? sql`AND c.is_anonymous = false AND c.user_id IS NULL AND c.email IS NOT NULL` : sql``}
        ${submissionType === 'registered' ? sql`AND c.user_id IS NOT NULL` : sql``}
        ${dateFrom ? sql`AND c.created_at >= ${dateFrom}` : sql``}
        ${dateTo ? sql`AND c.created_at <= ${dateTo + ' 23:59:59'}` : sql``}
    `

    // Add submitter labels
    const complaintsWithLabels = complaints.map((c) => {
      let submitter_label = 'Anonymous'
      if (!c.is_anonymous) {
        if (c.user_id && c.submitter_name) {
          submitter_label = c.submitter_name
        } else if (!c.user_id && c.email) {
          submitter_label = `Guest: ${c.email}`
        }
      }
      return { ...c, submitter_label }
    })

    return NextResponse.json({
      complaints: complaintsWithLabels,
      total: Number(count),
      page,
      totalPages: Math.ceil(Number(count) / limit),
    })
  } catch (error) {
    console.error('Admin get complaints error:', error)
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 })
  }
}
