import { requireRole } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import sql from '@/lib/db'
import { format } from 'date-fns'
import { StatusBadge } from '@/components/complaints/status-badge'
import { UrgencyBadge } from '@/components/complaints/urgency-badge'
import { SubmissionBadge } from '@/components/complaints/submission-badge'
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  Bot,
  ArrowRight,
  Flame,
} from 'lucide-react'
import { ComplaintStatus, UrgencyLevel } from '@/types'

export default async function AdminDashboard() {
  const user = await requireRole('admin')

  const [stats] = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'assigned') as assigned,
      COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
      COUNT(*) FILTER (WHERE status IN ('resolved','closed')) as resolved,
      COUNT(*) FILTER (WHERE urgency_level = 'critical') as critical,
      COUNT(*) FILTER (WHERE NOW() > sla_deadline AND status NOT IN ('resolved','closed')) as overdue,
      COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today
    FROM complaints
  `

  const [avgRes] = await sql`
    SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_hours
    FROM complaints WHERE resolved_at IS NOT NULL
  `

  type RecentRow = { id: string; complaint_id: string; category: string; description: string; status: ComplaintStatus; urgency_level: UrgencyLevel; is_anonymous: boolean; user_id: string | null; email: string | null; submitter_name: string | null; department_name: string | null; created_at: string }
  const recentComplaints = (await sql`
    SELECT c.*, d.name as department_name, u.full_name as staff_name, sub.full_name as submitter_name
    FROM complaints c
    LEFT JOIN departments d ON c.assigned_department_id = d.id
    LEFT JOIN users u ON c.assigned_staff_id = u.id
    LEFT JOIN users sub ON c.user_id = sub.id
    ORDER BY c.created_at DESC
    LIMIT 8
  `) as RecentRow[]

  type CatRow = { category: string; count: string }
  const categoryStats = (await sql`
    SELECT category, COUNT(*) as count
    FROM complaints GROUP BY category ORDER BY count DESC
  `) as CatRow[]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">{format(new Date(), 'MMMM d, yyyy')}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/ai-review">
              <Button variant="outline" size="sm" className="gap-2">
                <Bot className="w-4 h-4" />
                AI Review
              </Button>
            </Link>
            <Link href="/admin/complaints">
              <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <ClipboardList className="w-4 h-4" />
                All Complaints
              </Button>
            </Link>
          </div>
        </div>

        {/* Alert for critical/overdue */}
        {(Number(stats.critical) > 0 || Number(stats.overdue) > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <Flame className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Attention Required</p>
                <p className="text-sm text-red-700">
                  {Number(stats.critical) > 0 && `${stats.critical} critical complaint(s) need immediate attention. `}
                  {Number(stats.overdue) > 0 && `${stats.overdue} complaint(s) have exceeded SLA deadline.`}
                </p>
                <Link href="/admin/complaints?urgency=critical" className="inline-block mt-2">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1 h-7 text-xs">
                    View Now <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: ClipboardList, color: 'bg-blue-50 text-blue-600', num: 'text-blue-900' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-50 text-yellow-600', num: 'text-yellow-900' },
            { label: 'In Progress', value: stats.in_progress, icon: TrendingUp, color: 'bg-purple-50 text-purple-600', num: 'text-purple-900' },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'bg-green-50 text-green-600', num: 'text-green-900' },
            { label: 'Assigned', value: stats.assigned, icon: Users, color: 'bg-indigo-50 text-indigo-600', num: 'text-indigo-900' },
            { label: 'Critical', value: stats.critical, icon: Flame, color: 'bg-red-50 text-red-600', num: 'text-red-900' },
            { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'bg-orange-50 text-orange-600', num: 'text-orange-900' },
            {
              label: 'Avg Resolution',
              value: avgRes.avg_hours ? `${Math.round(Number(avgRes.avg_hours))}h` : 'N/A',
              icon: Clock,
              color: 'bg-teal-50 text-teal-600',
              num: 'text-teal-900',
            },
          ].map(({ label, value, icon: Icon, color, num }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className={`text-2xl font-bold ${num}`}>{value?.toString()}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent complaints */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-base font-bold text-gray-900">Recent Complaints</h2>
              <Link href="/admin/complaints">
                <Button variant="ghost" size="sm" className="gap-1 text-blue-600">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="divide-y">
              {recentComplaints.map((c) => (
                <div key={c.id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/admin/complaints/${c.complaint_id}`}
                          className="font-mono text-sm font-bold text-blue-600 hover:underline"
                        >
                          {c.complaint_id}
                        </Link>
                        <SubmissionBadge
                          isAnonymous={c.is_anonymous}
                          userId={c.user_id}
                          email={c.email}
                        />
                        <span className="text-xs text-gray-400">{c.category}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-0.5">{c.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge status={c.status} />
                      <UrgencyBadge urgency={c.urgency_level} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">By Category</h2>
            <div className="space-y-3">
              {categoryStats.map((cat) => {
                const pct = Math.round((Number(cat.count) / Number(stats.total)) * 100) || 0
                return (
                  <div key={cat.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{cat.category}</span>
                      <span className="text-gray-500">{cat.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick links */}
            <div className="mt-6 pt-4 border-t space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Links</p>
              {[
                { href: '/admin/complaints?status=pending', label: 'Pending Review' },
                { href: '/admin/complaints?urgency=critical', label: 'Critical Issues' },
                { href: '/admin/ai-review', label: 'AI Low Confidence' },
              ].map(({ href, label }) => (
                <Link key={href} href={href}>
                  <Button variant="ghost" size="sm" className="w-full justify-between text-gray-700 hover:bg-blue-50">
                    {label}
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
