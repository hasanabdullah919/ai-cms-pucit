'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { StatusBadge } from '@/components/complaints/status-badge'
import { UrgencyBadge } from '@/components/complaints/urgency-badge'
import { SubmissionBadge } from '@/components/complaints/submission-badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'
import {
  ArrowLeft,
  Bot,
  Clock,
  CheckCircle,
  User,
  Building2,
  Loader2,
  MessageSquare,
  Send,
  Lock,
  Globe,
} from 'lucide-react'
import { SessionUser, ComplaintStatus, UrgencyLevel } from '@/types'

interface Department { id: string; name: string }
interface StaffMember { id: string; full_name: string; department_name: string; active_count: string }

interface Note {
  id: string
  content: string
  note_type: string
  author_name: string
  author_role: string
  created_at: string
}

interface ComplaintData {
  complaint: {
    id: string
    complaint_id: string
    description: string
    category: string
    ai_suggested_category: string | null
    ai_confidence: number | null
    urgency_level: UrgencyLevel
    status: ComplaintStatus
    is_anonymous: boolean
    user_id: string | null
    email: string | null
    submitter_label: string
    department_name: string | null
    assigned_department_id: string | null
    assigned_staff_id: string | null
    staff_name: string | null
    resolution_details: string | null
    created_at: string
    resolved_at: string | null
    sla_deadline: string
    evidence_urls: string[]
  }
  history: Array<{
    id: string
    action: string
    old_status: ComplaintStatus | null
    new_status: ComplaintStatus
    performed_by_name: string | null
    notes: string | null
    created_at: string
  }>
}

export default function AdminComplaintDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [user, setUser] = useState<SessionUser | null>(null)
  const [data, setData] = useState<ComplaintData | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [newStatus, setNewStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [resolutionDetails, setResolutionDetails] = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedStaff, setSelectedStaff] = useState('')
  const [overrideCategory, setOverrideCategory] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteType, setNoteType] = useState<'internal' | 'public'>('internal')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user))
    fetch('/api/departments').then(r => r.json()).then(d => setDepartments(d.departments || []))
    fetch('/api/admin/staff').then(r => r.json()).then(d => setStaff(d.staff || []))
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/complaints/${id}`)
      const json = await res.json()
      if (res.ok) {
        setData(json)
        setSelectedDept(json.complaint.assigned_department_id || '')
        setSelectedStaff(json.complaint.assigned_staff_id || '')
        setOverrideCategory(json.complaint.category || '')
        setResolutionDetails(json.complaint.resolution_details || '')
      }
    } finally {
      setLoading(false)
    }
    // Fetch notes
    const notesRes = await fetch(`/api/complaints/${id}/notes`)
    if (notesRes.ok) {
      const nd = await notesRes.json()
      setNotes(nd.notes || [])
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleAssign() {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/complaints/${id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: selectedDept || null,
          staff_id: selectedStaff || null,
          category: overrideCategory || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error); return }
      toast.success('Assignment updated successfully!')
      fetchData()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusUpdate() {
    if (!newStatus) { toast.error('Select a status'); return }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: statusNotes || undefined,
          resolution_details: resolutionDetails || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error); return }
      toast.success('Status updated!')
      setNewStatus('')
      setStatusNotes('')
      fetchData()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAddNote() {
    if (!noteContent.trim()) { toast.error('Note cannot be empty'); return }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/complaints/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent, note_type: noteType }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error); return }
      toast.success('Note added!')
      setNoteContent('')
      fetchData()
    } finally {
      setSubmitting(false)
    }
  }

  const filteredStaff = selectedDept
    ? staff.filter(s => departments.find(d => d.id === selectedDept)?.name === s.department_name)
    : staff

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Complaint not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const { complaint, history } = data
  const isOverdue = new Date() > new Date(complaint.sla_deadline) && !['resolved','closed'].includes(complaint.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Complaints
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Complaint details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Complaint ID</p>
                    <p className="font-mono text-2xl font-bold text-white">{complaint.complaint_id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={complaint.status} />
                    <UrgencyBadge urgency={complaint.urgency_level} />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {isOverdue && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-semibold text-red-700">⚠ SLA DEADLINE EXCEEDED</p>
                    <p className="text-xs text-red-600">Deadline was {format(new Date(complaint.sla_deadline), 'MMM d, yyyy')}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Category</span>
                    <p className="font-semibold text-gray-900">{complaint.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Submitter</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <SubmissionBadge
                        isAnonymous={complaint.is_anonymous}
                        userId={complaint.user_id}
                        email={complaint.email}
                      />
                      {complaint.submitter_label !== 'Anonymous' && (
                        <span className="text-xs text-gray-500 truncate">{complaint.submitter_label}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Created</span>
                    <p className="font-semibold text-gray-900">{format(new Date(complaint.created_at), 'MMM d, yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">SLA Deadline</span>
                    <p className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                      {format(new Date(complaint.sla_deadline), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {complaint.department_name && (
                    <div>
                      <span className="text-gray-500">Department</span>
                      <p className="font-semibold text-gray-900">{complaint.department_name}</p>
                    </div>
                  )}
                  {complaint.staff_name && (
                    <div>
                      <span className="text-gray-500">Assigned Staff</span>
                      <p className="font-semibold text-gray-900">{complaint.staff_name}</p>
                    </div>
                  )}
                </div>

                {/* AI Panel */}
                {complaint.ai_suggested_category && (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-800">AI Analysis</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-purple-600">Suggested Category</span>
                        <p className="font-semibold text-purple-900">{complaint.ai_suggested_category}</p>
                      </div>
                      <div>
                        <span className="text-purple-600">Confidence</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 h-2 bg-purple-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${Number(complaint.ai_confidence) >= 85 ? 'bg-green-500' : Number(complaint.ai_confidence) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${complaint.ai_confidence}%` }}
                            />
                          </div>
                          <span className="font-semibold text-purple-900">{complaint.ai_confidence}%</span>
                        </div>
                      </div>
                    </div>
                    {Number(complaint.ai_confidence) < 85 && (
                      <p className="text-xs text-purple-600 mt-2">
                        ⚠ Low confidence — manual review recommended
                      </p>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                    {complaint.description}
                  </div>
                </div>

                {/* Evidence */}
                {complaint.evidence_urls && complaint.evidence_urls.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Evidence</h3>
                    <div className="space-y-1">
                      {complaint.evidence_urls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:underline truncate">
                          {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution */}
                {complaint.resolution_details && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Resolution Details</h3>
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
                      {complaint.resolution_details}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Status History
              </h3>
              <div className="relative">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-100" />
                <div className="space-y-4">
                  {history.map((h, i) => (
                    <div key={h.id} className="flex gap-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${i === 0 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        {i === 0 && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">{h.action}</p>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {h.new_status && <StatusBadge status={h.new_status} className="mt-1" />}
                        {h.notes && <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded px-2 py-1">{h.notes}</p>}
                        {h.performed_by_name && <p className="text-xs text-gray-400 mt-1">by {h.performed_by_name}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Notes ({notes.length})
              </h3>

              {/* Add note */}
              <div className="mb-4 bg-gray-50 rounded-xl p-4">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setNoteType('internal')}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${noteType === 'internal' ? 'bg-gray-700 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                  >
                    <Lock className="w-3 h-3" /> Internal
                  </button>
                  <button
                    onClick={() => setNoteType('public')}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${noteType === 'public' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                  >
                    <Globe className="w-3 h-3" /> Public
                  </button>
                </div>
                <textarea
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder={noteType === 'internal' ? 'Internal note (visible to staff/admin only)...' : 'Public remark (visible to submitter)...'}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2"
                />
                <Button
                  onClick={handleAddNote}
                  disabled={submitting}
                  size="sm"
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Add Note
                </Button>
              </div>

              {/* Notes list */}
              <div className="space-y-3">
                {notes.map(note => (
                  <div key={note.id} className={`rounded-xl p-4 text-sm ${note.note_type === 'internal' ? 'bg-gray-50 border border-gray-100' : 'bg-blue-50 border border-blue-100'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {note.note_type === 'internal' ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" /> Internal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">
                          <Globe className="w-3 h-3" /> Public
                        </span>
                      )}
                      <span className="text-gray-500 text-xs">
                        {note.author_name} · {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-700">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="space-y-4">
            {/* Assign */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Assignment
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                  <select
                    value={selectedDept}
                    onChange={e => { setSelectedDept(e.target.value); setSelectedStaff('') }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Not assigned</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Staff Member</label>
                  <select
                    value={selectedStaff}
                    onChange={e => setSelectedStaff(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Not assigned</option>
                    {filteredStaff.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} ({s.active_count} active)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Override Category</label>
                  <select
                    value={overrideCategory}
                    onChange={e => setOverrideCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {['Academic','Financial','IT','Harassment','Hostel','Infrastructure','Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleAssign}
                  disabled={submitting}
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
                  Update Assignment
                </Button>
              </div>
            </div>

            {/* Update Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Update Status
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">New Status</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select status...</option>
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                    <option value="reopened">Reopened</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status Note</label>
                  <textarea
                    value={statusNotes}
                    onChange={e => setStatusNotes(e.target.value)}
                    placeholder="Add context for this status change..."
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {newStatus === 'resolved' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Resolution Details</label>
                    <textarea
                      value={resolutionDetails}
                      onChange={e => setResolutionDetails(e.target.value)}
                      placeholder="Describe how the issue was resolved..."
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                )}

                <Button
                  onClick={handleStatusUpdate}
                  disabled={submitting || !newStatus}
                  className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Update Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
