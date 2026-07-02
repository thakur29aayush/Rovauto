import { useEffect, useState } from "react";
import { cityApi } from "@/api/cities";

let cityCache = null;

export default function CitySelect({
  value,
  onChange,
  required = false,
  placeholder = "Select city",
  includeInactive = false,
  className = "",
}) {
  const [cities, setCities] = useState(cityCache || []);
  const [loading, setLoading] = useState(!cityCache);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = includeInactive
          ? await cityApi.getAdminCities({ includeInactive: true })
          : await cityApi.getCities();
        if (!mounted) return;
        cityCache = data || [];
        setCities(cityCache);
      } catch {
        if (mounted) setCities([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [includeInactive]);

  return (
    <select
      required={required}
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      className={className || "min-w-0 rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"}
    >
      <option value="">{loading ? "Loading cities..." : placeholder}</option>
      {value && !cities.some((city) => city.name.toLowerCase() === String(value).toLowerCase()) && (
        <option value={value}>{value}</option>
      )}
      {cities.map((city) => (
        <option key={city.id} value={city.name}>
          {city.name}{city.state ? `, ${city.state}` : ""}{city.isActive === false ? " (Inactive)" : ""}
        </option>
      ))}
    </select>
  );
}
