const axios = require("axios");
const ApiError = require("../../utils/apiError");
const { getCache, setCache } = require("../../utils/cache");
const { correctAddress } = require("../../utils/addressCorrection");

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const GEOCODE_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60;

const normalizePart = (value) => String(value || "").trim();

const getNominatimUserAgent = () => (
  process.env.NOMINATIM_USER_AGENT ||
  process.env.GEOCODER_USER_AGENT ||
  "Rovauto/1.0 (set-NOMINATIM_USER_AGENT@example.com)"
);

const getDefaultCountry = () => process.env.GEOCODER_DEFAULT_COUNTRY || "India";
const getDefaultCountryCodes = () => process.env.GEOCODER_COUNTRYCODES || "in";

const buildQuery = ({ address, city, state, pincode, country = getDefaultCountry() }) =>
  [address, city, state, pincode, country]
    .map(normalizePart)
    .filter(Boolean)
    .join(", ");

const requestNominatim = (query, params = {}) =>
  axios.get(NOMINATIM_URL, {
    params: {
      q: query,
      format: "jsonv2",
      addressdetails: 1,
      limit: 1,
      countrycodes: params.countrycodes || getDefaultCountryCodes(),
    },
    headers: {
      "User-Agent": getNominatimUserAgent(),
      Accept: "application/json",
    },
    timeout: Number(process.env.NOMINATIM_TIMEOUT_MS || 8000),
  });

const mapPlaceResult = ({
  place,
  query,
  corrected = false,
  originalQuery = null,
  correctedAddressText = null,
}) => ({
  provider: "nominatim",
  query,
  latitude: Number(place.lat),
  longitude: Number(place.lon),
  displayName: place.display_name,
  importance: place.importance ?? null,
  address: place.address || null,
  attribution: "OpenStreetMap contributors",
  corrected,
  ...(originalQuery ? { originalQuery } : {}),
  ...(correctedAddressText ? { correctedAddressText } : {}),
});

const geocodeWithCorrection = async ({ params, originalQuery }) => {
  const correctedAddressText = await correctAddress(params.address, params.city, params.state);
  const correctedQuery = buildQuery({
    address: correctedAddressText,
    city: params.city,
    state: params.state,
    pincode: params.pincode,
    country: params.country,
  });

  let retryResponse;
  try {
    retryResponse = await requestNominatim(correctedQuery, params);
  } catch (retryError) {
    console.error("Nominatim retry with corrected address failed:", retryError.message);
    throw new ApiError(404, "No location found even after address correction");
  }

  const correctedPlace = retryResponse.data?.[0];
  if (!correctedPlace) {
    throw new ApiError(404, "No location found even after address correction");
  }

  return mapPlaceResult({
    place: correctedPlace,
    query: correctedQuery,
    corrected: true,
    originalQuery,
    correctedAddressText,
  });
};

const geocodeAddress = async (params = {}) => {
  const query = buildQuery(params);
  if (!query) throw new ApiError(400, "Address or city is required for geocoding");

  const cacheKey = `geocode:nominatim:${query.toLowerCase()}`;
  const cached = await getCache(cacheKey);
  if (cached) return { ...cached, cached: true };

  let response = null;
  let providerError = null;

  try {
    response = await requestNominatim(query, params);
  } catch (error) {
    console.error("Nominatim geocoding error:", error.message);
    providerError = error;
  }

  const place = response?.data?.[0];
  if (place) {
    const result = mapPlaceResult({ place, query });
    await setCache(cacheKey, result, GEOCODE_CACHE_TTL_SECONDS);
    return result;
  }

  if (process.env.GROQ_API_KEY) {
    try {
      console.log("Nominatim failed, attempting Groq address correction...");
      const result = await geocodeWithCorrection({ params, originalQuery: query });
      await setCache(cacheKey, result, GEOCODE_CACHE_TTL_SECONDS);
      return result;
    } catch (correctionError) {
      console.error("Groq address correction failed:", correctionError.message);
      if (correctionError.status) throw correctionError;
      throw new ApiError(404, "No location found for this address");
    }
  }

  if (providerError) {
    throw new ApiError(providerError.response?.status || 502, "Unable to geocode address right now");
  }

  console.warn("Address not found and Groq not configured");
  throw new ApiError(404, "No location found for this address");
};

module.exports = {
  geocodeAddress,
};
