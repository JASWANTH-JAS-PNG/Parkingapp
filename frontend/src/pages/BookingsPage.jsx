/**
 * /bookings — My Bookings
 *
 * PRD §8.6:
 * - GET /api/bookings returns ALL bookings — filter client-side by userId (from JWT)
 * - Cross-reference slot and lot: fetch /api/parkingslots + /api/parkinglot
 * - Show: slot number, lot name, start time, end time, status
 *
 * Known backend gap (PRD §9):
 * - Booking.UserId is int; IdentityUser.Id (from JWT) is a GUID string.
 *   String equality filter will never match int records, so real bookings
 *   may show 0 results. This is acknowledged, not silently worked around.
 */
import { useState, useEffect, useMemo } from 'react'
import { Link }                          from 'react-router-dom'
import { motion, AnimatePresence }       from 'framer-motion'
import {
  Calendar, Clock, MapPin, Car, AlertCircle,
  Search, RefreshCw, Info, Loader2, ChevronRight
} from 'lucide-react'
import { bookingsAPI, slotsAPI, lotsAPI } from '../api/client'
import { useAuth }                        from '../contexts/AuthContext'

// ─── Status ───────────────────────────────────────────────────────────────────
function bookingStatus(b) {
  const now   = new Date()
  const start = new Date(b.startTime)
  const end   = new Date(b.endTime)
  if (now < start)               return 'upcoming'
  if (now >= start && now <= end) return 'active'
  return 'completed'
}

const STATUS_META = {
  active:    { label: 'Active',    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  upcoming:  { label: 'Upcoming',  color: 'text-indigo-400',  bg: 'bg-indigo-500/10  border-indigo-500/30' },
  completed: { label: 'Completed', color: 'text-slate-400',   bg: 'bg-slate-500/10   border-slate-500/30' },
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function BookingCard({ booking, slot, lot, index }) {
  const status = bookingStatus(booking)
  const { label, color, bg } = STATUS_META[status]

  const start = new Date(booking.startTime)
  const end   = new Date(booking.endTime)
  const hrs   = ((end - start) / 3_600_000).toFixed(1)

  const dateFmt  = d => d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  const timeFmt  = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04 }}
      className="glass rounded-2xl p-5 border-gradient"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Car size={18} className="text-indigo-400" />
          </div>
          <div className="min-w-0">
            <div className="text-white font-semibold">
              {slot ? `Slot ${slot.slotNumber}` : `Slot #${booking.parkingSlotId}`}
            </div>
            <div className="text-slate-500 text-xs flex items-center gap-1 truncate">
              {lot ? (
                <>
                  <MapPin size={9} className="flex-shrink-0 text-indigo-400" />
                  <Link to={`/lots/${lot.id}`} className="hover:text-indigo-400 transition-colors truncate">
                    {lot.name}
                  </Link>
                </>
              ) : (
                <span className="text-slate-600">Lot info unavailable</span>
              )}
            </div>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${bg} ${color}`}>
          {label}
        </span>
      </div>

      {/* Times */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar size={13} className="text-indigo-400 flex-shrink-0" />
          <span>{dateFmt(start)}</span>
          {start.toDateString() !== end.toDateString() && (
            <span className="text-slate-600">→ {dateFmt(end)}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Clock size={13} className="text-purple-400 flex-shrink-0" />
          <span>{timeFmt(start)} → {timeFmt(end)}</span>
          <span className="text-slate-600 text-xs">({hrs}h)</span>
        </div>
      </div>

      {/* Active progress bar */}
      {status === 'active' && (() => {
        const now = new Date()
        const pct = Math.min(100, ((now - start) / (end - start)) * 100)
        return (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Elapsed</span><span>{Math.round(pct)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
              />
            </div>
          </div>
        )
      })()}

      {/* Booking ID footnote */}
      <div className="mt-3 pt-3 border-t border-white/5 text-xs text-slate-600">
        Booking ID: {booking.id}
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const { user }  = useAuth()

  const [rawBookings, setRawBookings] = useState([])
  const [slots,       setSlots]       = useState([])
  const [lots,        setLots]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [apiError,    setApiError]    = useState('')
  const [filter,      setFilter]      = useState('all')
  const [search,      setSearch]      = useState('')

  const loadData = () => {
    setLoading(true)
    setApiError('')
    // fetch in parallel; slots + lots are needed for cross-referencing
    Promise.all([
      bookingsAPI.getAll(),
      slotsAPI.getAll(),
      lotsAPI.getAll({ pageSize: 200 }),  // pull enough lots to cover cross-refs
    ])
      .then(([bRes, sRes, lRes]) => {
        setRawBookings(Array.isArray(bRes.data) ? bRes.data : [])
        setSlots(Array.isArray(sRes.data) ? sRes.data : [])
        // getAll wraps in object or array depending on backend
        const rawLots = Array.isArray(lRes.data) ? lRes.data : (lRes.data?.items ?? lRes.data ?? [])
        setLots(Array.isArray(rawLots) ? rawLots : [])
      })
      .catch(err => {
        const msg = err.response?.data
        setApiError(typeof msg === 'string' ? msg : 'Could not load bookings — is the backend running?')
      })
      .finally(() => setLoading(false))
  }

  useEffect(loadData, [])

  // ── Client-side filter by userId (PRD §8.6) ──────────────────────────────
  // Backend gap: userId is int, JWT gives GUID. Loose comparison covers both.
  const myBookings = useMemo(() => {
    if (!user?.userId) return rawBookings
    const myId = parseInt(user.userId, 10)
    return rawBookings.filter(b => b.userId === myId || b.userId == user.userId)
  }, [rawBookings, user?.userId])

  // Index lookup maps
  const slotMap = useMemo(() => Object.fromEntries(slots.map(s => [s.id, s])), [slots])
  const lotMap  = useMemo(() => Object.fromEntries(lots.map(l  => [l.id,  l])), [lots])

  // Filtered + searched view
  const displayed = useMemo(() => {
    return myBookings.filter(b => {
      if (filter !== 'all' && bookingStatus(b) !== filter) return false
      if (search) {
        const slot = slotMap[b.parkingSlotId]
        const lot  = slot ? lotMap[slot.parkingLotId] : null
        const q    = search.toLowerCase()
        if (
          !String(b.id).includes(q) &&
          !String(b.parkingSlotId).includes(q) &&
          !(slot?.slotNumber?.toLowerCase().includes(q)) &&
          !(lot?.name?.toLowerCase().includes(q)) &&
          !(lot?.location?.toLowerCase().includes(q))
        ) return false
      }
      return true
    })
  }, [myBookings, filter, search, slotMap, lotMap])

  const counts = useMemo(() => {
    const c = { all: myBookings.length, active: 0, upcoming: 0, completed: 0 }
    myBookings.forEach(b => { c[bookingStatus(b)]++ })
    return c
  }, [myBookings])

  // gap warning: when rawBookings has records but myBookings is empty
  const showGapWarning = !loading && !apiError &&
    rawBookings.length > 0 && myBookings.length === 0

  return (
    <div className="min-h-screen animated-bg pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white">My Bookings</h1>
              <p className="text-slate-400 mt-1 text-sm">
                {loading ? 'Loading…' : `${myBookings.length} reservation${myBookings.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass border border-white/10 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </motion.div>

        {/* API Error */}
        {apiError && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm mb-6">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span className="flex-1">{apiError}</span>
            <button onClick={loadData} className="text-xs underline hover:no-underline">Retry</button>
          </div>
        )}

        {showGapWarning && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm mb-6">
            <Info size={15} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-0.5">No bookings found for your account</p>
              <p className="text-xs text-amber-500/80">
                {rawBookings.length > 0
                  ? `${rawBookings.length} booking(s) exist in the system but none match your user ID.`
                  : 'No bookings have been made yet.'}
              </p>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['all', 'active', 'upcoming', 'completed'] ).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                  : 'glass border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {f}
              {counts[f] > 0 && <span className="ml-1.5 text-xs opacity-60">({counts[f]})</span>}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            placeholder="Search by slot, lot name, location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl glass border border-white/10 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all text-sm"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-500">
            <Loader2 size={22} className="animate-spin" /> Loading bookings…
          </div>
        ) : displayed.length === 0 ? (
          <div className="glass rounded-2xl p-12 border-gradient text-center">
            <Calendar size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 font-medium mb-1">
              {search || filter !== 'all' ? 'No bookings match that filter' : 'No bookings yet'}
            </p>
            {!search && filter === 'all' && !showGapWarning && (
              <>
                <p className="text-slate-500 text-sm mb-5">
                  Head to a parking lot and book a slot to get started
                </p>
                <Link to="/lots"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:from-indigo-400 hover:to-purple-500 transition-all"
                >
                  Browse Lots <ChevronRight size={15} />
                </Link>
              </>
            )}
          </div>
        ) : (
          <motion.div layout className="grid sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {displayed.map((b, i) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  slot={slotMap[b.parkingSlotId]}
                  lot={slotMap[b.parkingSlotId] ? lotMap[slotMap[b.parkingSlotId].parkingLotId] : null}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
