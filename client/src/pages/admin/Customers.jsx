import { useEffect, useState } from "react";
import { adminApi } from "@/api/admin";
import { FiRefreshCw } from "react-icons/fi";

const getCity = (customer) => {
  const address =
    customer.locations?.[0]?.address || customer.customerProfile?.address || "";

  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

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
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value)
      );

      const data = await adminApi.getCustomers(params);
      setCustomers(data || []);
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
    <div className="w-full max-w-full overflow-x-hidden space-y-5">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">Customers</h2>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Search and inspect registered customer accounts.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex w-full max-w-full flex-col gap-2 sm:flex-row">
        <input
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value })
          }
          placeholder="Search name, email, phone"
          className="min-w-0 flex-1 rounded-xl border border-line px-4 py-2 outline-none focus:border-ink"
        />

        <input
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          placeholder="City"
          className="min-w-0 rounded-xl border border-line px-4 py-2 outline-none focus:border-ink sm:w-48"
        />

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="btn-ghost justify-center !py-2"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="card-soft w-full max-w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[850px] w-full text-sm">
            <thead className="bg-bg-soft text-left">
              <tr>
                {[
                  "Name",
                  "Email",
                  "Phone",
                  "City",
                  "Bookings",
                  "Vehicles",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-4 py-3 font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-5 text-muted">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length ? (
                customers.map((customer) => (
                  <tr key={customer.id} className="border-t border-line">
                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                      {customer.name || "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {customer.email || "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {customer.phone || "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {getCity(customer)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {customer._count?.bookings || 0}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {customer._count?.vehicles || 0}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={customer.isActive ? "chip-brand" : "chip"}>
                        {customer.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-5 text-muted">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}