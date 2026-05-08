import { requireAuth } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { StatusBadge } from '@/components/complaints/status-badge'
import { UrgencyBadge } from '@/components/complaints/urgency-badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import sql from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
} from 'lucide-react'
import { ComplaintStatus, UrgencyLevel } from '@/types'

export default async function DashboardPage() {
  const user = await requireAuth()

  const [stats] = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status IN ('assigned', 'in_progress')) as active,
      COUNT(*) FILTER (WHERE status IN ('resolved', 'closed')) as resolved
    FROM complaints
    WHERE user_id = ${user.id}
  `

  const recentComplaints = await sql`
    SELECT c.*, d.name as department_name
    FROM complaints c
    LEFT JOIN departments d ON c.assigned_department_id = d.id
    WHERE c.user_id = ${user.id}
    ORDER BY c.created_at DESC
    LIMIT 5
  `

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.full_name.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here&apos;s an overview of your complaints
            </p>
          </div>
          <Link href="/submit">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <PlusCircle className="w-4 h-4" />
              New Complaint
            </Button>
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total',
              value: stats.total,
              icon: ClipboardList,
              color: 'bg-blue-50 text-blue-600',
              textColor: 'text-blue-900',
            },
            {
              label: 'Pending',
              value: stats.pending,
              icon: Clock,
              color: 'bg-yellow-50 text-yellow-600',
              textColor: 'text-yellow-900',
            },
            {
              label: 'In Progress',
              value: stats.active,
              icon: AlertTriangle,
              color: 'bg-purple-50 text-purple-600',
              textColor: 'text-purple-900',
            },
            {
              label: 'Resolved',
              value: stats.resolved,
              icon: CheckCircle,
              color: 'bg-green-50 text-green-600',
              textColor: 'text-green-900',
            },
          ].map(({ label, value, icon: Icon, color, textColor }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className={`text-2xl font-bold ${textColor}`}>{Number(value)}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Recent Complaints */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-base font-bold text-gray-900">Recent Complaints</h2>
            <Link href="/my-complaints">
              <Button variant="ghost" size="sm" className="gap-1 text-blue-600">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {recentComplaints.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No complaints yet</p>
              <p className="text-sm text-gray-400 mt-1">Submit your first complaint to get started</p>
              <Link href="/submit" className="inline-block mt-4">
                <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <PlusCircle className="w-4 h-4" />
                  Submit Complaint
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {recentComplaints.map((c: {
                id: string;
                complaint_id: string;
                category: string;
                description: string;
                status: ComplaintStatus;
                urgency_level: UrgencyLevel;
                department_name: string | null;
                created_at: string;
              }) => (
                <div key={c.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-semibold text-blue-600">{c.complaint_id}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-500">{c.category}</span>
                      </div>
                      <p className="text-sm text-gray-700 truncate">{c.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {c.department_name && (
                          <span className="text-xs text-gray-400">{c.department_name}</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <StatusBadge status={c.status} />
                      <UrgencyBadge urgency={c.urgency_level} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
