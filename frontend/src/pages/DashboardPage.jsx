import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Car, MapPin, Calendar, TrendingUp, Clock, Zap,
  ArrowUpRight, Plus, Activity, AlertCircle
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { lotsAPI, bookingsAPI } from '../api/client'

const weekData = [
  { day: 'Mon', bookings: 24 }, { day: 'Tue', bookings: 38 },
  { day: 'Wed', bookings: 31 }, { day: 'Thu', bookings: 55 },
  { day: 'Fri', bookings: 72 }, { day: 'Sat', bookings: 89 },
  { day: 'Sun', bookings: 61 },
]

function StatCard({ icon: Icon, label, value, sub, color, delay, to }) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass rounded-2xl p-6 border-gradient card-hover group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
        <ArrowUpRight size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
      </div>
      <div className="text-3xl font-extrabold text-white mb-1 stat-number">{value}</div>
      <div className="text-slate-400 text-sm font-medium">{label}</div>
      {sub && <div className="text-xs text-emerald-400 mt-1 font-medium">{sub}</div>}
    </motion.div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

function ActivityItem({ icon: Icon, text, time, color }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={14} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-300 text-sm">{text}</p>
        <p className="text-slate-500 text-xs mt-0.5">{time}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [lots,     setLots]     = useState([])
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [apiDown,  setApiDown]  = useState(false)

  useEffect(() => {
    Promise.allSettled([lotsAPI.getAll(), bookingsAPI.getAll()])
      .then(([l, b]) => {
        if (l.status === 'fulfilled' && Array.isArray(l.value.data)) {
          setLots(l.value.data)
        } else {
          setApiDown(true)
        }
        if (b.status === 'fulfilled' && Array.isArray(b.value.data)) {
          setBookings(b.value.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const totalSlots  = lots.reduce((s, l) => s + (l.totalSlots || 0), 0)
  const greet       = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'

  const stats = [
    { icon: MapPin,     label: 'Parking Lots',  value: lots.length     || 0,   color: 'bg-gradient-to-br from-indigo-500 to-indigo-700',  delay: 0.1, to: '/lots' },
    { icon: Car,        label: 'Total Slots',   value: totalSlots      || 0,   color: 'bg-gradient-to-br from-purple-500 to-purple-700',  delay: 0.2, sub: totalSlots ? `~${Math.round(totalSlots * 0.68)} available` : undefined },
    { icon: Calendar,   label: 'My Bookings',   value: bookings.length || 0,   color: 'bg-gradient-to-br from-cyan-500 to-cyan-700',     delay: 0.3, to: '/bookings' },
    { icon: TrendingUp, label: 'Avg Occupancy', value: '68%',                  color: 'bg-gradient-to-br from-emerald-500 to-emerald-700', delay: 0.4, sub: '↑ 4% this week' },
  ]

  const activities = [
    { icon: Car,      text: 'Slot A-12 booked at City Center Lot',    time: '2 min ago',   color: 'bg-emerald-500/20' },
    { icon: Zap,      text: 'New parking lot added: Westside Plaza',   time: '15 min ago',  color: 'bg-indigo-500/20' },
    { icon: Calendar, text: 'Booking confirmed',                       time: '1 hour ago',  color: 'bg-purple-500/20' },
    { icon: Activity, text: 'Peak hours: Downtown Lot 94% full',       time: '3 hours ago', color: 'bg-amber-500/20' },
    { icon: Clock,    text: 'Booking expired',                         time: '6 hours ago', color: 'bg-slate-500/20' },
  ]

  const pieData = [
    { name: 'Available', value: 68, color: '#22c55e' },
    { name: 'Occupied',  value: 32, color: '#ef4444' },
  ]

  return (
    <div className="min-h-screen animated-bg pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* API down banner */}
        {apiDown && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm mb-6"
          >
            <AlertCircle size={16} className="flex-shrink-0" />
            Backend API is unreachable — start the .NET server at <code className="ml-1 bg-white/5 px-1.5 py-0.5 rounded text-xs">http://localhost:5186</code>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              Good {greet},{' '}
              <span className="gradient-text">{user?.userName || 'Driver'}</span> 👋
            </h1>
            <p className="text-slate-400 mt-1">Here's your parking network at a glance</p>
          </div>
          <Link to="/lots"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium neon-indigo hover:from-indigo-400 hover:to-purple-500 transition-all"
          >
            <Plus size={15} /> Add Lot
          </Link>
        </motion.div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[0,1,2,3].map(i => (
              <div key={i} className="glass rounded-2xl p-6 border-gradient animate-pulse">
                <div className="h-12 w-12 bg-white/5 rounded-xl mb-4" />
                <div className="h-8 bg-white/5 rounded mb-2 w-16" />
                <div className="h-4 bg-white/5 rounded w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(s => <StatCard key={s.label} {...s} />)}
          </div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass rounded-2xl p-6 border-gradient"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-semibold text-lg">Booking Activity</h2>
                <p className="text-slate-400 text-xs mt-0.5">This week</p>
              </div>
              <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                <TrendingUp size={14} /> +12.5%
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#f1f5f9' }} cursor={{ stroke: 'rgba(99,102,241,0.3)' }} />
                <Area type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={2} fill="url(#bookGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="glass rounded-2xl p-6 border-gradient flex flex-col"
          >
            <h2 className="text-white font-semibold text-lg mb-1">Occupancy</h2>
            <p className="text-slate-400 text-xs mb-4">Live status</p>
            <div className="flex-1 flex items-center justify-center">
              <PieChart width={160} height={160}>
                <Pie data={pieData} cx={75} cy={75} innerRadius={50} outerRadius={72} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
              </PieChart>
            </div>
            <div className="flex justify-around mt-2">
              {pieData.map(d => (
                <div key={d.name} className="text-center">
                  <div className="text-lg font-bold text-white">{d.value}%</div>
                  <div className="text-xs flex items-center gap-1 text-slate-400">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: d.color }} />
                    {d.name}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom row */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 border-gradient"
          >
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Activity size={18} className="text-indigo-400" /> Recent Activity
            </h2>
            {activities.map((a, i) => <ActivityItem key={i} {...a} />)}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="glass rounded-2xl p-6 border-gradient"
          >
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Zap size={18} className="text-amber-400" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Browse Lots', icon: MapPin,   to: '/lots',     color: 'from-indigo-500 to-indigo-700' },
                { label: 'New Booking', icon: Plus,     to: '/lots',     color: 'from-purple-500 to-purple-700' },
                { label: 'My Bookings', icon: Calendar, to: '/bookings', color: 'from-cyan-500 to-cyan-700' },
                { label: 'Profile',    icon: Car,      to: '/profile',  color: 'from-emerald-500 to-emerald-700' },
              ].map(({ label, icon: Icon, to, color }) => (
                <Link key={label} to={to}
                  className={`flex flex-col items-center gap-2 py-5 rounded-xl bg-gradient-to-br ${color} hover:opacity-90 transition-opacity`}
                >
                  <Icon size={22} className="text-white" />
                  <span className="text-white text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
