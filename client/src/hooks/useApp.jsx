import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "@/api/axios";

const AppCtx = createContext(null);

const DASHBOARD_CACHE_TTL = 5 * 60 * 1000;

const readJson = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(() =>
    readJson("user", readJson("rov_user", null))
  );

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const [vehicle, setVehicle] = useState(() => {
    return readJson("rov_vehicle", null);
  });

  const [vehicles, setVehicles] = useState(() => {
    return readJson("rov_vehicles", []);
  });

  const [cart, setCart] = useState([]);

  const [location, setLocation] = useState({
    area: "Indirapuram",
    city: "Ghaziabad",
    pincode: "201014",
  });

  const [authLoading, setAuthLoading] = useState(true);

  const [dashboardCache, setDashboardCache] = useState(() => {
    return readJson("rov_dashboard", null);
  });

  const [dashboardFetchedAt, setDashboardFetchedAt] = useState(() => {
    return Number(localStorage.getItem("rov_dashboard_time")) || null;
  });

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

  const syncUserData = (me) => {
    if (!me) return null;

    setUser(me);

    localStorage.setItem("user", JSON.stringify(me));
    localStorage.setItem("rov_user", JSON.stringify(me));

    const backendVehicles = me.vehicles || [];

    setVehicles(backendVehicles);

    const defaultVehicle =
      backendVehicles.find((item) => item.isDefault) ||
      backendVehicles[0] ||
      null;

    setVehicle(defaultVehicle);

    localStorage.setItem("rov_vehicles", JSON.stringify(backendVehicles));
    localStorage.setItem("rov_vehicle", JSON.stringify(defaultVehicle));

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
      setVehicles(data.vehicles);
      localStorage.setItem("rov_vehicles", JSON.stringify(data.vehicles));
    }

    if (data.vehicle !== undefined) {
      setVehicle(data.vehicle);
      localStorage.setItem("rov_vehicle", JSON.stringify(data.vehicle));
    }

    return data;
  };

  useEffect(() => {
    if (token) {
      setAuthLoading(false);
    } else {
      setAuthLoading(false);
    }
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
    const newVehicle = {
      ...v,
      id: v.id || `local-${Date.now()}`,
      isDefault: vehicles.length === 0,
    };

    const updatedVehicles = [...vehicles, newVehicle];

    setVehicles(updatedVehicles);
    setVehicle(newVehicle);

    clearDashboardCache();

    return newVehicle;
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

      setUser,
      setToken,
      setVehicle,
      setVehicles,
      setCart,
      setLocation,

      setDashboardCache,
      setDashboardFetchedAt,

      login,
      logout,
      fetchMe,
      fetchDashboard,

      clearDashboardCache,

      addVehicle,
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