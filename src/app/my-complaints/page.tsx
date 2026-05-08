'use client'

import { useState, useEffect, useCallback } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { StatusBadge } from '@/components/complaints/status-badge'
import { UrgencyBadge } from '@/components/complaints/urgency-badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import {
  ClipboardList,
  Search,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  ExternalLink,
} from 'lucide-react'
import { SessionUser, ComplaintStatus, UrgencyLevel } from '@/types'

interface Complaint {
  id: string
  complaint_id: string
  category: string
  description: string
  status: ComplaintStatus
  urgency_level: UrgencyLevel
  department_name: string | null
  created_at: string
  resolved_at: string | null
}

export default function MyComplaintsPage() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user))
  }, [])

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' })
      const res = await fetch(`/api/complaints?${params}`)
      const data = await res.json()
      setComplaints(data.complaints || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchComplaints() }, [fetchComplaints])

  const filtered = complaints.filter(c => {
    const matchStatus = !statusFilter || c.status === statusFilter
    const matchSearch = !search ||
      c.complaint_id.includes(search.toUpperCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
            <p className="text-gray-600 text-sm mt-1">{total} complaint{total !== 1 ? 's' : ''} total</p>
          </div>
          <Link href="/submit">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" size="sm">
              <PlusCircle className="w-4 h-4" />
              New Complaint
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="reopened">Reopened</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No complaints found</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">ID</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">Description</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">Category</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">Urgency</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">Date</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-semibold text-blue-600">{c.complaint_id}</span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-sm text-gray-700 truncate">{c.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{c.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-6 py-4">
                          <UrgencyBadge urgency={c.urgency_level} />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">{format(new Date(c.created_at), 'MMM d, yyyy')}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/track?id=${c.complaint_id}`} target="_blank">
                            <Button variant="ghost" size="sm" className="gap-1">
                              <ExternalLink className="w-3.5 h-3.5" />
                              Track
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y">
                {filtered.map(c => (
                  <div key={c.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-sm font-bold text-blue-600">{c.complaint_id}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 mb-2">{c.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <UrgencyBadge urgency={c.urgency_level} />
                        <span className="text-xs text-gray-400">{c.category}</span>
                      </div>
                      <span className="text-xs text-gray-400">{format(new Date(c.created_at), 'MMM d')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
