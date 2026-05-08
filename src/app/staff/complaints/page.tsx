import { requireRole } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { StatusBadge } from '@/components/complaints/status-badge'
import { UrgencyBadge } from '@/components/complaints/urgency-badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import sql from '@/lib/db'
import { format } from 'date-fns'
import { Clock, ExternalLink } from 'lucide-react'
import { ComplaintStatus, UrgencyLevel } from '@/types'

export default async function StaffComplaintsPage() {
  const user = await requireRole(['staff', 'admin'])

  const complaints = await sql`
    SELECT c.*, d.name as department_name
    FROM complaints c
    LEFT JOIN departments d ON c.assigned_department_id = d.id
    WHERE c.assigned_staff_id = ${user.id}
    ORDER BY
      CASE WHEN c.status IN ('resolved','closed') THEN 1 ELSE 0 END,
      CASE WHEN c.urgency_level = 'critical' THEN 1
           WHEN c.urgency_level = 'high' THEN 2
           WHEN c.urgency_level = 'medium' THEN 3
           ELSE 4 END,
      c.created_at ASC
  `

  const active = complaints.filter((c: { status: string }) => !['resolved','closed'].includes(c.status))
  const resolved = complaints.filter((c: { status: string }) => ['resolved','closed'].includes(c.status))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Assigned Cases</h1>
            <p className="text-gray-600 text-sm mt-1">
              {active.length} active · {resolved.length} completed
            </p>
          </div>
        </div>

        {/* Active cases */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="px-6 py-4 border-b">
            <h2 className="text-base font-bold text-gray-900">Active Cases ({active.length})</h2>
          </div>

          {active.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">No active cases</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase">ID</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase">Description</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase">Category</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase">Urgency</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase">SLA Deadline</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {active.map((c: {
                    id: string;
                    complaint_id: string;
                    description: string;
                    category: string;
                    status: ComplaintStatus;
                    urgency_level: UrgencyLevel;
                    sla_deadline: string;
                  }) => {
                    const isOverdue = new Date() > new Date(c.sla_deadline)
                    return (
                      <tr key={c.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                        <td className="px-6 py-3">
                          <span className="font-mono text-sm font-bold text-blue-600">{c.complaint_id}</span>
                          {isOverdue && <span className="block text-xs text-red-600 font-medium">OVERDUE</span>}
                        </td>
                        <td className="px-6 py-3 max-w-xs">
                          <p className="text-sm text-gray-700 truncate">{c.description}</p>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">{c.category}</td>
                        <td className="px-6 py-3"><StatusBadge status={c.status} /></td>
                        <td className="px-6 py-3"><UrgencyBadge urgency={c.urgency_level} /></td>
                        <td className="px-6 py-3">
                          <span className={`text-sm flex items-center gap-1 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(c.sla_deadline), 'MMM d, yyyy')}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <Link href={`/staff/complaint/${c.complaint_id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <ExternalLink className="w-4 h-4" />
                              Manage
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resolved cases */}
        {resolved.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b">
              <h2 className="text-base font-bold text-gray-900">Completed ({resolved.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase">ID</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase">Category</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase">Resolved</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {resolved.slice(0, 10).map((c: {
                    id: string;
                    complaint_id: string;
                    category: string;
                    status: ComplaintStatus;
                    resolved_at: string | null;
                  }) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <span className="font-mono text-sm font-bold text-gray-600">{c.complaint_id}</span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{c.category}</td>
                      <td className="px-6 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-6 py-3 text-sm text-gray-500">
                        {c.resolved_at ? format(new Date(c.resolved_at), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-6 py-3">
                        <Link href={`/staff/complaint/${c.complaint_id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
