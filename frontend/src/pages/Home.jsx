import React from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import HeroSection from '@/components/Hero/HeroSection'
import FeaturesSection from '@/components/Hero/FeaturesSection'
import StatsSection from '@/components/Hero/StatsSection'
import CTASection from '@/components/Hero/CTASection'

const SectionDivider = () => (
  <div className="relative h-px w-full">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border to-transparent opacity-50"></div>
  </div>
)

const Home = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/20 selection:text-primary">

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
        style={{ scaleX }}
      />

      <main className="flex flex-col">
        

        <section id="hero">
          <HeroSection />
        </section>

        <SectionDivider />

        <section id="features">
          <FeaturesSection />
        </section>

        <SectionDivider />

        <section id="stats">
          <StatsSection />
        </section>

        <SectionDivider />

        <section id="cta">
          <CTASection />
        </section>
      </main>
    </div>
  )
}

export default Home