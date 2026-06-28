# Rovauto

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Backend](https://img.shields.io/badge/Backend-Express-green)
![Database](https://img.shields.io/badge/Database-PostgreSQL-lightgrey)
![ORM](https://img.shields.io/badge/ORM-Prisma-2D3748)
![Payments](https://img.shields.io/badge/Payments-Cashfree-purple)

Rovauto is a full-stack vehicle service and roadside assistance platform. It connects customers with service providers, supports vehicle management, service booking, online payments, SOS requests, wallets, complaints, reviews, notifications, and dashboard workflows.

The current implementation is strongest on the customer side. Garage and admin pages/routes exist in the codebase, but those areas are expected to grow further.

---

## Current Highlights

- Customer registration, login, OTP, password recovery, profile, and dashboard flows
- Vehicle add/select/default management
- Service category browsing and booking checkout
- Cashfree order creation and payment verification
- Pending-payment recovery from Checkout, Active Bookings, Payments, and Tracking
- Tracking disabled until a booking is paid
- SOS frontend and backend request flow
- Customer dashboard caching with frontend cache and optional Redis backend cache
- Route-level frontend code splitting with `React.lazy()` and `Suspense`
- Customer backend modules grouped under `server/src/customer`
- PostgreSQL persistence through Prisma
- Cloudinary-ready media upload support
- Resend-ready email support

---

## Tech Stack

### Frontend

- React 18
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- Framer Motion
- React Icons

### Backend

- Node.js
- Express 5
- Prisma ORM
- PostgreSQL
- JWT
- Argon2
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
                                               |
                                               +-> Cashfree / Cloudinary / Resend / Redis
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

CASHFREE_APP_ID=""
CASHFREE_SECRET_KEY=""
CASHFREE_ENV="sandbox"
CASHFREE_NOTIFY_URL=""

REDIS_URL=""
CLIENT_URL="http://localhost:8080"
FRONTEND_URL="http://localhost:8080"
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

## Scripts

### Backend

```bash
npm run dev              # Start backend with nodemon
npm start                # Start backend with node
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run development migrations
npm run prisma:deploy    # Deploy migrations
npm run prisma:studio    # Open Prisma Studio
npm run seed:services    # Seed service data
npm run seed:garages     # Seed garage data
```

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

## Current Customer Flow

1. Register or log in.
2. Add/select a vehicle.
3. Pick services.
4. Checkout creates a backend booking.
5. Cashfree payment order is created.
6. Successful payment verification moves the booking to garage search.
7. If payment is created but not completed, the user can retry from Active Bookings, Payments, or Tracking.
8. Tracking is blocked until payment is complete.

---

## Production Notes

- Add Cashfree webhooks before real production payment traffic.
- Configure all production secrets in hosting environment variables.
- Configure production CORS with `CLIENT_URL` / `FRONTEND_URL`.
- Compress large images before scaling traffic.
- Confirm role protection for garage/admin routes before public launch.
- Add automated tests for auth, booking, payments, and role access.
- Run Prisma deploy migrations during production releases.

---

## Build Output

The frontend `dist/` folder is generated by Vite. It contains production-ready HTML, CSS, JavaScript, and assets. Do not edit `dist/` directly.

---

## License

ISC, based on the current backend package metadata.
