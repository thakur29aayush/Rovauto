const axios = require("axios");
const ApiError = require("../../utils/apiError");
const { getCache, setCache } = require("../../utils/cache");

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const GEOCODE_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60;

const normalizePart = (value) => String(value || "").trim();

const getNominatimUserAgent = () => {
  return (
    process.env.NOMINATIM_USER_AGENT ||
    process.env.GEOCODER_USER_AGENT ||
    "Rovauto/1.0 (set-NOMINATIM_USER_AGENT@example.com)"
  );
};

const buildQuery = ({ address, city, state, country = "India" }) => {
  return [address, city, state, country]
    .map(normalizePart)
    .filter(Boolean)
    .join(", ");
};

const geocodeAddress = async (params = {}) => {
  const query = buildQuery(params);
  if (!query) throw new ApiError(400, "Address or city is required for geocoding");

  const cacheKey = `geocode:nominatim:${query.toLowerCase()}`;
  const cached = await getCache(cacheKey);
  if (cached) return { ...cached, cached: true };

  let response;
  try {
    response = await axios.get(NOMINATIM_URL, {
      params: {
        q: query,
        format: "jsonv2",
        addressdetails: 1,
        limit: 1,
        countrycodes: params.countrycodes || "in",
      },
      headers: {
        "User-Agent": getNominatimUserAgent(),
        Accept: "application/json",
      },
      timeout: Number(process.env.NOMINATIM_TIMEOUT_MS || 8000),
    });
  } catch (error) {
    throw new ApiError(error.response?.status || 502, "Unable to geocode address right now");
  }

  const place = response.data?.[0];
  if (!place) throw new ApiError(404, "No location found for this address");

  const result = {
    provider: "nominatim",
    query,
    latitude: Number(place.lat),
    longitude: Number(place.lon),
    displayName: place.display_name,
    importance: place.importance ?? null,
    address: place.address || null,
    attribution: "© OpenStreetMap contributors",
  };

  await setCache(cacheKey, result, GEOCODE_CACHE_TTL_SECONDS);
  return result;
};

module.exports = {
  geocodeAddress,
};
