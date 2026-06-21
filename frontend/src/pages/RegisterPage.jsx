import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Car, User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { authAPI } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import Particles from '../components/Particles'

function strengthOf(pwd) {
  let n = 0
  if (pwd.length >= 8)           n++
  if (/[A-Z]/.test(pwd))         n++
  if (/[0-9]/.test(pwd))         n++
  if (/[^A-Za-z0-9]/.test(pwd)) n++
  return n
}
const strengthMeta = n =>
  n < 2 ? { label: 'Weak',   bar: 'bg-red-500',    txt: 'text-red-400' }    :
  n < 4 ? { label: 'Fair',   bar: 'bg-amber-500',  txt: 'text-amber-400' }  :
          { label: 'Strong', bar: 'bg-emerald-500', txt: 'text-emerald-400' }

export default function RegisterPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm] = useState({ userName: '', password: '', email: '', name: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = k => e => { setError(''); setForm(f => ({ ...f, [k]: e.target.value })) }

  const s = strengthOf(form.password)
  const sm = strengthMeta(s)

  const validate = () => {
    if (form.userName.length < 4)  return 'Username must be at least 4 characters'
    if (form.userName.length > 20) return 'Username cannot exceed 20 characters'
    if (form.password.length < 6)  return 'Password must be at least 6 characters'
    if (form.password.length > 50) return 'Password cannot exceed 50 characters'
    return null
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const ve = validate()
    if (ve) return setError(ve)

    setLoading(true)
    setError('')
    try {
      const { data } = await authAPI.register(form)
      login(data.token)
      toast.success('Account created — welcome to ParkWave!')
      navigate('/lots')
    } catch (err) {
      const body = err.response?.data
      setError(
        typeof body === 'string' ? body :
        err.response?.status === 400 ? 'Username already taken or invalid input' :
        'Registration failed — please try again'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-4 py-16">
      <Particles count={25} />
      <div className="absolute top-1/4 right-1/4  w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-cyan-500/10  rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 border-gradient shadow-2xl">
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 neon-indigo">
              <Car size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-slate-400 text-sm mt-1">Free to start — no credit card</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-5"
            >
              <AlertCircle size={15} className="flex-shrink-0" />{error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                Username <span className="text-slate-500 text-xs font-normal">(4–20 chars, required)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input type="text" placeholder="e.g. driver_john"
                  value={form.userName} onChange={set('userName')}
                  autoComplete="username" required minLength={4} maxLength={20}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            {/* Email (optional) */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                Email <span className="text-slate-500 text-xs font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input type="email" placeholder="you@example.com"
                  value={form.email} onChange={set('email')}
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                Password <span className="text-slate-500 text-xs font-normal">(6–50 chars, required)</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={set('password')}
                  autoComplete="new-password" required minLength={6} maxLength={50}
                  className="w-full pl-10 pr-12 py-3 rounded-xl glass border border-white/10 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0,1,2,3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < s ? sm.bar : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    Strength: <span className={`font-medium ${sm.txt}`}>{sm.label}</span>
                  </p>
                </div>
              )}
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold neon-indigo hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Create Account</span><ArrowRight size={16} /></>}
            </motion.button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
