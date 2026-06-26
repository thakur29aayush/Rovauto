import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useApp } from "@/hooks/useApp";
import api from "@/api/axios";
import {
  FiTruck,
  FiCalendar,
  FiShield,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

export default function Dashboard() {
  const { user, vehicle, vehicles, fetchMe } = useApp();

  const [bookings, setBookings] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  const activeBookings = bookings.filter((b) =>
    ["PENDING_PAYMENT", "SEARCHING_GARAGE", "CONFIRMED", "IN_PROGRESS"].includes(
      b.status
    )
  );

  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const activeBooking = activeBookings[0];

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        await fetchMe();

        const [bookingRes, walletRes] = await Promise.all([
          api.get("/bookings"),
          api.get("/wallet"),
        ]);

        setBookings(bookingRes.data.data || []);
        setWallet(walletRes.data.data || null);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

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
    "inline-flex items-center justify-center rounded-full bg-brand px-8 py-3 text-sm font-bold text-ink shadow-lg shadow-brand/25 transition hover:scale-[1.02] hover:bg-brand-dark";

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl bg-gradient-to-br from-ink to-ink-2 text-white p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />

        <h2 className="text-3xl font-bold">
          Hello {user?.name || "there"} 👋
        </h2>

        <p className="text-white/70 mt-2">
          Manage bookings, wallet, vehicles, and service requests.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: FiCalendar,
            l: "Active Bookings",
            n: activeBookings.length,
            sub: "Current service requests",
          },
          {
            icon: FiClock,
            l: "Completed",
            n: completedBookings.length,
            sub: "Completed services",
          },
          {
            icon: FiShield,
            l: "Wallet Coins",
            n: wallet?.balance || 0,
            sub: "RovAuto wallet balance",
          },
          {
            icon: FiTruck,
            l: "Vehicles",
            n: vehicles?.length || 0,
            sub: vehicle ? `${vehicle.brand} ${vehicle.model}` : "Add a vehicle",
          },
        ].map((s) => (
          <div key={s.l} className="card-soft p-5">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-brand">
              <s.icon />
            </div>

            <div className="text-3xl font-bold mt-3">{s.n}</div>
            <div className="text-sm">{s.l}</div>
            <div className="text-xs text-muted mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card-soft p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Active service</h3>

            {activeBooking && (
              <Link to="/tracking" className="text-sm text-ink font-medium">
                Track <FiArrowRight className="inline" />
              </Link>
            )}
          </div>

          {activeBooking ? (
            <>
              <div className="flex items-center gap-4">
                <span className="grid place-items-center h-14 w-14 rounded-2xl bg-brand">
                  <FiTruck className="text-xl" />
                </span>

                <div className="flex-1">
                  <div className="font-semibold">
                    {activeBooking.services
                      ?.map((s) => s.service?.name)
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
                  {activeBooking.status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="mt-4 h-2 bg-bg-soft rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand"
                  style={{
                    width:
                      activeBooking.status === "PENDING_PAYMENT"
                        ? "20%"
                        : activeBooking.status === "SEARCHING_GARAGE"
                        ? "40%"
                        : activeBooking.status === "CONFIRMED"
                        ? "60%"
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
          <h3 className="font-semibold mb-3">Quick Actions</h3>

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
                  <FiCheckCircle className="text-brand-dark mt-0.5" />

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