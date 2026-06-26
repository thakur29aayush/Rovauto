import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORY_UI } from "@/data/services";
import { useApp } from "@/hooks/useApp";
import api from "@/api/axios";
import { FiArrowRight, FiCheck, FiTruck } from "react-icons/fi";

export default function ServiceSelect() {
  const { vehicle, cart, addToCart, removeFromCart } = useApp();

  const [categories, setCategories] = useState([]);
  const [catId, setCatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedCategory = categories.find((c) => c.id === catId);
  const list = selectedCategory?.services || [];

  const total = cart.reduce((sum, item) => {
    return sum + (item.basePrice || item.minPrice || 0);
  }, 0);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/services/categories");
        const data = res.data.data || [];

        setCategories(data);

        if (data.length > 0) {
          setCatId(data[0].id);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  if (loading) {
    return (
      <div className="container-x py-12">
        <div className="card-soft p-8 text-muted">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="container-x py-12">
      <div className="flex items-center gap-3 mb-2">
        <span className="chip-brand">Step 2 of 3</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold">
        Pick services for your{" "}
        {vehicle ? `${vehicle.brand} ${vehicle.model}` : "vehicle"}
      </h1>

      <p className="text-muted mt-2">
        Add multiple services. Nearby garages will receive your request after checkout.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-8 grid lg:grid-cols-[260px_1fr_320px] gap-6">
        <aside className="card-soft p-3 lg:sticky lg:top-24 h-fit">
          <div className="grid gap-1">
            {categories.map((c) => {
              const ui = CATEGORY_UI[c.name] || {};
              const Icon = ui.icon || FiTool;

              return (
                <button
                  key={c.id}
                  onClick={() => setCatId(c.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition ${
                    catId === c.id ? "bg-ink text-white" : "hover:bg-bg-soft"
                  }`}
                >
                  <Icon style={{ color: catId === c.id ? "#b9f000" : ui.color }} />
                  {c.name}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="grid gap-4">
          {list.map((service) => {
            const inCart = cart.some((item) => item.id === service.id);
            const price = service.basePrice || service.minPrice || 0;
            const duration = service.durationMin
              ? `${service.durationMin} min`
              : "Duration varies";

            return (
              <div
                key={service.id}
                className="card-soft p-5 flex flex-col sm:flex-row gap-4"
              >
                <div className="flex-1 min-w-0">
                  <span className="chip">{duration}</span>

                  <h3 className="font-semibold text-lg mt-2">
                    {service.name}
                  </h3>

                  <p className="text-sm text-muted mt-1">
                    {service.description || "Service details available at checkout."}
                  </p>

                  <ul className="mt-3 grid gap-1.5 text-sm">
                    {(service.description || "")
                      .split(",")
                      .slice(0, 5)
                      .map((item) => item.trim())
                      .filter(Boolean)
                      .map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <FiCheck className="text-brand-dark shrink-0" />
                          {item}
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="sm:w-40 text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">
                  <div>
                    <div className="text-xs text-muted">From</div>
                    <div className="font-bold text-2xl">₹{price}</div>
                  </div>

                  <button
                    onClick={() =>
                      inCart ? removeFromCart(service.id) : addToCart(service)
                    }
                    className={inCart ? "btn-dark" : "btn-primary"}
                  >
                    {inCart ? "Remove" : "Add"}
                  </button>
                </div>
              </div>
            );
          })}

          {list.length === 0 && (
            <div className="card-soft p-8 text-muted">
              No services found in this category.
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 h-fit card-soft p-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center h-10 w-10 rounded-xl bg-brand">
              <FiTruck />
            </span>

            <div className="text-sm">
              <div className="font-semibold">
                {vehicle?.brand} {vehicle?.model}
              </div>
              <div className="text-muted text-xs">
                {vehicle?.fuelType || "Vehicle selected"}
              </div>
            </div>
          </div>

          <hr className="my-4 border-line" />

          <div className="font-semibold mb-2">Your Cart ({cart.length})</div>

          {cart.length === 0 ? (
            <p className="text-sm text-muted">No services added yet.</p>
          ) : (
            <div className="grid gap-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate">{item.name}</span>
                  <span className="font-semibold">
                    ₹{item.basePrice || item.minPrice || 0}
                  </span>
                </div>
              ))}
            </div>
          )}

          <hr className="my-4 border-line" />

          <div className="flex items-center justify-between">
            <span className="text-muted">Estimated</span>
            <span className="text-xl font-bold">₹{total}</span>
          </div>

          <Link
            to="/checkout"
            className={`btn-primary w-full mt-4 ${
              cart.length === 0 ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            Continue <FiArrowRight />
          </Link>
        </aside>
      </div>
    </div>
  );
}