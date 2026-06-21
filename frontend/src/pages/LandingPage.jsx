import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Car, MapPin, Zap, Shield, BarChart3, Clock,
  Star, ChevronRight, Play, ArrowRight, Check,
  Wifi, CreditCard, Smartphone
} from 'lucide-react'
import Particles from '../components/Particles'

// ─── Animated counter ────────────────────────────────
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / 60
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ─── Feature card ─────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="glass rounded-2xl p-6 border-gradient card-hover group"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  )
}

const features = [
  { icon: MapPin,      title: 'Real-Time Availability', desc: 'Live slot status updates across all locations. Never circle a lot again.',      color: 'bg-gradient-to-br from-indigo-500 to-indigo-700',  delay: 0.1 },
  { icon: Zap,         title: 'Instant Booking',        desc: 'Reserve your spot in under 10 seconds. One tap, done.',                          color: 'bg-gradient-to-br from-purple-500 to-purple-700',  delay: 0.2 },
  { icon: Shield,      title: 'Secure Payments',        desc: 'Bank-grade encryption on every transaction. Your data stays yours.',             color: 'bg-gradient-to-br from-cyan-500 to-cyan-700',     delay: 0.3 },
  { icon: BarChart3,   title: 'Smart Analytics',        desc: 'Insights on usage, revenue and peak hours at a glance.',                        color: 'bg-gradient-to-br from-emerald-500 to-emerald-700',delay: 0.4 },
  { icon: Clock,       title: 'Flexible Duration',      desc: 'Hourly, daily, monthly — book exactly the time you need.',                      color: 'bg-gradient-to-br from-amber-500 to-amber-700',   delay: 0.5 },
  { icon: Smartphone,  title: 'Mobile First',           desc: 'Native-feel experience across any device. Park from anywhere.',                  color: 'bg-gradient-to-br from-rose-500 to-rose-700',     delay: 0.6 },
]

const stats = [
  { value: 50000, suffix: '+', label: 'Active Users' },
  { value: 1200,  suffix: '+', label: 'Parking Lots' },
  { value: 98,    suffix: '%', label: 'Satisfaction' },
  { value: 24,    suffix: '/7', label: 'Support' },
]

const integrations = [
  { name: 'Google Maps', color: 'from-blue-500 to-blue-700',   icon: MapPin },
  { name: 'Stripe',      color: 'from-purple-500 to-purple-700', icon: CreditCard },
  { name: 'IoT Sensors', color: 'from-cyan-500 to-cyan-700',   icon: Wifi },
  { name: 'SMS Alerts',  color: 'from-emerald-500 to-emerald-700', icon: Smartphone },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen animated-bg overflow-hidden">
      <Particles count={60} />

      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center hero-grid">
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-300" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            Next-Gen Parking Platform
            <ChevronRight size={14} />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-extrabold leading-tight mb-6"
          >
            Park Smarter,{' '}
            <span className="gradient-text block sm:inline">
              Not Harder
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The most advanced parking management platform. Real-time slot tracking,
            instant bookings, and deep analytics — all in one beautiful interface.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              to="/register"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg neon-indigo hover:from-indigo-400 hover:to-purple-500 transition-all duration-300"
            >
              Start Parking Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl glass border border-white/10 text-white font-medium text-lg hover:bg-white/10 transition-all duration-300"
            >
              <Play size={16} className="text-indigo-400" />
              See Demo
            </Link>
          </motion.div>

          {/* Visual parking grid preview */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="relative mx-auto max-w-3xl"
          >
            <div className="glass rounded-3xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="ml-3 text-slate-500 text-xs">ParkWave Dashboard</span>
              </div>
              {/* Mock slot grid */}
              <div className="grid grid-cols-8 gap-2 mb-4">
                {Array.from({ length: 32 }).map((_, i) => {
                  const states = ['slot-available', 'slot-occupied', 'slot-available', 'slot-occupied', 'slot-available']
                  const cls = states[i % states.length]
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.02 }}
                      className={`${cls} h-8 rounded-md flex items-center justify-center text-xs font-mono font-bold`}
                    >
                      <Car size={10} className={cls === 'slot-occupied' ? 'text-red-400' : 'text-emerald-400'} />
                    </motion.div>
                  )
                })}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-sm" /> Available (18)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-sm" /> Occupied (14)</span>
                <span className="text-indigo-400 font-medium">Live · Updated 2s ago</span>
              </div>
            </div>
            {/* Floating stats */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 glass rounded-xl px-4 py-2 border border-emerald-500/30"
            >
              <span className="text-emerald-400 text-sm font-semibold">↑ 24% occupancy</span>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-4 -left-4 glass rounded-xl px-4 py-2 border border-purple-500/30"
            >
              <span className="text-purple-400 text-sm font-semibold">⚡ Slot A-12 booked</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────── */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ value, suffix, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-2xl p-6 text-center border-gradient"
              >
                <div className="text-4xl font-extrabold gradient-text mb-1 stat-number">
                  <Counter target={value} suffix={suffix} />
                </div>
                <div className="text-slate-400 text-sm">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-indigo-400 font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="text-4xl font-bold text-white mt-2 mb-4">
              Everything you need to manage parking
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From a single lot to an enterprise fleet — ParkWave scales with you.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ─── Integrations ─────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">Integrations</span>
            <h2 className="text-4xl font-bold text-white mt-2 mb-4">
              Connects with your stack
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {integrations.map(({ name, color, icon: Icon }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="glass rounded-2xl p-6 flex flex-col items-center gap-3 border border-white/10 card-hover"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
                <span className="text-slate-300 text-sm font-medium">{name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-cyan-600 opacity-90" />
            <div className="absolute inset-0 hero-grid opacity-20" />
            <div className="relative p-12 text-center">
              <h2 className="text-4xl font-extrabold text-white mb-4">
                Ready to transform your parking?
              </h2>
              <p className="text-indigo-200 mb-8 max-w-lg mx-auto">
                Join thousands of parking operators who've switched to ParkWave.
                Free 30-day trial, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-all"
                >
                  Start Free Trial
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 border border-white/20 transition-all"
                >
                  Sign In
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-indigo-200 text-sm">
                {['No credit card', 'Cancel anytime', '24/7 support'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-400" />{t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Car size={16} className="text-indigo-400" />
          <span className="gradient-text font-bold">ParkWave</span>
        </div>
        <p>© 2026 ParkWave. Intelligent parking for the modern world.</p>
      </footer>
    </div>
  )
}
