'use client'

export default function ContactCard() {
  return (
    <div className="w-full max-w-xl mx-auto">
      <h2 className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">
        Contact
      </h2>

      <p className="text-gray-400 text-sm leading-relaxed mb-6">
        I&apos;m currently open to new opportunities. Whether you have a question,
        a project idea, or just want to say hi — my inbox is always open.
        I&apos;ll do my best to get back to you.
      </p>

      <a
        href="mailto:yourname@email.com"
        className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        yourname@email.com
      </a>
    </div>
  )
}
