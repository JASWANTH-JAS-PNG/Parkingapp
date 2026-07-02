/**
 * Axios instance + typed API helpers.
 * All shapes match the real backend DTOs confirmed from source code.
 *
 * Known backend gaps (PRD §9) handled here:
 *  - No /parkingslots?parkingLotId filter → caller filters client-side
 *  - No /bookings?userId filter            → caller filters client-side
 *  - No slot-conflict check               → BookingModal does best-effort check
 *  - userId in POST /bookings is int; JWT has GUID string (type mismatch)
 */
import axios from 'axios'

const SESSION_KEY = 'pw_token'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE ?? '/api' })

api.interceptors.request.use(cfg => {
  const token = sessionStorage.getItem(SESSION_KEY)
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// On 401 → clear session + bounce to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      sessionStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ── Account ──────────────────────────────────────────────────────────────────
// Returns { token } — no user object. Caller decodes JWT via AuthContext.
export const authAPI = {
  login: ({ userName, password }) =>
    api.post('/account/login', { UserName: userName, Password: password }),

  register: ({ userName, password, email, name }) =>
    api.post('/account/register', {
      UserName: userName,
      Password: password,
      Email:    email || undefined,
      Name:     name  || undefined,
    }),
}

// ── Parking Lots ──────────────────────────────────────────────────────────────
// QueryObject: SortBy ('Name'|'Location'), IsDescending, PageNumber, PageSize
export const lotsAPI = {
  getAll: ({ sortBy, isDescending, pageNumber = 1, pageSize = 10 } = {}) =>
    api.get('/parkinglot', {
      params: {
        SortBy:       sortBy       || undefined,
        IsDescending: isDescending || undefined,
        PageNumber:   pageNumber,
        PageSize:     pageSize,
      },
    }),

  getById: id => api.get(`/parkinglot/${id}`),

  // Controller accepts ParkingLotDTO: { Id, Name, Location, TotalSlots }
  create: ({ name, location, totalSlots }) =>
    api.post('/parkinglot', {
      Id:         0,
      Name:       name,
      Location:   location,
      TotalSlots: Number(totalSlots),
    }),

  update: (id, { name, location, totalSlots }) =>
    api.put(`/parkinglot/${id}`, {
      Id:         id,
      Name:       name,
      Location:   location,
      TotalSlots: Number(totalSlots),
    }),

  delete: id => api.delete(`/parkinglot/${id}`),
}

// ── Parking Slots ─────────────────────────────────────────────────────────────
// NOTE: no ?parkingLotId query param exists — fetch all, filter client-side.
export const slotsAPI = {
  getAll:  () => api.get('/parkingslots'),
  getById: id => api.get(`/parkingslots/${id}`),
  create: ({ parkingLotId, slotNumber, isAvailable = true }) =>
    api.post('/parkingslots', {
      ParkingLotId: parkingLotId,
      SlotNumber:   slotNumber,
      IsAvailable:  isAvailable,
    }),
}

// ── Bookings ──────────────────────────────────────────────────────────────────
// NOTE: returns ALL bookings — filter client-side by userId.
// NOTE: userId is int in the model but IdentityUser.Id is a GUID string.
//       Sending the raw JWT userId; if the backend rejects it, the error
//       is surfaced to the user (PRD §9 gap #3).
export const bookingsAPI = {
  getAll:  () => api.get('/bookings'),
  getById: id => api.get(`/bookings/${id}`),
  create: ({ userId, parkingSlotId, startTime, endTime }) =>
    api.post('/bookings', {
      UserId:        parseInt(userId, 10) || 0,
      ParkingSlotId: parkingSlotId,
      StartTime:     startTime,
      EndTime:       endTime,
    }),
}
