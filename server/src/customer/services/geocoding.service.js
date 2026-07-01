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
    console.error("Nominatim geocoding error:", error.message);
    throw new ApiError(error.response?.status || 502, "Unable to geocode address right now");
  }

  const place = response.data?.[0];
  
  // If no location found and Groq is configured, try to correct the address
  if (!place && process.env.GROQ_API_KEY) {
    try {
      console.log("Nominatim failed, attempting Groq address correction...");
      const correctedAddressText = await correctAddress(params.address, params.city, params.state);
      
      // Retry geocoding with corrected address
      const correctedQuery = buildQuery({
        address: correctedAddressText,
        city: params.city,
        state: params.state,
        country: "India",
      });

      let retryResponse;
      try {
        retryResponse = await axios.get(NOMINATIM_URL, {
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
      } catch (retryError) {
        console.error("Nominatim retry with corrected address failed:", retryError.message);
        throw new ApiError(404, "No location found even after address correction");
      }

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
      // If Groq correction fails, log it but don't crash
      console.error("Groq address correction failed:", correctionError.message);
      
      // Re-throw if it's an API error
      if (correctionError.status) throw correctionError;
      
      // Otherwise, throw original "not found" error
      throw new ApiError(404, "No location found for this address");
    }
  }

  // If no place found and Groq not configured, fail gracefully
  if (!place) {
    console.warn("Address not found and Groq not configured");
    throw new ApiError(404, "No location found for this address");
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
