# Customer Backend Documentation

## Final Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Express.js + Node.js |
| Database | PostgreSQL (Neon) |
| ORM | Prisma ORM |
| Authentication | JWT + Argon2 |
| Email Verification | Resend OTP |
| Payments | Razorpay |
| Media Storage | Cloudinary |
| Maps | GPS Coordinates + Distance Filtering |
| Password Security | Argon2 Hashing |
| API Validation | Express Validator |

---

# Customer Backend Modules

## 1. Authentication

- Signup
- Email OTP Verification
- Resend OTP
- Login (Email / Phone)
- Forgot Password
- Reset Password
- JWT Authentication

---

## 2. Customer Onboarding

- Add First Vehicle
- Save Default GPS Location
- Save Address
- Mark User as Onboarded

---

## 3. Customer Profile

- View Profile
- Update Profile
- Change Password
- Delete Account

---

## 4. Vehicles

- Add Vehicle
- Update Vehicle
- Delete Vehicle
- View Vehicles
- Set Default Vehicle

---

## 5. Saved Locations

- Add Location
- Update Location
- Delete Location
- View Saved Locations
- Set Default Location

---

## 6. Garage Discovery

- Get Nearby Garages
- Get All Garages
- Search Garages
- Filter by
  - Distance
  - Rating
  - Verified
  - Service
  - Open Now
- Garage Details

---

## 7. Garage Media

- Thumbnail
- Gallery Images (5–10)
- Videos (1–2)

---

## 8. Booking

- Select Garage
- Select Service
- Select Vehicle
- Select Slot
- Add Customer Note
- Create Booking
- Cancel Booking

---

## 9. Payment

- Create Razorpay Order
- Verify Razorpay Signature
- Store ₹99 Convenience Fee

---

## 10. Booking History

- Pending Payment
- Confirmed
- In Progress
- Completed
- Cancelled

---

## 11. Reviews

- Create Review
- Edit Review
- Delete Review
- View My Reviews

---

## 12. Complaints

- Create Complaint
- Upload 1–10 Images
- Complaint History
- Complaint Status Tracking

---

# Media Upload Rules

## Complaint Images

- Minimum: 1
- Maximum: 10
- Max Size: 10 MB each
- Stored in Cloudinary

---

## Garage Images

- Minimum: 5
- Maximum: 10
- Exactly 1 Thumbnail
- Max Size: 10 MB each

---

## Garage Videos

- Minimum: 1
- Maximum: 2
- Max Size: 100 MB each
- Stored in Cloudinary

---

# Database Backup

```bash
pg_dump "DATABASE_URL" > backup.sql
```

---

# Customer Navigation

```text
Landing
│
├── Login
├── Signup
├── Verify OTP
├── Forgot Password
├── Reset Password
│
└── Dashboard
     │
     ├── Nearby Garages
     ├── Garage Details
     │      │
     │      ├── Book Service
     │      └── Payment
     │             │
     │             └── Booking Success
     │
     ├── Booking History
     │      └── Booking Details
     │
     ├── My Vehicles
     ├── Saved Locations
     ├── Profile
     ├── Reviews
     ├── Complaints
     └── Settings
```

---

# Customer Flow

```text
Landing
    │
Signup/Login
    │
OTP Verification
    │
JWT Login
    │
First-Time Onboarding
    │
├── Add Vehicle
├── Save GPS
└── Save Address
    │
Dashboard
    │
Nearby Garages
    │
Garage Details
    │
Select
├── Vehicle
├── Service
├── Slot
└── Note
    │
Booking Created
(PENDING_PAYMENT)
    │
₹99 Razorpay Payment
    │
Payment Verified
    │
Booking Confirmed
    │
Booking Success
    │
Vehicle Service
    │
Booking History
    │
Completed Booking
    │
├── Review
└── Complaint
```

---

# Customer Features Completed

- Authentication
- Email OTP Verification
- Forgot Password
- Reset Password
- JWT Authentication
- Customer Onboarding
- Profile Management
- Vehicle Management
- Saved Locations
- Nearby Garage Discovery
- Garage Details
- Garage Images & Videos
- Booking
- Booking Cancellation
- Razorpay Payment
- Booking History
- Reviews
- Complaints
- Cloudinary Integration

---

# Future Improvements

## Security

- Refresh Tokens
- OTP Attempt Limit
- OTP Cooldown
- Login Rate Limiting
- Account Lockout

---

## Customer Experience

- Favorite Garages
- Push Notifications
- Booking Search
- Pagination
- Advanced Filters

---

## Payments

- Razorpay Webhooks
- Refund Management
- Final Garage Bill Payment
- COD Support
- Garage Wallet Settlement

---

## Performance

- Redis Cache
- Swagger Documentation
- Winston / Pino Logging
- Background Jobs

# user home
services only no garage
rovaulto coins(wallet)
similar fo garages as well(recharge)
SOS
-300-1000(30)-basic
-1000-5000(99)-standard
-5000-20000(249)-medium
-SOS(500-2000)(50)
-20000+(500)-advanced
