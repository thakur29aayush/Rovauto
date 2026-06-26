import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/hooks/useApp";

const getServicesText = (booking) => {
  return (
    booking.services
      ?.map((item) => item.service?.name)
      .filter(Boolean)
      .join(", ") || "Vehicle Service"
  );
};

const getGarageText = (booking) => {
  if (booking.garage?.name) return booking.garage.name;

  if (booking.status === "PENDING_PAYMENT") return "Payment pending";
  if (booking.status === "SEARCHING_GARAGE") return "Finding nearby garage";

  return "Garage not assigned yet";
};

const getAmount = (booking) => {
  return (
    booking.totalServiceAmount ||
    booking.payment?.amount ||
    booking.payableAmount ||
    0
  );
};

const formatStatus = (status) => {
  return status?.replaceAll("_", " ") || "UNKNOWN";
};

export default function ActiveBookings() {
  const { fetchActiveBookings } = useApp();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadBookings = async ({ force = false } = {}) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);

      setError("");

      const data = await fetchActiveBookings({ force });
      setBookings(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load active bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Active Bookings</h2>
        <div className="card-soft p-6 text-muted">
          Loading active bookings...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Active Bookings</h2>

        <button
          type="button"
          disabled={refreshing}
          onClick={() => loadBookings({ force: true })}
          className="btn-ghost text-sm disabled:opacity-50"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="card-soft p-5 flex flex-wrap items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted">#{booking.bookingCode}</div>

              <div className="font-semibold">{getServicesText(booking)}</div>

              <div className="text-sm text-muted">{getGarageText(booking)}</div>
            </div>

            <span className="chip-brand">{formatStatus(booking.status)}</span>

            <div className="font-bold">₹{getAmount(booking)}</div>

            <Link
              to="/tracking"
              state={{ bookingId: booking.id }}
              className="btn-dark"
            >
              Track
            </Link>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="card-soft p-8 text-center text-muted">
            No active bookings right now.
          </div>
        )}
      </div>
    </div>
  );
}