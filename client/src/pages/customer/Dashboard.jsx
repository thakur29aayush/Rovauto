import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useApp } from "@/hooks/useApp";
import {
  FiTruck,
  FiCalendar,
  FiShield,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiRefreshCcw,
} from "react-icons/fi";

export default function Dashboard() {
  const { user, vehicle, vehicles, fetchDashboard } = useApp();

  const [bookings, setBookings] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const activeBookings = bookings.filter((booking) =>
    [
      "PENDING_PAYMENT",
      "SEARCHING_GARAGE",
      "GARAGE_ASSIGNED",
      "CONFIRMED",
      "IN_PROGRESS",
    ].includes(booking.status)
  );

  const activeBooking = activeBookings[0];

  const loadDashboard = async ({ force = false } = {}) => {
    try {
      setLoading(true);

      const dashboard = await fetchDashboard({ force });

      setBookings(dashboard?.activeBookings || []);
      setWallet(dashboard?.wallet || null);
      setCompletedCount(dashboard?.completedBookingsCount || 0);
    } catch (error) {
      console.error("Dashboard load failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="card-soft p-6">
        <p className="text-muted">Loading dashboard...</p>
      </div>
    );
  }

  const heroButton =
    "btn-primary px-8 py-3 !text-black hover:!text-black active:!text-black visited:!text-black focus:!text-black";

  return (
    <div className="grid gap-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink to-ink-2 p-8 text-white">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">
              Hello {user?.name || "there"} 👋
            </h2>

            <p className="mt-2 text-white/70">
              Manage bookings, wallet, vehicles, and service requests.
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => loadDashboard({ force: true })}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiRefreshCcw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-3">
          <Link to="/booking/vehicle" className={heroButton}>
            Book a service
          </Link>

          <Link to="/sos" className={heroButton}>
            SOS
          </Link>

          <Link to="/dashboard/payments" className={heroButton}>
            Wallet: ₹{wallet?.balance || 0}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: FiCalendar,
            label: "Active Bookings",
            number: activeBookings.length,
            sub: "Current service requests",
          },
          {
            icon: FiClock,
            label: "Completed",
            number: completedCount,
            sub: "Completed services",
          },
          {
            icon: FiShield,
            label: "Wallet Coins",
            number: wallet?.balance || 0,
            sub: "RovAuto wallet balance",
          },
          {
            icon: FiTruck,
            label: "Vehicles",
            number: vehicles?.length || 0,
            sub: vehicle ? `${vehicle.brand} ${vehicle.model}` : "Add a vehicle",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="card-soft p-5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-black">
                <Icon />
              </div>

              <div className="mt-3 text-3xl font-bold">{item.number}</div>
              <div className="text-sm">{item.label}</div>
              <div className="mt-1 text-xs text-muted">{item.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card-soft p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Active service</h3>

            {activeBooking && (
              <Link
                to="/tracking"
                state={{ bookingId: activeBooking.id }}
                className="text-sm font-medium text-ink"
              >
                Track <FiArrowRight className="inline" />
              </Link>
            )}
          </div>

          {activeBooking ? (
            <>
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-black">
                  <FiTruck className="text-xl" />
                </span>

                <div className="flex-1">
                  <div className="font-semibold">
                    {activeBooking.services
                      ?.map((item) => item.service?.name)
                      .filter(Boolean)
                      .join(", ") || "Vehicle Service"}
                  </div>

                  <div className="text-xs text-muted">
                    {activeBooking.vehicle?.brand} {activeBooking.vehicle?.model}
                    {activeBooking.garage
                      ? ` · ${activeBooking.garage.name}`
                      : " · Waiting for garage"}
                  </div>
                </div>

                <span className="chip-brand">
                  {activeBooking.status?.replaceAll("_", " ")}
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-bg-soft">
                <div
                  className="h-full bg-brand"
                  style={{
                    width:
                      activeBooking.status === "PENDING_PAYMENT"
                        ? "20%"
                        : activeBooking.status === "SEARCHING_GARAGE"
                        ? "40%"
                        : activeBooking.status === "GARAGE_ASSIGNED"
                        ? "55%"
                        : activeBooking.status === "CONFIRMED"
                        ? "65%"
                        : activeBooking.status === "IN_PROGRESS"
                        ? "80%"
                        : "100%",
                  }}
                />
              </div>
            </>
          ) : (
            <div className="text-sm text-muted">
              No active service right now. Civilization briefly holds.
            </div>
          )}
        </div>

        <div className="card-soft p-6">
          <h3 className="mb-3 font-semibold">Quick Actions</h3>

          <ul className="grid gap-3 text-sm">
            {[
              [
                "Book Service",
                "Choose services and request nearby garages",
                "/booking/vehicle",
              ],
              ["SOS", "Emergency roadside request", "/sos"],
              ["My Vehicles", "Manage your saved vehicles", "/dashboard/vehicles"],
            ].map(([name, desc, to]) => (
              <li key={name}>
                <Link to={to} className="flex items-start gap-3 hover:text-ink">
                  <FiCheckCircle className="mt-0.5 text-brand-dark" />

                  <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-xs text-muted">{desc}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}