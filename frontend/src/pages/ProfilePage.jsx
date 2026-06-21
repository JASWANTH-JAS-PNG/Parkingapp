import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Car, Shield, Bell, Moon, Globe, ChevronRight, LogOut, Edit3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function SettingRow({ icon: Icon, label, desc, action, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all group text-left"
    >
      <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
        <Icon size={18} className="text-indigo-400" />
      </div>
      <div className="flex-1">
        <div className="text-white text-sm font-medium">{label}</div>
        {desc && <div className="text-slate-500 text-xs mt-0.5">{desc}</div>}
      </div>
      <div className="text-slate-500 group-hover:text-slate-300 transition-colors">
        {action || <ChevronRight size={16} />}
      </div>
    </button>
  )
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifs, setNotifs] = useState(true)
  const [dark, setDark]     = useState(true)

  const initials = user?.userName?.slice(0, 2)?.toUpperCase() || 'PW'

  return (
    <div className="min-h-screen animated-bg pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-extrabold text-white">Profile</h1>
        </motion.div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-6 border-gradient mb-5"
        >
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white neon-indigo">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-500 border-2 border-slate-900 flex items-center justify-center hover:bg-indigo-400 transition-colors">
                <Edit3 size={11} className="text-white" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.userName || 'Driver'}</h2>
              <p className="text-slate-400 text-sm mt-0.5">{user?.email || 'user@parkwave.app'}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-xs font-medium">Active Member</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
            <a href="/bookings"
              className="flex-1 text-center py-2 rounded-xl glass border border-white/10 text-indigo-400 text-xs font-medium hover:bg-indigo-500/10 transition-colors"
            >
              My Bookings
            </a>
            <a href="/lots"
              className="flex-1 text-center py-2 rounded-xl glass border border-white/10 text-purple-400 text-xs font-medium hover:bg-purple-500/10 transition-colors"
            >
              Browse Lots
            </a>
          </div>
        </motion.div>

        {/* Account section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl border-gradient mb-5 overflow-hidden"
        >
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Account</h3>
          </div>
          <SettingRow icon={User}  label="Edit Profile"        desc="Update your name and photo" />
          <SettingRow icon={Mail}  label="Email & Security"    desc={user?.email || 'Manage your email'} />
          <SettingRow icon={Shield} label="Privacy"            desc="Control your data and visibility" />
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl border-gradient mb-5 overflow-hidden"
        >
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Preferences</h3>
          </div>
          <SettingRow
            icon={Bell}
            label="Notifications"
            desc="Booking confirmations & alerts"
            action={
              <button
                onClick={() => setNotifs(v => !v)}
                className={`w-11 h-6 rounded-full transition-colors duration-300 ${notifs ? 'bg-indigo-500' : 'bg-white/10'}`}
              >
                <motion.div
                  animate={{ x: notifs ? 20 : 2 }}
                  className="w-4 h-4 rounded-full bg-white shadow"
                  style={{ marginTop: 4 }}
                />
              </button>
            }
          />
          <SettingRow
            icon={Moon}
            label="Dark Mode"
            desc="Always on — it's just better"
            action={
              <button
                onClick={() => setDark(v => !v)}
                className={`w-11 h-6 rounded-full transition-colors duration-300 ${dark ? 'bg-indigo-500' : 'bg-white/10'}`}
              >
                <motion.div
                  animate={{ x: dark ? 20 : 2 }}
                  className="w-4 h-4 rounded-full bg-white shadow"
                  style={{ marginTop: 4 }}
                />
              </button>
            }
          />
          <SettingRow icon={Globe} label="Language" desc="English (US)" />
        </motion.div>

        {/* Sign out */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { logout(); navigate('/') }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl glass border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all font-medium"
        >
          <LogOut size={18} /> Sign Out
        </motion.button>
      </div>
    </div>
  )
}
