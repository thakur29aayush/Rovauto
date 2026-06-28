import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "@/hooks/useApp";
import MainLayout from "@/layouts/MainLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

function ProtectedRoute({ children }) {
  const { user } = useApp();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function VehicleCheck({ children }) {
  const { user, vehicles } = useApp();

  if (user?.role === "CUSTOMER" && vehicles.length === 0) {
    return <Navigate to="/booking/vehicle" replace />;
  }

  return children;
}

const Home = lazy(() => import("@/pages/Home"));
const Services = lazy(() => import("@/pages/Services"));
const CategoryDetail = lazy(() => import("@/pages/CategoryDetail"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const About = lazy(() => import("@/pages/About"));
const Partner = lazy(() => import("@/pages/Partner"));
const Contact = lazy(() => import("@/pages/Contact"));
const Warranty = lazy(() => import("@/pages/Warranty"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const SOSPanicScreen = lazy(() => import("@/pages/sos/SOSPanicScreen"));
const SOSLocationScreen = lazy(() => import("@/pages/sos/SOSLocationScreen"));
const SOSCheckoutScreen = lazy(() => import("@/pages/sos/SOSCheckoutScreen"));
const SOSSuccessScreen = lazy(() => import("@/pages/sos/SOSSuccessScreen"));

const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const OTP = lazy(() => import("@/pages/auth/OTP"));
const Forgot = lazy(() => import("@/pages/auth/Forgot"));

const VehicleSelect = lazy(() => import("@/pages/booking/VehicleSelect"));
const ServiceSelect = lazy(() => import("@/pages/booking/ServiceSelect"));
const GarageSelect = lazy(() => import("@/pages/booking/GarageSelect"));
const Checkout = lazy(() => import("@/pages/booking/Checkout"));
const Tracking = lazy(() => import("@/pages/booking/Tracking"));

const CustomerDashboard = lazy(() => import("@/pages/customer/Dashboard"));
const MyVehicles = lazy(() => import("@/pages/customer/MyVehicles"));
const ActiveBookings = lazy(() => import("@/pages/customer/ActiveBookings"));
const ServiceHistory = lazy(() => import("@/pages/customer/ServiceHistory"));
const Profile = lazy(() => import("@/pages/customer/Profile"));
const Payments = lazy(() => import("@/pages/customer/Payments"));
const Notifications = lazy(() => import("@/pages/customer/Notifications"));

const GarageDashboard = lazy(() => import("@/pages/garage/Dashboard"));
const GarageLeads = lazy(() => import("@/pages/garage/Leads"));
const GarageWallet = lazy(() => import("@/pages/garage/Wallet"));
const GarageJobs = lazy(() => import("@/pages/garage/Jobs"));
const GarageEarnings = lazy(() => import("@/pages/garage/Earnings"));
const MagicLink = lazy(() => import("@/pages/garage/MagicLink"));

const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminCustomers = lazy(() => import("@/pages/admin/Customers"));
const AdminGarages = lazy(() => import("@/pages/admin/Garages"));
const AdminBookings = lazy(() => import("@/pages/admin/Bookings"));
const AdminRevenue = lazy(() => import("@/pages/admin/Revenue"));

import { FiGrid, FiTruck, FiPlusCircle, FiCalendar, FiClock, FiShield, FiCreditCard, FiBell, FiUser,
  FiInbox, FiBriefcase, FiTrendingUp, FiStar, FiUsers, FiSettings, FiDollarSign, FiHome } from "react-icons/fi";

const customerItems = [
  { to: "/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/dashboard/vehicles", label: "My Vehicles", icon: FiTruck },
  { to: "/booking/vehicle", label: "Book Service", icon: FiPlusCircle },
  { to: "/dashboard/bookings", label: "Active Bookings", icon: FiCalendar },
  { to: "/dashboard/history", label: "Service History", icon: FiClock },
  { to: "/warranty", label: "Warranty Center", icon: FiShield },
  { to: "/dashboard/payments", label: "Payments", icon: FiCreditCard },
  { to: "/dashboard/notifications", label: "Notifications", icon: FiBell },
  { to: "/dashboard/profile", label: "Profile", icon: FiUser },
];

const garageItems = [
  { to: "/garage", label: "Dashboard", icon: FiGrid },
  { to: "/garage/leads", label: "Leads", icon: FiInbox },
  { to: "/garage/jobs", label: "Active Jobs", icon: FiBriefcase },
  { to: "/garage/wallet", label: "Wallet", icon: FiCreditCard },
  { to: "/garage/earnings", label: "Earnings", icon: FiTrendingUp },
];

const adminItems = [
  { to: "/admin", label: "Dashboard", icon: FiGrid },
  { to: "/admin/customers", label: "Customers", icon: FiUsers },
  { to: "/admin/garages", label: "Garages", icon: FiHome },
  { to: "/admin/bookings", label: "Bookings", icon: FiCalendar },
  { to: "/admin/revenue", label: "Revenue", icon: FiDollarSign },
];

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/sos" element={<SOSPanicScreen />} />
        <Route path="/sos/location" element={<SOSLocationScreen />} />
        <Route path="/sos/checkout" element={<SOSCheckoutScreen />} />
        <Route path="/sos/success" element={<SOSSuccessScreen />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:categoryId" element={<CategoryDetail />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/warranty" element={<Warranty />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/forgot" element={<Forgot />} />

          <Route path="/booking/vehicle" element={<ProtectedRoute><VehicleSelect /></ProtectedRoute>} />
          <Route path="/booking/services" element={<ProtectedRoute><VehicleCheck><ServiceSelect /></VehicleCheck></ProtectedRoute>} />
          <Route path="/booking/garage" element={<ProtectedRoute><VehicleCheck><GarageSelect /></VehicleCheck></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><VehicleCheck><Checkout /></VehicleCheck></ProtectedRoute>} />
          <Route path="/tracking" element={<ProtectedRoute><VehicleCheck><Tracking /></VehicleCheck></ProtectedRoute>} />

          <Route path="/garage/magic/:id" element={<MagicLink />} />
        </Route>

        <Route element={<DashboardLayout items={customerItems} title="Customer Portal" />}>
          <Route path="/dashboard" element={<ProtectedRoute><VehicleCheck><CustomerDashboard /></VehicleCheck></ProtectedRoute>} />
          <Route path="/dashboard/vehicles" element={<ProtectedRoute><MyVehicles /></ProtectedRoute>} />
          <Route path="/dashboard/bookings" element={<ProtectedRoute><VehicleCheck><ActiveBookings /></VehicleCheck></ProtectedRoute>} />
          <Route path="/dashboard/history" element={<ProtectedRoute><VehicleCheck><ServiceHistory /></VehicleCheck></ProtectedRoute>} />
          <Route path="/dashboard/payments" element={<ProtectedRoute><VehicleCheck><Payments /></VehicleCheck></ProtectedRoute>} />
          <Route path="/dashboard/notifications" element={<ProtectedRoute><VehicleCheck><Notifications /></VehicleCheck></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><VehicleCheck><Profile /></VehicleCheck></ProtectedRoute>} />
        </Route>

        <Route element={<DashboardLayout items={garageItems} title="Garage Portal" />}>
          <Route path="/garage" element={<ProtectedRoute><GarageDashboard /></ProtectedRoute>} />
          <Route path="/garage/leads" element={<ProtectedRoute><GarageLeads /></ProtectedRoute>} />
          <Route path="/garage/jobs" element={<ProtectedRoute><GarageJobs /></ProtectedRoute>} />
          <Route path="/garage/wallet" element={<ProtectedRoute><GarageWallet /></ProtectedRoute>} />
          <Route path="/garage/earnings" element={<ProtectedRoute><GarageEarnings /></ProtectedRoute>} />
        </Route>

        <Route element={<DashboardLayout items={adminItems} title="Admin Console" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/garages" element={<AdminGarages />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/revenue" element={<AdminRevenue />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function RouteFallback() {
  return (
    <div className="container-x py-12">
      <div className="card-soft p-6 text-muted">Loading...</div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
