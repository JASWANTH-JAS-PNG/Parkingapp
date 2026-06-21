/**
 * /lots/:id — Parking Lot Detail + Slot Grid + Booking Modal
 *
 * PRD §8.4 / §8.5:
 * - Fetch lot via GET /api/parkinglot/{id}
 * - Fetch ALL slots, filter client-side where parkingLotId === id
 * - Click available slot → inline booking modal
 *
 * Booking modal (PRD §8.5):
 * - endTime must be after startTime
 * - booking must be in the future
 * - best-effort conflict check (fetch all bookings, check overlap for this slot)
 * - POST /api/bookings with { userId, parkingSlotId, startTime, endTime }
 */
import { useState, useEffect }       from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence }    from 'framer-motion'
import {
  ArrowLeft, Car, MapPin, Calendar, Clock,
  CheckCircle, AlertCircle, AlertTriangle,
  Info, Loader2, RefreshCw, X, Zap
} from 'lucide-react'
import { toast }                      from 'react-hot-toast'
import { lotsAPI, slotsAPI, bookingsAPI } from '../api/client'
import { useAuth }                    from '../contexts/AuthContext'

// ─── Overlap helper ───────────────────────────────────────────────────────────
function overlaps(aStart, aEnd, bStart, bEnd) {
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd)
}

// ─── Booking Modal ────────────────────────────────────────────────────────────
function BookingModal({ slot, lotName, onClose, onBooked }) {
  const { user } = useAuth()
  const [form,        setForm]        = useState({ startTime: '', endTime: '' })
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')
  const [conflictWarn, setConflictWarn] = useState('')
  const [success,     setSuccess]     = useState(false)

  const validate = () => {
    if (!form.startTime) return 'Start time is required'
    if (!form.endTime)   return 'End time is required'
    const start = new Date(form.startTime)
    const end   = new Date(form.endTime)
    if (end <= start)    return 'End time must be after start time'
    if (start < new Date()) return 'Booking must start in the future'
    return null
  }

  // Best-effort conflict check (PRD §8.5)
  const checkConflicts = async () => {
    setConflictWarn('')
    if (!form.startTime || !form.endTime) return
    const start = new Date(form.startTime), end = new Date(form.endTime)
    if (end <= start) return
    try {
      const { data } = await bookingsAPI.getAll()
      const mine = Array.isArray(data)
        ? data.filter(b => b.parkingSlotId === slot.id)
        : []
      const clash = mine.find(b => overlaps(form.startTime, form.endTime, b.startTime, b.endTime))
      if (clash) {
        setConflictWarn(
          `This slot already has a booking from ${new Date(clash.startTime).toLocaleString()} to ${new Date(clash.endTime).toLocaleString()}. Double-booking is not blocked server-side.`
        )
      }
    } catch { /* conflict check is best-effort — don't block submit */ }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const ve = validate()
    if (ve) return setError(ve)

    setSubmitting(true)
    setError('')
    try {
      await bookingsAPI.create({
        userId:        user?.userId,
        parkingSlotId: slot.id,
        startTime:     new Date(form.startTime).toISOString(),
        endTime:       new Date(form.endTime).toISOString(),
      })
      setSuccess(true)
    } catch (err) {
      const body = err.response?.data
      setError(typeof body === 'string' ? body : `Booking failed (${err.response?.status ?? 'network error'})`)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) return (
    <div className="flex flex-col items-center text-center py-4">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-4"
      >
        <CheckCircle size={30} className="text-emerald-400" />
      </motion.div>
      <h3 className="text-xl font-bold text-white mb-1">Booking confirmed!</h3>
      <p className="text-slate-400 text-sm mb-1">
        Slot <strong className="text-white">{slot.slotNumber}</strong> at {lotName}
      </p>
      <p className="text-slate-500 text-xs mb-6">
        {new Date(form.startTime).toLocaleString()} → {new Date(form.endTime).toLocaleString()}
      </p>
      <div className="flex gap-3 w-full">
        <Link to="/bookings" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium text-center hover:opacity-90 transition-opacity">
          My Bookings
        </Link>
        <button onClick={() => { onBooked(); onClose() }}
          className="flex-1 py-2.5 rounded-xl glass border border-white/10 text-slate-300 text-sm hover:text-white transition-colors"
        >
          Back to slots
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold text-lg">Book Slot {slot.slotNumber}</h3>
          <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1">
            <MapPin size={11} className="text-indigo-400" />{lotName}
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg glass text-slate-400 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-sm mb-4">
          <AlertCircle size={14} className="flex-shrink-0" />{error}
        </div>
      )}

      {/* Conflict warning */}
      {conflictWarn && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs mb-4">
          <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
          <span>{conflictWarn}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5 font-medium">
            <Clock size={12} /> Start time
          </label>
          <input type="datetime-local" value={form.startTime}
            onChange={e => { setError(''); setConflictWarn(''); setForm(f => ({ ...f, startTime: e.target.value })) }}
            onBlur={checkConflicts} required
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-3 py-2.5 rounded-lg glass border border-white/10 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/25 text-white text-sm transition-all"
            style={{ colorScheme: 'dark' }}
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5 font-medium">
            <Clock size={12} /> End time
          </label>
          <input type="datetime-local" value={form.endTime}
            onChange={e => { setError(''); setConflictWarn(''); setForm(f => ({ ...f, endTime: e.target.value })) }}
            onBlur={checkConflicts} required
            min={form.startTime || new Date().toISOString().slice(0, 16)}
            className="w-full px-3 py-2.5 rounded-lg glass border border-white/10 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/25 text-white text-sm transition-all"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Duration display */}
        {form.startTime && form.endTime && new Date(form.endTime) > new Date(form.startTime) && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
            <Info size={12} />
            Duration: {((new Date(form.endTime) - new Date(form.startTime)) / 3_600_000).toFixed(1)} hour(s)
          </div>
        )}

        <button type="submit" disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm neon-indigo hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting
            ? <><Loader2 size={15} className="animate-spin" /> Booking…</>
            : <><Zap size={15} /> Confirm Booking</>}
        </button>
      </form>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LotDetailPage() {
  const { id }   = useParams()
  const lotId    = parseInt(id, 10)
  const navigate = useNavigate()

  const [lot,        setLot]        = useState(null)
  const [slots,      setSlots]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [apiError,   setApiError]   = useState('')
  const [selected,   setSelected]   = useState(null)   // slot for booking modal

  const loadData = () => {
    setLoading(true)
    setApiError('')
    Promise.all([lotsAPI.getById(lotId), slotsAPI.getAll()])
      .then(([lotRes, slotsRes]) => {
        setLot(lotRes.data)
        const all = Array.isArray(slotsRes.data) ? slotsRes.data : []
        setSlots(all.filter(s => s.parkingLotId === lotId))
      })
      .catch(err => {
        const msg = err.response?.data
        setApiError(
          err.response?.status === 404
            ? 'Parking lot not found'
            : typeof msg === 'string' ? msg : 'Could not load data — is the backend running?'
        )
      })
      .finally(() => setLoading(false))
  }

  useEffect(loadData, [lotId])

  const available = slots.filter(s => s.isAvailable).length
  const occupied  = slots.length - available

  return (
    <div className="min-h-screen animated-bg pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button onClick={() => navigate('/lots')}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Lots
        </button>

        {/* Header */}
        {lot && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl font-extrabold text-white">{lot.name}</h1>
            <p className="flex items-center gap-1.5 text-slate-400 text-sm mt-1">
              <MapPin size={13} className="text-indigo-400" />{lot.location}
            </p>
            {slots.length > 0 && (
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 bg-emerald-500 rounded-sm" /> {available} available
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2 h-2 bg-red-500 rounded-sm" /> {occupied} occupied
                </span>
                <span className="text-slate-500">{lot.totalSlots} total</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Error */}
        {apiError && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm mb-6">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span className="flex-1">{apiError}</span>
            <button onClick={loadData} className="text-xs underline hover:no-underline">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-500">
            <Loader2 size={22} className="animate-spin" /> Loading slots…
          </div>
        ) : slots.length === 0 && !apiError ? (
          <div className="glass rounded-2xl border-gradient p-10 text-center">
            <Car size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium mb-1">No slots found for this lot</p>
            <p className="text-slate-500 text-sm">Slots need to be added via POST /api/parkingslots</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Slot grid */}
            <div className="md:col-span-2 glass rounded-2xl p-6 border-gradient">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Car size={16} className="text-indigo-400" /> Slot Map
                </h2>
                <button onClick={loadData} className="p-1.5 rounded-lg glass border border-white/10 text-slate-500 hover:text-white transition-colors">
                  <RefreshCw size={13} />
                </button>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {slots.map((slot, i) => (
                  <motion.button
                    key={slot.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.01 }}
                    onClick={() => slot.isAvailable && setSelected(slot)}
                    disabled={!slot.isAvailable}
                    title={slot.isAvailable ? `Book ${slot.slotNumber}` : `${slot.slotNumber} is occupied`}
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-xs font-mono font-bold transition-all
                      ${!slot.isAvailable      ? 'slot-occupied' :
                        selected?.id === slot.id ? 'slot-selected' :
                                                   'slot-available'}
                    `}
                  >
                    <Car size={8} />
                    <span className="text-[9px] leading-none">{slot.slotNumber}</span>
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-emerald-500/30 border border-emerald-500/50 rounded-sm" /> Available — click to book
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-red-500/20 border border-red-500/30 rounded-sm" /> Occupied
                </span>
              </div>
            </div>

            {/* Booking panel / modal */}
            <div className="glass rounded-2xl p-6 border-gradient">
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <BookingModal
                      slot={selected}
                      lotName={lot?.name || ''}
                      onClose={() => setSelected(null)}
                      onBooked={() => { setSelected(null); loadData() }}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center text-center h-full py-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                      <Calendar size={24} className="text-indigo-400" />
                    </div>
                    <p className="text-white font-medium mb-2">Ready to book?</p>
                    <p className="text-slate-400 text-sm">
                      {available > 0
                        ? 'Click any green slot on the map to start booking'
                        : 'No available slots in this lot right now'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
