'use client'

const PROJECTS = [
  {
    name: 'Orbital UI Kit',
    description: 'A component library built around circular, physics-inspired layouts.',
    stack: ['React', 'TypeScript', 'Framer Motion'],
    github: '#',
  },
  {
    name: 'DevSync',
    description: 'Real-time collaborative code editor with presence indicators.',
    stack: ['Next.js', 'WebSockets', 'Redis'],
    github: '#',
  },
  {
    name: 'Pulsecheck',
    description: 'Lightweight uptime monitoring with Slack and email alerting.',
    stack: ['Go', 'PostgreSQL', 'Docker'],
    github: '#',
  },
  {
    name: 'Notelo',
    description: 'Markdown notes app with AI-powered summarisation.',
    stack: ['SvelteKit', 'OpenAI API', 'SQLite'],
    github: '#',
  },
]

function GitHubIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  )
}

export default function ProjectsCard() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">
        Projects
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PROJECTS.map((project) => (
          <div
            key={project.name}
            className="bg-[#0d1117] border border-blue-500/10 rounded-xl p-5 flex flex-col gap-3 hover:border-blue-500/25 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-white font-semibold">{project.name}</p>
              <a
                href={project.github}
                className="text-gray-600 hover:text-blue-400 transition-colors shrink-0 mt-0.5"
                aria-label={`GitHub — ${project.name}`}
              >
                <GitHubIcon />
              </a>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed flex-1">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
