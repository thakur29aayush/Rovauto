import { useEffect, useState } from "react";
import { adminApi } from "@/api/admin";
import { FiRefreshCw } from "react-icons/fi";

const getCity = (customer) => {
  const address = customer.locations?.[0]?.address || customer.customerProfile?.address || "";
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 2] : address || "-";
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({ search: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
      setCustomers(await adminApi.getCustomers(params));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load customers");
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
        <h2 className="text-2xl font-bold">Customers</h2>
        <p className="text-muted">Search and inspect registered customer accounts.</p>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

      <div className="flex flex-wrap gap-2">
        <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Search name, email, phone" className="rounded-xl border border-line px-4 py-2 outline-none focus:border-ink" />
        <input value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} placeholder="City" className="rounded-xl border border-line px-4 py-2 outline-none focus:border-ink" />
        <button onClick={load} className="btn-ghost !py-2"><FiRefreshCw /> Refresh</button>
      </div>

      <div className="card-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-soft text-left">
            <tr>{["Name", "Email", "Phone", "City", "Bookings", "Vehicles", "Status"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="px-4 py-5 text-muted">Loading customers...</td></tr>
            ) : customers.length ? customers.map((customer) => (
              <tr key={customer.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium">{customer.name}</td>
                <td className="px-4 py-3">{customer.email}</td>
                <td className="px-4 py-3">{customer.phone || "-"}</td>
                <td className="px-4 py-3">{getCity(customer)}</td>
                <td className="px-4 py-3">{customer._count?.bookings || 0}</td>
                <td className="px-4 py-3">{customer._count?.vehicles || 0}</td>
                <td className="px-4 py-3"><span className={customer.isActive ? "chip-brand" : "chip"}>{customer.isActive ? "Active" : "Disabled"}</span></td>
              </tr>
            )) : (
              <tr><td colSpan="7" className="px-4 py-5 text-muted">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
