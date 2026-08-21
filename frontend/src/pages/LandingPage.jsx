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
    <main className="overflow-x-hidden w-full max-w-full bg-[#05060d] text-slate-100 min-h-screen selection:bg-purple-500 selection:text-white font-sans">
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