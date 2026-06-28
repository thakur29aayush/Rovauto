import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/hooks/useApp";
import { isPaymentAuthError, payForBooking } from "@/utils/bookingPayment";

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
  const { user, fetchActiveBookings, clearBookingCaches } = useApp();
  const nav = useNavigate();
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payingId, setPayingId] = useState(null);
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

  const payBooking = async (booking) => {
    try {
      setPayingId(booking.id);
      setError("");

      const verifiedBooking = await payForBooking({ booking, user });

      clearBookingCaches?.();
      await loadBookings({ force: true });
      nav("/tracking", {
        state: {
          bookingId: verifiedBooking.id,
          bookingCode: verifiedBooking.bookingCode,
        },
      });
    } catch (err) {
      if (isPaymentAuthError(err)) {
        nav("/login", {
          state: {
            from: location,
            message: "Please login to continue payment.",
          },
        });
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not complete payment. Please try again."
      );
    } finally {
      setPayingId(null);
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold">Active Bookings</h2>
        <div className="card-soft p-6 text-muted">
          Loading active bookings...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
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
        {bookings.map((booking) => {
          const isPendingPayment = booking.status === "PENDING_PAYMENT";

          return (
            <div
              key={booking.id}
              className="card-soft flex flex-wrap items-center gap-4 p-5"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted">#{booking.bookingCode}</div>

                <div className="font-semibold">{getServicesText(booking)}</div>

                <div className="text-sm text-muted">{getGarageText(booking)}</div>
              </div>

              <span className="chip-brand">{formatStatus(booking.status)}</span>

              <div className="font-bold">Rs. {getAmount(booking)}</div>

              {isPendingPayment ? (
                <>
                  <button
                    type="button"
                    onClick={() => payBooking(booking)}
                    disabled={payingId === booking.id}
                    className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {payingId === booking.id ? "Processing..." : "Pay Now"}
                  </button>
                  <button
                    type="button"
                    disabled
                    className="btn-dark cursor-not-allowed opacity-50"
                    title="Complete payment to enable tracking"
                  >
                    Track
                  </button>
                </>
              ) : (
                <Link
                  to="/tracking"
                  state={{ bookingId: booking.id }}
                  className="btn-dark"
                >
                  Track
                </Link>
              )}
            </div>
          );
        })}

        {bookings.length === 0 && (
          <div className="card-soft p-8 text-center text-muted">
            No active bookings right now.
          </div>
        )}
      </div>
    </div>
  );
}
