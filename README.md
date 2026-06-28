# Rovauto

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Backend](https://img.shields.io/badge/Backend-Express-green)
![Database](https://img.shields.io/badge/Database-PostgreSQL-lightgrey)
![ORM](https://img.shields.io/badge/ORM-Prisma-2D3748)
![Payments](https://img.shields.io/badge/Payments-Razorpay-purple)

**Rovauto** is a full-stack vehicle service and roadside assistance platform that connects customers with trusted garages, manages bookings, handles payments, and supports urgent SOS service requests.

It is designed as a complete operating system for car care: customers can discover services, add vehicles, book garages, track active jobs, pay online, raise complaints, and manage notifications, while garage owners and admins get dedicated dashboards for leads, jobs, revenue, wallets, and service operations.

---

## Key Highlights

- End-to-end vehicle service booking platform
- Customer, garage owner, and admin portals
- SOS roadside assistance flow
- Razorpay-powered online payments
- Wallet and transaction management
- Garage discovery with location-aware service flow
- Review, complaint, notification, and support modules
- Media upload support through Cloudinary
- PostgreSQL database managed with Prisma ORM

---

## What Problem Does It Solve?

Vehicle service booking is often fragmented. Customers need to find garages, compare services, schedule visits, pay securely, and track job progress across multiple disconnected channels.

Rovauto brings the complete journey into one platform:

- Find vehicle services and garages
- Book regular or emergency service requests
- Manage vehicles and customer profile details
- Track booking status and service history
- Pay through Razorpay or wallet balance
- Review garages and raise complaints
- Help garage partners manage leads, jobs, and earnings
- Give admins visibility into customers, garages, bookings, and revenue

---

## Why Rovauto?

Most service platforms stop at listing garages. Rovauto is built around the full service lifecycle.

- **Customers** get booking, SOS, payments, notifications, vehicles, profile, and service history.
- **Garage owners** get leads, active jobs, wallet, earnings, and a focused garage dashboard.
- **Admins** get customer, garage, booking, and revenue management tools.
- **The backend** keeps core modules separated into controllers, services, routes, validations, middlewares, and utilities.

The result is a maintainable full-stack platform that can grow from a local garage marketplace into a larger mobility service network.

---

## Core Features

### Customer Portal

- Register, login, OTP verification, and password recovery
- Add and manage vehicles
- Browse service categories
- Select garages and checkout bookings
- Track active bookings
- View service history, payments, notifications, and profile

### SOS Roadside Assistance

- Dedicated panic, location, checkout, and success screens
- SOS request type support in backend booking flow
- Wallet and payment integration for emergency requests

### Garage Portal

- Garage owner dashboard
- Incoming leads and garage requests
- Active job management
- Garage wallet and earnings views
- Magic link route support for garage access flows

### Admin Console

- Admin dashboard
- Customer management
- Garage management
- Booking monitoring
- Revenue overview

### Payments and Wallets

- Razorpay order and payment handling
- Signature verification utility
- Customer wallet transactions
- Garage wallet transactions
- Booking payment, refund, recharge, and SOS deduction transaction types

### Service and Garage Management

- Service categories and service media
- Garage images and videos
- Garage service pricing and availability
- Reviews and rating aggregation
- Complaints with image support

### Notifications and Support

- User notifications
- Contact and support routes
- Complaint lifecycle statuses
- Public and customer cache invalidation utilities

---

## System Architecture

Rovauto follows a modular client-server architecture.

### Frontend: React + Vite

- User-facing website and dashboards
- Route-based customer, garage, admin, booking, auth, and SOS flows
- Axios API client with bearer token support
- Tailwind CSS and React Icons for UI styling

### Backend: Node.js + Express

- REST API served under `/api/v1`
- Layered structure with routes, controllers, services, validations, middlewares, and utilities
- JWT authentication and role-based access support
- Centralized error handling and async handler utilities
- Security and performance middleware: Helmet, CORS, compression, cookies, and request logging

### Database: PostgreSQL + Prisma

- Prisma schema for users, vehicles, garages, bookings, payments, wallets, complaints, reviews, notifications, and service metadata
- Prisma migrations for schema evolution
- Seed scripts for services, garages, vehicle metadata, and notifications

### External Services

- **Razorpay** for payments
- **Cloudinary** for media uploads
- **Resend** for email delivery
- **Redis** for caching
- **PostgreSQL** for persistent data storage

### Request Flow

```text
User -> React Client -> Axios -> Express API -> Services -> Prisma -> PostgreSQL
                                      |
                                      +-> Razorpay / Cloudinary / Resend / Redis
```

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
- Zod
- Express Validator
- Multer
- Cloudinary
- Razorpay
- Redis with ioredis
- Resend

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Aayush20253534/Garage-startup.git
cd Garage-startup
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file using the example:

```bash
cp .env.example .env
```

Update the environment variables:

```env
DATABASE_URL=""
PORT=5000
NODE_ENV=development

JWT_SECRET="your_jwt_secret_here"
JWT_EXPIRES_IN="7d"

RESEND_API_KEY=""
EMAIL_FROM=""

RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
```

Run Prisma migrations and generate the client:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Optional seed scripts:

```bash
npm run seed:services
npm run seed:garages
```

Start the backend:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

API base path:

```text
http://localhost:5000/api/v1
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:8080
```

---

## Available Scripts

### Backend

```bash
npm run dev              # Start backend with nodemon
npm start                # Start backend with node
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run Prisma development migrations
npm run prisma:deploy    # Deploy migrations
npm run prisma:studio    # Open Prisma Studio
npm run seed:services    # Seed service data
npm run seed:garages     # Seed garage data
```

### Frontend

```bash
npm run dev        # Start Vite dev server
npm run build      # Build production bundle
npm run build:dev  # Build in development mode
npm run preview    # Preview production build
```

---

## Usage

1. Create a customer account.
2. Verify OTP and complete authentication.
3. Add your vehicle details.
4. Select a service category and service.
5. Choose a garage or continue through the booking flow.
6. Complete payment.
7. Track active bookings from the customer dashboard.
8. Use SOS flow for urgent roadside assistance.
9. Garage owners can manage leads, jobs, wallet, and earnings.
10. Admins can monitor customers, garages, bookings, and revenue.

---

## API Modules

The backend exposes modular routes under `/api/v1`:

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
|   |   |-- App.jsx
|   |   |-- index.css
|   |   |-- main.jsx
|   |-- package.json
|   |-- vite.config.js
|   |-- vercel.json
|
|-- server/
|   |-- prisma/
|   |   |-- migrations/
|   |   |-- schema.prisma
|   |-- src/
|   |   |-- config/
|   |   |-- constants/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- routes/
|   |   |-- seed/
|   |   |-- services/
|   |   |-- utils/
|   |   |-- validations/
|   |   |-- app.js
|   |   |-- server.js
|   |-- .env.example
|   |-- package.json
|
|-- project-architecture.txt
|-- README.md
```

---

## Database Models

The Prisma schema includes the core domain models:

- User, OTP, CustomerProfile
- Vehicle and CustomerLocation
- Garage, GarageImage, GarageVideo, GarageService
- ServiceCategory, Service, ServiceMedia
- Booking, BookingService, GarageBroadcastRequest
- Payment
- Wallet, WalletTransaction
- GarageWallet, GarageWalletTransaction
- Review
- VehicleBrand, VehicleModel
- Complaint and ComplaintImage
- Notification

---

## Future Improvements

- Add automated tests for backend services and API routes
- Add API documentation with Swagger or Redoc
- Add Docker Compose for local PostgreSQL and Redis setup
- Improve environment-based frontend API configuration
- Add CI/CD pipeline for linting, builds, and deployment checks
- Add real-time booking updates with WebSockets
- Add advanced garage search filters and maps integration
- Add stronger role-based route protection in the frontend
- Add analytics dashboards for admin and garage partners

---

## Contributing

Contributions are welcome. Fork the repository, create a feature branch, and open a pull request with a clear description of your changes.

---

## License

This project is licensed under the **ISC License** based on the current backend package metadata.

