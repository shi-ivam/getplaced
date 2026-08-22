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
    <main className="overflow-x-hidden w-full max-w-full bg-[#1A312C] text-[#FFF4E1] min-h-screen selection:bg-[#89D7B7] selection:text-[#1A312C] font-sans">
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