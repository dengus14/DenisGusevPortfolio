'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NavBar from '@/components/NavBar'
import OrbitalHero, { type OrbitalHeroHandle, type NodeId } from '@/components/OrbitalHero'
import ExperienceCard from '@/components/cards/ExperienceCard'
import ProjectsCard from '@/components/cards/ProjectsCard'
import ContactCard from '@/components/cards/ContactCard'
import LinksCard from '@/components/cards/LinksCard'

export default function Home() {
  const orbitalRef = useRef<OrbitalHeroHandle>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeNode, setActiveNode] = useState<NodeId | null>(null)
  const [scrollTick, setScrollTick] = useState(0)
  const rafRef = useRef<number | null>(null)

  // Eased scroll to a target position over `duration` ms.
  const smoothScrollTo = useCallback((target: number, duration: number) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    const start     = window.scrollY
    const distance  = target - start
    const startTime = performance.now()

    // Ease in-out cubic
    function ease(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    function tick(now: number) {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      window.scrollTo(0, start + distance * ease(progress))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const handleNodeChange = (id: NodeId | null) => {
    setActiveNode(id)
    if (id !== null) setScrollTick((n) => n + 1)
  }

  // After orbit rotation finishes, slowly scroll down to the section.
  useEffect(() => {
    if (!activeNode) return
    const t = setTimeout(() => {
      const top = sectionRef.current?.getBoundingClientRect().top ?? 0
      smoothScrollTo(window.scrollY + top, 1400)
    }, 950)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollTick])

  // Scroll back to top when node is cleared.
  useEffect(() => {
    if (activeNode === null) smoothScrollTo(0, 1000)
  }, [activeNode, smoothScrollTo])

  return (
    <main className="bg-[#0a0a0f] overflow-x-hidden">
      <NavBar onSelectNode={(node) => orbitalRef.current?.selectNode(node)} />

      <OrbitalHero ref={orbitalRef} onNodeChange={handleNodeChange} />

      {/* Persistent section — always in the DOM when a node is active so
          sectionRef is stable and scrollIntoView always has a real target. */}
      <div ref={sectionRef}>
        <AnimatePresence mode="wait">
          {activeNode && (
            <motion.section
              key={activeNode}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="min-h-screen flex items-start justify-center px-6 md:px-16 py-24 border-t border-white/5"
            >
              {activeNode === 'experience' && <ExperienceCard />}
              {activeNode === 'projects'   && <ProjectsCard />}
              {activeNode === 'contact'    && <ContactCard />}
              {activeNode === 'links'      && <LinksCard />}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
