# ParkWave — Parking Management App

A full-stack parking management system with real-time slot booking.

**Stack:** React 18 + Vite (frontend) · ASP.NET Core 10 / EF Core 8 (backend) · SQL Server LocalDB

---

## Quick Start

### 1 — Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| .NET SDK | 10.0+ | [download](https://dotnet.microsoft.com/download) |
| Node.js | 18+ | [download](https://nodejs.org) |
| SQL Server LocalDB | any | ships with Visual Studio / VS Build Tools |

Start LocalDB (one-time):
```
sqllocaldb start MSSQLLocalDB
```

---

### 2 — Backend

```bash
cd backend/ParkingAPI
dotnet run
```

Runs on **http://localhost:5186**  
Database migrations apply automatically on first start.

> **Tip — disk space:** if your C: drive is low, redirect build temp files:
> ```powershell
> $env:TEMP = "D:\tmp"; $env:TMP = "D:\tmp"
> $env:NUGET_PACKAGES = "D:\nuget-packages"
> dotnet build -o "D:\ParkingAPI-out"
> # then run the exe directly:
> $env:ASPNETCORE_URLS = "http://localhost:5186"
> D:\ParkingAPI-out\ParkingAPI.exe
> ```

---

### 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:5173**

The Vite dev server proxies all `/api/*` calls to `http://localhost:5186` automatically — no CORS setup needed during development.

---

## App Routes

| Route | Description | Auth required |
|-------|-------------|---------------|
| `/` | Landing page | No |
| `/register` | Create account | No |
| `/login` | Sign in | No |
| `/lots` | Browse parking lots (paginated, sortable) | Yes |
| `/lots/:id` | Lot detail + slot grid + booking form | Yes |
| `/bookings` | My bookings (filtered by your account) | Yes |
| `/profile` | Account info | Yes |

---

## API Endpoints

Base URL: `http://localhost:5186/api`

### Auth
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/account/register` | `{ UserName, Password }` | `{ token }` |
| POST | `/account/login` | `{ UserName, Password }` | `{ token }` |

### Parking Lots
| Method | Path | Query params |
|--------|------|-------------|
| GET | `/parkinglot` | `PageNumber`, `PageSize`, `SortBy` (Name\|Location), `IsDescending` |
| GET | `/parkinglot/{id}` | — |
| POST | `/parkinglot` | `{ Id, Name, Location, TotalSlots }` |
| PUT | `/parkinglot/{id}` | `{ Id, Name, Location, TotalSlots }` |
| DELETE | `/parkinglot/{id}` | — |

### Parking Slots
| Method | Path | Notes |
|--------|------|-------|
| GET | `/parkingslots` | Returns all slots — filter by `parkingLotId` client-side |
| GET | `/parkingslots/{id}` | — |

### Bookings
| Method | Path | Body |
|--------|------|------|
| GET | `/bookings` | — (returns all; filter by userId client-side) |
| GET | `/bookings/{id}` | — |
| POST | `/bookings` | `{ UserId, ParkingSlotId, StartTime, EndTime }` |

---

## JWT Auth

- Token stored in `sessionStorage` (key: `pw_token`)
- Decoded client-side to extract `userId` (int) and `userName`
- Include as `Authorization: Bearer <token>` header on all API calls

---

## Project Structure

```
Parkingapp/
├── backend/
│   └── ParkingAPI/
│       ├── Controllers/       # AccountController, ParkingLotController,
│       │                      # ParkingSlotsController, BookingsController
│       ├── Models/            # User, ParkingLot, ParkingSlot, Booking
│       ├── Repositories/      # EF Core data access
│       ├── Services/          # TokenService (JWT)
│       ├── Data/              # ParkingLotDbContext
│       ├── DTOs/              # Request/response shapes
│       ├── Migrations/        # EF Core migrations
│       └── appsettings.json   # Connection string + JWT key
└── frontend/
    ├── src/
    │   ├── pages/             # LoginPage, RegisterPage, LotsListPage,
    │   │                      # LotDetailPage, BookingsPage, ProfilePage
    │   ├── components/        # Navbar, Particles
    │   ├── contexts/          # AuthContext (JWT decode + sessionStorage)
    │   └── api/               # client.js (Axios instance + all API helpers)
    ├── vite.config.js         # Dev proxy: /api → localhost:5186
    └── index.html
```

---

## Known Limitations

- **No server-side slot filter** — `GET /parkingslots` returns all slots; frontend filters by `parkingLotId`
- **No server-side booking filter** — `GET /bookings` returns all; frontend filters by `userId`  
- **No `[Authorize]` on controllers** — JWT is validated client-side only; backend trusts the userId in the request body
- **No double-booking prevention on server** — frontend performs a best-effort overlap check before submitting

---

## Deploying the Frontend (Vercel / Netlify)

1. Deploy the backend to a public host (Azure App Service, Railway, Render, etc.)
2. Set the `VITE_API_BASE` environment variable to your backend URL
3. Update `vite.config.js` to use `import.meta.env.VITE_API_BASE` as the proxy target, or configure Axios `baseURL` from the env var
4. `npm run build` → deploy the `dist/` folder

> For a quick local demo, just run both servers locally as described above.
