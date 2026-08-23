import React from 'react'
import Navbar from '../components/Navbar'
import Hero from './Hero'
import FeaturesGrid from './Feature'
import MeetingsShowcase from './Meeting'
import ResumeAnalyzer from './ResumeAnalyzer'
import PrivacyProtection from './PrivacyProtection'
import Footer from './Footer'

function LandingPage() {
  return (
    <main className="overflow-x-hidden w-full max-w-full bg-[#09090b] text-zinc-100 min-h-screen selection:bg-emerald-500/30 selection:text-white font-sans">
      <Navbar />
      <Hero />
      <FeaturesGrid />
      <MeetingsShowcase />
      <ResumeAnalyzer />
      <PrivacyProtection />
      <Footer />
    </main>
  )
}

export default LandingPage