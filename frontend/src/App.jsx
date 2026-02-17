import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RegisterLawyer from './pages/RegisterLawyer';
import UserDashboard from './pages/UserDashboard';
import LawyerDashboard from './pages/LawyerDashboard';
import { AuthProvider } from './context/AuthContext';

// Placeholders for now
const Loading = () => <div className="flex h-screen items-center justify-center text-primary font-bold">Loading...</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register-lawyer" element={<RegisterLawyer />} />
          <Route path="/user-dashboard/*" element={<UserDashboard />} />
          <Route path="/lawyer-dashboard/*" element={<LawyerDashboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
