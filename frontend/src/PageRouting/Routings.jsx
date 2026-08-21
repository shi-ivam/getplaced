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
          <Route path="/coding/:slug" element={<CodingWorkspace />} />

          {/* Authenticated / App Shell Routes */}
          <Route path="/app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dsa" element={<DSAContent />} />
            <Route path="coding" element={<CodingArena />} />
            <Route path="coding/:slug" element={<CodingWorkspace />} />
            <Route path="problems" element={<CodingArena />} />
            <Route path="problems/:slug" element={<CodingWorkspace />} />
            <Route path="resume" element={<AnalyzeResume />} />
            <Route path="interview" element={<MockInterview />} />
            <Route path="hr-prep" element={<HRPrep />} />
            <Route path="communication" element={<CommunicationLab />} />
            <Route path="company-intel" element={<CompanyIntelligence />} />
            <Route path="job" element={<JobRecommendations />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </div>
  )
}

export default Routings