'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  ShieldCheck,
  Bot,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  EyeOff,
  ArrowRight,
  Search,
  Paperclip,
  X,
} from 'lucide-react'

const submitSchema = z.object({
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(['Academic', 'Financial', 'IT', 'Harassment', 'Hostel', 'Infrastructure', 'Other']),
  is_anonymous: z.boolean().default(false),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  is_urgent: z.boolean().default(false),
})

type FormData = z.infer<typeof submitSchema>

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false)
  const [complaintId, setComplaintId] = useState('')
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([])
  const [urlInput, setUrlInput] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      is_anonymous: false,
      is_urgent: false,
      category: 'Academic',
    },
  })

  const isAnonymous = watch('is_anonymous')

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, evidence_urls: evidenceUrls }),
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error || 'Failed to submit complaint')
        return
      }

      setComplaintId(json.complaint_id)
      setSubmitted(true)
      toast.success('Complaint submitted successfully!')
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function copyComplaintId() {
    navigator.clipboard.writeText(complaintId)
    setCopied(true)
    toast.success('Complaint ID copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  function addUrl() {
    if (urlInput.trim()) {
      setEvidenceUrls(prev => [...prev, urlInput.trim()])
      setUrlInput('')
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navbar */}
        <nav className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">AI-CMS PUCIT</span>
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted!</h1>
              <p className="text-gray-600 mb-8">
                Your complaint has been received and classified by our AI system.
              </p>

              {/* Complaint ID box */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <p className="text-sm font-medium text-blue-700 mb-2">Your Complaint ID</p>
                <div className="flex items-center justify-between bg-white rounded-lg border border-blue-200 px-4 py-3">
                  <span className="font-mono text-lg font-bold text-gray-900">{complaintId}</span>
                  <button
                    onClick={copyComplaintId}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Important: Save your Complaint ID</p>
                    <p className="text-sm text-amber-700 mt-1">
                      This is the only way to track your complaint. If you did not provide an email,
                      you will not receive notifications. Please write it down or copy it now.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/track?id=${complaintId}`} className="flex-1">
                  <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Search className="w-4 h-4" />
                    Track This Complaint
                  </Button>
                </Link>
                <Link href="/submit" className="flex-1">
                  <Button variant="outline" className="w-full gap-2">
                    Submit Another
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
          <div className="flex items-center gap-2">
            <Link href="/track">
              <Button variant="ghost" size="sm">Track Complaint</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Bot className="w-4 h-4" />
              AI-Powered Classification
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit a Complaint</h1>
            <p className="text-gray-600">
              Your complaint will be automatically classified and routed to the appropriate department.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Anonymous Toggle - Prominent */}
              <div className="bg-gray-50 border-b px-6 py-4">
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      {...register('is_anonymous')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-blue-300" />
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">Submit Anonymously</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Your identity will be hidden from staff and admins
                    </p>
                  </div>
                </label>

                {isAnonymous && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700">
                        <strong>Warning:</strong> You will not receive email notifications. Make sure to save your
                        Complaint ID after submission — it is the only way to track your complaint.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('category')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Financial">Financial</option>
                    <option value="IT">IT / Technology</option>
                    <option value="Harassment">Harassment</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    AI may override this based on your description. Your selection helps improve accuracy.
                  </p>
                  {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('description')}
                    rows={6}
                    placeholder="Please describe your complaint in detail. Include dates, people involved, and any relevant context..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                  )}
                </div>

                {/* Urgency */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('is_urgent')}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-700">Mark as Urgent</span>
                      <span className="block text-xs text-gray-500">
                        Check this for time-sensitive issues requiring immediate attention
                      </span>
                    </div>
                  </label>
                </div>

                {/* Email (shown when not anonymous) */}
                {!isAnonymous && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="your.email@example.com"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Provide your email to receive status updates. Not required if you have an account.
                    </p>
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                  </div>
                )}

                {/* Evidence URLs */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      Evidence / Attachments <span className="text-gray-400 font-normal">(optional)</span>
                    </span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addUrl}>Add</Button>
                  </div>
                  {evidenceUrls.length > 0 && (
                    <div className="space-y-1">
                      {evidenceUrls.map((url, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-xs text-gray-600 flex-1 truncate">{url}</span>
                          <button
                            type="button"
                            onClick={() => setEvidenceUrls(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Add links to screenshots or documents (Google Drive, Dropbox, etc.)
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="px-6 pb-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      AI is processing your complaint...
                    </>
                  ) : (
                    <>
                      <Bot className="w-5 h-5" />
                      Submit Complaint
                    </>
                  )}
                </Button>
                {isLoading && (
                  <p className="text-center text-sm text-gray-500 mt-2 animate-pulse">
                    Our AI is analyzing and classifying your complaint...
                  </p>
                )}
              </div>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have a complaint?{' '}
            <Link href="/track" className="text-blue-600 hover:underline font-medium">
              Track it here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
