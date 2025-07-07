import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VotingProvider } from './context/VotingContext';
import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';
import Home from './pages/Home';
import VoterRegister from './pages/VoterRegister';
import VoterLogin from './pages/VoterLogin';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Elections from './pages/Elections';
import VotingBooth from './pages/VotingBooth';
import Results from './pages/Results';
import VoteConfirmation from './pages/VoteConfirmation';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <VotingProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Navbar />
            <NotificationToast />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<VoterRegister />} />
              <Route path="/login" element={<VoterLogin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/elections" 
                element={
                  <ProtectedRoute>
                    <Elections />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vote/:electionId" 
                element={
                  <ProtectedRoute>
                    <VotingBooth />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vote-confirmation" 
                element={
                  <ProtectedRoute>
                    <VoteConfirmation />
                  </ProtectedRoute>
                } 
              />
              <Route path="/results" element={<Results />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </VotingProvider>
    </AuthProvider>
  );
}

export default App;