import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Car, Search, Plus, Trash2, Loader,
  ChevronRight, Building, AlertCircle, RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { lotsAPI } from '../api/client'

// ─── Card ──────────────────────────────────────────────────────────────────
function LotCard({ lot, onDelete, index }) {
  const pct     = ((lot._mockPct ?? 50) + lot.id * 13) % 80 + 10  // deterministic fake occupancy
  const isHigh  = pct > 65
  const avail   = Math.max(0, Math.round(lot.totalSlots * (1 - pct / 100)))

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -6 }}
      className="glass rounded-2xl overflow-hidden border-gradient card-hover group"
    >
      <div className={`h-1.5 w-full ${isHigh
        ? 'bg-gradient-to-r from-amber-500 to-red-500'
        : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
      />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Building size={18} className="text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-semibold text-base leading-tight truncate">{lot.name}</h3>
              <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5 truncate">
                <MapPin size={11} className="flex-shrink-0" />
                <span className="truncate">{lot.location}</span>
              </div>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${isHigh
            ? 'bg-amber-500/20 text-amber-400'
            : 'bg-emerald-500/20 text-emerald-400'}`}>
            {isHigh ? 'Busy' : 'Open'}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3 text-sm">
          <Car size={13} className="text-slate-500 flex-shrink-0" />
          <span className="text-slate-400">{lot.totalSlots} slots total</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-medium">{avail} free</span>
        </div>

        {/* Occupancy bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Occupancy</span>
            <span className={isHigh ? 'text-amber-400' : 'text-emerald-400'}>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, delay: index * 0.04 + 0.3 }}
              className={`h-full rounded-full ${isHigh
                ? 'bg-gradient-to-r from-amber-500 to-red-500'
                : 'bg-gradient-to-r from-indigo-500 to-emerald-500'}`}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={`/lots/${lot.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium hover:bg-indigo-500/30 transition-all"
          >
            Book a Slot <ChevronRight size={13} />
          </Link>
          <button
            onClick={() => onDelete(lot.id)}
            className="p-2 rounded-xl glass border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
            title="Delete lot"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function ParkingLotsPage() {
  const [lots, setLots]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [apiError, setApiError] = useState('')
  const [search, setSearch]     = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ name: '', location: '', totalSlots: '' })
  const [saving, setSaving]     = useState(false)
  const [formError, setFormError] = useState('')

  const fetchLots = useCallback(() => {
    setLoading(true)
    setApiError('')
    lotsAPI.getAll()
      .then(r => setLots(Array.isArray(r.data) ? r.data : []))
      .catch(err => {
        const msg = err.response?.data
        setApiError(typeof msg === 'string' ? msg : 'Could not reach the API — is the backend running?')
        setLots([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(fetchLots, [fetchLots])

  const handleCreate = async e => {
    e.preventDefault()
    setFormError('')

    // Client-side validation matching backend rules
    if (form.name.trim().length < 3)     return setFormError('Name must be at least 3 characters')
    if (form.location.trim().length < 3) return setFormError('Location must be at least 3 characters')
    const slots = parseInt(form.totalSlots, 10)
    if (isNaN(slots) || slots < 1)       return setFormError('Total slots must be ≥ 1')

    setSaving(true)
    try {
      await lotsAPI.create({ name: form.name.trim(), location: form.location.trim(), totalSlots: slots })
      toast.success('Parking lot created!')
      setForm({ name: '', location: '', totalSlots: '' })
      setShowForm(false)
      fetchLots()
    } catch (err) {
      const msg = err.response?.data
      setFormError(typeof msg === 'string' ? msg : 'Failed to create lot — check backend is running')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this parking lot?')) return
    try {
      await lotsAPI.delete(id)
      toast.success('Lot deleted')
      setLots(l => l.filter(x => x.id !== id))
    } catch {
      toast.error('Delete failed — check backend is running')
    }
  }

  const filtered = lots.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.location?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen animated-bg pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-white">Parking Lots</h1>
            <p className="text-slate-400 mt-1">
              {loading ? 'Loading…' : `${lots.length} lot${lots.length !== 1 ? 's' : ''} managed`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchLots} title="Refresh"
              className="p-2.5 rounded-xl glass border border-white/10 text-slate-400 hover:text-white transition-all"
            >
              <RefreshCw size={16} />
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setShowForm(v => !v); setFormError('') }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium neon-indigo hover:from-indigo-400 hover:to-purple-500 transition-all"
            >
              <Plus size={16} /> Add Lot
            </motion.button>
          </div>
        </motion.div>

        {/* API Error */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6"
          >
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{apiError}</span>
            <button onClick={fetchLots} className="ml-auto text-xs underline hover:no-underline">Retry</button>
          </motion.div>
        )}

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="glass rounded-2xl p-6 border-gradient">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-indigo-400" /> New Parking Lot
                </h2>

                {formError && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    {formError}
                  </div>
                )}

                <form onSubmit={handleCreate} className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Lot name <span className="text-slate-600">(3-50 chars)</span></label>
                    <input
                      placeholder="e.g. City Center Lot"
                      value={form.name}
                      onChange={e => { setFormError(''); setForm(f => ({ ...f, name: e.target.value })) }}
                      required minLength={3} maxLength={50}
                      className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Location <span className="text-slate-600">(3-100 chars)</span></label>
                    <input
                      placeholder="e.g. 123 Main St"
                      value={form.location}
                      onChange={e => { setFormError(''); setForm(f => ({ ...f, location: e.target.value })) }}
                      required minLength={3} maxLength={100}
                      className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Total slots <span className="text-slate-600">(1-1000)</span></label>
                    <input
                      placeholder="e.g. 40"
                      type="number" min="1" max="1000"
                      value={form.totalSlots}
                      onChange={e => { setFormError(''); setForm(f => ({ ...f, totalSlots: e.target.value })) }}
                      required
                      className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-3 flex gap-3 pt-1">
                    <button type="submit" disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium disabled:opacity-60 hover:from-indigo-400 hover:to-purple-500 transition-all"
                    >
                      {saving
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><Plus size={14} /> Create Lot</>}
                    </button>
                    <button type="button" onClick={() => { setShowForm(false); setFormError('') }}
                      className="px-4 py-2.5 rounded-xl glass border border-white/10 text-slate-400 text-sm hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            placeholder="Search by name or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl glass border border-white/10 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="spinner" />
            <p className="text-slate-500 text-sm">Connecting to API…</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <Building size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">
              {search ? 'No lots match your search' : apiError ? 'API unavailable' : 'No parking lots yet'}
            </p>
            {!search && !apiError && (
              <button onClick={() => setShowForm(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm hover:bg-indigo-500/30 transition-all"
              >
                <Plus size={14} className="inline mr-1" /> Add your first lot
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((lot, i) => (
                <LotCard key={lot.id} lot={lot} onDelete={handleDelete} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
