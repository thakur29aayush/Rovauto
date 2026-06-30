import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/hooks/useApp";
import api from "@/api/axios";
import { FiCheckCircle, FiMapPin } from "react-icons/fi";

export default function AddressForm() {
  const nav = useNavigate();
  const routeLocation = useLocation();
  const { user, setUser, setLocation, fetchProfile, clearProfileCache } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Parse existing address from user or route state
  const initialAddress = routeLocation.state?.existingAddress || user?.customerProfile?.address || user?.address || "";
  const initialParts = parseAddress(initialAddress);

  const [form, setForm] = useState({
    address: initialParts.address || "",
    area: initialParts.area || "",
    city: initialParts.city || "",
    pincode: initialParts.pincode || "",
    latitude: routeLocation.state?.latitude || user?.locations?.[0]?.latitude || null,
    longitude: routeLocation.state?.longitude || user?.locations?.[0]?.longitude || null,
  });

  function parseAddress(fullAddress) {
    if (!fullAddress) return { address: "", area: "", city: "", pincode: "" };
    const parts = fullAddress.split(", ");
    const lastPart = parts[parts.length - 1] || "";
    const pincodeMatch = lastPart.match(/\d{6}/);

    return {
      address: parts.slice(0, -2).join(", ") || fullAddress,
      area: parts[parts.length - 2] || "",
      city: lastPart.replace(pincodeMatch?.[0] || "", "").trim() || "",
      pincode: pincodeMatch?.[0] || "",
    };
  }

  const change = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const detectLocation = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) reject(new Error("Geolocation not supported"));
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });

      const latitude = Number(position.coords.latitude.toFixed(6));
      const longitude = Number(position.coords.longitude.toFixed(6));

      // Reverse geocode to get address
      try {
        const url = new URL("https://nominatim.openstreetmap.org/reverse");
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("lat", String(latitude));
        url.searchParams.set("lon", String(longitude));

        const response = await fetch(url.toString(), {
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          const fullAddress = data.display_name || "";
          const parsed = parseAddress(fullAddress);
          setForm({
            address: parsed.address || fullAddress,
            area: parsed.area,
            city: parsed.city,
            pincode: parsed.pincode,
            latitude,
            longitude,
          });
        }
      } catch {
        setForm((prev) => ({ ...prev, latitude, longitude }));
      }
    } catch (err) {
      setError("Could not detect location. Please enter manually.");
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const fullAddress = [form.address, form.area, form.city, form.pincode].filter(Boolean).join(", ");

      // Save to profile
      await api.patch("/customer/profile", {
        address: fullAddress,
      });

      // Update app location state
      setLocation({
        address: form.address,
        area: form.area,
        city: form.city,
        pincode: form.pincode,
        latitude: form.latitude,
        longitude: form.longitude,
      });

      // Refresh user data
      clearProfileCache();
      await fetchProfile({ force: true });

      // Update user's isOnboarded flag locally if needed
      setUser((prev) => ({
        ...prev,
        isOnboarded: true,
      }));

      // Redirect to next page
      const nextPath = routeLocation.state?.from?.pathname || "/booking/vehicle";
      nav(nextPath, { state: routeLocation.state?.from?.state });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not save address. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x py-12 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold">Complete Your Profile</h1>
      <p className="mt-1 text-muted">
        Add your address to get started with booking services.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={save} className="mt-8 grid gap-4">
        <button
          type="button"
          onClick={detectLocation}
          className="flex items-center justify-center gap-2 rounded-xl border border-ink px-4 py-3 font-medium text-ink transition hover:bg-bg-soft"
        >
          <FiMapPin />
          Use Current Location
        </button>

        <div className="grid gap-4">
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Full Address</span>
            <input
              required
              name="address"
              value={form.address}
              onChange={change}
              placeholder="House number, Street, Landmark"
              className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Area</span>
              <input
                required
                name="area"
                value={form.area}
                onChange={change}
                placeholder="Locality"
                className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
              />
            </label>

            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">City</span>
              <input
                required
                name="city"
                value={form.city}
                onChange={change}
                placeholder="City"
                className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
              />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Pincode</span>
            <input
              required
              name="pincode"
              value={form.pincode}
              onChange={change}
              placeholder="6-digit pincode"
              inputMode="numeric"
              maxLength={6}
              className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
            />
          </label>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="btn-primary mt-4"
        >
          {loading ? "Saving..." : (
            <>
              <FiCheckCircle />
              Save & Continue
            </>
          )}
        </button>
      </form>
    </div>
  );
}
