export type UserRole = 'student' | 'admin' | 'staff'

export type ComplaintStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'reopened'

export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low'

export type ComplaintCategory =
  | 'Academic'
  | 'Financial'
  | 'IT'
  | 'Harassment'
  | 'Hostel'
  | 'Infrastructure'
  | 'Other'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  department_id: string | null
  created_at: string
}

export interface Department {
  id: string
  name: string
}

export interface Complaint {
  id: string
  complaint_id: string
  user_id: string | null
  email: string | null
  is_anonymous: boolean
  category: ComplaintCategory
  ai_suggested_category: ComplaintCategory | null
  ai_confidence: number | null
  description: string
  urgency_level: UrgencyLevel
  status: ComplaintStatus
  assigned_department_id: string | null
  assigned_staff_id: string | null
  evidence_urls: string[]
  resolution_details: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  sla_deadline: string
  // Joined fields
  department_name?: string
  staff_name?: string
  submitter_name?: string
  submitter_label?: string
}

export interface StatusHistory {
  id: string
  complaint_id: string
  action: string
  old_status: ComplaintStatus | null
  new_status: ComplaintStatus
  performed_by: string | null
  performed_by_name?: string
  notes: string | null
  created_at: string
}

export interface Feedback {
  id: string
  complaint_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string | null
  email: string | null
  complaint_id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  complaint_id: string
  action: string
  performed_by: string | null
  performed_by_role: string | null
  notes: string | null
  created_at: string
}

export interface SessionUser {
  id: string
  email: string
  full_name: string
  role: UserRole
  department_id: string | null
}
