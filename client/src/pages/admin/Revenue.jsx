import { useEffect, useState } from "react";
import { adminApi } from "@/api/admin";
import { FiEdit3, FiRefreshCw, FiTrash2 } from "react-icons/fi";

const fuelTypes = ["", "PETROL", "DIESEL", "ELECTRIC", "HYBRID", "CNG", "OTHER"];

const emptyForm = {
  id: "",
  city: "",
  serviceId: "",
  vehicleBrand: "",
  vehicleModel: "",
  fuelType: "",
  minPrice: "",
  maxPrice: "",
  isActive: true,
};

export default function Revenue() {
  const [ranges, setRanges] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filterCity, setFilterCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [rangeList, serviceList] = await Promise.all([
        adminApi.getPriceRanges(filterCity ? { city: filterCity } : {}),
        adminApi.getAssignableServices(),
      ]);
      setRanges(rangeList || []);
      setServices(serviceList || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load price ranges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      city: form.city,
      serviceId: form.serviceId,
      vehicleBrand: form.vehicleBrand || null,
      vehicleModel: form.vehicleModel || null,
      fuelType: form.fuelType || null,
      minPrice: Number(form.minPrice),
      maxPrice: Number(form.maxPrice),
      isActive: form.isActive,
    };

    try {
      if (form.id) {
        await adminApi.updatePriceRange(form.id, payload);
        setSuccess("Price range updated.");
      } else {
        await adminApi.createPriceRange(payload);
        setSuccess("Price range created.");
      }
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save price range");
    }
  };

  const editRange = (range) => {
    setForm({
      id: range.id,
      city: range.city || "",
      serviceId: range.serviceId || "",
      vehicleBrand: range.vehicleBrand || "",
      vehicleModel: range.vehicleModel || "",
      fuelType: range.fuelType || "",
      minPrice: range.minPrice || "",
      maxPrice: range.maxPrice || "",
      isActive: Boolean(range.isActive),
    });
  };

  const deleteRange = async (range) => {
    setError("");
    setSuccess("");
    try {
      await adminApi.deletePriceRange(range.id);
      setSuccess("Price range deleted.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete price range");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Price Ranges</h2>
        <p className="text-muted">Manage city and vehicle-specific service estimate ranges.</p>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
      {success && <div className="rounded-xl bg-green-50 p-4 text-green-700">{success}</div>}

      <form onSubmit={submit} className="card-soft grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
        <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink" />
        <select required value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink">
          <option value="">Select service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>{service.category?.name ? `${service.category.name} - ` : ""}{service.name}</option>
          ))}
        </select>
        <input value={form.vehicleBrand} onChange={(e) => setForm({ ...form, vehicleBrand: e.target.value })} placeholder="Vehicle brand optional" className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink" />
        <input value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} placeholder="Vehicle model optional" className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink" />
        <select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink">
          {fuelTypes.map((fuelType) => <option key={fuelType || "any"} value={fuelType}>{fuelType || "Any fuel"}</option>)}
        </select>
        <input required type="number" min="0" value={form.minPrice} onChange={(e) => setForm({ ...form, minPrice: e.target.value })} placeholder="Min price" className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink" />
        <input required type="number" min="0" value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })} placeholder="Max price" className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink" />
        <div className="flex gap-2">
          <button className="btn-primary flex-1">{form.id ? "Update" : "Create"}</button>
          {form.id && <button type="button" onClick={() => setForm(emptyForm)} className="btn-ghost">Cancel</button>}
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <input value={filterCity} onChange={(e) => setFilterCity(e.target.value)} placeholder="Filter by city" className="rounded-xl border border-line px-4 py-2 outline-none focus:border-ink" />
        <button onClick={load} className="btn-ghost !py-2"><FiRefreshCw /> Refresh</button>
      </div>

      <div className="card-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-soft text-left">
            <tr>{["City", "Service", "Vehicle", "Fuel", "Range", "Status", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="px-4 py-5 text-muted">Loading price ranges...</td></tr>
            ) : ranges.length ? ranges.map((range) => (
              <tr key={range.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium">{range.city}</td>
                <td className="px-4 py-3">{range.service?.name || range.serviceId}</td>
                <td className="px-4 py-3">{[range.vehicleBrand, range.vehicleModel].filter(Boolean).join(" / ") || "Any"}</td>
                <td className="px-4 py-3">{range.fuelType || "Any"}</td>
                <td className="px-4 py-3">Rs. {Number(range.minPrice).toLocaleString()} - Rs. {Number(range.maxPrice).toLocaleString()}</td>
                <td className="px-4 py-3"><span className={range.isActive ? "chip-brand" : "chip"}>{range.isActive ? "Active" : "Inactive"}</span></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => editRange(range)} className="btn-ghost !px-3 !py-2"><FiEdit3 /></button>
                    <button onClick={() => deleteRange(range)} className="rounded-xl bg-red-50 px-3 py-2 text-red-700"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="7" className="px-4 py-5 text-muted">No price ranges found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
