import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import Layout from './Layout'
import AnalyzeResume from '@/pages/AnalyzeResume'
import MockInterview from '@/pages/MockInterview'
import HRPrep from '@/pages/HRPrep'
import CommunicationLab from '@/pages/CommunicationLab'
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
import StudyLibrary from '@/pages/StudyLibrary'
import PlacementArena from '@/pages/PlacementArena'
import CareerCoach from '@/pages/CareerCoach'
import VtopDetails from '@/pages/VtopDetails'

function Routings() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/resume" element={<AnalyzeResume />} />
          <Route path="/interview" element={<MockInterview />} />
          <Route path="/hr-prep" element={<HRPrep />} />
          <Route path="/communication" element={<CommunicationLab />} />
          <Route path="/company-intel" element={<CompanyIntelligence />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/coding" element={<CodingArena />} />
          <Route path="/sheets" element={<DSAContent defaultTab="sheets" />} />
          <Route path="/development" element={<Development />} />
          <Route path="/job" element={<JobRecommendations />} />
          <Route path="/jobs" element={<JobRecommendations />} />
          <Route path="/onboarding" element={<CareerCoach />} />
          <Route path="/onboarding/coach" element={<CareerCoach />} />

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
            <Route path="communication" element={<CommunicationLab />} />
            <Route path="company-intel" element={<CompanyIntelligence />} />
            <Route path="job" element={<JobRecommendations />} />
            <Route path="jobs" element={<JobRecommendations />} />
            <Route path="profile" element={<Profile />} />

            {/* New Group C Surfaces */}
            <Route path="academics" element={<Academics />} />
            <Route path="vtop" element={<VtopDetails />} />
            <Route path="progress" element={<ProgressTracker />} />
            <Route path="milestones" element={<Milestones />} />
            <Route path="roadmap" element={<PlacementRoadmap />} />
            <Route path="library" element={<StudyLibrary />} />
            <Route path="arena" element={<PlacementArena />} />
            <Route path="coach" element={<CareerCoach />} />
          </Route>
        </Routes>
      </Router>
    </div>
  )
}

export default Routings
