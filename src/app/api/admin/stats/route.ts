import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const user = await getSession()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const [totals] = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'assigned') as assigned,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) FILTER (WHERE status = 'closed') as closed,
        COUNT(*) FILTER (WHERE status = 'reopened') as reopened,
        COUNT(*) FILTER (WHERE urgency_level = 'critical') as critical,
        COUNT(*) FILTER (WHERE urgency_level = 'high') as high_urgency,
        COUNT(*) FILTER (WHERE NOW() > sla_deadline AND status NOT IN ('resolved', 'closed')) as overdue
      FROM complaints
    `

    // Average resolution time (in hours)
    const [avgResolution] = await sql`
      SELECT
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_hours
      FROM complaints
      WHERE status IN ('resolved', 'closed') AND resolved_at IS NOT NULL
    `

    // Category breakdown
    const categoryStats = await sql`
      SELECT category, COUNT(*) as count
      FROM complaints
      GROUP BY category
      ORDER BY count DESC
    `

    // Recent trend (last 7 days)
    const trend = await sql`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as submitted,
        COUNT(*) FILTER (WHERE status IN ('resolved', 'closed')) as resolved
      FROM complaints
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // Today's stats
    const [today] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as submitted_today,
        COUNT(*) FILTER (WHERE DATE(resolved_at) = CURRENT_DATE) as resolved_today
      FROM complaints
    `

    return NextResponse.json({
      totals: {
        total: Number(totals.total),
        pending: Number(totals.pending),
        assigned: Number(totals.assigned),
        in_progress: Number(totals.in_progress),
        resolved: Number(totals.resolved),
        closed: Number(totals.closed),
        reopened: Number(totals.reopened),
        critical: Number(totals.critical),
        high_urgency: Number(totals.high_urgency),
        overdue: Number(totals.overdue),
      },
      avg_resolution_hours: avgResolution.avg_hours ? Math.round(Number(avgResolution.avg_hours)) : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      category_stats: (categoryStats as any[]).map((c) => ({
        category: c.category,
        count: Number(c.count),
      })),
      trend,
      today: {
        submitted: Number(today.submitted_today),
        resolved: Number(today.resolved_today),
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
