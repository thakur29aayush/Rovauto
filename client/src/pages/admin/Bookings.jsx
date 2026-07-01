import { useEffect, useState } from "react";
import { adminApi } from "@/api/admin";
import { FiRefreshCw } from "react-icons/fi";

const statuses = ["", "PENDING_PAYMENT", "SEARCHING_GARAGE", "GARAGE_ASSIGNED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "EXPIRED"];

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
      setBookings(await adminApi.getBookings(params));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bookings</h2>
        <p className="text-muted">Inspect bookings across customers and garages.</p>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

      <div className="flex flex-wrap gap-2">
        <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Search booking, customer, garage" className="rounded-xl border border-line px-4 py-2 outline-none focus:border-ink" />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-xl border border-line px-4 py-2 outline-none focus:border-ink">
          {statuses.map((status) => <option key={status || "all"} value={status}>{status ? status.replaceAll("_", " ") : "All statuses"}</option>)}
        </select>
        <button onClick={load} className="btn-ghost !py-2"><FiRefreshCw /> Refresh</button>
      </div>

      <div className="card-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-soft text-left">
            <tr>{["Booking", "Customer", "Garage", "Vehicle", "Status", "Amount", "Created"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="px-4 py-5 text-muted">Loading bookings...</td></tr>
            ) : bookings.length ? bookings.map((booking) => (
              <tr key={booking.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium">#{booking.bookingCode || booking.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{booking.user?.name || "-"}</td>
                <td className="px-4 py-3">{booking.garage?.name || "Unassigned"}</td>
                <td className="px-4 py-3">{booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : "-"}</td>
                <td className="px-4 py-3"><span className="chip-brand">{booking.status.replaceAll("_", " ")}</span></td>
                <td className="px-4 py-3">Rs. {Number(booking.payableAmount || booking.payment?.amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3">{new Date(booking.createdAt).toLocaleDateString()}</td>
              </tr>
            )) : (
              <tr><td colSpan="7" className="px-4 py-5 text-muted">No bookings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
