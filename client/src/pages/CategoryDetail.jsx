import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CATEGORY_UI } from "@/data/services";
import api from "@/api/axios";
import { FiStar, FiArrowLeft, FiX, FiTool } from "react-icons/fi";
import { useApp } from "@/hooks/useApp";

const getPrice = (service) => {
  return service.basePrice || service.minPrice || 0;
};

const getOriginalPrice = (service) => {
  return service.maxPrice || service.basePrice || service.minPrice || 0;
};

const getDuration = (service) => {
  if (!service.durationMin) return "Duration varies";

  if (service.durationMin >= 60) {
    const hours = Math.round(service.durationMin / 60);
    return `${hours} ${hours === 1 ? "Hour" : "Hours"}`;
  }

  return `${service.durationMin} Minutes`;
};

const getIncludes = (service) => {
  if (!service.description) return ["Service inspection", "Basic checks"];

  return service.description
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export default function CategoryDetail() {
  const { categoryId } = useParams();
  const { user, addToCart } = useApp();

  const nav = useNavigate();

  const [category, setCategory] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);

        const res = await api.get("/services/categories");
        const categories = res.data.data || [];

        const found = categories.find((item) => item.id === categoryId);

        setCategory(found || null);
        setPackages(found?.services || []);
      } catch (err) {
        console.error("Failed to load category:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="container-x py-10">
        <div className="card-soft p-8 text-muted">Loading category...</div>
      </div>
    );
  }

  if (!category) {
    return <div className="container-x py-10">Category not found</div>;
  }

  const ui = CATEGORY_UI[category.name] || {};
  const categoryImage = ui.image;
  const Icon = ui.icon || FiTool;

  const handleBook = (service) => {
    const serviceItem = {
      ...service,
      price: getPrice(service),
      image: categoryImage,
      catId: category.id,
    };

    addToCart(serviceItem);

    if (!user) {
      nav("/login");
    } else {
      nav("/booking/services");
    }
  };

  return (
    <div className="container-x py-10">
      <Link
        to="/services"
        className="flex items-center gap-2 text-ink mb-6 hover:opacity-80"
      >
        <FiArrowLeft /> Back to Services
      </Link>

      <h1 className="text-3xl sm:text-4xl font-bold mb-8">
        {category.name}
      </h1>

      <div className="grid gap-6">
        {packages.map((pkg) => {
          const price = getPrice(pkg);
          const originalPrice = getOriginalPrice(pkg);
          const includes = getIncludes(pkg);

          return (
            <div key={pkg.id} className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="h-52 w-full md:w-72 rounded-3xl overflow-hidden flex-shrink-0 bg-bg-soft">
                  {categoryImage ? (
                    <img
                      src={categoryImage}
                      alt={pkg.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-4xl text-muted">
                      <Icon />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    {pkg.name}
                  </h2>

                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-2xl sm:text-3xl font-bold text-ink">
                      ₹{price}
                    </span>

                    {originalPrice > price && (
                      <span className="text-xl text-muted line-through">
                        ₹{originalPrice}
                      </span>
                    )}

                    {originalPrice > price && (
                      <span className="text-green-600 font-bold text-xl">
                        OFF
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <FiStar className="text-amber-400" fill="currentColor" />
                      <span className="text-xl font-semibold">4.8</span>
                    </div>

                    <span className="text-muted text-lg">
                      Verified service
                    </span>
                  </div>

                  <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl text-lg font-medium mb-4">
                    Popular service
                  </div>

                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-3 text-xl">
                      <span className="font-bold text-ink">Time:</span>
                      <span className="text-muted">{getDuration(pkg)}</span>
                    </li>

                    <li className="flex items-start gap-3 text-xl">
                      <span className="font-bold text-ink">Warranty:</span>
                      <span className="text-muted">Service warranty available</span>
                    </li>

                    <li className="flex items-start gap-3 text-xl">
                      <span className="font-bold text-ink">Services:</span>
                      <span className="text-muted">
                        {includes.length} included
                      </span>
                    </li>
                  </ul>

                  <div className="border-t-2 border-dashed border-gray-200 my-6"></div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setSelectedPackage(pkg)}
                      className="flex-1 py-5 px-8 rounded-3xl border-2 border-gray-300 text-2xl font-bold hover:bg-gray-50 transition"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => handleBook(pkg)}
                      className="flex-1 py-5 px-8 rounded-3xl bg-[#b9f000] text-2xl font-bold hover:bg-[#9bd000] transition shadow-[0_10px_40px_-10px_rgba(185,240,0,0.55)]"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {packages.length === 0 && (
          <div className="card-soft p-8 text-muted">
            No services available in this category.
          </div>
        )}
      </div>

      {selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedPackage.name}
                </h2>

                <button
                  onClick={() => setSelectedPackage(null)}
                  className="grid place-items-center h-10 w-10 rounded-full border border-gray-300 hover:bg-gray-100 transition"
                >
                  <FiX />
                </button>
              </div>

              <div className="h-56 w-full rounded-2xl overflow-hidden mb-6 bg-bg-soft">
                {categoryImage ? (
                  <img
                    src={categoryImage}
                    alt={selectedPackage.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-4xl text-muted">
                    <Icon />
                  </div>
                )}
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-ink">
                  ₹{getPrice(selectedPackage)}
                </span>

                {getOriginalPrice(selectedPackage) > getPrice(selectedPackage) && (
                  <span className="text-xl text-muted line-through">
                    ₹{getOriginalPrice(selectedPackage)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <FiStar className="text-amber-400" fill="currentColor" />
                  <span className="text-lg font-semibold">4.8</span>
                  <span className="text-muted text-sm">Verified service</span>
                </div>

                <div className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-xl text-sm font-medium">
                  Popular service
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm text-muted">Time</span>
                  <div className="font-semibold text-lg">
                    {getDuration(selectedPackage)}
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted">Warranty</span>
                  <div className="font-semibold text-lg">
                    Available
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted">Services Included</span>
                  <div className="font-semibold text-lg">
                    {getIncludes(selectedPackage).length}
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted">Estimated Price</span>
                  <div className="font-semibold text-lg">
                    ₹{getPrice(selectedPackage)}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">
                  Included Services
                </h3>

                <ul className="grid gap-2">
                  {getIncludes(selectedPackage).map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 py-2 px-4 bg-bg-soft rounded-xl"
                    >
                      <span className="h-2 w-2 rounded-full bg-brand" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setSelectedPackage(null)}
                  className="flex-1 py-3 px-6 rounded-full border-2 border-gray-300 font-bold hover:bg-gray-50 transition"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    handleBook(selectedPackage);
                    setSelectedPackage(null);
                  }}
                  className="flex-1 py-3 px-6 rounded-full bg-[#b9f000] font-bold hover:bg-[#9bd000] transition shadow-[0_10px_40px_-10px_rgba(185,240,0,0.55)]"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}