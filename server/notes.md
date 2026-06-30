# Customer Backend Documentation

## Final Tech Stack

| Component          | Technology                           |
| ------------------ | ------------------------------------ |
| Backend            | Express.js + Node.js                 |
| Database           | PostgreSQL (Neon)                    |
| ORM                | Prisma ORM                           |
| Authentication     | JWT + Argon2                         |
| Email Verification | Resend OTP                           |
| Payments           | Cashfree                             |
| Media Storage      | Cloudinary                           |
| Maps               | GPS Coordinates + Distance Filtering |
| Password Security  | Argon2 Hashing                       |
| API Validation     | Express Validator                    |

---

# Customer Backend Modules

## 1. Authentication

* Signup
* Email OTP Verification
* Resend OTP
* Login (Email / Phone)
* Forgot Password
* Reset Password
* JWT Authentication

---

## 2. Customer Onboarding

* Add First Vehicle
* Save Default GPS Location
* Save Address
* Mark User as Onboarded

---

## 3. Customer Profile

* View Profile
* Update Profile
* Change Password
* Delete Account

---

## 4. Vehicles

* Add Vehicle
* Update Vehicle
* Delete Vehicle
* View Vehicles
* Set Default Vehicle

---

## 5. Saved Locations

* Add Location
* Update Location
* Delete Location
* View Saved Locations
* Set Default Location

---

## 6. Service Discovery

Customers browse services instead of garages.

* View All Service Categories
* View Services
* Service Images
* Service Videos
* Search Services

---

## 7. Service Media

Each service contains

* Thumbnail
* Gallery Images
* Videos

---

## 8. Booking

Customer selects

* Vehicle
* Multiple Services
* Current Location
* Customer Note

System automatically

* Calculates Platform Fee
* Creates Booking
* Waits for Payment
* Broadcasts Request to Nearby Garages
* Assigns First Accepting Garage

---

## 9. Garage Broadcasting

After payment

* Find Nearby Garages
* Filter Eligible Garages
* Broadcast Request
* First Garage Accept Wins
* Remaining Requests Expire Automatically

---

## 10. SOS

Emergency roadside assistance.

Customer

* Select Vehicle
* Current GPS
* Send SOS

Backend

* Broadcasts to Nearby Garages
* First Accepting Garage Gets Assigned
* ₹50 deducted from RovAuto Wallet only after garage accepts

Estimated service value

₹500 – ₹2000

---

## 11. RovAuto Wallet

Customer wallet

Supports

* Recharge
* Refunds
* Cashback
* Wallet Payment
* Wallet History
* Balance

Wallet is primarily used for

* Refunds
* Future Service Payments
* SOS Charges

---

## 12. Garage Wallet

Garage wallet supports

* Recharge
* Wallet Balance
* Transaction History

Platform automatically deducts acceptance fee when a booking is accepted.

---

## 13. Payments

Platform fee only.

Cashfree

* Create Order
* Verify Order Status

Platform Fee

| Estimated Bill   | Platform Fee |
| ---------------- | -----------: |
| ₹300 – ₹999      |          ₹30 |
| ₹1,000 – ₹4,999  |          ₹99 |
| ₹5,000 – ₹19,999 |         ₹249 |
| ₹20,000+         |         ₹500 |
| SOS              |          ₹50 |

Final garage payment happens offline.

---

## 14. Booking History

* Pending Payment
* Searching Garage
* Confirmed
* In Progress
* Completed
* Cancelled
* Expired

---

## 15. Reviews

* Create Review
* Edit Review
* Delete Review
* View Reviews

---

## 16. Complaints

* Create Complaint
* Upload Images
* Complaint History
* Complaint Tracking

---

# Media Upload Rules

## Complaint Images

* 1–10 Images
* Max 10 MB
* Cloudinary

---

## Service Images

* 1 Thumbnail
* Multiple Gallery Images
* Cloudinary

---

## Service Videos

* Multiple Videos
* Cloudinary

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
     ├── Services
     │      │
     │      ├── Service Details
     │      └── Add to Booking
     │
     ├── SOS
     │
     ├── Wallet
     │
     ├── Booking History
     │      └── Booking Details
     │
     ├── Vehicles
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
Signup / Login
    │
OTP Verification
    │
JWT Login
    │
First-Time Onboarding
    │
├── Vehicle
├── Location
└── Address
    │
Dashboard
    │
Browse Services
    │
Select
├── Vehicle
├── Multiple Services
├── Location
└── Note
    │
Booking Created
(PENDING_PAYMENT)
    │
Platform Fee Payment
(Cashfree)
    │
Payment Verified
    │
Broadcast To Nearby Garages
    │
Garage Accepts
    │
Booking Confirmed
    │
Garage Arrives
    │
Service Completed
    │
Review / Complaint
```

---

# Customer Features Completed

* Authentication
* Email OTP Verification
* Forgot Password
* Reset Password
* JWT Authentication
* Customer Onboarding
* Profile Management
* Vehicle Management
* Saved Locations
* Service Discovery
* Service Media
* Multi-Service Booking
* Dynamic Platform Fee
* Cashfree Integration
* Garage Broadcasting
* Automatic Garage Assignment
* SOS
* RovAuto Wallet
* Booking History
* Reviews
* Complaints
* Cloudinary Integration

---

# Future Improvements

## Customer Experience

* Favorite Services
* Push Notifications
* Live Garage Tracking
* Real-Time Garage ETA
* Booking Search
* Pagination
* Advanced Filters

---

## Payments

* Cashfree Webhooks
* Automatic Refunds
* Final Garage Bill Payment
* Partial Wallet Payment
* Coupon System

---

## Performance

* Redis Cache
* Swagger Documentation
* Winston / Pino Logging
* Background Jobs
* Socket.IO for Real-Time Broadcast
* Firebase Push Notifications


##COMMANDS
npm run db:delete-user -- --email=aayush@example.com --confirm
npm run db:delete-active-bookings -- --email=aayush@example.com --confirm
npm run db:delete-payments -- --email=aayush@example.com --confirm
npm run db:delete-service-history -- --email=aayush@example.com --confirm

npm run db:nuke-users -- --confirm --i-understand-delete-all-users (codebase)
npm --prefix server run db:nuke-users -- --confirm --i-understand-delete-all-users (server)

npm run db:nuke-users(Dry run)