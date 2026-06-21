/**
 * /lots — Parking Lots list with real pagination + sort.
 *
 * Backend: GET /api/parkinglot?PageNumber=&PageSize=&SortBy=&IsDescending=
 * Sort options confirmed from ParkingLotRepository: "Name" | "Location"
 *
 * "Available count" per lot requires cross-referencing all slots (PRD §9 gap #6).
 * We do it once per page load — if the slots call fails we still render lots.
 */
import { useState, useEffect, useCallback } from 'react'
import { Link }                              from 'react-router-dom'
import { motion, AnimatePresence }           from 'framer-motion'
import {
  MapPin, Car, ChevronRight, ChevronLeft, Plus,
  Building, AlertCircle, RefreshCw, ArrowUpDown,
  ArrowUp, ArrowDown, Search, Loader2
} from 'lucide-react'
import { toast }               from 'react-hot-toast'
import { lotsAPI, slotsAPI }   from '../api/client'

const PAGE_SIZE = 9

// ─── Sort button ──────────────────────────────────────────────────────────────
function SortBtn({ field, label, current, onSort }) {
  const active = current.sortBy === field
  return (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
          : 'glass border border-white/10 text-slate-400 hover:text-white'
      }`}
    >
      {active
        ? current.isDescending ? <ArrowDown size={13} /> : <ArrowUp size={13} />
        : <ArrowUpDown size={13} />}
      {label}
    </button>
  )
}

// ─── Lot card ─────────────────────────────────────────────────────────────────
function LotCard({ lot, availableCount, index }) {
  const hasSlotData = availableCount !== undefined
  const pct         = hasSlotData && lot.totalSlots > 0
    ? Math.round(((lot.totalSlots - availableCount) / lot.totalSlots) * 100)
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -5 }}
      className="glass rounded-2xl overflow-hidden border-gradient card-hover group"
    >
      <div className={`h-1 w-full ${
        pct === null      ? 'bg-gradient-to-r from-slate-700 to-slate-600' :
        pct > 70          ? 'bg-gradient-to-r from-amber-500 to-red-500'   :
                            'bg-gradient-to-r from-indigo-500 to-purple-500'
      }`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/25 to-purple-500/25 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Building size={17} className="text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-semibold text-sm leading-tight truncate">{lot.name}</h3>
              <p className="flex items-center gap-1 text-slate-500 text-xs mt-0.5 truncate">
                <MapPin size={10} className="flex-shrink-0" />
                <span className="truncate">{lot.location}</span>
              </p>
            </div>
          </div>
          {pct !== null && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
              pct > 70 ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
            }`}>
              {pct > 70 ? 'Busy' : 'Open'}
            </span>
          )}
        </div>

        {/* Slot info */}
        <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">
          <Car size={11} className="text-slate-500" />
          <span>{lot.totalSlots} total</span>
          {hasSlotData && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400 font-medium">{availableCount} free</span>
            </>
          )}
        </div>

        {/* Occupancy bar — only if we have slot data */}
        {pct !== null && (
          <div className="mb-4">
            <div className="h-1 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: index * 0.04 }}
                className={`h-full rounded-full ${pct > 70 ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-500'}`}
              />
            </div>
          </div>
        )}

        <Link to={`/lots/${lot.id}`}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium hover:bg-indigo-500/30 transition-all"
        >
          View Slots <ChevronRight size={13} />
        </Link>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LotsListPage() {
  const [lots,      setLots]      = useState([])
  const [slotMap,   setSlotMap]   = useState({})   // lotId → available count
  const [loading,   setLoading]   = useState(true)
  const [apiError,  setApiError]  = useState('')
  const [page,      setPage]      = useState(1)
  const [hasMore,   setHasMore]   = useState(false)
  const [sort,      setSort]      = useState({ sortBy: '', isDescending: false })
  const [search,    setSearch]    = useState('')

  // Create lot form
  const [showForm,   setShowForm]  = useState(false)
  const [form,       setForm]      = useState({ name: '', location: '', totalSlots: '' })
  const [formErr,    setFormErr]   = useState('')
  const [saving,     setSaving]    = useState(false)

  const fetchData = useCallback((pg = page, srt = sort) => {
    setLoading(true)
    setApiError('')

    const lotsReq  = lotsAPI.getAll({ pageNumber: pg, pageSize: PAGE_SIZE, sortBy: srt.sortBy || undefined, isDescending: srt.isDescending || undefined })
    const slotsReq = slotsAPI.getAll().catch(() => ({ data: [] }))

    Promise.all([lotsReq, slotsReq])
      .then(([lotsRes, slotsRes]) => {
        const fetched = Array.isArray(lotsRes.data) ? lotsRes.data : []
        setLots(fetched)
        setHasMore(fetched.length === PAGE_SIZE)

        // Build map of lotId → available count
        const allSlots = Array.isArray(slotsRes.data) ? slotsRes.data : []
        const map = {}
        allSlots.forEach(s => {
          if (map[s.parkingLotId] === undefined) map[s.parkingLotId] = 0
          if (s.isAvailable) map[s.parkingLotId]++
        })
        setSlotMap(map)
      })
      .catch(err => {
        const msg = err.response?.data
        setApiError(typeof msg === 'string' ? msg : 'Could not reach the API. Is the backend running on http://localhost:5186?')
      })
      .finally(() => setLoading(false))
  }, [page, sort])

  useEffect(() => { fetchData(page, sort) }, [page, sort])

  const handleSort = field => {
    const next = sort.sortBy === field && !sort.isDescending
      ? { sortBy: field, isDescending: true }
      : sort.sortBy === field && sort.isDescending
        ? { sortBy: '', isDescending: false }
        : { sortBy: field, isDescending: false }
    setSort(next)
    setPage(1)
  }

  const handleCreate = async e => {
    e.preventDefault()
    setFormErr('')
    if (form.name.trim().length < 3)     return setFormErr('Name must be at least 3 characters')
    if (form.location.trim().length < 3) return setFormErr('Location must be at least 3 characters')
    const slots = parseInt(form.totalSlots, 10)
    if (isNaN(slots) || slots < 1 || slots > 1000) return setFormErr('Total slots must be between 1 and 1000')

    setSaving(true)
    try {
      await lotsAPI.create({ name: form.name.trim(), location: form.location.trim(), totalSlots: slots })
      toast.success('Parking lot created!')
      setForm({ name: '', location: '', totalSlots: '' })
      setShowForm(false)
      setPage(1)
      fetchData(1, sort)
    } catch (err) {
      const msg = err.response?.data
      setFormErr(typeof msg === 'string' ? msg : 'Failed to create lot')
    } finally {
      setSaving(false)
    }
  }

  const filtered = lots.filter(l =>
    !search ||
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.location?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen animated-bg pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Parking Lots</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {loading ? 'Loading…' : `Showing ${lots.length} lots${sort.sortBy ? ` · sorted by ${sort.sortBy}` : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchData(page, sort)} title="Refresh" aria-label="Refresh"
              className="p-2 rounded-lg glass border border-white/10 text-slate-400 hover:text-white transition-all"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => { setShowForm(v => !v); setFormErr('') }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium neon-indigo hover:from-indigo-400 hover:to-purple-500 transition-all"
            >
              <Plus size={15} /> Add Lot
            </button>
          </div>
        </motion.div>

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
              <div className="glass rounded-2xl p-5 border-gradient">
                <h2 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
                  <Plus size={15} className="text-indigo-400" /> New Parking Lot
                </h2>
                {formErr && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs mb-3">
                    <AlertCircle size={13} />{formErr}
                  </div>
                )}
                <form onSubmit={handleCreate} className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Name (3–50 chars)</label>
                    <input placeholder="e.g. City Center Lot" value={form.name}
                      onChange={e => { setFormErr(''); setForm(f => ({ ...f, name: e.target.value })) }}
                      required minLength={3} maxLength={50}
                      className="w-full px-3 py-2.5 rounded-lg glass border border-white/10 focus:border-indigo-500/50 focus:outline-none text-white placeholder-slate-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Location (3–100 chars)</label>
                    <input placeholder="e.g. 123 Main St" value={form.location}
                      onChange={e => { setFormErr(''); setForm(f => ({ ...f, location: e.target.value })) }}
                      required minLength={3} maxLength={100}
                      className="w-full px-3 py-2.5 rounded-lg glass border border-white/10 focus:border-indigo-500/50 focus:outline-none text-white placeholder-slate-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Total slots (1–1000)</label>
                    <input type="number" placeholder="e.g. 40" value={form.totalSlots} min={1} max={1000}
                      onChange={e => { setFormErr(''); setForm(f => ({ ...f, totalSlots: e.target.value })) }}
                      required
                      className="w-full px-3 py-2.5 rounded-lg glass border border-white/10 focus:border-indigo-500/50 focus:outline-none text-white placeholder-slate-500 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-3 flex gap-2 pt-1">
                    <button type="submit" disabled={saving}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium disabled:opacity-60"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create
                    </button>
                    <button type="button" onClick={() => { setShowForm(false); setFormErr('') }}
                      className="px-4 py-2 rounded-lg glass border border-white/10 text-slate-400 text-sm hover:text-white transition-colors"
                    >Cancel</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar: sort + search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 text-xs">Sort:</span>
            <SortBtn field="Name"     label="Name"     current={sort} onSort={handleSort} />
            <SortBtn field="Location" label="Location" current={sort} onSort={handleSort} />
          </div>
          <div className="relative sm:ml-auto sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              placeholder="Filter by name / location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg glass border border-white/10 focus:border-indigo-500/50 focus:outline-none text-white placeholder-slate-500 text-sm"
            />
          </div>
        </div>

        {/* API error */}
        {apiError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm mb-6"
          >
            <AlertCircle size={15} className="flex-shrink-0" />
            <span className="flex-1">{apiError}</span>
            <button onClick={() => fetchData(page, sort)} className="text-xs underline hover:no-underline">Retry</button>
          </motion.div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-5 border-gradient animate-pulse">
                <div className="h-1 bg-white/5 rounded mb-4" />
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/5 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-3.5 bg-white/5 rounded w-3/4 mb-1.5" />
                    <div className="h-2.5 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-2.5 bg-white/5 rounded mb-3 w-1/3" />
                <div className="h-8 bg-white/5 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Building size={44} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {search ? 'No lots match that filter' : apiError ? 'API unavailable' : 'No parking lots yet — add one above'}
            </p>
          </div>
        ) : (
          <>
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <AnimatePresence>
                {filtered.map((lot, i) => (
                  <LotCard
                    key={lot.id}
                    lot={lot}
                    availableCount={slotMap[lot.id]}
                    index={i}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass border border-white/10 text-slate-400 text-sm hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <span className="text-slate-400 text-sm px-2">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore || loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass border border-white/10 text-slate-400 text-sm hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
