'use client'

// NavBar receives an optional callback so clicking a nav link triggers
// the same orbital rotation as clicking a node directly.
interface NavBarProps {
  onSelectNode?: (node: 'experience' | 'projects' | 'contact' | null) => void
}

const LINKS = [
  { label: 'About', node: null },
  { label: 'Experience', node: 'experience' },
  { label: 'Projects', node: 'projects' },
  { label: 'Contact', node: 'contact' },
] as const

export default function NavBar({ onSelectNode }: NavBarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-transparent backdrop-blur-md border-b border-white/5">
      {/* Logo / Name */}
      <span className="text-white font-semibold text-sm tracking-wide">
        Your<span className="text-blue-400">Name</span>
      </span>

      {/* Links */}
      <ul className="flex items-center gap-6">
        {LINKS.map(({ label, node }) => (
          <li key={label}>
            <button
              onClick={() => onSelectNode?.(node)}
              className="text-gray-400 hover:text-blue-300 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:text-blue-300"
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
