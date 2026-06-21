import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import LotsListPage   from './pages/LotsListPage'
import LotDetailPage  from './pages/LotDetailPage'
import BookingsPage   from './pages/BookingsPage'
import ProfilePage    from './pages/ProfilePage'
import { useAuth } from './contexts/AuthContext'

function Protected({ children }) {
  const { isAuth, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen animated-bg flex items-center justify-center">
      <div className="spinner" />
    </div>
  )
  return isAuth ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15,15,25,0.95)',
            color: '#f1f5f9',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: 'transparent' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: 'transparent' } },
        }}
      />
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />

        {/* Protected */}
        <Route path="/lots"        element={<Protected><LotsListPage /></Protected>} />
        <Route path="/lots/:id"    element={<Protected><LotDetailPage /></Protected>} />
        <Route path="/bookings"    element={<Protected><BookingsPage /></Protected>} />
        <Route path="/profile"     element={<Protected><ProfilePage /></Protected>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
