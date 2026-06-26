import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "@/api/axios";

const AppCtx = createContext(null);

const readJson = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    return readJson("user", readJson("rov_user", null));
  });

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

  const login = (userData, authToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("rov_user", JSON.stringify(userData));

    if (authToken) {
      localStorage.setItem("token", authToken);
      setToken(authToken);
    }

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rov_user");

    setToken(null);
    setUser(null);
    setVehicle(null);
    setVehicles([]);
    setCart([]);
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

      setUser(me);
      localStorage.setItem("user", JSON.stringify(me));
      localStorage.setItem("rov_user", JSON.stringify(me));

      const backendVehicles = me.vehicles || [];
      setVehicles(backendVehicles);

      const defaultVehicle =
        backendVehicles.find((v) => v.isDefault) || backendVehicles[0] || null;

      setVehicle(defaultVehicle);

      localStorage.setItem("rov_vehicles", JSON.stringify(backendVehicles));
      localStorage.setItem("rov_vehicle", JSON.stringify(defaultVehicle));

      return me;
    } catch (error) {
      logout();
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

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

    return newVehicle;
  };

  const addToCart = (svc) => {
    setCart((current) => {
      const exists = current.find((item) => item.id === svc.id);
      return exists ? current : [...current, svc];
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

      setUser,
      setToken,
      setVehicle,
      setVehicles,
      setCart,
      setLocation,

      login,
      logout,
      fetchMe,
      addVehicle,
      addToCart,
      removeFromCart,
      clearCart,
    }),
    [user, token, vehicle, vehicles, cart, location, authLoading]
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