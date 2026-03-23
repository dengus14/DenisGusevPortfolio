'use client'

export default function ExperienceCard() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">
        Experience
      </h2>

      <div className="space-y-2">
        {/* Role header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <p className="text-white font-semibold text-lg">Acme Corp</p>
            <p className="text-blue-300/80 text-sm">Software Engineering Intern</p>
          </div>
          <span className="text-gray-500 text-sm">Jun – Aug 2024</span>
        </div>

        {/* Bullets */}
        <ul className="mt-4 space-y-2 pl-4 border-l border-blue-500/20">
          <li className="text-gray-400 text-sm leading-relaxed">
            Built and shipped a real-time dashboard feature used by 500+ internal users.
          </li>
          <li className="text-gray-400 text-sm leading-relaxed">
            Reduced API response latency by 40% through query optimisation and caching.
          </li>
          <li className="text-gray-400 text-sm leading-relaxed">
            Collaborated with design and product to ship three A/B tests in six weeks.
          </li>
        </ul>
      </div>
    </div>
  )
}
