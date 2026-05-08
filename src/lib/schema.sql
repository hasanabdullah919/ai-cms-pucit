-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'staff')),
  department_id UUID REFERENCES departments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES users(id),
  email TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  category TEXT NOT NULL CHECK (category IN ('Academic','Financial','IT','Harassment','Hostel','Infrastructure','Other')),
  ai_suggested_category TEXT CHECK (ai_suggested_category IN ('Academic','Financial','IT','Harassment','Hostel','Infrastructure','Other')),
  ai_confidence INTEGER CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  description TEXT NOT NULL,
  urgency_level TEXT NOT NULL DEFAULT 'medium' CHECK (urgency_level IN ('critical','high','medium','low')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','assigned','in_progress','resolved','closed','reopened')),
  assigned_department_id UUID REFERENCES departments(id),
  assigned_staff_id UUID REFERENCES users(id),
  evidence_urls TEXT[] DEFAULT '{}',
  resolution_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

-- Status history table
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  performed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  email TEXT,
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Internal notes table
CREATE TABLE IF NOT EXISTS complaint_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  note_type TEXT NOT NULL CHECK (note_type IN ('internal', 'public')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate complaint ID function
CREATE OR REPLACE FUNCTION generate_complaint_id()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  seq INTEGER;
  new_id TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO seq FROM complaints WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  new_id := 'CMP-' || year || '-' || LPAD(seq::TEXT, 5, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Seed departments
INSERT INTO departments (name) VALUES
  ('Academic'),
  ('Financial'),
  ('IT'),
  ('Harassment'),
  ('Hostel'),
  ('Infrastructure')
ON CONFLICT (name) DO NOTHING;

-- Seed admin user (password: Admin@123)
INSERT INTO users (email, full_name, password_hash, role) VALUES
  ('admin@ai-cms.pucit.edu.pk', 'System Admin', '$2b$10$w3uVI.TJBSG8zvvncTAecOB9HGdkOJyzWXj/ik5VyNAtKDLxu7hHi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed staff users (password: Staff@123)
DO $$
DECLARE
  dept_id UUID;
BEGIN
  -- Academic staff
  SELECT id INTO dept_id FROM departments WHERE name = 'Academic';
  INSERT INTO users (email, full_name, password_hash, role, department_id)
  VALUES ('staff.academic@ai-cms.pucit.edu.pk', 'Academic Staff', '$2b$10$xHYGrqieC8C.q2zNG2HhQeJk7f1nMUSBSRCI9laAVe2anl6WgslAK', 'staff', dept_id)
  ON CONFLICT (email) DO NOTHING;

  -- Financial staff
  SELECT id INTO dept_id FROM departments WHERE name = 'Financial';
  INSERT INTO users (email, full_name, password_hash, role, department_id)
  VALUES ('staff.financial@ai-cms.pucit.edu.pk', 'Financial Staff', '$2b$10$xHYGrqieC8C.q2zNG2HhQeJk7f1nMUSBSRCI9laAVe2anl6WgslAK', 'staff', dept_id)
  ON CONFLICT (email) DO NOTHING;

  -- IT staff
  SELECT id INTO dept_id FROM departments WHERE name = 'IT';
  INSERT INTO users (email, full_name, password_hash, role, department_id)
  VALUES ('staff.it@ai-cms.pucit.edu.pk', 'IT Staff', '$2b$10$xHYGrqieC8C.q2zNG2HhQeJk7f1nMUSBSRCI9laAVe2anl6WgslAK', 'staff', dept_id)
  ON CONFLICT (email) DO NOTHING;

  -- Harassment staff
  SELECT id INTO dept_id FROM departments WHERE name = 'Harassment';
  INSERT INTO users (email, full_name, password_hash, role, department_id)
  VALUES ('staff.harassment@ai-cms.pucit.edu.pk', 'Harassment Officer', '$2b$10$xHYGrqieC8C.q2zNG2HhQeJk7f1nMUSBSRCI9laAVe2anl6WgslAK', 'staff', dept_id)
  ON CONFLICT (email) DO NOTHING;

  -- Hostel staff
  SELECT id INTO dept_id FROM departments WHERE name = 'Hostel';
  INSERT INTO users (email, full_name, password_hash, role, department_id)
  VALUES ('staff.hostel@ai-cms.pucit.edu.pk', 'Hostel Warden', '$2b$10$xHYGrqieC8C.q2zNG2HhQeJk7f1nMUSBSRCI9laAVe2anl6WgslAK', 'staff', dept_id)
  ON CONFLICT (email) DO NOTHING;

  -- Infrastructure staff
  SELECT id INTO dept_id FROM departments WHERE name = 'Infrastructure';
  INSERT INTO users (email, full_name, password_hash, role, department_id)
  VALUES ('staff.infra@ai-cms.pucit.edu.pk', 'Infrastructure Staff', '$2b$10$xHYGrqieC8C.q2zNG2HhQeJk7f1nMUSBSRCI9laAVe2anl6WgslAK', 'staff', dept_id)
  ON CONFLICT (email) DO NOTHING;
END $$;

-- Seed student user (password: student123)
INSERT INTO users (email, full_name, password_hash, role) VALUES
  ('student@example.com', 'Test Student', '$2b$10$6jtEcrcVtXbd2JloQ66kvO4aczPv5621Lh9TkamQsGHIBkQyXRcGi', 'student')
ON CONFLICT (email) DO NOTHING;
