import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Bot,
  Search,
  ClipboardList,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Zap,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <header className="bg-blue-700 text-white text-center py-2 text-sm font-medium">
        Punjab University College of Information Technology (PUCIT) — Official Complaint Portal
      </header>

      {/* Main navbar */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold text-gray-900">AI-CMS PUCIT</div>
              <div className="text-[11px] text-gray-500">Complaint Management System</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/track">
              <Button variant="ghost" size="sm">Track Complaint</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link href="/submit">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Submit Complaint
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Bot className="w-4 h-4" />
              Powered by AI Classification
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              AI-Powered Complaint
              <br />
              <span className="text-yellow-300">Management System</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl">
              Submit, track, and resolve complaints efficiently. Our AI automatically categorizes
              and prioritizes your concerns for faster resolution.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/submit">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold h-12 px-6 gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Submit a Complaint
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/track">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 h-12 px-6 gap-2 bg-transparent">
                  <Search className="w-5 h-5" />
                  Track Complaint
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-blue-800 text-white py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Avg Resolution', value: '< 7 days', icon: Clock },
              { label: 'AI Accuracy', value: '> 90%', icon: Bot },
              { label: 'Categories', value: '7', icon: ClipboardList },
              { label: 'Always Available', value: '24/7', icon: Zap },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-center gap-3">
                <Icon className="w-5 h-5 text-blue-300" />
                <div>
                  <div className="text-lg font-bold">{value}</div>
                  <div className="text-xs text-blue-300">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Three simple steps to get your issues resolved quickly and transparently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <ClipboardList className="w-7 h-7 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-blue-600 mb-2">Step 1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quick Submission</h3>
              <p className="text-gray-600 mb-4">
                Submit complaints anonymously or as a registered user. No lengthy forms — just describe your issue.
              </p>
              <ul className="space-y-2">
                {['Anonymous option available', 'File attachments supported', 'Mobile friendly'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-blue-200 shadow-sm hover:shadow-md transition-shadow ring-2 ring-blue-100">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Bot className="w-7 h-7 text-purple-600" />
              </div>
              <div className="text-sm font-semibold text-purple-600 mb-2">Step 2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Classification</h3>
              <p className="text-gray-600 mb-4">
                Our AI instantly analyzes your complaint, assigns the right category, determines urgency, and routes it to the correct department.
              </p>
              <ul className="space-y-2">
                {['Automatic categorization', 'Urgency detection', 'Duplicate prevention'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <Search className="w-7 h-7 text-green-600" />
              </div>
              <div className="text-sm font-semibold text-green-600 mb-2">Step 3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Track Status</h3>
              <p className="text-gray-600 mb-4">
                Track your complaint anytime using your unique Complaint ID. Get notified on every status update.
              </p>
              <ul className="space-y-2">
                {['Real-time status updates', 'Timeline history', 'Rate resolution quality'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Complaint Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {[
              { label: 'Academic', color: 'bg-blue-50 text-blue-700 border-blue-100' },
              { label: 'Financial', color: 'bg-green-50 text-green-700 border-green-100' },
              { label: 'IT', color: 'bg-purple-50 text-purple-700 border-purple-100' },
              { label: 'Harassment', color: 'bg-red-50 text-red-700 border-red-100' },
              { label: 'Hostel', color: 'bg-orange-50 text-orange-700 border-orange-100' },
              { label: 'Infrastructure', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
              { label: 'Other', color: 'bg-gray-50 text-gray-700 border-gray-100' },
            ].map(({ label, color }) => (
              <div key={label} className={`border rounded-xl p-4 text-center text-sm font-medium ${color}`}>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Register for a full account to track complaints, get notifications, and access your complaint history.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 h-12 px-8 font-semibold">
                Create Account
              </Button>
            </Link>
            <Link href="/submit">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 h-12 px-8 bg-transparent">
                Submit Without Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">AI-CMS PUCIT</span>
          </div>
          <p className="text-sm">Punjab University College of Information Technology</p>
          <p className="text-xs mt-2 text-gray-600">© {new Date().getFullYear()} PUCIT. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
