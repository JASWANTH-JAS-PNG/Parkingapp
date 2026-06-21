import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Car, User, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { authAPI } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import Particles from '../components/Particles'

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]       = useState({ userName: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = k => e => { setError(''); setForm(f => ({ ...f, [k]: e.target.value })) }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.userName.trim()) return setError('Username is required')
    if (!form.password)        return setError('Password is required')

    setLoading(true)
    setError('')
    try {
      const { data } = await authAPI.login(form)
      login(data.token)
      toast.success('Welcome back!')
      navigate('/lots')
    } catch (err) {
      const body = err.response?.data
      setError(typeof body === 'string' ? body : 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-4">
      <Particles count={25} />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 border-gradient shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 neon-indigo">
              <Car size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Sign in to ParkWave</h1>
            <p className="text-slate-400 text-sm mt-1">Enter your username and password</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-5"
            >
              <AlertCircle size={15} className="flex-shrink-0" />{error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text" placeholder="your_username"
                  value={form.userName} onChange={set('userName')}
                  autoComplete="username" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={set('password')}
                  autoComplete="current-password" required
                  className="w-full pl-10 pr-12 py-3 rounded-xl glass border border-white/10 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold neon-indigo hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign In</span><ArrowRight size={16} /></>}
            </motion.button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            No account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
