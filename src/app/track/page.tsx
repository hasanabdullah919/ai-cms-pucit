'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/complaints/status-badge'
import { UrgencyBadge } from '@/components/complaints/urgency-badge'
import { SubmissionBadge } from '@/components/complaints/submission-badge'
import { formatDistanceToNow, format, differenceInDays } from 'date-fns'
import {
  ShieldCheck,
  Search,
  Loader2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Star,
  CheckCircle,
  Bot,
} from 'lucide-react'

interface ComplaintData {
  complaint: {
    id: string
    complaint_id: string
    description: string
    category: string
    ai_suggested_category: string | null
    ai_confidence: number | null
    urgency_level: string
    status: string
    is_anonymous: boolean
    user_id: string | null
    email: string | null
    submitter_label: string
    department_name: string | null
    staff_name: string | null
    resolution_details: string | null
    created_at: string
    resolved_at: string | null
    sla_deadline: string
  }
  history: Array<{
    id: string
    action: string
    old_status: string | null
    new_status: string
    performed_by_name: string | null
    notes: string | null
    created_at: string
  }>
  feedback: {
    rating: number
    comment: string | null
  } | null
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  )
}

function TrackContent() {
  const searchParams = useSearchParams()
  const initialId = searchParams.get('id') || ''

  const [inputId, setInputId] = useState(initialId)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ComplaintData | null>(null)

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackDone, setFeedbackDone] = useState(false)

  // Reopen state
  const [reopenReason, setReopenReason] = useState('')
  const [reopenSubmitting, setReopenSubmitting] = useState(false)
  const [showReopen, setShowReopen] = useState(false)

  useEffect(() => {
    if (initialId) {
      fetchComplaintInner(initialId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchComplaintInner(id: string) {
    await fetchComplaint(id)
  }

  async function fetchComplaint(id: string) {
    if (!id.trim()) {
      toast.error('Please enter a complaint ID')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/complaints/${id.trim().toUpperCase()}`)
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Complaint not found')
        setData(null)
      } else {
        setData(json)
        setFeedbackDone(!!json.feedback)
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function submitFeedback() {
    if (!data || feedbackRating === 0) {
      toast.error('Please select a rating')
      return
    }
    setFeedbackSubmitting(true)
    try {
      const res = await fetch(`/api/complaints/${data.complaint.complaint_id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: feedbackRating, comment: feedbackComment }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to submit feedback')
      } else {
        toast.success('Thank you for your feedback!')
        setFeedbackDone(true)
      }
    } catch {
      toast.error('Network error')
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  async function reopenComplaint() {
    if (!data || reopenReason.trim().length < 10) {
      toast.error('Please provide a reason (at least 10 characters)')
      return
    }
    setReopenSubmitting(true)
    try {
      const res = await fetch(`/api/complaints/${data.complaint.complaint_id}/reopen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reopenReason }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to reopen complaint')
      } else {
        toast.success('Complaint reopened successfully!')
        fetchComplaint(data.complaint.complaint_id)
        setShowReopen(false)
      }
    } catch {
      toast.error('Network error')
    } finally {
      setReopenSubmitting(false)
    }
  }

  const isOverdue = data && new Date() > new Date(data.complaint.sla_deadline) &&
    !['resolved', 'closed'].includes(data.complaint.status)

  const canReopen = data?.complaint.status === 'resolved' &&
    data.complaint.resolved_at &&
    differenceInDays(new Date(), new Date(data.complaint.resolved_at)) <= 7

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">AI-CMS PUCIT</span>
          </Link>
          <div className="flex gap-2">
            <Link href="/submit">
              <Button variant="outline" size="sm">Submit Complaint</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Complaint</h1>
            <p className="text-gray-600">Enter your Complaint ID to see the current status</p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputId}
                onChange={e => setInputId(e.target.value.toUpperCase())}
                placeholder="CMP-2025-00001"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={e => e.key === 'Enter' && fetchComplaint(inputId)}
              />
              <Button
                onClick={() => fetchComplaint(inputId)}
                disabled={loading}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Track
              </Button>
            </div>
          </div>

          {/* Results */}
          {data && (
            <div className="space-y-4">
              {/* Overdue warning */}
              {isOverdue && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">SLA Deadline Exceeded</p>
                      <p className="text-sm text-red-700">
                        This complaint has exceeded the 7-day resolution deadline. If you need urgent attention,
                        please contact the administration directly.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Main complaint card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Complaint ID</p>
                      <p className="font-mono text-xl font-bold text-white">{data.complaint.complaint_id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={data.complaint.status as never} />
                      <UrgencyBadge urgency={data.complaint.urgency_level as never} />
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Meta info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category</span>
                      <p className="font-semibold text-gray-900">{data.complaint.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Submitted</span>
                      <p className="font-semibold text-gray-900">
                        {format(new Date(data.complaint.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">SLA Deadline</span>
                      <p className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                        {format(new Date(data.complaint.sla_deadline), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Submission Type</span>
                      <div className="mt-0.5">
                        <SubmissionBadge
                          isAnonymous={data.complaint.is_anonymous}
                          userId={data.complaint.user_id}
                          email={data.complaint.email}
                        />
                      </div>
                    </div>
                    {data.complaint.department_name && (
                      <div>
                        <span className="text-gray-500">Department</span>
                        <p className="font-semibold text-gray-900">{data.complaint.department_name}</p>
                      </div>
                    )}
                    {data.complaint.resolved_at && (
                      <div>
                        <span className="text-gray-500">Resolved</span>
                        <p className="font-semibold text-gray-900">
                          {format(new Date(data.complaint.resolved_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* AI info */}
                  {data.complaint.ai_suggested_category && (
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-800">AI Classification</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-700">{data.complaint.ai_suggested_category}</span>
                        <span className="text-purple-600 font-medium">{data.complaint.ai_confidence}% confidence</span>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">
                      {data.complaint.description}
                    </p>
                  </div>

                  {/* Resolution */}
                  {data.complaint.resolution_details && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Resolution</p>
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                        <p className="text-sm text-green-800">{data.complaint.resolution_details}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              {data.history.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Status History
                  </h3>
                  <div className="relative">
                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-100" />
                    <div className="space-y-4">
                      {data.history.map((h, i) => (
                        <div key={h.id} className="flex gap-4 relative">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${i === 0 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                            {i === 0 && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-semibold text-gray-900">{h.action}</p>
                              <span className="text-xs text-gray-400 ml-2 shrink-0">
                                {formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            {h.new_status && (
                              <StatusBadge status={h.new_status as never} className="mt-1" />
                            )}
                            {h.notes && (
                              <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded px-2 py-1">{h.notes}</p>
                            )}
                            {h.performed_by_name && (
                              <p className="text-xs text-gray-400 mt-1">by {h.performed_by_name}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback section */}
              {(data.complaint.status === 'resolved' || data.complaint.status === 'closed') && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Rate Resolution
                  </h3>

                  {feedbackDone || data.feedback ? (
                    <div className="text-center py-4">
                      <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900">Thank you for your feedback!</p>
                      {data.feedback && (
                        <div className="flex justify-center gap-1 mt-2">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-5 h-5 ${s <= data.feedback!.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-3">How satisfied are you with the resolution?</p>
                        <StarRating value={feedbackRating} onChange={setFeedbackRating} />
                      </div>
                      <textarea
                        value={feedbackComment}
                        onChange={e => setFeedbackComment(e.target.value)}
                        placeholder="Any additional comments? (optional)"
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <Button
                        onClick={submitFeedback}
                        disabled={feedbackSubmitting || feedbackRating === 0}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {feedbackSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                        Submit Feedback
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Reopen section */}
              {canReopen && !showReopen && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-orange-800">Issue not resolved?</p>
                      <p className="text-sm text-orange-700">
                        You can reopen this complaint within 7 days of resolution.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowReopen(true)}
                      className="border-orange-300 text-orange-700 hover:bg-orange-100 shrink-0 gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reopen
                    </Button>
                  </div>
                </div>
              )}

              {showReopen && (
                <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-orange-600" />
                    Reopen Complaint
                  </h3>
                  <textarea
                    value={reopenReason}
                    onChange={e => setReopenReason(e.target.value)}
                    placeholder="Please explain why you are reopening this complaint..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none mb-3"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={reopenComplaint}
                      disabled={reopenSubmitting}
                      className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {reopenSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Confirm Reopen
                    </Button>
                    <Button variant="outline" onClick={() => setShowReopen(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <TrackContent />
    </Suspense>
  )
}
