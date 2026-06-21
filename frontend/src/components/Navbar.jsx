import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, MapPin, Calendar, User, LogOut, Menu, X, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NAV_LINKS = [
  { to: '/lots',     label: 'Parking Lots', icon: MapPin },
  { to: '/bookings', label: 'My Bookings',  icon: Calendar },
  { to: '/profile',  label: 'Profile',      icon: User },
]

export default function Navbar() {
  const { isAuth, user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname])

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0,  opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-dark shadow-2xl' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to={isAuth ? '/lots' : '/'} className="flex items-center gap-2 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform neon-indigo">
              <Car size={17} className="text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse" />
          </div>
          <span className="font-bold text-xl gradient-text">ParkWave</span>
        </Link>

        {/* Desktop links */}
        {isAuth && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname.startsWith(to)
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />{label}
              </Link>
            ))}
          </div>
        )}

        {/* Right */}
        <div className="hidden md:flex items-center gap-3">
          {isAuth ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-sm">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {user?.userName?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-slate-300 font-medium max-w-[120px] truncate">
                  {user?.userName || 'User'}
                </span>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="text-sm text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                Sign In
              </Link>
              <Link to="/register"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:from-indigo-400 hover:to-purple-500 transition-all neon-indigo"
              >
                <Zap size={13} /> Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg glass text-slate-300 hover:text-white transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {isAuth ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 mb-2 text-sm text-slate-400">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {user?.userName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    {user?.userName}
                  </div>
                  {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                    <Link key={to} to={to}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        location.pathname.startsWith(to)
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={15} />{label}
                    </Link>
                  ))}
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login"    className="block px-3 py-2.5 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/5">Sign In</Link>
                  <Link to="/register" className="block px-3 py-2.5 text-sm text-white bg-indigo-500/20 rounded-lg">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
