# Rovauto Server

Express + Prisma backend for Rovauto.

## Current Backend Capabilities

- REST API under `/api/v1`
- JWT-protected customer APIs
- Customer booking, vehicle, service, payment, wallet, complaint, review, notification, profile, dashboard, and SOS modules
- Cashfree order creation and payment verification
- Pending-payment support through persisted `Payment` and `Booking` states
- Garage request broadcasting after successful payment verification
- Redis-backed cache utility with safe fallback when `REDIS_URL` is not configured
- PostgreSQL persistence through Prisma
- Media upload support through Cloudinary
- Email support through Resend

## Source Layout

Customer-facing backend code is grouped under `src/customer`:

```text
src/
|-- app.js
|-- server.js
|-- config/
|-- constants/
|-- customer/
|   |-- controllers/
|   |-- routes/
|   |-- services/
|   |-- validations/
|-- controllers/       # Garage/admin-side controllers currently present
|-- routes/            # Root route aggregator and garage/admin-side routes
|-- services/          # Garage/admin-side services currently present
|-- middlewares/
|-- seed/
|-- utils/
|-- validations/       # Garage/admin-side validations currently present
```

`src/routes/index.routes.js` keeps public API paths unchanged while mounting customer modules from `src/customer/routes`.

## Setup

```bash
npm install
```

Create `server/.env` from `.env.example` and configure:

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

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

REDIS_URL=""
CLIENT_URL="https://your-frontend-domain.com"
FRONTEND_URL="https://your-frontend-domain.com"
```

`REDIS_URL` is optional in development. If it is missing, cache calls are disabled safely.

## Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

Optional seeds:

```bash
npm run seed:services
npm run seed:garages
```

## Scripts

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

## Production Notes

- Add Cashfree webhooks before real production payment traffic.
- Keep all secrets in deployment environment variables, not committed files.
- Confirm role checks on garage/admin routes before public launch.
- Configure `CLIENT_URL` / `FRONTEND_URL` for production CORS.
- Run Prisma deploy migrations during production release.
