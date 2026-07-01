/**
 * Geocoding service with rate limiting, caching, and Groq fallback
 */

// Cache configuration
const geocodeCache = new Map();
const GEOCODE_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const geocodeRequestQueue = [];

// Geocoding state
let isGeocoding = false;
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_BACKOFF = [1000, 3000, 5000]; // Exponential backoff in ms

// Get GROQ API key from environment
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const getCachedGeocode = (key) => {
  const cached = geocodeCache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > GEOCODE_CACHE_TTL) {
    geocodeCache.delete(key);
    return null;
  }

  return cached.data;
};

const setCachedGeocode = (key, data) => {
  geocodeCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

const getCacheKey = (address, city, state) => {
  return `${address}|${city}|${state}`.toLowerCase();
};

/**
 * Fallback geocoding using Groq API
 */
const geocodeWithGroq = async (address, city, state) => {
  if (!GROQ_API_KEY) {
    console.warn('GROQ_API_KEY not configured, cannot use fallback');
    throw new Error('Geocoding service temporarily unavailable');
  }

  try {
    const fullAddress = `${address}, ${city}, ${state}, India`;
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are a geocoding assistant. Extract latitude and longitude for the given address. Return only valid JSON with latitude and longitude as numbers. Example: {"latitude": 25.4358, "longitude": 81.8463}'
          },
          {
            role: 'user',
            content: `Find coordinates for: ${fullAddress}`
          }
        ],
        temperature: 0.1,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid Groq response format');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    if (!Number.isFinite(result.latitude) || !Number.isFinite(result.longitude)) {
      throw new Error('Invalid coordinates from Groq');
    }

    return {
      latitude: Number(result.latitude),
      longitude: Number(result.longitude),
    };
  } catch (err) {
    console.error('Groq fallback geocoding failed:', err);
    throw new Error('Could not find coordinates. Please verify the address and try again.');
  }
};

/**
 * Primary geocoding API call with retry logic
 */
const geocodePrimary = async (address, city, state, attempt = 0) => {
  try {
    const response = await fetch(
      `https://rovauto.onrender.com/api/v1/locations/geocode?address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`
    );

    // Handle rate limiting (429)
    if (response.status === 429) {
      if (attempt < MAX_RETRIES - 1) {
        const waitTime = RETRY_BACKOFF[attempt];
        console.warn(`Rate limited. Retrying after ${waitTime}ms...`);
        await new Promise(r => setTimeout(r, waitTime));
        return geocodePrimary(address, city, state, attempt + 1);
      }
      
      // All retries exhausted, fallback to Groq
      console.warn('Primary geocoding rate limited after retries, using Groq fallback');
      return geocodeWithGroq(address, city, state);
    }

    if (!response.ok) {
      // For other errors, also try Groq fallback
      console.warn(`Primary geocoding failed with status ${response.status}, trying Groq`);
      return geocodeWithGroq(address, city, state);
    }

    const geocodeResult = await response.json();
    const result = {
      latitude: Number(geocodeResult.data?.latitude || geocodeResult.latitude),
      longitude: Number(geocodeResult.data?.longitude || geocodeResult.longitude),
    };

    if (!Number.isFinite(result.latitude) || !Number.isFinite(result.longitude)) {
      throw new Error('Invalid coordinates received');
    }

    return result;
  } catch (err) {
    console.error('Primary geocoding error:', err);
    // Try Groq fallback for any error
    return geocodeWithGroq(address, city, state);
  }
};

/**
 * Process the geocode request queue with rate limiting
 */
const processGeocodeQueue = async () => {
  if (isGeocoding || geocodeRequestQueue.length === 0) return;

  isGeocoding = true;
  const { resolve, reject, address, city, state } = geocodeRequestQueue.shift();

  try {
    const cacheKey = getCacheKey(address, city, state);

    // Check cache first
    const cached = getCachedGeocode(cacheKey);
    if (cached) {
      console.log('Using cached geocode result');
      resolve(cached);
      isGeocoding = false;
      // Process next in queue after 1 second
      setTimeout(processGeocodeQueue, 1000);
      return;
    }

    // Make API request with retry and fallback
    const geocodeResult = await geocodePrimary(address, city, state);

    // Cache the result
    setCachedGeocode(cacheKey, geocodeResult);
    resolve(geocodeResult);
  } catch (err) {
    console.error('Geocoding queue processing failed:', err);
    reject(err);
  } finally {
    isGeocoding = false;
    retryCount = 0;
    // Process next in queue after 1 second (respect rate limit)
    setTimeout(processGeocodeQueue, 1000);
  }
};

/**
 * Queue a geocoding request
 */
export const queueGeocodeRequest = (address, city, state) => {
  return new Promise((resolve, reject) => {
    geocodeRequestQueue.push({ resolve, reject, address, city, state });
    processGeocodeQueue();
  });
};

/**
 * Clear the geocode cache
 */
export const clearGeocodeCache = () => {
  geocodeCache.clear();
};

/**
 * Get queue length for monitoring
 */
export const getGeocodeQueueLength = () => {
  return geocodeRequestQueue.length;
};
