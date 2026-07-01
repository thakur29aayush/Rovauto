import { useEffect, useState } from "react";
import { FiCalendar, FiDollarSign, FiHome, FiUsers } from "react-icons/fi";
import { adminApi } from "@/api/admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    garages: 0,
    activeGarages: 0,
    pendingApplications: 0,
    priceRanges: 0,
    customers: 0,
    bookings: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const [garages, pendingApplications, priceRanges, customers, bookings] = await Promise.all([
          adminApi.getGarages(),
          adminApi.getApplications("PENDING"),
          adminApi.getPriceRanges(),
          adminApi.getCustomers(),
          adminApi.getBookings(),
        ]);

        setStats({
          garages: garages.length,
          activeGarages: garages.filter((garage) => garage.isActive).length,
          pendingApplications: pendingApplications.length,
          priceRanges: priceRanges.length,
          customers: customers.length,
          bookings: bookings.length,
        });
        setRecentApplications(pendingApplications.slice(0, 5));
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load admin dashboard");
      }
    };

    load();
  }, []);

  const cards = [
    { icon: FiHome, n: stats.garages, l: "Total Garages", c: `${stats.activeGarages} active` },
    { icon: FiCalendar, n: stats.pendingApplications, l: "Pending Applications", c: "Needs review" },
    { icon: FiDollarSign, n: stats.priceRanges, l: "Price Ranges", c: "Configured" },
    { icon: FiUsers, n: stats.customers, l: "Customers", c: `${stats.bookings} bookings` },
  ];

  return (
    <div className="grid gap-6">
      {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((s) => (
          <div key={s.l} className="card-soft p-5">
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand"><s.icon /></div>
              <span className="chip-brand">{s.c}</span>
            </div>
            <div className="text-2xl font-bold mt-3">{s.n}</div>
            <div className="text-sm text-muted">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="card-soft overflow-hidden">
        <div className="border-b border-line p-5">
          <h3 className="font-semibold">Pending Garage Applications</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-bg-soft text-left">
            <tr>{["Garage", "Owner", "City", "Phone", "Created"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {recentApplications.length ? recentApplications.map((application) => (
              <tr key={application.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium">{application.garageName}</td>
                <td className="px-4 py-3">{application.ownerName}</td>
                <td className="px-4 py-3">{application.city}</td>
                <td className="px-4 py-3">{application.phone}</td>
                <td className="px-4 py-3">{new Date(application.createdAt).toLocaleDateString()}</td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="px-4 py-5 text-muted">No pending applications.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
