import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Car, MapPin, ArrowLeft, Clock, Calendar,
  CheckCircle, Info, Zap, AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { lotsAPI, slotsAPI, bookingsAPI } from '../api/client'

// ─── Deterministic mock slots when API has none ──────────────────────────────
function makeMockSlots(lotId, count = 40) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    slotNumber: `${String.fromCharCode(65 + Math.floor(i / 10))}-${String((i % 10) + 1).padStart(2, '0')}`,
    isAvailable: (i * 7 + lotId * 3) % 5 !== 0,   // ~80% available, deterministic
    parkingLotId: lotId,
  }))
}

export default function SlotBookingPage() {
  const { id }     = useParams()
  const lotId      = parseInt(id, 10)
  const navigate   = useNavigate()

  const [lot,       setLot]       = useState(null)
  const [slots,     setSlots]     = useState([])
  const [selected,  setSelected]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [booking,   setBooking]   = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [apiError,  setApiError]  = useState('')
  const [form,      setForm]      = useState({ startTime: '', endTime: '' })

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([lotsAPI.getById(lotId), slotsAPI.getAll()])
      .then(([l, s]) => {
        if (l.status === 'fulfilled') setLot(l.value.data)

        let realSlots = []
        if (s.status === 'fulfilled' && Array.isArray(s.value.data)) {
          realSlots = s.value.data.filter(sl => sl.parkingLotId === lotId)
        }
        // Fall back to mock slots so the UI is always usable
        setSlots(realSlots.length > 0 ? realSlots : makeMockSlots(lotId))
      })
      .catch(() => setApiError('Could not load slot data'))
      .finally(() => setLoading(false))
  }, [lotId])

  const durationHrs = (() => {
    if (!form.startTime || !form.endTime) return 0
    return Math.max(0, (new Date(form.endTime) - new Date(form.startTime)) / 3_600_000)
  })()

  const handleBook = async () => {
    if (!selected)                return toast.error('Select a slot first')
    if (!form.startTime)          return toast.error('Set a start time')
    if (!form.endTime)            return toast.error('Set an end time')
    if (durationHrs <= 0)         return toast.error('End time must be after start time')

    setBooking(true)
    setApiError('')
    try {
      await bookingsAPI.create({
        parkingSlotId: selected.id,
        startTime:     new Date(form.startTime).toISOString(),
        endTime:       new Date(form.endTime).toISOString(),
      })
      setConfirmed(true)
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === 'string') setApiError(msg)
      else setApiError('Booking failed — check that the backend is running')
    } finally {
      setBooking(false)
    }
  }

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen animated-bg flex items-center justify-center">
      <div className="spinner" />
    </div>
  )

  // ─── Confirmed ────────────────────────────────────────────────────────────
  if (confirmed) return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-3xl p-10 max-w-md w-full text-center border-gradient"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6 neon-cyan"
        >
          <CheckCircle size={36} className="text-emerald-400" />
        </motion.div>
        <h2 className="text-3xl font-extrabold text-white mb-2">Booking Confirmed!</h2>
        <p className="text-slate-400 mb-2">
          Slot <span className="text-indigo-300 font-bold">{selected?.slotNumber}</span> is reserved
        </p>
        <p className="text-slate-500 text-sm mb-8">
          {new Date(form.startTime).toLocaleString()} → {new Date(form.endTime).toLocaleString()}
        </p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/bookings')}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium neon-indigo hover:from-indigo-400 hover:to-purple-500 transition-all"
          >
            View Bookings
          </button>
          <button onClick={() => navigate('/lots')}
            className="flex-1 py-3 rounded-xl glass border border-white/10 text-slate-300 hover:text-white text-sm transition-colors"
          >
            Browse More
          </button>
        </div>
      </motion.div>
    </div>
  )

  // ─── Main ─────────────────────────────────────────────────────────────────
  const lotName = lot?.name || `Parking Lot #${id}`

  return (
    <div className="min-h-screen animated-bg pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/lots')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Lots
        </motion.button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-extrabold text-white">{lotName}</h1>
          {lot?.location && (
            <p className="flex items-center gap-1.5 text-slate-400 mt-1">
              <MapPin size={15} className="text-indigo-400" />{lot.location}
            </p>
          )}
          <p className="text-slate-500 text-sm mt-1">
            {slots.filter(s => s.isAvailable).length} of {slots.length} slots available
          </p>
        </motion.div>

        {/* API error */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6"
          >
            <AlertCircle size={16} className="flex-shrink-0" />{apiError}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Slot grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass rounded-2xl p-6 border-gradient"
          >
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Car size={18} className="text-indigo-400" /> Select a Slot
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-emerald-500/40 border border-emerald-500/50 rounded-sm inline-block" />
                  Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-red-500/30 border border-red-500/30 rounded-sm inline-block" />
                  Occupied
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-indigo-500/50 border-2 border-indigo-500 rounded-sm inline-block" />
                  Selected
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
              {slots.map((slot, i) => (
                <motion.button
                  key={slot.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.012 }}
                  onClick={() => slot.isAvailable && setSelected(slot)}
                  disabled={!slot.isAvailable}
                  title={slot.isAvailable ? `Click to select ${slot.slotNumber}` : `${slot.slotNumber} is occupied`}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-mono font-bold
                    ${!slot.isAvailable      ? 'slot-occupied' :
                      selected?.id === slot.id ? 'slot-selected' : 'slot-available'}
                  `}
                >
                  <Car size={9} className="mb-0.5" />
                  {slot.slotNumber}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30"
                >
                  <Info size={16} className="text-indigo-400 flex-shrink-0" />
                  <span className="text-indigo-300 text-sm">
                    Slot <strong>{selected.slotNumber}</strong> selected — fill in times and confirm
                  </span>
                  <button
                    onClick={() => setSelected(null)}
                    className="ml-auto text-slate-500 hover:text-slate-300 text-xs transition-colors"
                  >
                    Clear
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Booking panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-6 border-gradient flex flex-col"
          >
            <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
              <Calendar size={18} className="text-purple-400" /> Booking Details
            </h2>

            <div className="space-y-4 mb-5">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Clock size={13} /> Start time
                </label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white text-sm transition-all"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Clock size={13} /> End time
                </label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white text-sm transition-all"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="glass rounded-xl p-4 mb-5 space-y-2.5 text-sm flex-shrink-0">
              <div className="flex justify-between">
                <span className="text-slate-400">Slot</span>
                <span className="text-white font-medium">{selected?.slotNumber || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration</span>
                <span className="text-white font-medium">{durationHrs > 0 ? `${durationHrs.toFixed(1)}h` : '—'}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Est. cost</span>
                <span className="gradient-text font-bold">
                  {durationHrs > 0 ? `$${(durationHrs * 2.5).toFixed(2)}` : '—'}
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBook}
              disabled={booking || !selected || !form.startTime || !form.endTime || durationHrs <= 0}
              className="mt-auto w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold neon-indigo hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {booking
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Zap size={16} /> Confirm Booking</>
              }
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
