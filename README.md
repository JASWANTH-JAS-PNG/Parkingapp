# ParkWave

A full-stack parking management web app — browse lots, book slots, and manage reservations in real time.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![.NET](https://img.shields.io/badge/.NET-10-512BD4?logo=dotnet&logoColor=white&style=flat-square)
![EF Core](https://img.shields.io/badge/EF_Core-8-512BD4?logo=dotnet&logoColor=white&style=flat-square)
![SQL Server](https://img.shields.io/badge/SQL_Server-LocalDB-CC2927?logo=microsoftsqlserver&logoColor=white&style=flat-square)

---

## Features

- **JWT authentication** — register, login, session stored in `sessionStorage`
- **Parking lot browser** — paginated list with sort by name / location
- **Slot grid** — visual availability map per lot, click to book
- **Bookings dashboard** — view and manage your reservations
- **Profile page** — account details at a glance
- **Animated UI** — Framer Motion transitions, particle background, dark theme

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, React Router v7, Vite 8 |
| Styling | Tailwind CSS v4, Headless UI, Framer Motion |
| Icons / UX | Lucide React, React Hot Toast, Recharts |
| HTTP | Axios (with JWT interceptor + 401 redirect) |
| Backend | ASP.NET Core 10, EF Core 8 |
| Auth | JWT (System.IdentityModel.Tokens.Jwt) |
| ORM | Entity Framework Core + Repository pattern |
| Logging | Serilog (console + rolling file) |
| Database | SQL Server LocalDB (dev) · PostgreSQL (prod) |

---

## Local Development

### Prerequisites

| Tool | Version |
|---|---|
| .NET SDK | 10.0+ |
| Node.js | 18+ |
| SQL Server LocalDB | any (ships with Visual Studio / Build Tools) |

### 1 — Start LocalDB

```bash
sqllocaldb start MSSQLLocalDB
```

### 2 — Backend

```bash
cd backend/ParkingAPI
dotnet run
# → http://localhost:5186
```

EF migrations run automatically on first start and create the database.

### 3 — Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5186` — no CORS config needed.

---

## Deployment

### Frontend → Vercel

1. Import the GitHub repo in [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   VITE_API_BASE = https://your-backend.railway.app/api
   ```
4. Deploy — Vercel auto-rebuilds on every push to `main`

### Backend → Railway

1. Create a new project in [Railway](https://railway.app)
2. **Add service → GitHub repo** → point to `backend/ParkingAPI`
3. **Add service → PostgreSQL** — Railway injects `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` automatically
4. The backend detects these env vars and switches from SQL Server to PostgreSQL at startup
5. Copy the public backend URL and paste it into Vercel's `VITE_API_BASE`

---

## Project Structure

```
Parkingapp/
├── backend/
│   └── ParkingAPI/
│       ├── Controllers/       # Account, ParkingLot, ParkingSlots, Bookings
│       ├── MODELS/            # User, ParkingLot, ParkingSlot, Booking
│       ├── Repositories/      # EF Core data access (repository pattern)
│       ├── Services/          # TokenService (JWT generation)
│       ├── data/              # ParkingLotDbContext
│       ├── DTOs/              # Request / response shapes
│       ├── Migrations/        # EF Core SQL Server migrations
│       ├── Middleware/        # GlobalExceptionMiddleware
│       └── Program.cs         # App entry point
└── frontend/
    └── src/
        ├── api/               # client.js — Axios instance + all API helpers
        ├── contexts/          # AuthContext — JWT decode + sessionStorage
        ├── components/        # Navbar, Particles
        └── pages/             # Landing, Login, Register, Lots, LotDetail,
                               # Bookings, Profile
```

---

## API Reference

Base URL: `http://localhost:5186/api`

### Auth
| Method | Path | Body |
|---|---|---|
| POST | `/account/register` | `{ UserName, Password }` |
| POST | `/account/login` | `{ UserName, Password }` |

Both return `{ token }` — a signed JWT.

### Parking Lots
| Method | Path | Notes |
|---|---|---|
| GET | `/parkinglot` | `?PageNumber&PageSize&SortBy&IsDescending` |
| GET | `/parkinglot/{id}` | |
| POST | `/parkinglot` | `{ Id, Name, Location, TotalSlots }` |
| PUT | `/parkinglot/{id}` | |
| DELETE | `/parkinglot/{id}` | |

### Parking Slots
| Method | Path |
|---|---|
| GET | `/parkingslots` |
| GET | `/parkingslots/{id}` |

### Bookings
| Method | Path | Body |
|---|---|---|
| GET | `/bookings` | |
| GET | `/bookings/{id}` | |
| POST | `/bookings` | `{ UserId, ParkingSlotId, StartTime, EndTime }` |
