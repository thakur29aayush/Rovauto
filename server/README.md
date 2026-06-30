# Rovauto Server

Express + Prisma backend for Rovauto.

## Current Backend Capabilities

- REST API under `/api/v1`
- JWT-protected customer, garage, and admin-capable API modules
- Auth flows for signup, OTP verification, login, Google auth, logout, forgot password, and reset password
- Auth responses return a safe user bundle with `customerProfile`, `vehicles`, and `locations` to reduce frontend follow-up calls
- Customer booking, vehicle, location, service, payment, wallet, complaint, review, notification, profile, dashboard, and SOS modules
- Cashfree order creation and payment verification
- Pending-payment support through persisted `Payment` and `Booking` states
- Garage request broadcasting after successful payment verification
- Garage wallet/request/media routes and services
- Redis-backed cache utility with safe fallback when `REDIS_URL` is not configured
- PostgreSQL persistence through Prisma
- Media upload support through Cloudinary
- Email support through Resend
- SMS/OTP provider support through Fast2SMS-compatible config
- Database cleanup scripts with dry-run defaults and explicit confirmation flags

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
|-- scripts/           # Database maintenance scripts
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

For production releases, use:

```bash
npm run prisma:deploy
```

## Scripts

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

Examples:

```bash
npm run db:delete-active-bookings -- --email=aayush@example.com
npm run db:delete-active-bookings -- --email=aayush@example.com --confirm
npm run db:nuke-users
npm run db:nuke-users -- --confirm --i-understand-delete-all-users
```

Maintenance scripts are intentionally dry-run first. The nuke command preserves garages and service catalog data, clears garage owner links, writes a JSON backup, and deletes user-linked data only after both confirmation flags are provided.

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

## Auth Notes

- Backend sets an `accessToken` cookie using secure/httpOnly settings when appropriate.
- Backend also returns a token for bearer-token compatibility with the current deployed frontend/backend domains.
- The token payload remains safe and compact.
- Login, Google auth, OTP verification, and `/auth/me` return a safe user bundle with profile, vehicles, and locations.
- Passwords, OTP hashes, wallet transactions, and other sensitive records are not returned in auth responses.

## Media Notes

- Garage media, complaint images, before/after job media, and other dynamic uploads should use Cloudinary.
- Fixed frontend assets can remain bundled with the client when they rarely change.
- Upload limits and media validation are enforced through backend middleware.

## Production Notes

- Add Cashfree webhooks before real production payment traffic.
- Keep all secrets in deployment environment variables, not committed files.
- Confirm role checks on garage/admin routes before public launch.
- Configure `CLIENT_URL` / `FRONTEND_URL` for production CORS.
- Prefer one PostgreSQL database for core relational business data, with separate databases per environment: development, staging, and production.
- Use Redis for cache/rate-limit/session-like volatile data where needed.
- Run Prisma deploy migrations during production release.
