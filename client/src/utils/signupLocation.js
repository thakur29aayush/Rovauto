import api from "@/api/axios";

const PENDING_LOCATION_KEY = "pendingSignupLocation";
const PENDING_LOCATION_WANTED_KEY = "pendingSignupLocationWanted";

const LOCATION_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 3500,
  maximumAge: 5 * 60 * 1000,
};

const getCurrentPosition = () => {
  if (!navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => resolve(null),
      LOCATION_OPTIONS
    );
  });
};

const reverseGeocode = async ({ latitude, longitude }) => {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) return "";

    const data = await response.json();
    return data.display_name || "";
  } catch {
    return "";
  }
};

export const requestSignupLocation = async () => {
  const position = await getCurrentPosition();

  if (!position?.coords) {
    return null;
  }

  const latitude = Number(position.coords.latitude.toFixed(6));
  const longitude = Number(position.coords.longitude.toFixed(6));
  const address =
    (await reverseGeocode({ latitude, longitude })) ||
    `Lat ${latitude}, Lng ${longitude}`;

  return {
    latitude,
    longitude,
    address,
  };
};

export const markSignupLocationPending = () => {
  localStorage.setItem(PENDING_LOCATION_WANTED_KEY, "1");
};

export const rememberSignupLocation = (signupLocation) => {
  if (!signupLocation?.address) return;

  const value = JSON.stringify(signupLocation);
  localStorage.setItem(PENDING_LOCATION_KEY, value);
  sessionStorage.setItem(PENDING_LOCATION_KEY, value);
};

export const readPendingSignupLocation = () => {
  try {
    const value =
      localStorage.getItem(PENDING_LOCATION_KEY) ||
      sessionStorage.getItem(PENDING_LOCATION_KEY);

    return value ? JSON.parse(value) : null;
  } catch {
    localStorage.removeItem(PENDING_LOCATION_KEY);
    sessionStorage.removeItem(PENDING_LOCATION_KEY);
    return null;
  }
};

export const clearPendingSignupLocation = () => {
  localStorage.removeItem(PENDING_LOCATION_KEY);
  localStorage.removeItem(PENDING_LOCATION_WANTED_KEY);
  sessionStorage.removeItem(PENDING_LOCATION_KEY);
};

export const collectSignupLocationLater = () => {
  markSignupLocationPending();

  return requestSignupLocation().then((signupLocation) => {
    rememberSignupLocation(signupLocation);
    return signupLocation;
  });
};

export const saveSignupLocationToProfile = async (signupLocation) => {
  if (!signupLocation?.address) return false;

  try {
    await api.patch("/customer/profile", {
      address: signupLocation.address,
    });

    localStorage.removeItem("rov_profile");
    localStorage.removeItem("rov_profile_time");
  } catch {
    return false;
  }

  return true;
};

export const flushPendingSignupLocation = async () => {
  const token = localStorage.getItem("token");
  const hasPendingRequest = localStorage.getItem(PENDING_LOCATION_WANTED_KEY);

  if (!token || !hasPendingRequest) {
    return false;
  }

  const signupLocation =
    readPendingSignupLocation() || (await requestSignupLocation());

  if (!signupLocation?.address) {
    clearPendingSignupLocation();
    return false;
  }

  const saved = await saveSignupLocationToProfile(signupLocation);

  if (saved) {
    clearPendingSignupLocation();
  }

  return saved;
};
