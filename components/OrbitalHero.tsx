'use client'

/**
 * OrbitalHero — 3D orbital animation system
 *
 * ── 3D Projection Math ───────────────────────────────────────────────────────
 * We simulate a ring tilted ~70° toward the viewer using a parametric ellipse.
 *
 * Each node has a "home angle" (0°, 90°, 180°, 270°). The whole orbit has one
 * accumulated `rotation` value. A node's current angle is:
 *
 *   angleDeg = homeAngle + rotation
 *
 * We convert to radians with 0° = 12-o'clock, increasing clockwise:
 *
 *   angleRad = (angleDeg - 90) * (π / 180)
 *
 * Then project onto the tilted ellipse:
 *
 *   x = cos(angleRad) * ORBIT_RADIUS_X
 *   y = sin(angleRad) * ORBIT_RADIUS_Y   (compressed ~35% → ~70° tilt)
 *
 * depth = sin(angleRad):  +1 = front (closest),  -1 = back (behind photo)
 *
 * ── Snap-to-front ────────────────────────────────────────────────────────────
 * FRONT_ANGLE = 180 → depth = +1 (bottom of ellipse, closest to viewer).
 * Click spins the orbit via Framer's imperative animate() on a MotionValue.
 *
 * ── Z-index layering ─────────────────────────────────────────────────────────
 * center photo  → z-index 10
 * front nodes   → z-index 20  (depth > 0)
 * back nodes    → z-index 5   (depth ≤ 0, occluded by photo)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react'
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  animate,
} from 'framer-motion'

// ── Types ────────────────────────────────────────────────────────────────────

export type NodeId = 'experience' | 'projects' | 'contact' | 'links'

interface OrbitalNode {
  id: NodeId
  label: string
  homeAngle: number
  icon: React.ReactNode
}

interface NodeVisuals {
  x: number
  y: number
  depth: number
  normalizedDepth: number
  scale: number
  opacity: number
  zIndex: number
  blur: number
  glowAlpha: number
  showLabel: boolean
}

// ── Constants ────────────────────────────────────────────────────────────────

const ORBIT_RADIUS_X = 390
const ORBIT_RADIUS_Y = 135
const FRONT_ANGLE    = 180
const SNAP_DURATION  = 0.9

// ── Helpers ──────────────────────────────────────────────────────────────────

function mod360(a: number): number {
  return ((a % 360) + 360) % 360
}

function shortestArc(from: number, to: number): number {
  const diff = mod360(to - from)
  return diff > 180 ? diff - 360 : diff
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}

function getNodeVisuals(angleDeg: number): NodeVisuals {
  const angleRad       = (angleDeg - 90) * (Math.PI / 180)
  const x              = Math.cos(angleRad) * ORBIT_RADIUS_X
  const y              = Math.sin(angleRad) * ORBIT_RADIUS_Y
  const depth          = Math.sin(angleRad)
  const normalizedDepth = (depth + 1) / 2

  return {
    x,
    y,
    depth,
    normalizedDepth,
    scale:     lerp(0.45, 1.35, normalizedDepth),
    opacity:   lerp(0.18, 1.0,  normalizedDepth),
    zIndex:    depth > 0 ? 20 : 5,
    blur:      depth < 0 ? lerp(2.5, 0, normalizedDepth * 2) : 0,
    glowAlpha: lerp(0, 1, normalizedDepth),
    showLabel: depth > -0.15,
  }
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function BriefcaseIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}

// ── Node definitions — 4 nodes equally spaced at 90° intervals ───────────────

const NODES: OrbitalNode[] = [
  { id: 'experience', label: 'Experience', homeAngle: 0,   icon: <BriefcaseIcon /> },
  { id: 'projects',   label: 'Projects',   homeAngle: 90,  icon: <FolderIcon /> },
  { id: 'contact',    label: 'Contact',    homeAngle: 180, icon: <MailIcon /> },
  { id: 'links',      label: 'Links',      homeAngle: 270, icon: <LinkIcon /> },
]

// ── Star background ──────────────────────────────────────────────────────────

function StarField() {
  const stars = Array.from({ length: 120 }, (_, i) => {
    const seed = i * 137.508
    return {
      x:        mod360(seed * 2.61803) / 360 * 100,
      y:        mod360(seed * 3.14159) / 360 * 100,
      size:     i % 3 === 0 ? 'star-lg' : i % 2 === 0 ? 'star-md' : 'star-sm',
      duration: 2 + (i % 5),
      delay:    (i % 8) * 0.4,
    }
  })

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          className={`star ${s.size}`}
          style={{
            left: `${s.x}%`,
            top:  `${s.y}%`,
            ['--duration' as string]: `${s.duration}s`,
            ['--delay'    as string]: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// ── Public handle ────────────────────────────────────────────────────────────

export interface OrbitalHeroHandle {
  selectNode:  (id: NodeId | null) => void
  rotationMV:  ReturnType<typeof useMotionValue<number>>
}

interface OrbitalHeroProps {
  onNodeChange?: (id: NodeId | null) => void
}

// ── Main component ────────────────────────────────────────────────────────────

const OrbitalHero = forwardRef<OrbitalHeroHandle, OrbitalHeroProps>(
  function OrbitalHero({ onNodeChange }, ref) {
    const [activeNode, setActiveNode] = useState<NodeId | null>(null)

    const rotationMV = useMotionValue(0)
    const [rotationDisplay, setRotationDisplay] = useState(0)
    useMotionValueEvent(rotationMV, 'change', (v) => setRotationDisplay(v))

    const snapToNode = useCallback((id: NodeId) => {
      const node         = NODES.find((n) => n.id === id)!
      const currentAngle = mod360(node.homeAngle + rotationMV.get())
      const delta        = shortestArc(currentAngle, FRONT_ANGLE)
      animate(rotationMV, rotationMV.get() + delta, {
        duration: SNAP_DURATION,
        ease: [0.4, 0, 0.2, 1],
      })
    }, [rotationMV])

    const setActive = useCallback((id: NodeId | null) => {
      setActiveNode(id)
      onNodeChange?.(id)
    }, [onNodeChange])

    const handleNodeClick = useCallback((id: NodeId) => {
      if (activeNode === id) {
        setActive(null)
      } else {
        setActive(id)
        snapToNode(id)
      }
    }, [activeNode, snapToNode, setActive])

    const handleCentreClick = useCallback(() => {
      setActive(null)
    }, [setActive])

    useImperativeHandle(ref, () => ({
      selectNode(id: NodeId | null) {
        if (id === null) handleCentreClick()
        else handleNodeClick(id)
      },
      rotationMV,
    }))

    // Container fits the ellipse; no extra room needed for cards (they live below).
    const containerW = ORBIT_RADIUS_X * 2 + 300
    const containerH = ORBIT_RADIUS_Y * 2 + 260

    const orbitCX = containerW / 2
    const orbitCY = containerH / 2

    return (
      <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-[#0a0a0f]">
        <StarField />

        {/* ── Desktop 3D orbital layout ── */}
        <div className="hidden md:flex items-center justify-center w-full">
          <div className="relative" style={{ width: containerW, height: containerH }}>

            {/* Orbital ring ellipse */}
            <div
              className="orbital-ring-3d absolute pointer-events-none"
              style={{
                width:  ORBIT_RADIUS_X * 2,
                height: ORBIT_RADIUS_Y * 2,
                left:   orbitCX - ORBIT_RADIUS_X,
                top:    orbitCY - ORBIT_RADIUS_Y,
              }}
            />

            {/* Center: photo + bio — outer div owns position, inner motion.div owns scale */}
            <div
              className="absolute"
              style={{
                left:      orbitCX,
                top:       orbitCY,
                transform: 'translate(-50%, -50%)',
                zIndex:    10,
              }}
            >
              <motion.div
                className="flex flex-col items-center gap-3 cursor-pointer"
                animate={{ scale: activeNode ? 0.82 : 1 }}
                transition={{ duration: SNAP_DURATION, ease: 'easeInOut' }}
                onClick={handleCentreClick}
              >
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(13,17,23,0.95) 55%, transparent 80%)',
                      transform:  'scale(1.9)',
                      zIndex:     -1,
                    }}
                  />
                  <div
                    className="w-40 h-40 rounded-full border-2 border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10 overflow-hidden"
                    style={{ background: 'radial-gradient(circle at 40% 35%, #1e3a5f 0%, #0d1117 70%)' }}
                  >
                    <span className="text-6xl select-none">👤</span>
                  </div>
                </div>
                <div className="text-center">
                  <h1 className="text-white font-bold text-2xl tracking-tight">Your Name</h1>
                  <p className="text-blue-300/70 text-base mt-1">Full-Stack Developer · Builder of things</p>
                </div>
              </motion.div>
            </div>

            {/* Orbital nodes */}
            {[...NODES]
              .map((node) => ({
                node,
                visuals: getNodeVisuals(node.homeAngle + rotationDisplay),
              }))
              .sort((a, b) => a.visuals.depth - b.visuals.depth)
              .map(({ node, visuals }) => {
                const { x, y, scale, opacity, zIndex, blur, glowAlpha, showLabel } = visuals
                const isActive   = activeNode === node.id
                const finalScale = isActive ? scale * 1.12 : scale
                const NODE_HALF  = 48

                const glow = `0 0 ${Math.round(12 * glowAlpha)}px rgba(59,130,246,${(0.55 * glowAlpha).toFixed(2)}), 0 0 ${Math.round(28 * glowAlpha)}px rgba(59,130,246,${(0.2 * glowAlpha).toFixed(2)})`

                return (
                  <motion.button
                    key={node.id}
                    className="absolute flex flex-col items-center gap-1.5 rounded-full bg-[#0d1117] border border-blue-500/30 w-24 h-24 justify-center focus-visible:outline-none"
                    style={{
                      left:       orbitCX + x - NODE_HALF,
                      top:        orbitCY + y - NODE_HALF,
                      zIndex,
                      transform:  `scale(${finalScale})`,
                      opacity,
                      filter:     blur > 0 ? `blur(${blur.toFixed(1)}px)` : 'none',
                      boxShadow:  glow,
                      transition: 'none',
                    }}
                    onClick={() => handleNodeClick(node.id)}
                    aria-label={node.label}
                  >
                    <span style={{ color: isActive ? '#93c5fd' : `rgba(96,165,250,${Math.max(0.4, opacity)})` }}>
                      {node.icon}
                    </span>
                    {showLabel && (
                      <span
                        className="text-xs font-medium leading-none"
                        style={{
                          color:   `rgba(156,163,175,${opacity})`,
                          opacity: Math.max(0, (visuals.depth + 0.15) / 1.15),
                        }}
                      >
                        {node.label}
                      </span>
                    )}
                  </motion.button>
                )
              })}
          </div>
        </div>

        {/* ── Mobile: vertical stack ── */}
        <div className="md:hidden flex flex-col items-center gap-4 px-6 pt-24 pb-8 w-full">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-24 h-24 rounded-full border-2 border-blue-500/30 flex items-center justify-center overflow-hidden"
              style={{ background: 'radial-gradient(circle at 40% 35%, #1e3a5f 0%, #0d1117 70%)' }}
            >
              <span className="text-3xl select-none">👤</span>
            </div>
            <div className="text-center">
              <h1 className="text-white font-bold text-2xl">Your Name</h1>
              <p className="text-blue-300/70 text-sm mt-1">Full-Stack Developer · Builder of things</p>
            </div>
          </div>
        </div>
      </section>
    )
  }
)

export default OrbitalHero
