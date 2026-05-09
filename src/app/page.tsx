import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fbf9fa', color: '#1b1c1d', fontFamily: 'Inter, sans-serif' }}>

      {/* Top Navbar */}
      <header
        className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-16 border-b"
        style={{ backgroundColor: '#ffffff', borderColor: '#c3c6d1' }}
      >
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-bold tracking-tight" style={{ color: '#001e40' }}>
            AI-CMS PUCIT
          </Link>
          <nav className="hidden md:flex gap-1 h-full items-center">
            <a
              href="/"
              className="border-b-2 font-bold h-16 flex items-center px-2 pt-1 text-sm transition-all"
              style={{ color: '#001e40', borderColor: '#001e40' }}
            >
              Home
            </a>
            <Link
              href="/submit"
              className="h-16 flex items-center px-2 text-sm transition-colors hover:bg-gray-50 rounded-md"
              style={{ color: '#43474f' }}
            >
              Submit
            </Link>
            <Link
              href="/track"
              className="h-16 flex items-center px-2 text-sm transition-colors hover:bg-gray-50 rounded-md"
              style={{ color: '#43474f' }}
            >
              Track
            </Link>
            <a
              href="#about"
              className="h-16 flex items-center px-2 text-sm transition-colors hover:bg-gray-50 rounded-md"
              style={{ color: '#43474f' }}
            >
              About
            </a>
          </nav>
        </div>
        <div className="flex items-center">
          <Link
            href="/login"
            className="text-sm border rounded px-4 py-1.5 transition-colors hover:bg-gray-50"
            style={{ color: '#43474f', borderColor: '#c3c6d1' }}
          >
            Admin Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-16 pb-20 lg:pb-0">

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32 flex flex-col items-center text-center">
          <h1
            className="text-5xl md:text-6xl font-bold leading-tight tracking-tight max-w-4xl mb-6"
            style={{ color: '#001e40', letterSpacing: '-0.02em', lineHeight: '1.1' }}
          >
            Report. Track. Resolve.
          </h1>
          <p
            className="text-base md:text-lg max-w-2xl mb-10 leading-relaxed"
            style={{ color: '#43474f' }}
          >
            Streamlining complaint management for university excellence. An intelligent system designed to classify, route, and resolve campus issues with unprecedented speed and transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/submit"
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-sm font-medium shadow-sm transition-colors"
              style={{ backgroundColor: '#001e40', color: '#ffffff' }}
            >
              Submit Complaint
            </Link>
            <Link
              href="/track"
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50"
              style={{ backgroundColor: '#ffffff', color: '#001e40', borderColor: '#c3c6d1' }}
            >
              Track by ID
            </Link>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-24">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y"
            style={{ borderColor: '#c3c6d1' }}
          >
            {[
              { value: '98%', label: 'Resolved' },
              { value: '<24h', label: 'Avg Response' },
              { value: '12k+', label: 'Complaints' },
              { value: '5', label: 'Departments' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <span
                  className="text-3xl font-semibold mb-1"
                  style={{ color: '#001e40', lineHeight: '1.2', letterSpacing: '-0.01em' }}
                >
                  {value}
                </span>
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: '#43474f' }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4" style={{ color: '#001e40' }}>How it works</h2>
            <p className="text-sm" style={{ color: '#43474f' }}>A streamlined process powered by intelligent routing.</p>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-start gap-8">
            {/* Step 1 */}
            <div className="flex-1 flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 border"
                style={{ backgroundColor: '#efedee', borderColor: '#c3c6d1', color: '#001e40' }}
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#001e40' }}>Submit</h3>
              <p className="text-sm max-w-xs" style={{ color: '#43474f' }}>Easily lodge your complaint with relevant details and attachments.</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex flex-1 items-center justify-center pt-8">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#c3c6d1" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>

            {/* Step 2 */}
            <div className="flex-1 flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 border"
                style={{ backgroundColor: '#d4e3ff', borderColor: '#a7c8ff', color: '#001e40' }}
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.332 2.798H4.13c-1.362 0-2.333-1.799-1.332-2.798L4.2 15.3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#001e40' }}>AI Routes</h3>
              <p className="text-sm max-w-xs" style={{ color: '#43474f' }}>Our system instantly classifies and assigns the issue to the correct department.</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex flex-1 items-center justify-center pt-8">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#c3c6d1" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>

            {/* Step 3 */}
            <div className="flex-1 flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 border"
                style={{ backgroundColor: '#efedee', borderColor: '#c3c6d1', color: '#001e40' }}
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#001e40' }}>Resolved</h3>
              <p className="text-sm max-w-xs" style={{ color: '#43474f' }}>Track progress in real-time until a satisfactory resolution is achieved.</p>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 - large */}
            <div
              className="md:col-span-2 rounded-xl border p-8 flex flex-col justify-between shadow-sm"
              style={{ backgroundColor: '#ffffff', borderColor: '#c3c6d1', minHeight: '300px' }}
            >
              <div>
                <svg className="w-8 h-8 mb-4" viewBox="0 0 24 24" fill="none" stroke="#001e40" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#001e40' }}>AI Auto-classification</h3>
                <p className="text-sm max-w-md leading-relaxed" style={{ color: '#43474f' }}>
                  Eliminate manual sorting. Our NLP models analyze complaint text to accurately categorize and route issues to the precise desk, reducing handling time by 40%.
                </p>
              </div>
              <div
                className="mt-8 h-24 w-full rounded-lg opacity-50"
                style={{ background: 'linear-gradient(to right, #ffffff, #efedee)', border: '1px solid #c3c6d1' }}
              />
            </div>

            {/* Feature 2 */}
            <div
              className="rounded-xl border p-8 flex flex-col shadow-sm"
              style={{ backgroundColor: '#ffffff', borderColor: '#c3c6d1' }}
            >
              <svg className="w-8 h-8 mb-4" viewBox="0 0 24 24" fill="none" stroke="#001e40" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#001e40' }}>Anonymous submission</h3>
              <p className="text-sm leading-relaxed flex-grow" style={{ color: '#43474f' }}>
                Foster a safe environment. Users can report sensitive issues completely anonymously, ensuring privacy and encouraging transparency without fear of repercussion.
              </p>
            </div>

            {/* Feature 3 - full width */}
            <div
              className="md:col-span-3 rounded-xl border p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm"
              style={{ backgroundColor: '#ffffff', borderColor: '#c3c6d1' }}
            >
              <div className="flex-1">
                <svg className="w-8 h-8 mb-4" viewBox="0 0 24 24" fill="none" stroke="#001e40" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#001e40' }}>Real-time tracking</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#43474f' }}>
                  Every stakeholder stays informed. Track the status of any complaint with a unique ID, view audit logs, and receive automated updates upon status changes.
                </p>
              </div>
              <div
                className="flex-1 w-full rounded-lg p-4 flex flex-col gap-3 border"
                style={{ backgroundColor: '#ffffff', borderColor: '#c3c6d1' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#d5e3ff' }} />
                  <div className="h-2 w-1/3 rounded" style={{ backgroundColor: '#e3e2e3' }} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#e3e2e3' }} />
                  <div className="h-2 w-1/2 rounded" style={{ backgroundColor: '#e3e2e3' }} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#e3e2e3' }} />
                  <div className="h-2 w-1/4 rounded" style={{ backgroundColor: '#e3e2e3' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-24 text-center" id="about">
          <p
            className="text-xs font-medium uppercase tracking-widest mb-8"
            style={{ color: '#43474f' }}
          >
            Trusted by academic institutions
          </p>
          <div className="flex justify-center items-center gap-12 opacity-60 grayscale">
            <span className="text-2xl font-bold" style={{ color: '#43474f' }}>
              University of the Punjab
            </span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="w-full py-8 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t mt-auto"
        style={{ backgroundColor: '#ffffff', borderColor: '#c3c6d1' }}
      >
        <div className="text-sm font-bold" style={{ color: '#001e40' }}>
          © 2024 AI-CMS PUCIT. University of the Punjab.
        </div>
        <div className="flex gap-6">
          <a href="#" className="text-xs transition-colors hover:text-[#001e40]" style={{ color: '#43474f' }}>Privacy Policy</a>
          <a href="#" className="text-xs transition-colors hover:text-[#001e40]" style={{ color: '#43474f' }}>Guidelines</a>
          <a href="#" className="text-xs transition-colors hover:text-[#001e40]" style={{ color: '#43474f' }}>Contact Support</a>
        </div>
      </footer>
    </div>
  )
}
