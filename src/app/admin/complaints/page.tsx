'use client'

import { useState, useEffect, useCallback } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { StatusBadge } from '@/components/complaints/status-badge'
import { UrgencyBadge } from '@/components/complaints/urgency-badge'
import { SubmissionBadge } from '@/components/complaints/submission-badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
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
  is_anonymous: boolean
  user_id: string | null
  email: string | null
  submitter_label: string
  department_name: string | null
  staff_name: string | null
  created_at: string
  sla_deadline: string
}

export default function AdminComplaintsPage() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')
  const [submissionFilter, setSubmissionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user))
  }, [])

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(urgencyFilter && { urgency: urgencyFilter }),
        ...(submissionFilter && { submission_type: submissionFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
      })
      const res = await fetch(`/api/admin/complaints?${params}`)
      const data = await res.json()
      setComplaints(data.complaints || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, categoryFilter, urgencyFilter, submissionFilter, dateFrom, dateTo])

  useEffect(() => { fetchComplaints() }, [fetchComplaints])

  function clearFilters() {
    setSearch('')
    setStatusFilter('')
    setCategoryFilter('')
    setUrgencyFilter('')
    setSubmissionFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const activeFilters = [statusFilter, categoryFilter, urgencyFilter, submissionFilter, dateFrom, dateTo].filter(Boolean).length
  const isOverdue = (c: Complaint) => new Date() > new Date(c.sla_deadline) && !['resolved', 'closed'].includes(c.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Complaints</h1>
            <p className="text-gray-600 text-sm mt-1">{total} complaint{total !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Search + Filter bar */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID or description..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilters > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </Button>
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-gray-500">
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t">
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="reopened">Reopened</option>
              </select>

              <select
                value={categoryFilter}
                onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Categories</option>
                {['Academic','Financial','IT','Harassment','Hostel','Infrastructure','Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={urgencyFilter}
                onChange={e => { setUrgencyFilter(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Urgency</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={submissionFilter}
                onChange={e => { setSubmissionFilter(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Types</option>
                <option value="anonymous">Anonymous</option>
                <option value="guest">Guest</option>
                <option value="registered">Registered</option>
              </select>

              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="From date"
              />

              <input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="To date"
              />
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400">Loading...</div>
          ) : complaints.length === 0 ? (
            <div className="py-16 text-center text-gray-400">No complaints found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">ID</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">Submitter</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">Category</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">Description</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">Urgency</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">Dept</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {complaints.map(c => (
                    <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${isOverdue(c) ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3">
                        <Link href={`/admin/complaints/${c.complaint_id}`} className="font-mono text-sm font-bold text-blue-600 hover:underline">
                          {c.complaint_id}
                        </Link>
                        {isOverdue(c) && (
                          <span className="block text-xs text-red-600 font-medium">OVERDUE</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <SubmissionBadge isAnonymous={c.is_anonymous} userId={c.user_id} email={c.email} />
                        {!c.is_anonymous && c.submitter_label && (
                          <p className="text-xs text-gray-500 mt-0.5 max-w-[120px] truncate">{c.submitter_label}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.category}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-sm text-gray-700 truncate">{c.description}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3"><UrgencyBadge urgency={c.urgency_level} /></td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">{c.department_name || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">{format(new Date(c.created_at), 'MMM d')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/complaints/${c.complaint_id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">Page {page} of {totalPages} · {total} total</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="gap-1">
                <ChevronLeft className="w-4 h-4" /> Prev
              </Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="gap-1">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
