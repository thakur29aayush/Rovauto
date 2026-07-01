const axios = require("axios");
const ApiError = require("../../utils/apiError");
const { getCache, setCache } = require("../../utils/cache");
const { correctAddress } = require("../../utils/addressCorrection");

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
  
  // If no location found, try Groq to correct the address
  if (!place) {
    try {
      const correctedAddressText = await correctAddress(params.address, params.city, params.state);
      
      // Retry geocoding with corrected address
      const correctedQuery = buildQuery({
        address: correctedAddressText,
        city: params.city,
        state: params.state,
        country: "India",
      });

      const retryResponse = await axios.get(NOMINATIM_URL, {
        params: {
          q: correctedQuery,
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

      const correctedPlace = retryResponse.data?.[0];
      if (!correctedPlace) {
        throw new ApiError(404, "No location found even after address correction");
      }

      const result = {
        provider: "nominatim",
        query: correctedQuery,
        latitude: Number(correctedPlace.lat),
        longitude: Number(correctedPlace.lon),
        displayName: correctedPlace.display_name,
        importance: correctedPlace.importance ?? null,
        address: correctedPlace.address || null,
        attribution: "© OpenStreetMap contributors",
        corrected: true,
        originalQuery: query,
        correctedAddressText,
      };

      await setCache(cacheKey, result, GEOCODE_CACHE_TTL_SECONDS);
      return result;
    } catch (correctionError) {
      // If Groq correction also fails, throw original error
      if (correctionError.status) throw correctionError;
      throw new ApiError(404, "No location found for this address");
    }
  }

  const result = {
    provider: "nominatim",
    query,
    latitude: Number(place.lat),
    longitude: Number(place.lon),
    displayName: place.display_name,
    importance: place.importance ?? null,
    address: place.address || null,
    attribution: "© OpenStreetMap contributors",
    corrected: false,
  };

  await setCache(cacheKey, result, GEOCODE_CACHE_TTL_SECONDS);
  return result;
};

module.exports = {
  geocodeAddress,
};
