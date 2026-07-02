
import { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiMapPin, FiNavigation, FiArrowLeft } from "react-icons/fi";
import Logo from "@/components/common/Logo";
import { garageApi } from "@/api/garage";

export default function OnboardingStep2({ data, onChange, onNext, onBack }) {
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const hasCoordinates = (location) =>
    Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lng));

  const updateAddressField = (field, value) => {
    onChange({
      ...data,
      [field]: value,
      location: { lat: null, lng: null },
    });
    setLocationError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocationError("");

    try {
      let nextData = data;

      if (!hasCoordinates(data.location)) {
        const result = await garageApi.geocodeApplicationLocation({
          address: data.address,
          city: data.city,
          area: data.area,
        });

        if (!Number.isFinite(result.latitude) || !Number.isFinite(result.longitude)) {
          throw new Error("Could not determine coordinates for this garage address.");
        }

        nextData = {
          ...data,
          location: {
            lat: result.latitude,
            lng: result.longitude,
          },
        };
        onChange(nextData);
      }

      onNext();
    } catch (err) {
      setLocationError(
        err.response?.data?.message ||
          err.message ||
          "Could not find this garage location. Please verify the address and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Current location is not supported by this browser.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          ...data,
          location: {
            lat: Number(position.coords.latitude.toFixed(6)),
            lng: Number(position.coords.longitude.toFixed(6)),
          },
        });
        setLocationLoading(false);
      },
      (error) => {
        setLocationError(error.message || "Unable to fetch current location.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
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
                  onChange={(e) => updateAddressField("address", e.target.value)}
                  placeholder="Enter full address"
                  rows={3}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors resize-none"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={data.city}
                  onChange={(e) => updateAddressField("city", e.target.value)}
                  placeholder="Kathmandu"
                  className="w-full px-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Area</label>
                <input
                  type="text"
                  value={data.area}
                  onChange={(e) => updateAddressField("area", e.target.value)}
                  placeholder="Baneshwor"
                  className="w-full px-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Short Description</label>
              <textarea
                value={data.description}
                onChange={(e) => onChange({ ...data, description: e.target.value })}
                placeholder="Tell customers what your garage specializes in"
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="card-soft p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">GPS Location</span>
                <button type="button" onClick={getCurrentLocation} disabled={locationLoading} className="btn-ghost text-sm py-2 px-3">
                  <FiNavigation className="w-4 h-4" />
                  {locationLoading ? "Fetching..." : "Get Current Location"}
                </button>
              </div>
              <div className="text-muted text-sm">
                Lat: {data.location?.lat || "Not set"}, Lng: {data.location?.lng || "Not set"}
              </div>
              {locationError && <div className="mt-2 text-sm text-red-600">{locationError}</div>}
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
              {loading ? "Saving..." : "Save and Continue"}
              <FiArrowRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
