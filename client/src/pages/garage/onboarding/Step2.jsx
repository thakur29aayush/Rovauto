
import { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiMapPin, FiNavigation, FiArrowLeft } from "react-icons/fi";
import Logo from "@/components/common/Logo";

export default function OnboardingStep2({ data, onChange, onNext, onBack }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setLoading(false);
    onNext();
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-soft">
      
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg card-soft p-8"
        >
          <h1 className="text-3xl font-bold mb-2">Location Details</h1>
          <p className="text-muted mb-8">Set your garage address and working radius</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Garage Address</label>
              <div className="relative">
                <FiMapPin className="absolute left-4 top-4 text-muted" />
                <textarea
                  value={data.address}
                  onChange={(e) => onChange({ ...data, address: e.target.value })}
                  placeholder="Enter full address"
                  rows={3}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors resize-none"
                  required
                />
              </div>
            </div>

            <div className="card-soft p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">GPS Location</span>
                <button type="button" className="btn-ghost text-sm py-2 px-3">
                  <FiNavigation className="w-4 h-4" />
                  Get Current Location
                </button>
              </div>
              <div className="text-muted text-sm">
                Lat: {data.location?.lat || "Not set"}, Lng: {data.location?.lng || "Not set"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Working Radius: {data.workingRadius} km
              </label>
              <input
                type="range"
                min="5"
                max="30"
                value={data.workingRadius}
                onChange={(e) => onChange({ ...data, workingRadius: Number(e.target.value) })}
                className="w-full h-2 bg-line rounded-full appearance-none cursor-pointer accent-brand"
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>5 km</span>
                <span>30 km</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg mt-4"
            >
              {loading ? "Continuing..." : "Continue"}
              <FiArrowRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
