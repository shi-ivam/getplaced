import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import Layout from './Layout'
import AnalyzeResume from '@/pages/AnalyzeResume'
import MockInterview from '@/pages/MockInterview'
import HRPrep from '@/pages/HRPrep'
import CompanyIntelligence from '@/pages/CompanyIntelligence'

import LoginPage from '@/pages/Login'
import RegisterPage from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import JobRecommendations from '@/pages/JobRecommendations'
import Profile from '@/pages/Profile'
import DSAContent from '@/pages/DSAcontent'
import CodingArena from '@/pages/CodingArena'
import CodingWorkspace from '@/pages/CodingWorkspace'
import Development from '@/pages/Development'

// Group C Pages (#28 - #44)
import Academics from '@/pages/Academics'
import ProgressTracker from '@/pages/ProgressTracker'
import Milestones from '@/pages/Milestones'
import PlacementRoadmap from '@/pages/PlacementRoadmap'
import PlacementArena from '@/pages/PlacementArena'
import CareerCoach from '@/pages/CareerCoach'
import VtopDetails from '@/pages/VtopDetails'
import PrivacyProtection from '@/pages/PrivacyProtection'
import CanIApply from '@/pages/CanIApply'
import WhichRoleFitsMe from '@/pages/WhichRoleFitsMe'


function Routings() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/resume" element={<AnalyzeResume />} />
          <Route path="/interview" element={<MockInterview />} />
          <Route path="/hr-prep" element={<HRPrep />} />
          <Route path="/company-intel" element={<CompanyIntelligence />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/coding" element={<CodingArena />} />
          <Route path="/coding/:slug" element={<CodingWorkspace />} />
          <Route path="/problems" element={<CodingArena />} />
          <Route path="/problems/:slug" element={<CodingWorkspace />} />
          <Route path="/dsa" element={<DSAContent />} />
          <Route path="/sheets" element={<DSAContent defaultTab="sheets" />} />
          <Route path="/sheets/:sheetId" element={<DSAContent defaultTab="sheets" />} />
          <Route path="/development" element={<Development />} />
          <Route path="/job" element={<JobRecommendations />} />
          <Route path="/jobs" element={<JobRecommendations />} />
          <Route path="/role-fit" element={<WhichRoleFitsMe />} />
          <Route path="/which-role-fits-me" element={<WhichRoleFitsMe />} />
          <Route path="/can-i-apply" element={<CanIApply />} />
          <Route path="/onboarding" element={<CareerCoach />} />
          <Route path="/onboarding/coach" element={<CareerCoach />} />
          <Route path="/privacy" element={<div className="min-h-screen bg-[#09090b] text-zinc-100"><PrivacyProtection /></div>} />
          <Route path="/terms" element={
            <div className="min-h-screen bg-[#09090b] text-zinc-100 p-8 max-w-4xl mx-auto space-y-6 pt-24">
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Terms of Service</h1>
              <p className="text-zinc-400 leading-relaxed text-sm">
                Welcome to getPlaced. By accessing or using the platform, interview simulation tools, resume analysis, and preparation resources, you agree to these terms.
              </p>
              <h2 className="text-lg font-semibold text-zinc-200">1. User Account & Security</h2>
              <p className="text-zinc-400 text-sm">
                Users are responsible for maintaining credential confidentiality. Session telemetry and simulation data are protected under standard encryption protocols.
              </p>
              <h2 className="text-lg font-semibold text-zinc-200">2. Platform Usage & AI Telemetry</h2>
              <p className="text-zinc-400 text-sm">
                The platform provides interview practice, speech analysis, and coding environments for placement preparation. User data is isolated and never used for public model training.
              </p>
            </div>
          } />


          {/* Authenticated Dashboard App Shell */}
          <Route path="/app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dsa" element={<DSAContent />} />
            <Route path="sheets" element={<DSAContent defaultTab="sheets" />} />
            <Route path="sheets/:sheetId" element={<DSAContent defaultTab="sheets" />} />
            <Route path="coding" element={<CodingArena />} />
            <Route path="coding/:slug" element={<CodingWorkspace />} />
            <Route path="problems" element={<CodingArena />} />
            <Route path="problems/:slug" element={<CodingWorkspace />} />
            <Route path="development" element={<Development />} />
            <Route path="resume" element={<AnalyzeResume />} />
            <Route path="interview" element={<MockInterview />} />
            <Route path="hr-prep" element={<HRPrep />} />
            <Route path="company-intel" element={<CompanyIntelligence />} />
            <Route path="job" element={<JobRecommendations />} />
            <Route path="jobs" element={<JobRecommendations />} />
            <Route path="role-fit" element={<WhichRoleFitsMe />} />
            <Route path="which-role-fits-me" element={<WhichRoleFitsMe />} />
            <Route path="can-i-apply" element={<CanIApply />} />
            <Route path="profile" element={<Profile />} />

            {/* New Group C Surfaces */}
            <Route path="academics" element={<Academics />} />
            <Route path="vtop" element={<VtopDetails />} />
            <Route path="progress" element={<ProgressTracker />} />
            <Route path="milestones" element={<Milestones />} />
            <Route path="roadmap" element={<PlacementRoadmap />} />
            <Route path="arena" element={<PlacementArena />} />
            <Route path="coach" element={<CareerCoach />} />
          </Route>
        </Routes>
      </Router>
    </div>
  )
}

export default Routings
