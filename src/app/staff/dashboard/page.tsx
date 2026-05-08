import { requireRole } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { StatusBadge } from '@/components/complaints/status-badge'
import { UrgencyBadge } from '@/components/complaints/urgency-badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import sql from '@/lib/db'
import { format } from 'date-fns'
import {
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { ComplaintStatus, UrgencyLevel } from '@/types'

export default async function StaffDashboard() {
  const user = await requireRole(['staff', 'admin'])

  const [stats] = await sql`
    SELECT
      COUNT(*) as total_assigned,
      COUNT(*) FILTER (WHERE status = 'assigned') as assigned,
      COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
      COUNT(*) FILTER (WHERE NOW() > sla_deadline AND status NOT IN ('resolved','closed')) as overdue,
      COUNT(*) FILTER (WHERE status IN ('resolved','closed')) as completed
    FROM complaints
    WHERE assigned_staff_id = ${user.id}
  `

  const assignedComplaints = await sql`
    SELECT c.*, d.name as department_name
    FROM complaints c
    LEFT JOIN departments d ON c.assigned_department_id = d.id
    WHERE c.assigned_staff_id = ${user.id}
      AND c.status NOT IN ('resolved','closed')
    ORDER BY
      CASE WHEN urgency_level = 'critical' THEN 1
           WHEN urgency_level = 'high' THEN 2
           WHEN NOW() > sla_deadline THEN 3
           ELSE 4 END,
      c.created_at ASC
    LIMIT 10
  `

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user.full_name.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 text-sm mt-1">Your assigned cases overview</p>
          </div>
          <Link href="/staff/complaints">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" size="sm">
              <ClipboardList className="w-4 h-4" />
              All My Cases
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Assigned', value: stats.total_assigned, icon: ClipboardList, color: 'bg-blue-50 text-blue-600', num: 'text-blue-900' },
            { label: 'Assigned', value: stats.assigned, icon: Clock, color: 'bg-yellow-50 text-yellow-600', num: 'text-yellow-900' },
            { label: 'In Progress', value: stats.in_progress, icon: AlertTriangle, color: 'bg-purple-50 text-purple-600', num: 'text-purple-900' },
            { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'bg-red-50 text-red-600', num: 'text-red-900' },
          ].map(({ label, value, icon: Icon, color, num }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className={`text-2xl font-bold ${num}`}>{Number(value)}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Active complaints */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-base font-bold text-gray-900">Active Cases</h2>
            <Link href="/staff/complaints">
              <Button variant="ghost" size="sm" className="gap-1 text-blue-600">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {assignedComplaints.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">All caught up!</p>
              <p className="text-sm text-gray-400 mt-1">No active cases assigned to you</p>
            </div>
          ) : (
            <div className="divide-y">
              {assignedComplaints.map((c: {
                id: string;
                complaint_id: string;
                category: string;
                description: string;
                status: ComplaintStatus;
                urgency_level: UrgencyLevel;
                department_name: string | null;
                created_at: string;
                sla_deadline: string;
              }) => {
                const isOverdue = new Date() > new Date(c.sla_deadline) && !['resolved','closed'].includes(c.status)
                return (
                  <div key={c.id} className={`px-6 py-4 hover:bg-gray-50 transition-colors ${isOverdue ? 'bg-red-50' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/staff/complaint/${c.complaint_id}`} className="font-mono text-sm font-bold text-blue-600 hover:underline">
                            {c.complaint_id}
                          </Link>
                          <span className="text-xs text-gray-400">{c.category}</span>
                          {isOverdue && (
                            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">OVERDUE</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 truncate">{c.description}</p>
                        <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due {format(new Date(c.sla_deadline), 'MMM d')}</span>
                          <span>Received {format(new Date(c.created_at), 'MMM d')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <StatusBadge status={c.status} />
                        <UrgencyBadge urgency={c.urgency_level} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
