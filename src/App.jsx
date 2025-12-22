import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './features/auth/authSlice';
import Header from './components/Header';
import ResultatsDepartement from './pages/ResultatsDepartement';
import CandidatDetail from './pages/CandidatDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import LieuxVote from './pages/LieuxVote';

const MobileWarning = () => (
  <div className="fixed inset-0 bg-brand-900 z-50 flex flex-col justify-center items-center p-8 text-center text-white">
    <div className="mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </div>
    <h1 className="text-3xl font-bold mb-4">Version Desktop Uniquement</h1>
    <p className="text-brand-100 text-lg max-w-md">
      Pour une expérience optimale de consultation des résultats électoraux, veuillez accéder à cette application depuis un ordinateur.
    </p>
  </div>
);

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      <Header />
      <main>
        {children}
      </main>
    </>
  );
};

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 700);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <MobileWarning />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <ProtectedRoute>
              <ResultatsDepartement />
            </ProtectedRoute>
          } />

          <Route path="/departement/:id" element={
            <ProtectedRoute>
              <ResultatsDepartement />
            </ProtectedRoute>
          } />

          <Route path="/departement/:id/lieux-vote" element={
            <ProtectedRoute>
              <LieuxVote />
            </ProtectedRoute>
          } />

          <Route path="/candidat/:id" element={
            <ProtectedRoute>
              <CandidatDetail />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
