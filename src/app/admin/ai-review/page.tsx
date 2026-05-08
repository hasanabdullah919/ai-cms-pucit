import { requireRole } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import sql from '@/lib/db'
import { format } from 'date-fns'
import { StatusBadge } from '@/components/complaints/status-badge'
import { UrgencyBadge } from '@/components/complaints/urgency-badge'
import { Bot, AlertTriangle, ExternalLink } from 'lucide-react'
import { ComplaintStatus, UrgencyLevel } from '@/types'

export default async function AIReviewPage() {
  const user = await requireRole('admin')

  // Low confidence complaints (< 85%)
  type LowConfRow = { id: string; complaint_id: string; description: string; category: string; ai_suggested_category: string | null; ai_confidence: number | null; status: ComplaintStatus; urgency_level: UrgencyLevel; created_at: string }
  const lowConfidence = (await sql`
    SELECT c.*, d.name as department_name
    FROM complaints c
    LEFT JOIN departments d ON c.assigned_department_id = d.id
    WHERE c.ai_confidence < 85
      AND c.status NOT IN ('resolved', 'closed')
    ORDER BY c.ai_confidence ASC, c.created_at DESC
    LIMIT 50
  `) as LowConfRow[]

  // Potential duplicates: same category submitted in last 7 days by different submitters
  type DupRow = { id1: string; id2: string; category: string; date1: string; date2: string; status1: string; status2: string }
  const potentialDuplicates = (await sql`
    SELECT
      a.complaint_id as id1,
      b.complaint_id as id2,
      a.category,
      a.created_at as date1,
      b.created_at as date2,
      a.status as status1,
      b.status as status2
    FROM complaints a
    JOIN complaints b ON a.id < b.id
      AND a.category = b.category
      AND ABS(EXTRACT(EPOCH FROM (a.created_at - b.created_at))) < 86400 * 3
      AND a.status NOT IN ('resolved','closed')
      AND b.status NOT IN ('resolved','closed')
    ORDER BY a.created_at DESC
    LIMIT 20
  `) as DupRow[]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Review Center</h1>
            <p className="text-gray-600 text-sm">Complaints requiring manual review</p>
          </div>
        </div>

        {/* Low Confidence */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-gray-900">
              Low Confidence Classifications
            </h2>
            <span className="ml-auto bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {lowConfidence.length} complaints
            </span>
          </div>

          {lowConfidence.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Bot className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No low confidence complaints</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">ID</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">Description</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">Category</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">AI Suggests</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">Confidence</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">Urgency</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lowConfidence.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <span className="font-mono text-sm font-bold text-blue-600">{c.complaint_id}</span>
                      </td>
                      <td className="px-6 py-3 max-w-xs">
                        <p className="text-sm text-gray-700 truncate">{c.description}</p>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{c.category}</td>
                      <td className="px-6 py-3">
                        <span className="text-sm font-medium text-purple-700">{c.ai_suggested_category || '—'}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${Number(c.ai_confidence) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${c.ai_confidence}%` }}
                            />
                          </div>
                          <span className={`text-sm font-semibold ${Number(c.ai_confidence) < 50 ? 'text-red-600' : 'text-yellow-600'}`}>
                            {c.ai_confidence}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-6 py-3"><UrgencyBadge urgency={c.urgency_level} /></td>
                      <td className="px-6 py-3 text-xs text-gray-500">{format(new Date(c.created_at), 'MMM d')}</td>
                      <td className="px-6 py-3">
                        <Link href={`/admin/complaints/${c.complaint_id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <ExternalLink className="w-4 h-4" />
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Potential Duplicates */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-bold text-gray-900">Potential Duplicates</h2>
            <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {potentialDuplicates.length} pairs
            </span>
          </div>

          {potentialDuplicates.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p>No potential duplicates found</p>
            </div>
          ) : (
            <div className="divide-y">
              {potentialDuplicates.map((pair) => (
                <div key={`${pair.id1}-${pair.id2}`} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="font-mono font-bold text-blue-600">{pair.id1}</span>
                        <StatusBadge status={pair.status1 as ComplaintStatus} className="ml-2" />
                      </div>
                      <span className="text-gray-400">↔</span>
                      <div className="text-sm">
                        <span className="font-mono font-bold text-blue-600">{pair.id2}</span>
                        <StatusBadge status={pair.status2 as ComplaintStatus} className="ml-2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{pair.category}</span>
                      <div className="flex gap-2">
                        <Link href={`/admin/complaints/${pair.id1}`}>
                          <Button variant="ghost" size="sm">View {pair.id1.split('-')[2]}</Button>
                        </Link>
                        <Link href={`/admin/complaints/${pair.id2}`}>
                          <Button variant="ghost" size="sm">View {pair.id2.split('-')[2]}</Button>
                        </Link>
                      </div>
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
