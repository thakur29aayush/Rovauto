import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "@/api/axios";

const AppCtx = createContext(null);

const DASHBOARD_CACHE_TTL = 5 * 60 * 1000;
const SERVICES_CACHE_TTL = 30 * 60 * 1000;
const VEHICLE_META_CACHE_TTL = 24 * 60 * 60 * 1000;
const VEHICLES_CACHE_TTL = 5 * 60 * 1000;
const ACTIVE_BOOKINGS_CACHE_TTL = 60 * 1000;
const SERVICE_HISTORY_CACHE_TTL = 5 * 60 * 1000;
const PROFILE_CACHE_TTL = 5 * 60 * 1000;

const readJson = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const readArray = (key) => {
  const value = readJson(key, []);
  return Array.isArray(value) ? value : [];
};

const readNumber = (key, fallback = null) => {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(() =>
    readJson("user", readJson("rov_user", null))
  );

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  const [vehicle, setVehicle] = useState(() => readJson("rov_vehicle", null));
  const [vehicles, setVehicles] = useState(() => readArray("rov_vehicles"));
  const [cart, setCart] = useState([]);

  const [location, setLocation] = useState({
    area: "Indirapuram",
    city: "Ghaziabad",
    pincode: "201014",
  });

  const [authLoading, setAuthLoading] = useState(true);

  const [dashboardCache, setDashboardCache] = useState(() =>
    readJson("rov_dashboard", null)
  );
  const [dashboardFetchedAt, setDashboardFetchedAt] = useState(() =>
    readNumber("rov_dashboard_time", null)
  );

  const [serviceCategoriesCache, setServiceCategoriesCache] = useState(() =>
    readJson("rov_service_categories", null)
  );
  const [serviceCategoriesFetchedAt, setServiceCategoriesFetchedAt] = useState(() =>
    readNumber("rov_service_categories_time", null)
  );

  const [vehicleMetaCache, setVehicleMetaCache] = useState(() =>
    readJson("rov_vehicle_meta", null)
  );
  const [vehicleMetaFetchedAt, setVehicleMetaFetchedAt] = useState(() =>
    readNumber("rov_vehicle_meta_time", null)
  );

  const [vehiclesCache, setVehiclesCache] = useState(() =>
    readJson("rov_vehicles_cache", null)
  );
  const [vehiclesFetchedAt, setVehiclesFetchedAt] = useState(() =>
    readNumber("rov_vehicles_cache_time", null)
  );

  const [activeBookingsCache, setActiveBookingsCache] = useState(() =>
    readJson("rov_active_bookings", null)
  );
  const [activeBookingsFetchedAt, setActiveBookingsFetchedAt] = useState(() =>
    readNumber("rov_active_bookings_time", null)
  );

  const [serviceHistoryCache, setServiceHistoryCache] = useState(() =>
    readJson("rov_service_history", null)
  );
  const [serviceHistoryFetchedAt, setServiceHistoryFetchedAt] = useState(() =>
    readNumber("rov_service_history_time", null)
  ); 
  const [profileCache, setProfileCache] = useState(() =>
    readJson("rov_profile", null)
  );

  const [profileFetchedAt, setProfileFetchedAt] = useState(() =>
    readNumber("rov_profile_time", null)
  );
  const clearDashboardCache = () => {
    setDashboardCache(null);
    setDashboardFetchedAt(null);
    localStorage.removeItem("rov_dashboard");
    localStorage.removeItem("rov_dashboard_time");
  };

  const saveDashboardCache = (data, fetchedAt) => {
    setDashboardCache(data);
    setDashboardFetchedAt(fetchedAt);
    localStorage.setItem("rov_dashboard", JSON.stringify(data));
    localStorage.setItem("rov_dashboard_time", String(fetchedAt));
  };

  const clearServiceCategoriesCache = () => {
    setServiceCategoriesCache(null);
    setServiceCategoriesFetchedAt(null);
    localStorage.removeItem("rov_service_categories");
    localStorage.removeItem("rov_service_categories_time");
  };

  const saveServiceCategoriesCache = (data, fetchedAt) => {
    setServiceCategoriesCache(data);
    setServiceCategoriesFetchedAt(fetchedAt);
    localStorage.setItem("rov_service_categories", JSON.stringify(data));
    localStorage.setItem("rov_service_categories_time", String(fetchedAt));
  };

  const clearVehicleMetaCache = () => {
    setVehicleMetaCache(null);
    setVehicleMetaFetchedAt(null);
    localStorage.removeItem("rov_vehicle_meta");
    localStorage.removeItem("rov_vehicle_meta_time");
  };

  const saveVehicleMetaCache = (data, fetchedAt) => {
    setVehicleMetaCache(data);
    setVehicleMetaFetchedAt(fetchedAt);
    localStorage.setItem("rov_vehicle_meta", JSON.stringify(data));
    localStorage.setItem("rov_vehicle_meta_time", String(fetchedAt));
  };

  const clearVehiclesCache = () => {
    setVehiclesCache(null);
    setVehiclesFetchedAt(null);
    localStorage.removeItem("rov_vehicles_cache");
    localStorage.removeItem("rov_vehicles_cache_time");
  };

  const saveVehiclesCache = (data, fetchedAt) => {
    setVehiclesCache(data);
    setVehiclesFetchedAt(fetchedAt);
    localStorage.setItem("rov_vehicles_cache", JSON.stringify(data));
    localStorage.setItem("rov_vehicles_cache_time", String(fetchedAt));
  };

  const clearActiveBookingsCache = () => {
    setActiveBookingsCache(null);
    setActiveBookingsFetchedAt(null);
    localStorage.removeItem("rov_active_bookings");
    localStorage.removeItem("rov_active_bookings_time");
  };

  const saveActiveBookingsCache = (data, fetchedAt) => {
    setActiveBookingsCache(data);
    setActiveBookingsFetchedAt(fetchedAt);
    localStorage.setItem("rov_active_bookings", JSON.stringify(data));
    localStorage.setItem("rov_active_bookings_time", String(fetchedAt));
  };

  const clearServiceHistoryCache = () => {
    setServiceHistoryCache(null);
    setServiceHistoryFetchedAt(null);
    localStorage.removeItem("rov_service_history");
    localStorage.removeItem("rov_service_history_time");
  };

  const saveServiceHistoryCache = (data, fetchedAt) => {
    setServiceHistoryCache(data);
    setServiceHistoryFetchedAt(fetchedAt);
    localStorage.setItem("rov_service_history", JSON.stringify(data));
    localStorage.setItem("rov_service_history_time", String(fetchedAt));
  };

  const clearProfileCache = () => {
  setProfileCache(null);
  setProfileFetchedAt(null);

  localStorage.removeItem("rov_profile");
  localStorage.removeItem("rov_profile_time");
};

const saveProfileCache = (data, fetchedAt) => {
  setProfileCache(data);
  setProfileFetchedAt(fetchedAt);

  localStorage.setItem("rov_profile", JSON.stringify(data));
  localStorage.setItem("rov_profile_time", String(fetchedAt));
};

  const clearBookingCaches = () => {
    clearDashboardCache();
    clearActiveBookingsCache();
    clearServiceHistoryCache();
  };

  const syncVehicles = (list = []) => {
    const safeList = Array.isArray(list) ? list : [];

    setVehicles(safeList);

    const defaultVehicle =
      safeList.find((item) => item.isDefault) || safeList[0] || null;

    setVehicle(defaultVehicle);

    localStorage.setItem("rov_vehicles", JSON.stringify(safeList));
    localStorage.setItem("rov_vehicle", JSON.stringify(defaultVehicle));

    return safeList;
  };

  const syncUserData = (me) => {
    if (!me) return null;

    setUser(me);

    localStorage.setItem("user", JSON.stringify(me));
    localStorage.setItem("rov_user", JSON.stringify(me));

    syncVehicles(me.vehicles || []);

    return me;
  };

  const login = (userData, authToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("rov_user", JSON.stringify(userData));

    if (authToken) {
      localStorage.setItem("token", authToken);
      setToken(authToken);
    }

    setUser(userData);

    clearDashboardCache();
    clearVehiclesCache();
    clearActiveBookingsCache();
    clearServiceHistoryCache();
    clearProfileCache();
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rov_user");
    localStorage.removeItem("rov_vehicle");
    localStorage.removeItem("rov_vehicles");

    setToken(null);
    setUser(null);
    setVehicle(null);
    setVehicles([]);
    setCart([]);

    clearDashboardCache();
    clearVehiclesCache();
    clearActiveBookingsCache();
    clearServiceHistoryCache();
    clearProfileCache();
  };

  const fetchMe = async () => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      setAuthLoading(false);
      return null;
    }

    try {
      const res = await api.get("/auth/me");
      const me = res.data.data;

      return syncUserData(me);
    } catch {
      logout();
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchDashboard = async ({ force = false } = {}) => {
    const now = Date.now();

    if (!force && dashboardCache && dashboardFetchedAt) {
      if (now - dashboardFetchedAt < DASHBOARD_CACHE_TTL) {
        return dashboardCache;
      }
    }

    const res = await api.get("/dashboard/customer");
    const data = res.data.data;
    const fetchedAt = Date.now();

    saveDashboardCache(data, fetchedAt);

    if (data.user) {
      syncUserData({
        ...data.user,
        vehicles: data.vehicles || data.user.vehicles || [],
      });
    }

    if (data.vehicles) {
      syncVehicles(data.vehicles);
      saveVehiclesCache(data.vehicles, fetchedAt);
    }

    return data;
  };

  const fetchVehicles = async ({ force = false } = {}) => {
    const now = Date.now();

    if (!force && vehiclesCache && vehiclesFetchedAt) {
      if (now - vehiclesFetchedAt < VEHICLES_CACHE_TTL) {
        syncVehicles(vehiclesCache);
        return vehiclesCache;
      }
    }

    const res = await api.get("/vehicles");
    const data = res.data.data || [];
    const fetchedAt = Date.now();

    saveVehiclesCache(data, fetchedAt);
    syncVehicles(data);

    return data;
  };

  const fetchActiveBookings = async ({ force = false } = {}) => {
    const now = Date.now();

    if (!force && activeBookingsCache && activeBookingsFetchedAt) {
      if (now - activeBookingsFetchedAt < ACTIVE_BOOKINGS_CACHE_TTL) {
        return activeBookingsCache;
      }
    }

    const res = await api.get("/bookings", {
      params: {
        status:
          "PENDING_PAYMENT,SEARCHING_GARAGE,GARAGE_ASSIGNED,CONFIRMED,IN_PROGRESS",
      },
    });

    const data = res.data.data || [];
    const fetchedAt = Date.now();

    saveActiveBookingsCache(data, fetchedAt);

    return data;
  };

  const fetchServiceHistory = async ({ force = false } = {}) => {
    const now = Date.now();

    if (!force && serviceHistoryCache && serviceHistoryFetchedAt) {
      if (now - serviceHistoryFetchedAt < SERVICE_HISTORY_CACHE_TTL) {
        return serviceHistoryCache;
      }
    }

    const res = await api.get("/bookings", {
      params: {
        status: "COMPLETED",
      },
    });

    const data = res.data.data || [];
    const fetchedAt = Date.now();

    saveServiceHistoryCache(data, fetchedAt);

    return data;
  };

  const fetchProfile = async ({ force = false } = {}) => {
  const now = Date.now();

  if (!force && profileCache && profileFetchedAt) {
    if (now - profileFetchedAt < PROFILE_CACHE_TTL) {
      return profileCache;
    }
  }

  const res = await api.get("/customer/profile");
  const data = res.data.data;
  const fetchedAt = Date.now();

  saveProfileCache(data, fetchedAt);
  setUser(data);

  localStorage.setItem("user", JSON.stringify(data));
  localStorage.setItem("rov_user", JSON.stringify(data));

  return data;
};
  const fetchServiceCategories = async ({ force = false } = {}) => {
    const now = Date.now();

    if (!force && serviceCategoriesCache && serviceCategoriesFetchedAt) {
      if (now - serviceCategoriesFetchedAt < SERVICES_CACHE_TTL) {
        return serviceCategoriesCache;
      }
    }

    const res = await api.get("/services/categories");
    const data = res.data.data || [];
    const fetchedAt = Date.now();

    saveServiceCategoriesCache(data, fetchedAt);

    return data;
  };

  const fetchVehicleMeta = async ({ force = false } = {}) => {
    const now = Date.now();

    if (!force && vehicleMetaCache && vehicleMetaFetchedAt) {
      if (now - vehicleMetaFetchedAt < VEHICLE_META_CACHE_TTL) {
        return vehicleMetaCache;
      }
    }

    const res = await api.get("/vehicle-meta/brands");
    const data = res.data.data || [];
    const fetchedAt = Date.now();

    saveVehicleMetaCache(data, fetchedAt);

    return data;
  };

  useEffect(() => {
    setAuthLoading(false);
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("rov_user", JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("rov_vehicle", JSON.stringify(vehicle));
  }, [vehicle]);

  useEffect(() => {
    localStorage.setItem("rov_vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

  const addVehicle = (v) => {
    const currentVehicles = Array.isArray(vehicles) ? vehicles : [];
    const newVehicle = {
      ...v,
      id: v.id || `local-${Date.now()}`,
      isDefault: currentVehicles.length === 0,
    };

    const updatedVehicles = [...currentVehicles, newVehicle];

    syncVehicles(updatedVehicles);

    clearDashboardCache();
    clearVehiclesCache();

    return newVehicle;
  };

  const updateVehiclesLocally = (list = []) => {
    syncVehicles(list);
    saveVehiclesCache(list, Date.now());
    clearDashboardCache();
  };

  const addToCart = (service) => {
    setCart((current) => {
      const exists = current.find((item) => item.id === service.id);
      return exists ? current : [...current, service];
    });
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      vehicle,
      vehicles,
      cart,
      location,
      authLoading,

      dashboardCache,
      dashboardFetchedAt,
      serviceCategoriesCache,
      serviceCategoriesFetchedAt,
      vehicleMetaCache,
      vehicleMetaFetchedAt,
      vehiclesCache,
      vehiclesFetchedAt,
      activeBookingsCache,
      activeBookingsFetchedAt,
      serviceHistoryCache,
      serviceHistoryFetchedAt,
      profileCache,
      profileFetchedAt,

      setUser,
      setToken,
      setVehicle,
      setVehicles,
      setCart,
      setLocation,

      setDashboardCache,
      setDashboardFetchedAt,
      setServiceCategoriesCache,
      setServiceCategoriesFetchedAt,
      setVehicleMetaCache,
      setVehicleMetaFetchedAt,
      setVehiclesCache,
      setVehiclesFetchedAt,
      setActiveBookingsCache,
      setActiveBookingsFetchedAt,
      setServiceHistoryCache,
      setServiceHistoryFetchedAt,
      setProfileCache,
      setProfileFetchedAt,

      login,
      logout,
      fetchMe,
      fetchDashboard,
      fetchVehicles,
      fetchActiveBookings,
      fetchServiceHistory,
      fetchProfile,
      fetchServiceCategories,
      fetchVehicleMeta,

      clearDashboardCache,
      clearServiceCategoriesCache,
      clearVehicleMetaCache,
      clearVehiclesCache,
      clearActiveBookingsCache,
      clearServiceHistoryCache,
      clearProfileCache,
      clearBookingCaches,

      addVehicle,
      updateVehiclesLocally,
      addToCart,
      removeFromCart,
      clearCart,
    }),
    [
      user,
      token,
      vehicle,
      vehicles,
      cart,
      location,
      authLoading,
      dashboardCache,
      dashboardFetchedAt,
      serviceCategoriesCache,
      serviceCategoriesFetchedAt,
      vehicleMetaCache,
      vehicleMetaFetchedAt,
      vehiclesCache,
      vehiclesFetchedAt,
      activeBookingsCache,
      activeBookingsFetchedAt,
      serviceHistoryCache,
      serviceHistoryFetchedAt,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const useApp = () => {
  const value = useContext(AppCtx);

  if (!value) {
    throw new Error("useApp must be used within AppProvider");
  }

  return value;
};
