### Rovauto

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![State](https://img.shields.io/badge/State-Redux%20Toolkit-764ABC)
![Backend](https://img.shields.io/badge/Backend-Express-green)
![Database](https://img.shields.io/badge/Database-PostgreSQL-lightgrey)
![ORM](https://img.shields.io/badge/ORM-Prisma-2D3748)
![Payments](https://img.shields.io/badge/Payments-Cashfree-purple)

Rovauto is a full-stack vehicle service and roadside assistance platform. It connects customers with service providers, supports vehicle management, service booking, online payments, SOS requests, wallets, complaints, reviews, notifications, media uploads, and dashboard workflows.

The customer flow is the most complete area today. Garage and admin routes/pages exist and are structured for expansion, with garage leads, jobs, wallet, earnings, media, and request handling already represented in the codebase.

---

## Current Highlights

- Customer registration, login, OTP verification, Google auth, password recovery, profile, and dashboard flows
- JWT auth with an httpOnly cookie set by the backend and bearer-token fallback used by the frontend
- Redux Toolkit store for central customer auth/profile/vehicle/location state
- Login, Google auth, and OTP verification return the safe user bundle with `customerProfile`, `vehicles`, and `locations`
- Location onboarding appears only when the customer has no saved profile address or `CustomerLocation`
- Vehicle add/select/default management
- Service category browsing, cart, booking checkout, and tracking
- Cashfree order creation and payment verification
- Pending-payment recovery from Checkout, Active Bookings, Payments, and Tracking
- Garage request broadcasting after successful booking payment
- Mandatory 5-photo pickup inspection after handover OTP verification and 5-photo delivery inspection before garage delivery marking
- Customer dashboard caching with frontend cache and optional Redis backend cache
- Route-level frontend code splitting with `React.lazy()` and `Suspense`
- Customer backend modules grouped under `server/src/customer`
- PostgreSQL persistence through Prisma
- Cloudinary media upload support for garage/customer/admin media workflows, including booking inspection evidence
- Resend email support and Fast2SMS-compatible OTP support
- Database maintenance scripts for targeted cleanup and user-data backup/delete operations

---

## Tech Stack

### Frontend

- React 18
- Vite
- Redux Toolkit
- React Redux
- React Router DOM
- Axios
- Tailwind CSS
- Framer Motion
- React Icons
- Firebase client auth for Google sign-in

### Backend

- Node.js
- Express 5
- Prisma ORM
- PostgreSQL
- JWT
- Argon2
- Firebase Admin for Google ID token verification
- Express Validator
- Multer
- Cloudinary
- Cashfree
- Redis with ioredis
- Resend

---

## Architecture

```text
User -> React/Vite Client -> Axios -> Express API -> Services -> Prisma -> PostgreSQL
                  |                            |
                  |                            +-> Cashfree / Cloudinary / Resend / Redis / Firebase Admin
                  +-> Redux Toolkit customer store
```

The API is served under:

```text
/api/v1
```

Customer backend code is grouped in:

```text
server/src/customer/
|-- controllers/
|-- routes/
|-- services/
|-- validations/
```

Shared backend infrastructure remains in `config`, `constants`, `middlewares`, and `utils`. Garage/admin-side files currently remain in the top-level backend module folders.

---

## Project Structure

```text
Codebase/
|-- client/
|   |-- src/
|   |   |-- api/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- data/
|   |   |-- hooks/
|   |   |-- layouts/
|   |   |-- pages/
|   |   |   |-- admin/
|   |   |   |-- auth/
|   |   |   |-- booking/
|   |   |   |-- customer/
|   |   |   |-- garage/
|   |   |   |-- sos/
|   |   |-- store/
|   |   |-- utils/
|   |   |-- App.jsx
|   |   |-- index.css
|   |   |-- main.jsx
|   |-- README.md
|   |-- package.json
|   |-- vite.config.js
|
|-- server/
|   |-- prisma/
|   |   |-- migrations/
|   |   |-- schema.prisma
|   |-- src/
|   |   |-- config/
|   |   |-- constants/
|   |   |-- customer/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- routes/
|   |   |-- scripts/
|   |   |-- seed/
|   |   |-- services/
|   |   |-- utils/
|   |   |-- validations/
|   |   |-- app.js
|   |   |-- server.js
|   |-- README.md
|   |-- package.json
|
|-- README.md
|-- project-architecture.txt
```

---

## Installation

### Backend

```bash
cd server
npm install
```

Create `server/.env` from `server/.env.example` and configure:

```env
DATABASE_URL=""
PORT=5000
NODE_ENV=development

JWT_SECRET="your_jwt_secret_here"
JWT_EXPIRES_IN="7d"

RESEND_API_KEY=""
EMAIL_FROM=""

SMS_PROVIDER="fast2sms_quick"
FAST2SMS_API_KEY=""

FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""

CASHFREE_APP_ID=""
CASHFREE_SECRET_KEY=""
CASHFREE_ENV="sandbox"
CASHFREE_NOTIFY_URL=""

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

REDIS_URL=""
CLIENT_URL="https://your-frontend-domain.com"
FRONTEND_URL="https://your-frontend-domain.com"
```

Run Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Optional seeds:

```bash
npm run seed:services
npm run seed:garages
```

Start backend:

```bash
npm run dev
```

Backend default:

```text
http://localhost:5000/api/v1
```

### Frontend

```bash
cd client
npm install
```

Optional `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Start frontend:

```bash
npm run dev
```

Frontend default:

```text
http://localhost:8080
```

---

# Docker Setup

Rovauto can be run locally using Docker and Docker Compose without installing Node.js dependencies manually.

## Prerequisites

- Docker Desktop (Windows/macOS) or Docker Engine (Linux)
- Docker Compose

Verify installation:

```bash
docker --version
docker compose version
```

---

## Project Structure

```text
Codebase/
├── client/
│   ├── Dockerfile
│   └── .dockerignore
│
├── server/
│   ├── Dockerfile
│   └── .dockerignore
│
└── docker-compose.yml
```

---

## Environment Variables

Create the required environment files before building.

### Backend

Create:

```text
server/.env
```

Configure all required variables such as:

```env
DATABASE_URL=
JWT_SECRET=
GROQ_API_KEY=
RESEND_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
...
```

### Frontend

Create:

```text
client/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

---

## Build Containers

From the project root:

```bash
docker compose up --build
```

---

## Run In Background

```bash
docker compose up -d
```

---

## Stop Containers

```bash
docker compose down
```

---

## Rebuild Images

Whenever dependencies or Dockerfiles change:

```bash
docker compose up --build
```

or

```bash
docker compose up -d --build
```

---

## View Running Containers

```bash
docker ps
```

---

## View Logs

All containers:

```bash
docker compose logs -f
```

Backend only:

```bash
docker compose logs -f backend
```

Frontend only:

```bash
docker compose logs -f frontend
```

---

## Access Application

Frontend:

```text
http://localhost:8080
```

Backend:

```text
http://localhost:5000/api/v1
```

---

## Docker Images

The setup creates two images:

- `codebase-frontend`
- `codebase-backend`

Running containers:

- `rovauto-frontend`
- `rovauto-backend`

---

## Production

The same Dockerfiles can be used for production deployment on:

- Render
- Railway
- DigitalOcean
- AWS EC2
- Azure VM
- Google Cloud VM
- Any VPS supporting Docker

For Vercel deployments, continue deploying the frontend as a Static Site while deploying the backend separately.

---

## Scripts

### Backend

```bash
npm run dev                         # Start backend with nodemon
npm start                           # Start backend with node
npm run prisma:generate             # Generate Prisma client
npm run prisma:migrate              # Run development migrations
npm run prisma:deploy               # Deploy migrations
npm run prisma:studio               # Open Prisma Studio
npm run seed:services               # Seed service data
npm run seed:garages                # Seed garage data
npm run db:delete-user              # Dry-run/delete matched user data by id/email/phone/name
npm run db:delete-active-bookings   # Dry-run/delete active bookings for one email
npm run db:delete-payments          # Dry-run/delete payment records for one email
npm run db:delete-service-history   # Dry-run/delete completed bookings for one email
npm run db:nuke-users               # Dry-run/delete all users after JSON backup and explicit flags
```

Targeted cleanup commands are dry-run by default. Add `--confirm` to delete. The nuke command also requires `--i-understand-delete-all-users` and writes a JSON backup first.

### Frontend

```bash
npm run dev        # Start Vite dev server
npm run build      # Build production bundle into dist/
npm run build:dev  # Build in development mode
npm run preview    # Preview production build
```

---

## API Modules

Mounted under `/api/v1`:

- `/auth`
- `/customer`
- `/vehicles`
- `/locations`
- `/contact`
- `/services`
- `/vehicle-meta`
- `/garages`
- `/notifications`
- `/bookings`
- `/payments`
- `/reviews`
- `/complaints`
- `/dashboard`
- `/wallet`
- `/garage/wallet`
- `/garage/requests`
- `/sos`

---

## Current Customer And Garage Flow

The current backend flow is API-ready for customer booking, garage acceptance, wallet deduction, handover OTP, delivery acceptance, and service history.

```text
Customer selects vehicle/services/location
 -> Backend resolves manual address to lat/lng when /locations/geocode is used
 -> Backend calculates estimated service price range
 -> Customer pays Rovauto handling/platform fee through Cashfree
 -> Payment verification starts garage search
 -> Nearby active verified garages within GARAGE_BROADCAST_RADIUS_KM receive request notification/log
 -> Garage opens accept link and accepts on website
 -> Garage wallet platform fee is deducted
 -> Customer gets in-app accepted notification with handover OTP
 -> Garage verifies OTP before vehicle handover
 -> Booking moves to IN_PROGRESS
 -> Garage marks delivered
 -> Customer accepts delivery
 -> Booking moves to COMPLETED and appears in service history
```

Important backend controls:

```env
GARAGE_BROADCAST_RADIUS_KM=15
GARAGE_SEARCH_TIMEOUT_SECONDS=120
HANDOVER_OTP_TTL_MINUTES=30
SERVICE_PRICE_RANGE_DELTA=500
```

If no garage accepts within the search window, the booking and pending garage requests expire and the customer receives an in-app notification asking them to try again.

Manual address flow uses OpenStreetMap Nominatim through the backend:

```text
GET /api/v1/locations/geocode?address=Baneshwor&city=Kathmandu
```

The frontend should send the returned `latitude` and `longitude` during checkout. Distance is calculated by the backend using the Haversine formula between customer coordinates and stored garage coordinates.

Key backend routes:

```text
POST /api/v1/garage/applications
GET/POST/PATCH/DELETE /api/v1/admin/city-service-price-ranges
POST /api/v1/garage/wallet/recharge/order
POST /api/v1/garage/wallet/recharge/verify
POST /api/v1/garages/:garageId/media
GET /api/v1/garage/requests
POST /api/v1/garage/requests/:requestId/accept
POST /api/v1/garage/requests/:requestId/verify-handover-otp
POST /api/v1/garage/requests/:requestId/mark-delivered
POST /api/v1/bookings/:id/accept-delivery
GET /api/v1/bookings/service-history
```

WhatsApp provider envs can stay empty during testing. When empty, the backend logs the outgoing WhatsApp-style message and accept link instead of calling a real provider.
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### Booking Inspection Images

Garage owners must upload exactly 5 car inspection photos at each handover checkpoint:

```text
PICKUP: after valid handover OTP verification, before booking moves to IN_PROGRESS
DELIVERY: before garage marks the vehicle delivered
```

Both sets are uploaded to Cloudinary and stored in PostgreSQL/Neon through `BookingInspectionImage` with `bookingId`, `garageId`, `phase`, `imageUrl`, `publicId`, and `order`. Booking responses include `inspectionImages` ordered by phase and photo order.
-------------------------------------------------------------------------------------------------------------------------------------------------------------

## Auth And State Notes

- Backend sets an `accessToken` cookie and also returns a token for bearer-token compatibility.
- Frontend currently stores the token in localStorage and sends it through Axios authorization headers.
- Redux Toolkit stores the safe customer bundle on the frontend: `user`, `customerProfile`, `vehicles`, `locations`, selected vehicle, and selected location.
- Do not store passwords, OTPs, raw wallet transaction history, or other sensitive records in Redux/localStorage.
- If frontend and backend move to a shared production domain setup, cookie-only auth can be revisited.

---

## Media Notes

- Static brand/core UI assets can stay in the frontend build.
- Dynamic garage media, complaint images, booking pickup/delivery inspection images, and admin-managed service media should use Cloudinary.
- Optimize large image assets before production traffic.

---

## Production Notes

- Add Cashfree webhooks before real production payment traffic.
- Configure all production secrets in hosting environment variables.
- Configure production CORS with `CLIENT_URL` / `FRONTEND_URL`.
- Prefer one PostgreSQL database for core relational business data, with separate development/staging/production databases by environment.
- Use Redis for cache/rate-limit/session-like volatile data where needed.
- Confirm role protection for garage/admin routes before public launch.
- Add automated tests for auth, booking, payments, wallet, media, and role access.
- Run Prisma deploy migrations during production releases.

---

## Build Output

The frontend `dist/` folder is generated by Vite. It contains production-ready HTML, CSS, JavaScript, and assets. Do not edit `dist/` directly.

---

## License

ISC, based on the current backend package metadata.
