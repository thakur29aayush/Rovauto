import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BRAND_ICONS, FUEL_TYPES } from "@/data/vehicles";
import { useApp } from "@/hooks/useApp";
import api from "@/api/axios";
import { FiArrowRight, FiCheck } from "react-icons/fi";

export default function VehicleSelect() {
  const nav = useNavigate();

  const { setVehicle, setVehicles, fetchMe } = useApp();

  const [brands, setBrands] = useState([]);
  const [brand, setBrand] = useState(null);
  const [model, setModel] = useState(null);
  const [fuel, setFuel] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [registrationNumber, setRegistrationNumber] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadVehicleBrands = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await api.get("/vehicle-meta/brands");
      const backendBrands = res.data.data || [];

      const mappedBrands = backendBrands.map((item) => ({
        ...item,
        icon: BRAND_ICONS[item.name]?.icon || null,
        image: BRAND_ICONS[item.name]?.image || null,
        models: item.models || [],
      }));

      setBrands(mappedBrands);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load vehicle brands"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicleBrands();
  }, []);

  const selectBrand = (selectedBrand) => {
    setBrand(selectedBrand);
    setModel(null);
  };

  const confirm = async () => {
    if (!brand || !model || !fuel || !year) {
      setError("Please select brand, model, fuel type, and year");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        brand: brand.name,
        model: model.name,
        year: Number(year),
        fuelType: fuel.value,
        registrationNumber: registrationNumber.trim() || null,
        isDefault: true,
      };

      const res = await api.post("/vehicles", payload);
      const createdVehicle = res.data.data;

      setVehicle(createdVehicle);

      const me = await fetchMe?.();

      if (me?.vehicles) {
        setVehicles(me.vehicles);
      }

      nav("/booking/services");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save vehicle"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-x py-12 max-w-4xl">
        <div className="card-soft p-8 text-muted">
          Loading vehicle brands...
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-12 max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <span className="chip-brand">Step 1 of 3</span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-bold">
        Which car do you drive?
      </h1>

      <p className="text-muted mt-2">
        We'll tailor services specifically for your vehicle.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-10 grid gap-6">
        <Block title="Select Brand" done={!!brand} value={brand?.name}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {brands.map((b) => {
              const Icon = b.icon;

              return (
                <button
                  key={b.id}
                  onClick={() => selectBrand(b)}
                  className={`p-4 rounded-2xl border text-left transition ${
                    brand?.id === b.id
                      ? "border-ink bg-ink text-white"
                      : "border-line hover:border-ink"
                  }`}
                >
                  {b.image ? (
                    <img
                      src={b.image}
                      alt={b.name}
                      className="h-10 w-auto mb-2 object-contain"
                    />
                  ) : Icon ? (
                    <Icon className="h-10 w-auto mb-2" />
                  ) : (
                    <div className="h-10 w-10 mb-2 rounded-xl bg-brand grid place-items-center font-bold">
                      {b.name.charAt(0)}
                    </div>
                  )}

                  <div className="text-sm font-semibold">{b.name}</div>
                </button>
              );
            })}
          </div>
        </Block>

        {brand && (
          <Block title="Select Model" done={!!model} value={model?.name}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {brand.models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m)}
                  className={`px-4 py-3 rounded-2xl border text-left transition ${
                    model?.id === m.id
                      ? "border-ink bg-ink text-white"
                      : "border-line hover:border-ink"
                  }`}
                >
                  <div className="font-semibold">
                    {brand.name} {m.name}
                  </div>
                </button>
              ))}
            </div>
          </Block>
        )}

        {model && (
          <Block title="Select Fuel" done={!!fuel} value={fuel?.label}>
            <div className="flex flex-wrap gap-3">
              {FUEL_TYPES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFuel(f)}
                  className={`px-5 py-3 rounded-full border text-sm font-medium transition ${
                    fuel?.value === f.value
                      ? "border-ink bg-ink text-white"
                      : "border-line hover:border-ink"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Block>
        )}

        {brand && model && fuel && (
          <Block title="Vehicle Details" done={!!year} value={year}>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Year</span>
                <input
                  required
                  type="number"
                  value={year}
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  onChange={(e) => setYear(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none"
                />
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">
                  Registration Number{" "}
                  <span className="text-muted">(optional)</span>
                </span>
                <input
                  value={registrationNumber}
                  onChange={(e) =>
                    setRegistrationNumber(e.target.value.toUpperCase())
                  }
                  placeholder="DL 3C AB 1234"
                  className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none"
                />
              </label>
            </div>
          </Block>
        )}

        {brand && model && fuel && year && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-soft p-6"
          >
            <div className="flex items-center gap-4">
              <span className="grid place-items-center h-14 w-14 rounded-2xl bg-brand p-2">
                {brand.image ? (
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="h-8 w-8 object-contain"
                  />
                ) : brand.icon ? (
                  <brand.icon className="h-8 w-8 text-ink" />
                ) : (
                  <span className="font-bold">{brand.name.charAt(0)}</span>
                )}
              </span>

              <div className="flex-1">
                <div className="text-xs text-muted">Your vehicle</div>

                <div className="text-xl font-bold">
                  {brand.name} {model.name}
                </div>

                <div className="text-sm text-muted">
                  {fuel.label} · {year}
                  {registrationNumber ? ` · ${registrationNumber}` : ""}
                </div>
              </div>

              <span className="chip-brand">
                Great! Services tailored for you.
              </span>
            </div>

            <button
              onClick={confirm}
              disabled={saving}
              className="btn-primary mt-5 w-full sm:w-auto"
            >
              {saving ? "Saving..." : "Continue to Services"}
              {!saving && <FiArrowRight />}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Block({ title, done, value, children }) {
  return (
    <div className="card-soft p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{title}</h3>

        {done && (
          <span className="chip flex items-center gap-1">
            <FiCheck /> {value}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}