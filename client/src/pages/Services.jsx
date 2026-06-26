import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORY_UI } from "@/data/services";
import { FiSearch, FiArrowRight, FiTool } from "react-icons/fi";
import { useApp } from "@/hooks/useApp";

export default function Services() {
  const [q, setQ] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const { cart, fetchServiceCategories } = useApp();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchServiceCategories();
        setCategories(data || []);
      } catch (error) {
        console.error("Failed to load service categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [fetchServiceCategories]);

  const filteredCategories = q
    ? categories.filter((category) =>
        category.name.toLowerCase().includes(q.toLowerCase())
      )
    : categories;

  const cartTotal = cart.reduce((total, item) => {
    return total + (item.basePrice || item.minPrice || item.price || 0);
  }, 0);

  return (
    <div className="container-x py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">All Services</h1>
          <p className="text-muted mt-2">
            Curated for your vehicle. Transparent pricing.
          </p>
        </div>

        <div className="relative max-w-md w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />

          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search categories"
            className="w-full pl-11 pr-4 py-3 rounded-full border border-line focus:border-[#b9f000] outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="card-soft p-8 text-muted">Loading services...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {filteredCategories.map((category) => {
            const ui = CATEGORY_UI[category.name] || {};
            const Icon = ui.icon || FiTool;

            return (
              <Link
                to={ui.isSos ? "/sos" : `/services/${category.id}`}
                key={category.id}
                className="cursor-pointer rounded-3xl bg-white p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="text-xl font-bold mb-4">
                  {category.name}
                </div>

                <div className="h-32 w-full rounded-2xl overflow-hidden bg-bg-soft">
                  {ui.image ? (
                    <img
                      src={ui.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-3xl text-muted">
                      <Icon />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="card-soft p-8 text-muted">
              No service categories found.
            </div>
          )}
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-5 inset-x-0 z-40 flex justify-center px-4">
          <Link to="/checkout" className="btn-dark shadow-2xl px-6 py-3.5">
            {cart.length} service{cart.length > 1 ? "s" : ""} · ₹{cartTotal} ·
            Continue <FiArrowRight />
          </Link>
        </div>
      )}
    </div>
  );
}