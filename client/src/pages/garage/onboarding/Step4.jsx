
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/hooks/useApp";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import Logo from "@/components/common/Logo";
import { mockBrands, mockGarage } from "@/data/garageData";

export default function OnboardingStep4({ data, onChange, onBack }) {
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const { loginGarage } = useApp();
  const navigate = useNavigate();

  const toggleBrand = (brandId) => {
    const brands = data.brands.includes(brandId)
      ? data.brands.filter(id => id !== brandId)
      : [...data.brands, brandId];
    onChange({ ...data, brands });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setComplete(true);
    loginGarage({ ...mockGarage, ...data, isOnboardingComplete: true }, "mock-garage-token");
    setTimeout(() => navigate("/garage"), 2000);
  };

  if (complete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-soft px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <FiCheckCircle className="w-24 h-24 mx-auto text-brand mb-6" />
          <h1 className="text-4xl font-bold mb-4">Welcome Aboard!</h1>
          <p className="text-muted text-lg">Your garage is now live. Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-soft">
      
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl card-soft p-8"
        >
          <h1 className="text-3xl font-bold mb-2">Garage Type</h1>
          <p className="text-muted mb-8">Select your garage type and supported brands</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onChange({ ...data, garageType: "MULTI_BRAND" })}
                className={`p-6 rounded-2xl border-2 text-center transition-all ${
                  data.garageType === "MULTI_BRAND" 
                    ? "border-brand bg-brand-soft" 
                    : "border-line hover:border-ink-2"
                }`}
              >
                <h3 className="font-bold text-lg mb-1">Multi-Brand</h3>
                <p className="text-muted text-sm">We Service All Brands</p>
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...data, garageType: "AUTHORIZED" })}
                className={`p-6 rounded-2xl border-2 text-center transition-all ${
                  data.garageType === "AUTHORIZED" 
                    ? "border-brand bg-brand-soft" 
                    : "border-line hover:border-ink-2"
                }`}
              >
                <h3 className="font-bold text-lg mb-1">Authorized</h3>
                <p className="text-muted text-sm">Select Specific Brands</p>
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Select Brands You Service</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mockBrands.map((brand) => {
                  const Icon = brand.icon;

                  return (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => toggleBrand(brand.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                        data.brands.includes(brand.id)
                          ? "border-brand bg-brand-soft"
                          : "border-line hover:border-ink-2"
                      }`}
                    >
                      {brand.image ? (
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className="mb-2 h-10 w-auto object-contain"
                        />
                      ) : Icon ? (
                        <Icon className="mb-2 h-10 w-auto" />
                      ) : (
                        <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-brand font-bold">
                          {brand.name.charAt(0)}
                        </div>
                      )}

                      <div className="text-sm font-semibold">{brand.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || data.brands.length === 0}
              className="btn-primary w-full py-4 text-lg"
            >
              {loading ? "Finishing..." : "Complete Setup"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
