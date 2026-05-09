'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Bot,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  Search,
  X,
  Monitor,
  ShieldCheck,
  GraduationCap,
  Building2,
  MoreHorizontal,
  CloudUpload,
} from 'lucide-react'

const submitSchema = z.object({
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(['Academic', 'Financial', 'IT', 'Harassment', 'Hostel', 'Infrastructure', 'Other']),
  is_anonymous: z.boolean().default(false),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  is_urgent: z.boolean().default(false),
})

type FormData = z.infer<typeof submitSchema>

const CATEGORIES = [
  { value: 'IT', label: 'IT Services', icon: Monitor },
  { value: 'Academic', label: 'Academic', icon: GraduationCap },
  { value: 'Infrastructure', label: 'Infrastructure', icon: Building2 },
  { value: 'Harassment', label: 'Admin', icon: ShieldCheck },
  { value: 'Financial', label: 'Financial', icon: Copy },
  { value: 'Hostel', label: 'Hostel', icon: Building2 },
  { value: 'Other', label: 'Other', icon: MoreHorizontal },
] as const

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false)
  const [complaintId, setComplaintId] = useState('')
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [descLength, setDescLength] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
  const selectedCategory = watch('category')

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
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: '#fbf9fa', fontFamily: 'Inter, sans-serif', color: '#1b1c1d' }}
      >
        {/* Navbar */}
        <nav className="border-b" style={{ backgroundColor: '#ffffff', borderColor: '#c3c6d1' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-3">
            <Link href="/" className="text-lg font-bold" style={{ color: '#001e40' }}>
              AI-CMS PUCIT
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-lg w-full">
            <div
              className="rounded-xl shadow-sm border p-8 text-center"
              style={{ backgroundColor: '#ffffff', borderColor: '#c3c6d1' }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: '#d5e3ff' }}
              >
                <Check className="w-8 h-8" style={{ color: '#001e40' }} />
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#001e40' }}>Complaint Submitted!</h1>
              <p className="mb-8 text-sm" style={{ color: '#43474f' }}>
                Your complaint has been received and classified by our AI system.
              </p>

              {/* Complaint ID box */}
              <div
                className="border-2 rounded-xl p-6 mb-6"
                style={{ backgroundColor: '#f0f5ff', borderColor: '#a7c8ff' }}
              >
                <p className="text-sm font-medium mb-2" style={{ color: '#1f477b' }}>Your Complaint ID</p>
                <div
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                  style={{ backgroundColor: '#ffffff', borderColor: '#a7c8ff' }}
                >
                  <span className="font-mono text-lg font-bold" style={{ color: '#1b1c1d' }}>{complaintId}</span>
                  <button
                    onClick={copyComplaintId}
                    className="p-2 rounded-lg transition-colors hover:bg-gray-50"
                  >
                    {copied ? (
                      <Check className="w-5 h-5" style={{ color: '#005228' }} />
                    ) : (
                      <Copy className="w-5 h-5" style={{ color: '#003366' }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div
                className="rounded-xl p-4 mb-8 text-left border"
                style={{ backgroundColor: '#fff8e1', borderColor: '#fed255' }}
              >
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#735a00' }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#735a00' }}>
                      Important: Save your Complaint ID
                    </p>
                    <p className="text-sm mt-1" style={{ color: '#735a00' }}>
                      This is the only way to track your complaint. If you did not provide an email,
                      you will not receive notifications. Please write it down or copy it now.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/track?id=${complaintId}`} className="flex-1">
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold"
                    style={{ backgroundColor: '#003366', color: '#ffffff' }}
                  >
                    <Search className="w-4 h-4" />
                    Track This Complaint
                  </button>
                </Link>
                <Link href="/submit" className="flex-1">
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border"
                    style={{ borderColor: '#c3c6d1', color: '#001e40', backgroundColor: '#ffffff' }}
                  >
                    Submit Another
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#fbf9fa', fontFamily: 'Inter, sans-serif', color: '#1b1c1d' }}
    >
      {/* Navbar */}
      <nav className="border-b" style={{ backgroundColor: '#ffffff', borderColor: '#c3c6d1' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="text-lg font-bold" style={{ color: '#001e40' }}>
            AI-CMS PUCIT
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/track" className="text-sm transition-colors hover:bg-gray-50 px-3 py-1.5 rounded" style={{ color: '#43474f' }}>
              Track Complaint
            </Link>
            <Link
              href="/login"
              className="text-sm px-4 py-1.5 rounded-lg font-medium"
              style={{ backgroundColor: '#003366', color: '#ffffff' }}
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-32 md:pb-24">
        {/* Step indicator */}
        <div className="w-full max-w-2xl mx-auto mb-6 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#43474f' }}>
              Step 1 of 2
            </span>
            <h1 className="text-2xl md:text-3xl font-semibold mt-1" style={{ color: '#1b1c1d' }}>
              Complaint Details
            </h1>
          </div>
          <div
            className="w-16 h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: '#e3e2e3' }}
          >
            <div
              className="w-1/2 h-full rounded-full"
              style={{ backgroundColor: '#003366' }}
            />
          </div>
        </div>

        {/* Form container */}
        <div
          className="w-full max-w-2xl mx-auto rounded-xl border p-6 md:p-8"
          style={{ backgroundColor: '#ffffff', borderColor: '#e9e8e9' }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Anonymous Toggle */}
            <div
              className="flex items-center justify-between p-4 rounded-lg border mb-6"
              style={{ backgroundColor: '#fbf9fa', borderColor: '#e9e8e9' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="relative w-12 h-12 rounded-full border flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: '#efedee', borderColor: '#c3c6d1' }}
                >
                  <span
                    className="text-2xl"
                    style={{ filter: 'blur(1px)', color: '#737780' }}
                  >
                    👤
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium" style={{ color: '#1b1c1d' }}>Submit Anonymously</span>
                  <span className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#43474f' }}>
                    🛡 Protected Identity
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_anonymous')}
                  className="sr-only peer"
                />
                <div
                  className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    backgroundColor: isAnonymous ? '#003366' : '#e3e2e3',
                  }}
                />
              </label>
            </div>

            {/* Anonymous warning */}
            {isAnonymous && (
              <div
                className="rounded-lg border p-3 mb-6"
                style={{ backgroundColor: '#fff8e1', borderColor: '#fed255' }}
              >
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#735a00' }} />
                  <p className="text-sm" style={{ color: '#735a00' }}>
                    <strong>Warning:</strong> You will not receive email notifications. Make sure to save your
                    Complaint ID after submission — it is the only way to track your complaint.
                  </p>
                </div>
              </div>
            )}

            {/* Category Cards */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3" style={{ color: '#1b1c1d' }}>
                Select Department
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CATEGORIES.map(({ value, label, icon: Icon }) => {
                  const isSelected = selectedCategory === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue('category', value as FormData['category'])}
                      className="flex flex-col items-center justify-center p-4 rounded-lg border transition-all focus:outline-none relative overflow-hidden"
                      style={
                        isSelected
                          ? { backgroundColor: '#d5e3ff', borderColor: '#003366', borderWidth: '2px' }
                          : { backgroundColor: '#ffffff', borderColor: '#c3c6d1' }
                      }
                    >
                      {isSelected && (
                        <div
                          className="absolute inset-0 opacity-5"
                          style={{ backgroundColor: '#003366' }}
                        />
                      )}
                      <Icon
                        className="w-7 h-7 mb-2"
                        style={{ color: isSelected ? '#001e40' : '#43474f' }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: isSelected ? '#001e40' : '#1b1c1d', fontWeight: isSelected ? 700 : 500 }}
                      >
                        {label}
                      </span>
                    </button>
                  )
                })}
              </div>
              {/* hidden input for form validation */}
              <input type="hidden" {...register('category')} />
              {errors.category && (
                <p className="text-xs mt-1" style={{ color: '#ba1a1a' }}>{errors.category.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-medium" style={{ color: '#1b1c1d' }}>
                  Detailed Description <span style={{ color: '#ba1a1a' }}>*</span>
                </label>
                <span className="text-xs" style={{ color: '#43474f' }}>{descLength} / 500</span>
              </div>
              <textarea
                {...register('description', {
                  onChange: (e) => setDescLength(e.target.value.length),
                })}
                rows={6}
                maxLength={500}
                placeholder="Please describe your issue in detail..."
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none resize-none transition-all"
                style={{
                  border: '1px solid #c3c6d1',
                  backgroundColor: '#fbf9fa',
                  color: '#1b1c1d',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#003366'
                  e.target.style.boxShadow = '0 0 0 2px rgba(0,51,102,0.15)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#c3c6d1'
                  e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}
              />
              {errors.description && (
                <p className="text-xs mt-1" style={{ color: '#ba1a1a' }}>{errors.description.message}</p>
              )}
            </div>

            {/* Urgency */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_urgent')}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#003366' }}
                />
                <div>
                  <span className="text-sm font-medium" style={{ color: '#1b1c1d' }}>Mark as Urgent</span>
                  <span className="block text-xs" style={{ color: '#43474f' }}>
                    Check this for time-sensitive issues requiring immediate attention
                  </span>
                </div>
              </label>
            </div>

            {/* Email (shown when not anonymous) */}
            {!isAnonymous && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: '#1b1c1d' }}>
                  Email Address <span className="font-normal" style={{ color: '#43474f' }}>(optional)</span>
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="student@pucit.edu.pk"
                  className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all"
                  style={{
                    border: '1px solid #c3c6d1',
                    backgroundColor: '#fbf9fa',
                    color: '#1b1c1d',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#003366'
                    e.target.style.boxShadow = '0 0 0 2px rgba(0,51,102,0.15)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#c3c6d1'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                {errors.email && <p className="text-xs mt-1" style={{ color: '#ba1a1a' }}>{errors.email.message}</p>}
              </div>
            )}

            {/* Drag-and-drop file upload + URL input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#1b1c1d' }}>
                Attachments <span className="font-normal" style={{ color: '#43474f' }}>(Optional)</span>
              </label>

              {/* Drag and drop zone */}
              <div
                className="w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group mb-3"
                style={{ borderColor: '#c3c6d1', backgroundColor: '#fbf9fa' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#efedee')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fbf9fa')}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: '#efedee' }}
                >
                  <CloudUpload className="w-6 h-6" style={{ color: '#43474f' }} />
                </div>
                <span className="text-sm font-medium mb-1" style={{ color: '#1b1c1d' }}>
                  Click to upload or drag and drop
                </span>
                <span className="text-xs" style={{ color: '#43474f' }}>
                  SVG, PNG, JPG or PDF (max. 10MB)
                </span>
              </div>

              {/* URL evidence */}
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="flex-1 rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-all"
                  style={{ border: '1px solid #c3c6d1', color: '#1b1c1d', backgroundColor: '#fbf9fa' }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                  onFocus={e => {
                    e.target.style.borderColor = '#003366'
                    e.target.style.boxShadow = '0 0 0 2px rgba(0,51,102,0.15)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#c3c6d1'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={addUrl}
                  className="px-4 py-2 rounded-lg text-sm border transition-colors"
                  style={{ borderColor: '#c3c6d1', color: '#001e40', backgroundColor: '#ffffff' }}
                >
                  Add
                </button>
              </div>
              {evidenceUrls.length > 0 && (
                <div className="space-y-1">
                  {evidenceUrls.map((url, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg px-3 py-2"
                      style={{ backgroundColor: '#efedee' }}
                    >
                      <span className="text-xs flex-1 truncate" style={{ color: '#43474f' }}>{url}</span>
                      <button
                        type="button"
                        onClick={() => setEvidenceUrls(prev => prev.filter((_, idx) => idx !== i))}
                        style={{ color: '#43474f' }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div
              className="flex justify-end gap-4 pt-4 border-t"
              style={{ borderColor: '#e9e8e9' }}
            >
              <Link href="/">
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg border text-sm transition-colors"
                  style={{ borderColor: '#c3c6d1', color: '#001e40', backgroundColor: '#ffffff' }}
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-opacity disabled:opacity-70"
                style={{ backgroundColor: '#003366', color: '#ffffff' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI is processing...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    Proceed to Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: '#43474f' }}>
          Already have a complaint?{' '}
          <Link href="/track" className="font-medium hover:underline" style={{ color: '#003366' }}>
            Track it here
          </Link>
        </p>
      </main>
    </div>
  )
}
