import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "@/hooks/useApp";
import { hasSavedUserLocation } from "@/utils/signupLocation";
import MainLayout from "@/layouts/MainLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

function ProtectedRoute({ children }) {
  const { user, garage } = useApp();
  const location = useLocation();
  const isGarageRoute = location.pathname.startsWith("/garage");
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    if (user?.role !== "ADMIN") {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
  } else if (isGarageRoute) {
    if (!garage) {
      return <Navigate to="/garage/login" state={{ from: location }} replace />;
    }
  } else {
    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }
  return children;
}

function AddressCheck({ children }) {
  const { user, location } = useApp();

  if (user?.role === "CUSTOMER" && !hasSavedUserLocation(user) && !location?.address) {
    return <Navigate to="/booking/address" replace />;
  }

  return children;
}

function VehicleCheck({ children }) {
  const { user, vehicles } = useApp();
  const vehicleList = Array.isArray(vehicles) ? vehicles : [];

  if (user?.role === "CUSTOMER" && vehicleList.length === 0) {
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
const AddressForm = lazy(() => import("@/pages/booking/AddressForm"));
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
const GarageLogin = lazy(() => import("@/pages/garage/auth/Login"));
const GarageOtpLogin = lazy(() => import("@/pages/garage/auth/OtpLogin"));
const GarageForgotPassword = lazy(() => import("@/pages/garage/auth/ForgotPassword"));
const GarageOnboarding = lazy(() => import("@/pages/garage/Onboarding"));
const GarageServices = lazy(() => import("@/pages/garage/Services"));
const GarageBookings = lazy(() => import("@/pages/garage/Bookings"));
const GarageBookingDetail = lazy(() => import("@/pages/garage/BookingDetail"));
const GarageProfile = lazy(() => import("@/pages/garage/Profile"));
const GarageSettings = lazy(() => import("@/pages/garage/Settings"));
const GarageWallet = lazy(() => import("@/pages/garage/Wallet"));
const MagicLink = lazy(() => import("@/pages/garage/MagicLink"));

const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminLogin = lazy(() => import("@/pages/admin/Login"));
const AdminCustomers = lazy(() => import("@/pages/admin/Customers"));
const AdminGarages = lazy(() => import("@/pages/admin/Garages"));
const AdminBookings = lazy(() => import("@/pages/admin/Bookings"));
const AdminRevenue = lazy(() => import("@/pages/admin/Revenue"));
const AdminNotifications = lazy(() => import("@/pages/admin/Notifications"));

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
  { to: "/garage/bookings", label: "Bookings", icon: FiCalendar },
  { to: "/garage/services", label: "Services", icon: FiInbox },
  { to: "/garage/wallet", label: "Wallet", icon: FiCreditCard },
  { to: "/garage/profile", label: "Profile", icon: FiUser },
  { to: "/garage/settings", label: "Settings", icon: FiSettings },
];

const adminItems = [
  { to: "/admin", label: "Dashboard", icon: FiGrid },
  { to: "/admin/garages", label: "Garages", icon: FiHome },
  { to: "/admin/revenue", label: "Price Ranges", icon: FiDollarSign },
  { to: "/admin/customers", label: "Customers", icon: FiUsers },
  { to: "/admin/bookings", label: "Bookings", icon: FiCalendar },
  { to: "/admin/notifications", label: "Notifications", icon: FiBell },
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
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/garage/login" element={<GarageLogin />} />
          <Route path="/garage/otp-login" element={<GarageOtpLogin />} />
          <Route path="/garage/forgot-password" element={<GarageForgotPassword />} />
          <Route path="/garage/onboarding" element={<GarageOnboarding />} />
          <Route path="/garage/magic/:id" element={<MagicLink />} />

          <Route path="/booking/address" element={<ProtectedRoute><AddressForm /></ProtectedRoute>} />
          <Route path="/booking/vehicle" element={<ProtectedRoute><AddressCheck><VehicleSelect /></AddressCheck></ProtectedRoute>} />
          <Route path="/booking/services" element={<ProtectedRoute><AddressCheck><VehicleCheck><ServiceSelect /></VehicleCheck></AddressCheck></ProtectedRoute>} />
          <Route path="/booking/garage" element={<ProtectedRoute><AddressCheck><VehicleCheck><GarageSelect /></VehicleCheck></AddressCheck></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><AddressCheck><VehicleCheck><Checkout /></VehicleCheck></AddressCheck></ProtectedRoute>} />
          <Route path="/tracking" element={<ProtectedRoute><AddressCheck><VehicleCheck><Tracking /></VehicleCheck></AddressCheck></ProtectedRoute>} />

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
          <Route path="/garage/bookings" element={<ProtectedRoute><GarageBookings /></ProtectedRoute>} />
          <Route path="/garage/bookings/:id" element={<ProtectedRoute><GarageBookingDetail /></ProtectedRoute>} />
          <Route path="/garage/services" element={<ProtectedRoute><GarageServices /></ProtectedRoute>} />
          <Route path="/garage/wallet" element={<ProtectedRoute><GarageWallet /></ProtectedRoute>} />
          <Route path="/garage/profile" element={<ProtectedRoute><GarageProfile /></ProtectedRoute>} />
          <Route path="/garage/settings" element={<ProtectedRoute><GarageSettings /></ProtectedRoute>} />
        </Route>

        <Route element={<DashboardLayout items={adminItems} title="Admin Console" />}>
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
          <Route path="/admin/garages" element={<ProtectedRoute><AdminGarages /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/revenue" element={<ProtectedRoute><AdminRevenue /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute><AdminNotifications /></ProtectedRoute>} />
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
